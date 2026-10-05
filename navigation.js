'use strict';
// Hashes make every tool linkable and let native browser history handle back/forward.
const channelRoutes = {
  drift: {view:'drift',name:'01 / DRIFT'},
  case: {view:'case',name:'02 / CASE FILE'},
  tools: {view:'tools',part:'notes',name:'03 / SCRATCHPAD'},
  notes: {view:'tools',part:'notes',name:'03 / SCRATCHPAD'},
  focus: {view:'tools',part:'focus',name:'03 / FOCUS + TASKS'},
  decoder: {view:'tools',part:'decoder',name:'03 / DECODER'},
  experiments: {view:'lab',part:'latest',name:'04 / PRINTS'},
  latest: {view:'lab',part:'latest',name:'04 / PRINTS'},
  receiver: {view:'lab',part:'receiver',name:'04 / SIGNAL HUNTER'},
  drum: {view:'lab',part:'drum',name:'04 / NOISE ENGINE'},
  archive: {view:'lab',part:'archive',name:'04 / COLLECTION'},
  memory: {view:'memory',name:'05 / MEMORY'}
};
let activeChannel;
function selectChannel({focus=false}={}) {
  const hash=location.hash.slice(1);
  const route=Object.hasOwn(channelRoutes,hash)?channelRoutes[hash]:channelRoutes.drift;
  document.querySelectorAll('[data-view]').forEach(panel=>{panel.hidden=panel.dataset.view!==route.view;});
  ['notes','focus','decoder'].forEach(id=>{$(id).hidden=route.view!=='tools'||route.part!==id;});
  ['latest','receiver','drum','archive'].forEach(id=>{$(id).hidden=route.view!=='lab'||route.part!==id;});
  document.querySelectorAll('[data-view-link]').forEach(link=>{
    if(link.dataset.viewLink===route.view)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-subview]').forEach(link=>{
    if(link.dataset.subview===route.part)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  $('view-name').textContent=route.name;
  document.title='Dead Air / '+route.name.split(' / ')[1];
  if(route.part!=='drum'&&playing)stopEngine();
  if(route.part==='receiver')drawScope(0);
  // The page does not remount panels, so unfinished text and timer state survive switching.
  if(activeChannel!==hash){
    window.scrollTo({top:0,behavior:'instant'});
    if(focus){const panel=$('view-'+route.view);panel.tabIndex=-1;panel.focus({preventScroll:true});}
  }
  activeChannel=hash;
}
window.addEventListener('hashchange',()=>selectChannel({focus:true}));
selectChannel();

function showStorageWarning(){
 $('storage-warning').hidden=storageOK;
 $('storage-warning').textContent=storageOK?'':$('data-status').textContent;
}
new MutationObserver(showStorageWarning).observe($('data-status'),{childList:true,subtree:true});
showStorageWarning();
