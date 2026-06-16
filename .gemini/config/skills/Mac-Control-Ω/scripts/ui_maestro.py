#!/usr/bin/env python3
# C5-REAL: AXUIElement execution wrapper.

import json
import logging
import sys
import time
from collections import deque
from typing import Any

from ax_graph import AXGraph, _AX_AVAILABLE, _ax_get, kAXTitleAttribute, kAXIdentifierAttribute, kAXRoleAttribute, kAXPositionAttribute, kAXSizeAttribute, MAX_NODES

log = logging.getLogger("ui_maestro")

try:
    from ApplicationServices import (
        AXUIElementCopyActionNames,
        AXUIElementCreateApplication,
        AXUIElementPerformAction,
        kAXChildrenAttribute,
        kAXPressAction,
    )
except ImportError:
    pass

class UIMaestro:
    """Legacy Execution layer. Now stripped of traversal."""
    
    @staticmethod
    def click_element_with_quartz_fallback(
        app_name: str,
        target_title: str = None,
        target_id: str = None,
        target_role: str = None
    ) -> dict:
        if not _AX_AVAILABLE: return {"error": "pyobjc unavailable"}
        pid = AXGraph.get_pid_for_app(app_name)
        if pid == -1: return {"error": f"App '{app_name}' missing"}

        app_ref = AXUIElementCreateApplication(pid)
        queue = deque([app_ref])
        visited = 0

        while queue and visited < MAX_NODES:
            element = queue.popleft()
            visited += 1

            match = True
            if target_role:
                role, ok = _ax_get(element, kAXRoleAttribute)
                if not (ok and str(role) == target_role): match = False
            if match and target_id:
                ident, ok = _ax_get(element, kAXIdentifierAttribute)
                if not (ok and str(ident) == target_id): match = False
            if match and target_title:
                title, ok = _ax_get(element, kAXTitleAttribute)
                if not (ok and str(title) == target_title): match = False

            if match and element != app_ref:
                try:
                    err, actions = AXUIElementCopyActionNames(element, None)
                    if err == 0 and actions and kAXPressAction in actions:
                        action_err = AXUIElementPerformAction(element, kAXPressAction)
                        if action_err == 0:
                            return {"app": app_name, "clicked": True, "mode": "accessibility", "visited": visited}
                except Exception as e:
                    log.warning("Accessibility click failed, falling back: %s", e)

                pos, ok_pos = _ax_get(element, kAXPositionAttribute)
                size, ok_size = _ax_get(element, kAXSizeAttribute)
                if ok_pos and ok_size and pos and size:
                    try:
                        x, y = float(pos.x), float(pos.y)
                    except AttributeError:
                        x, y = float(pos[0]), float(pos[1])
                    try:
                        w, h = float(size.width), float(size.height)
                    except AttributeError:
                        w, h = float(size[0]), float(size[1])

                    cx = int(x + w / 2)
                    cy = int(y + h / 2)

                    try:
                        from physical_maestro import PhysicalMaestro
                        pm = PhysicalMaestro()
                        pm.click(cx, cy)
                        return {"app": app_name, "clicked": True, "mode": "quartz_fallback", "coordinates": {"x": cx, "y": cy}, "visited": visited}
                    except Exception as e:
                        return {"app": app_name, "clicked": False, "error": f"Quartz injection failed: {e}", "visited": visited}

            children, ok = _ax_get(element, kAXChildrenAttribute)
            if ok and children:
                for child in children: queue.append(child)

        return {"app": app_name, "clicked": False, "error": "Element not found", "visited": visited}

    @staticmethod
    def type_text_with_quartz_fallback(
        app_name: str,
        text: str,
        target_title: str = None,
        target_id: str = None,
        target_role: str = None
    ) -> dict:
        if not _AX_AVAILABLE: return {"error": "pyobjc unavailable"}
        pid = AXGraph.get_pid_for_app(app_name)
        if pid == -1: return {"error": f"App '{app_name}' missing"}

        click_res = UIMaestro.click_element_with_quartz_fallback(app_name, target_title, target_id, target_role)
        if not click_res.get("clicked"):
            return {"app": app_name, "typed": False, "error": f"Focus click failed: {click_res.get('error')}"}

        try:
            from physical_maestro import PhysicalMaestro
            pm = PhysicalMaestro()
            time.sleep(0.1)
            pm.type_string(text)
            return {"app": app_name, "typed": True, "text": text, "focus_click": click_res}
        except Exception as e:
            return {"app": app_name, "typed": False, "error": f"Keystroke injection failed: {e}", "focus_click": click_res}
