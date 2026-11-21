'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('../v9_9_53/battle_regression.cjs');
const dir=process.env.JBD_GAME_DIR||'/tmp/jbd22';
const js=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
assert(js.includes('BUNKER DEFENSE 2.2'),'2.2 layer embedded in original game');
assert(html.includes('16-BIT ARCADE'),'arcade entrypoint');
assert(html.includes('pixelated'),'crisp pixel rendering on iPhone');
let tested=0;
const h=loadGame(dir),p=h.t;
p.start('easy');
for(let n=1;n<=30;n++){
 p.state.levelIndex=n-1;p.reset();
 const s=p.state;
 assert.equal(s.mode,'playing','wave '+n+' playable');
 assert.equal(s.v106Target,1,'one optional crate per wave');
 assert.equal(s.v106Schedule.length,3,'legacy schedule safely guarded');
 assert(s.v106Schedule[1]===Infinity,'no legacy forced drops');
 assert(s.profile.primaryMag>=12&&s.primaryAmmo>=12,'at least 12 live rounds');
 assert(s.events.every(e=>e.t>=1&&e.t<=37),'compact time plan on map '+n);
 assert(s.v22AdvanceQueued===false,'fresh wave, no stale auto advance');
 if(n%5===0)p.render();
 tested++;
}
assert.equal(tested,30);
{
 const q=loadGame(dir),u=q.t;
 u.start('easy');u.state.levelIndex=6;u.reset();
 const g=u.state;
 let frames=0;
 while(g.mode==='playing'&&frames<5400){
  u.step(1/30);frames++;
  if(frames%6===0){
   g.vehicles.filter(v=>v.alive&&!v.allied).forEach(v=>u.damageVehicle(v,(v.hp||0)+(v.armorHp||0)+2500,'he'));
   g.infantry.filter(e=>e.alive&&!e.v102Unarmed).forEach(e=>u.damageInfantry(e,(e.hp||0)+(e.armorHp||0)+2500,'he'));
   g.air.forEach(e=>e.alive=false);
   g.paras.forEach(e=>e.alive=false);
  }
 }
 assert.equal(g.mode,'shop','wave 7 clears without waiting for bonus crates');
 assert.equal(g.v22AdvanceQueued,true,'wave 7 will automatically advance');
 assert(g.v102VictoryHold&&g.v102VictoryHold.elapsed>=5,'short transition completed');
 assert(g.v106Spawned<=1,'no unwanted legacy crates');
 const next=q.ids.get('deploy');
 assert(!next.disabled,'original next-wave action is ready');
 let stop=false;
 for(const e of (next.eventEntries.click||[]).slice().sort((a,b)=>Number(b.capture)-Number(a.capture))){
  if(stop)break;e.fn({preventDefault(){},stopImmediatePropagation(){stop=true;}});
 }
 assert.equal(g.levelIndex,7,'wave 8 starts via original next button');
 assert.equal(g.mode,'playing','wave 8 playable');
 assert(g.primaryAmmo>=12,'wave 8 magazine loaded');
}
console.log('PASS 2.2: 30 short waves, optional crate, 12+ rounds, no forced upgrade menus, 7→8 transition.');
