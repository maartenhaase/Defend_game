'use strict';
// V10 integration test: loads the genuine 1.3 MB engine in an iPhone canvas VM.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadGame}=require('../v9_9_53/battle_regression.cjs');
const dir=__dirname;
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const js=fs.readFileSync(path.join(dir,'game.js'),'utf8');
assert.match(html,/V10 · 40 QUICK MISSIONS/);
assert.match(html,/game\.js\?v=10/);
assert.match(js,/JUST BUNKER DEFENSE V10/);
const t=loadGame(dir);
assert.equal(t.t.levels.length,40);
assert.equal(t.t.tour.length,40);
t.t.start('easy');
const names=new Set(),themes=new Set(),signatures=new Set(),twists=new Set(),recipes=new Set(),features=new Set();
const snapshots=[];
for(let i=0;i<40;i++){
 const q=t.t.tour[i],L=t.t.levels[i];
 assert.equal(q.index,i);
 assert.equal(L.name,q.title,'title sync at '+i);
 assert(q.v10,'V10 mission flag '+i);
 names.add(q.title);themes.add(q.theme);twists.add(q.twist);recipes.add(q.recipe);features.add(q.feature);
 const g=t;
 const s=g.t.state;
 s.levelIndex=i;g.t.reset();
 assert.equal(s.mode,'playing','level launches '+i);
 assert.equal(s.map.v10Chapter,Math.floor(i/10));
 assert.match(s.map.v10Signature,new RegExp('^V10-'+String(i+1).padStart(2,'0')+'-'));
 signatures.add(s.map.v10Signature);
 assert(s.shortBattle&&s.shortBattle.maxDuration>=20&&s.shortBattle.maxDuration<=34,'short fight '+i);
 assert(s.v10&&s.v10.quota>=1,'tactical objective '+i);
 assert(s.events.length>=2&&s.events.length<=10,'bounded events '+i);
 assert(s.events.every(e=>e.t<18),'no late events '+i);
 assert(s.events.some(e=>e.t>4),'second beat '+i);
 const late=s.events.at(-1).t;
 snapshots.push({level:i+1,name:q.title,theme:q.theme,recipe:q.recipe,twist:q.twist,duration:s.shortBattle.maxDuration,events:s.events.length,lastEvent:Math.round(late*10)/10,geometry:s.map.v10Signature});
 if([0,8,18,31,39].includes(i)){
   for(let frame=0;frame<110;frame++)g.t.step(1/30);
   assert.equal(s.mode,'playing','run 110 frames at '+i);
   assert(s.levelTime>3,'clock advances '+i);
   g.t.render();
   const endFrame=Math.ceil((Math.max(4,q.seconds*.36)+.7)*30);
   for(let frame=110;frame<endFrame;frame++)g.t.step(1/30);
   assert(s.v10.surprised||s.mode!=='playing','surprise must trigger before the mission ends '+i);
   assert(s.eventCursor>0||s.mode!=='playing','encounters advance '+i);
 }
}
assert.equal(names.size,40,'all mission titles unique');
assert.equal(signatures.size,40,'all geometry signatures unique');
assert(themes.size>=8,'wide biome variety');
assert(features.size>=10,'many different terrain structures');
assert(recipes.size>=10,'multiple attack patterns');
assert(twists.size>=10,'surprises vary across maps');
const hard=loadGame(dir);hard.t.start('hard');
assert.equal(hard.t.state.mode,'playing');
assert(hard.t.state.events.length>=3);
assert(hard.t.state.shortBattle.maxDuration<=38);
const first=loadGame(dir);first.t.start('easy');
const s=first.t.state;
assert(s.v10&&!s.v10.surprised);
for(let i=0;i<300;i++)first.t.step(1/30);
assert(s.v10.surprised,'mid-level random event actually occurs');
assert(s.levelTime>5,'gameplay advances on iPhone');
console.log('PASS V10:',JSON.stringify({
 maps:names.size,biomes:themes.size,features:features.size,attacks:recipes.size,surprises:twists.size,
 shortest:Math.min(...snapshots.map(x=>x.duration)),longest:Math.max(...snapshots.map(x=>x.duration)),
 first:snapshots[0],last:snapshots.at(-1)
}));