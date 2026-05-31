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
tell application "Safari"
    activate
    do JavaScript "
        (function() {
            window.menuLog = [];
            try {
                const buttons = Array.from(document.querySelectorAll('button'));
                window.menuLog.push('Total buttons: ' + buttons.length);
                
                const verPostBtn = buttons.find(b => b.innerText && (b.innerText.toLowerCase().includes('ver post') || b.innerText.toLowerCase().includes('view post')));
                if (!verPostBtn) {
                    window.menuLog.push('Ver Post button not found. Available buttons: ' + buttons.map(b => b.innerText).filter(Boolean).slice(0, 10).join(', '));
                    return;
                }
                window.menuLog.push('Found Ver Post button');
                
                const parent = verPostBtn.parentElement;
                const btn = Array.from(parent.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Ellipsis');
                if (!btn) {
                    window.menuLog.push('Ellipsis button not found next to Ver Post');
                    return;
                }
                window.menuLog.push('Found Ellipsis button');
                
                btn.focus();
                const spaceDown = new KeyboardEvent('keydown', { key: ' ', code: 'Space', keyCode: 32, bubbles: true });
                const spaceUp = new KeyboardEvent('keyup', { key: ' ', code: 'Space', keyCode: 32, bubbles: true });
                btn.dispatchEvent(spaceDown);
                btn.dispatchEvent(spaceUp);
                window.menuLog.push('Dispatched Space key events');
            } catch(e) {
                window.menuLog.push('Error: ' + e.toString());
            }
        })()
    " in current tab of front window
    delay 2
    return (do JavaScript "JSON.stringify(window.menuLog)" in current tab of front window)
end tell
'''

print("Running test menu script...")
dispatch(script)
