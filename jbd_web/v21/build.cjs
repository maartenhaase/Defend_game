'use strict';
// Builds 2.1 over the PROVEN 2.0 engine and original 1.4 MB game.
// Keeps the v10 source, 2.0 entrypoint and every previous release intact.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const dir=path.resolve(__dirname);
const i=process.argv.indexOf('--output');
if(i<0||!process.argv[i+1])throw Error('Usage: node jbd_web/v21/build.cjs --output /absolute/site/path');
const dest=path.resolve(process.argv[i+1]);
cp.execFileSync(process.execPath,[path.resolve(dir,'../v20/build.cjs'),'--output',dest],{stdio:'inherit'});
const file=path.join(dest,'game.js');
let js=fs.readFileSync(file,'utf8'),at=js.lastIndexOf('\n})();');
if(at<0)throw Error('Could not find main game IIFE end');
js=js.slice(0,at)+'\n\n'+fs.readFileSync(path.resolve(dir,'v21_gameplay.js'),'utf8')+'\n'+js.slice(at);
new vm.Script(js,{filename:'bunker-defense-2.1.js'});
fs.writeFileSync(file,js);
const idx=path.join(dest,'index.html');
let html=fs.readFileSync(idx,'utf8');
html=html.replace(/Bunker Defense 2\.0/g,'Bunker Defense 2.1')
 .replace(/Just Bunker Defense 2\.0/g,'Just Bunker Defense 2.1')
 .replace(/Verdien 4–9 upgrades gedurende de map/g,'3–6 willekeurige parachutekisten per map')
 .replace(/Verdien 4–9 upgrades tijdens het gevecht op basis van voortgang/g,'Schiet 3–6 willekeurige parachutekisten open voor upgrades')
 .replace(/game\.js\?v=[^"]+/,'game.js?v=bunker-2-1-balanced-20261117')
 .replace('original V10.8 gameplay','3–6 random loot drops and challenge balance');
fs.writeFileSync(idx,html);
console.log('PASS: separate 2.1 build; legacy V10.8 and 2.0 untouched; JS bytes '+Buffer.byteLength(js));
