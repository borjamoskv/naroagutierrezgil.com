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

# 1. Click 'Insertar video' toolbar button inside the editor
click_toolbar_script = '''
tell application "Safari"
    activate
    tell current tab of front window
        do JavaScript "
            (function() {
                // Focus editor first
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
                return 'Toolbar button NOT found';
            })()
        "
    end tell
end tell
'''
print("Clicking toolbar 'Insertar video' button...")
dispatch(click_toolbar_script)
time.sleep(3)

# 2. Focus the upload area button
focus_button_script = '''
tell application "Safari"
    activate
    tell current tab of front window
        do JavaScript "
            (function() {
                const buttons = Array.from(document.querySelectorAll('button'));
                const uploadBtn = buttons.find(b => b.innerText && b.innerText.includes('Suelta tu archivo'));
                if (uploadBtn) {
                    uploadBtn.focus();
                    return 'Focused upload button';
                }
                return 'Upload button NOT found';
            })()
        "
    end tell
end tell
'''
print("Focusing upload area button...")
dispatch(focus_button_script)
time.sleep(1.5)

# 3. Press Spacebar via daemon to trigger file chooser
press_space_command = '''
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 0.5
        key code 49 -- Spacebar
        delay 2.5
    end tell
end tell
'''
print("Pressing Spacebar via daemon...")
dispatch(press_space_command)

# 4. Input file path via daemon
file_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4"
picker_command = f'''
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
dispatch(picker_command)
print("Upload script execution finished.")
