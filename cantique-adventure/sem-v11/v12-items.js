/* Cantique V12 — 30 distinct vector object sprites, world hotspots and inventory art */
(function(){
'use strict';
const rawArt={
plunger:'<path d="M64 17v78" stroke="#e1bc78" stroke-width="12" stroke-linecap="round"/><path d="M33 90q31-24 62 0l-10 13H43z" fill="#e04742" stroke="#892d2e" stroke-width="5"/><ellipse cx="64" cy="90" rx="24" ry="5" fill="#fa8d7a"/>',
bucket:'<path d="M29 47h70l-12 61H42z" fill="#8fb9c7" stroke="#334d58" stroke-width="5"/><ellipse cx="64" cy="47" rx="36" ry="10" fill="#d8e8e6" stroke="#466571" stroke-width="5"/><path d="M32 56q0-38 32-39t32 39" fill="none" stroke="#bbd5da" stroke-width="6"/><path d="M45 72h39" stroke="#e7f5e7" stroke-width="6"/>',
mop:'<path d="M75 17L56 83" stroke="#b77c49" stroke-width="12" stroke-linecap="round"/><path d="M49 80l-23 26m29-26l-13 30m20-26l1 27m6-27l15 23m-11-27l29 24" stroke="#c5c3b5" stroke-width="11" stroke-linecap="round"/><path d="M50 78l27 8" stroke="#6b8690" stroke-width="13"/>',
gloves:'<path d="M26 104L19 62q-5-9 5-11l11 14V30q1-12 12-6v27l7-12q8-7 11 1l-3 25 11-8q9-4 11 6L61 106z" fill="#73cb91" stroke="#2d725c" stroke-width="5"/><path d="M67 105l-4-26 23-37q8-7 13 2L89 73l16-11q8 0 7 11l-13 32z" fill="#a7e39b" stroke="#35715c" stroke-width="5"/>',
flashlight:'<g transform="rotate(-30 64 64)"><path d="M38 53h69v25H38z" fill="#313f47" stroke="#91a6a7" stroke-width="5"/><path d="M23 44l24 8v29l-24 8z" fill="#dae8c9" stroke="#afc6c1" stroke-width="6"/><circle cx="25" cy="66" r="16" fill="#fcf0a4"/><path d="M70 56v18" stroke="#e9a44b" stroke-width="6"/></g>',
cooler:'<path d="M17 43h94v67H17z" fill="#be2f37" stroke="#791a20" stroke-width="6"/><path d="M12 34h104v22H12z" fill="#f5eae0" stroke="#8497a0" stroke-width="6"/><rect x="51" y="57" width="27" height="28" rx="3" fill="#f2dfd1"/><path d="M64 60v22M54 71h21" stroke="#ad1f36" stroke-width="7"/><path d="M91 92q2-15 9-19" stroke="#64121a" stroke-width="5"/>',
lens:'<g transform="rotate(-20 64 64)"><rect x="19" y="39" width="89" height="53" rx="10" fill="#171e27" stroke="#76828f" stroke-width="6"/><path d="M38 41v50m18-50v50m19-50v50" stroke="#526572" stroke-width="7"/><ellipse cx="108" cy="65" rx="17" ry="30" fill="#0c1827" stroke="#80909c" stroke-width="7"/><ellipse cx="108" cy="65" rx="11" ry="22" fill="#28566a"/><ellipse cx="107" cy="65" rx="5" ry="12" fill="#122336"/><path d="M101 53l9 9" stroke="#a8e9de" stroke-width="4"/></g>',
powder:'<path d="M28 25h72l8 78H20z" fill="#d3e8e9" fill-opacity=".34" stroke="#accace" stroke-width="6"/><path d="M27 39h73" stroke="#ccdedb" stroke-width="6"/><path d="M31 91q13-32 25-21t14-10 22 27v11H32z" fill="#fbf7ed" stroke="#bcc7bf" stroke-width="3"/><path d="M45 49l30 7" stroke="#e1eaeb" stroke-width="4"/>',
bag:'<path d="M22 51h85l-7 58H28z" fill="#1b252c" stroke="#64727b" stroke-width="6"/><path d="M41 51V38q0-17 22-17t23 17v13" fill="none" stroke="#77858c" stroke-width="10"/><rect x="27" y="64" width="74" height="15" rx="4" fill="#36434e"/><rect x="58" y="60" width="13" height="17" fill="#bea56b"/>',
usb:'<g transform="rotate(-22 64 64)"><rect x="42" y="44" width="67" height="37" rx="7" fill="#1f3037" stroke="#799eaa" stroke-width="5"/><path d="M17 52h28v21H17z" fill="#b9bec1" stroke="#697780" stroke-width="4"/><path d="M26 54v11m10-11v11" stroke="#485c64" stroke-width="5"/><circle cx="96" cy="62" r="4" fill="#8dd3b0"/></g>',
tenEuro:'<path d="M15 36l96-13 9 70-96 13z" fill="#a5d3a5" stroke="#4b936c" stroke-width="6"/><ellipse cx="67" cy="65" rx="28" ry="23" fill="#cfe8ad" stroke="#62946f" stroke-width="5"/><text x="48" y="75" font-family="system-ui" font-size="28" font-weight="900" fill="#397458">10</text>',
camera:'<path d="M16 50h95v56H16z" fill="#1d2732" stroke="#879ba1" stroke-width="6"/><rect x="30" y="30" width="39" height="22" rx="4" fill="#202b32" stroke="#899da0" stroke-width="5"/><circle cx="68" cy="77" r="27" fill="#1a2d41" stroke="#778d98" stroke-width="6"/><circle cx="68" cy="77" r="18" fill="#1c7082" stroke="#101824" stroke-width="6"/><circle cx="63" cy="71" r="6" fill="#9ddbd2"/>',
coffee:'<path d="M25 44h63l-9 64H34z" fill="#dcc6aa" stroke="#91715d" stroke-width="5"/><path d="M83 57q37-2 28 21t-28 12" fill="none" stroke="#dfcab0" stroke-width="10"/><ellipse cx="56" cy="45" rx="33" ry="11" fill="#3e2c25" stroke="#e9ded0" stroke-width="5"/><path d="M42 32q-8-9 1-18m21 18q-7-9 1-18" fill="none" stroke="#ebe4d7" stroke-width="5" opacity=".8"/>',
donut:'<ellipse cx="64" cy="70" rx="45" ry="36" fill="#d3a062" stroke="#8d5c3c" stroke-width="6"/><ellipse cx="64" cy="65" rx="42" ry="30" fill="#e89ba6"/><ellipse cx="64" cy="69" rx="16" ry="14" fill="#1f2e35"/><path d="M30 61l11-6m34-16l7 8M95 75l-12 8M44 90l11-8" stroke="#fae6a6" stroke-width="5"/>',
scissors:'<path d="M44 79l64-57m-60 58L109 112" stroke="#cfd6da" stroke-width="8" stroke-linecap="round"/><circle cx="31" cy="89" r="17" stroke="#c4544f" stroke-width="9" fill="none"/><circle cx="59" cy="98" r="16" stroke="#c4544f" stroke-width="9" fill="none"/><circle cx="54" cy="79" r="5" fill="#d6c4a7"/>',
tape:'<ellipse cx="65" cy="69" rx="44" ry="40" fill="#555c62" stroke="#a4acb4" stroke-width="5"/><ellipse cx="65" cy="69" rx="23" ry="22" fill="#cfd6ca"/><ellipse cx="65" cy="69" rx="12" ry="12" fill="#1b282f"/><path d="M105 81l12 14-17 17-21-19" fill="#787e83" stroke="#c4d5ce" stroke-width="4"/>',
paper:'<path d="M31 28h71v83H31z" fill="#d8ddd7" stroke="#6c888e" stroke-width="4"/><path d="M21 17h71v83H21z" fill="#f6f0e5" stroke="#b0bdbe" stroke-width="4"/><path d="M34 39h46m-46 14h46m-46 14h30m-30 13h43" stroke="#aab6b6" stroke-width="5"/>',
medform:'<rect x="25" y="23" width="75" height="95" rx="5" fill="#f2ebdd" stroke="#6e8b88" stroke-width="5"/><rect x="46" y="15" width="34" height="16" rx="4" fill="#9eabb1"/><path d="M42 65h41M42 79h41M42 92h30" stroke="#9faeaa" stroke-width="4"/><path d="M58 37h12v20H58zM53 43h22v8H53z" fill="#ba3c4d"/>',
kidney:'<path d="M73 21q35 3 36 39 0 36-28 46-25 8-37-9-10-14 2-29 12-14 1-20Q31 33 50 24q10-7 23-3z" fill="#b73340" stroke="#65202c" stroke-width="7"/><path d="M76 32q20 15 17 32" stroke="#ed8590" stroke-width="9" stroke-linecap="round"/><path d="M47 70q23-18 37 2" stroke="#712431" stroke-width="6"/>',
scalpel:'<g transform="rotate(38 64 64)"><rect x="54" y="41" width="22" height="71" rx="5" fill="#a4bac3" stroke="#556c72" stroke-width="4"/><path d="M54 44l-12-29q24-6 34 26z" fill="#e7f0ec" stroke="#9eaaaa" stroke-width="4"/><path d="M59 74v31m12-31v31" stroke="#647d8d" stroke-width="3"/></g>',
mask:'<path d="M25 48q39-30 78 0l-9 41q-30 21-59 0z" fill="#e3e8e7" stroke="#93a8b1" stroke-width="6"/><path d="M25 55Q3 50 17 83M103 55q22-5 8 28" fill="none" stroke="#c4d2d6" stroke-width="6"/><path d="M45 56h38M45 70h38M45 83h30" stroke="#9fb8c3" stroke-width="5"/>',
crowbar:'<path d="M86 14q26 8 17 37l-16 16M88 20Q58 35 69 53l18 15-39 44" fill="none" stroke="#d04d4f" stroke-width="15" stroke-linecap="round"/><path d="M44 113l-20-6 14-9" fill="#c34a4b"/>',
gear:'<path d="M54 14h22l6 17 17-8 12 18-13 15 17 13-9 22-19-3-6 21H50l-6-21-18 3-10-22 17-13-13-15 12-18 18 8z" fill="#8a9ca1" stroke="#3f515b" stroke-width="6"/><circle cx="64" cy="63" r="24" fill="#283e43" stroke="#d5dcda" stroke-width="5"/>',
keyring:'<circle cx="51" cy="49" r="24" fill="none" stroke="#c9b277" stroke-width="10"/><g fill="#d6ba73" stroke="#6d654f" stroke-width="4"><path d="M62 65l31 37-11 10-11-14-10 2-9-15z"/><path d="M39 66L20 103l12 7 10-13 11 5 7-15z"/></g>',
phone:'<rect x="37" y="13" width="55" height="103" rx="10" fill="#1c2830" stroke="#728b9b" stroke-width="6"/><rect x="43" y="27" width="43" height="71" rx="2" fill="#355f72"/><circle cx="65" cy="108" r="4" fill="#d8d9d2"/><path d="M48 75l15-18 15 8" stroke="#b8dbd2" stroke-width="4" fill="none"/>',
dogbiscuit:'<path d="M25 41Q8 15 34 19q12 2 15 16l31 40q23-12 30 7 10 25-17 27-18 0-19-14L43 64Q20 71 14 59q-6-15 11-18z" fill="#c18c55" stroke="#795432" stroke-width="6"/><circle cx="40" cy="51" r="3" fill="#ffe8a9"/>',
light:'<rect x="20" y="15" width="88" height="60" rx="6" fill="#ffeab7" stroke="#657278" stroke-width="8"/><path d="M31 27h65M31 40h65M31 53h65" stroke="#d0b56c" stroke-width="4"/><path d="M65 78v36M65 97l-23 19M65 97l23 19" stroke="#c4c8c0" stroke-width="7"/>',
sdcard:'<path d="M39 19h39l16 18v72H33V27z" fill="#2b353b" stroke="#87999d" stroke-width="6"/><path d="M49 27v19m11-19v19m11-19v19m12-8v19" stroke="#d5b76c" stroke-width="6"/><path d="M42 78h42" stroke="#e3e6dd" stroke-width="7"/>',
clipboard:'<rect x="28" y="22" width="71" height="96" rx="5" fill="#bd9d6a" stroke="#655d4a" stroke-width="6"/><path d="M39 40h48v66H39z" fill="#f7efdd"/><rect x="50" y="14" width="29" height="21" rx="6" fill="#9aa8a5" stroke="#4b6269" stroke-width="4"/><path d="M47 53h32M47 66h32M47 79h23M47 90h32" stroke="#9faba6" stroke-width="4"/>',
warning:'<path d="M64 13l55 96H9z" fill="#ffca5e" stroke="#594937" stroke-width="8" stroke-linejoin="round"/><path d="M64 43v31" stroke="#3e3325" stroke-width="11" stroke-linecap="round"/><circle cx="64" cy="91" r="7" fill="#3e3325"/>'
};
const specs=[
 ['plunger','Ontstopper','storage',232,499,88,111,'take','De enige hoop op redding bij Coens wc-ramp.'],
 ['bucket','Emmer','storage',330,546,74,91,'take','Een emmer vol traumatische herinneringen.'],
 ['mop','Dweil','storage',744,453,80,116,'take','Wie heeft deze smerige teringzooi hier achtergelaten?'],
 ['gloves','Rubberen handschoenen','storage',444,498,87,95,'take','Voor als je ergens écht niet met je handen aan wilt.'],
 ['flashlight','Zaklamp','storage',153,343,80,91,'take','Perfect als de stroom uitvalt in de horrorvleugel.'],
 ['cooler','Rode koelbox','storage',686,542,123,105,'take','Voor een zeer duistere nierpuzzel.'],
 ['lens','Dure telelens','marthijn',582,386,125,111,'lens','Een peperdure lens. Deze ligt er nu écht zichtbaar.'],
 ['powder','Wit poeder','sem',326,550,99,102,'packet','Wie heeft in godsnaam wit poeder onder zijn stoel liggen?'],
 ['bag','Laptoptas','sem',134,576,115,105,'bag','Zonder tas kun je nauwelijks iets meenemen.'],
 ['usb','USB-stick','print',238,447,99,89,'usb','Dit is Marthijns ontbrekende bestand.'],
 ['tenEuro','Biljet van €10','restroom',825,550,86,69,'inspect','Coens beloofde tientje, na het ontstoppen.'],
 ['camera','Camerakit','cabinet',518,387,131,116,'camera','Dure camera achter een cijferslot.'],
 ['coffee','Koffiemok','breakroom',671,402,90,102,'coffee','Koffie, de echte brandstof van Cantique.'],
 ['donut','Donut','breakroom',464,475,84,77,'take','Iemand heeft weer zin in suiker.'],
 ['scissors','Schaar','print',117,479,85,85,'take','Knipwerk. Geen medische apparatuur, mafkees.'],
 ['tape','Gaffertape','print',607,468,97,87,'take','Met gaffer los je alles op, behalve Coens verstopte wc.'],
 ['paper','Kerkbodes','folding',618,431,94,89,'church','Blaadjes voor Jansje.'],
 ['medform','Donorformulier','folding',462,426,96,108,'donor','De vervloekte nierbon.'],
 ['kidney','Nier','cutting',391,543,104,85,'kidney','Het orgaan uit de horror-scène.'],
 ['scalpel','Horrormes','cutting',601,471,85,90,'take','Een fictief bloederig rekwisiet voor de slasher.'],
 ['mask','Operatiemasker','cutting',711,391,95,89,'take','Kantoormedewerkers zijn geen chirurgen.'],
 ['crowbar','Breekijzer','machine2',438,511,88,92,'take','Het apparaat maakt nu al teveel kabaal.'],
 ['gear','Tandwiel','machine2',641,504,87,90,'take','Geloof het of niet: dit hoort ergens in een machine.'],
 ['keyring','Sleutelbos','hall',394,465,86,95,'take','Zoveel deuren. Zoveel gezeik.'],
 ['phone','Telefoon','breakroom',314,391,77,100,'take','Dianne zit alweer op haar scherm.'],
 ['dogbiscuit','Hondenkoekje','borreoffice',196,516,85,83,'take','Voor Borre. Niet voor Sem, ook al heeft hij honger.'],
 ['light','LED-lamp','maarten',465,357,92,111,'take','Films maken in het donker is óók een concept.'],
 ['sdcard','SD-kaart','marthijn',372,499,74,82,'take','Er staan vast weer 400 shots van dezelfde koffiemok op.'],
 ['clipboard','Managementmap','managers',492,428,84,102,'take','Jarno kan hier gegarandeerd een vergadering over plannen.'],
 ['warning','Waarschuwingsbord','restroom',351,539,87,99,'inspect','GLADHEID. Verder geen enkele informatie over de rioolramp.']
];
if(specs.length!==30)throw new Error('V12 vereist exact 30 object sprites');
const url=art=> 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><defs><radialGradient id="shine"><stop stop-color="#ffe2b5" stop-opacity=".24"/><stop offset="1" stop-color="#ffe2b5" stop-opacity="0"/></radialGradient></defs><ellipse cx="64" cy="106" rx="55" ry="19" fill="#000" opacity=".27"/><circle cx="64" cy="65" r="60" fill="url(#shine)"/>'+art+'</svg>');
for(const [id,title,scene,x,y,w,h,mode,desc] of specs){
 const key='v12_'+id,src=url(rawArt[id]);imagePaths[key]=src;
 const im=new Image();im.decoding='async';im.src=src;images[key]=im;
 itemMeta[key]=[title,key,desc];
 // Existing canonical collectibles also receive genuine pictures in the inventory.
 if(id==='lens')itemMeta.lens=['Dure telelens',key,desc];
 if(id==='powder')itemMeta.packet=['Wit poeder',key,desc];
 if(id==='bag')itemMeta.bag=['Laptoptas',key,desc];
 if(id==='usb')itemMeta.usb=['USB-stick',key,desc];
 if(id==='coffee')itemMeta.coffee=['Koffie',key,desc];
 if(id==='camera')itemMeta.camera=['Camerakit',key,desc];
 if(id==='kidney')itemMeta.kidneyProp=['Nier',key,desc];
 const sc=scenes[scene];if(!sc)continue;
 const fn='v12Prop_'+id;
 sc.hot.push({id:'v12spr_'+id,label:title,rect:[x,y,w,h],at:[Math.min(865,Math.max(100,x+w/2)),Math.min(665,Math.max(440,y+h+24))],fn});
 actions[fn]=function(){
  if(mode==='lens')return actions.lens();
  if(mode==='packet')return actions.packet();
  if(mode==='bag')return actions.bag();
  if(mode==='usb')return actions.usb();
  if(mode==='camera')return actions.cabinetGear();
  if(mode==='coffee')return actions.coffee();
  if(mode==='church')return actions.jansie();
  if(mode==='donor')return actions.jansie();
  if(mode==='kidney'){
   if(flag('v12KidneyDone'))return narr('Dat is dus die smerige nier uit de slasherfilm. Dit slaat werkelijk NERGENS op.');return narr('Daar ligt nog geen nier. En misschien is dat maar beter ook.');
  }
  if(mode==='inspect')return narr(desc);
  if(flag('v12Found_'+id))return narr('Die '+title.toLowerCase()+' heb ik al in mijn zakken. Godverdomme, hoeveel past er in die tas?');
  s.flags['v12Found_'+id]=true;put(key);note(title+' gevonden in '+sc.name+'.');sound('done');toast(title+' meegenomen!');
  if(id==='plunger')note('Ga naar Coen op de heren-wc: gebruik de ontstopper en krijg €10.');
  if(id==='cooler')note('Rode koelbox gevonden. Ga naar Jansje en daarna naar de grote snijtafel.');
 };
}
function visible(id){
 if(id==='bag')return !flag('bag');
 if(id==='powder')return !flag('packetPicked')&&!flag('packetHanded');
 if(id==='lens')return !flag('lensTaken');
 if(id==='usb')return !flag('usbPicked')&&!flag('usbDone');
 if(id==='camera')return flag('cabinetOpen')&&!flag('cameraTaken');
 if(id==='coffee')return true;
 if(id==='kidney')return flag('v12KidneyDone');
 if(id==='tenEuro')return flag('v12ToiletDone');
 if(id==='warning')return true;
 return !flag('v12Found_'+id);
}
const originalWorld=drawWorld;
drawWorld=function(t){
 originalWorld(t);
 const current=s.scene;
 ctx.save();
 for(const [id,title,scene,x,y,w,h] of specs){
  if(scene!==current||!visible(id))continue;
  const im=images['v12_'+id];if(!im||!im.complete||!im.naturalWidth)continue;
  const bounce=(id==='lens'||id==='plunger'||id==='powder')?Math.sin((t||0)/370)*2:0;
  const highlight=['plunger','lens','powder','cooler','kidney'].includes(id);
  if(highlight){ctx.save();ctx.shadowColor='#f2d38c';ctx.shadowBlur=14+Math.sin((t||0)/480)*4;ctx.globalAlpha=.95;ctx.drawImage(im,x,y+bounce,w,h);ctx.restore();}
  else ctx.drawImage(im,x,y+bounce,w,h);
 }
 ctx.restore();
};
const beforeHot=hotspotFound;
hotspotFound=function(x,y){
 // Object sprites get first priority when clicked, even on a touch device.
 const hits=(scenes[s.scene]?.hot||[]).filter(h=>h.id.startsWith('v12spr_'));
 for(let i=hits.length-1;i>=0;i--){const r=hits[i].rect,id=hits[i].id.slice(7);if(visible(id)&&x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3])return hits[i];}
 return beforeHot(x,y);
};
const oldDrawInventory=drawInventory;
drawInventory=function(){oldDrawInventory();const inv=$('inventory');inv?.querySelectorAll('img').forEach(el=>{el.loading='eager';el.style.objectFit='contain'})};
const oldTasksFn=refreshSide;
refreshSide=function(){
 oldTasksFn();
 if(tab==='tasks'){
  const list=[['Red Coen van zijn verstopte wc (+€10)','v12ToiletDone'],['Vind de ontstopper in opslag','v12Found_plunger'],['Ontdek het witte poeder','packetPicked'],['Vind de dure telelens','lensTaken'],['Krijg een rode koelbox','v12Found_cooler'],['Overleef de slasher rond de nier','v12KidneyDone']];
  const container=$('sideContent');const head=document.createElement('div');head.innerHTML='<h2 style="margin-top:15px;color:#eaa08d">V12 • KANTOORHORROR</h2>';container.append(head);
  for(const [title,fl] of list){const line=document.createElement('div');line.className='task'+(flag(fl)?' done':'');line.innerHTML='<i>'+(flag(fl)?'✓':'○')+'</i><span>'+title+'</span>';container.append(line);}
 }
};
if(window.CANTIQUE_V12){
 window.CANTIQUE_V12.sprites=specs.map(([id,name,scene])=>({id,name,scene}));
 window.CANTIQUE_V12.spriteCount=specs.length;
 window.CANTIQUE_V12.check=()=>({count:specs.length,missing:specs.filter(v=>!images['v12_'+v[0]]).map(v=>v[0]),toilet:!!scenes.restroom,storage:!!scenes.storage});
}
console.info('Cantique V12 objects installed:',specs.length,'separate visible sprite drawings');
})();