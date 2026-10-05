const assert=require('node:assert/strict');
const rules=require('../drop-engine.js');
function solve(mission,start=rules.start(mission)){
 const queue=[{run:start,path:[]}],seen=new Set();
 for(let head=0;head<queue.length;head++){
  const {run,path}=queue[head];if(run.status==='won')return path;
  for(const action of ['up','down','left','right','wait']){
   const result=rules.step(run,action,mission);if(result.event==='blocked'||result.run.status==='lost')continue;
   const next=result.run,key=[next.position,next.packet,next.turn%mission.scans.length].join(':');
   if(seen.has(key))continue;seen.add(key);queue.push({run:next,path:[...path,action]});
  }
 }
 throw Error('Unsolvable contract: '+mission.id);
}
if(require.main===module){
 for(const mission of rules.missions){const path=solve(mission);let run=rules.start(mission),pickedUp=false;for(const action of path){const result=rules.step(run,action,mission);run=result.run;pickedUp ||= result.event==='pickup';}assert.equal(run.status,'won');assert.equal(run.position,mission.exit);assert.equal(run.packet,true);assert.equal(pickedUp,true);assert.ok(path.length<=mission.limit);console.log('PASS solvable contract:',mission.id,'in',path.length,'turns');}
 const mission=rules.missions[0],start=rules.start(mission);
 assert.equal(rules.step(start,'up',mission).event,'caught');assert.equal(rules.step(start,'left',mission).event,'blocked');assert.equal(rules.step(start,'left',mission).run.turn,0);
 assert.equal(rules.step({...start,position:6},'right',mission).event,'blocked');
 assert.equal(rules.step({...start,position:25},'wait',mission).run.status,'active','cover protects during a matching sweep');
 let waiting=start;for(let turn=0;turn<mission.limit;turn++)waiting=rules.step(waiting,'wait',mission).run;assert.equal(waiting.status,'lost');assert.equal(waiting.turn,mission.limit);
 assert.equal(rules.step({...start,position:mission.exit},'wait',mission).run.status,'active','antenna without parcel does not win');
 console.log('PASS: forecast danger, cover safety, boundaries and buildings, invalid moves cost no turns, waiting advances time, deadline, parcel required.');
}
module.exports={solve};
