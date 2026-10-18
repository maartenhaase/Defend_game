'use strict';
const assert=require('node:assert/strict');
const {loadGame,emptyBattle}=require('./battle_regression.cjs');
const dir=process.argv[2]||__dirname;
function truck(g,s,plan,x=195,y=400,allied=false){g.t.spawnVehicle('trooptruck',6,'blitz_1',0,6);const v=s.vehicles.at(-1);v.x=x;v.y=y;v.passengers=v.unloadLeft=6;v.hasMG=false;v.state='driverless9935';if(allied){s.vehicles.pop();v.allied=true;s.arcade.armor.push(v);}g.setRandom(.5);g.t.ignite(v);v.burnPlan9941=plan;v.fuelBurnT=plan==='instant'?.25:plan==='single'?24:30;v.fuelBurnDuration9937=v.fuelBurnT;v.firstPopAt9941=.2;return v;}
function seconds(g,s,t,fn){for(let i=0;i<Math.ceil(t*60);i++){s.time+=1/60;g.clock(1000/60);fn(1/60);}}
// Actual pointer capture handlers, exact burst count/aim, no endless fire and magazine boundaries.
for(const width of [320,390,844]){
 const g=loadGame(dir,{width,height:844}),s=emptyBattle(g,'hard');s.aim={x:width*.3,y:300};
 g.pointer('pointerdown',width*.3,300);g.clock(40);g.pointer('pointerup',width*.3,300);assert.equal(s.stats.shots,1);
 seconds(g,s,.4,dt=>g.playerTick(dt));assert.equal(s.stats.shots,5);assert.equal(s.primaryAmmo,35);
 seconds(g,s,2,dt=>g.playerTick(dt));assert.equal(s.stats.shots,5);
 s.primaryAmmo=2;g.pointer('pointerdown',width*.7,310);g.clock(40);g.pointer('pointerup',width*.7,310);seconds(g,s,.5,dt=>g.playerTick(dt));assert.equal(s.stats.shots,7);assert.equal(s.primaryAmmo,0);
 g.pointer('pointerdown',100,300);g.clock(40);g.pointer('pointerup',100,300);assert.ok(s.primaryReloadT>0);seconds(g,s,3,dt=>g.playerTick(dt));assert.equal(s.stats.shots,7,'reload never resumes an old burst');assert.equal(s.primaryAmmo,40);
}
// A real full explosion kills nearby people on both sides and throws vehicle parts.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard'),v=truck(g,s,'instant');
 const enemy=g.t.spawnEnemy(215,400,'rifle',null,'vehicle'),ally=g.t.createAlly(175,400,'rifle');s.arcade.allies.push(ally);
 enemy.hp=enemy.maxHp=90;ally.hp=ally.maxHp=90;enemy.armorHp=ally.armorHp=0;
 seconds(g,s,.4,dt=>g.t.burnStep(v,dt));assert.ok(!v.alive&&!enemy.alive&&!ally.alive);assert.equal(s.stats.vehicleKills,1);assert.ok(s.effects.filter(e=>e.type==='vehiclePart').length>=15);
}
// Cookoff rounds hit the first actual soldier, regardless of team; cover blocks them.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard'),v=truck(g,s,'ammo',100,400);g.t.burnStep(v,.21);
 assert.equal(v.burnPhase9941,'cookoff');assert.equal(v.trappedCasualties9941.length,0);s.infantry=[];s.arcade.allies=[];
 const e=g.t.spawnEnemy(170,400,'rifle',null,'vehicle'),a=g.t.createAlly(235,400,'rifle');s.arcade.allies.push(a);e.hp=e.maxHp=a.hp=a.maxHp=100;e.armorHp=a.armorHp=0;
 g.t.ammoEmit(v,0);seconds(g,s,.5,dt=>g.t.ammoStep(dt));assert.ok(e.hp<100);assert.equal(a.hp,100,'first soldier intercepts round');
 e.alive=false;g.t.ammoEmit(v,0);seconds(g,s,.5,dt=>g.t.ammoStep(dt));assert.ok(a.hp<100,'allied soldier can be hit by identical cooking ammo');
 a.hp=100;s.map.cover=[{kind:'sandbag',x:155,y:400,integrity:7,len:18,destroyed:false}];g.t.ammoEmit(v,0);seconds(g,s,.5,dt=>g.t.ammoStep(dt));assert.equal(a.hp,100,'solid sandbags block fragments/rounds');
 const medic=g.t.spawnEnemy(130,450,'medic',null,'vehicle');medic.vehiclePatient9941=e;medic.medicPatient9938=e;g.t.fieldRole(medic,.1);assert.equal(medic.vehiclePatient9941,null);assert.equal(medic.medicPatient9938,null);assert.ok(medic.ammoEscape9943);
 assert.equal(g.t.field().responders.length,0,'no one extinguishes cookoff');
}
// Actual randomized cookoff duration covers 15..60s and ends once, as a black wreck.
for(const r of [0,.999999]){
 const g=loadGame(dir),s=emptyBattle(g,'hard');g.t.spawnVehicle('trooptruck',0);const v=s.vehicles[0];g.setRandom(.8);g.t.ignite(v); // select ammo
 // Duration bounds are tested independently from event selection, with the public initializer's output.
 assert.ok(v.fuelBurnT>=15&&v.fuelBurnT<=60.3);
 const duration=v.fuelBurnT;seconds(g,s,duration+.1,dt=>g.t.burnStep(v,dt));assert.ok(!v.alive&&s.wrecks.at(-1).burntOut9941);assert.equal(s.stats.vehicleKills,1);
}
// The responder limit is global across both sides. Existing soldiers take up actual extinguishers.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard');s.time=10;const vs=[truck(g,s,'single',90,320),truck(g,s,'single',290,320,true),truck(g,s,'single',190,520)];
 vs.forEach(v=>{g.t.burnStep(v,.21);v.passengers=0;});s.infantry=[];s.arcade.allies=[];
 for(const [v,i] of vs.map((v,i)=>[v,i]))for(let j=0;j<2;j++){
  const u=v.allied?g.t.createAlly(v.x+45+j*5,v.y-5,'engineer'):g.t.spawnEnemy(v.x+45+j*5,v.y-5,'engineer',null,'vehicle');u.hp=u.maxHp=100;if(v.allied)s.arcade.allies.push(u);
 }
 g.t.firefighters();assert.equal(g.t.field().responders.length,2);assert.equal(new Set(g.t.field().responders.map(u=>u.extinguishTarget9943)).size,2);
 const first=g.t.field().responders[0],target=first.extinguishTarget9943;let foam=false;
 seconds(g,s,6.5,dt=>{g.t.fieldRole(first,dt);foam=foam||g.t.field().foam.length>0;});assert.ok(foam&&target.extinguished9943);assert.ok(s.fireZones.filter(z=>z.vehicleSource9943===target).every(z=>z.t===0));
 g.t.firefighters();assert.ok(g.t.field().responders.length<=2);assert.ok(g.t.field().responders.every(u=>u.alive));
}
// Both factions build real cover, pause under fire and resume only after a quiet interval.
for(const allied of [false,true]){
 const g=loadGame(dir),s=emptyBattle(g,'hard');s.time=10;const u=allied?g.t.createAlly(250,360,'engineer'):g.t.spawnEnemy(250,360,'engineer',null,'vehicle');if(allied)s.arcade.allies.push(u);u.postKind9943='radio';u.buildSite9943={x:250,y:360};u.quietT9943=3;
 seconds(g,s,3,dt=>g.t.fieldRole(u,dt));const progress=u.buildProgress9943;assert.ok(progress>2);
 g.t.damageInfantry(u,.1,'mg');seconds(g,s,4,dt=>g.t.fieldRole(u,dt));assert.equal(u.buildProgress9943,progress,'under-fire progress pauses');
 seconds(g,s,11,dt=>g.t.fieldRole(u,dt));assert.equal(g.t.field().posts.length,1);const p=g.t.field().posts[0];assert.equal(p.stage,'sandbags');assert.equal(p.bags.length,3);assert.ok(p.bags.every(b=>s.map.cover.includes(b)));
 seconds(g,s,15,dt=>g.t.fieldRole(u,dt));assert.equal(p.stage,'radio');assert.equal(u.role,'radio');
 const patient=allied?g.t.createAlly(250,360,'rifle'):g.t.spawnEnemy(250,360,'rifle',null,'vehicle');if(allied)s.arcade.allies.push(patient);patient.hp=patient.maxHp=100;patient.armorHp=0;patient.state='advance';patient.x=250;patient.y=360;g.t.damageInfantry(patient,10,'cookoff');assert.ok(patient.hp>95,'constructed post gives real additional protection');
 g.t.radioDrop(p,allied?25:6);assert.equal(p.dropCount,allied?25:6);assert.equal(g.t.radioDrop(p,25),false,'radio can call only one wave per level');
 seconds(g,s,24,dt=>{g.t.postStep(dt);if(allied)g.t.allyStep(dt);else g.t.enemyStep(dt);});
 const pool=allied?s.arcade.allies:s.infantry;assert.equal(pool.filter(e=>e.radioElite9943).length,p.dropCount);assert.ok(pool.filter(e=>e.radioElite9943).every(e=>!e.parachute&&e.alive),'elite paras really descend and land');
 g.t.render();
}
// A nearby real MG team upgrades and mans a built position; the engineer is its assistant.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard');s.time=10;const u=g.t.createAlly(250,360,'engineer'),mg=g.t.createAlly(250,360,'lmg');s.arcade.allies=[u,mg];u.postKind9943='mg';const p=g.t.postCreate(u,{x:250,y:360});
 seconds(g,s,13,dt=>{g.t.fieldRole(u,dt);g.t.fieldRole(mg,dt);});assert.equal(p.stage,'mg');assert.equal(mg.postGunner9943,p);assert.equal(u.postSupport9943,p);
}
console.log('PASS V43: five-shot gestures; strong blast collateral/parts; cookoff friendly fire, cover, evacuation and duration; global two-firefighter cap and white powder; engineers pause, construct real cover, MG/radio and 6/25 elite parachutists.');

// Full normal AI loops must preserve roadside tasks and let both factions escape the hazard.
for(const allied of [false,true]){
 const g=loadGame(dir),s=emptyBattle(g,'hard');s.time=10;s.map.corridorHalf=29;s.map.road.x=195;s.map.road.width=44;
 const u=allied?g.t.createAlly(224,350,'engineer'):g.t.spawnEnemy(224,350,'engineer',null,'vehicle');if(allied)s.arcade.allies.push(u);u.postKind9943='radio';
 seconds(g,s,45,dt=>{if(allied)g.t.allyStep(dt);else g.t.enemyStep(dt);g.t.effectsStep(dt);});
 assert.ok(g.t.field().posts.length>0,'full '+allied+' AI constructs beside the narrow road');const p=g.t.field().posts[0];assert.ok(Math.abs(p.x-195)>40);assert.equal(p.stage,'radio');
 const v=truck(g,s,'ammo',195,420);g.t.burnStep(v,.21);u.x=220;u.y=420;u.ammoEscape9943=v;
 seconds(g,s,6,dt=>{if(allied)g.t.allyStep(dt);else g.t.enemyStep(dt);});assert.ok(Math.hypot(u.x-v.x,u.y-v.y)>95,'full AI escapes laterally from cooking ammunition');
}
{
 const g=loadGame(dir);g.ids.get('upgradeTestMode').listeners.click[0]();
 for(const plan of ['instant','single','ammo']){g.ids.get('vehicleTest9943').listeners.click[0]();assert.equal(g.t.state.vehicles.at(-1).burnPlan9941,plan);}
 g.ids.get('engineerTest9943').listeners.click[0]();assert.ok(g.t.state.arcade.allies.filter(u=>u.role==='engineer').length>=2);g.t.render();
}
console.log('PASS V43 integration: normal AI builds outside the road, flees cookoff, and real sandbox buttons exercise all three failures plus engineers.');

// An active sixty-second ammunition sequence is not mistaken for a stuck final vehicle.
{
 const g=loadGame(dir),s=emptyBattle(g,'hard');s.bunker.hp=s.bunker.maxHp=100000;s.events=[];s.eventCursor=0;s.shortBattle=null;s.arcade.salvageAt=100000;
 const v=truck(g,s,'ammo');v.fuelBurnT=v.fuelBurnDuration9937=60.2;
 seconds(g,s,59,dt=>g.t.step(dt));assert.ok(v.alive&&v.fuelIgnited,'anti-stall does not retire an active cookoff');assert.equal(s.mode,'playing');
 seconds(g,s,7,dt=>g.t.step(dt));assert.ok(!v.alive,'the same full update eventually finishes the cookoff');
 assert.ok(g.t.field().responders.length<=2);assert.ok(g.t.field().bullets.length<=160);
 for(const u of s.infantry.concat(s.arcade.allies))assert.ok(Number.isFinite(u.x)&&Number.isFinite(u.y));
}
console.log('PASS V43 duration integration: full one-minute cookoff survives anti-stall and ends as intended, with bounded particles/responders and finite positions.');
