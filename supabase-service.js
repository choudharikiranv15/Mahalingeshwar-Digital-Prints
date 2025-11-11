// =====================================================
// Supabase Service Layer
// =====================================================
// This file handles all Supabase database operations

// Initialize Supabase Client
const { createClient } = supabase;

const supabaseClient = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

console.log('✅ Supabase client initialized');

// =====================================================
// PRODUCTS SERVICES
// =====================================================

const SupabaseService = {
  // Fetch all products
  async getAllProducts() {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return this.transformProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Fetch featured products
  async getFeaturedProducts() {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('in_stock', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return this.transformProducts(data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  // Fetch products by category
  async getProductsByCategory(category) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return this.transformProducts(data);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Get single product by ID
  async getProductById(productId) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) throw error;
      return this.transformProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Search products
  async searchProducts(query) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('in_stock', true);

      if (error) throw error;
      return this.transformProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Transform database product to app format
  transformProduct(dbProduct) {
    if (!dbProduct) return null;

    return {
      id: dbProduct.product_id,
      name: dbProduct.name,
      category: dbProduct.category,
      price: parseFloat(dbProduct.price),
      originalPrice: dbProduct.original_price ? parseFloat(dbProduct.original_price) : null,
      rating: parseFloat(dbProduct.rating || 0),
      reviews: dbProduct.reviews || 0,
      description: dbProduct.description || '',
      icon: dbProduct.icon || '📦',
      imageUrl: dbProduct.image_url,
      featured: dbProduct.featured || false,
      inStock: dbProduct.in_stock || true,
      stockQuantity: dbProduct.stock_quantity || 0,
      tags: dbProduct.tags || [],
      colors: dbProduct.colors || [],
      sizes: dbProduct.sizes || []
    };
  },

  // Transform array of products
  transformProducts(dbProducts) {
    if (!Array.isArray(dbProducts)) return [];
    return dbProducts.map(p => this.transformProduct(p));
  },

  // =====================================================
  // CATEGORIES SERVICES
  // =====================================================

  async getAllCategories() {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // =====================================================
  // ORDERS SERVICES
  // =====================================================

  async createOrder(orderData) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .insert([{
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          customer_email: orderData.customerEmail,
          customer_address: orderData.customerAddress,
          special_instructions: orderData.specialInstructions,
          order_items: orderData.orderItems,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shippingCost,
          total: orderData.total,
          status: 'pending',
          whatsapp_sent: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // =====================================================
  // TESTIMONIALS SERVICES
  // =====================================================

  async getTestimonials() {
    try {
      const { data, error } = await supabaseClient
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  },

  // =====================================================
  // OFFERS SERVICES
  // =====================================================

  async getActiveOffers() {
    try {
      const { data, error } = await supabaseClient
        .from('offers')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  },

  // =====================================================
  // STORAGE SERVICES (for product images)
  // =====================================================

  async uploadProductImage(file, productId) {
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
      throw error;
    }
  },

  // =====================================================
  // OFFERS SERVICES
  // =====================================================

  // Fetch all active offers
  async getActiveOffers() {
    try {
      const { data, error } = await supabaseClient
        .from('offers')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  },

  // =====================================================
  // WISHLIST SERVICES
  // =====================================================

  // Get session ID for wishlist (uses localStorage)
  getSessionId() {
    let sessionId = localStorage.getItem('wishlist_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('wishlist_session_id', sessionId);
    }
    return sessionId;
  },

  // Add product to wishlist
  async addToWishlist(productId) {
    try {
      const sessionId = this.getSessionId();

      const { data, error } = await supabaseClient
        .from('wishlist')
        .insert([{
          session_id: sessionId,
          product_id: productId
        }])
        .select();

      if (error) {
        // If duplicate, it's already in wishlist
        if (error.code === '23505') {
          return { success: true, message: 'Already in wishlist' };
        }
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove product from wishlist
  async removeFromWishlist(productId) {
    try {
      const sessionId = this.getSessionId();

      const { error } = await supabaseClient
        .from('wishlist')
        .delete()
        .eq('session_id', sessionId)
        .eq('product_id', productId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Get user's wishlist
  async getWishlist() {
    try {
      const sessionId = this.getSessionId();

      const { data, error } = await supabaseClient
        .from('wishlist')
        .select('product_id, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  },

  // Get wishlist products with full details
  async getWishlistProducts() {
    try {
      const wishlist = await this.getWishlist();

      if (wishlist.length === 0) return [];

      const productIds = wishlist.map(item => item.product_id);

      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .in('product_id', productIds);

      if (error) throw error;

      return this.transformProducts(data);
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
      return [];
    }
  },

  // Check if product is in wishlist
  async isInWishlist(productId) {
    try {
      const sessionId = this.getSessionId();

      const { data, error } = await supabaseClient
        .from('wishlist')
        .select('id')
        .eq('session_id', sessionId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      return !!data;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  },

  // Get wishlist count
  async getWishlistCount() {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.length;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  },

  // Clear entire wishlist
  async clearWishlist() {
    try {
      const sessionId = this.getSessionId();

      const { error } = await supabaseClient
        .from('wishlist')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  },

  // =====================================================
  // WHATSAPP MESSAGE TEMPLATES
  // =====================================================

  // Generate WhatsApp message for order status
  generateWhatsAppMessage(orderData, status) {
    const orderNumber = orderData.id.substring(0, 8).toUpperCase();
    const customerName = orderData.customer_name;
    const items = this.formatOrderItems(orderData.order_items);
    const total = `₹${parseFloat(orderData.total).toFixed(2)}`;

    const templates = {
      received: `Hello ${customerName}!\n\n` +
        `Thank you! Your order has been received successfully.\n\n` +
        `📋 *Order #${orderNumber}*\n` +
        `${items}\n` +
        `Total: ${total}\n\n` +
        `We will confirm your order shortly.\n\n` +
        `🏪 *Mahalingeshwar Digital Prints & Gifts*\n` +
        `📞 +91 76191 47647`,

      confirmed: `Hello ${customerName}!\n\n` +
        `Your order *#${orderNumber}* has been confirmed.\n\n` +
        `We are preparing your items now. 🎨\n\n` +
        `You'll be notified once everything is ready.\n\n` +
        `🏪 *Mahalingeshwar Digital Prints & Gifts*\n` +
        `📞 +91 76191 47647`,

      ready: `Great news ${customerName}!\n\n` +
        `Your order *#${orderNumber}* is ready! ✨\n\n` +
        `Your order is ready for pickup/delivery.\n\n` +
        `Feel free to contact us for any questions.\n\n` +
        `🏪 *Mahalingeshwar Digital Prints & Gifts*\n` +
        `📞 +91 76191 47647`,

      completed: `Thank you ${customerName}!\n\n` +
        `Your order *#${orderNumber}* has been delivered.\n\n` +
        `How was your experience? 🌟\n` +
        `We'd love to hear your feedback!\n\n` +
        `Thank you for your business. 🙏\n` +
        `Looking forward to serving you again!\n\n` +
        `🏪 *Mahalingeshwar Digital Prints & Gifts*\n` +
        `📞 +91 76191 47647`
    };

    return templates[status] || templates.confirmed;
  },

  // Format order items for message
  formatOrderItems(items) {
    if (!items || !Array.isArray(items)) return 'Your items';

    return items.slice(0, 3).map(item =>
      `• ${item.name} (${item.quantity}x)`
    ).join('\n') + (items.length > 3 ? `\n• and ${items.length - 3} more items...` : '');
  },

  // =====================================================
  // ANALYTICS SERVICES
  // =====================================================

  // Get sales analytics
  async getSalesAnalytics(startDate = null, endDate = null) {
    try {
      let query = supabaseClient
        .from('orders')
        .select('total, created_at, status');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate analytics
      const totalRevenue = data.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const totalOrders = data.length;
      const completedOrders = data.filter(o => o.status === 'completed').length;
      const pendingOrders = data.filter(o => o.status === 'pending').length;
      const confirmedOrders = data.filter(o => o.status === 'confirmed').length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        confirmedOrders,
        averageOrderValue,
        orders: data
      };
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      return null;
    }
  },

  // Get revenue by date range (for charts)
  async getRevenueByDate(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabaseClient
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const revenueByDate = {};
      data.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString();
        if (!revenueByDate[date]) {
          revenueByDate[date] = 0;
        }
        revenueByDate[date] += parseFloat(order.total);
      });

      return Object.entries(revenueByDate).map(([date, revenue]) => ({
        date,
        revenue
      }));
    } catch (error) {
      console.error('Error fetching revenue by date:', error);
      return [];
    }
  },

  // Get product analytics
  async getProductAnalytics() {
    try {
      // Get all orders with items
      const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('order_items, created_at');

      if (error) throw error;

      // Analyze product sales
      const productSales = {};
      const categorySales = {};

      orders.forEach(order => {
        if (Array.isArray(order.order_items)) {
          order.order_items.forEach(item => {
            // Track product sales
            if (!productSales[item.id]) {
              productSales[item.id] = {
                name: item.name,
                category: item.category,
                quantity: 0,
                revenue: 0
              };
            }
            productSales[item.id].quantity += item.quantity || 1;
            productSales[item.id].revenue += (item.price * (item.quantity || 1));

            // Track category sales
            if (!categorySales[item.category]) {
              categorySales[item.category] = {
                quantity: 0,
                revenue: 0
              };
            }
            categorySales[item.category].quantity += item.quantity || 1;
            categorySales[item.category].revenue += (item.price * (item.quantity || 1));
          });
        }
      });

      // Convert to arrays and sort
      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const categoryPerformance = Object.entries(categorySales)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.revenue - a.revenue);

      return {
        topProducts,
        categoryPerformance,
        totalProductsSold: Object.values(productSales).reduce((sum, p) => sum + p.quantity, 0)
      };
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      return null;
    }
  },

  // Get customer analytics
  async getCustomerAnalytics() {
    try {
      const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('customer_name, customer_phone, customer_email, total, created_at');

      if (error) throw error;

      // Group by customer (using phone as unique identifier)
      const customerData = {};

      orders.forEach(order => {
        const key = order.customer_phone;
        if (!customerData[key]) {
          customerData[key] = {
            name: order.customer_name,
            phone: order.customer_phone,
            email: order.customer_email,
            orderCount: 0,
            totalSpent: 0,
            firstOrder: order.created_at,
            lastOrder: order.created_at
          };
        }

        customerData[key].orderCount++;
        customerData[key].totalSpent += parseFloat(order.total);

        // Update last order date
        if (new Date(order.created_at) > new Date(customerData[key].lastOrder)) {
          customerData[key].lastOrder = order.created_at;
        }

        // Update first order date
        if (new Date(order.created_at) < new Date(customerData[key].firstOrder)) {
          customerData[key].firstOrder = order.created_at;
        }
      });

      // Convert to array and calculate metrics
      const customers = Object.values(customerData);
      const topCustomers = customers
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      const repeatCustomers = customers.filter(c => c.orderCount > 1).length;
      const newCustomers = customers.filter(c => c.orderCount === 1).length;
      const averageOrdersPerCustomer = customers.length > 0
        ? orders.length / customers.length
        : 0;

      return {
        totalCustomers: customers.length,
        repeatCustomers,
        newCustomers,
        averageOrdersPerCustomer,
        topCustomers,
        customerLifetimeValue: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0
      };
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      return null;
    }
  },

  // Get inventory analytics
  async getInventoryAnalytics() {
    try {
      const { data: products, error } = await supabaseClient
        .from('products')
        .select('name, product_id, stock_quantity, price, in_stock');

      if (error) throw error;

      const lowStock = products.filter(p => p.stock_quantity < 10 && p.in_stock);
      const outOfStock = products.filter(p => !p.in_stock || p.stock_quantity === 0);
      const totalInventoryValue = products.reduce((sum, p) =>
        sum + (p.stock_quantity * parseFloat(p.price)), 0
      );

      return {
        totalProducts: products.length,
        lowStockItems: lowStock.length,
        outOfStockItems: outOfStock.length,
        totalInventoryValue,
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock
      };
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      return null;
    }
  },

  // Get dashboard summary (all analytics at once)
  async getDashboardAnalytics(days = 30) {
    try {
      const [sales, products, customers, inventory] = await Promise.all([
        this.getSalesAnalytics(),
        this.getProductAnalytics(),
        this.getCustomerAnalytics(),
        this.getInventoryAnalytics()
      ]);

      return {
        sales,
        products,
        customers,
        inventory,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return null;
    }
  },

  // Get analytics for specific date range
  async getAnalyticsByDateRange(startDate, endDate) {
    try {
      const sales = await this.getSalesAnalytics(startDate, endDate);
      const revenue = await this.getRevenueByDate(
        Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      );

      return {
        sales,
        revenue,
        dateRange: { startDate, endDate }
      };
    } catch (error) {
      console.error('Error fetching analytics by date range:', error);
      return null;
    }
  },

  // =====================================================
  // INVENTORY MANAGEMENT SERVICES
  // =====================================================

  // Update product stock
  async updateProductStock(productId, newQuantity, changeType = 'adjustment', reason = '', createdBy = 'admin') {
    try {
      // Get current product data
      const { data: product, error: fetchError } = await supabaseClient
        .from('products')
        .select('stock_quantity, name')
        .eq('product_id', productId)
        .single();

      if (fetchError) throw fetchError;

      const quantityBefore = product.stock_quantity;
      const quantityChange = newQuantity - quantityBefore;

      // Update product stock
      const { error: updateError } = await supabaseClient
        .from('products')
        .update({
          stock_quantity: newQuantity,
          in_stock: newQuantity > 0
        })
        .eq('product_id', productId);

      if (updateError) throw updateError;

      // Log in inventory history
      await this.logInventoryChange({
        productId,
        changeType,
        quantityChange,
        quantityBefore,
        quantityAfter: newQuantity,
        reason,
        createdBy
      });

      return { success: true, quantityBefore, quantityAfter: newQuantity };
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  },

  // Adjust stock (add or subtract)
  async adjustStock(productId, quantityChange, changeType = 'adjustment', reason = '', createdBy = 'admin') {
    try {
      // Get current stock
      const { data: product, error: fetchError } = await supabaseClient
        .from('products')
        .select('stock_quantity')
        .eq('product_id', productId)
        .single();

      if (fetchError) throw fetchError;

      const newQuantity = Math.max(0, product.stock_quantity + quantityChange);

      return await this.updateProductStock(productId, newQuantity, changeType, reason, createdBy);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  },

  // Log inventory change
  async logInventoryChange(data) {
    try {
      const { error } = await supabaseClient
        .from('inventory_history')
        .insert([{
          product_id: data.productId,
          change_type: data.changeType,
          quantity_change: data.quantityChange,
          quantity_before: data.quantityBefore,
          quantity_after: data.quantityAfter,
          reason: data.reason || null,
          reference_id: data.referenceId || null,
          created_by: data.createdBy
        }]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging inventory change:', error);
      return { success: false };
    }
  },

  // Get inventory history for a product
  async getInventoryHistory(productId, limit = 50) {
    try {
      const { data, error } = await supabaseClient
        .from('inventory_history')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory history:', error);
      return [];
    }
  },

  // Get all inventory history (for reports)
  async getAllInventoryHistory(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabaseClient
        .from('inventory_history')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all inventory history:', error);
      return [];
    }
  },

  // Create or update stock alert
  async setStockAlert(productId, reorderPoint, reorderQuantity, alertEnabled = true) {
    try {
      const { data, error } = await supabaseClient
        .from('stock_alerts')
        .upsert([{
          product_id: productId,
          reorder_point: reorderPoint,
          reorder_quantity: reorderQuantity,
          alert_enabled: alertEnabled
        }], {
          onConflict: 'product_id'
        })
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error setting stock alert:', error);
      throw error;
    }
  },

  // Get stock alert for product
  async getStockAlert(productId) {
    try {
      const { data, error } = await supabaseClient
        .from('stock_alerts')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data;
    } catch (error) {
      console.error('Error fetching stock alert:', error);
      return null;
    }
  },

  // Get all stock alerts
  async getAllStockAlerts() {
    try {
      const { data, error } = await supabaseClient
        .from('stock_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      return [];
    }
  },

  // Get products needing restock
  async getProductsNeedingRestock() {
    try {
      // Get products with stock alerts
      const { data: alerts, error: alertsError } = await supabaseClient
        .from('stock_alerts')
        .select('product_id, reorder_point, reorder_quantity')
        .eq('alert_enabled', true);

      if (alertsError) throw alertsError;

      if (!alerts || alerts.length === 0) return [];

      // Get products data
      const productIds = alerts.map(a => a.product_id);
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('*')
        .in('product_id', productIds);

      if (productsError) throw productsError;

      // Filter products below reorder point
      const needingRestock = products.filter(product => {
        const alert = alerts.find(a => a.product_id === product.product_id);
        return product.stock_quantity <= alert.reorder_point;
      }).map(product => {
        const alert = alerts.find(a => a.product_id === product.product_id);
        return {
          ...this.transformProduct(product),
          reorderPoint: alert.reorder_point,
          reorderQuantity: alert.reorder_quantity,
          shortfall: alert.reorder_point - product.stock_quantity
        };
      });

      return needingRestock;
    } catch (error) {
      console.error('Error fetching products needing restock:', error);
      return [];
    }
  },

  // Bulk update stock
  async bulkUpdateStock(updates, changeType = 'adjustment', reason = '', createdBy = 'admin') {
    try {
      const results = [];

      for (const update of updates) {
        try {
          const result = await this.updateProductStock(
            update.productId,
            update.quantity,
            changeType,
            reason,
            createdBy
          );
          results.push({ productId: update.productId, success: true, ...result });
        } catch (error) {
          results.push({ productId: update.productId, success: false, error: error.message });
        }
      }

      return {
        total: updates.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('Error in bulk stock update:', error);
      throw error;
    }
  },

  // Get inventory summary
  async getInventorySummary() {
    try {
      const { data: products, error } = await supabaseClient
        .from('products')
        .select('stock_quantity, price, in_stock');

      if (error) throw error;

      const totalProducts = products.length;
      const inStockProducts = products.filter(p => p.in_stock).length;
      const outOfStockProducts = totalProducts - inStockProducts;
      const totalStockUnits = products.reduce((sum, p) => sum + p.stock_quantity, 0);
      const totalStockValue = products.reduce((sum, p) =>
        sum + (p.stock_quantity * parseFloat(p.price)), 0
      );
      const lowStockProducts = products.filter(p =>
        p.stock_quantity > 0 && p.stock_quantity < 10
      ).length;

      return {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        lowStockProducts,
        totalStockUnits,
        totalStockValue
      };
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      return null;
    }
  },

  // =====================================================
  // SITE SETTINGS SERVICES
  // =====================================================

  // Get all site settings
  async getSiteSettings() {
    try {
      const { data, error } = await supabaseClient
        .from('site_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return [];
    }
  },

  // Get a specific site setting by key
  async getSiteSetting(key) {
    try {
      const { data, error } = await supabaseClient
        .from('site_settings')
        .select('*')
        .eq('setting_key', key)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  },

  // Update a site setting
  async updateSiteSetting(key, value, updatedBy = 'admin') {
    try {
      const { data, error } = await supabaseClient
        .from('site_settings')
        .update({
          setting_value: value,
          updated_by: updatedBy
        })
        .eq('setting_key', key)
        .select();

      if (error) throw error;
      console.log(`✅ Updated setting ${key} to ${value}`);
      return data;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  },

  // =====================================================
  // REVIEWS SERVICES
  // =====================================================

  // Get all approved reviews
  async getApprovedReviews(limit = 100) {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching approved reviews:', error);
      return [];
    }
  },

  // Get featured reviews for homepage
  async getFeaturedReviews(limit = 6) {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured reviews:', error);
      return [];
    }
  },

  // Get all reviews (for admin)
  async getAllReviews() {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      return [];
    }
  },

  // Get pending reviews (for admin)
  async getPendingReviews() {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      return [];
    }
  },

  // Submit a review
  async submitReview(reviewData) {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .insert([{
          customer_name: reviewData.customer_name,
          customer_email: reviewData.customer_email || null,
          customer_phone: reviewData.customer_phone || null,
          customer_location: reviewData.customer_location || null,
          rating: reviewData.rating,
          review_title: reviewData.review_title || null,
          review_text: reviewData.review_text,
          product_name: reviewData.product_name || null,
          order_reference: reviewData.order_reference || null,
          is_verified: reviewData.is_verified || false,
          submission_source: reviewData.submission_source || 'website'
        }])
        .select();

      if (error) throw error;
      console.log('✅ Review submitted successfully');
      return data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  // Approve review
  async approveReview(reviewId, approvedBy = 'admin') {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', reviewId)
        .select();

      if (error) throw error;
      console.log('✅ Review approved');
      return data;
    } catch (error) {
      console.error('Error approving review:', error);
      throw error;
    }
  },

  // Reject/Delete review
  async deleteReview(reviewId) {
    try {
      const { error } = await supabaseClient
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      console.log('✅ Review deleted');
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Toggle featured status
  async toggleFeaturedReview(reviewId, isFeatured) {
    try {
      const { data, error } = await supabaseClient
        .from('reviews')
        .update({ is_featured: isFeatured })
        .eq('id', reviewId)
        .select();

      if (error) throw error;
      console.log(`✅ Review ${isFeatured ? 'featured' : 'unfeatured'}`);
      return data;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  },

  // Get review statistics
  async getReviewStatistics() {
    try {
      const { data, error } = await supabaseClient
        .from('review_statistics')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching review statistics:', error);
      return null;
    }
  },

  // Generate unique review request token
  async createReviewRequest(requestData) {
    try {
      const token = this.generateToken();
      const { data, error } = await supabaseClient
        .from('review_requests')
        .insert([{
          customer_name: requestData.customer_name,
          customer_email: requestData.customer_email || null,
          customer_phone: requestData.customer_phone,
          order_reference: requestData.order_reference || null,
          request_token: token
        }])
        .select();

      if (error) throw error;
      console.log('✅ Review request created with token:', token);
      return { ...data[0], token };
    } catch (error) {
      console.error('Error creating review request:', error);
      throw error;
    }
  },

  // Verify review request token
  async verifyReviewToken(token) {
    try {
      const { data, error } = await supabaseClient
        .from('review_requests')
        .select('*')
        .eq('request_token', token)
        .eq('status', 'pending')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  },

  // Mark review request as completed
  async completeReviewRequest(token) {
    try {
      const { error } = await supabaseClient
        .from('review_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('request_token', token);

      if (error) throw error;
      console.log('✅ Review request marked as completed');
      return true;
    } catch (error) {
      console.error('Error completing review request:', error);
      return false;
    }
  },

  // Helper function to generate token
  generateToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  // Check connection
  async testConnection() {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('count')
        .limit(1);

      if (error) throw error;
      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
  }
};

// Test connection on load
SupabaseService.testConnection();
