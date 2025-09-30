// Admin JavaScript functionality

// Default admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'lourdes2024'
};

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('admin-dashboard.html') && !isLoggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (currentPage.includes('login.html') && isLoggedIn) {
        window.location.href = 'admin-dashboard.html';
        return false;
    }
    
    return true;
}

// Login form handling
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialize admin dashboard if on admin page
    if (window.location.pathname.includes('admin-dashboard.html')) {
        initializeAdminDashboard();
    }
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('loginMessage');
    
    showLoading();
    
    // Simulate authentication delay
    setTimeout(() => {
        hideLoading();
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            
            showMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);
        } else {
            showMessage('Invalid username or password. Please try again.', 'error');
        }
    }, 1000);
}

// Show login message
function showMessage(message, type) {
    const messageDiv = document.getElementById('loginMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `login-message ${type}`;
        messageDiv.style.display = 'block';
        
        if (type === 'error') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
}

// Save data to backend server
async function saveToContentFile(key, data) {
    try {
        // First save to localStorage for admin interface
        if (key === 'galleryAlbums') {
            localStorage.setItem('galleryAlbums', JSON.stringify(data));
        } else if (key === 'homeSlides') {
            localStorage.setItem('homeSlides', JSON.stringify(data));
        }

        // Save to Flask backend
        let endpoint = '';
        let method = 'POST';
        let payload = {};

        if (key === 'galleryAlbums') {
            // For gallery albums, we need to handle this differently
            // This function is called when albums are created or updated
            showNotification(`✅ Gallery data saved! Backend API will handle individual uploads.`, 'success');
            return;
        } else if (key === 'homeSlides') {
            // For slideshow, send the latest slide
            if (data.length > 0) {
                const latestSlide = data[data.length - 1];
                endpoint = '/api/slideshow/slides';
                payload = latestSlide;
            } else {
                showNotification(`✅ Slideshow data saved!`, 'success');
                return;
            }
        }

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showNotification(`✅ ${key === 'homeSlides' ? 'Slideshow slide' : 'Gallery album'} saved to backend! All visitors can now see the uploaded content.`, 'success');
            } else {
                throw new Error(result.error || 'Backend save failed');
            }
        } catch (apiError) {
            console.log('Backend API not available, using fallback method:', apiError);
            
            // Fallback: Download method if backend API is not available
            await fallbackSaveMethod(key, data);
        }

    } catch (error) {
        console.error('Error saving to backend:', error);
        showNotification('❌ Error saving data. Please check if the Flask backend server is running.', 'error');
    }
}

// Fallback method for saving data
async function fallbackSaveMethod(key, data) {
    let existingContent = {};
    try {
        const response = await fetch('data/content.json');
        if (response.ok) {
            existingContent = await response.json();
        }
    } catch (e) {
        console.log('Creating new content structure');
        existingContent = {
            "galleryAlbums": [],
            "homeSlides": [],
            "siteInfo": {
                "name": "Our Lady of Lourdes Shrine",
                "location": "Vellore Diocese, Chetpet, India"
            }
        };
    }

    // Update the specific key with new data
    existingContent[key] = data;

    // Create downloadable file for manual update
    const jsonString = JSON.stringify(existingContent, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    
    // Show notification with instructions
    showNotification(`📥 Backend server not available. Please download and replace data/content.json, or start the Flask backend server.`, 'warning');
    
    // Auto-download the file
    a.click();
    
    // Cleanup
    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, 100);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        window.location.href = 'login.html';
    }
}

// Initialize admin dashboard
function initializeAdminDashboard() {
    initializeNavigation();
    initializeContentTabs();
    initializeMassTimingForm();
    initializeGalleryManagement();
    initializeSlideshowManagement();
    initializeEventManagement();
    initializeContentManagement();
    initializeJubileeManagement();
    initializeMadhaMalaiManagement();
    initializePriestsManagement();
    loadDashboardData();
}

// Initialize content management
function initializeContentManagement() {
    // Initialize About Us form
    const aboutForm = document.querySelector('#about form');
    if (aboutForm) {
        aboutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAboutContent();
        });
    }

    // Initialize Jubilee form
    const jubileeForm = document.querySelector('#jubilee-edit form');
    if (jubileeForm) {
        jubileeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveJubileeContent();
        });
    }

    // Initialize Substations form
    const substationsBtn = document.querySelector('#substations-edit .save-btn');
    if (substationsBtn) {
        substationsBtn.addEventListener('click', saveSubstationsContent);
    }

    loadContentData();
}

// Save About Us content
function saveAboutContent() {
    const aboutData = {
        title: document.getElementById('aboutTitle')?.value || '',
        history: document.getElementById('aboutHistory')?.value || '',
        mission: document.getElementById('aboutMission')?.value || '',
        vision: document.getElementById('aboutVision')?.value || ''
    };

    localStorage.setItem('aboutContent', JSON.stringify(aboutData));
    showNotification('About Us content updated successfully!', 'success');
}

// Save Jubilee content
function saveJubileeContent() {
    const jubileeData = {
        title: document.getElementById('jubileeTitle')?.value || '',
        story: document.getElementById('jubileeStory')?.value || ''
    };

    localStorage.setItem('jubileeContent', JSON.stringify(jubileeData));
    showNotification('Jubilee content updated successfully!', 'success');
}

// Save Substations content
function saveSubstationsContent() {
    const substationsData = [];
    const substationItems = document.querySelectorAll('.substation-item');

    substationItems.forEach(item => {
        const inputs = item.querySelectorAll('input[type="text"]');
        const textarea = item.querySelector('textarea');

        if (inputs.length >= 2) {
            substationsData.push({
                name: inputs[0].value || '',
                location: inputs[1].value || '',
                description: textarea?.value || ''
            });
        }
    });

    localStorage.setItem('substationsContent', JSON.stringify(substationsData));
    showNotification('Substations content updated successfully!', 'success');
}

// Load content data
function loadContentData() {
    // Load About Us data
    const aboutData = JSON.parse(localStorage.getItem('aboutContent') || '{}');
    if (document.getElementById('aboutTitle')) {
        document.getElementById('aboutTitle').value = aboutData.title || 'St. Lourdes Shrine - Chetpet: A Legacy of Faith';
        if (document.getElementById('aboutHistory')) {
            document.getElementById('aboutHistory').value = aboutData.history || 'The Mission of Chethupattu, under the zealous missionary Priest, Jean Francis Darras...';
        }
        if (document.getElementById('aboutMission')) {
            document.getElementById('aboutMission').value = aboutData.mission || 'To provide a sacred space where all people can encounter...';
        }
        if (document.getElementById('aboutVision')) {
            document.getElementById('aboutVision').value = aboutData.vision || 'To be a center of pilgrimage that inspires faith...';
        }
    }

    // Load Jubilee data
    const jubileeData = JSON.parse(localStorage.getItem('jubileeContent') || '{}');
    if (document.getElementById('jubileeTitle')) {
        document.getElementById('jubileeTitle').value = jubileeData.title || 'Our Lady of Lourdes Shrine, Chetpet, Celebrates 125 Years of Grace and Devotion';
        if (document.getElementById('jubileeStory')) {
            document.getElementById('jubileeStory').value = jubileeData.story || 'Chetpet, Tamil Nadu – Faith, history, and devotion came together...';
        }
    }
}

// Navigation between sections
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav .nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = link.getAttribute('data-section');
            showSection(targetSection);
            
            // Update active nav link
            navLinks.forEach(nl => nl.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Show specific section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.admin-section');
    const navLinks = document.querySelectorAll('.admin-nav .nav-link');
    
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    const targetNavLink = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    if (targetNavLink) {
        targetNavLink.classList.add('active');
    }
}

// Content tabs functionality
function initializeContentTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabBtns.forEach(tb => tb.classList.remove('active'));
            tabPanes.forEach(tp => tp.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            btn.classList.add('active');
            const targetPane = document.getElementById(`${targetTab}-tab`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Mass timing form handling
function initializeMassTimingForm() {
    const massForm = document.querySelector('.mass-timing-form');
    if (massForm) {
        massForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(massForm);
            const massTimings = {
                weekdays: [],
                sundays: [],
                special: []
            };
            
            // Get weekday timings
            const weekdayInputs = document.querySelectorAll('[id^="weekday"]');
            weekdayInputs.forEach(input => {
                if (input.value) {
                    massTimings.weekdays.push(input.value);
                }
            });
            
            // Get Sunday timings
            const sundayInputs = document.querySelectorAll('[id^="sunday"]');
            sundayInputs.forEach(input => {
                if (input.value) {
                    massTimings.sundays.push(input.value);
                }
            });
            
            // Save to localStorage (in a real app, this would be sent to a server)
            localStorage.setItem('massTimings', JSON.stringify(massTimings));
            
            showNotification('Mass timings updated successfully!', 'success');
        });
    }
    
    // Add time button functionality
    const addTimeBtns = document.querySelectorAll('.add-time-btn');
    addTimeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const timeInputs = btn.parentElement;
            const newInput = document.createElement('input');
            newInput.type = 'time';
            newInput.style.marginTop = '10px';
            timeInputs.insertBefore(newInput, btn);
        });
    });
}

// Gallery management
function initializeGalleryManagement() {
    // Initialize album form
    const albumForm = document.getElementById('albumForm');
    if (albumForm) {
        albumForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createAlbum();
        });
    }

    // Initialize image form
    const imageForm = document.getElementById('imageForm');
    if (imageForm) {
        imageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addImagesToAlbum();
        });
    }

    // Initialize image upload
    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', previewImages);
    }

    loadAlbums();
    loadAlbumOptions();
}

// Show add album form
function showAddAlbumForm() {
    document.getElementById('addAlbumForm').style.display = 'block';
    document.getElementById('addImageForm').style.display = 'none';
}

// Hide add album form
function hideAddAlbumForm() {
    document.getElementById('addAlbumForm').style.display = 'none';
    document.getElementById('albumForm').reset();
}

// Show add image form
function showAddImageForm() {
    document.getElementById('addImageForm').style.display = 'block';
    document.getElementById('addAlbumForm').style.display = 'none';
    loadAlbumOptions();
}

// Hide add image form
function hideAddImageForm() {
    document.getElementById('addImageForm').style.display = 'none';
    document.getElementById('imageForm').reset();
    document.getElementById('imagePreviewContainer').innerHTML = '';
}

// Create album
async function createAlbum() {
    const name = document.getElementById('albumName').value;
    const description = document.getElementById('albumDescription').value;

    if (!name) {
        showNotification('Please fill in album name.', 'error');
        return;
    }

    try {
        // Save to Flask backend
        const response = await fetch('/api/gallery/albums', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Also save to localStorage for admin interface
            const albumData = {
                id: result.album_id,
                name,
                description,
                images: [],
                createdAt: new Date().toISOString()
            };

            const albums = JSON.parse(localStorage.getItem('galleryAlbums') || '[]');
            albums.push(albumData);
            localStorage.setItem('galleryAlbums', JSON.stringify(albums));

            hideAddAlbumForm();
            loadAlbums();
            loadAlbumOptions();
            showNotification('✅ Album created successfully and saved to backend!', 'success');
        } else {
            throw new Error(result.error || 'Failed to create album');
        }
    } catch (error) {
        console.error('Backend not available, using localStorage:', error);
        
        // Fallback to localStorage only
        const albumData = {
            id: Date.now().toString(),
            name,
            description,
            images: [],
            createdAt: new Date().toISOString()
        };

        const albums = JSON.parse(localStorage.getItem('galleryAlbums') || '[]');
        albums.push(albumData);
        localStorage.setItem('galleryAlbums', JSON.stringify(albums));

        hideAddAlbumForm();
        loadAlbums();
        loadAlbumOptions();
        showNotification('⚠️ Album created in localStorage only. Please start Flask backend for full functionality.', 'warning');
    }
}

// Load albums
function loadAlbums() {
    const albumsGrid = document.getElementById('albumsGrid');
    if (!albumsGrid) return;

    const albums = JSON.parse(localStorage.getItem('galleryAlbums') || '[]');

    if (albums.length === 0) {
        albumsGrid.innerHTML = '<div class="no-albums">No albums created yet. Create your first album!</div>';
        return;
    }

    albumsGrid.innerHTML = albums.map(album => `
        <div class="album-card text-only" onclick="viewAlbum('${album.id}')">
            <div class="album-content">
                <div class="album-icon">
                    <i class="fas fa-images"></i>
                </div>
                <div class="album-info">
                    <h3>${album.name}</h3>
                    <p>${album.images.length} images</p>
                    ${album.description ? `<p class="album-desc">${album.description}</p>` : ''}
                </div>
            </div>
            <div class="album-actions">
                <button onclick="event.stopPropagation(); deleteAlbum('${album.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load album options for dropdown
function loadAlbumOptions() {
    const selectAlbum = document.getElementById('selectAlbum');
    if (!selectAlbum) return;

    const albums = JSON.parse(localStorage.getItem('galleryAlbums') || '[]');
    selectAlbum.innerHTML = '<option value="">Choose Album</option>';

    albums.forEach(album => {
        selectAlbum.innerHTML += `<option value="${album.id}">${album.name}</option>`;
    });
}

// Preview images before upload
function previewImages(event) {
    const files = event.target.files;
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = '';

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview';
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                container.appendChild(preview);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Add images to album
async function addImagesToAlbum() {
    const albumId = document.getElementById('selectAlbum').value;
    const files = document.getElementById('imageUpload').files;

    if (!albumId || files.length === 0) {
        showNotification('Please select an album and choose images.', 'error');
        return;
    }

    try {
        let processedFiles = 0;
        const totalFiles = files.length;
        const imageDataArray = [];

        // Process all files first
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                const imageData = await new Promise((resolve) => {
                    reader.onload = (e) => {
                        resolve({
                            src: e.target.result,
                            name: file.name
                        });
                    };
                    reader.readAsDataURL(file);
                });
                imageDataArray.push(imageData);
            }
        }

        // Send to Flask backend
        const response = await fetch(`/api/gallery/albums/${albumId}/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                images: imageDataArray
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Also update localStorage for admin interface
            const albums = JSON.parse(localStorage.getItem('galleryAlbums') || '[]');
            const albumIndex = albums.findIndex(album => album.id === albumId);

            if (albumIndex !== -1) {
                imageDataArray.forEach((imgData) => {
                    albums[albumIndex].images.push({
                        id: Date.now() + Math.random(),
                        src: imgData.src,
                        name: imgData.name,
                        uploadDate: new Date().toISOString()
                    });
                });
                localStorage.setItem('galleryAlbums', JSON.stringify(albums));
            }

            hideAddImageForm();
            loadAlbums();
            showNotification(`✅ ${totalFiles} images uploaded to backend successfully! All visitors can now see them.`, 'success');
        } else {
            throw new Error(result.error || 'Failed to upload images');
        }

    } catch (error) {
        console.error('Backend not available, using localStorage:', error);
        
        // Fallback to original localStorage method
        const albums = JSON.parse(localStorage.getItem('galleryAlbums') || '[]');
        const albumIndex = albums.findIndex(album => album.id === albumId);

        if (albumIndex === -1) {
            showNotification('Album not found.', 'error');
            return;
        }

        let processedFiles = 0;
        const totalFiles = files.length;

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        id: Date.now() + Math.random(),
                        src: e.target.result,
                        name: file.name,
                        uploadDate: new Date().toISOString()
                    };

                    albums[albumIndex].images.push(imageData);
                    processedFiles++;

                    if (processedFiles === totalFiles) {
                        localStorage.setItem('galleryAlbums', JSON.stringify(albums));
                        hideAddImageForm();
                        loadAlbums();
                        showNotification(`⚠️ ${totalFiles} images saved to localStorage only. Please start Flask backend for full functionality.`, 'warning');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// View album images
function viewAlbum(albumId) {
    const albums = JSON.parse(localStorage.getItem('galleryAlbums') || '[]');
    const album = albums.find(a => a.id === albumId);

    if (!album) return;

    document.getElementById('selectedAlbumTitle').textContent = album.name;
    document.getElementById('albumsGrid').parentElement.style.display = 'none';
    document.getElementById('albumImagesContainer').style.display = 'block';

    const imagesGrid = document.getElementById('albumImagesGrid');
    if (album.images.length === 0) {
        imagesGrid.innerHTML = '<div class="no-images">No images in this album yet.</div>';
        return;
    }

    imagesGrid.innerHTML = album.images.map(image => `
        <div class="album-image-item">
            <img src="${image.src}" alt="${image.name}">
            <div class="image-overlay">
                <button onclick="deleteImageFromAlbum('${albumId}', '${image.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Show all albums
function showAllAlbums() {
    document.getElementById('albumsGrid').parentElement.style.display = 'block';
    document.getElementById('albumImagesContainer').style.display = 'none';
}

// Delete album
function deleteAlbum(albumId) {
    if (confirm('Are you sure you want to delete this album and all its images?')) {
        const albums = JSON.parse(localStorage.getItem('galleryAlbums') || '[]');
        const filteredAlbums = albums.filter(album => album.id !== albumId);
        localStorage.setItem('galleryAlbums', JSON.stringify(filteredAlbums));

        // Also save to content.json for public access
        saveToContentFile('galleryAlbums', filteredAlbums);

        loadAlbums();
        loadAlbumOptions();
        showNotification('Album deleted successfully!', 'success');
    }
}

// Delete image from album
function deleteImageFromAlbum(albumId, imageId) {
    if (confirm('Are you sure you want to delete this image?')) {
        const albums = JSON.parse(localStorage.getItem('galleryAlbums') || '[]');
        const albumIndex = albums.findIndex(album => album.id === albumId);

        if (albumIndex !== -1) {
            albums[albumIndex].images = albums[albumIndex].images.filter(img => img.id != imageId);
            localStorage.setItem('galleryAlbums', JSON.stringify(albums));

            // Also save to content.json for public access
            saveToContentFile('galleryAlbums', albums);

            viewAlbum(albumId);
            loadAlbums();
            showNotification('Image deleted successfully!', 'success');
        }
    }
}

// Slideshow management
function initializeSlideshowManagement() {
    console.log('Initializing slideshow management...');

    // Initialize slide form
    const slideForm = document.getElementById('slideForm');
    if (slideForm) {
        console.log('Slide form found, adding event listener');
        slideForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Slide form submitted');
            addSlide();
        });
    } else {
        console.log('Slide form not found');
    }

    // Initialize edit slide form
    const editSlideForm = document.getElementById('editSlideFormElement');
    if (editSlideForm) {
        console.log('Edit slide form found, adding event listener');
        editSlideForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Edit slide form submitted');
            updateSlide();
        });
    } else {
        console.log('Edit slide form not found');
    }

    // Initialize image preview
    const slideImage = document.getElementById('slideImage');
    if (slideImage) {
        slideImage.addEventListener('change', previewSlideImage);
    }

    const editSlideImage = document.getElementById('editSlideImage');
    if (editSlideImage) {
        editSlideImage.addEventListener('change', previewEditSlideImage);
    }

    // Load slides when slideshow section is active
    setTimeout(() => {
        loadSlides();
    }, 100);

    // Make functions globally accessible
    window.showAddSlideForm = showAddSlideForm;
    window.hideAddSlideForm = hideAddSlideForm;
    window.showEditSlideForm = showEditSlideForm;
    window.hideEditSlideForm = hideEditSlideForm;
    window.deleteSlide = deleteSlide;
    window.moveSlideUp = moveSlideUp;
    window.moveSlideDown = moveSlideDown;
    window.removeSlideImagePreview = removeSlideImagePreview;
    window.removeEditSlideImagePreview = removeEditSlideImagePreview;
}

// Show add slide form
function showAddSlideForm() {
    console.log('Showing add slide form');
    const addForm = document.getElementById('addSlideForm');
    const editForm = document.getElementById('editSlideForm');

    if (addForm) {
        addForm.style.display = 'block';
        console.log('Add form displayed');
    } else {
        console.log('Add form not found');
    }

    if (editForm) {
        editForm.style.display = 'none';
    }
}

// Hide add slide form
function hideAddSlideForm() {
    document.getElementById('addSlideForm').style.display = 'none';
    document.getElementById('slideForm').reset();
    document.getElementById('slideImagePreview').style.display = 'none';
}

// Show edit slide form
function showEditSlideForm(slideId) {
    const slides = JSON.parse(localStorage.getItem('homeSlides') || '[]');
    const slide = slides.find(s => s.id === slideId);

    if (!slide) return;

    // Hide add form if it's open
    hideAddSlideForm();

    // Populate form with slide data
    document.getElementById('editSlideId').value = slide.id;
    document.getElementById('editSlideTitle').value = slide.title;
    document.getElementById('editSlideDescription').value = slide.description || '';
    document.getElementById('editSlideButtonText').value = slide.buttonText || '';
    document.getElementById('editSlideButtonLink').value = slide.buttonLink || '';

    // Show current image if exists
    if (slide.image) {
        const preview = document.getElementById('editSlideImagePreview');
        const previewImg = document.getElementById('editSlidePreviewImg');
        previewImg.src = slide.image;
        preview.style.display = 'block';
    }

    document.getElementById('editSlideForm').style.display = 'block';
    document.getElementById('editSlideForm').scrollIntoView({ behavior: 'smooth' });
}

// Hide edit slide form
function hideEditSlideForm() {
    document.getElementById('editSlideForm').style.display = 'none';
    document.getElementById('editSlideFormElement').reset();
    document.getElementById('editSlideImagePreview').style.display = 'none';
}

// Preview slide image
function previewSlideImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('slideImagePreview');
            const previewImg = document.getElementById('slidePreviewImg');
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Preview edit slide image
function previewEditSlideImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('editSlideImagePreview');
            const previewImg = document.getElementById('editSlidePreviewImg');
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Remove slide image preview
function removeSlideImagePreview() {
    document.getElementById('slideImagePreview').style.display = 'none';
    document.getElementById('slideImage').value = '';
}

// Remove edit slide image preview
function removeEditSlideImagePreview() {
    document.getElementById('editSlideImagePreview').style.display = 'none';
    document.getElementById('editSlideImage').value = '';
}

// Add slide
async function addSlide() {
    console.log('Adding slide...');

    const titleElement = document.getElementById('slideTitle');
    const descriptionElement = document.getElementById('slideDescription');
    const buttonTextElement = document.getElementById('slideButtonText');
    const buttonLinkElement = document.getElementById('slideButtonLink');
    const imageElement = document.getElementById('slideImage');

    if (!titleElement || !imageElement) {
        console.error('Form elements not found');
        alert('Form elements not found. Please refresh the page and try again.');
        return;
    }

    const title = titleElement.value.trim();
    const description = descriptionElement?.value.trim() || '';
    const buttonText = buttonTextElement?.value.trim() || '';
    const buttonLink = buttonLinkElement?.value.trim() || '';
    const imageFile = imageElement.files[0];

    console.log('Form data:', { title, description, buttonText, buttonLink, hasImage: !!imageFile });

    if (!title) {
        alert('Please enter a slide title.');
        titleElement.focus();
        return;
    }

    if (!imageFile) {
        alert('Please select an image for the slide.');
        imageElement.focus();
        return;
    }

    // Validate image file
    if (!imageFile.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, GIF, etc.).');
        imageElement.focus();
        return;
    }

    // Check file size (limit to 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please select an image smaller than 5MB.');
        imageElement.focus();
        return;
    }

    console.log('Processing image...');

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            console.log('Image loaded, creating slide data...');

            const slideData = {
                id: Date.now().toString(),
                title,
                description,
                buttonText,
                buttonLink,
                image: e.target.result,
                original_name: imageFile.name,
                createdAt: new Date().toISOString()
            };

            try {
                // Save to Flask backend
                const response = await fetch('/api/slideshow/slides', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(slideData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Also save to localStorage for admin interface
                    const slides = JSON.parse(localStorage.getItem('homeSlides') || '[]');
                    slides.push(slideData);
                    localStorage.setItem('homeSlides', JSON.stringify(slides));

                    console.log('Slide saved to backend successfully');
                    hideAddSlideForm();
                    loadSlides();
                    alert('✅ Slide added to backend successfully! All visitors can now see it.');
                } else {
                    throw new Error(result.error || 'Failed to save slide to backend');
                }
            } catch (backendError) {
                console.error('Backend not available, using localStorage:', backendError);
                
                // Fallback to localStorage
                const slides = JSON.parse(localStorage.getItem('homeSlides') || '[]');
                slides.push(slideData);
                localStorage.setItem('homeSlides', JSON.stringify(slides));

                console.log('Slide saved to localStorage only');
                hideAddSlideForm();
                loadSlides();
                alert('⚠️ Slide saved to localStorage only. Please start Flask backend for full functionality.');
            }

        } catch (error) {
            console.error('Error saving slide:', error);
            alert('Error saving slide. Please try again.');
        }
    };

    reader.onerror = (error) => {
        console.error('Error reading image file:', error);
        alert('Error reading image file. Please try a different image.');
    };

    reader.readAsDataURL(imageFile);
}

// Update slide
function updateSlide() {
    const slideId = document.getElementById('editSlideId').value;
    const title = document.getElementById('editSlideTitle').value;
    const description = document.getElementById('editSlideDescription').value;
    const buttonText = document.getElementById('editSlideButtonText').value;
    const buttonLink = document.getElementById('editSlideButtonLink').value;
    const imageFile = document.getElementById('editSlideImage').files[0];

    if (!title) {
        showNotification('Please fill in slide title.', 'error');
        return;
    }

    const slides = JSON.parse(localStorage.getItem('homeSlides') || '[]');
    const slideIndex = slides.findIndex(s => s.id === slideId);

    if (slideIndex === -1) {
        showNotification('Slide not found.', 'error');
        return;
    }

    const updateSlideData = () => {
        slides[slideIndex] = {
            ...slides[slideIndex],
            title,
            description,
            buttonText,
            buttonLink,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('homeSlides', JSON.stringify(slides));
        
        // Also save to content.json for public access
        saveToContentFile('homeSlides', slides);
        
        hideEditSlideForm();
        loadSlides();
        showNotification('Slide updated successfully!', 'success');
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            slides[slideIndex].image = e.target.result;
            updateSlideData();
        };
        reader.readAsDataURL(imageFile);
    } else {
        updateSlideData();
    }
}

// Load slides
function loadSlides() {
    const slidesList = document.getElementById('slidesList');
    if (!slidesList) return;

    const slides = JSON.parse(localStorage.getItem('homeSlides') || '[]');

    if (slides.length === 0) {
        slidesList.innerHTML = '<div class="no-slides">No slides created yet. Add your first slide!</div>';
        return;
    }

    slidesList.innerHTML = slides.map((slide, index) => `
        <div class="slide-card">
            <div class="slide-image">
                <img src="${slide.image}" alt="${slide.title}">
                <div class="slide-order">#${index + 1}</div>
            </div>
            <div class="slide-info">
                <h3>${slide.title}</h3>
                ${slide.description ? `<p class="slide-desc">${slide.description}</p>` : ''}
                ${slide.buttonText ? `<div class="slide-button-info">
                    <strong>Button:</strong> ${slide.buttonText}
                    ${slide.buttonLink ? ` → ${slide.buttonLink}` : ''}
                </div>` : ''}
            </div>
            <div class="slide-actions">
                <button onclick="showEditSlideForm('${slide.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteSlide('${slide.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
                ${index > 0 ? `<button onclick="moveSlideUp('${slide.id}')" class="move-btn">
                    <i class="fas fa-arrow-up"></i>
                </button>` : ''}
                ${index < slides.length - 1 ? `<button onclick="moveSlideDown('${slide.id}')" class="move-btn">
                    <i class="fas fa-arrow-down"></i>
                </button>` : ''}
            </div>
        </div>
    `).join('');
}

// Delete slide
function deleteSlide(slideId) {
    if (confirm('Are you sure you want to delete this slide?')) {
        const slides = JSON.parse(localStorage.getItem('homeSlides') || '[]');
        const filteredSlides = slides.filter(slide => slide.id !== slideId);
        localStorage.setItem('homeSlides', JSON.stringify(filteredSlides));

        // Also save to content.json for public access
        saveToContentFile('homeSlides', filteredSlides);

        loadSlides();
        showNotification('Slide deleted successfully!', 'success');
    }
}

// Move slide up
function moveSlideUp(slideId) {
    const slides = JSON.parse(localStorage.getItem('homeSlides') || '[]');
    const slideIndex = slides.findIndex(s => s.id === slideId);

    if (slideIndex > 0) {
        [slides[slideIndex], slides[slideIndex - 1]] = [slides[slideIndex - 1], slides[slideIndex]];
        localStorage.setItem('homeSlides', JSON.stringify(slides));
        
        // Also save to content.json for public access
        saveToContentFile('homeSlides', slides);
        
        loadSlides();
        showNotification('Slide moved up!', 'success');
    }
}

// Move slide down
function moveSlideDown(slideId) {
    const slides = JSON.parse(localStorage.getItem('homeSlides') || '[]');
    const slideIndex = slides.findIndex(s => s.id === slideId);

    if (slideIndex < slides.length - 1) {
        [slides[slideIndex], slides[slideIndex + 1]] = [slides[slideIndex + 1], slides[slideIndex]];
        localStorage.setItem('homeSlides', JSON.stringify(slides));
        
        // Also save to content.json for public access
        saveToContentFile('homeSlides', slides);
        
        loadSlides();
        showNotification('Slide moved down!', 'success');
    }
}

// Event management
function initializeEventManagement() {
    loadEvents();
    initializeEventImageUpload();
    initializeEventForm();
}

// Initialize event image upload
function initializeEventImageUpload() {
    const imageUpload = document.getElementById('eventImageUpload');
    const imagePreview = document.getElementById('eventImagePreview');
    const previewImg = document.getElementById('previewImg');

    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Initialize event form
function initializeEventForm() {
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEventWithImage();
        });
    }
}

// Remove event image
function removeEventImage() {
    document.getElementById('eventImageUpload').value = '';
    document.getElementById('eventImagePreview').style.display = 'none';
}

// Save event with image
function saveEventWithImage() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const description = document.getElementById('eventDescription').value;
    const category = document.getElementById('eventCategory').value;
    const imageFile = document.getElementById('eventImageUpload').files[0];
    const editId = document.getElementById('eventForm').getAttribute('data-edit-id');

    if (!title || !date || !time) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }

    const eventData = {
        id: editId || Date.now().toString(),
        title,
        date,
        time,
        location: location || 'Main Shrine',
        description,
        category,
        createdAt: editId ? getEventById(editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: editId ? new Date().toISOString() : undefined
    };

    // Handle image
    const processEvent = (finalEventData) => {
        if (editId) {
            updateEventInStorage(finalEventData);
            showNotification('Event updated successfully!', 'success');
        } else {
            saveEventToStorage(finalEventData);
            showNotification('Event saved successfully!', 'success');
        }
        resetEventForm();
        loadEvents();
        hideAddEventForm();
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            eventData.image = e.target.result;
            processEvent(eventData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // If editing and no new image, keep existing image
        if (editId) {
            const existingEvent = getEventById(editId);
            if (existingEvent && existingEvent.image) {
                eventData.image = existingEvent.image;
            }
        }
        processEvent(eventData);
    }
}

// Get event by ID
function getEventById(eventId) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    return events.find(event => event.id === eventId);
}

// Update event in storage
function updateEventInStorage(eventData) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const eventIndex = events.findIndex(event => event.id === eventData.id);

    if (eventIndex !== -1) {
        events[eventIndex] = eventData;
        localStorage.setItem('events', JSON.stringify(events));
    }
}

// Save event to storage
function saveEventToStorage(eventData) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    events.push(eventData);
    localStorage.setItem('events', JSON.stringify(events));
}

// Reset event form
function resetEventForm() {
    const form = document.getElementById('eventForm');
    form.reset();
    form.removeAttribute('data-edit-id');
    document.getElementById('eventImagePreview').style.display = 'none';

    // Reset button text
    const saveBtn = document.querySelector('#eventForm .save-btn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Event';
}

// Show add event form
function showAddEventForm() {
    const form = document.getElementById('addEventForm');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// Hide add event form
function hideAddEventForm() {
    const form = document.getElementById('addEventForm');
    if (form) {
        form.style.display = 'none';
        resetEventForm();
    }
}

// Load events
function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    eventsList.innerHTML = '';
    
    if (events.length === 0) {
        eventsList.innerHTML = '<p class="no-events">No events scheduled yet.</p>';
        return;
    }
    
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-info">
                <h3>${event.title}</h3>
                <p><i class="fas fa-calendar"></i> ${formatDate(event.date)}</p>
                <p><i class="fas fa-clock"></i> ${formatTime(event.time)}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${event.location || 'Main Shrine'}</p>
                <p class="event-description">${event.description}</p>
            </div>
            <div class="event-actions">
                <button onclick="editEvent('${event.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEvent('${event.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        eventsList.appendChild(eventCard);
    });
}

// Save event
function saveEvent(eventData) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    events.push(eventData);
    localStorage.setItem('events', JSON.stringify(events));
}

// Edit event
function editEvent(eventId) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events.find(e => e.id === eventId);

    if (!event) {
        showNotification('Event not found!', 'error');
        return;
    }

    // Fill the form with event data
    document.getElementById('eventTitle').value = event.title || '';
    document.getElementById('eventDate').value = event.date || '';
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventCategory').value = event.category || 'religious';

    // Show image preview if exists
    if (event.image) {
        const previewImg = document.getElementById('previewImg');
        const imagePreview = document.getElementById('eventImagePreview');
        previewImg.src = event.image;
        imagePreview.style.display = 'block';
    }

    // Show the form
    showAddEventForm();

    // Store the event ID for updating
    document.getElementById('eventForm').setAttribute('data-edit-id', eventId);

    // Change button text
    const saveBtn = document.querySelector('#eventForm .save-btn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Update Event';
}

// Delete event
function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const filteredEvents = events.filter(event => event.id != eventId);
        localStorage.setItem('events', JSON.stringify(filteredEvents));

        loadEvents();
        showNotification('Event deleted successfully!', 'success');
    }
}

// Add quick link
function addQuickLink() {
    const quickLinksList = document.getElementById('quickLinksList');
    const newLinkItem = document.createElement('div');
    newLinkItem.className = 'quick-link-item';
    newLinkItem.innerHTML = `
        <input type="text" placeholder="Link Title">
        <input type="text" placeholder="Link URL">
        <button type="button" class="remove-link-btn" onclick="removeQuickLink(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    quickLinksList.appendChild(newLinkItem);
}

// Remove quick link
function removeQuickLink(button) {
    button.parentElement.remove();
}

// Initialize footer management
function initializeFooterManagement() {
    // Initialize footer tabs
    const footerTabBtns = document.querySelectorAll('.footer-tabs .tab-btn');
    const footerTabPanes = document.querySelectorAll('.footer-management .tab-pane');

    footerTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Remove active class from all tabs and panes
            footerTabBtns.forEach(tb => tb.classList.remove('active'));
            footerTabPanes.forEach(tp => tp.classList.remove('active'));

            // Add active class to clicked tab and corresponding pane
            btn.classList.add('active');
            const targetPane = document.getElementById(`${targetTab}-tab`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // Initialize remove link buttons
    const removeBtns = document.querySelectorAll('.remove-link-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', () => removeQuickLink(btn));
    });

    // Initialize save buttons and forms
    const saveContactBtn = document.getElementById('saveContactInfo');
    const saveQuickLinksBtn = document.getElementById('saveQuickLinks');
    const socialMediaForm = document.getElementById('socialMediaForm');

    if (saveContactBtn) {
        saveContactBtn.addEventListener('click', saveContactInfo);
    }
    if (saveQuickLinksBtn) {
        saveQuickLinksBtn.addEventListener('click', saveQuickLinks);
    }
    if (socialMediaForm) {
        socialMediaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSocialMedia();
        });
    }

    // Initialize social media input listeners for preview
    const socialInputs = ['facebookUrl', 'instagramUrl', 'youtubeUrl', 'twitterUrl', 'whatsappNumber'];
    socialInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updateSocialPreview);
        }
    });

    // Load existing footer data
    loadFooterData();
}

// Initialize Jubilee management
function initializeJubileeManagement() {
    // Initialize jubilee tabs
    const jubileeTabs = document.querySelectorAll('.jubilee-tabs .tab-btn');
    jubileeTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetTab = e.target.getAttribute('data-tab');
            switchJubileeTab(targetTab);
        });
    });

    // Initialize jubilee content form
    const jubileeContentForm = document.getElementById('jubileeContentForm');
    if (jubileeContentForm) {
        jubileeContentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveJubileeContent();
        });
    }

    // Initialize jubilee image form
    const jubileeImageForm = document.getElementById('jubileeImageForm');
    if (jubileeImageForm) {
        jubileeImageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveJubileeImage();
        });
    }

    // Initialize image upload preview
    const jubileeImageUpload = document.getElementById('jubileeImageUpload');
    if (jubileeImageUpload) {
        jubileeImageUpload.addEventListener('change', previewJubileeImage);
    }

    loadJubileeData();
}

// Switch jubilee tabs
function switchJubileeTab(tabName) {
    // Hide all tab panes
    const tabPanes = document.querySelectorAll('.jubilee-tabs + * .tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.jubilee-tabs .tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab pane
    const selectedPane = document.getElementById(`${tabName}-tab`);
    if (selectedPane) {
        selectedPane.classList.add('active');
    }

    // Add active class to selected tab
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// Save jubilee content
function saveJubileeContent() {
    const jubileeData = {
        title: document.getElementById('jubileeTitle')?.value || '',
        intro: document.getElementById('jubileeIntro')?.value || '',
        milestone: document.getElementById('jubileeMilestone')?.value || '',
        dignitaries: document.getElementById('jubileeDignitaries')?.value || '',
        blessing: document.getElementById('jubileeBlessing')?.value || '',
        messages: document.getElementById('jubileeMessages')?.value || '',
        cultural: document.getElementById('jubileeCultural')?.value || '',
        legacy: document.getElementById('jubileeLegacy')?.value || '',
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('jubileeContent', JSON.stringify(jubileeData));
    showNotification('Jubilee content updated successfully!', 'success');
}

// Preview jubilee image
function previewJubileeImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('jubileeImagePreview');
    const previewImg = document.getElementById('jubileePreviewImg');

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Remove jubilee image preview
function removeJubileeImagePreview() {
    const preview = document.getElementById('jubileeImagePreview');
    const imageUpload = document.getElementById('jubileeImageUpload');

    preview.style.display = 'none';
    imageUpload.value = '';
}

// Save jubilee image
function saveJubileeImage() {
    const title = document.getElementById('jubileeImageTitle').value;
    const category = document.getElementById('jubileeImageCategory').value;
    const description = document.getElementById('jubileeImageDescription').value;
    const imageFile = document.getElementById('jubileeImageUpload').files[0];

    if (!title || !category || !imageFile) {
        showNotification('Please fill in all required fields and select an image.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = {
            id: Date.now().toString(),
            title,
            category,
            description,
            src: e.target.result,
            uploadedAt: new Date().toISOString()
        };

        const jubileeImages = JSON.parse(localStorage.getItem('jubileeImages') || '[]');
        jubileeImages.push(imageData);
        localStorage.setItem('jubileeImages', JSON.stringify(jubileeImages));

        // Reset form
        document.getElementById('jubileeImageForm').reset();
        removeJubileeImagePreview();

        // Reload images
        loadJubileeImages();
        showNotification('Jubilee image added successfully!', 'success');
    };
    reader.readAsDataURL(imageFile);
}

// Load jubilee data
function loadJubileeData() {
    // Load content data
    const jubileeContent = JSON.parse(localStorage.getItem('jubileeContent') || '{}');

    if (document.getElementById('jubileeTitle')) {
        document.getElementById('jubileeTitle').value = jubileeContent.title || 'Our Lady of Lourdes Shrine, Chetpet, Celebrates 125 Years of Grace and Devotion';
        document.getElementById('jubileeIntro').value = jubileeContent.intro || 'Chetpet, Tamil Nadu – Faith, history, and devotion came together in a grand and unforgettable way...';
        document.getElementById('jubileeMilestone').value = jubileeContent.milestone || 'The Shrine of Our Lady of Lourdes at Chetpet holds a unique place in the history of the Catholic Church in Tamil Nadu...';
        document.getElementById('jubileeDignitaries').value = jubileeContent.dignitaries || 'The jubilee celebrations were honored by the presence of Most Rev. Dr. Leopoldo Girelli, Apostolic Nuncio to India...';
        document.getElementById('jubileeBlessing').value = jubileeContent.blessing || 'A moment of profound grace was witnessed when the Apostolic Nuncio, together with the Archbishop and bishops...';
        document.getElementById('jubileeMessages').value = jubileeContent.messages || 'In his address, Most Rev. Dr. Leopoldo Girelli highlighted the universal role of Mary...';
        document.getElementById('jubileeCultural').value = jubileeContent.cultural || 'Beyond the liturgical celebrations, the jubilee was enriched with cultural programs...';
        document.getElementById('jubileeLegacy').value = jubileeContent.legacy || 'The 125th Jubilee of Our Lady of Lourdes Shrine, Chetpet, stands as a historic and grace-filled moment...';
    }

    // Load images
    loadJubileeImages();
}

// Load jubilee images
function loadJubileeImages() {
    const jubileeImages = JSON.parse(localStorage.getItem('jubileeImages') || '[]');
    const imagesGrid = document.getElementById('jubileeImagesGrid');

    if (!imagesGrid) return;

    if (jubileeImages.length === 0) {
        imagesGrid.innerHTML = '<div class="no-images">No jubilee images uploaded yet.</div>';
        return;
    }

    imagesGrid.innerHTML = jubileeImages.map(image => `
        <div class="jubilee-image-item">
            <img src="${image.src}" alt="${image.title}">
            <div class="image-overlay">
                <h4>${image.title}</h4>
                <p class="image-category">${image.category}</p>
                <p class="image-description">${image.description}</p>
                <button onclick="deleteJubileeImage('${image.id}')" class="delete-image-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Delete jubilee image
function deleteJubileeImage(imageId) {
    if (confirm('Are you sure you want to delete this jubilee image?')) {
        const jubileeImages = JSON.parse(localStorage.getItem('jubileeImages') || '[]');
        const filteredImages = jubileeImages.filter(img => img.id !== imageId);
        localStorage.setItem('jubileeImages', JSON.stringify(filteredImages));

        loadJubileeImages();
        showNotification('Jubilee image deleted successfully!', 'success');
    }
}

// Initialize Madha Malai management
function initializeMadhaMalaiManagement() {
    // Initialize madha malai tabs
    const madhaMalaiTabs = document.querySelectorAll('.madha-malai-tabs .tab-btn');
    madhaMalaiTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetTab = e.target.getAttribute('data-tab');
            switchMadhaMalaiTab(targetTab);
        });
    });

    // Initialize content form
    const madhaMalaiContentForm = document.getElementById('madhaMalaiContentForm');
    if (madhaMalaiContentForm) {
        madhaMalaiContentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveMadhaMalaiContent();
        });
    }

    // Initialize pilgrimage form
    const madhaMalaiPilgrimageForm = document.getElementById('madhaMalaiPilgrimageForm');
    if (madhaMalaiPilgrimageForm) {
        madhaMalaiPilgrimageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveMadhaMalaiPilgrimage();
        });
    }

    // Initialize facilities form
    const madhaMalaiFacilitiesForm = document.getElementById('madhaMalaiFacilitiesForm');
    if (madhaMalaiFacilitiesForm) {
        madhaMalaiFacilitiesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveMadhaMalaiFacilities();
        });
    }

    // Initialize image form
    const madhaMalaiImageForm = document.getElementById('madhaMalaiImageForm');
    if (madhaMalaiImageForm) {
        madhaMalaiImageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveMadhaMalaiImage();
        });
    }

    // Initialize image upload preview
    const madhaMalaiImageUpload = document.getElementById('madhaMalaiImageUpload');
    if (madhaMalaiImageUpload) {
        madhaMalaiImageUpload.addEventListener('change', previewMadhaMalaiImage);
    }

    loadMadhaMalaiData();
}

// Switch Madha Malai tabs
function switchMadhaMalaiTab(tabName) {
    // Hide all tab panes
    const tabPanes = document.querySelectorAll('.madha-malai-tabs + * .tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.madha-malai-tabs .tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab pane
    const selectedPane = document.getElementById(`${tabName}-tab`);
    if (selectedPane) {
        selectedPane.classList.add('active');
    }

    // Add active class to selected tab
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// Save Madha Malai content
function saveMadhaMalaiContent() {
    const contentData = {
        title: document.getElementById('madhaMalaiTitle')?.value || '',
        intro: document.getElementById('madhaMalaiIntro')?.value || '',
        history: document.getElementById('madhaMalaiHistory')?.value || '',
        significance: document.getElementById('madhaMalaiSignificance')?.value || '',
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('madhaMalaiContent', JSON.stringify(contentData));
    showNotification('Madha Malai content updated successfully!', 'success');
}

// Save Madha Malai pilgrimage info
function saveMadhaMalaiPilgrimage() {
    const pilgrimageData = {
        overview: document.getElementById('madhaMalaiPilgrimage')?.value || '',
        bestTime: document.getElementById('madhaMalaiBestTime')?.value || '',
        route: document.getElementById('madhaMalaiRoute')?.value || '',
        events: document.getElementById('madhaMalaiEvents')?.value || '',
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('madhaMalaiPilgrimage', JSON.stringify(pilgrimageData));
    showNotification('Madha Malai pilgrimage info updated successfully!', 'success');
}

// Save Madha Malai facilities
function saveMadhaMalaiFacilities() {
    const facilitiesData = {
        accommodation: document.getElementById('madhaMalaiAccommodation')?.value || '',
        dining: document.getElementById('madhaMalaiDining')?.value || '',
        transportation: document.getElementById('madhaMalaiTransportation')?.value || '',
        otherFacilities: document.getElementById('madhaMalaiOtherFacilities')?.value || '',
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('madhaMalaiFacilities', JSON.stringify(facilitiesData));
    showNotification('Madha Malai facilities info updated successfully!', 'success');
}

// Preview Madha Malai image
function previewMadhaMalaiImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('madhaMalaiImagePreview');
    const previewImg = document.getElementById('madhaMalaiPreviewImg');

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Remove Madha Malai image preview
function removeMadhaMalaiImagePreview() {
    const preview = document.getElementById('madhaMalaiImagePreview');
    const imageUpload = document.getElementById('madhaMalaiImageUpload');

    preview.style.display = 'none';
    imageUpload.value = '';
}

// Save Madha Malai image
function saveMadhaMalaiImage() {
    const title = document.getElementById('madhaMalaiImageTitle').value;
    const category = document.getElementById('madhaMalaiImageCategory').value;
    const description = document.getElementById('madhaMalaiImageDescription').value;
    const imageFile = document.getElementById('madhaMalaiImageUpload').files[0];

    if (!title || !category || !imageFile) {
        showNotification('Please fill in all required fields and select an image.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = {
            id: Date.now().toString(),
            title,
            category,
            description,
            src: e.target.result,
            uploadedAt: new Date().toISOString()
        };

        const madhaMalaiImages = JSON.parse(localStorage.getItem('madhaMalaiImages') || '[]');
        madhaMalaiImages.push(imageData);
        localStorage.setItem('madhaMalaiImages', JSON.stringify(madhaMalaiImages));

        // Reset form
        document.getElementById('madhaMalaiImageForm').reset();
        removeMadhaMalaiImagePreview();

        // Reload images
        loadMadhaMalaiImages();
        showNotification('Madha Malai image added successfully!', 'success');
    };
    reader.readAsDataURL(imageFile);
}

// Load Madha Malai data
function loadMadhaMalaiData() {
    // Load content data
    const contentData = JSON.parse(localStorage.getItem('madhaMalaiContent') || '{}');
    if (document.getElementById('madhaMalaiTitle')) {
        document.getElementById('madhaMalaiTitle').value = contentData.title || 'Madha Malai - Sacred Hill of Our Lady';
        document.getElementById('madhaMalaiIntro').value = contentData.intro || 'Madha Malai, meaning "Mother\'s Hill," is a sacred pilgrimage site dedicated to Our Lady of Lourdes...';
        document.getElementById('madhaMalaiHistory').value = contentData.history || 'The history of Madha Malai dates back to the early 20th century when devotees began making pilgrimages...';
        document.getElementById('madhaMalaiSignificance').value = contentData.significance || 'Madha Malai holds deep spiritual significance for devotees of Our Lady of Lourdes...';
    }

    // Load pilgrimage data
    const pilgrimageData = JSON.parse(localStorage.getItem('madhaMalaiPilgrimage') || '{}');
    if (document.getElementById('madhaMalaiPilgrimage')) {
        document.getElementById('madhaMalaiPilgrimage').value = pilgrimageData.overview || 'Pilgrims from across Tamil Nadu and beyond visit Madha Malai throughout the year...';
        document.getElementById('madhaMalaiBestTime').value = pilgrimageData.bestTime || 'The ideal time for pilgrimage to Madha Malai is during the cooler months...';
        document.getElementById('madhaMalaiRoute').value = pilgrimageData.route || 'The pilgrimage route to Madha Malai begins from the main shrine...';
        document.getElementById('madhaMalaiEvents').value = pilgrimageData.events || 'Throughout the year, Madha Malai hosts several special religious events...';
    }

    // Load facilities data
    const facilitiesData = JSON.parse(localStorage.getItem('madhaMalaiFacilities') || '{}');
    if (document.getElementById('madhaMalaiAccommodation')) {
        document.getElementById('madhaMalaiAccommodation').value = facilitiesData.accommodation || 'Accommodation facilities available for pilgrims...';
        document.getElementById('madhaMalaiDining').value = facilitiesData.dining || 'Simple vegetarian meals are available for pilgrims...';
        document.getElementById('madhaMalaiTransportation').value = facilitiesData.transportation || 'Transportation options to reach Madha Malai...';
        document.getElementById('madhaMalaiOtherFacilities').value = facilitiesData.otherFacilities || 'Additional facilities and services available...';
    }

    // Load images
    loadMadhaMalaiImages();
}

// Load Madha Malai images
function loadMadhaMalaiImages() {
    const madhaMalaiImages = JSON.parse(localStorage.getItem('madhaMalaiImages') || '[]');
    const imagesGrid = document.getElementById('madhaMalaiImagesGrid');

    if (!imagesGrid) return;

    if (madhaMalaiImages.length === 0) {
        imagesGrid.innerHTML = '<div class="no-images">No Madha Malai images uploaded yet.</div>';
        return;
    }

    imagesGrid.innerHTML = madhaMalaiImages.map(image => `
        <div class="madha-malai-image-item">
            <img src="${image.src}" alt="${image.title}">
            <div class="image-overlay">
                <h4>${image.title}</h4>
                <p class="image-category">${image.category}</p>
                <p class="image-description">${image.description}</p>
                <button onclick="deleteMadhaMalaiImage('${image.id}')" class="delete-image-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Delete Madha Malai image
function deleteMadhaMalaiImage(imageId) {
    if (confirm('Are you sure you want to delete this Madha Malai image?')) {
        const madhaMalaiImages = JSON.parse(localStorage.getItem('madhaMalaiImages') || '[]');
        const filteredImages = madhaMalaiImages.filter(img => img.id !== imageId);
        localStorage.setItem('madhaMalaiImages', JSON.stringify(filteredImages));

        loadMadhaMalaiImages();
        showNotification('Madha Malai image deleted successfully!', 'success');
    }
}

// Initialize Priests Management
function initializePriestsManagement() {
    // Initialize priest form
    const priestForm = document.getElementById('priestForm');
    if (priestForm) {
        priestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            savePriest();
        });
    }

    // Initialize edit priest form
    const editPriestForm = document.getElementById('editPriestFormElement');
    if (editPriestForm) {
        editPriestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updatePriest();
        });
    }

    // Initialize image upload previews
    const priestPhoto = document.getElementById('priestPhoto');
    if (priestPhoto) {
        priestPhoto.addEventListener('change', previewPriestImage);
    }

    const editPriestPhoto = document.getElementById('editPriestPhoto');
    if (editPriestPhoto) {
        editPriestPhoto.addEventListener('change', previewEditPriestImage);
    }

    loadPriests();
}

// Show add priest form
function showAddPriestForm() {
    const form = document.getElementById('addPriestForm');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// Hide add priest form
function hideAddPriestForm() {
    const form = document.getElementById('addPriestForm');
    if (form) {
        form.style.display = 'none';
        document.getElementById('priestForm').reset();
        removePriestImagePreview();
    }
}

// Show edit priest form
function showEditPriestForm(priestId) {
    console.log('Editing priest with ID:', priestId);

    const priests = JSON.parse(localStorage.getItem('shrinePriests') || '[]');
    const priest = priests.find(p => p.id === priestId);

    if (!priest) {
        showNotification('Priest not found!', 'error');
        return;
    }

    // Hide add form if it's open
    hideAddPriestForm();

    // Populate form with priest data
    const editPriestId = document.getElementById('editPriestId');
    const editPriestName = document.getElementById('editPriestName');
    const editPriestDesignation = document.getElementById('editPriestDesignation');
    const editPriestAbout = document.getElementById('editPriestAbout');
    const editPriestContact = document.getElementById('editPriestContact');

    if (editPriestId) editPriestId.value = priest.id;
    if (editPriestName) editPriestName.value = priest.name;
    if (editPriestDesignation) editPriestDesignation.value = priest.designation;
    if (editPriestAbout) editPriestAbout.value = priest.about || '';
    if (editPriestContact) editPriestContact.value = priest.contact || '';

    // Show current image if exists
    if (priest.photo) {
        const preview = document.getElementById('editPriestImagePreview');
        const previewImg = document.getElementById('editPriestPreviewImg');
        if (preview && previewImg) {
            previewImg.src = priest.photo;
            preview.style.display = 'block';
        }
    } else {
        // Hide preview if no image
        const preview = document.getElementById('editPriestImagePreview');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    const form = document.getElementById('editPriestForm');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
        showNotification('Edit form opened for ' + priest.name, 'success');
    } else {
        showNotification('Edit form not found!', 'error');
    }
}

// Hide edit priest form
function hideEditPriestForm() {
    const form = document.getElementById('editPriestForm');
    if (form) {
        form.style.display = 'none';
        document.getElementById('editPriestFormElement').reset();
        removeEditPriestImagePreview();
    }
}

// Preview priest image
function previewPriestImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('priestImagePreview');
    const previewImg = document.getElementById('priestPreviewImg');

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Preview edit priest image
function previewEditPriestImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('editPriestImagePreview');
    const previewImg = document.getElementById('editPriestPreviewImg');

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Remove priest image preview
function removePriestImagePreview() {
    const preview = document.getElementById('priestImagePreview');
    const imageUpload = document.getElementById('priestPhoto');

    preview.style.display = 'none';
    imageUpload.value = '';
}

// Remove edit priest image preview
function removeEditPriestImagePreview() {
    const preview = document.getElementById('editPriestImagePreview');
    const imageUpload = document.getElementById('editPriestPhoto');

    preview.style.display = 'none';
    if (imageUpload) imageUpload.value = '';
}

// Save priest
function savePriest() {
    const name = document.getElementById('priestName').value;
    const designation = document.getElementById('priestDesignation').value;
    const about = document.getElementById('priestAbout').value;
    const contact = document.getElementById('priestContact').value;
    const photoFile = document.getElementById('priestPhoto').files[0];

    if (!name || !designation || !photoFile) {
        showNotification('Please fill in all required fields and select a photo.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const priestData = {
            id: Date.now().toString(),
            name,
            designation,
            about,
            contact,
            photo: e.target.result,
            createdAt: new Date().toISOString()
        };

        const priests = JSON.parse(localStorage.getItem('shrinePriests') || '[]');
        priests.push(priestData);
        localStorage.setItem('shrinePriests', JSON.stringify(priests));

        hideAddPriestForm();
        loadPriests();
        showNotification('Priest added successfully!', 'success');
    };
    reader.readAsDataURL(photoFile);
}

// Update priest
function updatePriest() {
    console.log('Updating priest...');

    const priestId = document.getElementById('editPriestId')?.value;
    const name = document.getElementById('editPriestName')?.value;
    const designation = document.getElementById('editPriestDesignation')?.value;
    const about = document.getElementById('editPriestAbout')?.value;
    const contact = document.getElementById('editPriestContact')?.value;
    const photoFile = document.getElementById('editPriestPhoto')?.files[0];

    console.log('Form data:', { priestId, name, designation, about, contact, hasPhoto: !!photoFile });

    if (!priestId) {
        showNotification('Priest ID is missing. Please try again.', 'error');
        return;
    }

    if (!name || !designation) {
        showNotification('Please fill in all required fields (Name and Designation).', 'error');
        return;
    }

    const priests = JSON.parse(localStorage.getItem('shrinePriests') || '[]');
    const priestIndex = priests.findIndex(p => p.id === priestId);

    if (priestIndex === -1) {
        showNotification('Priest not found in database.', 'error');
        return;
    }

    const updatePriestData = () => {
        priests[priestIndex] = {
            ...priests[priestIndex],
            name,
            designation,
            about,
            contact,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('shrinePriests', JSON.stringify(priests));
        hideEditPriestForm();
        loadPriests();
        showNotification(`${name}'s information updated successfully!`, 'success');
        console.log('Priest updated successfully');
    };

    if (photoFile) {
        console.log('Updating with new photo...');
        const reader = new FileReader();
        reader.onload = (e) => {
            priests[priestIndex].photo = e.target.result;
            updatePriestData();
        };
        reader.readAsDataURL(photoFile);
    } else {
        console.log('Updating without new photo...');
        updatePriestData();
    }
}

// Load priests
function loadPriests() {
    const priests = JSON.parse(localStorage.getItem('shrinePriests') || '[]');
    const priestsList = document.getElementById('priestsList');

    if (!priestsList) return;

    if (priests.length === 0) {
        priestsList.innerHTML = '<div class="no-priests-admin">No priests added yet. Add the first priest!</div>';
        return;
    }

    priestsList.innerHTML = priests.map(priest => `
        <div class="priest-admin-card">
            <div class="priest-admin-photo">
                <img src="${priest.photo}" alt="${priest.name}">
            </div>
            <div class="priest-admin-info">
                <h3>${priest.name}</h3>
                <p class="priest-designation">${getDesignationText(priest.designation)}</p>
                <p class="priest-about">${priest.about || 'No description provided'}</p>
                ${priest.contact ? `<p class="priest-contact"><i class="fas fa-phone"></i> ${priest.contact}</p>` : ''}
                <div class="priest-admin-actions">
                    <button onclick="showEditPriestForm('${priest.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deletePriest('${priest.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get designation text
function getDesignationText(designation) {
    const designations = {
        'parish-priest-rector': 'Parish Priest & Rector',
        'administrator-madha-hill': 'Administrator of Madha Hill',
        'assistant-parish-priest': 'Assistant Parish Priest',
        'spiritual-director': 'Spiritual Director'
    };
    return designations[designation] || designation;
}

// Delete priest
function deletePriest(priestId) {
    if (confirm('Are you sure you want to delete this priest? This action cannot be undone.')) {
        const priests = JSON.parse(localStorage.getItem('shrinePriests') || '[]');
        const filteredPriests = priests.filter(priest => priest.id !== priestId);
        localStorage.setItem('shrinePriests', JSON.stringify(filteredPriests));

        loadPriests();
        showNotification('Priest deleted successfully!', 'success');
    }
}

// Save contact information
function saveContactInfo() {
    const contactData = {
        address: document.getElementById('footerAddress')?.value || '',
        phone: document.getElementById('footerPhone')?.value || '',
        email: document.getElementById('footerEmail')?.value || '',
        hours: document.getElementById('footerHours')?.value || ''
    };

    localStorage.setItem('footerContact', JSON.stringify(contactData));
    showNotification('Contact information updated successfully!', 'success');
}

// Save quick links
function saveQuickLinks() {
    const quickLinkItems = document.querySelectorAll('.quick-link-item');
    const quickLinks = [];

    quickLinkItems.forEach(item => {
        const titleInput = item.querySelector('input[placeholder="Link Title"]');
        const urlInput = item.querySelector('input[placeholder="Link URL"]');

        if (titleInput && urlInput && titleInput.value && urlInput.value) {
            quickLinks.push({
                title: titleInput.value,
                url: urlInput.value
            });
        }
    });

    localStorage.setItem('footerQuickLinks', JSON.stringify(quickLinks));
    showNotification('Quick links updated successfully!', 'success');
}

// Save social media links
function saveSocialMedia() {
    const socialData = {
        facebook: document.getElementById('facebookUrl')?.value || '',
        instagram: document.getElementById('instagramUrl')?.value || '',
        youtube: document.getElementById('youtubeUrl')?.value || '',
        twitter: document.getElementById('twitterUrl')?.value || '',
        whatsapp: document.getElementById('whatsappNumber')?.value || ''
    };

    // Validate URLs
    const urlFields = ['facebook', 'instagram', 'youtube', 'twitter'];
    for (let field of urlFields) {
        if (socialData[field] && !isValidUrl(socialData[field])) {
            showNotification(`Please enter a valid ${field} URL`, 'error');
            return;
        }
    }

    // Validate WhatsApp number
    if (socialData.whatsapp && !isValidPhoneNumber(socialData.whatsapp)) {
        showNotification('Please enter a valid WhatsApp number with country code', 'error');
        return;
    }

    localStorage.setItem('footerSocial', JSON.stringify(socialData));
    updateWebsiteFooters(socialData);
    showNotification('Social media links updated successfully!', 'success');
}

// Update social media preview
function updateSocialPreview() {
    const facebook = document.getElementById('facebookUrl')?.value || '';
    const instagram = document.getElementById('instagramUrl')?.value || '';
    const youtube = document.getElementById('youtubeUrl')?.value || '';
    const twitter = document.getElementById('twitterUrl')?.value || '';
    const whatsapp = document.getElementById('whatsappNumber')?.value || '';

    // Update preview links
    updatePreviewLink('previewFacebook', facebook);
    updatePreviewLink('previewInstagram', instagram);
    updatePreviewLink('previewYoutube', youtube);
    updatePreviewLink('previewTwitter', twitter);
    updatePreviewLink('previewWhatsapp', whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : '');
}

// Update individual preview link
function updatePreviewLink(elementId, url) {
    const element = document.getElementById(elementId);
    if (element) {
        if (url) {
            element.href = url;
            element.style.display = 'inline-block';
        } else {
            element.style.display = 'none';
        }
    }
}

// Validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Validate phone number
function isValidPhoneNumber(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[^0-9+]/g, ''));
}

// Update website footers with new social media data
function updateWebsiteFooters(socialData) {
    // Update the preview in admin panel
    updateSocialPreview();

    // Show success message with instructions
    const message = `
        Social media links updated successfully!

        The changes will be visible on all website pages when visitors refresh or visit them.

        Updated links:
        ${socialData.facebook ? '✓ Facebook' : ''}
        ${socialData.instagram ? '✓ Instagram' : ''}
        ${socialData.youtube ? '✓ YouTube' : ''}
        ${socialData.twitter ? '✓ Twitter' : ''}
        ${socialData.whatsapp ? '✓ WhatsApp' : ''}
    `;

    console.log('Social media data updated:', socialData);

    // If we're in a browser environment, we could update the current page's footer
    if (typeof window !== 'undefined' && window.loadSocialMediaLinks) {
        window.loadSocialMediaLinks();
    }
}

// Load footer data
function loadFooterData() {
    // Load contact data
    const contactData = JSON.parse(localStorage.getItem('footerContact') || '{}');
    if (document.getElementById('footerAddress')) {
        document.getElementById('footerAddress').value = contactData.address || 'Our Lady of Lourdes Shrine\nChetpet, Tiruvannamalai Dt - 606 801';
        document.getElementById('footerPhone').value = contactData.phone || '+91 9442291509, +91 6374827409';
        document.getElementById('footerEmail').value = contactData.email || 'ourladyoflourdesshrinechetpet@gmail.com';
        if (document.getElementById('footerHours')) {
            document.getElementById('footerHours').value = contactData.hours || 'Monday - Saturday: 9:00 AM - 5:00 PM\nSunday: After Mass Services';
        }
    }

    // Load social media data
    const socialData = JSON.parse(localStorage.getItem('footerSocial') || '{}');
    if (document.getElementById('facebookUrl')) {
        document.getElementById('facebookUrl').value = socialData.facebook || '';
        document.getElementById('instagramUrl').value = socialData.instagram || '';
        document.getElementById('youtubeUrl').value = socialData.youtube || '';
        document.getElementById('twitterUrl').value = socialData.twitter || '';
        document.getElementById('whatsappNumber').value = socialData.whatsapp || '';

        // Update preview after loading data
        updateSocialPreview();
    }

    // If no social media data exists, set some placeholder text in the help
    if (!socialData.facebook && !socialData.instagram && !socialData.youtube && !socialData.twitter && !socialData.whatsapp) {
        console.log('No social media links configured. Admin can add them in the Footer Management section.');
    }
}

// Load dashboard data
function loadDashboardData() {
    // Update statistics
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const images = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    const priests = JSON.parse(localStorage.getItem('shrinePriests') || '[]');

    // Update stat numbers (these would come from a real database in production)
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[1].textContent = events.length;
        statNumbers[2].textContent = images.length;
    }

    // Load all section data
    loadEvents();
    loadPriests();
    loadJubileeData();
    loadMadhaMalaiData();
    loadSlides();

    // Initialize footer management
    initializeFooterManagement();
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
    }

    // Set notification style based on type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #4fc3f7, #29b6f6)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
    }

    notification.textContent = message;

    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
    }, 3000);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Show/hide loading
function showLoading() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        loginBtn.disabled = true;
    }
}

function hideLoading() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
    }
}
