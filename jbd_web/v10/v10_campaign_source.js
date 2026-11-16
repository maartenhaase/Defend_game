
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


/* ============================================================
   V10.4 — BURNOUT SOFTLOCK, KINETIC DEATHS & AMMO COOKOFF ARCS
   Deliberately scoped to JBD V10 (never the other games).
   ============================================================ */
function v104Campaign(){return !!(gameState&&v103Campaign());}

// Distinguish a still-drivable target from a destroyed/burnt-out wreck.
// A disabled or ignited vehicle never requires a further hit after its
// actual burnout, because the old engine removes its hitbox at that point.
var v104ReadyOld=v102ReadyToCelebrate;
v102ReadyToCelebrate=function(){
 if(!v104Campaign())return v104ReadyOld.apply(this,arguments);
 var g=gameState;
 if(g.mode!=='playing'||g.eventCursor<g.events.length)return false;
 if(v102HostilesAlive())return false;
 if(g.levelIndex===0){
  var car=g.v102IntroCar;
  if(car&&!car.alive&&(car.hp<=0||car.burntOut9941||car.burnPhase9941==='burntOut'||car.burnPhase9941==='destroyed'))
   g.v102IntroDestroyed=true;
  return !!g.v102IntroDestroyed;
 }
 if(v104ReadyOld.apply(this,arguments))return true;
 return (g.stats.vehicleKills||0)>0 ||
  g.wrecks.some(function(w){return !!(w.exploded||w.carcass||w.burntOut9941||w.burnT>0);});
};

// Incendiary / ammo damage previously left an immobile, burning and
// sometimes non-targetable vehicle alive forever. Give it time to burn,
// then finish its hull through the engine's *normal* destruction path.
var v104UpdateOld=update;
update=function(dt){
 v104UpdateOld.apply(this,arguments);
 var g=gameState;
 if(!v104Campaign()||g.mode!=='playing')return;
 var remaining=g.eventCursor>=g.events.length;
 g.vehicles.forEach(function(v){
  if(!v||!v.alive||v.allied)return;
  var burning=!!v.fuelIgnited||
   v.state==='smoulder9941'||v.burnPhase9941==='cookoff'||
   v.burnPhase9941==='burntOut';
  // The engine can auto-extinguish an ammo fire just before the hull
  // becomes terminal. A previously burning, stranded target must not
  // reset its destruction clock merely because the flame went out.
  var cooledStranded=(v.v104BurnSec||0)>0&&v.burnPhase9941==='cooled9947';
  if((burning||cooledStranded) && (v.currentSpeed||0)<3){
   v.v104BurnSec=(v.v104BurnSec||0)+dt;
   if(v.v104BurnSec>5.5 && !v.v104BurnFinished){
    v.v104BurnFinished=true;
    damageVehicle(v,Math.max(150,(v.hp||0)+(v.armorHp||0)+80),'he');
    g.v102LastDestroyed={x:v.x,y:v.y};
   }
  }else v.v104BurnSec=0;
  // Targets that have physically left the bottom of the camera still
  // need to be destroyed. Return the hull to a reachable road position.
  if(remaining&&v.y>H+45&&!v.v104Returned){
   v.v104Returned=true;v.x=clamp(g.map.road.x,35,W-35);
   v.y=H*.61;v.currentSpeed=0;v.sideVel=0;v.state='driverless9935';
   v.hasMG=false;g.message='DOEL TERUG IN SCHOTSVELD';g.messageT=1.6;
  }
 });
 // The legacy AI can keep an offscreen foot soldier alive indefinitely.
 // Do not make an invisible unit block the next-map button forever.
 if(remaining&&g.levelTime>32){
  g.infantry.forEach(function(e){
   if(!e.alive||e.v102Unarmed||e.allied)return;
   var off=e.x< -55||e.x>W+55||e.y<safeTop-125||e.y>H+65;
   e.v104Offscreen=off?(e.v104Offscreen||0)+dt:0;
   if(e.v104Offscreen>6){e.alive=false;e.hp=0;e.state='dead';e.deadT=8;}
  });
 }
 // Re-evaluate the mission even if the old engine has already detached
 // the burnt target from its live-vehicle list.
 if(!g.v102VictoryHold&&v102ReadyToCelebrate())completeLevel();
 // Guard against a legacy update ending the burn hold one frame too early.
 if(g.mode==='playing'&&g.v102VictoryHold&&g.v102VictoryHold.elapsed>=5)
  completeLevel();
};

// Original atlas is retained; instead of vanishing, a fatal hit produces
// a readable 0.9-second stagger / fall / collapse before the dead pose.
var v104KillOld=killInfantry;
killInfantry=function(e,kind){
 if(e&&e.alive){
  e.v104Fall={side:((e.variant||0)%2?1:-1),
   born:gameState?gameState.time:0,thud:false};
  e.v104Flinch=0;
 }
 return v104KillOld.apply(this,arguments);
};
var v104HitOld=damageInfantry;
damageInfantry=function(e,dmg,kind){
 var alive=!!(e&&e.alive),ret=v104HitOld.apply(this,arguments);
 if(alive&&e&&e.alive){
  e.v104Flinch=.22;
  e.v104FlinchSide=((e.variant||0)%2?1:-1);
 }
 return ret;
};
var v104SpriteOld=spritePose;
spritePose=function(e){
 if(e&&!e.alive&&e.v104Fall&&!e.charred&&!e.severed9938){
  if(e.deadT<.24)return 'idle';
  if(e.deadT<.68)return 'dead1';
 }
 return v104SpriteOld.apply(this,arguments);
};
var v104SoldierOld=drawSoldier;
drawSoldier=function(e){
 if(!e)return;
 if(e.v104Fall&&!e.alive&&!e.charred&&!e.severed9938&&e.deadT<1.25){
  var t=Math.max(0,e.deadT),up=clamp(t/.64,0,1);
  var settle=1-clamp((t-.68)/.48,0,1);
  var angle=e.v104Fall.side*(1-Math.pow(1-up,3))*1.08*settle;
  ctx.save();ctx.translate(e.x,e.y+1);
  ctx.rotate(angle);ctx.translate(-e.x,-e.y-1);
  ctx.translate(0,Math.sin(Math.min(1,t/.9)*Math.PI)*2.6);
  v104SoldierOld.apply(this,arguments);ctx.restore();
  return;
 }
 if(e.alive&&e.v104Flinch>0){
  ctx.save();ctx.translate(e.x,e.y);
  ctx.rotate((e.v104FlinchSide||1)*e.v104Flinch*.65);
  ctx.translate(-e.x,-e.y);
  v104SoldierOld.apply(this,arguments);ctx.restore();
  return;
 }
 return v104SoldierOld.apply(this,arguments);
};
var v104InfantryOld=updateInfantry;
updateInfantry=function(dt){
 v104InfantryOld.apply(this,arguments);
 if(!gameState)return;
 gameState.infantry.forEach(function(e){
  if(e.v104Flinch>0)e.v104Flinch=Math.max(0,e.v104Flinch-dt);
  if(e.v104Fall&&!e.v104Fall.thud&&!e.alive&&e.deadT>=.48){
   e.v104Fall.thud=true;
   pushEffect({type:'dust',x:e.x,y:e.y+5,r:2.3,t:0,life:.36});
   AudioSys.tone('flesh',.22,{pan:clamp((e.x-W/2)/(W*.6),-.8,.8)});
  }
 });
};

// Ammunition cook-off now travels visibly further along curved ballistic
// arcs, with a short audible pop on each escaping round.
emitCookoffRound9943=function(v,angle){
 var f=field9943(),a=angle==null?rand(0,TAU):angle,speed=rand(315,455);
 var sx=v.x+Math.cos(a)*9,sy=v.y+Math.sin(a)*9;
 f.bullets.push({x:sx,y:sy,px:sx,py:sy,
  vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-45,
  life:rand(.58,.82),damage:11,source:v,v104Arc:true,v104Age:0});
 if(f.bullets.length>42)f.bullets.shift();
 pushEffect({type:'gunSpark',x:sx,y:sy,vx:Math.cos(a)*33,
  vy:Math.sin(a)*33,t:0,life:.18});
 var pan=clamp((v.x-W/2)/(W*.55),-.85,.85);
 AudioSys.weapon('MG34','lmg',.29,{pan:pan});
 if((v.cookoffShots9943||0)%2===0)AudioSys.tone('metal',.24,{pan:pan});
 v.cookoffShots9943=(v.cookoffShots9943||0)+1;
};
var v104CookoffStepOld=updateCookoffRounds9943;
updateCookoffRounds9943=function(dt){
 field9943().bullets.forEach(function(b){
  if(b.v104Arc){b.vy+=255*dt;b.v104Age+=dt;}
 });
 return v104CookoffStepOld.apply(this,arguments);
};
var v104DrawFieldOld=drawField9943;
drawField9943=function(){
 v104DrawFieldOld.apply(this,arguments);
 if(!gameState)return;
 ctx.save();ctx.lineCap='round';
 field9943().bullets.forEach(function(b){
  if(!b.v104Arc)return;
  var n=Math.hypot(b.vx,b.vy)||1;
  var len=clamp(n*.067,19,32),ux=b.vx/n,uy=b.vy/n;
  var x0=b.x-ux*len,y0=b.y-uy*len;
  var bow=Math.min(9,3+(b.v104Age||0)*11);
  var cx=(b.x+x0)*.5-uy*bow,cy=(b.y+y0)*.5+ux*bow;
  var alpha=clamp(b.life/.30,0,1);
  ctx.globalAlpha=.36*alpha;ctx.strokeStyle='#dd7b3c';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(cx,cy,b.x,b.y);ctx.stroke();
  ctx.globalAlpha=.92*alpha;ctx.strokeStyle='#ffe6a0';ctx.lineWidth=1.45;
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(cx,cy,b.x,b.y);ctx.stroke();
 });
 ctx.restore();
};


/* ============================================================
   V10.5 — ARSENAL ACCELERATION / LIVING BATTLEFIELDS
   30 curated encounters with more vehicles, mixed troop roles,
   meaningful MG + flak progression, and visible bunker damage.
   ============================================================ */
function v105Campaign(){return !!(gameState&&v103Campaign());}
function v105Magazine(i){return Math.min(60,12+3*Math.floor(i/2)+3*Math.floor(i/5));}
function v105Burst(i){return i>=13?6:i>=7?5:i>=3?4:3;}
function v105UpgradeAmounts(idx){
 idx=clamp(idx|0,0,29);
 return {rate:Math.min(SKILL_MAX,Math.round(idx*1.30)),
  special:Math.min(SKILL_MAX,Math.round(idx*1.55)),
  range:Math.min(SKILL_MAX,Math.floor(idx*.86)),
  armor:Math.min(SKILL_MAX,Math.floor(idx*.70))};
}
// The old rotation awarded just one skill point per level, and the
// starter gun stayed at nine rounds for six entire maps.
var v105EquipBase=v10Equip;
v10Equip=function(idx){
 if(!gameState||gameState.startMode==='random'||gameState.startMode==='demo')
  return v105EquipBase.apply(this,arguments);
 gameState.save.upgrades=v105UpgradeAmounts(idx);
 gameState.save.upgradeSchema9935=1;gameState.save.arsenalPoints=0;
};
v10UpgradeLabel=function(idx){
 if(idx<=0)return 'STARTBEWAPENING';
 return 'MG '+v105Magazine(idx)+' PATRONEN · '+v105Burst(idx)+'-SCHOTS SALVO · FLAK VERSTERKT';
};

// An actual hit now reduces visible HP. The legacy armour calculation
// registered many bunker hits as just 0.055 HP: rounded to zero in HUD.
var v105BulletDamageBase=bunkerBulletDamage9910;
bunkerBulletDamage9910=function(b){
 var d=v105BulletDamageBase.apply(this,arguments);
 if(!v105Campaign())return d;
 if(b&&['rocket','shell','grenade'].indexOf(b.kind)>=0)return d;
 var i=gameState.levelIndex;
 return Math.max(3.4+Math.min(1.3,i*.060),Math.min(9.0,d*(1.45+i*.018)));
};
var v105DamageBase=damageBunker;
damageBunker=function(dmg){
 var g=gameState,before=g&&g.bunker?g.bunker.hp:0;
 var result=v105DamageBase.apply(this,arguments);
 if(v105Campaign()&&g&&g.bunker){
  var taken=Math.max(0,before-g.bunker.hp);
  if(taken>.02){
   g.v105HitT=.55;g.v105LastHit=taken;
   g.screenFlash=Math.max(g.screenFlash||0,.10);
   g.shake=Math.max(g.shake||0,1.4);
   g.message='BUNKER GERAAKT · -'+taken.toFixed(1)+' HP';
   g.messageT=.70;
  }
 }
 return result;
};

// Let the MG continue damaging a vehicle's actual hull instead of
// hitting the original hard 28%-HP floor indefinitely. Armoured cars
// still resist light bullets; Flak remains noticeably more effective.
var v105VehicleHitBase=primaryVehicleHit;
primaryVehicleHit=function(v,b){
 var result=v105VehicleHitBase.apply(this,arguments);
 if(!v105Campaign()||!v||!v.alive||v.allied||v.v102Tutorial)return result;
 var range=(gameState.save.upgrades.range||0),boost=1+Math.min(.65,range*.043);
 var armor=v.vehicleClass>=3?.55:v.vehicleClass===2?.76:1;
 var amount=(b&&b.damage||6)*(.38+Math.min(.28,range*.016))*boost*armor;
 damageVehicle(v,amount,'mg');
 return true;
};

var v105PlanBase=buildEncounterPlan;
// Vehicle families all map to existing, hand-authored sprite specs.
// Special encounters are authored, not runaway infinite spawn loops.
var V105_FLEETS=[
 ['kubel','motorcycle','horch','steyr','blitz','spah','sdkfz250'],
 ['horch','kubel','steyr','motorcycle','spah','blitz','sdkfz250'],
 ['motorcycle','kubel','horch','blitz','spah','steyr','sdkfz250'],
 ['kubel','steyr','motorcycle','horch','sdkfz250','blitz','spah'],
 ['steyr','horch','kubel','spah','blitz','sdkfz250','motorcycle'],
 ['kubel','blitz','horch','motorcycle','spah','sdkfz250','steyr'],
 ['horch','motorcycle','kubel','blitz','sdkfz250','spah','steyr']
];
var V105_TWISTS=['FLANK','ROOK','LMG','KONVOOI','HINDERLAAG','SNIPER','MOTORRAID','ARTILLERIE','LUCHTAANVAL'];
function v105VehicleCount(i){return i===0?1:i<3?2:i<6?3:i<12?4:i<18?5:i<24?6:7;}
function v105InfantryCount(i){return i===0?0:Math.min(19,2+Math.floor(i*.65));}
buildEncounterPlan=function(){
 if(!gameState||gameState.startMode==='demo'||gameState.startMode==='random')
  return v105PlanBase.apply(this,arguments);
 var i=gameState.levelIndex,q=V10_ROAD[i],g=gameState;
 if(i===0)return v105PlanBase.apply(this,arguments);
 var ev=[],count=v105VehicleCount(i),feet=v105InfantryCount(i);
 var fleet=V105_FLEETS[(i-1)%V105_FLEETS.length];
 var twist=V105_TWISTS[(i-1)%V105_TWISTS.length];
 if(i<7&&twist==='ARTILLERIE')twist='ROOK';
 if(i<10&&twist==='LUCHTAANVAL')twist='MOTORRAID';
 g.shortBattle={kind:'road30',label:q.name,maxDuration:110};
 g.shortBattleWithdrawn=false;g.encounterName=q.name+' · '+q.world;
 g.waveTotal=1;g.wave=1;g.mgTeamsPlanned=0;
 function add(t,type,n,label,o){return addEncounter(ev,t,type,n,0,1,label,o||{});}
 function vehicle(t,family,k){
  var spec=vehicleSpecFor(family,i);
  var crew=(i>=4&&spec.transport)?Math.min(5,2+Math.floor(i/8)):0;
  return add(t,spec.baseType,1,'CONTACT · '+(spec.name||family).toUpperCase(),
   {vehicleId:spec.id,motorCap:Math.min(9,count+1),passengersOverride:crew,
    direction:(k%3===1?2:k%3===2?4:0)});
 }
 // Alternate arrivals so the player isn't waiting for a single slow car.
 for(var k=0;k<count;k++){
  var family=fleet[k];
  if(i<4&&['spah','sdkfz250'].indexOf(family)>=0)family='kubel';
  if(i<6&&family==='blitz'&&k>1)family='steyr';
  if(i>=8&&k===count-1&&i%6===1)family='cavalry';
  if(i>=10&&k===count-2&&i%6===4)family='quad';
  if(i>=9&&k===count-1&&i%3===0)family='sdkfz250';
  if(i>=12&&k===count-2&&i%4===0)family='spah';
  vehicle(2.3+k*(i<6?7.2:i<16?6.7:6.0),family,k);
 }
 var first=Math.max(1,Math.ceil(feet*.55)),second=feet-first;
 add(7.2,'foot',first,'INFANTERIE · '+q.name,
  {roleMix:i<3?'rifle':i<6?'mixed':i%3===0?'lmg':'mixed',
   tactic:i%3===0?'flankLeft':'line',direction:i%4===1?2:0,rocketCount:0});
 if(second)add(19,'foot',second,'TWEEDE GROEP · '+q.name,
  {roleMix:i>=9&&i%3===1?'marksman':'mixed',tactic:'split',direction:4,rocketCount:0});
 if(twist==='FLANK'||twist==='HINDERLAAG'){
  add(14.5,'foot',Math.min(4,2+Math.floor(i/9)),
   'HINDERLAAG VANUIT DE FLANK',{roleMix:'rifle',tactic:i%2?'flankRight':'flankLeft',direction:i%2?4:2,rocketCount:0});
 }else if(twist==='ROOK'){
  add(13.2,'smokeBeat',1,'ROOKGORDIJN', {power:.52});
 }else if(twist==='LMG'&&i>=3){
  add(15,'lmgSquad',2,'ZWAAR MITRAILLEURTEAM',{tactic:'flankRight',direction:4,rocketCount:0});
 }else if(twist==='KONVOOI'&&i>=4){
  add(16.5,'foot',2,'BEVEILIGING KONVOOI',{roleMix:'lmg',tactic:'bound',direction:0,rocketCount:0});
 }else if(twist==='SNIPER'&&i>=6){
  add(16.5,'marksmanSquad',2,'SCHERPSCHUTTERS',{tactic:'flankLeft',direction:2,rocketCount:0});
 }else if(twist==='MOTORRAID'){
  var bike=vehicleSpecFor('motorcycle',i);
  add(14,'jeep',1,'MOTORRAID · SNEL CONTACT',
   {vehicleId:bike.id,motorCap:count+2,passengersOverride:0,direction:4});
 }else if(twist==='ARTILLERIE'&&i>=7){
  add(17,'artilleryBeat',1,'ARTILLERIE',{power:.30});
 }else if(twist==='LUCHTAANVAL'&&i>=10){
  add(17,'plane',1,'VIJANDELIJKE VLIEGTUIGEN',{});
 }
 if(i>=10&&i%7===3){
  add(28,'plane',1,'VIJANDELIJKE VERKENNER UIT DE LUCHT',{});
 }
 if(i>=15&&i%5===3){
  add(26,'eliteSquad',3,'ELITEEENHEID VAN RECHTS',
   {tactic:'flankRight',direction:4,rocketCount:i>=21?1:0});
 }
 ev.sort(function(a,b){return a.t-b.t;});
 return ev;
};

// Vehicle sprites can actually fight early; the V10 slow-mode
// previously disabled every vehicle MG for the first five missions.
var v105SpawnBase=spawnVehicle;
spawnVehicle=function(){
 var before=gameState&&gameState.vehicles?gameState.vehicles.length:0;
 var result=v105SpawnBase.apply(this,arguments);
 if(!v105Campaign())return result;
 var i=gameState.levelIndex;
 for(var k=before;k<gameState.vehicles.length;k++){
  var v=gameState.vehicles[k];
  if(!v||v.v102Tutorial)continue;
  v.speed*=1.12+Math.min(.23,i*.009);
  v.currentSpeed*=1.12+Math.min(.23,i*.009);
  // Some early armed scouts (Horch/Kubel) declare weapon power but
  // omit the hasMG flag. Only explicit unarmed / zero-weapon vehicles
  // stay silent; otherwise the pre-V10 scout gun is restored.
  if(i>=2&&v.vehicleSpec&&v.vehicleSpec.hasMG!==false&&
    (v.vehicleSpec.hasMG||(v.vehicleSpec.weapon||0)>.05))v.hasMG=true;
  if(i>=4&&v.vehicleSpec&&v.vehicleSpec.transport&&arguments[4]>0){
   v.passengers=Math.min(6,arguments[4]);
   v.unloadLeft=v.passengers;v.unloadIndex=0;
  }
 }
 return result;
};

// MG speed, recoil, hit strength and ammo visibly rise several
// times per chapter instead of only once every 6 maps.
var v105ResetBase=resetLevel;
resetLevel=function(){
 v105ResetBase.apply(this,arguments);
 if(!v105Campaign())return;
 var g=gameState,i=g.levelIndex,p=g.profile;
 p.primaryMag=v105Magazine(i);
 p.primaryReload=Math.max(.95,2.45-i*.050);
 p.primaryDamage*=(1.16+Math.min(.72,i*.034));
 p.primarySpeed*=(1.0+Math.min(.19,i*.009));
 p.primaryCycle*=Math.max(.53,.88-i*.012);
 p.primaryBurstPause*=Math.max(.55,.91-i*.011);
 p.spreadScale*=Math.max(.63,.92-i*.010);
 g.primaryAmmo=p.primaryMag;
 g.v10Gradual.surprised=true; // authored encounters replace late ad-hoc spawns
 g.v105HitT=0;g.v105LastHit=0;
 g.message=i===0?'TRAINING · 12 PATRONEN · 1 FLAK':'MAP '+(i+1)+' · '+V10_ROAD[i].name+' · OPGEVOERDE ACTIE';
 g.messageT=2.5;
};
queueMG=function(x,y){
 if(!gameState||gameState.mode!=='playing')return false;
 if(gameState.primaryReloadT>0){gameState.message='MG HERLADEN';gameState.messageT=.36;return false;}
 if(gameState.primaryAmmo<=0){beginPrimaryReload();return false;}
 var state=fpsState9950();
 if(state.queued.length>0)return false;
 var n=Math.min(v105Burst(gameState.levelIndex),gameState.primaryAmmo);
 for(var k=0;k<n;k++)state.queued.push({x:x,y:y,tier:0,serial:k,recoil:k*.023});
 state.chain=0;state.lastClick=gameState.time;fpsFireQueue9950();
 return true;
};
// The first shell remains precisely aimed. More rounds and a wider
// blast are earned rapidly, with small secondary impacts nearby.
flakStats9951=function(level){
 level=clamp(level|0,0,SKILL_MAX);
 var i=gameState?gameState.levelIndex:0;
 return {rounds:i>=15?4:i>=8?3:i>=3?2:1,
  damage:11+level*.94,vehicleDamage:15+level*1.12,
  radius:20+Math.min(17,level*.77),
  reload:Math.max(2.55,5.6-level*.14)};
};
fireFlak9950=function(x,y){
 if(!gameState||gameState.mode!=='playing')return false;
 var f=currentFlak9950(),s=flakStats9951(gameState.save.upgrades.special||0),g=gameState;
 if(f.cooldown>0){g.message='FLAK HERLADEN · '+f.cooldown.toFixed(1)+'s';g.messageT=.48;return false;}
 if(!Number.isFinite(x)||!Number.isFinite(y)){x=g.aim.x;y=g.aim.y;}
 var sx=g.bunker.x,sy=g.bunker.y-10;
 var closest=null,dd=38;
 g.vehicles.forEach(function(v){if(!v.alive||v.allied)return;var d=Math.hypot(v.x-x,v.y-y);if(d<dd){dd=d;closest=v;}});
 if(closest){
  var flight=Math.hypot(closest.x-sx,closest.y-sy)/430;
  x+=clamp(closest.sideVel||0,-16,16)*flight*.34;
  y+=clamp(closest.currentSpeed||0,0,85)*flight*.88;
 }
 f.cooldown=s.reload;f.lastFire=g.time;
 for(var k=0;k<s.rounds;k++){
  var ox=k===0?0:(k%2?1:-1)*(8+Math.ceil(k/2)*10);
  var oy=k===0?0:(k%2?-1:1)*(6+Math.ceil(k/2)*8);
  f.shots.push({x:sx,y:sy,px:sx,py:sy,
   tx:clamp(x+ox,20,W-20),ty:clamp(y+oy,safeTop+55,H-safeBottom-65),
   delay:k*.115,speed:430+Math.min(115,gameState.levelIndex*4),
   active:true,smoke:0,damage:s.damage,vehicleDamage:s.vehicleDamage,radius:s.radius});
 }
 g.message='FLAK · '+s.rounds+' SCHOTEN';g.messageT=.60;
 return true;
};
var v105DrawBase=render;
render=function(){
 v105DrawBase.apply(this,arguments);
 if(!v105Campaign()||gameState.mode!=='playing')return;
 var g=gameState;
 if(g.v105HitT>0){
  var strength=clamp(g.v105HitT/.55,0,1);
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle='rgba(177,48,38,'+(.12*strength)+')';
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#fff2df';ctx.font='900 13px system-ui';
  ctx.textAlign='center';
  ctx.fillText('BUNKER -'+g.v105LastHit.toFixed(1)+' HP',W*.5,H-safeBottom-105);
  ctx.restore();
 }
};
var v105StepBase=update;
update=function(dt){
 v105StepBase.apply(this,arguments);
 if(!v105Campaign())return;
 gameState.v105HitT=Math.max(0,(gameState.v105HitT||0)-dt);
 // Air contacts that have fully left the playable battlefield cannot
 // leave a supposedly cleared stage stuck in 'playing' indefinitely.
 if(gameState.eventCursor>=gameState.events.length&&gameState.levelTime>42){
  gameState.air.forEach(function(a){
   if(!a.alive)return;
   var off=a.x< -150||a.x>W+150||a.y<safeTop-180||a.y>H+150;
   a.v105Gone=off?(a.v105Gone||0)+dt:0;
   if(a.v105Gone>4)a.alive=false;
  });
 }
 if(!gameState.v102VictoryHold&&v102ReadyToCelebrate())completeLevel();
};


/* ============================================================
   V10.6 — PARACHUTE LOOT CRATES / EARNED UPGRADES ONLY
   Three optional destructible supply crates per stage. All power
   and ally rewards require actually breaking a falling crate.
   ============================================================ */
function v106Campaign(){return !!(gameState&&v103Campaign());}
var V106_REWARDS=[
 {id:'flakDamage',label:'FLAK DAMAGE +',max:10},
 {id:'mgDamage',label:'MG DAMAGE +',max:10},
 {id:'flakSplash',label:'FLAK SPLASH +',max:9},
 {id:'bunkerArmor',label:'BUNKER ARMOR +',max:8},
 {id:'repair',label:'BUNKER HEALTH +',max:99,instant:true},
 {id:'mgRate',label:'MG RATE OF FIRE +',max:9},
 {id:'flakReload',label:'FLAK RELOAD +',max:9},
 {id:'flakProjectile',label:'EXTRA FLAK PROJECTIEL +',max:4},
 {id:'mgSpread',label:'MG SPREAD -',max:9},
 {id:'flakSpread',label:'FLAK SPREAD -',max:7},
 {id:'penetration',label:'BULLET PENETRATION +',max:7},
 {id:'heat',label:'MG OVERHEAT -',max:9},
 {id:'magazine',label:'MG MAG CAP +6',max:10},
 {id:'mgReload',label:'MG RELOAD SPEED +',max:9},
 {id:'obstacleDamage',label:'OBSTAKEL / VEHICLE DAMAGE +',max:9},
 {id:'elites',label:'VERSTERKING · 5 ELITES',max:99,instant:true},
 {id:'armorVehicle',label:'VERSTERKING · PANTSERWAGEN',max:99,instant:true},
 {id:'rambo',label:'VERSTERKING · RAMBO',max:99,instant:true}
];
function v106Perks(){
 if(!gameState||!gameState.save)return {};
 return gameState.save.v106Perks||(gameState.save.v106Perks={});
}
function v106Rank(id){return v106Perks()[id]||0;}
function v106Magazine(){return Math.min(72,12+6*v106Rank('magazine'));}
// These are no longer unlocked merely by reaching a numbered map.
v105Magazine=function(){return v106Magazine();};
v105Burst=function(){return 3;};
v10Equip=function(){
 if(!gameState||!gameState.save)return;
 gameState.save.upgrades={range:0,rate:0,armor:0,special:0};
 gameState.save.arsenalPoints=0;
};
v10UpgradeLabel=function(){return 'WAPENS WORDEN ALLEEN BETER VIA KISTEN';};
// Imported V10.5 upgrades are ignored: loot is authoritative.
var v106FreshOld=freshState;
freshState=function(){
 var g=v106FreshOld.apply(this,arguments);
 try{
  var prior=loadSave();
  if(prior&&prior.v106Perks){
   g.save.v106Perks=Object.assign({},prior.v106Perks);
   g.save.v106CratesOpened=prior.v106CratesOpened||0;
  }
 }catch(_){}
 return g;
};

function v106ApplyProfile(isPickup){
 var g=gameState,p=g.profile,oldMax=g.bunker.maxHp,oldMag=p.primaryMag;
 var oldHP=g.bunker.hp,oldAmmo=g.primaryAmmo;
 // Always reconstruct from the real base weapon instead of stacking
 // modifiers repeatedly or relying on any level-index bonus.
 var base=playerProfile();
 var n=v106Rank;
 base.primaryDamage*=1+.16*n('mgDamage');
 base.primarySpeed*=1+.24*n('penetration');
 base.primaryPenetration=1+n('penetration');
 base.primaryPenetrationChance=Math.min(.88,.12+.13*n('penetration'));
 base.primaryPenetrationLevel=n('penetration');
 base.primaryVisual=Math.min(9,n('penetration')+1);
 base.primaryCycle*=Math.pow(.84,n('mgRate'));
 base.primaryBurstPause*=Math.pow(.88,n('mgRate'));
 base.spreadScale*=Math.pow(.83,n('mgSpread'));
 base.primaryReload=Math.max(.55,2.65*Math.pow(.87,n('mgReload')));
 base.primaryMag=v106Magazine();
 base.heatScale*=Math.pow(.78,n('heat'));
 base.cool+=n('heat')*.055;
 base.maxHp*=1+.12*n('bunkerArmor');
 base.armorScale=Math.max(.30,base.armorScale*Math.pow(.91,n('bunkerArmor')));
 g.profile=base;
 g.bunker.maxHp=base.maxHp;
 if(isPickup){
  g.bunker.hp=Math.min(base.maxHp,oldHP+Math.max(0,base.maxHp-oldMax));
  g.primaryAmmo=Math.min(base.primaryMag,oldAmmo+Math.max(0,base.primaryMag-oldMag));
 }else{
  g.bunker.hp=base.maxHp;
  g.primaryAmmo=base.primaryMag;
 }
}
var v106ResetOld=resetLevel;
resetLevel=function(){
 v106ResetOld.apply(this,arguments);
 if(!v106Campaign())return;
 v106ApplyProfile(false);
 gameState.v106Crates=[];
 gameState.v106Spawned=0;
 gameState.v106Schedule=[1.6+rand(0,.7),6.3+rand(0,1.0),11.3+rand(0,1.3)];
 gameState.v106Message=null;
 gameState.v106MessageT=0;
 gameState.v10Gradual.surprised=true;
 gameState.message='KISTEN MET PARACHUTES · SCHIET ZE OPEN VOOR UPGRADES';
 gameState.messageT=3.0;
};

// No hidden upgrades or free units from kill milestones.
var v106RewardOld=arcadeKillReward;
arcadeKillReward=function(){
 if(!v106Campaign())return v106RewardOld.apply(this,arguments);
 if(gameState.arcade)gameState.arcade.focus=Math.min(100,gameState.arcade.focus+9);
};

flakStats9951=function(){
 var extra=v106Rank('flakProjectile');
 return {rounds:1+extra,
  damage:11+2.7*v106Rank('flakDamage'),
  vehicleDamage:15+4.0*v106Rank('flakDamage'),
  radius:20+3.0*v106Rank('flakSplash'),
  reload:Math.max(1.5,5.6*Math.pow(.86,v106Rank('flakReload')))};
};
var v106FlakFireOld=fireFlak9950;
fireFlak9950=function(x,y){
 var f=currentFlak9950(),before=f.shots.length;
 var out=v106FlakFireOld.apply(this,arguments);
 if(!out||!v106Campaign())return out;
 var tight=Math.max(.24,1-v106Rank('flakSpread')*.12);
 var shots=f.shots.slice(before);
 if(shots.length){
  var cx=shots[0].tx,cy=shots[0].ty;
  for(var i=1;i<shots.length;i++){
   shots[i].tx=clamp(cx+(shots[i].tx-cx)*tight,20,W-20);
   shots[i].ty=clamp(cy+(shots[i].ty-cy)*tight,safeTop+55,H-safeBottom-65);
  }
 }
 return out;
};

// Penetration is not just a number: it increases actual projectile
// velocity and raises the chance of passing *successive* wall hits.
var v106CoverOld=damageCover;
damageCover=function(c,dmg,source,x,y){
 if(v106Campaign()&&(source==='bullet'||source==='mg'))
  dmg*=1+.65*v106Rank('obstacleDamage');
 return v106CoverOld.call(this,c,dmg,source,x,y);
};
var v106VehicleOld=primaryVehicleHit;
primaryVehicleHit=function(v,b){
 if(v106Campaign()&&b&&v&&v.alive){
  // This is scoped to vehicles; regular MG damage is applied in the
  // normal hit resolver and gets an extra component-damage boost here.
  var boost=1+.24*v106Rank('obstacleDamage');
  if(boost>1)b.damage*=boost;
  try{return v106VehicleOld.apply(this,arguments);}
  finally{if(boost>1)b.damage/=boost;}
 }
 return v106VehicleOld.apply(this,arguments);
};

function v106SpawnRewardCrate(){
 var g=gameState,chosenX=W*.5,land=H*rand(.44,.65);
 for(var k=0;k<14;k++){
  var xx=rand(W*.15,W*.85),yy=land;
  var crowded=g.v106Crates.some(function(c){return Math.abs(c.x-xx)<55;});
  var blocked=(g.map.cover||[]).some(function(c){return !c.destroyed&&Math.hypot(c.x-xx,c.y-yy)<(c.r||25)+21;});
  if(!crowded&&!blocked){chosenX=xx;break;}
 }
 var n=g.v106Spawned,health=54+Math.min(34,g.levelIndex*1.05);
 var c={id:Math.random()*1e9|0,x:chosenX,y:safeTop+125,
  landY:land,maxHp:health,hp:health,vy:rand(32,47),age:0,
  sway:rand(0,TAU),opened:false,landed:false,flash:0,index:n};
 g.v106Crates.push(c);g.v106Spawned++;
 AudioSys.tone('metal',.24,{pan:clamp((c.x-W*.5)/(W*.55),-.8,.8)});
 g.message='PARACHUTEKIST '+g.v106Spawned+'/3 · SCHIET OPEN VOOR UPGRADE';
 g.messageT=1.4;
 return c;
}
function v106RollReward(){
 var all=V106_REWARDS.filter(function(r){
  if(!r.instant&&v106Rank(r.id)>=r.max)return false;
  if(r.id==='repair'&&gameState.bunker.hp>=gameState.bunker.maxHp*.94)return false;
  if(r.id==='armorVehicle'&&gameState.arcade.armor.some(function(v){return v.alive;}))return false;
  return true;
 });
 if(!all.length)return V106_REWARDS[0];
 return all[(Math.random()*all.length)|0];
}
function v106GrantReward(){
 var g=gameState,r=v106RollReward(),p=v106Perks(),b=g.bunker;
 if(!r.instant){p[r.id]=(p[r.id]||0)+1;v106ApplyProfile(true);}
 else if(r.id==='repair'){
  b.hp=Math.min(b.maxHp,b.hp+b.maxHp*.38);
 }else if(r.id==='elites'){
  for(var i=0;i<5;i++){
   var x=clamp(b.x+(i-2)*21,22,W-22);
   var u=createAlliedInfantry(x,b.y-18-rand(0,20),i%2?'lmg':'marksman');
   u.hp=u.maxHp=65;u.armorHp=u.maxArmorHp=20;
   u.aimSkill=2.2;u.assignment='advance';u.fireCd=.1;
   g.arcade.allies.push(u);
  }
 }else if(r.id==='armorVehicle'){
  spawnAlliedArmor(85);
  var v=g.arcade.armor[g.arcade.armor.length-1];
  if(v){v.hp=v.maxHp=Math.max(175,v.maxHp*1.3);v.armorHp=Math.max(40,v.armorHp||0);}
 }else if(r.id==='rambo'){
  var rambo=createAlliedInfantry(clamp(b.x+rand(-40,40),25,W-25),b.y-28,'lmg');
  rambo.v106Rambo=true;
  rambo.hp=rambo.maxHp=180;rambo.armorHp=rambo.maxArmorHp=75;
  rambo.aimSkill=4;rambo.speed*=1.26;
  rambo.fireCd=.05;rambo.ammo9930=100;rambo.assignment='advance';
  g.arcade.allies.push(rambo);
 }
 g.save.v106CratesOpened=(g.save.v106CratesOpened||0)+1;
 saveGame();
 g.v106Message={label:r.label,time:2.7};
 g.v106MessageT=2.7;g.message='KIST GEOPEND · '+r.label;g.messageT=2.4;
 AudioSys.tone('metal',.90);
 gameState.shake=Math.max(gameState.shake||0,2.1);
 return r;
}
function v106DamageCrate(c,damage,kind){
 if(!c||c.opened||!v106Campaign()||gameState.mode!=='playing')return false;
 c.hp=Math.max(0,c.hp-Math.max(0,damage));
 c.flash=.16;
 for(var n=0;n<3;n++)pushEffect({type:'woodChip913',x:c.x+rand(-10,10),
  y:c.y+rand(-6,6),vx:rand(-55,55),vy:rand(-65,5),rot:0,vr:rand(-9,9),t:0,life:.36});
 AudioSys.impact('wood',.50,{pan:clamp((c.x-W*.5)/(W*.55),-.8,.8)});
 if(c.hp<=0){
  c.opened=true;
  emitGroundImpact(c.x,c.y,1.1,'wood');
  for(var n=0;n<9;n++)pushEffect({type:'woodChip913',x:c.x,y:c.y,
   vx:rand(-95,95),vy:rand(-110,-15),rot:rand(0,TAU),vr:rand(-12,12),t:0,life:.65});
  c.reward=v106GrantReward().label;c.rewardT=2.3;
  return true;
 }
 return false;
}
// Match a bullet's real swept segment against crate volume. Check
// world collisions first so loot cannot be shot *through* an intact wall
// without having earned the penetration ability.
var v106BallisticOld=resolveBallisticSegment9936;
resolveBallisticSegment9936=function(b,obstacles,actors){
 if(v106Campaign()&&b&&b.kind==='mg'&&actors!==false){
  var hits=collectBallisticContacts9936(b,obstacles,actors);
  var first=hits.length?hits[0].t:2,best=null,bestT=2;
  gameState.v106Crates.forEach(function(c){
   if(c.opened)return;
   var t=segmentCircleContact9936(b,c.x,c.y,15*DEVICE.hitRadius);
   if(t!==null&&t<=first+.00001&&t<bestT){best=c;bestT=t;}
  });
  if(best){
   b.x=b.px+(b.x-b.px)*bestT;
   b.y=b.py+(b.y-b.py)*bestT;
   v106DamageCrate(best,7,'mg');
   gameState.stats.hits++;
   return true;
  }
 }
 return v106BallisticOld.apply(this,arguments);
};
var v106FlakBlastOld=explodeFlak9950;
explodeFlak9950=function(x,y,shell){
 var out=v106FlakBlastOld.apply(this,arguments);
 if(v106Campaign())gameState.v106Crates.forEach(function(c){
  if(!c.opened&&Math.hypot(c.x-x,c.y-y)<=Math.max(20,(shell&&shell.radius||20)+9))
   v106DamageCrate(c,13,'flak');
 });
 return out;
};
// All three drops appear before the five-second cinematic victory hold.
// Players can ignore them, but cannot receive their rewards for free.
var v106VictoryOld=v102ReadyToCelebrate;
v102ReadyToCelebrate=function(){
 if(v106Campaign()&&(gameState.v106Spawned||0)<3)return false;
 return v106VictoryOld.apply(this,arguments);
};
var v106UpdateOld=update;
update=function(dt){
 v106UpdateOld.apply(this,arguments);
 if(!v106Campaign()||gameState.mode!=='playing')return;
 var g=gameState;
 while(g.v106Spawned<3&&g.levelTime>=g.v106Schedule[g.v106Spawned])
  v106SpawnRewardCrate();
 // Deliver any remaining crates rapidly after a fast enemy wipe.
 // This prevents an empty battlefield from forcing a long wait.
 if(g.eventCursor>=g.events.length&&!v102HostilesAlive()&&g.v106Spawned<3){
  g.v106QuickDrop=(g.v106QuickDrop||0)+dt;
  if(g.v106QuickDrop>.68){g.v106QuickDrop=0;v106SpawnRewardCrate();}
 }else g.v106QuickDrop=0;
 g.v106Crates.forEach(function(c){
  if(c.opened){c.rewardT=Math.max(0,(c.rewardT||0)-dt);return;}
  c.age+=dt;c.flash=Math.max(0,c.flash-dt);
  if(!c.landed){
   c.y=Math.min(c.landY,c.y+c.vy*dt);
   c.x+=Math.sin(c.age*2+c.sway)*dt*4.2;
   if(c.y>=c.landY)c.landed=true;
  }
 });
 g.v106MessageT=Math.max(0,g.v106MessageT-dt);
 if(!g.v102VictoryHold&&v102ReadyToCelebrate())completeLevel();
};

function v106DrawCrate(c){
 if(c.opened){
  if(c.rewardT>0){
   ctx.save();ctx.globalAlpha=Math.min(1,c.rewardT*2);
   ctx.fillStyle='#d7f2ba';ctx.font='900 10px system-ui';
   ctx.textAlign='center';ctx.fillText(c.reward,c.x,c.y-25,200);
   ctx.restore();
  }
  return;
 }
 var x=c.x,y=c.y,bob=Math.sin(c.age*3+c.sway)*1.1;
 ctx.save();
 if(!c.landed){
  var py=y-43+bob;
  ctx.fillStyle='#d1c9a3';ctx.strokeStyle='#394338';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(x-23,py+3);ctx.bezierCurveTo(x-28,py-26,x+26,py-32,x+24,py+3);
  ctx.quadraticCurveTo(x+13,py+8,x+8,py+3);ctx.quadraticCurveTo(x,py+8,x-8,py+3);ctx.quadraticCurveTo(x-14,py+8,x-23,py+3);
  ctx.fill();ctx.stroke();
  ctx.strokeStyle='#75674d';ctx.lineWidth=1.1;ctx.beginPath();
  ctx.moveTo(x-23,py+3);ctx.lineTo(x-11,y-12);
  ctx.moveTo(x+24,py+3);ctx.lineTo(x+11,y-12);
  ctx.moveTo(x,py-12);ctx.lineTo(x,y-12);ctx.stroke();
 }else{
  ctx.fillStyle='rgba(28,25,18,.30)';ctx.beginPath();ctx.ellipse(x,y+13,18,4,0,0,TAU);ctx.fill();
 }
 ctx.translate(x,y);
 ctx.fillStyle=c.flash>0?'#f4dfa6':'#a77e45';
 ctx.strokeStyle='#302b20';ctx.lineWidth=1.8;ctx.beginPath();
 ctx.rect(-13,-12,26,24);ctx.fill();ctx.stroke();
 ctx.fillStyle='#81603b';ctx.fillRect(-12,-10,24,5);ctx.fillRect(-12,4,24,5);
 ctx.strokeStyle='#d3b77e';ctx.lineWidth=2;ctx.beginPath();
 ctx.moveTo(-11,-10);ctx.lineTo(11,10);ctx.moveTo(11,-10);ctx.lineTo(-11,10);ctx.stroke();
 ctx.fillStyle='#f4da77';ctx.font='900 16px system-ui';ctx.textAlign='center';
 ctx.fillText('?',0,5);
 ctx.restore();
 // Health bar is deliberately readable at native iPhone resolution.
 var hp=clamp(c.hp/c.maxHp,0,1);
 ctx.fillStyle='rgba(16,24,18,.88)';roundRect(ctx,x-22,y-24,44,7,2);ctx.fill();
 ctx.fillStyle='#cf5748';roundRect(ctx,x-20,y-22,40,3,1);ctx.fill();
 ctx.fillStyle=hp>.44?'#8bd083':'#efb65d';
 if(hp>0){roundRect(ctx,x-20,y-22,40*hp,3,1);ctx.fill();}
}
var v106RenderOld=render;
render=function(){
 v106RenderOld.apply(this,arguments);
 if(!v106Campaign()||gameState.mode!=='playing')return;
 var g=gameState;
 ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
 g.v106Crates.forEach(v106DrawCrate);
 if(g.v106MessageT>0&&g.v106Message){
  ctx.save();ctx.globalAlpha=Math.min(1,g.v106MessageT*2);
  ctx.fillStyle='rgba(21,44,30,.88)';
  roundRect(ctx,12,safeTop+143,W-24,30,8);ctx.fill();
  ctx.font='900 12px system-ui';ctx.textAlign='center';
  ctx.fillStyle='#d8f1b0';ctx.fillText(g.v106Message.label,W*.5,safeTop+162,W-40);
  ctx.restore();
 }
 g.arcade.allies.forEach(function(a){
  if(!a.alive||!a.v106Rambo)return;
  ctx.fillStyle='#bdf0a0';ctx.font='900 10px system-ui';ctx.textAlign='center';
  ctx.fillText('RAMBO',a.x,a.y-25);
 });
 ctx.restore();
};


var v106CompleteOld=completeLevel;
completeLevel=function(){
 var g=gameState,previous=g&&g.mode;
 var out=v106CompleteOld.apply(this,arguments);
 if(v106Campaign()&&g.mode==='shop'&&previous!=='shop'){
  var opened=(g.v106Crates||[]).filter(function(c){return c.opened;}).length;
  subEl.textContent='MAP '+(g.levelIndex+1)+'/30 VOLTOOID · '+opened+'/3 KISTEN GEOPEND';
  summaryEl.style.display='block';
  summaryEl.textContent='Geen automatische upgrades. Alleen kapotgeschoten parachutekisten geven verbeteringen of eenmalige versterkingen.';
  deployBtn.textContent=g.levelIndex>=29?'NIEUWE CAMPAGNE →':'VOLGENDE MAP →';
 }
 return out;
};

