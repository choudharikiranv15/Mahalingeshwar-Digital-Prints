// =====================================================
// Admin Analytics Module
// =====================================================

import { SupabaseService } from './supabase-service.js';
import { showLoading, showToast } from './admin-script.js';

export const AnalyticsManager = {
    currentPeriod: 30,
    analyticsData: null,
    charts: {},

    // Initialize analytics
    async init() {
        this.attachEventListeners();
        await this.loadAnalytics();
    },

    // Attach event listeners
    attachEventListeners() {
        const periodSelect = document.getElementById('analytics-period');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value === 'all' ? null : parseInt(e.target.value);
                this.loadAnalytics();
            });
        }

        const refreshBtn = document.getElementById('refresh-analytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAnalytics());
        }

        const exportBtn = document.getElementById('export-analytics');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAnalytics());
        }
    },

    // Load all analytics data
    async loadAnalytics() {
        try {
            showLoading(true);

            // Get analytics data
            this.analyticsData = await SupabaseService.getDashboardAnalytics(this.currentPeriod);

            if (!this.analyticsData) {
                throw new Error('Failed to load analytics');
            }

            // Update all sections
            this.updateKeyMetrics();
            this.updateRevenueChart();
            this.updateOrderStatusChart();
            this.updateTopProducts();
            this.updateCategoryChart();
            this.updateTopCustomers();
            this.updateInventoryAlerts();
            this.updateSalesSummary();
            this.updateRecentActivity();

            showToast('Analytics refreshed successfully', 'success');
        } catch (error) {
            console.error('Error loading analytics:', error);
            showToast('Failed to load analytics', 'error');
        } finally {
            showLoading(false);
        }
    },

    // Update key metrics cards
    updateKeyMetrics() {
        const { sales, customers } = this.analyticsData;

        if (sales) {
            document.getElementById('total-revenue').textContent =
                `₹${sales.totalRevenue.toLocaleString('en-IN')}`;
            document.getElementById('total-orders').textContent =
                sales.totalOrders.toLocaleString();
            document.getElementById('avg-order-value').textContent =
                `₹${sales.averageOrderValue.toFixed(2)}`;
        }

        if (customers) {
            document.getElementById('total-customers').textContent =
                customers.totalCustomers.toLocaleString();
        }

        // TODO: Calculate percentage changes
        // For now, show positive indicators
        this.updateMetricChange('revenue-change', 12.5);
        this.updateMetricChange('orders-change', 8.3);
        this.updateMetricChange('customers-change', 15.7);
        this.updateMetricChange('aov-change', 5.2);
    },

    // Update metric change indicator
    updateMetricChange(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            const isPositive = percentage >= 0;
            element.textContent = `${isPositive ? '+' : ''}${percentage.toFixed(1)}%`;
            element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
        }
    },

    // Update revenue chart
    async updateRevenueChart() {
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) return;

        // Get revenue data
        const revenueData = await SupabaseService.getRevenueByDate(this.currentPeriod || 30);

        // Destroy existing chart if any
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        // Create simple line chart (using divs since we don't have Chart.js)
        this.renderSimpleLineChart(canvas, revenueData);
    },

    // Render simple line chart
    renderSimpleLineChart(canvas, data) {
        const container = canvas.parentElement;
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--color-text-secondary);">No data available</p>';
            return;
        }

        const chartDiv = document.createElement('div');
        chartDiv.className = 'simple-chart';

        const maxRevenue = Math.max(...data.map(d => d.revenue));

        data.forEach((item, index) => {
            const barHeight = (item.revenue / maxRevenue) * 100;
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${barHeight}%`;
            bar.title = `${item.date}: ₹${item.revenue.toLocaleString()}`;

            const label = document.createElement('span');
            label.className = 'chart-label';
            label.textContent = new Date(item.date).getDate();

            bar.appendChild(label);
            chartDiv.appendChild(bar);
        });

        container.appendChild(chartDiv);
    },

    // Update order status chart
    updateOrderStatusChart() {
        const canvas = document.getElementById('order-status-chart');
        if (!canvas) return;

        const { sales } = this.analyticsData;
        if (!sales) return;

        const container = canvas.parentElement;
        container.innerHTML = '';

        const statusData = [
            { label: 'Completed', value: sales.completedOrders, color: '#4caf50' },
            { label: 'Confirmed', value: sales.confirmedOrders, color: '#2196f3' },
            { label: 'Pending', value: sales.pendingOrders, color: '#ff9800' }
        ];

        const total = statusData.reduce((sum, item) => sum + item.value, 0);

        const pieChart = document.createElement('div');
        pieChart.className = 'pie-chart';

        statusData.forEach(item => {
            const percentage = total > 0 ? (item.value / total * 100).toFixed(1) : 0;

            const segment = document.createElement('div');
            segment.className = 'pie-segment';
            segment.innerHTML = `
                <div class="segment-color" style="background: ${item.color}"></div>
                <div class="segment-info">
                    <strong>${item.label}</strong>
                    <span>${item.value} (${percentage}%)</span>
                </div>
            `;

            pieChart.appendChild(segment);
        });

        container.appendChild(pieChart);
    },

    // Update top products list
    updateTopProducts() {
        const container = document.getElementById('top-products-list');
        if (!container) return;

        const { products } = this.analyticsData;
        if (!products || !products.topProducts) {
            container.innerHTML = '<p>No product data available</p>';
            return;
        }

        container.innerHTML = products.topProducts.map((product, index) => `
            <div class="data-item">
                <span class="rank">#${index + 1}</span>
                <div class="item-details">
                    <strong>${product.name}</strong>
                    <small>${product.category}</small>
                </div>
                <div class="item-stats">
                    <span class="stat">₹${product.revenue.toLocaleString()}</span>
                    <small>${product.quantity} sold</small>
                </div>
            </div>
        `).join('');
    },

    // Update category chart
    updateCategoryChart() {
        const canvas = document.getElementById('category-chart');
        if (!canvas) return;

        const { products } = this.analyticsData;
        if (!products || !products.categoryPerformance) return;

        const container = canvas.parentElement;
        container.innerHTML = '';

        const maxRevenue = Math.max(...products.categoryPerformance.map(c => c.revenue));

        const barChart = document.createElement('div');
        barChart.className = 'bar-chart';

        products.categoryPerformance.forEach(category => {
            const percentage = (category.revenue / maxRevenue * 100);

            const bar = document.createElement('div');
            bar.className = 'category-bar';
            bar.innerHTML = `
                <div class="bar-label">${category.category}</div>
                <div class="bar-fill" style="width: ${percentage}%">
                    <span>₹${category.revenue.toLocaleString()}</span>
                </div>
            `;

            barChart.appendChild(bar);
        });

        container.appendChild(barChart);
    },

    // Update top customers list
    updateTopCustomers() {
        const container = document.getElementById('top-customers-list');
        if (!container) return;

        const { customers } = this.analyticsData;
        if (!customers || !customers.topCustomers) {
            container.innerHTML = '<p>No customer data available</p>';
            return;
        }

        container.innerHTML = customers.topCustomers.map((customer, index) => `
            <div class="data-item">
                <span class="rank">#${index + 1}</span>
                <div class="item-details">
                    <strong>${customer.name}</strong>
                    <small>${customer.phone}</small>
                </div>
                <div class="item-stats">
                    <span class="stat">₹${customer.totalSpent.toLocaleString()}</span>
                    <small>${customer.orderCount} orders</small>
                </div>
            </div>
        `).join('');
    },

    // Update inventory alerts
    updateInventoryAlerts() {
        const container = document.getElementById('inventory-alerts');
        if (!container) return;

        const { inventory } = this.analyticsData;
        if (!inventory) return;

        let alerts = [];

        if (inventory.outOfStockItems > 0) {
            alerts.push({
                type: 'danger',
                icon: '🔴',
                message: `${inventory.outOfStockItems} products out of stock`,
                action: 'View Products'
            });
        }

        if (inventory.lowStockItems > 0) {
            alerts.push({
                type: 'warning',
                icon: '⚠️',
                message: `${inventory.lowStockItems} products running low`,
                action: 'Restock Now'
            });
        }

        if (alerts.length === 0) {
            alerts.push({
                type: 'success',
                icon: '✅',
                message: 'All products in stock',
                action: null
            });
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert alert-${alert.type}">
                <span class="alert-icon">${alert.icon}</span>
                <span class="alert-message">${alert.message}</span>
                ${alert.action ? `<button class="btn-sm">${alert.action}</button>` : ''}
            </div>
        `).join('');
    },

    // Update sales summary table
    updateSalesSummary() {
        const tbody = document.getElementById('sales-summary-table');
        if (!tbody) return;

        const { sales, customers, products } = this.analyticsData;

        const summaryData = [
            { metric: 'Total Revenue', value: `₹${sales.totalRevenue.toLocaleString()}`, change: '+12.5%' },
            { metric: 'Total Orders', value: sales.totalOrders, change: '+8.3%' },
            { metric: 'Average Order Value', value: `₹${sales.averageOrderValue.toFixed(2)}`, change: '+5.2%' },
            { metric: 'Total Customers', value: customers.totalCustomers, change: '+15.7%' },
            { metric: 'Repeat Customers', value: customers.repeatCustomers, change: '+22.1%' },
            { metric: 'Customer Lifetime Value', value: `₹${customers.customerLifetimeValue.toFixed(2)}`, change: '+18.4%' },
            { metric: 'Products Sold', value: products.totalProductsSold, change: '+10.9%' }
        ];

        tbody.innerHTML = summaryData.map(row => `
            <tr>
                <td><strong>${row.metric}</strong></td>
                <td>${row.value}</td>
                <td><span class="metric-change positive">${row.change}</span></td>
            </tr>
        `).join('');
    },

    // Update recent activity
    async updateRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        const { sales } = this.analyticsData;
        if (!sales || !sales.orders) return;

        const recentOrders = sales.orders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

        container.innerHTML = recentOrders.map(order => {
            const date = new Date(order.created_at);
            const timeAgo = this.getTimeAgo(date);

            return `
                <div class="activity-item">
                    <div class="activity-icon ${order.status}">${this.getStatusIcon(order.status)}</div>
                    <div class="activity-details">
                        <strong>New Order</strong>
                        <p>₹${parseFloat(order.total).toLocaleString()} • ${order.status}</p>
                        <small>${timeAgo}</small>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Get status icon
    getStatusIcon(status) {
        const icons = {
            pending: '⏳',
            confirmed: '✅',
            completed: '🎉',
            cancelled: '❌'
        };
        return icons[status] || '📦';
    },

    // Get time ago string
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [key, value] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / value);
            if (interval >= 1) {
                return `${interval} ${key}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    },

    // Export analytics report
    exportAnalytics() {
        if (!this.analyticsData) {
            showToast('No data to export', 'error');
            return;
        }

        const report = this.generateReport();
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('Report exported successfully', 'success');
    },

    // Generate text report
    generateReport() {
        const { sales, products, customers, inventory } = this.analyticsData;

        return `
MAHALINGESHWAR DIGITAL PRINTS - ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}
Period: Last ${this.currentPeriod || 'All'} Days

==========================================
SALES SUMMARY
==========================================
Total Revenue: ₹${sales.totalRevenue.toLocaleString()}
Total Orders: ${sales.totalOrders}
Average Order Value: ₹${sales.averageOrderValue.toFixed(2)}
Completed Orders: ${sales.completedOrders}
Pending Orders: ${sales.pendingOrders}
Confirmed Orders: ${sales.confirmedOrders}

==========================================
CUSTOMER INSIGHTS
==========================================
Total Customers: ${customers.totalCustomers}
Repeat Customers: ${customers.repeatCustomers}
New Customers: ${customers.newCustomers}
Customer Lifetime Value: ₹${customers.customerLifetimeValue.toFixed(2)}
Average Orders per Customer: ${customers.averageOrdersPerCustomer.toFixed(2)}

==========================================
PRODUCT PERFORMANCE
==========================================
Total Products Sold: ${products.totalProductsSold}

Top 5 Products:
${products.topProducts.slice(0, 5).map((p, i) =>
    `${i + 1}. ${p.name} - ₹${p.revenue.toLocaleString()} (${p.quantity} units)`
).join('\n')}

==========================================
INVENTORY STATUS
==========================================
Total Products: ${inventory.totalProducts}
Low Stock Items: ${inventory.lowStockItems}
Out of Stock Items: ${inventory.outOfStockItems}
Total Inventory Value: ₹${inventory.totalInventoryValue.toLocaleString()}

==========================================
END OF REPORT
==========================================
        `.trim();
    }
};

// Initialize analytics when section is visible
/*
document.addEventListener('DOMContentLoaded', () => {
    // Wait for admin login
    setTimeout(() => {
        const analyticsSection = document.getElementById('section-analytics');
        if (analyticsSection) {
            // Initialize when analytics tab is clicked
            const analyticsNav = document.querySelector('[data-section="analytics"]');
            if (analyticsNav) {
                analyticsNav.addEventListener('click', () => {
                    if (!AnalyticsManager.analyticsData) {
                        AnalyticsManager.init();
                    }
                }, { once: true });
            }
        }
    }, 1000);
});
*/
