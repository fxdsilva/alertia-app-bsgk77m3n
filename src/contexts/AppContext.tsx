import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export type Profile =
  | 'publico_externo'
  | 'colaborador'
  | 'gestor'
  | 'alta_gestao'
  | 'administrador'
  | 'admin_gestor'
  | 'senior'
  | null

export interface AppContextType {
  session: Session | null
  user: User | null
  profile: Profile
  loading: boolean
  signOut: () => Promise<void>
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (currentUser: User) => {
    try {
      // First check if user is a Master Admin (Senior)
      const { data: seniorUser } = await supabase
        .from('usuarios_admin_master' as any) // Using any because table is new
        .select('*')
        .eq('email', currentUser.email)
        .single()

      if (seniorUser && seniorUser.ativo) {
        setProfile('senior')
        return
      }

      // Then check standard school users
      const { data: schoolUser } = await supabase
        .from('usuarios_escola')
        .select('perfil, ativo')
        .eq('email', currentUser.email)
        .single()

      if (schoolUser && schoolUser.ativo) {
        setProfile(schoolUser.perfil as Profile)
        return
      }

      // Default profile if logged in but no specific role found
      setProfile('publico_externo')
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile('publico_externo')
    }
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user).then(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchProfile(session.user).then(() => setLoading(false))
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
    setSession(null)
  }

  return (
    <AppContext.Provider value={{ session, user, profile, loading, signOut }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
