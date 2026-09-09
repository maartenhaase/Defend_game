'use strict';
// Fixed retro 16-colour battlefield palette.
const PAL={
 ink:'#182021',
 sandLight:'#ead9ab',
 sand:'#c7a866',
 sandDark:'#8d6d42',
 water:'#77a6ae',
 waterDark:'#426e76',
 friendly:'#58765a',
 friendlyLight:'#91aa72',
 enemy:'#9a493f',
 enemyDark:'#61302c',
 metal:'#68737a',
 rock:'#746855',
 mud:'#674c36',
 smoke:'#8d9085',
 fireYellow:'#e8bd4a',
 fireOrange:'#d66b31'
};



function pixelDot(x,y,c=PAL.ink,size=2){
 ctx.fillStyle=c;
 ctx.fillRect(Math.round(x-size/2),Math.round(y-size/2),size,size)
}
function roundRectPath(x,y,w,h,r=4){
 const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()
}
function fillStroke(fill,stroke=PAL.ink,lw=1.6){if(fill){ctx.fillStyle=fill;ctx.fill()} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function circle(x,y,r,fill,stroke=PAL.ink,lw=1.4){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);fillStroke(fill,stroke,lw)}
function ellipseShape(x,y,rx,ry,fill,stroke=PAL.ink,lw=1.4){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);fillStroke(fill,stroke,lw)}
function poly(points,fill,stroke=PAL.ink,lw=1.5){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();fillStroke(fill,stroke,lw)}
function humanPalette(e){
 if(e.type==='storm')return{body:'#5e4d40',acc:'#2f2f2f',helm:'#6b5a47'};
 if(e.type==='mg')return{body:'#6f5a49',acc:'#35322f',helm:'#5d5147'};
 if(e.type==='grenadier')return{body:'#7c6752',acc:'#b46f2e',helm:'#6f5d49'};
 if(e.type==='sniper')return{body:'#6d7258',acc:'#3b4231',helm:'#5a6349'};
 if(e.type==='paratrooper')return{body:'#72665c',acc:'#6a3531',helm:'#665a4e'};
 return{body:'#7b6654',acc:'#40362d',helm:'#6b5c4f'}
}
function darken(hex,f=.82){const n=parseInt(hex.slice(1),16),r=((n>>16)&255)*f,g=((n>>8)&255)*f,b=(n&255)*f;return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function drawVehicleVector(type,p,scale=1,wreck=false){
 const s=scale, dark=PAL.ink, metal=wreck?darken(PAL.metal,.78):PAL.metal;
 const body=wreck?darken(PAL.enemyDark,.68):type==='apc'?darken(PAL.metal,.86):type==='tank'||type==='stug'?darken(PAL.metal,.78):darken(PAL.enemy,.92);
 const top=wreck?darken(PAL.smoke,.85):type==='tank'||type==='stug'?PAL.smoke:PAL.sandDark;
 const wheel=wreck?darken(PAL.ink,.95):PAL.ink;
 ellipseShape(p.x,p.y+7*s,13*s,5*s,'rgba(24,32,33,.16)',null,0);
 if(type==='technical'){
  roundRectPath(p.x-11*s,p.y-5*s,22*s,10*s,3*s); fillStroke(body,dark,1.4);
  roundRectPath(p.x-2*s,p.y-8*s,8*s,6*s,2*s); fillStroke(top,dark,1.2);
  roundRectPath(p.x-10*s,p.y-4*s,7*s,4*s,1.2*s); fillStroke(metal,dark,1.1);
  circle(p.x-8*s,p.y+6*s,3.2*s,wheel,dark,1.1); circle(p.x+8*s,p.y+6*s,3.2*s,wheel,dark,1.1);
  line({x:p.x+1*s,y:p.y-6*s},{x:p.x+1*s,y:p.y-12*s},1.6); line({x:p.x+1*s,y:p.y-12*s},{x:p.x+10*s,y:p.y-11*s},1.6); circle(p.x+2*s,p.y-9*s,1.7*s,metal,dark,1.1)
 }else if(type==='jeep'){
  roundRectPath(p.x-9*s,p.y-4*s,18*s,8*s,3*s); fillStroke(body,dark,1.4);
  roundRectPath(p.x-1*s,p.y-7*s,6*s,5*s,2*s); fillStroke(top,dark,1.1);
  circle(p.x-6*s,p.y+5*s,2.9*s,wheel,dark,1); circle(p.x+6*s,p.y+5*s,2.9*s,wheel,dark,1)
 }else if(type==='motorcycle'){
  circle(p.x-8*s,p.y+5*s,3.4*s,null,wheel,1.6);circle(p.x+8*s,p.y+5*s,3.4*s,null,wheel,1.6);
  ctx.strokeStyle=metal;line({x:p.x-7*s,y:p.y+3*s},{x:p.x+3*s,y:p.y+1*s},2.1);line({x:p.x+3*s,y:p.y+1*s},{x:p.x+8*s,y:p.y+5*s},2.1);line({x:p.x-1*s,y:p.y+1*s},{x:p.x+2*s,y:p.y-4*s},1.7);
  roundRectPath(p.x-2.5*s,p.y-6*s,6*s,6*s,2*s);fillStroke(body,dark,1.1);
  circle(p.x+1*s,p.y-9*s,2.7*s,PAL.sandLight,dark,1);
  roundRectPath(p.x-1.8*s,p.y-11.2*s,5.6*s,1.8*s,1);fillStroke(PAL.ink,dark,.8);
  line({x:p.x+2*s,y:p.y-4*s},{x:p.x+9*s,y:p.y-2*s},1.6);
 }else if(type==='halftrack'){
  roundRectPath(p.x-13*s,p.y-5*s,26*s,10*s,3*s); fillStroke(body,dark,1.5);
  roundRectPath(p.x-3*s,p.y-8*s,10*s,6*s,2*s); fillStroke(top,dark,1.2);
  roundRectPath(p.x-12*s,p.y+3*s,20*s,4*s,1.5*s); fillStroke(darken(PAL.ink,.92),dark,1.1);
  circle(p.x+9*s,p.y+5*s,2.8*s,wheel,dark,1); line({x:p.x-1*s,y:p.y-10*s},{x:p.x+10*s,y:p.y-10*s},1.5)
 }else if(type==='apc'){
  poly([[p.x-13*s,p.y+3*s],[p.x-10*s,p.y-6*s],[p.x+9*s,p.y-6*s],[p.x+13*s,p.y],[p.x+10*s,p.y+6*s],[p.x-11*s,p.y+6*s]],body,dark,1.5);
  roundRectPath(p.x-5*s,p.y-7*s,10*s,4*s,2*s); fillStroke(top,dark,1.1);
  roundRectPath(p.x-12*s,p.y+4*s,24*s,4*s,1.5*s); fillStroke(darken(PAL.ink,.90),dark,1.1)
 }else if(type==='tank'){
  roundRectPath(p.x-14*s,p.y+2*s,28*s,5*s,2*s); fillStroke(darken(PAL.ink,.92),dark,1.1);
  poly([[p.x-12*s,p.y+3*s],[p.x-9*s,p.y-5*s],[p.x+11*s,p.y-5*s],[p.x+14*s,p.y+1*s],[p.x+10*s,p.y+6*s],[p.x-10*s,p.y+6*s]],body,dark,1.6);
  circle(p.x+2*s,p.y-1*s,5.4*s,top,dark,1.4);
  line({x:p.x+6*s,y:p.y-2*s},{x:p.x+19*s,y:p.y-6*s},2.4)
 }else if(type==='stug'){
  roundRectPath(p.x-14*s,p.y+2*s,28*s,5*s,2*s); fillStroke(darken(PAL.ink,.92),dark,1.1);
  poly([[p.x-12*s,p.y+4*s],[p.x-8*s,p.y-5*s],[p.x+11*s,p.y-5*s],[p.x+14*s,p.y],[p.x+9*s,p.y+6*s],[p.x-11*s,p.y+6*s]],body,dark,1.6);
  roundRectPath(p.x-1*s,p.y-4*s,7*s,4*s,1.5*s); fillStroke(top,dark,1.2);
  line({x:p.x+6*s,y:p.y-2*s},{x:p.x+20*s,y:p.y-3*s},2.4)
 }
}
function limb(a,b,c,color,width=2){
 ctx.strokeStyle=PAL.ink;line(a,b,width+2);line(b,c,width+2);
 ctx.strokeStyle=color;line(a,b,width);line(b,c,width)
}
function drawSoldierFigure(e,p,friend=false){
 const pal=friend?{body:PAL.friendlyLight,acc:PAL.friendly,helm:PAL.friendly,skin:PAL.sandLight}:Object.assign({skin:PAL.sandLight},humanPalette(e));
 const crouch=e.stance==='crouch',prone=e.stance==='prone';
 const moving=!!e.moving&&!crouch&&!prone;
 const phase=e.walkPhase||0;
 const step=moving?Math.sin(phase):0;
 const bob=moving?Math.abs(Math.sin(phase))*.75:0;
 const sprint=e.action==='sprint'&&e.actionT>0;
 const lean=sprint?2.0:0;
 const ox=p.x,oy=p.y-bob;

 ellipseShape(ox,oy+7,6.5,2.6,'rgba(24,32,33,.13)',null,0);
 ctx.lineCap='round';ctx.lineJoin='round';

 if(prone){
  roundRectPath(ox-9,oy-2,16,6,2.3);fillStroke(pal.body,PAL.ink,1.2);
  circle(ox-6,oy+1,2.7,pal.skin,PAL.ink,1.1);
  roundRectPath(ox-8.5,oy-2.8,5.6,1.8,1);fillStroke(pal.helm,PAL.ink,1);
  ctx.strokeStyle=PAL.ink;line({x:ox+1,y:oy+1},{x:ox+13,y:oy-1},2.0);
  limb({x:ox-1,y:oy+3},{x:ox+3,y:oy+4},{x:ox+7,y:oy+5},pal.body,1.6);
  return
 }

 const bodyY=(crouch?oy:oy-4)+lean*.35;
 const torsoH=crouch?8.2:10.2;
 roundRectPath(ox-4.1,bodyY,8.2,torsoH,2.5);fillStroke(pal.body,PAL.ink,1.25);
 const headX=ox+lean*.25+(e.action==='look'?e.actionDir*1.0:0);
 circle(headX,bodyY-3.5,3.0,pal.skin,PAL.ink,1.05);
 roundRectPath(headX-3.3,bodyY-6.2,6.6,2.1,1.1);fillStroke(pal.helm,PAL.ink,1);

 const hipY=bodyY+torsoH-1;
 if(crouch){
  limb({x:ox-1.7,y:hipY},{x:ox-4.5,y:hipY+3.5},{x:ox-6.2,y:hipY+6.2},pal.body,1.8);
  limb({x:ox+1.7,y:hipY},{x:ox+4.7,y:hipY+2.7},{x:ox+7.0,y:hipY+5.4},pal.body,1.8)
 }else{
  const stride=(sprint?5.8:4.4)*step;
  const liftL=Math.max(0,-step)*(sprint?2.2:1.4),liftR=Math.max(0,step)*(sprint?2.2:1.4);
  const lk={x:ox-1.4+stride*.34,y:hipY+4-liftL*.35};
  const lf={x:ox-2.4+stride,y:hipY+9-liftL};
  const rk={x:ox+1.4-stride*.34,y:hipY+4-liftR*.35};
  const rf={x:ox+2.4-stride,y:hipY+9-liftR};
  limb({x:ox-1.6,y:hipY},lk,lf,pal.body,1.85);
  limb({x:ox+1.6,y:hipY},rk,rf,pal.body,1.85);
  ctx.strokeStyle=PAL.ink;line({x:lf.x-1.8,y:lf.y},{x:lf.x+1.4,y:lf.y},2.1);line({x:rf.x-1.4,y:rf.y},{x:rf.x+1.8,y:rf.y},2.1)
 }

 const shoulderY=bodyY+2.4;
 const gunLen=e.type==='sniper'?12.8:e.type==='mg'?10.8:9.2;
 const leftSwing=moving?-step*(sprint?4.2:3.0):0;

 if(e.action==='point'&&e.actionT>0){
  limb({x:ox-3,y:shoulderY},{x:ox-6,y:shoulderY-2},{x:ox-11*e.actionDir,y:shoulderY-4},pal.body,1.55)
 }else if(e.action==='reload'&&e.actionT>0){
  limb({x:ox-3,y:shoulderY},{x:ox+1,y:shoulderY+1},{x:ox+5,y:shoulderY+2.5},pal.body,1.55)
 }else{
  limb({x:ox-3,y:shoulderY},{x:ox-6+leftSwing*.5,y:shoulderY+3},{x:ox-7+leftSwing,y:shoulderY+6},pal.body,1.55)
 }

 limb({x:ox+3,y:shoulderY},{x:ox+5.5,y:shoulderY+1},{x:ox+8,y:shoulderY+1.5},pal.body,1.55);
 ctx.strokeStyle=PAL.ink;line({x:ox+4.5,y:shoulderY+.5},{x:ox+gunLen,y:shoulderY+(e.type==='sniper'?-1.3:.6)},2.0);
 if(e.type==='sniper'){circle(ox+7.2,shoulderY-.2,1.0,PAL.metal,PAL.ink,.8)}
 if(e.type==='mg'&&e.mounted){
  roundRectPath(ox+6,oy+3,6,2,1);fillStroke(PAL.metal,PAL.ink,1);
  line({x:ox+7,y:oy+5},{x:ox+6,y:oy+9},1.1);line({x:ox+10,y:oy+5},{x:ox+11,y:oy+9},1.1)
 }
 if(e.grenadeAnim>0){const lift=Math.sin(clamp(e.grenadeAnim/.65,0,1)*Math.PI)*8;circle(ox-7,bodyY-3-lift,2.2,PAL.fireOrange,PAL.ink,1)}
}


const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');

let W=0,H=0,origin={x:0,y:0},mouse={x:0,y:0},last=performance.now();
let selectedAmmo='normal',fireHeld=false,heAimStill=0;

const ISOX=4.22,ISOY=2.11;
const INITIAL_CONTACTS=4;

const state={
 wave:0,supply:50,hp:135,maxhp:135,armor:35,phase:'ready',
 ammo:{normal:70,ap:18,he:12},ammoLvl:{normal:1,ap:1,he:1},
 gunLvl:1,heatLvl:1,rofLvl:1,dmgLvl:1,trenchCrew:0,
 trenches:[{men:0,overrun:false,fireClock:.3},{men:0,overrun:false,fireClock:.8}],
 heat:0,overheated:false,triggerClock:0,
 enemies:[],shots:[],fx:[],floaters:[],smoke:[],
 spawnQueue:[],spawnClock:0,nextWavePlan:null,waveKills:0,id:0,muzzleFlash:0,recoil:0,enemyMuzzles:[],reloadCue:0,reloadCueType:null,wrecks:[],corpses:[]
};

const GUNS=[
 {name:'LIGHT MG',shots:1,heat:10,rate:.58,damage:22,range:132,splash:0},
 {name:'MEDIUM MG',shots:2,heat:14,rate:.54,damage:24,range:139,splash:0},
 {name:'HEAVY MG',shots:2,heat:16,rate:.49,damage:26,range:146,splash:0},
 {name:'TWIN MG',shots:3,heat:19,rate:.46,damage:28,range:153,splash:0},
 {name:'RAPID MG',shots:3,heat:21,rate:.42,damage:30,range:160,splash:0},
 {name:'HMG',shots:4,heat:24,rate:.39,damage:33,range:168,splash:0},
 {name:'AUTOCANNON',shots:4,heat:27,rate:.37,damage:42,range:176,splash:.12},
 {name:'DUAL AUTO',shots:5,heat:30,rate:.35,damage:46,range:184,splash:.18},
 {name:'HEAVY SYSTEM',shots:5,heat:32,rate:.33,damage:51,range:192,splash:.24},
 {name:'FORTRESS GUN',shots:6,heat:34,rate:.31,damage:56,range:202,splash:.30}
];

const AMMO={
 normal:{vs:{rifle:1,storm:1,mg:1,grenadier:1,sniper:1,paratrooper:1,landingcraft:.22,technical:.34,motorcycle:.72,jeep:.42,halftrack:.18,apc:.10,tank:0,stug:0}},
 ap:{vs:{rifle:.42,storm:.42,mg:.42,grenadier:.42,sniper:.42,paratrooper:.42,landingcraft:1.05,technical:1.15,motorcycle:1.35,jeep:1.15,halftrack:1.25,apc:1.18,tank:1.05,stug:1.12}},
 he:{vs:{rifle:1.35,storm:1.25,mg:1.20,grenadier:1.30,sniper:1.15,paratrooper:1.25,landingcraft:.72,technical:.90,motorcycle:1.10,jeep:.95,halftrack:.62,apc:.42,tank:0,stug:0}}
};
function ammoStats(type){
 const lvl=state.ammoLvl[type]||1;

 if(type==='normal')return{
  range:1+(lvl-1)*.080,
  speed:1.08+(lvl-1)*.018,
  vehicleDamage:1,
  buyCost:6
 };

 if(type==='ap')return{
  range:1.18+(lvl-1)*.070,
  speed:1.68+(lvl-1)*.040,
  vehicleDamage:1+(lvl-1)*.20,
  buyCost:10+(lvl-1)*3
 };

 return{
  range:null,
  speed:1+(lvl-1)*.075,
  splashRadius:4.8+(lvl-1)*.72,
  mortarDamage:66+(lvl-1)*9,
  buyCost:10
 };
}

function playerModeStats(type){
 const st=gunStats();

 if(type==='normal'){
  const burst=Math.min(5,2+Math.floor((state.gunLvl-1)/3));
  return{
   mode:'MG BURST',
   burst,
   burstGap:Math.max(.065,.095-(state.rofLvl-1)*.004),
   cycle:Math.max(.46,.82*Math.pow(.92,state.rofLvl-1)),
   heat:17+burst*2.7,
   range:st.range*ammoStats('normal').range,
   speed:ammoStats('normal').speed,
   damage:st.damage
  }
 }

 if(type==='ap'){
  return{
   mode:'AP CANNON',
   burst:1,
   cycle:Math.max(1.02,1.48*Math.pow(.95,state.rofLvl-1)),
   heat:8,
   range:st.range*ammoStats('ap').range,
   speed:ammoStats('ap').speed,
   damage:st.damage*ammoStats('ap').vehicleDamage*1.85
  }
 }

 const he=ammoStats('he');
 return{
  mode:'HE MORTAR',
  burst:1,
  cycle:Math.max(2.35,3.10*Math.pow(.96,state.rofLvl-1)),
  heat:5,
  range:null,
  speed:he.speed,
  damage:he.mortarDamage*(1+(state.dmgLvl-1)*.10),
  splash:he.splashRadius
 }
}

function heAimFocus(){return clamp(heAimStill/1.20,0,1)}
function heAimRadius(){return 36-29*heAimFocus()}

function ammoUpgradeCost(type){
 const lvl=state.ammoLvl[type]||1;
 if(lvl>=6)return Infinity;
 const base=type==='normal'?12:type==='ap'?15:14;
 const step=type==='normal'?4:type==='ap'?6:5;
 return base+(lvl-1)*step
}
