/* ========================================
   PERMIT FORM JAVASCRIPT
   ======================================== */

// Global variables
let uploadedPhotos = [];
let currentFormType = null;

/* ========================================
   INITIALIZATION
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('computerDate').value = today;
    document.getElementById('nonComputerDate').value = today;
    
    // Generate initial ID numbers
    generateIdNumber('computer');
    generateIdNumber('non-computer');
    
    console.log('Permit form initialized');
});

/* ========================================
   FORM TYPE SELECTION
   ======================================== */

function selectFormType(type) {
    currentFormType = type;
    
    // Hide selection screen
    document.getElementById('formTypeSelection').style.display = 'none';
    
    // Show appropriate form
    if (type === 'computer') {
        document.getElementById('computerForm').style.display = 'block';
        document.getElementById('nonComputerForm').style.display = 'none';
    } else {
        document.getElementById('computerForm').style.display = 'none';
        document.getElementById('nonComputerForm').style.display = 'block';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToSelection() {
    // Show confirmation if form has data
    if (confirm('Are you sure? Any unsaved changes will be lost.')) {
        // Hide forms
        document.getElementById('computerForm').style.display = 'none';
        document.getElementById('nonComputerForm').style.display = 'none';
        
        // Show selection
        document.getElementById('formTypeSelection').style.display = 'flex';
        
        // Reset forms
        document.getElementById('computerEquipmentForm').reset();
        document.getElementById('nonComputerEquipmentForm').reset();
        
        // Clear uploaded photos
        uploadedPhotos = [];
        document.getElementById('computerPhotoPreview').innerHTML = '';
        
        currentFormType = null;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* ========================================
   ID NUMBER GENERATION
   ======================================== */

function generateIdNumber(type) {
    const prefix = type === 'computer' ? 'CMP' : 'OFP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const idNumber = `${prefix}-${timestamp}${random}`;
    
    if (type === 'computer') {
        document.getElementById('computerId').value = idNumber;
    } else {
        document.getElementById('nonComputerId').value = idNumber;
    }
    
    return idNumber;
}

/* ========================================
   CLEAR FUNCTIONS
   ======================================== */

function clearBasicInfo(type) {
    if (confirm('Clear all basic information fields?')) {
        if (type === 'computer') {
            document.getElementById('computerBearer').value = '';
            document.getElementById('computerType').value = '';
            document.getElementById('computerPurpose').value = '';
        } else {
            document.getElementById('nonComputerBearer').value = '';
            document.getElementById('nonComputerType').value = '';
            document.getElementById('nonComputerPurpose').value = '';
        }
    }
}

/* ========================================
   PHOTO UPLOAD
   ======================================== */

function handlePhotoUpload(event, type) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
        alert('Some files exceed 5MB limit and will be skipped.');
    }
    
    // Filter valid files
    const validFiles = files.filter(file => file.size <= maxSize);
    
    // Add to uploaded photos
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedPhotos.push({
                file: file,
                preview: e.target.result,
                name: file.name
            });
            displayPhotoPreview(type);
        };
        reader.readAsDataURL(file);
    });
}

function displayPhotoPreview(type) {
    const previewContainer = document.getElementById('computerPhotoPreview');
    
    previewContainer.innerHTML = uploadedPhotos.map((photo, index) => `
        <div class="photo-preview-item">
            <img src="${photo.preview}" alt="${photo.name}" class="photo-preview-img">
            <button type="button" 
                    class="photo-remove-btn" 
                    onclick="removePhoto(${index})"
                    title="Remove photo">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    displayPhotoPreview(currentFormType);
}

// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('computerUploadArea');
    
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            uploadArea.style.borderColor = '#003366';
            uploadArea.style.background = '#f0f4f8';
        }
        
        function unhighlight() {
            uploadArea.style.borderColor = '#cbd5e0';
            uploadArea.style.background = '#f8fafc';
        }
        
        uploadArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            document.getElementById('computerPhotoInput').files = files;
            handlePhotoUpload({ target: { files: files } }, 'computer');
        }
    }
});

/* ========================================
   ITEMS TABLE (Non-Computer Form)
   ======================================== */

function addItemRow() {
    const tbody = document.getElementById('itemsTableBody');
    const newRow = document.createElement('tr');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <td>
            <input type="number" 
                   class="item-input" 
                   min="1" 
                   value="1" 
                   placeholder="Qty"
                   required>
        </td>
        <td>
            <input type="text" 
                   class="item-input" 
                   placeholder="e.g., Epson Projector EB-X41, Serial No: ABC123"
                   required>
        </td>
        <td>
            <button type="button" 
                    class="remove-item-btn" 
                    onclick="removeItem(this)"
                    title="Remove item">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(newRow);
}

function removeItem(button) {
    const tbody = document.getElementById('itemsTableBody');
    const rows = tbody.getElementsByTagName('tr');
    
    // Keep at least one row
    if (rows.length > 1) {
        button.closest('tr').remove();
    } else {
        alert('At least one item is required');
    }
}

/* ========================================
   FORM SUBMISSION
   ======================================== */

function submitComputerForm(event) {
    event.preventDefault();
    
    // Validate photos
    if (uploadedPhotos.length === 0) {
        alert('Please upload at least one photo of the equipment');
        return;
    }
    
    // Collect form data
    const formData = {
        type: 'computer',
        bearer: document.getElementById('computerBearer').value,
        bearerType: document.getElementById('computerType').value,
        permitId: document.getElementById('computerId').value,
        date: document.getElementById('computerDate').value,
        purpose: document.getElementById('computerPurpose').value,
        equipment: {
            type: document.getElementById('computerEquipmentType').value,
            brand: document.getElementById('computerBrand').value,
            model: document.getElementById('computerModel').value,
            serial: document.getElementById('computerSerial').value,
            accessories: document.getElementById('computerAccessories').value,
            processor: document.getElementById('computerProcessor').value,
            memory: document.getElementById('computerMemory').value,
            hardDrive: document.getElementById('computerHardDrive').value,
            monitor: document.getElementById('computerMonitor').value,
            casing: document.getElementById('computerCasing').value,
            os: document.getElementById('computerOS').value
        },
        photos: uploadedPhotos.map(p => p.name),
        custodian: document.getElementById('computerCustodian').value,
        status: 'pending',
        submittedAt: new Date().toISOString()
    };
    
    // Show loading
    showLoading();
    
    // Submit to backend
    submitApplication(formData);
}

function submitNonComputerForm(event) {
    event.preventDefault();
    
    // Collect items data
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
    
    // Collect form data
    const formData = {
        type: 'non-computer',
        bearer: document.getElementById('nonComputerBearer').value,
        bearerType: document.getElementById('nonComputerType').value,
        permitId: document.getElementById('nonComputerId').value,
        date: document.getElementById('nonComputerDate').value,
        purpose: document.getElementById('nonComputerPurpose').value,
        items: items,
        custodian: document.getElementById('nonComputerCustodian').value,
        status: 'pending',
        submittedAt: new Date().toISOString()
    };
    
    // Show loading
    showLoading();
    
    // Submit to backend
    submitApplication(formData);
}

function submitApplication(formData) {
    // Simulate API delay
    setTimeout(() => {
        hideLoading();
        showSuccessModal(formData);
        
        // Send notification to CSU
        notifyCSU(formData);
    }, 1500);
    
    /* Backend API Integration:
    const formDataToSend = new FormData();
    
    // Append form fields
    Object.keys(formData).forEach(key => {
        if (key === 'equipment' || key === 'items') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'photos') {
            formDataToSend.append(key, formData[key]);
        }
    });
    
    // Append photos
    if (formData.type === 'computer') {
        uploadedPhotos.forEach((photo, index) => {
            formDataToSend.append(`photo_${index}`, photo.file);
        });
    }
    
    fetch('/api/permits/create', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: formDataToSend
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.success) {
            showSuccessModal(data.permit);
            
            // Notify CSU for approval
            notifyCSU(data.permit);
            
            // Reset form
            resetForm();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Submission error:', error);
        alert('Failed to submit application. Please try again.');
    });
    */
}

/* ========================================
   NOTIFICATIONS
   ======================================== */

function notifyCSU(permitData) {
    // Send notification to CSU Head for approval
    console.log('Notifying CSU Head for approval:', permitData.permitId);
    
    /* Backend API Integration:
    fetch('/api/notifications/csu-approval', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            permitId: permitData.permitId,
            bearer: permitData.bearer,
            type: permitData.type,
            custodian: permitData.custodian,
            submittedAt: permitData.submittedAt
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('CSU notified successfully');
        }
    })
    .catch(error => {
        console.error('Notification error:', error);
    });
    */
}

function notifyCustodianApproval(permitData) {
    // After CSU approves, notify custodian
    console.log('Notifying custodian of approval:', permitData.permitId);
    
    /* Backend API Integration:
    This function will be called by CSU approval endpoint
    
    fetch('/api/notifications/custodian-approved', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            permitId: permitData.permitId,
            bearer: permitData.bearer,
            approvedBy: permitData.approvedBy,
            approvedAt: permitData.approvedAt,
            qrCode: permitData.qrCode
        })
    });
    */
}

/* ========================================
   SUCCESS MODAL
   ======================================== */

function showSuccessModal(formData) {
    document.getElementById('successPassId').textContent = formData.permitId;
    document.getElementById('successBearer').textContent = formData.bearer;
    document.getElementById('successDate').textContent = new Date().toLocaleDateString();
    
    const message = `Your gate pass application has been successfully submitted and is now pending approval from the CSU Head. You will be notified once it's approved.`;
    document.getElementById('successMessage').textContent = message;
    
    document.getElementById('successModal').classList.add('show');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
    backToSelection();
}

function createNewApplication() {
    document.getElementById('successModal').classList.remove('show');
    backToSelection();
}

/* ========================================
   LOADING STATE
   ======================================== */

function showLoading() {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
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

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

/* ========================================
   FORM RESET
   ======================================== */

function resetForm() {
    if (currentFormType === 'computer') {
        document.getElementById('computerEquipmentForm').reset();
        uploadedPhotos = [];
        document.getElementById('computerPhotoPreview').innerHTML = '';
        generateIdNumber('computer');
    } else {
        document.getElementById('nonComputerEquipmentForm').reset();
        // Reset to one item row
        const tbody = document.getElementById('itemsTableBody');
        tbody.innerHTML = `
            <tr class="item-row">
                <td>
                    <input type="number" class="item-input" min="1" value="1" placeholder="Qty" required>
                </td>
                <td>
                    <input type="text" class="item-input" placeholder="e.g., Epson Projector EB-X41, Serial No: ABC123" required>
                </td>
                <td>
                    <button type="button" class="remove-item-btn" onclick="removeItem(this)" title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        generateIdNumber('non-computer');
    }
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('computerDate').value = today;
    document.getElementById('nonComputerDate').value = today;
}

/* ========================================
   CSU APPROVAL HANDLER
   ======================================== */

// This function would be called when CSU approves the permit
function handleCSUApproval(permitId, approvalData) {
    /* Backend API Integration:
    fetch(`/api/permits/${permitId}/approve`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            approvedBy: approvalData.approvedBy,
            approvalNotes: approvalData.notes,
            approvedAt: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Generate QR Code
            generateQRCode(data.permit);
            
            // Notify custodian
            notifyCustodianApproval(data.permit);
            
            alert('Permit approved successfully');
        }
    });
    */
}

function generateQRCode(permitData) {
    /* Backend API Integration:
    fetch('/api/permits/generate-qr', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            permitId: permitData.permitId,
            bearer: permitData.bearer,
            validUntil: permitData.validUntil
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('QR Code generated:', data.qrCodeUrl);
            // QR code is now available for download/print
        }
    });
    */
}

/* ========================================
   API ENDPOINTS DOCUMENTATION
   ======================================== */

/*
REQUIRED API ENDPOINTS:

1. POST /api/permits/create
   - Create new permit application
   - Auto-approved by custodian (status: pending CSU approval)
   Headers: { Authorization: Bearer token }
   Body: FormData with permit details and photos
   Response: {
       success: true,
       permit: {
           id: number,
           permitId: string,
           bearer: string,
           type: 'computer' | 'non-computer',
           status: 'pending',
           ...
       }
   }

2. POST /api/notifications/csu-approval
   - Notify CSU Head for approval
   Headers: { Authorization: Bearer token }
   Body: {
       permitId: string,
       bearer: string,
       type: string,
       custodian: string,
       submittedAt: ISO date
   }
   Response: { success: true, message: 'CSU notified' }

3. PUT /api/permits/:permitId/approve
   - CSU approves permit (CSU role only)
   Headers: { Authorization: Bearer token }
   Body: {
       approvedBy: string,
       approvalNotes: string,
       approvedAt: ISO date
   }
   Response: {
       success: true,
       permit: { ...updated permit with QR code... }
   }

4. POST /api/notifications/custodian-approved
   - Notify custodian of approval
   Headers: { Authorization: Bearer token }
   Body: {
       permitId: string,
       bearer: string,
       approvedBy: string,
       approvedAt: ISO date,
       qrCode: string (URL)
   }
   Response: { success: true }

5. POST /api/permits/generate-qr
   - Generate QR code for approved permit
   Headers: { Authorization: Bearer token }
   Body: {
       permitId: string,
       bearer: string,
       validUntil: ISO date
   }
   Response: {
       success: true,
       qrCodeUrl: string,
       downloadUrl: string
   }

6. GET /api/permits/:permitId/download
   - Download permit pass as PDF
   Headers: { Authorization: Bearer token }
   Response: PDF file

7. GET /api/permits/:permitId/qr
   - Get QR code image
   Headers: { Authorization: Bearer token }
   Response: PNG image

WORKFLOW:
1. Custodian submits permit → Status: pending
2. System notifies CSU Head
3. CSU approves → Status: approved, QR generated
4. System notifies Custodian with QR code
5. Custodian can download/print pass with QR
*/  