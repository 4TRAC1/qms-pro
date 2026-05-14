// src/components/MainLayout.jsx
import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Dashboard      from './Dashboard'
import DocStudio      from './DocStudio'
import NCRRegister    from './NCRRegister'
import PPAPTracker    from './PPAPTracker'
import AuditManager   from './AuditManager'
import SettingsPanel  from './SettingsPanel'
import DocumentLibrary from './DocumentLibrary'

const C = {
  navy: '#0B1F3A', navyMid: '#152D50', sky: '#4A90D9', skyLt: '#7FBCF0',
  mint: '#00C4A0', amber: '#F5A623', coral: '#E86252', border: 'rgba(74,144,217,.18)',
}

const NAV = [
  { path: '/dashboard',  icon: '▦',  label: 'Dashboard' },
  { path: '/docs',       icon: '✦',  label: 'AI Doc Studio' },
  { path: '/library',   icon: '📄', label: 'Document Library' },
  { path: '/ppap',       icon: '◈',  label: 'PPAP Tracker' },
  { path: '/ncr',        icon: '⚠',  label: 'Nonconformances' },
  { path: '/audits',     icon: '✓',  label: 'Audit Manager' },
  { path: '/settings',   icon: '⚙',  label: 'Settings' },
]

const PLAN_COLORS = { trial: C.amber, starter: C.sky, professional: C.mint, enterprise: C.gold }

export default function MainLayout() {
  const { org, user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const planColor  = PLAN_COLORS[org?.plan || 'trial'] || C.amber
  const activePath = '/' + location.pathname.split('/')[1]

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.navy, fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: collapsed ? 58 : 220, minWidth: collapsed ? 58 : 220, background: C.navyMid, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', transition: 'width .2s', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '14px 15px' : '14px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ background: C.sky, borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', fontFamily: 'monospace', color: '#fff', flexShrink: 0 }}>Q</div>
          {!collapsed && <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>QMS Pro</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: 'monospace' }}>AI Compliance</div>
          </div>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: 14, padding: 2 }}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Company pill */}
        {!collapsed && org && (
          <div style={{ margin: '10px 12px', padding: '8px 10px', background: 'rgba(11,31,58,.5)', borderRadius: 8, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{org.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: `${planColor}22`, color: planColor, border: `1px solid ${planColor}44`, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {org.plan || 'Trial'}
              </span>
              {org.cage_code && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>CAGE {org.cage_code}</span>}
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {NAV.map(item => {
            const active = activePath === item.path || (item.path === '/dashboard' && activePath === '/')
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: collapsed ? '10px 17px' : '9px 14px', border: 'none', background: active ? 'rgba(74,144,217,.15)' : 'none', color: active ? C.skyLt : 'rgba(255,255,255,.55)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', borderLeft: `3px solid ${active ? C.sky : 'transparent'}`, transition: '.12s' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Bottom: billing + sign out */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 12px', flexShrink: 0 }}>
          {!collapsed && (
            <button onClick={() => navigate('/billing')} style={{ display: 'block', width: '100%', padding: '7px 10px', background: 'rgba(74,144,217,.1)', border: `1px solid ${C.border}`, borderRadius: 7, color: C.skyLt, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', marginBottom: 6, textAlign: 'center' }}>
              {org?.plan === 'trial' ? '⚡ Upgrade Plan' : '💳 Manage Billing'}
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.email}</div>
              </div>
              <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: 13 }} title="Sign out">⏏</button>
            </>}
          </div>
        </div>
      </div>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/docs"      element={<DocStudio />} />
          <Route path="/library"  element={<DocumentLibrary />} />
          <Route path="/ppap"      element={<PPAPTracker />} />
          <Route path="/ncr"       element={<NCRRegister />} />
          <Route path="/audits"    element={<AuditManager />} />
          <Route path="/settings"  element={<SettingsPanel />} />
        </Routes>
      </div>
    </div>
  )
}
