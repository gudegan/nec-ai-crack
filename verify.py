# -*- coding: utf-8 -*-
"""verify.py -- Nec 破解成品验证脚本（退出码 0 = 通过，非 0 = 未通过）

判据全部取“程序自己的状态”，不采信补丁/启动器写的任何标记：
  C1 程序自弹成功框：KwService.exe 弹出 #32770 标题 '信息：'，其 Static 文本以
     '登陆成功! \\r\\n账号过期时间:' 开头（失败路径则弹 #32770 '错误' / '卡密无效或账号密码错误!'）
  C2 界面接管：卡密登录窗 WTWindow 'Nec - Login' 变不可见 + 主界面 Chrome_WidgetWin_1 '酷狗音乐'
     可见且属于同一 KwService.exe pid
  C3 程序自己写盘：<安装目录>\\卡密.txt 末行 == 本次填入的卡密（由程序自己 CreateFileW/WriteFile 写出）
  C4 反例对照：<安装目录>\\hblogs.txt 未新增失败记录行（失败时会追加 '错误码:-21'）

--quick: 清残留 -> launch.py --no-dismiss 启动并破解 -> C1/C2/C3 -> 清残留 -> 退出码
--full : 同上但更严格：先确认“零残留”启动，记录判据原始值/PID/时间/关键输出到
         evidence/verify_full.json，并截图 evidence/verify_full.png；退出码同 quick

用法:
  py -3 verify.py --quick [--card 32字符]
  py -3 verify.py --full
"""
import argparse
import ctypes
import ctypes.wintypes as wt
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import patch as P  # noqa: E402

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    Image = None

# 路径只由字面量拼出；落盘前一律经 out_file() 做「纯文件名 + 目录包含」校验
CRACK_DIR = os.path.abspath(os.path.dirname(os.path.abspath(__file__)))
NEC_DIR = os.path.abspath(P.NEC_DIR)
EVID_DIR = os.path.join(CRACK_DIR, "evidence")
LAUNCH_PY = os.path.join(CRACK_DIR, "launch.py")
KAMI_TXT = os.path.join(NEC_DIR, "卡密.txt")
HBLOGS_TXT = os.path.join(NEC_DIR, "hblogs.txt")
AUDIOBUF_DLL = os.path.join(NEC_DIR, "AudioBuffer.dll")


def out_file(name):
    """evidence 目录内的受限输出路径：只接受纯文件名，规范化后必须落在目录内。"""
    if not name or os.path.basename(name) != name or name[0] == ".":
        raise ValueError("plain file name only: %r" % name)
    base = os.path.realpath(EVID_DIR)
    real = os.path.realpath(os.path.join(base, name))
    if os.path.normcase(os.path.commonpath([real, base])) != os.path.normcase(base):
        raise ValueError("outside evidence dir: %r" % real)
    return real


VERIFY_CARD = "NECCRACKTEST" + "0" * 20          # 32 字符，专用于验证，便于比对 卡密.txt
SUCCESS_PREFIX = "登陆成功!"
FAIL_PREFIX = "卡密无效"
LOGIN_CLASS, LOGIN_TITLE = "WTWindow", "Nec - Login"
MAIN_CLASS, MAIN_TITLE = "Chrome_WidgetWin_1", "酷狗音乐"

gdi32 = ctypes.WinDLL("gdi32", use_last_error=True)
user32 = P.user32


def log(msg):
    print("[verify] %s" % msg, flush=True)


# ------------------------------------------------------------------ 截图

class BITMAPINFOHEADER(ctypes.Structure):
    _fields_ = [("biSize", wt.DWORD), ("biWidth", ctypes.c_long), ("biHeight", ctypes.c_long),
                ("biPlanes", wt.WORD), ("biBitCount", wt.WORD), ("biCompression", wt.DWORD),
                ("biSizeImage", wt.DWORD), ("biXPelsPerMeter", ctypes.c_long),
                ("biYPelsPerMeter", ctypes.c_long), ("biClrUsed", wt.DWORD),
                ("biClrImportant", wt.DWORD)]


class BITMAPINFO(ctypes.Structure):
    _fields_ = [("bmiHeader", BITMAPINFOHEADER), ("bmiColors", wt.DWORD * 3)]


gdi32.CreateCompatibleDC.restype = wt.HDC
gdi32.CreateCompatibleBitmap.restype = wt.HBITMAP
gdi32.SelectObject.restype = wt.HGDIOBJ


def _grab(hwnd, w, h, use_printwindow):
    r = wt.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(r))
    hdc = user32.GetWindowDC(hwnd) if use_printwindow else user32.GetDC(0)
    memdc = gdi32.CreateCompatibleDC(hdc)
    bmp = gdi32.CreateCompatibleBitmap(hdc, w, h)
    gdi32.SelectObject(memdc, bmp)
    if use_printwindow:
        user32.PrintWindow(hwnd, memdc, 0x00000002)
    else:
        gdi32.BitBlt(memdc, 0, 0, w, h, hdc, r.left, r.top, 0x00CC0020)
    bi = BITMAPINFO()
    bi.bmiHeader.biSize = ctypes.sizeof(BITMAPINFOHEADER)
    bi.bmiHeader.biWidth = w
    bi.bmiHeader.biHeight = -h
    bi.bmiHeader.biPlanes = 1
    bi.bmiHeader.biBitCount = 32
    buf = ctypes.create_string_buffer(w * h * 4)
    gdi32.GetDIBits(memdc, bmp, 0, h, buf, ctypes.byref(bi), 0)
    img = Image.frombuffer("RGBA", (w, h), buf, "raw", "BGRA", 0, 1).convert("RGB")
    ex = img.getextrema()
    gdi32.DeleteObject(bmp)
    gdi32.DeleteDC(memdc)
    if use_printwindow:
        user32.ReleaseDC(hwnd, hdc)
    else:
        user32.ReleaseDC(0, hdc)
    return img, ex


def screenshot_window(hwnd, out_name):
    """优先 PrintWindow(PW_RENDERFULLCONTENT)，空图则回落到屏幕 BitBlt 裁剪。"""
    meta = {"hwnd": hex(hwnd), "file": out_name}
    if Image is None:
        meta.update(ok=False, err="Pillow 未安装")
        return meta
    r = wt.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(r))
    w, h = r.right - r.left, r.bottom - r.top
    if w <= 0 or h <= 0:
        meta.update(ok=False, err="窗口矩形为空 %dx%d" % (w, h))
        return meta
    img, ex = _grab(hwnd, w, h, True)
    method = "PrintWindow(PW_RENDERFULLCONTENT)"
    blank = all(lo == hi for lo, hi in ex)
    if blank:
        img, ex = _grab(hwnd, w, h, False)
        method = "BitBlt(screen crop)"
        blank = all(lo == hi for lo, hi in ex)
    png_buf = io.BytesIO()
    img.save(png_buf, format="PNG")
    target = out_file(out_name)
    Path(target).write_bytes(png_buf.getvalue())
    meta.update(ok=not blank, method=method, size=[w, h], blank=blank, path=target,
                rect=[r.left, r.top, r.right, r.bottom], bytes=os.path.getsize(target))
    return meta


# ------------------------------------------------------------------ 判据工具

def snapshot_procs():
    by_name, ppid = P.snapshot_pids()
    return by_name, ppid


def kwservice_pids():
    by_name, _ = snapshot_procs()
    return by_name.get("kwservice.exe", [])


def file_state(path):
    if not os.path.exists(path):
        return {"exists": False}
    st = os.stat(path)
    with open(path, "rb") as f:
        data = f.read()
    # 客户端写 hblogs.txt 用的是本机 ANSI(GBK)，优先按 GBK 解，失败再退 UTF-8
    try:
        text = data.decode("gbk")
        enc = "gbk"
    except UnicodeDecodeError:
        text = data.decode("utf-8", "replace")
        enc = "utf-8"
    return {"exists": True, "size": st.st_size, "mtime": st.st_mtime,
            "mtime_iso": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(st.st_mtime)),
            "sha256_8": hashlib.sha256(data).hexdigest()[:16], "encoding": enc,
            "lines": text.splitlines()}


def read_patch_state(pid):
    out = []
    base, size, err = P.find_module(pid, "audiobuffer.dll")
    if not base:
        return {"base": None, "err": err, "patches": []}
    for it in P.PATCHES:
        state, cur = P.patch_state(pid, base, it)
        out.append({"name": it["name"], "rva": "0x%X" % it["rva"], "state": state,
                    "bytes_now": None if cur is None else cur.hex(" "),
                    "expect_before": it["before"].hex(" "), "expect_after": it["after"].hex(" ")})
    return {"base": hex(base), "size": size, "patches": out}


def wait(cond, timeout, interval=0.4):
    t0 = time.time()
    while time.time() - t0 < timeout:
        v = cond()
        if v:
            return v, round(time.time() - t0, 2)
        time.sleep(interval)
    return None, round(time.time() - t0, 2)


def find_result_dialog(pid):
    for w in P.find_windows(cls="#32770", pid=pid):
        if not w["visible"]:
            continue
        texts = [c["title"] for c in P.children(w["hwnd"])
                 if c["class"] == "Static" and c["title"].strip()]
        if texts:
            w = dict(w)
            w["static_text"] = "\r\n".join(texts)
            return w
    return None


# ------------------------------------------------------------------ 主流程

def run(mode, card, timeouts):
    if mode not in ("quick", "full"):
        raise ValueError("mode 只允许 quick/full")
    if not re.fullmatch(r"[\x20-\x7e]{1,64}", card):
        raise ValueError("卡密只允许 1~64 个 ASCII 可见字符: %r" % card)
    t_start = time.time()
    report = {"mode": mode, "card": card, "started_at": time.strftime("%Y-%m-%d %H:%M:%S"),
              "launch_cmd": [sys.executable, LAUNCH_PY, "--no-dismiss", "--card", card],
              "checks": {}, "passed": False}
    hard_checks = ["C1_success_dialog", "C2_ui_takeover"]
    if mode == "full":
        hard_checks += ["C0_clean_start", "C3_card_file"]

    # --- 0. 清残留
    before_names, _ = snapshot_procs()
    residual_before = {n: before_names.get(n, []) for n in
                       ("kwmusic.exe", "kwservice.exe", "kwwebkit.exe", "kwuacset.exe")}
    killed, residual = P.cleanup_client()
    report["preclean"] = {"residual_before_launch": residual_before, "killed": killed,
                          "residual_after": residual}
    log("清残留: killed=%s residual=%s" % (killed, residual))
    if residual:
        log("警告: 清理后仍有残留 %s" % residual)

    # --- 1. 基线
    with open(AUDIOBUF_DLL, "rb") as f:
        disk_sha = hashlib.sha256(f.read()).hexdigest()
    report["baseline"] = {"hblogs": file_state(HBLOGS_TXT), "kami": file_state(KAMI_TXT),
                          "disk_audiobuffer_sha256": disk_sha, "t_start": t_start}
    hb_lines_before = report["baseline"]["hblogs"].get("lines", [])
    kami_mtime_before = report["baseline"]["kami"].get("mtime")

    # --- 2. 启动 + 破解（黑盒调用 launch.py）
    if not os.path.isdir(EVID_DIR):
        os.makedirs(EVID_DIR)
    ev_name = "launch_events_%s.json" % mode
    cmd = [sys.executable, LAUNCH_PY, "--no-dismiss", "--card", card,
           "--events-out", out_file(ev_name)]
    log("执行: %s" % " ".join('"%s"' % c if " " in c else c for c in cmd))
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8",
                              errors="replace", timeout=timeouts["launch"], cwd=CRACK_DIR)
        rc, out, errout = proc.returncode, proc.stdout, proc.stderr
    except subprocess.TimeoutExpired as e:
        rc, out, errout = 124, (e.stdout or ""), (e.stderr or "") + "\n[TIMEOUT]"
    report["launch"] = {"rc": rc, "stdout_tail": out.splitlines()[-25:],
                        "stderr_tail": errout.splitlines()[-10:]}
    log("launch.py rc=%d" % rc)

    # 独立找 KwService.exe（不依赖 launch.py 的日志）
    pids = kwservice_pids()
    report["pid_kwservice"] = pids
    if not pids:
        for w in P.find_windows(cls=LOGIN_CLASS, title=LOGIN_TITLE) + P.find_windows(cls="#32770"):
            if w["pid"] not in pids:
                pids.append(w["pid"])
    report["pid_kwmusic"] = snapshot_procs()[0].get("kwmusic.exe", [])
    log("KwService.exe pid=%s kwmusic.exe pid=%s" % (pids, report["pid_kwmusic"]))
    if not pids:
        report["reason"] = "KwService.exe 不在运行"
        return report

    # --- 3. C1：程序自弹结果框（原始值）
    dlg, dt = wait(lambda: find_result_dialog(pids[0]), timeouts["dialog"])
    c1 = {"ok": False, "waited_s": dt}
    if dlg:
        c1.update(hwnd=dlg["hwnd_hex"], title=dlg["title"], pid=dlg["pid"],
                  static_text=dlg.get("static_text"), rect=dlg["rect"])
        c1["ok"] = c1["static_text"].startswith(SUCCESS_PREFIX)
        c1["is_failure_message"] = FAIL_PREFIX in (c1["static_text"] or "")
        log("C1 结果框: %r / %r -> %s" % (c1["title"], c1["static_text"],
                                          "PASS" if c1["ok"] else "FAIL"))
        report["patch_state_at_verify"] = read_patch_state(pids[0])
    else:
        log("C1 超时: %.1fs 内没有 KwService.exe 的结果框" % dt)
    report["checks"]["C1_success_dialog"] = c1

    # 关掉结果框（成功框/失败框都关，便于收尾）；程序可能不止弹一个框，
    # 后续在等界面接管时继续清，并把每个框的原始文本记进证据
    dialogs_seen = []

    def dismiss_result_dialogs():
        for w in P.find_windows(cls="#32770", pid=pids[0]):
            if not w["visible"]:
                continue
            texts = [c["title"] for c in P.children(w["hwnd"])
                     if c["class"] == "Static" and c["title"].strip()]
            rec = {"hwnd": w["hwnd_hex"], "title": w["title"], "pid": w["pid"],
                   "static_text": "\r\n".join(texts),
                   "t": round(time.time() - t_start, 2)}
            if rec not in dialogs_seen:
                dialogs_seen.append(rec)
                log("结果框(第%d个): %r / %r" % (len(dialogs_seen), rec["title"], rec["static_text"]))
            for c in P.children(w["hwnd"]):
                if c["ctrl_id"] == 2 or c["class"] == "Button":
                    P.click_button(c["hwnd"])
                    break

    if dlg:
        dismiss_result_dialogs()
        time.sleep(1.0)

    # --- 4. C2：登录窗隐藏 + 主界面接管
    def takeover():
        dismiss_result_dialogs()
        lg = P.find_windows(cls=LOGIN_CLASS, title=LOGIN_TITLE)
        mn = [w for w in P.find_windows(cls=MAIN_CLASS, pid=pids[0]) if w["visible"]]
        if mn and lg and all(not w["visible"] for w in lg):
            return {"main": mn[0], "login": lg}
        return None

    got, wt_s = wait(takeover, timeouts["takeover"], 0.5)
    c2 = {"ok": False, "waited_s": wt_s}
    if got:
        c2.update(ok=True, main_hwnd=got["main"]["hwnd_hex"], main_title=got["main"]["title"],
                  main_rect=got["main"]["rect"], main_pid=got["main"]["pid"],
                  login_hwnd=got["login"][0]["hwnd_hex"],
                  login_visible=got["login"][0]["visible"],
                  login_exists=bool(P.user32.IsWindow(got["login"][0]["hwnd"])))
        log("C2 界面接管: 主界面 %s vis=True pid=%d / 登录窗 %s vis=False -> PASS" %
            (c2["main_title"], c2["main_pid"], c2["login_hwnd"]))
    else:
        log("C2 失败: %.1fs 内未观测到界面接管" % wt_s)
    report["windows_at_pass"] = [w for w in P.find_windows(pid=pids[0])]
    report["dialogs_seen"] = dialogs_seen
    report["checks"]["C2_ui_takeover"] = c2

    # --- 5. 截图（full，且已观测到主界面时）
    if mode == "full" and got:
        report["screenshot"] = screenshot_window(got["main"]["hwnd"], "verify_full.png")
        log("截图: %s" % report["screenshot"])

    # --- 6. C3：程序自己写出的 卡密.txt
    kami_now = file_state(KAMI_TXT)
    hb_now = file_state(HBLOGS_TXT)
    hb_lines_after = hb_now.get("lines", [])
    new_hb = [ln for ln in hb_lines_after if ln not in hb_lines_before]
    c3 = {"ok": bool(kami_now.get("exists") and kami_now.get("lines") and
                     kami_now["lines"][-1].strip() == card),
          "kami_content_tail": kami_now.get("lines", [])[-1] if kami_now.get("lines") else None,
          "expect_card": card,
          "mtime_before": kami_mtime_before, "mtime_after": kami_now.get("mtime"),
          "mtime_changed": (kami_mtime_before != kami_now.get("mtime"))}
    report["checks"]["C3_card_file"] = c3
    c4 = {"ok": not new_hb or all("-21" not in ln for ln in new_hb),
          "note": "失败路径会追加 '错误码:-21'；成功路径实测仍会追加 '错误码:-15'，故只把 -21 当反例",
          "hblogs_new_lines": new_hb, "hblogs_new_lines_with_minus21":
              [ln for ln in new_hb if "-21" in ln],
          "hblogs_total_lines": len(hb_lines_after)}
    report["checks"]["C4_failure_log"] = c4
    log("C3 卡密.txt 末行=%r (期望 %r) 改写=%s -> %s" %
        (c3["kami_content_tail"], card, c3["mtime_changed"], "PASS" if c3["ok"] else "FAIL"))
    log("C4 hblogs.txt 新增行=%s -> %s" % (new_hb, "PASS" if c4["ok"] else "FAIL"))

    # --- 7. 磁盘未被改动
    with open(AUDIOBUF_DLL, "rb") as f:
        disk_sha_now = hashlib.sha256(f.read()).hexdigest()
    report["disk_audiobuffer_sha256_after"] = disk_sha_now
    report["disk_untouched"] = (disk_sha_now == disk_sha)

    # --- 8. 收尾清理
    killed2, residual2 = P.cleanup_client()
    report["cleanup"] = {"killed": killed2, "residual": residual2}
    log("收尾清理: killed=%s residual=%s" % (killed2, residual2))

    # --- 9. 判定
    if mode == "full":
        report["checks"]["C0_clean_start"] = {"ok": not any(residual_before.values()),
                                              "residual_before_launch": residual_before}
    else:
        report["checks"]["C0_clean_start"] = {"ok": not residual, "residual_after_cleanup": residual}
    ok = rc == 0 and all(report["checks"][k]["ok"] for k in hard_checks) and not residual2
    report["passed"] = bool(ok)
    report["duration_s"] = round(time.time() - t_start, 2)
    if not ok:
        report["reason"] = "launch rc=%d, 判据失败: %s" % (
            rc, {k: report["checks"][k]["ok"] for k in report["checks"]})
    report["finished_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    return report


def write_evidence(report):
    """evidence/verify_full.json：先把 JSON 编码成 str，再经 out_file 校验后落盘。"""
    if not os.path.isdir(EVID_DIR):
        os.makedirs(EVID_DIR)
    payload = json.dumps(report, ensure_ascii=False, indent=1)
    Path(out_file("verify_full.json")).write_text(payload, encoding="utf-8")
    return out_file("verify_full.json")


def main():
    ap = argparse.ArgumentParser(description="Nec 破解成品验证")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--quick", action="store_true")
    g.add_argument("--full", action="store_true")
    ap.add_argument("--card", default=VERIFY_CARD)
    ap.add_argument("--timeout-launch", type=float, default=300.0)
    ap.add_argument("--timeout-dialog", type=float, default=60.0)
    ap.add_argument("--timeout-takeover", type=float, default=90.0)
    args = ap.parse_args()
    mode = "full" if args.full else "quick"
    timeouts = {"launch": args.timeout_launch, "dialog": args.timeout_dialog,
                "takeover": args.timeout_takeover}
    log("模式=%s 卡密=%r" % (mode, args.card))
    report = run(mode, args.card, timeouts)
    if mode == "full":
        log("证据已写: %s" % write_evidence(report))
    log("=" * 60)
    for k, v in report["checks"].items():
        log("%-20s %s" % (k, "PASS" if v["ok"] else "FAIL"))
    log("结论: %s (%.1fs)" % ("PASS 破解生效" if report["passed"] else "FAIL 未通过",
                             report["duration_s"]))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
