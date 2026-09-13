// JBD v5.16 // SCENARIO CAMPAIGN — short, progressive, varied maps and enemy stories
(()=>{
'use strict';
if(typeof state==='undefined') return;

const SCENARIOS=[
  {theme:'JUNGLE',name:'FOOT PATROL',desc:'alleen infantry · leer richten en bursts',layout:'foot',river:false},
  {theme:'JUNGLE',name:'AIRBORNE STORM',desc:'paratroopers uit meerdere vliegtuigen',layout:'airfield',river:false},
  {theme:'JUNGLE',name:'FIRST ARMOR',desc:'eerste pantser · AP begint ertoe te doen',layout:'bridge',river:true},
  {theme:'DESERT',name:'TRUCK COLUMN',desc:'snelle colonne · trucks vóór ze lossen',layout:'convoy',river:false},
  {theme:'DESERT',name:'TANK HUNT',desc:'open terrein · mik op weak points',layout:'tankhunt',river:false},
  {theme:'DESERT',name:'IRON RAIL',desc:'railroad · vernietig de armored train',layout:'rail',river:false},
  {theme:'POLAR',name:'ICE RAID',desc:'snelle halftracks over meerdere assen',layout:'ice',river:true},
  {theme:'POLAR',name:'ENGINEER SIEGE',desc:'stop engineers vóór hun bunker staat',layout:'siege',river:false},
  {theme:'POLAR',name:'FINAL ASSAULT',desc:'command armor + airborne flank',layout:'final',river:true}
];
let active=SCENARIOS[0],activeIndex=0,cycle=1;
let routes516=[];
let railA516=-4;
let scenarioClock=0;
const AIR516=[];
const DECOR516=[];

if(!DEF.armoredtrain){
  DEF.armoredtrain={hp:760,speed:8.2,engage:200,reload:1.35,damage:1.45,kind:'armor',vehicle:true,heavy:true,reward:32};
  LABEL.armoredtrain='ARMORED TRAIN';
}

function scenarioInfo(n){
  n=Math.max(1,n|0);
  const idx=(n-1)%SCENARIOS.length;
  return {scenario:SCENARIOS[idx],idx,cycle:Math.floor((n-1)/SCENARIOS.length)+1};
}
function lane(){return rnd(-38,38)}
function phase(i,name,threshold=2){return mkPhase(i,name,threshold)}
function para(type='rifle',s=0,a=-45){return{type,lane:s,para:true,dropA:a,dropS:s,entry:'air'}}
function unit(type,route=0,entry='route'){return{type,lane:lane(),route,entry}}

function buildScenarioWave(n){
  const {idx,cycle}=scenarioInfo(n),q=[];
  const extra=cycle>1?1:0;
  if(idx===0){
    q.push(phase(1,'FOOT PATROL',2));
    q.push(unit('rifle',0));q.push(unit('rifle',1));q.push(unit('storm',0));
    q.push(phase(2,'SECOND FIRETEAM',2));
    q.push(unit('rifle',1));q.push(unit('mg',0));
    if(extra)q.push(unit('storm',1));
  }else if(idx===1){
    q.push(phase(1,'AIRBORNE',3));
    const drops=[[-60,-35],[-58,30],[-44,-10],[-40,38],[-35,-36],[-25,5],[-20,31],[-12,-20],[-6,16]];
    drops.forEach((d,i)=>q.push(para(i%4===3?'storm':'rifle',d[1],d[0])));
    if(extra){q.push(para('mg',-5,-30));q.push(para('rifle',24,-18));}
  }else if(idx===2){
    q.push(phase(1,'FIRST ARMOR',2));
    q.push(unit('rifle',0));q.push(unit('technical',0));q.push(unit('rifle',1));
    q.push(phase(2,'ARMORED PUSH',2));
    q.push(unit('stug',1));q.push(unit('motorcycle',0));
    if(extra)q.push(unit('technical',1));
  }else if(idx===3){
    q.push(phase(1,'COLUMN',2));
    q.push(unit('truck',0));q.push(unit('truck',0));q.push(unit('technical',0));
    q.push(phase(2,'REAR GUARD',2));
    q.push(unit('truck',0));q.push(unit('truck',0));
    if(extra)q.push(unit('halftrack',0));
  }else if(idx===4){
    q.push(phase(1,'LEFT ARMOR',2));
    q.push(unit('stug',0));q.push(unit('technical',0));
    q.push(phase(2,'RIGHT ARMOR',2));
    q.push(unit('tank',1));q.push(unit('motorcycle',1));
    if(extra)q.push(unit('stug',0));
  }else if(idx===5){
    q.push(phase(1,'RAIL ESCORT',2));
    q.push(unit('technical',0));q.push(unit('rifle',1));
    q.push(phase(2,'ARMORED TRAIN',2));
    q.push({type:'armoredtrain',entry:'rail',route:2,lane:0});
    q.push(unit('technical',1));
    if(extra)q.push(unit('halftrack',0));
  }else if(idx===6){
    q.push(phase(1,'ICE RAID',2));
    q.push(unit('halftrack',0));q.push(unit('motorcycle',1));
    q.push(phase(2,'SECOND AXIS',2));
    q.push(unit('apc',2));q.push(unit('motorcycle',3));
    if(extra)q.push(unit('technical',1));
  }else if(idx===7){
    q.push(phase(1,'SIEGE TEAM',2));
    q.push(unit('engineertruck',0));q.push(unit('technical',1));
    q.push(phase(2,'COVER TEAM',2));
    q.push(unit('halftrack',1));q.push(unit('rifle',0));
    if(extra)q.push(unit('engineertruck',1));
  }else{
    q.push(phase(1,'FINAL CONTACT',2));
    q.push(unit('technical',0));q.push(unit('stug',1));
    q.push(phase(2,'COMMAND PUSH',3));
    q.push(unit('tank',2));q.push(para('storm',-32,-34));q.push(para('rifle',28,-28));q.push(para('rifle',4,-22));
    if(extra)q.push(unit('apc',3));
  }
  return q;
}
buildWave=buildScenarioWave;
previewWave=n=>{
  const q=buildScenarioWave(n),inf=q.filter(x=>x.type&&['rifle','storm','mg','grenadier','engineer'].includes(x.type)).length;
  return{inf,armor:q.filter(x=>x.type&&DEF[x.type]?.vehicle).length,eng:q.filter(x=>x.type==='engineertruck'||x.type==='engineer').length};
};

function jitterPath(points,j=3){return points.map(([a,s],i)=>[a+(i&&i<points.length-1?rnd(-j,j):0),s+(i&&i<points.length-1?rnd(-j,j):0)])}
function buildRoutes(layout){
  if(layout==='foot')return[
    jitterPath([[-102,-47],[-76,-34],[-46,-23],[-10,-12],[32,-5],[77,0]],3),
    jitterPath([[-102,47],[-72,36],[-42,22],[-4,13],[35,6],[77,0]],3)
  ];
  if(layout==='airfield')return[
    [[-70,-45],[-38,-18],[10,-7],[77,0]], [[-62,45],[-34,22],[15,9],[77,0]]
  ];
  if(layout==='bridge')return[
    jitterPath([[-102,-44],[-63,-34],[RIVER.a-8,RIVER.bridges[0]],[RIVER.a+8,RIVER.bridges[0]],[30,-10],[77,0]],2),
    jitterPath([[-102,44],[-63,35],[RIVER.a-8,RIVER.bridges[1]],[RIVER.a+8,RIVER.bridges[1]],[32,12],[77,0]],2)
  ];
  if(layout==='convoy')return[
    jitterPath([[-102,42],[-82,25],[-58,-28],[-26,-40],[8,-5],[42,18],[77,0]],4),
    jitterPath([[-102,-44],[-70,-28],[-35,35],[8,30],[48,5],[77,0]],4)
  ];
  if(layout==='tankhunt')return[
    jitterPath([[-38,-53],[-30,-36],[-8,-24],[28,-14],[77,0]],2),
    jitterPath([[-40,53],[-25,37],[0,25],[32,14],[77,0]],2)
  ];
  if(layout==='rail')return[
    jitterPath([[-102,-42],[-55,-28],[-8,-18],[35,-8],[77,0]],2),
    jitterPath([[-100,42],[-50,30],[0,18],[40,8],[77,0]],2),
    [[railA516,-58],[railA516,58]]
  ];
  if(layout==='ice')return[
    [[-102,-46],[-62,-32],[RIVER.a-7,RIVER.bridges[0]],[RIVER.a+7,RIVER.bridges[0]],[34,-18],[77,0]],
    [[-50,53],[-36,39],[RIVER.a-7,RIVER.bridges[1]],[RIVER.a+7,RIVER.bridges[1]],[36,18],[77,0]],
    [[-102,8],[-55,5],[10,2],[77,0]],
    [[-18,-53],[-4,-38],[25,-22],[77,0]]
  ];
  if(layout==='siege')return[
    jitterPath([[-102,-38],[-70,-18],[-25,-4],[16,-22],[52,-8],[77,0]],3),
    jitterPath([[-102,38],[-68,18],[-22,5],[18,25],[52,8],[77,0]],3)
  ];
  return[
    [[-102,-47],[-58,-30],[RIVER.a-7,RIVER.bridges[0]],[RIVER.a+7,RIVER.bridges[0]],[34,-18],[77,0]],
    [[-102,47],[-58,31],[RIVER.a-7,RIVER.bridges[1]],[RIVER.a+7,RIVER.bridges[1]],[34,18],[77,0]],
    [[-52,-53],[-30,-34],[2,-16],[42,-7],[77,0]],
    [[-45,53],[-24,35],[4,18],[44,7],[77,0]]
  ];
}

function setupScenario(n){
  const info=scenarioInfo(n);active=info.scenario;activeIndex=info.idx;cycle=info.cycle;scenarioClock=0;AIR516.length=0;DECOR516.length=0;
  if(window.__JBD512?.PLANES)window.__JBD512.PLANES.length=0;
  if(window.__JBD512)window.__JBD512.spawnPlane=()=>{};

  if(active.river){
    RIVER.a=active.layout==='ice'?rnd(-8,2):rnd(-22,-12);RIVER.half=active.layout==='ice'?7.2:rnd(5.4,6.4);
    RIVER.bridges=active.layout==='final'?[-30,28]:[rnd(-35,-19),rnd(19,35)];RIVER.bridgeHalf=active.layout==='ice'?6.2:5.1;
  }else RIVER.a=-220;
  railA516=rnd(-8,8);
  routes516=buildRoutes(active.layout);

  const B=(window.__JBD55&&window.__JBD55.BUILDING);
  if(B){
    if(active.layout==='airfield'){B.a=24;B.s=34}
    else if(active.layout==='rail'){B.a=22;B.s=-35}
    else if(active.layout==='siege'){B.a=28;B.s=0}
    else{B.a=rnd(8,45);B.s=(Math.random()<.5?-1:1)*rnd(23,40)}
  }

  if(typeof TRENCHES!=='undefined'){
    TRENCHES.length=0;
    const layouts={foot:[[-20,-30],[8,27],[38,-18]],airfield:[[18,-36],[18,36]],bridge:[[10,-31],[22,30]],convoy:[[12,-34],[40,31]],tankhunt:[[8,-12],[24,15]],rail:[[25,-28],[38,26]],ice:[[12,-35],[20,34]],siege:[[20,-20],[20,20],[42,0]],final:[[8,-34],[10,34],[38,-18],[40,18]]};
    for(const [a,s] of layouts[active.layout]||[])TRENCHES.push({a:a+rnd(-3,3),s:s+rnd(-3,3),w:rnd(8,12)});
  }

  if(typeof FOLIAGE!=='undefined'){
    FOLIAGE.length=0;
    const target=active.theme==='JUNGLE'?(active.layout==='airfield'?42:58):active.theme==='DESERT'?24:18;
    let tries=0;
    while(FOLIAGE.length<target&&tries++<target*8){
      const a=rnd(-88,66),s=rnd(-48,48);
      if(a>56&&Math.abs(s)<16)continue;
      let nearRoute=false;for(const r of routes516)for(const p of r)if(Math.hypot(a-p[0],s-p[1])<7){nearRoute=true;break}
      if(nearRoute&&Math.random()<.72)continue;
      if(active.layout==='airfield'&&Math.hypot(a+18,s)<30)continue;
      const xy=xyFromAS(a,s);FOLIAGE.push({x:xy.x,y:xy.y,kind:active.theme==='JUNGLE'?(Math.random()<.25?'palm':Math.random()<.6?'bamboo':'bush'):'bush',size:rnd(.65,1.12)});
    }
  }
  const corners=[[-78,-43],[-78,43],[48,-43],[48,43]];
  corners.forEach((p,i)=>DECOR516.push({a:p[0]+rnd(-6,6),s:p[1]+rnd(-4,4),k:i%3,r:rnd(5,9)}));
}

const oldSpawn516=spawn;
spawn=function(type,lane=0,opts={}){
  const e=oldSpawn516(type,lane,opts);
  const idx=scenarioInfo(Math.max(1,state.wave||1)).idx;
  if(idx===0&&!e.vehicle){e.maxhp*=.72;e.hp=e.maxhp;e.speed*=1.10}
  if(idx===1&&!e.vehicle){e.maxhp*=.76;e.hp=e.maxhp}
  if(idx===2&&e.vehicle){e.maxhp*=.86;e.hp=e.maxhp}
  if(idx===3&&e.vehicle){e.maxhp*=.78;e.hp=e.maxhp;e.speed*=1.12}
  if(type==='armoredtrain'){e.maxhp*=1+.08*(cycle-1);e.hp=e.maxhp;e.boss515=true;e.trainDir516=Math.random()<.5?1:-1;e.a=railA516;e.s=e.trainDir516>0?-60:60;e.fireClock=.4;}
  return e;
};

spawnFromQueue=function(spec){
  const e=spawn(spec.type,spec.lane||0);
  e.route516=spec.route??0;e.routeIndex516=1;
  const r=routes516[e.route516]||routes516[0];
  if(spec.para){
    e.a=spec.dropA+rnd(-2,2);e.s=spec.dropS+rnd(-2,2);e.parachuting=true;e.scenarioPara516=true;e.paraZ=rnd(48,72);e.paraDrift=rnd(-1.0,1.0);e.mode='air';e.action='';e.fireClock=2;
    ensureAirPass(e.s);
  }else if(spec.entry==='rail'){
    e.a=railA516;e.s=e.trainDir516>0?-60:60;
  }else if(r&&r.length){
    e.a=r[0][0]+rnd(-2,2);e.s=r[0][1]+rnd(-2,2);
  }
  return e;
};

const oldMovement516=movementTarget;
movementTarget=function(e){
  if(e.type==='armoredtrain')return{a:e.a,s:e.s};
  if(e.route516!==undefined&&routes516[e.route516]){
    const r=routes516[e.route516];
    let i=Math.max(1,e.routeIndex516||1),p=r[Math.min(i,r.length-1)];
    if(Math.hypot(e.a-p[0],e.s-p[1])<4&&i<r.length-1){e.routeIndex516=++i;p=r[i]}
    return{a:p[0],s:p[1],vehicle:null,scenario:true};
  }
  return oldMovement516(e);
};

unloadVehicle=function(e){
  if(e.unloaded)return;e.unloaded=true;
  const count=e.type==='engineertruck'?1:(e.type==='truck'?2:(e.type==='halftrack'||e.type==='apc'?2:0));
  for(let i=0;i<count;i++){
    const type=e.type==='engineertruck'?'engineer':(i?'storm':'rifle');const n=spawn(type,e.s+rnd(-3,3),{slot:i-1});n.a=e.a-rnd(2,5);n.followId=null;n.route516=e.route516;n.routeIndex516=e.routeIndex516;
    if(type==='engineer'){n.buildState='seek';n.digClock=99}
  }
  e.retreat=true;e.mode='move';floater(e.a,e.s,e.type==='engineertruck'?'ENGINEER OUT':'DISMOUNT',C.gold);
};

const oldUpdateEnemy516=updateEnemy;
updateEnemy=function(e,dt){
  if(e.type==='armoredtrain'){
    e.age+=dt;e.fireClock-=dt;e.s+=e.trainDir516*e.speed*dt;
    if(e.fireClock<=0){enemyFire(e);e.fireClock=e.reload*rnd(.9,1.1)}
    if(Math.abs(e.s)>64){damageBunker(18);e.hp=-1000;banner516('TRAIN ESCAPED','#ff8c70')}
    return;
  }
  oldUpdateEnemy516(e,dt);
};

function ensureAirPass(s){
  if(AIR516.some(p=>Math.abs(p.s-s)<20&&p.t<4))return;
  const dir=Math.random()<.5?1:-1;AIR516.push({x:dir>0?-80:W+80,y:rnd(48,112),dir,v:rnd(150,190),t:0,s});
}
function banner516(text,col='#f0c65f'){const m=$('msg');if(m)m.textContent=text}

let seenShots516=new WeakSet();
function tuneShots516(){
  for(const sh of state.shots){
    if(sh.enemy||seenShots516.has(sh))continue;seenShots516.add(sh);
    const dl=Math.max(1,state.damageLvl||1),bl=Math.max(1,state.blastLvl||1);
    if(sh.type==='mg')sh.damage*=1+.09*(dl-1);
    else if(sh.type==='ap')sh.damage*=1+.13*(dl-1);
    else if(sh.type==='he'){sh.damage*=1+.10*(dl-1);sh.splash*=1+.075*(bl-1)}
  }
}

const oldDamage516=damageEnemy;
damageEnemy=function(e,ammo,base,a=e.a,s=e.s){
  if(e.type==='armoredtrain'&&ammo==='ap'){
    const p=isoAS(e.a,e.s),engineX=p.x+e.trainDir516*20;
    if(Math.hypot(mouse.x-engineX,mouse.y-(p.y-5))<18){base*=1.55+Math.max(0,state.damageLvl-1)*.05;floater(e.a,e.s,'ENGINE CRIT',C.gold)}
  }
  oldDamage516(e,ammo,base,a,s);
};

function themeColors(){
  if(active.theme==='DESERT')return{a:'#ad8a55',b:'#6f5838',road:'#85613e',edge:'#4b3b2a',detail:'#d3ae70'};
  if(active.theme==='POLAR')return{a:'#b9c8c6',b:'#7f9895',road:'#879b96',edge:'#516a68',detail:'#edf4f2'};
  return{a:'#526f49',b:'#2d4935',road:'#6c5b3d',edge:'#273a2b',detail:'#89a879'};
}
function drawRoute(points,w=10,col=null){
  if(!points||points.length<2)return;const tc=themeColors();ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=tc.edge;ctx.lineWidth=w+5;ctx.globalAlpha=.62;ctx.beginPath();let p=isoAS(points[0][0],points[0][1]);ctx.moveTo(p.x,p.y);for(const q of points.slice(1)){p=isoAS(q[0],q[1]);ctx.lineTo(p.x,p.y)}ctx.stroke();ctx.strokeStyle=col||tc.road;ctx.lineWidth=w;ctx.globalAlpha=.62;ctx.stroke();ctx.restore();
}
function drawScenarioRiver(){
  if(!active.river)return;const p1=isoAS(RIVER.a-RIVER.half,-58),p2=isoAS(RIVER.a+RIVER.half,58);ctx.save();ctx.fillStyle=active.theme==='POLAR'?'#8eb0af':'#315f58';ctx.fillRect(0,Math.min(p1.y,p2.y),W,Math.abs(p2.y-p1.y));ctx.globalAlpha=.28;for(let s=-50;s<=50;s+=10){const p=isoAS(RIVER.a,s);ellipse(p.x,p.y,18,1.6,active.theme==='POLAR'?'#f1f7f6':'#c7e2d7')}ctx.restore();for(const bs of RIVER.bridges){const a1=RIVER.a-RIVER.half-2,a2=RIVER.a+RIVER.half+2,p=isoAS(a1,bs),q=isoAS(a2,bs);line(p.x,p.y,q.x,q.y,18,active.theme==='POLAR'?'#aab8b4':'#6f5738');line(p.x,p.y,q.x,q.y,11,active.theme==='POLAR'?'#d5dfdc':'#a17b4d')}
}
function drawRail(){
  const p1=isoAS(railA516,-58),p2=isoAS(railA516,58);ctx.save();line(p1.x,p1.y-4,p2.x,p2.y-4,2,'#303633');line(p1.x,p1.y+4,p2.x,p2.y+4,2,'#303633');for(let s=-55;s<=55;s+=5){const p=isoAS(railA516,s);line(p.x,p.y-7,p.x,p.y+7,1.4,'#6e573c')}ctx.restore();
}

drawGround=function(){
  const tc=themeColors(),g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,tc.b);g.addColorStop(.55,tc.a);g.addColorStop(1,tc.b);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const corners=[isoAS(WORLD.aMin,WORLD.sMin),isoAS(WORLD.aMin,WORLD.sMax),isoAS(WORLD.aMax,WORLD.sMax),isoAS(WORLD.aMax,WORLD.sMin)];poly(corners.map(p=>[p.x,p.y]),tc.a,tc.edge,1.5);
  drawScenarioRiver();
  if(active.layout==='airfield'){
    const c=isoAS(-18,0);ellipse(c.x,c.y,W*.34,H*.13,active.theme==='JUNGLE'?'#617b52':'#9d875e','#334331',1.5);drawRoute(routes516[0],7);drawRoute(routes516[1],7);
  }else if(active.layout==='rail'){
    drawRoute(routes516[0],8);drawRoute(routes516[1],8);drawRail();
  }else routes516.forEach((r,i)=>{if(active.layout!=='ice'||i<2)drawRoute(r,active.layout==='convoy'?13:9)});
  if(active.layout==='ice'){drawRoute(routes516[2],8,'#9fb2ae');drawRoute(routes516[3],8,'#9fb2ae')}
  for(const d of DECOR516){const p=isoAS(d.a,d.s);if(active.theme==='JUNGLE'){ellipse(p.x,p.y,d.r*2,d.r*.7,'#203b27aa');for(let i=0;i<3;i++)circle(p.x+rnd(-8,8),p.y-rnd(0,10),rnd(2,5),'#3b643e')}else if(active.theme==='DESERT'){ellipse(p.x,p.y,d.r*2.4,d.r*.75,'#c6a16755');circle(p.x,p.y-2,d.r*.6,'#7b684f')}else{ellipse(p.x,p.y,d.r*2.3,d.r*.7,'#edf4f0aa');line(p.x,p.y,p.x,p.y-d.r*1.8,2,'#5c6d68')}}
  const v=ctx.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.18,W*.5,H*.5,Math.max(W,H)*.72);v.addColorStop(0,'#0000');v.addColorStop(1,'#07100b9d');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
};

const oldDrawEnemy516=drawEnemy;
drawEnemy=function(e){
  if(e.type!=='armoredtrain')return oldDrawEnemy516(e);
  const p=isoAS(e.a,e.s),dir=e.trainDir516||1,sc=PORTRAIT?.62:.85;ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);
  for(let i=0;i<4;i++){
    const x=-dir*i*22;ellipse(x,9,15,4,'#10171366');rr(x-13,-7,26,13,2,i===0?'#59645f':'#626b66','#1d2522',1.3);circle(x-8,8,3,'#1a201d');circle(x+8,8,3,'#1a201d');if(i===0){rr(x-9,-13,16,7,2,'#49534f','#1d2522',1);line(x+4,-9,x+dir*24,-9,3,'#252c29')}else if(i===1){circle(x,-10,5,'#4c5652','#202725',1);line(x,-10,x+dir*15,-12,2.5,'#252c29')}else{rr(x-8,-12,16,5,1,'#4d5752','#202725',1)}}
  ctx.restore();
  const w=72*(PORTRAIT?.7:1),y=p.y-(PORTRAIT?30:38),f=clamp(e.hp/e.maxhp,0,1);rr(p.x-w/2,y,w,4,2,'#201817bb');ctx.fillStyle='#c69b55';ctx.fillRect(p.x-w/2+1,y+1,(w-2)*f,2);
  const ex=p.x+dir*20*(PORTRAIT?.62:.85);ctx.strokeStyle='#efbd55';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ex,p.y-5,5,0,Math.PI*2);ctx.stroke();
};

function drawAir516(p){ctx.save();ctx.translate(p.x,p.y);if(p.dir<0)ctx.scale(-1,1);ctx.globalAlpha=.9;rr(-22,-4,44,8,4,'#7c8782','#27302d',1);poly([[-5,-3],[-32,-16],[-37,-12],[-12,1]],'#69746f','#27302d',1);poly([[-2,3],[-28,15],[-34,12],[-10,0]],'#69746f','#27302d',1);poly([[18,-3],[31,-10],[34,-7],[23,1]],'#606a66','#27302d',1);ctx.restore()}

const oldStart516=startWave;
startWave=function(){
  oldStart516();setupScenario(state.wave);state.spawnClock=.06;
  const info=scenarioInfo(state.wave);const h=document.querySelector('header strong');if(h)h.textContent=`JBD // 5.16 // ${info.scenario.name}`;$('msg').textContent=`${info.scenario.theme} ${info.idx%3+1}/3 · ${info.scenario.name}`;updateUI();
};

const oldUpdate516=update;
update=function(dt){
  oldUpdate516(dt);scenarioClock+=dt;tuneShots516();
  if(window.__JBD512?.PLANES)window.__JBD512.PLANES.length=0;
  for(let i=state.enemies.length-1;i>=0;i--){const e=state.enemies[i];if(e.parachuting&&!e.scenarioPara516&&activeIndex!==1&&activeIndex!==8)e.hp=-1000}
  if(state.phase==='wave'){
    const alive=state.enemies.filter(e=>e.hp>0).length,queued=state.queue.filter(x=>!x.phase).length;
    if(queued&&alive<4)state.spawnClock=Math.min(state.spawnClock,.10);
    if(scenarioClock>12&&queued)state.spawnClock-=dt*.20;
  }
  for(const p of AIR516){p.t+=dt;p.x+=p.dir*p.v*dt}
  for(let i=AIR516.length-1;i>=0;i--)if(AIR516[i].x<-100||AIR516[i].x>W+100)AIR516.splice(i,1);
};

const oldDraw516=draw;
draw=function(){oldDraw516();for(const p of AIR516)drawAir516(p)};

function setBrief516(n){
  const info=scenarioInfo(n),p=previewWave(n);$('bw').textContent=n;$('bi').textContent=p.inf;$('ba').textContent=p.armor;$('be').textContent=p.eng;
  const b=$('bnote');if(b)b.textContent=`${info.scenario.theme} ${info.idx%3+1}/3 · ${info.scenario.name} — ${info.scenario.desc}. Levels zijn kort en elke map gebruikt andere routes, hoeken en terrein.`;
  const title=$('brief')?.querySelector('h3');if(title)title.textContent=`FIELD BRIEF // ${info.scenario.name}`;
}
$('briefBtn').onclick=()=>{setBrief516(state.wave+1);showPanel($('brief'))};
$('nextBtn').onclick=()=>{hidePanel($('shop'));setBrief516(state.wave+1);showPanel($('brief'))};

if(state.wave===0&&state.damageLvl===1&&state.coolLvl===1&&(state.burstCount||2)<=2)state.supply=18;
const oldUI516=updateUI;
updateUI=function(){
  oldUI516();const info=scenarioInfo(Math.max(1,state.wave||1));const h=document.querySelector('header strong');if(h)h.textContent=`JBD // 5.16 // ${info.scenario.name}`;
  const btn=$('nextBtn');if(btn&&state.phase==='shop'){const nx=scenarioInfo(state.wave+1);btn.textContent=`NEXT · ${nx.scenario.name}`}
};

setupScenario(1);setBrief516(1);updateUI();
window.__JBD516={SCENARIOS,scenarioInfo,get active(){return active},get routes(){return routes516}};
})();