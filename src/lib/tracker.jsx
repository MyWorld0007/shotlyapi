// Page view tracker - fires on every page load
// Non-blocking, sends to /api/admin/track
function getPageViewsTracker() {
  if (typeof window === 'undefined') return null
  
  var sessionId = sessionStorage.getItem('shotly_session')
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('shotly_session', sessionId)
  }
  
  var device = 'desktop'
  if (/Mobile|Android|iPhone/.test(navigator.userAgent)) device = 'mobile'
  else if (/iPad|Tablet/.test(navigator.userAgent)) device = 'tablet'
  
  var data = {
    page: window.location.pathname,
    referrer: document.referrer || '',
    device: device,
    session_id: sessionId
  }
  
  // Fire and forget - non-blocking
  try {
    fetch('https://api.shotlyapi.in/api/admin/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    }).catch(function() {})
  } catch(e) {}
  
  return sessionId
}

export { getPageViewsTracker }
