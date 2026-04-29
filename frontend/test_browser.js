import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
    });

    page.on('pageerror', err => {
      console.log('BROWSER PAGE ERROR:', err.toString());
    });

    console.log("Navigating to http://localhost:5173 ...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    // Try to login
    console.log("Looking for login button...");
    // Just click anything to see if it renders or crashes
    // If it's already logged in from localStorage, it might crash immediately
    
    // Set localStorage mock user to force Dashboard render immediately!
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({uid: "123", email: "test@test.com"}));
      localStorage.setItem('token', "mock-token");
    });
    
    console.log("Reloading to trigger Dashboard...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    console.log("Waiting 3s for render...");
    await new Promise(r => setTimeout(r, 3000));
    
    await browser.close();
    console.log("Done");
  } catch (err) {
    console.error("Script error:", err);
  }
})();
