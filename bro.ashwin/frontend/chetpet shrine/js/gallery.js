// Gallery functionality

let currentImageIndex = 0;
let galleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeGallery();
    initializeFilters();
    initializeLightbox();
});

// Initialize gallery
function initializeGallery() {
    loadGalleryImages();
    
    // Check if user is admin to show upload section
    const isAdmin = localStorage.getItem('adminLoggedIn');
    if (isAdmin) {
        document.getElementById('uploadSection').style.display = 'block';
        initializeUpload();
    }
}

// Initialize category filters
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            
            // Update active filter button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Initialize lightbox
function initializeLightbox() {
    // Collect all gallery images
    const images = document.querySelectorAll('.gallery-item img');
    galleryImages = Array.from(images).map(img => ({
        src: img.src,
        title: img.alt,
        description: img.closest('.gallery-item').querySelector('.gallery-info p')?.textContent || ''
    }));
}

// Open lightbox
function openLightbox(imageSrc, title, description = '') {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDescription = document.getElementById('lightboxDescription');
    
    // Find current image index
    currentImageIndex = galleryImages.findIndex(img => img.src === imageSrc);
    
    lightboxImage.src = imageSrc;
    lightboxTitle.textContent = title;
    lightboxDescription.textContent = description;
    
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleLightboxKeyboard);
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Remove keyboard navigation
    document.removeEventListener('keydown', handleLightboxKeyboard);
}

// Previous image in lightbox
function previousImage() {
    if (galleryImages.length === 0) return;
    
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}

// Next image in lightbox
function nextImage() {
    if (galleryImages.length === 0) return;
    
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
}

// Update lightbox image
function updateLightboxImage() {
    const currentImage = galleryImages[currentImageIndex];
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDescription = document.getElementById('lightboxDescription');
    
    lightboxImage.src = currentImage.src;
    lightboxTitle.textContent = currentImage.title;
    lightboxDescription.textContent = currentImage.description;
}

// Handle keyboard navigation in lightbox
function handleLightboxKeyboard(e) {
    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            previousImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
    }
}

// Initialize upload functionality (admin only)
function initializeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const imageUpload = document.getElementById('imageUpload');
    
    if (!uploadArea || !imageUpload) return;
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        handleImageUpload(files);
    });
    
    // File input change
    imageUpload.addEventListener('change', (e) => {
        handleImageUpload(e.target.files);
    });
}

// Handle image upload
function handleImageUpload(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    id: Date.now() + Math.random(),
                    src: e.target.result,
                    name: file.name,
                    title: document.getElementById('imageTitle').value || file.name,
                    description: document.getElementById('imageDescription').value || '',
                    category: document.getElementById('imageCategory').value || 'shrine',
                    uploadDate: new Date().toISOString()
                };
                
                saveImageToGallery(imageData);
                addImageToGalleryDisplay(imageData);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Save image to gallery storage
function saveImageToGallery(imageData) {
    const existingImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    existingImages.push(imageData);
    localStorage.setItem('galleryImages', JSON.stringify(existingImages));
}

// Add image to gallery display
function addImageToGalleryDisplay(imageData) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('data-category', imageData.category);
    
    galleryItem.innerHTML = `
        <img src="${imageData.src}" alt="${imageData.title}">
        <div class="gallery-overlay">
            <div class="gallery-info">
                <h3>${imageData.title}</h3>
                <p>${imageData.description}</p>
            </div>
            <button class="view-btn" onclick="openLightbox('${imageData.src}', '${imageData.title}', '${imageData.description}')">
                <i class="fas fa-expand"></i>
            </button>
            <button class="delete-btn" onclick="deleteGalleryImage('${imageData.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    galleryGrid.appendChild(galleryItem);
    
    // Update gallery images array
    galleryImages.push({
        src: imageData.src,
        title: imageData.title,
        description: imageData.description
    });
    
    showNotification('Image uploaded successfully!', 'success');
}

// Load gallery images from storage
function loadGalleryImages() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    const images = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    
    images.forEach(imageData => {
        addImageToGalleryDisplay(imageData);
    });
}

// Delete gallery image (admin only)
function deleteGalleryImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    const images = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    const filteredImages = images.filter(img => img.id != imageId);
    localStorage.setItem('galleryImages', JSON.stringify(filteredImages));
    
    // Remove from display
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        const deleteBtn = item.querySelector('.delete-btn');
        if (deleteBtn && deleteBtn.getAttribute('onclick').includes(imageId)) {
            item.remove();
        }
    });
    
    // Update gallery images array
    initializeLightbox();
    
    showNotification('Image deleted successfully!', 'success');
}

// Upload images function (called from upload button)
function uploadImages() {
    const title = document.getElementById('imageTitle').value;
    const description = document.getElementById('imageDescription').value;
    const category = document.getElementById('imageCategory').value;
    const fileInput = document.getElementById('imageUpload');
    
    if (!fileInput.files.length) {
        showNotification('Please select images to upload.', 'error');
        return;
    }
    
    if (!title.trim()) {
        showNotification('Please enter a title for the images.', 'error');
        return;
    }
    
    handleImageUpload(fileInput.files);
    
    // Clear form
    document.getElementById('imageTitle').value = '';
    document.getElementById('imageDescription').value = '';
    fileInput.value = '';
    
    showNotification('Images uploaded successfully!', 'success');
}

// Close lightbox when clicking outside the image
document.addEventListener('click', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (e.target === lightbox) {
        closeLightbox();
    }
});
