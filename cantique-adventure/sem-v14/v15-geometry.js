/* Cantique Adventure V15 — geometry + visible-world repair. The existing
   story, inventory, save and audio callbacks continue to be used unchanged. */
(function(){
'use strict';
const V=window.CANTIQUE_V13,G=window.CANTIQUE_V12?.graph;
if(!V||!G)throw Error('V15 requires V14.5');
V.version='15.0';document.title='Cantique Adventure V15';
const W=960,H=720,F=V.isKnown;
const img=id=>images[id]||(typeof imageGet==='function'?imageGet(id):null);
const ok=im=>im&&im.complete&&im.naturalWidth>0;
const V15=window.CANTIQUE_V15={version:'15.0',objects:[],routes:{},npcManifest:[]};
const photos=new Set(['reception_right','central_hub','canteen_hub','packing_workroom','storage_hub','print','press_rear','breakroom','shared_office']);
const portals={
 reception_right:[['reception',[0,286,116,334],'← Balie'],['meeting',[335,180,176,366],'Vergaderruimte']],
 central_hub:[['reception',[0,510,150,192],'← Receptie'],['canteen_hub',[40,350,300,208],'Kantine ←'],['breakroom',[772,280,180,318],'Keuken →'],['print',[462,329,199,274],'Drukkerij ↑']],
 canteen_hub:[['central_hub',[0,332,132,313],'← Werkvloer'],['packing_workroom',[810,322,149,309],'Werkplek →']],
 packing_workroom:[['canteen_hub',[0,260,155,355],'← Kantine'],['storage_hub',[807,310,152,313],'Berging →']],
 storage_hub:[['packing_workroom',[0,330,148,299],'← Werkplek'],['print',[810,296,149,331],'Drukkerij →']],
 print:[['central_hub',[416,282,140,267],'Entree'],['press_rear',[819,333,141,289],'Achterkant →'],['storage_hub',[0,344,144,296],'← Berging']],
 press_rear:[['print',[0,288,139,341],'← Drukkerij']],
 breakroom:[['central_hub',[723,214,232,411],'Werkvloer →']],
 shared_office:[['hall',[806,210,151,385],'Gang →']],
 borreoffice:[['office',[0,536,140,175],'← Werkvloer'],['underdesk',[544,558,188,130],'↓ Borre'],['folding',[823,551,136,157],'Vouwruimte →']],
 underdesk:[['borreoffice',[0,552,148,156],'← Uitzoomen']],
 johanneke_desk:[['office',[0,539,161,168],'← Uitzoomen']]
};
V15.routes=portals;
const mapRect=[798,664,153,47];
for(const [room,exits] of Object.entries(portals)){
 const sc=scenes[room];if(!sc)continue;
 const h=(sc.hot||[]).filter(x=>!x.door&&x.id!=='v145_routes');
 for(const [to,rect,label] of exits)if(G[room]?.includes(to))h.push({
  id:'v15_'+room+'_'+to,door:to,label,rect:rect.slice(),at:[Math.max(88,Math.min(865,rect[0]+rect[2]/2)),640]
 });
 sc.hot=h;sc.v15Exits=h.filter(x=>x.door);
 if(V.doorModels)V.doorModels[room]=sc.v15Exits.map(x=>({dest:x.door,x:x.rect[0],y:x.rect[1],w:x.rect[2],h:x.rect[3],native:true}));
}
for(const sc of Object.values(scenes)){
 sc.hot=(sc.hot||[]).filter(x=>x.id!=='v145_routes');
 sc.hot.push({id:'v15_map',label:'Bekijk de routes',fn:'v15Map',rect:mapRect.slice(),at:sc.spawn?.slice()||[430,650]});
}
const placements={
 breakroom:{
  break_coffee:[[55,384,117,106],[233,647]],
  break_cans:[[291,407,92,62],[385,637]],
  break_beer:[[390,272,125,290],[583,644]],
  break_water:[[164,421,119,90],[383,638]],
  break_cloth:[[286,476,81,74],[435,639]],
  break_dirk:[[531,272,105,80],[609,638]]
 },
 print:{
  print_fen:[[515,445,132,189],[520,645]],
  print_usb:[[279,525,88,53],[405,638]],
  print_proof:[[95,523,135,96],[391,643]],
  print_note4:[[674,397,82,74],[646,643]]
 },
 borreoffice:{
  v14_marloes_seated:[[150,202,267,345],[444,634]],
  v14_item_v14_lensmug:[[700,243,96,101],[697,637]]
 }
};
for(const [id,dict] of Object.entries(placements)){
 for(const h of scenes[id]?.hot||[]){
  const entry=dict[h.id]||(id==='breakroom'&&h.fn==='v14BrewCoffee'?dict.break_coffee:null);
  if(entry){h.rect=entry[0].slice();h.at=entry[1].slice();}
 }
}
const mug=V.items.find(x=>x.id==='v14_lensmug');
if(mug)Object.assign(mug,{scene:'borreoffice',x:705,y:254,w:85,h:92});
const places={print:[[496,659,.72],[614,670,.65]],folding:[[645,637,.72],[792,632,.67]],central_hub:[[470,658,.74]],shared_office:[[545,643,.74]]};
for(const [room,pts] of Object.entries(places)){
 (scenes[room]?.npcs||[]).forEach((n,i)=>{if(pts[i]){n.at=pts[i].slice(0,2);n.scale=pts[i][2];}});
}
for(const n of scenes.breakroom.npcs||[])n.v15Hidden=true;
function within(x,y,r,pad=0){return r&&x>=r[0]-pad&&x<=r[0]+r[2]+pad&&y>=r[1]-pad&&y<=r[1]+r[3]+pad;}
const wasHit=hotspotFound;
hotspotFound=function(x,y){
 if(within(x,y,mapRect))return scenes[s.scene]?.hot.find(h=>h.id==='v15_map')||null;
 const sc=scenes[s.scene];if(!sc)return null;
 // Only clickable when the thing is actually drawn or visually located there.
 for(let i=sc.hot.length-1;i>=0;i--){
  const h=sc.hot[i];if(h.door||h.id==='v15_map')continue;
  if(!within(x,y,h.rect,3))continue;
  if(h.id.startsWith('v14_item_')){
   const it=V.items.find(it=>'v14_item_'+it.id===h.id);
   if(!it||!V.isVisible(it))continue;
  }
  return h;
 }
 for(const h of sc.v15Exits||[])if(within(x,y,h.rect))return h;
 return photos.has(s.scene)?null:wasHit(x,y);
};
const esc=x=>String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
actions.v15Map=function(){
 closeDialog();modal='v15map';const ui=$('minigame');ui.hidden=false;
 ui.innerHTML='<div class="v15-map"><h3>🧭 '+esc(scenes[s.scene]?.name||s.scene)+'</h3><p>Directe doorgangen; alle oude routes blijven bestaan.</p><div class="v15-dest"></div><button class="v15-close">Sluiten</button></div>';
 const grid=ui.querySelector('.v15-dest');
 // Photographed rooms expose only exits that match a VISIBLE physical doorway.
 // The older full graph is retained for legacy story logic, but it must not
 // become a teleport menu in the new hubs.
 const directions=portals[s.scene]
  ?portals[s.scene].map(x=>x[0]).filter(to=>(G[s.scene]||[]).includes(to))
  :(G[s.scene]||[]);
 for(const to of directions){
  const b=document.createElement('button');b.type='button';b.textContent=(s.visited.includes(to)?'✓ ':'› ')+(scenes[to]?.name||to);
  b.addEventListener('click',()=>{closeMini();travel(to);});grid.append(b);
 }
 ui.querySelector('.v15-close').addEventListener('click',closeMini);
};
const previousTravel=travel;
const entry={
 'central_hub>breakroom':[735,650],'breakroom>central_hub':[826,648],
 'canteen_hub>packing_workroom':[144,649],'packing_workroom>canteen_hub':[151,650],
 'packing_workroom>storage_hub':[160,650],'storage_hub>packing_workroom':[151,655],
 'storage_hub>print':[157,659],'print>storage_hub':[171,653],
 'print>press_rear':[802,649],'press_rear>print':[168,645],
 'office>borreoffice':[695,651],'office>johanneke_desk':[700,649]
};
travel=function(to){
 const from=s.scene;const result=previousTravel(to);
 const key=from+'>'+to;if(s.scene!==from&&entry[key]){
  [s.x,s.y]=entry[key];if(Array.isArray(path))path.length=0;
 }
 return result;
};
const basePlayer=drawPlayer;
drawPlayer=function(t){
 if(['borreoffice','underdesk','johanneke_desk'].includes(s.scene))return;
 ctx.save();const f=photos.has(s.scene)?.81:1;
 ctx.translate(s.x,s.y);ctx.scale(f,f);ctx.translate(-s.x,-s.y);
 basePlayer(t);ctx.restore();
};
// Object and NPC manifests for V15 sprite production / audit.
function generateManifest(){
 const out=[];
 for(const [id,sc] of Object.entries(scenes)){
  for(const n of sc.npcs||[])V15.npcManifest.push({id:n.id,room:id,full:'full_'+n.full,kind:'NPC'});
  for(const item of sc.extra||[])out.push({id:item.id,room:id,type:'item',rect:item.rect,asset:item.sprite});
  for(const h of sc.hot||[])if(!h.door&&!['v15_map'].includes(h.id)){
   out.push({id:h.id,room:id,label:h.label,type:/item|cans|beer|coffee|water|cloth|usb|proof|note|bag|machine|print|paper|lens|koek|gear|plunger|film|snij|roll|sticker|box/i.test(h.id+' '+h.label)?'tangible':'interaction',rect:h.rect,asset:null});
  }
 }
 for(const item of V.items)out.push({id:item.id,room:item.scene,type:'item',rect:[item.x,item.y,item.w,item.h],asset:'v13art_'+item.id});
 V15.objects=out;return out;
}
generateManifest();
V15.audit=()=>{
 const seen=new Set(['reception']),q=['reception'];
 while(q.length){let u=q.shift();for(let to of G[u]||[])if(!seen.has(to)){seen.add(to);q.push(to)}}
 const all=Object.keys(scenes);
 return {version:V.version,rooms:all.length,reachable:seen.size,unreachable:all.filter(x=>!seen.has(x)),
 broken:Object.entries(G).flatMap(([a,bs])=>bs.filter(b=>!G[b]?.includes(a)).map(b=>a+'>'+b)),
 items:V15.objects.length,npcs:V15.npcManifest.length,
 physicalRouteErrors:Object.entries(portals).flatMap(([room,ends])=>ends.filter(([to])=>!(G[room]||[]).includes(to)).map(([to])=>room+'>'+to)),
 physicalRoutes:Object.fromEntries(Object.entries(portals).map(([room,ends])=>[room,ends.map(([to])=>to)])),
 photographed:[...photos],movedKitchenHotspots:Object.keys(placements.breakroom).length};
};
const style=document.createElement('style');
style.textContent='.v15-map{padding:12px;background:#192c30;border:1px solid #a4aa9f;border-radius:14px;color:#fff5df;max-width:680px}.v15-map h3{margin:0}.v15-map p{font-size:14px}.v15-dest{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:7px}.v15-dest button,.v15-close{min-height:45px;border:1px solid #9da6a5;border-radius:8px;background:#24424a;color:white;padding:9px;text-align:left}.v15-close{width:100%;margin-top:13px;text-align:center}';
document.head.append(style);
console.info('CANTIQUE V15 spatial fix',V15.audit());
})();