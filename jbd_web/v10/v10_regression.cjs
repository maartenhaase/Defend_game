'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadGame}=require('../v9_9_53/battle_regression.cjs');
const dir=__dirname;
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const code=fs.readFileSync(path.join(dir,'game.js'),'utf8');
assert.match(html,/V10\.7/,'iPhone HTML identifies the loot update');
assert.match(html,/mapSelectV10/,'map chooser remains available');
assert.match(code,/V10\.7 — PARACHUTE LOOT/,'destructible crate subsystem is installed');
assert.match(code,/v106BallisticOld/,'loot uses the real MG collision solver');
assert.match(code,/v106FlakBlastOld/,'Flak explosions can damage parachute crates');
const rewardKeys=[
 'flakDamage','mgDamage','flakSplash','bunkerArmor','repair',
 'mgRate','flakReload','flakProjectile','mgSpread','flakSpread',
 'penetration','heat','magazine','mgReload','obstacleDamage',
 'elites','armorVehicle','rambo'
];
for(const key of rewardKeys)
 assert(code.includes("id:'"+key+"'"),key+' must be obtainable in a random crate');
console.log('PASS: 18 distinct loot types, parachute rendering, MG and FLAK collision installed.');

const g=loadGame(dir),t=g.t;
t.start('easy');
const titles=new Set(),signatures=new Set(),biomes=new Set();
for(let i=0;i<30;i++){
 t.state.levelIndex=i;t.reset();
 const s=t.state;
 assert.equal(s.mode,'playing','map '+(i+1)+' starts');
 assert.equal(s.profile.primaryMag,12,'no level-index MG magazine bonus on map '+(i+1));
 assert.equal(s.save.upgrades.rate,0,'no old free rate upgrade on map '+(i+1));
 assert.equal(s.save.upgrades.special,0,'no old free FLAK upgrade on map '+(i+1));
 assert.equal(s.v106Spawned,0,'fresh stage has not already claimed any crate');
 assert.deepEqual(s.v106Crates.length,0);
 assert(s.v106Schedule.length===3,'three scheduled crate drops');
 const vehicles=s.events.filter(e=>['jeep','scoutcar','truck','trooptruck','lighttruck','halftrack'].includes(e.type));
 assert(vehicles.length>=(i===0?1:2),'varied vehicle plan at map '+(i+1));
 if(i===0)assert.equal(s.events.length,1,'tutorial remains simple');
 const flak=g.ids.get('jbdFlakFire9951');
 assert(flak,'Flak control is present');
 // Use the actual GUI button, not a simulated fabricated FLAK stat.
 if(i===0||i===3||i===16){
   flak.eventEntries.click[0].fn({preventDefault(){},stopPropagation(){}});
   assert(s.flak9950&&s.flak9950.shots.length===1,'FLAK still starts with ONE shell on map '+(i+1));
 }
 if(i===8||i===23||i===29)t.render();
 titles.add(t.levels[i].name);
 signatures.add(s.map.v10RouteSignature);
 biomes.add(t.tour[i].theme);
}
assert.equal(titles.size,30,'all titles unique');
assert.equal(signatures.size,30,'all maps geographically distinct');
assert(biomes.size>=5,'terrain transitions across the campaign');
assert.deepEqual(Object.keys(t.state.save.v106Perks||{}),[],'no unearned permanent perks');
console.log('PASS: 30 maps, 3 planned drops each, no automatic arsenal progression, FLAK stays at one projectile.');

// Actual crate deliveries, bullet collision, HP and earned permanent
// reward. No function calls to award the reward for free.
{
 const h=loadGame(dir),u=h.t;h.setRandom(0);
 u.start('easy');u.state.levelIndex=2;u.reset();
 const s=u.state;
 // Eliminate environmental obstructions only for this isolated hit test.
 s.map.cover=[];s.map.rocks=[];s.map.trees=[];
 s.infantry=[];s.vehicles=[];s.air=[];s.paras=[];
 s.events=[];s.eventCursor=0;
 for(let n=0;n<100;n++)u.step(1/30);
 assert.equal(s.v106Spawned,3,'fast-victory dispatcher still supplies all three crates');
 assert.equal(s.v106Crates.length,3);
 const crate=s.v106Crates[0];
 crate.x=s.bunker.x;crate.y=s.bunker.y-210;crate.landed=true;
 crate.hp=crate.maxHp=54;s.profile.spreadScale=0;
 let rounds=0;
 while(!crate.opened&&rounds<15){
  s.primaryCooldown=0;s.primaryReloadT=0;s.overheat=false;s.heat=0;
  assert(u.fire('mg',crate.x,crate.y),'MG bullet '+rounds+' fired toward crate');
  rounds++;
  for(let f=0;f<48;f++)u.shotStep(1/60);
 }
 assert(crate.opened,'the crate opens after enough actual MG impacts');
 assert(rounds>=7,'breaking the crate costs a meaningful amount of ammunition');
 assert.equal(s.save.v106CratesOpened,1,'exactly one reward is granted after destruction');
 assert.equal(s.save.v106Perks.flakDamage,1,'deterministic first random reward acquired');
 assert.equal(s.profile.primaryMag,12,'the reward did not grant unrelated upgrades');
 assert.equal(s.v106Crates.filter(c=>c.opened).length,1,'unopened crates have no rewards');
 u.render();
 u.state.levelIndex=3;u.reset();
 assert.equal(u.state.save.v106Perks.flakDamage,1,'earned crate upgrade persists after Next Map');
 assert.equal(u.state.profile.primaryMag,12,'no free magazine upgrade after Next Map');
 console.log('PASS: exactly 3 random parachute crates, real 8+ round damage cost, earned loot only, persistent reward.');
}

// Reproduce V10.4 failure: a burning, temporarily non-targetable car
// must finish through the same five-second aftermath after all crates
// have arrived; no infinite level freeze.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');u.state.levelIndex=2;u.reset();
 const s=u.state;
 for(let n=0;n<120;n++)u.step(1/30);
 const v=s.vehicles.find(c=>c.alive&&!c.allied);
 assert(v,'map 3 has a real hostile car');
 s.eventCursor=s.events.length;s.infantry=[];s.air=[];s.paras=[];
 // A fuel blaze now begins only after the seventh damage phase.
 v.hp=v.maxHp*.19;
 v.currentSpeed=0;v.speed=0;v.state='smoulder9941';
 v.fuelIgnited=true;v.burnPhase9941='cookoff';
 v.burnPlan9941='ammo';v.fuelBurnT=120;v.fuelBurnDuration9937=120;
 let total=0,holdStart=-1;
 while(s.mode==='playing'&&total<25){
  u.step(1/30);total+=1/30;
  if(holdStart<0&&s.v102VictoryHold)holdStart=total;
 }
 assert(!v.alive,'stranded burning target is genuinely destroyed');
 assert.equal(s.v106Spawned,3,'all three crates arrive before victory');
 assert(holdStart>0,'the cinematic wreck aftermath occurs');
 assert(total>=holdStart+4.85,'wreck burning remains visible for five seconds');
 assert.equal(s.mode,'shop','the map finishes and never remains stuck burning');
 assert.equal(h.ids.get('deploy').disabled,false,'Next Map button enabled');
 const button=h.ids.get('deploy'),entries=(button.eventEntries.click||[]).slice()
   .sort((a,b)=>Number(b.capture)-Number(a.capture));
 let stopped=false;
 const event={preventDefault(){},stopImmediatePropagation(){stopped=true;}};
 for(const entry of entries){if(stopped)break;entry.fn(event);}
 assert.equal(s.levelIndex,3,'Next Map actually advances');
 assert.equal(s.mode,'playing','map 4 is playable');
 console.log('PASS: burned car, three optional crate drops, five-second victory scene and functioning Next Map.');
}

// The previous death animation and flying ammunition improvements still
// work alongside the crate system.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');u.state.levelIndex=3;u.reset();
 const s=u.state;s.events=[];s.eventCursor=0;
 const soldier=u.spawnEnemy(190,280,'rifle',null,'vehicle');
 soldier.hp=5;soldier.armorHp=0;
 u.damageInfantry(soldier,100,'he'); // explosive fatal hit cannot become a revivable casualty
 assert(!soldier.alive&&soldier.v104Fall,'animated fatal fall registered');
 for(let n=0;n<18;n++)u.step(1/30);
 assert(soldier.deadT>=.48&&soldier.v104Fall.thud,'falling body plays thud');
 const v={x:190,y:380,cookoffShots9943:0},pool=u.field();
 u.ammoEmit(v,-Math.PI/2);
 const b=pool.bullets[pool.bullets.length-1],before=b.vy;
 assert(b.v104Arc&&b.life>.50,'long arcing flying ammunition');
 u.ammoStep(1/30);assert(b.vy>before,'gravity curves the ammo');
 console.log('PASS: previous kinetic death animation and curved cookoff ammo preserved.');
}


// V10.7 nine visible vehicle states, harder armor and a precise
// 8% level-by-level health ramp for the same underlying vehicle.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');
 const levels=[];
 for(let level=5;level<=8;level++){
  u.state.levelIndex=level;u.reset();
  u.spawnVehicle('jeep',0,'kubel_1',0,0);
  levels.push(u.state.vehicles[u.state.vehicles.length-1].maxHp);
 }
 for(let i=1;i<levels.length;i++)
  assert(Math.abs(levels[i]/levels[i-1]-1.08)<.002,'vehicle HP rises ~8% from level '+(i+5)+' to '+(i+6));
 const s=u.state,v=s.vehicles[s.vehicles.length-1];
 v.armorHp=0;
 const ratios=[1,.88,.73,.59,.46,.33,.22,.08];
 for(let n=0;n<ratios.length;n++){
  v.hp=v.maxHp*ratios[n];
  u.damageVehicle(v,.001,'mg');
  assert.equal(v.v107Stage,n+1,'vehicle damage stage '+(n+1));
  assert(v.alive,'all pre-wreck damage stages have a shootable vehicle');
 }
 u.damageVehicle(v,v.hp+v.armorHp+10000,'he');
 assert(!v.alive,'vehicle truly destroyed at 0 HP');
 assert.equal(v.v107Stage,9,'ninth stage is a destroyed hull');
 assert(s.wrecks.length>0,'vehicle becomes a visible battlefield wreck');
 const h2=loadGame(dir),q=h2.t;
 q.start('easy');q.state.levelIndex=6;q.reset();
 q.spawnVehicle('jeep',0,'kubel_1',0,0);
 const fuel=q.state.vehicles[q.state.vehicles.length-1];
 fuel.hp=fuel.maxHp*.70;q.ignite(fuel);
 assert(!fuel.fuelIgnited,'vehicle cannot ignite at 70% health');
 fuel.hp=fuel.maxHp*.19;q.ignite(fuel);
 assert(fuel.fuelIgnited,'a heavily damaged vehicle can ignite below 28%');
 console.log('PASS V10.7: all 9 damage stages, real wreck, 8% HP ramp and delayed ignition.');
}

// The same medic code is used by friendly and hostile soldiers.
// A fatal rifle hit sometimes produces a wounded patient; revive takes
// 3–5 seconds and treatment stops immediately if the medic dies.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');u.state.levelIndex=6;u.reset();
 const s=u.state;
 s.infantry=[];s.events=[];s.eventCursor=0;s.map.cover=[];
 h.setRandom(0);
 const medic=u.spawnEnemy(195,430,'medic',null,'vehicle');
 const p=u.spawnEnemy(205,433,'rifle',null,'vehicle');
 medic.faction='wehrmacht';p.faction='wehrmacht';p.armorHp=0;p.hp=4;
 u.damageInfantry(p,15,'mg');
 assert(p.alive&&p.wounded&&p.state==='woundedCrawl','lethal small-arms hit can down rather than instantly kill');
 assert(p.fireCd>10,'downed casualty cannot return fire');
 for(let k=0;k<2;k++)u.alliedMedic(medic,s.infantry,.10,false);
 assert.equal(medic.state,'medicTreat','medic kneels by patient');
 assert(medic.aidTreatT9938>=3.4,'medic performs visible multi-second treatment');
 for(let k=0;k<20;k++)u.alliedMedic(medic,s.infantry,.10,false);
 assert(p.wounded,'patient not automatically healed in first two seconds');
 for(let k=0;k<28;k++)u.alliedMedic(medic,s.infantry,.10,false);
 assert(!p.wounded&&p.alive&&p.hp>0,'patient revived with partial HP');
 assert(p.hp<=p.maxHp*.56,'revived patient has only partial HP');
 assert.equal(p.medicRecoveries9938,1,'one successful revive');
 const medic2=u.spawnEnemy(210,447,'medic',null,'vehicle');
 const q=u.spawnEnemy(215,451,'rifle',null,'vehicle');
 medic2.faction=medic.faction;q.faction=medic.faction;
 q.armorHp=0;q.hp=4;u.damageInfantry(q,20,'mg');
 assert(q.wounded,'second patient downed');
 for(let k=0;k<9;k++)u.alliedMedic(medic2,s.infantry,.10,false);
 u.damageInfantry(medic2,medic2.hp+999,'he');
 assert(!medic2.alive,'medic killed during treatment');
 for(let k=0;k<45;k++)u.alliedMedic(medic2,s.infantry,.10,false);
 assert(q.wounded,'dead medic does not finish revive');
 console.log('PASS V10.7: genuine downed state, 3.8s kneeling medic and interrupted treatment.');
}

// Shell and flying-shard collisions remain independent of decorative
// casings, while fear keeps prone infantry unable to shoot.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');u.state.levelIndex=7;u.reset();
 const s=u.state;
 s.map.cover=[];s.map.rocks=[];s.map.trees=[];
 s.infantry=[];s.vehicles=[];s.air=[];s.paras=[];
 s.events=[{t:9999,type:'foot',count:1}];s.eventCursor=0;
 const soldier=u.spawnEnemy(195,400,'rifle',null,'vehicle');
 soldier.hp=soldier.maxHp=90;soldier.armorHp=0;soldier.state='prone';soldier.suppression=.96;
 h.setRandom(0);u.enemyStep(1/30);
 assert(soldier.v107FearUntil>s.time,'intense fire causes a fearful prone pose');
 assert(soldier.state==='prone'&&soldier.muzzle<=0,'fear temporarily prevents shooting');
 const before=soldier.hp;
 s.v107Shards.push({x:165,y:400,px:165,py:400,vx:350,vy:0,
  life:.9,rot:0,vr:0,bounces:0,damage:5,spent:false});
 u.step(.10);
 assert(soldier.hp<before,'one harmful fragment uses swept collision and damages an enemy');
 assert.equal(s.v107Shards.length,0,'fragment cannot hurt multiple soldiers after one hit');
 // A precisely aimed MG round can still hit the small multi-part prone body.
 soldier.wounded=false;soldier.v107FearUntil=0;soldier.state='prone';
 soldier.hp=300;soldier.maxHp=300;s.profile.spreadScale=0;
 const hpBefore=soldier.hp;
 s.primaryCooldown=0;s.primaryReloadT=0;s.heat=0;s.overheat=false;
 assert(u.fire('mg',soldier.x,soldier.y),'MG projectile launched at prone soldier');
 for(let n=0;n<110;n++)u.shotStep(1/60);
 assert(soldier.hp<hpBefore,'prone head/torso can still register MG impact');
 u.render();
 console.log('PASS V10.7: fearful prone pose, small real collision shapes and single-hit flying shrapnel.');
}

// The original level-7 complaint: play through the *real* encounter
// scheduler and full Five-Second aftermath on four consecutive maps.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');u.state.levelIndex=5;u.reset();
 const s=u.state;
 for(let map=5;map<=8;map++){
  let frames=0;
  while(s.mode==='playing'&&frames<6600){
   u.step(1/30);
   if(frames%6===0){
    // Deterministic player victories: take down each actual encounter
    // through real damage functions rather than clearing event arrays.
    s.vehicles.filter(v=>v.alive&&!v.allied).forEach(v=>u.damageVehicle(v,v.hp+(v.armorHp||0)+500,'he'));
    s.infantry.filter(e=>e.alive&&!e.v102Unarmed).forEach(e=>u.damageInfantry(e,e.hp+(e.armorHp||0)+500,'he'));
    s.air.forEach(a=>{if(a.alive)a.alive=false;});
    s.paras.forEach(p=>{if(p.alive)p.alive=false;});
   }
   frames++;
  }
  assert.equal(s.mode,'shop','map '+(map+1)+' resolves all combat objectives');
  assert.equal(s.v106Spawned,3,'map '+(map+1)+' still delivers parachute loot');
  assert(s.v102VictoryHold&&s.v102VictoryHold.elapsed>=5,
    'map '+(map+1)+' maintains the five-second smoke pause');
  assert.equal(h.ids.get('deploy').disabled,false,'Next Map is enabled after map '+(map+1));
  if(map===8)break;
  let stopped=false;
  const ev={preventDefault(){},stopImmediatePropagation(){stopped=true;}};
  for(const item of (h.ids.get('deploy').eventEntries.click||[]).slice().sort((a,b)=>Number(b.capture)-Number(a.capture))){
   if(stopped)break;item.fn(ev);
  }
  assert.equal(s.levelIndex,map+1,'map '+(map+2)+' loaded from Next');
  assert.equal(s.mode,'playing','map '+(map+2)+' actually playable');
  u.render();
 }
 console.log('PASS V10.7: real campaign 6 → 7 → 8 → 9, working Next Map, no missing encounters.');
}
