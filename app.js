const express = require('express');
const puppeteer = require('puppeteer');

const port = process.env.PRINTER_PORT;

// Login to platform
const base_url = process.env.PLATFORM_URL;  // e.g. https://platform.example.com
const username = process.env.PLATFORM_USERNAME;
const password = process.env.PLATFORM_PASSWORD;

const app = express();
app.use(express.json());

app.get('/pdf', (req, res) => {
  res.writeHead('200', 'OK', { 'Content-Type': 'text/html' });
  res.end('Printer is ready to print!');
});

app.post('/pdf', async (req, res) => {
  try {
    const relative_url = req.body.url;
    const header = req.body.header;
    const footer = req.body.footer;
    const margin = req.body.margin || {
      top:    40, // ≈1cm
      right:  40,
      bottom: 40,
      left:   72  // ≈2cm
    }
    const DPIratio = req.body.dpi || 1.3333

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log(`Authenticating to ${base_url}.`);
    await page.goto(base_url);
    await page.type('[name="username"]', username);
    await page.type('[name="password"]', password);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    console.log(`PDF generation has started for ${base_url + relative_url}`);
    await page.goto(base_url + relative_url);
    const pdf = await page.pdf({
      printBackground: true,

      // preferCSSPageSize: true,
      format: 'A4',
      width: 800,
      height: 1120,
      margin: 0,

      // Header and footer are rendered in the same context which means
      // they can share <style>
      displayHeaderFooter: true,
      headerTemplate: ".", // ugly disable of header
      footerTemplate: footer,

    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="output.pdf"`
    });
    res.send(pdf);
    console.log('PDF generated successfully');

  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while generating the PDF');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
