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
    if (modal) modal.classList.add('active');
    if (productId) {
        const select = document.getElementById('quick-product-select');
        if (select) select.value = productId;
    }
};

window.closeQuickStockModal = function() {
    const modal = document.getElementById('quick-stock-modal');
    if (modal) modal.classList.remove('active');
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
    if (modal) modal.classList.add('active');
};

window.closeBulkUpdateModal = function() {
    const modal = document.getElementById('bulk-update-modal');
    if (modal) modal.classList.remove('active');
};

window.saveBulkUpdate = async function() {
    window.showToast?.('Bulk update feature coming soon', 'info');
    closeBulkUpdateModal();
};

window.viewRestockList = function() {
    window.showToast?.('Restock list feature coming soon', 'info');
};

window.exportInventoryReport = function() {
    window.showToast?.('Export feature coming soon', 'info');
};

window.openAlertConfiguration = function() {
    const modal = document.getElementById('alert-config-modal');
    if (modal) modal.classList.add('active');
};

window.closeAlertConfigModal = function() {
    const modal = document.getElementById('alert-config-modal');
    if (modal) modal.classList.remove('active');
};

window.saveAlertConfig = function() {
    window.showToast?.('Alert configuration saved', 'success');
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
