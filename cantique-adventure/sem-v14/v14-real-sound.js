/* Cantique 14.4 REAL FOLEY SOUND UPDATE (CC0 recordings).
 * Source: https://sfxjar.com/ (BigSoundBank / Kenney), https://mixkit.co/free-sound-effects/
 * The MP3s are played from their publishers' sites; NO generated oscillator sounds.
 * Existing V14 gameplay, sprite art, photography and save data are unchanged. */
(function(){
'use strict';
const A=window.CANTIQUE_AUDIO={version:'14.4',events:[],failures:[],sources:{}};
if(!window.CANTIQUE_V13||!window.scenes||!window.actions)return;
const SFXJ='https://sfxjar.com/audio/';
const MIX='https://assets.mixkit.co/active_storage/sfx/';
const mk=id=>MIX+id+'/'+id+'-preview.mp3';
const clip=(url,source,kind='real')=>({url,source,kind});
const C={
 // Real CC0 field recordings from BigSoundBank via SFX Jar, plus Kenney RPG doors.
 pressRoom:clip(SFXJ+'0502.mp3','https://sfxjar.com/office/'),
 keyboard:clip(SFXJ+'0229.mp3','https://sfxjar.com/office/'),
 officeFan:clip(SFXJ+'0125.mp3','https://sfxjar.com/computer/'),
 officeFan2:clip(SFXJ+'0126.mp3','https://sfxjar.com/computer/'),
 fridge:clip(SFXJ+'1157.mp3','https://sfxjar.com/refrigerator/'),
 roomFridge:clip(SFXJ+'0034.mp3','https://sfxjar.com/refrigerator/'),
 doorA:clip(SFXJ+'rpg-audio-dooropen-1-ogg.mp3','https://sfxjar.com/door-open/'),
 doorSliding:clip(SFXJ+'0336.mp3','https://sfxjar.com/door-open/'),
 doorOffice:clip(SFXJ+'0377.mp3','https://sfxjar.com/door-open/'),
 doorHandle:clip(SFXJ+'0029.mp3','https://sfxjar.com/computer/'),
 paper:clip(SFXJ+'0785.mp3','https://sfxjar.com/paper/'),
 paperCrumple:clip(SFXJ+'1220.mp3','https://sfxjar.com/paper/'),
 newsPaper:clip(SFXJ+'1250.mp3','https://sfxjar.com/paper/'),
 zip:clip(SFXJ+'0270.mp3','https://sfxjar.com/zipper/'),
 zipBag:clip(SFXJ+'0014.mp3','https://sfxjar.com/zipper/'),
 drawer:clip(SFXJ+'0773.mp3','https://sfxjar.com/office/'),
 stapler:clip(SFXJ+'0009.mp3','https://sfxjar.com/office/'),
 click:clip(SFXJ+'0029.mp3','https://sfxjar.com/computer/'),
 belly:clip(SFXJ+'1280.mp3','https://sfxjar.com/gurgle/'),
 gurgle:clip(SFXJ+'1026.mp3','https://sfxjar.com/gurgle/'),
 flatulence:clip(SFXJ+'0111.mp3','https://sfxjar.com/fart/'),
 flatulence2:clip(SFXJ+'0240.mp3','https://sfxjar.com/fart/'),
 toiletFlush:clip(SFXJ+'0141.mp3','https://sfxjar.com/toilet-flush/'),
 toiletLong:clip(SFXJ+'0033.mp3','https://sfxjar.com/toilet-flush/'),
 coffee:clip(SFXJ+'0167.mp3','https://sfxjar.com/grinder/'),
 borre:clip(SFXJ+'0112.mp3','https://sfxjar.com/animals/dog/'),
 // Mixkit Free Sound Effects license explicitly allows game use. Real recorded Foley only.
 paperSlide:clip(mk(1530),'https://mixkit.co/free-sound-effects/paper/'),
 paperMove:clip(mk(2380),'https://mixkit.co/free-sound-effects/office/'),
 paperStaple:clip(mk(2995),'https://mixkit.co/free-sound-effects/paper/'),
 scissorCut:clip(mk(2378),'https://mixkit.co/free-sound-effects/paper/'),
 typing:clip(mk(1386),'https://mixkit.co/free-sound-effects/typing/'),
 typingFast:clip(mk(1392),'https://mixkit.co/free-sound-effects/typing/'),
 // Real projector recording: creates metallic rotating-motor texture under the machine bed.
 mechanicalRoll:clip(mk(1444),'https://mixkit.co/free-sound-effects/movie-projector/'),
};
A.sources=Object.fromEntries(Object.entries(C).map(([key,val])=>[key,{url:val.url,license:val.url.startsWith(SFXJ)?'CC0 1.0':'Mixkit SFX Free License',source:val.source}]));
const isEnabled=()=>typeof music!=='undefined'&&!!music.enabled;
let audioUnlocked=false,mode='none',ambient=[],lastRoom='',lastFoley={},fxActive=[];
const getSettings=()=>{try{
 const p=JSON.parse(localStorage.getItem('cantique_audio_v144')||'{}');
 return {ambience:Math.max(0,Math.min(1,Number(p.ambience??.42))),foley:Math.max(0,Math.min(1,Number(p.foley??.75)))};
}catch(e){return {ambience:.42,foley:.75}}};
let settings=getSettings();
const PLAYERS=Object.create(null);
function make(key,loop=false){
 const src=C[key];if(!src)return null;
 const a=new Audio(src.url);a.preload=loop?'auto':'metadata';a.loop=loop;
 a.playsInline=true;
 a.addEventListener('error',()=>{if(!A.failures.includes(key))A.failures.push(key);}, {once:true});
 return a;
}
function safePlay(a){
 if(!a)return;
 try{const p=a.play();if(p?.catch)p.catch(()=>{});}catch(e){}
}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function fade(a,to,ms=420,stopOnZero=false){
 if(!a)return;
 const from=Number(a.volume)||0,begin=performance.now();
 function next(t){
  if(!a.isConnected&&false)return;
  const k=clamp((t-begin)/ms,0,1);
  try{a.volume=clamp(from+(to-from)*k,0,1)}catch(e){}
  if(k<1)requestAnimationFrame(next);
  else if(stopOnZero&&to<.001){try{a.pause();a.currentTime=0}catch(e){}}
 }
 requestAnimationFrame(next);
}
function stopAmbient(){
 for(const entry of ambient)fade(entry.audio,0,320,true);
 ambient=[];
 mode='none';lastRoom='';
}
function roomGroup(id){
 if(['outside'].includes(id))return 'outside';
 if(id==='restroom')return 'wc';
 if(id==='breakroom')return 'kitchen';
 if(['print','machine2','cutting','storage','folding','jarno_sanne'].includes(id))return 'press';
 if(id==='hall')return 'hall';
 if(id==='underdesk')return 'under';
 return 'office';
}
function layerSet(room){
 if(room==='outside')return [];
 if(room==='wc')return [['officeFan2',.045]];
 if(room==='kitchen')return [['fridge',.19],['officeFan',.035]];
 if(room==='press')return [['pressRoom',.64],['mechanicalRoll',.21],['officeFan',.04]];
 if(room==='hall')return [['pressRoom',.10],['officeFan',.08]];
 if(room==='under')return [['officeFan',.20]];
 return [['officeFan',.15],['keyboard',.12]];
}
function setRoom(id,force=false){
 const newMode=roomGroup(id);
 if(!force&&newMode===mode&&lastRoom===id)return;
 lastRoom=id;
 if(!audioUnlocked||!isEnabled()){stopAmbient();return;}
 if(!force&&newMode===mode)return;
 const wanted=layerSet(newMode);
 const nowPlaying=new Map(ambient.map(e=>[e.key,e]));
 const next=[];
 wanted.forEach(([key,vol])=>{
  let entry=nowPlaying.get(key);
  if(entry)nowPlaying.delete(key);
  else{const audio=make(key,true);if(!audio)return;audio.volume=0;entry={key,audio};safePlay(audio);}
  fade(entry.audio,clamp(vol*settings.ambience,0,.65),550);
  next.push(entry);
 });
 for(const e of nowPlaying.values())fade(e.audio,0,500,true);
 ambient=next;mode=newMode;
 A.events.push('scene:'+id);
}
function one(key,volume=.4,minGap=120,offset=0,cutAt=null){
 if(!audioUnlocked||!isEnabled())return;
 const now=Date.now();
 if(now-(lastFoley[key]||0)<minGap)return;
 lastFoley[key]=now;
 const a=make(key,false);if(!a)return;
 a.volume=clamp(settings.foley*volume,0,.84);
 a.addEventListener('ended',()=>{const idx=fxActive.indexOf(a);if(idx>=0)fxActive.splice(idx,1);},{once:true});
 fxActive.push(a);
 if(fxActive.length>10){const oldest=fxActive.shift();try{oldest.pause()}catch(e){}}
 if(offset)try{a.currentTime=offset}catch(e){}
 safePlay(a);
 if(cutAt){setTimeout(()=>{try{a.pause()}catch(e){}},cutAt);}
 A.events.push('sfx:'+key);
}
function boot(){
 audioUnlocked=true;
 if(isEnabled())setRoom(s.scene,true);
}
function quiet(){
 stopAmbient();
 for(const x of fxActive)try{x.pause()}catch(e){}
 fxActive=[];
}
A.play=(key,vol=.35)=>one(key,vol);
A.sync=()=>{if(isEnabled()){if(audioUnlocked)setRoom(s.scene,true)}else quiet()};
A.mute=quiet;
A.getState=()=>({version:A.version,unlocked:audioUnlocked,soundEnabled:isEnabled(),room:s.scene,mode,activeLoops:ambient.map(x=>x.key),activeOneShots:fxActive.length,failures:[...A.failures],events:A.events.slice(-12)});
A.setVolume=(kind,val)=>{
 if(kind!=='ambience'&&kind!=='foley')return;
 settings[kind]=clamp(Number(val),0,1);
 try{localStorage.setItem('cantique_audio_v144',JSON.stringify(settings))}catch(e){}
 if(kind==='ambience'&&audioUnlocked&&isEnabled())setRoom(s.scene,true);
};
A.sourcesPage='https://sfxjar.com/office/';
/* Disable synthetic V10–V12 oscillator tones; keep the original sound button's state. */
if(typeof soundEngine!=='undefined'&&soundEngine){
 try{soundEngine.stop()}catch(e){}
 soundEngine.boot=()=>{};
 soundEngine.event=()=>{};
 soundEngine.stop=()=>{};
}
sound=function(type){
 if(type==='door'){ // Travel selects a physical door vs looking underneath a desk.
  const id=String(A.transition||'');
  if(id==='underdesk'||(s.scene==='borreoffice'&&A.previous==='underdesk'))one('zip',.19,300,0,1100);
  else if(id==='restroom'||A.previous==='restroom')one('doorSliding',.35,330,0,3400);
  else one('doorA',.43,300,0,1200);
 }else if(type==='tap')one('click',.15,165,0,900);
 else if(type==='money')one('drawer',.2,600,0,1200);
 else if(type==='wrong')one('paperCrumple',.19,420,0,800);
 else if(type==='done')one('paperStaple',.24,550,0,1200);
};
const prevTravel=travel;
travel=function(id){
 A.transition=id;A.previous=s.scene;
 const before=s.scene;
 const result=prevTravel(id);
 if(s.scene!==before)setRoom(s.scene);
 A.transition='';A.previous='';
 return result;
};
const prevRunHot=runHot;
runHot=function(h){
 if(h&&!h.door){
  const fn=String(h.fn||''),id=String(h.v13Item||h.v14Item||h.id||'');
  if(/v14BrewCoffee/i.test(fn))one('coffee',.52,750,0,3200);
  else if(/v14TakeTreat|v14TakeMug/i.test(fn))one('paperMove',.43,260,0,1400);
  else if(/v13Pickup/i.test(fn)){
   if(/paper|form|notepad|clip/i.test(id))one('paper',.35,250,0,1650);
   else if(/keys|lens|camera|gear|tool|plunger|flash/i.test(id))one('drawer',.38,250,0,1500);
   else if(/bag|cloth|gloves/i.test(id))one('zipBag',.4,230,0,1350);
   else one('paperSlide',.28,220,0,1200);
  }else if(/v12Coen|v12Flush/i.test(fn))one('belly',.34,7000);
  else if(/v13Market|semComputer/i.test(fn))one('typing',.16,5000,0,2300);
  else if(/v13Machine|v13Rinse/i.test(fn))one('mechanicalRoll',.35,850,0,4300);
  else if(/borre/i.test(fn))one('borre',.22,25000,0,1500);
  else if(/jarno|jansie|sanne|carmen/i.test(fn))one('paperMove',.14,1800,0,850);
 }
 return prevRunHot(h);
};
// Make the original clickable actions sound correct even when called from dialogs.
function wrapAction(name,fn){
 const old=actions[name];if(typeof old!=='function')return;
 actions[name]=function(...args){fn();return old.apply(this,args)};
}
wrapAction('v14BrewCoffee',()=>one('coffee',.44,900,0,2800));
wrapAction('v14TakeMug',()=>one('paperSlide',.38,900,0,1200));
wrapAction('v14TakeTreat',()=>one('paperCrumple',.42,900,0,1200));
wrapAction('v13Market',()=>one('typingFast',.22,3500,0,2000));
wrapAction('v13Rinse',()=>one('gurgle',.37,3500,0,3200));
wrapAction('v12Coen',()=>{if(!window.CANTIQUE_V13.isKnown('toiletDone')){one('belly',.42,6500);one('flatulence',.65,15000)}});
wrapAction('v12Flush',()=>{if(window.CANTIQUE_V13.isKnown('toiletDone'))one('toiletFlush',.61,12000,0,10500);});
wrapAction('borre',()=>one('borre',.29,28000,0,1500));
const originalSoundButton=document.getElementById('soundBtn');
if(originalSoundButton){
 originalSoundButton.addEventListener('click',()=>{if(isEnabled())boot();else quiet()});
}
document.addEventListener('click',e=>{
 const node=e.target;
 if(!node?.closest)return;
 if(node.closest('#newBtn,#continueBtn,#startBtn,#soundBtn,#touchSound,#overlay button')){
  if(isEnabled())boot();
 }
 const panel=node.closest('#minigame');
 if(panel){
  const b=node.closest('button');
  if(b){
   const label=String(b.textContent||'').toLowerCase();
   if(label.includes('pomp')){one('gurgle',.48,450,0,1000);one('paperSlide',.18,480,0,700);}
   else if(label.includes('verder')||label.includes('afronden'))one('paperSlide',.12,180,0,500);
  }
 }
 if(node.closest('#choices .choice')){
  const label=String(node.textContent||'').toLowerCase();
  if(/honden|borre|koekje/.test(label))one('paperCrumple',.32,700,0,1300);
  if(/koffie|troost/.test(label))one('coffee',.26,1000,0,1200);
  if(/print|snijtafel|kerkbode/.test(label))one('newsPaper',.23,1700,0,1200);
 }
},{passive:true});
// Ambient samples must not continue in background tabs.
document.addEventListener('visibilitychange',()=>{if(document.hidden)quiet();else if(audioUnlocked&&isEnabled())setRoom(s.scene,true)});
window.addEventListener('pagehide',quiet);
// Save-safe settings panel. No changes to story state, inventory or NPC sprites.
(function makeMixer(){
 const btn=document.createElement('button');btn.type='button';btn.id='v14AudioMixButton';btn.textContent='🔉 Sfeer';btn.title='Geluiden uit echte opnames';
 btn.setAttribute('aria-label','Stel achtergrond en effecten in');
 const pop=document.createElement('section');pop.id='v14AudioMix';pop.hidden=true;pop.innerHTML=
  '<strong>🎙️ Realistische geluiden</strong><label>Achtergrond <input id="v14Ambience" type="range" min="0" max="100" value="'+Math.round(settings.ambience*100)+'"></label>'+
  '<label>Handelingen <input id="v14Foley" type="range" min="0" max="100" value="'+Math.round(settings.foley*100)+'"></label>'+
  '<small>Geluid start na een tik op Speel. Voor de geluidsopnames is internet nodig.</small>';
 const host=document.querySelector('.stats')||document.querySelector('header')||document.body;
 host.append(btn);document.body.append(pop);
 btn.addEventListener('click',()=>{pop.hidden=!pop.hidden;if(isEnabled())boot()});
 pop.querySelector('#v14Ambience').addEventListener('input',e=>A.setVolume('ambience',e.target.value/100));
 pop.querySelector('#v14Foley').addEventListener('input',e=>A.setVolume('foley',e.target.value/100));
 const style=document.createElement('style');style.textContent=
  '#v14AudioMixButton{border:1px solid #e8d39b99;border-radius:9px;background:#263237;color:#f4e4ca;cursor:pointer;min-height:32px;padding:5px 10px;font-size:12px;font-weight:800}'+
  '#v14AudioMix{position:fixed;z-index:9999;right:12px;top:72px;background:#15232a;box-shadow:0 8px 34px #000a;color:#f5edda;border:1px solid #8a9da0;border-radius:12px;min-width:min(265px,94vw);padding:16px;font:14px/1.4 system-ui}'+
  '#v14AudioMix[hidden]{display:none!important}#v14AudioMix label{display:grid;grid-template-columns:94px 1fr;gap:10px;align-items:center;margin-top:13px}'+
  '#v14AudioMix input{width:100%;touch-action:pan-x;accent-color:#e4bd72}#v14AudioMix small{display:block;margin-top:13px;color:#bbcac9;font-size:11px;line-height:1.4}'+
  '@media(max-width:680px){#v14AudioMixButton{min-height:30px;font-size:11px;padding:4px 7px}#v14AudioMix{top:55px;right:6px}}';
 document.head.append(style);
})();
document.title='SEM in Cantique V14.4 — echte omgevingsgeluiden';
const splash=document.querySelector('#splash .eyebrow');if(splash)splash.textContent='V14.4 · echte geluidsopnames';
A.qa=()=>({version:A.version,samples:Object.keys(C).length,cc0:Object.values(C).filter(x=>x.url.startsWith(SFXJ)).length,mixkit:Object.values(C).filter(x=>x.url.startsWith(MIX)).length,roomGroups:['office','press','wc','kitchen','hall','under','outside'],linksAreExternal:true,playbackRequiresUserClick:true,soundToggleIntegrated:!!originalSoundButton});
console.info('Cantique 14.4 recorded sound system loaded',A.qa());
})();