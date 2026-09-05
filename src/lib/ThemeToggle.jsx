import React, { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('shotly_theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('shotly_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return { theme, toggleTheme }
}

export function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle-btn" onClick={onToggle} type="button" aria-label="Toggle theme">
      <div className="theme-toggle-track">
        <div className={`theme-toggle-thumb ${theme}`}>
          <span className="theme-toggle-icon">
            {theme === 'dark' ? '\u{1F319}' : '\u2600\uFE0F'}
          </span>
        </div>
        <div className="theme-toggle-labels">
          <span className={`theme-label ${theme === 'light' ? 'active' : ''}`}>{'\u2600'}</span>
          <span className={`theme-label ${theme === 'dark' ? 'active' : ''}`}>{'\u{1F319}'}</span>
        </div>
      </div>
    </button>
  )
}

export default ThemeToggle
