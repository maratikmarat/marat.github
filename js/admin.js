
function checkAdminAccess() {
    const userData = localStorage.getItem('userData');
    
    if (!userData) {
        window.location.href = 'login.html';
        return false;
    }
    
    const user = JSON.parse(userData);
    
    if (user.role !== 'admin') {
        showNotification('Доступ запрещен. Требуются права администратора', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
    
    return true;
}

function loadStats() {
    try {
        const requests = DataManager.getRequests();
        
        const stats = {
            total: requests.length,
            new: requests.filter(r => r.status === 'Новая').length,
            solved: requests.filter(r => r.status === 'Решена').length,
            rejected: requests.filter(r => r.status === 'Отклонена').length
        };
        
        Object.keys(stats).forEach(stat => {
            const element = document.getElementById(`${stat}Count`);
            if (element) {
                element.textContent = stats[stat];
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        showNotification('Ошибка загрузки статистики', 'error');
    }
}

function filterRequestsByStatus(requests, status) {
    if (!status || status === 'all') {
        return requests;
    }
    return requests.filter(r => r.status === status);
}

function displayRequests(requests) {
    const requestsContainer = document.getElementById('adminRequestsContainer');
    const emptyState = document.getElementById('adminEmptyState');
    
    if (!requestsContainer) return;
    
    if (requests.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        requestsContainer.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    let html = '';
    
    if (window.innerWidth <= 768) {
        requests.forEach(request => {
            html += `
                <div class="request-card" data-id="${request.id}">
                    <div class="request-header">
                        <div>
                            <div class="request-title">${request.title}</div>
                            <div style="font-size: 12px; color: #666;">От: ${request.userId}</div>
                        </div>
                        <span class="status status-${request.status.toLowerCase()}">${request.status}</span>
                    </div>
                    <div class="request-body">
                        <div class="request-category">${request.category}</div>
                        <p>${request.description}</p>
                        <div class="request-date">Создано: ${request.createdAt}</div>
                        ${request.solvedAt ? `<div class="request-date">Решено: ${request.solvedAt}</div>` : ''}
                        ${request.rejectionReason ? `<div class="rejection-reason"><strong>Причина отказа:</strong> ${request.rejectionReason}</div>` : ''}
                    </div>
                    <div class="request-actions">
                        ${request.status === 'Новая' ? `
                            <button class="btn btn-small solve-request" data-id="${request.id}">Решена</button>
                            <button class="btn btn-small btn-outline reject-request" data-id="${request.id}">Отклонить</button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
    } else {
        html = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Пользователь</th>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.map(request => `
                            <tr>
                                <td>${request.createdAt}</td>
                                <td>${request.userId}</td>
                                <td>${request.title}</td>
                                <td>${request.category}</td>
                                <td><span class="status status-${request.status.toLowerCase()}">${request.status}</span></td>
                                <td>
                                    ${request.status === 'Новая' ? `
                                        <div class="actions">
                                            <button class="action-btn solve-request" data-id="${request.id}" title="Отметить как решенную">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button class="action-btn reject-request" data-id="${request.id}" title="Отклонить заявку">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    requestsContainer.innerHTML = html;
    
    document.querySelectorAll('.solve-request').forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = parseInt(this.getAttribute('data-id'));
            
            confirmAction('Отметить заявку как решенную?', (confirmed) => {
                if (confirmed) {
                    try {
                        const result = DataManager.updateRequestStatus(requestId, 'Решена');
                        
                        if (result.success) {
                            showNotification('Статус заявки изменен на "Решена"', 'success');
                            loadRequests();
                            loadStats();
                        } else {
                            showNotification(result.message, 'error');
                        }
                    } catch (error) {
                        console.error('Ошибка обновления статуса:', error);
                        showNotification('Ошибка обновления статуса заявки', 'error');
                    }
                }
            });
        });
    });
    
    document.querySelectorAll('.reject-request').forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = parseInt(this.getAttribute('data-id'));
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">Укажите причину отказа</div>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Причина отказа</label>
                            <textarea class="form-control" id="rejectionReasonText" rows="3" placeholder="Введите причину отказа..."></textarea>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button class="btn" id="confirmRejection">Отклонить</button>
                            <button class="btn btn-outline" id="cancelRejection">Отмена</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.modal-close').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('#cancelRejection').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('#confirmRejection').addEventListener('click', () => {
                const reason = document.getElementById('rejectionReasonText').value.trim();
                
                if (!reason) {
                    showNotification('Необходимо указать причину отказа', 'error');
                    return;
                }
                
                try {
                    const result = DataManager.updateRequestStatus(requestId, 'Отклонена', reason);
                    
                    if (result.success) {
                        showNotification('Заявка отклонена', 'success');
                        document.body.removeChild(modal);
                        loadRequests();
                        loadStats();
                    } else {
                        showNotification(result.message, 'error');
                    }
                } catch (error) {
                    console.error('Ошибка отклонения заявки:', error);
                    showNotification('Ошибка отклонения заявки', 'error');
                }
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        });
    });
}

function loadRequests() {
    try {
        const requests = DataManager.getRequests();
        const filterSelect = document.getElementById('adminStatusFilter');
        
        let filteredRequests = requests;
        
        if (filterSelect && filterSelect.value !== 'all') {
            filteredRequests = filterRequestsByStatus(requests, filterSelect.value);
        }
        
        filteredRequests.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        displayRequests(filteredRequests);
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        showNotification('Ошибка загрузки заявок', 'error');
    }
}

function initCategoriesManagement() {
    try {
        const categoriesContainer = document.getElementById('categoriesContainer');
        const addCategoryForm = document.getElementById('addCategoryForm');
        
        function displayCategories() {
            if (!categoriesContainer) return;
            
            const categories = DataManager.getCategories();
            const requests = DataManager.getRequests();
            
            let html = '';
            
            categories.forEach(category => {
                const hasRequests = requests.some(request => request.category === category);
                
                html += `
                    <div class="category-badge">
                        ${category}
                        ${!hasRequests ? `<button class="delete-category" data-category="${category}" style="background: none; border: none; color: #666; cursor: pointer; margin-left: 5px;">
                            <i class="fas fa-times"></i>
                        </button>` : ''}
                    </div>
                `;
            });
            
            categoriesContainer.innerHTML = html;
            
            document.querySelectorAll('.delete-category').forEach(btn => {
                btn.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    
                    confirmAction(`Удалить категорию "${category}"?`, (confirmed) => {
                        if (confirmed) {
                            try {
                                const result = DataManager.deleteCategory(category);
                                
                                if (result.success) {
                                    showNotification('Категория удалена', 'success');
                                    displayCategories();
                                } else {
                                    showNotification(result.message, 'error');
                                }
                            } catch (error) {
                                console.error('Ошибка удаления категории:', error);
                                showNotification('Ошибка удаления категории', 'error');
                            }
                        }
                    });
                });
            });
        }
        
        displayCategories();
        
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const categoryInput = document.getElementById('newCategoryName');
                const categoryName = categoryInput.value.trim();
                
                if (!categoryName) {
                    showNotification('Введите название категории', 'error');
                    return;
                }
                
                try {
                    const result = DataManager.addCategory(categoryName);
                    
                    if (result.success) {
                        showNotification('Категория добавлена', 'success');
                        categoryInput.value = '';
                        displayCategories();
                    } else {
                        showNotification(result.message, 'error');
                    }
                } catch (error) {
                    console.error('Ошибка добавления категории:', error);
                    showNotification('Ошибка добавления категории', 'error');
                }
            });
        }
    } catch (error) {
        console.error('Ошибка инициализации управления категориями:', error);
        showNotification('Ошибка загрузки категорий', 'error');
    }
}

function showAdminSection(sectionId) {
    const sections = document.querySelectorAll('.admin-section');
    const navItems = document.querySelectorAll('.admin-nav-item[data-section]');
    
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    const targetNavItem = document.querySelector(`.admin-nav-item[data-section="${sectionId}"]`);
    if (targetNavItem) {
        targetNavItem.classList.add('active');
    }
    
    if (sectionId === 'dashboard') {
        loadStats();
    } else if (sectionId === 'requests') {
        loadRequests();
    } else if (sectionId === 'categories') {
        initCategoriesManagement();
    }
}

function initAdminPanel() {
    if (!checkAdminAccess()) return;
    
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const adminNameElement = document.getElementById('adminName');
        
        if (adminNameElement && userData) {
            adminNameElement.textContent = userData.fullName || userData.login;
        }
        
        const adminNavItems = document.querySelectorAll('.admin-nav-item[data-section]');
        const adminSections = document.querySelectorAll('.admin-section');
        
        if (adminSections.length > 0) {
            adminSections.forEach((section, index) => {
                section.style.display = index === 0 ? 'block' : 'none';
            });
        }
        
        adminNavItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                showAdminSection(sectionId);
            });
        });
        
        document.querySelectorAll('[data-section]').forEach(btn => {
            if (btn.tagName === 'A' && btn.getAttribute('href')?.startsWith('#')) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const sectionId = this.getAttribute('data-section');
                    showAdminSection(sectionId);
                });
            }
        });
        
        const filterSelect = document.getElementById('adminStatusFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', function() {
                loadRequests();
            });
        }
        
        loadStats();
        
        if (window.innerWidth <= 768) {
            const mobileNav = document.querySelector('.admin-nav-mobile');
            if (mobileNav) {
                mobileNav.style.display = 'flex';
                
                const mobileItems = mobileNav.querySelectorAll('.admin-nav-item');
                mobileItems.forEach((item, index) => {
                    item.addEventListener('click', function(e) {
                        e.preventDefault();
                        adminNavItems[index].click();
                    });
                });
            }
        }
        
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('userData');
                window.location.href = 'index.html';
            });
        }
        
        console.log('Админ-панель инициализирована успешно');
        
    } catch (error) {
        console.error('Ошибка инициализации админ-панели:', error);
        showNotification('Ошибка загрузки админ-панели', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof DataManager === 'undefined') {
        console.error('DataManager не загружен!');
        showNotification('Ошибка загрузки системы. Проверьте подключение файлов.', 'error');
        return;
    }
    
    if (window.location.pathname.includes('admin.html')) {
        initAdminPanel();
    }
});