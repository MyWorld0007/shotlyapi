// ShotlyAPI Oracle Server — v2.1 with system Chromium (ARM64 compatible)
// Run with: pm2 start server.js --name screenshot-api
// Deploy to: ~/screenshot-api/server.js on Oracle Cloud

const express = require('express')
const puppeteer = require('puppeteer')
const app = express()

const PORT = process.env.PORT || 3000

// Use system-installed Chromium (works on ARM64)
const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'

// Keep a browser instance alive for faster renders
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/screenshot', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) return res.status(400).json({ error: 'Missing url parameter' })

  // Extract all parameters
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

  let page
  try {
    const browser = await getBrowser()
    page = await browser.newPage()

    // Set viewport
    await page.setViewport({ width, height, deviceScaleFactor: 1 })

    // Set custom user agent
    if (userAgent) {
      await page.setUserAgent(userAgent)
    }

    // Set cookies
    if (cookiesStr) {
      try {
        const cookies = JSON.parse(cookiesStr)
        if (Array.isArray(cookies)) {
          await page.setCookie(...cookies)
        }
      } catch (e) {
        console.log('Invalid cookies JSON:', e.message)
      }
    }

    // Navigate to URL
    const waitUntil = waitForEvent === 'networkidle' ? 'networkidle2' : 'domcontentloaded'
    await page.goto(targetUrl, {
      waitUntil,
      timeout: 30000,
    })

    // Wait for specific selector
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

    // Delay after load
    if (delay > 0) {
      await new Promise(r => setTimeout(r, Math.min(delay, 10000)))
    }

    // Capture screenshot or PDF
    if (format === 'pdf') {
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
      res.set('Content-Type', 'application/pdf')
      res.set('X-Screenshot-Server', 'ShotlyAPI-Oracle')
      return res.send(pdfBuffer)
    }

    let screenshotOptions = {
      type: format === 'jpeg' ? 'jpeg' : 'png',
    }
    if (format === 'jpeg') {
      screenshotOptions.quality = 90
    }

    let screenshotBuffer

    if (selector) {
      const element = await page.$(selector)
      if (element) {
        screenshotBuffer = await element.screenshot(screenshotOptions)
      } else {
        screenshotOptions.fullPage = fullPage
        screenshotBuffer = await page.screenshot(screenshotOptions)
      }
    } else {
      screenshotOptions.fullPage = fullPage
      screenshotBuffer = await page.screenshot(screenshotOptions)
    }

    res.set('Content-Type', 'image/' + format)
    res.set('X-Screenshot-Server', 'ShotlyAPI-Oracle')
    res.send(screenshotBuffer)

  } catch (err) {
    console.error('Screenshot error:', err.message)
    res.status(500).json({ error: 'Failed to capture screenshot', detail: err.message })
  } finally {
    if (page) {
      try { await page.close() } catch {}
    }
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log('ShotlyAPI screenshot server v2.1 running on port ' + PORT)
  console.log('Using Chromium at: ' + CHROMIUM_PATH)
  console.log('Features: PNG, JPEG, PDF, full_page, custom viewport, delay, wait_for_selector, wait_for_event, element selector, user_agent, cookies, hide_elements')
})
