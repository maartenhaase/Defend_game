/* JUST BUNKER DEFENSE 2.1 — stronger vehicles, random earned loot,
   original high-detail atlas retained, and proper early transport roles.
   Layered AFTER v10.8 and 2.0, but disables v10.8 scheduled popups.
   No original game or 2.0 files are changed. */
function v21Active(){return !!(gameState&&v106Campaign()&&gameState.startMode!=='random'&&gameState.startMode!=='demo');}
// Preserve the v10.8 permanent upgrades from old saves, but never show
// any of its in-combat prompts, banner, pause overlay or timed rewards.
v108Campaign=function(){return false;};
var V21_KIND={technical:1,crossbike:1,medicquad:1,medtruck:1};
function v21Spec(kind){
 var cfg={
  technical:{parent:'horch_1',family:'horch',baseType:'jeep',name:'WITTE TECHNICAL · MG SCHUTTER',hp:1.08,speed:1.20,capacity:2,hasMG:true,weapon:1.10,transport:false,visual:'technical'},
  crossbike:{parent:'r75_1',family:'motorcycle',baseType:'jeep',name:'ELITE CROSSMOTOR',hp:.72,speed:1.60,capacity:2,hasMG:false,weapon:0,transport:false,visual:'crossbike'},
  medicquad:{parent:'quad_1',family:'quad',baseType:'jeep',name:'QUAD · MEDIC',hp:.83,speed:1.36,capacity:2,hasMG:false,weapon:0,transport:false,visual:'medicquad'},
  medtruck:{parent:'blitz_1',family:'blitz',baseType:'trooptruck',name:'CLASS A MEDIC TRANSPORT',hp:1.16,speed:1.07,capacity:5,hasMG:false,weapon:0,transport:true,visual:'medtruck'}
 }[kind];if(!cfg)return null;
 var parent=VEHICLE_SPECS[cfg.parent],sp=Object.assign({},parent,cfg,{id:'v21_'+kind});
 delete sp.parent;return sp;
}
Object.keys(V21_KIND).forEach(function(k){VEHICLE_SPECS['v21_'+k]=v21Spec(k);});
// Four exposed occupants on the existing Kubel/Horch rather than a
// generic jeep body with anonymous passengers.
['kubel_1','kubel_2','kubel_3','horch_1','horch_2','horch_3'].forEach(function(id){
 if(VEHICLE_SPECS[id])VEHICLE_SPECS[id].capacity=4;
});
var v21EncounterOld=buildEncounterPlan;
buildEncounterPlan=function(){
 var ev=v21EncounterOld.apply(this,arguments);
 if(!v21Active()||!Array.isArray(ev)||gameState.levelIndex===0)return ev;
 var i=gameState.levelIndex;
 var fleet=ev.filter(function(e){return !!e.vehicleId&&e.type!=='plane';});
 function swap(e,kind){
  if(!e)return;
  var sp=VEHICLE_SPECS['v21_'+kind];if(!sp)return;
  e.vehicleId=sp.id;e.type=sp.baseType;
  e.label='CONTACT · '+sp.name;
  e.passengersOverride=kind==='medtruck'?5:2;
 }
 if(i===1)swap(fleet[0],'technical');
 else if(i===2)swap(fleet[0],'crossbike');
 else if(i===3)swap(fleet[0],'medicquad');
 else if(i===4)swap(fleet[0],'medtruck');
 else if(i>=5&&fleet.length){
  var kinds=['technical','crossbike','medicquad','medtruck'];
  var first=kinds[(i+Math.floor(Math.random()*4))%4];
  swap(fleet[Math.floor(Math.random()*Math.min(2,fleet.length))],first);
  if(i>=10&&fleet.length>=4&&Math.random()<.40)
   swap(fleet[fleet.length-1],kinds[(kinds.indexOf(first)+1+Math.floor(Math.random()*3))%4]);
 }
 // Keep level 1 one-vehicle introduction, no sudden massive reinforcement.
 return ev;
};
var v21VehicleOld=spawnVehicle;
spawnVehicle=function(type,count,id,direction,passengers){
 var n=gameState&&gameState.vehicles?gameState.vehicles.length:0;
 var result=v21VehicleOld.apply(this,arguments);
 if(!v21Active())return result;
 var i=gameState.levelIndex;
 for(var k=n;k<gameState.vehicles.length;k++){
  var v=gameState.vehicles[k];if(!v||v.allied)continue;
  var kind=(String(v.vehicleId||'').indexOf('v21_')===0)?String(v.vehicleId).slice(4):'';
  if(kind&&V21_KIND[kind]){
   v.v21Kind=kind;
   v.vehicleName=VEHICLE_SPECS['v21_'+kind].name;
   v.vehicleSpec=VEHICLE_SPECS['v21_'+kind];
   v.hasMG=kind==='technical';v.passengers=kind==='medtruck'?Math.min(6,4+Math.floor(i/9)):2;
   v.unloadLeft=(kind==='medtruck'||kind==='crossbike'||kind==='medicquad')?v.passengers:0;
   v.unloadIndex=0;
   v.behavior=v.unloadLeft?'dismount':'firepass';
   v.speed*=kind==='crossbike'?1.28:kind==='technical'?1.16:kind==='medicquad'?1.12:1;
   v.currentSpeed=Math.max(8,v.currentSpeed);
   if(kind==='medtruck'){v.contactY=Math.min(v.contactY,H*.42);v.dropY=H*.47;}
  }else if(/kubel|horch/.test(v.vehicleFamily||'')){
   // Four helmets are visible; keep the original high-quality jeep sprite.
   v.v21FourCrew=true;
   if(v.passengers<4&&v.state!=='parked')v.passengers=4;
  }
  // Broadly 2.5–3.5x longer survival. A small, accessible level-1 step;
  // curves still scale with the existing 30-map vehicle progression.
  var factor=(i===0?2.55:2.75+Math.min(.40,i*.014));
  v.hp=Math.max(30,v.hp*factor);v.maxHp=v.hp;
  if(v.armorHp>0){v.armorHp*=1.20;v.maxArmorHp=v.armorHp;}
  v.v21BaseHp=v.maxHp;v.v21ArmorClass=v107VehicleClass(v);
 }
 return result;
};
// The existing dismount code already creates real soldiers with real AI,
// cover-seeking, wounded and medic treatment states. Re-role per transport.
var v21DismountOld=dismountOne;
dismountOne=function(v,mode,index){
 var e=v21DismountOld.apply(this,arguments);
 if(!v21Active()||!e||!v||!v.v21Kind)return e;
 var kind=v.v21Kind,level=gameState.levelIndex;
 if(kind==='medtruck'||(kind==='medicquad'&&index===1)){
  e.role='medic';e.v21ClassA=kind==='medtruck';
  e.weaponProfile=kind==='medtruck'?
   {name:'MP40 CLASS A MEDIC',damage:.91,speed:.98,spread:.074,cooldown:.48}:
   {name:'MP40 FIELD MEDIC',damage:.80,speed:.96,spread:.093,cooldown:.63};
  e.weaponName=e.weaponProfile.name;e.rocketUnit=false;
  e.aggressive=kind==='medtruck'?.43:.23;e.fireCd=.35;
  e.hp*=kind==='medtruck'?1.22:1.12;e.maxHp=e.hp;
  e.aimSkill=kind==='medtruck'?1.35:1.10;
 }else if(kind==='crossbike'){
  e.role='storm';e.weaponProfile=enemyWeaponProfile('storm',level,e.id,e.faction);
  e.weaponName=e.weaponProfile.name;e.hp*=1.35;e.maxHp=e.hp;
  e.aimSkill=1.35;e.speed*=1.16;e.aggressive=1.15;e.fireCd=.22;
 }else if(kind==='medicquad'){
  e.role='rifle';e.weaponProfile=enemyWeaponProfile('rifle',level,e.id,e.faction);
  e.weaponName=e.weaponProfile.name;
 }
 return e;
};
// Preserve the unobstructed player gun; make Easy moderately stronger by
// improving fire precision/tempo, not by spawning a huge early wave.
var v21ProgressOld=enemyProgression;
enemyProgression=function(idx){
 var p=v21ProgressOld.apply(this,arguments);
 if(v21Active()&&gameState.startMode==='easy'){
  p.accuracy=Math.max(.62,p.accuracy*.90);
  p.cooldown=Math.max(.72,p.cooldown*.91);
  p.infantryDamage*=1.10;p.vehicleDamage*=1.08;
  p.decision=Math.max(.65,p.decision*.93);
 }
 return p;
};
// MG stays viable as a long-term mobility kill, but not a cheap gasoline
// ignition shortcut. HE/FLAK does substantial anti-vehicle damage.
var v21DamageOld=damageVehicle;
damageVehicle=function(v,dmg,kind){
 if(!v21Active()||!v||!v.alive||v.allied)return v21DamageOld.apply(this,arguments);
 if(kind==='mg'){
  v.v21BulletHits=(v.v21BulletHits||0)+1;
  if(v.hp<=v.maxHp*.075&&v.v21BulletHits>=10){
   return neutralizeVehicle(v,'GUNFIRE',false);
  }
  var margin=Math.max(1.5,v.maxHp*.055);
  dmg=Math.max(0,Math.min(dmg*.58,Math.max(0,v.hp-margin)*.75));
 }else if(kind==='he'||kind==='flak')dmg*=2.05;
 return v21DamageOld.call(this,v,dmg,kind);
};
// Fuel flames are reserved for severe damage, especially explosive strikes.
var v21IgniteOld=igniteFuel;
igniteFuel=function(v,delay){
 if(v21Active()&&v&&v.alive&&v107Stage(v)<8){
  v.fuelLeak=true;return false;
 }
 return v21IgniteOld.apply(this,arguments);
};
var v21BurnOld=updateVehicleDamageParticles;
updateVehicleDamageParticles=function(v,dt){
 var result=v21BurnOld.apply(this,arguments);
 if(v21Active()&&v&&v.alive&&v107Stage(v)<8&&v.fuelIgnited){
  v.fuelIgnited=false;v.fuelBurnT=0;v.burnPhase9941=null;
 }
 return result;
};
// Player starts with TWELVE actual bullets, with all previous permanent
// upgrades still saved; no reset to 3 through old early-campaign logic.
var v21ProfileOld=v106ApplyProfile;
v106ApplyProfile=function(isPickup){
 var result=v21ProfileOld.apply(this,arguments);
 if(v21Active()&&gameState.profile){
  gameState.profile.primaryMag=Math.max(12,gameState.profile.primaryMag);
  gameState.primaryAmmo=Math.min(gameState.profile.primaryMag,Math.max(0,gameState.primaryAmmo));
  if(!isPickup&&gameState.primaryAmmo<12)gameState.primaryAmmo=gameState.profile.primaryMag;
 }
 return result;
};
// Replace the stale fixed 3-crate schedule with 3–6 varied drops.
function v21DropPlan(){
 var g=gameState,n=3+Math.floor(Math.random()*4);
 var last=(g.events||[]).reduce(function(m,e){return Math.max(m,e.t||0);},0);
 var duration=Math.max(27,last+7),schedule=[];
 for(var i=0;i<n;i++){
  var portion=(i+.6+Math.random()*.7)/(n+.32);
  schedule.push(Math.max(2.5,Math.min(duration-1.1,portion*duration)));
 }
 schedule.sort(function(a,b){return a-b;});
 // Keep at least one late crate after the final scheduled confrontation.
 schedule[n-1]=Math.max(schedule[n-1],duration*.88);
 g.v106Target=n;g.v106Schedule=schedule;
}
var v21ResetOld=resetLevel;
resetLevel=function(){
 var result=v21ResetOld.apply(this,arguments);
 if(!v21Active())return result;
 v21DropPlan();
 gameState.v106MessageT=0;gameState.v106Message=null;
 gameState.message='';gameState.messageT=0;
 return result;
};
var v21CrateOld=v106SpawnRewardCrate;
v106SpawnRewardCrate=function(){
 var c=v21CrateOld.apply(this,arguments);
 if(!v21Active())return c;
 var hits=19+Math.min(8,Math.floor(gameState.levelIndex/4))+Math.floor(Math.random()*4);
 c.maxHp=c.hp=7*hits;c.v21Hits=hits;
 gameState.v106MessageT=0;gameState.v106Message=null;
 gameState.messageT=0;
 return c;
};
var v21RewardOld=v106GrantReward;
v106GrantReward=function(){
 var reward=v21RewardOld.apply(this,arguments);
 if(v21Active()){
  gameState.messageT=0;gameState.v106MessageT=0;
 }
 return reward;
};
var v21CrateDamageOld=v106DamageCrate;
v106DamageCrate=function(c,dmg,kind){
 if(v21Active()){
  if(kind==='flak')dmg=Math.max(dmg*2.5,26);
  else if(kind==='mg')dmg=Math.max(6,dmg*(1+.065*v106Rank('mgDamage')));
 }
 return v21CrateDamageOld.call(this,c,dmg,kind);
};
// Friendly loot distribution: useful gun/FLAK perks weighted, rare Rambo
// and armored ally reinforcements kept genuinely rare.
var v21RewardRollOld=v106RollReward;
v106RollReward=function(){
 if(!v21Active())return v21RewardRollOld.apply(this,arguments);
 var entries=V106_REWARDS.filter(function(r){
  if(!r.instant&&v106Rank(r.id)>=r.max)return false;
  if(r.id==='repair'&&gameState.bunker.hp>=gameState.bunker.maxHp*.92)return false;
  if(r.id==='armorVehicle'&&gameState.arcade.armor.some(function(v){return v.alive;}))return false;
  return true;
 });
 if(!entries.length)return V106_REWARDS.find(function(r){return r.id==='repair';})||V106_REWARDS[0];
 var weights={magazine:30,mgReload:25,mgDamage:15,mgRate:9,flakDamage:10,flakReload:7,flakSplash:5,flakProjectile:3,
  bunkerArmor:5,repair:7,heat:3,penetration:4,obstacleDamage:4,mgSpread:4,flakSpread:3,
  elites:1,armorVehicle:.35,rambo:.22};
 var total=entries.reduce(function(n,r){return n+(weights[r.id]||2);},0),roll=Math.random()*total;
 for(var i=0;i<entries.length;i++){roll-=weights[entries[i].id]||2;if(roll<=0)return entries[i];}
 return entries[entries.length-1];
};
// Victory is NOT permitted after the original third crate when this
// map rolled 4/5/6. The extra crates remain optional to shoot.
var v21VictoryOld=v102ReadyToCelebrate;
v102ReadyToCelebrate=function(){
 if(v21Active()&&(gameState.v106Spawned||0)<(gameState.v106Target||3))return false;
 return v21VictoryOld.apply(this,arguments);
};
var v21UpdateOld=update;
update=function(dt){
 var result=v21UpdateOld.apply(this,arguments);
 if(!v21Active()||gameState.mode!=='playing')return result;
 var g=gameState,n=g.v106Target||3;
 while(g.v106Spawned<n&&g.levelTime>=g.v106Schedule[g.v106Spawned])
  v106SpawnRewardCrate();
 if(g.eventCursor>=g.events.length&&!v102HostilesAlive()&&g.v106Spawned<n){
  g.v21Quick=(g.v21Quick||0)+dt;
  if(g.v21Quick>.67){g.v21Quick=0;v106SpawnRewardCrate();}
 }else g.v21Quick=0;
 // The gun reloading and hit indicators remain in the compact HUD.
 // Do not allow old full-center warning and reward text overlays.
 g.v106MessageT=0;g.messageT=0;
 if(g.v10Gradual)g.v10Gradual.noticeT=0;
 return result;
};
// No overlay replacement art. Preserve original vehicle atlases and
// add identifiable crew, white body highlights and medical markings.
var v21DrawVehicleOld=drawVehicle;
function v21CrewHead(x,y,medic){
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#272b23';ctx.fillRect(-4,-3,8,8);
 ctx.fillStyle='#8d8562';ctx.fillRect(-3,-2,6,6);
 ctx.fillStyle='#b7a078';ctx.fillRect(-3,0,6,3);
 ctx.fillStyle=medic?'#e2dec7':'#455340';ctx.beginPath();
 ctx.ellipse(0,-3,4.1,3.1,0,0,TAU);ctx.fill();
 ctx.fillStyle=medic?'#b34941':'#a2a685';ctx.fillRect(-2,-5,4,1);
 if(medic){ctx.fillRect(-.7,-5.5,1.4,5);ctx.fillRect(-2.6,-3.8,5.2,1.4);}
 ctx.fillStyle='#332c25';ctx.fillRect(-2,-.6,1,1);ctx.fillRect(1,-.6,1,1);
 ctx.restore();
}
drawVehicle=function(v,wreck){
 if(!v21Active()||!v)return v21DrawVehicleOld.apply(this,arguments);
 var kind=v.v21Kind||'';
 var angle=(v.bodyAngle==null?Math.PI/2:v.bodyAngle)-Math.PI/2;
 if(kind==='technical'&&!wreck){
  ctx.save();
  // The base jeep atlas supplies all wheel, chassis and equipment detail.
  ctx.filter='grayscale(.78) brightness(1.55) contrast(.92)';
  v21DrawVehicleOld.call(this,v,wreck);ctx.restore();
 }else if(kind==='crossbike'&&!wreck){
  // Crop the existing detailed motorcycle (removes its sidecar and MG).
  ctx.save();ctx.translate(v.x,v.y);ctx.rotate(angle);
  ctx.beginPath();ctx.rect(-9,-23,18,46);ctx.clip();ctx.rotate(-angle);ctx.translate(-v.x,-v.y);
  v21DrawVehicleOld.call(this,v,wreck);ctx.restore();
 }else v21DrawVehicleOld.call(this,v,wreck);
 if(wreck)return;
 if(kind==='technical'||kind==='crossbike'||kind==='medicquad'||kind==='medtruck'||v.v21FourCrew){
  ctx.save();ctx.translate(v.x,v.y);ctx.rotate(angle);
  var bounce=Math.sin((v.wheelT||0)*1.5)*Math.min(.7,(v.currentSpeed||0)*.025);
  if(kind==='technical'){
   ctx.fillStyle='#e2ded0';ctx.globalAlpha=.8;
   ctx.fillRect(-7,3,14,10);ctx.fillRect(-6,12,12,3);
   ctx.fillStyle='#9b9580';ctx.fillRect(-6,5,3,4);ctx.fillRect(3,5,3,4);
   v21CrewHead(0,7+bounce,false);v21CrewHead(0,-8+bounce,false);
   ctx.strokeStyle='#373c32';ctx.lineWidth=1.6;
   ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,-17);ctx.stroke();
   ctx.fillStyle='#282d2a';ctx.fillRect(-3,-17,6,3);
  }else if(kind==='crossbike'){
   v21CrewHead(0,7+bounce,false);v21CrewHead(0,-7+bounce,false);
   ctx.fillStyle='#90805e';ctx.fillRect(-3,12,6,2);
  }else if(kind==='medicquad'){
   v21CrewHead(0,6+bounce,false);v21CrewHead(0,-8+bounce,true);
   ctx.fillStyle='#e4ddc6';ctx.fillRect(-4,12,8,6);
   ctx.fillStyle='#b24942';ctx.fillRect(-.5,13,1,4);ctx.fillRect(-2,14.5,4,1);
  }else if(kind==='medtruck'){
   ctx.fillStyle='#ece8d8';ctx.globalAlpha=.96;
   ctx.fillRect(-8,-7,16,17);
   ctx.fillStyle='#a5463b';ctx.fillRect(-1,-5,2,13);ctx.fillRect(-5,0,10,2);
   // Cargo is shown by recognizable helmets inside canvas opening.
   if((v.passengers||0)>0)for(var m=0;m<Math.min(4,v.passengers);m++)
    v21CrewHead(-4+(m%2)*8,-19+Math.floor(m/2)*7,true);
  }else if(v.v21FourCrew){
   // Existing loaded jeep retains all material/axle details.
   v21CrewHead(-4,7+bounce,false);v21CrewHead(4,7+bounce,false);
   v21CrewHead(-4,-5+bounce,false);v21CrewHead(4,-5+bounce,false);
  }
  ctx.restore();
 }
 return undefined;
};
var v21CrateDrawOld=v106DrawCrate;
v106DrawCrate=function(c){
 if(!v21Active()||!c||c.opened)return v21CrateDrawOld.apply(this,arguments);
 var age=(gameState.time||0),pulse=.5+.5*Math.sin(age*3.8+c.sway);
 ctx.save();
 var radius=20+pulse*5;
 var light=ctx.createRadialGradient(c.x,c.y,3,c.x,c.y,radius);
 light.addColorStop(0,'rgba(255,216,119,.24)');
 light.addColorStop(.55,'rgba(243,182,69,.11)');
 light.addColorStop(1,'rgba(243,182,69,0)');
 ctx.fillStyle=light;ctx.fillRect(c.x-radius,c.y-radius,radius*2,radius*2);
 ctx.restore();
 v21CrateDrawOld.apply(this,arguments);
 var taken=1-c.hp/Math.max(1,c.maxHp),cuts=Math.min(5,Math.floor(taken*6));
 if(cuts>0){
  ctx.save();ctx.translate(c.x,c.y);ctx.strokeStyle='rgba(48,43,31,.80)';
  ctx.lineWidth=1;
  for(var z=0;z<cuts;z++){
   var xx=-10+(z%3)*7,yy=-8+Math.floor(z/3)*9;
   ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+3,yy+3);ctx.lineTo(xx+5,yy+2);ctx.stroke();
  }
  ctx.restore();
 }
};
var v21CompleteOld=completeLevel;
completeLevel=function(){
 var result=v21CompleteOld.apply(this,arguments);
 if(v21Active()&&gameState.mode==='shop'){
  var opened=(gameState.v106Crates||[]).filter(function(c){return c.opened;}).length;
  subEl.textContent='MAP '+(gameState.levelIndex+1)+'/30 · '+opened+'/'+gameState.v106Target+' KISTEN';
  summaryEl.textContent='Upgrades verdien je uitsluitend door parachutekistjes open te schieten.';
 }
 return result;
};
