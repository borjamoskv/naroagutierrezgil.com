#!/usr/bin/env python3
# C5-REAL
import argparse, sys, time, objc
try:
    objc.loadBundle('AVFoundation', bundle_path='/System/Library/Frameworks/AVFoundation.framework', module_globals=globals())
except Exception as e: sys.exit(f"ERR: {e}")

def trigger_beacon(duration: float):
    try:
        session = AVCaptureSession.alloc().init()
        session.setSessionPreset_("AVCaptureSessionPresetLow")
        device = AVCaptureDevice.defaultDeviceWithMediaType_("vide")
        if not device: sys.exit("ERR: No device")
        input_device = AVCaptureDeviceInput.deviceInputWithDevice_error_(device, None)
        if not input_device: sys.exit("ERR: No access")
        session.addInput_(input_device)
        session.startRunning()
        time.sleep(duration)
        session.stopRunning()
    except Exception as e: sys.exit(f"ERR: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--duration", type=float, default=0.05)
    trigger_beacon(parser.parse_args().duration)
