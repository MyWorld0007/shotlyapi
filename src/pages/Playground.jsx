import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme, ThemeToggle } from '../lib/ThemeToggle'

const API_URL = 'https://api.shotlyapi.in'

const viewports = [
  { label: 'Mobile', width: 390, height: 844, icon: '\u{1F4F1}', paid: false },
  { label: 'Tablet', width: 768, height: 1024, icon: '\u{1F4F2}', paid: false },
  { label: 'Desktop', width: 1440, height: 900, icon: '\u{1F4BB}', paid: false },
  { label: '4K', width: 2560, height: 1600, icon: '\u{1F5A5}', paid: true },
]

const formats = [
  { label: 'PNG', paid: false },
  { label: 'JPG', paid: false },
  { label: 'WEBP', paid: false },
  { label: 'PDF', paid: true },
]

const paramsTable = [
  { param: 'URL', values: 'Any website URL', desc: 'The target website address to capture. Must include https:// or http://', free: true },
  { param: 'Viewport', values: 'Mobile / Tablet / Desktop / 4K', desc: 'Sets the browser window size used to render the page before capture. Mobile and Tablet are useful for checking responsive layouts; 4K is useful for high-resolution marketing assets.', free: true },
  { param: 'File Type', values: 'PNG / JPG / WEBP / PDF', desc: 'PNG preserves transparency and sharp UI edges. JPG produces smaller files for photo-heavy pages. WebP balances quality and file size. PDF captures the page as a paginated document.', free: true },
  { param: 'Full Page', values: 'true / false', desc: 'Captures the entire scrollable height of the page instead of only the visible viewport. Use this for long landing pages, articles, or documentation.', free: true },
  { param: 'Output', values: 'IMAGE / JSON', desc: 'IMAGE returns the screenshot file directly in the response body. JSON returns a response object with a hosted URL and metadata.', free: true },
  { param: 'Block Ads & Cookies', values: 'true / false', desc: 'Automatically detects and removes cookie-consent overlays, GDPR popups, chat widgets, and ad placements before the screenshot is taken.', free: false },
  { param: 'CSS Injection', values: 'Any CSS string', desc: 'Inject custom CSS styles into the page before capture. Perfect for hiding specific elements, changing colors, or testing design variations.', free: false },
  { param: 'JS Injection', values: 'Any JS string', desc: 'Execute custom JavaScript on the page before capture. Dismiss modals, fill forms, click buttons, or test interactive states.', free: false },
  { param: 'HTML to Image', values: 'Raw HTML markup', desc: 'Render raw HTML markup directly into a screenshot without needing a public URL. Perfect for OG images, email previews, and dynamic social cards.', free: false },
  { param: 'Text Extraction', values: 'true / false', desc: 'Extract page titles, headings, and body text alongside the screenshot in a single API call. Returns structured JSON with the page content.', free: false },
  { param: 'Custom Delay', values: '0-10000 (ms)', desc: 'Wait a specified number of milliseconds before capturing. Useful for pages with animations, transitions, or content that loads after initial render.', free: false },
  { param: 'Wait for Selector', values: 'CSS selector string', desc: 'Wait until a specific element appears on the page before capturing. Ensures dynamic content has loaded before the screenshot is taken.', free: false },
  { param: 'Hide Elements', values: 'CSS selector string', desc: 'Hide specific elements by CSS selector before capture. Remove navigation bars, footers, popups, or any element you do not want in the screenshot.', free: false },
  { param: 'Custom User Agent', values: 'Any UA string', desc: 'Set a custom browser user agent string. Useful for capturing mobile-specific layouts, testing bot rendering, or bypassing UA-based restrictions.', free: false },
  { param: 'Custom Cookies', values: 'JSON array', desc: 'Inject custom cookies into the browser session before capture. Perfect for capturing authenticated pages, A/B test variants, or geo-specific content.', free: false },
  { param: 'Bulk Screenshots', values: 'Up to 50 URLs', desc: 'Process up to 50 URLs in a single POST request. Returns all screenshots in one response. Perfect for SEO audits and competitive analysis.', free: false },
  { param: 'Fresh Capture', values: 'true / false', desc: 'Bypass the R2 edge cache and force a fresh screenshot. Use this when you need the latest version of a page that changes frequently.', free: false },
]

const formatGuide = [
  { format: 'PNG', bestFor: 'UI screenshots, text-heavy pages, anything needing transparency', tradeoff: 'Larger file size than JPG or WebP for photo-heavy pages', icon: '\u{1F5BC}' },
  { format: 'JPG', bestFor: 'Photo-heavy pages where file size matters more than sharp edges', tradeoff: 'Lossy compression can blur small text and UI edges', icon: '\u{1F4F7}' },
  { format: 'WebP', bestFor: 'A balance of quality and file size for most general use cases', tradeoff: 'Slightly less universal support in older tooling than PNG/JPG', icon: '\u2696' },
  { format: 'PDF', bestFor: 'Archiving, reports, and pages you want to treat as a document', tradeoff: 'Not ideal for embedding as a web image', icon: '\u{1F4C4}' },
]

const steps = [
  { num: '1', title: 'You send a request', desc: 'Call the API with a target URL and the parameters you want. Viewport, file type, output mode, and any advanced options like full page or ad blocking.' },
  { num: '2', title: 'A headless browser renders the page', desc: 'The target page is loaded in a real Chromium browser at the requested viewport size, so the capture reflects what a visitor would actually see, including JavaScript-rendered content.' },
  { num: '3', title: 'Optional cleanup is applied', desc: 'If enabled, cookie banners and ad placements are removed, custom CSS/JS is injected, and the page is prepared for capture so it reflects the actual content.' },
  { num: '4', title: 'You get the result back', desc: 'The response is returned as either the image/PDF file directly, or as JSON containing a hosted URL and metadata. Ready to store, display, or pass into another step of your pipeline.' },
]

export default function Playground() {
  const { theme, toggleTheme } = useTheme()
  const [url, setUrl] = useState('https://example.com')
  const [viewport, setViewport] = useState(viewports[2])
  const [format, setFormat] = useState('PNG')
  const [fullPage, setFullPage] = useState(false)
  const [output, setOutput] = useState('IMAGE')
  const [blockAds, setBlockAds] = useState(false)
  const [cssInject, setCssInject] = useState('')
  const [jsInject, setJsInject] = useState('')
  const [customHtml, setCustomHtml] = useState('')
  const [extractText, setExtractText] = useState(false)
  const [delay, setDelay] = useState(0)
  const [waitForSelector, setWaitForSelector] = useState('')
  const [hideElements, setHideElements] = useState('')
  const [screenshotSrc, setScreenshotSrc] = useState(null)
  const [extractedText, setExtractedText] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const resultRef = useRef(null)

  const buildParams = () => {
    const p = new URLSearchParams()
    p.set('url', url || 'https://example.com')
    p.set('api_key', 'test-key-123')
    p.set('format', format.toLowerCase())
    p.set('width', viewport.width)
    p.set('height', viewport.height)
    if (fullPage) p.set('full_page', 'true')
    if (blockAds) p.set('block_ads', 'true')
    if (cssInject) p.set('css', cssInject)
    if (jsInject) p.set('js', jsInject)
    if (customHtml) p.set('custom_html', customHtml)
    if (extractText) p.set('extract_text', 'true')
    if (delay > 0) p.set('delay', delay)
    if (waitForSelector) p.set('wait_for_selector', waitForSelector)
    if (hideElements) p.set('hide_elements', hideElements)
    return p
  }

  const buildCurlCommand = () => {
    const params = buildParams()
    const pairs = params.toString().split('&')
    return `curl -G 'https://api.shotlyapi.in/api/screenshot' \\\n${pairs.map((p, i) => `  --data-urlencode '${p}'${i < pairs.length - 1 ? ' \\' : ''}`).join('\n')} \\\n  -o screenshot.${format.toLowerCase()}`
  }

  const buildCodeSnippet = () => {
    const params = buildParams()
    const paramsObj = {}
    params.forEach((v, k) => { paramsObj[k] = v })
    return `import requests\n\nparams = ${JSON.stringify(paramsObj, null, 4).replace(/"/g, "'")}\n\nresponse = requests.get(\n    'https://api.shotlyapi.in/api/screenshot',\n    params=params\n)\n\nwith open('screenshot.${format.toLowerCase()}', 'wb') as f:\n    f.write(response.content)`
  }

  const handleCapture = async () => {
    if (!url && !customHtml) return
    setLoading(true)
    setError(null)
    setScreenshotSrc(null)
    setExtractedText(null)
    try {
      const params = buildParams()
      const res = await fetch(`${API_URL}/api/screenshot?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to capture screenshot. Please try again.')
      }
      if (extractText && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json()
        setExtractedText(data)
      } else {
        const blob = await res.blob()
        setScreenshotSrc(URL.createObjectURL(blob))
      }
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(buildCurlCommand())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            <Link to="/" style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Home</Link>
            <a href="#studio" style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Studio</a>
            <a href="#settings" style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Settings</a>
            <a href="#format-guide" style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Guide</a>
          </div>
          <div className="nav-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Link to="/signup" className="btn btn-primary btn-sm">Get API Key</Link>
          </div>
        </div>
      </nav>

      {/* Capture Studio */}
      <section className="pg-hero" id="studio">
        <div className="container">
          <h1 className="pg-title">
            Capture <span className="gradient-text">Studio</span>
          </h1>
          <p className="pg-subtitle">
            Instantly capture full-page or custom screenshots of any website.
            Take your first screenshot without any registration and experience our service in action.
          </p>

          <div className="pg-layout">
            {/* Left: Controls */}
            <div className="pg-controls">
              {/* URL */}
              <div className="pg-control-group">
                <label className="pg-label">URL</label>
                <input
                  className="pg-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              {/* Viewport */}
              <div className="pg-control-group">
                <label className="pg-label">Viewport</label>
                <div className="pg-segmented">
                  {viewports.map((vp) => (
                    <button
                      key={vp.label}
                      className={`pg-seg-btn ${viewport.label === vp.label ? 'active' : ''} ${vp.paid ? 'pg-locked' : ''}`}
                      onClick={() => !vp.paid && setViewport(vp)}
                      type="button"
                      disabled={vp.paid}
                      title={vp.paid ? 'Paid' : ''}
                    >
                      <span className="pg-seg-icon">{vp.icon}</span>
                      <span className="pg-seg-text">{vp.label}{vp.paid && ' \u{1F512}'}</span>
                      <span className="pg-seg-dim">{vp.width}x{vp.height}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="pg-control-group">
                <label className="pg-label">File Type</label>
                <div className="pg-segmented pg-segmented-sm">
                  {formats.map((f) => (
                    <button
                      key={f.label}
                      className={`pg-seg-btn-sm ${format === f.label ? 'active' : ''} ${f.paid ? 'pg-locked' : ''}`}
                      onClick={() => !f.paid && setFormat(f.label)}
                      type="button"
                      disabled={f.paid}
                      title={f.paid ? 'Paid' : ''}
                    >
                      {f.label}{f.paid && ' \u{1F512}'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output */}
              <div className="pg-control-group">
                <label className="pg-label">Output</label>
                <div className="pg-segmented pg-segmented-sm">
                  <button
                    className={`pg-seg-btn-sm ${output === 'IMAGE' ? 'active' : ''}`}
                    onClick={() => setOutput('IMAGE')}
                    type="button"
                  >
                    IMAGE
                  </button>
                  <button
                    className="pg-seg-btn-sm pg-locked"
                    onClick={() => {}}
                    type="button"
                    disabled
                    title="Paid"
                  >
                    {'JSON \u{1F512}'}
                  </button>
                </div>
              </div>

              {/* Full Page */}
              <div className="pg-toggle-row">
                <div>
                  <div className="pg-toggle-label">Full Page</div>
                  <div className="pg-toggle-desc">Capture entire scrollable page</div>
                </div>
                <button
                  className={`pg-switch ${fullPage ? 'on' : ''}`}
                  onClick={() => setFullPage(!fullPage)}
                  type="button"
                >
                  <span className="pg-switch-knob" />
                </button>
              </div>

              {/* Premium divider */}
              <div className="pg-premium-divider">
                <span>Premium Features</span>
              </div>

              {/* Block Ads */}
              <div className="pg-toggle-row pg-premium">
                <div>
                  <div className="pg-toggle-label">Block Ads & Cookies</div>
                  <div className="pg-toggle-desc">Strip cookie banners, GDPR popups, ads</div>
                </div>
                <button
                  className={`pg-switch ${blockAds ? 'on' : ''}`}
                  onClick={() => setBlockAds(!blockAds)}
                  type="button"
                ><span className="pg-switch-knob" /></button>
              </div>

              {/* CSS Injection */}
              <div className="pg-control-group pg-premium">
                <label className="pg-label">CSS Injection</label>
                <textarea
                  className="pg-textarea"
                  value={cssInject}
                  onChange={(e) => setCssInject(e.target.value)}
                  placeholder="body { background: #ff0000 !important; }"
                  rows={2}
                />
              </div>

              {/* JS Injection */}
              <div className="pg-control-group pg-premium">
                <label className="pg-label">JS Injection</label>
                <textarea
                  className="pg-textarea"
                  value={jsInject}
                  onChange={(e) => setJsInject(e.target.value)}
                  placeholder="document.querySelector('.modal')?.remove()"
                  rows={2}
                />
              </div>

              {/* HTML to Image */}
              <div className="pg-control-group pg-premium">
                <label className="pg-label">HTML to Image</label>
                <textarea
                  className="pg-textarea"
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  placeholder="<h1>Hello World</h1>"
                  rows={2}
                />
              </div>

              {/* Text Extraction */}
              <div className="pg-toggle-row pg-premium">
                <div>
                  <div className="pg-toggle-label">Text Extraction</div>
                  <div className="pg-toggle-desc">Extract page title, headings, body text</div>
                </div>
                <button
                  className={`pg-switch ${extractText ? 'on' : ''}`}
                  onClick={() => setExtractText(!extractText)}
                  type="button"
                ><span className="pg-switch-knob" /></button>
              </div>

              {/* Delay */}
              <div className="pg-control-group pg-premium">
                <label className="pg-label">Custom Delay (ms) — {delay}ms</label>
                <input
                  className="pg-slider"
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                />
              </div>

              {/* Wait for Selector */}
              <div className="pg-control-group pg-premium">
                <label className="pg-label">Wait for Selector</label>
                <input
                  className="pg-input"
                  type="text"
                  value={waitForSelector}
                  onChange={(e) => setWaitForSelector(e.target.value)}
                  placeholder=".main-content"
                />
              </div>

              {/* Hide Elements */}
              <div className="pg-control-group pg-premium">
                <label className="pg-label">Hide Elements</label>
                <input
                  className="pg-input"
                  type="text"
                  value={hideElements}
                  onChange={(e) => setHideElements(e.target.value)}
                  placeholder=".navbar, .footer"
                />
              </div>

              {/* Capture button */}
              <button
                className="btn btn-primary btn-lg pg-capture-btn"
                onClick={handleCapture}
                disabled={loading}
                type="button"
              >
                {loading ? '\u23F3 Capturing...' : '\u{1F4F8} Capture Screenshot'}
              </button>
            </div>

            {/* Right: Result */}
            <div className="pg-result-area" ref={resultRef}>
              <div className="pg-result-header">
                <div className="pg-result-label">Result</div>
              </div>
              <div className="pg-result-box">
                {loading && (
                  <div className="pg-loading">
                    <div className="pg-spinner" />
                    <p>Capturing screenshot...</p>
                  </div>
                )}
                {error && (
                  <div className="pg-error">
                    <p>{'\u26A0'} {error}</p>
                  </div>
                )}
                {!loading && !error && !screenshotSrc && !extractedText && (
                  <div className="pg-placeholder">
                    <div className="pg-placeholder-icon">{'\u{1F4F7}'}</div>
                    <p>Your screenshot will appear here</p>
                    <span>Configure settings and click Capture</span>
                  </div>
                )}
                {screenshotSrc && !loading && (
                  <img src={screenshotSrc} alt="Captured screenshot" className="pg-screenshot" />
                )}
                {extractedText && !loading && (
                  <div className="pg-text-result">
                    <h3>{extractedText.title || 'Extracted Text'}</h3>
                    {extractedText.headings?.length > 0 && (
                      <div className="pg-text-section">
                        <h4>Headings</h4>
                        <ul>{extractedText.headings.map((h, i) => <li key={i}>{h}</li>)}</ul>
                      </div>
                    )}
                    {extractedText.body && (
                      <div className="pg-text-section">
                        <h4>Body Text</h4>
                        <p>{extractedText.body}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Preview */}
      <section className="pg-code-section">
        <div className="container">
          <h2 className="section-title">Same request, in code</h2>
          <p className="section-sub">This matches the settings you just configured above. Swap in your API key and drop it straight into your project.</p>
          <div className="pg-code-tabs">
            <div className="pg-code-tab active">cURL</div>
            <button className="pg-copy-btn" onClick={copyCode} type="button">
              {copied ? '\u2713 Copied' : '\u29C9 Copy'}
            </button>
          </div>
          <div className="pg-code-block">
            <pre>{buildCurlCommand()}</pre>
          </div>
          <div className="pg-code-tab active" style={{ marginTop: '24px' }}>Python</div>
          <div className="pg-code-block">
            <pre>{buildCodeSnippet()}</pre>
          </div>
        </div>
      </section>

      {/* Settings Table */}
      <section className="pg-settings" id="settings">
        <div className="container">
          <h2 className="section-title">What each setting does</h2>
          <p className="section-sub">A quick reference for every option in the Studio above, so you know exactly which parameter to change in your own API calls.</p>
          <div className="pg-table-wrap">
            <table className="pg-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Values</th>
                  <th>What it does</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                {paramsTable.map((row) => (
                  <tr key={row.param}>
                    <td className="pg-table-param">{row.param}</td>
                    <td className="pg-table-values">{row.values}</td>
                    <td className="pg-table-desc">{row.desc}</td>
                    <td>
                      {row.free ? (
                        <span className="pg-badge pg-badge-free">FREE</span>
                      ) : (
                        <span className="pg-badge pg-badge-pro">PRO</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Format Guide */}
      <section className="pg-format-guide" id="format-guide">
        <div className="container">
          <h2 className="section-title">Which format and output should you use?</h2>
          <p className="section-sub">A quick guide to picking a file format and response type based on what you are building.</p>

          <div className="pg-guide-grid">
            {formatGuide.map((f) => (
              <div className="pg-guide-card" key={f.format}>
                <div className="pg-guide-icon">{f.icon}</div>
                <h3>{f.format}</h3>
                <div className="pg-guide-best">
                  <span className="pg-guide-tag">Best for</span>
                  <p>{f.bestFor}</p>
                </div>
                <div className="pg-guide-tradeoff">
                  <span className="pg-guide-tag pg-guide-tag-warn">Trade-off</span>
                  <p>{f.tradeoff}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pg-output-guide">
            <h3>Output: IMAGE vs JSON</h3>
            <div className="pg-output-grid">
              <div className="pg-output-card">
                <h4>IMAGE</h4>
                <p><strong>Best for:</strong> Direct display, downloads, or embedding the file itself</p>
                <p><strong>Trade-off:</strong> No metadata — you only get the raw file back</p>
              </div>
              <div className="pg-output-card">
                <h4>JSON</h4>
                <p><strong>Best for:</strong> Automated pipelines that need a hosted URL plus status metadata</p>
                <p><strong>Trade-off:</strong> Requires an extra step to fetch the image from the returned URL</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pg-how">
        <div className="container">
          <h2 className="section-title">How the screenshot API works</h2>
          <p className="section-sub">A single API call runs a full render pipeline behind the scenes.</p>
          <div className="pg-steps">
            {steps.map((step) => (
              <div className="pg-step" key={step.num}>
                <div className="pg-step-num">{step.num}</div>
                <div className="pg-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign in CTA */}
      <section className="pg-cta">
        <div className="container">
          <div className="pg-cta-inner">
            <h2>Sign in to Explore More</h2>
            <p>Sign in to unlock the full capabilities of our platform. Gain access to advanced features designed to enhance your experience and streamline your workflow.</p>
            <p className="pg-cta-features">
              Enjoy powerful tools such as ad blocking, CSS and JS injection, HTML-to-Image, text extraction, bulk screenshot processing, and much more.
            </p>
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
              <Link to="/" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Home</Link>
              <Link to="/playground" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Capture Studio</Link>
              <a href="#pricing" style={{ display: 'block', color: 'var(--text-mute)', fontSize: '14px', padding: '4px 0', textDecoration: 'none' }}>Pricing</a>
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
