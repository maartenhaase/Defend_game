'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');

function loadGame(directory,viewport={width:390,height:844}){
  let source=fs.readFileSync(path.join(directory,'game.js'),'utf8');
  const html=fs.readFileSync(path.join(directory,'index.html'),'utf8');
  new vm.Script(source,{filename:'game.js'});
  const ids=new Map(),audio=[],timers=[];
  let now=0,seed=9929;
  const noop=()=>{};
  const gradient={addColorStop:noop};
  const context=new Proxy({measureText:s=>({width:String(s).length*6}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,createPattern:()=>({}),getImageData:()=>({data:new Uint8ClampedArray(16)})},{get:(o,k)=>k in o?o[k]:noop});
  function node(tag){
    const n={tagName:tag.toUpperCase(),style:{},children:[],listeners:{},textContent:'',className:'',disabled:false,
      classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
      appendChild(child){this.children.push(child);child.parentNode=this;return child;},
      removeChild(child){this.children=this.children.filter(x=>x!==child);},
      remove:noop,setAttribute:noop,getAttribute:()=>null,
      addEventListener(type,fn){(this.listeners[type]||(this.listeners[type]=[])).push(fn);},
      getContext:()=>context,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),
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
  source=source.slice(0,end)+`\nglobalThis.__gameTest={get state(){return gameState;},start:startSelectedMode,step:update,allyStep:updateAlliedTeam,render:render,createAlly:createAlliedInfantry,spawnEnemy:spawnInfantry,profile:playerProfile,upgrades:UPGRADES,primaryStats:primaryStats,fire:fireWeapon,resolveMG:resolveMGHit,obstacle:primaryObstacleHit,profile:playerProfile,enemyProfile:enemyProgression,plan:buildEncounterPlan,kill:registerGunGameKill,damageBunker:damageBunker,wall:lineOfSightBlockedByWalls,audio:AudioSys,suppress:suppressAllies9930,blast:applyBlastShock,enemyFire:enemyFire,enemyStep:updateInfantry,underFire:typeof markEnemyUnderFire9932==='function'?markEnemyUnderFire9932:null,suppressEnemies:typeof suppressEnemiesFromAlly9932==='function'?suppressEnemiesFromAlly9932:null,damageInfantry:damageInfantry,fireAlly:fireAlliedInfantry9929,get size(){return {w:W,h:H};}};\n`+source.slice(end);
  source=source.replace('  buildLadderControls925();','  buildLadderControls925(); globalThis.__ladderTest={state:ladderState925,tier:ladderTier925,activate:activateSupportEvent994,update:updateSupport994,refresh:ladderRefresh925};');
  vm.createContext(env);vm.runInContext(source,env,{timeout:10000});
  return {t:env.__gameTest,ladder:env.__ladderTest,audio,ids,tick(dt){now+=dt*1000;env.__gameTest.state.time+=dt;env.__gameTest.state.levelTime+=dt;env.__gameTest.allyStep(dt);}};
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
  assert.ok(shots>0,mode+' campaign initial allied team fires with real AI and waves');
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
    assert.ok(p.infantryHp>.3&&p.infantryHp<5,'bounded infantry HP across campaign');
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
const expectedNames={strike:['Small artillery strike','Napalm bombardment','AH-64 helicopter','Heavy artillery strike','Big precision strike'],reinforce:['3 allied infantry','5-person MG command group','8 elite troopers','Armored MG scout car','Tiger tank']};
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
    if(tier<=3){assert.equal(s.arcade.allies.length,[3,5,8][tier-1]);if(tier===3)assert.ok(s.arcade.allies.every(u=>u.elite925&&u.armorHp>=6));}
    else {assert.equal(s.arcade.armor.length,1);const v=s.arcade.armor[0];assert.ok(v.allied&&v.alive&&v.hasMG);assert.equal(!!v.tiger994,tier===5);}
  }else{
    if(tier===1)assert.equal(support.markers.filter(m=>m.kind==='smallArty925').length,3);
    if(tier===2){assert.ok(support.napalmPlane925);for(let f=0;f<200;f++)g.ladder.update(1/60);assert.ok(s.fireZones.length>=5,'napalm plane drops all five bombs');}
    if(tier===3){assert.equal(support.apache925.t,12);const enemy=g.t.spawnEnemy(195,300,'rifle',null,'vehicle');enemy.hp=10000;for(let f=0;f<180;f++)g.ladder.update(1/60);assert.ok(s.arcade.tracers.some(b=>b.apache925),'helicopter fires real projectiles');for(let f=0;f<1801;f++)g.ladder.update(1/60);assert.equal(support.apache925,null,'helicopter ends after 12 seconds');}
    if(tier===4)assert.equal(support.markers.filter(m=>m.kind==='artillery').length,8);
    if(tier===5)assert.equal(support.markers.filter(m=>m.kind==='precision925').length,3);
    if([1,4,5].includes(tier)){const m=support.markers[0],enemy=g.t.spawnEnemy(m.x,m.y,'rifle',null,'vehicle');enemy.hp=enemy.maxHp=10000;g.ladder.update(1);assert.ok(enemy.hp<10000,'strike deals physical damage');}
  }
  assert.ok(g.ids.get('upgradeTestStatus9931').textContent.includes('Ingezet:'),'last activation visible');
  click(g,'resetUpgradeTest9931');assert.equal(g.ladder.state().bankedKills,0);assert.equal(g.t.state.arcade.allies.length,0);assert.equal(g.t.state.arcade.armor.length,0);assert.equal(g.ladder.state().lastLadder925,null);
  g.t.start('easy');assert.equal(g.ids.get('addTestKills9931').listeners.click.length,1);click(g,'addTestKills9931');assert.equal(g.ladder.state().bankedKills,0,'debug kills cannot be used in campaign');
  console.log('PASS upgrade: '+lane+' '+tier+' '+expectedNames[lane][tier-1]);
}

for(const width of [320,390,844]){
  const g=loadGame(dir,{width,height:844});click(g,'upgradeTestMode');click(g,'addTestKills9931');click(g,'addTestKills9931');click(g,'jbdLane_strike_925');
  for(let f=0;f<200;f++)g.ladder.update(1/60);
  assert.ok(g.t.state.fireZones.length>=5,'all five napalm bombs land at width '+width);
}
const reserve=loadGame(dir);click(reserve,'upgradeTestMode');for(let i=0;i<6;i++)click(reserve,'addTestKills9931');click(reserve,'jbdLane_reinforce_925');assert.equal(reserve.ladder.state().bankedKills,8,'top tier spends 40 and preserves remaining savings');
console.log('PASS: all ten real UI activations, test isolation/reset, 320/390/844px napalm runs and surplus kill accounting.');

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
    assert.ok((h.x-lastX)*dirX>=-.00001,'Apache never oscillates horizontally');
    assert.ok(Math.abs(h.y-lastY)<.3,'target switches cannot teleport flight height');
    lastX=h.x;lastY=h.y;frames++;
  }
  assert.ok(frames>=719&&frames<=722,'Apache departs at 12 seconds');
  assert.ok(maxDelta<1.5,'continuous flight at both viewports');
}
const oldReport=combatReport(path.join(dir,'../v9_9_31'));
assert.ok(report.shots>oldReport.shots*1.4,'allies produce substantially more gunfire');
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


// SPR unifies speed, range and projectile penetration on one persistent upgrade track.
const spr=loadGame(dir);spr.t.start('hard');const sprState=spr.t.state;
sprState.save.upgrades.range=0;const spr0=spr.t.primaryStats(0);
sprState.save.upgrades.range=12;const spr12=spr.t.primaryStats(0);
assert.ok(spr12.speed>spr0.speed*1.25,'SPR raises projectile speed');
assert.ok(spr12.rangeFactor>spr0.rangeFactor+.30,'SPR raises firing range');
assert.equal(spr12.penetration,12);assert.ok(spr12.penetrationChance>=.75,'SPR raises penetration chance');
assert.match(spr.t.upgrades.range.label,/SPR · SPEED \/ RANGE \/ PENETRATION/);

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
assert.ok(mapAudit.some(m=>m.heli>=8),'two-helicopter map now deploys a larger landing force');
assert.ok(progression.t.enemyProfile(30).infantryDamage>progression.t.enemyProfile(0).infantryDamage,'Hard combat stats rise through campaign');
console.log(JSON.stringify({spr:{speed:[spr0.speed,spr12.speed],range:[spr0.rangeFactor,spr12.rangeFactor],penetrationChance:spr12.penetrationChance},hardMaps:mapAudit}));

// Successful SPR rounds cross destructible cover and can damage armor while continuing.
const ballistics=loadGame(dir),ballState=emptyBattle(ballistics,'hard');
ballState.save.upgrades.range=12;ballState.profile=ballistics.t.profile();
let crossed=false;
for(let k=0;k<20&&!crossed;k++){
  ballState.map.cover=[{kind:'crate',sprite:'crateStack',x:195,y:300,r:8,integrity:5,destroyed:false}];
  const shot={kind:'mg',px:180,py:300,x:210,y:300,vx:900,vy:0,damage:12,penetration:12,penetrationChance9933:.78,passedObstacles9933:{},active:true};
  const blocked=ballistics.t.obstacle(shot);crossed=!blocked&&shot.penetration===11;
}
assert.ok(crossed,'a fully upgraded SPR round can penetrate a wooden crate');
let penetratedArmor=false;
for(let k=0;k<30&&!penetratedArmor;k++){
  const tank={id:'spr-tank',x:195,y:300,type:'tank',alive:true,hp:1000,maxHp:1000,armorHp:100,vehicleClass:3,vehicleSpec:{family:'tank'}};
  ballState.vehicles=[tank];
  const shot={kind:'mg',px:180,py:300,x:210,y:300,vx:900,vy:0,damage:12,penetration:12,penetrationChance9933:.78,armorPenLevel9933:12,piercedIds:{},active:true};
  const stopped=ballistics.t.resolveMG(shot);penetratedArmor=!stopped&&tank.armorHp<100&&tank.hp<1000&&shot.penetration===11;
}
assert.ok(penetratedArmor,'SPR armor penetration damages armor and the vehicle behind it while the round continues');
console.log('PASS: SPR penetrates destructible cover and damages behind armor.');
