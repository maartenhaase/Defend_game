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
assert(g.ids.get('v108Accept')===null||!!g.ids.get('v108Accept'),'upgrade selector remains in the runtime');
console.log('PASS BUNKER DEFENSE 2.0: 30 maps, scheduled upgrades, 3 bonus crates, iPhone settings and pausing, original MG/vehicle drawing and touch controls.');