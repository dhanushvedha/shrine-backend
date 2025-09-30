#!/usr/bin/env python3
"""
Simple HTTP server with content.json update functionality
Run this instead of the basic Python HTTP server
"""

import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from typing import Any

class ContentUpdateHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/update-content':
            try:
                # Get content length
                content_length = int(self.headers['Content-Length'])
                
                # Read POST data
                post_data = self.rfile.read(content_length)
                
                # Parse JSON data
                data = json.loads(post_data.decode('utf-8'))
                
                # Load existing content.json
                content_file = 'data/content.json'
                if os.path.exists(content_file):
                    with open(content_file, 'r', encoding='utf-8') as f:
                        content = json.load(f)
                else:
                    content = {"siteInfo": {"name": "Our Lady of Lourdes Shrine"}}
                
                # Update specific key
                if 'key' in data and 'data' in data:
                    content[data['key']] = data['data']
                    
                    # Write back to content.json
                    with open(content_file, 'w', encoding='utf-8') as f:
                        json.dump(content, f, indent=2, ensure_ascii=False)
                    
                    # Send success response
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    response: dict[str, Any] = {"success": True, "message": "Content updated successfully"}
                    self.wfile.write(json.dumps(response).encode())
                else:
                    self.send_error(400, "Invalid data format")
                    
            except Exception as e:
                self.send_error(500, f"Server error: {str(e)}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port: int = 8000) -> None:
    server_address = ('', port)
    httpd = HTTPServer(server_address, ContentUpdateHandler)
    print(f"🚀 Enhanced server running at http://localhost:{port}")
    print("📁 Serving files from current directory")
    print("🔄 API endpoint available at /api/update-content")
    print("✨ Images will now be automatically saved for all visitors!")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
