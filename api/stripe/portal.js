// api/stripe/portal.js — Customer billing portal
export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { orgId } = await req.json()
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const appUrl   = process.env.VITE_APP_URL || 'https://your-app.vercel.app'

  // Look up stripe_customer_id from Supabase
  const sbRes = await fetch(
    `${process.env.VITE_SUPABASE_URL}/rest/v1/organizations?id=eq.${orgId}&select=stripe_customer_id`,
    { headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}` } }
  )
  const [org] = await sbRes.json()

  const params = new URLSearchParams({
    customer: org.stripe_customer_id,
    return_url: `${appUrl}/billing`,
  })

  const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  const portal = await portalRes.json()

  return new Response(JSON.stringify({ url: portal.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
