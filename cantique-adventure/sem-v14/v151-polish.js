/* Cantique Adventure V15.1 — targeted repair layer.
   Loaded AFTER V15 sprites. Preserves the original quests, save data and doors.
   All coordinates are scene-space pixels on the existing 960 × 720 canvas. */
(function () {
'use strict';
const V=window.CANTIQUE_V13, T=window.CANTIQUE_V15;
if (!V || !T || !window.CANTIQUE_V12 || !scenes?.print || !scenes?.press_rear) {
  throw Error('V15.1 requires the complete V15 game');
}
V.version='15.1'; T.version='15.1';
document.title='SEM IN CANTIQUE · V15.1';
const F=V.isKnown, S=V.setKnown;
const ready=im=>!!(im&&im.complete&&im.naturalWidth>0);
const room=(id)=>scenes[id];
const place=(id,hot,rect,at)=>{
 const h=room(id)?.hot?.find(x=>x.id===hot);
 if(h){h.rect=rect.slice();h.at=at.slice();} return h;
};
const addHot=(id,obj)=>{
 if(!room(id))return;
 room(id).hot=room(id).hot.filter(x=>x.id!==obj.id);
 room(id).hot.push(obj);
};
// V15 mistakenly introduced decorative floating sprites as clickable game objects.
for(const sc of Object.values(scenes))
 sc.hot=(sc.hot||[]).filter(h=>!String(h.id||'').startsWith('v15_prop_'));
// Coordinates correspond to physical objects in the photo, not a random icon.
place('breakroom','v13_dianne',[406,280,126,335],[454,643]);
place('breakroom','break_dirk',[535,250,103,98],[575,638]);
place('breakroom','break_cans',[287,414,112,90],[358,632]);
place('breakroom','break_coffee',[55,360,110,156],[223,624]);
place('breakroom','break_water',[185,425,110,92],[316,628]);
place('breakroom','break_cloth',[307,464,80,76],[396,631]);
place('print','print_fen',[440,330,156,304],[483,645]);
place('print','print_note4',[680,344,104,82],[696,645]);
// Keep the existing Fenneke interaction; relocate the physical figure to it.
for(const n of room('print').npcs||[])if(n.id==='fenneke'){
 n.at=[478,649];n.scale=.88;n.v15Hidden=false;
}
// The older geometry deliberately hid ALL kitchen people, including Dianne.
for(const n of room('breakroom').npcs||[]) n.v15Hidden=false;
// One separate, clickable woman in the kitchen. Use her verified labeled portrait,
// not an unrelated colleague's body or a baked-in figure from a screenshot.
room('breakroom').npcs ||= [];
if(!(room('breakroom').npcs||[]).some(n=>n.id==='dianne')) {
 room('breakroom').npcs.push({id:'dianne',name:'Dianne',at:[466,644],
  kind:'v151Portrait',full:'dianne',scale:1,interact:'v13Dianne'});
}
// Rineke Boers is named in the original game data. Give her a useful interaction.
if(!(room('print').npcs||[]).some(n=>n.id==='rineke'))
 room('print').npcs.push({id:'rineke',name:'Rineke',at:[758,646],
  kind:'v151Portrait',full:'rineke_boers',scale:1,interact:'v151Rineke'});
addHot('print',{id:'v151_rineke',label:'Praat met Rineke',fn:'v151Rineke',
 rect:[660,400,153,235],at:[702,645]});
actions.v151Rineke=()=>{
 say('Rineke','Die drukmachines hebben vandaag meer kuren dan wij deadlines.',[
  {t:'Waar vind ik onderdelen voor de printers?',f:()=>say('Rineke','Kijk bij de grote snijmachine. Er liggen soms losse machineonderdelen.',[{t:'Bedankt!',f:closeDialog}])},
  {t:'Is Johanneke er?',f:()=>say('Rineke','Ze probeert achter de printers uit te zoeken waarom een machine zo hard ratelt.',[{t:'Ik ga kijken.',f:closeDialog}])}
 ]);
};
// Restoring the picture from the labeled headshot is an explicit fallback for
// cast members without approved full-body art. Never borrow somebody else's body.
const portraits={};
for(const [name,source] of [['dianne','dianne'],['rineke','rineke_boers']]){
 const file=imagePaths['portrait_'+source];
 if(file){const img=new Image();img.decoding='async';img.src=file;portraits[name]=img;}
}
function portraitActor(n,t){
 const im=portraits[n.id]; if(!ready(im))return;
 const [x,y]=n.at;
 const w=160,h=218,bob=Math.sin(t/1100)*1.3;
 ctx.save();
 ctx.shadowColor='#000a';ctx.shadowBlur=15;ctx.shadowOffsetY=6;
 // A grounded, photographic portrait board is preferable to a fake mismatched
 // full-body NPC. It remains a separate layer and is fully interactive.
 const px=x-w/2,py=y-h+bob;
 ctx.fillStyle='#142026ef';ctx.beginPath();ctx.roundRect(px-5,py-5,w+10,h+16,13);ctx.fill();
 ctx.save();ctx.beginPath();ctx.roundRect(px,py,w,h-35,8);ctx.clip();
 const z=Math.max(w/im.naturalWidth,(h-35)/im.naturalHeight);
 const iw=im.naturalWidth*z,ih=im.naturalHeight*z;
 ctx.drawImage(im,px+(w-iw)/2,py+(h-35-ih)/2,iw,ih);ctx.restore();
 ctx.shadowBlur=0;ctx.fillStyle='#f9e8c7';ctx.font='bold 18px system-ui';
 ctx.textAlign='center';ctx.fillText(n.name,x,py+h-10);ctx.restore();
}
const beforeNPC=drawNPC;
drawNPC=function(n,t){
 if(n?.v15Hidden)return;
 if(n?.kind==='v151Portrait'){portraitActor(n,t);return;}
 if(s.scene==='print'&&n?.id==='fenneke'){
   // The old V15 override multiplied a 150px figure by only .72.
   const [x,y]=n.at;ctx.save();ctx.translate(x,y);ctx.scale(1.22,1.22);
   ctx.translate(-x,-y);beforeNPC(n,t);ctx.restore();return;
 }
 beforeNPC(n,t);
};
// Make Sem readable without changing walk paths or foot anchoring.
const oldPlayer=drawPlayer;
drawPlayer=function(t){
 if(!started||s.scene==='cabinet')return oldPlayer(t);
 const zoom=Math.min(1.95,Math.max(1.40,1.62+(s.y-455)/650));
 ctx.save();ctx.translate(s.x,s.y);ctx.scale(zoom,zoom);
 ctx.translate(-s.x,-s.y);oldPlayer(t);ctx.restore();
};
// Readable clue: the photo note must not lose clicks to the old
// over-sized science-fiction appliance rectangle underneath it.
const originalHotspot=hotspotFound;
hotspotFound=function(x,y){
 if(s.scene==='breakroom'){
  const h=room('breakroom').hot.find(v=>v.id==='break_dirk');
  const r=h?.rect;
  if(r&&x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3])return h;
 }
 return originalHotspot(x,y);
};
// Two-step repair: investigate, fetch the EXISTING gear from machine2,
// select it from inventory, then use it on the opened printer.
function printerRepaired(){return F('v151PrinterFixed');}
function repairPrinter(){
 if(!has('v13_gear'))return;
 remove('v13_gear');s.selected=null;
 S('v151PrinterFixed');S('v151PrinterSeen');
 note('Sem heeft het kapotte tandwiel achter de drukpersen vervangen. De machine is eindelijk stil.');
 sound('done');syncUI();stopNoise();
 say('Johanneke','HEERLIJK! Eindelijk rust. Sem, dit was het enige tandwiel in het gebouw dat wél iets nuttigs deed.',[
  {t:'Zal ik een onderhoudscontract opstellen?',f:()=>say('Johanneke','Laten we niet meteen overdrijven. Eén wonder per dag.',[{t:'Afgesproken.',f:closeDialog}])}
 ]);
}
actions.v151Printer=function(){
 if(printerRepaired())return say('Sem','De drukpers loopt weer rustig. Het nieuwe tandwiel zit op zijn plaats.',[{t:'Mooi.',f:closeDialog}]);
 S('v151PrinterSeen');
 if(has('v13_gear')&&s.selected==='v13_gear'){repairPrinter();return;}
 const options=[
  {t:'Wat is er precies stuk?',f:()=>say('Sem','Een tandwiel heeft een afgebroken tand. Dat verklaart het metaalachtige geratel.',[{t:'Ik zoek een vervanger.',f:closeDialog}])}
 ];
 if(has('v13_gear'))options.unshift({t:'Gebruik mijn tandwiel uit de inventaris',f:repairPrinter});
 else options.unshift({t:'Waar vind ik een vervangend tandwiel?',f:()=>say('Sem','Bij de grote snijmachine ligt misschien een los tandwiel. Ik ga daar kijken.',[{t:'Op pad.',f:closeDialog}])});
 if(s.selected&&s.selected!=='v13_gear')options.unshift({t:'Probeer het geselecteerde voorwerp',f:()=>say('Sem','Nee, '+(itemMeta[s.selected]?.[0]||'dat voorwerp')+' gaat deze kapotte printer niet repareren.',[{t:'Verder zoeken.',f:closeDialog}])});
 say('Sem','De machine ratelt hard. Onder de open klep zit een tandwiel met een kapotte tand.',options);
};
actions.v151Johanneke=function(){
 if(printerRepaired())return say('Johanneke','Zo, eindelijk geen herrie meer. Dank je wel, Sem!',[
  {t:'Nog meer te doen?',f:()=>{closeDialog();actions.loudJohanneke?.();}},
  {t:'Mooi zo.',f:closeDialog}
 ]);
 say('Johanneke','WAT? IK VERSTA JE NIET! DE DRUKPERS RATELT ALS EEN TRACTOR. KIJK EENS IN DIE OPEN MACHINE!',[
  {t:'Ik inspecteer het tandwiel.',f:()=>{closeDialog();actions.v151Printer();}},
  {t:'Kan ik verder ergens mee helpen?',f:()=>{closeDialog();actions.loudJohanneke?.();}},
  {t:'Ik ga onderdelen zoeken.',f:closeDialog}
 ]);
};
addHot('press_rear',{id:'v151_broken_printer',label:'Open printer — kapot tandwiel',fn:'v151Printer',
 rect:[525,343,293,236],at:[594,643]});
addHot('press_rear',{id:'v151_jo_printer',label:'Johanneke bij de lawaaiige printer',fn:'v151Johanneke',
 rect:[315,270,182,365],at:[500,644]});
// Keep both sides physically connected; do not introduce remote teleporters.
const backToPrint=(room('press_rear').v15Exits||[]).some(h=>h.door==='print');
if(!backToPrint)console.warn('V15.1 route audit: press_rear to print not found');
// Procedural sound is generated locally after a user gesture (no network required).
let audioContext=null,machineTone=null,machineGain=null;
function stopNoise(){
 try{machineTone?.stop();}catch(e){}
 try{machineTone?.disconnect();machineGain?.disconnect();}catch(e){}
 machineTone=null;machineGain=null;
}
function startNoise(){
 if(machineTone||s.scene!=='press_rear'||printerRepaired())return;
 if(document.hidden)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  audioContext ||= new AC();
  if(audioContext.state!=='running'){audioContext.resume().catch(()=>{});}
  machineTone=audioContext.createOscillator();
  machineGain=audioContext.createGain();
  const filter=audioContext.createBiquadFilter();
  machineTone.type='sawtooth';machineTone.frequency.value=87;
  filter.type='lowpass';filter.frequency.value=230;
  machineGain.gain.value=.014;
  machineTone.connect(filter);filter.connect(machineGain);
  machineGain.connect(audioContext.destination);
  machineTone.start();
 }catch(err){stopNoise();console.warn('Printer audio not available',err);}
}
const oldTravel=travel;
travel=function(to){if(to!=='press_rear')stopNoise();return oldTravel(to);};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopNoise();});
const canvas=document.getElementById('game');
canvas?.addEventListener('pointerdown',()=>{if(s.scene==='press_rear'&&!printerRepaired())startNoise();});
// The inside of the print machine is drawn as a separate scene overlay, not a
// giant floating object icon. Its gears and damage are highlighted subtly.
function gear(x,y,r,broken,t){
 ctx.save();ctx.translate(x,y);ctx.rotate(broken?-.06:Math.sin(t/1200)*.01);
 ctx.shadowColor='#000b';ctx.shadowBlur=4;ctx.fillStyle='#9da7ad';
 ctx.strokeStyle='#d4d6ce';ctx.lineWidth=1.8;ctx.beginPath();
 for(let i=0;i<48;i++){
  const a=i*Math.PI/24;
  const notch=broken&&i>=4&&i<=10?.56:1;
  const rr=(i%4<2?r*.85:r)*notch;
  if(i===0)ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);
  else ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);
 }
 ctx.closePath();ctx.fill();ctx.stroke();
 // Never use destination-out on the main canvas: it would erase the real photo.
 ctx.shadowBlur=0;ctx.fillStyle='#172126';ctx.beginPath();ctx.arc(0,0,r*.34,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#6a7477';ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
function drawPrinter(t){
 // Keep the real photographic printer, open inspection compartment and machines.
 // Only the interactive broken gear is a separate animated prop.
 const fixed=printerRepaired(),shudder=fixed?0:Math.sin(t/140)*.9;
 const x=620+shudder,y=548;
 ctx.save();
 if(!fixed){
  ctx.shadowColor='rgba(255,205,118,.46)';ctx.shadowBlur=13;
 }
 gear(x,y,23,!fixed,t);
 if(!fixed){
  ctx.strokeStyle='rgba(255,220,143,'+(.23+.16*Math.sin(t/475))+')';
  ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(x,y,31,-.2,1.7);ctx.stroke();
 }
 ctx.restore();
}
const cleanerPhotoPatch=new Image();
cleanerPhotoPatch.decoding='async';
cleanerPhotoPatch.src='./assets/v152_press_no_mechanic_patch.webp';
const oldWorld=drawWorld;
drawWorld=function(t){
 oldWorld(t);
 if(s.scene==='press_rear'){
   ctx.save();
   if(ready(cleanerPhotoPatch))ctx.drawImage(cleanerPhotoPatch,596,260,67,107);
   drawPrinter(t);
   // Johanneke is independent of the photographic room. Reuse the existing
   // correctly attributed full-body sprite, not a baked-in mechanic.
   const jo=imageGet('full_johanneke');
   if(ready(jo)){
    const x=418,y=660,h=315,w=h*jo.naturalWidth/jo.naturalHeight;
    ctx.save();ctx.shadowColor='#0009';ctx.shadowBlur=9;ctx.shadowOffsetY=8;
    ctx.drawImage(jo,x-w/2,y-h+Math.sin(t/850)*1.4,w,h);ctx.restore();
   }
   ctx.restore();
 }
};
T.v151Audit=()=>{
 const ids=Object.keys(scenes);
 const entries=Object.entries(scenes).flatMap(([id,sc])=>(sc.hot||[]).map(h=>({room:id,id:h.id,action:h.fn,door:h.door,rect:h.rect})));
 const missingActions=entries.filter(h=>h.action&&typeof actions[h.action]!=='function');
 const invalidRects=entries.filter(h=>!Array.isArray(h.rect)||h.rect.length!==4||h.rect.some(v=>!Number.isFinite(v)));
 return {version:'15.1',rooms:ids.length,allRooms:ids,
  missingActions,invalidRects,
  duplicates:Object.entries(scenes).flatMap(([r,sc])=>{
   const seen=new Set();return (sc.hot||[]).filter(h=>{if(seen.has(h.id))return true;seen.add(h.id);return false}).map(h=>r+':'+h.id);
  }),repairStarted:F('v151PrinterSeen'),printerFixed:printerRepaired(),
  inventoriedGear:has('v13_gear'),
  decorativePropsRemaining:entries.filter(h=>h.id.startsWith('v15_prop_')).length,
  DianneVisible:room('breakroom').npcs.some(n=>n.id==='dianne'&&!n.v15Hidden),
  FennekeVisible:room('print').npcs.some(n=>n.id==='fenneke'&&!n.v15Hidden)};
};
console.info('Cantique 15.1 repair audit',T.v151Audit());
})();
