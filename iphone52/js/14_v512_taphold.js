(()=>{
'use strict';
if(typeof state==='undefined'||typeof canvas==='undefined') return;

const HOLD={active:false,pid:null,t0:0,x:0,y:0,elapsed:0,kind:'burst'};
const PLANES=[];
let planeClock=7.5;
state.burstCount=state.burstCount||2;
state.blastLvl=state.blastLvl||1;

function chargeTimes(){
  const speed=1+Math.max(0,state.coolLvl-1)*.11;
  return {ap:.34/speed,he:.92/speed};
}
function kindFor(sec){
  const t=chargeTimes();
  return sec<t.ap?'burst':sec<t.he?'ap':'he';
}
function kindLabel(k){
  return k==='burst'?`BURST ×${state.burstCount}`:k==='ap'?'AP':'HE';
}
function kindColor(k){
  return k==='burst'?'#eee4c5':k==='ap'?'#a9ddea':'#efbd55';
}
function pointerPos(e){
  const r=canvas.getBoundingClientRect();
  return {x:clamp(e.clientX-r.left,0,r.width),y:clamp(e.clientY-r.top,0,r.height)};
}
function targetAS(){
  const q=asFromScreen(HOLD.x,HOLD.y);
  return {a:clamp(q.a,WORLD.aMin+2,WORLD.aMax-4),s:clamp(q.s,WORLD.sMin+2,WORLD.sMax-2)};
}
function updateCharge(now=performance.now()){
  if(!HOLD.active)return;
  HOLD.elapsed=(now-HOLD.t0)/1000;
  HOLD.kind=kindFor(HOLD.elapsed);
  const t=chargeTimes(), pct=HOLD.kind==='burst'?clamp(HOLD.elapsed/t.ap,0,1)*34:
    HOLD.kind==='ap'?34+clamp((HOLD.elapsed-t.ap)/(t.he-t.ap),0,1)*42:
    76+clamp((HOLD.elapsed-t.he)/.75,0,1)*24;
  const fill=$('chargeFill');if(fill)fill.style.width=`${Math.round(pct)}%`;
  const label=$('chargeType');if(label){label.textContent=kindLabel(HOLD.kind);label.style.color=kindColor(HOLD.kind)}
  const read=$('powerRead');if(read)read.textContent=HOLD.kind==='burst'?'TAP':HOLD.kind==='ap'?'HOLD':'MAX';
}
function makeShot(type,target,delay=0,spread=0){
  const a=77,s=0;
  const ta=clamp(target.a+rnd(-spread,spread),WORLD.aMin+2,WORLD.aMax-4);
  const ts=clamp(target.s+rnd(-spread,spread),WORLD.sMin+2,WORLD.sMax-2);
  const d=Math.max(1,Math.hypot(ta-a,ts-s));
  const dmgMul=1+(state.damageLvl-1)*.17;
  if(type==='mg'){
    state.shots.push({enemy:false,type:'mg',a,s,ta,ts,t:-delay,life:Math.max(.16,d/300),damage:18*dmgMul,hitDone:false,arc:false,splash:0});
  }else if(type==='ap'){
    state.shots.push({enemy:false,type:'ap',a,s,ta,ts,t:0,life:Math.max(.18,d/245),damage:105*dmgMul,hitDone:false,arc:false,splash:0});
  }else{
    state.shots.push({enemy:false,type:'he',a,s,ta,ts,t:0,life:Math.max(.28,d/180),damage:122*dmgMul,hitDone:false,arc:true,arcHeight:44+Math.min(26,d*.18),splash:(10.5+(state.blastLvl-1)*2.1),sling:false});
  }
}
function fireHeldShot(){
  if(state.phase!=='wave'){ $('msg').textContent='START EERST DE WAVE'; return; }
  if(state.trigger>0){ $('msg').textContent='HERLADEN'; return; }
  updateCharge();
  const target=targetAS(),kind=HOLD.kind;
  mouse.x=HOLD.x;mouse.y=HOLD.y;
  if(kind==='burst'){
    const count=Math.max(2,Math.min(7,state.burstCount));
    for(let i=0;i<count;i++)makeShot('mg',target,i*.065,1.0+i*.12);
    state.trigger=Math.max(.22,.42-(state.coolLvl-1)*.025);
    shotSound('mg');
  }else if(kind==='ap'){
    makeShot('ap',target);
    state.trigger=Math.max(.35,.68-(state.coolLvl-1)*.035);
    shotSound('ap');
  }else{
    makeShot('he',target);
    state.trigger=Math.max(.58,.96-(state.coolLvl-1)*.045);
    shotSound('he');
  }
  state.shake=Math.min(6,state.shake+(kind==='burst'?.5:kind==='ap'?1.2:2.2));
  $('msg').textContent=`${kindLabel(kind)} · ${Math.round(HOLD.elapsed*100)/100}s`;
}
function holdDown(e){
  if(e.pointerType!=='touch'&&e.button!==0)return;
  const p=pointerPos(e);
  HOLD.active=true;HOLD.pid=e.pointerId;HOLD.t0=performance.now();HOLD.x=p.x;HOLD.y=p.y;HOLD.elapsed=0;HOLD.kind='burst';
  mouse.x=p.x;mouse.y=p.y;fireHeld=false;
  try{canvas.setPointerCapture(e.pointerId)}catch(_){}
  updateCharge();
  e.preventDefault();e.stopImmediatePropagation();
}
function holdMove(e){
  if(!HOLD.active||e.pointerId!==HOLD.pid)return;
  const p=pointerPos(e);HOLD.x=p.x;HOLD.y=p.y;mouse.x=p.x;mouse.y=p.y;updateCharge();
  e.preventDefault();e.stopImmediatePropagation();
}
function holdUp(e){
  if(!HOLD.active||e.pointerId!==HOLD.pid)return;
  const p=pointerPos(e);HOLD.x=p.x;HOLD.y=p.y;mouse.x=p.x;mouse.y=p.y;
  fireHeldShot();
  HOLD.active=false;HOLD.pid=null;
  const fill=$('chargeFill');if(fill)fill.style.width='0%';
  const label=$('chargeType');if(label){label.textContent=`BURST ×${state.burstCount}`;label.style.color=kindColor('burst')}
  const read=$('powerRead');if(read)read.textContent='TAP';
  try{canvas.releasePointerCapture(e.pointerId)}catch(_){}
  e.preventDefault();e.stopImmediatePropagation();
}
function cancelHold(e){
  if(!HOLD.active)return;
  HOLD.active=false;HOLD.pid=null;fireHeld=false;
  const fill=$('chargeFill');if(fill)fill.style.width='0%';
  if(e){e.preventDefault();e.stopImmediatePropagation()}
}

canvas.addEventListener('pointerdown',holdDown,true);
canvas.addEventListener('pointermove',holdMove,true);
canvas.addEventListener('pointerup',holdUp,true);
canvas.addEventListener('pointercancel',cancelHold,true);
window.addEventListener('pointerup',e=>{if(HOLD.active&&e.pointerId===HOLD.pid)holdUp(e)},true);
fire=function(){};
fireHeld=false;

function buildDirectWave(n){
  const q=[],lane=()=>rnd(-36,36);
  q.push(mkPhase(1,'FAST ARMOR',5));
  q.push({type:n%4===0?'tank':'stug',lane:lane()});
  q.push({type:'technical',lane:lane()});
  q.push({type:'motorcycle',lane:lane()});
  q.push({type:'technical',lane:lane()});
  if(n>=2)q.push({type:'truck',lane:lane()});
  q.push(mkPhase(2,'RIVER CONVOY',6));
  q.push({type:'truck',lane:lane()});
  q.push({type:n>=3?'halftrack':'technical',lane:lane()});
  q.push({type:'motorcycle',lane:lane()});
  q.push({type:'motorcycle',lane:lane()});
  if(n>=3)q.push({type:'apc',lane:lane()});
  if(n>=4)q.push({type:'truck',lane:lane()});
  q.push(mkPhase(3,'HEAVY PUSH',7));
  q.push({type:'engineertruck',lane:lane()});
  q.push({type:'stug',lane:lane()});
  q.push({type:'technical',lane:lane()});
  if(n>=2)q.push({type:'truck',lane:lane()});
  if(n>=3)q.push({type:'tank',lane:lane()});
  if(n>=4)q.push({type:'apc',lane:lane()});
  q.push({type:'motorcycle',lane:lane()});
  return q;
}
buildWave=buildDirectWave;
previewWave=n=>{const q=buildDirectWave(n);return{inf:0,armor:q.filter(x=>x.type&&DEF[x.type]?.vehicle).length,eng:1}};

const oldUI512=updateUI;
updateUI=function(){
  oldUI512();
  for(const id of ['upgradeViz','targetCard','tip','counterGuide']){const el=$(id);if(el)el.style.display='none'}
  const h=document.querySelector('header strong');if(h)h.textContent='JBD // 5.12 // TAP / HOLD FIRE';
  const b=$('burstLvl');if(b)b.textContent=state.burstCount;
  const bl=$('blastLvl');if(bl)bl.textContent=state.blastLvl;
};
const burstBtn=document.querySelector('[data-tap-buy="burst"]');
if(burstBtn)burstBtn.addEventListener('click',()=>{
  const cost=18+(state.burstCount-2)*7;
  if(state.supply>=cost&&state.burstCount<7){state.supply-=cost;state.burstCount++;uiSound();updateUI()}
});
const blastBtn=document.querySelector('[data-tap-buy="blast"]');
if(blastBtn)blastBtn.addEventListener('click',()=>{
  const cost=22+(state.blastLvl-1)*6;
  if(state.supply>=cost&&state.blastLvl<6){state.supply-=cost;state.blastLvl++;uiSound();updateUI()}
});

const oldDrawFriendlyBunker512=drawFriendlyBunker;
drawFriendlyBunker=function(){
  oldDrawFriendlyBunker512();
  const p=isoAS(77,0),ang=Math.atan2(mouse.y-p.y,mouse.x-p.x),m=PORTRAIT?.68:1;
  const thick=2.7+(state.damageLvl-1)*.55+(state.burstCount-2)*.18;
  const len=22+(state.damageLvl-1)*2.4+(state.burstCount-2)*1.1;
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(m,m);ctx.rotate(ang);
  rr(-4,-thick*.62,10,thick*1.24,2,'#4d5853','#151c19',1);
  line(4,0,4+len,0,thick,'#222b28');
  if(state.burstCount>=4)line(3,-3.2,3+len*.88,-3.2,Math.max(1.5,thick*.48),'#303a35');
  if(state.burstCount>=6)line(3,3.2,3+len*.88,3.2,Math.max(1.5,thick*.48),'#303a35');
  ctx.restore();
};

function spawnPlane(){
  if(state.phase!=='wave'||PLANES.length)return;
  const dir=Math.random()<.5?1:-1;
  PLANES.push({x:dir>0?-70:W+70,y:rnd(52,105),dir,v:rnd(82,108),t:0,drops:0,nextDrop:.72});
  $('msg').textContent='AIRBORNE!';
}
function dropParatrooper(pl){
  const q=asFromScreen(clamp(pl.x,18,W-18),clamp(pl.y+60,90,H*.45));
  const type=Math.random()<.28?'storm':'rifle';
  const e=spawn(type,clamp(q.s,-40,40));
  e.a=clamp(q.a,-72,-18);e.s=clamp(q.s+rnd(-4,4),-44,44);
  e.parachuting=true;e.paraZ=rnd(48,66);e.paraDrift=rnd(-.9,.9);e.mode='air';e.action='';e.fireClock=2;
}
const oldUpdateEnemy512=updateEnemy;
updateEnemy=function(e,dt){
  if(e.parachuting){
    e.age+=dt;e.walk+=dt*3;e.paraZ-=dt*rnd(18,23);e.s=clamp(e.s+e.paraDrift*dt,-46,46);
    if(e.paraZ<=0){e.paraZ=0;e.parachuting=false;e.mode='move';e.action='sprint';e.actionT=.7;e.moveClock=.7;state.fx.push({kind:'dust',a:e.a,s:e.s,t:0,life:.3})}
    return;
  }
  oldUpdateEnemy512(e,dt);
};
const oldDrawEnemy512=drawEnemy;
drawEnemy=function(e){
  if(!e.parachuting)return oldDrawEnemy512(e);
  const p=isoAS(e.a,e.s,e.paraZ),sc=PORTRAIT?.40:.55;
  ctx.save();ctx.translate(p.x,p.y);
  ctx.scale(sc,sc);
  ellipse(0,8,5,1.8,'#10171055');
  rr(-2.6,-6,5.2,8.5,2,'#59694d','#1b241e',.8);circle(0,-9,2.2,C.skin,'#1b241e',.7);
  line(-1,2,-3,9,1.5,'#43543e');line(1,2,3,9,1.5,'#43543e');
  ctx.strokeStyle='#d6d7c2';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-2,-8);ctx.lineTo(-15,-31);ctx.moveTo(2,-8);ctx.lineTo(15,-31);ctx.stroke();
  ctx.fillStyle='#d8d0a9';ctx.strokeStyle='#4d5448';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,-31,16,Math.PI,0);ctx.quadraticCurveTo(8,-25,0,-22);ctx.quadraticCurveTo(-8,-25,-16,-31);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.restore();
};
function drawPlane(pl){
  ctx.save();ctx.translate(pl.x,pl.y);if(pl.dir<0)ctx.scale(-1,1);
  ctx.globalAlpha=.92;ellipse(4,9,28,7,'#0d151155');
  rr(-18,-5,42,10,5,'#87908b','#26302b',1.2);
  poly([[-4,-4],[-30,-18],[-35,-14],[-13,1]],'#717b76','#26302b',1);
  poly([[-2,4],[-26,18],[-32,15],[-11,0]],'#717b76','#26302b',1);
  poly([[19,-4],[31,-12],[34,-9],[24,1]],'#6a746f','#26302b',1);
  circle(-18,0,3,'#222a26');circle(22,0,2.5,'#222a26');
  ctx.globalAlpha=.55;for(const x of [-14,15]){ctx.beginPath();ctx.arc(x,0,7,0,Math.PI*2);ctx.strokeStyle='#b8c0bb';ctx.lineWidth=1;ctx.stroke()}
  ctx.restore();
}
const oldUpdate512=update;
update=function(dt){
  oldUpdate512(dt);
  if(HOLD.active)updateCharge();
  if(state.phase==='wave'){
    planeClock-=dt;
    if(planeClock<=0){spawnPlane();planeClock=rnd(22,34)}
  }
  for(const pl of PLANES){
    pl.t+=dt;pl.x+=pl.dir*pl.v*dt;
    if(pl.t>=pl.nextDrop&&pl.drops<5){dropParatrooper(pl);pl.drops++;pl.nextDrop+=rnd(.16,.30)}
  }
  for(let i=PLANES.length-1;i>=0;i--)if(PLANES[i].x<-90||PLANES[i].x>W+90)PLANES.splice(i,1);
};
const oldDraw512=draw;
draw=function(){
  oldDraw512();
  for(const pl of PLANES)drawPlane(pl);
  if(HOLD.active){
    const k=kindFor((performance.now()-HOLD.t0)/1000),col=kindColor(k);
    ctx.save();ctx.translate(HOLD.x,HOLD.y);ctx.strokeStyle=col;ctx.lineWidth=1.2;
    ctx.beginPath();ctx.arc(0,0,k==='burst'?11:k==='ap'?15:20,0,Math.PI*2);ctx.stroke();
    line(-16,0,-6,0,1.1,col);line(6,0,16,0,1.1,col);line(0,-16,0,-6,1.1,col);line(0,6,0,16,1.1,col);
    if(k==='he'){ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(0,0,28+(state.blastLvl-1)*3,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
  }
};
drawCrosshair=function(){};

planeClock=6.5;
updateUI();
window.__JBD512={HOLD,PLANES,spawnPlane};
})();