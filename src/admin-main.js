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

console.log('✅ Admin dashboard entry point loaded');
console.log('✅ AnalyticsManager available:', typeof AnalyticsManager);
console.log('✅ InventoryManager available:', typeof InventoryManager);
