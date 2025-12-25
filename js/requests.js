
let mockRequests = [
    {
        id: 1,
        userId: 'ivanov',
        title: 'Не работает принтер в кабинете 301',
        description: 'Принтер HP LaserJet не печатает, выдает ошибку "замятие бумаги", хотя бумага не замята.',
        category: 'Оргтехника',
        status: 'Новая',
        createdAt: '2023-10-15 14:30:00',
        solvedAt: null,
        rejectionReason: null
    },
    {
        id: 2,
        userId: 'ivanov',
        title: 'Требуется новый стул для сотрудника',
        description: 'Старый стул сломался, требуется эргономичный офисный стул с регулировкой высоты.',
        category: 'Мебель',
        status: 'Решена',
        createdAt: '2023-10-10 09:15:00',
        solvedAt: '2023-10-12 16:20:00',
        rejectionReason: null
    },
    {
        id: 3,
        userId: 'ivanov',
        title: 'Закончилась бумага для принтера',
        description: 'Требуется бумага А4, 500 листов, плотность 80 г/м².',
        category: 'Канцелярия',
        status: 'Отклонена',
        createdAt: '2023-10-05 11:45:00',
        solvedAt: '2023-10-06 10:30:00',
        rejectionReason: 'Закупка бумаги запланирована на следующий месяц'
    },
    {
        id: 4,
        userId: 'admin',
        title: 'Не работает кондиционер',
        description: 'Кондиционер в конференц-зале не охлаждает воздух.',
        category: 'Техника',
        status: 'Новая',
        createdAt: '2023-10-18 08:20:00',
        solvedAt: null,
        rejectionReason: null
    }
];

let categories = ['Оргтехника', 'Мебель', 'Канцелярия', 'Техника', 'Программное обеспечение', 'Другое'];

function getUserRequests(userLogin) {
    return mockRequests.filter(request => request.userId === userLogin);
}

function createRequest(requestData) {
    const newId = mockRequests.length > 0 ? Math.max(...mockRequests.map(r => r.id)) + 1 : 1;
    
    const newRequest = {
        id: newId,
        userId: requestData.userId,
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        status: 'Новая',
        createdAt: new Date().toLocaleString('ru-RU'),
        solvedAt: null,
        rejectionReason: null
    };
    
    mockRequests.unshift(newRequest); // Добавляем в начало
    return newRequest;
}

function deleteRequest(requestId, userLogin) {
    const requestIndex = mockRequests.findIndex(r => r.id === requestId && r.userId === userLogin);
    
    if (requestIndex !== -1) {
        const request = mockRequests[requestIndex];
        
        // Проверяем, можно ли удалить заявку
        if (request.status !== 'Новая') {
            return {
                success: false,
                message: 'Можно удалять только заявки со статусом "Новая"'
            };
        }
        
        mockRequests.splice(requestIndex, 1);
        return { success: true };
    }
    
    return { success: false, message: 'Заявка не найдена' };
}

function filterRequestsByStatus(requests, status) {
    if (!status || status === 'all') {
        return requests;
    }
    return requests.filter(request => request.status === status);
}

function initRequestsPage() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    const requestsContainer = document.getElementById('requestsContainer');
    const emptyState = document.getElementById('emptyState');
    const filterSelect = document.getElementById('statusFilter');
    
    const userRequests = getUserRequests(user.login);
    
    function displayRequests(requests) {
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
                            <div class="request-title">${request.title}</div>
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
                            ${request.status === 'Новая' ? 
                                `<button class="btn btn-small btn-outline delete-request" data-id="${request.id}">Удалить</button>` : 
                                ''}
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
                                <th>Дата создания</th>
                                <th>Название</th>
                                <th>Описание</th>
                                <th>Категория</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.map(request => `
                                <tr>
                                    <td>${request.createdAt}</td>
                                    <td>${request.title}</td>
                                    <td>${request.description}</td>
                                    <td>${request.category}</td>
                                    <td><span class="status status-${request.status.toLowerCase()}">${request.status}</span></td>
                                    <td>
                                        ${request.status === 'Новая' ? 
                                            `<button class="action-btn delete-request" data-id="${request.id}" title="Удалить">
                                                <i class="fas fa-trash"></i>
                                            </button>` : 
                                            ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        requestsContainer.innerHTML = html;
        
        document.querySelectorAll('.delete-request').forEach(btn => {
            btn.addEventListener('click', function() {
                const requestId = parseInt(this.getAttribute('data-id'));
                
                confirmAction('Вы уверены, что хотите удалить эту заявку?', (confirmed) => {
                    if (confirmed) {
                        const result = deleteRequest(requestId, user.login);
                        
                        if (result.success) {
                            showNotification('Заявка успешно удалена', 'success');
                            const filteredRequests = filterSelect ? 
                                filterRequestsByStatus(getUserRequests(user.login), filterSelect.value) : 
                                getUserRequests(user.login);
                            displayRequests(filteredRequests);
                        } else {
                            showNotification(result.message, 'error');
                        }
                    }
                });
            });
        });
    }
    
    displayRequests(userRequests);
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const filteredRequests = filterRequestsByStatus(userRequests, this.value);
            displayRequests(filteredRequests);
        });
    }
}

function initRequestsPage() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    const requestsContainer = document.getElementById('requestsContainer');
    const emptyState = document.getElementById('emptyState');
    const filterSelect = document.getElementById('statusFilter');
    
    const userRequests = DataManager.getUserRequests(user.login);
    
    function displayRequests(requests) {
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
                            <div class="request-title">${request.title}</div>
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
                            ${request.status === 'Новая' ? 
                                `<button class="btn btn-small btn-outline delete-request" data-id="${request.id}">Удалить</button>` : 
                                ''}
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
                                <th>Дата создания</th>
                                <th>Название</th>
                                <th>Описание</th>
                                <th>Категория</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.map(request => `
                                <tr>
                                    <td>${request.createdAt}</td>
                                    <td>${request.title}</td>
                                    <td>${request.description}</td>
                                    <td>${request.category}</td>
                                    <td><span class="status status-${request.status.toLowerCase()}">${request.status}</span></td>
                                    <td>
                                        ${request.status === 'Новая' ? 
                                            `<button class="action-btn delete-request" data-id="${request.id}" title="Удалить">
                                                <i class="fas fa-trash"></i>
                                            </button>` : 
                                            ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        requestsContainer.innerHTML = html;
        
        document.querySelectorAll('.delete-request').forEach(btn => {
            btn.addEventListener('click', function() {
                const requestId = parseInt(this.getAttribute('data-id'));
                
                confirmAction('Вы уверены, что хотите удалить эту заявку?', (confirmed) => {
                    if (confirmed) {
                        const result = DataManager.deleteRequest(requestId, user.login);
                        
                        if (result.success) {
                            showNotification('Заявка успешно удалена', 'success');
                            const filteredRequests = filterSelect ? 
                                filterRequestsByStatus(DataManager.getUserRequests(user.login), filterSelect.value) : 
                                DataManager.getUserRequests(user.login);
                            displayRequests(filteredRequests);
                        } else {
                            showNotification(result.message, 'error');
                        }
                    }
                });
            });
        });
    }
    
    function filterRequestsByStatus(requests, status) {
        if (!status || status === 'all') {
            return requests;
        }
        return requests.filter(request => request.status === status);
    }
    
    displayRequests(userRequests);
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const filteredRequests = filterRequestsByStatus(userRequests, this.value);
            displayRequests(filteredRequests);
        });
    }
}

function initCreateRequestPage() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    const requestForm = document.getElementById('createRequestForm');
    const categorySelect = document.getElementById('category');
    
    if (categorySelect) {
        const categories = DataManager.getCategories();
        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
    
    if (requestForm) {
        requestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();
            const category = document.getElementById('category').value;
            
            if (!title || !description || !category) {
                showNotification('Все поля обязательны для заполнения', 'error');
                return;
            }
            
            const newRequest = DataManager.createRequest({
                userId: user.login,
                title,
                description,
                category
            });
            
            showNotification('Заявка успешно создана!', 'success');
            
            requestForm.reset();
            
            setTimeout(() => {
                window.location.href = 'requests.html';
            }, 1500);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof DataManager === 'undefined') {
        console.error('DataManager не загружен. Убедитесь, что data.js подключен.');
        return;
    }
    
    const path = window.location.pathname;
    
    if (path.includes('requests.html')) {
        initRequestsPage();
    } else if (path.includes('create-request.html')) {
        initCreateRequestPage();
    }
});

function initCreateRequestPage() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    const requestForm = document.getElementById('createRequestForm');
    const categorySelect = document.getElementById('category');
    
    if (categorySelect) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
    
    if (requestForm) {
        requestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();
            const category = document.getElementById('category').value;
            
            if (!title || !description || !category) {
                showNotification('Все поля обязательны для заполнения', 'error');
                return;
            }
            
            const newRequest = createRequest({
                userId: user.login,
                title,
                description,
                category
            });
            
            showNotification('Заявка успешно создана!', 'success');
            
            requestForm.reset();
            
            setTimeout(() => {
                window.location.href = 'requests.html';
            }, 1500);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path.includes('requests.html')) {
        initRequestsPage();
    } else if (path.includes('create-request.html')) {

        initCreateRequestPage();
        // После создания заявки
showNotification('Заявка успешно создана!', 'success');

// Очищаем форму
requestForm.reset();

// Отправляем событие об обновлении заявок
window.dispatchEvent(new CustomEvent('requestCreated'));

// Перенаправляем на страницу заявок через 1.5 секунды
setTimeout(() => {
    window.location.href = 'requests.html';
}, 1500);
    }
});