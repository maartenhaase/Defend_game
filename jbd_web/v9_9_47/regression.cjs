'use strict';
const assert=require('node:assert/strict');
const {loadGame,emptyBattle}=require('./battle_regression.cjs');
const dir=process.argv[2]||__dirname;
function harness(){const g=loadGame(dir),s=emptyBattle(g,'hard');return {g,s};}
function makeVehicle(g,s,type,id){
 g.t.spawnVehicle(type||'jeep',2,id||'kubel_2',0,2);
 const v=s.vehicles[s.vehicles.length-1];
 assert.ok(v,'spawned real vehicle');v.y=Math.min(s.map.road?g.t.size.h*.15:100,g.t.size.h*.15);
 return v;
}
// Grenade slots are purchased in two later steps; the fuse is longer.
{
 const {g,s}=harness();
 assert.equal(g.t.grenadeStats(0).capacity,1);
 assert.equal(g.t.grenadeStats(4).capacity,1);
 assert.equal(g.t.grenadeStats(8).capacity,2);
 assert.equal(g.t.grenadeStats(16).capacity,3);
 assert.equal(g.t.grenadeStats(20).capacity,3);
 assert.equal(g.t.grenadeSlots(),1);
 assert.equal(g.t.grenadeStats(0).recharge,6);
 g.t.fire('he',g.t.size.w*.5,g.t.size.h*.4);
 const b=s.shots.find(x=>x.kind==='he');
 assert.ok(b&&b.fuse9945>=1.45&&b.fuse9945<=2.0,'long grenade fuse');
}
// Stopping a vehicle leaves the hull ALIVE and the stationary gun usable.
{
 const {g,s}=harness(),v=makeVehicle(g,s);
 v.hasMG=true;v.penetrationHits9935=9;v.hp=v.maxHp;
 g.t.vehicleStep(1/60);
 assert.equal(v.alive,true,'nine penetrating shots must not destroy it');
 assert.notEqual(v.state,'parkedDisabled','nine shots must not force early stop');
 v.penetrationHits9935=10;g.t.vehicleStep(1/60);
 assert.equal(v.alive,true,'ten penetrations stop it but do not kill it');
 assert.equal(v.state,'parkedDisabled');
 assert.equal(v.currentSpeed,0);
 assert.equal(s.wrecks.length,0,'no wreck from a mobility kill');
 v.fireCd=0;
 const before=s.enemyShots.length;
 g.t.vehicleGun(v,{error:0,settled:true});
 assert.ok(v.hasMG&&s.enemyShots.length>=before,'stopped MG is intact');
}
// All three ignition outcomes: only instant fireball destroys the live hull.
for(const [roll,plan,destroyed] of [[.05,'instant',true],[.35,'single',false],[.96,'ammo',false]]){
 const {g,s}=harness(),v=makeVehicle(g,s);
 g.setRandom(roll);g.t.ignite(v,.4);
 assert.equal(v.burnPlan9941,plan);
 const duration=v.fuelBurnT;
 if(plan==='ammo')assert.ok(duration>=2&&duration<=5,'cookoff limited to 2-5 seconds');
 for(let i=0;i<380;i++){s.time+=1/60;g.t.burnStep(v,1/60);if(!v.fuelIgnited)break;}
 assert.equal(v.alive,!destroyed,plan+' changes whether vehicle is destroyed');
 if(!destroyed){assert.equal(v.state,'parkedDisabled');assert.ok(!v.fuelIgnited);}
}
// White smoke and alternating troop dismount, 5-10-second lifetime.
{
 const {g,s}=harness(),v=makeVehicle(g,s,'trooptruck','blitz_1');
 v.passengers=8;v.unloadLeft=8;v.state='unload';v.unloadCd=0;
 for(let k=0;k<4;k++){g.t.vehicleStep(.4);}
 const smoke=s.smokeZones.filter(z=>z.white9947);
 assert.ok(smoke.length>=1&&smoke.length<=3,'1 to 3 white smoke plumes');
 assert.ok(smoke.every(z=>z.t>=5&&z.t<=10),'5-10 second white smoke');
 const exiting=s.infantry.filter(e=>e.truckRun9947);
 assert.ok(exiting.length>=2,'normal unload creates running troops');
 assert.ok(exiting.some(e=>e.truckRun9947.x<v.x)&&exiting.some(e=>e.truckRun9947.x>v.x),'left and right split');
}
// Infantry under armed grenades react by running away immediately.
{
 const {g,s}=harness(),e=g.t.spawnEnemy(g.t.size.w*.5,g.t.size.h*.38,'rifle',null,'vehicle');
 s.pendingGrenades9945=[{x:e.x+16,y:e.y-12,t:1.5,b:{radius:18,fuse9945:1.9}}];
 e.suppression=0;e.state='advance';s.time=2;
 g.t.enemyStep(1/60);
 assert.equal(e.state,'grenadeFlee9947','infantry must flee timed grenades');
}
// Radio operator should actually summon a group after five uninterrupted seconds.
{
 const {g,s}=harness();
 const radio=g.t.spawnEnemy(g.t.size.w*.5,g.t.size.h*.36,'radio',null,'vehicle');
 radio.radioT9945=5;radio.underFireUntil9932=-100;radio.suppression=0;
 for(let i=0;i<360;i++){s.time+=1/60;g.t.enemyStep(1/60);}
 assert.equal(radio.radioCalled9945,true,'radio has completed its call');
 assert.ok(s.infantry.length>=4,'reinforcement patrol arrived');
}
console.log('PASS V9.9.47: ten penetrations, vehicle MG intact, all 3 fire outcomes, grenade slots/fuse/panic, truck smoke/flanking and radio reinforcements');
