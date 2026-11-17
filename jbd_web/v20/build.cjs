'use strict';
// Bunker Defense 2.0 builds a separately published, fully playable copy.
// V10.8 and its 1.4 MB legacy engine remain unchanged in Git.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'../v10/game.js');
const upgrades=path.resolve(__dirname,'../v10/v10_8_upgrades.js');
const visual=path.resolve(__dirname,'v20_visual.js');
const audio=path.resolve(__dirname,'v20_audio_ui.js');
const outputIndex=process.argv.indexOf('--output');
if(outputIndex<0||!process.argv[outputIndex+1])
 throw Error('Usage: node build.cjs --output /path/to/site/v20');
const dest=path.resolve(process.argv[outputIndex+1]);
const src=fs.readFileSync(base,'utf8'),end=src.lastIndexOf('\n})();');
if(end<0)throw Error('Original engine IIFE could not be located');
const patchFiles=[upgrades,visual,audio];
const script=src.slice(0,end)+'\n'+patchFiles.map(p=>fs.readFileSync(p,'utf8')).join('\n\n')+'\n'+src.slice(end);
new vm.Script(script,{filename:'Bunker-Defense-2.0.js'});
let html=fs.readFileSync(path.resolve(__dirname,'../v10/index.html'),'utf8');
html=html.replace(/V10\.8/g,'2.0')
 .replace('<title>Just Bunker Defense V10</title>','<title>Just Bunker Defense 2.0</title>')
 .replace(/game\.js\?v=[^"]+/,'game.js?v=bunker2-quality-20261117')
 .replace('Verdien 4–9 upgrades tijdens het gevecht op basis van voortgang.',
  'Bunker Defense 2.0: behoud van originele sprites, met nieuwe gevechtsbelichting, stof, vonken, schaduwen en volumeregeling. Verdien 4–9 upgrades gedurende de map.')
 .replace('V10.8: combat milestone upgrades plus 3 optional crates, nine damage states',
  'Bunker Defense 2.0: isolated optional visual/audio polish, original V10.8 gameplay');
fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(path.join(dest,'game.js'),script);
fs.writeFileSync(path.join(dest,'index.html'),html);
console.log('Bunker Defense 2.0 built as independent playable site:',dest);
console.log('Original engine retained; '+patchFiles.length+' isolated modules; bytes:',Buffer.byteLength(script));
