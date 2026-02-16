# SmartPass Dashboard - Backend-Ready UI

A professional, responsive dashboard for the SmartPass system at University of Cebu - Main.

## 📁 Project Structure

```
smartpass/
├── pages
│    ├──dashboard.html              # Main dashboard page
├── assets
│    ├──css/
│        ├── topbar.css             # Reusable topbar styles
│        └── dashboard.css          # Dashboard-specific styles
├── assets
│    ├──js
│       ├── topbar.js               # Topbar functionality
│       └── dashboard.js            # Dashboard data handling
├── assets/
│   └── images/
│       ├── uc-logo.png             # University logo
│       └── default-avatar.png      # Default user avatar
└── README.md
└──LOGIN_README.md 


## 🚀 Features

### ✅ Fully Responsive Design
- Mobile-first approach
- Adapts to all screen sizes (desktop, tablet, mobile)
- Mobile navigation menu
- Optimized for touch interactions

### ✅ Backend-Ready
- All data points are placeholder-ready
- Commented API integration examples
- Clear data structure expectations
- Easy to connect to REST APIs

### ✅ Professional UI Components
- **Topbar**: Reusable navigation with profile dropdown
- **Quick Stats**: Real-time metrics cards
- **Currently Inside**: Live monitoring table
- **Monthly Summary**: Category-based activity cards
- **Top Items**: Ranked lists for devices and visitors

### ✅ Modern Design
- Clean, professional aesthetics
- Smooth animations and transitions
- Color-coded categories
- University branding integration

## 🔧 Setup Instructions

### 1. File Structure Setup
Create the following directory structure:
```
your-project/
├── dashboard.html
├── css/
│   ├── topbar.css
│   └── dashboard.css
├── js/
│   ├── topbar.js
│   └── dashboard.js
└── assets/
    └── images/
        ├── uc-logo.png
        └── default-avatar.png
```

### 2. Add University Assets
- Place your UC logo in `assets/images/uc-logo.png`
- Add default avatar in `assets/images/default-avatar.png`

### 3. External Dependencies
The following CDN libraries are already included in the HTML:
- W3.CSS (v4)
- Font Awesome 6.4.0
- Google Fonts (Inter)

### 4. Open in Browser
Simply open `dashboard.html` in a modern web browser to see the dashboard with sample data.

## 🔌 Backend Integration

### API Endpoints Required

#### 1. Quick Stats
```javascript
GET /api/dashboard/quick-stats

Response:
{
    "success": true,
    "stats": {
        "totalInside": 24,
        "totalDevices": 18,
        "totalCheckIns": 45,
        "totalCheckOuts": 21
    }
}
```

#### 2. Currently Inside
```javascript
GET /api/dashboard/currently-inside

Response:
{
    "success": true,
    "records": [
        {
            "id": 1,
            "name": "John Doe",
            "type": "Visitor",  // or "Property"
            "item": "Building Inspection",
            "timeIn": "2026-02-12T08:30:00Z",
            "status": "active"  // or "pending"
        }
    ]
}
```

#### 3. Monthly Summary
```javascript
GET /api/dashboard/monthly-summary?period=current

Response:
{
    "success": true,
    "summary": {
        "computer": {
            "checkIn": 145,
            "checkOut": 132,
            "netInside": 13,
            "capacity": 200
        },
        "nonComputer": {
            "checkIn": 89,
            "checkOut": 75,
            "netInside": 14,
            "capacity": 150
        },
        "visitors": {
            "checkIn": 234,
            "checkOut": 218,
            "netInside": 16,
            "capacity": 300
        }
    }
}
```

#### 4. Top Devices
```javascript
GET /api/dashboard/top-devices

Response:
{
    "success": true,
    "devices": [
        {
            "name": "Dell Laptop XPS 15",
            "category": "Computer",
            "count": 45,
            "owner": "IT Department"
        }
    ]
}
```

#### 5. Top Visitors
```javascript
GET /api/dashboard/top-visitors

Response:
{
    "success": true,
    "visitors": [
        {
            "name": "John Michael Santos",
            "purpose": "Business Meeting",
            "count": 24,
            "lastVisit": "2 days ago"
        }
    ]
}
```

#### 6. User Profile
```javascript
GET /api/user/profile

Response:
{
    "success": true,
    "user": {
        "name": "Cedric Admin",
        "role": "Administrator",
        "email": "cedric.admin@uc.edu.ph",
        "avatar": "/uploads/avatars/user123.jpg"
    }
}
```

### Integration Steps

1. **Update API Base URL**
   - In `js/dashboard.js` and `js/topbar.js`
   - Replace placeholder URLs with your actual API endpoints

2. **Add Authentication**
   - Uncomment the API call examples
   - Add your authentication token handling
   - Update headers with your auth method

3. **Test Each Endpoint**
   - Start with user profile loading
   - Then quick stats
   - Finally, detailed data sections

4. **Error Handling**
   - Update error messages as needed
   - Add retry logic if required
   - Implement loading states

### Example Integration (JavaScript)

```javascript
// In dashboard.js, replace the commented code with:

function updateQuickStats() {
    fetch('https://your-api.com/api/dashboard/quick-stats', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            animateValue('totalInside', 0, data.stats.totalInside, 1000);
            animateValue('totalDevices', 0, data.stats.totalDevices, 1000);
            animateValue('totalCheckIns', 0, data.stats.totalCheckIns, 1000);
            animateValue('totalCheckOuts', 0, data.stats.totalCheckOuts, 1000);
        }
    })
    .catch(error => {
        console.error('Error loading quick stats:', error);
    });
}
```

## 🎨 Customization

### Colors
The main colors are defined in the CSS:
- Primary: `#003366` (UC Blue)
- Secondary: `#0066cc` (Lighter Blue)
- Success: `#38a169`
- Danger: `#e53e3e`
- Background: `#f5f7fa`

To change colors, search and replace these values in `topbar.css` and `dashboard.css`.

### Typography
Using Inter font family. To change:
1. Update the Google Fonts import in `dashboard.html`
2. Change the `font-family` in CSS files

### Layout
All layouts use CSS Grid and Flexbox for responsiveness. Breakpoints:
- Small: `max-width: 600px` (Mobile)
- Medium: `max-width: 992px` (Tablet)
- Large: `min-width: 993px` (Desktop)

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 600px) { }

/* Tablet */
@media (max-width: 992px) { }

/* Desktop */
@media (min-width: 993px) { }
```

## 🔄 Auto Refresh

The dashboard auto-refreshes data every 30 seconds. To change:

```javascript
// In dashboard.js
function startAutoRefresh() {
    setInterval(() => {
        updateQuickStats();
        loadCurrentlyInside();
    }, 30000); // Change this value (in milliseconds)
}
```

## 🧪 Testing

### Sample Data
The dashboard comes with sample data for testing. All functions have commented API integration code.

### Browser Compatibility
Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Notes for Developers

1. **Authentication**: Add token management in `topbar.js`
2. **Session Handling**: Implement session timeout logic
3. **Real-time Updates**: Consider WebSocket for live data
4. **Error Messages**: Customize user-facing error messages
5. **Loading States**: All tables show loading indicators
6. **Data Validation**: Add validation for API responses

## 🆘 Support

For issues or questions:
1. Check the commented code examples
2. Review the API endpoint structure
3. Test with sample data first
4. Verify API responses match expected format

## 📄 License

This UI is part of the SmartPass system for University of Cebu - Main.

---

**Created for**: SmartPass Capstone Project
**Institution**: University of Cebu - Main
**Department**: Office of the Property Custodian
