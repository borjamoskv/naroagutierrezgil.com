#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════
BANDCAMP TRACK REPLACER — Local Chrome Execution
═══════════════════════════════════════════════════════════
Uses launch_persistent_context with the real Chrome 
executable but disables extensions to prevent crashes.
This avoids the 50MB remote-transfer limit.
═══════════════════════════════════════════════════════════
"""

import os
import glob
import time
from playwright.sync_api import sync_playwright

MASTERED_DIR = os.path.expanduser("/Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_MASTERED")
SESSION_DIR = os.path.join(MASTERED_DIR, ".pw_session_noext")
ALBUM_URL = "https://borjamoskv.bandcamp.com/edit_album?id=1663269807"

def get_mastered_files():
    return sorted(glob.glob(os.path.join(MASTERED_DIR, "*_MASTERED.flac")))

def main():
    mastered_files = get_mastered_files()
    if not mastered_files:
        print("[ERROR] No files found")
        return

    # First run: We need the user to login once, then we save state
    with sync_playwright() as p:
        print("[BRAVE] Launching local Brave Browser (no extensions)...")
        context = p.chromium.launch_persistent_context(
            user_data_dir=SESSION_DIR,
            executable_path="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
            headless=False,
            args=["--disable-extensions", "--no-default-browser-check"],
            viewport={"width": 1400, "height": 900}
        )

        page = context.pages[0] if context.pages else context.new_page()
        page.goto(ALBUM_URL, wait_until="domcontentloaded")
        
        # Check login
        page.wait_for_timeout(3000)
        if "login" in page.url:
            print("[AUTH] >>> Please log in manually in the opened Chrome window <<<")
            # Wait for user to login (up to 10 minutes)
            for sec in range(0, 600, 5):
                page.wait_for_timeout(5000)
                print(f"  [AUTH] Waiting for login... ({600-sec} seconds remaining)")
                if "login" not in page.url:
                    print("  [AUTH] Login detected! Proceeding...")
                    break
            
            # Go to edit page after login
            page.goto(ALBUM_URL, wait_until="domcontentloaded")
            page.wait_for_timeout(3000)
            
        print(f"[NAV] Current URL: {page.url}")
        
        # Now we are local, no 50MB limit
        success = 0
        
        # Wait for tracklist to load and replace links to appear
        page.locator('a.replace').first.wait_for(state="visible", timeout=20000)
        replace_count = page.evaluate("() => document.querySelectorAll('a.replace').length")
        print(f"[DOM] Found {replace_count} replace links")
        
        for i, mastered_file in enumerate(mastered_files):
            if i >= replace_count:
                print(f"  [{i+1:02d}/50] ⚠ Track index exceeds available replace links.")
                break
                
            abs_path = os.path.abspath(mastered_file)
            fname = os.path.basename(mastered_file)
            
            try:
                # Scroll element into view via JS
                page.evaluate(f"() => {{ document.querySelectorAll('a.replace')[{i}].scrollIntoView({{block: 'center'}}); }}")
                page.wait_for_timeout(200)
                
                replace_link = page.locator('a.replace').nth(i)
                
                with page.expect_file_chooser(timeout=10000) as fc_info:
                    replace_link.click(force=True)
                
                # Because we launched the browser directly, it is co-located
                fc_info.value.set_files(abs_path)
                print(f"  [{i+1:02d}/50] ✓ Queued {fname}")
                success += 1
                page.wait_for_timeout(3000) # Short delay between starts
                
            except Exception as e:
                print(f"  [{i+1:02d}/50] ✗ {str(e)[:80]}")

        print(f"\n[DONE] Successfully uploaded {success} files.")
        print("[DONE] Review the page and click Save/Publish.")
        
        try:
            input("Press Enter to close...")
        except EOFError:
            time.sleep(300)
            
        context.close()

if __name__ == "__main__":
    main()
