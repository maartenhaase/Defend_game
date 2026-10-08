'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const dir=__dirname;
const js=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
new vm.Script(js,{filename:'game.js'}); // Parse entire game, not only demo
assert.match(html,/id="demoMode"/);
assert.match(html,/game\.js\?v=9820-balanced-convoys/);
assert.match(js,/demoBtn\.addEventListener\('click'/);
assert.match(js,/gameState\.startMode!=='demo'&&gameState\.eventCursor/);
assert.doesNotMatch(js,/fillRect\(u\.x-5,u\.y-15,10,2\)/);
assert.match(js,/firstFlyby\|\|Math\.random\(\)<\.32/);
assert.match(js,/createFireZone\(nx,ny/);
assert.match(js,/source:'napalm'/);
assert.match(js,/if\(n>=a\.salvageAt\)\{a\.salvageAt\+=5/);
const begin=js.indexOf('var DEMO_SCRIPT=['),end=js.indexOf('/* ---------- RESIZE / LOOP ---------- */',begin);
assert.ok(begin>0&&end>begin,'Demo code block exists');
const state={time:0,events:[{t:1}],eventCursor:0,waveTotal:0,wave:0,infantry:[],vehicles:[],air:[],battleEvent:{flybyT:0,truckT:0,artilleryT:0,pressureT:0},arcade:{allies:[{id:21,alive:true,x:250,y:350,role:'rifle'}],armor:[],forts:[]},bunker:{x:400,y:520,hp:100,maxHp:100},eff:.9,burstQueue:[],profile:{primaryMag:20}};
const calls=[];
const env={
  enemyWeaponProfile:()=>({name:'BREN',damage:1,spread:.07,cooldown:.9}),
  gameState:state,W:800,H:600,TAU:Math.PI*2,
  rand:(a,b)=>(a+b)/2,clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
  squadPlan:(n,tactic,x)=>({id:123,tactic,originX:x}),
  spawnInfantry:(x,y,role,squad,mode)=>{const e={id:1000+state.infantry.length,alive:true,x,y,role};state.infantry.push(e);return e;},
  spawnVehicle:(type,n,id)=>{state.vehicles.push({alive:true,type,vehicleId:id,speed:50,accel:30,currentSpeed:5});},
  spawnPlane:n=>calls.push('spawnPlane'),spawnHeli:n=>calls.push('spawnHeli'),
  spawnAlliedArmor:n=>state.arcade.armor.push({alive:true,type:'jeep',hp:44,maxHp:44}),
  spawnAlliedTeam:()=>state.arcade.allies.push({id:22+state.arcade.allies.length,alive:true,x:400,y:340,role:'rifle'}),
  explode:()=>calls.push('explode'),pushEffect:()=>{},arcadeFlash:()=>{},
  PRIMARY_DB:[0,1,2,3,4].map(group=>({group})),
  playerProfile:()=>({primaryMag:15,primaryName:'TEST'}),
};
vm.createContext(env);
vm.runInContext(js.slice(begin,end),env,{timeout:1000});
assert.ok(env.DEMO_SCRIPT.length>=25,'25+ distinct scripted events');
const executed=[];const orig=env.demoShowcaseAction;
env.demoShowcaseAction=function(action){executed.push(action);return orig(action);};
env.prepareDemoMap();
for(let t=0;t<=110;t+=.5){state.time=t;env.updateDemoMap(.5);}
const scheduled=Array.from(env.DEMO_SCRIPT,e=>e.action);
assert.deepEqual(executed,scheduled,'All demo milestones execute in order');
assert.equal(executed.filter(x=>x==='napalm').length,2);
assert.equal(executed.filter(x=>x==='strafe').length,2);
assert.ok(executed.includes('mg')&&executed.includes('nest'));
assert.equal(state.arcade.forts.length,1);
assert.equal(state.arcade.forts[0].stage,3);
assert.ok(calls.filter(c=>c==='spawnHeli').length>=2);
assert.ok(calls.includes('spawnPlane'));
state.time=112;env.updateDemoMap(.5);
assert.equal(state.demoShowcase.cycle,2,'Demo loops after 112 seconds');
// Integration checks for vehicle damage, six-to-ten rear dismounts and left/right infantry.
const attackEnv={W:800,H:600,TAU:Math.PI*2,safeTop:0,gameState:{map:{road:{x:400},corridorHalf:110},levelIndex:0,
  arcade:{allies:[],armor:[{id:7,alive:true,x:400,y:320,vehicleSpec:{family:'jeep'},type:'jeep'}]}},
  squadSerial:1,rand:(a,b)=>(a+b)/2,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  applyTrauma:()=>{},pointSegDist:(px,py,x1,y1,x2,y2)=>Math.hypot(px-x2,py-y2),
  vehicleBodyRadius:()=>11,damageVehicle:(v,dmg,kind)=>{v.hp=(v.hp||70)-dmg;attackEnv.lastDamage=dmg;},
  spawnInfantry:(x,y,role,squad,mode)=>{const e={x,y,role,squad,mode};attackEnv.out.push(e);return e;},
  out:[],lastDamage:0};
vm.createContext(attackEnv);
const dismountBlock=js.slice(js.indexOf('function dismountOne('),js.indexOf('function dismountDriver(',js.indexOf('function dismountOne(')));
const fireBlock=js.slice(js.indexOf('function alliedIncomingFire('),js.indexOf('function updateAlliedBullets(',js.indexOf('function alliedIncomingFire(')));
vm.runInContext(dismountBlock+'\n'+fireBlock,attackEnv,{timeout:1000});
const truck={type:'trooptruck',x:400,y:320,bodyAngle:Math.PI/2,unloadIndex:8};
for(let k=0;k<8;k++)attackEnv.dismountOne(truck,'normal',k);
assert.equal(attackEnv.out.length,8);
assert.equal(attackEnv.out.filter(e=>e.role==='officer').length,1,'exactly one truck officer');
assert.equal(attackEnv.out.filter(e=>e.squad.tactic==='flankLeft').length,4);
assert.equal(attackEnv.out.filter(e=>e.squad.tactic==='flankRight').length,4);
assert.ok(attackEnv.out.every(e=>e.y<truck.y),'all dismount from the truck rear');
attackEnv.alliedIncomingFire({x:400,y:320,px:400,py:310,vx:0,vy:100,life:1,dmg:2,kind:'vehicleMG'});
assert.ok(attackEnv.lastDamage>=9,'enemy bullet meaningfully damages allied vehicle');
assert.match(js,/mag:20,reload:2\.65,cycle:\.48,damage:9\.0,range:\.68/);
assert.match(js,/if\(transport&&\(type==='trooptruck'\|\|type==='lighttruck'\|\|type==='truck'\)/);
assert.match(js,/gameState\.bunker\.y\+rand\(8,28\)/);
assert.match(js,/gameState\.bunker\.y\+rand\(12,30\)/);
assert.match(js,/for\(var k=0;k<5;k\+\+\)/);
console.log('PASS: truck rear dismount, 1 officer, equal flanks, real Allied vehicle damage, stronger MG, southern spawns and reduced napalm.');
console.log('PASS: V9.8.2 parsed, menu wired, no blue head bars, napalm guaranteed, 29 scripted milestones executed, MG nest and demo loop verified.');
