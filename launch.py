# -*- coding: utf-8 -*-
"""launch.py -- Nec 破解版一键启动器（启动客户端 + 运行期内存补丁 + 自动过卡密窗）

流程（全部实测跑通）:
  1. 清理残留进程（kwmusic.exe / KwService.exe / KwWebKit.exe / KwUACSet.exe 及安装目录内任何进程）
  2. CreateProcessW 启动 work\\install\\Nec\\kwmusic.exe（工作目录 = 客户端目录）
  3. 轮询等待卡密登录窗（class=WTWindow, title='Nec - Login'），拿到宿主进程 KwService.exe 的 pid
  4. 在该 pid 里定位 AudioBuffer.dll 模块基址，按 RVA 施加两个运行期内存补丁（见 patch.py）:
       P1 RVA 0x9F24E6  jne 0xD5C1AC -> jmp 0xD5C1AC;nop
       P2 RVA 0x1573    mov eax,1    -> xor eax,eax;nop*3
     —— 只写内存不改磁盘；补丁在进程退出后自然消失
  5. 往卡密输入框（子控件 id=130）填默认卡密并核对回读，点『登 录』（子控件 id=110）
  6. 程序自己弹出成功框（#32770 '信息：' / '登陆成功! \\r\\n账号过期时间:...'）
     -> 默认自动点『确定』，等登录窗隐藏、主界面 '酷狗音乐' 可见后退出 0，客户端保持运行
     -> --no-dismiss 时保留成功框不点，供 verify.py 独立观察判据

用法:
  py -3 launch.py                    # 一键：启动 + 破解 + 自动登录（成品入口）
  py -3 launch.py --no-dismiss       # 停在成功框，供验证脚本观测
  py -3 launch.py --card <32字符>     # 指定卡密（默认任意 32 字符）
  py -3 launch.py --no-clean         # 不先杀残留进程
  py -3 launch.py --events-out f.json # 事件流水落盘（排查用）

退出码: 0=已进入主界面（或 --no-dismiss 已见成功框） 2=登录窗超时 3=找不到 AudioBuffer.dll
        4=补丁失败 5=出现的是失败框/超时 6=主界面未出现
"""
import argparse
import ctypes
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import patch as P  # noqa: E402

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DEFAULT_CARD = "NECCRACK" + "0" * 24          # 32 字符，天然落在 32~40 长度门内
SUCCESS_PREFIX = "登陆成功!"
LOGIN_CLASS, LOGIN_TITLE = "WTWindow", "Nec - Login"
MAIN_CLASS, MAIN_TITLE = "Chrome_WidgetWin_1", "酷狗音乐"
CTRL_EDIT, CTRL_LOGIN, CTRL_TRIAL = 130, 110, 100
DLG_INFO, DLG_ERR = "#32770", None

EV = []


def log(msg):
    line = "[launch] %s" % msg
    print(line, flush=True)
    EV.append(line)


def event(kind, **kw):
    rec = dict(t=round(time.time(), 3), kind=kind)
    rec.update(kw)
    EV.append("EVENT %s" % json.dumps(rec, ensure_ascii=False))
    print("EVENT %s" % json.dumps(rec, ensure_ascii=False), flush=True)
    return rec


def wait_for(fn, timeout, interval=0.25, desc=""):
    t0 = time.time()
    while time.time() - t0 < timeout:
        v = fn()
        if v:
            return v
        time.sleep(interval)
    return None


def find_login_window():
    ws = P.find_windows(cls=LOGIN_CLASS, title=LOGIN_TITLE)
    if not ws:
        return None
    for w in ws:
        if w["visible"]:
            return w
    return None


def dialog_text(dlg_hwnd):
    """取 #32770 对话框的子 Static 文本（对话框正文）"""
    texts = []
    for c in P.children(dlg_hwnd):
        if c["class"] == "Static" and c["title"].strip():
            texts.append(c["title"])
    return "\r\n".join(texts)


def find_result_dialog(pid):
    for w in P.find_windows(cls="#32770", pid=pid):
        if not w["visible"]:
            continue
        txt = dialog_text(w["hwnd"])
        if not txt:
            continue
        return w, txt
    return None, None


def main():
    ap = argparse.ArgumentParser(description="Nec 破解版启动器")
    ap.add_argument("--card", default=DEFAULT_CARD)
    ap.add_argument("--no-dismiss", action="store_true", help="保留成功框不点掉，供验证脚本观察")
    ap.add_argument("--no-clean", action="store_true")
    ap.add_argument("--timeout-login", type=float, default=180.0)
    ap.add_argument("--timeout-finish", type=float, default=90.0)
    ap.add_argument("--events-out", default=None)
    args = ap.parse_args()

    # 交互式（用户双击 .bat）才打印中文横幅：cmd.exe 在 chcp 65001 下解析批处理里的
    # 中文不可靠，所以中文一律由这里输出。verify.py 会传 --events-out 并捕获输出，
    # 那时保持静默，免得把验证证据的关键输出挤出 tail。
    interactive = args.events_out is None
    if interactive:
        print("", flush=True)
        print("  ==============================================================", flush=True)
        print("     Nec 破解版   一键启动", flush=True)
        print("  --------------------------------------------------------------", flush=True)
        print("     破解交流群： 777410175      （更新 / 答疑 / 失效反馈都在这）", flush=True)
        print("  ==============================================================", flush=True)
        print("     [说明] 现在开始启动并破解，看到「破解完成」就是成功了。", flush=True)
        print("            过程中请不要关闭这个窗口，否则补丁可能没打上。", flush=True)
        print("            跑完之后这个窗口可以关掉，关掉不影响已经启动的程序。", flush=True)
        print("", flush=True)

    def finish(rc, note=""):
        if args.events_out:
            try:
                with open(args.events_out, "w", encoding="utf-8") as f:
                    json.dump({"rc": rc, "note": note, "card": args.card, "events": EV}, f,
                              ensure_ascii=False, indent=1)
            except OSError as e:
                log("events-out 写失败: %s" % e)
        if interactive:
            if rc == 0:
                print("", flush=True)
                print("  ==============================================================", flush=True)
                print("     [OK] 破解完成，客户端已经启动，可以正常使用了。", flush=True)
                print("  --------------------------------------------------------------", flush=True)
                print("     这个窗口现在可以关掉 —— 关掉不影响已经启动的程序。", flush=True)
                print("     补丁只在内存里，程序退出后失效；下次要用就重新双击本文件。", flush=True)
                print("     有问题 / 要更新： 破解交流群 777410175", flush=True)
                print("  ==============================================================", flush=True)
            else:
                print("", flush=True)
                print("  ==============================================================", flush=True)
                print("     [FAIL] 启动失败，错误码 = %d" % rc, flush=True)
                print("  --------------------------------------------------------------", flush=True)
                print("     请先别关窗口，把上面的报错内容截图发到群里：", flush=True)
                print("         破解交流群 777410175", flush=True)
                print("  ==============================================================", flush=True)
        log("EXIT rc=%d %s" % (rc, note))
        return rc

    if not args.no_clean:
        killed, residual = P.cleanup_client()
        log("cleanup killed=%s residual=%s" % (killed, residual))
        if residual:
            log("警告: 清理后仍有残留 %s" % residual)

    pi = P.launch_client()
    event("launch", pid=int(pi.dwProcessId), exe=P.KW_MUSIC_EXE, cwd=P.NEC_DIR)

    t0 = time.time()
    lw = wait_for(find_login_window, args.timeout_login)
    if not lw:
        return finish(2, "登录窗未出现（超时 %.0fs）" % args.timeout_login)
    pid = lw["pid"]
    event("login_window", hwnd=lw["hwnd_hex"], pid=pid, t=round(time.time() - t0, 2),
          rect=lw["rect"])

    base = size = None
    t1 = time.time()
    while time.time() - t1 < 30:
        base, size, err = P.find_module(pid, "audiobuffer.dll")
        if base:
            break
        time.sleep(0.25)
    if not base:
        return finish(3, "pid=%d 找不到 AudioBuffer.dll: %s" % (pid, err))
    event("module", pid=pid, base=hex(base), size=size)

    res = P.apply_patches(pid, base)
    for r in res:
        event("patch", name=r["name"], rva="0x%X" % r["rva"], va="0x%X" % r["va"],
              bytes_before=r["bytes_before"], after=r["after"], status=r["status"],
              vp_ok=r.get("vp_ok"), old_protect=None if r.get("old_protect") is None
              else hex(r["old_protect"]), readback=r.get("after_bytes"), err=r.get("err"))
    if not all(r["status"] in ("patched", "already") for r in res):
        return finish(4, "补丁写入失败")

    # 找控件
    kids = {}
    for c in P.children(lw["hwnd"]):
        kids[c["ctrl_id"]] = c
    if CTRL_EDIT not in kids or CTRL_LOGIN not in kids:
        return finish(4, "登录窗控件不符: %s" % {k: v["title"] for k, v in kids.items()})
    event("controls", ids={k: dict(hwnd=v["hwnd_hex"], cls=v["class"], text=v["title"][:24])
                           for k, v in sorted(kids.items())})

    # 填卡密 + 回读
    readback = None
    for _ in range(3):
        ok_set = P.set_edit_text(kids[CTRL_EDIT]["hwnd"], args.card)
        time.sleep(0.3)
        readback = P.get_edit_text(kids[CTRL_EDIT]["hwnd"])
        if readback == args.card:
            break
    event("card_set", set_ok=bool(ok_set), readback=readback, card=args.card,
          match=(readback == args.card))
    if readback != args.card:
        log("警告: 卡密回读不一致(readback=%r)，补丁生效时不影响判定，继续" % readback)

    # 点登录
    before = {w["hwnd"] for w in P.find_windows()}
    ret = P.click_button(kids[CTRL_LOGIN]["hwnd"])
    event("click", ctrl=CTRL_LOGIN, ret=bool(ret))
    time.sleep(0.5)

    # 等程序自己的结果框
    found = None
    t2 = time.time()
    while time.time() - t2 < 60:
        dlg, txt = find_result_dialog(pid)
        if dlg:
            found = (dlg, txt)
            break
        # 没点动就再点一次
        if time.time() - t2 > 3 and P.user32.IsWindow(kids[CTRL_LOGIN]["hwnd"]):
            newwins = {w["hwnd"] for w in P.find_windows()}
            if not (newwins - before):
                P.click_button(kids[CTRL_LOGIN]["hwnd"])
        time.sleep(0.4)
    if not found:
        return finish(5, "点击登录后 60s 内没有结果框")
    dlg, txt = found
    event("dialog", hwnd=dlg["hwnd_hex"], title=dlg["title"], pid=dlg["pid"], text=txt)
    if not txt.startswith(SUCCESS_PREFIX):
        return finish(5, "程序弹出的是失败框: %r / %r" % (dlg["title"], txt))
    log("程序自报成功: %r" % txt)

    if args.no_dismiss:
        return finish(0, "--no-dismiss: 成功框保留（hwnd=%s），交由调用方处置" % dlg["hwnd_hex"])

    # 点确定 + 等界面接管。注意：程序可能弹不止一个信息框（实测出现过点掉后又弹一个
    # 同样的 '登陆成功!' 框把主界面挡在不可见状态），所以循环里反复清框再判接管。
    def transition():
        for w in P.find_windows(cls="#32770", pid=pid):
            if not w["visible"]:
                continue
            for c in P.children(w["hwnd"]):
                if c["ctrl_id"] == 2 or c["class"] == "Button":
                    ok = P.click_button(c["hwnd"])
                    event("dismiss", hwnd=w["hwnd_hex"], button=c["hwnd_hex"],
                          text=c["title"], ret=bool(ok))
                    break
        lg = P.find_windows(cls=LOGIN_CLASS, title=LOGIN_TITLE)
        mn = [w for w in P.find_windows(cls=MAIN_CLASS, pid=pid) if w["visible"]]
        if mn and lg and all(not w["visible"] for w in lg):
            return mn[0], lg
        return None

    got = wait_for(lambda: transition(), args.timeout_finish, 0.5)
    if not got:
        lg = P.find_windows(cls=LOGIN_CLASS, title=LOGIN_TITLE)
        mn = P.find_windows(cls=MAIN_CLASS, pid=pid)
        return finish(6, "主界面未接管: login=%s main=%s" %
                      ([(w["hwnd_hex"], w["visible"]) for w in lg],
                       [(w["hwnd_hex"], w["visible"]) for w in mn]))
    mn, lg = got
    event("transition", main_hwnd=mn["hwnd_hex"], main_title=mn["title"], main_visible=True,
          login_hwnd=lg[0]["hwnd_hex"], login_visible=False)
    log("破解完成：登录窗已隐藏，主界面 '%s' 已接管（kwmusic pid=%d 保持运行）" %
        (mn["title"], int(pi.dwProcessId)))
    return finish(0, "客户端已进入主界面")


if __name__ == "__main__":
    sys.exit(main())
