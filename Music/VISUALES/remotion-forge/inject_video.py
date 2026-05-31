import subprocess
import time

def run_js(js):
    cmd = ['osascript', '-e', f'''
    tell application "Safari"
        do JavaScript "{js}" in current tab of front window
    end tell
    ''']
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip()

print("Injecting video node...")
out = run_js("""
    var editorEl = document.querySelector('.ProseMirror');
    if (editorEl && editorEl.editor) {
        var editor = editorEl.editor;
        
        // Go to end of doc
        editor.commands.focus('end');
        
        // Insert video
        editor.commands.insertContent({
            type: 'video',
            attrs: {
                mediaUploadId: '2c8c93df-d088-48dd-9b50-a1a0724d0543',
                duration: 180.14267
            }
        });
        
        // Insert a space to trigger dirty state
        editor.commands.insertText(' ');
        
        return 'Injected';
    } else {
        return 'Editor not found';
    }
""")
print(out)

time.sleep(2)

print("Clicking Actualizar/Publish...")
out = run_js("""
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.toLowerCase().includes('actualizar') || b.textContent.toLowerCase().includes('update') || b.textContent.toLowerCase().includes('publish') || b.textContent.toLowerCase().includes('continue'));
    if(btn) {
        btn.click();
        return 'Clicked ' + btn.textContent;
    }
    return 'Button not found';
""")
print(out)

time.sleep(3)

print("Clicking confirm Actualizar ahora...")
out = run_js("""
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.toLowerCase().includes('actualiza ahora') || b.textContent.toLowerCase().includes('send') || b.textContent.toLowerCase().includes('actualizar a todos'));
    if(btn) {
        btn.click();
        return 'Clicked ' + btn.textContent;
    }
    return 'Confirm button not found';
""")
print(out)

