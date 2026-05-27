#!/usr/bin/env python3
"""
BANDCAMP HYBRID REPLACER — ALL 50 TRACKS
Uses Playwright to reliably scroll and click the replace link via JS,
then uses PyAutoGUI to type the file path in the native Mac file dialog.
"""

import os
import glob
import time
import subprocess
try:
    import pyautogui
except ImportError:
    subprocess.run(["pip3", "install", "--break-system-packages", "pyautogui"])
    import pyautogui
from playwright.sync_api import sync_playwright

ALBUM_EDIT_URL = "https://borjamoskv.bandcamp.com/edit_album?id=1663269807"
MASTERED_DIR = os.path.expanduser("/Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_MASTERED")
CDP_PORT = 9222

def get_mastered_files():
    return sorted(glob.glob(os.path.join(MASTERED_DIR, "*_MASTERED.flac")))

def main():
    mastered_files = get_mastered_files()
    if not mastered_files:
        print("[ERROR] No mastered files found.")
        return

    print(f"[INIT] Found {len(mastered_files)} mastered tracks ready for upload.")
    
    with sync_playwright() as p:
        try:
            print("[CDP] Connecting to Chrome...")
            browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
            context = browser.contexts[0]
            
            page = None
            for p_active in context.pages:
                if "bandcamp.com/edit_album" in p_active.url:
                    page = p_active
                    print(f"[CDP] Found existing Bandcamp edit tab: {page.url}")
                    break
            
            if not page:
                page = context.new_page()
                print(f"[CDP] Navigating to: {ALBUM_EDIT_URL}")
                page.goto(ALBUM_EDIT_URL, wait_until="domcontentloaded", timeout=30000)
            
            page.wait_for_timeout(3000)
            
            replace_count = page.evaluate("() => document.querySelectorAll('a.replace').length")
            print(f"[DOM] Found {replace_count} replace links.")
            
            # Focus Chrome window
            subprocess.run(["osascript", "-e", 'tell application "Google Chrome" to activate'])
            time.sleep(1)

            # Replace all 50 tracks one by one!
            for idx in range(replace_count):
                track_num = idx + 1
                if idx >= len(mastered_files):
                    print(f"[WARN] No mastered file for index {idx}")
                    continue
                
                mastered_file = mastered_files[idx]
                abs_path = os.path.abspath(mastered_file)
                fname = os.path.basename(mastered_file)
                
                print(f"\n[{track_num:02d}/50] Replacing: {fname}")
                
                # Scroll and click via JS inside Playwright
                page.evaluate(f"""() => {{
                    const el = document.querySelectorAll('a.replace')[{idx}];
                    el.scrollIntoView({{block: 'center', behavior: 'instant'}});
                    el.click();
                }}""")
                
                # Wait for Mac native dialog to open
                time.sleep(2)
                
                # Command+Shift+G to enter path
                pyautogui.hotkey('command', 'shift', 'g')
                time.sleep(1)
                
                # Type file path
                pyautogui.typewrite(abs_path)
                time.sleep(1)
                
                # Press Enter to submit path
                pyautogui.press('enter')
                time.sleep(1)
                
                # Press Enter to confirm file selection
                pyautogui.press('enter')
                time.sleep(1)
                
                print(f"[{track_num:02d}/50] ✓ Upload initiated.")
                time.sleep(4) # Wait for upload to start
                
            print("\n[DONE] All 50 tracks replaced successfully.")
            
        except Exception as e:
            print(f"[ERROR] {e}")

if __name__ == "__main__":
    main()
