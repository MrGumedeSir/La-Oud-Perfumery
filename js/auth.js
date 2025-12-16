// Authentication functionality for La'Oud Perfumery
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            this.loadUser();
            this.setupAuthTabs();
            this.setupForms();
            this.setupPasswordToggles();
            this.setupPasswordStrength();
        } catch (error) {
            console.error('Failed to initialize auth manager:', error);
        }
    }

    loadUser() {
        try {
            const userData = localStorage.getItem('laoud_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    }

    setupAuthTabs() {
        try {
            const tabButtons = document.querySelectorAll('.tab-button');
            const authForms = document.querySelectorAll('.auth-form');

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabName = button.dataset.tab;
                    
                    // Update active tab button
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Update active form
                    authForms.forEach(form => form.classList.remove('active'));
                    document.getElementById(`${tabName}Form`).classList.add('active');
                });
            });
        } catch (error) {
            console.error('Failed to setup auth tabs:', error);
        }
    }

    setupForms() {
        try {
            // Login form
            const loginForm = document.getElementById('loginFormElement');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }

            // Register form
            const registerForm = document.getElementById('registerFormElement');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }
        } catch (error) {
            console.error('Failed to setup forms:', error);
        }
    }

    async handleLogin() {
        try {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            // Clear previous errors
            this.clearErrors('login');

            // Validate inputs
            if (!this.validateEmail(email)) {
                this.showError('loginEmailError', 'Please enter a valid email address');
                return;
            }

            if (!this.validatePassword(password)) {
                this.showError('loginPasswordError', 'Password is required');
                return;
            }

            // Show loading state
            this.setLoadingState('login', true);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock authentication
            if (email && password) {
                this.currentUser = {
                    id: Date.now(),
                    email: email,
                    name: email.split('@')[0],
                    isLoggedIn: true,
                    rememberMe: rememberMe
                };

                localStorage.setItem('laoud_user', JSON.stringify(this.currentUser));
                
                this.showSuccess('Login successful! Redirecting...');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.showError('loginPasswordError', 'Invalid email or password');
        } finally {
            this.setLoadingState('login', false);
        }
    }

    async handleRegister() {
        try {
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
                confirmPassword: document.getElementById('confirmPassword').value,
                agreeTerms: document.getElementById('agreeTerms').checked
            };

            // Clear previous errors
            this.clearErrors('register');

            // Validate inputs
            if (!this.validateName(formData.firstName)) {
                this.showError('firstNameError', 'First name is required');
                return;
            }

            if (!this.validateName(formData.lastName)) {
                this.showError('lastNameError', 'Last name is required');
                return;
            }

            if (!this.validateEmail(formData.email)) {
                this.showError('registerEmailError', 'Please enter a valid email address');
                return;
            }

            if (!this.validatePassword(formData.password)) {
                this.showError('registerPasswordError', 'Password must be at least 8 characters');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                this.showError('confirmPasswordError', 'Passwords do not match');
                return;
            }

            if (!formData.agreeTerms) {
                this.showError('agreeTermsError', 'You must agree to the terms and conditions');
                return;
            }

            // Show loading state
            this.setLoadingState('register', true);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock registration
            this.currentUser = {
                id: Date.now(),
                email: formData.email,
                name: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                isLoggedIn: true
            };

            localStorage.setItem('laoud_user', JSON.stringify(this.currentUser));
            
            this.showSuccess('Registration successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            this.showError('registerEmailError', 'Registration failed. Please try again.');
        } finally {
            this.setLoadingState('register', false);
        }
    }

    setupPasswordToggles() {
        try {
            const passwordToggles = document.querySelectorAll('.password-toggle');
            
            passwordToggles.forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const input = toggle.previousElementSibling;
                    const icon = toggle.querySelector('i');
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        input.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                });
            });
        } catch (error) {
            console.error('Failed to setup password toggles:', error);
        }
    }

    setupPasswordStrength() {
        try {
            const passwordInput = document.getElementById('registerPassword');
            const strengthBar = document.querySelector('.strength-fill');
            const strengthText = document.querySelector('.strength-text');

            if (!passwordInput || !strengthBar || !strengthText) return;

            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                const strength = this.calculatePasswordStrength(password);
                
                strengthBar.style.width = `${strength.score * 20}%`;
                strengthBar.className = `strength-fill ${strength.class}`;
                strengthText.textContent = strength.text;
            });
        } catch (error) {
            console.error('Failed to setup password strength:', error);
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score++;
        else feedback.push('at least 8 characters');

        if (/[a-z]/.test(password)) score++;
        else feedback.push('lowercase letters');

        if (/[A-Z]/.test(password)) score++;
        else feedback.push('uppercase letters');

        if (/[0-9]/.test(password)) score++;
        else feedback.push('numbers');

        if (/[^A-Za-z0-9]/.test(password)) score++;
        else feedback.push('special characters');

        const strengthLevels = [
            { score: 0, class: 'weak', text: 'Very Weak' },
            { score: 1, class: 'weak', text: 'Weak' },
            { score: 2, class: 'fair', text: 'Fair' },
            { score: 3, class: 'good', text: 'Good' },
            { score: 4, class: 'strong', text: 'Strong' },
            { score: 5, class: 'very-strong', text: 'Very Strong' }
        ];

        return strengthLevels[score];
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password && password.length >= 8;
    }

    validateName(name) {
        return name && name.trim().length >= 2;
    }

    showError(elementId, message) {
        try {
            const errorElement = document.getElementById(elementId);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        } catch (error) {
            console.error('Failed to show error:', error);
        }
    }

    clearErrors(formType) {
        try {
            const errorElements = document.querySelectorAll(`#${formType}Form .error-message`);
            errorElements.forEach(element => {
                element.textContent = '';
                element.style.display = 'none';
            });
        } catch (error) {
            console.error('Failed to clear errors:', error);
        }
    }

    setLoadingState(formType, isLoading) {
        try {
            const button = document.querySelector(`#${formType}Form .auth-btn`);
            const btnText = button.querySelector('.btn-text');
            const btnSpinner = button.querySelector('.btn-spinner');

            if (isLoading) {
                button.disabled = true;
                btnText.style.display = 'none';
                btnSpinner.style.display = 'inline-block';
            } else {
                button.disabled = false;
                btnText.style.display = 'inline-block';
                btnSpinner.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to set loading state:', error);
        }
    }

    showSuccess(message) {
        try {
            if (window.laOudApp) {
                window.laOudApp.showNotification(message, 'success');
            } else {
                alert(message);
            }
        } catch (error) {
            console.error('Failed to show success message:', error);
        }
    }

    updateUI() {
        try {
            if (this.currentUser) {
                // Update login link in navigation
                const loginLink = document.getElementById('loginLink');
                if (loginLink) {
                    loginLink.textContent = this.currentUser.name;
                    loginLink.href = '#';
                    loginLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                }
            }
        } catch (error) {
            console.error('Failed to update UI:', error);
        }
    }

    logout() {
        try {
            this.currentUser = null;
            localStorage.removeItem('laoud_user');
            this.showSuccess('Logged out successfully');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (document.getElementById('loginFormElement') || document.getElementById('registerFormElement')) {
            window.authManager = new AuthManager();
        }
    } catch (error) {
        console.error('Failed to initialize auth manager:', error);
    }
});
