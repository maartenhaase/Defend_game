'use strict';
const $=id=>document.getElementById(id), canvas=$('game'), ctx=canvas.getContext('2d');
let W=0,H=0,DPR=1,mouse={x:0,y:0},last=performance.now(),selected='mg',fireHeld=false,PORTRAIT=false;
const C={
 bg:'#15221a',ground:'#526848',ground2:'#657957',ground3:'#40563e',mud:'#66513a',mud2:'#7b6245',water:'#385d58',water2:'#4c7a70',
 ink:'#172018',enemy:'#8d4d42',enemy2:'#5a302d',metal:'#646d69',metal2:'#89918d',olive:'#536748',olive2:'#81956a',friendly:'#516b49',friendly2:'#90a97a',
 skin:'#d2aa80',gold:'#efbf55',orange:'#dd7a3b',red:'#d55d4e',smoke:'#767d76',black:'#111711',white:'#f1ead8',tracer:'#ffe06b'
};
const ISOX=4.18,ISOY=2.08;
const WORLD={aMin:-104,aMax:86,sMin:-52,sMax:52};
const PCENTER_A=(WORLD.aMin+WORLD.aMax)/2;
let P_A_X=1.43,P_S_X=.62,P_A_Y=2.08,P_S_Y=1.18,P_CX=0,P_CY=0;
function updateProjection(){
  PORTRAIT=W<=600&&H>W;
  if(!PORTRAIT)return;
  const weaponReserve=Math.min(125,Math.max(102,H*.17));
  const playTop=8, playBottom=H-weaponReserve-8, playH=Math.max(360,playBottom-playTop);
  const sx=Math.min(1,(W-18)/348), sy=Math.min(1,playH/535), k=Math.min(sx,sy);
  P_A_X=1.43*k; P_S_X=.62*k; P_A_Y=2.08*k; P_S_Y=1.18*k;
  P_CX=W*.50;
  P_CY=playTop+playH*.50;
}

const RIVER={a:-15,half:5.8,bridges:[-22,21],bridgeHalf:5.0};
function inRiver(a,s){return a>RIVER.a-RIVER.half&&a<RIVER.a+RIVER.half&&Math.abs(s)<56}
function nearBridge(s){return RIVER.bridges.some(b=>Math.abs(s-b)<RIVER.bridgeHalf)}
function chooseBridge(e){if(e.bridgeS!==undefined&&e.bridgeS!==null)return e.bridgeS;const nearest=RIVER.bridges.slice().sort((a,b)=>Math.abs(e.s-a)-Math.abs(e.s-b))[0];e.bridgeS=Math.random()<.72?nearest:RIVER.bridges.find(b=>b!==nearest);return e.bridgeS}
function riverTarget(e,forward=true){if(!e.vehicle)return null;const b=chooseBridge(e),west=RIVER.a-RIVER.half-2.2,east=RIVER.a+RIVER.half+2.2;if(forward){if(e.a<west)return{a:west,s:b,river:true};if(e.a<east)return{a:east,s:b,river:true}}else{if(e.a>east)return{a:east,s:b,river:true};if(e.a>west)return{a:west,s:b,river:true}}return null}
function resize(){const r=canvas.getBoundingClientRect();DPR=Math.min(2,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(r.width*DPR));canvas.height=Math.max(1,Math.round(r.height*DPR));ctx.setTransform(DPR,0,0,DPR,0,0);W=r.width;H=r.height;updateProjection();if(!mouse.x||PORTRAIT){mouse.x=W*.50;mouse.y=PORTRAIT?H*.46:H*.48}}
addEventListener('resize',resize);if(window.visualViewport)visualViewport.addEventListener('resize',()=>requestAnimationFrame(resize));resize();
function clamp(v,a,b){return Math.max(a,Math.min(b,v))} function rnd(a,b){return a+Math.random()*(b-a)} function lerp(a,b,t){return a+(b-a)*t}
function isoAS(a,s,z=0){
  if(PORTRAIT){const da=a-PCENTER_A;return{x:P_CX+da*P_A_X+s*P_S_X,y:P_CY+da*P_A_Y+s*P_S_Y-z*.72}}
  return{x:W*.47+a*ISOX,y:H*.50+s*ISOY-z}
}
function asFromScreen(sx,sy){
  if(PORTRAIT){const dx=sx-P_CX,dy=sy-P_CY,det=P_A_X*P_S_Y-P_S_X*P_A_Y||.001;return{a:PCENTER_A+(dx*P_S_Y-P_S_X*dy)/det,s:(P_A_X*dy-dx*P_A_Y)/det}}
  return{a:(sx-W*.47)/ISOX,s:(sy-H*.50)/ISOY}
}
function xyFromAS(a,s){return{x:(a+s)/2,y:(s-a)/2}}
function isoXY(x,y,z=0){return isoAS(x-y,x+y,z)}
function distAS(a,b){return Math.hypot(a.a-b.a,a.s-b.s)}
function line(x1,y1,x2,y2,w=1,col=C.ink){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function circle(x,y,r,fill,stroke=null,lw=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function ellipse(x,y,rx,ry,fill,stroke=null,lw=1){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function poly(points,fill,stroke=null,lw=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function rr(x,y,w,h,r,fill,stroke=null,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function screenDistToSegment(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;if(l2<.001)return Math.hypot(px-ax,py-ay);const t=clamp(((px-ax)*dx+(py-ay)*dy)/l2,0,1);return Math.hypot(px-(ax+dx*t),py-(ay+dy*t))}

const DEF={
 rifle:{hp:58,speed:5.2,engage:116,reload:1.15,damage:.38,kind:'personnel',reward:2},
 storm:{hp:66,speed:6.0,engage:90,reload:.62,damage:.25,kind:'personnel',reward:3},
 mg:{hp:82,speed:4.5,engage:124,reload:.78,damage:.24,kind:'personnel',reward:4},
 grenadier:{hp:70,speed:4.8,engage:104,reload:2.2,damage:1.15,kind:'personnel',reward:4},
 engineer:{hp:54,speed:5.0,engage:88,reload:1.4,damage:.20,kind:'personnel',reward:5},
 motorcycle:{hp:46,speed:8.8,engage:82,reload:.72,damage:.18,kind:'personnel',vehicle:true,reward:4},
 technical:{hp:125,speed:5.7,engage:108,reload:.68,damage:.25,kind:'armor',vehicle:true,reward:8},
 truck:{hp:165,speed:4.8,engage:0,reload:9,damage:0,kind:'armor',vehicle:true,passengers:8,reward:9},
 engineertruck:{hp:150,speed:5.0,engage:0,reload:9,damage:0,kind:'armor',vehicle:true,passengers:2,reward:10},
 halftrack:{hp:220,speed:4.1,engage:116,reload:.72,damage:.32,kind:'armor',vehicle:true,passengers:6,reward:12},
 apc:{hp:300,speed:3.7,engage:112,reload:.72,damage:.36,kind:'armor',vehicle:true,passengers:6,reward:15},
 stug:{hp:390,speed:3.35,engage:124,reload:2.25,damage:1.7,kind:'armor',vehicle:true,heavy:true,reward:19},
 tank:{hp:470,speed:3.1,engage:120,reload:2.05,damage:2.0,kind:'armor',vehicle:true,heavy:true,reward:23},
 fieldbunker:{hp:330,speed:0,engage:130,reload:.74,damage:.30,kind:'cover',fort:true,reward:18}
};
const LABEL={rifle:'RIFLE',storm:'ASSAULT',mg:'MACHINE GUN',grenadier:'GRENADIER',engineer:'ENGINEER',motorcycle:'MOTORCYCLE',technical:'TECHNICAL',truck:'TROOP TRUCK',engineertruck:'ENGINEER TRUCK',halftrack:'HALFTRACK',apc:'APC',stug:'STURMGESCHÜTZ',tank:'TANK',fieldbunker:'FIELD BUNKER'};
const BEST={personnel:'mg',armor:'ap',cover:'he'};
const EFF={mg:{personnel:1.20,armor:.08,cover:.20},ap:{personnel:.20,armor:1.35,cover:.38},he:{personnel:.78,armor:.22,cover:1.65}};
const AMMOCOL={mg:'#e1e9b9',ap:'#9ed1df',he:'#f0c65f'};
const state={wave:0,phase:'ready',phaseIndex:0,phaseName:'',supply:70,hp:180,maxhp:180,armor:60,ammo:{mg:120,ap:20,he:12},damageLvl:1,coolLvl:1,heat:0,overheated:false,trigger:0,enemies:[],shots:[],fx:[],corpses:[],craters:[],queue:[],spawnClock:0,id:0,waveKills:0,waveBounty:0,chain:0,chainClock:0,shake:0,ambientT:0,engineT:0};

// ---------- AUDIO // hybrid embedded sample bank + WebAudio synthesis ----------
