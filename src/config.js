// =====================================================
// Configuration - Environment Variables
// =====================================================
// This file reads from environment variables
// DO NOT commit this file with real credentials!

export const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
};

// Admin Configuration from Environment Variables
// For Netlify: Set these in Site Settings → Environment Variables
export const ADMIN_CONFIG = {
    email: import.meta.env.VITE_ADMIN_EMAIL,
    password: import.meta.env.VITE_ADMIN_PASSWORD // ⚠️ Set this securely in Netlify environment variables!
};

// IMPORTANT: Change the default password above to something secure!
// For production (Netlify/Vercel):
// 1. Set environment variables in hosting dashboard
// 2. Use names: VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD
// 3. Never commit real credentials to git
