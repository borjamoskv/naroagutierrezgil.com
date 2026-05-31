import subprocess
import time

def run_applescript(script):
    print(f"Running AppleScript...")
    res = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error: {res.stderr}")
    return res.stdout.strip()

# 1. Activate Safari and focus editor
focus_script = '''
tell application "Safari"
    activate
    delay 1
    tell current tab of front window
        do JavaScript "
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
            }
        "
    end tell
end tell
'''
print("Activating Safari and focusing editor...")
run_applescript(focus_script)
time.sleep(1)

# 2. Type /video and press enter
type_script = '''
tell application "System Events"
    keystroke "/video"
    delay 1
    key code 36 -- Return key
end tell
'''
print("Typing /video...")
run_applescript(type_script)
time.sleep(3) # Wait for file dialog to appear

# 3. Enter file path in the file picker dialog
file_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4"
picker_script = f'''
tell application "System Events"
    -- Open "Go to Folder" panel
    keystroke "g" using {{command down, shift down}}
    delay 1.5
    
    -- Input path
    keystroke "{file_path}"
    delay 1.5
    
    -- Press Enter to confirm path
    key code 36
    delay 1.5
    
    -- Press Enter to confirm file selection
    key code 36
end tell
'''
print(f"Selecting video file: {file_path}...")
run_applescript(picker_script)

print("Automation script finished. Monitor upload status in Safari.")
