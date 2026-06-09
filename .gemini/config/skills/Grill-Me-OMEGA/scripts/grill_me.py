# C5-REAL
# Claim: GRILL_ME_OMEGA_DIAGNOSTIC_ENGINE_LOADED
# Proof: { Base: C5-REAL, Range: [1,1], Confidence: C5 }

import os
import json
import yaml
import sys
from pathlib import Path

class GrillMeOmegaEngine:
    def __init__(self, workspace_path: str):
        self.workspace = Path(workspace_path).resolve()

    def run_diagnostics(self) -> dict:
        pkg_json_path = self.workspace / "package.json"
        dependencies = {}
        scripts = {}
        if pkg_json_path.exists():
            try:
                data = json.loads(pkg_json_path.read_text(encoding="utf-8"))
                dependencies = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                scripts = data.get("scripts", {})
            except Exception as e:
                dependencies = {"error": f"Failed to parse package.json: {e}"}

        # Check Cortex Linters
        cortex_dir = self.workspace / "CORTEX"
        linters = []
        if cortex_dir.is_dir():
            linters = [p.name for p in cortex_dir.glob("*_linter.py")]

        # Check Astro/Frameworks Config
        configs = []
        for name in ["astro.config.mjs", "astro.config.ts", "wrangler.json", "vercel.json", "tsconfig.json"]:
            if (self.workspace / name).exists():
                configs.append(name)

        # Build Design Tree Base State
        framework = "Unknown"
        if "astro" in dependencies:
            framework = f"Astro ({dependencies['astro']})"
        elif "next" in dependencies:
            framework = f"Next.js ({dependencies['next']})"
        elif "react" in dependencies:
            framework = "React SPA"

        css_framework = "Vanilla CSS"
        if "tailwindcss" in dependencies:
            css_framework = f"Tailwind CSS ({dependencies['tailwindcss']})"

        return {
            "workspace_status": "ONLINE",
            "framework": framework,
            "styling": css_framework,
            "active_configs": configs,
            "cortex_linters": linters,
            "scripts": list(scripts.keys())
        }

    def execute(self, payload: dict) -> dict:
        workspace_path = payload.get("workspace_path", ".")
        diagnostics = self.run_diagnostics()
        
        # Build Design Tree representation
        tree = {
            "DESIGN_TREE_STATUS": "INITIALIZED",
            "RESOLVED": {
                "Framework": diagnostics["framework"],
                "Styling": diagnostics["styling"],
                "Configuration Files": diagnostics["active_configs"],
                "Cortex Guard Linters": diagnostics["cortex_linters"]
            },
            "PROPOSED": {
                "Runtime": "Vesicular-Runtime-Omega (Escrow-based)",
                "Architecture": "Server-Side Rendering (SSR) via Astro Cloudflare/Vercel",
                "Linter Integration": "JIT validation via CORTEX linters before commit"
            },
            "UNRESOLVED": {
                "Database / State persistence": "Pending user choice",
                "Interaction Model": "Chatquito / Voice Effects Pipeline setup"
            }
        }
        
        return {
            "status": "C5-REAL_SUCCESS",
            "diagnostics": diagnostics,
            "design_tree": tree
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        path = sys.argv[1]
    else:
        path = "."
    engine = GrillMeOmegaEngine(path)
    result = engine.execute({"workspace_path": path})
    print(yaml.dump(result, default_flow_style=False, sort_keys=False))
