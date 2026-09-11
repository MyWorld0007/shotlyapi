import React, { useState, useEffect } from 'react'
import Maintenance from '../pages/Maintenance'

const API_URL = 'https://api.shotlyapi.in'

export default function MaintenanceGate({ children }) {
  const [maintenance, setMaintenance] = useState(false)

  useEffect(() => {
    let active = true
    async function check() {
      try {
        const res = await fetch(`${API_URL}/api/maintenance`)
        const data = await res.json().catch(() => ({}))
        if (active) setMaintenance(!!(data && data.maintenance))
      } catch (e) {}
    }
    check()
    const id = setInterval(check, 20000)
    return () => { active = false; clearInterval(id) }
  }, [])

  // Admin routes stay reachable so maintenance can be toggled back off
  if (maintenance && window.location.pathname.indexOf('/admin') !== 0) {
    return <Maintenance />
  }
  return children
}
