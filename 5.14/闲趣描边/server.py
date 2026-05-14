import http.server
import socketserver
import sys

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

print(f"Server running at http://localhost:{PORT}")
sys.stdout.flush()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
