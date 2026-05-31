import pyautogui
import time
import subprocess

print("Activating Safari and focusing editor...")
subprocess.run(['osascript', '-e', '''
tell application "Safari"
    activate
    tell current tab of front window
        do JavaScript "
            var el = document.querySelector('.ProseMirror');
            if(el) {
                el.focus();
                
                // Go to end of document to append
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
'''])

time.sleep(1)

print("Typing /video...")
pyautogui.typewrite('/video')
time.sleep(1)
pyautogui.press('enter')

# Wait for file dialog to appear
time.sleep(2)

print("Navigating to file...")
# Cmd+Shift+G for "Go to folder"
pyautogui.hotkey('command', 'shift', 'g')
time.sleep(1)

# Type the absolute path
path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4"
pyautogui.typewrite(path)
time.sleep(1)

# Press Enter to go to the folder/file
pyautogui.press('enter')
time.sleep(1)

# Press Enter to confirm selection and start upload
pyautogui.press('enter')

print("Automation sequence complete. Video should be uploading.")
