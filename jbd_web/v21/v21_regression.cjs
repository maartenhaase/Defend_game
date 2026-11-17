'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('../v9_9_53/battle_regression.cjs');
const dir=process.env.JBD_GAME_DIR||'/tmp/jbd21';
const js=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
assert(js.includes('JUST BUNKER DEFENSE 2.1'),'2.1 module must be built inside engine');
assert(/2\.1/.test(html),'2.1 site should identify its own version');
assert(js.includes('v108Campaign=function(){return false;}'),'milestone prompts are disabled');
let totals=new Set();
const h=loadGame(dir),u=h.t;
u.start('easy');
for(let level=1;level<=30;level++){
 u.state.levelIndex=level-1;u.reset();
 const s=u.state,target=s.v106Target;
 assert.equal(s.mode,'playing','map '+level+' loads');
 assert(target>=3&&target<=6,'3–6 crates map '+level);
 assert.equal(s.v106Schedule.length,target,'exact scheduled crate count map '+level);
 assert(s.v106Schedule.at(-1)>=17,'late crate schedule map '+level);
 assert(!s.v108Offer,'no forced milestone menu map '+level);
 assert(s.profile.primaryMag>=12,'minimum 12-round magazine map '+level);
 assert(s.primaryAmmo>=12,'12 rounds actually loaded on reset map '+level);
 totals.add(target);
 if(level>=2&&level<=5){
  const id=['technical','crossbike','medicquad','medtruck'][level-2];
  assert(s.events.some(e=>e.vehicleId==='v21_'+id),'new '+id+' introduced in map '+level);
 }
 if(level%6===0)u.render();
}
assert(totals.size>=2,'number of crates changes between maps');
u.state.levelIndex=1;u.reset();
const s=u.state;
const specIds=['v21_technical','v21_crossbike','v21_medicquad','v21_medtruck'];
for(const id of specIds){
 const prev=s.vehicles.length;
 u.spawnVehicle('jeep',2,id,0,2);
 assert.equal(s.vehicles.length,prev+1,id+' can spawn');
 const v=s.vehicles.at(-1);
 assert.equal(v.vehicleId,id,id+' uses its own named vehicle spec');
 assert(v.maxHp>75,id+' vehicle has strengthened health');
 assert(v.v21Kind,id+' has behavior configured');
 if(id==='v21_technical')assert(v.hasMG&&v.passengers===2,'technical has driver and MG gunner');
 if(id==='v21_crossbike')assert(!v.hasMG&&v.unloadLeft===2,'two elite riders, no mounted weapon');
 if(id==='v21_medicquad')assert(!v.hasMG&&v.unloadLeft===2,'quad has driver and medic');
 if(id==='v21_medtruck')assert(!v.hasMG&&v.unloadLeft>=4,'medical truck carries Class A medics');
}
// Real staggered transport unload and combat-ready medic roles.
{
 const h2=loadGame(dir),p=h2.t;p.start('easy');p.state.levelIndex=5;p.reset();
 const q=p.state;
 for(const [id,expectedRole] of [['v21_crossbike','storm'],['v21_medicquad','medic'],['v21_medtruck','medic']]){
  q.vehicles.length=0;q.infantry.length=0;
  p.spawnVehicle(id==='v21_medtruck'?'trooptruck':'jeep',5,id,0,5);
  const bus=q.vehicles[0];bus.x=195;bus.y=300;bus.state='unload';
  bus.stopT=120;bus.currentSpeed=0;bus.unloadCd=0;bus.hasMG=false;
  let count=0;
  for(let frame=0;frame<300&&bus.unloadLeft>0;frame++){
   p.vehicleStep(1/30);
   count=q.infantry.length;
  }
  assert.equal(bus.unloadLeft,0,id+' can unload every passenger');
  assert(count>=2,id+' creates real dismounted soldiers');
  if(id==='v21_crossbike')assert(q.infantry.filter(e=>e.role==='storm').length>=2,'both riders become elites');
  if(id==='v21_medicquad')assert(q.infantry.some(e=>e.role==='medic'),'quad brings a medic');
  if(id==='v21_medtruck'){
   assert(q.infantry.length>=4,'medical truck offloads full squad');
   assert(q.infantry.every(e=>e.role==='medic'&&/MP40/.test(e.weaponName)),
    'all Class A medics get MP40 weapons and healing AI');
  }
 }
}
u.render(); // Smoke-test all four unique new vehicle render paths at real canvas size.
const v=s.vehicles[0],hp=v.hp;
u.damageVehicle(v,8,'mg');
const mgLoss=hp-v.hp;
assert(mgLoss>=0&&mgLoss<8,'MG should produce limited hull damage');
const health=v.hp;
u.damageVehicle(v,28,'he');
assert(health-v.hp>mgLoss,'heavy shells deal much more damage than MG');
assert(v.alive,'one modest HE shot does not instantly vaporize a truck');
// Force all random optional crates into existence, prove they can absorb
// substantial MG punishment, and that no unlock is granted for free.
s.vehicles.length=0;s.infantry.length=0;
for(const e of s.events)e.t=9999;
for(let i=0;i<2400&&s.v106Spawned<1;i++)u.step(1/60);
assert(s.v106Spawned>=1,'early parachute supply crate appears');
const c=s.v106Crates.find(x=>!x.opened);
assert(c&&c.hp>=7*18,'first crate needs 18+ base MG hits');
function hitCrate(){const b={kind:'mg',px:c.x-24,py:c.y,x:c.x+24,y:c.y,damage:12,penetration:0,penetrationChance9933:0,piercedIds:{},active:true};return u.ballistic(b,[],true);}
for(let i=0;i<12;i++)hitCrate();
assert(!c.opened,'crate does not break after 12 normal MG bullets');
for(let i=0;i<35&&!c.opened;i++)hitCrate();
assert(c.opened,'crate eventually opens with sustained real gunfire');
assert(!s.v108Offer,'no mandatory upgrade modal after crate is opened');
u.render();
console.log('PASS 2.1: 30 maps, 3–6 randomized drops, no forced modal, 12 bullets loaded, stronger vehicles, flak>MG, four new crewed vehicle specs, damageable glowing crates.');


// A real simulated 7 → 8 transition under 2.1: no hidden mandatory
// reward queue, all 3–6 drops appear, and the wreck remains 5 seconds.
{
 const h3=loadGame(dir),p=h3.t;
 p.start('easy');p.state.levelIndex=6;p.reset();
 const q=p.state;
 let frames=0;
 while(q.mode==='playing'&&frames<5700){
  assert(!q.v108Offer,'no unskippable upgrade selection at any point');
  p.step(1/30);frames++;
  if(frames%8===0){
   q.vehicles.filter(v=>v.alive&&!v.allied).forEach(v=>p.damageVehicle(v,(v.hp||0)+(v.armorHp||0)+2000,'he'));
   q.infantry.filter(e=>e.alive&&!e.v102Unarmed).forEach(e=>p.damageInfantry(e,e.hp+(e.armorHp||0)+2000,'he'));
   q.air.forEach(a=>a.alive=false);
   q.paras.forEach(a=>a.alive=false);
  }
 }
 assert.equal(q.v106Spawned,q.v106Target,'all chosen parachute crates appeared even if battle was won quickly');
 assert.equal(q.mode,'shop','level 7 completes without forced upgrade popup');
 assert(q.v102VictoryHold&&q.v102VictoryHold.elapsed>=5,'five-second burning aftermath remains');
 const next=h3.ids.get('deploy');
 assert.equal(next.disabled,false,'Next Map control enabled after level 7');
 let stop=false;
 for(const e of (next.eventEntries.click||[]).slice().sort((a,b)=>Number(b.capture)-Number(a.capture))){
  if(stop)break;
  e.fn({preventDefault(){},stopImmediatePropagation(){stop=true;}});
 }
 assert.equal(q.levelIndex,7,'level 8 actually loads');
 assert.equal(q.mode,'playing','level 8 is playable');
 assert(q.profile.primaryMag>=12,'12+ bullets loaded in level 8');
 console.log('PASS 2.1: actual level 7 → 8 transition, random crates and five-second victory cinematic.');
}
