'use strict';
// Compile an additive V10.8 upgrade controller *inside* the original game
// closure. The 1.4 MB V10.7 engine is never modified in the repository.
const fs=require('node:fs'),path=require('node:path');
const dir=__dirname;
const base=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const patch=fs.readFileSync(path.join(dir,'v10_8_upgrades.js'),'utf8');
const marker='\n})();';
const cut=base.lastIndexOf(marker);
if(cut<0)throw Error('JBD game closure end marker not found');
if(base.includes('JBD V10.8 — scheduled'))throw Error('V10.8 already compiled into base');
const merged=base.slice(0,cut)+'\n'+patch+'\n'+base.slice(cut);
new (require('node:vm').Script)(merged,{filename:'jbd-v10.8.js'});
const index=process.argv.indexOf('--output');
if(index<0||!process.argv[index+1])throw Error('Specify --output /path/to/game.js');
const output=path.resolve(process.argv[index+1]);
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,merged,'utf8');
console.log('Built JBD V10.8 inside original engine:',output,'('+merged.length+' chars)');
