/* SEM IN CANTIQUE V13 — sciencefiction quest engine. In-world events are fiction. */
(function(){
'use strict';
const V=window.CANTIQUE_V13={version:'13.1',items:[],gatherNames:['Maarten','Carmen','Sanne','Jarno','Erik','Marloes','Johanneke','Fenneke','Coen'],known:{}};
const F=k=>!!s.flags['v13_'+k], S=(k,val=true)=>{s.flags['v13_'+k]=val;save();return val};
const clean=raw=>String(raw||'').replace(/\b(godverdomme|verdomme|godsamme|tering|fokking|fucking|kut|shit|jezus)\b/gi,'verdorie').replace(/\b(achterlijke idioot|mafkees)\b/gi,'vreemde snuiter');
const prevSay=say;
say=function(who,words,opts=[],role){return prevSay(who,clean(words),(opts||[]).map(o=>({...o,t:clean(o.t)})),role);};
const done=(k,n,msg)=>{
 if(F(k))return false;S(k);if(n)money(n);
 note(msg+(n?' (+€'+n+')':''));syncUI();return true;
};
const talk=(who,text,choices,role)=>say(who,text,[...(choices||[]),{t:'Ik ga verder',f:closeDialog}],role||'Cantique');
const reply=(who,text)=>say(who,text,[{t:'Prima',f:closeDialog}]);
const take=(id,txt)=>{if(has(id)){toast('Dit heb je al.');return false;}put(id);if(txt)note(txt);sound('tap');syncUI();return true;};
const give=(id)=>{if(has(id)){remove(id);return true;}return false;};
const item=(id,name,desc,scene,x,y,w=80,h=74,needs='')=>{
 itemMeta[id]=[name,'v13art_'+id,desc];
 V.items.push({id,name,scene,x,y,w,h,needs});
 if(scene&&scenes[scene]){
  scenes[scene].hot.push({id:'v13_item_'+id,label:name,rect:[x,y,w,h],at:[Math.max(70,Math.min(900,x+w/2)),Math.max(500,Math.min(665,y+h+30))],fn:'v13Pickup',v13Item:id});
 }
};
const beforeActions={};
const wrap=(name,fun)=>{const old=actions[name];beforeActions[name]=old;actions[name]=function(h){return fun(old,h)};};
const glyph=(s)=>String(s||'');
function panel(title,desc,options){
 closeDialog();modal='v13game';const box=$('minigame');box.hidden=false;
 box.innerHTML='<div class="v13panel"><h3>'+escapeHtml(title)+'</h3><p>'+escapeHtml(desc)+'</p><div class="v13options"></div><button class="secondary v13exit">Stoppen</button></div>';
 box.querySelector('.v13exit').onclick=closeMini;
 const holder=box.querySelector('.v13options');options.forEach(o=>{const b=document.createElement('button');b.className='primary';b.textContent=o[0];b.onclick=()=>o[1]();holder.append(b)});
}
function quiz(title,questions,finish){
 let step=0;
 function show(){const q=questions[step];panel(title,'Vraag '+(step+1)+' / '+questions.length+' — '+q[0],q[1].map((answer,i)=>[answer,()=>{
 if(i===q[2]){if(++step>=questions.length){closeMini();finish();}else show();}
 else{sound('wrong');toast('Niet helemaal. Probeer opnieuw.');}
 }]));}
 show();
}
function sequence(title,frames,onEnd){
 closeDialog();modal='v13cut';const box=$('minigame');box.hidden=false;let step=0;
 const render=()=>{const f=frames[step];box.innerHTML='<div class="v13cinema"><div class="v13cinema-stage" data-step="'+step+'"><span class="v13beam"></span><span class="v13orb"></span><span class="v13dog"></span><span class="v13spark a"></span><span class="v13spark b"></span></div><small>SEM IN CANTIQUE · SCIENCEFICTION</small><h3>'+escapeHtml(title)+'</h3><p>'+escapeHtml(f)+'</p><button class="primary v13next">'+(step===frames.length-1?'Afronden':'Verder · '+(step+1)+'/'+frames.length)+'</button></div>';box.querySelector('.v13next').onclick=()=>{if(++step===frames.length){closeMini();onEnd?.();}else render()};};
 render();
}
V.sequence=sequence;V.quiz=quiz;
V.isKnown=F;V.setKnown=S;V.done=done;
V.isVisible=(it)=>{
 if(it.needs&&!F(it.needs))return false;
 if(has(it.id))return false;
 if(F('picked_'+it.id))return false;
 if(it.id==='v13_chewed'&&(!F('chocGiven')||F('kidneyRetrieved')))return false;
 if(it.id==='v13_yellow'&&!F('finalBeam'))return false;
 if(it.id==='v13_clean'&&!F('kidneyClean'))return false;
 if(it.id==='v13_plunger'&&F('toiletDone'))return false;
 return true;
};
actions.v13Pickup=h=>{
 const id=h?.v13Item,it=V.items.find(x=>x.id===id);
 if(!it||!V.isVisible(it)){toast('Hier ligt niets meer.');return;}
 if(id==='v13_chewed'&&!F('chocGiven')){reply('Sem','Marloes wil eerst rust.');return;}
 S('picked_'+id);
 if(id==='v13_chewed'){S('kidneyRetrieved');take('v13_damaged','Borre heeft de energienier beschadigd. Hij moet worden hersteld.');return;}
 take(id,'Gevonden: '+it.name+'.');
};
const props=[
 ['v13_blaster','Nierstraal-straalkop','Een metalen apparaatonderdeel met een blauwe lens.','breakroom',386,436,108,72],
 ['v13_mask','Veiligheidsmondkapje','Een gewoon mondkapje.','marthijn',490,480,90,69],
 ['v13_choc','Chocoladereep','Een reep chocolade.','maarten',600,448,90,68],
 ['v13_keys','Campersleutels','Sleutels van Maartens camper.','maarten',408,480,80,65],
 ['v13_plunger','Ontstopper','Een stevige ontstopper met houten steel.','storage',240,480,102,126],
 ['v13_lens','Dure telelens','Een opvallend grote lens van Marthijn.','marthijn',650,430,115,80],
 ['v13_chewed','Beschadigde energienier','De gloeiende behuizing heeft tandafdrukken.','borreoffice',484,525,99,72,'borreStole'],
 ['v13_yellow','Gele energienier','Een ouderwets, geelgloeiend energieonderdeel.',null,460,445,90,70,'finalBeam'],
 ['v13_clean','Gereinigde energienier','De behuizing gloeit weer mooi blauw.',null,450,450,90,70,'kidneyClean'],
 ['v13_bucket','Emmer','Een flinke schoonmaakemmer.','storage',389,536,86,75],
 ['v13_mop','Dweil','Een stoffige dweil.','storage',746,452,76,120],
 ['v13_gloves','Werkhandschoenen','Dikke rubberen handschoenen.','storage',557,456,74,62],
 ['v13_flash','Zaklamp','Een stevige zaklamp.','storage',112,430,70,75],
 ['v13_cooler','Rode koelbox','Een koelbox met zachte voering.','storage',610,534,105,77],
 ['v13_usb','USB-stick','Een USB-stick.','print',266,458,75,57],
 ['v13_coffee','Koffie','Een warme kop koffie.','breakroom',700,440,65,80],
 ['v13_donut','Donut','Een gebakje.','breakroom',579,520,75,52],
 ['v13_tape','Gaffertape','Een rol stevige tape.','print',655,505,85,70],
 ['v13_scissors','Schaar','Een schaar op de werktafel.','print',126,520,80,63],
 ['v13_paper','Kerkbodes','Een stapel papieren.','folding',675,505,94,66],
 ['v13_form','Donorformulier','Papieren vol onduidelijke stempels.','folding',368,495,70,70],
 ['v13_camera','Camerakit','Een camerakoffer.','cabinet',512,505,126,80],
 ['v13_phone','Mobiele telefoon','Een oude smartphone.','sem',474,488,73,67],
 ['v13_clip','Klembord','Een klembord met taken.','managers',292,480,85,75],
 ['v13_warning','Waarschuwingsbord','Een bordje in de gang.','hall',700,492,82,96],
 ['v13_light','Lamp','Een draagbare werklamp.','machine2',730,489,70,105],
 ['v13_gear','Tandwiel','Een los machineonderdeel.','machine2',465,488,98,80],
 ['v13_bag','Laptoptas','Een zwarte laptoptas.','sem',180,535,95,78],
 ['v13_cloth','Schoonmaakdoek','Een schoonmaakdoek.','storage',337,455,74,56],
 ['v13_notepad','Notitieboek','Een klein notitieboek.','meeting',580,476,83,68],
];
props.forEach(v=>item(...v));
itemMeta.v13_damaged=['Beschadigde energienier','v13art_v13_chewed','Een gloeiend sciencefictionobject met tandafdrukken.'];
itemMeta.v13_cleaned=['Schone energienier','v13art_v13_clean','Het energieomhulsel is in de fictieve reinigingsmachine hersteld.'];
itemMeta.v13_yellowkidney=['Oude gele energienier','v13art_v13_yellow','Een vrolijkgeel stuk speelgoed voor Borre.'];
itemMeta.v13_powder=['C.O.K.E. kristallen','v13art_v13_powder','Cantique Original Kinetic Energy: fictief energiekristal.'];
itemMeta.v13_alcohol=['Apparaatvloeistof','v13art_v13_alcohol','Alleen voor een verzonnen sciencefictionmachine.'];
itemMeta.v13_cleanBlaster=['Schone straalkop','v13art_v13_blaster','Een gereinigd energieonderdeel.'];
function moveScene(from,to,match){
 const a=scenes[from]?.npcs||[], i=a.findIndex(n=>n.id===match||n.name?.toLowerCase()===match);
 if(i<0)return;
 const n=a.splice(i,1)[0];(scenes[to].npcs|| (scenes[to].npcs=[])).push(n);
}
const oldTravel=travel;
travel=function(id){
 oldTravel(id);
 if(id==='restroom'&&!F('seenCoen')){S('seenCoen');toast('Coen zit midden in een enorme toiletcrisis.');}
 if(id==='meeting'&&!F('seenMeeting'))toast('Jarno zit half onder de vergadertafel. Wat doet hij daar?');
 if(id==='cutting'&&F('gathering'))V.relocate();
};
function placeHot(scene,id,label,rect,fn){if(!scenes[scene])return;scenes[scene].hot.push({id,label,rect,at:[Math.max(80,Math.min(900,rect[0]+rect[2]/2)),Math.min(650,rect[1]+rect[3]+35)],fn});}
placeHot('breakroom','v13_dianne','Dianne in de keuken',[106,313,158,252],'v13Dianne');
placeHot('breakroom','v13_rinse','Sciencefiction-spoelinstallatie',[550,308,188,187],'v13Rinse');
placeHot('cutting','v13_beam','Nierstraal 3000 bij de snijtafel',[405,255,218,273],'v13Machine');
placeHot('outside','v13_xaviera','Xaviera buiten',[688,322,139,238],'xaviera');
placeHot('borreoffice','v13_dog','Borre bij zijn kooi',[425,433,225,157],'borre');
placeHot('sem','v13_market','Sems laptop — verkoopadvertentie',[375,295,235,173],'v13Market');
placeHot('meeting','v13_jarnounder','Jarno onder de vergadertafel',[425,443,179,111],'v13UnderTable');
for(const [sc,id,name,r] of [['maarten','v13_maarten','Maarten',[270,290,170,220]],['folding','v13_jansje','Jansje',[620,268,160,194]],['maarten','v13_maarten2','Maarten bij bureau',[570,248,152,197]]])placeHot(sc,id,name,r,name==='Jansje'?'jansie':'maarten');
const noOldSpoilers=[
 ['sem',/packet|powder/i],['cutting',/v12spr|v4kidney|v4knife/i]
];
for(const [id,re] of noOldSpoilers)scenes[id].hot=scenes[id].hot.filter(h=>!re.test(h.id));
/* Coen only reveals the plunger AFTER being seen. */
actions.v12Coen=()=>{
 if(!F('seenCoen'))S('seenCoen');
 if(F('toiletDone'))return reply('Coen','Ik blijf even zitten. Voor de emotionele verwerking.');
 if(!has('v13_plunger'))return talk('Coen','Sem! De wc is helemaal verstopt. Kun je een ontstopper zoeken? Ik geef je tien euro.',[
 {t:'Waar zou die liggen?',f:()=>{S('heardPlunger');reply('Coen','In het schoonmaakberghok naast de gang, denk ik.');}},
 {t:'Ik ga zoeken',f:()=>{S('heardPlunger');closeDialog();}}
 ]);
 S('heardPlunger');talk('Coen','Je hebt een ontstopper! Er is nog hoop voor deze wc.',[{t:'De verstopping aanpakken',f:()=>{
 let n=0;const render=()=>panel('Ontstopper','Pomp '+n+' van 4. Nog '+(4-n)+' keer!',[['Pompen',()=>{n++;if(n>=4){closeMini();S('toiletDone');V.updateRestroom?.();done('toiletReward',10,'Coens wc is weer bruikbaar');achieve('Rioolredder');reply('Coen','Dat is fantastisch! Hier is je tientje. En laten we hier nooit meer over praten.');}else render();}]]);render();
 }}]);
};
actions.v12Flush=()=>actions.v12Coen();
actions.v12StorageNote=()=>narr('Op de schoonmaaklijst staat wanneer de spullen worden schoongemaakt.');
actions.v12Mirror=()=>narr('Een beslagen spiegel. De ventilatie lijkt het zwaar te hebben.');
/* Jansje and the beam storyline */
wrap('jansie',(old)=>{
 if(s.scene!=='folding')return old?.();
 if(F('showedKidney'))return reply('Jansje','Ik ben bij de snijtafel. Vraag de rest van de collega’s!');
 if(!F('heardJansje'))return talk('Jansje','Sem, ik heb een raar probleem. Ik heb een nieuwe energienier nodig, en ze zeggen dat er hier een Nierstraal 3000 bestaat.',[
 {t:'Ik help je met dat sciencefictionapparaat.',f:()=>{S('heardJansje');note('Jansje vertelde over de Nierstraal 3000. Zoek de straalkop en een mondkapje.');reply('Jansje','Wat aardig van je! Ik blijf hier kerkbodes vouwen tot je terugkomt.');}},
 {t:'Eerst maar eens rondkijken.',f:closeDialog}
 ]);
 if(F('kidneyClean')&&has('v13_cleaned'))return talk('Jansje','Dat is een prachtige blauwe energienier! Heb je de machine echt aan de praat gekregen?',[
 {t:'Hier, kijk! De nier is hersteld.',f:()=>{give('v13_cleaned');S('showedKidney');S('gathering');note('Jansje is naar de snijtafel. Vraag je collega’s persoonlijk om te komen kijken.');reply('Jansje','Ik ga vast bij de snijtafel staan. Verzamel jij iedereen?');}}
 ]);
 return talk('Jansje','Ik ben erg benieuwd of die Nierstraal 3000 ooit werkt.',[{t:'Ik zoek verder.',f:closeDialog}]);
});
const dianneTalk=()=>{
 if(F('gathering')&&F('allGathered')&&!F('secondClean')){
  if(has('v13_cleanBlaster'))return talk('Dianne','Wat een apparaat, Sem. Moet ik de straalkop nog een keer schoonmaken?',[
 {t:'Ja, nog één keer graag.',f:()=>{S('secondClean');S('gather_Dianne');note('Dianne heeft de straalkop voor de finale gereinigd.');sequence('De laatste poetsbeurt',['Dianne neemt de straalkop voorzichtig aan.','Ze poetst de metalen punt tot het blauwe licht weer brandt.','Dianne geeft de straalkop terug en loopt naar de snijtafel.'],()=>reply('Dianne','Zo. Nu mag dat ding niet weer in de koffie vallen.'));}}
 ]);
 return reply('Dianne','Je moet eerst de schone straalkop in je inventaris hebben.');
 }
 if(has('v13_blaster'))return talk('Dianne','Dat is een bijzonder onderdeel. Mag ik hem even schoonmaken?',[
 {t:'Ja, graag.',f:()=>{give('v13_blaster');take('v13_cleanBlaster');S('firstClean');sequence('Dianne poetst de straalkop',['Dianne draait het metalen onderdeel onder de werklamp.','Ze haalt er een zachte doek over en controleert de blauwe energielens.','Het lampje gaat aan. De straalkop is weer schoon.'],()=>reply('Dianne','Keurig. Als ik nu ook nog mijn berichten kan afmaken...'));}}
 ]);
 if(F('firstClean'))return reply('Dianne','De straalkop is al schoon. Leg hem vooral niet op de vloer.');
 return reply('Dianne','Ik ben bezig in de keuken. Heb je een voorwerp dat ik moet schoonmaken?');
};
actions.v13Dianne=dianneTalk;wrap('dianne',()=>dianneTalk());
actions.v13Machine=()=>{
 if(!F('heardJansje'))return narr('Een wonderlijk apparaat staat bij de grote snijtafel. Sem weet nog niet waarvoor het dient.');
 if(!F('firstBeam')){
  if(!F('firstClean')||!has('v13_cleanBlaster')||!has('v13_mask'))return narr('De Nierstraal mist iets. Sem moet een schone straalkop en een mondkapje vinden.');
  sequence('De eerste Nierstraal',['Sem plaatst de straalkop in de Nierstraal 3000. De blauwe lamp begint te knipperen.','Een paarse energiecirkel verschijnt en Sem stapt erin.','Een hologram licht op. Er klinkt een luide PING!','Een blauw lichtgevende energienier zweeft buiten de energiecirkel.','Plotseling komt Borre aangerend, grijpt de energienier en schiet ermee weg!'],()=>{
   S('firstBeam');S('borreStole');note('Borre is weggerend met de zwevende energienier. Zoek hem bij Marloes.');
   reply('Sem','Borre! Daar gaat mijn energienier! Die hond heeft werkelijk geen gevoel voor wetenschappelijk onderzoek.');
  });return;
 }
 if(!F('showedKidney'))return narr('De Nierstraal staat klaar. Eerst moet de energienier terugkomen bij Jansje.');
 if(!F('allGathered'))return narr('Nog niet iedereen is bij de snijtafel. Spreek de collega’s aan.');
 if(!F('secondClean'))return narr('De straalkop moet nog één keer schoongemaakt worden. Dianne is in de keuken.');
 if(F('finalBeam'))return narr('Hier heeft de Nierstraal 3000 haar onmogelijke werk al gedaan.');
 sequence('De Nierstraal 3000 — Finale',['Iedereen staat rond de grote snijtafel. Jansje stapt in de gloeiende cirkel.','Een hologram toont een gele energienier. De machine projecteert deze buiten de cirkel.','Een frisse blauwe energienier zweeft omhoog. De lasers draaien rond de tafel.','De blauwe nier verdwijnt met een heldere lichtflits in het hologram.','De machine meldt: TRANSPLANTATIE VOLTOOID — 100% FANTASIE!','Jansje stapt vrolijk naar buiten. De collega’s juichen.'],()=>{
   S('finalBeam');take('v13_yellowkidney');note('Jansje is beter. Borre kan misschien nog iets met de gele energienier.');
   reply('Jansje','Dat viel reuze mee. Heeft iemand ondertussen de kerkbodes gevouwen?');
 });
};
actions.kidneyPlan=()=>actions.v13Machine();
actions.v13Rinse=()=>{
 if(!F('firstBeam'))return narr('Een ongewone keukenmachine met blauwe lampjes. Sem heeft nog geen idee waarvoor die dient.');
 if(!has('v13_damaged'))return narr('De installatie staat stil. Hier is geen beschadigde energienier om te reinigen.');
 if(!has('v13_alcohol'))return narr('Voor deze fantasie-installatie ontbreekt nog de speciale apparaatvloeistof. Maarten weet misschien meer.');
 if(!F('toiletDone'))return narr('De afvoer van de spoelmachine zit geblokkeerd. Misschien is er ergens in het gebouw een probleem met de riolering.');
 sequence('De energienier herstellen',['Sem zet de beschadigde energienier in de afgesloten machine.','Hij bevestigt de speciale apparaatvloeistof aan de machine.','Blauwe lichtspiralen draaien rond het beschadigde energieomhulsel.','Een vrolijke PING! De energienier gloeit weer helder blauw.'],()=>{
  give('v13_damaged');give('v13_alcohol');take('v13_cleaned');S('kidneyClean');note('De energienier is met onmogelijke sciencefictiontechnologie hersteld. Laat hem aan Jansje zien.');reply('Sem','Klaar! Volgens mij heeft deze machine meer technisch vernuft dan alle printers bij elkaar.');
 });
};
actions.v13UnderTable=()=>{
 if(!F('seenJarnoUnder')){S('seenJarnoUnder');note('In de vergaderruimte zag Sem Jarno onder de tafel bij Erik.');}
 reply('Jarno','Ik zocht een pen! En niemand hoeft dit verder te bespreken.');
};
wrap('jarnoUnderTable',()=>actions.v13UnderTable());
wrap('erik',(old)=>{
 const opts=[];
 if(F('seenJarnoUnder')&&!F('erikMoney'))opts.push({t:'Over wat ik net onder de tafel zag...',f:()=>{done('erikMoney',100,'Erik vraagt Sem over zijn ontdekking te zwijgen');reply('Erik','Hier, honderd euro. En wat je net hebt gezien, daar hebben we het niet meer over.');}});
 if(F('gathering')&&!F('gather_Erik'))opts.push({t:'Help mee bij de snijtafel.',f:()=>V.invite('Erik')});
 if(opts.length)return talk('Erik','Wat een interessante dag. Maar sommige dingen houden we onder ons.',opts);
 return old?.();
});
wrap('marloes',(old)=>{
 const opts=[];
 if(F('borreStole')&&!F('chocGiven'))opts.push({t:'Borre heeft iets van mij meegenomen.',f:()=>{S('marloesBlocked');reply('Marloes','Ik moet me concentreren. Laat Borre alsjeblieft even met rust.');}});
 if(F('borreStole')&&!F('chocGiven')&&has('v13_choc'))opts.push({t:'Ik heb chocolade voor je.',f:()=>{give('v13_choc');S('chocGiven');note('Marloes is blij met de chocolade. Borre is nu bereikbaar.');reply('Marloes','Chocolade! Dat is lief. Ga maar even bij Borre kijken, maar houd het rustig.');}});
 if(has('v13_keys')&&!F('camperDone'))opts.push({t:'Wil je Maartens campersleutels?',f:()=>{give('v13_keys');done('camperDone',250,'Campersleutels aan Marloes gegeven');reply('Marloes','Wat aardig! Hier, tweehonderdvijftig euro. Heb je hem wel verteld dat ik nu zijn camper heb?');}});
 if(F('gathering')&&!F('gather_Marloes'))opts.push({t:'Wil je bij de snijtafel komen?',f:()=>V.invite('Marloes')});
 opts.push({t:'Hoe gaat het met Borre?',f:()=>reply('Marloes',F('borreStole')?'Hij is ontzettend druk met zijn nieuwe blauwe speeltje.':'Hij ligt tevreden bij zijn kooi.')});
 talk('Marloes','Ik probeer vandaag een beetje rustig te werken.',opts);
});
wrap('borre',(old)=>{
 if(F('finalBeam')&&has('v13_yellowkidney'))return talk('Sem','Borre kijkt verlangend naar het gele energieobject.',[{t:'Geef het veilig gemaakte speelgoed aan Borre.',f:()=>{give('v13_yellowkidney');S('borreHappy');S('kidneyDone');sequence('Een onverwacht happy end',['Borre krijgt het gele, zachte energie-speelgoed en huppelt vrolijk rond.','Marloes moet lachen om de uitgelaten hond.','Jansje klimt op de snijtafel en begint te dansen. Iedereen juicht!'],()=>{S('jansjeDancing');done('mainComplete',0,'De Nierstraal 3000 heeft de dag gered. Jansje danst op de snijtafel!');achieve('Nierstraal 3000 — eindfeest');reply('Jansje','Dank je, Sem! Volgende week liever gewoon een taart, hoor.');});}}]);
 if(F('borreStole')&&!F('chocGiven'))return reply('Marloes','Ik wil hier even stilte. Eerst met mij praten.');
 if(F('borreStole')&&!F('kidneyRetrieved'))return talk('Sem','Borre heeft de beschadigde energienier bij zijn kooi laten liggen.',[{t:'Pak de half afgekauwde energienier.',f:()=>{S('kidneyRetrieved');take('v13_damaged');note('De energienier heeft tandafdrukken. Hij moet worden hersteld.');reply('Sem','Tja. Gelukkig ziet dit sciencefictionding er nog te redden uit.');}}]);
 return reply('Sem',F('kidneyRetrieved')?'Borre snuffelt nieuwsgierig aan Sems tas.':'Borre ligt rustig bij zijn kooi.');
});
wrap('maarten',(old)=>{
 const opts=[];
 if(F('kidneyRetrieved')&&!F('askedAlcohol'))opts.push({t:'Heb je speciale reinigingsalcohol voor de Nierstraal?',f:()=>{S('askedAlcohol');reply('Maarten','Nee hoor, Sem. Jij wilt dat vast gewoon opdrinken. Eerst wil ik zeker weten dat het echt voor dat rare apparaat is.');}});
 if(F('askedAlcohol')&&!F('gotAlcohol')&&has('v13_powder'))opts.push({t:'Ik heb C.O.K.E.-energiekristallen voor je apparaat.',f:()=>{give('v13_powder');take('v13_alcohol');S('gotAlcohol');reply('Maarten','Dat zijn precies de kristallen die mijn apparaat nodig heeft. Hier is de reinigingsfles. Alleen voor die machine, hoor.');}});
 if(F('gathering')&&!F('gather_Maarten'))opts.push({t:'Kom je ook naar de snijtafel?',f:()=>V.invite('Maarten')});
 opts.push({t:'Heb je montagewerk?',f:()=>{closeDialog();old?.();}});
 talk('Maarten',F('askedAlcohol')?'Nog steeds op zoek naar vreemde machineonderdelen, Sem?':'Ik probeer gewoon rustig een film te monteren, Sem.',opts);
});
wrap('xaviera',(old)=>{
 const options=[];
 if(!F('boughtPowder'))options.push({t:'Wat is dat mysterieuze witte poeder?',f:()=>reply('Xaviera','C.O.K.E. betekent Cantique Original Kinetic Energy. Fictieve energiekristallen. Vijftig euro. Geen gewone frisdrank dus.')});
 if(!F('boughtPowder'))options.push({t:'Ik koop de kristallen voor €50.',f:()=>{
  if(s.cash<50)return reply('Xaviera','Je hebt nog niet genoeg geld. Help eerst wat collega’s.');
  money(-50);S('boughtPowder');take('v13_powder');note('€50 betaald aan Xaviera voor fictieve energiekristallen.');reply('Xaviera','Hier zijn je C.O.K.E.-kristallen. Succes met je experiment.');
 }});
 if(F('boughtPowder'))options.push({t:'Bedankt voor de kristallen.',f:()=>reply('Xaviera','Als de machine maar niet opnieuw begint te zingen.')});
 options.push({t:'Een campagnetip?',f:()=>{closeDialog();old?.();}});
 talk('Xaviera','Ik sta even buiten. Hier kun je tenminste rustig nadenken.',options);
});
function miniWink(){
 const pattern=['Links','Rechts','Links','Beide'];let i=0;
 const show=()=>panel('Carmens knipoogcode','Carmen toont: links — rechts — links — beide. Herhaal nu stap '+(i+1)+' van 4.',[['Links',()=>press('Links')],['Rechts',()=>press('Rechts')],['Beide',()=>press('Beide')]]);
 const press=v=>{if(v!==pattern[i]){i=0;sound('wrong');toast('De code klopt niet. Opnieuw proberen.');show();return;}i++;if(i===4){closeMini();done('carmenWink',20,'Carmens knipoogcode ontcijferd');reply('Carmen','Hier, twintig euro. Ik krijg toch genoeg geld van mijn vader.');}else show();};
 show();
}
wrap('carmen',(old)=>{
 const opts=[];
 if(!F('carmenWink'))opts.push({t:'Ik wil je knipoogvolgorde raden.',f:miniWink});
 if(F('gathering')&&!F('gather_Carmen'))opts.push({t:'Ga je mee naar de snijtafel?',f:()=>V.invite('Carmen')});
 opts.push({t:'Vertel eens over je ontwerp.',f:()=>{closeDialog();old?.();}});
 talk('Carmen','Carmen knipoogt: links, rechts, links, beide. Er zit een patroon in.',opts);
});
wrap('sanne',(old)=>{
 const opts=[];
 if(!F('sanneQuiz'))opts.push({t:'Ik help je met je hypotheekvragen.',f:()=>quiz('Sannes hypotheekquiz',[
 ['Wat gebeurt meestal met de maandelijkse rentelasten als de hypotheekschuld daalt?',['Ze worden hoger','Ze worden lager','Ze verdubbelen'],1],
 ['Wat betekent een langere rentevaste periode meestal?',['Een vast rentetarief voor een langere tijd','Geen maandlasten','Een hypotheek zonder aflossing'],0],
 ['Wat kenmerkt een lineaire hypotheek?',['Een vaste bruto maandlast','Elke maand hetzelfde bedrag aan aflossing','Je lost nooit af'],1]
 ],()=>{done('sanneQuiz',100,'Sanne heeft haar hypotheekquiz afgerond');reply('Sanne','Honderd euro voor je hulp! Van hypotheken weet je verrassend veel.');})});
 if(F('gathering')&&!F('gather_Sanne'))opts.push({t:'Kom je naar de Nierstraal?',f:()=>V.invite('Sanne')});
 opts.push({t:'Terug naar je andere opdracht?',f:()=>{closeDialog();old?.();}});
 talk('Sanne','Mijn hypotheek is ingewikkelder dan het bedrijfsschema. Kun jij me helpen?',opts);
});
wrap('fenneke',(old)=>{
 const opts=[];
 if(!F('fennekeQuiz'))opts.push({t:'Ik denk mee over duidelijk communiceren.',f:()=>quiz('Fennekes vragen',[
 ['Wat helpt iemand die onduidelijke afspraken vervelend vindt?',['Nog vager praten','Duidelijk zeggen wat je bedoelt','Alle afspraken onverwacht veranderen'],1],
 ['Wat doe je als iemand aangeeft last van drukte te hebben?',['Rust en keuze bieden','Luid praten','De persoon negeren'],0],
 ['Hoe ontdek je welke ondersteuning iemand zelf fijn vindt?',['Invullen voor de ander','Eerst een diagnose gokken','De persoon zelf respectvol vragen'],2]
 ],()=>{done('fennekeQuiz',75,'Fenneke is geholpen met communicatievragen');reply('Fenneke','Dat waren bruikbare antwoorden, Sem. Hier is vijfenzeventig euro.');})});
 if(F('gathering')&&!F('gather_Fenneke'))opts.push({t:'Kom je bij de snijtafel kijken?',f:()=>V.invite('Fenneke')});
 opts.push({t:'Terug naar je andere opdracht?',f:()=>{closeDialog();old?.();}});
 talk('Fenneke','Ik wil graag weten hoe ik beter rekening kan houden met iemands wensen.',opts);
});
wrap('dirkjanNPC',(old)=>{
 if(F('hugDone'))return reply('Dirk-Jan','Bedankt voor het compliment over mijn haar, Sem.');
 talk('Dirk-Jan','Mijn haar wordt inderdaad steeds langer.',[{t:'Je haar staat je goed. Mooi dat je het laat groeien om te doneren.',f:()=>{
 S('hugDone');sequence('Een oprecht compliment',['Dirk-Jan kijkt verrast op van zijn werk.','Hij loopt naar Sem toe en geeft hem een hartelijke knuffel.','Sem kijkt even verbaasd, maar lacht.'],()=>reply('Dirk-Jan','Dank je! Dat betekent meer dan geld.'));
 }},{t:'Heb je nog kabelwerk?',f:()=>{closeDialog();old?.();}}]);
});
wrap('jarno',(old)=>{
 const opts=[];
 if(!F('jarnoOrder'))opts.push({t:'Ik help met de productievolgorde.',f:()=>{
 const steps=['Klantaanvraag','Briefing','Offerte en planning','Productie','Kwaliteitscontrole','Oplevering en facturatie'];let idx=0;
 const show=()=>panel('Jarnos projectplanning','Wat is stap '+(idx+1)+'?',steps.map((v,i)=>[v,()=>{
  if(i===idx){idx++;if(idx===steps.length){closeMini();done('jarnoOrder',60,'Jarno heeft een complete projectplanning');reply('Jarno','Goed gedaan! Hier is zestig euro. En nu graag allemaal die planning volgen.');}else show();}
  else{sound('wrong');toast('Niet de juiste stap. Probeer opnieuw.');}
 }]).filter((_,i)=>i>=idx).sort(()=>0.5-Math.random()));show();
 }});
 if(F('gathering')&&!F('gather_Jarno'))opts.push({t:'We verzamelen iedereen bij de snijtafel.',f:()=>V.invite('Jarno')});
 opts.push({t:'Nog andere werkzaamheden?',f:()=>{closeDialog();old?.();}});
 talk('Jarno','Er moet een plan zijn, Sem. Altijd een plan.',opts);
});
wrap('johanneke',(old)=>{
 if(F('gathering')&&!F('gather_Johanneke'))return talk('Johanneke','Die snijtafel? Daar moet ik nog aan het werk!',[{t:'We hebben je hulp nodig voor de Nierstraal.',f:()=>V.invite('Johanneke')}]);
 return old?.();
});
wrap('coen',(old)=>{
 if(F('gathering')&&!F('gather_Coen'))return talk('Coen','Ik ben toch net uit de wc gered?',[
 {t:'Iedereen verzamelt zich bij de snijtafel.',f:()=>V.invite('Coen')}]);
 if(!F('seenCoen'))return reply('Coen','Alles goed, Sem?');
 return reply('Coen',F('toiletDone')?'Ik ben nog steeds opgelucht over die wc.':'Ik ga er liever niet over praten.');
});
V.invite=name=>{
 S('gather_'+name);note(name+' gaat naar de snijtafel.');const count=V.gatherNames.filter(n=>F('gather_'+n)).length;
 if(count===V.gatherNames.length){S('allGathered');note('Alle negen collega’s zijn uitgenodigd. Laat Dianne de straalkop nogmaals reinigen.');}
 closeDialog();V.relocate();reply(name,'Ik kom naar de snijtafel. Er gebeurt vandaag iets heel bijzonders!');
};
V.relocate=()=>{
 if(!F('gathering'))return;
 for(const name of V.gatherNames){
  if(!F('gather_'+name))continue;
  const id=name.toLowerCase(),cut=scenes.cutting;
  for(const [scene,data] of Object.entries(scenes)){
   if(scene==='cutting')continue;
   data.npcs=(data.npcs||[]).filter(n=>n.id!==id&&n.name?.toLowerCase()!==id);
  }
 }
 if(F('showedKidney'))scenes.folding.npcs=(scenes.folding.npcs||[]).filter(n=>n.id!=='jansie');
};
actions.v13Market=()=>{
 if(has('v13_lens')&&!F('lensSold'))return quiz('Marktplaats — advertentie',[
 ['Welke advertentietitel trekt een serieuze koper?',['Lens, koop maar','Telelens met merk, type en conditie','Supergeheim kantoorspul'],1],
 ['Wat hoort bij een goede advertentie?',['Eerlijke foto’s en beschrijving','Een willekeurige afbeelding','Geen productinformatie'],0]
 ],()=>{give('v13_lens');done('lensSold',180,'Telelens verkocht via de advertentiesimulatie');heat(8);reply('Sem','De lens is verkocht. Dat levert geld op, maar ik hoop dat Marthijn niets merkt.');});
 return reply('Sem',F('lensSold')?'De verkoopadvertentie is al afgerond.':'Sems laptop staat klaar. Hier kun je later misschien iets verkopen.');
};
const oldPc=actions.semComputer;actions.semComputer=function(...args){if(has('v13_lens')||F('lensSold'))return actions.v13Market();return oldPc?.(...args);};
/* Extra doors and object actions are authored in the graphics/navigation module. */
V.health=()=>({version:V.version,scene:s.scene,rooms:Object.keys(scenes).length,visibleProps:V.items.filter(V.isVisible).length,flags:Object.keys(s.flags).filter(k=>k.startsWith('v13_')).length,gathered:V.gatherNames.filter(n=>F('gather_'+n)).length,finished:F('mainComplete')});
V.test=()=>{
 const errors=[];for(const [id,sc] of Object.entries(scenes)){if(!sc.hot.some(h=>h.door))errors.push('Geen uitgang: '+id);}
 if(!V.items.some(x=>x.id==='v13_plunger'))errors.push('Ontstopper ontbreekt');
 if(!scenes.restroom||!scenes.storage)errors.push('Nieuwe ruimtes ontbreken');
 return {errors,roomCount:Object.keys(scenes).length,itemCount:V.items.length};
};
console.info('SEM V13 story loaded:',V.test());
})();