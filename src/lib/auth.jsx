import React, { createContext, useContext, useState, useEffect } from 'react'

const API_URL = 'https://api.shotlyapi.in'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include'
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setUser(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function login() {
    return fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(data => setUser(data))
  }

  function logout() {
    fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {})
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
