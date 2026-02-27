/* ========================================
   TOPBAR JAVASCRIPT
   ======================================== */

/* ========================================
   NOTIFICATIONS
   ======================================== */

let notificationsOpen = false;
let notifications = [];

// Load notifications on page load
function loadNotifications() {
    // Sample data - replace with API call
    const sampleNotifications = [
        {
            id: 1,
            type: 'pending',
            title: 'New Permit Application',
            message: 'John Doe submitted permit #CMP-123456 for approval',
            permitId: 'CMP-123456',
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
            actionUrl: 'history.html?permitId=CMP-123456'
        },
        {
            id: 2,
            type: 'approved',
            title: 'Permit Approved',
            message: 'Your permit #OFP-789012 has been approved by CSU Head',
            permitId: 'OFP-789012',
            read: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
            actionUrl: 'history.html?permitId=OFP-789012'
        },
        {
            id: 3,
            type: 'info',
            title: 'QR Code Ready',
            message: 'QR code for permit #CMP-555666 is ready for download',
            permitId: 'CMP-555666',
            read: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            actionUrl: 'history.html?permitId=CMP-555666'
        }
    ];

    notifications = sampleNotifications;
    updateNotificationBadge();
    displayNotifications();

    /* Backend API Integration:
    fetch('/api/notifications', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            notifications = data.notifications;
            updateNotificationBadge();
            displayNotifications();
        }
    })
    .catch(err => console.error('Failed to load notifications:', err));
    */
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    notificationsOpen = !notificationsOpen;

    if (notificationsOpen) {
        dropdown.classList.add('show');
        // Close profile dropdown if open
        const logoutDropdown = document.getElementById('logoutDropdown');
        if (logoutDropdown) logoutDropdown.classList.remove('show');
    } else {
        dropdown.classList.remove('show');
    }
}

function displayNotifications() {
    const list = document.getElementById('notificationList');
    const loading = document.getElementById('notificationLoading');
    const empty = document.getElementById('notificationEmpty');

    if (!list) return; // Exit if notification elements don't exist on this page

    loading.style.display = 'none';

    if (notifications.length === 0) {
        empty.style.display = 'flex';
        return;
    }

    empty.style.display = 'none';

    // Clear existing items (except loading/empty)
    const existingItems = list.querySelectorAll('.notification-item');
    existingItems.forEach(item => item.remove());

    notifications.forEach(notif => {
        const item = createNotificationItem(notif);
        list.appendChild(item);
    });
}

function createNotificationItem(notif) {
    const div = document.createElement('div');
    div.className = 'notification-item' + (notif.read ? '' : ' unread');
    div.dataset.id = notif.id;

    const iconClass = notif.type;
    const icon = getNotificationIcon(notif.type);

    div.innerHTML = `
        <div class="notification-icon ${iconClass}">
            <i class="${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-text">${notif.title}</div>
            <div class="notification-meta">${notif.message}</div>
            <div class="notification-meta">${formatNotificationTime(notif.createdAt)}</div>
            <div class="notification-actions">
                ${notif.type === 'pending' ? `
                    <button class="notification-btn primary" onclick="viewPermit('${notif.permitId}')">
                        Review
                    </button>
                ` : ''}
                ${notif.type === 'approved' ? `
                    <button class="notification-btn primary" onclick="downloadQR('${notif.permitId}')">
                        Download QR
                    </button>
                ` : ''}
                <button class="notification-btn secondary" onclick="markAsRead(${notif.id})">
                    Mark as read
                </button>
            </div>
        </div>
    `;

    return div;
}

function getNotificationIcon(type) {
    const icons = {
        'pending': 'fas fa-clock',
        'approved': 'fas fa-check-circle',
        'rejected': 'fas fa-times-circle',
        'info': 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-bell';
}

function formatNotificationTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    const bell = document.getElementById('notificationBell');

    if (!badge || !bell) return; // Exit if elements don't exist

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'flex';
        bell.classList.add('has-notifications');
    } else {
        badge.style.display = 'none';
        bell.classList.remove('has-notifications');
    }
}

function markAsRead(notifId) {
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        updateNotificationBadge();
        displayNotifications();
    }

    /* Backend API Integration:
    fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            const notif = notifications.find(n => n.id === notifId);
            if (notif) {
                notif.read = true;
                updateNotificationBadge();
                displayNotifications();
            }
        }
    });
    */
}

function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    updateNotificationBadge();
    displayNotifications();

    /* Backend API Integration:
    fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            notifications.forEach(n => n.read = true);
            updateNotificationBadge();
            displayNotifications();
        }
    });
    */
}

function viewPermit(permitId) {
    window.location.href = `history.html?permitId=${permitId}`;
}

function downloadQR(permitId) {
    window.open(`/api/qr/download/${permitId}`, '_blank');
}

// Initialize notifications
document.addEventListener('DOMContentLoaded', function() {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    setInterval(loadNotifications, 30000);

    // Close notifications dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const bell = document.querySelector('.notification-bell');
        const logoutBtn = document.querySelector('.profile-dropdown');
        
        if (notificationsOpen && bell && !bell.contains(e.target)) {
            toggleNotifications();
        }
    });
});

/* ========================================
   PROFILE DROPDOWN & LOGOUT
   ======================================== */

// Toggle Logout Dropdown
function toggleLogout() {
    const dropdown = document.getElementById('logoutDropdown');
    dropdown.classList.toggle('show');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(event) {
        if (!event.target.closest('.profile-dropdown')) {
            dropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('show');
}

// Handle Logout
function handleLogout() {
    // Show confirmation
    if (confirm('Are you sure you want to logout?')) {
        // Clear session data (backend will handle this)
        localStorage.removeItem('userSession');
        
        // Redirect to login page
        window.location.href = '../login.html';
        
        // For backend integration, make an API call:
        /*
        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.clear();
                window.location.href = '../login.html';
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
        */
    }
}

// Load User Profile Data
function loadUserProfile() {
    // This is sample data - replace with actual API call
    const userData = {
        name: 'Cedric Admin',
        role: 'Administrator',
        email: 'cedric.admin@uc.edu.ph',
        avatar: '../assets/images/default-avatar.png'
    };
    
    // Update profile display
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userRole').textContent = userData.role;
    document.getElementById('dropdownName').textContent = userData.name;
    document.getElementById('dropdownEmail').textContent = userData.email;
    
    // Update avatar images
    if (userData.avatar) {
        document.getElementById('userAvatar').src = userData.avatar;
        document.getElementById('dropdownAvatar').src = userData.avatar;
    }
    
    // For backend integration, use this:
    /*
    fetch('/api/user/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('userName').textContent = data.user.name;
            document.getElementById('userRole').textContent = data.user.role;
            document.getElementById('dropdownName').textContent = data.user.name;
            document.getElementById('dropdownEmail').textContent = data.user.email;
            
            if (data.user.avatar) {
                document.getElementById('userAvatar').src = data.user.avatar;
                document.getElementById('dropdownAvatar').src = data.user.avatar;
            }
        }
    })
    .catch(error => {
        console.error('Error loading user profile:', error);
    });
    */
}

// Highlight Active Navigation Link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.topbar-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && menuToggle) {
        if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            mobileMenu.classList.remove('show');
        }
    }
});

// Close mobile menu when resizing to larger screen
window.addEventListener('resize', function() {
    if (window.innerWidth > 600) {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.remove('show');
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    setActiveNavLink();
});

// Check authentication (for backend integration)
function checkAuthentication() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Redirect to login if no token
        window.location.href = '../index.html';
        return;
    }
    
    // Verify token with backend
    /*
    fetch('/api/verify-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.valid) {
            localStorage.clear();
            window.location.href = '../login.html';
        }
    })
    .catch(error => {
        console.error('Authentication error:', error);
        window.location.href = '../login.html';
    });
    */
}

// Optional: Call this on protected pages
// checkAuthentication();