import { useEffect } from "react"
import supabase from "../lib/supabase"
import { Session } from "@supabase/supabase-js"
import { create } from "zustand"

interface SessionStore {
  session: Session | null
  setSession: (session: Session | null) => void
}

const useSessionStore = create<SessionStore>(set => ({
  session: null,
  setSession: session => set({ session }),
}))

export default function useSession() {
  const { session, setSession } = useSessionStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return { session, logout: () => supabase.auth.signOut() }
}
