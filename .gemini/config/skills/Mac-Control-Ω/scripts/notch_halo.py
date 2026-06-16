#!/usr/bin/env python3
# [C5-REAL]
# Profile Specs:
# ghost: Yellow pulse | neutron: Blue-white flash | void: Crimson-black rift
# aurora: Spectrum cycle | heartbeat: Red/pink pulse | cyber: Cyan-magenta flicker | industrial: #2B3BE5/#0A0A0A rhythmic pulse

import argparse, sys, random, time, threading
import objc
from Foundation import NSObject

try:
    objc.loadBundle('AVFoundation', bundle_path='/System/Library/Frameworks/AVFoundation.framework', module_globals=globals())
    objc.loadBundle('AppKit', bundle_path='/System/Library/Frameworks/AppKit.framework', module_globals=globals())
    objc.loadBundle('WebKit', bundle_path='/System/Library/Frameworks/WebKit.framework', module_globals=globals())
except Exception as e:
    print(f"[-] Native framework import failure: {e}", file=sys.stderr)

from AppKit import (
    NSApplication, NSWindow, NSScreen, NSMakeRect, NSWindowStyleMaskBorderless,
    NSBackingStoreBuffered, NSColor, NSApplicationActivationPolicyAccessory,
    NSWindowCollectionBehaviorCanJoinAllSpaces, NSWindowCollectionBehaviorFullScreenAuxiliary,
    NSStatusWindowLevel, NSTimer
)
from WebKit import WKWebView, WKWebViewConfiguration

PROFILES = {
    "ghost": {"color1": "#FFD700", "color2": "#FFA500", "glow": "rgba(255,165,0,0.8)", "glow_sec": "rgba(255,215,0,0.3)", "anim": "breathing 3s ease-in-out infinite", "blur": "25px"},
    "neutron": {"color1": "#2B3BE5", "color2": "#00FFFF", "glow": "rgba(0,255,255,0.9)", "glow_sec": "rgba(43,59,229,0.4)", "anim": "neutron-pulse 0.4s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate", "blur": "18px"},
    "void": {"color1": "#0A0A0A", "color2": "#E60000", "glow": "rgba(230,0,0,0.95)", "glow_sec": "rgba(10,10,10,0.8)", "anim": "void-expand 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite", "blur": "35px"},
    "aurora": {"color1": "#FF007F", "color2": "#7F00FF", "glow": "rgba(127,0,255,0.85)", "glow_sec": "rgba(0,240,255,0.3)", "anim": "aurora-shift 6s linear infinite", "blur": "30px"},
    "heartbeat": {"color1": "#FF2A2A", "color2": "#FF7F7F", "glow": "rgba(255,42,42,0.9)", "glow_sec": "rgba(255,127,127,0.3)", "anim": "heartbeat-pulse 1.4s ease-in-out infinite", "blur": "20px"},
    "cyber": {"color1": "#00F0FF", "color2": "#FF007F", "glow": "rgba(0,240,255,0.85)", "glow_sec": "rgba(255,0,127,0.4)", "anim": "cyber-glitch 2s steps(4) infinite", "blur": "22px"},
    "industrial": {"color1": "#2B3BE5", "color2": "#0A0A0A", "glow": "rgba(43,59,229,0.95)", "glow_sec": "rgba(43,59,229,0.2)", "anim": "industrial-breathe 4s cubic-bezier(0.25, 1, 0.5, 1) infinite", "blur": "28px"}
}

def build_html_x100000(profile_key: str) -> str:
    p = PROFILES.get(profile_key, PROFILES["industrial"])
    return f"""<!DOCTYPE html>
<html>
<head>
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ background: transparent; display: flex; justify-content: center; align-items: flex-start; height: 100vh; overflow: hidden; }}
  .notch-bezel-shadow {{ position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 182px; height: 36px; border-radius: 0 0 20px 20px; background: #000000; box-shadow: 0 2px 12px rgba(0,0,0,0.95); z-index: 10; }}
  .halo-emitter {{ position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 480px; height: 110px; border-radius: 0 0 55px 55px; background: transparent; filter: blur({p["blur"]}); opacity: 0.98; z-index: 1; overflow: hidden; backdrop-filter: blur(30px) saturate(220%); -webkit-backdrop-filter: blur(30px) saturate(220%); box-shadow: 0 6px 35px {p["glow"]}, 0 18px 75px {p["glow_sec"]}, 0 40px 140px {p["glow_sec"]}; animation: {p["anim"]}; }}
  .blob {{ position: absolute; border-radius: 50%; filter: blur(12px); mix-blend-mode: screen; opacity: 0.88; }}
  .blob-1 {{ top: -30px; left: 8%; width: 220px; height: 140px; background: radial-gradient(circle, {p["color1"]} 0%, rgba(255,255,255,0) 70%); animation: float-left 7s ease-in-out infinite alternate; }}
  .blob-2 {{ top: -40px; right: 8%; width: 240px; height: 150px; background: radial-gradient(circle, {p["color2"]} 0%, rgba(255,255,255,0) 70%); animation: float-right 8s ease-in-out infinite alternate; }}
  .blob-3 {{ top: 20px; left: 25%; width: 260px; height: 100px; background: radial-gradient(circle, {p["color1"]} 0%, {p["color2"]} 100%); animation: float-center 5s ease-in-out infinite alternate; opacity: 0.65; }}
  .noise-overlay {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.42; z-index: 5; background: transparent; filter: url(#noise); }}
  .notch-rim {{ position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 184px; height: 37px; border-radius: 0 0 21px 21px; border: 1.5px solid rgba(255,255,255,0.4); border-top: none; box-shadow: inset 0 0 12px rgba(255,255,255,0.15); z-index: 20; pointer-events: none; }}
  @keyframes float-left {{ 0% {{ transform: translate(0, 0) scale(1); }} 100% {{ transform: translate(60px, 20px) scale(1.25); }} }}
  @keyframes float-right {{ 0% {{ transform: translate(0, 0) scale(1.15); }} 100% {{ transform: translate(-50px, 25px) scale(0.85); }} }}
  @keyframes float-center {{ 0% {{ transform: translate(0, 0) scale(0.9) rotate(0deg); }} 100% {{ transform: translate(25px, -15px) scale(1.15) rotate(12deg); }} }}
  @keyframes breathing {{ 0%, 100% {{ opacity: 0.5; filter: blur({p["blur"]}); transform: translateX(-50%) scaleX(0.96) scaleY(0.92); }} 50% {{ opacity: 1.0; filter: blur(calc({p["blur"]} + 8px)); transform: translateX(-50%) scaleX(1.08) scaleY(1.18); }} }}
  @keyframes neutron-pulse {{ from {{ filter: blur({p["blur"]}); transform: translateX(-50%) scale(0.96); opacity: 0.75; }} to {{ filter: blur(calc({p["blur"]} + 10px)); transform: translateX(-50%) scale(1.08); opacity: 1.0; }} }}
  @keyframes void-expand {{ 0% {{ transform: translateX(-50%) scale(0.5); opacity: 0.3; filter: blur(10px); }} 50% {{ opacity: 1.0; }} 100% {{ transform: translateX(-50%) scale(2.4); opacity: 0; filter: blur(55px); }} }}
  @keyframes aurora-shift {{ 0% {{ filter: hue-rotate(0deg) blur({p["blur"]}); transform: translateX(-50%) scale(0.98); }} 50% {{ filter: hue-rotate(180deg) blur(calc({p["blur"]} + 6px)); transform: translateX(-50%) scale(1.05); }} 100% {{ filter: hue-rotate(360deg) blur({p["blur"]}); transform: translateX(-50%) scale(0.98); }} }}
  @keyframes heartbeat-pulse {{ 0%, 100% {{ transform: translateX(-50%) scale(1.0); opacity: 0.4; filter: blur({p["blur"]}); }} 14% {{ transform: translateX(-50%) scale(1.14); opacity: 0.98; filter: blur(calc({p["blur"]} + 4px)); }} 28% {{ transform: translateX(-50%) scale(1.06); opacity: 0.6; filter: blur({p["blur"]}); }} 42% {{ transform: translateX(-50%) scale(1.22); opacity: 1.0; filter: blur(calc({p["blur"]} + 8px)); }} 70% {{ transform: translateX(-50%) scale(1.0); opacity: 0.4; filter: blur({p["blur"]}); }} }}
  @keyframes cyber-glitch {{ 0%, 100% {{ filter: blur({p["blur"]}) hue-rotate(0deg); opacity: 0.85; transform: translateX(-50%) scale(1); }} 20% {{ filter: blur(calc({p["blur"]} - 8px)) hue-rotate(90deg); opacity: 1.0; transform: translateX(-51.5%) scale(1.06); }} 40% {{ filter: blur(calc({p["blur"]} + 6px)) hue-rotate(180deg); opacity: 0.45; transform: translateX(-48.5%) scale(0.94); }} 60% {{ filter: blur(calc({p["blur"]} - 4px)) hue-rotate(270deg); opacity: 0.95; transform: translateX(-49.5%) scale(1.04); }} 80% {{ filter: blur(calc({p["blur"]} + 12px)) hue-rotate(360deg); opacity: 0.35; transform: translateX(-50.5%) scale(0.97); }} }}
  @keyframes industrial-breathe {{ 0%, 100% {{ opacity: 0.45; filter: blur({p["blur"]}); transform: translateX(-50%) scaleX(0.97); }} 50% {{ opacity: 1.0; filter: blur(calc({p["blur"]} + 10px)); transform: translateX(-50%) scaleX(1.08) scaleY(1.1); }} }}
</style>
</head>
<body>
  <svg style="display:none;"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.16 0"/><feComposite operator="in" in2="SourceGraphic"/></filter></svg>
  <div class="noise-overlay"></div><div class="notch-bezel-shadow"></div>
  <div class="halo-emitter"><div class="blob blob-1"></div><div class="blob blob-2"></div><div class="blob blob-3"></div></div>
  <div class="notch-rim"></div>
</body>
</html>"""

class CameraLEDController:
    def __init__(self, profile: str):
        self.profile = profile
        self.stop_event = threading.Event()
        self.thread = None
        self.session = None

    def start(self):
        try:
            self.session = AVCaptureSession.alloc().init()
            self.session.setSessionPreset_("AVCaptureSessionPresetLow")
            device = AVCaptureDevice.defaultDeviceWithMediaType_("vide")
            if device:
                input_device = AVCaptureDeviceInput.deviceInputWithDevice_error_(device, None)
                if input_device:
                    self.session.addInput_(input_device)
                    self.thread = threading.Thread(target=self._run, daemon=True)
                    self.thread.start()
        except Exception as e:
            print(f"[-] Camera LED Init Err: {e}", file=sys.stderr)

    def _run(self):
        if not self.session: return
        while not self.stop_event.is_set():
            if self.profile == "neutron":
                self.session.startRunning(); self.stop_event.wait(0.08); self.session.stopRunning(); self.stop_event.wait(0.08)
            elif self.profile == "heartbeat":
                self.session.startRunning(); self.stop_event.wait(0.07); self.session.stopRunning(); self.stop_event.wait(0.07); self.session.startRunning(); self.stop_event.wait(0.07); self.session.stopRunning(); self.stop_event.wait(0.7)
            elif self.profile == "cyber":
                self.session.startRunning(); self.stop_event.wait(random.uniform(0.03, 0.12)); self.session.stopRunning(); self.stop_event.wait(random.uniform(0.08, 0.25))
            elif self.profile == "ghost":
                self.session.startRunning(); self.stop_event.wait(0.7); self.session.stopRunning(); self.stop_event.wait(0.7)
            elif self.profile == "void":
                self.session.startRunning(); self.stop_event.wait(0.5)
            elif self.profile == "aurora":
                self.session.startRunning(); self.stop_event.wait(1.5); self.session.stopRunning(); self.stop_event.wait(1.5)
            elif self.profile == "industrial":
                self.session.startRunning(); self.stop_event.wait(0.15); self.session.stopRunning(); self.stop_event.wait(0.15); self.session.startRunning(); self.stop_event.wait(0.15); self.session.stopRunning(); self.stop_event.wait(1.2)
            else:
                self.session.startRunning(); self.stop_event.wait(0.5)
        self.session.stopRunning()

    def stop(self):
        self.stop_event.set()
        if self.thread: self.thread.join(timeout=0.5)

class TimerHandler(NSObject):
    def initWithWindow_ledController_app_step_(self, win, led_controller, app, step):
        self = objc.super(TimerHandler, self).init()
        if self: self.win, self.led_controller, self.app, self.fade_step = win, led_controller, app, step
        return self
    def startFadeOut_(self, timer):
        self.fade_timer = NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(0.016, self, "fadeTick:", None, True)
    def fadeTick_(self, timer):
        alpha = self.win.alphaValue() - self.fade_step
        if alpha <= 0:
            timer.invalidate()
            if self.led_controller: self.led_controller.stop()
            self.app.terminate_(None)
        else: self.win.setAlphaValue_(alpha)

class NotchHaloX1000:
    def __init__(self, profile: str = "industrial", duration: float = 4.0, sync_led: bool = True):
        self.profile, self.duration, self.sync_led, self.led_controller = profile, duration, sync_led, None
    def fire(self):
        app = NSApplication.sharedApplication()
        app.setActivationPolicy_(NSApplicationActivationPolicyAccessory)
        if self.sync_led:
            self.led_controller = CameraLEDController(self.profile)
            self.led_controller.start()
        screen = NSScreen.mainScreen().frame()
        w, h = 800, 240
        x, y = (screen.size.width - w) / 2, screen.size.height - h
        win = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(NSMakeRect(x, y, w, h), NSWindowStyleMaskBorderless, NSBackingStoreBuffered, False)
        win.setOpaque_(False)
        win.setBackgroundColor_(NSColor.clearColor())
        win.setLevel_(NSStatusWindowLevel + 25)
        win.setCollectionBehavior_(NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorFullScreenAuxiliary)
        win.setIgnoresMouseEvents_(True)
        wv = WKWebView.alloc().initWithFrame_configuration_(win.contentView().bounds(), WKWebViewConfiguration.alloc().init())
        wv.setBackgroundColor_(NSColor.clearColor())
        wv.setOpaque_(False)
        win.setContentView_(wv)
        wv.loadHTMLString_baseURL_(build_html_x100000(self.profile), None)
        win.setAlphaValue_(0.0)
        win.makeKeyAndOrderFront_(None)
        for i in range(1, 21):
            win.setAlphaValue_(i * 0.05)
            time.sleep(0.01)
        fade_time = 0.35
        self.handler = TimerHandler.alloc().initWithWindow_ledController_app_step_(win, self.led_controller, app, 0.016 / fade_time)
        NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(max(0.1, self.duration - fade_time), self.handler, "startFadeOut:", None, False)
        app.run()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NotchHalo")
    parser.add_argument("--profile", choices=["ghost", "neutron", "void", "aurora", "heartbeat", "cyber", "industrial"], default="industrial")
    parser.add_argument("--duration", type=float, default=4.0)
    parser.add_argument("--no-led", action="store_true")
    args = parser.parse_args()
    NotchHaloX1000(profile=args.profile, duration=args.duration, sync_led=not args.no_led).fire()
