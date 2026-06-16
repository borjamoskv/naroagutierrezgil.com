from __future__ import annotations

import logging
from collections import deque
from typing import Any

log = logging.getLogger("ax_graph")
MAX_NODES = 10_000

try:
    from ApplicationServices import (
        AXUIElementCopyActionNames,
        AXUIElementCopyAttributeValue,
        AXUIElementCreateApplication,
        kAXChildrenAttribute,
        kAXDescriptionAttribute,
        kAXRoleAttribute,
        kAXTitleAttribute,
        kAXValueAttribute,
        kAXPositionAttribute,
        kAXSizeAttribute,
    )
    from AppKit import NSWorkspace
    _AX_AVAILABLE = True
except ImportError:
    _AX_AVAILABLE = False

try:
    from ApplicationServices import kAXIdentifierAttribute
except ImportError:
    kAXIdentifierAttribute = "AXIdentifier"

def _ax_get(element: Any, attr: str) -> tuple[Any, bool]:
    try:
        err, val = AXUIElementCopyAttributeValue(element, attr, None)
        if err == 0 and val is not None:
            return val, True
    except Exception:
        pass
    return None, False


class AXGraph:
    """
    Read-only macOS Accessibility UI Tree traversal and node mapping.
    """
    @staticmethod
    def get_pid_for_app(app_name: str) -> int:
        if not _AX_AVAILABLE: return -1
        workspace = NSWorkspace.sharedWorkspace()
        for app in workspace.runningApplications():
            if app.localizedName() == app_name:
                return app.processIdentifier()
        return -1

    @staticmethod
    def build_node(element: Any) -> dict[str, Any]:
        node = {}
        role, ok = _ax_get(element, kAXRoleAttribute)
        if ok: node["role"] = str(role)

        title, ok = _ax_get(element, kAXTitleAttribute)
        if ok and title: node["title"] = str(title)

        desc, ok = _ax_get(element, kAXDescriptionAttribute)
        if ok and desc: node["description"] = str(desc)

        value, ok = _ax_get(element, kAXValueAttribute)
        if ok and value is not None: node["value"] = str(value)[:200]

        ident, ok = _ax_get(element, kAXIdentifierAttribute)
        if ok and ident: node["identifier"] = str(ident)

        pos, ok = _ax_get(element, kAXPositionAttribute)
        if ok and pos:
            try:
                node["x"] = float(pos.x)
                node["y"] = float(pos.y)
            except AttributeError:
                try:
                    node["x"], node["y"] = float(pos[0]), float(pos[1])
                except Exception:
                    pass
            except Exception:
                pass

        size, ok = _ax_get(element, kAXSizeAttribute)
        if ok and size:
            try:
                node["width"] = float(size.width)
                node["height"] = float(size.height)
            except AttributeError:
                try:
                    node["width"], node["height"] = float(size[0]), float(size[1])
                except Exception:
                    pass
            except Exception:
                pass

        try:
            err, actions = AXUIElementCopyActionNames(element, None)
            if err == 0 and actions: node["actions"] = list(actions)
        except Exception:
            pass
        return node

    @staticmethod
    def dump(app_name: str, max_depth: int = 5) -> dict[str, Any]:
        if not _AX_AVAILABLE: return {"error": "pyobjc unavailable"}
        pid = AXGraph.get_pid_for_app(app_name)
        if pid == -1: return {"error": f"App '{app_name}' missing"}

        app_ref = AXUIElementCreateApplication(pid)
        root_node = AXGraph.build_node(app_ref)
        node_count = 1
        stack = deque()

        children, ok = _ax_get(app_ref, kAXChildrenAttribute)
        if ok and children:
            for child in reversed(children):
                stack.append((child, root_node, 1))

        while stack and node_count < MAX_NODES:
            element, parent, depth = stack.pop()
            child_node = AXGraph.build_node(element)
            node_count += 1

            if "children" not in parent: parent["children"] = []
            parent["children"].append(child_node)

            if depth < max_depth:
                sub_children, ok = _ax_get(element, kAXChildrenAttribute)
                if ok and sub_children:
                    for sub in reversed(sub_children):
                        stack.append((sub, child_node, depth + 1))

        return {"app": app_name, "pid": pid, "node_count": node_count, "truncated": node_count >= MAX_NODES, "tree": root_node}

    @staticmethod
    def find_role(app_name: str, role: str, limit: int = 50) -> dict[str, Any]:
        if not _AX_AVAILABLE: return {"error": "pyobjc unavailable"}
        pid = AXGraph.get_pid_for_app(app_name)
        if pid == -1: return {"error": f"App '{app_name}' missing"}

        app_ref = AXUIElementCreateApplication(pid)
        queue = deque([app_ref])
        matches = []
        visited = 0

        while queue and visited < MAX_NODES and len(matches) < limit:
            element = queue.popleft()
            visited += 1

            elem_role, ok = _ax_get(element, kAXRoleAttribute)
            if ok and str(elem_role) == role:
                matches.append(AXGraph.build_node(element))

            children, ok = _ax_get(element, kAXChildrenAttribute)
            if ok and children:
                for child in children: queue.append(child)

        return {"app": app_name, "role": role, "matches": matches, "count": len(matches)}

    @staticmethod
    def scan(app_name: str, limit: int = 100) -> dict[str, Any]:
        if not _AX_AVAILABLE: return {"error": "pyobjc unavailable"}
        pid = AXGraph.get_pid_for_app(app_name)
        if pid == -1: return {"error": f"App '{app_name}' missing"}

        app_ref = AXUIElementCreateApplication(pid)
        queue = deque([app_ref])
        interactive_roles = {"AXButton", "AXLink", "AXTextField", "AXTextArea", "AXCheckBox", "AXPopUpButton", "AXRadioButton", "AXMenuItem"}
        elements = []
        visited = 0

        while queue and visited < MAX_NODES and len(elements) < limit:
            element = queue.popleft()
            visited += 1

            role, ok = _ax_get(element, kAXRoleAttribute)
            if ok and str(role) in interactive_roles:
                node = AXGraph.build_node(element)
                slim_node = {
                    "r": node.get("role", "?"), "t": node.get("title", ""),
                    "v": node.get("value", "")[:50], "i": node.get("identifier", ""),
                    "x": node.get("x"), "y": node.get("y"),
                    "w": node.get("width"), "h": node.get("height"),
                }
                if slim_node["t"] or slim_node["v"] or slim_node["i"]:
                    elements.append(slim_node)

            children, ok = _ax_get(element, kAXChildrenAttribute)
            if ok and children:
                for child in children: queue.append(child)

        return {"app": app_name, "elements": elements, "count": len(elements), "visited": visited}
