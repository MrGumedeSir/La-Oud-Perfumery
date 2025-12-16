// Enhanced Shop Functionality
class LaOudShop {
    constructor() {
        this.products = [];
        // Use a single, consistent storage key across the site
        this.cart = JSON.parse(localStorage.getItem('laoud_cart')) || [];
        // Known image extensions keyed by product slug so we can load the right file type
        this.imageManifest = {
            "bade-e-al-oud-lattafa": ".webp",
            "asad-lattafa": ".webp",
            "khamrah-lattafa": ".webp",
            "ramz-silver-lattafa": ".webp",
            "opulent-oud-lattafa": ".jpg",
            "opulent-musk-lattafa": ".jpg",
            "opulent-blue-lattafa": ".webp",
            "ameer-al-oud-intense-oud-lattafa": ".webp",
            "oud-moon-lattafa": ".webp",
            "mayar-natural-intense-lattafa": ".webp",
            "haya-lattafa": ".jpg",
            "atheeri-lattafa": ".webp",
            "angham-lattafa": ".jpg",
            "eclaire-lattafa": ".webp",
            "teriaq-lattafa": ".webp",
            "maahir-lattafa": ".webp",
            "fahhar-lattafa": ".webp",
            "suave-fragrance-world": ".jpg",
            "tabac-n-coke-fragrance-world": ".webp",
            "cafe-n-cream-fragrance-world": ".webp",
            "aventos-blue-fragrance-world": ".jpeg",
            "tobacco-gourmand-fragrance-world": ".jpg",
            "berries-weekend-pink-edition-fragrance-world": ".webp",
            "toomford-fragrance-world": ".webp",
            "launo-million-fragrance-world": ".jpeg",
            "scandant-by-night-fragrance-world": ".webp",
            "so-nice-fragrance-world": ".webp",
            "lady-friendly-extreme-fragrance-world": ".jpeg",
            "intense-noir-le-parfum-fragrance-world": ".webp",
            "maison-rouge-540-fragrance-world": ".webp",
            "rose-bomb-red-intense-milestone-perfumes": ".jpeg",
            "fifth-change-milestone-perfumes": ".jpg",
            "l-intercode-milestone-perfumes": ".png",
            "intense-rouge-milestone-perfumes": ".jpg",
            "clonous-paris-red-musk-milestone-perfumes": ".jpeg",
            "clonous-royal-santal-milestone-perfumes": ".jpg",
            "clonous-leather-intense-milestone-perfumes": ".jpg",
            "grade-one-milestone-perfumes": ".webp",
            "enjoy-milestone-perfumes": ".webp",
            "moonlight-patchouli-milestone-perfumes": ".jpg",
            "big-noir-milestone-perfumes": ".jpeg",
            "big-intense-milestone-perfumes": ".jpeg",
            "all-yours-homme-sport-milestone-perfumes": ".webp",
            "before-paradise-milestone-perfumes": ".webp",
            "taxco-milestone-perfumes": ".webp",
            "white-floral-milestone-perfumes": ".webp",
            "madam-moiselle-milestone-perfumes": ".webp",
            "petals-milestone-perfumes": ".webp",
            "narcisa-for-her-amber-milestone-perfumes": ".jpg",
            "narcisa-for-her-amour-milestone-perfumes": ".jpg",
            "narcisa-for-her-passion-milestone-perfumes": ".jpg",
            "velvet-collection-desert-oud-milestone-perfumes": ".jpg",
            "velvet-collection-black-intenso-milestone-perfumes": ".jpg",
            "velvet-collection-ambere-sun-milestone-perfumes": ".jpg",
            "velvet-collection-orient-musk-milestone-perfumes": ".jpg",
            "intense-wayfarer-homme-pendora-scents": ".jpg",
            "charuto-tobacco-vanilla-pendora-scents": ".webp",
            "regal-reseire-pendora-scents": ".webp",
            "enchantment-blue-intense-pendora-scents": ".webp",
            "oud-intense-fragrance-deluxe": ".jpeg",
            "niche-leather-fragrance-deluxe": ".webp",
            "di-gio-profound-fragrance-deluxe": ".jpeg",
            "white-oud-pour-homme-fragrance-deluxe": ".jpeg"
        };
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

    // Pick the right extension for a product image based on what we have in /images/products
    resolveImagePath(slug) {
        const ext = this.imageManifest[slug];
        if (ext) {
            return `images/products/${slug}${ext}`;
        }
        return `images/products/${slug}.jpg`;
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

            // Derive category based on brand / type keywords in the line
            const category = this.detectCategory(normalized);

            // Expand variants (A/B/C) into separate SKUs maintaining brand bracket part
            const variantNames = this.expandVariants(namePart);
            for (const variantFullName of variantNames) {
                const name = variantFullName.trim().replace(/\s{2,}/g, ' ');

                // Build placeholder image path from slug
                const slug = this.slugify(name);
                const image = this.resolveImagePath(slug); // prefer a matching image extension

                products.push({
                    id: idCounter++,
                    name,
                    description: "Premium fragrance from our curated collection.",
                    category,
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

    // Detects a category slug (used for filtering) from a catalog line
    detectCategory(text) {
        const t = text.toUpperCase();

        // Helper to normalize to slug values used in the dropdown
        const toSlug = (label) => label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        // 1. Prefer explicit [BRAND] tags
        const bracketMatch = t.match(/\[([^\]]+)\]/);
        if (bracketMatch) {
            const raw = bracketMatch[1].trim();

            if (raw.includes('LATTAFA')) return 'lattafa';
            if (raw.includes('FRAGRANCE WORLD')) return 'fragrance-world';
            if (raw.includes('MILESTONE')) return 'milestone-perfumes';
            if (raw.includes('FRAGRANCE DELUXE')) return 'fragrance-deluxe';
            if (raw.includes('PENDORA SCENTS')) return 'pendora-scents';
            if (raw.includes('EAU DE TOILETTE')) return 'eau-de-toilette';
            if (raw.includes('EAU DE PARFUM') || raw.includes('EUA DE PARFUM')) return 'eau-de-parfum';

            // Fallback: slugify the bracket content
            return toSlug(raw);
        }

        // 2. Look for key phrases in the whole line
        if (t.includes('LATTAFA')) return 'lattafa';
        if (t.includes('FRAGRANCE WORLD')) return 'fragrance-world';
        if (t.includes('MILESTONE')) return 'milestone-perfumes';
        if (t.includes('FRAGRANCE DELUXE')) return 'fragrance-deluxe';
        if (t.includes('PENDORA SCENTS')) return 'pendora-scents';
        if (t.includes('EAU DE TOILETTE')) return 'eau-de-toilette';
        if (t.includes('EAU DE PARFUM') || t.includes('EUA DE PARFUM')) return 'eau-de-parfum';

        // 3. Default catch-all
        return 'other';
    }

    // Load products from provided catalog text
    loadProducts() {
        const rawCatalog = `
BADE'E AL OUD [LATTAFA] – R450
ASAD [LATTAFA] – R380
KHAMRAH [LATTAFA] – R420
RAMZ SILVER [LATTAFA] – R350
OPULENT OUD [LATTAFA] – R380
OPULENT MUSK [LATTAFA] – R380
OPULENT BLUE [LATTAFA] – R380
AMEER AL OUD INTENSE OUD [LATTAFA] – R350
OUD MOON [LATTAFA] – R280
MAYAR NATURAL INTENSE [LATTAFA] – R550
HAYA [LATTAFA] – R480
ATHEERI [LATTAFA] – R550
ANGHAM [LATTAFA] – R520
ECLAIRE [LATTAFA] – R520
TERIAQ [LATTAFA] – R520
MAAHIR [LATTAFA] – R380
FAHHAR [LATTAFA] – R380
FAKHR AL HARAMAIN [LATTAFA] – R420
AL SAHARA [LATTAFA] – R350
YARA [LATTAFA] – R380
ANA ABIYEDH ROUGE [LATTAFA] – R380
SUAVE [FRAGRANCE WORLD] – R350
TABAC N' COKE [FRAGRANCE WORLD] – R450
CAFÉ N' CREAM [FRAGRANCE WORLD] – R450
AVENTOS BLUE [FRAGRANCE WORLD] – R380
TOBACCO GOURMAND [FRAGRANCE WORLD] – R380
BERRIES WEEKEND PINK EDITION [FRAGRANCE WORLD] – R320
TOOMFORD [FRAGRANCE WORLD] – R320
LAUNO MILLION [FRAGRANCE WORLD] – R280
SCANDANT BY NIGHT [FRAGRANCE WORLD] – R280
SO NICE [FRAGRANCE WORLD] – R280
LADY FRIENDLY EXTREME [FRAGRANCE WORLD] – R250
INTENSE NOIR LE PARFUM [FRAGRANCE WORLD] – R450
MAISON ROUGE 540 [FRAGRANCE WORLD] – R250
AFFOGATO [FRAGRANCE WORLD] – R480
FRANCIQUE 63.55 [FRAGRANCE WORLD] – R520
OUDI [FRAGRANCE WORLD] – R280
AL AWSAF [FRAGRANCE WORLD] – R350
BUTHAINA [FRAGRANCE WORLD] – R420
PRIDE ISHQ AL SHUYUKH GOLD [FRAGRANCE WORLD] – R480
ROSE BOMB RED INTENSE [MILESTONE PERFUMES] – R350
FIFTH CHANGE [MILESTONE PERFUMES] – R280
L'INTERCODE [MILESTONE PERFUMES] – R280
INTENSE ROUGE [MILESTONE PERFUMES] – R280
CLONOUS PARIS RED MUSK [MILESTONE PERFUMES] – R320
CLONOUS ROYAL SANTAL [MILESTONE PERFUMES] – R320
CLONOUS LEATHER INTENSE [MILESTONE PERFUMES] – R320
GRADE ONE [MILESTONE PERFUMES] – R280
ENJOY [MILESTONE PERFUMES] – R320
MOONLIGHT PATCHOULI [MILESTONE PERFUMES] – R420
BIG NOIR [MILESTONE PERFUMES] – R380
BIG INTENSE [MILESTONE PERFUMES] – R380
ALL YOURS HOMME SPORT [MILESTONE PERFUMES] – R280
BEFORE PARADISE [MILESTONE PERFUMES] – R220
TAXCO [MILESTONE PERFUMES] – R280
WHITE FLORAL [MILESTONE PERFUMES] – R280
MADAM MOISELLE [MILESTONE PERFUMES] – R280
PETALS [MILESTONE PERFUMES] – R320
NARCISA FOR HER AMBER [MILESTONE PERFUMES] – R220
NARCISA FOR HER AMOUR [MILESTONE PERFUMES] – R220
NARCISA FOR HER PASSION [MILESTONE PERFUMES] – R220
VELVET COLLECTION DESERT OUD [MILESTONE PERFUMES] – R350
VELVET COLLECTION BLACK INTENSO [MILESTONE PERFUMES] – R350
VELVET COLLECTION AMBERE SUN [MILESTONE PERFUMES] – R350
VELVET COLLECTION ORIENT MUSK [MILESTONE PERFUMES] – R350
INTENSE WAYFARER HOMME [PENDORA SCENTS] – R350
CHARUTO TOBACCO VANILLA [PENDORA SCENTS] – R320
REGAL RESEIRE [PENDORA SCENTS] – R320
ENCHANTMENT BLUE INTENSE [PENDORA SCENTS] – R280
OUD INTENSE [FRAGRANCE DELUXE] – R320
NICHE LEATHER [FRAGRANCE DELUXE] – R320
DI GIO PROFOUND [FRAGRANCE DELUXE] – R350
WHITE OUD POUR HOMME [FRAGRANCE DELUXE] – R320
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
                    if (max && max < 999999) {
                        // Use inclusive bounds - products at boundaries may appear in adjacent ranges
                        return p.price >= min && p.price <= max;
                    } else {
                        // For "R550+" type ranges
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