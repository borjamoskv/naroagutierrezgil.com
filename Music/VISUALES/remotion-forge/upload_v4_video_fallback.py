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

# The previous script successfully injected the text but failed to find the file input.
# The class in Substack's draft editor for the video upload is likely different now,
# or obscured by Pencraft shadow-dom.
# Let's revert to the reliable GUI scripting method that worked in `upload_direct2.py`.

click_video_script = '''
tell application "Safari"
    activate
    tell window 1
        set current tab to tab 2
    end tell
end tell
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 1
        -- To open the insert menu in Substack editor, type "Cmd+/" or just click the insert video.
        -- But since we don't know the exact DOM node, we'll brute-force the UI interaction
        -- or rely on the known method that worked in upload_direct2.
    end tell
end tell
'''

# We will use the identical DOM query that WORKED previously in upload_direct2.py
click_input_script = '''
tell application "Safari"
    activate
    tell window 1
        set current tab to tab 2
    end tell
    do JavaScript "
        (function() {
            var inp = document.querySelector('.video-editor input[type=file]');
            if (!inp) inp = document.querySelector('input[type=file][accept*=\\'video\\']');
            if (!inp) inp = document.querySelector('input[type=file]');
            
            if (inp) {
                inp.click();
                return 'Clicked file input';
            }
            return 'File input NOT found';
        })()
    " in tab 2 of window 1
end tell
'''

print("Activating Safari Tab 2 and clicking file input (fallback selectors)...")
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

publish_script = '''
tell application "Safari"
    do JavaScript "
        (function() {
            var buttons = Array.from(document.querySelectorAll('button'));
            var pub = buttons.find(b => b.textContent.includes('Continue') || b.textContent.includes('Publish'));
            if (pub) {
                pub.focus();
                return 'Focused publish button';
            }
            return 'Publish button not found';
        })()
    " in tab 2 of window 1
end tell
tell application "System Events"
    tell process "Safari"
        delay 1
        key code 36 -- Enter
    end tell
end tell
'''
print("Clicking Publish/Continue...")
dispatch(publish_script)
print("Upload script execution finished.")
