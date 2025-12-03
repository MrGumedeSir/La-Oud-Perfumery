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

            // Next step buttons
            const nextStepBtns = document.querySelectorAll('.next-step');
            nextStepBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const nextTab = btn.dataset.next;
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

    async placeOrder() {
        try {
            // Collect order data
            const orderData = {
                items: this.cart,
                subtotal: this.calculateSubtotal(),
                shipping: this.calculateShipping(),
                tax: this.calculateTax(),
                total: this.calculateTotal(),
                coupon: this.appliedCoupon,
                timestamp: new Date().toISOString()
            };

            // Show loading state
            const placeOrderBtn = document.getElementById('placeOrderBtn');
            const originalText = placeOrderBtn.innerHTML;
            placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            placeOrderBtn.disabled = true;

            // Simulate order processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Clear cart
            this.cart = [];
            this.saveCart();

            // Close modal
            const checkoutModal = document.getElementById('checkoutModal');
            checkoutModal.style.display = 'none';

            // Show success message
            this.showNotification('Order placed successfully! You will receive a confirmation email shortly.', 'success');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

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
