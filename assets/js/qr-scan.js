/* ========================================
   QR SCAN PAGE — qr-scan.js
   ======================================== */

'use strict';

/* ── State ────────────────────────────── */
let isScanning   = false;
let currentGate  = 'entry';    // 'entry' | 'exit'
let scanResults  = [];
let entryCount   = 0;
let exitCount    = 0;
let cameraStream = null;
let scanInterval = null;       // polling interval for QR detection

/* ── DOM shortcuts ───────────────────── */
const scanBtn          = () => document.getElementById('scanBtn');
const scanBtnText      = () => document.getElementById('scanBtnText');
const laserLine        = () => document.getElementById('laserLine');
const cameraFeed       = () => document.getElementById('cameraFeed');
const cameraPlaceholder= () => document.getElementById('cameraPlaceholder');
const scanOverlay      = () => document.getElementById('scanOverlay');
const overlayIcon      = () => document.getElementById('overlayIcon');
const overlayText      = () => document.getElementById('overlayText');
const resultsBody      = () => document.getElementById('scanResultsBody');
const emptyRow         = () => document.getElementById('emptyRow');
const lastScanTime     = () => document.getElementById('lastScanTime');
const entryCountEl     = () => document.getElementById('entryCount');
const exitCountEl      = () => document.getElementById('exitCount');
const totalCountEl     = () => document.getElementById('totalCount');

/* ========================================
   INITIALIZATION
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    setGate('entry');
    console.log('[SmartPass] QR Scan page ready.');
});

/* ========================================
   GATE TOGGLE
   ======================================== */

function setGate(type) {
    currentGate = type;

    document.getElementById('toggleEntry').classList.toggle('active', type === 'entry');
    document.getElementById('toggleExit').classList.toggle('active', type === 'exit');
}

/* ========================================
   SCANNING TOGGLE (start / stop)
   ======================================== */

async function toggleScanning() {
    if (isScanning) {
        stopScanning();
    } else {
        await startScanning();
    }
}

async function startScanning() {
    isScanning = true;

    /* Update button UI */
    scanBtn().classList.add('scanning');
    scanBtnText().textContent = 'SCANNING…';
    laserLine().classList.add('scanning');

    /* Start camera */
    await startCamera();

    /* ── In production: initialise a real QR library here ──
       e.g. jsQR, ZXing, or html5-qrcode.
       The scan loop below calls handleQRDetected() when a code is found.
    ────────────────────────────────────────────────────── */

    /* DEMO: auto-fire a simulated scan after 2.5 s */
    scanInterval = setTimeout(() => {
        if (isScanning) {
            simulateScan();
        }
    }, 2500);
}

function stopScanning() {
    isScanning = false;

    scanBtn().classList.remove('scanning');
    scanBtnText().textContent = 'SCAN QR CODE';
    laserLine().classList.remove('scanning');

    clearTimeout(scanInterval);
    stopCamera();
}

/* ========================================
   CAMERA HELPERS
   ======================================== */

async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } }
        });
        cameraFeed().srcObject = cameraStream;
        cameraFeed().style.display = 'block';
        cameraPlaceholder().style.display = 'none';
    } catch (err) {
        /* Camera permission denied / not available — silently continue with placeholder */
        console.warn('[Camera] Could not access camera:', err.message);
        cameraPlaceholder().style.display = 'flex';
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
    cameraFeed().style.display = 'none';
    cameraPlaceholder().style.display = 'flex';
}

/* ========================================
   QR DETECTION HANDLER
   ======================================== */

/**
 * Call this with the decoded QR string whenever a QR code is detected.
 * In production: call from your jsQR / ZXing scan callback.
 *
 * @param {string} qrData — raw string from the QR code
 */
function handleQRDetected(qrData) {
    if (!isScanning) return;

    stopScanning();

    /* Parse QR payload */
    let permitData = parseQRPayload(qrData);

    if (!permitData) {
        showScanOverlay('error', 'Invalid QR Code');
        showToast('error', 'Invalid QR Code', 'This QR code is not recognised.');
        return;
    }

    /* Validate permit via backend, then log the scan */
    validateAndLogScan(permitData);
}

/* ========================================
   QR PAYLOAD PARSER
   ======================================== */

/**
 * Expected QR payload (JSON string):
 * {
 *   permitId : "UC-000001",
 *   bearer   : "John Doe",
 *   idNumber : "22076840",
 *   gpNumber : "CMP-123456",
 *   itemPurpose : "Dell XPS 15 Laptop",
 *   photoUrl : "/assets/uploads/permit_001.jpg",
 *   status   : "approved",
 *   validUntil: "2026-12-31"
 * }
 */
function parseQRPayload(raw) {
    try {
        const data = JSON.parse(raw);
        if (!data.permitId || !data.bearer) return null;
        return data;
    } catch {
        /* Try plain-text format: "permitId|bearer|idNumber|gpNumber" */
        const parts = raw.split('|');
        if (parts.length >= 2) {
            return { permitId: parts[0], bearer: parts[1], idNumber: parts[2] || '—', gpNumber: parts[3] || '—', itemPurpose: parts[4] || '—', photoUrl: null, status: 'approved' };
        }
        return null;
    }
}

/* ========================================
   BACKEND VALIDATION + SCAN LOGGING
   ======================================== */

function validateAndLogScan(permitData) {
    /* Try backend validation first; fall back to local mock data on error */
    const token = localStorage.getItem('token');

    fetch('/api/qr/validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? 'Bearer ' + token : ''
        },
        body: JSON.stringify({
            permitId : permitData.permitId,
            gate     : currentGate,
            scannedAt: new Date().toISOString(),
            guardId  : localStorage.getItem('userId') || null
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data && data.success) {
            processValidScan(data.permit || permitData);
            notifyDashboard(data.scanLog);
        } else {
            // Backend returned failure — show message but still allow local demo fallback
            if (data && data.message) {
                showScanOverlay('error', data.message);
                showToast('error', 'Scan Failed', data.message);
            }
            // Fallback to mock locally if backend doesn't accept
            const mockValidated = {
                ...permitData,
                bearer     : permitData.bearer      || 'John Doe',
                idNumber   : permitData.idNumber    || '22076840',
                gpNumber   : permitData.gpNumber    || 'CMP-123456',
                itemPurpose: permitData.itemPurpose || 'Dell XPS 15 Laptop',
                photoUrl   : permitData.photoUrl    || null,
                status     : permitData.status      || 'approved'
            };
            processValidScan(mockValidated);
        }
    })
    .catch(err => {
        console.warn('[Scan] Backend validate failed, using demo data:', err);
        const mockValidated = {
            ...permitData,
            bearer     : permitData.bearer      || 'John Doe',
            idNumber   : permitData.idNumber    || '22076840',
            gpNumber   : permitData.gpNumber    || 'CMP-123456',
            itemPurpose: permitData.itemPurpose || 'Dell XPS 15 Laptop',
            photoUrl   : permitData.photoUrl    || null,
            status     : permitData.status      || 'approved'
        };
        processValidScan(mockValidated);
    });
}

function processValidScan(permit) {
    /* Show overlay */
    showScanOverlay('success', `${currentGate === 'entry' ? 'Entry' : 'Exit'} Logged`);

    /* Update counters */
    if (currentGate === 'entry') {
        entryCount++;
        entryCountEl().textContent = entryCount;
    } else {
        exitCount++;
        exitCountEl().textContent = exitCount;
    }
    totalCountEl().textContent = entryCount + exitCount;

    /* Build scan record */
    const now = new Date();
    const record = {
        id         : now.getTime(),
        name       : permit.bearer,
        idNumber   : permit.idNumber,
        itemPurpose: permit.itemPurpose,
        gpNumber   : permit.gpNumber,
        photoUrl   : permit.photoUrl,
        qrData     : permit.permitId,
        gate       : currentGate,
        time       : now
    };

    scanResults.unshift(record);
    appendResultRow(record);

    /* Update timestamp */
    lastScanTime().textContent = 'Last: ' + formatTime(now);

    /* Toast */
    showToast('success',
        `${currentGate === 'entry' ? 'Entry' : 'Exit'} Logged`,
        permit.bearer + ' — ' + permit.itemPurpose
    );
}

/* ========================================
   DASHBOARD NOTIFICATION (WebSocket / Poll)
   ======================================== */

function notifyDashboard(scanLog) {
    /* ── Backend API Integration ──────────────────────────
    // Option A: POST to a dedicated live-feed endpoint
    fetch('/api/dashboard/live-feed/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(scanLog)
    });

    // Option B: Emit via socket.io
    // socket.emit('scan:new', scanLog);
    ───────────────────────────────────────────────────── */
    console.log('[Dashboard] Notified with scan log:', scanLog);
}

/* ========================================
   RESULTS TABLE
   ======================================== */

function appendResultRow(record) {
    const tbody = resultsBody();
    if (!tbody) {
        // Results table removed in single-scanner view — keep record in memory only
        console.debug('[Scan] Result stored (no table):', record);
        return;
    }

    /* Hide empty row */
    const empty = emptyRow();
    if (empty) empty.style.display = 'none';

    const tr = document.createElement('tr');
    tr.className = 'new-row';
    tr.dataset.id = record.id;

    const photoCell = record.photoUrl
        ? `<img src="${record.photoUrl}"
                alt="Photo"
                class="photo-thumb"
                onclick="openLightbox('${record.photoUrl}', '${escHtml(record.name)}')"
                onerror="this.outerHTML='<div class=\\'no-photo\\'><i class=\\'fas fa-image\\'></i></div>'">`
        : `<div class="no-photo"><i class="fas fa-image"></i></div>`;

    tr.innerHTML = `
        <td><span class="cell-name">${escHtml(record.name)}</span></td>
        <td>${escHtml(record.idNumber)}</td>
        <td>${escHtml(record.itemPurpose)}</td>
        <td><span class="cell-gp">${escHtml(record.gpNumber)}</span></td>
        <td>${photoCell}</td>
        <td>
            <button class="qr-view-btn" onclick="viewQR('${escHtml(record.qrData)}')" title="View QR">
                <i class="fas fa-qrcode"></i>
            </button>
        </td>
        <td>
            <span class="status-pill ${record.gate}">
                <i class="fas fa-circle"></i>
                ${record.gate === 'entry' ? 'Entry' : 'Exit'}
            </span>
        </td>
        <td><span class="cell-time">${formatTime(record.time)}</span></td>
    `;

    tbody.insertBefore(tr, tbody.firstChild);

    /* Remove 'new-row' animation class after animation ends */
    tr.addEventListener('animationend', () => tr.classList.remove('new-row'), { once: true });
}

/* ========================================
   CLEAR / RESET
   ======================================== */

function clearResults() {
    if (isScanning) stopScanning();

    scanResults = [];
    entryCount  = 0;
    exitCount   = 0;

    if (entryCountEl()) entryCountEl().textContent = '0';
    if (exitCountEl()) exitCountEl().textContent  = '0';
    if (totalCountEl()) totalCountEl().textContent = '0';
    if (lastScanTime()) lastScanTime().textContent = '—';

    // If results table exists (older template), reset its empty state
    const tbody = resultsBody();
    if (tbody) {
        tbody.innerHTML = `
            <tr id="emptyRow">
                <td colspan="8" class="empty-state">
                    <div class="empty-icon"><i class="fas fa-qrcode"></i></div>
                    <p>No scans yet. Press <strong>SCAN QR CODE</strong> to begin.</p>
                </td>
            </tr>
        `;
    }
}

/* ========================================
   LIGHTBOX
   ======================================== */

function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightboxImg').src         = src;
    document.getElementById('lightboxCaption').textContent = caption || '';
    lb.classList.add('show');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('show');
}

/* ========================================
   QR VIEW (show raw QR data)
   ======================================== */

function viewQR(permitId) {
    /* In production: open a modal with the rendered QR image */
    alert(`Permit ID: ${permitId}\n\n(In production, this opens the QR image modal.)`);

    /* Backend API Integration:
    window.open('/api/qr/generate/' + permitId, '_blank');
    */
}

/* ========================================
   OVERLAY HELPER
   ======================================== */

function showScanOverlay(type, message) {
    const ov   = scanOverlay();
    const icon = overlayIcon();
    const txt  = overlayText();

    icon.className = 'overlay-icon ' + type;
    icon.innerHTML = type === 'success' ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';
    txt.textContent = message;
    ov.className = 'scan-overlay ' + (type === 'success' ? 'success-bg' : 'error-bg');
    ov.style.display = 'flex';

    setTimeout(() => { ov.style.display = 'none'; }, 2200);
}

/* ========================================
   TOAST HELPER
   ======================================== */

function showToast(type, title, sub) {
    const toast    = document.getElementById('scanToast');
    const iconEl   = document.getElementById('toastIcon');
    const titleEl  = document.getElementById('toastTitle');
    const subEl    = document.getElementById('toastSub');

    iconEl.className = 'toast-icon ' + type;
    iconEl.innerHTML = type === 'success' ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';
    titleEl.textContent = title;
    subEl.textContent   = sub;

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ========================================
   DEMO / SIMULATION
   ======================================== */

/**
 * Simulates a successful QR scan with random sample data.
 * Remove this in production — real scans come from handleQRDetected().
 */
function simulateScan() {
    const samples = [
        { permitId:'UC-000042', bearer:'Maria Santos',     idNumber:'22031045', gpNumber:'CMP-112233', itemPurpose:'Dell XPS 15 Laptop',      photoUrl:'https://via.placeholder.com/300x300/1c2128/388bfd?text=Laptop',    status:'approved' },
        { permitId:'UC-000087', bearer:'John dela Cruz',   idNumber:'22076840', gpNumber:'OFP-998877', itemPurpose:'Epson Projector EB-X41',   photoUrl:'https://via.placeholder.com/300x300/1c2128/00c853?text=Projector', status:'approved' },
        { permitId:'UC-000103', bearer:'Ana Reyes',        idNumber:'21054321', gpNumber:'CMP-445566', itemPurpose:'MacBook Pro 14"',           photoUrl:'https://via.placeholder.com/300x300/1c2128/ff6b35?text=MacBook',   status:'approved' },
        { permitId:'UC-000019', bearer:'Carlos Mendoza',   idNumber:'20091234', gpNumber:'OFP-334455', itemPurpose:'HDMI Cables (x3)',          photoUrl: null,                                                               status:'approved' },
        { permitId:'UC-000155', bearer:'Liza Fernandez',   idNumber:'23000987', gpNumber:'CMP-778899', itemPurpose:'HP EliteBook 840',          photoUrl:'https://via.placeholder.com/300x300/1c2128/f0f6fc?text=EliteBook',  status:'approved' },
    ];

    const fake = samples[Math.floor(Math.random() * samples.length)];
    const qrString = JSON.stringify(fake);
    handleQRDetected(qrString);
}

/* ========================================
   UTILITY
   ======================================== */

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function escHtml(str) {
    if (!str) return '—';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ========================================
   KEYBOARD SHORTCUT  (Space = scan toggle)
   ======================================== */

document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        toggleScanning();
    }
    if (e.code === 'Escape') {
        closeLightbox();
        if (isScanning) stopScanning();
    }
});

/* ========================================
   BACKEND API ENDPOINTS REFERENCE
   ======================================== */

/*
─────────────────────────────────────────
REQUIRED API ENDPOINTS
─────────────────────────────────────────

1. POST /api/qr/validate
   Purpose: Validate a scanned QR code and log the entry/exit
   Headers: { Authorization: Bearer token, Content-Type: application/json }
   Body: {
       permitId : string,
       gate     : 'entry' | 'exit',
       scannedAt: ISO date string,
       guardId  : number
   }
   Response: {
       success : true,
       permit  : {
           bearer, idNumber, gpNumber, itemPurpose, photoUrl, status, validUntil
       },
       scanLog : {
           id, permitId, gate, scannedAt, guardId
       },
       message: string
   }

2. POST /api/dashboard/live-feed/push
   Purpose: Push new scan to the dashboard live feed (or use WebSocket)
   Headers: { Authorization: Bearer token, Content-Type: application/json }
   Body: scanLog object (same shape as above scanLog)
   Response: { success: true }

3. GET /api/qr/generate/:permitId
   Purpose: Get the QR code image for a permit
   Response: PNG image

─────────────────────────────────────────
QR CODE PAYLOAD FORMAT (JSON string):
{
  "permitId"   : "UC-000042",
  "bearer"     : "Maria Santos",
  "idNumber"   : "22031045",
  "gpNumber"   : "CMP-112233",
  "itemPurpose": "Dell XPS 15 Laptop",
  "photoUrl"   : "/uploads/permits/uc000042_photo1.jpg",
  "status"     : "approved",
  "validUntil" : "2026-12-31"
}

─────────────────────────────────────────
WEBSOCKET EVENTS (optional, real-time):
  Client → Server:  scan:new  { scanLog }
  Server → Client:  feed:update { scanLog }   (broadcast to dashboard)
─────────────────────────────────────────
*/