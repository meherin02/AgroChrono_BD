const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:"msedge"});const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});await p.goto('https://agrochrono-app-production.up.railway.app/',{waitUntil:'networkidle',timeout:90000});await p.screenshot({path:'presentation-build/assets/live-home.png',fullPage:true});console.log(await p.locator('body').innerText());await b.close()})();

