import requests
import time
import subprocess

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

def run_applescript(script):
    res = dispatch(script)
    if res.get('status') == 'success' and 'result' in res:
        data = res['result'].get('data', {})
        return data.get('output', '')
    return ''

def execute_in_target_tab(js_code):
    # Escape single backslashes and double quotes for AppleScript literal string
    escaped_js = js_code.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')
    applescript_code = f'''
    tell application "Safari"
        activate
        repeat with w in windows
            repeat with t in tabs of w
                set u to URL of t
                if u contains "publish/post/199970858" or u contains "publish/posts/detail/199970858" then
                    set current tab of w to t
                    set index of w to 1
                    delay 0.5
                    set res to do JavaScript "{escaped_js}" in t
                    return res
                end if
            end repeat
        end repeat
        return "Target tab NOT found"
    end tell
    '''
    return run_applescript(applescript_code)

# 1. Close any open dialogs first
print("Clearing any open dialogs...")
escape_script = '''
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        key code 53 -- Escape
    end tell
end tell
'''
run_applescript(escape_script)
time.sleep(1)

# 2. Locate or navigate Safari tab
print("Locating Substack tab...")
activate_tab_applescript = '''
tell application "Safari"
    activate
    repeat with w in windows
        repeat with t in tabs of w
            set u to URL of t
            if u contains "publish/post/199970858" or u contains "publish/posts/detail/199970858" then
                set current tab of w to t
                set index of w to 1
                return u
            end if
        end repeat
    end repeat
    
    -- Fallback: navigate first substack tab found, or current tab of front window
    repeat with w in windows
        repeat with t in tabs of w
            if URL of t contains "substack.com" then
                set current tab of w to t
                set index of w to 1
                set URL of t to "https://borjamoskv.substack.com/publish/posts/detail/199970858?referrer=%2Fpublish%2Fhome"
                return "https://borjamoskv.substack.com/publish/posts/detail/199970858?referrer=%2Fpublish%2Fhome"
            end if
        end repeat
    end repeat
    
    set URL of current tab of front window to "https://borjamoskv.substack.com/publish/posts/detail/199970858?referrer=%2Fpublish%2Fhome"
    return "https://borjamoskv.substack.com/publish/posts/detail/199970858?referrer=%2Fpublish%2Fhome"
end tell
'''
u = run_applescript(activate_tab_applescript)
print("Target URL is:", u)

in_editor = "publish/post/199970858" in u

if in_editor:
    print("Already in editor mode. Skipping steps 3 and 4.")
else:
    print("On details page. Waiting 4 seconds for elements to settle...")
    time.sleep(4)
    
    # 3. Click Ellipsis to open menu
    print("Opening Ellipsis menu...")
    open_menu_js = '''
    (function() {
        let btn = null;
        const verPostBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.trim().toLowerCase() === 'ver post' || b.innerText.trim().toLowerCase() === 'view post' || b.innerText.trim().toLowerCase() === 'view' || b.innerText.trim().toLowerCase() === 'ver'));
        if (verPostBtn && verPostBtn.parentElement) {
            btn = verPostBtn.parentElement.querySelector("[aria-label='Ellipsis']") || verPostBtn.parentElement.querySelector('button:not(:first-child)');
        }
        if (!btn) {
            btn = document.querySelector("[aria-label='Ellipsis']");
        }
        if (btn) {
            btn.focus();
            btn.click();
            const spaceDown = new KeyboardEvent('keydown', { key: ' ', code: 'Space', keyCode: 32, bubbles: true });
            const spaceUp = new KeyboardEvent('keyup', { key: ' ', code: 'Space', keyCode: 32, bubbles: true });
            btn.dispatchEvent(spaceDown);
            btn.dispatchEvent(spaceUp);
            return 'Ellipsis menu keyboard triggered';
        }
        return 'Ellipsis button NOT found';
    })()
    '''
    res = execute_in_target_tab(open_menu_js)
    print("Open menu script result:", res)
    time.sleep(2)

    # 4. Click Editar from dropdown
    print("Clicking 'Editar' button...")
    click_edit_js = '''
    (function() {
        const items = Array.from(document.querySelectorAll("button, div, a, [role='menuitem']"));
        const editBtn = items.find(el => el.innerText && 
            (el.getAttribute('role') === 'menuitem' || el.tagName === 'BUTTON') && 
            (el.innerText.trim().toLowerCase() === 'editar' || el.innerText.trim().toLowerCase() === 'edit')
        ) || items.find(el => el.innerText && 
            (el.innerText.trim().toLowerCase() === 'editar' || el.innerText.trim().toLowerCase() === 'edit')
        );
        if (editBtn) {
            editBtn.click();
            return 'Clicked Editar/Edit button';
        }
        return 'Editar/Edit button NOT found in dropdown';
    })()
    '''
    res = execute_in_target_tab(click_edit_js)
    print("Click edit script result:", res)
    time.sleep(5)

# 5. Click the 'Insertar video' toolbar button inside the editor
print("Clicking toolbar 'Insertar video' button...")
click_toolbar_js = '''
(function() {
    // Focus editor first
    const editor = document.querySelector('.ProseMirror');
    if (editor) editor.focus();
    
    const btn = document.querySelector("[aria-label='Video']") || 
                document.querySelector("[title='Insertar video']") || 
                document.querySelector("[title='Insert video']") || 
                document.querySelector("[title='Video']") ||
                Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.toLowerCase().includes('video'));
    if (btn) {
        const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const mouseup = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
        const click = new MouseEvent('click', { bubbles: true, cancelable: true });
        btn.dispatchEvent(mousedown);
        btn.dispatchEvent(mouseup);
        btn.dispatchEvent(click);
        return 'Clicked toolbar button';
    }
    return 'Toolbar button NOT found';
})()
'''
res = execute_in_target_tab(click_toolbar_js)
print("Toolbar click result:", res)
time.sleep(3)

# 6. Focus the upload area button
print("Focusing upload area button...")
focus_button_js = '''
(function() {
    const buttons = Array.from(document.querySelectorAll("button, div, span"));
    const uploadBtn = buttons.find(b => b.innerText && (
        b.innerText.toLowerCase().includes('suelta tu') || 
        b.innerText.toLowerCase().includes('drag and drop') || 
        b.innerText.toLowerCase().includes('select a file') || 
        b.innerText.toLowerCase().includes('upload') ||
        b.innerText.toLowerCase().includes('archivo')
    ));
    if (uploadBtn) {
        uploadBtn.focus();
        return 'Focused upload button';
    }
    return 'Upload button NOT found';
})()
'''
res = execute_in_target_tab(focus_button_js)
print("Focus button result:", res)
time.sleep(1.5)

# 7. Press Spacebar via daemon to trigger file chooser
press_space_command = '''
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 0.5
        key code 49 -- Spacebar
        delay 2.5
    end tell
end tell
'''
print("Pressing Spacebar via daemon...")
res = run_applescript(press_space_command)
print("Press space result:", res)

# 8. Input file path via daemon
file_path = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out/El_Ultimo_Solo_de_Gon_Master_V3.mp4"
picker_command = f'''
tell application "System Events"
    tell process "Safari"
        set frontmost to true
        delay 1
        -- Command+Shift+G to open "Go to folder" sheet
        keystroke "g" using {{command down, shift down}}
        delay 2
        
        -- Type filepath
        keystroke "{file_path}"
        delay 2
        
        -- Confirm path
        key code 36
        delay 2
        
        -- Confirm file selection
        key code 36
    end tell
end tell
'''
print(f"Entering filepath via System Events: {file_path}...")
res = run_applescript(picker_command)
print("Picker command result:", res)
print("Complete automation run finished.")
