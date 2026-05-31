import subprocess
import json

script = '''
tell application "Safari"
    set outText to ""
    repeat with w in windows
        repeat with t in tabs of w
            set u to URL of t
            if u contains "substack.com/publish/post" or u contains "substack" then
                set res to do JavaScript "
                    (function() {
                        try {
                            var text = document.body.innerText || document.body.textContent;
                            return JSON.stringify({
                                url: window.location.href,
                                body_length: text.length,
                                ends_with_arquitecto: text.includes('EDITAR ARQUITECTO'),
                                contains_friccion: text.includes('fricción'),
                                snippet: text.substring(Math.max(0, text.length - 200))
                            });
                        } catch(e) {
                            return JSON.stringify({error: e.toString()});
                        }
                    })()
                " in t
                set outText to outText & res & "\n"
            end if
        end repeat
    end repeat
    return outText
end tell
'''

p = subprocess.Popen(['osascript', '-e', script], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
out, err = p.communicate()
if err:
    print("Error:", err.decode('utf-8'))
if out:
    print("Result:", out.decode('utf-8'))
