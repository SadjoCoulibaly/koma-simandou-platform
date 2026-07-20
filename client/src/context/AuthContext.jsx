import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [session, setSession] = useState(null)
  const [role, setRole]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = async (userId) => {
    if (!userId) { setRole(null); return }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      setRole(data?.role ?? 'user')
    } catch {
      setRole('user')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.access_token) {
        localStorage.setItem('sb-access-token', session.access_token)
      }
      setLoading(false)
      fetchRole(session?.user?.id ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.access_token) {
        localStorage.setItem('sb-access-token', session.access_token)
      } else {
        localStorage.removeItem('sb-access-token')
      }
      setLoading(false)
      fetchRole(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: metadata },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setRole(null)
  }

  const isAdmin = Boolean(
    user && (
      role === 'admin' ||
      user?.app_metadata?.role === 'admin'
    )
  )

  return (
    <AuthContext.Provider value={{ user, session, loading, role, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
