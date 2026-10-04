'use strict';
const KEY = 'pocket-cabinet-v1';
const $ = id => document.getElementById(id);
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const fresh = () => ({version:1,note:'',moods:{},adventures:[],waterings:[]});
const icons = {sunny:'☀',cloudy:'☁',rainy:'☂',electric:'ϟ'};
function validate(value) {
  const date = /^\d{4}-\d{2}-\d{2}$/;
  if (!value || value.version !== 1 || typeof value.note !== 'string' || value.note.length > 20000 || !value.moods || typeof value.moods !== 'object' || Array.isArray(value.moods) || !Array.isArray(value.adventures) || !Array.isArray(value.waterings)) throw new Error('Invalid backup');
  if (!Object.entries(value.moods).every(([key,mood]) => date.test(key) && Object.hasOwn(icons,mood)) || ![...value.adventures,...value.waterings].every(day => typeof day === 'string' && date.test(day))) throw new Error('Invalid backup');
  return {version:1,note:value.note,moods:{...value.moods},adventures:[...new Set(value.adventures)],waterings:[...new Set(value.waterings)]};
}
let state = fresh(), storageAvailable = true;
try { const stored = localStorage.getItem(KEY); if (stored) state = validate(JSON.parse(stored)); } catch { storageAvailable = false; $('data-status').textContent = 'Saved data could not be loaded. Export any new keepsakes before leaving; existing data has not been overwritten.'; }
function save() {
  if (!storageAvailable) return false;
  try { localStorage.setItem(KEY,JSON.stringify(state)); return true; } catch { storageAvailable=false; $('data-status').textContent='Browser storage is unavailable. Export your keepsakes to keep them.'; return false; }
}
let toastTimer;
function toast(message) { $('toast').textContent=message; $('toast').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').hidden=true,3000); }
const challenges = ['Find something the exact color of the sky. Give it a very official name.','Take a two-minute expedition somewhere you normally walk past. Notice three things.','Put on a song you loved years ago. Listen like it’s the first time.','Draw a tiny creature using only five lines. It deserves a name.','Send someone a specific, unexpected compliment. Small kindness, big ripple.','Make your next drink a ceremony. No scrolling for the first three sips.','Photograph a shadow. Imagine the creature that cast it.','Write a six-word story about your day. Dramatic exaggeration encouraged.','Find the oldest thing within arm’s reach. Wonder about its journey.','Spend a minute listening. Count how many different sounds you can hear.','Rearrange three small things on your desk. Call it an exhibition.','Look for a tiny sign of the season outside. Collect it in your memory.','Invent a new word for how you feel right now. Use it in a sentence.','Read a page of a book you’ve been meaning to open. Just one is enough.','Do one small favor for tomorrow-you. Then take a bow.'];
const riddles = [['What gets wetter the more it dries?','A towel.'],['What has cities, but no houses; forests, but no trees; and water, but no fish?','A map.'],['What can you break without touching it?','A promise.'],['What has many keys but opens no locks?','A piano.'],['What has a neck but no head?','A bottle.'],['What travels around the world while staying in a corner?','A postage stamp.'],['What belongs to you, but other people use it more?','Your name.'],['What goes up but never comes down?','Your age.'],['What has hands but cannot clap?','A clock.'],['What can fill a room without taking up space?','Light.'],['What has one eye but cannot see?','A needle.'],['What has words but never speaks?','A book.'],['What has a head and a tail, but no body?','A coin.']];
function dayNumber(day) { return Math.floor(Date.parse(day+'T00:00:00Z')/86400000); }
let today;
function render() {
  const next = localDate(); if (today !== next) $('answer').hidden=true; today=next;
  $('date').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}).toUpperCase();
  $('challenge').textContent=challenges[dayNumber(today)%challenges.length];
  const riddle=riddles[dayNumber(today)%riddles.length]; $('riddle').textContent=riddle[0]; $('answer').textContent=riddle[1];
  const completed=state.adventures.includes(today); $('complete').disabled=completed; $('complete').textContent=completed?'Today’s detour: accomplished ✓':'I did the little thing ✓';
  $('adventure-count').textContent=`${state.adventures.length} little adventure${state.adventures.length===1?'':'s'} collected.`;
  const watered=state.waterings.includes(today), growth=state.waterings.length;
  $('plant').textContent=growth<3?'🌱':growth<7?'🌿':growth<14?'🌷':'🌻';
  $('garden-status').textContent=`${growth} day${growth===1?'':'s'} of care · ${growth<3?'a fresh beginning':growth<7?'putting down roots':growth<14?'coming into bloom':'a happy little sunflower'}`;
  $('water').disabled=watered; $('water').textContent=watered?'All watered for today ✓':'Give it a sip ♡';
  document.querySelectorAll('[data-mood]').forEach(button=>button.setAttribute('aria-pressed',String(state.moods[today]===button.dataset.mood)));
  $('mood-status').textContent=state.moods[today]?`Today feels ${state.moods[today]}. You can change it anytime.`:'Pick the weather that feels like you.';
  $('mood-history').replaceChildren();
  Object.keys(state.moods).sort().slice(-7).forEach(day=>{const item=document.createElement('span'); item.textContent=icons[state.moods[day]]; item.title=`${day}: ${state.moods[day]}`; const caption=document.createElement('small');caption.textContent=day.slice(5);item.append(caption);$('mood-history').append(item);});
}
$('note').value=state.note;
$('note').addEventListener('input',()=>{state.note=$('note').value;$('save-status').textContent=save()?'Tucked away. Saved on this browser.':'Not saved in browser — export a backup before leaving.';});
$('complete').addEventListener('click',()=>{render();if (!state.adventures.includes(today)) {state.adventures.push(today);save();render();toast('A little adventure, collected. ✦');}});
$('water').addEventListener('click',()=>{render();if (!state.waterings.includes(today)) {state.waterings.push(today);save();render();toast('Your windowsill says thank you. ♡');}});
document.querySelectorAll('[data-mood]').forEach(button=>button.addEventListener('click',()=>{today=localDate();state.moods[today]=button.dataset.mood;save();render();}));
$('reveal').addEventListener('click',()=>{$('answer').hidden=!$('answer').hidden;});
const adjectives=['Honorary','Supreme','Secret','Accidental','Distinguished','Wandering','Extraordinary','Sleepy'];
const roles=['Curator','Guardian','Inspector','Wizard','Ambassador','Collector','Captain','Connoisseur'];
const things=['Excellent Snacks','Lost Socks','Unfinished Thoughts','Tiny Miracles','Suspicious Clouds','Cozy Corners','Unnecessary Side Quests','Very Good Pebbles'];
const pick = list => list[Math.floor(Math.random()*list.length)];
$('shuffle').addEventListener('click',()=>{$('title-result').textContent=`${pick(adjectives)} ${pick(roles)} of ${pick(things)}`;});
$('export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=`pocket-cabinet-${localDate()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('import').addEventListener('change',async event=>{const file=event.target.files[0];if (!file) return;try {if (file.size>2000000) throw new Error('Too large');const incoming=validate(JSON.parse(await file.text()));if (!confirm('Restore this backup? It will replace your current notes, garden, and mood history. Export your current keepsakes first if you want to keep them.')) return;state=incoming;storageAvailable=true;const saved=save();$('note').value=state.note;render();$('save-status').textContent=saved?'Backup restored and saved.':'Restored in memory only. Export before leaving.';toast(saved?'Your keepsakes are home.':'Restored, but browser storage is unavailable.');} catch {$('data-status').textContent='That file is not a valid Pocket Cabinet backup. Your current keepsakes are unchanged.';} finally {event.target.value='';}});
render();setInterval(render,60000);document.addEventListener('visibilitychange',()=>{if (!document.hidden) render();});
