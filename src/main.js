import './style.css'; // Import global styles
import './wishlist-styles.css'; // Import wishlist styles

import { SUPABASE_CONFIG, ADMIN_CONFIG } from './config.js';
import { SupabaseService } from './supabase-service.js';
import './wishlist.js';
import './wishlist-ui-enhancer.js';
import './app.js';

// Make SupabaseService and Configs globally available if needed by old inline scripts or for debugging
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.ADMIN_CONFIG = ADMIN_CONFIG;
window.SupabaseService = SupabaseService;

console.log('Vite entry point main.js loaded');
