'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('../v9_9_53/battle_regression.cjs');
const dir=process.env.JBD_GAME_DIR||path.join(__dirname,'_compiled');
const js=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
for(const label of ['BUNKER DEFENSE 2.0 — OPTIONAL LAYERED VISUAL POLISH',
 'BUNKER DEFENSE 2.0 — ADDITIVE MIXER','V10.6 — PARACHUTE LOOT',
 'V10.7 — NINE-STATE VEHICLE DAMAGE','JBD V10.8 — scheduled'])
 assert(js.includes(label),'required original/upgrade module '+label);
assert(/Bunker Defense 2\.0/i.test(html),'new entrypoint identifies 2.0');
assert(/v20Controls/.test(js),'settings UI is installed');
const g=loadGame(dir),u=g.t;
u.start('easy');
assert(g.ids.get('v20Toggle'),'settings button is present');
for(let level=1;level<=30;level++){
 u.state.levelIndex=level-1;u.reset();
 const s=u.state;
 assert.equal(s.mode,'playing','map '+level+' loads');
 assert.equal(s.v106Schedule.length,3,'original parachute crates kept in map '+level);
 const expected=level===1?4:level<=3?5:level<=5?6:level<=10?7:level<=15?8:level%2===0?9:8;
 assert.equal(s.v108Schedule.length,expected,'scheduled upgrades remain in map '+level);
 assert(s.v108Schedule.at(-1)>=.85,'late upgrade available in map '+level);
 if(level%5===0)u.render();
}
u.state.levelIndex=0;u.reset();
const s=u.state,button=g.ids.get('v20Toggle'),click=button.eventEntries.click[0].fn;
click({preventDefault(){},stopPropagation(){}});
assert.equal(g.ids.get('v20Panel').style.display,'block','settings opens for touch');
const before=s.levelTime;
u.step(1/30);
assert.equal(s.levelTime,before,'settings safely pause battlefield');
click({preventDefault(){},stopPropagation(){}});
assert.equal(g.ids.get('v20Panel').style.display,'none','settings closes for touch');
u.step(1/30);
assert(s.levelTime>before,'battle unfreezes when settings close');
// New renderer remains capable of drawing existing original sprites.
u.spawnVehicle('jeep',0,'kubel_1',0,0);
const vehicle=s.vehicles[s.vehicles.length-1];
u.render();
assert(vehicle&&vehicle.alive,'original vehicle actor remains usable');
s.primaryCooldown=0;s.primaryReloadT=0;s.heat=0;s.overheat=false;
assert(u.fire('mg',s.bunker.x,s.bunker.y-140),'MG is still fireable');
u.shotStep(1/60);u.render();
// Completion button and all mission objects remain in legacy V10.8.
assert(g.ids.get('deploy'),'original Next Map UI remains wired');
assert(js.includes('v108UiCreate')&&js.includes('v108Accept'),'original upgrade selection handler remains compiled');
console.log('PASS BUNKER DEFENSE 2.0: 30 maps, scheduled upgrades, 3 bonus crates, iPhone settings and pausing, original MG/vehicle drawing and touch controls.');

// Real transitions under the 2.0 engine, including ALL late scheduled
// upgrade choices. This catches a softlock from modal/FX integration.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');u.state.levelIndex=5;u.reset();
 const s=u.state;
 for(let map=5;map<=8;map++){
  assert.equal(s.levelIndex,map,'currently playing map '+(map+1));
  let frames=0,choices=0;
  while(s.mode==='playing'&&frames<5400){
   if(s.v108Offer){
    const button=h.ids.get('v108Accept');
    assert(button&&button.eventEntries.click.length,'a scheduled upgrade can be accepted');
    button.eventEntries.click[0].fn({preventDefault(){},stopPropagation(){}});
    choices++;if(choices>12)throw Error('upgrade prompt loop');
    continue;
   }
   u.step(1/30);frames++;
   if(frames%7===0){
    s.vehicles.filter(v=>v.alive&&!v.allied).forEach(v=>u.damageVehicle(v,(v.hp||0)+(v.armorHp||0)+1000,'he'));
    s.infantry.filter(e=>e.alive&&!e.v102Unarmed).forEach(e=>u.damageInfantry(e,e.hp+(e.armorHp||0)+1000,'he'));
    s.air.forEach(a=>a.alive=false);s.paras.forEach(p=>p.alive=false);
   }
  }
  assert.equal(s.mode,'shop','2.0 map '+(map+1)+' can be completed');
  assert.equal(s.v108Granted,s.v108Schedule.length,'all scheduled upgrades offered in map '+(map+1));
  assert(s.v102VictoryHold&&s.v102VictoryHold.elapsed>=5,'existing wreck cinematic retained');
  if(map===8)break;
  const btn=h.ids.get('deploy');
  assert.equal(btn.disabled,false,'Next Map button enabled');
  let stopped=false;
  const ev={preventDefault(){},stopImmediatePropagation(){stopped=true;}};
  for(const e of (btn.eventEntries.click||[]).slice().sort((a,b)=>Number(b.capture)-Number(a.capture))){
   if(stopped)break;e.fn(ev);
  }
  assert.equal(s.levelIndex,map+1,'2.0 moves to the following map');
 }
 console.log('PASS BUNKER DEFENSE 2.0: true 6 → 7 → 8 → 9 transitions, all earned upgrades and five-second aftermath.');
}
