// JBD v5.5 // MICRO FRONT — lightweight iPhone action/cover pass
(() => {
'use strict';

const BUILDING={a:24,s:27,w:10,h:8};
const wrecks=[];
const _v53={
  buildWave,previewWave,spawn,movementTarget,maybeEnterTrench,updateEnemy,killEnemy,
  drawEnemy,drawFriendlyBunker,drawPlant,draw,update,updateUI,targetClass,effectiveness
};

updateProjection=function(){
  PORTRAIT=W<=600&&H>W;
  if(!PORTRAIT)return;
  const weaponReserve=Math.min(126,Math.max(106,H*.165));
  const playTop=8,playBottom=H-weaponReserve-8,playH=Math.max(410,playBottom-playTop);
  const aSpan=WORLD.aMax-WORLD.aMin,sSpan=WORLD.sMax-WORLD.sMin;
  const baseAX=.22,baseSX=3.25,baseAY=3.12,baseSY=.15;
  const needW=Math.abs(baseAX)*aSpan+Math.abs(baseSX)*sSpan;
  const needH=Math.abs(baseAY)*aSpan+Math.abs(baseSY)*sSpan;
  const k=Math.min((W-16)/needW,(playH-8)/needH);
  P_A_X=baseAX*k;P_S_X=baseSX*k;P_A_Y=baseAY*k;P_S_Y=baseSY*k;
  P_CX=W*.50;P_CY=playTop+playH*.48;
};

buildWave=function(n){
  const q=[],lane=()=>rnd(-41,41),inf=Math.min(20,7+n*2);
  q.push(mkPhase(1,'WIDE SPEARHEAD',4));
  q.push({type:n%3===0?'tank':'stug',lane:lane()});
  q.push({type:'technical',lane:lane()});
  if(n>=2)q.push({type:'technical',lane:lane()});
  for(let i=0;i<Math.max(7,inf-2);i++)q.push({type:i%6===0?'storm':i%5===0?'mg':'rifle',lane:lane(),follow:true});
  if(n>=2){q.push({type:'motorcycle',lane:lane()});q.push({type:'motorcycle',lane:lane()})}
  q.push(mkPhase(2,'BRIDGE CONVOY',5));
  q.push({type:'truck',lane:lane()});
  if(n>=2)q.push({type:'halftrack',lane:lane()});
  if(n>=3)q.push({type:'truck',lane:lane()});
  for(let i=0;i<Math.min(8,n+4);i++)q.push({type:i%4===0?'storm':i%3===0?'mg':'rifle',lane:lane(),follow:true});
  q.push(mkPhase(3,'FORTIFY & FLANK',6));
  q.push({type:'engineertruck',lane:lane()});
  q.push({type:'motorcycle',lane:lane()});q.push({type:'motorcycle',lane:lane()});
  q.push({type:'grenadier',lane:lane()});q.push({type:'grenadier',lane:lane()});
  if(n>=3)q.push({type:'apc',lane:lane()});
  if(n>=4)q.push({type:'mg',lane:lane()});
  return q;
};
previewWave=function(n){const q=buildWave(n);return{inf:q.filter(x=>x.type&&['rifle','storm','mg','grenadier'].includes(x.type)).length+12,armor:q.filter(x=>x.type&&DEF[x.type]?.vehicle).length,eng:2}};

spawn=function(type,lane=0,opts={}){
  const e=_v53.spawn(type,lane,opts);
  e.speed*=e.vehicle?1.08:1.06;
  e.insideBuilding=false;e.buildingT=0;e.coverTarget=null;e.jumpT=opts.jumpT||0;e.jumpStart=opts.jumpT||0;
  return e;
};

movementTarget=function(e){
  const v=nearestVehicle(e);
  if(v){const back=e.type==='mg'?9:7.5,side=(e.slot||0)*3.2;return{a:v.a-back,s:v.s+side,vehicle:v}}
  if(e.coverTarget)return{a:e.coverTarget.a,s:e.coverTarget.s,vehicle:null,cover:true};
  const rt=riverTarget(e,true);if(rt)return rt;
  return{a:77,s:clamp(e.s*.82,-38,38),vehicle:null};
};

maybeEnterTrench=function(e){
  if(e.vehicle||e.fort||e.dugIn||e.inTrench||e.insideBuilding||e.type==='engineer')return false;
  for(const t of TRENCHES){if(Math.abs(e.a-t.a)<2.4&&Math.abs(e.s-t.s)<t.w*.62&&Math.random()<.16){
    e.inTrench=true;e.trenchT=rnd(4.3,7.4);e.stance='crouch';e.coverTarget=null;e.action='drop';e.actionT=.42;floater(e.a,e.s,'IN COVER',C.gold);return true
  }}return false;
};

function maybeEnterBuilding(e){
  if(e.vehicle||e.fort||e.dugIn||e.inTrench||e.insideBuilding||e.type==='engineer')return false;
  const occupants=state.enemies.filter(x=>x.hp>0&&x.insideBuilding).length;
  if(occupants>=4)return false;
  if(Math.abs(e.a-BUILDING.a)<3.2&&Math.abs(e.s-BUILDING.s)<BUILDING.w*.72&&Math.random()<.18){
    e.insideBuilding=true;e.buildingT=rnd(3.5,6.2);e.a=BUILDING.a+rnd(-1.4,1.4);e.s=BUILDING.s+rnd(-1.8,1.8);e.stance='crouch';e.coverTarget=null;
    floater(e.a,e.s,'HOUSE',C.gold);return true
  }return false;
}

function maybeSeekCover(e){
  if(e.vehicle||e.fort||e.insideBuilding||e.inTrench||e.dugIn||e.type==='engineer')return;
  if(e.coverTarget){
    const d=Math.hypot(e.a-e.coverTarget.a,e.s-e.coverTarget.s);
    if(d<2.1&&e.coverTarget.kind==='crater'){
      e.coverTarget=null;e.dugIn=true;e.stance='crouch';e.action='drop';e.actionT=.4;floater(e.a,e.s,'CRATER COVER',C.gold)
    }
    return;
  }
  const pressured=e.hp<e.maxhp*.78||e.action==='duck'||e.action==='kneel'||Math.random()<.012;
  const nearHouse=Math.hypot(e.a-BUILDING.a,e.s-BUILDING.s)<28;
  if(!pressured&&!(nearHouse&&Math.random()<.006))return;
  const opts=[];
  for(const t of TRENCHES){const d=Math.hypot(e.a-t.a,e.s-t.s);if(d<22)opts.push({a:t.a,s:t.s,kind:'trench',score:d})}
  const bd=Math.hypot(e.a-BUILDING.a,e.s-BUILDING.s);if(bd<30)opts.push({a:BUILDING.a,s:BUILDING.s,kind:'building',score:bd-3});
  for(const c of state.craters.slice(-10)){const d=Math.hypot(e.a-c.a,e.s-c.s);if(d<18)opts.push({a:c.a,s:c.s,kind:'crater',score:d+1})}
  if(opts.length){opts.sort((a,b)=>a.score-b.score);e.coverTarget=opts[0];e.mode='move';e.action='sprint';e.actionT=.7}
}

updateEnemy=function(e,dt){
  if(e.jumpT>0)e.jumpT=Math.max(0,e.jumpT-dt);
  if(e.insideBuilding){
    e.age+=dt;e.buildingT-=dt;e.fireClock-=dt;
    if(e.fireClock<=0){enemyFire(e);e.fireClock=e.reload*rnd(1.0,1.25)}
    if(e.buildingT<=0){e.insideBuilding=false;e.a=BUILDING.a+rnd(-3,3);e.s=BUILDING.s+rnd(-3.5,3.5);e.action='sprint';e.actionT=.8;e.mode='move';e.moveClock=.7}
    return;
  }
  maybeSeekCover(e);
  if(maybeEnterBuilding(e))return;
  _v53.updateEnemy(e,dt);
};

targetClass=function(e){if(e.fort||e.dugIn||e.inTrench||e.insideBuilding)return'cover';if(e.kind==='armor')return'armor';return'personnel'};
effectiveness=function(ammo,e){let c=targetClass(e),v=EFF[ammo][c];if(e.type==='motorcycle'&&ammo==='mg')v=1.5;if(e.heavy&&ammo!=='ap')v*=.25;if(e.type==='fieldbunker'&&ammo==='he')v=1.85;if(e.insideBuilding&&ammo==='he')v*=1.35;if(e.type==='engineer'&&ammo==='mg')v=1.35;return v};

function spawnBailoutCrew(v){
  const count=v.type==='motorcycle'?1:v.type==='technical'?2:v.type==='truck'?4:v.type==='engineertruck'?2:v.type==='halftrack'?3:v.type==='apc'?3:v.type==='stug'?2:v.type==='tank'?3:0;
  for(let i=0;i<count;i++){
    const type=v.type==='engineertruck'&&i===0?'engineer':(i%4===0?'storm':'rifle');
    const n=spawn(type,v.s+rnd(-3,3),{slot:i-1,jumpT:.58});n.a=v.a-rnd(.2,2.6);n.followId=null;n.action='sprint';n.actionT=.9;n.mode='move';
    if(type==='engineer'){n.buildState='seek';n.digClock=99}
  }
}

killEnemy=function(e,ammo,clsBefore){
  if(e.hp<-999)return;
  if(e.vehicle){
    if(!e.unloaded)spawnBailoutCrew(e);
    e.unloaded=true;
    wrecks.push({type:e.type,a:e.a,s:e.s,t:0,life:e.heavy?16:13,heavy:e.heavy,burning:true});
    if(wrecks.length>8)wrecks.shift();
  }
  _v53.killEnemy(e,ammo,clsBefore);
};

drawPlant=function(f){
  if(!PORTRAIT)return _v53.drawPlant(f);
  const p=isoXY(f.x,f.y);ctx.save();ctx.translate(p.x,p.y);ctx.scale(.84,.84);ctx.translate(-p.x,-p.y);_v53.drawPlant(f);ctx.restore();
};

drawFriendlyBunker=function(){
  const p=isoAS(77,0),ang=Math.atan2(mouse.y-p.y,mouse.x-p.x),m=PORTRAIT?.60:1;
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(m,m);ellipse(0,14,38,12,'#0d15117d');
  poly([[-35,10],[-24,-17],[17,-17],[34,3],[24,18],[-26,18]],'#9b9270','#27332b',2);
  for(let i=-2;i<=2;i++)rr(-31+i*13,5,12,7,2,'#7b744f','#3c4337',1);
  for(let i=0;i<Math.min(6,state.damageLvl);i++)rr(-29+i*9,14,6,3,1,'#c7b67a','#394039',.8);
  poly([[-16,2],[-9,-10],[12,-10],[18,0],[10,10],[-14,10]],'#58625d','#222b28',1.6);circle(2,-4,8,'#737c76','#202725',1.5);
  for(let i=0;i<Math.min(6,state.coolLvl);i++)rr(-14+i*4,-16,2,10,1,'#82a8bf','#24343a',.8);
  ctx.save();ctx.translate(4,-5);ctx.rotate(ang);rr(-3,-3,30+state.damageLvl*3,6,2,'#333c39','#151b19',1.2);rr(20+state.damageLvl*3,-2,18,4,1,'#262e2c');ctx.restore();ctx.restore();
  const bw=PORTRAIT?61:96,bh=PORTRAIT?6:9,x=p.x-bw/2,y=p.y-(PORTRAIT?29:47);rr(x,y,bw,bh,4,'#101713cc','#5c685f',1);ctx.fillStyle='#7da66b';ctx.fillRect(x+2,y+2,(bw-4)*clamp(state.hp/state.maxhp,0,1),Math.max(2,bh-4));ctx.font=(PORTRAIT?'6px':'9px')+' ui-monospace,monospace';ctx.textAlign='center';ctx.fillStyle='#f0eadb';ctx.fillText(`BUNKER ${Math.round(state.hp)}`,p.x,y-3)
};

function drawBuilding(){
  const p=isoAS(BUILDING.a,BUILDING.s),inside=state.enemies.filter(e=>e.hp>0&&e.insideBuilding),m=PORTRAIT?.61:1;
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(m,m);ellipse(0,10,20,7,'#0d151177');
  poly([[-15,7],[-15,-8],[15,-8],[15,7]],'#6a5239','#263229',1.5);rr(-5,-1,10,8,1,'#111914','#39483e',1);
  rr(-13,-2,6,7,1,'#3e5148','#202b25',1);rr(7,-2,6,7,1,'#3e5148','#202b25',1);
  if(inside.length===0)poly([[-17,-8],[0,-20],[17,-8],[0,-1]],'#88734e','#2a3429',1.5);
  else{
    line(-15,-8,0,-20,1.2,'#a99467');line(15,-8,0,-20,1.2,'#a99467');
    for(let i=0;i<Math.min(4,inside.length);i++){const x=-10+i*7;circle(x,1,1.6,C.skin,'#1d251f',.5);line(x,3,x+4,-1,1.3,'#232b25')}
  }
  ctx.restore();
}

function drawWreck(w){
  const p=isoAS(w.a,w.s),fade=clamp(1-w.t/w.life*.45,.38,1),sc=(PORTRAIT?.57:1)*(w.heavy?1.16:1);
  ctx.save();ctx.globalAlpha=fade;drawVehicle({type:w.type,heavy:w.heavy},p,sc);ctx.restore();
  const pulse=.7+.3*Math.sin(w.t*7);circle(p.x-1,p.y-5,3.4*pulse,'#e36c3d88');circle(p.x+1,p.y-7,2.1*pulse,'#ffd06a99');
  for(let i=0;i<3;i++){const drift=Math.sin(w.t*1.7+i)*4;circle(p.x+drift,p.y-14-i*9-w.t*2.3,6+i*3,'#42494344')}
}

drawEnemy=function(e){
  if(e.insideBuilding)return;
  const p=isoAS(e.a,e.s),mob=PORTRAIT?.58:1;
  if(e.jumpT>0&&e.jumpStart>0){const q=1-e.jumpT/e.jumpStart;p.y-=Math.sin(q*Math.PI)*9}
  if(e.fort){if(PORTRAIT){ctx.save();ctx.translate(p.x,p.y);ctx.scale(.60,.60);drawFieldBunker(e,{x:0,y:0});ctx.restore()}else drawFieldBunker(e,p)}
  else if(e.vehicle){const base=e.type==='motorcycle'?.82:e.type==='technical'?.87:e.type==='truck'||e.type==='engineertruck'?.96:e.type==='halftrack'||e.type==='apc'?1.00:e.type==='stug'?1.09:e.type==='tank'?1.15:.88,sc=base*mob;if(inRiver(e.a,e.s)&&nearBridge(e.s))p.y+=Math.sin(e.age*11)*.7;drawVehicle(e,p,sc)}
  else drawSoldier(e,p,.76*(PORTRAIT?.69:1));
  const f=clamp(e.hp/e.maxhp,0,1),w=(e.fort?36:e.heavy?34:e.vehicle?30:22)*(PORTRAIT?.66:1),y=p.y-(e.fort?27:e.heavy?30:e.vehicle?24:25)*(PORTRAIT?.66:1);
  rr(p.x-w/2,y,w,PORTRAIT?3:4,2,'#231c18aa');ctx.fillStyle=targetClass(e)==='personnel'?'#9abf75':targetClass(e)==='armor'?'#85b6c4':'#e6bc59';ctx.fillRect(p.x-w/2+1,y+1,(w-2)*f,PORTRAIT?1.5:2)
};

draw=function(){
  ctx.save();const sx=state.shake?rnd(-state.shake,state.shake):0,sy=state.shake?rnd(-state.shake*.5,state.shake*.5):0;ctx.translate(sx,sy);
  drawGround();for(const f of FOLIAGE)drawPlant(f);for(const t of TRENCHES)drawTrench(t);for(const c of state.craters.slice(-12))drawCrater(c);
  drawBuilding();for(const w of wrecks)drawWreck(w);drawFriendlyBunker();
  const drawables=state.enemies.filter(e=>e.hp>0).slice().sort((a,b)=>isoAS(a.a,a.s).y-isoAS(b.a,b.s).y);for(const e of drawables)drawEnemy(e);
  for(const c of state.corpses)drawCorpse(c);drawShots();drawFx();ctx.restore();drawCrosshair();
};

update=function(dt){
  _v53.update(dt);
  for(const w of wrecks)w.t+=dt;while(wrecks.length&&wrecks[0].t>=wrecks[0].life)wrecks.shift();
  if(state.phase==='wave'&&state.queue.length){
    const alive=state.enemies.filter(e=>e.hp>0).length,next=state.queue[0];
    if(!next.phase&&alive>=15&&alive<18&&state.spawnClock<=.13){state.queue.shift();spawnFromQueue(next);state.spawnClock=.22}
    else if(!next.phase&&alive<15)state.spawnClock=Math.min(state.spawnClock,.20);
  }
};

updateUI=function(){
  _v53.updateUI();
  const uv=$('upgradeViz');if(!uv)return;
  const pips=(n,cls='')=>Array.from({length:6},(_,i)=>`<span class="pip ${cls} ${i<n?'on':''}"></span>`).join('');
  uv.innerHTML=`<div class="ttl">BUNKER SYSTEMS</div><div class="urow"><span>GUN</span><span class="pips">${pips(Math.min(6,state.damageLvl))}</span></div><div class="urow"><span>COOL</span><span class="pips">${pips(Math.min(6,state.coolLvl),'cool')}</span></div>`;
};

resize();updateUI();
window.__JBD55={BUILDING,wrecks};
})();
