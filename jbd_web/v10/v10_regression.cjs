'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadGame}=require('../v9_9_53/battle_regression.cjs');
const dir=__dirname,html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),code=fs.readFileSync(path.join(dir,'game.js'),'utf8');
assert.match(html,/mapSelectV10/,'iPhone test selector');
assert.match(html,/30 MAPS/,'30-map menu');
assert.match(code,/V10_ROAD/,'New progressive campaign');
const g=loadGame(dir),t=g.t;
t.start('easy');
assert.equal(t.levels.length,30);
assert.equal(t.tour.length,30);
const titles=new Set(),signatures=new Set(),biomes=new Set(),features=new Set();
let prevInf=-1,prevVehicle=-1;
for(let i=0;i<30;i++){
 t.state.levelIndex=i;t.reset();
 const s=t.state,m=t.tour[i],units=s.events.filter(e=>e.type==='foot'),
       vehicles=s.events.filter(e=>['jeep','scoutcar','truck','trooptruck','lighttruck','halftrack'].includes(e.type));
 assert.equal(s.mode,'playing','map starts '+i);
 assert(s.map.v10RouteSignature,'new geography '+i);
 assert(s.map.v10RouteSignature.startsWith('ROAD-'+String(i+1).padStart(2,'0')),'unique map geometry '+i);
 assert(s.shortBattle&&s.shortBattle.maxDuration>=90,'no ultra-short time pressure '+i);
 assert(s.events.every(e=>e.t<50),'finite staggered encounters '+i);
 assert(s.events.length<=14,'bounded variety of waves '+i);
 assert.equal(s.profile.primaryMag,Math.min(60,12+3*Math.floor(i/2)+3*Math.floor(i/5)),'magazine improves quickly '+i);
 assert(s.profile.primaryReload>=.95,'reload remains noticeable '+i);
 assert(!['coast','snow','desert','jungle'].includes(m.theme),'no sudden beach/desert/ice jumps');
 assert(m.name===undefined||m.title===t.levels[i].name,'map identity '+i);
 const expected={rate:Math.min(20,Math.round(i*1.30)),special:Math.min(20,Math.round(i*1.55)),range:Math.min(20,Math.floor(i*.86)),armor:Math.min(20,Math.floor(i*.70))};
 for(const key of Object.keys(expected))assert.equal(s.save.upgrades[key],expected[key],'automatic upgrade '+key+' map '+i);
 const f=units.reduce((n,e)=>n+e.count,0),v=vehicles.length;
 if(i>0){assert(v>=2,'more than one vehicle from map 2: '+i);assert(f>=2,'infantry joins from map 2: '+i);}
 if(i>=6)assert(v>=4,'varied vehicle columns by map 7: '+i);
 prevInf=f;prevVehicle=v;
 if(i===0){
  assert.equal(s.events.length,1,'first map has exactly one encounter');
  assert.equal(f,0,'first map no foot soldiers');
  assert.equal(v,1,'first map one vehicle');
  assert.equal(vehicles[0].passengersOverride,0,'no passenger reinforcements in first car');
  assert.equal(s.profile.primaryMag,12,'four 3-shot salvos in tutorial');
  assert.equal(s.save.upgrades.rate,0,'no advanced gun in first map');
  for(let n=0;n<135;n++)t.step(1/30);
  assert.equal(s.vehicles.length,1,'one actual spawned vehicle');
  assert.equal(s.infantry.length,0,'no extra infantry');
  assert.equal(s.vehicles[0].hasMG,false,'unarmed tutorial target');
  assert(s.vehicles[0].speed<40,'tutorial vehicle really slow');
  const flak=g.ids.get('jbdFlakFire9951');
  assert(flak,'flak button exists');
  flak.eventEntries.click[0].fn({preventDefault(){},stopPropagation(){}});
  assert(s.flak9950&&s.flak9950.shots.length===1,'flak releases exactly ONE shell');
  assert(s.flak9950.shots[0].vehicleDamage>=15,'flak is useful from map one');
  t.fpsInput(s.vehicles[0].x,s.vehicles[0].y);
  assert(s.fps9950&&s.fps9950.queued.length>=2&&s.fps9950.queued.length<=3,'tap starts 3-shot salvo');
 }
 if(i===9||i===17||i===29)t.render();
 titles.add(m.title);signatures.add(s.map.v10RouteSignature);biomes.add(m.theme);features.add(m.feature);
}
assert.equal(titles.size,30,'all 30 map names differ');
assert.equal(signatures.size,30,'all 30 terrain signatures differ');
assert(biomes.size>=5,'geographic environments evolve');
assert(features.size>=7,'varied obstacle terrain');
assert.equal(t.tour[0].theme,'village');
assert.equal(t.tour[29].theme,'metropolis');
console.log('PASS V10.5: 30 missions, fast magazine and skill upgrades, multiple earlier vehicles, mixed infantry, varied terrain and iPhone rendering.');

// V10.2: test the exact problem shown in the iPhone screenshot.
// Do NOT award a map while the vehicle is parked, disabled or still alive.
// Destroy the actual target, observe the wreck for at least five seconds,
// then verify the Next Map button is ENABLED and switches to map 2.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');
 const s=u.state;
 for(let n=0;n<140;n++)u.step(1/30);
 const car=s.vehicles[0];
 assert(car&&car.alive,'tutorial car is a real live target');
 assert.equal(s.events.length,1,'exactly one vehicle encounter');
 assert(car.y>100,'first car is visible beneath the HUD');
 assert.equal(s.mode,'playing','map 1 did not end just because the car was parked');
 assert.equal(s.v102VictoryHold,null,'no premature fireworks');
 assert(s.levelTime>3.5,'the first map has enough time for aiming');
 u.damageVehicle(car,car.hp+100,'he');
 assert(!car.alive&&s.v102IntroDestroyed,'car is genuinely destroyed');
 for(let n=0;n<25;n++)u.step(1/30);
 assert(s.v102VictoryHold,'destruction starts a visible cinematic aftermath');
 assert(s.infantry.filter(x=>x.v102Unarmed).length>=2,'unarmed crew escape from first car');
 const bulletsBefore=s.enemyShots.length;
 const unarmed=s.infantry.find(x=>x.v102Unarmed&&x.alive);
 if(unarmed)u.enemyFire(unarmed);
 assert.equal(s.enemyShots.length,bulletsBefore,'crew cannot fire any weapons');
 assert.equal(h.ids.get('jbdLadderPanel925').style.display,'none',
  'obsolete STRIKE/REINFORCEMENTS overlay is hidden on iPhone');
 const fugitives=s.infantry.filter(x=>x.v102Unarmed&&x.alive);
 assert(fugitives.every(x=>x.role==='medic'&&x.state==='panic'),
  'evacuees reuse proper native sprite atlas and consistent running animation');
 const prev=fugitives.map(x=>x.x);
 for(let n=0;n<10;n++)u.step(1/30);
 for(let k=0;k<fugitives.length;k++)
  assert((fugitives[k].x-prev[k])*fugitives[k].v102ExitSide>=0,
   'crew flees monotonically instead of switching direction');
 const ammoBefore=s.primaryAmmo;
 assert(u.fpsInput(car.x,car.y),'MG remains fireable during victory celebration');
 assert(s.primaryAmmo<ammoBefore||s.fps9950.queued.length>0,
  'gun really shoots during the five-second afterburn');
 // Reproduce the screenshot's actual failure: one unrelated soldier
 // sneaks into the game while the wreck countdown is on screen.
 // Even then 0s must ALWAYS resolve to the results screen.
 const intruder=u.spawnEnemy(185,190,'rifle',null,'vehicle');
 assert(intruder.alive,'regression creates additional contact');
 // Don't rely on a guessed delay from the previous game update:
 // the actual victory hold must stay visible for >=5 game seconds.
 while(s.v102VictoryHold.elapsed<4.75)u.step(1/30);
 assert.equal(s.mode,'playing','result dialog cannot cover the burning wreck too early');
 for(let n=0;n<25&&s.mode==='playing';n++)u.step(1/30);
 assert.equal(s.mode,'shop','victory screen must appear at 0s even if extra enemies spawned');
 assert.equal(h.ids.get('deploy').disabled,false,'Next Map is clickable, not disabled by legacy shop');
 assert.equal(h.ids.get('shop').style.display,'none','no forced upgrade shop');
 let stopped=false;
 const ev={preventDefault(){},stopImmediatePropagation(){stopped=true;}};
 const entries=(h.ids.get('deploy').eventEntries.click||[]).slice()
  .sort((a,b)=>Number(b.capture)-Number(a.capture));
 for(const entry of entries){if(stopped)break;entry.fn(ev);}
 assert.equal(s.levelIndex,1,'Next Map really advances to map 2');
 assert.equal(s.mode,'playing','map 2 is playable after click');
 assert(s.map.v10RouteSignature.startsWith('ROAD-02'),'the right terrain is loaded');
 console.log('PASS V10.3: Next Map click, actual wreck, fluent native-sprite crew, shooting while burning, no support overlay, and a guaranteed result after 5s despite an intruder.');
}


// V10.4: reproduce a real mid-campaign softlock. A stationary vehicle
// catches fire, appears to have no shootable hitbox and must still
// complete by the *ordinary* kill -> 5-second wreck -> Next Map path.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');u.state.levelIndex=2;u.reset();
 const s=u.state;
 for(let n=0;n<120;n++)u.step(1/30);
 const car=s.vehicles.find(v=>v.alive&&!v.allied);
 assert(car,'map 3 starts with a real target vehicle');
 s.eventCursor=s.events.length;s.infantry=[];s.air=[];s.paras=[];
 car.currentSpeed=0;car.speed=0;car.state='smoulder9941';
 car.fuelIgnited=true;car.burnPhase9941='cookoff';
 car.burnPlan9941='ammo';car.fuelBurnT=120;car.fuelBurnDuration9937=120;
 for(let n=0;n<230&&s.mode==='playing'&&!s.v102VictoryHold;n++)u.step(1/30);
 assert(!car.alive,'immobile burning target eventually genuinely destroyed');
 assert(s.v102VictoryHold,'burnout starts the proper five-second aftermath');
 const start=s.v102VictoryHold.elapsed;
 for(let n=0;n<190&&s.mode==='playing';n++)u.step(1/30);
 assert.equal(s.mode,'shop','map 3 cannot be stuck with a burning wreck forever');
 assert.equal(h.ids.get('deploy').disabled,false,'Next Map available after burnout');
 console.log('PASS V10.4: burning, untargetable map-3 vehicle is actually destroyed and the level finishes.');
}

// V10.4: a fatal shot leads through a visible fall, and ammunition
// cook-off produces longer, gravity-curved projectiles.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');u.state.levelIndex=2;u.reset();
 const s=u.state;
 s.events=[];s.eventCursor=0;
 const enemy=u.spawnEnemy(190,280,'rifle',null,'vehicle');
 enemy.hp=5;enemy.armorHp=0;
 u.damageInfantry(enemy,100,'mg');
 assert.equal(enemy.alive,false,'fatal hit actually kills');
 assert(enemy.v104Fall,'fatal hit schedules a fall animation');
 for(let n=0;n<18;n++)u.step(1/30);
 assert(enemy.deadT>=.48,'corpse spends frames in the falling state');
 assert(enemy.v104Fall.thud,'fall makes a landing/thud event');
 u.render();
 const v={x:190,y:380,cookoffShots9943:0};
 const f=u.field();
 const previous=f.bullets.length;
 u.ammoEmit(v,Math.PI*1.5);
 assert.equal(f.bullets.length,previous+1,'one cartridge escapes the vehicle');
 const b=f.bullets[f.bullets.length-1];
 assert.equal(b.v104Arc,true,'cartridge has ballistic arc metadata');
 assert(b.life>=.58,'ammo now travels further than the old short streak');
 const vy=b.vy;
 u.ammoStep(1/30);
 assert(b.vy>vy,'cartridge curves under gravity on each frame');
 console.log('PASS V10.4: infantry fall, body-impact reaction, extended curved ammo trails.');
}


// V10.5: upgrades actually increase the number of bullets, blast
// count, damage feedback and available enemy assets early in the game.
{
 const h=loadGame(dir),u=h.t;
 u.start('easy');
 u.state.levelIndex=2;u.reset();
 const s=u.state;
 assert(s.events.filter(e=>['jeep','scoutcar','truck','trooptruck','lighttruck','halftrack'].includes(e.type)).length>=2,
  'map 3 already has multiple vehicle contacts');
 assert(s.events.some(e=>e.type==='foot'),'map 3 already includes infantry');
 for(let k=0;k<113;k++)u.step(1/30);
 const car=s.vehicles.find(v=>v.alive&&!v.allied);
 assert(car&&car.hasMG,'map 3 enemy patrol can actually fire back');
 s.bunkerGraceT=0;
 const before=s.bunker.hp,shot={kind:'rifle',x:s.bunker.x,y:s.bunker.y,
    vx:0,vy:550,dmg:1.4,sourceX9910:s.bunker.x,sourceY9910:s.bunker.y-180};
 const damage=u.bunkerBulletDamage(shot);
 u.damageBunker(damage);
 assert(before-s.bunker.hp>=1,'real bunker hit visibly reduces HP');
 assert(s.v105HitT>0&&s.v105LastHit>=1,'visible on-screen damage reaction');
 u.state.levelIndex=3;u.reset();
 const lvl4=u.state;
 const flak=h.ids.get('jbdFlakFire9951');
 assert(flak,'FLAK fire button present');
 flak.eventEntries.click[0].fn({preventDefault(){},stopPropagation(){}});
 assert(lvl4.flak9950&&lvl4.flak9950.shots.length===2,
   'FLAK unlocks two genuinely aimed shells by map 4');
 u.state.levelIndex=10;u.reset();
 assert(u.state.events.some(e=>e.type==='plane'),'aircraft appear during the first third of the route');
 assert(u.state.events.some(e=>e.vehicleId&&e.vehicleId.indexOf('quad')>=0),
   'quad scout vehicles use the existing sprite atlas');
 u.state.levelIndex=13;u.reset();
 assert(u.state.events.some(e=>e.vehicleId&&e.vehicleId.indexOf('cavalry')>=0),
   'cavalry encounter uses the existing mounted soldier assets');
 u.render();
 console.log('PASS V10.5: enemy MG fires by map 3, real HP damage, two-shell FLAK by map 4, aircraft, quad and cavalry.');
}
