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
    print(r.json())
    return r.json()

# 1. Focus Safari and click "Insertar video" button
click_video_script = '''
tell application "Safari"
    activate
    delay 1
    tell current tab of front window
        do JavaScript "
            (function() {
                // First close any collaborator dialogs that might be open
                const closeBtn = document.querySelector('[aria-label=\\\"close\\\"], [title=\\\"Close\\\"]');
                if (closeBtn) closeBtn.click();
                
                const videoBtn = document.querySelector('[aria-label=\\\"Video\\\"]') || document.querySelector('[title=\\\"Insertar video\\\"]');
                if (videoBtn) {
                    videoBtn.click();
                    return 'Clicked video button';
                }
                return 'Video button not found';
            })()
        "
    end tell
end tell
'''
print("Clicking Video button in Safari...")
dispatch(click_video_script)
time.sleep(3) # Wait for file picker dialog to appear

# 2. Input file path in picker using OMEGA daemon
file_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4"
picker_script = f'''
tell application "System Events"
    -- Command+Shift+G to open "Go to folder" sheet
    keystroke "g" using {{command down, shift down}}
    delay 1.5
    
    -- Type filepath
    keystroke "{file_path}"
    delay 1.5
    
    -- Confirm path
    key code 36
    delay 1.5
    
    -- Confirm file selection
    key code 36
end tell
'''
print(f"Selecting video file: {file_path}...")
dispatch(picker_script)
print("Automation dispatched successfully.")
