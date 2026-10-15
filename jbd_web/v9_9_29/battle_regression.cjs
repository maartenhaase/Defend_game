'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');

function loadGame(directory){
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
  const env={console,document,navigator:{userAgent:'iPhone',maxTouchPoints:5},innerWidth:390,innerHeight:844,devicePixelRatio:2,
    location:{search:'',href:'https://example.test/game'},URLSearchParams,performance:{now:()=>now},
    Math:rng,Howl,Howler:{ctx:{state:'running',resume:()=>Promise.resolve()},volume:noop},
    getComputedStyle:()=>({paddingTop:'0px',paddingBottom:'0px',getPropertyValue:()=> '0px'}),
    localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,addEventListener:noop,
    setInterval:(fn)=>{timers.push(fn);return timers.length;},clearInterval:noop,setTimeout:()=>0,clearTimeout:noop};
  env.window=env;
  const end=source.lastIndexOf('\n})();');
  assert.ok(end>0,'game outer wrapper');
  source=source.slice(0,end)+`\nglobalThis.__gameTest={get state(){return gameState;},start:startSelectedMode,step:update,allyStep:updateAlliedTeam,render:render,createAlly:createAlliedInfantry,spawnEnemy:spawnInfantry,profile:playerProfile,enemyProfile:enemyProgression,plan:buildEncounterPlan,kill:registerGunGameKill,damageBunker:damageBunker,wall:lineOfSightBlockedByWalls,audio:AudioSys};\n`+source.slice(end);
  source=source.replace('  buildLadderControls925();','  buildLadderControls925(); globalThis.__ladderTest={state:ladderState925,tier:ladderTier925,activate:activateSupportEvent994};');
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
for(let f=0;f<1200;f++)flank.tick(1/60);
assert.ok(scout.y<844*.4,'flanker advances beyond the old frontier');
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
console.log('PASS: 60 FPS allied fire, recorded audio calls, physical damage, support thresholds, difficulty separation and house flanking.');
