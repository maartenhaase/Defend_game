(function(){
'use strict';

/* =========================
   JBD V8.3.7 ARCADE MOTOR ASSAULT
   Single-file game engine.
   No legacy patches.
   ========================= */

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
var SAVE_KEY='jbd_v8_3_pixel_infantry_save';
var IS_IPHONE=/iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);

var W=0,H=0,DPR=1,safeTop=0,safeBottom=0,last=0,acc=0;
var gameState=null;

/* ---------- CONFIG ---------- */

var HE_HOLD=.76;

var DEVICE={
  enemySpeed:IS_IPHONE?.84:1,
  enemyDamage:IS_IPHONE?.76:1,
  spawnGap:IS_IPHONE?1.14:1,
  hitRadius:IS_IPHONE?1.06:.94,
  dprCap:IS_IPHONE?1.5:2,
  maxEffects:IS_IPHONE?112:190,
  maxBlood:IS_IPHONE?20:34
};

var BASE_PALETTES={
  jungle:{ground:'#758064',ground2:'#68745b',road:'#9a8c6c',roadEdge:'#5d6252',line:'#343a31',veg:'#4b6544',veg2:'#637a54',building:'#8d8068',roof:'#655b4c',rock:'#6c695d',trench:'#51483b'},
  desert:{ground:'#b6a47a',ground2:'#a18e66',road:'#968363',roadEdge:'#6e604a',line:'#453e33',veg:'#7d8058',veg2:'#969267',building:'#9b8467',roof:'#745f4d',rock:'#796e5d',trench:'#66523f'},
  polar:{ground:'#c4cdc8',ground2:'#b0bbb6',road:'#9da8a3',roadEdge:'#737e79',line:'#414946',veg:'#71857b',veg2:'#8d9c94',building:'#939b97',roof:'#6e7773',rock:'#798480',trench:'#5f6662'},
  village:{ground:'#88816b',ground2:'#756e5c',road:'#a38f70',roadEdge:'#665e4c',line:'#3b3931',veg:'#52684a',veg2:'#70805f',building:'#a0876b',roof:'#6d5c4b',rock:'#746d5e',trench:'#55493d'},
  industrial:{ground:'#747872',ground2:'#626762',road:'#8e908a',roadEdge:'#555a56',line:'#303532',veg:'#56675b',veg2:'#6c7a70',building:'#7d7e77',roof:'#515651',rock:'#666c67',trench:'#494d49'}
};

var ZONES=[
  {type:'JUNGLE',theme:'jungle',names:['Jungle Entry','Jungle Ambush','Jungle Fortress']},
  {type:'DESERT',theme:'desert',names:['Desert Convoy','Desert Depot','Desert Citadel']},
  {type:'POLAR',theme:'polar',names:['Polar Ridge','Polar Station','Polar Stronghold']},
  {type:'VILLAGE',theme:'village',names:['Village Road','Village Square','Village Keep']},
  {type:'INDUSTRIAL',theme:'industrial',names:['Industrial Yard','Industrial Works','Industrial Core']}
];

var LEVELS=[];
(function(){
  var seed=17;
  for(var z=0;z<ZONES.length;z++){
    for(var st=0;st<3;st++){
      LEVELS.push({zone:z,stage:st,type:ZONES[z].type,theme:ZONES[z].theme,name:ZONES[z].names[st],seed:seed});
      seed+=23+z*4+st*3;
    }
  }
})();
var UPGRADES={
  damage:{label:'DAMAGE',desc:'meer schade per treffer',cost:[40,65,95,135]},
  speed:{label:'SPEED',desc:'projectielen vliegen sneller',cost:[35,55,80,115]},
  burst:{label:'BURST',desc:'één extra MG-kogel per burst',cost:[42,68,100]},
  charge:{label:'CHARGE',desc:'HE sneller geladen',cost:[35,55,80,115]},
  cooling:{label:'COOLING',desc:'minder heat, sneller herstel',cost:[35,55,80,115]},
  he:{label:'HE BLAST',desc:'iets grotere HE explosie',cost:[45,70,105,145]},
  armor:{label:'ARMOR',desc:'meer bunker HP',cost:[50,80,115,155]}
};

/* ---------- UTILS ---------- */

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function lerp(a,b,t){return a+(b-a)*t;}
function dist(ax,ay,bx,by){var dx=ax-bx,dy=ay-by;return Math.sqrt(dx*dx+dy*dy);}
function rand(a,b){return a+Math.random()*(b-a);}
function angleDelta(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a));}
function approachAngle(a,b,maxStep){return a+clamp(angleDelta(a,b),-maxStep,maxStep);}
function cssNum(v){var n=parseFloat(v);return isFinite(n)?n:0;}
function seeded(seed){var t=seed>>>0;return function(){t+=0x6D2B79F5;var r=Math.imul(t^(t>>>15),1|t);r^=r+Math.imul(r^(r>>>7),61|r);return ((r^(r>>>14))>>>0)/4294967296;};}
function hexRgb(h){h=h.replace('#','');return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};}
function rgbHex(r,g,b){function q(v){return Math.round(clamp(v,0,255)).toString(16).padStart(2,'0');}return '#'+q(r)+q(g)+q(b);}
function mixHex(a,b,t){var A=hexRgb(a),B=hexRgb(b);return rgbHex(A.r+(B.r-A.r)*t,A.g+(B.g-A.g)*t,A.b+(B.b-A.b)*t);}
function tone(h,a){return mixHex(h,a>=0?'#ffffff':'#000000',Math.abs(a));}
function pointSegDist(px,py,x1,y1,x2,y2){
  var dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy;
  if(!l2)return dist(px,py,x1,y1);
  var t=clamp(((px-x1)*dx+(py-y1)*dy)/l2,0,1);
  return dist(px,py,x1+dx*t,y1+dy*t);
}
function readSafe(){
  var cs=getComputedStyle(safeProbe);
  safeTop=cssNum(cs.paddingTop);
  safeBottom=cssNum(cs.paddingBottom);
}
function level(){return LEVELS[gameState.levelIndex];}
/* ---------- SAVE ---------- */

function defaultSave(){
  return {supply:0,bestLevel:0,upgrades:{damage:0,speed:0,burst:0,charge:0,cooling:0,he:0,armor:0}};
}
function loadSave(){
  try{
    var s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(!s||!s.upgrades)return defaultSave();
    var d=defaultSave(),keys=Object.keys(d.upgrades);
    for(var i=0;i<keys.length;i++)if(typeof s.upgrades[keys[i]]!=='number')s.upgrades[keys[i]]=0;
    if(typeof s.supply!=='number')s.supply=0;
    if(typeof s.bestLevel!=='number')s.bestLevel=0;
    return s;
  }catch(e){return defaultSave();}
}
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(gameState.save));}catch(e){}}

function playerProfile(){
  var u=gameState.save.upgrades;
  return {
    maxHp:(100+u.armor*18)*(IS_IPHONE?1.15:1),
    damage:1+u.damage*.26,
    projectileSpeed:1+u.speed*.18,
    burst:3+u.burst,
    chargeScale:1+u.charge*.18,
    cool:.25+u.cooling*.06,
    heatScale:Math.max(.54,1-u.cooling*.09),
    heRadius:20+u.he*3
  };
}

/* ---------- AUDIO ---------- */

var AudioSys={
  ctx:null,master:null,ready:false,
  unlock:function(){
    try{
      if(!this.ctx){
        var AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)return;
        this.ctx=new AC();
        this.master=this.ctx.createGain();
        this.master.gain.value=.88;
        this.master.connect(this.ctx.destination);
      }
      if(this.ctx.state==='suspended')this.ctx.resume();
      if(!this.ready){
        this.ready=true;
        var b=this.ctx.createBuffer(1,1,22050);
        var src=this.ctx.createBufferSource();
        src.buffer=b;src.connect(this.master);src.start(0);
        this.tone('prime',0);
      }
    }catch(e){}
  },
  tone:function(kind,volume){
    if(!this.ctx)return;
    try{
      if(this.ctx.state==='suspended')this.ctx.resume();
      var c=this.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();
      o.connect(g);g.connect(this.master||c.destination);
      var v=volume==null?1:volume;
      if(kind==='mg'){o.type='square';o.frequency.setValueAtTime(155,t);o.frequency.exponentialRampToValueAtTime(78,t+.055);g.gain.setValueAtTime(.058*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.065);o.start(t);o.stop(t+.07);}
      else if(kind==='he'||kind==='boom'){o.type='sawtooth';o.frequency.setValueAtTime(kind==='boom'?56:70,t);o.frequency.exponentialRampToValueAtTime(27,t+.24);g.gain.setValueAtTime((kind==='boom'?.12:.095)*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.26);o.start(t);o.stop(t+.27);}
      else if(kind==='metal'){o.type='square';o.frequency.setValueAtTime(230,t);o.frequency.exponentialRampToValueAtTime(58,t+.11);g.gain.setValueAtTime(.075*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.13);o.start(t);o.stop(t+.14);}
      else if(kind==='enemy'){o.type='triangle';o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(104,t+.045);g.gain.setValueAtTime(.022*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);o.start(t);o.stop(t+.055);}
      else if(kind==='hit'){o.type='triangle';o.frequency.setValueAtTime(270,t);o.frequency.exponentialRampToValueAtTime(145,t+.04);g.gain.setValueAtTime(.024*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.045);o.start(t);o.stop(t+.05);}
      else if(kind==='heli'){o.type='triangle';o.frequency.value=48;g.gain.setValueAtTime(.034*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.20);o.start(t);o.stop(t+.21);}
      else{o.type='sine';o.frequency.value=40;g.gain.setValueAtTime(.0001,t);o.start(t);o.stop(t+.015);}
    }catch(e){}
  }
};
document.addEventListener('touchstart',function(){AudioSys.unlock();},{passive:true});
document.addEventListener('pointerdown',function(){AudioSys.unlock();},{passive:true});

/* ---------- PALETTE / MAP ---------- */

function levelPalette(base,stage){
  var shift=stage===0?-.035:stage===1?.02:.065;
  return {
    ground:tone(base.ground,shift),
    ground2:tone(base.ground2,shift*.7),
    road:tone(base.road,shift*.45),
    roadEdge:tone(base.roadEdge,shift*.35),
    line:tone(base.line,shift*.18),
    veg:tone(base.veg,shift*.65),
    veg2:tone(base.veg2,shift*.8),
    building:tone(base.building,shift*.50),
    roof:tone(base.roof,shift*.35),
    rock:tone(base.rock,shift*.4),
    trench:tone(base.trench,shift*.25)
  };
}
function unitPalette(p){
  return [
    {body:mixHex(p.veg,p.ground,.20),light:tone(p.veg2,.20),dark:tone(p.veg,-.36),line:p.line},
    {body:mixHex(p.veg2,p.ground,.15),light:tone(p.veg2,.16),dark:tone(p.line,.04),line:p.line},
    {body:tone(mixHex(p.veg,p.road,.18),-.04),light:tone(p.veg2,.16),dark:tone(p.veg,-.31),line:p.line},
    {body:mixHex(p.building,p.veg,.38),light:tone(p.building,.10),dark:tone(p.roof,-.08),line:p.line}
  ];
}

function buildMap(){
  var L=level(),rng=seeded(L.seed+gameState.levelIndex*31);
  var p=levelPalette(BASE_PALETTES[L.theme],L.stage);
  var roadX=W*(L.stage===0?.44:L.stage===1?.57:.49);
  var bendX=roadX+(rng()-.5)*80;
  var junctionY=H*(.32+rng()*.10);
  var compound={x:W*(rng()<.5?.25:.75),y:H*(.34+rng()*.14),w:70+rng()*18,h:42+rng()*12};
  var patches=[],cover=[],decor=[],trees=[],rocks=[];
  for(var i=0;i<7;i++)patches.push({x:rng()*W,y:safeTop+80+rng()*(H-safeTop-safeBottom-210),rx:45+rng()*90,ry:22+rng()*55,rot:rng()*TAU,a:.035+rng()*.045});

  var coverKinds={
    jungle:['log','sandbag','crate','rubble','bush'],
    desert:['sandbag','crate','rubble','lowwall','scrub'],
    polar:['crate','rubble','lowwall','snowbank','sandbag'],
    village:['lowwall','crate','fence','sandbag','rubble'],
    industrial:['crate','rubble','lowwall','barrel','pipe']
  }[L.theme];
  var coverCount=IS_IPHONE?13:16,cid=1;
  for(i=0;i<coverCount;i++){
    var row=i%5,cy=safeTop+115+row*((H-safeTop-safeBottom-270)/4)+(rng()-.5)*34;
    var cx=24+rng()*(W-48);
    if(Math.abs(cx-roadX)<22)cx=clamp(cx+(cx<roadX?-1:1)*(28+rng()*24),25,W-25);
    cover.push({
      id:cid++,x:cx,y:cy,kind:coverKinds[(rng()*coverKinds.length)|0],
      len:12+rng()*22,rot:(rng()-.5)*1.15,r:5+rng()*5
    });
  }

  var treeCount=L.theme==='jungle'?12:L.theme==='village'?8:L.theme==='industrial'?4:L.theme==='desert'?5:7;
  for(i=0;i<treeCount;i++)trees.push({x:22+rng()*(W-44),y:safeTop+88+rng()*(H-safeTop-safeBottom-250),r:5+rng()*6,variant:(rng()*4)|0});
  for(i=0;i<6;i++)rocks.push({x:26+rng()*(W-52),y:safeTop+95+rng()*(H-safeTop-safeBottom-270),r:3+rng()*4,variant:(rng()*3)|0});
  var detailTypes={
    jungle:['bush','log','crate'],desert:['rubble','crate','scrub'],polar:['snow','crate','rubble'],
    village:['fence','hay','crate','bush'],industrial:['barrel','pipe','crate','rubble']
  }[L.theme];
  for(i=0;i<8;i++)decor.push({x:25+rng()*(W-50),y:safeTop+94+rng()*(H-safeTop-safeBottom-260),type:detailTypes[(rng()*detailTypes.length)|0],rot:(rng()-.5)*.8,s:.7+rng()*.55});
  gameState.map={palette:p,units:unitPalette(p),road:{x:roadX,bendX:bendX,junctionY:junctionY},compound:compound,patches:patches,cover:cover,decor:decor,trees:trees,rocks:rocks};
}
/* ---------- GAME STATE ---------- */

function freshState(){
  var sv=loadSave();
  return {
    mode:'menu',save:sv,levelIndex:0,
    time:0,levelTime:0,levelComplete:false,
    profile:null,bunker:{x:W*.5,y:H-78,hp:100,maxHp:100,angle:-Math.PI/2},
    aim:{x:W*.5,y:H*.35},pointer:{down:false,t0:0,heFired:false},
    heat:0,overheat:false,eff:.75,hitMarker:0,streak:0,streakT:0,message:'',messageT:0,shake:0,screenFlash:0,
    stats:{shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0},
    infantry:[],vehicles:[],air:[],paras:[],shots:[],enemyShots:[],effects:[],craters:[],wrecks:[],blood:[],
    events:[],eventCursor:0,burstQueue:[],map:null
  };
}
function resetLevel(){
  gameState.profile=playerProfile();
  gameState.time=0;gameState.levelTime=0;gameState.levelComplete=false;
  gameState.bunker.x=W*.5;gameState.bunker.y=H-Math.max(72,safeBottom+52);
  gameState.bunker.maxHp=gameState.profile.maxHp;gameState.bunker.hp=gameState.profile.maxHp;
  gameState.heat=0;gameState.overheat=false;gameState.eff=.75;gameState.hitMarker=0;gameState.streak=0;gameState.streakT=0;gameState.message='';gameState.messageT=0;gameState.shake=0;gameState.screenFlash=0;
  gameState.stats={shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0};
  gameState.infantry=[];gameState.vehicles=[];gameState.air=[];gameState.paras=[];gameState.shots=[];gameState.enemyShots=[];gameState.effects=[];gameState.craters=[];gameState.wrecks=[];gameState.blood=[];gameState.burstQueue=[];gameState.pointer.down=false;gameState.pointer.heFired=false;
  buildMap();
  gameState.events=buildEncounterPlan();
  gameState.eventCursor=0;
  gameState.mode='playing';
}

/* ---------- ENCOUNTER DIRECTOR ---------- */

function buildEncounterPlan(){
  var L=level(),zone=L.zone,stage=L.stage;
  var pool=[
    {type:'foot',count:3+Math.min(stage,1),weight:4.4},
    {type:'jeep',count:1,weight:1.55},
    {type:'lighttruck',count:1,weight:1.35},
    {type:'truck',count:1,weight:1.25},
    {type:'halftrack',count:1,weight:stage===0?.95:1.35},
    {type:'heli',count:2+Math.min(zone,1),weight:.70},
    {type:'plane',count:2+Math.min(zone,1),weight:.50}
  ];
  var n=8+stage+Math.min(1,zone),events=[],time=.48,lastType='';
  for(var i=0;i<n;i++){
    var total=0,j;for(j=0;j<pool.length;j++)total+=pool[j].weight;
    var r=Math.random()*total,pick=pool[0];
    for(j=0;j<pool.length;j++){r-=pool[j].weight;if(r<=0){pick=pool[j];break;}}
    if(pick.type===lastType&&pick.type!=='foot'&&Math.random()<.85)pick=pool[0];
    var motor=pick.type==='jeep'||pick.type==='lighttruck'||pick.type==='truck'||pick.type==='halftrack';
    var gap=(motor?2.05+Math.random()*1.35:1.20+Math.random()*1.05)*DEVICE.spawnGap;
    if(Math.random()<.24)gap+=.55+Math.random()*.80;
    time+=gap;events.push({t:time,type:pick.type,count:pick.count});lastType=pick.type;
  }
  return events;
}
function processEvents(){
  while(gameState.eventCursor<gameState.events.length&&gameState.levelTime>=gameState.events[gameState.eventCursor].t){
    var e=gameState.events[gameState.eventCursor];
    var motor=e.type==='jeep'||e.type==='lighttruck'||e.type==='truck'||e.type==='halftrack';
    if(motor){
      var liveMotor=0;
      for(var v=0;v<gameState.vehicles.length;v++)if(gameState.vehicles[v].alive)liveMotor++;
      if(liveMotor>=2){e.t+=.65;break;}
    }
    gameState.eventCursor++;
    if(e.type==='foot')spawnFoot(e.count);
    else if(e.type==='heli')spawnHeli(e.count);
    else if(e.type==='plane')spawnPlane(e.count);
    else spawnVehicle(e.type,e.count);
  }
}
function processEvents(){
  while(gameState.eventCursor<gameState.events.length&&gameState.levelTime>=gameState.events[gameState.eventCursor].t){
    var e=gameState.events[gameState.eventCursor++];
    if(e.type==='foot')spawnFoot(e.count);
    else if(e.type==='heli')spawnHeli(e.count);
    else if(e.type==='plane')spawnPlane(e.count);
    else spawnVehicle(e.type,e.count);
  }
}

/* ---------- SPAWN ---------- */

function laneX(offset){return clamp(gameState.map.road.x+offset,28,W-28);}
var squadSerial=1;
function newSquadTactic(){
  var list=['flankLeft','flankRight','bound','support','split'];
  return list[(Math.random()*list.length)|0];
}
function squadPlan(n,tactic,originX){
  return {id:squadSerial++,tactic:tactic||newSquadTactic(),size:n,originX:originX==null?gameState.map.road.x:originX,phase:Math.random()*TAU};
}
function tacticalPoint(e){
  var tx=gameState.bunker.x,ty=gameState.bunker.y;
  if(e.tactic==='flankLeft'&&e.y<H*.62){tx=W*.16;ty=H*.60;}
  else if(e.tactic==='flankRight'&&e.y<H*.62){tx=W*.84;ty=H*.60;}
  else if(e.tactic==='split'&&e.y<H*.58){tx=e.slot%2?W*.74:W*.26;ty=H*.57;}
  else if(e.tactic==='bound'&&e.y<H*.60){tx=clamp(gameState.bunker.x+(e.slot%2?65:-65),35,W-35);ty=H*.60;}
  else if(e.tactic==='roadside'&&e.y<H*.58){tx=clamp(e.flankX,35,W-35);ty=H*.58;}
  return {x:tx,y:ty};
}
function squadIsMoving(e){
  if(e.tactic!=='bound')return true;
  var phase=Math.floor((gameState.time+e.squadPhase)/1.55)%2;
  return (e.slot%2)===phase;
}
function spawnInfantry(x,y,role,squad){
  role=role||['rifle','rifle','lmg','grenadier','marksman'][(Math.random()*5)|0];
  var hp=role==='lmg'?46:role==='grenadier'?42:role==='marksman'?36:38;
  var speed=role==='lmg'?20:role==='grenadier'?19:role==='marksman'?20:21;
  var id=Math.random()*1e9|0;
  squad=squad||squadPlan(1,'direct',x);
  var roll=Math.random(),firePose=role==='marksman'?'prone':role==='lmg'?(roll<.82?'crouch':'stand'):(roll<.68?'stand':'crouch');
  var e={
    id:id,role:role,x:x==null?laneX(rand(-95,95)):x,y:y==null?safeTop+72-rand(0,35):y,
    hp:hp,maxHp:hp,speed:speed+gameState.levelIndex*.30,alive:true,
    state:'advance',stateT:0,fireCd:rand(.64,1.36),muzzle:0,recoil:0,
    anim:Math.random()*10,anim2:Math.random()*10,angle:Math.PI/2,cover:null,lastCoverId:0,suppression:0,deadT:0,
    variant:Math.abs(id)%12,firePose:firePose,lastX:x||0,lastY:y||0,stuckT:0,
    squadId:squad.id,tactic:squad.tactic,slot:squad.slot||0,squadPhase:squad.phase||0,
    flankX:squad.flankX==null?(x||gameState.map.road.x):squad.flankX,
    decisionT:rand(.8,1.7),burstCount:0,lean:rand(-.08,.08),crawlPhase:Math.random()*TAU,
    aggressive:squad.aggressive||0,burnT:0,bleedT:0,bleedCd:0,limp:0,dismounted:!!squad.dismounted
  };
  gameState.infantry.push(e);
  e.cover=nextForwardCover(e);
  return e;
}
function spawnFoot(n){
  var tactic=newSquadTactic(),origin=laneX(rand(-80,80)),sq=squadPlan(n,tactic,origin),roles=n>=3?['rifle','lmg','grenadier']:['rifle','rifle'];
  if(level().zone>=2&&Math.random()<.45)roles[roles.length-1]='marksman';
  for(var i=0;i<n;i++){
    var member={id:sq.id,tactic:sq.tactic,size:n,originX:origin,phase:sq.phase,slot:i,flankX:clamp(origin+(i-(n-1)/2)*26,30,W-30)};
    spawnInfantry(origin+(i-(n-1)/2)*17,safeTop+70-rand(0,34),roles[i%roles.length],member);
  }
}
function vehicleCapacity(type){
  if(type==='halftrack')return Math.floor(rand(8,11));
  if(type==='truck')return Math.floor(rand(8,11));
  if(type==='lighttruck')return Math.floor(rand(5,7));
  return Math.floor(rand(2,4));
}
function applyTrauma(e,mode){
  if(mode==='burn'){e.burnT=rand(2.1,3.8);e.bleedT=rand(3,6);e.limp=rand(.28,.55);e.hp*=.72;}
  else if(mode==='bleed'){e.bleedT=rand(5,9);e.limp=rand(.40,.68);e.hp*=.82;}
  else if(mode==='limp'){e.bleedT=rand(2,5);e.limp=rand(.52,.76);e.hp*=.9;}
  e.hp=Math.max(8,e.hp);
}
function dismountOne(v,mode,index){
  var a=v.bodyAngle==null?Math.PI/2:v.bodyAngle,side=(index%2?1:-1),row=Math.floor(index/2);
  var lateral=side*(10+row*2.2),rear=8+row*3.0;
  var px=v.x+Math.cos(a+Math.PI/2)*lateral-Math.cos(a)*rear;
  var py=v.y+Math.sin(a+Math.PI/2)*lateral-Math.sin(a)*rear;
  var sq={id:squadSerial++,tactic:index%3===0?'flankLeft':index%3===1?'flankRight':'bound',size:1,originX:px,phase:Math.random()*TAU,slot:index,flankX:clamp(px+side*28,28,W-28),aggressive:1,dismounted:true};
  var role=index%6===1?'lmg':index%7===3?'grenadier':'rifle';
  var e=spawnInfantry(px,py,role,sq);e.aggressive=1;e.cover=nextForwardCover(e);
  applyTrauma(e,mode||'normal');
  return e;
}
function dismountDestroyed(v,kind){
  var n=v.passengers||0;if(n<=0)return;
  var survival=kind==='he'?(v.type==='halftrack'?.54:.48):(v.type==='halftrack'?.78:.86);
  for(var i=0;i<n;i++){
    if(Math.random()<survival){
      var roll=Math.random(),mode='normal';
      if(kind==='he')mode=roll<.27?'burn':roll<.60?'bleed':roll<.76?'limp':'normal';
      else mode=roll<.14?'bleed':roll<.26?'limp':'normal';
      dismountOne(v,mode,i);
    }else{
      var a=v.bodyAngle||Math.PI/2,side=i%2?1:-1;
      var gx=v.x+Math.cos(a+Math.PI/2)*side*rand(5,16)-Math.cos(a)*rand(2,18);
      var gy=v.y+Math.sin(a+Math.PI/2)*side*rand(5,16)-Math.sin(a)*rand(2,18);
      addBlood(gx,gy,kind==='he'?13:7,kind==='he');
    }
  }
  v.passengers=0;v.unloadLeft=0;
}
function spawnVehicle(type,count){
  var id=Math.random()*1e9|0,cap=vehicleCapacity(type);
  var hp=type==='jeep'?78:type==='lighttruck'?122:type==='truck'?168:235;
  var sp=type==='jeep'?46:type==='lighttruck'?39:type==='truck'?33:28;
  var accel=type==='jeep'?36:type==='lighttruck'?28:type==='truck'?22:16;
  var turn=type==='jeep'?2.25:type==='lighttruck'?1.80:type==='truck'?1.48:1.18;
  var roadX=gameState.map.road.x,side=Math.random()<.5?-1:1;
  var shoulder=clamp(roadX+side*(type==='halftrack'?rand(50,72):rand(38,60)),28,W-28);
  var x=roadX+rand(-7,7),aim=Math.atan2(gameState.bunker.y-(safeTop+48),gameState.bunker.x-x);
  var dismountRun=type==='halftrack'&&Math.random()<.56;
  var hasMG=true;
  gameState.vehicles.push({
    id:id,type:type,x:x,baseX:x,y:safeTop+48,hp:hp,maxHp:hp,speed:sp,currentSpeed:sp*.34,accel:accel,turnRate:turn,
    alive:true,state:'road',behavior:dismountRun?'dismount':'firepass',
    contactY:H*rand(.30,.47),dropY:H*rand(.40,.54),shoulderX:shoulder,
    passengers:cap,unloadLeft:dismountRun?cap:0,unloadIndex:0,unloadCd:0,dropped:false,stopT:0,stopBursts:Math.floor(rand(2,4)),
    bodyAngle:Math.PI/2,turretAngle:aim+rand(-.35,.35),turretVel:0,turretRecoil:0,turretAimT:rand(.20,.65),
    fireCd:rand(.42,.90),mgBurst:0,hasMG:hasMG,smoke:0,dustCd:0,damageFxCd:0,hitFlash:0,
    zigAmp:type==='halftrack'?rand(7,14):type==='jeep'?rand(4,10):rand(3,7),
    zigFreq:type==='halftrack'?rand(.36,.56):type==='jeep'?rand(.52,.76):rand(.38,.62),
    zigPhase:rand(0,TAU),zigT:0,wheelT:Math.random()*10
  });
}
function spawnHeli(n){
  var fromLeft=Math.random()<.5;
  gameState.air.push({
    id:Math.random()*1e9|0,type:'heli',x:fromLeft?-100:W+100,y:H*rand(.25,.38),
    targetX:W*rand(.28,.72),targetY:H*rand(.30,.44),vx:fromLeft?125:-125,
    hp:120,alive:true,phase:'in',t:0,dropCount:n||2,dropped:false,rotor:0
  });
  gameState.message='HELICOPTER INSERTION';gameState.messageT=.65;
}
function spawnPlane(n){
  var fromLeft=Math.random()<.5;
  gameState.air.push({
    id:Math.random()*1e9|0,type:'plane',x:fromLeft?-140:W+140,y:safeTop+110+rand(-20,35),
    vx:fromLeft?175:-175,hp:175,alive:true,phase:'cross',t:0,dropCount:n||3,dropped:0,fromLeft:fromLeft
  });
  gameState.message='AIRBORNE CONTACT';gameState.messageT=.65;
}
function spawnPara(x,y){
  gameState.paras.push({id:Math.random()*1e9|0,x:x,baseX:x,y:y,landingY:H*rand(.43,.62),vy:32+rand(-2,4),phase:rand(0,TAU),hp:22,alive:true});
}

/* ---------- EFFECTS ---------- */

function pushEffect(e){
  gameState.effects.push(e);
  if(gameState.effects.length>DEVICE.maxEffects)gameState.effects.splice(0,gameState.effects.length-DEVICE.maxEffects);
}
function addBlood(x,y,n,big){
  var count=Math.min(Math.round(n*1.45),IS_IPHONE?16:24);
  for(var i=0;i<count;i++){
    var a=rand(0,TAU),sp=rand(big?18:10,big?55:38);
    pushEffect({
      type:'blood',
      x:x+rand(-4,4),y:y+rand(-4,4),
      vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-rand(3,18),
      r:rand(big?1.5:1.1,big?3.0:2.3),
      t:0,life:rand(.46,.82),
      shade:(Math.random()*3)|0
    });
  }
  gameState.blood.push({
    x:x+rand(-4,4),y:y+rand(-4,4),
    r:big?rand(8,12):rand(4,7),
    rot:rand(0,TAU),shade:(Math.random()*3)|0,
    lobes:big?4:3
  });
  if(big&&Math.random()<.55){
    gameState.blood.push({
      x:x+rand(-9,9),y:y+rand(-7,7),
      r:rand(3,6),rot:rand(0,TAU),shade:(Math.random()*3)|0,lobes:2
    });
  }
  while(gameState.blood.length>DEVICE.maxBlood)gameState.blood.shift();
}
function explode(x,y,r,crater){
  pushEffect({type:'explosion',x:x,y:y,r:r,t:0,life:.48,variant:(Math.random()*3)|0,seed:Math.random()*999});
  for(var i=0;i<(IS_IPHONE?4:7);i++)pushEffect({type:'spark',x:x,y:y,vx:rand(-70,70),vy:rand(-80,30),t:0,life:rand(.18,.38)});
  emitSmoke(x,y,true);emitFlame(x,y,r>22);emitDebris(x,y,IS_IPHONE?3:6);
  if(crater!==false&&Math.random()<.46){
    gameState.craters.push({x:x+rand(-2,2),y:y+rand(-2,2),r:clamp(r*rand(.25,.36),4,10),seed:Math.random()*9999|0,rot:rand(0,TAU)});
    if(gameState.craters.length>12)gameState.craters.shift();
  }
  gameState.shake=Math.max(gameState.shake||0,clamp(r*.18,2,7));gameState.screenFlash=Math.max(gameState.screenFlash||0,clamp(r/90,.05,.22));
  AudioSys.tone('boom');
}
function emitSmoke(x,y,heavy){
  pushEffect({type:'smoke',x:x+rand(-4,4),y:y+rand(-4,4),vx:rand(-7,7),vy:rand(-18,-9),r:heavy?rand(5,8):rand(3,5),t:0,life:heavy?rand(.8,1.25):rand(.55,.9),shade:Math.random()});
}
function emitFlame(x,y,large){
  pushEffect({type:'flame',x:x+rand(-4,4),y:y+rand(-4,4),vx:rand(-5,5),vy:rand(-15,-7),r:large?rand(5,8):rand(3,5),t:0,life:rand(.22,.42),shade:Math.random()});
  if(Math.random()<.55)pushEffect({type:'ember',x:x+rand(-3,3),y:y+rand(-3,3),vx:rand(-18,18),vy:rand(-35,-12),t:0,life:rand(.25,.55)});
}
function emitMuzzle(x,y,angle,big){
  pushEffect({type:'muzzle',x:x,y:y,angle:angle,r:big?11:7,t:0,life:big?.12:.08});
  pushEffect({type:'smoke',x:x,y:y,vx:Math.cos(angle)*rand(8,18)+rand(-3,3),vy:Math.sin(angle)*rand(8,18)+rand(-3,3),r:big?4:2.7,t:0,life:rand(.35,.6),shade:.2});
}
function emitDebris(x,y,n){
  for(var i=0;i<n;i++)pushEffect({type:'debris',x:x,y:y,vx:rand(-75,75),vy:rand(-85,35),rot:rand(0,TAU),vr:rand(-8,8),size:rand(1.5,3.8),t:0,life:rand(.35,.75)});
}
function vehicleHitFx(v,kind){
  pushEffect({type:'impactFlash',x:v.x,y:v.y,r:kind==='he'?16:8,t:0,life:kind==='he'?.16:.08});
  if(kind==='mg'){
    for(var i=0;i<(IS_IPHONE?3:5);i++)pushEffect({type:'spark',x:v.x+rand(-7,7),y:v.y+rand(-7,7),vx:rand(-72,72),vy:rand(-75,24),t:0,life:rand(.13,.30)});
    if(Math.random()<.30)emitSmoke(v.x,v.y,false);
    AudioSys.tone('metal',.48);return;
  }
  if(kind!=='he')return;
  pushEffect({type:'fireball',x:v.x+rand(-5,5),y:v.y+rand(-5,5),r:24,t:0,life:.50,variant:(Math.random()*3)|0,seed:Math.random()*1000});
  for(var j=0;j<(IS_IPHONE?6:10);j++)pushEffect({type:'spark',x:v.x+rand(-7,7),y:v.y+rand(-7,7),vx:rand(-105,105),vy:rand(-110,36),t:0,life:rand(.18,.44)});
  emitSmoke(v.x,v.y,true);emitFlame(v.x,v.y,true);emitDebris(v.x,v.y,IS_IPHONE?5:9);AudioSys.tone('metal');
}
function hitFeedback(x,y,dmg){
  gameState.hitMarker=.13;
  pushEffect({type:'damage',x:x,y:y-8,text:String(Math.max(1,Math.round(dmg))),t:0,life:.52});
}
function addStreak(){
  gameState.streak++;gameState.streakT=2.5;
  if(gameState.streak===5||gameState.streak===10){gameState.eff=clamp(gameState.eff+.025,0,1);gameState.message='STREAK '+gameState.streak;gameState.messageT=.5;}
}

/* ---------- DAMAGE ---------- */

function killInfantry(e,kind){
  if(!e.alive)return;
  e.alive=false;e.deadT=0;e.state='dead';
  gameState.stats.kills++;gameState.eff=clamp(gameState.eff+.020,0,1);addStreak();
  addBlood(e.x,e.y,kind==='he'?18:8,kind==='he');AudioSys.tone('hit',.75);
}
function damageInfantry(e,dmg,kind){
  if(!e.alive)return false;
  if(kind==='mg'&&(e.state==='cover'||e.state==='crouch'))dmg*=.76;
  e.hp-=dmg;hitFeedback(e.x,e.y,dmg);
  if(kind==='mg'&&e.hp<e.maxHp*.55&&Math.random()<.25){e.bleedT=Math.max(e.bleedT,rand(3,6));if(Math.random()<.45)e.limp=Math.max(e.limp,rand(.25,.5));}
  if(e.hp<=0){killInfantry(e,kind);return true;}
  addBlood(e.x,e.y,kind==='he'?7:3,false);return false;
}
function emitVehicleFragments(v,kind){
  var parts=v.type==='halftrack'?['track','track','panel','panel','wheel','door']:v.type==='jeep'?['wheel','wheel','door','panel']:['wheel','wheel','panel','panel','door'];
  var count=kind==='he'?parts.length:Math.max(3,parts.length-1);
  for(var i=0;i<count;i++){
    var a=rand(0,TAU),sp=rand(kind==='he'?48:30,kind==='he'?105:72);
    pushEffect({
      type:'vehiclePart',part:parts[i%parts.length],x:v.x+rand(-7,7),y:v.y+rand(-7,7),
      vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-rand(18,55),rot:rand(0,TAU),vr:rand(-10,10),
      t:0,life:rand(1.0,1.75),scale:rand(.85,1.18)
    });
  }
}
function damageVehicle(v,dmg,kind){
  if(!v.alive)return false;
  var mgMult=v.type==='jeep'?1.0:v.type==='lighttruck'?.82:v.type==='truck'?.64:.24;
  var dealt=dmg*(kind==='mg'?mgMult:1);
  v.hp-=dealt;v.hitFlash=.10;hitFeedback(v.x,v.y,dealt);vehicleHitFx(v,kind);
  if(v.hp<=0){
    dismountDestroyed(v,kind);
    emitVehicleFragments(v,kind);
    v.alive=false;gameState.stats.vehicleKills++;gameState.eff=clamp(gameState.eff+.025,0,1);addStreak();
    gameState.wrecks.push({
      type:v.type,x:v.x,y:v.y,bodyAngle:v.bodyAngle,variant:v.id%4,
      burnT:rand(kind==='he'?10:7,kind==='he'?17:12),smokeCd:0,flameCd:0
    });
    if(gameState.wrecks.length>16)gameState.wrecks.shift();
    explode(v.x,v.y,kind==='he'?27:22,true);return true;
  }
  v.smoke=.55;return false;
}
function damageAir(a,dmg){
  if(!a.alive)return false;
  a.hp-=dmg;hitFeedback(a.x,a.y,dmg);
  if(a.hp<=0){a.alive=false;gameState.stats.airKills++;gameState.eff=clamp(gameState.eff+.035,0,1);addStreak();explode(a.x,a.y,25,false);return true;}
  return false;
}
function damageBunker(dmg){
  var real=dmg*(1-gameState.save.upgrades.armor*.05);
  gameState.bunker.hp-=real;gameState.stats.damageTaken+=real;gameState.eff=clamp(gameState.eff-.0052*real,0,1);
  pushEffect({type:'hit',x:gameState.bunker.x+rand(-18,18),y:gameState.bunker.y+rand(-10,10),t:0,life:.28});
  if(gameState.bunker.hp<=0)endGame('BUNKER LOST');
}

/* ---------- ENEMY AI ---------- */

function nearestCover(e){
  var best=null,bestD=9999;
  for(var i=0;i<gameState.map.cover.length;i++){
    var c=gameState.map.cover[i],d=dist(e.x,e.y,c.x,c.y);
    if(c.id!==e.lastCoverId&&d<bestD&&d<125){best=c;bestD=d;}
  }
  return best;
}
function nextForwardCover(e){
  if(!gameState||!gameState.map||!gameState.map.cover||e.y>gameState.bunker.y-115)return null;
  var tactical=tacticalPoint(e),best=null,bestScore=1e9;
  for(var i=0;i<gameState.map.cover.length;i++){
    var c=gameState.map.cover[i];if(c.id===e.lastCoverId)continue;
    var dy=c.y-e.y;if(dy<12||dy>175)continue;
    var d=dist(e.x,e.y,c.x,c.y);if(d>190)continue;
    var score=d+Math.abs(c.x-tactical.x)*.34-dy*.18;
    if(score<bestScore){best=c;bestScore=score;}
  }
  return best||nearestCover(e);
}
function enemyFire(e){
  var dx=gameState.bunker.x-e.x,dy=gameState.bunker.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;
  var kind=e.role==='grenadier'?'grenade':e.role==='lmg'?'lmg':e.role==='marksman'?'marksman':'rifle';
  var speed=kind==='grenade'?145:kind==='marksman'?385:305;
  var dmg=(kind==='grenade'?7.4:kind==='lmg'?2.65:kind==='marksman'?4.1:2.0)*DEVICE.enemyDamage;
  var mx=e.x+Math.cos(e.angle)*10,my=e.y+Math.sin(e.angle)*10;
  gameState.enemyShots.push({x:mx,y:my,px:mx,py:my,vx:dx/d*speed,vy:dy/d*speed,kind:kind,dmg:dmg,life:kind==='grenade'?2.4:1.5});
  e.muzzle=.09;e.recoil=1;emitMuzzle(mx,my,e.angle,false);AudioSys.tone('enemy',.55);
}
function updateInfantry(dt){
  for(var i=0;i<gameState.infantry.length;i++){
    var e=gameState.infantry[i];
    e.anim+=dt*(e.state==='advance'?4.1:e.state==='crawl'?3.0:1.7);e.anim2+=dt*(2.1+(e.variant%3)*.22);e.crawlPhase+=dt*3.2;
    e.stateT+=dt;e.decisionT-=dt;e.muzzle=Math.max(0,e.muzzle-dt);e.recoil=Math.max(0,e.recoil-dt*8);e.suppression=Math.max(0,e.suppression-dt*.18);
    if(!e.alive){e.deadT+=dt;continue;}

    e.bleedCd-=dt;
    if(e.burnT>0){
      e.burnT-=dt;e.hp-=1.7*dt;
      if(e.bleedCd<=0){e.bleedCd=.16;emitFlame(e.x+rand(-2,2),e.y+rand(-3,3),false);if(Math.random()<.42)emitSmoke(e.x,e.y,false);}
      if(e.hp<=0){killInfantry(e,'he');continue;}
    }else if(e.bleedT>0){
      e.bleedT-=dt;
      if(e.bleedCd<=0){e.bleedCd=rand(.28,.48);addBlood(e.x+rand(-2,2),e.y+rand(-2,2),1,false);}
    }

    var moved=dist(e.x,e.y,e.lastX||e.x,e.lastY||e.y);e.stuckT=moved<.08?e.stuckT+dt:0;e.lastX=e.x;e.lastY=e.y;
    var tactical=tacticalPoint(e),bdx=gameState.bunker.x-e.x,bdy=gameState.bunker.y-e.y,dB=Math.sqrt(bdx*bdx+bdy*bdy)||1;e.angle=Math.atan2(bdy,bdx);

    if(e.suppression>.70&&e.state!=='suppressed'&&e.state!=='crawl'){e.state='suppressed';e.stateT=0;e.cover=nearestCover(e)||nextForwardCover(e);}
    if(e.stuckT>2.5){e.state='advance';e.cover=nextForwardCover(e);e.stuckT=0;e.flankX=clamp(e.flankX+rand(-35,35),35,W-35);}

    var supportRole=e.role==='marksman'||e.role==='lmg';
    var preferred=(e.role==='marksman'?240:e.role==='lmg'?210:e.role==='grenadier'?188:164)-(e.aggressive?22:0);

    if(e.state==='advance'){
      if(!e.cover)e.cover=nextForwardCover(e);
      var mt=e.cover||tactical,dx=mt.x-e.x,dy=mt.y-e.y,dTarget=Math.sqrt(dx*dx+dy*dy)||1;
      if(e.cover&&dTarget<10){e.state='cover';e.stateT=0;e.coverT=e.aggressive?rand(.45,.85):rand(.85,1.45);}
      else if(!e.cover&&dB<preferred){e.state='fire';e.stateT=0;}
      else{
        var sp=e.speed*DEVICE.enemySpeed*(1-e.suppression*.38)*(e.limp>0?(1-e.limp*.43):1);
        if(e.tactic==='flankLeft'||e.tactic==='flankRight'||e.tactic==='split')sp*=.95;
        e.x+=dx/dTarget*sp*dt;e.y+=dy/dTarget*sp*dt;
      }
    }else if(e.state==='covering'){
      e.fireCd-=dt;if(e.fireCd<=0&&dB<300){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.45:rand(.84,1.22);}
      if(e.stateT>(e.aggressive?1.25:1.9)){e.state='advance';e.stateT=0;e.cover=nextForwardCover(e);}
    }else if(e.state==='cover'){
      e.fireCd-=dt;if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.44:e.role==='marksman'?1.25:rand(.80,1.20);}
      if(e.stateT>e.coverT){e.lastCoverId=e.cover?e.cover.id:0;e.cover=nextForwardCover(e);e.state='advance';e.stateT=0;}
    }else if(e.state==='suppressed'){
      if(e.cover){var cdx=e.cover.x-e.x,cdy=e.cover.y-e.y,cd=Math.sqrt(cdx*cdx+cdy*cdy)||1;e.x+=cdx/cd*e.speed*.40*dt;e.y+=cdy/cd*e.speed*.40*dt;e.state='crawl';e.stateT=0;}
      else if(e.stateT>.75){e.cover=nextForwardCover(e);e.state='crawl';e.stateT=0;}
    }else if(e.state==='crawl'){
      var ct=e.cover||tactical,cdx2=ct.x-e.x,cdy2=ct.y-e.y,cd2=Math.sqrt(cdx2*cdx2+cdy2*cdy2)||1;
      e.x+=cdx2/cd2*e.speed*.32*dt;e.y+=cdy2/cd2*e.speed*.32*dt;
      if((e.cover&&cd2<10)||e.stateT>1.5){e.state=e.cover?'cover':'advance';e.stateT=0;if(e.cover)e.coverT=rand(.55,1.0);}
    }else if(e.state==='fire'){
      e.fireCd-=dt;if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.40:e.role==='grenadier'?1.48:e.role==='marksman'?1.30:rand(.80,1.18);}
      if(e.decisionT<=0){e.decisionT=rand(.8,1.5);if(e.burstCount>=2&&Math.random()<(e.aggressive?.72:.50)){e.burstCount=0;e.cover=nextForwardCover(e);e.state='advance';e.stateT=0;}}
      if(dB>preferred+75){e.cover=nextForwardCover(e);e.state='advance';e.stateT=0;}
    }
  }
  gameState.infantry=gameState.infantry.filter(function(e){return e.alive||e.deadT<7;});
}
function updateVehicleTurret(v,dt){
  if(!v.hasMG)return {error:0,settled:true};
  v.turretRecoil=Math.max(0,(v.turretRecoil||0)-dt*5);
  v.turretAimT=(v.turretAimT||0)-dt;
  var targetAngle=Math.atan2(gameState.bunker.y-v.y,gameState.bunker.x-v.x);
  if(v.turretAimT<=0){v.turretAimT=rand(.16,.35);v.turretTarget=targetAngle+rand(-.04,.04);}
  var target=v.turretTarget==null?targetAngle:v.turretTarget,err=angleDelta(v.turretAngle,target);
  var maxSpeed=v.type==='halftrack'?1.65:2.2,accel=v.type==='halftrack'?3.2:4.0;
  var desiredVel=clamp(err*3,-maxSpeed,maxSpeed);v.turretVel+=clamp(desiredVel-v.turretVel,-accel*dt,accel*dt);
  if(Math.abs(err)<.02)v.turretVel*=Math.pow(.12,dt);v.turretAngle+=v.turretVel*dt;
  return {error:Math.abs(angleDelta(v.turretAngle,targetAngle)),settled:Math.abs(v.turretVel)<.42};
}
function vehicleMuzzle(v){
  var len=v.type==='halftrack'?20:15,recoil=(v.turretRecoil||0)*3;
  return {x:v.x+Math.cos(v.turretAngle)*(len-recoil),y:v.y+Math.sin(v.turretAngle)*(len-recoil)};
}
function updateVehicleDamageParticles(v,dt){
  v.damageFxCd=(v.damageFxCd||0)-dt;var ratio=v.hp/v.maxHp;
  if(ratio<.68&&v.damageFxCd<=0){v.damageFxCd=ratio<.32?rand(.08,.15):rand(.18,.30);emitSmoke(v.x+rand(-5,5),v.y+rand(-5,5),ratio<.38);if(ratio<.38&&Math.random()<.62)emitFlame(v.x+rand(-5,5),v.y+rand(-5,5),ratio<.20);}
}
function vehicleMG(v,ts){
  if(!v.hasMG)return;
  v.fireCd-=gameState.dtForVehicle||0;
  if(v.fireCd>0||ts.error>.13)return;
  var m=vehicleMuzzle(v),a=v.turretAngle+rand(-.035,.035),speed=350;
  var vd=v.type==='halftrack'?1.65:v.type==='truck'?1.35:v.type==='lighttruck'?1.25:1.15;
  gameState.enemyShots.push({x:m.x,y:m.y,px:m.x,py:m.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,kind:'vehicleMG',dmg:vd*DEVICE.enemyDamage,life:1.7});
  v.turretRecoil=1;emitMuzzle(m.x,m.y,v.turretAngle,false);
  pushEffect({type:'casing',x:m.x,y:m.y,vx:Math.cos(v.turretAngle+Math.PI/2)*rand(28,48),vy:Math.sin(v.turretAngle+Math.PI/2)*rand(28,48),rot:rand(0,TAU),vr:rand(-13,13),t:0,life:rand(.28,.50)});
  if(Math.random()<.55)pushEffect({type:'gunSpark',x:m.x,y:m.y,vx:Math.cos(a)*rand(55,95),vy:Math.sin(a)*rand(55,95),t:0,life:.12});
  AudioSys.tone('enemy',.52);
  v.mgBurst=(v.mgBurst||0)+1;
  if(v.mgBurst>=4){
    v.mgBurst=0;
    if(v.state==='firestop'||v.state==='support')v.stopBursts=Math.max(0,(v.stopBursts||0)-1);
    v.fireCd=rand(.66,1.02);
  }else v.fireCd=rand(.14,.22);
}
function unloadStep(v){
  if(v.unloadLeft<=0)return;
  dismountOne(v,'normal',v.unloadIndex++);v.unloadLeft--;v.passengers=v.unloadLeft;v.unloadCd=rand(.09,.15);
}
function approachValue(v,target,maxDelta){
  if(v<target)return Math.min(target,v+maxDelta);
  if(v>target)return Math.max(target,v-maxDelta);
  return v;
}
function approachValue(v,target,maxDelta){
  if(v<target)return Math.min(target,v+maxDelta);
  if(v>target)return Math.max(target,v-maxDelta);
  return v;
}
function updateVehicles(dt){
  gameState.dtForVehicle=dt;
  for(var i=0;i<gameState.vehicles.length;i++){
    var v=gameState.vehicles[i];if(!v.alive)continue;
    v.smoke=Math.max(0,v.smoke-dt);v.dustCd-=dt;v.unloadCd-=dt;v.hitFlash=Math.max(0,(v.hitFlash||0)-dt);
    if(v.zigT!=null)v.zigT+=dt;v.wheelT+=dt*Math.max(1,v.currentSpeed*.16);updateVehicleDamageParticles(v,dt);
    var turretState=updateVehicleTurret(v,dt);

    if(v.state==='road'){
      v.currentSpeed=approachValue(v.currentSpeed,v.speed,v.accel*dt);
      var targetX=gameState.map.road.x+Math.sin(v.zigT*v.zigFreq+v.zigPhase)*v.zigAmp;
      var sideVel=clamp((targetX-v.x)*.50,-v.currentSpeed*.20,v.currentSpeed*.20);
      v.x+=sideVel*dt;v.y+=v.currentSpeed*DEVICE.enemySpeed*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(v.currentSpeed,sideVel||.001),dt*v.turnRate);
      if(v.y>=v.contactY){v.state='approachStop';v.stopT=rand(.30,.48);}
    }else if(v.state==='approachStop'){
      v.currentSpeed=approachValue(v.currentSpeed,0,v.accel*1.45*dt);
      v.y+=v.currentSpeed*.35*dt;v.stopT-=dt;
      if(v.stopT<=0&&v.currentSpeed<4){v.state='firestop';v.currentSpeed=0;v.stopBursts=Math.floor(rand(2,4));v.fireCd=.05;}
    }else if(v.state==='firestop'){
      vehicleMG(v,turretState);
      if(v.stopBursts<=0&&v.fireCd<.25){
        if(v.behavior==='dismount'){v.state='toShoulder';}
        else{v.state='depart';}
      }
    }else if(v.state==='toShoulder'){
      v.currentSpeed=approachValue(v.currentSpeed,v.speed*.38,v.accel*dt);
      var dx=v.shoulderX-v.x,step=Math.sign(dx)*Math.min(Math.abs(dx),v.currentSpeed*.68*dt);
      v.x+=step;v.y+=v.currentSpeed*.06*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(v.currentSpeed*.06,step/dt||.001),dt*v.turnRate);
      if(Math.abs(dx)<2){v.state='unload';v.stopT=2.25;v.unloadCd=.05;v.currentSpeed=0;v.stopBursts=2;}
    }else if(v.state==='unload'){
      vehicleMG(v,turretState);
      v.stopT-=dt;if(v.unloadLeft>0&&v.unloadCd<=0)unloadStep(v);
      if(v.unloadLeft<=0&&v.stopT<=0){v.state='support';v.stopBursts=2;v.fireCd=.10;}
    }else if(v.state==='support'){
      vehicleMG(v,turretState);
      if(v.stopBursts<=0&&v.fireCd<.25)v.state='depart';
    }else if(v.state==='depart'){
      v.currentSpeed=approachValue(v.currentSpeed,v.speed*.84,v.accel*.72*dt);
      v.y+=v.currentSpeed*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.PI/2,dt*v.turnRate*.66);
      if(v.y>H+75)v.alive=false;
    }

    if(v.dustCd<=0&&v.currentSpeed>6&&v.state!=='firestop'&&v.state!=='unload'&&v.state!=='support'){
      v.dustCd=v.type==='halftrack'?.18:.24;
      pushEffect({type:'dust',x:v.x+rand(-8,8),y:v.y+14,r:rand(v.type==='halftrack'?4:3,v.type==='halftrack'?7:5),t:0,life:.60});
    }
  }
  delete gameState.dtForVehicle;
  gameState.vehicles=gameState.vehicles.filter(function(v){return v.alive;});
}
function updateAir(dt){
  for(var i=0;i<gameState.air.length;i++){
    var a=gameState.air[i];a.t+=dt;
    if(!a.alive){a.y+=85*dt;a.x+=(a.vx||0)*.25*dt;continue;}
    if(a.type==='heli'){
      a.rotor+=dt*16;
      if(a.phase==='in'){
        var dx=a.targetX-a.x,dy=a.targetY-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;
        a.x+=dx/d*125*dt;a.y+=dy/d*125*dt;
        if(d<9){a.phase='hover';a.t=0;}
      }else if(a.phase==='hover'){
        if(!a.dropped&&a.t>.42){a.dropped=true;pushEffect({type:'rope',x:a.x,y:a.y+8,t:0,life:.75});for(var k=0;k<a.dropCount;k++)spawnInfantry(a.x+(k-(a.dropCount-1)/2)*18,a.y+28);AudioSys.tone('heli');}
        if(a.t>1.5){a.phase='out';a.vx=a.x<W*.5?-145:145;}
      }else a.x+=a.vx*dt;
    }else{
      a.x+=a.vx*dt;
      var f0=a.fromLeft?.28:.72,f1=a.fromLeft?.72:.28;
      while(a.dropped<a.dropCount){
        var f=a.dropCount<=1?.5:a.dropped/(a.dropCount-1),trigger=W*lerp(f0,f1,f);
        if(a.fromLeft?(a.x<trigger):(a.x>trigger))break;
        spawnPara(a.x,a.y+16);a.dropped++;
      }
    }
  }
  for(i=0;i<gameState.paras.length;i++){
    var p=gameState.paras[i];if(!p.alive)continue;
    p.phase+=dt*2.3;p.baseX+=Math.sin(p.phase)*.18;p.x=p.baseX+Math.sin(p.phase)*10;p.y+=p.vy*dt;
    if(p.y>=p.landingY){p.alive=false;spawnInfantry(p.x,p.landingY,'rifle');pushEffect({type:'chute',x:p.x,y:p.landingY,t:0,life:2.4});}
  }
  gameState.air=gameState.air.filter(function(a){return a.x>-190&&a.x<W+190&&a.y<H+160;});
  gameState.paras=gameState.paras.filter(function(p){return p.alive;});
}

/* ---------- PLAYER WEAPONS ---------- */

function queueMG(x,y){
  if(gameState.overheat){gameState.message='BARREL HOT';gameState.messageT=.3;return;}
  var n=gameState.profile.burst;
  for(var i=0;i<n;i++)gameState.burstQueue.push({t:i*.082,x:x,y:y});
}
function fireWeapon(kind,x,y){
  if(gameState.overheat){gameState.message='BARREL HOT';gameState.messageT=.3;return false;}
  var heat=kind==='he'?.13:.014;
  gameState.heat=clamp(gameState.heat+heat*gameState.profile.heatScale,0,1);
  if(gameState.heat>=.99)gameState.overheat=true;

  var damage=(kind==='mg'?5.8:46)*gameState.profile.damage;
  var speed=(kind==='mg'?505:215)*gameState.profile.projectileSpeed;
  var sx=gameState.bunker.x,sy=gameState.bunker.y-10,dx=x-sx,dy=y-sy,d=Math.sqrt(dx*dx+dy*dy)||1;
  var spread=(kind==='mg'?.045:.006)*(1+gameState.heat*.92),ang=Math.atan2(dy,dx)+rand(-spread,spread);
  var shot={
    kind:kind,x:sx,y:sy,px:sx,py:sy,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,
    damage:damage,range:Math.hypot(W,H)*1.2,targetDist:d,traveled:0,active:true,
    radius:kind==='he'?gameState.profile.heRadius:0,suppressed:{}
  };
  if(kind==='he'){
    shot.z=0;shot.pz=0;shot.arcStart=0;shot.arcEnd=d;shot.arcHeight=clamp(16+d*.045,20,44);
    shot.bounces=0;shot.ignoreVehicle=0;
  }
  gameState.shots.push(shot);
  var ma=Math.atan2(dy,dx),mx=sx+Math.cos(ma)*16,my=sy+Math.sin(ma)*16;
  emitMuzzle(mx,my,ma,kind==='he');
  if(kind==='mg')pushEffect({type:'casing',x:sx+rand(-3,3),y:sy-2,vx:Math.cos(ma+Math.PI/2)*rand(25,42),vy:Math.sin(ma+Math.PI/2)*rand(25,42)-rand(5,16),rot:rand(0,TAU),vr:rand(-15,15),t:0,life:rand(.30,.50)});
  gameState.stats.shots++;AudioSys.tone(kind);return true;
}
function applySuppression(b){
  if(b.kind!=='mg')return;
  for(var i=0;i<gameState.infantry.length;i++){
    var e=gameState.infantry[i];if(!e.alive||b.suppressed[e.id])continue;
    var d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);
    if(d<27&&d>8){b.suppressed[e.id]=1;e.suppression=clamp(e.suppression+.22,0,1);}
  }
}
function coverRadius(c){
  if(c.kind==='lowwall'||c.kind==='log'||c.kind==='fence')return Math.max(6,c.len*.42);
  if(c.kind==='bush'||c.kind==='scrub'||c.kind==='snowbank')return Math.max(5,c.r||6);
  return 7;
}
function coverHeight(c){
  if(c.kind==='fence')return 4;
  if(c.kind==='sandbag'||c.kind==='log'||c.kind==='lowwall'||c.kind==='snowbank')return 6;
  if(c.kind==='crate'||c.kind==='barrel'||c.kind==='pipe')return 8;
  if(c.kind==='bush'||c.kind==='scrub')return 3;
  return 5;
}
function heObstacleHit(b){
  var i,c,m=gameState.map,z=b.z||0;
  for(i=0;i<m.cover.length;i++){
    c=m.cover[i];
    if(z<=coverHeight(c)&&dist(b.x,b.y,c.x,c.y)<coverRadius(c)){
      pushEffect({type:'impactFlash',x:b.x,y:b.y,r:7,t:0,life:.08});emitDebris(b.x,b.y,IS_IPHONE?2:4);
      explode(b.x,b.y,b.radius*.82,true);blastInfantry(b.x,b.y,b.radius,b.damage*.72);b.active=false;return true;
    }
  }
  for(i=0;i<m.trees.length;i++){
    c=m.trees[i];
    if(z<=13&&dist(b.x,b.y,c.x,c.y)<Math.max(5,c.r*.72)){
      explode(b.x,b.y,b.radius*.78,true);blastInfantry(b.x,b.y,b.radius,b.damage*.68);b.active=false;return true;
    }
  }
  for(i=0;i<m.rocks.length;i++){
    c=m.rocks[i];
    if(z<=5&&dist(b.x,b.y,c.x,c.y)<Math.max(4,c.r+.8)){
      for(var sp=0;sp<4;sp++)pushEffect({type:'spark',x:b.x,y:b.y,vx:rand(-60,60),vy:rand(-65,15),t:0,life:rand(.12,.28)});
      explode(b.x,b.y,b.radius*.72,true);blastInfantry(b.x,b.y,b.radius,b.damage*.62);b.active=false;return true;
    }
  }
  var cp=m.compound;
  if(z<=24&&b.x>cp.x-cp.w/2-2&&b.x<cp.x+cp.w/2+2&&b.y>cp.y-cp.h/2-2&&b.y<cp.y+cp.h/2+2){
    explode(b.x,b.y,b.radius*.82,true);blastInfantry(b.x,b.y,b.radius,b.damage*.70);b.active=false;return true;
  }
  return false;
}
function ricochetHE(b,v,grazing){
  var chance=v.type==='halftrack'?.30:v.type==='truck'?.18:v.type==='lighttruck'?.11:.05;
  chance+=grazing>.60?.28:grazing>.42?.12:0;
  if(b.bounces>0)chance*=.45;
  if(Math.random()>=chance)return false;
  var a=Math.atan2(b.vy,b.vx)+(Math.random()<.5?-1:1)*rand(.42,.82),sp=Math.hypot(b.vx,b.vy)*rand(.48,.64);
  b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;b.damage*=.48;b.radius*=.82;
  b.bounces++;b.ignoreVehicle=v.id;b.arcStart=b.traveled;b.arcEnd=b.traveled+rand(55,95);b.targetDist=b.arcEnd;b.arcHeight*=.55;
  for(var i=0;i<(IS_IPHONE?4:7);i++)pushEffect({type:'spark',x:b.x,y:b.y,vx:rand(-95,95),vy:rand(-80,35),t:0,life:rand(.14,.34)});
  pushEffect({type:'impactFlash',x:b.x,y:b.y,r:8,t:0,life:.09});AudioSys.tone('metal',.7);
  gameState.message='RICOCHET';gameState.messageT=.22;
  return true;
}
function blastInfantry(x,y,r,damage){
  for(var i=0;i<gameState.infantry.length;i++){
    var e=gameState.infantry[i];if(!e.alive)continue;
    var d=dist(x,y,e.x,e.y);
    if(d<r){
      var fall=.18+.70*(1-d/r);
      if(e.state==='cover'||e.state==='crouch'||e.state==='prone')fall*=.78;
      damageInfantry(e,damage*fall,'he');
    }
  }
}
function resolveMGHit(b){
  var best=null,type='',bd=9999,d,i,e,v,a;
  for(i=0;i<gameState.infantry.length;i++){
    e=gameState.infantry[i];if(!e.alive)continue;
    d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);
    var ir=(e.state==='cover'||e.state==='crouch'||e.state==='prone'?6.6:8.6)*DEVICE.hitRadius;
    if(d<ir&&d<bd){best=e;type='infantry';bd=d;}
  }
  for(i=0;i<gameState.vehicles.length;i++){
    v=gameState.vehicles[i];if(!v.alive)continue;
    d=pointSegDist(v.x,v.y,b.px,b.py,b.x,b.y);
    var vr=(v.type==='jeep'?15:v.type==='lighttruck'?17:20)*DEVICE.hitRadius;
    if(d<vr&&d<bd){best=v;type='vehicle';bd=d;}
  }
  for(i=0;i<gameState.paras.length;i++){e=gameState.paras[i];if(!e.alive)continue;d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);if(d<12*DEVICE.hitRadius&&d<bd){best=e;type='para';bd=d;}}
  for(i=0;i<gameState.air.length;i++){a=gameState.air[i];if(!a.alive)continue;d=pointSegDist(a.x,a.y,b.px,b.py,b.x,b.y);if(d<(a.type==='heli'?24:20)*DEVICE.hitRadius&&d<bd){best=a;type='air';bd=d;}}
  if(!best){applySuppression(b);return false;}
  gameState.stats.hits++;gameState.eff=clamp(gameState.eff+.008,0,1);
  if(type==='infantry')damageInfantry(best,b.damage,'mg');
  else if(type==='vehicle')damageVehicle(best,b.damage,'mg');
  else if(type==='air')damageAir(best,b.damage);
  else{best.hp-=b.damage;if(best.hp<=0){best.alive=false;gameState.stats.airKills++;addBlood(best.x,best.y,6,false);}}
  b.active=false;return true;
}
function resolveHEHit(b){
  var i,v,e,d,vr;
  for(i=0;i<gameState.vehicles.length;i++){
    v=gameState.vehicles[i];if(!v.alive||v.id===b.ignoreVehicle)continue;
    vr=v.type==='jeep'?13:v.type==='lighttruck'?15:v.type==='truck'?17:19;
    d=pointSegDist(v.x,v.y,b.px,b.py,b.x,b.y);
    if(d<vr&&(b.z||0)<=7){
      if(ricochetHE(b,v,d/vr))return true;
      gameState.stats.hits++;gameState.eff=clamp(gameState.eff+.010,0,1);
      damageVehicle(v,b.damage,'he');
      explode(b.x,b.y,b.radius*.86,true);
      blastInfantry(b.x,b.y,b.radius,b.damage*.70);
      b.active=false;return true;
    }
  }
  for(i=0;i<gameState.infantry.length;i++){
    e=gameState.infantry[i];if(!e.alive)continue;
    d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);
    if(d<6.5*DEVICE.hitRadius){
      gameState.stats.hits++;damageInfantry(e,b.damage*1.05,'he');
      explode(b.x,b.y,b.radius,true);blastInfantry(b.x,b.y,b.radius,b.damage*.58);b.active=false;return true;
    }
  }
  return false;
}
function updateShots(dt){
  for(var i=0;i<gameState.burstQueue.length;i++)gameState.burstQueue[i].t-=dt;
  while(gameState.burstQueue.length&&gameState.burstQueue[0].t<=0){var q=gameState.burstQueue.shift();fireWeapon('mg',q.x,q.y);}
  for(i=0;i<gameState.shots.length;i++){
    var b=gameState.shots[i];if(!b.active)continue;
    b.px=b.x;b.py=b.y;if(b.kind==='he')b.pz=b.z||0;
    var dx=b.vx*dt,dy=b.vy*dt;b.x+=dx;b.y+=dy;b.traveled+=Math.sqrt(dx*dx+dy*dy);

    if(b.kind==='he'){
      b.trailCd=(b.trailCd||0)-dt;
      if(b.trailCd<=0){
        b.trailCd=.045;
        pushEffect({type:'heTrail',x:b.x,y:b.y-(b.z||0),vx:rand(-5,5),vy:rand(-9,-2),r:rand(1.8,3.2),t:0,life:rand(.20,.34)});
      }
      var span=Math.max(1,b.arcEnd-b.arcStart),t=clamp((b.traveled-b.arcStart)/span,0,1);
      b.z=Math.sin(Math.PI*t)*b.arcHeight;
      if(heObstacleHit(b))continue;
      if(resolveHEHit(b))continue;
      if(b.traveled>=b.targetDist){
        explode(b.x,b.y,b.radius,true);blastInfantry(b.x,b.y,b.radius,b.damage*.82);b.active=false;continue;
      }
    }else{
      if(resolveMGHit(b))continue;
    }

    if(b.traveled>=b.range||b.x<-30||b.x>W+30||b.y<-30||b.y>H+30){
      if(b.kind==='he'){explode(b.x,b.y,b.radius*.75,true);blastInfantry(b.x,b.y,b.radius,b.damage*.55);}
      else{gameState.stats.misses++;gameState.eff=clamp(gameState.eff-(IS_IPHONE?.0015:.0025),0,1);}
      b.active=false;
    }
  }
  gameState.shots=gameState.shots.filter(function(b){return b.active;});
}
function updateEnemyShots(dt){
  for(var i=0;i<gameState.enemyShots.length;i++){
    var b=gameState.enemyShots[i];b.px=b.x;b.py=b.y;if(b.kind==='grenade')b.vy+=78*dt;
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(dist(b.x,b.y,gameState.bunker.x,gameState.bunker.y)<28){
      damageBunker(b.dmg);if(b.kind==='grenade'||b.kind==='shell')explode(b.x,b.y,b.kind==='shell'?23:18,true);b.life=0;
    }
  }
  gameState.enemyShots=gameState.enemyShots.filter(function(b){return b.life>0&&b.x>-50&&b.x<W+50&&b.y>-50&&b.y<H+50;});
}
function updateEffects(dt){
  for(var i=0;i<gameState.effects.length;i++){
    var e=gameState.effects[i];e.t+=dt;
    if(e.type==='blood'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=58*dt;}
    else if(e.type==='damage')e.y-=15*dt;
    else if(e.type==='dust'){e.r+=8*dt;e.y+=4*dt;}
    else if(e.type==='spark'||e.type==='ember'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=(e.type==='spark'?95:35)*dt;}
    else if(e.type==='fireball')e.r+=18*dt;
    else if(e.type==='smoke'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.r+=7*dt;e.vx*=Math.pow(.45,dt);}
    else if(e.type==='flame'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.r+=3*dt;}
    else if(e.type==='heTrail'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.r+=4*dt;}
    else if(e.type==='debris'||e.type==='casing'||e.type==='vehiclePart'){
      e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=(e.type==='casing'?75:e.type==='vehiclePart'?88:110)*dt;e.rot+=e.vr*dt;
      if(e.type==='vehiclePart'){e.vx*=Math.pow(.78,dt);e.vy*=Math.pow(.88,dt);}
    }
  }
  gameState.effects=gameState.effects.filter(function(e){return e.t<e.life;});

  for(i=0;i<gameState.wrecks.length;i++){
    var w=gameState.wrecks[i];
    if((w.burnT||0)>0){
      w.burnT-=dt;w.smokeCd-=dt;w.flameCd-=dt;
      if(w.smokeCd<=0){w.smokeCd=rand(.12,.24);emitSmoke(w.x+rand(-8,8),w.y+rand(-7,7),true);}
      if(w.flameCd<=0){w.flameCd=rand(.10,.22);emitFlame(w.x+rand(-7,7),w.y+rand(-6,6),Math.random()<.35);}
    }
  }
}
/* ---------- UPDATE ---------- */

function update(dt){
  if(!gameState||gameState.mode!=='playing')return;
  gameState.time+=dt;gameState.levelTime+=dt;
  gameState.bunker.angle=Math.atan2(gameState.aim.y-gameState.bunker.y,gameState.aim.x-gameState.bunker.x);
  gameState.messageT=Math.max(0,gameState.messageT-dt);gameState.hitMarker=Math.max(0,gameState.hitMarker-dt);gameState.shake=Math.max(0,(gameState.shake||0)-dt*20);gameState.screenFlash=Math.max(0,(gameState.screenFlash||0)-dt*1.9);
  gameState.streakT=Math.max(0,gameState.streakT-dt);if(gameState.streakT<=0)gameState.streak=0;
  gameState.heat=Math.max(0,gameState.heat-gameState.profile.cool*dt);if(gameState.overheat&&gameState.heat<.28)gameState.overheat=false;
  if(gameState.pointer.down&&!gameState.pointer.heFired){
    var chargeHold=(performance.now()-gameState.pointer.t0)/1000*gameState.profile.chargeScale;
    if(chargeHold>=HE_HOLD){
      gameState.pointer.heFired=true;
      if(fireWeapon('he',gameState.aim.x,gameState.aim.y)){gameState.message='HE SHELL';gameState.messageT=.18;}
    }
  }

  processEvents();updateInfantry(dt);updateVehicles(dt);updateAir(dt);updateShots(dt);updateEnemyShots(dt);updateEffects(dt);

  if(gameState.eff<.20){endGame('EFFICIENCY LOST');return;}
  var liveInf=gameState.infantry.some(function(e){return e.alive;});
  var liveVeh=gameState.vehicles.some(function(v){return v.alive;});
  var liveAir=gameState.air.some(function(a){return a.alive;});
  if(gameState.eventCursor>=gameState.events.length&&!liveInf&&!liveVeh&&!liveAir&&!gameState.paras.length&&gameState.levelTime>11.5)completeLevel();
}

/* ---------- PROGRESSION ---------- */

function completeLevel(){
  if(gameState.levelComplete)return;
  gameState.levelComplete=true;gameState.mode='shop';
  var stageBonus=level().stage===2?18:0;
  var reward=Math.round(44+gameState.levelIndex*3+gameState.eff*30+Math.max(0,gameState.bunker.hp/gameState.bunker.maxHp)*16+stageBonus);
  gameState.save.supply+=reward;gameState.save.bestLevel=Math.max(gameState.save.bestLevel,Math.min(14,gameState.levelIndex+1));saveGame();
  overlay.classList.remove('hidden');
  titleEl.textContent=gameState.levelIndex>=14?'CAMPAIGN COMPLETE':'MAP CLEARED';
  subEl.textContent=gameState.levelIndex>=14?'Alle 15 levels zijn gehaald.':'Upgrade en ga door. Iedere run gebruikt een andere encountervolgorde.';
  summaryEl.style.display='block';
  summaryEl.textContent='EFF '+Math.round(gameState.eff*100)+'% · KILLS '+(gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills)+' · HP '+Math.max(0,Math.round(gameState.bunker.hp))+'/'+Math.round(gameState.bunker.maxHp)+' · +'+reward+' SUPPLY';
  shopEl.style.display='block';restartBtn.style.display='none';deployBtn.style.display='block';deployBtn.textContent=gameState.levelIndex>=14?'RESTART CAMPAIGN':'NEXT MAP';
  renderShop();
}
function renderShop(){
  gameState.profile=playerProfile();
  supplyEl.textContent='SUPPLY: '+gameState.save.supply+' · DAMAGE x'+gameState.profile.damage.toFixed(2)+' · SPEED x'+gameState.profile.projectileSpeed.toFixed(2);
  shopGrid.innerHTML='';
  Object.keys(UPGRADES).forEach(function(key){
    var cfg=UPGRADES[key],lvl=gameState.save.upgrades[key]||0,cost=lvl<cfg.cost.length?cfg.cost[lvl]:null;
    var b=document.createElement('button');b.type='button';b.className='shopBtn'+(cost==null||gameState.save.supply<cost?' disabled':'');
    b.innerHTML='<strong>'+cfg.label+' · '+lvl+'/'+cfg.cost.length+'</strong><span>'+cfg.desc+'</span><em>'+(cost==null?'MAX':cost+' SUPPLY')+'</em>';
    if(cost!=null)b.addEventListener('click',function(){if(gameState.save.supply<cost)return;gameState.save.supply-=cost;gameState.save.upgrades[key]=lvl+1;saveGame();renderShop();});
    shopGrid.appendChild(b);
  });
}
function endGame(reason){
  gameState.mode='gameover';overlay.classList.remove('hidden');
  titleEl.textContent=reason;subEl.textContent='Probeer dezelfde map opnieuw.';
  summaryEl.style.display='block';
  summaryEl.textContent='EFF '+Math.round(gameState.eff*100)+'% · KILLS '+(gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills)+' · MAP '+(gameState.levelIndex+1)+'/15';
  shopEl.style.display='none';deployBtn.style.display='none';restartBtn.style.display='block';
}

/* ---------- INPUT ---------- */

function pointerPos(ev){
  var r=canvas.getBoundingClientRect();
  return {x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height};
}
canvas.addEventListener('pointerdown',function(ev){
  AudioSys.unlock();
  if(!gameState||gameState.mode!=='playing')return;
  var p=pointerPos(ev);gameState.pointer.down=true;gameState.pointer.t0=performance.now();gameState.pointer.heFired=false;gameState.aim=p;
  try{canvas.setPointerCapture(ev.pointerId);}catch(e){}
  ev.preventDefault();
},{passive:false});
canvas.addEventListener('pointermove',function(ev){
  if(!gameState||gameState.mode!=='playing')return;
  gameState.aim=pointerPos(ev);if(gameState.pointer.down)ev.preventDefault();
},{passive:false});
canvas.addEventListener('pointerup',function(ev){
  if(!gameState||gameState.mode!=='playing'||!gameState.pointer.down)return;
  var p=pointerPos(ev),firedHE=gameState.pointer.heFired;gameState.pointer.down=false;gameState.pointer.heFired=false;gameState.aim=p;
  if(!firedHE)queueMG(p.x,p.y);
  ev.preventDefault();
},{passive:false});
canvas.addEventListener('pointercancel',function(){if(gameState){gameState.pointer.down=false;gameState.pointer.heFired=false;}});


deployBtn.addEventListener('click',function(){
  AudioSys.unlock();
  if(gameState.mode==='menu'){
    overlay.classList.add('hidden');shopEl.style.display='none';summaryEl.style.display='none';resetLevel();return;
  }
  if(gameState.mode==='shop'){
    gameState.levelIndex=gameState.levelIndex>=14?0:gameState.levelIndex+1;
    overlay.classList.add('hidden');shopEl.style.display='none';summaryEl.style.display='none';resetLevel();
  }
});
restartBtn.addEventListener('click',function(){
  AudioSys.unlock();overlay.classList.add('hidden');restartBtn.style.display='none';deployBtn.style.display='block';summaryEl.style.display='none';resetLevel();
});

/* ---------- RENDER: TERRAIN ---------- */

function pathRoad(){
  var m=gameState.map,p=m.palette,r=m.road;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=p.roadEdge;ctx.lineWidth=24;ctx.beginPath();ctx.moveTo(r.x,safeTop-25);ctx.quadraticCurveTo(r.bendX,r.junctionY,W*.5,gameState.bunker.y-55);ctx.stroke();
  ctx.strokeStyle=p.road;ctx.lineWidth=18;ctx.stroke();
  ctx.globalAlpha=.20;ctx.strokeStyle=tone(p.road,.25);ctx.lineWidth=1;ctx.setLineDash([8,13]);ctx.stroke();ctx.restore();
}
function drawPatch(q,p){
  ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.globalAlpha=q.a;ctx.fillStyle=p.ground2;ctx.beginPath();ctx.ellipse(0,0,q.rx,q.ry,0,0,TAU);ctx.fill();ctx.restore();
}
function drawTree(t,p){
  ctx.save();ctx.translate(t.x,t.y);ctx.fillStyle='rgba(0,0,0,.10)';ctx.beginPath();ctx.ellipse(3,4,t.r*1.1,t.r*.7,0,0,TAU);ctx.fill();
  ctx.strokeStyle=p.line;ctx.lineWidth=1;ctx.fillStyle=t.variant%2?p.veg:p.veg2;
  var n=3+(t.variant%2);for(var i=0;i<n;i++){var a=i/n*TAU+t.variant*.35;ctx.beginPath();ctx.arc(Math.cos(a)*t.r*.38,Math.sin(a)*t.r*.33,t.r*.62,0,TAU);ctx.fill();ctx.stroke();}
  ctx.fillStyle=tone(p.trench,-.05);ctx.beginPath();ctx.arc(0,0,t.r*.20,0,TAU);ctx.fill();ctx.restore();
}
function drawRock(r,p){
  ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.variant*.35);ctx.fillStyle=p.rock;ctx.strokeStyle=p.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-r.r,1);ctx.lineTo(-r.r*.45,-r.r*.8);ctx.lineTo(r.r*.58,-r.r*.55);ctx.lineTo(r.r,0);ctx.lineTo(r.r*.28,r.r*.7);ctx.lineTo(-r.r*.65,r.r*.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
function drawDecor(d,p){
  ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);ctx.scale(d.s,d.s);ctx.strokeStyle=p.line;ctx.lineWidth=1;
  if(d.type==='barrel'){ctx.fillStyle=tone(p.roadEdge,-.04);ctx.fillRect(-3,-5,6,10);ctx.strokeRect(-3,-5,6,10);ctx.beginPath();ctx.moveTo(-3,-2);ctx.lineTo(3,-2);ctx.moveTo(-3,2);ctx.lineTo(3,2);ctx.stroke();}
  else if(d.type==='crate'){ctx.fillStyle=p.building;ctx.fillRect(-5,-5,10,10);ctx.strokeRect(-5,-5,10,10);ctx.beginPath();ctx.moveTo(-5,-5);ctx.lineTo(5,5);ctx.moveTo(5,-5);ctx.lineTo(-5,5);ctx.stroke();}
  else if(d.type==='fence'){ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);for(var i=-8;i<=8;i+=8){ctx.moveTo(i,-4);ctx.lineTo(i,4);}ctx.stroke();}
  else if(d.type==='hay'){ctx.fillStyle=tone(p.road,.12);ctx.beginPath();ctx.ellipse(0,0,7,5,0,0,TAU);ctx.fill();ctx.stroke();}
  else if(d.type==='pipe'){ctx.strokeStyle=p.rock;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,-3);ctx.lineTo(8,4);ctx.stroke();}
  else if(d.type==='snow'){ctx.globalAlpha=.35;ctx.fillStyle='#eef2ef';ctx.beginPath();ctx.ellipse(0,0,9,4,0,0,TAU);ctx.fill();}
  else if(d.type==='log'){ctx.strokeStyle=tone(p.trench,-.05);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.stroke();}
  else if(d.type==='sandbag'){ctx.fillStyle=tone(p.roadEdge,.08);for(i=-1;i<=1;i++){ctx.beginPath();ctx.ellipse(i*5,0,4,2.7,0,0,TAU);ctx.fill();ctx.stroke();}}
  else if(d.type==='rubble'){ctx.fillStyle=p.rock;for(i=0;i<4;i++){ctx.beginPath();ctx.arc((i-1.5)*3,(i%2)*2,2.2,0,TAU);ctx.fill();}}
  else{ctx.fillStyle=p.veg;ctx.beginPath();ctx.arc(-3,0,4,0,TAU);ctx.arc(3,1,4,0,TAU);ctx.fill();}
  ctx.restore();
}
function drawCover(c,p){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.strokeStyle=p.line;ctx.lineWidth=1;
  if(c.kind==='sandbag'){
    ctx.fillStyle=tone(p.roadEdge,.09);for(var i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(i*4,0,3.3,2.2,0,0,TAU);ctx.fill();ctx.stroke();}
  }else if(c.kind==='crate'){
    ctx.fillStyle=p.building;ctx.fillRect(-7,-5,8,9);ctx.strokeRect(-7,-5,8,9);ctx.fillRect(2,-3,7,8);ctx.strokeRect(2,-3,7,8);
  }else if(c.kind==='lowwall'){
    ctx.fillStyle=tone(p.rock,-.03);ctx.fillRect(-c.len/2,-3,c.len,6);ctx.strokeRect(-c.len/2,-3,c.len,6);
  }else if(c.kind==='log'){
    ctx.strokeStyle=tone(p.trench,-.05);ctx.lineCap='round';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-c.len/2,0);ctx.lineTo(c.len/2,0);ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle=tone(p.trench,.18);ctx.stroke();
  }else if(c.kind==='fence'){
    ctx.beginPath();ctx.moveTo(-c.len/2,0);ctx.lineTo(c.len/2,0);for(i=-c.len/2+3;i<c.len/2;i+=7){ctx.moveTo(i,-4);ctx.lineTo(i,4);}ctx.stroke();
  }else if(c.kind==='barrel'){
    ctx.fillStyle=tone(p.roadEdge,-.05);ctx.fillRect(-4,-5,8,10);ctx.strokeRect(-4,-5,8,10);ctx.beginPath();ctx.moveTo(-4,-2);ctx.lineTo(4,-2);ctx.moveTo(-4,2);ctx.lineTo(4,2);ctx.stroke();
  }else if(c.kind==='pipe'){
    ctx.strokeStyle=p.rock;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-c.len/2,-2);ctx.lineTo(c.len/2,2);ctx.stroke();
  }else if(c.kind==='snowbank'){
    ctx.globalAlpha=.55;ctx.fillStyle='#edf1ee';ctx.beginPath();ctx.ellipse(0,0,c.len*.45,4,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
  }else if(c.kind==='bush'||c.kind==='scrub'){
    ctx.fillStyle=c.kind==='bush'?p.veg:p.veg2;ctx.beginPath();ctx.arc(-4,0,c.r*.65,0,TAU);ctx.arc(3,1,c.r*.72,0,TAU);ctx.fill();
  }else{
    ctx.fillStyle=p.rock;for(i=0;i<5;i++){ctx.beginPath();ctx.arc((i-2)*3,(i%2)*2,2.5,0,TAU);ctx.fill();ctx.stroke();}
  }
  ctx.restore();
}
function drawCompound(){
  var p=gameState.map.palette,c=gameState.map.compound;
  ctx.save();ctx.translate(c.x,c.y);
  ctx.fillStyle='rgba(0,0,0,.10)';ctx.fillRect(-c.w/2+4,-c.h/2+5,c.w,c.h);
  ctx.fillStyle=p.building;ctx.strokeStyle=p.line;ctx.lineWidth=1.5;ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h);ctx.strokeRect(-c.w/2,-c.h/2,c.w,c.h);
  ctx.fillStyle=p.roof;ctx.fillRect(-c.w/2+6,-c.h/2+6,c.w-12,c.h-12);
  ctx.strokeStyle=tone(p.roof,.16);ctx.beginPath();ctx.moveTo(-c.w/2+9,0);ctx.lineTo(c.w/2-9,0);ctx.stroke();
  ctx.fillStyle=p.line;ctx.fillRect(-4,c.h/2-10,8,10);ctx.restore();
}
function drawCrater(c,p){
  var rng=seeded(c.seed);ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot||0);
  ctx.globalAlpha=.32;ctx.fillStyle=tone(p.line,-.10);
  ctx.beginPath();
  for(var i=0;i<10;i++){
    var a=i/10*TAU,rr=c.r*(.62+rng()*.38),x=Math.cos(a)*rr,y=Math.sin(a)*rr*.58;
    if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.closePath();ctx.fill();
  ctx.globalAlpha=.18;ctx.fillStyle='#171512';ctx.beginPath();ctx.ellipse(0,1,c.r*.55,c.r*.28,.15,0,TAU);ctx.fill();
  ctx.restore();
}
function drawBlood(b){
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);
  ctx.globalAlpha=.62;
  var c=b.shade===0?'#681c1d':b.shade===1?'#7d2927':'#521719';
  ctx.fillStyle=c;
  ctx.beginPath();ctx.ellipse(0,0,b.r,b.r*.48,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.ellipse(b.r*.56,-b.r*.18,b.r*.36,b.r*.20,.25,0,TAU);ctx.fill();
  ctx.beginPath();ctx.ellipse(-b.r*.48,b.r*.20,b.r*.30,b.r*.18,-.35,0,TAU);ctx.fill();
  if((b.lobes||3)>3){ctx.beginPath();ctx.arc(b.r*.12,b.r*.46,b.r*.18,0,TAU);ctx.fill();}
  ctx.restore();
}
function drawArcadeGroundDetail(p){
  ctx.save();ctx.globalAlpha=.18;
  for(var i=0;i<54;i++){
    var x=(i*83+level().seed*17)%W,y=safeTop+70+((i*137+level().seed*9)%Math.max(120,H-safeTop-safeBottom-170));
    var onRoad=Math.abs(x-gameState.map.road.x)<18;
    ctx.fillStyle=onRoad?tone(p.roadEdge,.10):(i%3?tone(p.ground2,-.08):tone(p.rock,.02));
    var sz=i%7===0?2:1;ctx.fillRect(Math.round(x),Math.round(y),sz,sz);
  }
  ctx.globalAlpha=.10;ctx.strokeStyle=tone(p.line,.08);ctx.lineWidth=1;
  for(i=0;i<10;i++){
    var yy=safeTop+100+((i*91+level().seed*5)%Math.max(130,H-safeTop-safeBottom-220));
    var xx=(i*117+level().seed*13)%W;
    ctx.beginPath();ctx.moveTo(xx-5,yy);ctx.lineTo(xx+5,yy+(i%2?2:-2));ctx.stroke();
  }
  ctx.restore();
}
function drawMap(){
  var m=gameState.map,p=m.palette;
  ctx.fillStyle=p.ground;ctx.fillRect(0,0,W,H);
  drawArcadeGroundDetail(p);
  for(var i=0;i<m.patches.length;i++)drawPatch(m.patches[i],p);
  pathRoad();drawCompound();
  for(i=0;i<m.cover.length;i++)drawCover(m.cover[i],p);
  for(i=0;i<m.trees.length;i++)drawTree(m.trees[i],p);
  for(i=0;i<m.rocks.length;i++)drawRock(m.rocks[i],p);
  for(i=0;i<m.decor.length;i++)drawDecor(m.decor[i],p);
  for(i=0;i<gameState.craters.length;i++)drawCrater(gameState.craters[i],p);
  for(i=0;i<gameState.blood.length;i++)drawBlood(gameState.blood[i]);
  for(i=0;i<gameState.wrecks.length;i++)drawVehicle(gameState.wrecks[i],true);
}

/* ---------- RENDER: INFANTRY ---------- */

/* ---------- RENDER: PIXEL SPRITE ATLAS ---------- */

var SPR={atlas:null,frames:{},level:-1,size:512,x:1,y:1,rowH:0,
  inf:{w:10,h:12,roles:['rifle','lmg','grenadier','marksman'],dirs:['down','left','right','up'],poses:['idle','idle2','walk1','walk2','walk3','walk4','standFire','crouch','crouchFire','prone','proneFire','dead1','dead2'],skins:3}};

function atlasAdd(name,w,h,draw){
  var pad=1;if(SPR.x+w+pad>SPR.size){SPR.x=1;SPR.y+=SPR.rowH+pad;SPR.rowH=0;}
  if(SPR.y+h+pad>SPR.size)throw new Error('sprite atlas full');
  var f={x:SPR.x,y:SPR.y,w:w,h:h};SPR.frames[name]=f;draw(SPR.atlas.getContext('2d'),f.x,f.y,w,h);
  SPR.x+=w+pad;SPR.rowH=Math.max(SPR.rowH,h);
}
function P(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function spriteColors(role,skin){
  var b={rifle:{body:'#718b59',light:'#c0d891',dark:'#3e4d36',line:'#1d241b',gun:'#2a3028'},lmg:{body:'#7c8f5f',light:'#c9dc9b',dark:'#46533b',line:'#1e251c',gun:'#272d26'},grenadier:{body:'#8a855b',light:'#d1cd92',dark:'#524e34',line:'#24231b',gun:'#302f27'},marksman:{body:'#687f66',light:'#b8d09e',dark:'#39483a',line:'#1b221c',gun:'#293029'}}[role];
  if(skin===1){b={body:tone(b.body,.055),light:tone(b.light,.035),dark:b.dark,line:b.line,gun:b.gun};}
  else if(skin===2){b={body:tone(b.body,-.045),light:b.light,dark:tone(b.dark,-.025),line:b.line,gun:b.gun};}
  b.flash='#ffd45a';return b;
}
function spriteInfFrame(g,ox,oy,role,dir,pose,skin){
  var C=spriteColors(role,skin),fire=pose==='standFire'||pose==='crouchFire'||pose==='proneFire';
  var crouch=pose==='crouch'||pose==='crouchFire',prone=pose==='prone'||pose==='proneFire',dead=pose==='dead1'||pose==='dead2';
  var wf=pose==='walk1'?0:pose==='walk2'?1:pose==='walk3'?2:pose==='walk4'?3:-1;
  function Q(x,y,w,h,c){P(g,ox+x,oy+y,w,h,c);}
  if(dead){if(dir==='left'||dir==='right'){Q(3,4,4,3,C.body);Q(dir==='left'?1:7,4,2,2,C.light);Q(3,7,2,1,C.dark);Q(6,7,2,1,C.dark);Q(dir==='left'?0:7,5,3,1,C.gun);}else{Q(3,4,4,4,C.body);Q(4,2,2,2,C.light);Q(3,8,1,2,C.dark);Q(6,8,1,2,C.dark);Q(dir==='up'?7:2,5,2,1,C.gun);}return;}
  if(prone){if(dir==='left'){Q(1,5,2,2,C.light);Q(3,4,4,3,C.body);Q(7,4,2,2,C.dark);Q(3,7,2,1,C.dark);Q(5,7,2,1,C.dark);Q(0,5,3,1,C.gun);if(fire)Q(0,5,1,1,C.flash);}else if(dir==='right'){Q(7,5,2,2,C.light);Q(3,4,4,3,C.body);Q(1,4,2,2,C.dark);Q(3,7,2,1,C.dark);Q(5,7,2,1,C.dark);Q(7,5,3,1,C.gun);if(fire)Q(9,5,1,1,C.flash);}else if(dir==='up'){Q(4,1,2,2,C.light);Q(3,3,4,4,C.body);Q(3,7,1,2,C.dark);Q(6,7,1,2,C.dark);Q(7,2,1,4,C.gun);if(fire)Q(7,1,1,1,C.flash);}else{Q(4,8,2,2,C.light);Q(3,4,4,4,C.body);Q(3,2,1,2,C.dark);Q(6,2,1,2,C.dark);Q(2,6,1,4,C.gun);if(fire)Q(2,10,1,1,C.flash);}return;}
  if(crouch){if(dir==='left'){Q(3,1,3,3,C.light);Q(2,4,5,3,C.body);Q(2,7,2,2,C.dark);Q(5,7,2,2,C.dark);Q(0,5,3,1,C.gun);if(fire)Q(0,5,1,1,C.flash);}else if(dir==='right'){Q(4,1,3,3,C.light);Q(3,4,5,3,C.body);Q(3,7,2,2,C.dark);Q(6,7,2,2,C.dark);Q(7,5,3,1,C.gun);if(fire)Q(9,5,1,1,C.flash);}else if(dir==='up'){Q(4,1,2,3,C.light);Q(2,4,6,3,C.body);Q(3,7,1,2,C.dark);Q(6,7,1,2,C.dark);Q(7,2,1,4,C.gun);if(fire)Q(7,1,1,1,C.flash);}else{Q(4,2,2,3,C.light);Q(2,4,6,3,C.body);Q(3,7,1,2,C.dark);Q(6,7,1,2,C.dark);Q(2,6,1,4,C.gun);if(fire)Q(2,10,1,1,C.flash);}return;}
  var sa=0,sb=0;if(wf===0){sa=-1;sb=1;}else if(wf===2){sa=1;sb=-1;}
  if(dir==='left'){Q(3,1,3,3,C.light);Q(2,4,5,3,C.body);Q(2+sa,7,2,3,C.dark);Q(5+sb,7,2,3,C.dark);Q(0,5,3,1,C.gun);if(fire)Q(0,5,1,1,C.flash);}
  else if(dir==='right'){Q(4,1,3,3,C.light);Q(3,4,5,3,C.body);Q(3+sa,7,2,3,C.dark);Q(6+sb,7,2,3,C.dark);Q(7,5,3,1,C.gun);if(fire)Q(9,5,1,1,C.flash);}
  else if(dir==='up'){Q(4,1,2,3,C.light);Q(2,4,6,3,C.body);Q(3+sa,7,1,3,C.dark);Q(6+sb,7,1,3,C.dark);Q(7,2,1,4,C.gun);if(fire)Q(7,1,1,1,C.flash);}
  else{Q(4,2,2,3,C.light);Q(2,4,6,3,C.body);Q(3+sa,7,1,3,C.dark);Q(6+sb,7,1,3,C.dark);Q(2,6,1,4,C.gun);if(fire)Q(2,10,1,1,C.flash);}
  if(role==='lmg')Q(dir==='right'?3:dir==='left'?6:dir==='up'?7:2,4,1,2,C.dark);
  if(role==='grenadier')Q(dir==='right'?3:dir==='left'?6:dir==='up'?2:7,3,1,1,C.dark);
}
function vehicleCols(){var p=gameState.map.units[1];return {body:tone(p.body,.04),light:tone(p.light,.05),dark:tone(p.dark,-.08),line:tone(p.line,-.08),glass:'#91a69a'};}
function wheelPix(g,x,y,phase,c){
  P(g,x,y,4,7,c.line);P(g,x+1,y+1,2,5,c.dark);
  if(phase){P(g,x+1,y+1,1,1,c.light);P(g,x+2,y+5,1,1,c.light);}
  else{P(g,x+2,y+1,1,1,c.light);P(g,x+1,y+5,1,1,c.light);}
}
function spriteTruck(g,x,y,w,h,loaded,frame){
  var c=vehicleCols(),ph=frame&1;
  // long troop bed left, cab/front right: unmistakably a truck, not armor.
  P(g,x+4,y+8,31,24,c.line);P(g,x+6,y+10,27,20,c.body);
  P(g,x+7,y+11,15,18,c.dark);P(g,x+23,y+11,9,18,c.light);
  P(g,x+25,y+13,5,5,c.glass);P(g,x+31,y+15,3,10,c.line);
  wheelPix(g,x+3,y+10,ph,c);wheelPix(g,x+3,y+23,ph^1,c);wheelPix(g,x+34,y+10,ph^1,c);wheelPix(g,x+34,y+23,ph,c);
  P(g,x+8,y+12,12,1,c.line);P(g,x+8,y+27,12,1,c.line);
  if(loaded){for(var i=0;i<6;i++){P(g,x+9+(i%2)*6,y+13+Math.floor(i/2)*5,3,3,'#c2d198');P(g,x+10+(i%2)*6,y+16+Math.floor(i/2)*5,2,2,c.body);}}
}
function spriteLightTruck(g,x,y,w,h,loaded,frame){
  var c=vehicleCols(),ph=frame&1;
  P(g,x+6,y+10,28,20,c.line);P(g,x+8,y+12,24,16,c.body);
  P(g,x+9,y+13,11,14,c.dark);P(g,x+21,y+13,10,14,c.light);P(g,x+24,y+15,5,4,c.glass);P(g,x+31,y+17,3,7,c.line);
  wheelPix(g,x+5,y+12,ph,c);wheelPix(g,x+5,y+22,ph^1,c);wheelPix(g,x+33,y+12,ph^1,c);wheelPix(g,x+33,y+22,ph,c);
  if(loaded){for(var i=0;i<4;i++)P(g,x+10+(i%2)*5,y+14+Math.floor(i/2)*6,3,3,'#c2d198');}
}
function spriteJeep(g,x,y,w,h,loaded,frame){
  var c=vehicleCols(),ph=frame&1;
  P(g,x+8,y+12,24,16,c.line);P(g,x+10,y+13,20,14,c.body);
  // open cabin + exposed seats + spare wheel
  P(g,x+12,y+15,6,10,c.dark);P(g,x+20,y+15,7,10,c.light);P(g,x+27,y+17,3,6,c.glass);P(g,x+9,y+17,3,6,c.line);
  wheelPix(g,x+6,y+13,ph,c);wheelPix(g,x+6,y+22,ph^1,c);wheelPix(g,x+31,y+13,ph^1,c);wheelPix(g,x+31,y+22,ph,c);
  P(g,x+11,y+16,3,3,'#c2d198');if(loaded)P(g,x+16,y+21,3,3,'#c2d198');P(g,x+10,y+18,2,2,c.line);
}
function spriteHalftrack(g,x,y,w,h,loaded,frame){
  var c=vehicleCols(),ph=frame&1;
  // open troop carrier: rear track box left + wheeled armored nose right.
  P(g,x+3,y+7,33,26,c.line);P(g,x+6,y+9,28,22,c.body);
  P(g,x+7,y+10,17,20,c.dark);P(g,x+25,y+11,8,18,c.light);
  // open troop bay, visible floor/rim and soldiers
  P(g,x+9,y+12,13,16,tone(c.dark,.08));P(g,x+8,y+10,15,2,c.line);P(g,x+8,y+28,15,2,c.line);
  // rear tracks
  P(g,x+2,y+8,5,24,c.line);P(g,x+4,y+10,2,20,c.dark);
  P(g,x+22,y+8,5,24,c.line);P(g,x+23,y+10,2,20,c.dark);
  for(var t=0;t<4;t++){var yy=y+11+t*5;P(g,x+3,yy,3,2,ph?c.light:c.dark);P(g,x+23,yy,3,2,ph?c.dark:c.light);}
  // front wheels/nose
  P(g,x+31,y+15,5,10,c.line);P(g,x+28,y+14,5,12,c.glass);
  wheelPix(g,x+34,y+9,ph,c);wheelPix(g,x+34,y+24,ph^1,c);
  if(loaded){for(var i=0;i<6;i++){P(g,x+10+(i%2)*6,y+13+Math.floor(i/2)*5,3,3,'#c8d89f');P(g,x+11+(i%2)*6,y+16+Math.floor(i/2)*5,2,2,c.body);}}
}
function spriteTurret(g,x,y,w,h,type){
  var c=vehicleCols(),cx=x+w/2,cy=y+h/2,rad=type==='halftrack'?5:4,len=type==='halftrack'?12:10;
  P(g,cx-rad,cy-rad,rad*2,rad*2,c.line);P(g,cx-rad+1,cy-rad+1,rad*2-2,rad*2-2,c.light);P(g,cx,cy-1,len,3,c.line);
}
function spriteHeli(g,x,y,w,h,frame){var c=vehicleCols(),cx=x+w/2,cy=y+h/2;P(g,cx-16,cy-8,32,16,c.line);P(g,cx-14,cy-7,28,14,c.body);P(g,cx-10,cy-5,9,8,c.light);P(g,cx+12,cy-3,24,6,c.dark);P(g,cx+32,cy-7,4,14,c.line);if(frame%2===0){P(g,cx-28,cy-1,56,2,c.line);P(g,cx-1,cy-24,2,48,c.line);}else{for(var i=-22;i<=22;i+=4){P(g,cx+i,cy+i,2,2,c.line);P(g,cx+i,cy-i,2,2,c.line);}}}
function spritePlane(g,x,y,w,h,flip){var c=vehicleCols(),cx=x+w/2,cy=y+h/2;P(g,cx-26,cy-3,50,6,c.line);P(g,cx-24,cy-2,48,4,c.light);P(g,cx-4,cy-19,8,38,c.line);P(g,cx-3,cy-17,6,34,c.body);P(g,cx+(flip?12:-20),cy-10,8,20,c.dark);}
function spritePara(g,x,y,w,h,frame){var c=vehicleCols(),cx=x+w/2;P(g,cx-12,y+4,24,2,c.line);P(g,cx-10,y+6,20,5,tone(gameState.map.palette.ground,.28));P(g,cx-7,y+11,1,9,c.line);P(g,cx+6,y+11,1,9,c.line);P(g,cx-2,y+20,4,5,c.body);P(g,cx+(frame?-4:2),y+25,2,3,c.dark);}
function spriteBunker(g,x,y,w,h){var c=vehicleCols(),cx=x+w/2,cy=y+h/2;P(g,cx-30,cy-8,60,22,c.line);P(g,cx-27,cy-10,54,21,c.body);P(g,cx-12,cy-13,24,18,c.light);P(g,cx-8,cy-9,16,10,c.dark);}
function spriteBunkerTurret(g,x,y,w,h){var c=vehicleCols(),cx=x+w/2,cy=y+h/2;P(g,cx-7,cy-7,14,14,c.line);P(g,cx-5,cy-5,10,10,c.light);P(g,cx,cy-2,25,4,c.line);}

function spriteWreck(g,x,y,w,h,type){
  if(type==='jeep')spriteJeep(g,x,y,w,h,false,0);
  else if(type==='lighttruck')spriteLightTruck(g,x,y,w,h,false,0);
  else if(type==='halftrack')spriteHalftrack(g,x,y,w,h,false,0);
  else spriteTruck(g,x,y,w,h,false,0);
  var c=vehicleCols();
  P(g,x+8,y+9,23,4,'#252722');P(g,x+12,y+15,15,9,'#30312b');
  P(g,x+7,y+25,8,4,'#1d201d');P(g,x+23,y+8,6,6,'#171a17');
  P(g,x+18,y+12,3,3,'#6f4a2c');P(g,x+27,y+24,2,2,c.line);
}
function spriteVehiclePart(g,x,y,w,h,part){
  var c=vehicleCols();
  if(part==='wheel'){P(g,x+1,y,5,7,c.line);P(g,x+2,y+1,3,5,c.dark);}
  else if(part==='track'){P(g,x,y+1,10,4,c.line);P(g,x+1,y+2,8,2,c.dark);}
  else if(part==='door'){P(g,x,y,8,7,c.body);P(g,x+1,y+1,6,5,c.light);P(g,x+5,y+1,2,2,c.glass);}
  else{P(g,x,y,9,6,c.body);P(g,x+1,y+1,7,4,c.dark);}
}
function buildSpriteAtlas(){
  SPR.atlas=document.createElement('canvas');SPR.atlas.width=SPR.size;SPR.atlas.height=SPR.size;SPR.frames={};SPR.x=1;SPR.y=1;SPR.rowH=0;
  var g=SPR.atlas.getContext('2d');g.imageSmoothingEnabled=false;
  for(var r=0;r<SPR.inf.roles.length;r++)for(var sk=0;sk<SPR.inf.skins;sk++)for(var d=0;d<SPR.inf.dirs.length;d++)for(var p=0;p<SPR.inf.poses.length;p++){
    (function(role,skin,dir,pose){atlasAdd('inf:'+role+':'+skin+':'+dir+':'+pose,SPR.inf.w,SPR.inf.h,function(gg,x,y){spriteInfFrame(gg,x,y,role,dir,pose,skin);});})(SPR.inf.roles[r],sk,SPR.inf.dirs[d],SPR.inf.poses[p]);
  }
  for(var vf=0;vf<2;vf++)(function(fr){
    atlasAdd('truck:empty:'+fr,40,40,function(gg,x,y,w,h){spriteTruck(gg,x,y,w,h,false,fr);});
    atlasAdd('truck:loaded:'+fr,40,40,function(gg,x,y,w,h){spriteTruck(gg,x,y,w,h,true,fr);});
    atlasAdd('lighttruck:empty:'+fr,40,40,function(gg,x,y,w,h){spriteLightTruck(gg,x,y,w,h,false,fr);});
    atlasAdd('lighttruck:loaded:'+fr,40,40,function(gg,x,y,w,h){spriteLightTruck(gg,x,y,w,h,true,fr);});
    atlasAdd('jeep:empty:'+fr,40,40,function(gg,x,y,w,h){spriteJeep(gg,x,y,w,h,false,fr);});
    atlasAdd('jeep:loaded:'+fr,40,40,function(gg,x,y,w,h){spriteJeep(gg,x,y,w,h,true,fr);});
    atlasAdd('halftrack:empty:'+fr,40,40,function(gg,x,y,w,h){spriteHalftrack(gg,x,y,w,h,false,fr);});
    atlasAdd('halftrack:loaded:'+fr,40,40,function(gg,x,y,w,h){spriteHalftrack(gg,x,y,w,h,true,fr);});
  })(vf);

  atlasAdd('jeep:wreck',40,40,function(gg,x,y,w,h){spriteWreck(gg,x,y,w,h,'jeep');});
  atlasAdd('lighttruck:wreck',40,40,function(gg,x,y,w,h){spriteWreck(gg,x,y,w,h,'lighttruck');});
  atlasAdd('truck:wreck',40,40,function(gg,x,y,w,h){spriteWreck(gg,x,y,w,h,'truck');});
  atlasAdd('halftrack:wreck',40,40,function(gg,x,y,w,h){spriteWreck(gg,x,y,w,h,'halftrack');});
  atlasAdd('part:wheel',8,8,function(gg,x,y,w,h){spriteVehiclePart(gg,x,y,w,h,'wheel');});
  atlasAdd('part:track',12,7,function(gg,x,y,w,h){spriteVehiclePart(gg,x,y,w,h,'track');});
  atlasAdd('part:door',10,9,function(gg,x,y,w,h){spriteVehiclePart(gg,x,y,w,h,'door');});
  atlasAdd('part:panel',11,8,function(gg,x,y,w,h){spriteVehiclePart(gg,x,y,w,h,'panel');});
    atlasAdd('turret:jeep',32,32,function(gg,x,y,w,h){spriteTurret(gg,x,y,w,h,'jeep');});
  atlasAdd('turret:lighttruck',32,32,function(gg,x,y,w,h){spriteTurret(gg,x,y,w,h,'lighttruck');});
  atlasAdd('turret:truck',32,32,function(gg,x,y,w,h){spriteTurret(gg,x,y,w,h,'truck');});
  atlasAdd('turret:halftrack',36,36,function(gg,x,y,w,h){spriteTurret(gg,x,y,w,h,'halftrack');});
  for(var hf=0;hf<2;hf++)(function(fr){atlasAdd('heli:'+fr,76,56,function(gg,x,y,w,h){spriteHeli(gg,x,y,w,h,fr);});})(hf);
  atlasAdd('plane:0',76,54,function(gg,x,y,w,h){spritePlane(gg,x,y,w,h,0);});atlasAdd('plane:1',76,54,function(gg,x,y,w,h){spritePlane(gg,x,y,w,h,1);});
  atlasAdd('para:0',30,32,function(gg,x,y,w,h){spritePara(gg,x,y,w,h,0);});atlasAdd('para:1',30,32,function(gg,x,y,w,h){spritePara(gg,x,y,w,h,1);});
  atlasAdd('bunker',72,48,spriteBunker);atlasAdd('bunkerTurret',64,64,spriteBunkerTurret);SPR.level=gameState.levelIndex;
}
function ensureSpriteAtlas(){if(!SPR.atlas||SPR.level!==gameState.levelIndex)buildSpriteAtlas();}
function drawAtlas(name,x,y,scale,angle,alpha){ensureSpriteAtlas();var f=SPR.frames[name];if(!f)return;ctx.save();ctx.translate(Math.round(x),Math.round(y));if(angle)ctx.rotate(angle);ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=false;ctx.drawImage(SPR.atlas,f.x,f.y,f.w,f.h,Math.round(-f.w*scale/2),Math.round(-f.h*scale/2),Math.round(f.w*scale),Math.round(f.h*scale));ctx.restore();}
function spritePose(e){if(!e.alive)return e.deadT<.22?'dead1':'dead2';if(e.state==='crawl')return e.muzzle>0?'proneFire':'prone';if(e.state==='cover'||e.state==='covering'||e.state==='suppressed')return e.muzzle>0?'crouchFire':'crouch';if(e.state==='fire'){if(e.firePose==='prone')return e.muzzle>0?'proneFire':'prone';if(e.firePose==='crouch')return e.muzzle>0?'crouchFire':'crouch';return e.muzzle>0?'standFire':'idle';}if(e.state==='advance')return ['walk1','walk2','walk3','walk4'][((e.anim*3.15)|0)%4];return ((e.anim2*1.3)|0)%2?'idle2':'idle';}
function spriteDirection(e){var dx,dy;if(e.alive&&(e.state==='advance'||e.state==='crawl'||e.state==='suppressed')){var t=tacticalPoint(e);dx=t.x-e.x;dy=t.y-e.y;}else{dx=gameState.bunker.x-e.x;dy=gameState.bunker.y-e.y;}if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';return dy<0?'up':'down';}
function drawSoldier(e){
  var pose=spritePose(e),dir=spriteDirection(e),skin=Math.abs(e.variant||0)%SPR.inf.skins;
  var depth=clamp((e.y-safeTop)/(H-safeTop-safeBottom),0,1),scale=(IS_IPHONE?1.30:1.48)*(.92+depth*.11);
  var hop=e.limp>0?Math.abs(Math.sin(e.anim*2.8))*1.8*e.limp:0,xx=e.x+(e.limp>0?Math.sin(e.anim*5.6)*.8:0),yy=e.y-hop;
  ctx.save();ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();if(pose==='prone'||pose==='proneFire')ctx.ellipse(xx,yy+4,5.2,2.4,0,0,TAU);else ctx.ellipse(xx,yy+5,4.2,2.0,0,0,TAU);ctx.fill();ctx.restore();
  drawAtlas('inf:'+e.role+':'+skin+':'+dir+':'+pose,xx,yy,scale,0,e.alive?1:clamp(1-e.deadT/7,.32,1));
}
function drawVehicle(v,wreck){
  var type=v.type||'truck',body=v.bodyAngle==null?Math.PI/2:v.bodyAngle;
  var scale=type==='jeep'?.86:type==='lighttruck'?.94:type==='halftrack'?1.06:1.03;
  if(wreck){
    drawAtlas(type+':wreck',v.x,v.y,scale,body,.94);
    ctx.save();ctx.globalAlpha=.30;ctx.fillStyle='#101210';ctx.beginPath();ctx.ellipse(v.x+2,v.y+5,type==='halftrack'?15:12,type==='halftrack'?8:6,body,0,TAU);ctx.fill();ctx.restore();
    return;
  }
  var loaded=(v.passengers||0)>0,frame=(((v.wheelT||0)*1.7)|0)&1;
  drawAtlas(type+':'+(loaded?'loaded':'empty')+':'+frame,v.x,v.y,scale,body,1);
  if(v.hasMG){
    var recoil=(v.turretRecoil||0)*3,tx=v.x-Math.cos(v.turretAngle)*recoil,ty=v.y-Math.sin(v.turretAngle)*recoil;
    drawAtlas('turret:'+type,tx,ty,type==='halftrack'?1:.88,v.turretAngle,1);
  }
  if(v.hitFlash>0){
    ctx.save();ctx.globalAlpha=clamp(v.hitFlash/.10,0,.42);ctx.fillStyle='#fff2b0';ctx.beginPath();ctx.ellipse(v.x,v.y,type==='halftrack'?18:14,type==='halftrack'?13:10,body,0,TAU);ctx.fill();ctx.restore();
  }
  if(v.hp!=null&&v.hp/v.maxHp<.38){ctx.save();ctx.globalAlpha=.78;ctx.fillStyle='#f07a32';ctx.beginPath();ctx.arc(v.x-2,v.y-3,3.5+(1-v.hp/v.maxHp)*2.2,0,TAU);ctx.fill();ctx.restore();}
}
function drawHeli(a){drawAtlas('heli:'+(((a.rotor*1.2)|0)&1),a.x,a.y,1,0,1);}
function drawPlane(a){drawAtlas('plane:'+(a.fromLeft?0:1),a.x,a.y,1,0,1);}
function drawPara(p){drawAtlas('para:'+(((p.phase*1.3)|0)&1),p.x,p.y,1,0,1);}
/* ---------- RENDER: EFFECTS / PLAYER ---------- */

function drawEffects(){
  for(var i=0;i<gameState.effects.length;i++){
    var e=gameState.effects[i],q=1-e.t/e.life;
    if(e.type==='explosion'){
      var rr=e.r*(.28+.95*(1-q));ctx.globalAlpha=q;ctx.fillStyle=e.variant===0?'rgba(255,142,43,.26)':e.variant===1?'rgba(226,83,38,.24)':'rgba(255,194,68,.26)';ctx.beginPath();ctx.arc(e.x,e.y,rr,0,TAU);ctx.fill();
      ctx.strokeStyle='#f4c65f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,rr*.72,0,TAU);ctx.stroke();
      ctx.globalAlpha=q*.75;ctx.fillStyle='#fff0a0';ctx.beginPath();ctx.arc(e.x-2,e.y-2,rr*.28,0,TAU);ctx.fill();
    }else if(e.type==='fireball'){
      var fr=e.r*(.55+.78*(1-q));ctx.globalAlpha=q;ctx.fillStyle=e.variant===0?'#ff9e32':e.variant===1?'#ff6435':'#ffc348';ctx.beginPath();ctx.arc(e.x,e.y,fr,0,TAU);ctx.fill();
      ctx.globalAlpha=q*.80;ctx.fillStyle='#fff3a0';ctx.beginPath();ctx.arc(e.x-2,e.y-2,fr*.42,0,TAU);ctx.fill();
    }else if(e.type==='smoke'){
      ctx.globalAlpha=q*(.16+.22*e.shade);ctx.fillStyle=e.shade>.6?'#171a17':'#30332e';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();
    }else if(e.type==='flame'){
      ctx.globalAlpha=q;ctx.fillStyle=e.shade>.55?'#ffcf4d':'#ff6e2d';ctx.beginPath();ctx.moveTo(e.x,e.y-e.r*1.25);ctx.quadraticCurveTo(e.x+e.r,e.y,e.x,e.y+e.r*.5);ctx.quadraticCurveTo(e.x-e.r,e.y,e.x,e.y-e.r*1.25);ctx.fill();
      ctx.globalAlpha=q*.8;ctx.fillStyle='#fff09a';ctx.beginPath();ctx.arc(e.x,e.y,e.r*.35,0,TAU);ctx.fill();
    }else if(e.type==='muzzle'){
      ctx.globalAlpha=q;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.fillStyle='#ffd85a';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(e.r,0);ctx.lineTo(e.r*.45,e.r*.28);ctx.lineTo(e.r*.68,0);ctx.lineTo(e.r*.45,-e.r*.28);ctx.closePath();ctx.fill();ctx.restore();
    }else if(e.type==='debris'){
      ctx.globalAlpha=q;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.rot);ctx.fillStyle=gameState.map.palette.rock;ctx.fillRect(-e.size/2,-e.size/2,e.size,e.size*.65);ctx.restore();
    }else if(e.type==='casing'){
      ctx.globalAlpha=q;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.rot);ctx.fillStyle='#d8b45e';ctx.fillRect(-1,-.5,2,1);ctx.restore();
    }else if(e.type==='vehiclePart'){
      drawAtlas('part:'+e.part,e.x,e.y,e.scale||1,e.rot,q);
    }else if(e.type==='impactFlash'){
      ctx.globalAlpha=q*.9;ctx.fillStyle='#fff1a8';ctx.beginPath();ctx.arc(e.x,e.y,e.r*(1.1-q*.3),0,TAU);ctx.fill();
    }else if(e.type==='ember'){
      ctx.globalAlpha=q;ctx.fillStyle='#ffb43b';ctx.fillRect(e.x-1,e.y-1,2,2);
    }else if(e.type==='blood'){
      ctx.globalAlpha=q*.95;ctx.fillStyle=e.shade===1?'#9a302c':e.shade===2?'#5f181b':'#7b2223';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();
    }else if(e.type==='spark'){
      ctx.globalAlpha=q;ctx.strokeStyle='#ffe176';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x-e.vx*.025,e.y-e.vy*.025);ctx.stroke();
    }else if(e.type==='gunSpark'){
      ctx.globalAlpha=q;ctx.strokeStyle='#fff0a0';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x-e.vx*.035,e.y-e.vy*.035);ctx.stroke();
    }else if(e.type==='heTrail'){
      ctx.globalAlpha=q*.42;ctx.fillStyle='#3e3a31';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();
    }else if(e.type==='dust'){
      ctx.globalAlpha=q*.15;ctx.fillStyle=gameState.map.palette.roadEdge;ctx.beginPath();ctx.ellipse(e.x,e.y,e.r*1.8,e.r,0,0,TAU);ctx.fill();
    }else if(e.type==='damage'){
      ctx.globalAlpha=q;ctx.font='800 9px system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillStyle='#f4e7b5';ctx.fillText(e.text,e.x,e.y);
    }else if(e.type==='hit'){
      ctx.globalAlpha=q;ctx.strokeStyle='#f2d584';ctx.beginPath();ctx.moveTo(e.x-5,e.y);ctx.lineTo(e.x+5,e.y);ctx.moveTo(e.x,e.y-5);ctx.lineTo(e.x,e.y+5);ctx.stroke();
    }else if(e.type==='rope'){
      ctx.globalAlpha=q*.65;ctx.strokeStyle='#c6bd9a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(e.x-8,e.y);ctx.lineTo(e.x-8,e.y+38);ctx.moveTo(e.x+8,e.y);ctx.lineTo(e.x+8,e.y+38);ctx.stroke();
    }else if(e.type==='chute'){
      ctx.globalAlpha=q*.3;ctx.strokeStyle=gameState.map.palette.line;ctx.beginPath();ctx.arc(e.x,e.y,14,Math.PI,TAU);ctx.stroke();
    }
  }
  ctx.globalAlpha=1;ctx.textAlign='left';
}
function drawShots(){
  for(var i=0;i<gameState.shots.length;i++){
    var b=gameState.shots[i];
    if(b.kind==='mg'){
      ctx.strokeStyle='rgba(255,210,77,.34)';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();
      ctx.strokeStyle='#fff1a0';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();
    }else{
      var z=b.z||0,pz=b.pz||0;
      ctx.globalAlpha=.22;ctx.fillStyle='#161713';ctx.beginPath();ctx.ellipse(b.x,b.y,4.3,2.2,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(255,119,37,.24)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(b.px,b.py-pz);ctx.lineTo(b.x,b.y-z);ctx.stroke();
      ctx.fillStyle='#f3b14b';ctx.strokeStyle='#fff0a0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.x,b.y-z,3.1,0,TAU);ctx.fill();ctx.stroke();
    }
  }
  ctx.globalAlpha=1;
  for(i=0;i<gameState.enemyShots.length;i++){
    b=gameState.enemyShots[i];
    ctx.strokeStyle=b.kind==='grenade'?'#d88742':'rgba(255,224,152,.42)';ctx.lineWidth=b.kind==='grenade'?2:2.6;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();
    if(b.kind!=='grenade'){ctx.strokeStyle='rgba(255,244,194,.82)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();}
  }
}
function drawBunker(){
  var b=gameState.bunker;drawAtlas('bunker',b.x,b.y,1,0,1);drawAtlas('bunkerTurret',b.x,b.y-2,1,b.angle,1);
}
function drawCrosshair(){
  if(gameState.mode!=='playing')return;
  ctx.save();ctx.translate(gameState.aim.x,gameState.aim.y);ctx.strokeStyle=gameState.hitMarker>0?'rgba(255,221,124,.98)':'rgba(245,236,196,.74)';ctx.lineWidth=gameState.hitMarker>0?1.8:1;
  var bloom=7+gameState.heat*5;ctx.beginPath();ctx.arc(0,0,bloom,0,TAU);ctx.moveTo(-12-gameState.heat*3,0);ctx.lineTo(-5,0);ctx.moveTo(5,0);ctx.lineTo(12+gameState.heat*3,0);ctx.moveTo(0,-12-gameState.heat*3);ctx.lineTo(0,-5);ctx.moveTo(0,5);ctx.lineTo(0,12+gameState.heat*3);ctx.stroke();
  if(gameState.hitMarker>0){ctx.beginPath();ctx.moveTo(-5,-5);ctx.lineTo(-2,-2);ctx.moveTo(5,-5);ctx.lineTo(2,-2);ctx.moveTo(-5,5);ctx.lineTo(-2,2);ctx.moveTo(5,5);ctx.lineTo(2,2);ctx.stroke();}
  ctx.restore();
}
function effColor(){return gameState.eff>=.86?'#5fcf79':gameState.eff>=.70?'#a0c45a':gameState.eff>=.50?'#d7c451':gameState.eff>=.30?'#df9342':'#d84c48';}
function drawHud(){
  var top=safeTop+8,bottom=H-safeBottom-16,L=level();
  ctx.save();ctx.fillStyle='rgba(18,22,16,.73)';ctx.fillRect(8,top,W-16,52);
  ctx.font='800 11px system-ui,-apple-system,sans-serif';ctx.textBaseline='middle';ctx.fillStyle='#eee8d2';ctx.fillText('HP '+Math.max(0,Math.round(gameState.bunker.hp))+'/'+Math.round(gameState.bunker.maxHp),17,top+15);
  ctx.textAlign='center';ctx.fillStyle=effColor();ctx.fillText('EFF '+Math.round(gameState.eff*100)+'%',W*.5,top+15);
  ctx.textAlign='right';ctx.fillStyle='#eee8d2';ctx.fillText('KILLS '+(gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills),W-17,top+15);
  ctx.textAlign='left';ctx.font='700 9px system-ui,-apple-system,sans-serif';ctx.fillStyle='#aeb3a0';ctx.fillText('MAP '+(gameState.levelIndex+1)+'/15 · '+L.name.toUpperCase(),17,top+36);
  ctx.textAlign='right';ctx.fillText('ZONE '+(L.zone+1)+'/5 · '+(L.stage+1)+'/3',W-17,top+36);
  var barX=W*.5-48,barY=top+31,bw=96;ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(barX,barY,bw,8);ctx.fillStyle=effColor();ctx.fillRect(barX,barY,bw*gameState.eff,8);
  ctx.fillStyle='rgba(18,22,16,.73)';ctx.fillRect(12,bottom-34,W-24,28);ctx.textAlign='left';ctx.font='800 9px system-ui,-apple-system,sans-serif';ctx.fillStyle=gameState.overheat?'#db5a4c':'#d6d5c0';ctx.fillText(gameState.overheat?'BARREL HOT':'HEAT',20,bottom-20);
  ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(65,bottom-24,W-92,8);ctx.fillStyle=gameState.heat>.75?'#dd7447':'#c7aa55';ctx.fillRect(65,bottom-24,(W-92)*gameState.heat,8);
  if(gameState.pointer.down){var hold=(performance.now()-gameState.pointer.t0)/1000*gameState.profile.chargeScale,charge=clamp(hold/HE_HOLD,0,1),label=gameState.pointer.heFired?'HE FIRED':hold<.16?'MG TAP':'HE CHARGE';ctx.textAlign='right';ctx.fillStyle=hold<.16?'#d7cfad':'#ee9c4b';ctx.fillText(label,W-20,bottom-20);ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(W-88,bottom-10,68,4);ctx.fillStyle='#ee9c4b';ctx.fillRect(W-88,bottom-10,68*charge,4);}
  if(gameState.streak>1&&gameState.streakT>0){ctx.textAlign='left';ctx.fillStyle='#e8cf72';ctx.fillText('STREAK '+gameState.streak,20,bottom-7);}
  if(gameState.messageT>0){var my=top+62;ctx.font='900 12px system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(21,25,18,.80)';ctx.fillRect(W*.5-110,my,220,26);ctx.fillStyle='#ead88f';ctx.fillText(gameState.message,W*.5,my+13);}
  ctx.restore();
}
/* ---------- RENDER ---------- */

function render(){
  if(!gameState)return;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  var shake=gameState.shake||0,sx=shake?rand(-shake,shake):0,sy=shake?rand(-shake,shake):0;
  ctx.save();ctx.translate(sx,sy);
  drawMap();

  var i,v,e,a,p;
  for(i=0;i<gameState.vehicles.length;i++){v=gameState.vehicles[i];if(v.alive&&v.x>-80&&v.x<W+80&&v.y>-90&&v.y<H+90)drawVehicle(v,false);}
  for(i=0;i<gameState.infantry.length;i++){e=gameState.infantry[i];if(e.x>-40&&e.x<W+40&&e.y>-50&&e.y<H+50)drawSoldier(e);}
  for(i=0;i<gameState.air.length;i++){a=gameState.air[i];if(a.alive&&a.x>-110&&a.x<W+110&&a.y>-110&&a.y<H+110){if(a.type==='heli')drawHeli(a);else drawPlane(a);}}
  for(i=0;i<gameState.paras.length;i++){p=gameState.paras[i];if(p.alive)drawPara(p);}
  drawShots();drawEffects();drawBunker();
  ctx.restore();

  if((gameState.screenFlash||0)>0){
    ctx.globalAlpha=gameState.screenFlash;ctx.fillStyle='#ffb04a';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
  }
  drawCrosshair();drawHud();
}
/* ---------- RESIZE / LOOP ---------- */

function resize(){
  readSafe();DPR=Math.min(window.devicePixelRatio||1,DEVICE.dprCap);W=Math.max(320,innerWidth);H=Math.max(480,innerHeight);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);
  if(gameState){gameState.bunker.x=W*.5;gameState.bunker.y=H-Math.max(72,safeBottom+52);buildMap();}
}
addEventListener('resize',resize,{passive:true});

function loop(ts){
  var dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;acc+=dt;
  var step=1/60,n=0;
  while(acc>=step&&n<3){if(gameState&&gameState.mode==='playing')update(step);acc-=step;n++;}
  if(n===3&&acc>step*2)acc=0;
  render();requestAnimationFrame(loop);
}

/* ---------- START ---------- */

resize();
gameState=freshState();
gameState.profile=playerProfile();
gameState.bunker.maxHp=gameState.profile.maxHp;gameState.bunker.hp=gameState.profile.maxHp;
buildMap();
requestAnimationFrame(loop);

window.addEventListener('error',function(e){
  try{
    var box=document.createElement('div');
    box.style.cssText='position:fixed;left:8px;right:8px;bottom:78px;z-index:9999;background:#651d1d;color:#fff;padding:8px;font:11px monospace';
    box.textContent='JBD V8 ERROR: '+(e.message||'unknown');document.body.appendChild(box);
  }catch(_){}
});

})();