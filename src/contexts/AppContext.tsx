import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { School, User } from '@/lib/mockData'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Session } from '@supabase/supabase-js'

interface AppContextType {
  selectedSchool: School | null
  user: User | null
  isAuthenticated: boolean
  selectSchool: (school: School) => void
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => void
  clearSchool: () => void
  loading: boolean
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(() => {
    const stored = localStorage.getItem('alertia_school')
    return stored ? JSON.parse(stored) : null
  })

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Persist selected school
    if (selectedSchool) {
      localStorage.setItem('alertia_school', JSON.stringify(selectedSchool))
    } else {
      localStorage.removeItem('alertia_school')
    }
  }, [selectedSchool])

  // Initialize Supabase Auth
  useEffect(() => {
    const fetchProfile = async (sessionUser: any) => {
      try {
        const { data: profile, error } = await supabase
          .from('usuarios_escola')
          .select('*, escolas_instituicoes(*)')
          .eq('id', sessionUser.id)
          .single()

        if (error) {
          console.error('Profile fetch error:', error)
          setUser({
            id: sessionUser.id,
            name: sessionUser.email || 'Usuário',
            email: sessionUser.email || '',
            role: (sessionUser.user_metadata?.role as any) || 'external',
          })
        } else {
          setUser({
            id: profile.id,
            name: profile.nome_usuario || sessionUser.email || 'Usuário',
            email: profile.email || sessionUser.email || '',
            role: (profile.perfil as any) || 'external',
            escola_id: profile.escola_id,
          })

          // Automatically select school for admins
          if (
            (profile.perfil === 'administrador' ||
              profile.perfil === 'admin_gestor') &&
            profile.escolas_instituicoes
          ) {
            const schoolData = profile.escolas_instituicoes as any
            const school: School = {
              id: schoolData.id,
              name: schoolData.nome_escola,
              network: schoolData.rede_municipal
                ? 'Municipal'
                : schoolData.rede_estadual
                  ? 'Estadual'
                  : schoolData.rede_federal
                    ? 'Federal'
                    : 'Privada',
              modality: schoolData.localizacao,
              municipality: 'N/A',
              state: 'N/A',
              status: schoolData.status_adesao,
            }
            setSelectedSchool(school)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const selectSchool = (school: School) => {
    setSelectedSchool(school)
  }

  const clearSchool = () => {
    setSelectedSchool(null)
  }

  const login = async (email: string, password?: string): Promise<boolean> => {
    if (!password) {
      console.warn('Password required for real auth')
      return false
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error(error)
      return false
    }
    return true
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setSelectedSchool(null)
    localStorage.removeItem('alertia_school')
  }

  return React.createElement(
    AppContext.Provider,
    {
      value: {
        selectedSchool,
        user,
        isAuthenticated: !!user,
        selectSchool,
        login,
        logout,
        clearSchool,
        loading,
      },
    },
    children,
  )
}
