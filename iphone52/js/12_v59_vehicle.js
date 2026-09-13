(()=>{
'use strict';
if(typeof state==='undefined') return;
state.bunkerFlash = state.bunkerFlash || 0;
const neutrals=[]; let neutralClock=5;
const HOLD={active:false,pid:null,sx:0,sy:0,x:0,y:0,t0:0,pull:0,ammo:'mg'};
const THEME_NAMES=['JUNGLE','POLAR','DESERT'];

function themeName(){ return THEME_NAMES[Math.max(0,(state.wave-1)%3)]||'JUNGLE'; }
function setHeader(){ const h=document.querySelector('header strong'); if(h) h.textContent=`JBD // 5.9 // ${themeName()} ${state.wave||1}`; }

function rebalanceScenery(){
  if(typeof TRENCHES!=='undefined'){
    TRENCHES.length=0;
    [
      {a:-10,s:-28,w:10},{a:-6,s:26,w:10},
      {a:8,s:-8,w:11},{a:10,s:13,w:11},
      {a:23,s:-30,w:11},{a:25,s:30,w:11},
      {a:40,s:-14,w:10},{a:42,s:10,w:10},
      {a:56,s:-26,w:11},{a:58,s:24,w:11}
    ].forEach(t=>TRENCHES.push(t));
  }
  if(typeof FOLIAGE!=='undefined'){
    FOLIAGE.length=0;
    const slots=[
      [-62,-28],[-60,-8],[-58,14],[-55,32],[-49,-36],[-46,-18],[-45,2],[-44,22],[-42,40],
      [-34,-30],[-33,-6],[-32,18],[-28,36],[-20,-36],[-18,-12],[-17,10],[-16,30],
      [-8,-26],[-6,-2],[-5,22],[6,-36],[7,-16],[8,4],[10,24],[18,-28],[20,-6],[21,16],[22,36],
      [32,-34],[34,-12],[35,10],[36,28],[48,-22],[50,2],[52,24],[62,-30],[64,-8],[66,18]
    ];
    for(const [a,s] of slots){ const xy=xyFromAS(a,s); FOLIAGE.push({x:xy.x,y:xy.y,kind:Math.random()<.25?'palm':Math.random()<.58?'bamboo':'bush',size:rnd(.72,1.10)}); }
  }
  if(typeof BUILDING!=='undefined'){
    BUILDING.a=18; BUILDING.s=28;
  }
}

function buildVehicleWave(n){
  const q=[], lane=()=>rnd(-34,34), fewInf=Math.max(0,Math.min(2,Math.floor(n/3)));
  q.push(mkPhase(1,'ARMORED PROBE',4));
  q.push({type:n%4===0?'tank':'stug',lane:lane()});
  q.push({type:'technical',lane:lane()});
  q.push({type:'motorcycle',lane:lane()});
  if(n>=2) q.push({type:'truck',lane:lane()});
  if(n>=3) q.push({type:'technical',lane:lane()});
  for(let i=0;i<fewInf;i++) q.push({type:i%2?'storm':'rifle',lane:lane(),follow:true});
  q.push(mkPhase(2,'RIVER CONVOY',5));
  q.push({type:'truck',lane:lane()});
  q.push({type:n>=3?'halftrack':'technical',lane:lane()});
  q.push({type:'motorcycle',lane:lane()});
  if(n>=2) q.push({type:'motorcycle',lane:lane()});
  if(n>=4) q.push({type:'apc',lane:lane()});
  for(let i=0;i<fewInf;i++) q.push({type:'mg',lane:lane(),follow:true});
  q.push(mkPhase(3,'HEAVY PUSH',6));
  q.push({type:'engineertruck',lane:lane()});
  q.push({type:'stug',lane:lane()});
  if(n>=2) q.push({type:'technical',lane:lane()});
  if(n>=3) q.push({type:'truck',lane:lane()});
  if(n>=4) q.push({type:'tank',lane:lane()});
  q.push({type:'motorcycle',lane:lane()});
  q.push({type:'motorcycle',lane:lane()});
  for(let i=0;i<fewInf;i++) q.push({type:'grenadier',lane:lane(),follow:true});
  return q;
}
buildWave=buildVehicleWave;
previewWave=function(n){ const q=buildVehicleWave(n); return {inf:q.filter(x=>x.type&&['rifle','storm','mg','grenadier','engineer'].includes(x.type)).length+4,armor:q.filter(x=>x.type&&DEF[x.type]?.vehicle).length,eng:1}; };

const _startWave=startWave;
startWave=function(){ rebalanceScenery(); neutralClock=rnd(4,7); neutrals.length=0; _startWave(); setHeader(); };
const _updateUI=updateUI;
updateUI=function(){ _updateUI(); const u=$('upgradeViz'),t=$('targetCard'),tip=$('tip'),guide=$('counterGuide'); if(u){u.hidden=true;u.style.display='none';} if(t) t.style.display='none'; if(tip) tip.style.display='none'; if(guide) guide.style.display='none'; setHeader(); };

const _spawn=spawn;
spawn=function(type,lane=0,opts={}){
  const e=_spawn(type,lane,opts);
  if(e.vehicle){
    const mult={motorcycle:rnd(1.28,1.55),technical:rnd(1.08,1.28),truck:rnd(.88,1.08),engineertruck:rnd(.84,.98),halftrack:rnd(.78,.96),apc:rnd(.82,.98),stug:rnd(.62,.80),tank:rnd(.56,.72)}[type]||rnd(.9,1.1);
    e.speed*=mult; e.reload*=rnd(.92,1.1); e.action='move';
  } else { e.speed*=.9; }
  return e;
};

unloadVehicle=function(e){
  if(e.unloaded) return; e.unloaded=true;
  const counts={technical:1,truck:2,halftrack:2,apc:1,engineertruck:1}; const count=counts[e.type]??0;
  for(let i=0;i<count;i++){
    const type=e.type==='engineertruck'?'engineer':(i%2===0?'storm':'rifle');
    const n=spawn(type,e.s+(i-(count-1)/2)*2.5,{slot:i-1});
    n.a=e.a-rnd(2,5); n.followId=e.type==='engineertruck'?null:e.id;
    if(type==='engineer'){ n.buildState='seek'; n.digClock=99; }
  }
  e.retreat=true; e.mode='move'; floater(e.a,e.s,e.type==='engineertruck'?'ENGINEERS OUT':'CREW OUT',C.gold);
};
spawnBailoutCrew=function(v){
  const count=v.type==='technical'?1:v.type==='truck'?2:v.type==='halftrack'?2:v.type==='apc'?1:v.type==='engineertruck'?1:0;
  for(let i=0;i<count;i++){
    const type=v.type==='engineertruck'?'engineer':(i%2?'storm':'rifle');
    const n=spawn(type,v.s+rnd(-2.2,2.2),{slot:i-1,jumpT:.55});
    n.a=v.a-rnd(.4,2.2); n.followId=null; n.action='sprint'; n.actionT=.8;
    if(type==='engineer'){n.buildState='seek'; n.digClock=99;}
  }
};

const _effectiveness=effectiveness;
effectiveness=function(ammo,e){
  let v=_effectiveness(ammo,e);
  if(ammo==='he' && e.vehicle) v=Math.max(v,e.heavy?.8:1.0);
  if(ammo==='he' && e.type==='tank') v=Math.max(v,.78);
  return v;
};

const _damageBunker=damageBunker;
damageBunker=function(dmg){ _damageBunker(dmg); state.bunkerFlash=Math.min(1,(state.bunkerFlash||0)+0.4+dmg*0.015); floater(77,rnd(-6,6),`-${Math.round(dmg)}`,'#ff6b63'); };

function spawnNeutral(kind='civilian'){
  if(state.phase!=='wave') return;
  if(kind==='untruck'){
    const side=Math.random()<.5?-1:1;
    neutrals.push({kind:'untruck',a:rnd(2,26),s:side*rnd(10,26),ta:76,ts:side*rnd(12,28),speed:rnd(5.8,7.0),alive:true,t:0,carry:3+Math.floor(rnd(0,3)),walk:0});
  } else {
    const side=Math.random()<.5?-1:1;
    neutrals.push({kind:'civilian',a:rnd(5,36),s:side*rnd(10,40),ta:rnd(60,78),ts:-side*rnd(8,28),speed:rnd(5.2,6.8),alive:true,t:0,walk:Math.random()*6});
  }
}
function neutralPenalty(n,why='CIVILIAN HIT'){
  if(!n.alive) return; n.alive=false;
  const fine=n.kind==='untruck'?55:35;
  state.supply=Math.max(0,state.supply-fine); state.chain=0; state.chainClock=0; $('msg').textContent=`${why} · -${fine} SUP`;
  floater(n.a,n.s,`-${fine} SUP`,'#ff6b63');
  state.fx.push({kind:'spark',a:n.a,s:n.s,t:0,life:.5});
  if(n.kind==='untruck'){
    for(let i=0;i<n.carry;i++) neutrals.push({kind:'civilian',a:n.a+rnd(-2,2),s:n.s+rnd(-2,2),ta:n.a+rnd(8,18),ts:n.s+rnd(-18,18),speed:rnd(5.6,8.0),alive:true,t:0,walk:Math.random()*6});
    state.fx.push({kind:'explosion',a:n.a,s:n.s,t:0,life:.55,big:false});
  }
}
function neutralHitT(a1,s1,a2,s2,n,rad=2.8){
  const A=isoAS(a1,s1),B=isoAS(a2,s2),P=isoAS(n.a,n.s),dx=B.x-A.x,dy=B.y-A.y,l2=dx*dx+dy*dy; if(l2<.001) return null;
  const t=Math.max(0,Math.min(1,((P.x-A.x)*dx+(P.y-A.y)*dy)/l2)); const qx=A.x+dx*t, qy=A.y+dy*t;
  return Math.hypot(P.x-qx,P.y-qy) < rad ? t : null;
}

const _updateShot=updateShot;
updateShot=function(sh,dt){
  _updateShot(sh,dt);
  if(sh.enemy) return;
  if(sh.type==='he' && sh.done){
    for(const n of neutrals){ if(n.alive && Math.hypot(n.a-sh.ta,n.s-sh.ts)<(sh.splash||6)+(n.kind==='untruck'?3:2)) neutralPenalty(n,n.kind==='untruck'?'UN TRUCK HIT':'CIVILIAN IN BLAST'); }
    return;
  }
  if(!sh.hitNeutral && sh.t>=0){
    let best=null; const ca=sh.ca ?? lerp(sh.a,sh.ta,clamp(sh.t/sh.life,0,1)), cs=sh.cs ?? lerp(sh.s,sh.ts,clamp(sh.t/sh.life,0,1));
    for(const n of neutrals){ if(!n.alive) continue; const t=neutralHitT(sh.a,sh.s,ca,cs,n,n.kind==='untruck'?7:5); if(t!==null && (!best || t<best.t)) best={n,t}; }
    if(best){ neutralPenalty(best.n,best.n.kind==='untruck'?'UN TRUCK HIT':'CIVILIAN HIT'); sh.hitNeutral=true; sh.done=true; }
  }
};

const _update=update;
update=function(dt){
  _update(dt);
  if(state.phase==='wave'){ neutralClock-=dt; if(neutralClock<=0){ spawnNeutral(Math.random()<.22?'untruck':'civilian'); neutralClock=rnd(9,18);} }
  for(const n of neutrals){ if(!n.alive){n.t+=dt; continue;} n.t+=dt; n.walk=(n.walk||0)+dt*8; const da=n.ta-n.a, ds=n.ts-n.s, d=Math.max(.01,Math.hypot(da,ds)); n.a += da/d*n.speed*dt; n.s += ds/d*n.speed*dt; if(d<2) n.alive=false; }
  for(let i=neutrals.length-1;i>=0;i--) if(!neutrals[i].alive && neutrals[i].t>2.5) neutrals.splice(i,1);
  if(state.bunkerFlash>0) state.bunkerFlash=Math.max(0,state.bunkerFlash-dt*1.8);
};

function drawNeutral(n){
  const p=isoAS(n.a,n.s), sc=PORTRAIT?.48:.68; ctx.save(); ctx.translate(p.x,p.y); ctx.scale(sc,sc);
  if(n.kind==='untruck'){
    ellipse(0,8,14,4,'#10201655'); rr(-14,-8,24,14,2,'#f3f6f6','#33443b',1); rr(8,-5,5,8,1,'#d7ebf8','#33443b',1); rr(-4,-4,8,8,1,'#e8f1ff','#33443b',1); ctx.fillStyle='#5fa0d6'; ctx.font='bold 6px monospace'; ctx.textAlign='center'; ctx.fillText('UN',-5,1); circle(-10,7,3,'#1d2420'); circle(8,7,3,'#1d2420');
  } else {
    const ph=Math.sin(n.walk||0)*3; ellipse(0,8,5,2,'#10201655'); rr(-2.6,-6,5.2,9,2,'#c7af7c','#342f27',1); circle(0,-9,2.5,C.skin,'#342f27',.8); line(-1,2,-3+ph,10,1.6,'#4b5a43'); line(1,2,3-ph,10,1.6,'#4b5a43'); line(-1,-2,-5,-1,1.2,C.skin); line(1,-2,5,-1,1.2,C.skin);
  }
  ctx.restore();
}

drawShots=function(){
  for(const sh of state.shots){ if(sh.t<0||sh.done) continue; const u=clamp(sh.t/sh.life,0,1),a=lerp(sh.a,sh.ta,u),s=lerp(sh.s,sh.ts,u),z=sh.arc?Math.sin(u*Math.PI)*55:0,p=isoAS(a,s,z);
    if(sh.enemy){ const q=isoAS(sh.a,sh.s),r=isoAS(a,s); line(q.x,q.y,r.x,r.y,.8,'#e98c5e66'); circle(p.x,p.y,1.2,'#ffc775'); }
    else if(sh.type==='mg'){ circle(p.x,p.y,1.2,C.tracer,'#fff2ad',.5); }
    else if(sh.type==='ap'){ circle(p.x,p.y,1.7,'#b7e0e7','#efffff',.7); }
    else { circle(p.x,p.y,2.3,'#d7bb61','#fff0a7',.8); }
  }
};

const _drawEnemy=drawEnemy;
drawEnemy=function(e){
  if(e.insideBuilding) return; const p=isoAS(e.a,e.s),mob=PORTRAIT?.66:1;
  if(e.fort){ if(PORTRAIT){ctx.save();ctx.translate(p.x,p.y);ctx.scale(.66,.66);drawFieldBunker(e,{x:0,y:0});ctx.restore();} else drawFieldBunker(e,p); }
  else if(e.vehicle){ const base=e.type==='motorcycle'?.84:e.type==='technical'?.96:e.type==='truck'||e.type==='engineertruck'?1.03:e.type==='halftrack'||e.type==='apc'?1.04:e.type==='stug'?1.16:e.type==='tank'?1.20:.9,sc=base*mob; if(inRiver(e.a,e.s)&&nearBridge(e.s)){p.y+=Math.sin(e.age*11)*.9} drawVehicle(e,p,sc); }
  else { drawSoldier(e,p,.58*(PORTRAIT?.66:1)); }
  const f=clamp(e.hp/e.maxhp,0,1),w=(e.fort?32:e.heavy?30:e.vehicle?28:15)*(PORTRAIT?.72:1),y=p.y-(e.fort?25:e.heavy?28:e.vehicle?22:17)*(PORTRAIT?.72:1);
  rr(p.x-w/2,y,w,PORTRAIT?3:4,2,'#231c18aa'); ctx.fillStyle=targetClass(e)==='personnel'?'#9abf75':targetClass(e)==='armor'?'#85b6c4':'#e6bc59'; ctx.fillRect(p.x-w/2+1,y+1,(w-2)*f,PORTRAIT?1.5:2);
};

drawCrosshair=function(){ const col=HOLD.active?(HOLD.ammo==='mg'?'#e9e1c4':HOLD.ammo==='ap'?'#9dd6e4':'#efc65c'):'#e9e1c4'; ctx.save(); ctx.translate(mouse.x,mouse.y); ctx.strokeStyle=col; ctx.lineWidth=1.25; ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.stroke(); line(-16,0,-6,0,1.25,col); line(6,0,16,0,1.25,col); line(0,-16,0,-6,1.25,col); line(0,6,0,16,1.25,col); if(HOLD.active){ ctx.globalAlpha=.28; const rad=HOLD.ammo==='mg'?8:HOLD.ammo==='ap'?14:22; ctx.beginPath(); ctx.arc(0,0,rad,0,Math.PI*2); ctx.stroke(); } ctx.restore(); };

function aimFromEvent(e){ const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; }
function chooseAmmoGesture(){ const dt=(performance.now()-HOLD.t0)/1000,dx=HOLD.x-HOLD.sx,dy=HOLD.y-HOLD.sy,pull=Math.hypot(dx,dy); HOLD.pull=pull; let ammo='mg'; if(pull>90||dt>.55) ammo='he'; else if(pull>26||dt>.18) ammo='ap'; HOLD.ammo=ammo; selected=ammo; }
function holdDown(e){ if(e.pointerType!=='touch'&&e.button!==0) return; aimFromEvent(e); HOLD.active=true; HOLD.pid=e.pointerId; HOLD.sx=mouse.x; HOLD.sy=mouse.y; HOLD.x=mouse.x; HOLD.y=mouse.y; HOLD.t0=performance.now(); HOLD.ammo='mg'; selected='mg'; fireHeld=false; e.preventDefault(); e.stopImmediatePropagation(); try{canvas.setPointerCapture(e.pointerId)}catch(_){} }
function holdMove(e){ if(!HOLD.active) return; aimFromEvent(e); HOLD.x=mouse.x; HOLD.y=mouse.y; chooseAmmoGesture(); e.preventDefault(); e.stopImmediatePropagation(); }
function holdUp(e){ if(!HOLD.active) return; aimFromEvent(e); HOLD.x=mouse.x; HOLD.y=mouse.y; chooseAmmoGesture(); fireHeld=false; state.trigger=0; fire(); HOLD.active=false; e.preventDefault(); e.stopImmediatePropagation(); try{canvas.releasePointerCapture(e.pointerId)}catch(_){} }
canvas.addEventListener('pointerdown',holdDown,true); canvas.addEventListener('pointermove',holdMove,true); canvas.addEventListener('pointerup',holdUp,true); canvas.addEventListener('pointercancel',holdUp,true); addEventListener('pointerup',holdUp,true);

const _draw=draw;
draw=function(){ _draw();
  ctx.save(); for(const n of neutrals){ if(n.alive) drawNeutral(n); } ctx.restore();
  if(HOLD.active){ const b=isoAS(77,0); ctx.save(); ctx.strokeStyle=HOLD.ammo==='mg'?'#efe2b8':HOLD.ammo==='ap'?'#b7e0e7':'#efc65c'; ctx.lineWidth=2; ctx.globalAlpha=.7; ctx.beginPath(); ctx.moveTo(b.x,b.y-8); ctx.quadraticCurveTo((b.x+HOLD.x)/2,b.y-45,HOLD.x,HOLD.y); ctx.stroke(); ctx.restore(); }
  if(state.bunkerFlash>0){ ctx.save(); ctx.globalAlpha=Math.min(.22,state.bunkerFlash*.22); ctx.fillStyle='#d73f3f'; ctx.fillRect(0,0,W,H); ctx.restore(); }
};

const u=$('upgradeViz'); if(u){u.hidden=true;u.style.display='none';}
const t=$('targetCard'); if(t)t.style.display='none'; const tip=$('tip'); if(tip)tip.style.display='none'; const guide=$('counterGuide'); if(guide)guide.style.display='none';
setHeader();
})();
