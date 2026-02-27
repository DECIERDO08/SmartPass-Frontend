/* Non-Computer Permit Form JavaScript */

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('nonComputerDate').value = today;
    document.getElementById('nonComputerId').value = 'GP#';
});

function clearBasicInfo(type) {
    if (confirm('Clear all basic information fields?')) {
        document.getElementById('nonComputerBearer').value = '';
        document.getElementById('nonComputerType').value = '';
        document.getElementById('nonComputerPurpose').value = '';
    }
}

function addItemRow() {
    const tbody = document.getElementById('itemsTableBody');
    const newRow = document.createElement('tr');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <td><input type="number" class="item-input" min="1" value="1" required></td>
        <td><input type="text" class="item-input" placeholder="Item description" required></td>
        <td><button type="button" class="remove-item-btn" onclick="removeItem(this)"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(newRow);
}

function removeItem(button) {
    const tbody = document.getElementById('itemsTableBody');
    if (tbody.getElementsByTagName('tr').length > 1) {
        button.closest('tr').remove();
    } else {
        alert('At least one item is required');
    }
}

function submitNonComputerForm(event) {
    event.preventDefault();
    
    // Collect items
    const tbody = document.getElementById('itemsTableBody');
    const rows = tbody.getElementsByTagName('tr');
    const items = [];
    
    for (let row of rows) {
        const inputs = row.getElementsByTagName('input');
        items.push({
            quantity: inputs[0].value,
            description: inputs[1].value
        });
    }
    
    const formData = {
        bearer: document.getElementById('nonComputerBearer').value,
        type: document.getElementById('nonComputerType').value,
        permitId: document.getElementById('nonComputerId').value,
        date: document.getElementById('nonComputerDate').value,
        purpose: document.getElementById('nonComputerPurpose').value,
        items: items
    };
    
    // Show loading
    showSubmitting();
    
    // Simulate API call
    setTimeout(() => {
        hideSubmitting();
        showPendingModal(formData);
    }, 1000);
    
    /* Backend API Integration:
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
        if (key === 'items') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
            formDataToSend.append(key, formData[key]);
        }
    });
    
    fetch('/api/permits/create', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: formDataToSend
    })
    .then(response => response.json())
    .then(data => {
        hideSubmitting();
        if (data.success) {
            showPendingModal(data.permit);
            // Backend will notify CSU automatically
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        hideSubmitting();
        alert('Failed to submit application. Please try again.');
    });
    */
}

function showSubmitting() {
    const overlay = document.createElement('div');
    overlay.id = 'submittingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    overlay.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
            <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #003366; margin-bottom: 20px;"></i>
            <h3 style="color: #1a202c; margin-bottom: 8px;">Submitting Application...</h3>
            <p style="color: #718096; font-size: 14px;">Please wait</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideSubmitting() {
    const overlay = document.getElementById('submittingOverlay');
    if (overlay) overlay.remove();
}

function showPendingModal(formData) {
    document.getElementById('successPassId').textContent = formData.permitId;
    document.getElementById('successBearer').textContent = formData.bearer;
    document.getElementById('successIdNumber').textContent = Math.floor(Math.random() * 100000000);
    document.getElementById('successDate').textContent = new Date().toLocaleDateString();
    
    // Change message to pending
    document.getElementById('successMessage').textContent = 
        'Your application has been submitted successfully. CSU Head will review and approve your permit. You will be notified once approved.';
    
    // Change status badge to pending
    const statusBadge = document.querySelector('.success-details .status-badge');
    if (statusBadge) {
        statusBadge.className = 'status-badge pending';
        statusBadge.innerHTML = '<i class="fas fa-clock"></i> PENDING APPROVAL';
    }
    
    // Hide the action buttons (Print, Download, Email)
    const actionGrid = document.querySelector('.success-actions-grid');
    if (actionGrid) actionGrid.style.display = 'none';
    
    document.getElementById('successModal').classList.add('show');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
    window.location.href = 'permit-form.html';
}

function createNewApplication() {
    closeSuccessModal();
}

// These functions only work after CSU approval
function printSticker() {
    alert('This feature is only available after CSU approval');
}

function downloadQR() {
    alert('QR code will be available after CSU approval');
}

function emailPass() {
    alert('This feature is only available after CSU approval');
}