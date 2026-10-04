(function(){
'use strict';

/* =========================
   JBD V8.3 PIXEL INFANTRY
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

var DEVICE={
  enemySpeed:IS_IPHONE?.84:1,
  enemyDamage:IS_IPHONE?.76:1,
  spawnGap:IS_IPHONE?1.14:1,
  hitRadius:IS_IPHONE?1.20:1,
  dprCap:IS_IPHONE?1.5:2,
  maxEffects:IS_IPHONE?96:165,
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
  {type:'JUNGLE',theme:'jungle',names:['Jungle Entry','Jungle Ambush','Jungle Fortress'],boss:'IRON BOAR'},
  {type:'DESERT',theme:'desert',names:['Desert Convoy','Desert Depot','Desert Citadel'],boss:'SAND BEHEMOTH'},
  {type:'POLAR',theme:'polar',names:['Polar Ridge','Polar Station','Polar Stronghold'],boss:'WHITE MAMMOTH'},
  {type:'VILLAGE',theme:'village',names:['Village Road','Village Square','Village Keep'],boss:'STEEL BULL'},
  {type:'INDUSTRIAL',theme:'industrial',names:['Industrial Yard','Industrial Works','Industrial Core'],boss:'TITAN-15'}
];

var LEVELS=[];
(function(){
  var seed=17;
  for(var z=0;z<ZONES.length;z++){
    for(var s=0;s<3;s++){
      LEVELS.push({
        zone:z,stage:s,type:ZONES[z].type,theme:ZONES[z].theme,
        name:ZONES[z].names[s],seed:seed,
        boss:s===2,bossName:s===2?ZONES[z].boss:null
      });
      seed+=23+z*4+s*3;
    }
  }
})();

var UPGRADES={
  damage:{label:'DAMAGE',desc:'meer schade per treffer',cost:[40,65,95,135]},
  speed:{label:'SPEED',desc:'projectielen vliegen sneller',cost:[35,55,80,115]},
  burst:{label:'BURST',desc:'één extra MG-kogel per burst',cost:[42,68,100]},
  charge:{label:'CHARGE',desc:'AP/HE sneller geladen',cost:[35,55,80,115]},
  cooling:{label:'COOLING',desc:'minder heat, sneller herstel',cost:[35,55,80,115]},
  he:{label:'HE BLAST',desc:'grotere HE explosie',cost:[45,70,105,145]},
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
function isBossLevel(){return level().boss;}
function getBoss(){
  for(var i=0;i<gameState.vehicles.length;i++){
    var v=gameState.vehicles[i];
    if(v.type==='boss'&&v.alive)return v;
  }
  return null;
}

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
    heRadius:32+u.he*8
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
      else if(kind==='ap'){o.type='sawtooth';o.frequency.setValueAtTime(105,t);o.frequency.exponentialRampToValueAtTime(38,t+.18);g.gain.setValueAtTime(.085*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.20);o.start(t);o.stop(t+.21);}
      else if(kind==='he'||kind==='boom'){o.type='sawtooth';o.frequency.setValueAtTime(kind==='boom'?56:70,t);o.frequency.exponentialRampToValueAtTime(27,t+.24);g.gain.setValueAtTime((kind==='boom'?.12:.095)*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.26);o.start(t);o.stop(t+.27);}
      else if(kind==='metal'){o.type='square';o.frequency.setValueAtTime(230,t);o.frequency.exponentialRampToValueAtTime(58,t+.11);g.gain.setValueAtTime(.075*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.13);o.start(t);o.stop(t+.14);}
      else if(kind==='enemyTank'){o.type='sawtooth';o.frequency.setValueAtTime(74,t);o.frequency.exponentialRampToValueAtTime(31,t+.16);g.gain.setValueAtTime(.068*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.start(t);o.stop(t+.19);}
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
  for(i=0;i<3;i++)cover.push({x:W*(.27+i*.23)+(rng()-.5)*35,y:H*(.34+i*.13)+(rng()-.5)*25,len:36+rng()*24,rot:(rng()-.5)*.35});
  var treeCount=L.theme==='jungle'?14:L.theme==='village'?9:L.theme==='industrial'?4:L.theme==='desert'?5:7;
  for(i=0;i<treeCount;i++)trees.push({x:22+rng()*(W-44),y:safeTop+88+rng()*(H-safeTop-safeBottom-250),r:5+rng()*6,variant:(rng()*4)|0});
  for(i=0;i<7;i++)rocks.push({x:26+rng()*(W-52),y:safeTop+95+rng()*(H-safeTop-safeBottom-270),r:3+rng()*4,variant:(rng()*3)|0});
  var detailTypes={
    jungle:['bush','log','sandbag','crate'],
    desert:['rubble','sandbag','crate','scrub'],
    polar:['snow','crate','fence','rubble'],
    village:['fence','hay','crate','bush'],
    industrial:['barrel','pipe','crate','rubble']
  }[L.theme];
  for(i=0;i<11;i++)decor.push({x:25+rng()*(W-50),y:safeTop+94+rng()*(H-safeTop-safeBottom-260),type:detailTypes[(rng()*detailTypes.length)|0],rot:(rng()-.5)*.8,s:.7+rng()*.55});
  gameState.map={
    palette:p,units:unitPalette(p),
    road:{x:roadX,bendX:bendX,junctionY:junctionY},
    compound:compound,patches:patches,cover:cover,decor:decor,trees:trees,rocks:rocks
  };
}

/* ---------- GAME STATE ---------- */

function freshState(){
  var sv=loadSave();
  return {
    mode:'menu',save:sv,levelIndex:Math.min(14,sv.bestLevel||0),
    time:0,levelTime:0,levelComplete:false,
    profile:null,bunker:{x:W*.5,y:H-78,hp:100,maxHp:100,angle:-Math.PI/2},
    aim:{x:W*.5,y:H*.35},pointer:{down:false,t0:0},
    heat:0,overheat:false,eff:.75,hitMarker:0,streak:0,streakT:0,message:'',messageT:0,
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
  gameState.heat=0;gameState.overheat=false;gameState.eff=.75;gameState.hitMarker=0;gameState.streak=0;gameState.streakT=0;gameState.message='';gameState.messageT=0;
  gameState.stats={shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0};
  gameState.infantry=[];gameState.vehicles=[];gameState.air=[];gameState.paras=[];gameState.shots=[];gameState.enemyShots=[];gameState.effects=[];gameState.craters=[];gameState.wrecks=[];gameState.blood=[];gameState.burstQueue=[];
  buildMap();
  gameState.events=buildEncounterPlan();
  gameState.eventCursor=0;
  gameState.mode='playing';
}

/* ---------- ENCOUNTER DIRECTOR ---------- */

function buildEncounterPlan(){
  var L=level(),zone=L.zone,stage=L.stage;
  var pool=[
    {type:'foot',count:2+Math.min(stage,1),weight:4},
    {type:'truck',count:2+Math.min(stage,1),weight:3},
    {type:'technical',count:1,weight:2},
    {type:'heli',count:2+Math.min(zone,1),weight:1.7},
    {type:'plane',count:2+Math.min(zone,2),weight:1.7}
  ];
  if(zone>=1)pool.push({type:'halftrack',count:1,weight:1.6});
  if(zone>=2&&!L.boss)pool.push({type:'tank',count:1,weight:1.2});

  var n=L.boss?(5+Math.min(1,zone)):(7+Math.min(1,zone));
  var events=[],time=.45,lastType='';
  for(var i=0;i<n;i++){
    var total=0,j;for(j=0;j<pool.length;j++)total+=pool[j].weight;
    var r=Math.random()*total,pick=pool[0];
    for(j=0;j<pool.length;j++){r-=pool[j].weight;if(r<=0){pick=pool[j];break;}}
    if(pick.type===lastType&&Math.random()<.78)pick=pool[(pool.indexOf(pick)+1+((Math.random()*(pool.length-1))|0))%pool.length];
    var gap=(1.35+Math.random()*1.45)*DEVICE.spawnGap;
    if(Math.random()<.27)gap+=.8+Math.random()*.9;
    time+=gap;
    var count=pick.count;if(IS_IPHONE&&pick.type==='foot')count=Math.max(2,count-1);
    events.push({t:time,type:pick.type,count:count});lastType=pick.type;
  }
  if(L.boss){
    time+=(IS_IPHONE?3.4:2.8);
    events.push({t:time,type:'boss',count:1});
  }
  return events;
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
  var hp=role==='lmg'?34:role==='grenadier'?30:role==='marksman'?24:26;
  var speed=role==='lmg'?21:role==='grenadier'?20:role==='marksman'?22:23;
  var id=Math.random()*1e9|0;
  squad=squad||squadPlan(1,'direct',x);
  var roll=Math.random();
  var firePose=role==='marksman'?'prone':role==='lmg'?(roll<.82?'crouch':'stand'):(roll<.68?'stand':'crouch');
  gameState.infantry.push({
    id:id,role:role,x:x==null?laneX(rand(-95,95)):x,y:y==null?safeTop+72-rand(0,35):y,
    hp:hp,maxHp:hp,speed:speed+gameState.levelIndex*.42,alive:true,
    state:'advance',stateT:0,fireCd:rand(.58,1.30),muzzle:0,recoil:0,
    anim:Math.random()*10,anim2:Math.random()*10,angle:Math.PI/2,cover:null,suppression:0,deadT:0,
    variant:Math.abs(id)%12,firePose:firePose,lastX:x||0,lastY:y||0,stuckT:0,
    squadId:squad.id,tactic:squad.tactic,slot:squad.slot||0,squadPhase:squad.phase||0,
    flankX:squad.flankX==null?(x||gameState.map.road.x):squad.flankX,
    decisionT:rand(.8,1.7),burstCount:0,lean:rand(-.08,.08),crawlPhase:Math.random()*TAU
  });
}
function spawnFoot(n){
  var tactic=newSquadTactic(),origin=laneX(rand(-80,80)),sq=squadPlan(n,tactic,origin);
  var roles=[];
  if(n>=3)roles=['rifle','lmg','grenadier'];
  else roles=['rifle','rifle'];
  if(level().zone>=2&&Math.random()<.45)roles[roles.length-1]='marksman';
  for(var i=0;i<n;i++){
    var member={id:sq.id,tactic:sq.tactic,size:n,originX:origin,phase:sq.phase,slot:i,flankX:clamp(origin+(i-(n-1)/2)*26,30,W-30)};
    spawnInfantry(origin+(i-(n-1)/2)*17,safeTop+70-rand(0,34),roles[i%roles.length],member);
  }
}
function spawnVehicle(type,count){
  var id=Math.random()*1e9|0;
  if(type==='truck'){
    var side=Math.random()<.5?-1:1;
    var shoulder=clamp(gameState.map.road.x+side*rand(44,68),30,W-30);
    gameState.vehicles.push({
      id:id,type:'truck',x:gameState.map.road.x+rand(-8,8),baseX:gameState.map.road.x,y:safeTop+50,
      hp:90,maxHp:90,speed:44+gameState.levelIndex*.26,alive:true,state:'road',
      dropY:H*rand(.39,.54),shoulderX:shoulder,dropCount:Math.max(2,Math.min(4,count||3)),dropped:false,stopT:0,
      bodyAngle:Math.PI/2,turretAngle:Math.PI/2,turretVel:0,turretRecoil:0,fireCd:0,smoke:0,dustCd:0,damageFxCd:0
    });return;
  }
  if(type==='boss'){
    var z=level().zone,bhp=520+z*75,bx=rand(W*.25,W*.75),ta=Math.atan2(gameState.bunker.y-H*.22,gameState.bunker.x-bx);
    gameState.vehicles.push({
      id:id,type:'boss',name:level().bossName,x:bx,baseX:bx,y:H*.22,
      hp:bhp,maxHp:bhp,speed:25+z*1.15,alive:true,state:'advance',
      bodyAngle:Math.PI/2,turretAngle:ta+rand(-.45,.45),turretVel:0,turretRecoil:0,turretAimT:rand(.2,.7),
      fireCd:1.75,smoke:0,dustCd:0,damageFxCd:0,zigAmp:40+z*6,zigFreq:rand(.50,.82),zigPhase:rand(0,TAU),zigT:0,
      comboStage:0,comboHits:0,comboT:0
    });
    gameState.message='BOSS INCOMING: '+level().bossName;gameState.messageT=1.2;return;
  }
  var hp=type==='technical'?80:type==='halftrack'?150:270;
  var sp=type==='technical'?52:type==='halftrack'?37:26;
  var x=type==='tank'?rand(W*.13,W*.87):laneX(rand(-35,35));
  var aim=Math.atan2(gameState.bunker.y-(safeTop+48),gameState.bunker.x-x);
  gameState.vehicles.push({
    id:id,type:type,x:x,baseX:x,y:safeTop+48,hp:hp,maxHp:hp,speed:sp+gameState.levelIndex*.16,alive:true,state:'advance',
    bodyAngle:Math.PI/2,turretAngle:aim+rand(-.55,.55),turretVel:0,turretRecoil:0,turretAimT:rand(.25,.85),
    fireCd:rand(.85,1.45),smoke:0,dustCd:0,damageFxCd:0,dropped:false,
    zigAmp:type==='tank'?rand(48,100):type==='halftrack'?rand(20,45):rand(12,30),
    zigFreq:type==='tank'?rand(.50,.88):rand(.72,1.18),zigPhase:rand(0,TAU),zigT:0,trackT:0
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
  for(var i=0;i<Math.min(n,IS_IPHONE?12:18);i++)pushEffect({type:'blood',x:x+rand(-5,5),y:y+rand(-5,5),vx:rand(-34,34),vy:rand(-38,12),r:rand(1.1,2.5),t:0,life:rand(.38,.70)});
  gameState.blood.push({x:x+rand(-4,4),y:y+rand(-4,4),r:big?rand(7,11):rand(3,6),rot:rand(0,TAU),shade:(Math.random()*3)|0});
  if(gameState.blood.length>DEVICE.maxBlood)gameState.blood.shift();
}
function explode(x,y,r,crater){
  pushEffect({type:'explosion',x:x,y:y,r:r,t:0,life:.52,variant:(Math.random()*3)|0,seed:Math.random()*999});
  for(var i=0;i<(IS_IPHONE?4:7);i++)pushEffect({type:'spark',x:x,y:y,vx:rand(-70,70),vy:rand(-80,30),t:0,life:rand(.18,.38)});emitSmoke(x,y,true);emitFlame(x,y,true);emitDebris(x,y,IS_IPHONE?3:6);
  if(crater!==false){
    gameState.craters.push({x:x,y:y,r:r*rand(.68,.95),seed:Math.random()*9999|0});
    if(gameState.craters.length>26)gameState.craters.shift();
  }
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
  if(kind!=='ap'&&kind!=='he')return;
  pushEffect({type:'fireball',x:v.x+rand(-5,5),y:v.y+rand(-5,5),r:kind==='he'?19:13,t:0,life:kind==='he'?.45:.30,variant:(Math.random()*3)|0,seed:Math.random()*1000});
  for(var i=0;i<(IS_IPHONE?3:6);i++)pushEffect({type:'spark',x:v.x+rand(-7,7),y:v.y+rand(-7,7),vx:rand(-80,80),vy:rand(-85,30),t:0,life:rand(.18,.38)});
  emitSmoke(v.x,v.y,kind==='he');if(kind==='he')emitDebris(v.x,v.y,IS_IPHONE?3:6);AudioSys.tone('metal');
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
  gameState.stats.kills++;gameState.eff=clamp(gameState.eff+.024,0,1);addStreak();
  addBlood(e.x,e.y,kind==='he'?15:kind==='ap'?8:5,kind==='he');
  AudioSys.tone('hit',.75);
}
function damageInfantry(e,dmg,kind){
  if(!e.alive)return false;
  e.hp-=dmg;hitFeedback(e.x,e.y,dmg);
  if(e.hp<=0){killInfantry(e,kind);return true;}
  addBlood(e.x,e.y,2,false);return false;
}
function bossNeed(v){
  return v.comboStage===0?'MG '+v.comboHits+'/2':v.comboStage===1?'AP':'HE';
}
function killBoss(v){
  v.alive=false;gameState.stats.vehicleKills++;gameState.eff=clamp(gameState.eff+.08,0,1);addStreak();
  gameState.wrecks.push({type:'boss',x:v.x,y:v.y,bodyAngle:v.bodyAngle,variant:v.id%4});
  explode(v.x,v.y,48,true);
  gameState.message='BOSS DESTROYED';gameState.messageT=1.0;
}
function damageBoss(v,dmg,kind){
  if(kind==='mg'&&v.comboStage===0){
    v.comboHits++;v.comboT=IS_IPHONE?9:7;hitFeedback(v.x,v.y,1);
    if(v.comboHits>=2){v.comboStage=1;v.comboHits=0;gameState.message='ARMOR OPEN — AP';gameState.messageT=.65;}
    else{gameState.message='MG 1/2';gameState.messageT=.24;}
    return false;
  }
  if(kind==='ap'&&v.comboStage===1){
    v.comboStage=2;v.comboT=IS_IPHONE?9:7;vehicleHitFx(v,'ap');gameState.message='PLATE BROKEN — HE';gameState.messageT=.65;return false;
  }
  if(kind==='he'&&v.comboStage===2){
    var chunk=v.maxHp*(.36+gameState.save.upgrades.damage*.02);
    v.hp-=chunk;vehicleHitFx(v,'he');hitFeedback(v.x,v.y,chunk);
    v.comboStage=0;v.comboHits=0;v.comboT=0;gameState.eff=clamp(gameState.eff+.03,0,1);
    gameState.message='FULL COMBO';gameState.messageT=.65;
    if(v.hp<=0){killBoss(v);return true;}
    return false;
  }
  gameState.message='BOSS NEEDS '+bossNeed(v);gameState.messageT=.24;return false;
}
function damageVehicle(v,dmg,kind){
  if(!v.alive)return false;
  if(v.type==='boss')return damageBoss(v,dmg,kind);
  var mult=kind==='mg'?((v.type==='technical'||v.type==='truck')?.28:.02):(kind==='ap'?1.90:(kind==='he'?.64:1));
  var dealt=dmg*mult;v.hp-=dealt;hitFeedback(v.x,v.y,dealt);vehicleHitFx(v,kind);
  if(kind==='ap'&&(v.type==='halftrack'||v.type==='tank'))v.trackT=4.0;
  if(v.hp<=0){
    v.alive=false;gameState.stats.vehicleKills++;gameState.eff=clamp(gameState.eff+.03,0,1);addStreak();
    gameState.wrecks.push({type:v.type,x:v.x,y:v.y,bodyAngle:v.bodyAngle,variant:v.id%4});
    if(gameState.wrecks.length>16)gameState.wrecks.shift();
    explode(v.x,v.y,28,true);return true;
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
    if(d<bestD&&d<100){best=c;bestD=d;}
  }
  return best;
}
function enemyFire(e){
  var dx=gameState.bunker.x-e.x,dy=gameState.bunker.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;
  var kind=e.role==='grenadier'?'grenade':e.role==='lmg'?'lmg':e.role==='marksman'?'marksman':'rifle';
  var speed=kind==='grenade'?145:kind==='marksman'?385:305;
  var dmg=(kind==='grenade'?8:kind==='lmg'?3.0:kind==='marksman'?4.6:2.25)*DEVICE.enemyDamage;
  var mx=e.x+Math.cos(e.angle)*10,my=e.y+Math.sin(e.angle)*10;gameState.enemyShots.push({x:mx,y:my,px:mx,py:my,vx:dx/d*speed,vy:dy/d*speed,kind:kind,dmg:dmg,life:kind==='grenade'?2.4:1.5});
  e.muzzle=.09;e.recoil=1;emitMuzzle(mx,my,e.angle,false);AudioSys.tone('enemy',.55);
}
function updateInfantry(dt){
  for(var i=0;i<gameState.infantry.length;i++){
    var e=gameState.infantry[i];
    e.anim+=dt*(e.state==='advance'?4.6:e.state==='crawl'?3.1:1.8);e.anim2+=dt*(2.2+(e.variant%3)*.25);e.crawlPhase+=dt*3.4;
    e.stateT+=dt;e.decisionT-=dt;e.muzzle=Math.max(0,e.muzzle-dt);e.recoil=Math.max(0,e.recoil-dt*8);e.suppression=Math.max(0,e.suppression-dt*.20);
    if(!e.alive){e.deadT+=dt;continue;}

    var moved=dist(e.x,e.y,e.lastX||e.x,e.lastY||e.y);e.stuckT=moved<.08?e.stuckT+dt:0;e.lastX=e.x;e.lastY=e.y;
    var target=tacticalPoint(e),dx=target.x-e.x,dy=target.y-e.y,dTarget=Math.sqrt(dx*dx+dy*dy)||1;
    var bdx=gameState.bunker.x-e.x,bdy=gameState.bunker.y-e.y,dB=Math.sqrt(bdx*bdx+bdy*bdy)||1;
    e.angle=Math.atan2(bdy,bdx);

    if(e.suppression>.72&&e.state!=='suppressed'&&e.state!=='crawl'){e.state='suppressed';e.stateT=0;e.cover=nearestCover(e);}
    if(e.stuckT>2.8){e.state='advance';e.cover=null;e.stuckT=0;e.flankX=clamp(e.flankX+rand(-35,35),35,W-35);}

    var supportRole=e.role==='marksman'||e.role==='lmg';
    var preferred=e.role==='marksman'?245:e.role==='lmg'?215:e.role==='grenadier'?195:170;

    if(e.state==='advance'){
      if(!squadIsMoving(e)&&dB<285){e.state='covering';e.stateT=0;}
      else if(supportRole&&dB<preferred+25){e.state='fire';e.stateT=0;}
      else if(!e.cover&&e.y<H*.62&&Math.random()<dt*.28)e.cover=nearestCover(e);
      else if(e.cover&&dist(e.x,e.y,e.cover.x,e.cover.y)<15){e.state='cover';e.stateT=0;e.coverT=rand(1.0,1.9);}
      else if(dB<preferred){e.state='fire';e.stateT=0;}
      else{
        var sp=e.speed*DEVICE.enemySpeed*(1-e.suppression*.40);
        if(e.tactic==='flankLeft'||e.tactic==='flankRight'||e.tactic==='split')sp*=.94;
        e.x+=dx/dTarget*sp*dt;e.y+=dy/dTarget*sp*dt;
      }
    }else if(e.state==='covering'){
      e.fireCd-=dt;
      if(e.fireCd<=0&&dB<300){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.42:rand(.82,1.25);}
      if(squadIsMoving(e)||e.stateT>2.2){e.state='advance';e.stateT=0;}
    }else if(e.state==='cover'){
      e.fireCd-=dt;
      if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.40:e.role==='marksman'?1.22:rand(.78,1.18);}
      if(e.stateT>e.coverT){e.cover=null;e.state='advance';e.stateT=0;}
    }else if(e.state==='suppressed'){
      if(e.cover){var cdx=e.cover.x-e.x,cdy=e.cover.y-e.y,cd=Math.sqrt(cdx*cdx+cdy*cdy)||1;e.x+=cdx/cd*e.speed*.42*dt;e.y+=cdy/cd*e.speed*.42*dt;e.state='crawl';e.stateT=0;}
      else if(e.stateT>.85){e.state='crawl';e.stateT=0;}
    }else if(e.state==='crawl'){
      var crawlTarget=e.cover||target,cdx2=crawlTarget.x-e.x,cdy2=crawlTarget.y-e.y,cd2=Math.sqrt(cdx2*cdx2+cdy2*cdy2)||1;
      e.x+=cdx2/cd2*e.speed*.34*dt;e.y+=cdy2/cd2*e.speed*.34*dt;
      if((e.cover&&cd2<14)||e.stateT>1.4){e.state=e.cover?'cover':'advance';e.stateT=0;}
    }else if(e.state==='fire'){
      e.fireCd-=dt;
      if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.36:e.role==='grenadier'?1.45:e.role==='marksman'?1.28:rand(.78,1.16);}
      if(e.decisionT<=0){
        e.decisionT=rand(.9,1.7);
        if(e.burstCount>=2&&Math.random()<.48){e.burstCount=0;e.state='advance';e.stateT=0;e.cover=null;e.flankX=clamp(e.flankX+rand(-45,45),35,W-35);}
      }
      if(dB>preferred+75){e.state='advance';e.stateT=0;}
    }
  }
  gameState.infantry=gameState.infantry.filter(function(e){return e.alive||e.deadT<7;});
}
function updateVehicleTurret(v,dt){
  if(v.type==='truck')return;
  v.turretRecoil=Math.max(0,(v.turretRecoil||0)-dt*4.6);
  v.turretAimT=(v.turretAimT||0)-dt;
  var targetAngle=Math.atan2(gameState.bunker.y-v.y,gameState.bunker.x-v.x);
  if(v.turretAimT<=0){
    v.turretAimT=rand(.18,.45);
    v.turretTarget=targetAngle+rand(-.025,.025);
  }
  var target=v.turretTarget==null?targetAngle:v.turretTarget;
  var err=angleDelta(v.turretAngle,target);
  var maxSpeed=v.type==='boss'?1.00:v.type==='tank'?.82:v.type==='halftrack'?1.45:1.9;
  var accel=v.type==='boss'?1.9:v.type==='tank'?2.2:3.4;
  var desiredVel=clamp(err*2.8,-maxSpeed,maxSpeed);
  v.turretVel+=(clamp(desiredVel-v.turretVel,-accel*dt,accel*dt));
  if(Math.abs(err)<.02)v.turretVel*=Math.pow(.12,dt);
  v.turretAngle+=v.turretVel*dt;
  return {error:Math.abs(angleDelta(v.turretAngle,targetAngle)),settled:Math.abs(v.turretVel)<.30};
}
function vehicleMuzzle(v){
  var len=v.type==='boss'?47:v.type==='tank'?31:v.type==='halftrack'?20:17;
  var recoil=(v.turretRecoil||0)*(v.type==='boss'?6:4);
  len-=recoil;
  return {x:v.x+Math.cos(v.turretAngle)*len,y:v.y+Math.sin(v.turretAngle)*len};
}
function updateVehicleDamageParticles(v,dt){
  v.damageFxCd=(v.damageFxCd||0)-dt;
  var ratio=v.hp/v.maxHp;
  if(ratio<.68&&v.damageFxCd<=0){
    v.damageFxCd=ratio<.32?rand(.08,.15):rand(.18,.30);
    emitSmoke(v.x+rand(-5,5),v.y+rand(-5,5),ratio<.38);
    if(ratio<.38&&Math.random()<.65)emitFlame(v.x+rand(-5,5),v.y+rand(-5,5),ratio<.20);
  }
}
function updateVehicles(dt){
  for(var i=0;i<gameState.vehicles.length;i++){
    var v=gameState.vehicles[i];if(!v.alive)continue;
    v.smoke=Math.max(0,v.smoke-dt);v.dustCd-=dt;if(v.trackT)v.trackT=Math.max(0,v.trackT-dt);if(v.zigT!=null)v.zigT+=dt;
    updateVehicleDamageParticles(v,dt);
    if(v.type==='boss'&&v.comboStage>0){v.comboT-=dt;if(v.comboT<=0){v.comboStage=0;v.comboHits=0;gameState.message='BOSS COMBO RESET';gameState.messageT=.35;}}
    var turretState=updateVehicleTurret(v,dt)||{error:0,settled:true};

    if(v.type==='truck'){
      if(v.state==='road'){
        var go=Math.min(v.speed*DEVICE.enemySpeed*dt,Math.max(0,v.dropY-v.y));v.y+=go;v.bodyAngle=approachAngle(v.bodyAngle,Math.PI/2,dt*2.4);
        if(v.y>=v.dropY-1)v.state='shoulder';
      }else if(v.state==='shoulder'){
        var dx=v.shoulderX-v.x,step=Math.sign(dx)*Math.min(Math.abs(dx),v.speed*.70*dt);
        v.x+=step;v.y+=v.speed*.10*dt;v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(v.speed*.10,step/dt||.001),dt*3.1);
        if(Math.abs(dx)<2){
          v.state='unload';v.stopT=1.3;
          if(!v.dropped){
            v.dropped=true;
            var sid=squadPlan(v.dropCount,v.shoulderX<gameState.map.road.x?'flankLeft':'flankRight',v.x);
            for(var k=0;k<v.dropCount;k++){var member={id:sid.id,tactic:sid.tactic,size:v.dropCount,originX:v.x,phase:sid.phase,slot:k,flankX:v.shoulderX+(k-(v.dropCount-1)/2)*18};spawnInfantry(v.x+(k-(v.dropCount-1)/2)*14,v.y+17+Math.abs(k-(v.dropCount-1)/2)*3,k===1?'lmg':'rifle',member);}
            gameState.message='ROADSIDE FIRETEAM';gameState.messageT=.32;
          }
        }
      }else if(v.state==='unload'){v.stopT-=dt;if(v.stopT<=0)v.state='depart';}
      else{v.y+=v.speed*.88*dt;v.bodyAngle=approachAngle(v.bodyAngle,Math.PI/2,dt*2.3);if(v.y>H+75)v.alive=false;}
      if(v.dustCd<=0&&v.state!=='unload'){v.dustCd=.25;pushEffect({type:'dust',x:v.x+rand(-7,7),y:v.y+14,r:rand(3,5),t:0,life:.5});}
      continue;
    }

    var stopY=gameState.bunker.y-(v.type==='boss'?205:v.type==='tank'?160:128);
    if(v.y<stopY){
      var sp=v.speed*DEVICE.enemySpeed*(v.trackT>0?.55:1);
      var targetX=clamp(v.baseX+Math.sin(v.zigT*v.zigFreq+v.zigPhase)*v.zigAmp,28,W-28);
      var vx=clamp((targetX-v.x)*1.12,-sp*.84,sp*.84),vy=Math.sqrt(Math.max(0,sp*sp-vx*vx));
      v.x+=vx*dt;v.y+=vy*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(vy,vx||.001),dt*(v.type==='tank'||v.type==='boss'?1.45:2.1));
      if(v.type==='halftrack'&&!v.dropped&&v.y>H*.46){
        v.dropped=true;var hs=squadPlan(2,'bound',v.x);
        spawnInfantry(v.x-14,v.y+14,'lmg',{id:hs.id,tactic:'bound',phase:hs.phase,slot:0,flankX:v.x-30});
        spawnInfantry(v.x+14,v.y+14,'rifle',{id:hs.id,tactic:'bound',phase:hs.phase,slot:1,flankX:v.x+30});
      }
      if(v.dustCd<=0){v.dustCd=.25;pushEffect({type:'dust',x:v.x+rand(-8,8),y:v.y+14,r:rand(3,6),t:0,life:.55});}
    }else{
      v.fireCd-=dt;
      var canFire=turretState.error<(v.type==='boss'?.055:v.type==='tank'?.065:.10)&&turretState.settled;
      if(v.fireCd<=0&&canFire){
        var dmg=(v.type==='boss'?8.5:v.type==='tank'?10.5:v.type==='halftrack'?5:v.type==='technical'?4:0)*DEVICE.enemyDamage;
        if(dmg>0){
          var speed=v.type==='boss'?350:v.type==='tank'?325:390,m=vehicleMuzzle(v);
          gameState.enemyShots.push({x:m.x,y:m.y,px:m.x,py:m.y,vx:Math.cos(v.turretAngle)*speed,vy:Math.sin(v.turretAngle)*speed,kind:(v.type==='tank'||v.type==='boss')?'shell':'vehicle',dmg:dmg,life:1.8});
          v.turretRecoil=1;emitMuzzle(m.x,m.y,v.turretAngle,v.type==='tank'||v.type==='boss');
          AudioSys.tone(v.type==='tank'||v.type==='boss'?'enemyTank':'enemy',.72);
          v.fireCd=v.type==='boss'?1.90:v.type==='tank'?2.00:.92;
          v.turretTarget+=rand(-.04,.04);
        }
      }
    }
  }
  gameState.vehicles=gameState.vehicles.filter(function(v){return v.alive||v.state!=='depart';});
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
  for(var i=0;i<n;i++)gameState.burstQueue.push({t:i*.075,x:x,y:y});
}
function fireWeapon(kind,x,y){
  if(gameState.overheat){gameState.message='BARREL HOT';gameState.messageT=.3;return;}
  var heat=kind==='ap'?.07:kind==='he'?.11:.012;
  gameState.heat=clamp(gameState.heat+heat*gameState.profile.heatScale,0,1);
  if(gameState.heat>=.99)gameState.overheat=true;

  var damage=(kind==='mg'?7:kind==='ap'?72:50)*gameState.profile.damage;
  var speed=(kind==='mg'?500:kind==='ap'?415:320)*gameState.profile.projectileSpeed;
  var sx=gameState.bunker.x,sy=gameState.bunker.y-10;
  var dx=x-sx,dy=y-sy,d=Math.sqrt(dx*dx+dy*dy)||1;
  var spread=(kind==='mg'?.024:kind==='ap'?.006:.009)*(1+gameState.heat*.85),ang=Math.atan2(dy,dx)+rand(-spread,spread);
  gameState.shots.push({
    kind:kind,x:sx,y:sy,px:sx,py:sy,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,
    damage:damage,range:Math.hypot(W,H)*1.2,targetDist:d,traveled:0,active:true,radius:kind==='he'?gameState.profile.heRadius:0,suppressed:{}
  });
  gameState.stats.shots++;AudioSys.tone(kind);
}
function applySuppression(b){
  if(b.kind!=='mg')return;
  for(var i=0;i<gameState.infantry.length;i++){
    var e=gameState.infantry[i];if(!e.alive||b.suppressed[e.id])continue;
    var d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);
    if(d<25&&d>9){b.suppressed[e.id]=1;e.suppression=clamp(e.suppression+.20,0,1);}
  }
}
function resolveHit(b){
  var best=null,type='',bd=9999,d,i,e,v,a;
  for(i=0;i<gameState.infantry.length;i++){
    e=gameState.infantry[i];if(!e.alive)continue;
    d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);
    if(d<12*DEVICE.hitRadius&&d<bd){best=e;type='infantry';bd=d;}
  }
  for(i=0;i<gameState.vehicles.length;i++){
    v=gameState.vehicles[i];if(!v.alive)continue;
    d=pointSegDist(v.x,v.y,b.px,b.py,b.x,b.y);
    var r=(v.type==='boss'?35:19)*DEVICE.hitRadius;
    if(d<r&&d<bd){best=v;type='vehicle';bd=d;}
  }
  for(i=0;i<gameState.paras.length;i++){
    e=gameState.paras[i];if(!e.alive)continue;
    d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);
    if(d<14*DEVICE.hitRadius&&d<bd){best=e;type='para';bd=d;}
  }
  for(i=0;i<gameState.air.length;i++){
    a=gameState.air[i];if(!a.alive)continue;
    d=pointSegDist(a.x,a.y,b.px,b.py,b.x,b.y);
    if(d<(a.type==='heli'?26:21)*DEVICE.hitRadius&&d<bd){best=a;type='air';bd=d;}
  }
  if(!best){applySuppression(b);return false;}

  gameState.stats.hits++;gameState.eff=clamp(gameState.eff+.010,0,1);
  if(b.kind==='he'){
    explode(b.x,b.y,b.radius,true);
    blast(b.x,b.y,b.radius,b.damage);
    b.active=false;return true;
  }
  if(type==='infantry')damageInfantry(best,b.damage,b.kind);
  else if(type==='vehicle')damageVehicle(best,b.damage,b.kind);
  else if(type==='air')damageAir(best,b.damage);
  else{
    best.hp-=b.damage;if(best.hp<=0){best.alive=false;gameState.stats.airKills++;addBlood(best.x,best.y,6,false);}
  }
  b.active=false;return true;
}
function blast(x,y,r,damage){
  for(var i=0;i<gameState.infantry.length;i++){
    var e=gameState.infantry[i];if(!e.alive)continue;
    var d=dist(x,y,e.x,e.y);if(d<r)damageInfantry(e,damage*(.35+.65*(1-d/r)),'he');
  }
  for(i=0;i<gameState.vehicles.length;i++){
    var v=gameState.vehicles[i];if(!v.alive)continue;
    d=dist(x,y,v.x,v.y);if(d<r*1.1)damageVehicle(v,damage*(.25+.55*(1-d/(r*1.1))),'he');
  }
}
function updateShots(dt){
  for(var i=0;i<gameState.burstQueue.length;i++)gameState.burstQueue[i].t-=dt;
  while(gameState.burstQueue.length&&gameState.burstQueue[0].t<=0){var q=gameState.burstQueue.shift();fireWeapon('mg',q.x,q.y);}

  for(i=0;i<gameState.shots.length;i++){
    var b=gameState.shots[i];if(!b.active)continue;
    b.px=b.x;b.py=b.y;
    var dx=b.vx*dt,dy=b.vy*dt;b.x+=dx;b.y+=dy;b.traveled+=Math.sqrt(dx*dx+dy*dy);
    if(resolveHit(b))continue;
    if(b.kind==='he'&&b.traveled>=b.targetDist){
      explode(b.x,b.y,b.radius,true);blast(b.x,b.y,b.radius,b.damage);b.active=false;continue;
    }
    if(b.traveled>=b.range||b.x<-30||b.x>W+30||b.y<-30||b.y>H+30){
      if(b.kind==='he'){explode(b.x,b.y,b.radius,true);blast(b.x,b.y,b.radius,b.damage*.7);}
      else{gameState.stats.misses++;gameState.eff=clamp(gameState.eff-(IS_IPHONE?.0035:.0055),0,1);}
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
    else if(e.type==='debris'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=110*dt;e.rot+=e.vr*dt;}
  }
  gameState.effects=gameState.effects.filter(function(e){return e.t<e.life;});
}
/* ---------- UPDATE ---------- */

function update(dt){
  if(!gameState||gameState.mode!=='playing')return;
  gameState.time+=dt;gameState.levelTime+=dt;
  gameState.bunker.angle=Math.atan2(gameState.aim.y-gameState.bunker.y,gameState.aim.x-gameState.bunker.x);
  gameState.messageT=Math.max(0,gameState.messageT-dt);gameState.hitMarker=Math.max(0,gameState.hitMarker-dt);
  gameState.streakT=Math.max(0,gameState.streakT-dt);if(gameState.streakT<=0)gameState.streak=0;
  gameState.heat=Math.max(0,gameState.heat-gameState.profile.cool*dt);if(gameState.overheat&&gameState.heat<.28)gameState.overheat=false;

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
  var reward=Math.round(44+gameState.levelIndex*3+gameState.eff*30+Math.max(0,gameState.bunker.hp/gameState.bunker.maxHp)*16+(isBossLevel()?45:0));
  gameState.save.supply+=reward;gameState.save.bestLevel=Math.max(gameState.save.bestLevel,Math.min(14,gameState.levelIndex+1));saveGame();
  overlay.classList.remove('hidden');
  titleEl.textContent=gameState.levelIndex>=14?'CAMPAIGN COMPLETE':isBossLevel()?'BOSS DEFEATED':'MAP CLEARED';
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
  var p=pointerPos(ev);gameState.pointer.down=true;gameState.pointer.t0=performance.now();gameState.aim=p;
  try{canvas.setPointerCapture(ev.pointerId);}catch(e){}
  ev.preventDefault();
},{passive:false});
canvas.addEventListener('pointermove',function(ev){
  if(!gameState||gameState.mode!=='playing')return;
  gameState.aim=pointerPos(ev);if(gameState.pointer.down)ev.preventDefault();
},{passive:false});
canvas.addEventListener('pointerup',function(ev){
  if(!gameState||gameState.mode!=='playing'||!gameState.pointer.down)return;
  var p=pointerPos(ev),hold=(performance.now()-gameState.pointer.t0)/1000*gameState.profile.chargeScale;
  gameState.pointer.down=false;gameState.aim=p;
  if(hold<.20)queueMG(p.x,p.y);else if(hold<.62)fireWeapon('ap',p.x,p.y);else fireWeapon('he',p.x,p.y);
  ev.preventDefault();
},{passive:false});
canvas.addEventListener('pointercancel',function(){if(gameState)gameState.pointer.down=false;});

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
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.strokeStyle=p.trench;ctx.lineCap='round';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-c.len/2,0);ctx.lineTo(c.len/2,0);ctx.stroke();ctx.strokeStyle=tone(p.trench,.18);ctx.lineWidth=2;ctx.stroke();ctx.restore();
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
  var rng=seeded(c.seed);ctx.save();ctx.translate(c.x,c.y);ctx.fillStyle='rgba(39,32,24,.22)';ctx.strokeStyle=p.line;ctx.lineWidth=1.3;ctx.beginPath();
  for(var i=0;i<13;i++){var a=i/13*TAU,rr=c.r*(.80+rng()*.25),x=Math.cos(a)*rr,y=Math.sin(a)*rr*.72;if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
function drawBlood(b){
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);ctx.globalAlpha=.42;ctx.fillStyle=b.shade===0?'#5d2020':b.shade===1?'#712925':'#4e1b1d';ctx.beginPath();ctx.ellipse(0,0,b.r,b.r*.52,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(b.r*.7,-b.r*.25,b.r*.22,0,TAU);ctx.fill();ctx.restore();
}
function drawMap(){
  var m=gameState.map,p=m.palette;
  ctx.fillStyle=p.ground;ctx.fillRect(0,0,W,H);
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

/* ---------- RENDER: PIXEL INFANTRY ---------- */

var INF_SPR={
  w:10,h:12,
  roles:['rifle','lmg','grenadier','marksman'],
  dirs:['down','left','right','up'],
  poses:['idle','idle2','walk1','walk2','walk3','walk4','standFire','crouch','crouchFire','prone','proneFire','dead1','dead2'],
  skins:3,
  phoneScale:1.38,
  desktopScale:1.56
};
var infantryAtlas=null;
var infantryAtlasLevel=-1;

function spritePx(g,x,y,w,h,color){
  g.fillStyle=color;
  g.fillRect(x|0,y|0,w|0,h|0);
}
function spriteRoleIndex(role){
  var i=INF_SPR.roles.indexOf(role);
  return i<0?0:i;
}
function spriteColors(role,skin){
  var idx=spriteRoleIndex(role);
  var src=gameState.map.units[idx%gameState.map.units.length];
  var light=src.light,body=src.body,dark=src.dark,line=src.line;
  if(skin===1){body=tone(body,.07);dark=tone(dark,-.05);}
  else if(skin===2){body=mixHex(body,gameState.map.palette.road,.10);light=tone(light,.08);}
  return {body:body,light:light,dark:dark,line:line,gun:tone(line,-.10),flash:'#ffd45a'};
}
function spritePose(e){
  if(!e.alive)return e.deadT<.22?'dead1':'dead2';
  if(e.state==='crawl')return e.muzzle>0?'proneFire':'prone';
  if(e.state==='cover'||e.state==='covering'||e.state==='suppressed')return e.muzzle>0?'crouchFire':'crouch';
  if(e.state==='fire'){
    if(e.firePose==='prone')return e.muzzle>0?'proneFire':'prone';
    if(e.firePose==='crouch')return e.muzzle>0?'crouchFire':'crouch';
    return e.muzzle>0?'standFire':'idle';
  }
  if(e.state==='advance'){
    var f=((e.anim*3.15)|0)%4;
    return ['walk1','walk2','walk3','walk4'][f];
  }
  return ((e.anim2*1.3)|0)%2?'idle2':'idle';
}
function spriteDirection(e){
  var dx,dy;
  if(e.alive&&(e.state==='advance'||e.state==='crawl'||e.state==='suppressed')){
    var t=tacticalPoint(e);dx=t.x-e.x;dy=t.y-e.y;
  }else{
    dx=gameState.bunker.x-e.x;dy=gameState.bunker.y-e.y;
  }
  if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';
  return dy<0?'up':'down';
}
function drawSpriteFrame(g,ox,oy,role,dir,pose,skin){
  var C=spriteColors(role,skin),fire=pose==='standFire'||pose==='crouchFire'||pose==='proneFire';
  var crouch=pose==='crouch'||pose==='crouchFire',prone=pose==='prone'||pose==='proneFire';
  var dead=pose==='dead1'||pose==='dead2';
  var wf=pose==='walk1'?0:pose==='walk2'?1:pose==='walk3'?2:pose==='walk4'?3:-1;

  function P(x,y,w,h,c){spritePx(g,ox+x,oy+y,w,h,c);}

  if(dead){
    if(dir==='left'||dir==='right'){
      P(2,5,6,3,C.body);P(dir==='left'?1:8,4,2,2,C.light);P(4,8,3,1,C.dark);
      P(dir==='left'?7:0,5,3,1,C.gun);if(pose==='dead2')P(6,8,2,1,C.line);
    }else{
      P(3,4,4,5,C.body);P(4,2,2,2,C.light);P(2,8,2,1,C.dark);P(7,8,2,1,C.dark);P(7,5,2,1,C.gun);
    }
    return;
  }

  if(prone){
    if(dir==='left'){
      P(1,5,2,2,C.light);P(3,4,4,4,C.body);P(7,4,2,2,C.dark);P(0,8,3,1,C.dark);P(7,6,3,1,C.gun);
      if(role==='marksman')P(8,5,2,1,C.gun);if(role==='lmg'){P(4,3,2,1,C.dark);P(8,7,1,2,C.line);}
      if(fire)P(9,6,1,1,C.flash);
    }else if(dir==='right'){
      P(7,5,2,2,C.light);P(3,4,4,4,C.body);P(1,4,2,2,C.dark);P(7,8,3,1,C.dark);P(0,6,3,1,C.gun);
      if(role==='marksman')P(0,5,2,1,C.gun);if(role==='lmg'){P(4,3,2,1,C.dark);P(1,7,1,2,C.line);}
      if(fire)P(0,6,1,1,C.flash);
    }else if(dir==='up'){
      P(4,1,2,2,C.light);P(3,3,4,5,C.body);P(2,7,2,2,C.dark);P(6,7,2,2,C.dark);P(4,0,1,3,C.gun);
      if(role==='lmg')P(7,4,1,2,C.dark);if(fire)P(4,0,1,1,C.flash);
    }else{
      P(4,9,2,2,C.light);P(3,4,4,5,C.body);P(2,2,2,2,C.dark);P(6,2,2,2,C.dark);P(5,8,1,4,C.gun);
      if(role==='lmg')P(2,5,1,2,C.dark);if(fire)P(5,11,1,1,C.flash);
    }
    return;
  }

  if(crouch){
    if(dir==='left'){
      P(3,1,3,3,C.light);P(2,4,5,4,C.body);P(1,8,2,2,C.dark);P(5,8,2,2,C.dark);P(6,5,4,1,C.gun);
      P(1,5,2,1,C.body);if(role==='lmg')P(2,4,1,3,C.dark);if(role==='grenadier')P(6,3,1,1,C.dark);if(fire)P(9,5,1,1,C.flash);
    }else if(dir==='right'){
      P(4,1,3,3,C.light);P(3,4,5,4,C.body);P(3,8,2,2,C.dark);P(7,8,2,2,C.dark);P(0,5,4,1,C.gun);
      P(7,5,2,1,C.body);if(role==='lmg')P(7,4,1,3,C.dark);if(role==='grenadier')P(3,3,1,1,C.dark);if(fire)P(0,5,1,1,C.flash);
    }else if(dir==='up'){
      P(4,1,2,3,C.light);P(2,4,6,4,C.body);P(2,8,2,2,C.dark);P(6,8,2,2,C.dark);P(4,0,1,3,C.gun);
      P(1,5,1,2,C.body);P(8,5,1,2,C.body);if(role==='lmg')P(7,4,1,3,C.dark);if(fire)P(4,0,1,1,C.flash);
    }else{
      P(4,2,2,3,C.light);P(2,4,6,4,C.body);P(2,8,2,2,C.dark);P(6,8,2,2,C.dark);P(5,8,1,4,C.gun);
      P(1,5,1,2,C.body);P(8,5,1,2,C.body);if(role==='lmg')P(2,4,1,3,C.dark);if(fire)P(5,11,1,1,C.flash);
    }
    return;
  }

  var l1=0,l2=0;
  if(wf===0){l1=-1;l2=1;}
  else if(wf===1){l1=0;l2=0;}
  else if(wf===2){l1=1;l2=-1;}
  else if(wf===3){l1=0;l2=0;}

  if(dir==='left'){
    P(3,1,3,3,C.light);P(2,4,5,4,C.body);P(1,5,2,1,C.body);P(6,5,4,1,C.gun);
    P(clamp(2+l1,1,4),8,2,3,C.dark);P(clamp(5+l2,4,7),8,2,3,C.dark);
    if(role==='lmg')P(2,4,1,3,C.dark);if(role==='grenadier')P(6,3,1,1,C.dark);if(role==='marksman')P(8,4,2,1,C.gun);
    if(skin===1)P(3,0,3,1,C.dark);if(skin===2)P(1,6,1,2,C.light);if(fire)P(9,5,1,1,C.flash);
  }else if(dir==='right'){
    P(4,1,3,3,C.light);P(3,4,5,4,C.body);P(7,5,2,1,C.body);P(0,5,4,1,C.gun);
    P(clamp(3+l1,2,5),8,2,3,C.dark);P(clamp(6+l2,5,8),8,2,3,C.dark);
    if(role==='lmg')P(7,4,1,3,C.dark);if(role==='grenadier')P(3,3,1,1,C.dark);if(role==='marksman')P(0,4,2,1,C.gun);
    if(skin===1)P(4,0,3,1,C.dark);if(skin===2)P(8,6,1,2,C.light);if(fire)P(0,5,1,1,C.flash);
  }else if(dir==='up'){
    P(4,1,2,3,C.light);P(2,4,6,4,C.body);P(1,5,1,2,C.body);P(8,5,1,2,C.body);P(4,0,1,3,C.gun);
    P(clamp(2+l1,1,4),8,2,3,C.dark);P(clamp(6+l2,5,8),8,2,3,C.dark);
    if(role==='lmg')P(7,4,1,3,C.dark);if(role==='grenadier')P(2,3,1,1,C.dark);if(skin===1)P(3,0,4,1,C.dark);if(fire)P(4,0,1,1,C.flash);
  }else{
    P(4,2,2,3,C.light);P(2,4,6,4,C.body);P(1,5,1,2,C.body);P(8,5,1,2,C.body);P(5,8,1,4,C.gun);
    P(clamp(2+l1,1,4),8,2,3,C.dark);P(clamp(6+l2,5,8),8,2,3,C.dark);
    if(role==='lmg')P(2,4,1,3,C.dark);if(role==='grenadier')P(7,3,1,1,C.dark);if(skin===1)P(3,1,4,1,C.dark);if(fire)P(5,11,1,1,C.flash);
  }
}
function buildInfantryAtlas(){
  var cols=INF_SPR.poses.length;
  var rows=INF_SPR.roles.length*INF_SPR.skins*INF_SPR.dirs.length;
  var c=document.createElement('canvas');
  c.width=cols*INF_SPR.w;c.height=rows*INF_SPR.h;
  var g=c.getContext('2d');g.imageSmoothingEnabled=false;
  for(var r=0;r<INF_SPR.roles.length;r++){
    for(var sk=0;sk<INF_SPR.skins;sk++){
      for(var d=0;d<INF_SPR.dirs.length;d++){
        var row=((r*INF_SPR.skins+sk)*INF_SPR.dirs.length+d);
        for(var p=0;p<INF_SPR.poses.length;p++){
          drawSpriteFrame(g,p*INF_SPR.w,row*INF_SPR.h,INF_SPR.roles[r],INF_SPR.dirs[d],INF_SPR.poses[p],sk);
        }
      }
    }
  }
  infantryAtlas=c;infantryAtlasLevel=gameState.levelIndex;
}
function ensureInfantryAtlas(){
  if(!infantryAtlas||infantryAtlasLevel!==gameState.levelIndex)buildInfantryAtlas();
}
function drawSoldier(e){
  ensureInfantryAtlas();
  var pose=spritePose(e),dir=spriteDirection(e),role=spriteRoleIndex(e.role),skin=Math.abs(e.variant||0)%INF_SPR.skins;
  var poseI=INF_SPR.poses.indexOf(pose),dirI=INF_SPR.dirs.indexOf(dir);
  if(poseI<0)poseI=0;if(dirI<0)dirI=0;
  var row=((role*INF_SPR.skins+skin)*INF_SPR.dirs.length+dirI);
  var depth=clamp((e.y-safeTop)/(H-safeTop-safeBottom),0,1);
  var scale=(IS_IPHONE?INF_SPR.phoneScale:INF_SPR.desktopScale)*(.92+depth*.11);
  var dw=Math.round(INF_SPR.w*scale),dh=Math.round(INF_SPR.h*scale);

  ctx.save();
  ctx.imageSmoothingEnabled=false;
  ctx.globalAlpha=e.alive?1:clamp(1-e.deadT/7,.32,1);
  ctx.fillStyle='rgba(0,0,0,.12)';
  ctx.beginPath();
  if(pose==='prone'||pose==='proneFire')ctx.ellipse(e.x,e.y+4,5.2,2.4,0,0,TAU);
  else ctx.ellipse(e.x,e.y+5,4.2,2.0,0,0,TAU);
  ctx.fill();
  ctx.drawImage(
    infantryAtlas,
    poseI*INF_SPR.w,row*INF_SPR.h,INF_SPR.w,INF_SPR.h,
    Math.round(e.x-dw/2),Math.round(e.y-dh/2),dw,dh
  );
  ctx.restore();
}

/* ---------- RENDER: VEHICLES ---------- */

function vehiclePalette(v){return gameState.map.units[Math.abs(v.id||0)%gameState.map.units.length];}
function drawVehicle(v,wreck){
  var type=v.type||'truck',pal=vehiclePalette(v),body=v.bodyAngle==null?Math.PI/2:v.bodyAngle;
  var moving=!wreck&&v.alive&&v.state!=='unload';
  var bob=moving&&v.zigT!=null?Math.sin(v.zigT*5.2+(v.id%7))*0.45:0;
  ctx.save();ctx.translate(v.x,v.y+bob);ctx.rotate(body);ctx.globalAlpha=wreck?.55:1;ctx.strokeStyle=pal.line;ctx.lineJoin='round';ctx.lineWidth=1.5;

  if(type==='truck'){
    ctx.fillStyle=wreck?tone(pal.body,-.18):pal.body;ctx.beginPath();ctx.roundRect(-17,-10,31,20,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=pal.dark;ctx.fillRect(-14,-7,12,14);ctx.fillStyle=pal.light;ctx.fillRect(4,-6,7,5);ctx.fillRect(4,1,7,5);
    ctx.fillStyle=pal.line;ctx.fillRect(-11,-13,7,3);ctx.fillRect(5,-13,7,3);ctx.fillRect(-11,10,7,3);ctx.fillRect(5,10,7,3);
  }else if(type==='technical'){
    ctx.fillStyle=wreck?tone(pal.body,-.18):pal.body;ctx.beginPath();ctx.roundRect(-14,-9,27,18,3);ctx.fill();ctx.stroke();
    ctx.fillStyle=pal.dark;ctx.fillRect(-8,-6,11,12);
    ctx.save();ctx.rotate((v.turretAngle||body)-body);ctx.beginPath();ctx.arc(1,0,4,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(16,0);ctx.stroke();ctx.restore();
  }else if(type==='halftrack'){
    ctx.fillStyle=wreck?tone(pal.body,-.18):pal.body;ctx.beginPath();ctx.moveTo(-15,-11);ctx.lineTo(12,-11);ctx.lineTo(16,-7);ctx.lineTo(16,7);ctx.lineTo(12,11);ctx.lineTo(-15,11);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle=pal.line;ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(-12,-13);ctx.lineTo(11,-13);ctx.moveTo(-12,13);ctx.lineTo(11,13);ctx.stroke();
    ctx.lineWidth=1.4;ctx.fillStyle=pal.light;ctx.beginPath();ctx.arc(1,0,5,0,TAU);ctx.fill();ctx.stroke();
    ctx.save();ctx.rotate((v.turretAngle||body)-body);ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(18,0);ctx.stroke();ctx.restore();
  }else{
    var boss=type==='boss',scale=boss?1.50:1;ctx.scale(scale,scale);
    ctx.fillStyle=wreck?tone(pal.body,-.18):pal.body;ctx.beginPath();ctx.moveTo(-16,-12);ctx.lineTo(12,-12);ctx.lineTo(18,-8);ctx.lineTo(18,8);ctx.lineTo(12,12);ctx.lineTo(-16,12);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle=pal.line;ctx.lineWidth=4.2;ctx.beginPath();ctx.moveTo(-14,-14);ctx.lineTo(13,-14);ctx.moveTo(-14,14);ctx.lineTo(13,14);ctx.stroke();
    ctx.lineWidth=1.4;ctx.fillStyle=pal.light;ctx.beginPath();ctx.ellipse(1,0,boss?8.5:6.7,boss?7.1:5.7,0,0,TAU);ctx.fill();ctx.stroke();
    var rel=(v.turretAngle==null?body:v.turretAngle)-body,recoil=(v.turretRecoil||0)*(boss?5.5:4);
    ctx.save();ctx.translate(1,0);ctx.rotate(rel);ctx.strokeStyle=pal.line;ctx.lineWidth=boss?2.2:1.8;ctx.beginPath();ctx.moveTo(-recoil,0);ctx.lineTo((boss?32:25)-recoil,0);ctx.stroke();
    ctx.fillStyle=pal.dark;ctx.beginPath();ctx.arc(-recoil,0,boss?3.8:3,0,TAU);ctx.fill();ctx.restore();
    if(!wreck&&v.trackT>0){ctx.strokeStyle='#ddb05c';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,20,0,TAU);ctx.stroke();}
    if(type==='boss'&&!wreck){ctx.strokeStyle=v.comboStage===0?'#d9c764':v.comboStage===1?'#9dd4ee':'#ef9a48';ctx.beginPath();ctx.arc(0,0,25,0,TAU);ctx.stroke();}
  }

  if(!wreck&&v.hp!=null){
    var ratio=v.hp/v.maxHp;
    if(ratio<.38){ctx.globalAlpha=.75;ctx.fillStyle='#f07a32';ctx.beginPath();ctx.arc(-2,-3,3.2+(1-ratio)*2,0,TAU);ctx.fill();}
    else if(v.smoke>0){ctx.globalAlpha=.12;ctx.fillStyle=pal.line;ctx.beginPath();ctx.arc(-3,-2,4+v.smoke*3,0,TAU);ctx.fill();}
  }
  ctx.restore();
}
/* ---------- RENDER: AIR ---------- */

function drawHeli(a){
  var pal=gameState.map.units[Math.abs(a.id)%gameState.map.units.length];
  ctx.save();ctx.translate(a.x,a.y);
  ctx.fillStyle='rgba(0,0,0,.10)';ctx.beginPath();ctx.ellipse(7,9,29,9,0,0,TAU);ctx.fill();
  ctx.strokeStyle=pal.line;ctx.lineWidth=1.5;ctx.fillStyle=pal.body;ctx.beginPath();ctx.ellipse(-2,0,17,11,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle=pal.light;ctx.beginPath();ctx.ellipse(-8,-3,7,4.5,0,0,TAU);ctx.fill();
  ctx.fillStyle=pal.dark;ctx.beginPath();ctx.moveTo(11,-4);ctx.lineTo(41,-2);ctx.lineTo(41,3);ctx.lineTo(11,4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.rotate(a.rotor);ctx.strokeStyle=pal.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-38,0);ctx.lineTo(38,0);ctx.moveTo(0,-38);ctx.lineTo(0,38);ctx.stroke();ctx.restore();ctx.restore();
}
function drawPlane(a){
  var pal=gameState.map.units[Math.abs(a.id)%gameState.map.units.length];
  ctx.save();ctx.translate(a.x,a.y);ctx.scale(1.18,1.18);if(!a.fromLeft)ctx.scale(-1,1);
  ctx.strokeStyle=pal.line;ctx.fillStyle=pal.light;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-36,0);ctx.lineTo(-10,-5);ctx.lineTo(-2,-22);ctx.lineTo(5,-22);ctx.lineTo(9,-5);ctx.lineTo(34,0);ctx.lineTo(9,5);ctx.lineTo(5,19);ctx.lineTo(-2,19);ctx.lineTo(-9,5);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=pal.dark;ctx.fillRect(-5,-10,10,20);ctx.restore();
}
function drawPara(p){
  ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle=gameState.map.palette.line;ctx.lineWidth=1.2;ctx.fillStyle=tone(gameState.map.palette.ground,.32);
  ctx.beginPath();ctx.arc(0,-8,13,Math.PI,TAU);ctx.lineTo(13,-8);ctx.lineTo(0,-3);ctx.lineTo(-13,-8);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-11,-8);ctx.lineTo(-2,5);ctx.moveTo(11,-8);ctx.lineTo(2,5);ctx.stroke();ctx.fillStyle=gameState.map.units[0].body;ctx.beginPath();ctx.arc(0,7,2.2,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
}

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
    }else if(e.type==='ember'){
      ctx.globalAlpha=q;ctx.fillStyle='#ffb43b';ctx.fillRect(e.x-1,e.y-1,2,2);
    }else if(e.type==='blood'){
      ctx.globalAlpha=q*.9;ctx.fillStyle='#762423';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();
    }else if(e.type==='spark'){
      ctx.globalAlpha=q;ctx.fillStyle='#ffe176';ctx.fillRect(e.x-1,e.y-1,2,2);
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
    var b=gameState.shots[i];ctx.strokeStyle=b.kind==='mg'?'#f1d278':b.kind==='ap'?'#a8d9ee':'#ef994a';ctx.lineWidth=b.kind==='mg'?1.2:2.2;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  for(i=0;i<gameState.enemyShots.length;i++){
    b=gameState.enemyShots[i];ctx.strokeStyle=b.kind==='grenade'?'#d88742':'rgba(235,215,162,.70)';ctx.lineWidth=b.kind==='shell'?2:1;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
}
function drawBunker(){
  var b=gameState.bunker,p=gameState.map.units[1];
  ctx.save();ctx.translate(b.x,b.y);ctx.fillStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.ellipse(3,7,33,17,0,0,TAU);ctx.fill();
  ctx.fillStyle=p.body;ctx.strokeStyle=p.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-29,12);ctx.lineTo(-24,-9);ctx.quadraticCurveTo(0,-22,24,-9);ctx.lineTo(29,12);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=p.light;ctx.beginPath();ctx.arc(0,-2,9,0,TAU);ctx.fill();ctx.stroke();ctx.rotate(b.angle+Math.PI/2);ctx.strokeStyle=p.line;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(0,-31);ctx.stroke();ctx.restore();
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
  if(gameState.pointer.down){
    var hold=(performance.now()-gameState.pointer.t0)/1000*gameState.profile.chargeScale,label=hold<.20?'MG':hold<.62?'AP':'HE',charge=clamp(hold/.62,0,1);
    ctx.textAlign='right';ctx.fillStyle=label==='MG'?'#d7cfad':label==='AP'?'#9dd4ee':'#ee9c4b';ctx.fillText(label,W-20,bottom-20);
    ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(W-78,bottom-10,58,4);ctx.fillStyle=label==='HE'?'#ee9c4b':'#9dd4ee';ctx.fillRect(W-78,bottom-10,58*charge,4);
  }
  if(gameState.streak>1&&gameState.streakT>0){ctx.textAlign='left';ctx.fillStyle='#e8cf72';ctx.fillText('STREAK '+gameState.streak,20,bottom-7);}

  var boss=getBoss();
  if(boss){
    var by=top+62,bx=18,bww=W-36;ctx.fillStyle='rgba(20,23,18,.84)';ctx.fillRect(bx,by,bww,36);
    ctx.font='900 9px system-ui,-apple-system,sans-serif';ctx.textAlign='left';ctx.fillStyle='#e6d9ab';ctx.fillText(boss.name+'  HP '+Math.max(0,Math.round(boss.hp/boss.maxHp*100))+'%',bx+7,by+10);
    ctx.textAlign='right';ctx.fillStyle=boss.comboStage===0?'#d8c866':boss.comboStage===1?'#9dd4ee':'#ee9c4b';ctx.fillText('COMBO: '+bossNeed(boss),bx+bww-7,by+10);
    ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(bx+7,by+20,bww-14,7);ctx.fillStyle='#b45a48';ctx.fillRect(bx+7,by+20,(bww-14)*clamp(boss.hp/boss.maxHp,0,1),7);
  }
  if(gameState.messageT>0){
    var my=top+(boss?104:62);ctx.font='900 12px system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(21,25,18,.80)';ctx.fillRect(W*.5-110,my,220,26);ctx.fillStyle='#ead88f';ctx.fillText(gameState.message,W*.5,my+13);
  }
  ctx.restore();
}

/* ---------- RENDER ---------- */

function render(){
  if(!gameState)return;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  drawMap();

  var i,v,e,a,p;
  for(i=0;i<gameState.vehicles.length;i++){v=gameState.vehicles[i];if(v.alive&&v.x>-80&&v.x<W+80&&v.y>-90&&v.y<H+90)drawVehicle(v,false);}
  for(i=0;i<gameState.infantry.length;i++){e=gameState.infantry[i];if(e.x>-40&&e.x<W+40&&e.y>-50&&e.y<H+50)drawSoldier(e);}
  for(i=0;i<gameState.air.length;i++){a=gameState.air[i];if(a.alive&&a.x>-110&&a.x<W+110&&a.y>-110&&a.y<H+110){if(a.type==='heli')drawHeli(a);else drawPlane(a);}}
  for(i=0;i<gameState.paras.length;i++){p=gameState.paras[i];if(p.alive)drawPara(p);}
  drawShots();drawEffects();drawBunker();drawCrosshair();drawHud();
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