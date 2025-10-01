# Our Lady of Lourdes Shrine Website

A comprehensive website for Our Lady of Lourdes Shrine in Chetpet, Vellore Diocese, India. This website features a beautiful light blue divine theme and includes a complete admin dashboard for content management.

## Features

### Public Website
- **Home Page**: Image slider with shrine photos, welcome section, and quick links
- **About Us**: History, mission, vision, clergy information, and contact details
- **Mass Timing**: Complete mass schedules, special services, and feast days
- **Madha Malai**: Information about the sacred hill pilgrimage site
- **Gallery**: Photo gallery with category filters and lightbox view

- **125th Year Jubilee**: Special celebration page with timeline and events
- **Substations**: Information about chapel network and services
- **Upcoming Events**: Event calendar and registration system
- **Login**: Admin authentication system

### Admin Dashboard
- **Dashboard Overview**: Statistics and quick actions
- **Content Management**: Edit website content for all pages
- **Mass Timing Management**: Update mass schedules and special services
- **Gallery Management**: Upload, organize, and delete images
- **Event Management**: Create, edit, and manage events
- **User Authentication**: Secure login system

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with light blue divine theme
- **Icons**: Font Awesome 6.0
- **Fonts**: Google Fonts (Playfair Display, Open Sans)
- **Storage**: LocalStorage for data persistence
- **Responsive**: Mobile-first responsive design

## File Structure

```
chetpet-shrine/
├── index.html              # Home page
├── about.html              # About us page
├── mass-timing.html        # Mass timing page
├── madha-malai.html        # Madha Malai page
├── gallery.html            # Photo gallery

├── jubilee.html            # 125th Year Jubilee
├── substations.html        # Substations page
├── events.html             # Events page
├── login.html              # Admin login
├── admin-dashboard.html    # Admin dashboard
├── css/
│   ├── style.css           # Main stylesheet
│   └── admin.css           # Admin dashboard styles
├── js/
│   ├── script.js           # Main JavaScript
│   ├── admin.js            # Admin functionality
│   └── gallery.js          # Gallery functionality
├── images/
│   ├── slide1.jpg          # Home page slider image 1
│   ├── slide2.jpg          # Home page slider image 2
│   └── slide3.jpg          # Home page slider image 3
├── data/
│   └── content.json        # Content data structure
└── README.md               # This file
```

## Admin Access

The admin dashboard provides comprehensive content management capabilities. Please contact the system administrator for login credentials.

## Setup Instructions

1. **Download/Clone**: Download all files to your web server directory
2. **Images**: The provided images are already copied to the `images/` folder
3. **Web Server**: Serve the files through a web server (Apache, Nginx, or local server)
4. **Access**: Open `index.html` in your web browser
5. **Admin Access**: Go to the Login page and use the default credentials

## Key Features

### Image Slider
- Automatic slideshow with 5-second intervals
- Manual navigation with arrow buttons and dots
- Responsive design for all screen sizes
- Smooth transitions and hover effects

### Admin Dashboard
- **Content Management**: Edit all website content
- **Mass Timing Updates**: Modify mass schedules
- **Gallery Management**: Upload and organize photos
- **Event Management**: Create and manage events
- **User-Friendly Interface**: Intuitive admin panel

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly navigation
- Accessible design principles

### Light Blue Divine Theme
- Peaceful and spiritual color scheme
- Gradient backgrounds and divine elements
- Professional typography
- Consistent visual hierarchy

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Features

- Admin authentication system
- Session management with localStorage
- Form validation and sanitization
- Secure admin routes

## Content Management

The admin can manage:
- **Home Page Content**: Welcome messages and featured content
- **Mass Timings**: Regular and special mass schedules
- **Events**: Create, edit, and delete events
- **Gallery**: Upload images with categories and descriptions
- **General Information**: Contact details and basic information

## Data Storage

- **LocalStorage**: Used for admin sessions and temporary data
- **JSON Structure**: Organized content data in `data/content.json`
- **Image Storage**: Local file system for uploaded images

## Customization

### Colors
The light blue divine theme can be customized by modifying CSS variables:
```css
:root {
    --primary-blue: #1565c0;
    --secondary-blue: #0d47a1;
    --light-blue: #e3f2fd;
    --accent-blue: #bbdefb;
}
```

### Content
All content can be updated through:
1. Admin dashboard (recommended)
2. Direct editing of HTML files
3. Modifying `data/content.json`

## Support

For technical support or customization requests, please contact the development team.

## License

This website is created specifically for Our Lady of Lourdes Shrine, Chetpet. All rights reserved.

---

**Our Lady of Lourdes Shrine**  
Vellore Diocese, Chetpet, India  
Celebrating 125 Years of Faith (1899-2024)
