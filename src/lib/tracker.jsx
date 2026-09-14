import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Page view tracker - fires on every route change
// Non-blocking, sends to /api/admin/track
export default function PageTracker() {
  const location = useLocation()
  
  useEffect(() => {
    var sessionId = sessionStorage.getItem('shotly_session')
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('shotly_session', sessionId)
    }
    
    var device = 'desktop'
    if (/Mobile|Android|iPhone/.test(navigator.userAgent)) device = 'mobile'
    else if (/iPad|Tablet/.test(navigator.userAgent)) device = 'tablet'
    
    try {
      fetch('https://api.shotlyapi.in/api/admin/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: window.location.pathname,
          referrer: document.referrer || '',
          device: device,
          session_id: sessionId
        }),
        keepalive: true
      }).catch(function() {})
    } catch(e) {}
  }, [location.pathname])
  
  return null
}
