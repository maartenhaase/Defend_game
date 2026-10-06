(function(){
'use strict';

/* =========================
   JBD V8.8.6 BATTLEFIELD VARIETY
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
var SAVE_KEY='jbd_v8_7_2_tactical_balance_save';
var IS_IPHONE=/iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);

var W=0,H=0,DPR=1,safeTop=0,safeBottom=0,last=0,acc=0;
var gameState=null;

/* ---------- CONFIG ---------- */

var HE_HOLD=.76;
var MAX_WEAPON_LEVEL=19;
var SKILL_MAX=5;

var ST_MODE=false;
var CELL_SHADE=true;
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
  jungle:{ground:'#6f845f',ground2:'#536c4d',road:'#a28b63',roadEdge:'#67543a',line:'#172019',veg:'#34583c',veg2:'#5d7b52',building:'#81735b',roof:'#55483a',rock:'#7c8075',trench:'#5d4836'},
  desert:{ground:'#c3ad76',ground2:'#9b7d52',road:'#aa895f',roadEdge:'#6b5138',line:'#211d18',veg:'#66714d',veg2:'#88915e',building:'#9a7e58',roof:'#654b37',rock:'#898377',trench:'#654833'},
  polar:{ground:'#d8ddd1',ground2:'#b7c2b8',road:'#929a95',roadEdge:'#6f7770',line:'#1c2321',veg:'#49696a',veg2:'#6f8c8a',building:'#8e9690',roof:'#526b6c',rock:'#858d88',trench:'#68736f'},
  village:{ground:'#808460',ground2:'#65764f',road:'#9d835d',roadEdge:'#604d37',line:'#1c2119',veg:'#3f623e',veg2:'#668356',building:'#91745a',roof:'#604537',rock:'#7a786b',trench:'#5b4434'},
  industrial:{ground:'#737668',ground2:'#585b50',road:'#858b87',roadEdge:'#515a57',line:'#171c1a',veg:'#405640',veg2:'#61715b',building:'#6d716c',roof:'#373c39',rock:'#7e817d',trench:'#454a45'}
};
var ZONES=[
  {type:'JUNGLE',theme:'jungle',names:['Jungle Entry','Jungle Track','Jungle Ambush','Canopy Pass','Supply Trail','Forward Camp','Jungle Fortress','Last Canopy']},
  {type:'DESERT',theme:'desert',names:['Desert Convoy','Dust Road','Dry Basin','Desert Depot','Broken Highway','Gun Line','Desert Citadel','Heat Front']},
  {type:'POLAR',theme:'polar',names:['Polar Ridge','Ice Route','White Outpost','Frozen Track','Polar Station','Cold Front','Polar Stronghold','Last Ridge']},
  {type:'VILLAGE',theme:'village',names:['Village Road','Farm Lane','Village Square','Old Depot','Stone Quarter','Market Line','Village Keep','Final Street']},
  {type:'INDUSTRIAL',theme:'industrial',names:['Industrial Yard','Rail Spur','Factory Gate','Industrial Works','Machine Hall','Freight Line','Industrial Core','End Sector']}
];
var CAMPAIGN_LENGTH=40;
var LEVELS=[];
(function(){
  var seed=17;
  for(var z=0;z<ZONES.length;z++){
    for(var st=0;st<8;st++){
      LEVELS.push({zone:z,stage:st%3,actStage:st,type:ZONES[z].type,theme:ZONES[z].theme,name:ZONES[z].names[st],seed:seed});
      seed+=23+z*4+st*3;
    }
  }
})();
var UPGRADES={
  primary:{label:'PRIMARY',desc:'20 weapon tiers'},
  special:{label:'SUPPORT',desc:'20 support tiers'},
  aiming:{label:'AIM / STABILITY',desc:'smaller spread + steadier aim'},
  reload:{label:'RELOAD SPEED',desc:'faster reloads'},
  armor:{label:'ARMOR / HEALTH',desc:'more HP + damage reduction'}
};
var PRIMARY_DB=[
{name:'KAR 98K',era:1935,cls:'bolt rifle',ammo:'7.92 rifle',mag:5,reload:1.85,cycle:.72,damage:18.5,range:.62,speed:720,burst:1,gap:.72,spread:.82,projectile:'bullet',splash:0,homing:0},
{name:'KAR 98K · ZF39',era:1939,cls:'scoped bolt rifle',ammo:'7.92 rifle',mag:5,reload:1.78,cycle:.68,damage:19.2,range:.68,speed:735,burst:1,gap:.68,spread:.66,projectile:'bullet',splash:0,homing:0},
{name:'KAR 98K · VETERAN',era:1942,cls:'bolt rifle',ammo:'7.92 rifle',mag:5,reload:1.66,cycle:.61,damage:20,range:.71,speed:745,burst:1,gap:.61,spread:.58,projectile:'bullet',splash:0,homing:0},
{name:'KAR 98K · ELITE',era:1944,cls:'elite bolt rifle',ammo:'7.92 rifle',mag:5,reload:1.55,cycle:.56,damage:20.8,range:.74,speed:755,burst:1,gap:.56,spread:.51,projectile:'bullet',splash:0,homing:0},
{name:'GEWEHR 43',era:1943,cls:'semi-auto rifle',ammo:'7.92 rifle',mag:10,reload:1.70,cycle:.25,damage:14.8,range:.66,speed:750,burst:1,gap:.25,spread:.72,projectile:'bullet',splash:0,homing:0},
{name:'GEWEHR 43 · ZF4',era:1944,cls:'scoped semi-auto',ammo:'7.92 rifle',mag:10,reload:1.62,cycle:.23,damage:15.3,range:.72,speed:760,burst:1,gap:.23,spread:.60,projectile:'bullet',splash:0,homing:0},
{name:'GEWEHR 43 · VETERAN',era:1944,cls:'semi-auto rifle',ammo:'7.92 rifle',mag:10,reload:1.50,cycle:.21,damage:15.8,range:.75,speed:770,burst:1,gap:.21,spread:.54,projectile:'bullet',splash:0,homing:0},
{name:'GEWEHR 43 · ELITE',era:1944,cls:'elite semi-auto',ammo:'7.92 rifle',mag:10,reload:1.42,cycle:.19,damage:16.3,range:.78,speed:780,burst:1,gap:.19,spread:.49,projectile:'bullet',splash:0,homing:0},
{name:'STG 44',era:1944,cls:'assault rifle',ammo:'7.92 Kurz',mag:30,reload:1.85,cycle:.105,damage:9.8,range:.60,speed:650,burst:3,gap:.105,spread:.82,projectile:'tracer',splash:0,homing:0},
{name:'STG 44 · IMPROVED',era:1944,cls:'assault rifle',ammo:'7.92 Kurz',mag:30,reload:1.72,cycle:.098,damage:10.2,range:.64,speed:665,burst:3,gap:.098,spread:.74,projectile:'tracer',splash:0,homing:0},
{name:'STG 44 · VETERAN',era:1944,cls:'assault rifle',ammo:'7.92 Kurz',mag:30,reload:1.60,cycle:.091,damage:10.6,range:.68,speed:675,burst:3,gap:.091,spread:.67,projectile:'tracer',splash:0,homing:0},
{name:'STG 44 · ELITE',era:1944,cls:'elite assault rifle',ammo:'7.92 Kurz',mag:30,reload:1.50,cycle:.086,damage:11,range:.71,speed:685,burst:4,gap:.086,spread:.61,projectile:'tracer',splash:0,homing:0},
{name:'FG 42',era:1942,cls:'automatic rifle',ammo:'7.92 rifle',mag:20,reload:1.82,cycle:.125,damage:12.8,range:.70,speed:770,burst:2,gap:.125,spread:.66,projectile:'bullet',splash:0,homing:0},
{name:'FG 42 · ZF4',era:1944,cls:'scoped automatic rifle',ammo:'7.92 rifle',mag:20,reload:1.72,cycle:.118,damage:13.2,range:.75,speed:780,burst:2,gap:.118,spread:.55,projectile:'bullet',splash:0,homing:0},
{name:'FG 42 · VETERAN',era:1944,cls:'automatic rifle',ammo:'7.92 rifle',mag:20,reload:1.62,cycle:.110,damage:13.6,range:.78,speed:790,burst:3,gap:.110,spread:.50,projectile:'bullet',splash:0,homing:0},
{name:'FG 42 · ELITE',era:1944,cls:'elite automatic rifle',ammo:'7.92 rifle',mag:20,reload:1.54,cycle:.103,damage:14,range:.81,speed:800,burst:3,gap:.103,spread:.46,projectile:'bullet',splash:0,homing:0},
{name:'MG 34',era:1934,cls:'general-purpose MG',ammo:'7.92 belt',mag:50,reload:2.38,cycle:.085,damage:10.8,range:.76,speed:800,burst:5,gap:.085,spread:.67,projectile:'tracer',splash:0,homing:0},
{name:'MG 34 · VETERAN',era:1944,cls:'general-purpose MG',ammo:'7.92 belt',mag:75,reload:2.20,cycle:.078,damage:11.2,range:.79,speed:810,burst:5,gap:.078,spread:.60,projectile:'tracer',splash:0,homing:0},
{name:'MG 42',era:1942,cls:'general-purpose MG',ammo:'7.92 belt',mag:75,reload:2.18,cycle:.066,damage:10.6,range:.81,speed:820,burst:6,gap:.066,spread:.62,projectile:'tracer',splash:0,homing:0},
{name:'MG 42 · ELITE',era:1944,cls:'elite general-purpose MG',ammo:'7.92 belt',mag:100,reload:2.02,cycle:.060,damage:11,range:.84,speed:830,burst:7,gap:.060,spread:.55,projectile:'tracer',splash:0,homing:0}
];
var SPECIAL_DB=[
{name:'M24 HANDGRENAAT',effect:'blast',damage:18,blast:22,radius:15,range:.22,speed:155,duration:0,dps:0},
{name:'M24 · FRAGMENT SLEEVE',effect:'blast',damage:20,blast:26,radius:17,range:.23,speed:158,duration:0,dps:0},
{name:'M24 · BUNDLE',effect:'blast',damage:23,blast:31,radius:19,range:.24,speed:152,duration:0,dps:0},
{name:'M24 · ELITE THROW',effect:'blast',damage:25,blast:34,radius:20,range:.27,speed:166,duration:0,dps:0},
{name:'RIFLE GRENADE',effect:'blast',damage:27,blast:37,radius:21,range:.31,speed:185,duration:0,dps:0},
{name:'RIFLE GRENADE · HE',effect:'blast',damage:30,blast:42,radius:23,range:.34,speed:192,duration:0,dps:0},
{name:'RIFLE GRENADE · VETERAN',effect:'blast',damage:33,blast:47,radius:24,range:.37,speed:198,duration:0,dps:0},
{name:'RIFLE GRENADE · ELITE',effect:'blast',damage:36,blast:51,radius:26,range:.40,speed:205,duration:0,dps:0},
{name:'PANZERFAUST 30',effect:'blast',damage:43,blast:57,radius:27,range:.38,speed:215,duration:0,dps:0},
{name:'PANZERFAUST 60',effect:'blast',damage:48,blast:64,radius:29,range:.43,speed:230,duration:0,dps:0},
{name:'PANZERFAUST 100',effect:'blast',damage:53,blast:71,radius:31,range:.48,speed:245,duration:0,dps:0},
{name:'PANZERSCHRECK RPzB 54',effect:'blast',damage:59,blast:79,radius:33,range:.53,speed:265,duration:0,dps:0},
{name:'5CM MORTAR',effect:'blast',damage:62,blast:84,radius:34,range:.49,speed:205,duration:0,dps:0},
{name:'5CM MORTAR · VETERAN',effect:'blast',damage:67,blast:91,radius:36,range:.53,speed:212,duration:0,dps:0},
{name:'8CM GRANATWERFER 34',effect:'blast',damage:73,blast:99,radius:38,range:.57,speed:218,duration:0,dps:0},
{name:'8CM GRANATWERFER · ELITE',effect:'blast',damage:79,blast:108,radius:40,range:.61,speed:225,duration:0,dps:0},
{name:'12CM GRANATWERFER 42',effect:'blast',damage:86,blast:118,radius:42,range:.64,speed:230,duration:0,dps:0},
{name:'12CM GRANATWERFER · HE',effect:'blast',damage:94,blast:128,radius:44,range:.67,speed:235,duration:0,dps:0},
{name:'NEBELWERFER 41',effect:'blast',damage:102,blast:140,radius:47,range:.70,speed:250,duration:0,dps:0},
{name:'NEBELWERFER 41 · ELITE',effect:'blast',damage:112,blast:154,radius:50,range:.73,speed:260,duration:0,dps:0}
];
function weaponUpgradeCost(kind,lvl){
  if(lvl>=MAX_WEAPON_LEVEL)return null;
  return lvl<4?1:lvl<10?2:lvl<15?3:4;
}
function primaryStats(lvl){lvl=clamp(lvl|0,0,MAX_WEAPON_LEVEL);var w=PRIMARY_DB[lvl],speedBoost=1+Math.min(.06,lvl*.003),rangeBoost=Math.min(.055,lvl*.003);return {name:w.name,damage:w.damage,speed:w.speed*speedBoost,rangeFactor:w.range+rangeBoost,spread:w.spread,burst:w.burst,burstGap:w.gap,heatScale:Math.max(.54,1-lvl*.021),cool:.24+lvl*.015,visual:lvl,mag:w.mag,reload:w.reload,cycle:w.cycle,projectile:w.projectile,splash:0,homing:0,era:w.era,cls:w.cls,ammo:w.ammo};}
function specialStats(lvl){lvl=clamp(lvl|0,0,MAX_WEAPON_LEVEL);var w=SPECIAL_DB[lvl],t=lvl/MAX_WEAPON_LEVEL;return {name:w.name,impact:w.damage,blast:w.blast,radius:w.radius,duration:w.duration,dps:w.dps,speed:w.speed,rangeFactor:w.range,chargeScale:1+t*.78,heatScale:Math.max(.54,1-t*.46),plasma:false,effect:w.effect,visual:lvl,arcHeight:13+w.range*40};}
function arsenalTier(){
  if(!gameState||!gameState.save||!gameState.save.upgrades)return 0;
  var total=(gameState.save.upgrades.primary||0)+(gameState.save.upgrades.special||0);
  return total<5?0:total<12?1:total<20?2:total<28?3:total<36?4:5;
}

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
function roundRect(c,x,y,w,h,r){
  r=Math.min(r,w*.5,h*.5);c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);
  c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);
  c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();return c;
}
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
  return {supply:0,arsenalPoints:0,bestLevel:0,adaptiveDifficulty:0,lastDynamic:null,upgrades:{primary:0,special:0,aiming:0,reload:0,armor:0}};
}
function loadSave(){
  try{
    var v=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(!v||!v.upgrades)return defaultSave();
    var keys=['primary','special','aiming','reload','armor'];
    for(var i=0;i<keys.length;i++)if(typeof v.upgrades[keys[i]]!=='number')v.upgrades[keys[i]]=0;
    v.upgrades.primary=clamp(v.upgrades.primary,0,MAX_WEAPON_LEVEL);
    v.upgrades.special=clamp(v.upgrades.special,0,MAX_WEAPON_LEVEL);
    v.upgrades.aiming=clamp(v.upgrades.aiming,0,SKILL_MAX);
    v.upgrades.reload=clamp(v.upgrades.reload,0,SKILL_MAX);
    v.upgrades.armor=clamp(v.upgrades.armor,0,SKILL_MAX);
    if(typeof v.supply!=='number')v.supply=0;
    if(typeof v.arsenalPoints!=='number')v.arsenalPoints=0;
    if(typeof v.bestLevel!=='number')v.bestLevel=0;
    if(typeof v.adaptiveDifficulty!=='number')v.adaptiveDifficulty=0;
    v.adaptiveDifficulty=clamp(v.adaptiveDifficulty,-.24,.30);
    if(!v.lastDynamic)v.lastDynamic=null;
    return v;
  }catch(e){return defaultSave();}
}
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(gameState.save));}catch(e){}}

function playerProfile(){
  var u=gameState.save.upgrades,p=primaryStats(u.primary||0),sp=specialStats(u.special||0),tier=arsenalTier();
  var aimLvl=u.aiming||0,reloadLvl=u.reload||0,armorLvl=u.armor||0;
  var stability=Math.max(.52,1-aimLvl*.09);
  var reloadMult=Math.max(.88,1.18-reloadLvl*.06);
  var armorSkill=Math.max(.70,1-armorLvl*.045);
  return {
    maxHp:(90+tier*8+armorLvl*24)*(IS_IPHONE?1.10:1),
    armorScale:Math.max(.58,1-armorLvl*.065-tier*.014),
    primaryDamage:p.damage,primarySpeed:p.speed,primaryRangeFactor:p.rangeFactor,primaryVisual:p.visual,primaryMag:p.mag,
    primaryReload:p.reload*reloadMult,primaryBaseReload:p.reload,primaryCycle:p.cycle,primaryProjectile:p.projectile,
    primarySplash:p.splash,primaryHoming:p.homing,primaryEra:p.era,primaryClass:p.cls,primaryAmmoType:p.ammo,
    spreadScale:p.spread*stability,aimStability:stability,burst:p.burst,burstGap:p.burstGap,
    chargeScale:sp.chargeScale,cool:p.cool,heatScale:p.heatScale,heRadius:sp.radius,specialImpact:sp.impact,
    specialBlast:sp.blast,specialDps:sp.dps,specialDuration:sp.duration,specialSpeed:sp.speed,specialRangeFactor:sp.rangeFactor,
    specialHeatScale:sp.heatScale,specialEffect:sp.effect,specialVisual:sp.visual,specialArcHeight:sp.arcHeight,
    primaryName:p.name,specialName:sp.name,specialPlasma:sp.plasma,playerTier:tier,
    aimLevel:aimLvl,reloadLevel:reloadLvl,armorLevel:armorLvl
  };
}
/* ---------- AUDIO ---------- */

var AudioSys=(function(){
  var SR=44100,proc={},rec={},ready=false,unlocked=false,lastPlay={},seed=2412,lastPrimaryAudio=0;
  var BASE='https://raw.githubusercontent.com/euuuuuuan/fatal-funnel-public/main/apps/game/public/sfx/';
  var REC_URLS={karVerified:"data:audio/wav;base64,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",garandVerified:"data:audio/wav;base64,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",rifle0:'../v8_5_0_local_combat_audio/audio/gun_rifle_0.wav?v=8840',rifle1:'../v8_5_0_local_combat_audio/audio/gun_rifle_1.wav?v=8840',rifle2:'../v8_5_0_local_combat_audio/audio/gun_rifle_2.wav?v=8840',sniper:'../v8_5_0_local_combat_audio/audio/gunshot_sniper.wav?v=8840',smg0:'../v8_5_0_local_combat_audio/audio/gun_smg_0.wav?v=8840',rifle762:BASE+'rifle_762.mp3',rifle556:BASE+'rifle_556.mp3',smg:BASE+'smg_9mm.mp3',shotgun:BASE+'shotgun_12ga.mp3'};
      REC_URLS.hitSoft0="data:audio/ogg;base64,T2dnUwACAAAAAAAAAADtVgAAAAAAAMbQvcsBHgF2b3JiaXMAAAAAAkSsAAAAAAAAAHECAAAAAAC4AU9nZ1MAAAAAAAAAAAAA7VYAAAEAAAAPZXD7Epf/////////////////////kQN2b3JiaXMrAAAAWGlwaC5PcmcgbGliVm9yYmlzIEkgMjAxMjAyMDMgKE9tbmlwcmVzZW50KQIAAAANAAAAQVJUSVNUPUtlbm5leUcAAABDT01NRU5UUz1Tb3VuZCBnZW5lcmF0ZWQgYnkgR2FtZVN5bnRoIGZyb20gVHN1Z2kgKHd3dy50c3VnaS1zdHVkaW8uY29tKQEFdm9yYmlzKUJDVgEACAAAADFMIMWA0JBVAAAQAABgJCkOk2ZJKaWUoSh5mJRISSmllMUwiZiUicUYY4wxxhhjjDHGGGOMIDRkFQAABACAKAmOo+ZJas45ZxgnjnKgOWlOOKcgB4pR4DkJwvUmY26mtKZrbs4pJQgNWQUAAAIAQEghhRRSSCGFFGKIIYYYYoghhxxyyCGnnHIKKqigggoyyCCDTDLppJNOOumoo4466ii00EILLbTSSkwx1VZjrr0GXXxzzjnnnHPOOeecc84JQkNWAQAgAAAEQgYZZBBCCCGFFFKIKaaYcgoyyIDQkFUAACAAgAAAAABHkRRJsRTLsRzN0SRP8ixREzXRM0VTVE1VVVVVdV1XdmXXdnXXdn1ZmIVbuH1ZuIVb2IVd94VhGIZhGIZhGIZh+H3f933f930gNGQVACABAKAjOZbjKaIiGqLiOaIDhIasAgBkAAAEACAJkiIpkqNJpmZqrmmbtmirtm3LsizLsgyEhqwCAAABAAQAAAAAAKBpmqZpmqZpmqZpmqZpmqZpmqZpmmZZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZQGjIKgBAAgBAx3Ecx3EkRVIkx3IsBwgNWQUAyAAACABAUizFcjRHczTHczzHczxHdETJlEzN9EwPCA1ZBQAAAgAIAAAAAABAMRzFcRzJ0SRPUi3TcjVXcz3Xc03XdV1XVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVYHQkFUAAAQAACGdZpZqgAgzkGEgNGQVAIAAAAAYoQhDDAgNWQUAAAQAAIih5CCa0JrzzTkOmuWgqRSb08GJVJsnuamYm3POOeecbM4Z45xzzinKmcWgmdCac85JDJqloJnQmnPOeRKbB62p0ppzzhnnnA7GGWGcc85p0poHqdlYm3POWdCa5qi5FJtzzomUmye1uVSbc84555xzzjnnnHPOqV6czsE54Zxzzonam2u5CV2cc875ZJzuzQnhnHPOOeecc84555xzzglCQ1YBAEAAAARh2BjGnYIgfY4GYhQhpiGTHnSPDpOgMcgppB6NjkZKqYNQUhknpXSC0JBVAAAgAACEEFJIIYUUUkghhRRSSCGGGGKIIaeccgoqqKSSiirKKLPMMssss8wyy6zDzjrrsMMQQwwxtNJKLDXVVmONteaec645SGultdZaK6WUUkoppSA0ZBUAAAIAQCBkkEEGGYUUUkghhphyyimnoIIKCA1ZBQAAAgAIAAAA8CTPER3RER3RER3RER3RER3P8RxREiVREiXRMi1TMz1VVFVXdm1Zl3Xbt4Vd2HXf133f141fF4ZlWZZlWZZlWZZlWZZlWZZlCUJDVgEAIAAAAEIIIYQUUkghhZRijDHHnINOQgmB0JBVAAAgAIAAAAAAR3EUx5EcyZEkS7IkTdIszfI0T/M00RNFUTRNUxVd0RV10xZlUzZd0zVl01Vl1XZl2bZlW7d9WbZ93/d93/d93/d93/d939d1IDRkFQAgAQCgIzmSIimSIjmO40iSBISGrAIAZAAABACgKI7iOI4jSZIkWZImeZZniZqpmZ7pqaIKhIasAgAAAQAEAAAAAACgaIqnmIqniIrniI4oiZZpiZqquaJsyq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7rukBoyCoAQAIAQEdyJEdyJEVSJEVyJAcIDVkFAMgAAAgAwDEcQ1Ikx7IsTfM0T/M00RM90TM9VXRFFwgNWQUAAAIACAAAAAAAwJAMS7EczdEkUVIt1VI11VItVVQ9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV1TRN0zSB0JCVAAAZAADkpKbUeg4SYpA5iUFoCEnEHMVcOumco1yMh5AjRkntIVPMEAS1mNBJhRTU4lpqHXNUi42tZEhBLbbGUiHlqAdCQ1YIAKEZAA7HARxNAxxLAwAAAAAAAABJ0wBNFAHNEwEAAAAAAADA0TRAEz1AE0UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABxNAzRRBDRRBAAAAAAAAABNFAHRVAHRNAEAAAAAAABAE0XAM0VANFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABxNAzRRBDRRBAAAAAAAAABNFAFRNQFPNAEAAAAAAABAE0VANE1AVE0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAABDgAAARZCoSErAoA4AQCH40CSIEnwNIBjWfA8eBpME+BYFjwPmgfTBAAAAAAAAAAAAEDyNHgePA+mCZA0D54Hz4NpAgAAAAAAAAAAACB5HjwPngfTBEieB8+D58E0AQAAAAAAAAAAAPBME6YJ0YRqAjzThGnCNGGqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIABBwCAABPKQKEhKwKAOAEAh6NIEgAAOJJkWQAAoEiSZQEAgGVZngcAAJJleR4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAgAEHAIAAE8pAoSErAYAoAACHolgWcBzLAo5jWUCSLAtgWQBNA3gaQBQBgAAAgAIHAIAAGzQlFgcoNGQlABAFAOBwFMvSNFHkOJalaaLIcSxL00SRZWmapokiNEvTRBGe53mmCc/zPNOEKIqiaQJRNE0BAAAFDgAAATZoSiwOUGjISgAgJADA4TiW5XmiKIqmaZqqynEsy/NEURRNU1Vdl+NYlueJoiiapqq6LsvSNM8TRVE0TVV1XWia54miKJqmqrouNE0UTdM0VVVVXRea5ommaZqqqqquC88TRdM0TVV1XdcFomiapqmqruu6QBRN0zRV1XVdF4iiaJqmqrqu6wLTNE1VVV3XlWWAaaqqqrquLANUVVVd15VlGaCqquq6rivLANd1XdmVZVkG4LquK8uyLAAA4MABACDACDrJqLIIG0248AAUGrIiAIgCAACMYUoxpQxjEkIKoWFMQkghZFJSKimlCkIqJZVSQUilpFIySi2lllIFIZWSSqkgpFJSKQUAgB04AIAdWAiFhqwEAPIAAAhjlGLMOeckQkox5pxzEiGlGHPOOakUY84555yUkjHnnHNOSsmYc845J6VkzDnnnJNSOueccw5KKaV0zjnnpJRSQuicc1JKKZ1zzjkBAEAFDgAAATaKbE4wElRoyEoAIBUAwOA4lqVpnieKpmlJkqZ5nieapmlqkqRpnieKpmmaPM/zRFEUTVNVeZ7niaIomqaqcl1RFE3TNE1VJcuiKIqmqaqqCtM0TdNUVVWFaZqmaaqq68K2VVVVXdd1Yduqqqqu67rAdV3XdWUZuK7ruq4sCwAAT3AAACqwYXWEk6KxwEJDVgIAGQAAhDEIKYQQUgYhpBBCSCmFkAAAgAEHAIAAE8pAoSErAYBwAACAEIwxxhhjjDE2jGGMMcYYY4wxcQpjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcbYWmuttVYAGM6FA0BZhI0zrCSdFY4GFxqyEgAICQAAjEGIMegklJJKShVCjDkoJZWWWoqtQogxCKWk1FpsMRbPOQehpJRaiim24jnnpKTUWowxxlpcCyGllFqLLbYYm2whpJRSazHGWmMzSrWUWosxxhhrLEq5lFJrscUYa41FKJtbazHGWmutNSnlc0ux1VpjrLUmo4ySMcZaa6y11iKUUjLGFFOstdaahDDG9xhjrDHnWpMSwvgeUy2x1VprUkopI2SNqcZac05KCWWMjS3VlHPOBQBAPTgAQCUYQScZVRZhowkXHoBCQ1YCALkBAAhCSjHGmHPOOeeccw5SpBhzzDnnIIQQQgghpAgxxphzzkEIIYQQQkgZY8w55yCEEEIIoYSSUsqYc85BCCGEUkopJaXUOecghBBCKKWUUkpKqXPOQQghhFJKKaWUlFIIIYQQQgillFJKKSmllEIIIYQSSimllFJSSimFEEIIpZRSSimlpJRSCiGEEEoppZRSSkkppRRCCaWUUkoppZSSUkoppRBKKaWUUkopJaWUUkqllFJKKaWUUkpKKaWUSimllFJKKaWUlFJKKZVSSimllFJKKSmllFJKqZRSSimllFJSSimllFIppZRSSimlpJRSSimlUkoppZRSSkkppZRSSqWUUkoppZSSUkoppZRSKqWUUkoppQAAoAMHAIAAIyotxE4zrjwCRxQyTECFhqwEAMgAABAHsbTWWquMcspJSa1DRhrmoKTYSQchtVhLZSBByklKnYIIKQaphYwqpZiTlkLLmFIMYisxdIwxRznlVELHGAAAAIIAAAMRMhMIFECBgQwAOEBIkAIACgsMHcNFQEAuIaPAoHBMOCedNgAAQYjMEImIxSAxoRooKqYDgMUFhnwAyNDYSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOpAAAAAAAAeAOABACDZACIiopnj6PD4AAkRGSEpMTlBEQAAAAAAOwD4AABIUoCIiGjmODo8PkBCREZISkxOUAIAAAEEAAAAAEAAAQgICAAAAAAABAAAAAgIT2dnUwAEVBQAAAAAAADtVgAAAgAAAFTU6ywIQTzGMj0+p678dh8PnT7CJRzrt/t46PQRLuFYB1RqagoYOTkZBkBADML9/b1FNBqNoihgq1pV7Uk3NwXtvm+ks0i0v/eslOH+BcSe70+AQxim2PP9CXAIw/QBNnIMAGi7ArjCkgSUS7SCoqCxaFGNFWvQGKtoRVVQRMSiRZUsXX0jevusAJr7/VMu04tSfpNtY1Jyv3/KZXpRym+ybUzKO6OsKesWtZVqpVqpVqq9Xq+H3uaImB0IxJiZmUmSAAAAAAAgiKpYRNSoqFishmLY2tmYhmmxtbexhS1tsm6hiAqAaaHVaBUDiBWtRqu5LXPOOdtiRVW0GlUxWLx2fn3+7u7uqrDPnz9/Rj+vb29vb29vc4Z8e3ubM58/y2qttX5dJgCbW3W2bt2aC1v5ev7Z5fNnFzg2c1lv3brVyTjhMuHz588Cn2FzK3CfAb5a/X+OjpK7CeAAq9X/5+gouZsADnBMAAAAAAAAAAAAAAAAAGSpASBMuAzlEQFBAgAAXun8fy6PkmcKGw5Q6fx/Lo+SZwobDnBMAACSgARJAgAAAAAAAACARNQCgMtQYUFhvjCPEgDAwwCMA4BTAF7o/H9Or9LSRAGnAgqd/8/pVVqaKOBUgLgNAAAAmAAAAAAAAAAAADQhJABXSJwvwBGS4FEKAop8Pi9AAQEBXtjc/DzCUsAGCpubn0dYCtjAVwCAzcHBwUGMmUkAAAAAAAAANQAAaVxGSAw8EZ4AhyFgudZttNlmG62bYsUGm2xhCxusWYhaWrVu3apVUxELCwsLjSJYVbVaVTWIcnOT9t/fO86bQtp/30g3RaLdN0e6SbS/b6SbQvbfN8d5k2j/feO8KWT/fU+6uUm0v+1ypd2/npUy3L+s5Pjflnbyr04G/rMExQBeaPyf2yUsAUyg0Pg/t0tYApjAvb0AbK/HbA4ODg4OzMwkAAAAAAAAYNiZhr2txRTUYrWxt7G1qNrYmIrFzorF3t5mG6xbMUVMC6tWrFqYghWtRqtRBSuqRquoEre3pevdXSXflnnfXSdx3Wbq11XybenVuypx3WbqXVfjui29764j395mvrs7ies2e99dJV+lfs7c3HqfZWvu+/Ns1a/M2cpnWefeZzb1nclW3gA=";
  REC_URLS.hitSoft1="data:audio/ogg;base64,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";
  REC_URLS.hitSoft2="data:audio/ogg;base64,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";
  REC_URLS.bodySoft="data:audio/ogg;base64,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";
  REC_URLS.metal0="data:audio/ogg;base64,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";
  REC_URLS.metal1="data:audio/ogg;base64,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";
  REC_URLS.metalHeavy="data:audio/ogg;base64,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";
  REC_URLS.glassReal="data:audio/ogg;base64,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";
  REC_URLS.genericReal="data:audio/ogg;base64,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";
  REC_URLS.explosionReal='https://raw.githubusercontent.com/6WENHAO/DS-Games/532ea73974a0c9d22cde876c80fad2536143863a/冬眠の松鼠_/战争雷霆/assets/audio/explosion.wav';

  function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  function clamp1(v){return Math.max(-1,Math.min(1,v));}
  function env(t,d,a,r){if(t<a)return t/Math.max(.001,a);var q=(t-a)/Math.max(.001,d-a);return Math.pow(Math.max(0,1-q),r||2);}
  function osc(type,phase){var p=phase-Math.floor(phase);if(type==='tri')return 1-4*Math.abs(p-.5);return Math.sin(phase*TAU);}
  function procData(kind){
  var vehicleKind=kind.indexOf('engine')===0||kind==='trackClatter';
  var dur=kind==='deepCannon'?.58:kind==='deepShot'?.30:kind==='karCrack'?.115:kind==='hitconfirm'?.13:kind==='heli'?.60:
    kind==='engineJeep'?.34:kind==='engineTruck'?.42:kind==='engineHalftrack'?.44:kind==='engineScout'?.36:kind==='trackClatter'?.28:
    kind==='engine'?.32:kind==='tire'?.62:kind==='glass'?.24:kind==='door'?.16:.18;
  var n=Math.max(32,Math.floor(SR*dur)),a=new Float32Array(n);
  for(var i=0;i<n;i++){
    var t=i/SR,edge=vehicleKind?Math.max(0,Math.min(1,t/.016,(dur-t)/.028)):1,e=env(t,dur,.001,kind==='deepCannon'?2.0:2.8),v=0;
    if(kind==='deepShot'){v=(osc('sin',t*(96-34*t/dur))*.78+osc('sin',t*(151-51*t/dur))*.34)*e;if(t<.010)v+=osc('tri',t*1450)*(1-t/.010)*.18;}
    else if(kind==='karCrack'){var p=Math.max(0,1-t/dur);v=osc('tri',t*(2700-1050*t/dur))*.34*Math.pow(p,4)+osc('sin',t*820)*.21*Math.pow(p,2)+osc('sin',t*145)*.16*p;}
    else if(kind==='deepCannon'){v=(osc('sin',t*(62-25*t/dur))*.95+osc('sin',t*(102-38*t/dur))*.45+osc('sin',t*34)*.22)*e;}
    else if(kind==='hitconfirm'){var q=Math.max(0,1-t/dur);v=osc('sin',t*235)*.40*q+osc('sin',t*940)*.24*Math.pow(q,3);}
    else if(kind==='tire'){var hiss=(rnd()*2-1),te=Math.pow(Math.max(0,1-t/dur),.70);v=hiss*.72*te;}
    else if(kind==='glass'){var ge=Math.pow(Math.max(0,1-t/dur),2.6),spark=Math.max(0,Math.sin(t*TAU*(2400+900*Math.sin(t*29))));v=(rnd()*2-1)*.22*ge+spark*.23*ge;}
    else if(kind==='door'){var d1=Math.max(0,1-Math.abs(t-.035)/.027);v=osc('sin',t*190)*.50*d1+osc('tri',t*720)*.15*d1;}
    else if(kind==='heli'){var beat=.52+.48*Math.sin(TAU*t*12.2);v=(osc('sin',t*45)*.25+osc('sin',t*90)*.10)*beat*e;}
    else if(kind==='engineJeep'){var jp=.48+.52*Math.max(0,Math.sin(TAU*t*18.5));v=(osc('sin',t*82)*.24+osc('tri',t*164)*.10)*jp*edge+(rnd()*2-1)*.023*edge;}
    else if(kind==='engineTruck'){var tp=.45+.55*Math.max(0,Math.sin(TAU*t*10.6));v=(osc('sin',t*49)*.34+osc('sin',t*98)*.15)*tp*edge+(rnd()*2-1)*.030*edge;}
    else if(kind==='engineHalftrack'){var hp=.42+.58*Math.max(0,Math.sin(TAU*t*9.1));v=(osc('sin',t*43)*.37+osc('sin',t*86)*.14)*hp*edge+(rnd()*2-1)*.036*edge;}
    else if(kind==='engineScout'){var sp=.46+.54*Math.max(0,Math.sin(TAU*t*14.2));v=(osc('sin',t*66)*.29+osc('tri',t*132)*.11)*sp*edge+(rnd()*2-1)*.024*edge;}
    else if(kind==='trackClatter'){var ph=(t*24)%1,cl=Math.max(0,1-ph/.22);v=((rnd()*2-1)*.18+osc('tri',t*690)*.08)*cl*edge+osc('sin',t*74)*.045*edge;}
    else if(kind==='engine'){var pulse=.50+.50*Math.max(0,Math.sin(TAU*t*10.2));v=(osc('sin',t*52)*.25+osc('sin',t*104)*.09)*pulse*edge;}
    v=Math.tanh(v*1.18);a[i]=clamp1(v*.84);
  }
  return a;
}
  function wavURI(floatData){
    var n=floatData.length,buf=new ArrayBuffer(44+n*2),dv=new DataView(buf),pos=0;
    function str(x){for(var i=0;i<x.length;i++)dv.setUint8(pos++,x.charCodeAt(i));}
    function u32(x){dv.setUint32(pos,x,true);pos+=4;}function u16(x){dv.setUint16(pos,x,true);pos+=2;}
    str('RIFF');u32(36+n*2);str('WAVE');str('fmt ');u32(16);u16(1);u16(1);u32(SR);u32(SR*2);u16(2);u16(16);str('data');u32(n*2);
    for(var i=0;i<n;i++){dv.setInt16(pos,Math.max(-32768,Math.min(32767,floatData[i]*32767)),true);pos+=2;}
    var bytes=new Uint8Array(buf),chunk=0x8000,binary='';
    for(var j=0;j<bytes.length;j+=chunk)binary+=String.fromCharCode.apply(null,bytes.subarray(j,Math.min(bytes.length,j+chunk)));
    return 'data:audio/wav;base64,'+btoa(binary);
  }
  REC_URLS.flesh0="data:audio/ogg;base64,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";
  REC_URLS.flesh1="data:audio/ogg;base64,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";
  REC_URLS.flesh2="data:audio/ogg;base64,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";
  REC_URLS.steel0="data:audio/ogg;base64,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";
  REC_URLS.steel1="data:audio/ogg;base64,T2dnUwACAAAAAAAAAAC/VgAAAAAAAOzT7BIBHgF2b3JiaXMAAAAAAkSsAAAAAAAAAHECAAAAAAC4AU9nZ1MAAAAAAAAAAAAAv1YAAAEAAAC1xF2cEpf/////////////////////kQN2b3JiaXMrAAAAWGlwaC5PcmcgbGliVm9yYmlzIEkgMjAxMjAyMDMgKE9tbmlwcmVzZW50KQIAAAANAAAAQVJUSVNUPUtlbm5leUcAAABDT01NRU5UUz1Tb3VuZCBnZW5lcmF0ZWQgYnkgR2FtZVN5bnRoIGZyb20gVHN1Z2kgKHd3dy50c3VnaS1zdHVkaW8uY29tKQEFdm9yYmlzKUJDVgEACAAAADFMIMWA0JBVAAAQAABgJCkOk2ZJKaWUoSh5mJRISSmllMUwiZiUicUYY4wxxhhjjDHGGGOMIDRkFQAABACAKAmOo+ZJas45ZxgnjnKgOWlOOKcgB4pR4DkJwvUmY26mtKZrbs4pJQgNWQUAAAIAQEghhRRSSCGFFGKIIYYYYoghhxxyyCGnnHIKKqigggoyyCCDTDLppJNOOumoo4466ii00EILLbTSSkwx1VZjrr0GXXxzzjnnnHPOOeecc84JQkNWAQAgAAAEQgYZZBBCCCGFFFKIKaaYcgoyyIDQkFUAACAAgAAAAABHkRRJsRTLsRzN0SRP8ixREzXRM0VTVE1VVVVVdV1XdmXXdnXXdn1ZmIVbuH1ZuIVb2IVd94VhGIZhGIZhGIZh+H3f933f930gNGQVACABAKAjOZbjKaIiGqLiOaIDhIasAgBkAAAEACAJkiIpkqNJpmZqrmmbtmirtm3LsizLsgyEhqwCAAABAAQAAAAAAKBpmqZpmqZpmqZpmqZpmqZpmqZpmmZZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZQGjIKgBAAgBAx3Ecx3EkRVIkx3IsBwgNWQUAyAAACABAUizFcjRHczTHczzHczxHdETJlEzN9EwPCA1ZBQAAAgAIAAAAAABAMRzFcRzJ0SRPUi3TcjVXcz3Xc03XdV1XVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVYHQkFUAAAQAACGdZpZqgAgzkGEgNGQVAIAAAAAYoQhDDAgNWQUAAAQAAIih5CCa0JrzzTkOmuWgqRSb08GJVJsnuamYm3POOeecbM4Z45xzzinKmcWgmdCac85JDJqloJnQmnPOeRKbB62p0ppzzhnnnA7GGWGcc85p0poHqdlYm3POWdCa5qi5FJtzzomUmye1uVSbc84555xzzjnnnHPOqV6czsE54Zxzzonam2u5CV2cc875ZJzuzQnhnHPOOeecc84555xzzglCQ1YBAEAAAARh2BjGnYIgfY4GYhQhpiGTHnSPDpOgMcgppB6NjkZKqYNQUhknpXSC0JBVAAAgAACEEFJIIYUUUkghhRRSSCGGGGKIIaeccgoqqKSSiirKKLPMMssss8wyy6zDzjrrsMMQQwwxtNJKLDXVVmONteaec645SGultdZaK6WUUkoppSA0ZBUAAAIAQCBkkEEGGYUUUkghhphyyimnoIIKCA1ZBQAAAgAIAAAA8CTPER3RER3RER3RER3RER3P8RxREiVREiXRMi1TMz1VVFVXdm1Zl3Xbt4Vd2HXf133f141fF4ZlWZZlWZZlWZZlWZZlWZZlCUJDVgEAIAAAAEIIIYQUUkghhZRijDHHnINOQgmB0JBVAAAgAIAAAAAAR3EUx5EcyZEkS7IkTdIszfI0T/M00RNFUTRNUxVd0RV10xZlUzZd0zVl01Vl1XZl2bZlW7d9WbZ93/d93/d93/d93/d939d1IDRkFQAgAQCgIzmSIimSIjmO40iSBISGrAIAZAAABACgKI7iOI4jSZIkWZImeZZniZqpmZ7pqaIKhIasAgAAAQAEAAAAAACgaIqnmIqniIrniI4oiZZpiZqquaJsyq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7rukBoyCoAQAIAQEdyJEdyJEVSJEVyJAcIDVkFAMgAAAgAwDEcQ1Ikx7IsTfM0T/M00RM90TM9VXRFFwgNWQUAAAIACAAAAAAAwJAMS7EczdEkUVIt1VI11VItVVQ9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV1TRN0zSB0JCVAAAZAADkpKbUeg4SYpA5iUFoCEnEHMVcOumco1yMh5AjRkntIVPMEAS1mNBJhRTU4lpqHXNUi42tZEhBLbbGUiHlqAdCQ1YIAKEZAA7HARxNAxxLAwAAAAAAAABJ0wBNFAHNEwEAAAAAAADA0TRAEz1AE0UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABxNAzRRBDRRBAAAAAAAAABNFAHRVAHRNAEAAAAAAABAE0XAM0VANFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABxNAzRRBDRRBAAAAAAAAABNFAFRNQFPNAEAAAAAAABAE0VANE1AVE0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAABDgAAARZCoSErAoA4AQCH40CSIEnwNIBjWfA8eBpME+BYFjwPmgfTBAAAAAAAAAAAAEDyNHgePA+mCZA0D54Hz4NpAgAAAAAAAAAAACB5HjwPngfTBEieB8+D58E0AQAAAAAAAAAAAPBME6YJ0YRqAjzThGnCNGGqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIABBwCAABPKQKEhKwKAOAEAh6NIEgAAOJJkWQAAoEiSZQEAgGVZngcAAJJleR4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAgAEHAIAAE8pAoSErAYAoAACHolgWcBzLAo5jWUCSLAtgWQBNA3gaQBQBgAAAgAIHAIAAGzQlFgcoNGQlABAFAOBwFMvSNFHkOJalaaLIcSxL00SRZWmapokiNEvTRBGe53mmCc/zPNOEKIqiaQJRNE0BAAAFDgAAATZoSiwOUGjISgAgJADA4TiW5XmiKIqmaZqqynEsy/NEURRNU1Vdl+NYlueJoiiapqq6LsvSNM8TRVE0TVV1XWia54miKJqmqrouNE0UTdM0VVVVXRea5ommaZqqqqquC88TRdM0TVV1XdcFomiapqmqruu6QBRN0zRV1XVdF4iiaJqmqrqu6wLTNE1VVV3XlWWAaaqqqrquLANUVVVd15VlGaCqquq6rivLANd1XdmVZVkG4LquK8uyLAAA4MABACDACDrJqLIIG0248AAUGrIiAIgCAACMYUoxpQxjEkIKoWFMQkghZFJSKimlCkIqJZVSQUilpFIySi2lllIFIZWSSqkgpFJSKQUAgB04AIAdWAiFhqwEAPIAAAhjlGLMOeckQkox5pxzEiGlGHPOOakUY84555yUkjHnnHNOSsmYc845J6VkzDnnnJNSOueccw5KKaV0zjnnpJRSQuicc1JKKZ1zzjkBAEAFDgAAATaKbE4wElRoyEoAIBUAwOA4lqVpnieKpmlJkqZ5nieapmlqkqRpnieKpmmaPM/zRFEUTVNVeZ7niaIomqaqcl1RFE3TNE1VJcuiKIqmqaqqCtM0TdNUVVWFaZqmaaqq68K2VVVVXdd1Yduqqqqu67rAdV3XdWUZuK7ruq4sCwAAT3AAACqwYXWEk6KxwEJDVgIAGQAAhDEIKYQQUgYhpBBCSCmFkAAAgAEHAIAAE8pAoSErAYBwAACAEIwxxhhjjDE2jGGMMcYYY4wxcQpjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcbYWmuttVYAGM6FA0BZhI0zrCSdFY4GFxqyEgAICQAAjEGIMegklJJKShVCjDkoJZWWWoqtQogxCKWk1FpsMRbPOQehpJRaiim24jnnpKTUWowxxlpcCyGllFqLLbYYm2whpJRSazHGWmMzSrWUWosxxhhrLEq5lFJrscUYa41FKJtbazHGWmutNSnlc0ux1VpjrLUmo4ySMcZaa6y11iKUUjLGFFOstdaahDDG9xhjrDHnWpMSwvgeUy2x1VprUkopI2SNqcZac05KCWWMjS3VlHPOBQBAPTgAQCUYQScZVRZhowkXHoBCQ1YCALkBAAhCSjHGmHPOOeeccw5SpBhzzDnnIIQQQgghpAgxxphzzkEIIYQQQkgZY8w55yCEEEIIoYSSUsqYc85BCCGEUkopJaXUOecghBBCKKWUUkpKqXPOQQghhFJKKaWUlFIIIYQQQgillFJKKSmllEIIIYQSSimllFJSSimFEEIIpZRSSimlpJRSCiGEEEoppZRSSkkppRRCCaWUUkoppZSSUkoppRBKKaWUUkopJaWUUkqllFJKKaWUUkpKKaWUSimllFJKKaWUlFJKKZVSSimllFJKKSmllFJKqZRSSimllFJSSimllFIppZRSSimlpJRSSimlUkoppZRSSkkppZRSSqWUUkoppZSSUkoppZRSKqWUUkoppQAAoAMHAIAAIyotxE4zrjwCRxQyTECFhqwEAMgAABAHsbTWWquMcspJSa1DRhrmoKTYSQchtVhLZSBByklKnYIIKQaphYwqpZiTlkLLmFIMYisxdIwxRznlVELHGAAAAIIAAAMRMhMIFECBgQwAOEBIkAIACgsMHcNFQEAuIaPAoHBMOCedNgAAQYjMEImIxSAxoRooKqYDgMUFhnwAyNDYSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOpAAAAAAAAeAOABACDZACIiopnj6PD4AAkRGSEpMTlBEQAAAAAAOwD4AABIUoCIiGjmODo8PkBCREZISkxOUAIAAAEEAAAAAEAAAQgICAAAAAAABAAAAAgIT2dnUwAEthgAAAAAAAC/VgAAAgAAAAyVBG8MRU1RUv8tjLO6uMqF5GLBsAGYcMxcLBg2ABOOeeuJshQRgokEeYIMYIwxxlpFrFrRyPlytVWt1oIBi0Zp+MZaFRvZUZw1F6xPzRhFI4Tw+gAPjGqFESQ2J/XcsBjVCiNIbE7quWFxCIBMTJvQYlBAMDARUyxcPo+IMBwW0YpquPt0iSjoMNZpYzRoBGusiO80gIoqVoVW0dqqyG02kgBMbgtaYmZw6kr12Xk+uS1oiZnBqSvVZ+f5WacsZVTkaUYuiIA1KKoYoiJiDY3WaAELsdkQURXVCmhUrWIBUayLIaood3cRS70a7moObI2KiCb8bcuduWaFwz/LTMVm8b9tuTPXrHD4Z5mp2Cye3IxWIJdIkJMjoKaqvWmYgqKGvVXAGgWriGgUEdtarVarmnQqooiiUUTRT1J6v27cJKHdt9YWWngdjfbzv4ZjrnfElMN/uaeCQKqF19FoP/9rOOZ6R0w5/Jd7Kgik+q5bVIsMIouyUq2p9npot1202+BAFCLBCxyYWIwJgxgzk0wSMDOTAACsGquqFqsWtTamWuxMDFs7O3s7e3s7WxtbOzt7tbVRRA3TTtQwbewtho2N1TBFRWy2sDRMUVHDNEzDvKsSOd/e3t7mnPNt6eTrM+/Pnz9/BkQNbGlhioqKin7+LJPzdXt7e3t7e3t7W+acc7nPnz9/FuBd693d3d3d3d1drQKxdevWrVtz4fNnF6DWWu/u7u7u7rpaXWbrVnh//vz5s8Dm1q1bt27dunXr1q1bt27dujUXPn/+/Pnz588C661bt27dulV5f/6cCZtbt26Fr8+fP7swufD+/Pnz50wAHtdcbi/P/2zUsz79lvbg0WkJRlxzub08/7NRz/r0W9qDR6clGOJ2AIA/AAAAAIgQAADHBAAAAAIAIEkAAAAAQKsEACCjBhA1AAAQzQIASgKgUmJcQiglhFLCUJpaui9aMgGFgJQ4w+cTgPClCQiKMgAAAAAAgAoKinMgwoIAAKGUSkpxAAAATgAMBAD+Zrw+n65BRvwtO+D/SfV1gRGCeTNen0/XICP+lh3w/6T6usAIwYjbAQA+IOuplkBt1AEAQIQAADgGkNUAQMBiLMbMzMwMAAAAoI0EACgGaxQVVIxVY1UAAACgVAAQEWsUAEBCSoRLCKUMw+USwlJp6MUCADjifComTAAA4GK0A4vHJNMz8XjdPec4W90jhwgIVKebGGEAiwbQ5wMGQirmSE5gr1Ngenq6mRSFJBbLrMa2BN5m/LnvjoFQ3/wMjZ3q776UaTP+3HfHQKhvfobGTvV3X8qI2wAAfgAA9VQDABAQIQAAFs4A4lTMzMzMzMwAAABAm0gAAGRJgDViAQAAgCwAgNqZtgAA8CWFuIRQShguy+Gw9Ns8AARcCRHC41GAcsRPAQBYAcqXJgAAAJSPpSbgrICoAoKgEcBs0XjDI3budUW6r3OThbFmrpsdAAr2Wp5JBTghGQUGxrhVfH9TJBB8gXGEgwSwr8RxAN5m/N/3ZhcX73gHw2lrn3oKtBn/973ZxcU73sFw2tqnngLidgCAN4i6RQFU+gBiIgCibgFAKkdiTCzGTMAsxgwAAACgTSQAABQ1RlFArZ2JKAAAAGCsUWsBgC8pxGUIpYThsoSh7E2rTkvACcpAAxCdqgAAAA78I2kRcvRgEDQgNkIa3CpvsXPYV8ZstJ43aP2nSKwC1ZjObNT2cHBwdiDJEJeDIMzAq6w9V44MaDZEQU7FlhwpAQleZ/yzbptrTXD0ph3UGf+s2+ZaExy9aQffAABCf4LdgUhO5cBixMzMzMwkAAAAgBoAgFrs7cTesMHe1kZt7U1GREKEYflcSjgcwvL5YmEhaik2WkEENa3YbJOCKiIGapqc6t43cp9v1kfx+vN79/sSFFBrVgUF5Of/rfjX/z8D2BrAtojgFokWau2Q5kOeC+wkW1krtaxl20J6AmfbuFvvRuhGYiGVKoWVX6e2+2ydr90GWQyX8mCepETHkyf18WVyAOlEOAMX4AQAXmb8d28NU2xwgDLjv3trmGKDA1wbMDYHB2YmAQAAAAAAAACwEbU3bawYVgOrva1pg42GhY02qHWbrGPFRitYt8FSrVi3EOvWLNWKVUMsdajW6FREq7EVVURVlz+5XFNejXI1u0r2J5c/ya2mJwueLHiyYL/hw4YP66/Nr81sM9t0nWGuAg==";
  REC_URLS.steel2="data:audio/ogg;base64,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";
  REC_URLS.glass0="data:audio/ogg;base64,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";
  REC_URLS.glass1="data:audio/ogg;base64,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";
  REC_URLS.glass2="data:audio/ogg;base64,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";
  REC_URLS.ground0="data:audio/ogg;base64,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";
  REC_URLS.ground1="data:audio/ogg;base64,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";
  REC_URLS.ground2="data:audio/ogg;base64,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";
      REC_URLS.cannonReal='https://raw.githubusercontent.com/6WENHAO/DS-Games/532ea73974a0c9d22cde876c80fad2536143863a/%E5%86%AC%E7%9C%A0%E3%81%AE%E6%9D%BE%E9%BC%A0_/%E6%88%98%E4%BA%89%E9%9B%B7%E9%9C%86/assets/audio/cannon_fire.ogg';
  function build(){
    if(ready)return;ready=true;
    ['deepShot','karCrack','deepCannon','heli','engine','engineJeep','engineTruck','engineHalftrack','engineScout','trackClatter'].forEach(function(k){
      if(window.Howl)proc[k]=new Howl({src:[wavURI(procData(k))],format:['wav'],preload:true,volume:1,pool:10});
    });
    if(window.Howl)Object.keys(REC_URLS).forEach(function(k){
      var u=REC_URLS[k],fmt=(u.indexOf('data:audio/wav')===0||/\.wav(?:\?|$)/i.test(u))?'wav':(u.indexOf('data:audio/ogg')===0||/\.ogg(?:\?|$)/i.test(u))?'ogg':'mp3';
      var isLocalRifle=(k==='rifle0'||k==='rifle1'||k==='rifle2');
      var opts={src:[u],format:[fmt],preload:true,html5:false,pool:k==='smg'?12:8};
      // These source WAVs contain several reports. Only expose the first ~210 ms as "single".
      if(isLocalRifle)opts.sprite={single:[0,185]};
      rec[k]=new Howl(opts);
    });
  }
  function unlockCtx(){try{if(window.Howler&&Howler.ctx&&Howler.ctx.state!=='running')Howler.ctx.resume();if(window.Howler)Howler.volume(1);}catch(e){}}
  function playHowl(h,vol,rate,pan){
    if(!h||typeof h.play!=='function')return false;
    try{if(h.state&&h.state()==='unloaded'&&h.load)h.load();var id=h.play();h.volume(Math.max(0,Math.min(1,vol)),id);h.rate(rate||1,id);if(h.stereo)h.stereo(Math.max(-1,Math.min(1,pan||0)),id);return true;}catch(e){return false;}
  }
  function playSingle(h,vol,rate,pan){
    if(!h||typeof h.play!=='function')return false;
    try{
      if(h.state&&h.state()==='unloaded'&&h.load)h.load();
      var id=h.play('single');h.volume(Math.max(0,Math.min(1,vol)),id);h.rate(rate||1,id);
      if(h.stereo)h.stereo(Math.max(-1,Math.min(1,pan||0)),id);
      return true;
    }catch(e){return false;}
  }
  function procPlay(kind,vol,rate,pan){return proc[kind]?playHowl(proc[kind],vol,rate||1,pan||0):false;}
  var WEAPON_SOUND_DB={
    kar:{key:'sniper',rate:.98,vol:1.00,layer:'rifle0',layerVol:.22,crack:.14},
    g43:{key:'rifle1',rate:1.02,vol:.98,layer:'rifle2',layerVol:.18,crack:.12,single:true},
    stg:{key:'smg0',rate:.94,vol:.90,layer:'rifle1',layerVol:.15,crack:.10,machine:true},
    fg42:{key:'rifle2',rate:1.03,vol:.95,layer:'rifle0',layerVol:.18,crack:.13,machine:true,single:true},
    mg34:{key:'smg0',rate:.86,vol:.91,layer:'rifle1',layerVol:.12,crack:.08,machine:true},
    mg42:{key:'smg0',rate:1.03,vol:.94,layer:'rifle2',layerVol:.11,crack:.08,machine:true}
  };
  function weaponSample(){
    var name=(gameState&&gameState.profile?gameState.profile.primaryName:'KAR 98K').toUpperCase();
    if(name.indexOf('KAR 98K')===0)return WEAPON_SOUND_DB.kar;
    if(name.indexOf('GEWEHR 43')===0)return WEAPON_SOUND_DB.g43;
    if(name.indexOf('STG 44')===0)return WEAPON_SOUND_DB.stg;
    if(name.indexOf('FG 42')===0)return WEAPON_SOUND_DB.fg42;
    if(name.indexOf('MG 34')===0)return WEAPON_SOUND_DB.mg34;
    if(name.indexOf('MG 42')===0)return WEAPON_SOUND_DB.mg42;
    return WEAPON_SOUND_DB.kar;
  }
  function playRecorded(h,key,vol,rate,pan,single){
    if(!h)return false;
    return single?playSingle(h,vol,rate,pan):playHowl(h,vol,rate,pan);
  }
  function playPrimaryShot(vol,pan){
    var ws=weaponSample(),rate=ws.rate*(.993+rnd()*.014);
    // Recorded shot is the main layer. Kar98 uses the full sniper/rifle report, not a synthetic tone.
    if(ws.key&&rec[ws.key])playRecorded(rec[ws.key],ws.key,Math.min(1,vol*ws.vol),rate,pan,!!ws.single);
    if(ws.layer&&rec[ws.layer])playRecorded(rec[ws.layer],ws.layer,Math.min(.30,vol*(ws.layerVol||.16)),rate*.97,-pan*.20,true);
    if(proc.karCrack)procPlay('karCrack',Math.min(.18,vol*(ws.crack||.10)),rate,pan*.25);
    if(proc.deepShot)procPlay('deepShot',Math.min(.16,vol*(ws.machine?.07:.12)),ws.machine?1.10:.94,pan*.15);
  }
  function playSupportLaunch(vol,pan){
    var lvl=gameState&&gameState.profile?gameState.profile.specialVisual:0;
    if(lvl<4)procPlay('deepShot',Math.min(.42,vol*.48),1.18,pan);
    else if(lvl<8)procPlay('deepShot',Math.min(.62,vol*.66),1.02,pan);
    else if(lvl<12)procPlay('deepCannon',Math.min(.76,vol*.80),1.16,pan);
    else procPlay('deepCannon',Math.min(.86,vol*.90),.88,pan);
  }
  function vehicleSound(v){
    if(!v)return;
    var ratio=clamp((v.currentSpeed||0)/Math.max(1,v.speed||40),0,1),pan=clamp((v.x-W*.5)/(W*.52),-.72,.72);
    var proximity=clamp(.28+.72*(v.y/H),.22,1),idle=(v.state==='unload'||v.state==='firestop'||v.state==='support');
    var vol=(idle?.12:.13+ratio*.15)*proximity,rate=.80+ratio*.46;
    var key=v.type==='halftrack'?'engineHalftrack':v.type==='scoutcar'?'engineScout':v.type==='jeep'?'engineJeep':'engineTruck';
    if(proc[key])procPlay(key,vol,rate,pan);
    if(v.type==='halftrack'&&ratio>.10&&proc.trackClatter)procPlay('trackClatter',Math.min(.17,vol*.72),.82+ratio*.55,pan);
  }
  function play(kind,volume,opts){
    build();opts=opts||{};var now=performance.now(),minGap=kind==='mg'?24:kind==='enemy'?55:kind==='engine'?95:8;
    if(lastPlay[kind]&&now-lastPlay[kind]<minGap)return;lastPlay[kind]=now;
    var pan=opts.pan==null?(rnd()*.08-.04):opts.pan,vol=volume==null?1:volume;
    if(kind==='mg'){playPrimaryShot(vol,pan);return;}
    if(kind==='enemy'){var ek=rnd()<.55?'akReport':'hkReport';if(rec[ek])playHowl(rec[ek],Math.min(.24,vol*.28),.96+rnd()*.08,pan);return;}
    if(kind==='boom'){if(rec.explosionReal)playHowl(rec.explosionReal,Math.min(1,vol*.92),.98+rnd()*.025,pan);return;}
    if(kind==='he'){playSupportLaunch(vol,pan);return;}
    if(kind==='hit'||kind==='flesh'){
      var fk=['flesh0','flesh1','flesh2'][(rnd()*3)|0];
      if(rec[fk])playHowl(rec[fk],Math.min(.78,vol*.72),.92+rnd()*.12,pan);
      return;
    }
    if(kind==='metal'||kind==='steel'){
      var sk=['steel0','steel1','steel2'][(rnd()*3)|0];
      if(rec[sk])playHowl(rec[sk],Math.min(.84,vol*.78),.90+rnd()*.14,pan);
      return;
    }
    if(kind==='driver'){if(rec.bodySoft)playHowl(rec.bodySoft,Math.min(.60,vol*.54),.92+rnd()*.08,pan);return;}
    if(kind==='tire'){
      if(rec.genericReal)playHowl(rec.genericReal,Math.min(.58,vol*.52),.78+rnd()*.06,pan);
      return;
    }
    if(kind==='glass'){
      var gk=['glass0','glass1','glass2'][(rnd()*3)|0];
      if(rec[gk])playHowl(rec[gk],Math.min(.86,vol*.80),.93+rnd()*.10,pan);
      return;
    }
    if(kind==='ground'){
      var dk=['ground0','ground1','ground2'][(rnd()*3)|0];
      if(rec[dk])playHowl(rec[dk],Math.min(.68,vol*.62),.80+rnd()*.14,pan);
      return;
    }
    if(kind==='door'){if(rec.metalHeavy)playHowl(rec.metalHeavy,Math.min(.58,vol*.50),.72+rnd()*.05,pan);return;}
    if(kind==='engine'||kind==='heli'){procPlay(kind,vol,opts.rate||1,pan);return;}
    // No synthetic clock-like bolt/reload ticks.
  }
  var api={
    unlock:function(){build();unlocked=true;unlockCtx();},
    preload:function(){build();},
    tone:function(kind,volume,opts){if(!unlocked)this.unlock();unlockCtx();play(kind,volume,opts);},
    after:function(ms,kind,volume,opts){setTimeout(function(){unlockCtx();play(kind,volume,opts);},ms);},
    enginePulse:function(volume){play('engine',volume==null?.18:volume,{rate:.94+rnd()*.10,pan:rnd()*.12-.06});},
    vehicle:function(v){if(unlocked){unlockCtx();vehicleSound(v);}},
    ensure:function(){if(unlocked)unlockCtx();},
    ambience:function(){if(unlocked)unlockCtx();},
    recordedMode:function(){return true;}
  };
  build();return api;
})();
document.addEventListener('touchstart',function(){AudioSys.unlock();},{passive:true});
document.addEventListener('pointerdown',function(){AudioSys.unlock();},{passive:true});
document.addEventListener('visibilitychange',function(){if(!document.hidden)AudioSys.ensure();});

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

var MAP_LAYOUTS=[
{name:'FOREST ROAD',style:'straight',roadWidth:23,bend:0,cover:.78,patches:5,setpieces:3,trees:1.35,corridor:.235,secondary:'none',compound:-1},
{name:'WOODLAND CHOKE',style:'curve',roadWidth:20,bend:-.11,cover:1.18,patches:4,setpieces:4,trees:1.55,corridor:.215,secondary:'none',compound:1},
{name:'VILLAGE CROSSROADS',style:'cross',roadWidth:24,bend:.04,cover:1.05,patches:3,setpieces:4,trees:.62,corridor:.245,secondary:'cross',compound:-1},
{name:'FARM LANE',style:'s',roadWidth:18,bend:.10,cover:.72,patches:6,setpieces:2,trees:1.12,corridor:.225,secondary:'none',compound:1},
{name:'RUINED STREET',style:'dogleg',roadWidth:21,bend:-.13,cover:1.28,patches:3,setpieces:4,trees:.45,corridor:.215,secondary:'alley',compound:-1},
{name:'SUPPLY YARD',style:'straight',roadWidth:27,bend:.02,cover:1.14,patches:2,setpieces:4,trees:.35,corridor:.255,secondary:'yard',compound:1},
{name:'OPEN APPROACH',style:'straight',roadWidth:25,bend:0,cover:.52,patches:6,setpieces:1,trees:.58,corridor:.285,secondary:'none',compound:-1},
{name:'BROKEN HIGHWAY',style:'s',roadWidth:26,bend:-.09,cover:.88,patches:4,setpieces:3,trees:.70,corridor:.255,secondary:'fork',compound:1},
{name:'INDUSTRIAL GATE',style:'curve',roadWidth:22,bend:.12,cover:1.22,patches:2,setpieces:4,trees:.30,corridor:.225,secondary:'yard',compound:-1},
{name:'DEPOT CROSSING',style:'cross',roadWidth:25,bend:-.02,cover:.98,patches:3,setpieces:4,trees:.38,corridor:.245,secondary:'cross',compound:1},
{name:'DESERT TRACK',style:'curve',roadWidth:19,bend:.14,cover:.62,patches:6,setpieces:2,trees:.38,corridor:.270,secondary:'none',compound:-1},
{name:'RIDGE ROAD',style:'dogleg',roadWidth:20,bend:-.15,cover:.92,patches:5,setpieces:3,trees:.55,corridor:.230,secondary:'fork',compound:1},
{name:'SNOW CAUSEWAY',style:'straight',roadWidth:18,bend:0,cover:.82,patches:5,setpieces:3,trees:1.15,corridor:.215,secondary:'none',compound:-1},
{name:'FROZEN JUNCTION',style:'cross',roadWidth:22,bend:.06,cover:1.02,patches:4,setpieces:3,trees:.90,corridor:.240,secondary:'cross',compound:1},
{name:'ORCHARD LANE',style:'s',roadWidth:18,bend:.13,cover:.88,patches:6,setpieces:2,trees:1.70,corridor:.225,secondary:'alley',compound:-1},
{name:'BUNKER LINE',style:'straight',roadWidth:22,bend:0,cover:1.34,patches:3,setpieces:4,trees:.75,corridor:.205,secondary:'none',compound:1},
{name:'MARSH CAUSEWAY',style:'s',roadWidth:17,bend:-.12,cover:.70,patches:6,setpieces:2,trees:1.05,corridor:.215,secondary:'fork',compound:-1},
{name:'RAIL YARD',style:'dogleg',roadWidth:28,bend:.10,cover:1.10,patches:2,setpieces:4,trees:.28,corridor:.265,secondary:'yard',compound:1}
];
function mapLayoutForLevel(idx,L){var n=(idx*7+(L.seed||0)+(L.zone||0)*3+(L.stage||0)*5)%MAP_LAYOUTS.length;return MAP_LAYOUTS[Math.abs(n)|0];}
function buildMap(){
  var L=level(),rng=seeded(L.seed+gameState.levelIndex*19),p=levelPalette(BASE_PALETTES[L.theme],L.stage);
  var layout=mapLayoutForLevel(gameState.levelIndex,L),stage=L.stage,act=L.actStage||0;
  var roadBase=[.49,.55,.45][stage]+(layout.compound<0?-.015:.015);
  var roadX=W*clamp(roadBase+(rng()-.5)*.085,.36,.64);
  var bendX=clamp(roadX+layout.bend*W+(rng()-.5)*W*.055,W*.22,W*.78);
  var junctionY=H*clamp(.31+stage*.045+(rng()-.5)*.095,.25,.50);
  var leftCompound=layout.compound<0;
  var compound={x:W*clamp((leftCompound?.16:.84)+(rng()-.5)*.065,.08,.92),y:H*clamp(.34+stage*.035+(rng()-.5)*.10,.24,.59),w:70,h:46};
  var patches=[],cover=[],decor=[],trees=[],rocks=[],surface=[],setpieces=[],cid=1;
  var corridorHalf=Math.min(112,W*layout.corridor);
  var patchLayout=[[.14,.24,58,30],[.86,.29,58,28],[.13,.48,62,30],[.87,.52,60,32],[.15,.70,64,34],[.85,.76,66,34]];
  var patchUse=Math.min(patchLayout.length,layout.patches||4);
  for(var i=0;i<patchUse;i++){var q=patchLayout[(i+act)%patchLayout.length];patches.push({x:clamp(W*q[0]+(rng()-.5)*28,18,W-18),y:clamp(H*q[1]+(rng()-.5)*34,safeTop+35,H-safeBottom-35),rx:q[2]*(.80+rng()*.34),ry:q[3]*(.78+rng()*.38),rot:(i%2?-.16:.14)+(rng()-.5)*.24,a:.024+rng()*.016});}
  var themeCover={
    jungle:[['sandbag','sandbagCurve'],['log','logPile'],['crate','crateStack'],['bush','bush2'],['rubble','boulder1'],['fence','woodFence']],
    desert:[['sandbag','sandbagStraight'],['crate','palletCargo'],['rubble','rubbleConcrete'],['barrel','barrelStack'],['lowwall','rubbleWall'],['fence','wireFence']],
    polar:[['sandbag','sandbagCurve'],['crate','crateStack'],['rubble','boulder2'],['log','timberPile'],['fence','wireFence'],['lowwall','rubbleWall']],
    village:[['lowwall','rubbleWall'],['crate','crateStack'],['fence','woodFence'],['sandbag','sandbagStraight'],['rubble','rubbleBrick'],['barrel','barrelStack']],
    industrial:[['crate','palletCargo'],['rubble','rubbleConcrete'],['barrel','barrelStack'],['fence','wireFence'],['lowwall','steelDebris'],['sandbag','sandbagStraight']]
  }[L.theme];
  var roadside=[
    [-1,43,.22,0,-.10],[1,45,.25,1,.12],[-1,62,.31,2,.08],[1,62,.35,3,-.12],
    [-1,45,.41,4,.10],[1,47,.45,5,-.09],[-1,69,.51,1,-.08],[1,68,.55,0,.11],
    [-1,48,.61,3,.12],[1,50,.65,2,-.10],[-1,66,.71,5,.06],[1,64,.75,4,-.08],
    [-1,45,.81,0,-.10],[1,47,.84,1,.10]
  ];
  var roadCount=clamp(Math.round((8+Math.floor(gameState.levelIndex/10))*layout.cover),5,roadside.length);
  for(i=0;i<roadCount;i++){
    var rc=roadside[(i*3+act)%roadside.length],set=themeCover[(rc[3]+act+i)%themeCover.length],sideGap=rc[1]*(.86+rng()*.28);
    cover.push({id:cid++,x:clamp(roadX+rc[0]*sideGap+(rng()-.5)*11,22,W-22),y:clamp(H*(rc[2]+(rng()-.5)*.035),safeTop+50,H-safeBottom-82),kind:set[0],sprite:set[1],len:(rc[0]<0?29:27)*(.84+rng()*.28),rot:rc[4]+(rng()-.5)*.22,r:7,variant:i+act*3,roadside:true,integrity:5,hitProgress:0,destroyed:false});
  }
  var edgeSet=L.theme==='industrial'?['steelDebris','wireFence','rubbleConcrete']:L.theme==='village'?['woodFence','rubbleBrick','crateStack']:L.theme==='desert'?['boulder2','wireFence','jerryStack']:['bush2','logPile','boulder1'];
  var edgeRows=[[.06,.25],[.94,.27],[.07,.43],[.93,.46],[.06,.62],[.94,.65],[.07,.81],[.93,.84]];
  var decorUse=clamp(Math.round(4+layout.cover*3),4,8);
  for(i=0;i<decorUse;i++)decor.push({x:clamp(W*(edgeRows[i][0]+(rng()-.5)*.035),12,W-12),y:clamp(H*(edgeRows[i][1]+(rng()-.5)*.045),safeTop+30,H-safeBottom-30),type:edgeSet[(i+act)%edgeSet.length],rot:(i%2?-.15:.15)+(rng()-.5)*.30,s:.62+rng()*.18});
  var themeSets={jungle:['ambush','timber','defense','supply'],desert:['defense','supply','roadblock','rubble'],polar:['timber','defense','supply','rubble'],village:['roadblock','supply','timber','rubble'],industrial:['rubble','roadblock','supply','defense']}[L.theme];
  var setLayout=[[.10,.36],[.90,.40],[.11,.61],[.89,.66],[.13,.80],[.87,.79]],setUse=clamp(layout.setpieces||3,1,5);
  for(i=0;i<setUse;i++){var sl=setLayout[(i+stage)%setLayout.length];setpieces.push({x:clamp(W*(sl[0]+(rng()-.5)*.045),22,W-22),y:clamp(H*(sl[1]+(rng()-.5)*.055),safeTop+58,H-safeBottom-70),type:themeSets[(i+stage+act)%themeSets.length],rot:(i%2?-.16:.16)+(rng()-.5)*.24,flip:(i+act)%2?-1:1,s:.70+rng()*.18});}
  var edgeTrees=[[.04,.20],[.96,.22],[.05,.37],[.95,.41],[.04,.58],[.96,.61],[.05,.78],[.95,.82]];
  var treeBase=L.theme==='desert'?2:L.theme==='industrial'?3:5,treeUse=clamp(Math.round(treeBase*layout.trees),1,8);
  for(i=0;i<treeUse;i++){var tr=edgeTrees[i%edgeTrees.length];trees.push({x:clamp(W*(tr[0]+(rng()-.5)*.035),10,W-10),y:clamp(H*(tr[1]+(rng()-.5)*.050),safeTop+25,H-safeBottom-25),r:6.0+(i%3)*2+rng()*1.8,variant:(i+act)%5,dead:L.theme==='industrial'&&(i+act)%2===0});}
  var rockLayout=[[.06,.34],[.94,.37],[.07,.57],[.93,.60],[.06,.76],[.94,.80]],rockUse=layout.cover>1.1?5:3;
  for(i=0;i<rockUse;i++){var rk=rockLayout[i];rocks.push({x:clamp(W*(rk[0]+(rng()-.5)*.032),12,W-12),y:clamp(H*(rk[1]+(rng()-.5)*.040),safeTop+28,H-safeBottom-28),r:4.5+(i%2)*2+rng()*1.5,variant:(i+act)%3});}
  surface.push({x:roadX+(rng()-.5)*9,y:H*(.39+(rng()-.5)*.045),type:'trackStraight',rot:(rng()-.5)*.12,s:.65+rng()*.10,a:.14+rng()*.05});
  surface.push({x:roadX+8+(rng()-.5)*10,y:H*(.62+(rng()-.5)*.045),type:layout.style==='s'?'trackCurve':'trackStraight',rot:(rng()-.5)*.12,s:.65+rng()*.10,a:.13+rng()*.05});
  if(layout.secondary!=='none')surface.push({x:roadX+(rng()-.5)*18,y:junctionY,type:'gravel',rot:layout.secondary==='cross'?Math.PI/2:.18,s:.92,a:.20});
  if(gameState.levelIndex>=4)surface.push({x:roadX+corridorHalf*.70,y:H*.49,type:'gravel',rot:.1,s:.72,a:.18});
  if(gameState.levelIndex>=7)surface.push({x:roadX-corridorHalf*.72,y:H*.73,type:'scorch1',rot:-.2,s:.72,a:.19});
  gameState.map={palette:p,units:unitPalette(p),road:{x:roadX,bendX:bendX,junctionY:junctionY,width:layout.roadWidth,style:layout.style,secondary:layout.secondary},compound:compound,patches:patches,cover:cover,decor:decor,trees:trees,rocks:rocks,surface:surface,setpieces:setpieces,corridorHalf:corridorHalf,layoutName:layout.name,layout:layout};
}
/* ---------- GAME STATE ---------- */

function freshState(){
  var sv=loadSave();
  return {
    mode:'menu',save:sv,levelIndex:0,
    time:0,levelTime:0,levelComplete:false,
    profile:null,bunker:{x:W*.5,y:H-78,hp:100,maxHp:100,angle:-Math.PI/2},
    aim:{x:W*.5,y:H*.35},pointer:{down:false,t0:0,heFired:false},
    heat:0,overheat:false,eff:.75,hitMarker:0,hitPulse:0,streak:0,streakT:0,message:'',messageT:0,shake:0,screenFlash:0,hitStop:0,wave:0,
    stats:{shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0},
    infantry:[],vehicles:[],air:[],paras:[],shots:[],enemyShots:[],effects:[],craters:[],wrecks:[],blood:[],fireZones:[],
    events:[],eventCursor:0,burstQueue:[],map:null,primaryAmmo:0,primaryCooldown:0,primaryReloadT:0
  };
}
function resetLevel(){
  gameState.profile=playerProfile();
  gameState.adaptiveSnapshot=clamp(gameState.save.adaptiveDifficulty||0,-.24,.30);
  gameState.damageTarget=levelDamageBand(gameState.levelIndex,gameState.profile.maxHp);
  gameState.adaptiveEvaluated=false;
  gameState.enemyProfile=enemyProgression(gameState.levelIndex);
  gameState.time=0;gameState.levelTime=0;gameState.levelComplete=false;
  gameState.bunker.x=W*.5;gameState.bunker.y=H-Math.max(72,safeBottom+52);
  gameState.bunker.maxHp=gameState.profile.maxHp;gameState.bunker.hp=gameState.profile.maxHp;
  gameState.primaryAmmo=gameState.profile.primaryMag;gameState.primaryCooldown=0;gameState.primaryReloadT=0;
  gameState.heat=0;gameState.overheat=false;gameState.eff=.75;gameState.hitMarker=0;gameState.hitPulse=0;gameState.streak=0;gameState.streakT=0;gameState.message='';gameState.messageT=0;gameState.shake=0;gameState.screenFlash=0;gameState.hitStop=0;gameState.wave=0;
  gameState.stats={shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0};
  gameState.infantry=[];gameState.vehicles=[];gameState.air=[];gameState.paras=[];gameState.shots=[];gameState.enemyShots=[];gameState.effects=[];gameState.craters=[];gameState.wrecks=[];gameState.blood=[];gameState.fireZones=[];gameState.killZones=[];gameState.burstQueue=[];gameState.pointer.down=false;gameState.pointer.heFired=false;
  buildMap();
  gameState.events=buildEncounterPlan();
  gameState.eventCursor=0;
  gameState.mode='playing';
}

/* ---------- ENCOUNTER DIRECTOR ---------- */


var ENCOUNTER_NAMES={
  infantry:'INFANTRY ASSAULT',convoy:'VEHICLE CONVOY',ambush:'AMBUSH',rocket:'ROCKET THREAT',
  mixed:'MIXED ASSAULT',rush:'LIGHT VEHICLE RUSH',airborne:'AIRBORNE INSERTION',endurance:'ENDURANCE',
  elite:'ELITE ASSAULT',heavy:'HEAVY CONVOY',finale:'SECTOR FINALE'
};
var ZONE_ARCHETYPES={
  jungle:['infantry','ambush','mixed','rocket','endurance','infantry','elite','ambush'],
  desert:['convoy','rush','mixed','rocket','heavy','convoy','endurance','airborne'],
  polar:['mixed','infantry','ambush','heavy','endurance','rocket','airborne','elite'],
  village:['infantry','ambush','rocket','mixed','convoy','elite','endurance','mixed'],
  industrial:['convoy','heavy','mixed','rocket','rush','endurance','elite','airborne']
};

var DAMAGE_TARGET_BANDS=[
  [.06,.16],[.07,.17],[.08,.18],[.09,.19],[.10,.20],[.11,.21],[.12,.22],[.13,.23],[.14,.24],[.15,.25],
  [.15,.26],[.16,.27],[.16,.28],[.17,.29],[.17,.30],[.18,.31],[.18,.32],[.19,.33],[.19,.34],[.20,.35],
  [.20,.35],[.20,.36],[.21,.36],[.21,.37],[.22,.37],[.22,.38],[.22,.38],[.23,.39],[.23,.39],[.24,.40],
  [.24,.40],[.24,.41],[.25,.41],[.25,.42],[.25,.42],[.26,.42],[.26,.43],[.26,.43],[.27,.44],[.27,.44]
];
function levelDamageBand(idx,maxHp){
  var b=DAMAGE_TARGET_BANDS[clamp(idx|0,0,DAMAGE_TARGET_BANDS.length-1)],hp=Math.max(1,maxHp||100);
  return {min:Math.round(hp*b[0]),max:Math.round(hp*b[1]),minPct:b[0],maxPct:b[1]};
}
function adaptiveValue(){
  if(gameState&&typeof gameState.adaptiveSnapshot==='number')return gameState.adaptiveSnapshot;
  return gameState&&gameState.save?clamp(gameState.save.adaptiveDifficulty||0,-.24,.30):0;
}
function enemyProgression(idx){
  var a=adaptiveValue(),p=clamp(idx/39,0,1);
  return {
    adaptive:a,
    infantryHp:(1+idx*.011)*(1+a*.58),
    infantrySpeed:(1+idx*.0027)*(1+a*.24),
    infantryDamage:(1+idx*.0085)*(1+a),
    vehicleHp:(1+idx*.014)*(1+a*.64),
    vehicleSpeed:(1+idx*.0028)*(1+a*.20),
    vehicleDamage:(1+idx*.009)*(1+a),
    cooldown:clamp((1-idx*.0045)*(1-a*.34),.70,1.14),
    accuracy:clamp((1-idx*.010)*(1-a*.22),.57,1.18),
    decision:clamp((1-idx*.009)*(1-a*.24),.58,1.12),
    professionalism:p
  };
}
function enemyWeaponProfile(role,idx){
  if(role==='lmg'){
    if(idx<10)return {name:'MG34',damage:1.00,speed:1.00,spread:.070,cooldown:1.00};
    if(idx<24)return {name:'MG42',damage:1.07,speed:1.03,spread:.058,cooldown:.88};
    return {name:'MG42 VETERAN',damage:1.13,speed:1.05,spread:.048,cooldown:.80};
  }
  if(role==='marksman'){
    if(idx<18)return {name:'KAR98K ZF39',damage:1.05,speed:1.02,spread:.025,cooldown:1.00};
    return {name:'G43 ZF4',damage:1.12,speed:1.04,spread:.018,cooldown:.88};
  }
  if(role==='grenadier'||role==='rocket'){
    if(idx<18)return {name:'PANZERFAUST 30',damage:1.00,speed:1.00,spread:.095,cooldown:1.00};
    if(idx<26)return {name:'PANZERFAUST 60',damage:1.10,speed:1.05,spread:.080,cooldown:.92};
    if(idx<34)return {name:'PANZERFAUST 100',damage:1.20,speed:1.08,spread:.067,cooldown:.86};
    return {name:'PANZERSCHRECK',damage:1.28,speed:1.12,spread:.055,cooldown:.80};
  }
  if(idx<8)return {name:'KAR98K',damage:1.00,speed:1.00,spread:.080,cooldown:1.00};
  if(idx<16)return {name:'KAR98K VETERAN',damage:1.04,speed:1.01,spread:.068,cooldown:.94};
  if(idx<26)return {name:'GEWEHR 43',damage:1.09,speed:1.03,spread:.056,cooldown:.86};
  return {name:'STG 44',damage:1.12,speed:1.00,spread:.065,cooldown:.74};
}
function vehicleWeaponProfile(type,idx){
  var base=idx<12?{name:'MG34',damage:1.00,spread:.052,cooldown:1.00}:idx<26?{name:'MG42',damage:1.10,spread:.042,cooldown:.88}:{name:'MG42 VETERAN',damage:1.18,spread:.034,cooldown:.78};
  if(type==='halftrack')base={name:base.name+' HEAVY',damage:base.damage*1.10,spread:base.spread*.92,cooldown:base.cooldown*.92};
  if(type==='scoutcar')base={name:base.name+' TURRET',damage:base.damage*1.06,spread:base.spread*.88,cooldown:base.cooldown*.94};
  return base;
}
function enemyFireDelay(e,base){
  var prog=enemyProgression(gameState.levelIndex),wp=e&&e.weaponProfile?e.weaponProfile:enemyWeaponProfile(e?e.role:'rifle',gameState.levelIndex);
  return Math.max(.12,base*prog.cooldown*(wp.cooldown||1));
}
function adaptiveLabel(v){
  var pct=Math.round((v||0)*100);
  return pct===0?'0%':(pct>0?'+':'')+pct+'%';
}
function evaluateAdaptiveDifficulty(failed){
  if(gameState.adaptiveEvaluated)return {change:0,value:gameState.save.adaptiveDifficulty||0,rating:'stable',band:gameState.damageTarget,damage:gameState.stats.damageTaken||0};
  gameState.adaptiveEvaluated=true;
  var band=gameState.damageTarget||levelDamageBand(gameState.levelIndex,gameState.bunker.maxHp);
  var dmg=gameState.stats.damageTaken||0,old=clamp(gameState.save.adaptiveDifficulty||0,-.24,.30),delta=0,rating='balanced';
  if(failed){
    var over=Math.max(0,dmg-band.max),sev=clamp(over/Math.max(1,band.max),0,1);
    delta=-(.065+sev*.035);rating='too hard';
  }else if(dmg<band.min){
    var under=(band.min-dmg)/Math.max(1,band.min);
    delta=.035+clamp(under,0,1)*.035;rating='too easy';
  }else if(dmg>band.max){
    var excess=(dmg-band.max)/Math.max(1,band.max);
    delta=-(.040+clamp(excess,0,1)*.045);rating='too hard';
  }else{
    delta=old>0?-.006:old<0?.006:0;rating='on target';
  }
  var next=clamp(old+delta,-.24,.30);
  gameState.save.adaptiveDifficulty=next;
  gameState.save.lastDynamic={map:gameState.levelIndex+1,damage:Math.round(dmg),min:band.min,max:band.max,rating:rating,from:old,to:next};
  saveGame();
  return {change:next-old,value:next,rating:rating,band:band,damage:dmg};
}

function difficultyBand(idx){
  if(idx<2)return {count:.66,gap:1.22,motors:1,elite:0,air:0};
  if(idx<4)return {count:.72,gap:1.18,motors:1,elite:0,air:0};
  if(idx<8)return {count:.80,gap:1.12,motors:1,elite:.05,air:0};
  if(idx<12)return {count:.88,gap:1.08,motors:2,elite:.10,air:0};
  if(idx<20)return {count:.96,gap:1.03,motors:2,elite:.18,air:.08};
  if(idx<30)return {count:1.06,gap:.98,motors:2,elite:.28,air:.16};
  return {count:1.14,gap:.94,motors:3,elite:.38,air:.23};
}
function levelArchetype(idx){
  var mapNo=idx+1;
  if(mapNo%5===0)return 'finale';
  var L=LEVELS[idx],theme=L.theme,arr=ZONE_ARCHETYPES[theme]||ZONE_ARCHETYPES.jungle;
  return arr[L.actStage%arr.length];
}
function addEncounter(events,t,type,count,wave,total,label,opts){
  var e={t:t,type:type,count:Math.max(1,Math.round(count||1)),wave:wave,totalWaves:total};
  if(label)e.label=label;
  if(opts)for(var k in opts)e[k]=opts[k];
  events.push(e);return e;
}
function plannedSquadSize(idx,base,band){
  return Math.max(2,Math.round((base+Math.min(2,Math.floor(idx/12)))*band.count));
}
function zoneVehicleBias(theme){
  return theme==='desert'?1.18:theme==='industrial'?1.14:theme==='polar'?1.04:theme==='village'?.90:.86;
}


function mgTeamsForLevel(idx,rng){
  if(idx<6)return 0;
  var max=idx<12?1:idx<22?2:3;
  return Math.min(3,Math.floor(rng()*(max+1)));
}
function finalize1944Plan(events,idx,rng,totalWaves){
  var teams=0;
  for(var i=0;i<events.length;i++)if(events[i].type==='mgTeam')teams++;
  gameState.mgTeamsPlanned=teams;
  events.sort(function(a,b){return a.t-b.t;});
  return events;
}
function findMGGunner(teamId){for(var i=0;i<gameState.infantry.length;i++){var e=gameState.infantry[i];if(e.alive&&e.mgTeamId===teamId&&e.mgTeamGunner)return e;}return null;}
function reactSquadToLoss(dead){
  var idx=gameState.levelIndex,survivors=[],z=strongestKillZone();for(var i=0;i<gameState.infantry.length;i++){var e=gameState.infantry[i];if(e.alive&&e!==dead&&e.squadId===dead.squadId)survivors.push(e);}
  if(dead.mgTeamGunner&&dead.mgTeamId!=null){for(i=0;i<survivors.length;i++){var a=survivors[i];if(a.mgTeamId===dead.mgTeamId&&a.mgAssistant){a.mgAssistant=false;a.mgTeamGunner=true;a.role='lmg';a.firePose='prone';a.fireCd=.20;a.state='advance';a.cover=nearestCover(a)||nextForwardCover(a);break;}}}
  if(!survivors.length||idx<6)return;var tactic=(idx>=14&&z&&z.strength>=2)?(z.x>=gameState.map.road.x?'flankLeft':'flankRight'):newSquadTactic();
  for(i=0;i<survivors.length;i++){var s=survivors[i];s.tactic=tactic;s.decisionT=.12+Math.random()*.16;if(s.state==='fire'||s.state==='cover'||s.state==='prone'){s.cover=nextForwardCover(s)||nearestCover(s);s.state=s.cover?'advance':'fire';s.stateT=0;}}
}
function spawnMGTeam(tactic){
  var roadX=gameState.map.road.x,half=gameState.map.corridorHalf||92,side=tactic==='flankRight'?1:tactic==='flankLeft'?-1:(Math.random()<.5?-1:1),origin=clamp(roadX+side*half*.56,32,W-32),teamId=squadSerial++,sq=squadPlan(3,tactic||'support',origin);sq.id=teamId;sq.tactic=tactic||'support';sq.flankX=origin;
  var roles=['lmg','rifle','rifle'];for(var i=0;i<3;i++){var member={id:teamId,tactic:sq.tactic,size:3,originX:origin,phase:sq.phase,slot:i,flankX:clamp(origin+(i-1)*14,30,W-30)},e=spawnInfantry(origin+(i-1)*12,safeTop+66-rand(0,18),roles[i],member);e.mgTeamId=teamId;e.mgTeamGunner=i===0;e.mgAssistant=i===1;e.mgAmmoBearer=i===2;e.firePose=i===0?'prone':'crouch';e.aggressive=i===0?.35:.10;if(i===0){e.speed*=.90;e.decisionT=.35;e.fireCd=rand(.25,.48);}}
}

function buildEncounterPlan(){
  var idx=gameState.levelIndex,L=level(),rng=seeded(L.seed+idx*911),events=[],mapNo=idx+1,tier=Math.floor(idx/2);
  var milestone=mapNo%10===0,totalWaves=idx<2?2:idx<6?3:(milestone?4:3);
  var time=.18,truckLoad=idx===0?2:idx===1?3:Math.min(6,3+Math.floor(idx/6));
  var gap=idx<2?6.9:idx<6?6.2:idx<12?5.8:5.25;
  var names=['TRANSPORT CONTACT','RIFLE REINFORCEMENTS','LIGHT SCOUTS','MG SUPPORT','HALFTRACK ESCORT','MARKSMEN','ROCKET THREAT','ARMORED SCOUT','ELITE INFANTRY','AIRBORNE','HEAVY TRANSPORT','AIR ATTACK'];
  gameState.encounterName=names[Math.min(tier,names.length-1)];
  gameState.waveTotal=totalWaves;

  function add(t,type,count,wave,label,opts){return addEncounter(events,t,type,count,wave,totalWaves,label,opts);}
  function newestFeature(wave,t){
    if(tier===0)return;
    if(tier===1)add(t,'foot',2+Math.min(1,idx-2),wave,'RIFLE SQUAD',{roleMix:'rifle',tactic:wave%2?'flankLeft':'flankRight'});
    else if(tier===2)add(t,'jeep',1,wave,'LIGHT SCOUT',{motorCap:1});
    else if(tier===3)add(t,'mgTeam',3,wave,'MG42 TEAM',{tactic:wave%2?'flankRight':'flankLeft'});
    else if(tier===4)add(t,'halftrack',3+Math.floor((idx-8)/2),wave,'HALFTRACK',{motorCap:2});
    else if(tier===5)add(t,'marksmanSquad',2+Math.floor((idx-10)/2),wave,'MARKSMEN',{tactic:'support'});
    else if(tier===6)add(t,'rocketSquad',3,wave,'ROCKET SPECIALIST',{rocketCount:1,tactic:'support'});
    else if(tier===7)add(t,'scoutcar',1,wave,'ARMORED SCOUT',{motorCap:2});
    else if(tier===8)add(t,'eliteSquad',3,wave,'ELITE SQUAD',{tactic:'split'});
    else if(tier===9)add(t,'heli',2,wave,'AIRBORNE');
    else if(tier===10)add(t,'lighttruck',1,wave,'HEAVY TRANSPORT',{motorCap:2});
    else add(t,'plane',tier>=13?3:2,wave,'AIR ATTACK');
  }
  function olderFeature(wave,t){
    var pick=Math.max(1,tier-1),choice=Math.floor(rng()*pick);
    if(choice===0)add(t,'foot',Math.min(5,2+Math.floor(idx/7)),wave,null,{roleMix:'rifle',tactic:rng()<.5?'bound':'roadside'});
    else if(choice===1)add(t,'jeep',1,wave,null,{motorCap:2});
    else if(choice===2)add(t,'mgTeam',3,wave,null,{tactic:rng()<.5?'flankLeft':'flankRight'});
    else if(choice===3)add(t,'halftrack',Math.min(5,3+Math.floor(idx/12)),wave,null,{motorCap:2});
    else if(choice===4)add(t,'marksmanSquad',2,wave,null,{tactic:'support'});
    else if(choice===5)add(t,'rocketSquad',3,wave,null,{rocketCount:1,tactic:'support'});
    else if(choice===6)add(t,'scoutcar',1,wave,null,{motorCap:2});
    else if(choice===7)add(t,'eliteSquad',3,wave,null,{tactic:'split'});
    else if(choice===8)add(t,'heli',2,wave,null);
    else add(t,'lighttruck',1,wave,null,{motorCap:2});
  }

  for(var wave=1;wave<=totalWaves;wave++){
    var label=wave===1?gameState.encounterName:(wave===totalWaves?'FINAL WAVE':null);
    // The backbone is always readable: a troop carrier arrives, stops and unloads.
    add(time,'trooptruck',truckLoad+(wave===totalWaves&&idx>=6?1:0),wave,label,{motorCap:idx<8?1:2});
    if(tier>0){
      var featureTime=time+(idx<6?2.5:2.1);
      // New mechanic is guaranteed once per level, normally in the final wave.
      if(wave===totalWaves)newestFeature(wave,featureTime);
      // From level 5 onward one earlier mechanic can reappear, but never a pile of all unlocks.
      else if(tier>=2&&wave>1)olderFeature(wave,featureTime);
      else if(tier===1&&wave===2)olderFeature(wave,featureTime);
    }
    time+=gap+(rng()-.5)*.55;
  }
  return finalize1944Plan(events,idx,rng,totalWaves);
}
function processEvents(){
  while(gameState.eventCursor<gameState.events.length&&gameState.levelTime>=gameState.events[gameState.eventCursor].t){
    var e=gameState.events[gameState.eventCursor];
    if(e.wave&&e.wave!==gameState.wave){
      gameState.wave=e.wave;
      gameState.message='WAVE '+e.wave+'/'+(e.totalWaves||gameState.waveTotal||3);
      gameState.messageT=.72;
    }
    if(e.label){gameState.message=e.label;gameState.messageT=.86;}
    var motor=e.type==='trooptruck'||e.type==='jeep'||e.type==='scoutcar'||e.type==='lighttruck'||e.type==='truck'||e.type==='halftrack';
    if(motor){
      var liveMotor=0;
      for(var v=0;v<gameState.vehicles.length;v++){
        var mv=gameState.vehicles[v];
        if(mv.alive&&mv.state!=='parked'&&mv.state!=='parkedDisabled'&&mv.state!=='disabled'&&!(mv.type==='trooptruck'&&mv.state==='depart'))liveMotor++;
      }
      var cap=e.motorCap||difficultyBand(gameState.levelIndex).motors;
      if(liveMotor>=cap){e.t+=.58;break;}
    }
    gameState.eventCursor++;
    if(e.type==='mgTeam')spawnMGTeam(e.tactic);
    else if(e.type==='foot')spawnPlannedFoot(e.count,e.roleMix||'mixed',e.tactic);
    else if(e.type==='rocketSquad')spawnPlannedFoot(e.count,'rocket',e.tactic,e.rocketCount||1);
    else if(e.type==='lmgSquad')spawnPlannedFoot(e.count,'lmg',e.tactic);
    else if(e.type==='marksmanSquad')spawnPlannedFoot(e.count,'marksman',e.tactic);
    else if(e.type==='eliteSquad')spawnPlannedFoot(e.count,'elite',e.tactic,e.rocketCount||1);
    else if(e.type==='heli')spawnHeli(e.count);
    else if(e.type==='plane')spawnPlane(e.count);
    else spawnVehicle(e.type,e.count);
  }
}
/* ---------- SPAWN ---------- */

function laneX(offset){return clamp(gameState.map.road.x+offset,28,W-28);}
var squadSerial=1;
function registerKillZone(x,y){
  if(!gameState.killZones)gameState.killZones=[];
  var best=null,bd=999;
  for(var i=0;i<gameState.killZones.length;i++){var z=gameState.killZones[i],d=dist(x,y,z.x,z.y);if(d<55&&d<bd){best=z;bd=d;}}
  if(best){best.x=lerp(best.x,x,.25);best.y=lerp(best.y,y,.25);best.strength=Math.min(6,(best.strength||1)+1);best.until=gameState.time+12;}
  else gameState.killZones.push({x:x,y:y,strength:1,until:gameState.time+10});
  gameState.killZones=gameState.killZones.filter(function(z){return z.until>gameState.time;}).slice(-5);
}
function strongestKillZone(){
  var best=null;
  if(!gameState.killZones)return null;
  for(var i=0;i<gameState.killZones.length;i++){var z=gameState.killZones[i];if(z.until<=gameState.time)continue;if(!best||(z.strength||0)>(best.strength||0))best=z;}
  return best;
}
function avoidKillZonePoint(e,pt){
  var z=strongestKillZone();if(!z||z.strength<2)return pt;
  if(z.y<e.y-15||z.y>e.y+190)return pt;
  var danger=dist(pt.x,pt.y,z.x,z.y)<95||Math.abs(e.x-z.x)<58;
  if(!danger)return pt;
  var roadX=gameState.map.road.x,half=gameState.map.corridorHalf||92;
  var side=(z.x>=roadX)?-1:1;
  return {x:clamp(roadX+side*half*.72,roadX-half,roadX+half),y:Math.max(pt.y,z.y+28)};
}
function newSquadTactic(){
  var idx=gameState.levelIndex,z=strongestKillZone(),list;
  if(idx>=12&&z&&z.strength>=2)return z.x>=gameState.map.road.x?'flankLeft':'flankRight';
  if(idx<4)list=['direct','direct','direct'];
  else if(idx<8)list=['direct','flankLeft','flankRight'];
  else if(idx<12)list=['flankLeft','flankRight','bound','roadside'];
  else if(idx<18)list=['flankLeft','flankRight','bound','roadside','support'];
  else list=['flankLeft','flankRight','bound','support','split','roadside'];
  return list[(Math.random()*list.length)|0];
}
function squadPlan(n,tactic,originX){
  return {id:squadSerial++,tactic:tactic||newSquadTactic(),size:n,originX:originX==null?gameState.map.road.x:originX,phase:Math.random()*TAU};
}
function tacticalPoint(e){var roadX=gameState.map.road.x,half=gameState.map.corridorHalf||92,left=clamp(roadX-half*.80,30,W-30),right=clamp(roadX+half*.80,30,W-30),tx=gameState.bunker.x,ty=gameState.bunker.y;if(e.tactic==='flankLeft'&&e.y<H*.62){tx=left;ty=H*.60;}else if(e.tactic==='flankRight'&&e.y<H*.62){tx=right;ty=H*.60;}else if(e.tactic==='split'&&e.y<H*.58){tx=e.slot%2?roadX+half*.52:roadX-half*.52;ty=H*.57;}else if(e.tactic==='bound'&&e.y<H*.60){tx=clamp(roadX+(e.slot%2?half*.42:-half*.42),35,W-35);ty=H*.60;}else if(e.tactic==='roadside'&&e.y<H*.58){tx=clamp(e.flankX,roadX-half*.82,roadX+half*.82);ty=H*.58;}else if(e.tactic==='support'&&e.y<H*.50){tx=clamp(e.flankX||roadX,roadX-half*.78,roadX+half*.78);ty=H*.49;}return {x:clamp(tx,roadX-half,roadX+half),y:ty};}
function squadIsMoving(e){
  if(e.tactic!=='bound')return true;
  var phase=Math.floor((gameState.time+e.squadPhase)/1.55)%2;
  return (e.slot%2)===phase;
}
function spawnInfantry(x,y,role,squad){
  role=role||['rifle','rifle','lmg','grenadier','marksman'][(Math.random()*5)|0];
  var prog=enemyProgression(gameState.levelIndex),baseHp=gameState.levelIndex===0?18:gameState.levelIndex===1?24:gameState.levelIndex===2?30:38;
  var hp=(role==='lmg'?baseHp+8:role==='grenadier'?baseHp+5:role==='marksman'?Math.max(18,baseHp-2):baseHp)*prog.infantryHp;
  var speed=(role==='lmg'?25:role==='grenadier'?26:role==='marksman'?26:28)*prog.infantrySpeed;
  var id=Math.random()*1e9|0;
  squad=squad||squadPlan(1,'direct',x);
  var roll=Math.random(),firePose=role==='marksman'?'prone':role==='lmg'?(roll<.74?'crouch':roll<.88?'prone':'stand'):(roll<.18?'prone':roll<.70?'stand':'crouch');
  var e={
    id:id,role:role,x:x==null?laneX(rand(-95,95)):x,y:y==null?safeTop+72-rand(0,35):y,
    hp:hp,maxHp:hp,speed:speed,alive:true,
    state:'advance',stateT:0,fireCd:rand(.44,.92),muzzle:0,recoil:0,proneT:0,
    anim:Math.random()*10,anim2:Math.random()*10,angle:Math.PI/2,cover:null,lastCoverId:0,suppression:0,deadT:0,
    variant:Math.abs(id)%12,firePose:firePose,lastX:x||0,lastY:y||0,stuckT:0,
    squadId:squad.id,tactic:squad.tactic,slot:squad.slot||0,squadPhase:squad.phase||0,
    flankX:squad.flankX==null?(x||gameState.map.road.x):squad.flankX,
    decisionT:rand(.8,1.7)*prog.decision,burstCount:0,lean:rand(-.08,.08),crawlPhase:Math.random()*TAU,
    aggressive:squad.aggressive||0,burnT:0,bleedT:0,bleedCd:0,limp:0,dismounted:!!squad.dismounted,progressY:y||0,noProgressT:0,forceDirectT:0,vx:0,vy:0,
    rocketUnit:role==='grenadier'&&gameState.levelIndex>=10,rocketAimT:0,rocketAimTotal:0,rocketAimAngle:0
  };
  e.weaponProfile=enemyWeaponProfile(role,gameState.levelIndex);e.weaponName=e.weaponProfile.name;e.professionalism=prog.professionalism;
  gameState.infantry.push(e);
  e.cover=nextForwardCover(e);
  return e;
}

function spawnPlannedFoot(n,mix,tactic,rocketCount){
  var idx=gameState.levelIndex,origin=laneX(idx<2?rand(-24,24):rand(-60,60));
  tactic=tactic||((idx<2)?'direct':newSquadTactic());
  var sq=squadPlan(n,tactic,origin),rockets=idx>=10?Math.max(0,rocketCount||0):0;
  var rocketSlots={};
  while(rockets>0){
    var slot=(Math.random()*n)|0;
    if(!rocketSlots[slot]){rocketSlots[slot]=true;rockets--;}
  }
  for(var i=0;i<n;i++){
    var role='rifle',r=Math.random();
    if(rocketSlots[i])role='grenadier';
    else if(mix==='rocket')role=(i===0&&idx>=10)?'grenadier':(r<.18?'lmg':'rifle');
    else if(mix==='lmg')role=(i===0||i===Math.floor(n*.55))?'lmg':(r<.16?'marksman':'rifle');
    else if(mix==='marksman')role=(i===0?'marksman':(r<.18?'lmg':'rifle'));
    else if(mix==='elite'){
      if(idx>=10&&i===0)role='grenadier';
      else if(i%4===1)role='lmg';
      else if(i%4===2)role='marksman';
      else role='rifle';
    }else if(mix==='rifle')role=r<.12&&idx>=4?'lmg':'rifle';
    else{
      if(idx>=5&&r<.15)role='marksman';
      else if(idx>=3&&r<.34)role='lmg';
      else role='rifle';
    }
    var member={id:sq.id,tactic:sq.tactic,size:n,originX:origin,phase:sq.phase,slot:i,flankX:clamp(origin+(i-(n-1)/2)*28,30,W-30)};
    spawnInfantry(origin+(i-(n-1)/2)*17,safeTop+70-rand(0,34),role,member);
  }
}

function spawnFoot(n){
  var idx=gameState.levelIndex,rocketChance=idx<10?0:idx<20?.12:idx<30?.16:.20;
  var rockets=(n>=4&&Math.random()<rocketChance)?1:0;
  spawnPlannedFoot(n,'mixed',null,rockets);
}
var VEHICLE_SPECS={
kubel_1:{id:'kubel_1',family:'kubel',class:1,name:'KUBELWAGEN Kfz.1',baseType:'jeep',hp:.88,speed:1.10,accel:1.08,turn:1.10,weapon:.82,capacity:2,transport:false,visual:'open'},
kubel_2:{id:'kubel_2',family:'kubel',class:2,name:'KUBELWAGEN MG34',baseType:'jeep',hp:1.02,speed:1.12,accel:1.10,turn:1.12,weapon:1,capacity:2,transport:false,visual:'mg'},
kubel_3:{id:'kubel_3',family:'kubel',class:3,name:'KUBELWAGEN MG42',baseType:'jeep',hp:1.18,speed:1.14,accel:1.12,turn:1.15,weapon:1.16,capacity:2,transport:false,visual:'elite'},
horch_1:{id:'horch_1',family:'horch',class:1,name:'HORCH 108 SCOUT',baseType:'jeep',hp:1,speed:1.02,accel:1,turn:1,weapon:.90,capacity:3,transport:false,visual:'radio'},
horch_2:{id:'horch_2',family:'horch',class:2,name:'HORCH 108 FUNKWAGEN',baseType:'jeep',hp:1.16,speed:1.04,accel:1.03,turn:1.02,weapon:1.05,capacity:3,transport:false,visual:'radioArmor'},
horch_3:{id:'horch_3',family:'horch',class:3,name:'HORCH 108 WAFFENWAGEN',baseType:'jeep',hp:1.34,speed:1.05,accel:1.05,turn:1.03,weapon:1.22,capacity:3,transport:false,visual:'gunshield'},
blitz_1:{id:'blitz_1',family:'blitz',class:1,name:'OPEL BLITZ TRANSPORT',baseType:'trooptruck',hp:.96,speed:1,accel:1,turn:1,weapon:0,capacity:4,transport:true,visual:'canvas'},
blitz_2:{id:'blitz_2',family:'blitz',class:2,name:'OPEL BLITZ ESCORT',baseType:'trooptruck',hp:1.14,speed:1.02,accel:1.02,turn:1.02,weapon:.90,capacity:5,transport:true,hasMG:true,visual:'escort'},
blitz_3:{id:'blitz_3',family:'blitz',class:3,name:'OPEL BLITZ PANZERSCHUTZ',baseType:'trooptruck',hp:1.36,speed:1.03,accel:1.03,turn:1.02,weapon:1.10,capacity:6,transport:true,hasMG:true,visual:'armored'},
steyr_1:{id:'steyr_1',family:'steyr',class:1,name:'STEYR 1500A',baseType:'lighttruck',hp:.98,speed:1.05,accel:1.07,turn:1.06,weapon:.82,capacity:4,transport:true,hasMG:true,visual:'rack'},
steyr_2:{id:'steyr_2',family:'steyr',class:2,name:'STEYR 1500A FUNK',baseType:'lighttruck',hp:1.16,speed:1.06,accel:1.08,turn:1.07,weapon:1,capacity:5,transport:true,hasMG:true,visual:'radio'},
steyr_3:{id:'steyr_3',family:'steyr',class:3,name:'STEYR 1500A WAFFENWAGEN',baseType:'lighttruck',hp:1.34,speed:1.08,accel:1.10,turn:1.08,weapon:1.18,capacity:5,transport:true,hasMG:true,visual:'gunshield'},
sdkfz250_1:{id:'sdkfz250_1',family:'sdkfz250',class:1,name:'Sd.Kfz.250/1',baseType:'halftrack',hp:.96,speed:1.03,accel:1.04,turn:1.05,weapon:.90,capacity:5,transport:true,hasMG:true,visual:'half'},
sdkfz250_2:{id:'sdkfz250_2',family:'sdkfz250',class:2,name:'Sd.Kfz.250/3',baseType:'halftrack',hp:1.15,speed:1.04,accel:1.05,turn:1.05,weapon:1.08,capacity:5,transport:true,hasMG:true,visual:'command'},
sdkfz250_3:{id:'sdkfz250_3',family:'sdkfz250',class:3,name:'Sd.Kfz.250/10',baseType:'halftrack',hp:1.38,speed:1.05,accel:1.06,turn:1.06,weapon:1.30,capacity:4,transport:true,hasMG:true,visual:'heavyGun'},
spah_1:{id:'spah_1',family:'spah',class:1,name:'Sd.Kfz.222',baseType:'scoutcar',hp:.96,speed:1.06,accel:1.08,turn:1.08,weapon:.96,capacity:2,transport:false,hasMG:true,visual:'turret'},
spah_2:{id:'spah_2',family:'spah',class:2,name:'Sd.Kfz.223',baseType:'scoutcar',hp:1.18,speed:1.08,accel:1.10,turn:1.10,weapon:1.12,capacity:2,transport:false,hasMG:true,visual:'radioTurret'},
spah_3:{id:'spah_3',family:'spah',class:3,name:'Sd.Kfz.234/1',baseType:'scoutcar',hp:1.42,speed:1.11,accel:1.12,turn:1.12,weapon:1.32,capacity:2,transport:false,hasMG:true,visual:'heavyTurret'}
};
function vehicleClassForLevel(idx){return idx<12?1:idx<24?2:3;}
function vehicleSpecFor(family,idx){return VEHICLE_SPECS[family+'_'+vehicleClassForLevel(idx)]||VEHICLE_SPECS.blitz_1;}
function vehicleSpecById(id,type){if(id&&VEHICLE_SPECS[id])return VEHICLE_SPECS[id];if(type==='jeep')return VEHICLE_SPECS.kubel_1;if(type==='scoutcar')return VEHICLE_SPECS.spah_1;if(type==='halftrack')return VEHICLE_SPECS.sdkfz250_1;if(type==='lighttruck')return VEHICLE_SPECS.steyr_1;return VEHICLE_SPECS.blitz_1;}
function pickTransportVehicle(idx,rng){if(idx<2)return 'blitz_1';return vehicleSpecFor(rng()>.48?'steyr':'blitz',idx).id;}
function pickScoutVehicle(idx,rng){return vehicleSpecFor(idx>=6&&rng()>.52?'horch':'kubel',idx).id;}
function pickArmoredVehicle(idx,rng){return vehicleSpecFor(idx>=10&&rng()>.48?'spah':'sdkfz250',idx).id;}
function vehicleExplosionScale(v){var c=v&&v.vehicleClass?v.vehicleClass:1,t=v&&v.type?v.type:'truck',base=t==='jeep'?30:t==='lighttruck'?38:t==='scoutcar'?42:t==='halftrack'?48:44;return base+(c-1)*6;}
function vehicleCapacity(type){
  if(type==='trooptruck'){
    if(gameState.levelIndex===0)return 2;
    if(gameState.levelIndex===1)return 3;
    if(gameState.levelIndex<6)return Math.floor(rand(3,5));
    return Math.floor(rand(5,8));
  }
  if(type==='halftrack')return Math.floor(rand(6,9));
  if(type==='truck')return Math.floor(rand(7,10));
  if(type==='lighttruck')return Math.floor(rand(4,7));
  if(type==='scoutcar')return 2;
  return Math.floor(rand(2,4));
}
function applyTrauma(e,mode){
  if(mode==='burn'){e.burnT=rand(2.1,3.8);e.bleedT=rand(3,6);e.limp=rand(.28,.55);e.hp*=.72;}
  else if(mode==='bleed'){e.bleedT=rand(5,9);e.limp=rand(.40,.68);e.hp*=.82;}
  else if(mode==='limp'){e.bleedT=rand(2,5);e.limp=rand(.52,.76);e.hp*=.9;}
  e.hp=Math.max(8,e.hp);
}
function dismountOne(v,mode,index){
  var a=v.bodyAngle==null?Math.PI/2:v.bodyAngle,side=(index%2?1:-1),troop=v.type==='trooptruck';
  var rear=troop?(15.5+(index%2)*.8):(13+(index%3)*1.2);
  var px=v.x-Math.cos(a)*rear+Math.cos(a+Math.PI/2)*side*2.5;
  var py=v.y-Math.sin(a)*rear+Math.sin(a+Math.PI/2)*side*2.5;
  var half=gameState.map.corridorHalf||92,roadX=gameState.map.road.x;
  var sq={id:squadSerial++,tactic:index%3===0?'flankLeft':index%3===1?'flankRight':'bound',size:1,originX:px,phase:Math.random()*TAU,slot:index,flankX:clamp(px+side*24,roadX-half*.82,roadX+half*.82),aggressive:1,dismounted:true};
  var role='rifle',rr=Math.random();
  if(gameState.levelIndex>=3&&rr<.18)role='lmg';
  else if(gameState.levelIndex>=6&&rr<.28)role='marksman';
  if(gameState.levelIndex>=10&&!v.rocketDismounted&&index>=2&&Math.random()<.12){role='grenadier';v.rocketDismounted=true;}
  var e=spawnInfantry(px,py,role,sq);
  e.aggressive=1.25;e.cover=null;e.fireCd=rand(.28,.46);e.decisionT=rand(.58,.92);
  e.state='dismount';e.stateT=0;e.dismountDur=troop?rand(.44,.56):rand(.30,.42);e.dismountT=e.dismountDur;e.dismountArc=troop?rand(6.8,8.2):5.2;
  if(troop){
    e.vx=Math.cos(a+Math.PI/2)*side*rand(18,30)-Math.cos(a)*rand(22,34);
    e.vy=Math.sin(a+Math.PI/2)*side*rand(18,30)-Math.sin(a)*rand(22,34);
  }else{
    e.vx=Math.cos(a+Math.PI/2)*side*rand(28,42)-Math.cos(a)*rand(12,20);
    e.vy=Math.sin(a+Math.PI/2)*side*rand(28,42)-Math.sin(a)*rand(12,20);
  }
  e.dismountExitState=mode==='normal'?(Math.random()<.18?'prone':'advance'):'advance';
  e.forceDirectT=mode==='normal'?.40:.75;
  applyTrauma(e,mode||'normal');
  return e;
}
function dismountDriver(v){
  if(v.driverExited)return null;
  v.driverExited=true;
  var a=v.bodyAngle==null?Math.PI/2:v.bodyAngle,side=Math.random()<.5?-1:1;
  var px=v.x+Math.cos(a+Math.PI/2)*side*13-Math.cos(a)*5;
  var py=v.y+Math.sin(a+Math.PI/2)*side*13-Math.sin(a)*5;
  var roadX=gameState.map.road.x,half=gameState.map.corridorHalf||92;
  var sq={id:squadSerial++,tactic:'direct',size:1,originX:px,phase:Math.random()*TAU,slot:0,flankX:clamp(px,roadX-half*.72,roadX+half*.72),aggressive:2.2,dismounted:true};
  var e=spawnInfantry(px,py,'rifle',sq);
  e.aggressive=2.35;e.cover=null;e.state='fire';e.stateT=0;e.fireCd=rand(.02,.10);e.decisionT=.20;e.forceDirectT=0;e.proneT=0;e.speed*=1.08;
  gameState.message='DRIVER!';gameState.messageT=.32;
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
function spawnVehicle(type,count){var id=Math.random()*1e9|0,cap=vehicleCapacity(type),prog=enemyProgression(gameState.levelIndex),hp=type==='trooptruck'?58:type==='jeep'?62:type==='scoutcar'?132:type==='lighttruck'?122:type==='truck'?168:235;hp*=prog.vehicleHp;var sp=(type==='trooptruck'?(gameState.levelIndex<4?70:56):type==='jeep'?64:type==='scoutcar'?72:type==='lighttruck'?43:type==='truck'?34:36)*prog.vehicleSpeed,accel=type==='trooptruck'?68:type==='jeep'?72:type==='scoutcar'?78:type==='lighttruck'?36:type==='truck'?27:26,turn=type==='trooptruck'?1.70:type==='jeep'?2.75:type==='scoutcar'?2.55:type==='lighttruck'?1.90:type==='truck'?1.50:1.32;var roadX=gameState.map.road.x,side=Math.random()<.5?-1:1,shoulder=clamp(roadX+side*(type==='halftrack'?rand(50,72):type==='trooptruck'?rand(34,48):type==='scoutcar'?rand(44,66):rand(38,60)),28,W-28);var x=roadX+rand(-5,5),spawnY=type==='trooptruck'?H*.105:safeTop+48;for(var vi=0;vi<gameState.vehicles.length;vi++){var ov=gameState.vehicles[vi];if(ov.alive&&ov.y<safeTop+125)spawnY=Math.min(spawnY,ov.y-72);}var aim=Math.atan2(gameState.bunker.y-spawnY,gameState.bunker.x-x),dismountRun=type==='trooptruck'||(type==='halftrack'&&Math.random()<.62),hasMG=type!=='trooptruck';gameState.vehicles.push({id:id,type:type,x:x,baseX:x,y:spawnY,hp:hp,maxHp:hp,speed:sp,baseSpeed:sp,currentSpeed:type==='trooptruck'?(gameState.levelIndex<4?sp*.78:sp*.62):sp*.36,accel:accel,turnRate:turn,alive:true,state:'road',behavior:dismountRun?'dismount':'firepass',contactY:type==='trooptruck'?(gameState.levelIndex<4?H*.37:H*.43):H*rand(.30,.47),dropY:type==='trooptruck'?H*.465:H*rand(.40,.54),shoulderX:shoulder,passengers:type==='trooptruck'?Math.max(2,count||cap):cap,unloadLeft:dismountRun?(type==='trooptruck'?Math.max(2,count||cap):cap):0,unloadIndex:0,unloadCd:0,dropped:false,stopT:0,stopBursts:Math.floor(rand(2,4)),bodyAngle:Math.PI/2,turretAngle:aim+rand(-.35,.35),turretVel:0,turretRecoil:0,turretAimT:rand(.20,.65),fireCd:rand(.42,.90),mgBurst:0,hasMG:hasMG,smoke:0,dustCd:0,damageFxCd:0,hitFlash:0,zigAmp:type==='halftrack'?rand(7,14):type==='scoutcar'?rand(8,15):type==='jeep'?rand(7,13):rand(3,7),zigFreq:type==='halftrack'?rand(.36,.56):type==='scoutcar'?rand(.60,.88):type==='jeep'?rand(.58,.86):rand(.38,.62),zigPhase:rand(0,TAU),zigT:0,wheelT:Math.random()*10,sideVel:0,avoidWreck:null,avoidSide:0,avoidT:0,resumeState:null,driverExited:false,driverHit:false,windowBroken:false,mirrorLeft:true,mirrorRight:true,rearGateOpen:false,exhaustCd:rand(.04,.14),tireFlat:false,tireDamage:0,bulletHoles:0,ballisticHits:0,fuelLeak:false,fuelIgnited:false,fuelBurnT:0,oilRadius:2.5,leakFxCd:0,finalParkY:Math.min(gameState.bunker.y-74,H-safeBottom-106),weaponProfile:vehicleWeaponProfile(type,gameState.levelIndex),professionalism:prog.professionalism});}
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
  var big=(r||18)>=24;
  pushEffect({type:'explosion',x:x,y:y,r:r,t:0,life:big?.58:.46,variant:(Math.random()*3)|0,seed:Math.random()*999});
  pushEffect({type:'shockRing',x:x,y:y,r:3,maxR:(r||18)*(big?1.85:1.55),t:0,life:big?.34:.26,soft:false,material:'blast'});
  var sparks=IS_IPHONE?(big?7:4):(big?13:7);
  for(var i=0;i<sparks;i++){var a=rand(0,TAU),sp=rand(big?55:35,big?135:92);pushEffect({type:'spark',x:x+rand(-2,2),y:y+rand(-2,2),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-rand(8,42),t:0,life:rand(.16,.42)});}
  var smokeN=IS_IPHONE?(big?3:2):(big?6:3);for(i=0;i<smokeN;i++)pushEffect({type:'smoke',x:x+rand(-r*.18,r*.18),y:y+rand(-r*.12,r*.08),vx:rand(-12,12),vy:rand(-28,-11),r:rand(big?5:3,big?10:6),t:0,life:rand(big?.85:.62,big?1.45:1.0),shade:rand(.25,.85)});
  for(i=0;i<(IS_IPHONE?(big?2:1):(big?4:2));i++)emitFlame(x+rand(-r*.16,r*.16),y+rand(-r*.14,r*.12),big);
  emitDebris(x,y,IS_IPHONE?(big?5:3):(big?10:6));
  for(i=0;i<(IS_IPHONE?2:4);i++)pushEffect({type:'shrapnel',x:x,y:y,vx:rand(-125,125),vy:rand(-120,30),t:0,life:rand(.18,.38)});
  if(crater!==false&&Math.random()<.60){gameState.craters.push({x:x+rand(-2,2),y:y+rand(-2,2),r:clamp(r*rand(.27,.40),4,12),seed:Math.random()*9999|0,rot:rand(0,TAU)});if(gameState.craters.length>12)gameState.craters.shift();}
  gameState.shake=Math.max(gameState.shake||0,clamp(r*.21,2.5,8));gameState.screenFlash=Math.max(gameState.screenFlash||0,clamp(r/80,.06,.28));AudioSys.tone('boom');if(gameState&&gameState.map)blastCover(x,y,r||18,((r||18)>=28?5.0:3.0));
}

function emitFootstepFx(e,strength){
  strength=strength||1;
  var theme=level().theme,mat=theme==='desert'?'sand':theme==='industrial'?'grit':theme==='polar'?'snow':'earth';
  var count=IS_IPHONE?1:2;
  for(var i=0;i<count;i++)pushEffect({type:'footDust',x:e.x+rand(-2.5,2.5),y:e.y+rand(4,7),vx:rand(-10,10),vy:rand(-8,-2),r:rand(1.2,2.3)*strength,t:0,life:rand(.20,.34),material:mat});
  if((theme==='jungle'||theme==='village')&&Math.random()<.34)pushEffect({type:'grassBlade',x:e.x+rand(-3,3),y:e.y+5,vx:rand(-18,18),vy:rand(-28,-12),rot:rand(-.8,.8),vr:rand(-6,6),t:0,life:rand(.20,.36),shade:(Math.random()*3)|0});
}
function emitLandingFx(x,y,power){
  power=power||1;
  var theme=level().theme,mat=theme==='desert'?'sand':theme==='industrial'?'grit':theme==='polar'?'snow':'earth';
  pushEffect({type:'shockRing',x:x,y:y+5,r:2,maxR:10+power*4,t:0,life:.22,soft:true,material:mat});
  for(var i=0;i<(IS_IPHONE?2:4);i++)pushEffect({type:'footDust',x:x+rand(-4,4),y:y+5,vx:rand(-20,20)*power,vy:rand(-14,-4),r:rand(1.5,2.8)*power,t:0,life:rand(.24,.40),material:mat});
}
function emitVehicleMotionFx(v){
  var theme=level().theme,mat=theme==='desert'?'sand':theme==='industrial'?'grit':theme==='polar'?'snow':'earth';
  var a=v.bodyAngle==null?Math.PI/2:v.bodyAngle,back=18+(v.type==='halftrack'?5:0),side=10+(v.type==='halftrack'?4:0);
  for(var s=-1;s<=1;s+=2)pushEffect({type:'wheelDust',x:v.x-Math.cos(a)*back+Math.cos(a+Math.PI/2)*side*s,y:v.y-Math.sin(a)*back+Math.sin(a+Math.PI/2)*side*s,vx:-Math.cos(a)*rand(10,24)+rand(-5,5),vy:-Math.sin(a)*rand(10,24)+rand(-6,2),r:rand(1.8,3.4),t:0,life:rand(.28,.48),material:mat});
}
function emitCasingFx(x,y,angle,heavy){
  var side=angle+Math.PI/2;
  pushEffect({type:'casing',x:x,y:y,vx:Math.cos(side)*rand(heavy?34:22,heavy?56:40)+rand(-4,4),vy:Math.sin(side)*rand(heavy?34:22,heavy?56:40)-rand(8,18),rot:rand(0,TAU),vr:rand(-18,18),t:0,life:rand(.34,.62),heavy:!!heavy});
}

function emitSmoke(x,y,heavy){
  pushEffect({type:'smoke',x:x+rand(-4,4),y:y+rand(-4,4),vx:rand(-7,7),vy:rand(-18,-9),r:heavy?rand(5,8):rand(3,5),t:0,life:heavy?rand(.8,1.25):rand(.55,.9),shade:Math.random()});
}
function emitFlame(x,y,large){
  pushEffect({type:'flame',x:x+rand(-4,4),y:y+rand(-4,4),vx:rand(-5,5),vy:rand(-15,-7),r:large?rand(5,8):rand(3,5),t:0,life:rand(.22,.42),shade:Math.random()});
  if(Math.random()<.55)pushEffect({type:'ember',x:x+rand(-3,3),y:y+rand(-3,3),vx:rand(-18,18),vy:rand(-35,-12),t:0,life:rand(.25,.55)});
}
function emitMuzzle(x,y,angle,big){
  pushEffect({type:'muzzle',x:x,y:y,angle:angle,r:big?13:8.5,t:0,life:big?.13:.075,variant:(Math.random()*3)|0});
  if(!IS_IPHONE||big)pushEffect({type:'muzzle',x:x+Math.cos(angle)*2,y:y+Math.sin(angle)*2,angle:angle+rand(-.08,.08),r:big?8:5,t:0,life:big?.09:.055,variant:2});
  pushEffect({type:'smoke',x:x,y:y,vx:Math.cos(angle)*rand(10,22)+rand(-4,4),vy:Math.sin(angle)*rand(10,22)+rand(-4,4),r:big?4.8:2.8,t:0,life:rand(.34,.62),shade:.18});
  if(Math.random()<(big?.9:.42))pushEffect({type:'gunSpark',x:x,y:y,vx:Math.cos(angle)*rand(45,92)+rand(-12,12),vy:Math.sin(angle)*rand(45,92)+rand(-12,12),t:0,life:rand(.06,.12)});
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
  gameState.hitMarker=.20;gameState.hitPulse=1;
  pushEffect({type:'damage',x:x,y:y-8,text:String(Math.max(1,Math.round(dmg))),t:0,life:.52});
  AudioSys.tone('flesh',.78);
}
function addStreak(){
  gameState.streak++;gameState.streakT=3.1;
  if(gameState.streak===5||gameState.streak===10||gameState.streak===15){
    gameState.eff=clamp(gameState.eff+.025,0,1);
    gameState.message='FOCUS +'+Math.round((combatFocus()-1)*100)+'%';
    gameState.messageT=.65;
  }
}

/* ---------- DAMAGE ---------- */

function killInfantry(e,kind){if(!e.alive)return;e.alive=false;e.deadT=0;e.state='dead';gameState.stats.kills++;gameState.eff=clamp(gameState.eff+.020,0,1);addStreak();registerKillZone(e.x,e.y);reactSquadToLoss(e);addBlood(e.x,e.y,kind==='he'?18:8,kind==='he');gameState.hitStop=Math.max(gameState.hitStop||0,.028);gameState.shake=Math.max(gameState.shake||0,1.0);gameState.screenFlash=Math.max(gameState.screenFlash||0,.025);}
function damageInfantry(e,dmg,kind){
  if(!e.alive)return false;
  var sheltered=(e.state==='cover'||e.state==='crouch'||e.state==='prone');
  if(kind==='mg'&&sheltered)dmg*=.76;
  // Kar98: on level 1, a clean exposed hit is always lethal.
  // Later levels keep a strong instant-kill chance, while real cover still matters.
  if(kind==='mg'&&gameState.profile&&gameState.profile.primaryVisual<=3&&e.hp>0){
    var karCovered=!!(e.cover&&coverUsableForFire(e.cover)&&(e.state==='cover'||e.state==='covering'||e.state==='suppressed'));
    var firstLevel=gameState.levelIndex===0;
    var lethalChance=karCovered?(firstLevel?.22:.28):(firstLevel?1:.62);
    if(Math.random()<lethalChance)dmg=Math.max(dmg,e.hp+1);
  }
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
function vehicleComponentText(v,label){
  gameState.hitMarker=.20;gameState.hitPulse=1;
  pushEffect({type:'damage',x:v.x,y:v.y-10,text:label,t:0,life:.58});
}
function emitGlassHit(v){
  var first=!v.windowBroken;v.windowBroken=true;var a=v.bodyAngle==null?Math.PI/2:v.bodyAngle;
  var gx=v.x+Math.cos(a)*9,gy=v.y+Math.sin(a)*9;
  var count=first?(IS_IPHONE?9:14):(IS_IPHONE?4:7);
  for(var i=0;i<count;i++)pushEffect({type:'glassShard',x:gx+rand(-6,6),y:gy+rand(-4,4),vx:rand(-58,58)+Math.cos(a)*18,vy:rand(-58,16)+Math.sin(a)*18,rot:rand(0,TAU),vr:rand(-17,17),t:0,life:rand(.36,.72)});
  for(i=0;i<(first?4:2);i++)pushEffect({type:'glassGlint',x:gx+rand(-5,5),y:gy+rand(-3,3),vx:rand(-34,34),vy:rand(-44,8),t:0,life:rand(.18,.38)});
  AudioSys.tone('glass',1);
  if(first)AudioSys.after(55,'glass',.42);
}
function emitMirrorHit(v,side){
  var key=side<0?'mirrorLeft':'mirrorRight';
  if(v[key]===false){vehicleHitFx(v,'mg');return;}
  v[key]=false;
  var a=v.bodyAngle==null?Math.PI/2:v.bodyAngle;
  var mx=v.x+Math.cos(a+Math.PI/2)*side*11+Math.cos(a)*5;
  var my=v.y+Math.sin(a+Math.PI/2)*side*11+Math.sin(a)*5;
  pushEffect({type:'mirrorPart',x:mx,y:my,vx:Math.cos(a+Math.PI/2)*side*rand(65,95)+rand(-12,12),vy:Math.sin(a+Math.PI/2)*side*rand(65,95)-rand(22,52),rot:a,vr:side*rand(8,14),t:0,life:rand(.75,1.10)});
  for(var i=0;i<4;i++)pushEffect({type:'glassShard',x:mx,y:my,vx:rand(-42,42),vy:rand(-54,4),rot:rand(0,TAU),vr:rand(-12,12),t:0,life:rand(.25,.48)});
  emitRicochet(mx,my,a,.55);AudioSys.tone('glass',.68);vehicleComponentText(v,'MIRROR');
}
function emitTireHit(v){
  v.tireFlat=true;v.tireDamage=(v.tireDamage||0)+1;
  var base=v.baseSpeed||v.speed;
  // Rifle fire can ruin tyres and handling, but it does not magically "HP kill" a truck.
  v.speed=Math.min(v.speed,base*(v.tireDamage===1?.78:.64));
  v.currentSpeed=Math.min(v.currentSpeed,Math.max(v.speed*.72,8));
  v.zigAmp=Math.min(24,(v.zigAmp||4)+8);
  v.tireChaosT=Math.max(v.tireChaosT||0,2.2+Math.random()*1.0);
  v.tirePull=(v.x<gameState.map.road.x?-1:v.x>gameState.map.road.x?1:(Math.random()<.5?-1:1));
  for(var i=0;i<8;i++)pushEffect({type:'rubber',x:v.x+rand(-9,9),y:v.y+rand(2,13),vx:rand(-42,42),vy:rand(-32,18),rot:rand(0,TAU),vr:rand(-10,10),t:0,life:rand(.30,.72)});
  for(i=0;i<3;i++)pushEffect({type:'dust',x:v.x+rand(-8,8),y:v.y+12+i*2,r:rand(5,8),t:0,life:.78});
  AudioSys.tone('tire',1);
}
function ejectDriver(v){
  if(v.driverExited)return;
  v.driverExited=true;v.doorOpen=true;v.hasMG=false;
  var side=v.driverHitSide||1,a=v.bodyAngle==null?Math.PI/2:v.bodyAngle;
  var ex=v.x+Math.cos(a+Math.PI/2)*side*9,ey=v.y+Math.sin(a+Math.PI/2)*side*7;
  // He slumps/falls out with the moving truck instead of being launched sideways.
  pushEffect({type:'driverFall',x:ex,y:ey,vx:side*rand(7,13),vy:rand(10,18),rot:a,vr:side*rand(1.8,3.5),t:0,life:1.35});
  addBlood(ex,ey,4,false);AudioSys.tone('driver',.38);
  v.state='driverHitRoll';v.rollT=2.8;v.currentSpeed=Math.max(v.currentSpeed,v.speed*.68);
}
function driverShotOut(v){
  if(v.driverHit||v.driverExited)return;
  v.driverHit=true;v.hasMG=false;
  var side=v.x<gameState.map.road.x?-1:1;
  v.driverHitSide=side;v.driverReactT=.48+Math.random()*.22;v.state='driverWounded';
  v.currentSpeed=Math.max(v.currentSpeed,v.speed*.82);
  vehicleComponentText(v,'DRIVER!');
}
function vehicleFuelThreshold(type){return type==='jeep'?5:type==='scoutcar'?8:type==='lighttruck'?8:(type==='trooptruck'||type==='truck')?10:12;}
function wreckRadius(w){return w.type==='jeep'?12:w.type==='scoutcar'?16:w.type==='lighttruck'?16:(w.type==='trooptruck'||w.type==='truck')?19:21;}
function beginFuelLeak(obj){
  if(obj.fuelLeak)return;
  obj.fuelLeak=true;obj.oilRadius=Math.max(obj.oilRadius||2.5,4);obj.leakFxCd=0;
  pushEffect({type:'damage',x:obj.x,y:obj.y-12,text:'FUEL LEAK',t:0,life:.68});
}
function igniteFuel(obj,delay){
  if(obj.fuelIgnited||obj.exploded)return;
  obj.fuelLeak=true;obj.fuelIgnited=true;obj.fuelBurnT=delay==null?rand(1.6,2.8):delay;obj.flameCd=0;obj.smokeCd=0;
  pushEffect({type:'damage',x:obj.x,y:obj.y-12,text:'FIRE!',t:0,life:.62});
}
function fuelHitProgress(obj,bulletPower,isHeavy){
  if(!obj||obj.exploded)return;
  obj.ballisticHits=(obj.ballisticHits||0)+Math.max(1,bulletPower||1);
  var min=vehicleFuelThreshold(obj.type),leakStart=Math.max(4,min-2);
  if(!obj.fuelLeak&&obj.ballisticHits>=leakStart){
    var leakChance=Math.min(.92,.14+(obj.ballisticHits-leakStart)*.13+(isHeavy?.12:0));
    if(obj.ballisticHits>=leakStart+5||Math.random()<leakChance)beginFuelLeak(obj);
  }
  if(obj.fuelLeak&&!obj.fuelIgnited&&obj.ballisticHits>=min){
    var fireChance=Math.min(.86,.08+(obj.ballisticHits-min)*.095+(isHeavy?.16:0));
    if(obj.ballisticHits>=min+6||Math.random()<fireChance)igniteFuel(obj,rand(1.55,2.65));
  }
}
function blastNearbyFromVehicle(x,y,r,damage,source){
  blastInfantry(x,y,r,damage);
  blastCover(x,y,r,5.5);
  for(var i=0;i<gameState.vehicles.length;i++){
    var v=gameState.vehicles[i];if(!v.alive||v===source)continue;
    var d=dist(x,y,v.x,v.y);if(d>=r*1.20)continue;
    var fall=.25+.75*(1-d/(r*1.20));
    damageVehicle(v,damage*.72*fall,'he');
  }
  for(i=0;i<gameState.wrecks.length;i++){
    var w=gameState.wrecks[i];if(w===source||w.exploded)continue;
    var wd=dist(x,y,w.x,w.y);if(wd>=r*1.18)continue;
    w.ballisticHits=(w.ballisticHits||0)+3;
    beginFuelLeak(w);
    if(wd<r*.72||Math.random()<.55)igniteFuel(w,rand(.35,1.15));
  }
}
function explodeWreck(w){
  if(!w||w.exploded)return false;
  w.exploded=true;w.softDisabled=false;w.fuelIgnited=false;w.fuelBurnT=0;w.burnT=rand(8,13);w.smokeCd=0;w.flameCd=0;
  var r=w.type==='jeep'?34:w.type==='lighttruck'?40:(w.type==='trooptruck'||w.type==='truck')?48:52;
  var dmg=w.type==='jeep'?42:w.type==='lighttruck'?52:(w.type==='trooptruck'||w.type==='truck')?68:74;
  emitVehicleFragments(w,'he');explode(w.x,w.y,r,true);blastNearbyFromVehicle(w.x,w.y,r,dmg,w);
  gameState.shake=Math.max(gameState.shake||0,5.2);gameState.screenFlash=Math.max(gameState.screenFlash||0,.13);
  return true;
}
function explodeLiveVehicleFuel(v){
  if(!v||!v.alive)return false;
  dismountDestroyed(v,'he');v.alive=false;v.hasMG=false;v.currentSpeed=0;v.state='disabled';
  gameState.stats.vehicleKills++;gameState.eff=clamp(gameState.eff+.025,0,1);addStreak();
  var w={type:v.type,x:v.x,y:v.y,bodyAngle:v.bodyAngle,variant:v.id%4,burnT:0,smokeCd:0,flameCd:0,disabled:true,softDisabled:true,disabledReason:'FUEL',doorOpen:!!v.doorOpen,rearGateOpen:!!v.rearGateOpen,mirrorLeft:v.mirrorLeft!==false,mirrorRight:v.mirrorRight!==false,tireFlat:!!v.tireFlat,windowBroken:!!v.windowBroken,bulletHoles:v.bulletHoles||0,oilRadius:Math.max(7,v.oilRadius||3),oilSeed:Math.random()*999,ballisticHits:v.ballisticHits||0,fuelLeak:true,fuelIgnited:true,fuelBurnT:0,exploded:false};
  gameState.wrecks.push(w);if(gameState.wrecks.length>16)gameState.wrecks.shift();
  return explodeWreck(w);
}
function hitDisabledWreck(w,b){
  if(!w||w.exploded){
    emitRicochet(b.x,b.y,Math.atan2(b.vy,b.vx),.62);AudioSys.tone('steel',.58);return true;
  }
  w.bulletHoles=(w.bulletHoles||0)+1;
  fuelHitProgress(w,1,(b.visual||0)>=7);
  emitRicochet(b.x,b.y,Math.atan2(b.vy,b.vx),.68);AudioSys.tone('steel',.62);
  pushEffect({type:'impactFlash',x:b.x,y:b.y,r:5,t:0,life:.08});
  return true;
}
function lineBlockedByWreck(x1,y1,x2,y2){
  for(var i=0;i<gameState.wrecks.length;i++){
    var w=gameState.wrecks[i],d=pointSegDist(w.x,w.y,x1,y1,x2,y2);
    if(d<wreckRadius(w)*.72)return true;
  }
  return false;
}
function neutralizeVehicle(v,reason,fragments){
  if(!v.alive)return false;
  dismountDestroyed(v,'mg');
  if(fragments)emitVehicleFragments(v,'mg');
  v.alive=false;v.currentSpeed=0;v.state='disabled';v.hasMG=false;
  gameState.stats.vehicleKills++;gameState.eff=clamp(gameState.eff+.018,0,1);addStreak();
  gameState.wrecks.push({type:v.type,x:v.x,y:v.y,bodyAngle:v.bodyAngle,variant:v.id%4,burnT:0,smokeCd:0,flameCd:0,disabled:true,softDisabled:true,disabledReason:reason||'MOBILITY',doorOpen:!!v.doorOpen,rearGateOpen:!!v.rearGateOpen,mirrorLeft:v.mirrorLeft!==false,mirrorRight:v.mirrorRight!==false,tireFlat:!!v.tireFlat,windowBroken:!!v.windowBroken,bulletHoles:v.bulletHoles||0,oilRadius:v.fuelLeak?Math.max(5,v.oilRadius||3):2.5,oilSeed:Math.random()*999,ballisticHits:v.ballisticHits||0,fuelLeak:!!v.fuelLeak,fuelIgnited:!!v.fuelIgnited,fuelBurnT:v.fuelBurnT||0,exploded:false});
  if(gameState.wrecks.length>16)gameState.wrecks.shift();
  AudioSys.tone('metal',.42);gameState.shake=Math.max(gameState.shake||0,.8);
  vehicleComponentText(v,reason==='DRIVER'?'DISABLED':'MOBILITY KILL');
  return true;
}
function disableVehicleByGunfire(v){
  return neutralizeVehicle(v,'GUNFIRE',false);
}
function smallArmsVehicleHit(v,b){
  var tier=b.visual||0;
  v.bulletHoles=(v.bulletHoles||0)+1;v.hitFlash=.08;
  fuelHitProgress(v,1,tier>=7);
  var dx=b.x-v.x,dy=b.y-v.y,ang=-(v.bodyAngle||Math.PI/2)+Math.PI/2,c=Math.cos(ang),sn=Math.sin(ang);
  var lx=dx*c-dy*sn,ly=dx*sn+dy*c,roll=Math.random(),component='body';
  if(Math.abs(lx)>9.5&&ly<6&&roll<.72)component='mirror';
  else if(Math.abs(lx)>7.0||roll<.24)component='tire';
  else if((ly<4&&Math.abs(lx)<9)||roll<.57)component='glass';
  if(v.windowBroken&&Math.random()<.34)component='driver';
  if(roll>.94)component='driver';

  if(v.type==='halftrack'&&tier<5&&component!=='driver'){
    vehicleComponentText(v,'RICOCHET');emitRicochet(b.x,b.y,Math.atan2(b.vy,b.vx),1.1);vehicleHitFx(v,'mg');return false;
  }
  if(component==='tire'){emitTireHit(v);vehicleComponentText(v,'TIRE');}
  else if(component==='glass'){emitGlassHit(v);vehicleComponentText(v,'GLASS');}
  else if(component==='mirror'){emitMirrorHit(v,lx<0?-1:1);}
  else if(component==='driver'){AudioSys.tone('flesh',.76);driverShotOut(v);}
  else{vehicleComponentText(v,'RICOCHET');emitRicochet(b.x,b.y,Math.atan2(b.vy,b.vx),.82);vehicleHitFx(v,'mg');}
  // Bolt rifles and ordinary rifles can never ignite or destroy the truck body.
  return false;
}
function primaryVehicleHit(v,b){return smallArmsVehicleHit(v,b);}
function damageVehicle(v,dmg,kind){
  if(!v.alive)return false;
  var mgMult=v.type==='trooptruck'?1.15:v.type==='jeep'?1.05:v.type==='scoutcar'?.58:v.type==='lighttruck'?.82:v.type==='truck'?.64:.24;
  var dealt=dmg*(kind==='mg'?mgMult:1);
  v.hp-=dealt;v.hitFlash=.10;gameState.hitMarker=.20;gameState.hitPulse=1;pushEffect({type:'damage',x:v.x,y:v.y-8,text:String(Math.max(1,Math.round(dealt))),t:0,life:.52});vehicleHitFx(v,kind);
  if(v.hp<=0){
    dismountDestroyed(v,kind);
    emitVehicleFragments(v,kind);
    v.alive=false;gameState.stats.vehicleKills++;gameState.eff=clamp(gameState.eff+.025,0,1);addStreak();gameState.hitStop=Math.max(gameState.hitStop||0,.055);gameState.shake=Math.max(gameState.shake||0,4.5);gameState.screenFlash=Math.max(gameState.screenFlash||0,.10);
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
  a.hp-=dmg;gameState.hitMarker=.20;gameState.hitPulse=1;
  pushEffect({type:'damage',x:a.x,y:a.y-8,text:String(Math.max(1,Math.round(dmg))),t:0,life:.52});
  AudioSys.tone('steel',.82);
  if(a.hp<=0){a.alive=false;gameState.stats.airKills++;gameState.eff=clamp(gameState.eff+.035,0,1);addStreak();gameState.hitStop=Math.max(gameState.hitStop||0,.045);gameState.shake=Math.max(gameState.shake||0,3.8);gameState.screenFlash=Math.max(gameState.screenFlash||0,.08);explode(a.x,a.y,25,false);return true;}
  return false;
}
function damageBunker(dmg){
  var real=dmg*gameState.profile.armorScale;
  gameState.bunker.hp-=real;gameState.stats.damageTaken+=real;gameState.eff=clamp(gameState.eff-.0052*real,0,1);
  pushEffect({type:'hit',x:gameState.bunker.x+rand(-18,18),y:gameState.bunker.y+rand(-10,10),t:0,life:.28});
  AudioSys.tone('ground',.72);
  if(gameState.bunker.hp<=0)endGame('BUNKER LOST');
}

/* ---------- ENEMY AI ---------- */

function nearestCover(e){
  var best=null,bestD=9999;
  for(var i=0;i<gameState.map.cover.length;i++){
    var c=gameState.map.cover[i],d=dist(e.x,e.y,c.x,c.y);
    if(c.id!==e.lastCoverId&&coverUsableForFire(c)&&d<bestD&&d<125){best=c;bestD=d;}
  }
  return best;
}
function nextForwardCover(e){
  if(!gameState||!gameState.map||!gameState.map.cover||e.y>gameState.bunker.y-115)return null;
  var tactical=tacticalPoint(e),best=null,bestScore=1e9;
  for(var i=0;i<gameState.map.cover.length;i++){
    var c=gameState.map.cover[i];if(c.id===e.lastCoverId||!coverUsableForFire(c))continue;
    var dy=c.y-e.y;if(dy<12||dy>175)continue;
    var d=dist(e.x,e.y,c.x,c.y);if(d>190)continue;
    var score=d+Math.abs(c.x-tactical.x)*.34-dy*.18;
    if(score<bestScore){best=c;bestScore=score;}
  }
  return best;
}
function beginRocketAim(e){
  if(e.state==='rocketAim')return false;
  var idx=gameState.levelIndex,prog=enemyProgression(idx),wp=e.weaponProfile||enemyWeaponProfile('rocket',idx);
  e.state='rocketAim';e.stateT=0;
  var base=idx<20?rand(1.30,1.58):idx<30?rand(1.18,1.48):rand(1.08,1.38);
  e.rocketAimTotal=Math.max(.88,base*prog.cooldown*(wp.cooldown||1));e.rocketAimT=e.rocketAimTotal;
  var target=Math.atan2(gameState.bunker.y-e.y,gameState.bunker.x-e.x),miss=(wp.spread||.10)*prog.accuracy;
  e.rocketAimAngle=target+rand(-miss,miss);e.muzzle=0;e.recoil=0;return false;
}
function fireEnemyRocket(e){
  if(lineBlockedByWreck(e.x,e.y,gameState.bunker.x,gameState.bunker.y))return false;
  var idx=gameState.levelIndex,prog=enemyProgression(idx),wp=e.weaponProfile||enemyWeaponProfile('rocket',idx);
  var a=e.rocketAimAngle||Math.atan2(gameState.bunker.y-e.y,gameState.bunker.x-e.x),speed=188*(wp.speed||1),mx=e.x+Math.cos(a)*13,my=e.y+Math.sin(a)*13;
  gameState.enemyShots.push({x:mx,y:my,px:mx,py:my,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,kind:'rocket',dmg:6.8*DEVICE.enemyDamage*prog.infantryDamage*(wp.damage||1),life:2.8,trailCd:0,weapon:wp.name});
  e.muzzle=.16;e.recoil=1;emitMuzzle(mx,my,a,true);
  var bx=e.x-Math.cos(a)*9,by=e.y-Math.sin(a)*9;
  for(var k=0;k<(IS_IPHONE?5:8);k++)pushEffect({type:'smoke',x:bx+rand(-3,3),y:by+rand(-3,3),vx:-Math.cos(a)*rand(24,55)+rand(-9,9),vy:-Math.sin(a)*rand(24,55)+rand(-9,9),r:rand(2.6,4.6),t:0,life:rand(.32,.65),shade:rand(.18,.52)});
  emitLandingFx(bx,by,.65);AudioSys.tone('enemy',.72);return true;
}
function enemyFire(e){
  if(lineBlockedByWreck(e.x,e.y,gameState.bunker.x,gameState.bunker.y))return false;
  if(e.cover&&!coverUsableForFire(e.cover))return false;
  var dx=gameState.bunker.x-e.x,dy=gameState.bunker.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;
  var fairRange=H*gameState.profile.primaryRangeFactor*.98;if(d>fairRange)return false;
  if(e.rocketUnit)return beginRocketAim(e);
  var idx=gameState.levelIndex,prog=enemyProgression(idx),wp=e.weaponProfile||enemyWeaponProfile(e.role,idx);
  var kind=e.role==='grenadier'?'grenade':e.role==='lmg'?'lmg':e.role==='marksman'?'marksman':'rifle';
  var baseSpeed=kind==='grenade'?145:kind==='marksman'?385:305,speed=baseSpeed*(wp.speed||1)*(1+idx*.0015);
  var earlyScale=idx<3?.76:idx<6?.90:1,baseDmg=kind==='grenade'?6.7:kind==='lmg'?2.65:kind==='marksman'?4.1:2.0;
  var dmg=baseDmg*DEVICE.enemyDamage*earlyScale*prog.infantryDamage*(wp.damage||1);
  var mx=e.x+Math.cos(e.angle)*10,my=e.y+Math.sin(e.angle)*10;
  var baseAngle=Math.atan2(dy,dx),roleSpread=kind==='grenade'?.11:kind==='lmg'?.080:kind==='marksman'?.028:.075;
  var spread=(wp.spread||roleSpread)*prog.accuracy,a=baseAngle+rand(-spread,spread);
  gameState.enemyShots.push({x:mx,y:my,px:mx,py:my,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,kind:kind,dmg:dmg,life:kind==='grenade'?2.4:1.5,weapon:e.weaponName});
  e.muzzle=.09;e.recoil=1;emitMuzzle(mx,my,e.angle,false);
  if(kind!=='grenade'&&Math.random()<(kind==='lmg'?.85:.42))emitCasingFx(e.x,e.y-2,e.angle,kind==='lmg');
  AudioSys.tone('enemy',.43);return true;
}
function steerInfantry(e,tx,ty,speed,dt,sharpness){
  var dx=tx-e.x,dy=ty-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;
  var dvx=dx/d*speed,dvy=dy/d*speed,k=1-Math.exp(-(sharpness||7)*dt);
  e.vx+=(dvx-(e.vx||0))*k;e.vy+=(dvy-(e.vy||0))*k;
  e.x+=e.vx*dt;e.y+=e.vy*dt;
  if(Math.abs(e.vx)+Math.abs(e.vy)>.01)e.moveAngle=Math.atan2(e.vy,e.vx);
}
function dampInfantry(e,dt){
  var k=Math.exp(-7*dt);e.vx=(e.vx||0)*k;e.vy=(e.vy||0)*k;
}
function updateInfantry(dt){
  for(var i=0;i<gameState.infantry.length;i++){
    var e=gameState.infantry[i];
    e.anim+=dt*(e.state==='advance'?4.1:e.state==='crawl'?3.0:1.7);e.anim2+=dt*(2.1+(e.variant%3)*.22);e.crawlPhase+=dt*3.2;
    e.stateT+=dt;e.decisionT-=dt;e.muzzle=Math.max(0,e.muzzle-dt);e.recoil=Math.max(0,e.recoil-dt*8);e.suppression=Math.max(0,e.suppression-dt*.18);e.footFxCd=(e.footFxCd||0)-dt;e.landSquash=Math.max(0,(e.landSquash||0)-dt);
    if(!e.alive){e.deadT+=dt;continue;}
    if((e.state==='advance'||e.state==='crawl')&&e.footFxCd<=0&&Math.abs(e.vx||0)+Math.abs(e.vy||0)>8){e.footFxCd=e.state==='crawl'?rand(.30,.42):rand(.20,.29);emitFootstepFx(e,e.state==='crawl'?.55:1);}

    e.bleedCd-=dt;
    if(e.burnT>0){
      e.burnT-=dt;e.hp-=1.7*dt;
      if(e.bleedCd<=0){e.bleedCd=.16;emitFlame(e.x+rand(-2,2),e.y+rand(-3,3),false);if(Math.random()<.42)emitSmoke(e.x,e.y,false);}
      if(e.hp<=0){killInfantry(e,'he');continue;}
    }else if(e.bleedT>0){
      e.bleedT-=dt;
      if(e.bleedCd<=0){e.bleedCd=rand(.28,.48);addBlood(e.x+rand(-2,2),e.y+rand(-2,2),1,false);}
    }

    var moved=dist(e.x,e.y,e.lastX||e.x,e.lastY||e.y);e.stuckT=(e.state==='advance'||e.state==='crawl')&&moved<.08?e.stuckT+dt:0;e.lastX=e.x;e.lastY=e.y;
    if(e.forceDirectT>0)e.forceDirectT=Math.max(0,e.forceDirectT-dt);
    if(e.y>(e.progressY||e.y)+1.2){e.progressY=e.y;e.noProgressT=0;}else if(e.state==='advance'||e.state==='crawl')e.noProgressT+=dt;else e.noProgressT=Math.max(0,e.noProgressT-dt*.5);
    var tactical=tacticalPoint(e),bdx=gameState.bunker.x-e.x,bdy=gameState.bunker.y-e.y,dB=Math.sqrt(bdx*bdx+bdy*bdy)||1;var aimAng=Math.atan2(bdy,bdx);e.angle=approachAngle(e.angle||aimAng,aimAng,dt*4.8);
    var playerReach=H*gameState.profile.primaryRangeFactor*.94;
    if(dB>playerReach&&(e.state==='cover'||e.state==='covering'||e.state==='fire'||e.state==='prone')){e.state='advance';e.stateT=0;e.cover=null;e.forceDirectT=Math.max(e.forceDirectT,1.2);}
    if(e.noProgressT>1.65&&dB>120){e.state='advance';e.cover=null;e.tactic='direct';e.flankX=gameState.bunker.x;e.forceDirectT=2.2;e.noProgressT=0;e.stuckT=0;}

    if(e.suppression>.70&&e.state!=='suppressed'&&e.state!=='crawl'){e.state='suppressed';e.stateT=0;e.cover=nearestCover(e)||nextForwardCover(e);}
    if(e.stuckT>1.55){e.state='advance';e.cover=null;e.tactic='direct';e.forceDirectT=2.0;e.stuckT=0;e.flankX=gameState.bunker.x;}

    if(e.cover&&!coverUsableForFire(e.cover)&&(e.state==='cover'||e.state==='covering'||e.state==='crawl'||e.state==='suppressed')){
      e.lastCoverId=e.cover.id;e.cover=null;e.state='advance';e.stateT=0;e.forceDirectT=Math.max(e.forceDirectT,.45);
    }
    var supportRole=e.role==='marksman'||e.role==='lmg';
    var preferred=(e.role==='marksman'?240:e.role==='lmg'?210:e.role==='grenadier'?188:164)-(e.aggressive?22:0);

    if(e.state==='rocketAim'){
      dampInfantry(e,dt);e.rocketAimT=Math.max(0,e.rocketAimT-dt);e.angle=approachAngle(e.angle,e.rocketAimAngle,dt*2.0);
      if(e.rocketAimT<=0){fireEnemyRocket(e);e.state='fire';e.stateT=0;e.fireCd=enemyFireDelay(e,rand(2.05,2.55));e.decisionT=rand(.75,1.10);e.burstCount++;}
    }else if(e.state==='dismount'){
      e.dismountT=Math.max(0,(e.dismountT||0)-dt);
      var drag=Math.exp(-2.6*dt);e.x+=(e.vx||0)*dt;e.y+=(e.vy||0)*dt;e.vx*=drag;e.vy*=drag;
      if(e.dismountT<=0){emitLandingFx(e.x,e.y,1);e.landSquash=.18;e.state=e.dismountExitState||'advance';e.stateT=0;e.cover=null;if(e.state==='prone')e.proneT=rand(.55,.95);}
    }else if(e.state==='advance'){
      if(!e.cover&&e.forceDirectT<=0)e.cover=nextForwardCover(e);
      var mt=e.forceDirectT>0?{x:gameState.bunker.x,y:gameState.bunker.y}:e.cover||tactical;
      mt=avoidKillZonePoint(e,mt);
      var dx=mt.x-e.x,dy=mt.y-e.y,dTarget=Math.sqrt(dx*dx+dy*dy)||1;
      if(e.cover&&dTarget<10){e.state='cover';e.stateT=0;e.coverT=e.aggressive?rand(.30,.58):rand(.52,.90);}
      else if(!e.cover&&dB<preferred){e.state='fire';e.stateT=0;}
      else{
        var sp=e.speed*DEVICE.enemySpeed*(1-e.suppression*.38)*(e.limp>0?(1-e.limp*.43):1);
        if(e.tactic==='flankLeft'||e.tactic==='flankRight'||e.tactic==='split')sp*=.95;
        steerInfantry(e,mt.x,mt.y,sp,dt,6.2);
      }
    }else if(e.state==='covering'){
      dampInfantry(e,dt);
      e.fireCd-=dt;if(e.fireCd<=0&&dB<300){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=enemyFireDelay(e,e.mgTeamGunner?rand(.20,.27):e.role==='lmg'?.34:rand(.62,.96));}
      if(e.stateT>(e.aggressive?.88:1.35)){e.state='advance';e.stateT=0;e.cover=nextForwardCover(e);}
    }else if(e.state==='cover'){
      dampInfantry(e,dt);
      e.fireCd-=dt;if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=enemyFireDelay(e,e.role==='lmg'?.34:e.role==='marksman'?1.00:rand(.62,.96));}
      if(e.stateT>e.coverT){e.lastCoverId=e.cover?e.cover.id:0;e.cover=nextForwardCover(e);e.state='advance';e.stateT=0;}
    }else if(e.state==='suppressed'){
      if(e.cover){steerInfantry(e,e.cover.x,e.cover.y,e.speed*.40,dt,5.0);e.state='crawl';e.stateT=0;}
      else if(e.stateT>.75){e.cover=nextForwardCover(e);e.state='crawl';e.stateT=0;}
    }else if(e.state==='crawl'){
      var ct=e.cover||tactical,cdx2=ct.x-e.x,cdy2=ct.y-e.y,cd2=Math.sqrt(cdx2*cdx2+cdy2*cdy2)||1;
      steerInfantry(e,ct.x,ct.y,e.speed*.32,dt,4.4);
      if((e.cover&&cd2<10)||e.stateT>1.5){e.state=e.cover?'cover':'advance';e.stateT=0;if(e.cover)e.coverT=rand(.40,.72);}
    }else if(e.state==='prone'){
      dampInfantry(e,dt);
      e.fireCd-=dt;
      if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=enemyFireDelay(e,e.mgTeamGunner?rand(.22,.30):e.role==='lmg'?.40:e.role==='marksman'?1.08:rand(.72,1.02));}
      if(e.stateT>(e.proneT||1.35)||dB>preferred+95){e.state='advance';e.stateT=0;e.cover=nextForwardCover(e);e.burstCount=0;}
    }else if(e.state==='fire'){
      dampInfantry(e,dt);
      e.fireCd-=dt;if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=enemyFireDelay(e,e.mgTeamGunner?rand(.18,.26):e.role==='lmg'?.32:e.role==='grenadier'?rand(1.55,1.90):e.role==='marksman'?1.02:rand(.60,.92));}
      if(e.decisionT<=0){
        e.decisionT=rand(.60,1.05);
        if(e.burstCount>=1&&e.role!=='grenadier'&&Math.random()<.30){
          e.state='prone';e.stateT=0;e.proneT=rand(.85,1.65);e.fireCd=Math.min(e.fireCd,.20);e.burstCount=0;
        }else if(e.burstCount>=2&&Math.random()<(e.aggressive?.76:.58)){
          e.burstCount=0;e.cover=nextForwardCover(e);e.state='advance';e.stateT=0;
        }
      }
      if(dB>preferred+75){e.cover=nextForwardCover(e);e.state='advance';e.stateT=0;}
    }
  }
  var roadX=gameState.map.road.x,half=gameState.map.corridorHalf||92;
  for(var ci=0;ci<gameState.infantry.length;ci++){
    var ce=gameState.infantry[ci];if(!ce.alive)continue;
    if(ce.x<roadX-half){ce.x=roadX-half;ce.tactic='direct';ce.cover=null;}
    else if(ce.x>roadX+half){ce.x=roadX+half;ce.tactic='direct';ce.cover=null;}
  }
  gameState.infantry=gameState.infantry.filter(function(e){return e.alive||e.deadT<7;});
}
function updateVehicleTurret(v,dt){
  if(!v.hasMG)return {error:0,settled:true};
  var prog=enemyProgression(gameState.levelIndex),wp=v.weaponProfile||vehicleWeaponProfile(v.type,gameState.levelIndex);
  v.turretRecoil=Math.max(0,(v.turretRecoil||0)-dt*5);v.turretAimT=(v.turretAimT||0)-dt;
  var targetAngle=Math.atan2(gameState.bunker.y-v.y,gameState.bunker.x-v.x);
  if(v.turretAimT<=0){v.turretAimT=rand(.16,.35)*prog.decision;var jitter=(wp.spread||.05)*prog.accuracy;v.turretTarget=targetAngle+rand(-jitter,jitter);}
  var target=v.turretTarget==null?targetAngle:v.turretTarget,err=angleDelta(v.turretAngle,target);
  var skill=1+gameState.levelIndex*.004+adaptiveValue()*.15,maxSpeed=(v.type==='halftrack'?1.65:v.type==='scoutcar'?2.45:2.2)*skill,accel=(v.type==='halftrack'?3.2:v.type==='scoutcar'?4.7:4.0)*skill;
  var desiredVel=clamp(err*3,-maxSpeed,maxSpeed);v.turretVel+=clamp(desiredVel-v.turretVel,-accel*dt,accel*dt);
  if(Math.abs(err)<.02)v.turretVel*=Math.pow(.12,dt);v.turretAngle+=v.turretVel*dt;
  return {error:Math.abs(angleDelta(v.turretAngle,targetAngle)),settled:Math.abs(v.turretVel)<.42};
}
function vehicleMuzzle(v){var len=v.type==='halftrack'?20:v.type==='scoutcar'?17:15,recoil=(v.turretRecoil||0)*3;return {x:v.x+Math.cos(v.turretAngle)*(len-recoil),y:v.y+Math.sin(v.turretAngle)*(len-recoil)};}
function updateVehicleDamageParticles(v,dt){
  v.damageFxCd=(v.damageFxCd||0)-dt;var ratio=v.hp/v.maxHp;
  if(ratio<.68&&v.damageFxCd<=0){v.damageFxCd=ratio<.32?rand(.08,.15):rand(.18,.30);emitSmoke(v.x+rand(-5,5),v.y+rand(-5,5),ratio<.38);if(ratio<.38&&Math.random()<.62)emitFlame(v.x+rand(-5,5),v.y+rand(-5,5),ratio<.20);}
}
function vehicleMG(v,ts){
  if(!v.hasMG)return;
  var prog=enemyProgression(gameState.levelIndex),wp=v.weaponProfile||vehicleWeaponProfile(v.type,gameState.levelIndex);
  v.fireCd-=gameState.dtForVehicle||0;
  var tolerance=.15-gameState.levelIndex*.0018-adaptiveValue()*.025;
  if(v.fireCd>0||ts.error>Math.max(.065,tolerance))return;
  var m=vehicleMuzzle(v),spread=(wp.spread||.045)*prog.accuracy,a=v.turretAngle+rand(-spread,spread),speed=350*(1+gameState.levelIndex*.0015);
  var vd=v.type==='halftrack'?1.65:v.type==='scoutcar'?1.48:v.type==='truck'?1.35:v.type==='lighttruck'?1.25:1.08;
  var damage=vd*DEVICE.enemyDamage*prog.vehicleDamage*(wp.damage||1);
  gameState.enemyShots.push({x:m.x,y:m.y,px:m.x,py:m.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,kind:'vehicleMG',dmg:damage,life:1.7,weapon:wp.name});
  v.turretRecoil=1;emitMuzzle(m.x,m.y,v.turretAngle,false);
  pushEffect({type:'casing',x:m.x,y:m.y,vx:Math.cos(v.turretAngle+Math.PI/2)*rand(28,48),vy:Math.sin(v.turretAngle+Math.PI/2)*rand(28,48),rot:rand(0,TAU),vr:rand(-13,13),t:0,life:rand(.28,.50)});
  if(Math.random()<.55)pushEffect({type:'gunSpark',x:m.x,y:m.y,vx:Math.cos(a)*rand(55,95),vy:Math.sin(a)*rand(55,95),t:0,life:.12});
  AudioSys.tone('enemy',.41);v.mgBurst=(v.mgBurst||0)+1;
  var burstLimit=gameState.levelIndex<12?3:gameState.levelIndex<26?4:5;
  if(v.mgBurst>=burstLimit){v.mgBurst=0;if(v.state==='firestop'||v.state==='support')v.stopBursts=Math.max(0,(v.stopBursts||0)-1);v.fireCd=rand(.66,1.02)*prog.cooldown*(wp.cooldown||1);}
  else v.fireCd=rand(.14,.22)*prog.cooldown*(wp.cooldown||1);
}
function unloadStep(v){
  if(v.unloadLeft<=0)return;
  dismountOne(v,'normal',v.unloadIndex++);v.unloadLeft--;v.passengers=v.unloadLeft;
  // Trooptruck passengers leave clearly one-by-one instead of appearing as a burst.
  v.unloadCd=v.type==='trooptruck'?rand(.24,.32):rand(.14,.20);
}
function approachValue(v,target,maxDelta){
  if(v<target)return Math.min(target,v+maxDelta);
  if(v>target)return Math.max(target,v-maxDelta);
  return v;
}
function vehicleBodyRadius(v){return v.type==='halftrack'?18:v.type==='truck'?17:v.type==='scoutcar'?15:v.type==='lighttruck'?15:11;}
function wreckBodyRadius(w){return w.type==='halftrack'?19:w.type==='truck'?18:w.type==='scoutcar'?16:w.type==='lighttruck'?16:12;}
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
function vehicleFollowScale(v){
  var scale=1,vr=vehicleBodyRadius(v);
  for(var i=0;i<gameState.vehicles.length;i++){
    var o=gameState.vehicles[i];if(!o.alive||o===v)continue;
    var dy=o.y-v.y,dx=Math.abs(o.x-v.x);
    if(dy>0&&dy<92&&dx<vr+vehicleBodyRadius(o)+10)scale=Math.min(scale,clamp((dy-38)/48,0,.82));
  }
  return scale;
}
function separateVehicles(){
  var a=gameState.vehicles;
  for(var i=0;i<a.length;i++)for(var j=i+1;j<a.length;j++){
    var A=a[i],B=a[j];if(!A.alive||!B.alive)continue;
    var min=vehicleBodyRadius(A)+vehicleBodyRadius(B)+5,dx=B.x-A.x,dy=B.y-A.y,d=Math.sqrt(dx*dx+dy*dy)||.001;
    if(d<min){
      var nx=dx/d,side=Math.abs(nx)>.22?nx:(A.id<B.id?-1:1);
      var impulse=clamp((min-d)*2.2,1.5,16);
      A.sideVel=(A.sideVel||0)-side*impulse*.48;
      B.sideVel=(B.sideVel||0)+side*impulse*.48;
      A.currentSpeed=Math.min(A.currentSpeed,A.speed*.74);
      B.currentSpeed=Math.min(B.currentSpeed,B.speed*.74);
      if(d<2){A.x-=side*.35;B.x+=side*.35;}
    }
  }
}
function emitVehicleExhaust(v,intensity){
  intensity=intensity||1;
  var a=v.bodyAngle==null?Math.PI/2:v.bodyAngle;
  var side=v.type==='trooptruck'||v.type==='lighttruck'||v.type==='truck'?-.46:.35;
  var ex=v.x-Math.cos(a)*15+Math.cos(a+Math.PI/2)*side*10;
  var ey=v.y-Math.sin(a)*15+Math.sin(a+Math.PI/2)*side*10;
  pushEffect({type:'exhaust',x:ex,y:ey,vx:-Math.cos(a)*rand(8,15)+rand(-3,3),vy:-Math.sin(a)*rand(8,15)-rand(3,8),r:rand(2.1,3.5)*intensity,t:0,life:rand(.38,.62),shade:Math.random()});
}
function updateVehicles(dt){
  gameState.dtForVehicle=dt;
  for(var i=0;i<gameState.vehicles.length;i++){
    var v=gameState.vehicles[i];if(!v.alive)continue;
    v.smoke=Math.max(0,v.smoke-dt);v.dustCd-=dt;v.unloadCd-=dt;v.hitFlash=Math.max(0,(v.hitFlash||0)-dt);v.audioCd=(v.audioCd||0)-dt;v.exhaustCd=(v.exhaustCd||0)-dt;v.leakFxCd=(v.leakFxCd||0)-dt;
    if(v.fuelLeak){v.oilRadius=Math.min(18,(v.oilRadius||3)+dt*.58);if(v.leakFxCd<=0){v.leakFxCd=rand(.18,.30);pushEffect({type:'fuelDrop',x:v.x+rand(-5,5),y:v.y+rand(5,11),t:0,life:rand(.45,.75),r:rand(1.2,2.2)});}}
    if(v.fuelIgnited){v.fuelBurnT-=dt;if(Math.random()<dt*9)emitFlame(v.x+rand(-5,5),v.y+rand(-4,6),false);if(Math.random()<dt*7)emitSmoke(v.x+rand(-6,6),v.y+rand(-6,5),true);if(v.fuelBurnT<=0){explodeLiveVehicleFuel(v);continue;}}
    if(v.zigT!=null)v.zigT+=dt;v.wheelT+=dt*Math.max(1,v.currentSpeed*.16);v.moveFxCd=(v.moveFxCd||0)-dt;if(v.currentSpeed>15&&v.moveFxCd<=0&&(v.state==='road'||v.state==='toShoulder'||v.state==='evadeWreck'||v.state==='depart')){v.moveFxCd=rand(.10,.18);emitVehicleMotionFx(v);}updateVehicleDamageParticles(v,dt);
    if(v.tireChaosT>0)v.tireChaosT=Math.max(0,v.tireChaosT-dt);
    var turretState=updateVehicleTurret(v,dt),traffic=vehicleFollowScale(v);
    var va=v.currentSpeed>3||v.state==='unload'||v.state==='firestop'||v.state==='support';if(v.audioCd<=0&&va){var sr=clamp((v.currentSpeed||0)/Math.max(1,v.speed||1),0,1);v.audioCd=(v.state==='unload'||v.state==='firestop'||v.state==='support')?rand(.29,.38):Math.max(.12,rand(.14,.21)-sr*.02);AudioSys.vehicle(v);}
    if(v.exhaustCd<=0&&(v.currentSpeed>3||v.state==='unload'||v.state==='firestop'||v.state==='support')){
      var isTruck=v.type==='trooptruck'||v.type==='lighttruck'||v.type==='truck'||v.type==='halftrack';
      if(isTruck){v.exhaustCd=v.state==='unload'?rand(.10,.16):rand(.14,.23);emitVehicleExhaust(v,v.state==='unload'?1.12:.88);}
    }

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
      v.currentSpeed=approachValue(v.currentSpeed,v.speed*traffic,v.accel*dt);
      var tireBias=v.tireChaosT>0?(v.tirePull||1)*(gameState.map.corridorHalf||92)*.58:0;
      var targetX=gameState.map.road.x+tireBias+Math.sin(v.zigT*v.zigFreq+v.zigPhase)*v.zigAmp;
      var desiredSide=clamp((targetX-v.x)*.42,-v.currentSpeed*.18,v.currentSpeed*.18);
      v.sideVel+=(desiredSide-(v.sideVel||0))*(1-Math.exp(-3.6*dt));
      v.x+=v.sideVel*dt;v.y+=v.currentSpeed*DEVICE.enemySpeed*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(v.currentSpeed,v.sideVel||.001),dt*v.turnRate*.72);
      if(v.y>=v.contactY){v.state='approachStop';v.stopT=v.type==='trooptruck'?rand(.08,.15):rand(.30,.48);}
    }else if(v.state==='approachStop'){
      v.currentSpeed=approachValue(v.currentSpeed,0,v.accel*.78*dt);v.sideVel=(v.sideVel||0)*Math.exp(-4*dt);
      v.y+=v.currentSpeed*.35*dt;v.stopT-=dt;
      if(v.stopT<=0&&v.currentSpeed<4){v.currentSpeed=0;if(v.behavior==='dismount'&&!v.hasMG)v.state='toShoulder';else{v.state='firestop';v.stopBursts=Math.floor(rand(2,4));v.fireCd=.05;}}
    }else if(v.state==='firestop'){
      vehicleMG(v,turretState);
      if(v.stopBursts<=0&&v.fireCd<.25){
        if(v.behavior==='dismount')v.state='toShoulder';
        else v.state='depart';
      }
    }else if(v.state==='toShoulder'){
      v.currentSpeed=approachValue(v.currentSpeed,v.speed*(v.type==='trooptruck'?.64:.38),v.accel*dt);
      var dx=v.shoulderX-v.x,desiredShoulder=clamp(dx*.60,-v.currentSpeed*.46,v.currentSpeed*.46);
      v.sideVel+=(desiredShoulder-(v.sideVel||0))*(1-Math.exp(-3.2*dt));
      v.x+=v.sideVel*dt;v.y+=v.currentSpeed*.10*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(v.currentSpeed*.10,v.sideVel||.001),dt*v.turnRate*.70);
      if(Math.abs(dx)<2){v.state='unload';v.rearGateOpen=true;AudioSys.tone('door',.46);v.stopT=v.type==='trooptruck'?1.30:2.25;v.unloadCd=v.type==='trooptruck'?rand(.42,.54):.08;v.currentSpeed=0;v.stopBursts=2;}
    }else if(v.state==='unload'){
      vehicleMG(v,turretState);
      v.stopT-=dt;if(v.unloadLeft>0&&v.unloadCd<=0)unloadStep(v);
      if(v.unloadLeft<=0&&v.stopT<=0){v.rearGateOpen=false;AudioSys.tone('door',.34);if(!v.hasMG)v.state='depart';else{v.state='support';v.stopBursts=2;v.fireCd=.10;}}
    }else if(v.state==='support'){
      vehicleMG(v,turretState);
      if(v.stopBursts<=0&&v.fireCd<.25)v.state='depart';
    }else if(v.state==='driverWounded'){
      v.driverReactT-=dt;
      v.currentSpeed=approachValue(v.currentSpeed,Math.max(10,v.speed*.76),v.accel*.10*dt);
      v.sideVel+=(v.driverHitSide*3.2-(v.sideVel||0))*(1-Math.exp(-1.8*dt));
      v.x+=v.sideVel*dt;v.y+=v.currentSpeed*.88*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(v.currentSpeed*.88,v.sideVel||.001),dt*v.turnRate*.18);
      if(v.driverReactT<=0){v.doorOpen=true;v.doorT=.38;v.state='driverDoorOpen';AudioSys.tone('door',.58);}
    }else if(v.state==='driverDoorOpen'){
      v.doorT-=dt;
      v.currentSpeed=approachValue(v.currentSpeed,Math.max(9,v.speed*.70),v.accel*.12*dt);
      v.y+=v.currentSpeed*.86*dt;
      v.x+=(v.driverHitSide||1)*v.currentSpeed*.035*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(v.currentSpeed*.82,(v.driverHitSide||1)*v.currentSpeed*.08),dt*v.turnRate*.25);
      if(v.doorT<=0)ejectDriver(v);
    }else if(v.state==='driverHitRoll'){
      v.rollT-=dt;
      v.currentSpeed=approachValue(v.currentSpeed,0,v.accel*.20*dt);
      var shoulder=v.shoulderX!=null?v.shoulderX:(gameState.map.road.x+(v.driverHitSide||1)*58);
      var sx=shoulder-v.x,desiredRollSide=clamp(sx*.52,-Math.max(6,v.currentSpeed*.32),Math.max(6,v.currentSpeed*.32));
      v.sideVel+=(desiredRollSide-(v.sideVel||0))*(1-Math.exp(-2.6*dt));
      v.x+=v.sideVel*dt;v.y+=Math.max(5,v.currentSpeed)*.56*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.atan2(Math.max(5,v.currentSpeed)*.56,v.sideVel||.001),dt*v.turnRate*.34);
      if(v.rollT<=0||v.currentSpeed<2.2){v.currentSpeed=0;neutralizeVehicle(v,'DRIVER',false);}
    }else if(v.state==='parkedDisabled'){
      v.currentSpeed=0;
    }else if(v.state==='depart'){
      var stopY=v.finalParkY||Math.min(gameState.bunker.y-74,H-safeBottom-106);
      v.currentSpeed=approachValue(v.currentSpeed,v.speed*.84*traffic,v.accel*.72*dt);
      v.y+=v.currentSpeed*dt;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.PI/2,dt*v.turnRate*.66);
      if(v.y>=stopY){
        v.y=stopY;v.currentSpeed=0;v.state='parked';v.hasMG=false;
        dismountDriver(v);
      }
    }else if(v.state==='parked'){
      v.currentSpeed=0;
      v.bodyAngle=approachAngle(v.bodyAngle,Math.PI/2,dt*v.turnRate*.50);
    }

    if(v.dustCd<=0&&v.currentSpeed>6&&v.state!=='firestop'&&v.state!=='unload'&&v.state!=='support'){
      v.dustCd=v.type==='halftrack'?.18:.24;
      pushEffect({type:'dust',x:v.x+rand(-8,8),y:v.y+14,r:rand(v.type==='halftrack'?4:3,v.type==='halftrack'?7:5),t:0,life:.60});
    }
  }
  separateVehicles();
  delete gameState.dtForVehicle;
  gameState.vehicles=gameState.vehicles.filter(function(v){return v.alive;});
}
function updateAir(dt){
  for(var i=0;i<gameState.air.length;i++){
    var a=gameState.air[i];a.t+=dt;a.audioCd=(a.audioCd||0)-dt;if(a.type==='heli'&&a.alive&&a.audioCd<=0){a.audioCd=.30;AudioSys.tone('heli',.30,{rate:.92+Math.random()*.12});}
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
    if(p.y>=p.landingY){p.alive=false;var pe=spawnInfantry(p.x,p.landingY,'rifle');pe.landSquash=.18;emitLandingFx(p.x,p.landingY,1.15);pushEffect({type:'chute',x:p.x,y:p.landingY,t:0,life:2.4});}
  }
  gameState.air=gameState.air.filter(function(a){return a.x>-190&&a.x<W+190&&a.y<H+160;});
  gameState.paras=gameState.paras.filter(function(p){return p.alive;});
}

/* ---------- PLAYER WEAPONS ---------- */

function beginPrimaryReload(){
  if(gameState.primaryReloadT>0)return;
  gameState.primaryReloadT=gameState.profile.primaryReload;gameState.burstQueue=[];
  gameState.message='RELOAD '+gameState.profile.primaryName;gameState.messageT=.55;
}
function queueMG(x,y){
  if(gameState.overheat){gameState.message='BARREL HOT';gameState.messageT=.3;return;}
  if(gameState.primaryReloadT>0){gameState.message='RELOADING';gameState.messageT=.28;return;}
  if(gameState.primaryCooldown>0){gameState.message=gameState.profile.primaryMag<=8?'CYCLING':'WAIT';gameState.messageT=.18;return;}
  if(gameState.primaryAmmo<=0){beginPrimaryReload();return;}
  var singleAction=gameState.profile.primaryClass==='bolt rifle'||gameState.profile.primaryClass==='semi-auto rifle';
  var n=singleAction?1:Math.min(gameState.profile.burst,gameState.primaryAmmo),gap=Math.max(gameState.profile.burstGap,gameState.profile.primaryCycle);
  if(singleAction)gameState.burstQueue.length=0;
  for(var i=0;i<n;i++)gameState.burstQueue.push({t:i*gap,x:x,y:y});
}
function combatFocus(){
  return 1+Math.min(.15,Math.floor(gameState.streak/5)*.05);
}
function fireWeapon(kind,x,y){
  if(gameState.overheat){gameState.message='BARREL HOT';gameState.messageT=.3;return false;}
  if(kind==='mg'){if(gameState.primaryReloadT>0||gameState.primaryCooldown>0)return false;if(gameState.primaryAmmo<=0){beginPrimaryReload();return false;}}
  var heat=kind==='he'?.105:.014;
  var heatScale=kind==='he'?gameState.profile.specialHeatScale:gameState.profile.heatScale;
  gameState.heat=clamp(gameState.heat+heat*heatScale,0,1);
  if(gameState.heat>=.99)gameState.overheat=true;

  var focus=kind==='mg'?combatFocus():1;
  var damage=kind==='mg'?gameState.profile.primaryDamage*focus:gameState.profile.specialImpact;
  var speed=kind==='mg'?gameState.profile.primarySpeed:gameState.profile.specialSpeed;
  var sx=gameState.bunker.x,sy=gameState.bunker.y-10,dx=x-sx,dy=y-sy,rawDist=Math.sqrt(dx*dx+dy*dy)||1;
  var range=H*(kind==='mg'?gameState.profile.primaryRangeFactor:gameState.profile.specialRangeFactor);
  var targetDist=Math.min(rawDist,range),ux=dx/rawDist,uy=dy/rawDist;
  var tx=sx+ux*targetDist,ty=sy+uy*targetDist;
  var spread=(kind==='mg'?.045:.012)*(1+gameState.heat*.92)*(kind==='mg'?gameState.profile.spreadScale/focus:1);
  var ang=Math.atan2(ty-sy,tx-sx)+rand(-spread,spread);
  var shot={
    kind:kind,x:sx,y:sy,px:sx,py:sy,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,
    damage:damage,range:range,targetDist:targetDist,traveled:0,active:true,
    radius:kind==='he'?gameState.profile.heRadius:0,burnDuration:kind==='he'?gameState.profile.specialDuration:0,
    burnDps:kind==='he'?gameState.profile.specialDps:0,blastDamage:kind==='he'?gameState.profile.specialBlast:0,
    specialEffect:kind==='he'?gameState.profile.specialEffect:null,visual:kind==='he'?gameState.profile.specialVisual:gameState.profile.primaryVisual,
    projectile:kind==='mg'?gameState.profile.primaryProjectile:null,primarySplash:kind==='mg'?gameState.profile.primarySplash:0,homing:kind==='mg'?gameState.profile.primaryHoming:0,
    suppressed:{}
  };
  if(kind==='he'){
    shot.z=0;shot.pz=0;shot.arcStart=0;shot.arcEnd=targetDist;shot.arcHeight=gameState.profile.specialArcHeight+targetDist*.018;
  }
  gameState.shots.push(shot);
  if(kind==='mg'){
    gameState.primaryAmmo=Math.max(0,gameState.primaryAmmo-1);gameState.primaryCooldown=gameState.profile.primaryCycle;
    if(gameState.profile.primaryClass==='bolt rifle')gameState.burstQueue.length=0;
        if(gameState.primaryAmmo<=0)beginPrimaryReload();
  }
  var ma=Math.atan2(ty-sy,tx-sx),mx=sx+Math.cos(ma)*13,my=sy+Math.sin(ma)*13;
  emitMuzzle(mx,my,ma,kind==='he'&&gameState.profile.specialVisual>=5);gameState.bunkerKick=Math.max(gameState.bunkerKick||0,kind==='he'?5.2:(gameState.profile.primaryClass.indexOf('MG')>=0?2.2:1.4));
  if(kind==='mg')emitCasingFx(sx+rand(-2,2),sy-2,ma,gameState.profile.primaryClass.indexOf('MG')>=0);
  gameState.stats.shots++;
  if(kind==='mg'){
    var kick=(gameState.profile.primarySplash||0)>0?1.55:.62;
    gameState.shake=Math.max(gameState.shake||0,kick);
    gameState.screenFlash=Math.max(gameState.screenFlash||0,(gameState.profile.primarySplash||0)>0?.035:.012);
  }
  AudioSys.tone(kind,kind==='mg'?1.0:.78);return true;
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
  if((c.integrity||5)<=1)return 0;
  var base;
  if(c.kind==='fence')base=4;
  else if(c.kind==='sandbag'||c.kind==='log'||c.kind==='lowwall'||c.kind==='snowbank')base=6;
  else if(c.kind==='crate'||c.kind==='barrel'||c.kind==='pipe')base=8;
  else if(c.kind==='rubble')base=7;
  else if(c.kind==='bush'||c.kind==='scrub')base=3;
  else base=5;
  var state=c.integrity||5;
  return base*(state>=4?1:state===3?.82:.48);
}
function coverIntegrity(c){return c&&c.integrity!=null?c.integrity:5;}
function coverBlocksShot(c){
  var s=coverIntegrity(c);
  if(s<=1)return false;
  if(s===2)return Math.random()<.48;
  return true;
}
function coverUsableForFire(c){return !!c&&!c.destroyed&&coverIntegrity(c)>=4;}
function coverMaterial(c){
  return (c.kind==='barrel'||c.kind==='fence'||c.kind==='pipe'||c.sprite==='wireFence'||c.sprite==='steelDebris'||c.sprite==='roadBarrier')?'steel':
    (c.kind==='crate'||c.kind==='log'||c.sprite==='woodFence'||c.sprite==='crateStack'||c.sprite==='palletCargo')?'wood':'earth';
}
function damageCover(c,units,kind,x,y){
  if(!c||c.destroyed)return 0;
  if(c.integrity==null)c.integrity=5;
  if(c.hitProgress==null)c.hitProgress=0;
  var before=c.integrity;
  c.hitProgress+=Math.max(.25,units||1);
  while(c.hitProgress>=2&&c.integrity>1){
    c.hitProgress-=2;c.integrity--;
    pushEffect({type:'coverChip',x:x==null?c.x:x,y:y==null?c.y:y,vx:rand(-42,42),vy:rand(-62,-15),rot:rand(0,TAU),vr:rand(-9,9),t:0,life:rand(.30,.58),material:coverMaterial(c)});
    if(c.integrity===3)pushEffect({type:'damage',x:c.x,y:c.y-9,text:'COVER BROKEN',t:0,life:.52});
    if(c.integrity===2)pushEffect({type:'damage',x:c.x,y:c.y-9,text:'COVER FAILING',t:0,life:.52});
  }
  if(c.integrity<=1){
    c.integrity=1;c.destroyed=true;c.hitProgress=0;
    for(var i=0;i<(IS_IPHONE?5:9);i++)pushEffect({type:'coverChip',x:c.x+rand(-5,5),y:c.y+rand(-3,3),vx:rand(-72,72),vy:rand(-82,12),rot:rand(0,TAU),vr:rand(-12,12),t:0,life:rand(.38,.78),material:coverMaterial(c)});
    emitGroundImpact(c.x,c.y,1.05);
    pushEffect({type:'damage',x:c.x,y:c.y-8,text:'DESTROYED',t:0,life:.55});
  }
  if(kind==='he'&&before===c.integrity&&c.integrity>1)c.hitProgress=Math.min(1.99,c.hitProgress+.5);
  return before-c.integrity;
}
function blastCover(x,y,r,power){
  var arr=gameState.map.cover||[];
  for(var i=0;i<arr.length;i++){
    var c=arr[i],d=dist(x,y,c.x,c.y);if(d>r*1.35||c.destroyed)continue;
    var fall=1-d/(r*1.35),units=Math.max(.7,power*fall);
    damageCover(c,units,'he',c.x,c.y);
  }
}
function createFireZone(x,y,b,plasma){
  var duration=b.burnDuration||0,dps=b.burnDps||0;if(duration<=0||dps<=0)return;
  gameState.fireZones.push({x:x,y:y,radius:b.radius,t:duration,maxT:duration,dps:dps,tick:0,fx:0,plasma:!!plasma,level:b.visual||0});
  if(gameState.fireZones.length>8)gameState.fireZones.shift();
}
function addUpgradeCrater(x,y,power,visual){
  var lvl=visual||0,rr=clamp(3.2+lvl*.38+Math.max(0,power||0)*.050,3.5,14.5);
  gameState.craters.push({x:x+rand(-1.5,1.5),y:y+rand(-1.5,1.5),r:rr,seed:Math.random()*9999|0,rot:rand(0,TAU)});
  if(gameState.craters.length>20)gameState.craters.shift();
}
function specialImpactAt(x,y,b){
  var effect=b.specialEffect||'impact';
  if(effect==='impact'){
    pushEffect({type:'impactFlash',x:x,y:y,r:5,t:0,life:.10});
    if(b.visual===0)emitDebris(x,y,2);
    AudioSys.tone('ground',.82);
    return;
  }
  if(effect==='blast'){
    explode(x,y,b.radius,false);addUpgradeCrater(x,y,b.radius,b.visual);fragmentBlastInfantry(x,y,b.radius,b.blastDamage||b.damage*.8,b.visual||0);return;
  }
  if(effect==='fire'){
    pushEffect({type:'impactFlash',x:x,y:y,r:8,t:0,life:.12});emitFlame(x,y,true);emitSmoke(x,y,false);
    AudioSys.tone('ground',.86);createFireZone(x,y,b,false);gameState.shake=Math.max(gameState.shake||0,1.5);return;
  }
  pushEffect({type:'impactFlash',x:x,y:y,r:10,t:0,life:.14});
  explode(x,y,Math.max(10,b.radius*.55),false);addUpgradeCrater(x,y,b.radius,b.visual);blastInfantry(x,y,b.radius,b.blastDamage||b.damage);
  createFireZone(x,y,b,true);gameState.shake=Math.max(gameState.shake||0,2.2);
}
function heObstacleHit(b){
  var i,c,m=gameState.map,z=b.z||0;
  for(i=0;i<gameState.wrecks.length;i++){
    var w=gameState.wrecks[i];
    if(z<=9&&dist(b.x,b.y,w.x,w.y)<wreckRadius(w)){
      w.ballisticHits=(w.ballisticHits||0)+4;beginFuelLeak(w);
      if((b.specialEffect==='fire'||b.specialEffect==='plasma')||Math.random()<.72)igniteFuel(w,rand(.18,.75));
      specialImpactAt(b.x,b.y,b);b.active=false;return true;
    }
  }
  for(i=0;i<m.cover.length;i++){
    c=m.cover[i];
    if(!c.destroyed&&z<=coverHeight(c)&&dist(b.x,b.y,c.x,c.y)<coverRadius(c)){
      damageCover(c,b.specialEffect==='blast'||b.specialEffect==='plasma'?6:b.specialEffect==='fire'?4:3,'he',b.x,b.y);
      specialImpactAt(b.x,b.y,b);b.active=false;return true;
    }
  }
  for(i=0;i<m.trees.length;i++){c=m.trees[i];if(z<=13&&dist(b.x,b.y,c.x,c.y)<Math.max(5,c.r*.72)){specialImpactAt(b.x,b.y,b);b.active=false;return true;}}
  for(i=0;i<m.rocks.length;i++){c=m.rocks[i];if(z<=5&&dist(b.x,b.y,c.x,c.y)<Math.max(4,c.r+.8)){specialImpactAt(b.x,b.y,b);b.active=false;return true;}}
  var cp=m.compound;
  if(z<=24&&b.x>cp.x-cp.w/2-2&&b.x<cp.x+cp.w/2+2&&b.y>cp.y-cp.h/2-2&&b.y<cp.y+cp.h/2+2){specialImpactAt(b.x,b.y,b);b.active=false;return true;}
  return false;
}
function fragmentBlastInfantry(x,y,r,damage,visual){
  var fragR=r*(visual<=1?2.55:visual<=4?2.10:1.72);
  for(var i=0;i<gameState.infantry.length;i++){
    var e=gameState.infantry[i];if(!e.alive)continue;
    var d=dist(x,y,e.x,e.y);if(d>=fragR)continue;
    var fall;
    if(d<r)fall=.45+.78*(1-d/r);
    else fall=.18+.46*(1-d/fragR);
    if(e.state==='cover')fall*=.42;
    else if(e.state==='crouch')fall*=.58;
    else if(e.state==='prone')fall*=.38;
    // Fragmentation is deliberately dangerous to exposed infantry without making the visual blast huge.
    damageInfantry(e,damage*fall,'he');
  }
  var pieces=IS_IPHONE?9:15;
  for(var j=0;j<pieces;j++){
    var a=rand(0,TAU),sp=rand(80,180);
    pushEffect({type:'shrapnel',x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:0,life:rand(.10,.26)});
  }
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
  else if(type==='vehicle')primaryVehicleHit(best,b);
  else if(type==='air')damageAir(best,b.damage);
  else{best.hp-=b.damage;AudioSys.tone('flesh',.72);if(best.hp<=0){best.alive=false;gameState.stats.airKills++;addBlood(best.x,best.y,6,false);}}
  if((b.primarySplash||0)>0){explode(best.x,best.y,b.primarySplash,false);addUpgradeCrater(best.x,best.y,b.primarySplash,b.visual);blastInfantry(best.x,best.y,b.primarySplash,b.damage*.42);}
  b.active=false;return true;
}
function emitRicochet(x,y,baseAngle,power){
  power=power||1;
  var dir=baseAngle+rand(-1.05,1.05)+(Math.random()<.5?-1:1)*rand(.32,.78);
  // A ricochet is a short, fast tracer streak; sparks are only secondary debris.
  pushEffect({type:'ricochet',x:x,y:y,vx:Math.cos(dir)*rand(225,345)*power,vy:Math.sin(dir)*rand(225,345)*power,t:0,life:rand(.11,.18),len:rand(13,21)});
  for(var i=0;i<(IS_IPHONE?2:3);i++)pushEffect({type:'spark',x:x+rand(-2,2),y:y+rand(-2,2),vx:rand(-78,78),vy:rand(-90,14),t:0,life:rand(.09,.20)});
}
function emitGroundImpact(x,y,power){
  power=power||1;
  var theme=level().theme;
  var dustMaterial=theme==='desert'?'sand':theme==='industrial'?'grit':theme==='polar'?'snow':'earth';
  pushEffect({type:'dust',x:x,y:y,r:rand(3.0,5.2)*power,t:0,life:rand(.28,.42),material:dustMaterial});
  if(theme==='jungle'||theme==='village'){
    var blades=IS_IPHONE?5:8;
    for(var i=0;i<blades;i++)pushEffect({type:'grassBlade',x:x+rand(-4,4),y:y+rand(-2,3),vx:rand(-46,46)*power,vy:rand(-72,-24)*power,rot:rand(-.8,.8),vr:rand(-8,8),t:0,life:rand(.30,.58),shade:(Math.random()*3)|0});
    for(i=0;i<(IS_IPHONE?2:4);i++)pushEffect({type:'groundClod',x:x+rand(-3,3),y:y+rand(-2,2),vx:rand(-34,34),vy:rand(-54,-18),rot:rand(0,TAU),vr:rand(-9,9),t:0,life:rand(.28,.48),material:'earth'});
  }else if(theme==='desert'){
    pushEffect({type:'dust',x:x+rand(-2,2),y:y+rand(-1,2),r:rand(4.5,7.2)*power,t:0,life:rand(.34,.52),material:'sand'});
    for(var d=0;d<(IS_IPHONE?3:5);d++)pushEffect({type:'groundClod',x:x+rand(-4,4),y:y+rand(-2,2),vx:rand(-42,42),vy:rand(-58,-16),rot:rand(0,TAU),vr:rand(-8,8),t:0,life:rand(.24,.44),material:'sand'});
  }else if(theme==='industrial'){
    for(var gr=0;gr<(IS_IPHONE?5:8);gr++)pushEffect({type:'grit',x:x+rand(-4,4),y:y+rand(-2,2),vx:rand(-55,55)*power,vy:rand(-68,-18)*power,rot:rand(0,TAU),vr:rand(-12,12),t:0,life:rand(.22,.46),shade:(Math.random()*3)|0});
  }else if(theme==='polar'){
    for(var sn=0;sn<(IS_IPHONE?4:7);sn++)pushEffect({type:'snowChip',x:x+rand(-4,4),y:y+rand(-2,2),vx:rand(-40,40),vy:rand(-64,-22),t:0,life:rand(.30,.55),r:rand(1,2.2)});
  }else{
    for(var c=0;c<(IS_IPHONE?2:4);c++)pushEffect({type:'groundClod',x:x+rand(-3,3),y:y+rand(-2,2),vx:rand(-40,40),vy:rand(-52,-15),rot:rand(0,TAU),vr:rand(-9,9),t:0,life:rand(.25,.46),material:'earth'});
  }
  AudioSys.tone('ground',.70);
}
function primaryObstacleHit(b){
  var m=gameState.map,i,c,d;
  for(i=0;i<gameState.wrecks.length;i++){
    var w=gameState.wrecks[i];
    d=pointSegDist(w.x,w.y,b.px,b.py,b.x,b.y);
    if(d<wreckRadius(w)*.76){hitDisabledWreck(w,b);b.active=false;return true;}
  }
  for(i=0;i<m.cover.length;i++){
    c=m.cover[i];d=pointSegDist(c.x,c.y,b.px,b.py,b.x,b.y);
    if(!c.destroyed&&d<Math.max(4,coverRadius(c)*.58)&&coverBlocksShot(c)){
      var steel=coverMaterial(c)==='steel';
      pushEffect({type:'impactFlash',x:b.x,y:b.y,r:4,t:0,life:.08});
      damageCover(c,1,'bullet',b.x,b.y);
      if(steel){emitRicochet(b.x,b.y,Math.atan2(b.vy,b.vx),1);AudioSys.tone('steel',.72);}
      else emitGroundImpact(b.x,b.y,.82);
      b.active=false;return true;
    }
  }
  for(i=0;i<m.trees.length;i++){c=m.trees[i];if(pointSegDist(c.x,c.y,b.px,b.py,b.x,b.y)<Math.max(4,c.r*.58)){emitGroundImpact(b.x,b.y,.72);b.active=false;return true;}}
  for(i=0;i<m.rocks.length;i++){c=m.rocks[i];if(pointSegDist(c.x,c.y,b.px,b.py,b.x,b.y)<Math.max(4,c.r+.5)){pushEffect({type:'impactFlash',x:b.x,y:b.y,r:3,t:0,life:.07});emitRicochet(b.x,b.y,Math.atan2(b.vy,b.vx),.72);AudioSys.tone('ground',.66);b.active=false;return true;}}
  var cp=m.compound;
  if(b.x>cp.x-cp.w/2&&b.x<cp.x+cp.w/2&&b.y>cp.y-cp.h/2&&b.y<cp.y+cp.h/2){pushEffect({type:'impactFlash',x:b.x,y:b.y,r:4,t:0,life:.08});if(level().theme==='industrial'){emitRicochet(b.x,b.y,Math.atan2(b.vy,b.vx),.85);AudioSys.tone('steel',.72);}else emitGroundImpact(b.x,b.y,.78);b.active=false;return true;}
  return false;
}
function resolveHEHit(b){
  var i,v,e,d,vr;
  for(i=0;i<gameState.vehicles.length;i++){
    v=gameState.vehicles[i];if(!v.alive)continue;vr=v.type==='jeep'?13:v.type==='lighttruck'?15:17;d=pointSegDist(v.x,v.y,b.px,b.py,b.x,b.y);
    if(d<vr&&(b.z||0)<=7){
      gameState.stats.hits++;damageVehicle(v,b.damage,b.specialEffect==='fire'||b.specialEffect==='plasma'?'fire':'he');
      if(b.specialEffect!=='impact')specialImpactAt(b.x,b.y,b);else{pushEffect({type:'impactFlash',x:b.x,y:b.y,r:5,t:0,life:.10});AudioSys.tone('steel',.88);}
      b.active=false;return true;
    }
  }
  for(i=0;i<gameState.infantry.length;i++){
    e=gameState.infantry[i];if(!e.alive)continue;d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);
    if(d<6.5*DEVICE.hitRadius){
      gameState.stats.hits++;damageInfantry(e,b.damage,'special');
      if(b.specialEffect!=='impact')specialImpactAt(b.x,b.y,b);else{pushEffect({type:'impactFlash',x:b.x,y:b.y,r:5,t:0,life:.10});AudioSys.tone('flesh',.84);}
      b.active=false;return true;
    }
  }
  return false;
}
function updateShots(dt){
  for(var i=0;i<gameState.burstQueue.length;i++)gameState.burstQueue[i].t-=dt;
  while(gameState.burstQueue.length&&gameState.burstQueue[0].t<=0){
    if(gameState.primaryCooldown>0||gameState.primaryReloadT>0||gameState.overheat)break;
    var q=gameState.burstQueue.shift();fireWeapon('mg',q.x,q.y);
  }
  for(i=0;i<gameState.shots.length;i++){
    var b=gameState.shots[i];if(!b.active)continue;
    b.px=b.x;b.py=b.y;if(b.kind==='he')b.pz=b.z||0;
    if(b.kind==='mg'&&(b.homing||0)>0){
      var target=null,td=9999;
      for(var hi=0;hi<gameState.infantry.length;hi++){var he=gameState.infantry[hi];if(he.alive){var hd=dist(b.x,b.y,he.x,he.y);if(hd<td&&hd<150){td=hd;target=he;}}}
      for(hi=0;hi<gameState.vehicles.length;hi++){var hv=gameState.vehicles[hi];if(hv.alive){var hvd=dist(b.x,b.y,hv.x,hv.y);if(hvd<td&&hvd<170){td=hvd;target=hv;}}}
      if(target){var spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy)||1,ca=Math.atan2(b.vy,b.vx),ta=Math.atan2(target.y-b.y,target.x-b.x);ca=approachAngle(ca,ta,b.homing);b.vx=Math.cos(ca)*spd;b.vy=Math.sin(ca)*spd;}
    }
    var dx=b.vx*dt,dy=b.vy*dt;b.x+=dx;b.y+=dy;b.traveled+=Math.sqrt(dx*dx+dy*dy);

    if(b.kind==='he'){
      b.trailCd=(b.trailCd||0)-dt;
      if(b.trailCd<=0){
        b.trailCd=.06;
        if((b.visual||0)>=8)pushEffect({type:'heTrail',x:b.x,y:b.y-(b.z||0),vx:rand(-3,3),vy:rand(-6,-1),r:rand(1.2,2.2),t:0,life:rand(.16,.28)});
      }
      var span=Math.max(1,b.arcEnd-b.arcStart),t=clamp((b.traveled-b.arcStart)/span,0,1);
      b.z=Math.sin(Math.PI*t)*b.arcHeight;
      if(heObstacleHit(b))continue;
      if(resolveHEHit(b))continue;
      if(b.traveled>=b.targetDist){
        specialImpactAt(b.x,b.y,b);b.active=false;continue;
      }
    }else{
      if(primaryObstacleHit(b))continue;
      if(resolveMGHit(b))continue;
      if((b.primarySplash||0)>0&&b.traveled>=b.targetDist){explode(b.x,b.y,b.primarySplash,false);addUpgradeCrater(b.x,b.y,b.primarySplash,b.visual);blastInfantry(b.x,b.y,b.primarySplash,b.damage*.58);b.active=false;continue;}
    }

    if(b.kind==='mg'&&b.traveled>=b.targetDist&&b.x>0&&b.x<W&&b.y>0&&b.y<H){
      emitGroundImpact(b.x,b.y,1);
      gameState.stats.misses++;gameState.eff=clamp(gameState.eff-(IS_IPHONE?.0015:.0025),0,1);
      b.active=false;continue;
    }
    if(b.traveled>=b.range||b.x<-30||b.x>W+30||b.y<-30||b.y>H+30){
      if(b.kind==='he'&&b.x>0&&b.x<W&&b.y>0&&b.y<H){specialImpactAt(b.x,b.y,b);}
      else{gameState.stats.misses++;gameState.eff=clamp(gameState.eff-(IS_IPHONE?.0015:.0025),0,1);}
      b.active=false;
    }
  }
  gameState.shots=gameState.shots.filter(function(b){return b.active;});
}
function updateFireZones(dt){
  for(var i=0;i<gameState.fireZones.length;i++){
    var z=gameState.fireZones[i];z.t-=dt;z.tick-=dt;z.fx-=dt;
    if(z.fx<=0){
      z.fx=z.plasma?.07:.11;var a=rand(0,TAU),rr=Math.sqrt(Math.random())*z.radius*.78,fx=z.x+Math.cos(a)*rr,fy=z.y+Math.sin(a)*rr;
      if(z.plasma)pushEffect({type:'plasmaFlame',x:fx,y:fy,vx:rand(-4,4),vy:rand(-18,-8),r:rand(3,6),t:0,life:rand(.28,.48)});else emitFlame(fx,fy,Math.random()<.22);
      if(Math.random()<.20)emitSmoke(fx,fy,false);
    }
    if(z.tick<=0){
      z.tick=.25;
      for(var j=0;j<gameState.infantry.length;j++){var e=gameState.infantry[j];if(e.alive&&dist(z.x,z.y,e.x,e.y)<z.radius)damageInfantry(e,z.dps*.25,'fire');}
      for(j=0;j<gameState.vehicles.length;j++){var v=gameState.vehicles[j];if(v.alive&&dist(z.x,z.y,v.x,v.y)<z.radius*.72)damageVehicle(v,z.dps*.09,'fire');}
    }
  }
  gameState.fireZones=gameState.fireZones.filter(function(z){return z.t>0;});
}
function updateEnemyShots(dt){
  for(var i=0;i<gameState.enemyShots.length;i++){
    var b=gameState.enemyShots[i];b.px=b.x;b.py=b.y;if(b.kind==='grenade')b.vy+=78*dt;
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(b.kind==='rocket'){
      b.trailCd=(b.trailCd||0)-dt;
      if(b.trailCd<=0){b.trailCd=.045;pushEffect({type:'smoke',x:b.x,y:b.y,vx:rand(-6,6),vy:rand(-9,3),r:rand(1.8,3.2),t:0,life:rand(.26,.46),shade:.28});if(Math.random()<.48)pushEffect({type:'ember',x:b.x,y:b.y,vx:-b.vx*.05+rand(-6,6),vy:-b.vy*.05+rand(-6,6),t:0,life:rand(.10,.22)});}
    }
    if(dist(b.x,b.y,gameState.bunker.x,gameState.bunker.y)<28){
      damageBunker(b.dmg);if(b.kind==='grenade'||b.kind==='shell'||b.kind==='rocket')explode(b.x,b.y,b.kind==='rocket'?21:b.kind==='shell'?23:18,true);b.life=0;
    }
  }
  gameState.enemyShots=gameState.enemyShots.filter(function(b){return b.life>0&&b.x>-50&&b.x<W+50&&b.y>-50&&b.y<H+50;});
}
function updateEffects(dt){
  for(var i=0;i<gameState.effects.length;i++){
    var e=gameState.effects[i];e.t+=dt;
    if(e.type==='blood'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=58*dt;}
    else if(e.type==='damage')e.y-=15*dt;
    else if(e.type==='glassGlint'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=62*dt;}
    else if(e.type==='dust'){e.r+=8*dt;e.y+=4*dt;}
    else if(e.type==='footDust'||e.type==='wheelDust'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.r+=9*dt;e.vx*=Math.pow(.38,dt);e.vy*=Math.pow(.52,dt);}
    else if(e.type==='spark'||e.type==='ember'||e.type==='ricochet'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=(e.type==='spark'?95:e.type==='ricochet'?28:35)*dt;if(e.type==='ricochet'){e.vx*=Math.pow(.82,dt);e.vy*=Math.pow(.86,dt);}}
    else if(e.type==='grassBlade'||e.type==='groundClod'||e.type==='grit'||e.type==='mirrorPart'||e.type==='snowChip'||e.type==='coverChip'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=90*dt;if(e.rot!=null)e.rot+=(e.vr||0)*dt;}
    else if(e.type==='fuelDrop'){e.r=Math.min(4.5,(e.r||1.5)+dt*1.6);}
    else if(e.type==='exhaust'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.r+=5.5*dt;e.vx*=Math.pow(.52,dt);}
    else if(e.type==='fireball')e.r+=18*dt;
    else if(e.type==='smoke'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.r+=7*dt;e.vx*=Math.pow(.45,dt);}
    else if(e.type==='flame'||e.type==='plasmaFlame'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.r+=3*dt;}
    else if(e.type==='heTrail'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.r+=4*dt;}
    else if(e.type==='glassShard'||e.type==='rubber'||e.type==='driverFall'||e.type==='shrapnel'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=(e.type==='driverFall'?72:110)*dt;if(e.rot!=null)e.rot+=(e.vr||0)*dt;}
    else if(e.type==='debris'||e.type==='casing'||e.type==='vehiclePart'){
      e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=(e.type==='casing'?75:e.type==='vehiclePart'?88:110)*dt;e.rot+=e.vr*dt;
      if(e.type==='vehiclePart'){e.vx*=Math.pow(.78,dt);e.vy*=Math.pow(.88,dt);}
    }
  }
  gameState.effects=gameState.effects.filter(function(e){return e.t<e.life;});

  for(i=0;i<gameState.wrecks.length;i++){
    var w=gameState.wrecks[i];
    if(w.fuelLeak&&!w.exploded){
      w.oilRadius=Math.min(19,(w.oilRadius||3)+dt*.62);w.leakFxCd=(w.leakFxCd||0)-dt;
      if(w.leakFxCd<=0){w.leakFxCd=rand(.18,.32);pushEffect({type:'fuelDrop',x:w.x+rand(-6,6),y:w.y+rand(5,12),t:0,life:rand(.45,.78),r:rand(1.2,2.3)});}
    }
    if(w.fuelIgnited&&!w.exploded){
      w.fuelBurnT-=dt;w.smokeCd-=dt;w.flameCd-=dt;
      if(w.smokeCd<=0){w.smokeCd=rand(.09,.18);emitSmoke(w.x+rand(-7,7),w.y+rand(-7,7),true);}
      if(w.flameCd<=0){w.flameCd=rand(.07,.15);emitFlame(w.x+rand(-6,6),w.y+rand(-6,6),true);}
      if(w.fuelBurnT<=0){explodeWreck(w);continue;}
    }
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
  if((gameState.hitStop||0)>0){
    gameState.hitStop=Math.max(0,gameState.hitStop-dt);
    updateEffects(dt*.35);
    return;
  }
  gameState.time+=dt;gameState.levelTime+=dt;AudioSys.ambience(dt);
  gameState.bunker.angle=Math.atan2(gameState.aim.y-gameState.bunker.y,gameState.aim.x-gameState.bunker.x);
  gameState.messageT=Math.max(0,gameState.messageT-dt);gameState.hitMarker=Math.max(0,gameState.hitMarker-dt);gameState.hitPulse=Math.max(0,(gameState.hitPulse||0)-dt*7);gameState.bunkerKick=Math.max(0,(gameState.bunkerKick||0)-dt*18);gameState.shake=Math.max(0,(gameState.shake||0)-dt*20);gameState.screenFlash=Math.max(0,(gameState.screenFlash||0)-dt*1.9);
  gameState.streakT=Math.max(0,gameState.streakT-dt);if(gameState.streakT<=0)gameState.streak=0;
  gameState.primaryCooldown=Math.max(0,gameState.primaryCooldown-dt);
  if(gameState.primaryReloadT>0){gameState.primaryReloadT=Math.max(0,gameState.primaryReloadT-dt);if(gameState.primaryReloadT===0){gameState.primaryAmmo=gameState.profile.primaryMag;gameState.message='LOADED '+gameState.primaryAmmo+'/'+gameState.profile.primaryMag;gameState.messageT=.30;}}
  gameState.heat=Math.max(0,gameState.heat-gameState.profile.cool*dt);if(gameState.overheat&&gameState.heat<.28)gameState.overheat=false;
  if(gameState.pointer.down&&!gameState.pointer.heFired){
    var chargeHold=(performance.now()-gameState.pointer.t0)/1000*gameState.profile.chargeScale;
    if(chargeHold>=HE_HOLD){
      gameState.pointer.heFired=true;
      if(fireWeapon('he',gameState.aim.x,gameState.aim.y)){gameState.message=gameState.profile.specialName;gameState.messageT=.28;}
    }
  }

  processEvents();updateInfantry(dt);updateVehicles(dt);updateAir(dt);updateShots(dt);updateFireZones(dt);updateEnemyShots(dt);updateEffects(dt);

  if(gameState.eff<.20){endGame('EFFICIENCY LOST');return;}
  var liveInf=gameState.infantry.some(function(e){return e.alive;});
  var liveVeh=gameState.vehicles.some(function(v){return v.alive&&v.state!=='parked'&&v.state!=='parkedDisabled'&&v.state!=='disabled';});
  var liveAir=gameState.air.some(function(a){return a.alive;});
  var volatileWreck=gameState.wrecks.some(function(w){return w.fuelIgnited&&!w.exploded;});
  if(gameState.eventCursor>=gameState.events.length&&!liveInf&&!liveVeh&&!liveAir&&!volatileWreck&&!gameState.paras.length&&gameState.levelTime>11.5)completeLevel();
}

/* ---------- PROGRESSION ---------- */

function completeLevel(){
  if(gameState.levelComplete)return;
  gameState.levelComplete=true;gameState.mode='shop';
  var mapNo=gameState.levelIndex+1,milestone=mapNo%5===0;
  gameState.save.supply+=Math.round(48+gameState.levelIndex*4.4+gameState.eff*24+(milestone?18:0));
  var points=1;if(mapNo>=5)points++;if(mapNo>=15)points++;if(mapNo>=25)points++;if(milestone)points++;if(gameState.eff>=.90)points++;
  gameState.save.arsenalPoints=(gameState.save.arsenalPoints||0)+points;
  gameState.save.bestLevel=Math.max(gameState.save.bestLevel,Math.min(CAMPAIGN_LENGTH-1,gameState.levelIndex+1));
  var dyn=evaluateAdaptiveDifficulty(false);saveGame();
  overlay.classList.remove('hidden');titleEl.textContent=gameState.levelIndex>=CAMPAIGN_LENGTH-1?'40 MAPS COMPLETE':'MAP CLEARED';
  subEl.textContent=(gameState.encounterName||'SECTOR')+' voltooid. Damage target '+dyn.band.min+'-'+dyn.band.max+' HP; resultaat '+Math.round(dyn.damage)+' HP ('+dyn.rating+'). Volgende map enemy '+adaptiveLabel(dyn.value)+'.';
  summaryEl.style.display='block';summaryEl.textContent='EFF '+Math.round(gameState.eff*100)+'% · KILLS '+(gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills)+' · DMG '+Math.round(dyn.damage)+'/'+dyn.band.min+'-'+dyn.band.max+' · +'+points+' AP';
  shopEl.style.display='block';restartBtn.style.display='none';deployBtn.style.display='block';deployBtn.textContent=gameState.levelIndex>=CAMPAIGN_LENGTH-1?'MAP 1 AGAIN':'NEXT MAP';renderShop();
}
function weaponPreview(kind,lvl){
  var n=Math.min(MAX_WEAPON_LEVEL,lvl+1);
  if(kind==='primary'){
    var a=primaryStats(lvl),b=primaryStats(n),rm=Math.max(.88,1.18-(gameState.save.upgrades.reload||0)*.06);
    return a.name+' → '+b.name+' · '+a.mag+'rd · RELOAD '+(a.reload*rm).toFixed(1)+'s→'+(b.reload*rm).toFixed(1)+'s';
  }
  var x=specialStats(lvl),y=specialStats(n);
  return x.name+' → '+y.name+' · RANGE '+Math.round(x.rangeFactor*100)+'→'+Math.round(y.rangeFactor*100)+'% · '+x.effect.toUpperCase()+'→'+y.effect.toUpperCase();
}
function skillPreview(key,lvl){
  var n=Math.min(SKILL_MAX,lvl+1);
  if(key==='aiming')return 'SPREAD '+Math.round((1-lvl*.09)*100)+'% → '+Math.round((1-n*.09)*100)+'%';
  if(key==='reload')return 'RELOAD x'+Math.max(.88,1.18-lvl*.06).toFixed(2)+' → x'+Math.max(.88,1.18-n*.06).toFixed(2);
  return 'HP +'+(lvl*24)+' → +'+(n*24)+' · DAMAGE '+Math.round((1-lvl*.065)*100)+'%→'+Math.round((1-n*.065)*100)+'%';
}
function renderShop(){
  gameState.profile=playerProfile();var up=gameState.save.upgrades;
  supplyEl.textContent='ARSENAL '+(gameState.save.arsenalPoints||0)+' · AIM '+up.aiming+'/5 · RLD '+up.reload+'/5 · ARM '+up.armor+'/5';
  shopGrid.innerHTML='';
  ['primary','special','aiming','reload','armor'].forEach(function(key){
    var cfg=UPGRADES[key],isWeapon=key==='primary'||key==='special',lvl=up[key]||0,max=lvl>=(isWeapon?MAX_WEAPON_LEVEL:SKILL_MAX);
    var cost=isWeapon?weaponUpgradeCost(key,lvl):1;
    var title=isWeapon?(key==='primary'?primaryStats(lvl).name:specialStats(lvl).name):cfg.label;
    var detail=max?'MAX':isWeapon?weaponPreview(key,lvl):skillPreview(key,lvl);
    var canBuy=!max&&(gameState.save.arsenalPoints||0)>=cost;
    var b=document.createElement('button');b.type='button';b.className='shopBtn'+(!canBuy?' disabled':'');
    b.innerHTML='<strong>'+cfg.label+' · '+lvl+'/'+(isWeapon?MAX_WEAPON_LEVEL:SKILL_MAX)+' · '+title+'</strong><span>'+detail+'</span><em>'+(max?'MAX':cost+' ARSENAL POINT'+(cost>1?'S':''))+'</em>';
    if(!max)b.addEventListener('click',function(){
      if((gameState.save.arsenalPoints||0)<cost)return;
      gameState.save.arsenalPoints-=cost;
      gameState.save.upgrades[key]=Math.min(isWeapon?MAX_WEAPON_LEVEL:SKILL_MAX,lvl+1);
      saveGame();gameState.profile=playerProfile();renderShop();
    });
    shopGrid.appendChild(b);
  });
}
function endGame(reason){
  gameState.mode='gameover';var dyn=evaluateAdaptiveDifficulty(true);
  overlay.classList.remove('hidden');titleEl.textContent=reason;
  subEl.textContent='Probeer dezelfde map opnieuw. Damage '+Math.round(dyn.damage)+' HP; target '+dyn.band.min+'-'+dyn.band.max+'. Retry enemy '+adaptiveLabel(dyn.value)+'.';
  summaryEl.style.display='block';summaryEl.textContent='EFF '+Math.round(gameState.eff*100)+'% · KILLS '+(gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills)+' · MAP '+(gameState.levelIndex+1)+'/40 · DYN '+adaptiveLabel(dyn.value);
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
    gameState.levelIndex=gameState.levelIndex>=CAMPAIGN_LENGTH-1?0:gameState.levelIndex+1;
    overlay.classList.add('hidden');shopEl.style.display='none';summaryEl.style.display='none';resetLevel();
  }
});
restartBtn.addEventListener('click',function(){
  AudioSys.unlock();overlay.classList.add('hidden');restartBtn.style.display='none';deployBtn.style.display='block';summaryEl.style.display='none';resetLevel();
});

/* ---------- RENDER: TERRAIN ---------- */

function pathRoad(){
var m=gameState.map,p=m.palette,r=m.road,w=r.width||23;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
function mainPath(off){off=off||0;ctx.beginPath();if(r.style==='straight'){ctx.moveTo(r.x+off,safeTop-25);ctx.lineTo(W*.5+off,gameState.bunker.y-55);}else if(r.style==='s'){ctx.moveTo(r.x+off,safeTop-25);ctx.bezierCurveTo(r.bendX+off,H*.30,W*.5-(r.bendX-W*.5)*.70+off,H*.58,W*.5+off,gameState.bunker.y-55);}else if(r.style==='dogleg'){ctx.moveTo(r.x+off,safeTop-25);ctx.lineTo(r.bendX+off,r.junctionY);ctx.lineTo(W*.5+off,H*.62);ctx.lineTo(W*.5+off,gameState.bunker.y-55);}else{ctx.moveTo(r.x+off,safeTop-25);ctx.quadraticCurveTo(r.bendX+off,r.junctionY,W*.5+off,gameState.bunker.y-55);}}
function strokeMain(color,width,alpha,dash,off){ctx.globalAlpha=alpha==null?1:alpha;ctx.strokeStyle=color;ctx.lineWidth=width;if(dash)ctx.setLineDash(dash);else ctx.setLineDash([]);mainPath(off||0);ctx.stroke();}
strokeMain(p.line,w+8,1);strokeMain(p.roadEdge,w+5,1);strokeMain(p.road,w,1);strokeMain(tone(p.road,.30),3.4,.22,null,-w*.27);strokeMain(tone(p.road,-.20),2,.30,null,w*.30);strokeMain(tone(p.road,.45),1.1,.34,[8,10],0);ctx.setLineDash([]);
function secondaryPath(kind){ctx.beginPath();if(kind==='cross'){ctx.moveTo(-30,r.junctionY);ctx.lineTo(W+30,r.junctionY+(r.bendX-W*.5)*.05);}else if(kind==='fork'){ctx.moveTo(r.bendX,r.junctionY);ctx.lineTo(r.bendX>W*.5?W+35:-35,H*.28);}else if(kind==='alley'){ctx.moveTo(-20,H*.53);ctx.quadraticCurveTo(W*.35,H*.48,r.bendX,H*.44);}else if(kind==='yard'){ctx.moveTo(W*.08,H*.43);ctx.lineTo(W*.92,H*.43);ctx.moveTo(W*.12,H*.49);ctx.lineTo(W*.86,H*.49);}}
if(r.secondary&&r.secondary!=='none'){var sw=r.secondary==='yard'?11:14;ctx.globalAlpha=1;ctx.strokeStyle=p.line;ctx.lineWidth=sw+6;secondaryPath(r.secondary);ctx.stroke();ctx.strokeStyle=p.roadEdge;ctx.lineWidth=sw+3;secondaryPath(r.secondary);ctx.stroke();ctx.strokeStyle=p.road;ctx.lineWidth=sw;secondaryPath(r.secondary);ctx.stroke();ctx.globalAlpha=.28;ctx.strokeStyle=tone(p.road,.35);ctx.lineWidth=1;ctx.setLineDash([6,9]);secondaryPath(r.secondary);ctx.stroke();ctx.setLineDash([]);}
ctx.restore();
}
function drawPatch(q,p){
  ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);
  ctx.globalAlpha=q.a*1.55;ctx.fillStyle=p.ground2;ctx.beginPath();ctx.ellipse(0,0,q.rx,q.ry,0,0,TAU);ctx.fill();
  ctx.globalAlpha=q.a*.70;ctx.strokeStyle=tone(p.ground2,-.22);ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
}
function drawEnvSprite(name,x,y,scale,rot,alpha){drawAtlas('env:'+name,x,y,scale||1,rot||0,alpha==null?1:alpha);}
function drawTree(t,p){if(t.dead){drawEnvSprite(t.variant%2?'deadTree':'stump',t.x,t.y,.70+t.r*.035,t.variant*.2,1);return;}drawEnvSprite('bush'+(1+(t.variant%3)),t.x,t.y,(t.r/7.8)*.84,t.variant*.18,1);if(t.r>9)drawEnvSprite('bush2',t.x+2,t.y-3,(t.r/9)*.52,-.15,.90);}
function drawRock(r,p){drawEnvSprite('boulder'+(1+(r.variant%3)),r.x,r.y,.50+r.r*.060,r.variant*.34,1);}
function drawDecor(d,p){drawEnvSprite(d.type,d.x,d.y,d.s,d.rot,.96);}
function drawCover(c,p){
  var state=coverIntegrity(c),base=.68+Math.min(.30,(c.len||12)/65);
  if(state>1)drawEnvSprite(c.sprite||'sandbagStraight',c.x,c.y,base*(state===2?.88:state===3?.94:1),c.rot,state===2?.66:state===3?.82:state===4?.92:1);
  if(state<=4){
    ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot||0);
    var mat=coverMaterial(c),chips=6-state;
    ctx.fillStyle=mat==='steel'?'#3b403b':mat==='wood'?'#67482f':p.rock;
    ctx.globalAlpha=state===1?.90:.58;
    for(var i=0;i<chips+1;i++)ctx.fillRect(-7+i*3+(i%2)*2,2+(i%3)*2,3+(i%2),2);
    if(state<=2){ctx.strokeStyle='#232823';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-10,-3);ctx.lineTo(9,5);ctx.moveTo(-5,5);ctx.lineTo(7,-4);ctx.stroke();}
    ctx.restore();
  }
  if(state===1){drawEnvSprite('rubbleConcrete',c.x,c.y,.28,c.rot||0,.58);}
}
function drawCompound(){var c=gameState.map.compound,name=level().theme==='industrial'?'ruinCompound':level().stage===2?'fieldBunker':'supplyCompound';drawEnvSprite(name,c.x,c.y,name==='supplyCompound'?.40:.37,0,1);}
function drawGroundTexture(){var p=gameState.map.palette,step=36,name=level().theme==='desert'?'groundSand':level().theme==='industrial'?'groundRubble':level().theme==='polar'?'groundPale':'groundGrass';for(var y=-step;y<H+step;y+=step)for(var x=-step;x<W+step;x+=step){var alt=((x/step+y/step)|0)&1;drawEnvSprite(name,x+step*.5,y+step*.5,1,alt?Math.PI:0,.46);}}
function drawSurface(){var a=gameState.map.surface||[];for(var i=0;i<a.length;i++){var d=a[i];drawEnvSprite(d.type,d.x,d.y,d.s,d.rot,d.a);}}
function drawSetpieces(){
  var a=gameState.map.setpieces||[];
  for(var i=0;i<a.length;i++){
    var q=a[i],x=q.x,y=q.y,s=q.s,f=q.flip,r=q.rot;
    if(q.type==='supply'){
      drawEnvSprite('gravel',x,y,s*1.45,r,.34);
      drawEnvSprite('palletCargo',x-13*f,y+2,s*.86,r-.08,1);
      drawEnvSprite('crateStack',x+13*f,y-7,s*.82,r+.10,1);
      drawEnvSprite('barrelStack',x+7*f,y+15,s*.68,r-.12,1);
    }else if(q.type==='defense'){
      drawEnvSprite('scorch1',x,y,s*1.20,r,.28);
      drawEnvSprite('sandbagCurve',x,y,s*1.06,r,1);
      drawEnvSprite('hedgehog',x-18*f,y+13,s*.70,r+.20,1);
      drawEnvSprite('wireFence',x+19*f,y+9,s*.76,r-.16,.95);
    }else if(q.type==='rubble'){
      drawEnvSprite('scorch2',x,y,s*1.25,r,.34);
      drawEnvSprite('rubbleConcrete',x-8*f,y,s*.95,r,1);
      drawEnvSprite('rubbleBrick',x+15*f,y+8,s*.76,r+.25,1);
      drawEnvSprite('deadTree',x+8*f,y-19,s*.62,r-.20,.96);
    }else if(q.type==='roadblock'){
      drawEnvSprite('trackCurve',x,y,s*1.30,r,.25);
      drawEnvSprite('roadBarrier',x,y,s*.95,r,1);
      drawEnvSprite('sandbagStraight',x-16*f,y+13,s*.73,r+.08,1);
      drawEnvSprite('crateStack',x+17*f,y+12,s*.64,r-.12,1);
    }else if(q.type==='ambush'){
      drawEnvSprite('bush2',x-11*f,y-4,s*.90,r,1);
      drawEnvSprite('bush3',x+12*f,y+7,s*.82,r+.25,1);
      drawEnvSprite('logPile',x,y+13,s*.82,r-.15,1);
      drawEnvSprite('wireFence',x+7*f,y-12,s*.58,r+.35,.90);
    }else{
      drawEnvSprite('logPile',x-10*f,y+4,s*.92,r,1);
      drawEnvSprite('stump',x+14*f,y+7,s*.72,r+.18,1);
      drawEnvSprite('woodFence',x,y-12,s*.72,r-.20,.94);
      drawEnvSprite('bush1',x+18*f,y-5,s*.68,r+.28,1);
    }
  }
}
function drawFireZones(){
  for(var i=0;i<gameState.fireZones.length;i++){
    var z=gameState.fireZones[i],q=clamp(z.t/z.maxT,0,1);
    ctx.save();ctx.globalAlpha=(z.plasma?.20:.16)*Math.min(1,q*2.5);ctx.fillStyle=z.plasma?'#5ce7ff':'#d94b27';ctx.beginPath();ctx.ellipse(z.x,z.y,z.radius,z.radius*.58,0,0,TAU);ctx.fill();
    ctx.globalAlpha=(z.plasma?.38:.24)*q;ctx.strokeStyle=z.plasma?'#c86cff':'#ff9b39';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
  }
}
function drawCrater(c,p){drawEnvSprite(c.r>8?'crater2':'crater1',c.x,c.y,.52+(c.r/22),c.rot||0,.68);}
function drawBlood(b){var n=b.r>5?'blood3':b.shade===1?'blood2':'blood1';drawEnvSprite(n,b.x,b.y,.40+b.r*.055,b.rot||0,.76);}
function drawArcadeGroundDetail(p){ctx.save();ctx.globalAlpha=.10;ctx.fillStyle=tone(p.ground2,-.12);for(var i=0;i<24;i++){var x=(i*113+level().seed*17)%W,y=safeTop+70+((i*149+level().seed*11)%Math.max(120,H-safeTop-safeBottom-165));ctx.fillRect(x,y,i%5?1:2,1);}ctx.restore();}

function drawMap(){
  var m=gameState.map,p=m.palette;ctx.fillStyle=p.ground;ctx.fillRect(0,0,W,H);drawGroundTexture();drawSurface();
  for(var i=0;i<m.patches.length;i++)drawPatch(m.patches[i],p);pathRoad();drawSetpieces();drawCompound();
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
    rifle:{cloth:'#566c50',cloth2:'#78906a',dark:'#1d2720',helm:'#344d39',metal:'#222a26',wood:'#754f35'},
    lmg:{cloth:'#435b43',cloth2:'#66805d',dark:'#19221c',helm:'#2c4132',metal:'#171d1a',wood:'#6d4932'},
    grenadier:{cloth:'#6f704f',cloth2:'#919168',dark:'#2a291e',helm:'#4b5942',metal:'#262923',wood:'#7a5338'},
    marksman:{cloth:'#49645a',cloth2:'#6f8775',dark:'#1d2722',helm:'#31493d',metal:'#171f1c',wood:'#68482f'}
  }[role];
  if(skin===1){c.cloth=tone(c.cloth,.12);c.helm=tone(c.helm,.10);c.cloth2=tone(c.cloth2,.08);}
  if(skin===2){c.cloth=tone(c.cloth,-.10);c.cloth2=tone(c.cloth2,-.08);}
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
    outline:'#111713',rubber:'#202522',track:'#252b27',
    body:'#56665a',body2:'#738174',body3:'#a0a895',
    edge:'#d2d6be',shadow:'#343b35',rust:'#8b5138',
    canvas:'#7a735d',canvasLight:'#a09270',canvasDark:'#514a3d',
    glass:'#6d8e90',glassHi:'#bfd0ca',seat:'#5a4c3d',
    wood:'#735239',mark:'#eee8ce',hole:'#101310',
    line:'#111713',black:'#1c211e',metal:'#5f6c62',light:'#a7ae9c'
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
function drawScoutCarSprite(g,x,y,w,h,loaded,frame,state){drawJeepSprite(g,x,y,w,h,loaded,frame,state);var c=vehiclePalette(),cx=x+w/2;poly(g,[[x+10,y+28],[x+w-10,y+28],[x+w-7,y+h-20],[x+7,y+h-20]],state==='hit'?'#5d604f':c.body2,c.outline);poly(g,[[x+16,y+34],[x+w-16,y+34],[x+w-13,y+54],[x+13,y+54]],c.body3,c.outline);g.fillStyle=c.outline;g.beginPath();g.arc(cx,y+49,7,0,TAU);g.fill();g.fillStyle=c.body2;g.beginPath();g.arc(cx,y+49,5,0,TAU);g.fill();P(g,cx+2,y+47,14,3,c.outline);P(g,cx+5,y+48,11,1,c.edge);P(g,x+14,y+22,w-28,5,'#98aaa3');}
function vehicleBase(g,x,y,type,loaded,frame,state){var w=type==='jeep'?54:type==='scoutcar'?60:type==='lighttruck'?62:type==='truck'?66:70,h=type==='jeep'?82:type==='scoutcar'?94:type==='lighttruck'?104:type==='truck'?116:116;if(type==='jeep')drawJeepSprite(g,x,y,w,h,loaded,frame,state);else if(type==='scoutcar')drawScoutCarSprite(g,x,y,w,h,loaded,frame,state);else if(type==='lighttruck')drawLightTruckSprite(g,x,y,w,h,loaded,frame,state);else if(type==='truck')drawTroopTruckSprite(g,x,y,w,h,loaded,frame,state);else drawHalftrackSprite(g,x,y,w,h,loaded,frame,state);}
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
function propShadow(g,cx,cy,rx,ry,a){g.save();g.globalAlpha=a==null?.24:a;g.fillStyle='#1b241d';g.beginPath();g.ellipse(cx+2.5,cy+3.5,rx,ry,.08,0,TAU);g.fill();g.restore();}
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
  ['jeep','scoutcar','lighttruck','truck','halftrack'].forEach(function(type){
    var vw=type==='jeep'?54:type==='scoutcar'?60:type==='lighttruck'?62:type==='truck'?66:70;
    var vh=type==='jeep'?88:type==='lighttruck'?104:116;
    for(var loaded=0;loaded<2;loaded++)for(var fr=0;fr<2;fr++)for(var st=0;st<2;st++){
      (function(t,l,f,state,w,h){atlasAdd(t+':'+(l?'loaded':'empty')+':'+f+':'+state,w,h,function(gg,x,y){vehicleBase(gg,x,y,t,l,f,state);});})(type,loaded,fr,st?'hit':'healthy',vw,vh);
    }
    atlasAdd(type+':wreck',vw,vh,function(gg,x,y){wreckSprite(gg,x,y,type);});
  });
  atlasAdd('turret:jeep',32,32,function(gg,x,y,w,h){turretSprite(gg,x,y,w,h,'jeep');});atlasAdd('turret:scoutcar',34,34,function(gg,x,y,w,h){turretSprite(gg,x,y,w,h,'scoutcar');});atlasAdd('turret:lighttruck',32,32,function(gg,x,y,w,h){turretSprite(gg,x,y,w,h,'lighttruck');});atlasAdd('turret:truck',32,32,function(gg,x,y,w,h){turretSprite(gg,x,y,w,h,'truck');});atlasAdd('turret:halftrack',38,38,function(gg,x,y,w,h){turretSprite(gg,x,y,w,h,'halftrack');});
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
function drawAtlas(name,x,y,scale,angle,alpha){
  ensureSpriteAtlas();var f=SPR.frames[name];if(!f)return;
  var outlined=name.indexOf('ground')<0&&name.indexOf('track')<0&&name.indexOf('gravel')<0&&name.indexOf('mudPatch')<0&&name.indexOf('blood')<0&&name.indexOf('scorch')<0;
  ctx.save();ctx.translate(x,y);if(angle)ctx.rotate(angle);ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=true;
  if(outlined){ctx.shadowColor='rgba(12,17,13,.55)';ctx.shadowBlur=0;ctx.shadowOffsetX=1.2;ctx.shadowOffsetY=1.5;}
  ctx.drawImage(SPR.atlas,f.x,f.y,f.w,f.h,-f.w*scale/2,-f.h*scale/2,f.w*scale,f.h*scale);
  ctx.restore();
}
function spritePose(e){if(!e.alive)return e.deadT<.22?'dead1':'dead2';if(e.state==='dismount')return ((e.stateT*12)|0)%2?'walk2':'walk3';if(e.state==='rocketAim')return 'standFire';if(e.state==='crawl'||e.state==='prone')return e.muzzle>0?'proneFire':'prone';if(e.state==='cover'||e.state==='covering'||e.state==='suppressed')return e.muzzle>0?'crouchFire':'crouch';if(e.state==='fire'){if(e.firePose==='prone')return e.muzzle>0?'proneFire':'prone';if(e.firePose==='crouch')return e.muzzle>0?'crouchFire':'crouch';return e.muzzle>0?'standFire':'idle';}if(e.state==='advance')return ['walk1','walk2','walk3','walk4'][((e.anim*3.15)|0)%4];return ((e.anim2*1.3)|0)%2?'idle2':'idle';}
function spriteDirection(e){var dx,dy;if(e.alive&&(e.state==='advance'||e.state==='crawl'||e.state==='suppressed')){var t=tacticalPoint(e);dx=t.x-e.x;dy=t.y-e.y;}else{dx=gameState.bunker.x-e.x;dy=gameState.bunker.y-e.y;}if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';return dy<0?'up':'down';}
function drawSoldier(e){
  var pose=spritePose(e),dir=spriteDirection(e),skin=Math.abs(e.variant||0)%SPR.inf.skins,scale=(IS_IPHONE?1.04:1.00);
  var moving=e.alive&&(e.state==='advance'||e.state==='crawl'||e.state==='dismount'),gait=moving?Math.sin(e.anim*3.15):0,bob=moving&&pose.indexOf('prone')!==0?Math.abs(gait)*.85:0;
  var hop=e.limp>0?Math.abs(Math.sin(e.anim*2.8))*1.7*e.limp:0;
  if(e.state==='dismount'&&e.dismountDur>0)hop+=Math.sin(Math.PI*clamp(1-e.dismountT/e.dismountDur,0,1))*(e.dismountArc||5.2);
  var recoil=(e.recoil||0)*(e.role==='lmg'?1.7:1.15),rx=-Math.cos(e.angle||0)*recoil,ry=-Math.sin(e.angle||0)*recoil;
  var xx=e.x+(e.limp>0?Math.sin(e.anim*5.6)*.8:0)+rx,yy=e.y-hop-bob+ry;
  var landQ=clamp((e.landSquash||0)/.18,0,1),sx=1+landQ*.08,sy=1-landQ*.10;
  var lean=moving&&pose.indexOf('prone')!==0?clamp((e.vx||0)*.0018,-.055,.055)+gait*.018:0;
  if(!e.alive)lean+=clamp(e.deadT/.22,0,1)*((e.variant||0)%2?.16:-.16);
  var shadowJump=clamp(hop/10,0,.75);
  ctx.save();ctx.globalAlpha=.30*(1-shadowJump*.55);ctx.fillStyle='rgba(15,20,16,.58)';ctx.beginPath();ctx.ellipse(e.x+1.5,e.y+7.5,(pose.indexOf('prone')===0?7.5:5.8)*(1-shadowJump*.24),(pose.indexOf('prone')===0?2.4:2.9)*(1-shadowJump*.18),0,0,TAU);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(xx,yy);ctx.rotate(lean);ctx.scale(sx,sy);drawAtlas('inf:'+e.role+':'+skin+':'+dir+':'+pose,0,0,scale,0,e.alive?1:clamp(1-e.deadT/7,.34,1));
  if(e.alive&&e.mgTeamGunner){ctx.strokeStyle='#252a23';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-5,4);ctx.lineTo(7,4);ctx.stroke();ctx.fillStyle='#6f5c3b';ctx.fillRect(-5,5,4,3);}ctx.restore();
  if(e.alive&&e.rocketUnit){var aa=e.state==='rocketAim'?(e.rocketAimAngle||e.angle):e.angle;ctx.save();ctx.translate(xx,yy-3);ctx.rotate(aa);ctx.strokeStyle='#151a16';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(10,0);ctx.stroke();ctx.strokeStyle='#52604a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(10,0);ctx.stroke();ctx.fillStyle='#8a7650';ctx.fillRect(-3,-2,3,4);ctx.restore();if(e.state==='rocketAim'){var rq=1-clamp(e.rocketAimT/Math.max(.01,e.rocketAimTotal),0,1);ctx.save();ctx.globalAlpha=.45+.35*Math.sin(gameState.time*16)*rq;ctx.strokeStyle='#e89a45';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(xx,yy-2,8+rq*4,0,TAU);ctx.stroke();ctx.restore();}}
  if(e.alive&&pose.indexOf('prone')!==0){ctx.save();ctx.globalAlpha=.42;ctx.fillStyle='#e2e0bd';ctx.beginPath();ctx.arc(xx-1.2,yy-5.2,1.05,0,TAU);ctx.fill();ctx.restore();}
}
function drawVehicle(v,wreck){
  var rawType=v.type||'truck',type=rawType==='trooptruck'?'truck':rawType,body=v.bodyAngle==null?Math.PI/2:v.bodyAngle,rot=body-Math.PI/2;
  var scale=type==='jeep'?.50:type==='scoutcar'?.56:type==='lighttruck'?.54:type==='truck'?.52:.54;
  var shadowW=type==='jeep'?13:type==='scoutcar'?16:type==='lighttruck'?17:type==='truck'?19:21;
  var shadowH=type==='jeep'?24:type==='scoutcar'?31:type==='lighttruck'?33:type==='truck'?37:38;
  var bodyW=type==='jeep'?11:type==='scoutcar'?14:type==='lighttruck'?14:type==='truck'?15:16;
  var bodyL=type==='jeep'?20:type==='scoutcar'?27:type==='lighttruck'?27:type==='truck'?30:31;

  if(!wreck&&v.fuelLeak){ctx.save();ctx.globalAlpha=.42;ctx.fillStyle='#2b2416';ctx.beginPath();ctx.ellipse(v.x+4,v.y+13,Math.max(4,v.oilRadius||4),Math.max(1.8,(v.oilRadius||4)*.40),0,0,TAU);ctx.fill();ctx.restore();}
  ctx.save();ctx.translate(v.x+3,v.y+5);ctx.rotate(rot);ctx.globalAlpha=wreck?.25:.22;ctx.fillStyle='#101310';
  ctx.beginPath();ctx.ellipse(0,0,shadowW,shadowH,0,0,TAU);ctx.fill();ctx.restore();

  if(wreck){
    if(v.softDisabled){
      ctx.save();ctx.globalAlpha=v.fuelLeak?.52:.26;ctx.fillStyle=v.fuelLeak?'#2b2416':'#241d15';ctx.beginPath();ctx.ellipse(v.x+4,v.y+13,Math.max(v.fuelLeak?4:2.5,v.oilRadius||2.5),Math.max(1.4,(v.oilRadius||2.5)*.42),(v.oilSeed||0)%1,0,TAU);ctx.fill();ctx.restore();
      drawAtlas(type+':empty:0:hit',v.x,v.y,scale,rot,1);
      ctx.save();ctx.translate(v.x,v.y);ctx.rotate(rot);
      if(v.windowBroken){var wy=bodyL*.29;ctx.strokeStyle='rgba(205,230,225,.88)';ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(-5,wy-4);ctx.lineTo(5,wy+2);ctx.moveTo(4,wy-5);ctx.lineTo(-4,wy+2);ctx.stroke();}
      if(v.tireFlat){ctx.fillStyle='#111312';ctx.beginPath();ctx.ellipse(-shadowW*.70,shadowH*.25,4,2.2,.25,0,TAU);ctx.fill();}
      if(v.doorOpen){ctx.save();ctx.translate(shadowW*.62,-shadowH*.22);ctx.rotate(.72);ctx.fillStyle='#4b5943';ctx.strokeStyle='#151b16';ctx.lineWidth=1.1;ctx.fillRect(0,-5,7,10);ctx.strokeRect(0,-5,7,10);ctx.restore();}
      var holes=Math.min(4,v.bulletHoles||0);ctx.fillStyle='#111411';for(var bh=0;bh<holes;bh++){ctx.beginPath();ctx.arc(-5+bh*3,-2+(bh%2)*4,1.2,0,TAU);ctx.fill();}
      ctx.strokeStyle='#222a24';ctx.fillStyle='#a9b9b4';ctx.lineWidth=1;
      if(v.mirrorLeft!==false){ctx.beginPath();ctx.moveTo(-bodyW*.58,bodyL*.28);ctx.lineTo(-bodyW*.88,bodyL*.33);ctx.stroke();ctx.fillRect(-bodyW*.98,bodyL*.29,3.2,2.4);}
      if(v.mirrorRight!==false){ctx.beginPath();ctx.moveTo(bodyW*.58,bodyL*.28);ctx.lineTo(bodyW*.88,bodyL*.33);ctx.stroke();ctx.fillRect(bodyW*.82,bodyL*.29,3.2,2.4);}
      if(v.rearGateOpen){ctx.save();ctx.translate(0,-bodyL*.68);ctx.rotate(.58);ctx.fillStyle='#53604a';ctx.fillRect(-bodyW*.72,0,bodyW*1.44,4);ctx.restore();}
      ctx.restore();
    }else drawAtlas(type+':wreck',v.x,v.y,scale,rot,.99);
    return;
  }

  var loaded=(v.passengers||0)>0,frame=(((v.wheelT||0)*1.55)|0)&1;
  var state=(v.hp/v.maxHp)<.58?'hit':'healthy';
  drawAtlas(type+':'+(loaded?'loaded':'empty')+':'+frame+':'+state,v.x,v.y,scale,rot,1);

  if(v.hasMG){
    var recoil=(v.turretRecoil||0)*(type==='halftrack'?2.6:type==='scoutcar'?2.1:1.8);
    var tx=v.x-Math.cos(v.turretAngle)*recoil,ty=v.y-Math.sin(v.turretAngle)*recoil;
    drawAtlas('turret:'+type,tx,ty,type==='halftrack'?.78:type==='scoutcar'?.70:.62,v.turretAngle,1);
  }

  ctx.save();ctx.translate(v.x,v.y);ctx.rotate(rot);
  if(v.windowBroken){
    var wy=bodyL*.29;ctx.strokeStyle='rgba(205,230,225,.88)';ctx.lineWidth=.75;
    ctx.beginPath();ctx.moveTo(-5,wy-4);ctx.lineTo(5,wy+2);ctx.moveTo(4,wy-5);ctx.lineTo(-4,wy+2);ctx.moveTo(0,wy-6);ctx.lineTo(0,wy+3);ctx.stroke();
  }
  if(v.tireFlat){
    ctx.fillStyle='#111312';ctx.beginPath();ctx.ellipse(-shadowW*.70,shadowH*.25,4,2.2,.25,0,TAU);ctx.fill();
  }
  if(v.doorOpen){
    ctx.save();ctx.translate(shadowW*.62,-shadowH*.22);ctx.rotate(.72);
    ctx.fillStyle='#4b5943';ctx.strokeStyle='#151b16';ctx.lineWidth=1.1;ctx.fillRect(0,-5,7,10);ctx.strokeRect(0,-5,7,10);ctx.restore();
  }
  var holes=Math.min(4,v.bulletHoles||0);ctx.fillStyle='#111411';
  for(var bh=0;bh<holes;bh++){ctx.beginPath();ctx.arc(-5+bh*3,-2+(bh%2)*4,1.2,0,TAU);ctx.fill();}
  ctx.strokeStyle='#222a24';ctx.fillStyle='#a9b9b4';ctx.lineWidth=1;
  if(v.mirrorLeft!==false){ctx.beginPath();ctx.moveTo(-bodyW*.58,bodyL*.28);ctx.lineTo(-bodyW*.88,bodyL*.33);ctx.stroke();ctx.fillRect(-bodyW*.98,bodyL*.29,3.2,2.4);}
  if(v.mirrorRight!==false){ctx.beginPath();ctx.moveTo(bodyW*.58,bodyL*.28);ctx.lineTo(bodyW*.88,bodyL*.33);ctx.stroke();ctx.fillRect(bodyW*.82,bodyL*.29,3.2,2.4);}
  if(v.rearGateOpen){
    ctx.save();ctx.translate(0,-bodyL*.68);ctx.rotate(.58);ctx.fillStyle='#53604a';ctx.strokeStyle='#161c17';ctx.lineWidth=1;ctx.fillRect(-bodyW*.72,0,bodyW*1.44,5);ctx.strokeRect(-bodyW*.72,0,bodyW*1.44,5);ctx.restore();
  }
  ctx.restore();

  if(v.hitFlash>0){
    ctx.save();ctx.globalAlpha=clamp(v.hitFlash/.10,0,.30);ctx.fillStyle='#fff1ad';
    ctx.beginPath();ctx.ellipse(v.x,v.y,shadowW*.95,shadowH*.70,rot,0,TAU);ctx.fill();ctx.restore();
  }
  if(v.state==='reverseWreck'){
    ctx.save();ctx.translate(v.x,v.y);ctx.rotate(rot);ctx.fillStyle='#f7d8a5';ctx.globalAlpha=.82;
    ctx.fillRect(-shadowW*.55,-shadowH*.80,3,2);ctx.fillRect(shadowW*.42,-shadowH*.80,3,2);ctx.restore();
  }
  ctx.save();ctx.translate(v.x,v.y);ctx.rotate(rot);
  ctx.globalAlpha=.48;ctx.strokeStyle='#e0dfc2';ctx.lineWidth=1.15;ctx.beginPath();ctx.moveTo(-bodyW*.62,-bodyL*.66);ctx.lineTo(-bodyW*.58,bodyL*.42);ctx.stroke();
  ctx.globalAlpha=.50;ctx.strokeStyle='#152019';ctx.lineWidth=1.25;ctx.beginPath();ctx.moveTo(bodyW*.65,-bodyL*.50);ctx.lineTo(bodyW*.63,bodyL*.55);ctx.stroke();ctx.restore();
}
function drawHeli(a){var bob=Math.sin(a.t*4.2)*1.4,bank=clamp((a.vx||0)/700,-.08,.08);ctx.save();ctx.translate(a.x,a.y+bob);ctx.rotate(bank);drawAtlas('heli:'+(((a.rotor*1.2)|0)&1),0,0,1.06,0,1);ctx.globalAlpha=.28;ctx.strokeStyle='#26302b';ctx.lineWidth=1.4;var rw=20+Math.abs(Math.sin(a.rotor))*5;ctx.beginPath();ctx.ellipse(0,-7,rw,4,0,0,TAU);ctx.stroke();ctx.restore();}
function drawPlane(a){var bank=Math.sin(a.t*2.1)*.025+(a.fromLeft?-.018:.018);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(bank);drawAtlas('plane:'+(a.fromLeft?0:1),0,0,1.08,0,1);ctx.restore();}
function drawPara(p){var sway=Math.sin(p.phase)*.055,bob=Math.abs(Math.sin(p.phase*.72))*.7;ctx.save();ctx.translate(p.x,p.y+bob);ctx.rotate(sway);drawAtlas('para:'+(((p.phase*1.3)|0)&1),0,0,1.02,0,1);ctx.restore();}
/* ---------- RENDER: EFFECTS / PLAYER ---------- */

function drawEffects(){
  for(var i=0;i<gameState.effects.length;i++){
    var e=gameState.effects[i],q=1-e.t/e.life,px=e.x,py=e.y;
    if(e.type==='explosion'){
      var grow=1-Math.pow(q,2.4),rr=Math.max(3,e.r*(.24+1.02*grow)),wob=(e.seed||0)*.013;
      ctx.save();ctx.globalAlpha=Math.min(1,q*1.18);ctx.fillStyle='#24231f';
      for(var ex=0;ex<4;ex++){var ea=wob+ex*1.57,er=rr*(.78+(ex%2)*.12);ctx.beginPath();ctx.arc(px+Math.cos(ea)*rr*.18,py+Math.sin(ea)*rr*.14,er,0,TAU);ctx.fill();}
      ctx.fillStyle='#b94a2d';ctx.beginPath();ctx.arc(px,py,rr*.90,0,TAU);ctx.fill();ctx.fillStyle='#f18734';ctx.beginPath();ctx.arc(px-rr*.10,py-rr*.16,rr*.64,0,TAU);ctx.fill();ctx.fillStyle='#ffd85b';ctx.beginPath();ctx.arc(px-rr*.18,py-rr*.22,rr*.36,0,TAU);ctx.fill();ctx.globalAlpha=q*q;ctx.fillStyle='#fff8d5';ctx.beginPath();ctx.arc(px-rr*.20,py-rr*.24,Math.max(1.6,rr*.16),0,TAU);ctx.fill();ctx.restore();
    }else if(e.type==='shockRing'){
      var st=clamp(e.t/e.life,0,1),sr0=lerp(e.r||2,e.maxR||18,1-Math.pow(1-st,2.2));ctx.save();ctx.globalAlpha=(1-st)*(e.soft?.25:.62);ctx.strokeStyle=e.material==='sand'?'#d7bd82':e.material==='snow'?'#eef3ed':e.material==='grit'?'#b8bcb5':'#f2d49b';ctx.lineWidth=e.soft?1:2.2;ctx.beginPath();ctx.ellipse(px,py,sr0,sr0*(e.soft?.38:.72),0,0,TAU);ctx.stroke();ctx.restore();
    }else if(e.type==='fireball'){
      var fr=Math.max(3,e.r*(.48+.66*(1-q)));ctx.save();ctx.globalAlpha=q;ctx.fillStyle='#321d16';ctx.beginPath();ctx.arc(px+1,py+2,fr*1.04,0,TAU);ctx.fill();
      ctx.fillStyle='#c64b29';ctx.beginPath();ctx.arc(px,py,fr,0,TAU);ctx.fill();ctx.fillStyle='#f58b32';ctx.beginPath();ctx.arc(px-fr*.12,py-fr*.18,fr*.63,0,TAU);ctx.fill();
      ctx.fillStyle='#ffe06a';ctx.beginPath();ctx.arc(px-fr*.20,py-fr*.26,fr*.28,0,TAU);ctx.fill();ctx.restore();
    }else if(e.type==='smoke'){
      var sr=Math.max(2,e.r);ctx.save();ctx.globalAlpha=q>.55?.72:.48;ctx.fillStyle=e.shade>.6?'#303633':'#4a5149';ctx.beginPath();ctx.arc(px,py,sr,0,TAU);ctx.fill();ctx.strokeStyle='#202622';ctx.lineWidth=.9;ctx.stroke();ctx.restore();
    }else if(e.type==='flame'||e.type==='plasmaFlame'){
      var fs=Math.max(3,e.r);ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);var plasma=e.type==='plasmaFlame';ctx.fillStyle=plasma?'#7e43e8':'#c94c29';ctx.beginPath();ctx.moveTo(0,-fs);ctx.quadraticCurveTo(fs*.65,-fs*.15,0,fs*.30);ctx.quadraticCurveTo(-fs*.65,-fs*.15,0,-fs);ctx.fill();
      ctx.fillStyle=plasma?'#63e9ff':'#ffd659';ctx.beginPath();ctx.moveTo(0,-fs*.65);ctx.quadraticCurveTo(fs*.30,0,0,fs*.16);ctx.quadraticCurveTo(-fs*.30,0,0,-fs*.65);ctx.fill();ctx.restore();
    }else if(e.type==='muzzle'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.angle);var ml=Math.max(5,e.r),mw=2.0+(e.variant||0)*.45;
      ctx.globalAlpha=q*.22;ctx.fillStyle='#ff9d32';ctx.beginPath();ctx.ellipse(ml*.28,0,ml*.82,mw*2.4,0,0,TAU);ctx.fill();ctx.globalAlpha=q;ctx.fillStyle='#ffd85b';ctx.beginPath();ctx.moveTo(-1,-mw);ctx.lineTo(ml,0);ctx.lineTo(-1,mw);ctx.lineTo(ml*.25,0);ctx.closePath();ctx.fill();ctx.fillStyle='#fff5c7';ctx.beginPath();ctx.moveTo(0,-.8);ctx.lineTo(ml*.72,0);ctx.lineTo(0,.8);ctx.closePath();ctx.fill();ctx.restore();
    }else if(e.type==='debris'){
      ctx.globalAlpha=q;ctx.save();ctx.translate(px,py);ctx.rotate(e.rot);ctx.fillStyle=gameState.map.palette.rock;ctx.strokeStyle='#1a201b';ctx.lineWidth=.8;ctx.fillRect(-e.size/2,-e.size/2,e.size,e.size*.65);ctx.strokeRect(-e.size/2,-e.size/2,e.size,e.size*.65);ctx.restore();
    }else if(e.type==='casing'){ctx.globalAlpha=q;ctx.fillStyle='#d0a94e';ctx.fillRect(px,py,2.5,1.2);
    }else if(e.type==='vehiclePart'){drawAtlas('part:'+e.part,px,py,e.scale||1,e.rot,q);
    }else if(e.type==='impactFlash'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.strokeStyle='#ffe070';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.moveTo(0,-6);ctx.lineTo(0,6);ctx.moveTo(-4,-4);ctx.lineTo(4,4);ctx.moveTo(4,-4);ctx.lineTo(-4,4);ctx.stroke();ctx.restore();
    }else if(e.type==='ember'){ctx.globalAlpha=q;ctx.fillStyle='#f06f2c';ctx.beginPath();ctx.arc(px,py,1.5,0,TAU);ctx.fill();
    }else if(e.type==='blood'){ctx.globalAlpha=q;ctx.fillStyle=e.shade===1?'#8c2528':e.shade===2?'#58191d':'#751f23';ctx.beginPath();ctx.arc(px,py,Math.max(1,e.r*.55),0,TAU);ctx.fill();
    }else if(e.type==='spark'||e.type==='gunSpark'){
      ctx.globalAlpha=q;ctx.strokeStyle=e.type==='gunSpark'?'#fff5c7':'#ffd96a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(e.x-e.vx*.025,e.y-e.vy*.025);ctx.stroke();
    }else if(e.type==='heTrail'){ctx.globalAlpha=q>.55?.45:.23;ctx.fillStyle='#4a5149';ctx.beginPath();ctx.arc(px,py,2.2,0,TAU);ctx.fill();
    }else if(e.type==='footDust'||e.type==='wheelDust'){ctx.save();ctx.globalAlpha=q*(e.type==='wheelDust'?.34:.28);ctx.fillStyle=e.material==='sand'?'#b69a63':e.material==='grit'?'#777b73':e.material==='snow'?'#e6ece5':gameState.map.palette.roadEdge;ctx.beginPath();ctx.ellipse(px,py,Math.max(1.4,e.r),Math.max(.7,e.r*.38),0,0,TAU);ctx.fill();ctx.restore();
    }else if(e.type==='dust'){ctx.globalAlpha=q*.45;ctx.fillStyle=e.material==='sand'?'#b69a63':e.material==='grit'?'#777b73':e.material==='snow'?'#dfe6df':gameState.map.palette.roadEdge;ctx.beginPath();ctx.ellipse(px,py,Math.max(2,e.r),Math.max(1.2,e.r*.45),0,0,TAU);ctx.fill();
    }else if(e.type==='ricochet'){
      var ra=Math.atan2(e.vy,e.vx),rl=e.len||10,rx=px-Math.cos(ra)*rl,ry=py-Math.sin(ra)*rl;ctx.save();ctx.lineCap='round';ctx.globalAlpha=q*.55;ctx.strokeStyle='#d9a24d';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(px,py);ctx.stroke();ctx.globalAlpha=q;ctx.strokeStyle='#fff7c9';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(px,py);ctx.stroke();ctx.restore();
    }else if(e.type==='grassBlade'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.rot||0);ctx.strokeStyle=e.shade===1?'#698052':e.shade===2?'#445f3d':'#78905a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,2);ctx.lineTo(0,-3.5);ctx.stroke();ctx.restore();
    }else if(e.type==='groundClod'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.rot||0);ctx.fillStyle=e.material==='sand'?'#aa8c58':gameState.map.palette.roadEdge;ctx.fillRect(-1.7,-1.1,3.4,2.2);ctx.restore();
    }else if(e.type==='grit'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.rot||0);ctx.fillStyle=e.shade===1?'#93978f':e.shade===2?'#555a55':'#747972';ctx.fillRect(-1.5,-.9,3,1.8);ctx.restore();
    }else if(e.type==='snowChip'){
      ctx.save();ctx.globalAlpha=q*.9;ctx.fillStyle='#eef2e9';ctx.beginPath();ctx.arc(px,py,e.r||1.5,0,TAU);ctx.fill();ctx.restore();
    }else if(e.type==='exhaust'){
      ctx.save();ctx.globalAlpha=q*(.24+(e.shade||0)*.12);ctx.fillStyle='#444a44';ctx.beginPath();ctx.arc(px,py,Math.max(1.5,e.r),0,TAU);ctx.fill();ctx.restore();
    }else if(e.type==='mirrorPart'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.rot||0);ctx.strokeStyle='#172019';ctx.fillStyle='#9aa9a5';ctx.lineWidth=1;ctx.fillRect(-3,-1.8,6,3.6);ctx.strokeRect(-3,-1.8,6,3.6);ctx.restore();
    }else if(e.type==='coverChip'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.rot||0);ctx.fillStyle=e.material==='steel'?'#4a4f4b':e.material==='wood'?'#785238':gameState.map.palette.rock;ctx.fillRect(-2,-1.2,4,2.4);ctx.restore();
    }else if(e.type==='fuelDrop'){
      ctx.save();ctx.globalAlpha=q*.42;ctx.fillStyle='#302719';ctx.beginPath();ctx.ellipse(px,py,Math.max(1,e.r||1.5),Math.max(.7,(e.r||1.5)*.45),0,0,TAU);ctx.fill();ctx.restore();
    }else if(e.type==='glassGlint'){
      ctx.save();ctx.globalAlpha=q;ctx.strokeStyle='#e8fbff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px-2,py);ctx.lineTo(px+2,py);ctx.moveTo(px,py-2);ctx.lineTo(px,py+2);ctx.stroke();ctx.restore();
    }else if(e.type==='glassShard'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.rot||0);ctx.fillStyle='#c8e1df';ctx.fillRect(-1.3,-.7,2.6,1.4);ctx.restore();
    }else if(e.type==='rubber'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.rot||0);ctx.fillStyle='#171917';ctx.fillRect(-2,-1,4,2);ctx.restore();
    }else if(e.type==='shrapnel'){
      ctx.globalAlpha=q;ctx.strokeStyle='#e5c67d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-e.vx*.018,py-e.vy*.018);ctx.stroke();
    }else if(e.type==='driverFall'){
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.rot||0);
      ctx.fillStyle='#303a2d';ctx.fillRect(-4,-7,8,10);ctx.fillStyle='#c7ae86';ctx.beginPath();ctx.arc(0,-9,3,0,TAU);ctx.fill();
      ctx.strokeStyle='#252a23';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-2,2);ctx.lineTo(-6,8);ctx.moveTo(2,2);ctx.lineTo(6,8);ctx.stroke();ctx.restore();
    }else if(e.type==='damage'){
      ctx.globalAlpha=q;ctx.font='700 10px system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillStyle='#f4efd4';ctx.strokeStyle='#1a201b';ctx.lineWidth=2;ctx.strokeText(e.text,px,py);ctx.fillText(e.text,px,py);
    }else if(e.type==='hit'){
      ctx.globalAlpha=q;ctx.strokeStyle='#ffe070';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(px-5,py);ctx.lineTo(px+5,py);ctx.moveTo(px,py-5);ctx.lineTo(px,py+5);ctx.stroke();
    }else if(e.type==='rope'){
      ctx.globalAlpha=q;ctx.strokeStyle='#c9c6a7';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px-8,py);ctx.lineTo(px-8,py+38);ctx.moveTo(px+8,py);ctx.lineTo(px+8,py+38);ctx.stroke();
    }else if(e.type==='chute'){ctx.globalAlpha=q;ctx.strokeStyle='#252b27';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(px,py,14,Math.PI,TAU);ctx.stroke();}
  }
  ctx.globalAlpha=1;ctx.textAlign='left';
}
function drawPrimaryProjectile(b){
  var p=b.projectile||'bullet',ang=Math.atan2(b.vy,b.vx),ux=Math.cos(ang),uy=Math.sin(ang),x=b.x,y=b.y;
  ctx.save();
  if(p==='bullet'){ctx.fillStyle='#f3e4a7';ctx.beginPath();ctx.arc(x,y,1.35,0,TAU);ctx.fill();}
  else if(p==='tracer'){ctx.strokeStyle='rgba(247,197,74,.40)';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(x-ux*7,y-uy*7);ctx.lineTo(x,y);ctx.stroke();ctx.strokeStyle='#fff0ad';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-ux*4,y-uy*4);ctx.lineTo(x,y);ctx.stroke();}
  else if(p==='heavy'){ctx.strokeStyle='#f6d879';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x-ux*8,y-uy*8);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle='#fff3bb';ctx.beginPath();ctx.arc(x,y,1.6,0,TAU);ctx.fill();}
  else if(p==='shell'||p==='howitzer'){ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle='#171c18';roundRect(ctx,-5,-2.6,10,5.2,2);ctx.fill();ctx.fillStyle=p==='howitzer'?'#9a7a50':'#6d786d';roundRect(ctx,-3.7,-1.8,7.4,3.6,1.4);ctx.fill();ctx.fillStyle='#d8d3a7';ctx.fillRect(2.2,-.8,2.2,1.6);}
  else{ctx.strokeStyle='rgba(91,229,255,.42)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-ux*14,y-uy*14);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle='#6fe9ff';ctx.beginPath();ctx.arc(x,y,3.1,0,TAU);ctx.fill();ctx.fillStyle='#e283ff';ctx.beginPath();ctx.arc(x-.7,y-.7,1.4,0,TAU);ctx.fill();}
  ctx.restore();
}
function drawSpecialProjectile(b){
  var lvl=b.visual||0,z=b.z||0,x=b.x,y=b.y-z,ang=Math.atan2(b.vy,b.vx)+b.traveled*.035;ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  if(lvl<4){var gr=2.8+lvl*.25;ctx.fillStyle='#45463b';ctx.beginPath();ctx.arc(0,0,gr,0,TAU);ctx.fill();ctx.strokeStyle='#1c211d';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#6b684f';ctx.fillRect(-1,-gr-2,2,2.4);}
  else if(lvl<8){ctx.fillStyle='#8c7b5a';ctx.fillRect(-5,-1.3,8,2.6);ctx.fillStyle='#c3c4b3';ctx.beginPath();ctx.moveTo(2,-3.2);ctx.lineTo(7,0);ctx.lineTo(2,3.2);ctx.closePath();ctx.fill();ctx.strokeStyle='#20241f';ctx.lineWidth=.8;ctx.stroke();}
  else if(lvl<12){var long=lvl===11?14:11;ctx.fillStyle='#3f493d';ctx.fillRect(-long*.55,-2.2,long,4.4);ctx.fillStyle='#6f765d';ctx.beginPath();ctx.moveTo(long*.45,-2.8);ctx.lineTo(long*.70,0);ctx.lineTo(long*.45,2.8);ctx.closePath();ctx.fill();ctx.fillStyle='#c98936';ctx.beginPath();ctx.moveTo(-long*.58,-1.6);ctx.lineTo(-long*.84,0);ctx.lineTo(-long*.58,1.6);ctx.fill();}
  else if(lvl<18){var mr=3.5+(lvl-12)*.18;ctx.fillStyle='#3d4438';ctx.beginPath();ctx.arc(0,0,mr,0,TAU);ctx.fill();ctx.strokeStyle='#1b201c';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#a69b67';ctx.fillRect(-1,-mr-2.8,2,3.2);}
  else{ctx.fillStyle='#3c463a';ctx.fillRect(-6,-2.2,12,4.4);ctx.fillStyle='#727b63';ctx.beginPath();ctx.moveTo(6,-2.8);ctx.lineTo(10,0);ctx.lineTo(6,2.8);ctx.closePath();ctx.fill();ctx.fillStyle='#9b6841';ctx.fillRect(-7,-1.2,2,2.4);}
  ctx.restore();
}
function drawShots(){
  for(var i=0;i<gameState.shots.length;i++){
    var b=gameState.shots[i];if(b.kind==='mg')drawPrimaryProjectile(b);else drawSpecialProjectile(b);
  }
  for(i=0;i<gameState.enemyShots.length;i++){
    b=gameState.enemyShots[i];
    if(b.kind==='rocket'){
      var ra=Math.atan2(b.vy,b.vx),rx=Math.cos(ra),ry=Math.sin(ra);
      ctx.strokeStyle='rgba(205,210,197,.48)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(b.x-rx*14,b.y-ry*14);ctx.lineTo(b.x-rx*4,b.y-ry*4);ctx.stroke();
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(ra);ctx.fillStyle='#2b3329';ctx.fillRect(-5,-2,10,4);ctx.fillStyle='#d79a45';ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(-10,0);ctx.lineTo(-6,2);ctx.fill();ctx.restore();
    }else{ctx.strokeStyle=b.kind==='grenade'?'#d96a38':'#eee7cb';ctx.lineWidth=b.kind==='grenade'?2.4:1.2;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();}
  }
}

function drawBunkerDamageOverlay(b){
  var frac=clamp(b.hp/b.maxHp,0,1),hpSteps=Math.ceil(frac*10),damage=10-hpSteps;
  if(damage<=0)return;
  ctx.save();ctx.translate(b.x,b.y);
  ctx.strokeStyle='rgba(35,27,22,.80)';ctx.fillStyle='rgba(35,27,22,.50)';ctx.lineWidth=1.2;
  for(var i=0;i<damage;i++){
    var a=(i*2.17+.6),rr=7+(i%4)*4,x=Math.cos(a)*rr,y=Math.sin(a)*rr*.58;
    ctx.beginPath();ctx.arc(x,y,1.2+(i%3)*.45,0,TAU);ctx.fill();
    if(i>=2){ctx.beginPath();ctx.moveTo(x-2,y-1);ctx.lineTo(x+2,y+2);ctx.lineTo(x-1,y+4);ctx.stroke();}
  }
  if(damage>=4){
    ctx.globalAlpha=.42;ctx.strokeStyle='#bdb6a1';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-16,9);ctx.lineTo(-10,4);ctx.lineTo(-5,8);ctx.moveTo(12,10);ctx.lineTo(7,5);ctx.lineTo(3,9);ctx.stroke();
  }
  if(damage>=6){
    var puff=.55+.18*Math.sin(gameState.time*2.4);
    ctx.globalAlpha=puff*.45;ctx.fillStyle='#505650';
    ctx.beginPath();ctx.arc(-9,-15-(gameState.time%1.2)*4,3.5,0,TAU);ctx.fill();
    ctx.beginPath();ctx.arc(-4,-20-(gameState.time%1.2)*5,2.5,0,TAU);ctx.fill();
  }
  if(damage>=8){
    ctx.globalAlpha=.65;ctx.fillStyle='#d06a2f';
    ctx.beginPath();ctx.arc(8,6,1.6+Math.sin(gameState.time*9)*.5,0,TAU);ctx.fill();
  }
  ctx.restore();
}

function drawBunker(){
  var b=gameState.bunker,t=gameState.profile.playerTier,a=b.angle,kick=gameState.bunkerKick||0;
  ctx.save();ctx.translate(b.x-Math.cos(a)*kick,b.y-Math.sin(a)*kick);
  if(t===0){
    ctx.fillStyle='rgba(14,19,16,.30)';ctx.beginPath();ctx.ellipse(2,7,8,4,0,0,TAU);ctx.fill();
    ctx.fillStyle='#26382d';ctx.strokeStyle='#111713';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-4,5,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='#667a5c';ctx.beginPath();ctx.ellipse(0,3,6,8,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.rotate(a);
    var pl=gameState.save.upgrades.primary||0;
    if(pl===0){
      ctx.fillStyle='#68482f';ctx.fillRect(1,-1.8,18,3.6);ctx.fillStyle='#242a25';ctx.fillRect(8,-2.4,11,2.2);ctx.fillStyle='#b3b49f';ctx.fillRect(17,-1.3,5,1.4);
    }else{
      var gunLen=pl<7?17:pl<12?20:pl<16?23:27;ctx.fillStyle='#171d19';ctx.fillRect(2,-1.7,gunLen,3.4);ctx.fillStyle='#9ca78f';ctx.fillRect(2,-.55,Math.max(8,gunLen-5),1.1);
    }
  }else if(t===1){
    drawAtlas('bunkerPlayer',0,4,.72,0,1);drawAtlas('bunkerTurret',0,-2,.58,a,1);
  }else if(t===2){
    drawAtlas('bunkerPlayer',0,2,.88,0,1);drawAtlas('bunkerTurret',0,-2,.82,a,1);ctx.strokeStyle='#d1b766';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,1,20,Math.PI,TAU);ctx.stroke();
  }else if(t===3){
    drawAtlas('bunkerPlayer',0,0,1.04,0,1);drawAtlas('bunkerTurret',0,-2,1,a,1);ctx.strokeStyle='#6f8d7d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,25,0,TAU);ctx.stroke();
  }else if(t===4){
    drawAtlas('bunkerPlayer',0,0,1.08,0,1);drawAtlas('bunkerTurret',0,-2,1.08,a,1);ctx.globalAlpha=.78;ctx.strokeStyle='#55d5df';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,27,0,TAU);ctx.stroke();ctx.globalAlpha=.42;ctx.beginPath();ctx.arc(0,0,21,0,TAU);ctx.stroke();
  }else{
    drawAtlas('bunkerPlayer',0,0,1.12,0,1);drawAtlas('bunkerTurret',0,-2,1.14,a,1);var pulse=.70+.18*Math.sin(gameState.time*7);
    ctx.globalAlpha=pulse;ctx.strokeStyle='#63ecff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,29,0,TAU);ctx.stroke();ctx.strokeStyle='#d26dff';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,23,0,TAU);ctx.stroke();
    ctx.rotate(a);ctx.fillStyle='#a9f7ff';ctx.beginPath();ctx.arc(19,0,4.5,0,TAU);ctx.fill();
  }
  ctx.restore();

  drawBunkerDamageOverlay(gameState.bunker);
}
function drawBunkerDamage(){
  var frac=clamp(gameState.bunker.hp/gameState.bunker.maxHp,0,1),step=Math.ceil(frac*10),n=10-step;if(n<=0)return;
  var b=gameState.bunker;ctx.save();ctx.translate(b.x,b.y);ctx.strokeStyle=n>=7?'#241b18':'#3b3227';ctx.lineWidth=1.1;ctx.globalAlpha=.35+Math.min(.45,n*.045);
  for(var i=0;i<Math.min(7,n);i++){var a=-2.7+i*.82,r=7+i*1.7;ctx.beginPath();ctx.moveTo(Math.cos(a)*4,Math.sin(a)*3);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r*.72);ctx.lineTo(Math.cos(a+.18)*(r+4),Math.sin(a+.18)*(r+4)*.72);ctx.stroke();}
  if(step<=5){ctx.globalAlpha=.18+(5-step)*.07;ctx.fillStyle='#2b302c';ctx.beginPath();ctx.arc(-7,-10,5+(5-step),0,TAU);ctx.fill();}
  if(step<=2){ctx.globalAlpha=.28;ctx.fillStyle='#171b18';ctx.fillRect(-12,7,8,3);ctx.fillRect(5,5,7,3);}
  ctx.restore();
}
function drawCrosshair(){
  if(gameState.mode!=='playing')return;
  var x=gameState.aim.x,y=gameState.aim.y,bloom=(7+gameState.heat*4)*(gameState.profile.aimStability||1),hit=gameState.hitMarker>0,pulse=gameState.hitPulse||0;
  ctx.save();
  ctx.strokeStyle='rgba(16,21,17,.70)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,bloom+1,0,TAU);ctx.stroke();
  ctx.strokeStyle=hit?'#ffd85e':'#f2efd8';ctx.lineWidth=1.35;ctx.beginPath();ctx.arc(x,y,bloom,0,TAU);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-14,y);ctx.lineTo(x-5,y);ctx.moveTo(x+5,y);ctx.lineTo(x+14,y);ctx.moveTo(x,y-14);ctx.lineTo(x,y-5);ctx.moveTo(x,y+5);ctx.lineTo(x,y+14);ctx.stroke();
  if(hit){
    var r=6+pulse*3;ctx.strokeStyle='#fff0a8';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x-r,y-r);ctx.lineTo(x-2,y-2);ctx.moveTo(x+r,y-r);ctx.lineTo(x+2,y-2);ctx.moveTo(x-r,y+r);ctx.lineTo(x-2,y+2);ctx.moveTo(x+r,y+r);ctx.lineTo(x+2,y+2);ctx.stroke();
    ctx.fillStyle='#ffd85e';ctx.font='900 9px system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillText('HIT',x,y+bloom+15);
  }
  ctx.restore();
}
function effColor(){return gameState.eff>=.86?'#89b766':gameState.eff>=.70?'#b0b46d':gameState.eff>=.50?'#e3bc58':gameState.eff>=.30?'#db793c':'#bb4535';}
function drawHud(){
  var top=safeTop+9,bottom=H-safeBottom-14,L=level();
  ctx.save();ctx.textBaseline='middle';ctx.fillStyle='rgba(22,28,23,.90)';ctx.strokeStyle='rgba(236,231,202,.42)';ctx.lineWidth=1.5;
  roundRect(ctx,9,top,W-18,54,8);ctx.fill();ctx.stroke();
  ctx.font='800 12px system-ui,-apple-system,sans-serif';ctx.fillStyle='#f3efd8';ctx.textAlign='left';ctx.fillText('HP '+Math.max(0,Math.round(gameState.bunker.hp))+'/'+Math.round(gameState.bunker.maxHp),18,top+16);
  ctx.textAlign='center';ctx.fillStyle=effColor();ctx.fillText('EFF '+Math.round(gameState.eff*100)+'%',W*.5,top+16);
  ctx.textAlign='right';ctx.fillStyle='#f3efd8';ctx.fillText('KILLS '+(gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills),W-18,top+16);
  ctx.font='700 10px system-ui,-apple-system,sans-serif';ctx.textAlign='left';ctx.fillStyle='#bdc8ae';ctx.fillText('MAP '+(gameState.levelIndex+1)+'/40 · '+L.name.toUpperCase()+' · '+(gameState.encounterName||'CONTACT'),18,top+36);ctx.textAlign='right';ctx.fillText(gameState.profile.primaryName+' · '+gameState.profile.specialName,W-18,top+36);
  var hpFrac=clamp(gameState.bunker.hp/gameState.bunker.maxHp,0,1),hpSteps=Math.ceil(hpFrac*10),segX=18,segY=top+25,segW=7,segGap=2;
  for(var hs=0;hs<10;hs++){ctx.fillStyle=hs<hpSteps?(hpSteps>6?'#86b563':hpSteps>3?'#e1b956':'#c9583e'):'#202620';roundRect(ctx,segX+hs*(segW+segGap),segY,segW,5,2);ctx.fill();}
  ctx.font='700 8px system-ui,-apple-system,sans-serif';ctx.fillStyle='#aeb9a4';ctx.textAlign='left';ctx.fillText(hpSteps+'/10',segX+92,segY+3);
  var bx=W*.5-42,by=top+45,bw=84;ctx.fillStyle='#0f1411';roundRect(ctx,bx,by,bw,5,3);ctx.fill();ctx.fillStyle=effColor();roundRect(ctx,bx+1,by+1,Math.max(1,(bw-2)*gameState.eff),3,2);ctx.fill();

  ctx.fillStyle='rgba(22,28,23,.90)';ctx.strokeStyle='rgba(236,231,202,.36)';roundRect(ctx,12,bottom-35,W-24,27,7);ctx.fill();ctx.stroke();
  ctx.textAlign='left';ctx.font='800 10px system-ui,-apple-system,sans-serif';ctx.fillStyle=gameState.overheat?'#d95e42':'#d9ddc4';ctx.fillText(gameState.primaryReloadT>0?'RELOAD '+gameState.primaryReloadT.toFixed(1)+'s':gameState.profile.primaryName+' '+gameState.primaryAmmo+'/'+gameState.profile.primaryMag,21,bottom-22);
  ctx.fillStyle='#0e1210';roundRect(ctx,64,bottom-27,W-92,8,4);ctx.fill();ctx.fillStyle=gameState.heat>.75?'#d95e42':'#e0b957';roundRect(ctx,65,bottom-26,Math.max(1,(W-94)*gameState.heat),6,3);ctx.fill();

  if(gameState.pointer.down){
    var hold=(performance.now()-gameState.pointer.t0)/1000*gameState.profile.chargeScale,charge=clamp(hold/HE_HOLD,0,1),label=gameState.pointer.heFired?'HE!':hold<.16?'MG':'HE';
    ctx.textAlign='right';ctx.fillStyle=hold<.16?'#f0ecd6':'#f09642';ctx.fillText(gameState.pointer.heFired?gameState.profile.specialName:(hold<.16?gameState.profile.primaryName:gameState.profile.specialName),W-21,bottom-22);ctx.fillStyle='#111612';roundRect(ctx,W-84,bottom-14,62,4,2);ctx.fill();ctx.fillStyle='#ef8a3a';roundRect(ctx,W-83,bottom-13,60*charge,2,1);ctx.fill();
  }
  if(gameState.streak>1&&gameState.streakT>0){
    ctx.textAlign='left';ctx.fillStyle='#f0c75d';ctx.fillText('STREAK '+gameState.streak,20,bottom-5);
    if(gameState.streak>=5){ctx.textAlign='right';ctx.fillStyle='#ffffff';ctx.fillText('FOCUS +'+Math.round((combatFocus()-1)*100)+'%',W-20,bottom-5);}
  }
  if(gameState.messageT>0){
    var my=top+62;ctx.fillStyle='rgba(22,28,23,.92)';ctx.strokeStyle='#e6be55';roundRect(ctx,W*.5-82,my,164,22,7);ctx.fill();ctx.stroke();
    ctx.textAlign='center';ctx.fillStyle='#f1cc63';ctx.font='800 11px system-ui,-apple-system,sans-serif';ctx.fillText(gameState.message,W*.5,my+11);
  }
  ctx.restore();
}
/* ---------- RENDER ---------- */

function render(){
  if(!gameState)return;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=true;
  var shake=gameState.shake||0,sx=shake?rand(-shake,shake):0,sy=shake?rand(-shake,shake):0;
  ctx.save();ctx.translate(sx,sy);
  drawMap();drawFireZones();

  var i,v,e,a,p;
  for(i=0;i<gameState.vehicles.length;i++){v=gameState.vehicles[i];if(v.alive&&v.x>-80&&v.x<W+80&&v.y>-90&&v.y<H+90){var vm=clamp((v.currentSpeed||0)/Math.max(1,v.speed||1),0,1),vb=Math.sin((v.wheelT||0)*.72)*.55*vm,vr=clamp((v.sideVel||0)/Math.max(12,v.currentSpeed||12),-.035,.035);ctx.save();ctx.translate(v.x,v.y);ctx.rotate(vr);ctx.translate(0,vb);ctx.translate(-v.x,-v.y);drawVehicle(v,false);ctx.restore();}}
  for(i=0;i<gameState.infantry.length;i++){e=gameState.infantry[i];if(e.x>-40&&e.x<W+40&&e.y>-50&&e.y<H+50)drawSoldier(e);}
  for(i=0;i<gameState.air.length;i++){a=gameState.air[i];if(a.alive&&a.x>-110&&a.x<W+110&&a.y>-110&&a.y<H+110){if(a.type==='heli')drawHeli(a);else drawPlane(a);}}
  for(i=0;i<gameState.paras.length;i++){p=gameState.paras[i];if(p.alive)drawPara(p);}
  drawShots();drawEffects();drawBunker();drawBunkerDamage();
  ctx.restore();

  if((gameState.screenFlash||0)>0){
    ctx.globalAlpha=gameState.screenFlash;ctx.fillStyle='#ffb04a';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
  }
  drawCrosshair();drawHud();
}
/* ---------- RESIZE / LOOP ---------- */

function resize(){
  readSafe();W=Math.max(320,innerWidth);H=Math.max(480,innerHeight);DPR=Math.min(window.devicePixelRatio||1,DEVICE.dprCap);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=true;
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