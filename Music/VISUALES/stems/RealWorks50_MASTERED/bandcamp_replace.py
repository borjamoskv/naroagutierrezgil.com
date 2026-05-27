#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════
BANDCAMP TRACK REPLACER — CDP + Replace Links Edition
═══════════════════════════════════════════════════════════
Connects to real Chrome via CDP, clicks each track's 
"replace" link, handles file chooser with local path.
═══════════════════════════════════════════════════════════
"""

import os
import glob
import time
import re
import subprocess
import json
import urllib.request
from playwright.sync_api import sync_playwright

ALBUM_EDIT_URL = "https://borjamoskv.bandcamp.com/edit_album?id=1663269807"
MASTERED_DIR = os.path.expanduser("/Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_MASTERED")
CDP_PORT = 9222


def get_mastered_files():
    files = sorted(glob.glob(os.path.join(MASTERED_DIR, "*_MASTERED.flac")))
    print(f"[INIT] {len(files)} mastered tracks")
    return files


def ensure_chrome_cdp():
    """Ensure Chrome is running with CDP on port 9222."""
    try:
        resp = urllib.request.urlopen(f"http://localhost:{CDP_PORT}/json/version", timeout=2)
        data = json.loads(resp.read())
        print(f"[CHROME] ✓ CDP already active: {data.get('Browser', 'unknown')}")
        return True
    except Exception:
        pass
    
    print("[CHROME] Starting Chrome with CDP...")
    subprocess.run(["osascript", "-e", 'tell application "Google Chrome" to quit'],
                    capture_output=True, timeout=10)
    time.sleep(3)
    
    subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        f"--remote-debugging-port={CDP_PORT}",
        "--restore-last-session",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    for _ in range(15):
        time.sleep(1)
        try:
            resp = urllib.request.urlopen(f"http://localhost:{CDP_PORT}/json/version", timeout=2)
            data = json.loads(resp.read())
            print(f"[CHROME] ✓ CDP active: {data.get('Browser', 'unknown')}")
            return True
        except Exception:
            pass
    
    print("[CHROME] ✗ CDP failed")
    return False


def main():
    mastered_files = get_mastered_files()
    if not mastered_files:
        return

    print(f"\n{'═' * 60}")
    print(f"  BANDCAMP REPLACER — {len(mastered_files)} tracks")
    print(f"{'═' * 60}\n")

    if not ensure_chrome_cdp():
        return

    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
        context = browser.contexts[0]
        
        page = context.new_page()
        page.goto(ALBUM_EDIT_URL, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(5000)
        
        print(f"[NAV] ✓ {page.title()}")

        # Dismiss cookie banner
        try:
            accept = page.get_by_text("Aceptar todo")
            if accept.is_visible(timeout=2000):
                accept.click()
                page.wait_for_timeout(1000)
        except Exception:
            pass

        # Find the 50 replace anchor links (a.replace)
        replace_count = page.evaluate("() => document.querySelectorAll('a.replace').length")
        
        if replace_count == 0:
            print("[AUTH] No replace links found. Please log in on the Chrome window on your screen.")
            print("[AUTH] Waiting for you to log in and load the edit page...")
            
            logged_in = False
            for attempt in range(100):
                page.wait_for_timeout(3000)
                curr_url = page.url
                replace_count = page.evaluate("() => document.querySelectorAll('a.replace').length")
                if replace_count > 0:
                    print(f"[AUTH] ✓ Logged in! Found {replace_count} replace links. Starting upload...")
                    logged_in = True
                    break
                else:
                    if "login" in curr_url.lower():
                        print(f"  [WAIT] Still on login page (attempt {attempt+1}/100)...")
                    else:
                        if curr_url != ALBUM_EDIT_URL and "login" not in curr_url.lower():
                            print(f"  [NAV] Redirecting to edit page: {ALBUM_EDIT_URL}")
                            try:
                                page.goto(ALBUM_EDIT_URL, wait_until="domcontentloaded", timeout=15000)
                            except Exception:
                                pass
            
            if not logged_in:
                print("[ERROR] Login timeout. Exiting.")
                page.screenshot(path=os.path.join(MASTERED_DIR, "no_replace.png"))
                return

        # Strategy: Click each "replace" link → handle file chooser
        # The replace links are specific to each track's audio
        success = 0
        failed = 0
        
        for i, mastered_file in enumerate(mastered_files):
            track_num = i + 1
            abs_path = os.path.abspath(mastered_file)
            fname = os.path.basename(mastered_file)
            
            if i >= replace_count:
                print(f"  [{track_num:02d}/50] ⚠ No more replace links")
                break

            try:
                # Get the i-th replace link
                replace_link = page.locator('a.replace').nth(i)
                
                # Scroll to it first
                replace_link.scroll_into_view_if_needed()
                page.wait_for_timeout(500)
                
                # Click and catch the file chooser
                with page.expect_file_chooser(timeout=10000) as fc_info:
                    replace_link.click()
                
                file_chooser = fc_info.value
                file_chooser.set_files(abs_path)
                
                print(f"  [{track_num:02d}/50] ✓ {fname}")
                success += 1
                
                # Wait for upload to start processing
                # Bandcamp shows upload progress per track
                page.wait_for_timeout(3000)
                
            except Exception as e:
                err = str(e)
                if "50Mb" in err:
                    # File too large for CDP transfer — try direct approach
                    print(f"  [{track_num:02d}/50] ⚠ File >50MB, trying JS injection...")
                    try:
                        # Find the hidden file input associated with this replace link
                        # and use JS to create a synthetic File + dispatch change event
                        page.evaluate(f"""
                            () => {{
                                const replaceLinks = document.querySelectorAll('a.replace');
                                const link = replaceLinks[{i}];
                                // The replace link's parent track container should have a file input
                                const trackContainer = link.closest('[class*="track"]') || link.parentElement.parentElement;
                                const fileInput = trackContainer.querySelector('input[type="file"]');
                                if (fileInput) {{
                                    // Trigger click to open file dialog
                                    fileInput.click();
                                }}
                            }}
                        """)
                        page.wait_for_timeout(1000)
                        print(f"  [{track_num:02d}/50] ⚠ >50MB — needs manual upload via file dialog")
                        failed += 1
                    except Exception as e2:
                        print(f"  [{track_num:02d}/50] ✗ {str(e2)[:60]}")
                        failed += 1
                else:
                    print(f"  [{track_num:02d}/50] ✗ {err[:80]}")
                    failed += 1

        print(f"\n{'═' * 60}")
        print(f"  Results: {success} ✓ / {failed} ✗")
        print(f"{'═' * 60}")
        
        # Wait for uploads to process
        if success > 0:
            print(f"\n[WAIT] Waiting 30s for uploads to process...")
            page.wait_for_timeout(30000)
        
        page.screenshot(path=os.path.join(MASTERED_DIR, "final_state.png"))
        
        # Check for save button
        save_visible = page.evaluate("""
            () => {
                const btns = document.querySelectorAll('button, input[type="submit"]');
                return Array.from(btns)
                    .filter(b => /save|publish/i.test(b.textContent || b.value))
                    .map(b => b.textContent || b.value);
            }
        """)
        if save_visible:
            print(f"[SAVE] Save buttons found: {save_visible}")
            print("[SAVE] >>> Click Save/Publish in Chrome to finalize <<<")

        print(f"\n[INFO] Chrome remains open. Review and publish.")
        
        try:
            input("[DONE] Press Enter to disconnect...")
        except EOFError:
            time.sleep(300)
        
        browser.close()


if __name__ == "__main__":
    main()
