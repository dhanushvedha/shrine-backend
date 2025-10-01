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
DATABASE = os.path.join('data', 'shrine_data.db')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('data', exist_ok=True)

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Database helpers

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    conn = get_db_connection()
    c = conn.cursor()
    # Create tables if they don't exist
    c.execute('''
        CREATE TABLE IF NOT EXISTS gallery_albums (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS gallery_images (
            id TEXT PRIMARY KEY,
            album_id TEXT,
            filename TEXT,
            original_name TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS slideshow_slides (
            id TEXT PRIMARY KEY,
            title TEXT,
            filename TEXT,
            link TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()


# Helpers for handling base64 images

def save_base64_image(data_url: str, prefix: str = 'upload') -> Optional[str]:
    try:
        header, encoded = data_url.split(',', 1)
        file_ext = 'png'
        if 'jpeg' in header or 'jpg' in header:
            file_ext = 'jpg'
        elif 'gif' in header:
            file_ext = 'gif'
        elif 'webp' in header:
            file_ext = 'webp'

        filename = f"{prefix}_{uuid.uuid4().hex}.{file_ext}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        with open(filepath, 'wb') as f:
            f.write(base64.b64decode(encoded))
        return filename
    except Exception as e:
        print(f"Error saving base64 image: {e}")
        return None

# API Routes

# Locate frontend folder (support common repo layouts)
BASE_DIR = os.path.dirname(__file__)
possible_frontend_paths = [
    os.path.join(BASE_DIR, 'frontend'),
    os.path.join(BASE_DIR, 'bro.ashwin', 'frontend'),
    os.path.join(BASE_DIR, 'bro.ashwin', 'frontend', 'chetpet shrine'),
]
frontend_folder = next((p for p in possible_frontend_paths if os.path.exists(p)), os.path.join(BASE_DIR, 'frontend'))
print(f"Using frontend folder: {frontend_folder}")

# Serve homepage
@app.route('/')
def home():
    """Serve the main website"""
    return send_from_directory(frontend_folder, 'index.html')

# Serve uploads
@app.route('/uploads/<path:filename>')
def serve_uploads(filename: str):
    """Serve uploaded images"""
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/gallery/albums', methods=['GET'])
def get_gallery_albums():
    """Get all gallery albums with their images"""
    try:
        conn = get_db_connection()

        # Get all albums
        albums = conn.execute('SELECT * FROM gallery_albums ORDER BY created_at DESC').fetchall()

        result = []
        for album in albums:
            # Get images for this album
            images = conn.execute('''
                SELECT id, filename, original_name, created_at
                FROM gallery_images
                WHERE album_id = ?
                ORDER BY created_at DESC
            ''', (album['id'],)).fetchall()
            image_list = [dict(img) for img in images]
            result.append({
                'id': album['id'],
                'name': album['name'],
                'description': album['description'],
                'created_at': album['created_at'],
                'images': image_list
            })

        conn.close()
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching albums: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/gallery/albums', methods=['POST'])
def create_gallery_album():
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        album_id = str(uuid.uuid4())

        conn = get_db_connection()
        conn.execute('INSERT INTO gallery_albums (id, name, description) VALUES (?, ?, ?)', (album_id, name, description))
        conn.commit()
        conn.close()

        return jsonify({'id': album_id, 'name': name, 'description': description}), 201
    except Exception as e:
        print(f"Error creating album: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/gallery/albums/<album_id>/images', methods=['POST'])
def add_images_to_album(album_id: str):
    try:
        # Expect multipart/form-data or JSON with base64
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json()
            images = data.get('images', [])
            saved = []
            for img in images:
                if isinstance(img, str) and img.startswith('data:'):
                    filename = save_base64_image(img, f"album_{album_id}")
                    if filename:
                        conn = get_db_connection()
                        img_id = str(uuid.uuid4())
                        conn.execute('INSERT INTO gallery_images (id, album_id, filename, original_name) VALUES (?, ?, ?, ?)', (img_id, album_id, filename, 'upload'))
                        conn.commit()
                        conn.close()
                        saved.append(filename)
            return jsonify({'saved': saved}), 201
        else:
            # Handle form uploads
            files = request.files
            saved = []
            for key in files:
                file = files[key]
                if file and allowed_file(file.filename):
                    filename = f"album_{album_id}_{uuid.uuid4().hex}_{file.filename}"
                    filepath = os.path.join(UPLOAD_FOLDER, filename)
                    file.save(filepath)
                    conn = get_db_connection()
                    img_id = str(uuid.uuid4())
                    conn.execute('INSERT INTO gallery_images (id, album_id, filename, original_name) VALUES (?, ?, ?, ?)', (img_id, album_id, filename, file.filename))
                    conn.commit()
                    conn.close()
                    saved.append(filename)
            return jsonify({'saved': saved}), 201
    except Exception as e:
        print(f"Error adding images: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/slideshow/slides', methods=['GET'])
def get_slideshow_slides():
    try:
        conn = get_db_connection()
        slides = conn.execute('SELECT * FROM slideshow_slides ORDER BY created_at DESC').fetchall()
        result = [dict(slide) for slide in slides]
        conn.close()
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching slides: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/slideshow/slides', methods=['POST'])
def create_slideshow_slide():
    try:
        data = request.form if request.form else request.get_json()
        title = data.get('title')
        link = data.get('link')

        # handle file
        file = None
        if 'file' in request.files:
            file = request.files['file']

        filename = None
        if file and allowed_file(file.filename):
            filename = f"slide_{uuid.uuid4().hex}_{file.filename}"
            file.save(os.path.join(UPLOAD_FOLDER, filename))

        slide_id = str(uuid.uuid4())
        conn = get_db_connection()
        conn.execute('INSERT INTO slideshow_slides (id, title, filename, link) VALUES (?, ?, ?, ?)', (slide_id, title, filename, link))
        conn.commit()
        conn.close()

        return jsonify({'id': slide_id, 'title': title, 'filename': filename, 'link': link}), 201
    except Exception as e:
        print(f"Error creating slide: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/slideshow/slides/<slide_id>', methods=['DELETE'])
def delete_slide(slide_id: str):
    try:
        conn = get_db_connection()
        slide = conn.execute('SELECT * FROM slideshow_slides WHERE id = ?', (slide_id,)).fetchone()
        if not slide:
            conn.close()
            return jsonify({'error': 'Not found'}), 404
        if slide['filename']:
            try:
                os.remove(os.path.join(UPLOAD_FOLDER, slide['filename']))
            except Exception:
                pass
        conn.execute('DELETE FROM slideshow_slides WHERE id = ?', (slide_id,))
        conn.commit()
        conn.close()
        return jsonify({'deleted': True}), 200
    except Exception as e:
        print(f"Error deleting slide: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/gallery/albums/<album_id>', methods=['DELETE'])
def delete_gallery_album(album_id: str):
    try:
        conn = get_db_connection()
        images = conn.execute('SELECT * FROM gallery_images WHERE album_id = ?', (album_id,)).fetchall()
        for img in images:
            try:
                os.remove(os.path.join(UPLOAD_FOLDER, img['filename']))
            except Exception:
                pass
        conn.execute('DELETE FROM gallery_images WHERE album_id = ?', (album_id,))
        conn.execute('DELETE FROM gallery_albums WHERE id = ?', (album_id,))
        conn.commit()
        conn.close()
        return jsonify({'deleted': True}), 200
    except Exception as e:
        print(f"Error deleting album: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/status', methods=['GET'])
def status():
    try:
        return jsonify({'status': 'ok', 'uptime': 'unknown'})
    except Exception as e:
        print(f"Status error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/migrate-from-localstorage', methods=['POST'])
def migrate_from_localstorage():
    try:
        data = request.get_json()
        migrated_count = 0
        # migrate gallery
        if 'gallery' in data:
            for album in data['gallery']:
                conn = get_db_connection()
                conn.execute('INSERT OR IGNORE INTO gallery_albums (id, name, description) VALUES (?, ?, ?)', (album['id'], album['name'], album.get('description', '')))
                conn.commit()
                # Migrate images
                for img in album.get('images', []):
                    if 'src' in img and img['src'].startswith('data:'):
                        filename = save_base64_image(img['src'], f"migrated_gallery_{album['id']}")
                        if filename:
                            conn.execute('INSERT INTO gallery_images (id, album_id, filename, original_name) VALUES (?, ?, ?, ?)', (str(img['id']), album['id'], filename, img['name']))
                            migrated_count += 1
                conn.close()
        # migrate slideshow
        if 'slideshow' in data:
            for slide in data['slideshow']:
                conn = get_db_connection()
                conn.execute('INSERT OR IGNORE INTO slideshow_slides (id, title, filename, link) VALUES (?, ?, ?, ?)', (slide['id'], slide.get('title'), None, slide.get('link')))
                conn.commit()
                conn.close()

        return jsonify({'migrated': migrated_count}), 200
    except Exception as e:
        print(f"Migration error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


# Serve all frontend static files (CSS, JS, images)
# Placed after API routes so it doesn't intercept API endpoints.
@app.route('/<path:filename>')
def serve_static(filename: str):
    """Serve static files from frontend folder only if they exist."""
    full_path = os.path.join(frontend_folder, filename)
    # If the file exists in the frontend folder, serve it
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return send_from_directory(frontend_folder, filename)
    # Otherwise, return a 404 so API routes (defined earlier) can be reached or default 404 shown.
    from flask import abort
    abort(404)

if __name__ == '__main__':
    print("🚀 Initializing Our Lady of Lourdes Shrine Backend...")
    init_database()

    print("✅ Flask backend server ready!")
    print("📊 Features available:")
    print("   - Gallery album management")
    print("   - Image upload and storage")
    print("   - Slideshow management")
    print("   - SQLite database storage")
    print("   - RESTful API endpoints")
    print("   - Cross-origin resource sharing (CORS)")
    print()
    print("🌐 API Endpoints:")
    print("   GET  /api/gallery/albums - Get all albums")
    print("   POST /api/gallery/albums - Create new album")
    print("   POST /api/gallery/albums/{id}/images - Add images to album")
    print("   GET  /api/slideshow/slides - Get all slides")
    print("   POST /api/slideshow/slides - Create new slide")
    print("   GET  /api/status - Get system status")
    print("🎯 Access the website at: http://localhost:5000")

    app.run(debug=True, host='0.0.0.0', port=5000)
