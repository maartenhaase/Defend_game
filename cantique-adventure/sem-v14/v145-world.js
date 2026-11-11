/* CANTIQUE ADVENTURE V14.5 — real asset integration and navigable hubs.
   Load LAST, after V14.4 sound. Preserve all inventory / quest state. */
(function(){
'use strict';
const V=window.CANTIQUE_V13,G=window.CANTIQUE_V12?.graph;
if(!V||!G||typeof scenes==='undefined'||typeof actions==='undefined')throw Error('V14.5 requires the full Cantique game');
V.version='14.5';
document.title='SEM in Cantique V14.5 — de echte Cantique-wereld';
const A='./assets/';
const art={
 reception_right:'v145_reception_right.webp',
 central_hub:'v145_central_hub.webp',
 canteen_hub:'v145_canteen_hub.webp',
 packing_workroom:'v145_packing_workroom.webp',
 storage_hub:'v145_storage_hub.webp',
 print:'v145_press_hub.webp',
 press_rear:'v145_press_rear.webp',
 breakroom:'v145_kitchen_hub.webp',
 shared_office:'v145_shared_office.webp'
};
const photos={};
for(const [id,file] of Object.entries(art)){
 const img=new Image();img.decoding='async';img.src=A+file;photos[id]=img;
 imagePaths['bg_'+id]=img.src;images['bg_'+id]=img;
}
const faceImage=new Image();faceImage.decoding='async';faceImage.src=A+'v145_marloes_sprite.webp';
const deskImage=new Image();deskImage.decoding='async';deskImage.src=A+'marloes-desk.webp';
const loaded=im=>!!im&&im.complete&&im.naturalWidth>0;
const additions={
 reception_right:['Receptie — rechts','De glazen deur leidt naar de vergaderruimte.'],
 central_hub:['Centrale werkvloer','Bij de trap komen de keuken, kantine en productie samen.'],
 canteen_hub:['Kantinehoek','Lange houten tafel, groene stoelen en de doorgang naar de aparte werkplek.'],
 packing_workroom:['Aparte werkplek','Inpaktafel en computers; achter de hoek ligt de berging.'],
 storage_hub:['Magazijn en stellingen','Papier, folie en dozen. Verderop staan de drukmachines.'],
 press_rear:['Achter de drukpersen','Van achter de grote printers kijk je terug richting de werkvloer.'],
 shared_office:['Gezamenlijk kantoor tegenover het toilet','Een apart, groter kantoor aan de overzijde van de centrale gang.']
};
for(const [id,[name,sub]] of Object.entries(additions)){
 scenes[id]={name,sub,bg:id,spawn:[470,642],floor:[[12,715],[947,715],[906,466],[690,413],[300,413],[51,472]],hot:[],npcs:[],extra:[]};
}
// Restore the ORIGINAL opening room (V11/V12). From the reception the player
// enters this shared desk overview, with Johanneke, Marloes and Sem's workspace.
// The newer photograph belongs to ANOTHER office, opposite the toilet.
scenes.office.name='Gezamenlijke werkvloer · Johanneke, Marloes en Sem';
scenes.office.sub='Je ziet de bureaus van Johanneke, Marloes en Sem. Klik om dichterbij te kijken.';
scenes.office.spawn=[760,620];
scenes.office.floor=[[300,716],[950,716],[880,467],[805,377],[700,338],[620,432],[420,520]];
// Retain every original workstation NPC and original interaction from the old room.
// Convert the two close-up points into true zoom entries; Sem's original door remains.
const marloesOverview=scenes.office.hot.find(h=>h.id==='office_mar');
if(marloesOverview){delete marloesOverview.fn;marloesOverview.door='borreoffice';marloesOverview.label='Inzoomen op Marloes’ bureau';}
const johannekeOverview=scenes.office.hot.find(h=>h.id==='office_jo');
if(johannekeOverview){delete johannekeOverview.fn;johannekeOverview.door='johanneke_desk';johannekeOverview.label='Inzoomen op Johannekes bureau';}
const semOverview=scenes.office.hot.find(h=>h.id==='office_sem');
if(semOverview){semOverview.label='Inzoomen op Sems bureau';}
scenes.johanneke_desk={
 name:'Bij Johannekes bureau',
 sub:'Een close-up van Johannekes werkplek. Praat met haar over de productie.',
 bg:'office',spawn:[310,647],floor:[[15,715],[945,715],[880,547],[70,547]],
 hot:[
  {id:'v145_jo_zoom_talk',label:'Praat met Johanneke',fn:'johanneke',rect:[296,175,391,414],at:[570,621]},
  {id:'v145_jo_zoom_back',label:'Uitzoomen naar de gezamenlijke werkvloer',door:'office',rect:[0,524,174,193],at:[230,640]}
 ],npcs:[{id:'johanneke',name:'Johanneke',at:[502,575],kind:'desk',portrait:'johanneke_wierbos',full:'johanneke',scale:1.45,interact:'johanneke'}],extra:[]
};
scenes.breakroom.name='Keuken';
scenes.breakroom.sub='Zwarte kastjes, spoelbak en het koffiezetapparaat.';
scenes.breakroom.spawn=[540,640];
scenes.breakroom.floor=[[20,716],[951,716],[921,482],[620,430],[280,451],[40,522]];
scenes.print.name='Drukkerij — voorkant';
scenes.print.sub='De productiemachines en de doorgang naar de achterzijde.';
scenes.print.spawn=[470,650];
scenes.print.floor=[[20,715],[950,715],[896,479],[670,410],[330,410],[63,476]];
// V12's original traversable world is the base; the photo hubs are extensions,
// not a wholesale replacement. Every old edge is retained unless the physical
// entrance to its room has genuinely moved (none in this restoration).
const adj={
 outside:['reception'],
 reception:['outside','office','reception_right','central_hub','hall'],
 office:['reception','sem','managers','borreoffice','hall','print','johanneke_desk'],
 sem:['office'],
 managers:['office','jarno_sanne','meeting','hall'],
 jarno_sanne:['managers','machine2'],
 meeting:['managers','hall','reception_right'],
 borreoffice:['office','folding','underdesk'],
 hall:['office','meeting','managers','breakroom','restroom','storage','marthijn','maarten','print','reception','central_hub','shared_office'],
 breakroom:['hall','folding','central_hub'],
 restroom:['hall'],
 storage:['hall','print'],
 marthijn:['hall'],
 maarten:['hall','cabinet'],
 cabinet:['maarten'],
 print:['hall','office','storage','machine2','central_hub','storage_hub','press_rear','folding'],
 machine2:['print','jarno_sanne','cutting'],
 cutting:['machine2','folding'],
 folding:['cutting','breakroom','borreoffice','print'],
 underdesk:['borreoffice'],
 johanneke_desk:['office'],
 reception_right:['reception','meeting'],
 central_hub:['reception','hall','canteen_hub','breakroom','print'],
 canteen_hub:['central_hub','packing_workroom'],
 packing_workroom:['canteen_hub','storage_hub'],
 storage_hub:['packing_workroom','print'],
 press_rear:['print'],
 shared_office:['hall']
};
for(const [id,list] of Object.entries(adj))if(!scenes[id])throw Error('World node not present: '+id);
for(const [id,list] of Object.entries(adj))for(const dest of list)if(!adj[dest]?.includes(id))throw Error('Non-reciprocal: '+id+' -> '+dest);
for(const id of Object.keys(G))delete G[id];
for(const [id,list] of Object.entries(adj))G[id]=list.slice();
const routeLabels={
 outside:'Buiten',reception:'Entree en balie',reception_right:'Glazen vergaderdeur',
 hall:'Centrale gang',office:'Gezamenlijke bureaus',sem:'Sems bureau',
 johanneke_desk:'Johannekes bureau (zoom)',shared_office:'Kantoor tegenover de wc',
 managers:'Management',jarno_sanne:'Sanne en Jarno',meeting:'Vergaderruimte',
 borreoffice:'Marloes’ werkplek',underdesk:'Onder Marloes’ bureau',
 central_hub:'Werkvloer bij trap',canteen_hub:'Kantinetafel',
 packing_workroom:'Aparte werkplek',storage_hub:'Magazijn',
 print:'Drukkerij',press_rear:'Achter de printers',breakroom:'Keuken',
 restroom:'WC',storage:'Schoonmaakkast',maarten:'Maartens kantoor',
 marthijn:'Marthijns kantoor',cabinet:'Camerakast',machine2:'Machinekamer',
 cutting:'Snijtafel',folding:'Vouwruimte'
};
const portals={
 reception_right:[
  ['meeting',[282,152,260,403]],['reception',[0,268,128,351]]
 ],
 central_hub:[
  ['breakroom',[755,169,179,372]],['canteen_hub',[233,224,284,331]],
  ['reception',[0,252,125,385]],['print',[850,295,108,324]]
 ],
 canteen_hub:[
  ['central_hub',[0,262,144,361]],['packing_workroom',[700,177,246,368]]
 ],
 packing_workroom:[
  ['canteen_hub',[0,250,130,338]],['storage_hub',[797,181,151,384]]
 ],
 storage_hub:[
  ['packing_workroom',[783,210,170,354]],['print',[0,234,147,371]]
 ],
 print:[
  ['central_hub',[0,300,155,341]],['press_rear',[777,234,175,365]]
 ],
 press_rear:[
  ['print',[0,240,164,375]]
 ],
 breakroom:[
  ['central_hub',[723,167,227,400]]
 ],
 shared_office:[
  ['hall',[796,149,156,403]]
 ]
};
function navHot(dest,rect,scene){
 const x=rect[0],y=rect[1],w=rect[2],h=rect[3];
 return {id:'v145_door_'+scene+'_'+dest,label:routeLabels[dest]||dest,door:dest,rect:[x,y,w,h],at:[Math.max(80,Math.min(875,x+w/2)),Math.max(550,Math.min(640,y+h))]};
}
const isPhoto=id=>Object.prototype.hasOwnProperty.call(art,id);
for(const id of Object.keys(adj)){
 const sc=scenes[id];
 // Remove obsolete or duplicated doors; preserve exact action hotspots and story items.
 const valid=new Map();
 for(const h of sc.hot||[]){
  if(!h.door)continue;
  if(G[id].includes(h.door)&&!valid.has(h.door))valid.set(h.door,h);
 }
 const nonDoors=(sc.hot||[]).filter(h=>!h.door&&h.id!=='v145_routes');
 const physical=portals[id]||[];
 // New photographed hubs use their actual visible door areas only, no old collision hotspots.
 if(isPhoto(id))valid.clear();
 for(const [dest,rect] of physical)valid.set(dest,navHot(dest,rect,id));
 sc.hot=[...nonDoors,...valid.values(),{
  id:'v145_routes',label:'Bekijk de routes',fn:'v145Routes',
  rect:[785,650,175,70],at:sc.spawn?sc.spawn.slice():[470,642]
 }];
 sc.v145Destinations=G[id].slice();
 if(V.doorModels)V.doorModels[id]=Array.from(valid.values()).map(h=>({dest:h.door,x:h.rect[0],y:h.rect[1],w:h.rect[2],h:h.rect[3],native:true}));
}
// Move coffee hotspots onto the actual new photographed kitchen countertop.
for(const h of scenes.breakroom.hot){
 if(h.fn==='v14BrewCoffee'||h.fn==='coffee'){h.rect=[62,357,170,189];h.at=[260,605];}
 if(h.fn==='water'){h.rect=[272,421,200,132];h.at=[405,597];}
 if(h.fn==='cloth'){h.rect=[413,480,95,105];h.at=[497,613];}
}
const brew=V.items.find(it=>it.id==='v14_coffee');if(brew)brew.scene='breakroom';
// Scene navigation is deliberately one step at a time; the route map is NOT teleportation.
const escape=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
actions.v145Routes=function(){
 closeDialog();modal='v145routes';const panel=$('minigame');panel.hidden=false;
 panel.innerHTML='<div class="v145-map"><h3>Plattegrond · '+escape(routeLabels[s.scene]||s.scene)+'</h3><p>Kies een aangrenzende ruimte. Je loopt steeds via een echte verbinding.</p><div class="v145-mapgrid"></div><button class="secondary v145-close" type="button">Terug naar spel</button></div>';
 const grid=panel.querySelector('.v145-mapgrid');
 for(const to of G[s.scene]||[]){
  const button=document.createElement('button');
  button.type='button';button.className='v145-route';
  button.textContent=(s.visited.includes(to)?'✓ ':'› ')+(routeLabels[to]||to);
  button.onclick=()=>{closeMini();travel(to);};
  grid.append(button);
 }
 panel.querySelector('.v145-close').onclick=closeMini;
};
const previousHotspot=hotspotFound;
hotspotFound=function(x,y){
 if(x>=785&&y>=650&&y<=720){
  const h=scenes[s.scene]?.hot?.find(h=>h.id==='v145_routes');if(h)return h;
 }
 // Puzzle actions and pickups beat broad passageway hitboxes on the new photos.
 // Without this, the kitchen doorway eclipsed the beer/fridge interaction.
 if(isPhoto(s.scene)){
  const room=scenes[s.scene];
  for(let i=room.hot.length-1;i>=0;i--){
   const h=room.hot[i];if(h.door||h.id==='v145_routes')continue;
   const r=h.rect;if(!r)continue;
   if(x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3])return h;
  }
 }
 return previousHotspot(x,y);
};
// The prior code draws the old room first. For the nine unique rooms, replace
// only its pixels, then re-layer actual NPCs, relevant inventory sprites and Sem.
const previousDraw=drawWorld;
function drawLabel(){
 ctx.save();ctx.fillStyle='rgba(12,24,28,.9)';ctx.strokeStyle='rgba(236,211,160,.82)';
 ctx.lineWidth=1.7;ctx.beginPath();ctx.roundRect(793,657,157,44,8);
 ctx.fill();ctx.stroke();ctx.fillStyle='#fff1c8';ctx.textAlign='center';
 ctx.font='bold 18px system-ui';ctx.fillText('🧭 Routes',871,686);ctx.restore();
}
function overlayProps(id){
 for(const it of V.items){
  if(it.scene!==id||!V.isVisible(it))continue;
  // The separate original V14 inventory sprites remain interactive.
  const im=images['v13art_'+it.id];
  if(loaded(im)){ctx.save();ctx.shadowColor='#0007';ctx.shadowBlur=6;ctx.drawImage(im,it.x,it.y,it.w,it.h);ctx.restore();}
 }
 if(id==='breakroom'){
  const im=images['v13art_v14_coffeemachine'];
  if(loaded(im))ctx.drawImage(im,68,374,119,162);
 }
}
function paintPhotoRoom(id,t){
 const im=photos[id];
 ctx.save();ctx.clearRect(0,0,960,720);
 if(loaded(im))ctx.drawImage(im,0,0,960,720);
 else{
  // Never silently display a different room's photo if an asset fails.
  ctx.fillStyle='#26333a';ctx.fillRect(0,0,960,720);
  ctx.fillStyle='#fff4d8';ctx.font='20px system-ui';ctx.fillText('Foto van '+(routeLabels[id]||id)+' laden…',90,310);
 }
 // Full-body / desk NPCs from the existing cast are independent sprites.
 for(const npc of scenes[id].npcs||[])if(typeof drawNPC==='function')drawNPC(npc,t);
 overlayProps(id);
 if(typeof drawPlayer==='function')drawPlayer(t);
 if(hover&&typeof drawGlowing==='function')drawGlowing(hover,t);
 ctx.restore();
}
drawWorld=function(t){
 if(s.scene==='johanneke_desk'){
  const src=images.bg_office;
  ctx.save();ctx.clearRect(0,0,960,720);
  if(loaded(src)){
   // Close-up of Johanneke's ORIGINAL desk in the shared office overview,
   // distinct from the overview image: crop and zoom, not reuse as another room.
   const iw=src.naturalWidth,ih=src.naturalHeight;
   ctx.drawImage(src,Math.floor(iw*.30),Math.floor(ih*.29),
    Math.floor(iw*.46),Math.floor(ih*.53),0,0,960,720);
  }else{
   ctx.fillStyle='#293943';ctx.fillRect(0,0,960,720);
  }
  for(const npc of scenes.johanneke_desk.npcs||[])if(typeof drawNPC==='function')drawNPC(npc,t);
  if(typeof drawPlayer==='function')drawPlayer(t);
  ctx.restore();
  drawLabel();return;
 }
 if(isPhoto(s.scene)){paintPhotoRoom(s.scene,t);drawLabel();return;}
 previousDraw(t);drawLabel();
};
const previousTravel=travel;
travel=function(id){return previousTravel(id);};
function reachable(from){
 const q=[from],seen=new Set(q);while(q.length){const at=q.shift();
 for(const to of G[at]||[])if(!seen.has(to)){seen.add(to);q.push(to);}
 }return [...seen];
}
V.worldAudit=()=>{
 const all=Object.keys(scenes),noConnections=all.filter(id=>!G[id]?.length);
 const inaccessible=all.filter(id=>!reachable('reception').includes(id));
 const broken=Object.entries(G).flatMap(([id,list])=>list.filter(dest=>!G[dest]?.includes(id)).map(dest=>id+' > '+dest));
 const photosUsed=Object.entries(art),duplicatePhotos=photosUsed.filter(([id,src],i)=>photosUsed.findIndex(x=>x[1]===src)!==i).map(x=>x[0]);
 const missingDoorHot=Object.entries(G).flatMap(([id,list])=>list.filter(dest=>!(scenes[id]?.hot||[]).some(h=>h.door===dest)&&!(scenes[id]?.hot||[]).some(h=>h.id==='v145_routes')).map(dest=>id+' > '+dest));
 return {version:V.version,rooms:all.length,photoRooms:photosUsed.length,photoAssets:art,
  missingAssets:Object.entries(photos).filter(([id,im])=>im.complete&&!im.naturalWidth).map(([id])=>id),
  loadedAssets:Object.entries(photos).filter(([id,im])=>loaded(im)).map(([id])=>id),
  inaccessible,noConnections,broken,duplicatePhotos,missingDoorHot,
  portalLinks:Object.values(portals).reduce((total,arr)=>total+arr.length,0),
  underDeskOnlyBorre:(scenes.underdesk.npcs||[]).every(x=>x.name!=='Marloes')};
};
const style=document.createElement('style');
style.textContent='.v145-map{padding:15px;max-width:680px;margin:auto;background:#16282c;border:1px solid #74878a;border-radius:14px;color:#faf0dc}.v145-map h3{font-size:21px;margin:0 0 5px}.v145-map p{font-size:14px}.v145-mapgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin:14px 0}.v145-route{padding:12px;border:1px solid #a8a792;border-radius:8px;background:#273d42;color:#fff8df;text-align:left;font-weight:bold;cursor:pointer;min-height:47px}.v145-route:active{background:#526b67}.v145-close{width:100%;min-height:43px}@media(max-width:680px){.v145-map{padding:8px}.v145-route{min-height:44px;font-size:13px}}';
document.head.append(style);
const tag=document.querySelector('#splash .eyebrow');if(tag)tag.textContent='V14.5 · Nieuwe Cantique-wereld';
syncUI();
console.info('CANTIQUE V14.5 PHOTO HUBS LOADED',V.worldAudit());
})();