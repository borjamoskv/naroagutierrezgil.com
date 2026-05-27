#!/usr/bin/env python3
"""
BANDCAMP PUBLISH AUTOMATION
Clicks the Save/Publish button on the Bandcamp Edit Album page.
"""
import subprocess
import time

def execute_js(js_code):
    apple_script = f'''
    tell application "Google Chrome"
        tell active tab of front window
            execute javascript "{js_code.replace('"', '\\"')}"
        end tell
    end tell
    '''
    subprocess.run(["osascript", "-e", apple_script])

def main():
    print("[INIT] Opening Chrome and finalizing publish...")
    subprocess.run(["open", "-a", "Google Chrome"])
    time.sleep(2)
    
    # Simple JS to find the submit button and click it
    # Bandcamp uses a save button often labeled "Save", "Save draft", or "Publish"
    js_click_save = """
        var buttons = document.querySelectorAll('button, input[type="submit"]');
        var clicked = false;
        
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var text = (btn.textContent || btn.value).toLowerCase();
            if (text.includes('save') || text.includes('publish') || text.includes('update') || text.includes('guardar') || text.includes('publicar')) {
                // Ignore secondary buttons if possible, usually the main one is at the bottom or has a specific class
                if (btn.offsetParent !== null) { // visible
                    btn.click();
                    clicked = true;
                    break;
                }
            }
        }
        
        if (!clicked) {
            // Fallback: try to submit the main form
            var form = document.querySelector('form.edit-album') || document.querySelector('form');
            if (form) form.submit();
        }
    """
    
    execute_js(js_click_save)
    print("[DONE] Publish button clicked.")

if __name__ == "__main__":
    main()
