/* ========================================
   HISTORY PAGE JAVASCRIPT
   ======================================== */

// Global variables
let currentPage = 1;
let recordsPerPage = 10;
let allRecords = [];
let filteredRecords = [];
let userRole = 'Admin'; // Will be set from localStorage

/* ========================================
   INITIALIZATION
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Get user role from localStorage
    userRole = localStorage.getItem('userRole') || 'Admin';
    
    // Load all data
    loadHistoryRecords();
    loadMonthlySummary();
    loadTopDevices();
    loadTopVisitors();
    
    // Set today as default date
    setDefaultDates();
    
    console.log('History page initialized for role:', userRole);
});

/* ========================================
   FILTER FUNCTIONS
   ======================================== */

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];
    
    document.getElementById('dateTo').value = today;
    document.getElementById('dateFrom').value = lastMonthStr;
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const typeFilter = document.getElementById('typeFilter').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
    
    filteredRecords = allRecords.filter(record => {
        // Search filter
        const matchesSearch = !searchTerm || 
            record.name.toLowerCase().includes(searchTerm) ||
            record.permitId.toLowerCase().includes(searchTerm) ||
            record.item.toLowerCase().includes(searchTerm);
        
        // Date range filter
        const recordDate = new Date(record.date);
        const matchesDateFrom = !dateFrom || recordDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || recordDate <= new Date(dateTo);
        
        // Type filter
        const matchesType = !typeFilter || record.type.toLowerCase() === typeFilter;
        
        // Category filter
        const matchesCategory = !categoryFilter || record.category.toLowerCase() === categoryFilter;
        
        // Status filter
        const matchesStatus = !statusFilter || record.status.toLowerCase() === statusFilter;
        
        return matchesSearch && matchesDateFrom && matchesDateTo && 
               matchesType && matchesCategory && matchesStatus;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Update display
    displayRecords();
    updateResultCount();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    
    setDefaultDates();
    applyFilters();
}

/* ========================================
   LOAD HISTORY RECORDS
   ======================================== */

function loadHistoryRecords() {
    // Sample data - replace with API call
    const sampleRecords = generateSampleRecords();
    allRecords = sampleRecords;
    filteredRecords = [...allRecords];
    
    displayRecords();
    updateResultCount();
    
    /* Backend API Integration:
    const endpoint = userRole === 'Guard' 
        ? '/api/history/scan-logs' 
        : '/api/history/all-records';
    
    fetch(endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            allRecords = data.records;
            filteredRecords = [...allRecords];
            displayRecords();
            updateResultCount();
        }
    })
    .catch(error => {
        console.error('Error loading records:', error);
        showError('Failed to load history records');
    });
    */
}

function generateSampleRecords() {
    const records = [];
    const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Robert Brown', 
                   'Emily Davis', 'David Wilson', 'Lisa Anderson', 'James Taylor', 'Maria Garcia'];
    const types = ['visitor', 'staff', 'contractor', 'equipment'];
    const categories = ['equipment', 'visitor'];
    const statuses = ['pending', 'approved', 'rejected', 'expired'];
    const items = ['Laptop - Dell XPS 15', 'Desktop - HP EliteDesk', 'Meeting with Admin', 
                   'Projector - Epson', 'Building Inspection', 'MacBook Pro', 'Document Submission',
                   'Tablet - iPad Pro', 'Consultation', 'Printer - Canon'];
    
    for (let i = 0; i < 50; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        records.push({
            id: i + 1,
            date: date.toISOString(),
            permitId: `UC-${String(i + 1).padStart(6, '0')}`,
            name: names[Math.floor(Math.random() * names.length)],
            type: types[Math.floor(Math.random() * types.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            item: items[Math.floor(Math.random() * items.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            timeIn: date.toISOString(),
            timeOut: Math.random() > 0.5 ? new Date(date.getTime() + 4 * 60 * 60 * 1000).toISOString() : null,
            photos: [`photo1.jpg`, `photo2.jpg`]
        });
    }
    
    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* ========================================
   DISPLAY RECORDS
   ======================================== */

function displayRecords() {
    const tbody = document.getElementById('historyTableBody');
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageRecords = filteredRecords.slice(startIndex, endIndex);
    
    if (pageRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <i class="fas fa-inbox"></i>
                    <p>No records found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageRecords.map(record => {
        const actionButtons = generateActionButtons(record);
        
        return `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td><span class="permit-id">${record.permitId}</span></td>
                <td><span class="record-name">${record.name}</span></td>
                <td>
                    <span class="record-type ${record.type}">
                        <i class="fas fa-circle"></i>
                        ${capitalizeFirst(record.type)}
                    </span>
                </td>
                <td>${record.item}</td>
                <td class="w3-hide-small">
                    <span class="record-status ${record.status}">
                        <i class="fas fa-circle"></i>
                        ${capitalizeFirst(record.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    updatePagination();
}

function generateActionButtons(record) {
    let buttons = `
        <button class="action-btn primary" onclick="viewDetails(${record.id})" title="View Details">
            <i class="fas fa-eye"></i>
            <span class="w3-hide-small">Details</span>
        </button>
    `;
    
    // Download Pass (only for approved records)
    if (record.status === 'approved') {
        buttons += `
            <button class="action-btn" onclick="downloadPass(${record.id})" title="Download Pass">
                <i class="fas fa-download"></i>
                <span class="w3-hide-small">Pass</span>
            </button>
        `;
    }
    
    // View QR (for approved records)
    if (record.status === 'approved') {
        buttons += `
            <button class="action-btn" onclick="viewQR(${record.id})" title="View QR Code">
                <i class="fas fa-qrcode"></i>
                <span class="w3-hide-small">QR</span>
            </button>
        `;
    }
    
    // View Photos
    if (record.photos && record.photos.length > 0) {
        buttons += `
            <button class="action-btn" onclick="viewPhotos(${record.id})" title="View Photos">
                <i class="fas fa-images"></i>
                <span class="w3-hide-small">Photos</span>
            </button>
        `;
    }
    
    // Edit Status (only for CSU and Custodian)
    if (userRole === 'Administrator' || userRole === 'CSU' || userRole === 'Custodian') {
        if (record.status === 'pending') {
            buttons += `
                <button class="action-btn" onclick="editStatus(${record.id})" title="Edit Status">
                    <i class="fas fa-edit"></i>
                    <span class="w3-hide-small">Edit</span>
                </button>
            `;
        }
    }
    
    // Report Issue
    buttons += `
        <button class="action-btn danger" onclick="reportIssue(${record.id})" title="Report Issue">
            <i class="fas fa-exclamation-triangle"></i>
            <span class="w3-hide-small">Report</span>
        </button>
    `;
    
    return buttons;
}

/* ========================================
   ACTION FUNCTIONS
   ======================================== */

function viewDetails(recordId) {
    const record = allRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Permit ID</span>
                <span class="detail-value permit-id">${record.permitId}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value">
                    <span class="record-status ${record.status}">
                        <i class="fas fa-circle"></i>
                        ${capitalizeFirst(record.status)}
                    </span>
                </span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Name</span>
                <span class="detail-value">${record.name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">
                    <span class="record-type ${record.type}">
                        <i class="fas fa-circle"></i>
                        ${capitalizeFirst(record.type)}
                    </span>
                </span>
            </div>
            <div class="detail-item full-width">
                <span class="detail-label">Item / Purpose</span>
                <span class="detail-value">${record.item}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formatDate(record.date)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Category</span>
                <span class="detail-value">${capitalizeFirst(record.category)} Pass</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Time In</span>
                <span class="detail-value">${formatDateTime(record.timeIn)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Time Out</span>
                <span class="detail-value">${record.timeOut ? formatDateTime(record.timeOut) : 'Still Inside'}</span>
            </div>
            ${record.photos && record.photos.length > 0 ? `
                <div class="detail-item full-width">
                    <span class="detail-label">Photos</span>
                    <div class="detail-photos">
                        ${record.photos.map(photo => `
                            <img src="assets/uploads/${photo}" 
                                 alt="Property Photo" 
                                 class="detail-photo"
                                 onerror="this.src='https://via.placeholder.com/150x150/e2e8f0/718096?text=Photo'"
                                 onclick="openPhotoViewer('${photo}')">
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('detailModal').classList.add('show');
    
    /* Backend API Integration:
    fetch(`/api/history/record/${recordId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Populate modal with detailed data
        }
    });
    */
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('show');
}

function downloadPass(recordId) {
    const record = allRecords.find(r => r.id === recordId);
    if (!record) return;
    
    alert(`Downloading pass for ${record.name} (${record.permitId})`);
    
    /* Backend API Integration:
    window.open(`/api/passes/download/${recordId}`, '_blank');
    */
}

function viewQR(recordId) {
    const record = allRecords.find(r => r.id === recordId);
    if (!record) return;
    
    alert(`Viewing QR code for ${record.permitId}`);
    
    /* Backend API Integration:
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="text-align: center;">
            <h3>${record.name}</h3>
            <p>${record.permitId}</p>
            <img src="/api/qr/generate/${recordId}" alt="QR Code" style="width: 300px; height: 300px;">
        </div>
    `;
    document.getElementById('detailModal').classList.add('show');
    */
}

function viewPhotos(recordId) {
    const record = allRecords.find(r => r.id === recordId);
    if (!record) return;
    
    alert(`Viewing photos for ${record.permitId}`);
    // Implementation similar to viewDetails but focused on photos
}

function editStatus(recordId) {
    const record = allRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const newStatus = prompt(`Change status for ${record.permitId}:\n1. Approved\n2. Rejected\n\nEnter number:`, '1');
    
    if (newStatus === '1' || newStatus === '2') {
        const status = newStatus === '1' ? 'approved' : 'rejected';
        
        // Update locally (for demo)
        record.status = status;
        displayRecords();
        
        alert(`Status updated to ${status}`);
        
        /* Backend API Integration:
        fetch(`/api/history/update-status/${recordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ status: status })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadHistoryRecords();
            }
        });
        */
    }
}

function reportIssue(recordId) {
    const record = allRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const issue = prompt(`Report an issue for ${record.permitId}:`, '');
    
    if (issue) {
        alert('Issue reported successfully');
        
        /* Backend API Integration:
        fetch('/api/history/report-issue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                recordId: recordId,
                issue: issue
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Issue reported successfully');
            }
        });
        */
    }
}

/* ========================================
   PAGINATION FUNCTIONS
   ======================================== */

function updatePagination() {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const pageNumbersDiv = document.getElementById('pageNumbers');
    
    let pagesHTML = '';
    
    // Show max 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pagesHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }
    
    pageNumbersDiv.innerHTML = pagesHTML;
}

function goToPage(page) {
    currentPage = page;
    displayRecords();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayRecords();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayRecords();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateResultCount() {
    document.getElementById('resultCount').textContent = filteredRecords.length;
}

/* ========================================
   VIEW FUNCTIONS
   ======================================== */

function changeView(viewType) {
    // Update button states
    const buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.view-btn').classList.add('active');
    
    if (viewType === 'card') {
        alert('Card view coming soon!');
        // Implement card view layout
    }
}

/* ========================================
   EXPORT FUNCTIONS
   ======================================== */

function exportRecords() {
    alert('Exporting records to CSV...');
    
    /* Backend API Integration:
    const filters = {
        search: document.getElementById('searchInput').value,
        dateFrom: document.getElementById('dateFrom').value,
        dateTo: document.getElementById('dateTo').value,
        type: document.getElementById('typeFilter').value,
        category: document.getElementById('categoryFilter').value,
        status: document.getElementById('statusFilter').value
    };
    
    fetch('/api/history/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ filters: filters })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartpass-records-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
    */
}

/* ========================================
   ANALYTICS FUNCTIONS (from dashboard.js)
   ======================================== */

function loadMonthlySummary() {
    const summaryData = {
        computer: { checkIn: 145, checkOut: 132, netInside: 13, capacity: 200 },
        nonComputer: { checkIn: 89, checkOut: 75, netInside: 14, capacity: 150 },
        visitors: { checkIn: 234, checkOut: 218, netInside: 16, capacity: 300 }
    };
    
    displayMonthlySummary(summaryData);
}

function displayMonthlySummary(data) {
    document.getElementById('computerIn').textContent = data.computer.checkIn;
    document.getElementById('computerOut').textContent = data.computer.checkOut;
    document.getElementById('computerNet').textContent = data.computer.netInside;
    
    const computerPercent = (data.computer.netInside / data.computer.capacity * 100).toFixed(1);
    document.getElementById('computerProgress').style.width = computerPercent + '%';
    document.getElementById('computerProgressText').textContent = computerPercent + '% capacity';
    
    document.getElementById('nonComputerIn').textContent = data.nonComputer.checkIn;
    document.getElementById('nonComputerOut').textContent = data.nonComputer.checkOut;
    document.getElementById('nonComputerNet').textContent = data.nonComputer.netInside;
    
    const nonComputerPercent = (data.nonComputer.netInside / data.nonComputer.capacity * 100).toFixed(1);
    document.getElementById('nonComputerProgress').style.width = nonComputerPercent + '%';
    document.getElementById('nonComputerProgressText').textContent = nonComputerPercent + '% capacity';
    
    document.getElementById('visitorsIn').textContent = data.visitors.checkIn;
    document.getElementById('visitorsOut').textContent = data.visitors.checkOut;
    document.getElementById('visitorsNet').textContent = data.visitors.netInside;
    
    const visitorsPercent = (data.visitors.netInside / data.visitors.capacity * 100).toFixed(1);
    document.getElementById('visitorsProgress').style.width = visitorsPercent + '%';
    document.getElementById('visitorsProgressText').textContent = visitorsPercent + '% capacity';
}

function updateMonthlySummary() {
    loadMonthlySummary();
}

function loadTopDevices() {
    const topDevices = [
        { name: 'Dell Laptop XPS 15', category: 'Computer', count: 45, owner: 'IT Department' },
        { name: 'HP Desktop EliteDesk', category: 'Computer', count: 38, owner: 'Admin Office' },
        { name: 'Epson Projector', category: 'Non-Computer', count: 32, owner: 'Faculty Room' },
        { name: 'MacBook Pro', category: 'Computer', count: 28, owner: 'Design Department' },
        { name: 'Canon Printer', category: 'Non-Computer', count: 25, owner: 'Office Supplies' }
    ];
    
    displayTopItems('topDevicesList', topDevices, 'device');
}

function loadTopVisitors() {
    const topVisitors = [
        { name: 'John Michael Santos', purpose: 'Business Meeting', count: 24, lastVisit: '2 days ago' },
        { name: 'Maria Clara Garcia', purpose: 'Consultation', count: 18, lastVisit: '1 day ago' },
        { name: 'Robert James Lee', purpose: 'Document Submission', count: 15, lastVisit: 'Today' },
        { name: 'Anna Marie Cruz', purpose: 'Faculty Meeting', count: 12, lastVisit: '3 days ago' },
        { name: 'David Park Kim', purpose: 'Student Affairs', count: 10, lastVisit: 'Today' }
    ];
    
    displayTopItems('topVisitorsList', topVisitors, 'visitor');
}

function displayTopItems(containerId, items, type) {
    const container = document.getElementById(containerId);
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="loading-placeholder">
                <i class="fas fa-inbox"></i>
                <p>No ${type}s data available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map((item, index) => {
        const rank = index + 1;
        const metaInfo = type === 'device' 
            ? `${item.category} • ${item.owner}`
            : `${item.purpose} • Last: ${item.lastVisit}`;
        
        return `
            <div class="top-item">
                <div class="top-item-rank">${rank}</div>
                <div class="top-item-info">
                    <div class="top-item-name">${item.name}</div>
                    <div class="top-item-meta">${metaInfo}</div>
                </div>
                <div class="top-item-count">
                    <div class="count-value">${item.count}</div>
                    <div class="count-label">check-ins</div>
                </div>
            </div>
        `;
    }).join('');
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showError(message) {
    alert(message);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeDetailModal();
    }
}

/* ========================================
   API ENDPOINTS FOR BACKEND TEAM
   ======================================== */

/*
REQUIRED API ENDPOINTS:

1. GET /api/history/all-records
   - For CSU and Custodian roles
   - Returns all permits and scan records
   Response: { success: true, records: [...] }

2. GET /api/history/scan-logs
   - For Guard role
   - Returns only scan history
   Query params: ?gate=main&date=2026-02-16
   Response: { success: true, records: [...] }

3. GET /api/history/record/:id
   - Get detailed record information
   Response: { success: true, record: {...} }

4. PUT /api/history/update-status/:id
   - Update record status (CSU/Custodian only)
   Body: { status: 'approved' | 'rejected' }
   Response: { success: true, message: 'Status updated' }

5. POST /api/history/report-issue
   - Report an issue with a record
   Body: { recordId: number, issue: string }
   Response: { success: true, message: 'Issue reported' }

6. POST /api/history/export
   - Export filtered records to CSV
   Body: { filters: {...} }
   Response: CSV file download

7. GET /api/passes/download/:id
   - Download pass as PDF
   Response: PDF file

8. GET /api/qr/generate/:id
   - Generate QR code for permit
   Response: QR code image

RECORD STRUCTURE:
{
    id: number,
    date: ISO date string,
    permitId: string,
    name: string,
    type: 'visitor' | 'staff' | 'contractor' | 'equipment',
    category: 'equipment' | 'visitor',
    item: string,
    status: 'pending' | 'approved' | 'rejected' | 'expired',
    timeIn: ISO date string,
    timeOut: ISO date string | null,
    photos: string[] | null
}
*/