
const mockUsers = [
    {
        login: 'admin',
        password: 'admin',
        email: 'admin@officemarket.ru',
        fullName: 'Администратор Системы',
        role: 'admin'
    },
    {
        login: 'ivanov',
        password: 'password123',
        email: 'ivanov@example.com',
        fullName: 'Иванов Иван Иванович',
        role: 'user'
    }
];

function loginUser(login, password) {
    const user = DataManager.findUserByLogin(login);
    
    if (user && user.password === password) {
        const { password, ...userData } = user;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        return { success: true, user: userData };
    }
    
    return { success: false, message: 'Неверный логин или пароль' };
}

function registerUser(userData) {
    const existingUser = DataManager.findUserByLogin(userData.login);
    
    if (existingUser) {
        return { success: false, message: 'Пользователь с таким логином уже существует' };
    }
    
    const newUser = {
        ...userData,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    DataManager.addUser(newUser);
    
    const { password, ...userWithoutPassword } = newUser;
    localStorage.setItem('userData', JSON.stringify(userWithoutPassword));
    
    return { success: true };
}

function checkLoginAvailability(login) {
    const existingUser = DataManager.findUserByLogin(login);
    return !existingUser;
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof DataManager === 'undefined') {
        console.error('DataManager не загружен. Убедитесь, что data.js подключен.');
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;
            
            const result = loginUser(login, password);
            
            if (result.success) {
                showNotification('Вход выполнен успешно!', 'success');
                setTimeout(() => {
                    if (result.user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'profile.html';
                    }
                }, 1500);
            } else {
                showNotification(result.message, 'error');
            }
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const loginInput = document.getElementById('regLogin');
        if (loginInput) {
            let checkTimeout;
            loginInput.addEventListener('input', function() {
                clearTimeout(checkTimeout);
                
                const login = this.value.trim();
                if (login.length >= 3) {
                    checkTimeout = setTimeout(() => {
                        const available = checkLoginAvailability(login);
                        const errorElement = this.nextElementSibling?.nextElementSibling;
                        
                        if (errorElement && errorElement.classList.contains('error-message')) {
                            if (!available) {
                                errorElement.textContent = 'Этот логин уже занят';
                                errorElement.classList.add('show');
                                this.classList.add('error');
                            } else {
                                errorElement.classList.remove('show');
                                this.classList.remove('error');
                            }
                        }
                    }, 800);
                }
            });
        }
        
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                fullName: document.getElementById('fullName').value,
                login: document.getElementById('regLogin').value,
                email: document.getElementById('email').value,
                password: document.getElementById('regPassword').value
            };
            
            if (!formData.fullName || !formData.login || !formData.email || !formData.password) {
                showNotification('Все поля обязательны для заполнения', 'error');
                return;
            }
            
            const agreement = document.getElementById('agreement');
            if (!agreement.checked) {
                showNotification('Необходимо согласие на обработку персональных данных', 'error');
                return;
            }
            
            const result = registerUser(formData);
            
            if (result.success) {
                showNotification('Регистрация прошла успешно!', 'success');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            } else {
                showNotification(result.message, 'error');
            }
        });
    }
    
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.className = 'fas fa-eye';
            } else {
                icon.className = 'fas fa-eye-slash';
            }
        });
    });
});

function checkLoginAvailability(login) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const userExists = mockUsers.some(user => user.login === login);
            resolve(!userExists);
        }, 500);
    });
}

function loginUser(login, password) {
    const user = mockUsers.find(u => u.login === login && u.password === password);
    
    if (user) {
        localStorage.setItem('userData', JSON.stringify({
            login: user.login,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }));
        
        return { success: true, user };
    }
    
    return { success: false, message: 'Неверный логин или пароль' };
}

// Регистрация пользователя
function registerUser(userData) {
    const userExists = mockUsers.some(user => user.login === userData.login);
    
    if (userExists) {
        return { success: false, message: 'Пользователь с таким логином уже существует' };
    }
    
    mockUsers.push({
        ...userData,
        role: 'user'
    });
    
    localStorage.setItem('userData', JSON.stringify({
        login: userData.login,
        fullName: userData.fullName,
        email: userData.email,
        role: 'user'
    }));
    
    return { success: true };
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;
            
            const result = loginUser(login, password);
            
            if (result.success) {
                showNotification('Вход выполнен успешно!', 'success');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            } else {
                showNotification(result.message, 'error');
            }
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const loginInput = document.getElementById('regLogin');
        if (loginInput) {
            let checkTimeout;
            loginInput.addEventListener('input', function() {
                clearTimeout(checkTimeout);
                
                const login = this.value.trim();
                if (login.length >= 3) {
                    checkTimeout = setTimeout(async () => {
                        const available = await checkLoginAvailability(login);
                        const errorElement = this.nextElementSibling?.nextElementSibling;
                        
                        if (errorElement && errorElement.classList.contains('error-message')) {
                            if (!available) {
                                errorElement.textContent = 'Этот логин уже занят';
                                errorElement.classList.add('show');
                                this.classList.add('error');
                            } else {
                                errorElement.classList.remove('show');
                                this.classList.remove('error');
                            }
                        }
                    }, 800);
                }
            });
        }
        
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                fullName: document.getElementById('fullName').value,
                login: document.getElementById('regLogin').value,
                email: document.getElementById('email').value,
                password: document.getElementById('regPassword').value
            };
            
            if (!formData.fullName || !formData.login || !formData.email || !formData.password) {
                showNotification('Все поля обязательны для заполнения', 'error');
                return;
            }
            
            const agreement = document.getElementById('agreement');
            if (!agreement.checked) {
                showNotification('Необходимо согласие на обработку персональных данных', 'error');
                return;
            }
            
            const result = registerUser(formData);
            
            if (result.success) {
                showNotification('Регистрация прошла успешно!', 'success');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            } else {
                showNotification(result.message, 'error');
            }
        });
    }
    
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.className = 'fas fa-eye';
            } else {
                icon.className = 'fas fa-eye-slash';
            }
        });
    });
});