# SmartPass System - Complete UI Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Dashboard Page](#dashboard-page)
3. [History Page](#history-page)
4. [Login Page](#login-page)
5. [Backend Integration](#backend-integration)
6. [User Roles](#user-roles)

---

## 🎯 System Overview

### Workflow Process
1. **Custodian** checks devices and inputs details → Automatically approved
2. **Application Submitted** → Notifies CSU Head for approval
3. **CSU Approves** → Ready for printing QR pass

### User Roles
- **Administrator**: Full system access
- **Custodian**: Input device details, auto-approve
- **CSU Head**: Approve/reject applications
- **Security/Guard**: Scan QR codes, view scan history

---

## 📊 Dashboard Page

### Features Implemented

#### 1. Quick Stats Cards (3 Cards)
```html
a. Ongoing Applications (For Approval)
   - Shows pending applications awaiting CSU approval
   - Icon: Clock
   - Status: "For Approval"

b. Equipment Currently Inside
   - Live count of equipment on campus
   - Icon: Laptop
   - Status: "Live count"

c. Visitors Currently Inside
   - Live count of visitors on campus
   - Icon: Users
   - Status: "Live count"
```

#### 2. Live Activity Feed
Displays real-time data combining:
- **Scanned QR entries/exits** (from guard scans)
- **Ongoing applications** (pending approvals)

**Table Columns:**
- Name
- Type (Equipment/Visitor/Application)
- Item/Purpose
- Time IN
- Time OUT
- Status (Scanned/Pending/Completed)

**Features:**
- Filter dropdown (All Activity / Scanned Only / Applications Only)
- Auto-refresh every 30 seconds
- Real-time status updates

### Backend API Endpoints Needed

```javascript
// Quick Stats
GET /api/dashboard/quick-stats
Response: {
    success: true,
    stats: {
        ongoingApplications: number,
        equipmentInside: number,
        visitorsInside: number
    }
}

// Live Feed
GET /api/dashboard/live-feed
Query: ?filter=all|scanned|applications
Response: {
    success: true,
    records: [{
        id: number,
        name: string,
        type: 'Equipment' | 'Visitor' | 'Application',
        item: string,
        timeIn: ISO date,
        timeOut: ISO date | null,
        status: 'scanned' | 'pending' | 'completed',
        activityType: 'entry' | 'exit' | 'application'
    }]
}
```

---

## 📜 History Page

### 1. Filter & Search Section

**Search Capabilities:**
- Name search
- ID search
- Equipment search
- Permit ID search

**Filters Available:**
```javascript
a. Date Range (From - To)
b. Type: Visitor / Staff / Contractor / Equipment
c. Category: Equipment Pass / Visitor Pass
d. Status: Pending / Approved / Rejected / Expired
```

**Actions:**
- Clear All Filters button
- Real-time filtering
- Auto-save filter preferences

### 2. History Table

**Columns:**
1. Date
2. Permit ID
3. Name
4. Type (Visitor/Equipment/Both)
5. Item/Purpose
6. Status (Pending/Approved/Rejected/Expired)
7. Actions (Dynamic based on status & role)

**Action Buttons:**
- **View Details**: See full record information
- **Download Pass (PDF)**: Only for approved records
- **View QR**: Display QR code for approved records
- **View Photos**: Show uploaded property photos
- **Edit Status**: CSU/Custodian only, for pending records
- **Report Issue**: Flag problems with any record

### 3. Analytics Section

**Moved from Dashboard:**
- Monthly Summary Activity (Equipment/Visitors breakdown)
- Top Devices (Most checked-in items)
- Frequent Visitors (Most active visitors)

### Role-Based Views

#### Guard View
- **Focus**: Scan history only
- **Filters**: Gate selection, Date range
- **Data**: Entry/Exit logs with timestamps
- **Actions**: View details, Report issue

#### CSU & Custodian View
- **Focus**: All records
- **Capabilities**: 
  - Edit status (Approve/Reject)
  - Generate reports
  - Export to CSV
  - Full access to all actions

### Backend API Endpoints Needed

```javascript
// Get All Records (CSU/Custodian)
GET /api/history/all-records
Query: ?search=&dateFrom=&dateTo=&type=&category=&status=
Response: {
    success: true,
    records: [...],
    totalCount: number
}

// Get Scan Logs (Guard)
GET /api/history/scan-logs
Query: ?gate=main&date=2026-02-16
Response: {
    success: true,
    records: [...],
    totalCount: number
}

// Get Record Details
GET /api/history/record/:id
Response: {
    success: true,
    record: {
        id: number,
        date: ISO date,
        permitId: string,
        name: string,
        type: string,
        category: string,
        item: string,
        status: string,
        timeIn: ISO date,
        timeOut: ISO date | null,
        photos: string[],
        metadata: object
    }
}

// Update Status (CSU/Custodian only)
PUT /api/history/update-status/:id
Headers: { Authorization: Bearer token }
Body: { status: 'approved' | 'rejected', reason?: string }
Response: {
    success: true,
    message: 'Status updated',
    updatedRecord: {...}
}

// Download Pass PDF
GET /api/passes/download/:id
Response: PDF file download

// View QR Code
GET /api/qr/generate/:id
Response: PNG image (QR code)

// Report Issue
POST /api/history/report-issue
Body: {
    recordId: number,
    issue: string,
    reportedBy: string
}
Response: {
    success: true,
    message: 'Issue reported',
    ticketId: string
}

// Export Records
POST /api/history/export
Body: {
    filters: {
        search: string,
        dateFrom: string,
        dateTo: string,
        type: string,
        category: string,
        status: string
    },
    format: 'csv' | 'excel' | 'pdf'
}
Response: File download

// Monthly Summary
GET /api/analytics/monthly-summary
Query: ?period=current|last|custom&from=&to=
Response: {
    success: true,
    summary: {
        computer: { checkIn, checkOut, netInside, capacity },
        nonComputer: { checkIn, checkOut, netInside, capacity },
        visitors: { checkIn, checkOut, netInside, capacity }
    }
}

// Top Devices
GET /api/analytics/top-devices
Query: ?limit=5&period=month
Response: {
    success: true,
    devices: [{
        name, category, count, owner
    }]
}

// Top Visitors
GET /api/analytics/top-visitors
Query: ?limit=5&period=month
Response: {
    success: true,
    visitors: [{
        name, purpose, count, lastVisit
    }]
}
```

---

## 🔐 Login Page

### Features
- Username/password authentication
- Password visibility toggle
- "Stay signed in" functionality
- Role-based redirects
- Session management
- Token-based authentication

### Redirect Logic
```javascript
Administrator → dashboard.html
Security/Guard → qr-scan.html
Custodian → permit-form.html
CSU → dashboard.html
```

---

## 🔧 Backend Integration Guide

### Authentication Flow

```javascript
1. User Login
   POST /api/auth/login
   Body: { username, password, rememberMe }
   Response: { success, token, user: { id, name, role, email } }

2. Token Storage
   - rememberMe = true → localStorage
   - rememberMe = false → sessionStorage

3. Token Verification
   POST /api/auth/verify
   Headers: { Authorization: Bearer token }
   Response: { valid: boolean, user: {...} }

4. Attach Token to All Requests
   headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token'),
       'Content-Type': 'application/json'
   }
```

### Error Handling

```javascript
// All API calls should include error handling
fetch('/api/endpoint', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
})
.then(response => {
    if (!response.ok) {
        if (response.status === 401) {
            // Unauthorized - redirect to login
            window.location.href = 'login.html';
        }
        throw new Error('API request failed');
    }
    return response.json();
})
.then(data => {
    if (data.success) {
        // Handle success
    } else {
        // Handle API-level errors
        showAlert(data.message, 'error');
    }
})
.catch(error => {
    console.error('Error:', error);
    showAlert('Network error. Please try again.', 'error');
});
```

### Role-Based Access Control

```javascript
// Check user role before showing features
const userRole = localStorage.getItem('userRole');

// Example: Show edit button only for CSU/Custodian
if (userRole === 'CSU' || userRole === 'Custodian') {
    // Show edit status button
}

// Example: Filter data based on role
const endpoint = userRole === 'Guard' 
    ? '/api/history/scan-logs' 
    : '/api/history/all-records';
```

---

## 📱 Responsive Design

All pages are fully responsive with breakpoints:
- **Desktop**: > 992px (Full layout)
- **Tablet**: 600px - 992px (Optimized)
- **Mobile**: < 600px (Touch-friendly)

### Mobile Optimizations
- Hamburger navigation menu
- Touch-friendly buttons (min 44px)
- Simplified table views
- Stacked filters
- Bottom sheet modals

---

## 🎨 UI Components

### Status Badges
```css
.pending → Yellow (#fff3cd, #856404)
.approved → Green (#d4edda, #155724)
.rejected → Red (#f8d7da, #721c24)
.expired → Gray (#e2e8f0, #4a5568)
```

### Type Badges
```css
.visitor → Teal (#e6fffa, #047857)
.staff → Blue (#eff6ff, #1e40af)
.contractor → Yellow (#fef3c7, #92400e)
.equipment → Purple (#ede9fe, #5b21b6)
```

---

## ✅ Testing Checklist

### Dashboard
- [ ] Quick stats load correctly
- [ ] Live feed updates in real-time
- [ ] Filter dropdown works
- [ ] Refresh button functions
- [ ] Auto-refresh works (30s)
- [ ] Responsive on mobile

### History
- [ ] All filters work correctly
- [ ] Search is case-insensitive
- [ ] Date range filtering accurate
- [ ] Pagination works
- [ ] Export function triggers
- [ ] View details modal opens
- [ ] Action buttons appear based on role
- [ ] Status update works (CSU/Custodian)
- [ ] Analytics load correctly
- [ ] Mobile view is usable

### Login
- [ ] Valid credentials accepted
- [ ] Invalid credentials rejected
- [ ] Remember me works
- [ ] Role-based redirect correct
- [ ] Token stored properly
- [ ] Session persists on refresh

---

## 🚀 Deployment Notes

### Environment Variables
```javascript
API_BASE_URL=https://api.smartpass.uc.edu.ph
AUTH_TOKEN_EXPIRY=24h
SESSION_TIMEOUT=30m
```

### Security Considerations
1. Always use HTTPS in production
2. Implement rate limiting on login (5 attempts/min)
3. Use HTTP-only cookies for tokens
4. Implement CSRF protection
5. Sanitize all user inputs
6. Validate file uploads (photos)
7. Implement proper CORS headers

---

## 📞 Support

For backend integration questions:
- Check commented API integration examples in JS files
- Refer to API endpoint documentation above
- Test with sample data first
- Verify response formats match expected structure

---

**Last Updated**: February 16, 2026
**Version**: 1.0
**Status**: Ready for Backend Integration
