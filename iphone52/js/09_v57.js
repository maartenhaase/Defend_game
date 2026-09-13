// JBD v5.7 // STRAIGHT CAMPAIGN — gameplay, map rotation, ROE, fire & tension pass
(() => {
'use strict';

const V55=window.__JBD55||{};
const V56=window.__JBD56||{};
const BUILDING=V55.BUILDING;
const fires=V56.fires||[];
const civilians=V56.civilians||[];
const blood=V56.blood||[];
const wrecks=V55.wrecks||[];
const gibs=[];

const MAPS=[
  {id:'jungle',name:'JUNGLE',tint:'#123b20',accent:'#6c9150',speedInf:1.05,speedVeh:.97,cover:1.25,civ:.78,desc:'dense cover · infantry pressure'},
  {id:'polar',name:'POLAR',tint:'#d8e4e4',accent:'#91b3bd',speedInf:.96,speedVeh:1.11,cover:.72,civ:.48,desc:'open sightlines · fast armor'},
  {id:'desert',name:'DESERT',tint:'#b88e50',accent:'#d4ad6a',speedInf:1.02,speedVeh:1.08,cover:.82,civ:.62,desc:'long lanes · mobile attack'}
];
let map=MAPS[0],mapNo=0,waveStartHP=state.hp,civLosses=0,roeLock=0,lastWave=-1;
let mapDecor=[];

function mapForWave(n){return MAPS[(Math.max(1,n)-1)%MAPS.length]}
function regenMap(n){
  map=mapForWave(n);mapNo=n;civLosses=0;roeLock=0;waveStartHP=state.hp;
  state.craters.length=0;fires.length=0;civilians.length=0;blood.length=0;gibs.length=0;if(wrecks.length)wrecks.length=0;
  if(BUILDING){BUILDING.a=rnd(7,34);BUILDING.s=(Math.random()<.5?-1:1)*rnd(20,36)}
  if(typeof TRENCHES!=='undefined'){
    TRENCHES.length=0;const cnt=map.id==='jungle'?5:map.id==='polar'?3:4;
    for(let i=0;i<cnt;i++)TRENCHES.push({a:rnd(-8,49),s:rnd(-42,42),w:rnd(8,13)});
  }
  if(typeof RIVER!=='undefined'){
    RIVER.a=rnd(-20,-9);const b1=rnd(-34,-14),b2=rnd(13,34);RIVER.bridges=[b1,b2];RIVER.bridgeHalf=map.id==='polar'?5.8:5.0;
  }
  if(typeof FOLIAGE!=='undefined'){
    FOLIAGE.length=0;const count=map.id==='jungle'?72:map.id==='polar'?26:34;
    for(let i=0;i<count;i++){const x=rnd(-48,48),y=rnd(-48,48),a=x-y,s=x+y;if(Math.abs(s)<20&&a>-70&&a<62&&Math.random()<.45)continue;FOLIAGE.push({x,y,kind:map.id==='jungle'?(Math.random()<.3?'palm':Math.random()<.58?'bamboo':'bush'):'bush',size:rnd(.65,1.2)})}
  }
  mapDecor=[];for(let i=0;i<(map.id==='jungle'?14:map.id==='polar'?12:10);i++)mapDecor.push({a:rnd(-80,68),s:rnd(-45,45),r:rnd(2,6),k:Math.random()});
}

// Straight, upright battlefield. Advance axis = vertical, lateral axis = horizontal.
updateProjection=function(){
  PORTRAIT=W<=600&&H>W;
  const reserve=PORTRAIT?Math.min(126,Math.max(106,H*.165)):112;
  const top=8,bottom=H-reserve-8,ph=Math.max(360,bottom-top);
  const aw=WORLD.aMax-WORLD.aMin,sw=WORLD.sMax-WORLD.sMin;
  const micro=PORTRAIT?.92:1;
  P_A_X=0;P_S_Y=0;P_S_X=((W-22)/sw)*micro;P_A_Y=((ph-12)/aw)*micro;P_CX=W*.5;P_CY=top+ph*.48;
};
isoAS=function(a,s,z=0){return{x:P_CX+s*P_S_X,y:P_CY+(a-PCENTER_A)*P_A_Y-z*(PORTRAIT?.54:.72)}};
asFromScreen=function(x,y){return{a:PCENTER_A+(y-P_CY)/(P_A_Y||.001),s:(x-P_CX)/(P_S_X||.001)}};
xyFromAS=function(a,s){return{x:s,y:a}};isoXY=function(x,y,z=0){return isoAS(y,x,z)};

const _spawn=spawn;
spawn=function(type,lane=0,opts={}){const e=_spawn(type,lane,opts);e.speed*=e.vehicle?map.speedVeh:map.speedInf;return e};

const _weaponStats=weaponStats;
weaponStats=function(type){const w=_weaponStats(type);w.damage*=1.26;if(type==='he')w.splash*=1.12;return w};

const _damageBunker=damageBunker;
damageBunker=function(d){_damageBunker(d*1.13)};

function setSideCover(e,force=false){
  if(!e||e.vehicle||e.fort||e.insideBuilding||e.inTrench||e.dugIn)return;
  if(!force&&Math.random()>.42*map.cover)return;
  const side=Math.random()<.5?-1:1;
  const options=[];
  if(typeof TRENCHES!=='undefined')for(const t of TRENCHES){const d=Math.hypot(e.a-t.a,e.s-t.s);if(d<26)options.push({a:t.a,s:t.s,kind:'trench',score:d-rnd(0,4)})}
  if(BUILDING){const d=Math.hypot(e.a-BUILDING.a,e.s-BUILDING.s);if(d<30)options.push({a:BUILDING.a,s:BUILDING.s,kind:'building',score:d-3})}
  for(const c of state.craters.slice(-12)){const d=Math.hypot(e.a-c.a,e.s-c.s);if(d<20)options.push({a:c.a,s:c.s,kind:'crater',score:d})}
  if(options.length&&Math.random()<.68){options.sort((a,b)=>a.score-b.score);e.coverTarget=options[0]}
  else e.coverTarget={a:Math.min(72,e.a+rnd(7,18)),s:clamp(e.s+side*rnd(10,24),-45,45),kind:'flank'};
  e.mode='move';e.action='sprint';e.actionT=rnd(.55,.95);
}

const _movementTarget=movementTarget;
movementTarget=function(e){
  if(!e.vehicle&&!e.fort){
    for(const f of fires){if(f.t<f.life&&Math.hypot(e.a-f.a,e.s-f.s)<f.r+11){const side=e.s<=f.s?-1:1;return{a:Math.min(74,e.a+rnd(8,15)),s:clamp(e.s+side*rnd(13,22),-46,46),vehicle:null,fireEvade:true}}}
    if(!e.coverTarget&&Math.random()<.010*map.cover)setSideCover(e,true);
  }
  return _movementTarget(e);
};

const _damageEnemy=damageEnemy;
damageEnemy=function(e,ammo,base,a=e.a,s=e.s){
  const hp=e.hp;_damageEnemy(e,ammo,base,a,s);
  if(hp>e.hp&&!e.vehicle&&!e.fort){
    const n=ammo==='he'?4:2;for(let i=0;i<n;i++)gibs.push({a:e.a,s:e.s,t:0,life:rnd(.35,.85),va:rnd(-2.5,2.5),vs:rnd(-4,4),r:rnd(.5,1.4)});
    if(e.hp>0)setSideCover(e,Math.random()<.32);
  }
};

const _killEnemy=killEnemy;
killEnemy=function(e,ammo,cls){const a=e.a,s=e.s,inf=!e.vehicle&&!e.fort;_killEnemy(e,ammo,cls);if(inf){for(let i=0;i<5;i++)gibs.push({a,s,t:0,life:rnd(.45,1.1),va:rnd(-4,4),vs:rnd(-6,6),r:rnd(.7,1.6)});for(let i=0;i<3;i++)blood.push({a:a+rnd(-2.5,2.5),s:s+rnd(-2.5,2.5),t:0,life:rnd(8,16),r:rnd(2,4.5)})}};

function civilianPenalty(c,why='CIVILIAN HIT'){
  if(!c.alive)return;c.alive=false;civLosses++;state.chain=0;state.chainClock=0;roeLock=5.5;
  const fine=30+civLosses*15;state.supply=Math.max(0,state.supply-fine);blood.push({a:c.a,s:c.s,t:0,life:12,r:4});
  $('msg').textContent=`${why} · -${fine} SUP · ROE BROKEN`;state.fx.push({kind:'text',a:c.a,s:c.s,t:0,life:1.2,text:'NO FIRE!',col:'#ffd36a'});
}
function civSegmentT(a1,s1,a2,s2,c){const A=isoAS(a1,s1),B=isoAS(a2,s2),P=isoAS(c.a,c.s),dx=B.x-A.x,dy=B.y-A.y,l2=dx*dx+dy*dy;if(l2<.001)return null;const t=clamp(((P.x-A.x)*dx+(P.y-A.y)*dy)/l2,0,1),qx=A.x+dx*t,qy=A.y+dy*t;return Math.hypot(P.x-qx,P.y-qy)<7?t:null}
function ignite(a,s){fires.push({a,s,t:0,life:rnd(52,68),r:rnd(6.5,9.5)});if(fires.length>9)fires.shift()}

// Replace shot update so civilian collisions and HE blast danger are exact rather than approximate.
updateShot=function(sh,dt){
  sh.t+=dt;if(sh.t<0)return;
  if(sh.enemy){const u=clamp(sh.t/sh.life,0,1);if(u>=1&&!sh.done){if(sh.hit)damageBunker(sh.damage);else if(Math.random()<.22)state.fx.push({kind:'dust',a:77+rnd(-3,3),s:rnd(-5,5),t:0,life:.35});sh.done=true}return}
  const u=clamp(sh.t/sh.life,0,1),q=1-Math.pow(1-u,1.35),ca=lerp(sh.a,sh.ta,q),cs=lerp(sh.s,sh.ts,q);sh.ca=ca;sh.cs=cs;
  if(sh.type==='he'){
    if(u>=1&&!sh.done){state.craters.push({a:sh.ta,s:sh.ts,r:rnd(4.8,7),t:0});for(const e of state.enemies){if(e.hp>0){const d=Math.hypot(e.a-sh.ta,e.s-sh.ts);if(d<sh.splash+hitRadius(e)){const fall=clamp(1-d/(sh.splash+hitRadius(e)),.25,1);damageEnemy(e,'he',sh.damage*fall,sh.ta,sh.ts)}}}for(const c of civilians){if(c.alive&&Math.hypot(c.a-sh.ta,c.s-sh.ts)<sh.splash+3)civilianPenalty(c,'CIVILIAN IN HE BLAST')}state.fx.push({kind:'explosion',a:sh.ta,s:sh.ts,t:0,life:.7,big:true});boom(true);ignite(sh.ta,sh.ts);sh.done=true}return
  }
  if(!sh.hitDone){let best=null;for(const e of state.enemies){if(e.hp<=0)continue;const t=segmentHit(sh.a,sh.s,ca,cs,e);if(t!==null&&(!best||t<best.t))best={e,t,civ:false}}for(const c of civilians){if(!c.alive)continue;const t=civSegmentT(sh.a,sh.s,ca,cs,c);if(t!==null&&(!best||t<best.t))best={e:c,t,civ:true}}if(best){if(best.civ)civilianPenalty(best.e);else{damageEnemy(best.e,sh.type,sh.damage);state.fx.push({kind:sh.type==='ap'?'spark':'dust',a:best.e.a,s:best.e.s,t:0,life:.28})}sh.hitDone=true;sh.done=true;return}}
  if(u>=1)sh.done=true
};

const _award=award;
award=function(e,ammo){const before=state.supply;_award(e,ammo);if(roeLock<=0&&ammo===BEST[targetClass(e)]&&e.a>55){state.supply+=2;state.waveBounty+=2;floater(e.a,e.s,'CLUTCH +2',C.gold)}return state.supply-before};

const _drawGround=drawGround;
drawGround=function(){
  _drawGround();ctx.save();if(map.id==='polar'){ctx.fillStyle='#dbe6e2aa';ctx.fillRect(0,0,W,H)}else if(map.id==='desert'){ctx.fillStyle='#a87b3b55';ctx.fillRect(0,0,W,H)}else{ctx.fillStyle='#0f381b20';ctx.fillRect(0,0,W,H)}
  for(const d of mapDecor){const p=isoAS(d.a,d.s);if(map.id==='polar'){ellipse(p.x,p.y,d.r*2,d.r*.55,'#edf4f0aa');if(d.k>.7)line(p.x,p.y,p.x,p.y-8-d.r,1,'#5d6d69')}else if(map.id==='desert'){ellipse(p.x,p.y,d.r*2,d.r*.5,'#d0ad6a55');if(d.k>.72){line(p.x,p.y,p.x,p.y-7-d.r,2,'#58613e');line(p.x,p.y-5,p.x+4,p.y-8,1.5,'#58613e')}}else if(d.k>.75)ellipse(p.x,p.y,d.r*1.5,d.r*.5,'#173a1f55')}
  ctx.restore();
};
const _drawPlant=drawPlant;
drawPlant=function(f){
  if(map.id==='jungle')return _drawPlant(f);const h=Math.abs(Math.sin(f.x*12.9898+f.y*78.233));if(map.id==='polar'){if(h<.55)return;const p=isoXY(f.x,f.y),m=PORTRAIT?.46:.68;ctx.save();ctx.translate(p.x,p.y);ctx.scale(m,m);line(0,5,0,-15,2,'#56665f');poly([[0,-18],[-7,-4],[7,-4]],'#70877c','#46554f',1);poly([[0,-12],[-9,1],[9,1]],'#80968c','#46554f',1);ctx.restore();return}if(h<.5)return;const p=isoXY(f.x,f.y),m=PORTRAIT?.45:.66;ctx.save();ctx.translate(p.x,p.y);ctx.scale(m,m);ellipse(0,5,7,2,'#402f1f44');for(let i=0;i<4;i++)line(0,3,Math.cos(i*1.7)*7,-4-Math.sin(i)*3,2,'#6f7544');ctx.restore()};

const _draw=draw;
draw=function(){
  _draw();ctx.save();for(const g of gibs){const p=isoAS(g.a,g.s);ctx.globalAlpha=clamp(1-g.t/g.life,0,1);circle(p.x,p.y,g.r*(PORTRAIT?.7:1),'#791f1d')}
  // Stronger persistent fire readability.
  for(const f of fires){if(f.t>=f.life)continue;const p=isoAS(f.a,f.s),pulse=.8+.2*Math.sin(f.t*10);ctx.globalAlpha=.9;ellipse(p.x,p.y+2,f.r*(PORTRAIT?.45:.7),f.r*.16,'#5b251b55');circle(p.x-2,p.y-5,5*pulse,'#ef6f32aa');circle(p.x+2,p.y-8,3.5*pulse,'#ffd15ecc')}
  ctx.restore();
  // Civilian no-fire warning near reticle.
  let near=null,bd=24;for(const c of civilians){if(!c.alive)continue;const p=isoAS(c.a,c.s),d=Math.hypot(mouse.x-p.x,mouse.y-p.y);if(d<bd){bd=d;near=c}}if(near){ctx.save();ctx.font='800 9px ui-monospace,monospace';ctx.textAlign='center';ctx.fillStyle='#ffd36a';ctx.fillText('NO FIRE · CIVILIAN',mouse.x,mouse.y-24);ctx.restore()}
};

const _finishWave=finishWave;
finishWave=function(){let bonus=0;if(civLosses===0){bonus+=10;state.supply+=10}const lost=waveStartHP-state.hp;if(lost<=12){bonus+=6;state.supply+=6}_finishWave();if(bonus)$('msg').textContent+=` · DISCIPLINE +${bonus}`};

const _startWave=startWave;
startWave=function(){if(state.phase!=='wave')regenMap(state.wave+1);_startWave();map=mapForWave(state.wave);waveStartHP=state.hp;lastWave=state.wave;document.body.dataset.theme=map.id;$('msg').textContent=`MAP ${state.wave} · ${map.name} · ${map.desc}`;updateUI();resize()};

const _update=update;
update=function(dt){
  _update(dt);if(roeLock>0)roeLock-=dt;for(const g of gibs){g.t+=dt;g.a+=g.va*dt;g.s+=g.vs*dt;g.va*=.92;g.vs*=.90}for(let i=gibs.length-1;i>=0;i--)if(gibs[i].t>=gibs[i].life)gibs.splice(i,1);
  // Fire is a tactical hazard: infantry actively avoids it; trapped infantry takes light damage.
  if(state.phase==='wave')for(const e of state.enemies){if(e.hp<=0||e.vehicle||e.fort||e.swimming)continue;for(const f of fires){if(f.t>=f.life)continue;const d=Math.hypot(e.a-f.a,e.s-f.s);if(d<f.r+1){e.hp-=2.8*dt;e.action='sprint';e.actionT=.6;setSideCover(e,true);if(e.hp<=0){killEnemy(e,'he',targetClass(e));break}}}}
};

function threatValue(){let v=0;for(const e of state.enemies){if(e.hp<=0)continue;const q=clamp((e.a+15)/92,0,1);v+=q*(e.heavy?2.2:e.vehicle?1.4:1)}return clamp(v/9,0,1)}
function ensureHud(){let el=$('threat57');if(!el){el=document.createElement('div');el.id='threat57';el.className='panel';el.style.cssText='position:absolute;right:6px;bottom:117px;width:116px;padding:6px 7px;font:700 7px ui-monospace,monospace;color:#eee5cf;z-index:7';$('wrap').appendChild(el)}return el}
const _updateUI=updateUI;
updateUI=function(){_updateUI();const t=ensureHud(),tv=threatValue();t.innerHTML=`<div style="display:flex;justify-content:space-between"><span>${map.name} ${mapNo||state.wave+1}</span><span>${civLosses?'ROE '+civLosses:'ROE OK'}</span></div><div style="height:4px;background:#151b18;border:1px solid #4b574f;margin-top:4px"><div style="height:100%;width:${Math.round(tv*100)}%;background:${tv>.72?'#d96a55':tv>.42?'#e6bd5d':'#8db36f'}"></div></div><div style="margin-top:3px;color:#aeb8a2">THREAT ${Math.round(tv*100)}%</div>`;const strong=document.querySelector('header strong');if(strong)strong.textContent=`JBD // 5.7 // ${map.name} ${Math.max(1,state.wave)}`};

regenMap(1);resize();updateUI();
window.__JBD57={MAPS,regenMap,gibs,get map(){return map},get civLosses(){return civLosses}};
})();
