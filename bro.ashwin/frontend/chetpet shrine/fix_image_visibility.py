#!/usr/bin/env python3
"""
Quick fix script to ensure images are visible to all clients
This script will check and fix the image visibility issue
"""

import json
import os
from typing import Any

def check_and_fix_content():
    """Check content.json and ensure proper structure for image visibility"""
    
    print("🔍 Checking image visibility system...")
    
    content_file = 'data/content.json'
    
    # Check if content.json exists
    if not os.path.exists(content_file):
        print("❌ content.json not found!")
        return False
    
    # Load and check content
    try:
        with open(content_file, 'r', encoding='utf-8') as f:
            content = json.load(f)
        
        # Check required keys
        gallery_albums = content.get('galleryAlbums', [])
        home_slides = content.get('homeSlides', [])
        
        print(f"📊 Current Status:")
        print(f"   Gallery Albums: {len(gallery_albums)}")
        print(f"   Home Slides: {len(home_slides)}")
        
        if len(gallery_albums) == 0 and len(home_slides) == 0:
            print("⚠️  No images found in content.json")
            print("   This means clients won't see any uploaded images")
            return False
        
        print("✅ Images found in content.json - clients should see them!")
        return True
        
    except Exception as e:
        print(f"❌ Error reading content.json: {e}")
        return False

def create_sample_data():
    """Create sample data to test image visibility"""
    
    print("\n🎨 Creating sample data for testing...")
    
    sample_content: dict[str, Any] = {
        "galleryAlbums": [
            {
                "id": "sample-1",
                "name": "Shrine Photos",
                "description": "Beautiful photos of our shrine",
                "images": [
                    {
                        "id": "img-1",
                        "src": "images/slide1.jpg",
                        "name": "Shrine Exterior",
                        "uploadDate": "2025-09-04T15:00:00.000Z"
                    },
                    {
                        "id": "img-2",
                        "src": "images/slide2.jpg",
                        "name": "Interior View",
                        "uploadDate": "2025-09-04T15:00:00.000Z"
                    }
                ],
                "createdAt": "2025-09-04T15:00:00.000Z"
            }
        ],
        "homeSlides": [
            {
                "id": "slide-1",
                "title": "Welcome to Our Lady of Lourdes Shrine",
                "description": "Experience divine grace and peace",
                "image": "images/slide1.jpg",
                "buttonText": "Learn More",
                "buttonLink": "about.html",
                "createdAt": "2025-09-04T15:00:00.000Z"
            },
            {
                "id": "slide-2",
                "title": "Join Us for Prayer",
                "description": "Daily masses and special celebrations",
                "image": "images/slide2.jpg",
                "buttonText": "Mass Times",
                "buttonLink": "mass-timing.html",
                "createdAt": "2025-09-04T15:00:00.000Z"
            }
        ],
        "siteInfo": {
            "name": "Our Lady of Lourdes Shrine",
            "location": "Vellore Diocese, Chetpet, India"
        }
    }
    
    # Backup existing file
    content_file = 'data/content.json'
    if os.path.exists(content_file):
        backup_file = 'data/content_backup.json'
        os.rename(content_file, backup_file)
        print(f"📦 Backed up existing content.json to {backup_file}")
    
    # Write new content
    with open(content_file, 'w', encoding='utf-8') as f:
        json.dump(sample_content, f, indent=2, ensure_ascii=False)
    
    print("✅ Sample data created successfully!")
    print("   Gallery: 1 album with 2 images")
    print("   Slideshow: 2 slides")

def main():
    print("🚀 Our Lady of Lourdes Shrine - Image Visibility Checker")
    print("=" * 60)
    
    if check_and_fix_content():
        print("\n✅ System looks good! Clients should see uploaded images.")
    else:
        print("\n❌ Issue detected with image visibility!")
        choice = input("\nDo you want to create sample data for testing? (y/n): ").lower()
        if choice == 'y':
            create_sample_data()
            print("\n🎉 Sample data created! Now check:")
            print("   📸 Gallery: http://localhost:8000/gallery.html")
            print("   🏠 Home: http://localhost:8000")
        else:
            print("\n💡 To fix this:")
            print("   1. Login to admin panel")
            print("   2. Upload some gallery images or slideshow slides")
            print("   3. The system will update content.json automatically")
    
    print("\n📋 Next steps:")
    print("   1. Test gallery: http://localhost:8000/gallery.html")
    print("   2. Test slideshow: http://localhost:8000")
    print("   3. Test admin: http://localhost:8000/login.html (admin/lourdes2024)")

if __name__ == '__main__':
    main()
