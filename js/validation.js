
const patterns = {
    cyrillic: /^[А-ЯЁа-яё\s-]+$/, 
    latin: /^[a-zA-Z0-9_]+$/, 
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/ 
};

function initRealTimeValidation() {
    const fullNameInputs = document.querySelectorAll('input[name="fullName"], #fullName');
    fullNameInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateCyrillicField(this);
        });
        
        input.addEventListener('input', function() {
            clearError(this);
        });
    });
    
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateEmailField(this);
        });
        
        input.addEventListener('input', function() {
            clearError(this);
        });
    });
    
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        if (input.id === 'regPassword' || input.name === 'password') {
            input.addEventListener('input', function() {
                validatePasswordField(this);
            });
        }
    });
    
    const confirmPasswordInputs = document.querySelectorAll('input[name="confirmPassword"]');
    confirmPasswordInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateConfirmPassword(this);
        });
    });
}

function validateCyrillicField(field) {
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(field, 'Поле обязательно для заполнения');
        return false;
    }
    
    if (!patterns.cyrillic.test(value)) {
        showFieldError(field, 'Допустимы только кириллические буквы, пробелы и дефис');
        return false;
    }
    
    clearError(field);
    return true;
}

function validateEmailField(field) {
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(field, 'Поле обязательно для заполнения');
        return false;
    }
    
    if (!patterns.email.test(value)) {
        showFieldError(field, 'Введите корректный email адрес');
        return false;
    }
    
    clearError(field);
    return true;
}

function validatePasswordField(field) {
    const value = field.value;
    
    if (!value) {
        showFieldError(field, 'Поле обязательно для заполнения');
        return false;
    }
    
    if (value.length < 6) {
        showFieldError(field, 'Пароль должен содержать минимум 6 символов');
        return false;
    }
    
    if (!patterns.password.test(value)) {
        showFieldError(field, 'Пароль должен содержать буквы и цифры');
        return false;
    }
    
    updatePasswordStrength(value);
    
    clearError(field);
    return true;
}

function validateConfirmPassword(field) {
    const passwordField = document.querySelector('input[name="password"], #regPassword');
    const confirmValue = field.value;
    const passwordValue = passwordField ? passwordField.value : '';
    
    if (!confirmValue) {
        showFieldError(field, 'Подтвердите пароль');
        return false;
    }
    
    if (confirmValue !== passwordValue) {
        showFieldError(field, 'Пароли не совпадают');
        return false;
    }
    
    clearError(field);
    return true;
}

function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength-bar');
    if (!strengthBar) return;
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    
    if (/\d/.test(password)) strength++;
    
    if (/[@$!%*#?&]/.test(password)) strength++;
    
    strengthBar.className = 'password-strength-bar';
    
    if (strength === 0) {
        strengthBar.style.width = '0%';
    } else if (strength === 1) {
        strengthBar.classList.add('password-strength-weak');
    } else if (strength === 2 || strength === 3) {
        strengthBar.classList.add('password-strength-medium');
    } else {
        strengthBar.classList.add('password-strength-strong');
    }
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearError(field) {
    field.classList.remove('error');
    
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.classList.remove('show');
    }
}

function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('[required], [data-validate]');
    
    fields.forEach(field => {
        let fieldValid = true;
        
        if (field.name === 'fullName') {
            fieldValid = validateCyrillicField(field);
        } else if (field.type === 'email') {
            fieldValid = validateEmailField(field);
        } else if (field.name === 'password' || field.id === 'regPassword') {
            fieldValid = validatePasswordField(field);
        } else if (field.name === 'confirmPassword') {
            fieldValid = validateConfirmPassword(field);
        } else if (field.value.trim() === '') {
            showFieldError(field, 'Поле обязательно для заполнения');
            fieldValid = false;
        }
        
        if (!fieldValid) {
            isValid = false;
        }
    });
    
    const agreement = form.querySelector('input[type="checkbox"][required]');
    if (agreement && !agreement.checked) {
        showNotification('Необходимо согласие на обработку персональных данных', 'error');
        isValid = false;
    }
    
    return isValid;
}

document.addEventListener('DOMContentLoaded', function() {
    initRealTimeValidation();
});