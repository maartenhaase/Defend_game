(function(){
'use strict';

var canvas=document.getElementById('game');
var ctx=canvas.getContext('2d',{alpha:false});
var overlay=document.getElementById('overlay');
var titleEl=document.getElementById('title');
var subEl=document.getElementById('sub');
var deployBtn=document.getElementById('deploy');
var restartBtn=document.getElementById('restart');
var shopEl=document.getElementById('shop');
var shopGrid=document.getElementById('shopGrid');
var supplyEl=document.getElementById('supply');
var summaryEl=document.getElementById('summary');
var safeProbe=document.getElementById('safeProbe');

var TAU=Math.PI*2;
var SAVE_KEY='jbd_v7_1_full_range_save';
var DPR=1,W=0,H=0,safeTop=0,safeBottom=0,last=0;
var state=null;

var PALETTES={
  jungle:{ground:'#758263',ground2:'#68765a',road:'#988b69',roadEdge:'#5b604e',line:'#343a31',veg:'#4d6544',veg2:'#62754f',building:'#8d8067',roof:'#655d4e',trench:'#504638',rock:'#6a685c'},
  desert:{ground:'#b5a57b',ground2:'#a8966d',road:'#928365',roadEdge:'#6d624d',line:'#443f35',veg:'#7d8058',veg2:'#929166',building:'#9a8467',roof:'#74624f',trench:'#67513d',rock:'#786d5d'},
  polar:{ground:'#c2cbc6',ground2:'#b1bdb7',road:'#9eaaa4',roadEdge:'#747e79',line:'#414a46',veg:'#72867d',veg2:'#8b9a92',building:'#929b96',roof:'#6f7874',trench:'#5f665f',rock:'#7a8583'}
};
var MAPS=[
  {name:'Jungle Outpost',theme:'jungle',seed:11},{name:'Jungle Road',theme:'jungle',seed:23},{name:'Jungle Compound',theme:'jungle',seed:37},
  {name:'Desert Pass',theme:'desert',seed:51},{name:'Desert Depot',theme:'desert',seed:67},{name:'Desert Crossing',theme:'desert',seed:79},
  {name:'Polar Station',theme:'polar',seed:91},{name:'Polar Road',theme:'polar',seed:107},{name:'Polar Base',theme:'polar',seed:121}
];
var UPGRADES={
  damage:{label:'DAMAGE',desc:'duidelijk meer schade per treffer',cost:[40,65,95,135]},
  speed:{label:'SPEED',desc:'kogels, AP en HE vliegen sneller',cost:[35,55,80,115]},
  burst:{label:'BURST',desc:'meer MG kogels per burst',cost:[40,65,95,135]},
  charge:{label:'CHARGE',desc:'AP/HE sneller geladen',cost:[35,55,80,115]},
  cooling:{label:'COOLING',desc:'sneller afkoelen',cost:[35,55,80,115]},
  he:{label:'HE BLAST',desc:'grotere HE explosie',cost:[45,70,105,145]},
  armor:{label:'ARMOR',desc:'meer bunker HP',cost:[50,80,115,155]}
};

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function lerp(a,b,t){return a+(b-a)*t;}
function dist(ax,ay,bx,by){var dx=ax-bx,dy=ay-by;return Math.sqrt(dx*dx+dy*dy);}
function rand(a,b){return a+Math.random()*(b-a);}
function seeded(seed){var t=seed>>>0;return function(){t+=0x6D2B79F5;var r=Math.imul(t^(t>>>15),1|t);r^=r+Math.imul(r^(r>>>7),61|r);return ((r^(r>>>14))>>>0)/4294967296;};}
function cssNum(v){var n=parseFloat(v);return isFinite(n)?n:0;}
function readSafe(){var cs=getComputedStyle(safeProbe);safeTop=cssNum(cs.paddingTop);safeBottom=cssNum(cs.paddingBottom);}
function loadSave(){try{var raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(raw&&raw.upgrades){var keys=['damage','speed','burst','charge','cooling','he','armor'];for(var i=0;i<keys.length;i++)if(typeof raw.upgrades[keys[i]]!=='number')raw.upgrades[keys[i]]=0;if(typeof raw.supply!=='number')raw.supply=0;if(typeof raw.bestMap!=='number')raw.bestMap=0;return raw;}}catch(e){}return {supply:0,upgrades:{damage:0,speed:0,burst:0,charge:0,cooling:0,he:0,armor:0},bestMap:0};}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state.save));}catch(e){}}
function profile(){var u=state.save.upgrades;return {maxHp:100+u.armor*18,damage:1+u.damage*.26,projectileSpeed:1+u.speed*.18,burst:5+u.burst,chargeScale:1+u.charge*.18,cool:.19+u.cooling*.055,heatScale:Math.max(.60,1-u.cooling*.08),heRadius:32+u.he*8};}

function resize(){
  readSafe();DPR=Math.min(window.devicePixelRatio||1,2);W=Math.max(320,innerWidth);H=Math.max(480,innerHeight);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);
  if(state){state.bunker.x=W*.5;state.bunker.y=H-Math.max(72,safeBottom+52);buildMap();}
}
addEventListener('resize',resize,{passive:true});

function freshState(){
  var sv=loadSave();
  return {mode:'menu',save:sv,mapIndex:Math.min(8,sv.bestMap||0),time:0,levelTime:0,
    bunker:{x:W*.5,y:H-78,hp:100,maxHp:100,angle:-Math.PI/2},
    aim:{x:W*.5,y:H*.35},pointer:{down:false,t0:0,x:W*.5,y:H*.35},
    heat:0,overheat:false,eff:.75,stats:{shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0},
    enemies:[],vehicles:[],air:[],paras:[],shots:[],enemyShots:[],effects:[],craters:[],wrecks:[],map:null,
    events:[],eventCursor:0,burstQueue:[],message:'',messageT:0,levelComplete:false,profile:null};
}

function buildMap(){
  if(!state)return;
  var m=MAPS[state.mapIndex],rng=seeded(m.seed+state.mapIndex*37);
  var roadX=W*(state.mapIndex%2?0.58:0.42),junctionY=H*(0.33+(state.mapIndex%3)*.055);
  var compoundRight=state.mapIndex%2===0,cx=W*(compoundRight ? .74 : .26),cy=H*(0.34+(state.mapIndex%3)*.055);
  var trees=[],rocks=[],trenches=[],vegN=m.theme==='jungle'?18:m.theme==='desert'?8:11;
  for(var i=0;i<vegN;i++){var x=20+rng()*(W-40),y=safeTop+80+rng()*(H-safeTop-safeBottom-260);if(Math.abs(x-roadX)<46)x+=x<roadX?-58:58;if(dist(x,y,cx,cy)<78){i--;continue;}trees.push({x:clamp(x,18,W-18),y:y,r:5+rng()*5});}
  for(i=0;i<7;i++)rocks.push({x:28+rng()*(W-56),y:safeTop+95+rng()*(H-safeTop-safeBottom-290),r:3+rng()*4});
  trenches.push({x:W*.28,y:H*.34,len:48,rot:-.06});trenches.push({x:W*.72,y:H*.52,len:52,rot:.08});
  state.map={theme:m.theme,name:m.name,p:PALETTES[m.theme],roadX:roadX,junctionY:junctionY,compound:{x:cx,y:cy,w:74,h:48},trees:trees,rocks:rocks,trenches:trenches};
}

function resetLevel(){
  state.profile=profile();state.time=0;state.levelTime=0;state.bunker.hp=state.profile.maxHp;state.bunker.maxHp=state.profile.maxHp;
  state.bunker.x=W*.5;state.bunker.y=H-Math.max(72,safeBottom+52);state.heat=0;state.overheat=false;state.eff=.75;
  state.stats={shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0};
  state.enemies=[];state.vehicles=[];state.air=[];state.paras=[];state.shots=[];state.enemyShots=[];state.effects=[];state.craters=[];state.wrecks=[];state.burstQueue=[];
  state.eventCursor=0;state.levelComplete=false;state.message='';state.messageT=0;buildMap();state.events=makeEvents(state.mapIndex);state.mode='playing';
}

function makeEvents(i){
  var hard=1+i*.09,events=[
    {t:.55,type:'truck',count:3},{t:1.15,type:'foot',count:2},{t:2.75,type:'technical',count:1},{t:4.25,type:'heli',count:i<3?2:3},
    {t:6.4,type:'foot',count:3},{t:7.8,type:'plane',count:i<4?3:4},{t:10,type:'truck',count:3},{t:12.2,type:i<2?'technical':'halftrack',count:1},
    {t:14.2,type:'foot',count:3},{t:16,type:'heli',count:3},{t:18.4,type:i<3?'truck':'tank',count:i<3?3:1},
    {t:21,type:'foot',count:Math.round(3*hard)},{t:23,type:'plane',count:4}
  ];if(i>4)events.push({t:25,type:'tank',count:1});return events;
}
function laneX(offset){return clamp(state.map.roadX+offset,32,W-32);}
function spawnInfantry(x,y,kind){
  kind=kind||(['rifle','rifle','lmg','grenadier'][Math.floor(Math.random()*4)]);
  var hp=kind==='lmg'?34:kind==='grenadier'?30:26,speed=kind==='lmg'?28:kind==='grenadier'?27:32;
  state.enemies.push({id:Math.random()*1e9|0,x:x==null?laneX(rand(-70,70)):x,y:y==null?safeTop+72:y,kind:kind,hp:hp,maxHp:hp,speed:speed+state.mapIndex*1.2,state:'advance',stateT:0,anim:Math.random()*10,angle:Math.PI/2,fireCd:rand(.4,1.2),muzzle:0,deadT:0,coverT:0,cover:null});
}
function spawnFoot(n){for(var i=0;i<n;i++)spawnInfantry(laneX(rand(-85,85)),safeTop+68-rand(0,35));}
function spawnVehicle(type,count){
  if(type==='truck'){state.vehicles.push({id:Math.random()*1e9|0,type:'truck',x:laneX(rand(-10,10)),y:safeTop+55,hp:90,maxHp:90,speed:52,dropCount:count||3,dropped:false,stopT:0,state:'advance',angle:Math.PI/2,fireCd:0,smoke:0});return;}
  var hp=type==='technical'?80:type==='halftrack'?150:260,sp=type==='technical'?58:type==='halftrack'?40:29;
  state.vehicles.push({id:Math.random()*1e9|0,type:type,x:laneX(rand(-16,16)),y:safeTop+52,hp:hp,maxHp:hp,speed:sp,dropCount:type==='halftrack'?2:0,dropped:false,stopT:0,state:'advance',angle:Math.PI/2,fireCd:rand(.5,1.2),smoke:0});
}
function spawnHeli(n){
  var left=state.mapIndex%2===0;
  state.air.push({id:Math.random()*1e9|0,type:'heli',x:left?-95:W+95,y:H*.34,targetX:W*(left?.68:.32),targetY:H*.38,vx:left?120:-120,phase:'in',t:0,dropCount:n||2,dropped:false,hp:120,rotor:0});
  state.message='HELICOPTER INSERTION';state.messageT=.8;
}
function spawnPlane(n){state.air.push({id:Math.random()*1e9|0,type:'plane',x:-130,y:safeTop+120+state.mapIndex%3*18,vx:175,phase:'cross',t:0,dropCount:n||3,dropped:0,hp:170});state.message='AIRBORNE CONTACT';state.messageT=.8;}
function processEvents(){while(state.eventCursor<state.events.length&&state.levelTime>=state.events[state.eventCursor].t){var e=state.events[state.eventCursor++];if(e.type==='foot')spawnFoot(e.count);else if(e.type==='heli')spawnHeli(e.count);else if(e.type==='plane')spawnPlane(e.count);else spawnVehicle(e.type,e.count);}}

function findCover(e){var best=null,bd=9999;for(var i=0;i<state.map.trenches.length;i++){var t=state.map.trenches[i],d=dist(e.x,e.y,t.x,t.y);if(d<bd&&d<85){best=t;bd=d;}}return best;}
function blood(x,y,n){for(var i=0;i<n;i++)state.effects.push({type:'blood',x:x+rand(-4,4),y:y+rand(-4,4),vx:rand(-18,18),vy:rand(-20,5),t:0,life:.45});}
function explode(x,y,r,crater){state.effects.push({type:'explosion',x:x,y:y,r:r,t:0,life:.5});if(crater!==false)state.craters.push({x:x,y:y,r:r*rand(.68,.95),seed:Math.random()*9999|0});sound('boom');}
function killEnemy(e,kind){if(e.state==='dead')return;e.state='dead';e.deadT=0;e.angle+=rand(-.9,.9);state.stats.kills++;state.eff=clamp(state.eff+.024,0,1);blood(e.x,e.y,kind==='he'?7:3);}
function damageEnemy(e,dmg,kind){if(e.state==='dead')return false;e.hp-=dmg;if(e.hp<=0){killEnemy(e,kind);return true;}blood(e.x,e.y,1);return false;}
function damageVehicle(v,dmg,kind){
  if(v.state==='dead')return false;
  var mult=kind==='mg'?((v.type==='technical'||v.type==='truck')?.7:.12):(kind==='ap'?1.35:(kind==='he'?.72:1));
  v.hp-=dmg*mult;
  if(v.hp<=0){v.state='dead';state.stats.vehicleKills++;state.eff=clamp(state.eff+.03,0,1);state.wrecks.push({type:v.type,x:v.x,y:v.y,angle:v.angle});explode(v.x,v.y,26,true);return true;}
  v.smoke=.4;return false;
}
function damageAir(a,dmg){a.hp-=dmg;if(a.hp<=0&&a.phase!=='dead'){a.phase='dead';state.stats.airKills++;state.eff=clamp(state.eff+.035,0,1);explode(a.x,a.y,24,false);return true;}return false;}

function enemyFire(e){
  var dx=state.bunker.x-e.x,dy=state.bunker.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1,kind=e.kind==='grenadier'?'grenade':e.kind==='lmg'?'lmg':'rifle';
  var speed=kind==='grenade'?145:310,dmg=kind==='grenade'?8:kind==='lmg'?3.2:2.3;
  state.enemyShots.push({x:e.x,y:e.y,px:e.x,py:e.y,vx:dx/d*speed,vy:dy/d*speed,kind:kind,dmg:dmg,t:0,life:kind==='grenade'?2.3:1.4});e.muzzle=.08;
}
function updateInfantry(dt){
  for(var i=0;i<state.enemies.length;i++){
    var e=state.enemies[i];e.anim+=dt*(e.state==='advance'?6.5:2);e.stateT+=dt;e.muzzle=Math.max(0,e.muzzle-dt);
    if(e.state==='dead'){e.deadT+=dt;continue;}
    var dx=state.bunker.x-e.x,dy=state.bunker.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;e.angle=Math.atan2(dy,dx);
    if(e.state==='advance'){
      if(!e.cover&&e.y<H*.58&&Math.random()<dt*.35)e.cover=findCover(e);
      if(e.cover&&dist(e.x,e.y,e.cover.x,e.cover.y)<17){e.state='cover';e.stateT=0;e.coverT=rand(.7,1.45);}
      else if(d<165+state.mapIndex*2){e.state='fire';e.stateT=0;}
      else{var sp=e.speed*(e.kind==='lmg'?.9:1);e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt;}
    }else if(e.state==='cover'){
      e.fireCd-=dt;if(e.fireCd<=0){enemyFire(e);e.fireCd=e.kind==='lmg'?.34:rand(.65,1.05);}if(e.stateT>e.coverT){e.cover=null;e.state='advance';e.stateT=0;}
    }else if(e.state==='fire'){
      e.fireCd-=dt;if(e.fireCd<=0){enemyFire(e);e.fireCd=e.kind==='lmg'?.28:e.kind==='grenadier'?1.35:rand(.62,.98);}if(d>185){e.state='advance';e.stateT=0;}
    }
  }
  state.enemies=state.enemies.filter(function(e){return e.state!=='dead'||e.deadT<8;});
}
function updateVehicles(dt){
  for(var i=0;i<state.vehicles.length;i++){
    var v=state.vehicles[i];if(v.state==='dead')continue;v.smoke=Math.max(0,v.smoke-dt);var dropY=H*(v.type==='truck'?.42:.48);
    if(v.type==='truck'&&!v.dropped&&v.y>=dropY){v.dropped=true;v.state='drop';v.stopT=.75;for(var k=0;k<v.dropCount;k++)spawnInfantry(v.x+(k-(v.dropCount-1)/2)*13,v.y+16+Math.abs(k-(v.dropCount-1)/2)*3);}
    if(v.type==='halftrack'&&!v.dropped&&v.y>H*.46){v.dropped=true;for(k=0;k<2;k++)spawnInfantry(v.x+(k?14:-14),v.y+13,'rifle');}
    if(v.state==='drop'){v.stopT-=dt;if(v.stopT<=0)v.state='advance';continue;}
    if(v.type==='truck'&&v.dropped){v.y+=v.speed*1.12*dt;if(v.y>H+70)v.state='departed';continue;}
    var targetY=state.bunker.y-(v.type==='tank'?155:125);
    if(v.y<targetY)v.y+=v.speed*dt;
    else{v.fireCd-=dt;if(v.fireCd<=0){var dmg=v.type==='tank'?11:v.type==='halftrack'?5.5:v.type==='technical'?4.5:0;if(dmg>0){state.enemyShots.push({x:v.x,y:v.y,px:v.x,py:v.y,vx:(state.bunker.x-v.x)*2.1,vy:(state.bunker.y-v.y)*2.1,kind:v.type==='tank'?'shell':'vehicle',dmg:dmg,t:0,life:1.2});v.fireCd=v.type==='tank'?1.65:.72;}}}
  }
  state.vehicles=state.vehicles.filter(function(v){return v.state!=='departed';});
}
function spawnPara(x,y,index){state.paras.push({id:Math.random()*1e9|0,x:x+rand(-10,10),baseX:x,y:y,landY:H*rand(.42,.62),phase:rand(0,TAU),hp:22,state:'descend',vy:34+rand(-3,4),index:index});}
function updateAir(dt){
  for(var i=0;i<state.air.length;i++){
    var a=state.air[i];a.t+=dt;
    if(a.phase==='dead'){a.y+=90*dt;a.x+=a.vx*.35*dt;continue;}
    if(a.type==='heli'){
      a.rotor+=dt*16;
      if(a.phase==='in'){var dx=a.targetX-a.x,dy=a.targetY-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;a.x+=dx/d*125*dt;a.y+=dy/d*125*dt;if(d<9){a.phase='hover';a.t=0;}}
      else if(a.phase==='hover'){if(!a.dropped&&a.t>.38){a.dropped=true;for(var k=0;k<a.dropCount;k++)spawnInfantry(a.x+(k-(a.dropCount-1)/2)*18,a.y+24);sound('heli');}if(a.t>1.4){a.phase='out';a.vx=a.x<W*.5?-150:150;}}
      else if(a.phase==='out')a.x+=a.vx*dt;
    }else{
      a.x+=a.vx*dt;var start=W*.30,end=W*.72;
      while(a.dropped<a.dropCount){var f=a.dropCount<=1?.5:a.dropped/(a.dropCount-1),trigger=lerp(start,end,f);if(a.x<trigger)break;spawnPara(a.x-5,a.y+16,a.dropped);a.dropped++;}
    }
  }
  for(i=0;i<state.paras.length;i++){var p=state.paras[i];if(p.state==='descend'){p.phase+=dt*2.4;p.baseX+=6*dt;p.x=p.baseX+Math.sin(p.phase)*10;p.y+=p.vy*dt;if(p.y>=p.landY){p.state='landed';spawnInfantry(p.x,p.landY,'rifle');state.effects.push({type:'chute',x:p.x,y:p.landY,t:0,life:2.3});}}else if(p.state==='dead')p.y+=78*dt;}
  state.paras=state.paras.filter(function(p){return p.state!=='landed'&&p.y<H+40;});
  state.air=state.air.filter(function(a){return a.x>-170&&a.x<W+170&&a.y<H+120;});
}

function damageBunker(dmg){
  var reduction=state.save.upgrades.armor*.05,real=dmg*(1-reduction);state.bunker.hp-=real;state.stats.damageTaken+=real;state.eff=clamp(state.eff-.006*real,0,1);
  state.effects.push({type:'hit',x:state.bunker.x+rand(-18,18),y:state.bunker.y+rand(-8,10),t:0,life:.28});if(state.bunker.hp<=0)endGame('BUNKER LOST');
}
function updateEnemyShots(dt){
  for(var i=0;i<state.enemyShots.length;i++){var b=state.enemyShots[i];b.px=b.x;b.py=b.y;b.t+=dt;if(b.kind==='grenade')b.vy+=75*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(dist(b.x,b.y,state.bunker.x,state.bunker.y)<28){damageBunker(b.dmg);if(b.kind==='grenade'||b.kind==='shell')explode(b.x,b.y,b.kind==='shell'?23:18,true);b.life=0;}b.life-=dt;}
  state.enemyShots=state.enemyShots.filter(function(b){return b.life>0&&b.x>-40&&b.x<W+40&&b.y>-40&&b.y<H+40;});
}
function queueMG(x,y){if(state.overheat){state.message='BARREL HOT';state.messageT=.35;return;}var n=state.profile.burst;for(var i=0;i<n;i++)state.burstQueue.push({t:i*.052,x:x,y:y});}
function fireWeapon(kind,x,y){
  if(state.overheat){state.message='BARREL HOT';state.messageT=.35;return;}
  var p=state.profile,heat=kind==='ap'?.11:kind==='he'?.18:.025;state.heat=clamp(state.heat+heat*p.heatScale,0,1);if(state.heat>=.96)state.overheat=true;
  var damage=(kind==='mg'?10:kind==='ap'?52:42)*p.damage,speed=(kind==='mg'?520:kind==='ap'?390:300)*p.projectileSpeed,range=Math.hypot(W,H)*1.18;
  var dx=x-state.bunker.x,dy=y-state.bunker.y,d=Math.sqrt(dx*dx+dy*dy)||1,spread=kind==='mg'?.035:kind==='ap'?.008:.012,ang=Math.atan2(dy,dx)+rand(-spread,spread);
  state.shots.push({kind:kind,x:state.bunker.x,y:state.bunker.y-11,px:state.bunker.x,py:state.bunker.y-11,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,damage:damage,range:range,traveled:0,active:true,radius:kind==='he'?p.heRadius:0});
  state.stats.shots++;sound(kind);
}
function pointSegDist(px,py,x1,y1,x2,y2){var dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy;if(!l2)return dist(px,py,x1,y1);var t=clamp(((px-x1)*dx+(py-y1)*dy)/l2,0,1);return dist(px,py,x1+dx*t,y1+dy*t);}
function resolvePlayerHit(b){
  var best=null,bd=9999,hitType='',i,e,v,a,d;
  for(i=0;i<state.enemies.length;i++){e=state.enemies[i];if(e.state==='dead')continue;d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);if(d<10&&d<bd){best=e;bd=d;hitType='enemy';}}
  for(i=0;i<state.vehicles.length;i++){v=state.vehicles[i];if(v.state==='dead')continue;d=pointSegDist(v.x,v.y,b.px,b.py,b.x,b.y);if(d<18&&d<bd){best=v;bd=d;hitType='vehicle';}}
  for(i=0;i<state.paras.length;i++){e=state.paras[i];if(e.state!=='descend')continue;d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);if(d<14&&d<bd){best=e;bd=d;hitType='para';}}
  for(i=0;i<state.air.length;i++){a=state.air[i];if(a.phase==='dead')continue;d=pointSegDist(a.x,a.y,b.px,b.py,b.x,b.y);if(d<(a.type==='heli'?25:20)&&d<bd){best=a;bd=d;hitType='air';}}
  if(!best)return false;state.stats.hits++;state.eff=clamp(state.eff+.010,0,1);
  if(b.kind==='he'){explode(b.x,b.y,b.radius,true);blast(b.x,b.y,b.radius,b.damage);b.active=false;return true;}
  if(hitType==='enemy')damageEnemy(best,b.damage,b.kind);else if(hitType==='vehicle')damageVehicle(best,b.damage,b.kind);else if(hitType==='air')damageAir(best,b.damage);else{best.hp-=b.damage;if(best.hp<=0){best.state='dead';state.stats.airKills++;state.eff=clamp(state.eff+.02,0,1);blood(best.x,best.y,4);}}
  b.active=false;return true;
}
function blast(x,y,r,base){
  for(var i=0;i<state.enemies.length;i++){var e=state.enemies[i];if(e.state==='dead')continue;var d=dist(x,y,e.x,e.y);if(d<r)damageEnemy(e,base*(.35+.65*(1-d/r)),'he');}
  for(i=0;i<state.vehicles.length;i++){var v=state.vehicles[i];if(v.state==='dead')continue;d=dist(x,y,v.x,v.y);if(d<r*1.1)damageVehicle(v,base*(.25+.55*(1-d/(r*1.1))),'he');}
}
function updateShots(dt){
  for(var i=0;i<state.burstQueue.length;i++)state.burstQueue[i].t-=dt;
  while(state.burstQueue.length&&state.burstQueue[0].t<=0){var q=state.burstQueue.shift();fireWeapon('mg',q.x,q.y);}
  for(i=0;i<state.shots.length;i++){var b=state.shots[i];if(!b.active)continue;b.px=b.x;b.py=b.y;var dx=b.vx*dt,dy=b.vy*dt;b.x+=dx;b.y+=dy;b.traveled+=Math.sqrt(dx*dx+dy*dy);if(resolvePlayerHit(b))continue;if(b.traveled>=b.range||b.x<-20||b.x>W+20||b.y<-20||b.y>H+20){if(b.kind==='he'){explode(b.x,b.y,b.radius,true);blast(b.x,b.y,b.radius,b.damage*.7);}else{state.stats.misses++;state.eff=clamp(state.eff-.0055,0,1);}b.active=false;}}
  state.shots=state.shots.filter(function(b){return b.active;});
}
function updateEffects(dt){for(var i=0;i<state.effects.length;i++){var e=state.effects[i];e.t+=dt;if(e.type==='blood'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=50*dt;}}state.effects=state.effects.filter(function(e){return e.t<e.life;});}
function update(dt){
  if(!state||state.mode!=='playing')return;
  state.time+=dt;state.levelTime+=dt;state.bunker.angle=Math.atan2(state.aim.y-state.bunker.y,state.aim.x-state.bunker.x);
  if(state.messageT>0)state.messageT-=dt;state.heat=Math.max(0,state.heat-state.profile.cool*dt);if(state.overheat&&state.heat<.35)state.overheat=false;
  processEvents();updateInfantry(dt);updateVehicles(dt);updateAir(dt);updateShots(dt);updateEnemyShots(dt);updateEffects(dt);
  if(state.eff<.20){endGame('EFFICIENCY LOST');return;}
  if(state.eventCursor>=state.events.length&&state.enemies.filter(function(e){return e.state!=='dead';}).length===0&&state.vehicles.filter(function(v){return v.state!=='dead';}).length===0&&state.paras.length===0&&state.air.length===0&&state.levelTime>24)completeLevel();
}

function completeLevel(){
  if(state.levelComplete)return;state.levelComplete=true;state.mode='shop';
  var reward=Math.round(48+state.mapIndex*5+state.eff*34+Math.max(0,state.bunker.hp/state.bunker.maxHp)*18);
  state.save.supply+=reward;state.save.bestMap=Math.max(state.save.bestMap,Math.min(8,state.mapIndex+1));save();showShop(reward);
}
function showShop(reward){
  overlay.classList.remove('hidden');titleEl.textContent=state.mapIndex>=8?'CAMPAIGN COMPLETE':'MAP CLEARED';
  subEl.textContent=state.mapIndex>=8?'Alle negen maps zijn gehaald. Je kunt opnieuw beginnen met je upgrades behouden.':'Bereik heb je al volledig. Bouw nu vooral DAMAGE en SPEED op.';
  summaryEl.style.display='block';summaryEl.textContent='EFF '+Math.round(state.eff*100)+'% · KILLS '+(state.stats.kills+state.stats.vehicleKills+state.stats.airKills)+' · HP '+Math.max(0,Math.round(state.bunker.hp))+'/'+state.bunker.maxHp+' · +'+reward+' SUPPLY';
  shopEl.style.display='block';restartBtn.style.display='none';deployBtn.style.display='block';deployBtn.textContent=state.mapIndex>=8?'RESTART CAMPAIGN':'NEXT MAP';renderShop();
}
function renderShop(){
  supplyEl.textContent='SUPPLY: '+state.save.supply;shopGrid.innerHTML='';
  Object.keys(UPGRADES).forEach(function(key){var cfg=UPGRADES[key],lvl=state.save.upgrades[key]||0,max=cfg.cost.length,cost=lvl<max?cfg.cost[lvl]:null,b=document.createElement('button');b.type='button';b.className='shopBtn'+(cost==null||state.save.supply<cost?' disabled':'');b.innerHTML='<strong>'+cfg.label+' · '+lvl+'/'+max+'</strong><span>'+cfg.desc+'</span><em>'+(cost==null?'MAX':cost+' SUPPLY')+'</em>';if(cost!=null)b.addEventListener('click',function(){if(state.save.supply<cost)return;state.save.supply-=cost;state.save.upgrades[key]=lvl+1;save();renderShop();});shopGrid.appendChild(b);});
}
function endGame(reason){
  state.mode='gameover';overlay.classList.remove('hidden');titleEl.textContent=reason;subEl.textContent='De linie is gebroken. Probeer dezelfde map opnieuw.';
  summaryEl.style.display='block';summaryEl.textContent='EFF '+Math.round(state.eff*100)+'% · KILLS '+(state.stats.kills+state.stats.vehicleKills+state.stats.airKills)+' · MAP '+(state.mapIndex+1)+'/9';
  shopEl.style.display='none';deployBtn.style.display='none';restartBtn.style.display='block';
}

function pointerPos(ev){var r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height};}
canvas.addEventListener('pointerdown',function(ev){if(!state||state.mode!=='playing')return;var p=pointerPos(ev);state.pointer.down=true;state.pointer.t0=performance.now();state.pointer.x=p.x;state.pointer.y=p.y;state.aim=p;try{canvas.setPointerCapture(ev.pointerId);}catch(e){}ev.preventDefault();},{passive:false});
canvas.addEventListener('pointermove',function(ev){if(!state||state.mode!=='playing')return;var p=pointerPos(ev);state.aim=p;state.pointer.x=p.x;state.pointer.y=p.y;if(state.pointer.down)ev.preventDefault();},{passive:false});
canvas.addEventListener('pointerup',function(ev){if(!state||state.mode!=='playing'||!state.pointer.down)return;var p=pointerPos(ev);state.aim=p;var hold=(performance.now()-state.pointer.t0)/1000*state.profile.chargeScale;state.pointer.down=false;if(hold<.20)queueMG(p.x,p.y);else if(hold<.62)fireWeapon('ap',p.x,p.y);else fireWeapon('he',p.x,p.y);ev.preventDefault();},{passive:false});
canvas.addEventListener('pointercancel',function(){if(state)state.pointer.down=false;});
deployBtn.addEventListener('click',function(){unlockAudio();if(state.mode==='menu'){overlay.classList.add('hidden');shopEl.style.display='none';summaryEl.style.display='none';resetLevel();return;}if(state.mode==='shop'){if(state.mapIndex>=8)state.mapIndex=0;else state.mapIndex++;overlay.classList.add('hidden');shopEl.style.display='none';summaryEl.style.display='none';resetLevel();}});
restartBtn.addEventListener('click',function(){unlockAudio();overlay.classList.add('hidden');restartBtn.style.display='none';deployBtn.style.display='block';summaryEl.style.display='none';resetLevel();});

var audioCtx=null;
function unlockAudio(){try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch(e){}}
function sound(kind){
  if(!audioCtx)return;try{var o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;o.connect(g);g.connect(audioCtx.destination);
  if(kind==='mg'){o.type='square';o.frequency.setValueAtTime(125,t);o.frequency.exponentialRampToValueAtTime(70,t+.045);g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);o.start(t);o.stop(t+.055);}
  else if(kind==='ap'||kind==='he'||kind==='boom'){o.type='sawtooth';o.frequency.setValueAtTime(kind==='ap'?85:62,t);o.frequency.exponentialRampToValueAtTime(34,t+.16);g.gain.setValueAtTime(kind==='boom'?.085:.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.start(t);o.stop(t+.19);}
  else if(kind==='heli'){o.type='triangle';o.frequency.value=48;g.gain.setValueAtTime(.025,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.start(t);o.stop(t+.2);}}catch(e){}
}

function pathRoad(points,width,p){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=p.roadEdge;ctx.lineWidth=width+5;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(var i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.stroke();ctx.strokeStyle=p.road;ctx.lineWidth=width;ctx.stroke();ctx.globalAlpha=.22;ctx.strokeStyle='#e0d4a8';ctx.lineWidth=1;ctx.setLineDash([9,12]);ctx.stroke();ctx.restore();}
function drawMap(){
  var m=state.map,p=m.p;ctx.fillStyle=p.ground;ctx.fillRect(0,0,W,H);ctx.globalAlpha=.18;ctx.fillStyle=p.ground2;ctx.fillRect(0,safeTop,W,75);ctx.fillRect(0,H-160,W,160);ctx.globalAlpha=1;
  pathRoad([{x:m.roadX,y:safeTop-20},{x:m.roadX+(state.mapIndex%3-1)*12,y:m.junctionY},{x:W*.5,y:state.bunker.y-55}],17,p);
  pathRoad([{x:m.roadX,y:m.junctionY},{x:m.compound.x,y:m.compound.y+18}],9,p);
  var c=m.compound;ctx.save();ctx.translate(c.x,c.y);ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(-c.w/2+4,-c.h/2+5,c.w,c.h);ctx.fillStyle=p.building;ctx.strokeStyle=p.line;ctx.lineWidth=1.5;ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h);ctx.strokeRect(-c.w/2,-c.h/2,c.w,c.h);ctx.fillStyle=p.roof;ctx.fillRect(-c.w/2+5,-c.h/2+5,c.w-10,c.h-10);ctx.strokeStyle='rgba(235,227,196,.22)';ctx.beginPath();ctx.moveTo(-c.w/2+8,0);ctx.lineTo(c.w/2-8,0);ctx.stroke();ctx.fillStyle=p.line;ctx.fillRect(-4,c.h/2-10,8,10);ctx.restore();
  for(var i=0;i<m.trenches.length;i++){var t=m.trenches[i];ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.rot);ctx.strokeStyle=p.trench;ctx.lineCap='round';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-t.len/2,0);ctx.lineTo(t.len/2,0);ctx.stroke();ctx.strokeStyle='rgba(191,162,111,.5)';ctx.lineWidth=2;ctx.stroke();ctx.restore();}
  for(i=0;i<m.trees.length;i++)drawTree(m.trees[i],p);for(i=0;i<m.rocks.length;i++)drawRock(m.rocks[i],p);for(i=0;i<state.craters.length;i++)drawCrater(state.craters[i],p);for(i=0;i<state.wrecks.length;i++)drawVehicleShape(state.wrecks[i],true);
}
function drawTree(t,p){ctx.save();ctx.translate(t.x,t.y);ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(2,3,t.r*1.05,t.r*.68,0,0,TAU);ctx.fill();ctx.strokeStyle=p.line;ctx.lineWidth=1;ctx.fillStyle=p.veg;ctx.beginPath();ctx.arc(0,0,t.r,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=p.veg2;ctx.beginPath();ctx.arc(-t.r*.25,-t.r*.25,t.r*.42,0,TAU);ctx.fill();ctx.restore();}
function drawRock(r,p){ctx.save();ctx.translate(r.x,r.y);ctx.fillStyle=p.rock;ctx.strokeStyle=p.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-r.r,1);ctx.lineTo(-r.r*.4,-r.r*.7);ctx.lineTo(r.r*.6,-r.r*.5);ctx.lineTo(r.r,0);ctx.lineTo(r.r*.25,r.r*.6);ctx.lineTo(-r.r*.65,r.r*.45);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
function drawCrater(c,p){var rng=seeded(c.seed);ctx.save();ctx.translate(c.x,c.y);ctx.fillStyle='rgba(39,32,24,.22)';ctx.strokeStyle=p.line;ctx.lineWidth=1.4;ctx.beginPath();for(var i=0;i<14;i++){var a=i/14*TAU,rr=c.r*(.82+rng()*.23),x=Math.cos(a)*rr,y=Math.sin(a)*rr*.72;if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=.22;ctx.strokeStyle='#c2a778';ctx.beginPath();ctx.ellipse(0,-1,c.r*.55,c.r*.34,0,0,TAU);ctx.stroke();ctx.restore();}

function drawSoldier(e){
  var near=clamp((e.y-safeTop)/(H-safeTop-safeBottom),0,1),s=.82+near*.23;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle+Math.PI/2);ctx.scale(s,s);ctx.globalAlpha=e.state==='dead'?clamp(1-e.deadT/8,.32,1):1;ctx.strokeStyle='#273026';ctx.fillStyle='#65724f';ctx.lineWidth=1.4;ctx.lineCap='round';ctx.lineJoin='round';
  if(e.state==='dead'){ctx.rotate(.85);ctx.fillStyle='#5d6650';ctx.beginPath();ctx.ellipse(0,1,3.3,5.2,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-2,3);ctx.lineTo(-6,7);ctx.moveTo(2,3);ctx.lineTo(6,6);ctx.moveTo(-2,-1);ctx.lineTo(-6,-4);ctx.stroke();ctx.fillStyle='#83906a';ctx.beginPath();ctx.arc(0,-5,2.2,0,TAU);ctx.fill();ctx.stroke();ctx.restore();return;}
  var walking=e.state==='advance',phase=Math.sin(e.anim*1.9),crouch=e.state==='cover',bodyY=crouch?1:0;
  ctx.fillStyle='#667450';ctx.beginPath();ctx.ellipse(0,bodyY,3.1,crouch?3.5:4.4,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#89966f';ctx.beginPath();ctx.arc(0,-4.8+(crouch?1:0),2.35,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#404936';ctx.lineWidth=1.5;var leg=crouch?2.2:walking?phase*2.2:0;ctx.beginPath();ctx.moveTo(-1.2,3.4);ctx.lineTo(-2.4-leg*.35,8+Math.abs(leg));ctx.moveTo(1.2,3.4);ctx.lineTo(2.4+leg*.35,8+Math.abs(-leg));ctx.stroke();
  ctx.beginPath();ctx.moveTo(-2.4,-1);ctx.lineTo(-4.5,2-phase);ctx.moveTo(2.4,-1);ctx.lineTo(4,1+phase);ctx.stroke();ctx.strokeStyle='#252b23';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(2,-1);ctx.lineTo(2,-9.5);ctx.stroke();
  if(e.muzzle>0){ctx.fillStyle='#ffe39b';ctx.beginPath();ctx.moveTo(2,-12);ctx.lineTo(4,-9.7);ctx.lineTo(2,-8.8);ctx.lineTo(0,-9.7);ctx.closePath();ctx.fill();}ctx.restore();
}
function drawVehicleShape(v,wreck){
  ctx.save();ctx.translate(v.x,v.y);ctx.rotate((v.angle||Math.PI/2)-Math.PI/2);ctx.globalAlpha=wreck?.58:1;ctx.strokeStyle='#30362e';ctx.lineWidth=1.6;ctx.lineJoin='round';var type=v.type||'truck';
  if(type==='truck'){ctx.fillStyle=wreck?'#5d5a4e':'#7d7d60';ctx.fillRect(-11,-17,22,34);ctx.strokeRect(-11,-17,22,34);ctx.fillStyle='#555a4c';ctx.fillRect(-8,-14,16,9);ctx.fillStyle='#343933';ctx.fillRect(-13,-12,3,8);ctx.fillRect(10,-12,3,8);ctx.fillRect(-13,5,3,8);ctx.fillRect(10,5,3,8);}
  else if(type==='technical'){ctx.fillStyle=wreck?'#5c594d':'#77785c';ctx.fillRect(-10,-14,20,28);ctx.strokeRect(-10,-14,20,28);ctx.beginPath();ctx.arc(0,1,4,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(0,-15);ctx.stroke();}
  else if(type==='halftrack'){ctx.fillStyle=wreck?'#58594e':'#6c735d';ctx.beginPath();ctx.moveTo(-11,-15);ctx.lineTo(11,-15);ctx.lineTo(13,12);ctx.lineTo(-13,12);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#20251f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-14,-10);ctx.lineTo(-14,11);ctx.moveTo(14,-10);ctx.lineTo(14,11);ctx.stroke();ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-3,5,0,TAU);ctx.stroke();}
  else{ctx.fillStyle=wreck?'#56574c':'#68705b';ctx.beginPath();ctx.moveTo(-13,-17);ctx.lineTo(13,-17);ctx.lineTo(15,15);ctx.lineTo(-15,15);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#252a23';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-16,-12);ctx.lineTo(-16,13);ctx.moveTo(16,-12);ctx.lineTo(16,13);ctx.stroke();ctx.lineWidth=1.5;ctx.fillStyle='#777f68';ctx.beginPath();ctx.arc(0,-2,6.5,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(0,-24);ctx.stroke();}
  if(v.smoke>0&&!wreck){ctx.globalAlpha=.18;ctx.fillStyle='#1e211d';ctx.beginPath();ctx.arc(6,-5,4+v.smoke*4,0,TAU);ctx.fill();}ctx.restore();
}
function drawVehicles(){for(var i=0;i<state.vehicles.length;i++)if(state.vehicles[i].state!=='dead')drawVehicleShape(state.vehicles[i],false);}
function drawHeli(a){ctx.save();ctx.translate(a.x,a.y);ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(7,9,29,9,0,0,TAU);ctx.fill();ctx.strokeStyle='#293029';ctx.lineWidth=1.6;ctx.fillStyle='#6a735d';ctx.beginPath();ctx.ellipse(-2,0,17,11,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#87907a';ctx.beginPath();ctx.ellipse(-8,-3,7,4.5,0,0,TAU);ctx.fill();ctx.fillStyle='#555d4e';ctx.beginPath();ctx.moveTo(11,-4);ctx.lineTo(41,-2);ctx.lineTo(41,3);ctx.lineTo(11,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.save();ctx.rotate(a.rotor);ctx.strokeStyle='#32382f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-38,0);ctx.lineTo(38,0);ctx.moveTo(0,-38);ctx.lineTo(0,38);ctx.stroke();ctx.restore();ctx.restore();}
function drawPlane(a){ctx.save();ctx.translate(a.x,a.y);ctx.strokeStyle='#37413f';ctx.fillStyle='#87938f';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-36,0);ctx.lineTo(-10,-5);ctx.lineTo(-2,-22);ctx.lineTo(5,-22);ctx.lineTo(9,-5);ctx.lineTo(34,0);ctx.lineTo(9,5);ctx.lineTo(5,19);ctx.lineTo(-2,19);ctx.lineTo(-9,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#5d6965';ctx.fillRect(-5,-10,10,20);ctx.restore();}
function drawPara(p){ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle='#38413a';ctx.lineWidth=1.2;ctx.fillStyle='rgba(214,217,198,.88)';ctx.beginPath();ctx.arc(0,-8,13,Math.PI,TAU);ctx.lineTo(13,-8);ctx.lineTo(0,-3);ctx.lineTo(-13,-8);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-11,-8);ctx.lineTo(-2,5);ctx.moveTo(11,-8);ctx.lineTo(2,5);ctx.stroke();ctx.fillStyle='#6c765d';ctx.beginPath();ctx.arc(0,7,2.2,0,TAU);ctx.fill();ctx.stroke();ctx.restore();}
function drawAir(){for(var i=0;i<state.air.length;i++){var a=state.air[i];if(a.phase==='dead')continue;if(a.type==='heli')drawHeli(a);else drawPlane(a);}for(i=0;i<state.paras.length;i++)if(state.paras[i].state!=='landed')drawPara(state.paras[i]);}
function drawBunker(){var b=state.bunker;ctx.save();ctx.translate(b.x,b.y);ctx.fillStyle='rgba(0,0,0,.17)';ctx.beginPath();ctx.ellipse(3,7,33,17,0,0,TAU);ctx.fill();ctx.fillStyle='#6a6d59';ctx.strokeStyle='#2b3028';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-29,12);ctx.lineTo(-24,-9);ctx.quadraticCurveTo(0,-22,24,-9);ctx.lineTo(29,12);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#85836a';ctx.beginPath();ctx.arc(0,-2,9,0,TAU);ctx.fill();ctx.stroke();ctx.rotate(b.angle+Math.PI/2);ctx.strokeStyle='#252a23';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(0,-31);ctx.stroke();ctx.restore();}
function drawShots(){for(var i=0;i<state.shots.length;i++){var b=state.shots[i];ctx.strokeStyle=b.kind==='mg'?'#f4d681':b.kind==='ap'?'#9dd4ee':'#ee9c4b';ctx.lineWidth=b.kind==='mg'?1.3:2.2;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();if(b.kind!=='mg'){ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(b.x,b.y,2.2,0,TAU);ctx.fill();}}for(i=0;i<state.enemyShots.length;i++){b=state.enemyShots[i];ctx.strokeStyle=b.kind==='grenade'?'#e49d4c':'rgba(238,215,155,.72)';ctx.lineWidth=b.kind==='shell'?2:1;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();}}
function drawEffects(){for(var i=0;i<state.effects.length;i++){var e=state.effects[i],q=1-e.t/e.life;if(e.type==='explosion'){ctx.globalAlpha=q;ctx.strokeStyle='#e5a34e';ctx.fillStyle='rgba(240,167,68,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r*(.35+.8*(1-q)),0,TAU);ctx.fill();ctx.stroke();}else if(e.type==='blood'){ctx.globalAlpha=q*.8;ctx.fillStyle='#6a2d2a';ctx.beginPath();ctx.arc(e.x,e.y,1.5,0,TAU);ctx.fill();}else if(e.type==='hit'){ctx.globalAlpha=q;ctx.strokeStyle='#f1d487';ctx.beginPath();ctx.moveTo(e.x-5,e.y);ctx.lineTo(e.x+5,e.y);ctx.moveTo(e.x,e.y-5);ctx.lineTo(e.x,e.y+5);ctx.stroke();}else if(e.type==='chute'){ctx.globalAlpha=q*.35;ctx.strokeStyle='#69736b';ctx.beginPath();ctx.arc(e.x,e.y,14,Math.PI,TAU);ctx.stroke();}}ctx.globalAlpha=1;}
function effColor(){return state.eff>=.86?'#5fcf79':state.eff>=.70?'#a0c45a':state.eff>=.50?'#d7c451':state.eff>=.30?'#df9342':'#d84c48';}
function drawHud(){
  var top=safeTop+8;ctx.save();ctx.fillStyle='rgba(18,22,16,.72)';ctx.fillRect(8,top,W-16,52);ctx.font='800 11px system-ui,-apple-system,sans-serif';ctx.textBaseline='middle';ctx.fillStyle='#eee8d2';ctx.fillText('HP '+Math.max(0,Math.round(state.bunker.hp))+'/'+state.bunker.maxHp,17,top+15);
  ctx.textAlign='center';ctx.fillStyle=effColor();ctx.fillText('EFF '+Math.round(state.eff*100)+'%',W*.5,top+15);ctx.textAlign='right';ctx.fillStyle='#eee8d2';ctx.fillText('KILLS '+(state.stats.kills+state.stats.vehicleKills+state.stats.airKills),W-17,top+15);
  ctx.textAlign='left';ctx.font='700 9px system-ui,-apple-system,sans-serif';ctx.fillStyle='#aeb3a0';ctx.fillText('MAP '+(state.mapIndex+1)+'/9 · '+state.map.name.toUpperCase(),17,top+36);
  var barX=W*.5-48,barY=top+31,bw=96,bh=8;ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(barX,barY,bw,bh);ctx.fillStyle=effColor();ctx.fillRect(barX,barY,bw*state.eff,bh);ctx.strokeStyle='rgba(255,255,255,.22)';ctx.strokeRect(barX+.5,barY+.5,bw-1,bh-1);
  var bottom=H-safeBottom-16;ctx.fillStyle='rgba(18,22,16,.72)';ctx.fillRect(12,bottom-34,W-24,28);ctx.font='800 9px system-ui,-apple-system,sans-serif';ctx.fillStyle=state.overheat?'#db5a4c':'#d6d5c0';ctx.fillText(state.overheat?'BARREL HOT':'HEAT',20,bottom-20);ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(65,bottom-24,W-92,8);ctx.fillStyle=state.heat>.75?'#dd7447':'#c7aa55';ctx.fillRect(65,bottom-24,(W-92)*state.heat,8);
  if(state.pointer.down){var hold=(performance.now()-state.pointer.t0)/1000*state.profile.chargeScale,label=hold<.20?'MG':hold<.62?'AP':'HE';ctx.textAlign='right';ctx.fillStyle=label==='MG'?'#d7cfad':label==='AP'?'#9dd4ee':'#ee9c4b';ctx.fillText(label,W-20,bottom-20);ctx.textAlign='left';}
  if(state.messageT>0){ctx.font='900 12px system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(21,25,18,.78)';ctx.fillRect(W*.5-100,top+62,200,26);ctx.fillStyle='#ead88f';ctx.fillText(state.message,W*.5,top+75);}ctx.restore();
}
function drawCrosshair(){if(state.mode!=='playing')return;ctx.save();ctx.translate(state.aim.x,state.aim.y);ctx.strokeStyle='rgba(245,236,196,.72)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,7,0,TAU);ctx.moveTo(-12,0);ctx.lineTo(-5,0);ctx.moveTo(5,0);ctx.lineTo(12,0);ctx.moveTo(0,-12);ctx.lineTo(0,-5);ctx.moveTo(0,5);ctx.lineTo(0,12);ctx.stroke();ctx.restore();}
function render(){if(!state)return;ctx.setTransform(DPR,0,0,DPR,0,0);drawMap();drawVehicles();for(var i=0;i<state.enemies.length;i++)drawSoldier(state.enemies[i]);drawAir();drawShots();drawEffects();drawBunker();drawCrosshair();drawHud();}
function loop(ts){var dt=last?Math.min(.033,(ts-last)/1000):0;last=ts;if(state&&state.mode==='playing')update(dt);render();requestAnimationFrame(loop);}

resize();state=freshState();state.profile=profile();state.bunker.maxHp=state.profile.maxHp;state.bunker.hp=state.profile.maxHp;buildMap();requestAnimationFrame(loop);
window.addEventListener('error',function(e){try{var box=document.createElement('div');box.style.cssText='position:fixed;left:8px;right:8px;bottom:78px;z-index:9999;background:#651d1d;color:#fff;padding:8px;font:11px monospace';box.textContent='JBD ERROR: '+(e.message||'unknown');document.body.appendChild(box);}catch(_){}});
})();