(function(){
'use strict';

/* =========================
   JBD V8.4.18 CLEAN CACHE TEST
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
var SAVE_KEY='jbd_v8_4_18_clean_cache_test_save';
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
  {name:'KAR 98K',era:1935,cls:'bolt rifle',ammo:'7.92 rifle',mag:5,reload:1.85,cycle:.72,damage:15,range:.62,speed:720,burst:1,gap:.72,spread:.82,projectile:'bullet',splash:0,homing:0},
  {name:'M1 GARAND',era:1936,cls:'semi-auto rifle',ammo:'.30 rifle',mag:8,reload:1.45,cycle:.26,damage:14,range:.65,speed:760,burst:1,gap:.26,spread:.76,projectile:'bullet',splash:0,homing:0},
  {name:'STG 44',era:1944,cls:'assault rifle',ammo:'intermediate',mag:30,reload:1.85,cycle:.105,damage:10,range:.58,speed:650,burst:3,gap:.105,spread:.82,projectile:'tracer',splash:0,homing:0},
  {name:'AKM',era:1959,cls:'assault rifle',ammo:'intermediate',mag:30,reload:1.75,cycle:.095,damage:10.8,range:.61,speed:670,burst:3,gap:.095,spread:.78,projectile:'tracer',splash:0,homing:0},
  {name:'FN FAL',era:1953,cls:'battle rifle',ammo:'full-power rifle',mag:20,reload:1.80,cycle:.16,damage:13.5,range:.68,speed:760,burst:2,gap:.16,spread:.68,projectile:'bullet',splash:0,homing:0},
  {name:'M16A1',era:1967,cls:'assault rifle',ammo:'small-caliber rifle',mag:20,reload:1.60,cycle:.085,damage:9.8,range:.70,speed:810,burst:3,gap:.085,spread:.62,projectile:'tracer',splash:0,homing:0},
  {name:'G3A3',era:1960,cls:'battle rifle',ammo:'full-power rifle',mag:20,reload:1.85,cycle:.12,damage:14.2,range:.72,speed:790,burst:2,gap:.12,spread:.60,projectile:'bullet',splash:0,homing:0},
  {name:'M249 SAW',era:1984,cls:'light machine gun',ammo:'belt',mag:80,reload:2.55,cycle:.078,damage:9.5,range:.74,speed:790,burst:5,gap:.078,spread:.72,projectile:'tracer',splash:0,homing:0},
  {name:'PKM',era:1961,cls:'general-purpose MG',ammo:'belt',mag:80,reload:2.70,cycle:.072,damage:11.5,range:.77,speed:800,burst:5,gap:.072,spread:.68,projectile:'tracer',splash:0,homing:0},
  {name:'M240B',era:1977,cls:'general-purpose MG',ammo:'belt',mag:100,reload:2.85,cycle:.075,damage:12.2,range:.80,speed:820,burst:6,gap:.075,spread:.64,projectile:'tracer',splash:0,homing:0},
  {name:'M2 BROWNING',era:1933,cls:'heavy machine gun',ammo:'heavy belt',mag:100,reload:3.00,cycle:.13,damage:23,range:.84,speed:860,burst:4,gap:.13,spread:.58,projectile:'heavy',splash:0,homing:0},
  {name:'20MM AUTOCANNON',era:1950,cls:'autocannon',ammo:'20mm',mag:40,reload:2.85,cycle:.13,damage:30,range:.88,speed:900,burst:3,gap:.13,spread:.54,projectile:'shell',splash:5,homing:0},
  {name:'25MM CHAIN GUN',era:1981,cls:'autocannon',ammo:'25mm',mag:35,reload:3.00,cycle:.16,damage:38,range:.92,speed:920,burst:3,gap:.16,spread:.50,projectile:'shell',splash:7,homing:0},
  {name:'30MM AUTOCANNON',era:1980,cls:'autocannon',ammo:'30mm',mag:30,reload:3.10,cycle:.18,damage:48,range:.96,speed:930,burst:2,gap:.18,spread:.46,projectile:'shell',splash:9,homing:0},
  {name:'40MM CTA CANNON',era:2010,cls:'medium cannon',ammo:'40mm',mag:20,reload:3.00,cycle:.24,damage:62,range:1.00,speed:900,burst:2,gap:.24,spread:.42,projectile:'shell',splash:12,homing:0},
  {name:'57MM RAPID GUN',era:2015,cls:'rapid cannon',ammo:'57mm',mag:12,reload:2.80,cycle:.40,damage:82,range:1.04,speed:870,burst:1,gap:.40,spread:.36,projectile:'shell',splash:16,homing:0},
  {name:'105MM LIGHT GUN',era:1990,cls:'field gun',ammo:'105mm',mag:4,reload:2.20,cycle:.75,damage:110,range:1.08,speed:720,burst:1,gap:.75,spread:.28,projectile:'howitzer',splash:21,homing:0},
  {name:'M119 HOWITZER',era:1989,cls:'105mm howitzer',ammo:'105mm HE',mag:3,reload:2.35,cycle:.90,damage:132,range:1.12,speed:680,burst:1,gap:.90,spread:.24,projectile:'howitzer',splash:25,homing:0},
  {name:'M777 SMART 155',era:2005,cls:'155mm smart howitzer',ammo:'guided 155mm',mag:2,reload:2.55,cycle:1.10,damage:165,range:1.18,speed:650,burst:1,gap:1.10,spread:.18,projectile:'guided',splash:31,homing:.055},
  {name:'HYPER SEEKER 155',era:2045,cls:'autonomous smart howitzer',ammo:'seeker shell',mag:3,reload:2.10,cycle:.80,damage:205,range:1.28,speed:740,burst:1,gap:.80,spread:.10,projectile:'guided',splash:38,homing:.095}
];
var SPECIAL_DB=[
  {name:'M24 HANDGRENAAT',effect:'blast',damage:18,blast:22,radius:15,range:.22,speed:155,duration:0,dps:0},
  {name:'FRAG GRENADE',effect:'blast',damage:20,blast:27,radius:18,range:.24,speed:160,duration:0,dps:0},
  {name:'RIFLE GRENADE',effect:'blast',damage:23,blast:31,radius:20,range:.29,speed:185,duration:0,dps:0},
  {name:'40MM GRENADE',effect:'blast',damage:27,blast:36,radius:22,range:.34,speed:200,duration:0,dps:0},
  {name:'40MM HEDP',effect:'blast',damage:31,blast:43,radius:24,range:.37,speed:215,duration:0,dps:0},
  {name:'60MM MORTAR',effect:'blast',damage:38,blast:52,radius:27,range:.41,speed:205,duration:0,dps:0},
  {name:'81MM MORTAR',effect:'blast',damage:46,blast:62,radius:30,range:.45,speed:210,duration:0,dps:0},
  {name:'120MM MORTAR',effect:'blast',damage:58,blast:76,radius:34,range:.49,speed:215,duration:0,dps:0},
  {name:'INCENDIARY 40MM',effect:'fire',damage:12,blast:0,radius:22,range:.39,speed:210,duration:4.5,dps:12},
  {name:'MOLOTOV',effect:'fire',damage:8,blast:0,radius:24,range:.32,speed:175,duration:5.4,dps:15},
  {name:'NAPALM CANISTER',effect:'fire',damage:14,blast:0,radius:28,range:.44,speed:205,duration:6.4,dps:19},
  {name:'THERMITE CHARGE',effect:'fire',damage:18,blast:0,radius:25,range:.42,speed:195,duration:7.2,dps:25},
  {name:'RECOILLESS HE',effect:'blast',damage:70,blast:86,radius:36,range:.57,speed:300,duration:0,dps:0},
  {name:'GUIDED ROCKET',effect:'blast',damage:82,blast:96,radius:39,range:.64,speed:340,duration:0,dps:0},
  {name:'SMART MORTAR',effect:'blast',damage:88,blast:108,radius:42,range:.70,speed:320,duration:0,dps:0},
  {name:'SEEKER MISSILE',effect:'plasma',damage:98,blast:116,radius:44,range:.78,speed:390,duration:4.2,dps:26},
  {name:'PRECISION SHELL',effect:'plasma',damage:110,blast:130,radius:47,range:.86,speed:430,duration:4.6,dps:30},
  {name:'DRONE MUNITION',effect:'plasma',damage:120,blast:142,radius:50,range:.94,speed:470,duration:5.0,dps:34},
  {name:'ION SEEKER',effect:'plasma',damage:136,blast:158,radius:54,range:1.02,speed:520,duration:5.5,dps:40},
  {name:'HYPER SEEKER ORB',effect:'plasma',damage:155,blast:180,radius:60,range:1.12,speed:580,duration:6.0,dps:48}
];
function weaponUpgradeCost(kind,lvl){return lvl>=MAX_WEAPON_LEVEL?null:1;}
function primaryStats(lvl){
  lvl=clamp(lvl|0,0,MAX_WEAPON_LEVEL);var w=PRIMARY_DB[lvl];
  return {name:w.name,damage:w.damage,speed:w.speed,rangeFactor:w.range,spread:w.spread,burst:w.burst,burstGap:w.gap,heatScale:Math.max(.28,1-lvl*.035),cool:.24+lvl*.034,visual:lvl,mag:w.mag,reload:w.reload,cycle:w.cycle,projectile:w.projectile,splash:w.splash||0,homing:w.homing||0,era:w.era,cls:w.cls,ammo:w.ammo};
}
function specialStats(lvl){
  lvl=clamp(lvl|0,0,MAX_WEAPON_LEVEL);var w=SPECIAL_DB[lvl],t=lvl/MAX_WEAPON_LEVEL;
  return {name:w.name,impact:w.damage,blast:w.blast,radius:w.radius,duration:w.duration,dps:w.dps,speed:w.speed,rangeFactor:w.range,chargeScale:1+t*1.25,heatScale:Math.max(.48,1-t*.52),plasma:w.effect==='plasma',effect:w.effect,visual:lvl,arcHeight:13+w.range*40};
}
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

function purgeOldJbdSaves(){
  try{
    var keep=SAVE_KEY,remove=[];
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(k&&k.indexOf('jbd_')===0&&k!==keep)remove.push(k);
    }
    for(i=0;i<remove.length;i++)localStorage.removeItem(remove[i]);
  }catch(e){}
}
purgeOldJbdSaves();
function defaultSave(){
  return {supply:0,arsenalPoints:0,bestLevel:0,upgrades:{primary:0,special:0,aiming:0,reload:0,armor:0}};
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
    return v;
  }catch(e){return defaultSave();}
}
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(gameState.save));}catch(e){}}

function playerProfile(){
  var u=gameState.save.upgrades,p=primaryStats(u.primary||0),sp=specialStats(u.special||0),tier=arsenalTier();
  var aimLvl=u.aiming||0,reloadLvl=u.reload||0,armorLvl=u.armor||0;
  var stability=Math.max(.52,1-aimLvl*.09);
  var reloadMult=Math.max(.90,1.35-reloadLvl*.09);
  var armorSkill=Math.max(.70,1-armorLvl*.045);
  return {
    maxHp:(86+tier*18+armorLvl*16)*(IS_IPHONE?1.10:1),
    armorScale:Math.max(.52,Math.max(.72,1-tier*.055)*armorSkill),
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
  var REC_URLS={kar98:'../v8_5_0_local_combat_audio/audio/gunshot_sniper.wav?v=8418',rifle0:'../v8_5_0_local_combat_audio/audio/gun_rifle_0.wav?v=8418',rifle1:'../v8_5_0_local_combat_audio/audio/gun_rifle_1.wav?v=8418',rifle2:'../v8_5_0_local_combat_audio/audio/gun_rifle_2.wav?v=8418',smg0:'../v8_5_0_local_combat_audio/audio/gun_smg_0.wav?v=8418',rifle762:BASE+'rifle_762.mp3',rifle556:BASE+'rifle_556.mp3',smg:BASE+'smg_9mm.mp3',shotgun:BASE+'shotgun_12ga.mp3'};
  function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  function clamp1(v){return Math.max(-1,Math.min(1,v));}
  function env(t,d,a,r){if(t<a)return t/Math.max(.001,a);var q=(t-a)/Math.max(.001,d-a);return Math.pow(Math.max(0,1-q),r||2);}
  function osc(type,phase){var p=phase-Math.floor(phase);if(type==='tri')return 1-4*Math.abs(p-.5);return Math.sin(phase*TAU);}
  function procData(kind){
    var dur=kind==='deepCannon'?.58:kind==='deepShot'?.30:kind==='karCrack'?.115:kind==='hitconfirm'?.13:kind==='heli'?.60:kind==='engine'?.27:kind==='tire'?.62:kind==='glass'?.24:kind==='door'?.16:.18;
    var n=Math.max(32,Math.floor(SR*dur)),a=new Float32Array(n);
    for(var i=0;i<n;i++){
      var t=i/SR,e=env(t,dur,.001,kind==='deepCannon'?2.0:2.8),v=0;
      if(kind==='deepShot'){
        v=(osc('sin',t*(96-34*t/dur))*.78+osc('sin',t*(151-51*t/dur))*.34)*e;
        if(t<.010)v+=osc('tri',t*1450)*(1-t/.010)*.18;
      }else if(kind==='karCrack'){
        var p=Math.max(0,1-t/dur);
        v=osc('tri',t*(2700-1050*t/dur))*.34*Math.pow(p,4)+osc('sin',t*820)*.21*Math.pow(p,2)+osc('sin',t*145)*.16*p;
      }else if(kind==='deepCannon'){
        v=(osc('sin',t*(62-25*t/dur))*.95+osc('sin',t*(102-38*t/dur))*.45+osc('sin',t*34)*.22)*e;
      }else if(kind==='hitconfirm'){
        var q=Math.max(0,1-t/dur);v=osc('sin',t*235)*.40*q+osc('sin',t*940)*.24*Math.pow(q,3);
      }else if(kind==='tire'){
        var hiss=(rnd()*2-1),te=Math.pow(Math.max(0,1-t/dur),.70);v=hiss*.72*te+osc('sin',t*210)*.04*te;
      }else if(kind==='glass'){
        var ge=Math.pow(Math.max(0,1-t/dur),2.6),spark=Math.max(0,Math.sin(t*TAU*(2400+900*Math.sin(t*29))));
        v=(rnd()*2-1)*.22*ge+spark*.23*ge;
      }else if(kind==='door'){
        var d1=Math.max(0,1-Math.abs(t-.035)/.027);v=osc('sin',t*190)*.50*d1+osc('tri',t*720)*.15*d1;
      }else if(kind==='heli'){
        var beat=.52+.48*Math.sin(TAU*t*12.2);v=(osc('sin',t*45)*.25+osc('sin',t*90)*.10)*beat*e;
      }else if(kind==='engine'){
        var pulse=.50+.50*Math.max(0,Math.sin(TAU*t*10.2));v=(osc('sin',t*52)*.25+osc('sin',t*104)*.09)*pulse*e;
      }
      v=Math.tanh(v*1.12);a[i]=clamp1(v*.82);
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
  function build(){
    if(ready)return;ready=true;
    ['deepShot','karCrack','deepCannon','hitconfirm','heli','engine','tire','glass','door'].forEach(function(k){
      if(window.Howl)proc[k]=new Howl({src:[wavURI(procData(k))],format:['wav'],preload:true,volume:1,pool:10});
    });
    if(window.Howl)Object.keys(REC_URLS).forEach(function(k){
      var u=REC_URLS[k],fmt=/\.wav(?:\?|$)/i.test(u)?'wav':/\.ogg(?:\?|$)/i.test(u)?'ogg':'mp3';
      var isLocalRifle=(k==='kar98'||k==='rifle0'||k==='rifle1'||k==='rifle2');
      var opts={src:[u],format:[fmt],preload:true,html5:false,pool:k==='smg'?12:8};
      // These source WAVs contain several reports. Only expose the first ~210 ms as "single".
      if(isLocalRifle)opts.sprite={single:[0,210]};
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
    'KAR 98K':{key:'rifle0',rate:.93,vol:1.00,single:true,bolt:true},
    'M1 GARAND':{key:'rifle1',rate:1.00,vol:.98,single:true},
    'STG 44':{key:'rifle1',rate:.98,vol:.96},
    'AKM':{key:'rifle2',rate:.97,vol:.96},
    'FN FAL':{key:'rifle0',rate:.94,vol:.98,single:true},
    'M16A1':{key:'rifle1',rate:1.05,vol:.92},
    'G3A3':{key:'rifle0',rate:.92,vol:.98,single:true},
    'M249 SAW':{key:'smg0',rate:1.02,vol:.90,machine:true},
    'PKM':{key:'smg0',rate:.94,vol:.94,machine:true},
    'M240B':{key:'smg0',rate:.98,vol:.96,machine:true},
    'M2 BROWNING':{key:'rifle762',rate:.72,vol:1.00,machine:true,heavy:true},
    '20MM AUTOCANNON':{key:'shotgun',rate:.82,vol:1.00,cannon:true},
    '25MM CHAIN GUN':{key:'shotgun',rate:.78,vol:1.00,cannon:true},
    '30MM AUTOCANNON':{key:'shotgun',rate:.74,vol:1.00,cannon:true},
    '40MM CTA CANNON':{key:'shotgun',rate:.68,vol:1.00,cannon:true},
    '57MM RAPID GUN':{key:'shotgun',rate:.62,vol:1.00,cannon:true},
    '105MM LIGHT GUN':{key:'shotgun',rate:.54,vol:1.00,cannon:true},
    'M119 HOWITZER':{key:'shotgun',rate:.50,vol:1.00,cannon:true},
    'M777 SMART 155':{key:'shotgun',rate:.46,vol:1.00,cannon:true},
    'HYPER SEEKER 155':{key:'shotgun',rate:.44,vol:1.00,cannon:true}
  };
  function weaponSample(){
    var name=gameState&&gameState.profile?gameState.profile.primaryName:'KAR 98K';
    return WEAPON_SOUND_DB[name]||{key:'rifle1',rate:1,vol:.94};
  }
  function play(kind,volume,opts){
    build();opts=opts||{};var now=performance.now(),minGap=kind==='mg'?24:kind==='enemy'?55:kind==='engine'?95:8;
    if(lastPlay[kind]&&now-lastPlay[kind]<minGap)return;lastPlay[kind]=now;
    var pan=opts.pan==null?(rnd()*.08-.04):opts.pan,vol=volume==null?1:volume;
    if(kind==='mg'){
      var ws=weaponSample(),rate=(opts.rate||ws.rate)*(.995+rnd()*.010);
      if(ws.single){
        var nnow=performance.now();
        if(nnow-lastPrimaryAudio<120)return;
        lastPrimaryAudio=nnow;
      }
      // Firearm database: one shot event = one weapon sample. Burst behavior comes from the game queue,
      // never from using an MG sound for a semi-auto rifle.
      if(ws.cannon){
        if(ws.key&&rec[ws.key])playHowl(rec[ws.key],Math.min(1,vol*ws.vol),rate,pan);
        procPlay('deepCannon',Math.min(.52,vol*.40),.90,pan);
      }else if(ws.key&&rec[ws.key]){
        if(ws.single)playSingle(rec[ws.key],Math.min(1,vol*ws.vol),rate,pan);
        else playHowl(rec[ws.key],Math.min(1,vol*ws.vol),rate,pan);
      }else{
        playHowl(rec.rifle0,Math.min(1,vol),1,pan);
      }
      return;
    }
    if(kind==='enemy'){procPlay('karCrack',Math.min(.20,vol*.32),.94+rnd()*.08,pan);return;}
    if(kind==='boom'){procPlay('deepCannon',Math.min(.96,vol*.90),.82,pan);return;}
    if(kind==='he'){procPlay('deepCannon',Math.min(.38,vol*.30),1.10,pan);return;}
    if(kind==='hit'||kind==='metal'||kind==='driver'){procPlay('hitconfirm',Math.min(.52,vol*.52),kind==='metal'?.82:1,pan);return;}
    if(kind==='tire'){procPlay('tire',Math.min(1,vol),1,pan);return;}
    if(kind==='glass'){procPlay('glass',Math.min(1,vol),1,pan);return;}
    if(kind==='door'){procPlay('door',Math.min(.82,vol),1,pan);return;}
    if(kind==='engine'||kind==='heli'){procPlay(kind,vol,opts.rate||1,pan);return;}
    // No synthetic clock-like bolt/reload ticks.
  }
  var api={
    unlock:function(){build();unlocked=true;unlockCtx();},
    preload:function(){build();},
    tone:function(kind,volume,opts){if(!unlocked)this.unlock();play(kind,volume,opts);},
    after:function(ms,kind,volume,opts){setTimeout(function(){play(kind,volume,opts);},ms);},
    enginePulse:function(volume){play('engine',volume==null?.24:volume,{rate:.94+rnd()*.10,pan:rnd()*.12-.06});},
    ambience:function(){},
    recordedMode:function(){return true;}
  };
  build();return api;
})();
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
  var L=level(),rng=seeded(L.seed+gameState.levelIndex*19),p=levelPalette(BASE_PALETTES[L.theme],L.stage);
  var stage=L.stage,roadX=W*([.49,.55,.45][stage]),bendX=roadX+([12,-18,20][stage]),junctionY=H*(.34+stage*.035);
  var leftCompound=(stage%2===0),compound={x:W*(leftCompound?.18:.82),y:H*(.38+stage*.025),w:70,h:46};
  var patches=[],cover=[],decor=[],trees=[],rocks=[],surface=[],setpieces=[],cid=1;
  var corridorHalf=Math.min(96,W*.245);

  var patchLayout=[[.14,.27,58,30],[.86,.30,58,28],[.15,.67,64,34],[.85,.72,66,34]];
  for(var i=0;i<patchLayout.length;i++){var q=patchLayout[i];patches.push({x:W*q[0],y:H*q[1],rx:q[2],ry:q[3],rot:(i%2?-.12:.10),a:.030});}

  var themeCover={
    jungle:[['sandbag','sandbagCurve'],['log','logPile'],['crate','crateStack'],['bush','bush2'],['rubble','boulder1'],['fence','woodFence']],
    desert:[['sandbag','sandbagStraight'],['crate','palletCargo'],['rubble','rubbleConcrete'],['barrel','barrelStack'],['lowwall','rubbleWall'],['fence','wireFence']],
    polar:[['sandbag','sandbagCurve'],['crate','crateStack'],['rubble','boulder2'],['log','timberPile'],['fence','wireFence'],['lowwall','rubbleWall']],
    village:[['lowwall','rubbleWall'],['crate','crateStack'],['fence','woodFence'],['sandbag','sandbagStraight'],['rubble','rubbleBrick'],['barrel','barrelStack']],
    industrial:[['crate','palletCargo'],['rubble','rubbleConcrete'],['barrel','barrelStack'],['fence','wireFence'],['lowwall','steelDebris'],['sandbag','sandbagStraight']]
  }[L.theme];

  var roadside=[
    [-1,46,.255,0,-.10],[ 1,48,.285,1,.12],
    [-1,66,.335,2,.08],[ 1,65,.365,3,-.12],
    [-1,48,.425,4,.10],[ 1,50,.455,5,-.09],
    [-1,72,.515,1,-.08],[ 1,70,.545,0,.11],
    [-1,50,.605,3,.12],[ 1,52,.635,2,-.10],
    [-1,68,.695,5,.06],[ 1,66,.725,4,-.08],
    [-1,47,.785,0,-.10],[ 1,49,.805,1,.10]
  ];
  var roadCount=Math.min(roadside.length,10+Math.floor(gameState.levelIndex/8));
  for(i=0;i<roadCount;i++){
    var rc=roadside[i],set=themeCover[rc[3]%themeCover.length];
    cover.push({id:cid++,x:clamp(roadX+rc[0]*rc[1],24,W-24),y:H*rc[2],kind:set[0],sprite:set[1],len:rc[0]<0?29:27,rot:rc[4],r:7,variant:i,roadside:true});
  }

  var edgeSet=L.theme==='industrial'?['steelDebris','wireFence','rubbleConcrete']:L.theme==='village'?['woodFence','rubbleBrick','crateStack']:L.theme==='desert'?['boulder2','wireFence','jerryStack']:['bush2','logPile','boulder1'];
  var edgeRows=[[.08,.31],[.92,.34],[.09,.50],[.91,.53],[.08,.70],[.92,.74]];
  for(i=0;i<edgeRows.length;i++)decor.push({x:W*edgeRows[i][0],y:H*edgeRows[i][1],type:edgeSet[i%edgeSet.length],rot:(i%2?-.12:.12),s:.72});

  var themeSets={jungle:['ambush','timber','defense','supply'],desert:['defense','supply','roadblock','rubble'],polar:['timber','defense','supply','rubble'],village:['roadblock','supply','timber','rubble'],industrial:['rubble','roadblock','supply','defense']}[L.theme];
  var setLayout=[[.11,.40],[.89,.44],[.12,.78],[.88,.69]],setUse=Math.min(4,2+Math.floor(gameState.levelIndex/8));
  for(i=0;i<setUse;i++)setpieces.push({x:W*setLayout[i][0],y:H*setLayout[i][1],type:themeSets[(i+stage)%themeSets.length],rot:(i%2?-.12:.12),flip:i%2?-1:1,s:.80});

  var edgeTrees=[[.05,.24],[.95,.23],[.05,.58],[.95,.59],[.05,.86],[.95,.84]];
  var treeUse=L.theme==='desert'?2:L.theme==='industrial'?3:5;
  for(i=0;i<treeUse;i++)trees.push({x:W*edgeTrees[i][0],y:H*edgeTrees[i][1],r:7+(i%3)*2,variant:i%5,dead:L.theme==='industrial'&&i%2===0});
  var rockLayout=[[.07,.39],[.93,.40],[.07,.64],[.93,.79]];
  for(i=0;i<3;i++)rocks.push({x:W*rockLayout[i][0],y:H*rockLayout[i][1],r:5+(i%2)*2,variant:i});

  surface.push({x:roadX,y:H*.43,type:'trackStraight',rot:0,s:.72,a:.16},{x:roadX+9,y:H*.62,type:'trackStraight',rot:0,s:.72,a:.14});
  if(gameState.levelIndex>=3)surface.push({x:roadX+corridorHalf*.72,y:H*.48,type:'gravel',rot:.1,s:.72,a:.19});
  if(gameState.levelIndex>=6)surface.push({x:roadX-corridorHalf*.74,y:H*.74,type:'scorch1',rot:-.2,s:.72,a:.18});

  gameState.map={palette:p,units:unitPalette(p),road:{x:roadX,bendX:bendX,junctionY:junctionY},compound:compound,patches:patches,cover:cover,decor:decor,trees:trees,rocks:rocks,surface:surface,setpieces:setpieces,corridorHalf:corridorHalf};
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
  gameState.time=0;gameState.levelTime=0;gameState.levelComplete=false;
  gameState.bunker.x=W*.5;gameState.bunker.y=H-Math.max(72,safeBottom+52);
  gameState.bunker.maxHp=gameState.profile.maxHp;gameState.bunker.hp=gameState.profile.maxHp;
  gameState.primaryAmmo=gameState.profile.primaryMag;gameState.primaryCooldown=0;gameState.primaryReloadT=0;
  gameState.heat=0;gameState.overheat=false;gameState.eff=.75;gameState.hitMarker=0;gameState.hitPulse=0;gameState.streak=0;gameState.streakT=0;gameState.message='';gameState.messageT=0;gameState.shake=0;gameState.screenFlash=0;gameState.hitStop=0;gameState.wave=0;
  gameState.stats={shots:0,hits:0,kills:0,vehicleKills:0,airKills:0,misses:0,damageTaken:0};
  gameState.infantry=[];gameState.vehicles=[];gameState.air=[];gameState.paras=[];gameState.shots=[];gameState.enemyShots=[];gameState.effects=[];gameState.craters=[];gameState.wrecks=[];gameState.blood=[];gameState.fireZones=[];gameState.burstQueue=[];gameState.pointer.down=false;gameState.pointer.heFired=false;
  buildMap();
  gameState.events=buildEncounterPlan();
  gameState.eventCursor=0;
  gameState.mode='playing';
}

/* ---------- ENCOUNTER DIRECTOR ---------- */

function buildEncounterPlan(){
  var idx=gameState.levelIndex,events=[];
  if(idx===0){
    events.push({t:.18,type:'trooptruck',count:2,wave:1});
    events.push({t:4.9,type:'trooptruck',count:2,wave:2});
    events.push({t:9.7,type:'trooptruck',count:2,wave:3});
    return events;
  }
  if(idx===1){
    events.push({t:.18,type:'trooptruck',count:2,wave:1});
    events.push({t:5.1,type:'trooptruck',count:2,wave:2});
    events.push({t:10.2,type:'trooptruck',count:3,wave:3});
    return events;
  }
  if(idx===2){
    events.push({t:.18,type:'trooptruck',count:3,wave:1});
    events.push({t:5.2,type:'trooptruck',count:3,wave:2});
    events.push({t:10.6,type:'trooptruck',count:3,wave:3});
    return events;
  }

  var time=.28,firstCount=idx<6?3:idx<10?4:idx<20?5:6;
  events.push({t:time,type:'trooptruck',count:firstCount,wave:1});
  for(var wave=1;wave<=3;wave++){
    if(wave>1)time+=idx<7?3.2:2.7;
    var encounters=idx<6?1:idx<15?2:3;
    for(var i=0;i<encounters;i++){
      var type='foot',count=idx<6?2:2+Math.min(4,Math.floor(idx/7)),roll=Math.random();
      if(idx<6){
        if(wave>1&&i===0&&Math.random()<.72){type='trooptruck';count=3;}
        else type='foot';
      }else{
        if(idx>=3&&roll>.74)type='jeep';
        if(idx>=6&&roll>.82)type='lighttruck';
        if(idx>=10&&roll>.88)type='truck';
        if(idx>=14&&roll>.94)type='heli';
        if(idx>=22&&roll>.965)type='plane';
      }
      if(type!=='foot'&&type!=='trooptruck')count=type==='heli'||type==='plane'?2:1;
      time+=(type==='foot'?.95:1.55)+Math.random()*.35;
      events.push({t:time,type:type,count:count,wave:wave});
    }
  }
  return events;
}
function processEvents(){
  while(gameState.eventCursor<gameState.events.length&&gameState.levelTime>=gameState.events[gameState.eventCursor].t){
    var e=gameState.events[gameState.eventCursor];
    if(e.wave&&e.wave!==gameState.wave){gameState.wave=e.wave;gameState.message='WAVE '+e.wave+'/3';gameState.messageT=.72;}
    var motor=e.type==='trooptruck'||e.type==='jeep'||e.type==='lighttruck'||e.type==='truck'||e.type==='halftrack';
    if(motor){
      var liveMotor=0;
      for(var v=0;v<gameState.vehicles.length;v++){var mv=gameState.vehicles[v];if(mv.alive&&mv.state!=='parked'&&mv.state!=='parkedDisabled'&&mv.state!=='disabled'&&!(mv.type==='trooptruck'&&mv.state==='depart'))liveMotor++;}
      if(liveMotor>=(gameState.levelIndex<18?1:2)){e.t+=.70;break;}
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
  var roadX=gameState.map.road.x,half=gameState.map.corridorHalf||92;
  var left=clamp(roadX-half*.80,30,W-30),right=clamp(roadX+half*.80,30,W-30);
  var tx=gameState.bunker.x,ty=gameState.bunker.y;
  if(e.tactic==='flankLeft'&&e.y<H*.62){tx=left;ty=H*.60;}
  else if(e.tactic==='flankRight'&&e.y<H*.62){tx=right;ty=H*.60;}
  else if(e.tactic==='split'&&e.y<H*.58){tx=e.slot%2?roadX+half*.52:roadX-half*.52;ty=H*.57;}
  else if(e.tactic==='bound'&&e.y<H*.60){tx=clamp(roadX+(e.slot%2?half*.42:-half*.42),35,W-35);ty=H*.60;}
  else if(e.tactic==='roadside'&&e.y<H*.58){tx=clamp(e.flankX,roadX-half*.82,roadX+half*.82);ty=H*.58;}
  return {x:clamp(tx,roadX-half,roadX+half),y:ty};
}
function squadIsMoving(e){
  if(e.tactic!=='bound')return true;
  var phase=Math.floor((gameState.time+e.squadPhase)/1.55)%2;
  return (e.slot%2)===phase;
}
function spawnInfantry(x,y,role,squad){
  role=role||['rifle','rifle','lmg','grenadier','marksman'][(Math.random()*5)|0];
  var baseHp=gameState.levelIndex===0?18:gameState.levelIndex===1?24:gameState.levelIndex===2?30:38;
  var hp=role==='lmg'?baseHp+8:role==='grenadier'?baseHp+5:role==='marksman'?Math.max(18,baseHp-2):baseHp;
  var speed=role==='lmg'?25:role==='grenadier'?26:role==='marksman'?26:28;
  var id=Math.random()*1e9|0;
  squad=squad||squadPlan(1,'direct',x);
  var roll=Math.random(),firePose=role==='marksman'?'prone':role==='lmg'?(roll<.74?'crouch':roll<.88?'prone':'stand'):(roll<.18?'prone':roll<.70?'stand':'crouch');
  var e={
    id:id,role:role,x:x==null?laneX(rand(-95,95)):x,y:y==null?safeTop+72-rand(0,35):y,
    hp:hp,maxHp:hp,speed:speed+gameState.levelIndex*.34,alive:true,
    state:'advance',stateT:0,fireCd:rand(.44,.92),muzzle:0,recoil:0,proneT:0,
    anim:Math.random()*10,anim2:Math.random()*10,angle:Math.PI/2,cover:null,lastCoverId:0,suppression:0,deadT:0,
    variant:Math.abs(id)%12,firePose:firePose,lastX:x||0,lastY:y||0,stuckT:0,
    squadId:squad.id,tactic:squad.tactic,slot:squad.slot||0,squadPhase:squad.phase||0,
    flankX:squad.flankX==null?(x||gameState.map.road.x):squad.flankX,
    decisionT:rand(.8,1.7),burstCount:0,lean:rand(-.08,.08),crawlPhase:Math.random()*TAU,
    aggressive:squad.aggressive||0,burnT:0,bleedT:0,bleedCd:0,limp:0,dismounted:!!squad.dismounted,progressY:y||0,noProgressT:0,forceDirectT:0,vx:0,vy:0
  };
  gameState.infantry.push(e);
  e.cover=nextForwardCover(e);
  return e;
}
function spawnFoot(n){
  var tactic=gameState.levelIndex<2?'direct':newSquadTactic(),origin=laneX(gameState.levelIndex<2?rand(-24,24):rand(-52,52)),sq=squadPlan(n,tactic,origin);
  var roles=gameState.levelIndex<2?['rifle']:n>=3?['rifle','lmg','grenadier']:['rifle','rifle'];
  if(level().zone>=2&&Math.random()<.45)roles[roles.length-1]='marksman';
  for(var i=0;i<n;i++){
    var member={id:sq.id,tactic:sq.tactic,size:n,originX:origin,phase:sq.phase,slot:i,flankX:clamp(origin+(i-(n-1)/2)*26,30,W-30)};
    spawnInfantry(origin+(i-(n-1)/2)*17,safeTop+70-rand(0,34),roles[i%roles.length],member);
  }
}
function vehicleCapacity(type){
  if(type==='trooptruck')return gameState.levelIndex<5?Math.floor(rand(3,5)):Math.floor(rand(5,8));
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
  var half=gameState.map.corridorHalf||92,roadX=gameState.map.road.x;
  var sq={id:squadSerial++,tactic:index%3===0?'flankLeft':index%3===1?'flankRight':'bound',size:1,originX:px,phase:Math.random()*TAU,slot:index,flankX:clamp(px+side*24,roadX-half*.82,roadX+half*.82),aggressive:1,dismounted:true};
  var role=index%6===1?'lmg':index%7===3?'grenadier':'rifle';
  var e=spawnInfantry(px,py,role,sq);
  e.aggressive=1.25;e.cover=null;e.fireCd=rand(.18,.34);e.decisionT=rand(.52,.86);
  if(mode==='normal'){
    e.state=Math.random()<.22?'prone':'fire';
    e.stateT=0;e.proneT=rand(.75,1.30);
  }else{
    e.state='advance';e.forceDirectT=.75;
  }
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
function spawnVehicle(type,count){
  var id=Math.random()*1e9|0,cap=vehicleCapacity(type);
  var hp=type==='trooptruck'?58:type==='jeep'?78:type==='lighttruck'?122:type==='truck'?168:235;
  // Convoys should feel heavy, readable and interceptable rather than arcade-fast.
  var sp=type==='trooptruck'?48:type==='jeep'?42:type==='lighttruck'?34:type==='truck'?28:24;
  var accel=type==='trooptruck'?62:type==='jeep'?36:type==='lighttruck'?28:type==='truck'?22:16;
  var turn=type==='trooptruck'?1.70:type==='jeep'?2.25:type==='lighttruck'?1.80:type==='truck'?1.48:1.18;
  var roadX=gameState.map.road.x,side=Math.random()<.5?-1:1;
  var shoulder=clamp(roadX+side*(type==='halftrack'?rand(50,72):type==='trooptruck'?rand(34,48):rand(38,60)),28,W-28);
  var x=roadX+rand(-5,5),spawnY=type==='trooptruck'?H*.105:safeTop+48;
  for(var vi=0;vi<gameState.vehicles.length;vi++){var ov=gameState.vehicles[vi];if(ov.alive&&ov.y<safeTop+125)spawnY=Math.min(spawnY,ov.y-72);}
  var aim=Math.atan2(gameState.bunker.y-spawnY,gameState.bunker.x-x);
  var dismountRun=type==='trooptruck'||(type==='halftrack'&&Math.random()<.56);
  var hasMG=type!=='trooptruck';
  gameState.vehicles.push({
    id:id,type:type,x:x,baseX:x,y:spawnY,hp:hp,maxHp:hp,speed:sp,baseSpeed:sp,currentSpeed:type==='trooptruck'?sp*.62:sp*.34,accel:accel,turnRate:turn,
    alive:true,state:'road',behavior:dismountRun?'dismount':'firepass',
    contactY:type==='trooptruck'?H*.43:H*rand(.30,.47),dropY:type==='trooptruck'?H*.465:H*rand(.40,.54),shoulderX:shoulder,
    passengers:type==='trooptruck'?Math.max(2,count||cap):cap,unloadLeft:dismountRun?(type==='trooptruck'?Math.max(2,count||cap):cap):0,unloadIndex:0,unloadCd:0,dropped:false,stopT:0,stopBursts:Math.floor(rand(2,4)),
    bodyAngle:Math.PI/2,turretAngle:aim+rand(-.35,.35),turretVel:0,turretRecoil:0,turretAimT:rand(.20,.65),
    fireCd:rand(.42,.90),mgBurst:0,hasMG:hasMG,smoke:0,dustCd:0,damageFxCd:0,hitFlash:0,
    zigAmp:type==='halftrack'?rand(7,14):type==='jeep'?rand(4,10):rand(3,7),
    zigFreq:type==='halftrack'?rand(.36,.56):type==='jeep'?rand(.52,.76):rand(.38,.62),
    zigPhase:rand(0,TAU),zigT:0,wheelT:Math.random()*10,sideVel:0,avoidWreck:null,avoidSide:0,avoidT:0,resumeState:null,driverExited:false,driverHit:false,windowBroken:false,tireFlat:false,tireDamage:0,bulletHoles:0,finalParkY:Math.min(gameState.bunker.y-74,H-safeBottom-106)
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
  gameState.hitMarker=.20;gameState.hitPulse=1;
  pushEffect({type:'damage',x:x,y:y-8,text:String(Math.max(1,Math.round(dmg))),t:0,life:.52});
  AudioSys.tone('hit',.58);
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

function killInfantry(e,kind){
  if(!e.alive)return;
  e.alive=false;e.deadT=0;e.state='dead';
  gameState.stats.kills++;gameState.eff=clamp(gameState.eff+.020,0,1);addStreak();
  addBlood(e.x,e.y,kind==='he'?18:8,kind==='he');gameState.hitStop=Math.max(gameState.hitStop||0,.028);gameState.shake=Math.max(gameState.shake||0,1.0);gameState.screenFlash=Math.max(gameState.screenFlash||0,.025);AudioSys.tone('hit',.75);
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
function vehicleComponentText(v,label){
  gameState.hitMarker=.20;gameState.hitPulse=1;
  pushEffect({type:'damage',x:v.x,y:v.y-10,text:label,t:0,life:.58});
}
function emitGlassHit(v){
  v.windowBroken=true;
  for(var i=0;i<6;i++)pushEffect({type:'glassShard',x:v.x+rand(-5,5),y:v.y+rand(-7,1),vx:rand(-42,42),vy:rand(-48,8),rot:rand(0,TAU),vr:rand(-14,14),t:0,life:rand(.28,.56)});
  AudioSys.tone('glass',1);
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
function neutralizeVehicle(v,reason,fragments){
  if(!v.alive)return false;
  dismountDestroyed(v,'mg');
  if(fragments)emitVehicleFragments(v,'mg');
  v.alive=false;v.currentSpeed=0;v.state='disabled';v.hasMG=false;
  gameState.stats.vehicleKills++;gameState.eff=clamp(gameState.eff+.018,0,1);addStreak();
  gameState.wrecks.push({type:v.type,x:v.x,y:v.y,bodyAngle:v.bodyAngle,variant:v.id%4,burnT:0,smokeCd:0,flameCd:0,disabled:true,softDisabled:true,disabledReason:reason||'MOBILITY',doorOpen:!!v.doorOpen,tireFlat:!!v.tireFlat,windowBroken:!!v.windowBroken,bulletHoles:v.bulletHoles||0,oilRadius:2.5,oilSeed:Math.random()*999});
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
  var dx=b.x-v.x,dy=b.y-v.y,ang=-(v.bodyAngle||Math.PI/2)+Math.PI/2,c=Math.cos(ang),sn=Math.sin(ang);
  var lx=dx*c-dy*sn,ly=dx*sn+dy*c,roll=Math.random(),component='body';
  if(Math.abs(lx)>7.0||roll<.26)component='tire';
  else if((ly<4&&Math.abs(lx)<9)||roll<.58)component='glass';
  if(v.windowBroken&&Math.random()<.34)component='driver';
  if(roll>.94)component='driver';

  if(v.type==='halftrack'&&tier<5&&component!=='driver'){
    vehicleComponentText(v,'RICOCHET');AudioSys.tone('metal',.65);vehicleHitFx(v,'mg');return false;
  }
  if(component==='tire'){emitTireHit(v);vehicleComponentText(v,'TIRE');}
  else if(component==='glass'){emitGlassHit(v);vehicleComponentText(v,'GLASS');}
  else if(component==='driver'){driverShotOut(v);}
  else{vehicleComponentText(v,'PING');AudioSys.tone('metal',.52);vehicleHitFx(v,'mg');}
  // Bolt rifles and ordinary rifles can never ignite or destroy the truck body.
  return false;
}
function primaryVehicleHit(v,b){
  var tier=b.visual||0;
  // KAR98 and all ordinary rifle tiers: component/crew effects only, never structural detonation.
  if(tier<=6)return smallArmsVehicleHit(v,b);
  if(tier<=13){
    var scale=tier<=10?.24:.52,dealt=b.damage*scale;
    v.hp-=dealt;v.hitFlash=.10;vehicleComponentText(v,Math.round(dealt)+'');AudioSys.tone('metal',.62);vehicleHitFx(v,'mg');
    var hpRatio=Math.max(0,v.hp/v.maxHp);
    if(hpRatio<.65){v.speed=Math.min(v.speed,(v.baseSpeed||v.speed)*.72);v.smoke=Math.max(v.smoke,.60);}
    if(hpRatio<.35){v.speed=Math.min(v.speed,(v.baseSpeed||v.speed)*.46);v.currentSpeed=Math.min(v.currentSpeed,v.speed);v.smoke=Math.max(v.smoke,.95);}
    if(v.hp<=0)disableVehicleByGunfire(v);
    return v.hp<=0;
  }
  // Only very late autocannon/howitzer-class primaries can actually detonate a vehicle.
  return damageVehicle(v,b.damage*.72,'he');
}
function damageVehicle(v,dmg,kind){
  if(!v.alive)return false;
  var mgMult=v.type==='trooptruck'?1.15:v.type==='jeep'?1.0:v.type==='lighttruck'?.82:v.type==='truck'?.64:.24;
  var dealt=dmg*(kind==='mg'?mgMult:1);
  v.hp-=dealt;v.hitFlash=.10;gameState.hitMarker=.20;gameState.hitPulse=1;pushEffect({type:'damage',x:v.x,y:v.y-8,text:String(Math.max(1,Math.round(dealt))),t:0,life:.52});AudioSys.tone('metal',.72);vehicleHitFx(v,kind);
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
  a.hp-=dmg;hitFeedback(a.x,a.y,dmg);
  if(a.hp<=0){a.alive=false;gameState.stats.airKills++;gameState.eff=clamp(gameState.eff+.035,0,1);addStreak();gameState.hitStop=Math.max(gameState.hitStop||0,.045);gameState.shake=Math.max(gameState.shake||0,3.8);gameState.screenFlash=Math.max(gameState.screenFlash||0,.08);explode(a.x,a.y,25,false);return true;}
  return false;
}
function damageBunker(dmg){
  var real=dmg*gameState.profile.armorScale;
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
  return best;
}
function enemyFire(e){
  var dx=gameState.bunker.x-e.x,dy=gameState.bunker.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;
  var fairRange=H*gameState.profile.primaryRangeFactor*.98;if(d>fairRange)return false;
  var kind=e.role==='grenadier'?'grenade':e.role==='lmg'?'lmg':e.role==='marksman'?'marksman':'rifle';
  var speed=kind==='grenade'?145:kind==='marksman'?385:305,earlyScale=gameState.levelIndex<3?.68:gameState.levelIndex<6?.84:1,dmg=(kind==='grenade'?7.4:kind==='lmg'?2.65:kind==='marksman'?4.1:2.0)*DEVICE.enemyDamage*earlyScale;
  var mx=e.x+Math.cos(e.angle)*10,my=e.y+Math.sin(e.angle)*10;
  gameState.enemyShots.push({x:mx,y:my,px:mx,py:my,vx:dx/d*speed,vy:dy/d*speed,kind:kind,dmg:dmg,life:kind==='grenade'?2.4:1.5});
  e.muzzle=.09;e.recoil=1;emitMuzzle(mx,my,e.angle,false);AudioSys.tone('enemy',.55);return true;
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

    var moved=dist(e.x,e.y,e.lastX||e.x,e.lastY||e.y);e.stuckT=(e.state==='advance'||e.state==='crawl')&&moved<.08?e.stuckT+dt:0;e.lastX=e.x;e.lastY=e.y;
    if(e.forceDirectT>0)e.forceDirectT=Math.max(0,e.forceDirectT-dt);
    if(e.y>(e.progressY||e.y)+1.2){e.progressY=e.y;e.noProgressT=0;}else if(e.state==='advance'||e.state==='crawl')e.noProgressT+=dt;else e.noProgressT=Math.max(0,e.noProgressT-dt*.5);
    var tactical=tacticalPoint(e),bdx=gameState.bunker.x-e.x,bdy=gameState.bunker.y-e.y,dB=Math.sqrt(bdx*bdx+bdy*bdy)||1;var aimAng=Math.atan2(bdy,bdx);e.angle=approachAngle(e.angle||aimAng,aimAng,dt*4.8);
    var playerReach=H*gameState.profile.primaryRangeFactor*.94;
    if(dB>playerReach&&(e.state==='cover'||e.state==='covering'||e.state==='fire'||e.state==='prone')){e.state='advance';e.stateT=0;e.cover=null;e.forceDirectT=Math.max(e.forceDirectT,1.2);}
    if(e.noProgressT>1.65&&dB>120){e.state='advance';e.cover=null;e.tactic='direct';e.flankX=gameState.bunker.x;e.forceDirectT=2.2;e.noProgressT=0;e.stuckT=0;}

    if(e.suppression>.70&&e.state!=='suppressed'&&e.state!=='crawl'){e.state='suppressed';e.stateT=0;e.cover=nearestCover(e)||nextForwardCover(e);}
    if(e.stuckT>1.55){e.state='advance';e.cover=null;e.tactic='direct';e.forceDirectT=2.0;e.stuckT=0;e.flankX=gameState.bunker.x;}

    var supportRole=e.role==='marksman'||e.role==='lmg';
    var preferred=(e.role==='marksman'?240:e.role==='lmg'?210:e.role==='grenadier'?188:164)-(e.aggressive?22:0);

    if(e.state==='advance'){
      if(!e.cover&&e.forceDirectT<=0)e.cover=nextForwardCover(e);
      var mt=e.forceDirectT>0?{x:gameState.bunker.x,y:gameState.bunker.y}:e.cover||tactical,dx=mt.x-e.x,dy=mt.y-e.y,dTarget=Math.sqrt(dx*dx+dy*dy)||1;
      if(e.cover&&dTarget<10){e.state='cover';e.stateT=0;e.coverT=e.aggressive?rand(.30,.58):rand(.52,.90);}
      else if(!e.cover&&dB<preferred){e.state='fire';e.stateT=0;}
      else{
        var sp=e.speed*DEVICE.enemySpeed*(1-e.suppression*.38)*(e.limp>0?(1-e.limp*.43):1);
        if(e.tactic==='flankLeft'||e.tactic==='flankRight'||e.tactic==='split')sp*=.95;
        steerInfantry(e,mt.x,mt.y,sp,dt,6.2);
      }
    }else if(e.state==='covering'){
      dampInfantry(e,dt);
      e.fireCd-=dt;if(e.fireCd<=0&&dB<300){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.34:rand(.62,.96);}
      if(e.stateT>(e.aggressive?.88:1.35)){e.state='advance';e.stateT=0;e.cover=nextForwardCover(e);}
    }else if(e.state==='cover'){
      dampInfantry(e,dt);
      e.fireCd-=dt;if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.34:e.role==='marksman'?1.00:rand(.62,.96);}
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
      if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.40:e.role==='marksman'?1.08:rand(.72,1.02);}
      if(e.stateT>(e.proneT||1.35)||dB>preferred+95){e.state='advance';e.stateT=0;e.cover=nextForwardCover(e);e.burstCount=0;}
    }else if(e.state==='fire'){
      dampInfantry(e,dt);
      e.fireCd-=dt;if(e.fireCd<=0){enemyFire(e);e.recoil=1;e.burstCount++;e.fireCd=e.role==='lmg'?.32:e.role==='grenadier'?1.20:e.role==='marksman'?1.02:rand(.60,.92);}
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
  dismountOne(v,'normal',v.unloadIndex++);v.unloadLeft--;v.passengers=v.unloadLeft;v.unloadCd=v.type==='trooptruck'?rand(.045,.075):rand(.09,.15);
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
      var push=(min-d)*.52,nx=dx/d,side=Math.abs(nx)>.25?nx:(A.id<B.id?-1:1);
      A.x-=side*push*.55;B.x+=side*push*.55;
      if(Math.abs(dy)<min*.75){if(A.y<B.y)A.y-=push*.20;else B.y-=push*.20;}
      A.currentSpeed=Math.min(A.currentSpeed,A.speed*.30);B.currentSpeed=Math.min(B.currentSpeed,B.speed*.30);
    }
  }
}
function updateVehicles(dt){
  gameState.dtForVehicle=dt;
  for(var i=0;i<gameState.vehicles.length;i++){
    var v=gameState.vehicles[i];if(!v.alive)continue;
    v.smoke=Math.max(0,v.smoke-dt);v.dustCd-=dt;v.unloadCd-=dt;v.hitFlash=Math.max(0,(v.hitFlash||0)-dt);v.audioCd=(v.audioCd||0)-dt;
    if(v.zigT!=null)v.zigT+=dt;v.wheelT+=dt*Math.max(1,v.currentSpeed*.16);updateVehicleDamageParticles(v,dt);
    if(v.tireChaosT>0)v.tireChaosT=Math.max(0,v.tireChaosT-dt);
    var turretState=updateVehicleTurret(v,dt),traffic=vehicleFollowScale(v);
    if(v.audioCd<=0&&v.currentSpeed>5){v.audioCd=.22+Math.random()*.10;AudioSys.enginePulse(v.type==='trooptruck'?.26:.32);}

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
      if(Math.abs(dx)<2){v.state='unload';v.stopT=v.type==='trooptruck'?1.12:2.25;v.unloadCd=.025;v.currentSpeed=0;v.stopBursts=2;}
    }else if(v.state==='unload'){
      vehicleMG(v,turretState);
      v.stopT-=dt;if(v.unloadLeft>0&&v.unloadCd<=0)unloadStep(v);
      if(v.unloadLeft<=0&&v.stopT<=0){if(!v.hasMG)v.state='depart';else{v.state='support';v.stopBursts=2;v.fireCd=.10;}}
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
    if(p.y>=p.landingY){p.alive=false;spawnInfantry(p.x,p.landingY,'rifle');pushEffect({type:'chute',x:p.x,y:p.landingY,t:0,life:2.4});}
  }
  gameState.air=gameState.air.filter(function(a){return a.x>-190&&a.x<W+190&&a.y<H+160;});
  gameState.paras=gameState.paras.filter(function(p){return p.alive;});
}

/* ---------- PLAYER WEAPONS ---------- */

function beginPrimaryReload(){
  if(gameState.primaryReloadT>0)return;
  gameState.primaryReloadT=gameState.profile.primaryReload;gameState.burstQueue=[];AudioSys.tone('reload',.62);
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
  return 1+Math.min(.30,Math.floor(gameState.streak/5)*.10);
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
    if(gameState.profile.primaryMag<=8&&gameState.profile.primaryCycle>.45&&gameState.primaryAmmo>0)AudioSys.after(Math.max(120,gameState.profile.primaryCycle*520),'bolt',.50,{rate:.96+Math.random()*.08});
    if(gameState.primaryAmmo<=0)beginPrimaryReload();
  }
  var ma=Math.atan2(ty-sy,tx-sx),mx=sx+Math.cos(ma)*13,my=sy+Math.sin(ma)*13;
  emitMuzzle(mx,my,ma,kind==='he'&&gameState.profile.specialVisual>=5);
  if(kind==='mg'&&gameState.profile.primaryVisual>=3)pushEffect({type:'casing',x:sx+rand(-3,3),y:sy-2,vx:Math.cos(ma+Math.PI/2)*rand(18,34),vy:Math.sin(ma+Math.PI/2)*rand(18,34)-rand(4,12),rot:rand(0,TAU),vr:rand(-15,15),t:0,life:rand(.26,.44)});
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
  if(c.kind==='fence')return 4;
  if(c.kind==='sandbag'||c.kind==='log'||c.kind==='lowwall'||c.kind==='snowbank')return 6;
  if(c.kind==='crate'||c.kind==='barrel'||c.kind==='pipe')return 8;
  if(c.kind==='rubble')return 7;
  if(c.kind==='bush'||c.kind==='scrub')return 3;
  return 5;
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
    return;
  }
  if(effect==='blast'){
    explode(x,y,b.radius,false);addUpgradeCrater(x,y,b.radius,b.visual);fragmentBlastInfantry(x,y,b.radius,b.blastDamage||b.damage*.8,b.visual||0);return;
  }
  if(effect==='fire'){
    pushEffect({type:'impactFlash',x:x,y:y,r:8,t:0,life:.12});emitFlame(x,y,true);emitSmoke(x,y,false);
    createFireZone(x,y,b,false);gameState.shake=Math.max(gameState.shake||0,1.5);return;
  }
  pushEffect({type:'impactFlash',x:x,y:y,r:10,t:0,life:.14});
  explode(x,y,Math.max(10,b.radius*.55),false);addUpgradeCrater(x,y,b.radius,b.visual);blastInfantry(x,y,b.radius,b.blastDamage||b.damage);
  createFireZone(x,y,b,true);gameState.shake=Math.max(gameState.shake||0,2.2);
}
function heObstacleHit(b){
  var i,c,m=gameState.map,z=b.z||0;
  for(i=0;i<m.cover.length;i++){c=m.cover[i];if(z<=coverHeight(c)&&dist(b.x,b.y,c.x,c.y)<coverRadius(c)){specialImpactAt(b.x,b.y,b);b.active=false;return true;}}
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
  else{best.hp-=b.damage;if(best.hp<=0){best.alive=false;gameState.stats.airKills++;addBlood(best.x,best.y,6,false);}}
  if((b.primarySplash||0)>0){explode(best.x,best.y,b.primarySplash,false);addUpgradeCrater(best.x,best.y,b.primarySplash,b.visual);blastInfantry(best.x,best.y,b.primarySplash,b.damage*.42);}
  b.active=false;return true;
}
function resolveHEHit(b){
  var i,v,e,d,vr;
  for(i=0;i<gameState.vehicles.length;i++){
    v=gameState.vehicles[i];if(!v.alive)continue;vr=v.type==='jeep'?13:v.type==='lighttruck'?15:17;d=pointSegDist(v.x,v.y,b.px,b.py,b.x,b.y);
    if(d<vr&&(b.z||0)<=7){
      gameState.stats.hits++;damageVehicle(v,b.damage,b.specialEffect==='fire'||b.specialEffect==='plasma'?'fire':'he');
      if(b.specialEffect!=='impact')specialImpactAt(b.x,b.y,b);else pushEffect({type:'impactFlash',x:b.x,y:b.y,r:5,t:0,life:.10});
      b.active=false;return true;
    }
  }
  for(i=0;i<gameState.infantry.length;i++){
    e=gameState.infantry[i];if(!e.alive)continue;d=pointSegDist(e.x,e.y,b.px,b.py,b.x,b.y);
    if(d<6.5*DEVICE.hitRadius){
      gameState.stats.hits++;damageInfantry(e,b.damage,'special');
      if(b.specialEffect!=='impact')specialImpactAt(b.x,b.y,b);else pushEffect({type:'impactFlash',x:b.x,y:b.y,r:5,t:0,life:.10});
      b.active=false;return true;
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
      if(resolveMGHit(b))continue;
      if((b.primarySplash||0)>0&&b.traveled>=b.targetDist){explode(b.x,b.y,b.primarySplash,false);addUpgradeCrater(b.x,b.y,b.primarySplash,b.visual);blastInfantry(b.x,b.y,b.primarySplash,b.damage*.58);b.active=false;continue;}
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
    if(w.softDisabled){
      w.oilRadius=Math.min(14,(w.oilRadius||2)+dt*.72);
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
  gameState.messageT=Math.max(0,gameState.messageT-dt);gameState.hitMarker=Math.max(0,gameState.hitMarker-dt);gameState.hitPulse=Math.max(0,(gameState.hitPulse||0)-dt*7);gameState.shake=Math.max(0,(gameState.shake||0)-dt*20);gameState.screenFlash=Math.max(0,(gameState.screenFlash||0)-dt*1.9);
  gameState.streakT=Math.max(0,gameState.streakT-dt);if(gameState.streakT<=0)gameState.streak=0;
  gameState.primaryCooldown=Math.max(0,gameState.primaryCooldown-dt);
  if(gameState.primaryReloadT>0){gameState.primaryReloadT=Math.max(0,gameState.primaryReloadT-dt);if(gameState.primaryReloadT===0){gameState.primaryAmmo=gameState.profile.primaryMag;AudioSys.tone('loaded',.65);gameState.message='LOADED '+gameState.primaryAmmo+'/'+gameState.profile.primaryMag;gameState.messageT=.30;}}
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
  if(gameState.eventCursor>=gameState.events.length&&!liveInf&&!liveVeh&&!liveAir&&!gameState.paras.length&&gameState.levelTime>11.5)completeLevel();
}

/* ---------- PROGRESSION ---------- */

function completeLevel(){
  if(gameState.levelComplete)return;
  gameState.levelComplete=true;gameState.mode='shop';
  gameState.save.supply+=Math.round(28+gameState.levelIndex*2.2+gameState.eff*14);
  var mapNo=gameState.levelIndex+1,points=(mapNo%3===0)?2:1;
  gameState.save.arsenalPoints=(gameState.save.arsenalPoints||0)+points;
  gameState.save.bestLevel=Math.max(gameState.save.bestLevel,Math.min(CAMPAIGN_LENGTH-1,gameState.levelIndex+1));saveGame();
  overlay.classList.remove('hidden');titleEl.textContent=gameState.levelIndex>=CAMPAIGN_LENGTH-1?'40 MAPS COMPLETE':'MAP CLEARED';
  subEl.textContent='PRIMARY + SUPPORT + 3 skills. Elke 3e map geeft een extra punt; over 40 maps zijn er precies genoeg punten om alles maximaal te krijgen.';
  summaryEl.style.display='block';summaryEl.textContent='EFF '+Math.round(gameState.eff*100)+'% · KILLS '+(gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills)+' · +'+points+' ARSENAL POINT'+(points>1?'S':'');
  shopEl.style.display='block';restartBtn.style.display='none';deployBtn.style.display='block';deployBtn.textContent=gameState.levelIndex>=CAMPAIGN_LENGTH-1?'MAP 1 AGAIN':'NEXT MAP';renderShop();
}
function weaponPreview(kind,lvl){
  var n=Math.min(MAX_WEAPON_LEVEL,lvl+1);
  if(kind==='primary'){
    var a=primaryStats(lvl),b=primaryStats(n),rm=Math.max(.90,1.35-(gameState.save.upgrades.reload||0)*.09);
    return a.name+' → '+b.name+' · '+a.mag+'rd · RELOAD '+(a.reload*rm).toFixed(1)+'s→'+(b.reload*rm).toFixed(1)+'s';
  }
  var x=specialStats(lvl),y=specialStats(n);
  return x.name+' → '+y.name+' · RANGE '+Math.round(x.rangeFactor*100)+'→'+Math.round(y.rangeFactor*100)+'% · '+x.effect.toUpperCase()+'→'+y.effect.toUpperCase();
}
function skillPreview(key,lvl){
  var n=Math.min(SKILL_MAX,lvl+1);
  if(key==='aiming')return 'SPREAD '+Math.round((1-lvl*.09)*100)+'% → '+Math.round((1-n*.09)*100)+'%';
  if(key==='reload')return 'RELOAD x'+(1.35-lvl*.09).toFixed(2)+' → x'+Math.max(.90,1.35-n*.09).toFixed(2);
  return 'HP +'+(lvl*16)+' → +'+(n*16)+' · DAMAGE '+Math.round((1-lvl*.045)*100)+'%→'+Math.round((1-n*.045)*100)+'%';
}
function renderShop(){
  gameState.profile=playerProfile();var up=gameState.save.upgrades;
  supplyEl.textContent='ARSENAL '+(gameState.save.arsenalPoints||0)+' · AIM '+up.aiming+'/5 · RLD '+up.reload+'/5 · ARM '+up.armor+'/5';
  shopGrid.innerHTML='';
  ['primary','special','aiming','reload','armor'].forEach(function(key){
    var cfg=UPGRADES[key],isWeapon=key==='primary'||key==='special',lvl=up[key]||0,max=lvl>=(isWeapon?MAX_WEAPON_LEVEL:SKILL_MAX);
    var title=isWeapon?(key==='primary'?primaryStats(lvl).name:specialStats(lvl).name):cfg.label;
    var detail=max?'MAX':isWeapon?weaponPreview(key,lvl):skillPreview(key,lvl);
    var b=document.createElement('button');b.type='button';b.className='shopBtn'+(max||(gameState.save.arsenalPoints||0)<1?' disabled':'');
    b.innerHTML='<strong>'+cfg.label+' · '+lvl+'/'+(isWeapon?MAX_WEAPON_LEVEL:SKILL_MAX)+' · '+title+'</strong><span>'+detail+'</span><em>'+(max?'MAX':'1 ARSENAL POINT')+'</em>';
    if(!max)b.addEventListener('click',function(){
      if((gameState.save.arsenalPoints||0)<1)return;
      gameState.save.arsenalPoints--;
      gameState.save.upgrades[key]=Math.min(isWeapon?MAX_WEAPON_LEVEL:SKILL_MAX,lvl+1);
      saveGame();gameState.profile=playerProfile();renderShop();
    });
    shopGrid.appendChild(b);
  });
}
function endGame(reason){
  gameState.mode='gameover';overlay.classList.remove('hidden');
  titleEl.textContent=reason;subEl.textContent='Probeer dezelfde map opnieuw.';
  summaryEl.style.display='block';
  summaryEl.textContent='EFF '+Math.round(gameState.eff*100)+'% · KILLS '+(gameState.stats.kills+gameState.stats.vehicleKills+gameState.stats.airKills)+' · MAP '+(gameState.levelIndex+1)+'/40';
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
  var m=gameState.map,p=m.palette,r=m.road;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=p.line;ctx.lineWidth=31;ctx.beginPath();ctx.moveTo(r.x,safeTop-25);ctx.quadraticCurveTo(r.bendX,r.junctionY,W*.5,gameState.bunker.y-55);ctx.stroke();
  ctx.strokeStyle=p.roadEdge;ctx.lineWidth=28;ctx.stroke();
  ctx.strokeStyle=p.road;ctx.lineWidth=23;ctx.stroke();
  ctx.globalAlpha=.24;ctx.strokeStyle=tone(p.road,.30);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(r.x-7,safeTop-25);ctx.quadraticCurveTo(r.bendX-7,r.junctionY,W*.5-7,gameState.bunker.y-55);ctx.stroke();
  ctx.globalAlpha=.32;ctx.strokeStyle=tone(p.road,-.20);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r.x+8,safeTop-25);ctx.quadraticCurveTo(r.bendX+8,r.junctionY,W*.5+8,gameState.bunker.y-55);ctx.stroke();
  ctx.globalAlpha=.36;ctx.strokeStyle=tone(p.road,.45);ctx.lineWidth=1.2;ctx.setLineDash([8,10]);ctx.beginPath();ctx.moveTo(r.x,safeTop-25);ctx.quadraticCurveTo(r.bendX,r.junctionY,W*.5,gameState.bunker.y-55);ctx.stroke();
  ctx.setLineDash([]);ctx.restore();
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
function drawCover(c,p){drawEnvSprite(c.sprite||'sandbagStraight',c.x,c.y,.68+Math.min(.30,(c.len||12)/65),c.rot,1);}
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
function drawAtlas(name,x,y,scale,angle,alpha){
  ensureSpriteAtlas();var f=SPR.frames[name];if(!f)return;
  var outlined=name.indexOf('ground')<0&&name.indexOf('track')<0&&name.indexOf('gravel')<0&&name.indexOf('mudPatch')<0&&name.indexOf('blood')<0&&name.indexOf('scorch')<0;
  ctx.save();ctx.translate(x,y);if(angle)ctx.rotate(angle);ctx.globalAlpha=alpha==null?1:alpha;ctx.imageSmoothingEnabled=true;
  if(outlined){ctx.shadowColor='rgba(12,17,13,.55)';ctx.shadowBlur=0;ctx.shadowOffsetX=1.2;ctx.shadowOffsetY=1.5;}
  ctx.drawImage(SPR.atlas,f.x,f.y,f.w,f.h,-f.w*scale/2,-f.h*scale/2,f.w*scale,f.h*scale);
  ctx.restore();
}
function spritePose(e){if(!e.alive)return e.deadT<.22?'dead1':'dead2';if(e.state==='crawl'||e.state==='prone')return e.muzzle>0?'proneFire':'prone';if(e.state==='cover'||e.state==='covering'||e.state==='suppressed')return e.muzzle>0?'crouchFire':'crouch';if(e.state==='fire'){if(e.firePose==='prone')return e.muzzle>0?'proneFire':'prone';if(e.firePose==='crouch')return e.muzzle>0?'crouchFire':'crouch';return e.muzzle>0?'standFire':'idle';}if(e.state==='advance')return ['walk1','walk2','walk3','walk4'][((e.anim*3.15)|0)%4];return ((e.anim2*1.3)|0)%2?'idle2':'idle';}
function spriteDirection(e){var dx,dy;if(e.alive&&(e.state==='advance'||e.state==='crawl'||e.state==='suppressed')){var t=tacticalPoint(e);dx=t.x-e.x;dy=t.y-e.y;}else{dx=gameState.bunker.x-e.x;dy=gameState.bunker.y-e.y;}if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';return dy<0?'up':'down';}
function drawSoldier(e){
  var pose=spritePose(e),dir=spriteDirection(e),skin=Math.abs(e.variant||0)%SPR.inf.skins,depth=clamp((e.y-safeTop)/(H-safeTop-safeBottom),0,1);
  var scale=(IS_IPHONE?1.05:1.00)*(.94+depth*.10),hop=e.limp>0?Math.abs(Math.sin(e.anim*2.8))*1.7*e.limp:0,xx=e.x+(e.limp>0?Math.sin(e.anim*5.6)*.8:0),yy=e.y-hop;
  ctx.save();ctx.fillStyle='rgba(15,20,16,.28)';ctx.beginPath();ctx.ellipse(xx+1.5,yy+7.5,pose.indexOf('prone')===0?7.5:5.5,pose.indexOf('prone')===0?2.4:2.9,0,0,TAU);ctx.fill();ctx.restore();
  drawAtlas('inf:'+e.role+':'+skin+':'+dir+':'+pose,xx,yy,scale,0,e.alive?1:clamp(1-e.deadT/7,.34,1));
  if(e.alive&&pose.indexOf('prone')!==0){ctx.save();ctx.globalAlpha=.42;ctx.fillStyle='#e2e0bd';ctx.beginPath();ctx.arc(xx-1.2,yy-5.2,1.05,0,TAU);ctx.fill();ctx.restore();}
}
function drawVehicle(v,wreck){
  var rawType=v.type||'truck',type=rawType==='trooptruck'?'lighttruck':rawType,body=v.bodyAngle==null?Math.PI/2:v.bodyAngle,rot=body-Math.PI/2;
  var scale=type==='jeep'?.55:type==='lighttruck'?.54:type==='truck'?.52:.54;
  var shadowW=type==='jeep'?15:type==='lighttruck'?17:type==='truck'?19:21;
  var shadowH=type==='jeep'?28:type==='lighttruck'?33:type==='truck'?37:38;

  ctx.save();ctx.translate(v.x+3,v.y+5);ctx.rotate(rot);ctx.globalAlpha=wreck?.25:.22;ctx.fillStyle='#101310';
  ctx.beginPath();ctx.ellipse(0,0,shadowW,shadowH,0,0,TAU);ctx.fill();ctx.restore();

  if(wreck){
    if(v.softDisabled){
      ctx.save();ctx.globalAlpha=.44;ctx.fillStyle='#241d15';ctx.beginPath();ctx.ellipse(v.x+4,v.y+13,Math.max(3,v.oilRadius||3),Math.max(1.8,(v.oilRadius||3)*.42),(v.oilSeed||0)%1,0,TAU);ctx.fill();ctx.restore();
      drawAtlas(type+':empty:0:hit',v.x,v.y,scale,rot,1);
      ctx.save();ctx.translate(v.x,v.y);ctx.rotate(rot);
      if(v.windowBroken){ctx.strokeStyle='rgba(205,230,225,.88)';ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(-5,-8);ctx.lineTo(5,-2);ctx.moveTo(4,-9);ctx.lineTo(-4,-2);ctx.stroke();}
      if(v.tireFlat){ctx.fillStyle='#111312';ctx.beginPath();ctx.ellipse(-shadowW*.70,shadowH*.25,4,2.2,.25,0,TAU);ctx.fill();}
      if(v.doorOpen){ctx.save();ctx.translate(shadowW*.62,-shadowH*.22);ctx.rotate(.72);ctx.fillStyle='#4b5943';ctx.strokeStyle='#151b16';ctx.lineWidth=1.1;ctx.fillRect(0,-5,7,10);ctx.strokeRect(0,-5,7,10);ctx.restore();}
      var holes=Math.min(4,v.bulletHoles||0);ctx.fillStyle='#111411';for(var bh=0;bh<holes;bh++){ctx.beginPath();ctx.arc(-5+bh*3,-2+(bh%2)*4,1.2,0,TAU);ctx.fill();}
      ctx.restore();
    }else drawAtlas(type+':wreck',v.x,v.y,scale,rot,.99);
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

  ctx.save();ctx.translate(v.x,v.y);ctx.rotate(rot);
  if(v.windowBroken){
    ctx.strokeStyle='rgba(205,230,225,.88)';ctx.lineWidth=.75;
    ctx.beginPath();ctx.moveTo(-5,-8);ctx.lineTo(5,-2);ctx.moveTo(4,-9);ctx.lineTo(-4,-2);ctx.moveTo(0,-10);ctx.lineTo(0,-1);ctx.stroke();
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
  var bodyW=type==='jeep'?12:type==='lighttruck'?14:type==='truck'?15:16;
  var bodyL=type==='jeep'?22:type==='lighttruck'?27:type==='truck'?30:31;
  ctx.globalAlpha=.48;ctx.strokeStyle='#e0dfc2';ctx.lineWidth=1.15;ctx.beginPath();ctx.moveTo(-bodyW*.62,-bodyL*.66);ctx.lineTo(-bodyW*.58,bodyL*.42);ctx.stroke();
  ctx.globalAlpha=.50;ctx.strokeStyle='#152019';ctx.lineWidth=1.25;ctx.beginPath();ctx.moveTo(bodyW*.65,-bodyL*.50);ctx.lineTo(bodyW*.63,bodyL*.55);ctx.stroke();ctx.restore();
}
function drawHeli(a){drawAtlas('heli:'+(((a.rotor*1.2)|0)&1),a.x,a.y,1.06,0,1);}
function drawPlane(a){drawAtlas('plane:'+(a.fromLeft?0:1),a.x,a.y,1.08,0,1);}
function drawPara(p){drawAtlas('para:'+(((p.phase*1.3)|0)&1),p.x,p.y,1.02,0,1);}
/* ---------- RENDER: EFFECTS / PLAYER ---------- */

function drawEffects(){
  for(var i=0;i<gameState.effects.length;i++){
    var e=gameState.effects[i],q=1-e.t/e.life,px=e.x,py=e.y;
    if(e.type==='explosion'){
      var rr=Math.max(3,e.r*(.35+.92*(1-q)));
      ctx.save();ctx.globalAlpha=q;ctx.fillStyle='#1b1f1b';ctx.beginPath();ctx.arc(px+2,py+2,rr*1.08,0,TAU);ctx.fill();
      ctx.fillStyle='#b94a2d';ctx.beginPath();ctx.arc(px,py,rr,0,TAU);ctx.fill();
      ctx.fillStyle='#f18734';ctx.beginPath();ctx.arc(px-rr*.12,py-rr*.15,rr*.68,0,TAU);ctx.fill();
      ctx.fillStyle='#ffd85b';ctx.beginPath();ctx.arc(px-rr*.20,py-rr*.24,rr*.36,0,TAU);ctx.fill();
      ctx.fillStyle='#fff3b4';ctx.beginPath();ctx.arc(px-rr*.24,py-rr*.28,Math.max(1.5,rr*.15),0,TAU);ctx.fill();ctx.restore();
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
      ctx.save();ctx.globalAlpha=q;ctx.translate(px,py);ctx.rotate(e.angle);var ml=Math.max(5,e.r);ctx.fillStyle='#1c201b';ctx.beginPath();ctx.moveTo(0,-2.4);ctx.lineTo(ml+2,0);ctx.lineTo(0,2.4);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ffd85b';ctx.beginPath();ctx.moveTo(0,-1.5);ctx.lineTo(ml,0);ctx.lineTo(0,1.5);ctx.closePath();ctx.fill();ctx.restore();
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
    }else if(e.type==='dust'){ctx.globalAlpha=q*.45;ctx.fillStyle=gameState.map.palette.roadEdge;ctx.beginPath();ctx.ellipse(px,py,Math.max(2,e.r),Math.max(1.2,e.r*.45),0,0,TAU);ctx.fill();
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
  var lvl=b.visual||0,z=b.z||0,x=b.x,y=b.y-z,ang=Math.atan2(b.vy,b.vx)+b.traveled*.035;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  if(lvl===0){
    ctx.fillStyle='#44443a';ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill();ctx.strokeStyle='#1c211d';ctx.lineWidth=1;ctx.stroke();
  }else if(lvl===1){
    ctx.fillStyle='#d7d7c7';ctx.strokeStyle='#20231f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-7,-1.5);ctx.lineTo(6,0);ctx.lineTo(-7,1.5);ctx.closePath();ctx.fill();ctx.stroke();
  }else if(lvl===2){
    ctx.strokeStyle='#222722';ctx.lineWidth=1.4;for(var k=0;k<4;k++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-7);ctx.stroke();}ctx.fillStyle='#c6c8bc';ctx.beginPath();ctx.arc(0,0,2.3,0,TAU);ctx.fill();
  }else if(lvl===3){
    ctx.fillStyle='#8a6847';ctx.fillRect(-5,-1,8,2);ctx.fillStyle='#a9aa9a';ctx.beginPath();ctx.moveTo(1,-5);ctx.lineTo(7,0);ctx.lineTo(1,4);ctx.closePath();ctx.fill();
  }else if(lvl===4){
    ctx.strokeStyle='#73583e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(7,0);ctx.stroke();ctx.fillStyle='#b7b8aa';ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(2,-3);ctx.lineTo(2,3);ctx.closePath();ctx.fill();
  }else if(lvl<8){
    ctx.fillStyle=lvl===7?'#4d5a49':'#5d654f';ctx.strokeStyle='#1b211c';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,lvl===5?3.7:4.3,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#a69b67';ctx.fillRect(-1,-6,2,3);
  }else if(lvl<15){
    ctx.fillStyle='#171d18';ctx.fillRect(-3,-6,6,12);ctx.fillStyle=lvl>=11?'#764c35':'#72513b';ctx.fillRect(-2,-5,4,10);ctx.fillStyle='rgba(185,214,184,.38)';ctx.fillRect(-1,-4,2,6);
    ctx.fillStyle='#f2a13e';ctx.beginPath();ctx.arc(0,-7,3,0,TAU);ctx.fill();ctx.fillStyle='#ffe06a';ctx.beginPath();ctx.arc(-.5,-7.5,1.5,0,TAU);ctx.fill();
  }else{
    var r=3.5+(lvl-15)*.45;ctx.fillStyle='#172128';ctx.beginPath();ctx.arc(0,0,r+1.5,0,TAU);ctx.fill();ctx.fillStyle=lvl>=18?'#d572ff':'#68eaff';ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.fillStyle='#f1ffff';ctx.beginPath();ctx.arc(-1,-1,1.2,0,TAU);ctx.fill();
  }
  ctx.restore();
}
function drawShots(){
  for(var i=0;i<gameState.shots.length;i++){
    var b=gameState.shots[i];if(b.kind==='mg')drawPrimaryProjectile(b);else drawSpecialProjectile(b);
  }
  for(i=0;i<gameState.enemyShots.length;i++){
    b=gameState.enemyShots[i];ctx.strokeStyle=b.kind==='grenade'?'#d96a38':'#eee7cb';ctx.lineWidth=b.kind==='grenade'?2.4:1.2;ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
}
function drawBunker(){
  var b=gameState.bunker,t=gameState.profile.playerTier,a=b.angle;
  ctx.save();ctx.translate(b.x,b.y);
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
  ctx.font='700 10px system-ui,-apple-system,sans-serif';ctx.textAlign='left';ctx.fillStyle='#bdc8ae';ctx.fillText('MAP '+(gameState.levelIndex+1)+'/40 · '+L.name.toUpperCase(),18,top+36);ctx.textAlign='right';ctx.fillText(gameState.profile.primaryName+' · '+gameState.profile.specialName,W-18,top+36);
  var bx=W*.5-48,by=top+44,bw=96;ctx.fillStyle='#0f1411';roundRect(ctx,bx,by,bw,6,3);ctx.fill();ctx.fillStyle=effColor();roundRect(ctx,bx+1,by+1,Math.max(1,(bw-2)*gameState.eff),4,2);ctx.fill();

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