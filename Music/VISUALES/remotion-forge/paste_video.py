import pyautogui
import time
import subprocess

print("Setting clipboard...")
subprocess.run(['osascript', '-e', 'set the clipboard to (POSIX file "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4")'])

print("Activating Safari and focusing editor...")
subprocess.run(['osascript', '-e', '''
tell application "Safari"
    activate
    tell current tab of front window
        do JavaScript "
            var el = document.querySelector('.ProseMirror');
            if(el) {
                el.focus();
                // If it's empty, maybe click it
                el.click();
            }
        "
    end tell
end tell
'''])

time.sleep(2)
print("Sending Cmd+V...")
pyautogui.hotkey('command', 'v')
print("Done!")
