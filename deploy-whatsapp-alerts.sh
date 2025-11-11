#!/bin/bash
# Deploy WhatsApp Stock Alert Function to Supabase

echo "🚀 Deploying WhatsApp Stock Alert Function..."

# Make sure you have Supabase CLI installed
# If not, run: npm install -g supabase

# Login to Supabase (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref jzhfrgexbzzwxstfbvtg

# Deploy the function
supabase functions deploy stock-alert-whatsapp

# Set environment variables (secrets)
echo "📝 Setting up environment variables..."
echo "You'll need to set these secrets in Supabase Dashboard:"
echo "1. INTERAKT_API_KEY - Your InteraktAI API key"
echo "2. WHATSAPP_RECIPIENT - +917619147647"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to Supabase Dashboard → Edge Functions"
echo "2. Click on 'stock-alert-whatsapp' function"
echo "3. Go to Settings → Secrets"
echo "4. Add these 4 secrets:"
echo "   - TWILIO_ACCOUNT_SID: your_account_sid"
echo "   - TWILIO_AUTH_TOKEN: your_auth_token"
echo "   - TWILIO_WHATSAPP_NUMBER: whatsapp:+14155238886"
echo "   - WHATSAPP_RECIPIENT: +917619147647"
echo "5. Run setup-whatsapp-scheduler.sql in SQL Editor"
echo ""
echo "See TWILIO-SETUP-STEPS.txt for detailed instructions"
