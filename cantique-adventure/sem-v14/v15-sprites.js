/* CANTIQUE V15 — REAL UPLOADED WEBP ARTWORK IN THE PLAYABLE GAME.
   Generated photo rooms, 24 standalone character poses and 12 animated
   interaction WebPs. Never copies an old NPC into the backdrop. */
(function(){
'use strict';
const V=window.CANTIQUE_V13,T=window.CANTIQUE_V15;
if(!V||!T)throw Error('V15 game modules missing');
const F=V.isKnown,ready=im=>!!im&&im.complete&&im.naturalWidth>0;
const A='./assets/',cache={};
function pic(name){
 if(!cache[name]){const im=new Image();im.decoding='async';im.src=A+name+'.webp';cache[name]=im;}
 return cache[name];
}
const sources={
 borreoffice:'v15_marloes_desk_empty',
 underdesk:'v15_underdesk',
 breakroom:'v15_kitchen_empty',
 canteen_hub:'v15_canteen',
 central_hub:'v15_central_alt',
 packing_workroom:'v15_packing',
 storage_hub:'v15_storage',
 print:'v15_press'
};
for(const name of Object.values(sources))pic(name);
const sem=['idle_right','idle_left','walk_1','walk_2','inspect','pickup','offer','surprised'];
const marloes=['working','thinking','turning','surprised','sad','crying','comforted','neutral'];
const borre=['sleep','alert','stand','sniff','walk_1','walk_2','happy','sit'];
for(const [person,states] of Object.entries({sem,marloes,borre}))for(const state of states)pic('v15_'+person+'_'+state);
const obj=['lensmug','coffee','beer_cans','note','plunger','toilet_roll','dirty_tissue','dirty_floor','tape_box','bubble_wrap','brochures','vinyl_roll'];
for(const name of obj)pic('v15_glow_'+name);
T.originalWebp={backgrounds:Object.entries(sources),characters:{sem,marloes,borre},animatedObjects:obj};
const Fetched=id=>images[id]||(typeof imageGet==='function'?imageGet(id):null);
const oldPlayer=drawPlayer;
drawPlayer=function(t){
 if(['borreoffice','underdesk','johanneke_desk'].includes(s.scene))return;
 const active=typeof path!=='undefined'&&path.length>0;
 const facingLeft=typeof playerFlip!=='undefined'&&playerFlip<0;
 const state=active?(Math.floor(t/190)%2?'walk_2':'walk_1'):(facingLeft?'idle_left':'idle_right');
 const source=pic('v15_sem_'+state);
 if(!ready(source)){oldPlayer(t);return;}
 const size=195+Math.max(0,Math.min(85,(s.y-430)*.27));
 ctx.save();ctx.shadowColor='#0009';ctx.shadowBlur=7;ctx.shadowOffsetY=5;
 if(active&&facingLeft){
  ctx.translate(s.x,s.y);ctx.scale(-1,1);ctx.drawImage(source,-size/2,-size,size,size);
 }else ctx.drawImage(source,s.x-size/2,s.y-size,size,size);
 ctx.restore();
};
const mug=V.items.find(x=>x.id==='v14_lensmug');
if(mug)Object.assign(mug,{scene:'borreoffice',x:705,y:254,w:85,h:92});
const hotMug=scenes.borreoffice.hot.find(h=>h.id==='v14_item_v14_lensmug');
if(hotMug){hotMug.rect=[701,250,97,105];hotMug.at=[670,627];}
const photoProps={
 packing_workroom:[
  ['tape_box',154,488,129,96,'Verpakkingsdoos en tape'],
  ['bubble_wrap',319,514,103,83,'Noppenfolie']
 ],
 storage_hub:[
  ['vinyl_roll',183,518,138,105,'Rollen materiaal'],
  ['bubble_wrap',548,527,105,89,'Verpakkingsfolie']
 ],
 print:[
  ['brochures',162,500,116,103,'Gedrukte brochures'],
  ['vinyl_roll',36,508,115,86,'Papierrollen']
 ],
 restroom:[
  ['plunger',663,491,82,111,'Ontstopper'],
  ['toilet_roll',586,600,80,70,'WC-rol'],
  ['dirty_tissue',777,630,78,60,'Vies WC-papier'],
  ['dirty_floor',589,617,182,65,'Vieze vloer']
 ]
};
const messages={
 tape_box:'Hier ligt een doos met verpakkingstape. Handig voor het inpakwerk.',
 bubble_wrap:'Noppenfolie. Bij Cantique wordt zelfs het kleinste pakket zorgvuldig beschermd.',
 vinyl_roll:'Rollen voor print- en productiewerk.',
 brochures:'Dit zijn gedrukte brochures uit de productie.',
 plunger:'Een ontstopper. Coen heeft er vandaag waarschijnlijk wel iets aan.',
 toilet_roll:'Er ligt alweer een rol wc-papier op de grond.',
 dirty_tissue:'Dit gaat een flinke schoonmaakklus worden.',
 dirty_floor:'De vloer is behoorlijk vies. Eerst het toiletprobleem oplossen.'
};
actions.v15InspectProp=function(h){
 const key=h?.v15Object;
 if(typeof narr==='function')narr(messages[key]||'Dat is een voorwerp uit het kantoor.');
 else toast(messages[key]||'Dat staat hier.');
};
for(const [room,props] of Object.entries(photoProps)){
 for(const [name,x,y,w,h,label] of props){
  if(scenes[room]?.hot.some(a=>a.id==='v15_prop_'+name))continue;
  scenes[room]?.hot.push({id:'v15_prop_'+name,label,fn:'v15InspectProp',v15Object:name,rect:[x,y,w,h],at:[Math.max(100,x),645]});
 }
}
const pulse=t=>.5+.5*Math.sin(t/440);
function draw(im,x,y,w,h,t){
 if(!ready(im))return;
 ctx.save();ctx.shadowColor='rgba(255,209,115,'+(.32+.4*pulse(t))+')';
 ctx.shadowBlur=7+14*pulse(t);ctx.drawImage(im,x,y,w,h);ctx.restore();
}
function halo(x,y,r,t){
 ctx.save();const g=ctx.createRadialGradient(x,y,0,x,y,r);
 g.addColorStop(0,'rgba(255,215,128,'+(.17+.18*pulse(t))+')');
 g.addColorStop(1,'rgba(255,180,85,0)');ctx.fillStyle=g;
 ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();
}
function nav(t,room){
 for(const h of scenes[room]?.v15Exits||[]){
  const r=h.rect,cx=r[0]+r[2]/2,y=Math.min(620,r[1]+r[3]-15),title=h.label||'Doorgang';
  ctx.save();ctx.globalAlpha=.54+.21*pulse(t);ctx.font='bold 13px system-ui';
  const w=Math.max(100,Math.min(166,ctx.measureText(title).width+23));
  const x=Math.max(6,Math.min(954-w,cx-w/2));
  ctx.fillStyle='#152a2cd9';ctx.strokeStyle='#edcb89';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.roundRect(x,y,w,31,8);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff1cf';ctx.textAlign='center';ctx.fillText(title,x+w/2,y+21);ctx.restore();
 }
 ctx.save();ctx.shadowColor='#d5b668';ctx.shadowBlur=3+5*pulse(t);
 ctx.fillStyle='#16292ce5';ctx.strokeStyle='#efd39a';ctx.lineWidth=1.2;
 ctx.beginPath();ctx.roundRect(798,664,153,47,9);ctx.fill();ctx.stroke();
 ctx.shadowBlur=0;ctx.fillStyle='#ffe5a8';ctx.font='bold 17px system-ui';
 ctx.textAlign='center';ctx.fillText('🧭 Routes',875,693);ctx.restore();
}
function paintBackground(room){
 const bg=pic(sources[room]);ctx.clearRect(0,0,960,720);
 if(ready(bg))ctx.drawImage(bg,0,0,960,720);
 else{
  const fallback=Fetched('bg_'+room);
  if(ready(fallback))ctx.drawImage(fallback,0,0,960,720);
  else {ctx.fillStyle='#27353c';ctx.fillRect(0,0,960,720);}
 }
}
function pose(person,state,x,y,w,h,t){
 const source=pic('v15_'+person+'_'+state);
 if(!ready(source))return false;
 ctx.save();ctx.shadowColor='#0009';ctx.shadowBlur=8;ctx.shadowOffsetY=4;
 const bob=person==='marloes'?Math.sin(t/800)*1.4:Math.sin(t/480)*.9;
 ctx.drawImage(source,x,y+bob,w,h);ctx.restore();return true;
}
function mood(){
 if(F('v14_comforted'))return 'comforted';
 if(F('v14_noticed'))return Math.floor(performance.now()/1700)%4===0?'sad':'crying';
 if(F('v14_mugTaken'))return 'surprised';
 if(F('v14_distract'))return 'turning';
 return 'working';
}
function paintDesk(t){
 paintBackground('borreoffice');
 const emotion=mood();
 if(emotion==='working'||emotion==='turning'){
  // The seat/desk is aligned and its lower portion is occluded behind the existing counter.
  ctx.save();ctx.beginPath();ctx.rect(92,130,438,433);ctx.clip();
  pose('marloes',emotion,192,279,285,285,t);ctx.restore();
 }else{
  pose('marloes',emotion,124,258,318,328,t);
 }
 if(emotion==='crying'||emotion==='sad'){
  // Animation includes a crying pose; small motion adds distinct falling tears.
  const drops=Fetched('v13art_v14_tears_'+Math.floor(t/310)%4);
  if(ready(drops)){ctx.save();ctx.globalAlpha=.63;ctx.drawImage(drops,223,318,48,61);ctx.restore();}
 }
 if(mug&&(V.isVisible(mug)||F('v14_comforted')))draw(pic('v15_glow_lensmug'),705,254,85,92,t);
 nav(t,'borreoffice');
 if(hover&&typeof drawGlowing==='function')drawGlowing(hover,t);
}
function paintUnder(t){
 paintBackground('underdesk');
 const state=F('v14_distract')&&!F('v14_mugTaken')?'happy':'sleep';
 pose('borre',state,384,388,291,230,t);
 const kidney=V.items.find(x=>x.id==='v13_chewed');
 if(kidney&&V.isVisible(kidney)){
  const image=Fetched('v13art_v13_chewed');
  if(ready(image))draw(image,kidney.x,kidney.y,kidney.w,kidney.h,t);
 }
 nav(t,'underdesk');
 if(hover&&typeof drawGlowing==='function')drawGlowing(hover,t);
}
function paintPhoto(room,t){
 paintBackground(room);
 // V15 has already corrected their floor footprints in the scene data.
 for(const n of scenes[room]?.npcs||[])if(!n.v15Hidden&&typeof drawNPC==='function')drawNPC(n,t);
 if(room==='breakroom'){
  // The machine, sink and microwave are IN the photo; never overlay giant cartoons.
  halo(94,433,57,t);
  if(!F('cansPicked')&&!F('cansDone')&&!(typeof has==='function'&&has('cans')))
   draw(pic('v15_glow_beer_cans'),286,422,105,85,t);
  // Dirkjan's paper is a separate collectible-looking object on the wall.
  draw(pic('v15_glow_note'),547,275,62,71,t);
  halo(235,469,42,t);
  halo(305,500,34,t);
 }
 const props=photoProps[room]||[];
 for(const [name,x,y,w,h] of props){
  if(room==='print'&&name==='brochures'&&(F('proofPicked')||F('proofDone')))continue;
  if(room==='restroom'&&F('toiletDone'))continue;
  draw(pic('v15_glow_'+name),x,y,w,h,t);
 }
 for(const it of V.items){
  if(it.scene!==room||!V.isVisible(it))continue;
  const old=Fetched('v13art_'+it.id);
  if(ready(old))draw(old,it.x,it.y,it.w,it.h,t);
 }
 drawPlayer(t);nav(t,room);
 if(hover&&typeof drawGlowing==='function')drawGlowing(hover,t);
}
const previousWorld=drawWorld;
drawWorld=function(t){
 const room=s.scene;
 if(room==='borreoffice'){ctx.save();paintDesk(t);ctx.restore();return;}
 if(room==='underdesk'){ctx.save();paintUnder(t);ctx.restore();return;}
 if(sources[room]){ctx.save();paintPhoto(room,t);ctx.restore();return;}
 previousWorld(t);
 if(room==='restroom'&&!F('toiletDone')){
  ctx.save();for(const [name,x,y,w,h] of photoProps.restroom)draw(pic('v15_glow_'+name),x,y,w,h,t);ctx.restore();
 }
};
T.assetAudit=()=>{
 const entries=Object.keys(cache);
 return {version:'15.0',registeredWebpAssets:entries.length,
 ready:entries.filter(k=>ready(cache[k])),missing:entries.filter(k=>cache[k].complete&&!cache[k].naturalWidth),
 photographedRooms:Object.keys(sources),characterPoses:{sem:sem.length,marloes:marloes.length,borre:borre.length},
 animatedObjects:obj.length,marloesMood:mood(),originalActionsRetained:true};
};
console.info('Cantique V15 new WEBP sprite sheets integrated',T.assetAudit());
})();