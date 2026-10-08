#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""准备模型.py —— 提前把 NEC 各游戏的 ONNX 模型放进客户端缓存目录

背景（为什么要提前放）
    NEC 客户端把每个游戏的 ONNX 模型缓存在
    %USERPROFILE%\\Documents\\<编号>.txt，文件内容就是 ONNX 本体。
    首次点「开始推理」时，如果这个缓存文件不存在，客户端要现场下载模型，
    实测会在「下载完成 → 加载模型」的交界处闪退一次。
    只要提前把缓存文件放好，首次推理就不会再闪退。

本脚本做什么
    1. 先 GET 清单地址，拿到模型基址 URL；再逐个 GET <基址><模型文件名>，
       把模型写到本脚本同目录下的「模型缓存」子目录，文件名用客户端认的缓存名；
    2. 每个模型都按 SHA-256 + 字节数双重校验，校验通过才写盘；
       写盘用「临时文件 + os.replace 原子替换」，客户端不会读到半个文件；
    3. 已存在且校验正确的模型自动跳过（加 --force 可强制重下）。
    4. 下载完成后运行本目录下的「安装模型.bat」，
       会把「模型缓存」里的 7 个 .txt 复制到 %USERPROFILE%\\Documents\\。

安全约束
    - 只接受 http/https；发请求前校验主机，拒绝 localhost/.localhost/回环/私有/
      链路本地/保留/组播/未指定地址（域名先做 DNS 解析，任一结果落在上述范围就拒绝）；
    - 写入目标只允许本目录下「模型缓存」子目录里的 7 个字面量文件名，
      写前做纯文件名检查（不含路径分隔符、不以点开头）并校验规范化后的落点。

用法
    py -3 准备模型.py                全部游戏
    py -3 准备模型.py PUBG COD       只处理指定游戏（游戏名/CDN 名/缓存名都认）
    py -3 准备模型.py --list         只列出各模型在本包缓存里的状态（不联网）
    py -3 准备模型.py --force        已存在也强制重新下载
    退出码：0 = 全部就绪成功，非 0 = 有缺失或失败项
"""

import hashlib
import ipaddress
import os
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------- 常量区

# 清单地址：GET 回来的内容就是模型基址（实际是 OSS 前缀），会自动补结尾的 "/"
MANIFEST_URL = "https://beidouai.oss-accelerate.aliyuncs.com/Neconnx.txt"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# 输出只允许落在本脚本同目录下的这个子目录里
OUT_DIR = SCRIPT_DIR + os.sep + "模型缓存"
# 落盘临时文件：同目录、字面量文件名，写完立刻被 os.replace 换走
TMP_FILE = OUT_DIR + os.sep + "download.tmp"

UA = "NecModelPrep/1.0"
TIMEOUT_SECONDS = 60

# (游戏名, CDN 模型文件名, 客户端缓存文件名, SHA-256, 字节数)
GAMES = (
    ("PUBG", "PUBG.onnx", "1.txt",
     "b027e8ddec4841ad11202c544f07a134516924c3a620b0144eb593c979bd1388", 28201850),
    ("COD", "COD.onnx", "2.txt",
     "f59b3678d776fd4268e7dbc8820241d620ba4b20c7ba64729200b97d5947e203", 7255696),
    ("OW", "OW.onnx", "3.txt",
     "54eaface7155e20181de3f387843bdbac2e35e5daff508b0277dc01290f08bf8", 44607427),
    ("R6", "R6.onnx", "13.txt",
     "b339034f85a4fcf3df0e0ee8e75b5bb5e3b42e7dcda89ead1619b5adf26e94bf", 12239046),
    ("Thefinals", "Thefinals.onnx", "6.txt",
     "473fb94d3c90645544cc8fa0cc6e6b96c94ffcc6ed491ae5d93fa87dad97629e", 28289408),
    ("Rust", "Rust.onnx", "21.txt",
     "6a3c889256d3fc4c1cc5dd90258f243c536bd65679532ad57ed235d2fba44849", 28652209),
    ("CSGO", "CSGO.onnx", "5.txt",
     "9b83ff3f3c76045e76df06b573df31416ec7c50c93d6c508255ca2367622ae9d", 7187854),
)

# 写入目标：7 个字面量文件名，路径在模块加载时静态拼好，运行期不做任何动态拼接
CACHE_TARGETS = {
    "1.txt": OUT_DIR + os.sep + "1.txt",
    "2.txt": OUT_DIR + os.sep + "2.txt",
    "3.txt": OUT_DIR + os.sep + "3.txt",
    "13.txt": OUT_DIR + os.sep + "13.txt",
    "6.txt": OUT_DIR + os.sep + "6.txt",
    "21.txt": OUT_DIR + os.sep + "21.txt",
    "5.txt": OUT_DIR + os.sep + "5.txt",
}
ALLOWED_CACHE_NAMES = frozenset(CACHE_TARGETS)

# 明确点名拒绝的主机名（不含这些名字的其它域名走 DNS 解析后的网段判断）
DENIED_HOST_NAMES = frozenset((
    "localhost",
    "localhost.localdomain",
    "ip6-localhost",
    "ip6-loopback",
    "0.0.0.0",
))


# ---------------------------------------------------------------- 输出目录与路径校验

def cache_target(cache_name):
    """把客户端缓存文件名映射成「模型缓存」目录里的绝对路径。

    三重校验，任一条不满足就抛 ValueError，绝不返回目录外的路径：
      1. 白名单：cache_name 必须正是那 7 个字面量缓存名之一；
      2. 纯文件名：不得含路径分隔符/盘符冒号，不得以点开头；
      3. 规范化 + 真实化之后，落点必须仍然在 OUT_DIR 里面。
    """
    if cache_name not in ALLOWED_CACHE_NAMES:
        raise ValueError("不在白名单里的缓存文件名: %r" % (cache_name,))
    if os.path.basename(cache_name) != cache_name:
        raise ValueError("缓存文件名不允许包含目录成分: %r" % (cache_name,))
    if cache_name[0] == "." or os.sep in cache_name or "/" in cache_name or ":" in cache_name:
        raise ValueError("缓存文件名不合法（不得以点开头、不得含分隔符）: %r" % (cache_name,))
    target = CACHE_TARGETS[cache_name]
    if os.path.dirname(os.path.normpath(target)) != os.path.normpath(OUT_DIR):
        raise ValueError("规范化后不在模型缓存目录内: %r" % (target,))
    real_dir = os.path.realpath(OUT_DIR)
    real_target = os.path.realpath(target)
    if real_target == real_dir or os.path.commonpath([real_dir, real_target]) != real_dir:
        raise ValueError("真实路径逃出了模型缓存目录: %r" % (real_target,))
    return target


# ---------------------------------------------------------------- 联网前的地址校验

def address_is_denied(ip_text):
    """判断一个解析出来的 IP 是否属于必须拒绝的范围。"""
    text = ip_text.split("%", 1)[0]  # 去掉 IPv6 的 zone id
    try:
        ip = ipaddress.ip_address(text)
    except ValueError:
        return True
    checks = (
        ip.is_loopback,
        ip.is_private,
        ip.is_link_local,
        ip.is_multicast,
        ip.is_reserved,
        ip.is_unspecified,
    )
    if any(checks):
        return True
    # 某些版本里 IPv6 站点本地地址不算 private，这里单独兜一下
    if getattr(ip, "is_site_local", False):
        return True
    return False


def assert_url_allowed(url):
    """请求前校验：只放行 http/https，且目标主机不能落到本机/内网/保留地址。"""
    parts = urllib.parse.urlsplit(url)
    scheme = (parts.scheme or "").lower()
    if scheme not in ("http", "https"):
        raise ValueError("只允许 http/https，收到: %r" % (url,))
    host = (parts.hostname or "").strip().strip("[]").rstrip(".").lower()
    if not host:
        raise ValueError("URL 里没有主机名: %r" % (url,))
    if host in DENIED_HOST_NAMES or host.endswith(".localhost"):
        raise ValueError("拒绝本机主机名: %r" % (host,))
    port = parts.port or (443 if scheme == "https" else 80)
    try:
        infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise ValueError("主机名解析失败: %r (%s)" % (host, exc))
    if not infos:
        raise ValueError("主机名没有任何解析结果: %r" % (host,))
    for info in infos:
        addr = info[4][0]
        if address_is_denied(addr):
            raise ValueError("主机 %r 解析到受限地址 %s，已拒绝" % (host, addr))
    return host


class _GuardedRedirectHandler(urllib.request.HTTPRedirectHandler):
    """重定向每一跳都重新校验主机，防止用 302 绕到内网地址。"""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        assert_url_allowed(newurl)
        return urllib.request.HTTPRedirectHandler.redirect_request(
            self, req, fp, code, msg, headers, newurl)


def http_get(url):
    """校验主机后 GET 一个 http/https URL，返回 bytes。"""
    host = assert_url_allowed(url)
    print("  GET %s  (主机 %s)" % (url, host))
    opener = urllib.request.build_opener(_GuardedRedirectHandler())
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with opener.open(request, timeout=TIMEOUT_SECONDS) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        raise RuntimeError("HTTP %s %s" % (exc.code, url))
    except urllib.error.URLError as exc:
        raise RuntimeError("网络错误 %s: %s" % (url, exc.reason))


def fetch_base_url():
    """GET 清单，取回模型基址（自动补结尾的 "/"）。"""
    text = http_get(MANIFEST_URL).decode("utf-8", "replace")
    lines = [ln.strip().lstrip("\ufeff") for ln in text.splitlines()]
    base = ""
    for line in lines:
        if line.startswith("http://") or line.startswith("https://"):
            base = line
            break
    if not base:
        raise RuntimeError("清单里没有找到 http(s) 基址: %r" % (MANIFEST_URL,))
    if not base.endswith("/"):
        base += "/"
    assert_url_allowed(base)
    print("模型基址: %s" % base)
    return base


# ---------------------------------------------------------------- 本地文件读写

def local_state(game):
    """返回 (状态文本, 实际字节数 或 -1, 是否校验通过)。只读本地，不联网。"""
    cache_name = game[2]
    expect_sha256 = game[3]
    expect_size = game[4]
    target = cache_target(cache_name)
    path = Path(target)
    if not path.is_file():
        return ("缺失", -1, False)
    size = path.stat().st_size
    if size != expect_size:
        return ("大小不符(应为 %s)" % format(expect_size, ","), size, False)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != expect_sha256:
        return ("SHA-256 不符", size, False)
    return ("校验通过", size, True)


def save_atomic(cache_name, payload):
    """校验通过后落盘：先写同目录临时文件，再 os.replace 原子替换。"""
    target = cache_target(cache_name)
    os.makedirs(OUT_DIR, exist_ok=True)
    Path(TMP_FILE).write_bytes(payload)
    os.replace(TMP_FILE, target)
    return target


# ---------------------------------------------------------------- 单个游戏处理

def handle_game(game, base_url, force):
    """下载 + 校验 + 落盘。返回 True 表示这个游戏已经就绪。"""
    label, model_name, cache_name, expect_sha256, expect_size = game
    print("[%s] 缓存文件 %s" % (label, cache_name))
    if not force:
        status, _size, ok = local_state(game)
        if ok:
            print("  已存在且校验通过，跳过（--force 可强制重下）")
            return True
        if status != "缺失":
            print("  本地文件有问题：%s，重新下载" % status)
    if not base_url:
        print("  失败：没有拿到模型基址")
        return False
    url = base_url + model_name
    payload = http_get(url)
    size = len(payload)
    digest = hashlib.sha256(payload).hexdigest()
    if size != expect_size:
        print("  失败：字节数不符，应为 %s，实际 %s" % (format(expect_size, ","), format(size, ",")))
        return False
    if digest != expect_sha256:
        print("  失败：SHA-256 不符")
        print("    应为 %s" % expect_sha256)
        print("    实际 %s" % digest)
        return False
    target = save_atomic(cache_name, payload)
    print("  已写入 %s（%s 字节，校验通过）" % (target, format(size, ",")))
    return True


# ---------------------------------------------------------------- CLI

def select_games(tokens):
    """把命令行里的游戏名/CDN 名/缓存名都映射到游戏表条目。"""
    index = {}
    for game in GAMES:
        index[game[0].lower()] = game
        index[game[1].lower()] = game
        index[game[2].lower()] = game
    if not tokens:
        return list(GAMES)
    picked = []
    for token in tokens:
        game = index.get(token.lower())
        if game is None:
            raise SystemExit("未知游戏名: %r；可用: %s"
                             % (token, ", ".join(g[0] for g in GAMES)))
        if game not in picked:
            picked.append(game)
    return picked


def parse_args(argv):
    force = False
    list_only = False
    tokens = []
    for token in argv:
        if token == "--force":
            force = True
        elif token == "--list":
            list_only = True
        elif token in ("-h", "--help", "/?"):
            print(__doc__)
            raise SystemExit(0)
        elif token.startswith("-"):
            raise SystemExit("未知参数: %r（--help 看用法）" % (token,))
        else:
            tokens.append(token)
    return force, list_only, select_games(tokens)


def print_status(games):
    """只读本地缓存状态：文件名 / 大小 / 是否校验通过。不联网。"""
    print("模型缓存目录: %s" % OUT_DIR)
    print("模型基址清单: %s（--list 不联网）" % MANIFEST_URL)
    print("")
    ready = 0
    for pos, game in enumerate(games, 1):
        label, _model_name, cache_name, _sha, _size = game
        status, size, ok = local_state(game)
        size_text = format(size, ",") if size >= 0 else "-"
        if ok:
            ready += 1
        print("[%d/%d] %s  缓存 %s  大小 %s  校验 %s"
              % (pos, len(games), label.ljust(10), cache_name.ljust(7), size_text.ljust(12), status))
    print("")
    print("汇总: %d/%d 个模型已就绪" % (ready, len(games)))
    if ready == len(games):
        print("全部就绪：现在可以运行 安装模型.bat 把缓存复制到 Documents")
    else:
        print("还有 %d 个没准备好：运行 py -3 准备模型.py 补齐后再跑 安装模型.bat"
              % (len(games) - ready))
    return 0 if ready == len(games) else 1


def main(argv):
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    force, list_only, games = parse_args(argv)
    if list_only:
        return print_status(games)
    print("准备下载 %d 个模型到: %s" % (len(games), OUT_DIR))
    print("")
    base_url = fetch_base_url()
    print("")
    ok_count = 0
    bad = []
    for game in games:
        try:
            if handle_game(game, base_url, force):
                ok_count += 1
            else:
                bad.append(game[0])
        except (ValueError, RuntimeError, OSError) as exc:
            print("  失败: %s" % (exc,))
            bad.append(game[0])
        print("")
    print("汇总: 成功 %d / %d" % (ok_count, len(games)))
    if bad:
        print("失败项: %s" % ", ".join(bad))
        return 1
    print("全部就绪：现在运行 安装模型.bat 把缓存复制到 %%USERPROFILE%%\\Documents\\")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
