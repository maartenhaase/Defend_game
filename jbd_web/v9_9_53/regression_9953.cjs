'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
new vm.Script(code,{filename:'game.js'});assert.match(index,/V9\.9\.53/);
for(const text of ["metadata.tier===0&&metadata.serial===0","b.fpsSingle9953=!!aimed","b.vx*=2.35;b.vy*=2.35","b.range*=1.60","chance=Math.max(chance,material==='armor'?.94:.98)","function winterPalette9953()","function drawAP50Tracer9953","function drawAlliedRedStar9953","drawAlliedTeam=function(){","ctx.ellipse(tx,ty,radius+62,radius+97","spreadIndex*23","JBD V9.9.53 ERROR:"])assert.ok(code.includes(text),'Missing '+text);
assert.ok(code.includes('function specialStats(lvl)'), 'Archived grenade source must remain');
console.log('PASS V9.9.53 syntax and intended features');
