// JBD v5.8.1 // STABLE MOBILE — upright infantry, lower UI noise, civilians + UN evacuation trucks
(() => {
'use strict';

const neutrals=[];
let neutralClock=5.5;
const V57=window.__JBD57||{};
const THEMES=['JUNGLE','POLAR','DESERT'];

Object.assign(DEF.rifle,{engage:64});
Object.assign(DEF.storm,{engage:54});
Object.assign(DEF.mg,{engage:78});
Object.assign(DEF.grenadier,{engage:68});
Object.assign(DEF.engineer,{engage:52});
Object.assign(DEF.motorcycle,{engage:54});
Object.assign(DEF.technical,{engage:70});
Object.assign(DEF.halftrack,{engage:77});
Object.assign(DEF.apc,{engage:74});
Object.assign(DEF.stug,{engage:84});
Object.assign(DEF.tank,{engage:82});

function currentTheme(){return THEMES[(Math.max(1,state.wave)-1)%3]}
function quietUI(){
  const tc=$('targetCard'); if(tc) tc.style.display='none';
  const tip=$('tip'); if(tip) tip.style.display='none';
  const th=$('threat57'); if(th) th.style.display='none';
  const uv=$('upgradeViz');
  if(uv){
    uv.style.width='92px';uv.style.padding='5px 6px';uv.style.left='6px';uv.style.bottom='117px';uv.style.fontSize='7px';uv.style.pointerEvents='none';
    const p=(n,cls='')=>Array.from({length:6},(_,i)=>`<span class="pip ${cls} ${i<n?'on':''}"></span>`).join('');
    uv.innerHTML=`<div style="display:flex;align-items:center;gap:4px"><span>▲</span><span class="pips">${p(Math.min(6,state.damageLvl))}</span></div><div style="display:flex;align-items:center;gap:4px;margin-top:3px"><span>❄</span><span class="pips">${p(Math.min(6,state.coolLvl),'cool')}</span></div>`;
  }
}
const _updateUI581=updateUI;
updateUI=function(){_updateUI581();quietUI();const h=document.querySelector('header strong');if(h)h.textContent=`JBD // 5.8.1 // ${currentTheme()} ${Math.max(1,state.wave)}`;};

function uprightSoldier(e,p,scale=1){
  const [body,gear]=soldierPalette(e),walk=e.walk||0,moving=e.mode==='move'||e.action==='sprint';
  const stride=moving?Math.sin(walk)*3.5:0,bob=moving?Math.abs(Math.sin(walk))*.45:0;
  const side=e.spriteSide||1,crouch=e.action==='duck'||e.action==='kneel'||e.stance==='crouch';
  ctx.save();ctx.translate(p.x,p.y-bob);ctx.scale(scale,scale);ellipse(0,7,5.2,1.8,'#0c120e55');
  if(e.swimming){const sw=Math.sin(walk)*5;ellipse(0,4,8.5,2,'#a9d0c244');circle(side*1.2,-2,2.2,C.skin,'#1b241e',.8);rr(-2.6,-5,5.2,2,1,gear,'#1b241e',.7);line(-1,0,-7-sw,3,1.5,body);line(1,0,7+sw,3,1.5,body);ctx.restore();return;}
  if(e.dugIn||e.inTrench){ellipse(0,5,8.5,3,'#2d3d2e');ellipse(0,5,6,2,'#594531');ctx.translate(0,1.5)}
  if(crouch){rr(-2.8,-4,5.6,7,2,body,'#1b241e',.8);circle(side*.8,-6.3,2.2,C.skin,'#1b241e',.8);line(-1,2,-4,7,1.7,body);line(1,2,4,7,1.7,body)}
  else{rr(-2.8,-6,5.6,8.5,2,body,'#1b241e',.8);circle(side*.8,-9,2.2,C.skin,'#1b241e',.8);line(-1,2,-3-stride,9,1.7,body);line(1,2,3+stride,9,1.7,body)}
  rr(-2.4,-11,4.8,1.8,1,gear,'#1b241e',.7);
  const gun=e.type==='mg'?11:9,recoil=e.action==='fire'?1.6:0;
  if(e.action==='reload'){line(-1,-2,2,1,1.5,body);line(1,-2,4,1,1.5,body);line(0,0,side*(gun-2),4,1.7,'#222923');rr(side*3,2,2,3,1,'#626b64')}
  else if(e.action==='signal'){line(-1,-2,-3,-9,1.6,body);line(-3,-9,-2,-13,1.3,C.skin);line(1,-2,side*4,0,1.6,body);line(side*1,-1,side*(gun-recoil),-1,1.8,'#222923')}
  else{line(-1,-2,side*3,-3,1.6,body);line(1,-2,side*4,0,1.6,body);line(side*1,-1,side*(gun-recoil),-1,1.8,'#222923')}
  ctx.restore();
}
drawSoldier=uprightSoldier;

drawEnemy=function(e){
  if(e.insideBuilding)return;const p=isoAS(e.a,e.s),mob=PORTRAIT?.62:1;
  if(e.fort){if(PORTRAIT){ctx.save();ctx.translate(p.x,p.y);ctx.scale(.60,.60);drawFieldBunker(e,{x:0,y:0});ctx.restore()}else drawFieldBunker(e,p)}
  else if(e.vehicle){const base=e.type==='motorcycle'?.76:e.type==='technical'?.83:e.type==='truck'||e.type==='engineertruck'?.92:e.type==='halftrack'||e.type==='apc'?.95:e.type==='stug'?1.04:e.type==='tank'?1.10:.84;if(inRiver(e.a,e.s)&&nearBridge(e.s))p.y+=Math.sin(e.age*11)*.7;drawVehicle(e,p,base*mob)}
  else uprightSoldier(e,p,.59*(PORTRAIT?.72:1));
  const f=clamp(e.hp/e.maxhp,0,1),w=(e.fort?30:e.heavy?28:e.vehicle?25:16)*(PORTRAIT?.72:1),y=p.y-(e.fort?24:e.heavy?26:e.vehicle?21:18)*(PORTRAIT?.72:1);
  rr(p.x-w/2,y,w,PORTRAIT?2.5:3.5,2,'#231c18aa');ctx.fillStyle=targetClass(e)==='personnel'?'#9abf75':targetClass(e)==='armor'?'#85b6c4':'#e6bc59';ctx.fillRect(p.x-w/2+1,y+1,(w-2)*f,PORTRAIT?1.2:2);
};

const _updateEnemy581=updateEnemy;
updateEnemy=function(e,dt){
  const x0=isoAS(e.a,e.s).x;_updateEnemy581(e,dt);const x1=isoAS(e.a,e.s).x;
  if(!e.vehicle&&!e.fort){if(Math.abs(x1-x0)>.02)e.spriteSide=x1>x0?1:-1;if(e.coverTarget&&e.coverTarget.kind==='flank'&&Math.hypot(e.a-e.coverTarget.a,e.s-e.coverTarget.s)<2.4){e.coverTarget=null;e.mode='fire';e.moveClock=rnd(.45,.9)}if(!e.inTrench&&!e.dugIn&&!e.insideBuilding&&!e.swimming&&e.a<22&&e.mode==='fire'&&Math.random()<dt*.95){e.mode='move';e.moveClock=rnd(.55,1.1)}if(e.action==='reload'&&e.mode==='move')e.mode='fire'}
};

drawShots=function(){for(const sh of state.shots){if(sh.t<0||sh.done)continue;const u=clamp(sh.t/sh.life,0,1),a=lerp(sh.a,sh.ta,u),s=lerp(sh.s,sh.ts,u),z=sh.arc?Math.sin(u*Math.PI)*55:0,p=isoAS(a,s,z);if(sh.enemy){const q=isoAS(sh.a,sh.s),r=isoAS(a,s);line(q.x,q.y,r.x,r.y,.7,'#e98c5e55');circle(p.x,p.y,1.0,'#ffc775')}else if(sh.type==='mg')circle(p.x,p.y,1.05,C.tracer,'#fff2ad',.45);else if(sh.type==='ap')circle(p.x,p.y,1.45,'#b7e0e7','#efffff',.55);else circle(p.x,p.y,2.2,'#d7bb61','#fff0a7',.7)}};

drawCrosshair=function(){const e=hoverTarget(),grade=e?counterGrade(selected,e):'none',col=grade==='good'?'#a7d87f':grade==='ok'?'#e7bd5b':grade==='bad'?'#dc6654':'#e9e1c4';ctx.save();ctx.translate(mouse.x,mouse.y);ctx.strokeStyle=col;ctx.lineWidth=1.15;ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.stroke();line(-15,0,-5,0,1.1,col);line(5,0,15,0,1.1,col);line(0,-15,0,-5,1.1,col);line(0,5,0,15,1.1,col);if(selected==='he'){ctx.globalAlpha=.24;ctx.beginPath();ctx.arc(0,0,weaponStats('he').splash*(PORTRAIT?1.85:ISOX),0,Math.PI*2);ctx.stroke()}ctx.restore();const c=$('targetCard');if(c)c.style.display='none';};

function neutralBridge(n){if(n.bridge!==undefined)return n.bridge;n.bridge=RIVER.bridges.slice().sort((a,b)=>Math.abs(n.s-a)-Math.abs(n.s-b))[0];return n.bridge}
function spawnCivilian(fromTruck=false,a=null,s=null){const side=Math.random()<.5?-1:1;neutrals.push({kind:'civilian',a:a??rnd(-75,10),s:s??side*rnd(20,44),ta:rnd(35,78),ts:-side*rnd(20,44),speed:rnd(fromTruck?6.6:5.2,fromTruck?8.5:7.0),alive:true,t:0,walk:Math.random()*6})}
function spawnUNTruck(){const side=Math.random()<.5?-1:1;neutrals.push({kind:'untruck',a:rnd(-96,-88),s:side*rnd(12,34),ta:84,ts:side*rnd(16,30),speed:rnd(6.6,8.0),alive:true,t:0,walk:0,carry:4+Math.floor(rnd(0,3)),bridge:undefined})}
function neutralPenalty(n,reason){if(!n.alive)return;n.alive=false;const fine=n.kind==='untruck'?65:35;state.supply=Math.max(0,state.supply-fine);state.chain=0;state.chainClock=0;$('msg').textContent=`${reason||'CIVILIAN HIT'} · -${fine} SUP`;uiSound();if(n.kind==='untruck'){for(let i=0;i<n.carry;i++)spawnCivilian(true,n.a+rnd(-2,2),n.s+rnd(-2,2));state.fx.push({kind:'explosion',a:n.a,s:n.s,t:0,life:.55,big:false})}}
function neutralHitT(a1,s1,a2,s2,n,rad){const A=isoAS(a1,s1),B=isoAS(a2,s2),P=isoAS(n.a,n.s),dx=B.x-A.x,dy=B.y-A.y,l2=dx*dx+dy*dy;if(l2<.001)return null;const t=clamp(((P.x-A.x)*dx+(P.y-A.y)*dy)/l2,0,1),qx=A.x+dx*t,qy=A.y+dy*t;return Math.hypot(P.x-qx,P.y-qy)<rad?t:null}
function updateNeutral(n,dt){n.t+=dt;if(!n.alive)return;n.walk+=dt*8;let targetA=n.ta,targetS=n.ts;if(n.kind==='untruck'){const b=neutralBridge(n),west=RIVER.a-RIVER.half-2.3,east=RIVER.a+RIVER.half+2.3;if(n.a<west){targetA=west;targetS=b}else if(n.a<east){targetA=east;targetS=b}}const da=targetA-n.a,ds=targetS-n.s,d=Math.max(.01,Math.hypot(da,ds));n.a+=da/d*n.speed*dt;n.s+=ds/d*n.speed*dt;if(n.kind==='civilian')for(const c of state.craters.slice(-5))if(Math.hypot(n.a-c.a,n.s-c.s)<7)n.s+=Math.sign(n.s-c.s||1)*n.speed*dt*1.3;if(n.a>82||d<1.5)n.alive=false}

const _startWave581=startWave;startWave=function(){neutrals.length=0;neutralClock=rnd(4.5,7.5);_startWave581();updateUI()};
const _update581=update;update=function(dt){_update581(dt);if(state.phase==='wave'){neutralClock-=dt;if(neutralClock<=0){Math.random()<.26?spawnUNTruck():spawnCivilian();neutralClock=rnd(9,16)}}for(const n of neutrals)updateNeutral(n,dt);for(let i=neutrals.length-1;i>=0;i--)if(!neutrals[i].alive&&neutrals[i].t>2.2)neutrals.splice(i,1)};

const _updateShot581=updateShot;updateShot=function(sh,dt){const wasDone=!!sh.done;_updateShot581(sh,dt);if(sh.enemy||wasDone)return;if(sh.type==='he'&&sh.done){for(const n of neutrals){if(n.alive&&Math.hypot(n.a-sh.ta,n.s-sh.ts)<(sh.splash||7)+(n.kind==='untruck'?3:2))neutralPenalty(n,n.kind==='untruck'?'UN EVAC TRUCK HIT':'CIVILIAN IN HE BLAST')}return}if(sh.t<0||sh.hitNeutral)return;const u=clamp(sh.t/sh.life,0,1),ca=sh.ca??lerp(sh.a,sh.ta,u),cs=sh.cs??lerp(sh.s,sh.ts,u);let best=null;for(const n of neutrals){if(!n.alive)continue;const t=neutralHitT(sh.a,sh.s,ca,cs,n,n.kind==='untruck'?7:4.2);if(t!==null&&(!best||t<best.t))best={n,t}}if(best){neutralPenalty(best.n,best.n.kind==='untruck'?'UN EVAC TRUCK HIT':'CIVILIAN HIT');sh.hitNeutral=true;sh.done=true}};

function drawNeutral(n){const p=isoAS(n.a,n.s),sc=PORTRAIT?.46:.66;ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);if(n.kind==='untruck'){ellipse(0,8,15,4,'#10201655');rr(-15,-8,25,14,2,'#f2f4ef','#35443d',1);poly([[10,-8],[16,-5],[16,5],[10,6]],'#dfe8e4','#35443d',1);rr(8,-4,5,7,1,'#a9c9d8','#35443d',.8);circle(-10,7,3,'#202622');circle(9,7,3,'#202622');ctx.fillStyle='#4d8fc8';ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('UN',-4,1);for(let i=0;i<Math.min(3,n.carry);i++)circle(-9+i*6,-3,1.4,C.skin,'#38463f',.5)}else{const ph=Math.sin(n.walk||0)*3;ellipse(0,8,5,1.8,'#10201655');rr(-2.5,-6,5,8.5,2,'#e4e1cf','#3a413b',.8);circle(0,-9,2.2,C.skin,'#3a413b',.7);line(-1,2,-3+ph,9,1.5,'#5e6a62');line(1,2,3-ph,9,1.5,'#5e6a62');line(-1,-2,-5,-1,1.2,C.skin);line(1,-2,5,-1,1.2,C.skin);circle(0,-11.5,1.8,'#7da8cb')}ctx.restore()}
const _draw581=draw;draw=function(){_draw581();ctx.save();for(const n of neutrals)if(n.alive)drawNeutral(n);ctx.restore()};

quietUI();resize();updateUI();
window.__JBD581={neutrals,spawnCivilian,spawnUNTruck};
})();