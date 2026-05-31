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

script = '''
set the clipboard to (POSIX file "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4")
tell application "Safari"
    activate
    tell current tab of front window
        do JavaScript "
            (function() {
                var el = document.querySelector('.ProseMirror');
                if(el) {
                    el.focus();
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return 'Focused';
                }
                return 'Not found';
            })()
        "
    end tell
end tell
delay 1.5
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        keystroke "v" using {command down}
    end tell
end tell
'''

print("Running paste automation via OMEGA daemon...")
dispatch(script)
print("Done.")
