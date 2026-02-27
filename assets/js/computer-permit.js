/* Computer Permit Form JavaScript */

let uploadedPhotos = [];

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('computerDate').value = today;
    document.getElementById('computerId').value = 'GP#';
});

function clearBasicInfo(type) {
    if (confirm('Clear all basic information fields?')) {
        document.getElementById('computerBearer').value = '';
        document.getElementById('computerType').value = '';
        document.getElementById('computerPurpose').value = '';
    }
}

function handlePhotoUpload(event, type) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        if (file.size <= 5 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedPhotos.push({file: file, preview: e.target.result});
                displayPhotoPreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

function displayPhotoPreview() {
    const container = document.getElementById('computerPhotoPreview');
    container.innerHTML = uploadedPhotos.map((photo, index) => `
        <div class="photo-preview-item">
            <img src="${photo.preview}" class="photo-preview-img">
            <button type="button" class="photo-remove-btn" onclick="removePhoto(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    displayPhotoPreview();
}

function submitComputerForm(event) {
    event.preventDefault();
    if (uploadedPhotos.length === 0) {
        alert('Please upload at least one photo');
        return;
    }
    
    const formData = {
        bearer: document.getElementById('computerBearer').value,
        type: document.getElementById('computerType').value,
        permitId: document.getElementById('computerId').value,
        date: document.getElementById('computerDate').value,
        purpose: document.getElementById('computerPurpose').value,
        equipment: {
            type: document.getElementById('computerEquipmentType').value,
            brand: document.getElementById('computerBrand').value,
            model: document.getElementById('computerModel').value,
            serial: document.getElementById('computerSerial').value,
            processor: document.getElementById('computerProcessor').value,
            memory: document.getElementById('computerMemory').value,
            hardDrive: document.getElementById('computerHardDrive').value
        }
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
        if (key === 'equipment') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
            formDataToSend.append(key, formData[key]);
        }
    });
    
    uploadedPhotos.forEach((photo, index) => {
        formDataToSend.append(`photo_${index}`, photo.file);
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