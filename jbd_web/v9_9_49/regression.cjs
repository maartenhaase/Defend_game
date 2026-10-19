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
// Exactly one HE charge at every upgrade; long cooldown and late-stage impact detonation.
{
 const {g,s}=harness();
 for(const lvl of [0,4,8,12,16,20])assert.equal(g.t.grenadeStats(lvl).capacity,1,'only one grenade at level '+lvl);
 assert.equal(g.t.grenadeSlots(),1);
 assert.equal(g.t.grenadeStats(0).recharge,10.5);
 assert.ok(g.t.grenadeStats(20).recharge>=8.5,'even max grenade reload stays long');
 const low=g.t.grenadeStats(0),high=g.t.grenadeStats(20);
 assert.ok(high.impact<74&&high.blast<55&&high.radius<=27,'max grenade blast is tightly capped');
 assert.ok(high.impact>low.impact,'upgrades still feel useful');
 g.t.fire('he',g.t.size.w*.5,g.t.size.h*.4);
 const b=s.shots.find(x=>x.kind==='he');
 assert.ok(b&&b.fuse9945>=2.1,'low upgrade has long timed fuse');
 assert.equal(s.grenadeSlots.length,1,'firing still keeps exactly one grenade slot');
 assert.ok(s.grenadeSlots[0]>=10,'full cooldown starts after firing');
 for(let n=0;n<10;n++)g.t.grenadeReady();
 assert.equal(g.t.grenadeReady(),-1,'grenade remains unavailable while reloading');
 const max=loadGame(dir),m=emptyBattle(max,'hard');m.save.upgrades.special=20;m.profile=max.t.profile();
 max.t.fire('he',max.t.size.w*.5,max.t.size.h*.30);
 const strong=m.shots.find(x=>x.kind==='he');
 assert.equal(strong.fuse9945,0,'max upgrade detonates at impact');
 for(let frame=0;frame<280&&strong.active;frame++)max.t.shotStep(1/60);
 assert.equal(strong.active,false,'grenade completes trajectory');
 assert.ok(!m.pendingGrenades9945||m.pendingGrenades9945.length===0,'impact has no delayed fuse');
 assert.equal(m.grenadeSlots.length,1,'max upgrade does not add a second slot');
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
 for(let i=0;i<(plan==='single'?100:380);i++){const dt=plan==='single'?.5:1/60;s.time+=dt;g.t.burnStep(v,dt);if(!v.fuelIgnited)break;}
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
// Unloading smoke must be a visibly animated particle cloud, not an opaque ellipse.
{
 const {g,s}=harness(),v=makeVehicle(g,s,'trooptruck','blitz_1');
 v.passengers=6;v.unloadLeft=6;v.state='unload';v.unloadCd=0;
 g.t.vehicleStep(.15);
 assert.ok(s.smokeZones.some(z=>z.white9947),'truck dismount emits white smoke zones');
 const firstParticles=s.whiteSmokeParticles9948||[];
 assert.ok(firstParticles.length>=5,'first white puffs appear immediately without waiting for timer');
 const puff=firstParticles[0],firstY=puff.y,firstR=puff.r;
 for(let i=0;i<30;i++)g.t.directorStep(1/60);
 assert.ok(s.whiteSmokeParticles9948.length>=firstParticles.length,'white zones continually emit particles');
 assert.ok(puff.y<firstY,'particles rise over time');
 assert.ok(puff.r>firstR,'particle puffs expand over time');
 assert.ok(s.whiteSmokeParticles9948.every(p=>p.life>1&&p.t>=0),'cloud particles have finite smooth fade lifetimes');
 g.t.drawSmoke();
 for(const z of s.smokeZones)z.t=.01;
 g.t.directorStep(.05);
 assert.equal(s.smokeZones.filter(z=>z.white9947).length,0,'smoke emission stops at expiry');
 assert.ok(s.whiteSmokeParticles9948.length>0,'existing particles linger after smoke grenade expires');
 for(let i=0;i<250;i++)g.t.directorStep(1/60);
 assert.equal(s.whiteSmokeParticles9948.length,0,'cloud completely fades without a hard cut');
 g.t.drawSmoke();
}
// Test map also advances smoke; older sandbox suppressed the smoke update completely.
{
 const {g,s}=harness(),v=makeVehicle(g,s,'trooptruck','blitz_1');
 s.demoSandbox9947=true;v.passengers=6;v.unloadLeft=6;v.state='unload';v.unloadCd=0;
 g.t.vehicleStep(.15);
 const plume=s.smokeZones.find(z=>z.white9947);
 assert.ok(plume,'test map dismount starts smoke');
 const puff=s.whiteSmokeParticles9948[0],beforeY=puff.y,beforeT=plume.t;
 for(let i=0;i<12;i++)g.t.step(1/60);
 assert.ok(plume.t<beforeT,'test map advances smoke zone lifetime');
 assert.ok(puff.y<beforeY,'test map lets smoke rise');
 g.t.drawSmoke();
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
// HARD rebalance: more useful grenades, sturdier bunker, faster fuel ignition and no AP shop.
{
 const {g,s}=harness(),frag=g.t.grenadeStats(0);
 assert.ok(frag.impact>=28&&frag.blast>=21&&frag.radius>=16,'base grenades hit harder and reach farther');
 assert.ok(s.profile.maxHp>100,'starting HARD bunker is stronger than the old 90 HP base');
 const before=s.effects.length;
 g.t.grenadeImpact(195,300,{kind:'he',radius:frag.radius,damage:frag.impact,blastDamage:frag.blast,specialEffect:'blast',visual:0});
 const blast=s.effects.slice(before).find(e=>e.type==='explosion');
 assert.ok(blast&&blast.r>=22,'grenade explosion remains visible without becoming huge');
 assert.ok(s.shake>=2.8,'grenade gives restrained but clear blast kick');
}
{
 const {g,s}=harness(),v=makeVehicle(g,s,'trooptruck','blitz_1');
 g.setRandom(.99);
 for(let i=0;i<3;i++)g.t.gunFuel(v,1);
 assert.ok(v.fuelLeak,'trooptruck starts leaking within three fuel hits');
 assert.ok(!v.fuelIgnited,'initial MG tap cannot instantly ignite fuel');
 s.time+=.55;v.oilRadius=4.45;
 g.t.gunFuel(v,1);
 assert.equal(v.fuelIgnited,false,'first later ignition spark still leaves room to react');
 g.t.gunFuel(v,1);
 assert.equal(v.fuelIgnited,true,'second later spark now sets leaking truck ablaze');
 assert.equal(v.alive,true,'fire does not imply an automatic mobility kill or instant destruction');
}
{
 const {g,s}=harness(),grid=g.ids.get('shopGrid'),supply=g.ids.get('supply'),next=g.ids.get('deploy');
 s.mode='shop';s.save.arsenalPoints=0;
 g.t.shop();
 const buttons=grid.children.slice(-4);
 assert.equal(buttons.length,4,'four upgrade choices');
 assert.ok(buttons.every(b=>!b.disabled),'all upgrades free even with zero points');
 assert.equal(next.disabled,true,'next map requires one chosen upgrade');
 assert.ok(!/PUNT|KOST|POINT/i.test(supply.textContent),'no point currency displayed');
 buttons[2].listeners.click[0]();
 assert.equal(s.save.upgrades.special,4,'chosen upgrade advances by four levels');
 assert.equal(s.shopBought9947,true,'one free choice used');
 assert.equal(next.disabled,false,'next map available after upgrade');
 buttons[0].listeners.click[0]();
 assert.equal(s.save.upgrades.range,0,'a second purchase is blocked');
 g.t.reset();
 assert.equal(s.shopBought9947,false,'next map gets a fresh free upgrade');
}
// HARD V9.9.47 progressive update: first wave is small and armor is introduced slowly.
{
 const {g,s}=harness();
 function planAt(idx){
  s.levelIndex=idx;s.levelDNA=null;
  const events=g.t.plan();
  return {events,foot:events.filter(e=>e.type==='foot').reduce((n,e)=>n+e.count,0),
    vehicles:events.filter(e=>!!e.vehicleId)};
 }
 const one=planAt(0),three=planAt(2),six=planAt(5),twelve=planAt(11),twenty=planAt(19),forty=planAt(39);
 assert.equal(one.foot,4,'map 1 has exactly four foot soldiers');
 assert.equal(one.vehicles.length,0,'map 1 starts without armed motor vehicles');
 assert.equal(three.vehicles.length,1,'map 3 introduces only one light vehicle');
 assert.ok(three.vehicles[0].vehicleId.endsWith('_1'),'first vehicle uses light class 1');
 assert.ok(one.foot<three.foot&&three.foot<six.foot&&six.foot<twelve.foot&&twelve.foot<twenty.foot&&twenty.foot<forty.foot,'infantry grows continuously');
 assert.ok(six.vehicles.length<=1&&twelve.vehicles.length<=2&&twenty.vehicles.length<=3&&forty.vehicles.length<=5,'armored pressure ramps slowly');
 assert.ok(one.events.every(e=>e.type==='foot'),'no early helicopter/rocket/tank ambush');
 assert.ok(forty.events.every(e=>e.type==='foot'||!!e.vehicleId),'endgame unit roster remains grounded');
}
{
 const {g,s}=harness();
 const hardHp=s.bunker.hp,base={kind:'rifle',dmg:12,x:s.bunker.x,y:s.bunker.y,vx:0,vy:600,
   sourceX9910:s.bunker.x,sourceY9910:s.bunker.y-200,
   ballistics9910:g.t.enemyBulletProperties('rifle',0,600)};
 g.setRandom(.99);
 const ricochet=g.t.bunkerBulletDamage(base);
 assert.ok(ricochet<=.06,'ordinary enemy bullets ricochet against concrete instead of full damage');
 g.t.damageBunker(ricochet);
 assert.ok(hardHp-s.bunker.hp<.1,'ricochet does negligible bunker damage');
 g.setRandom(0);
 const penetrated=g.t.bunkerBulletDamage(base);
 assert.ok(penetrated>ricochet&&penetrated<=1.55,'penetration is limited by armor and impact energy');
 const far={...base,sourceY9910:s.bunker.y-700};
 const distant=g.t.bunkerBulletDamage(far);
 assert.ok(distant<=penetrated,'distance-based energy reduces bullet penetration damage');
 const shell=g.t.bunkerBulletDamage({...base,kind:'rocket'});
 assert.equal(shell,12,'actual explosive anti-armor rounds still hurt the bunker');
}
{
 const {g,s}=harness();
 const cloth=[0,1,2].map(skin=>g.t.uniformPalette('rifle',skin,'wehrmacht').cloth);
 assert.equal(new Set(cloth).size,3,'three separate uniform cloth colors from one sprite model');
 s.map.zoneTheme='snow';
 const winter=g.t.uniformPalette('rifle',1,'wehrmacht');
 assert.notEqual(winter.cloth,cloth[1],'winter clothing uses a new material palette');
 const building=(id,variant)=>g.t.buildingPalette({id,variant,material:'stone'},s.map.palette);
 assert.notEqual(building(1,0).floor,building(2,1).floor,'separate buildings have different floor paint');
 assert.notEqual(building(1,0).trim,building(3,2).trim,'trim colors change with building variant');
 assert.equal(g.t.atlas.inf.skins,3,'three atlas uniform variants exist');
 g.t.render();
 assert.ok(g.t.atlas.frames['inf:wehrmacht:rifle:2:down:idle'],'third camouflage sprite actually rendered in atlas');
}
// Visual HUD clean-up and expressive gesture behavior.
{
 const {g,s}=harness(),v=makeVehicle(g,s,'jeep','kubel_1');
 v.penetrationTell9935=2;v.state='driverless9935';
 v.damageNotices9941=[{label:'FLOATING DAMAGE LABEL',color:'#ffffff',until:100}];
 v.fuelBurnT=5;v.burnPhase9941='cookoff';
 const e=g.t.spawnEnemy(170,260,'radio',null,'vehicle');e.radioT9945=4;
 const gestures=['radioCall','grenadeFlee9947','medicTreat','fire','advance','suppressed'];
 for(const state of gestures){e.state=state;g.t.gesture(e,e.x,e.y,.88);}
 g.t.render();
 const above=g.drawText.map(q=>q.label);
 assert.ok(!above.some(t=>/FLOATING DAMAGE LABEL|MUNITIE|PEN [0-9]|BRAND GEWEKEN/.test(t)),'no floating labels above vehicles');
 assert.ok(!above.some(t=>/★|RADIO CALL|ROCKET AIM/.test(t)),'no role and threat icons');
}

// FPS click discipline: first round accurate, quickly repeated taps produce three bullets,
// recoil rises over five chains and penalizes penetration much less than accuracy.
{
 const {g,s}=harness();const x=g.t.size.w*.64,y=g.t.size.h*.42;
 assert.equal(g.t.fpsTuning().singleReset,1.5);
 assert.equal(g.t.fpsTuning().fullRecover,3.5);
 g.setRandom(.99);
 assert.ok(g.t.fpsInput(x,y),'initial tap accepted');
 assert.equal(s.stats.shots,1,'first click fires one bullet');
 const first=s.shots[s.shots.length-1];
 assert.equal(first.fpsDeviation9950,0,'first round is exactly on the crosshair');
 assert.equal(first.fpsRecoil9950,0,'first round has no accuracy penalty');
 assert.equal(first.fpsSpeedFactor9950,1,'first round has full muzzle velocity');
 assert.equal(first.fpsPenetration9950,s.profile.primaryPenetrationChance,'first round has full penetration chance');
 for(let k=0;k<6;k++){
   for(let t=0;t<18;t++)g.playerTick(1/60);
   assert.ok(g.t.fpsInput(x,y),'rapid tap '+(k+2)+' accepted');
   for(let t=0;t<26;t++)g.playerTick(1/60);
   assert.equal(s.stats.shots,1+(k+1)*3,'every subsequent fast tap fires exactly 3 bullets');
 }
 assert.equal(s.fps9950.chain,5,'chain is capped at five rapid stages, without blocking more fire');
 const pressure=g.t.fpsPressure();
 assert.ok(pressure>.60&&pressure<=1,'five chains create high but bounded recoil');
 for(let i=0;i<80;i++)g.playerTick(1/60);
 assert.ok(g.t.fpsPressure()>0,'repeated volleys do not fully settle after 1.3 seconds');
 for(let i=0;i<160;i++)g.playerTick(1/60);
 assert.equal(g.t.fpsPressure(),0,'after 3.5 seconds repeated volleys settle to zero');
 assert.ok(g.t.fpsInput(x,y));
 assert.equal(s.stats.shots,20,'after recovery the next tap is single again');
 const rested=s.shots[s.shots.length-1];
 assert.equal(rested.fpsDeviation9950,0,'rested bullet again fires along centerline');
}
{
 const {g,s}=harness(),x=g.t.size.w*.5,y=g.t.size.h*.4;
 s.save.upgrades.rate=20;s.profile=g.t.profile();g.setRandom(.99);
 const tuned=g.t.fpsTuning();
 assert.equal(tuned.singleReset,.5,'fully upgraded aim stability restores single fire after half a second');
 assert.equal(tuned.fullRecover,1.5,'fully upgraded long recovery takes just 1.5 seconds');
 g.t.fpsInput(x,y);
 for(let i=0;i<30;i++)g.playerTick(1/60);
 g.t.fpsInput(x,y);
 assert.equal(s.stats.shots,2,'half-second gap at max upgrade yields another exact single shot');
 assert.equal(s.shots[s.shots.length-1].fpsDeviation9950,0,'upgraded subsequent single remains accurate');
 for(let i=0;i<10;i++)g.playerTick(1/60);
 g.t.fpsInput(x,y);
 for(let i=0;i<25;i++)g.playerTick(1/60);
 assert.equal(s.stats.shots,5,'upgraded quick tap fires a 3-round volley');
 const p=g.t.fpsPressure();
 assert.ok(p>0&&p<=1,'the upgraded burst still generates recoil');
 for(let i=0;i<90;i++)g.playerTick(1/60);
 assert.equal(g.t.fpsPressure(),0,'upgraded burst recovers after 1.5 seconds');
 const weak=loadGame(dir),ws=emptyBattle(weak,'hard');weak.setRandom(.99);
 weak.t.fpsInput(x,y);
 for(let i=0;i<9;i++)weak.playerTick(1/60);
 weak.t.fpsInput(x,y);
 const standard=ws.shots.filter(b=>b.kind==='mg').slice(-1)[0];
 assert.ok(standard.fpsRecoil9950>0,'unupgraded quick volley applies actual recoil');
 assert.ok(standard.fpsPenetration9950<ws.profile.primaryPenetrationChance,'recoil decreases penetration');
 assert.ok(standard.fpsSpeedFactor9950>.90,'muzzle velocity does not collapse under recoil');
 assert.ok(standard.damage>=ws.profile.primaryDamage*.87,'bullet base force remains effective');
}
console.log('PASS V9.9.47: ten penetrations, vehicle MG intact, all 3 fire outcomes, grenade slots/fuse/panic, truck smoke/flanking and radio reinforcements');
