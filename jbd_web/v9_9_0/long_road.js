(()=>{
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("roadGame"),g=canvas.getContext("2d",{alpha:false});
const ui={overlay:$("roadOverlay"),title:$("panelTitle"),body:$("panelBody"),choices:$("choiceRow"),start:$("startButton"),newRun:$("newRun"),help:$("panelHelp"),
 hp:$("hp"),health:$("healthFill"),biome:$("biome"),progress:$("progress"),kills:$("kills"),next:$("nextChoice"),
 ammo:$("ammo"),powers:$("powerRow"),pause:$("pause"),target:$("targetLabel")};
const SPEED=1.5,THRESHOLD=8,TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t;
const dist=(x,y,x2,y2)=>Math.hypot(x-x2,y-y2);
let W=390,H=780,DPR=1,CHUNK=780,state=null,phase="menu",holding=false,targetMode=null;
let aim={x:195,y:280},last=0,uiTimer=0,seed=7919,textureCache=new Map(),spriteCache=new Map();
let audio=null,lastMGSound=0,saveClock=0;
const SAVE_KEY="jbd989-long-road-v1";
const BIOMES=[
 {key:"jungle",name:"JUNGLE",ground:"#4c6b47",accent:"#284c39",road:"#74684b",types:["palm","palm","leaf","log","hut","puddle","roots"]},
 {key:"city",name:"OLD CITY",ground:"#7b8278",accent:"#596858",road:"#9e9589",types:["house","house","garden","lamp","fence","wreck","wall"]},
 {key:"checkpoint",name:"BORDER CHECKPOINT",ground:"#80775f",accent:"#68654d",road:"#9a8d72",types:["wire","sandbags","barrier","watch","crate","wreck","wall"]},
 {key:"mountain",name:"MOUNTAIN VILLAGE",ground:"#878a72",accent:"#666d60",road:"#aaa083",types:["rock","rock","pine","stonewall","hut","log","well"]},
 {key:"forest",name:"PINE FOREST",ground:"#597258",accent:"#38573e",road:"#7d765b",types:["pine","pine","tree","log","shrub","rock","roots"]},
 {key:"desert",name:"DESERT",ground:"#b09a70",accent:"#967c58",road:"#c1a77a",types:["dune","rock","crate","sandbags","scrub","hut","puddle"]},
 {key:"suburb",name:"SUBURBS",ground:"#838b75",accent:"#627a61",road:"#a09a86",types:["house","garden","tree","fence","lamp","shed","well"]},
 {key:"coast",name:"COAST",ground:"#879287",accent:"#607d79",road:"#a4a090",types:["lighthouse","puddle","rock","bunker","scrub","crate","wreck"]},
 {key:"ruins",name:"CITY RUINS",ground:"#77756d",accent:"#57574e",road:"#908b80",types:["ruins","ruins","wall","wreck","rubble","crate","wire"]},
 {key:"snow",name:"SNOW RIDGE",ground:"#c0c7c3",accent:"#9faeaa",road:"#b0afaa",types:["pine","pine","rock","snowbank","hut","log","wall"]},
 {key:"industrial",name:"FACTORY YARD",ground:"#818581",accent:"#666d69",road:"#9b9890",types:["container","crate","pipes","wall","wreck","shed","lamp"]},
 {key:"village",name:"VILLAGE",ground:"#929177",accent:"#718162",road:"#a99d7e",types:["hut","house","fence","well","hay","tree","garden"]},
 {key:"metropolis",name:"METROPOLIS",ground:"#898b87",accent:"#6b7270",road:"#9c9b96",types:["house","house","ruins","lamp","container","wreck","garden"]}
];
const SOLID=new Set(["log","hut","house","fence","wreck","wall","rock","wire","sandbags","barrier","watch","crate","stonewall","tree","pine","bunker","container","shed","well","lighthouse","ruins"]);
const UPGRADE=[
 {id:"damage",name:"HEAVY ROUNDS",desc:"MG-kogels doen 25% extra schade.",cat:"WEAPON"},
 {id:"rate",name:"GUN CYCLING",desc:"15% sneller automatisch vuren.",cat:"WEAPON"},
 {id:"aim",name:"STEADY TURRET",desc:"20% minder spreiding, effectiever op afstand.",cat:"WEAPON"},
 {id:"mag",name:"EXTENDED BELT",desc:"+15 kogels in het magazijn; direct gevuld.",cat:"WEAPON"},
 {id:"armor",name:"ARMOR PLATES",desc:"+25 maximale HP én 25 HP herstel.",cat:"DEFENSE"},
 {id:"repair",name:"FIELD REPAIR",desc:"Herstel direct 45 HP.",cat:"DEFENSE"},
 {id:"escort",name:"INFANTRY SUPPORT",desc:"Een extra soldaat rijdt en loopt mee (max. 5).",cat:"SQUAD"},
 {id:"medic",name:"FIELD MEDIC",desc:"Medic loopt mee en repareert periodiek je tank.",cat:"SQUAD"},
 {id:"allies",name:"TRAINED ESCORT",desc:"Eigen soldaten schieten iets sneller en nauwkeuriger.",cat:"SQUAD"},
 {id:"pierce",name:"AP AMMUNITION",desc:"Kogels dringen door een extra doelwit heen.",cat:"WEAPON"},
 {id:"shells",name:"EXPLOSIVE TIPS",desc:"Kleine explosie bij treffers.",cat:"WEAPON"},
 {id:"vehicle",name:"ANTI-ARMOR KIT",desc:"+40% MG-schade aan vijandelijke voertuigen.",cat:"WEAPON"},
 {id:"napalm",name:"NAPALM STRIKE",desc:"+1 aanval. Activeer onderin en kies zelf het inslagpunt.",cat:"TACTICAL"},
 {id:"artillery",name:"ARTILLERY BARRAGE",desc:"+2 gerichte artillerieaanvallen.",cat:"TACTICAL"},
 {id:"smoke",name:"SMOKE SCREEN",desc:"+1 rookgordijn. Vermindert inkomende treffers.",cat:"TACTICAL"},
 {id:"supply",name:"SUPPLY DROP",desc:"+1 voorraadpakket. Kies de plek en herstel je tank.",cat:"TACTICAL"},
 {id:"engine",name:"LOW-GEAR UPGRADE",desc:"Tank rijdt iets sneller (tot 2 pixels/seconde).",cat:"MOBILITY"}
];
const COLORS={body:"#79856b",bodyDark:"#3f4c43",hull:"#717c6a",tan:"#aa936e",blue:"#6f8a83"};
function seeded(n){let x=(n>>>0)||1;return ()=>{x=(x+0x6D2B79F5)|0;let t=Math.imul(x^(x>>>15),1|x);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
function hash(n){let x=n|0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return (x^(x>>>16))>>>0;}
function hexRgb(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function colorMix(a,b,t){const x=hexRgb(a),y=hexRgb(b);return "rgb("+x.map((v,i)=>Math.round(mix(v,y[i],t))).join(",")+")";}
function stageAt(wy){return Math.floor(Math.max(0,wy)/CHUNK);}
function blendAt(wy){
 const section=wy/(5*CHUNK),biomeIndex=Math.floor(Math.max(0,section));
 const frac=Math.max(0,section-biomeIndex)*5;
 const a=biomeIndex%BIOMES.length,b=(biomeIndex+1)%BIOMES.length;
 return {a,b,t:frac<=3?0:clamp((frac-3)/2,0,1),section:biomeIndex,local:frac};
}
function roadAt(wy){return W*.5+Math.sin(wy/315+seed*.03)*W*.09+Math.sin(wy/145+seed*.001)*W*.023;}
function groundPoint(x,wy,r=8){
 if(Math.abs(x-roadAt(wy))<40+r)return true;
 const list=propsAround(wy);
 for(let i=0;i<list.length;i++){let o=list[i];if(o.solid&&dist(x,wy,o.x,o.wy)<r+o.r)return false;}
 return true;
}
function playerY(){return H*.79;}
function sy(wy){return playerY()-(wy-state.distance);}
function worldY(screenY){return state.distance+playerY()-screenY;}
function visibleChunkRange(){return [Math.floor((state.distance+playerY()-H-80)/CHUNK)-1,Math.floor((state.distance+playerY()+90)/CHUNK)+1];}
function makeChunk(k){
 const r=seeded(hash((k+1009)*71^seed)),objects=[];
 const count=20+Math.min(13,Math.floor(Math.max(0,k)/5));
 for(let i=0;i<count;i++){
  const wy=k*CHUNK+r()*CHUNK,x=22+r()*(W-44);
  const b=blendAt(wy),which=r()<b.t?b.b:b.a,biome=BIOMES[which],type=biome.types[(r()*biome.types.length)|0],size=type==="lighthouse"?45:type==="house"||type==="container"||type==="ruins"?34:15+r()*19;
  if(Math.abs(x-roadAt(wy))<size+49)continue;
  const o={x,wy,type,biome:which,r:Math.max(7,size*.38),size,variant:(r()*3)|0,solid:SOLID.has(type)};
  let conflict=false;
  for(let z=0;z<objects.length;z++){let q=objects[z];if(q.solid&&o.solid&&dist(q.x,q.wy,x,wy)<q.r+o.r+10){conflict=true;break;}}
  if(!conflict)objects.push(o);
 }
 return {k,objects,bg:null};
}
function getChunk(k){if(!state.chunks.has(k))state.chunks.set(k,makeChunk(k));return state.chunks.get(k);}
function propsAround(wy){
 let list=[];for(let k=Math.floor((wy-60)/CHUNK);k<=Math.floor((wy+60)/CHUNK);k++)list.push(...getChunk(k).objects);
 return list;
}
function readSave(){
 try{const x=JSON.parse(localStorage.getItem(SAVE_KEY));return x&&x.version===989&&x.stats&&x.stats.hp>0?x:null;}catch(e){return null;}
}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function saveProgress(){
 if(!state||phase==="gameover"||phase==="menu")return;
 const keys=["distance","speed","time","hp","maxHp","kills","allyKills","killGoal","choices","mag","ammo","reload","reloadT","fireCycle","damage","spread","range","ap","blast","vehicleBonus","allyPower","medic","spawnT","spawnCount"];
 const stats={};for(const k of keys)stats[k]=state[k];
 const payload={version:989,seed,stats,escorts:state.escorts.map(a=>({id:a.id,side:a.side,forward:a.forward,role:a.role,fireCd:a.fireCd})),powers:state.powers};
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(payload));}catch(e){}
}
function restoreProgress(payload){
 let x=makeState();
 Object.assign(x,payload.stats);
 x.powers=Object.assign(x.powers,payload.powers||{});
 x.roadX=roadAt(x.distance);
 x.escorts=(payload.escorts||[]).slice(0,5).map((a,i)=>({
   id:a.id,side:a.side,forward:a.forward,role:a.role,fireCd:a.fireCd,
   x:x.roadX+(i%2?-30:30),wy:x.distance+Math.min(playerY()-H*.52,72+i*18)
 }));
 if(!x.escorts.length)x.escorts=makeState().escorts;
 x.chunks=new Map();x.enemies=[];x.shots=[];x.particles=[];x.fireZones=[];x.smokes=[];
 x.spawnT=Math.min(2.2,x.spawnT||2.2);
 return x;
}
function makeState(){
 return {distance:0,speed:SPEED,time:0,hp:140,maxHp:140,kills:0,allyKills:0,killGoal:THRESHOLD,choices:0,
  mag:50,ammo:50,reload:2.5,reloadT:0,fireCd:0,fireCycle:.1,damage:12,spread:.062,range:600,ap:0,blast:0,vehicleBonus:1,
  escorts:[{id:1,side:-1,forward:75,wy:75,x:W*.5-30,role:"rifle",fireCd:.4},{id:2,side:1,forward:92,wy:92,x:W*.5+30,role:"rifle",fireCd:.7},{id:3,side:-1,forward:108,wy:108,x:W*.5-8,role:"rifle",fireCd:1.1}],
  allyPower:1,medic:false,powers:{napalm:0,artillery:0,smoke:0,supply:0},fx:[],fireZones:[],smokes:[],
  enemies:[],shots:[],particles:[],chunks:new Map(),spawnT:2,spawnCount:0,overheat:0,flash:0,screenShake:0,wind:0,
  aimX:W*.5,aimY:H*.25,roadX:W*.5,elite:0,damageT:0};
}
function paintChunk(chunk){
 const c=document.createElement("canvas");c.width=Math.ceil(W);c.height=Math.ceil(CHUNK);
 const b=c.getContext("2d",{alpha:false}),rr=seeded(hash((chunk.k+10)*4719^seed));
 for(let y=0;y<CHUNK;y+=6){
  const wy=(chunk.k+1)*CHUNK-y-3,theme=blendAt(wy),aa=BIOMES[theme.a],bb=BIOMES[theme.b];
  b.fillStyle=colorMix(aa.ground,bb.ground,theme.t);b.fillRect(0,y,W,7);
  if(y%12===0){b.fillStyle=colorMix(aa.accent,bb.accent,theme.t);b.globalAlpha=.10;
   b.fillRect((rr()*W)|0,y,8+rr()*25,1+rr()*4);b.globalAlpha=1;}
  const x=roadAt(wy),road=colorMix(aa.road,bb.road,theme.t),width=47;
  b.fillStyle="#4a493a";b.globalAlpha=.46;b.fillRect(x-width*.5-5,y,width+10,7);b.globalAlpha=1;
  b.fillStyle=road;b.fillRect(x-width*.5,y,width,7);
  b.fillStyle="rgba(31,31,29,.10)";b.fillRect(x-14,y,4,7);b.fillRect(x+10,y,4,7);
  b.fillStyle="rgba(235,223,188,.10)";b.fillRect(x-2,y,3,7);
 }
 // Persistent ground details drawn only once per chunk, not each frame.
 for(let n=0;n<CHUNK*.31;n++){
  const yy=rr()*CHUNK,wy=(chunk.k+1)*CHUNK-yy,xx=rr()*W,bi=blendAt(wy);
  if(Math.abs(xx-roadAt(wy))<31)continue;
  b.fillStyle=colorMix(BIOMES[bi.a].accent,BIOMES[bi.b].accent,bi.t);
  b.globalAlpha=.23+rr()*.19;
  b.fillRect(xx,yy,rr()<.83?1:3,rr()<.72?2:5);
 }
 b.globalAlpha=1;
 chunk.bg=c;
}
function prepareVisibleChunks(){
 let [lo,hi]=visibleChunkRange();
 for(let k=lo;k<=hi;k++){let ch=getChunk(k);if(!ch.bg)paintChunk(ch);}
 for(const k of state.chunks.keys())if(k<lo-2||k>hi+2)state.chunks.delete(k);
}
function ellipse(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
function line(c,x,y,x2,y2,col,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
function sprite(type,biome,variant){
 const key=type+"|"+biome+"|"+variant;
 if(spriteCache.has(key))return spriteCache.get(key);
 const c=document.createElement("canvas");c.width=c.height=90;let b=c.getContext("2d");
 let r=seeded(hash(type.length*991+biome*711+variant*113)),cx=45,cy=44;
 let greens=["#1e5138","#458552","#779f63"],stone=["#70766f","#a1a69b","#c2bbaa"],wood=["#695942","#9b8969","#c7af86"];
 b.save();ellipse(b,cx+4,cy+7,32,25,"#131d1759");
 if(["palm","tree","pine","shrub","leaf","roots","scrub","garden"].includes(type)){
  if(type==="palm"){
   ellipse(b,cx,cy,7,7,"#725b3b");
   for(let i=0;i<10;i++){let a=TAU*i/10+variant*.12,dx=Math.cos(a),dy=Math.sin(a),L=29+r()*9;
    b.fillStyle=greens[(i+variant)%3];b.beginPath();b.moveTo(cx,cy);
    b.quadraticCurveTo(cx+dx*L*.5-dy*8,cy+dy*L*.5+dx*8,cx+dx*L,cy+dy*L*.86);
    b.quadraticCurveTo(cx+dx*L*.5+dy*7,cy+dy*L*.5-dx*7,cx,cy);b.fill();
    line(b,cx,cy,cx+dx*L,cy+dy*L*.86,"#224632",1);}
   ellipse(b,cx,cy,4,4,"#b9a177");
  }else{
   let n=type==="pine"?5:11;
   for(let i=0;i<n;i++){let a=TAU*i/n,dd=type==="pine"?18:21;
    ellipse(b,cx+Math.cos(a)*dd*.65,cy+Math.sin(a)*dd*.6,type==="pine"?19:9+r()*7,type==="pine"?13:11+r()*6,greens[(i+biome)%3]);}
   if(type==="tree")ellipse(b,cx,cy,5,5,"#907a53");
   for(let k=0;k<12;k++)line(b,cx+(r()-.5)*39,cy+(r()-.5)*28,cx+(r()-.5)*32,cy+(r()-.5)*30,"#8bab78",.6);
  }
 }else if(["rock","snowbank","dune","rubble"].includes(type)){
  let fill=type==="snowbank"?"#e7e8df":type==="dune"?"#cdb48a":"#898c85";
  b.fillStyle=fill;b.strokeStyle="#50564c";b.lineWidth=2;
  b.beginPath();b.moveTo(15,34);b.lineTo(30,17);b.lineTo(61,21);b.lineTo(76,45);b.lineTo(63,68);b.lineTo(25,65);b.closePath();b.fill();b.stroke();
  b.fillStyle="#d7d5c6";b.beginPath();b.moveTo(20,33);b.lineTo(32,19);b.lineTo(58,22);b.lineTo(51,40);b.closePath();b.fill();
  for(let i=0;i<8;i++){let x=28+r()*33,y=34+r()*22;line(b,x,y,x+3+r()*5,y-2-r()*5,"#545a57",1.2);}
 }else if(["house","hut","shed","watch","bunker","ruins","lighthouse"].includes(type)){
  if(type==="lighthouse"){
   ellipse(b,cx,cy,32,32,"#847c67");ellipse(b,cx,cy,27,27,"#c9c1a9");
   for(let i=0;i<12;i++){let a=i*TAU/12;line(b,cx+Math.cos(a)*25,cy+Math.sin(a)*25,cx+Math.cos(a)*32,cy+Math.sin(a)*32,"#635947",3);}
   ellipse(b,cx,cy,18,18,"#ba5644");ellipse(b,cx,cy,12,12,"#f8eed3");ellipse(b,cx,cy,7,7,"#c8b05c");
  }else{
   let roofless=type!=="watch",base=type==="hut"?"#9c8563":type==="ruins"?"#777a74":"#a09e8a";
   b.fillStyle=base;b.fillRect(15,19,60,53);
   b.strokeStyle="#48483e";b.lineWidth=5;
   b.beginPath();b.moveTo(15,19);b.lineTo(75,19);b.moveTo(15,19);b.lineTo(15,72);b.moveTo(75,19);b.lineTo(75,72);
   b.moveTo(15,72);b.lineTo(35,72);b.moveTo(55,72);b.lineTo(75,72);b.stroke();
   if(roofless){
    for(let i=0;i<7;i++){let x=20+r()*50,y=26+r()*36;b.fillStyle=i%2?"#6c6b5c":"#b4aa91";b.fillRect(x,y,5+r()*8,4+r()*5);}
    b.fillStyle="#4e5049";b.fillRect(39,48,17,11);line(b,23,33,31,36,"#50584c",1.4);
   }else{b.fillStyle="#686e5d";b.fillRect(23,25,42,40);line(b,29,30,59,30,"#b3b6a8",2);}
  }
 }else if(["wire","fence","stonewall","wall","barrier","sandbags","log","roots","hay"].includes(type)){
  if(type==="log"||type==="roots"||type==="hay"){
   b.save();b.translate(cx,cy);b.rotate(-.28+variant*.24);
   for(let i=0;i<4;i++){b.fillStyle=type==="hay"?"#bca977":"#69553c";b.fillRect(-32,-17+i*10,64,8);
    for(let j=0;j<6;j++)line(b,-26+j*10,-16+i*10,-24+j*10,-11+i*10,"#c5a06d",.8);}b.restore();
  }else if(type==="sandbags"){
   for(let i=0;i<7;i++){ellipse(b,11+i*11,44+(i%2)*3,8,5,"#9b936b");line(b,7+i*11,42,12+i*11,42,"#d3c59b",1);}
  }else{
   for(let i=0;i<7;i++){
    let x=15+i*10;b.fillStyle=type==="wire"?"#5b635b":type==="barrier"?"#bc9f68":"#918c7b";
    b.fillRect(x,36,8,14);
    if(type==="wire"){line(b,x,35,x+10,52,"#323d37",1);ellipse(b,x,43,2,2,"#404944");}
    else if(type==="barrier")line(b,x,38,x+8,46,"#5b4a39",2);
   }
  }
 }else if(["container","crate","pipes","wreck"].includes(type)){
  b.fillStyle=type==="container"?"#60716b":type==="wreck"?"#4b4a43":"#987d53";
  b.fillRect(19,21,52,49);b.strokeStyle="#353d36";b.lineWidth=4;b.strokeRect(19,21,52,49);
  if(type==="wreck"){ellipse(b,45,43,17,12,"#272d29");for(let i=0;i<7;i++)line(b,20+r()*50,22+r()*46,23+r()*50,23+r()*46,"#c09869",1);}
  else for(let i=0;i<7;i++)line(b,23+i*7,24,23+i*7,66,"#454d43",1);
 }else if(["puddle","well"].includes(type)){
  ellipse(b,cx,cy,28,23,"#445d55");ellipse(b,cx,cy,22,17,"#718f83");ellipse(b,cx-6,cy-7,10,3,"#c0cbbc");
 }else{ // noninteractive environmental accents
  for(let i=0;i<10;i++)ellipse(b,cx+(r()-.5)*50,cy+(r()-.5)*46,3+r()*5,2+r()*4,greens[i%3]);
 }
 b.restore();spriteCache.set(key,c);return c;
}
function drawWorld(){
 prepareVisibleChunks();
 const [lo,hi]=visibleChunkRange();
 for(let k=lo;k<=hi;k++){
  const chunk=getChunk(k),screenTop=sy((k+1)*CHUNK);
  g.drawImage(chunk.bg,0,Math.floor(screenTop),W,Math.ceil(CHUNK)+1);
  for(const o of chunk.objects){
   let y=sy(o.wy),size=o.size*2.15;
   if(y<-60||y>H+60)continue;
   g.drawImage(sprite(o.type,o.biome,o.variant),o.x-size/2,y-size/2,size,size);
  }
 }
}
function gunSound(){
 if(!audio)return;const now=audio.currentTime;if(now-lastMGSound<.045)return;lastMGSound=now;
 try{
  let count=audio.sampleRate*.038,buffer=audio.createBuffer(1,count,audio.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){let env=Math.pow(1-i/data.length,3);data[i]=(Math.random()*2-1)*env*.67;}
  let source=audio.createBufferSource(),lp=audio.createBiquadFilter(),gain=audio.createGain();
  source.buffer=buffer;lp.type="lowpass";lp.frequency.value=1400;gain.gain.value=.14;
  source.connect(lp);lp.connect(gain);gain.connect(audio.destination);source.start();
 }catch(e){}
}
function popSound(freq=190){if(!audio)return;try{
 const osc=audio.createOscillator(),vol=audio.createGain(),t=audio.currentTime;
 osc.type="triangle";osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(55,t+.10);
 vol.gain.setValueAtTime(.10,t);vol.gain.exponentialRampToValueAtTime(.001,t+.11);
 osc.connect(vol);vol.connect(audio.destination);osc.start(t);osc.stop(t+.12);
}catch(e){}}
function audioUnlock(){if(audio){audio.resume?.();return;}const AC=window.AudioContext||window.webkitAudioContext;if(AC){try{audio=new AC();}catch(e){}}}
function burst(x,wy,color,n=9){
 for(let i=0;i<n;i++){let a=Math.random()*TAU,s=20+Math.random()*90;
  state.particles.push({x,wy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:1+Math.random()*3,t:.3+Math.random()*.45,color});
 }
 state.screenShake=Math.min(5,state.screenShake+1.5);
}
function spawnEnemy(type,wy,x,role){
 const size=type==="vehicle"?16:type==="heli"?19:6;
 const foe={id:state.spawnCount++*50+Math.random(),type,role:role||"rifle",x,wy,r:size,
  hp:type==="vehicle"?95+Math.min(160,state.distance/250):type==="heli"?130:20+Math.min(16,state.distance/900),
  maxHp:0,spd:type==="vehicle"?18:type==="heli"?25:9+Math.random()*4,
  fireCd:.6+Math.random(),wander:Math.random()*TAU,flash:0,leader:role==="officer",dropT:3,
  alive:true};foe.maxHp=foe.hp;state.enemies.push(foe);return foe;
}
function spawnAttack(){
 let front=state.distance+playerY()+55,road=roadAt(front),rng=Math.random;
 let n=Math.floor(state.time/30),wave=(state.spawnCount/8)|0;
 if(wave%7===5&&state.enemies.length<26){
  let e=spawnEnemy("heli",front+30,W*(rng()<.5?.20:.80));e.spd=20;e.dropT=2.5;
 }else if(wave%4===3&&state.enemies.length<27){
  let e=spawnEnemy("vehicle",front+15,road+(rng()-.5)*17);
  e.fireCd=.8;
  for(let i=0;i<2;i++)spawnEnemy("infantry",front+48+i*17,clamp(road+(i?54:-54),15,W-15),"rifle");
 }else{
  const quantity=clamp(4+(n/2|0),4,7);
  for(let i=0;i<quantity;i++){
   let x=clamp(road+(i-(quantity-1)/2)*26+(rng()-.5)*22,15,W-15);
   spawnEnemy("infantry",front+Math.floor(i/3)*24,x,i===0&&wave%3===0?"lmg":"rifle");
  }
 }
}
function fireMG(){
 if(!state||phase!=="playing"||state.fireCd>0||state.reloadT>0)return false;
 if(state.ammo<=0){state.reloadT=state.reload;return false;}
 const pY=playerY(),dx=aim.x-state.roadX,dy=pY-aim.y,angle=Math.atan2(dy,dx);
 // Looking near the tank is intentionally inaccurate; forward shots have controlled spread.
 const spread=state.spread*(.55+Math.random()*1.0),a=angle+(Math.random()-.5)*spread*2;
 const sx=state.roadX+Math.cos(a)*21,wy=state.distance+Math.sin(a)*18;
 state.shots.push({x:sx,wy,vx:Math.cos(a)*745,vy:Math.sin(a)*745,ttl:state.range/745,damage:state.damage,owner:"player",hits:0,pierce:state.ap,hitIds:[],trail:2});
 state.ammo--;state.fireCd=state.fireCycle;state.flash=.09;state.screenShake=Math.max(state.screenShake,1.1);gunSound();
 if(state.ammo<=0)state.reloadT=state.reload;
 return true;
}
function closestEnemy(x,wy,range){
 let best=null,score=range*range;
 for(const e of state.enemies){if(!e.alive)continue;let d=(e.x-x)**2+(e.wy-wy)**2;if(d<score){score=d;best=e;}}
 return best;
}
function addKill(e,source){
 if(!e.alive)return;
 e.alive=false;burst(e.x,e.wy,e.type==="vehicle"?"#d47c38":"#a44d36",e.type==="vehicle"?20:9);
 popSound(e.type==="vehicle"?75:145);
 if(source==="player"){state.kills++;if(state.kills>=state.killGoal)offerUpgrade();}
 else state.allyKills++;
}
function damageEnemy(e,amount,source){
 if(!e.alive)return;
 e.hp-=amount;e.flash=.13;
 if(e.hp<=0)addKill(e,source);
}
function addShot(owner,x,wy,tx,ty,damage,speed=300){
 const a=Math.atan2(ty-wy,tx-x),random=owner==="ally"?.12:.085,angle=a+(Math.random()-.5)*random;
 state.shots.push({owner,x,wy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,ttl:1.8,damage,pierce:0,hits:0,hitIds:[]});
}
function projectileBlocked(x,wy){for(const o of propsAround(wy)){
 if(o.solid&&dist(x,wy,o.x,o.wy)<o.r*.85+2)return true;
}return false;}
function updateShots(dt){
 for(const b of state.shots){
  let travel=Math.hypot(b.vx,b.vy)*dt,steps=Math.max(1,Math.ceil(travel/9));
  for(let i=0;i<steps&&b.ttl>0;i++){
   b.x+=b.vx*dt/steps;b.wy+=b.vy*dt/steps;
   if(projectileBlocked(b.x,b.wy)){b.ttl=0;burst(b.x,b.wy,"#cab77e",3);break;}
   if(b.owner==="player"||b.owner==="ally"){
    let hit=null;
    for(const e of state.enemies)if(e.alive&&!b.hitIds.includes(e.id)&&dist(b.x,b.wy,e.x,e.wy)<e.r+4){hit=e;break;}
    if(hit){
      let dmg=b.damage*(hit.type==="vehicle"?state.vehicleBonus:1);
      damageEnemy(hit,dmg,b.owner);b.hits++;b.hitIds.push(hit.id);
      if(state.blast>0){
       burst(b.x,b.wy,"#e1a55a",4);
       for(const e of state.enemies)if(e!==hit&&e.alive&&dist(e.x,e.wy,b.x,b.wy)<27)damageEnemy(e,state.blast,b.owner);
      }
      if(b.hits>b.pierce){b.ttl=0;break;}else hit._hitThisShot=true;
    }
   }else{
    let tankHit=dist(b.x,b.wy,state.roadX,state.distance)<19;
    if(tankHit){
      let smokeProtected=state.smokes.some(f=>dist(f.x,f.wy,state.roadX,state.distance)<f.radius&&f.t>0);
      if(!smokeProtected||Math.random()>.68)damagePlayer(b.damage);
      b.ttl=0;break;
    }
    for(const a of state.escorts)if(dist(b.x,b.wy,a.x,a.wy)<6){b.ttl=0;burst(b.x,b.wy,"#9a8663",2);break;}
   }
  }
  b.ttl-=dt;
 }
 state.shots=state.shots.filter(b=>b.ttl>0&&Math.abs(sy(b.wy))<H+160&&b.x>-100&&b.x<W+100);
 }
function damagePlayer(damage){
 state.hp=Math.max(0,state.hp-damage);state.damageT=.3;state.screenShake=Math.max(state.screenShake,2.8);
 if(state.hp<=0)gameOver();
}
function updateEscorts(dt){
 const maxAhead=playerY()-H*.52;
 for(let i=0;i<state.escorts.length;i++){
  const a=state.escorts[i],ahead=Math.min(maxAhead,72+i*18),goalY=state.distance+ahead;
  a.wy+=clamp((goalY-a.wy)*2.8*dt,-18*dt,18*dt);
  let targetX=roadAt(a.wy)+(i%2?1:-1)*(28+(i%3)*10);
  if(projectileBlocked(targetX,a.wy))targetX=roadAt(a.wy)+(i%2?-1:1)*12;
  a.x+=clamp((targetX-a.x)*2.5*dt,-38*dt,38*dt);
  a.fireCd-=dt;if(a.fireCd<=0){
   a.fireCd=a.role==="medic"?3:mix(1.8,.85,clamp((state.allyPower-1)*.7,0,1));
   if(a.role==="medic"){state.hp=Math.min(state.maxHp,state.hp+2.8);continue;}
   let target=closestEnemy(a.x,a.wy,230);
   if(target)addShot("ally",a.x,a.wy,target.x,target.wy,4*state.allyPower,390);
  }
 }
}
function updateEnemies(dt){
 for(const e of state.enemies){
  if(!e.alive)continue;e.fireCd-=dt;e.flash=Math.max(0,e.flash-dt);
  if(e.type==="heli"){
   e.wy-=e.spd*dt;e.x+=Math.sin(state.time*1.5+e.id)*8*dt;e.dropT-=dt;
   if(e.dropT<=0&&e.wy>state.distance+65){
    e.dropT=5;
    for(let i=-1;i<=1;i++){let tx=clamp(e.x+i*29,20,W-20),ty=e.wy-15;
      if(!groundPoint(tx,ty,7)){tx=roadAt(ty)+i*17;}
      spawnEnemy("infantry",ty,tx,"rifle");
    }
   }
  }else{
   const forward=state.distance+12;let dx=state.roadX-e.x,d=forward-e.wy;
   const fz=state.fireZones.find(f=>f.t>0&&dist(e.x,e.wy,f.x,f.wy)<f.radius+8);
   if(fz){e.x+=Math.sign(e.x-fz.x||1)*24*dt;damageEnemy(e,10*dt,"player");continue;}
   if(e.type==="vehicle"){
    const road=roadAt(e.wy),delta=road-e.x;e.x+=clamp(delta,-1,1)*Math.min(Math.abs(delta)*dt*1.5,18*dt);
    e.wy-=e.spd*dt;
   }else{
    let shift=Math.sin(e.wander+state.time*.47)*16;
    e.x+=clamp((state.roadX+shift-e.x)*dt*.32,-15*dt,15*dt);
    e.wy-=e.spd*dt;
    if(projectileBlocked(e.x,e.wy))e.x+=Math.sign(e.x-roadAt(e.wy)||1)*25*dt;
   }
   if(e.wy<=forward+225&&e.wy>forward+18&&e.fireCd<=0){
    e.fireCd=e.role==="lmg"?1.2:e.type==="vehicle"?1.4:2.0+Math.random()*.9;
    let target=state.escorts.length&&Math.random()<.28?state.escorts[(Math.random()*state.escorts.length)|0]:null;
    addShot("enemy",e.x,e.wy,target?target.x:state.roadX,target?target.wy:state.distance,
     e.type==="vehicle"?6.8:3.0,240);
   }
  }
  if(e.wy<state.distance-110){e.alive=false;state.allyKills+=0;}
 }
 state.enemies=state.enemies.filter(e=>e.alive&&e.wy<state.distance+H+230).slice(-65);
}
function updateZones(dt){
 for(const f of state.fireZones){f.t-=dt;if(f.t>0){
  if(Math.random()<dt*25)burst(f.x+(Math.random()-.5)*f.radius*1.6,f.wy+(Math.random()-.5)*f.radius*1.2,"#f28e3e",1);
  for(const e of state.enemies)if(e.alive&&dist(e.x,e.wy,f.x,f.wy)<f.radius)damageEnemy(e,(e.type==="vehicle"?20:32)*dt,"player");
 }}
 state.fireZones=state.fireZones.filter(f=>f.t>0);
 for(const f of state.smokes)f.t-=dt;state.smokes=state.smokes.filter(f=>f.t>0);
 for(const p of state.particles){p.x+=p.vx*dt;p.wy+=p.vy*dt;p.vx*=Math.exp(-dt*3);p.vy*=Math.exp(-dt*3);p.t-=dt;}
 state.particles=state.particles.filter(p=>p.t>0).slice(-140);
}
function step(dt){
 if(phase!=="playing"||!state)return;
 dt=clamp(dt,0,.045);state.time+=dt;state.distance+=state.speed*dt;state.roadX=roadAt(state.distance);
 state.fireCd=Math.max(0,state.fireCd-dt);state.reloadT=Math.max(0,state.reloadT-dt);
 if(state.reloadT===0&&state.ammo===0)state.ammo=state.mag;
 state.flash=Math.max(0,state.flash-dt);state.damageT=Math.max(0,state.damageT-dt);
 state.screenShake=Math.max(0,state.screenShake-dt*15);
 saveClock+=dt;if(saveClock>=12){saveClock=0;saveProgress();}
 if(holding&&targetMode===null)fireMG();
 state.spawnT-=dt;
 if(state.spawnT<=0){state.spawnT=clamp(6.2-state.distance/2200,3.2,6.2);spawnAttack();}
 updateEscorts(dt);updateEnemies(dt);updateShots(dt);updateZones(dt);
}
function allowedUpgrades(){
 return UPGRADE.filter(u=>u.id!=="medic"||!state.medic).filter(u=>u.id!=="escort"||state.escorts.length<5)
 .filter(u=>u.id!=="engine"||state.speed<2).filter(u=>u.id!=="rate"||state.fireCycle>.058)
 .filter(u=>u.id!=="aim"||state.spread>.018);
}
function chooseOptions(){
 const pool=allowedUpgrades(),rng=seeded(hash(seed+state.kills*7091+state.choices*1553));
 const a=pool.splice((rng()*pool.length)|0,1)[0],b=pool.splice((rng()*pool.length)|0,1)[0];return [a,b];
}
function offerUpgrade(){
 if(phase!=="playing")return;
 holding=false;phase="upgrade";state.choices++;
 ui.title.textContent="CHOOSE YOUR UPGRADE";
 ui.body.textContent=""+state.kills+" PLAYER KILLS · Je kiest één van twee tactische verbeteringen. De wereld en alle vijanden staan even stil.";
 ui.choices.innerHTML="";ui.choices.style.display="grid";ui.start.style.display="none";ui.help.textContent="Kies één kaart om meteen door te rijden.";
 for(const u of chooseOptions()){
  const btn=document.createElement("button");btn.className="choice";btn.type="button";
  const strong=document.createElement("strong"),desc=document.createElement("span"),tag=document.createElement("em");
  strong.textContent=u.name;desc.textContent=u.desc;tag.textContent=u.cat;
  btn.append(strong,desc,tag);btn.onclick=()=>applyUpgrade(u.id);ui.choices.append(btn);
 }
 ui.overlay.classList.remove("hidden");
}
function applyUpgrade(id){
 if(phase!=="upgrade")return;
 switch(id){
 case "damage":state.damage*=1.25;break;
 case "rate":state.fireCycle=Math.max(.055,state.fireCycle*.85);break;
 case "aim":state.spread=Math.max(.016,state.spread*.80);break;
 case "mag":state.mag+=15;state.ammo=state.mag;state.reloadT=0;break;
 case "armor":state.maxHp+=25;state.hp=Math.min(state.maxHp,state.hp+25);break;
 case "repair":state.hp=Math.min(state.maxHp,state.hp+45);break;
 case "escort":addEscort("rifle");break;
 case "medic":state.medic=true;addEscort("medic");break;
 case "allies":state.allyPower*=1.25;break;
 case "pierce":state.ap=Math.min(3,state.ap+1);break;
 case "shells":state.blast+=4;break;
 case "vehicle":state.vehicleBonus*=1.4;break;
 case "napalm":state.powers.napalm++;break;
 case "artillery":state.powers.artillery+=2;break;
 case "smoke":state.powers.smoke++;break;
 case "supply":state.powers.supply++;break;
 case "engine":state.speed=Math.min(2,state.speed+.15);break;
 }
 state.killGoal+=THRESHOLD;targetMode=null;phase="playing";saveProgress();
 ui.overlay.classList.add("hidden");refreshPowers();updateUi();
}
function addEscort(role){
 if(state.escorts.length>=5)return;let i=state.escorts.length;
 state.escorts.push({id:i+1,role,side:i%2?-1:1,forward:75+i*16,wy:state.distance+75+i*16,
 x:state.roadX+(i%2?-40:40),fireCd:1});
}
function launchSpecial(key,x,wy){
 if(!state||phase!=="playing"||!state.powers[key])return false;
 state.powers[key]--;targetMode=null;
 if(key==="napalm"){
  state.fireZones.push({x,wy,radius:60,t:10});burst(x,wy,"#f39a47",25);popSound(95);
 }else if(key==="artillery"){
  burst(x,wy,"#eac49b",35);popSound(57);
  for(const e of state.enemies)if(e.alive&&dist(e.x,e.wy,x,wy)<80)damageEnemy(e,e.type==="vehicle"?110:200,"player");
 }else if(key==="smoke"){
  state.smokes.push({x,wy,radius:90,t:12});burst(x,wy,"#c1c9b8",16);
 }else if(key==="supply"){
  if(dist(x,wy,state.roadX,state.distance)<160)state.hp=Math.min(state.maxHp,state.hp+60);
  else state.hp=Math.min(state.maxHp,state.hp+30);
  burst(x,wy,"#d9d99b",13);
 }
 ui.target.style.display="none";refreshPowers();return true;
}
function refreshPowers(){
 ui.powers.replaceChildren();
 if(!state)return;
 const names={napalm:"NAPALM",artillery:"ARTY",smoke:"SMOKE",supply:"SUPPLY"};
 for(const key of Object.keys(names))if(state.powers[key]>0){
  const b=document.createElement("button");b.type="button";b.className="chip power"+(targetMode===key?" targeting":"");
  b.textContent=names[key]+" ×"+state.powers[key];b.onclick=()=>{
   if(phase!=="playing")return;
   targetMode=targetMode===key?null:key;holding=false;refreshPowers();
   ui.target.textContent=targetMode?"TIK OP DE KAART VOOR "+names[key]:"";ui.target.style.display=targetMode?"block":"none";
  };ui.powers.append(b);
 }
}
function updateUi(){
 if(!state)return;
 ui.hp.textContent="HP "+Math.round(state.hp);
 ui.health.style.width=clamp(state.hp/state.maxHp,0,1)*100+"%";
 ui.kills.textContent=state.kills+" KILLS";
 ui.next.textContent="UPGRADE "+Math.max(0,state.killGoal-state.kills);
 ui.ammo.textContent=state.reloadT>0?"RELOAD "+state.reloadT.toFixed(1)+"s":"MG "+state.ammo+"/"+state.mag;
 let b=blendAt(state.distance+playerY()*.38);
 let lbl=BIOMES[b.a].name+(b.t>.01?" → "+BIOMES[b.b].name+" "+Math.round(b.t*100)+"%":"");
 ui.biome.textContent=lbl;
 const sec=stageAt(state.distance),stage=sec%5;
 ui.progress.textContent="SEGMENT "+(sec+1)+" · "+(stage<3?"BIOME "+(stage+1)+"/3":"TRANSITION "+(stage-2)+"/2")+" · "+state.speed.toFixed(1)+" PX/S";
}
function drawTank(){
 const x=state.roadX,y=playerY(),angle=Math.atan2(aim.y-y,aim.x-x);
 g.save();g.translate(x,y);
 ellipse(g,4,7,26,33,"#18221a9c");
 for(let side of [-1,1]){
  g.fillStyle="#2e3c34";g.fillRect(side*19-7,-25,14,53);
  for(let i=-21;i<25;i+=8){g.fillStyle=i%2?"#57645a":"#768474";g.fillRect(side*19-6,i,12,5);}
 }
 g.fillStyle=state.damageT>0?"#a8a08d":"#687c65";g.strokeStyle="#2e3b30";g.lineWidth=3;
 g.beginPath();g.roundRect(-18,-27,36,54,6);g.fill();g.stroke();
 for(let j=0;j<4;j++)line(g,-14,-20+j*12,14,-20+j*12,"#455443",1);
 g.save();g.rotate(angle+Math.PI/2);
 g.fillStyle="#434b3f";g.fillRect(-4,-38,8,36);
 g.fillStyle="#a7aa8d";g.fillRect(-2,-42,4,14);
 g.fillStyle="#80927a";ellipse(g,0,-5,13,14,"#80927a");
 g.strokeStyle="#303b30";g.lineWidth=2;g.strokeRect(-9,-16,18,19);
 g.fillStyle="#536b59";g.fillRect(-5,-9,10,10);
 if(state.flash>0){g.fillStyle="#fbeab1";g.beginPath();g.moveTo(0,-45);g.lineTo(-7,-59);g.lineTo(0,-54);g.lineTo(6,-62);g.lineTo(5,-45);g.fill();}
 g.restore();
 g.restore();
}
function drawInfantry(){
 for(const a of state.escorts){
  const y=sy(a.wy);if(y<0||y>H)continue;
  g.save();g.translate(a.x,y);ellipse(g,2,3,7,5,"#1c2a20a8");
  g.fillStyle=a.role==="medic"?"#c1c8b2":"#748871";
  g.beginPath();g.arc(0,0,5,0,TAU);g.fill();
  g.fillStyle="#3f4d39";g.fillRect(-3,-7,6,5);
  line(g,0,0,0,-13,"#333d33",2);
  if(a.role==="medic"){g.fillStyle="#ac443b";g.fillRect(-3,-2,6,3);g.fillRect(-1,-4,2,7);}
  g.restore();
 }
 for(const e of state.enemies){
  const y=sy(e.wy);if(y<-65||y>H+70)continue;
  if(e.type==="infantry"){
   ellipse(g,e.x+2,y+3,7,5,"#111b1580");
   g.fillStyle=e.flash>0?"#f9dcb2":e.role==="lmg"?"#6c6b4c":"#847e60";
   g.beginPath();g.arc(e.x,y,5.2,0,TAU);g.fill();
   line(g,e.x,y-1,e.x,y+10,"#383f32",2.5);line(g,e.x,y+10,e.x-3,y+13,"#333d30",1.4);
  }else if(e.type==="vehicle"){
   g.save();g.translate(e.x,y);ellipse(g,4,8,20,31,"#121c1880");
   g.fillStyle=e.flash>0?"#d4b999":"#74745d";g.fillRect(-15,-25,30,55);
   g.fillStyle="#393f38";g.fillRect(-19,-18,6,42);g.fillRect(13,-18,6,42);
   g.fillStyle="#a39d82";g.fillRect(-9,-15,18,24);g.fillStyle="#31382f";g.fillRect(-3,0,6,25);
   g.restore();
  }else{
   g.save();g.translate(e.x,y);ellipse(g,3,9,37,20,"#121a1488");
   g.fillStyle=e.flash>0?"#d3bc9c":"#77766c";g.fillRect(-22,-9,44,21);
   g.fillStyle="#444b43";g.fillRect(-4,-29,8,60);g.fillRect(-36,-3,72,7);
   g.translate(0,0);g.rotate(state.time*10);line(g,-27,-24,27,24,"#b4b4a8",3);line(g,-27,24,27,-24,"#b4b4a8",3);g.restore();
  }
  if(e.hp<e.maxHp){g.fillStyle="#292d29";g.fillRect(e.x-12,y-19,24,3);g.fillStyle="#c39e67";g.fillRect(e.x-12,y-19,24*clamp(e.hp/e.maxHp,0,1),3);}
 }
}
function drawEffects(){
 for(const f of state.fireZones){
  let y=sy(f.wy),r=f.radius;
  g.fillStyle="rgba(229,109,33,.27)";g.beginPath();g.arc(f.x,y,r,0,TAU);g.fill();
  for(let i=0;i<13;i++){let a=i*TAU/13+state.time*.27,rr=r*(.2+.65*(i%5)/5);
   ellipse(g,f.x+Math.cos(a)*rr,y+Math.sin(a)*rr,5+Math.sin(state.time*13+i)*3,8,"#e8813b99");}
 }
 for(const f of state.smokes){let y=sy(f.wy);g.fillStyle="rgba(184,193,178,.19)";g.beginPath();g.arc(f.x,y,f.radius,0,TAU);g.fill();}
 for(const b of state.shots){
  let y=sy(b.wy);g.strokeStyle=b.owner==="enemy"?"#db8360":b.owner==="ally"?"#bac8a7":"#ffe4a0";g.lineWidth=b.owner==="player"?2.1:1.2;
  g.beginPath();g.moveTo(b.x,y);g.lineTo(b.x-b.vx*.012,y+b.vy*.012);g.stroke();
 }
 for(const p of state.particles){let y=sy(p.wy);g.fillStyle=p.color;g.globalAlpha=clamp(p.t*2.2,0,1);g.fillRect(p.x-p.r/2,y-p.r/2,p.r,p.r);}
 g.globalAlpha=1;
 if(targetMode){g.strokeStyle="#f1d178";g.lineWidth=1.5;g.beginPath();g.arc(aim.x,aim.y,targetMode==="napalm"?60:targetMode==="artillery"?80:40,0,TAU);g.stroke();}
 // Aim crosshair.
 g.strokeStyle=targetMode?"#f1cb72":"#ddd6a9";g.lineWidth=1.3;
 g.beginPath();g.arc(aim.x,aim.y,8,0,TAU);g.moveTo(aim.x-13,aim.y);g.lineTo(aim.x-5,aim.y);g.moveTo(aim.x+5,aim.y);g.lineTo(aim.x+13,aim.y);g.moveTo(aim.x,aim.y-13);g.lineTo(aim.x,aim.y-5);g.stroke();
}
function draw(){
 if(!state)return;
 g.setTransform(DPR,0,0,DPR,0,0);
 g.save();g.translate((Math.random()-.5)*state.screenShake,(Math.random()-.5)*state.screenShake);
 drawWorld();drawInfantry();drawTank();drawEffects();g.restore();
}
function frame(now){
 let dt=last?Math.min(.06,(now-last)/1000):0;last=now;
 if(state){
  if(phase==="playing")step(dt);
  if(phase==="playing"||phase==="upgrade"||phase==="paused"||phase==="gameover")draw();
  uiTimer-=dt;if(uiTimer<=0){uiTimer=.15;updateUi();}
 }
 requestAnimationFrame(frame);
}
function resize(){
 const oldW=W;W=Math.max(320,document.documentElement.clientWidth||window.innerWidth||390);
 H=Math.max(520,document.documentElement.clientHeight||window.innerHeight||720);
 DPR=Math.min(2,window.devicePixelRatio||1);
 canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+"px";canvas.style.height=H+"px";
 if(!state){CHUNK=H;}else{state.roadX=roadAt(state.distance);state.chunks.clear();}
 textureCache.clear();
 aim.x=W*.5;aim.y=H*.29;
}
function start(fresh=false){
 audioUnlock();const saved=fresh?null:readSave();seed=saved&&saved.seed||((Math.random()*0x7fffffff)|0)||7919;state=saved?restoreProgress(saved):makeState();state.roadX=roadAt(state.distance);phase="playing";holding=false;targetMode=null;saveClock=0;ui.newRun.style.display="none";spriteCache.clear();
 ui.overlay.classList.add("hidden");ui.target.style.display="none";
 ui.start.style.display="";ui.choices.style.display="none";refreshPowers();updateUi();last=performance.now();
}
function showPause(){
 if(!state)return;
 if(phase==="playing"){
  phase="paused";holding=false;saveProgress();ui.title.textContent="LONG ROAD — PAUSED";
  ui.body.textContent=state.kills+" eigen kills. "+Math.floor(state.distance)+" pixels afgelegd. De wereld blijft precies staan tot je verdergaat.";
  ui.choices.style.display="none";ui.start.style.display="block";ui.start.textContent="VERDER RIJDEN";
  ui.help.textContent="De klassieke game blijft apart beschikbaar via het menu.";
  ui.overlay.classList.remove("hidden");
 }else if(phase==="paused"){phase="playing";ui.overlay.classList.add("hidden");}
}
function gameOver(){
 phase="gameover";clearSave();holding=false;ui.title.textContent="TANK DESTROYED";
 ui.body.textContent="Je scoorde "+state.kills+" eigen kills, koos "+state.choices+" upgrades en reed "+Math.round(state.distance)+" pixels over de lange weg.";
 ui.choices.style.display="none";ui.start.style.display="block";ui.start.textContent="OPNIEUW LONG ROAD";
 ui.help.textContent="Nieuwe run: opnieuw willekeurige tactische upgrades.";
 ui.overlay.classList.remove("hidden");
}
function mousePos(ev){
 const b=canvas.getBoundingClientRect();
 return {x:clamp((ev.clientX-b.left)*W/b.width,12,W-12),y:clamp((ev.clientY-b.top)*H/b.height,12,H-12)};
}
canvas.addEventListener("pointerdown",ev=>{
 if(phase!=="playing")return;ev.preventDefault();audioUnlock();
 const pos=mousePos(ev);aim=pos;
 if(targetMode){launchSpecial(targetMode,pos.x,worldY(pos.y));return;}
 holding=true;canvas.setPointerCapture?.(ev.pointerId);fireMG();
});
canvas.addEventListener("pointermove",ev=>{if(!state)return;aim=mousePos(ev);if(holding)ev.preventDefault();});
canvas.addEventListener("pointerup",()=>holding=false);
canvas.addEventListener("pointercancel",()=>holding=false);
canvas.addEventListener("contextmenu",ev=>ev.preventDefault());
ui.start.addEventListener("click",()=>{if(phase==="paused"){phase="playing";ui.overlay.classList.add("hidden");last=performance.now();}else start(phase==="gameover");});
ui.newRun.addEventListener("click",()=>{clearSave();start(true);});
ui.pause.addEventListener("click",showPause);
window.addEventListener("keydown",ev=>{
 if(ev.code==="Escape"||ev.code==="KeyP"){if(phase==="playing"||phase==="paused")showPause();}
 if(ev.code==="Space"&&phase==="playing"&&!ev.repeat){ev.preventDefault();holding=true;}
});
window.addEventListener("keyup",ev=>{if(ev.code==="Space")holding=false;});
window.addEventListener("blur",()=>{holding=false;if(phase==="playing")showPause();});
window.addEventListener("resize",resize);
resize();ui.overlay.classList.remove("hidden");
if(readSave()){
 const old=readSave();ui.start.textContent="DOORGAAN MET LONG ROAD";
 ui.newRun.style.display="block";ui.newRun.textContent="NIEUWE RUN";
 ui.body.textContent="Vervolg je lange reis vanaf "+Math.round(old.stats.distance)+" pixels, met "+old.stats.kills+" eigen kills en "+old.stats.choices+" gekozen upgrades. De volledige wereld blijft doorlopend.";
}
requestAnimationFrame(frame);
window.__JBDLongRoad={
 BIOMES,UPGRADE,blendAt,stageAt,roadAt,makeChunk,getState:()=>state,getPhase:()=>phase,
 start,step,spawnAttack,spawnEnemy,safeGround:groundPoint,fire:fireMG,applyUpgrade,chooseOptions,launchSpecial,draw,
 saveProgress,readSave,restoreProgress,clearSave,
 setAim:(x,y)=>{aim={x,y};},setPhase:(x)=>{phase=x;},forceKill:(n)=>{for(let i=0;i<n;i++){state.kills++;if(state.kills>=state.killGoal)offerUpgrade();}},
 advance:(pixels)=>{state.distance+=pixels;state.roadX=roadAt(state.distance);state.chunks.clear();}
};
})();