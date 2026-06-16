#!/usr/bin/env python3
# C5-REAL
import sys
import os
import time
import subprocess
import json
import logging
from datetime import datetime

# Configure logging
log_path = "/tmp/docker_tile_sentinel.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_path),
        logging.StreamHandler(sys.stdout)
    ]
)
log = logging.getLogger("docker_tile_sentinel")

# Candidates for IDE and Browser
IDE_CANDIDATES = ["Cursor", "Code", "VS Code", "VSCodium", "Antigravity", "Xcode"]
BROWSER_CANDIDATES = ["Brave Browser", "Google Chrome", "Arc", "Safari", "Firefox"]

def run_cmd(cmd_list, timeout=10, stdin_data=None):
    try:
        r = subprocess.run(
            cmd_list, capture_output=True, text=True,
            timeout=timeout, input=stdin_data,
        )
        return r.stdout.strip()
    except Exception as e:
        return f"ERROR: {e}"

def osa(script):
    return run_cmd(["osascript"], timeout=15, stdin_data=script)

def get_visible_apps():
    script = 'tell application "System Events" to get name of every application process whose visible is true'
    out = osa(script)
    if "ERROR" in out or not out:
        return []
    return [app.strip() for app in out.split(",") if app.strip()]

def get_docker_container_count():
    # Attempt to query docker. Handle connection errors gracefully.
    out = run_cmd(["docker", "ps", "--format", "{{json .}}"])
    if "ERROR" in out or "error" in out.lower() or "failed" in out.lower():
        return 0
    lines = [line for line in out.splitlines() if line.strip()]
    return len(lines)

def tile_windows():
    apps = get_visible_apps()
    log.info(f"Visible applications detected: {apps}")
    
    ide_app = None
    browser_app = None
    
    for candidate in IDE_CANDIDATES:
        if candidate in apps:
            ide_app = candidate
            break
            
    for candidate in BROWSER_CANDIDATES:
        if candidate in apps:
            browser_app = candidate
            break
            
    if not ide_app or not browser_app:
        log.warning(f"Could not find both IDE and Browser. Detected IDE: {ide_app}, Browser: {browser_app}")
        return False
        
    log.info(f"Tiling IDE '{ide_app}' and Browser '{browser_app}'...")
    
    # Get desktop bounds
    bounds_str = osa('tell application "Finder" to get bounds of window of desktop')
    if "ERROR" in bounds_str or not bounds_str:
        log.error("Failed to get desktop bounds via Finder")
        return False
        
    try:
        parts = [int(p.strip()) for p in bounds_str.split(",")]
        screen_w = parts[2]
        screen_h = parts[3]
    except Exception as e:
        log.error(f"Failed to parse desktop bounds '{bounds_str}': {e}")
        return False
        
    half_w = screen_w // 2
    
    # AppleScript to set bounds and activate
    script = f'''
    tell application "{ide_app}" to activate
    delay 0.2
    tell application "System Events"
        tell process "{ide_app}"
            try
                set bounds of window 1 to {{0, 25, {half_w}, {screen_h}}}
            end try
        end tell
    end tell
    
    tell application "{browser_app}" to activate
    delay 0.2
    tell application "System Events"
        tell process "{browser_app}"
            try
                set bounds of window 1 to {{{half_w}, 25, {screen_w}, {screen_h}}}
            end try
        end tell
    end tell
    '''
    
    # Try setting bounds via standard application tell first
    fallback_script = f'''
    tell application "{ide_app}"
        activate
        try
            set bounds of front window to {{0, 25, {half_w}, {screen_h}}}
        end try
    end tell
    tell application "{browser_app}"
        activate
        try
            set bounds of front window to {{{half_w}, 25, {screen_w}, {screen_h}}}
        end try
    end tell
    '''
    
    res = osa(fallback_script)
    log.info(f"Tiling completed. Result: {res}")
    return True

def main():
    log.info("Docker Tile Sentinel daemon started.")
    has_running_containers = False
    
    # If starting up and containers are already running, we might want to tile immediately,
    # or wait for transition. Let's inspect initial count.
    initial_count = get_docker_container_count()
    log.info(f"Initial active container count: {initial_count}")
    if initial_count > 0:
        has_running_containers = True
        log.info("Containers running at startup. Triggering initial tiling.")
        tile_windows()
        
    while True:
        try:
            count = get_docker_container_count()
            if count > 0 and not has_running_containers:
                log.info(f"Docker stack spin-up detected ({count} containers running). Triggering tiling.")
                tile_windows()
                has_running_containers = True
            elif count == 0 and has_running_containers:
                log.info("Docker containers stopped. Resetting state.")
                has_running_containers = False
        except Exception as e:
            log.error(f"Error in main loop: {e}")
            
        time.sleep(3)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ["--tile", "-t"]:
        print("Manually triggering tiling...")
        tile_windows()
    else:
        main()
