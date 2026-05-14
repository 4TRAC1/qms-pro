// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [org, setOrg]         = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadOrgAndProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadOrgAndProfile(session.user.id)
      else { setOrg(null); setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadOrgAndProfile(userId) {
    try {
      // Load org membership
      const { data: membership } = await supabase
        .from('org_members')
        .select('*, organizations(*)')
        .eq('user_id', userId)
        .single()

      if (membership?.organizations) {
        setOrg(membership.organizations)
        setProfile({ role: membership.role })
      }
    } catch (e) {
      console.warn('No org found for user:', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateCompanyProfile(updates) {
    if (!org?.id) return
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', org.id)
      .select()
      .single()
    if (!error && data) setOrg(data)
    return { data, error }
  }

  async function signUp({ email, password, companyName, cageCode }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error || !data.user) return { error }

    // Create organization
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: companyName, cage_code: cageCode, plan: 'trial' })
      .select()
      .single()
    if (orgError) return { error: orgError }

    // Add user as owner
    await supabase.from('org_members').insert({
      org_id: newOrg.id,
      user_id: data.user.id,
      role: 'owner',
    })

    return { data }
  }

  async function signIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = { user, org, profile, loading, signUp, signIn, signOut, updateCompanyProfile }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
