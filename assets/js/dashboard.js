/* ========================================
   DASHBOARD JAVASCRIPT
   ======================================== */

// Format current date
function formatDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const date = new Date().toLocaleDateString('en-US', options);
    document.getElementById('currentDate').textContent = date;
}

// Calculate time duration
function calculateDuration(timeIn) {
    const now = new Date();
    const entryTime = new Date(timeIn);
    const diff = now - entryTime;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Update welcome name
function updateWelcomeName() {
    // Get user data from localStorage or API
    const userName = localStorage.getItem('userName') || 'Cedric';
    const firstName = userName.split(' ')[0];
    document.getElementById('welcomeName').textContent = firstName;
}

/* ======================================== 
   QUICK STATS FUNCTIONS
   ======================================== */

function updateQuickStats() {
    // Sample data - replace with API call
    const stats = {
        ongoingApplications: 5,
        equipmentInside: 18,
        visitorsInside: 12
    };
    
    // Animate counter
    animateValue('ongoingApplications', 0, stats.ongoingApplications, 1000);
    animateValue('equipmentInside', 0, stats.equipmentInside, 1000);
    animateValue('visitorsInside', 0, stats.visitorsInside, 1000);
    
    // Backend API Integration:
    /*
    fetch('/api/dashboard/quick-stats', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            animateValue('ongoingApplications', 0, data.stats.ongoingApplications, 1000);
            animateValue('equipmentInside', 0, data.stats.equipmentInside, 1000);
            animateValue('visitorsInside', 0, data.stats.visitorsInside, 1000);
        }
    })
    .catch(error => {
        console.error('Error loading quick stats:', error);
    });
    */
}

// Animate number counter
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

/* ========================================
   LIVE FEED FUNCTIONS
   ======================================== */

function loadLiveFeed() {
    // Sample data - replace with API call
    const sampleData = [
        {
            id: 1,
            name: 'John Doe',
            type: 'Equipment',
            item: 'Laptop - Dell XPS 15',
            timeIn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            timeOut: null,
            status: 'scanned',
            activityType: 'entry'
        },
        {
            id: 2,
            name: 'Jane Smith',
            type: 'Application',
            item: 'Desktop - HP EliteDesk',
            timeIn: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            timeOut: null,
            status: 'pending',
            activityType: 'application'
        },
        {
            id: 3,
            name: 'Mike Johnson',
            type: 'Visitor',
            item: 'Meeting with Admin',
            timeIn: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            timeOut: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            activityType: 'exit'
        },
        {
            id: 4,
            name: 'Sarah Williams',
            type: 'Equipment',
            item: 'Projector - Epson',
            timeIn: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            timeOut: null,
            status: 'scanned',
            activityType: 'entry'
        },
        {
            id: 5,
            name: 'Robert Brown',
            type: 'Application',
            item: 'MacBook Pro',
            timeIn: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            timeOut: null,
            status: 'pending',
            activityType: 'application'
        }
    ];
    
    displayLiveFeed(sampleData);
    
    // Backend API Integration:
    /*
    fetch('/api/dashboard/live-feed', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayLiveFeed(data.records);
        }
    })
    .catch(error => {
        console.error('Error loading live feed:', error);
        showError('liveFeedBody', 'Failed to load data');
    });
    */
}

function displayLiveFeed(data) {
    const tbody = document.getElementById('liveFeedBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    <i class="fas fa-inbox"></i>
                    <p>No activity yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = data.map(record => {
        const timeOut = record.timeOut 
            ? new Date(record.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : '<span style="color: #a0aec0;">—</span>';
            
        return `
            <tr>
                <td><strong>${record.name}</strong></td>
                <td>
                    <span class="status-badge ${record.type.toLowerCase()}">
                        <i class="fas fa-circle"></i>
                        ${record.type}
                    </span>
                </td>
                <td>${record.item}</td>
                <td>${new Date(record.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${timeOut}</td>
                <td class="w3-hide-small">
                    <span class="status-badge ${record.status}">
                        <i class="fas fa-circle"></i>
                        ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function filterLiveFeed() {
    const filter = document.getElementById('feedFilter').value;
    
    // Show loading state
    const tbody = document.getElementById('liveFeedBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="no-data">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Filtering data...</p>
            </td>
        </tr>
    `;
    
    // Reload with filter
    setTimeout(() => {
        loadLiveFeed(); // In production, pass filter parameter to API
    }, 300);
}

function refreshLiveFeed() {
    // Show loading state
    const tbody = document.getElementById('liveFeedBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="no-data">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Refreshing data...</p>
            </td>
        </tr>
    `;
    
    // Reload data after short delay
    setTimeout(() => {
        loadLiveFeed();
    }, 500);
}

/* ========================================
   AUTO REFRESH
   ======================================== */

// Auto refresh data every 30 seconds
function startAutoRefresh() {
    setInterval(() => {
        updateQuickStats();
        loadLiveFeed();
    }, 30000); // 30 seconds
}

/* ========================================
   INITIALIZE DASHBOARD
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Update date
    formatDate();
    
    // Load welcome name
    updateWelcomeName();
    
    // Load all dashboard data
    updateQuickStats();
    loadLiveFeed();
    
    // Start auto refresh
    startAutoRefresh();
    
    console.log('Dashboard initialized successfully');
});

/* ========================================
   EXPORT FOR BACKEND INTEGRATION
   ======================================== */

// Example API endpoints structure for backend team:
/*
API ENDPOINTS NEEDED:

1. GET /api/dashboard/quick-stats
   Response: {
       success: true,
       stats: {
           totalInside: number,
           totalDevices: number,
           totalCheckIns: number,
           totalCheckOuts: number
       }
   }

2. GET /api/dashboard/currently-inside
   Response: {
       success: true,
       records: [
           {
               id: number,
               name: string,
               type: 'Visitor' | 'Property',
               item: string,
               timeIn: ISO date string,
               status: 'active' | 'pending'
           }
       ]
   }

3. GET /api/dashboard/monthly-summary?period=current|last|custom
   Response: {
       success: true,
       summary: {
           computer: {
               checkIn: number,
               checkOut: number,
               netInside: number,
               capacity: number
           },
           nonComputer: { ... },
           visitors: { ... }
       }
   }

4. GET /api/dashboard/top-devices
   Response: {
       success: true,
       devices: [
           {
               name: string,
               category: string,
               count: number,
               owner: string
           }
       ]
   }

5. GET /api/dashboard/top-visitors
   Response: {
       success: true,
       visitors: [
           {
               name: string,
               purpose: string,
               count: number,
               lastVisit: string
           }
       ]
   }
*/