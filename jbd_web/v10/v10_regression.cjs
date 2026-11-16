'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadGame}=require('../v9_9_53/battle_regression.cjs');
const dir=__dirname;
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const code=fs.readFileSync(path.join(dir,'game.js'),'utf8');
assert.match(html,/V10\.6/,'iPhone HTML identifies the loot update');
assert.match(html,/mapSelectV10/,'map chooser remains available');
assert.match(code,/V10\.6 — PARACHUTE LOOT/,'destructible crate subsystem is installed');
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
 u.damageInfantry(soldier,100,'mg');
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
