'use strict';
// A finite, editable index: discovery without a remote feed or tracking service.
const routes = [
  {title:'The Deep Sea',host:'neal.fun',url:'https://neal.fun/deep-sea/',category:'visual',description:'Scroll below the surface. Meet the things that live where sunlight gives up.'},
  {title:'Radio Garden',host:'radio.garden',url:'https://radio.garden/',category:'odd',description:'Spin the globe and tune into live radio somewhere you’ve never been.'},
  {title:'WindowSwap',host:'window-swap.com',url:'https://www.window-swap.com/',category:'visual',description:'Borrow a view from somebody else’s window. Ordinary places, unexpected distances.'},
  {title:'The Pudding',host:'pudding.cool',url:'https://pudding.cool/',category:'visual',description:'Visual essays about culture, built out of data you can actually explore.'},
  {title:'We Become What We Behold',host:'ncase.itch.io',url:'https://ncase.itch.io/wbwwb',category:'odd',description:'A small, unsettling game about attention and the news cycle. Content includes violence.'},
  {title:'MapCrunch',host:'mapcrunch.com',url:'https://www.mapcrunch.com/',category:'odd',description:'Drop into a random street view. Walk around without needing a destination.'},
  {title:'Photopea',host:'photopea.com',url:'https://www.photopea.com/',category:'tool',description:'A serious image editor that runs in a browser. Useful when a screenshot needs surgery.'},
  {title:'Excalidraw',host:'excalidraw.com',url:'https://excalidraw.com/',category:'tool',description:'Sketch a diagram before the idea evaporates. Simple drawing tools, no ceremony.'},
  {title:'World Time Buddy',host:'worldtimebuddy.com',url:'https://www.worldtimebuddy.com/',category:'tool',description:'Line up time zones and find a meeting time that doesn’t ruin somebody’s night.'},
  {title:'A Soft Murmur',host:'asoftmurmur.com',url:'https://asoftmurmur.com/',category:'tool',description:'Mix rain, wind, thunder, and background noise into something you can work to.'},
  {title:'The Evolution of Trust',host:'ncase.me',url:'https://ncase.me/trust/',category:'odd',description:'An interactive explanation of trust, cheating, and why the rules matter.'},
  {title:'Earth Nullschool',host:'earth.nullschool.net',url:'https://earth.nullschool.net/',category:'visual',description:'Watch wind curl around the planet. A global weather visualization worth getting lost in.'}
];
const categoryNames={odd:'STRANGE CORNER',visual:'VISUAL RABBIT HOLE',tool:'USEFUL DETOUR'};
const routePositions=[[140,88],[305,65],[485,75],[720,90],[805,194],[740,329],[590,366],[390,370],[212,322],[88,235],[280,195],[615,200]];
routes.forEach((route,id)=>{
 const button=document.createElement('button'),[x,y]=routePositions[id];
 button.className='map-node';button.dataset.routeNode=id;button.textContent=String(id+1).padStart(2,'0');
 button.setAttribute('aria-label',`Select route ${id+1}: ${route.title}`);button.setAttribute('aria-pressed','false');button.title=route.title;
 button.style.setProperty('--node-x',`${x/9}%`);button.style.setProperty('--node-y',`${y/4.3}%`);
 button.addEventListener('click',()=>{state.hub.current=id;$('route-filter').value='all';save();renderRoute();});
 document.querySelector('.map-controls').append(button);
});

function renderRoute(){
 const route=routes[state.hub.current];
 const [nodeX,nodeY]=routePositions[state.hub.current];
 const elbow=nodeX>450?nodeX-30:nodeX+30;
 $('selected-route-path').setAttribute('d',`M450 220H${elbow}V${nodeY}H${nodeX}`);
 $('selected-route-ring').setAttribute('cx',nodeX);$('selected-route-ring').setAttribute('cy',nodeY);
 document.querySelectorAll('[data-route-node]').forEach(button=>{const id=Number(button.dataset.routeNode);button.setAttribute('aria-pressed',String(id===state.hub.current));button.classList.toggle('visited',state.hub.seen.includes(id));});
 $('map-node-id').textContent=String(state.hub.current+1).padStart(3,'0');
 $('map-pinned').textContent=String(state.hub.bookmarks.length).padStart(2,'0');
 $('map-opened').textContent=String(state.hub.seen.length).padStart(2,'0');

 $('route-title').textContent=route.title;$('route-description').textContent=route.description;
 $('route-host').textContent=route.host;$('route-category').textContent=categoryNames[route.category];
 $('route-id').textContent='COORDINATE '+String(state.hub.current+1).padStart(3,'0');
 $('route-visited').textContent=state.hub.seen.includes(state.hub.current)?'OPENED BEFORE':'UNEXPLORED';
 $('route-counter').textContent=`${state.hub.seen.length}/${routes.length} OPENED`;
 $('open-route').href=route.url;
 const kept=state.hub.bookmarks.includes(state.hub.current);
 $('bookmark').textContent=kept?'− KEPT':'+ KEEP';$('bookmark').setAttribute('aria-pressed',String(kept));
 $('bookmarks').replaceChildren();
 if(!state.hub.bookmarks.length){const label=document.createElement('p');label.className='micro';label.textContent='Nothing pinned yet. Keep a route worth returning to.';$('bookmarks').append(label);}
 state.hub.bookmarks.forEach(id=>{const button=document.createElement('button');button.textContent=routes[id].title+' ↗';button.addEventListener('click',()=>{state.hub.current=id;save();renderRoute();});$('bookmarks').append(button);});
}
function drift(){
 const category=$('route-filter').value;
 const candidates=routes.map((route,id)=>({route,id})).filter(({route,id})=>id!==state.hub.current&&(category==='all'||route.category===category));
 const unopened=candidates.filter(({id})=>!state.hub.seen.includes(id));const pool=unopened.length?unopened:candidates;
 if(!pool.length)return;state.hub.current=pool[random(pool.length)].id;save();renderRoute();
}
$('drift-next').addEventListener('click',drift);$('route-filter').addEventListener('change',drift);
$('open-route').addEventListener('click',()=>{if(!state.hub.seen.includes(state.hub.current))state.hub.seen.push(state.hub.current);save();renderRoute();});
$('bookmark').addEventListener('click',()=>{const id=state.hub.current;state.hub.bookmarks=state.hub.bookmarks.includes(id)?state.hub.bookmarks.filter(value=>value!==id):[...state.hub.bookmarks,id];save();renderRoute();});
function renderCase(){const solved=state.hub.solved;$('secret').hidden=!solved;$('unlock-form').hidden=solved;document.querySelector('.casefile .case-status').textContent=solved?'RESOLVED / NODE 01':'UNRESOLVED / SENDER UNKNOWN';$('case-message').textContent=solved?'Access word accepted. Case progress saved.':'Investigate at your own pace.';}
$('inspect').addEventListener('click',()=>{$('packet').hidden=!$('packet').hidden;$('inspect').textContent=$('packet').hidden?'EXAMINE PACKET [+]':'CLOSE PACKET [−]';});
$('unlock-form').addEventListener('submit',event=>{event.preventDefault();if($('access-word').value.trim().toUpperCase()==='LIMBO'){state.hub.solved=true;const saved=save();renderCase();if(!saved)$('case-message').textContent='Case resolved in memory. Export a backup to keep progress.';}else{$('case-message').textContent='No match. Inspect the packet and decode the five bytes.';}});
let decoded='';
$('decode').addEventListener('click',()=>{
 try {
  const input=$('codec-input').value;
  if($('codec-mode').value==='decode'){
   const hex=input.replace(/\s/g,'');
   if(!/^[0-9a-f]*$/i.test(hex)||hex.length%2)throw Error('Use pairs of hexadecimal digits (00–ff), with optional spaces.');
   const bytes=Uint8Array.from(hex.match(/.{2}/g)||[],pair=>parseInt(pair,16));
   decoded=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  }else decoded=Array.from(new TextEncoder().encode(input),byte=>byte.toString(16).padStart(2,'0')).join(' ');
  $('codec-output').textContent=decoded||'[empty output]';$('copy-status').textContent='';
 }catch(error){decoded='';$('codec-output').textContent='Cannot convert: '+error.message;}
});
$('copy-decoded').addEventListener('click',async()=>{if(!decoded){$('copy-status').textContent='Convert something first.';return;}try{await navigator.clipboard.writeText(decoded);$('copy-status').textContent='Copied.';}catch{$('copy-status').textContent='Clipboard unavailable. Select and copy the output directly.';}});
function renderTasks(){
 $('tasks').replaceChildren();$('task-count').textContent=`${state.hub.tasks.filter(task=>!task.done).length} OPEN`;
 state.hub.tasks.forEach((task,index)=>{
  const item=document.createElement('li'),label=document.createElement('label'),checkbox=document.createElement('input'),text=document.createElement('span'),remove=document.createElement('button');
  checkbox.type='checkbox';checkbox.checked=task.done;text.textContent=task.text;label.append(checkbox,text);item.classList.toggle('done',task.done);
  checkbox.addEventListener('change',()=>{state.hub.tasks[index].done=checkbox.checked;save();renderTasks();});
  remove.textContent='×';remove.setAttribute('aria-label','Delete task: '+task.text);remove.addEventListener('click',()=>{state.hub.tasks.splice(index,1);save();renderTasks();});
  item.append(label,remove);$('tasks').append(item);
 });
}
$('task-form').addEventListener('submit',event=>{event.preventDefault();const text=$('task-input').value.trim();if(!text)return;if(state.hub.tasks.length>=100){toast('Task list full. Remove a finished task first.');return;}state.hub.tasks.push({text,done:false});$('task-input').value='';save();renderTasks();});
function remaining(){return state.hub.timerEnd===null?state.hub.timerRemaining:Math.max(0,Math.ceil((state.hub.timerEnd-Date.now())/1000));}
function renderTimer(){
 const seconds=remaining();
 if(state.hub.timerEnd!==null&&seconds===0){state.hub.timerEnd=null;state.hub.timerRemaining=0;save();}
 $('timer-clock').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 const running=state.hub.timerEnd!==null;$('timer-toggle').textContent=running?'PAUSE':seconds===0?'START AGAIN':'START';
 const status=running?'Running. You can leave this tab.':seconds===0?'Session complete. Take a breath.':seconds<state.hub.timerDuration?'Paused.':'Ready when you are.';
 if($('timer-status').textContent!==status)$('timer-status').textContent=status;
 document.querySelectorAll('[data-minutes]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.minutes)*60===state.hub.timerDuration)));
}
$('timer-toggle').addEventListener('click',()=>{if(state.hub.timerEnd!==null){state.hub.timerRemaining=remaining();state.hub.timerEnd=null;}else{if(!state.hub.timerRemaining)state.hub.timerRemaining=state.hub.timerDuration;state.hub.timerEnd=Date.now()+state.hub.timerRemaining*1000;}save();renderTimer();});
$('timer-reset').addEventListener('click',()=>{state.hub.timerEnd=null;state.hub.timerRemaining=state.hub.timerDuration;save();renderTimer();});
document.querySelectorAll('[data-minutes]').forEach(button=>button.addEventListener('click',()=>{state.hub.timerDuration=Number(button.dataset.minutes)*60;state.hub.timerRemaining=state.hub.timerDuration;state.hub.timerEnd=null;save();renderTimer();}));
function renderHub(){renderRoute();renderCase();renderTasks();renderTimer();}
document.addEventListener('relay-restored',renderHub);setInterval(renderTimer,1000);renderHub();
document.querySelector('.rail a[href="#experiments"]').addEventListener('click',()=>{$('experiments').open=true;});
$('experiments').addEventListener('toggle',()=>{if($('experiments').open)drawScope(0);});
