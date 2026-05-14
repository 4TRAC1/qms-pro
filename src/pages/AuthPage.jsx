// src/pages/AuthPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const C = {
  navy: '#0B1F3A', navyMid: '#152D50', sky: '#4A90D9', skyLt: '#7FBCF0',
  mint: '#00C4A0', amber: '#F5A623', coral: '#E86252', border: 'rgba(74,144,217,.25)',
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.45)', marginBottom: 5, fontWeight: 500 }}>
        {label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(11,31,58,.8)', border: `1px solid ${C.border}`, borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 13, padding: '10px 13px', outline: 'none', boxSizing: 'border-box', transition: '.15s' }}
        onFocus={e => e.target.style.borderColor = C.sky}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  )
}

export default function AuthPage() {
  const [mode, setMode]           = useState('login')   // login | signup
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [company, setCompany]     = useState('')
  const [cage, setCage]           = useState('')
  const [error, setError]         = useState('')
  const [busy, setBusy]           = useState(false)
  const { signIn, signUp }        = useAuth()
  const navigate                  = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') {
        const { error } = await signIn({ email, password })
        if (error) throw error
        navigate('/dashboard')
      } else {
        if (!company.trim()) throw new Error('Company name is required')
        const { error } = await signUp({ email, password, companyName: company, cageCode: cage })
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: 20 }}>

      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(74,144,217,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,217,.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ background: C.sky, borderRadius: 8, padding: '5px 14px', fontSize: 16, fontWeight: 700, letterSpacing: '.05em', fontFamily: 'monospace', color: '#fff' }}>
              QMS PRO
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontFamily: 'monospace' }}>
            AI Compliance Platform
          </div>
        </div>

        {/* Card */}
        <div style={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 14, padding: '28px 32px' }}>

          {/* Mode switcher */}
          <div style={{ display: 'flex', background: 'rgba(11,31,58,.6)', borderRadius: 8, padding: 4, marginBottom: 24 }}>
            {[['login', 'Sign In'], ['signup', 'Create Account']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', transition: '.15s', fontWeight: mode === m ? 600 : 400, background: mode === m ? C.sky : 'transparent', color: mode === m ? '#fff' : 'rgba(255,255,255,.45)' }}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <Field label="Company name" value={company} onChange={setCompany} placeholder="Acme Manufacturing LLC" />
                <Field label="CAGE code (optional)" value={cage} onChange={setCage} placeholder="3KXB4" />
              </>
            )}
            <Field label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@yourcompany.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder={mode === 'signup' ? 'Min. 8 characters' : ''} />

            {error && (
              <div style={{ background: 'rgba(232,98,82,.12)', border: '1px solid rgba(232,98,82,.3)', borderRadius: 7, padding: '9px 12px', fontSize: 12, color: C.coral, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={busy}
              style={{ width: '100%', padding: '11px 0', background: busy ? 'rgba(74,144,217,.5)' : C.sky, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: busy ? 'not-allowed' : 'pointer', transition: '.15s', marginTop: 4 }}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'signup' && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 14, lineHeight: 1.5, textAlign: 'center' }}>
              By creating an account you agree to our Terms of Service. Your 14-day free trial starts immediately — no credit card required.
            </p>
          )}
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['ISO 9001:2015', 'IATF 16949', 'AIAG PPAP', 'AS9145'].map(s => (
            <span key={s} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 20, background: 'rgba(74,144,217,.1)', border: `1px solid ${C.border}`, color: C.skyLt, fontFamily: 'monospace' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
