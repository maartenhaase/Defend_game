'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
new vm.Script(js);
assert.match(html,/game\.js\?v=9820-balanced-convoys/);
assert.match(js,/var PRIMARY_DB=\[\{id:'field_mg'/);
assert.doesNotMatch(js,/GUN_GAME_INTERVAL/);
assert.doesNotMatch(js,/function nextGunGameIndex/);
assert.match(js,/function separateAlliedSoldier/);
assert.match(js,/if\(v\.allied\)\{\s*deployAlliedCrew/);
assert.match(js,/drawVehicle\(v,false\)/);
assert.match(js,/source:'napalm'/);
assert.match(js,/z\.source==='napalm'\?\.075/);
assert.match(js,/gameState\.save\.allyLevel/);
function get(from,to){const a=js.indexOf(from),b=js.indexOf(to,a+from.length);assert.ok(a>=0&&b>a,'Missing '+from);return js.slice(a,b);}
const gun={id:'field_mg',name:'FIELD MACHINE GUN',era:1944,cls:'light machine gun',ammo:'.30 CAL',mag:20,reload:2.65,cycle:.48,damage:9.0,range:.68,speed:660,spread:1.1,mode:'auto',projectile:'bullet',heatScale:.84};
const state={save:{upgrades:{damage:0,range:0,rate:0,magazine:0,reload:0,aiming:0},allyLevel:3},infantry:[],vehicles:[],arcade:{allies:[],armor:[]},bunker:{x:400,y:540},levelIndex:0,time:0};
const ctx={gameState:state,PRIMARY_DB:[gun],SKILL_MAX:12,W:800,H:600,TAU:Math.PI*2,
  clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),rand:(a,b)=>(a+b)/2,
  spawnInfantry(x,y,role){let e={id:11+state.infantry.length,x,y,role,hp:38,maxHp:38,speed:28,alive:true,variant:0,armorHp:14,maxArmorHp:14,weaponProfile:{name:'ENEMY'}};state.infantry.push(e);return e;},
  enemyWeaponProfile:()=>({name:'LEE-ENFIELD',damage:1,spread:.07,cooldown:.9}),
  spawnVehicle(type,n,id){state.vehicles.push({id:100,type:'scoutcar',vehicleId:id,vehicleName:'SAME AS ENEMY',vehicleSpec:{id,family:'spah',class:2},vehicleClass:2,hp:133,maxHp:133,armorHp:55,maxArmorHp:55,alive:true,speed:76,accel:80,turnRate:2.2,currentSpeed:20,mgBurst:0,hasMG:true});},
  arcadeFlash(){},
};
vm.createContext(ctx);
vm.runInContext(get('function primaryStats(','function specialStats('),ctx);
const start=ctx.primaryStats(0);
assert.equal(start.id,'field_mg');assert.equal(start.mag,20);assert.ok(start.cycle<=.49);assert.ok(start.damage>=9);assert.ok(start.rangeFactor>=.68);assert.ok(start.reload<2.7);
Object.assign(state.save.upgrades,{damage:12,range:12,rate:12,magazine:12,reload:12,aiming:12});
const upgraded=ctx.primaryStats(0);
assert.equal(upgraded.id,start.id);assert.ok(upgraded.mag>start.mag);assert.ok(upgraded.cycle<start.cycle/2);assert.ok(upgraded.damage>start.damage*2);assert.ok(upgraded.reload<start.reload/2);assert.ok(upgraded.rangeFactor>start.rangeFactor);
vm.runInContext(get('function createAlliedInfantry(','function spawnAlliedTeam('),ctx);
const friendly=ctx.createAlliedInfantry(402,443,'rifle');
assert.equal(state.infantry.length,0,'No Allied clone left on enemy side');
assert.equal(friendly.hp,38,'Neutral Allied level equals enemy HP');
assert.equal(friendly.speed,28,'Neutral Allied level equals enemy speed');
assert.equal(friendly.armorHp,14);assert.equal(friendly.faction,'british');assert.equal(friendly.weaponName,'LEE-ENFIELD');
state.save.allyLevel=5;
const strong=ctx.createAlliedInfantry(402,443,'rifle');assert.ok(strong.hp>friendly.hp);
state.save.allyLevel=1;
const weak=ctx.createAlliedInfantry(402,443,'rifle');assert.ok(weak.hp<friendly.hp);
vm.runInContext(get('function spawnAlliedArmor(','// Crew bail out when an Allied vehicle'),ctx);
ctx.spawnAlliedArmor(100);
assert.equal(state.vehicles.length,0);
const armored=state.arcade.armor[0];assert.equal(armored.hp,133);assert.equal(armored.armorHp,55);assert.equal(armored.vehicleSpec.family,'spah');assert.equal(armored.speed,76);assert.equal(armored.allied,true);
console.log('PASS: Stronger starter MG and six growing stats; Allied infantry share enemy factory HP, speed, armor and weapons; Allied vehicles inherit exact enemy chassis HP/armor/speed; collision, damage, napalm and shop hooks present.');
