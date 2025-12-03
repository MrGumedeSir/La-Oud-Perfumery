// Modern La'Oud Perfumery App JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    initMobileNavigation();
    
    // Smooth scrolling for anchor links
    initSmoothScrolling();
    
    // Navbar scroll effect
    initNavbarScroll();
    
    // Form handling
    initContactForm();
    
    // Initialize cart functionality
    initCart();
    
    // Handle announcement bar spacing
    initAnnouncementBarSpacing();
});

// Mobile Navigation
function initMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Update aria-expanded
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Smooth Scrolling
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        }
        
        lastScrollY = currentScrollY;
    });
}

// Contact Form Handling
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
        });
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate all fields
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                // Focus first invalid field
                const firstError = contactForm.querySelector('.error-message:not(:empty)');
                if (firstError) {
                    const field = contactForm.querySelector(`#${firstError.id.replace('-error', '')}`);
                    if (field) {
                        field.focus();
                        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Show success message
                showNotification('Thank you for your message! We will get back to you soon.', 'success');
                
                // Reset form
                this.reset();
                inputs.forEach(input => {
                    const errorMsg = document.getElementById(`${input.id}-error`);
                    if (errorMsg) errorMsg.textContent = '';
                    input.classList.remove('error');
                });
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-busy');
                
                // Focus first field for accessibility
                const firstInput = inputs[0];
                if (firstInput) firstInput.focus();
            }, 2000);
        });
    }
}

// Validate individual field
function validateField(field) {
    const errorId = `${field.id}-error`;
    const errorElement = document.getElementById(errorId);
    let errorMessage = '';
    
    // Remove previous error styling
    field.classList.remove('error');
    
    // Check required fields
    if (field.hasAttribute('required') && !field.value.trim()) {
        errorMessage = `${field.previousElementSibling?.textContent?.replace('*', '').trim() || 'This field'} is required.`;
        field.classList.add('error');
    }
    // Validate email
    else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        errorMessage = 'Please enter a valid email address.';
        field.classList.add('error');
    }
    // Validate name (minimum 2 characters)
    else if (field.id === 'name' && field.value.trim().length < 2) {
        errorMessage = 'Name must be at least 2 characters long.';
        field.classList.add('error');
    }
    // Validate message (minimum 10 characters)
    else if (field.id === 'message' && field.value.trim().length < 10) {
        errorMessage = 'Message must be at least 10 characters long.';
        field.classList.add('error');
    }
    
    // Update error message
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
    
    return !errorMessage;
}

// Form Validation (kept for backward compatibility)
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Please enter a valid name (at least 2 characters)');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Please enter a message (at least 10 characters)');
    }
    
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 16px 20px;
        background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#3742fa'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Cart Functionality
function initCart() {
    // Load cart from localStorage
    loadCart();
    
    // Update cart display
    updateCartDisplay();
}

// Load cart from localStorage
function loadCart() {
    const cart = localStorage.getItem('laoud_cart');
    if (cart) {
        window.cart = JSON.parse(cart);
    } else {
        window.cart = [];
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('laoud_cart', JSON.stringify(window.cart));
}

// Update cart display
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartLink = document.querySelector('.cart-link');
    if (cartCount) {
        const totalItems = window.cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.setAttribute('aria-label', `${totalItems} items in cart`);
        
        // Update cart link aria-label
        if (cartLink) {
            cartLink.setAttribute('aria-label', `Shopping cart with ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`);
        }
        
        // Announce to screen readers if count changed
        if (totalItems > 0) {
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = `Cart updated: ${totalItems} ${totalItems === 1 ? 'item' : 'items'} in cart`;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }
    }
}

// Add item to cart
function addToCart(product) {
    const existingItem = window.cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        window.cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
    showNotification('Item added to cart!', 'success');
}

// Remove item from cart
function removeFromCart(productId) {
    window.cart = window.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}

// Update item quantity in cart
function updateCartQuantity(productId, quantity) {
    const item = window.cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            updateCartDisplay();
        }
    }
}

// Get cart total
function getCartTotal() {
    return window.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.collection-card, .contact-item, .about-visual');
    animatedElements.forEach(el => observer.observe(el));
}

// Initialize scroll animations when DOM is ready
document.addEventListener('DOMContentLoaded', initScrollAnimations);

// Handle announcement bar spacing
function initAnnouncementBarSpacing() {
    const announcementBar = document.querySelector('.announcement-bar');
    const navbar = document.querySelector('.navbar');
    const main = document.querySelector('main');
    
    if (announcementBar && navbar) {
        // Add class to body for CSS targeting
        document.body.classList.add('has-announcement-bar');
        
        // Calculate and set navbar position dynamically
        const updateSpacing = () => {
            const barHeight = announcementBar.offsetHeight;
            navbar.style.top = `${barHeight}px`;
            
            // Adjust main content padding
            if (main) {
                const navbarHeight = navbar.offsetHeight;
                const totalHeight = barHeight + navbarHeight;
                main.style.paddingTop = `${totalHeight}px`;
            }
            
            // Update mobile menu position if needed
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu && window.innerWidth <= 768) {
                navMenu.style.top = `${barHeight + navbar.offsetHeight}px`;
            }
        };
        
        // Initial update
        updateSpacing();
        
        // Update on resize
        window.addEventListener('resize', updateSpacing);
    }
}

// Export functions for use in other scripts
window.LaOudApp = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    showNotification
};