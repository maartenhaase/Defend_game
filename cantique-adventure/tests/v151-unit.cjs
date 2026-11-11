'use strict';
// Lightweight runtime regression independent of Chromium.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const flags={};
const state={scene:'press_rear',selected:'v13_gear',x:470,y:650,inv:['v13_gear'],flags};
global.s=state;global.started=true;global.path=[];global.scenes={
 print:{hot:[{id:'print_fen',fn:'fenneke',rect:[1,2,3,4],at:[40,50]}],npcs:[{id:'fenneke',name:'Fenneke',at:[200,650],scale:.7}]},
 press_rear:{hot:[],npcs:[],v15Exits:[{door:'print',rect:[0,0,200,200]}]},
 breakroom:{hot:[{id:'break_dirk',fn:'dirkjan',rect:[500,250,100,100]},{id:'v13_dianne',fn:'v13Dianne',rect:[10,10,40,50]}]},
};
global.window={CANTIQUE_V13:{version:'15.0',isKnown:k=>!!flags[k],setKnown:k=>(flags[k]=true),items:[]},
 CANTIQUE_V15:{version:'15.0'},CANTIQUE_V12:{graph:{press_rear:['print'],print:['press_rear']}}};
global.document={title:'',hidden:false,getElementById:()=>({addEventListener:()=>{}}),addEventListener:()=>{}};
global.Image=class{naturalWidth=256;naturalHeight=256;complete=true;set src(v){this.url=v;}};
global.imagePaths={portrait_dianne:'test_dianne.webp',portrait_rineke_boers:'test_rineke.webp'};
global.actions={loudJohanneke:()=>{},fenneke:()=>{},dirkjan:()=>{},v13Dianne:()=>{}};
global.itemMeta={v13_gear:['Tandwiel']};
global.has=id=>state.inv.includes(id);global.remove=id=>state.inv=state.inv.filter(x=>x!==id);
global.note=()=>{};global.syncUI=()=>{};global.save=()=>{};
global.sound=()=>{};global.closeDialog=()=>{};global.travel=to=>{state.scene=to;};
global.say=(who,msg,opts)=>{global.lastDialog={who,msg,opts};};
global.toast=()=>{};global.drawNPC=()=>{};global.drawPlayer=()=>{};
global.drawWorld=()=>{};global.hotspotFound=()=>null;
const js=fs.readFileSync('cantique-adventure/sem-v14/v151-polish.js','utf8');
vm.runInThisContext(js,{filename:'v151-polish.js'});
const T=global.window.CANTIQUE_V15;
let a=T.v151Audit();
assert.equal(T.version,'15.1');assert.equal(a.DianneVisible,true);
assert.equal(a.FennekeVisible,true);assert.equal(a.decorativePropsRemaining,0);
assert.equal(typeof global.actions.v151Rineke,'function');
assert.equal(typeof global.actions.v151Johanneke,'function');
assert.equal(typeof global.actions.v151Printer,'function');
state.scene='breakroom';
assert.equal(global.hotspotFound(560,280).id,'break_dirk');
state.scene='press_rear';
global.actions.v151Printer();
assert.equal(flags.v151PrinterFixed,true);
assert.equal(global.has('v13_gear'),false);
assert.equal(state.selected,null);
assert.equal(T.v151Audit().printerFixed,true);
global.actions.v151Johanneke();
assert.equal(global.lastDialog.who,'Johanneke');
console.log('V15.1 unit regression PASSED: note click, cast, gear, save state and actions');
