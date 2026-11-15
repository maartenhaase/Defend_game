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
 assert(s.events.every(e=>e.t<39),'spawns paced and finite '+i);
 assert(s.events.length<=5,'not an overwhelming number of waves '+i);
 assert.equal(s.profile.primaryMag,9+Math.floor(i/6)*3,'three-burst magazines scale slowly '+i);
 assert(s.profile.primaryReload>=1.65,'reload remains noticeable '+i);
 assert(!['coast','snow','desert','jungle'].includes(m.theme),'no sudden beach/desert/ice jumps');
 assert(m.name===undefined||m.title===t.levels[i].name,'map identity '+i);
 const expected={rate:0,range:0,armor:0,special:0};
 for(let k=0;k<i;k++)expected[['rate','range','armor','special'][k%4]]++;
 for(const key of Object.keys(expected))assert.equal(s.save.upgrades[key],expected[key],'automatic upgrade '+key+' map '+i);
 const f=units.reduce((n,e)=>n+e.count,0),v=vehicles.length;
 assert(f>=prevInf&&v>=prevVehicle,'strictly non-decreasing difficulty at map '+i);
 prevInf=f;prevVehicle=v;
 if(i===0){
  assert.equal(s.events.length,1,'first map has exactly one encounter');
  assert.equal(f,0,'first map no foot soldiers');
  assert.equal(v,1,'first map one vehicle');
  assert.equal(vehicles[0].passengersOverride,0,'no passenger reinforcements in first car');
  assert.equal(s.profile.primaryMag,9,'3x3 bullets');
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
  assert(s.flak9950.shots[0].vehicleDamage<=10,'flak starts weak');
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
console.log('PASS: 30 progressive missions, single slow vehicle in level 1, three 3-shot bursts, single weak Flak, upgrades, continent geography and iPhone rendering.');

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
 // Don't rely on a guessed delay from the previous game update:
 // the actual victory hold must stay visible for >=5 game seconds.
 while(s.v102VictoryHold.elapsed<4.75)u.step(1/30);
 assert.equal(s.mode,'playing','result dialog cannot cover the burning wreck too early');
 for(let n=0;n<25&&s.mode==='playing';n++)u.step(1/30);
 assert.equal(s.mode,'shop','victory screen finally appears after 5 seconds');
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
 console.log('PASS: iPhone Next Map click, true wreck destruction, unarmed evacuation, and five-second burning pause.');
}
