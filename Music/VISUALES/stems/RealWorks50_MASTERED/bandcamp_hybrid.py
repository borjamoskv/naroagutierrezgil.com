#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════
BANDCAMP TRACK REPLACER — Hybrid CDP + Native OS
═══════════════════════════════════════════════════════════
Connects to real Chrome via CDP to get exact coordinates 
of the 'replace' links. Then uses PyAutoGUI to physically 
click and use the Mac native file picker. 
Bypasses the 50MB CDP file transfer limit.
═══════════════════════════════════════════════════════════
"""

import os
import glob
import time
import subprocess
import urllib.request
import json
from playwright.sync_api import sync_playwright
import pyautogui

MASTERED_DIR = os.path.expanduser("/Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_MASTERED")
CDP_PORT = 9222


def get_mastered_files():
    files = sorted(glob.glob(os.path.join(MASTERED_DIR, "*_MASTERED.flac")))
    return files


def ensure_chrome_cdp():
    try:
        resp = urllib.request.urlopen(f"http://localhost:{CDP_PORT}/json/version", timeout=2)
        return True
    except Exception:
        print("[CHROME] Starting Chrome with CDP...")
        subprocess.run(["osascript", "-e", 'tell application "Google Chrome" to quit'], capture_output=True)
        time.sleep(3)
        subprocess.Popen([
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            f"--remote-debugging-port={CDP_PORT}",
            "--restore-last-session",
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(10):
            time.sleep(1)
            try:
                urllib.request.urlopen(f"http://localhost:{CDP_PORT}/json/version", timeout=2)
                return True
            except Exception:
                pass
        return False


def bring_chrome_to_front():
    subprocess.run(["osascript", "-e", 'tell application "Google Chrome" to activate'])
    time.sleep(1)


def main():
    mastered_files = get_mastered_files()
    if not mastered_files:
        print("[ERROR] No mastered files found")
        return

    print(f"\n{'═' * 60}")
    print(f"  BANDCAMP REPLACER — HYBRID CDP + NATIVE UI")
    print(f"{'═' * 60}\n")

    if not ensure_chrome_cdp():
        print("[FATAL] Could not connect to Chrome CDP")
        return

    with sync_playwright() as p:
        print("[PW] Connecting to Chrome...")
        browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
        context = browser.contexts[0]
        
        # Find the bandcamp edit page tab
        page = None
        for pg in context.pages:
            if "edit_album" in pg.url:
                page = pg
                break
                
        if not page:
            print("[NAV] Edit page not found. Opening it...")
            page = context.new_page()
            page.goto("https://borjamoskv.bandcamp.com/edit_album?id=1663269807", wait_until="domcontentloaded")
            page.wait_for_timeout(3000)
            
        print(f"[NAV] Active on: {page.title()}")
        
        # Bring Chrome to foreground for PyAutoGUI
        bring_chrome_to_front()
        page.bring_to_front()
        time.sleep(1)

        # Get all replace links
        replace_links = page.locator('a.replace').all()
        if not replace_links:
            replace_links = page.get_by_text("replace").all()
            
        count = len(replace_links)
        print(f"[DOM] Found {count} replace links")
        
        if count == 0:
            return

        success = 0
        
        # PyAutoGUI settings
        pyautogui.PAUSE = 0.5
        
        for i, mastered_file in enumerate(mastered_files):
            if i >= count:
                break
                
            abs_path = os.path.abspath(mastered_file)
            fname = os.path.basename(mastered_file)
            track_num = i + 1
            
            print(f"  [{track_num:02d}/50] Uploading: {fname}")
            
            try:
                link = replace_links[i]
                
                # Scroll element into center of viewport
                link.scroll_into_view_if_needed()
                page.wait_for_timeout(500)
                
                # Get coordinates
                box = link.bounding_box()
                if not box:
                    print(f"  [{track_num:02d}/50] ✗ Could not get coordinates")
                    continue
                
                # In macOS Chrome, the CDP coordinates are relative to the viewport.
                # PyAutoGUI uses absolute screen coordinates.
                # To sync them, we evaluate window.screenX/Y + outer/inner offsets
                screen_offsets = page.evaluate("""
                    () => {
                        return {
                            x: window.screenX + (window.outerWidth - window.innerWidth),
                            y: window.screenY + (window.outerHeight - window.innerHeight)
                        }
                    }
                """)
                
                # Fallback heuristic for macOS titlebar (usually ~80px with toolbar)
                titlebar_height = 80 
                
                click_x = screen_offsets['x'] + box['x'] + (box['width'] / 2)
                click_y = screen_offsets['y'] + box['y'] + (box['height'] / 2)
                
                # On macOS Retina displays, PyAutoGUI sometimes uses logical pixels, 
                # which match the browser's CSS pixels. Let's just use PyAutoGUI to click.
                
                # Wait, PyAutoGUI can't reliably guess the exact window offset. 
                # It's safer to just let Playwright click it, which triggers the dialog!
                
                # We can just use Playwright to click! It will open the native dialog.
                # Then we use PyAutoGUI to type the path.
                # Note: Playwright's click() blocks if it opens a modal, but file choosers 
                # don't block JS execution, though in some bindings they might.
                # Let's use evaluate to click so it definitely doesn't block Playwright.
                
                page.evaluate(f"document.querySelectorAll('a.replace')[{i}].click()")
                
                # Wait for Mac OS file dialog to open
                time.sleep(1.5)
                
                # CMD+SHIFT+G to open "Go to Folder" in Mac file picker
                pyautogui.hotkey('command', 'shift', 'g')
                time.sleep(0.5)
                
                # Type the path
                pyautogui.typewrite(abs_path)
                time.sleep(0.5)
                
                # Press Enter to go to the file
                pyautogui.press('enter')
                time.sleep(0.5)
                
                # Press Enter again to select the file
                pyautogui.press('enter')
                
                # Wait for upload to initiate
                time.sleep(3)
                
                print(f"  [{track_num:02d}/50] ✓ Dialog injected")
                success += 1
                
            except Exception as e:
                print(f"  [{track_num:02d}/50] ✗ Error: {e}")
                
                # If something went wrong, press Esc a few times to close any stuck dialogs
                pyautogui.press('escape')
                pyautogui.press('escape')
                time.sleep(1)

        print(f"\n{'═' * 60}")
        print(f"  Finished sending {success} files.")
        print(f"  Review the browser and click Save/Publish.")
        print(f"{'═' * 60}\n")
        
        browser.close()


if __name__ == "__main__":
    main()
