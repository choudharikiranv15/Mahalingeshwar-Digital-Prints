// =====================================================
// Configuration - Environment Variables
// =====================================================
// This file reads from environment variables
// DO NOT commit this file with real credentials!

const SUPABASE_CONFIG = {
    url: window.env?.VITE_SUPABASE_URL || 'https://jzhfrgexbzzwxstfbvtg.supabase.co',
    anonKey: window.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6aGZyZ2V4Ynp6d3hzdGZidnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzMyNDAsImV4cCI6MjA3NzQwOTI0MH0.l7OaBzk2KBjxBf__HGMN8d1WQZAIwp-EJiUN9QICMoA'
};

// Admin Configuration from Environment Variables
// For Netlify: Set these in Site Settings → Environment Variables
const ADMIN_CONFIG = {
    email: window.env?.VITE_ADMIN_EMAIL,
    password: window.env?.VITE_ADMIN_PASSWORD // ⚠️ Set this securely in Netlify environment variables!
};

// IMPORTANT: Change the default password above to something secure!
// For production (Netlify/Vercel):
// 1. Set environment variables in hosting dashboard
// 2. Use names: VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD
// 3. Never commit real credentials to git
