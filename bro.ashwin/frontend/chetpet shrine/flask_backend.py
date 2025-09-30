#!/usr/bin/env python3
"""
Flask Backend Server for Our Lady of Lourdes Shrine Website
Handles image uploads, storage, and serves data to clients
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import base64
import uuid
import sqlite3
from typing import Optional

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
DATABASE = 'shrine_data.db'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('data', exist_ok=True)

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def init_database() -> None:
    """Initialize SQLite database for storing metadata"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Create gallery albums table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gallery_albums (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create gallery images table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gallery_images (
            id TEXT PRIMARY KEY,
            album_id TEXT,
            filename TEXT NOT NULL,
            original_name TEXT,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (album_id) REFERENCES gallery_albums (id)
        )
    ''')
    
    # Create slideshow slides table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS slideshow_slides (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            filename TEXT NOT NULL,
            original_name TEXT,
            button_text TEXT,
            button_link TEXT,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully!")

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

def save_base64_image(base64_data: str, filename_prefix: str = "image") -> Optional[str]:
    """Save base64 image data to file and return filename"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        # Decode base64 data
        image_data = base64.b64decode(base64_data)
        
        # Generate unique filename
        filename = f"{filename_prefix}_{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save image
        with open(filepath, 'wb') as f:
            f.write(image_data)
        
        return filename
    except Exception as e:
        print(f"Error saving base64 image: {e}")
        return None

# Path to frontend folder (index.html + CSS/JS/images)
frontend_folder = os.path.join(os.path.dirname(__file__), 'bro.ashwin', 'lourdu madha shrine')

# Path for uploaded files
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Serve homepage
@app.route('/')
def home():
    return send_from_directory(frontend_folder, 'index.html')

# Serve all frontend static files (CSS/JS/images)
@app.route('/<path:filename>')
def serve_frontend_files(filename):
    return send_from_directory(frontend_folder, filename)

# Example API: get gallery albums
@app.route('/api/gallery/albums', methods=['GET'])
def get_gallery_albums():
    try:
        conn = get_db_connection()
        albums = conn.execute('SELECT * FROM gallery_albums ORDER BY created_at DESC').fetchall()
        result = []
        for album in albums:
            images = conn.execute('SELECT id, filename, original_name, upload_date FROM gallery_images WHERE album_id = ?', (album['id'],)).fetchall()
            album_data = {
                'id': album['id'],
                'name': album['name'],
                'description': album['description'],
                'createdAt': album['created_at'],
                'images': [
                    {'id': img['id'], 'src': f'/uploads/{img["filename"]}', 'name': img['original_name'], 'uploadDate': img['upload_date']}
                    for img in images
                ]
            }
            result.append(album_data)
        conn.close()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve uploaded images
@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Other API routes (POST /api/gallery/albums, slideshow endpoints, etc.) can follow the same pattern

if __name__ == '__main__':
    print("✅ Flask backend ready!")
    app.run(debug=True, host='0.0.0.0', port=5000)