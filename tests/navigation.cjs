const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {show}=require('./helpers.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-05T09:00:00Z')});
 await page.goto('http://127.0.0.1:8000');
 assert.equal(await page.locator('[data-view]:visible').count(),1);assert.equal(await page.locator('#view-drift').isVisible(),true);
 assert.equal(await page.locator('#case').isVisible(),false);assert.equal(await page.locator('#notes').isVisible(),false);
 assert.equal(await page.locator('[data-view-link="drift"]').getAttribute('aria-current'),'page');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),true,'desktop Drift fits the viewport');
 await page.locator('[data-view-link="case"]').click();await page.locator('#inspect').click();assert.equal(await page.locator('#packet').isVisible(),true);
 await page.getByRole('link',{name:'OPEN DECODER →',exact:true}).click();await page.locator('#codec-input').fill('unfinished input');assert.equal(await page.locator('#case').isVisible(),false);
 await page.locator('[data-view-link="tools"]').click();await page.locator('#note').fill('Channel navigation preserves this.');
 await page.getByRole('link',{name:'FOCUS + TASKS',exact:true}).click();await page.locator('#timer-clock').waitFor({state:'visible'});assert.equal(await page.locator('#note').isVisible(),false);
 await page.locator('#timer-toggle').click();await page.clock.fastForward(5000);
 await page.locator('[data-view-link="drift"]').click();assert.equal(await page.locator('#focus-indicator').isVisible(),true);assert.match(await page.locator('#focus-indicator').textContent(),/24:55/);
 await page.goBack();await page.locator('#timer-clock').waitFor({state:'visible'});assert.match(page.url(),/#focus$/);assert.equal(await page.locator('#timer-clock').textContent(),'24:55');
 await page.goForward();await page.locator('#drift-next').waitFor({state:'visible'});
 await show(page,'decoder');assert.equal(await page.locator('#codec-input').inputValue(),'unfinished input');
 await page.locator('[data-view-link="lab"]').click();await page.locator('#new-print').waitFor({state:'visible'});assert.equal(await page.locator('#receiver').isVisible(),false);
 await page.getByRole('link',{name:'NOISE ENGINE',exact:true}).click();await page.locator('#play').click();assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'true');
 await page.locator('[data-view-link="drift"]').click();await page.locator('#drift-next').waitFor({state:'visible'});assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');
 await show(page,'notes');await page.reload();assert.equal(await page.locator('#note').inputValue(),'Channel navigation preserves this.');assert.equal(await page.locator('#notes').isVisible(),true);
 await page.screenshot({path:'/tmp/channels-desktop.png',fullPage:true});
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:844});
  for(const hash of ['drift','case','notes','focus','decoder','latest','receiver','drum','archive','memory']){
   await show(page,hash);assert.equal(await page.locator('[data-view]:visible').count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${hash}: overflow at ${width}`);
  }
 }
 await page.setViewportSize({width:390,height:600});await show(page,'case');await page.locator('#inspect').click(); // close, then reopen for a long active view
 await page.locator('#inspect').click();await page.evaluate(()=>scrollTo(0,400));
 assert.equal(await page.locator('header').evaluate(el=>Math.round(el.getBoundingClientRect().top)),0);
 assert.equal(await page.locator('.rail').evaluate(el=>Math.round(el.getBoundingClientRect().top)),52);
 await page.locator('[data-view-link="drift"]').click();await page.locator('#drift-next').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>scrollY),0);
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/channels-mobile.png',fullPage:true});
 const deep=await context.newPage();await deep.goto('http://127.0.0.1:8000/#decoder');assert.equal(await deep.locator('#decoder').isVisible(),true);assert.equal(await deep.locator('#drift').isVisible(),false);
 await deep.goto('http://127.0.0.1:8000/#unknown');assert.equal(await deep.locator('#drift').isVisible(),true);
 assert.deepEqual(errors,[]);console.log('PASS: one visible channel, viewport-fit desktop Drift, direct tool links, preserved draft text, browser back/forward, deep links, timer across channels, audio stops on exit, all views at 320/390/768px, sticky mobile navigation, no JS errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
