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
// New menu chrome is layered CSS; the underlying battlefield artwork
// and its pixel scale are NEVER replaced, enlarged or blurred.
html=html.replace('</style>', [
 '#overlay{background:radial-gradient(circle at 48% 14%,rgba(136,107,55,.17),transparent 52%),linear-gradient(rgba(11,18,12,.48),rgba(5,11,8,.93));}',
 '#overlay .panel{position:relative;border-radius:10px;border:2px solid #bda66a;background:linear-gradient(145deg,rgba(49,62,46,.97),rgba(17,28,22,.99) 64%);box-shadow:0 0 0 3px #202a20,0 0 0 5px #5a5437,0 20px 60px #000c,inset 0 2px #d5c48f44,inset 0 -5px #090e0a;overflow:auto;}',
 '#overlay .panel::before{content:"";display:block;height:4px;margin:-22px -20px 13px;background:repeating-linear-gradient(90deg,#b18e4e 0 14px,#6a683c 14px 20px,#292e22 20px 28px);opacity:.78;}',
 '#overlay .panel h1{color:#ffe1a0;font-size:clamp(23px,5.4vw,29px);font-weight:950;letter-spacing:.02em;text-shadow:0 2px #181e15,0 3px #000b,2px 2px #574225;}',
 '#overlay .eyebrow{font-weight:950;color:#f2ce78;letter-spacing:.21em;}',
 '#overlay .modeBtn{border-radius:5px;background:linear-gradient(155deg,#40513c,#26382f);border:1px solid #a79a6277;box-shadow:inset 1px 1px #e9d6a92c,0 2px #0e1912;}',
 '#overlay .modeBtn:active{filter:brightness(1.16);}',
 '#overlay .action{border-radius:6px;border:2px solid #d1b474;background:linear-gradient(#f7d47c,#b68b35);box-shadow:inset 1px 1px #fff7,0 3px #171d13;}',
 '#overlay .hint{color:#b8c1ac;}',
 '</style>'
].join('\n'));

fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(path.join(dest,'game.js'),script);
fs.writeFileSync(path.join(dest,'index.html'),html);
console.log('Bunker Defense 2.0 built as independent playable site:',dest);
console.log('Original engine retained; '+patchFiles.length+' isolated modules; bytes:',Buffer.byteLength(script));
