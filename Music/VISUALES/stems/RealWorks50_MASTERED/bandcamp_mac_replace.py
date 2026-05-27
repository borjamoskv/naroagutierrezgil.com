#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════
BANDCAMP TRACK REPLACER — Mac Native UI Automation
═══════════════════════════════════════════════════════════
Automates Google Chrome directly using AppleScript and 
PyAutoGUI. Clicks "replace" via JS, then types the file 
path into the Mac open dialog.
═══════════════════════════════════════════════════════════
"""

import os
import glob
import time
import subprocess
import urllib.parse
try:
    import pyautogui
except ImportError:
    subprocess.run(["pip3", "install", "--break-system-packages", "pyautogui"], check=True)
    import pyautogui

MASTERED_DIR = os.path.expanduser("/Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_MASTERED")

def get_mastered_files():
    files = sorted(glob.glob(os.path.join(MASTERED_DIR, "*_MASTERED.flac")))
    print(f"[INIT] {len(files)} mastered tracks ready")
    return files

def execute_js(js_code):
    """Executes JS in the active Chrome tab using AppleScript."""
    # We use AppleScript to tell Chrome to execute javascript on the active tab
    # The 'osascript' command needs to be properly escaped
    apple_script = f'''
    tell application "Google Chrome"
        set js to "{js_code.replace('"', '\\"').replace('"', '\\"')}"
        execute front window's active tab javascript js
    end tell
    '''
    # Wait, the correct syntax in English is "execute front window's active tab javascript js"
    # But let's try a safer way
    apple_script = f'''
    tell application "Google Chrome"
        tell active tab of front window
            execute javascript "{js_code.replace('"', '\\"')}"
        end tell
    end tell
    '''
    process = subprocess.run(["osascript", "-e", apple_script], capture_output=True, text=True)
    return process.stdout.strip()

def activate_chrome():
    subprocess.run(["osascript", "-e", 'tell application "Google Chrome" to activate'])
    time.sleep(1)

def main():
    mastered_files = get_mastered_files()
    if not mastered_files:
        print("[ERROR] No files found")
        return

    print(f"\n{'═' * 60}")
    print(f"  BANDCAMP REPLACER — Mac UI Automation")
    print(f"{'═' * 60}\n")

    activate_chrome()
    time.sleep(2)

    # Verify we are on the edit page and have replace links
    count_str = execute_js("document.querySelectorAll('a.replace').length")
    try:
        count = int(count_str)
        print(f"[DOM] Found {count} replace links")
    except ValueError:
        print(f"[ERROR] Could not detect replace links. Got: {count_str}")
        return

    if count == 0:
        print("[ERROR] No replace links found.")
        return

    success = 0
    
    for i, mastered_file in enumerate(mastered_files):
        if i >= count:
            break
            
        track_num = i + 1
        abs_path = os.path.abspath(mastered_file)
        fname = os.path.basename(mastered_file)
        
        print(f"  [{track_num:02d}/50] Uploading: {fname}")
        
        # Click the i-th replace link using JS
        execute_js(f"""
            var links = document.querySelectorAll('a.replace');
            if (links[{i}]) {{
                links[{i}].scrollIntoView({{behavior: 'instant', block: 'center'}});
                links[{i}].click();
            }}
        """)
        
        # Wait for the Mac "Choose File" dialog to open
        time.sleep(2)
        
        # Press Cmd+Shift+G to open the "Go to folder" input
        pyautogui.hotkey('command', 'shift', 'g')
        time.sleep(1)
        
        # Type the path
        pyautogui.typewrite(abs_path)
        time.sleep(1)
        
        # Press Enter to confirm path
        pyautogui.press('enter')
        time.sleep(1)
        
        # Press Enter to confirm file selection
        pyautogui.press('enter')
        
        print(f"  [{track_num:02d}/50] ✓ Dialog handled")
        success += 1
        
        # Wait a bit for the upload to start processing
        time.sleep(4)

    print(f"\n{'═' * 60}")
    print(f"  Finished sending {success} files.")
    print(f"  Please review the browser and click Save/Publish.")
    print(f"{'═' * 60}\n")

if __name__ == "__main__":
    main()
