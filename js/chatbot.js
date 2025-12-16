/**
 * Advanced La'Oud Perfumery Chatbot
 * Intelligent, efficient, and error-handling capable
 * Enhanced with fuzzy matching, typo tolerance, and professional responses
 */

class LaOudChatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.userPreferences = {};
        this.errorCount = 0;
        this.maxErrors = 5; // Increased error tolerance
        this.sessionId = this.generateSessionId();
        this.lastActivity = Date.now();
        this.isTyping = false;
        this.confidence = 0;
        this.misspelledWords = this.initializeMisspellings();
        
        this.initializeElements();
        this.bindEvents();
        this.loadConversationHistory();
        this.startSession();
    }
    
    initializeMisspellings() {
        return {
            'perfums': 'perfume',
            'perfumes': 'perfume',
            'frangrance': 'fragrance',
            'fragrances': 'fragrance',
            'locaton': 'location',
            'locatin': 'location',
            'our': 'oud',
            'ood': 'oud',
            'owd': 'oud',
            'ooud': 'oud',
            'pris': 'price',
            'prize': 'price',
            'prcies': 'prices',
            'contct': 'contact',
            'contac': 'contact',
            'deliveri': 'delivery',
            'delivary': 'delivery',
            'dilivry': 'delivery',
            'biznes': 'business',
            'bisiness': 'business',
            'openn': 'open',
            'opening': 'open',
            'opned': 'open',
            'clozed': 'closed',
            'cls': 'closed',
            'howrs': 'hours',
            'horus': 'hours',
            'adres': 'address',
            'addres': 'address',
            'directions': 'location',
            'hom': 'home',
            'helo': 'hello',
            'hlo': 'hello',
            'hiy': 'hi',
            'heyy': 'hey',
            'buy': 'buy',
            'purchase': 'buy',
            'shop': 'shop',
            'store': 'shop',
            'boutique': 'shop'
        };
    }

    generateSessionId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    initializeElements() {
        this.container = document.getElementById('chatbot');
        this.toggle = document.getElementById('chatbotToggle');
        this.closeBtn = document.getElementById('chatbotClose');
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendBtn = document.getElementById('chatbotSend');
        this.badge = document.querySelector('.chatbot-badge');
        this.badgeText = document.getElementById('chatbot-badge-text');
    }

    bindEvents() {
        // Toggle chatbot
        this.toggle?.addEventListener('click', () => this.toggleChatbot());
        this.closeBtn?.addEventListener('click', () => this.closeChatbot());
        
        // Send message
        this.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick actions (use currentTarget for reliable UX even when icons/text are clicked)
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                if (!(target instanceof HTMLElement)) return;
                const message = target.getAttribute('data-message');
                if (message) {
                    if (this.input) {
                        this.input.value = message;
                    }
                    this.sendMessage();
                }
            });
        });

        // Auto-close on outside click (guard nulls)
        document.addEventListener('click', (e) => {
            if (!this.isOpen) return;
            const clickedInsideContainer = this.container && this.container.contains(e.target);
            const clickedToggle = this.toggle && this.toggle.contains(e.target);
            if (!clickedInsideContainer && !clickedToggle) {
                this.closeChatbot();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Handle page visibility change
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    startSession() {
        this.addBotMessage("Welcome to La'Oud Perfumery! I'm your intelligent fragrance assistant. How can I help you discover our exquisite collection today?");
        this.updateLastActivity();
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        try {
            this.isOpen = true;
            if (this.container) {
                this.container.classList.add('active');
                this.container.setAttribute('aria-hidden', 'false');
            }
            if (this.toggle) {
                this.toggle.setAttribute('aria-expanded', 'true');
            }
            
            // Focus input after animation
            setTimeout(() => {
                this.input?.focus();
            }, 300);
            
            this.hideBadge();
            this.scrollToBottom();
            this.updateLastActivity();
            
            // Track opening
            this.trackEvent('chatbot_opened');
        } catch (error) {
            this.handleError('Failed to open chatbot', error);
        }
    }

    closeChatbot() {
        try {
            this.isOpen = false;
            if (this.container) {
                this.container.classList.remove('active');
                this.container.setAttribute('aria-hidden', 'true');
            }
            if (this.toggle) {
                this.toggle.setAttribute('aria-expanded', 'false');
            }
            
            this.updateLastActivity();
            this.trackEvent('chatbot_closed');
        } catch (error) {
            this.handleError('Failed to close chatbot', error);
        }
    }

    async sendMessage() {
        const message = this.input?.value.trim();
        if (!message) return;

        try {
            // Add user message
            this.addUserMessage(message);
            this.input.value = '';
            
            // Disable input during processing
            if (this.input) this.input.disabled = true;
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Process message with delay for realistic feel
            await this.delay(800 + Math.random() * 1200);
            
            // Generate response
            const response = await this.generateResponse(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add bot response
            this.addBotMessage(response);
            
            this.updateLastActivity();
            this.trackEvent('message_sent', { message: message.substring(0, 50) });
            
        } catch (error) {
            this.hideTypingIndicator();
            this.handleError('Failed to send message', error);
            
            // Provide more professional error message
            const errorMsg = error.message || 'technical difficulties';
            this.addBotMessage(`I sincerely apologize for the inconvenience. I encountered ${errorMsg} while processing your message. Please feel free to ask your question again, or contact us directly at **0729153087** for immediate assistance. We're here to help!`);
        } finally {
            // Re-enable input
            if (this.input) this.input.disabled = false;
        }
    }

    async generateResponse(userMessage) {
        try {
            // Normalize message with typo correction
            const normalizedMessage = this.normalizeMessage(userMessage);
            
            // Intent recognition with fuzzy matching
            const intent = this.recognizeIntent(normalizedMessage);
            
            // Check confidence level
            const confidence = this.getIntentConfidence(normalizedMessage, intent);
            
            // Context-aware responses
            const context = this.getContext();
            
            // Generate appropriate response
            let response = await this.processIntent(intent, normalizedMessage, context, confidence);
            
            // Add conversation to history
            this.conversationHistory.push({
                user: userMessage,
                normalized: normalizedMessage,
                bot: response,
                intent: intent,
                confidence: confidence,
                timestamp: Date.now()
            });
            
            // Save conversation
            this.saveConversationHistory();
            
            return response;
            
        } catch (error) {
            this.handleError('Failed to generate response', error);
            return this.getGracefulFallback(userMessage);
        }
    }
    
    normalizeMessage(message) {
        let normalized = message.toLowerCase().trim();
        
        // Remove excessive punctuation and spaces
        normalized = normalized.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
        
        // Fix common misspellings
        const words = normalized.split(' ');
        const correctedWords = words.map(word => {
            return this.misspelledWords[word] || word;
        });
        
        return correctedWords.join(' ');
    }
    
    getIntentConfidence(message, intent) {
        const intentKeywords = this.getIntentKeywords(intent);
        if (!intentKeywords || intent === 'general') return 0.5;
        
        const messageWords = message.split(' ');
        const matchedKeywords = intentKeywords.filter(keyword => 
            messageWords.some(word => word.includes(keyword) || keyword.includes(word))
        );
        
        return Math.min(matchedKeywords.length / intentKeywords.length, 1);
    }
    
    getIntentKeywords(intent) {
        const keywords = {
            greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
            hours: ['hours', 'open', 'closed', 'time', 'when', 'business hours', 'trading hours', 'what time'],
            location: ['where', 'location', 'address', 'find', 'directions', 'map', 'located'],
            products: ['perfume', 'fragrance', 'oud', 'collection', 'products', 'buy', 'shop', 'scent'],
            pricing: ['price', 'cost', 'expensive', 'cheap', 'affordable', 'money', 'how much'],
            contact: ['contact', 'phone', 'call', 'email', 'reach', 'speak', 'call you'],
            delivery: ['delivery', 'shipping', 'courier', 'send', 'post', 'free delivery', 'ship'],
            about: ['about', 'story', 'company', 'who', 'what', 'philosophy', 'tell me'],
            help: ['help', 'assistance', 'support', 'problem', 'issue', 'trouble', 'confused'],
            goodbye: ['bye', 'goodbye', 'thanks', 'thank you', 'see you', 'later', 'farewell']
        };
        
        return keywords[intent];
    }

    recognizeIntent(message) {
        const intents = {
            greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'morning', 'afternoon', 'evening'],
            hours: ['hours', 'open', 'closed', 'time', 'when', 'business hours', 'trading hours', 'opened', 'closing', 'work'],
            location: ['where', 'location', 'address', 'find', 'directions', 'map', 'located', 'place', 'find you'],
            products: ['perfume', 'fragrance', 'oud', 'collection', 'products', 'buy', 'shop', 'scent', 'smell', 'aroma'],
            pricing: ['price', 'cost', 'expensive', 'cheap', 'affordable', 'money', 'how much', 'payment', 'pay', 'rand'],
            contact: ['contact', 'phone', 'call', 'email', 'reach', 'speak', 'number', 'call you'],
            delivery: ['delivery', 'shipping', 'courier', 'send', 'post', 'free delivery', 'ship', 'deliver', 'posted'],
            about: ['about', 'story', 'company', 'who', 'what', 'philosophy', 'tell me', 'background'],
            help: ['help', 'assistance', 'support', 'problem', 'issue', 'trouble', 'confused', 'not sure'],
            goodbye: ['bye', 'goodbye', 'thanks', 'thank you', 'see you', 'later', 'farewell', 'appreciate']
        };

        // Check for exact matches first
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => message.includes(keyword))) {
                return intent;
            }
        }
        
        // Fuzzy matching for partial words
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => {
                const keywordParts = keyword.split(' ');
                return keywordParts.every(part => message.includes(part));
            })) {
                return intent;
            }
        }
        
        return 'general';
    }

    async processIntent(intent, message, context, confidence = 1) {
        const responses = {
            greeting: [
                "Good day! Welcome to La'Oud Perfumery. I'm your dedicated fragrance consultant, and I'm here to help you discover our extraordinary collection of oud and niche perfumes. How may I assist you today?",
                "Hello and welcome to La'Oud Perfumery! As your personal fragrance advisor, I'm delighted to guide you through our exclusive collection. What brings you to us today?",
                "Greetings! Welcome to the world of La'Oud Perfumery. I specialize in helping you find the perfect fragrance from our curated collection of luxury oud and niche perfumes. How can I help you today?"
            ],
            
            hours: [
                "Our boutique hours are as follows:\n\n**Monday to Friday**: 08:00 - 17:00\n**Saturday**: 08:00 - 13:00\n**Sunday & Public Holidays**: Closed\n\nWe're located at 101 Barkley Road, Gemdene, Kimberley. We'd be delighted to welcome you during these hours for a personalized fragrance consultation.",
                "You can visit us at our Kimberley boutique during these times:\n\n• **Weekdays**: 8:00 AM to 5:00 PM\n• **Saturdays**: 8:00 AM to 1:00 PM\n• **Sundays**: Closed\n\nWe look forward to providing you with an exceptional fragrance experience at our sanctuary."
            ],
            
            location: [
                "La'Oud Perfumery is located at:\n\n**101 Barkley Road, Gemdene\nKimberley, 8301**\n\nOur boutique is easily accessible and provides a luxurious, tranquil environment for discovering our fine fragrances. Should you need directions or wish to schedule a private consultation, please call us at 0729153087.",
                "You'll find us at 101 Barkley Road in Gemdene, Kimberley. Our boutique offers a sophisticated atmosphere where you can explore our exquisite collection of oud oils and niche perfumes. We're always happy to provide directions or arrange a personal visit - just call 0729153087."
            ],
            
            products: [
                "We curate an exceptional selection of premium oud fragrances and rare niche perfumes. Our collections include:\n\n• **The Oud Collection**: Authentic oud oils and blends featuring ancient wisdom\n• **Floral Essences**: Delicate, nature-inspired compositions\n• **Oriental Mystique**: Exotic, sensual fragrances with Eastern influences\n\nEach scent is carefully selected and tells its own unique story. Would you like to explore a specific collection, or do you have a particular fragrance profile in mind?",
                "Our collection features the world's finest oud oils and exclusive niche perfumes, ranging from traditional oud blends to contemporary interpretations. We specialize in authentic, high-quality fragrances that are sourced globally. What type of fragrance experience are you seeking? I can help guide you to the perfect scent."
            ],
            
            pricing: [
                "Our prices vary by fragrance and size. I can share the current range based on our catalog, or provide the price for a specific item—just tell me the name.",
                "Pricing depends on the product. Ask me about a specific fragrance, or I can give you the current lowest and highest prices available today."
            ],
            
            contact: [
                "We'd be delighted to hear from you! You can reach La'Oud Perfumery at:\n\n**Phone**: 0729153087\n**Address**: 101 Barkley Road, Gemdene, Kimberley, 8301\n**Trading Hours**: Monday-Friday 08:00-17:00, Saturday 08:00-13:00\n\nWhether you're seeking fragrance advice, have questions about our products, or wish to schedule a consultation, we're here to assist you.",
                "For inquiries, fragrance consultations, or any questions about La'Oud Perfumery, please contact us at **0729153087** or visit us at 101 Barkley Road, Gemdene, Kimberley. Our team is always ready to provide personalized service and help you discover your perfect scent."
            ],
            
            delivery: [
                "We can arrange courier delivery within South Africa. Delivery fees and timelines are confirmed when you place your order. If you’d like a quote, please share your area or call 0729153087.",
                "Delivery is available via courier nationwide. Costs depend on destination and order details—please ask for a quote or contact us at 0729153087."
            ],
            
            about: [
                "La'Oud Perfumery was founded with a deep appreciation for the art and mystique of oud and niche fragrances. Based in Kimberley, we are passionate curators who search the globe for the most exquisite and rare perfumes.\n\nOur philosophy emphasizes natural excellence, personal connection, and transformative fragrance experiences. We believe every scent tells a story and evokes emotions that connect us to our deepest selves.",
                "We are enthusiasts dedicated to bringing you the finest oud fragrances and niche perfumes available worldwide. Our story began with a profound belief that fragrance is an art form—a way to connect with memories, express personality, and transform everyday moments into extraordinary experiences."
            ],
            
            help: [
                "I'm here to assist you! As your fragrance advisor, I can help with:\n\n• Detailed product information and personalized recommendations\n• Store hours and location details\n• Pricing and delivery information\n• Fragrance consultation and pairing advice\n• General inquiries about our boutique and services\n\nWhat specific information would you like to know? I'm here to make your fragrance journey effortless.",
                "It would be my pleasure to help you! I have extensive knowledge about our fragrances, boutique services, and can guide you to finding your perfect scent. Feel free to ask me anything about La'Oud Perfumery—I'm dedicated to providing you with the best possible assistance."
            ],
            
            goodbye: [
                "Thank you for visiting La'Oud Perfumery! It's been a pleasure assisting you. Please feel free to return anytime—I'm always here to help with your fragrance journey. We look forward to welcoming you to our boutique soon. Have a wonderful day!",
                "It was wonderful helping you today! Remember, you can reach us at 101 Barkley Road, Gemdene, Kimberley, or call us at 0729153087 anytime during our trading hours. We hope to see you at our boutique soon. Until then, may your days be fragrant!"
            ],
            
            general: [
                "That's an interesting inquiry! As La'Oud Perfumery's fragrance consultant, I'd be delighted to help you with information about our exclusive collections, boutique details, or any aspects of our services. What specifically would you like to know about? I'm here to ensure you have all the information you need.",
                "I'm here to assist with everything about La'Oud Perfumery! Whether you'd like to know about our premium fragrance collections, boutique location and hours, pricing details, delivery options, or help finding your perfect scent—I'm ready to help. What would you like to explore?"
            ]
        };

        // If user asked about pricing, enrich with dynamic range when possible
        if (intent === 'pricing') {
            try {
                const catalog = (window.shop && Array.isArray(window.shop.products) && window.shop.products.length > 0)
                    ? window.shop.products
                    : [];
                if (catalog.length > 0) {
                    const prices = catalog.map(p => Number(p.price)).filter(n => Number.isFinite(n));
                    if (prices.length > 0) {
                        const min = Math.min(...prices);
                        const max = Math.max(...prices);
                        return `Current prices range approximately from **R${min}** to **R${max}**. Tell me a product name and I’ll give you its exact price.`;
                    }
                }
            } catch (e) {
                // fall through to static responses
            }
        }

        const intentResponses = responses[intent] || responses.general;
        
        // Select response based on confidence (lower confidence gets more helpful responses)
        if (confidence < 0.5 && intent !== 'general') {
            // If confidence is low, provide a more helpful, clarifying response
            const baseResponse = intentResponses[Math.floor(Math.random() * intentResponses.length)];
            return baseResponse + "\n\nIf I didn't quite understand your question, please feel free to rephrase it or ask about our fragrances, hours, location, or services."
        }
        
        return intentResponses[Math.floor(Math.random() * intentResponses.length)];
    }

    getContext() {
        return {
            timeOfDay: this.getTimeOfDay(),
            conversationLength: this.conversationHistory.length,
            userPreferences: this.userPreferences,
            lastIntent: this.conversationHistory.length > 0 ? this.conversationHistory[this.conversationHistory.length - 1].intent : null
        };
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }

    getFallbackResponse() {
        const fallbacks = [
            "I apologize, but I'm having trouble processing that request. Could you please rephrase your question? I'm here to help with information about our fragrances, store hours, location, or any other inquiries.",
            "I'm experiencing some technical difficulties. Please try asking your question differently, or feel free to contact us directly at 0729153087 for immediate assistance.",
            "I'm not sure I understood that correctly. Could you please clarify? I'm here to help with La'Oud Perfumery information, product details, or store inquiries."
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    getGracefulFallback(originalMessage) {
        // More intelligent fallback that tries to extract meaning
        const message = originalMessage.toLowerCase();
        
        // Check if it's a vague greeting
        if (message.length < 5 || /\b(hey|yo|sup|nm|k|cool|ok)\b/.test(message)) {
            return "Hello! It's wonderful to have you here at La'Oud Perfumery. I'm your fragrance consultant, ready to help you discover our exquisite collection. What can I assist you with today—information about our products, store hours, or location?";
        }
        
        // Check if it contains question words
        const questionWords = ['who', 'what', 'when', 'where', 'why', 'how', 'can', 'do', 'does', 'is', 'are'];
        const hasQuestion = questionWords.some(word => message.includes(word));
        
        if (hasQuestion) {
            return "Thank you for your question! I'd be happy to help, but could you provide a bit more detail? I specialize in information about La'Oud Perfumery's fragrances, store details, pricing, delivery options, and location. What specific information are you looking for?";
        }
        
        // Default graceful fallback
        return "I appreciate your message! As La'Oud Perfumery's fragrance consultant, I'm here to assist you. Would you like to know about:\n\n• Our premium oud and niche fragrance collections\n• Store hours and location (101 Barkley Road, Gemdene, Kimberley)\n• Pricing for specific products\n• How to reach us (0729153087)\n\nOr feel free to ask any other question—I'm here to help!";
    }

    addUserMessage(message) {
        const messageElement = this.createMessageElement(message, 'user');
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messageElement = this.createMessageElement(message, 'bot');
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        // If the chatbot is closed, gently notify the user of a new message
        if (!this.isOpen) {
            this.showBadge();
        }
    }

    createMessageElement(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        if (type === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="message-perfume-icon">
                        <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5v8c0 1.1.9 2 2 2s2-.9 2-2v-8c2-1 3.5-3 3.5-5.5C18 4.5 15.5 2 12 2z"/>
                        <circle cx="12" cy="8" r="1.5"/>
                    </svg>
                </div>
                <div class="message-content">
                    <p>${this.formatMessage(message)}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${this.escapeHtml(message)}</p>
                </div>
            `;
        }
        
        return messageDiv;
    }

    formatMessage(message) {
        // Convert markdown-style formatting to HTML
        return this.escapeHtml(message)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="message-perfume-icon">
                    <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5v8c0 1.1.9 2 2 2s2-.9 2-2v-8c2-1 3.5-3 3.5-5.5C18 4.5 15.5 2 12 2z"/>
                    <circle cx="12" cy="8" r="1.5"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    showBadge() {
        if (this.badge) {
            this.badge.style.display = 'block';
            if (this.badgeText) {
                this.badgeText.textContent = 'New message';
            }
        }
    }

    hideBadge() {
        if (this.badge) {
            this.badge.style.display = 'none';
        }
    }

    updateLastActivity() {
        this.lastActivity = Date.now();
    }

    handleError(message, error) {
        console.error(`Chatbot Error: ${message}`, error);
        this.errorCount++;
        
        if (this.errorCount >= this.maxErrors) {
            this.addBotMessage("I apologize, but I'm experiencing some technical difficulties that are affecting my ability to assist you. Please contact us directly at **0729153087** or visit us at **101 Barkley Road, Gemdene, Kimberley** for immediate, personalized assistance. Our team will be delighted to help you. Thank you for your patience and understanding.");
            this.trackEvent('chatbot_error_limit_reached');
        } else {
            // Reset error count on successful conversation (after 5 messages without errors)
            if (this.conversationHistory.length > 0 && this.conversationHistory.length % 5 === 0) {
                this.errorCount = Math.max(0, this.errorCount - 1);
            }
        }
        
        this.trackEvent('chatbot_error', { error: message, count: this.errorCount });
    }

    handleResize() {
        if (this.isOpen) {
            this.scrollToBottom();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.updateLastActivity();
        }
    }

    trackEvent(eventName, data = {}) {
        // Analytics tracking
        try {
            const eventData = {
                event: eventName,
                sessionId: this.sessionId,
                timestamp: Date.now(),
                ...data
            };
            
            // Store in localStorage for analytics
            const analytics = JSON.parse(localStorage.getItem('laoud_analytics') || '[]');
            analytics.push(eventData);
            
            // Keep only last 100 events
            if (analytics.length > 100) {
                analytics.splice(0, analytics.length - 100);
            }
            
            localStorage.setItem('laoud_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('Analytics tracking failed:', error);
        }
    }

    saveConversationHistory() {
        try {
            const history = {
                sessionId: this.sessionId,
                conversations: this.conversationHistory,
                preferences: this.userPreferences,
                timestamp: Date.now()
            };
            
            localStorage.setItem('laoud_chat_history', JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save conversation history:', error);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('laoud_chat_history');
            if (saved) {
                const history = JSON.parse(saved);
                if (history.sessionId === this.sessionId) {
                    this.conversationHistory = history.conversations || [];
                    this.userPreferences = history.preferences || {};
                }
            }
        } catch (error) {
            console.error('Failed to load conversation history:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.laOudChatbot = new LaOudChatbot();
    } catch (error) {
        console.error('Failed to initialize chatbot:', error);
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LaOudChatbot;
}
