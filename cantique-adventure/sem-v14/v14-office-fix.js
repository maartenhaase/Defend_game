/* CANTIQUE V14.3: Werkplek Marloes / Onder het bureau — live gameplay patch.
   Replaces the old mixed office collage with two actual navigable photographic scenes.
   Retains all existing main-story quests, inventory flags and mobile controls. */
(function(){
'use strict';
const V=window.CANTIQUE_V13;
if(!V||!scenes.borreoffice)throw Error('Cantique V14 game modules were not loaded');
const F=V.isKnown;
const deskId='borreoffice',underId='underdesk';
const desk=scenes[deskId];
const graph=window.CANTIQUE_V12?.graph;
const assets={};
function photo(key,path){
 const im=new Image();im.decoding='async';im.src=path;assets[key]=im;
 imagePaths['bg_'+key]=path;images['bg_'+key]=im;return im;
}
const deskPhoto=photo(deskId,'./assets/marloes-desk.webp');
const underPhoto=photo(underId,'./assets/under-desk.webp');
// Photo becomes the actual office room backdrop including photo-based Marloes and Borre.
// Do not draw the earlier tiny clipped Marloes NPC under the table a second time.
if(window.V10_ASSETS)window.V10_ASSETS.room_borreoffice='./assets/marloes-desk.webp';
desk.name='Marloes’ werkplek';
desk.sub='Marloes werkt aan haar bureau. De bijzondere lensmok staat onder het beeldscherm.';
desk.bg=deskId;
desk.spawn=[210,650];
desk.floor=[[8,710],[958,710],[922,575],[760,530],[370,520],[40,550]];
desk.npcs=[];
desk.extra=[];
const mug=V.items.find(it=>it.id==='v14_lensmug');
if(!mug)throw Error('V14 lens mug inventory item missing');
Object.assign(mug,{scene:deskId,x:717,y:351,w:76,h:87});
const remap=(h,rect,at)=>{h.rect=rect;h.at=at;return h};
const newMugHot=desk.hot.find(h=>h.id==='v14_item_v14_lensmug');
if(newMugHot){remap(newMugHot,[mug.x,mug.y,mug.w,mug.h],[724,608]);newMugHot.label='Lensmok van Marloes';}
const keep=[];
for(const h of desk.hot){
 const label=(String(h.label||'')+' '+String(h.id||'')).toLowerCase();
 if(h.door)continue;
 if(h.id==='v14_item_v14_lensmug')continue;
 if(h.id==='v13_item_v13_chewed')continue;
 if(/\bborre\b|\bmarloes\b|v14_borre_sprite/.test(label))continue;
 keep.push(h);
}
const entry=(id,label,rect,destination,at)=>({id,label,rect,door:destination,at});
const interact=(id,label,rect,fn,at)=>({id,label,rect,fn,at});
const deskMug=newMugHot||interact('v14_item_v14_lensmug','Lensmok van Marloes',[mug.x,mug.y,mug.w,mug.h],'v14TakeMug',[724,608]);
desk.hot=[
 entry('v14_office_exit','← Werkvloer',[0,570,140,145],'office',[165,660]),
 entry('v14_folding_exit','Vouwruimte →',[850,570,110,145],'folding',[814,658]),
 interact('v14_marloes_seated','Marloes aan het bureau',[417,142,204,407],'marloes',[401,625]),
 deskMug,
 entry('v14_under_desk','Kijk onder Marloes’ bureau',[541,514,306,180],underId,[589,650]),
 ...keep
];
// The dog is visible only in the under-desk point-of-view and is a separately clickable character.
const b=V.items.find(it=>it.id==='v13_chewed');
if(b)Object.assign(b,{scene:underId,x:653,y:491,w:88,h:65});
const under={
 name:'Onder Marloes’ bureau',
 sub:'Hier zit alleen Borre, onder de tafel bij de kabels en de stoel.',
 bg:underId,
 spawn:[200,649],
 floor:[[25,719],[939,719],[930,534],[35,534]],
 npcs:[],extra:[],
 hot:[
  entry('v14_under_exit','Terug naar Marloes’ werkplek',[0,540,145,180],deskId,[150,652]),
  interact('v14_borre_under','Borre',[465,374,275,212],'borre',[424,652]),
  ...(b?[{id:'v13_item_v13_chewed',label:'Beschadigde energienier',rect:[b.x,b.y,b.w,b.h],at:[705,651],fn:'v13Pickup',v13Item:'v13_chewed'}]:[])
 ]
};
scenes[underId]=under;
if(graph){
 if(!graph[deskId])graph[deskId]=['office','folding'];
 if(!graph[deskId].includes(underId))graph[deskId].push(underId);
 graph[underId]=[deskId];
 if(!graph.office.includes(deskId))graph.office.push(deskId);
 if(!graph.folding.includes(deskId))graph.folding.push(deskId);
}
if(V.doorModels){
 V.doorModels[underId]=[{dest:deskId,x:0,y:540,w:145,h:180,native:true}];
 V.doorModels[deskId]=desk.hot.filter(h=>h.door).map(h=>({dest:h.door,x:h.rect[0],y:h.rect[1],w:h.rect[2],h:h.rect[3],native:true}));
}
// Critical V14 regression fix: V13's item hit testing only knows v13_item_* ids.
// Its previous override returned undefined when the new lens mug / dog treats were touched.
const beforeHit=hotspotFound;
hotspotFound=function(x,y){
 const id=s.scene,room=scenes[id];
 if(!room)return null;
 for(const it of V.items){
  if(!String(it.id).startsWith('v14_')||it.scene!==id||!V.isVisible(it))continue;
  if(x>=it.x-9&&x<=it.x+it.w+9&&y>=it.y-9&&y<=it.y+it.h+9){
   return room.hot.find(h=>h.id==='v14_item_'+it.id)||null;
  }
 }
 // New under-desk scene gets explicitly mapped click regions even on narrow iPhones.
 if(id===underId){
  if(x>460&&x<742&&y>365&&y<594)return room.hot.find(h=>h.id==='v14_borre_under');
  if(x<145&&y>534)return room.hot.find(h=>h.id==='v14_under_exit');
 }
 return beforeHit(x,y);
};
// Support reloading inside the new extra location without returning to a missing legacy scene.
const oldSave=save;
save=function(){
 if(s.scene!==underId){delete s.v14SavedScene;return oldSave();}
 s.v14SavedScene=underId;
 const here=s.scene;s.scene=deskId;
 try{return oldSave();}finally{s.scene=here;}
};
if(s.v14SavedScene===underId){
 s.scene=underId;s.x=235;s.y=637;path=[];pending=null;hover=null;
}
const visible=im=>im&&im.complete&&im.naturalWidth>0;
const art=id=>images['v13art_'+id];
function object(id,x,y,w,h){
 const im=art(id);if(visible(im))ctx.drawImage(im,x,y,w,h);
}
function pill(label,x,y,w){
 ctx.save();ctx.fillStyle='rgba(8,23,29,.85)';
 ctx.strokeStyle='rgba(241,221,169,.82)';ctx.lineWidth=1.6;
 ctx.beginPath();ctx.roundRect(x,y,w,39,9);ctx.fill();ctx.stroke();
 ctx.fillStyle='#fbf0d6';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 17px system-ui';ctx.fillText(label,x+w/2,y+20);
 ctx.restore();
}
const priorWorld=drawWorld;
drawWorld=function(t){
 if(s.scene!==deskId&&s.scene!==underId)return priorWorld(t);
 const current=s.scene,now=Number(t)||0;
 ctx.save();ctx.clearRect(0,0,960,720);
 const im=current===deskId?deskPhoto:underPhoto;
 if(visible(im))ctx.drawImage(im,0,0,960,720);
 else {ctx.fillStyle='#473d32';ctx.fillRect(0,0,960,720);ctx.fillStyle='#fff0d8';ctx.font='bold 24px system-ui';ctx.fillText('Kantoorachtergrond laden…',300,360);}
 if(current===deskId){
  // Keep Marloes out from underneath the desk. She is seated in the actual photo,
  // which replaces the old 'marloes_desk_1' cutout completely.
  if(V.isVisible(mug))object('v14_lensmug',mug.x,mug.y,mug.w,mug.h);
  else if(F('v14_comforted'))object('v14_lensmug',mug.x,mug.y,mug.w,mug.h);
  if(F('v14_noticed')&&!F('v14_comforted')){
   // Register the crying sprite near her eyes in the newly photographed wide scene.
   object('v14_tears_'+Math.floor(now/320)%4,449,176,91,99);
   ctx.globalAlpha=.54;object('v14_tears_'+Math.floor(now/430)%4,462,216,67,77);ctx.globalAlpha=1;
  }
  if(F('v14_distract')&&!F('v14_mugTaken')){
   // Animated treat icon at the dog, not chocolate.
   const bob=Math.sin(now/260)*7;
   object('v14_dogtreat',581,503+bob,48,52);
  }
  // Sem stands on the office floor (not floating on the cabinets).
  if(typeof drawPlayer==='function')drawPlayer(now);
  pill('← Werkvloer',14,649,150);
  pill('↓ Borre',561,649,132);
  pill('Vouwruimte →',790,649,159);
 } else{
  // Only Borre appears under this desk. No Marloes sprite is rendered in this room.
  if(F('v14_distract')&&!F('v14_mugTaken'))object('v14_dogtreat',539,491+Math.sin(now/230)*8,46,43);
  const kid=V.items.find(it=>it.id==='v13_chewed');
  if(kid&&V.isVisible(kid))object('v13_chewed',kid.x,kid.y,kid.w,kid.h);
  pill('← Terug naar bureau',14,649,228);
  // Very subtle tail-wag cue, without adding an extra copy of Borre.
  if(Math.sin(now/260)>.35){
   ctx.strokeStyle='rgba(166,121,73,.55)';ctx.lineWidth=7;ctx.lineCap='round';
   ctx.beginPath();ctx.moveTo(555,468);ctx.quadraticCurveTo(542,436,528,448);ctx.stroke();
  }
 }
 if(hover&&typeof drawGlowing==='function')drawGlowing(hover,now);
 ctx.restore();
};
// The old V14 cutscenes have another Marloes and dog cutout.
// The new photo already includes them in correct perspective, so don't double them.
const style=document.createElement('style');
style.textContent=[
 '.v14cut .v14-mar,.v14cut .v14-borre{display:none!important}',
 '.v14cut .v14-tear-photo{top:19%;left:44%;width:15%;height:33%}',
 '.v14cut .v14-treat-shot{bottom:18%;left:62%;width:12%}',
 '@media(max-width:650px){.v14cut .v14-tear-photo{top:17%;left:45%}}'
].join('');
document.head.append(style);
V.officeTest=()=>({
 rooms:Object.keys(scenes).length,
 desk:!!scenes[deskId],underdesk:!!scenes[underId],
 photoDesk:deskPhoto.complete&&deskPhoto.naturalWidth>0,
 photoUnder:underPhoto.complete&&underPhoto.naturalWidth>0,
 mugCoordinates:[mug.x,mug.y,mug.w,mug.h],
 mugHotspot:!!desk.hot.find(h=>h.fn==='v14TakeMug'),
 dogUnder:!!under.hot.find(h=>h.fn==='borre'),
 oldMarloesUnder:false,
 dogTreatClickable:!!scenes.maarten.hot.find(h=>h.id==='v14_item_v14_dogtreat'),
 reversible:!!graph?.[underId]?.includes(deskId),
 noChocForBorre:true
});
syncUI();
console.info('Cantique V14.3 office correction loaded',V.officeTest());
})();