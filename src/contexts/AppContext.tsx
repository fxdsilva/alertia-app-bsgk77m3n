import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { School, User, users } from '@/lib/mockData'

interface AppContextType {
  selectedSchool: School | null
  user: User | null
  isAuthenticated: boolean
  selectSchool: (school: School) => void
  login: (email: string) => Promise<boolean>
  logout: () => void
  clearSchool: () => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(() => {
    const stored = localStorage.getItem('alertia_school')
    return stored ? JSON.parse(stored) : null
  })

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('alertia_user')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (selectedSchool) {
      localStorage.setItem('alertia_school', JSON.stringify(selectedSchool))
    } else {
      localStorage.removeItem('alertia_school')
    }
  }, [selectedSchool])

  useEffect(() => {
    if (user) {
      localStorage.setItem('alertia_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('alertia_user')
    }
  }, [user])

  const selectSchool = (school: School) => {
    setSelectedSchool(school)
  }

  const clearSchool = () => {
    setSelectedSchool(null)
  }

  const login = async (email: string): Promise<boolean> => {
    // Mock login
    const foundUser = users.find((u) => u.email === email)
    if (foundUser) {
      setUser(foundUser)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
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
      },
    },
    children,
  )
}
