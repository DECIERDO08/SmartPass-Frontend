/* ========================================
   TOPBAR JAVASCRIPT
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
        window.location.href = './index.html';
        
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
        window.location.href = '../login.html';
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