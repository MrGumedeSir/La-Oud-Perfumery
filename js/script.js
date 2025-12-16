// Wait for DOM to be fully loaded before running any JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background change on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            }
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.collection-card, .feature, .info-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Form submission handling
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            // Simple validation
            if (!name || !email || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
            contactForm.reset();
        });
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            padding: 16px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const floatingElements = document.querySelectorAll('.floating-element');
        
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
        
        floatingElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Collection card hover effects
    document.querySelectorAll('.collection-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Button click animations
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Social media links
    document.querySelectorAll('.social-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = link.querySelector('i').className;
            
            let url = '#';
            if (platform.includes('facebook')) {
                url = 'https://facebook.com/laoudperfumery';
            } else if (platform.includes('instagram')) {
                url = 'https://instagram.com/laoudperfumery';
            } else if (platform.includes('whatsapp')) {
                url = 'https://wa.me/27729153087';
            }
            
            window.open(url, '_blank');
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close mobile menu
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (navToggle) {
                navToggle.classList.remove('active');
            }
            
            // Close notifications
            const notification = document.querySelector('.notification');
            if (notification) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            }
        }
    });

    // Performance optimization: Debounce scroll events
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

    // Apply debouncing to scroll events
    const debouncedScrollHandler = debounce(() => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            }
        }
    }, 10);

    window.addEventListener('scroll', debouncedScrollHandler);

    // Google Maps Integration
    function initMap() {
        // Coordinates for La'Oud Perfumery (approximate location in Kimberley)
        const laOudLocation = { lat: -28.7382, lng: 24.7637 };
        
        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: laOudLocation,
            styles: [
                {
                    featureType: 'all',
                    elementType: 'geometry',
                    stylers: [{ color: '#242f3e' }]
                },
                {
                    featureType: 'all',
                    elementType: 'labels.text.stroke',
                    stylers: [{ color: '#242f3e' }]
                },
                {
                    featureType: 'all',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#746855' }]
                },
                {
                    featureType: 'administrative.locality',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }]
                },
                {
                    featureType: 'poi',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }]
                },
                {
                    featureType: 'poi.park',
                    elementType: 'geometry',
                    stylers: [{ color: '#263c3f' }]
                },
                {
                    featureType: 'poi.park',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#6b9a76' }]
                },
                {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [{ color: '#38414e' }]
                },
                {
                    featureType: 'road',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#212a37' }]
                },
                {
                    featureType: 'road',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#9ca5b3' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'geometry',
                    stylers: [{ color: '#746855' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#1f2835' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#f3d19c' }]
                },
                {
                    featureType: 'transit',
                    elementType: 'geometry',
                    stylers: [{ color: '#2f3948' }]
                },
                {
                    featureType: 'transit.station',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }]
                },
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#17263c' }]
                },
                {
                    featureType: 'water',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#515c6d' }]
                },
                {
                    featureType: 'water',
                    elementType: 'labels.text.stroke',
                    stylers: [{ color: '#17263c' }]
                }
            ]
        });

        const marker = new google.maps.Marker({
            position: laOudLocation,
            map: map,
            title: 'La\'Oud Perfumery',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#D4AF37" stroke="#F4E4BC" stroke-width="2"/>
                        <text x="20" y="26" text-anchor="middle" font-family="Arial" font-size="16" fill="#0A0A0A">💎</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20)
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="color: #0A0A0A; font-family: 'Inter', sans-serif;">
                    <h3 style="margin: 0 0 10px 0; color: #D4AF37; font-size: 18px;">La'Oud Perfumery</h3>
                    <p style="margin: 0 0 10px 0; font-size: 14px;">101 Barkley Road, Gemdene<br>Kimberley, 8301</p>
                    <p style="margin: 0; font-size: 12px; color: #666;">Premium Oud Fragrances</p>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    }

    // Chatbot Functionality (only if advanced chatbot isn't present)
    if (!window.laOudChatbot) {
        const chatbotToggle = document.getElementById('chatbotToggle');
        const chatbot = document.getElementById('chatbot');
        const chatbotClose = document.getElementById('chatbotClose');
        const chatbotInput = document.getElementById('chatbotInput');
        const chatbotSend = document.getElementById('chatbotSend');
        const chatbotMessages = document.getElementById('chatbotMessages');

        if (chatbotToggle && chatbot) {
            chatbotToggle.addEventListener('click', () => {
                chatbot.classList.toggle('active');
                chatbotToggle.style.display = chatbot.classList.contains('active') ? 'none' : 'flex';
            });

            if (chatbotClose) {
                chatbotClose.addEventListener('click', () => {
                    chatbot.classList.remove('active');
                    chatbotToggle.style.display = 'flex';
                });
            }
        }

        const chatbotResponses = {
            'hours': 'Our trading hours are:<br>• Monday - Friday: 08:00 - 17:00<br>• Saturday: 08:00 - 13:00<br>• Sunday & Public Holidays: Closed',
            'location': 'We are located at:<br>101 Barkley Road, Gemdene<br>Kimberley, 8301<br><br>You can use the map below to get directions!',
            'fragrances': 'We specialize in premium oud fragrances and niche perfumes:<br>• Oud Collection - Ancient wisdom in modern bottles<br>• Floral Essence - Nature\'s most delicate treasures<br>• Oriental Mystique - Spices and secrets of the East',
            'contact': 'You can reach us at:<br>📞 Phone: 072 915 3087<br>📍 Address: 101 Barkley Road, Gemdene, Kimberley, 8301<br><br>Feel free to visit us during our trading hours!',
            'default': 'Thank you for your interest in La\'Oud Perfumery! I\'m here to help you discover our exquisite fragrances. You can ask me about our trading hours, location, fragrances, or contact information.'
        };

        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas ${isUser ? 'fa-user' : 'fa-gem'}"></i>
                </div>
                <div class="message-content">
                    <p>${content}</p>
                </div>
            `;
            
            if (chatbotMessages) {
                chatbotMessages.appendChild(messageDiv);
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            }
        }

        function getBotResponse(userMessage) {
            const message = userMessage.toLowerCase();
            
            if (message.includes('hour') || message.includes('time') || message.includes('open') || message.includes('close')) {
                return chatbotResponses.hours;
            } else if (message.includes('location') || message.includes('address') || message.includes('where') || message.includes('find')) {
                return chatbotResponses.location;
            } else if (message.includes('fragrance') || message.includes('perfume') || message.includes('oud') || message.includes('scent')) {
                return chatbotResponses.fragrances;
            } else if (message.includes('contact') || message.includes('phone') || message.includes('call') || message.includes('reach')) {
                return chatbotResponses.contact;
            } else {
                return chatbotResponses.default;
            }
        }

        function sendMessage() {
            if (!chatbotInput) return;
            const message = chatbotInput.value.trim();
            if (message) {
                addMessage(message, true);
                chatbotInput.value = '';
                
                setTimeout(() => {
                    const response = getBotResponse(message);
                    addMessage(response);
                }, 1000);
            }
        }

        if (chatbotSend && chatbotInput) {
            chatbotSend.addEventListener('click', sendMessage);
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }

        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                if (!message) return;
                addMessage(message, true);
                
                setTimeout(() => {
                    const response = getBotResponse(message);
                    addMessage(response);
                }, 1000);
            });
        });
    }
});