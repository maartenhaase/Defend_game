'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
new vm.Script(source,{filename:'game.js'});
assert.match(html,/V9\.9\.49/);
for(const marker of [
"p.cooldownUntil=p.until+3.2","hit?.35:.12","p.kind=pick",
"b.damage*=1+1.20*focus","b.fpsAP50cal9949=focus",
"smallArmsVehicleBefore9949","v.penetrationHits9935||0",
"igniteFuel(v,rand(1.7,2.7))","obj.hasMG=false",
"v.fuelIgnited||v.exploded||v.hp<=0",
"var crosshairOriginal9949=drawCrosshair",
"ctx.shadowColor='#60b8ff'",
"var extraVehiclesPlanBefore9949=buildEncounterPlan"
])assert.ok(source.includes(marker),'Missing '+marker);
console.log('PASS V9.9.49: syntax and static feature markers');
