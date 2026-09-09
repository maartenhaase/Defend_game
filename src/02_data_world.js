const ENEMY={
 landingcraft:{hp:145,speed:2.30,engage:0,damage:0,reload:9,setup:0,vehicle:true,landing:true},

 rifle:{hp:42,speed:3.35,engage:64,damage:.68,reload:1.28,setup:.24},
 storm:{hp:48,speed:4.85,engage:41,damage:.32,reload:.28,setup:.10},
 mg:{hp:70,speed:2.90,engage:70,damage:.40,reload:.18,setup:1.18,burst:7,mountedMG:true},
 grenadier:{hp:58,speed:3.15,engage:69,damage:2.20,reload:2.15,setup:.52,grenade:true},
 sniper:{hp:34,speed:5.65,engage:102,damage:2.35,reload:3.30,setup:.54,sniper:true},
 paratrooper:{hp:44,speed:3.85,engage:62,damage:.62,reload:1.18,setup:.22,para:true},

 technical:{hp:90,speed:2.75,engage:63,damage:.30,reload:.18,setup:.15,burst:5,vehicle:true,mg:true,bailCrew:2},
 motorcycle:{hp:44,speed:6.60,engage:46,damage:.28,reload:.30,setup:.08,burst:2,vehicle:true,motorcycle:true,bailCrew:1},
 jeep:{hp:68,speed:3.20,engage:0,damage:0,reload:9,setup:0,vehicle:true,passengers:4,bailCrew:2},
 halftrack:{hp:160,speed:2.25,engage:68,damage:.42,reload:.20,setup:.28,burst:6,vehicle:true,mg:true,passengers:6,bailCrew:2},
 apc:{hp:235,speed:1.90,engage:67,damage:.54,reload:.22,setup:.32,burst:5,vehicle:true,mg:true,passengers:6,bailCrew:3},

 tank:{hp:370,speed:1.20,engage:76,damage:4.25,reload:2.05,setup:.38,vehicle:true,cannon:true,heavyArmor:true,bailCrew:5},
 stug:{hp:315,speed:.92,engage:80,damage:3.20,reload:2.75,setup:.62,vehicle:true,assaultGun:true,heavyArmor:true,bailCrew:4}
};



// Natural cover is spread wider over the landing sector.
const ROCKS=[];

const CRATERS=[
 {x:-66,y:12,r:1.8},{x:-48,y:-28,r:1.8},
 {x:-30,y:34,r:1.7},{x:-12,y:-10,r:1.8},
 {x:5,y:28,r:1.7}
];
const BEACH_OBSTACLE_SCREEN=[
 [.18,.18],[.20,.69],
 [.34,.37],[.39,.79],
 [.51,.53]
];
function beachObstacles(){
 return BEACH_OBSTACLE_SCREEN.map((a,i)=>{const p=uniso(W*a[0],H*a[1]);return{x:p.x,y:p.y,r:1.25,id:'o'+i,kind:'obstacle'}})
}



function resize(){
 const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=r.width*dpr;canvas.height=r.height*dpr;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;
 W=r.width;H=r.height;origin={x:W/2,y:H*.53};if(mouse.x===0&&mouse.y===0){mouse={x:W*.50,y:H*.45}}
}
addEventListener('resize',resize);resize();

function iso(x,y,z=0){return{x:origin.x+(x-y)*ISOX,y:origin.y+(x+y)*ISOY-z*ISOY}}
function uniso(sx,sy){const dx=(sx-origin.x)/ISOX,dy=(sy-origin.y)/ISOY;return{x:(dx+dy)/2,y:(dy-dx)/2}}
function bunkerPos(){
 // Exactly halfway between screen centre and the eastern edge.
 const axis=(W*.25)/ISOX;
 return{x:axis/2,y:-axis/2}
}
function axisOf(p){return p.x-p.y}
function sumOf(p){return p.x+p.y}
function bunkerAxis(){return axisOf(bunkerPos())}
function breachAxis(){return bunkerAxis()+(W*.060)/ISOX}
function defenseAxis(){return bunkerAxis()-(W*.115)/ISOX}

function breachTarget(e){
 const a=breachAxis();
 const s=clamp(e.targetSum??0,-H*.39/ISOY,H*.39/ISOY);
 return{x:(a+s)/2,y:(s-a)/2}
}

function trenchPositions(){
 const a=bunkerAxis()-(W*.055)/ISOX;
 const d=(H*.19)/ISOY;
 return[
  {x:(a-d)/2,y:(-d-a)/2,label:'N'},
  {x:(a+d)/2,y:( d-a)/2,label:'S'}
 ]
}
function trenchCost(){return state.trenchCrew>=5?Infinity:16+state.trenchCrew*10}
function resetTrenchesForWave(){
 for(const t of state.trenches){t.men=state.trenchCrew;t.overrun=false;t.fireClock=rnd(.25,.9)}
}
function trenchGunTier(){return Math.max(1,state.gunLvl-2)}
function trenchRange(){return GUNS[trenchGunTier()-1].range*.48}
function trenchAvoidFactor(e){
 if(e.type==='tank'||e.type==='apc'||e.type==='landingcraft')return .05;
 if(e.type==='halftrack')return .28;
 if(e.type==='technical'||e.type==='jeep')return .46;
 if(e.type==='storm')return .72;
 if(e.type==='rifle')return .86;
 return .58
}
function updateTrenches(dt){
 if(state.trenchCrew<=0)return;
 const pos=trenchPositions();

 for(let i=0;i<state.trenches.length;i++){
  const t=state.trenches[i];
  if(t.men<=0||t.overrun)continue;

  const p=pos[i];
  const over=state.enemies.find(e=>e.alive&&!e.landing&&dist(e,p)<3.9);
  if(over){
   t.men=0;t.overrun=true;
   const sp=iso(p.x,p.y);
   state.floaters.push({x:sp.x,y:sp.y,t:0,label:'OVERRUN'});
   sfx.trenchDown();
   continue
  }

  t.fireClock-=dt;
  if(t.fireClock>0)continue;

  const range=trenchRange();
  const candidates=state.enemies.filter(e=>
   e.alive&&e.type!=='landingcraft'&&dist(e,p)<=range&&!lineBlocked(p,e)
  );

  if(!candidates.length){
   t.fireClock=.38;
   continue
  }

  candidates.sort((a,b)=>axisOf(b)-axisOf(a));
  const target=candidates[0];
  const tier=trenchGunTier();

  // Intentionally weaker than the main bunker:
  // only two crewmen can fire per volley and their bullets are slow.
  const shots=Math.min(t.men,2);
  for(let k=0;k<shots;k++){
   const accuracy=.43+Math.min(.12,t.men*.018);
   const hit=Math.random()<accuracy;
   const tx=hit?target.x+rnd(-.20,.20):target.x+rnd(-2.0,2.0);
   const ty=hit?target.y+rnd(-.20,.20):target.y+rnd(-2.0,2.0);
   const d=dist(p,{x:tx,y:ty});

   state.shots.push({
    enemy:false,
    kind:'trenchBullet',
    x:p.x,y:p.y,
    tx,ty,
    curX:p.x,curY:p.y,
    prevX:p.x,prevY:p.y,
    t:-(k*.10),
    dur:.58+d/78*.52,
    damage:5.0+tier*1.35
   })
  }

  sfx.trench();
  t.fireClock=Math.max(1.22,3.15-t.men*.12+GUNS[tier-1].rate*.88)
 }
}

function updateTrenchBullet(s,dt){
 s.t+=dt;
 if(s.t<0)return;

 const u=clamp(s.t/s.dur,0,1);
 // Visible slower bullet, lightly decelerating toward the end.
 const p=1-Math.pow(1-u,1.28);
 const nx=s.x+(s.tx-s.x)*p;
 const ny=s.y+(s.ty-s.y)*p;
 const from={x:s.curX,y:s.curY},to={x:nx,y:ny};

 const rockHit=firstRockHit(from,to);
 if(rockHit){
  const ix=from.x+(to.x-from.x)*rockHit.t;
  const iy=from.y+(to.y-from.y)*rockHit.t;
  s.curX=ix;s.curY=iy;s.done=true;
  state.fx.push({x:ix,y:iy,t:0,r:.12,dust:true});
  return
 }

 let best=null;
 for(const e of state.enemies){
  if(!e.alive||e.type==='landingcraft'&&e.landing)return;
  const t=segmentCircleT(from,to,e,stanceHitRadius(e)+.16);
  if(t!==null&&(!best||t<best.t))best={e,t}
 }

 if(best){
  const ix=from.x+(to.x-from.x)*best.t;
  const iy=from.y+(to.y-from.y)*best.t;
  s.curX=ix;s.curY=iy;s.done=true;

  let dmg=s.damage*rnd(.82,1.05);
  if(isHeavyArmor(best.e))dmg=0;else if(isVehicle(best.e))dmg*=.14;
  best.e.hp-=dmg;

  const sp=iso(best.e.x,best.e.y);
  if(dmg<=0){
   state.floaters.push({x:sp.x,y:sp.y,t:0,label:'RICOCHET'});
   sfx.ricochet()
  }else{
   state.floaters.push({x:sp.x,y:sp.y,t:0,label:Math.max(1,Math.round(dmg))})
  }

  if(best.e.hp<=0){
   if(isVehicle(best.e)&&best.e.type!=='landingcraft')explodeVehicle(best.e);
   else{best.e.alive=false;state.waveKills++}
  }
  return
 }

 s.prevX=s.curX;s.prevY=s.curY;
 s.curX=nx;s.curY=ny;

 if(u>=1){
  s.done=true;
  state.fx.push({x:nx,y:ny,t:0,r:.10,dust:true})
 }
}
function breachDamage(e){
 if(isInfantry(e))return 8;
 if(e.type==='motorcycle')return 7;
 if(e.type==='technical'||e.type==='jeep')return 11;
 if(e.type==='halftrack')return 14;
 if(e.type==='apc')return 18;
 if(e.type==='stug')return 23;
 if(e.type==='tank')return 26;
 return 10
}
function breachEnemy(e){
 if(!e.alive)return;
 const p=iso(e.x,e.y);
 state.floaters.push({x:p.x,y:p.y,t:0,label:'BREACH'});
 damageBunker(breachDamage(e));
 e.alive=false
}

function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function rnd(a,b){return a+Math.random()*(b-a)}
function line(a,b,w=1){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
function text(t,x,y,size=8){ctx.font=`${size}px ui-monospace,monospace`;ctx.textAlign='center';ctx.fillStyle=PAL.ink;ctx.fillText(t,x,y)}
function isInfantry(e){return ['rifle','storm','mg','grenadier','sniper','paratrooper'].includes(e.type)}
function isVehicle(e){return ['landingcraft','technical','motorcycle','jeep','halftrack','apc','tank','stug'].includes(e.type)}
function isHeavyArmor(e){return e.type==='tank'||e.type==='stug'}
function inSmoke(e){return state.smoke.some(s=>dist(e,s)<s.radius*.78)}
function visible(e){return !inSmoke(e)}

function gunStats(){
 const g=GUNS[state.gunLvl-1];
 return{
  ...g,
  damage:g.damage*(1+(state.dmgLvl-1)*.14),
  interval:Math.max(.10,g.rate*Math.pow(.88,state.rofLvl-1)),
  heatCap:100+(state.heatLvl-1)*25,
  cooling:21+(state.heatLvl-1)*4.8
 }
}
// Player fire has no hard maximum range.
function enemyMaxRange(){
 // More battlefield fire from the start, but damage per hit is now much lower.
 return 72 + Math.min(12,Math.max(0,state.wave-1)*1.0)
}

function segmentCircleT(a,b,c,r){
 const dx=b.x-a.x,dy=b.y-a.y,fx=a.x-c.x,fy=a.y-c.y;
 const A=dx*dx+dy*dy,B=2*(fx*dx+fy*dy),C=fx*fx+fy*fy-r*r;
 let disc=B*B-4*A*C;
 if(disc<0)return null;
 disc=Math.sqrt(disc);
 const t1=(-B-disc)/(2*A),t2=(-B+disc)/(2*A);
 if(t1>=0&&t1<=1)return t1;
 if(t2>=0&&t2<=1)return t2;
 return null
}
function firstRockHit(a,b){return null}

function firstObstacleHit(a,b,ignored=[]){
 let best=null;
 for(const o of beachObstacles()){
  if(ignored.includes(o.id))continue;
  const t=segmentCircleT(a,b,o,o.r*1.05);
  if(t!==null&&(!best||t<best.t))best={obstacle:o,t}
 }
 return best
}

// Beach obstacles are cover, not perfect walls.
function lineBlocked(a,b){return false}

function craterAt(e){return CRATERS.find(c=>dist(e,c)<c.r*.72)||null}

function stanceHitRadius(e){
 if(!isInfantry(e))return isHeavyArmor(e)?1.72:1.40;
 if(e.stance==='prone')return .52;
 if(e.stance==='crouch')return .70;
 return .96
}
function suppress(e,amount){
 if(!isInfantry(e)||e.coverClock>0)return;
 e.suppression=Math.min(100,(e.suppression||0)+amount);
 e.suppressionHold=Math.max(e.suppressionHold||0,1.8);
 if(e.suppression>=55)e.stance='prone';
 else if(e.suppression>=18)e.stance='crouch'
}

// simple avoidance steering around rocks
function coverNodes(){
 const nodes=[];
 for(let i=0;i<CRATERS.length;i++){
  const c=CRATERS[i];
  nodes.push({x:c.x,y:c.y,id:'c'+i,kind:'crater'})
 }
 for(const o of beachObstacles())nodes.push(o);
 return nodes
}

function maybeChooseCover(e){
 if(!isInfantry(e)||e.coverTarget||e.coverPause>0)return;
 const chance=
  e.type==='sniper'?1.0:
  e.type==='storm'?.30:
  e.type==='rifle'?.68:
  e.type==='mg'?.88:
  e.type==='grenadier'?.78:
  e.type==='paratrooper'?.60:.65;

 const rollScale=e.type==='sniper'?.16:.045;
 if(Math.random()>chance*rollScale)return;

 const ea=axisOf(e),maxA=bunkerAxis()-7;
 const maxDist=e.type==='sniper'?34:27;
 const options=coverNodes().filter(n=>{
  const a=axisOf(n),d=dist(e,n);
  return a>ea+1.6&&a<maxA&&d>2.6&&d<maxDist&&!e.visitedCover.includes(n.id)
 });
 if(!options.length)return;

 if(e.type==='sniper'){
  // Sniper strongly prefers the next useful cover node, not the direct route.
  options.sort((a,b)=>Math.abs(dist(e,a)-15)-Math.abs(dist(e,b)-15)+rnd(-1.5,1.5))
 }else{
  options.sort((a,b)=>dist(e,a)-dist(e,b)+rnd(-3,3))
 }
 e.coverTarget=options[0]
}
function trenchSteering(e,vx,vy){
 if(!isInfantry(e)&&!['jeep','technical','halftrack'].includes(e.type))return[vx,vy];
 const pos=trenchPositions(),factor=trenchAvoidFactor(e);
 for(let i=0;i<2;i++){
  const t=state.trenches[i];if(t.men<=0||t.overrun)continue;
  const p=pos[i],dx=e.x-p.x,dy=e.y-p.y,d=Math.max(.01,Math.hypot(dx,dy));
  const radius=7+t.men*2.3;
  if(d<radius){
   const f=(radius-d)/radius*factor;
   vx+=dx/d*f*2.4;vy+=dy/d*f*2.4;
   const side=(sumOf(e)<sumOf(p)?-1:1);vx+=(-dy/d)*side*f*1.5;vy+=(dx/d)*side*f*1.5
  }
 }
 return[vx,vy]
}
function movingArmorCover(e){
 if(!isInfantry(e)||e.type==='sniper')return null;
 const ea=axisOf(e),es=sumOf(e);
 const candidates=state.enemies.filter(v=>{
  if(!v.alive||!isVehicle(v)||v.type==='landingcraft'||v.type==='motorcycle')return false;
  const va=axisOf(v),vs=sumOf(v);
  return va>ea-2.0&&va<ea+36&&Math.abs(vs-es)<24
 });
 if(!candidates.length)return null;
 candidates.sort((a,b)=>{
  const bonus=v=>v.type==='technical'?-15:isHeavyArmor(v)?-7:v.type==='halftrack'?-4:0;
  const score=v=>(axisOf(v)-ea)+Math.abs(sumOf(v)-es)*.22+bonus(v);
  return score(a)-score(b)
 });
 const v=candidates[0],va=axisOf(v),vs=sumOf(v);
 const back=v.type==='technical'?5.8:isHeavyArmor(v)?6.8:5.2;
 const side=v.type==='technical'?3.8:isHeavyArmor(v)?5.4:4.4;
 const followAxis=va-back;
 const followSum=vs+(e.avoidSide||1)*side+clamp(es-vs,-2.6,2.6);
 return{vehicle:v,x:(followAxis+followSum)/2,y:(followSum-followAxis)/2}
}

function moveUnit(e,dt){
 maybeChooseCover(e);

 const armorCover=movingArmorCover(e);
 let target=armorCover||e.coverTarget||breachTarget(e);

 let tx=target.x-e.x,ty=target.y-e.y,r=Math.max(.001,Math.hypot(tx,ty));
 let vx=tx/r,vy=ty/r;
 e.moving=true;
 e.walkPhase=(e.walkPhase||0)+dt*(5.0+e.speed*1.7);

 if(e.coverTarget&&target===e.coverTarget&&r<1.20){
  const kind=e.coverTarget.kind;
  e.visitedCover.push(e.coverTarget.id);
  e.coverTarget=null;

  if(kind==='crater'){
   // Infantry actually sits in shell holes for a while.
   e.coverPause=e.type==='sniper'?rnd(1.1,1.8):rnd(1.6,3.1);
   e.stance='crouch'
  }else{
   e.coverPause=e.type==='sniper'?rnd(.20,.45):rnd(.55,1.10);
   e.stance='crouch'
  }
  return
 }

 // Vehicles do not drive through shell holes.
 if(isVehicle(e)){
  for(const c of CRATERS){
   const dx=e.x-c.x,dy=e.y-c.y,d=Math.hypot(dx,dy),influence=c.r+3.0;
   if(d<influence){
    const rep=(influence-d)/influence;
    const side=e.avoidSide||1;
    vx+=dx/Math.max(d,.01)*rep*2.3;
    vy+=dy/Math.max(d,.01)*rep*2.3;
    vx+=(-dy/Math.max(d,.01))*side*rep*1.25;
    vy+=( dx/Math.max(d,.01))*side*rep*1.25
   }
  }
 }

 // Every vehicle is a physical moving obstacle for infantry.
 if(isInfantry(e)){
  for(const v of state.enemies){
   if(!v.alive||!isVehicle(v)||v.type==='landingcraft')continue;
   const dx=e.x-v.x,dy=e.y-v.y,d=Math.hypot(dx,dy);
   const influence=isHeavyArmor(v)?4.2:3.35;
   if(d<influence){
    const rep=(influence-d)/influence;
    const side=e.avoidSide||1;
    vx+=dx/Math.max(d,.01)*rep*2.5;
    vy+=dy/Math.max(d,.01)*rep*2.5;
    vx+=(-dy/Math.max(d,.01))*side*rep*.70;
    vy+=( dx/Math.max(d,.01))*side*rep*.70
   }
  }
 }

 [vx,vy]=trenchSteering(e,vx,vy);
 const n=Math.max(.001,Math.hypot(vx,vy));vx/=n;vy/=n;
 const stanceMult=e.stance==='prone'?.38:e.stance==='crouch'?.72:1;

 let speedMult=(e.action==='sprint'&&e.actionT>0)?1.28:1;
 if(armorCover){
  const v=armorCover.vehicle;
  speedMult*=Math.min(1.16,Math.max(.58,(v.speed*1.28)/Math.max(.01,e.speed)))
 }

 e.x+=vx*e.speed*stanceMult*speedMult*dt;
 e.y+=vy*e.speed*stanceMult*speedMult*dt
}

function landingManifest(n,craftIndex,count){
 const out=[];
 for(let i=0;i<count;i++){
  let type='rifle';
  const roll=(i+craftIndex+n)%13;
  if(n>=2&&roll===0)type='storm';
  if(n>=3&&roll===4)type='mg';
  if(n>=4&&roll===7)type='grenadier';
  if(n>=5&&roll===10)type='sniper';
  out.push(type)
 }
 return out
}
