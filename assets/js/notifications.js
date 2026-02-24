/* ========================================
   NOTIFICATIONS PAGE JAVASCRIPT
   ======================================== */

let allNotifications = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    loadAllNotifications();
});

function loadAllNotifications() {
    showLoading();

    // Sample data - Replace with API call
    const sampleData = [
        {
            id: 1,
            type: 'pending',
            title: 'New Permit Application',
            message: 'John Doe submitted permit #CMP-123456 for Computer Equipment approval. Please review the application.',
            permitId: 'CMP-123456',
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
        },
        {
            id: 2,
            type: 'approved',
            title: 'Permit Approved',
            message: 'Your permit application #OFP-789012 for Non-Computer Equipment has been approved by CSU Head. QR code is now available for download.',
            permitId: 'OFP-789012',
            read: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        },
        {
            id: 3,
            type: 'pending',
            title: 'New Permit Application',
            message: 'Maria Santos submitted permit #CMP-555666 for Computer Equipment approval.',
            permitId: 'CMP-555666',
            read: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
            id: 4,
            type: 'rejected',
            title: 'Permit Rejected',
            message: 'Your permit application #CMP-999888 has been rejected. Reason: Missing equipment serial number. Please resubmit with complete information.',
            permitId: 'CMP-999888',
            read: true,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        },
        {
            id: 5,
            type: 'info',
            title: 'System Update',
            message: 'SmartPass system will undergo maintenance on Feb 25, 2026 from 2:00 AM to 4:00 AM. Service may be temporarily unavailable.',
            permitId: null,
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
            id: 6,
            type: 'approved',
            title: 'Permit Approved',
            message: 'Your permit application #OFP-111222 for Non-Computer Equipment has been approved.',
            permitId: 'OFP-111222',
            read: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        }
    ];

    allNotifications = sampleData;
    updateCounts();
    displayNotifications();
    hideLoading();

    /* Backend API Integration:
    fetch('/api/notifications', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            allNotifications = data.notifications;
            updateCounts();
            displayNotifications();
            hideLoading();
        }
    })
    .catch(err => {
        console.error('Failed to load notifications:', err);
        hideLoading();
        showError();
    });
    */
}

function displayNotifications() {
    const list = document.getElementById('notificationsList');
    const loading = document.getElementById('loadingState');
    const empty = document.getElementById('emptyState');
    
    // Clear existing cards
    const existingCards = list.querySelectorAll('.notification-card');
    existingCards.forEach(card => card.remove());

    // Filter notifications
    let filtered = allNotifications;
    if (currentFilter === 'unread') {
        filtered = allNotifications.filter(n => !n.read);
    } else if (currentFilter === 'pending') {
        filtered = allNotifications.filter(n => n.type === 'pending');
    } else if (currentFilter === 'approved') {
        filtered = allNotifications.filter(n => n.type === 'approved');
    } else if (currentFilter === 'rejected') {
        filtered = allNotifications.filter(n => n.type === 'rejected');
    }

    // Show empty state if no results
    if (filtered.length === 0) {
        empty.style.display = 'flex';
        return;
    } else {
        empty.style.display = 'none';
    }

    // Create cards
    filtered.forEach(notif => {
        const card = createNotificationCard(notif);
        list.appendChild(card);
    });
}

function createNotificationCard(notif) {
    const card = document.createElement('div');
    card.className = 'notification-card' + (notif.read ? '' : ' unread');
    card.dataset.id = notif.id;

    const icon = getNotificationIcon(notif.type);
    const time = formatTime(notif.createdAt);

    card.innerHTML = `
        <div class="notification-header">
            <div class="notification-icon-circle ${notif.type}">
                <i class="${icon}"></i>
            </div>
            <div class="notification-body">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-meta">
                    <span class="meta-item">
                        <i class="fas fa-clock"></i>
                        ${time}
                    </span>
                    ${notif.permitId ? `
                        <span class="meta-item">
                            <i class="fas fa-hashtag"></i>
                            ${notif.permitId}
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
        <div class="notification-actions">
            ${notif.type === 'pending' ? `
                <button class="notif-btn primary" onclick="viewPermit('${notif.permitId}')">
                    <i class="fas fa-eye"></i>
                    Review Permit
                </button>
            ` : ''}
            ${notif.type === 'approved' ? `
                <button class="notif-btn primary" onclick="downloadQR('${notif.permitId}')">
                    <i class="fas fa-download"></i>
                    Download QR
                </button>
                <button class="notif-btn secondary" onclick="viewPermit('${notif.permitId}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
            ` : ''}
            ${notif.type === 'rejected' ? `
                <button class="notif-btn primary" onclick="window.location.href='permit-form.html'">
                    <i class="fas fa-redo"></i>
                    Resubmit
                </button>
            ` : ''}
            ${!notif.read ? `
                <button class="notif-btn secondary" onclick="markAsRead(${notif.id})">
                    <i class="fas fa-check"></i>
                    Mark as Read
                </button>
            ` : ''}
        </div>
    `;

    return card;
}

function filterNotifications(filter) {
    currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    displayNotifications();
}

function updateCounts() {
    document.getElementById('countAll').textContent = allNotifications.length;
    document.getElementById('countUnread').textContent = allNotifications.filter(n => !n.read).length;
    document.getElementById('countPending').textContent = allNotifications.filter(n => n.type === 'pending').length;
    document.getElementById('countApproved').textContent = allNotifications.filter(n => n.type === 'approved').length;
    document.getElementById('countRejected').textContent = allNotifications.filter(n => n.type === 'rejected').length;
}

function markAsRead(notifId) {
    const notif = allNotifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        updateCounts();
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
            const notif = allNotifications.find(n => n.id === notifId);
            if (notif) {
                notif.read = true;
                updateCounts();
                displayNotifications();
            }
        }
    });
    */
}

function markAllAsRead() {
    if (confirm('Mark all notifications as read?')) {
        allNotifications.forEach(n => n.read = true);
        updateCounts();
        displayNotifications();
    }

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
            allNotifications.forEach(n => n.read = true);
            updateCounts();
            displayNotifications();
        }
    });
    */
}

function refreshNotifications() {
    loadAllNotifications();
}

function viewPermit(permitId) {
    window.location.href = `history.html?permitId=${permitId}`;
}

function downloadQR(permitId) {
    window.open(`/api/qr/download/${permitId}`, '_blank');
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

function formatTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function showLoading() {
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('emptyState').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

function showError() {
    const empty = document.getElementById('emptyState');
    empty.style.display = 'flex';
    empty.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Failed to Load</h3>
        <p>Could not load notifications. Please try again.</p>
    `;
}