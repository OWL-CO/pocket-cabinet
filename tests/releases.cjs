const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {show}=require('./helpers.cjs');
const {solve}=require('./drop-rules.cjs');
const rules=require('../drop-engine.js');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:8000');assert.equal(await page.locator('#drop').isVisible(),true);assert.equal(await page.locator('#drift').isVisible(),false);
 assert.equal(await page.getByRole('button',{name:'Contract 2: Two minutes of daylight',exact:true}).isDisabled(),true);
 await page.locator('#drop-start').click();await page.keyboard.press('ArrowLeft');assert.match(await page.locator('#drop-status').textContent(),/Blocked/);assert.match(await page.locator('#drop-turn').textContent(),/^00/);
 await page.keyboard.press('ArrowUp');assert.match(await page.locator('#drop-status').textContent(),/Intercepted/);assert.equal(await page.locator('[data-move="right"]').isDisabled(),true);
 await page.locator('#drop-start').click();const path=solve(rules.missions[0]);
 for(const action of path.slice(0,5))await page.locator(`[data-move="${action}"]`).click();
 assert.equal(await page.locator('#drop-cargo').textContent(),'PARCEL ON BOARD');const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-air-v2')).deadDrop);
 await page.reload();assert.equal(await page.locator('#drop-cargo').textContent(),'PARCEL ON BOARD');assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-air-v2')).deadDrop),saved);
 await show(page,'notes');await page.locator('#note').fill('A voice still counts.');await show(page,'drop');assert.match(await page.locator('#drop-turn').textContent(),/^05/);
 for(const action of path.slice(5))await page.locator(`[data-move="${action}"]`).click();
 assert.equal(await page.locator('#drop-result').isVisible(),true);assert.match(await page.locator('#receipt-story').textContent(),/eleven seconds/);assert.equal(await page.locator('#drop-best').textContent(),'BEST / 10 TURNS');
 await page.locator('#receipt-next').click();assert.match(await page.locator('#drop-title').textContent(),/daylight/);
 for(const id of [1,2]){
  await page.locator('#drop-start').click();for(const action of solve(rules.missions[id]))await page.locator(`[data-move="${action}"]`).click();
  assert.equal(await page.locator('#drop-result').isVisible(),true);assert.match(await page.locator('#receipt-title').textContent(),new RegExp(rules.missions[id].name));
  if(id===1)await page.locator('#receipt-next').click();else await page.locator('#receipt-keep').click();
 }
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-air-v2')).deadDrop.records),[10,10,10]);
 await show(page,'releases');assert.equal(await page.locator('.release-card').count(),6);assert.equal(await page.locator('.release-card').first().locator('.release-status').textContent(),'3/3 DELIVERIES');
 await page.locator('.release-card').first().click();await page.locator('#drop').waitFor({state:'visible'});
 await show(page,'memory');const downloading=page.waitForEvent('download');await page.locator('#export').click();const backup=await (await downloading).path();
 await show(page,'drop');await page.getByRole('button',{name:'Contract 1: An unregistered voice',exact:true}).click();await page.locator('#drop-start').click();
 page.on('dialog',dialog=>dialog.accept());await page.locator('#import').setInputFiles(backup);await page.waitForFunction(()=>document.getElementById('drop-title').textContent==='A place to be found');assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-air-v2')).deadDrop.records),[10,10,10]);
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/dead-drop-desktop.png',fullPage:true});
 for(const width of [320,390,768]){await page.setViewportSize({width,height:844});for(const hash of ['drop','releases']){await show(page,hash);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${hash} overflow at ${width}`);}}
 await page.setViewportSize({width:390,height:844});await show(page,'drop');await page.getByRole('button',{name:'Contract 1: An unregistered voice',exact:true}).click();await page.locator('#drop-start').click();assert.equal(await page.locator('#drop-brief-panel').getAttribute('open'),null);
 const firstCell=page.locator('[data-cell="31"]');await firstCell.click();assert.match(await page.locator('#drop-turn').textContent(),/^01/);
 for(const width of [320,390]){await page.setViewportSize({width,height:740});await page.evaluate(()=>scrollTo(0,0));const controls=await page.locator('.drop-controls').boundingBox();assert.ok(controls.y+controls.height<=740,'Movement controls fit in the phone viewport');assert.ok(controls.height>=44,'Touch controls have room for a thumb');}
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1500);await page.screenshot({path:'/tmp/dead-drop-mobile.png',fullPage:true});
 const beforeInvalid=await page.evaluate(()=>localStorage.getItem('dead-air-v2'));
 for(const deadDrop of [{mission:2,run:null,records:[null,null,null]},{mission:0,run:{position:7,turn:2,packet:false,status:'active'},records:[null,null,null]}]){
  const invalid=JSON.parse(beforeInvalid);invalid.deadDrop=deadDrop;await page.locator('#import').setInputFiles({name:'invalid-courier.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});await page.waitForFunction(()=>document.getElementById('data-status').textContent.startsWith('Invalid backup'));assert.equal(await page.evaluate(()=>localStorage.getItem('dead-air-v2')),beforeInvalid);
 }
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked')}}));const offline=await blocked.newPage();await offline.goto('http://127.0.0.1:8000');await offline.locator('#drop-start').click();await offline.locator('[data-move="right"]').click();assert.equal(await offline.locator('#storage-warning').isVisible(),true);assert.match(await offline.locator('#drop-status').textContent(),/in memory only/);assert.match(await offline.locator('#drop-turn').textContent(),/^01/);await blocked.close();
 assert.deepEqual(errors,[]);console.log('PASS: authored front door, locked contracts, keyboard/invalid move/loss, all three deliveries and endings, run and best score persistence, channel switching, archive, backup restore and invalid courier rejection, touch movement, mobile brief collapse, controls fit 740px phones, 320/390/768px layouts, blocked storage, no JS errors.');await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
