'use strict';
const {missions:dropMissions,size:dropSize}=DeadDrop;
const dropEvents={blocked:'Blocked. Try another block; no turn spent.',pickup:'Parcel recovered. Reach the antenna.',wait:'You hold position. The sweep passes.',moved:'You move through the gap.',caught:'Intercepted. The sweep found you. Restart and watch the forecast.',timeout:'The delivery window closed. Restart and take a shorter route.',delivered:'Delivered. Someone remembers.'};
let courierMessage=state.deadDrop.run?.status==='active'?'Contract resumed. Your parcel and position are saved.':state.deadDrop.run?.status==='won'?'Receipt recovered. Read the ending, or take another contract.':state.deadDrop.run?.status==='lost'?'Your previous run ended. Try again; watch the forecast.':'Read the next sweep. Stay out of its lane.';
function arrangeCourier(){
 const mobile=innerWidth<=760,desk=document.querySelector('.courier-desk'),map=document.querySelector('.courier-map'),controls=$('drop-control-panel'),rules=document.querySelector('.drop-rules');
 const target=mobile?map:desk;
 if(controls.parentElement!==target){if(mobile)target.append(controls);else target.insertBefore(controls,$('drop-ending'));}
 if(rules.parentElement!==target)target.append(rules);
}
function renderDrop(){
 const data=state.deadDrop,mission=dropMissions[data.mission],run=data.run;
 const position=run?run.position:mission.start,turn=run?run.turn:0,scan=mission.scans[turn%mission.scans.length],active=run?.status==='active';
 $('drop-title').textContent=mission.name;$('drop-brief').textContent=mission.brief;$('drop-sender').textContent='FROM '+mission.sender;
 $('drop-objective').textContent=mission.cargo;
 $('drop-contract-id').textContent='CONTRACT '+String(data.mission+1).padStart(2,'0');
 $('drop-turn').textContent=String(turn).padStart(2,'0')+' / '+mission.limit;
 $('drop-scan').textContent=scan[0].toUpperCase()+' '+(scan[1]+1);
 $('drop-cargo').textContent=run?.packet?'PARCEL ON BOARD':'EMPTY HANDS';
 $('drop-brief-summary').textContent=mission.name.toUpperCase()+' / BRIEF';
 $('drop-contracts').replaceChildren();
 dropMissions.forEach((contract,id)=>{
  const unlocked=id===0||data.records[id-1]!==null;
  const button=document.createElement('button');button.textContent=String(id+1).padStart(2,'0')+(data.records[id]!==null?' ✓':unlocked?'':' / LOCKED');
  button.setAttribute('aria-label',`Contract ${id+1}: ${contract.name}`);button.setAttribute('aria-pressed',String(id===data.mission));button.disabled=!unlocked||(active&&id!==data.mission);
  button.addEventListener('click',()=>{if(id===state.deadDrop.mission)return;state.deadDrop.mission=id;state.deadDrop.run=null;courierMessage='Read the next sweep. Stay out of its lane.';$('drop-brief-panel').open=true;save();renderDrop();});
  $('drop-contracts').append(button);
 });
 $('drop-board').replaceChildren();
 for(let cell=0;cell<dropSize*dropSize;cell++){
  const button=document.createElement('button'),row=Math.floor(cell/dropSize),col=cell%dropSize;
  const wall=mission.walls.includes(cell),cover=mission.cover.includes(cell),packet=cell===mission.pickup&&!run?.packet,exit=cell===mission.exit,player=cell===position;
  const hazard=DeadDrop.scanned(cell,scan,mission)&&!wall;
  button.className='city-cell';button.dataset.cell=cell;button.tabIndex=-1;
  for(const [name,value] of Object.entries({wall,cover,packet,exit,player,hazard}))button.classList.toggle(name,value);
  const adjacent=Math.abs(Math.floor(position/dropSize)-row)+Math.abs(position%dropSize-col)===1;
  button.disabled=!active||wall||!adjacent;
  button.setAttribute('aria-label',`Row ${row+1}, column ${col+1}${wall?', building':cover?', cover':''}${packet?', parcel':''}${exit?', antenna':''}${player?', courier':''}${hazard?', scanned next':''}`);
  const coord=document.createElement('span');coord.className='cell-coordinate';coord.textContent=String.fromCharCode(65+col)+(row+1);button.append(coord);
  const icon=document.createElement('span');icon.className='cell-icon';icon.textContent=player?'▲':packet?'◇':exit?'◎':cover?'▤':'';button.append(icon);
  button.addEventListener('click',()=>{const dy=row-Math.floor(state.deadDrop.run.position/dropSize),dx=col-state.deadDrop.run.position%dropSize;moveCourier(dy===-1?'up':dy===1?'down':dx===-1?'left':'right');});
  $('drop-board').append(button);
 }
 $('drop-board').setAttribute('aria-label',`Courier map. Row ${Math.floor(position/6)+1}, column ${position%6+1}. Next sweep ${scan[0]} ${scan[1]+1}. ${run?.packet?'Carrying parcel.':'Find the parcel.'}`);
 document.querySelectorAll('[data-move]').forEach(button=>{button.disabled=!active;});
 $('drop-start').textContent=!run?'ACCEPT CONTRACT →':active?'RESTART RUN ⟳':'RUN AGAIN ⟳';
 $('drop-status').textContent=courierMessage;
 $('drop-status').classList.toggle('failed',run?.status==='lost');
 const best=data.records[data.mission];$('drop-best').textContent=best!==null?'BEST / '+best+' TURNS':'NO RECEIPT YET';
 $('drop-ending').hidden=run?.status!=='won';
 $('drop-ending').textContent=run?.status==='won'?mission.ending:'';
 arrangeCourier();renderReleaseShelf();
}
function beginCourier(){
 state.deadDrop.run=DeadDrop.start(dropMissions[state.deadDrop.mission]);courierMessage='Contract accepted. Forecast first. Then move.';
 $('drop-brief-panel').open=innerWidth>760;save();renderDrop();$('drop-board').focus({preventScroll:true});
 if(innerWidth<=760)window.scrollTo({top:0,behavior:'instant'});
}
function moveCourier(action){
 if(!state.deadDrop.run||state.deadDrop.run.status!=='active')return;
 const mission=dropMissions[state.deadDrop.mission],result=DeadDrop.step(state.deadDrop.run,action,mission);
 courierMessage=dropEvents[result.event]||courierMessage;
 if(result.event!=='blocked')state.deadDrop.run=result.run;
 if(result.event==='delivered'){
  const old=state.deadDrop.records[state.deadDrop.mission];state.deadDrop.records[state.deadDrop.mission]=old===null?result.run.turn:Math.min(old,result.run.turn);
 }
 const saved=save();renderDrop();$('drop-board').focus({preventScroll:true});
 if(!saved)$('drop-status').textContent=courierMessage+' Progress is in memory only; export before leaving.';
 if(result.event==='delivered'){
  $('receipt-title').textContent=mission.name;$('receipt-story').textContent=mission.ending;$('receipt-score').textContent=result.run.turn+' TURNS / '+(saved?'RECEIPT SAVED':'NOT SAVED — EXPORT A BACKUP');
  $('receipt-next').hidden=state.deadDrop.mission===dropMissions.length-1;
  $('drop-result').showModal();
 }
}
$('drop-start').addEventListener('click',beginCourier);
document.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',()=>moveCourier(button.dataset.move)));
$('drop-board').addEventListener('keydown',event=>{
 const action={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right',' ':'wait'}[event.key];
 if(action){event.preventDefault();if(!event.repeat)moveCourier(action);}
});
$('receipt-keep').addEventListener('click',()=>$('drop-result').close());
$('receipt-next').addEventListener('click',()=>{if(state.deadDrop.mission>=2)return;$('drop-result').close();state.deadDrop.mission++;state.deadDrop.run=null;courierMessage='A new sender. The same city.';$('drop-brief-panel').open=true;save();renderDrop();});
const authoredReleases=[
 {number:'008',type:'GAME / THREE CONTRACTS',title:'Dead Drop',description:'A courier game about preserving the things a city decides to erase. Three small deliveries, three endings.',href:'#drop'},
 {number:'005',type:'ONGOING MYSTERY / CASE 001',title:'Dead Letter',description:'A packet on an empty relay. Five surviving bytes and a sender you haven’t met yet.',href:'#case'},
 {number:'005',type:'TOOL / PERSONAL WORKBENCH',title:'Focus + loose ends',description:'A clock that keeps counting when you leave, and a task list that remembers what you owe yourself.',href:'#focus'},
 {number:'003',type:'VISUAL EXPERIMENT',title:'Signal Prints',description:'A small machine for making geometric images. Keep a composition or take it out of the terminal.',href:'#latest'},
 {number:'002',type:'INSTRUMENT',title:'Noise Engine',description:'An eight-step drum machine. A kick, a snare, and a hat. Make a loop that deserves another minute.',href:'#drum'},
 {number:'002',type:'FICTION / EXPLORATION',title:'Signal Hunter',description:'Search the band for stories that should not be transmitting. Keep what you recover.',href:'#receiver'}
];
function renderReleaseShelf(){
 $('release-list').replaceChildren();
 authoredReleases.forEach((release,index)=>{
  const link=document.createElement('a');link.href=release.href;link.className='release-card';
  const serial=document.createElement('span');serial.className='release-number';serial.textContent=release.number;
  const content=document.createElement('div'),kind=document.createElement('p'),title=document.createElement('h3'),description=document.createElement('p'),status=document.createElement('span');
  kind.className='micro';kind.textContent=release.type;title.textContent=release.title;description.textContent=release.description;status.className='release-status';
  status.textContent=index===0?state.deadDrop.records.filter(score=>score!==null).length+'/3 DELIVERIES':index===1?(state.hub.solved?'CASE RESOLVED':'CASE OPEN'):'OPEN →';
  content.append(kind,title,description);link.append(serial,content,status);$('release-list').append(link);
 });
}
document.addEventListener('relay-restored',()=>{courierMessage='Records recovered. Your contract is where you left it.';if($('drop-result').open)$('drop-result').close();renderDrop();});
window.addEventListener('resize',()=>{arrangeCourier();if(innerWidth>760)$('drop-brief-panel').open=true;});
renderDrop();
if(innerWidth<=760&&state.deadDrop.run?.status==='active')$('drop-brief-panel').open=false;
