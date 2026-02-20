# SmartPass Login Page - Backend Integration Guide

## 📁 Files Included

```
login-page/
├── admin
    └──index.html          # Main login page
├── assets
    └──css/
│       └── login.css      # Login page styles
└── assets
    └──js/
        └── login.js       # Authentication logic
```

## 🚀 Quick Start

### 1. Test Credentials (Demo Mode)
```
Username: admin
Password: admin123
```

### 2. Open the Login Page
Simply open `index.html` in your browser to test with sample authentication.

## ✨ Features

### ✅ User Authentication
- Username/password login
- Password visibility toggle
- "Stay signed in" functionality
- Input validation
- Error handling

### ✅ Security Features
- CSRF protection ready
- Password masking
- Secure token storage
- Session management
- Auto-logout on token expiry

### ✅ User Experience
- Responsive design (mobile, tablet, desktop)
- Loading states
- Success/error alerts
- Auto-focus on username
- Enter key support
- Remember username option

### ✅ Professional Design
- UC campus background
- Glassmorphism info card
- Smooth animations
- Professional color scheme
- Accessible forms

## 🔌 Backend API Integration

### Required Endpoints

#### 1. Login Authentication
```javascript
POST /api/auth/login

Request:
{
    "username": "admin",
    "password": "admin123",
    "rememberMe": true
}

Response (Success):
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "name": "Cedric Admin",
        "role": "Administrator",
        "email": "cedric.admin@uc.edu.ph",
        "avatar": "/uploads/avatars/admin.jpg"
    }
}

Response (Failure):
{
    "success": false,
    "message": "Invalid username or password"
}
```

#### 2. Token Verification
```javascript
POST /api/auth/verify

Headers:
{
    "Authorization": "Bearer {token}"
}

Response:
{
    "valid": true,
    "user": {
        "id": 1,
        "username": "admin",
        "role": "Administrator"
    }
}
```

#### 3. Logout
```javascript
POST /api/auth/logout

Headers:
{
    "Authorization": "Bearer {token}"
}

Response:
{
    "success": true,
    "message": "Logged out successfully"
}
```

## 🔧 Integration Steps

### Step 1: Update API Base URL
In `js/login.js`, find the `authenticateUser()` function and uncomment the fetch code:

```javascript
function authenticateUser(loginData) {
    fetch('https://your-api.com/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            handleLoginSuccess(data, loginData.rememberMe);
        } else {
            handleLoginError(data);
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        handleLoginError({
            success: false,
            message: 'Network error. Please check your connection.'
        });
    });
}
```

### Step 2: Configure Token Storage
Choose between localStorage (persistent) or sessionStorage (session-only):

```javascript
// In handleLoginSuccess() function
if (rememberMe) {
    localStorage.setItem('token', data.token);
} else {
    sessionStorage.setItem('token', data.token);
}
```

### Step 3: Set Up Redirects
Update the `redirectToDashboard()` function based on your file structure:

```javascript
function redirectToDashboard(role) {
    switch(role) {
        case 'Administrator':
            window.location.href = 'pages/dashboard.html';
            break;
        case 'Security':
            window.location.href = 'pages/qr-scan.html';
            break;
        // Add more roles as needed
    }
}
```

### Step 4: Add CSRF Protection (Optional)
```javascript
// Add CSRF token to headers
fetch('https://your-api.com/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
    },
    body: JSON.stringify(loginData)
})
```

## 👥 User Roles & Redirects

The system supports multiple user roles with different redirect destinations:

| Role | Redirect Page | Description |
|------|--------------|-------------|
| Administrator | dashboard.html | Full system access |
| Security | qr-scan.html | QR code scanning |
| Property Custodian | permit-form.html | Property management |
| Guard | qr-scan.html | Entry/exit monitoring |

## 🎨 Customization

### Change Background Image
In `css/login.css`, update the background image URL:

```css
.login-background {
    background-image: url('path/to/your/campus-image.jpg');
}
```

### Update Logo
Replace the logo in `assets/images/uc-logo.png` or update the image source in `login.html`.

### Modify Colors
Main colors in `css/login.css`:
- Primary: `#003366` (UC Blue)
- Secondary: `#0066cc` (Light Blue)
- Success: `#48bb78`
- Error: `#c53030`

## 🔒 Security Best Practices

### 1. Password Security
```javascript
// Never log passwords
console.log('Login attempt:', { username: loginData.username });
// DON'T: console.log('Login data:', loginData);
```

### 2. Token Security
```javascript
// Always use HTTPS in production
const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.smartpass.uc.edu.ph'
    : 'http://localhost:3000';
```

### 3. Input Validation
```javascript
// Backend should also validate
// Frontend validation is already implemented
```

### 4. Rate Limiting
Implement rate limiting on the backend:
- Max 5 failed attempts per minute
- Lock account after 10 failed attempts
- Temporary block for suspicious activity

## 📱 Responsive Breakpoints

```css
/* Desktop: Full layout with info card */
@media (min-width: 993px) { }

/* Tablet: Login card only */
@media (max-width: 992px) { }

/* Mobile: Optimized layout */
@media (max-width: 600px) { }
```

## 🧪 Testing

### Test Cases

1. **Valid Login**
   - Username: admin
   - Password: admin123
   - Expected: Redirect to dashboard

2. **Invalid Credentials**
   - Username: invalid
   - Password: wrong
   - Expected: Error message

3. **Empty Fields**
   - Submit with empty username/password
   - Expected: Validation error

4. **Remember Me**
   - Check "Stay signed in"
   - Login and close browser
   - Reopen and verify still logged in

5. **Responsive Design**
   - Test on mobile (< 600px)
   - Test on tablet (600-992px)
   - Test on desktop (> 992px)

## 🐛 Troubleshooting

### Issue: "Network Error"
**Solution**: Check API endpoint URL and CORS settings

### Issue: "Invalid Token"
**Solution**: Verify token format and expiration time

### Issue: Redirect Not Working
**Solution**: Check file paths in `redirectToDashboard()` function

### Issue: Remember Me Not Working
**Solution**: Verify localStorage is enabled in browser

## 📋 Checklist Before Production

- [ ] Update API endpoints with production URLs
- [ ] Remove test credentials from code
- [ ] Add HTTPS enforcement
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Test all user roles
- [ ] Verify token expiration handling
- [ ] Add logging for security events
- [ ] Test on all target browsers
- [ ] Test responsive design on real devices
- [ ] Add password recovery link
- [ ] Set up session timeout

## 🔗 Related Pages

Create these additional pages for complete authentication flow:
- `forgot-password.html` - Password recovery
- `reset-password.html` - New password form
- `visitor-registration.html` - Guest registration
- `help.html` - Support page

## 📞 Support

### Common Error Codes

| Code | Message | Action |
|------|---------|--------|
| 401 | Invalid credentials | Check username/password |
| 403 | Access denied | Check user permissions |
| 429 | Too many requests | Wait and retry |
| 500 | Server error | Contact support |

---

**Security Note**: Never commit sensitive credentials or API keys to version control. Use environment variables for configuration.



#Login extra: (index.html)
 
<!-- Info Card (Desktop Only) -->
<div class="info-card w3-hide-small">
    <div class="info-content">
        <i class="fas fa-qrcode info-icon"></i>
        <h2 class="info-title">Welcome to SmartPass</h2>
        <p class="info-description">
            Automated Registration & Monitoring System for Properties and Visitors
        </p>
        <div class="info-features">
            <div class="feature-item">
                <i class="fas fa-check-circle"></i>
                    <span>Quick QR Code Generation</span>
            </div>
            <div class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span>Real-time Monitoring</span>
            </div>
            <div class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span>Secure Access Control</span>
            </div>
            <div class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span>Digital Record Keeping</span>
            </div>
        </div>
                    
        <div class="info-stats">
            <div class="stat-item">
                <span class="stat-number">1000+</span>
                <span class="stat-label">Users</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">500+</span>
                <span class="stat-label">Devices</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">99.9%</span>
                <span class="stat-label">Uptime</span>
            </div>
        </div>
    </div>
</div>