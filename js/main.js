
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenuClose && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });

    mobileMenuClose.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });

    const mobileMenuLinks = document.querySelectorAll('.nav-mobile-item');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (notification && notificationText) {
        notificationText.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

function checkAuth() {
    const userBtn = document.querySelector('.user-btn span');
    const userDropdown = document.querySelector('.user-dropdown');
    
    const userData = localStorage.getItem('userData');
    
    if (userData) {
        const user = JSON.parse(userData);
        if (userBtn) {
            userBtn.textContent = user.fullName || user.login;
        }
        
        if (userDropdown) {
            userDropdown.innerHTML = `
                <a href="profile.html"><i class="fas fa-user"></i> Личный кабинет</a>
                <a href="requests.html"><i class="fas fa-list"></i> Мои заявки</a>
                ${user.role === 'admin' ? '<a href="admin.html" class="admin-link"><i class="fas fa-cog"></i> Админ-панель</a>' : ''}
                <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Выйти</a>
            `;
            
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('userData');
                    window.location.href = 'index.html';
                });
            }
        }
        
        const adminLink = document.querySelector('.admin-link');
        if (user.role === 'admin' && adminLink) {
            adminLink.style.display = 'block';
        }
        
        updateNavigation(user.role);
    }
}

function updateNavigation(role) {
    const navDesktop = document.querySelector('.nav-desktop');
    const navMobile = document.querySelector('.nav-mobile-list');
    
    if (role === 'admin') {
        if (navDesktop) {
            navDesktop.innerHTML = `
                <a href="index.html" class="nav-item">Главная</a>
                <a href="admin.html" class="nav-item">Админ-панель</a>
                <a href="profile.html" class="nav-item">Личный кабинет</a>
            `;
        }
        
        if (navMobile) {
            navMobile.innerHTML = `
                <li><a href="index.html" class="nav-mobile-item">Главная</a></li>
                <li><a href="admin.html" class="nav-mobile-item">Админ-панель</a></li>
                <li><a href="profile.html" class="nav-mobile-item">Личный кабинет</a></li>
            `;
        }
    } else if (role === 'user') {
        if (navDesktop) {
            navDesktop.innerHTML = `
                <a href="index.html" class="nav-item">Главная</a>
                <a href="requests.html" class="nav-item">Мои заявки</a>
                <a href="create-request.html" class="nav-item">Создать заявку</a>
                <a href="profile.html" class="nav-item">Личный кабинет</a>
            `;
        }
        
        if (navMobile) {
            navMobile.innerHTML = `
                <li><a href="index.html" class="nav-mobile-item">Главная</a></li>
                <li><a href="requests.html" class="nav-mobile-item">Мои заявки</a></li>
                <li><a href="create-request.html" class="nav-mobile-item">Создать заявку</a></li>
                <li><a href="profile.html" class="nav-mobile-item">Личный кабинет</a></li>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    handleScrollAnimations();
    window.addEventListener('scroll', handleScrollAnimations);
});

function handleScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
}

function initModal(modalId, openBtnId, closeBtnClass = 'modal-close') {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openBtnId);
    const closeBtns = modal ? modal.querySelectorAll(`.${closeBtnClass}`) : [];
    
    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

function confirmAction(message, callback) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Подтверждение</div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn" id="confirmYes">Да</button>
                    <button class="btn btn-outline" id="confirmNo">Нет</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#confirmYes').addEventListener('click', () => {
        callback(true);
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#confirmNo').addEventListener('click', () => {
        callback(false);
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}