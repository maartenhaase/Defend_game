'use strict';
/* Reproducible isolated 2.2 build; v10, v20, v21 stay untouched. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const dir=__dirname,idx=process.argv.indexOf('--output');
if(idx<0||!process.argv[idx+1])throw Error('Usage: node jbd_web/v22/build.cjs --output /absolute/site/path');
const dest=path.resolve(process.argv[idx+1]);
cp.execFileSync(process.execPath,[path.resolve(dir,'../v21/build.cjs'),'--output',dest],{stdio:'inherit'});
const gameFile=path.join(dest,'game.js');
let game=fs.readFileSync(gameFile,'utf8');
const insertion=game.lastIndexOf('\n})();');
if(insertion<0)throw Error('Missing outer IIFE');
game=game.slice(0,insertion)+'\n\n'+fs.readFileSync(path.join(dir,'arcade_overhaul.js'),'utf8')+'\n'+game.slice(insertion);
new vm.Script(game,{filename:'bunker-defense-2.2.js'});
fs.writeFileSync(gameFile,game);
let html=fs.readFileSync(path.join(dest,'index.html'),'utf8')
 .replace(/Bunker Defense 2\.1/g,'Bunker Defense 2.2 · ARCADE')
 .replace(/Just Bunker Defense 2\.1/g,'Just Bunker Defense 2.2')
 .replace(/game\.js\?v=[^"]+/,'game.js?v=arcade-2-2-20261121')
 .replace(/<div class="eyebrow">[\s\S]*?<\/div>/,'<div class="eyebrow">BUNKER DEFENSE · 16-BIT ARCADE</div>')
 .replace(/<h1 id="title">[\s\S]*?<\/h1>/,'<h1 id="title">BUNKER DEFENSE · ARCADE</h1>')
 .replace(/<p id="sub">[\s\S]*?<\/p>/,'<p id="sub">Richten. Schieten. Overleven. Korte waves, bonuskisten, scorecombo’s en meteen door naar de volgende aanval.</p>')
 .replace(/(<button id="easyMode"[^>]*>)[\s\S]*?(<\/button>)/,'$1<strong>▶ START ARCADE</strong><span>30 korte waves · steeds net iets moeilijker</span>$2');
html=html.replace('</style>',[
 'canvas{image-rendering:pixelated;image-rendering:crisp-edges}',
 '.mapPicker,#hardMode,#upgradeTestMode,.hint,#shop,#v20Controls{display:none!important}',
 '#modeSelect{display:block!important}',
 '#easyMode{width:100%;min-height:63px;text-align:center;background:#a8803b;color:#161f18;border:2px solid #f1d391}',
 '#easyMode strong{font-size:18px;color:#fff0bb;letter-spacing:.07em}',
 '#overlay .panel{max-width:390px;border-radius:7px;padding:22px;background:#1c2c24;border-color:#b79853}',
 '#overlay .panel h1{font-family:monospace;font-size:clamp(22px,6vw,30px)}',
 '#overlay .eyebrow{font-family:monospace}',
 '#deploy{display:none!important}',
 '</style>'
 ].join('\n'));
fs.writeFileSync(path.join(dest,'index.html'),html);
console.log('PASS: 2.2 separate sprite-based arcade build, original releases unchanged; '+game.length+' characters');
