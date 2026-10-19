'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
new vm.Script(game,{filename:'game.js'});
for(const feature of ['applyBunkerSuppression9948','coordinateEnemySquads9948','spawnStrafeRocket9948','b.damage*=1+.50*focus','b.penetrationChance9933=clamp','h.y=H+80-(H+160)*progress','addLadderAllies925(4,','addLadderAllies925(6,','p.jamUntil=time+1','function tickStrafeRockets9948'])assert.ok(game.includes(feature),feature);
console.log('PASS V9.9.48 static smoke tests');
