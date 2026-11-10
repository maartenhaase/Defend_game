/* CANTIQUE V12 — intern horror-avontuur. Fictieve scènes, geen feitelijke gebeurtenissen. */
(function(){
'use strict';
const V12={version:'12.0',graph:{
 outside:['reception'],
 reception:['outside','office'],
 office:['reception','sem','managers','borreoffice','hall','print'],
 sem:['office'],
 managers:['office','jarno_sanne','meeting'],
 jarno_sanne:['managers','machine2'],
 meeting:['managers','hall'],
 borreoffice:['office','folding'],
 hall:['office','meeting','breakroom','restroom','storage','marthijn','maarten','print'],
 breakroom:['hall','folding'],
 restroom:['hall'],
 storage:['hall','print'],
 marthijn:['hall'],
 maarten:['hall','cabinet'],
 cabinet:['maarten'],
 print:['hall','office','storage','machine2'],
 machine2:['print','jarno_sanne','cutting'],
 cutting:['machine2','folding'],
 folding:['cutting','breakroom','borreoffice']
},zones:[
 ['Entree en ontvangst',['outside','reception']],
 ['Kantoren en redactie',['office','sem','managers','jarno_sanne','borreoffice']],
 ['Centrale gang',['hall','maarten','cabinet','marthijn','meeting','breakroom','restroom']],
 ['Drukkerij en opslag',['print','storage','machine2','cutting','folding']]
]};
window.CANTIQUE_V12=V12;
const graph=V12.graph;
const svgData=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
function putBg(id,svg){const key='bg_'+id;const url=svgData(svg);imagePaths[key]=url;const im=new Image();im.decoding='async';im.src=url;images[key]=im;}
const restroomSVG='<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720"><defs><linearGradient id="wall" x2="1" y2="1"><stop stop-color="#697b7a"/><stop offset="1" stop-color="#c1cbc5"/></linearGradient><linearGradient id="floor" x2="0" y2="1"><stop stop-color="#53625f"/><stop offset="1" stop-color="#23302f"/></linearGradient><linearGradient id="stall" x2="1" y2="1"><stop stop-color="#224548"/><stop offset="1" stop-color="#152b30"/></linearGradient><radialGradient id="glow"><stop stop-color="#bff2bb" stop-opacity=".36"/><stop offset="1" stop-color="#00100c" stop-opacity="0"/></radialGradient></defs><rect width="960" height="720" fill="url(#wall)"/><path d="M0 425L960 425 960 720 0 720Z" fill="url(#floor)"/><g stroke="#34494a" stroke-opacity=".31" stroke-width="3"><path d="M0 95H960M0 190H960M0 285H960M0 380H960M110 0V425M230 0V425M350 0V425M470 0V425M590 0V425M710 0V425M830 0V425"/></g><path d="M0 510L960 490M0 605L960 587M160 430L80 720M360 425L340 720M650 425L720 720M870 425L960 720" stroke="#92a8a0" stroke-opacity=".2" stroke-width="3"/><rect x="40" y="115" width="238" height="368" rx="5" fill="#253334" stroke="#aebcba" stroke-width="11"/><rect x="61" y="142" width="195" height="320" fill="#354747"/><rect x="166" y="332" width="26" height="95" rx="9" fill="#1c292b"/><rect x="304" y="258" width="214" height="198" rx="15" fill="#d5e2d9" stroke="#718988" stroke-width="10"/><rect x="331" y="273" width="161" height="154" rx="11" fill="#253f42"/><path d="M311 463H519L560 560H270Z" fill="#e9eee5"/><ellipse cx="415" cy="548" rx="155" ry="27" fill="#778a84" opacity=".65"/><rect x="342" y="460" width="148" height="86" rx="15" fill="#e7ebe1"/><rect x="564" y="119" width="362" height="380" rx="12" fill="url(#stall)" stroke="#b0bfbb" stroke-width="9"/><path d="M564 470H925" stroke="#526b69" stroke-width="16"/><rect x="674" y="354" width="144" height="173" rx="25" fill="#d5ded6" stroke="#9aa9a4" stroke-width="8"/><ellipse cx="744" cy="455" rx="99" ry="47" fill="#dae1d8"/><ellipse cx="744" cy="450" rx="73" ry="27" fill="#243a38"/><ellipse cx="749" cy="457" rx="62" ry="16" fill="#4c6540"/><path d="M700 456q25 -20 42 0t38 -9" fill="none" stroke="#8caa50" stroke-width="9"/><rect x="681" y="516" width="138" height="78" rx="10" fill="#d8dfd8"/><path d="M665 584L842 584" stroke="#acb9b0" stroke-width="11"/><g fill="#c7d1c6"><rect x="810" y="185" width="50" height="38" rx="8"/><path d="M817 230h37l-6 64h-25z"/></g><g fill="#d2b48b" opacity=".26"><circle cx="663" cy="310" r="5"/><circle cx="873" cy="330" r="7"/><circle cx="824" cy="285" r="4"/></g><ellipse cx="740" cy="440" rx="215" ry="180" fill="url(#glow)"/><rect x="0" y="0" width="960" height="720" fill="#060d11" opacity=".13"/><text x="68" y="95" font-family="system-ui,sans-serif" font-size="29" font-weight="800" fill="#eaf2e9" opacity=".92">HEREN • CANTIQUE</text><text x="585" y="75" font-family="system-ui,sans-serif" font-size="19" fill="#f5e8c7" opacity=".85">NIET DOORTREKKEN!</text></svg>';
const storageSVG='<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720"><defs><linearGradient id="a" x2="0" y2="1"><stop stop-color="#495b59"/><stop offset="1" stop-color="#101f25"/></linearGradient></defs><rect width="960" height="720" fill="url(#a)"/><path d="M0 480L960 480V720H0" fill="#26383a"/><g stroke="#758784" stroke-width="12" fill="#303d3f"><rect x="90" y="115" width="290" height="420"/><rect x="590" y="95" width="290" height="440"/></g><g fill="#89928c" stroke="#233a3e" stroke-width="8"><rect x="115" y="205" width="240" height="20"/><rect x="115" y="338" width="240" height="20"/><rect x="615" y="205" width="240" height="20"/><rect x="615" y="338" width="240" height="20"/></g><g fill="#c4a776" stroke="#6c614c" stroke-width="6"><rect x="120" y="231" width="114" height="106"/><rect x="234" y="255" width="98" height="80"/><rect x="630" y="231" width="94" height="106"/><rect x="733" y="231" width="111" height="106"/><rect x="635" y="367" width="197" height="135"/></g><rect x="441" y="135" width="85" height="360" fill="#18262a" stroke="#98a39b" stroke-width="8"/><circle cx="509" cy="322" r="6" fill="#f4d7a3"/><path d="M0 610H960M210 480L120 720M540 480L570 720M840 480L930 720" stroke="#789088" stroke-width="4" opacity=".35"/><text x="68" y="85" fill="#e4e9d9" font-size="34" font-weight="bold" font-family="system-ui,sans-serif">SCHOONMAAK &amp; OPSLAG</text><text x="600" y="603" fill="#d7c18b" opacity=".8" font-family="system-ui,sans-serif" font-size="18">Vloer vrijhouden • BHV</text></svg>';
putBg('restroom',restroomSVG);putBg('storage',storageSVG);
const enter=(id,label,rect,at)=>({id:'v12door_'+id,label,door:id,rect,at});
scenes.restroom={name:'Heren-wc • plaats delict',sub:'Coen heeft de complete riolering gegijzeld',bg:'restroom',spawn:[310,637],floor:[[40,710],[920,710],[880,495],[580,430],[278,460],[90,550]],hot:[
 enter('hall','Terug naar de gang',[20,115,245,380],[275,552]),
 {id:'v12coen',label:'Coen op de verstopte pot',rect:[590,170,310,415],at:[588,618],fn:'v12Coen'},
 {id:'v12flush',label:'De hopeloos verstopte wc',rect:[640,410,225,185],at:[604,602],fn:'v12Flush'},
 {id:'v12mirror',label:'De beslagen spiegel',rect:[305,234,220,225],at:[405,569],fn:'v12Mirror'}
]};
scenes.storage={name:'Schoonmaakkast & opslag',sub:'Hier worden lijken… eh, dweilen opgeborgen',bg:'storage',spawn:[480,641],floor:[[0,710],[960,710],[906,482],[730,442],[273,442],[65,488]],hot:[
 enter('hall','Terug naar de centrale gang',[422,133,120,365],[494,568]),
 enter('print','Deur naar de drukkerij',[810,215,136,265],[791,557]),
 {id:'v12storeNote',label:'Een briefje op de stelling',rect:[225,295,155,111],at:[410,573],fn:'v12StorageNote'}
]};
for(const [id,conns] of Object.entries(graph)){
 const scene=scenes[id];if(!scene)continue;
 scene.hot=scene.hot.filter(h=>!h.door||conns.includes(h.door));
 scene.hot=scene.hot.filter(h=>h.id!=='staff_coen'&&h.id!=='v4npc_coen');
}
for(const sc of ['reception','sem'])if(scenes[sc]?.npcs)scenes[sc].npcs=scenes[sc].npcs.filter(n=>n.id!=='coen');
function tag(str){return String(str).replace(/[&<>]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[x]));}
function setCoenPortrait(){
 const previous=portrait;
 portrait=function(id){if(id==='Coen')return imagePaths['portrait_coen_vos'];return previous(id);};
}
setCoenPortrait();
const oldDraw=drawWorld;
drawWorld=function(t){
 oldDraw(t);
 if(s.scene==='restroom'){
  const now=t||0;
  ctx.save();
  ctx.fillStyle='#242c32';ctx.beginPath();ctx.ellipse(749,355,100,145,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#40565c';ctx.fillRect(657,404,183,120);
  const coen=images['portrait_coen_vos']||images['staff_coen_vos'];
  if(coen?.complete&&coen.naturalWidth){
   ctx.save();ctx.beginPath();ctx.ellipse(748,270,89,96,0,0,Math.PI*2);ctx.clip();ctx.drawImage(coen,647,168,200,208);ctx.restore();
  }
  ctx.fillStyle='#b2c4a9';ctx.font='bold 20px system-ui';ctx.fillText(flag('v12ToiletDone')?'Schoon. Ongelooflijk.':'SOS • Coen!',615,155);
  if(!flag('v12ToiletDone')){
   for(let i=0;i<7;i++){const x=677+i*24+Math.sin(now/850+i)*8,y=471+Math.sin(now/750+i)*8;ctx.beginPath();ctx.arc(x,y,3+i%3,0,Math.PI*2);ctx.fillStyle='#b2cb66a0';ctx.fill();}
  }
  ctx.restore();
 }
};
function completeToilet(){
 if(flag('v12ToiletDone'))return;
 s.flags.v12ToiletDone=true;money(10);stress(-8);note('Coen zat vast op de wc. Met de ontstopper is de ramp voorbij: +€10.');achieve('Rioolredder van Cantique');syncUI();
 say('Coen','WE LEVEN NOG! Jezus, wat een opluchting. Tien euro voor je, Sem. En vertel alsjeblieft NIEMAND hoeveel ik hier heb liggen kleien.',[{t:'Mijn geheim heeft een prijs, Coen.',f:closeDialog},{t:'Koop voortaan meer vezels, mafkees.',f:closeDialog}],'Helden van de sanitairdienst');
}
function plungerGame(){
 closeDialog();modal='v12plunger';const el=$('minigame');el.hidden=false;let n=0;
 function redraw(){el.innerHTML='<div style="max-width:450px"><h3 style="color:#e8ba8c">OPERATIE DROL</h3><p>Coen heeft zo hard zitten schijten dat de wc bijna een zelfstandig ecosysteem is. Pomp de boel los!</p><div style="font-size:36px;margin:12px" id="toiletMood">'+(n?'🪠'.repeat(Math.min(4,n)):'🚽💩')+'</div><div style="background:#293c3f;border-radius:9px;height:20px;overflow:hidden"><div style="width:'+(n*25)+'%;height:100%;background:#8bc6a0"></div></div><p>'+(n<3?'Nog '+(4-n)+' keer pompen, verdomme.':'Nog één klap en dat monster is weg.')+'</p><button class="primary" id="plunge">🪠 ONTSTOPPEN!</button><button class="secondary" id="plungeExit">Ik geef het op</button></div>';
 el.querySelector('#plunge').onclick=()=>{n++;sound('tap');if(n>=4){closeMini();completeToilet()}else redraw();};
 el.querySelector('#plungeExit').onclick=closeMini;}
 redraw();
}
actions.v12Coen=function(){
 if(flag('v12ToiletDone')){say('Coen','Ik blijf hier nog even zitten. Niet voor de drol. Voor de emotionele verwerking.',[{t:'Veel sterkte, rioolkoning.',f:closeDialog}]);return;}
 if(!has('v12_plunger')){say('Coen','SEM! HELP! Ik heb hier zó gigantisch zitten schijten dat de plee verstopt is. Ik sta letterlijk oog in oog met mijn eigen mislukking. Zoek als de bliksem een ONTSTOPPER. Ik geef je een tientje!',[{t:'Waar ligt die verdomde ontstopper?',f:()=>say('Coen','In de SCHOONMAAKKAST aan de gang, denk ik. En schiet op, ik kan hier niet eeuwig wonen.',[{t:'Ik ga!',f:closeDialog}])},{t:'Dit is wel echt smerig, Coen.',f:closeDialog}],'Heren-wc, crisissituatie');return;}
 say('Coen','Je hebt een ontstopper! SEM, MIJN HELD. Die pot lijkt een oorlogsgebied. Krijg dat rioolbeest er alsjeblieft uit.',[{t:'🪠 Ik fix die ellende',f:plungerGame},{t:'Ik wil eerst mijn leven overdenken.',f:closeDialog}]);
};
actions.v12Flush=()=>actions.v12Coen();
actions.v12Mirror=()=>narr('In de spiegel staat in de condens: "COEN WAS HIER". Dat is geen boodschap. Dat is een biologische dreiging.');
actions.v12StorageNote=()=>narr('Schoonmaakrooster: "Ontstopper bij het rode emmertje. Vooral na Coens burrito-donderdag." Je wilt bijna ontslag nemen.');
const previousPacket=actions.packet;
actions.packet=function(){
 if(flag('packetPicked')||flag('packetHanded')){narr('Het mysterieuze witte poeder is al weggehaald.');return}
 say('Sem','Wacht even. Onder mijn bureaustoel ligt een zakje WIT POEDER. Dat kan een fokking spannende middag worden. Of het is gewoon poedersuiker van Jansjes oliebollen.',[
 {t:'In de tas stoppen en onderzoeken',f:()=>{closeDialog();s.flags.packetPicked=true;put('packet');note('Het witte poeder is meegenomen. Niemand weet wat erin zit.');}},
 {t:'Als een drugsbaron poseren',f:()=>{closeDialog();heat(18);stress(12);note('Sem deed verdacht met een zakje poeder. Iedereen keek. Heel stom.');toast('Je staat als een malloot met dat zakje te zwaaien. Argwaan +18.');}},
 {t:'Dat spul laat ik liggen',f:closeDialog}
 ]);
};
const oldPacketChoice=packetChoice;
packetChoice=function(){
 say('Sem','Het witte poeder. Sniff-test? Nee, godverdomme. We kunnen ook gewoon vragen wat het is.',[
 {t:'Laat het controleren bij Jansje',f:()=>{closeDialog();s.flags.v12PowderChecked=true;note('Jansje bevestigt: het is poedersuiker. Ongelooflijk anticlimactisch.');say('Jansje','Jongen toch. POEDERSUIKER. Van mijn oliebollen. Jullie spelen hier wel héél rare spelletjes.',[{t:'Dat scheelt een politie-inval.',f:closeDialog}]);}},
 {t:'Afgeven bij de balie',f:()=>{closeDialog();toast('Loop naar Sanne bij de receptie.');}},
 {t:'Hou maar in je tas',f:closeDialog}
 ]);
};
itemMeta.packet=['Wit poeder','v12_powder','Verdacht zakje. Poedersuiker of iets veel ergers?'];
const originalKidney=actions.kidneyPlan;
function kidneyScene(){
 closeDialog();modal='v12slasher';let step=0;
 const lines=[
 ['SCÈNE I • DE SNIJTAFEL','Het TL-licht knippert. De machine slaat vast. Sem ligt op de papiersnijtafel. In de hoek staat een gemaskerde gestalte met een rode koelbox.'],
 ['SCÈNE II • NIET DE PAPIERSNIJDER!','"GODVERDOMME, IK KWAM HIER ALLEEN MAAR GELD VERDIENEN!" Een onheilspellende schaduw buigt over Sem heen. De lichten doven.'],
 ['SCÈNE III • SPLATTER','Een vlammend rode flits. De camera draait weg; overal spat theatraal horrorbloed. De gemaskerde figuur houdt triomfantelijk een NIERVORMIG ORGAAN omhoog.'],
 ['SCÈNE IV • KANTOORLOGICA','Sem schiet overeind. "MIJN FOKKING NIER!" Johanneke: "KUNNEN WE NU EINDELIJK WEER PAPIER SNIJDEN?!" Het orgaan belandt in de koelbox.'],
 ['SCÈNE V • DE AFLOOP','De nier ligt veilig opgeborgen. Sem is in deze gestoorde slasherwereld op onverklaarbare wijze nog overeind. Jansje krijgt hulp buiten dit krankzinnige kantoor.']
 ];
 function stepRender(){
  const el=$('minigame');el.hidden=false;
  const [headline,line]=lines[step];
  el.innerHTML='<div class="v12Horror"><div class="v12Scream">'+(step===2?'🩸':'🔪')+'</div><small>FICTIONELE KANTOORSLASHER</small><h3>'+headline+'</h3><p>'+line+'</p><button class="primary" id="v12Next">'+(step===lines.length-1?'NAAR HET KANTOOR':'VERDER · '+(step+1)+'/5')+'</button></div>';
  el.querySelector('#v12Next').onclick=()=>{
   if(++step>=lines.length){closeMini();s.flags.kidneyLost=true;s.flags.v12KidneyDone=true;put('v12_kidney');stress(28);heat(12);note('In de slasherfilm is Sem zijn nier kwijtgeraakt. Een afschuwelijk, fictief kantoordrama.');achieve('Kantoor-Slasher overleefd');travel('cutting');say('Sem','Ik ben m’n NIER kwijt. De machine is stuk. Jarno wil een evaluatie. En Coen zit nog op de pot. WAT EEN KUTDAG.',[{t:'Zoek een normaal bedrijf.',f:closeDialog}]);}
   else{sound('wrong');stepRender();}
  };
 }
 stepRender();
}
actions.kidneyPlan=function(){
 if(flag('v12KidneyDone')){say('Sem','Hier werd mijn nier uit mijn donder gehaald in een kantoor-slasherscène. En het ergste? Geen enkele manager heeft er een ticket voor aangemaakt.',[{t:'Doorlopen.',f:closeDialog}]);return;}
 const intro='Johanneke heeft de snijtafel afgedekt. Er hangt een gruwelijke sfeer. Dit is geen echte medische ingreep: het is een gestoorde fictieve HORRORSCÈNE.';
 const choices=[];
 if(!flag('donorPledge'))choices.push({t:'Eerst bij Jansje het verhaal horen',f:()=>{closeDialog();note('Praat met Jansje in de vouwhoek over het donorverhaal.');travel('folding');}});
 if(!has('v12_cooler'))choices.push({t:'Zoek de koelbox in opslag',f:()=>{closeDialog();note('De rode koelbox ligt in de schoonmaakopslag.');travel('storage');}});
 if(flag('donorPledge')&&has('v12_cooler'))choices.push({t:'Start de brute slasher-cutscene',f:kidneyScene});
 else choices.push({t:'Nu toch beginnen?',f:()=>narr('Eerst Jansjes absurdistische plan horen en de rode koelbox ophalen. Dan is de horrorpuzzel compleet.')});
 choices.push({t:'Nee, ik wil mijn nier nog even houden',f:closeDialog});
 say('Sem',intro,choices,'Drukkerij • Horrorhoofdstuk');
};
const oldBorre=actions.borre;
actions.borre=function(){
 if(flag('v12KidneyDone')){say('Sem','Borre snuffelt aan de koelbox. Zelfs de hond denkt: "Wat de TERING doen jullie hier?"', [{t:'Borre, blijf van die nier af!',f:()=>{closeDialog();achieve('Nier gered van Borre');}}]);return;}
 oldBorre();
};
const originalIntro=document.querySelector('#splash .eyebrow');
if(originalIntro)originalIntro.textContent='Intern Cantique avontuur · HORROR-CUT';
const splashTitle=document.querySelector('#splash h1');
if(splashTitle)splashTitle.innerHTML='SEM.<br><span>Een bloedlinke kantoordag.</span>';
const info=document.querySelector('#splash p');
if(info)info.textContent='Denk aan een verknipte 90s point-and-click: verdwenen lenzen, wit poeder, Coens verstopte wc, en een totaal fictieve slasher rond een nier. Alle collega’s zijn karikaturen, niet de echte mensen of gebeurtenissen.';
const style=document.createElement('style');style.textContent='.v12Horror{max-width:540px;padding:24px;border:2px solid #9b232b;border-radius:18px;background:radial-gradient(circle at 30% 5%,#5e1923,#120f14 70%);box-shadow:0 0 35px #c1302244;text-align:center}.v12Horror h3{color:#ef8b79;font-weight:1000;font-size:26px}.v12Horror p{line-height:1.65;font-size:16px}.v12Scream{font-size:60px;filter:drop-shadow(0 5px 15px #f003);animation:v12beat .7s infinite alternate}@keyframes v12beat{to{transform:scale(1.12)}}.v12-nav{margin:8px auto 4px;max-width:1480px;padding:8px;border:1px solid #596768;border-radius:11px;background:#162127}.v12-nav header{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:7px}.v12-nav header strong{font-size:12px;color:#f0d184}.v12-nav button{border:1px solid #d2c39b6a;background:#344043;border-radius:8px;font-size:12px;padding:8px 10px;min-height:39px}.v12-nav-doors{display:flex;gap:6px;flex-wrap:wrap}.v12-map-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v12-map-grid button{border:1px solid #a8b3ae88;background:#263436;padding:9px;text-align:left;border-radius:8px}.v12-map-grid button.current{border-color:#f0d184;background:#574c36}.v12-map-grid button:disabled{opacity:.3}@media(max-width:600px){.v12-nav{margin:5px 2px;padding:6px}.v12-nav-doors{flex-wrap:nowrap;overflow-x:auto}.v12-nav button{font-size:11px;white-space:nowrap}.v12-map-grid{grid-template-columns:1fr}.v12Horror{padding:12px}.v12Horror h3{font-size:19px}.v12Horror p{font-size:13px}}';
document.head.append(style);
const nav=document.createElement('section');nav.className='v12-nav';nav.setAttribute('aria-label','Aangrenzende ruimtes');const target=document.querySelector('.touchTools')||document.querySelector('.bottom');target.parentNode.insertBefore(nav,target);
function mapView(){
 const el=$('minigame');modal='v12map';el.hidden=false;
 let html='<div style="max-width:710px"><h3>Schematische plattegrond • Cantique</h3><p>Op basis van de aangeleverde ruimtes en foto’s. Niet opgemeten: de verbindingen zijn logisch gemaakt voor het avontuur. Je kunt alleen naar naastgelegen ruimtes.</p>';
 for(const [zone,ids] of V12.zones){html+='<h4 style="color:#e9cc95;margin:10px 0 5px">'+tag(zone)+'</h4><div class="v12-map-grid">';for(const id of ids){if(!scenes[id])continue;const active=id===s.scene,adj=(graph[s.scene]||[]).includes(id),allowed=active||adj;html+='<button data-v12room="'+id+'" class="'+(active?'current':'')+'" '+(allowed?'':'disabled')+'>'+(active?'● ':'')+tag(scenes[id].name)+(adj?' ⇢':'')+'</button>'}html+='</div>'}
 html+='<button class="secondary" id="v12mapClose" style="margin-top:12px">Terug naar het spel</button></div>';el.innerHTML=html;
 el.querySelector('#v12mapClose').onclick=closeMini;
 el.querySelectorAll('[data-v12room]').forEach(button=>button.onclick=()=>{if(button.dataset.v12room===s.scene){closeMini();return;}if((graph[s.scene]||[]).includes(button.dataset.v12room)){closeMini();travel(button.dataset.v12room);}});
}
function navRender(){
 if(!scenes[s.scene])return;
 nav.innerHTML='<header><strong>🚪 VANUIT '+tag(scenes[s.scene].name.toUpperCase())+'</strong><button type="button" id="v12mapOpen">Plattegrond 🗺</button></header><div class="v12-nav-doors"></div>';
 nav.querySelector('#v12mapOpen').onclick=mapView;
 const doors=nav.querySelector('.v12-nav-doors');for(const id of graph[s.scene]||[]){if(!scenes[id])continue;const b=document.createElement('button');b.textContent='➜ '+scenes[id].name;b.onclick=()=>{if(!started){toast('Start eerst het spel.');return;}if(dlg||modal){toast('Sluit eerst het gesprek.');return;}travel(id);};doors.append(b);}
}
const oldRefresh=refreshSide;
refreshSide=function(){
 oldRefresh();
 if(tab==='map'){
 const el=$('sideContent');
 el.insertAdjacentHTML('afterbegin','<p style="color:#e2cc95">Plattegrond: klik alleen op direct aangrenzende kamers. De gang verbindt kantoren, wc en opslag.</p>');
 el.querySelectorAll('[data-scene]').forEach(b=>{
  const id=b.dataset.scene,allowed=id===s.scene||(graph[s.scene]||[]).includes(id);
  b.disabled=!allowed;b.onclick=()=>{if(allowed&&started&&!dlg&&!modal)travel(id)};
 });
 }
};
const oldSync=syncUI;
syncUI=function(){oldSync();navRender()};
navRender();
window.CANTIQUE_V12.map=mapView;window.CANTIQUE_V12.qa=()=>({scene:s.scene,connected:graph[s.scene],toiletDone:flag('v12ToiletDone'),kidneyDone:flag('v12KidneyDone'),items:s.inv.length});
})();