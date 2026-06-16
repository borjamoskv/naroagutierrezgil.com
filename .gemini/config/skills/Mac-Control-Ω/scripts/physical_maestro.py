#!/usr/bin/env python3
# C5-REAL
import sys
import time
import random
import math
from typing import List, Tuple

try:
    from Quartz import (
        CGEventCreateKeyboardEvent,
        CGEventPost,
        kCGHIDEventTap,
        CGEventCreateMouseEvent,
        kCGEventMouseMoved,
        kCGEventLeftMouseDown,
        kCGEventLeftMouseUp,
        kCGMouseButtonLeft,
        CGEventCreateScrollWheelEvent,
        kCGScrollEventUnitLine,
        CGEventSetFlags,
        CGEventKeyboardSetUnicodeString,
    )
    from AppKit import NSScreen
except ImportError:
    import subprocess

    subprocess.run(
        [
            sys.executable,
            "-m",
            "pip",
            "install",
            "pyobjc-framework-Quartz",
            "pyobjc-framework-AppKit",
            "-q",
        ]
    )
    from Quartz import *  # noqa: F401,F403
    from AppKit import NSScreen

def confirm_action(action_desc: str) -> bool:
    import os
    if os.environ.get("OMEGA_HID_CONFIRM", "1").lower() not in ("1", "true", "yes"):
        return True

    import subprocess
    import json
    from pathlib import Path

    script_dir = Path(__file__).resolve().parent
    overlay_path = script_dir / "noir_overlay.py"

    try:
        res = subprocess.run(
            [sys.executable, str(overlay_path), "--confirm", action_desc],
            capture_output=True, text=True, timeout=15
        )
        if res.returncode == 0:
            try:
                data = json.loads(res.stdout.strip())
                return data.get("status") == "confirmed"
            except Exception:
                return "confirmed" in res.stdout.lower()
        return False
    except Exception:
        return False

# ─── KEYMAPS ──────────────────────────────────────────────────────────────────

KEYMAP = {
    "a": 0,
    "b": 1,
    "c": 2,
    "d": 3,
    "e": 14,
    "f": 3,
    "g": 5,
    "h": 4,
    "i": 34,
    "j": 38,
    "k": 40,
    "l": 37,
    "m": 46,
    "n": 45,
    "o": 31,
    "p": 35,
    "q": 12,
    "r": 15,
    "s": 1,
    "t": 17,
    "u": 32,
    "v": 9,
    "w": 13,
    "x": 7,
    "y": 16,
    "z": 6,
    "0": 29,
    "1": 18,
    "2": 19,
    "3": 20,
    "4": 21,
    "5": 23,
    "6": 22,
    "7": 26,
    "8": 28,
    "9": 25,
    "-": 27,
    "=": 24,
    "[": 33,
    "]": 30,
    "\\": 42,
    ";": 41,
    "'": 39,
    ",": 43,
    ".": 47,
    "/": 44,
    "`": 50,
    " ": 49,
    "\n": 36,
    "\r": 36,
    "\t": 48,
    "delete": 51,
    "esc": 53,
    "command": 55,
    "shift": 56,
    "caps": 57,
    "option": 58,
    "control": 59,
    "right_shift": 60,
    "right_option": 61,
    "right_control": 62,
    "function": 63,
    "f17": 64,
    "volume_up": 72,
    "volume_down": 73,
    "mute": 74,
    "f18": 79,
    "f19": 80,
    "f20": 90,
    "f5": 96,
    "f6": 97,
    "f7": 98,
    "f3": 99,
    "f8": 100,
    "f9": 101,
    "f11": 103,
    "f13": 105,
    "active_monitor": 106,
    "f14": 107,
    "f10": 109,
    "f12": 111,
    "f15": 113,
    "help": 114,
    "home": 115,
    "pgup": 116,
    "f4": 118,
    "end": 119,
    "f2": 120,
    "pgdn": 121,
    "f1": 122,
    "left": 123,
    "right": 124,
    "down": 125,
    "up": 126,
}

SHIFT_MAP = {
    "~": "`",
    "!": "1",
    "@": "2",
    "#": "3",
    "$": "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0",
    "_": "-",
    "+": "=",
    "{": "[",
    "}": "]",
    "|": "\\",
    ":": ";",
    '"': "'",
    "<": ",",
    ">": ".",
    "?": "/",
}

# ─── CORE ─────────────────────────────────────────────────────────────────────


class PhysicalMaestro:
    def __init__(self):
        self._tap = kCGHIDEventTap

    def press_key(self, char: str, modifiers: List[str] = None):
        code = KEYMAP.get(char.lower())
        if code is None:
            return

        event_down = CGEventCreateKeyboardEvent(None, code, True)
        event_up = CGEventCreateKeyboardEvent(None, code, False)

        if modifiers:
            flags = 0
            if "command" in modifiers:
                flags |= 0x00100000
            if "shift" in modifiers:
                flags |= 0x00020000
            if "option" in modifiers:
                flags |= 0x00080000
            if "control" in modifiers:
                flags |= 0x00040000

            time.sleep(random.uniform(0.005, 0.015))
            CGEventSetFlags(event_down, flags)
            CGEventSetFlags(event_up, flags)

        CGEventPost(self._tap, event_down)
        CGEventPost(self._tap, event_up)

    def move_mouse(self, x: int, y: int):
        event = CGEventCreateMouseEvent(None, kCGEventMouseMoved, (x, y), kCGMouseButtonLeft)
        CGEventPost(self._tap, event)

    def move_mouse_smooth(self, target_x: int, target_y: int, steps: int = None):
        from AppKit import NSEvent

        try:
            loc = NSEvent.mouseLocation()
            screen_w, screen_h = self.get_screen_size()
            start_x = int(loc.x)
            start_y = screen_h - int(loc.y)
        except Exception:
            start_x, start_y = target_x - 100, target_y - 100

        if steps is None:
            dist = math.hypot(target_x - start_x, target_y - start_y)
            # Snappy mouse movement: max 15 steps instead of 50, larger distance divisor
            steps = max(3, min(int(dist / 40), 15))

        for i in range(steps):
            t = i / steps
            t_smooth = (1 - math.cos(t * math.pi)) / 2

            x = start_x + (target_x - start_x) * t_smooth
            y = start_y + (target_y - start_y) * t_smooth

            noise_scale = 3 * math.sin(t * math.pi)
            x += random.uniform(-noise_scale, noise_scale)
            y += random.uniform(-noise_scale, noise_scale)

            self.move_mouse(int(x), int(y))
            time.sleep(random.uniform(0.0005, 0.002))

        self.move_mouse(target_x, target_y)

    def scroll_inertial(self, lines: int, steps: int = 10):
        for i in range(steps):
            t = 1 - (i / steps)
            current_lines = int(lines * t)
            if current_lines == 0:
                break

            event = CGEventCreateScrollWheelEvent(None, kCGScrollEventUnitLine, 1, current_lines)
            CGEventPost(self._tap, event)
            time.sleep(random.uniform(0.05, 0.1))

    def _type_ghost_raw(self, text: str):
        down = CGEventCreateKeyboardEvent(None, 0, True)
        up = CGEventCreateKeyboardEvent(None, 0, False)
        CGEventKeyboardSetUnicodeString(down, len(text), text)
        CGEventKeyboardSetUnicodeString(up, len(text), text)
        CGEventPost(self._tap, down)
        CGEventPost(self._tap, up)

    def click(self, x: int, y: int):
        # Enforce secure attention sequence
        if not confirm_action(f"Physical Click at ({x}, {y})"):
            raise PermissionError("Secure hardware confirmation denied or timed out.")

        self.move_mouse_smooth(x, y)
        time.sleep(random.uniform(0.01, 0.03))
        down = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, (x, y), kCGMouseButtonLeft)
        CGEventPost(self._tap, down)
        time.sleep(random.uniform(0.005, 0.015))
        up = CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, (x, y), kCGMouseButtonLeft)
        CGEventPost(self._tap, up)

    def type_string(self, text: str, wpm: int = 350):
        # Enforce secure attention sequence
        if not confirm_action(f"Physical Type: '{text[:20]}...'"):
            raise PermissionError("Secure hardware confirmation denied or timed out.")

        # Auto-route text longer than 15 characters to instant unicode typing (type_ghost)
        if len(text) > 15:
            self._type_ghost_raw(text)
            return

        base_delay = 60 / (wpm * 5)
        for char in text:
            modifiers = []
            if char.isupper() or char in SHIFT_MAP:
                modifiers.append("shift")
                char = SHIFT_MAP.get(char, char.lower())
            else:
                char = char.lower()

            self.press_key(char, modifiers)
            jitter = random.uniform(-0.25, 0.25) * base_delay
            time.sleep(max(0.005, base_delay + jitter))

    def type_ghost(self, text: str):
        if not confirm_action(f"Physical Type (Ghost): '{text[:20]}...'"):
            raise PermissionError("Secure hardware confirmation denied or timed out.")
        self._type_ghost_raw(text)

    def get_screen_size(self) -> Tuple[int, int]:
        screen = NSScreen.mainScreen()
        frame = screen.frame()
        return int(frame.size.width), int(frame.size.height)

    def fill_screen_with_app(self, app_name: str):
        script = f'''
        tell application "{app_name}"
            activate
            set bounds of front window to {{0, 0, {self.get_screen_size()[0]}, {self.get_screen_size()[1]}}}
        end tell
        '''
        import subprocess

        subprocess.run(["osascript", "-e", script])


if __name__ == "__main__":
    maestro = PhysicalMaestro()
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "--type" and len(sys.argv) > 2:
            maestro.type_string(sys.argv[2])
        elif cmd == "--fill" and len(sys.argv) > 2:
            maestro.fill_screen_with_app(sys.argv[2])
        elif cmd == "--size":
            print(f"Screen size: {maestro.get_screen_size()}")
    else:
        print("C5-REAL")
