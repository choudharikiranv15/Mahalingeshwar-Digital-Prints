// Mahalingeshwar Digital Prints & Gifts - Beautiful Footer & Customer Form Integration
// Features: Working theme toggle, beautiful footer, customer form before WhatsApp order

// Emergency preloader timeout
(function() {
    setTimeout(function() {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('fade-out')) {
            preloader.classList.add('fade-out');
            setTimeout(() => preloader && (preloader.style.display = 'none'), 500);
        }
    }, 2000);
})();

// Application Data
const APP_DATA = {
    company: {
        name: "Mahalingeshwar Digital Prints & Gifts",
        tagline: "Your Vision, Our Precision",
        description: "Premium digital printing services and personalized gifts with cutting-edge technology since 2020. We specialize in high-quality custom printing solutions for businesses and individuals.",
        phone: "+91 9876543210",
        whatsapp: "+91 76191 47647",
        email: "info@mahalingeshwarprints.com",
        address: "123 Digital Plaza, MG Road, Bangalore, Karnataka 560001",
        hours: "Mon-Sat: 9:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM",
        established: "2020",
        certifications: ["ISO 9001:2015 Certified", "GST Registered"]
    },
    offers: [
        {
            id: "bulk-discount",
            title: "30% OFF Bulk Orders",
            description: "Save big on orders of 50+ pieces",
            discount: "30%",
            condition: "50+ pieces",
            icon: "📦",
            gradient: "var(--gradient-primary)"
        },
        {
            id: "buy2get1",
            title: "Buy 2 Get 1 FREE",
            description: "Special offer on photo prints",
            discount: "33%",
            condition: "Photo prints only",
            icon: "📸",
            gradient: "var(--gradient-secondary)"
        },
        {
            id: "free-delivery",
            title: "FREE Delivery",
            description: "On orders above ₹1000",
            discount: "FREE",
            condition: "₹1000+ orders",
            icon: "🚚",
            gradient: "var(--gradient-tertiary)"
        },
        {
            id: "festival-special",
            title: "Festival Special",
            description: "25% off on custom gifts",
            discount: "25%",
            condition: "Custom gifts",
            icon: "🎁",
            gradient: "var(--gradient-quaternary)"
        }
    ],
    categories: [
        {
            id: "digital-printing",
            name: "Digital Printing",
            description: "High-quality digital printing services",
            icon: "📸",
            gradient: "var(--gradient-primary)"
        },
        {
            id: "personalized-gifts",
            name: "Personalized Gifts",
            description: "Custom gifts for every occasion",
            icon: "🎁",
            gradient: "var(--gradient-secondary)"
        },
        {
            id: "business-materials",
            name: "Business Materials",
            description: "Professional business printing solutions",
            icon: "💼",
            gradient: "var(--gradient-tertiary)"
        },
        {
            id: "canvas-wall-art",
            name: "Canvas & Wall Art",
            description: "Transform photos into stunning wall art",
            icon: "🖼️",
            gradient: "var(--gradient-quaternary)"
        },
        {
            id: "custom-apparel",
            name: "Custom Apparel",
            description: "Personalized clothing and accessories",
            icon: "👕",
            gradient: "var(--gradient-secondary)"
        }
    ],
    products: [
        {
            id: "photo-print-4x6",
            name: "Custom Photo Prints 4x6",
            price: 15,
            originalPrice: 20,
            rating: 4.8,
            reviews: 245,
            description: "High-quality photo printing on premium glossy paper with vibrant colors and sharp details. Perfect for memories and gifts.",
            icon: "📷",
            gradient: "var(--gradient-primary)",
            featured: true
        },
        {
            id: "custom-mug",
            name: "Custom Printed Ceramic Mug",
            price: 299,
            originalPrice: 399,
            rating: 4.9,
            reviews: 189,
            description: "Personalized ceramic mug with your photos and messages. Dishwasher safe, premium quality ceramic material.",
            icon: "☕",
            gradient: "var(--gradient-secondary)",
            featured: true
        },
        {
            id: "business-cards",
            name: "Premium Business Cards",
            price: 299,
            originalPrice: 399,
            rating: 4.7,
            reviews: 156,
            description: "Professional business cards with premium finishing options. Free design assistance and quick turnaround time.",
            icon: "💼",
            gradient: "var(--gradient-tertiary)",
            featured: true
        },
        {
            id: "canvas-print",
            name: "Canvas Print A4 Size",
            price: 699,
            originalPrice: 899,
            rating: 4.8,
            reviews: 98,
            description: "Gallery-quality canvas print ready to hang. Perfect for home and office decoration with fade-resistant inks.",
            icon: "🖼️",
            gradient: "var(--gradient-quaternary)",
            featured: true
        },
        {
            id: "custom-tshirt",
            name: "Custom Printed T-Shirt",
            price: 599,
            originalPrice: 799,
            rating: 4.6,
            reviews: 234,
            description: "Premium cotton t-shirt with your custom design. Available in all sizes and colors with fade-resistant printing.",
            icon: "👕",
            gradient: "var(--gradient-secondary)",
            featured: false
        },
        {
            id: "photo-frame",
            name: "Wooden Photo Frame",
            price: 399,
            originalPrice: 499,
            rating: 4.5,
            reviews: 67,
            description: "Beautiful wooden photo frame with custom engraving options. Premium wood quality with elegant finishing.",
            icon: "🖼️",
            gradient: "var(--gradient-quaternary)",
            featured: false
        }
    ],
    services: [
        {
            name: "Custom Design",
            description: "Professional graphic design services for all your printing needs",
            icon: "🎨",
            color: "#A855F7"
        },
        {
            name: "Bulk Orders",
            description: "Special rates and quick processing for large quantity orders",
            icon: "📦",
            color: "#EC4899"
        },
        {
            name: "Quick Delivery",
            description: "Same-day and next-day delivery options available in Bangalore",
            icon: "🚚",
            color: "#06B6D4"
        },
        {
            name: "Quality Assured",
            description: "Premium materials and state-of-the-art printing technology",
            icon: "🏆",
            color: "#10B981"
        }
    ],
    testimonials: [
        {
            name: "Priya Sharma",
            rating: 5,
            text: "Amazing quality prints! The wedding photo album came out perfect. Fast delivery and excellent customer service.",
            service: "Wedding Photo Album",
            location: "Bangalore",
            gradient: "var(--gradient-primary)"
        },
        {
            name: "Rajesh Kumar",
            rating: 5,
            text: "Professional business cards with great finishing. The team helped with design and delivered on time.",
            service: "Business Cards",
            location: "Mumbai",
            gradient: "var(--gradient-secondary)"
        },
        {
            name: "Anita Patel",
            rating: 5,
            text: "Ordered custom mugs for our office team. Everyone loved them! Great quality and reasonable prices.",
            service: "Custom Mugs",
            location: "Pune",
            gradient: "var(--gradient-tertiary)"
        }
    ]
};

// Application State
const AppState = {
    theme: 'light',
    cart: [],
    cartOpen: false,
    customerFormOpen: false
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Mahalingeshwar Ecommerce Platform...');
    
    try {
        initPreloader();
        initThemeToggle();
        initNavigation();
        initSearch();
        initCart();
        initCustomerForm();
        initProductDisplay();
        initScrollAnimations();
        initNewsletter();
        loadCartFromStorage();
        
        console.log('Platform initialization complete');
    } catch (error) {
        console.error('Initialization error:', error);
        hidePreloader();
    }
});

// Preloader Management
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.querySelector('.loading-progress');
    
    if (!preloader) return;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        if (progressBar) progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(hidePreloader, 300);
        }
    }, 80);
    
    setTimeout(hidePreloader, 1800);
}

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('fade-out')) {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader && (preloader.style.display = 'none'), 500);
    }
}

// FIXED Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (!themeToggle) return;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('mahalingeshwar-theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    AppState.theme = savedTheme;
    
    // Add click listener
    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('mahalingeshwar-theme', newTheme);
        AppState.theme = newTheme;
        
        // Visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => this.style.transform = 'scale(1)', 150);
        
        console.log('Theme switched to:', newTheme);
    });
    
    console.log('Theme toggle initialized successfully');
}

// Navigation
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    
                    // Update active link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
            
            // Close mobile menu
            if (navMenu) navMenu.classList.remove('active');
        });
    });
    
    // Scroll progress
    window.addEventListener('scroll', updateScrollProgress);
}

function updateScrollProgress() {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
}

// Search
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput ? searchInput.value : '';
            performSearch(query);
        });
    }
}

function performSearch(query) {
    if (!query.trim()) return;
    
    const results = APP_DATA.products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (results.length > 0) {
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        showNotification(`Found ${results.length} products for "${query}"`);
    } else {
        showNotification(`No products found for "${query}"`);
    }
}

// Shopping Cart
function initCart() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    
    // Product action handlers
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-cart') || e.target.closest('.btn-cart')) {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productId = productCard.dataset.productId;
                addToCart(productId);
            }
        }
        
        if (e.target.classList.contains('btn-whatsapp') || e.target.closest('.btn-whatsapp')) {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productId = productCard.dataset.productId;
                orderProductOnWhatsApp(productId);
            }
        }
    });
}

function openCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
        AppState.cartOpen = true;
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('active');
        AppState.cartOpen = false;
        document.body.style.overflow = '';
    }
}

function addToCart(productId) {
    const product = APP_DATA.products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = AppState.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        AppState.cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            icon: product.icon,
            gradient: product.gradient,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCartToStorage();
}

function updateCartQuantity(productId, newQuantity) {
    const item = AppState.cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.classList.toggle('show', totalItems > 0);
    }
    
    // Update cart items
    if (cartItems) {
        if (AppState.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = AppState.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image" style="background: ${item.gradient}">${item.icon}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price}</div>
                        <div class="cart-item-controls">
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            <button onclick="removeFromCart('${item.id}')" style="color: #ff4444; margin-left: 0.5rem;">×</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Update total
    const total = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = `₹${total}`;
}

function saveCartToStorage() {
    localStorage.setItem('mahalingeshwar-cart', JSON.stringify(AppState.cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('mahalingeshwar-cart');
    if (saved) {
        AppState.cart = JSON.parse(saved);
        updateCartDisplay();
    }
}

// Customer Form Modal
function initCustomerForm() {
    const form = document.getElementById('customer-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function showCustomerForm() {
    if (AppState.cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const modal = document.getElementById('customer-form-overlay');
    if (modal) {
        modal.classList.add('active');
        AppState.customerFormOpen = true;
        document.body.style.overflow = 'hidden';
    }
}

function hideCustomerForm() {
    const modal = document.getElementById('customer-form-overlay');
    if (modal) {
        modal.classList.remove('active');
        AppState.customerFormOpen = false;
        document.body.style.overflow = '';
        clearFormErrors();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('customer-name').value.trim(),
        phone: document.getElementById('customer-phone').value.trim(),
        email: document.getElementById('customer-email').value.trim(),
        address: document.getElementById('customer-address').value.trim(),
        instructions: document.getElementById('customer-instructions').value.trim()
    };
    
    // Validate form
    if (validateForm(formData)) {
        // Generate and send WhatsApp order
        sendWhatsAppOrderWithDetails(formData);
        hideCustomerForm();
    }
}

function validateForm(data) {
    let isValid = true;
    clearFormErrors();
    
    // Name validation
    if (!data.name || data.name.length < 2) {
        showFieldError('name-error', 'Please enter your full name');
        isValid = false;
    }
    
    // Phone validation
    if (!data.phone || !/^[+]?[0-9\s-()]{10,}$/.test(data.phone)) {
        showFieldError('phone-error', 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Email validation
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showFieldError('email-error', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Address validation
    if (!data.address || data.address.length < 10) {
        showFieldError('address-error', 'Please enter a complete delivery address');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

// WhatsApp Integration with Customer Details
function sendWhatsAppOrderWithDetails(customerData) {
    const orderDetails = AppState.cart.map(item => 
        `📦 ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`
    ).join('\n');
    
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryNote = subtotal >= 1000 ? 'FREE*' : 'As per location';
    
    const message = `🛍️ NEW ORDER REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 CUSTOMER DETAILS:
Name: ${customerData.name}
📞 Phone: ${customerData.phone}
📧 Email: ${customerData.email}
📍 Address: ${customerData.address}

🛒 ORDER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${orderDetails}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 ORDER SUMMARY:
Subtotal: ₹${subtotal}
Delivery: ${deliveryNote}
TOTAL: ₹${subtotal}

📝 Special Instructions:
${customerData.instructions || 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please confirm this order and provide:
✅ Payment details & method
⏰ Expected delivery timeline
📋 Any additional requirements

Thank you for choosing Mahalingeshwar Digital Prints & Gifts!`;
    
    const whatsappUrl = `https://wa.me/917619147647?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after successful order
    AppState.cart = [];
    updateCartDisplay();
    saveCartToStorage();
    closeCart();
    
    showNotification('Order details sent to WhatsApp! We\'ll contact you shortly.');
}

function orderProductOnWhatsApp(productId) {
    const product = APP_DATA.products.find(p => p.id === productId);
    if (!product) return;
    
    const message = `Hi! I'm interested in ordering:

📦 ${product.name}
💰 Price: ₹${product.price}
📝 Description: ${product.description}

Please provide more details about:
- Customization options
- Delivery time
- Payment methods

Thank you!`;
    
    const whatsappUrl = `https://wa.me/917619147647?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function openWhatsAppContact() {
    const message = `Hi! I'm interested in your digital printing services. Can you provide more information about your products and services?\n\nThank you!`;
    const whatsappUrl = `https://wa.me/917619147647?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function contactForOffers() {
    const message = `Hi! I saw your special offers on the website. Can you provide more details about current deals and discounts?\n\nI'm interested in:
- Bulk order discounts
- Festival specials
- Free delivery offers

Thank you!`;
    const whatsappUrl = `https://wa.me/917619147647?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Product Display
function initProductDisplay() {
    displayOffers();
    displayCategories();
    displayFeaturedProducts();
    displayServices();
    displayTestimonials();
}

function displayOffers() {
    const offersGrid = document.getElementById('offers-grid');
    if (!offersGrid) return;
    
    offersGrid.innerHTML = APP_DATA.offers.map(offer => `
        <div class="offer-card" style="background: ${offer.gradient};">
            <div class="offer-icon">${offer.icon}</div>
            <div class="offer-discount">${offer.discount}</div>
            <h3 class="offer-title">${offer.title}</h3>
            <p class="offer-description">${offer.description}</p>
            <p class="offer-condition">${offer.condition}</p>
        </div>
    `).join('');
}

function displayCategories() {
    const categoryGrid = document.getElementById('category-grid');
    if (!categoryGrid) return;
    
    categoryGrid.innerHTML = APP_DATA.categories.map(category => `
        <a href="#products" class="category-card" style="background: ${category.gradient};">
            <div class="category-icon">${category.icon}</div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
        </a>
    `).join('');
}

function displayFeaturedProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    const featuredProducts = APP_DATA.products.filter(p => p.featured);
    productsGrid.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
}

function displayServices() {
    const servicesGrid = document.getElementById('services-grid');
    if (!servicesGrid) return;
    
    servicesGrid.innerHTML = APP_DATA.services.map(service => `
        <div class="service-card">
            <div class="service-icon" style="background: ${service.color};">
                ${service.icon}
            </div>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
        </div>
    `).join('');
}

function displayTestimonials() {
    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (!testimonialsGrid) return;
    
    testimonialsGrid.innerHTML = APP_DATA.testimonials.map(testimonial => `
        <div class="testimonial-card" style="background: ${testimonial.gradient};">
            <div class="testimonial-stars">${generateStars(testimonial.rating)}</div>
            <div class="testimonial-text">"${testimonial.text}"</div>
            <div class="testimonial-author">${testimonial.name}</div>
            <div class="testimonial-service">${testimonial.service}</div>
            <div class="testimonial-location">${testimonial.location}</div>
        </div>
    `).join('');
}

function createProductCard(product) {
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image" style="background: ${product.gradient};">
                ${product.icon}
                ${discount > 0 ? `<div class="product-badge">${discount}% OFF</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">${generateStars(product.rating)}</div>
                    <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
                </div>
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-cart">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <button class="btn-whatsapp">
                        <i class="fab fa-whatsapp"></i>
                        Order Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

// Newsletter
function initNewsletter() {
    const newsletterBtn = document.querySelector('.newsletter-btn');
    const newsletterInput = document.querySelector('.newsletter-input');
    
    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = newsletterInput.value.trim();
            if (email && isValidEmail(email)) {
                // Simulate newsletter signup
                this.textContent = 'Subscribed!';
                this.style.background = 'var(--success-green)';
                newsletterInput.value = '';
                
                setTimeout(() => {
                    this.textContent = 'Subscribe';
                    this.style.background = '';
                }, 3000);
                
                showNotification('Successfully subscribed to newsletter!');
            } else {
                showNotification('Please enter a valid email address.');
            }
        });
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements
    setTimeout(() => {
        const animateElements = document.querySelectorAll('.offer-card, .category-card, .product-card, .service-card, .testimonial-card');
        animateElements.forEach(el => observer.observe(el));
    }, 500);
}

// Utility Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--service-green);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: var(--shadow-xl);
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions available globally
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.showCustomerForm = showCustomerForm;
window.hideCustomerForm = hideCustomerForm;
window.openWhatsAppContact = openWhatsAppContact;
window.contactForOffers = contactForOffers;

// Add animation keyframes
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
`;
document.head.appendChild(style);

console.log('Mahalingeshwar Ecommerce Platform loaded successfully!');