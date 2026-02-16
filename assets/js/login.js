/* ========================================
   LOGIN PAGE JAVASCRIPT
   ======================================== */

// Toggle Password Visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Show Alert Message
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertMessage');
    const alertText = document.getElementById('alertText');
    
    // Remove previous type classes
    alertBox.classList.remove('error', 'success', 'warning');
    
    // Add new type class
    alertBox.classList.add(type);
    
    // Set message
    alertText.textContent = message;
    
    // Show alert
    alertBox.style.display = 'flex';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        closeAlert();
    }, 5000);
}

// Close Alert Message
function closeAlert() {
    const alertBox = document.getElementById('alertMessage');
    alertBox.style.display = 'none';
}

// Show Loading State
function showLoading(show) {
    const loginBtn = document.getElementById('loginBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const form = document.getElementById('loginForm');
    
    if (show) {
        loginBtn.style.display = 'none';
        loadingSpinner.style.display = 'flex';
        form.querySelectorAll('input').forEach(input => input.disabled = true);
    } else {
        loginBtn.style.display = 'flex';
        loadingSpinner.style.display = 'none';
        form.querySelectorAll('input').forEach(input => input.disabled = false);
    }
}

// Validate Form
function validateForm(username, password) {
    const errors = [];
    
    // Username validation
    if (!username || username.trim().length === 0) {
        errors.push('Username is required');
    } else if (username.length < 3) {
        errors.push('Username must be at least 3 characters');
    }
    
    // Password validation
    if (!password || password.trim().length === 0) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    return errors;
}

// Handle Login Form Submission
function handleLogin(event) {
    event.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Close any existing alerts
    closeAlert();
    
    // Validate form
    const errors = validateForm(username, password);
    if (errors.length > 0) {
        showAlert(errors[0], 'error');
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    // Prepare login data
    const loginData = {
        username: username,
        password: password,
        rememberMe: rememberMe
    };
    
    // Call authentication API
    authenticateUser(loginData);
}

// Authenticate User (API Integration)
function authenticateUser(loginData) {
    // SAMPLE AUTHENTICATION - Replace with actual API call
    
    // Simulate API delay
    setTimeout(() => {
        // Sample credentials for testing
        if (loginData.username === 'admin' && loginData.password === 'admin123') {
            // Success
            handleLoginSuccess({
                success: true,
                token: 'sample_token_12345',
                user: {
                    id: 1,
                    username: loginData.username,
                    name: 'Cedric Admin',
                    role: 'Administrator',
                    email: 'cedric.admin@uc.edu.ph'
                }
            }, loginData.rememberMe);
        } else {
            // Failure
            handleLoginError({
                success: false,
                message: 'Invalid username or password'
            });
        }
    }, 1500);
    
    /* ========================================
       BACKEND API INTEGRATION
       Replace the above code with this:
       ======================================== */
    
    /*
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
    */
}

// Handle Successful Login
function handleLoginSuccess(data, rememberMe) {
    // Hide loading
    showLoading(false);
    
    // Show success message
    showAlert('Login successful! Redirecting...', 'success');
    
    // Store authentication token
    if (rememberMe) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('rememberMe', 'true');
    } else {
        sessionStorage.setItem('token', data.token);
    }
    
    // Store user data
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userName', data.user.name);
    localStorage.setItem('userRole', data.user.role);
    localStorage.setItem('userEmail', data.user.email);
    
    // Log activity
    console.log('User logged in:', data.user.username);
    
    // Redirect based on role
    setTimeout(() => {
        redirectToDashboard(data.user.role);
    }, 1000);
}

// Handle Login Error
function handleLoginError(data) {
    // Hide loading
    showLoading(false);
    
    // Show error message
    const errorMessage = data.message || 'Login failed. Please try again.';
    showAlert(errorMessage, 'error');
    
    // Clear password field for security
    document.getElementById('password').value = '';
    
    // Focus on username field
    document.getElementById('username').focus();
    
    // Log error
    console.error('Login failed:', data);
}

// Redirect to Dashboard
function redirectToDashboard(role) {
    // Redirect based on user role
    switch(role) {
        case 'Administrator':
        case 'Admin':
            window.location.href = 'dashboard.html';
            break;
        case 'Security':
        case 'Guard':
            window.location.href = 'qr-scan.html';
            break;
        case 'Property Custodian':
            window.location.href = 'permit-form.html';
            break;
        default:
            window.location.href = 'dashboard.html';
    }
}

// Check if Already Logged In
function checkExistingSession() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
        // Verify token with backend
        verifyToken(token);
    }
}

// Verify Authentication Token
function verifyToken(token) {
    // Show loading
    showLoading(true);
    
    // SAMPLE VERIFICATION - Replace with actual API call
    /*
    fetch('https://your-api.com/api/auth/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.valid) {
            // Token is valid, redirect to dashboard
            const userRole = localStorage.getItem('userRole') || 'Administrator';
            redirectToDashboard(userRole);
        } else {
            // Token is invalid, clear storage
            clearAuthData();
            showLoading(false);
        }
    })
    .catch(error => {
        console.error('Token verification error:', error);
        clearAuthData();
        showLoading(false);
    });
    */
}

// Clear Authentication Data
function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('token');
}

// Handle Enter Key Press
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing session
    checkExistingSession();
    
    // Add enter key listener for password field
    document.getElementById('password').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }
    });
    
    // Add enter key listener for username field
    document.getElementById('username').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('password').focus();
        }
    });
    
    // Auto-fill username if remembered
    const rememberedUser = localStorage.getItem('rememberedUsername');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
    
    // Focus on username field
    document.getElementById('username').focus();
});

// Remember Username
function rememberUsername() {
    const rememberMe = document.getElementById('rememberMe').checked;
    const username = document.getElementById('username').value;
    
    if (rememberMe && username) {
        localStorage.setItem('rememberedUsername', username);
    } else {
        localStorage.removeItem('rememberedUsername');
    }
}

// Add event listener for remember me checkbox
document.addEventListener('DOMContentLoaded', function() {
    const rememberCheckbox = document.getElementById('rememberMe');
    rememberCheckbox.addEventListener('change', rememberUsername);
});

// Prevent multiple form submissions
let isSubmitting = false;

function handleLogin(event) {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
        return;
    }
    
    isSubmitting = true;
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Close any existing alerts
    closeAlert();
    
    // Validate form
    const errors = validateForm(username, password);
    if (errors.length > 0) {
        showAlert(errors[0], 'error');
        isSubmitting = false;
        return;
    }
    
    // Remember username if checked
    if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
    }
    
    // Show loading state
    showLoading(true);
    
    // Prepare login data
    const loginData = {
        username: username,
        password: password,
        rememberMe: rememberMe
    };
    
    // Call authentication API
    authenticateUser(loginData);
    
    // Reset submission flag after delay
    setTimeout(() => {
        isSubmitting = false;
    }, 2000);
}

/* ========================================
   EXPORT FOR BACKEND INTEGRATION
   ======================================== */

// Example API endpoints structure for backend team:
/*
API ENDPOINTS NEEDED:

1. POST /api/auth/login
   Request Body: {
       username: string,
       password: string,
       rememberMe: boolean
   }
   Response: {
       success: true,
       token: string,
       user: {
           id: number,
           username: string,
           name: string,
           role: string,
           email: string,
           avatar?: string
       }
   }

2. POST /api/auth/verify
   Headers: {
       Authorization: 'Bearer {token}'
   }
   Response: {
       valid: boolean,
       user?: object
   }

3. POST /api/auth/logout
   Headers: {
       Authorization: 'Bearer {token}'
   }
   Response: {
       success: boolean
   }

4. POST /api/auth/forgot-password
   Request Body: {
       email: string
   }
   Response: {
       success: boolean,
       message: string
   }

USER ROLES:
- Administrator
- Property Custodian
- Security
- Guard

REDIRECT MAPPING:
- Administrator → dashboard.html
- Security/Guard → qr-scan.html
- Property Custodian → permit-form.html
*/