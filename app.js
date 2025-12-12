// Biến toàn cục
let parcels = JSON.parse(localStorage.getItem('parcelTrackingSystem')) || {};
let allLogs = JSON.parse(localStorage.getItem('parcelTrackingLogs')) || [];
let users = JSON.parse(localStorage.getItem('parcelUsers')) || {};
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let html5QrCode = null;
let isScanning = false;
let currentVerificationParcel = null;
let verificationData = null;
let currentCameraStream = null;
let currentProductIndex = null;
let editingParcelId = null;
// Cấu hình phân trang
const paginationConfig = {
    parcelsPerPage: 10,
    logsPerPage: 15,
    currentParcelPage: 1,
    currentLogPage: 1,
    totalParcelPages: 1,
    totalLogPages: 1
};

// Người dùng mẫu nếu chưa có
const defaultUsers = {
    "NVK-001": {
        code: "NVK-001",
        name: "Nhân viên kho 1",
        email: "nvk001@example.com",
        phone: "0901000001",
        role: "nvk",
        password: "123456",
        registered: "2025-01-01T08:00:00"
    },
    "NGH-001": {
        code: "NGH-001",
        name: "Người gói hàng 1",
        email: "ngh001@example.com",
        phone: "0902000001",
        role: "ngh",
        password: "123456",
        registered: "2025-01-01T08:00:00"
    }
};

// Khởi tạo dữ liệu
function initializeData() {
    if (Object.keys(parcels).length === 0) {
        parcels = {
            "P-1001": {
                id: "P-1001",
                desc: "Đơn hàng điện tử",
                status: "exported",
                created: "2025-01-05T08:30:00",
                lastVerified: "2025-01-05T10:00:00",
                exported: "2025-01-05T10:30:00",
                verificationStatus: "success",
                verificationNote: "Tất cả sản phẩm đều đúng và đủ số lượng",
                creator: "NGH-001",
                creatorName: "Người gói hàng 1",
                items: [
                    { 
                        name: "iPhone 14 Pro Max", 
                        quantity: 1, 
                        productionPlace: "Trung Quốc",
                        expiryDate: "2026-12-31",
                        imageBase64: null
                    },
                    { 
                        name: "AirPods Pro", 
                        quantity: 1, 
                        productionPlace: "Việt Nam",
                        expiryDate: "2026-10-15",
                        imageBase64: null
                    },
                    { 
                        name: "Cáp sạc USB-C", 
                        quantity: 2, 
                        productionPlace: "Trung Quốc",
                        expiryDate: "2027-05-20",
                        imageBase64: null
                    }
                ],
                logs: [
                    { who: "Người gói hàng 1", action: "created", timestamp: "2025-01-05T08:30:00", userCode: "NGH-001" },
                    { who: "Nhân viên kho 1", action: "verified", timestamp: "2025-01-05T10:00:00", userCode: "NVK-001", result: "success", note: "Tất cả sản phẩm đều đúng và đủ số lượng" },
                    { who: "Nhân viên kho 1", action: "exported", timestamp: "2025-01-05T10:30:00", userCode: "NVK-001", note: "Đã giao cho bộ phận vận chuyển" }
                ]
            },
            "P-1002": {
                id: "P-1002",
                desc: "Quần áo thể thao",
                status: "problem",
                created: "2025-01-08T09:15:00",
                lastVerified: "2025-01-08T10:30:00",
                exported: null,
                verificationStatus: "problem",
                verificationNote: "Thiếu 1 quần thể thao nữ, cần bổ sung",
                creator: "NGH-001",
                creatorName: "Người gói hàng 1",
                items: [
                    { 
                        name: "Áo thể thao nam", 
                        quantity: 3, 
                        productionPlace: "Việt Nam",
                        expiryDate: null,
                        imageBase64: null
                    },
                    { 
                        name: "Quần thể thao nữ", 
                        quantity: 2, 
                        productionPlace: "Việt Nam",
                        expiryDate: null,
                        imageBase64: null
                    },
                    { 
                        name: "Giày chạy bộ", 
                        quantity: 2, 
                        productionPlace: "Indonesia",
                        expiryDate: null,
                        imageBase64: null
                    }
                ],
                logs: [
                    { who: "Người gói hàng 1", action: "created", timestamp: "2025-01-08T09:15:00", userCode: "NGH-001" },
                    { who: "Nhân viên kho 1", action: "verified", timestamp: "2025-01-08T10:30:00", userCode: "NVK-001", result: "problem", note: "Thiếu 1 quần thể thao nữ, cần bổ sung" }
                ]
            },
            "P-1003": {
                id: "P-1003",
                desc: "Sách và văn phòng phẩm",
                status: "created",
                created: "2025-01-10T14:20:00",
                lastVerified: null,
                exported: null,
                verificationStatus: null,
                verificationNote: null,
                creator: "NGH-001",
                creatorName: "Người gói hàng 1",
                items: [
                    { 
                        name: "Sách Đắc Nhân Tâm", 
                        quantity: 5, 
                        productionPlace: "NXB Trẻ",
                        expiryDate: null,
                        imageBase64: null
                    },
                    { 
                        name: "Vở học sinh 200 trang", 
                        quantity: 10, 
                        productionPlace: "Thái Lan",
                        expiryDate: null,
                        imageBase64: null
                    },
                    { 
                        name: "Bút bi xanh", 
                        quantity: 20, 
                        productionPlace: "Trung Quốc",
                        expiryDate: "2025-12-31",
                        imageBase64: null
                    }
                ],
                logs: [
                    { who: "Người gói hàng 1", action: "created", timestamp: "2025-01-10T14:20:00", userCode: "NGH-001" }
                ]
            }
        };
    }
    
    if (Object.keys(users).length === 0) {
        users = defaultUsers;
    }
    
    // Tạo allLogs từ dữ liệu parcels nếu chưa có
    if (allLogs.length === 0) {
        allLogs = [];
        for (const parcelId in parcels) {
            allLogs = allLogs.concat(parcels[parcelId].logs.map(log => ({
                parcel_id: parcelId,
                parcel_desc: parcels[parcelId].desc,
                ...log
            })));
        }
    }
    
    saveData();
    updateCurrentUserDisplay();
    adjustUIByRole();
    updateTabCounts();
}

// Lưu dữ liệu vào localStorage
function saveData() {
    localStorage.setItem('parcelTrackingSystem', JSON.stringify(parcels));
    localStorage.setItem('parcelTrackingLogs', JSON.stringify(allLogs));
    localStorage.setItem('parcelUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Cập nhật số lượng trên tab
function updateTabCounts() {
    // Đếm số kiện hàng theo trạng thái
    const allParcels = Object.values(parcels);
    const counts = {
        all: allParcels.length,
        created: allParcels.filter(p => p.status === 'created').length,
        verified: allParcels.filter(p => p.status === 'verified').length,
        exported: allParcels.filter(p => p.status === 'exported').length,
        problem: allParcels.filter(p => p.status === 'problem').length
    };
    
    // Cập nhật tab danh sách kiện
    const parcelsTab = document.querySelector('.tab-btn[data-tab="parcels"]');
    const parcelsBadge = document.getElementById('parcels-count');
    
    if (counts.all > 0) {
        parcelsBadge.textContent = counts.all;
        parcelsBadge.style.display = 'flex';
    } else {
        parcelsBadge.style.display = 'none';
    }
    
    // Cập nhật tab lịch sử
    const historyTab = document.querySelector('.tab-btn[data-tab="history"]');
    const historyBadge = document.getElementById('history-count');
    
    if (allLogs.length > 0) {
        historyBadge.textContent = allLogs.length;
        historyBadge.style.display = 'flex';
    } else {
        historyBadge.style.display = 'none';
    }
    
    // Cập nhật số lượng trong bộ lọc
    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-created').textContent = counts.created;
    document.getElementById('count-verified').textContent = counts.verified;
    document.getElementById('count-exported').textContent = counts.exported;
    document.getElementById('count-problem').textContent = counts.problem;
    
    // Cập nhật tiêu đề
    document.getElementById('parcels-total-count').textContent = `(${counts.all})`;
    document.getElementById('history-total-count').textContent = `(${allLogs.length})`;
}

// Cập nhật hiển thị người dùng hiện tại
function updateCurrentUserDisplay() {
    const userNameElement = document.getElementById('current-user-name');
    const userInfoElement = document.getElementById('user-info');
    const authStatusElement = document.getElementById('user-auth-status');
    const loginSection = document.getElementById('login-section');
    const logoutBtn = document.getElementById('logout-btn');
    const loggedUserCodeElement = document.getElementById('logged-user-code');
    const loggedUserRoleElement = document.getElementById('logged-user-role');
    const loggedUserNameElement = document.getElementById('logged-user-name');
    const roleBadgeElement = document.getElementById('user-role-badge');
    
    if (currentUser) {
        userNameElement.textContent = currentUser.name;
        loggedUserCodeElement.textContent = currentUser.code;
        loggedUserNameElement.textContent = currentUser.name;
        
        // Xác định vai trò và hiển thị
        let roleText = "";
        let roleDisplayText = "";
        let roleClass = "";
        
        if (currentUser.code.startsWith("NVK-")) {
            roleText = "NVK";
            roleDisplayText = "Nhân viên kho";
            roleClass = "role-nvk-badge";
            userInfoElement.className = "user-info role-nvk";
        } else if (currentUser.code.startsWith("NGH-")) {
            roleText = "NGH";
            roleDisplayText = "Người gói hàng";
            roleClass = "role-ngh-badge";
            userInfoElement.className = "user-info role-ngh";
        }
        
        loggedUserRoleElement.textContent = roleDisplayText;
        roleBadgeElement.textContent = roleText;
        roleBadgeElement.className = `role-badge ${roleClass}`;
        roleBadgeElement.style.display = 'inline-block';
        
        authStatusElement.style.display = 'block';
        loginSection.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        
        // Cập nhật thông tin tài khoản nếu đang ở tab account
        if (document.getElementById('account').classList.contains('active')) {
            updateAccountInfo();
        }
    } else {
        userNameElement.textContent = 'Chưa đăng nhập';
        userInfoElement.className = "user-info";
        authStatusElement.style.display = 'none';
        roleBadgeElement.style.display = 'none';
        loginSection.style.display = 'block';
        logoutBtn.style.display = 'none';
        
        // Ẩn thông tin tài khoản nếu chưa đăng nhập
        document.getElementById('account-info').style.display = 'none';
        document.getElementById('account-login-required').style.display = 'block';
    }
}

// Cập nhật thông tin tài khoản
function updateAccountInfo() {
    if (!currentUser) return;
    
    const user = users[currentUser.code];
    
    if (user) {
        document.getElementById('account-code').textContent = user.code;
        document.getElementById('account-name').textContent = user.name;
        document.getElementById('account-email').textContent = user.email || "Chưa cập nhật";
        document.getElementById('account-phone').textContent = user.phone || "Chưa cập nhật";
        
        let roleText = "";
        if (user.code.startsWith("NVK-")) {
            roleText = "Nhân viên kho";
        } else if (user.code.startsWith("NGH-")) {
            roleText = "Người gói hàng";
        }
        
        document.getElementById('account-role').textContent = roleText;
        document.getElementById('account-registered').textContent = user.registered ? formatDateTime(user.registered) : "Không xác định";
        
        document.getElementById('account-info').style.display = 'block';
        document.getElementById('account-login-required').style.display = 'none';
    }
}

// Điều chỉnh giao diện theo vai trò
function adjustUIByRole() {
    const createTabBtn = document.getElementById('create-tab-btn');
    const createForm = document.getElementById('create-form');
    const permissionNoticeCreate = document.getElementById('permission-notice-create');
    
    if (!currentUser) {
        // Chưa đăng nhập
        createTabBtn.style.display = 'none';
        return;
    }
    
    if (currentUser.code.startsWith("NVK-")) {
        // Nhân viên kho: chỉ được xem, quét, kiểm tra
        createTabBtn.style.display = 'none';
        
        // Nếu đang ở tab create, chuyển về tab scan
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'create') {
            document.querySelector('.tab-btn[data-tab="scan"]').click();
        }
    } else if (currentUser.code.startsWith("NGH-")) {
        // Người gói hàng: được tạo kiện hàng
        createTabBtn.style.display = 'inline-block';
        
        // Hiển thị form tạo kiện hàng
        createForm.style.display = 'block';
        permissionNoticeCreate.style.display = 'none';
        
        // Cập nhật tên người tạo trong form
        document.getElementById('creator-name').value = currentUser.name;
    }
}

// Hiển thị confirmation dialog
function showConfirmation(title, message, onConfirm) {
    document.getElementById('confirmation-title').textContent = title;
    document.getElementById('confirmation-message').textContent = message;
    const dialog = document.getElementById('confirmation-dialog');
    dialog.style.display = 'flex';
    
    // Xử lý sự kiện
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');
    
    const handleYes = () => {
        dialog.style.display = 'none';
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
        if (onConfirm) onConfirm();
    };
    
    const handleNo = () => {
        dialog.style.display = 'none';
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
    };
    
    yesBtn.addEventListener('click', handleYes);
    noBtn.addEventListener('click', handleNo);
}

// Đăng nhập người dùng
function loginUser(code, password) {
    code = code.trim().toUpperCase();
    
    if (!code || !password) {
        alert('Vui lòng nhập mã đăng nhập và mật khẩu!');
        return false;
    }
    
    // Kiểm tra định dạng mã
    if (!code.startsWith("NVK-") && !code.startsWith("NGH-")) {
        alert('Mã đăng nhập phải bắt đầu bằng NVK- hoặc NGH-!');
        return false;
    }
    
    // Kiểm tra trong users
    if (!users[code]) {
        alert('Tài khoản không tồn tại! Vui lòng kiểm tra lại mã đăng nhập.');
        return false;
    }
    
    if (users[code].password !== password) {
        alert('Mật khẩu không chính xác!');
        return false;
    }
    
    currentUser = {
        code: code,
        name: users[code].name,
        email: users[code].email,
        phone: users[code].phone
    };
    
    saveData();
    updateCurrentUserDisplay();
    adjustUIByRole();
    updateTabCounts();
    
    alert(`Đăng nhập thành công!\nChào mừng ${currentUser.name} (${code}) đến với hệ thống!`);
    return true;
}

// Đăng ký tài khoản mới
function registerUser(code, name, email, phone, password, confirmPassword) {
    code = code.trim().toUpperCase();
    name = name.trim();
    email = email.trim();
    phone = phone.trim();
    
    if (!code || !name || !password || !confirmPassword) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return false;
    }
    
    // Kiểm tra định dạng mã
    if (!code.startsWith("NVK-") && !code.startsWith("NGH-")) {
        alert('Mã đăng ký phải bắt đầu bằng NVK- (nhân viên kho) hoặc NGH- (người gói hàng)!');
        return false;
    }
    
    // Kiểm tra mật khẩu
    if (password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự!');
        return false;
    }
    
    if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return false;
    }
    
    // Kiểm tra mã đã tồn tại chưa
    if (users[code]) {
        alert('Mã đăng ký đã tồn tại! Vui lòng chọn mã khác.');
        return false;
    }
    
    // Tạo tài khoản mới
    users[code] = {
        code: code,
        name: name,
        email: email || null,
        phone: phone || null,
        role: code.startsWith("NVK-") ? "nvk" : "ngh",
        password: password,
        registered: new Date().toISOString()
    };
    
    saveData();
    
    // Đăng nhập luôn sau khi đăng ký
    currentUser = {
        code: code,
        name: name,
        email: email || null,
        phone: phone || null
    };
    
    saveData();
    updateCurrentUserDisplay();
    adjustUIByRole();
    updateTabCounts();
    
    alert(`Đăng ký thành công!\nTài khoản ${code} đã được tạo.\nChào mừng ${name} đến với hệ thống!`);
    
    // Chuyển về form đăng nhập
    switchAuthForm('login');
    
    return true;
}

// Đăng xuất người dùng
function logoutUser() {
    showConfirmation(
        'Xác nhận đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?',
        () => {
            currentUser = null;
            saveData();
            updateCurrentUserDisplay();
            adjustUIByRole();
            updateTabCounts();
            alert('Đã đăng xuất khỏi hệ thống');
            
            // Reset form đăng nhập
            document.getElementById('login-code').value = '';
            document.getElementById('login-password').value = '';
            
            // Chuyển về tab scan
            document.querySelector('.tab-btn[data-tab="scan"]').click();
        }
    );
}

// Chuyển đổi giữa form đăng nhập và đăng ký
function switchAuthForm(formType) {
    // Ẩn tất cả form
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Bỏ active tất cả tab
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hiển thị form được chọn
    if (formType === 'login') {
        document.getElementById('login-form').style.display = 'block';
        document.querySelector('.auth-tab[data-auth-form="login"]').classList.add('active');
        
        // Reset form đăng ký
        document.getElementById('register-code').value = '';
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm-password').value = '';
        document.getElementById('register-phone').value = '';
    } else if (formType === 'register') {
        document.getElementById('register-form').style.display = 'block';
        document.querySelector('.auth-tab[data-auth-form="register"]').classList.add('active');
        
        // Reset form đăng nhập
        document.getElementById('login-code').value = '';
        document.getElementById('login-password').value = '';
    }
}

// Kiểm tra quyền truy cập kiện hàng
function checkParcelPermission(parcelId) {
    if (!currentUser) {
        alert('Vui lòng đăng nhập trước khi truy cập kiện hàng!');
        return false;
    }
    
    const parcel = parcels[parcelId];
    if (!parcel) {
        alert('Kiện hàng không tồn tại!');
        return false;
    }
    
    return true;
}

// Tính tổng số lượng sản phẩm
function calculateTotalQuantity(items) {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
}

// Kiểm tra hạn sử dụng
function checkExpiryStatus(expiryDate) {
    if (!expiryDate) return { status: 'no-expiry', text: 'Không có HSD', class: '' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return { status: 'expired', text: 'Đã hết hạn', class: 'expiry-expired' };
    } else if (diffDays <= 30) {
        return { status: 'expiring-soon', text: 'Sắp hết hạn', class: 'expiry-warning' };
    } else {
        return { status: 'valid', text: 'Còn hạn', class: 'expiry-valid' };
    }
}

// Format ngày tháng
function formatDate(dateString) {
    if (!dateString) return 'Không có';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// TẠO MÃ QR THẬT CÓ THỂ QUÉT ĐƯỢC - PHIÊN BẢN ĐƠN GIẢN
function generateQRCode(elementId, text) {
    const qrElement = document.getElementById(elementId);
    qrElement.innerHTML = '';
    
    // Tạo phần tử div cho QR code
    const qrDiv = document.createElement('div');
    qrDiv.id = 'qrcode-canvas';
    qrDiv.style.width = '200px';
    qrDiv.style.height = '200px';
    qrDiv.style.margin = '0 auto';
    qrDiv.style.backgroundColor = 'white';
    qrDiv.style.padding = '10px';
    qrDiv.style.borderRadius = '10px';
    qrDiv.style.border = '1px solid #ddd';
    
    qrElement.appendChild(qrDiv);
    
    // Sử dụng QRCode.js nếu có
    if (typeof QRCode !== 'undefined') {
        try {
            new QRCode(qrDiv, {
                text: text,
                width: 180,
                height: 180,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            console.log('✅ QR Code đã được tạo với QRCode.js:', text);
            return;
        } catch (error) {
            console.error('❌ Lỗi tạo QR Code với QRCode.js:', error);
        }
    }
    
    // Fallback: Sử dụng Google Charts API
    generateQRCodeWithGoogleCharts(qrDiv, text);
}

// Tạo QR code bằng Google Charts API
function generateQRCodeWithGoogleCharts(qrDiv, text) {
    const size = 180;
    const encodedText = encodeURIComponent(text);
    const url = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedText}&choe=UTF-8&chld=H|1`;
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = `QR Code for ${text}`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '5px';
    
    img.onerror = function() {
        console.error('❌ Không thể tải QR code từ Google Charts');
        fallbackQRCode(qrDiv, text);
    };
    
    qrDiv.appendChild(img);
    console.log('✅ QR Code đã được tạo với Google Charts:', text);
}

// Fallback hiển thị mã dạng text
function fallbackQRCode(qrDiv, text) {
    qrDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 2.5rem; color: #333; margin-bottom: 15px;">
                <i class="fas fa-qrcode"></i>
            </div>
            <div style="font-family: 'Courier New', monospace; font-size: 1rem; font-weight: bold; 
                        word-break: break-all; background: #f8f9fa; padding: 15px; border-radius: 5px;
                        border: 1px solid #ddd; margin-bottom: 10px;">
                ${text}
            </div>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">Mã kiện hàng (nhập thủ công)</p>
        </div>
    `;
}

// Tải QR Code dưới dạng hình ảnh - ĐÃ SỬA
function downloadQRCode() {
    const qrElement = document.getElementById('qrcode');
    
    // Kiểm tra canvas đầu tiên
    const canvas = qrElement.querySelector('canvas');
    if (canvas) {
        const link = document.createElement('a');
        const parcelId = document.getElementById('new-parcel-id').textContent || 'qr-code';
        link.download = `qr-code-${parcelId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        return;
    }
    
    // Kiểm tra ảnh
    const img = qrElement.querySelector('img');
    if (img && img.src) {
        // Tạo canvas từ ảnh để tránh lỗi CORS
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        
        // Vẽ ảnh vào canvas
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        const parcelId = document.getElementById('new-parcel-id').textContent || 'qr-code';
        link.download = `qr-code-${parcelId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        return;
    }
    
    alert('Không thể tải QR Code. Vui lòng thử lại!');
}

// Khởi động camera để quét QR
function startScanner() {
    if (isScanning) return;
    
    if (typeof Html5Qrcode === 'undefined') {
        alert('Thư viện quét QR không được tải. Vui lòng tải lại trang!');
        return;
    }
    
    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
    ).then(() => {
        isScanning = true;
        document.getElementById('start-scan-btn').style.display = 'none';
        document.getElementById('stop-scan-btn').style.display = 'inline-block';
    }).catch(err => {
        console.error("Không thể khởi động camera:", err);
        alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera của trình duyệt.");
    });
}

// Dừng camera
function stopScanner() {
    if (!html5QrCode || !isScanning) return;
    
    html5QrCode.stop().then(() => {
        isScanning = false;
        document.getElementById('start-scan-btn').style.display = 'inline-block';
        document.getElementById('stop-scan-btn').style.display = 'none';
    }).catch(err => {
        console.error("Không thể dừng camera:", err);
    });
}

// Xử lý khi quét thành công - TỰ ĐỘNG HIỂN THỊ THÔNG BÁO THÀNH CÔNG
function onScanSuccess(decodedText) {
    stopScanner();
    playBeepSound();
    
    // CHUẨN HÓA MÃ KIỆN HÀNG
    const parcelId = decodedText.trim().toUpperCase();
    
    console.log('📱 Mã QR quét được:', parcelId);
    console.log('📦 Danh sách kiện hàng:', Object.keys(parcels));
    
    // Tìm kiện hàng
    const parcel = parcels[parcelId];
    if (!parcel) {
        alert(`❌ Kiện hàng "${parcelId}" không tồn tại trong hệ thống!\n\nVui lòng kiểm tra:\n1. Kiện hàng đã được lưu chưa?\n2. Mã QR có chính xác không?`);
        return;
    }
    
    // Hiển thị modal thông báo thành công
    showScanSuccessModal(parcel);
}

// Hiển thị modal thông báo quét thành công
function showScanSuccessModal(parcel) {
    let html = `
        <h4>Thông tin kiện hàng</h4>
        <p><strong>Mã kiện hàng:</strong> ${parcel.id}</p>
        <p><strong>Mô tả:</strong> ${parcel.desc}</p>
        <p><strong>Người tạo:</strong> ${parcel.creatorName || parcel.creator}</p>
        <p><strong>Trạng thái:</strong> ${getStatusText(parcel.status)}</p>
        
        <h4 style="margin-top: 20px;">Danh sách sản phẩm</h4>
    `;
    
    // Tính tổng số lượng
    let totalQuantity = 0;
    
    parcel.items.forEach((item, index) => {
        totalQuantity += item.quantity;
        html += `
            <div class="scan-product-item">
                <span class="scan-product-name">${index + 1}. ${item.name}</span>
                <span class="scan-product-quantity">${item.quantity} cái</span>
            </div>
        `;
    });
    
    html += `
        <div class="scan-summary">
            <span>Tổng số loại sản phẩm:</span>
            <span>${parcel.items.length}</span>
        </div>
        <div class="scan-summary">
            <span>Tổng số lượng:</span>
            <span>${totalQuantity} cái</span>
        </div>
        <div class="verification-result result-success" style="margin-top: 20px;">
            <i class="fas fa-check-circle"></i> Kiểm tra thành công! Tất cả sản phẩm đều đúng và đủ số lượng.
        </div>
    `;
    
    document.getElementById('scan-success-details').innerHTML = html;
    document.getElementById('scan-success-modal').style.display = 'flex';
}

// Xử lý khi quét lỗi
function onScanError(error) {
    console.warn(`Lỗi quét QR: ${error}`);
}

// Phát âm thanh khi quét thành công
function playBeepSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log("Không thể phát âm thanh:", e);
    }
}

// Tìm kiện hàng theo ID (thủ công)
function findParcel(parcelId) {
    parcelId = parcelId.trim().toUpperCase();
    
    if (!parcelId) {
        alert('Vui lòng nhập mã kiện hàng');
        return;
    }
    
    // Kiểm tra đăng nhập
    if (!currentUser) {
        alert('Vui lòng đăng nhập trước khi quét kiện hàng!');
        return;
    }
    
    // Kiểm tra kiện hàng có tồn tại không
    if (!parcels[parcelId]) {
        alert('Kiện hàng không tồn tại trong hệ thống');
        return;
    }
    
    // Kiểm tra quyền truy cập
    if (!checkParcelPermission(parcelId)) {
        return;
    }
    
    const parcel = parcels[parcelId];
    const lastLog = parcel.logs[parcel.logs.length - 1];
    const totalQuantity = calculateTotalQuantity(parcel.items);
    
    // Hiển thị thông tin kiện hàng
    document.getElementById('result-id').textContent = parcel.id;
    document.getElementById('result-item-count').textContent = parcel.items.length;
    document.getElementById('result-total-quantity').textContent = totalQuantity;
    document.getElementById('result-creator').textContent = parcel.creatorName || parcel.creator;
    document.getElementById('result-status').textContent = getStatusText(parcel.status);
    document.getElementById('result-last-verification').textContent = parcel.lastVerified ? 
        formatDateTime(parcel.lastVerified) : 'Chưa kiểm tra';
    
    // Hiển thị danh sách sản phẩm với hình ảnh
    renderProductList(parcelId);
    
    // Tạo các nút hành động dựa trên trạng thái hiện tại
    const actionButtons = document.getElementById('action-buttons');
    actionButtons.innerHTML = '';
    
    // Chỉ NVK mới được kiểm tra và xuất kho
    if (currentUser.code.startsWith("NVK-")) {
        if (parcel.status === "created") {
            const verifyButton = document.createElement('button');
            verifyButton.className = 'btn btn-info';
            verifyButton.innerHTML = `<i class="fas fa-clipboard-check"></i> Kiểm tra sản phẩm`;
            verifyButton.addEventListener('click', () => {
                openVerificationModal(parcelId);
            });
            actionButtons.appendChild(verifyButton);
        } else if (parcel.status === "verified") {
            const exportButton = document.createElement('button');
            exportButton.className = 'btn btn-export';
            exportButton.innerHTML = `<i class="fas fa-truck-loading"></i> Xuất kho`;
            exportButton.addEventListener('click', () => {
                showConfirmation(
                    'Xác nhận xuất kho',
                    `Bạn có chắc chắn muốn xuất kho kiện hàng ${parcelId}?`,
                    () => exportParcel(parcelId)
                );
            });
            actionButtons.appendChild(exportButton);
        }
    }
    
    // Nút xem chi tiết
    const detailButton = document.createElement('button');
    detailButton.className = 'btn';
    detailButton.innerHTML = `<i class="fas fa-eye"></i> Xem chi tiết`;
    detailButton.addEventListener('click', () => {
        showParcelDetails(parcelId);
    });
    actionButtons.appendChild(detailButton);
    
    // Hiển thị kết quả
    document.getElementById('parcel-result').style.display = 'block';
    document.getElementById('parcel-result').scrollIntoView({ behavior: 'smooth' });
    
    // Ghi log quét
    const scanLog = {
        parcel_id: parcelId,
        who: currentUser.name,
        action: 'scanned',
        timestamp: new Date().toISOString(),
        userCode: currentUser.code
    };
    
    allLogs.push(scanLog);
    saveData();
    updateTabCounts();
    
    // Tự động hiển thị thông báo thành công
    setTimeout(() => {
        showScanSuccessModal(parcel);
    }, 300);
}

// Xuất kho kiện hàng
function exportParcel(parcelId) {
    const parcel = parcels[parcelId];
    if (!parcel) return;
    
    const now = new Date().toISOString();
    
    // Cập nhật trạng thái
    parcel.status = 'exported';
    parcel.exported = now;
    
    // Thêm log
    const exportLog = {
        who: currentUser.name,
        action: 'exported',
        timestamp: now,
        userCode: currentUser.code,
        note: 'Đã giao cho bộ phận vận chuyển'
    };
    
    parcel.logs.push(exportLog);
    
    // Thêm vào allLogs
    allLogs.push({
        parcel_id: parcelId,
        parcel_desc: parcel.desc,
        ...exportLog
    });
    
    saveData();
    updateTabCounts();
    
    alert(`Đã xuất kho kiện hàng ${parcelId} thành công!`);
    
    // Cập nhật giao diện
    findParcel(parcelId);
}

// Hiển thị danh sách sản phẩm với hình ảnh
function renderProductList(parcelId) {
    const parcel = parcels[parcelId];
    const container = document.getElementById('product-list-container');
    
    if (!parcel || !parcel.items || parcel.items.length === 0) {
        container.innerHTML = '<p>Kiện hàng không có thông tin sản phẩm</p>';
        return;
    }
    
    let html = '<h4>Danh sách sản phẩm:</h4>';
    
    parcel.items.forEach((item, index) => {
        // Kiểm tra hạn sử dụng
        const expiryInfo = checkExpiryStatus(item.expiryDate);
        
        html += `
            <div class="product-detail-card">
                <div class="product-image-side">
                    <div class="product-image-container">
                        ${item.imageBase64 ? 
                            `<img src="${item.imageBase64}" alt="${item.name}" class="product-image">` : 
                            `<div class="image-placeholder">Chưa có hình ảnh</div>`
                        }
                    </div>
                </div>
                <div class="product-details-side">
                    <div class="product-detail-row">
                        <span class="product-detail-label">Tên sản phẩm:</span>
                        <span class="product-detail-value"><strong>${item.name}</strong></span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">Số lượng hệ thống:</span>
                        <span class="product-detail-value"><strong>${item.quantity}</strong></span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">Nơi sản xuất:</span>
                        <span class="product-detail-value">${item.productionPlace || 'Không xác định'}</span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">Hạn sử dụng:</span>
                        <span class="product-detail-value ${expiryInfo.status === 'expired' ? 'expired' : ''} ${expiryInfo.status === 'expiring-soon' ? 'expiring-soon' : ''}">
                            ${item.expiryDate ? formatDate(item.expiryDate) : 'Không có'}
                            ${expiryInfo.status !== 'no-expiry' ? `<span class="expiry-status ${expiryInfo.class}">${expiryInfo.text}</span>` : ''}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Mở modal kiểm tra sản phẩm
function openVerificationModal(parcelId) {
    currentVerificationParcel = parcelId;
    const parcel = parcels[parcelId];
    
    let html = `
        <div class="verification-section">
            <p><strong>Kiện hàng:</strong> ${parcel.id} - ${parcel.desc}</p>
            <p><strong>Tổng số sản phẩm:</strong> ${parcel.items.length}</p>
            <p><strong>Tổng số lượng hệ thống:</strong> ${calculateTotalQuantity(parcel.items)}</p>
        </div>
        
        <div class="verification-options">
            <div class="verification-option">
                <h4><i class="fas fa-camera"></i> Kiểm tra bằng camera</h4>
                <p>Chụp ảnh từng sản phẩm để so sánh với hình ảnh đã tải lên</p>
                <button id="start-camera-check-btn" class="btn">
                    <i class="fas fa-camera"></i> Mở camera kiểm tra
                </button>
            </div>
            
            <div class="verification-option">
                <h4><i class="fas fa-clipboard-list"></i> Kiểm tra thủ công</h4>
                <p>Kiểm tra từng sản phẩm và đánh dấu kết quả</p>
                <div id="manual-verification-items">
    `;
    
    parcel.items.forEach((item, index) => {
        html += `
            <div class="product-detail-card">
                <div class="product-image-side">
                    <div class="product-image-container">
                        ${item.imageBase64 ? 
                            `<img src="${item.imageBase64}" alt="${item.name}" class="product-image">` : 
                            `<div class="image-placeholder">Chưa có hình ảnh</div>`
                        }
                    </div>
                </div>
                <div class="product-details-side">
                    <div class="product-detail-row">
                        <span class="product-detail-label">Tên sản phẩm:</span>
                        <span class="product-detail-value"><strong>${item.name}</strong></span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">Số lượng hệ thống:</span>
                        <span class="product-detail-value"><strong>${item.quantity}</strong></span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">Số lượng thực tế:</span>
                        <span class="product-detail-value">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="adjustManualQuantity(${index}, -1)">-</button>
                                <input type="number" id="manual-qty-${index}" class="form-control quantity-display" 
                                       value="${item.quantity}" min="0" 
                                       style="width: 80px; text-align: center;" 
                                       onchange="updateManualVerificationData(${index})">
                                <button class="quantity-btn" onclick="adjustManualQuantity(${index}, 1)">+</button>
                            </div>
                        </span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">Ghi chú:</span>
                        <span class="product-detail-value">
                            <input type="text" id="manual-note-${index}" class="form-control" placeholder="Ghi chú (nếu có)" 
                                   onchange="updateManualVerificationData(${index})">
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
        
        <h4>Kết quả kiểm tra tổng thể:</h4>
        <div class="verification-result-options">
            <div class="result-option success" id="result-success" onclick="selectVerificationResult('success')">
                <i class="fas fa-check-circle fa-2x"></i>
                <h4>Thành công</h4>
                <p>Tất cả sản phẩm đều đúng</p>
            </div>
            <div class="result-option problem" id="result-problem" onclick="selectVerificationResult('problem')">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
                <h4>Có vấn đề</h4>
                <p>Có sản phẩm không đúng</p>
            </div>
        </div>
        
        <div class="form-group">
            <label for="verification-note">Ghi chú tổng thể:</label>
            <textarea id="verification-note" class="note-area" placeholder="Ghi chú về kết quả kiểm tra..."></textarea>
        </div>
    `;
    
    document.getElementById('verification-content').innerHTML = html;
    document.getElementById('verification-modal').style.display = 'flex';
    
    // Khởi tạo verification data
    verificationData = {
        result: null,
        note: '',
        items: parcel.items.map(item => ({
            name: item.name,
            expected: item.quantity,
            actual: item.quantity,
            note: '',
            imageUrl: item.imageBase64
        }))
    };
    
    // Thêm sự kiện cho nút camera
    document.getElementById('start-camera-check-btn').addEventListener('click', () => {
        openCameraModal();
    });
}

// Mở modal camera
function openCameraModal() {
    document.getElementById('verification-modal').style.display = 'none';
    document.getElementById('camera-modal').style.display = 'flex';
    
    // Khởi động camera
    startCamera();
}

// Khởi động camera để chụp ảnh
function startCamera() {
    const video = document.getElementById('camera-preview');
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        }).then(function(stream) {
            currentCameraStream = stream;
            video.srcObject = stream;
        }).catch(function(error) {
            console.error("Không thể truy cập camera:", error);
            alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera của trình duyệt.");
        });
    }
}

// Dừng camera
function stopCamera() {
    if (currentCameraStream) {
        currentCameraStream.getTracks().forEach(track => track.stop());
        currentCameraStream = null;
    }
    
    const video = document.getElementById('camera-preview');
    video.srcObject = null;
}

// Chụp ảnh từ camera
function capturePhoto() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const capturedImage = document.getElementById('captured-image');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7); // Lưu với chất lượng 70%
    capturedImage.src = imageDataUrl;
    
    // Hiển thị ảnh đã chụp
    document.getElementById('captured-image-container').style.display = 'block';
    document.getElementById('capture-btn').style.display = 'none';
    document.getElementById('retake-btn').style.display = 'inline-block';
    document.getElementById('use-photo-btn').style.display = 'inline-block';
}

// Chụp lại ảnh
function retakePhoto() {
    document.getElementById('captured-image-container').style.display = 'none';
    document.getElementById('capture-btn').style.display = 'inline-block';
    document.getElementById('retake-btn').style.display = 'none';
    document.getElementById('use-photo-btn').style.display = 'none';
}

// Sử dụng ảnh đã chụp
function usePhoto() {
    const capturedImage = document.getElementById('captured-image');
    const imageDataUrl = capturedImage.src;
    
    // Lưu ảnh vào verification data
    if (currentProductIndex !== null && verificationData && verificationData.items[currentProductIndex]) {
        verificationData.items[currentProductIndex].capturedImage = imageDataUrl;
        alert(`Đã lưu ảnh cho sản phẩm: ${verificationData.items[currentProductIndex].name}`);
    }
    
    // Đóng modal camera
    closeCameraModal();
    document.getElementById('verification-modal').style.display = 'flex';
}

// Đóng modal camera
function closeCameraModal() {
    stopCamera();
    document.getElementById('camera-modal').style.display = 'none';
    document.getElementById('captured-image-container').style.display = 'none';
    document.getElementById('capture-btn').style.display = 'inline-block';
    document.getElementById('retake-btn').style.display = 'none';
    document.getElementById('use-photo-btn').style.display = 'none';
}

// Điều chỉnh số lượng trong kiểm tra thủ công
function adjustManualQuantity(index, change) {
    const input = document.getElementById(`manual-qty-${index}`);
    let newValue = parseInt(input.value) + change;
    if (newValue < 0) newValue = 0;
    input.value = newValue;
    updateManualVerificationData(index);
}

// Cập nhật dữ liệu kiểm tra thủ công
function updateManualVerificationData(index) {
    if (!verificationData) return;
    
    const quantityInput = document.getElementById(`manual-qty-${index}`);
    const noteInput = document.getElementById(`manual-note-${index}`);
    
    verificationData.items[index].actual = parseInt(quantityInput.value) || 0;
    verificationData.items[index].note = noteInput.value;
}

// Chọn kết quả kiểm tra
function selectVerificationResult(result) {
    verificationData.result = result;
    
    // Cập nhật giao diện
    document.querySelectorAll('.result-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.getElementById(`result-${result}`).classList.add('selected');
}

// Hoàn tất kiểm tra sản phẩm
function completeVerification() {
    if (!currentVerificationParcel || !verificationData) return;
    
    if (!verificationData.result) {
        alert('Vui lòng chọn kết quả kiểm tra!');
        return;
    }
    
    const parcel = parcels[currentVerificationParcel];
    const now = new Date().toISOString();
    const note = document.getElementById('verification-note').value;
    
    // Cập nhật dữ liệu sản phẩm
    verificationData.items.forEach((item, index) => {
        // Có thể lưu thêm thông tin nếu cần
    });
    
    // Cập nhật trạng thái kiện hàng
    const newStatus = verificationData.result === 'success' ? 'verified' : 'problem';
    parcel.status = newStatus;
    parcel.lastVerified = now;
    parcel.verificationStatus = verificationData.result;
    parcel.verificationNote = note || '';
    
    // Thêm log kiểm tra
    const verificationLog = {
        parcel_id: currentVerificationParcel,
        parcel_desc: parcel.desc,
        who: currentUser.name,
        action: 'verified',
        timestamp: now,
        userCode: currentUser.code,
        result: verificationData.result,
        note: note || ''
    };
    
    parcel.logs.push({
        who: currentUser.name,
        action: 'verified',
        timestamp: now,
        userCode: currentUser.code,
        result: verificationData.result,
        note: note || ''
    });
    
    allLogs.push(verificationLog);
    saveData();
    updateTabCounts();
    
    // Đóng modal
    document.getElementById('verification-modal').style.display = 'none';
    
    // Hiển thị thông báo
    let message = verificationData.result === 'success' 
        ? `✅ Kiểm tra thành công! Kiện hàng đã sẵn sàng để giao.` 
        : `⚠️ Kiểm tra phát hiện vấn đề! Vui lòng xem ghi chú.`;
    
    alert(`Đã hoàn tất kiểm tra kiện hàng ${currentVerificationParcel}\n${message}`);
    
    // Cập nhật giao diện
    findParcel(currentVerificationParcel);
    
    // Reset
    currentVerificationParcel = null;
    verificationData = null;
}

// Hiển thị danh sách kiện hàng với phân trang
function renderParcelsList(filterStatus = 'all', page = 1) {
    const container = document.getElementById('parcels-list-container');
    const searchTerm = document.getElementById('search-parcel').value.toLowerCase();
    
    // Lọc kiện hàng theo từ khóa tìm kiếm và trạng thái
    let filteredParcels = Object.values(parcels).filter(parcel => {
        const matchesSearch = parcel.id.toLowerCase().includes(searchTerm) || 
                             parcel.desc.toLowerCase().includes(searchTerm) ||
                             parcel.items.some(item => item.name.toLowerCase().includes(searchTerm) ||
                                                       (item.productionPlace && item.productionPlace.toLowerCase().includes(searchTerm)));
        
        const matchesStatus = filterStatus === 'all' || parcel.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });
    
    // Lọc theo quyền người dùng
    if (currentUser) {
        if (currentUser.code.startsWith("NVK-")) {
            // NVK xem được tất cả kiện hàng
        } else if (currentUser.code.startsWith("NGH-")) {
            // NGH chỉ xem được kiện hàng do mình tạo
            filteredParcels = filteredParcels.filter(parcel => parcel.creator === currentUser.code);
        }
    } else {
        // Chưa đăng nhập
        container.innerHTML = '<div class="no-data">Vui lòng đăng nhập để xem danh sách kiện hàng</div>';
        document.getElementById('pagination-container').style.display = 'none';
        return;
    }
    
    if (filteredParcels.length === 0) {
        container.innerHTML = '<div class="no-data">Không tìm thấy kiện hàng nào</div>';
        document.getElementById('pagination-container').style.display = 'none';
        return;
    }
    
    // Sắp xếp theo thời gian tạo mới nhất
    filteredParcels.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    // Tính toán phân trang
    const totalItems = filteredParcels.length;
    paginationConfig.totalParcelPages = Math.ceil(totalItems / paginationConfig.parcelsPerPage);
    paginationConfig.currentParcelPage = Math.min(page, paginationConfig.totalParcelPages);
    
    // Lấy kiện hàng cho trang hiện tại
    const startIndex = (paginationConfig.currentParcelPage - 1) * paginationConfig.parcelsPerPage;
    const endIndex = Math.min(startIndex + paginationConfig.parcelsPerPage, totalItems);
    const parcelsToShow = filteredParcels.slice(startIndex, endIndex);
    
    let html = '<div class="parcels-list">';
    
    parcelsToShow.forEach(parcel => {
        const lastLog = parcel.logs[parcel.logs.length - 1];
        const totalQuantity = calculateTotalQuantity(parcel.items);
        
        // Lấy hình ảnh đầu tiên của sản phẩm để hiển thị
        const firstProductImage = parcel.items.length > 0 && parcel.items[0].imageBase64 ? 
            parcel.items[0].imageBase64 : null;
        
        html += `
            <div class="parcel-card">
                <div class="parcel-id">${parcel.id}</div>
                <div class="parcel-status status-${parcel.status}">${getStatusText(parcel.status)}</div>
                ${firstProductImage ? 
                    `<div class="product-image-container" style="width: 80px; height: 80px; margin-bottom: 10px;">
                        <img src="${firstProductImage}" alt="${parcel.desc}" class="product-image">
                    </div>` : ''
                }
                <p><strong>Mô tả:</strong> ${parcel.desc}</p>
                <p><strong>Sản phẩm:</strong> ${parcel.items.length} loại (${totalQuantity} cái)</p>
                <p><strong>Người tạo:</strong> ${parcel.creatorName || parcel.creator}</p>
                <p><strong>Người xử lý cuối:</strong> ${lastLog.who}</p>
                <p><strong>Thời gian cuối:</strong> ${formatDateTime(lastLog.timestamp)}</p>
                <div class="parcel-card-actions">
                    <button class="btn" onclick="showParcelDetails('${parcel.id}')" style="flex: 1;">
                        <i class="fas fa-eye"></i> Xem chi tiết
                    </button>
                    ${currentUser && currentUser.code.startsWith("NGH-") && parcel.status === "created" ? `
                    <button class="btn btn-warning" onclick="editParcel('${parcel.id}')" style="flex: 1;">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Hiển thị phân trang
    renderPagination('pagination-container', paginationConfig.currentParcelPage, paginationConfig.totalParcelPages, (newPage) => {
        renderParcelsList(filterStatus, newPage);
    });
}

// Hiển thị phân trang
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    
    if (totalPages <= 1) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'flex';
    container.innerHTML = '';
    
    // Nút về trang đầu
    const firstButton = document.createElement('button');
    firstButton.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
    firstButton.innerHTML = '«';
    firstButton.disabled = currentPage === 1;
    firstButton.addEventListener('click', () => {
        if (currentPage > 1) onPageChange(1);
    });
    container.appendChild(firstButton);
    
    // Nút trang trước
    const prevButton = document.createElement('button');
    prevButton.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = '‹';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    });
    container.appendChild(prevButton);
    
    // Các nút trang
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) onPageChange(i);
        });
        container.appendChild(pageButton);
    }
    
    // Nút trang sau
    const nextButton = document.createElement('button');
    nextButton.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = '›';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    });
    container.appendChild(nextButton);
    
    // Nút đến trang cuối
    const lastButton = document.createElement('button');
    lastButton.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    lastButton.innerHTML = '»';
    lastButton.disabled = currentPage === totalPages;
    lastButton.addEventListener('click', () => {
        if (currentPage < totalPages) onPageChange(totalPages);
    });
    container.appendChild(lastButton);
}

// Sửa kiện hàng
function editParcel(parcelId) {
    const parcel = parcels[parcelId];
    if (!parcel || parcel.status !== "created") {
        alert('Chỉ có thể sửa kiện hàng ở trạng thái "Đã tạo"');
        return;
    }
    
    editingParcelId = parcelId;
    
    // Chuyển sang tab tạo kiện hàng
    document.querySelector('.tab-btn[data-tab="create"]').click();
    
    // Ẩn form tạo, hiển form sửa
    document.getElementById('create-form').style.display = 'none';
    document.getElementById('edit-form').style.display = 'block';
    document.getElementById('create-help').style.display = 'none';
    
    // Điền thông tin kiện hàng vào form
    document.getElementById('edit-parcel-id').value = parcel.id;
    document.getElementById('edit-parcel-desc').value = parcel.desc;
    
    // Xóa các item hiện có trong form
    const editItemsContainer = document.getElementById('edit-items-container');
    editItemsContainer.innerHTML = '';
    
    // Thêm các item từ kiện hàng
    parcel.items.forEach((item, index) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <input type="text" class="form-control item-input" placeholder="Tên sản phẩm" value="${item.name}" required>
            <input type="number" class="form-control item-quantity-input" placeholder="Số lượng" value="${item.quantity}" min="1" required>
            <input type="text" class="form-control item-input" placeholder="Nơi sản xuất" value="${item.productionPlace || ''}">
            <input type="date" class="form-control item-input" placeholder="Hạn sử dụng" value="${item.expiryDate || ''}">
            <div class="file-input-container">
                <input type="file" class="item-image-input" accept="image/*" capture="environment">
                <div class="file-input-label">
                    <i class="fas fa-camera"></i> ${item.imageBase64 ? 'Đổi ảnh' : 'Chụp/Tải ảnh'}
                </div>
            </div>
            <button class="btn btn-danger remove-item-btn" type="button">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Lưu imageBase64 nếu có
        if (item.imageBase64) {
            const fileInput = itemRow.querySelector('.item-image-input');
            fileInput.dataset.existingImage = item.imageBase64;
        }
        
        editItemsContainer.appendChild(itemRow);
    });
    
    // Thêm một hàng trống để thêm sản phẩm mới
    const addNewRow = document.createElement('div');
    addNewRow.className = 'item-row';
    addNewRow.innerHTML = `
        <input type="text" class="form-control item-input" placeholder="Tên sản phẩm">
        <input type="number" class="form-control item-quantity-input" placeholder="Số lượng" value="1" min="1">
        <input type="text" class="form-control item-input" placeholder="Nơi sản xuất">
        <input type="date" class="form-control item-input" placeholder="Hạn sử dụng">
        <div class="file-input-container">
            <input type="file" class="item-image-input" accept="image/*" capture="environment">
            <div class="file-input-label">
                <i class="fas fa-camera"></i> Chụp/Tải ảnh
            </div>
        </div>
        <button class="btn btn-success add-item-btn" type="button">
            <i class="fas fa-plus"></i>
        </button>
    `;
    editItemsContainer.appendChild(addNewRow);
}

// Lưu thay đổi khi sửa kiện hàng
async function saveParcelEdit() {
    if (!editingParcelId) return;
    
    const parcel = parcels[editingParcelId];
    if (!parcel) return;
    
    const desc = document.getElementById('edit-parcel-desc').value.trim();
    
    if (!desc) {
        alert('Vui lòng nhập mô tả kiện hàng');
        return;
    }
    
    // Lấy danh sách sản phẩm
    const itemRows = document.querySelectorAll('#edit-items-container .item-row');
    const items = [];
    let hasError = false;
    
    for (let row of itemRows) {
        const inputs = row.querySelectorAll('input');
        const itemName = inputs[0].value.trim();
        const quantity = parseInt(inputs[1].value) || 1;
        const productionPlace = inputs[2].value.trim();
        const expiryDate = inputs[3].value;
        const imageFile = inputs[4].files[0];
        const existingImage = inputs[4].dataset.existingImage;
        
        if (itemName) {
            let imageBase64 = existingImage || null;
            
            // Xử lý ảnh nếu có file mới
            if (imageFile) {
                imageBase64 = await convertFileToBase64(imageFile);
            }
            
            items.push({
                name: itemName,
                quantity: quantity,
                productionPlace: productionPlace || "Không xác định",
                expiryDate: expiryDate || null,
                imageBase64: imageBase64
            });
        } else {
            // Bỏ qua hàng trống (không có tên sản phẩm)
            if (inputs[0].value.trim() === '' && inputs[1].value === '1' && 
                inputs[2].value.trim() === '' && !imageFile && !existingImage) {
                continue;
            }
            hasError = true;
            alert('Vui lòng nhập tên cho tất cả sản phẩm');
            break;
        }
    }
    
    if (hasError) return;
    
    if (items.length === 0) {
        alert('Vui lòng thêm ít nhất một sản phẩm');
        return;
    }
    
    // Cập nhật kiện hàng
    parcel.desc = desc;
    parcel.items = items;
    
    // Thêm log sửa đổi
    const now = new Date().toISOString();
    const editLog = {
        who: currentUser.name,
        action: 'edited',
        timestamp: now,
        userCode: currentUser.code,
        note: 'Đã chỉnh sửa thông tin kiện hàng'
    };
    
    parcel.logs.push(editLog);
    
    // Thêm vào allLogs
    allLogs.push({
        parcel_id: editingParcelId,
        parcel_desc: desc,
        ...editLog
    });
    
    saveData();
    updateTabCounts();
    
    alert(`Đã lưu thay đổi cho kiện hàng ${editingParcelId} thành công!`);
    
    // Quay lại danh sách kiện hàng
    document.querySelector('.tab-btn[data-tab="parcels"]').click();
    
    // Reset form
    editingParcelId = null;
    document.getElementById('edit-form').style.display = 'none';
    document.getElementById('create-form').style.display = 'block';
    document.getElementById('create-help').style.display = 'block';
}

// Hủy sửa kiện hàng
function cancelEdit() {
    showConfirmation(
        'Xác nhận hủy',
        'Bạn có chắc chắn muốn hủy bỏ chỉnh sửa? Tất cả thay đổi chưa lưu sẽ bị mất.',
        () => {
            editingParcelId = null;
            document.getElementById('edit-form').style.display = 'none';
            document.getElementById('create-form').style.display = 'block';
            document.getElementById('create-help').style.display = 'block';
            
            // Quay lại danh sách kiện hàng
            document.querySelector('.tab-btn[data-tab="parcels"]').click();
        }
    );
}

// Chuyển file sang Base64
async function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Hiển thị chi tiết kiện hàng trong modal
function showParcelDetails(parcelId) {
    const parcel = parcels[parcelId];
    const totalQuantity = calculateTotalQuantity(parcel.items);
    
    let productsHtml = '';
    parcel.items.forEach(item => {
        // Kiểm tra hạn sử dụng
        const expiryInfo = checkExpiryStatus(item.expiryDate);
        
        productsHtml += `
            <div class="product-detail-card">
                <div class="product-image-side">
                    <div class="product-image-container">
                        ${item.imageBase64 ? 
                            `<img src="${item.imageBase64}" alt="${item.name}" class="product-image">` : 
                            `<div class="image-placeholder">Chưa có hình ảnh</div>`
                        }
                    </div>
                </div>
                <div class="product-details-side">
                    <div class="product-detail-row">
                        <span class="product-detail-label">Tên sản phẩm:</span>
                        <span class="product-detail-value"><strong>${item.name}</strong></span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">Số lượng hệ thống:</span>
                        <span class="product-detail-value"><strong>${item.quantity}</strong></span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">Nơi sản xuất:</span>
                        <span class="product-detail-value">${item.productionPlace || 'Không xác định'}</span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">Hạn sử dụng:</span>
                        <span class="product-detail-value ${expiryInfo.status === 'expired' ? 'expired' : ''} ${expiryInfo.status === 'expiring-soon' ? 'expiring-soon' : ''}">
                            ${item.expiryDate ? formatDate(item.expiryDate) : 'Không có'}
                            ${expiryInfo.status !== 'no-expiry' ? `<span class="expiry-status ${expiryInfo.class}">${expiryInfo.text}</span>` : ''}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    let logsHtml = '';
    parcel.logs.slice().reverse().forEach(log => {
        logsHtml += `
            <div class="log-item ${log.action}">
                <div class="log-header">
                    <span class="log-action">${getActionText(log.action)}</span>
                    <span class="log-timestamp">${formatDateTime(log.timestamp)}</span>
                </div>
                <div class="log-who">${log.who} ${log.userCode ? '(' + log.userCode + ')' : ''}</div>
                ${log.result ? `<div>Kết quả: ${getVerificationResultText(log.result)}</div>` : ''}
                ${log.note ? `<div>Ghi chú: ${log.note}</div>` : ''}
            </div>
        `;
    });
    
    const modalContent = `
        <div class="parcel-info">
            <h3>Thông tin kiện hàng</h3>
            <div class="parcel-details">
                <div class="detail-item">
                    <span class="detail-label">Mã kiện hàng:</span>
                    <span>${parcel.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mô tả:</span>
                    <span>${parcel.desc}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Số sản phẩm:</span>
                    <span>${parcel.items.length} loại (${totalQuantity} cái)</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Người tạo:</span>
                    <span>${parcel.creatorName || parcel.creator}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Trạng thái:</span>
                    <span class="parcel-status status-${parcel.status}">${getStatusText(parcel.status)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Thời gian tạo:</span>
                    <span>${formatDateTime(parcel.created)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Lần kiểm tra cuối:</span>
                    <span>${parcel.lastVerified ? formatDateTime(parcel.lastVerified) : 'Chưa kiểm tra'}</span>
                </div>
                ${parcel.exported ? `
                <div class="detail-item">
                    <span class="detail-label">Thời gian xuất kho:</span>
                    <span>${formatDateTime(parcel.exported)}</span>
                </div>
                ` : ''}
                ${parcel.verificationNote ? `
                <div class="detail-item">
                    <span class="detail-label">Ghi chú kiểm tra:</span>
                    <span>${parcel.verificationNote}</span>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="items-container">
            <h4>Danh sách sản phẩm</h4>
            ${productsHtml}
        </div>
        
        <div class="logs-container">
            <h4>Lịch sử hoạt động</h4>
            ${logsHtml}
        </div>
    `;
    
    document.getElementById('modal-parcel-details').innerHTML = modalContent;
    document.getElementById('parcel-detail-modal').style.display = 'flex';
}

// Hiển thị tất cả logs với phân trang
function renderAllLogs(page = 1) {
    const container = document.getElementById('all-logs-container');
    
    if (allLogs.length === 0) {
        container.innerHTML = '<div class="no-data">Chưa có hoạt động nào được ghi lại</div>';
        document.getElementById('history-pagination-container').style.display = 'none';
        return;
    }
    
    // Sắp xếp theo thời gian mới nhất trước
    const sortedLogs = [...allLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Tính toán phân trang
    const totalItems = sortedLogs.length;
    paginationConfig.totalLogPages = Math.ceil(totalItems / paginationConfig.logsPerPage);
    paginationConfig.currentLogPage = Math.min(page, paginationConfig.totalLogPages);
    
    // Lấy logs cho trang hiện tại
    const startIndex = (paginationConfig.currentLogPage - 1) * paginationConfig.logsPerPage;
    const endIndex = Math.min(startIndex + paginationConfig.logsPerPage, totalItems);
    const logsToShow = sortedLogs.slice(startIndex, endIndex);
    
    let html = '';
    
    logsToShow.forEach(log => {
        html += `
            <div class="log-item ${log.action}">
                <div class="log-header">
                    <span class="log-action">${getActionText(log.action)} - Kiện hàng: ${log.parcel_id}</span>
                    <span class="log-timestamp">${formatDateTime(log.timestamp)}</span>
                </div>
                <div class="log-who">${log.who} ${log.userCode ? '(' + log.userCode + ')' : ''}</div>
                <div style="margin-top: 5px; font-size: 0.9em;">Mô tả: ${log.parcel_desc || parcels[log.parcel_id]?.desc || 'N/A'}</div>
                ${log.result ? `<div style="margin-top: 5px; font-size: 0.9em;">Kết quả: ${getVerificationResultText(log.result)}</div>` : ''}
                ${log.note ? `<div style="margin-top: 5px; font-size: 0.9em;">Ghi chú: ${log.note}</div>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Hiển thị phân trang
    renderPagination('history-pagination-container', paginationConfig.currentLogPage, paginationConfig.totalLogPages, (newPage) => {
        renderAllLogs(newPage);
    });
}

// Thêm sản phẩm vào form tạo kiện hàng
function addProductItem() {
    const itemsContainer = document.getElementById('items-container');
    const newItemRow = document.createElement('div');
    newItemRow.className = 'item-row';
    newItemRow.innerHTML = `
        <input type="text" class="form-control item-input" placeholder="Tên sản phẩm" required>
        <input type="number" class="form-control item-quantity-input" placeholder="Số lượng" value="1" min="1" required>
        <input type="text" class="form-control item-input" placeholder="Nơi sản xuất">
        <input type="date" class="form-control item-input" placeholder="Hạn sử dụng">
        <div class="file-input-container">
            <input type="file" class="item-image-input" accept="image/*" capture="environment">
            <div class="file-input-label">
                <i class="fas fa-camera"></i> Chụp/Tải ảnh
            </div>
        </div>
        <button class="btn btn-danger remove-item-btn" type="button">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    itemsContainer.appendChild(newItemRow);
    
    // Thêm sự kiện xóa
    const removeBtn = newItemRow.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (itemsContainer.children.length > 1) {
            itemsContainer.removeChild(newItemRow);
        }
    });
    
    // Thêm sự kiện cho input file
    const fileInput = newItemRow.querySelector('.item-image-input');
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('Đã chọn file:', file.name);
        }
    });
}

// Thêm sản phẩm vào form sửa kiện hàng
function addEditProductItem() {
    const editItemsContainer = document.getElementById('edit-items-container');
    const newItemRow = document.createElement('div');
    newItemRow.className = 'item-row';
    newItemRow.innerHTML = `
        <input type="text" class="form-control item-input" placeholder="Tên sản phẩm">
        <input type="number" class="form-control item-quantity-input" placeholder="Số lượng" value="1" min="1">
        <input type="text" class="form-control item-input" placeholder="Nơi sản xuất">
        <input type="date" class="form-control item-input" placeholder="Hạn sử dụng">
        <div class="file-input-container">
            <input type="file" class="item-image-input" accept="image/*" capture="environment">
            <div class="file-input-label">
                <i class="fas fa-camera"></i> Chụp/Tải ảnh
            </div>
        </div>
        <button class="btn btn-danger remove-item-btn" type="button">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    editItemsContainer.appendChild(newItemRow);
    
    // Thêm sự kiện xóa
    const removeBtn = newItemRow.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (editItemsContainer.children.length > 1) {
            editItemsContainer.removeChild(newItemRow);
        }
    });
}

// Tạo kiện hàng mới
async function createNewParcel() {
    // Kiểm tra quyền: chỉ NGH mới được tạo kiện hàng
    if (!currentUser || !currentUser.code.startsWith("NGH-")) {
        alert('Chỉ người gói hàng (NGH-) mới có quyền tạo kiện hàng mới!');
        return;
    }
    
    const desc = document.getElementById('parcel-desc').value.trim();
    const creatorName = document.getElementById('creator-name').value.trim() || currentUser.name;
    
    if (!desc) {
        alert('Vui lòng nhập mô tả kiện hàng');
        return;
    }
    
    // Lấy danh sách sản phẩm
    const itemRows = document.querySelectorAll('#items-container .item-row');
    
    if (itemRows.length === 0) {
        alert('Vui lòng thêm ít nhất một sản phẩm');
        return;
    }
    
    const items = [];
    let hasError = false;
    
    for (let row of itemRows) {
        const inputs = row.querySelectorAll('input');
        const itemName = inputs[0].value.trim();
        const quantity = parseInt(inputs[1].value) || 1;
        const productionPlace = inputs[2].value.trim();
        const expiryDate = inputs[3].value;
        const imageFile = inputs[4].files[0];
        
        if (itemName) {
            let imageBase64 = null;
            
            // Xử lý ảnh nếu có
            if (imageFile) {
                try {
                    imageBase64 = await convertFileToBase64(imageFile);
                } catch (error) {
                    console.error('Lỗi chuyển đổi ảnh:', error);
                    alert(`Lỗi khi xử lý ảnh cho sản phẩm ${itemName}`);
                    hasError = true;
                    break;
                }
            }
            
            items.push({
                name: itemName,
                quantity: quantity,
                productionPlace: productionPlace || "Không xác định",
                expiryDate: expiryDate || null,
                imageBase64: imageBase64
            });
        } else {
            hasError = true;
            alert('Vui lòng nhập tên cho tất cả sản phẩm');
            break;
        }
    }
    
    if (hasError) return;
    
    if (items.length === 0) {
        alert('Vui lòng nhập tên cho ít nhất một sản phẩm');
        return;
    }
    
    // Tạo ID ngẫu nhiên
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const parcelId = `P-${timestamp.toString().slice(-6)}-${randomStr}`;
    
    const now = new Date().toISOString();
    const totalQuantity = calculateTotalQuantity(items);
    
    // Tạo kiện hàng mới
    parcels[parcelId] = {
        id: parcelId,
        desc: desc,
        status: 'created',
        created: now,
        lastVerified: null,
        exported: null,
        verificationStatus: null,
        verificationNote: null,
        creator: currentUser.code,
        creatorName: creatorName,
        items: items,
        logs: [
            { who: creatorName, action: 'created', timestamp: now, userCode: currentUser.code }
        ]
    };
    
    // Thêm vào allLogs
    allLogs.push({
        parcel_id: parcelId,
        parcel_desc: desc,
        who: creatorName,
        action: 'created',
        timestamp: now,
        userCode: currentUser.code
    });
    
    saveData();
    updateTabCounts();
    
    // Hiển thị thông tin kiện hàng vừa tạo
    document.getElementById('new-parcel-id').textContent = parcelId;
    document.getElementById('new-parcel-desc').textContent = desc;
    document.getElementById('new-parcel-item-count').textContent = items.length;
    document.getElementById('new-parcel-total-quantity').textContent = totalQuantity;
    document.getElementById('new-parcel-time').textContent = formatDateTime(now);
    document.getElementById('new-parcel-creator').textContent = creatorName;
    
    // Tạo QR code thật (có thể quét được)
    generateQRCode('qrcode', parcelId);
    
    document.getElementById('created-parcel-id').textContent = `Mã kiện hàng: ${parcelId}`;
    document.getElementById('created-parcel-info').style.display = 'block';
    
    // Cuộn đến phần hiển thị kết quả
    document.getElementById('created-parcel-info').scrollIntoView({ behavior: 'smooth' });
    
    // Reset form
    document.getElementById('parcel-desc').value = '';
    document.getElementById('items-container').innerHTML = `
        <div class="item-row">
            <input type="text" class="form-control item-input" placeholder="Tên sản phẩm" required>
            <input type="number" class="form-control item-quantity-input" placeholder="Số lượng" value="1" min="1" required>
            <input type="text" class="form-control item-input" placeholder="Nơi sản xuất">
            <input type="date" class="form-control item-input" placeholder="Hạn sử dụng">
            <div class="file-input-container">
                <input type="file" class="item-image-input" accept="image/*" capture="environment">
                <div class="file-input-label">
                    <i class="fas fa-camera"></i> Chụp/Tải ảnh
                </div>
            </div>
            <button class="btn btn-success add-item-btn" type="button">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    // Thêm lại sự kiện cho nút thêm
    document.querySelector('.add-item-btn').addEventListener('click', addProductItem);
}

// Đổi mật khẩu
function changePassword(currentPassword, newPassword, confirmPassword) {
    if (!currentUser) {
        alert('Vui lòng đăng nhập trước khi đổi mật khẩu!');
        return false;
    }
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return false;
    }
    
    if (newPassword.length < 6) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
        return false;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return false;
    }
    
    let userData = users[currentUser.code];
    
    if (!userData) {
        alert('Không tìm thấy thông tin tài khoản!');
        return false;
    }
    
    // Kiểm tra mật khẩu hiện tại
    if (userData.password !== currentPassword) {
        alert('Mật khẩu hiện tại không chính xác!');
        return false;
    }
    
    // Cập nhật mật khẩu mới
    userData.password = newPassword;
    saveData();
    
    // Reset form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
    
    alert('Đổi mật khẩu thành công!');
    return true;
}

// Xóa tài khoản
function deleteAccount() {
    if (!currentUser) {
        alert('Vui lòng đăng nhập trước!');
        return;
    }
    
    showConfirmation(
        'Xác nhận xóa tài khoản',
        'Bạn có chắc chắn muốn xóa tài khoản này? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục!',
        () => {
            const code = currentUser.code;
            
            // Xóa tài khoản khỏi users
            delete users[code];
            
            // Xóa tất cả kiện hàng do người này tạo
            for (const parcelId in parcels) {
                if (parcels[parcelId].creator === code) {
                    delete parcels[parcelId];
                }
            }
            
            // Đăng xuất
            currentUser = null;
            saveData();
            updateCurrentUserDisplay();
            adjustUIByRole();
            updateTabCounts();
            
            alert('Tài khoản đã được xóa thành công!');
            
            // Chuyển về tab scan
            document.querySelector('.tab-btn[data-tab="scan"]').click();
        }
    );
}

// Hàm hỗ trợ: Định dạng ngày giờ
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
}

// Hàm hỗ trợ: Lấy văn bản trạng thái
function getStatusText(status) {
    const statusMap = {
        'created': 'Đã tạo',
        'verified': 'Đã kiểm tra',
        'exported': 'Đã xuất kho',
        'problem': 'Có vấn đề'
    };
    return statusMap[status] || status;
}

// Hàm hỗ trợ: Lấy văn bản hành động
function getActionText(action) {
    const actionMap = {
        'created': 'Tạo kiện hàng',
        'scanned': 'Quét kiện hàng',
        'verified': 'Kiểm tra sản phẩm',
        'exported': 'Xuất kho',
        'edited': 'Sửa kiện hàng'
    };
    return actionMap[action] || action;
}

// Hàm hỗ trợ: Lấy văn bản kết quả kiểm tra
function getVerificationResultText(result) {
    const resultMap = {
        'success': 'Thành công',
        'problem': 'Có vấn đề'
    };
    return resultMap[result] || result;
}

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    
    // Xử lý chuyển tab
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabId = button.getAttribute('data-tab');
            
            // Dừng scanner nếu đang chạy
            if (isScanning && tabId !== 'scan') {
                stopScanner();
            }
            
            // Ẩn tất cả tab
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Bỏ active tất cả nút
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Hiển thị tab được chọn
            document.getElementById(tabId).classList.add('active');
            button.classList.add('active');
            
            // Tải lại dữ liệu nếu cần
            if (tabId === 'parcels') {
                renderParcelsList();
            } else if (tabId === 'history') {
                renderAllLogs();
            } else if (tabId === 'account') {
                updateAccountInfo();
            } else if (tabId === 'create') {
                // Reset form sửa nếu đang hiển thị
                if (document.getElementById('edit-form').style.display === 'block') {
                    editingParcelId = null;
                    document.getElementById('edit-form').style.display = 'none';
                    document.getElementById('create-form').style.display = 'block';
                    document.getElementById('create-help').style.display = 'block';
                }
            }
        });
    });
    
    // Xử lý chuyển đổi giữa form đăng nhập và đăng ký
    document.querySelectorAll('.auth-tab, .auth-link').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const formType = element.getAttribute('data-auth-form');
            if (formType) {
                switchAuthForm(formType);
            }
        });
    });
    
    // Đăng nhập người dùng
    document.getElementById('login-btn').addEventListener('click', () => {
        const code = document.getElementById('login-code').value.trim().toUpperCase();
        const password = document.getElementById('login-password').value;
        if (code && password) {
            loginUser(code, password);
        } else {
            alert('Vui lòng nhập mã đăng nhập và mật khẩu');
        }
    });
    
    // Đăng ký người dùng
    document.getElementById('register-btn').addEventListener('click', () => {
        const code = document.getElementById('register-code').value;
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        registerUser(code, name, email, phone, password, confirmPassword);
    });
    
    // Đăng xuất người dùng
    document.getElementById('user-logout-btn').addEventListener('click', logoutUser);
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
    
    // Bật/tắt camera quét QR
    document.getElementById('start-scan-btn').addEventListener('click', startScanner);
    document.getElementById('stop-scan-btn').addEventListener('click', stopScanner);
    
    // Tìm kiện hàng thủ công
    document.getElementById('scan-btn').addEventListener('click', () => {
        const parcelId = document.getElementById('manual-parcel-id').value;
        findParcel(parcelId);
    });
    
    // Thêm sản phẩm vào form tạo kiện hàng
    document.getElementById('add-more-items-btn').addEventListener('click', addProductItem);
    
    // Thêm sản phẩm vào form sửa kiện hàng
    document.getElementById('edit-add-more-items-btn').addEventListener('click', addEditProductItem);
    
    // Thêm sự kiện cho nút thêm sản phẩm đầu tiên
    document.querySelector('.add-item-btn').addEventListener('click', addProductItem);
    
    // Xử lý sự kiện xóa sản phẩm bằng event delegation
    document.addEventListener('click', function(e) {
        // Xử lý nút xóa item trong form tạo
        if (e.target.closest('.remove-item-btn')) {
            e.preventDefault();
            const itemRow = e.target.closest('.item-row');
            const itemsContainer = document.getElementById('items-container');
            if (itemsContainer && itemsContainer.contains(itemRow) && itemsContainer.children.length > 1) {
                itemsContainer.removeChild(itemRow);
                return;
            }
            
            const editItemsContainer = document.getElementById('edit-items-container');
            if (editItemsContainer && editItemsContainer.contains(itemRow) && editItemsContainer.children.length > 1) {
                editItemsContainer.removeChild(itemRow);
                return;
            }
        }
        
        // Xử lý nút thêm item
        if (e.target.closest('.add-item-btn')) {
            e.preventDefault();
            const container = e.target.closest('.item-row').parentElement;
            if (container.id === 'items-container') {
                addProductItem();
            } else if (container.id === 'edit-items-container') {
                addEditProductItem();
            }
            return;
        }
    });
    
    // Tạo kiện hàng mới
    document.getElementById('create-parcel-btn').addEventListener('click', createNewParcel);
    
    // Lưu chỉnh sửa kiện hàng
    document.getElementById('save-edit-btn').addEventListener('click', saveParcelEdit);
    
    // Hủy chỉnh sửa kiện hàng
    document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
    
    // Tải QR code
    document.getElementById('download-qr-btn').addEventListener('click', downloadQRCode);
    
    // Tìm kiếm kiện hàng
    document.getElementById('search-parcel').addEventListener('input', () => {
        const activeFilter = document.querySelector('.status-filter.active');
        const status = activeFilter ? activeFilter.getAttribute('data-status') : 'all';
        renderParcelsList(status);
    });
    
    // Lọc theo trạng thái
    document.querySelectorAll('.status-filter').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.status-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            const status = button.getAttribute('data-status');
            renderParcelsList(status);
        });
    });
    
    // Hoàn tất kiểm tra sản phẩm
    document.getElementById('complete-verification-btn').addEventListener('click', completeVerification);
    
    // Hủy kiểm tra sản phẩm
    document.getElementById('cancel-verification-btn').addEventListener('click', () => {
        document.getElementById('verification-modal').style.display = 'none';
        currentVerificationParcel = null;
        verificationData = null;
    });
    
    // Chụp ảnh từ camera
    document.getElementById('capture-btn').addEventListener('click', capturePhoto);
    
    // Chụp lại ảnh
    document.getElementById('retake-btn').addEventListener('click', retakePhoto);
    
    // Sử dụng ảnh đã chụp
    document.getElementById('use-photo-btn').addEventListener('click', usePhoto);
    
    // Đóng camera
    document.getElementById('close-camera-btn').addEventListener('click', closeCameraModal);
    
    // Đóng modal thông báo quét thành công
    document.getElementById('close-scan-success-modal').addEventListener('click', () => {
        document.getElementById('scan-success-modal').style.display = 'none';
    });
    
    // Đổi mật khẩu
    document.getElementById('change-password-btn').addEventListener('click', () => {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        
        changePassword(currentPassword, newPassword, confirmPassword);
    });
    
    // Xóa tài khoản
    document.getElementById('delete-account-btn').addEventListener('click', deleteAccount);
    
    // Đóng modal
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('parcel-detail-modal').style.display = 'none';
    });
    
    // Đóng modal khi click bên ngoài
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('parcel-detail-modal')) {
            document.getElementById('parcel-detail-modal').style.display = 'none';
        }
        if (event.target === document.getElementById('verification-modal')) {
            document.getElementById('verification-modal').style.display = 'none';
            currentVerificationParcel = null;
            verificationData = null;
        }
        if (event.target === document.getElementById('camera-modal')) {
            closeCameraModal();
        }
        if (event.target === document.getElementById('scan-success-modal')) {
            document.getElementById('scan-success-modal').style.display = 'none';
        }
        if (event.target === document.getElementById('confirmation-dialog')) {
            document.getElementById('confirmation-dialog').style.display = 'none';
        }
    });
    
    // Cho phép nhấn Enter để đăng nhập
    document.getElementById('login-code').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('login-btn').click();
        }
    });
    
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('login-btn').click();
        }
    });
    
    // Cho phép nhấn Enter để tìm kiện hàng
    document.getElementById('manual-parcel-id').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('scan-btn').click();
        }
    });
    
    // Cho phép nhấn Enter để tạo kiện hàng
    document.getElementById('parcel-desc').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('create-parcel-btn').click();
        }
    });
    
    // Tải dữ liệu ban đầu
    renderParcelsList();
    renderAllLogs();
});

// Xuất các hàm cần thiết ra global scope
window.adjustManualQuantity = adjustManualQuantity;
window.updateManualVerificationData = updateManualVerificationData;
window.selectVerificationResult = selectVerificationResult;
window.showParcelDetails = showParcelDetails;
window.editParcel = editParcel;