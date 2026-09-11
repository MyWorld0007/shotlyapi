import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_URL = 'https://api.shotlyapi.in'

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const [sales, setSales] = useState(null)
  const [traffic, setTraffic] = useState(null)
  const [pageTraffic, setPageTraffic] = useState([])
  const [plans, setPlans] = useState([])
  const [health, setHealth] = useState(null)
  const [failedPayments, setFailedPayments] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userFilter, setUserFilter] = useState({ plan: '', search: '', page: 1 })
  const navigate = useNavigate()

  const fetchAPI = useCallback(async (endpoint) => {
    const resp = await fetch(`${API_URL}${endpoint}`, { credentials: 'include' })
    if (resp.status === 403) { navigate('/admin/login'); return null }
    if (resp.status === 204) return {}
    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}))
      throw new Error(errBody.error || ('Request failed (' + resp.status + ')'))
    }
    return resp.json()
  }, [navigate])

  useEffect(() => {
    async function init() {
      try {
        const overview = await fetchAPI('/api/admin/overview')
        if (!overview) return
        setData(overview)
        setLoading(false)
      } catch(e) {
        setError('Failed to load: ' + e.message)
        setLoading(false)
      }
    }
    init()
  }, [fetchAPI])

  async function loadUsers() {
    try {
      const params = new URLSearchParams()
      if (userFilter.plan) params.set('plan', userFilter.plan)
      if (userFilter.search) params.set('search', userFilter.search)
      params.set('page', userFilter.page)
      const result = await fetchAPI('/api/admin/users?' + params.toString())
      if (result) setUsers(result)
    } catch(e) {
      alert('Failed to load users: ' + e.message)
    }
  }

  async function loadSales() {
    try {
      const result = await fetchAPI('/api/admin/sales')
      if (result) setSales(result)
      const failed = await fetchAPI('/api/admin/sales/failed')
      if (failed) setFailedPayments(failed.failed_payments || [])
    } catch(e) {
      alert('Failed to load sales: ' + e.message)
    }
  }

  async function loadTraffic() {
    try {
      const result = await fetchAPI('/api/admin/traffic')
      if (result) setTraffic(result)
      const pages = await fetchAPI('/api/admin/traffic/pages')
      if (pages) setPageTraffic(pages.pages || [])
    } catch(e) {
      alert('Failed to load traffic: ' + e.message)
    }
  }

  async function loadPlans() {
    try {
      const result = await fetchAPI('/api/admin/plans')
      if (result) setPlans(result.plans || [])
    } catch(e) {
      alert('Failed to load plans: ' + e.message)
    }
  }

  async function loadHealth() {
    try {
      const result = await fetchAPI('/api/admin/health')
      if (result) setHealth(result)
    } catch(e) {
      alert('Failed to load health: ' + e.message)
    }
  }

  async function loadFeedback() {
    try {
      const result = await fetchAPI('/api/admin/feedback')
      if (result) setFeedback(result)
    } catch(e) {
      alert('Failed to load feedback: ' + e.message)
    }
  }

  async function handleTabChange(newTab) {
    setTab(newTab)
    if (newTab === 'users' && (!users || !users.users)) loadUsers()
    if (newTab === 'sales' && !sales) loadSales()
    if (newTab === 'traffic' && !traffic) loadTraffic()
    if (newTab === 'plans' && plans.length === 0) loadPlans()
    if (newTab === 'health' && !health) loadHealth()
    if (newTab === 'feedback' && !feedback) loadFeedback()
  }

  async function suspendUser(userId, suspend) {
    await fetch(`${API_URL}/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ suspend })
    })
    loadUsers()
  }

  async function extendTrial(userId) {
    await fetch(`${API_URL}/api/admin/users/${userId}/extend-trial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ days: 7 })
    })
    alert('Trial extended by 7 days')
    loadUsers()
  }

  async function togglePlan(planKey) {
    setPlans(plans.map(p => p.key === planKey ? { ...p, active: !p.active } : p))
  }

  async function adminLogout() {
    await fetch(`${API_URL}/api/admin/logout`, { method: 'POST', credentials: 'include' })
    navigate('/admin/login')
  }

  if (loading) return React.createElement('div', { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117', color: '#8b92a5' } }, 'Loading admin dashboard...')
  if (error) return React.createElement('div', { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117', color: '#ef4444' } }, error)

  const tabs = ['overview', 'users', 'sales', 'traffic', 'plans', 'health', 'feedback']
  const tabLabels = { overview: 'Overview', users: 'Users', sales: 'Sales', traffic: 'Traffic', plans: 'Plans', health: 'Health', feedback: 'Feedback' }

  return React.createElement('div', { style: { minHeight: '100vh', background: '#0f1117', color: '#e4e7ee', fontFamily: 'Outfit, sans-serif' } },
    // Nav bar
    React.createElement('nav', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#181b24' } },
      React.createElement(Link, { to: '/', className: 'logo', style: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' } },
        React.createElement('img', { src: '/logo.svg', alt: 'ShotlyAPI', style: { width: '28px', height: '28px', borderRadius: '6px' } }),
        React.createElement('span', { style: { fontWeight: 800, fontSize: '18px', color: '#e4e7ee' } }, 'ShotlyAPI'),
        React.createElement('span', { style: { fontSize: '11px', padding: '2px 8px', background: 'rgba(236,72,153,0.15)', color: '#ec4899', borderRadius: '4px', fontWeight: 600, marginLeft: '4px' } }, 'ADMIN')
      ),
      React.createElement('button', { onClick: adminLogout, style: { padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 } }, 'Logout')
    ),
    // Tab bar
    React.createElement('div', { style: { display: 'flex', gap: '4px', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' } },
      tabs.map(t => React.createElement('button', {
        key: t,
        onClick: () => handleTabChange(t),
        style: {
          padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          border: 'none', whiteSpace: 'nowrap',
          background: tab === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
          color: tab === t ? '#fff' : '#8b92a5'
        }
      }, tabLabels[t]))
    ),
    // Content
    React.createElement('div', { style: { padding: '24px', maxWidth: '1200px', margin: '0 auto' } },
      // OVERVIEW TAB
      tab === 'overview' && data && React.createElement('div', null,
        // KPI Cards
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' } },
          kpiCard('Total Users', data.total_users, '#6366f1'),
          kpiCard('Total Revenue', 'Rs. ' + (data.total_revenue || 0).toLocaleString(), '#22c55e'),
          kpiCard('Monthly Rev.', 'Rs. ' + (data.monthly_revenue || 0).toLocaleString(), '#14b8a6'),
          kpiCard('Screenshots', data.total_screenshots, '#f59e0b'),
          kpiCard('Today', data.screenshots_today, '#8b5cf6'),
          kpiCard('Failed Pmts', data.failed_payments, '#ef4444'),
          kpiCard('Visitors Today', data.unique_visitors_today, '#ec4899'),
          kpiCard('Bounce Rate', (data.bounce_rate || 0) + '%', '#f97316')
        ),
        // Plan distribution
        React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', marginBottom: '24px' } },
          React.createElement('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '16px' } }, 'Users by Plan'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' } },
            planBar('Trial', data.users_by_plan.trial, '#f59e0b'),
            planBar('Starter', data.users_by_plan.starter, '#6366f1'),
            planBar('Growth', data.users_by_plan.growth, '#14b8a6'),
            planBar('Pro', data.users_by_plan.pro, '#22c55e'),
            planBar('No Plan', data.users_by_plan.none, '#6b7280')
          )
        ),
        // New users this week
        React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' } },
          React.createElement('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '8px' } }, 'New Users This Week'),
          React.createElement('p', { style: { fontSize: '32px', fontWeight: 800, color: '#6366f1' } }, data.new_users_this_week)
        )
      ),

      // USERS TAB
      tab === 'users' && React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' } },
          React.createElement('input', {
            type: 'text', placeholder: 'Search email...', value: userFilter.search,
            onChange: (e) => setUserFilter({ ...userFilter, search: e.target.value }),
            style: { padding: '10px 14px', background: '#181b24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e4e7ee', fontSize: '13px', outline: 'none', minWidth: '200px' }
          }),
          React.createElement('select', {
            value: userFilter.plan,
            onChange: (e) => setUserFilter({ ...userFilter, plan: e.target.value, page: 1 }),
            style: { padding: '10px 14px', background: '#181b24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e4e7ee', fontSize: '13px', outline: 'none' }
          },
            React.createElement('option', { value: '' }, 'All Plans'),
            React.createElement('option', { value: 'trial' }, 'Trial'),
            React.createElement('option', { value: 'starter' }, 'Starter'),
            React.createElement('option', { value: 'growth' }, 'Growth'),
            React.createElement('option', { value: 'pro' }, 'Pro'),
            React.createElement('option', { value: 'none' }, 'No Plan'),
            React.createElement('option', { value: 'demo' }, 'Demo')
          ),
          React.createElement('button', { onClick: loadUsers, style: { padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 } }, 'Search')
        ),
        // Users table
        React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' } },
          React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
            React.createElement('thead', null,
              React.createElement('tr', { style: { borderBottom: '1px solid rgba(255,255,255,0.06)' } },
                React.createElement('th', { style: thStyle }, 'Email'),
                React.createElement('th', { style: thStyle }, 'Plan'),
                React.createElement('th', { style: thStyle }, 'API Key'),
                React.createElement('th', { style: thStyle }, 'Joined'),
                React.createElement('th', { style: thStyle }, 'Status'),
                React.createElement('th', { style: thStyle }, 'Actions')
              )
            ),
            React.createElement('tbody', null,
              (users.users || []).map(u => React.createElement('tr', { key: u.id, style: { borderBottom: '1px solid rgba(255,255,255,0.04)' } },
                React.createElement('td', { style: tdStyle }, u.email),
                React.createElement('td', { style: tdStyle }, React.createElement('span', { style: planBadge(u.plan) }, u.plan)),
                React.createElement('td', { style: { ...tdStyle, fontFamily: 'monospace', fontSize: '11px' } }, u.api_key_display || 'N/A'),
                React.createElement('td', { style: tdStyle }, u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'),
                React.createElement('td', { style: tdStyle }, u.is_suspended ? React.createElement('span', { style: { color: '#ef4444', fontSize: '11px' } }, 'Suspended') : React.createElement('span', { style: { color: '#22c55e', fontSize: '11px' } }, 'Active')),
                React.createElement('td', { style: tdStyle },
                  React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                    u.is_suspended
                      ? React.createElement('button', { onClick: () => suspendUser(u.id, false), style: btnSmall('#22c55e') }, 'Activate')
                      : React.createElement('button', { onClick: () => suspendUser(u.id, true), style: btnSmall('#ef4444') }, 'Suspend'),
                    React.createElement('button', { onClick: () => extendTrial(u.id), style: btnSmall('#f59e0b') }, '+7d Trial')
                  )
                )
              ))
            )
          )
        ),
        users.total != null && React.createElement('p', { style: { textAlign: 'center', marginTop: '12px', color: '#8b92a5', fontSize: '12px' } }, `Showing ${users.users ? users.users.length : 0} of ${users.total} users`)
      ),

      // SALES TAB
      tab === 'sales' && React.createElement('div', null,
        sales && React.createElement('div', null,
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' } },
            kpiCard('Trials Started', sales.trial_count, '#f59e0b'),
            kpiCard('Paid Users', sales.paid_count, '#22c55e'),
            kpiCard('Conversion', (sales.conversion_rate || 0) + '%', '#6366f1')
          ),
          // Daily revenue chart
          React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', marginBottom: '24px' } },
            React.createElement('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '16px' } }, 'Daily Revenue (Last 30 Days)'),
            React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', overflowX: 'auto' } },
              (sales.daily || []).slice().reverse().map((d, i) => {
                var maxRev = Math.max(...(sales.daily || []).map(x => x.revenue || 0), 1)
                var h = Math.max(2, ((d.revenue || 0) / maxRev) * 100)
                return React.createElement('div', { key: i, title: d.date + ': Rs.' + (d.revenue || 0), style: { minWidth: '20px', height: h + '%', background: 'linear-gradient(180deg, #6366f1, #8b5cf6)', borderRadius: '3px 3px 0 0', opacity: 0.8 } })
              })
            )
          ),
          // Revenue by plan
          React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', marginBottom: '24px' } },
            React.createElement('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '16px' } }, 'Revenue by Plan'),
            React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
              React.createElement('thead', null,
                React.createElement('tr', { style: { borderBottom: '1px solid rgba(255,255,255,0.06)' } },
                  React.createElement('th', { style: thStyle }, 'Plan'),
                  React.createElement('th', { style: thStyle }, 'Revenue'),
                  React.createElement('th', { style: thStyle }, 'Count')
                )
              ),
              React.createElement('tbody', null,
                (sales.by_plan || []).map((p, i) => React.createElement('tr', { key: i, style: { borderBottom: '1px solid rgba(255,255,255,0.04)' } },
                  React.createElement('td', { style: tdStyle }, React.createElement('span', { style: planBadge(p.plan) }, p.plan)),
                  React.createElement('td', { style: tdStyle }, 'Rs. ' + (p.revenue || 0).toLocaleString()),
                  React.createElement('td', { style: tdStyle }, p.count)
                ))
              )
            )
          )
        ),
        // Failed payments
        React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' } },
          React.createElement('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#ef4444' } }, 'Failed Payments'),
          failedPayments.length === 0
            ? React.createElement('p', { style: { color: '#8b92a5', fontSize: '13px' } }, 'No failed payments found.')
            : React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
                React.createElement('thead', null,
                  React.createElement('tr', { style: { borderBottom: '1px solid rgba(255,255,255,0.06)' } },
                    React.createElement('th', { style: thStyle }, 'Email'),
                    React.createElement('th', { style: thStyle }, 'Amount'),
                    React.createElement('th', { style: thStyle }, 'Plan'),
                    React.createElement('th', { style: thStyle }, 'Date')
                  )
                ),
                React.createElement('tbody', null,
                  failedPayments.map((p, i) => React.createElement('tr', { key: i, style: { borderBottom: '1px solid rgba(255,255,255,0.04)' } },
                    React.createElement('td', { style: tdStyle }, p.email || 'N/A'),
                    React.createElement('td', { style: tdStyle }, 'Rs. ' + (p.amount || 0)),
                    React.createElement('td', { style: tdStyle }, p.plan || '-'),
                    React.createElement('td', { style: tdStyle }, p.created_at ? new Date(p.created_at).toLocaleDateString() : '-')
                  ))
                )
              )
        )
      ),

      // TRAFFIC TAB
      tab === 'traffic' && React.createElement('div', null,
        traffic && React.createElement('div', null,
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' } },
            kpiCard('Total Sessions', traffic.total_sessions, '#6366f1'),
            kpiCard('Bounce Rate', (traffic.bounce_rate || 0) + '%', '#f97316'),
            kpiCard('Avg Views/Sess', traffic.total_sessions > 0 ? ((traffic.daily || []).reduce((a, b) => a + (b.views || 0), 0) / traffic.total_sessions).toFixed(1) : '0', '#14b8a6')
          ),
          // Daily traffic chart
          React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', marginBottom: '24px' } },
            React.createElement('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '16px' } }, 'Daily Visitors (Last 30 Days)'),
            React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', overflowX: 'auto' } },
              (traffic.daily || []).slice().reverse().map((d, i) => {
                var maxV = Math.max(...(traffic.daily || []).map(x => x.visitors || 0), 1)
                var h = Math.max(2, ((d.visitors || 0) / maxV) * 100)
                return React.createElement('div', { key: i, title: d.date + ': ' + (d.visitors || 0) + ' visitors', style: { minWidth: '20px', height: h + '%', background: 'linear-gradient(180deg, #14b8a6, #0ea5e9)', borderRadius: '3px 3px 0 0', opacity: 0.8 } })
              })
            )
          ),
          // Page-wise traffic
          React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', marginBottom: '24px' } },
            React.createElement('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '16px' } }, 'Page-wise Traffic'),
            React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
              React.createElement('thead', null,
                React.createElement('tr', { style: { borderBottom: '1px solid rgba(255,255,255,0.06)' } },
                  React.createElement('th', { style: thStyle }, 'Page'),
                  React.createElement('th', { style: thStyle }, 'Views'),
                  React.createElement('th', { style: thStyle }, 'Unique Visitors')
                )
              ),
              React.createElement('tbody', null,
                pageTraffic.map((p, i) => React.createElement('tr', { key: i, style: { borderBottom: '1px solid rgba(255,255,255,0.04)' } },
                  React.createElement('td', { style: tdStyle }, p.page),
                  React.createElement('td', { style: tdStyle }, p.views),
                  React.createElement('td', { style: tdStyle }, p.unique_visitors)
                ))
              )
            )
          ),
          // Top referrers + devices
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' } },
              React.createElement('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '16px' } }, 'Top Referrers'),
              (traffic.referrers || []).length === 0
                ? React.createElement('p', { style: { color: '#8b92a5', fontSize: '13px' } }, 'No referrer data yet.')
                : React.createElement('div', null, traffic.referrers.map((r, i) => React.createElement('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' } },
                    React.createElement('span', { style: { fontSize: '12px', color: '#8b92a5' } }, r.referrer.substring(0, 40)),
                    React.createElement('span', { style: { fontSize: '12px', fontWeight: 600 } }, r.count)
                  )))
            ),
            React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' } },
              React.createElement('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '16px' } }, 'Device Breakdown'),
              (traffic.devices || []).map((d, i) => React.createElement('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' } },
                React.createElement('span', { style: { fontSize: '12px', color: '#8b92a5', textTransform: 'capitalize' } }, d.device),
                React.createElement('span', { style: { fontSize: '12px', fontWeight: 600 } }, d.count)
              ))
            )
          )
        )
      ),

      // PLANS TAB
      tab === 'plans' && React.createElement('div', null,
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' } },
          plans.map(p => React.createElement('div', { key: p.key, style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
              React.createElement('h3', { style: { fontSize: '18px', fontWeight: 700 } }, p.name),
              React.createElement('button', {
                onClick: () => togglePlan(p.key),
                style: {
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: p.active ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)',
                  color: p.active ? '#22c55e' : '#6b7280'
                }
              }, p.active ? 'Active' : 'Inactive')
            ),
            React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('span', { style: { fontSize: '24px', fontWeight: 800 } }, 'Rs. ' + p.price),
              React.createElement('span', { style: { fontSize: '13px', color: '#8b92a5' } }, p.type === 'subscription' ? '/mo' : p.type === 'one_time' ? ' one-time' : '')
            ),
            React.createElement('p', { style: { fontSize: '13px', color: '#8b92a5', marginBottom: '12px' } }, p.limit.toLocaleString() + ' screenshots'),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' } },
              React.createElement('span', { style: { fontSize: '12px', color: '#8b92a5' } }, 'Subscribers'),
              React.createElement('span', { style: { fontSize: '16px', fontWeight: 700 } }, p.subscribers)
            )
          ))
        )
      ),

      // HEALTH TAB
      tab === 'health' && React.createElement('div', null,
        health && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' } },
          healthCard('Screenshot Server', health.screenshot_server, health.screenshot_server === 'online'),
          healthCard('Cloudflare Worker', health.worker, true),
          healthCard('D1 - Users', health.database.users + ' records', true),
          healthCard('D1 - Usage', health.database.usage_records + ' records', true),
          healthCard('D1 - Page Views', health.database.page_views + ' records', true),
          healthCard('D1 - Payments', health.database.payments + ' records', true),
          React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', gridColumn: '1 / -1' } },
            React.createElement('h3', { style: { fontSize: '14px', fontWeight: 600, color: '#8b92a5', marginBottom: '8px' } }, 'Last Checked'),
            React.createElement('p', { style: { fontSize: '16px', fontWeight: 600 } }, new Date(health.timestamp).toLocaleString())
          )
        )
      ),

      // FEEDBACK TAB
      tab === 'feedback' && React.createElement('div', null,
        !feedback
          ? React.createElement('p', { style: { color: '#8b92a5', fontSize: '13px' } }, 'Loading feedback...')
          : React.createElement('div', null,
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' } },
              kpiCard('Total Feedback', (feedback.stats && feedback.stats.total) || 0, '#6366f1'),
              kpiCard('Avg Rating', ((feedback.stats && feedback.stats.avg_rating) || 0) + ' / 5', '#f59e0b')
            ),
            React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' } },
              React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
                React.createElement('thead', null,
                  React.createElement('tr', { style: { borderBottom: '1px solid rgba(255,255,255,0.06)' } },
                    React.createElement('th', { style: thStyle }, 'Rating'),
                    React.createElement('th', { style: thStyle }, 'Category'),
                    React.createElement('th', { style: thStyle }, 'Email'),
                    React.createElement('th', { style: thStyle }, 'Message'),
                    React.createElement('th', { style: thStyle }, 'Date')
                  )
                ),
                React.createElement('tbody', null,
                  (feedback.feedback || []).length === 0
                    ? React.createElement('tr', null, React.createElement('td', { colSpan: 5, style: { ...tdStyle, textAlign: 'center', color: '#8b92a5' } }, 'No feedback submitted yet.'))
                    : (feedback.feedback || []).map((f, i) => React.createElement('tr', { key: i, style: { borderBottom: '1px solid rgba(255,255,255,0.04)' } },
                        React.createElement('td', { style: tdStyle }, '\u2605'.repeat(f.rating || 0) + ' ' + (f.rating || 0) + '/5'),
                        React.createElement('td', { style: tdStyle }, React.createElement('span', { style: categoryBadge(f.category) }, f.category)),
                        React.createElement('td', { style: tdStyle }, f.email || 'Anonymous'),
                        React.createElement('td', { style: { ...tdStyle, maxWidth: '400px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, f.message),
                        React.createElement('td', { style: tdStyle }, String(f.created_at || '').substring(0, 16))
                      ))
                )
              )
            ),
            React.createElement('button', { onClick: loadFeedback, style: { marginTop: '16px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 } }, 'Refresh')
          )
      )
    )
  )
}

// Helper components
function kpiCard(label, value, color) {
  return React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' } },
    React.createElement('p', { style: { fontSize: '12px', color: '#8b92a5', fontWeight: 500, marginBottom: '8px' } }, label),
    React.createElement('p', { style: { fontSize: '24px', fontWeight: 800, color } }, value)
  )
}

function planBar(label, count, color) {
  return React.createElement('div', { style: { textAlign: 'center' } },
    React.createElement('div', { style: { height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' } },
      React.createElement('div', { style: { width: '40px', height: Math.max(4, (count || 0) * 10) + 'px', background: color, borderRadius: '4px 4px 0 0', opacity: 0.8 } })
    ),
    React.createElement('p', { style: { fontSize: '11px', color: '#8b92a5', marginTop: '4px' } }, label),
    React.createElement('p', { style: { fontSize: '16px', fontWeight: 700 } }, count || 0)
  )
}

function planBadge(plan) {
  var colors = { trial: '#f59e0b', starter: '#6366f1', growth: '#14b8a6', pro: '#22c55e', none: '#6b7280', demo: '#8b5cf6', admin: '#ec4899' }
  var c = colors[plan] || '#6b7280'
  return { padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: c + '20', color: c, textTransform: 'capitalize' }
}

function categoryBadge(category) {
  var colors = { bug: '#ef4444', feature: '#6366f1', general: '#14b8a6', pricing: '#f59e0b', docs: '#0ea5e9', other: '#6b7280' }
  var c = colors[category] || '#6b7280'
  return { padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: c + '20', color: c, textTransform: 'capitalize' }
}

function healthCard(label, value, isOnline) {
  return React.createElement('div', { style: { background: '#181b24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' } },
    React.createElement('p', { style: { fontSize: '12px', color: '#8b92a5', fontWeight: 500, marginBottom: '8px' } }, label),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      React.createElement('div', { style: { width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#ef4444' } }),
      React.createElement('p', { style: { fontSize: '16px', fontWeight: 700, textTransform: 'capitalize' } }, value)
    )
  )
}

var thStyle = { textAlign: 'left', padding: '12px 14px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8b92a5' }
var tdStyle = { padding: '12px 14px', color: '#e4e7ee' }

function btnSmall(color) {
  return { padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer', background: color + '20', color }
}
