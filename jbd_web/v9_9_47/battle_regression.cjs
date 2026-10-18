'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');

function loadGame(directory,viewport={width:390,height:844},options={}){
  let source=fs.readFileSync(path.join(directory,'game.js'),'utf8');
  const html=fs.readFileSync(path.join(directory,'index.html'),'utf8');
  new vm.Script(source,{filename:'game.js'});
  const ids=new Map(),audio=[],timers=[];
  let now=0,seed=9929+(options.seed||0);
  const noop=()=>{};
  const gradient={addColorStop:noop};
  const context=new Proxy({measureText:s=>({width:String(s).length*6}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,createPattern:()=>({}),getImageData:()=>({data:new Uint8ClampedArray(16)})},{get:(o,k)=>k in o?o[k]:noop});
  function node(tag){
    const n={tagName:tag.toUpperCase(),style:{},children:[],listeners:{},eventEntries:{},textContent:'',className:'',disabled:false,
      classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
      appendChild(child){this.children.push(child);child.parentNode=this;return child;},
      removeChild(child){this.children=this.children.filter(x=>x!==child);},
      remove:noop,setAttribute:noop,getAttribute:()=>null,
      addEventListener(type,fn,options){(this.listeners[type]||(this.listeners[type]=[])).push(fn);(this.eventEntries[type]||(this.eventEntries[type]=[])).push({fn,capture:options===true||!!(options&&options.capture)});},
      getContext:()=>context,getBoundingClientRect:()=>({left:0,top:0,width:viewport.width,height:viewport.height}),
      setPointerCapture:noop,releasePointerCapture:noop,querySelector:()=>null,querySelectorAll:()=>[],
      focus:noop,blur:noop};
    Object.defineProperty(n,'id',{get(){return this._id;},set(id){this._id=id;ids.set(id,this);}});
    return n;
  }
  for(const m of html.matchAll(/id="([^"]+)"/g)){const n=node(m[1]==='game'?'canvas':'div');n.id=m[1];}
  const document={getElementById:id=>ids.get(id)||null,createElement:node,head:node('head'),body:node('body'),hidden:false,addEventListener:noop,querySelector:()=>null};
  function Howl(options){this.options=options;this.state=()=> 'loaded';this.load=noop;this.volume=noop;this.rate=noop;this.stereo=noop;this.stop=noop;this.unload=noop;this.on=noop;this.once=noop;this.play=sprite=>{audio.push({sprite,format:options.format[0],recorded:options.src[0].startsWith('data:audio/')});return audio.length;};}
  const rng=Object.create(Math);rng.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const env={console,document,navigator:{userAgent:'iPhone',maxTouchPoints:5},innerWidth:viewport.width,innerHeight:viewport.height,devicePixelRatio:2,
    location:{search:'',href:'https://example.test/game'},URLSearchParams,performance:{now:()=>now},
    Math:rng,Howl,Howler:{ctx:{state:'running',resume:()=>Promise.resolve()},volume:noop},
    getComputedStyle:()=>({paddingTop:'0px',paddingBottom:'0px',getPropertyValue:()=> '0px'}),
    localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,addEventListener:noop,
    setInterval:(fn)=>{timers.push(fn);return timers.length;},clearInterval:noop,setTimeout:()=>0,clearTimeout:noop};
  env.window=env;
  const end=source.lastIndexOf('\n})();');
  assert.ok(end>0,'game outer wrapper');
  source=source.slice(0,end)+`\nglobalThis.__gameTest={get state(){return gameState;},field:typeof field9943==='function'?field9943:null,fieldRole:typeof updateFieldRole9943==='function'?updateFieldRole9943:null,postCreate:typeof newPost9943==='function'?newPost9943:null,radioDrop:typeof deployRadioParas9943==='function'?deployRadioParas9943:null,postStep:typeof updateFieldPosts9943==='function'?updateFieldPosts9943:null,ammoEmit:typeof emitCookoffRound9943==='function'?emitCookoffRound9943:null,ammoStep:typeof updateCookoffRounds9943==='function'?updateCookoffRounds9943:null,firefighters:typeof assignFirefighters9943==='function'?assignFirefighters9943:null,ignite:typeof igniteFuel==='function'?igniteFuel:null,gunFuel:typeof gunFuelProgress9937==='function'?gunFuelProgress9937:null,burnStep:typeof advanceVehicleBurn9941==='function'?advanceVehicleBurn9941:null,smallPop:typeof smallVehiclePop9941==='function'?smallVehiclePop9941:null,rescue:typeof updateMedicVehicleRescue9941==='function'?updateMedicVehicleRescue9941:null,fireStep:updateFireZones,effectsStep:updateEffects,directorStep:updateBattleDirector,drawSmoke:drawSmokeZones,spills:typeof updateSpilledFuel9941==='function'?updateSpilledFuel9941:null,drawFeedback:typeof drawVehicleDamage9941==='function'?drawVehicleDamage9941:null,supportNumbers:typeof SUPPORT_BALANCE9941==='object'?SUPPORT_BALANCE9941:null,supportProfile:typeof historicalSupport9940==='function'?historicalSupport9940:null,coverStep:typeof updateEnemyCover9940==='function'?updateEnemyCover9940:null,pickCover:typeof pickEnemyCover9940==='function'?pickEnemyCover9940:null,component:typeof vehicleComponentHit9940==='function'?vehicleComponentHit9940:null,componentStep:typeof updateVehicleComponents9940==='function'?updateVehicleComponents9940:null,emotion:typeof infantryEmotion9938==='function'?infantryEmotion9938:null,faces:typeof FACE_EMOTIONS9938==='object'?FACE_EMOTIONS9938:null,goreStep:typeof updateGoreParts9938==='function'?updateGoreParts9938:null,medicStep:typeof updateMedicBehavior==='function'?updateMedicBehavior:null,medicFinish:typeof finishMedicTreatment==='function'?finishMedicTreatment:null,medicFind:typeof findMedicPatient==='function'?findMedicPatient:null,alliedMedic:typeof updateMedicAid9938==='function'?updateMedicAid9938:null,reset:resetLevel,start:startSelectedMode,step:update,playerStep:typeof updatePlayerWeapons9937==='function'?updatePlayerWeapons9937:null,issueOrder:typeof issueFireOrder9937==='function'?issueFireOrder9937:null,orderAccuracy:typeof fireOrderAccuracy9937==='function'?fireOrderAccuracy9937:null,scheduleMortar:typeof scheduleMortar9937==='function'?scheduleMortar9937:null,drawOrders:typeof drawFireOrderOverlay9937==='function'?drawFireOrderOverlay9937:null,allyStep:updateAlliedTeam,render:render,createAlly:createAlliedInfantry,spawnEnemy:spawnInfantry,profile:playerProfile,shotStep:updateShots,vehicleStep:updateVehicles,vehicleGun:vehicleMG,spawnVehicle:spawnVehicle,damageVehicle:damageVehicle,vehicleHit:primaryVehicleHit,grenadeImpact:specialImpactAt,resolveHE:resolveHEHit,grenadeStats:specialStats,grenadeSlots:grenadeSlotCount,grenadeRecharge:grenadeRechargeTime,grenadeReady:grenadeReadySlot,shop:renderShop,preview:skillPreview,routeStep:typeof updateEnemyCenterRoute9935==='function'?updateEnemyCenterRoute9935:null,route:typeof findCenterRoute9935==='function'?findCenterRoute9935:null,migrate:typeof normalizeUpgradeTracks9935==='function'?normalizeUpgradeTracks9935:null,upgrades:UPGRADES,tour:typeof WORLD_TOUR_9934!=='undefined'?WORLD_TOUR_9934:null,levels:LEVELS,buildMap:buildMap,awardPoints:typeof upgradePointReward9934==='function'?upgradePointReward9934:null,primaryStats:primaryStats,fire:fireWeapon,resolveMG:resolveMGHit,obstacle:primaryObstacleHit,ballistic:typeof resolveBallisticSegment9936==='function'?resolveBallisticSegment9936:null,penetrate:typeof rollPenetration9936==='function'?rollPenetration9936:null,profile:playerProfile,enemyProfile:enemyProgression,plan:buildEncounterPlan,kill:registerGunGameKill,damageBunker:damageBunker,wall:lineOfSightBlockedByWalls,audio:AudioSys,suppress:suppressAllies9930,blast:applyBlastShock,enemyFire:enemyFire,enemyStep:updateInfantry,underFire:typeof markEnemyUnderFire9932==='function'?markEnemyUnderFire9932:null,suppressEnemies:typeof suppressEnemiesFromAlly9932==='function'?suppressEnemiesFromAlly9932:null,damageInfantry:damageInfantry,fireAlly:fireAlliedInfantry9929,get size(){return {w:W,h:H};}};\n`+source.slice(end);
  source=source.replace('  buildLadderControls925();','  buildLadderControls925(); globalThis.__ladderTest={state:ladderState925,tier:ladderTier925,activate:activateSupportEvent994,update:updateSupport994,refresh:ladderRefresh925};');
  if(options.stationaryTargets){const end=source.lastIndexOf('\n})();');source=source.slice(0,end)+"\nupdateInfantry=function(){};updateVehicles=function(){};updateEnemyShots=function(){};updateAir=function(){};updateOpportunities=function(){};updateDynamicRisk=function(){};updateBattleStall995=function(){return false;};\n"+source.slice(end);}
  vm.createContext(env);vm.runInContext(source,env,{timeout:10000});
  return {setSeed(value){seed=value;rng.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);},setRandom(value){rng.random=()=>value;},t:env.__gameTest,ladder:env.__ladderTest,audio,ids,
    clock(ms){now+=ms;},
    pointer(type,x,y,id=1){let stopped=false;const target=ids.get('game');const ev={target,pointerId:id,clientX:x,clientY:y,preventDefault:noop,stopPropagation:noop,stopImmediatePropagation(){stopped=true;}};const entries=(target.eventEntries[type]||[]).slice().sort((a,b)=>Number(b.capture)-Number(a.capture));for(const entry of entries){if(stopped)break;entry.fn(ev);}},
    playerTick(dt){now+=dt*1000;env.__gameTest.state.time+=dt;env.__gameTest.state.levelTime+=dt;env.__gameTest.playerStep(dt);env.__gameTest.shotStep(dt);},
    tick(dt){now+=dt*1000;env.__gameTest.state.time+=dt;env.__gameTest.state.levelTime+=dt;env.__gameTest.allyStep(dt);}};
}
function emptyBattle(g,mode='easy'){
  g.t.start(mode);const s=g.t.state;
  s.infantry=[];s.vehicles=[];s.air=[];s.paras=[];s.wrecks=[];s.fireZones=[];s.effects=[];s.arcade.allies=[];s.arcade.armor=[];s.arcade.forts=[];s.arcade.tracers=[];
  s.map.cover=[];s.map.rocks=[];s.map.trees=[];s.map.puddles=[];
  return s;
}
function combatReport(directory){
  const g=loadGame(directory),s=emptyBattle(g);
  const target=g.t.spawnEnemy(195,300,'rifle',null,'vehicle');target.hp=target.maxHp=10000;target.armorHp=0;
  s.aim={x:195,y:300};
  for(const [role,x] of [['rifle',173],['lmg',217],['medic',250]]){const u=g.t.createAlly(x,470,role);u.assignment='advance';u.fireCd=.2;s.arcade.allies.push(u);}
  const voices=[];let missingAudio=0;const old=g.t.audio.weapon;g.t.audio.weapon=function(...args){voices.push(args);const before=g.audio.length;const result=old.apply(this,args);if(g.audio.length===before)missingAudio++;return result;};
  let firingFrames=0;
  for(let f=0;f<720;f++){g.tick(1/60);if(s.arcade.allies.some(u=>u.muzzle>0))firingFrames++;}
  g.t.render();
  return {shots:voices.length,recordedPlays:g.audio.length,embeddedPlays:g.audio.filter(a=>a.recorded).length,missingAudio,firingFrames,damage:10000-target.hp,roles:Array.from(new Set(voices.map(a=>a[1]))),allies:s.arcade.allies.length};
}

if(require.main!==module){module.exports={loadGame,emptyBattle,combatReport};return;}
const dir=process.argv[2]||__dirname;
const report=combatReport(dir);
console.log(JSON.stringify({combat:report}));
if(process.argv.includes('--baseline'))process.exit(0);
assert.ok(report.shots>=25,'allied squad must actually fire repeatedly at 60 FPS');
assert.ok(report.recordedPlays>=report.shots,'allied fire must schedule recorded gun audio');
assert.equal(report.missingAudio,0,'every shot schedules audio');
assert.ok(report.firingFrames>=100,'visible firing animation must be active');
assert.ok(report.damage>10,'allied bullets must hit and damage the enemy');
assert.ok(report.roles.includes('rifle')&&report.roles.includes('lmg'),'rifle and MG both fire');
assert.ok(!report.roles.includes('medic'),'medic keeps support role');

const ladderGame=loadGame(dir);emptyBattle(ladderGame);
for(let kills=1;kills<=40;kills++){
  ladderGame.t.kill();
  assert.equal(ladderGame.ladder.tier(ladderGame.ladder.state()),Math.min(5,Math.floor(kills/8)),'support tier at '+kills+' kills');
}
assert.ok(ladderGame.ladder.activate(),'bonus activation');
assert.equal(ladderGame.ladder.state().bankedKills,0,'top bonus consumes 40 banked kills');
emptyBattle(ladderGame);
for(let k=0;k<8;k++)ladderGame.t.kill();
ladderGame.ladder.state().selectedLane='reinforce';
assert.ok(ladderGame.ladder.activate(),'reinforcement at 8 kills');
assert.equal(ladderGame.t.state.arcade.allies.length,3,'first reinforcement brings 3 troops');

const tune=loadGame(dir);tune.t.start('easy');
const easy={profile:tune.t.profile(),enemy:tune.t.enemyProfile(0),events:tune.t.plan()};
tune.t.start('hard');
const hard={profile:tune.t.profile(),enemy:tune.t.enemyProfile(0),events:tune.t.plan()};
assert.ok(easy.profile.maxHp>hard.profile.maxHp*1.25,'easy bunker survives more damage');
assert.ok(easy.profile.primaryReload<hard.profile.primaryReload*.9,'easy reloads faster');
assert.ok(hard.enemy.infantryDamage>easy.enemy.infantryDamage*2,'hard enemies deal substantially more damage');
assert.ok(hard.enemy.cooldown<easy.enemy.cooldown*.7,'hard enemies fire substantially faster');
assert.ok(hard.enemy.infantrySpeed>easy.enemy.infantrySpeed*1.35,'hard enemies advance faster');
assert.ok(hard.events.length>easy.events.length,'hard has more attack groups');
console.log(JSON.stringify({easy:{bunkerHP:easy.profile.maxHp,enemyDamage:easy.enemy.infantryDamage,cooldown:easy.enemy.cooldown,groups:easy.events.length},hard:{bunkerHP:hard.profile.maxHp,enemyDamage:hard.enemy.infantryDamage,cooldown:hard.enemy.cooldown,groups:hard.events.length}}));

const survival=loadGame(dir);emptyBattle(survival,'easy');survival.t.damageBunker(100000);
assert.equal(survival.t.state.mode,'playing','easy retains its last stand');
assert.equal(survival.t.state.lastStandUsed,true,'easy last stand is used');
emptyBattle(survival,'hard');survival.t.damageBunker(100000);
assert.equal(survival.t.state.mode,'gameover','hard has one bunker life');

const flank=loadGame(dir),s=emptyBattle(flank);
const enemy=flank.t.spawnEnemy(195,220,'rifle',null,'vehicle');enemy.hp=enemy.maxHp=10000;
s.map.cover.push({id:123,kind:'building',x:195,y:350,w:70,h:68,r:35,integrity:5,hitProgress:0,destroyed:false});
s.aim={x:30,y:200};
const scout=flank.t.createAlly(195,520,'rifle');scout.assignment='advance';s.arcade.allies.push(scout);
let shots=0;const original=flank.t.audio.weapon;flank.t.audio.weapon=function(...args){shots++;return original.apply(this,args);};
for(let f=0;f<3600;f++)flank.tick(1/60);
assert.ok(!flank.t.wall(scout.x,scout.y,enemy.x,enemy.y),'flanker finds a firing lane around the building');
assert.ok(shots>0,'flanker reaches a clear shot around the building');
console.log(JSON.stringify({flank:{x:scout.x,y:scout.y,shots}}));

for(const mode of ['easy','hard']){
  const campaign=loadGame(dir);campaign.t.start(mode);
  let shots=0;const weapon=campaign.t.audio.weapon;campaign.t.audio.weapon=function(...args){if(args[3]&&args[3].allied)shots++;return weapon.apply(this,args);};
  for(let frame=0;frame<1800&&campaign.t.state.mode==='playing';frame++)campaign.t.step(1/60);
  assert.equal(shots,0,mode+' campaign starts without free allied gunfire');
  assert.equal(campaign.t.state.arcade.allies.length,0,mode+' campaign has no free allied infantry');
  assert.ok(campaign.t.state.arcade.allies.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)),mode+' allies remain in valid world positions');
  campaign.t.render();
  console.log(JSON.stringify({campaign:mode,mode:campaign.t.state.mode,alliedShots:shots,kills:campaign.t.state.stats.kills}));
}
const tactical=loadGame(dir),ts=emptyBattle(tactical);
const target=tactical.t.spawnEnemy(195,300,'rifle',null,'vehicle');target.hp=target.maxHp=10000;target.armorHp=0;
const team=['rifle','lmg'].map((role,i)=>{const u=tactical.t.createAlly(175+i*40,470,role);u.assignment='advance';ts.arcade.allies.push(u);return u;});
let firedMoving=0,reloadFrames=0,plantedFrames=0;
for(let f=0;f<1800;f++){
  const shots=team.map(u=>u.shotsFired9929||0);tactical.tick(1/60);
  for(let i=0;i<team.length;i++){
    const u=team[i],moving=Math.hypot(u.vx||0,u.vy||0)>1;
    if(!moving)plantedFrames++;
    if(u.reload9930>0)reloadFrames++;
    if((u.shotsFired9929||0)>shots[i]&&moving)firedMoving++;
  }
}
assert.equal(firedMoving,0,'infantry plants its feet before aimed fire');
assert.ok(plantedFrames>1800*2*.90,'a clear shot causes sustained fighting, not running');
assert.ok(reloadFrames>60,'real magazine reload pauses occur');
const rifle=team[0],beforeSuppressed=rifle.shotsFired9929;
for(let k=0;k<4;k++)tactical.t.suppress({px:rifle.x-3,py:rifle.y,x:rifle.x+3,y:rifle.y,life:1});
tactical.tick(1/60);
assert.equal(rifle.combatPhase9930,'pinned','nearby bullets pin allied infantry');
assert.equal(rifle.posture9930,'prone','suppressed troops go prone');
for(let f=0;f<60;f++)tactical.tick(1/60);
assert.equal(rifle.shotsFired9929,beforeSuppressed,'pinned soldier stops firing');
for(let f=0;f<420;f++)tactical.tick(1/60);
assert.ok(rifle.shotsFired9929>beforeSuppressed,'soldier resumes fire after suppression fades');
tactical.t.blast(rifle.x,rifle.y,40,1);tactical.tick(1/60);
assert.equal(rifle.posture9930,'prone','allied troops react to blast shock');

const bounds=loadGame(dir),bs=emptyBattle(bounds);
const distant=bounds.t.spawnEnemy(195,80,'rifle',null,'vehicle');distant.hp=distant.maxHp=10000;
const mover=bounds.t.createAlly(195,790,'rifle');mover.assignment='advance';bs.arcade.allies.push(mover);
const initial={x:mover.x,y:mover.y};bounds.tick(1/60);
assert.ok(Math.hypot(mover.x-initial.x,mover.y-initial.y)<1,'southern reinforcements do not jump into the field');
let maxSpeed=0,longestRun=0,run=0,holdFrames=0;
for(let f=0;f<1800;f++){
  bounds.tick(1/60);const speed=Math.hypot(mover.vx||0,mover.vy||0);maxSpeed=Math.max(maxSpeed,speed);
  if(speed>1){run+=1/60;longestRun=Math.max(longestRun,run);}else{run=0;holdFrames++;}
}
assert.ok(maxSpeed<=20.001,'sprint speed is capped at 20 px/s');
assert.ok(longestRun<=2.35,'movement consists of short bounds');
assert.ok(holdFrames>400,'troops pause and cover between bounds');
console.log(JSON.stringify({tactics:{plantedPercent:Math.round(plantedFrames/36),firedMoving,reloadFrames,maxSpeed,longestRun,holdFrames}}));

for(const viewport of [{width:844,height:390},{width:1024,height:768}]){
  const g=loadGame(dir,viewport),s=emptyBattle(g),{w,h}=g.t.size;
  const e=g.t.spawnEnemy(w*.5,h*.35,'rifle',null,'vehicle');e.hp=e.maxHp=10000;
  const u=g.t.createAlly(w*.5,h*.65,'rifle');u.assignment='advance';s.arcade.allies.push(u);
  for(let f=0;f<600;f++)g.tick(1/60);
  assert.ok(u.shotsFired9929>0,'troops engage at '+w+'x'+h);g.t.render();
}
const crossfire=loadGame(dir),xs=emptyBattle(crossfire);
const shooter=crossfire.t.spawnEnemy(195,250,'rifle',null,'vehicle');
const defender=crossfire.t.createAlly(125,320,'rifle');xs.arcade.allies.push(defender);
xs.map.cover.push({id:919,kind:'building',x:195,y:510,w:90,h:65,r:45,integrity:5,hitProgress:0,destroyed:false});
assert.ok(crossfire.t.wall(shooter.x,shooter.y,xs.bunker.x,xs.bunker.y),'bunker is behind a house');
assert.ok(crossfire.t.enemyFire(shooter),'enemy engages visible allied soldier while bunker is obscured');
assert.equal(xs.enemyShots.at(-1).aimedAllied9930,true,'shot belongs to a real infantry engagement');
assert.ok(Math.hypot(xs.enemyShots.at(-1).vx,xs.enemyShots.at(-1).vy)>500,'small-arms projectiles have coherent speeds');
for(const mode of ['easy','hard']){
  const audit=loadGame(dir);audit.t.start(mode);
  for(let level=0;level<40;level++){
    audit.t.state.levelIndex=level;const p=audit.t.enemyProfile(level);
    for(const [name,value] of Object.entries(p))assert.ok(Number.isFinite(value),mode+' map '+level+' finite '+name);
    assert.ok(p.infantryHp>.3&&p.infantryHp<5.5,'bounded infantry HP across campaign');
    assert.ok(p.infantrySpeed>.4&&p.infantrySpeed<2.5,'bounded movement across campaign');
    assert.ok(p.cooldown>=.3&&p.cooldown<=1.6,'bounded firing cadence across campaign');
    assert.ok(p.accuracy>=.28&&p.accuracy<=1.6,'bounded spread across campaign');
  }
}
console.log('PASS: planted fire, reloads, suppression/recovery, blast reaction, bounded movement, southern entry, viewport sizes, real crossfire, campaign combat, 40-map parameter audit and support progression.');


// Exercise every tier through the actual UI listeners, not direct trigger calls.
function click(g,id){
  const b=g.ids.get(id);assert.ok(b,'UI element '+id);assert.ok(!b.disabled,'enabled '+id);
  for(const listener of b.listeners.click||[])listener({preventDefault(){},stopPropagation(){}});
}
const expectedNames={strike:['81mm wz.31 mortier','PZL.23 Karaś · bommen','PZL.23 Karaś · scheervlucht','155mm houwitserbatterij','Artillerieregiment'],reinforce:['3 infanteristen','5 soldaten · MG + medic','8 veteranen · medic','wz.34 armored car','7TP']};
for(const lane of ['strike','reinforce'])for(let tier=1;tier<=5;tier++){
  const g=loadGame(dir);click(g,'upgradeTestMode');const s=g.t.state;
  assert.ok(s.upgradeTest9931&&!s.tigerDemo,'new sandbox replaces Tiger demo');
  s.infantry=[];s.vehicles=[];s.map.cover=[];s.map.rocks=[];s.map.trees=[];
  for(let i=0;i<tier;i++)click(g,'addTestKills9931');
  assert.equal(g.ladder.state().bankedKills,tier*8);
  g.t.kill();assert.equal(g.ladder.state().bankedKills,tier*8,'combat kills do not disturb test selection');
  const button=g.ids.get('jbdLane_'+lane+'_925');assert.ok(button.textContent.includes(expectedNames[lane][tier-1]),'button describes activated upgrade');
  click(g,'jbdLane_'+lane+'_925');
  const support=g.ladder.state();assert.equal(support.bankedKills,0,'correct cost');
  assert.equal(support.lastLadder925.tier,tier);assert.equal(support.lastLadder925.lane,lane);
  if(lane==='reinforce'){
    if(tier<=3){assert.equal(s.arcade.allies.length,[3,5,8][tier-1]);if(tier===3)assert.ok(s.arcade.allies.every(u=>u.elite925&&u.armorHp===0));}
    else {assert.equal(s.arcade.armor.length,1);const v=s.arcade.armor[0];assert.ok(v.allied&&v.alive&&v.hasMG);assert.equal(!!v.tiger994,tier===5);}
  }else{
    if(tier===1)assert.equal(support.markers.filter(m=>m.kind==='smallArty925').length,3);
    if(tier===2){assert.ok(support.napalmPlane925);for(let f=0;f<300;f++)g.ladder.update(1/60);assert.ok(s.effects.some(e=>e.type==='explosion')&&s.fireZones.length===0,'period bomber delivers explosive bombs');}
    if(tier===3){assert.equal(support.apache925.t,6);const enemy=g.t.spawnEnemy(195,300,'rifle',null,'vehicle');enemy.hp=10000;for(let f=0;f<180;f++)g.ladder.update(1/60);assert.ok(s.arcade.tracers.some(b=>b.apache925),'period attack plane fires real projectiles');for(let f=0;f<1801;f++)g.ladder.update(1/60);assert.equal(support.apache925,null,'period attack plane departs after its pass');}
    if(tier===4)assert.equal(support.markers.filter(m=>m.kind==='artillery').length,8);
    if(tier===5)assert.equal(support.markers.filter(m=>m.kind==='regiment9940').length,16);
    if([1,4,5].includes(tier)){const m=support.markers[0],enemy=g.t.spawnEnemy(m.x,m.y,'rifle',null,'vehicle');enemy.hp=enemy.maxHp=10000;g.ladder.update(1);assert.ok(enemy.hp<10000,'strike deals physical damage');}
  }
  assert.ok(g.ids.get('upgradeTestStatus9931').textContent.includes('Ingezet:'),'last activation visible');
  click(g,'resetUpgradeTest9931');assert.equal(g.ladder.state().bankedKills,0);assert.equal(g.t.state.arcade.allies.length,0);assert.equal(g.t.state.arcade.armor.length,0);assert.equal(g.ladder.state().lastLadder925,null);
  g.t.start('easy');assert.equal(g.ids.get('addTestKills9931').listeners.click.length,1);click(g,'addTestKills9931');assert.equal(g.ladder.state().bankedKills,0,'debug kills cannot be used in campaign');
  console.log('PASS upgrade: '+lane+' '+tier+' '+expectedNames[lane][tier-1]);
}

for(const width of [320,390,844]){
  const g=loadGame(dir,{width,height:844});click(g,'upgradeTestMode');click(g,'addTestKills9931');click(g,'addTestKills9931');click(g,'jbdLane_strike_925');
  for(let f=0;f<300;f++)g.ladder.update(1/60);
  assert.ok(g.t.state.effects.some(e=>e.type==='explosion')&&g.t.state.fireZones.length===0,'explosive bombs land without napalm at width '+width);
}
const reserve=loadGame(dir);click(reserve,'upgradeTestMode');for(let i=0;i<6;i++)click(reserve,'addTestKills9931');click(reserve,'jbdLane_reinforce_925');assert.equal(reserve.ladder.state().bankedKills,8,'top tier spends 40 and preserves remaining savings');
console.log('PASS: all ten real UI activations, test isolation/reset, 320/390/844px period bombing runs and surplus kill accounting.');

// Flight remains continuous even when target coordinates jump across the field.
for(const viewport of [{width:320,height:844},{width:844,height:390}]){
  const g=loadGame(dir,viewport);click(g,'upgradeTestMode');const s=g.t.state;
  s.infantry=[];s.vehicles=[];s.map.cover=[];s.map.rocks=[];
  for(let k=0;k<3;k++)click(g,'addTestKills9931');click(g,'jbdLane_strike_925');
  const support=g.ladder.state(),h=support.apache925,dirX=h.dir,old={x:h.x,y:h.y};
  const e=g.t.spawnEnemy(150,300,'rifle',null,'vehicle');e.hp=10000;
  let frames=0,maxDelta=0,lastX=old.x,lastY=old.y;
  while(support.apache925&&frames<800){
    e.x=frames%2?50:g.t.size.w-50;e.y=frames%2?240:500;
    g.ladder.update(1/60);
    maxDelta=Math.max(maxDelta,Math.hypot(h.x-lastX,h.y-lastY));
    assert.ok((h.x-lastX)*dirX>=-.00001,'attack plane never oscillates horizontally');
    assert.ok(Math.abs(h.y-lastY)<.3,'target switches cannot teleport flight height');
    lastX=h.x;lastY=h.y;frames++;
  }
  assert.ok(frames>=359&&frames<=362,'period plane departs at six seconds');
  assert.ok(maxDelta<4,'continuous flight at both viewports');
}
const oldReport=combatReport(path.join(dir,'../v9_9_31'));
assert.ok(report.shots>oldReport.shots,'allies still fire reliably after the requested cadence reduction');
assert.ok(report.damage<oldReport.damage*.7,'allies deal less aggregate damage despite firing more');
const fragile=loadGame(dir),fsState=emptyBattle(fragile);
const light=fragile.t.createAlly(120,430,'rifle');fsState.arcade.allies.push(light);
const oldGame=loadGame(path.join(dir,'../v9_9_31'));emptyBattle(oldGame);const oldAlly=oldGame.t.createAlly(120,430,'rifle');
console.log({lightHp:light.maxHp,oldHp:oldAlly.maxHp});
assert.ok(light.maxHp<oldAlly.maxHp*.7,'allied health materially reduced');
light.state='woundedCrawl';light.hp=1;light.armorHp=0;fragile.t.damageInfantry(light,12,'mg');assert.ok(!light.alive,'wounded allies can be finished by enemy gunfire');

// Actual near miss -> horizontal escape -> recovery, no firing while running.
const escape=loadGame(dir),es=emptyBattle(escape);es.time=10;
const runner=escape.t.spawnEnemy(195,360,'rifle',null,'vehicle');runner.hp=runner.maxHp=200;runner.state='fire';runner.fireCd=0;
es.shots=[];es.enemyShots=[];const startY=runner.y;
escape.t.suppressEnemies({px:runner.x-35,py:runner.y+15,x:runner.x+35,y:runner.y+15,owner:{x:195,y:650}});
for(let f=0;f<200;f++){es.time+=1/60;escape.t.enemyStep(1/60);assert.ok(Math.abs(runner.y-startY)<.6,'open-ground escape follows current horizontal axis');}
assert.ok(Math.abs(runner.x-195)>50,'enemy actually breaks sideways');assert.equal(es.enemyShots.length,0,'escaping enemy stops firing');
for(let f=0;f<350;f++){es.time+=1/60;escape.t.enemyStep(1/60);}
assert.ok(runner.state!=='evadeFire9932','enemy recovers instead of fleeing forever');

// Obstacles may require a short vertical detour, without crossing solid house walls.
const detour=loadGame(dir),ds=emptyBattle(detour);ds.time=10;
const avoider=detour.t.spawnEnemy(150,360,'rifle',null,'vehicle');avoider.hp=avoider.maxHp=200;avoider.state='fire';
ds.map.cover.push({id:9932,kind:'building',x:200,y:360,w:40,h:45,r:23,integrity:5,hitProgress:0,destroyed:false});
detour.t.underFire(avoider,80,650,.5);detour.t.enemyStep(1/60);
// Pin the intended horizontal side to demonstrate the full corner route.
avoider.escapeGoal9932={x:270,y:360};avoider.houseWaypoint9929=null;
let maxYDetour=0;
for(let f=0;f<360;f++){
  ds.time+=1/60;detour.t.enemyStep(1/60);maxYDetour=Math.max(maxYDetour,Math.abs(avoider.y-360));
  assert.ok(!(avoider.x>179&&avoider.x<221&&avoider.y>336&&avoider.y<384),'enemy never clips through house');
}
assert.ok(maxYDetour>30,'enemy takes a real vertical corner detour');assert.ok(avoider.x>230,'enemy reaches far side of obstruction');
console.log(JSON.stringify({newBalance:{shots:report.shots,previousShots:oldReport.shots,damage:report.damage,previousDamage:oldReport.damage,alliedHp:light.maxHp,previousHp:oldAlly.maxHp,escapeX:runner.x,houseEscapeX:avoider.x,maxYDetour}}));
// Higher artillery tiers buy clearly larger reach and much higher anti-armor impact.
const strikeDamage={};
for(const tier of [1,4,5]){
  const g=loadGame(dir);click(g,'upgradeTestMode');const s=g.t.state;s.infantry=[];s.vehicles=[];s.map.cover=[];s.map.rocks=[];
  for(let k=0;k<tier;k++)click(g,'addTestKills9931');click(g,'jbdLane_strike_925');
  const marker=g.ladder.state().markers[0],enemy=g.t.spawnEnemy(marker.x,marker.y,'rifle',null,'vehicle');enemy.hp=enemy.maxHp=10000;enemy.armorHp=0;
  for(let frame=0;frame<180;frame++)g.ladder.update(1/60);
  strikeDamage[tier]=10000-enemy.hp;
}
assert.ok(strikeDamage[4]>strikeDamage[1]*3,'heavy barrage is substantially stronger than small artillery');
assert.ok(strikeDamage[5]>strikeDamage[1]*5,'precision tier earns its higher kill cost');
const recovery=loadGame(dir),rs=emptyBattle(recovery);rs.time=1;rs.bunker.y=620;
const recoveringEnemy=recovery.t.spawnEnemy(180,360,'rifle',null,'vehicle');recoveringEnemy.hp=1000;recoveringEnemy.maxHp=1000;
recovery.t.underFire(recoveringEnemy,195,700,.3);
for(let f=0;f<720;f++){rs.time+=1/60;recovery.t.enemyStep(1/60);}
assert.ok(rs.enemyShots.length>0,'enemy resumes real shooting after escaping');
const noFreeTank=loadGame(dir);noFreeTank.t.start('easy');for(let f=0;f<300;f++)noFreeTank.t.step(1/60);assert.ok(!noFreeTank.t.state.arcade.armor.some(v=>v.tiger994),'Easy no longer bypasses the top support tier with a free Tiger');
console.log(JSON.stringify({strikeDamage,enemyRecoveryShots:rs.enemyShots.length}));


// Speed + penetration has useful baseline penetration and does not gate map-wide reach.
const spr=loadGame(dir);spr.t.start('hard');const sprState=spr.t.state;
sprState.save.upgrades.range=0;const spr0=spr.t.primaryStats(0);
sprState.save.upgrades.range=20;const spr12=spr.t.primaryStats(0);
assert.ok(spr12.speed>spr0.speed*1.8,'upgrading speed is a meaningful projectile-velocity increase');
assert.equal(spr12.rangeFactor,spr0.rangeFactor,'range is unlimited at every upgrade level');
assert.ok(spr0.penetrationChance>=.25&&spr0.penetration>=1,'baseline bullets sometimes penetrate');
assert.equal(spr12.penetrationChance,.85,'maximum penetration upgrade is 85%, never guaranteed');
assert.match(spr.t.upgrades.range.label,/SPEED \+ PENETRATION/);

// Audit every campaign map: Hard starts with a small first fight and pressure rises by stage.
const progression=loadGame(dir);progression.t.start('hard');const ps=progression.t.state;
const mapAudit=[];
for(let idx=0;idx<40;idx++){
  ps.levelIndex=idx;ps.levelDNA=null;ps.shortBattle=null;
  const events=progression.t.plan();
  const foot=events.filter(e=>['foot','rocketSquad','lmgSquad','marksmanSquad','eliteSquad','commandGroup'].includes(e.type)).reduce((n,e)=>n+e.count,0);
  const vehicles=events.filter(e=>/truck|car|motorcycle|jeep|sdkfz|kubel/.test(e.type+' '+(e.label||''))||e.vehicleId).reduce((n,e)=>n+e.count,0);
  const heli=events.filter(e=>e.type==='heli').reduce((n,e)=>n+e.count,0);
  mapAudit.push({idx,foot,vehicles,heli});
}
assert.ok(mapAudit[0].foot<=4,'Hard map 1 starts with at most four direct infantry');
assert.ok(mapAudit[0].vehicles>=1,'Hard map 1 keeps its first troop truck');
assert.ok(mapAudit.slice(1).some(m=>m.vehicles>0),'later maps include progressive vehicle support');
assert.ok(mapAudit[24].foot>=mapAudit[0].foot,'late-map infantry pressure exceeds first map');
// Vehicles are audited below by support events and stage progression.
assert.ok(mapAudit.every(m=>m.heli===0)&&mapAudit[11].vehicles>=2,'former helicopter map deploys two period transports');
assert.ok(progression.t.enemyProfile(30).infantryDamage>progression.t.enemyProfile(0).infantryDamage,'Hard combat stats rise through campaign');
console.log(JSON.stringify({spr:{speed:[spr0.speed,spr12.speed],range:[spr0.rangeFactor,spr12.rangeFactor],penetrationChance:spr12.penetrationChance},hardMaps:mapAudit}));

// Successful SPR rounds cross destructible cover and can damage armor while continuing.
const ballistics=loadGame(dir),ballState=emptyBattle(ballistics,'hard');
ballState.save.upgrades.range=12;ballState.profile=ballistics.t.profile();
let crossed=false;
for(let k=0;k<20&&!crossed;k++){
  ballState.map.cover=[{kind:'crate',sprite:'crateStack',x:195,y:300,r:8,integrity:5,destroyed:false}];
  const shot={kind:'mg',px:180,py:300,x:210,y:300,vx:900,vy:0,damage:12,penetration:12,penetrationChance9933:.78,passedObstacles9933:{},active:true};
  const blocked=ballistics.t.obstacle(shot);crossed=!blocked&&shot.penetrationHits9936===1;
}
assert.ok(crossed,'a fully upgraded SPR round can penetrate a wooden crate');
let penetratedArmor=false;
for(let k=0;k<30&&!penetratedArmor;k++){
  const tank={id:'spr-tank',x:195,y:300,type:'tank',alive:true,hp:1000,maxHp:1000,armorHp:100,vehicleClass:3,vehicleSpec:{family:'tank'}};
  ballState.vehicles=[tank];
  const shot={kind:'mg',px:180,py:300,x:210,y:300,vx:900,vy:0,damage:12,penetration:12,penetrationChance9933:.78,armorPenLevel9933:12,piercedIds:{},active:true};
  const stopped=ballistics.t.resolveMG(shot);penetratedArmor=!stopped&&tank.armorHp<100&&tank.hp<1000&&shot.penetrationHits9936===1;
}
assert.ok(penetratedArmor,'SPR armor penetration damages armor and the vehicle behind it while the round continues');
console.log('PASS: SPR penetrates destructible cover and damages behind armor.');


// The campaign is an original, unique 40-map tour through WWII theaters.
const tourGame=loadGame(dir);assert.equal(tourGame.t.tour.length,40);
assert.equal(new Set(tourGame.t.levels.map(l=>l.name)).size,40,'all campaign map names are new and unique');
assert.equal(new Set(tourGame.t.levels.map(l=>l.code)).size,40,'all maps use distinct authored terrain DNA');
assert.deepEqual(Array.from(new Set(tourGame.t.levels.map(l=>l.year9934))).sort(),['1939','1940','1941','1942','1943','1944','1945']);
assert.ok(tourGame.t.levels.every((l,i,a)=>i===0||Number(l.year9934)>=Number(a[i-1].year9934)),'campaign moves forward from 1939 to 1945');
assert.equal(tourGame.t.awardPoints(1,.75,false,0),2,'opening upgrade budget');
assert.equal(tourGame.t.awardPoints(6,.75,false,0),3,'upgrade points rise after five maps');
assert.equal(tourGame.t.awardPoints(11,.75,false,0),4,'upgrade points keep increasing');
assert.equal(tourGame.t.awardPoints(40,.75,false,0),10,'late campaign pays more upgrade points plus milestone');
tourGame.t.start('easy');const tourState=tourGame.t.state;const signatures=[];
for(let i=0;i<40;i++){
  tourState.levelIndex=i;tourState.levelDNA=null;tourGame.t.buildMap();
  const m=tourState.map,L=tourGame.t.levels[i];
  assert.equal(m.tourGeometrySignature9934,'WW2-'+String(i+1).padStart(2,'0'));
  assert.equal(m.layoutName,L.packLabel);assert.ok(m.cover.length>=3,'map '+(i+1)+' has physical cover');
  signatures.push([m.road.style,m.layout.roadWidth,m.layout.cover,m.layout.patches,m.layout.setpieces,m.layout.trees].join('|'));
}
assert.equal(new Set(signatures).size,40,'all 40 maps use distinct physical layout profiles');
for(const i of [0,11,19,27,31,39]){
  tourState.levelIndex=i;tourState.levelDNA=null;const events=tourGame.t.plan();
  assert.equal(tourState.shortBattle.label,tourGame.t.levels[i].shortTitle,'map '+(i+1)+' historical encounter label');
  assert.ok(events.length>=1,'map '+(i+1)+' has a battle plan');
}
console.log('PASS: 40 unique WWII map identities/layouts, 1939–45 campaign tour, historical battle labels and steadily rising upgrade-point rewards.');

// V9.9.38: four paid upgrade tracks; merged handling and grenade progression are actual mechanics.
const four=loadGame(dir),fourState=emptyBattle(four,'hard');fourState.save.arsenalPoints=100;
four.t.shop();let paid=four.ids.get('shopGrid').children;
assert.equal(paid.length,4,'exactly four paid upgrade buttons');
assert.deepEqual(Object.keys(four.t.upgrades).sort(),['armor','range','rate','special']);
assert.match(paid[0].innerHTML,/900.*px\/s/,'projectile speed is visible');
const handlingBefore=four.t.profile();paid[1].listeners.click[0]();const handlingAfter=four.t.profile();
assert.ok(handlingAfter.primaryCycle<handlingBefore.primaryCycle&&handlingAfter.primaryReload<handlingBefore.primaryReload&&handlingAfter.primaryMag>handlingBefore.primaryMag,'one handling purchase changes fire rate, reload and magazine together');
assert.equal(handlingAfter.primaryDamage,handlingBefore.primaryDamage,'handling does not increase bullet damage');
fourState.save.upgrades.special=6;fourState.grenadeSlots=[8];four.ids.get('shopGrid').children=[];four.t.shop();const grenadeBefore=four.t.grenadeStats(6);
four.ids.get('shopGrid').children[2].listeners.click[0]();
assert.equal(four.t.grenadeSlots(),2,'second grenade at level 7');assert.equal(fourState.grenadeSlots[0],8,'buying a slot preserves a reloading grenade');assert.equal(fourState.grenadeSlots[1],0,'new slot is ready');
assert.ok(four.t.grenadeStats(7).impact>grenadeBefore.impact&&four.t.grenadeRecharge()<grenadeBefore.recharge,'grenade upgrade adds damage and slightly faster recharge');
fourState.save.upgrades.special=13;fourState.grenadeSlots=[6,11];four.ids.get('shopGrid').children=[];four.t.shop();four.ids.get('shopGrid').children[2].listeners.click[0]();
assert.equal(four.t.grenadeSlots(),3,'third grenade at level 14');assert.deepEqual(Array.from(fourState.grenadeSlots),[6,11,0]);
const fixedBulletDamage=four.t.profile().primaryDamage;for(const key of ['range','rate','special','armor'])fourState.save.upgrades[key]=20;
assert.equal(four.t.profile().primaryDamage,fixedBulletDamage,'bullet damage is fixed even with all four lines maxed');
const legacy={arsenalPoints:5,upgrades:{damage:4,range:3,rate:4,magazine:5,reload:2,aiming:3,armor:2,special:2}};
function upgradeSpent(n){let v=0;for(let i=0;i<n;i++)v+=i<4?1:i<9?2:3;return v;}
const originalInvestment=legacy.arsenalPoints+Object.values(legacy.upgrades).reduce((n,l)=>n+upgradeSpent(l),0);
four.t.migrate(legacy);const migratedInvestment=legacy.arsenalPoints+Object.values(legacy.upgrades).reduce((n,l)=>n+upgradeSpent(l),0);
assert.equal(migratedInvestment,originalInvestment,'migration preserves every previously spent point');const migrationAP=legacy.arsenalPoints;four.t.migrate(legacy);assert.equal(legacy.arsenalPoints,migrationAP,'migration runs only once');

// Baseline and upgraded weapons can hit the opposite edge in portrait and landscape.
for(const viewport of [{width:320,height:844},{width:390,height:844},{width:844,height:390}])for(const upgrade of [0,20]){
  const g=loadGame(dir,viewport),s=emptyBattle(g,'hard');g.setRandom(.5);s.save.upgrades.range=upgrade;s.profile=g.t.profile();
  const x=g.t.size.w*.5,y=35;const enemy=g.t.spawnEnemy(x,y,'rifle',null,'vehicle');enemy.hp=enemy.maxHp=1000;enemy.state='fire';
  assert.ok(g.t.fire('mg',x,g.t.size.h*.55),'MG fires');const bullet=s.shots[s.shots.length-1];
  assert.ok(bullet.targetDist>Math.hypot(g.t.size.w,g.t.size.h),'MG continues beyond the aimed point');
  for(let f=0;f<100;f++)g.t.shotStep(1/60);
  assert.ok(enemy.hp<1000,'unlimited MG reach at '+viewport.width+'px / level '+upgrade);
  s.infantry=[];s.heat=0;s.overheat=false;const aim={x:g.t.size.w*.88,y:40};
  assert.ok(g.t.fire('he',aim.x,aim.y),'grenade launches');const grenade=s.shots[s.shots.length-1];
  const expected=Math.hypot(aim.x-s.bunker.x,aim.y-(s.bunker.y-10));assert.ok(Math.abs(grenade.targetDist-expected)<.01,'grenade has no distance cap');
  for(let f=0;f<250&&grenade.active;f++)g.t.shotStep(1/60);
  assert.ok(!grenade.active&&Math.hypot(grenade.x-aim.x,grenade.y-aim.y)<.01,'grenade lands at the distant aim point');
}

// A baseline round can traverse cover without being stopped again while exiting it.
const through=loadGame(dir),throughState=emptyBattle(through,'hard');through.setRandom(.05);throughState.profile=through.t.profile();throughState.profile.spreadScale=0;
throughState.map.cover=[{kind:'crate',sprite:'crateStack',x:195,y:440,r:8,integrity:5,destroyed:false}];
const behind=through.t.spawnEnemy(195,280,'rifle',null,'vehicle');behind.hp=behind.maxHp=1000;
through.t.fire('mg',195,280);for(let f=0;f<70;f++)through.t.shotStep(1/60);assert.ok(behind.hp<1000,'baseline penetration reaches an enemy behind a crate');
const chain=loadGame(dir),chainState=emptyBattle(chain,'hard');chain.setRandom(.05);chainState.save.upgrades.range=20;chainState.profile=chain.t.profile();chainState.profile.spreadScale=0;
const row=[400,386,372].map(y=>{const e=chain.t.spawnEnemy(195,y,'rifle',null,'vehicle');e.hp=e.maxHp=1000;e.id=y;return e;});
row.forEach(e=>{e.x=195;});chain.t.fire('mg',195,300);for(let f=0;f<20;f++)chain.t.shotStep(.05);assert.ok(row.every(e=>e.hp<1000),'one fast penetrating bullet can damage several aligned soldiers');

// Driver damage requires several successful penetrations; gunfire alone never explodes a hull.
const drivers=loadGame(dir),driverState=emptyBattle(drivers,'hard');drivers.setRandom(.05);
drivers.t.spawnVehicle('trooptruck',1,'blitz_1',0,0);const truck=driverState.vehicles[0];truck.x=195;truck.y=300;truck.hp=truck.maxHp=1000;truck.armorHp=0;truck.vehicleClass=1;truck.passengers=truck.unloadLeft=0;
function crewShot(v,chance=.30){return {kind:'mg',x:v.x,y:v.y,px:v.x,py:v.y+5,vx:0,vy:-900,damage:12,penetration:1,penetrationChance9933:chance,armorPenLevel9933:0,piercedIds:{},active:true};}
truck.componentHits9940={tire:0,radiator:0,glass:0,fuel:0,body:0,frame:0};drivers.setRandom(.4);
for(let i=0;i<3;i++){assert.ok(drivers.t.vehicleHit(truck,crewShot(truck,.85)));assert.ok(!truck.driverHit,'one penetration cannot kill the driver');}
assert.ok(drivers.t.vehicleHit(truck,crewShot(truck,.85)));assert.ok(truck.driverHit&&truck.alive,'four successful light-vehicle penetrations wound the driver while preserving the hull');
assert.equal(driverState.stats.vehicleKills,0);for(let f=0;f<420;f++){driverState.time+=1/60;drivers.t.vehicleStep(1/60);}
assert.equal(truck.state,'driverless9935');assert.ok(truck.alive&&truck.hp>0,'driverless vehicle remains intact');assert.equal(driverState.stats.vehicleKills,0,'no premature vehicle kill credit');
const finishingGrenade={kind:'he',radius:21,damage:72,blastDamage:38,specialEffect:'blast',visual:0};drivers.t.grenadeImpact(truck.x,truck.y,finishingGrenade);
assert.ok(truck.alive,'driverless hull also survives the first grenade');drivers.t.grenadeImpact(truck.x,truck.y,{...finishingGrenade,vehicleBlastApplied9935:false,vehicleContacts9940:{}});assert.ok(!truck.alive,'second grenade destroys the driverless hull');assert.equal(driverState.stats.vehicleKills,1,'explosive destruction earns one kill');drivers.t.grenadeImpact(truck.x,truck.y,finishingGrenade);assert.equal(driverState.stats.vehicleKills,1,'grenade blast cannot be applied twice');
drivers.t.spawnVehicle('trooptruck',1,'blitz_1',0,0);const resistant=driverState.vehicles[driverState.vehicles.length-1];resistant.passengers=resistant.unloadLeft=0;drivers.setRandom(.99);
for(let i=0;i<150;i++)drivers.t.vehicleHit(resistant,crewShot(resistant));assert.ok(resistant.alive&&!resistant.driverHit&&!resistant.fuelIgnited,'failed penetration never randomly kills the driver or ignites the truck');
for(let i=0;i<150;i++)drivers.t.damageVehicle(resistant,10000,'mg');assert.ok(resistant.alive&&resistant.hp>0,'even repeated heavy small-arms damage cannot destroy the hull');

// Ten seconds persist across AI state changes; rerouting keeps real fire aimed at the bunker.
const rally=loadGame(dir),rallyState=emptyBattle(rally,'hard');rally.setRandom(.5);
const blocked=rally.t.spawnEnemy(70,320,'rifle',null,'vehicle');blocked.hp=blocked.maxHp=1000;blocked.id=7;blocked.fireCd=999;
const decoy=rally.t.createAlly(100,320,'rifle');rallyState.arcade.allies.push(decoy);
for(let f=0;f<599;f++){blocked.state=['advance','cover','suppressed','prone'][f%4];blocked.x=70;blocked.y=320;rallyState.time+=1/60;rally.t.routeStep(blocked,1/60);}
assert.ok(!blocked.centerRoute9935,'no reroute before ten seconds');rallyState.time+=1/60;rally.t.routeStep(blocked,1/60);assert.ok(blocked.centerRoute9935,'reroute at ten seconds despite changing AI states');
const oldCenterDistance=Math.hypot(blocked.x-195,blocked.y-844*.53);
for(let f=0;f<720&&blocked.centerRoute9935;f++){rallyState.time+=1/60;rally.t.enemyStep(1/60);}
assert.ok(Math.hypot(blocked.x-195,blocked.y-844*.53)<oldCenterDistance*.45,'rerouted enemy reaches the middle');
assert.ok(rallyState.enemyShots.length>=5,'enemy fires repeatedly while following the new route');
assert.ok(rallyState.enemyShots.every(b=>!b.aimedAllied9930&&b.vy>0),'recovery fire targets the bunker even when an ally is closer');
const routeHouse=loadGame(dir),routeHouseState=emptyBattle(routeHouse,'hard');routeHouse.setRandom(.5);
routeHouseState.map.cover.push({id:9935,kind:'building',x:145,y:345,w:68,h:110,r:55,integrity:5,hitProgress:0,destroyed:false});
const cornerSoldier=routeHouse.t.spawnEnemy(80,345,'rifle',null,'vehicle');cornerSoldier.hp=1000;cornerSoldier.id=8;
routeHouse.t.routeStep(cornerSoldier,9.99);routeHouse.t.routeStep(cornerSoldier,.02);assert.ok(cornerSoldier.centerRoute9935);
let detourDistance=0;
for(let f=0;f<1200&&cornerSoldier.centerRoute9935;f++){
  routeHouseState.time+=1/60;routeHouse.t.enemyStep(1/60);detourDistance=Math.max(detourDistance,Math.abs(cornerSoldier.y-345));
  assert.ok(!(cornerSoldier.x>111&&cornerSoldier.x<179&&cornerSoldier.y>290&&cornerSoldier.y<400),'rerouted soldier never clips through a house');
}
assert.ok(cornerSoldier.x>170&&detourDistance>60,'new route goes around the house into the center');
console.log(JSON.stringify({v35:{upgradeTracks:Object.keys(four.t.upgrades),startingSpeed:spr0.speed,startingPenetration:spr0.penetrationChance,grenadeSlots:[1,2,3],driverPenetrations:truck.penetrationHits9935,rallyShots:rallyState.enemyShots.length,houseDetour:Math.round(detourDistance)}}));
console.log('PASS: four upgrade lines, old-point migration, unlimited weapon reach, baseline and chained penetration, multi-hit driver damage, grenade finishing and ten-second firing reroutes.');

// Grenades clear soldiers while overhead and apply vehicle damage when landing nearby.
const arc=loadGame(dir),arcState=emptyBattle(arc,'hard');arc.setRandom(.5);
const underArc=arc.t.spawnEnemy(195,420,'rifle',null,'vehicle');underArc.hp=underArc.maxHp=1000;
const highGrenade={kind:'he',px:195,py:430,x:195,y:420,vx:0,vy:-315,z:35,damage:72,radius:21,blastDamage:38,specialEffect:'blast',visual:0};
assert.equal(arc.t.resolveHE(highGrenade),false,'a high grenade does not strike a ground-level soldier early');assert.equal(underArc.hp,1000);
arc.t.spawnVehicle('trooptruck',1,'blitz_1',0,0);const splashTruck=arcState.vehicles[0];splashTruck.x=195;splashTruck.y=300;splashTruck.hp=splashTruck.maxHp=55;splashTruck.armorHp=0;splashTruck.passengers=splashTruck.unloadLeft=0;
arc.t.grenadeImpact(200,300,{kind:'he',radius:21,damage:72,blastDamage:38,specialEffect:'blast',visual:0});assert.ok(splashTruck.alive&&splashTruck.grenadeHits9940===1,'nearby first grenade damages a light truck');arc.t.grenadeImpact(200,300,{kind:'he',radius:21,damage:72,blastDamage:38,specialEffect:'blast',visual:0});assert.ok(!splashTruck.alive,'second nearby grenade destroys the light truck');

// New central routes can be constructed for all 40 actual map geometries.
const pathAudit=loadGame(dir);pathAudit.t.start('hard');const paState=pathAudit.t.state;let routeCount=0;
for(let i=0;i<40;i++){
  paState.levelIndex=i;paState.levelDNA=null;paState.time=i*3;paState.wrecks=[];paState.infantry=[];pathAudit.t.buildMap();
  const e=pathAudit.t.spawnEnemy(pathAudit.t.size.w*.16,pathAudit.t.size.h*.30,'rifle',null,'vehicle');e.hp=1000;
  pathAudit.t.routeStep(e,10.001);
  assert.ok(e.centerRoute9935&&e.centerRoute9935.path.length>0,'a central recovery route exists on map '+(i+1));
  assert.ok(e.centerRoute9935.path.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),'finite waypoints on map '+(i+1));routeCount++;
}
console.log('PASS: grenade altitude/splash damage and central recovery paths on '+routeCount+' campaign maps.');

const vehicleRally=loadGame(dir),vrState=emptyBattle(vehicleRally,'hard');vehicleRally.setRandom(.5);
vehicleRally.t.spawnVehicle('scoutcar',1,'spah_1',0,0);const stalledCar=vrState.vehicles[0];stalledCar.x=117;stalledCar.y=250;stalledCar.speed=0;stalledCar.baseSpeed=0;stalledCar.currentSpeed=0;stalledCar.accel=0;stalledCar.contactY=700;stalledCar.roadLocked988=false;stalledCar.hasMG=true;
for(let f=0;f<665;f++){vrState.time+=1/60;vehicleRally.t.vehicleStep(1/60);}
assert.ok(stalledCar.centerFire9935>0&&stalledCar.routeT994>vrState.time,'a blocked vehicle also receives a fresh central route after ten seconds');
assert.ok(vrState.enemyShots.length>0,'blocked vehicle keeps firing at the bunker during recovery');
console.log('PASS: ten-second vehicle recovery directs a new central route and actual MG fire.');

// A support car must remain visible, finite and combat-ready after its actual UI summon.
const scoutReports=[];
for(const viewport of [{width:320,height:844},{width:390,height:844},{width:844,height:390}]){
  const g=loadGame(dir,viewport);click(g,'upgradeTestMode');
  const s=g.t.state;s.infantry=[];s.vehicles=[];s.map.cover=[];s.map.rocks=[];s.map.trees=[];
  for(let k=0;k<4;k++)click(g,'addTestKills9931');click(g,'jbdLane_reinforce_925');
  const car=s.arcade.armor[0];assert.ok(car&&car.alive&&Number.isFinite(car.steerPhase),'scout initializes all steering values');
  const target=g.t.spawnEnemy(car.x,Math.max(85,car.y-160),'rifle',null,'vehicle');target.hp=target.maxHp=100000;target.armorHp=0;
  for(let f=0;f<5400;f++){
    g.tick(1/60);
    assert.ok(car.alive&&s.arcade.armor.includes(car),'scout has no short expiry');
    assert.ok([car.x,car.y,car.sideVel,car.currentSpeed,car.bodyAngle,car.turretAngle].every(Number.isFinite),'scout physics stays finite for 90 seconds');
    assert.ok(car.x>=0&&car.x<=g.t.size.w&&car.y>=0&&car.y<=g.t.size.h,'scout stays visible inside battlefield');
  }
  assert.ok(car.mgBurst>0&&target.hp<target.maxHp,'scout actually fires and hits while remaining visible');
  scoutReports.push({viewport:viewport.width+'x'+viewport.height,seconds:90,shots:car.mgBurst});
  // Destruction is still possible and must leave a visible hull instead of removing the car silently.
  g.t.damageVehicle(car,100000,'he');g.tick(1/60);
  assert.ok(!car.alive&&s.wrecks.some(w=>Number.isFinite(w.x)&&Number.isFinite(w.y)&&w.vehicleId===car.vehicleId),'destroyed scout leaves a finite wreck');
}
const scoutMaps=loadGame(dir);emptyBattle(scoutMaps);
for(let idx=0;idx<40;idx++){
  const s=scoutMaps.t.state;s.levelIndex=idx;s.levelDNA=null;scoutMaps.t.buildMap();s.arcade.armor=[];s.arcade.allies=[];s.infantry=[];s.vehicles=[];s.wrecks=[];
  scoutMaps.ladder.state().bankedKills=32;scoutMaps.ladder.state().selectedLane='reinforce';scoutMaps.ladder.activate();
  const car=s.arcade.armor[0];for(let f=0;f<120;f++)scoutMaps.tick(1/60);
  assert.ok(car&&car.alive&&[car.x,car.y,car.bodyAngle].every(Number.isFinite),'scout is valid in actual map '+idx);
}

function testRound(overrides={}){return Object.assign({kind:'mg',px:20,py:300,x:370,y:300,vx:900,vy:0,damage:12,penetration:1,penetrationChance9933:.85,armorPenLevel9933:20,piercedIds:{},passedObstacles9933:{},suppressed:{},suppressionPower:1,range:2000,traveled:350,active:true},overrides);}
// Both sides of a house are independent surfaces, not one pass-through permission for the whole house.
const walls=loadGame(dir),ws=emptyBattle(walls,'hard');walls.setRandom(0);
ws.map.cover=[{kind:'building',x:195,y:300,w:70,h:68,material:'stone',integrity:5,destroyed:false}];
const wallRound=testRound();walls.t.ballistic(wallRound,true,true);
assert.equal(wallRound.penetrationTrace9936.length,2,'entry and exit walls each calculate penetration');
assert.ok(wallRound.penetrationTrace9936.every(e=>e.id.startsWith('wall:')&&e.passed),'both walls can be penetrated');
assert.ok(wallRound.penetrationTrace9936[1].chance<wallRound.penetrationTrace9936[0].chance,'second wall faces a round with less energy');
assert.ok(wallRound.damage<12&&Math.hypot(wallRound.vx,wallRound.vy)<900,'successful penetration reduces damage and speed');
const checks=wallRound.penetrationTrace9936.length;walls.t.ballistic(wallRound,true,true);assert.equal(wallRound.penetrationTrace9936.length,checks,'same passed wall is not rolled every frame');

// The same two-wall rule also runs on the real moving projectile across successive frames.
const moving=loadGame(dir),mv=emptyBattle(moving,'hard');moving.setRandom(.05);mv.save.upgrades.range=20;mv.profile=moving.t.profile();mv.profile.spreadScale=0;mv.bunker.x=210;
mv.map.cover=[{kind:'building',x:195,y:500,w:70,h:68,material:'stone',integrity:5,destroyed:false}];
const afterHouse=moving.t.spawnEnemy(210,350,'rifle',null,'vehicle');afterHouse.x=210;afterHouse.y=350;afterHouse.hp=afterHouse.maxHp=1000;
moving.t.fire('mg',210,350);const movingRound=mv.shots[0];for(let f=0;f<70;f++)moving.t.shotStep(1/60);
assert.ok(afterHouse.hp<1000,'real frame-stepped round damages a target behind both walls');
assert.equal(movingRound.penetrationTrace9936.filter(e=>e.id.startsWith('wall:')).length,2,'real projectile checks each wall once while traversing its thickness');

// One ordered segment includes soft cover, infantry, stone, metal, armor and world-solid objects.
const sequence=loadGame(dir),sq=emptyBattle(sequence,'hard');sequence.setRandom(0);
sq.map.cover=[{kind:'crate',x:50,y:300,integrity:5},{kind:'pipe',x:260,y:300,r:10,worldSolid:true,integrity:5}];
sq.map.trees=[{x:125,y:300,r:8}];sq.map.rocks=[{x:180,y:300,r:8}];
const victim=sequence.t.spawnEnemy(90,300,'rifle',null,'vehicle');victim.x=90;victim.y=300;victim.id='seq-infantry';victim.hp=victim.maxHp=1000;
const hull={id:'seq-hull',type:'scoutcar',x:215,y:300,hp:1000,maxHp:1000,armorHp:100,vehicleClass:3,vehicleSpec:{family:'spah'},alive:true};sq.vehicles=[hull];
sq.wrecks=[{wreckId:'seq-wreck',type:'truck',x:315,y:300,bodyAngle:0}];
const sequential=testRound();sequence.t.ballistic(sequential,true,true);
assert.deepEqual(Array.from(sequential.penetrationTrace9936,e=>e.id),['cover:0','infantry:seq-infantry','tree:0','rock:0','vehicle:seq-hull','cover:1','wreck:seq-wreck'],'bullet uses physical contact order across all object categories');
assert.ok(sequential.penetrationTrace9936.every(e=>e.passed&&e.chance>0&&e.chance<=.85),'every material is eligible, with at most 85 percent per check');
assert.ok(victim.hp<1000&&hull.armorHp<100&&hull.hp<1000,'sequential bullet damages infantry and vehicle behind earlier cover');

// No hard count limit: a lucky round can traverse eight separate objects, losing energy each time.
const many=loadGame(dir),ms=emptyBattle(many,'hard');many.setRandom(0);
ms.map.cover=Array.from({length:8},(_,i)=>({kind:'crate',x:40+i*40,y:300,integrity:5}));
const longRound=testRound();many.t.ballistic(longRound,true,true);
assert.equal(longRound.penetrationTrace9936.length,8,'no fixed one-to-six-target cap remains');assert.ok(longRound.active,'a round with energy continues after the eighth object');
assert.ok(longRound.penetrationTrace9936.every((e,i,a)=>i===0||e.chance<a[i-1].chance),'every passage reduces the next chance');

// Stop at the first failed surface; actors in front of it receive their hit first.
const ordered=loadGame(dir),os=emptyBattle(ordered,'hard');ordered.setRandom(.99);
const front=ordered.t.spawnEnemy(70,300,'rifle',null,'vehicle'),back=ordered.t.spawnEnemy(300,300,'rifle',null,'vehicle');
for(const [e,x,id] of [[front,70,'front'],[back,300,'back']]){e.x=x;e.y=300;e.id=id;e.hp=e.maxHp=1000;}
os.map.cover=[{kind:'crate',x:160,y:300,integrity:5}];const orderRound=testRound();ordered.t.ballistic(orderRound,true,true);
assert.ok(front.hp<1000&&back.hp===1000,'a later wall cannot absorb a hit meant for a soldier in front');
assert.equal(orderRound.penetrationTrace9936.length,1,'first failed target stops checks behind it');
const stopped=loadGame(dir),st=emptyBattle(stopped,'hard');stopped.setRandom(.99);st.map.cover=[{kind:'building',x:180,y:300,w:60,h:60,material:'stone',integrity:5}];
const protectedEnemy=stopped.t.spawnEnemy(300,300,'rifle',null,'vehicle');protectedEnemy.x=300;protectedEnemy.y=300;protectedEnemy.hp=protectedEnemy.maxHp=1000;
const stopRound=testRound();stopped.t.ballistic(stopRound,true,true);assert.ok(!stopRound.active&&protectedEnemy.hp===1000,'failed entry-wall roll protects everything behind it');
assert.equal(stopRound.penetrationTrace9936.length,1,'failed entry never reaches an exit-wall check');
// Even an invalid 100% input cannot bypass the 85% maximum.
const cap=loadGame(dir);emptyBattle(cap);cap.setRandom(.86);const capped=testRound({penetrationChance9933:1});assert.ok(!cap.t.penetrate(capped,'cap','wood'));assert.equal(capped.penetrationTrace9936[0].chance,.85);
console.log(JSON.stringify({v36:{scout:scoutReports,scoutMaps:40,wallChecks:wallRound.penetrationTrace9936.length,orderedContacts:sequential.penetrationTrace9936.map(e=>e.id),chainObjects:longRound.penetrationTrace9936.length,maximumPenetration:.85}}));
console.log('PASS: scout remains visible and fights for 90 seconds; 40-map scout geometry; ordered per-surface penetration, independent entry/exit walls, all obstacle materials, energy loss, first-failure stop and 85% cap.');

{
// Penetrating gunfire can now ignite vehicles, but only after a slowly spreading leak and further hits.
const fuel=loadGame(dir),fs37=emptyBattle(fuel,'hard');fuel.setRandom(.2);fuel.t.spawnVehicle('trooptruck',1,'blitz_1',0,0);
const burning=fs37.vehicles[0];burning.x=195;burning.y=300;burning.hp=burning.maxHp=1000;burning.armorHp=0;burning.vehicleClass=1;burning.passengers=burning.unloadLeft=0;burning.state='driverless9935';burning.driverHit=true;
for(let i=0;i<18;i++)fuel.t.vehicleHit(burning,{...crewShot(burning),y:burning.y-10});
assert.ok(burning.fuelLeak&&burning.alive&&!burning.fuelIgnited,'even many instantaneous hits must first create an unignited leak');const oilStart=burning.oilRadius;
for(let f=0;f<100;f++){fs37.time+=1/60;fuel.t.vehicleStep(1/60);}
assert.ok(burning.oilRadius>oilStart+.8&&burning.oilRadius<oilStart+1.1,'oil pool visibly spreads before early gunfire ignition');assert.ok(!burning.fuelIgnited,'a leak does not ignite without subsequent gunfire');
for(let i=0;i<20&&!burning.fuelIgnited;i++)fuel.t.vehicleHit(burning,{...crewShot(burning),y:burning.y-10});
assert.ok(burning.fuelIgnited&&burning.alive&&burning.fuelBurnT>.1,'actual penetrating bullet impacts start a vehicle explosion after only 1.67 seconds');
const burnDuration=burning.fuelBurnT;for(let f=0;f<Math.floor((burnDuration-.2)*60);f++){fs37.time+=1/60;fuel.t.vehicleStep(1/60);}
assert.ok(burning.alive,'burning vehicle stays visible until its fuel cook-off');assert.ok(fs37.effects.some(e=>e.type==='flame')||fs37.effects.some(e=>e.type==='smoke'),'fire produces visible particles');
for(let f=0;f<30;f++){fs37.time+=1/60;fuel.t.vehicleStep(1/60);}
assert.ok(!burning.alive&&fs37.wrecks.length>0,'sustained gunfire can ultimately destroy the hull through fuel ignition');assert.equal(fs37.stats.vehicleKills,1);
console.log('PASS: staged gunfire fuel leak and ignition retained.');
}

{
// Real gestures must fire immediately on release and never start delayed/automatic fire.
const controls=[];
for(const viewport of [{width:320,height:844},{width:390,height:844},{width:844,height:390}]){
  const g=loadGame(dir,viewport),s=emptyBattle(g,'hard'),x=viewport.width*.5,y=viewport.height*.4;
  g.pointer('pointerdown',x,y);g.clock(60);g.pointer('pointerup',x,y);
  assert.equal(s.stats.shots,1,'manual tap fires on the release frame, without acquisition delay');assert.equal(s.primaryAmmo,s.profile.primaryMag-1);
  for(let f=0;f<150;f++)g.playerTick(1/60);assert.equal(s.stats.shots,5,'one tap fires exactly five rounds and stops');
  g.pointer('pointerdown',x+20,y);g.clock(60);g.pointer('pointerup',x+20,y);assert.equal(s.stats.shots,6,'retargeting also fires its first round immediately');for(let f=0;f<60;f++)g.playerTick(1/60);assert.equal(s.stats.shots,10);
  g.pointer('pointerdown',x,y+20);g.clock(400);g.pointer('pointerup',x,y+20);
  assert.equal(s.stats.shots,11,'held grenade launches on release without the extra 1.5 seconds');assert.equal(s.shots.filter(b=>b.kind==='he').length,1);
  for(let f=0;f<120;f++)g.playerTick(1/60);assert.equal(s.stats.shots,11,'no queued mortar or MG command remains');
  g.pointer('pointerdown',x,y);g.clock(500);g.pointer('pointercancel',x,y);for(let f=0;f<60;f++)g.playerTick(1/60);assert.equal(s.stats.shots,11,'cancelled input cannot fire');
  controls.push({viewport:viewport.width+'x'+viewport.height,tapDelay:0,grenadeExtraDelay:0});
}
const faces=loadGame(dir),state=emptyBattle(faces,'hard'),soldier=faces.t.spawnEnemy(195,300,'rifle',null,'vehicle');
assert.deepEqual(Object.keys(faces.t.faces).sort(),['afraid','angry','calm','determined','exhausted','pain','relieved','surprised','worried']);
assert.equal(new Set(Object.values(faces.t.faces).map(p=>p.join(''))).size,9,'all nine pixel patterns differ');
assert.ok(Object.values(faces.t.faces).every(p=>p.length===9&&p.every(row=>row.length===9)),'faces use actual 9-by-9 pixel grids');
soldier.tactic='direct';soldier.aggressive=0;soldier.state='advance';soldier.suppression=0;soldier.muzzle=0;assert.equal(faces.t.emotion(soldier),'calm');
soldier.muzzle=.1;assert.equal(faces.t.emotion(soldier),'angry');soldier.muzzle=0;soldier.suppression=.8;assert.equal(faces.t.emotion(soldier),'afraid');
soldier.suppression=0;soldier.wounded=true;assert.equal(faces.t.emotion(soldier),'pain');soldier.wounded=false;soldier.reliefUntil9938=state.time+3;assert.equal(faces.t.emotion(soldier),'relieved');faces.t.render();

soldier.reliefUntil9938=0;soldier.state='parachuting';assert.equal(faces.t.emotion(soldier),'surprised');
soldier.state='advance';soldier.hp=soldier.maxHp*.4;assert.equal(faces.t.emotion(soldier),'exhausted');
soldier.hp=soldier.maxHp;soldier.morale=.4;assert.equal(faces.t.emotion(soldier),'worried');
soldier.morale=1;soldier.tactic='flankLeft';assert.equal(faces.t.emotion(soldier),'determined');

// Lethal blasts actually detach parts, leave a visibly incomplete corpse, then settle and expire.
const gore=loadGame(dir),gs38=emptyBattle(gore,'hard');gore.setRandom(.2);
const victim=gore.t.spawnEnemy(195,300,'rifle',null,'vehicle');victim.hp=1;gore.t.damageInfantry(victim,1000,'he');
assert.ok(!victim.alive&&Object.keys(victim.severed9938).length>=1&&gs38.goreParts9938.length>=1,'explosive death detaches actual limbs');
const part=gs38.goreParts9938[0],origin={x:part.x,y:part.y};for(let f=0;f<120;f++)gore.t.goreStep(1/60);
assert.ok(part.landed&&part.z===0&&Math.hypot(part.x-origin.x,part.y-origin.y)>5,'body part follows an arc and lands away from the body');gore.t.render();
for(let n=0;n<70;n++){const e=gore.t.spawnEnemy(50+n%10*20,250,'rifle',null,'vehicle');e.hp=1;gore.t.damageInfantry(e,1000,'he');}
assert.ok(gs38.goreParts9938.length<=36&&gs38.blood.length<=64,'gore stays inside iPhone object budgets');
for(let f=0;f<1200;f++)gore.t.goreStep(1/60);assert.equal(gs38.goreParts9938.length,0,'detached body parts expire');

// A medic restores a living critical patient to combat; death and walls cannot be healed away.
const medical=loadGame(dir),medState=emptyBattle(medical,'hard');
const medic=medical.t.spawnEnemy(180,300,'medic',null,'vehicle'),patient=medical.t.spawnEnemy(198,300,'rifle',null,'vehicle');medic.id='doctor';patient.id='patient';medic.x=180;patient.x=198;medic.y=patient.y=300;
patient.hp=patient.maxHp*.12;patient.wounded=true;patient.bleedT=10;patient.woundedCrawlT=2;patient.state='woundedCrawl';patient.suppression=.8;
for(let f=0;f<100&&patient.wounded;f++){medState.time+=1/60;medical.t.medicStep(medic,1/60);}
assert.ok(patient.alive&&!patient.wounded&&patient.hp>=patient.maxHp*.79&&patient.bleedT===0,'enemy medic stops bleeding and restores a severely wounded soldier');
assert.ok(patient.state!=='woundedCrawl'&&patient.fireCd<1&&medic.medicsSaved9938===1,'treated soldier is combat-ready instead of remaining a dying crawler');assert.equal(medical.t.emotion(patient),'relieved');
patient.alive=false;assert.equal(medical.t.medicFinish(medic,patient),false,'medics cannot resurrect dead soldiers');
patient.alive=true;patient.hp=1;patient.wounded=true;patient.x=245;assert.equal(medical.t.medicFinish(medic,patient),false,'treatment requires actual proximity');
patient.x=198;medState.map.cover=[{kind:'building',x:189,y:300,w:9,h:40,integrity:5,destroyed:false}];assert.equal(medical.t.medicFinish(medic,patient),false,'medic cannot treat through a solid wall');

const allied=loadGame(dir),as38=emptyBattle(allied,'hard'),aid=allied.t.createAlly(170,400,'medic'),wounded=allied.t.createAlly(190,400,'rifle');aid.id='ally-doc';wounded.id='ally-casualty';as38.arcade.allies=[wounded,aid];
wounded.hp=wounded.maxHp*.15;wounded.wounded=true;wounded.state='woundedCrawl';wounded.woundedCrawlT=3;wounded.bleedT=8;wounded.suppression=.7;
for(let f=0;f<180&&wounded.wounded;f++)allied.tick(1/60);
assert.ok(wounded.alive&&!wounded.wounded&&wounded.hp>=wounded.maxHp*.79,'actual allied AI rescues a crawling casualty');assert.equal(aid.medicsSaved9938,1);assert.ok(aid.maxHp>wounded.maxHp*1.15,'medics have a meaningful HP advantage');
const durability=loadGame(dir),ds38=emptyBattle(durability,'hard');const d=durability.t.spawnEnemy(100,300,'medic',null,'vehicle'),r=durability.t.spawnEnemy(250,300,'rifle',null,'vehicle');
assert.ok(d.maxHp>=r.maxHp*1.24,'enemy medic also has more health');d.hp=d.maxHp=100;r.hp=r.maxHp=100;d.armorHp=r.armorHp=0;d.state=r.state='advance';durability.setRandom(.99);
durability.t.damageInfantry(d,10,'mg');durability.t.damageInfantry(r,10,'mg');assert.ok(100-d.hp<100-r.hp,'medic has modest bullet resistance without invulnerability');
for(const tier of [2,3]){const g=loadGame(dir);emptyBattle(g);g.ladder.state().bankedKills=tier*8;g.ladder.state().selectedLane='reinforce';g.ladder.activate();assert.ok(g.t.state.arcade.allies.some(u=>u.role==='medic'),'reinforcement tier '+tier+' reliably includes a medic');}
console.log(JSON.stringify({v38:{manual:controls,emotions:Object.keys(faces.t.faces),detachedParts:Object.keys(victim.severed9938).length,enemySaved:medic.medicsSaved9938,alliedSaved:aid.medicsSaved9938,medicHp:aid.maxHp,rifleHp:wounded.maxHp}}));
console.log('PASS: immediate manual input, nine distinct pixel emotions, detached-limb physics and budgets, enemy/allied medic rescue, treatment range/walls, durability and medic reinforcements.');
}

// Compare campaign tuning with the published predecessor, across all maps and modes.
const previousDir=path.join(path.dirname(dir),'v9_9_38');
const old39=loadGame(previousDir),new39=loadGame(dir);let tuningCases=0;
for(const mode of ['easy','random','hard']){
  emptyBattle(old39,mode);emptyBattle(new39,mode);
  for(let i=0;i<40;i++)new39.t.levels[i].code=old39.t.levels[i].code; // Hold random terrain DNA fixed when comparing tuning.
  for(let idx=0;idx<40;idx++){
    old39.t.state.levelIndex=idx;new39.t.state.levelIndex=idx;
    const before=old39.t.enemyProfile(idx),after=new39.t.enemyProfile(idx);
    assert.ok(Math.abs(after.infantryHp-Math.min(5.4,before.infantryHp*1.55))<1e-9,'new bounded infantry durability on every map and mode');
    assert.ok(Math.abs(after.vehicleHp/before.vehicleHp-1.45)<1e-9,'new vehicle durability on every map and mode');
    assert.ok(Math.abs(after.vehicleSpeed/before.vehicleSpeed-1.15)<1e-9,'15% vehicle speed on every map and mode');
    assert.equal(after.infantryDamage,before.infantryDamage);tuningCases++;
  }
}
function gunRun39(g){
  const s=emptyBattle(g,'hard');g.setRandom(.5);s.levelIndex=10;s.enemyProfile=g.t.enemyProfile(10);
  g.t.spawnVehicle('scoutcar',0);const v=s.vehicles[0];v.hasMG=true;v.fireCd=0;v.mgBurst=0;v.state='road';v.turretAngle=Math.PI/2;
  for(let f=0;f<1200;f++){s.dtForVehicle=1/60;g.t.vehicleGun(v,{error:0,settled:true});}
  return {shots:s.enemyShots.length,speed:v.speed,accel:v.accel,hp:v.maxHp};
}
const oldGun39=gunRun39(old39),newGun39=gunRun39(new39);
assert.ok(newGun39.shots>oldGun39.shots*1.25,'armed vehicles actually fire at least 25% more shots over 20 seconds');
assert.ok(newGun39.speed>oldGun39.speed*1.149&&newGun39.accel>oldGun39.accel*1.119,'spawned vehicles receive speed and acceleration increase');
const oldAlly39=old39.t.createAlly(190,500,'rifle'),newAlly39=new39.t.createAlly(190,500,'rifle');
assert.ok(Math.abs(oldAlly39.maxHp-newAlly39.maxHp)<1e-8,'enemy health increase does not accidentally buff allied infantry');
console.log(JSON.stringify({v39:{campaignCases:tuningCases,vehicleBefore:oldGun39,vehicleAfter:newGun39}}));
console.log('PASS: nine larger dynamic emotions; all-map difficulty tuning, faster vehicle acceleration and actual sustained vehicle fire.');

// V40: actual small-arms survival, deliberate cover and independent vehicle damage.
const v40=loadGame(dir),v40s=emptyBattle(v40,'hard');v40.setRandom(.99);
const prior40=loadGame(path.join(path.dirname(dir),'v9_9_39'));emptyBattle(prior40,'hard');prior40.setRandom(.99);
function countRifleHits40(g){const e=g.t.spawnEnemy(140,350,'rifle',null,'vehicle');e.armorHp=0;e.state='advance';let hits=0;while(e.alive&&hits<40){g.t.damageInfantry(e,12,'mg');hits++;}return hits;}
const hitsBefore40=countRifleHits40(prior40),hitsAfter40=countRifleHits40(v40);assert.ok(hitsAfter40>hitsBefore40,'new enemy actually survives more direct MG hits');
v40s.infantry=[];v40s.bunker.y=630;v40s.map.cover=[{id:'cover-v40',kind:'sandbag',x:180,y:385,r:9,integrity:5,destroyed:false}];
const cautious40=v40.t.spawnEnemy(145,355,'rifle',null,'vehicle');cautious40.hp=cautious40.maxHp=1000;cautious40.state='fire';cautious40.stateT=.6;
v40.t.underFire(cautious40,195,700,.5);assert.ok(v40.t.pickCover(cautious40),'incoming fire has reachable usable cover');
for(let f=0;f<130;f++){v40s.time+=1/60;v40.t.enemyStep(1/60);}
assert.ok(cautious40.cover&&cautious40.state==='cover'&&cautious40.y<385,'enemy reaches the protected side of the sandbags');
assert.ok(cautious40.coverT>=2.4,'cover is held for several seconds');const coverHp40=cautious40.hp;v40.t.damageInfantry(cautious40,10,'mg');assert.ok(coverHp40-cautious40.hp<6,'real cover reduces incoming small-arms damage');assert.ok(v40s.enemyShots.length>0,'covering enemy still fires');
const components40=loadGame(dir),cs40=emptyBattle(components40,'hard');components40.setRandom(.5);
function componentTruck40(){components40.t.spawnVehicle('trooptruck',8,'blitz_1',0,8);const v=cs40.vehicles.at(-1);v.x=195;v.y=300;v.state='road';v.currentSpeed=v.speed;return v;}
const tire40=componentTruck40(),base40=tire40.speed;for(let i=0;i<2;i++)components40.t.component(tire40,{x:190,y:300},'tire');components40.t.componentStep(tire40,.1);assert.ok(tire40.speed<=base40*.31&&tire40.currentSpeed<=tire40.speed,'flat tyre makes the actual vehicle very slow');
const steam40=componentTruck40();for(let i=0;i<3;i++)components40.t.component(steam40,{x:195,y:310},'radiator');components40.t.componentStep(steam40,.2);assert.ok(steam40.radiatorBroken9940&&!steam40.fuelIgnited&&cs40.effects.some(e=>e.type==='radiatorSteam9940'),'radiator produces white steam without fuel fire');
const glass40=componentTruck40();for(let i=0;i<2;i++)components40.t.component(glass40,{x:195,y:305},'glass');const glassX40=glass40.x;cs40.time=.4;components40.t.componentStep(glass40,.2);assert.ok(glass40.windowBroken&&Math.abs(glass40.x-glassX40)>0,'shattered glass visibly disturbs steering');
const crew40=componentTruck40(),crewBefore40=cs40.infantry.length;for(let i=0;i<3;i++)components40.t.component(crew40,{x:195,y:295},'body');assert.equal(cs40.infantry.length,crewBefore40+1,'body hits eject a real living passenger');assert.equal(crew40.passengers,7,'ejection consumes one passenger, preventing duplicated crew');
const frame40=componentTruck40(),frameHp40=frame40.hp,frameSpeed40=frame40.currentSpeed;for(let i=0;i<3;i++)components40.t.component(frame40,{x:195,y:300},'frame');assert.ok(frame40.frameJolt9940>0&&frame40.currentSpeed<frameSpeed40&&frame40.hp===frameHp40,'frame strike causes a bump, not arbitrary fuel damage');
for(const id of ['blitz_1','r75_1','kubel_2','horch_2','spah_3','sdkfz250_3','quad_2']){
  const g=loadGame(dir),s=emptyBattle(g,'hard');g.setRandom(.5);g.t.spawnVehicle('jeep',0,id,0,0);const v=s.vehicles[0];v.x=195;v.y=300;v.passengers=v.unloadLeft=0;
  const grenade={kind:'he',px:195,py:310,x:195,y:300,vx:0,vy:-315,z:0,damage:99999,radius:40,blastDamage:99999,specialEffect:'blast',visual:0,active:true};
  g.t.resolveHE(grenade);assert.ok(v.alive&&v.grenadeHits9940===1,'even an upgraded direct grenade leaves '+id+' standing');
  g.t.grenadeImpact(195,300,grenade);assert.equal(v.grenadeHits9940,1,'direct collision and explosion count as the same grenade');
  g.t.grenadeImpact(195,300,{kind:'he',radius:21,damage:72,blastDamage:38,specialEffect:'blast',visual:0});assert.ok(!v.alive,'second well-placed grenade destroys '+id);assert.equal(s.stats.vehicleKills,1,'one vehicle kill credit for '+id);
}
const historical40=loadGame(dir),hs40=emptyBattle(historical40,'hard'),families40=new Set(),plans40=new Set();
for(let i=0;i<40;i++){
  hs40.levelIndex=i;hs40.levelDNA=null;const profile=historical40.t.supportProfile(),plan=historical40.t.plan();
  assert.ok(!plan.some(e=>e.type==='heli'),'no helicopter attacks on map '+(i+1));
  assert.ok(!/Apache|AH-64|Tiger|napalm|precision/i.test(Object.values(profile).join(' ')),'period allied support on map '+(i+1));
  if(profile.year<1943)assert.ok(!profile.plane.includes('P-47'),'P-47 not sent before combat debut');
  if(profile.barrage.includes('Katyusha'))assert.ok(profile.east&&profile.year>=1941,'Katyusha only where introduced and on the Eastern Front');
  for(const e of plan)if(e.vehicleId)families40.add(e.vehicleId.split('_')[0]);
  plans40.add(plan.map(e=>[e.type,e.vehicleId,e.tactic,Math.round(e.t*10),e.passengersOverride,e.count].join(':')).join('|'));
}
assert.ok(families40.has('r75')&&families40.has('quad')&&families40.has('cavalry')&&families40.size>=8,'campaign actually schedules bikes, Kettenkrad, cavalry and varied vehicle families');assert.ok(plans40.size>=35,'campaign plans vary composition, timings and tactics');
click(historical40,'upgradeTestMode');click(historical40,'testTheater9940');assert.ok(historical40.t.supportProfile().plane.includes('P-47'));click(historical40,'testTheater9940');assert.ok(historical40.t.supportProfile().barrage.includes('Katyusha'));
for(let i=0;i<5;i++)click(historical40,'addTestKills9931');click(historical40,'jbdLane_strike_925');assert.equal(historical40.ladder.state().markers.filter(m=>m.kind==='katyusha9940').length,16,'Eastern Front test mode activates a real Katyusha salvo');
console.log(JSON.stringify({v40:{mgHitsBefore:hitsBefore40,mgHitsAfter:hitsAfter40,vehicleFamilies:[...families40],distinctPlans:plans40.size,tyreSpeedRatio:tire40.speed/base40}}));
console.log('PASS: tactical cover and durability, separate tyre/radiator/window/body/frame effects, two-grenade destruction without double damage, 40-map variety and era-aware historical support.');

const horse40=loadGame(dir),h40s=emptyBattle(horse40,'hard');horse40.t.spawnVehicle('jeep',1,'cavalry_1',0,0);const mount40=h40s.vehicles[0];mount40.passengers=0;for(let i=0;i<40&&mount40.alive;i++)horse40.t.vehicleHit(mount40,crewShot(mount40));assert.ok(!mount40.alive,'mounted cavalry remains killable by ordinary gunfire');

for(const [id,family] of [['r75_1','motorcycle'],['quad_1','quad'],['cavalry_1','cavalry'],['kubel_1','kubel'],['horch_1','horch'],['spah_1','spah'],['blitz_1','blitz'],['steyr_1','steyr'],['sdkfz250_1','sdkfz250']]){const g=loadGame(dir),s=emptyBattle(g,'hard');g.t.spawnVehicle('jeep',0,id,0,0);assert.equal(s.vehicles[0].vehicleSpec.family,family,'actual spawn preserves '+id+' rather than replacing it with a truck');}

// V41: firing cadence, support budget, harder ignition and staged rescue behavior.
const start41=loadGame(dir),st41=emptyBattle(start41,'hard');
assert.equal(st41.profile.primaryMag,40,'starting MG has a smaller 40-round magazine');assert.ok(Math.abs(st41.profile.primaryCycle-60/900)<1e-9,'starting MG permits MG34 cyclic speed of 900 rpm');
const cfg41=start41.t.supportNumbers;assert.equal(cfg41.strafe.rounds,64);assert.ok(cfg41.strafe.rounds*cfg41.strafe.infantry>cfg41.bomber.rounds*cfg41.bomber.infantry*2,'MG run has a meaningful precision damage budget');
function burnFixture41(mode,crew=0){
 const g=loadGame(dir),s=emptyBattle(g,'hard');g.setRandom(.5);g.t.spawnVehicle('trooptruck',crew,'blitz_1',0,crew);const v=s.vehicles[0];v.x=195;v.y=400;v.passengers=v.unloadLeft=crew;v.driverHit=crew===0;v.state='driverless9935';v.hasMG=false;
 g.t.ignite(v,9);v.burnPlan9941=mode;v.firstPopAt9941=.3;v.secondPopAt9941=5;v.fuelBurnT=mode==='instant'?1:mode==='single'?12:16;v.fuelBurnDuration9937=v.fuelBurnT;
 return{g,s,v};
}
function burnTick41(f,dt=1/60,people=false){f.g.clock(dt*1000);f.s.time+=dt;f.s.levelTime+=dt;if(people){f.g.t.enemyStep(dt);f.g.t.allyStep(dt);}f.g.t.vehicleStep(dt);f.g.t.fireStep(dt);f.g.t.effectsStep(dt);}
const fireModes41=[];
for(const mode of ['instant','single','ammo']){
 const f=burnFixture41(mode),observer=f.g.t.spawnEnemy(245,400,'rifle',null,'vehicle');observer.hp=observer.maxHp=10000;observer.armorHp=0;
 for(let frame=0;frame<1800;frame++)burnTick41(f);
 assert.ok(!f.v.alive&&f.s.wrecks.length===1,mode+' burn finishes once');assert.equal(f.s.stats.vehicleKills,1,mode+' burn grants one vehicle credit');
 assert.equal(f.v.popCount9941,mode==='instant'?0:1,mode+' uses the selected number of small pops');
 if(mode!=='instant')assert.ok(f.s.wrecks[0].burntOut9941,'staged fire ends as a burned-out hull');
 fireModes41.push({mode,pops:f.v.popCount9941,collateral:10000-observer.hp});
}
assert.ok(fireModes41[0].collateral>fireModes41[1].collateral+20&&fireModes41[0].collateral>fireModes41[2].collateral+20,'single full explosion has the largest surrounding damage');
const spill41=burnFixture41('single');for(let i=0;i<60;i++)burnTick41(spill41);
assert.ok(spill41.s.spilledFuel9941.length===2,'light fire spills visible fuel');
const hardFuel41=loadGame(dir),hf41=emptyBattle(hardFuel41,'hard');hardFuel41.t.spawnVehicle('trooptruck',0,'blitz_1',0,0);const hv41=hf41.vehicles[0];hardFuel41.setRandom(.99);
for(let i=0;i<4;i++)hardFuel41.t.gunFuel(hv41,1);assert.ok(hv41.fuelLeak&&!hv41.fuelIgnited,'many fuel-component penetrations make a leak first');
for(let i=0;i<80;i++)hardFuel41.t.gunFuel(hv41,1);assert.ok(!hv41.fuelIgnited,'instantaneous gunfire never skips the leak aging gate');
hf41.time+=1.6;hv41.oilRadius=5;for(let i=0;i<3;i++)hardFuel41.t.gunFuel(hv41,1);assert.ok(!hv41.fuelIgnited,'even an aged leak takes further sparks when probability fails');hardFuel41.t.gunFuel(hv41,1);assert.ok(hv41.fuelIgnited,'continued penetrating fuel hits can still ignite');

// Actual enemy and allied medics approach, extract, drag to safety and treat a living crew casualty.
const rescueCases41=[];
for(const alliedSide of [false,true]){
 const f=burnFixture41('single',6);f.v.fuelBurnT=24;
 if(alliedSide){f.s.vehicles=[];f.v.allied=true;f.v.team='allied';f.v.crewOut=false;f.v.driverHit=false;f.s.arcade.armor=[f.v];}
 let medic=alliedSide?f.g.t.createAlly(155,350,'medic'):f.g.t.spawnEnemy(155,350,'medic',{id:'rescue-squad',tactic:'direct',size:1,slot:0,faction:'wehrmacht'},'vehicle');
 if(alliedSide)f.s.arcade.allies.push(medic);medic.hp=medic.maxHp=100;
 let sawTrapped=false,sawDragging=false,escaped=false,patient=null;
 for(let frame=0;frame<1200;frame++){
   burnTick41(f,1/60,true);const pool=alliedSide?f.s.arcade.allies:f.s.infantry;
   if(f.v.trappedCasualties9941&&f.v.trappedCasualties9941.length){sawTrapped=true;patient=f.v.trappedCasualties9941[0];}
   sawDragging=sawDragging||pool.some(p=>!!p.draggedBy9941);
   escaped=escaped||pool.some(p=>p!==medic&&p.alive&&!p.wounded&&Math.hypot(p.x-f.v.x,p.y-f.v.y)>65);
   if(pool.some(m=>m.vehicleRescues9941>0)){patient=pool.find(p=>p.alive&&!p.wounded&&p.medicRecoveries9938>0);break;}
 }
 assert.ok(sawTrapped&&sawDragging,'crew extraction includes a real trapped and dragged patient on '+alliedSide);
 assert.ok((alliedSide?f.s.arcade.allies:f.s.infantry).some(m=>m.vehicleRescues9941>=1)&&patient&&patient.alive&&!patient.trappedVehicle9941,'a medic brings living crew out of a lightly burning hull on '+alliedSide);
 assert.ok(patient.hp>=patient.maxHp*.79&&!patient.wounded,'extracted crew receive treatment after reaching safety');assert.ok(escaped,'healthy crew run away from the vehicle');
 rescueCases41.push({allied:alliedSide,rescued:medic.vehicleRescues9941,patientHp:patient.hp});
}
const notice41=loadGame(dir),ns41=emptyBattle(notice41,'hard');notice41.t.spawnVehicle('trooptruck',0,'blitz_1',0,0);const nv41=ns41.vehicles[0];
for(const component of ['tire','radiator','glass','fuel','body','frame']){notice41.t.component(nv41,{x:nv41.x,y:nv41.y},component);assert.ok(nv41.damageNotices9941.some(n=>n.kind===component&&n.until>ns41.time),'legible feedback identifies '+component);notice41.t.drawFeedback(nv41,false);}
console.log(JSON.stringify({v41:{startingMagazine:st41.profile.primaryMag,startingRPM:Math.round(60/st41.profile.primaryCycle),fireModes:fireModes41,rescues:rescueCases41}}));
console.log('PASS: support damage budgets, faster/larger starting MG, harder fuel ignition, one/two small pops versus full blast, fuel spreading and ignition, fleeing crew, enemy/allied extraction and clear component feedback.');

// Trapped patients cannot be healed through the hull, and a failed drag never teleports them back.
const failed41=burnFixture41('single',6);for(let f=0;f<30;f++)burnTick41(failed41);const casualty41=failed41.v.trappedCasualties9941[0];const rescuer41=failed41.g.t.spawnEnemy(casualty41.x-5,casualty41.y,'medic',{id:'negative-aid',faction:'wehrmacht'},'vehicle');assert.equal(failed41.g.t.medicFinish(rescuer41,casualty41),false,'crew must be extracted before ordinary treatment');
casualty41.x=140;casualty41.y=355;casualty41.draggedBy9941=rescuer41;rescuer41.alive=false;const dropPosition41={x:casualty41.x,y:casualty41.y};failed41.s.time+=1/60;failed41.g.t.enemyStep(1/60);assert.ok(!casualty41.trappedVehicle9941&&Math.hypot(casualty41.x-dropPosition41.x,casualty41.y-dropPosition41.y)<2,'dead rescuer leaves patient at the actual drop position');

const cadence41=[];
for(const mode of ['easy','random','hard']){const g=loadGame(dir),s=emptyBattle(g,mode);g.setRandom(.5);s.levelIndex=19;s.levelDNA=null;g.ladder.state().bankedKills=32;g.ladder.state().selectedLane='reinforce';g.ladder.activate();const v=s.arcade.armor[0];v.x=195;v.y=520;v.turretAngle=-Math.PI/2;v.turretTarget=-Math.PI/2;const e=g.t.spawnEnemy(195,350,'rifle',null,'vehicle');e.hp=e.maxHp=100000;e.x=195;e.y=350;for(let f=0;f<180;f++){s.time+=1/60;g.t.allyStep(1/60);}cadence41.push(v.mgBurst);}
assert.ok(cadence41.every(n=>n===cadence41[0]&&n>5),'allied vehicle rate of fire stays consistent across difficulty modes');
console.log('PASS: allied vehicle firing cadence is independent of enemy difficulty.',cadence41);

const interrupted41=burnFixture41('single',6);for(let i=0;i<30;i++)burnTick41(interrupted41);for(let i=0;i<2;i++)interrupted41.g.t.grenadeImpact(195,400,{kind:'he',radius:21,damage:72,blastDamage:38,specialEffect:'blast',visual:0});assert.ok(!interrupted41.v.alive&&!interrupted41.v.fuelIgnited&&interrupted41.v.burnPhase9941==='destroyed','grenade destruction ends a staged burn without leaving an active source');assert.ok(interrupted41.v.trappedCasualties9941.every(p=>!p.alive||!p.trappedVehicle9941),'survivors are not pinned to a destroyed burn source');

// V42: solo level openings, modest allied cadence reduction, gunfire-only early ignition,
// and the actual default timelines (not only forced deterministic burn fixtures).
for(const mode of ['easy','hard']){
 const g=loadGame(dir);g.t.start(mode);const s=g.t.state;
 for(let i=0;i<40;i++){
  s.levelIndex=i;g.t.reset();
  assert.equal(s.arcade.allies.length,0,mode+' level '+(i+1)+' starts alone');
  for(let f=0;f<120;f++)g.t.step(1/60);
  assert.equal(s.arcade.allies.length,0,mode+' level '+(i+1)+' has no delayed free troops');
 }
 const support=g.ladder.state();support.bankedKills=8;support.selectedLane='reinforce';g.ladder.activate();
 assert.equal(s.arcade.allies.length,3,'earned first reinforcement still deploys three soldiers');
}
const prior42=combatReport(path.join(dir,'../v9_9_41')),now42=combatReport(dir);
assert.ok(now42.shots<prior42.shots*.96&&now42.shots>prior42.shots*.75,'allied cadence is modestly reduced versus V41');
assert.equal(now42.missingAudio,0,'each allied shot still has audio');
const gun42=loadGame(dir),gs42=emptyBattle(gun42,'hard');
assert.equal(gs42.profile.primaryMag,40);assert.equal(gs42.profile.primaryBaseReload,2.5);
assert.ok(Math.abs(60/gs42.profile.primaryCycle-900)<1e-8);
for(const [roll,plan] of [[.1,'instant'],[.4,'single'],[.8,'ammo']]){
 const g=loadGame(dir),s=emptyBattle(g,'hard');g.t.spawnVehicle('trooptruck',0,'blitz_1',0,0);const v=s.vehicles[0];g.setRandom(roll);g.t.ignite(v,99);
 assert.equal(v.burnPlan9941,plan);assert.ok(v.firstPopAt9941<=.3);
 if(plan==='instant')assert.ok(v.fuelBurnT<=.35);
 if(plan==='ammo')assert.ok(v.fuelBurnT>=15&&v.fuelBurnT<=60.3);
}
for(const type of ['scoutcar','trooptruck','halftrack']){
 const g=loadGame(dir),s=emptyBattle(g,'hard');g.t.spawnVehicle(type,0);const v=s.vehicles[0];g.setRandom(.99);
 let hits=0;while(!v.fuelLeak&&hits<10){g.t.gunFuel(v,1);hits++;}
 assert.ok(v.fuelLeak&&hits<=5,'few penetrating fuel-component hits start '+type+' leak');
 // Actual growth and clock; no grenade and no artificial oil-radius boost.
 for(let f=0;f<100;f++){s.time+=1/60;g.t.vehicleStep(1/60);}
 for(let i=0;i<8&&!v.fuelIgnited;i++)g.t.gunFuel(v,1);
 assert.ok(v.fuelIgnited,'gunfire alone ignites '+type+' after a short visible leak');
 assert.ok(v.firstPopAt9941<=.6);
}
console.log(JSON.stringify({v42:{mapsStartingSolo:80,alliedShotsV41:prior42.shots,alliedShotsV42:now42.shots,magazine:40,rpm:900,baseReload:2.5,bulletOnlyIgnition:true}}));
console.log('PASS: solo campaign openings, earned reinforcements, reduced allied cadence, MG34 cycle and faster bullet-only vehicle fire.');
