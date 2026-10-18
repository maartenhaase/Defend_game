'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {loadGame,emptyBattle}=require('./battle_regression.cjs');
const dir=process.argv[2]||__dirname;
// Upgrade endpoints and per-step progression in the actual game engine.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard');
 assert.equal(g.t.grenadeSlots(),3,'three grenade slots from level zero');
 assert.equal(g.t.grenadeStats(0).recharge,6);
 assert.equal(g.t.grenadeStats(20).recharge,2);
 assert.equal(g.t.grenadeStats(0).capacity,3);
 assert.equal(g.t.grenadeStats(20).capacity,3);
 assert.ok(g.t.grenadeStats(0).impact<30);
 assert.ok(g.t.grenadeStats(20).impact>140);
 assert.ok(g.t.grenadeStats(20).blast>g.t.grenadeStats(0).blast*9);
 assert.equal(g.t.primaryStats(0).damage,6.4);
 assert.equal(g.t.primaryStats(0).penetrationChance,.12);
 s.save.upgrades.range=20;s.save.upgrades.rate=20;
 assert.equal(g.t.primaryStats(0).mag,160);
 assert.ok(g.t.primaryStats(0).penetrationChance>.80);
 assert.ok(g.t.primaryStats(0).reload<1);
 s.save.upgrades.armor=20;
 assert.ok(g.t.profile().maxHp>300);
}
// Infantry role loads and morale casualty cascade.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard');s.time=25;
 const actors=[];
 for(let i=0;i<16;i++){
  const u=g.t.spawnEnemy(90+(i%8)*24,365+Math.floor(i/8)*25,'rifle',null,'vehicle');
  u.armorHp=0;u.hp=u.maxHp=25;u.state='fire';actors.push(u);
 }
 const storm=g.t.spawnEnemy(195,330,'storm',null,'vehicle');storm.state='fire';
 assert.equal(storm.role,'storm');
 assert.equal(storm.weaponName,'MP40');
 for(let i=0;i<4;i++)g.t.damageInfantry(actors[i],500,'mg');
 const prone=actors.slice(4).filter(u=>u.moraleWave9945);
 assert.ok(prone.length>=6,'at least half of remaining infantry dives prone');
 assert.ok(prone.length<=12,'morale panic has bounded share');
 s.time+=6.1;g.t.enemyStep(1/60);
 assert.ok(prone.some(u=>Number.isFinite(u.moraleRiseAt9945)),'soldiers stage their recovery after six seconds without kills');
}
// A burning vehicle loses its gunner and all mobility immediately.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard');
 g.t.spawnVehicle('trooptruck',0,'blitz_1',0,0);
 const v=s.vehicles[0];v.hasMG=true;v.currentSpeed=35;
 g.t.ignite(v,.3);
 assert.equal(v.hasMG,false);
 assert.equal(v.currentSpeed,0);
 assert.equal(v.state,'parkedDisabled');
}
console.log('PASS V9.9.45: grenade curve, ammo/penetration, storm role, morale, burning vehicle gunner.');
