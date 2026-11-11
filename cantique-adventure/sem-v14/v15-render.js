/* Cantique V15 — independent object visuals + breathing light, photographed
   room compositing and grounded NPCs. Requires v15-geometry.js. */
(function(){
'use strict';
const V=window.CANTIQUE_V13,T=window.CANTIQUE_V15;
if(!T)throw Error('V15 geometry must load first');
const F=V.isKnown,ready=im=>!!(im&&im.complete&&im.naturalWidth>0);
const im=id=>images[id]||(typeof imageGet==='function'?imageGet(id):null);
const photo=new Set(['reception_right','central_hub','canteen_hub','packing_workroom','storage_hub','print','press_rear','breakroom','shared_office']);
const pulse=t=>.52+.48*Math.sin(t/430);
const shadowColor=t=>'rgba(255,206,116,'+(.28+.24*pulse(t))+')';
function glowImg(asset,x,y,w,h,t){
 if(!ready(asset))return false;
 ctx.save();ctx.shadowColor=shadowColor(t);ctx.shadowBlur=7+15*(.5+.5*pulse(t));
 ctx.globalAlpha=.96;ctx.drawImage(asset,x,y,w,h);ctx.restore();return true;
}
function halo(x,y,r,t){
 const a=.28+.18*pulse(t);
 ctx.save();const g=ctx.createRadialGradient(x,y,1,x,y,r);
 g.addColorStop(0,'rgba(255,222,159,'+a+')');g.addColorStop(.4,'rgba(255,205,125,'+(a*.42)+')');
 g.addColorStop(1,'rgba(255,180,100,0)');ctx.fillStyle=g;
 ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='rgba(255,238,183,'+(.22+.23*pulse(t))+')';
 ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,Math.max(5,r*.2),0,7);ctx.stroke();ctx.restore();
}
function beerCans(t){
 // Precisely aligned with break_cans on the current photographed countertop.
 const places=[[443,492,19,42],[468,491,19,43],[490,509,39,20]];
 for(const [x,y,w,h] of places){
  ctx.save();ctx.shadowColor='#0008';ctx.shadowBlur=3;
  const g=ctx.createLinearGradient(x,y,x+w,y);
  g.addColorStop(0,'#3b4b3c');g.addColorStop(.45,'#95b399');g.addColorStop(1,'#234332');
  ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();
  ctx.fillStyle='#cad0cd';ctx.fillRect(x,y,w,3);ctx.fillRect(x,y+h-3,w,3);ctx.restore();
 }
 halo(479,511,37,t);
}
function officeProps(room,t){
 if(room==='breakroom'){
  const brewer=im('v13art_v14_coffeemachine');
  if(!glowImg(brewer,87,414,90,121,t))halo(125,477,43,t);
  if(!F('cansTaken')&&!(typeof has==='function'&&has('cans')))beerCans(t);
 }
 if(room==='print'){
  // Printed proofs stay on the table, not hovering over the printer.
  ctx.save();ctx.shadowColor='#0007';ctx.shadowBlur=5;ctx.fillStyle='#dcd8cf';
  for(let n=0;n<5;n++)ctx.fillRect(106,545-n*2,102,8);ctx.restore();
  halo(160,544,35,t);
 }
}
// Register a logical mapping between existing in-world item IDs and tangible sprites.
const spriteRegistry={};
for(const i of V.items) spriteRegistry[i.id]={scene:i.scene,src:'v13art_'+i.id,x:i.x,y:i.y,w:i.w,h:i.h,animated:true};
T.spriteRegistry=spriteRegistry;
T.spriteStates={idle:0,light:1,peak:2,light2:3};
function drawItems(room,t){
 for(const it of V.items){
  if(it.scene!==room||!V.isVisible(it))continue;
  if(it.id==='v14_coffee')continue; // coffee exists in the inventory after brewing
  const pic=im('v13art_'+it.id);
  if(ready(pic))glowImg(pic,it.x,it.y,it.w,it.h,t);
 }
}
function markers(room,t){
 const used=new Set();const sc=scenes[room];if(!sc)return;
 for(const h of sc.hot||[]){
  if(h.door||h.id==='v15_map'||h.id==='v145_routes')continue;
  const key=(h.fn||h.id||'').toLowerCase();
  if(!/(item|cans|beer|coffee|water|cloth|usb|proof|note|packet|bag|camera|machine|print|sticker|gear|lens|box|roll|paper|plunger|cabinet|koek|snij|tape|invoice|roster)/.test(key))continue;
  if(!h.rect)continue;
  if((h.id||'').startsWith('v14_item_')){
   const item=V.items.find(it=>'v14_item_'+it.id===h.id);
   if(item&&!V.isVisible(item))continue;
  }
  const [x,y,w,hgt]=h.rect,xx=x+w/2,yy=y+hgt/2;
  const mark=Math.round(xx/25)+'_'+Math.round(yy/25);
  if(used.has(mark))continue;used.add(mark);
  // Small, unobtrusive glow at the visible object, never a giant rectangle.
  halo(xx,yy,Math.min(28,Math.max(16,Math.min(w,hgt)*.2)),t);
 }
}
function arrows(room,t){
 for(const h of scenes[room]?.v15Exits||[]){
  const [x,y,w,ht]=h.rect,center=x+w/2;
  const yy=Math.min(613,y+ht-15),text=h.label||'Doorgang';
  ctx.save();ctx.globalAlpha=.45+.27*(.5+.5*pulse(t));
  ctx.font='bold 13px system-ui';
  const len=Math.min(163,Math.max(93,ctx.measureText(text).width+20));
  const left=Math.max(6,Math.min(954-len,center-len/2));
  ctx.fillStyle='#14292cde';ctx.strokeStyle='#f0d18b';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.roundRect(left,yy,len,31,8);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff2d4';ctx.textAlign='center';ctx.fillText(text,left+len/2,yy+21);
  ctx.restore();
 }
}
function mapTab(t){
 ctx.save();const a=.65+.18*pulse(t);ctx.fillStyle='rgba(15,36,38,'+a+')';
 ctx.shadowColor='#e9c781';ctx.shadowBlur=3+5*(.5+.5*pulse(t));
 ctx.beginPath();ctx.roundRect(798,664,153,47,9);ctx.fill();
 ctx.shadowBlur=0;ctx.strokeStyle='#e3c891';ctx.lineWidth=1.3;ctx.stroke();
 ctx.fillStyle='#ffe9b9';ctx.font='bold 17px system-ui';ctx.textAlign='center';
 ctx.fillText('🧭 Routes',875,693);ctx.restore();
}
const oldWorld=drawWorld;
const photoPaint=(room,t)=>{
 const bg=im('bg_'+room);
 ctx.save();ctx.clearRect(0,0,960,720);
 if(ready(bg))ctx.drawImage(bg,0,0,960,720);
 else{ctx.fillStyle='#2c3639';ctx.fillRect(0,0,960,720);ctx.fillStyle='#fff';ctx.font='21px system-ui';ctx.fillText('Cantique — achtergrond laden…',290,355);}
 for(const n of scenes[room]?.npcs||[])if(!n.v15Hidden&&typeof drawNPC==='function')drawNPC(n,t);
 officeProps(room,t);
 if(room!=='breakroom')drawItems(room,t);
 markers(room,t);drawPlayer(t);arrows(room,t);mapTab(t);
 if(hover&&typeof drawGlowing==='function')drawGlowing(hover,t);
 ctx.restore();
};
const marloesPhoto=new Image();marloesPhoto.decoding='async';marloesPhoto.src='./assets/v145_marloes_desk_clean.webp';
const marloesCutout=new Image();marloesCutout.decoding='async';marloesCutout.src='./assets/v145_marloes_sprite.webp';
function marloesScene(t){
 ctx.save();ctx.clearRect(0,0,960,720);
 if(ready(marloesPhoto))ctx.drawImage(marloesPhoto,0,0,960,720);
 else{ctx.fillStyle='#4b453e';ctx.fillRect(0,0,960,720);}
 // The old giant V14.5 sprite had broken feet and an oversized face.
 // Use a modest seated cutout, OCCLUDED behind the physical desk edge.
 const actor=im('full_marloes')||im('marloes_desk_1')||marloesCutout;
 if(ready(actor)){
  ctx.save();ctx.beginPath();ctx.rect(32,142,365,401);ctx.clip();
  const hh=265,ww=Math.min(205,hh*actor.naturalWidth/actor.naturalHeight);
  ctx.shadowColor='#0007';ctx.shadowBlur=8;
  ctx.drawImage(actor,128,535-hh+Math.sin(t/930)*1.3,ww,hh);
  ctx.restore();
 }
 if(F('v14_noticed')&&!F('v14_comforted')){
  const tears=im('v13art_v14_tears_'+(Math.floor(t/320)%4));
  if(ready(tears)){ctx.save();ctx.globalAlpha=.7;ctx.drawImage(tears,162,310,61,73);ctx.restore();}
 }
 const mug=V.items.find(x=>x.id==='v14_lensmug');
 if(mug&&(V.isVisible(mug)||F('v14_comforted'))){
  const pic=im('v13art_v14_lensmug');
  if(ready(pic))glowImg(pic,mug.x,mug.y,mug.w,mug.h,t);
 }
 arrows('borreoffice',t);mapTab(t);
 if(hover&&typeof drawGlowing==='function')drawGlowing(hover,t);
 ctx.restore();
}
drawWorld=function(t){
 if(s.scene==='borreoffice'){marloesScene(t);return;}
 if(photo.has(s.scene)){photoPaint(s.scene,t);return;}
 oldWorld(t);
 ctx.save();markers(s.scene,t);if(s.scene!=='underdesk')drawItems(s.scene,t);
 mapTab(t);ctx.restore();
};
T.verifyGraphics=()=>({
 version:V.version,
 everyInteractiveRegistered:Object.values(scenes).every(sc=>sc.hot.some(x=>x.id==='v15_map')),
 animatedItemCount:Object.keys(spriteRegistry).length,
 sourceSpriteNames:Object.keys(spriteRegistry),
 marloesPhotoReady:ready(marloesPhoto),marloesCutoutReady:ready(marloesCutout),
 defaultPlayerHiddenInZoom:['borreoffice','underdesk','johanneke_desk'],
 photoRoomCount:photo.size
});
console.info('Cantique V15 render/pulse layer loaded',T.verifyGraphics());
})();