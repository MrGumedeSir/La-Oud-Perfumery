// Enhanced Shop Functionality
class LaOudShop {
    constructor() {
        this.products = [];
        // Use a single, consistent storage key across the site
        this.cart = JSON.parse(localStorage.getItem('laoud_cart')) || [];
        this.filters = {
            category: 'all',
            price: 'all',
            sort: 'name'
        };
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.updateCartCount();
        this.setupImageLoading();
    }

    // Utility: generate a URL-friendly slug for image placeholder paths
    slugify(text) {
        return String(text)
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase();
    }

    // Utility: expand variants like "HER/HIM" or "OUD/MUSK/BLUE" before the brand tag
    expandVariants(fullName) {
        // Split into "namePart [brand]" if present
        const brandMatch = fullName.match(/\s*(.+?)\s*(\[[^\]]+\].*)?$/);
        if (!brandMatch) return [fullName.trim()];
        const namePart = (brandMatch[1] || '').trim();
        const brandPart = (brandMatch[2] || '').trim();

        // If no "/" present, return as-is
        if (!namePart.includes('/')) return [fullName.trim()];

        // Expand each segment separated by "/"
        const segments = namePart.split('/').map(s => s.trim()).filter(Boolean);
        // Preserve any trailing qualifiers after the variant group, e.g., "FOR", "HOMME"
        // This heuristic: take common prefix before the first variant token by finding last space before the first slash
        const firstSlashIdx = namePart.indexOf('/');
        const lastSpaceBeforeSlash = namePart.lastIndexOf(' ', firstSlashIdx);
        const commonPrefix = lastSpaceBeforeSlash > -1 ? namePart.slice(0, lastSpaceBeforeSlash + 1) : '';
        const remainderAfterPrefix = lastSpaceBeforeSlash > -1 ? namePart.slice(lastSpaceBeforeSlash + 1) : namePart;
        const hasExplicitPrefix = commonPrefix.trim().length > 0;

        // If we have a detectable prefix (e.g., "FOR "), rebuild as "<prefix><variant>"
        if (hasExplicitPrefix) {
            return segments.map(variant => `${(commonPrefix + variant).trim()} ${brandPart}`.trim());
        }

        // Otherwise, build plain variants with brand
        return segments.map(variant => `${variant} ${brandPart}`.trim());
    }

    // Parse the provided free-form catalog list into product objects
    parseCatalog(raw) {
        const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        const products = [];
        let idCounter = 1;

        for (const line of lines) {
            // Ignore headings like "PERFUME OILS:" etc.
            if (/^(perfume oils|images:?)\b/i.test(line)) continue;

            // Normalize dash and currency markers
            const normalized = line
                .replace(/^•\s*/, '')                  // remove bullet
                .replace(/\s+–\s+/g, ' - ')            // en dash to hyphen
                .replace(/\s+—\s+/g, ' - ')            // em dash to hyphen
                .replace(/\s+-\s+/g, ' - ')            // spaces around hyphen
                .replace(/R\s*(\d+)/gi, 'R$1')         // compact "R 350" to "R350"
                .replace(/\s{2,}/g, ' ')               // collapse spaces
                .trim();

            // Find price "R<number>"
            const priceMatch = normalized.match(/R(\d+)\b/);
            if (!priceMatch) continue; // skip lines without a price
            const price = parseInt(priceMatch[1], 10);

            // Name is before the " - R" delimiter or before price if delimiter missing
            let namePart = normalized;
            const delimIdx = normalized.indexOf(' - R');
            if (delimIdx !== -1) {
                namePart = normalized.slice(0, delimIdx).trim();
            } else {
                // fallback: take substring before "R<digits>"
                const rIdx = normalized.indexOf('R' + priceMatch[1]);
                if (rIdx > 0) namePart = normalized.slice(0, rIdx).trim();
            }

            // Expand variants (A/B/C) into separate SKUs maintaining brand bracket part
            const variantNames = this.expandVariants(namePart);
            for (const variantFullName of variantNames) {
                const name = variantFullName.trim().replace(/\s{2,}/g, ' ');

                // Build placeholder image path from slug
                const slug = this.slugify(name);
                const image = `images/products/${slug}.jpg`; // user will add matching images

                products.push({
                    id: idCounter++,
                    name,
                    description: "Premium fragrance from our curated collection.",
                    category: "general",
                    price,
                    originalPrice: null,
                    image,
                    sizes: ["50ml", "100ml"],
                    rating: 4.7,
                    reviews: 0,
                    inStock: true,
                    features: ["Long-lasting", "Great value", "Customer favorite"]
                });
            }
        }

        return products;
    }

    // Load products from provided catalog text
    loadProducts() {
        const rawCatalog = `
BADE'EAL OUD [LATTAFA] – R650
ASAD [LATTAFA] – R450
RAMZ [LATTAFA] – R500
HIS/HER CONFESSION [LATTAFA] – R550
MAAHIR [LATTAFA] – R500
KHAMRAH QAHWA [LATTAFA] – R750
FAHHAR [LATTAFA] – R500
HAWAS FOR HER/HIM – R800
OPULENT OUD/MUSK/BLUE [LATTAFA] – R450
KHUMAR [EAU DE PARFUM] – R380
CAFÉ/WHISKEY/ZANZIBAR – R320
GENIUS BLUSH/GENIUS ROSE – R450
Genius VICTORY/RANGER/SPORT CODE/SO GENIUS – R0
ARABIA EAU DE PARFUM – R450
9AM/9PM [AFAN] – R850
INTIMIDATION [EAU DE PARFUM] – R380
MIDDAY SWIM – R350
NICHE LEATHER [FRAGRANCE DELUXE] – R350
TOOL BOX [EAU DE TOILETTE] – R350
SUAVE [FRAGRANCE WORLD] – R380
MINISTER OF OUD [EXTROITDE PARFUM] – R380
OUD SAFFRON NICHE [EAU DE PARFUM] – R400
OUD MOON [LATTAFA] – R250
BONITA POUR FEMME – R350
OUD AL LAYL [ARABIYAT] – R450
OUD MOON 100ml – R600
AMEER AL OUD [LATTAFA] INTENSE GOLD – R550
OUD KHUSUSI AL FARES – R400
MAISON EAU DE PARFUM [BARAKKAT] – R350
HAYA [LATTAFA] – R650
HABIK – R600
MARSHMELLO BLUSH – R800
ATHEERI [LATTAFA] – R800
ESSENCE DE BLANC [EAU DE PARFUM] – R600
INTENSE [TERIAQ] – R650
ANGHAM [LATTAFA] – R700
ECLAIRE [LATTAFA] – R700
TERIAQ [LATTAFA] – R700
PETALS MILESTONES PERFUMES [EAU DE PARFUM] – R350
EQUATOR BLAC – R500
LADY PRESIDENTE [EAU DE PARFUM] – R350
MAYAR [LATTAFA] NATURAL INTENSE – R680
ROSE BOMB [MILESTONE PERFUMES] RED INTENSE – R400
ASDAAF AMEERAT AL ARAB (PRIVATE ROSE) [EAU DE PARFUM] – R400
HER BRAVERY ELIXIR [EAU DE PARFUM] – R350
SURF POUR HOMME – R150
EXTREME GENTLEMAN [ELITE BRANDS INTERNATIONAL] – R180
EPIC ADVENTURE [EAU DE TOILETTE] MAN – R400
OUD INTENSE [FRAGRANCE DELUXE] – R350
OUD INTENSITY OUD AL FARES EMPER [EAU DE PARFUM] – R300
TABAC N' COKE/ CAFÉ N' CREAM [FRAGRANCE WORLD] – R600
INTENSE NOIR LE PARFUM [EAU DE PARFUM] – R550
MICADO EAU DE BLANC [AMARAN PARFUMS] – R150
HAYA EMPER [EAU DE PARFUM] – R300
WHITE OUD PARFUM 50ml – R150
SCENT OF INDIVIDUALITY BEST DARK OUD [EAU DE PARFUM] – R380
BERRIES WEEKEND PINK EDITION [FRAGRANCE WORLD] – R350
FIFTH CHANGE EAU DE PARFUM [MILESTONE PERFUMES] – R330
MAIWAY [EAU DE PARFUM] FRAGRANCE DELUXE – R340
PEACH BLAS [EAU DE PARFUM] – R420
AWAY [EAU DE PARFUM] – R340
E’COSTA [EAU DE PARFUM] – R300
ESPADA AZUL/PRIME/ORO – R200
OPULENT DUBAI [LATTAFA] EAU DE PARFUM – R550
VERSUS BRIGHT CRYSTAL [EAU DE PARFUM] – R320
MADAM MOISELLE MILESTONE PERFUME [EAU DE PARFUM] – R330
LADY FRIENDLY EXTREME [FRAGRANCE WORLD] – R200
VICTORY PARADISE MARINA [EAU DE PARFUM] – R320
INTENSE WAYFARER Homme [PENDORA SCENTS] – R400
CHARUTO TOBBACCO VANILLA [PENDORA SCENTS] – R350
TOBACCO GOURMAND [FRAGRANCE WORLD] – R400
REGAL RESEIRE [PENDORA SCENTS] – R380
NIGHT EFFECT LA ILAT AL FARES – R450
L’INTERCODE EAU DE PARFUM [MILESTONE PERFUMES] – R330
INTENSE ROUGE EAU DE PARFUM [MILESTONE PERFUMES] – R330
CLONOUS PARIS RED MUSK/ ROYAL SANTAL/LEATHER INTENSE [MILESTONE PERFUMES] – R380
AVENTOS BLUE FOR HIM [FRAGRANCE WORLD] EAU DE PARFUM +FREE SPRAY – R450
ENCHANTMENT BLUE INTENSE [PENDORA SCENTS] – R300
DI GIO [FRAGRANCE DELUXE] PROFOUND – R400
LAUNO MILLION EUA DE PARFUM [FRAGRANCE WORLD] – R320
INTENSE MAN [EAU DE PARFUM] – R350
GRADE ONE MILESTONE PERFUMES – R330
NO.4 AFTER LOVE [EAU DE PARFUM] – R380
ENJOY EAU DE PARFUM [MILESTONE] – R350
WHITRE OUD POUR HOMME [FRAGRANCE DELUXE] – R350
MOONLIGHT PAT CHOULI MILESTONE PERFUMES [EAU DE PARFUM] – R500
BIG NOIR/INTENSE [MILESTONE PERFUMES] – R450
FALCON MARBRE/ JASPER/ BLACK COAL [LE FALCONE PERFUMES] – R0
YES! MAYSON LEGEND [EAU DE PARFUM] – R300
ALL YOURS HOMME SPORT [MILESTONE PERFUMES] – R330
VAMOS LEATHER [ELITE BRANDS] – R350
TOOMFORD EAU DE PARFUM [FRAGRANCE WORLD] – R350
FLORENCE HAYAATI – R450
VINTAGE RADIO [LATTAFA PRIDE] – R700
OUT OF ARABIA I/II/III [LATTAFA PRIDE] – R700
BROWN ORCHID OUD EDITION [EAU DE PARFUM] – R350
BROWN ORCHID ROSE EDITION [EAU DE PARFUM] – R300
MONARCH PARIS TOBACCO VANILLA/INSTANT GOLD RUSH [EAU DE PARFUM] – R330
SCANDANT BY NIGHT/ SO NICE [FRAGRANCE WORLD] – R330
MOUSUF RAMADI/ WARDI [EAU DE PARFUM] – R300
NARCISA FOR HER AMBER/AMOUR/ PASSION [MILESTONE PERFUMES] – R200
VELVET COLLECTION DESERT OUD/ BLACK INTENSO/ AMBERE SUN/ ORIENT MUSK [MILESTONE PERFUMES] – R400
UNPLUGGED EMPER POUR HOMME/ WITH YOU/ STRONGER WITH/ EVENT – R450
TUSCANY LEATHER/ RED CHERRY/ SUMMER BEACH/ CERISE ROUGE [EAU DE PARFUM] – R380
KING FABULOUS/ FANTASTIC [EAU DE PARFUM] – R300
LEGEND ARABIA/INTENSE/POUR HOMME [EAU DE PARFUM] EMPER – R380
MONARCH PARIS GOLD INTENSE GOLD/ VANILLA ROSE [EAU DE PARFUM] – R330
PHILOS ROSSO [EAU DE PARFUM] – R330
STRINGS POUR HOMME /FEMME – R200
MICADO PURPLE [AMARAN PERFUMES] LOVE SPELL – R150
ARABIA [EAU DE PARFUM] – R400
MADAME POUR FEMME/ EXPLORER POUR HOMME – R400
TAXCO [EAU DE PARFUM] MILESTONE PERFUMES – R300
LATTAFA PRIDE LA COLLECTION D’ ABTIQUITY 1886 – R500
BEFORE PARADISE [MILESTONE PERFUMES] – R180
VERSATILE LYLA BLANC LONDON [EAU DE PARFUM] – R50
OPERA NIGHTFALL LE’ CHAMEAU [EAU DE PARFUM] – R350
DAR AL SHABAAB [EAU DE PARFUM] – R350
SKY POUR HOMME [MIRADA] ELITE BRANDS INTERNATIONAL – R180
SECRETS OF DIANA/ ARNIA/ ATHENS [EAU DE PARFUM] – R420
WHITE FLORAL [MILESTONE PERFUMES] EAU DE PARFUM – R300
MOUJ GARDENS/ RED ROCKS/ IEEAGE [EAU DE PARFUM] – R330
ARABIAN ROSE PRIVE EMPER [EUA DE PARFUM] – R280
VICTORIOUS [EAU DE PARFUM] – R120
HONOUR AND GLORY BYDE’E AL OUD PERFUMED SPRAY [LATTAFA] – R100
SWEET OUD/ ALLURTIVE HOMME SPORT [BODY PHILOSOPHY] – R100
BROWN ORCHID AMETHYST PERFUMED SPRAY – R100
MAAHIR /OUD FOR GLORY/ SUBLIME/ MAYAR PERFUMED SPRAY – R100
LADY PRESEDENTE POUR FEMME PERFUMED SPRAY [EMPER] – R100
LEGEND POUR HOMME FEMME PERFUMED SPRAY [EMPER] – R100
[LATTAFA] KHAMAR/ EMAAN/ SAKEENA – R180
[FRAGRANCE WORLD] SUAVE/ INTENSE NOIR LE PARFUM – R180
[LATTAFA] KHAMRAH/ EMAAN/ SAKEENA – R180
WARDI [MOUSUF] ARD AL ZAAFARAN – R180
OPHYLIA [EAU DE PARFUM] – R180
ARDAL ZAAFARAN [AMEERAT AL ARAB] – R180
MAISON FRAGRANCE WORLD [BARSKKAT] ROUGE 540 50ML – R180
NAUGHTY GIRL [EAU DE PARFUM] BLOOMING BLUE/ MILES IN GOLD – R50
EMPER SO GENIUS/ EVENT/ GENIUS/ GENIUS ROSE 25 ML – R100
ARAB LE CHAMEAU THE BEAUTY [EAU DE PARFUM] – R100
ARABIA MADAME POUR FEMME [LE CHAMEAU] – R100
WHITE OUD CONDERNTRATED PERFUME 6ML – R45
[AL BADAR] BLACK OUD KING PERFUMES – R45
[AL-REHAB] CROWN PERFUMES SECRET MAN/LOVELY/U2/ MAN/ SUPERMAN/ DAKAR – R45
        `;

        this.products = this.parseCatalog(rawCatalog);
        this.renderProducts();
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('priceFilter')?.addEventListener('change', (e) => {
            this.filters.price = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sortBy')?.addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.applyFilters();
        });

        // Modal controls
        document.getElementById('modalClose')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on backdrop click
        document.getElementById('productModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'productModal') {
                this.closeModal();
            }
        });

        // Close modal on escape key (handled in openModal for better focus management)
    }

    setupImageLoading() {
        // Add image loading functionality
        const images = document.querySelectorAll('.product-image img');
        images.forEach(img => {
            const container = img.closest('.product-image');
            container.classList.add('loading');
            
            img.onload = () => {
                container.classList.remove('loading');
                container.classList.add('loaded');
            };
            
            img.onerror = () => {
                container.classList.remove('loading');
                container.classList.add('error');
            };
        });
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const spinner = document.getElementById('loadingSpinner');
        
        if (!grid) return;

        // Show loading spinner
        if (spinner) {
            spinner.style.display = 'block';
        }

        // Simulate loading delay for better UX
        setTimeout(() => {
            let filteredProducts = [...this.products];

            // Apply filters
            if (this.filters.category !== 'all') {
                filteredProducts = filteredProducts.filter(p => p.category === this.filters.category);
            }

            if (this.filters.price !== 'all') {
                const [min, max] = this.filters.price.split('-').map(Number);
                filteredProducts = filteredProducts.filter(p => {
                    if (max) {
                        return p.price >= min && p.price <= max;
                    } else {
                        return p.price >= min;
                    }
                });
            }

            // Apply sorting
            filteredProducts.sort((a, b) => {
                switch (this.filters.sort) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'price-low':
                        return a.price - b.price;
                    case 'price-high':
                        return b.price - a.price;
                    case 'newest':
                        return b.id - a.id;
                    default:
                        return 0;
                }
            });

            // Render products
            if (filteredProducts.length === 0) {
                grid.innerHTML = `
                    <div class="no-products" role="status" aria-live="polite">
                        <i class="fas fa-search" aria-hidden="true"></i>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters to find what you're looking for.</p>
                    </div>
                `;
            } else {
                grid.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');
                
                // Announce results to screen readers
                const announcement = document.createElement('div');
                announcement.setAttribute('role', 'status');
                announcement.setAttribute('aria-live', 'polite');
                announcement.className = 'sr-only';
                announcement.textContent = `Showing ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`;
                document.body.appendChild(announcement);
                setTimeout(() => announcement.remove(), 1000);
            }

            // Hide loading spinner
            if (spinner) {
                spinner.style.display = 'none';
            }

            // Setup image loading for new products
            this.setupImageLoading();
            this.setupProductInteractions();

        }, 500);
    }

    createProductCard(product) {
        const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        return `
            <article class="product-card" data-product-id="${product.id}" role="listitem">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.parentElement.classList.add('error')">
                    ${discount > 0 ? `<div class="product-sale" aria-label="${discount} percent discount">-${discount}%</div>` : ''}
                    <div class="product-overlay">
                        <button class="btn btn-primary" onclick="shop.openModal(${product.id})" aria-label="View details for ${product.name}">
                            View Details
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-rating" aria-label="Rating: ${product.rating} out of 5 stars">
                        <div class="stars" aria-hidden="true">
                            ${this.generateStars(product.rating)}
                        </div>
                        <span class="rating-text">(${product.reviews} reviews)</span>
                    </div>
                    <div class="product-pricing">
                        <span class="current-price">R${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price" aria-label="Original price R${product.originalPrice}">R${product.originalPrice}</span>` : ''}
                    </div>
                    <div class="product-sizes" role="group" aria-label="Available sizes">
                        ${product.sizes.map((size, index) => `
                            <button class="size-btn ${index === 0 ? 'selected' : ''}" data-size="${size}" aria-pressed="${index === 0 ? 'true' : 'false'}" aria-label="Select size ${size}">${size}</button>
                        `).join('')}
                    </div>
                    <button class="btn btn-primary" onclick="shop.addToCart(${product.id})" ${!product.inStock ? 'disabled aria-disabled="true"' : ''} aria-label="${product.inStock ? `Add ${product.name} to cart` : 'Product out of stock'}">
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </article>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    setupProductInteractions() {
        // Size selection
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    }

    openModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('productModal');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) return;

        const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        modalBody.innerHTML = `
            <div class="modal-product">
                <div class="modal-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="modal-details">
                    <h2 id="modal-title">${product.name}</h2>
                    <p class="modal-description">${product.description}</p>
                    <div class="modal-rating">
                        <div class="stars" aria-label="Rating: ${product.rating} out of 5 stars">
                            ${this.generateStars(product.rating)}
                        </div>
                        <span class="rating-text">${product.rating}/5 (${product.reviews} reviews)</span>
                    </div>
                    <div class="modal-pricing">
                        <span class="current-price">R${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">R${product.originalPrice}</span>` : ''}
                    </div>
                    <div class="modal-sizes">
                        <label for="modal-size-select">Size:</label>
                        <div class="size-options" role="group" aria-labelledby="modal-size-select">
                            ${product.sizes.map((size, index) => `
                                <button class="size-btn ${index === 0 ? 'selected' : ''}" data-size="${size}" aria-pressed="${index === 0 ? 'true' : 'false'}" aria-label="Select size ${size}">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-quantity">
                        <label for="quantityInput">Quantity:</label>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="shop.updateQuantity(-1)" aria-label="Decrease quantity">-</button>
                            <input type="number" class="quantity-input" value="1" min="1" max="10" id="quantityInput" aria-label="Quantity">
                            <button class="quantity-btn" onclick="shop.updateQuantity(1)" aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                    <button class="btn btn-primary modal-add-to-cart" onclick="shop.addToCartFromModal(${product.id})" ${!product.inStock ? 'disabled aria-disabled="true"' : ''} aria-label="${product.inStock ? `Add ${product.name} to cart` : 'Product out of stock'}">
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <div class="modal-features">
                        ${product.features.map(feature => `
                            <div class="feature">
                                <i class="fas fa-check" aria-hidden="true"></i>
                                <span>${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus management - trap focus in modal
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (firstFocusable) {
            firstFocusable.focus();
        }

        // Trap focus within modal and handle escape key
        const handleModalKeydown = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                return;
            }
            
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        };
        
        modal.addEventListener('keydown', handleModalKeydown);
        
        // Store handler for cleanup
        modal._modalKeydownHandler = handleModalKeydown;

        // Setup modal interactions
        modalBody.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modalBody.querySelectorAll('.size-btn').forEach(b => {
                    b.classList.remove('selected');
                    b.setAttribute('aria-pressed', 'false');
                });
                e.target.classList.add('selected');
                e.target.setAttribute('aria-pressed', 'true');
            });
        });
    }

    closeModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            // Remove event listener
            if (modal._modalKeydownHandler) {
                modal.removeEventListener('keydown', modal._modalKeydownHandler);
                delete modal._modalKeydownHandler;
            }
            
            modal.setAttribute('aria-hidden', 'true');
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Return focus to the element that opened the modal
            const previouslyFocused = document.querySelector('.product-card button:focus, .product-overlay button:focus');
            if (previouslyFocused) {
                previouslyFocused.focus();
            } else {
                // Fallback: focus first product card button
                const firstProductButton = document.querySelector('.product-card button');
                if (firstProductButton) {
                    firstProductButton.focus();
                }
            }
        }
    }

    updateQuantity(change) {
        const input = document.getElementById('quantityInput');
        if (input) {
            const currentValue = parseInt(input.value) || 1;
            const newValue = Math.max(1, Math.min(10, currentValue + change));
            input.value = newValue;
        }
    }

    addToCart(productId, size = null, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.inStock) return;

        const cartItem = {
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size || product.sizes[0],
            quantity: quantity
        };

        // Check if item already exists in cart
        const existingItem = this.cart.find(item => 
            item.id === productId && item.size === cartItem.size
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push(cartItem);
        }

        this.saveCart();
        this.updateCartCount();
        this.showCartNotification();
    }

    addToCartFromModal(productId) {
        const selectedSize = document.querySelector('.modal-details .size-btn.selected');
        const quantity = parseInt(document.getElementById('quantityInput')?.value) || 1;
        
        this.addToCart(
            productId, 
            selectedSize?.dataset.size || this.products.find(p => p.id === productId)?.sizes[0],
            quantity
        );
        
        this.closeModal();
    }

    saveCart() {
        // Persist using the same key the cart page expects
        localStorage.setItem('laoud_cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.getElementById('cartCount');
        const cartLink = document.getElementById('cartLink');
        
        if (cartCount) {
            cartCount.textContent = count;
        }
        
        if (cartLink) {
            cartLink.setAttribute('aria-label', `Shopping cart with ${count} items`);
        }
    }

    showCartNotification() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.setAttribute('aria-atomic', 'true');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle" aria-hidden="true"></i>
                <span>Item added to cart!</span>
            </div>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            font-weight: 600;
        `;
        
        document.body.appendChild(notification);
        
        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = 'Item added to cart';
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
                if (announcement.parentNode) {
                    announcement.remove();
                }
            }, 300);
        }, 2000);
    }

    applyFilters() {
        this.renderProducts();
    }
}

// Initialize shop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shop = new LaOudShop();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);