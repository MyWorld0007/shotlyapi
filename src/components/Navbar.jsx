import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTheme, ThemeToggle } from '../lib/ThemeToggle'

export default function Navbar({ variant = 'marketing' }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e) {
      if (e.target.closest('.nav-mobile-menu') || e.target.closest('.nav-hamburger')) return
      setMenuOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [menuOpen])

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function handleLogout() {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <img src="/logo.svg" alt="ShotlyAPI" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
          ShotlyAPI
        </Link>

        {/* Desktop nav */}
        <div className="nav-desktop">
          {variant === 'marketing' && (
            <>
              <a href="/#features">Features</a>
              <Link to="/playground">Playground</Link>
              <Link to="/docs">Docs</Link>
              <a href="/#pricing">Pricing</a>
              <Link to="/faq">FAQ</Link>
              <Link to="/feedback">Feedback</Link>
            </>
          )}
          {variant === 'app' && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-link-active' : ''}>Dashboard</Link>
              <Link to="/billing" className={isActive('/billing') ? 'nav-link-active' : ''}>Billing</Link>
              <Link to="/docs">Docs</Link>
              <Link to="/feedback">Feedback</Link>
            </>
          )}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {user ? (
            variant === 'app' ? (
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Sign Out</button>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
            )
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get API Key</Link>
            </>
          )}
        </div>

        {/* Mobile top-right actions (always visible on mobile) */}
        <div className="nav-mobile-top-actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <span className={menuOpen ? 'hamburger-line open' : 'hamburger-line'}></span>
            <span className={menuOpen ? 'hamburger-line open' : 'hamburger-line'}></span>
            <span className={menuOpen ? 'hamburger-line open' : 'hamburger-line'}></span>
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div className={'nav-mobile-menu' + (menuOpen ? ' open' : '')}>
        {variant === 'marketing' && (
          <>
            <a href="/#features">Features</a>
            <Link to="/playground">Playground</Link>
            <Link to="/docs">Docs</Link>
            <a href="/#pricing">Pricing</a>
            <Link to="/faq">FAQ</Link>
            <Link to="/feedback">Feedback</Link>
          </>
        )}
        {variant === 'app' && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/billing">Billing</Link>
            <Link to="/docs">Docs</Link>
            <Link to="/feedback">Feedback</Link>
          </>
        )}
        <div className="nav-mobile-divider"></div>
        <div className="nav-mobile-actions">
          {user ? (
            variant === 'app' ? (
              <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>Sign Out</button>
            ) : (
              <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%' }}>Dashboard</Link>
            )
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>Get API Key</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile backdrop */}
      {menuOpen && <div className="nav-mobile-backdrop" onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}
