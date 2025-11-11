// Supabase Edge Function: WhatsApp Stock Alerts
// Checks inventory and sends alerts via InteraktAI WhatsApp API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Product {
  product_id: string;
  name: string;
  stock_quantity: number;
  category?: string;
}

interface StockAlert {
  product_id: string;
  reorder_point: number;
  reorder_quantity: number;
  alert_enabled: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get alert type from request (low_stock or daily_summary)
    const { alertType = 'low_stock' } = await req.json()

    console.log(`Running stock alert check: ${alertType}`)

    // Fetch all products
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('product_id, name, stock_quantity, category')
      .order('name')

    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`)
    }

    // Fetch stock alerts configuration
    const { data: stockAlerts, error: alertsError } = await supabaseClient
      .from('stock_alerts')
      .select('*')
      .eq('alert_enabled', true)

    if (alertsError) {
      throw new Error(`Error fetching stock alerts: ${alertsError.message}`)
    }

    // Create a map of product_id to alert settings
    const alertMap = new Map(
      stockAlerts?.map(alert => [alert.product_id, alert]) || []
    )

    if (alertType === 'low_stock') {
      // LOW STOCK ALERT - Only send if products are low
      const lowStockProducts = products?.filter(product => {
        const alert = alertMap.get(product.product_id)
        if (!alert) return false
        return product.stock_quantity <= alert.reorder_point
      }) || []

      if (lowStockProducts.length === 0) {
        console.log('No low stock products. Skipping WhatsApp notification.')
        return new Response(
          JSON.stringify({
            success: true,
            message: 'No low stock products',
            skipped: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Format low stock message
      const productList = lowStockProducts.map((product, index) => {
        const alert = alertMap.get(product.product_id)
        return `${index + 1}️⃣ *${product.name}*\n   Current: ${product.stock_quantity} units\n   Reorder at: ${alert?.reorder_point || 0} units`
      }).join('\n\n')

      const message = `⚠️ *Low Stock Alert*\n\n${lowStockProducts.length} products are running low:\n\n${productList}\n\nPlease reorder soon!\n\n- Mahalingeshwar Stock Alert System`

      // Send WhatsApp message
      await sendWhatsAppMessage(message)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Low stock alert sent',
          lowStockCount: lowStockProducts.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (alertType === 'daily_summary') {
      // DAILY SUMMARY - Complete stock report at 10 AM
      const totalProducts = products?.length || 0
      const lowStockProducts = products?.filter(product => {
        const alert = alertMap.get(product.product_id)
        if (!alert) return false
        return product.stock_quantity <= alert.reorder_point
      }) || []

      const goodStockProducts = products?.filter(product => {
        const alert = alertMap.get(product.product_id)
        if (!alert) return true // If no alert config, assume good
        return product.stock_quantity > alert.reorder_point
      }) || []

      // Format summary message
      let message = `📊 *Daily Stock Summary*\n\n`
      message += `📅 Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n`
      message += `*Overview:*\n`
      message += `• Total Products: ${totalProducts}\n`
      message += `• Low Stock: ${lowStockProducts.length} ⚠️\n`
      message += `• Good Stock: ${goodStockProducts.length} ✅\n\n`

      // Show low stock items if any
      if (lowStockProducts.length > 0) {
        message += `*⚠️ Low Stock Items (${lowStockProducts.length}):*\n\n`
        lowStockProducts.slice(0, 10).forEach((product, index) => {
          const alert = alertMap.get(product.product_id)
          message += `${index + 1}. ${product.name}\n   📦 ${product.stock_quantity} units (Min: ${alert?.reorder_point || 0})\n\n`
        })

        if (lowStockProducts.length > 10) {
          message += `_...and ${lowStockProducts.length - 10} more items_\n\n`
        }
      }

      // Show sample of good stock items
      if (goodStockProducts.length > 0) {
        message += `*✅ Good Stock (showing 5):*\n\n`
        goodStockProducts.slice(0, 5).forEach((product, index) => {
          message += `${index + 1}. ${product.name}: ${product.stock_quantity} units\n`
        })

        if (goodStockProducts.length > 5) {
          message += `_...and ${goodStockProducts.length - 5} more_\n\n`
        }
      }

      message += `\n- Mahalingeshwar Stock Management`

      // Send WhatsApp message
      await sendWhatsAppMessage(message)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Daily summary sent',
          totalProducts,
          lowStockCount: lowStockProducts.length,
          goodStockCount: goodStockProducts.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid alert type' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Function to send WhatsApp message via Twilio
async function sendWhatsAppMessage(message: string) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER') // e.g., whatsapp:+14155238886
  const recipientPhone = Deno.env.get('WHATSAPP_RECIPIENT') // +917619147647

  if (!twilioAccountSid || !twilioAuthToken) {
    throw new Error('Twilio credentials not configured')
  }

  if (!twilioWhatsAppNumber) {
    throw new Error('TWILIO_WHATSAPP_NUMBER not configured')
  }

  if (!recipientPhone) {
    throw new Error('WHATSAPP_RECIPIENT not configured')
  }

  console.log(`Sending WhatsApp to ${recipientPhone} via Twilio`)

  // Twilio API endpoint
  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`

  // Create auth header
  const authHeader = 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`)

  // Format phone numbers for Twilio
  const formattedRecipient = `whatsapp:${recipientPhone}`

  // Prepare form data
  const formData = new URLSearchParams({
    From: twilioWhatsAppNumber,
    To: formattedRecipient,
    Body: message
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twilio API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  console.log('WhatsApp sent successfully via Twilio:', result)
  return result
}
