/* Cantique V12 save compatibility and usability fixes. */
(function(){
'use strict';
const oldSave=save;
save=function(){
 // Original V10 loader only recognises its original room IDs.
 // Persist a safe hall anchor, and separately remember the real V12 room.
 const real=s.scene;
 if(real==='restroom'||real==='storage'){
  s.v12SavedScene=real;
  s.scene='hall';
  try{oldSave()}finally{s.scene=real}
 }else{
  delete s.v12SavedScene;
  oldSave();
 }
};
if(s.v12SavedScene&&scenes[s.v12SavedScene]){
 s.scene=s.v12SavedScene;
 const start=scenes[s.scene].spawn||[470,640];
 s.x=Math.max(60,Math.min(900,s.x||start[0]));
 s.y=Math.max(460,Math.min(680,s.y||start[1]));
 path=[];pending=null;hover=null;
}
const priorRunHot=runHot;
runHot=function(h){
 if(h&&h.id&&h.id.startsWith('v12spr_')){
  const id=h.id.slice(7);
  if(id==='plunger'&&flag('v12Found_plunger'))return toast('De ontstopper zit in je inventaris. Coen wacht op de wc.');
  if(id==='cooler'&&flag('v12Found_cooler'))return toast('Je hebt de rode koelbox al meegenomen.');
  if(id==='lens'&&flag('lensTaken'))return toast('De dure lens ligt niet meer op het bureau.');
  if(id==='powder'&&(flag('packetPicked')||flag('packetHanded')))return toast('Het witte poeder ligt niet meer onder de stoel.');
 }
 return priorRunHot(h);
};
if(window.CANTIQUE_V12){
 window.CANTIQUE_V12.healthCheck=function(){
  const g=window.CANTIQUE_V12.graph;
  const seen=new Set(),stack=['reception'];
  while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);stack.push(...(g[id]||[]));}
  return{rooms:Object.keys(g).length,reachable:seen.size,objects:window.CANTIQUE_V12.spriteCount,scene:s.scene,saveCompatible:true};
 };
}
const visualFix=document.createElement('style');
visualFix.textContent='@media (pointer:coarse) and (orientation:landscape) and (max-height:600px){.v12-nav{position:fixed;z-index:9;right:68px;bottom:4px;left:180px;margin:0;padding:4px 6px;background:#142229ee;max-height:66px;overflow:hidden}.v12-nav header{margin-bottom:2px}.v12-nav button{padding:4px 7px;min-height:27px;font-size:10px}.v12-nav-doors{flex-wrap:nowrap;overflow-x:auto}.v12-nav-doors button{flex-shrink:0}}@media (prefers-reduced-motion:reduce){.v12Scream{animation:none!important}}';
document.head.append(visualFix);
syncUI();
})();