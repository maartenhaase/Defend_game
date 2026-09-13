(()=>{
'use strict';
if(typeof state==='undefined'||typeof canvas==='undefined') return;
const SLING={active:false,pid:null,fx:0,fy:0,bx:0,by:0,pullX:0,pullY:0,power:0,charge:0,kind:'kinetic',hold:0,dirA:-1,dirS:0,range:80,speed:260,arc:0};
state.blastLvl=state.blastLvl||1;
function slingKind(charge){return charge<.36?'kinetic':charge<.70?'ap':'he'}
function slingLabel(kind){return kind==='kinetic'?'KINETIC':kind==='ap'?'AP':'HE'}
function slingColor(kind){return kind==='kinetic'?'#eee4c5':kind==='ap'?'#a9ddea':'#efbd55'}
function bunkerScreen(){return isoAS(77,0)}
function updateSlingModel(now=performance.now()){
  if(!SLING.active)return;
  const holdSec=Math.max(0,(now-SLING.hold)/1000),maxPull=150,pd=Math.hypot(SLING.pullX,SLING.pullY);
  SLING.power=clamp(pd/maxPull,0,1);
  const chargeTime=Math.max(.55,1.22-(state.coolLvl-1)*.10),timeCharge=clamp(holdSec/chargeTime,0,1);
  SLING.charge=clamp(SLING.power*.55+timeCharge*.45,0,1);SLING.kind=slingKind(SLING.charge);
  SLING.range=52+SLING.power*132;SLING.speed=(225+SLING.power*370)*(1+(state.damageLvl-1)*.045);
  SLING.arc=SLING.kind==='kinetic'?0:SLING.kind==='ap'?24+SLING.power*18:46+SLING.power*30;
  const B=bunkerScreen();let sx=-SLING.pullX,sy=-Math.max(8,SLING.pullY),len=Math.max(1,Math.hypot(sx,sy));sx/=len;sy/=len;
  const P=asFromScreen(B.x+sx*110,B.y+sy*110),da=P.a-77,ds=P.s,d=Math.max(.001,Math.hypot(da,ds));SLING.dirA=da/d;SLING.dirS=ds/d;
  const meter=$('chargeFill');if(meter)meter.style.width=`${Math.round(SLING.charge*100)}%`;
  const label=$('chargeType');if(label){label.textContent=slingLabel(SLING.kind);label.style.color=slingColor(SLING.kind)}
  const pwr=$('powerRead');if(pwr)pwr.textContent=`${Math.round(SLING.power*100)}%`;
}
function launchSling(){
  if(!SLING.active||state.phase!=='wave')return;updateSlingModel();
  if(SLING.power<.10){$('msg').textContent='TREK VERDER OMLAAG';return}if(state.trigger>0){$('msg').textContent='HERLADEN';return}
  const kind=SLING.kind,ammo=kind==='kinetic'?'mg':kind,range=SLING.range,ta=77+SLING.dirA*range,ts=SLING.dirS*range,powerBoost=.72+SLING.power*.72,chargeBoost=.82+SLING.charge*.52;
  let damage,splash=0;if(kind==='kinetic')damage=21*powerBoost*chargeBoost*(1+(state.damageLvl-1)*.15);else if(kind==='ap')damage=92*powerBoost*chargeBoost*(1+(state.damageLvl-1)*.16);else{damage=112*powerBoost*chargeBoost*(1+(state.damageLvl-1)*.17);splash=(9.5+(state.blastLvl-1)*1.8)*(0.8+SLING.charge*.35)}
  const life=Math.max(.20,Math.min(.72,range/SLING.speed));state.shots.push({enemy:false,type:ammo,a:77,s:0,ta,ts,t:0,life,damage,hitDone:false,arc:kind!=='kinetic',splash,arcHeight:SLING.arc,sling:true});
  state.trigger=kind==='kinetic'?.24:kind==='ap'?.48:.78;state.shake=Math.min(7,state.shake+(kind==='kinetic'?.5:kind==='ap'?1.5:2.5));shotSound(kind==='kinetic'?'mg':kind);$('msg').textContent=`${slingLabel(kind)} · KRACHT ${Math.round(SLING.power*100)}%`;updateUI();
}
fire=function(){};fireHeld=false;
function pointerPos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function slingDown(e){if(e.pointerType!=='touch'&&e.button!==0)return;const p=pointerPos(e),B=bunkerScreen();if(Math.hypot(p.x-B.x,p.y-B.y)>72){$('msg').textContent='PAK DE KATAPULT BIJ DE BUNKER';e.preventDefault();e.stopImmediatePropagation();return}SLING.active=true;SLING.pid=e.pointerId;SLING.bx=B.x;SLING.by=B.y;SLING.fx=p.x;SLING.fy=p.y;SLING.pullX=0;SLING.pullY=0;SLING.hold=performance.now();fireHeld=false;try{canvas.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault();e.stopImmediatePropagation()}
function slingMove(e){if(!SLING.active||e.pointerId!==SLING.pid)return;const p=pointerPos(e),B=bunkerScreen();SLING.fx=p.x;SLING.fy=Math.max(B.y,p.y);SLING.pullX=clamp(SLING.fx-B.x,-115,115);SLING.pullY=clamp(SLING.fy-B.y,0,150);updateSlingModel();e.preventDefault();e.stopImmediatePropagation()}
function slingUp(e){if(!SLING.active||e.pointerId!==SLING.pid)return;slingMove(e);launchSling();SLING.active=false;SLING.pid=null;const meter=$('chargeFill');if(meter)meter.style.width='0%';try{canvas.releasePointerCapture(e.pointerId)}catch(_){}e.preventDefault();e.stopImmediatePropagation()}
canvas.addEventListener('pointerdown',slingDown,true);canvas.addEventListener('pointermove',slingMove,true);canvas.addEventListener('pointerup',slingUp,true);canvas.addEventListener('pointercancel',e=>{if(SLING.active){SLING.active=false;SLING.pid=null}e.preventDefault();e.stopImmediatePropagation()},true);
function buildSlingWave(n){const q=[],lane=()=>rnd(-36,36),fewInf=Math.min(2,Math.max(0,Math.floor(n/3)));q.push(mkPhase(1,'ARMORED PROBE',5));q.push({type:n%4===0?'tank':'stug',lane:lane()});q.push({type:'technical',lane:lane()});q.push({type:'motorcycle',lane:lane()});q.push({type:'technical',lane:lane()});if(n>=2)q.push({type:'truck',lane:lane()});if(n>=3)q.push({type:'motorcycle',lane:lane()});for(let i=0;i<fewInf;i++)q.push({type:'rifle',lane:lane(),follow:true});q.push(mkPhase(2,'RIVER CONVOY',6));q.push({type:'truck',lane:lane()});q.push({type:n>=3?'halftrack':'technical',lane:lane()});q.push({type:'motorcycle',lane:lane()});q.push({type:'motorcycle',lane:lane()});if(n>=3)q.push({type:'apc',lane:lane()});if(n>=4)q.push({type:'truck',lane:lane()});for(let i=0;i<fewInf;i++)q.push({type:'mg',lane:lane(),follow:true});q.push(mkPhase(3,'HEAVY PUSH',7));q.push({type:'engineertruck',lane:lane()});q.push({type:'stug',lane:lane()});q.push({type:'technical',lane:lane()});q.push({type:'motorcycle',lane:lane()});if(n>=2)q.push({type:'truck',lane:lane()});if(n>=3)q.push({type:'tank',lane:lane()});if(n>=4)q.push({type:'apc',lane:lane()});for(let i=0;i<fewInf;i++)q.push({type:'grenadier',lane:lane(),follow:true});return q}
buildWave=buildSlingWave;previewWave=n=>{const q=buildSlingWave(n);return{inf:q.filter(x=>x.type&&['rifle','storm','mg','grenadier','engineer'].includes(x.type)).length+2,armor:q.filter(x=>x.type&&DEF[x.type]?.vehicle).length,eng:1}};
const oldSpawn=spawn;spawn=function(type,lane=0,opts={}){const e=oldSpawn(type,lane,opts);if(e.vehicle){const m={motorcycle:rnd(1.30,1.62),technical:rnd(1.08,1.34),truck:rnd(.90,1.12),engineertruck:rnd(.82,1.00),halftrack:rnd(.76,.98),apc:rnd(.80,1.00),stug:rnd(.61,.82),tank:rnd(.54,.74)}[type]||1;e.speed*=m}return e};
const oldEff=effectiveness;effectiveness=function(ammo,e){let v=oldEff(ammo,e);if(ammo==='he'&&e.vehicle)v=Math.max(v,e.heavy?.82:1.0);if(ammo==='he'&&e.type==='tank')v=Math.max(v,.80);return v};
function distributeMap(){if(typeof TRENCHES!=='undefined'){TRENCHES.length=0;[{a:-32,s:-30,w:10},{a:-30,s:28,w:10},{a:-12,s:-9,w:11},{a:-10,s:14,w:11},{a:9,s:-31,w:10},{a:12,s:30,w:10},{a:31,s:-13,w:10},{a:34,s:16,w:10},{a:53,s:-27,w:11},{a:56,s:25,w:11}].forEach(x=>TRENCHES.push(x))}if(typeof FOLIAGE!=='undefined'){FOLIAGE.length=0;const spots=[[-78,-36],[-76,-18],[-74,1],[-73,22],[-70,39],[-61,-29],[-59,-8],[-57,14],[-55,33],[-46,-36],[-44,-17],[-43,4],[-41,24],[-31,-27],[-29,-5],[-28,17],[-26,37],[-15,-34],[-13,-12],[-12,9],[-10,29],[2,-31],[3,-8],[4,15],[7,35],[18,-37],[20,-16],[22,7],[24,27],[36,-29],[38,-5],[40,18],[50,-35],[52,-12],[54,10],[56,31],[67,-25],[68,0],[69,24]];for(const [a,s] of spots){const xy=xyFromAS(a,s);FOLIAGE.push({x:xy.x,y:xy.y,kind:Math.random()<.23?'palm':Math.random()<.55?'bamboo':'bush',size:rnd(.7,1.1)})}}}
const oldStart=startWave;startWave=function(){distributeMap();oldStart();const h=document.querySelector('header strong');if(h)h.textContent='JBD // 5.11 // TRUE SLINGSHOT'};
const oldUI=updateUI;updateUI=function(){oldUI();for(const id of ['upgradeViz','targetCard','tip','counterGuide']){const el=$(id);if(el)el.style.display='none'}const h=document.querySelector('header strong');if(h)h.textContent='JBD // 5.11 // TRUE SLINGSHOT'};
const blastBtn=document.querySelector('[data-sling-buy="blast"]');if(blastBtn)blastBtn.addEventListener('click',()=>{const cost=20+state.blastLvl*4;if(state.supply>=cost){state.supply-=cost;state.blastLvl++;$('blastLvl').textContent=state.blastLvl;updateUI();uiSound()}});
drawShots=function(){for(const sh of state.shots){if(sh.t<0||sh.done)continue;const u=clamp(sh.t/sh.life,0,1),a=lerp(sh.a,sh.ta,u),s=lerp(sh.s,sh.ts,u),z=sh.arc?Math.sin(u*Math.PI)*(sh.arcHeight||55):0,p=isoAS(a,s,z);if(sh.enemy){const q=isoAS(sh.a,sh.s),r=isoAS(a,s);line(q.x,q.y,r.x,r.y,.75,'#e98c5e66');circle(p.x,p.y,1.1,'#ffc775')}else if(sh.type==='mg'){circle(p.x,p.y,1.15,C.tracer,'#fff2ad',.45)}else if(sh.type==='ap'){circle(p.x,p.y,1.75,'#b7e0e7','#efffff',.7)}else{circle(p.x,p.y,2.4,'#d7bb61','#fff0a7',.8)}}};
drawCrosshair=function(){};const oldDraw=draw;draw=function(){oldDraw();if(!SLING.active)return;updateSlingModel();const B=bunkerScreen(),F={x:B.x+SLING.pullX,y:B.y+SLING.pullY},col=slingColor(SLING.kind);ctx.save();line(B.x-10,B.y-5,F.x,F.y,3,'#382c22');line(B.x+10,B.y-5,F.x,F.y,3,'#382c22');circle(F.x,F.y,5,col,'#171b17',1.2);for(let i=1;i<=11;i++){const t=i/11,a=77+SLING.dirA*SLING.range*t,s=SLING.dirS*SLING.range*t,z=SLING.arc?Math.sin(t*Math.PI)*SLING.arc:0,p=isoAS(a,s,z);circle(p.x,p.y,1.3+(i%3===0?.4:0),col)}ctx.font='700 9px ui-monospace,monospace';ctx.textAlign='center';ctx.fillStyle=col;ctx.fillText(`${slingLabel(SLING.kind)}  ${Math.round(SLING.power*100)}%`,B.x,B.y-36);ctx.restore()};
const oldUpdate=update;update=function(dt){oldUpdate(dt);if(SLING.active)updateSlingModel()};
for(const id of ['amg','aap','ahe']){const el=$(id);if(el)el.style.display='none'}updateUI();window.__JBD511={SLING,launchSling};
})();