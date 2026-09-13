// JBD v5.17 // CLEAN SCENARIO ENGINE — rebuilt from stable v5.15
(()=>{
'use strict';
if(typeof state==='undefined'||typeof canvas==='undefined') return;

const SCENARIOS=[
 {name:'FOOT PATROL',theme:'JUNGLE',kind:'foot',desc:'alleen infantry'},
 {name:'AIRBORNE STORM',theme:'JUNGLE',kind:'air',desc:'paratroopers overal'},
 {name:'FIRST ARMOR',theme:'JUNGLE',kind:'armor',desc:'eerste pantser'},
 {name:'TRUCK COLUMN',theme:'DESERT',kind:'convoy',desc:'snelle truckcolonne'},
 {name:'TANK HUNT',theme:'DESERT',kind:'tank',desc:'open tankjacht'},
 {name:'IRON RAIL',theme:'DESERT',kind:'rail',desc:'armored train'},
 {name:'ICE RAID',theme:'POLAR',kind:'ice',desc:'snelle flankaanval'},
 {name:'ENGINEER SIEGE',theme:'POLAR',kind:'siege',desc:'stop de bouwploeg'},
 {name:'FINAL ASSAULT',theme:'POLAR',kind:'final',desc:'alles gecombineerd'}
];

let active=SCENARIOS[0],activeIdx=0,cycle=1;
let routes=[],railA=-4,levelClock=0;
const decor=[];
const tunedShots=new WeakSet();

function info(n){
 n=Math.max(1,n|0);
 const idx=(n-1)%SCENARIOS.length;
 return {scenario:SCENARIOS[idx],idx,cycle:Math.floor((n-1)/SCENARIOS.length)+1};
}
function phase(i,name,t=2){return mkPhase(i,name,t)}
function u(type,route=0,extra={}){return Object.assign({type,lane:0,route517:route},extra)}
function p(type,a,s){return {type,lane:s,para517:true,dropA:a,dropS:s,route517:0}}

buildWave=function(n){
 const x=info(n),q=[],hard=x.cycle>1;
 switch(x.idx){
  case 0:
   q.push(phase(1,'PATROL',2),u('rifle',0),u('rifle',1),u('storm',0));
   q.push(phase(2,'FIRETEAM',2),u('rifle',1),u('mg',0));
   if(hard)q.push(u('storm',1));
   break;
  case 1:
   q.push(phase(1,'AIRBORNE',3));
   [[-58,-36],[-55,35],[-42,-12],[-38,18],[-25,-34],[-20,32],[-8,-8],[2,23]]
    .forEach((d,i)=>q.push(p(i%4===3?'storm':'rifle',d[0],d[1])));
   if(hard)q.push(p('mg',-18,4));
   break;
  case 2:
   q.push(phase(1,'FIRST ARMOR',2),u('rifle',0),u('technical',0),u('rifle',1));
   q.push(phase(2,'HEAVY CONTACT',2),u('stug',1),u('motorcycle',0));
   if(hard)q.push(u('technical',1));
   break;
  case 3:
   q.push(phase(1,'COLUMN',2),u('truck',0),u('truck',0),u('technical',0));
   q.push(phase(2,'REAR GUARD',2),u('truck',0),u('truck',0));
   if(hard)q.push(u('halftrack',0));
   break;
  case 4:
   q.push(phase(1,'LEFT ARMOR',2),u('stug',0),u('technical',0));
   q.push(phase(2,'RIGHT ARMOR',2),u('tank',1),u('motorcycle',1));
   if(hard)q.push(u('stug',0));
   break;
  case 5:
   q.push(phase(1,'RAIL ESCORT',2),u('technical',0),u('rifle',1));
   q.push(phase(2,'ARMORED TRAIN',2),u('tank',2,{train517:true}),u('technical',1));
   if(hard)q.push(u('halftrack',0));
   break;
  case 6:
   q.push(phase(1,'ICE RAID',2),u('halftrack',0),u('motorcycle',1));
   q.push(phase(2,'SECOND AXIS',2),u('apc',2),u('motorcycle',3));
   if(hard)q.push(u('technical',1));
   break;
  case 7:
   q.push(phase(1,'SIEGE TEAM',2),u('engineertruck',0),u('technical',1));
   q.push(phase(2,'COVER TEAM',2),u('halftrack',1),u('rifle',0));
   if(hard)q.push(u('engineertruck',1));
   break;
  default:
   q.push(phase(1,'FINAL CONTACT',2),u('technical',0),u('stug',1));
   q.push(phase(2,'COMMAND PUSH',3),u('tank',2),p('storm',-28,-33),p('rifle',-22,29),u('apc',3));
   if(hard)q.push(u('stug',0));
 }
 return q;
};

previewWave=function(n){
 const q=buildWave(n);
 return {
  inf:q.filter(x=>x.type&&['rifle','storm','mg','grenadier','engineer'].includes(x.type)).length,
  armor:q.filter(x=>x.type&&DEF[x.type]?.vehicle).length,
  eng:q.filter(x=>x.type==='engineertruck'||x.type==='engineer').length
 };
};

function paths(kind){
 if(kind==='foot')return[
  [[-101,-47],[-76,-34],[-42,-20],[3,-10],[42,-4],[77,0]],
  [[-101,47],[-74,34],[-40,22],[4,12],[42,5],[77,0]]
 ];
 if(kind==='air')return[
  [[-62,-44],[-38,-20],[6,-8],[77,0]],
  [[-60,44],[-34,20],[12,9],[77,0]]
 ];
 if(kind==='armor')return[
  [[-101,-43],[-65,-31],[-24,-23],[15,-12],[50,-4],[77,0]],
  [[-101,43],[-62,33],[-22,24],[17,13],[50,5],[77,0]]
 ];
 if(kind==='convoy')return[
  [[-101,43],[-80,24],[-57,-30],[-26,-40],[7,-4],[40,20],[77,0]],
  [[-101,-44],[-69,-28],[-37,36],[7,31],[49,6],[77,0]]
 ];
 if(kind==='tank')return[
  [[-40,-52],[-30,-36],[-7,-23],[28,-13],[77,0]],
  [[-40,52],[-26,37],[2,24],[31,13],[77,0]]
 ];
 if(kind==='rail')return[
  [[-101,-42],[-60,-30],[-17,-19],[30,-9],[77,0]],
  [[-101,42],[-56,30],[-8,17],[36,8],[77,0]],
  [[railA,-58],[railA,58]]
 ];
 if(kind==='ice')return[
  [[-101,-46],[-60,-33],[-18,-25],[25,-16],[77,0]],
  [[-52,52],[-37,38],[-3,27],[31,15],[77,0]],
  [[-101,5],[-56,4],[7,2],[77,0]],
  [[-17,-52],[-5,-38],[25,-21],[77,0]]
 ];
 if(kind==='siege')return[
  [[-101,-38],[-70,-18],[-26,-4],[14,-22],[52,-8],[77,0]],
  [[-101,38],[-68,18],[-23,5],[16,24],[52,8],[77,0]]
 ];
 return[
  [[-101,-47],[-58,-31],[-18,-22],[26,-15],[77,0]],
  [[-101,47],[-58,31],[-18,22],[26,15],[77,0]],
  [[-50,-52],[-31,-35],[3,-17],[42,-7],[77,0]],
  [[-46,52],[-26,35],[5,17],[43,7],[77,0]]
 ];
}

function setupMap(n){
 const x=info(n);active=x.scenario;activeIdx=x.idx;cycle=x.cycle;levelClock=0;
 railA=rnd(-8,8);routes=paths(active.kind);decor.length=0;

 if(['armor','ice','final'].includes(active.kind)){
  RIVER.a=active.kind==='ice'?rnd(-5,3):rnd(-22,-12);
  RIVER.half=active.kind==='ice'?7.0:5.8;
  RIVER.bridges=active.kind==='final'?[-30,29]:[rnd(-35,-19),rnd(19,35)];
  RIVER.bridgeHalf=active.kind==='ice'?6.0:5.0;
 }else{
  RIVER.a=-220;
 }

 const B=window.__JBD55?.BUILDING;
 if(B){
  const bp={
   foot:[26,34],air:[18,-35],armor:[30,33],convoy:[6,-37],tank:[18,0],
   rail:[25,-35],ice:[31,36],siege:[28,0],final:[18,-38]
  }[active.kind]||[25,32];
  B.a=bp[0];B.s=bp[1];
 }

 if(typeof TRENCHES!=='undefined'){
  TRENCHES.length=0;
  const sets={
   foot:[[-18,-29],[10,27],[39,-18]],air:[[17,-37],[20,37]],armor:[[9,-31],[24,31]],
   convoy:[[10,-35],[42,31]],tank:[[6,-14],[25,15]],rail:[[24,-28],[39,27]],
   ice:[[10,-36],[22,35]],siege:[[18,-20],[18,20],[43,0]],final:[[8,-34],[10,34],[40,-18],[42,18]]
  };
  for(const [a,s] of sets[active.kind]||[])TRENCHES.push({a,s,w:rnd(8,12)});
 }

 if(typeof FOLIAGE!=='undefined'){
  FOLIAGE.length=0;
  const count=active.theme==='JUNGLE'?(active.kind==='air'?36:54):active.theme==='DESERT'?22:16;
  let tries=0;
  while(FOLIAGE.length<count&&tries++<count*12){
   const a=rnd(-88,65),s=rnd(-49,49);
   if(a>56&&Math.abs(s)<15)continue;
   let close=false;
   for(const r of routes){for(const q of r){if(Math.hypot(a-q[0],s-q[1])<7){close=true;break}}if(close)break}
   if(close&&Math.random()<.75)continue;
   const xy=xyFromAS(a,s);
   FOLIAGE.push({
    x:xy.x,y:xy.y,
    kind:active.theme==='JUNGLE'?(Math.random()<.26?'palm':Math.random()<.60?'bamboo':'bush'):'bush',
    size:rnd(.65,1.08)
   });
  }
 }

 [[-82,-44],[-82,44],[45,-44],[45,44]].forEach((d,i)=>decor.push({a:d[0]+rnd(-5,5),s:d[1]+rnd(-4,4),i}));
}

const baseSpawn=spawn;
spawn=function(type,lane=0,opts={}){
 const e=baseSpawn(type,lane,opts);
 if(activeIdx===0&&!e.vehicle){e.maxhp*=.72;e.hp=e.maxhp;e.speed*=1.12}
 if(activeIdx===3&&e.vehicle){e.maxhp*=.80;e.hp=e.maxhp;e.speed*=1.13}
 return e;
};

const baseSpawnFromQueue=spawnFromQueue;
spawnFromQueue=function(spec){
 const e=baseSpawn(spec.type,spec.lane||0);
 e.route517=spec.route517??0;
 e.routeIndex517=1;
 const r=routes[e.route517]||routes[0];

 if(spec.para517){
  e.a=spec.dropA+rnd(-2,2);e.s=spec.dropS+rnd(-2,2);
  e.parachuting=true;e.paraZ=rnd(50,70);e.paraDrift=rnd(-1,1);e.mode='air';e.action='';e.fireClock=2;
 }else if(spec.train517){
  e.train517=true;e.boss515=false;e.a=railA;e.s=-60;e.route517=2;e.routeIndex517=1;
  e.maxhp*=1.75;e.hp=e.maxhp;e.speed=9.0;e.damage*=1.10;e.reload=1.45;e.fireClock=.4;
 }else if(r&&r.length){
  e.a=r[0][0]+rnd(-1.5,1.5);e.s=r[0][1]+rnd(-1.5,1.5);
 }
 if(spec.follow)setTimeout(()=>assignFollowers(),0);
 return e;
};

const baseMovement=movementTarget;
movementTarget=function(e){
 if(e.train517)return {a:e.a,s:e.s,vehicle:null};
 if(e.route517!==undefined&&routes[e.route517]){
  const r=routes[e.route517];
  let i=Math.max(1,e.routeIndex517||1);
  let q=r[Math.min(i,r.length-1)];
  if(q&&Math.hypot(e.a-q[0],e.s-q[1])<4&&i<r.length-1){i++;e.routeIndex517=i;q=r[i]}
  if(q)return {a:q[0],s:q[1],vehicle:null};
 }
 return baseMovement(e);
};

const baseUpdateEnemy=updateEnemy;
updateEnemy=function(e,dt){
 if(e.train517){
  e.age+=dt;e.fireClock-=dt;e.s+=e.speed*dt;
  if(e.fireClock<=0){enemyFire(e);e.fireClock=e.reload*rnd(.9,1.1)}
  if(e.s>62){damageBunker(16);e.hp=-1000;$('msg').textContent='ARMORED TRAIN DOORBRAAK'}
  return;
 }
 baseUpdateEnemy(e,dt);
};

function theme(){
 if(active.theme==='DESERT')return{top:'#6b573b',mid:'#9f8356',bottom:'#5f4c35',road:'#8a6742',edge:'#493829',detail:'#d0ab6f'};
 if(active.theme==='POLAR')return{top:'#7f9997',mid:'#b5c4c1',bottom:'#758e8c',road:'#8fa19d',edge:'#506866',detail:'#edf5f2'};
 return{top:'#233c2b',mid:'#5a754f',bottom:'#2f4a35',road:'#705a3c',edge:'#283a2d',detail:'#8daa7c'};
}
function routeDraw(r,w=9,col=null){
 if(!r||r.length<2)return;
 const t=theme();ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 ctx.strokeStyle=t.edge;ctx.lineWidth=w+5;ctx.globalAlpha=.70;ctx.beginPath();
 let p=isoAS(r[0][0],r[0][1]);ctx.moveTo(p.x,p.y);
 for(const q of r.slice(1)){p=isoAS(q[0],q[1]);ctx.lineTo(p.x,p.y)}
 ctx.stroke();ctx.strokeStyle=col||t.road;ctx.lineWidth=w;ctx.globalAlpha=.68;ctx.stroke();ctx.restore();
}
function drawScenarioRiver(){
 if(RIVER.a<-100)return;
 const y1=isoAS(RIVER.a-RIVER.half,0).y,y2=isoAS(RIVER.a+RIVER.half,0).y;
 ctx.fillStyle=active.theme==='POLAR'?'#8eacab':'#315f58';ctx.fillRect(0,Math.min(y1,y2),W,Math.abs(y2-y1));
 for(const bs of RIVER.bridges){const a1=RIVER.a-RIVER.half-2,a2=RIVER.a+RIVER.half+2,p=isoAS(a1,bs),q=isoAS(a2,bs);line(p.x,p.y,q.x,q.y,18,'#6f5738');line(p.x,p.y,q.x,q.y,11,'#a17b4d')}
}
function drawRail(){
 const p=isoAS(railA,-58),q=isoAS(railA,58);
 line(p.x,p.y-4,q.x,q.y-4,2,'#303633');line(p.x,p.y+4,q.x,q.y+4,2,'#303633');
 for(let s=-55;s<=55;s+=5){const z=isoAS(railA,s);line(z.x,z.y-7,z.x,z.y+7,1.4,'#6d573d')}
}
drawGround=function(){
 const t=theme(),g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,t.top);g.addColorStop(.52,t.mid);g.addColorStop(1,t.bottom);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 drawScenarioRiver();
 if(active.kind==='rail'){routeDraw(routes[0],8);routeDraw(routes[1],8);drawRail()}
 else routes.forEach((r,i)=>routeDraw(r,active.kind==='convoy'?12:active.kind==='air'?6:9,active.kind==='ice'&&i>1?'#9aafaa':null));
 if(active.kind==='air'){const c=isoAS(-18,0);ellipse(c.x,c.y,W*.28,H*.095,'#71805e55','#40503d',1)}
 for(const d of decor){const z=isoAS(d.a,d.s);if(active.theme==='JUNGLE')circle(z.x,z.y,d.i%2?5:7,'#31533a77');else if(active.theme==='DESERT')ellipse(z.x,z.y,10,3,'#c7a46d55');else ellipse(z.x,z.y,12,3,'#edf4f0aa')}
 const v=ctx.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.17,W*.5,H*.5,Math.max(W,H)*.75);v.addColorStop(0,'#0000');v.addColorStop(1,'#07100ba0');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
};

const baseDrawEnemy=drawEnemy;
drawEnemy=function(e){
 if(!e.train517)return baseDrawEnemy(e);
 const p=isoAS(e.a,e.s),sc=PORTRAIT?.58:.82;ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);
 for(let i=0;i<4;i++){const x=-i*22;ellipse(x,9,15,4,'#10171366');rr(x-13,-7,26,13,2,i===0?'#59645f':'#626b66','#1d2522',1.3);circle(x-8,8,3,'#1a201d');circle(x+8,8,3,'#1a201d');if(i===0){rr(x-9,-13,16,7,2,'#49534f','#1d2522',1);line(x+4,-9,x+24,-9,3,'#252c29')}else if(i===1){circle(x,-10,5,'#4c5652','#202725',1);line(x,-10,x+15,-12,2.5,'#252c29')}}
 ctx.restore();
 const w=70*(PORTRAIT?.72:1),y=p.y-(PORTRAIT?30:38),f=clamp(e.hp/e.maxhp,0,1);rr(p.x-w/2,y,w,4,2,'#201817bb');ctx.fillStyle='#c69b55';ctx.fillRect(p.x-w/2+1,y+1,(w-2)*f,2);
};

const baseStart=startWave;
startWave=function(){
 baseStart();
 setupMap(state.wave);
 state.spawnClock=.08;
 const x=info(state.wave);
 $('msg').textContent=`${x.scenario.theme} · ${x.scenario.name}`;
 updateUI();resize();
 if(x.idx===1&&window.__JBD512?.spawnPlane)window.__JBD512.spawnPlane();
};

const baseUpdate=update;
update=function(dt){
 baseUpdate(dt);
 levelClock+=dt;

 if(window.__JBD512?.PLANES&&![1,8].includes(activeIdx))window.__JBD512.PLANES.length=0;

 for(const sh of state.shots){
  if(sh.enemy||tunedShots.has(sh))continue;
  tunedShots.add(sh);
  const dl=Math.max(1,state.damageLvl||1),bl=Math.max(1,state.blastLvl||1);
  if(sh.type==='mg')sh.damage*=1+.08*(dl-1);
  else if(sh.type==='ap')sh.damage*=1+.12*(dl-1);
  else if(sh.type==='he'){sh.damage*=1+.09*(dl-1);sh.splash*=1+.07*(bl-1)}
 }

 if(state.phase==='wave'){
  const alive=state.enemies.filter(e=>e.hp>0).length;
  const queued=state.queue.filter(x=>!x.phase).length;
  if(queued&&alive<=2)state.spawnClock=Math.min(state.spawnClock,.08);
  if(levelClock>10&&queued)state.spawnClock-=dt*.18;
 }
};

function brief(n){
 const x=info(n),pr=previewWave(n);
 $('bw').textContent=n;$('bi').textContent=pr.inf;$('ba').textContent=pr.armor;$('be').textContent=pr.eng;
 const title=$('brief')?.querySelector('h3');if(title)title.textContent=`FIELD BRIEF // ${x.scenario.name}`;
 const note=$('bnote');if(note)note.textContent=`${x.scenario.theme} · ${x.scenario.name} — ${x.scenario.desc}. Kort scenario met eigen kaart en aanvalstype.`;
}
$('briefBtn').onclick=()=>{brief(state.wave+1);showPanel($('brief'))};
$('nextBtn').onclick=()=>{hidePanel($('shop'));brief(state.wave+1);showPanel($('brief'))};

if(state.wave===0&&state.damageLvl===1&&state.coolLvl===1)state.supply=18;

const baseUI=updateUI;
updateUI=function(){
 baseUI();
 const x=info(Math.max(1,state.wave||1));
 const h=document.querySelector('header strong');if(h)h.textContent=`JBD // 5.17 // ${x.scenario.name}`;
 const psych=$('psych514');if(psych)psych.style.display='none';
 const btn=$('nextBtn');if(btn&&state.phase==='shop')btn.textContent=`NEXT · ${info(state.wave+1).scenario.name}`;
};

setupMap(1);brief(1);updateUI();resize();
window.__JBD517={SCENARIOS,info};
})();