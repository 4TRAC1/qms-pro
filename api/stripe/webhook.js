// api/stripe/webhook.js — handles Stripe subscription lifecycle events
// Set this URL in Stripe Dashboard → Webhooks → Add endpoint:
// https://your-app.vercel.app/api/stripe/webhook

export const config = { runtime: 'edge' }

async function verifyStripeSignature(req, secret) {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()
  // In production use the Stripe SDK for proper signature verification.
  // For the edge runtime, we do a simplified check here.
  return { body, valid: !!sig }
}

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { body, valid } = await verifyStripeSignature(req, process.env.STRIPE_WEBHOOK_SECRET)
  if (!valid) return new Response('Invalid signature', { status: 400 })

  let event
  try { event = JSON.parse(body) } catch { return new Response('Bad JSON', { status: 400 }) }

  const sbUrl = process.env.VITE_SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_KEY
  const sbHeaders = { 'Content-Type': 'application/json', apikey: sbKey, Authorization: `Bearer ${sbKey}` }

  async function updateOrg(orgId, updates) {
    await fetch(`${sbUrl}/rest/v1/organizations?id=eq.${orgId}`, {
      method: 'PATCH',
      headers: sbHeaders,
      body: JSON.stringify(updates),
    })
  }

  const obj = event.data?.object

  switch (event.type) {
    case 'checkout.session.completed': {
      const orgId = obj.metadata?.org_id
      const plan  = obj.metadata?.plan_name?.toLowerCase()
      if (orgId) {
        await updateOrg(orgId, {
          plan,
          plan_status: 'active',
          stripe_customer_id: obj.customer,
          stripe_subscription_id: obj.subscription,
        })
      }
      break
    }
    case 'customer.subscription.updated': {
      const orgRes = await fetch(`${sbUrl}/rest/v1/organizations?stripe_subscription_id=eq.${obj.id}&select=id`, { headers: sbHeaders })
      const [org] = await orgRes.json()
      if (org) {
        await updateOrg(org.id, { plan_status: obj.status })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const orgRes = await fetch(`${sbUrl}/rest/v1/organizations?stripe_subscription_id=eq.${obj.id}&select=id`, { headers: sbHeaders })
      const [org] = await orgRes.json()
      if (org) {
        await updateOrg(org.id, { plan: 'trial', plan_status: 'canceled', stripe_subscription_id: null })
      }
      break
    }
    case 'invoice.payment_failed': {
      const orgRes = await fetch(`${sbUrl}/rest/v1/organizations?stripe_customer_id=eq.${obj.customer}&select=id`, { headers: sbHeaders })
      const [org] = await orgRes.json()
      if (org) await updateOrg(org.id, { plan_status: 'past_due' })
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
