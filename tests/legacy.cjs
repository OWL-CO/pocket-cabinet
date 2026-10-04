const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const legacy={version:1,note:'survivor log',moods:{'2026-10-04':'electric'},waterings:['2026-10-04'],adventures:['2026-10-04']};
 await page.addInitScript(data=>{if(!localStorage.getItem('pocket-cabinet-v1'))localStorage.setItem('pocket-cabinet-v1',JSON.stringify(data));},legacy);
 await page.goto('http://127.0.0.1:8000');await page.locator('#experiments').evaluate(el=>el.open=true);
 assert.equal(await page.locator('#note').inputValue(),'survivor log');
 const initialPrint=await page.locator('#print').evaluate(el=>el.toDataURL());await page.reload();await page.locator('#experiments').evaluate(el=>el.open=true);assert.equal(await page.locator('#print').evaluate(el=>el.toDataURL()),initialPrint);
 await page.locator('#new-print').click();const changedPrint=await page.locator('#print').evaluate(el=>el.toDataURL());assert.notEqual(changedPrint,initialPrint);await page.reload();await page.locator('#experiments').evaluate(el=>el.open=true);assert.equal(await page.locator('#print').evaluate(el=>el.toDataURL()),changedPrint);
 const imageDownload=page.waitForEvent('download');await page.locator('#download-print').click();const imageFile=await imageDownload;assert.match(imageFile.suggestedFilename(),/\.png$/);
 const fs=require('node:fs');assert.equal(fs.readFileSync(await imageFile.path()).subarray(1,4).toString(),'PNG');
 await page.getByText('Your previous records',{exact:true}).click();assert.match(await page.locator('#legacy-status').textContent(),/1 mood entries, 1 waterings, and 1 adventures/);
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('pocket-cabinet-v1'))),legacy);
 for(let i=0;i<=200;i++){
  await page.locator('#dial').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},88+i/10);
  if(!await page.locator('#capture').isDisabled())break;
 }
 assert.equal(await page.locator('#capture').isDisabled(),false);await page.locator('#capture').click();assert.equal(await page.locator('#captures').textContent(),'01');assert.equal(await page.locator('.artifact').count(),1);
 await page.locator('#note').fill('Do not trust the moon.');
 const first=page.getByRole('button',{name:'KICK step 1',exact:true});await first.click();assert.equal(await first.getAttribute('aria-pressed'),'false');
 await page.locator('#tempo').evaluate(el=>{el.value=145;el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.reload();await page.locator('#experiments').evaluate(el=>el.open=true);assert.equal(await page.locator('#note').inputValue(),'Do not trust the moon.');assert.equal(await page.locator('#bpm').textContent(),'145');assert.equal(await page.getByRole('button',{name:'KICK step 1',exact:true}).getAttribute('aria-pressed'),'false');assert.equal(await page.locator('.artifact').count(),1);
 await page.locator('#play').click();await page.waitForTimeout(300);assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.step.current').count(),3);await page.locator('#sound').click();assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');assert.equal(await page.locator('.step.current').count(),0);
 const downloading=page.waitForEvent('download');await page.locator('#export').click();const download=await downloading,backup=await download.path();
 await page.locator('#note').fill('Overwrite test');page.on('dialog',d=>d.accept());await page.locator('#import').setInputFiles(backup);await page.waitForFunction(()=>document.getElementById('note').value==='Do not trust the moon.');
 await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":2}')});await page.waitForFunction(()=>document.getElementById('data-status').textContent.startsWith('Invalid'));assert.equal(await page.locator('#note').inputValue(),'Do not trust the moon.');
 await page.screenshot({path:'/tmp/relay-lab.png',fullPage:true});
 for(const width of [390,320,768]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}`);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/relay-lab-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('disabled');}});});const bp=await blocked.newPage();await bp.goto('http://127.0.0.1:8000');await bp.locator('#note').fill('temporary');assert.match(await bp.locator('#save-status').textContent(),/NOT SAVED/);
 const reduced=await browser.newContext({reducedMotion:'reduce'}),rp=await reduced.newPage();await rp.goto('http://127.0.0.1:8000');await rp.locator('#experiments').evaluate(el=>el.open=true);await rp.locator('#dial').fill('97.3');assert.equal(await rp.locator('#frequency').textContent(),'97.3');assert.equal(await rp.locator('#selected-route-path').evaluate(el=>getComputedStyle(el).animationName),'none');assert.equal(await rp.locator('.case-scan').evaluate(el=>getComputedStyle(el).animationName),'none');
 console.log('PASS: deterministic print generation/persistence/PNG download; legacy data migration without overwrite; signal capture; note/pattern/tempo/find persistence; audio start/mute; export/restore; invalid import protection; 320/390/768px layouts; blocked storage; reduced motion; no JS errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
