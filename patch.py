# -*- coding: utf-8 -*-
"""patch.py -- Nec 卡密校验绕过补丁（运行期内存补丁，不改磁盘文件）

补丁点全部在 KwService.exe 进程内的 AudioBuffer.dll（Themida 加壳，磁盘文件被加密，
只有运行期内存里才是真正的代码）。RVA == 已脱壳转储文件偏移；运行期 VA = 模块基址 + RVA
（模块基址每次启动随机，如 0x4790000 / 0x4770000 / 0x47c0000，所以必须按 RVA 现算）。

  P1 verdict_switch  RVA 0x9F24E6
      改前: 0F 85 C0 9C 36 00   jne 0xD5C1AC  —— 服务端判定“不通过”时反而跳进成功处理块
      改后: E9 C1 9C 36 00 90   jmp 0xD5C1AC; nop —— 无条件进入成功处理块
  P2 card_length     RVA 0x1573
      改前: B8 01 00 00 00      mov eax,1    —— 卡密长度不在 32~40 时置“长度错误”标志
      改后: 33 C0 90 90 90      xor eax,eax; nop*3 —— 长度门失效，任意长度卡密继续登录

对照（不打补丁）: 无效卡密 -> #32770 '错误' / '卡密无效或账号密码错误!'
打补丁后:        任意卡密 -> #32770 '信息：' / '登陆成功! \r\n账号过期时间:...' -> 登录窗隐藏、主界面接管

只写目标进程内存，进程退出后自然恢复；restore 可随时把原始字节写回。
写入前先读回当前字节做一致性校验（必须等于 before 或已是 after），未知状态一律拒绝写。

CLI:
  py -3 patch.py show    [--pid N]     读当前字节并判断状态
  py -3 patch.py apply   [--pid N]     施加两个补丁（幂等）
  py -3 patch.py restore [--pid N]     还原原始字节
"""
import argparse
import ctypes
import ctypes.wintypes as wt
import os
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def _find_necdir():
    """定位客户端目录：优先本文件同级/上级的 Nec/，其次原工作区布局与原版安装位置。"""
    here = os.path.dirname(os.path.abspath(__file__))
    cands = [
        os.path.join(here, "Nec"),
        os.path.join(os.path.dirname(here), "Nec"),
        os.path.join(here, "work", "install", "Nec"),
        os.path.join(os.path.dirname(here), "work", "install", "Nec"),
        os.path.join(os.environ.get("ProgramFiles", r"C:\Program Files"), "Nec"),
    ]
    for c in cands:
        if os.path.isfile(os.path.join(c, "kwmusic.exe")):
            return c
    return cands[0]


NEC_DIR = _find_necdir()
KW_MUSIC_EXE = os.path.join(NEC_DIR, "kwmusic.exe")

k32 = ctypes.WinDLL("kernel32", use_last_error=True)
user32 = ctypes.WinDLL("user32", use_last_error=True)
psapi = ctypes.WinDLL("psapi", use_last_error=True)

PROCESS_TERMINATE = 0x0001
PROCESS_QUERY_INFORMATION = 0x0400
PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
PROCESS_VM_OPERATION = 0x0008
PROCESS_VM_READ = 0x0010
PROCESS_VM_WRITE = 0x0020
TH32CS_SNAPPROCESS = 0x00000002
LIST_MODULES_ALL = 0x03
PAGE_EXECUTE_READWRITE = 0x40
MAX_PATH = 260

PATCHES = [
    dict(name="P1_verdict_switch", rva=0x9F24E6,
         before=bytes.fromhex("0F85C09C3600"), after=bytes.fromhex("E9C19C360090"),
         desc="jne 0xD5C1AC -> jmp 0xD5C1AC;nop（服务端判定不通过也进成功处理块）"),
    dict(name="P2_card_length", rva=0x1573,
         before=bytes.fromhex("B801000000"), after=bytes.fromhex("33C0909090"),
         desc="mov eax,1 -> xor eax,eax;nop*3（解除 32~40 字符长度门）"),
]

PROT_NAME = {0x01: "NOACCESS", 0x02: "R", 0x04: "RW", 0x08: "WC", 0x10: "X", 0x20: "XR",
             0x40: "XRW", 0x80: "XWC"}


class PROCESSENTRY32W(ctypes.Structure):
    _fields_ = [("dwSize", wt.DWORD), ("cntUsage", wt.DWORD), ("th32ProcessID", wt.DWORD),
                ("th32DefaultHeapID", ctypes.POINTER(ctypes.c_ulong)), ("th32ModuleID", wt.DWORD),
                ("cntThreads", wt.DWORD), ("th32ParentProcessID", wt.DWORD),
                ("pcPriClassBase", ctypes.c_long), ("dwFlags", wt.DWORD),
                ("szExeFile", ctypes.c_wchar * MAX_PATH)]


class STARTUPINFOW(ctypes.Structure):
    _fields_ = [("cb", wt.DWORD), ("lpReserved", wt.LPWSTR), ("lpDesktop", wt.LPWSTR),
                ("lpTitle", wt.LPWSTR), ("dwX", wt.DWORD), ("dwY", wt.DWORD),
                ("dwXSize", wt.DWORD), ("dwYSize", wt.DWORD), ("dwXCountChars", wt.DWORD),
                ("dwYCountChars", wt.DWORD), ("dwFillAttribute", wt.DWORD), ("dwFlags", wt.DWORD),
                ("wShowWindow", wt.WORD), ("cbReserved2", wt.WORD),
                ("lpReserved2", ctypes.POINTER(ctypes.c_byte)), ("hStdInput", wt.HANDLE),
                ("hStdOutput", wt.HANDLE), ("hStdError", wt.HANDLE)]


class PROCESS_INFORMATION(ctypes.Structure):
    _fields_ = [("hProcess", wt.HANDLE), ("hThread", wt.HANDLE),
                ("dwProcessId", wt.DWORD), ("dwThreadId", wt.DWORD)]


class MEMORY_BASIC_INFORMATION64(ctypes.Structure):
    _fields_ = [("BaseAddress", ctypes.c_ulonglong), ("AllocationBase", ctypes.c_ulonglong),
                ("AllocationProtect", wt.DWORD), ("__alignment1", wt.DWORD),
                ("RegionSize", ctypes.c_ulonglong), ("State", wt.DWORD),
                ("Protect", wt.DWORD), ("Type", wt.DWORD), ("__alignment2", wt.DWORD)]


class MODULEINFO(ctypes.Structure):
    _fields_ = [("lpBaseOfDll", ctypes.c_void_p), ("SizeOfImage", wt.DWORD),
                ("EntryPoint", ctypes.c_void_p)]


k32.OpenProcess.restype = wt.HANDLE
k32.CreateToolhelp32Snapshot.restype = wt.HANDLE
k32.CreateProcessW.argtypes = [wt.LPCWSTR, wt.LPWSTR, ctypes.c_void_p, ctypes.c_void_p,
                               wt.BOOL, wt.DWORD, ctypes.c_void_p, wt.LPCWSTR,
                               ctypes.POINTER(STARTUPINFOW), ctypes.POINTER(PROCESS_INFORMATION)]
k32.VirtualQueryEx.restype = ctypes.c_size_t
k32.VirtualQueryEx.argtypes = [wt.HANDLE, ctypes.c_void_p,
                               ctypes.POINTER(MEMORY_BASIC_INFORMATION64), ctypes.c_size_t]
k32.VirtualProtectEx.argtypes = [wt.HANDLE, ctypes.c_void_p, ctypes.c_size_t, wt.DWORD,
                                 ctypes.POINTER(wt.DWORD)]
k32.ReadProcessMemory.argtypes = [wt.HANDLE, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t,
                                  ctypes.POINTER(ctypes.c_size_t)]
k32.WriteProcessMemory.argtypes = [wt.HANDLE, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t,
                                   ctypes.POINTER(ctypes.c_size_t)]
k32.QueryFullProcessImageNameW.argtypes = [wt.HANDLE, wt.DWORD, wt.LPWSTR, ctypes.POINTER(wt.DWORD)]
k32.Process32FirstW.argtypes = [wt.HANDLE, ctypes.POINTER(PROCESSENTRY32W)]
k32.Process32NextW.argtypes = [wt.HANDLE, ctypes.POINTER(PROCESSENTRY32W)]
psapi.EnumProcessModulesEx.argtypes = [wt.HANDLE, ctypes.c_void_p, wt.DWORD,
                                       ctypes.POINTER(wt.DWORD), wt.DWORD]
psapi.GetModuleFileNameExW.argtypes = [wt.HANDLE, ctypes.c_void_p, wt.LPWSTR, wt.DWORD]
psapi.GetModuleInformation.argtypes = [wt.HANDLE, ctypes.c_void_p, ctypes.POINTER(MODULEINFO), wt.DWORD]


def log(msg):
    print("[patch] %s" % msg, flush=True)


# ---------------------------------------------------------------- 进程

def snapshot_pids():
    """-> ({name_lower: [pid]}, {pid: ppid})"""
    by_name, ppid = {}, {}
    snap = k32.CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0)
    if not snap or snap == wt.HANDLE(-1).value:
        return by_name, ppid
    try:
        e = PROCESSENTRY32W()
        e.dwSize = ctypes.sizeof(PROCESSENTRY32W)
        ok = k32.Process32FirstW(snap, ctypes.byref(e))
        while ok:
            by_name.setdefault(e.szExeFile.lower(), []).append(int(e.th32ProcessID))
            ppid[int(e.th32ProcessID)] = int(e.th32ParentProcessID)
            ok = k32.Process32NextW(snap, ctypes.byref(e))
    finally:
        k32.CloseHandle(snap)
    return by_name, ppid


def process_path(pid):
    h = k32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
    if not h:
        return None
    try:
        buf = ctypes.create_unicode_buffer(2048)
        n = wt.DWORD(2048)
        if k32.QueryFullProcessImageNameW(h, 0, buf, ctypes.byref(n)):
            return buf.value
        return None
    finally:
        k32.CloseHandle(h)


def kill_pid(pid):
    h = k32.OpenProcess(PROCESS_TERMINATE | PROCESS_QUERY_INFORMATION, False, pid)
    if not h:
        return False
    try:
        return bool(k32.TerminateProcess(h, 1))
    finally:
        k32.CloseHandle(h)


def cleanup_client(extra_names=("kwmusic.exe", "KwService.exe", "KwWebKit.exe", "KwUACSet.exe"),
                   rounds=12, sleep=0.5):
    """终止工作区安装目录里的所有客户端进程 + 上述常见名字。返回 (killed, residual)。"""
    nec_prefix = os.path.normcase(os.path.abspath(NEC_DIR) + os.sep)
    killed, residual = [], {}
    dead_names = [n.lower() for n in extra_names]
    for _ in range(rounds):
        by_name, _ppid = snapshot_pids()
        targets = set()
        for pids in by_name.values():
            targets.update(pids)
        todo = []
        for pid in targets:
            path = process_path(pid)
            if not path:
                continue
            if os.path.normcase(os.path.abspath(path)).startswith(nec_prefix):
                todo.append((pid, os.path.basename(path)))
        for nm in dead_names:
            for pid in by_name.get(nm, []):
                if (pid, nm) not in todo:
                    todo.append((pid, nm))
        if not todo:
            break
        for pid, nm in sorted(todo, key=lambda x: x[1].lower() == "kwmusic.exe"):  # 先杀子进程
            if kill_pid(pid):
                killed.append("%s pid=%d" % (nm, pid))
        time.sleep(sleep)
    by_name, _ = snapshot_pids()
    for nm in dead_names:
        if by_name.get(nm):
            residual[nm] = by_name[nm]
    return killed, residual


def launch_client(exe=None, work_dir=None, extra_cmdline=None):
    exe = exe or KW_MUSIC_EXE
    work_dir = work_dir or NEC_DIR
    si = STARTUPINFOW()
    si.cb = ctypes.sizeof(STARTUPINFOW)
    pi = PROCESS_INFORMATION()
    cmdline = ('"%s"' % exe) if not extra_cmdline else ('"%s" %s' % (exe, extra_cmdline))
    buf = ctypes.create_unicode_buffer(cmdline)
    ok = k32.CreateProcessW(exe, buf, None, None, False, 0, None, work_dir,
                            ctypes.byref(si), ctypes.byref(pi))
    if not ok:
        raise OSError("CreateProcessW failed err=%d" % ctypes.get_last_error())
    return pi


# ---------------------------------------------------------------- 模块 / 内存

def find_module(pid, dll_name="audiobuffer.dll"):
    """-> (base, size, err)"""
    h = k32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, False, pid)
    if not h:
        return None, None, "OpenProcess err=%d" % ctypes.get_last_error()
    try:
        arr = (ctypes.c_void_p * 4096)()
        need = wt.DWORD(0)
        if not psapi.EnumProcessModulesEx(h, ctypes.byref(arr), ctypes.sizeof(arr),
                                          ctypes.byref(need), LIST_MODULES_ALL):
            return None, None, "EnumProcessModulesEx err=%d" % ctypes.get_last_error()
        n = need.value // ctypes.sizeof(ctypes.c_void_p)
        for i in range(n):
            buf = ctypes.create_unicode_buffer(1024)
            if psapi.GetModuleFileNameExW(h, ctypes.c_void_p(arr[i]), buf, 1024):
                if buf.value.lower().endswith(dll_name):
                    mi = MODULEINFO()
                    psapi.GetModuleInformation(h, ctypes.c_void_p(arr[i]), ctypes.byref(mi),
                                               ctypes.sizeof(mi))
                    return int(arr[i]), int(mi.SizeOfImage), None
        return None, None, "%s not found in pid %d (%d modules)" % (dll_name, pid, n)
    finally:
        k32.CloseHandle(h)


def read_mem(pid, va, n):
    h = k32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, False, pid)
    if not h:
        return None, "OpenProcess(err=%d)" % ctypes.get_last_error()
    try:
        buf = ctypes.create_string_buffer(n)
        got = ctypes.c_size_t(0)
        if not k32.ReadProcessMemory(h, ctypes.c_void_p(va), buf, n, ctypes.byref(got)):
            return None, "ReadProcessMemory(err=%d)" % ctypes.get_last_error()
        return buf.raw[:got.value], None
    finally:
        k32.CloseHandle(h)


def _open_rw(pid):
    return k32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_OPERATION | PROCESS_VM_READ |
                           PROCESS_VM_WRITE, False, pid)


def write_mem(pid, va, data, restore_protect=True):
    h = _open_rw(pid)
    if not h:
        return dict(ok=False, err="OpenProcess(RW) err=%d" % ctypes.get_last_error())
    try:
        page = va & ~0xFFF
        old = wt.DWORD(0)
        vp_ok = bool(k32.VirtualProtectEx(h, ctypes.c_void_p(page), 0x1000, PAGE_EXECUTE_READWRITE,
                                          ctypes.byref(old)))
        out = dict(vp_ok=vp_ok, old_protect=old.value,
                   old_protect_name=PROT_NAME.get(old.value & 0xFF, "?"))
        if not vp_ok:
            out.update(ok=False, err="VirtualProtectEx err=%d" % ctypes.get_last_error())
            return out
        buf = ctypes.create_string_buffer(data, len(data))
        wrote = ctypes.c_size_t(0)
        w_ok = bool(k32.WriteProcessMemory(h, ctypes.c_void_p(va), buf, len(data),
                                           ctypes.byref(wrote)))
        out.update(write_ok=w_ok, wrote=wrote.value)
        buf2 = ctypes.create_string_buffer(len(data))
        got = ctypes.c_size_t(0)
        k32.ReadProcessMemory(h, ctypes.c_void_p(va), buf2, len(data), ctypes.byref(got))
        out["after_bytes"] = buf2.raw[:got.value].hex(" ")
        out["ok"] = bool(w_ok and wrote.value == len(data) and buf2.raw[:len(data)] == data)
        if not out["ok"] and "err" not in out:
            out["err"] = "WriteProcessMemory err=%d" % ctypes.get_last_error()
        if restore_protect and old.value:
            wt.DWORD(0)
            k32.VirtualProtectEx(h, ctypes.c_void_p(page), 0x1000, old.value, ctypes.byref(old))
        return out
    finally:
        k32.CloseHandle(h)


def patch_state(pid, base, item):
    """读当前字节 -> 'original' | 'patched' | 'unknown'"""
    cur, err = read_mem(pid, base + item["rva"], len(item["before"]))
    if cur is None:
        return "error:" + err, None
    if cur == item["before"]:
        return "original", cur
    if cur == item["after"]:
        return "patched", cur
    return "unknown", cur


def apply_patches(pid, base, items=None, verbose=True):
    """施加（幂等）所有补丁 -> list[dict] 结果"""
    items = items if items is not None else PATCHES
    results = []
    for it in items:
        state, cur = patch_state(pid, base, it)
        r = dict(name=it["name"], rva=it["rva"], va=base + it["rva"],
                 before=it["before"].hex(" "), after=it["after"].hex(" "),
                 state_before=state,
                 bytes_before=None if cur is None else cur.hex(" "))
        if state == "patched":
            r["status"] = "already"
        elif state == "original":
            w = write_mem(pid, r["va"], it["after"])
            r.update(w)
            r["status"] = "patched" if w.get("ok") else "failed"
        else:
            r["status"] = "refused-%s" % state
            r["err"] = "当前字节与 before/after 都不一致，拒绝写入"
        results.append(r)
        if verbose:
            log("%s rva=0x%X va=0x%X before=[%s] -> %s %s" %
                (it["name"], it["rva"], r["va"], r["bytes_before"], r["status"],
                 "" if r["status"] in ("patched", "already") else r.get("err", "")))
    return results


def restore_patches(pid, base, items=None, verbose=True):
    items = items if items is not None else PATCHES
    results = []
    for it in items:
        state, cur = patch_state(pid, base, it)
        r = dict(name=it["name"], rva=it["rva"], va=base + it["rva"], state_before=state)
        if state == "patched":
            w = write_mem(pid, r["va"], it["before"])
            r.update(w)
            r["status"] = "restored" if w.get("ok") else "failed"
        elif state == "original":
            r["status"] = "already-original"
        else:
            r["status"] = "refused-%s" % state
        results.append(r)
        if verbose:
            log("%s restore -> %s" % (it["name"], r["status"]))
    return results


# ---------------------------------------------------------------- 窗口

WM_SETTEXT = 0x000C
WM_GETTEXT = 0x000D
WM_CLOSE = 0x0010
BM_CLICK = 0x00F5
SMTO_ABORTIFHUNG = 0x0002

user32.EnumWindows.argtypes = [ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM), wt.LPARAM]
user32.EnumChildWindows.argtypes = [wt.HWND, ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM), wt.LPARAM]
user32.GetWindowTextW.argtypes = [wt.HWND, wt.LPWSTR, ctypes.c_int]
user32.GetClassNameW.argtypes = [wt.HWND, wt.LPWSTR, ctypes.c_int]
user32.GetWindowThreadProcessId.argtypes = [wt.HWND, ctypes.POINTER(wt.DWORD)]
user32.GetWindowRect.argtypes = [wt.HWND, ctypes.POINTER(wt.RECT)]
user32.IsWindow.argtypes = [wt.HWND]
user32.GetDlgCtrlID.argtypes = [wt.HWND]
user32.GetDlgCtrlID.restype = ctypes.c_int

_smt_res = ctypes.c_size_t(0)
SMT_STR = ctypes.WINFUNCTYPE(wt.LPARAM, wt.HWND, wt.UINT, wt.WPARAM, ctypes.c_wchar_p, wt.UINT,
                             wt.UINT, ctypes.POINTER(ctypes.c_size_t))(("SendMessageTimeoutW", user32))
SMT_BUF = ctypes.WINFUNCTYPE(wt.LPARAM, wt.HWND, wt.UINT, wt.WPARAM, ctypes.c_void_p, wt.UINT,
                             wt.UINT, ctypes.POINTER(ctypes.c_size_t))(("SendMessageTimeoutW", user32))


def window_info(hwnd):
    t = ctypes.create_unicode_buffer(512)
    user32.GetWindowTextW(hwnd, t, 512)
    c = ctypes.create_unicode_buffer(256)
    user32.GetClassNameW(hwnd, c, 256)
    pid = wt.DWORD(0)
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
    r = wt.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(r))
    return {"hwnd": int(hwnd), "hwnd_hex": hex(hwnd), "title": t.value, "class": c.value,
            "pid": int(pid.value), "visible": bool(user32.IsWindowVisible(hwnd)),
            "rect": [r.left, r.top, r.right, r.bottom]}


def enum_windows():
    out = []

    @ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM)
    def cb(hwnd, lparam):
        out.append(window_info(hwnd))
        return True

    user32.EnumWindows(cb, 0)
    return out


def children(hwnd):
    kids = []

    @ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM)
    def cb(h, lparam):
        kids.append(h)
        return True

    user32.EnumChildWindows(hwnd, cb, 0)
    out = []
    for h in kids:
        info = window_info(h)
        info["ctrl_id"] = int(user32.GetDlgCtrlID(h))
        out.append(info)
    return out


def find_windows(cls=None, title=None, pid=None, visible=None, title_prefix=None):
    out = []
    for w in enum_windows():
        if cls is not None and w["class"] != cls:
            continue
        if title is not None and w["title"] != title:
            continue
        if title_prefix is not None and not w["title"].startswith(title_prefix):
            continue
        if pid is not None and w["pid"] != pid:
            continue
        if visible is not None and w["visible"] != visible:
            continue
        out.append(w)
    return out


def set_edit_text(hwnd, text, timeout_ms=3000):
    r = SMT_STR(hwnd, WM_SETTEXT, 0, text, SMTO_ABORTIFHUNG, timeout_ms, ctypes.byref(_smt_res))
    return bool(r)


def get_edit_text(hwnd, timeout_ms=3000, size=512):
    buf = ctypes.create_unicode_buffer(size)
    r = SMT_BUF(hwnd, WM_GETTEXT, size, ctypes.cast(buf, ctypes.c_void_p), SMTO_ABORTIFHUNG,
                timeout_ms, ctypes.byref(_smt_res))
    if not r:
        return None
    return buf.value


def click_button(hwnd, timeout_ms=5000):
    r = SMT_BUF(hwnd, BM_CLICK, 0, None, SMTO_ABORTIFHUNG, timeout_ms, ctypes.byref(_smt_res))
    return bool(r)


def close_window(hwnd):
    return bool(user32.PostMessageW(hwnd, WM_CLOSE, 0, 0))


# ---------------------------------------------------------------- CLI

def resolve_pid(pid_arg):
    if pid_arg:
        return int(pid_arg)
    by_name, _ = snapshot_pids()
    pids = by_name.get("kwservice.exe", [])
    if not pids:
        return None
    return pids[0]


def main():
    ap = argparse.ArgumentParser(description="Nec AudioBuffer.dll 运行期内存补丁")
    ap.add_argument("action", choices=["show", "apply", "restore"])
    ap.add_argument("--pid", default=None)
    args = ap.parse_args()
    pid = resolve_pid(args.pid)
    if not pid:
        log("KwService.exe 未运行（先用 launch.py 启动客户端）")
        return 2
    base, size, err = find_module(pid, "audiobuffer.dll")
    if not base:
        log("pid=%d 找不到 AudioBuffer.dll: %s" % (pid, err))
        return 3
    log("pid=%d AudioBuffer.dll base=0x%X size=%d" % (pid, base, size))
    if args.action == "show":
        for it in PATCHES:
            state, cur = patch_state(pid, base, it)
            log("%s rva=0x%-8X state=%-8s bytes=[%s] expect_before=[%s]" %
                (it["name"], it["rva"], state, None if cur is None else cur.hex(" "),
                 it["before"].hex(" ")))
        return 0
    if args.action == "apply":
        res = apply_patches(pid, base)
        return 0 if all(r["status"] in ("patched", "already") for r in res) else 4
    res = restore_patches(pid, base)
    return 0 if all(r["status"] in ("restored", "already-original") for r in res) else 4


if __name__ == "__main__":
    sys.exit(main())
