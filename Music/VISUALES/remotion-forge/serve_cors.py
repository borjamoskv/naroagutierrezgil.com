from http.server import SimpleHTTPRequestHandler, HTTPServer
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        super().end_headers()

if __name__ == '__main__':
    os.chdir('/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/out')
    httpd = HTTPServer(('127.0.0.1', 9999), CORSRequestHandler)
    print("Serving on port 9999")
    httpd.serve_forever()
