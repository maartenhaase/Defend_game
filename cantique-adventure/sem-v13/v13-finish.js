/* SEM IN CANTIQUE V13 — UI, save guards, quest visibility and regression checks */
(function(){
'use strict';
const V=window.CANTIQUE_V13;if(!V)throw Error('V13 story missing');
const F=V.isKnown,S=V.setKnown;
document.title='SEM in Cantique V13 — Nierstraal 3000';
const el=document.querySelector('#splash .eyebrow');if(el)el.textContent='V13 · De Nierstraal 3000';
const titles=document.querySelectorAll('#splash h1, .logo strong');titles.forEach(n=>n.textContent='SEM IN CANTIQUE · V13');
const info=document.querySelector('#splash .intro, #splash .subtitle, #splash p');if(info)info.textContent='Een onwaarschijnlijk kantooravontuur. Zoek zelf uit wat je collega’s verbergen, los puzzels op, verdien geld en ontdek de Nierstraal 3000. Alles is fictief.';
/* Match characters to explicitly labeled portrait files, never to an unrelated fallback face. */
const labeledFaces={
 'Sem':'sem_jonkman','Coen':'coen_vos','Jansje':'jansie_van_dijk','Jansie':'jansie_van_dijk',
 'Dianne':'dianne','Carmen':'carmen_van_den_berg','Sanne':'sanne_lenferink',
 'Jarno':'jarno_gerritsen_mulkes','Fenneke':'fenneke_van_dijk',
 'Marloes':'marloes_nieuwenhuis','Johanneke':'johanneke_wierbos',
 'Xaviera':'xaviera_pieter','Dirk-Jan':'dirkjan_dokters','Dirkjan':'dirkjan_dokters',
 'Rineke':'rineke_boers','Timo':'timo_reukema'
};
const unconfirmed=['Erik','Marthijn'];
const oldPortrait=portrait;
const neutralPortrait=name=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#2d3e49"/><stop offset="1" stop-color="#101b24"/></linearGradient></defs><rect width="320" height="320" fill="url(#g)"/><circle cx="160" cy="106" r="56" fill="#637781"/><path d="M43 294Q52 181 160 181Q271 181 280 294" fill="#4c5c68"/><text x="160" y="309" text-anchor="middle" fill="#ecdfc3" font-family="sans-serif" font-size="24">'+String(name).replace(/[<>&]/g,'')+'</text></svg>');
portrait=function(name){
 const id=labeledFaces[name];
 if(id&&imagePaths['portrait_'+id])return imagePaths['portrait_'+id];
 if(name==='Maarten'&&imagePaths['full_maarten'])return imagePaths['full_maarten'];
 if(imagePaths['portrait_'+String(name).toLowerCase()])return imagePaths['portrait_'+String(name).toLowerCase()];
 return neutralPortrait(name);
};
V.portraitAudit={labeled:Object.keys(labeledFaces),unconfirmed,missing:Object.entries(labeledFaces).filter(([,id])=>!imagePaths['portrait_'+id]).map(([name])=>name)};
const oldToast=toast;
toast=function(text){return oldToast(String(text).replace(/\b(godverdomme|verdomme|godsamme|tering|fokking|fucking|kut|shit|jezus)\b/gi,'verdorie'));};
const oldNote=note;note=function(text){return oldNote(String(text).replace(/\b(godverdomme|verdomme|godsamme|tering|fokking|fucking|kut|shit|jezus)\b/gi,'verdorie'));};
const oldRefresh=refreshSide;
refreshSide=function(){
 oldRefresh();
 if(tab!=='tasks')return;
 const list=$('sideContent');if(!list)return;
 let html='<h2>Het Cantique-avontuur</h2><p>Ontdek geheimen zelf. Er verschijnen pas nieuwe missies wanneer Sem weet dat er iets te doen is.</p>';
 html+='<p style="font-size:14px;color:#ecd4a4"><strong>Beschikbaar geld: €'+Number(s.cash||0).toLocaleString('nl-NL')+'</strong></p>';
 const rows=[];
 if(F('seenCoen'))rows.push(['Help Coen met het toilet',F('toiletDone')]);
 if(F('heardJansje'))rows.push(['Zoek de straalkop en een mondkapje',F('firstClean')&&has('v13_mask')]);
 if(F('firstBeam'))rows.push(['Zoek de verdwenen energienier',F('kidneyRetrieved')]);
 if(F('kidneyRetrieved'))rows.push(['Herstel de beschadigde energienier',F('kidneyClean')]);
 if(F('showedKidney'))rows.push(['Verzamel de collega’s bij de snijtafel',F('allGathered')]);
 if(F('allGathered'))rows.push(['Laat Dianne de straalkop nogmaals reinigen',F('secondClean')]);
 if(F('secondClean'))rows.push(['Start de finale van de Nierstraal 3000',F('finalBeam')]);
 if(F('finalBeam'))rows.push(['Breng het gele energieobject naar Borre',F('mainComplete')]);
 if(F('carmenWink'))rows.push(['Carmens knipoogcode',true]);
 if(F('sanneQuiz'))rows.push(['Sannes hypotheekquiz',true]);
 if(F('fennekeQuiz'))rows.push(['Fennekes communicatiequiz',true]);
 if(F('jarnoOrder'))rows.push(['Jarnos projectplanning',true]);
 if(F('erikMoney'))rows.push(['Eriks vergadering',true]);
 if(F('camperDone'))rows.push(['De campersleutels',true]);
 if(F('hugDone'))rows.push(['Het compliment voor Dirk-Jan',true]);
 if(F('lensSold'))rows.push(['De telelens verkocht',true]);
 if(!rows.length)html+='<p>Begin met rondkijken en praat met je collega’s.</p>';
 for(const [title,done] of rows)html+='<div class="task'+(done?' done':'')+'"><i>'+(done?'✓':'○')+'</i><span>'+escapeHtml(title)+'</span></div>';
 list.innerHTML=html;
};
const prevSync=syncUI;
syncUI=function(){prevSync();if(typeof V.relocate==='function'&&F('gathering'))V.relocate();};
const oldFinish=finish;
finish=function(){
 if(!F('mainComplete')){say('Sem','Ik kan nog niet naar huis. Er is hier iets te veel onafgemaakt.',[{t:'Ik ga verder',f:closeDialog}]);return;}
 return oldFinish();
};
actions.finish=()=>finish();
const oldV12Head=document.querySelector('.v12-nav header strong');
if(oldV12Head)oldV12Head.textContent='VANUIT DEZE RUIMTE';
if(scenes.restroom){
 scenes.restroom.name='Heren-wc';
 scenes.restroom.sub='Tegels, sanitair en een deur naar de centrale gang';
 const entry=scenes.restroom.hot.find(h=>h.id==='v12coen');if(entry)entry.label='Coen op het toilet';
}
if(scenes.storage){
 scenes.storage.name='Schoonmaakberghok';
 scenes.storage.sub='Schoonmaakspullen en toegang tot de centrale gang';
}
const prevCoen=actions.v12Coen;
actions.v12Coen=function(){
 if(F('gathering')&&!F('gather_Coen'))return say('Coen','Is het alweer tijd voor een vergadering?',[
 {t:'Kom mee naar de snijtafel.',f:()=>V.invite('Coen')},
 {t:'Ik kom later terug.',f:closeDialog}
 ]);
 return prevCoen();
};
const oldJoe=actions.loudJohanneke;
if(typeof oldJoe==='function')actions.loudJohanneke=function(){
 if(F('gathering')&&!F('gather_Johanneke'))return say('Johanneke','Wat? Heb je me nodig?',[
 {t:'Kom mee naar de Nierstraal.',f:()=>V.invite('Johanneke')},
 {t:'Later',f:closeDialog}
 ]);
 return oldJoe();
};
V.updateRestroom=()=>{
 // Rebuild the painted background in its current clean/dirty state when available.
 if(typeof V.repaintRestroom==='function')V.repaintRestroom();
};
const originalTravel=travel;
travel=function(id){
 originalTravel(id);
 if(id==='cutting'&&F('showedKidney')){
  V.relocate();
  if(!F('allGathered'))toast('Er komen steeds meer collega’s bij de snijtafel.');
 }
};
const earlierPick=actions.v13Pickup;
actions.v13Pickup=function(h){
 earlierPick(h);
 if(h?.v13Item==='v13_lens')S('lensFound');
 if(h?.v13Item==='v13_choc')S('chocFound');
};
const originalHot=hotspotFound;
hotspotFound=function(x,y){
 const cur=scenes[s.scene];if(!cur)return null;
 const hit=originalHot(x,y);
 if(hit&&hit.id?.startsWith('v13door_'))return hit;
 // Prevent invisible picked-up objects from blocking real scene interactions.
 if(hit&&hit.id?.startsWith('v13_item_')){const id=hit.v13Item,it=V.items.find(a=>a.id===id);if(!it||!V.isVisible(it))return cur.hot.filter(h=>h.id!==hit.id).find(h=>{const r=h.rect;return x>=r[0]&&y>=r[1]&&x<=r[0]+r[2]&&y<=r[1]+r[3]})||null;}
 return hit;
};
const css=document.createElement('style');
css.textContent='.v12-nav{background:#102027;border-color:#597a80}.v12-nav button{font-size:12px}.v13panel button{border-radius:10px}.v13cinema-stage{background:radial-gradient(ellipse at 50% 65%,#1d5e74 0,#091720 74%)}.v12Horror{display:none!important}@media(max-width:680px){.v12-nav{max-width:100%;overflow:hidden}.v12-nav-doors{overflow-x:auto;flex-wrap:nowrap}.v12-nav-doors button{min-height:43px}}';
document.head.append(css);
const oldRun=runHot;
runHot=function(h){
 if(h?.id?.startsWith('v13door_')&&!window.CANTIQUE_V12?.graph?.[s.scene]?.includes(h.door)){toast('Die deur is vanaf hier niet bereikbaar.');return;}
 return oldRun(h);
};
const diagnostics=()=>{
 const graph=window.CANTIQUE_V12?.graph||{};
 const rooms=Object.keys(graph),seen=new Set(),todo=['reception'];
 while(todo.length){const id=todo.pop();if(seen.has(id))continue;seen.add(id);todo.push(...(graph[id]||[]).filter(x=>!seen.has(x)));}
 const map=V.doorModels||{};
 const noDoors=rooms.filter(id=>!map[id]?.length);
 const brokenRoutes=rooms.flatMap(id=>(graph[id]||[]).filter(t=>!(graph[t]||[]).includes(id)).map(t=>id+' -> '+t));
 const missingArt=V.items.filter(it=>!images['v13art_'+it.id]);
 return {version:V.version,rooms:rooms.length,reachable:seen.size,visibleDoorCount:Object.values(map).reduce((n,a)=>n+a.length,0),rasterProps:V.items.length,missingArt:missingArt.map(x=>x.id),noDoors,brokenRoutes,flags:Object.keys(s.flags).filter(x=>x.startsWith('v13_')).length,codeChecksPassed:!noDoors.length&&!brokenRoutes.length&&!missingArt.length};
};
V.qa=diagnostics;
V.resetOnlyV13=()=>{Object.keys(s.flags).filter(x=>x.startsWith('v13_')).forEach(k=>delete s.flags[k]);s.inv=s.inv.filter(id=>!id.startsWith('v13_'));save();};
V.relocate();
syncUI();
console.info('SEM IN CANTIQUE V13',diagnostics());
})();