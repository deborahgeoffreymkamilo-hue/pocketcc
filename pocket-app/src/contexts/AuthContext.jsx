import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'nadia.rashid@gmail.com'
}

const DEMO_PROFILE = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Nadia Rashid',
  currency: 'TZS',
  country: 'Tanzania',
  budget_style: 'balanced'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if demo session is active in localStorage
    const savedDemo = localStorage.getItem('pocket_demo_mode')
    if (savedDemo === 'true' || !isSupabaseConfigured) {
      setUser(DEMO_USER)
      setProfile(DEMO_PROFILE)
      setIsDemo(true)
      setLoading(false)
      return
    }

    // Otherwise check Supabase session
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      })

      return () => subscription?.unsubscribe()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data || DEMO_PROFILE)
    } catch {
      setProfile(DEMO_PROFILE)
    }
  }

  const enterDemoMode = () => {
    localStorage.setItem('pocket_demo_mode', 'true')
    setUser(DEMO_USER)
    setProfile(DEMO_PROFILE)
    setIsDemo(true)
  }

  const exitDemoMode = () => {
    localStorage.removeItem('pocket_demo_mode')
    setUser(null)
    setProfile(null)
    setIsDemo(false)
  }

  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured) {
      enterDemoMode()
      return { data: { user: DEMO_USER }, error: null }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      enterDemoMode()
      return { data: { user: DEMO_USER }, error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      enterDemoMode()
      return { data: {}, error: null }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    return { data, error }
  }

  const signOut = async () => {
    if (isDemo) {
      exitDemoMode()
      return { error: null }
    }
    const { error } = await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    return { error }
  }

  const updateProfile = async (updates) => {
    setProfile(prev => ({ ...prev, ...updates }))
    if (isSupabaseConfigured && user) {
      await supabase.from('profiles').update(updates).eq('id', user.id)
    }
    return { data: { ...profile, ...updates }, error: null }
  }

  const value = {
    user,
    profile,
    loading,
    isDemo,
    isSupabaseConfigured,
    enterDemoMode,
    exitDemoMode,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
