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

# API Routes


# Path to the renamed frontend folder
frontend_folder = os.path.join(os.path.dirname(__file__), 'frontend')

# Serve homepage
@app.route('/')
def home():
    """Serve the main website"""
    return send_from_directory(frontend_folder, 'index.html')

# Serve all frontend static files (CSS, JS, images)
@app.route('/<path:filename>')
def serve_static(filename: str):
    """Serve static files from frontend folder"""
    return send_from_directory(frontend_folder, filename)

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
                SELECT id, filename, original_name, upload_date 
                FROM gallery_images 
                WHERE album_id = ? 
                ORDER BY upload_date DESC
            ''', (album['id'],)).fetchall()
            
            album_data = {
                'id': album['id'],
                'name': album['name'],
                'description': album['description'],
                'createdAt': album['created_at'],
                'images': [
                    {
                        'id': img['id'],
                        'src': f'/uploads/{img["filename"]}',
                        'name': img['original_name'],
                        'uploadDate': img['upload_date']
                    }
                    for img in images
                ]
            }
            result.append(album_data)
        
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gallery/albums', methods=['POST'])
def create_gallery_album():
    """Create a new gallery album"""
    try:
        data = request.get_json()
        album_id = str(uuid.uuid4())
        
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO gallery_albums (id, name, description) 
            VALUES (?, ?, ?)
        ''', (album_id, data['name'], data.get('description', '')))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Album created successfully',
            'album_id': album_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gallery/albums/<album_id>/images', methods=['POST'])
def add_images_to_album(album_id: str):
    """Add images to a gallery album"""
    try:
        data = request.get_json()
        images_data = data.get('images', [])
        
        conn = get_db_connection()
        
        for img_data in images_data:
            # Save base64 image
            filename = save_base64_image(img_data['src'], f"gallery_{album_id}")
            if filename:
                image_id = str(uuid.uuid4())
                conn.execute('''
                    INSERT INTO gallery_images (id, album_id, filename, original_name) 
                    VALUES (?, ?, ?, ?)
                ''', (image_id, album_id, filename, img_data['name']))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'{len(images_data)} images added successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/slideshow/slides', methods=['GET'])
def get_slideshow_slides():
    """Get all slideshow slides"""
    try:
        conn = get_db_connection()
        slides = conn.execute('''
            SELECT * FROM slideshow_slides 
            ORDER BY order_index ASC, created_at DESC
        ''').fetchall()
        
        result = [
            {
                'id': slide['id'],
                'title': slide['title'],
                'description': slide['description'],
                'image': f'/uploads/{slide["filename"]}',
                'buttonText': slide['button_text'],
                'buttonLink': slide['button_link'],
                'createdAt': slide['created_at']
            }
            for slide in slides
        ]
        
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/slideshow/slides', methods=['POST'])
def create_slideshow_slide():
    """Create a new slideshow slide"""
    try:
        data = request.get_json()
        
        # Save base64 image
        filename = save_base64_image(data['image'], "slideshow")
        if not filename:
            return jsonify({'error': 'Failed to save image'}), 500
        
        slide_id = str(uuid.uuid4())
        
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO slideshow_slides 
            (id, title, description, filename, original_name, button_text, button_link) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            slide_id,
            data['title'],
            data.get('description', ''),
            filename,
            data.get('original_name', 'slideshow_image'),
            data.get('buttonText', ''),
            data.get('buttonLink', '')
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Slideshow slide created successfully',
            'slide_id': slide_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/slideshow/slides/<slide_id>', methods=['DELETE'])
def delete_slideshow_slide(slide_id: str):
    """Delete a slideshow slide"""
    try:
        conn = get_db_connection()
        
        # Get filename to delete physical file
        slide = conn.execute('SELECT filename FROM slideshow_slides WHERE id = ?', (slide_id,)).fetchone()
        if slide:
            # Delete physical file
            try:
                os.remove(os.path.join(UPLOAD_FOLDER, slide['filename']))
            except:
                pass  # File might not exist
            
            # Delete from database
            conn.execute('DELETE FROM slideshow_slides WHERE id = ?', (slide_id,))
            conn.commit()
            
        conn.close()
        return jsonify({'success': True, 'message': 'Slide deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gallery/albums/<album_id>', methods=['DELETE'])
def delete_gallery_album(album_id: str):
    """Delete a gallery album and all its images"""
    try:
        conn = get_db_connection()
        
        # Get all image filenames to delete physical files
        images = conn.execute('SELECT filename FROM gallery_images WHERE album_id = ?', (album_id,)).fetchall()
        for img in images:
            try:
                os.remove(os.path.join(UPLOAD_FOLDER, img['filename']))
            except:
                pass  # File might not exist
        
        # Delete from database
        conn.execute('DELETE FROM gallery_images WHERE album_id = ?', (album_id,))
        conn.execute('DELETE FROM gallery_albums WHERE id = ?', (album_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Album deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status"""
    try:
        conn = get_db_connection()
        
        album_count = conn.execute('SELECT COUNT(*) as count FROM gallery_albums').fetchone()['count']
        image_count = conn.execute('SELECT COUNT(*) as count FROM gallery_images').fetchone()['count']
        slide_count = conn.execute('SELECT COUNT(*) as count FROM slideshow_slides').fetchone()['count']
        
        conn.close()
        
        return jsonify({
            'status': 'running',
            'backend': 'Flask + SQLite',
            'statistics': {
                'albums': album_count,
                'images': image_count,
                'slides': slide_count
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin panel integration
@app.route('/api/migrate-from-localstorage', methods=['POST'])
def migrate_from_localstorage():
    """Migrate existing localStorage data to backend database"""
    try:
        data = request.get_json()
        gallery_albums = data.get('galleryAlbums', [])
        home_slides = data.get('homeSlides', [])
        
        conn = get_db_connection()
        migrated_count = 0
        
        # Migrate gallery albums
        for album in gallery_albums:
            # Check if album already exists
            existing = conn.execute('SELECT id FROM gallery_albums WHERE id = ?', (album['id'],)).fetchone()
            if not existing:
                conn.execute('''
                    INSERT INTO gallery_albums (id, name, description) 
                    VALUES (?, ?, ?)
                ''', (album['id'], album['name'], album.get('description', '')))
                
                # Migrate images
                for img in album.get('images', []):
                    if 'src' in img and img['src'].startswith('data:'):
                        filename = save_base64_image(img['src'], f"migrated_gallery_{album['id']}")
                        if filename:
                            conn.execute('''
                                INSERT INTO gallery_images (id, album_id, filename, original_name) 
                                VALUES (?, ?, ?, ?)
                            ''', (str(img['id']), album['id'], filename, img['name']))
                            migrated_count += 1
        
        # Migrate slideshow slides
        for slide in home_slides:
            existing = conn.execute('SELECT id FROM slideshow_slides WHERE id = ?', (slide['id'],)).fetchone()
            if not existing and 'image' in slide and slide['image'].startswith('data:'):
                filename = save_base64_image(slide['image'], "migrated_slideshow")
                if filename:
                    conn.execute('''
                        INSERT INTO slideshow_slides 
                        (id, title, description, filename, original_name, button_text, button_link) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        slide['id'],
                        slide['title'],
                        slide.get('description', ''),
                        filename,
                        'migrated_slide',
                        slide.get('buttonText', ''),
                        slide.get('buttonLink', '')
                    ))
                    migrated_count += 1
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Successfully migrated {migrated_count} items to backend database'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
    print()
    print("🎯 Access the website at: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
