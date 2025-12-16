// Cart functionality for La'Oud Perfumery
class CartManager {
    constructor() {
        this.cart = [];
        this.coupons = {
            'WELCOME10': { discount: 0.1, type: 'percentage', description: '10% off your first order' },
            'SAVE20': { discount: 0.2, type: 'percentage', description: '20% off orders over R1000' },
            'FREESHIP': { discount: 50, type: 'fixed', description: 'Free shipping' }
        };
        this.appliedCoupon = null;
        
        this.init();
    }

    async init() {
        try {
            this.loadCart();
            this.renderCart();
            this.setupEventListeners();
            this.calculateTotals();
        } catch (error) {
            console.error('Failed to initialize cart manager:', error);
        }
    }

    loadCart() {
        try {
            const cartData = localStorage.getItem('laoud_cart');
            this.cart = cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Failed to load cart:', error);
            this.cart = [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('laoud_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    }

    renderCart() {
        try {
            const cartContainer = document.getElementById('cartContainer');
            const emptyCart = document.getElementById('emptyCart');
            const cartItems = document.getElementById('cartItems');

            if (!cartContainer || !emptyCart || !cartItems) return;

            if (this.cart.length === 0) {
                cartContainer.style.display = 'none';
                emptyCart.style.display = 'block';
                return;
            }

            cartContainer.style.display = 'block';
            emptyCart.style.display = 'none';

            cartItems.innerHTML = '';
            this.cart.forEach(item => {
                const cartItem = this.createCartItem(item);
                cartItems.appendChild(cartItem);
            });

        } catch (error) {
            console.error('Failed to render cart:', error);
        }
    }

    createCartItem(item) {
        try {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <div class="product-placeholder oud-wood small"></div>
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-size">Size: ${item.size}</p>
                    <p class="cart-item-price">R${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${item.id}" data-size="${item.size}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" 
                               data-id="${item.id}" data-size="${item.size}">
                        <button class="quantity-btn plus" data-id="${item.id}" data-size="${item.size}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}" data-size="${item.size}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    R${(item.price * item.quantity).toFixed(2)}
                </div>
            `;

            this.addCartItemListeners(cartItem, item);
            return cartItem;
        } catch (error) {
            console.error('Failed to create cart item:', error);
            return document.createElement('div');
        }
    }

    addCartItemListeners(cartItem, item) {
        try {
            // Quantity controls
            const minusBtn = cartItem.querySelector('.quantity-btn.minus');
            const plusBtn = cartItem.querySelector('.quantity-btn.plus');
            const quantityInput = cartItem.querySelector('.quantity-input');
            const removeBtn = cartItem.querySelector('.remove-item');

            if (minusBtn) {
                minusBtn.addEventListener('click', () => {
                    this.updateQuantity(item.id, item.size, item.quantity - 1);
                });
            }

            if (plusBtn) {
                plusBtn.addEventListener('click', () => {
                    this.updateQuantity(item.id, item.size, item.quantity + 1);
                });
            }

            if (quantityInput) {
                quantityInput.addEventListener('change', (e) => {
                    const newQuantity = parseInt(e.target.value);
                    if (newQuantity >= 1 && newQuantity <= 10) {
                        this.updateQuantity(item.id, item.size, newQuantity);
                    } else {
                        e.target.value = item.quantity;
                    }
                });
            }

            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.removeItem(item.id, item.size);
                });
            }
        } catch (error) {
            console.error('Failed to add cart item listeners:', error);
        }
    }

    updateQuantity(id, size, quantity) {
        try {
            const item = this.cart.find(item => item.id === id && item.size === size);
            if (item) {
                if (quantity <= 0) {
                    this.removeItem(id, size);
                } else {
                    item.quantity = quantity;
                    this.saveCart();
                    this.renderCart();
                    this.calculateTotals();
                }
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    }

    removeItem(id, size) {
        try {
            this.cart = this.cart.filter(item => !(item.id === id && item.size === size));
            this.saveCart();
            this.renderCart();
            this.calculateTotals();
            this.showNotification('Item removed from cart', 'info');
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    }

    calculateTotals() {
        try {
            const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= 750 ? 0 : 50;
            const tax = subtotal * 0.15; // 15% VAT
            let total = subtotal + shipping + tax;

            // Apply coupon discount
            if (this.appliedCoupon) {
                const coupon = this.coupons[this.appliedCoupon];
                if (coupon.type === 'percentage') {
                    total = total * (1 - coupon.discount);
                } else if (coupon.type === 'fixed') {
                    total = Math.max(0, total - coupon.discount);
                }
            }

            // Update UI
            this.updateTotalDisplay(subtotal, shipping, tax, total);
        } catch (error) {
            console.error('Failed to calculate totals:', error);
        }
    }

    updateTotalDisplay(subtotal, shipping, tax, total) {
        try {
            const subtotalEl = document.getElementById('subtotal');
            const shippingEl = document.getElementById('shipping');
            const taxEl = document.getElementById('tax');
            const totalEl = document.getElementById('total');

            if (subtotalEl) subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
            if (shippingEl) shippingEl.textContent = `R${shipping.toFixed(2)}`;
            if (taxEl) taxEl.textContent = `R${tax.toFixed(2)}`;
            if (totalEl) totalEl.textContent = `R${total.toFixed(2)}`;
        } catch (error) {
            console.error('Failed to update total display:', error);
        }
    }

    setupEventListeners() {
        try {
            // Coupon application
            const applyCouponBtn = document.getElementById('applyCoupon');
            const couponCodeInput = document.getElementById('couponCode');
            const couponMessage = document.getElementById('couponMessage');

            if (applyCouponBtn && couponCodeInput) {
                applyCouponBtn.addEventListener('click', () => {
                    this.applyCoupon(couponCodeInput.value.trim());
                });

                couponCodeInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.applyCoupon(couponCodeInput.value.trim());
                    }
                });
            }

            // Checkout button
            const checkoutBtn = document.getElementById('checkoutBtn');
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', () => {
                    this.initiateCheckout();
                });
            }

            // Checkout modal
            this.setupCheckoutModal();
        } catch (error) {
            console.error('Failed to setup event listeners:', error);
        }
    }

    applyCoupon(code) {
        try {
            const couponMessage = document.getElementById('couponMessage');
            
            if (!code) {
                this.showCouponMessage('Please enter a coupon code', 'error');
                return;
            }

            const coupon = this.coupons[code.toUpperCase()];
            if (!coupon) {
                this.showCouponMessage('Invalid coupon code', 'error');
                return;
            }

            this.appliedCoupon = code.toUpperCase();
            this.calculateTotals();
            this.showCouponMessage(coupon.description, 'success');
        } catch (error) {
            console.error('Failed to apply coupon:', error);
        }
    }

    showCouponMessage(message, type) {
        try {
            const couponMessage = document.getElementById('couponMessage');
            if (couponMessage) {
                couponMessage.textContent = message;
                couponMessage.className = `coupon-message ${type}`;
            }
        } catch (error) {
            console.error('Failed to show coupon message:', error);
        }
    }

    initiateCheckout() {
        try {
            if (this.cart.length === 0) {
                this.showNotification('Your cart is empty', 'warning');
                return;
            }

            const checkoutModal = document.getElementById('checkoutModal');
            if (checkoutModal) {
                checkoutModal.style.display = 'block';
                this.setupCheckoutTabs();
            }
        } catch (error) {
            console.error('Failed to initiate checkout:', error);
        }
    }

    setupCheckoutModal() {
        try {
            const checkoutModal = document.getElementById('checkoutModal');
            const checkoutClose = document.getElementById('checkoutClose');

            if (checkoutClose) {
                checkoutClose.addEventListener('click', () => {
                    checkoutModal.style.display = 'none';
                });
            }

            // Close modal when clicking outside
            if (checkoutModal) {
                checkoutModal.addEventListener('click', (e) => {
                    if (e.target === checkoutModal) {
                        checkoutModal.style.display = 'none';
                    }
                });
            }
        } catch (error) {
            console.error('Failed to setup checkout modal:', error);
        }
    }

    setupCheckoutTabs() {
        try {
            const tabButtons = document.querySelectorAll('.checkout-tabs .tab-button');
            const tabContents = document.querySelectorAll('.checkout-tab');

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabName = button.dataset.tab;
                    
                    // Update active tab button
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Update active tab content
                    tabContents.forEach(tab => tab.classList.remove('active'));
                    document.getElementById(`${tabName}Tab`).classList.add('active');
                });
            });

            // Payment method selection handlers
            this.setupPaymentMethods();

            // Next step buttons with validation
            const nextStepBtns = document.querySelectorAll('.next-step');
            nextStepBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const nextTab = btn.dataset.next;
                    
                    // Validate current tab before proceeding
                    if (nextTab === 'payment' && !this.validateShippingTab()) {
                        e.preventDefault();
                        return;
                    }
                    
                    if (nextTab === 'review' && !this.validatePaymentTab()) {
                        e.preventDefault();
                        return;
                    }
                    
                    // If going to review tab, populate it
                    if (nextTab === 'review') {
                        this.populateReviewTab();
                        // Generate order reference for bank transfer
                        this.generateOrderReference();
                    }
                    
                    const nextButton = document.querySelector(`[data-tab="${nextTab}"]`);
                    if (nextButton) {
                        nextButton.click();
                    }
                });
            });

            // Place order button
            const placeOrderBtn = document.getElementById('placeOrderBtn');
            if (placeOrderBtn) {
                placeOrderBtn.addEventListener('click', () => {
                    this.placeOrder();
                });
            }
        } catch (error) {
            console.error('Failed to setup checkout tabs:', error);
        }
    }

    setupPaymentMethods() {
        try {
            const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
            const cardForm = document.getElementById('cardForm');
            const paypalDetails = document.getElementById('paypalDetails');
            const bankDetails = document.getElementById('bankDetails');

            paymentMethods.forEach(method => {
                method.addEventListener('change', () => {
                    const value = method.value;
                    
                    // Hide all payment details
                    if (cardForm) cardForm.style.display = 'none';
                    if (paypalDetails) paypalDetails.style.display = 'none';
                    if (bankDetails) bankDetails.style.display = 'none';
                    
                    // Show selected payment method details
                    if (value === 'card' && cardForm) {
                        cardForm.style.display = 'block';
                        this.setupCardValidation();
                    } else if (value === 'paypal' && paypalDetails) {
                        paypalDetails.style.display = 'block';
                    } else if (value === 'bank' && bankDetails) {
                        bankDetails.style.display = 'block';
                        this.generateOrderReference();
                    }
                });
            });

            // Initialize with default selected method
            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
            if (selectedMethod) {
                selectedMethod.dispatchEvent(new Event('change'));
            }

            // Setup card input formatting
            this.setupCardValidation();
        } catch (error) {
            console.error('Failed to setup payment methods:', error);
        }
    }

    setupCardValidation() {
        try {
            const cardNumber = document.getElementById('cardNumber');
            const expiryDate = document.getElementById('expiryDate');
            const cvv = document.getElementById('cvv');

            // Card number formatting and validation
            if (cardNumber) {
                cardNumber.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\s/g, '');
                    value = value.replace(/\D/g, '');
                    
                    // Format with spaces every 4 digits
                    value = value.match(/.{1,4}/g)?.join(' ') || value;
                    e.target.value = value;
                });

                cardNumber.addEventListener('blur', () => {
                    if (cardNumber.value && !this.validateCardNumber(cardNumber.value)) {
                        cardNumber.style.borderColor = '#e74c3c';
                        this.showFieldError(cardNumber, 'Invalid card number');
                    } else {
                        cardNumber.style.borderColor = '';
                        this.clearFieldError(cardNumber);
                    }
                });
            }

            // Expiry date formatting
            if (expiryDate) {
                expiryDate.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    e.target.value = value;
                });

                expiryDate.addEventListener('blur', () => {
                    if (expiryDate.value && !this.validateExpiryDate(expiryDate.value)) {
                        expiryDate.style.borderColor = '#e74c3c';
                        this.showFieldError(expiryDate, 'Invalid expiry date');
                    } else {
                        expiryDate.style.borderColor = '';
                        this.clearFieldError(expiryDate);
                    }
                });
            }

            // CVV validation
            if (cvv) {
                cvv.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
                });

                cvv.addEventListener('blur', () => {
                    if (cvv.value && (cvv.value.length < 3 || cvv.value.length > 4)) {
                        cvv.style.borderColor = '#e74c3c';
                        this.showFieldError(cvv, 'CVV must be 3-4 digits');
                    } else {
                        cvv.style.borderColor = '';
                        this.clearFieldError(cvv);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to setup card validation:', error);
        }
    }

    validateCardNumber(cardNumber) {
        // Remove spaces
        const cleaned = cardNumber.replace(/\s/g, '');
        
        // Must be 13-19 digits
        if (!/^\d{13,19}$/.test(cleaned)) {
            return false;
        }

        // Luhn algorithm
        let sum = 0;
        let isEven = false;
        
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    validateExpiryDate(expiry) {
        const match = expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!match) return false;
        
        const month = parseInt(match[1]);
        const year = parseInt('20' + match[2]);
        
        if (month < 1 || month > 12) return false;
        
        const now = new Date();
        const expiryDate = new Date(year, month - 1);
        const currentDate = new Date(now.getFullYear(), now.getMonth());
        
        return expiryDate >= currentDate;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.85rem; margin-top: 0.25rem;';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    }

    clearFieldError(field) {
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateShippingTab() {
        try {
            const form = document.querySelector('#shippingTab form');
            if (!form) return true;

            // Check required fields
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#e74c3c';
                    isValid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!isValid) {
                this.showNotification('Please fill in all required shipping information', 'error');
            }

            return isValid;
        } catch (error) {
            console.error('Failed to validate shipping tab:', error);
            return true;
        }
    }

    validatePaymentTab() {
        try {
            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
            if (!selectedMethod) {
                this.showNotification('Please select a payment method', 'error');
                return false;
            }

            const method = selectedMethod.value;

            if (method === 'card') {
                const cardNumber = document.getElementById('cardNumber')?.value.trim();
                const expiryDate = document.getElementById('expiryDate')?.value.trim();
                const cvv = document.getElementById('cvv')?.value.trim();
                const cardName = document.getElementById('cardName')?.value.trim();

                if (!cardNumber || !this.validateCardNumber(cardNumber)) {
                    this.showNotification('Please enter a valid card number', 'error');
                    return false;
                }

                if (!expiryDate || !this.validateExpiryDate(expiryDate)) {
                    this.showNotification('Please enter a valid expiry date (MM/YY)', 'error');
                    return false;
                }

                if (!cvv || cvv.length < 3 || cvv.length > 4) {
                    this.showNotification('Please enter a valid CVV (3-4 digits)', 'error');
                    return false;
                }

                if (!cardName) {
                    this.showNotification('Please enter the name on card', 'error');
                    return false;
                }
            } else if (method === 'paypal') {
                // PayPal will redirect to PayPal for authentication
                // Just confirm selection
                return true;
            } else if (method === 'bank') {
                // Bank transfer just needs acknowledgment
                return true;
            }

            return true;
        } catch (error) {
            console.error('Failed to validate payment tab:', error);
            return false;
        }
    }

    async placeOrder() {
        try {
            // Validate payment method one more time
            if (!this.validatePaymentTab()) {
                // Switch to payment tab if validation fails
                const paymentTab = document.querySelector('[data-tab="payment"]');
                if (paymentTab) paymentTab.click();
                return;
            }

            // Collect payment information
            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
            const paymentMethod = selectedMethod ? selectedMethod.value : 'card';
            
            let paymentDetails = {};
            
            if (paymentMethod === 'card') {
                paymentDetails = {
                    type: 'card',
                    cardNumber: document.getElementById('cardNumber')?.value.trim(),
                    expiryDate: document.getElementById('expiryDate')?.value.trim(),
                    cvv: '***', // Never store full CVV
                    cardName: document.getElementById('cardName')?.value.trim()
                };
                // Mask card number (show only last 4 digits)
                if (paymentDetails.cardNumber) {
                    const cleaned = paymentDetails.cardNumber.replace(/\s/g, '');
                    paymentDetails.cardNumber = '**** **** **** ' + cleaned.slice(-4);
                }
            } else if (paymentMethod === 'paypal') {
                paymentDetails = {
                    type: 'paypal',
                    status: 'pending_redirect'
                };
            } else if (paymentMethod === 'bank') {
                // Generate order reference
                const orderRef = 'ORDER-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6);
                paymentDetails = {
                    type: 'bank_transfer',
                    orderReference: orderRef,
                    status: 'pending_payment'
                };
            }

            // Collect shipping information
            const shippingInfo = {
                firstName: document.getElementById('firstName')?.value.trim(),
                lastName: document.getElementById('lastName')?.value.trim(),
                email: document.getElementById('email')?.value.trim(),
                phone: document.getElementById('phone')?.value.trim(),
                address: document.getElementById('address')?.value.trim(),
                city: document.getElementById('city')?.value.trim(),
                postalCode: document.getElementById('postalCode')?.value.trim(),
                country: document.getElementById('country')?.value,
                shippingMethod: document.querySelector('input[name="shipping"]:checked')?.value
            };

            // Collect order data
            const orderData = {
                orderNumber: 'LAOUD-' + Date.now().toString().slice(-8),
                items: this.cart,
                subtotal: this.calculateSubtotal(),
                shippingCost: this.calculateShipping(),
                tax: this.calculateTax(),
                total: this.calculateTotal(),
                coupon: this.appliedCoupon,
                payment: paymentDetails,
                shippingInfo: shippingInfo,
                timestamp: new Date().toISOString()
            };

            // Show loading state
            const placeOrderBtn = document.getElementById('placeOrderBtn');
            const originalText = placeOrderBtn.innerHTML;
            placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            placeOrderBtn.disabled = true;

            // Process payment based on method
            if (paymentMethod === 'paypal') {
                // In a real implementation, this would redirect to PayPal
                this.showNotification('Redirecting to PayPal...', 'info');
                // Simulate redirect delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                // For demo: simulate successful PayPal payment
                paymentDetails.status = 'completed';
                orderData.payment = paymentDetails;
            } else if (paymentMethod === 'bank') {
                // For bank transfer, show confirmation with details
                this.showNotification('Order confirmed! Please complete bank transfer using the reference provided.', 'info');
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                // Simulate card processing
                await new Promise(resolve => setTimeout(resolve, 2000));
                paymentDetails.status = 'completed';
                orderData.payment = paymentDetails;
            }

            // Store order in localStorage (in real app, this would be sent to server)
            const orders = JSON.parse(localStorage.getItem('laoud_orders') || '[]');
            orders.push(orderData);
            localStorage.setItem('laoud_orders', JSON.stringify(orders));

            // Clear cart
            this.cart = [];
            this.saveCart();

            // Update cart count
            if (window.shop) {
                window.shop.updateCartCount();
            }

            // Close modal
            const checkoutModal = document.getElementById('checkoutModal');
            if (checkoutModal) {
                checkoutModal.style.display = 'none';
            }

            // Show success message with order details
            const successMessage = paymentMethod === 'bank' 
                ? `Order #${orderData.orderNumber} confirmed! Please transfer R${orderData.total.toFixed(2)} using reference: ${paymentDetails.orderReference}. You will receive a confirmation email shortly.`
                : `Order #${orderData.orderNumber} placed successfully! You will receive a confirmation email shortly.`;
            
            this.showNotification(successMessage, 'success');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, paymentMethod === 'bank' ? 4000 : 2500);

        } catch (error) {
            console.error('Failed to place order:', error);
            this.showNotification('Failed to place order. Please try again.', 'error');
        } finally {
            // Reset button state
            const placeOrderBtn = document.getElementById('placeOrderBtn');
            if (placeOrderBtn) {
                placeOrderBtn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
                placeOrderBtn.disabled = false;
            }
        }
    }

    calculateSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    calculateShipping() {
        const subtotal = this.calculateSubtotal();
        return subtotal >= 750 ? 0 : 50;
    }

    calculateTax() {
        return this.calculateSubtotal() * 0.15;
    }

    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        const shipping = this.calculateShipping();
        const tax = this.calculateTax();
        let total = subtotal + shipping + tax;

        if (this.appliedCoupon) {
            const coupon = this.coupons[this.appliedCoupon];
            if (coupon.type === 'percentage') {
                total = total * (1 - coupon.discount);
            } else if (coupon.type === 'fixed') {
                total = Math.max(0, total - coupon.discount);
            }
        }

        return total;
    }

    populateReviewTab() {
        try {
            const reviewItems = document.getElementById('reviewItems');
            const reviewSubtotal = document.getElementById('reviewSubtotal');
            const reviewShipping = document.getElementById('reviewShipping');
            const reviewTax = document.getElementById('reviewTax');
            const reviewTotal = document.getElementById('reviewTotal');

            if (!reviewItems) return;

            // Populate items
            reviewItems.innerHTML = this.cart.map(item => `
                <div class="review-item">
                    <div class="review-item-info">
                        <h5>${item.name}</h5>
                        <p>Size: ${item.size} × ${item.quantity}</p>
                    </div>
                    <div class="review-item-price">
                        R${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `).join('');

            // Populate totals
            const subtotal = this.calculateSubtotal();
            const shipping = this.calculateShipping();
            const tax = this.calculateTax();
            const total = this.calculateTotal();

            if (reviewSubtotal) reviewSubtotal.textContent = `R${subtotal.toFixed(2)}`;
            if (reviewShipping) reviewShipping.textContent = `R${shipping.toFixed(2)}`;
            if (reviewTax) reviewTax.textContent = `R${tax.toFixed(2)}`;
            if (reviewTotal) reviewTotal.textContent = `R${total.toFixed(2)}`;

            // Show payment method info
            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
            if (selectedMethod) {
                const paymentInfo = document.createElement('div');
                paymentInfo.className = 'review-payment-info';
                paymentInfo.style.cssText = 'margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #ddd;';
                
                let paymentText = '';
                if (selectedMethod.value === 'card') {
                    const cardNumber = document.getElementById('cardNumber')?.value.trim();
                    if (cardNumber) {
                        const cleaned = cardNumber.replace(/\s/g, '');
                        paymentText = `Payment: Card ending in ${cleaned.slice(-4)}`;
                    }
                } else if (selectedMethod.value === 'paypal') {
                    paymentText = 'Payment: PayPal';
                } else if (selectedMethod.value === 'bank') {
                    const refElement = document.getElementById('orderReference');
                    paymentText = `Payment: Bank Transfer (Ref: ${refElement?.textContent || 'Pending'})`;
                }
                
                paymentInfo.innerHTML = `<p><strong>${paymentText}</strong></p>`;
                
                // Remove existing payment info if any
                const existing = reviewItems.parentElement.querySelector('.review-payment-info');
                if (existing) existing.remove();
                
                reviewItems.parentElement.appendChild(paymentInfo);
            }
        } catch (error) {
            console.error('Failed to populate review tab:', error);
        }
    }

    generateOrderReference() {
        try {
            const refElement = document.getElementById('orderReference');
            if (refElement) {
                const year = new Date().getFullYear();
                const timestamp = Date.now().toString().slice(-6);
                refElement.textContent = `ORDER-${year}-${timestamp}`;
            }
        } catch (error) {
            console.error('Failed to generate order reference:', error);
        }
    }

    showNotification(message, type) {
        try {
            if (window.laOudApp) {
                window.laOudApp.showNotification(message, type);
            } else {
                alert(message);
            }
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (document.getElementById('cartContainer')) {
            window.cartManager = new CartManager();
        }
    } catch (error) {
        console.error('Failed to initialize cart manager:', error);
    }
});
