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

# 1. Switch Safari to Tab 2 and make sure it is frontmost, and click the hidden file input
click_input_script = '''
tell application "Safari"
    activate
    tell window 1
        set current tab to tab 2
    end tell
end tell
tell application "System Events"
    tell process "Safari"
        set frontmost to true
    end tell
end tell
delay 1
tell application "Safari"
    do JavaScript "
        (function() {
            var inp = document.querySelector('.video-editor input[type=file]');
            if (inp) {
                inp.click();
                return 'Clicked file input';
            }
            return 'File input NOT found';
        })()
    " in tab 2 of window 1
end tell
'''

print("Activating Safari Tab 2 and clicking file input...")
dispatch(click_input_script)
time.sleep(3)

# 2. Enter file path using System Events
file_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4"
picker_command = f'''
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 1
        -- Command+Shift+G to open "Go to folder" sheet
        keystroke "g" using {{command down, shift down}}
        delay 2.5
        
        -- Type filepath
        keystroke "{file_path}"
        delay 2.5
        
        -- Confirm path
        key code 36 -- Enter
        delay 2.5
        
        -- Confirm file selection
        key code 36 -- Enter
    end tell
end tell
'''
print(f"Entering filepath via System Events: {file_path}...")
dispatch(picker_command)
print("Upload script execution finished.")
