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
import { toast } from 'sonner'

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

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
        setSelectedSchool(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (!session?.user) {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let isMounted = true

    if (user) {
      setLoading(true)
      const loadProfile = async () => {
        try {
          // First check if user is a Master Admin (Senior)
          const { data: seniorUser } = await supabase
            .from('usuarios_admin_master' as any)
            .select('*')
            .eq('email', user.email)
            .maybeSingle()

          if (seniorUser && seniorUser.ativo) {
            if (isMounted) {
              setProfile('senior')
              setLoading(false)
            }
            return
          }

          // Then check standard school users
          const { data: schoolUser } = await supabase
            .from('usuarios_escola')
            .select('*, escolas_instituicoes(*)')
            .eq('id', user.id)
            .maybeSingle()

          if (schoolUser && schoolUser.ativo) {
            // Institutional Access Validation
            const isSchoolSpecific = ![
              'ANALISTA_COMPLIANCE',
              'DIRETOR_COMPLIANCE',
              'SECRETARIA DE EDUCAÇÃO',
            ].includes(schoolUser.perfil)

            if (isSchoolSpecific) {
              if (
                !schoolUser.escolas_instituicoes ||
                !(schoolUser.escolas_instituicoes as any).ativo
              ) {
                toast.error(
                  'Sua instituição está inativa ou você não possui vínculo ativo. Entre em contato com o suporte.',
                )
                await supabase.auth.signOut()
                if (isMounted) setLoading(false)
                return
              }
            }

            if (isMounted) {
              setProfile(schoolUser.perfil as Profile)
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
                  active: item.ativo,
                }
                setSelectedSchool(schoolData)
              }
              setLoading(false)
            }
            return
          }

          // Incomplete Profile Handling
          toast.error(
            'Perfil de usuário não encontrado. Entre em contato com o suporte.',
          )
          await supabase.auth.signOut()
          if (isMounted) setLoading(false)
        } catch (error) {
          console.error('Error fetching profile:', error)
          toast.error('Erro ao carregar perfil de usuário.')
          await supabase.auth.signOut()
          if (isMounted) setLoading(false)
        }
      }

      loadProfile()
    }

    return () => {
      isMounted = false
    }
  }, [user])

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
