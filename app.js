'use strict';
const $ = id => document.getElementById(id);
const KEY = 'dead-air-v2';
const random = max => Math.floor(Math.random()*max);
const defaultPattern = () => [[1,0,0,0,1,0,0,0],[0,0,1,0,0,0,1,0],[1,0,1,0,1,0,1,1]].map(row=>row.map(Boolean));
const freshHub = () => ({current:0,bookmarks:[],seen:[],solved:false,tasks:[],timerEnd:null,timerRemaining:1500,timerDuration:1500});
function validateHub(hub) {
 if (hub===undefined) return freshHub();
 const validIds = list => Array.isArray(list)&&list.length<=12&&list.every(id=>Number.isInteger(id)&&id>=0&&id<12);
 if(!hub||!Number.isInteger(hub.current)||hub.current<0||hub.current>=12||!validIds(hub.bookmarks)||!validIds(hub.seen)||typeof hub.solved!=='boolean'||!Array.isArray(hub.tasks)||hub.tasks.length>100||!hub.tasks.every(task=>task&&typeof task.text==='string'&&task.text.length<=140&&typeof task.done==='boolean')||![300,1500].includes(hub.timerDuration)||!Number.isInteger(hub.timerRemaining)||hub.timerRemaining<0||hub.timerRemaining>1500||!(hub.timerEnd===null||(Number.isFinite(hub.timerEnd)&&hub.timerEnd>=0))) throw Error('Invalid relay records');
 return {current:hub.current,bookmarks:[...new Set(hub.bookmarks)],seen:[...new Set(hub.seen)],solved:hub.solved,tasks:hub.tasks.map(task=>({text:task.text,done:task.done})),timerEnd:hub.timerEnd,timerRemaining:hub.timerRemaining,timerDuration:hub.timerDuration};
}
const fresh = () => ({version:2,note:'',pattern:defaultPattern(),tempo:112,finds:[],legacy:null,artSeed:random(1000000),hub:freshHub()});
function validate(data) {
  if (!data || data.version!==2 || typeof data.note!=='string' || data.note.length>20000 || !Array.isArray(data.pattern) || data.pattern.length!==3 || !data.pattern.every(row=>Array.isArray(row)&&row.length===8&&row.every(cell=>typeof cell==='boolean')) || !Number.isInteger(data.tempo)||data.tempo<60||data.tempo>180 || !Array.isArray(data.finds) || data.finds.length>100 || !data.finds.every(find=>find&&Number.isInteger(find.id)&&find.id>=0&&find.id<stations.length&&typeof find.time==='string'&&find.time.length<=50&&Number.isFinite(Date.parse(find.time))&&typeof find.frequency==='number'&&find.frequency>=88&&find.frequency<=108)) throw Error('Invalid backup');
  if (data.artSeed!==undefined && (!Number.isInteger(data.artSeed)||data.artSeed<0||data.artSeed>999999)) throw Error('Invalid print seed');
  if (data.legacy!==null && data.legacy!==undefined) validateLegacy(data.legacy);
  return {version:2,note:data.note,pattern:data.pattern.map(row=>[...row]),tempo:data.tempo,finds:data.finds.map(find=>({id:find.id,time:find.time,frequency:find.frequency})),legacy:data.legacy||null,artSeed:data.artSeed??random(1000000),hub:validateHub(data.hub)};
}
function validateLegacy(data) {
  const date=/^\d{4}-\d{2}-\d{2}$/;
  if (!data || data.version!==1 || typeof data.note!=='string'||data.note.length>20000||!data.moods||typeof data.moods!=='object'||Array.isArray(data.moods)||!Object.entries(data.moods).every(([key,val])=>date.test(key)&&['sunny','cloudy','rainy','electric'].includes(val))||!Array.isArray(data.adventures)||!Array.isArray(data.waterings)||![...data.adventures,...data.waterings].every(val=>typeof val==='string'&&date.test(val))) throw Error('Invalid legacy backup');
  return {version:1,note:data.note,moods:{...data.moods},adventures:[...data.adventures],waterings:[...data.waterings]};
}
const stations=[
 ['THE LAST VENDING MACHINE','It sells weather from cities that no longer exist. You buy a can of rain. It is warm.'],
 ['BONE ORCHESTRA','Every skeleton on the midnight train is tapping the same rhythm. None of them know who started it.'],
 ['PIRATE CUSTOMER SERVICE','Thank you for holding. Your rebellion is important to us. You are caller number infinity.'],
 ['GHOST IN THE LAUNDROMAT','A dryer keeps returning a coat nobody owns. Something in the pocket is breathing.'],
 ['MOON ADVERTISEMENT','THIS SPACE FOR RENT. Excellent visibility. Terrible foot traffic. Contact the tides.'],
 ['THE ELEVATOR CULT','Floor 13 doesn’t exist. Floor 14 won’t discuss it. The elevator has started wearing a tie.'],
 ['FERAL WIFI','A router escaped the apartment. It lives under the bridge now, broadcasting passwords to pigeons.'],
 ['ORACLE OF PARKING LOT B','The shopping cart predicts the future. So far: rain, a minor betrayal, and an excellent sandwich.'],
 ['RADIO FOR THE UNBORN','A lullaby played backward. Somehow you remember every word.'],
 ['THE MEATSPACE PATCH','Reality update failed. Trees may clip through buildings. Do not uninstall gravity.'],
 ['OFFICE OF LOST TOMORROWS','Your missing Thursday has been found. It is in good condition, except for a small coffee stain.'],
 ['THE UNDERGROUND SUN','Below the subway, someone is growing a star in a bucket. It needs feeding.']
];
let state=fresh(), storageOK=true;
try {const existing=localStorage.getItem(KEY);if(existing) state=validate(JSON.parse(existing));else {const old=localStorage.getItem('pocket-cabinet-v1');if(old){state.legacy=validateLegacy(JSON.parse(old));state.note=state.legacy.note;}}} catch {storageOK=false;$('data-status').textContent='Saved data could not be read. Existing records are untouched. Export this session before leaving.';}
function save(){if(!storageOK)return false;try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{storageOK=false;$('data-status').textContent='Storage unavailable. Export this session before closing the tab.';return false;}}
let toastTimer;function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4000);}
$('date').textContent=new Date().toLocaleDateString(undefined,{month:'short',day:'2-digit',year:'numeric'}).toUpperCase();
$('note').value=state.note;$('note').addEventListener('input',()=>{state.note=$('note').value;$('save-status').textContent=save()?'WRITTEN TO LOCAL MEMORY':'NOT SAVED — EXPORT BEFORE LEAVING';});
function renderArchive(){
 $('captures').textContent=String(state.finds.length).padStart(2,'0');$('archive-count').textContent=`${state.finds.length} FINDS`;
 $('legacy-status').textContent=state.legacy?`${Object.keys(state.legacy.moods).length} mood entries, ${state.legacy.waterings.length} waterings, and ${state.legacy.adventures.length} adventures recovered.`:'No records from the old station found on this browser.';
 if(!state.finds.length){$('artifacts').innerHTML='<p class="empty">[ NOTHING RECOVERED ]<br><span>Go fishing in the static above.</span></p>';return;}
 $('artifacts').replaceChildren();state.finds.slice().reverse().forEach(find=>{const article=document.createElement('article');article.className='artifact';const meta=document.createElement('div');meta.className='artifact-meta';meta.textContent=`${find.frequency.toFixed(1)} MHz / ${new Date(find.time).toLocaleDateString()}`;const title=document.createElement('h4');title.textContent=stations[find.id][0];const text=document.createElement('p');text.textContent=stations[find.id][1];article.append(meta,title,text);$('artifacts').append(article);});
}
let targets=[], claimed=new Set(), sector=0, lastStrength=0;
function scramble(){targets=[];claimed=new Set();const available=stations.map((_,id)=>id).filter(id=>!state.finds.some(find=>find.id===id));const pool=available.length?available:stations.map((_,id)=>id);for(let i=0;i<3;i++){const freq=89+i*6+random(40)/10;targets.push({frequency:freq,id:pool.splice(random(pool.length),1)[0]});if(!pool.length)pool.push(...stations.map((_,id)=>id).filter(id=>!targets.some(target=>target.id===id)));}sector++;$('coordinates').textContent=`SECTOR ${String(sector).padStart(2,'0')}`;updateSignal();}
function nearest(){const frequency=Number($('dial').value);return targets.filter((_,index)=>!claimed.has(index)).map(target=>({...target,distance:Math.abs(target.frequency-frequency)})).sort((a,b)=>a.distance-b.distance)[0];}
function updateSignal(){const target=nearest();lastStrength=target?Math.max(0,Math.round(100-target.distance*35)):0;$('frequency').textContent=Number($('dial').value).toFixed(1);$('strength').textContent=`${lastStrength}% LOCK`;$('capture').disabled=lastStrength<90;$('signal-status').textContent=!target?'Band cleared. Scramble for another sector.':lastStrength>=90?'TRANSMISSION LOCKED. Intercept now.':lastStrength>50?'Something is talking. You’re getting close.':'Sweep slowly. Something is hiding.';if(reduceMotion)drawScope(0);}
$('dial').addEventListener('input',updateSignal);
function nudge(amount){$('dial').value=(Number($('dial').value)+amount).toFixed(1);updateSignal();}
$('down').addEventListener('click',()=>nudge(-.1));$('up').addEventListener('click',()=>nudge(.1));$('new-band').addEventListener('click',()=>{scramble();toast('New sector. Same questionable antenna.');});
$('capture').addEventListener('click',()=>{const target=nearest();if(!target||lastStrength<90)return;claimed.add(targets.findIndex(t=>t.frequency===target.frequency));state.finds.push({id:target.id,frequency:target.frequency,time:new Date().toISOString()});state.finds=state.finds.slice(-100);save();renderArchive();updateSignal();toast(`RECOVERED: ${stations[target.id][0]}`);if(soundEnabled)tone(540,.15,.08);});
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ctx=$('scope').getContext('2d');let frame;
function drawScope(time){if(!ctx)return;const w=850,h=310;ctx.fillStyle='#0b0f09';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#27331e';ctx.lineWidth=1;for(let x=0;x<w;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=0;y<h;y+=31){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}const intensity=lastStrength/100;ctx.strokeStyle=intensity>.89?'#ff713b':'#d5fc4b';ctx.lineWidth=2;ctx.beginPath();for(let x=0;x<w;x++){const noise=Math.sin(x*2.13+time*.008)*Math.cos(x*.76)*9*(1-intensity);const wave=Math.sin(x*.047+time*.002)*(15+intensity*85)*Math.sin(x*.006);const y=h/2+noise+wave;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.setLineDash([5,7]);ctx.strokeStyle='#768b4d';ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();ctx.setLineDash([]);}
function animate(time){if(!$('view-lab').hidden&&!$('receiver').hidden)drawScope(time);if(!reduceMotion&&!document.hidden)frame=requestAnimationFrame(animate);}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);stopEngine();}else if(!reduceMotion)frame=requestAnimationFrame(animate);});
let audio=null,soundEnabled=false,playing=false,step=0,timer=null;
async function enableAudio(){try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();await audio.resume();soundEnabled=true;$('sound').textContent='SOUND ON ↗';$('sound').setAttribute('aria-pressed','true');return true;}catch{$('audio-status').textContent='Audio unavailable in this browser. You can still edit patterns.';return false;}}
function tone(frequency,duration,volume,type='sine'){if(!audio||!soundEnabled)return;const osc=audio.createOscillator(),gain=audio.createGain();const now=audio.currentTime;osc.type=type;osc.frequency.setValueAtTime(frequency,now);gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain);gain.connect(audio.destination);osc.start(now);osc.stop(now+duration);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
function hit(track){if(!audio||!soundEnabled)return;if(track===0){const osc=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;osc.frequency.setValueAtTime(140,now);osc.frequency.exponentialRampToValueAtTime(40,now+.15);gain.gain.setValueAtTime(.45,now);gain.gain.exponentialRampToValueAtTime(.001,now+.2);osc.connect(gain);gain.connect(audio.destination);osc.start(now);osc.stop(now+.21);osc.onended=()=>{osc.disconnect();gain.disconnect();};}else{const duration=track===1?.14:.045,buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate);const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain(),now=audio.currentTime;source.buffer=buffer;filter.type='highpass';filter.frequency.value=track===1?900:6500;gain.gain.setValueAtTime(track===1?.16:.09,now);gain.gain.exponentialRampToValueAtTime(.001,now+duration);source.connect(filter);filter.connect(gain);gain.connect(audio.destination);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}}
function renderPattern(){$('sequencer').replaceChildren();['KICK','SNARE','HAT'].forEach((name,track)=>{const label=document.createElement('span');label.className='track-label';label.textContent=name;$('sequencer').append(label);for(let index=0;index<8;index++){const button=document.createElement('button');button.className='step';button.dataset.step=index;button.setAttribute('aria-label',`${name} step ${index+1}`);button.setAttribute('aria-pressed',String(state.pattern[track][index]));button.addEventListener('click',()=>{state.pattern[track][index]=!state.pattern[track][index];button.setAttribute('aria-pressed',String(state.pattern[track][index]));save();if(state.pattern[track][index])hit(track);});$('sequencer').append(button);}});$('tempo').value=state.tempo;$('bpm').textContent=state.tempo;}
function tick(){if(!playing)return;document.querySelectorAll('.step').forEach(button=>button.classList.toggle('current',Number(button.dataset.step)===step));state.pattern.forEach((row,track)=>{if(row[step])hit(track);});step=(step+1)%8;timer=setTimeout(tick,60000/state.tempo/2);}
function stopEngine(){$('audio-status').textContent='ENGINE STOPPED. PATTERN SAVED LOCALLY.';playing=false;clearTimeout(timer);$('play').textContent='▶ START ENGINE';$('play').setAttribute('aria-pressed','false');document.querySelectorAll('.step').forEach(button=>button.classList.remove('current'));}
let starting=false;
$('play').addEventListener('click',async()=>{if(playing){stopEngine();return;}if(starting)return;starting=true;try{if(!await enableAudio())return;playing=true;step=0;$('play').textContent='■ STOP ENGINE';$('play').setAttribute('aria-pressed','true');$('audio-status').textContent='ENGINE RUNNING. PATTERN SAVED LOCALLY.';tick();}finally{starting=false;}});
$('sound').addEventListener('click',async()=>{if(soundEnabled){soundEnabled=false;stopEngine();if(audio)await audio.suspend();$('sound').textContent='SOUND OFF ↗';$('sound').setAttribute('aria-pressed','false');}else await enableAudio();});
$('tempo').addEventListener('input',()=>{state.tempo=Number($('tempo').value);$('bpm').textContent=state.tempo;save();});
$('mutate').addEventListener('click',()=>{state.pattern=state.pattern.map((row,track)=>row.map(()=>Math.random()<[.35,.25,.65][track]));save();renderPattern();});
$('clear-pattern').addEventListener('click',()=>{state.pattern=Array.from({length:3},()=>Array(8).fill(false));save();renderPattern();});
$('export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=`dead-air-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('import-button').addEventListener('click',()=>$('import').click());
$('import').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Too large');const data=JSON.parse(await file.text());let incoming;if(data.version===1){const legacy=validateLegacy(data);incoming=fresh();incoming.legacy=legacy;incoming.note=legacy.note;}else incoming=validate(data);if(!confirm('Replace this browser’s current saves with this backup? Export first if you want to keep both.'))return;stopEngine();state=incoming;storageOK=true;const saved=save();$('note').value=state.note;renderPattern();renderArchive();renderPrint();scramble();document.dispatchEvent(new Event('relay-restored'));$('save-status').textContent=saved?'BACKUP RESTORED':'NOT SAVED — EXPORT BEFORE LEAVING';$('data-status').textContent=saved?'Backup restored to local storage.':'Restored in memory only. Export before leaving.';toast('Records recovered.');}catch{$('data-status').textContent='Invalid backup. Current records were not changed.';}finally{event.target.value='';}});
renderArchive();renderPattern();scramble();if(!reduceMotion)frame=requestAnimationFrame(animate);

function renderPrint(){
 const canvas=$('print'),c=canvas.getContext('2d');if(!c)return;
 let seed=state.artSeed+1;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const palettes=[['#f1dfc4','#f2522e','#30285b','#b4d568'],['#d6e8e6','#304ed0','#fe9d3c','#fa6d9e'],['#27272d','#d7f94a','#ad88e1','#f5e7ca'],['#f0bfd2','#c52732','#275848','#ffce5b']];
 const palette=palettes[Math.floor(next()*palettes.length)];
 c.fillStyle=palette[0];c.fillRect(0,0,1200,800);
 c.save();c.translate(600,400);c.rotate((next()-.5)*.8);
 c.fillStyle=palette[1];c.fillRect(-750,-120,1500,240);
 c.fillStyle=palette[2];const x=next()*500-250,y=next()*200-100;
 c.beginPath();c.arc(x,y,170+next()*100,0,Math.PI*2);c.fill();
 c.strokeStyle=palette[3];c.lineWidth=12;
 for(let i=0;i<22;i++){c.beginPath();const baseline=-420+i*42;c.moveTo(-800,baseline);c.bezierCurveTo(-220,baseline+Math.sin(i*.22)*340,120,baseline-250,800,baseline+150);c.stroke();}
 c.restore();c.fillStyle=palette[2];for(let i=0;i<7;i++){const a=next()*1100+50,b=next()*700+50;c.fillRect(a,b,8,8);}
 c.strokeStyle=palette[2];c.lineWidth=2;c.strokeRect(30,30,1140,740);
 c.fillStyle=palette[2];c.fillRect(45,712,280,40);c.fillStyle=palette[0];c.font='18px monospace';c.fillText('SIGNAL / '+String(state.artSeed).padStart(6,'0'),60,738);
 $('print-label').textContent='COMPOSITION '+String(state.artSeed).padStart(6,'0')+' / 1200 × 800';
}
$('new-print').addEventListener('click',()=>{state.artSeed=random(1000000);renderPrint();$('print-status').textContent=save()?'Composition saved. It’ll be here next time.':'Browser storage unavailable. Download this image to keep it.';});
$('download-print').addEventListener('click',()=>{$('print').toBlob(blob=>{if(!blob){toast('Image could not be exported.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='signal-print-'+state.artSeed+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');});
renderPrint();
if(!save()) $('print-status').textContent='Browser storage unavailable. Download images and export notes to keep them.';
