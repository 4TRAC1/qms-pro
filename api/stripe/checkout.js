// api/stripe/checkout.js — Vercel Edge Function
// Creates a Stripe Checkout session for plan upgrades.

export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { priceId, orgId, email, planName } = await req.json()

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const appUrl = process.env.VITE_APP_URL || 'https://your-app.vercel.app'

  const params = new URLSearchParams({
    'mode': 'subscription',
    'payment_method_types[]': 'card',
    'customer_email': email,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'metadata[org_id]': orgId,
    'metadata[plan_name]': planName,
    'success_url': `${appUrl}/dashboard?upgrade=success`,
    'cancel_url': `${appUrl}/billing`,
    'allow_promotion_codes': 'true',
    'subscription_data[trial_period_days]': '14',
  })

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const session = await stripeRes.json()
  if (session.error) {
    return new Response(JSON.stringify({ error: session.error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
