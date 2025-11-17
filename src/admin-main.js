// Admin Dashboard Entry Point
import '../admin-style.css';

import { SUPABASE_CONFIG, ADMIN_CONFIG } from './config.js';
import { SupabaseService } from './supabase-service.js';
import './admin-script.js';
import { AnalyticsManager } from './admin-analytics.js';
import { InventoryManager } from './admin-inventory.js';

// Make available globally for admin dashboard
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.ADMIN_CONFIG = ADMIN_CONFIG;
window.SupabaseService = SupabaseService;
window.AnalyticsManager = AnalyticsManager;
window.InventoryManager = InventoryManager;

// Expose inventory manager wrapper functions for inline onclick handlers
window.loadInventoryData = () => InventoryManager.loadInventoryData();

// Inventory modal functions
window.openQuickStockAdjust = function(productId) {
    const modal = document.getElementById('quick-stock-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Populate product dropdown if not already populated
        const select = document.getElementById('quick-product-select');
        if (select && select.options.length <= 1 && window.InventoryManager?.products) {
            window.InventoryManager.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.product_id;
                option.textContent = `${product.name} (Stock: ${product.stock_quantity})`;
                select.appendChild(option);
            });
        }
        if (productId && select) {
            select.value = productId;
        }
    }
};

window.closeQuickStockModal = function() {
    const modal = document.getElementById('quick-stock-modal');
    if (modal) modal.classList.add('hidden');
};

window.saveQuickStockUpdate = async function() {
    const productSelect = document.getElementById('quick-product-select');
    const quantity = document.getElementById('quick-quantity');
    const reason = document.getElementById('adjustment-reason');

    if (!productSelect?.value || !quantity?.value) {
        window.showToast?.('Please fill in all fields', 'error');
        return;
    }

    try {
        // Get the adjustment type from active button
        const activeType = document.querySelector('.adjustment-type-selector .btn.active');
        const action = activeType?.dataset?.action || 'restock';

        const quantityNum = parseInt(quantity.value);
        const adjustmentQuantity = action === 'remove' ? -quantityNum : quantityNum;

        // Update stock in database
        const { error } = await SupabaseService.updateProductStock(
            productSelect.value,
            adjustmentQuantity,
            reason.value || 'Manual adjustment'
        );

        if (error) throw error;

        window.showToast?.('Stock updated successfully', 'success');
        closeQuickStockModal();
        loadInventoryData();
    } catch (error) {
        console.error('Error updating stock:', error);
        window.showToast?.('Failed to update stock', 'error');
    }
};

window.openBulkUpdate = function() {
    const modal = document.getElementById('bulk-update-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Populate products for bulk update
        const container = document.getElementById('bulk-products-list');
        if (container && window.InventoryManager?.products) {
            container.innerHTML = window.InventoryManager.products.map(product => `
                <div class="bulk-product-item">
                    <input type="checkbox" id="bulk-${product.product_id}" value="${product.product_id}">
                    <label for="bulk-${product.product_id}">${product.name} (Current: ${product.stock_quantity})</label>
                </div>
            `).join('');
        }
    }
};

window.closeBulkUpdateModal = function() {
    const modal = document.getElementById('bulk-update-modal');
    if (modal) modal.classList.add('hidden');
};

window.saveBulkUpdate = async function() {
    window.showToast?.('Bulk update feature coming soon', 'info');
    closeBulkUpdateModal();
};

window.viewRestockList = function() {
    // Filter products with low stock
    if (window.InventoryManager?.products) {
        const lowStock = window.InventoryManager.products.filter(p => p.stock_quantity < 10);
        if (lowStock.length > 0) {
            const list = lowStock.map(p => `${p.name}: ${p.stock_quantity} units`).join('\n');
            alert(`Low Stock Items:\n\n${list}`);
        } else {
            window.showToast?.('All products have sufficient stock', 'success');
        }
    } else {
        window.showToast?.('Please load inventory data first', 'warning');
    }
};

window.exportInventoryReport = function() {
    if (window.InventoryManager?.products) {
        const csv = ['Product Name,Category,Stock,Price,In Stock\n'];
        window.InventoryManager.products.forEach(p => {
            csv.push(`${p.name},${p.category},${p.stock_quantity},${p.price},${p.in_stock}\n`);
        });
        const blob = new Blob(csv, { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        window.showToast?.('Inventory report exported', 'success');
    } else {
        window.showToast?.('Please load inventory data first', 'warning');
    }
};

window.openAlertConfiguration = function() {
    const modal = document.getElementById('alert-config-modal');
    if (modal) modal.classList.remove('hidden');
};

window.closeAlertConfigModal = function() {
    const modal = document.getElementById('alert-config-modal');
    if (modal) modal.classList.add('hidden');
};

window.saveAlertConfig = function() {
    const lowStockThreshold = document.getElementById('low-stock-threshold')?.value;
    const emailAlerts = document.getElementById('email-alerts')?.checked;

    if (lowStockThreshold) {
        localStorage.setItem('lowStockThreshold', lowStockThreshold);
        localStorage.setItem('emailAlertsEnabled', emailAlerts ? 'true' : 'false');
        window.showToast?.('Alert configuration saved', 'success');
    } else {
        window.showToast?.('Alert configuration saved', 'success');
    }
    closeAlertConfigModal();
};

window.viewHistory = function(productId) {
    window.showToast?.('Product history feature coming soon', 'info');
};

// Export/analytics functions
window.toggleChartView = function(type) {
    console.log('Toggle chart view:', type);
};

window.exportTable = function(type) {
    window.showToast?.('Export feature coming soon', 'info');
};

console.log('✅ Admin dashboard entry point loaded');
console.log('✅ AnalyticsManager available:', typeof AnalyticsManager);
console.log('✅ InventoryManager available:', typeof InventoryManager);
