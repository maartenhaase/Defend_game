/* BUNKER DEFENSE 2.2 — FAST ARCADE OVERHAUL
   Additive patch inside the ORIGINAL 2.1 engine IIFE.
   Original sprites, medics, damage atlases, recordings and all previous releases survive. */
function v22Active(){return typeof v21Active==='function'&&v21Active();}
var v22Run={score:0,streak:0,bestStreak:0,perfect:false,carry:false,hot:0,kills:0,flashes:[],lastWave:0};
function v22Award(points,x,y){
 if(!v22Active()||!gameState||gameState.mode!=='playing')return;
 var r=v22Run;
 r.streak++;r.kills++;r.bestStreak=Math.max(r.bestStreak,r.streak);
 var mult=Math.min(3,1+Math.floor(r.streak/4));
 r.score+=points*mult;
 if(r.flashes.length>=9)r.flashes.shift();
 r.flashes.push({x:Number.isFinite(x)?x:W*.5,y:Number.isFinite(y)?y:H*.43,t:.6,text:'+'+(points*mult)});
 if(mult>1&&r.streak%4===0)gameState.shake=Math.max(gameState.shake||0,.7);
}
var v22KillOld=killInfantry;
killInfantry=function(e,kind){
 var eligible=v22Active()&&e&&e.alive&&!e.allied&&!e.v102Unarmed;
 var out=v22KillOld.apply(this,arguments);
 if(eligible&&!e.alive)v22Award(100,e.x,e.y);
 return out;
};
var v22NeutralizeOld=neutralizeVehicle;
neutralizeVehicle=function(v){
 var eligible=v22Active()&&v&&v.alive&&!v.allied&&!v.v22Scored;
 var out=v22NeutralizeOld.apply(this,arguments);
 if(eligible&&!v.alive){v.v22Scored=true;v22Award(350,v.x,v.y);}
 return out;
};
var v22BunkerDamageOld=damageBunker;
damageBunker=function(dmg){
 var g=gameState,h=g&&g.bunker?g.bunker.hp:0;
 var out=v22BunkerDamageOld.apply(this,arguments);
 if(v22Active()&&g&&g.bunker&&g.bunker.hp<h-.01){
  v22Run.streak=0;v22Run.perfect=false;
 }
 return out;
};
// 30 authored maps and their sprites remain; re-time each encounter as
// compact, readable bursts rather than 100+ second missions.
var v22PlanOld=buildEncounterPlan;
buildEncounterPlan=function(){
 var ev=v22PlanOld.apply(this,arguments);
 if(!v22Active()||!Array.isArray(ev))return ev;
 var idx=gameState.levelIndex;
 ev.forEach(function(e){
  e.t=Math.max(1.4,Math.min(36,1.5+(Math.max(0,e.t||0))*.70));
  if(e.type==='foot'&&e.count>2){
   e.count=Math.max(2,Math.round(e.count*(idx<5?.78:.68)));
  }
 });
 ev.sort(function(a,b){return a.t-b.t;});
 if(gameState.shortBattle)gameState.shortBattle.maxDuration=76;
 return ev;
};
// Reduce 2.1's intentionally huge hull HP to an arcade-readable time-to-kill.
// Nine visual damage states and all original vehicle sprites are preserved.
var v22VehicleOld=spawnVehicle;
spawnVehicle=function(){
 var before=gameState&&gameState.vehicles?gameState.vehicles.length:0;
 var out=v22VehicleOld.apply(this,arguments);
 if(!v22Active())return out;
 for(var i=before;i<gameState.vehicles.length;i++){
  var v=gameState.vehicles[i];if(!v||v.allied)continue;
  var scale=v.v102Tutorial?.70:.53;
  v.hp=Math.max(v.v102Tutorial?42:45,v.hp*scale);
  v.maxHp=v.hp;
  if(v.armorHp>0){v.armorHp*=.72;v.maxArmorHp=v.armorHp;}
  v.v21BaseHp=v.maxHp;
 }
 return out;
};
// Maintain a readable ramp, with extra intensity on every 5th wave.
var v22ProgressOld=enemyProgression;
enemyProgression=function(idx){
 var p=v22ProgressOld.apply(this,arguments);
 if(v22Active()){
  var ramp=Math.min(1,Math.max(0,idx)/22);
  p.infantryDamage*=1+.05+.11*ramp;
  p.vehicleDamage*=1+.04+.09*ramp;
  p.cooldown*=1-.08*ramp;
  if(idx%5===4){p.infantryDamage*=1.10;p.vehicleDamage*=1.10;}
 }
 return p;
};
// Unlike 2.1, light-machine-gun fire can finish a damaged vehicle.
// FLAK remains the fastest way to destroy armor.
var v22DamageVehicleOld=damageVehicle;
damageVehicle=function(v,dmg,kind){
 if(!v22Active())return v22DamageVehicleOld.apply(this,arguments);
 if(kind==='mg'||kind==='he'||kind==='flak'){
  var scaled=dmg*(kind==='mg'?1.20:1.55)*(v22Run.hot>0?1.50:1);
  return v21DamageOld.call(this,v,scaled,kind);
 }
 return v22DamageVehicleOld.apply(this,arguments);
};
var v22DamageInfantryOld=damageInfantry;
damageInfantry=function(e,dmg,kind){
 if(v22Active()&&kind==='mg'&&v22Run.hot>0)dmg*=1.55;
 return v22DamageInfantryOld.call(this,e,dmg,kind);
};
// A supply crate should tempt the player to divert their aim,
// not consume 20-30 bullets while enemies attack.
var v22CrateOld=v106SpawnRewardCrate;
v106SpawnRewardCrate=function(){
 var c=v22CrateOld.apply(this,arguments);
 if(v22Active()&&c){
  c.hp=c.maxHp=35+7*Math.min(2,Math.floor(gameState.levelIndex/12));
  c.v21Hits=Math.round(c.maxHp/7);
 }
 return c;
};
// Only useful, immediately intelligible rewards. No upgrade selection UI.
var v22RollOld=v106RollReward;
v106RollReward=function(){
 if(!v22Active())return v22RollOld.apply(this,arguments);
 var r=Math.random(),id=r<.32&&gameState.bunker.hp<gameState.bunker.maxHp*.94?'repair':
  r<.58?'magazine':r<.83?'mgReload':'v22Hot';
 return id==='v22Hot'?{id:id,label:'POWER SHOTS · 10 SEC',instant:true}:
   V106_REWARDS.find(function(x){return x.id===id;});
};
var v22GrantOld=v106GrantReward;
v106GrantReward=function(){
 var out=v22GrantOld.apply(this,arguments);
 if(v22Active()&&out&&out.id==='v22Hot')v22Run.hot=10;
 return out;
};
// ONE risky drop per wave. Explicit Infinity sentinels prevent the
// legacy three-crate scheduler from delivering unwanted extra drops.
var v22ResetOld=resetLevel;
resetLevel=function(){
 var out=v22ResetOld.apply(this,arguments);
 if(!v22Active())return out;
 var g=gameState,r=v22Run,idx=g.levelIndex;
 if(idx===0){r.score=0;r.kills=0;r.bestStreak=0;r.carry=false;}
 r.streak=0;r.perfect=true;r.hot=0;r.flashes.length=0;r.lastWave=idx+1;
 g.v106Target=1;
 g.v106Schedule=[5.5+Math.random()*4.0,Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY];
 g.v106QuickDrop=-100000000;
 g.v21Quick=0;
 g.v22WaveStarted=g.levelTime||0;
 g.v22AdvanceQueued=false;
 g.v22WaveAwarded=false;
 g.profile.primaryMag=Math.max(12,g.profile.primaryMag);
 g.primaryAmmo=Math.max(12,g.primaryAmmo);
 g.profile.primaryReload=Math.max(.58,g.profile.primaryReload*.78);
 g.profile.primaryCycle*=.92;
 g.profile.primaryBurstPause*=.90;
 if(r.carry){
  g.profile.primaryReload=Math.max(.5,g.profile.primaryReload*.86);
  r.carry=false;
 }
 g.message='WAVE '+(idx+1)+' · HOUD DE BUNKER HEEL';
 g.messageT=.85;
 return out;
};
// The mandatory five-second wreck wait becomes a sub-second payoff.
var v22AftermathOld=v102StartAftermath;
v102StartAftermath=function(){
 var out=v22AftermathOld.apply(this,arguments);
 if(v22Active()&&gameState.v102VictoryHold){
  gameState.v102VictoryHold.elapsed=4.20;
  gameState.message='WAVE CLEARED!';
  gameState.messageT=.8;
 }
 return out;
};
// Bypass V2.1's requirement to finish its old 3-6 crate schedule.
// Victory still requires every planned enemy to be neutralized.
var v22ReadyOld=v102ReadyToCelebrate;
v102ReadyToCelebrate=function(){
 if(v22Active())return v106VictoryOld.apply(this,arguments);
 return v22ReadyOld.apply(this,arguments);
};
function v22BestSave(){
 try{
  var old=Number(localStorage.getItem('jbd22_best')||0);
  if(v22Run.score>old)localStorage.setItem('jbd22_best',String(v22Run.score));
 }catch(_){}
}
var v22CompleteOld=completeLevel;
completeLevel=function(){
 var g=gameState,wasPlaying=v22Active()&&g&&g.mode==='playing';
 var idx=wasPlaying?g.levelIndex:-1;
 var out=v22CompleteOld.apply(this,arguments);
 if(wasPlaying&&g.mode==='shop'&&!g.v22WaveAwarded){
  g.v22WaveAwarded=true;
  if(v22Run.perfect){v22Run.score+=300;v22Run.carry=true;}
  v22BestSave();
  if(idx<29){
   // Real click uses the existing, proven next-map control and its save path.
   g.v22AdvanceQueued=true;
   if(typeof setTimeout==='function')setTimeout(function(){
    if(gameState===g&&g.mode==='shop'&&g.levelIndex===idx){
     deployBtn.disabled=false;
     if(typeof deployBtn.click==='function')deployBtn.click();
    }
   },850);
  }
 }
 return out;
};
var v22UpdateOld=update;
update=function(dt){
 var g=gameState;
 if(v22Active()&&g){
  // V10.6's old rapid-3-crate fallback is permanently disabled.
  g.v106QuickDrop=-100000000;
 }
 var out=v22UpdateOld.apply(this,arguments);
 g=gameState;
 if(!v22Active()||!g)return out;
 if(g.mode==='playing'){
  v22Run.hot=Math.max(0,v22Run.hot-dt);
  for(var i=v22Run.flashes.length-1;i>=0;i--){
   v22Run.flashes[i].t-=dt;
   if(v22Run.flashes[i].t<=0)v22Run.flashes.splice(i,1);
  }
  // Only clear actors that have escaped well beyond every playable edge.
  // This repairs the old never-ending wave when a retreating NPC is lost.
  if(g.levelTime>48&&g.eventCursor>=g.events.length){
   (g.infantry||[]).forEach(function(e){
    if(e.alive&&(e.x< -90||e.x>W+90||e.y<safeTop-150||e.y>H+90))e.alive=false;
   });
   (g.vehicles||[]).forEach(function(v){
    if(v.alive&&!v.allied&&(v.x< -200||v.x>W+200||v.y< -200||v.y>H+200))v.alive=false;
   });
  }
 }
 if(g.mode==='gameover'){
  v22BestSave();
  if(titleEl)titleEl.textContent='BUNKER VERLOREN · WAVE '+(g.levelIndex+1);
  if(subEl)subEl.textContent='SCORE '+v22Run.score+' · BESTE COMBO '+v22Run.bestStreak+' · NOG EEN KEER?';
 }
 return out;
};
// Crisp pixel edges, preserve original soldier/vehicle atlas animations.
// Sprite-based ground micro-details are baked ONCE into a raster tile.
var v22GroundTile=null;
function v22BuildGroundTile(){
 if(v22GroundTile||typeof document==='undefined')return v22GroundTile;
 var c=document.createElement('canvas');c.width=128;c.height=128;
 var t=c.getContext('2d');if(!t)return null;
 var colors=['#263a2e','#375342','#758263','#a0a17a','#4c5440'];
 for(var n=0;n<150;n++){
  var x=(n*79+n*n*7)%128,y=(n*61+n*n*13)%128;
  t.fillStyle=colors[(n*17+n%3)%colors.length];
  var z=n%9===0?3:1;
  t.fillRect(x,y,z,n%5===0?2:1);
 }
 v22GroundTile=c;return c;
}
var v22FieldOld=drawField9943;
drawField9943=function(){
 var out=v22FieldOld.apply(this,arguments);
 if(!v22Active()||!gameState||gameState.mode!=='playing')return out;
 var tile=v22BuildGroundTile();if(!tile)return out;
 ctx.save();ctx.globalAlpha=.24;ctx.imageSmoothingEnabled=false;
 for(var y=safeTop+70;y<H-safeBottom-65;y+=128)
  for(var x=0;x<W;x+=128)ctx.drawImage(tile,x,y);
 ctx.restore();return out;
};
var v22RenderOld=render;
render=function(){
 if(v22Active())ctx.imageSmoothingEnabled=false;
 var out=v22RenderOld.apply(this,arguments);
 if(!v22Active()||!gameState||gameState.mode!=='playing')return out;
 var r=v22Run,mult=Math.min(3,1+Math.floor(r.streak/4));
 ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
 var y=safeTop+5,w=Math.min(W-16,292);
 ctx.fillStyle='rgba(20,33,27,.89)';ctx.fillRect(8,y,w,42);
 ctx.fillStyle='#d8cb8a';ctx.font='bold 12px monospace';ctx.textAlign='left';
 ctx.fillText('WAVE '+String(gameState.levelIndex+1).padStart(2,'0')+'/30',15,y+15);
 ctx.fillStyle='#f4e9c9';ctx.fillText('SCORE '+r.score,132,y+15);
 ctx.font='bold 11px monospace';
 ctx.fillStyle=mult>1?'#ffcb68':'#9bba95';
 ctx.fillText('COMBO '+r.streak+'   x'+mult,15,y+33);
 if(r.hot>0){ctx.fillStyle='#ffbe5e';ctx.fillText('POWER '+Math.ceil(r.hot)+'s',150,y+33);}
 for(var i=0;i<r.flashes.length;i++){
  var f=r.flashes[i];ctx.globalAlpha=Math.min(1,f.t/.35);
  ctx.fillStyle='#ffe394';ctx.font='bold 13px monospace';
  ctx.fillText(f.text,f.x-9,f.y-17-(.6-f.t)*20);
 }
 ctx.restore();
 return out;
};