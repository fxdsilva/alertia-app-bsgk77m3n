import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { School } from '@/lib/mockData'

export type Profile =
  | 'publico_externo'
  | 'colaborador'
  | 'gestor'
  | 'alta_gestao'
  | 'administrador'
  | 'admin_gestor'
  | 'senior'
  | 'professor'
  | 'DIRETOR_COMPLIANCE'
  | 'ANALISTA_COMPLIANCE'
  | 'operacional'
  | 'SECRETARIA DE EDUCAÇÃO'
  | 'gestao_escola'
  | null

export interface AppContextType {
  session: Session | null
  user: User | null
  profile: Profile
  loading: boolean
  selectedSchool: School | null
  setSelectedSchool: (school: School | null) => void
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
  logout: () => Promise<void> // Alias for signOut
  clearSchool: () => void
  hasAccess: (moduleKey: string) => boolean
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>(null)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (currentUser: User) => {
    try {
      // First check if user is a Master Admin (Senior)
      // Linked via ID in database, so this query works correctly with RLS
      const { data: seniorUser } = await supabase
        .from('usuarios_admin_master' as any)
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
        .select('*, escolas_instituicoes(*)')
        .eq('email', currentUser.email)
        .single()

      if (schoolUser && schoolUser.ativo) {
        setProfile(schoolUser.perfil as Profile)
        // Automatically set selected school for school users
        if (schoolUser.escolas_instituicoes) {
          const item = schoolUser.escolas_instituicoes as any
          const schoolData: School = {
            id: item.id,
            name: item.nome_escola,
            network: item.rede_municipal
              ? 'Municipal'
              : item.rede_estadual
                ? 'Estadual'
                : item.rede_federal
                  ? 'Federal'
                  : 'Privada',
            modality: item.localizacao as 'Urbana' | 'Rural',
            municipality: item.endereco || 'N/A',
            state: 'N/A',
            active: item.ativo, // Strictly use ativo column
          }
          setSelectedSchool(schoolData)
        }
        return
      }

      // Default profile
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
        setSelectedSchool(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
    setSession(null)
    setSelectedSchool(null)
  }

  const clearSchool = () => {
    setSelectedSchool(null)
  }

  const hasAccess = (moduleKey: string) => {
    // Basic implementation - expand based on RBAC requirements
    return true
  }

  return (
    <AppContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        selectedSchool,
        setSelectedSchool,
        signIn,
        signOut,
        logout: signOut,
        clearSchool,
        hasAccess,
      }}
    >
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
