
function initializeData() {
    if (!localStorage.getItem('mockUsers')) {
        const mockUsers = [
            {
                login: 'admin',
                password: 'admin',
                email: 'admin@officemarket.ru',
                fullName: 'Администратор Системы',
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                login: 'ivanov',
                password: 'password123',
                email: 'ivanov@example.com',
                fullName: 'Иванов Иван Иванович',
                role: 'user',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    }
    
    if (!localStorage.getItem('mockRequests')) {
        const mockRequests = [
            {
                id: 1,
                userId: 'ivanov',
                title: 'Не работает принтер в кабинете 301',
                description: 'Принтер HP LaserJet не печатает, выдает ошибку "замятие бумаги", хотя бумага не замята.',
                category: 'Оргтехника',
                status: 'Новая',
                createdAt: '2025-10-15 14:30:00',
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
                createdAt: '2025-10-10 09:15:00',
                solvedAt: '2025-10-12 16:20:00',
                rejectionReason: null
            },
            {
                id: 3,
                userId: 'ivanov',
                title: 'Закончилась бумага для принтера',
                description: 'Требуется бумага А4, 500 листов, плотность 80 г/м².',
                category: 'Канцелярия',
                status: 'Отклонена',
                createdAt: '2025-10-05 11:45:00',
                solvedAt: '2025-10-06 10:30:00',
                rejectionReason: 'Закупка бумаги запланирована на следующий месяц'
            },
            {
                id: 4,
                userId: 'admin',
                title: 'Не работает кондиционер',
                description: 'Кондиционер в конференц-зале не охлаждает воздух.',
                category: 'Техника',
                status: 'Новая',
                createdAt: '2025-12-26 12:00',
                solvedAt: '2025-12-26 12:00',,
                rejectionReason: null
            }
        ];
        localStorage.setItem('mockRequests', JSON.stringify(mockRequests));
    }
    
    if (!localStorage.getItem('categories')) {
        const categories = ['Оргтехника', 'Мебель', 'Канцелярия', 'Техника', 'Программное обеспечение', 'Другое'];
        localStorage.setItem('categories', JSON.stringify(categories));
    }
}

function getUsers() {
    const users = localStorage.getItem('mockUsers');
    return users ? JSON.parse(users) : [];
}

function getRequests() {
    const requests = localStorage.getItem('mockRequests');
    return requests ? JSON.parse(requests) : [];
}

function getCategories() {
    const categories = localStorage.getItem('categories');
    return categories ? JSON.parse(categories) : [];
}

function saveUsers(users) {
    localStorage.setItem('mockUsers', JSON.stringify(users));
}

function saveRequests(requests) {
    localStorage.setItem('mockRequests', JSON.stringify(requests));
}

function saveCategories(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
}

function findUserByLogin(login) {
    const users = getUsers();
    return users.find(u => u.login === login);
}

function addUser(user) {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
}

function getUserRequests(userLogin) {
    const requests = getRequests();
    return requests.filter(request => request.userId === userLogin);
}

function createRequest(requestData) {
    const requests = getRequests();
    const newId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
    
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
    
    requests.unshift(newRequest);
    saveRequests(requests);
    return newRequest;
}

function deleteRequest(requestId, userLogin) {
    const requests = getRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId && r.userId === userLogin);
    
    if (requestIndex !== -1) {
        const request = requests[requestIndex];
        
        if (request.status !== 'Новая') {
            return {
                success: false,
                message: 'Можно удалять только заявки со статусом "Новая"'
            };
        }
        
        requests.splice(requestIndex, 1);
        saveRequests(requests);
        return { success: true };
    }
    
    return { success: false, message: 'Заявка не найдена' };
}

function updateRequestStatus(requestId, status, rejectionReason = null) {
    const requests = getRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
        const request = requests[requestIndex];
        
        if (request.status !== 'Новая') {
            return {
                success: false,
                message: 'Можно изменять статус только у заявок со статусом "Новая"'
            };
        }
        
        requests[requestIndex].status = status;
        
        if (status === 'Решена') {
            requests[requestIndex].solvedAt = new Date().toLocaleString('ru-RU');
        } else if (status === 'Отклонена') {
            requests[requestIndex].solvedAt = new Date().toLocaleString('ru-RU');
            requests[requestIndex].rejectionReason = rejectionReason;
        }
        
        saveRequests(requests);
        return { success: true };
    }
    
    return { success: false, message: 'Заявка не найдена' };
}

function addCategory(categoryName) {
    const categories = getCategories();
    
    if (categories.includes(categoryName)) {
        return { success: false, message: 'Такая категория уже существует' };
    }
    
    categories.push(categoryName);
    saveCategories(categories);
    return { success: true };
}

function deleteCategory(categoryName) {
    const categories = getCategories();
    const categoryIndex = categories.indexOf(categoryName);
    
    if (categoryIndex === -1) {
        return { success: false, message: 'Категория не найдена' };
    }
    
    const requests = getRequests();
    const hasRequests = requests.some(request => request.category === categoryName);
    
    if (hasRequests) {
        return { 
            success: false, 
            message: 'Нельзя удалить категорию, так как есть заявки с этой категорией' 
        };
    }
    
    categories.splice(categoryIndex, 1);
    saveCategories(categories);
    return { success: true };
}

initializeData();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeData,
        getUsers,
        getRequests,
        getCategories,
        saveUsers,
        saveRequests,
        saveCategories,
        findUserByLogin,
        addUser,
        getUserRequests,
        createRequest,
        deleteRequest,
        updateRequestStatus,
        addCategory,
        deleteCategory
    };
} else {
    window.DataManager = {
        initializeData,
        getUsers,
        getRequests,
        getCategories,
        saveUsers,
        saveRequests,
        saveCategories,
        findUserByLogin,
        addUser,
        getUserRequests,
        createRequest,
        deleteRequest,
        updateRequestStatus,
        addCategory,
        deleteCategory
    };
}