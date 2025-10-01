// Main JavaScript file for Our Lady of Lourdes Shrine website

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    loadHomeSlides();
    initializeMobileMenu();
    initializeScrollEffects();
    loadSocialMediaLinks();
    loadShrinePriests();
});

// Image Slider Functionality
function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Auto-slide functionality
    let slideInterval = setInterval(nextSlide, 5000);
    
    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current slide and dot
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }
    
    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval);
            currentSlide = index;
            showSlide(currentSlide);
            slideInterval = setInterval(nextSlide, 5000);
        });
    });
    
    // Pause on hover
    const sliderContainer = document.querySelector('.hero-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
}

// Mobile Menu Functionality
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
}

// Scroll Effects
function initializeScrollEffects() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Fade in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature, .link-card, .welcome-text');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Form Validation
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Utility function to format date
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(date).toLocaleDateString('en-IN', options);
}

// Utility function to format time
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

// Contact form handling (if exists)
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateForm(contactForm)) {
                // Simulate form submission
                showNotification('Thank you for your message. We will get back to you soon!', 'success');
                contactForm.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    }
}

// Donation form handling (if exists)
function handleDonationForm() {
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateForm(donationForm)) {
                showNotification('Thank you for your generous donation!', 'success');
                // Here you would typically integrate with a payment gateway
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    }
}

// Load social media links from admin panel
function loadSocialMediaLinks() {
    const socialData = JSON.parse(localStorage.getItem('footerSocial') || '{}');
    const socialLinks = document.querySelectorAll('.social-links');

    socialLinks.forEach(socialContainer => {
        // Clear existing links
        socialContainer.innerHTML = '';

        // Add Facebook link
        if (socialData.facebook) {
            const facebookLink = document.createElement('a');
            facebookLink.href = socialData.facebook;
            facebookLink.target = '_blank';
            facebookLink.rel = 'noopener noreferrer';
            facebookLink.innerHTML = '<i class="fab fa-facebook"></i>';
            facebookLink.title = 'Follow us on Facebook';
            socialContainer.appendChild(facebookLink);
        }

        // Add Instagram link
        if (socialData.instagram) {
            const instagramLink = document.createElement('a');
            instagramLink.href = socialData.instagram;
            instagramLink.target = '_blank';
            instagramLink.rel = 'noopener noreferrer';
            instagramLink.innerHTML = '<i class="fab fa-instagram"></i>';
            instagramLink.title = 'Follow us on Instagram';
            socialContainer.appendChild(instagramLink);
        }

        // Add YouTube link
        if (socialData.youtube) {
            const youtubeLink = document.createElement('a');
            youtubeLink.href = socialData.youtube;
            youtubeLink.target = '_blank';
            youtubeLink.rel = 'noopener noreferrer';
            youtubeLink.innerHTML = '<i class="fab fa-youtube"></i>';
            youtubeLink.title = 'Subscribe to our YouTube channel';
            socialContainer.appendChild(youtubeLink);
        }

        // Add Twitter link
        if (socialData.twitter) {
            const twitterLink = document.createElement('a');
            twitterLink.href = socialData.twitter;
            twitterLink.target = '_blank';
            twitterLink.rel = 'noopener noreferrer';
            twitterLink.innerHTML = '<i class="fab fa-twitter"></i>';
            twitterLink.title = 'Follow us on Twitter';
            socialContainer.appendChild(twitterLink);
        }

        // Add WhatsApp link
        if (socialData.whatsapp) {
            const whatsappLink = document.createElement('a');
            const cleanNumber = socialData.whatsapp.replace(/[^0-9]/g, '');
            whatsappLink.href = `https://wa.me/${cleanNumber}`;
            whatsappLink.target = '_blank';
            whatsappLink.rel = 'noopener noreferrer';
            whatsappLink.innerHTML = '<i class="fab fa-whatsapp"></i>';
            whatsappLink.title = 'Contact us on WhatsApp';
            socialContainer.appendChild(whatsappLink);
        }

        // If no social media links are configured, show default message
        if (!socialData.facebook && !socialData.instagram && !socialData.youtube && !socialData.twitter && !socialData.whatsapp) {
            socialContainer.innerHTML = `
                <a href="#" onclick="showSocialMediaMessage()" title="Social media links coming soon">
                    <i class="fab fa-facebook"></i>
                </a>
                <a href="#" onclick="showSocialMediaMessage()" title="Social media links coming soon">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="#" onclick="showSocialMediaMessage()" title="Social media links coming soon">
                    <i class="fab fa-youtube"></i>
                </a>
            `;
        }
    });
}

// Show message when social media links are not configured
function showSocialMediaMessage() {
    alert('Social media links will be available soon! Please check back later or contact us directly.');
}

// Load shrine priests from admin panel
function loadShrinePriests() {
    const priests = JSON.parse(localStorage.getItem('shrinePriests') || '[]');
    const priestsGrid = document.getElementById('priestsGrid');
    const noPriests = document.getElementById('noPriests');

    if (!priestsGrid) return;

    if (priests.length === 0) {
        if (noPriests) {
            noPriests.style.display = 'block';
        }
        return;
    }

    // Hide no priests message
    if (noPriests) {
        noPriests.style.display = 'none';
    }

    // Sort priests by designation priority
    const designationOrder = {
        'parish-priest-rector': 1,
        'administrator-madha-hill': 2,
        'assistant-parish-priest': 3,
        'spiritual-director': 4
    };

    priests.sort((a, b) => {
        return (designationOrder[a.designation] || 5) - (designationOrder[b.designation] || 5);
    });

    priestsGrid.innerHTML = priests.map(priest => `
        <div class="priest-card">
            <div class="priest-photo">
                <img src="${priest.photo}" alt="${priest.name}">
            </div>
            <div class="priest-info">
                <h3>${priest.name}</h3>
                <div class="priest-title">${getDesignationText(priest.designation)}</div>
                ${priest.about ? `<p class="priest-description">${priest.about}</p>` : ''}
                ${priest.contact ? `
                    <div class="priest-contact">
                        <i class="fas fa-phone"></i>
                        <span>${priest.contact}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Get designation text for display
function getDesignationText(designation) {
    const designations = {
        'parish-priest-rector': 'Parish Priest & Rector',
        'administrator-madha-hill': 'Administrator of Madha Hill',
        'assistant-parish-priest': 'Assistant Parish Priest',
        'spiritual-director': 'Spiritual Director'
    };
    return designations[designation] || designation;
}

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    handleContactForm();
    handleDonationForm();
});

// Password toggle functionality
function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Loading animation
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const spinner = loader.querySelector('.spinner');
    spinner.style.cssText = `
        width: 40px;
        height: 40px;
        border: 4px solid #e3f2fd;
        border-top: 4px solid #1565c0;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;
    
    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.remove();
    }
}

// Load and initialize slideshow
function loadHomeSlides() {
    const slidesContainer = document.querySelector('.slides-container');
    const indicatorsContainer = document.querySelector('.slide-indicators');

    if (!slidesContainer || !indicatorsContainer) {
        // Fallback to regular slider if containers not found
        initializeSlider();
        return;
    }

    console.log('Loading home slides for public view...');

    // Try to load from Flask backend first
    fetch('/api/slideshow/slides')
        .then(response => {
            console.log('Flask backend response for slides:', response.ok);
            return response.json();
        })
        .then(slides => {
            console.log('Slides from Flask backend:', slides.length);
            renderSlides(slides, slidesContainer, indicatorsContainer);
        })
        .catch(error => {
            console.error('Flask backend not available, trying content.json:', error);
            
            // Fallback to content.json
            fetch('data/content.json')
                .then(response => {
                    console.log('Content.json response for slides:', response.ok);
                    return response.json();
                })
                .then(data => {
                    console.log('Content.json data for slides:', data);
                    const slides = data.homeSlides || [];
                    console.log('Slides found in content.json:', slides.length);
                    renderSlides(slides, slidesContainer, indicatorsContainer);
                })
                .catch(contentError => {
                    console.error('Error loading slides from content.json:', contentError);
                    // Last fallback to localStorage
                    const slides = JSON.parse(localStorage.getItem('homeSlides') || '[]');
                    console.log('Fallback to localStorage for slides, count:', slides.length);
                    renderSlides(slides, slidesContainer, indicatorsContainer);
                });
        });
}

function renderSlides(slides, slidesContainer, indicatorsContainer) {
    // If no slides available, show message to create slides
    if (slides.length === 0) {
        showNoSlidesMessage();
        return;
    }

    // Clear existing content
    slidesContainer.innerHTML = '';
    indicatorsContainer.innerHTML = '';

    // Create slides from admin data
    slides.forEach((slide, index) => {
        // Create slide element
        const slideElement = document.createElement('div');
        slideElement.className = `slide ${index === 0 ? 'active' : ''}`;
        slideElement.innerHTML = `
            <img src="${slide.image}" alt="${slide.title}">
            <div class="slide-content">
                <div class="container">
                    <h1>${slide.title}</h1>
                    ${slide.description ? `<p>${slide.description}</p>` : ''}
                    ${slide.buttonText && slide.buttonLink ? `
                        <a href="${slide.buttonLink}" class="cta-btn">${slide.buttonText}</a>
                    ` : ''}
                </div>
            </div>
        `;
        slidesContainer.appendChild(slideElement);

        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
        indicator.addEventListener('click', () => showSlide(index));
        indicatorsContainer.appendChild(indicator);
    });

    // Initialize slideshow controls
    initializeSlideshowControls();
}

// Show message when no slides are created in admin
function showNoSlidesMessage() {
    const slidesContainer = document.querySelector('.slides-container');
    const indicatorsContainer = document.querySelector('.slide-indicators');

    if (slidesContainer) {
        slidesContainer.innerHTML = `
            <div class="no-slides-message">
                <div class="slide-content">
                    <div class="container">
                        <div class="no-slides-content">
                            <i class="fas fa-images"></i>
                            <h1>No Slideshow Images</h1>
                            <p>Please add slides through the admin panel to display them here.</p>
                            <div class="admin-link">
                                <i class="fas fa-cog"></i>
                                <span>Go to Admin Dashboard → Home Slideshow to add slides</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
    }
}

// Initialize slideshow controls
function initializeSlideshowControls() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const indicators = document.querySelectorAll('.indicator');

    if (slides.length === 0) return;

    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });

    // Auto-play slideshow
    setInterval(nextSlide, 5000);

    // Make showSlide globally accessible
    window.showSlide = showSlide;
}
