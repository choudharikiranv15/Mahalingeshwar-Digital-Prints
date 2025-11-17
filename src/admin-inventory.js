// =====================================================
// Inventory Management System - Admin Friendly
// =====================================================

import { SupabaseService } from './supabase-service.js';
import { showLoading, showToast } from './admin-script.js';

export const InventoryManager = {
    products: [],
    currentProduct: null,
    bulkSelections: [],

    // Initialize inventory system
    async init() {
        await this.loadInventoryData();
        this.attachEventListeners();
    },

    // Attach event listeners
    attachEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search and filter
        const searchInput = document.getElementById('inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterInventory());
        }

        const filterSelect = document.getElementById('inventory-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterInventory());
        }

        // Quick stock adjustment action buttons
        const adjustmentBtns = document.querySelectorAll('.adjustment-type-selector .btn');
        adjustmentBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                adjustmentBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateAdjustmentUI(e.target.dataset.action);
            });
        });

        // Product selection for quick adjustment
        const quickProductSelect = document.getElementById('quick-product-select');
        if (quickProductSelect) {
            quickProductSelect.addEventListener('change', (e) => {
                this.onProductSelected(e.target.value);
            });
        }

        // Quantity input for preview
        const quickQuantity = document.getElementById('quick-quantity');
        if (quickQuantity) {
            quickQuantity.addEventListener('input', () => this.updateStockPreview());
        }

        // History filters
        const historyPeriod = document.getElementById('history-period');
        if (historyPeriod) {
            historyPeriod.addEventListener('change', () => this.loadHistory());
        }

        const historyType = document.getElementById('history-type');
        if (historyType) {
            historyType.addEventListener('change', () => this.loadHistory());
        }
    },

    // Load inventory data
    async loadInventoryData() {
        try {
            showLoading(true);

            // Get inventory summary
            const summary = await SupabaseService.getInventorySummary();
            this.updateOverviewCards(summary);

            // Get all products
            const { data, error } = await SupabaseService.getAllProducts(); // Using SupabaseService.getAllProducts()

            if (error) throw error;

            this.products = data || [];
            this.displayInventoryTable();
            this.populateProductSelects();

            showToast('Inventory loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading inventory:', error);
            showToast('Failed to load inventory', 'error');
        } finally {
            showLoading(false);
        }
    },

    // Update overview cards
    updateOverviewCards(summary) {
        if (!summary) return;

        document.getElementById('total-stock-value').textContent =
            `₹${summary.totalStockValue.toLocaleString()}`;
        document.getElementById('total-stock-units').textContent =
            summary.totalStockUnits.toLocaleString();
        document.getElementById('in-stock-products').textContent =
            summary.inStockProducts;
        document.getElementById('low-stock-products').textContent =
            summary.lowStockProducts;
        document.getElementById('out-of-stock-products').textContent =
            summary.outOfStockProducts;
    },

    // Display inventory table
    displayInventoryTable() {
        const tbody = document.getElementById('inventory-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.products.map(product => {
            const stockValue = product.stock_quantity * parseFloat(product.price);
            const status = this.getStockStatus(product);

            return `
                <tr>
                    <td>
                        <strong>${product.name}</strong>
                    </td>
                    <td>${product.category}</td>
                    <td class="text-center">
                        <span class="stock-quantity ${status.class}">${product.stock_quantity}</span>
                    </td>
                    <td>
                        <span class="badge badge-${status.class}">${status.text}</span>
                    </td>
                    <td>₹${parseFloat(product.price).toFixed(2)}</td>
                    <td>₹${stockValue.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openQuickStockAdjust()">
                            ✏️ Adjust
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="viewHistory('${product.product_id}')">
                            📜 History
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Get stock status
    getStockStatus(product) {
        if (!product.in_stock || product.stock_quantity === 0) {
            return { text: 'Out of Stock', class: 'danger' };
        } else if (product.stock_quantity < 10) {
            return { text: 'Low Stock', class: 'warning' };
        } else {
            return { text: 'In Stock', class: 'success' };
        }
    },

    // Filter inventory
    filterInventory() {
        const searchTerm = document.getElementById('inventory-search')?.value.toLowerCase() || '';
        const filter = document.getElementById('inventory-filter')?.value || '';

        let filtered = this.products;

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm) ||
                p.product_id.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        if (filter) {
            filtered = filtered.filter(p => {
                const status = this.getStockStatus(p);
                if (filter === 'in-stock') return status.class === 'success';
                if (filter === 'low-stock') return status.class === 'warning';
                if (filter === 'out-of-stock') return status.class === 'danger';
                return true;
            });
        }

        // Temporarily update display
        const originalProducts = this.products;
        this.products = filtered;
        this.displayInventoryTable();
        this.products = originalProducts;
    },

    // Switch tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Load tab data
        if (tabName === 'history') {
            this.loadHistory();
        } else if (tabName === 'alerts') {
            this.loadRestockList();
        }
    },

    // Quick adjust stock
    quickAdjust(productId) {
        this.currentProduct = this.products.find(p => p.product_id === productId);
        if (!this.currentProduct) return;

        // Set product in select
        const select = document.getElementById('quick-product-select');
        if (select) {
            select.value = productId;
            this.onProductSelected(productId);
        }

        // Open modal
        openQuickStockAdjust();
    },

    // When product is selected
    onProductSelected(productId) {
        this.currentProduct = this.products.find(p => p.product_id === productId);
        if (!this.currentProduct) {
            document.getElementById('current-stock-display').classList.add('hidden');
            document.getElementById('new-stock-preview').classList.add('hidden');
            return;
        }

        // Show current stock
        document.getElementById('current-stock-value').textContent = this.currentProduct.stock_quantity;
        document.getElementById('current-stock-display').classList.remove('hidden');

        // Update preview
        this.updateStockPreview();
    },

    // Update adjustment UI
    updateAdjustmentUI(action) {
        const label = document.getElementById('quantity-label');
        const quantityInput = document.getElementById('quick-quantity');

        if (action === 'add') {
            label.textContent = 'Quantity to Add';
            quantityInput.min = 0;
        } else if (action === 'subtract') {
            label.textContent = 'Quantity to Remove';
            quantityInput.min = 0;
        } else if (action === 'set') {
            label.textContent = 'New Stock Quantity';
            quantityInput.min = 0;
        }

        this.updateStockPreview();
    },

    // Update stock preview
    updateStockPreview() {
        if (!this.currentProduct) return;

        const action = document.querySelector('.adjustment-type-selector .btn.active')?.dataset.action;
        const quantity = parseInt(document.getElementById('quick-quantity')?.value || 0);
        let newStock = 0;

        if (action === 'add') {
            newStock = this.currentProduct.stock_quantity + quantity;
        } else if (action === 'subtract') {
            newStock = Math.max(0, this.currentProduct.stock_quantity - quantity);
        } else if (action === 'set') {
            newStock = quantity;
        }

        const newStockValueEl = document.getElementById('new-stock-value');
        const newStockPreviewEl = document.querySelector('.new-stock-preview');

        if (newStockValueEl) newStockValueEl.textContent = newStock;
        if (newStockPreviewEl) newStockPreviewEl.classList.remove('hidden');
    },

    // Save quick stock update
    async saveQuickStockUpdate() {
        if (!this.currentProduct) {
            showToast('Please select a product', 'error');
            return;
        }

        const action = document.querySelector('.adjustment-type-selector .btn.active')?.dataset.action;
        const quantity = parseInt(document.getElementById('quick-quantity')?.value || 0);
        const reason = document.getElementById('quick-reason')?.value || 'adjustment';
        const notes = document.getElementById('quick-notes')?.value || '';

        if (quantity === 0 && action !== 'set') {
            showToast('Please enter a quantity', 'error');
            return;
        }

        try {
            showLoading(true);

            let newStock = 0;
            if (action === 'add') {
                newStock = this.currentProduct.stock_quantity + quantity;
            } else if (action === 'subtract') {
                newStock = Math.max(0, this.currentProduct.stock_quantity - quantity);
            } else if (action === 'set') {
                newStock = quantity;
            }

            await SupabaseService.updateProductStock(
                this.currentProduct.product_id,
                newStock,
                reason,
                notes,
                'admin'
            );

            showToast('✅ Stock updated successfully!', 'success');
            closeQuickStockModal();
            await this.loadInventoryData();

        } catch (error) {
            console.error('Error updating stock:', error);
            showToast('Failed to update stock', 'error');
        } finally {
            showLoading(false);
        }
    },

    // Populate product selects
    populateProductSelects() {
        const selects = [
            document.getElementById('quick-product-select'),
            document.getElementById('alert-product-select')
        ];

        selects.forEach(select => {
            if (!select) return;
            select.innerHTML = '<option value="">Choose a product...</option>' +
                this.products.map(p => `
                    <option value="${p.product_id}">${p.name} (${p.stock_quantity} in stock)</option>
                `).join('');
        });
    },

    // View history for product
    async viewHistory(productId) {
        this.switchTab('history');

        try {
            const history = await SupabaseService.getInventoryHistory(productId);
            this.displayHistory(history);
        } catch (error) {
            console.error('Error loading history:', error);
            showToast('Failed to load history', 'error');
        }
    },

    // Load history
    async loadHistory() {
        const days = parseInt(document.getElementById('history-period')?.value || 30);
        const type = document.getElementById('history-type')?.value || '';

        try {
            showLoading(true);
            let history = await SupabaseService.getAllInventoryHistory(days);

            // Filter by type
            if (type) {
                history = history.filter(h => h.change_type === type);
            }

            this.displayHistory(history);
        } catch (error) {
            console.error('Error loading history:', error);
            showToast('Failed to load history', 'error');
        } finally {
            showLoading(false);
        }
    },

    // Display history timeline
    displayHistory(history) {
        const timeline = document.getElementById('history-timeline');
        if (!timeline) return;

        if (history.length === 0) {
            timeline.innerHTML = '<p class="text-center">No history available</p>';
            return;
        }

        timeline.innerHTML = history.map(item => {
            const icon = this.getChangeIcon(item.change_type);
            const color = this.getChangeColor(item.change_type);
            const date = new Date(item.created_at).toLocaleString();

            return `
                <div class="history-item">
                    <div class="history-icon ${color}">${icon}</div>
                    <div class="history-content">
                        <div class="history-header">
                            <strong>${this.getChangeTypeLabel(item.change_type)}</strong>
                            <span class="history-date">${date}</span>
                        </div>
                        <div class="history-details">
                            <span class="quantity-change ${item.quantity_change >= 0 ? 'positive' : 'negative'}">
                                ${item.quantity_change >= 0 ? '+' : ''}${item.quantity_change} units
                            </span>
                            <span class="stock-change">
                                ${item.quantity_before} → ${item.quantity_after}
                            </span>
                        </div>
                        ${item.reason ? `<p class="history-reason">${item.reason}</p>` : ''}
                        ${item.created_by ? `<small>By: ${item.created_by}</small>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    // Get change type icon
    getChangeIcon(type) {
        const icons = {
            restock: '📦',
            sale: '💰',
            adjustment: '✏️',
            return: '↩️',
            damage: '⚠️'
        };
        return icons[type] || '📝';
    },

    // Get change color
    getChangeColor(type) {
        const colors = {
            restock: 'success',
            sale: 'info',
            adjustment: 'warning',
            return: 'secondary',
            damage: 'danger'
        };
        return colors[type] || 'secondary';
    },

    // Get change type label
    getChangeTypeLabel(type) {
        const labels = {
            restock: 'Stock Added',
            sale: 'Sold',
            adjustment: 'Manual Adjustment',
            return: 'Customer Return',
            damage: 'Damage/Loss'
        };
        return labels[type] || type;
    },

    // Load restock list
    async loadRestockList() {
        try {
            showLoading(true);
            const products = await SupabaseService.getProductsNeedingRestock();

            const container = document.getElementById('restock-list');
            if (!container) return;

            if (products.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p style="font-size: 3rem;">✅</p>
                        <h3>All Good!</h3>
                        <p>No products need restocking right now</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = products.map(product => `
                <div class="restock-card">
                    <div class="restock-info">
                        <h4>${product.name}</h4>
                        <div class="restock-details">
                            <span class="detail-item">
                                <strong>Current:</strong> ${product.stockQuantity} units
                            </span>
                            <span class="detail-item">
                                <strong>Reorder Point:</strong> ${product.reorderPoint}
                            </span>
                            <span class="detail-item">
                                <strong>Suggested Order:</strong> ${product.reorderQuantity} units
                            </span>
                        </div>
                    </div>
                    <div class="restock-actions">
                        <button class="btn btn-primary" onclick="InventoryManager.restockProduct('${product.id}', ${product.reorderQuantity})">
                            🛒 Order ${product.reorderQuantity} Units
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading restock list:', error);
            showToast('Failed to load restock list', 'error');
        } finally {
            showLoading(false);
        }
    },

    // Restock product
    async restockProduct(productId, quantity) {
        if (!confirm(`Restock ${quantity} units?`)) return;

        try {
            showLoading(true);

            await SupabaseService.adjustStock(
                productId,
                quantity,
                'restock',
                `Restocked ${quantity} units`,
                'admin'
            );

            showToast('✅ Stock restocked successfully!', 'success');
            await this.loadRestockList();
            await this.loadInventoryData();

        } catch (error) {
            console.error('Error restocking:', error);
            showToast('Failed to restock', 'error');
        } finally {
            showLoading(false);
        }
    },

    // Export inventory report
    exportInventoryReport() {
        const report = this.generateInventoryReport();
        const blob = new Blob([report], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('📥 Report exported!', 'success');
    },

    // Generate inventory report
    generateInventoryReport() {
        let csv = 'Product,Category,Stock Quantity,Price,Stock Value,Status\n';

        this.products.forEach(product => {
            const stockValue = product.stock_quantity * parseFloat(product.price);
            const status = this.getStockStatus(product).text;

            csv += `"${product.name}","${product.category}",${product.stock_quantity},${product.price},${stockValue.toFixed(2)},"${status}"\n`;
        });

        return csv;
    }
};

// Modal functions
// Functions moved to admin-script.js to be properly imported and managed

// Initialize when inventory section is visible
/*
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const inventorySection = document.getElementById('section-inventory');
        if (inventorySection) {
            const inventoryNav = document.querySelector('[data-section="inventory"]');
            if (inventoryNav) {
                inventoryNav.addEventListener('click', () => {
                    if (InventoryManager.products.length === 0) {
                        InventoryManager.init();
                    }
                }, { once: true });
            }
        }
    }, 1000);
});
*/
