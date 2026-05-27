#!/usr/bin/env python3
"""
BANDCAMP TRACK REPLACER - Track 013 (Waiting room)
"""
import os
import time
import subprocess
try:
    import pyautogui
except ImportError:
    subprocess.run(["pip3", "install", "pyautogui"])
    import pyautogui

TRACK_PATH = os.path.expanduser("/Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_MASTERED/013 - Borja Moskv - Waiting room_MASTERED.flac")

def execute_js(js_code):
    apple_script = f'''
    tell application "Google Chrome"
        tell active tab of front window
            execute javascript "{js_code.replace('"', '\\"')}"
        end tell
    end tell
    '''
    subprocess.run(["osascript", "-e", apple_script], capture_output=True)

def main():
    print("[INIT] Launching Chrome...")
    subprocess.run(["open", "-a", "Google Chrome", "https://borjamoskv.bandcamp.com/edit_album?id=1663269807"])
    time.sleep(6)

    print("[DOM] Clicking replace on track 013...")
    execute_js("""
        var links = document.querySelectorAll('a.replace');
        if (links[12]) {
            links[12].scrollIntoView({behavior: 'instant', block: 'center'});
            links[12].click();
        }
    """)
    
    time.sleep(2)
    pyautogui.hotkey('command', 'shift', 'g')
    time.sleep(1)
    pyautogui.typewrite(TRACK_PATH)
    time.sleep(1)
    pyautogui.press('enter')
    time.sleep(1)
    pyautogui.press('enter')
    
    print("[DONE] Track 013 replacement triggered.")

if __name__ == "__main__":
    main()
