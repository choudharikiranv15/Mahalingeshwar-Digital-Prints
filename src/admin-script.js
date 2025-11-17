// =====================================================
// Admin Dashboard Script
// =====================================================
import { ADMIN_CONFIG } from './config.js';
import { SupabaseService, supabaseClient } from './supabase-service.js';

// Note: supabaseClient is already initialized in supabase-service.js
// We can use it directly here

// Application State
const AdminState = {
    isLoggedIn: false,
    currentSection: 'dashboard',
    editingProductId: null,
    products: [],
    categories: [],
    offers: [],
    orders: []
};

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin Dashboard Loading...');

    // Check if already logged in
    const savedAuth = localStorage.getItem('admin_logged_in');
    if (savedAuth === 'true') {
        showDashboard();
    }

    initializeEventListeners();
    initializeTheme();

    console.log('✅ Admin Dashboard Ready');
});

function initializeEventListeners() {
    // Login form
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Product form
    document.getElementById('product-form')?.addEventListener('submit', handleProductSubmit);

    // Image preview
    document.getElementById('product-image')?.addEventListener('change', handleImagePreview);

    // Search products
    document.getElementById('search-products')?.addEventListener('input', handleProductSearch);

    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

// =====================================================
// AUTHENTICATION
// =====================================================

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    showLoading(true);

    // Authentication using config (for better security, use Supabase Auth)
    if (email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password) {
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_email', email);

        setTimeout(() => {
            showLoading(false);
            showToast('Login successful! Welcome back.', 'success');
            showDashboard();
        }, 1000);
    } else {
        showLoading(false);
        showToast('Invalid credentials. Please try again.', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_email');

    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');

    showToast('Logged out successfully', 'success');
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');

    AdminState.isLoggedIn = true;

    // Load dashboard data
    loadDashboardStats();
    loadProductsTable();
    loadCategories();
    loadOffers();
    loadOrders();

    // Set admin name
    const email = localStorage.getItem('admin_email');
    if (email) {
        document.getElementById('admin-name').textContent = email.split('@')[0];
    }
}

// =====================================================
// NAVIGATION
// =====================================================

function handleNavigation(e) {
    e.preventDefault();

    const section = e.currentTarget.getAttribute('data-section');
    navigateToSection(section);
}

function navigateToSection(section) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeNavItem = document.querySelector(`[data-section="${section}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Update active section
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    const activeSection = document.getElementById(`section-${section}`);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    AdminState.currentSection = section;
}

// =====================================================
// DASHBOARD STATS
// =====================================================

async function loadDashboardStats() {
    try {
        // Get products count
        const { data: products, error: productsError } = await supabaseClient
            .from('products')
            .select('*');

        if (!productsError && products) {
            document.getElementById('total-products').textContent = products.length;
            document.getElementById('featured-products').textContent =
                products.filter(p => p.featured).length;
            AdminState.products = products;
        }

        // Get orders count
        const { data: orders, error: ordersError } = await supabaseClient
            .from('orders')
            .select('count');

        if (!ordersError && orders) {
            document.getElementById('total-orders').textContent = orders.length || 0;
        }

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast('Error loading dashboard statistics', 'error');
    }
}

// =====================================================
// PRODUCTS MANAGEMENT
// =====================================================

async function loadProductsTable() {
    showLoading(true);

    try {
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        AdminState.products = products;
        displayProductsTable(products);

    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    } finally {
        showLoading(false);
    }
}

function displayProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem;">
                    <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">📦</p>
                    <p>No products found. Add your first product!</p>
                </td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');

        const imageHtml = product.image_url
            ? `<img src="${product.image_url}" alt="${product.name}" class="product-image-cell">`
            : `<div style="font-size: 2rem;">${product.icon || '📦'}</div>`;

        const stockBadge = product.in_stock
            ? '<span class="badge badge-success">In Stock</span>'
            : '<span class="badge badge-danger">Out of Stock</span>';

        const featuredBadge = product.featured
            ? '<span class="badge badge-warning">⭐ Featured</span>'
            : '<span class="badge">Regular</span>';

        row.innerHTML = `
            <td>${imageHtml}</td>
            <td><code>${product.product_id}</code></td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td><strong>₹${product.price}</strong></td>
            <td>${stockBadge}</td>
            <td>${featuredBadge}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}', '${product.name}')">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// =====================================================
// PRODUCT FORM HANDLING
// =====================================================

async function handleProductSubmit(e) {
    e.preventDefault();

    showLoading(true);

    try {
        const formData = getProductFormData();

        // Upload image if selected
        let imageUrl = null;
        const imageFile = document.getElementById('product-image').files[0];
        if (imageFile) {
            imageUrl = await uploadProductImage(imageFile, formData.product_id);
        }

        const productData = {
            product_id: formData.product_id,
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            original_price: formData.original_price ? parseFloat(formData.original_price) : null,
            rating: parseFloat(formData.rating),
            reviews: parseInt(formData.reviews),
            description: formData.description,
            icon: formData.icon || '📦',
            image_url: imageUrl,
            featured: formData.featured,
            in_stock: formData.in_stock,
            stock_quantity: parseInt(formData.stock_quantity),
            tags: formData.tags,
            colors: formData.colors,
            sizes: formData.sizes
        };

        // Check if editing
        const editingId = document.getElementById('edit-product-uuid').value;

        if (editingId) {
            // Update existing product
            const { error } = await supabaseClient
                .from('products')
                .update(productData)
                .eq('id', editingId);

            if (error) throw error;

            showToast('Product updated successfully!', 'success');
        } else {
            // Insert new product
            const { error } = await supabaseClient
                .from('products')
                .insert([productData]);

            if (error) throw error;

            showToast('Product added successfully!', 'success');
        }

        // Reload products table
        await loadProductsTable();
        await loadDashboardStats();

        // Reset form
        resetProductForm();

        // Navigate to products section
        navigateToSection('products');

    } catch (error) {
        console.error('Error saving product:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function getProductFormData() {
    return {
        product_id: document.getElementById('product-id').value.trim(),
        name: document.getElementById('product-name').value.trim(),
        category: document.getElementById('product-category').value,
        price: document.getElementById('product-price').value,
        original_price: document.getElementById('product-original-price').value,
        rating: document.getElementById('product-rating').value,
        reviews: document.getElementById('product-reviews').value,
        description: document.getElementById('product-description').value.trim(),
        icon: document.getElementById('product-icon').value.trim(),
        featured: document.getElementById('product-featured').checked,
        in_stock: document.getElementById('product-in-stock').checked,
        stock_quantity: document.getElementById('product-stock').value,
        tags: document.getElementById('product-tags').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t),
        colors: document.getElementById('product-colors').value
            .split(',')
            .map(c => c.trim())
            .filter(c => c),
        sizes: document.getElementById('product-sizes').value
            .split(',')
            .map(s => s.trim())
            .filter(s => s)
    };
}

async function editProduct(productId) {
    showLoading(true);

    try {
        const { data: product, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        // Fill form with product data
        document.getElementById('edit-product-uuid').value = product.id;
        document.getElementById('product-id').value = product.product_id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-original-price').value = product.original_price || '';
        document.getElementById('product-rating').value = product.rating;
        document.getElementById('product-reviews').value = product.reviews;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-icon').value = product.icon || '';
        document.getElementById('product-featured').checked = product.featured;
        document.getElementById('product-in-stock').checked = product.in_stock;
        document.getElementById('product-stock').value = product.stock_quantity;
        document.getElementById('product-tags').value = product.tags?.join(', ') || '';
        document.getElementById('product-colors').value = product.colors?.join(', ') || '';
        document.getElementById('product-sizes').value = product.sizes?.join(', ') || '';

        // Update form title and button
        document.getElementById('product-form-title').textContent = 'Edit Product';
        document.getElementById('submit-btn-text').textContent = 'Update Product';

        // Navigate to add-product section
        navigateToSection('add-product');

        showToast('Product loaded for editing', 'success');

    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Error loading product for editing', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        return;
    }

    showLoading(true);

    try {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        showToast('Product deleted successfully', 'success');

        await loadProductsTable();
        await loadDashboardStats();

    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product', 'error');
    } finally {
        showLoading(false);
    }
}

function resetProductForm() {
    document.getElementById('product-form').reset();
    document.getElementById('edit-product-uuid').value = '';
    document.getElementById('product-form-title').textContent = 'Add New Product';
    document.getElementById('submit-btn-text').textContent = 'Add Product';

    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    preview.classList.remove('active');
}

// =====================================================
// IMAGE HANDLING
// =====================================================

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        preview.classList.add('active');
    };
    reader.readAsDataURL(file);
}

async function uploadProductImage(file, productId) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await supabaseClient.storage
            .from('product-images')
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Warning: Image upload failed, using icon instead', 'warning');
        return null;
    }
}

// =====================================================
// SEARCH
// =====================================================

function handleProductSearch(e) {
    const query = e.target.value.toLowerCase();

    const filteredProducts = AdminState.products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.product_id.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    displayProductsTable(filteredProducts);
}

// =====================================================
// CATEGORIES
// =====================================================

async function loadCategories() {
    try {
        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;

        AdminState.categories = data || [];
        displayCategories(data || []);

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayCategories(categories) {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No categories found.</p>';
        return;
    }

    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';

        card.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <div class="category-name">${category.name}</div>
            <div class="category-description">${category.description}</div>
        `;

        container.appendChild(card);
    });
}

// =====================================================
// OFFERS
// =====================================================

let currentOfferId = null;

async function loadOffers() {
    try {
        const { data, error } = await supabaseClient
            .from('offers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        AdminState.offers = data || [];
        displayOffers(data || []);

    } catch (error) {
        console.error('Error loading offers:', error);
        showToast('Error loading offers', 'error');
    }
}

function displayOffers(offers) {
    const container = document.getElementById('offers-grid-admin');
    if (!container) return;

    container.innerHTML = '';

    if (offers.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">No offers found. Click "Add New Offer" to create one.</p>';
        return;
    }

    offers.forEach(offer => {
        const card = document.createElement('div');
        card.className = 'category-card'; // Reusing category card styles
        card.style.position = 'relative';
        card.style.cursor = 'pointer';

        const statusBadge = offer.active
            ? '<span style="position: absolute; top: 10px; right: 10px; background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">Active</span>'
            : '<span style="position: absolute; top: 10px; right: 10px; background: #6b7280; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">Inactive</span>';

        card.innerHTML = `
            ${statusBadge}
            <div class="category-icon" style="font-size: 2.5rem;">${offer.icon}</div>
            <div class="category-name">${offer.title}</div>
            <div class="category-description">${offer.description}</div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; justify-content: center;">
                <button onclick="editOffer('${offer.id}')" class="btn btn-sm btn-secondary" style="padding: 0.5rem 1rem; border: none; background: var(--color-primary); color: white; border-radius: 0.375rem; cursor: pointer;">
                    Edit
                </button>
                <button onclick="deleteOffer('${offer.id}')" class="btn btn-sm btn-danger" style="padding: 0.5rem 1rem; border: none; background: #ef4444; color: white; border-radius: 0.375rem; cursor: pointer;">
                    Delete
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function showAddOfferModal() {
    currentOfferId = null;
    document.getElementById('offer-modal-title').textContent = 'Add New Offer';
    document.getElementById('offer-form').reset();
    document.getElementById('offer-modal').classList.remove('hidden');
}

async function editOffer(offerId) {
    const offer = AdminState.offers.find(o => o.id === offerId);
    if (!offer) return;

    currentOfferId = offerId;
    document.getElementById('offer-modal-title').textContent = 'Edit Offer';
    document.getElementById('offer-title').value = offer.title;
    document.getElementById('offer-description').value = offer.description;
    document.getElementById('offer-icon').value = offer.icon;
    document.getElementById('offer-active').checked = offer.active;

    document.getElementById('offer-modal').classList.remove('hidden');
}

async function saveOffer() {
    const title = document.getElementById('offer-title').value.trim();
    const description = document.getElementById('offer-description').value.trim();
    const icon = document.getElementById('offer-icon').value.trim();
    const active = document.getElementById('offer-active').checked;

    if (!title || !description || !icon) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    showLoading(true);

    try {
        const offerData = {
            title,
            description,
            icon,
            active
        };

        if (currentOfferId) {
            // Update existing offer
            const { error } = await supabaseClient
                .from('offers')
                .update(offerData)
                .eq('id', currentOfferId);

            if (error) throw error;
            showToast('Offer updated successfully!', 'success');
        } else {
            // Create new offer
            const { error } = await supabaseClient
                .from('offers')
                .insert([offerData]);

            if (error) throw error;
            showToast('Offer added successfully!', 'success');
        }

        closeOfferModal();
        await loadOffers();

    } catch (error) {
        console.error('Error saving offer:', error);
        showToast('Error saving offer: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteOffer(offerId) {
    if (!confirm('Are you sure you want to delete this offer?')) {
        return;
    }

    showLoading(true);

    try {
        const { error } = await supabaseClient
            .from('offers')
            .delete()
            .eq('id', offerId);

        if (error) throw error;

        showToast('Offer deleted successfully!', 'success');
        await loadOffers();

    } catch (error) {
        console.error('Error deleting offer:', error);
        showToast('Error deleting offer: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function closeOfferModal() {
    document.getElementById('offer-modal').classList.add('hidden');
    document.getElementById('offer-form').reset();
    currentOfferId = null;
}

// =====================================================
// ORDERS
// =====================================================

let currentOrderId = null;

async function loadOrders() {
    showLoading(true);

    try {
        const { data, error} = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        AdminState.orders = data || [];
        updateOrderStats(data || []);
        displayOrders(data || []);

    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    } finally {
        showLoading(false);
    }
}

function updateOrderStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const revenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    document.getElementById('orders-total').textContent = total;
    document.getElementById('orders-pending').textContent = pending;
    document.getElementById('orders-confirmed').textContent = confirmed;
    document.getElementById('orders-completed').textContent = completed;
    document.getElementById('orders-revenue').textContent = `₹${revenue.toLocaleString()}`;
}

function displayOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem;">
                    <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🛒</p>
                    <p>No orders yet</p>
                </td>
            </tr>
        `;
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');

        const statusClass = order.status === 'completed' ? 'success' :
                           order.status === 'confirmed' ? 'info' :
                           order.status === 'pending' ? 'warning' : 'danger';

        const date = new Date(order.created_at).toLocaleDateString();
        const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const itemCount = Array.isArray(order.order_items) ? order.order_items.length : 0;

        row.innerHTML = `
            <td><code style="font-size: 0.875rem;">#${order.id.slice(0, 8)}</code></td>
            <td><strong>${order.customer_name}</strong></td>
            <td>
                <div>${order.customer_phone}</div>
                <div style="font-size: 0.875rem; color: var(--color-text-secondary);">${order.customer_email || 'N/A'}</div>
            </td>
            <td><span style="background: var(--color-bg); padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600;">${itemCount} items</span></td>
            <td><strong style="color: var(--color-primary); font-size: 1.125rem;">₹${parseFloat(order.total).toLocaleString()}</strong></td>
            <td><span class="badge badge-${statusClass}" style="text-transform: capitalize;">${order.status}</span></td>
            <td>
                <div>${date}</div>
                <div style="font-size: 0.875rem; color: var(--color-text-secondary);">${time}</div>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrderDetail('${order.id}')" style="margin-right: 0.5rem;">
                    👁️ View
                </button>
                <button class="btn btn-sm btn-success" onclick="copyWhatsAppMessage('${order.id}')" title="Copy WhatsApp message">
                    📋 Copy
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function viewOrderDetail(orderId) {
    const order = AdminState.orders.find(o => o.id === orderId);
    if (!order) return;

    currentOrderId = orderId;

    const modal = document.getElementById('order-detail-modal');
    const content = document.getElementById('order-detail-content');

    const items = Array.isArray(order.order_items) ? order.order_items : [];

    content.innerHTML = `
        <div class="order-detail-section">
            <h4>📋 Order Information</h4>
            <div class="order-detail-grid">
                <div class="order-detail-item">
                    <span class="order-detail-label">Order ID</span>
                    <span class="order-detail-value"><code>#${order.id.slice(0, 8)}</code></span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Date & Time</span>
                    <span class="order-detail-value">${new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Status</span>
                    <select class="status-select" id="order-status-select">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">WhatsApp Sent</span>
                    <span class="order-detail-value">${order.whatsapp_sent ? '✅ Yes' : '❌ No'}</span>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h4>👤 Customer Information</h4>
            <div class="order-detail-grid">
                <div class="order-detail-item">
                    <span class="order-detail-label">Name</span>
                    <span class="order-detail-value">${order.customer_name}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Phone</span>
                    <span class="order-detail-value">
                        <a href="tel:${order.customer_phone}" style="color: var(--color-primary); text-decoration: none;">${order.customer_phone}</a>
                    </span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Email</span>
                    <span class="order-detail-value">
                        <a href="mailto:${order.customer_email}" style="color: var(--color-primary); text-decoration: none;">${order.customer_email || 'N/A'}</a>
                    </span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Address</span>
                    <span class="order-detail-value" style="white-space: pre-wrap;">${order.customer_address || 'N/A'}</span>
                </div>
            </div>
            ${order.special_instructions ? `
                <div style="margin-top: 1rem; padding: 1rem; background: var(--color-bg); border-radius: 0.5rem;">
                    <span class="order-detail-label">Special Instructions:</span>
                    <p style="margin-top: 0.5rem; color: var(--color-text);">${order.special_instructions}</p>
                </div>
            ` : ''}
        </div>

        <div class="order-detail-section">
            <h4>📦 Order Items</h4>
            <ul class="order-items-list">
                ${items.map(item => `
                    <li class="order-item">
                        <div class="order-item-details">
                            <div class="order-item-name">${item.name || 'Unknown Product'}</div>
                            ${item.options && Object.keys(item.options).length > 0 ? `
                                <div class="order-item-options">
                                    ${Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="order-item-qty">Qty: ${item.quantity || 1}</div>
                        <div class="order-item-price">₹${(item.price * (item.quantity || 1)).toLocaleString()}</div>
                    </li>
                `).join('')}
            </ul>

            <div class="order-summary">
                <div class="order-summary-row">
                    <span>Subtotal:</span>
                    <strong>₹${parseFloat(order.subtotal || 0).toLocaleString()}</strong>
                </div>
                <div class="order-summary-row">
                    <span>Shipping:</span>
                    <strong>${parseFloat(order.shipping_cost || 0) === 0 ? 'FREE' : `₹${parseFloat(order.shipping_cost).toLocaleString()}`}</strong>
                </div>
                <div class="order-summary-row total">
                    <span>Total:</span>
                    <strong>₹${parseFloat(order.total).toLocaleString()}</strong>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeOrderModal() {
    const modal = document.getElementById('order-detail-modal');
    modal.classList.add('hidden');
    currentOrderId = null;
}

async function updateOrderStatus() {
    if (!currentOrderId) return;

    const newStatus = document.getElementById('order-status-select').value;

    showLoading(true);

    try {
        const { error } = await supabaseClient
            .from('orders')
            .update({ status: newStatus })
            .eq('id', currentOrderId);

        if (error) throw error;

        showToast('Order status updated successfully!', 'success');
        closeOrderModal();
        await loadOrders();

    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Error updating order status', 'error');
    } finally {
        showLoading(false);
    }
}

// Copy WhatsApp message to clipboard
async function copyWhatsAppMessage(orderId) {
    try {
        // Get order data
        const { data: orderData, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) throw error;

        // Generate message based on current status
        const message = SupabaseService.generateWhatsAppMessage(orderData, orderData.status);

        // Copy to clipboard
        await navigator.clipboard.writeText(message);

        showToast('Message copied! Open WhatsApp and paste to send.', 'success');

    } catch (error) {
        console.error('Error copying message:', error);
        showToast('Failed to copy message', 'error');
    }
}

// Search and filter orders
function filterOrders() {
    const searchQuery = document.getElementById('search-orders')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('order-status-filter')?.value || '';

    let filteredOrders = AdminState.orders;

    if (searchQuery) {
        filteredOrders = filteredOrders.filter(order =>
            order.customer_name.toLowerCase().includes(searchQuery) ||
            order.customer_phone.includes(searchQuery) ||
            order.customer_email?.toLowerCase().includes(searchQuery) ||
            order.id.toLowerCase().includes(searchQuery)
        );
    }

    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    displayOrders(filteredOrders);
}

// Initialize event listeners for orders
document.getElementById('search-orders')?.addEventListener('input', filterOrders);
document.getElementById('order-status-filter')?.addEventListener('change', filterOrders);

// =====================================================
// UTILITIES
// =====================================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// =====================================================
// THEME
// =====================================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('admin_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('admin_theme', newTheme);
    updateThemeIcon(newTheme);

    showToast(`Switched to ${newTheme} mode`, 'success');
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    const currentThemeText = document.getElementById('current-theme');
    if (currentThemeText) {
        currentThemeText.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    }
}

// =====================================================
// SETTINGS
// =====================================================

async function testSupabaseConnection() {
    showLoading(true);

    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('count')
            .limit(1);

        if (error) throw error;

        document.getElementById('connection-status').textContent = 'Connected ✅';
        document.getElementById('connection-status').className = 'status-badge badge-success';
        showToast('Supabase connection successful!', 'success');

    } catch (error) {
        document.getElementById('connection-status').textContent = 'Failed ❌';
        document.getElementById('connection-status').className = 'status-badge badge-danger';
        showToast('Connection failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// =====================================================
// SITE STATISTICS
// =====================================================

// Load site statistics
async function loadSiteStats() {
    const loadingEl = document.getElementById('site-stats-loading');
    const formEl = document.getElementById('site-stats-form');
    const errorEl = document.getElementById('site-stats-error');

    loadingEl.style.display = 'flex';
    formEl.style.display = 'none';
    errorEl.style.display = 'none';

    try {
        const settings = await SupabaseService.getSiteSettings();

        if (settings && settings.length > 0) {
            // Populate form with current values
            settings.forEach(setting => {
                const inputId = setting.setting_key === 'stat_happy_customers' ? 'stat-customers' :
                                setting.setting_key === 'stat_orders_completed' ? 'stat-orders' :
                                setting.setting_key === 'stat_average_rating' ? 'stat-rating' : null;

                if (inputId) {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.value = setting.setting_value;
                    }
                }
            });
        }

        loadingEl.style.display = 'none';
        formEl.style.display = 'flex';
    } catch (error) {
        console.error('Error loading site statistics:', error);
        loadingEl.style.display = 'none';
        errorEl.textContent = 'Failed to load statistics: ' + error.message;
        errorEl.style.display = 'block';
    }
}

// Save site statistics
async function saveSiteStats(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = '💾 Saving...';

    showLoading(true);

    try {
        const customersStat = document.getElementById('stat-customers').value.trim();
        const ordersStat = document.getElementById('stat-orders').value.trim();
        const ratingStat = document.getElementById('stat-rating').value.trim();

        // Update all three statistics
        await Promise.all([
            SupabaseService.updateSiteSetting('stat_happy_customers', customersStat),
            SupabaseService.updateSiteSetting('stat_orders_completed', ordersStat),
            SupabaseService.updateSiteSetting('stat_average_rating', ratingStat)
        ]);

        showToast('✅ Site statistics updated successfully!', 'success');

        // Trigger update on main website if it's open
        window.postMessage({ type: 'STATS_UPDATED' }, '*');

    } catch (error) {
        console.error('Error saving site statistics:', error);
        showToast('Failed to save statistics: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showLoading(false);
    }
}

// Initialize site statistics form on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load site stats when settings section becomes active
    const settingsNav = document.querySelector('[data-section="settings"]');
    if (settingsNav) {
        settingsNav.addEventListener('click', function() {
            setTimeout(loadSiteStats, 100);
        });
    }

    // Setup form submission handler
    const siteStatsForm = document.getElementById('site-stats-form');
    if (siteStatsForm) {
        siteStatsForm.addEventListener('submit', saveSiteStats);
    }

    // Setup generate review link form
    const generateLinkForm = document.getElementById('generate-link-form');
    if (generateLinkForm) {
        generateLinkForm.addEventListener('submit', generateReviewLink);
    }
});

// =====================================================
// REVIEWS MANAGEMENT
// =====================================================

let currentReviewTab = 'pending';
let allReviewsData = [];

// Load reviews based on tab
async function loadAllReviews() {
    showLoading(true);
    try {
        const [stats, pending, all] = await Promise.all([
            SupabaseService.getReviewStatistics(),
            SupabaseService.getPendingReviews(),
            SupabaseService.getAllReviews()
        ]);

        allReviewsData = all;

        // Update stats
        if (stats) {
            document.getElementById('total-reviews').textContent = stats.total_reviews || 0;
            document.getElementById('pending-reviews').textContent = pending.length;
            document.getElementById('approved-reviews').textContent = stats.approved_reviews || 0;
            document.getElementById('average-rating').textContent = stats.average_rating ? parseFloat(stats.average_rating).toFixed(1) : '0.0';
        }

        // Update counts
        document.getElementById('pending-count').textContent = pending.length;
        document.getElementById('approved-count').textContent = all.filter(r => r.is_approved).length;
        document.getElementById('all-count').textContent = all.length;

        // Display reviews based on current tab
        switchReviewTab(currentReviewTab);
    } catch (error) {
        console.error('Error loading reviews:', error);
        showToast('Failed to load reviews', 'error');
    } finally {
        showLoading(false);
    }
}

// Switch between review tabs
function switchReviewTab(tab) {
    currentReviewTab = tab;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Filter and display reviews
    let filteredReviews;
    if (tab === 'pending') {
        filteredReviews = allReviewsData.filter(r => !r.is_approved);
    } else if (tab === 'approved') {
        filteredReviews = allReviewsData.filter(r => r.is_approved);
    } else {
        filteredReviews = allReviewsData;
    }

    displayReviews(filteredReviews);
}

// Display reviews
function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');

    if (reviews.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--color-text-secondary);">
                <h3>No reviews found</h3>
                <p>Reviews will appear here once customers submit them.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div>
                    <div class="review-customer-info">
                        <strong>${escapeHtml(review.customer_name)}</strong>
                        ${review.is_verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                    </div>
                    <div class="review-meta">
                        ${review.customer_phone || ''} ${review.customer_location ? '• ' + escapeHtml(review.customer_location) : ''}
                    </div>
                </div>
                <div class="review-actions">
                    ${!review.is_approved ? `
                        <button class="btn btn-success btn-sm" onclick="approveReview('${review.id}')">✓ Approve</button>
                    ` : ''}
                    <button class="btn btn-warning btn-sm" onclick="toggleFeatured('${review.id}', ${!review.is_featured})">
                        ${review.is_featured ? '⭐ Unfeature' : '☆ Feature'}
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteReviewConfirm('${review.id}')">🗑️ Delete</button>
                </div>
            </div>

            <div class="review-content">
                <div class="review-stars">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </div>
                ${review.review_title ? `<h4 class="review-title">${escapeHtml(review.review_title)}</h4>` : ''}
                <p class="review-text">${escapeHtml(review.review_text)}</p>
            </div>

            <div class="review-footer">
                ${review.product_name ? `<span>📦 ${escapeHtml(review.product_name)}</span>` : ''}
                ${review.order_reference ? `<span>📋 ${escapeHtml(review.order_reference)}</span>` : ''}
                <span>📅 ${new Date(review.created_at).toLocaleDateString()}</span>
                ${review.is_approved ? `<span class="status-approved">✓ Approved</span>` : '<span class="status-pending">⏳ Pending</span>'}
                ${review.is_featured ? '<span class="status-featured">⭐ Featured</span>' : ''}
            </div>
        </div>
    `).join('');
}

// Approve review
async function approveReview(reviewId) {
    if (!confirm('Approve this review?')) return;

    showLoading(true);
    try {
        await SupabaseService.approveReview(reviewId);
        showToast('Review approved successfully!', 'success');
        await loadAllReviews();
    } catch (error) {
        console.error('Error approving review:', error);
        showToast('Failed to approve review', 'error');
    } finally {
        showLoading(false);
    }
}

// Toggle featured status
async function toggleFeatured(reviewId, isFeatured) {
    showLoading(true);
    try {
        await SupabaseService.toggleFeaturedReview(reviewId, isFeatured);
        showToast(`Review ${isFeatured ? 'featured' : 'unfeatured'} successfully!`, 'success');
        await loadAllReviews();
    } catch (error) {
        console.error('Error toggling featured:', error);
        showToast('Failed to update review', 'error');
    } finally {
        showLoading(false);
    }
}

// Delete review with confirmation
async function deleteReviewConfirm(reviewId) {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

    showLoading(true);
    try {
        await SupabaseService.deleteReview(reviewId);
        showToast('Review deleted successfully!', 'success');
        await loadAllReviews();
    } catch (error) {
        console.error('Error deleting review:', error);
        showToast('Failed to delete review', 'error');
    } finally {
        showLoading(false);
    }
}

// Show generate link modal
function showGenerateLinkModal() {
    document.getElementById('generate-link-modal').style.display = 'flex';
    document.getElementById('generated-link-display').style.display = 'none';
    document.getElementById('generate-link-form').reset();
}

// Close generate link modal
function closeGenerateLinkModal() {
    document.getElementById('generate-link-modal').style.display = 'none';
}

// Generate review link
async function generateReviewLink(e) {
    e.preventDefault();

    const name = document.getElementById('gen-customer-name').value;
    const phone = document.getElementById('gen-customer-phone').value;
    const orderRef = document.getElementById('gen-order-ref').value;

    showLoading(true);
    try {
        const result = await SupabaseService.createReviewRequest({
            customer_name: name,
            customer_phone: phone,
            order_reference: orderRef
        });

        const reviewLink = `${window.location.origin}/submit-review.html?token=${result.token}`;

        document.getElementById('generated-link').value = reviewLink;

        const whatsappMsg = `Hi ${name}! 👋

Thank you for choosing Mahalingeshwar Digital Prints & Gifts!

We hope you loved your ${orderRef || 'order'}.

⭐ We'd love your feedback!
📝 Leave a review: ${reviewLink}

Takes only 30 seconds! 🙏

Thank you!
- Team Mahalingeshwar`;

        document.getElementById('whatsapp-template').textContent = whatsappMsg;
        document.getElementById('generated-link-display').style.display = 'block';

        showToast('Review link generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating link:', error);
        showToast('Failed to generate link', 'error');
    } finally {
        showLoading(false);
    }
}

// Copy review link
function copyReviewLink() {
    const linkInput = document.getElementById('generated-link');
    linkInput.select();
    document.execCommand('copy');
    showToast('Link copied to clipboard!', 'success');
}

// Copy WhatsApp message
function copyWhatsAppTemplate() {
    const templateText = document.getElementById('whatsapp-template').textContent;

    // Create temporary textarea to copy text
    const textarea = document.createElement('textarea');
    textarea.value = templateText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showToast('WhatsApp message copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy message', 'error');
    }

    document.body.removeChild(textarea);
}

// HTML escape helper
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load reviews when section is opened
document.addEventListener('DOMContentLoaded', function() {
    const reviewsNav = document.querySelector('[data-section="reviews"]');
    if (reviewsNav) {
        reviewsNav.addEventListener('click', function() {
            setTimeout(loadAllReviews, 100);
        });
    }
});

console.log('✅ Admin script loaded successfully');

// Expose functions used by inline onclick handlers
window.navigateToSection = navigateToSection;
window.resetProductForm = resetProductForm;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadOrders = loadOrders;
window.viewOrderDetail = viewOrderDetail;
window.closeOrderModal = closeOrderModal;
window.updateOrderStatus = updateOrderStatus;
window.copyWhatsAppMessage = copyWhatsAppMessage;
window.copyWhatsAppTemplate = copyWhatsAppTemplate;
window.showAddOfferModal = showAddOfferModal;
window.editOffer = editOffer;
window.saveOffer = saveOffer;
window.deleteOffer = deleteOffer;
window.closeOfferModal = closeOfferModal;
window.approveReview = approveReview;
window.toggleFeatured = toggleFeatured;
window.deleteReviewConfirm = deleteReviewConfirm;
window.switchReviewTab = switchReviewTab;
window.showGenerateLinkModal = showGenerateLinkModal;
window.closeGenerateLinkModal = closeGenerateLinkModal;
window.copyReviewLink = copyReviewLink;
window.testSupabaseConnection = testSupabaseConnection;
window.toggleTheme = toggleTheme;
window.loadSiteStats = loadSiteStats;

// Export functions for use by other admin modules
export {
    showToast,
    showLoading
};
