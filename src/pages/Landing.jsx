import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTheme, ThemeToggle } from '../lib/ThemeToggle'

const API_URL = 'https://api.shotlyapi.in'

const features = [
  { icon: 'blue', title: 'Lightning Fast', desc: 'Capture screenshots in under 3 seconds with our optimized rendering engine and global edge network.' },
  { icon: 'green', title: 'Simple API', desc: 'A single GET request is all it takes. No SDKs to install, no complex authentication flows.' },
  { icon: 'amber', title: 'Usage Analytics', desc: 'Track your screenshot usage, monitor trends, and optimize your quota with a detailed dashboard.' },
  { icon: 'purple', title: 'Full Page Capture', desc: 'Capture the entire scrollable page, not just the visible viewport, with perfect fidelity.' },
  { icon: 'cyan', title: 'PDF & Image Export', desc: 'Convert any web page into PNG, JPEG, WEBP, or PDF with a single format parameter.' },
  { icon: 'rose', title: 'Ad & Banner Blocking', desc: 'Automatically strip cookie banners, GDPR popups, chat widgets, and ads before capture.' },
  { icon: 'blue', title: 'CSS & JS Injection', desc: 'Inject custom CSS styles or execute JavaScript on the page before taking the screenshot.' },
  { icon: 'green', title: 'HTML to Image', desc: 'Render raw HTML markup into a screenshot without needing a public URL. Perfect for OG images.' },
  { icon: 'amber', title: 'Text Extraction', desc: 'Extract page titles, headings, and body text alongside screenshots in a single API call.' },
  { icon: 'purple', title: 'Bulk Screenshots', desc: 'Process up to 50 URLs in a single POST request. Perfect for SEO audits and competitive analysis.' },
  { icon: 'cyan', title: 'Smart Caching', desc: 'R2 edge caching delivers repeat screenshots in under 500ms. Use fresh=true to bypass cache.' },
  { icon: 'rose', title: 'Secure & Reliable', desc: 'Enterprise-grade security with API key authentication and 99.9% guaranteed uptime.' },
]

const featureList = [
  'Full Page Capture', 'Custom Viewport', 'Element Screenshot', 'Remove Elements',
  'Custom User Agent', 'Custom Cookies', 'Wait for Selector', 'Wait for Network Idle',
  'PDF Export', 'JPEG Format', 'WEBP Format', 'PNG Format',
  'Ad & Banner Blocking', 'CSS Injection', 'JS Injection', 'HTML to Image',
  'Text Extraction', 'Bulk Screenshots', 'R2 Edge Caching', 'Fresh Capture Bypass',
  'Custom Delay',
]

const comparisonRows = [
  { feature: 'PNG Output', shotly: true, puppeteer: true, playwright: true },
  { feature: 'JPEG Format', shotly: true, puppeteer: false, playwright: false },
  { feature: 'WEBP Format', shotly: true, puppeteer: false, playwright: false },
  { feature: 'PDF Export', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Full Page Capture', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Custom Viewport', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Element Screenshot', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Wait for Selector', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Wait for Network Idle', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Custom User Agent', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Custom Cookies', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Hide Elements', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Ad & Banner Blocking', shotly: true, puppeteer: false, playwright: false },
  { feature: 'CSS Injection', shotly: true, puppeteer: false, playwright: false },
  { feature: 'JS Injection', shotly: true, puppeteer: false, playwright: false },
  { feature: 'HTML to Image', shotly: true, puppeteer: false, playwright: false },
  { feature: 'Text Extraction', shotly: true, puppeteer: false, playwright: false },
  { feature: 'Bulk Screenshots', shotly: true, puppeteer: false, playwright: false },
  { feature: 'R2 Edge Caching', shotly: true, puppeteer: false, playwright: false },
  { feature: 'Fresh Capture Bypass', shotly: true, puppeteer: false, playwright: false },
  { feature: 'No Infrastructure', shotly: true, puppeteer: false, playwright: false },
  { feature: 'API Key Auth', shotly: true, puppeteer: false, playwright: false },
  { feature: 'Usage Analytics', shotly: true, puppeteer: false, playwright: false },
]

const testimonials = [
  { name: 'Aarav Sharma', role: 'Senior Engineer, Flipkart', color: 'blue', quote: 'ShotlyAPI replaced our entire self-hosted Puppeteer cluster. Setup took five minutes and screenshots render perfectly every time.' },
  { name: 'Priya Nair', role: 'Product Lead, Razorpay', color: 'green', quote: 'The PDF export feature alone saved us weeks of engineering. The API is clean, fast, and the docs are exceptional.' },
  { name: 'Rohan Mehta', role: 'CTO, TechFlow', color: 'amber', quote: 'We process thousands of screenshots daily for our link previews. ShotlyAPI handles the load effortlessly at a fraction of the cost.' },
]

const pricingTiers = [
  { name: 'Free', amount: '$0', period: '', desc: '50 screenshots / month', features: ['50 screenshots / month', 'PNG & JPEG formats', 'Full page capture', 'Community support'], cta: 'Start Free', popular: false },
  { name: 'Starter', amount: '$5', period: '/mo', desc: '2,000 screenshots / month', features: ['2,000 screenshots / month', 'All image formats + PDF', 'CSS & JS injection', 'Custom viewport', 'Email support'], cta: 'Get Starter', popular: false },
  { name: 'Growth', amount: '$9', period: '/mo', desc: '4,000 screenshots / month', features: ['4,000 screenshots / month', 'Everything in Starter', 'Ad & banner blocking', 'HTML to Image', 'Text extraction', 'Priority support'], cta: 'Get Growth', popular: true },
  { name: 'Pro', amount: '$19', period: '/mo', desc: '10,000 screenshots / month', features: ['10,000 screenshots / month', 'Everything in Growth', 'Bulk screenshots', 'Custom cookies', 'Fresh capture bypass', 'Dedicated support'], cta: 'Get Pro', popular: false },
]

const faqs = [
  { q: 'What is a screenshot API?', a: 'A screenshot API is a service that programmatically captures visual snapshots of web pages. Instead of running a headless browser yourself, you send a simple HTTP request and receive a high-quality image or PDF of the target website in return.' },
  { q: 'How does ShotlyAPI work?', a: 'You send a GET request to our API endpoint with the target URL and your API key. Our rendering engine loads the page in a real Chromium browser, captures the screenshot, and returns the image within seconds. Repeat requests are served instantly from R2 cache.' },
  { q: 'Is there a free tier?', a: 'Yes. Our free tier includes 50 screenshots per month at no cost, with no credit card required. It is perfect for testing, personal projects, and small-scale usage. You can upgrade to a paid plan anytime for higher limits.' },
  { q: 'What image formats are supported?', a: 'ShotlyAPI supports PNG, JPEG, and WEBP image formats, plus PDF document export. You can specify the desired format via the format query parameter in your API request.' },
  { q: 'Can you block cookie banners and ads?', a: 'Yes! Use block_ads=true to automatically strip cookie banners, GDPR consent popups, chat widgets, and ads before the screenshot is taken. No manual CSS workarounds needed.' },
  { q: 'Can I inject custom CSS or JavaScript?', a: 'Yes. Use the css parameter to inject custom styles, or the js parameter to execute JavaScript on the page before capture. This is perfect for dismissing modals, filling forms, or testing design variations.' },
  { q: 'Can I render HTML to an image?', a: 'Yes! Use the custom_html parameter to send raw HTML markup and get back a rendered screenshot. Perfect for generating OG images, email previews, invoices, and dynamic social cards.' },
  { q: 'How fast is the API?', a: 'Our average response time is under 3 seconds for fresh captures. Cached screenshots return in under 500ms. Our global edge network ensures low latency regardless of your geographic location.' },
]

const curlExample = `curl -G 'https://api.shotlyapi.in/api/screenshot' \\
  --data-urlencode 'url=https://example.com' \\
  --data-urlencode 'api_key=YOUR_API_KEY' \\
  --data-urlencode 'format=png' \\
  --data-urlencode 'full_page=true' \\
  --data-urlencode 'block_ads=true' \\
  -o screenshot.png`

const pythonExample = `import requests

API_URL = 'https://api.shotlyapi.in/api/screenshot'
params = {
    'url': 'https://example.com',
    'api_key': 'YOUR_API_KEY',
    'format': 'png',
    'full_page': 'true',
    'block_ads': 'true',
    'width': 1440,
    'height': 900,
}
response = requests.get(API_URL, params=params)

with open('screenshot.png', 'wb') as f:
    f.write(response.content)`

function Check() { return <span className="check">{'\u2713'}</span> }

function FAQItem({ item, isOpen, onClick }) {
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={onClick} type="button">
        {item.q}
        <span className="faq-toggle">{isOpen ? '\u2212' : '+'}</span>
      </button>
      {isOpen && <div className="faq-answer">{item.a}</div>}
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [demoUrl, setDemoUrl] = useState('https://example.com')
  const [screenshotSrc, setScreenshotSrc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openFaq, setOpenFaq] = useState(0)

  const handleCapture = async () => {
    if (!demoUrl) return
    setLoading(true)
    setError(null)
    setScreenshotSrc(null)
    try {
      const res = await fetch(
        `${API_URL}/api/screenshot?url=${encodeURIComponent(demoUrl)}&api_key=test-key-123&block_ads=true`
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to capture screenshot. Please try again.')
      }
      const blob = await res.blob()
      setScreenshotSrc(URL.createObjectURL(blob))
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Nav */}
      <nav>
        <div className="nav-inner container">
          <Link to="/" className="logo">
            <span className="logo-mark">S</span>
            ShotlyAPI
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <Link to="/playground" style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Capture Studio</Link>
            <a href="#docs">Docs</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get API Key</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span className="dot" /> 21+ features — now with ad blocking, CSS/JS injection & bulk API
          </div>
          <h1>
            Website Screenshot API<br />
            <span className="gradient-text">for Developers</span>
          </h1>
          <p>
            Capture, Convert to PDF & Automate. Turn any website into a high-quality
            screenshot or PDF with a single API call. Built on Cloudflare's edge network.
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free</Link>
            <Link to="/playground" className="btn btn-outline btn-lg">Try Capture Studio</Link>
          </div>

          {/* Terminal */}
          <div className="hero-terminal">
            <div className="terminal-header">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">screenshot.sh</span>
            </div>
            <div className="terminal-body">
              <span className="cmd">curl</span> <span className="str">'https://api.shotlyapi.in/api/screenshot'</span>{' \\\n  '}
              <span className="flag">--data-urlencode</span> <span className="str">'url=https://example.com'</span>{' \\\n  '}
              <span className="flag">--data-urlencode</span> <span className="key">api_key=YOUR_KEY</span>{' \\\n  '}
              <span className="flag">--data-urlencode</span> <span className="key">block_ads=true</span>{' \\\n  '}
              <span className="flag">-o</span> screenshot.png
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="trust">
        <div className="container">
          <p>Trusted by developers worldwide</p>
          <div className="trust-logos">
            <span>Acme Corp</span><span>Globex</span><span>Initech</span>
            <span>Hooli</span><span>Stark Inc</span><span>Umbrella</span>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="demo-section" id="demo">
        <div className="container">
          <h2 className="section-title">Try it live</h2>
          <p className="section-sub">Enter any URL and capture a screenshot in seconds. No signup required.</p>
          <div className="demo-card">
            <div className="demo-input-row">
              <input
                className="demo-input"
                type="text"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://example.com"
              />
              <button className="btn btn-primary" onClick={handleCapture} disabled={loading} type="button">
                {loading ? 'Capturing...' : 'Capture Screenshot'}
              </button>
            </div>
            <div className="demo-label">Result</div>
            <div className="demo-result">
              {loading && <div className="demo-loading">Capturing screenshot...</div>}
              {error && <div className="demo-error">{error}</div>}
              {!loading && !error && !screenshotSrc && (
                <div className="demo-placeholder">Your screenshot will appear here</div>
              )}
              {screenshotSrc && !loading && (
                <img src={screenshotSrc} alt="Captured screenshot" style={{ maxWidth: '100%' }} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats-bg">
            <div className="stats-grid">
              <div>
                <div className="stat-num">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div>
                <div className="stat-num">{'<3s'}</div>
                <div className="stat-label">Avg Response</div>
              </div>
              <div>
                <div className="stat-num">21+</div>
                <div className="stat-label">Features</div>
              </div>
              <div>
                <div className="stat-num">$0</div>
                <div className="stat-label">Free Tier</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">Everything you need to capture the web</h2>
          <p className="section-sub">21+ features for developers, by developers.</p>
          <div className="feature-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className={`feature-icon feature-icon-${f.icon}`}>{'\u26A1'}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature list */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Complete feature set</h2>
          <p className="section-sub">Every option you need, available out of the box.</p>
          <div className="feature-list">
            {featureList.map((item) => (
              <div className="feature-list-item" key={item}>
                <Check />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code section */}
      <section className="code-section" id="docs">
        <div className="container">
          <div className="code-grid">
            <div>
              <h2>Get started in seconds</h2>
              <p>Simple REST API. No SDKs required. Works with any language.</p>
              <ul>
                <li><Check /> Single GET request</li>
                <li><Check /> 21+ rendering parameters</li>
                <li><Check /> PNG, JPEG, WEBP, PDF</li>
                <li><Check /> Ad & banner blocking</li>
                <li><Check /> CSS & JS injection</li>
                <li><Check /> HTML to Image</li>
                <li><Check /> Text extraction</li>
                <li><Check /> Bulk screenshots API</li>
                <li><Check /> R2 edge caching</li>
              </ul>
            </div>
            <div>
              <div className="code-block" style={{ marginBottom: '16px' }}>
                <div className="code-header">
                  <span className="terminal-dot red" />
                  <span className="terminal-dot yellow" />
                  <span className="terminal-dot green" />
                  <span className="title">cURL</span>
                </div>
                <pre>{curlExample}</pre>
              </div>
              <div className="code-block">
                <div className="code-header">
                  <span className="terminal-dot red" />
                  <span className="terminal-dot yellow" />
                  <span className="terminal-dot green" />
                  <span className="title">Python</span>
                </div>
                <pre>{pythonExample}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="comparison">
        <div className="container">
          <h2 className="section-title">ShotlyAPI vs the alternatives</h2>
          <p className="section-sub">Why manage infrastructure when you do not have to?</p>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="highlight">ShotlyAPI</th>
                <th>Puppeteer</th>
                <th>Playwright</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.shotly ? <span className="yes">{'\u2713'}</span> : <span className="no">{'\u2014'}</span>}</td>
                  <td>{row.puppeteer ? <span className="yes">{'\u2713'}</span> : <span className="no">{'\u2014'}</span>}</td>
                  <td>{row.playwright ? <span className="yes">{'\u2713'}</span> : <span className="no">{'\u2014'}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">Loved by developers</h2>
          <p className="section-sub">See what our customers have to say.</p>
          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">{'\u2605\u2605\u2605\u2605\u2605'}</div>
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <h2 className="section-title">Simple, transparent pricing</h2>
        <p className="section-sub">Start free. Upgrade when you need more power.</p>
        <div className="pricing-grid">
          {pricingTiers.map((tier) => (
            <div className={`price-card ${tier.popular ? 'popular' : ''}`} key={tier.name}>
              {tier.popular && <div className="price-badge">Most Popular</div>}
              <div className="price-name">{tier.name}</div>
              <div className="price-amount">
                {tier.amount}
                {tier.period && <span className="period">{tier.period}</span>}
              </div>
              <div className="price-desc">{tier.desc}</div>
              <ul className="price-features">
                {tier.features.map((feat) => (
                  <li key={feat}><Check /> {feat}</li>
                ))}
              </ul>
              <Link to="/signup" className={`btn ${tier.popular ? 'btn-primary' : 'btn-outline'}`}>{tier.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <h2 className="section-title">Frequently asked questions</h2>
        <p className="section-sub">Everything you need to know about ShotlyAPI.</p>
        <div className="faq-list" style={{ marginTop: '32px' }}>
          {faqs.map((item, index) => (
            <FAQItem
              key={item.q}
              item={item}
              isOpen={openFaq === index}
              onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <div className="cta-inner">
            <h2>Ready to capture those screenshots?</h2>
            <p>Join thousands of developers building with ShotlyAPI.</p>
            <Link to="/signup" className="btn btn-glow btn-lg">Get Started Free</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <Link to="/" className="logo" style={{ marginBottom: '12px' }}>
                <span className="logo-mark">S</span>
                ShotlyAPI
              </Link>
              <p>The fastest way to capture website screenshots and PDFs via API.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <Link to="/playground" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Capture Studio</Link>
              <a href="#pricing">Pricing</a>
              <a href="#demo">Live Demo</a>
              <Link to="/faq" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>FAQ</Link>
            </div>
            <div className="footer-col">
              <h4>Developers</h4>
              <Link to="/docs" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>API Docs</Link>
              <a href="https://api.shotlyapi.in/health">API Status</a>
              <a href="https://github.com/MyWorld0007/shotlyapi">GitHub</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link to="/privacy" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Terms & Conditions</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{'\u00A9'} 2026 ShotlyAPI. Built with Cloudflare Workers, D1, and R2.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
