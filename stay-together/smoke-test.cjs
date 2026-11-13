"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const html=fs.readFileSync(__dirname+"/index.html","utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
assert(script.length>15000,"Game logic missing");
assert(html.includes('rel="manifest"'),"PWA manifest missing");
assert(fs.existsSync(__dirname+"/manifest.webmanifest"),"PWA manifest file missing");
assert(fs.existsSync(__dirname+"/sw.js"),"Service worker missing");
const nodes={};
function Elem(id){this.id=id;this.style={};this.textContent="";this.innerHTML="";this.dataset={};this.events={};this.classes=new Set();this.classList={add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,force)=>{if(force)this.classes.add(k);else this.classes.delete(k);}};}
Elem.prototype.addEventListener=function(ev,fn){this.events[ev]=fn;};
Elem.prototype.getBoundingClientRect=function(){return {left:0,top:0,width:390,height:780};};
Elem.prototype.querySelectorAll=function(){return [];};
Elem.prototype.setPointerCapture=function(){};
const draw=new Proxy({
 createLinearGradient(){return {addColorStop(){}};},
 createRadialGradient(){return {addColorStop(){}};}
},{get(target,key){if(!(key in target))target[key]=()=>{};return target[key];},set(target,key,val){target[key]=val;return true;}});
const get=id=>nodes[id]||(nodes[id]=new Elem(id));
const canvas=get("game");canvas.getContext=()=>draw;
const doc={getElementById:get,addEventListener(){}};
const win={devicePixelRatio:2,addEventListener(){}};
const storage=new Map();
let frame=null,now=0;
const context={document:doc,window:win,localStorage:{
 getItem:k=>storage.get(k)||null,
 setItem:(k,v)=>storage.set(k,v)
},performance:{now:()=>now},requestAnimationFrame:fn=>{frame=fn;},navigator:{}};
const tail='createGame(1);showMenu();updateHud();requestAnimationFrame(loop);';
assert(script.includes(tail),"Entrypoint not found");
const instrumented=script.replace(tail,'createGame(1);showMenu();updateHud();globalThis.__test={get:()=>({mode:mode,level:lv,alive:alive(),magic:g.magic,distance:g.distance}),win:()=>{g.distance=g.length-.001;}};requestAnimationFrame(loop);');
vm.runInNewContext(instrumented,context,{filename:"game.js",timeout:2500});
assert(get("menu").classes.has("visible"),"Menu not shown");
get("startBtn").onclick();
assert.equal(context.__test.get().mode,"playing","Game did not start");
const step=()=>{now+=16.67;frame(now);};
for(let i=0;i<190;i++)step();
assert(context.__test.get().distance>3,"Level not advancing");
const ev=canvas.events;
assert(typeof ev.pointerdown==="function"&&typeof ev.pointermove==="function","Touch input missing");
ev.pointerdown({clientX:195,clientY:535,pointerId:1,preventDefault(){}});
for(let i=0;i<50;i++)step();
assert(context.__test.get().magic<100,"Healing should cost magic");
ev.pointermove({clientX:250,clientY:560,preventDefault(){}});
ev.pointerup({});
for(let i=0;i<45;i++)step();
assert(context.__test.get().magic>0,"Magic should recover");
get("pauseBtn").onclick();
assert.equal(context.__test.get().mode,"paused","Pause didn't work");
get("resumeBtn").onclick();
assert.equal(context.__test.get().mode,"playing","Resume didn't work");
context.__test.win();step();
assert.equal(context.__test.get().mode,"won","Level completion didn't work");
assert(get("resultOverlay").classes.has("visible"),"Win screen missing");
get("nextBtn").onclick();
assert.equal(context.__test.get().level,2,"Next level didn't load");
get("pauseBtn").onclick();get("pauseHome").onclick();
assert.equal(context.__test.get().mode,"menu","Return home failed");
get("shopBtn").onclick();
assert(get("shopOverlay").classes.has("visible"),"Shop missing");
console.log("Druppelwachters smoke test passed — canvas, touch, healing, pause, win, next level, shop.");