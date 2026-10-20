'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
new vm.Script(js,{filename:'game.js'});assert.match(html,/V9\.9\.50/);
for(const feature of ["function fireFlak9950","function tickFlak9950","gameState.secondaryMode9950==='flak'","p.cooldownUntil=p.until+3.2","hit?.72:.29","addLadderAllies925(10","u.flankSide9948<0?24:W-24","CONVOY '+(idx+1)","var planBefore9950=buildEncounterPlan","var smallArmsVehicleBefore9949=smallArmsVehicleHit","v.apHits9950>=required","Math.floor(gameState.time/3.1"])assert.ok(js.includes(feature),'missing '+feature);
console.log('PASS V9.9.50 syntax and static smoke markers');
