
/* =============================================================
   JBD V10.1 — THE LONG ROAD (30 progressive levels)
   This replaces the rushed V10 Quickfire progression entirely.
   ============================================================= */
var V10_WORLDS=[
 'RIVIERLAND','HET GROENE BOS','DE BERGROUTE','DE INDUSTRIEVALLEI','DE GROTE STAD'
];
/* Name | biome | feature | road shape | enemy count | enemy vehicles | surprise
   Gradual journey through a single continent, without beach or ice maps.
   A vehicle column is not a per-wave multiplier: level 1 has ONE vehicle. */
var V10_ROAD=[
 'DE EERSTE WEG|village|open_fields|straight|0|1|none',
 'BOERDERIJPAD|village|hedgerow|curve|0|1|none',
 'HET HOOILAND|village|open_fields|curve|1|1|none',
 'OUDE BRUG|village|river_crossing|straight|2|1|none',
 'DORPSRAND|village|urban_blocks|cross|3|1|none',
 'BOSRAND|forest|hedgerow|curve|3|1|none',
 'DENNENWEG|forest|dense_forest|s|4|1|none',
 'HOUTKAMP|forest|dense_forest|dogleg|4|1|none',
 'BOSPAD|forest|hedgerow|dogleg|5|1|none',
 'HEUVELPOST|forest|fortified_line|s|5|1|flank',
 'STENEN WEG|forest|desert_ridge|curve|6|1|none',
 'KLOOFBOCHT|forest|desert_ridge|dogleg|6|1|smoke',
 'HOOGBOERDERIJ|village|hedgerow|s|7|1|none',
 'TUNNELWEG|forest|fortified_line|dogleg|8|1|flank',
 'DE BERGPAS|forest|desert_ridge|dogleg|8|1|none',
 'DALWEG|village|open_fields|curve|9|1|smoke',
 'SPOORBRUG|village|river_crossing|cross|9|1|none',
 'VOORSTAD|suburb|urban_blocks|cross|10|2|none',
 'DE BUITENRING|suburb|urban_blocks|straight|11|2|flank',
 'GOEDERENLOODS|industrial|rail_yard|straight|11|2|none',
 'KANAALWEG|industrial|bridge|cross|12|2|smoke',
 'MAGAZIJNZONE|industrial|factory_belt|yard|13|2|none',
 'RANGEERTERREIN|industrial|rail_yard|yard|13|2|flank',
 'STADSRAND|suburb|urban_blocks|cross|14|2|none',
 'DE BOULEVARD|metropolis|urban_blocks|cross|14|2|smoke',
 'OUDE MARKT|metropolis|urban_blocks|cross|15|2|none',
 'NOORDWIJK|metropolis|rubble_quarter|cross|16|2|flank',
 'CENTRAAL STATION|metropolis|rail_yard|yard|16|2|none',
 'DE BINNENRING|metropolis|urban_blocks|cross|17|3|smoke',
 'HET CENTRUM|metropolis|urban_blocks|cross|18|3|flank'
].map(function(line,i){
 var p=line.split('|');
 return {index:i,name:p[0],theme:p[1],feature:p[2],layout:p[3],
  foot:Number(p[4]),vehicles:Number(p[5]),twist:p[6],
  chapter:Math.floor(i/6),world:V10_WORLDS[Math.floor(i/6)]};
});
if(V10_ROAD.length!==30)throw Error('The Long Road needs exactly 30 maps');
CAMPAIGN_LENGTH=30;
WORLD_TOUR_9934.length=30;LEVELS.length=30;TOUR_LAYOUTS_9934.length=30;
V10_ROAD.forEach(function(q,i){
 var m=WORLD_TOUR_9934[i];
 m.index=i;m.year='';m.theater=q.world;m.title=q.name;m.short=q.name;
 m.theme=q.theme;m.feature=q.feature;m.recipe=i<4?'scouts':i<10?'infantry':i<18?'mixed':'convoy';
 m.layout=q.layout;m.objective='DEFEND '+q.name;
 m.packLabel='MAP '+String(i+1).padStart(2,'0')+' · '+q.name;m.chapter=q.chapter;
 var L=LEVELS[i];
 L.zone=q.chapter;L.stage=i%3;L.actStage=i%5;L.type=q.world;L.theme=q.theme;
 L.name=q.name;L.shortTitle=q.name;L.packLabel=m.packLabel;L.packFeature=q.feature;
 L.year9934='';L.theater9934=q.world;L.historicalTitle9934=q.name;L.objective9934=m.objective;
 L.tourId9934=i;L.tourFeature9934=q.feature;L.tourLayout9934=q.layout;L.tourRecipe9934=m.recipe;
 L.seed=(0xA17C4063^Math.imul(i+1,0x45d9f3b))>>>0;
 var d=tourCode9934(m,i).split('');
 // Gradual skill/weapon scaling and spatial complexity.
 d[0]=String(Math.min(8,Math.floor(i/4)));
 d[1]=String(Math.min(7,Math.floor(i/5)));
 d[2]=String(Math.min(7,Math.floor(i/6)));
 d[5]=String(Math.min(8,Math.floor(i/4)));
 d[6]=String(Math.min(8,Math.floor(i/5)));
 d[10]='0';d[11]='0';d[12]=String(Math.min(7,2+Math.floor(i/6)));
 d[14]=String(Math.min(7,1+Math.floor(i/5)));
 d[17]=String(2+(i%5));d[18]=String(Math.min(7,1+Math.floor(i/5)));
 d[19]=String(Math.min(7,1+Math.floor(i/4)));
 d[20]=String(q.theme==='forest'?7:q.theme==='village'?4:q.theme==='suburb'?3:1);
 d[21]=String(Math.min(6,1+Math.floor(i/5)));
 d[23]=String(Math.min(6,Math.floor(i/6)));
 d[24]='0';
 L.code=d.join('');
 var lay=tourLayout9934(i,m);
 lay.name=m.packLabel;lay.style=q.layout;lay.roadWidth=22+(i%3)*2;
 lay.secondary=i<4?'none':i<10?'fork':i<18?'alley':'cross';
 lay.cover=.32+Math.min(.38,i*.015);lay.patches=2+Math.floor(i/10);
 lay.setpieces=2+Math.floor(i/10);lay.corridor=.25+(i%3)*.012;
});
CAMPAIGN_BLUEPRINT=LEVELS.map(function(L){return Object.assign({},L);});
SHORT_BATTLES_987=V10_ROAD.map(function(q){return ['progressive',q.name,95];});
SAVE_KEY='jbd_v10_progressive_30_save_20261115';

// Automatic micro upgrades: precisely one level per cleared map, no shopping.
var V10_UPGRADE_ORDER=['rate','range','armor','special'];
function v10Equip(idx){
 if(!gameState||!gameState.save)return;
 idx=clamp(idx|0,0,29);
 var u={range:0,rate:0,armor:0,special:0};
 for(var i=0;i<idx;i++)u[V10_UPGRADE_ORDER[i%4]]++;
 gameState.save.upgrades=u;gameState.save.upgradeSchema9935=1;
 gameState.save.arsenalPoints=0;
}
function v10UpgradeLabel(idx){
 return ({rate:'MEER CONTROLE',range:'BETERE BALLISTIEK',armor:'STERKERE BUNKER',special:'LICHT VERSTERKTE FLAK'})[V10_UPGRADE_ORDER[(idx-1)%4]]||'VERSTERKING';
}
// Keep terrain readable and the same continent recognizable between maps.
var v10MapBase=buildMap;
buildMap=function(){
 var out=v10MapBase.apply(this,arguments);
 if(!gameState||!gameState.map||gameState.startMode==='demo'||gameState.startMode==='random')return out;
 var q=V10_ROAD[gameState.levelIndex],m=gameState.map;
 m.v10RouteSignature='ROAD-'+String(q.index+1).padStart(2,'0')+'-'+q.feature+'-'+q.layout;
 m.layoutName=q.name;m.v10Region=q.world;m.v10Step=q.index+1;
 if(q.index>=10&&q.index<=16){
  // Mountains introduce stone cover gradually, not a sudden winter biome.
  for(var i=0;i<4;i++){
   var x=W*(i%2?.80:.20)+(q.index%3-1)*5;
   var y=H*(.29+i*.115);
   createObstacle986(m,x,y,8+(i%3)*2,'rock',47000+q.index*10+i);
  }
 }
 return out;
};

// Slower and steadier movement throughout the campaign.
// At level 1 a lone unarmed vehicle travels slowly towards the bunker.
var v10VehicleBase=spawnVehicle;
spawnVehicle=function(type,count,id,direction,passengers){
 var before=gameState.vehicles.length;
 var result=v10VehicleBase.apply(this,arguments);
 if(!gameState||gameState.startMode==='demo'||gameState.startMode==='random')return result;
 var idx=gameState.levelIndex,speed=idx===0?.30:Math.min(.79,.36+idx*.014);
 for(var k=before;k<gameState.vehicles.length;k++){
  var v=gameState.vehicles[k];
  v.speed*=speed;v.currentSpeed*=speed;v.accel*=Math.max(.45,speed);
  if(idx===0){
   v.hp=v.maxHp=42;v.armorHp=0;v.maxArmorHp=0;
   v.hasMG=false;v.passengers=0;v.unloadLeft=0;
  }else if(idx<5){
   v.hasMG=false;v.passengers=0;v.unloadLeft=0;
  }
 }
 return result;
};
var v10EnemyProgressBase=enemyProgression;
enemyProgression=function(idx){
 var p=v10EnemyProgressBase.apply(this,arguments);
 if(!gameState||gameState.startMode==='demo'||gameState.startMode==='random')return p;
 var t=clamp(idx/29,0,1);
 p.infantrySpeed*=.62+.24*t;
 p.vehicleSpeed*=.76+.15*t;
 p.infantryDamage*=.64+.28*t;
 p.vehicleDamage*=.64+.28*t;
 p.cooldown*=1.25-.12*t;
 return p;
};
// Deliberately authored attack schedule: level 1 is EXACTLY one jeep.
// Later levels add one new unit type or small squad at a time.
var v10PlanBase=buildEncounterPlan;
buildEncounterPlan=function(){
 if(!gameState||gameState.startMode==='demo'||gameState.startMode==='random')
  return v10PlanBase.apply(this,arguments);
 var i=gameState.levelIndex,q=V10_ROAD[i],ev=[];
 gameState.shortBattle={kind:'road30',label:q.name,maxDuration:100};
 gameState.shortBattleWithdrawn=false;
 gameState.encounterName=q.name+' · '+q.world;
 gameState.waveTotal=1;gameState.mgTeamsPlanned=0;gameState.wave=1;
 function add(t,type,count,label,opts){return addEncounter(ev,t,type,count,0,1,label||q.name,opts||{});}
 function vehicle(t,family,direction){
  var spec=vehicleSpecFor(family,i);
  return add(t,spec.baseType,1,spec.name,{vehicleId:spec.id,motorCap:2,passengersOverride:0,direction:direction==null?0:direction});
 }
 function foot(t,n,tactic){
  if(n<=0)return;
  add(t,'foot',n,'INFANTRY CONTACT',{roleMix:i<10?'rifle':i<21?'rifle':'lmg',tactic:tactic||'line',rocketCount:0,direction:0});
 }
 var mainFamily=i<11?'kubel':i<17?'horch':i<22?'spah':'sdkfz250';
 vehicle(2.5,mainFamily,0);
 if(q.foot){
  if(q.foot<=4)foot(12,q.foot,'line');
  else{
   var first=Math.ceil(q.foot*.54);
   foot(10.5,first,i<10?'line':'split');
   foot(20,q.foot-first,i<15?'split':'flankRight');
  }
 }
 if(q.vehicles>=2)vehicle(24,i<23?'kubel':'spah',2);
 if(q.vehicles>=3)vehicle(34,'horch',4);
 ev.sort(function(a,b){return a.t-b.t;});
 return ev;
};

// Level 1 magazine: THREE bursts of THREE rounds = NINE rounds.
var v10ResetBase=resetLevel;
resetLevel=function(){
 if(gameState&&gameState.startMode!=='demo'&&gameState.startMode!=='random')v10Equip(gameState.levelIndex);
 v10ResetBase.apply(this,arguments);
 if(!gameState||gameState.startMode==='demo'||gameState.startMode==='random')return;
 var i=gameState.levelIndex;
 gameState.profile.primaryMag=9+3*Math.floor(i/6);
 gameState.profile.primaryReload=Math.max(1.65,2.7-i*.026);
 gameState.primaryAmmo=gameState.profile.primaryMag;
 gameState.heat=0;gameState.overheat=false;gameState.fps9950=null;
 gameState.v10Gradual={surprised:false,notice:'',noticeT:0};
 gameState.message=i===0?'MIK OP HET VOERTUIG · 3 × 3 KOGELS + 1 FLAK':'MAP '+(i+1)+' · '+V10_ROAD[i].name;
 gameState.messageT=3.1;
};
// The first and every subsequent tap fires one controlled burst of 3.
// Gun has exactly 3 bursts before it reloads on map 1.
queueMG=function(x,y){
 if(!gameState||gameState.mode!=='playing')return false;
 if(gameState.primaryReloadT>0){gameState.message='HERLADEN';gameState.messageT=.34;return false;}
 if(gameState.primaryAmmo<=0){beginPrimaryReload();return false;}
 var state=fpsState9950();
 if(state.queued.length>0)return false;
 var requested=Math.min(3,gameState.primaryAmmo),now=gameState.time;
 for(var k=0;k<requested;k++)state.queued.push({x:x,y:y,tier:0,serial:k,recoil:k*.03});
 state.chain=0;state.lastClick=now;
 fpsFireQueue9950();
 return true;
};
var v10UpdateWeaponsBase=updatePlayerWeapons9937;
updatePlayerWeapons9937=function(dt){
 v10UpdateWeaponsBase.apply(this,arguments);
 if(gameState&&gameState.mode==='playing'&&gameState.primaryAmmo<=0&&
   gameState.primaryReloadT<=0&&!(gameState.fps9950&&gameState.fps9950.queued.length))beginPrimaryReload();
};
// The actual Flak button fires ONE accurate, weak projectile.
flakStats9951=function(level){
 level=clamp(level|0,0,SKILL_MAX);
 return {rounds:1,damage:6+level*.37,vehicleDamage:8+level*.60,
         radius:17+level*.14,reload:6.7-Math.min(1.5,level*.13)};
};
fireFlak9950=function(x,y){
 if(!gameState||gameState.mode!=='playing')return false;
 var f=currentFlak9950(),stats=flakStats9951(gameState.save.upgrades.special||0);
 if(f.cooldown>0){gameState.message='FLAK HERLADEN · '+f.cooldown.toFixed(1)+'s';gameState.messageT=.5;return false;}
 if(!Number.isFinite(x)||!Number.isFinite(y)){x=gameState.aim.x;y=gameState.aim.y;}
 f.cooldown=stats.reload;f.lastFire=gameState.time;
 var sx=gameState.bunker.x,sy=gameState.bunker.y-10;
 // Aim slightly ahead of a moving target so the ONE slow shell actually hits.
 // Target assist engages only when the player manually aims near a vehicle.
 var best=null,bestD=28;
 gameState.vehicles.forEach(function(v){
  if(!v.alive||v.allied)return;
  var d=Math.hypot(v.x-x,v.y-y);
  if(d<bestD){best=v;bestD=d;}
 });
 if(best){
  var flight=Math.hypot(best.x-sx,best.y-sy)/390;
  x+=clamp(best.sideVel||0,-12,12)*Math.min(1.6,flight)*.32;
  y+=clamp(((best.currentSpeed||0)+(best.speed||0))*.5,0,80)*Math.min(1.7,flight)*1.10;
 }
 f.shots.push({x:sx,y:sy,px:sx,py:sy,tx:clamp(x,20,W-20),
  ty:clamp(y,safeTop+55,H-safeBottom-65),delay:0,
  speed:390,active:true,smoke:0,
  damage:stats.damage,vehicleDamage:stats.vehicleDamage,radius:stats.radius});
 gameState.message='FLAK · 1 SCHOT';gameState.messageT=.6;
 return true;
};
// Surprise encounters unlock only AFTER the introductory missions.
// They add cover/smoke or a small flank — never huge instant swarms.
function v10RoadSurprise(){
 var g=gameState,q=V10_ROAD[g.levelIndex],b=g.v10Gradual;
 if(!b||b.surprised||q.twist==='none')return;
 b.surprised=true;b.notice=q.twist==='smoke'?'ROOKGORDIJN':'FLANK VAN RECHTS';b.noticeT=2.2;
 g.message=b.notice;g.messageT=2.1;
 if(q.twist==='smoke')startSmokeBarrage(1,.52);
 else spawnPlannedFoot(2+Math.floor(g.levelIndex/12),'rifle','flankRight',0,4);
}
var v10StepBase=update;
update=function(dt){
 v10StepBase.apply(this,arguments);
 if(!gameState||gameState.mode!=='playing'||!gameState.v10Gradual)return;
 var b=gameState.v10Gradual,q=V10_ROAD[gameState.levelIndex];
 b.noticeT=Math.max(0,b.noticeT-dt);
 if(!b.surprised&&q.twist!=='none'&&gameState.levelTime>27)v10RoadSurprise();
};
var v10DrawBase=render;
render=function(){
 v10DrawBase.apply(this,arguments);
 if(!gameState||gameState.mode!=='playing'||!gameState.v10Gradual)return;
 var q=V10_ROAD[gameState.levelIndex],b=gameState.v10Gradual;
 ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
 var top=safeTop+75;
 ctx.fillStyle='rgba(15,27,22,.88)';roundRect(ctx,10,top,W-20,24,6);ctx.fill();
 ctx.fillStyle='#e8eac6';ctx.font='800 10px system-ui';ctx.textBaseline='middle';
 ctx.textAlign='left';ctx.fillText('MAP '+(q.index+1)+'/30 · '+q.world,17,top+12,W*.62);
 ctx.textAlign='right';ctx.fillText('MG '+Math.ceil(gameState.primaryAmmo/3)+' SALVO',W-17,top+12);
 if(b.noticeT>0){
  ctx.fillStyle='#bdca9b';ctx.textAlign='center';ctx.font='900 12px system-ui';
  ctx.fillText(b.notice,W*.5,top+40,W-40);
 }
 ctx.restore();
};
// No shop interaction: automatic micro-upgrade, then "Volgende map".
var v10CompleteBase=completeLevel;
completeLevel=function(){
 if(!gameState||gameState.levelComplete)return;
 v10CompleteBase.apply(this,arguments);
 if(gameState&&gameState.mode==='shop'){
  var next=gameState.levelIndex+1;
  shopEl.style.display='none';
  if(next<30){
   subEl.textContent='MAP '+next+'/30 VOLTOOID · AUTOMATISCHE UPGRADE: '+v10UpgradeLabel(next)+
    ' · De route loopt verder naar '+V10_ROAD[next].name+'.';
   summaryEl.style.display='block';
   summaryEl.textContent='Je hoeft niets te kopen of te kiezen. Elke map maakt je wapen of bunker automatisch een klein beetje sterker.';
   deployBtn.textContent='VOLGENDE MAP →';
  }else{
   titleEl.textContent='DE HELE ROUTE VOLTOOID';
   subEl.textContent='Alle 30 maps zijn uitgespeeld. Je kunt opnieuw beginnen of via het menu een map testen.';
   deployBtn.textContent='ROUTE OPNIEUW';
  }
 }
};
var v10StartBase=startSelectedMode;
startSelectedMode=function(mode){
 v10StartBase.apply(this,arguments);
 if(!gameState||mode==='demo'||mode==='random')return;
 var el=document.getElementById('mapSelectV10'),val=el?Number(el.value)||1:1;
 val=clamp(Math.floor(val),1,30);
 if(val!==1){gameState.levelIndex=val-1;resetLevel();}
};


/* =============================================================
   V10.2 — REAL VICTORIES, UNARMED CREW, CINEMATIC AFTERMATH
   ============================================================= */

// A destroyed vehicle, not a stopped/parked/escaped vehicle, is the
// first mission's win condition. Keep it available to shoot.
var v102_spawnVehicle=spawnVehicle;
spawnVehicle=function(){
 var before=gameState&&gameState.vehicles?gameState.vehicles.length:0;
 var result=v102_spawnVehicle.apply(this,arguments);
 if(!gameState||gameState.startMode==='demo'||gameState.startMode==='random')return result;
 for(var j=before;j<gameState.vehicles.length;j++){
  var v=gameState.vehicles[j];
  if(gameState.levelIndex===0&&!gameState.v102IntroCar){
   v.v102Tutorial=true;v.hp=v.maxHp=58;v.armorHp=0;v.maxArmorHp=0;
   // Enter visibly below the HUD rather than hiding off-screen above it.
   v.y=Math.max(v.y,H*.22);
   v.hasMG=false;v.passengers=0;v.unloadLeft=0;
   gameState.v102IntroCar=v;
  }
 }
 return result;
};
var v102_resetLevel=resetLevel;
resetLevel=function(){
 v102_resetLevel.apply(this,arguments);
 if(!gameState||gameState.startMode==='demo'||gameState.startMode==='random')return;
 gameState.v102IntroCar=null;
 gameState.v102IntroDestroyed=false;
 gameState.v102Evacuated=false;
 gameState.v102VictoryHold=null;
 gameState.v102LastDestroyed=null;
 gameState.v102BurnSmokeCd=0;
 // The next-map action must never carry a "shop requires selection" lock.
 deployBtn.disabled=false;
};

// Three UNARMED occupants leave the car and flee in different directions.
// They aren't hostile combatants; shooting them is not a victory requirement.
function v102Evacuate(v){
 var g=gameState;
 if(!g||!v||g.v102Evacuated||g.levelIndex!==0)return;
 g.v102Evacuated=true;
 for(var i=0;i<3;i++){
  var side=i%2?1:-1;
  var x=clamp(v.x+(i-1)*11,18,W-18),y=clamp(v.y+(i%2)*5+12,safeTop+93,H*.67);
  var e=spawnInfantry(x,y,'medic',null,'vehicle');
  e.v102Unarmed=true;e.v102ExitSide=side;e.v102ExitAge=0;
  e.v102ExitSpeed=94+i*12;e.fireCd=9999;e.state='panic';
  e.panicT=999;e.decisionT=999;e.suppression=0;e.morale=.25;
 }
 g.message='DRIE ONBEWAPENDE INZITTENDEN VLUCHTEN';
 g.messageT=2.4;
}
var v102_enemyFire=enemyFire;
enemyFire=function(e){
 if(e&&e.v102Unarmed)return;
 return v102_enemyFire.apply(this,arguments);
};
// Same recognizable style as the world sprites, but visibly no rifle.
var v102_drawSoldier=drawSoldier;
drawSoldier=function(e){
 if(!e||!e.v102Unarmed)return v102_drawSoldier.apply(this,arguments);
 if(!e.alive)return;
 var t=gameState.time*(7.5+(e.v102ExitSpeed||33)*.06),gait=Math.sin(t),x=e.x,y=e.y;
 ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='rgba(11,19,15,.30)';ctx.beginPath();ctx.ellipse(0,5,6,2.2,0,0,TAU);ctx.fill();
 ctx.strokeStyle='#2b3028';ctx.lineWidth=2.8;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(-2,-2);ctx.lineTo(-3-gait*2,4);
 ctx.moveTo(2,-2);ctx.lineTo(3+gait*2,4);ctx.stroke();
 ctx.fillStyle='#687657';ctx.fillRect(-4,-12,8,11);
 ctx.fillStyle='#a1ac86';ctx.fillRect(-3,-11,6,4);
 ctx.strokeStyle='#b18e75';ctx.lineWidth=2.5;
 ctx.beginPath();ctx.moveTo(-4,-10);ctx.lineTo(-8-gait,-6);
 ctx.moveTo(4,-10);ctx.lineTo(8+gait,-6);ctx.stroke();
 ctx.fillStyle='#c6a086';ctx.beginPath();ctx.arc(0,-15,3.5,0,TAU);ctx.fill();
 ctx.fillStyle='#555d4b';ctx.fillRect(-5,-19,10,3);
 ctx.restore();
};

// Vehicles are allowed to stop, but NOT to count as destroyed just
// because the driver is gone. The tutorial hull stays shootable.
var v102_updateVehicles=updateVehicles;
updateVehicles=function(dt){
 if(gameState&&gameState.levelIndex===0&&gameState.v102IntroCar){
  var v=gameState.v102IntroCar;
  if(v.alive&&v.y>H*.45&&!v.v102TutorialStopped){
   v.v102TutorialStopped=true;v.currentSpeed=0;
   v.state='driverless9935';v.hasMG=false;
   v102Evacuate(v);
  }
 }
 v102_updateVehicles.apply(this,arguments);
};

// Unlike the original engine, tutorial MG rounds damage the actual hull.
// The old engine floors MG hull health at 28%, which made true victory
// impossible with the starting weapon.
function v102ConfirmVehicle(v){
 if(!v||!gameState||v.alive)return;
 if(v.hp<=0||v.exploded||v.burnPhase9941==='burntOut'){
  if(v.v102Tutorial)gameState.v102IntroDestroyed=true;
  gameState.v102LastDestroyed={x:v.x,y:v.y};
 }
}
var v102_primaryVehicleHit=primaryVehicleHit;
primaryVehicleHit=function(v,b){
 if(!v||!v.v102Tutorial||!v.alive)return v102_primaryVehicleHit.apply(this,arguments);
 v102Evacuate(v);
 v.bulletHoles=(v.bulletHoles||0)+1;
 var result=damageVehicleBase9935(v,Math.max(2.8,(b.damage||6)*.53),'mg');
 v102ConfirmVehicle(v);
 return result;
};
var v102_damageVehicle=damageVehicle;
damageVehicle=function(v,dmg,kind){
 var result=v102_damageVehicle.apply(this,arguments);
 v102ConfirmVehicle(v);
 return result;
};

// Guard against old game logic completing a mission while a vehicle is
// still driving, parked, or disabled but visibly intact.
function v102HostilesAlive(){
 var g=gameState;
 return g.infantry.some(function(e){return e.alive&&!e.v102Unarmed;})||
  g.vehicles.some(function(v){return v.alive&&!v.allied;})||
  g.air.some(function(a){return a.alive;})||g.paras.some(function(p){return p.alive;});
}
function v102ReadyToCelebrate(){
 var g=gameState;
 if(!g||g.mode!=='playing'||g.eventCursor<g.events.length)return false;
 if(v102HostilesAlive())return false;
 if(g.levelIndex===0)return !!g.v102IntroDestroyed;
 // Each map contains vehicles. They must have been neutralized, not
 // merely passed through the battlefield and vanished.
 return (g.stats.vehicleKills||0)>0 || g.wrecks.some(function(w){return w.exploded||w.disabled||w.carcass;});
}
function v102StartAftermath(){
 var g=gameState;
 if(g.v102VictoryHold)return;
 var w=g.wrecks[g.wrecks.length-1];
 var p=g.v102LastDestroyed||(w?{x:w.x,y:w.y}:{x:W*.5,y:H*.45});
 g.v102VictoryHold={elapsed:0,x:p.x,y:p.y};
 g.message='DOEL VERNIETIGD · 5 SECONDEN NABRAND';
 g.messageT=2.1;
 if(w){w.burnT=Math.max(w.burnT||0,5.4);w.smokeCd=0;w.flameCd=0;}
 // The blast and sparks remain visible, instead of cutting straight to
 // a giant modal dialog over the intact-looking vehicle.
 emitFlame(p.x,p.y,true);
 emitSmoke(p.x,p.y,true);
}
var v102_completeLevel=completeLevel;
completeLevel=function(){
 if(!gameState||gameState.levelComplete||gameState.mode!=='playing')return;
 if(!v102ReadyToCelebrate())return;
 if(!gameState.v102VictoryHold){v102StartAftermath();return;}
 if(gameState.v102VictoryHold.elapsed<5)return;
 v102_completeLevel.apply(this,arguments);
 if(gameState.mode==='shop'){
  // renderShop() in V9 disables the Next button until a manual upgrade
  // is selected. V10 upgrades automatically; ENABLE IT after that call.
  deployBtn.disabled=false;
  deployBtn.style.pointerEvents='auto';
  deployBtn.style.opacity='1';
  var picker=document.getElementById('mapSelectV10');
  if(picker)picker.value=String(Math.min(CAMPAIGN_LENGTH,gameState.levelIndex+2));
  titleEl.textContent=gameState.levelIndex>=CAMPAIGN_LENGTH-1?
   'ROUTE VOLTOOID':'MAP '+(gameState.levelIndex+1)+' VOLTOOID';
  // The battle's exact nine-round first magazine must not be replaced
  // by the legacy shop's 40-round preview profile.
  gameState.profile.primaryMag=9+3*Math.floor(gameState.levelIndex/6);
 }
};

// The original game updates a finite mission only while playing.
// Continue to animate fading flames and smoke during the five seconds.
var v102_update=update;
update=function(dt){
 v102_update.apply(this,arguments);
 var g=gameState;
 if(!g||g.mode!=='playing'||g.startMode==='demo'||g.startMode==='random')return;
 var car=g.v102IntroCar;
 if(g.levelIndex===0&&car&&!g.v102Evacuated&&
  ((g.levelTime>8&&car.y>safeTop+75)||(!car.alive))){
  v102Evacuate(car);
 }
 for(var i=0;i<g.infantry.length;i++){
  var e=g.infantry[i];
  if(!e.v102Unarmed||!e.alive)continue;
  e.v102ExitAge+=dt;e.fireCd=9999;e.panicT=999;
  e.state='panic';e.muzzle=0;e.recoil=0;
  e.vx=e.v102ExitSide*e.v102ExitSpeed;e.vy=-9;
  e.anim+=dt*8;e.anim2+=dt*3;
  e.x+=e.vx*dt;e.y+=e.vy*dt;
  e.angle=e.v102ExitSide<0?Math.PI:0;
  if(e.v102ExitAge>3.8||e.x<5||e.x>W-5)e.alive=false;
 }
 // Evaluate victory even when evacuated, unarmed figures are still on
 // the field: the original engine counts every living soldier.
 g.infantry=g.infantry.filter(function(e){return !e.v102Unarmed||e.alive;});
 if(!g.v102VictoryHold&&v102ReadyToCelebrate())completeLevel();
 var hold=g.v102VictoryHold;
 if(!hold||g.mode!=='playing')return;
 hold.elapsed=Math.min(5.1,hold.elapsed+dt);
 var fade=1-hold.elapsed/5;
 g.v102BurnSmokeCd-=dt;
 if(g.v102BurnSmokeCd<=0&&fade>.025){
  g.v102BurnSmokeCd=.10+.32*(1-fade);
  emitSmoke(hold.x,hold.y,fade>.3);
  if(fade>.27&&Math.random()<fade*.85)emitFlame(hold.x,hold.y,fade>.58);
 }
 if(hold.elapsed>=5)completeLevel();
};
var v102_draw=render;
render=function(){
 v102_draw.apply(this,arguments);
 var g=gameState;
 if(!g||g.mode!=='playing'||!g.v102VictoryHold)return;
 var rem=Math.max(0,Math.ceil(5-g.v102VictoryHold.elapsed));
 // Guaranteed visual smoke (even when the old particle pool is full).
 // The gray plumes rise, spread, then fade completely at 5 seconds.
 var h=g.v102VictoryHold,fade=clamp(1-h.elapsed/5,0,1);
 ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
 for(var puff=0;puff<8;puff++){
  var phase=(h.elapsed*.36+puff*.175)%1,
      px=h.x+Math.sin(h.elapsed*.95+puff*2.1)*(5+phase*12),
      py=h.y-9-phase*(30+55*h.elapsed/5)-puff*.7,
      radius=8+phase*22+(1-fade)*8,
      alpha=fade*(1-phase)*.28;
  if(alpha<=.006)continue;
  var cloud=ctx.createRadialGradient(px,py,1,px,py,radius);
  cloud.addColorStop(0,'rgba(64,66,63,'+(alpha*.88)+')');
  cloud.addColorStop(.58,'rgba(95,101,96,'+(alpha*.60)+')');
  cloud.addColorStop(1,'rgba(131,134,129,0)');
  ctx.fillStyle=cloud;ctx.beginPath();ctx.arc(px,py,radius,0,TAU);ctx.fill();
 }
 // The flame is strongest immediately after destruction, then dies down.
 if(h.elapsed<2.5){
  var flicker=.9+Math.sin(h.elapsed*21)*.11;
  ctx.globalAlpha=clamp((2.5-h.elapsed)/2.5,0,1)*.78;
  ctx.fillStyle='#e58535';ctx.beginPath();
  ctx.ellipse(h.x,h.y-7,6*flicker,10*flicker,0,0,TAU);ctx.fill();
  ctx.fillStyle='#f5d27c';ctx.beginPath();
  ctx.ellipse(h.x,h.y-7,2.5*flicker,5*flicker,0,0,TAU);ctx.fill();
 }
 ctx.restore();
 ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
 ctx.fillStyle='rgba(23,31,24,.86)';
 roundRect(ctx,13,safeTop+108,W-26,32,9);ctx.fill();
 ctx.font='800 12px system-ui';ctx.fillStyle='#f3d48a';ctx.textBaseline='middle';
 ctx.textAlign='center';ctx.fillText('DOEL VERNIETIGD · WRAK BRANDT · '+rem+'s',W*.5,safeTop+124,W-45);
 ctx.restore();
};
// The visual effect is a deliberate pause, not free damage farming.
var v102_fireMG=queueMG;
queueMG=function(x,y){
 return v102_fireMG.apply(this,arguments);
};
var v102_fireFlak=fireFlak9950;
fireFlak9950=function(x,y){
 return v102_fireFlak.apply(this,arguments);
};

// Native iPhone <button> click, handled in capture phase before any legacy
// shop listeners. Also sync the test-map selector for subsequent play.
function v102NextMap(ev){
 if(!gameState||gameState.mode!=='shop')return;
 if(ev&&ev.preventDefault)ev.preventDefault();
 if(ev&&ev.stopImmediatePropagation)ev.stopImmediatePropagation();
 var next=gameState.levelIndex+1;
 if(next>=CAMPAIGN_LENGTH)next=0;
 gameState.levelIndex=next;
 var picker=document.getElementById('mapSelectV10');
 if(picker)picker.value=String(next+1);
 overlay.classList.add('hidden');
 shopEl.style.display='none';summaryEl.style.display='none';
 deployBtn.style.display='none';deployBtn.disabled=false;
 resetLevel();
}
deployBtn.addEventListener('click',v102NextMap,true);


/* V10.2 safety: a disabled driver is NOT a destroyed vehicle.
   If the intro car gets a damaged wheel/driver from FLAK, it must
   remain shootable and cannot disappear before the player destroys it. */
var v102_neutralizeBase=neutralizeVehicle;
neutralizeVehicle=function(v,reason,fragments){
 if(v&&v.v102Tutorial&&v.alive){
  v.state='driverless9935';v.currentSpeed=0;v.sideVel=0;
  v.hasMG=false;v.driverHit=true;v.v102TutorialStopped=true;
  gameState.message='VOERTUIG STIL · MAAK HET WRAK AF';
  gameState.messageT=1.7;
  return false;
 }
 return v102_neutralizeBase.apply(this,arguments);
};
var v102_outerUpdateBase=update;
update=function(dt){
 v102_outerUpdateBase.apply(this,arguments);
 if(!gameState||gameState.levelIndex!==0||!gameState.v102IntroCar)return;
 var v=gameState.v102IntroCar;
 if(!v.alive&&!gameState.v102IntroDestroyed){
  v102ConfirmVehicle(v);
  if(gameState.mode==='playing'&&v102ReadyToCelebrate())completeLevel();
 }
};


/* ============================================================
   V10.3 — LOCKED MISSION DIRECTOR AND GUARANTEED FINISH
   Fixes iPhone screenshot: 0s freeze, surprise enemies, arcade
   overlays, locked gun and inconsistent escape animations.
   ============================================================ */
function v103Campaign(){
 return !!(gameState&&gameState.v10Gradual&&gameState.startMode!=='random'&&gameState.startMode!=='demo');
}
// The authored 30-map encounter plan is the ONLY source of new
// ordinary enemy waves. The old ambient game randomly spawned
// extra transports and units even while the victory timer ran.
var v103BattleBase=updateBattleEvents;
updateBattleEvents=function(dt){
 if(v103Campaign())return;
 return v103BattleBase.apply(this,arguments);
};
var v103RiskBase=updateDynamicRisk;
updateDynamicRisk=function(dt){
 if(v103Campaign())return;
 return v103RiskBase.apply(this,arguments);
};
// The three fugitives are animated by the deterministic escape
// controller, never by combat AI. Combat AI was turning them back
// toward the player, switching poses and triggering ghost movement.
var v103InfantryBase=updateInfantry;
updateInfantry=function(dt){
 if(!v103Campaign()||gameState.levelIndex!==0)
  return v103InfantryBase.apply(this,arguments);
 var g=gameState;
 var crew=g.infantry.filter(function(e){return e.v102Unarmed&&e.alive;});
 // No other enemy infantry exists in the tutorial.
 g.infantry=[];
 try{v103InfantryBase.apply(this,arguments);}
 finally{g.infantry=crew;}
};
// Use the original game's fully animated character atlas, not
// temporary block/line drawings. Medics have an unarmed look.
drawSoldier=function(e){
 if(e&&e.v102Unarmed){e.role='medic';e.muzzle=0;e.rocketUnit=false;}
 return v102_drawSoldier.apply(this,arguments);
};
// Hide legacy strike/reinforcement buttons which overlap the
// FLAK and gaming area on small iPhones.
function v103HideLegacySupport(){
 var ui=document.getElementById('jbdLadderPanel925');
 if(ui&&gameState){
  ui.style.display=v103Campaign()?'none':'grid';
  ui.style.pointerEvents=v103Campaign()?'none':'auto';
 }
}
var v103ResetBase=resetLevel;
resetLevel=function(){
 v103ResetBase.apply(this,arguments);
 v103HideLegacySupport();
};
// V10.2 re-tested whether there were still enemies *after* the
// five-second burn pause. Ambient enemies made that fail forever.
// V10.3 guarantees level completion when the countdown expires.
var v103CompleteBase=completeLevel;
completeLevel=function(){
 if(!v103Campaign())return v103CompleteBase.apply(this,arguments);
 if(!gameState||gameState.mode!=='playing'||gameState.levelComplete)return;
 var hold=gameState.v102VictoryHold;
 if(!hold)return v103CompleteBase.apply(this,arguments);
 if(hold.elapsed<5)return;
 // Call the V10 completion formatter directly, skipping the
 // now-irrelevant second enemy-count check.
 v102_completeLevel.apply(this,arguments);
 if(gameState.mode!=='shop')return;
 deployBtn.disabled=false;
 deployBtn.style.display='block';
 deployBtn.style.pointerEvents='auto';
 deployBtn.style.opacity='1';
 shopEl.style.display='none';
 titleEl.textContent=gameState.levelIndex>=CAMPAIGN_LENGTH-1?
  'ROUTE VOLTOOID':'MAP '+(gameState.levelIndex+1)+' VOLTOOID';
 var picker=document.getElementById('mapSelectV10');
 if(picker)picker.value=String(Math.min(CAMPAIGN_LENGTH,gameState.levelIndex+2));
};
// Prevent a victory countdown from acquiring additional combat
// contacts, and make sure the correct clock can always advance.
var v103UpdateBase=update;
update=function(dt){
 var before=gameState,holding=!!(before&&before.v102VictoryHold);
 v103UpdateBase.apply(this,arguments);
 var g=gameState;
 if(!g||!v103Campaign())return;
 v103HideLegacySupport();
 if(holding&&g.mode==='playing'&&g.v102VictoryHold){
  g.infantry=g.infantry.filter(function(e){return e.v102Unarmed&&e.alive;});
  g.vehicles=g.vehicles.filter(function(v){return v.allied&&v.alive;});
  g.air=[];g.paras=[];
  g.eventCursor=g.events.length;
 }
 if(g.mode==='playing'&&g.v102VictoryHold&&g.v102VictoryHold.elapsed>=5)
  completeLevel();
};
// No temporary enemy-side combat interface should cover the
// cinematic celebration or confuse the very first map.
var v103RenderBase=render;
render=function(){
 v103RenderBase.apply(this,arguments);
 if(v103Campaign())v103HideLegacySupport();
};
