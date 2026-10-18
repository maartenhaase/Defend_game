'use strict';
// Real game update, projectiles, movement, magazines and reloads; stationary test targets.
const {loadGame,emptyBattle}=require('./battle_regression.cjs');
const dir=process.argv[2]||__dirname,samples=Math.max(1,Math.min(5,Number(process.argv[3])||3)),rows=[];
for(let seed=0;seed<samples;seed++)for(const scenario of ['infantry','armor','cluster'])for(const lane of ['strike','reinforce'])for(let tier=1;tier<=5;tier++){
 const g=loadGame(dir,{width:390,height:844},{stationaryTargets:true,seed:seed*719}),s=emptyBattle(g,'hard');
 g.setSeed(9929+seed*719);s.levelIndex=19;s.levelDNA=null;s.map.cover=[];s.map.rocks=[];s.map.trees=[];s.map.puddles=[];s.wrecks=[];s.infantry=[];s.vehicles=[];s.time=10;
 s.aim={x:195,y:360};s.events=[];s.eventCursor=0;s.shortBattle=null;s.arcade.salvageAt=100000;
 const targets=[];
 if(scenario!=='armor')for(const [i,off] of (scenario==='cluster'?[[-1,-22],[0,0],[1,22]]:[[0,0]])){
  const e=g.t.spawnEnemy(195+off,360+(i===0?0:18),'rifle',null,'vehicle');e.x=195+off;e.y=360+(i===0?0:18);e.hp=e.maxHp=100000;e.armorHp=e.maxArmorHp=0;e.id=400+i;e.state='fire';e.suppression=0;targets.push(e);
 }
 if(scenario!=='infantry'){
  g.t.spawnVehicle('trooptruck',0,'blitz_1',0,0);const v=s.vehicles.at(-1);v.x=195;v.y=360;v.hp=v.maxHp=100000;v.armorHp=v.maxArmorHp=0;v.passengers=v.unloadLeft=0;v.state='road';v.driverHit=false;v.driverPenetrationNeed9935=1e9;v.hasMG=false;v.id=550;targets.push(v);
 }
 const support=g.ladder.state();support.bankedKills=tier*8;support.selectedLane=lane;g.ladder.activate();
 for(let f=0;f<1800;f++){g.clock(1000/60);g.t.step(1/60);}
 rows.push({seed,scenario,lane,tier,infantry:+targets.filter(e=>e.role).reduce((sum,e)=>sum+100000-e.hp,0).toFixed(1),armor:+targets.filter(e=>!e.role).reduce((sum,e)=>sum+100000-e.hp,0).toFixed(1),shots:s.arcade.allies.reduce((n,u)=>n+(u.shotsFired9929||0),0),units:s.arcade.allies.length,vehicles:s.arcade.armor.length});
}
const aggregates=[];
for(const scenario of ['infantry','armor','cluster'])for(const lane of ['strike','reinforce'])for(let tier=1;tier<=5;tier++){
 const r=rows.filter(x=>x.scenario===scenario&&x.lane===lane&&x.tier===tier),avg=k=>+(r.reduce((n,x)=>n+x[k],0)/r.length).toFixed(1);
 aggregates.push({scenario,lane,tier,kills:tier*8,infantry:avg('infantry'),armor:avg('armor'),minInfantry:Math.min(...r.map(x=>x.infantry)),maxInfantry:Math.max(...r.map(x=>x.infantry)),minArmor:Math.min(...r.map(x=>x.armor)),maxArmor:Math.max(...r.map(x=>x.armor))});
}
if(process.argv.includes('--verify')){
 const assert=require('node:assert/strict'),get=(scenario,lane,tier)=>aggregates.find(r=>r.scenario===scenario&&r.lane===lane&&r.tier===tier),total=r=>r.infantry+r.armor;
 assert.ok(total(get('cluster','strike',3))>total(get('cluster','strike',2))*1.35,'strafing materially exceeds cheaper bombs in the shared clustered test');
 assert.ok(total(get('cluster','strike',4))>total(get('cluster','strike',3))*1.5,'howitzer area damage earns its higher cost');
 assert.ok(total(get('cluster','strike',5))>total(get('cluster','strike',4))*1.20,'regimental barrage earns its higher cost');
 assert.ok(get('infantry','reinforce',2).infantry>get('infantry','reinforce',1).infantry*1.30,'MG/medic/engineer team adds direct fire and construction utility over three infantry');
 assert.ok(get('infantry','reinforce',3).infantry>get('infantry','reinforce',2).infantry*1.4,'veterans improve on MG team');
 assert.ok(get('infantry','reinforce',4).infantry>get('infantry','reinforce',3).infantry*.8&&get('armor','reinforce',4).armor>100,'scout combines infantry fire with component/hull damage');
 assert.ok(get('infantry','reinforce',5).infantry>get('infantry','reinforce',4).infantry*1.3&&get('armor','reinforce',5).armor>get('armor','reinforce',4).armor*1.4,'tank rewards the top reinforcement tier');
}
const probe=loadGame(dir),state=emptyBattle(probe,'hard');state.levelIndex=19;
console.log(JSON.stringify({version:'V9.9.43',method:{seconds:30,screen:'390x844',campaignMap:20,difficulty:'hard',samplesPerScenario:samples,targets:'stationary, no cover, no armor plates, 100000 HP and a protected test driver to measure potential without overkill or early removal',cluster:'three infantry at x=173/195/217, y=378/360/378, one stationary trooptruck at 195/360',reinforcements:'normal south entry and arrival time included; no enemy return fire; can keep dealing damage after the thirty-second window'},config:probe.t.supportNumbers,aggregates,rows},null,2));
