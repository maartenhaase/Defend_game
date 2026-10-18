'use strict';
const assert=require('node:assert/strict');
const {loadGame,emptyBattle}=require('./battle_regression.cjs');
const dir=process.argv[2]||__dirname;
function vehicle(g,s,type='trooptruck'){
 g.t.spawnVehicle(type,6,'blitz_1',0,6);
 const v=s.vehicles.at(-1);
 assert.ok(v);
 return v;
}
// 1. Even a sound vehicle must be slower and must stop/evacuate long before bunker.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard'),v=vehicle(g,s);
 const maxY=Math.min(g.t.size.h*.405,s.bunker.y-g.t.size.h*.32);
 assert.ok(v.baseSpeed<50,'lower top speed');
 assert.ok(v.contactY<=g.t.size.h*.335+.01,'vehicle starts braking early');
 assert.ok(v.finalParkY<=g.t.size.h*.39+.01,'parking line remains distant');
 v.y=maxY+2;v.currentSpeed=24;v.hasMG=true;
 g.t.vehicleStep(1/60);
 assert.equal(v.state,'parkedDisabled');
 assert.equal(v.hasMG,false);
 assert.equal(v.currentSpeed,0);
 assert.equal(v.passengers,0);
 assert.ok(s.infantry.length>=6,'stopped transport unloads its passengers');
 const before=s.enemyShots.length;
 g.t.vehicleGun(v,{error:0,settled:true});
 assert.equal(s.enemyShots.length,before,'halted vehicle never fires');
}
// 2. Internal penetrations: first hit jams MG and slows, then engine dies.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard'),v=vehicle(g,s,'jeep');
 v.x=s.map.road.x;v.y=g.t.size.h*.20;v.penetrationHits9935=1;
 v.hasMG=true;v.currentSpeed=v.speed;
 g.t.vehicleStep(1/60);
 assert.ok(v.alive,'one hit does not erase whole vehicle');
 assert.equal(v.hasMG,false);
 assert.ok(v.currentSpeed<=(v.baseSpeed*.28)+.02,'badly hit vehicles crawl');
 v.penetrationHits9935=2;g.t.vehicleStep(1/60);
 assert.equal(v.alive,false,'two internal hits immobilize normal vehicles');
 assert.ok(s.wrecks.length>=1,'remains as actual cover');
}
// 3. Ammo cookoff lasts seconds, not a minute, while preserving projectiles.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard'),v=vehicle(g,s);
 g.setRandom(.90);g.t.ignite(v);
 assert.equal(v.burnPlan9941,'ammo');
 assert.ok(v.fuelBurnT>=2&&v.fuelBurnT<=5,'ammo burns for 2-5 seconds');
 let active=0;
 for(let i=0;i<320;i++){
  s.time+=1/60;g.t.burnStep(v,1/60);
  if(v.burnPhase9941==='cookoff')active+=1/60;
  if(!v.fuelIgnited)break;
 }
 assert.ok(active>=1.5&&active<5,'shooting phase ends in a few seconds');
 assert.ok(!v.fuelIgnited,'cookoff has stopped after five seconds');
 assert.ok(g.t.field().bullets.length<=42,'bounded tracer count');
 assert.ok(g.t.field().bullets.every(b=>b.life<=.5&&b.damage===11),'short low-clutter rounds');
}
// 4. Infantry reacts to suppression instead of charging blindly.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard'),u=g.t.spawnEnemy(195,g.t.size.h*.40,'rifle',null,'vehicle');
 s.time=12;u.state='advance';u.suppression=.65;u.underFireUntil9932=14;u.reactAt9946=0;
 g.setRandom(.10);g.t.enemyStep(1/60);
 assert.ok(u.reactAt9946>12,'reaction cooldown was applied');
 assert.ok(u.state==='prone'||u.state==='tacticalCover9940'||u.state==='cover',
   'soldier drops or seeks cover under enemy fire');
}
console.log('PASS V9.9.46 mobility, turret shutdown, early stop, safe dismount, 2-5s cookoff, short tracers and infantry reaction');
