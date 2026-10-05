(function(){
'use strict';

/* =========================
   JBD V8.3.12 ATARI ST EDITION
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

var ST_MODE=true;
var ST_PAL=['#000000','#242424','#244924','#496d49','#6d6d49','#926d49','#6d4924','#496d6d','#6d9292','#929292','#b6b692','#dbdbb6','#ffffff','#b64924','#db6d24','#dbb624'];

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
  jungle:{ground:'#496d49',ground2:'#244924',road:'#926d49',roadEdge:'#6d4924',line:'#242424',veg:'#244924',veg2:'#496d49',building:'#6d6d49',roof:'#6d4924',rock:'#6d6d49',trench:'#6d4924'},
  desert:{ground:'#b6b692',ground2:'#926d49',road:'#926d49',roadEdge:'#6d4924',line:'#242424',veg:'#6d6d49',veg2:'#926d49',building:'#926d49',roof:'#6d4924',rock:'#929292',trench:'#6d4924'},
  polar:{ground:'#dbdbb6',ground2:'#b6b692',road:'#929292',roadEdge:'#6d6d49',line:'#242424',veg:'#496d6d',veg2:'#6d9292',building:'#929292',roof:'#496d6d',rock:'#929292',trench:'#6d6d49'},
  village:{ground:'#6d6d49',ground2:'#496d49',road:'#926d49',roadEdge:'#6d4924',line:'#242424',veg:'#244924',veg2:'#496d49',building:'#926d49',roof:'#6d4924',rock:'#6d6d49',trench:'#6d4924'},
  industrial:{ground:'#6d6d49',ground2:'#494924',road:'#929292',roadEdge:'#496d6d',line:'#242424',veg:'#244924',veg2:'#496d49',building:'#6d6d49',roof:'#242424',rock:'#929292',trench:'#242424'}
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
function nearestST(h){
  if(!ST_MODE)return h;
  var C=hexRgb(h),best=ST_PAL[0],bd=1e9;
  for(var i=0;i<ST_PAL.length;i++){
    var P0=hexRgb(ST_PAL[i]),dr=C.r-P0.r,dg=C.g-P0.g,db=C.b-P0.b,d=dr*dr+dg*dg+db*db;
    if(d<bd){bd=d;best=ST_PAL[i];}
  }
  return best;
}
function mixHex(a,b,t){var A=hexRgb(a),B=hexRgb(b);return nearestST(rgbHex(A.r+(B.r-A.r)*t,A.g+(B.g-A.g)*t,A.b+(B.b-A.b)*t));}
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
  var bendX=roadX+(rng()-.5)*70;
  var junctionY=H*(.32+rng()*.10);
  var compound={x:W*(rng()<.5?.24:.76),y:H*(.34+rng()*.14),w:70+rng()*18,h:42+rng()*12};
  var patches=[],cover=[],decor=[],trees=[],rocks=[],surface=[];
  for(var i=0;i<9;i++)patches.push({x:rng()*W,y:safeTop+75+rng()*(H-safeTop-safeBottom-205),rx:40+rng()*85,ry:20+rng()*48,rot:rng()*TAU,a:.028+rng()*.038});

  var coverSets={
    jungle:[{kind:'sandbag',sprites:['sandbagStraight','sandbagCurve']},{kind:'log',sprites:['logPile','timberPile']},{kind:'crate',sprites:['crateStack','palletCargo']},{kind:'rubble',sprites:['boulder1','rubbleConcrete']},{kind:'bush',sprites:['bush1','bush2','bush3']}],
    desert:[{kind:'sandbag',sprites:['sandbagStraight','sandbagCurve']},{kind:'crate',sprites:['crateStack','palletCargo']},{kind:'rubble',sprites:['boulder2','rubbleConcrete']},{kind:'lowwall',sprites:['rubbleWall','sandbagCurve']},{kind:'barrel',sprites:['barrelStack','jerryStack']}],
    polar:[{kind:'sandbag',sprites:['sandbagStraight','sandbagCurve']},{kind:'crate',sprites:['crateStack','palletCargo']},{kind:'rubble',sprites:['boulder1','boulder2']},{kind:'lowwall',sprites:['rubbleWall','timberPile']},{kind:'snowbank',sprites:['sandbagCurve','boulder3']}],
    village:[{kind:'lowwall',sprites:['rubbleWall','sandbagStraight']},{kind:'crate',sprites:['crateStack','palletCargo']},{kind:'fence',sprites:['wireFence','woodFence']},{kind:'sandbag',sprites:['sandbagCurve','sandbagStraight']},{kind:'rubble',sprites:['rubbleBrick','rubbleConcrete']}],
    industrial:[{kind:'crate',sprites:['crateStack','palletCargo']},{kind:'rubble',sprites:['rubbleConcrete','rubbleBrick']},{kind:'lowwall',sprites:['rubbleWall','steelDebris']},{kind:'barrel',sprites:['barrelStack','jerryStack']},{kind:'pipe',sprites:['wireFence','steelDebris']}]
  }[L.theme];

  var coverCount=IS_IPHONE?15:18,cid=1;
  for(i=0;i<coverCount;i++){
    var row=i%5,cy=safeTop+112+row*((H-safeTop-safeBottom-275)/4)+(rng()-.5)*38;
    var cx=23+rng()*(W-46);
    if(Math.abs(cx-roadX)<21)cx=clamp(cx+(cx<roadX?-1:1)*(30+rng()*26),24,W-24);
    var set=coverSets[(rng()*coverSets.length)|0];
    cover.push({id:cid++,x:cx,y:cy,kind:set.kind,sprite:set.sprites[(rng()*set.sprites.length)|0],len:14+rng()*24,rot:(rng()-.5)*1.15,r:5+rng()*5,variant:(rng()*4)|0});
  }

  var treeCount=L.theme==='jungle'?13:L.theme==='village'?9:L.theme==='industrial'?5:L.theme==='desert'?4:7;
  for(i=0;i<treeCount;i++)trees.push({x:22+rng()*(W-44),y:safeTop+86+rng()*(H-safeTop-safeBottom-250),r:5+rng()*7,variant:(rng()*5)|0,dead:L.theme==='industrial'&&rng()<.35});
  for(i=0;i<7;i++)rocks.push({x:24+rng()*(W-48),y:safeTop+92+rng()*(H-safeTop-safeBottom-270),r:3+rng()*5,variant:(rng()*5)|0});

  var detailTypes={
    jungle:['branchPile','logPile','woodFence','crateStack','jerryStack','stump','deadTree','bush1','bush2','bush3','hedgehog'],
    desert:['rubbleBrick','rubbleConcrete','crateStack','barrelStack','jerryStack','sandbagStraight','wireFence','hedgehog','roadBarrier'],
    polar:['crateStack','timberPile','boulder3','wireFence','roadBarrier','deadTree','stump'],
    village:['woodFence','crateStack','palletCargo','barrelStack','roadBarrier','signpost','timberPile','cartWheel','rubbleBrick'],
    industrial:['barrelStack','jerryStack','palletCargo','steelDebris','wireFence','roadBarrier','rubbleConcrete','rubbleBrick','cartWheel']
  }[L.theme];
  var decorCount=IS_IPHONE?16:22;
  for(i=0;i<decorCount;i++){
    var dx=22+rng()*(W-44),dy=safeTop+92+rng()*(H-safeTop-safeBottom-255);
    if(Math.abs(dx-roadX)<17&&rng()<.68)dx=clamp(dx+(dx<roadX?-1:1)*(24+rng()*18),22,W-22);
    decor.push({x:dx,y:dy,type:detailTypes[(rng()*detailTypes.length)|0],rot:(rng()-.5)*1.35,s:.58+rng()*.50});
  }

  var surfaceTypes=L.theme==='desert'?['trackStraight','trackCurve','gravel','scorch1','scorch2']:
                   L.theme==='industrial'?['trackStraight','trackCurve','gravel','scorch1','scorch2','debrisPatch']:
                   ['trackStraight','trackCurve','gravel','mudPatch','scorch1'];
  var surfaceCount=IS_IPHONE?12:17;
  for(i=0;i<surfaceCount;i++)surface.push({x:18+rng()*(W-36),y:safeTop+88+rng()*(H-safeTop-safeBottom-245),type:surfaceTypes[(rng()*surfaceTypes.length)|0],rot:rng()*TAU,s:.55+rng()*.68,a:.22+rng()*.28});

  gameState.map={palette:p,units:unitPalette(p),road:{x:roadX,bendX:bendX,junctionY:junctionY},compound:compound,patches:patches,cover:cover,decor:decor,trees:trees,rocks:rocks,surface:surface};
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
    zigPhase:rand(0,TAU),zigT:0,wheelT:Math.random()*10,avoidWreck:null,avoidSide:0,avoidT:0,resumeState:null
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
function vehicleBodyRadius(v){
  return v.type==='halftrack'?18:v.type==='truck'?17:v.type==='lighttruck'?15:13;
}
function wreckBodyRadius(w){
  return w.type==='halftrack'?19:w.type==='truck'?18:w.type==='lighttruck'?16:14;
}
function wreckAhead(v){
  var best=null,bestScore=9999,vr=vehicleBodyRadius(v);
  for(var i=0;i<gameState.wrecks.length;i++){
    var w=gameState.wrecks[i],dx=w.x-v.x,dy=w.y-v.y,wr=wreckBodyRadius(w);
    // normal travel is mainly downward; only react to wrecks in the immediate forward corridor
    if(dy<-10||dy>68)continue;
    if(Math.abs(dx)>vr+wr+13)continue;
    var score=dy+Math.abs(dx)*.42;
    if(score<bestScore){best=w;bestScore=score;}
  }
  return best;
}
function chooseWreckSide(v,w){
  var margin=32,need=vehicleBodyRadius(v)+wreckBodyRadius(w)+10;
  var leftSpace=w.x-need-margin,rightSpace=W-margin-(w.x+need);
  if(leftSpace<18&&rightSpace>=18)return 1;
  if(rightSpace<18&&leftSpace>=18)return -1;
  if(Math.abs(v.x-w.x)>8)return v.x<w.x?-1:1;
  return leftSpace>rightSpace?-1:1;
}
function beginWreckAvoid(v,w){
  if(v.state==='reverseWreck'||v.state==='evadeWreck')return;
  v.resumeState=v.state;
  v.avoidWreck=w;
  v.avoidSide=chooseWreckSide(v,w);
  v.avoidT=rand(.48,.72);
  v.state='reverseWreck';
  v.currentSpeed=Math.min(v.currentSpeed,v.speed*.28);
}
function clearWreckAvoid(v){
  v.avoidWreck=null;v.avoidT=0;
  var rs=v.resumeState;
  v.resumeState=null;
  if(rs==='toShoulder'&&v.behavior!=='dismount')rs='depart';
  if(rs==='approachStop'||rs==='firestop')rs='road';
  v.state=rs||'road';
}
function updateVehicles(dt){
  gameState.dtForVehicle=dt;
  for(var i=0;i<gameState.vehicles.length;i++){
    var v=gameState.vehicles[i];if(!v.alive)continue;
    v.smoke=Math.max(0,v.smoke-dt);v.dustCd-=dt;v.unloadCd-=dt;v.hitFlash=Math.max(0,(v.hitFlash||0)-dt);
    if(v.zigT!=null)v.zigT+=dt;v.wheelT+=dt*Math.max(1,v.currentSpeed*.16);updateVehicleDamageParticles(v,dt);
    var turretState=updateVehicleTurret(v,dt);

    // Never drive through a wreck. Moving vehicles detect the nearest obstruction first.
    if(v.state!=='reverseWreck'&&v.state!=='evadeWreck'&&v.state!=='firestop'&&v.state!=='unload'&&v.state!=='support'){
      var block=wreckAhead(v);
      if(block)beginWreckAvoid(v,block);
    }

    if(v.state==='reverseWreck'){
      var rw=v.avoidWreck;
      if(!rw){clearWreckAvoid(v);}
      else{
        v.avoidT-=dt;
        v.currentSpeed=approachValue(v.currentSpeed,v.speed*.30,v.accel*dt);
        // reverse and turn nose toward the chosen escape side
        v.y-=v.currentSpeed*.58*dt;
        v.x+=v.avoidSide*v.currentSpeed*.18*dt;
        var reverseAngle=Math.atan2(-1,v.avoidSide*.42);
        v.bodyAngle=approachAngle(v.bodyAngle,reverseAngle,dt*v.turnRate*.85);
        if(v.avoidT<=0||dist(v.x,v.y,rw.x,rw.y)>54){
          v.state='evadeWreck';
          v.avoidT=rand(.95,1.35);
          v.currentSpeed=0;
        }
      }
    }else if(v.state==='evadeWreck'){
      var ew=v.avoidWreck;
      if(!ew){clearWreckAvoid(v);}
      else{
        v.avoidT-=dt;
        v.currentSpeed=approachValue(v.currentSpeed,v.speed*.54,v.accel*.85*dt);
        var clearance=vehicleBodyRadius(v)+wreckBodyRadius(ew)+13;
        var targetX=clamp(ew.x+v.avoidSide*clearance,24,W-24);
        var dxAvoid=targetX-v.x;
        var sideVel=clamp(dxAvoid*.95,-v.currentSpeed*.72,v.currentSpeed*.72);
        v.x+=sideVel*dt;
        v.y+=v.currentSpeed*.58*dt;
        v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(v.currentSpeed*.58,sideVel||.001),dt*v.turnRate);
        // once the wreck is safely behind, return to the planned route
        if(v.y>ew.y+wreckBodyRadius(ew)+20 || (dist(v.x,v.y,ew.x,ew.y)>58&&v.avoidT<=0)){
          clearWreckAvoid(v);
        }
      }
    }else if(v.state==='road'){
      v.currentSpeed=approachValue(v.currentSpeed,v.speed,v.accel*dt);
      var targetX=gameState.map.road.x+Math.sin(v.zigT*v.zigFreq+v.zigPhase)*v.zigAmp;
      var sideVelRoad=clamp((targetX-v.x)*.50,-v.currentSpeed*.20,v.currentSpeed*.20);
      v.x+=sideVelRoad*dt;v.y+=v.currentSpeed*DEVICE.enemySpeed*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(v.currentSpeed,sideVelRoad||.001),dt*v.turnRate);
      if(v.y>=v.contactY){v.state='approachStop';v.stopT=rand(.30,.48);}
    }else if(v.state==='approachStop'){
      v.currentSpeed=approachValue(v.currentSpeed,0,v.accel*1.45*dt);
      v.y+=v.currentSpeed*.35*dt;v.stopT-=dt;
      if(v.stopT<=0&&v.currentSpeed<4){v.state='firestop';v.currentSpeed=0;v.stopBursts=Math.floor(rand(2,4));v.fireCd=.05;}
    }else if(v.state==='firestop'){
      vehicleMG(v,turretState);
      if(v.stopBursts<=0&&v.fireCd<.25){
        if(v.behavior==='dismount')v.state='toShoulder';
        else v.state='depart';
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
  if(c.kind==='lowwall'||c.kind==='log'||c.kind==='fence')return Math.max(7,c.len*.44);
  if(c.kind==='bush'||c.kind==='scrub'||c.kind==='snowbank')return Math.max(5,c.r||6);
  if(c.kind==='crate'||c.kind==='barrel')return 8;
  if(c.kind==='rubble')return 9;
  return 7;
}
function coverHeight(c){
  if(c.kind==='fence')return 4;
  if(c.kind==='sandbag'||c.kind==='log'||c.kind==='lowwall'||c.kind==='snowbank')return 6;
  if(c.kind==='crate'||c.kind==='barrel'||c.kind==='pipe')return 8;
  if(c.kind==='rubble')return 7;
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
  if((b.bounces||0)>0)return false;
  var chance=v.type==='halftrack'?.08:v.type==='truck'?.04:v.type==='lighttruck'?.025:.012;
  chance+=grazing>.72?.12:grazing>.55?.05:0;
  if(Math.random()>=chance)return false;
  var a=Math.atan2(b.vy,b.vx)+(Math.random()<.5?-1:1)*rand(.34,.62),sp=Math.hypot(b.vx,b.vy)*rand(.48,.60);
  b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;b.damage*=.46;b.radius*=.78;
  b.bounces=1;b.ignoreVehicle=v.id;b.arcStart=b.traveled;b.arcEnd=b.traveled+rand(45,75);b.targetDist=b.arcEnd;b.arcHeight*=.48;
  for(var i=0;i<(IS_IPHONE?3:5);i++)pushEffect({type:'spark',x:b.x,y:b.y,vx:rand(-82,82),vy:rand(-72,28),t:0,life:rand(.13,.28)});
  pushEffect({type:'impactFlash',x:b.x,y:b.y,r:7,t:0,life:.08});AudioSys.tone('metal',.62);
  gameState.message='RICOCHET';gameState.messageT=.16;
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
  ctx.save();ctx.lineCap='square';ctx.lineJoin='miter';
  ctx.strokeStyle=p.line;ctx.lineWidth=31;ctx.beginPath();ctx.moveTo(r.x,safeTop-25);ctx.quadraticCurveTo(r.bendX,r.junctionY,W*.5,gameState.bunker.y-55);ctx.stroke();
  ctx.strokeStyle=p.roadEdge;ctx.lineWidth=27;ctx.stroke();
  ctx.strokeStyle=p.road;ctx.lineWidth=23;ctx.stroke();
  ctx.strokeStyle=tone(p.road,.22);ctx.lineWidth=1;ctx.setLineDash([5,7]);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=tone(p.road,-.15);ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(r.x-6,safeTop-25);ctx.quadraticCurveTo(r.bendX-6,r.junctionY,W*.5-6,gameState.bunker.y-55);ctx.stroke();
  ctx.beginPath();ctx.moveTo(r.x+6,safeTop-25);ctx.quadraticCurveTo(r.bendX+6,r.junctionY,W*.5+6,gameState.bunker.y-55);ctx.stroke();
  ctx.restore();
}
function drawPatch(q,p){
  ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.globalAlpha=q.a*1.35;ctx.fillStyle=p.ground2;ctx.beginPath();ctx.ellipse(0,0,q.rx,q.ry,0,0,TAU);ctx.fill();ctx.restore();
}
function drawEnvSprite(name,x,y,scale,rot,alpha){drawAtlas('env:'+name,x,y,scale||1,rot||0,alpha==null?1:alpha);}
function drawTree(t,p){if(t.dead){drawEnvSprite(t.variant%2?'deadTree':'stump',t.x,t.y,.70+t.r*.035,t.variant*.2,1);return;}drawEnvSprite('bush'+(1+(t.variant%3)),t.x,t.y,(t.r/7.8)*.84,t.variant*.18,1);if(t.r>9)drawEnvSprite('bush2',t.x+2,t.y-3,(t.r/9)*.52,-.15,.90);}
function drawRock(r,p){drawEnvSprite('boulder'+(1+(r.variant%3)),r.x,r.y,.50+r.r*.060,r.variant*.34,1);}
function drawDecor(d,p){drawEnvSprite(d.type,d.x,d.y,d.s,d.rot,.96);}
function drawCover(c,p){drawEnvSprite(c.sprite||'sandbagStraight',c.x,c.y,.68+Math.min(.30,(c.len||12)/65),c.rot,1);}
function drawCompound(){var c=gameState.map.compound,name=level().theme==='industrial'?'ruinCompound':level().stage===2?'fieldBunker':'supplyCompound';drawEnvSprite(name,c.x,c.y,name==='supplyCompound'?.40:.37,0,1);}
function drawGroundTexture(){var p=gameState.map.palette,step=36,name=level().theme==='desert'?'groundSand':level().theme==='industrial'?'groundRubble':level().theme==='polar'?'groundPale':'groundGrass';for(var y=-step;y<H+step;y+=step)for(var x=-step;x<W+step;x+=step){var alt=((x/step+y/step)|0)&1;drawEnvSprite(name,x+step*.5,y+step*.5,1,alt?Math.PI:0,.46);}}
function drawSurface(){var a=gameState.map.surface||[];for(var i=0;i<a.length;i++){var d=a[i];drawEnvSprite(d.type,d.x,d.y,d.s,d.rot,d.a);}}
function drawCrater(c,p){drawEnvSprite(c.r>8?'crater2':'crater1',c.x,c.y,.52+(c.r/22),c.rot||0,.68);}
function drawBlood(b){var n=b.r>5?'blood3':b.shade===1?'blood2':'blood1';drawEnvSprite(n,b.x,b.y,.40+b.r*.055,b.rot||0,.76);}
function drawArcadeGroundDetail(p){ctx.save();ctx.globalAlpha=.10;ctx.fillStyle=tone(p.ground2,-.12);for(var i=0;i<24;i++){var x=(i*113+level().seed*17)%W,y=safeTop+70+((i*149+level().seed*11)%Math.max(120,H-safeTop-safeBottom-165));ctx.fillRect(x,y,i%5?1:2,1);}ctx.restore();}

function drawMap(){
  var m=gameState.map,p=m.palette;ctx.fillStyle=p.ground;ctx.fillRect(0,0,W,H);drawGroundTexture();drawSurface();
  for(var i=0;i<m.patches.length;i++)drawPatch(m.patches[i],p);pathRoad();drawCompound();
  for(i=0;i<m.cover.length;i++)drawCover(m.cover[i],p);for(i=0;i<m.trees.length;i++)drawTree(m.trees[i],p);for(i=0;i<m.rocks.length;i++)drawRock(m.rocks[i],p);for(i=0;i<m.decor.length;i++)drawDecor(m.decor[i],p);
  drawArcadeGroundDetail(p);for(i=0;i<gameState.craters.length;i++)drawCrater(gameState.craters[i],p);for(i=0;i<gameState.blood.length;i++)drawBlood(gameState.blood[i]);for(i=0;i<gameState.wrecks.length;i++)drawVehicle(gameState.wrecks[i],true);
}
/* ---------- RENDER: INFANTRY ---------- */
/* ---------- RENDER: INFANTRY ---------- */

/* ---------- RENDER: DETAILED RUNTIME SPRITE SHEETS ---------- */
var SPR={atlas:null,frames:{},level:-1,size:1024,x:2,y:2,rowH:0,inf:{w:16,h:20,roles:['rifle','lmg','grenadier','marksman'],dirs:['down','left','right','up'],poses:['idle','idle2','walk1','walk2','walk3','walk4','standFire','crouch','crouchFire','prone','proneFire','dead1','dead2'],skins:3}};
function atlasAdd(name,w,h,draw){var pad=2;if(SPR.x+w+pad>SPR.size){SPR.x=2;SPR.y+=SPR.rowH+pad;SPR.rowH=0;}if(SPR.y+h+pad>SPR.size)throw new Error('sprite atlas full');var f={x:SPR.x,y:SPR.y,w:w,h:h};SPR.frames[name]=f;draw(SPR.atlas.getContext('2d'),f.x,f.y,w,h);SPR.x+=w+pad;SPR.rowH=Math.max(SPR.rowH,h);}
function P(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function infCols(role,skin){
  var c={
    rifle:{cloth:'#496d49',cloth2:'#6d6d49',dark:'#242424',helm:'#244924',metal:'#242424',wood:'#6d4924'},
    lmg:{cloth:'#244924',cloth2:'#496d49',dark:'#242424',helm:'#242424',metal:'#000000',wood:'#6d4924'},
    grenadier:{cloth:'#6d6d49',cloth2:'#926d49',dark:'#242424',helm:'#496d49',metal:'#242424',wood:'#6d4924'},
    marksman:{cloth:'#496d6d',cloth2:'#6d9292',dark:'#242424',helm:'#244924',metal:'#000000',wood:'#6d4924'}
  }[role];
  if(skin===1){c.cloth=tone(c.cloth,.16);c.helm=tone(c.helm,.12);}
  if(skin===2){c.cloth=tone(c.cloth,-.14);c.cloth2=tone(c.cloth2,-.10);}
  return c;
}
function infPixel(g,ox,oy,role,dir,pose,skin){var c=infCols(role,skin),fire=/Fire/.test(pose),prone=pose.indexOf('prone')===0,crouch=pose.indexOf('crouch')===0,dead=pose.indexOf('dead')===0,wf=pose==='walk1'?0:pose==='walk2'?1:pose==='walk3'?2:pose==='walk4'?3:-1;function Q(x,y,w,h,col){P(g,ox+x,oy+y,w,h,col);}
  if(dead){Q(4,8,9,6,c.cloth);Q(2,9,3,4,c.helm);Q(11,7,4,3,c.dark);Q(6,13,3,2,c.dark);Q(10,14,4,2,c.dark);Q(dir==='left'?0:12,10,4,2,c.metal);Q(3,8,1,1,'#7e2523');return;}
  if(prone){if(dir==='left'||dir==='right'){var flip=dir==='left';Q(5,8,7,5,c.cloth);Q(flip?3:11,8,3,4,c.helm);Q(6,13,3,2,c.dark);Q(10,13,3,2,c.dark);Q(flip?0:11,9,5,2,c.wood);Q(flip?0:14,9,2,2,c.metal);if(fire)Q(flip?0:15,8,1,3,'#ffd45a');}else{Q(5,6,6,8,c.cloth);Q(6,dir==='up'?4:13,4,4,c.helm);Q(4,8,2,5,c.dark);Q(10,8,2,5,c.dark);Q(dir==='up'?12:2,6,2,9,c.wood);Q(dir==='up'?13:1,5,2,3,c.metal);if(fire)Q(dir==='up'?13:1,4,2,2,'#ffd45a');}return;}
  var bob=(wf===0||wf===2)?1:0;
  if(dir==='left'||dir==='right'){var L=dir==='left';Q(6,2+bob,5,5,c.helm);Q(7,3+bob,3,2,tone(c.helm,.12));Q(5,7+bob,7,7,c.cloth);Q(6,8+bob,5,2,c.cloth2);Q(L?10:4,8+bob,2,6,c.dark);Q(6+(wf===0?-1:wf===2?1:0),14+bob,2,5,c.dark);Q(10+(wf===0?1:wf===2?-1:0),14+bob,2,5,c.dark);Q(L?1:10,9+bob,6,2,c.wood);Q(L?0:14,9+bob,3,2,c.metal);if(fire)Q(L?0:15,8+bob,1,3,'#ffd45a');}
  else{Q(6,2+bob,5,5,c.helm);Q(7,3+bob,3,2,tone(c.helm,.12));Q(4,7+bob,9,7,c.cloth);Q(6,8+bob,5,2,c.cloth2);Q(5+(wf===0?-1:wf===2?1:0),14+bob,2,5,c.dark);Q(10+(wf===0?1:wf===2?-1:0),14+bob,2,5,c.dark);var gunX=dir==='up'?12:2;Q(gunX,7+bob,2,8,c.wood);Q(gunX,dir==='up'?5:13,2,3,c.metal);if(fire)Q(gunX,dir==='up'?4:16,2,2,'#ffd45a');if(dir==='up')Q(6,7+bob,5,4,tone(c.cloth,-.12));}
  if(role==='lmg'){Q(dir==='right'?4:dir==='left'?11:12,10,2,5,c.metal);Q(7,11,4,2,'#80704e');}else if(role==='grenadier'){Q(4,10,2,2,'#85724f');Q(11,11,2,2,'#85724f');}else if(role==='marksman'){Q(dir==='right'?10:dir==='left'?2:1,8,5,1,'#111713');}if(crouch){Q(5,15,3,3,c.dark);Q(9,15,3,3,c.dark);Q(4,13,9,2,c.cloth);}
}
function vehiclePalette(){
  return {
    outline:'#000000',rubber:'#242424',track:'#242424',
    body:'#496d49',body2:'#6d6d49',body3:'#929292',
    edge:'#b6b692',shadow:'#242424',rust:'#6d4924',
    canvas:'#6d6d49',canvasLight:'#926d49',canvasDark:'#6d4924',
    glass:'#496d6d',glassHi:'#6d9292',seat:'#6d4924',
    wood:'#6d4924',mark:'#dbdbb6',hole:'#000000',
    line:'#000000',black:'#242424',metal:'#496d49',light:'#929292'
  };
}
function poly(g,pts,fill,stroke){
  g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();
  if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=1;g.stroke();}
}
function rimWheel(g,cx,cy,w,h,c,phase){
  g.fillStyle=c.outline;g.beginPath();g.ellipse(cx,cy,w*.55,h*.55,0,0,TAU);g.fill();
  g.fillStyle=c.rubber;g.beginPath();g.ellipse(cx,cy,w*.42,h*.46,0,0,TAU);g.fill();
  g.fillStyle=c.body3;g.beginPath();g.ellipse(cx,cy,w*.19,h*.21,0,0,TAU);g.fill();
  if(phase){P(g,cx-1,cy-h*.35,2,2,c.edge);}else P(g,cx-1,cy+h*.18,2,2,c.edge);
}
function balkenCross(g,cx,cy,s,c){
  P(g,cx-s*.42,cy-s*.12,s*.84,s*.24,c.outline);P(g,cx-s*.12,cy-s*.42,s*.24,s*.84,c.outline);
  P(g,cx-s*.32,cy-s*.065,s*.64,s*.13,c.mark);P(g,cx-s*.065,cy-s*.32,s*.13,s*.64,c.mark);
}
function soldierHead(g,cx,cy,c,variant){
  g.fillStyle=variant? '#374038':'#3d443d';g.beginPath();g.arc(cx,cy,3.4,0,TAU);g.fill();
  P(g,cx-3,cy-1,6,2,'#232824');P(g,cx-2,cy+3,4,3,'#606b55');
}
function panelLine(g,x1,y1,x2,y2,c,alpha){
  g.save();g.globalAlpha=alpha==null?.45:alpha;g.strokeStyle=c;g.lineWidth=1;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.restore();
}
function damageOverlay(g,x,y,w,h,type){
  var c=vehiclePalette();
  g.save();
  // scorches
  g.globalAlpha=.58;g.fillStyle='#171713';g.beginPath();g.ellipse(x+w*.36,y+h*.34,w*.11,h*.075,-.3,0,TAU);g.fill();
  g.globalAlpha=.35;g.fillStyle=c.rust;g.beginPath();g.ellipse(x+w*.36,y+h*.34,w*.16,h*.11,-.3,0,TAU);g.fill();
  g.globalAlpha=.75;P(g,x+w*.69,y+h*.56,5,5,c.hole);P(g,x+w*.70,y+h*.57,2,2,'#050605');
  P(g,x+w*.25,y+h*.70,4,3,c.rust);
  panelLine(g,x+w*.18,y+h*.46,x+w*.34,y+h*.54,'#c7a87b',.42);
  panelLine(g,x+w*.63,y+h*.25,x+w*.76,y+h*.31,'#c7a87b',.38);
  if(type==='truck'||type==='lighttruck'){
    g.globalAlpha=.65;g.strokeStyle='#2b2922';g.lineWidth=2;g.beginPath();g.moveTo(x+w*.25,y+h*.18);g.lineTo(x+w*.45,y+h*.29);g.lineTo(x+w*.34,y+h*.36);g.stroke();
  }
  g.restore();
}
function drawJeepSprite(g,x,y,w,h,loaded,frame,state){
  var c=vehiclePalette(),cx=x+w/2,hit=state==='hit';
  // wheels
  rimWheel(g,x+7,y+26,8,13,c,frame);rimWheel(g,x+w-7,y+26,8,13,c,frame^1);
  rimWheel(g,x+7,y+h-25,8,13,c,frame^1);rimWheel(g,x+w-7,y+h-25,8,13,c,frame);
  // narrow body, front points down
  poly(g,[[x+13,y+8],[x+w-13,y+8],[x+w-10,y+h-12],[x+10,y+h-12]],c.outline);
  poly(g,[[x+15,y+10],[x+w-15,y+10],[x+w-12,y+h-14],[x+12,y+h-14]],c.body);
  // open cockpit/seats
  P(g,x+18,y+23,w-36,28,c.shadow);P(g,x+21,y+26,w-42,10,c.seat);P(g,x+21,y+40,w-42,8,c.seat);
  P(g,x+17,y+h-39,w-34,17,c.body2);P(g,x+20,y+h-36,w-40,6,c.glass);
  panelLine(g,x+16,y+17,x+w-16,y+17,c.edge,.5);panelLine(g,cx,y+10,cx,y+h-15,c.outline,.25);
  // rear spare + gear
  g.fillStyle=c.rubber;g.beginPath();g.arc(cx,y+13,6,0,TAU);g.fill();g.fillStyle=c.body3;g.beginPath();g.arc(cx,y+13,2.5,0,TAU);g.fill();
  soldierHead(g,cx-7,y+31,c,0);if(loaded)soldierHead(g,cx+7,y+44,c,1);
  balkenCross(g,cx,y+h-23,8,c);
  if(hit)damageOverlay(g,x,y,w,h,'jeep');
}
function drawLightTruckSprite(g,x,y,w,h,loaded,frame,state){
  var c=vehiclePalette(),cx=x+w/2,hit=state==='hit';
  rimWheel(g,x+7,y+26,8,14,c,frame);rimWheel(g,x+w-7,y+26,8,14,c,frame^1);
  rimWheel(g,x+7,y+h-25,8,14,c,frame^1);rimWheel(g,x+w-7,y+h-25,8,14,c,frame);
  // canvas cargo box
  P(g,x+11,y+7,w-22,48,c.outline);P(g,x+13,y+9,w-26,44,c.canvas);
  for(var i=0;i<4;i++){panelLine(g,x+15,y+15+i*9,x+w-15,y+14+i*9,c.canvasLight,.40);}
  panelLine(g,cx,y+10,cx,y+51,c.canvasDark,.55);
  // cab
  poly(g,[[x+11,y+55],[x+w-11,y+55],[x+w-9,y+h-13],[x+9,y+h-13]],c.outline);
  poly(g,[[x+13,y+57],[x+w-13,y+57],[x+w-11,y+h-15],[x+11,y+h-15]],c.body2);
  P(g,x+16,y+61,w-32,10,c.glass);P(g,x+18,y+62,(w-38)/2,7,c.glassHi);P(g,cx+2,y+62,(w-38)/2-2,7,c.glass);
  P(g,x+17,y+h-31,w-34,11,c.body);panelLine(g,x+14,y+h-35,x+w-14,y+h-35,c.edge,.55);
  balkenCross(g,cx,y+h-23,8,c);
  if(hit)damageOverlay(g,x,y,w,h,'lighttruck');
}
function drawTroopTruckSprite(g,x,y,w,h,loaded,frame,state){
  var c=vehiclePalette(),cx=x+w/2,hit=state==='hit';
  rimWheel(g,x+7,y+25,8,14,c,frame);rimWheel(g,x+w-7,y+25,8,14,c,frame^1);
  rimWheel(g,x+7,y+51,8,14,c,frame^1);rimWheel(g,x+w-7,y+51,8,14,c,frame);
  rimWheel(g,x+7,y+h-24,8,14,c,frame);rimWheel(g,x+w-7,y+h-24,8,14,c,frame^1);
  // open troop bed
  P(g,x+9,y+6,w-18,60,c.outline);P(g,x+12,y+9,w-24,54,c.wood);
  P(g,x+15,y+12,w-30,48,c.shadow);
  P(g,x+16,y+13,4,46,c.body2);P(g,x+w-20,y+13,4,46,c.body2);
  panelLine(g,x+21,y+16,x+w-21,y+16,c.edge,.38);panelLine(g,x+21,y+55,x+w-21,y+55,c.edge,.32);
  if(loaded){
    var heads=[[cx-10,y+20],[cx+9,y+20],[cx-10,y+33],[cx+9,y+33],[cx-10,y+46],[cx+9,y+46]];
    for(var i=0;i<heads.length;i++)soldierHead(g,heads[i][0],heads[i][1],c,i&1);
  }else{
    P(g,x+23,y+22,w-46,4,c.seat);P(g,x+23,y+40,w-46,4,c.seat);
  }
  // cab
  poly(g,[[x+10,y+67],[x+w-10,y+67],[x+w-8,y+h-12],[x+8,y+h-12]],c.outline);
  poly(g,[[x+12,y+69],[x+w-12,y+69],[x+w-10,y+h-14],[x+10,y+h-14]],c.body2);
  P(g,x+15,y+73,w-30,11,c.glass);P(g,x+17,y+74,(w-36)/2,8,c.glassHi);P(g,cx+2,y+74,(w-36)/2-2,8,c.glass);
  P(g,x+16,y+h-31,w-32,12,c.body);balkenCross(g,cx,y+h-23,8,c);
  if(hit)damageOverlay(g,x,y,w,h,'truck');
}
function drawHalftrackSprite(g,x,y,w,h,loaded,frame,state){
  var c=vehiclePalette(),cx=x+w/2,hit=state==='hit';
  // rear tracks
  P(g,x+3,y+9,10,63,c.outline);P(g,x+5,y+11,6,59,c.track);
  P(g,x+w-13,y+9,10,63,c.outline);P(g,x+w-11,y+11,6,59,c.track);
  for(var i=0;i<7;i++){P(g,x+5,y+14+i*8,6,3,(i+frame)%2?c.body3:c.shadow);P(g,x+w-11,y+14+i*8,6,3,(i+frame)%2?c.shadow:c.body3);}
  // front wheels
  rimWheel(g,x+7,y+h-24,8,14,c,frame);rimWheel(g,x+w-7,y+h-24,8,14,c,frame^1);
  // armored hull
  poly(g,[[x+12,y+6],[x+w-12,y+6],[x+w-10,y+70],[x+w-16,y+h-12],[x+16,y+h-12],[x+10,y+70]],c.outline);
  poly(g,[[x+14,y+8],[x+w-14,y+8],[x+w-12,y+68],[x+w-18,y+h-14],[x+18,y+h-14],[x+12,y+68]],c.body2);
  // open troop compartment
  P(g,x+18,y+12,w-36,48,c.shadow);P(g,x+21,y+15,w-42,42,c.seat);
  P(g,x+18,y+10,w-36,4,c.body3);P(g,x+18,y+57,w-36,4,c.body3);
  if(loaded){
    var heads=[[cx-10,y+22],[cx+10,y+22],[cx-10,y+35],[cx+10,y+35],[cx-10,y+48],[cx+10,y+48]];
    for(i=0;i<heads.length;i++)soldierHead(g,heads[i][0],heads[i][1],c,i&1);
  }else{
    P(g,x+24,y+23,w-48,4,c.shadow);P(g,x+24,y+42,w-48,4,c.shadow);
  }
  // armored driver's nose
  poly(g,[[x+15,y+63],[x+w-15,y+63],[x+w-11,y+h-14],[x+11,y+h-14]],c.body3,c.outline);
  P(g,x+18,y+69,w-36,10,c.glass);P(g,x+21,y+70,(w-44)/2,7,c.glassHi);P(g,cx+2,y+70,(w-44)/2-2,7,c.glass);
  panelLine(g,cx,y+64,cx,y+h-16,c.outline,.45);balkenCross(g,cx,y+h-24,9,c);
  if(hit)damageOverlay(g,x,y,w,h,'halftrack');
}
function vehicleBase(g,x,y,type,loaded,frame,state){
  var w=type==='jeep'?56:type==='lighttruck'?62:type==='truck'?66:70;
  var h=type==='jeep'?88:type==='lighttruck'?104:type==='truck'?116:116;
  if(type==='jeep')drawJeepSprite(g,x,y,w,h,loaded,frame,state);
  else if(type==='lighttruck')drawLightTruckSprite(g,x,y,w,h,loaded,frame,state);
  else if(type==='truck')drawTroopTruckSprite(g,x,y,w,h,loaded,frame,state);
  else drawHalftrackSprite(g,x,y,w,h,loaded,frame,state);
}
function wreckSprite(g,x,y,type){
  var c=vehiclePalette(),w=type==='jeep'?56:type==='lighttruck'?62:type==='truck'?66:70,h=type==='jeep'?88:type==='lighttruck'?104:116,cx=x+w/2;
  // burned, collapsed vehicle: deliberately asymmetric
  g.save();g.translate(cx,y+h/2);g.rotate(type==='halftrack'?.035:-.025);g.translate(-cx,-y-h/2);
  P(g,x+8,y+9,w-16,h-18,c.outline);
  poly(g,[[x+12,y+12],[x+w-13,y+9],[x+w-9,y+h-18],[x+16,y+h-12]],'#292925',c.outline);
  P(g,x+17,y+18,w-34,h*.34,'#151613');
  P(g,x+22,y+h*.52,w-39,h*.25,'#3d3027');
  P(g,x+w*.25,y+h*.22,w*.18,h*.12,c.rust);P(g,x+w*.58,y+h*.62,w*.16,h*.10,c.rust);
  g.fillStyle='#0d0f0d';g.beginPath();g.ellipse(cx,y+h*.42,w*.20,h*.14,.2,0,TAU);g.fill();
  // broken wheels/tracks
  g.fillStyle=c.rubber;g.beginPath();g.ellipse(x+7,y+h*.70,6,9,.3,0,TAU);g.fill();
  g.beginPath();g.ellipse(x+w-4,y+h*.28,6,9,-.5,0,TAU);g.fill();
  panelLine(g,x+12,y+h*.60,x+w-9,y+h*.48,'#8e5d38',.7);
  g.restore();
}
function turretSprite(g,x,y,w,h,type){
  var c=vehiclePalette(),cx=x+w/2,cy=y+h/2,half=type==='halftrack';
  // compact open MG mount, no cartoon square turret
  g.strokeStyle=c.outline;g.lineWidth=2;g.beginPath();g.arc(cx,cy,half?5:3.5,0,TAU);g.stroke();
  g.fillStyle=c.body2;g.beginPath();g.arc(cx,cy,half?3.6:2.5,0,TAU);g.fill();
  P(g,cx,cy-1,half?16:12,2,c.outline);P(g,cx+3,cy,half?12:8,1,c.edge);
  P(g,cx+2,cy+2,5,2,c.shadow);
}

function envTile(g,x,y,w,h,kind){
  var p=gameState.map.palette,r=seeded(kind.length*101+level().seed),base=kind==='groundSand'?tone(p.ground,.12):kind==='groundRubble'?tone(p.ground2,-.04):kind==='groundPale'?tone(p.ground,.11):p.ground;
  P(g,x,y,w,h,base);
  for(var i=0;i<32;i++){var px=x+(r()*w|0),py=y+(r()*h|0),sz=r()<.12?2:1;P(g,px,py,sz,1,r()<.48?tone(base,.12):tone(base,-.10));}
  if(kind==='groundGrass'){for(i=0;i<8;i++){px=x+(r()*w|0);py=y+(r()*h|0);P(g,px,py,1,3,tone(p.veg,-.04));P(g,px+1,py+1,1,2,tone(p.veg2,.10));}}
  else if(kind==='groundRubble'){for(i=0;i<8;i++){px=x+(r()*w|0);py=y+(r()*h|0);P(g,px,py,2,2,i%2?p.rock:tone(p.building,-.08));}}
  else if(kind==='groundSand'){for(i=0;i<5;i++){py=y+5+i*6;g.strokeStyle=tone(base,.08);g.globalAlpha=.25;g.beginPath();g.moveTo(x+3,py);g.quadraticCurveTo(x+w*.5,py-2,x+w-3,py+1);g.stroke();}g.globalAlpha=1;}
}
function propShadow(g,cx,cy,rx,ry,a){g.save();g.globalAlpha=a==null?.22:a;g.fillStyle='#151712';g.beginPath();g.ellipse(cx+2,cy+3,rx,ry,.08,0,TAU);g.fill();g.restore();}
function rockPoly(g,cx,cy,r,seed,p){var rnd=seeded(seed),pts=[];for(var i=0;i<8;i++){var a=i/8*TAU,rr=r*(.70+rnd()*.34);pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.80]);}poly(g,pts,tone(p.rock,rnd()*.08-.03),p.line);g.save();g.globalAlpha=.35;g.fillStyle=tone(p.rock,.30);g.beginPath();g.ellipse(cx-r*.18,cy-r*.24,r*.32,r*.14,-.3,0,TAU);g.fill();g.restore();}
function drawSandbagRow(g,x,y,w,h,curve){var p=gameState.map.palette,c=tone(p.road,.10),line=p.line,n=curve?7:6;propShadow(g,x+w/2,y+h*.58,w*.44,h*.22,.18);for(var i=0;i<n;i++){var t=n===1?0:i/(n-1),bx=x+4+t*(w-8),by=y+h*.48+(curve?Math.sin((t-.5)*Math.PI)*h*.22:0);g.fillStyle=c;g.strokeStyle=line;g.lineWidth=1;g.beginPath();g.ellipse(bx,by,5,3.2,curve?(t-.5)*.5:0,0,TAU);g.fill();g.stroke();P(g,bx-2,by-1,4,1,tone(c,.18));}}
function envProp(g,x,y,w,h,name){
  var p=gameState.map.palette,line=p.line,i,cx=x+w/2,cy=y+h/2;
  if(name.indexOf('bush')===0){
    var n=name==='bush1'?6:name==='bush2'?8:5;propShadow(g,cx,cy,w*.38,h*.24,.18);
    for(i=0;i<n;i++){var a=i/n*TAU,r=name==='bush2'?w*.23:w*.20;g.fillStyle=i%3===0?tone(p.veg2,.10):i%2?p.veg:p.veg2;g.beginPath();g.arc(cx+Math.cos(a)*w*.19,cy+Math.sin(a)*h*.16,r,0,TAU);g.fill();}
    P(g,cx-1,cy,2,4,tone(p.trench,-.10));
  }else if(name.indexOf('boulder')===0){
    var count=name==='boulder1'?3:name==='boulder2'?5:2;propShadow(g,cx,cy,w*.42,h*.27,.22);var rr=seeded(name.length*71+level().seed);
    for(i=0;i<count;i++){var br=Math.min(w,h)*(name==='boulder2'?.19:.24)*(count===2?1.15:1),bx=cx+(rr()-.5)*w*.50,by=cy+(rr()-.5)*h*.42;rockPoly(g,bx,by,br,i*19+name.length,p);}
  }else if(name==='rubbleBrick'||name==='rubbleConcrete'||name==='debrisPatch'){
    propShadow(g,cx,cy,w*.42,h*.24,.15);var rnd=seeded(name.length*37+level().seed);
    for(i=0;i<14;i++){var rx=x+3+rnd()*(w-6),ry=y+3+rnd()*(h-6),rw=2+(rnd()*6|0),rh=2+(rnd()*4|0);P(g,rx,ry,rw,rh,name==='rubbleBrick'?(i%3===0?'#8a4b37':tone(p.building,-.08)):i%3?p.rock:tone(p.building,-.12));}
    if(name==='rubbleConcrete')rockPoly(g,cx,cy,w*.20,39,p);
  }else if(name==='rubbleWall'){
    propShadow(g,cx,cy,w*.44,h*.20,.20);for(i=0;i<6;i++){var wx=x+3+i*(w-7)/6;P(g,wx,y+h*.35+(i%2)*2,6,h*.34,i%2?p.rock:tone(p.building,-.10));}P(g,x+3,y+h*.62,w-6,2,line);
  }else if(name==='crateStack'){
    propShadow(g,cx,cy,w*.42,h*.30,.20);var boxes=[[2,5,.45,.42],[.48,2,.46,.48],[.20,.48,.45,.44]];
    for(i=0;i<boxes.length;i++){var b=boxes[i],bbx=x+(b[0]<1?b[0]*w:b[0]),bby=y+(b[1]<1?b[1]*h:b[1]),bw=w*b[2],bh=h*b[3];P(g,bbx,bby,bw,bh,tone(p.building,i===1?.06:-.02));g.strokeStyle=line;g.strokeRect(bbx,bby,bw,bh);g.beginPath();g.moveTo(bbx+1,bby+1);g.lineTo(bbx+bw-1,bby+bh-1);g.moveTo(bbx+bw-1,bby+1);g.lineTo(bbx+1,bby+bh-1);g.stroke();}
  }else if(name==='palletCargo'){
    propShadow(g,cx,cy,w*.43,h*.29,.20);P(g,x+3,y+h*.70,w-6,4,tone(p.trench,-.06));for(i=0;i<4;i++)P(g,x+4+i*(w-8)/4,y+h*.66,2,h*.14,tone(p.trench,.12));P(g,x+8,y+5,w-16,h*.54,tone(p.veg,-.08));g.strokeStyle=line;g.strokeRect(x+8,y+5,w-16,h*.54);g.strokeStyle='#b5aa87';for(i=0;i<3;i++){g.beginPath();g.moveTo(x+10,y+9+i*5);g.lineTo(x+w-10,y+9+i*5);g.stroke();}
  }else if(name==='barrelStack'){
    propShadow(g,cx,cy,w*.40,h*.27,.19);var cols=['#8b4135','#59664c','#7e6944'];for(i=0;i<3;i++){var bx2=x+5+i*(w-10)/3;P(g,bx2,y+5,8,h-10,cols[i]);g.strokeStyle=line;g.strokeRect(bx2,y+5,8,h-10);P(g,bx2,y+h*.34,8,1,line);P(g,bx2,y+h*.67,8,1,line);}
  }else if(name==='jerryStack'){
    propShadow(g,cx,cy,w*.36,h*.25,.17);var jc=['#59634d','#7a4439','#8b7049'];for(i=0;i<4;i++){var jx=x+4+(i%2)*10,jy=y+5+Math.floor(i/2)*12;P(g,jx,jy,8,11,jc[i%3]);g.strokeStyle=line;g.strokeRect(jx,jy,8,11);P(g,jx+3,jy+1,3,2,line);}
  }else if(name==='sandbagStraight')drawSandbagRow(g,x,y,w,h,false);
  else if(name==='sandbagCurve')drawSandbagRow(g,x,y,w,h,true);
  else if(name==='wireFence'){
    propShadow(g,cx,cy,w*.44,h*.15,.12);g.strokeStyle=tone(line,.02);g.lineWidth=1;P(g,x+4,y+2,2,h-4,tone(p.trench,-.06));P(g,x+w-6,y+2,2,h-4,tone(p.trench,-.06));
    for(i=0;i<4;i++){var yy=y+5+i*4;g.beginPath();g.moveTo(x+5,yy);for(var xx=x+7;xx<x+w-5;xx+=4)g.lineTo(xx,yy+(xx%8?2:-2));g.stroke();}
  }else if(name==='woodFence'){
    propShadow(g,cx,cy,w*.45,h*.17,.16);P(g,x+3,y+3,3,h-6,tone(p.trench,-.04));P(g,x+w-6,y+3,3,h-6,tone(p.trench,-.04));P(g,x+4,y+h*.32,w-8,3,tone(p.trench,.05));P(g,x+4,y+h*.63,w-8,3,tone(p.trench,-.03));
  }else if(name==='hedgehog'){
    propShadow(g,cx,cy,w*.28,h*.20,.18);g.strokeStyle='#292d2a';g.lineWidth=3;g.beginPath();g.moveTo(x+4,y+h-4);g.lineTo(x+w-4,y+4);g.moveTo(x+4,y+4);g.lineTo(x+w-4,y+h-4);g.moveTo(cx,y+2);g.lineTo(cx,y+h-2);g.stroke();g.strokeStyle='#777b73';g.lineWidth=1;g.stroke();
  }else if(name==='logPile'||name==='timberPile'||name==='branchPile'){
    propShadow(g,cx,cy,w*.43,h*.25,.18);var nlog=name==='branchPile'?8:5;for(i=0;i<nlog;i++){var ly=y+4+i*(h-8)/nlog;g.strokeStyle=i%2?tone(p.trench,-.08):tone(p.trench,.10);g.lineWidth=name==='branchPile'?2:4;g.lineCap='round';g.beginPath();g.moveTo(x+3+(i%2)*4,ly);g.lineTo(x+w-4-(i%3)*3,ly+(i%2?4:-3));g.stroke();}
  }else if(name==='stump'){
    propShadow(g,cx,cy,w*.30,h*.24,.18);g.fillStyle=tone(p.trench,-.03);g.beginPath();g.ellipse(cx,cy,w*.24,h*.30,0,0,TAU);g.fill();g.strokeStyle=line;g.stroke();g.fillStyle=tone(p.trench,.28);g.beginPath();g.ellipse(cx,cy-h*.12,w*.16,h*.10,0,0,TAU);g.fill();
  }else if(name==='deadTree'){
    propShadow(g,cx,cy,w*.40,h*.17,.14);g.strokeStyle=tone(p.trench,-.06);g.lineCap='round';g.lineWidth=5;g.beginPath();g.moveTo(cx,y+h-2);g.lineTo(cx-3,y+4);g.moveTo(cx-1,y+h*.43);g.lineTo(x+5,y+h*.20);g.moveTo(cx,y+h*.38);g.lineTo(x+w-5,y+h*.13);g.stroke();g.lineWidth=2;g.beginPath();g.moveTo(x+5,y+h*.20);g.lineTo(x+2,y+4);g.moveTo(x+w-5,y+h*.13);g.lineTo(x+w-2,y+2);g.stroke();
  }else if(name==='steelDebris'){
    propShadow(g,cx,cy,w*.40,h*.22,.16);for(i=0;i<5;i++){g.strokeStyle=i%2?'#58443a':'#2c302d';g.lineWidth=2;g.beginPath();g.moveTo(x+3,y+4+i*4);g.lineTo(x+w-3,y+h-4-i*2);g.stroke();}
  }else if(name==='cartWheel'){
    propShadow(g,cx,cy,w*.30,h*.25,.15);g.strokeStyle=tone(p.trench,-.10);g.lineWidth=3;g.beginPath();g.arc(cx,cy,Math.min(w,h)*.31,0,TAU);g.stroke();g.lineWidth=1;for(i=0;i<8;i++){var aa=i/8*TAU;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(aa)*w*.28,cy+Math.sin(aa)*h*.28);g.stroke();}
  }else if(name==='roadBarrier'){
    propShadow(g,cx,cy,w*.40,h*.18,.15);P(g,x+4,y+h*.35,w-8,h*.26,'#d7d2bd');for(i=0;i<5;i++)P(g,x+5+i*(w-10)/5,y+h*.35,5,h*.26,i%2?'#a33f35':'#d7d2bd');P(g,x+9,y+h*.60,3,h*.22,tone(p.trench,-.08));P(g,x+w-12,y+h*.60,3,h*.22,tone(p.trench,-.08));
  }else if(name==='signpost'){
    propShadow(g,cx,cy,w*.24,h*.16,.12);P(g,cx-1,y+8,3,h-10,tone(p.trench,-.08));P(g,x+3,y+4,w-7,8,tone(p.trench,.12));g.strokeStyle=line;g.strokeRect(x+3,y+4,w-7,8);
  }else if(name==='trackStraight'||name==='trackCurve'){
    g.save();g.globalAlpha=.46;g.strokeStyle=tone(p.trench,.02);g.lineWidth=2;g.setLineDash([2,2]);
    if(name==='trackStraight'){g.beginPath();g.moveTo(x+w*.34,y+2);g.lineTo(x+w*.34,y+h-2);g.moveTo(x+w*.66,y+2);g.lineTo(x+w*.66,y+h-2);g.stroke();}
    else{g.beginPath();g.arc(x+w*.15,y+h*.85,w*.50,-Math.PI/2,0);g.stroke();g.beginPath();g.arc(x+w*.15,y+h*.85,w*.72,-Math.PI/2,0);g.stroke();}g.restore();
  }else if(name==='gravel'||name==='mudPatch'){
    var rnd2=seeded(name.length*73+level().seed);g.save();g.globalAlpha=name==='gravel'?.48:.22;for(i=0;i<18;i++){var gx=x+rnd2()*w,gy=y+rnd2()*h,sz=1+(rnd2()*3|0);P(g,gx,gy,sz,sz,name==='gravel'?p.rock:tone(p.trench,.06));}g.restore();
  }else if(name==='scorch1'||name==='scorch2'){
    g.save();g.globalAlpha=name==='scorch1'?.22:.30;g.fillStyle='#171816';g.beginPath();g.ellipse(cx,cy,w*.35,h*.23,name==='scorch2'?.35:-.2,0,TAU);g.fill();g.restore();
  }else if(name==='crater1'||name==='crater2'){
    propShadow(g,cx,cy,w*.35,h*.24,.18);g.fillStyle=tone(p.trench,-.16);g.beginPath();g.ellipse(cx,cy,w*(name==='crater2'?.34:.27),h*(name==='crater2'?.29:.23),0,0,TAU);g.fill();g.strokeStyle=tone(p.rock,.10);g.lineWidth=2;g.stroke();g.fillStyle='#25241f';g.beginPath();g.ellipse(cx,cy+1,w*.20,h*.14,0,0,TAU);g.fill();
  }else if(name==='blood1'||name==='blood2'||name==='blood3'){
    var bc=name==='blood3'?'#611a1b':name==='blood2'?'#812526':'#6c1d1e';g.save();g.globalAlpha=.92;g.fillStyle=bc;g.beginPath();g.ellipse(cx,cy,w*.24,h*.15,.18,0,TAU);g.fill();var dots=name==='blood3'?9:name==='blood2'?6:4;for(i=0;i<dots;i++){g.beginPath();g.arc(x+3+(i*11)%Math.max(5,w-6),y+3+(i*7)%Math.max(5,h-6),1+(i%3)*.45,0,TAU);g.fill();}g.restore();
  }else if(name==='supplyCompound'||name==='ruinCompound'||name==='fieldBunker'){
    propShadow(g,cx,cy,w*.43,h*.32,.22);
    if(name==='fieldBunker'){g.fillStyle=tone(p.ground2,-.03);g.beginPath();g.ellipse(cx,cy,w*.43,h*.38,0,0,TAU);g.fill();P(g,x+w*.20,y+h*.35,w*.60,h*.38,tone(p.building,-.10));P(g,x+w*.40,y+h*.48,w*.20,h*.29,'#1b1e1b');drawSandbagRow(g,x+w*.08,y+h*.60,w*.84,h*.22,true);}
    else if(name==='supplyCompound'){P(g,x+3,y+3,w-6,h-6,p.building);g.strokeStyle=line;g.lineWidth=2;g.strokeRect(x+3,y+3,w-6,h-6);P(g,x+8,y+8,w-16,h-20,p.roof);}
    else{P(g,x+3,y+3,w*.38,h*.35,p.roof);P(g,x+w*.55,y+h*.50,w*.35,h*.34,tone(p.roof,-.10));for(i=0;i<15;i++){var rx2=x+5+(i*17)%Math.max(6,w-10),ry2=y+5+(i*23)%Math.max(6,h-10);P(g,rx2,ry2,3,3,i%3?'#8a4b37':p.rock);}}
  }
}

function spriteHeliLegacy(g,x,y,w,h,frame){
  var c=vehiclePalette(),cx=x+w/2,cy=y+h/2;
  g.fillStyle='#242424';g.beginPath();g.ellipse(cx+3,cy+5,18,7,0,0,TAU);g.fill();
  poly(g,[[cx-15,cy-7],[cx+11,cy-7],[cx+18,cy],[cx+11,cy+7],[cx-15,cy+7],[cx-21,cy]],c.body,c.outline);
  P(g,cx-10,cy-5,12,10,c.body2);P(g,cx+2,cy-4,8,8,c.glass);P(g,cx+3,cy-3,5,3,c.glassHi);
  P(g,cx+16,cy-2,22,4,c.body);P(g,cx+34,cy-8,3,16,c.outline);P(g,cx+35,cy-6,1,12,c.edge);
  P(g,cx-13,cy+9,22,2,c.outline);P(g,cx-10,cy+7,2,4,c.outline);P(g,cx+5,cy+7,2,4,c.outline);
  g.strokeStyle=c.outline;g.lineWidth=2;g.beginPath();
  if(frame&1){g.moveTo(cx-28,cy-1);g.lineTo(cx+28,cy+1);g.moveTo(cx-1,cy-21);g.lineTo(cx+1,cy+21);}
  else{g.moveTo(cx-24,cy-15);g.lineTo(cx+24,cy+15);g.moveTo(cx-24,cy+15);g.lineTo(cx+24,cy-15);}
  g.stroke();P(g,cx-2,cy-2,4,4,c.edge);
}
function spritePlaneLegacy(g,x,y,w,h,flip){
  var c=vehiclePalette(),cx=x+w/2,cy=y+h/2;
  g.fillStyle='#242424';g.beginPath();g.ellipse(cx+2,cy+5,24,7,0,0,TAU);g.fill();
  poly(g,[[cx,cy-23],[cx+5,cy-7],[cx+28,cy-2],[cx+29,cy+3],[cx+6,cy+5],[cx+5,cy+20],[cx,cy+24],[cx-5,cy+20],[cx-6,cy+5],[cx-29,cy+3],[cx-28,cy-2],[cx-5,cy-7]],c.body2,c.outline);
  P(g,cx-3,cy-15,6,18,c.body3);P(g,cx-3,cy-8,6,6,c.glass);P(g,cx-2,cy-7,4,2,c.glassHi);
  P(g,cx-20,cy-1,40,3,c.body);P(g,cx-2,cy+13,4,9,c.body);P(g,cx-8,cy+17,16,3,c.outline);
  if(flip){P(g,cx-25,cy,3,2,'#dbb624');}else P(g,cx+22,cy,3,2,'#dbb624');
}
function spriteParaLegacy(g,x,y,w,h,frame){
  var c=vehiclePalette(),cx=x+w/2;
  g.fillStyle=c.outline;g.beginPath();g.arc(cx,y+12,12,Math.PI,TAU);g.lineTo(cx+12,y+12);g.lineTo(cx-12,y+12);g.fill();
  g.fillStyle='#dbdbb6';g.beginPath();g.arc(cx,y+12,10,Math.PI,TAU);g.lineTo(cx+10,y+12);g.lineTo(cx-10,y+12);g.fill();
  P(g,cx-1,y+3,2,9,c.outline);P(g,cx-7,y+6,1,7,c.outline);P(g,cx+6,y+6,1,7,c.outline);
  P(g,cx-2,y+18,4,5,c.body);P(g,cx-3+(frame?1:-1),y+23,2,5,c.outline);P(g,cx+1+(frame?-1:1),y+23,2,5,c.outline);
}
function spritePlayerBunker(g,x,y,w,h){
  var c=vehiclePalette(),cx=x+w/2,cy=y+h/2;
  P(g,cx-29,cy-5,58,17,c.outline);P(g,cx-27,cy-4,54,15,c.body);
  for(var i=0;i<7;i++){var bx=cx-25+i*8;g.fillStyle=i&1?'#926d49':'#b6b692';g.beginPath();g.ellipse(bx,cy+8,5,3,0,0,TAU);g.fill();g.strokeStyle=c.outline;g.stroke();}
  P(g,cx-12,cy-13,24,20,c.outline);P(g,cx-10,cy-11,20,16,c.body2);P(g,cx-6,cy-8,12,10,c.hole);
  P(g,cx-24,cy-1,7,4,c.body3);P(g,cx+17,cy-1,7,4,c.body3);
}
function spritePlayerTurret(g,x,y,w,h){
  var c=vehiclePalette(),cx=x+w/2,cy=y+h/2;
  g.fillStyle=c.outline;g.beginPath();g.arc(cx,cy,7,0,TAU);g.fill();g.fillStyle=c.body3;g.beginPath();g.arc(cx,cy,5,0,TAU);g.fill();
  P(g,cx,cy-2,25,4,c.outline);P(g,cx+3,cy-1,21,2,c.edge);P(g,cx-2,cy-3,4,2,c.mark);
}
function buildSpriteAtlas(){
  SPR.atlas=document.createElement('canvas');SPR.atlas.width=SPR.size;SPR.atlas.height=SPR.size;SPR.frames={};SPR.x=2;SPR.y=2;SPR.rowH=0;var g=SPR.atlas.getContext('2d');g.imageSmoothingEnabled=false;
  for(var r=0;r<SPR.inf.roles.length;r++)for(var sk=0;sk<SPR.inf.skins;sk++)for(var d=0;d<SPR.inf.dirs.length;d++)for(var p=0;p<SPR.inf.poses.length;p++){(function(role,skin,dir,pose){atlasAdd('inf:'+role+':'+skin+':'+dir+':'+pose,16,20,function(gg,x,y){infPixel(gg,x,y,role,dir,pose,skin);});})(SPR.inf.roles[r],sk,SPR.inf.dirs[d],SPR.inf.poses[p]);}
  ['jeep','lighttruck','truck','halftrack'].forEach(function(type){
    var vw=type==='jeep'?56:type==='lighttruck'?62:type==='truck'?66:70;
    var vh=type==='jeep'?88:type==='lighttruck'?104:116;
    for(var loaded=0;loaded<2;loaded++)for(var fr=0;fr<2;fr++)for(var st=0;st<2;st++){
      (function(t,l,f,state,w,h){atlasAdd(t+':'+(l?'loaded':'empty')+':'+f+':'+state,w,h,function(gg,x,y){vehicleBase(gg,x,y,t,l,f,state);});})(type,loaded,fr,st?'hit':'healthy',vw,vh);
    }
    atlasAdd(type+':wreck',vw,vh,function(gg,x,y){wreckSprite(gg,x,y,type);});
  });
  atlasAdd('turret:jeep',32,32,function(gg,x,y,w,h){turretSprite(gg,x,y,w,h,'jeep');});atlasAdd('turret:lighttruck',32,32,function(gg,x,y,w,h){turretSprite(gg,x,y,w,h,'lighttruck');});atlasAdd('turret:truck',32,32,function(gg,x,y,w,h){turretSprite(gg,x,y,w,h,'truck');});atlasAdd('turret:halftrack',38,38,function(gg,x,y,w,h){turretSprite(gg,x,y,w,h,'halftrack');});
  ['groundGrass','groundSand','groundRubble','groundPale'].forEach(function(n){atlasAdd('env:'+n,36,36,function(gg,x,y,w,h){envTile(gg,x,y,w,h,n);});});
  [
    ['bush1',30,26],['bush2',38,32],['bush3',26,23],
    ['boulder1',38,30],['boulder2',44,34],['boulder3',31,27],
    ['rubbleBrick',42,30],['rubbleConcrete',45,32],['rubbleWall',44,20],['debrisPatch',40,27],
    ['crateStack',37,32],['palletCargo',42,34],['barrelStack',35,31],['jerryStack',27,28],
    ['sandbagStraight',45,18],['sandbagCurve',47,25],
    ['wireFence',50,22],['woodFence',48,22],['hedgehog',30,27],
    ['logPile',48,25],['timberPile',45,28],['branchPile',44,26],['stump',25,25],['deadTree',46,50],
    ['steelDebris',43,28],['cartWheel',30,30],['roadBarrier',43,26],['signpost',30,33],
    ['trackStraight',34,52],['trackCurve',48,48],['gravel',38,30],['mudPatch',42,30],
    ['scorch1',36,28],['scorch2',43,33],['crater1',36,30],['crater2',46,38],
    ['blood1',34,25],['blood2',42,29],['blood3',50,34],
    ['supplyCompound',92,68],['ruinCompound',96,72],['fieldBunker',96,70]
  ].forEach(function(a){atlasAdd('env:'+a[0],a[1],a[2],function(gg,x,y,w,h){envProp(gg,x,y,w,h,a[0]);});});
  atlasAdd('part:wheel',9,9,function(gg,x,y){var c=vehiclePalette();P(gg,x+1,y,6,9,c.outline);P(gg,x+2,y+1,4,7,c.rubber);P(gg,x+3,y+3,2,3,c.body3);});atlasAdd('part:track',14,8,function(gg,x,y){var c=vehiclePalette();P(gg,x,y+1,14,6,c.outline);P(gg,x+1,y+2,12,4,c.track);for(var i=1;i<12;i+=3)P(gg,x+i,y+2,1,4,c.body3);});atlasAdd('part:door',11,9,function(gg,x,y){var c=vehiclePalette();P(gg,x,y,11,9,c.outline);P(gg,x+1,y+1,9,7,c.body2);P(gg,x+2,y+2,1,5,c.edge);});atlasAdd('part:panel',12,8,function(gg,x,y){var c=vehiclePalette();P(gg,x,y,12,8,c.outline);P(gg,x+1,y+1,10,6,c.rust);P(gg,x+3,y+2,5,1,c.edge);});
  atlasAdd('heli:0',76,56,function(gg,x,y,w,h){spriteHeliLegacy(gg,x,y,w,h,0);});atlasAdd('heli:1',76,56,function(gg,x,y,w,h){spriteHeliLegacy(gg,x,y,w,h,1);});atlasAdd('plane:0',76,54,function(gg,x,y,w,h){spritePlaneLegacy(gg,x,y,w,h,0);});atlasAdd('plane:1',76,54,function(gg,x,y,w,h){spritePlaneLegacy(gg,x,y,w,h,1);});atlasAdd('para:0',30,32,function(gg,x,y,w,h){spriteParaLegacy(gg,x,y,w,h,0);});atlasAdd('para:1',30,32,function(gg,x,y,w,h){spriteParaLegacy(gg,x,y,w,h,1);});atlasAdd('bunkerPlayer',72,48,function(gg,x,y,w,h){spritePlayerBunker(gg,x,y,w,h);});atlasAdd('bunkerTurret',64,64,function(gg,x,y,w,h){spritePlayerTurret(gg,x,y,w,h);});SPR.level=gameState.levelIndex;
}
function ensureSpriteAtlas(){if(!SPR.atlas||SPR.level!==gameState.levelIndex)buildSpriteAtlas();}
function drawAtlas(name,x,y,scale,angle,alpha){ensureSpriteAtlas();var f=SPR.frames[name];if(!f)return;ctx.save();ctx.translate(Math.round(x),Math.round(y));if(angle)ctx.rotate(angle);ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=false;ctx.drawImage(SPR.atlas,f.x,f.y,f.w,f.h,Math.round(-f.w*scale/2),Math.round(-f.h*scale/2),Math.round(f.w*scale),Math.round(f.h*scale));ctx.restore();}
function spritePose(e){if(!e.alive)return e.deadT<.22?'dead1':'dead2';if(e.state==='crawl')return e.muzzle>0?'proneFire':'prone';if(e.state==='cover'||e.state==='covering'||e.state==='suppressed')return e.muzzle>0?'crouchFire':'crouch';if(e.state==='fire'){if(e.firePose==='prone')return e.muzzle>0?'proneFire':'prone';if(e.firePose==='crouch')return e.muzzle>0?'crouchFire':'crouch';return e.muzzle>0?'standFire':'idle';}if(e.state==='advance')return ['walk1','walk2','walk3','walk4'][((e.anim*3.15)|0)%4];return ((e.anim2*1.3)|0)%2?'idle2':'idle';}
function spriteDirection(e){var dx,dy;if(e.alive&&(e.state==='advance'||e.state==='crawl'||e.state==='suppressed')){var t=tacticalPoint(e);dx=t.x-e.x;dy=t.y-e.y;}else{dx=gameState.bunker.x-e.x;dy=gameState.bunker.y-e.y;}if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';return dy<0?'up':'down';}
function drawSoldier(e){var pose=spritePose(e),dir=spriteDirection(e),skin=Math.abs(e.variant||0)%SPR.inf.skins,depth=clamp((e.y-safeTop)/(H-safeTop-safeBottom),0,1),scale=(IS_IPHONE?.86:.96)*(.92+depth*.10),hop=e.limp>0?Math.abs(Math.sin(e.anim*2.8))*1.7*e.limp:0,xx=e.x+(e.limp>0?Math.sin(e.anim*5.6)*.8:0),yy=e.y-hop;ctx.save();ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(xx,yy+7,pose.indexOf('prone')===0?7:5,pose.indexOf('prone')===0?2.2:2.7,0,0,TAU);ctx.fill();ctx.restore();drawAtlas('inf:'+e.role+':'+skin+':'+dir+':'+pose,xx,yy,scale,0,e.alive?1:clamp(1-e.deadT/7,.34,1));}
function drawVehicle(v,wreck){
  var type=v.type||'truck',body=v.bodyAngle==null?Math.PI/2:v.bodyAngle,rot=body-Math.PI/2;
  var scale=type==='jeep'?.48:type==='lighttruck'?.47:type==='truck'?.45:.47;
  var shadowW=type==='jeep'?15:type==='lighttruck'?17:type==='truck'?19:21;
  var shadowH=type==='jeep'?28:type==='lighttruck'?33:type==='truck'?37:38;

  ctx.save();ctx.translate(v.x+3,v.y+5);ctx.rotate(rot);ctx.globalAlpha=wreck?.25:.22;ctx.fillStyle='#101310';
  ctx.beginPath();ctx.ellipse(0,0,shadowW,shadowH,0,0,TAU);ctx.fill();ctx.restore();

  if(wreck){
    drawAtlas(type+':wreck',v.x,v.y,scale,rot,.99);
    return;
  }

  var loaded=(v.passengers||0)>0,frame=(((v.wheelT||0)*1.55)|0)&1;
  var state=(v.hp/v.maxHp)<.58?'hit':'healthy';
  drawAtlas(type+':'+(loaded?'loaded':'empty')+':'+frame+':'+state,v.x,v.y,scale,rot,1);

  if(v.hasMG){
    var recoil=(v.turretRecoil||0)*(type==='halftrack'?2.6:1.8);
    var tx=v.x-Math.cos(v.turretAngle)*recoil,ty=v.y-Math.sin(v.turretAngle)*recoil;
    drawAtlas('turret:'+type,tx,ty,type==='halftrack'?.78:.62,v.turretAngle,1);
  }

  if(v.hitFlash>0){
    ctx.save();ctx.globalAlpha=clamp(v.hitFlash/.10,0,.30);ctx.fillStyle='#fff1ad';
    ctx.beginPath();ctx.ellipse(v.x,v.y,shadowW*.95,shadowH*.70,rot,0,TAU);ctx.fill();ctx.restore();
  }
  if(v.state==='reverseWreck'){
    ctx.save();ctx.translate(v.x,v.y);ctx.rotate(rot);ctx.fillStyle='#f7d8a5';ctx.globalAlpha=.82;
    ctx.fillRect(-shadowW*.55,-shadowH*.80,3,2);ctx.fillRect(shadowW*.42,-shadowH*.80,3,2);ctx.restore();
  }
}
function drawHeli(a){drawAtlas('heli:'+(((a.rotor*1.2)|0)&1),a.x,a.y,.92,0,1);}
function drawPlane(a){drawAtlas('plane:'+(a.fromLeft?0:1),a.x,a.y,.92,0,1);}
function drawPara(p){drawAtlas('para:'+(((p.phase*1.3)|0)&1),p.x,p.y,.92,0,1);}
/* ---------- RENDER: EFFECTS / PLAYER ---------- */

function drawEffects(){
  for(var i=0;i<gameState.effects.length;i++){
    var e=gameState.effects[i],q=1-e.t/e.life,px=Math.round(e.x),py=Math.round(e.y);
    if(e.type==='explosion'){
      var rr=Math.max(2,Math.round(e.r*(.30+.90*(1-q))));
      ctx.globalAlpha=q;ctx.fillStyle='#db6d24';ctx.fillRect(px-rr,py-2,rr*2+1,5);ctx.fillRect(px-2,py-rr,5,rr*2+1);
      ctx.fillStyle='#dbb624';ctx.fillRect(px-Math.ceil(rr*.55),py-Math.ceil(rr*.55),Math.ceil(rr*1.1),Math.ceil(rr*1.1));ctx.fillStyle='#ffffff';ctx.fillRect(px-2,py-2,4,4);
      ctx.fillStyle='#b64924';ctx.fillRect(px-rr,py-rr,3,3);ctx.fillRect(px+rr-2,py+rr-2,3,3);
    }else if(e.type==='fireball'){
      var fr=Math.max(2,Math.round(e.r*(.45+.65*(1-q))));ctx.globalAlpha=q;ctx.fillStyle='#b64924';ctx.fillRect(px-fr,py-fr,fr*2,fr*2);ctx.fillStyle='#db6d24';ctx.fillRect(px-fr+2,py-fr+2,Math.max(2,fr*2-4),Math.max(2,fr*2-4));ctx.fillStyle='#dbb624';ctx.fillRect(px-2,py-2,4,4);
    }else if(e.type==='smoke'){
      ctx.globalAlpha=q>.6?1:.70;ctx.fillStyle=e.shade>.6?'#242424':'#6d6d49';var sr=Math.max(2,Math.round(e.r));ctx.fillRect(px-sr,py-sr,Math.max(2,sr*2),Math.max(2,sr*2));if((i+Math.round(e.t*20))&1){ctx.fillStyle='#929292';ctx.fillRect(px-sr,py-sr,2,2);}
    }else if(e.type==='flame'){
      ctx.globalAlpha=q;ctx.fillStyle=e.shade>.55?'#dbb624':'#db6d24';var fs=Math.max(2,Math.round(e.r));ctx.fillRect(px-2,py-fs,4,fs+3);ctx.fillStyle='#ffffff';ctx.fillRect(px-1,py-2,2,2);
    }else if(e.type==='muzzle'){
      ctx.globalAlpha=q;ctx.save();ctx.translate(px,py);ctx.rotate(e.angle);ctx.fillStyle='#dbb624';ctx.fillRect(0,-1,Math.max(4,Math.round(e.r)),3);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,Math.max(2,Math.round(e.r*.45)),1);ctx.restore();
    }else if(e.type==='debris'){
      ctx.globalAlpha=q;ctx.save();ctx.translate(px,py);ctx.rotate(e.rot);ctx.fillStyle=gameState.map.palette.rock;ctx.fillRect(-e.size/2,-e.size/2,e.size,e.size*.65);ctx.restore();
    }else if(e.type==='casing'){
      ctx.globalAlpha=q;ctx.fillStyle='#dbb624';ctx.fillRect(px,py,2,1);
    }else if(e.type==='vehiclePart'){
      drawAtlas('part:'+e.part,px,py,e.scale||1,e.rot,q);
    }else if(e.type==='impactFlash'){
      ctx.globalAlpha=q;ctx.fillStyle='#ffffff';ctx.fillRect(px-2,py-2,5,5);ctx.fillStyle='#dbb624';ctx.fillRect(px-4,py,9,1);ctx.fillRect(px,py-4,1,9);
    }else if(e.type==='ember'){
      ctx.globalAlpha=q;ctx.fillStyle='#db6d24';ctx.fillRect(px,py,2,2);
    }else if(e.type==='blood'){
      ctx.globalAlpha=q;ctx.fillStyle=e.shade===1?'#b64924':e.shade===2?'#6d4924':'#b64924';ctx.fillRect(px,py,Math.max(1,Math.round(e.r)),Math.max(1,Math.round(e.r)));
    }else if(e.type==='spark'||e.type==='gunSpark'){
      ctx.globalAlpha=q;ctx.strokeStyle=e.type==='gunSpark'?'#ffffff':'#dbb624';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(Math.round(e.x-e.vx*.025),Math.round(e.y-e.vy*.025));ctx.stroke();
    }else if(e.type==='heTrail'){
      ctx.globalAlpha=q>.55?.70:.35;ctx.fillStyle='#6d6d49';ctx.fillRect(px-1,py-1,3,3);
    }else if(e.type==='dust'){
      ctx.globalAlpha=q*.65;ctx.fillStyle=gameState.map.palette.roadEdge;var dr=Math.max(2,Math.round(e.r));ctx.fillRect(px-dr,py-1,dr*2,3);
    }else if(e.type==='damage'){
      ctx.globalAlpha=q;ctx.font='bold 9px "Courier New",monospace';ctx.textAlign='center';ctx.fillStyle='#dbdbb6';ctx.fillText(e.text,px,py);
    }else if(e.type==='hit'){
      ctx.globalAlpha=q;ctx.strokeStyle='#dbb624';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px-5,py);ctx.lineTo(px+5,py);ctx.moveTo(px,py-5);ctx.lineTo(px,py+5);ctx.stroke();
    }else if(e.type==='rope'){
      ctx.globalAlpha=q;ctx.strokeStyle='#b6b692';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px-8,py);ctx.lineTo(px-8,py+38);ctx.moveTo(px+8,py);ctx.lineTo(px+8,py+38);ctx.stroke();
    }else if(e.type==='chute'){
      ctx.globalAlpha=q;ctx.strokeStyle='#242424';ctx.beginPath();ctx.arc(px,py,14,Math.PI,TAU);ctx.stroke();
    }
  }
  ctx.globalAlpha=1;ctx.textAlign='left';
}
function drawShots(){
  for(var i=0;i<gameState.shots.length;i++){
    var b=gameState.shots[i];
    if(b.kind==='mg'){
      ctx.strokeStyle='#dbb624';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(Math.round(b.px),Math.round(b.py));ctx.lineTo(Math.round(b.x),Math.round(b.y));ctx.stroke();
      ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(Math.round((b.px+b.x)*.5),Math.round((b.py+b.y)*.5));ctx.lineTo(Math.round(b.x),Math.round(b.y));ctx.stroke();
    }else{
      var z=b.z||0;ctx.fillStyle='#242424';ctx.fillRect(Math.round(b.x)-3,Math.round(b.y)-1,6,3);
      ctx.strokeStyle='#db6d24';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(Math.round(b.px),Math.round(b.py-(b.pz||0)));ctx.lineTo(Math.round(b.x),Math.round(b.y-z));ctx.stroke();
      ctx.fillStyle='#dbb624';ctx.fillRect(Math.round(b.x)-2,Math.round(b.y-z)-2,5,5);ctx.fillStyle='#ffffff';ctx.fillRect(Math.round(b.x),Math.round(b.y-z),1,1);
    }
  }
  for(i=0;i<gameState.enemyShots.length;i++){
    b=gameState.enemyShots[i];ctx.strokeStyle=b.kind==='grenade'?'#db6d24':'#dbdbb6';ctx.lineWidth=b.kind==='grenade'?2:1;ctx.beginPath();ctx.moveTo(Math.round(b.px),Math.round(b.py));ctx.lineTo(Math.round(b.x),Math.round(b.y));ctx.stroke();
  }
}
function drawBunker(){
  var b=gameState.bunker;drawAtlas('bunkerPlayer',b.x,b.y,1,0,1);drawAtlas('bunkerTurret',b.x,b.y-2,1,b.angle,1);
}
function drawCrosshair(){
  if(gameState.mode!=='playing')return;
  var x=Math.round(gameState.aim.x),y=Math.round(gameState.aim.y),bloom=Math.round(6+gameState.heat*4);
  ctx.save();ctx.strokeStyle=gameState.hitMarker>0?'#dbb624':'#dbdbb6';ctx.lineWidth=1;ctx.strokeRect(x-bloom,y-bloom,bloom*2,bloom*2);
  ctx.beginPath();ctx.moveTo(x-12,y);ctx.lineTo(x-4,y);ctx.moveTo(x+4,y);ctx.lineTo(x+12,y);ctx.moveTo(x,y-12);ctx.lineTo(x,y-4);ctx.moveTo(x,y+4);ctx.lineTo(x,y+12);ctx.stroke();
  if(gameState.hitMarker>0){ctx.fillStyle='#ffffff';ctx.fillRect(x-1,y-1,3,3);}ctx.restore();
}
function effColor(){return gameState.eff>=.86?'#496d49':gameState.eff>=.70?'#6d6d49':gameState.eff>=.50?'#dbb624':gameState.eff>=.30?'#db6d24':'#b64924';}
function drawHud(){
  var top=safeTop+7,bottom=H-safeBottom-14,L=level(),ink='#242424',paper='#dbdbb6',line='#b6b692';
  ctx.save();ctx.textBaseline='middle';ctx.fillStyle=ink;ctx.fillRect(7,top,W-14,48);ctx.strokeStyle=line;ctx.lineWidth=1;ctx.strokeRect(7,top,W-14,48);
  ctx.font='bold 10px "Courier New",monospace';ctx.fillStyle=paper;ctx.textAlign='left';ctx.fillText('HP '+Math.max(0,Math.round(gameState.bunker.hp))+'/'+Math.round(gameState.bunker.maxHp),14,top+13);
  ctx.textAlign='center';ctx.fillStyle=effColor();ctx.fillText('EFF '+Math.round(gameState.eff*100)+'%',W*.5,top+13);
  ctx.textAlign='right';ctx.fillStyle=paper;ctx.fillText('K '+(gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills),W-14,top+13);
  ctx.font='bold 8px "Courier New",monospace';ctx.textAlign='left';ctx.fillStyle=line;ctx.fillText('MAP '+(gameState.levelIndex+1)+'/15 '+L.name.toUpperCase(),14,top+31);ctx.textAlign='right';ctx.fillText('Z'+(L.zone+1)+'-'+(L.stage+1),W-14,top+31);
  var barX=Math.round(W*.5-44),barY=top+37,bw=88;ctx.fillStyle='#000000';ctx.fillRect(barX,barY,bw,6);ctx.fillStyle=effColor();ctx.fillRect(barX+1,barY+1,Math.max(0,Math.round((bw-2)*gameState.eff)),4);
  ctx.fillStyle=ink;ctx.fillRect(10,bottom-30,W-20,24);ctx.strokeStyle=line;ctx.strokeRect(10,bottom-30,W-20,24);
  ctx.textAlign='left';ctx.font='bold 8px "Courier New",monospace';ctx.fillStyle=gameState.overheat?'#b64924':paper;ctx.fillText(gameState.overheat?'HOT':'HEAT',17,bottom-18);
  ctx.fillStyle='#000000';ctx.fillRect(55,bottom-22,W-78,7);ctx.fillStyle=gameState.heat>.75?'#b64924':'#dbb624';ctx.fillRect(56,bottom-21,Math.round((W-80)*gameState.heat),5);
  if(gameState.pointer.down){
    var hold=(performance.now()-gameState.pointer.t0)/1000*gameState.profile.chargeScale,charge=clamp(hold/HE_HOLD,0,1),label=gameState.pointer.heFired?'HE!':hold<.16?'MG':'HE';
    ctx.textAlign='right';ctx.fillStyle=hold<.16?paper:'#db6d24';ctx.fillText(label,W-17,bottom-18);ctx.fillStyle='#000000';ctx.fillRect(W-78,bottom-10,60,3);ctx.fillStyle='#db6d24';ctx.fillRect(W-77,bottom-9,Math.round(58*charge),1);
  }
  if(gameState.streak>1&&gameState.streakT>0){ctx.textAlign='left';ctx.fillStyle='#dbb624';ctx.fillText('STREAK '+gameState.streak,16,bottom-5);}
  if(gameState.messageT>0){var my=top+55;ctx.fillStyle='#242424';ctx.fillRect(W*.5-76,my,152,18);ctx.strokeStyle='#dbb624';ctx.strokeRect(W*.5-76,my,152,18);ctx.textAlign='center';ctx.fillStyle='#dbb624';ctx.font='bold 9px "Courier New",monospace';ctx.fillText(gameState.message,W*.5,my+9);}
  ctx.restore();
}
/* ---------- RENDER ---------- */

function render(){
  if(!gameState)return;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
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
  readSafe();W=Math.max(320,innerWidth);H=Math.max(480,innerHeight);DPR=320/W;
  canvas.width=320;canvas.height=Math.max(200,Math.round(H*DPR));canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
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