import requests
import time

token = "e846fda3ed2d480d826ab85fcf49d7d8"
url = "http://localhost:8011/api/v1/dispatch"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

def dispatch(applescript_code):
    payload = {
        "domain": "automation",
        "action": "run_applescript",
        "args": [applescript_code]
    }
    r = requests.post(url, json=payload, headers=headers)
    print("Daemon response:", r.json())
    return r.json()

# Step 1: Open the video insertion popover by clicking the toolbar button
click_toolbar_script = '''
tell application "Safari"
    activate
    tell current tab of front window
        do JavaScript "
            (function() {
                // Focus editor
                const editor = document.querySelector('.ProseMirror');
                if (editor) editor.focus();
                
                const btn = document.querySelector('[aria-label=\"Video\"]') || document.querySelector('[title=\"Insertar video\"]');
                if (btn) {
                    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
                    const mouseup = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
                    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
                    btn.dispatchEvent(mousedown);
                    btn.dispatchEvent(mouseup);
                    btn.dispatchEvent(click);
                    return 'Clicked toolbar button';
                }
                return 'Toolbar button not found';
            })()
        "
    end tell
end tell
'''
print("Clicking 'Insertar video' toolbar button...")
dispatch(click_toolbar_script)

time.sleep(3)

# Step 2: Click the file input inside the popover
click_input_script = '''
tell application "Safari"
    activate
    tell current tab of front window
        do JavaScript "
            (function() {
                const myVideoInput = document.querySelector('input[type=\"file\"][accept=\"video/*\"]');
                if (myVideoInput) {
                    myVideoInput.click();
                    return 'Clicked video file input';
                }
                return 'Video file input NOT found';
            })()
        "
    end tell
end tell
'''
print("Clicking file input inside popover...")
dispatch(click_input_script)

time.sleep(3)

# Step 3: Enter the video file path via System Events
file_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4"
picker_script = f'''
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 1
        -- Command+Shift+G to open "Go to folder" sheet
        keystroke "g" using {{command down, shift down}}
        delay 2
        
        -- Type filepath
        keystroke "{file_path}"
        delay 2
        
        -- Confirm path
        key code 36
        delay 2
        
        -- Confirm file selection
        key code 36
    end tell
end tell
'''
print(f"Entering filepath via System Events: {file_path}...")
dispatch(picker_script)
print("Full flow automation finished.")
