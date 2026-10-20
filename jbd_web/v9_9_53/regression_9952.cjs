'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync(path.join(__dirname,'game.js'),'utf8'),html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
new vm.Script(js,{filename:'game.js'});assert.match(html,/V9\.9\.52/);
for(const pattern of ["var required=heavy?3:medium?3:2","focused9952>=.55?1","damage:16+level*.85","vehicleDamage:13.5+level*.65","activateShellshock9952","Math.random()<.10","function tickShellshockSoldier9952","mode==='freeze'","mode==='flee'","mode==='berserk'","function tickBerserkBullets9952","damageInfantry(foe,s.damage,'mg')","p.cooldownUntil=p.until+3.2"])assert.ok(js.includes(pattern),'Missing '+pattern);
assert.ok(!js.includes("GRANAAT ⟷ FLAK"));
console.log('PASS v9.9.52 shellshock, flak, AP and syntax static checks');
