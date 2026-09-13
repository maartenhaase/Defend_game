// JBD v5.16.1 // RECOVERY SCENARIO ENGINE
(()=>{
'use strict';
if(typeof state==='undefined'||typeof canvas==='undefined') return;

const SC=[
 {theme:'JUNGLE',name:'FOOT PATROL',kind:'infantry'},
 {theme:'JUNGLE',name:'AIRBORNE STORM',kind:'air'},
 {theme:'JUNGLE',name:'FIRST ARMOR',kind:'armor'},
 {theme:'DESERT',name:'TRUCK COLUMN',kind:'convoy'},
 {theme:'DESERT',name:'TANK HUNT',kind:'tanks'},
 {theme:'DESERT',name:'IRON RAIL',kind:'rail'},
 {theme:'POLAR',name:'ICE RAID',kind:'ice'},
 {theme:'POLAR',name:'ENGINEER SIEGE',kind:'engineers'},
 {theme:'POLAR',name:'FINAL ASSAULT',kind:'final'}
];
let active=SC[0], idx=0, cycle=1, routes=[], railA=-5, airVisual=[], decor=[];

if(!DEF.armoredtrain){
 DEF.armoredtrain={hp:720,speed:8.5,engage:180,reload:1.3,damage:1.45,kind:'armor',vehicle:true,heavy:true,reward:30};
 if(typeof LABEL!=='undefined') LABEL.armoredtrain='ARMORED TRAIN';
}
function info(n){ n=Math.max(1,n|0); const i=(n-1)%9; return {i,scenario:SC[i],cycle:Math.floor((n-1)/9)+1}; }
function ph(i,n,t=2){ return mkPhase(i,n,t); }
function U(type,route=0){ return {type,route}; }
function P(type,a,s){ return {type,para:true,dropA:a,dropS:s,route:0}; }
function build5161(n){
 const x=info(n),q=[],hard=x.cycle>1;
 switch(x.i){
  case 0:
   q.push(ph(1,'PATROL',2),U('rifle',0),U('rifle',1),U('storm',0),ph(2,'FIRETEAM',2),U('rifle',1),U('mg',0));
   if(hard)q.push(U('storm',1)); break;
  case 1:
   q.push(ph(1,'AIRBORNE',3));
   [[-45,-35],[-42,30],[-30,-8],[-25,38],[-18,-34],[-10,10],[0,30]].forEach((d,j)=>q.push(P(j===4?'storm':'rifle',d[0],d[1])));
   if(hard)q.push(P('mg',-18,4)); break;
  case 2:
   q.push(ph(1,'CONTACT',2),U('rifle',0),U('technical',0),ph(2,'FIRST ARMOR',2),U('stug',1),U('motorcycle',0));
   if(hard)q.push(U('technical',1)); break;
  case 3:
   q.push(ph(1,'COLUMN',2),U('truck',0),U('truck',0),U('technical',0),ph(2,'REAR COLUMN',2),U('truck',0),U('truck',0));
   if(hard)q.push(U('halftrack',0)); break;
  case 4:
   q.push(ph(1,'LEFT ARMOR',2),U('stug',0),U('technical',0),ph(2,'RIGHT ARMOR',2),U('tank',1),U('motorcycle',1));
   if(hard)q.push(U('stug',0)); break;
  case 5:
   q.push(ph(1,'ESCORT',2),U('technical',0),U('rifle',1),ph(2,'ARMORED TRAIN',2),U('armoredtrain',2),U('technical',1));
   break;
  case 6:
   q.push(ph(1,'ICE RAID',2),U('halftrack',0),U('motorcycle',1),ph(2,'SECOND AXIS',2),U('apc',2),U('motorcycle',3));
   if(hard)q.push(U('technical',1)); break;
  case 7:
   q.push(ph(1,'SIEGE TEAM',2),U('engineertruck',0),U('technical',1),ph(2,'COVER TEAM',2),U('halftrack',1),U('rifle',0));
   break;
  default:
   q.push(ph(1,'FINAL CONTACT',2),U('technical',0),U('stug',1),ph(2,'COMMAND PUSH',3),U('tank',2),P('storm',-25,-34),P('rifle',-18,30));
   if(hard)q.push(U('apc',3));
 }
 return q;
}
buildWave=build5161;
previewWave=n=>{ const q=build5161(n); return {inf:q.filter(x=>x.type&&['rifle','storm','mg','engineer'].includes(x.type)).length,armor:q.filter(x=>x.type&&DEF[x.type]?.vehicle).length,eng:q.filter(x=>x.type==='engineertruck').length}; };

function routeSet(kind){
 const bunker=[70,0];
 if(kind==='infantry') return [[[-55,-48],[-38,-32],[-8,-18],[28,-8],bunker],[[-52,48],[-35,31],[-5,17],[30,7],bunker]];
 if(kind==='air') return [[[-30,-45],[-12,-20],[25,-8],bunker],[[-28,45],[-10,20],[26,8],bunker]];
 if(kind==='armor') return [[[-62,-44],[-40,-30],[-12,-22],[28,-10],bunker],[[-60,44],[-39,30],[-10,22],[30,10],bunker]];
 if(kind==='convoy') return [[[-60,45],[-45,20],[-28,-35],[0,-42],[28,25],bunker],[[-58,-45],[-42,-18],[-24,34],[5,36],[32,12],bunker]];
 if(kind==='tanks') return [[[-28,-52],[-18,-35],[7,-24],[35,-12],bunker],[[-30,52],[-16,35],[8,24],[36,12],bunker]];
 if(kind==='rail') return [[[-58,-40],[-30,-25],[8,-15],[38,-7],bunker],[[-55,40],[-28,26],[10,15],[40,7],bunker],[[railA,-58],[railA,58]]];
 if(kind==='ice') return [[[-62,-48],[-40,-32],[-5,-24],[30,-13],bunker],[[-45,52],[-26,36],[2,25],[33,13],bunker],[[-58,5],[-25,3],[18,2],bunker],[[-18,-52],[-5,-35],[25,-20],bunker]];
 if(kind==='engineers') return [[[-58,-38],[-35,-18],[-5,-5],[18,-24],[48,-8],bunker],[[-56,38],[-34,18],[-4,5],[20,24],[48,8],bunker]];
 return [[[-62,-48],[-40,-30],[-8,-22],[30,-12],bunker],[[-62,48],[-40,30],[-8,22],[30,12],bunker],[[-35,-52],[-20,-34],[8,-18],[40,-8],bunker],[[-30,52],[-16,34],[10,18],[42,8],bunker]];
}
function setup(n){
 const x=info(n); idx=x.i; active=x.scenario; cycle=x.cycle; railA=rnd(-8,8); routes=routeSet(active.kind); airVisual=[]; decor=[];
 if(active.kind==='armor'||active.kind==='ice'||active.kind==='final'){
   RIVER.a=active.kind==='ice'?rnd(-5,4):rnd(-18,-10); RIVER.half=active.kind==='ice'?7:5.7; RIVER.bridges=[-28,28]; RIVER.bridgeHalf=5.8;
 } else RIVER.a=-220;
 if(typeof TRENCHES!=='undefined'){
   TRENCHES.length=0;
   const sets={infantry:[[-5,-30],[18,26],[42,-17]],air:[[15,-34],[18,34]],armor:[[9,-30],[24,30]],convoy:[[14,-35],[38,31]],tanks:[[5,-14],[26,15]],rail:[[20,-30],[38,28]],ice:[[8,-36],[26,35]],engineers:[[16,-22],[18,22],[42,0]],final:[[8,-35],[10,35],[39,-18],[40,18]]};
   for(const p of (sets[active.kind]||[]))TRENCHES.push({a:p[0]+rnd(-2,2),s:p[1]+rnd(-2,2),w:rnd(8,12)});
 }
 if(typeof FOLIAGE!=='undefined') FOLIAGE.length=0;
 const corners=[[-68,-46],[-68,46],[50,-46],[50,46],[-15,-47],[-15,47],[34,-43],[34,43]];
 for(let i=0;i<corners.length;i++){const p=corners[i];decor.push({a:p[0]+rnd(-5,5),s:p[1]+rnd(-3,3),r:rnd(4,9),k:i%4});}
 const B=window.__JBD55&&window.__JBD55.BUILDING;
 if(B){ B.a=active.kind==='rail'?20:active.kind==='air'?8:rnd(8,42); B.s=active.kind==='engineers'?0:(Math.random()<.5?-1:1)*rnd(24,38); }
}

const currentSpawn=spawn;
spawn=function(type,lane=0,opts={}){
 const e=currentSpawn(type,lane,opts);
 if(!e)return e;
 if(type==='armoredtrain'){
   e.train5161=true; e.a=railA; e.s=-60; e.trainDir5161=1; e.speed=8.8; e.maxhp=700*(1+.08*(cycle-1)); e.hp=e.maxhp; e.fireClock=.5;
 }
 if(idx===0&&!e.vehicle){e.maxhp*=.72;e.hp=e.maxhp;e.speed*=1.15;}
 if(idx===1&&!e.vehicle){e.maxhp*=.74;e.hp=e.maxhp;}
 if(idx===3&&e.vehicle){e.maxhp*=.8;e.hp=e.maxhp;e.speed*=1.16;}
 return e;
};
spawnFromQueue=function(spec){
 const e=spawn(spec.type,spec.lane||0); if(!e)return e;
 e.route5161=spec.route??0; e.routeI5161=1;
 const r=routes[e.route5161]||routes[0];
 if(spec.para){
   e.a=spec.dropA;e.s=spec.dropS;e.parachuting=true;e.paraZ=58;e.paraDrift=rnd(-.7,.7);e.mode='air';e.action='';
   const p=isoAS(e.a,e.s,e.paraZ+28); airVisual.push({x:p.x+(Math.random()<.5?-W*.55:W*.55),y:Math.max(55,p.y-45),targetX:p.x,t:0,life:1.25,dir:1});
 } else if(e.train5161){ e.a=railA;e.s=-60; }
 else if(r&&r.length){e.a=r[0][0];e.s=r[0][1];}
 return e;
};
const currentMove=movementTarget;
movementTarget=function(e){
 if(e.train5161)return {a:e.a,s:e.s};
 if(e.route5161!==undefined&&routes[e.route5161]){
  const r=routes[e.route5161]; let i=Math.max(1,e.routeI5161||1),p=r[Math.min(i,r.length-1)];
  if(Math.hypot(e.a-p[0],e.s-p[1])<3.5&&i<r.length-1){i++;e.routeI5161=i;p=r[i];}
  return {a:p[0],s:p[1],vehicle:null,scenario:true};
 }
 return currentMove(e);
};
const currentEnemyUpdate=updateEnemy;
updateEnemy=function(e,dt){
 if(e.train5161){
   e.age+=dt;e.s+=e.trainDir5161*e.speed*dt;e.fireClock-=dt;
   if(e.fireClock<=0){enemyFire(e);e.fireClock=1.3;}
   if(e.s>62){damageBunker(16);e.hp=-1000;$('msg').textContent='TRAIN ESCAPED · BUNKER HIT';}
   return;
 }
 currentEnemyUpdate(e,dt);
};

const currentDamage=damageEnemy;
damageEnemy=function(e,ammo,base,a=e.a,s=e.s){
 const dl=Math.max(1,state.damageLvl||1),bonus=1+(dl-1)*(ammo==='ap'?.11:ammo==='he'?.09:.075);
 currentDamage(e,ammo,base*bonus,a,s);
};

function cols(){return active.theme==='DESERT'?{g1:'#9a7d50',g2:'#665238',road:'#80603d',edge:'#3e3227',detail:'#cfaa6e'}:active.theme==='POLAR'?{g1:'#aebfbd',g2:'#6f8987',road:'#879b97',edge:'#405b58',detail:'#edf5f3'}:{g1:'#4d7148',g2:'#263f2f',road:'#6c5a3b',edge:'#223429',detail:'#78966b'};}
function pathDraw(r,w=9){if(!r||r.length<2)return;const c=cols();ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=c.edge;ctx.lineWidth=w+5;ctx.globalAlpha=.72;ctx.beginPath();let p=isoAS(r[0][0],r[0][1]);ctx.moveTo(p.x,p.y);for(const q of r.slice(1)){p=isoAS(q[0],q[1]);ctx.lineTo(p.x,p.y)}ctx.stroke();ctx.strokeStyle=c.road;ctx.lineWidth=w;ctx.stroke();ctx.restore();}
function railDraw(){const p=isoAS(railA,-58),q=isoAS(railA,58);line(p.x,p.y-4,q.x,q.y-4,2,'#303734');line(p.x,p.y+4,q.x,q.y+4,2,'#303734');for(let s=-55;s<=55;s+=5){const x=isoAS(railA,s);line(x.x,x.y-7,x.x,x.y+7,1.2,'#735a3c');}}
drawGround=function(){
 const c=cols(),g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,c.g2);g.addColorStop(.5,c.g1);g.addColorStop(1,c.g2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 if(RIVER.a>-100){const p1=isoAS(RIVER.a-RIVER.half,-58),p2=isoAS(RIVER.a+RIVER.half,58);ctx.fillStyle=active.theme==='POLAR'?'#90b2b0':'#315e57';ctx.fillRect(0,Math.min(p1.y,p2.y),W,Math.abs(p2.y-p1.y));for(const b of RIVER.bridges){const a=isoAS(RIVER.a-RIVER.half-2,b),z=isoAS(RIVER.a+RIVER.half+2,b);line(a.x,a.y,z.x,z.y,18,'#6c573d');line(a.x,a.y,z.x,z.y,11,'#ad8956');}}
 if(active.kind==='rail'){pathDraw(routes[0],8);pathDraw(routes[1],8);railDraw();} else routes.forEach((r,i)=>pathDraw(r,active.kind==='convoy'?12:8));
 for(const d of decor){const p=isoAS(d.a,d.s);if(active.theme==='JUNGLE'){ellipse(p.x,p.y,d.r*2,d.r*.7,'#1f3825aa');for(let j=0;j<3;j++)circle(p.x+(j-1)*5,p.y-3-j*3,2+j,'#3b603b');}else if(active.theme==='DESERT'){ellipse(p.x,p.y,d.r*2.2,d.r*.65,'#c19a6255');circle(p.x,p.y-2,d.r*.55,'#75624a');}else{ellipse(p.x,p.y,d.r*2.2,d.r*.65,'#eef5f2aa');line(p.x,p.y,p.x,p.y-d.r*1.8,2,'#526662');}}
 const v=ctx.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.18,W*.5,H*.5,Math.max(W,H)*.72);v.addColorStop(0,'#0000');v.addColorStop(1,'#07100b9b');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
};

const currentDrawEnemy=drawEnemy;
drawEnemy=function(e){
 if(!e.train5161)return currentDrawEnemy(e);
 const p=isoAS(e.a,e.s),sc=PORTRAIT?.62:.86;ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);
 for(let i=0;i<4;i++){const x=-i*22;rr(x-13,-7,26,13,2,i===0?'#59645f':'#65706a','#1d2522',1.2);circle(x-8,8,3,'#1a201d');circle(x+8,8,3,'#1a201d');if(i===0){rr(x-8,-13,15,7,2,'#46514d','#1d2522',1);line(x+4,-9,x+24,-9,3,'#252c29')}else if(i===1){circle(x,-10,5,'#4b5551','#202725',1);line(x,-10,x+15,-12,2.4,'#252c29')}}ctx.restore();
 const bw=65,f=clamp(e.hp/e.maxhp,0,1);rr(p.x-bw/2,p.y-28,bw,4,2,'#211917bb');ctx.fillStyle='#c69b55';ctx.fillRect(p.x-bw/2+1,p.y-27,(bw-2)*f,2);
};

startWave=function(){
 if(state.phase==='wave')return;
 const next=state.wave+1;setup(next);state.wave=next;state.phase='wave';state.phaseIndex=0;state.waveKills=0;state.waveBounty=0;state.queue=buildWave(next);state.spawnClock=.05;state.chain=0;state.chainClock=0;hidePanel($('brief'));hidePanel($('shop'));
 const x=info(next);$('msg').textContent=`${x.scenario.theme} · ${x.scenario.name}`;updateUI();resize();
};
function brief(n){const x=info(n),p=previewWave(n);$('bw').textContent=n;$('bi').textContent=p.inf;$('ba').textContent=p.armor;$('be').textContent=p.eng;const t=$('brief')?.querySelector('h3');if(t)t.textContent=`FIELD BRIEF // ${x.scenario.name}`;const b=$('bnote');if(b)b.textContent=`${x.scenario.theme} · ${x.scenario.name}. Kort scenario met eigen routes en dreiging.`;}
$('briefBtn').onclick=()=>{brief(state.wave+1);showPanel($('brief'))};
$('nextBtn').onclick=()=>{hidePanel($('shop'));brief(state.wave+1);showPanel($('brief'))};

const currentUI=updateUI;
updateUI=function(){
 try{currentUI();}catch(_){ }
 const x=info(Math.max(1,state.wave||1)),h=document.querySelector('header strong');if(h)h.textContent=`JBD // 5.16.1 // ${x.scenario.name}`;
 $('wave').textContent=state.wave;$('supply').textContent=Math.round(state.supply);$('hp').textContent=Math.round(state.hp);$('armor').textContent=Math.round(state.armor);$('hostiles').textContent=state.enemies.filter(e=>e.hp>0).length+state.queue.filter(x=>!x.phase).length;
};

if(state.wave===0){state.supply=18;state.enemies.length=0;state.queue.length=0;state.shots.length=0;state.phase='ready';}
setup(1);brief(1);updateUI();resize();
window.__JBD5161={ready:true,info};
})();
