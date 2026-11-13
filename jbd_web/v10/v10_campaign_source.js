
/* =========================================================
   JUST BUNKER DEFENSE V10 — SHORT-FORM CAMPAIGN
   Forty authored missions; one map identity, encounter and
   timed tactical surprise per mission. Original combat AI,
   vehicles, audio, ballistics and touch controls are retained.
   ========================================================= */
var V10_MISSIONS=[
 // name | biome | terrain feature | road layout | encounter | surprise | seconds
 'DENNENVAL|forest|dense_forest|dogleg|skirmish|flank|21',
 'TWEE BRUGGEN|village|river_crossing|cross|scouts|smoke|22',
 'DUINENSTORM|coast|beachhead|curve|rush|storm|23',
 'SPOOR 9|industrial|rail_yard|cross|convoy|signal|25',
 'WITTE PAS|snow|winter_road|dogleg|pincer|blizzard|24',
 'VERLATEN POST|ruins|rubble_quarter|s|feint|eclipse|24',
 'BRANDSTOFDEPOT|industrial|factory_belt|straight|rush|fire|26',
 'NACHTPRAUW|coast|port|curve|ambush|flank|24',
 'ZANDTRECHTER|desert|desert_ridge|s|scouts|dust|25',
 'DE LAATSTE BOOM|forest|fortified_line|dogleg|laststand|shell|27',
 'KERKPLEIN|village|urban_blocks|cross|crossfire|signal|24',
 'DE GEHEIME WEG|suburb|hedgerow|s|feint|counter|25',
 'MIST OVER ZEE|coast|coastal_fort|curve|airdrop|fog|26',
 'ZWARTE KOOIMIJN|industrial|factory_belt|straight|armored|fire|26',
 'MOTORBENDEN|desert|open_fields|dogleg|bikes|raid|22',
 'SCHADUWOVERVAL|forest|dense_forest|s|pincer|eclipse|25',
 'GESLOTEN SLUIS|village|bridge|cross|convoy|smoke|28',
 'VERBRIJZELDE LAAN|ruins|urban_blocks|cross|crossfire|shell|27',
 'BEVROREN SPOOR|snow|rail_yard|straight|scouts|blizzard|26',
 'RADARSTORM|coast|airfield|straight|airdrop|signal|27',
 'NOODSEIN|suburb|urban_blocks|cross|ambush|counter|27',
 'IJZEREN VAL|industrial|fortified_line|dogleg|armored|fire|28',
 'KLOOF VAN AS|desert|desert_ridge|curve|pincer|dust|27',
 'VLIEGVELD X|coast|airfield|straight|airdrop|plane|27',
 'ROOKGORDIJN|forest|hedgerow|s|feint|smoke|25',
 'GEVAARLIJKE HAARSPLED|snow|winter_road|dogleg|bikes|raid|26',
 'VIER HOEKEN|metropolis|urban_blocks|cross|crossfire|flank|29',
 'GRANAATSTRAAT|ruins|rubble_quarter|cross|laststand|shell|30',
 'STILLE KONVOOI|industrial|rail_yard|straight|convoy|eclipse|28',
 'LAATSTE VEERPONT|coast|lagoon_causeway|curve|armored|fog|29',
 'DUBBELE HINDERLAAG|forest|encirclement|s|pincer|counter|27',
 'RODE ZON|desert|open_fields|curve|rush|dust|27',
 'IJSPALEIS|snow|fortified_line|dogleg|laststand|blizzard|30',
 'NACHTSHIFT|industrial|factory_belt|cross|crossfire|eclipse|30',
 'BUNKER BIJ DE PIER|coast|cliff_battery|curve|armored|plane|31',
 'NOORDERSTATION|metropolis|urban_blocks|cross|convoy|signal|30',
 'BOSSEN VAN GLAS|forest|dense_forest|s|ambush|fire|28',
 'STALEN CIRKEL|industrial|fortified_line|cross|laststand|shell|32',
 'BASTION ZERO|ruins|ridge_fortress|dogleg|armored|counter|33',
 'HET LAATSTE UUR|metropolis|urban_blocks|cross|finale|storm|34'
].map(function(line,i){
 var a=line.split('|'),chapter=Math.floor(i/10);
 return {index:i,name:a[0],theme:a[1],feature:a[2],layout:a[3],recipe:a[4],twist:a[5],
 seconds:Number(a[6]),chapter:chapter,year:i<30?'1944':'1945',
 theater:['FRONTLINE · WOODS','FRONTLINE · COAST','FRONTLINE · CITY','FRONTLINE · FINALE'][chapter]};
});
if(V10_MISSIONS.length!==40)throw new Error('V10 requires 40 mission layouts');
var V10_RECIPES=['skirmish','scouts','rush','convoy','pincer','feint','ambush','armored','crossfire','airdrop','bikes','laststand','finale'];
var V10_CHAPTERS=['GREENLINE','IRON PASS','BLACKOUT','LAST STAND'];
var V10_TWISTS={flank:'FLANK ATTACK',smoke:'SMOKE SCREEN',storm:'STORM FRONT',signal:'RADIO SIGNAL',
 blizzard:'BLIZZARD',eclipse:'BLACKOUT',fire:'BURNING GROUND',dust:'DUST WALL',
 shell:'ARTILLERY STRIKE',counter:'COUNTERATTACK',fog:'SEA FOG',raid:'FAST RAID',plane:'AIR ALERT'};
// Authoritative new campaign data, entirely separate from v9.9.53.
V10_MISSIONS.forEach(function(q,i){
 var old=WORLD_TOUR_9934[i];
 var m={index:i,year:q.year,theater:q.theater,title:q.name,short:q.name,
  theme:q.theme,feature:q.feature,recipe:q.recipe,layout:q.layout,
  objective:'HOLD '+q.name,packLabel:'V10 · '+String(i+1).padStart(2,'0')+' · '+q.name,
  v10:true,twist:q.twist};
 WORLD_TOUR_9934[i]=m;
 var L=LEVELS[i];L.zone=q.chapter;L.stage=i%3;L.actStage=i%5;
 L.type=q.theater;L.theme=q.theme;L.name=q.name;L.shortTitle=q.name;L.packLabel=m.packLabel;
 L.packFeature=q.feature;L.year9934=q.year;L.theater9934=q.theater;L.historicalTitle9934=q.name;
 L.objective9934=m.objective;L.tourId9934=i;L.tourFeature9934=q.feature;
 L.tourLayout9934=q.layout;L.tourRecipe9934=q.recipe;
 L.seed=(0x33AC0197^Math.imul(i+19,0x45D9F3B))>>>0;
 var digits=tourCode9934(m,i).split('');
 // Spatial DNA: vary cover, roads, density, weather and destructibility.
 digits[16]=String((i*7+3)%10);
 digits[17]=String((i*3+2)%10);
 digits[18]=String(Math.min(9,2+(i*5)%8));
 digits[19]=String(2+(i*3)%7);
 digits[20]=String(q.theme==='forest'?9:q.theme==='snow'?6:q.theme==='desert'?0:(i*7)%8);
 digits[21]=String(3+(i*5)%7);
 digits[23]=String(q.twist==='blizzard'||q.twist==='fog'?8:(i*3)%7);
 L.code=digits.join('');
 var layout=tourLayout9934(i,m);
 layout.name=m.packLabel;
 layout.style=q.layout;
 layout.roadWidth=q.recipe==='bikes'||q.recipe==='convoy'?28:q.feature==='bridge'?20:19+(i%5)*2;
 layout.cover=i<5?.38+i*.05:.53+(i%4)*.09;
 layout.patches=2+(i%4);
 layout.setpieces=2+(i%3);
 layout.corridor=.21+(i%4)*.012;
 layout.secondary=['none','cross','fork','alley','yard'][i%5];
});
CAMPAIGN_BLUEPRINT=LEVELS.map(function(x){return Object.assign({},x);});
SHORT_BATTLES_987=V10_MISSIONS.map(function(q){return [q.recipe,q.name,q.seconds];});

// Extended geometry, with deliberately readable fire corridors and different playable cover.
var V10_buildMapBase=buildMap;
buildMap=function(){
 var out=V10_buildMapBase.apply(this,arguments);
 if(!gameState||!gameState.map||gameState.startMode==='demo')return out;
 var q=V10_MISSIONS[clamp(gameState.levelIndex|0,0,39)],m=gameState.map;
 m.v10Signature='V10-'+String(q.index+1).padStart(2,'0')+'-'+q.feature+'-'+q.layout+'-'+q.twist;
 m.layoutName=q.name;
 m.v10Chapter=q.chapter;
 // Per-map tactical cover: staggered positions rather than repeated horizontal rows.
 var geometry=i=>((q.index*37+i*31)%13-6);
 var archetype=q.index%5;
 for(var j=0;j<3+(q.chapter%2);j++){
  var x=(archetype===0?(j%2?.78:.20):archetype===1?(j%2?.70:.29):archetype===2?(j%2?.83:.16):archetype===3?(j%2?.64:.35):(j%2?.74:.25))*W+geometry(j)*.6,
      y=H*(.27+j*.115+(q.index%3)*.011);
  if(q.feature==='urban_blocks'||q.feature==='rubble_quarter'||q.feature==='factory_belt'){
   createHouse986(m,x,y,29+(j%3)*7,27+(j%2)*9,q.feature==='factory_belt',37000+q.index*8+j);
  }else if(q.theme==='snow'||q.theme==='desert'){
   createObstacle986(m,x,y,9+(j%3)*2,'rock',38000+q.index*8+j);
  }else{
   createObstacle986(m,x,y,7+(j%2)*2,j%2?'hedgehog':'log',39000+q.index*8+j);
  }
 }
 // A distinctive landmark and a visible gap in front of the bunker.
 m.setpieces.push({x:W*(.18+(q.index%4)*.21),y:H*(.30+(q.index%3)*.14),
  type:['roadblock','supply','rubble','timber','defense'][q.index%5],
  s:.68+(q.index%3)*.06,rot:(q.index%4-2)*.18,flip:q.index%2?-1:1});
 return out;
};

// Forty custom fast encounters — EASY and HARD have different squad sizes,
// not a slowed-down version of the same generic endless wave director.
var V10_buildPlanBase=buildEncounterPlan;
buildEncounterPlan=function(){
 if(!gameState||gameState.startMode==='demo'||gameState.startMode==='random')
   return V10_buildPlanBase.apply(this,arguments);
 var i=clamp(gameState.levelIndex|0,0,39),q=V10_MISSIONS[i],
     hard=gameState.startMode==='hard',rank=q.chapter,
     n=3+Math.floor(i/7)+(hard?2:0),ev=[],cap=2+(hard?1:0);
 var m=gameState.map,dir=levelDNA().direction;
 gameState.waveTotal=1;gameState.mgTeamsPlanned=0;gameState.wave=1;
 gameState.shortBattle={kind:'v10_'+q.recipe,label:q.name,maxDuration:q.seconds+(hard?3:0)};
 gameState.shortBattleWithdrawn=false;gameState.encounterName='V10 · '+q.name;
 function push(at,type,count,name,opts){
   return addEncounter(ev,at,type,count,0,1,name||q.name,opts||{});
 }
 function foot(at,count,mix,tactic,from){
   return push(at,'foot',Math.max(1,count),q.name,{
    roleMix:mix||'rifle',tactic:tactic||'split',direction:from==null?dir:from,rocketCount:0});
 }
 function motor(at,family,passengers,from){
   var spec=vehicleSpecFor(family,i);
   return push(at,spec.baseType,1,spec.name,{
    vehicleId:spec.id,motorCap:cap,passengersOverride:passengers||0,direction:from==null?dir:from});
 }
 var secondary=Math.min(q.seconds*.46,10);
 switch(q.recipe){
  case 'skirmish':foot(.3,n+1,'rifle','line',0);foot(secondary,2+rank,'lmg','flankRight',4);break;
  case 'scouts':motor(.3,'kubel',0,0);foot(1.4,n,'rifle','bound');motor(secondary,'horch',0,2);break;
  case 'rush':motor(.3,'motorcycle',0,2);foot(1.3,n+1,'rifle','split');motor(secondary,'quad',0,4);break;
  case 'convoy':motor(.5,'blitz',Math.min(6,2+rank),0);foot(2.3,n,'lmg','support');motor(secondary,'kubel',0,2);break;
  case 'pincer':foot(.4,n,'rifle','flankLeft',2);foot(2.1,n,'lmg','flankRight',4);break;
  case 'feint':foot(.5,Math.max(2,n-2),'rifle','line');foot(secondary,n+2,'lmg','pincer');break;
  case 'ambush':foot(.4,n,'rifle','flankRight',4);motor(2.0,'kubel',0,2);foot(secondary,2+rank,'marksman','flankLeft',2);break;
  case 'armored':motor(.45,'spah',0,0);foot(1.7,n,'rifle','support');motor(secondary,'sdkfz250',0,2);break;
  case 'crossfire':foot(.4,n,'lmg','flankLeft',2);foot(2.1,n,'rifle','flankRight',4);foot(secondary,2+rank,'marksman','support',0);break;
  case 'airdrop':push(.6,'plane',1,'PARATROOPERS');foot(1.8,n,'rifle','bound');foot(secondary,2+rank,'lmg','flankLeft',2);break;
  case 'bikes':motor(.3,'motorcycle',0,2);motor(1.5,'quad',0,4);foot(3,n,'rifle','split');break;
  case 'laststand':foot(.3,n+2,'rifle','line');foot(2.4,n,'lmg','pincer');motor(secondary,'spah',0,0);break;
  case 'finale':foot(.35,n+2,'lmg','pincer');motor(1.7,'spah',0,0);motor(4,'blitz',5,4);foot(secondary,n+3,'elite','flankLeft',2);break;
 }
 // Every map has a second distinct beat, preventing premature win
 // before the surprise; no infinite enemy spawning.
 if(q.twist==='shell'||q.twist==='fire'||q.twist==='storm')
   push(secondary+1.2,'artilleryBeat',1,'INCOMING SHELLS',{power:.65});
 else if(q.twist==='smoke'||q.twist==='blizzard'||q.twist==='fog'||q.twist==='dust'||q.twist==='eclipse')
   push(secondary+1.2,'smokeBeat',1,'VISIBILITY CHANGING',{power:.55});
 else if(q.twist==='signal'||q.twist==='plane')
   push(secondary+1.2,'opportunity',1,'RADIO OBJECTIVE',{opportunityType:'radio'});
 else push(secondary+1.2,'foot',2+rank,'SURPRISE CONTACT',{
   roleMix:i>18?'lmg':'rifle',tactic:i%2?'flankLeft':'flankRight',direction:i%2?2:4,rocketCount:0});
 if(hard)foot(secondary+2.1,2+rank,'lmg','flankRight',4);
 ev.sort(function(a,b){return a.t-b.t;});
 return ev;
};

var V10_resetBase=resetLevel;
resetLevel=function(){
 V10_resetBase.apply(this,arguments);
 if(gameState&&gameState.startMode!=='demo'&&gameState.startMode!=='random'){
   gameState.v10={surprised:false,flashed:0,weather:0,notice:V10_CHAPTERS[Math.floor(gameState.levelIndex/10)],
    objective:'SURVIVE',quota:Math.min(4,1+Math.floor(gameState.levelIndex/12)),bonus:false};
   // More responsive attack lanes; balanced for fixed 20–34-second missions.
   gameState.zoneRule.enemySpeed*=1.10;
   gameState.zoneRule.vehicleSpeed*=1.16;
   gameState.bunkerGraceT=Math.max(gameState.bunkerGraceT,1.9);
   gameState.message='V10 · '+V10_MISSIONS[gameState.levelIndex].name;
   gameState.messageT=2.0;
 }
};

// Predictable mid-mission event that materially affects the battlefield.
function v10Surprise(q){
 var v=gameState.v10;if(!v||v.surprised)return;v.surprised=true;
 v.notice=V10_TWISTS[q.twist];v.flashed=2.3;
 gameState.message='⚠ '+v.notice;gameState.messageT=2.1;
 var idx=gameState.levelIndex,hard=gameState.startMode==='hard';
 var n=2+q.chapter+(hard?1:0);
 if(q.twist==='flank'||q.twist==='counter')spawnPlannedFoot(n,'lmg',idx%2?'flankLeft':'flankRight',0,idx%2?2:4);
 else if(q.twist==='smoke'||q.twist==='fog'){startSmokeBarrage(2,.75);v.weather=5;}
 else if(q.twist==='storm'||q.twist==='shell'){startArtilleryBarrage(2,.72);v.weather=3;}
 else if(q.twist==='blizzard'||q.twist==='dust'){startSmokeBarrage(2,.58);v.weather=6;}
 else if(q.twist==='eclipse'){v.weather=4.8;spawnPlannedFoot(n,'rifle','flankLeft',0,2);}
 else if(q.twist==='fire'){
   createFireZone(W*.26,H*.39,{radius:18,burnDuration:5,burnDps:1.25,visual:1,source:'v10'},false);
   createFireZone(W*.74,H*.36,{radius:18,burnDuration:5,burnDps:1.25,visual:1,source:'v10'},false);
 }else if(q.twist==='signal'){spawnOpportunity('radio');spawnPlannedFoot(n,'rifle','flankRight',0,4);}
 else if(q.twist==='raid'){
   var spec=vehicleSpecFor('motorcycle',idx);spawnVehicle(spec.baseType,1,spec.id,2,0);
 }else if(q.twist==='plane'){spawnPlane(1);}
 v.flashed=2.3;
}
// Hard limit with a playable extraction objective. No 60–90-second
// cleanup phase against stuck AI. Require a few real kills before extraction.
function v10Extraction(){
 if(!gameState||gameState.mode!=='playing'||!gameState.v10)return;
 var v=gameState.v10,q=V10_MISSIONS[gameState.levelIndex],kills=gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills,
     limit=q.seconds+(gameState.startMode==='hard'?3:0);
 if(gameState.levelTime<limit)return;
 if(kills<v.quota&&gameState.levelTime<limit+8){
   if(!v.bonus){v.bonus=true;gameState.message='NOG '+(v.quota-kills)+' TARGET(S) VOOR EXTRACTIE';gameState.messageT=2.2;}
   return;
 }
 if(kills<v.quota){endGame('DOEL NIET GEHAALD');return;}
 gameState.shortBattleWithdrawn=true;
 gameState.message='EXTRACTIE · SECTOR VEILIG';gameState.messageT=1.5;
 gameState.eventCursor=gameState.events.length;
 gameState.infantry.forEach(function(e){e.alive=false;});
 gameState.vehicles.forEach(function(x){if(!x.allied){x.alive=false;x.currentSpeed=0;}});
 gameState.air.forEach(function(x){x.alive=false;});
 gameState.paras.length=0;
 gameState.smokeZones.length=0;gameState.artillery.length=0;
 completeLevel();
}
var V10_updateBase=update;
update=function(dt){
 V10_updateBase.apply(this,arguments);
 if(!gameState||gameState.mode!=='playing'||!gameState.v10)return;
 var q=V10_MISSIONS[gameState.levelIndex],v=gameState.v10;
 v.flashed=Math.max(0,v.flashed-dt);
 v.weather=Math.max(0,v.weather-dt);
 if(!v.surprised&&gameState.levelTime>=Math.max(4,q.seconds*.36))v10Surprise(q);
 v10Extraction();
};
var V10_renderBase=render;
render=function(){
 V10_renderBase.apply(this,arguments);
 if(!gameState||gameState.mode!=='playing'||!gameState.v10)return;
 var q=V10_MISSIONS[gameState.levelIndex],v=gameState.v10;
 ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
 if(v.weather>0){
   var alpha=clamp(v.weather/6,0,1)*(q.twist==='eclipse'?.42:q.twist==='dust'?.22:.16);
   ctx.fillStyle=q.twist==='eclipse'?'rgba(8,11,23,'+alpha+')':q.twist==='dust'?'rgba(196,165,110,'+alpha+')':'rgba(201,217,223,'+alpha+')';
   ctx.fillRect(0,safeTop+81,W,H-safeBottom-safeTop-133);
 }
 var top=safeTop+76,remain=Math.max(0,Math.ceil(q.seconds+(gameState.startMode==='hard'?3:0)-gameState.levelTime)),
     kills=gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills;
 ctx.fillStyle='rgba(14,25,21,.87)';roundRect(ctx,10,top,W-20,27,7);ctx.fill();
 ctx.fillStyle=v.flashed>0?'#f5bf74':'#a0d8bc';ctx.font='800 10px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';
 ctx.fillText('V10 '+String(gameState.levelIndex+1).padStart(2,'0')+' · '+V10_CHAPTERS[q.chapter],18,top+13,Math.max(130,W*.43));
 ctx.fillStyle='#faf2cf';ctx.textAlign='center';ctx.fillText(kills+'/'+v.quota+' K',W*.69,top+13,57);
 ctx.textAlign='right';ctx.fillText(remain+'s',W-20,top+13);
 if(v.flashed>0){
  ctx.fillStyle='rgba(68,34,20,.86)';roundRect(ctx,W*.12,H*.18,W*.76,24,6);ctx.fill();
  ctx.fillStyle='#ffdba1';ctx.textAlign='center';ctx.font='900 11px system-ui';
  ctx.fillText('⚠ '+v.notice,W*.5,H*.18+12,W*.72);
 }
 ctx.restore();
};
// No state migration: V10 starts at its own new campaign, preserving v9 saves.
SAVE_KEY='jbd_v10_quickfire_campaign_save';
