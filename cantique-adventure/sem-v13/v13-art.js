/* V13 visual layer — textured raster-rendered interiors, object sprites, visible room exits */
(function(){
'use strict';
const V=window.CANTIQUE_V13;if(!V)throw Error('V13 story must load before graphics');
const graph=window.CANTIQUE_V12?.graph||{};
const rand=(n)=>{const x=Math.sin(n*932.12+19.71)*43627.349;return x-Math.floor(x)};
function canvas(w,h){const el=document.createElement('canvas');el.width=w;el.height=h;return [el,el.getContext('2d')];}
function path(c,pts,fill,stroke='',width=2){
 c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();
 if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function grad(c,x,y,w,h,colors,vertical=true){
 const g=c.createLinearGradient(x,y,vertical?x:x+w,vertical?y+h:y);colors.forEach((col,i)=>g.addColorStop(i/(colors.length-1),col));return g;
}
function rect(c,x,y,w,h,col,stroke='',sw=1){c.fillStyle=col;c.fillRect(x,y,w,h);if(stroke){c.lineWidth=sw;c.strokeStyle=stroke;c.strokeRect(x,y,w,h);}}
function rounded(c,x,y,w,h,r,fill,stroke='',sw=1){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke();}
}
function shadow(c,x,y,w,h,a=.28){c.save();c.filter='blur(19px)';c.fillStyle='rgba(0,0,0,'+a+')';c.fillRect(x,y,w,h);c.restore();}
function light(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function noise(c,w,h,count,color){c.save();c.fillStyle=color;for(let i=0;i<count;i++){const x=rand(i*2.33)*w,y=rand(i*3.12+923)*h,a=.3+rand(i*4.81)*1.6;c.fillRect(x,y,a,a);}c.restore();}
function door(c,x,y,w,h,kind='grey'){
 const frame=kind==='wood'?['#211c1a','#79624d','#302a25']:['#101d23','#74818a','#263440'];
 shadow(c,x+13,y+19,w+8,h+14,.35);
 rounded(c,x-8,y-8,w+16,h+16,2,grad(c,x,y,w,h,[frame[1],frame[0]]),frame[0],4);
 rect(c,x+4,y+4,w-8,h-8,grad(c,x,y,w,h,[frame[2],frame[0],frame[2]]));
 rect(c,x+15,y+14,w-30,h*.48,grad(c,x+15,y,w-30,h*.48,['#48565b','#1d292b','#11191d']),frame[2],3);
 rect(c,x+15,y+h*.57,w-30,h*.29,'#1f292b','#546268',3);
 const rg=c.createRadialGradient(x+w*.78,y+h*.57,0,x+w*.78,y+h*.57,w*.08);
 rg.addColorStop(0,'#eee5c6');rg.addColorStop(.5,'#aa9671');rg.addColorStop(1,'#635640');
 c.fillStyle=rg;c.beginPath();c.arc(x+w*.8,y+h*.58,Math.max(4,w*.039),0,Math.PI*2);c.fill();
}
function makeRoom(which){
 const [can,c]=canvas(960,720);
 const bathroom=which==='restroom';
 rect(c,0,0,960,720,grad(c,0,0,960,720,bathroom?['#d6d9d6','#87959b','#4f6167']:['#c5bdac','#89877c','#546066']));
 path(c,[[0,0],[960,0],[960,455],[0,455]],grad(c,0,0,960,455,bathroom?['#c7cfcf','#d9dedd','#86969a']:['#b9b7aa','#9ba49e','#626e6f']));
 path(c,[[0,450],[960,450],[960,720],[0,720]],grad(c,0,450,960,270,['#485054','#8a8b7e','#353e42']));
 c.strokeStyle='rgba(39,46,50,.16)';c.lineWidth=3;
 for(let y=95;y<445;y+=90){c.beginPath();c.moveTo(0,y);c.lineTo(960,y);c.stroke();}
 for(let x=0;x<960;x+=117){c.beginPath();c.moveTo(x,0);c.lineTo(x,450);c.stroke();}
 for(let i=0;i<10;i++){
  const t=i/10, y=450+270*t*t; c.lineWidth=1+t*3;c.strokeStyle='rgba(30,31,30,.29)';
  c.beginPath();c.moveTo(0,y);c.lineTo(960,y);c.stroke();
 }
 for(let i=-7;i<=17;i++){const x=480+i*108;c.beginPath();c.moveTo(480,450);c.lineTo(x,720);c.stroke();}
 light(c,540,85,340,'rgba(244,252,233,.45)');
 // Ceiling light, reflections, wall fixtures
 rounded(c,380,37,245,20,4,grad(c,380,37,245,20,['#ffffff','#e4eadb','#849499']),'#66737a',2);
 light(c,505,68,180,'rgba(248,251,210,.42)');
 if(bathroom){
  door(c,52,138,200,335);
  shadow(c,312,238,204,235,.24);
  rounded(c,309,238,203,205,13,grad(c,309,238,203,205,['#dce7e7','#a9c4c8','#526a6c']),'#687c82',9);
  rounded(c,334,260,151,156,7,grad(c,335,250,150,170,['#426570','#1b303a','#536b6c']),'#e1e7d9',6);
  c.fillStyle='rgba(255,255,255,.13)';path(c,[[353,274],[408,274],[346,386]],c.fillStyle);
  shadow(c,300,487,265,51,.36);
  path(c,[[309,441],[520,441],[558,536],[278,536]],grad(c,309,441,250,95,['#f4f3e9','#a0a8a4','#5a6d6e']),'#839395',4);
  rounded(c,355,489,130,45,14,grad(c,355,489,130,45,['#ffffff','#b8c5bf','#869997']));
  rect(c,384,408,14,50,'#7b8a8d');rounded(c,370,401,42,12,5,'#c3cfcb','#899d9d');
  // Toilet, plumbing and partition
  shadow(c,624,448,246,164,.33);
  rounded(c,665,370,160,151,14,grad(c,665,370,160,151,['#f9fbf4','#cfd8d7','#879495','#f1f1e6']),'#909f9f',6);
  rounded(c,696,499,104,125,14,grad(c,696,499,104,125,['#f9faf7','#d4dedb','#8d9d9b']),'#849390',5);
  c.save();c.translate(741,487);c.scale(1,.52);c.beginPath();c.arc(0,0,111,0,Math.PI*2);c.fillStyle=grad(c,-60,-65,160,100,['#ffffff','#b1c0c1']);c.fill();c.lineWidth=9;c.strokeStyle='#70858b';c.stroke();c.beginPath();c.arc(0,0,68,0,Math.PI*2);c.fillStyle='#455a60';c.fill();c.restore();
  if(!V.isKnown('toiletDone')){
   c.fillStyle='#5a3d24';c.beginPath();c.ellipse(750,480,55,14,0,0,Math.PI*2);c.fill();
   c.fillStyle='#8c6237';c.beginPath();c.ellipse(749,480,31,9,0,0,Math.PI*2);c.fill();
  }
  rounded(c,584,174,90,97,7,grad(c,584,174,90,97,['#d7e0e1','#a9bcb9','#697e81']),'#728486',4);
  c.fillStyle='#436167';c.font='bold 18px system-ui';c.fillText('HEREN',596,220);
 }else{
  // Storage door + perspective shelving
  door(c,80,146,177,333,'wood');
  door(c,808,172,117,292,'grey');
  shadow(c,274,225,512,319,.41);
  const shelves=[[270,194,490,22],[265,303,505,19],[260,418,515,20],[254,540,525,25]];
  for(let i=0;i<5;i++){
   const x=270+i*122;rect(c,x,181,16,426,grad(c,x,181,16,426,['#a5aaa1','#596266','#283339']),'#3e494a',2);
  }
  for(let [x,y,w,h] of shelves){
   rect(c,x,y,w,h,grad(c,x,y,w,h,['#909b98','#515b5a','#aeb3a6']),'#343c40',2);
   rect(c,x,y+h-4,w,7,'#2c3537');
  }
  for(let i=0;i<14;i++){
   const row=i%3, x=298+(i%5)*93+rand(i)*10,y=[230,338,451][row],w=64+rand(i+2)*16,h=48+rand(i+5)*22;
   if(i%3===0){rounded(c,x,y,w,h,4,grad(c,x,y,w,h,['#c0ad8a','#87705b','#66513f']),'#65503d',3);
     rect(c,x+10,y+10,w-20,12,'#e0d7bc');}
   else if(i%3===1){rounded(c,x,y,w*.59,h,8,grad(c,x,y,w*.59,h,['#e4ebde','#a9b4ac','#7c9189']),'#607370',2);rect(c,x+7,y+12,w*.59-14,17,'#6995a1');}
   else{rounded(c,x,y,w,h,5,grad(c,x,y,w,h,['#344d59','#24343e','#131f26']),'#667079',3);}
  }
  rounded(c,325,557,138,84,7,grad(c,325,557,138,84,['#b7c8cc','#6d858b','#30444b']),'#4c5c61',4);
  c.beginPath();c.ellipse(397,561,70,15,0,0,Math.PI*2);c.strokeStyle='#b4c6c4';c.lineWidth=9;c.stroke();
  rect(c,653,574,9,108,'#969d91');rect(c,637,590,45,72,'#c4c7b5');
 }
 noise(c,960,720,22500,'rgba(36,34,35,.055)');
 // Subtle camera vignette
 const vg=c.createRadialGradient(470,340,90,470,340,660);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(5,16,21,.39)');rect(c,0,0,960,720,vg);
 const url=can.toDataURL('image/jpeg',.89);const key='bg_'+which;imagePaths[key]=url;const im=new Image();im.src=url;images[key]=im;
}
makeRoom('restroom');makeRoom('storage');
V.repaintRestroom=()=>makeRoom('restroom');
function makeProp(it){
 const [can,c]=canvas(190,155),id=it.id;
 c.save();
 c.shadowColor='rgba(0,0,0,.53)';c.shadowBlur=13;c.shadowOffsetY=9;
 const metal=grad(c,30,30,125,80,['#e2e4df','#87979d','#324650','#bec9cb']);
 const dark=grad(c,0,20,190,100,['#343d46','#121b24','#6c7c83','#172330']);
 if(/blaster|light|flash|scissors|mop|plunger|gear/.test(id)){
  c.translate(95,75);c.rotate(-.23);
  rounded(c,-12,-64,24,115,6,metal,'#45505b',4);
  rounded(c,-37,28,74,29,12,id.includes('plunger')?'#9c3935':dark,'#3e4d53',4);
  rounded(c,-26,-76,53,24,10,metal,'#566773',4);
  if(id.includes('blaster')||id.includes('light'))light(c,0,-62,52,'rgba(105,207,255,.55)');
 }else if(/lens|camera|cooler|bag|bucket|tape/.test(id)){
  rounded(c,19,41,150,91,19,id.includes('cooler')?'#b1353b':dark,'#70838b',5);
  rounded(c,27,47,72,78,12,metal,'#475d67',3);
  c.save();c.beginPath();c.ellipse(63,84,30,40,0,0,Math.PI*2);c.fillStyle=dark;c.fill();c.strokeStyle='#a7b6bb';c.lineWidth=9;c.stroke();c.restore();
  if(id.includes('cooler'))rect(c,21,30,148,29,'#e8e3d9','#576b71',3);
 }else if(/choc|usb|phone|paper|form|notepad|clip/.test(id)){
  rounded(c,33,25,126,110,10,id.includes('choc')?'#815136':id.includes('phone')?'#1d2a32':'#e2ddcc','#6d7173',5);
  rounded(c,46,38,100,83,5,id.includes('phone')?'#3e626d':id.includes('choc')?'#a97248':'#f5f1e5','#7f9194',2);
  for(let j=0;j<5;j++)rect(c,57,51+j*13,73,3,id.includes('phone')?'#8ac1c4':'#a4aaa2');
 }else if(/chewed|clean|yellow|damaged|kidney/.test(id)){
  light(c,92,72,90,id.includes('yellow')?'rgba(247,212,77,.58)':'rgba(93,175,253,.55)');
  const g=c.createRadialGradient(70,60,8,98,85,80);g.addColorStop(0,'#e7faff');g.addColorStop(.5,id.includes('yellow')?'#d9ad33':'#3d9bc9');g.addColorStop(1,'#173749');c.fillStyle=g;c.beginPath();c.moveTo(84,20);c.bezierCurveTo(7,2,19,128,83,136);c.bezierCurveTo(164,151,165,65,126,68);c.bezierCurveTo(118,56,142,16,84,20);c.fill();c.strokeStyle='#d5f5f8';c.lineWidth=4;c.stroke();
 }else if(/mask|cloth|gloves/.test(id)){
  rounded(c,29,40,126,79,28,grad(c,35,45,130,75,['#e4f3e9','#90babc','#eef2e8']),'#698e9a',3);
  for(let j=0;j<3;j++)rect(c,47,57+j*18,88,2,'#93adaf');
 }else if(/keys|scalpel/.test(id)){
  c.save();c.translate(50,40);c.rotate(.35);
  c.strokeStyle='#c4d0d0';c.lineWidth=12;c.beginPath();c.arc(25,28,21,0,Math.PI*2);c.moveTo(49,28);c.lineTo(115,88);c.lineTo(103,99);c.lineTo(91,88);c.lineTo(82,96);c.stroke();c.restore();
 }else{
  rounded(c,34,39,126,81,14,metal,'#40525b',5);
  rect(c,47,59,97,16,'#6e9299');
 }
 c.restore();
 // Decorative rim-light and photograin
 noise(c,190,155,1150,'rgba(0,0,0,.05)');
 const url=can.toDataURL('image/png');const key='v13art_'+id;imagePaths[key]=url;const imageObj=new Image();imageObj.src=url;images[key]=imageObj;
}
V.items.forEach(makeProp);
for(const name of ['v13_damaged','v13_cleaned','v13_yellowkidney','v13_powder','v13_alcohol','v13_cleanBlaster']){
 makeProp({id:name.replace('v13_','v13_')});
}
if(imagePaths.prop_dure_telelens){imagePaths.v13art_v13_lens=imagePaths.prop_dure_telelens;images.v13art_v13_lens=images.prop_dure_telelens||images.v13art_v13_lens;}
if(imagePaths.prop_laptoptas){imagePaths.v13art_v13_bag=imagePaths.prop_laptoptas;images.v13art_v13_bag=images.prop_laptoptas||images.v13art_v13_bag;}
const doorModels={};
for(const [id,adj] of Object.entries(graph)){
 const scene=scenes[id];if(!scene)continue;
 doorModels[id]=[];
 const amount=adj.filter(x=>scenes[x]).length;
 adj.filter(x=>scenes[x]).forEach((dest,i)=>{
  const existing=scene.hot.find(h=>h.door===dest);
  if(existing){
   // Reuse the photo's existing doorway; don't paint a second false door on top.
   const [x,y,w,h]=existing.rect;
   doorModels[id].push({x,y,w,h,dest,native:true});
  }else{
   // Only graph connections not pictured in the old room get a new painted opening.
   const w=amount<=4?108:Math.max(72,Math.floor(815/amount));
   const x=48+i*((860-w)/(Math.max(1,amount-1))),y=amount>5?106:107,h=amount>5?185:216;
   const hit={id:'v13door_'+id+'_'+dest,label:'Deur naar '+scenes[dest].name,rect:[x,y,w,h],at:[Math.min(900,Math.max(85,x+w/2)),550],door:dest};
   scene.hot.push(hit);doorModels[id].push({x,y,w,h,dest,native:false});
  }
 });
}
function drawDoors(){
 (doorModels[s.scene]||[]).forEach(({x,y,w,h,dest,native})=>{
  ctx.save();
  const label=scenes[dest].name.replace(/^(De |Het |Een )/,'');
  if(native){
   // Soft corner markers preserve the original photographic doorway.
   ctx.lineWidth=4;ctx.strokeStyle='rgba(245,219,164,.68)';
   const x1=Math.max(2,x+3),y1=Math.max(3,y+4),w1=Math.min(955-x1,w-6),h1=Math.min(710-y1,h-10);
   if(w1>18&&h1>30){
    const k=Math.min(31,w1*.25,h1*.2);
    ctx.beginPath();
    ctx.moveTo(x1,y1+k);ctx.lineTo(x1,y1);ctx.lineTo(x1+k,y1);
    ctx.moveTo(x1+w1-k,y1);ctx.lineTo(x1+w1,y1);ctx.lineTo(x1+w1,y1+k);
    ctx.moveTo(x1,y1+h1-k);ctx.lineTo(x1,y1+h1);ctx.lineTo(x1+k,y1+h1);
    ctx.moveTo(x1+w1-k,y1+h1);ctx.lineTo(x1+w1,y1+h1);ctx.lineTo(x1+w1,y1+h1-k);
    ctx.stroke();
   }
   const tx=Math.max(15,Math.min(940,x+w/2)),ty=Math.max(45,Math.min(690,y+h-11));
   ctx.font='600 12px system-ui';ctx.textAlign='center';
   const out=label.length>21?label.slice(0,21)+'…':label;
   const tw=Math.max(78,Math.min(240,out.length*7.4+20));
   ctx.fillStyle='#0c2028d9';ctx.fillRect(tx-tw/2,ty-18,tw,26);
   ctx.fillStyle='#f9e5bd';ctx.fillText(out,tx,ty);
  }else{
   ctx.globalAlpha=.93;
   const g=ctx.createLinearGradient(x,y,x+w,y+h);
   g.addColorStop(0,'#b7bdba');g.addColorStop(.15,'#2d4047');g.addColorStop(.65,'#16272e');g.addColorStop(1,'#71817e');
   ctx.fillStyle='#0c1618b8';ctx.fillRect(x-6,y-6,w+12,h+13);
   ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
   ctx.fillStyle='#1f343c';ctx.fillRect(x+8,y+10,w-16,h-20);
   ctx.fillStyle='#667c85';ctx.fillRect(x+14,y+16,w-28,h*.48);
   ctx.fillStyle='#26383d';ctx.fillRect(x+14,y+h*.58,w-28,h*.3);
   ctx.beginPath();ctx.ellipse(x+w*.8,y+h*.58,Math.max(4,w*.045),6,0,0,Math.PI*2);ctx.fillStyle='#e5d19a';ctx.fill();
   ctx.font='600 '+(w<90?'10':'12')+'px system-ui';ctx.textAlign='center';
   ctx.fillStyle='#142126d9';ctx.fillRect(x-4,y+h+9,w+8,29);
   ctx.fillStyle='#f0e4c6';ctx.fillText(label.length>15?label.slice(0,15)+'…':label,x+w/2,y+h+27);
  }
  ctx.restore();
 });
}
const crowdPortraits={};
const oldDrawWorld=drawWorld;
drawWorld=function(t){
 oldDrawWorld(t);
 // World assets retain their inventory IDs, real-world scale and clickable area.
 for(const it of V.items){
  if(it.scene!==s.scene||!V.isVisible(it))continue;
  const im=images['v13art_'+it.id];if(im?.naturalWidth){ctx.save();ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=8;ctx.drawImage(im,it.x,it.y,it.w,it.h);ctx.restore();}
 }
 if(s.scene==='cutting'&&V.isKnown('gathering')){
  const gathered=V.gatherNames.filter(n=>V.isKnown('gather_'+n));
  if(V.isKnown('secondClean'))gathered.push('Dianne');
  gathered.forEach((name,i)=>{
   const x=96+(i%5)*177,y=i<5?420:590;
   ctx.save();
   ctx.beginPath();ctx.ellipse(x,y+8,30,9,0,0,Math.PI*2);ctx.fillStyle='#0710138c';ctx.fill();
   const g=ctx.createLinearGradient(x-25,y-100,x+25,y);g.addColorStop(0,'#314e58');g.addColorStop(1,'#131c24');
   ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-18,y-85);ctx.quadraticCurveTo(x,y-104,x+22,y-85);ctx.lineTo(x+30,y);ctx.lineTo(x-28,y);ctx.closePath();ctx.fill();
   const face=crowdPortraits[name]||(crowdPortraits[name]=new Image());if(!face.src)face.src=portrait(name);if(face.complete&&face.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(x,y-102,27,0,Math.PI*2);ctx.clip();ctx.drawImage(face,x-27,y-129,54,54);ctx.restore();}else{ctx.beginPath();ctx.arc(x,y-102,21,0,Math.PI*2);ctx.fillStyle='#b99d7f';ctx.fill();}
   ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff2d1';ctx.fillText(name,x,y-5);ctx.restore();
  });
 }
 drawDoors();
};
const previousHotspot=hotspotFound;
hotspotFound=function(x,y){
 const sc=scenes[s.scene];if(sc){
  const active=V.items.filter(it=>it.scene===s.scene&&V.isVisible(it));
  for(let i=active.length-1;i>=0;i--){const a=active[i];if(x>=a.x&&x<=a.x+a.w&&y>=a.y&&y<=a.y+a.h)return sc.hot.find(h=>h.id==='v13_item_'+a.id);}
 }
 return previousHotspot(x,y);
};
const style=document.createElement('style');
style.textContent='.v13panel{width:min(650px,100%);padding:12px 8px}.v13panel h3{font-size:23px;margin:0 0 7px;color:#e4d9ac}.v13panel p{font-size:15px;line-height:1.5}.v13options{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin:17px 0}.v13options button{text-align:left;white-space:normal;min-height:48px}.v13cinema{text-align:center;width:min(690px,100%);background:#0b1b22;border:1px solid #3e727c;border-radius:15px;padding:14px}.v13cinema h3{margin:8px 0;color:#d6ebf3}.v13cinema p{min-height:65px}.v13cinema-stage{position:relative;width:100%;height:160px;overflow:hidden;background:radial-gradient(ellipse at 45% 85%,#1a5b75,#0e1b2a 70%);border:1px solid #275667;border-radius:9px}.v13beam{position:absolute;width:170%;height:12px;top:58px;left:-50%;transform:rotate(-25deg);background:linear-gradient(90deg,transparent,#83e2ff,transparent);box-shadow:0 0 24px #48c0ff;animation:v13beam 1.3s ease-in-out infinite alternate}.v13orb{position:absolute;width:72px;height:80px;top:50px;left:43%;border-radius:48% 57% 50% 50%;background:radial-gradient(circle at 36% 34%,#e3fbff,#4597c7 52%,#1a365c);box-shadow:0 0 22px #5ac9ff;animation:v13float 1.6s ease-in-out infinite alternate}.v13dog{position:absolute;bottom:8px;left:77%;width:85px;height:47px;background:#8b6b53;border-radius:50% 40% 35% 40%;transform:translateX(180%);animation:v13dog 3s forwards}.v13spark{position:absolute;width:5px;height:85px;background:#b8f3ff;left:26%;top:31px;transform:rotate(29deg);box-shadow:0 0 28px #78d4ff;animation:v13spark 1.3s infinite alternate}.v13spark.b{left:66%;transform:rotate(-29deg);animation-delay:.43s}@keyframes v13beam{to{transform:rotate(20deg);opacity:.2}}@keyframes v13float{to{transform:translateY(-30px) rotate(12deg)}}@keyframes v13dog{to{transform:translateX(-170%)}}@keyframes v13spark{to{opacity:.1}}@media(max-width:650px){.v13cinema-stage{height:115px}.v13cinema{padding:8px}.v13cinema h3{font-size:18px}.v13cinema p{font-size:13px;min-height:45px}.v13options{grid-template-columns:1fr}.v13panel h3{font-size:18px}}';
style.textContent+=
'.v13-plumbing{height:126px;position:relative;margin:8px auto 12px;width:min(320px,90%);background:radial-gradient(ellipse at center,#284552,#0b1d27);overflow:hidden;border-radius:14px;border:1px solid #42616d}.v13-wc{position:absolute;bottom:12px;left:28%;width:43%;height:54px;border:9px solid #d6e4e7;border-radius:50%;transform:skewX(-8deg);background:radial-gradient(circle,#5a7483,#182833);box-shadow:0 14px 15px #051016}.v13-plunger{position:absolute;left:54%;top:-4px;height:97px;width:11px;border-radius:5px;background:linear-gradient(90deg,#816545,#dbc39d,#7d5e38);transform-origin:50% 25%;animation:v13pumpp .66s ease-in-out infinite alternate}.v13-plunger:after{content:"";position:absolute;bottom:-3px;left:-23px;width:58px;height:20px;border-radius:55% 55% 22% 22%;background:linear-gradient(#bc534e,#6c292a);box-shadow:0 2px 8px #371317}@keyframes v13pumpp{to{transform:translateY(18px) rotate(-7deg)}}.v13-ripple{position:absolute;bottom:38px;left:44%;width:60px;height:18px;border:2px solid #8fc5dc;border-radius:50%;animation:v13rip .8s infinite alternate}@keyframes v13rip{to{opacity:.16;transform:scale(1.8)}}'+
'.v13scene-hug,.v13scene-dance,.v13scene-clean{position:absolute;inset:0;overflow:hidden}.v13floor{position:absolute;bottom:0;height:40px;width:100%;background:linear-gradient(90deg,#3b4d50,#617278,#303e44)}.v13actor{position:absolute;bottom:16px;width:68px;height:118px;background:linear-gradient(90deg,#182e39,#58737e,#14272f);border-radius:44% 44% 18% 18%;box-shadow:0 12px 22px #0006}.v13actor img{position:absolute;width:60px;height:68px;object-fit:cover;object-position:center 16%;border-radius:50%;left:4px;top:-23px;border:3px solid #b0c3c5}.v13left{left:24%;animation:v13hugL 2.2s ease-in-out forwards}.v13right{right:24%;animation:v13hugR 2.2s ease-in-out forwards}@keyframes v13hugL{0%{transform:translateX(0)}65%,100%{transform:translateX(53px) rotate(5deg)}}@keyframes v13hugR{0%{transform:translateX(0)}65%,100%{transform:translateX(-53px) rotate(-5deg)}}'+
'.v13tabletop{position:absolute;width:65%;height:32px;bottom:22px;left:17.5%;background:linear-gradient(#a9b8b4,#6a7c7a,#303f47);border:4px solid #23323a;box-shadow:0 17px 18px #0007;transform:perspective(130px) rotateX(10deg)}.v13dancer{position:absolute;width:75px;height:97px;border-radius:37% 37% 17% 17%;background:linear-gradient(90deg,#526e83,#c3bb86,#344e5b);bottom:51px;left:46%;transform-origin:center bottom;animation:v13dance .54s ease-in-out infinite alternate}.v13dancer img{width:70px;height:70px;border-radius:50%;object-fit:cover;position:absolute;top:-37px;left:2px;border:3px solid #c0c9bd}.v13party{position:absolute;width:12px;height:12px;background:#ffdd80;top:21px;left:26%;transform:rotate(45deg);animation:v13party 1.6s ease-in-out infinite alternate}.v13party-b{background:#89dbfa;left:75%;animation-delay:.3s}@keyframes v13party{to{transform:translateY(110px) rotate(390deg);opacity:.2}}@keyframes v13dance{from{transform:translateY(1px) rotate(-14deg)}to{transform:translateY(-15px) rotate(17deg)}}'+
'.v13cleaner{position:absolute;left:19%;bottom:20px;width:82px;height:96px;border-radius:40% 40% 18% 18%;background:linear-gradient(90deg,#263f48,#68858b)}.v13cleaner img{width:74px;height:74px;border-radius:50%;object-fit:cover;position:absolute;top:-33px;left:3px;border:3px solid #c2d4cd}.v13device{position:absolute;left:57%;bottom:35px;width:34px;height:104px;background:linear-gradient(90deg,#2a4452,#aebfc3,#344c59);border-radius:9px;box-shadow:0 0 25px #5acae894;transform:rotate(26deg)}.v13cloth{position:absolute;left:52%;bottom:47px;width:52px;height:26px;border-radius:30%;background:linear-gradient(90deg,#c3e1e0,#829fa2);animation:v13wipe 1s linear infinite alternate}@keyframes v13wipe{to{transform:translateX(63px) rotate(18deg)}}'+
'.v13-stage-hug .v13beam,.v13-stage-dance .v13beam,.v13-stage-hug .v13orb,.v13-stage-dance .v13orb{display:none}';
document.head.append(style);
V.doorModels=doorModels;
V.graphicsTest=()=>({doors:Object.values(doorModels).reduce((a,b)=>a+b.length,0),rooms:Object.keys(doorModels).length,backgrounds:['restroom','storage'],renderedProps:V.items.length});
console.info('Cantique V13 graphics ready',V.graphicsTest());
})();