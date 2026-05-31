import requests
import time
import subprocess

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

# 1. Focus the editor via Javascript
print("Focusing editor in Safari...")
subprocess.run(['osascript', '-e', '''
tell application "Safari"
    activate
    tell current tab of front window
        do JavaScript "
            (function() {
                var el = document.querySelector('.ProseMirror');
                if (el) {
                    el.focus();
                    
                    // Go to end of document
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return 'Focused and set cursor to end';
                }
                return 'Editor not found';
            })()
        "
    end tell
end tell
'''])

time.sleep(2)

# 2. Type /video and press enter using OMEGA daemon
type_video_command = '''
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 0.5
        keystroke "/video"
        delay 1
        key code 36 -- Return
        delay 2
    end tell
end tell
'''
print("Typing /video and pressing Return...")
dispatch(type_video_command)

# 3. Choose the file path in the native file picker
file_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4"
picker_command = f'''
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 1
        -- Command+Shift+G to open "Go to folder"
        keystroke "g" using {{command down, shift down}}
        delay 2
        
        -- Type path
        keystroke "{file_path}"
        delay 2
        
        -- Press Return to go to the folder
        key code 36
        delay 2
        
        -- Press Return to select the file
        key code 36
    end tell
end tell
'''
print(f"Entering filepath: {file_path}...")
dispatch(picker_command)
print("Keystroke automation complete.")
