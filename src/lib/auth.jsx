import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('shotly_token')
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setUser({ ...data, token })
          } else {
            localStorage.removeItem('shotly_token')
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function login(token) {
    localStorage.setItem('shotly_token', token)
    return fetch('/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setUser({ ...data, token }))
  }

  function logout() {
    localStorage.removeItem('shotly_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
