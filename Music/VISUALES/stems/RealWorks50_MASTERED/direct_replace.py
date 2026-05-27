#!/usr/bin/env python3
"""
FAST DIRECT BANDCAMP REPLACER — Using Forced Clicks and JS Scrolling
"""

import os
import glob
import time
from playwright.sync_api import sync_playwright

ALBUM_EDIT_URL = "https://borjamoskv.bandcamp.com/edit_album?id=1663269807"
MASTERED_DIR = os.path.expanduser("/Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_MASTERED")
CDP_PORT = 9222

def get_mastered_files():
    return sorted(glob.glob(os.path.join(MASTERED_DIR, "*_MASTERED.flac")))

def main():
    mastered_files = get_mastered_files()
    if not mastered_files:
        print("[ERROR] No mastered files found in /Users/borjafernandezangulo/Music/VISUALES/stems/RealWorks50_MASTERED")
        return

    print(f"[INIT] Found {len(mastered_files)} mastered tracks.")
    print("[CDP] Connecting directly to Chrome on port 9222...")
    
    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
            context = browser.contexts[0]
            
            # Find if the tab is already open or open a new one
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
            print(f"[DOM] Found {replace_count} replace links on the page.")
            
            if replace_count == 0:
                print("[ERROR] No replace links found on the page.")
                return

            success = 0
            failed = 0
            
            # We want to replace all 50 tracks one by one!
            for i, mastered_file in enumerate(mastered_files):
                track_num = i + 1
                abs_path = os.path.abspath(mastered_file)
                fname = os.path.basename(mastered_file)
                
                if i >= replace_count:
                    print(f"  [{track_num:02d}/50] ⚠ No more replace links")
                    break

                try:
                    # Scroll into view via JS for maximum speed and safety
                    page.evaluate(f"() => {{ document.querySelectorAll('a.replace')[{i}].scrollIntoView({{block: 'center'}}); }}")
                    page.wait_for_timeout(200)
                    
                    replace_link = page.locator('a.replace').nth(i)
                    
                    with page.expect_file_chooser(timeout=5000) as fc_info:
                        replace_link.click(force=True, timeout=5000)
                    
                    file_chooser = fc_info.value
                    file_chooser.set_files(abs_path)
                    
                    print(f"  [{track_num:02d}/50] ✓ Queued {fname}")
                    success += 1
                    page.wait_for_timeout(1000) # Quick wait between uploads
                    
                except Exception as e:
                    print(f"  [{track_num:02d}/50] ✗ Error: {str(e)[:60]}")
                    failed += 1

            print(f"\n[DONE] Finished. Successfully queued {success} uploads. {failed} failed.")
            
        except Exception as e:
            print(f"[ERROR] Connection failed: {e}")

if __name__ == "__main__":
    main()
