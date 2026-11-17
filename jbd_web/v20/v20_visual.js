/* BUNKER DEFENSE 2.0 — OPTIONAL LAYERED VISUAL POLISH
   Not a replacement for the V10.8 art, animations or effects.
   Loaded inside the original game's IIFE. */
var V20_CONFIG={
 high:{lights:36,particles:135,dust:1,haze:.9},
 normal:{lights:20,particles:80,dust:.55,haze:.55},
 performance:{lights:8,particles:32,dust:.12,haze:0}
};
var v20Settings={quality:'normal',fx:85,ambient:35,music:0};
var v20Lights=[],v20Particles=[],v20LastVehicle=new WeakMap();
var v20SettingsOpen=false,v20SettingsPanel=null;
function v20Campaign(){return !!(gameState&&v103Campaign());}
function v20Quality(){return V20_CONFIG[v20Settings.quality]||V20_CONFIG.normal;}
function v20AddLight(x,y,r,kind){
 if(!v20Campaign()||!Number.isFinite(x)||!Number.isFinite(y))return;
 if(v20Lights.length>=v20Quality().lights)v20Lights.shift();
 var t=kind==='blast'?.55:kind==='flak'?.33:kind==='hit'?.13:.085;
 v20Lights.push({x:x,y:y,r:Math.max(7,r||12),kind:kind||'muzzle',life:t,total:t});
}
function v20AddParticle(x,y,kind,vx,vy,life){
 if(!Number.isFinite(x)||!Number.isFinite(y)||v20Particles.length>=v20Quality().particles)return;
 v20Particles.push({x:x,y:y,px:x,py:y,kind:kind||'spark',vx:vx||0,vy:vy||0,life:life||.4,total:life||.4,seed:Math.random()});
}
function v20Blast(x,y,scale,kind){
 if(!v20Campaign()||!Number.isFinite(x)||!Number.isFinite(y))return;
 scale=Math.max(.5,Math.min(2.3,scale||1));
 v20AddLight(x,y,43*scale,kind||'blast');
 var amount=Math.round((v20Settings.quality==='high'?24:14)*scale);
 for(var i=0;i<amount;i++){
  var a=i*6.283/amount+Math.random()*.32,s=(45+Math.random()*118)*scale;
  v20AddParticle(x,y,i%4===0?'ember':i%4===1?'dust':'spark',
   Math.cos(a)*s,Math.sin(a)*s-55,.30+Math.random()*.58);
 }
}
function v20VisualTick(dt){
 var i,p,wind=Math.sin((gameState&&gameState.time||0)*.045)*8;
 dt=Math.max(0,Math.min(.05,dt));
 for(i=v20Lights.length-1;i>=0;i--){
  v20Lights[i].life-=dt;if(v20Lights[i].life<=0)v20Lights.splice(i,1);
 }
 for(i=v20Particles.length-1;i>=0;i--){
  p=v20Particles[i];p.life-=dt;
  if(p.life<=0){v20Particles.splice(i,1);continue;}
  p.px=p.x;p.py=p.y;
  p.vy+=(p.kind==='dust'?-16:p.kind==='ember'?77:260)*dt;
  if(p.kind==='dust')p.vx+=wind*dt;
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  var floor=H-safeBottom-25;
  if(p.y>=floor&&p.kind!=='dust'){
   p.y=floor;p.vy=-Math.abs(p.vy)*.22;p.vx*=.45;
   if(Math.abs(p.vy)<18)p.life=0;
  }
 }
}
function v20MovingDust(dt){
 if(!v20Campaign()||gameState.mode!=='playing')return;
 var k=v20Quality();
 if(k.dust<=0)return;
 (gameState.vehicles||[]).forEach(function(v){
  if(!v||!v.alive)return;
  var before=v20LastVehicle.get(v);
  v20LastVehicle.set(v,{x:v.x,y:v.y});
  if(!before)return;
  var dx=v.x-before.x,dy=v.y-before.y;
  if(Math.hypot(dx,dy)/Math.max(dt,.015)<13||Math.random()>dt*6*k.dust)return;
  v20AddParticle(v.x+(Math.random()-.5)*8,v.y+10,'dust',
   -dx/Math.max(dt,.015)*.25+(Math.random()-.5)*15,-20-Math.random()*20,.5+Math.random()*.45);
 });
}
function v20DrawEffects(){
 if(!v20Campaign()||gameState.mode!=='playing')return;
 var i,p,alpha;
 ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
 // Crisp pixel-size fragments, additive only to existing effects.
 for(i=0;i<v20Particles.length;i++){
  p=v20Particles[i];alpha=Math.max(0,p.life/p.total);
  ctx.globalAlpha=alpha*(p.kind==='dust'?.28:.94);
  if(p.kind==='dust'){
   ctx.fillStyle=p.seed>.45?'#a99b7d':'#756f61';
   ctx.fillRect(Math.round(p.x),Math.round(p.y),3,2);
   ctx.fillStyle='#c7b392';ctx.fillRect(Math.round(p.x-2),Math.round(p.y+1),1,1);
  }else if(p.kind==='ember'){
   ctx.fillStyle=alpha>.45?'#ffc253':'#ae5428';
   ctx.fillRect(Math.round(p.x),Math.round(p.y),2,2);
   ctx.fillStyle='#fff0bd';ctx.fillRect(Math.round(p.x),Math.round(p.y),1,1);
  }else{
   ctx.fillStyle=p.seed>.5?'#ffdc9e':'#f59a4b';
   ctx.fillRect(Math.round(p.x),Math.round(p.y),p.seed>.8?2:1,2);
   ctx.globalAlpha*=.35;ctx.fillStyle='#b36837';
   ctx.fillRect(Math.round(p.px),Math.round(p.py),1,1);
  }
 }
 ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';
 for(i=0;i<v20Lights.length;i++){
  var f=v20Lights[i],fade=Math.max(0,f.life/f.total);
  var rad=f.r*(.62+.55*(1-fade));
  if(rad<1)continue;
  var gradient=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,rad);
  gradient.addColorStop(0,'rgba(255,237,174,'+(fade*.33)+')');
  gradient.addColorStop(.28,'rgba(255,161,55,'+(fade*.18)+')');
  gradient.addColorStop(1,'rgba(233,100,20,0)');
  ctx.fillStyle=gradient;ctx.fillRect(f.x-rad,f.y-rad,rad*2,rad*2);
 }
 ctx.restore();
}
function v20DrawHaze(){
 if(!v20Campaign()||gameState.mode!=='playing'||v20Quality().haze<=0)return;
 // Extremely subtle localized atmospheric perspective. Terrain and
 // actors remain untouched and not covered by a blur or global filter.
 ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
 var top=safeTop+H*.22,ht=H*.26,gradient=ctx.createLinearGradient(0,top,0,top+ht);
 gradient.addColorStop(0,'rgba(182,173,146,0)');
 gradient.addColorStop(.5,'rgba(186,169,146,'+(v20Quality().haze*.017)+')');
 gradient.addColorStop(1,'rgba(182,173,146,0)');
 ctx.fillStyle=gradient;ctx.fillRect(0,top,W,ht);ctx.restore();
}
var v20DrawOld=render;
render=function(){
 var result=v20DrawOld.apply(this,arguments);
 v20DrawHaze();v20DrawEffects();return result;
};
// Retain ALL original sprite atlas data and animations; add only an
// unobtrusive underfoot/underbody grounding shadow.
var v20SoldierOld=drawSoldier;
drawSoldier=function(e){
 if(v20Campaign()&&e&&e.alive&&Number.isFinite(e.x)&&Number.isFinite(e.y)){
  ctx.save();ctx.globalAlpha=.15;ctx.fillStyle='#182016';ctx.beginPath();
  ctx.ellipse(e.x,e.y+3,e.wounded?11:7,e.wounded?3.3:2.3,0,0,6.283);
  ctx.fill();ctx.restore();
 }
 return v20SoldierOld.apply(this,arguments);
};
var v20VehicleOld=drawVehicle;
drawVehicle=function(v,wreck){
 if(v20Campaign()&&v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&!wreck){
  ctx.save();ctx.globalAlpha=.19;ctx.fillStyle='#151a11';ctx.beginPath();
  ctx.ellipse(v.x,v.y+9,v.type==='halftrack'?25:19,5,0,0,6.283);
  ctx.fill();ctx.restore();
 }
 return v20VehicleOld.apply(this,arguments);
};
var v20MGShotOld=fireWeapon;
fireWeapon=function(kind,x,y){
 var out=v20MGShotOld.apply(this,arguments);
 if(out&&v20Campaign()&&gameState.mode==='playing'&&(kind==='mg'||kind==='primary')){
  var b=gameState.bunker;
  if(b){v20AddLight(b.x,b.y-20,18,'muzzle');
   if(Math.random()<.32)v20AddParticle(b.x+4,b.y-18,'ember',40,-60,.23);}
 }
 return out;
};
var v20FlakBlastOld=explodeFlak9950;
explodeFlak9950=function(x,y,shell){
 var out=v20FlakBlastOld.apply(this,arguments);
 if(v20Campaign())v20Blast(x,y,Math.max(.6,(shell&&shell.radius||25)/25),'flak');
 return out;
};
var v20ImpactOld=emitGroundImpact;
emitGroundImpact=function(x,y,amount,material){
 var out=v20ImpactOld.apply(this,arguments);
 if(v20Campaign()&&amount>.8&&Number.isFinite(x)&&Number.isFinite(y)){
  if(material==='metal'||material==='vehicle')v20AddLight(x,y,15,'hit');
  for(var i=0;i<Math.min(5,Math.ceil(amount*3));i++)
   v20AddParticle(x,y,material==='wood'||material==='earth'?'dust':'spark',
    (Math.random()-.5)*88,-40-Math.random()*45,.22+Math.random()*.28);
 }
 return out;
};
var v20BurnOld=finishVehicleBurnout9941;
finishVehicleBurnout9941=function(v){
 var alive=!!(v&&v.alive),x=v&&v.x,y=v&&v.y;
 var out=v20BurnOld.apply(this,arguments);
 if(v20Campaign()&&alive&&v&&!v.alive)v20Blast(x,y,1.6,'blast');
 return out;
};
var v20VehicleHitOld=primaryVehicleHit;
primaryVehicleHit=function(v,b){
 var hp=v&&v.hp,out=v20VehicleHitOld.apply(this,arguments);
 if(v20Campaign()&&v&&b&&v.hp<hp&&Math.random()<.40)
  v20AddLight(Number(b.x)||v.x,Number(b.y)||v.y,11,'hit');
 return out;
};
var v20TickOld=update;
update=function(dt){
 if(v20SettingsOpen&&v20Campaign()&&gameState.mode==='playing')return;
 var out=v20TickOld.apply(this,arguments);
 if(v20Campaign()&&gameState.mode==='playing'){
  v20VisualTick(dt);v20MovingDust(dt);
  if(typeof v20AmbientUpdate==='function')v20AmbientUpdate(dt);
 }
 return out;
};
var v20ResetOld=resetLevel;
resetLevel=function(){
 v20Lights.length=0;v20Particles.length=0;v20LastVehicle=new WeakMap();
 return v20ResetOld.apply(this,arguments);
};