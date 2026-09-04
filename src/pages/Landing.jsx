import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const API_URL = 'https://api.shotlyapi.in';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Docs', href: '#docs' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Blog', href: '#blog' },
];

const trustLogos = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Inc'];

const stats = [
  { num: '99.9%', label: 'Uptime' },
  { num: '<3s', label: 'Avg Response' },
  { num: '50+', label: 'Features' },
  { num: 'Rs 0', label: 'Free Tier' },
];

const features = [
  { icon: 'blue', title: 'Lightning Fast', desc: 'Capture screenshots in under 3 seconds with our optimized rendering engine and global edge network.' },
  { icon: 'green', title: 'Simple API', desc: 'A single GET request is all it takes. No SDKs to install, no complex authentication flows.' },
  { icon: 'amber', title: 'Usage Analytics', desc: 'Track your screenshot usage, monitor trends, and optimize your quota with a detailed dashboard.' },
  { icon: 'purple', title: 'Full Page Capture', desc: 'Capture the entire scrollable page, not just the visible viewport, with perfect fidelity.' },
  { icon: 'blue', title: 'PDF Export', desc: 'Convert any web page into a pixel-perfect PDF document with a single API call.' },
  { icon: 'green', title: 'Secure & Reliable', desc: 'Enterprise-grade security with API key authentication and 99.9% guaranteed uptime.' },
];

const featureList = [
  'Full Page',
  'Custom Viewport',
  'Element Screenshot',
  'Remove Elements',
  'Custom User Agent',
  'Custom Headers',
  'Wait for Selector',
  'Wait for Network Idle',
  'Custom Cookies',
  'Custom Proxy',
  'PDF Export',
  'JPEG Format',
];

const codeFeatures = [
  'Single GET request',
  'No SDK required',
  'Instant authentication',
  'Blob & URL response',
  'Custom viewport size',
  'Full page capture',
  'PDF & image export',
  'Built-in caching',
];

const comparisonRows = [
  { feature: 'PDF', shotly: true, puppeteer: true, playwright: true },
  { feature: 'PNG', shotly: true, puppeteer: true, playwright: true },
  { feature: 'JPG', shotly: true, puppeteer: false, playwright: false },
  { feature: 'WEBP', shotly: true, puppeteer: false, playwright: false },
  { feature: 'Full Page', shotly: true, puppeteer: true, playwright: true },
  { feature: 'Custom Viewport', shotly: true, puppeteer: true, playwright: true },
  { feature: 'No Infrastructure', shotly: true, puppeteer: false, playwright: false },
  { feature: 'R2 Caching', shotly: true, puppeteer: false, playwright: false },
  { feature: 'API Key Auth', shotly: true, puppeteer: false, playwright: false },
  { feature: 'Usage Analytics', shotly: true, puppeteer: false, playwright: false },
];

const testimonials = [
  { name: 'Aarav Sharma', role: 'Senior Engineer, Flipkart', color: 'blue', quote: 'ShotlyAPI replaced our entire self-hosted Puppeteer cluster. Setup took five minutes and screenshots render perfectly every time.' },
  { name: 'Priya Nair', role: 'Product Lead, Razorpay', color: 'green', quote: 'The PDF export feature alone saved us weeks of engineering. The API is clean, fast, and the docs are exceptional.' },
  { name: 'Rohan Mehta', role: 'CTO, Zomato Clone', color: 'amber', quote: 'We process thousands of screenshots daily for our link previews. ShotlyAPI handles the load effortlessly at a fraction of the cost.' },
];

const pricingTiers = [
  { name: 'Free', amount: 'Rs 0', period: '', desc: '50 screenshots / month', features: ['50 screenshots / month', 'PNG & JPEG formats', 'Full page capture', 'Community support'], cta: 'Start Free', popular: false },
  { name: 'Starter', amount: '$5', inr: '₹399', period: '/mo', desc: '2,000 screenshots / month', features: ['2,000 screenshots / month', 'All image formats', 'PDF export', 'Custom viewport', 'Email support'], cta: 'Get Starter', popular: false },
  { name: 'Growth', amount: '$9', inr: '₹699', period: '/mo', desc: '4,000 screenshots / month', features: ['4,000 screenshots / month', 'Everything in Starter', 'R2 caching', 'Custom headers', 'Priority support'], cta: 'Get Growth', popular: true },
  { name: 'Pro', amount: '$19', inr: '₹1,499', period: '/mo', desc: '10,000 screenshots / month', features: ['10,000 screenshots / month', 'Everything in Growth', 'Custom proxy', 'Usage analytics', 'Dedicated support'], cta: 'Get Pro', popular: false },
];

const faqs = [
  { q: 'What is a screenshot API?', a: 'A screenshot API is a service that programmatically captures visual snapshots of web pages. Instead of running a headless browser yourself, you send a simple HTTP request and receive a high-quality image or PDF of the target website in return.' },
  { q: 'How does it work?', a: 'You send a GET request to our API endpoint with the target URL and optional parameters (format, viewport size, full page, etc.). Our rendering engine loads the page in a real Chromium browser, captures the screenshot, and returns the image bytes or a cached URL within seconds.' },
  { q: 'Is there a free tier?', a: 'Yes. Our free tier includes 50 screenshots per month at no cost, with no credit card required. It is perfect for testing, personal projects, and small-scale usage. You can upgrade to a paid plan anytime for higher limits.' },
  { q: 'What formats are supported?', a: 'ShotlyAPI supports PNG, JPEG, WEBP image formats and PDF document export. You can specify the desired format via the format query parameter in your API request.' },
  { q: 'How fast is the API?', a: 'Our average response time is under 3 seconds, with cached screenshots returning in under 500ms. Our global edge network ensures low latency regardless of your geographic location.' },
  { q: 'Can I use it for commercial projects?', a: 'Absolutely. ShotlyAPI is designed for commercial use. All paid plans include a commercial license, and we offer dedicated support and SLAs for enterprise customers with high-volume requirements.' },
];

const curlExample = `curl -G 'https://api.shotlyapi.in/api/screenshot' \\
  --data-urlencode 'url=https://example.com' \\
  --data-urlencode 'format=png' \\
  --data-urlencode 'full_page=true' \\
  --data-urlencode 'width=1440' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -o screenshot.png`;

const pythonExample = `import requests

API_URL = 'https://api.shotlyapi.in/api/screenshot'
params = {
    'url': 'https://example.com',
    'format': 'png',
    'full_page': 'true',
    'width': 1440,
}
headers = {'Authorization': 'Bearer YOUR_API_KEY'}

response = requests.get(API_URL, params=params, headers=headers)

with open('screenshot.png', 'wb') as f:
    f.write(response.content)

print('Screenshot saved!')`;

function Check() {
  return <span className="check">{'\u2713'}</span>;
}

function FAQItem({ item, isOpen, onClick }) {
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={onClick} type="button">
        {item.q}
        <span className="faq-toggle">{isOpen ? '\u2212' : '+'}</span>
      </button>
      {isOpen && <div className="faq-answer">{item.a}</div>}
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [demoUrl, setDemoUrl] = useState('https://example.com');
  const [screenshotSrc, setScreenshotSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  const handleCapture = async () => {
    if (!demoUrl) return;
    setLoading(true);
    setError(null);
    setScreenshotSrc(null);
    try {
      const res = await fetch(
        `${API_URL}/api/screenshot?url=${encodeURIComponent(demoUrl)}&api_key=test-key-123`
      );
      if (!res.ok) {
        throw new Error('Failed to capture screenshot. Please try again.');
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setScreenshotSrc(objectUrl);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="logo">
            <span className="logo-mark">S</span>
            ShotlyAPI
          </Link>
          <div className="nav-links">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}>{link.label}</a>
            ))}
          </div>
          <div className="nav-actions">
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
      <section className="hero"><div className="container">
        <div className="hero-badge">{'\u2B50'} No credit card required</div>
        <h1>Website Screenshot API for Developers</h1>
        <h2>Capture, Convert to PDF & Automate</h2>
        <p>
          Turn any website into a high-quality screenshot or PDF with a single API call.
          Built for developers who value speed, simplicity, and reliability.
        </p>
        </div><div className="hero-cta">
          <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free</Link>
          <a href="#docs" className="btn btn-outline btn-lg">View Documentation</a>
        </div>
      </section>

      {/* Trust bar */}
      <section className="trust">
        <p>Trusted by developers worldwide</p>
        <div className="trust-logos">
          {trustLogos.map((logo) => (
            <span key={logo}>{logo}</span>
          ))}
        </div>
      </section>

      {/* Live Demo */}
      <section className="demo-section" id="demo">
        <h2 className="section-title">Try it live</h2>
        <p>Enter any URL and capture a screenshot in seconds.</p>
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
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-num">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat">
            <div className="stat-num">{'<3s'}</div>
            <div className="stat-label">Avg Response</div>
          </div>
          <div className="stat">
            <div className="stat-num">50+</div>
            <div className="stat-label">Features</div>
          </div>
          <div className="stat">
            <div className="stat-num">Rs 0</div>
            <div className="stat-label">Free Tier</div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="features" id="features">
        <h2 className="section-title">Everything you need to capture the web</h2>
        <p>Powerful features designed for developers, by developers.</p>
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className={`feature-icon feature-icon-${f.icon}`}>{'\u26A1'}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature list */}
      <section className="features">
        <h2 className="section-title">Complete feature set</h2>
        <p>Every option you need, available out of the box.</p>
        <div className="feature-list">
          {featureList.map((item) => (
            <div className="feature-list-item" key={item}>
              <Check />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Code section */}
      <section className="code-section" id="docs">
        <h2 className="section-title">Get started in seconds</h2>
        <p>Simple REST API. No SDKs required.</p>
        <div className="code-grid">
          <div className="code-block">
            <div className="code-header">cURL</div>
            <pre><code>{curlExample}</code></pre>
          </div>
          <div className="code-block">
            <div className="code-header">Python</div>
            <pre><code>{pythonExample}</code></pre>
          </div>
        </div>
        <div className="feature-list">
          {codeFeatures.map((item) => (
            <div className="feature-list-item" key={item}>
              <Check />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="comparison">
        <h2 className="section-title">ShotlyAPI vs the alternatives</h2>
        <p>Why manage infrastructure when you do not have to?</p>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>ShotlyAPI</th>
              <th>Puppeteer</th>
              <th>Playwright</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.feature}>
                <td>{row.feature}</td>
                <td>{row.shotly ? <Check /> : '\u2014'}</td>
                <td>{row.puppeteer ? <Check /> : '\u2014'}</td>
                <td>{row.playwright ? <Check /> : '\u2014'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2 className="section-title">Loved by developers</h2>
        <p>See what our customers have to say.</p>
        <div className="testimonial-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="testimonial-stars">{'\u2605\u2605\u2605\u2605\u2605'}</div>
              <p className="testimonial-quote">{t.quote}</p>
              <div className="testimonial-author">
                <div className={`testimonial-avatar testimonial-avatar-${t.color}`}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <h2 className="section-title">Simple, transparent pricing</h2>
        <p>Start free. Upgrade when you need more.</p>
        <div className="pricing-grid">
          {pricingTiers.map((tier) => (
            <div className={`price-card ${tier.popular ? 'popular' : ''}`} key={tier.name}>
              {tier.popular && <div className="price-badge">Most Popular</div>}
              <div className="price-name">{tier.name}</div>
              <div className="price-amount">
                {tier.amount}
                {tier.inr && <span className="price-inr"> ({tier.inr})</span>}
                {tier.period && <span className="period">{tier.period}</span>}
              </div>
              <div className="price-desc">{tier.desc}</div>
              <ul className="price-features">
                {tier.features.map((feat) => (
                  <li key={feat}><Check /> {feat}</li>
                ))}
              </ul>
              <Link to="/signup" className="btn btn-primary">{tier.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <h2 className="section-title">Frequently asked questions</h2>
        <p>Everything you need to know about ShotlyAPI.</p>
        <div className="faq-list">
          {faqs.map((item, index) => (
            <FAQItem
              key={item.q}
              item={item}
              isOpen={openFaq === index}
              onClick={() => toggleFaq(index)}
            />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta">
        <h2>Ready to capture those screenshots?</h2>
        <p>Join thousands of developers building with ShotlyAPI.</p>
        <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free</Link>
      </section>

      {/* Footer */}
      <footer className="footer" id="blog">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="logo">
              <span className="logo-mark">S</span>
              ShotlyAPI
            </div>
            <p>The fastest way to capture website screenshots and PDFs.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#demo">Demo</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-col">
            <h4>Developers</h4>
            <a href="#docs">API Docs</a>
            <a href="#docs">API Reference</a>
            <a href="https://status.shotlyapi.in">Status</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#about">About</a>
            <Link to="/privacy" style={{display:"block",color:"var(--text-dim)",fontSize:"14px",padding:"4px 0",textDecoration:"none"}}>Privacy</Link>
            <Link to="/terms" style={{display:"block",color:"var(--text-dim)",fontSize:"14px",padding:"4px 0",textDecoration:"none"}}>Terms</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{'\u00A9'} 2026 ShotlyAPI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
