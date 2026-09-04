// ShotlyAPI Oracle Server — v3.0 with ad blocking, CSS/JS injection, HTML-to-Image, text extraction, bulk
// Run with: pm2 start server.js --name screenshot-api

const express = require('express')
const puppeteer = require('puppeteer')
const app = express()

const PORT = process.env.PORT || 3000
const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'

// Common ad/cookie banner selectors to block
const BANNER_SELECTORS = [
  '#cookie-banner', '#cookie-bar', '#cookie-notice', '#cookie-consent',
  '#gdpr-banner', '#gdpr-consent', '#consent-banner', '#consent-modal',
  '.cookie-banner', '.cookie-bar', '.cookie-notice', '.cookie-consent',
  '.cookie-popup', '.cookie-wrapper', '.cookie-message',
  '.gdpr-banner', '.gdpr-consent', '.consent-banner', '.consent-modal',
  '.privacy-banner', '.privacy-notice', '.privacy-popup',
  '#onetrust-banner-sdk', '#onetrust-consent-sdk',
  '.ot-banner', '.ot-consent',
  '#cmp-banner', '#cmp-consent', '.cmp-banner', '.cmp-consent',
  '.cc-banner', '.cc-window', '.cc-banner',
  '#truste-consent-banner', '.truste-consent',
  '.chat-widget', '.chat-bubble', '.chat-button', '#chat-widget',
  '.intercom-launcher', '.intercom-launcher-frame',
  '.drift-frame-controller', '.drift-conductor',
  '#hubspot-messages-iframe-container',
  '.crisp-client', '#crisp-chatbox',
  '.tawk-chat-container', '#tawkchat-container',
  '.zendesk-chat', '.zE-widget-launcher',
  '.ad-banner', '.advertisement', '.ad-container', '.adsbygoogle',
  '#ad-banner', '#advertisement', '#ad-container',
  '.popup-overlay', '.modal-overlay', '.newsletter-popup',
  '#popup', '#modal', '#overlay',
  '.exit-intent', '.exit-popup', '.exit-overlay',
  '.lead-capture', '.lead-form-popup',
]

let browserInstance = null

async function getBrowser() {
  if (browserInstance) {
    try {
      await browserInstance.pages()
      return browserInstance
    } catch {
      browserInstance = null
    }
  }

  browserInstance = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROMIUM_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--lang=en-US,en',
      '--window-size=1920,1080',
    ],
  })
  return browserInstance
}

// Block ads and cookie banners
async function blockBanners(page) {
  const css = BANNER_SELECTORS.join(', ') + ' { display: none !important; }'
  await page.addStyleTag({ content: css })
  
  // Try to click accept buttons to dismiss consent
  try {
    const acceptSelectors = [
      '#accept-cookies', '#accept-all', '#accept',
      '.accept-cookies', '.accept-all', '.accept',
      '[id*="accept"]', '[class*="accept"]',
      '#agree', '.agree', '[id*="agree"]',
      '#ok', '.ok-button', '.consent-accept',
      '#onetrust-accept-btn-handler',
    ]
    for (const sel of acceptSelectors) {
      try {
        const btn = await page.$(sel)
        if (btn) {
          await btn.click({ delay: 100 })
          await new Promise(r => setTimeout(r, 500))
          break
        }
      } catch {}
    }
  } catch {}
}

// Capture screenshot with all options
async function captureScreenshot(page, opts) {
  const { format, fullPage, selector } = opts

  if (format === 'pdf') {
    return {
      buffer: await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      }),
      contentType: 'application/pdf'
    }
  }

  let screenshotOptions = {
    type: format === 'jpeg' ? 'jpeg' : 'png',
  }
  if (format === 'jpeg') screenshotOptions.quality = 90

  let buffer
  if (selector) {
    const element = await page.$(selector)
    if (element) {
      buffer = await element.screenshot(screenshotOptions)
    } else {
      screenshotOptions.fullPage = fullPage
      buffer = await page.screenshot(screenshotOptions)
    }
  } else {
    screenshotOptions.fullPage = fullPage
    buffer = await page.screenshot(screenshotOptions)
  }

  return { buffer, contentType: 'image/' + format }
}

// Extract text from page
async function extractText(page) {
  return await page.evaluate(() => {
    const title = document.title
    const metaDescription = document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').content : ''
    const h1 = Array.from(document.querySelectorAll('h1')).map(el => el.textContent.trim())
    const h2 = Array.from(document.querySelectorAll('h2')).map(el => el.textContent.trim())
    const bodyText = document.body ? document.body.innerText.substring(0, 5000) : ''
    return { title, metaDescription, h1, h2, bodyText }
  })
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ===== Single screenshot =====
app.get('/api/screenshot', async (req, res) => {
  const targetUrl = req.query.url
  const customHtml = req.query.custom_html || null

  if (!targetUrl && !customHtml) {
    return res.status(400).json({ error: 'Missing url or custom_html parameter' })
  }

  const format = req.query.format || 'png'
  const width = parseInt(req.query.width) || 1920
  const height = parseInt(req.query.height) || 1080
  const fullPage = req.query.full_page === 'true'
  const delay = parseInt(req.query.delay) || 0
  const waitForSelector = req.query.wait_for_selector || null
  const waitForEvent = req.query.wait_for_event || null
  const selector = req.query.selector || null
  const userAgent = req.query.user_agent || null
  const cookiesStr = req.query.cookies || null
  const hideElements = req.query.hide_elements || null
  const blockAds = req.query.block_ads === 'true' || req.query.block_banners === 'true'
  const cssInjection = req.query.css || null
  const jsInjection = req.query.js || null
  const extractTextFlag = req.query.extract_text === 'true'

  let page
  try {
    const browser = await getBrowser()
    page = await browser.newPage()

    await page.setViewport({ width, height, deviceScaleFactor: 1 })

    if (userAgent) await page.setUserAgent(userAgent)

    if (cookiesStr) {
      try {
        const cookies = JSON.parse(cookiesStr)
        if (Array.isArray(cookies)) await page.setCookie(...cookies)
      } catch (e) {
        console.log('Invalid cookies JSON:', e.message)
      }
    }

    // Navigate to URL or render custom HTML
    if (customHtml) {
      await page.setContent(customHtml, { waitUntil: 'domcontentloaded', timeout: 30000 })
    } else {
      const waitUntil = waitForEvent === 'networkidle' ? 'networkidle2' : 'domcontentloaded'
      await page.goto(targetUrl, { waitUntil, timeout: 30000 })
    }

    // Block ads/banners
    if (blockAds) {
      await blockBanners(page)
    }

    // Wait for selector
    if (waitForSelector) {
      try {
        await page.waitForSelector(waitForSelector, { visible: true, timeout: 10000 })
      } catch (e) {
        console.log('Selector not found:', waitForSelector)
      }
    }

    // Hide elements
    if (hideElements) {
      const selectorsArr = hideElements.split(',').map(s => s.trim())
      for (const sel of selectorsArr) {
        try {
          await page.evaluate((sel) => {
            const el = document.querySelector(sel)
            if (el) el.style.display = 'none'
          }, sel)
        } catch (e) {
          console.log('Could not hide element:', sel)
        }
      }
    }

    // Inject custom CSS
    if (cssInjection) {
      try {
        await page.addStyleTag({ content: cssInjection })
      } catch (e) {
        console.log('CSS injection failed:', e.message)
      }
    }

    // Inject custom JS
    if (jsInjection) {
      try {
        await page.evaluate(jsInjection)
      } catch (e) {
        console.log('JS injection failed:', e.message)
      }
    }

    // Delay
    if (delay > 0) {
      await new Promise(r => setTimeout(r, Math.min(delay, 10000)))
    }

    // Extract text (returns JSON instead of image)
    if (extractTextFlag) {
      const text = await extractText(page)
      return res.json(text)
    }

    // Capture
    const result = await captureScreenshot(page, { format, fullPage, selector })
    res.set('Content-Type', result.contentType)
    res.set('X-Screenshot-Server', 'ShotlyAPI-Oracle')
    res.send(result.buffer)

  } catch (err) {
    console.error('Screenshot error:', err.message)
    res.status(500).json({ error: 'Failed to capture screenshot', detail: err.message })
  } finally {
    if (page) {
      try { await page.close() } catch {}
    }
  }
})

// ===== Bulk screenshots =====
app.post('/api/screenshot/bulk', express.json(), async (req, res) => {
  const urls = req.body.urls
  const apiKey = req.body.api_key

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Missing urls array' })
  }
  if (urls.length > 50) {
    return res.status(400).json({ error: 'Maximum 50 URLs per bulk request' })
  }

  const opts = {
    format: req.body.format || 'png',
    width: parseInt(req.body.width) || 1920,
    height: parseInt(req.body.height) || 1080,
    fullPage: req.body.full_page === 'true',
    blockAds: req.body.block_ads === 'true',
  }

  const results = []

  for (const targetUrl of urls) {
    let page
    try {
      const browser = await getBrowser()
      page = await browser.newPage()
      await page.setViewport({ width: opts.width, height: opts.height, deviceScaleFactor: 1 })

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })

      if (opts.blockAds) await blockBanners(page)

      let screenshotOptions = {
        type: opts.format === 'jpeg' ? 'jpeg' : 'png',
        fullPage: opts.fullPage,
      }
      if (opts.format === 'jpeg') screenshotOptions.quality = 90

      const buffer = await page.screenshot(screenshotOptions)
      const base64 = buffer.toString('base64')

      results.push({
        url: targetUrl,
        success: true,
        image: 'data:image/' + opts.format + ';base64,' + base64,
      })
    } catch (err) {
      results.push({
        url: targetUrl,
        success: false,
        error: err.message,
      })
    } finally {
      if (page) {
        try { await page.close() } catch {}
      }
    }
  }

  res.json({ results })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log('ShotlyAPI screenshot server v3.0 running on port ' + PORT)
  console.log('Using Chromium at: ' + CHROMIUM_PATH)
  console.log('Features: PNG, JPEG, PDF, full_page, viewport, delay, wait_for_selector, wait_for_event, selector, user_agent, cookies, hide_elements, block_ads, css_injection, js_injection, custom_html, extract_text, bulk')
})
