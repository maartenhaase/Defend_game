// JBD v5.15 // HEAVY METAL — skill feedback, command armor, field mods, combo juice
(()=>{
'use strict';
if(typeof state==='undefined') return;

state.mods515=state.mods515||{hyper:0,sabot:0,over:0};
let combo=0,comboT=0,lastKillAt=-99,slowT=0,flashT=0,muzzleT=0,bossMade=false,lastStandShown=false;
let pendingMod=false,chainGuard=false,seenShotCount=0;
const bursts=[];

function ci(){return window.__JBD514?.campaignInfo514?.(Math.max(1,state.wave||1))||{theme:'JUNGLE',sub:1,cycle:1}}
function weakPoint(e){
  const p=isoAS(e.a,e.s),side=e.weakSide515||1;
  return{x:p.x+side*(e.type==='tank'?7:e.type==='stug'?6:5),y:p.y-(e.type==='tank'?7:5)};
}
function ensureStyle(){
  if($('style515'))return;
  const st=document.createElement('style');st.id='style515';st.textContent=`
  #combo515{position:absolute;top:28px;left:50%;transform:translateX(-50%);z-index:12;pointer-events:none;font:900 11px ui-monospace,monospace;color:#f3e9c8;text-shadow:0 2px 4px #000;opacity:0;transition:opacity .12s}
  #mods515{margin:8px 0 4px;padding:7px;border:1px solid #657369;background:#111915cc;border-radius:7px}
  #mods515 .mt{font:900 9px ui-monospace,monospace;margin-bottom:6px;color:#f2d77e}
  #mods515 .mr{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}
  #mods515 button{padding:7px 3px;font:800 7px ui-monospace,monospace;line-height:1.15}
  #mods515 small{display:block;font-size:6px;opacity:.72;margin-top:2px}
  `;document.head.appendChild(st);
  const c=document.createElement('div');c.id='combo515';$('wrap').appendChild(c);
}
function comboText(){
  const el=$('combo515');if(!el)return;
  if(combo<2||comboT<=0){el.style.opacity='0';return}
  const name=combo>=10?'RAMPAGE':combo>=6?'MULTI KILL':combo>=3?'CHAIN':'DOUBLE';
  el.textContent=`${name} ×${combo}`;el.style.opacity=String(clamp(comboT/.45,0,1));
}
function banner(text,col='#f1d26f',life=.75){bursts.push({kind:'banner',text,col,t:0,life});if(bursts.length>18)bursts.shift()}
function impactBurst(e,strong=false){bursts.push({kind:'impact',a:e.a,s:e.s,t:0,life:strong?.48:.28,strong});if(bursts.length>18)bursts.shift()}

function showMods(){
  const shop=$('shop');if(!shop||!pendingMod)return;
  let box=$('mods515');if(!box){
    box=document.createElement('div');box.id='mods515';
    box.innerHTML=`<div class="mt">FIELD MOD // KIES 1 GRATIS</div><div class="mr">
      <button data-mod515="hyper">HYPERFEED<small>+1 kogel per burst</small></button>
      <button data-mod515="sabot">SABOT CORE<small>AP weakpoint harder</small></button>
      <button data-mod515="over">OVERPRESSURE<small>HE groter + harder</small></button>
    </div>`;
    const next=$('nextBtn');shop.insertBefore(box,next);
    box.querySelectorAll('[data-mod515]').forEach(b=>b.addEventListener('click',()=>chooseMod(b.dataset.mod515)));
  }
  box.style.display='block';
}
function chooseMod(k){
  if(!pendingMod)return;
  state.mods515[k]=(state.mods515[k]||0)+1;
  if(k==='hyper')state.burstCount=Math.min(8,(state.burstCount||2)+1);
  pendingMod=false;
  const box=$('mods515');if(box)box.style.display='none';
  state.supply+=3;
  banner(k==='hyper'?'HYPERFEED INSTALLED':k==='sabot'?'SABOT CORE INSTALLED':'OVERPRESSURE INSTALLED','#bfe29d',1.05);
  uiSound();updateUI();
}

const oldSpawn515=spawn;
spawn=function(type,lane=0,opts={}){
  const e=oldSpawn515(type,lane,opts);
  if(e.vehicle){e.weakSide515=Math.random()<.5?-1:1;e.smokeSeed515=Math.random()*9;}
  const x=ci();
  if(x.sub===3&&!bossMade&&['tank','stug','apc'].includes(type)){
    bossMade=true;e.boss515=true;e.maxhp*=1.42;e.hp=e.maxhp;e.damage*=1.14;e.speed*=.92;e.reward=(e.reward||10)+8;
    banner('COMMAND ARMOR','#efbd55',1.1);
  }
  return e;
};

const oldDamage515=damageEnemy;
damageEnemy=function(e,ammo,base,a=e.a,s=e.s){
  if(e.hp<=0)return;
  let b=base,precision=false;
  if(ammo==='ap'&&e.vehicle){
    const w=weakPoint(e),d=Math.hypot(mouse.x-w.x,mouse.y-w.y),rad=e.heavy?11:9;
    if(d<=rad){
      precision=true;
      const mod=state.mods515.sabot||0;
      b*=1.38+mod*.16;
      floater(e.a,e.s,mod?'SABOT CRIT':'WEAK POINT',C.gold);
    }else if(state.mods515.sabot)b*=1+.05*state.mods515.sabot;
  }
  if(ammo==='he'&&state.mods515.over)b*=1+.10*state.mods515.over;
  if(state.hp/state.maxhp<.29)b*=1.12;
  const before=e.hp;
  oldDamage515(e,ammo,b,a,s);
  if(before>e.hp){
    impactBurst(e,precision||ammo==='he');
    if(e.vehicle&&ammo==='ap'&&!e.armorBroken515&&e.hp>0&&e.hp/e.maxhp<.54){
      e.armorBroken515=true;e.speed*=.76;e.damage*=.91;
      floater(e.a,e.s,'ARMOR BREAK','#f0c65f');banner('ARMOR BREAK','#f0c65f',.62);state.shake=Math.min(8,state.shake+1.4);
    }
  }
};

const oldKill515=killEnemy;
killEnemy=function(e,ammo,cls){
  const fresh=e.hp>-999;
  const wasVehicle=e.vehicle,wasHeavy=e.heavy,wasBoss=e.boss515,a=e.a,s=e.s;
  oldKill515(e,ammo,cls);
  if(!fresh)return;
  const now=performance.now()/1000;
  combo=now-lastKillAt<2.45?combo+1:1;lastKillAt=now;comboT=2.6;
  if(combo===3){state.supply+=1;floater(a,s,'CHAIN +1',C.gold);uiSound()}
  if(combo===6){state.supply+=2;floater(a,s,'MULTI +2',C.gold);uiSound()}
  if(combo===10){state.supply+=3;floater(a,s,'RAMPAGE +3',C.gold);uiSound()}
  if(wasBoss){state.supply+=8;floater(a,s,'COMMAND +8',C.gold);banner('COMMAND DESTROYED','#ffe08b',1.0)}
  if(wasHeavy||wasBoss){slowT=Math.max(slowT,wasBoss?.14:.085);flashT=Math.max(flashT,wasBoss?.22:.12);state.shake=Math.min(10,state.shake+(wasBoss?4:2.4));}
  if(wasVehicle&&ammo==='he'&&!chainGuard){
    chainGuard=true;
    for(const n of state.enemies){
      if(n===e||n.hp<=0||!n.vehicle)continue;
      const d=Math.hypot(n.a-a,n.s-s);
      if(d<10){oldDamage515(n,'he',24*(1-d/14),a,s);state.fx.push({kind:'spark',a:n.a,s:n.s,t:0,life:.22})}
    }
    chainGuard=false;
  }
};

function tuneShots(){
  for(const sh of state.shots){
    if(sh.enemy||sh.v515)continue;sh.v515=true;
    if(sh.type==='he'&&state.mods515.over){sh.damage*=1+.10*state.mods515.over;sh.splash*=1+.09*state.mods515.over;}
    if(sh.type==='ap'&&state.mods515.sabot)sh.damage*=1+.025*state.mods515.sabot;
  }
  if(state.shots.length>seenShotCount){
    const newbies=state.shots.slice(seenShotCount).filter(s=>!s.enemy);if(newbies.length)muzzleT=.075;
  }
  seenShotCount=state.shots.length;
}

const oldStart515=startWave;
startWave=function(){
  bossMade=false;combo=0;comboT=0;lastKillAt=-99;lastStandShown=false;pendingMod=false;
  const box=$('mods515');if(box)box.style.display='none';
  oldStart515();
};

const oldFinish515=finishWave;
finishWave=function(){
  oldFinish515();
  const x=ci();
  if(x.sub===3){pendingMod=true;showMods();}
};

const oldUpdate515=update;
update=function(dt){
  tuneShots();
  const scaled=slowT>0?dt*.34:dt;
  oldUpdate515(scaled);
  if(slowT>0)slowT=Math.max(0,slowT-dt);
  if(flashT>0)flashT=Math.max(0,flashT-dt);
  if(muzzleT>0)muzzleT=Math.max(0,muzzleT-dt);
  if(comboT>0){comboT-=dt;if(comboT<=0)combo=0}
  for(const b of bursts)b.t+=dt;for(let i=bursts.length-1;i>=0;i--)if(bursts[i].t>=bursts[i].life)bursts.splice(i,1);
  if(state.phase==='wave'&&state.hp/state.maxhp<.29&&!lastStandShown){lastStandShown=true;banner('LAST STAND','#ff9a72',1.0);state.supply+=2;}
  comboText();
};

const oldDrawEnemy515=drawEnemy;
drawEnemy=function(e){
  oldDrawEnemy515(e);
  if(e.hp<=0||!e.vehicle)return;
  const p=isoAS(e.a,e.s);
  ctx.save();
  if(e.hp/e.maxhp<.58){
    const t=performance.now()/260+(e.smokeSeed515||0);ctx.globalAlpha=.28;
    circle(p.x+Math.sin(t)*2,p.y-15-Math.cos(t)*2,2.8,'#2f3531');circle(p.x-2+Math.sin(t*.7)*3,p.y-20,3.8,'#4b514c');
  }
  if(e.heavy||e.boss515){
    const w=weakPoint(e);ctx.globalAlpha=e.boss515?.95:.68;ctx.strokeStyle=e.boss515?'#efbd55':'#e68b59';ctx.lineWidth=e.boss515?1.6:1;
    ctx.beginPath();ctx.arc(w.x,w.y,e.boss515?4.2:3.1,0,Math.PI*2);ctx.stroke();line(w.x-5,w.y,w.x-2,w.y,1,ctx.strokeStyle);line(w.x+2,w.y,w.x+5,w.y,1,ctx.strokeStyle);
  }
  if(e.boss515){ctx.strokeStyle='#efbd55aa';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(p.x,p.y,20,Math.PI*1.08,Math.PI*1.92);ctx.stroke();}
  ctx.restore();
};

const oldDrawShots515=drawShots;
drawShots=function(){
  ctx.save();
  for(const sh of state.shots){
    if(sh.enemy||sh.done||sh.t<0)continue;const u=clamp(sh.t/sh.life,0,1),u0=clamp(u-.055,0,1),a=lerp(sh.a,sh.ta,u),s=lerp(sh.s,sh.ts,u),a0=lerp(sh.a,sh.ta,u0),s0=lerp(sh.s,sh.ts,u0),p=isoAS(a,s),q=isoAS(a0,s0);ctx.globalAlpha=sh.type==='he'?.25:.38;line(q.x,q.y,p.x,p.y,sh.type==='mg'?.7:1.2,sh.type==='ap'?'#c9f1f4':sh.type==='he'?'#f2c866':'#fff0a6');
  }
  ctx.restore();oldDrawShots515();
};

const oldDraw515=draw;
draw=function(){
  oldDraw515();
  const bp=isoAS(77,0);
  if(muzzleT>0){const ang=Math.atan2(mouse.y-bp.y,mouse.x-bp.x),x=bp.x+Math.cos(ang)*25,y=bp.y+Math.sin(ang)*25;ctx.save();ctx.globalAlpha=clamp(muzzleT/.075,0,1);circle(x,y,6,'#ffd66b99');circle(x,y,2.5,'#fff1b8');ctx.restore();}
  ctx.save();
  for(const b of bursts){
    const u=b.t/b.life;
    if(b.kind==='impact'){
      const p=isoAS(b.a,b.s);ctx.globalAlpha=1-u;ctx.strokeStyle=b.strong?'#f1c65f':'#e8e6d1';ctx.lineWidth=b.strong?2:1;ctx.beginPath();ctx.arc(p.x,p.y,3+u*(b.strong?16:9),0,Math.PI*2);ctx.stroke();
    }else{
      ctx.globalAlpha=Math.sin(Math.min(1,u)*Math.PI);ctx.font='900 12px ui-monospace,monospace';ctx.textAlign='center';ctx.fillStyle=b.col;ctx.fillText(b.text,W/2,H*.18-u*7);
    }
  }
  ctx.restore();
  if(flashT>0){ctx.save();ctx.globalAlpha=clamp(flashT/.22,0,.16);ctx.fillStyle='#ffe1a3';ctx.fillRect(0,0,W,H);ctx.restore();}
  if(state.phase==='wave'&&state.hp/state.maxhp<.29){ctx.save();const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.28,W/2,H/2,Math.max(W,H)*.72);g.addColorStop(0,'#0000');g.addColorStop(1,'#8b161655');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();}
};

const oldUI515=updateUI;
updateUI=function(){oldUI515();ensureStyle();comboText();if(pendingMod&&state.phase==='shop')showMods();const h=document.querySelector('header strong');if(h){const x=ci();h.textContent=`JBD // 5.15 // ${x.theme} ${x.sub}/3`;}};

ensureStyle();updateUI();
window.__JBD515={get combo(){return combo},get pendingMod(){return pendingMod}};
})();
