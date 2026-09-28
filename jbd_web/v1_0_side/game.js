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
var SAVE_KEY='jbd_v1_0_side_save';
var DPR=1,W=0,H=0,safeTop=0,safeBottom=0,last=0,groundY=0;
var state=null,audioCtx=null;

var THEMES={
  jungle:{sky:'#9cab85',sky2:'#7e8f70',ground:'#667352',ground2:'#566347',line:'#30362d',road:'#8d8062',veg:'#425b3d',veg2:'#607750',building:'#81745c',roof:'#625847',dust:'#7d765f'},
  desert:{sky:'#c8b98f',sky2:'#ad9d76',ground:'#9c8963',ground2:'#897754',line:'#443e33',road:'#81745c',veg:'#74734d',veg2:'#96915e',building:'#91785d',roof:'#6e5c49',dust:'#b49b73'},
  polar:{sky:'#c9d2cf',sky2:'#aebbb7',ground:'#abb7b1',ground2:'#929f99',line:'#39413e',road:'#8f9994',veg:'#6c8076',veg2:'#81948b',building:'#87918c',roof:'#68716d',dust:'#bfc8c4'}
};
var MAPS=[
  {name:'Jungle Verge',theme:'jungle',seed:11},{name:'Jungle Depot',theme:'jungle',seed:29},{name:'Jungle Village',theme:'jungle',seed:43},
  {name:'Desert Road',theme:'desert',seed:61},{name:'Desert Depot',theme:'desert',seed:73},{name:'Desert Ridge',theme:'desert',seed:89},
  {name:'Polar Station',theme:'polar',seed:101},{name:'Polar Road',theme:'polar',seed:113},{name:'Polar Base',theme:'polar',seed:131}
];
var UPGRADES={
  damage:{label:'DAMAGE',desc:'meer schade per treffer',cost:[40,65,95,135]},
  speed:{label:'SPEED',desc:'projectielen vliegen sneller',cost:[35,55,80,115]},
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
function loadSave(){
  try{
    var raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(raw&&raw.upgrades){
      var keys=['damage','speed','burst','charge','cooling','he','armor'];
      for(var i=0;i<keys.length;i++)if(typeof raw.upgrades[keys[i]]!=='number')raw.upgrades[keys[i]]=0;
      if(typeof raw.supply!=='number')raw.supply=0;if(typeof raw.bestMap!=='number')raw.bestMap=0;
      return raw;
    }
  }catch(e){}
  return {supply:0,upgrades:{damage:0,speed:0,burst:0,charge:0,cooling:0,he:0,armor:0},bestMap:0};
}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state.save));}catch(e){}}
function profile(){
  var u=state.save.upgrades;
  return {
    maxHp:100+u.armor*18,
    damage:1+u.damage*.26,
    projectileSpeed:1+u.speed*.18,
    burst:5+u.burst,
    chargeScale:1+u.charge*.18,
    cool:.19+u.cooling*.055,
    heatScale:Math.max(.60,1-u.cooling*.08),
    heRadius:34+u.he*8
  };
}
function resize(){
  readSafe();DPR=Math.min(window.devicePixelRatio||1,2);W=Math.max(320,innerWidth);H=Math.max(480,innerHeight);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);groundY=H-Math.max(82,safeBottom+62);
  if(state){state.bunker.x=68;state.bunker.y=groundY;buildMap();}
}
addEventListener('resize',resize,{passive:true});

function freshState(){
  var sv=loadSave();
  return {
    mode:'menu',save:sv,mapIndex:Math.min(8,sv.bestMap||0),time:0,levelTime:0,levelComplete:false,
    bunker:{x:68,y:groundY,hp:100,maxHp:100,angle:-.25},
    aim:{x:W*.72,y:H*.42},pointer:{down:false,t0:0,x:W*.72,y:H*.42},
    heat:0,overheat:false,eff:.75,message:'',messageT:0,profile:null,
    stats:{shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0},
    enemies:[],vehicles:[],air:[],paras:[],shots:[],enemyShots:[],effects:[],craters:[],wrecks:[],
    burstQueue:[],events:[],eventCursor:0,map:null
  };
}
function buildMap(){
  if(!state)return;
  var m=MAPS[state.mapIndex],rng=seeded(m.seed+state.mapIndex*71),p=THEMES[m.theme],bg=[],props=[],covers=[];
  for(var i=0;i<6;i++)bg.push({x:rng()*W,y:groundY-rand(45,120),w:55+rng()*85,h:18+rng()*38});
  for(i=0;i<(m.theme==='jungle'?12:m.theme==='desert'?6:8);i++)props.push({x:W*.25+rng()*W*.73,kind:rng()<.72?'tree':'rock',s:.7+rng()*.8});
  covers.push({x:W*.42,w:34,type:'sandbags'});covers.push({x:W*.63,w:30,type:'crate'});covers.push({x:W*.80,w:36,type:'sandbags'});
  state.map={name:m.name,theme:m.theme,p:p,bg:bg,props:props,covers:covers,seed:m.seed};
}
function resetLevel(){
  state.profile=profile();state.time=0;state.levelTime=0;state.levelComplete=false;state.heat=0;state.overheat=false;state.eff=.75;
  state.bunker.x=68;state.bunker.y=groundY;state.bunker.maxHp=state.profile.maxHp;state.bunker.hp=state.profile.maxHp;
  state.stats={shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0};
  state.enemies=[];state.vehicles=[];state.air=[];state.paras=[];state.shots=[];state.enemyShots=[];state.effects=[];state.craters=[];state.wrecks=[];state.burstQueue=[];
  state.eventCursor=0;state.message='';state.messageT=0;buildMap();state.events=makeEvents(state.mapIndex);state.mode='playing';
}
function makeEvents(i){
  var hard=1+i*.10,arr=[
    {t:.45,type:'truck',count:3},{t:1.1,type:'foot',count:2},{t:2.6,type:'technical',count:1},{t:4.1,type:'heli',count:i<3?2:3},
    {t:6.0,type:'foot',count:3},{t:7.4,type:'plane',count:i<4?3:4},{t:9.5,type:'truck',count:3},{t:11.6,type:i<2?'technical':'halftrack',count:1},
    {t:13.6,type:'foot',count:3},{t:15.4,type:'heli',count:3},{t:17.7,type:i<3?'truck':'tank',count:i<3?3:1},
    {t:20.0,type:'foot',count:Math.round(3*hard)},{t:22.2,type:'plane',count:4}
  ];
  if(i>4)arr.push({t:24.4,type:'tank',count:1});return arr;
}
function groundFor(x){return groundY;}
function nearestCover(x){
  var best=null,bd=9999;
  for(var i=0;i<state.map.covers.length;i++){var c=state.map.covers[i],d=Math.abs(x-c.x);if(d<bd&&d<90){best=c;bd=d;}}
  return best;
}
function spawnInfantry(x,kind){
  kind=kind||(['rifle','rifle','lmg','grenadier'][Math.floor(Math.random()*4)]);
  var hp=kind==='lmg'?34:kind==='grenadier'?30:26,sp=kind==='lmg'?35:kind==='grenadier'?33:39;
  state.enemies.push({
    id:Math.random()*1e9|0,x:x==null?W+rand(15,60):x,y:groundY,kind:kind,hp:hp,maxHp:hp,speed:sp+state.mapIndex*1.5,
    state:'advance',stateT:0,anim:Math.random()*10,fireCd:rand(.4,1.1),muzzle:0,deadT:0,cover:null,coverT:0
  });
}
function spawnFoot(n){for(var i=0;i<n;i++)spawnInfantry(W+22+i*13+rand(0,16));}
function spawnVehicle(type,count){
  var hp,sp;
  if(type==='truck'){hp=95;sp=62;}
  else if(type==='technical'){hp=82;sp=67;}
  else if(type==='halftrack'){hp=155;sp=48;}
  else{hp=275;sp=34;}
  state.vehicles.push({
    id:Math.random()*1e9|0,type:type,x:W+70,y:groundY,hp:hp,maxHp:hp,speed:sp,dropCount:type==='truck'?(count||3):(type==='halftrack'?2:0),
    dropped:false,state:'advance',stopT:0,fireCd:rand(.5,1.1),smoke:0,retreat:false
  });
}
function spawnHeli(n){
  state.air.push({id:Math.random()*1e9|0,type:'heli',x:W+110,y:safeTop+145,targetX:W*.68,targetY:safeTop+165,phase:'in',t:0,dropCount:n||2,dropped:false,hp:125,rotor:0,vx:-145});
  state.message='HELICOPTER INSERTION';state.messageT=.85;
}
function spawnPlane(n){
  state.air.push({id:Math.random()*1e9|0,type:'plane',x:W+150,y:safeTop+100+state.mapIndex%3*18,vx:-190,phase:'cross',t:0,dropCount:n||3,dropped:0,hp:175});
  state.message='AIRBORNE CONTACT';state.messageT=.85;
}
function processEvents(){
  while(state.eventCursor<state.events.length&&state.levelTime>=state.events[state.eventCursor].t){
    var e=state.events[state.eventCursor++];
    if(e.type==='foot')spawnFoot(e.count);else if(e.type==='heli')spawnHeli(e.count);else if(e.type==='plane')spawnPlane(e.count);else spawnVehicle(e.type,e.count);
  }
}
function blood(x,y,n){for(var i=0;i<n;i++)state.effects.push({type:'blood',x:x+rand(-3,3),y:y-rand(10,22),vx:rand(-20,18),vy:rand(-28,-5),t:0,life:.5});}
function explode(x,y,r,crater){state.effects.push({type:'explosion',x:x,y:y,r:r,t:0,life:.55});if(crater!==false)state.craters.push({x:x,r:r*rand(.65,.95),seed:Math.random()*9999|0});sound('boom');}
function killEnemy(e,kind){
  if(e.state==='dead')return;e.state='dead';e.deadT=0;e.fall=rand(-1,1);state.stats.kills++;state.eff=clamp(state.eff+.024,0,1);blood(e.x,e.y,kind==='he'?7:3);
}
function damageEnemy(e,dmg,kind){if(e.state==='dead')return false;e.hp-=dmg;if(e.hp<=0){killEnemy(e,kind);return true;}blood(e.x,e.y,1);return false;}
function damageVehicle(v,dmg,kind){
  if(v.state==='dead')return false;
  var mult=kind==='mg'?((v.type==='technical'||v.type==='truck')?.72:.12):(kind==='ap'?1.35:(kind==='he'?.72:1));
  v.hp-=dmg*mult;if(v.hp<=0){v.state='dead';state.stats.vehicleKills++;state.eff=clamp(state.eff+.03,0,1);state.wrecks.push({type:v.type,x:v.x,y:v.y});explode(v.x,v.y-12,28,true);return true;}
  v.smoke=.45;return false;
}
function damageAir(a,dmg){a.hp-=dmg;if(a.hp<=0&&a.phase!=='dead'){a.phase='dead';state.stats.airKills++;state.eff=clamp(state.eff+.035,0,1);explode(a.x,a.y,26,false);return true;}return false;}
function enemyFireFrom(x,y,kind,dmg,speed){
  var tx=state.bunker.x+10,ty=state.bunker.y-20,dx=tx-x,dy=ty-y,d=Math.sqrt(dx*dx+dy*dy)||1;
  state.enemyShots.push({x:x,y:y,px:x,py:y,vx:dx/d*speed,vy:dy/d*speed,kind:kind,dmg:dmg,t:0,life:2.5});
}
function updateInfantry(dt){
  for(var i=0;i<state.enemies.length;i++){
    var e=state.enemies[i];e.anim+=dt*(e.state==='advance'?8:2.5);e.stateT+=dt;e.muzzle=Math.max(0,e.muzzle-dt);
    if(e.state==='dead'){e.deadT+=dt;continue;}
    var dx=state.bunker.x-e.x,d=Math.abs(dx);
    if(e.state==='advance'){
      if(!e.cover&&e.x<W*.85&&Math.random()<dt*.45)e.cover=nearestCover(e.x);
      if(e.cover&&Math.abs(e.x-e.cover.x)<10){e.state='cover';e.stateT=0;e.coverT=rand(.8,1.5);}
      else if(d<190+state.mapIndex*3){e.state='fire';e.stateT=0;}
      else e.x-=e.speed*dt;
    }else if(e.state==='cover'){
      e.fireCd-=dt;if(e.fireCd<=0){enemyFireFrom(e.x,e.y-22,e.kind==='grenadier'?'grenade':e.kind==='lmg'?'lmg':'rifle',e.kind==='grenadier'?8:e.kind==='lmg'?3.2:2.4,e.kind==='grenadier'?170:330);e.fireCd=e.kind==='lmg'?.32:e.kind==='grenadier'?1.35:rand(.62,.98);e.muzzle=.08;}
      if(e.stateT>e.coverT){e.cover=null;e.state='advance';e.stateT=0;}
    }else{
      e.fireCd-=dt;if(e.fireCd<=0){enemyFireFrom(e.x,e.y-22,e.kind==='grenadier'?'grenade':e.kind==='lmg'?'lmg':'rifle',e.kind==='grenadier'?8:e.kind==='lmg'?3.2:2.4,e.kind==='grenadier'?170:330);e.fireCd=e.kind==='lmg'?.30:e.kind==='grenadier'?1.35:rand(.62,.98);e.muzzle=.08;}
      if(d>205){e.state='advance';e.stateT=0;}
    }
  }
  state.enemies=state.enemies.filter(function(e){return e.state!=='dead'||e.deadT<8;});
}
function updateVehicles(dt){
  for(var i=0;i<state.vehicles.length;i++){
    var v=state.vehicles[i];if(v.state==='dead')continue;v.smoke=Math.max(0,v.smoke-dt);
    if(v.type==='truck'&&!v.dropped&&v.x<=W*.72){v.dropped=true;v.state='drop';v.stopT=.8;for(var k=0;k<v.dropCount;k++)spawnInfantry(v.x+22+k*12);}
    if(v.type==='halftrack'&&!v.dropped&&v.x<=W*.68){v.dropped=true;for(k=0;k<2;k++)spawnInfantry(v.x+18+k*12);}
    if(v.state==='drop'){v.stopT-=dt;if(v.stopT<=0){v.state='retreat';v.retreat=true;}continue;}
    if(v.retreat){v.x+=v.speed*1.15*dt;continue;}
    var targetX=v.type==='tank'?260:v.type==='halftrack'?290:v.type==='technical'?315:230;
    if(v.x>targetX)v.x-=v.speed*dt;
    else{
      v.fireCd-=dt;
      if(v.fireCd<=0&&v.type!=='truck'){
        var dmg=v.type==='tank'?11:v.type==='halftrack'?5.5:4.5;
        enemyFireFrom(v.x-18,v.y-25,v.type==='tank'?'shell':'vehicle',dmg,v.type==='tank'?260:360);
        v.fireCd=v.type==='tank'?1.6:.72;
      }
    }
  }
  state.vehicles=state.vehicles.filter(function(v){return v.x<W+180&&v.x>-120;});
}
function spawnPara(x,y,index){
  state.paras.push({id:Math.random()*1e9|0,x:x+rand(-8,8),baseX:x,y:y,landY:groundY,phase:rand(0,TAU),hp:22,state:'descend',vy:42+rand(-3,4),index:index});
}
function updateAir(dt){
  for(var i=0;i<state.air.length;i++){
    var a=state.air[i];a.t+=dt;
    if(a.phase==='dead'){a.x-=60*dt;a.y+=95*dt;continue;}
    if(a.type==='heli'){
      a.rotor+=dt*17;
      if(a.phase==='in'){
        var dx=a.targetX-a.x,dy=a.targetY-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;a.x+=dx/d*145*dt;a.y+=dy/d*145*dt;if(d<9){a.phase='hover';a.t=0;}
      }else if(a.phase==='hover'){
        if(!a.dropped&&a.t>.35){a.dropped=true;for(var k=0;k<a.dropCount;k++)spawnInfantry(a.x+20+k*12);sound('heli');}
        if(a.t>1.35){a.phase='out';a.vx=165;}
      }else if(a.phase==='out')a.x+=a.vx*dt;
    }else{
      a.x+=a.vx*dt;var start=W*.76,end=W*.36;
      while(a.dropped<a.dropCount){
        var f=a.dropCount<=1?.5:a.dropped/(a.dropCount-1),trigger=lerp(start,end,f);
        if(a.x>trigger)break;spawnPara(a.x,a.y+18,a.dropped);a.dropped++;
      }
    }
  }
  for(i=0;i<state.paras.length;i++){
    var p=state.paras[i];
    if(p.state==='descend'){
      p.phase+=dt*2.3;p.baseX-=4*dt;p.x=p.baseX+Math.sin(p.phase)*11;p.y+=p.vy*dt;
      if(p.y>=p.landY-4){p.state='landed';spawnInfantry(p.x);state.effects.push({type:'chute',x:p.x,y:groundY,t:0,life:2.5});}
    }else if(p.state==='dead')p.y+=80*dt;
  }
  state.paras=state.paras.filter(function(p){return p.state!=='landed'&&p.y<H+50;});
  state.air=state.air.filter(function(a){return a.x>-180&&a.x<W+180&&a.y<H+150;});
}
function damageBunker(dmg){
  var reduction=state.save.upgrades.armor*.05,real=dmg*(1-reduction);state.bunker.hp-=real;state.stats.damageTaken+=real;state.eff=clamp(state.eff-.006*real,0,1);
  state.effects.push({type:'hit',x:state.bunker.x+rand(-12,14),y:state.bunker.y-rand(15,38),t:0,life:.28});
  if(state.bunker.hp<=0)endGame('BUNKER LOST');
}
function updateEnemyShots(dt){
  for(var i=0;i<state.enemyShots.length;i++){
    var b=state.enemyShots[i];b.px=b.x;b.py=b.y;b.t+=dt;if(b.kind==='grenade')b.vy+=110*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(dist(b.x,b.y,state.bunker.x+5,state.bunker.y-20)<28){damageBunker(b.dmg);if(b.kind==='grenade'||b.kind==='shell')explode(b.x,b.y,b.kind==='shell'?24:18,true);b.life=0;}
    b.life-=dt;
  }
  state.enemyShots=state.enemyShots.filter(function(b){return b.life>0&&b.x>-60&&b.x<W+80&&b.y>-60&&b.y<H+70;});
}
function queueMG(x,y){if(state.overheat){state.message='BARREL HOT';state.messageT=.35;return;}var n=state.profile.burst;for(var i=0;i<n;i++)state.burstQueue.push({t:i*.052,x:x,y:y});}
function fireWeapon(kind,x,y){
  if(state.overheat){state.message='BARREL HOT';state.messageT=.35;return;}
  var p=state.profile,heat=kind==='ap'?.11:kind==='he'?.18:.025;state.heat=clamp(state.heat+heat*p.heatScale,0,1);if(state.heat>=.96)state.overheat=true;
  var damage=(kind==='mg'?10:kind==='ap'?52:42)*p.damage,speed=(kind==='mg'?520:kind==='ap'?390:300)*p.projectileSpeed,range=Math.hypot(W,H)*1.22;
  var sx=state.bunker.x+26,sy=state.bunker.y-34,dx=x-sx,dy=y-sy,d=Math.sqrt(dx*dx+dy*dy)||1,spread=kind==='mg'?.028:kind==='ap'?.006:.010,ang=Math.atan2(dy,dx)+rand(-spread,spread);
  state.shots.push({kind:kind,x:sx,y:sy,px:sx,py:sy,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,damage:damage,range:range,traveled:0,active:true,radius:kind==='he'?p.heRadius:0});
  state.stats.shots++;sound(kind);
}
function pointSegDist(px,py,x1,y1,x2,y2){var dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy;if(!l2)return dist(px,py,x1,y1);var t=clamp(((px-x1)*dx+(py-y1)*dy)/l2,0,1);return dist(px,py,x1+dx*t,y1+dy*t);}
function resolvePlayerHit(b){
  var best=null,bd=9999,hitType='',i,e,v,a,d;
  for(i=0;i<state.enemies.length;i++){e=state.enemies[i];if(e.state==='dead')continue;d=pointSegDist(e.x,e.y-18,b.px,b.py,b.x,b.y);if(d<12&&d<bd){best=e;bd=d;hitType='enemy';}}
  for(i=0;i<state.vehicles.length;i++){v=state.vehicles[i];if(v.state==='dead')continue;d=pointSegDist(v.x,v.y-18,b.px,b.py,b.x,b.y);if(d<22&&d<bd){best=v;bd=d;hitType='vehicle';}}
  for(i=0;i<state.paras.length;i++){e=state.paras[i];if(e.state!=='descend')continue;d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);if(d<14&&d<bd){best=e;bd=d;hitType='para';}}
  for(i=0;i<state.air.length;i++){a=state.air[i];if(a.phase==='dead')continue;d=pointSegDist(a.x,a.y,b.px,b.py,b.x,b.y);if(d<(a.type==='heli'?28:22)&&d<bd){best=a;bd=d;hitType='air';}}
  if(!best)return false;
  state.stats.hits++;state.eff=clamp(state.eff+.010,0,1);
  if(b.kind==='he'){explode(b.x,b.y,b.radius,true);blast(b.x,b.y,b.radius,b.damage);b.active=false;return true;}
  if(hitType==='enemy')damageEnemy(best,b.damage,b.kind);
  else if(hitType==='vehicle')damageVehicle(best,b.damage,b.kind);
  else if(hitType==='air')damageAir(best,b.damage);
  else{best.hp-=b.damage;if(best.hp<=0){best.state='dead';state.stats.airKills++;state.eff=clamp(state.eff+.02,0,1);blood(best.x,best.y,4);}}
  b.active=false;return true;
}
function blast(x,y,r,base){
  for(var i=0;i<state.enemies.length;i++){var e=state.enemies[i];if(e.state==='dead')continue;var d=dist(x,y,e.x,e.y-14);if(d<r)damageEnemy(e,base*(.35+.65*(1-d/r)),'he');}
  for(i=0;i<state.vehicles.length;i++){var v=state.vehicles[i];if(v.state==='dead')continue;d=dist(x,y,v.x,v.y-14);if(d<r*1.1)damageVehicle(v,base*(.25+.55*(1-d/(r*1.1))),'he');}
}
function updateShots(dt){
  for(var i=0;i<state.burstQueue.length;i++)state.burstQueue[i].t-=dt;
  while(state.burstQueue.length&&state.burstQueue[0].t<=0){var q=state.burstQueue.shift();fireWeapon('mg',q.x,q.y);}
  for(i=0;i<state.shots.length;i++){
    var b=state.shots[i];if(!b.active)continue;b.px=b.x;b.py=b.y;var dx=b.vx*dt,dy=b.vy*dt;b.x+=dx;b.y+=dy;b.traveled+=Math.sqrt(dx*dx+dy*dy);
    if(resolvePlayerHit(b))continue;
    if(b.traveled>=b.range||b.x<-30||b.x>W+50||b.y<-30||b.y>H+40){
      if(b.kind==='he'){explode(b.x,b.y,b.radius,true);blast(b.x,b.y,b.radius,b.damage*.7);}
      else{state.stats.misses++;state.eff=clamp(state.eff-.0055,0,1);}
      b.active=false;
    }
  }
  state.shots=state.shots.filter(function(b){return b.active;});
}
function updateEffects(dt){for(var i=0;i<state.effects.length;i++){var e=state.effects[i];e.t+=dt;if(e.type==='blood'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=65*dt;}}state.effects=state.effects.filter(function(e){return e.t<e.life;});}
function update(dt){
  if(!state||state.mode!=='playing')return;
  state.time+=dt;state.levelTime+=dt;state.bunker.angle=Math.atan2(state.aim.y-(state.bunker.y-34),state.aim.x-(state.bunker.x+10));
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
  subEl.textContent=state.mapIndex>=8?'Alle negen side-view maps zijn gehaald. Start opnieuw met je upgrades behouden.':'Upgrade DAMAGE, SPEED en de bunker voor de volgende aanval.';
  summaryEl.style.display='block';summaryEl.textContent='EFF '+Math.round(state.eff*100)+'% · KILLS '+(state.stats.kills+state.stats.vehicleKills+state.stats.airKills)+' · HP '+Math.max(0,Math.round(state.bunker.hp))+'/'+state.bunker.maxHp+' · +'+reward+' SUPPLY';
  shopEl.style.display='block';restartBtn.style.display='none';deployBtn.style.display='block';deployBtn.textContent=state.mapIndex>=8?'RESTART CAMPAIGN':'NEXT MAP';renderShop();
}
function renderShop(){
  supplyEl.textContent='SUPPLY: '+state.save.supply;shopGrid.innerHTML='';
  Object.keys(UPGRADES).forEach(function(key){
    var cfg=UPGRADES[key],lvl=state.save.upgrades[key]||0,max=cfg.cost.length,cost=lvl<max?cfg.cost[lvl]:null,b=document.createElement('button');
    b.type='button';b.className='shopBtn'+(cost==null||state.save.supply<cost?' disabled':'');
    b.innerHTML='<strong>'+cfg.label+' · '+lvl+'/'+max+'</strong><span>'+cfg.desc+'</span><em>'+(cost==null?'MAX':cost+' SUPPLY')+'</em>';
    if(cost!=null)b.addEventListener('click',function(){if(state.save.supply<cost)return;state.save.supply-=cost;state.save.upgrades[key]=lvl+1;save();renderShop();});
    shopGrid.appendChild(b);
  });
}
function endGame(reason){
  state.mode='gameover';overlay.classList.remove('hidden');titleEl.textContent=reason;subEl.textContent='De linie is gebroken. Probeer dezelfde map opnieuw.';
  summaryEl.style.display='block';summaryEl.textContent='EFF '+Math.round(state.eff*100)+'% · KILLS '+(state.stats.kills+state.stats.vehicleKills+state.stats.airKills)+' · MAP '+(state.mapIndex+1)+'/9';
  shopEl.style.display='none';deployBtn.style.display='none';restartBtn.style.display='block';
}
function pointerPos(ev){var r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height};}
canvas.addEventListener('pointerdown',function(ev){
  if(!state||state.mode!=='playing')return;var p=pointerPos(ev);state.pointer.down=true;state.pointer.t0=performance.now();state.pointer.x=p.x;state.pointer.y=p.y;state.aim=p;
  try{canvas.setPointerCapture(ev.pointerId);}catch(e){}ev.preventDefault();
},{passive:false});
canvas.addEventListener('pointermove',function(ev){if(!state||state.mode!=='playing')return;var p=pointerPos(ev);state.aim=p;state.pointer.x=p.x;state.pointer.y=p.y;if(state.pointer.down)ev.preventDefault();},{passive:false});
canvas.addEventListener('pointerup',function(ev){
  if(!state||state.mode!=='playing'||!state.pointer.down)return;var p=pointerPos(ev);state.aim=p;var hold=(performance.now()-state.pointer.t0)/1000*state.profile.chargeScale;state.pointer.down=false;
  if(hold<.20)queueMG(p.x,p.y);else if(hold<.62)fireWeapon('ap',p.x,p.y);else fireWeapon('he',p.x,p.y);ev.preventDefault();
},{passive:false});
canvas.addEventListener('pointercancel',function(){if(state)state.pointer.down=false;});
deployBtn.addEventListener('click',function(){
  unlockAudio();
  if(state.mode==='menu'){overlay.classList.add('hidden');shopEl.style.display='none';summaryEl.style.display='none';resetLevel();return;}
  if(state.mode==='shop'){if(state.mapIndex>=8)state.mapIndex=0;else state.mapIndex++;overlay.classList.add('hidden');shopEl.style.display='none';summaryEl.style.display='none';resetLevel();}
});
restartBtn.addEventListener('click',function(){unlockAudio();overlay.classList.add('hidden');restartBtn.style.display='none';deployBtn.style.display='block';summaryEl.style.display='none';resetLevel();});

function unlockAudio(){try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch(e){}}
function sound(kind){
  if(!audioCtx)return;
  try{
    var o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;o.connect(g);g.connect(audioCtx.destination);
    if(kind==='mg'){o.type='square';o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(72,t+.045);g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);o.start(t);o.stop(t+.055);}
    else if(kind==='ap'||kind==='he'||kind==='boom'){o.type='sawtooth';o.frequency.setValueAtTime(kind==='ap'?88:64,t);o.frequency.exponentialRampToValueAtTime(34,t+.16);g.gain.setValueAtTime(kind==='boom'?.085:.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.start(t);o.stop(t+.19);}
    else if(kind==='heli'){o.type='triangle';o.frequency.value=46;g.gain.setValueAtTime(.025,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.start(t);o.stop(t+.2);}
  }catch(e){}
}

function drawSky(){
  var p=state.map.p,g=ctx.createLinearGradient(0,0,0,groundY);g.addColorStop(0,p.sky);g.addColorStop(1,p.sky2);ctx.fillStyle=g;ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle=p.ground;ctx.fillRect(0,groundY,W,H-groundY);ctx.fillStyle=p.ground2;ctx.fillRect(0,groundY,W,10);
}
function drawBackground(){
  var p=state.map.p,rng=seeded(state.map.seed+5),i,b;
  ctx.save();ctx.globalAlpha=.22;ctx.fillStyle=p.line;
  for(i=0;i<state.map.bg.length;i++){b=state.map.bg[i];ctx.beginPath();ctx.ellipse(b.x,b.y,b.w,b.h,0,0,TAU);ctx.fill();}
  ctx.globalAlpha=1;
  for(i=0;i<state.map.props.length;i++){var q=state.map.props[i];if(q.kind==='tree')drawSideTree(q,p);else drawSideRock(q,p);}
  for(i=0;i<state.map.covers.length;i++)drawCover(state.map.covers[i],p);
  for(i=0;i<state.craters.length;i++)drawGroundCrater(state.craters[i],p);
  for(i=0;i<state.wrecks.length;i++)drawVehicle(state.wrecks[i],true);
  ctx.restore();
}
function drawSideTree(q,p){
  var x=q.x,s=q.s;ctx.save();ctx.translate(x,groundY);ctx.strokeStyle=p.line;ctx.fillStyle=p.veg;ctx.lineWidth=1.5;ctx.fillRect(-2*s,-28*s,4*s,28*s);
  ctx.beginPath();ctx.arc(0,-34*s,12*s,0,TAU);ctx.arc(-8*s,-29*s,8*s,0,TAU);ctx.arc(8*s,-29*s,9*s,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
}
function drawSideRock(q,p){var x=q.x,s=q.s;ctx.save();ctx.translate(x,groundY);ctx.fillStyle=p.veg2;ctx.strokeStyle=p.line;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-9*s,0);ctx.lineTo(-5*s,-8*s);ctx.lineTo(4*s,-10*s);ctx.lineTo(10*s,-3*s);ctx.lineTo(7*s,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
function drawCover(c,p){ctx.save();ctx.translate(c.x,groundY);ctx.strokeStyle=p.line;ctx.lineWidth=1.3;if(c.type==='sandbags'){ctx.fillStyle='#827660';for(var i=-1;i<=1;i++){ctx.beginPath();ctx.ellipse(i*11,-6,8,5,0,0,TAU);ctx.fill();ctx.stroke();}}else{ctx.fillStyle=p.building;ctx.fillRect(-15,-18,30,18);ctx.strokeRect(-15,-18,30,18);ctx.beginPath();ctx.moveTo(-15,-18);ctx.lineTo(15,0);ctx.moveTo(15,-18);ctx.lineTo(-15,0);ctx.stroke();}ctx.restore();}
function drawGroundCrater(c,p){var rng=seeded(c.seed);ctx.save();ctx.translate(c.x,groundY+1);ctx.fillStyle='rgba(42,33,26,.22)';ctx.strokeStyle=p.line;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,0,c.r,4+c.r*.18,0,0,TAU);ctx.fill();ctx.stroke();ctx.globalAlpha=.25;ctx.strokeStyle='#c2a778';ctx.beginPath();ctx.ellipse(0,-1,c.r*.55,2+c.r*.08,0,0,TAU);ctx.stroke();ctx.restore();}
function drawBunker(){
  var b=state.bunker;ctx.save();ctx.translate(b.x,b.y);ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(2,3,42,8,0,0,TAU);ctx.fill();
  ctx.fillStyle='#696c58';ctx.strokeStyle='#292e27';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-38,0);ctx.lineTo(-31,-30);ctx.quadraticCurveTo(-7,-48,19,-32);ctx.lineTo(31,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#85836b';ctx.beginPath();ctx.arc(2,-31,10,0,TAU);ctx.fill();ctx.stroke();
  ctx.translate(2,-31);ctx.rotate(b.angle);ctx.strokeStyle='#222721';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(34,0);ctx.stroke();ctx.restore();
}
function drawSoldier(e){
  var walk=e.state==='advance',phase=Math.sin(e.anim*1.7),crouch=e.state==='cover';ctx.save();ctx.translate(e.x,e.y);ctx.strokeStyle='#293127';ctx.fillStyle='#68764f';ctx.lineWidth=1.5;ctx.lineCap='round';ctx.lineJoin='round';
  if(e.state==='dead'){ctx.globalAlpha=clamp(1-e.deadT/8,.32,1);ctx.rotate(e.fall*.45);ctx.beginPath();ctx.ellipse(0,-7,6,3,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#8b9870';ctx.beginPath();ctx.arc(7,-7,2.4,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-5,-7);ctx.lineTo(-11,-3);ctx.moveTo(-4,-7);ctx.lineTo(-11,-10);ctx.stroke();ctx.restore();return;}
  var bodyY=crouch?-12:-18;ctx.fillStyle='#6b7951';ctx.beginPath();ctx.ellipse(0,bodyY,4.2,crouch?6:8,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle='#8e9a72';ctx.beginPath();ctx.arc(0,bodyY-9,3.3,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#414a38';var legA=walk?phase*5:0,legB=-legA;ctx.beginPath();ctx.moveTo(-2,bodyY+7);ctx.lineTo(-5-legA*.45,-2+Math.abs(legA)*.2);ctx.moveTo(2,bodyY+7);ctx.lineTo(5-legB*.45,-2+Math.abs(legB)*.2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(3,bodyY-2);ctx.lineTo(8,bodyY+2);ctx.moveTo(-3,bodyY-2);ctx.lineTo(4,bodyY+1);ctx.stroke();
  ctx.strokeStyle='#252b23';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(5,bodyY);ctx.lineTo(15,bodyY-2);ctx.stroke();
  if(e.muzzle>0){ctx.fillStyle='#ffe29a';ctx.beginPath();ctx.moveTo(18,bodyY-2);ctx.lineTo(14,bodyY-5);ctx.lineTo(14,bodyY+1);ctx.closePath();ctx.fill();}
  ctx.restore();
}
function drawVehicle(v,wreck){
  ctx.save();ctx.translate(v.x,v.y);ctx.globalAlpha=wreck?.58:1;ctx.strokeStyle='#2f352d';ctx.lineWidth=1.6;ctx.lineJoin='round';var type=v.type||'truck';
  if(type==='truck'){ctx.fillStyle=wreck?'#5d594c':'#797a5d';ctx.fillRect(-26,-25,34,22);ctx.strokeRect(-26,-25,34,22);ctx.beginPath();ctx.moveTo(8,-25);ctx.lineTo(22,-20);ctx.lineTo(22,-3);ctx.lineTo(8,-3);ctx.closePath();ctx.fill();ctx.stroke();wheel(-16,0);wheel(13,0);}
  else if(type==='technical'){ctx.fillStyle=wreck?'#5a574c':'#74765b';ctx.fillRect(-22,-16,38,13);ctx.strokeRect(-22,-16,38,13);ctx.beginPath();ctx.arc(0,-18,4,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(-12,-24);ctx.stroke();wheel(-14,0);wheel(12,0);}
  else if(type==='halftrack'){ctx.fillStyle=wreck?'#57584d':'#69715b';ctx.beginPath();ctx.moveTo(-24,-22);ctx.lineTo(17,-22);ctx.lineTo(25,-8);ctx.lineTo(22,-3);ctx.lineTo(-24,-3);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#20251f';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(18,0);ctx.stroke();wheel(-14,0);wheel(10,0);}
  else{ctx.fillStyle=wreck?'#56574c':'#68705b';ctx.beginPath();ctx.moveTo(-28,-20);ctx.lineTo(22,-20);ctx.lineTo(28,-5);ctx.lineTo(24,-2);ctx.lineTo(-28,-2);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#252a23';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-25,1);ctx.lineTo(22,1);ctx.stroke();ctx.lineWidth=1.5;ctx.fillStyle='#7a816a';ctx.fillRect(-7,-30,18,10);ctx.strokeRect(-7,-30,18,10);ctx.beginPath();ctx.moveTo(9,-25);ctx.lineTo(-18,-29);ctx.stroke();wheel(-17,1);wheel(14,1);}
  if(v.smoke>0&&!wreck){ctx.globalAlpha=.18;ctx.fillStyle='#1e211d';ctx.beginPath();ctx.arc(12,-28,5+v.smoke*5,0,TAU);ctx.fill();}ctx.restore();
}
function wheel(x,y){ctx.fillStyle='#2b2f29';ctx.beginPath();ctx.arc(x,y,5,0,TAU);ctx.fill();ctx.stroke();}
function drawHeli(a){
  ctx.save();ctx.translate(a.x,a.y);ctx.fillStyle='rgba(0,0,0,.10)';ctx.beginPath();ctx.ellipse(0,groundY-a.y+6,34,5,0,0,TAU);ctx.fill();
  ctx.strokeStyle='#293029';ctx.lineWidth=1.6;ctx.fillStyle='#6b745e';ctx.beginPath();ctx.ellipse(0,0,23,12,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#87917a';ctx.beginPath();ctx.ellipse(-10,-2,8,5,0,0,TAU);ctx.fill();
  ctx.fillStyle='#555d4e';ctx.beginPath();ctx.moveTo(20,-4);ctx.lineTo(47,-2);ctx.lineTo(47,3);ctx.lineTo(20,4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.rotate(a.rotor);ctx.strokeStyle='#30372e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-42,0);ctx.lineTo(42,0);ctx.stroke();ctx.restore();
  ctx.strokeStyle='#30372e';ctx.beginPath();ctx.moveTo(47,-9);ctx.lineTo(47,9);ctx.stroke();ctx.restore();
}
function drawPlane(a){
  ctx.save();ctx.translate(a.x,a.y);ctx.strokeStyle='#37413f';ctx.fillStyle='#89958f';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-36,0);ctx.lineTo(21,-7);ctx.lineTo(38,0);ctx.lineTo(21,7);ctx.lineTo(-36,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,-18);ctx.lineTo(14,-18);ctx.lineTo(7,0);ctx.stroke();ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-30,-11);ctx.stroke();ctx.restore();
}
function drawPara(p){
  ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle='#39423b';ctx.lineWidth=1.2;ctx.fillStyle='rgba(220,222,205,.9)';ctx.beginPath();ctx.arc(0,-10,14,Math.PI,TAU);ctx.lineTo(14,-10);ctx.lineTo(0,-4);ctx.lineTo(-14,-10);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-12,-10);ctx.lineTo(-2,5);ctx.moveTo(12,-10);ctx.lineTo(2,5);ctx.stroke();ctx.fillStyle='#6b755d';ctx.beginPath();ctx.arc(0,8,2.2,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
}
function drawShots(){
  for(var i=0;i<state.shots.length;i++){var b=state.shots[i];ctx.strokeStyle=b.kind==='mg'?'#f4d681':b.kind==='ap'?'#9dd4ee':'#ee9c4b';ctx.lineWidth=b.kind==='mg'?1.4:2.3;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();if(b.kind!=='mg'){ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(b.x,b.y,2.3,0,TAU);ctx.fill();}}
  for(i=0;i<state.enemyShots.length;i++){b=state.enemyShots[i];ctx.strokeStyle=b.kind==='grenade'?'#e49d4c':'rgba(238,215,155,.72)';ctx.lineWidth=b.kind==='shell'?2:1;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();}
}
function drawEffects(){
  for(var i=0;i<state.effects.length;i++){
    var e=state.effects[i],q=1-e.t/e.life;
    if(e.type==='explosion'){ctx.globalAlpha=q;ctx.strokeStyle='#e5a34e';ctx.fillStyle='rgba(240,167,68,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r*(.35+.8*(1-q)),0,TAU);ctx.fill();ctx.stroke();}
    else if(e.type==='blood'){ctx.globalAlpha=q*.8;ctx.fillStyle='#6a2d2a';ctx.beginPath();ctx.arc(e.x,e.y,1.5,0,TAU);ctx.fill();}
    else if(e.type==='hit'){ctx.globalAlpha=q;ctx.strokeStyle='#f1d487';ctx.beginPath();ctx.moveTo(e.x-5,e.y);ctx.lineTo(e.x+5,e.y);ctx.moveTo(e.x,e.y-5);ctx.lineTo(e.x,e.y+5);ctx.stroke();}
    else if(e.type==='chute'){ctx.globalAlpha=q*.35;ctx.strokeStyle='#69736b';ctx.beginPath();ctx.arc(e.x,e.y,15,Math.PI,TAU);ctx.stroke();}
  }
  ctx.globalAlpha=1;
}
function effColor(){return state.eff>=.86?'#5fcf79':state.eff>=.70?'#a0c45a':state.eff>=.50?'#d7c451':state.eff>=.30?'#df9342':'#d84c48';}
function drawHud(){
  var top=safeTop+8;ctx.save();ctx.fillStyle='rgba(18,22,16,.72)';ctx.fillRect(8,top,W-16,52);ctx.font='800 11px system-ui,-apple-system,sans-serif';ctx.textBaseline='middle';ctx.fillStyle='#eee8d2';ctx.fillText('HP '+Math.max(0,Math.round(state.bunker.hp))+'/'+state.bunker.maxHp,17,top+15);
  ctx.textAlign='center';ctx.fillStyle=effColor();ctx.fillText('EFF '+Math.round(state.eff*100)+'%',W*.5,top+15);ctx.textAlign='right';ctx.fillStyle='#eee8d2';ctx.fillText('KILLS '+(state.stats.kills+state.stats.vehicleKills+state.stats.airKills),W-17,top+15);
  ctx.textAlign='left';ctx.font='700 9px system-ui,-apple-system,sans-serif';ctx.fillStyle='#aeb3a0';ctx.fillText('MAP '+(state.mapIndex+1)+'/9 · '+state.map.name.toUpperCase(),17,top+36);
  var barX=W*.5-48,barY=top+31,bw=96,bh=8;ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(barX,barY,bw,bh);ctx.fillStyle=effColor();ctx.fillRect(barX,barY,bw*state.eff,bh);ctx.strokeStyle='rgba(255,255,255,.22)';ctx.strokeRect(barX+.5,barY+.5,bw-1,bh-1);
  var bottom=H-safeBottom-16;ctx.fillStyle='rgba(18,22,16,.72)';ctx.fillRect(12,bottom-34,W-24,28);ctx.font='800 9px system-ui,-apple-system,sans-serif';ctx.fillStyle=state.overheat?'#db5a4c':'#d6d5c0';ctx.fillText(state.overheat?'BARREL HOT':'HEAT',20,bottom-20);ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(65,bottom-24,W-92,8);ctx.fillStyle=state.heat>.75?'#dd7447':'#c7aa55';ctx.fillRect(65,bottom-24,(W-92)*state.heat,8);
  if(state.pointer.down){var hold=(performance.now()-state.pointer.t0)/1000*state.profile.chargeScale,label=hold<.20?'MG':hold<.62?'AP':'HE';ctx.textAlign='right';ctx.fillStyle=label==='MG'?'#d7cfad':label==='AP'?'#9dd4ee':'#ee9c4b';ctx.fillText(label,W-20,bottom-20);ctx.textAlign='left';}
  if(state.messageT>0){ctx.font='900 12px system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(21,25,18,.78)';ctx.fillRect(W*.5-100,top+62,200,26);ctx.fillStyle='#ead88f';ctx.fillText(state.message,W*.5,top+75);}
  ctx.restore();
}
function drawCrosshair(){if(state.mode!=='playing')return;ctx.save();ctx.translate(state.aim.x,state.aim.y);ctx.strokeStyle='rgba(245,236,196,.72)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,7,0,TAU);ctx.moveTo(-12,0);ctx.lineTo(-5,0);ctx.moveTo(5,0);ctx.lineTo(12,0);ctx.moveTo(0,-12);ctx.lineTo(0,-5);ctx.moveTo(0,5);ctx.lineTo(0,12);ctx.stroke();ctx.restore();}
function render(){
  if(!state)return;ctx.setTransform(DPR,0,0,DPR,0,0);drawSky();drawBackground();
  for(var i=0;i<state.vehicles.length;i++)if(state.vehicles[i].state!=='dead')drawVehicle(state.vehicles[i],false);
  for(i=0;i<state.enemies.length;i++)drawSoldier(state.enemies[i]);
  for(i=0;i<state.air.length;i++){var a=state.air[i];if(a.phase==='dead')continue;if(a.type==='heli')drawHeli(a);else drawPlane(a);}
  for(i=0;i<state.paras.length;i++)if(state.paras[i].state!=='landed')drawPara(state.paras[i]);
  drawShots();drawEffects();drawBunker();drawCrosshair();drawHud();
}
function loop(ts){var dt=last?Math.min(.033,(ts-last)/1000):0;last=ts;if(state&&state.mode==='playing')update(dt);render();requestAnimationFrame(loop);}

resize();state=freshState();state.profile=profile();state.bunker.maxHp=state.profile.maxHp;state.bunker.hp=state.profile.maxHp;buildMap();requestAnimationFrame(loop);
window.addEventListener('error',function(e){try{var box=document.createElement('div');box.style.cssText='position:fixed;left:8px;right:8px;bottom:78px;z-index:9999;background:#651d1d;color:#fff;padding:8px;font:11px monospace';box.textContent='JBD SIDE ERROR: '+(e.message||'unknown');document.body.appendChild(box);}catch(_){}});
})();