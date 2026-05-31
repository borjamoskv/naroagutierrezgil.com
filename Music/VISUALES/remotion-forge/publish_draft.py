import subprocess
import time

def run_js(js):
    cmd = ['osascript', '-e', f'''
    tell application "Safari"
        do JavaScript "{js}" in current tab of front window
    end tell
    ''']
    subprocess.run(cmd)

print("Clicking Actualizar...")
run_js("""
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.toLowerCase().includes('actualizar') || b.textContent.toLowerCase().includes('update') || b.textContent.toLowerCase().includes('publish'));
    if(btn) btn.click();
""")

time.sleep(3)

print("Clicking confirm Actualizar ahora...")
run_js("""
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.toLowerCase().includes('actualiza ahora') || b.textContent.toLowerCase().includes('send') || b.textContent.toLowerCase().includes('actualizar a todos'));
    if(btn) btn.click();
""")

print("Done")
