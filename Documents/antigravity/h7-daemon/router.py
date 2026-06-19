import shutil
import os
from pythonosc import udp_client

def send_osc_feedback(host, port, route_type):
    try:
        client = udp_client.SimpleUDPClient(host, port)
        client.send_message("/h7/route", route_type)
    except Exception as e:
        print(f"[OSC Error] {e}")

def route_file(src_path, dest_dir, feedback_config):
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    filename = os.path.basename(src_path)
    dest_path = os.path.join(dest_dir, filename)
    
    base, ext = os.path.splitext(filename)
    counter = 1
    while os.path.exists(dest_path):
        dest_path = os.path.join(dest_dir, f"{base}_{counter}{ext}")
        counter += 1
        
    try:
        shutil.move(src_path, dest_path)
        print(f"[{dest_dir.split('/')[-1]}] <- {filename}")
        
        if feedback_config.get("type") == "audio" and feedback_config.get("protocol") == "osc":
            send_osc_feedback(
                feedback_config.get("host", "127.0.0.1"),
                feedback_config.get("port", 8000),
                dest_dir.split('/')[-1]
            )
            
    except Exception as e:
        print(f"Error routing {filename}: {e}")
