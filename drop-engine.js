'use strict';
// Shared pure rules: the browser and the tests use the same authored city maps.
(function(root){
  const size=6;
  const missions=[
    {id:'voice',name:'An unregistered voice',sender:'M / 03:17',cargo:'A recording of someone the city says never existed.',start:30,pickup:14,exit:5,limit:22,walls:[7,8,13,16,21,22,28],cover:[10,19,25],scans:[['row',4],['col',2],['row',2],['col',4]],brief:'The registry erased her name at midnight. Her voice is still on a recorder in Block C. Get it to the north antenna. The city can delete a person. It cannot delete everyone who remembers.',ending:'The antenna plays eleven seconds of her voice. In three apartments, strangers stop what they are doing. One of them says her name. The registry remains unchanged. Something else does not.'},
    {id:'daylight',name:'Two minutes of daylight',sender:'ROOFTOP COOPERATIVE / 05:40',cargo:'An access key for a building that has never seen the sun.',start:35,pickup:20,exit:0,limit:24,walls:[7,9,10,15,22,28],cover:[4,13,25],scans:[['col',3],['row',3],['col',1],['row',1]],brief:'The east-facing shutters have been locked for nine years. Someone found the maintenance key. Deliver it before the light passes the building. This is a very small revolution.',ending:'Thirty-seven shutters open. Light reaches a kitchen table, a cracked aquarium, and a man who has forgotten the color of his own walls. The shutters close after two minutes. Nobody gives the key back.'},
    {id:'address',name:'A place to be found',sender:'LOST PROPERTY / 00:06',cargo:'A hand-drawn address. There is no entry for it on any map.',start:0,pickup:26,exit:35,limit:26,walls:[2,8,10,15,21,28],cover:[5,13,31],scans:[['row',2],['col',4],['row',4],['col',1]],brief:'The return address on an undelivered letter points to a street that was demolished. Go there anyway. Some places keep existing because someone is on their way.',ending:'There is a door where the address said there would be. A woman opens it before you knock. “You took your time,” she says. Behind her, a whole street turns its lights on.'}
  ];
  function scanned(cell,scan,mission){return !mission.cover.includes(cell)&&(scan[0]==='row'?Math.floor(cell/size)===scan[1]:cell%size===scan[1]);}
  function initial(){return {position:30,turn:0,packet:false,status:'active'};}
  function start(mission){return {...initial(),position:mission.start};}
  function step(run,action,mission){
    if(run.status!=='active')return {run,event:'inactive'};
    const deltas={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1],wait:[0,0]};
    if(!Object.hasOwn(deltas,action))return {run,event:'blocked'};
    const [dy,dx]=deltas[action],row=Math.floor(run.position/size)+dy,col=run.position%size+dx;
    if(row<0||row>=size||col<0||col>=size||mission.walls.includes(row*size+col))return {run,event:'blocked'};
    const position=row*size+col,packet=run.packet||position===mission.pickup;
    const next={position,turn:run.turn+1,packet,status:'active'};
    if(scanned(position,mission.scans[run.turn%mission.scans.length],mission)){next.status='lost';return {run:next,event:'caught'};}
    if(position===mission.exit&&packet){next.status='won';return {run:next,event:'delivered'};}
    if(next.turn>=mission.limit){next.status='lost';return {run:next,event:'timeout'};}
    return {run:next,event:packet&&!run.packet?'pickup':action==='wait'?'wait':'moved'};
  }
  const api={size,missions,scanned,start,step};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DeadDrop=api;
})(globalThis);
