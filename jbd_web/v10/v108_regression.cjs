'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('../v9_9_53/battle_regression.cjs');
const dir=process.env.JBD_GAME_DIR||__dirname;
const code=fs.readFileSync(path.join(dir,'game.js'),'utf8');
assert.match(code,/JBD V10\.8 — scheduled/,'the build contains the upgrade controller inside the game closure');
const h=loadGame(dir);
const u=h.t;
u.start('easy');
function inspect(level,targets){
 u.state.levelIndex=level-1;u.reset();
 const g=u.state;
 assert.equal(g.v108Schedule.length,targets.length,'upgrade count in level '+level);
 targets.forEach((n,i)=>assert(Math.abs(g.v108Schedule[i]-n)<.000001,'milestone '+i+' in level '+level));
 assert.equal(g.v108Granted,0);
 assert.equal(g.v108Cursor,0);
}
inspect(1,[.10,.35,.60,.85]);
inspect(2,[.10,.30,.50,.70,.90]);
inspect(4,[.10,.25,.40,.55,.70,.90]);
inspect(6,[.08,.22,.36,.50,.64,.78,.92]);
inspect(11,[.08,.20,.32,.44,.56,.68,.80,.92]);
inspect(16,[.08,.08+.87/8,.08+2*.87/8,.08+3*.87/8,.08+4*.87/8,.08+5*.87/8,.08+6*.87/8,.08+7*.87/8,.95]);
assert.equal(u.state.v108Anchors[0],'magazine');
assert.equal(u.state.v108Anchors[8],'mgReload');
inspect(17,[.08,.08+.87/7,.08+2*.87/7,.08+3*.87/7,.08+4*.87/7,.08+5*.87/7,.08+6*.87/7,.95]);

// A real game update must raise the popup as soon as combat progress
// crosses a scheduled threshold. No time-only rewards.
inspect(1,[.10,.35,.60,.85]);
let s=u.state;
assert.equal(s.profile.primaryMag,12,'base weapon is unchanged before rewards');
for(let i=0;i<200;i++)u.step(1/60);
assert.equal(s.v108Granted,0,'waiting without combat progress gives no automatic upgrades');
s.v108Progress=.10;u.step(1/60);
assert(s.v108Offer,'first scheduled offer appears');
assert.equal(s.v108Offer.id,'magazine');
let b=h.ids.get('v108Accept');
assert(b&&b.eventEntries.click.length,'iPhone-compatible explicit accept button exists');
const frozen=s.levelTime;
u.step(1/60);
assert.equal(s.levelTime,frozen,'combat simulation pauses until reward is accepted');
function accept(){
 const pending=u.state.v108Offer;
 assert(pending,'a reward is pending');
 const btn=h.ids.get('v108Accept');
 btn.eventEntries.click[0].fn({preventDefault(){},stopPropagation(){}});
 return pending.id;
}
assert.equal(accept(),'magazine');
assert.equal(s.v108Granted,1);
assert.equal(s.profile.primaryMag,14,'a 15% magazine bonus changes the actual gun clip');
s.v108Progress=.36;u.step(1/60);
assert.equal(s.v108Offer.id,'mgReload','reload speed is guaranteed across the map');
const oldReload=s.profile.primaryReload;
accept();
assert(s.profile.primaryReload<oldReload*.93,'reload is at least 8% faster');
s.v108Progress=.61;u.step(1/60);
assert.equal(accept(),'magazine','second magazine bonus is guaranteed in level 1');
assert(s.profile.primaryMag>=16);
s.v108Progress=.86;u.step(1/60);accept();
assert.equal(s.v108Granted,4,'all four scheduled slots were awarded');

// Level 4 requires two magazines and two reloads across six slots,
// including rewards in the final 70–95% portion. Fast progress bursts
// must queue all offers without losing them.
inspect(4,[.10,.25,.40,.55,.70,.90]);
s=u.state;
s.v108Progress=.95;u.step(1/60);
assert.equal(s.v108Cursor,6,'all due slots are queued');
assert.equal(s.v108Queue.length,5,'five rewards remain pending behind the visible first choice');
const types=[];
while(s.v108Offer){types.push(accept());}
assert.equal(types.length,6,'six offers survive a single large progress jump');
assert(types.filter(x=>x==='magazine').length>=2,'two magazine improvements at level 4 while not capped');
assert(types.filter(x=>x==='mgReload').length>=2,'two reload improvements at level 4 while not capped');
for(let k=2;k<types.length;k++)
 assert(!(types[k]===types[k-1]&&types[k]===types[k-2]),'never triple-reward the same type');
assert.equal(s.v108Granted,6);
assert.equal(s.v108Queue.length,0);
assert.equal(s.v108Offer,null);

// Crate rewards continue to use the old loot table; the profile
// modifiers survive a reset and remain finite.
const earned=Object.assign({},s.save.v108Perks);
u.state.levelIndex=4;u.reset();
assert.equal(s.profile.primaryMag,Math.min(160,Math.round(12*Math.pow(1.15,earned.magazine))), 'persistent magazine rewards survive map reset');
assert(Number.isFinite(s.profile.primaryDamage)&&Number.isFinite(s.profile.primaryReload));
assert.equal(s.v106Schedule.length,3,'all three original parachute loot crates are still scheduled');
console.log('PASS V10.8: milestone schedule levels 1–17, deterministic guaranteed types, combat pause, late offers, persistent 15/8% effects and original 3 crates.');