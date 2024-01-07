import { useEffect } from 'react'
import supabase from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { create } from 'zustand'

interface SessionStore {
  session: Session | null
  setSession: (session: Session | null) => void
  logout: () => void
}

const useSessionStore = create<SessionStore>(set => ({
  session: null,
  setSession: session => set({ session }),
  logout: () => supabase.auth.signOut(),
}))

export function useCreateSession() {
  const { session, setSession } = useSessionStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return { session }
}

export default useSessionStore
