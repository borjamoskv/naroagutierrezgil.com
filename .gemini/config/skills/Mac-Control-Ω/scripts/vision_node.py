#!/usr/bin/env python3
# C5-REAL
"""Vision Node."""
import base64
import json
import logging
import os
import subprocess
import sys
import urllib.error
import urllib.request

log = logging.getLogger("vision_node")

OLLAMA_API = "http://localhost:11434"
VLM_CANDIDATES = [
    "llava", "moondream", "minicpm-v",
    "qwen-vl", "bakllava", "llava-llama3", "cogvlm",
]
DEFAULT_TIMEOUT = 10


class VisionNode:
    _cached_model: str = None

    @classmethod
    def _detect_vlm(cls) -> str:
        if env_model := os.environ.get("OMEGA_VLM_MODEL"): return env_model
        if cls._cached_model: return cls._cached_model

        try:
            req = urllib.request.Request(f"{OLLAMA_API}/api/tags")
            with urllib.request.urlopen(req, timeout=5) as resp:
                available = [m["name"].split(":")[0] for m in json.loads(resp.read().decode("utf-8")).get("models", [])]
                for candidate in VLM_CANDIDATES:
                    if candidate in available:
                        cls._cached_model = candidate
                        log.info("VLM auto-detected: %s", candidate)
                        return candidate
                for m in available:
                    if "v" in m.lower() or "vision" in m.lower():
                        cls._cached_model = m
                        return m
        except Exception as e:
            log.warning("Ollama unreachable for VLM detection: %s", e)

        cls._cached_model = "llava"
        return cls._cached_model

    @staticmethod
    def _capture_screenshot(
        path: str, max_width: int = 1280
    ) -> bool:
        subprocess.run(
            ["screencapture", "-x", "-t", "jpg", path],
            capture_output=True,
            timeout=10,
        )
        if not os.path.exists(path):
            return False
        if os.path.getsize(path) > 1_000_000:
            subprocess.run(
                ["sips", "--resampleWidth", str(max_width), path, "--out", path],
                capture_output=True, timeout=10,
            )
        return True

    @classmethod
    def analyze_screen(cls, prompt: str) -> dict:
        model = cls._detect_vlm()
        img_path = "/tmp/vision_screenshot.jpg"

        if not cls._capture_screenshot(img_path):
            return {"error": "Failed to take screenshot."}

        try:
            with open(img_path, "rb") as f:
                b64_img = base64.b64encode(f.read()).decode("utf-8")
        except FileNotFoundError:
            return {"error": "Screenshot file not found."}

        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "images": [b64_img],
        }

        req = urllib.request.Request(
            f"{OLLAMA_API}/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )

        timeout = int(
            os.environ.get("OMEGA_VLM_TIMEOUT", DEFAULT_TIMEOUT)
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                res = json.loads(r.read().decode("utf-8"))
                eval_ns = res.get("eval_duration", 0)
                return {
                    "model": model,
                    "prompt": prompt,
                    "analysis": res.get("response", ""),
                    "eval_duration_ms": eval_ns // 1_000_000,
                }
        except urllib.error.URLError as e:
            return {"error": f"Ollama unreachable: {e}"}
        except Exception as e:
            return {"error": f"VLM failed ({model}): {e}"}


if __name__ == "__main__":
    if len(sys.argv) > 1:
        result = VisionNode.analyze_screen(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print(f"Detected VLM: {VisionNode._detect_vlm()}")
        print("Usage: vision_node.py 'Prompt'")
