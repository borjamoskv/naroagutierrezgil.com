import subprocess
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

master_file = "/Users/borjafernandezangulo/.gemini/antigravity/brain/4ee597a2-c623-4d14-95c7-1facb56eebf5/la_edad_de_la_friccion_master.md"
with open(master_file, "r", encoding="utf-8") as f:
    text = f.read()

p = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
p.communicate(input=text.encode('utf-8'))
print("Copied master text to clipboard.")

injection_script = '''
tell application "Safari"
    activate
    tell window 1
        set current tab to tab 2
    end tell
    delay 0.5
    do JavaScript "
        (function() {
            var editor = document.querySelector('div[contenteditable=true]');
            if (editor) {
                editor.focus();
                return 'Focused editor';
            }
            return 'Editor not found';
        })()
    " in tab 2 of window 1
end tell

tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 1
        keystroke "a" using {command down}
        delay 1
        key code 51 -- Delete
        delay 1
        keystroke "v" using {command down}
        delay 5
    end tell
end tell

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

print("Injecting text via Cmd+V and clicking video upload...")
dispatch(injection_script)
time.sleep(3)

file_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4"
picker_command = f'''
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 1
        keystroke "g" using {{command down, shift down}}
        delay 2.5
        keystroke "{file_path}"
        delay 2.5
        key code 36
        delay 2.5
        key code 36
    end tell
end tell
'''
print("Uploading Video...")
dispatch(picker_command)

# Click Publish button
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
print("Done. Post should have full text and video.")
