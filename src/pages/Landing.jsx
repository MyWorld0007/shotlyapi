import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const API_URL = 'https://api.shotlyapi.in'

export default function Landing() {
  const [url, setUrl] = useState('https://example.com')
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  function takeScreenshot() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setScreenshot(null)

    fetch(`${API_URL}/api/screenshot?url=${encodeURIComponent(url)}&api_key=test-key-123`)
      .then(r => {
        if (!r.ok) return r.json().then(e => { throw new Error(e.error || 'Failed') })
        return r.blob()
      })
      .then(blob => {
        setScreenshot(URL.createObjectURL(blob))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <>
      <nav>
        <div className="container nav-inner">
          <Link to="/" className="logo">
            <img src="/logo.svg" alt="ShotlyAPI" style={{width: '32px', height: '32px', borderRadius: '8px'}} />
            ShotlyAPI
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <Link to="/docs">Docs</Link>
            <a href="#pricing">Pricing</a>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get API Key</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <span className="hero-badge">Now with R2 caching — 3x faster</span>
          <h1>Capture website screenshots with a single API call</h1>
          <p>Fast, reliable, and affordable. Render any URL as a PNG or JPEG in seconds. Built on Cloudflare's edge network with zero cold starts.</p>
          <div className="hero-cta">
            <a href="#demo" className="btn btn-primary btn-lg">Try Live Demo</a>
            <Link to="/docs" className="btn btn-outline btn-lg">Read Docs</Link>
          </div>
        </div>
      </section>

      <section className="demo-section" id="demo">
        <div className="container">
          <div className="demo-card">
            <div className="demo-label">Live Demo — No signup required</div>
            <div className="demo-input-row">
              <input type="text" className="demo-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
              <button className="btn btn-primary" onClick={takeScreenshot} disabled={loading}>
                {loading ? 'Capturing...' : 'Capture Screenshot'}
              </button>
            </div>
            <div className="demo-result">
              {loading && <div className="demo-loading">Capturing screenshot... This takes 2-5 seconds.</div>}
              {error && <div className="demo-error">Error: {error}</div>}
              {screenshot && <img src={screenshot} alt="Screenshot result" />}
              {!loading && !error && !screenshot && <div className="demo-placeholder">Enter a URL above and click "Capture Screenshot" to see it in action.</div>}
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div><div className="stat-num">99.9%</div><div className="stat-label">Uptime</div></div>
            <div><div className="stat-num">{'<3s'}</div><div className="stat-label">Avg Response</div></div>
            <div><div className="stat-num">1920x1080</div><div className="stat-label">Full HD</div></div>
            <div><div className="stat-num">Rs 0</div><div className="stat-label">Free Tier</div></div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <div className="section-title">
            <h2>Everything you need to capture screenshots</h2>
            <p>Powerful features wrapped in a simple API. No browser dependencies, no infrastructure to manage.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon blue">Lightning</div>
              <h3>Lightning Fast</h3>
              <p>Powered by Chromium on Cloudflare's edge network. Screenshots delivered in under 3 seconds with R2 caching for instant repeat requests.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon green">Simple</div>
              <h3>Simple API</h3>
              <p>One endpoint, two parameters. Just send a URL and your API key — get back a PNG. No SDKs, no dependencies, no complexity.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon amber">Analytics</div>
              <h3>Usage Analytics</h3>
              <p>Track every screenshot request. Monitor usage in real-time with built-in analytics. Set limits and alerts per API key.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon blue">Full Page</div>
              <h3>Full Page Capture</h3>
              <p>Capture the entire page, not just the viewport. Perfect for long articles, landing pages, and documentation sites.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon green">Secure</div>
              <h3>Secure & Reliable</h3>
              <p>API key authentication, rate limiting, and automatic retries. Your data never touches third-party servers.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon amber">Free</div>
              <h3>Start Free</h3>
              <p>50 free screenshots every month, forever. No credit card required. Upgrade only when you need more.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="code-section" id="docs">
        <div className="container">
          <div className="code-grid">
            <div>
              <h2>Get started in 30 seconds</h2>
              <p>Make a single GET request with your API key and a URL. That's it. No SDKs to install, no configuration files, no dependencies.</p>
              <ul>
                <li><span className="check">{'\u2713'}</span> No SDK or library required</li>
                <li><span className="check">{'\u2713'}</span> Works with any language (curl, Python, JS, Go)</li>
                <li><span className="check">{'\u2713'}</span> Returns PNG image directly</li>
                <li><span className="check">{'\u2713'}</span> Automatic R2 caching for repeat requests</li>
                <li><span className="check">{'\u2713'}</span> Full HD 1920x1080 resolution</li>
              </ul>
            </div>
            <div className="code-block">
              <div className="code-header">screenshot.sh</div>
              <pre><span className="c">{'# Capture any website as a screenshot'}</span>{'\n'}
curl <span className="s">{'"https://api.shotlyapi.in/api/screenshot'}</span>{'\n'}
  <span className="s">{'?url=https://example.com'}</span>{'\n'}
  <span className="s">{'&api_key=YOUR_API_KEY"'}</span> \{'\n'}
  -o screenshot.png{'\n\n'}
<span className="c">{'# Python example'}</span>{'\n'}
<span className="k">{'import'}</span> requests{'\n'}
url = <span className="s">{'"https://api.shotlyapi.in/api/screenshot"'}</span>{'\n'}
params = {'{'}{'\n'}
    <span className="s">{'"url"'}</span>: <span className="s">{'"https://example.com"'}</span>,{'\n'}
    <span className="s">{'"api_key"'}</span>: <span className="s">{'"YOUR_API_KEY"'}</span>{'\n'}
{'}'}{'\n'}
response = requests.<span className="v">{'get'}</span>(url, params=params){'\n'}
<span className="k">{'with'}</span> <span className="v">{'open'}</span>(<span className="s">{'"screenshot.png"'}</span>, <span className="s">{'"wb"'}</span>) <span className="k">{'as'}</span> f:{'\n'}
    f.write(response.content)</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-title">
            <h2>Simple, transparent pricing</h2>
            <p>Start free. Upgrade when you grow. No hidden fees, no surprises.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-name">Free</div>
              <div className="price-amount">Rs 0<span className="period">/mo</span></div>
              <div className="price-desc">Perfect for testing and personal projects</div>
              <ul className="price-features">
                <li>50 screenshots / month</li>
                <li>1920x1080 resolution</li>
                <li>PNG & JPEG format</li>
                <li>API key included</li>
                <li>Community support</li>
              </ul>
              <Link to="/signup" className="btn btn-outline">Get Started</Link>
            </div>
            <div className="price-card popular">
              <div className="price-badge">Most Popular</div>
              <div className="price-name">Starter</div>
              <div className="price-amount">$5<span className="period">/mo</span></div>
              <div className="price-desc">For small apps and side projects</div>
              <ul className="price-features">
                <li>2,000 screenshots / month</li>
                <li>1920x1080 resolution</li>
                <li>PNG & JPEG format</li>
                <li>R2 caching included</li>
                <li>Email support</li>
                <li>Usage analytics</li>
              </ul>
              <Link to="/signup" className="btn btn-primary">Start Starter</Link>
            </div>
            <div className="price-card">
              <div className="price-name">Growth</div>
              <div className="price-amount">$9<span className="period">/mo</span></div>
              <div className="price-desc">For growing businesses and SaaS</div>
              <ul className="price-features">
                <li>4,000 screenshots / month</li>
                <li>1920x1080 resolution</li>
                <li>PNG & JPEG format</li>
                <li>R2 caching included</li>
                <li>Priority support</li>
                <li>Custom headers</li>
              </ul>
              <Link to="/signup" className="btn btn-outline">Start Growth</Link>
            </div>
            <div className="price-card">
              <div className="price-name">Pro</div>
              <div className="price-amount">$19<span className="period">/mo</span></div>
              <div className="price-desc">For high-volume production apps</div>
              <ul className="price-features">
                <li>10,000 screenshots / month</li>
                <li>1920x1080 resolution</li>
                <li>PNG & JPEG format</li>
                <li>R2 caching included</li>
                <li>Priority support</li>
                <li>Webhook callbacks</li>
              </ul>
              <Link to="/signup" className="btn btn-outline">Start Pro</Link>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <Link to="/" className="logo" style={{ marginBottom: '12px' }}>
                <span className="logo-mark" style={{ width: '28px', height: '28px', fontSize: '16px' }}>S</span>
                ShotlyAPI
              </Link>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', maxWidth: '300px' }}>The fastest way to capture website screenshots via API. Built on Cloudflare's global edge network.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#demo">Live Demo</a>
            </div>
            <div className="footer-col">
              <h4>Developers</h4>
              <Link to="/docs">API Docs</Link>
              <a href="#">API Reference</a>
              <a href="#">Status Page</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2026 ShotlyAPI. Built with Cloudflare Workers, D1, and R2.
          </div>
        </div>
      </footer>
    </>
  )
}
