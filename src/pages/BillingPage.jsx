// src/pages/BillingPage.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const C = {
  navy: '#0B1F3A', navyMid: '#152D50', sky: '#4A90D9', skyLt: '#7FBCF0',
  mint: '#00C4A0', mintD: '#00957A', amber: '#F5A623', coral: '#E86252',
  gold: '#D4AF37', border: 'rgba(74,144,217,.18)',
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 79,
    period: '/mo',
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER,
    color: C.sky,
    features: [
      '3 users',
      '50 AI documents / month',
      'COC, COA, COO, MTR',
      'PDF export',
      'Email delivery',
      'Document library',
      '5GB storage',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 199,
    period: '/mo',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL,
    color: C.mint,
    popular: true,
    features: [
      '10 users',
      'Unlimited AI documents',
      'All 12 document types',
      'PPAP tracker (all levels)',
      'Full QMS dashboard',
      'NCR & CAPA register',
      'Supplier quality module',
      'Audit manager',
      '25GB storage',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    period: '/mo',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE,
    color: C.gold,
    features: [
      'Unlimited users',
      'Unlimited everything',
      'Multi-site / multi-standard',
      'White-label option',
      'ERP / PLM integration',
      'Custom AI system prompt',
      'SSO / SAML',
      'Dedicated success manager',
      'SLA guarantee',
      'Unlimited storage',
    ],
  },
]

export default function BillingPage() {
  const { org, user } = useAuth()
  const [loading, setLoading] = useState(null)

  const currentPlan = org?.plan || 'trial'

  async function checkout(plan) {
    if (loading) return
    setLoading(plan.id)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          orgId: org?.id,
          email: user?.email,
          planName: plan.name,
        }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      alert('Billing error: ' + err.message)
    } finally {
      setLoading(null)
    }
  }

  async function manageSubscription() {
    setLoading('manage')
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: org?.id }),
    })
    const { url } = await res.json()
    window.location.href = url
    setLoading(null)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.navy, minHeight: '100vh', padding: '32px 24px', color: '#fff' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: C.skyLt, marginBottom: 8, fontWeight: 500 }}>Pricing</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Choose your plan</h1>
          <p style={{ color: 'rgba(255,255,255,.45)', marginTop: 10, fontSize: 14 }}>
            Compliance that pays for itself. Cancel anytime.
          </p>
          {currentPlan !== 'trial' && (
            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: C.mint }}>Current plan: {currentPlan}</span>
              <button onClick={manageSubscription} disabled={loading === 'manage'}
                style={{ fontSize: 11, padding: '4px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 20, color: C.skyLt, cursor: 'pointer', fontFamily: 'inherit' }}>
                Manage subscription →
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id
            return (
              <div key={plan.id} style={{ background: C.navyMid, border: `1px solid ${plan.popular ? plan.color : C.border}`, borderRadius: 14, padding: 24, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, borderRadius: 20, padding: '3px 14px', fontSize: 11, fontWeight: 600, color: C.navy, whiteSpace: 'nowrap' }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 700 }}>${plan.price}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>{plan.period}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.8)' }}>
                      <span style={{ color: plan.color, fontSize: 14, flexShrink: 0 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => isCurrent ? null : checkout(plan)} disabled={loading === plan.id || isCurrent}
                  style={{ width: '100%', padding: '11px 0', background: isCurrent ? 'rgba(74,144,217,.15)' : plan.popular ? plan.color : 'transparent', border: isCurrent ? `1px solid ${C.border}` : plan.popular ? 'none' : `1px solid ${plan.color}`, borderRadius: 8, color: isCurrent ? 'rgba(255,255,255,.4)' : plan.popular ? C.navy : plan.color, fontSize: 13, fontWeight: 600, cursor: isCurrent ? 'default' : 'pointer', fontFamily: 'inherit', transition: '.15s' }}>
                  {loading === plan.id ? 'Redirecting…' : isCurrent ? 'Current Plan' : 'Get Started'}
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.25)', marginTop: 24 }}>
          All plans include a 14-day free trial. Billed annually saves 20%.
        </p>
      </div>
    </div>
  )
}
