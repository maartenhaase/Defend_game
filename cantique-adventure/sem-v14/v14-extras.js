/* SEM IN CANTIQUE V14 — De lensmok van Rob + Coens zichtbare toiletcrisis.
   Bewust een uitbreiding op V13.2: geen bestaande plot, foto's of saves overschrijven. */
(function(){
'use strict';
const V=window.CANTIQUE_V13;
if(!V)throw Error('V14 requires V13');
V.version='14.0';
document.title='SEM in Cantique V14 — De lensmok van Rob';
for(const n of document.querySelectorAll('#splash h1, .logo strong'))n.textContent='SEM IN CANTIQUE · V14';
const splashBadge=document.querySelector('#splash .eyebrow');if(splashBadge)splashBadge.textContent='V14 · De lensmok van Rob';
const F=V.isKnown, S=V.setKnown;
const sceneOffice='borreoffice';
const el=id=>document.getElementById(id);
const ready=im=>!!im&&(im instanceof HTMLCanvasElement||(im.complete&&im.naturalWidth>0));
const getImg=src=>{const im=new Image();im.decoding='async';im.src=src;return im;};
const sources=window.V10_ASSETS||{};
const marloesDesk=sources.marloes_desk_1?getImg(sources.marloes_desk_1):null;
const emptyOffice=sources.room_borreoffice?getImg(sources.room_borreoffice):null;
const assets={};
function canvasArt(id,w,h,paint){
 const can=document.createElement('canvas');can.width=w;can.height=h;
 const c=can.getContext('2d');paint(c,w,h);
 const url=can.toDataURL('image/png');imagePaths['v13art_'+id]=url;
 const im=getImg(url);images['v13art_'+id]=im;assets[id]=im;return im;
}
const rr=(c,x,y,w,h,r,fill,stroke,lw=2)=>{
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();
 if(stroke){c.lineWidth=lw;c.strokeStyle=stroke;c.stroke();}
};
const grad=(c,x,y,xx,yy,colors)=>{
 const g=c.createLinearGradient(x,y,xx,yy);
 colors.forEach((color,i)=>g.addColorStop(i/(colors.length-1),color));return g;
};
const oval=(c,x,y,rx,ry,fill,stroke,lw=2)=>{
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.lineWidth=lw;c.strokeStyle=stroke;c.stroke();}
};
const dot=(c,x,y,r,color)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();};
const text=(c,str,x,y,size=20,color='#eee')=>{
 c.font='bold '+size+'px system-ui';c.textAlign='center';
 c.fillStyle=color;c.fillText(str,x,y);
};
// Objects are transparent PNG-like sprites rasterized once and used in both inventory and scene.
canvasArt('v14_dogtreat',240,220,c=>{
 c.save();c.shadowColor='#0008';c.shadowBlur=15;c.shadowOffsetY=10;
 rr(c,47,28,151,164,13,grad(c,50,50,192,182,['#faac41','#b95928','#ed9941']),'#783b1e',6);
 rr(c,58,39,129,32,5,'#5c3221','#f3d19f',3);text(c,'BORRE',122,63,24);
 rr(c,66,84,115,67,9,'#f5e3c1','#996c46',4);
 c.shadowColor='transparent';c.fillStyle='#a05b2c';
 oval(c,111,115,42,17,'#ae743d');dot(c,72,112,14,'#ae743d');dot(c,150,112,14,'#ae743d');
 text(c,'HONDEN',120,174,18,'#fff8d6');text(c,'KOEKJES',120,193,14,'#fff8d6');c.restore();
});
canvasArt('v14_lensmug',230,230,c=>{
 c.save();c.shadowColor='#0009';c.shadowBlur=15;c.shadowOffsetY=9;
 // Deliberately resembles a photographic lens, but the obvious handle gives away the twist.
 rr(c,42,40,141,150,19,grad(c,43,56,180,175,['#171b21','#545e67','#101319','#383f45','#0b0d11']),'#aab3be',4);
 c.lineWidth=7;c.strokeStyle='#606c77';
 for(const y of [56,84,113,153,179]){c.beginPath();c.moveTo(46,y);c.lineTo(178,y);c.stroke();}
 for(let j=0;j<16;j++){c.fillStyle=j%2?'#232832':'#56616c';c.fillRect(57+j*7,115,4,28);}
 c.strokeStyle='#c1c7cb';c.lineWidth=12;c.beginPath();c.ellipse(177,115,35,49,0,-Math.PI*.42,Math.PI*.4);c.stroke();
 oval(c,113,40,72,26,'#b5b6b2','#d6d2c9',6);
 oval(c,112,42,59,17,'#5d4030','#eee5da',4);
 c.shadowColor='transparent';
 rr(c,79,89,73,20,5,'#ddd0a5','#5c5a5b',2);text(c,'70–200',115,104,13,'#232830');
 c.restore();
});
canvasArt('v14_coffeemachine',220,250,c=>{
 c.save();c.shadowColor='#000a';c.shadowBlur=16;c.shadowOffsetY=10;
 rr(c,29,19,160,200,15,grad(c,33,30,185,188,['#9da9a8','#333d45','#10191d','#677a83']),'#bfc6c4',5);
 rr(c,47,36,123,34,8,'#131c1e','#929fa5',3);text(c,'KOFFIE',106,58,17,'#eee8d7');
 dot(c,78,90,7,'#6fd69d');dot(c,113,90,7,'#d4d4c4');dot(c,147,90,7,'#d4d4c4');
 rr(c,60,109,99,85,9,'#121b20','#85979c',4);
 rr(c,80,132,63,43,7,'#eadfc8','#b1b1a6',4);
 c.lineWidth=7;c.strokeStyle='#eee1c9';c.beginPath();c.arc(144,151,12,-1.5,1.4);c.stroke();
 rr(c,30,209,163,14,6,'#838c8a','#171d1f',3);c.restore();
});
canvasArt('v14_coffee',180,180,c=>{
 c.save();c.shadowColor='#0008';c.shadowBlur=12;c.shadowOffsetY=8;
 rr(c,35,72,103,72,11,grad(c,45,80,135,148,['#f1ece2','#b8a58f','#f2e5d3']),'#645b51',4);
 c.lineWidth=10;c.strokeStyle='#dfdacd';c.beginPath();c.ellipse(132,111,26,23,0,-1.5,1.5);c.stroke();
 oval(c,85,73,54,16,'#efe5d7','#a3a09a',5);oval(c,85,73,41,10,'#654335');
 c.restore();
});
canvasArt('v14_poop',220,140,c=>{
 c.save();c.shadowColor='#1a0807a8';c.shadowBlur=10;c.shadowOffsetY=8;
 oval(c,109,119,94,15,'#5b3421');
 oval(c,110,102,86,28,grad(c,40,90,170,100,['#4c2419','#96643c','#54301b']),'#38251e',4);
 oval(c,107,75,65,32,grad(c,52,64,165,95,['#51301f','#ac7845','#613722']),'#3d291f',3);
 oval(c,106,48,40,26,grad(c,67,33,147,66,['#4a2b1c','#ad7945','#62402a']),'#483323',3);
 oval(c,105,26,17,13,'#9e6d3f','#664229',3);
 c.shadowColor='transparent';oval(c,88,45,8,4,'#cca47b');oval(c,73,78,11,5,'#bb8e5c');c.restore();
});
canvasArt('v14_puddle',220,100,c=>{
 oval(c,105,65,96,24,'#5a382fbb','#42251a',4);
 oval(c,71,65,33,8,'#a5704188');oval(c,149,71,25,7,'#9b633caa');
 dot(c,15,58,7,'#5a382bbb');dot(c,201,77,6,'#62422cbb');
});
canvasArt('v14_stench',146,222,c=>{
 c.strokeStyle='#85b05b';c.lineWidth=18;c.lineCap='round';
 c.shadowColor='#9dc76f';c.shadowBlur=22;
 for(let i=0;i<3;i++){
  c.beginPath();const x=35+i*35;
  c.moveTo(x+12,210);c.bezierCurveTo(x-36,170,x+65,140,x+13,98);
  c.bezierCurveTo(x-17,61,x+58,43,x+16,5);c.stroke();
 }
 c.shadowBlur=0;
 oval(c,58,144,45,25,'#8ca85d55');oval(c,102,70,39,25,'#abc47f44');
});
for(let frame=0;frame<4;frame++){
 canvasArt('v14_tears_'+frame,140,145,c=>{
  // Animatable independent crying facial-effects sprite: same registration point every frame.
  for(let j=0;j<2;j++){
   const x=43+j*50,y=30+(frame*18+j*13)%48;
   const g=c.createLinearGradient(x,y,x,y+36);
   g.addColorStop(0,'#dbf7ffed');g.addColorStop(.5,'#64bbebd9');g.addColorStop(1,'#2686c0c4');
   c.beginPath();c.moveTo(x,y-12);c.bezierCurveTo(x-15,y+10,x-14,y+23,x,y+27);
   c.bezierCurveTo(x+13,y+18,x+15,y+7,x,y-12);c.fillStyle=g;c.fill();
   oval(c,x-3,y+7,2,6,'#ffffffa8');
  }
  c.lineWidth=7;c.lineCap='round';c.strokeStyle='#40596bd9';
  c.beginPath();c.moveTo(17,15);c.lineTo(56,6);c.moveTo(83,6);c.lineTo(122,17);c.stroke();
 });
}
const sprite=(id,x,y,w,h)=>{
 const im=assets[id]||images['v13art_'+id];if(ready(im))ctx.drawImage(im,x,y,w,h);
};
function addItem(id,name,desc,room,x,y,w,h,action){
 itemMeta[id]=[name,'v13art_'+id,desc];
 const it={id,name,scene:room,x,y,w,h,needs:''};V.items.push(it);
 scenes[room].hot.push({id:'v14_item_'+id,label:name,rect:[x,y,w,h],
   at:[Math.min(900,Math.max(90,x+w/2)),Math.max(530,Math.min(662,y+h+48))],
   fn:action,v14Item:id});
 return it;
}
addItem('v14_dogtreat','Hondenkoekjes','Een zakje hondensnoepjes van Maartens bureau. Geschikt voor honden.', 'maarten',754,443,82,76,'v14TakeTreat');
addItem('v14_lensmug','Lensvormige mok','Een zwarte mok in de vorm van een telelens. Hij lijkt duur, maar is een dierbaar aandenken.',sceneOffice,345,369,65,64,'v14TakeMug');
// Borre is actually drawn near x=190, y=543; make the visible dog clickable, not just a remote hotspot.
scenes[sceneOffice].hot.unshift({id:'v14_borre_sprite',label:'Borre',rect:[174,523,158,116],at:[371,655],fn:'borre'});
// These two use the original inventory system without placing a cup somewhere before brewing.
itemMeta.v14_coffee=['Verse koffie','v13art_v14_coffee','Een verse kop koffie uit het koffiezetapparaat.'];
const oldVisibility=V.isVisible;
V.isVisible=it=>{
 if(it.id==='v14_lensmug')return !F('v14_mugTaken')&&!has(it.id);
 if(it.id==='v14_dogtreat')return !F('v14_treatTaken')&&!has(it.id);
 return oldVisibility(it);
};
actions.v14TakeTreat=()=>{
 if(F('v14_treatTaken'))return toast('De koekjes zijn al gepakt.');
 S('v14_treatTaken');put('v14_dogtreat');note('Hondenkoekjes van Maartens bureau gepakt. Niet geschikt voor mensen.');syncUI();sound('tap');
};
actions.v14TakeMug=()=>{
 if(F('v14_mugTaken'))return toast('De mok staat hier niet meer.');
 if(!F('v14_distract'))return say('Sem','Marloes zit vlak voor haar bureau. Die lensvormige mok kan ik niet ongemerkt meenemen.',[{t:'Verder kijken',f:closeDialog}]);
 S('v14_mugTaken');put('v14_lensmug');note('Sem heeft de zwarte lensmok meegenomen terwijl Marloes naar Borre omkeek.');syncUI();sound('tap');
 say('Sem','Een prachtige telelens! ...Of zit er een handvat aan? Eerst maar eens kijken wat hij waard is.',[{t:'Meenemen',f:closeDialog}]);
};
// Photo-backed cutscenes with separate transparent dog, human, object and tear sprite layers.
function vignette(title,caption,done,mode){
 closeDialog();modal='v14cut';
 const wrap=el('minigame');wrap.hidden=false;
 wrap.innerHTML='<div class="v14cut"><h3>'+escapeHtml(title)+'</h3><div class="v14-stage"><div class="v14-shot"></div></div><p>'+escapeHtml(caption)+'</p><button class="primary v14-next">Verder</button></div>';
 const stage=wrap.querySelector('.v14-shot');
 function img(src,cl){
  if(!src)return null;const node=new Image();node.className=cl;node.src=src;stage.append(node);return node;
 }
 img(sources.room_borreoffice||imagePaths.bg_borreoffice,'v14-back');
 const mar=img(V.actorSource?.('Marloes')||sources.marloes_desk_1,'v14-mar '+(mode==='cry'?'v14-mar-cry':'v14-mar-turn'));
 const dog=img(V.actorSource?.('Borre')||sources.borre_dog,'v14-borre');
 if(mode==='cry'){
  const tears=img(imagePaths.v13art_v14_tears_0,'v14-tear-photo');
  let count=0;
  const move=()=>{if(!tears?.isConnected)return;tears.src=imagePaths['v13art_v14_tears_'+(count++%4)]};
  const interval=setInterval(()=>{if(!tears?.isConnected){clearInterval(interval);return;}move();},300);
  wrap.querySelector('.v14-next').addEventListener('click',()=>clearInterval(interval),{once:true});
 }else if(mode==='dog'){img(imagePaths.v13art_v14_dogtreat,'v14-treat-shot');}
 else if(mode==='happy'){img(imagePaths.v13art_v14_coffee,'v14-coffee-shot');}
 wrap.querySelector('.v14-next').onclick=()=>{closeMini();done?.()};
}
const oldBorre=actions.borre;
actions.borre=function(...args){
 if(has('v14_dogtreat')&&!F('v14_distract')&&!F('v14_mugTaken')){
  return say('Sem','Borre kijkt nieuwsgierig naar het zakje hondenkoekjes.',[
   {t:'Geef Borre een hondensnoepje.',f:()=>{
    remove('v14_dogtreat');S('v14_distract');
    note('Borre kauwt op een hondensnoepje. Marloes draait zich naar hem om; de lensmok staat even onbewaakt.');syncUI();
    vignette('Een slimme afleiding','Borre krijgt een hondenkoekje en begint luid te smakken. Marloes draait zich om om te kijken wat hij uitspookt.',null,'dog');
   }},{t:'Laat hem rustig liggen',f:closeDialog}]);
 }
 return oldBorre?.(...args);
};
const oldMarloes=actions.marloes;
actions.marloes=function(...args){
 if(F('v14_mugTaken')&&!F('v14_noticed'))S('v14_noticed');
 if(F('v14_noticed')&&!F('v14_comforted')){
  const choices=[];
  if(has('v14_coffee'))choices.push({t:'Hier, een warme kop koffie. En het spijt me.',f:()=>{
    remove('v14_coffee');if(has('v14_lensmug'))remove('v14_lensmug');
    S('v14_comforted');note('Sem troost Marloes met koffie en geeft de onverkoopbare lensmok terug.');syncUI();
    vignette('Het aandenken van Rob','Marloes droogt haar tranen en neemt de koffie aan. Sem legt de lensmok weer op haar bureau. Ze glimlacht voorzichtig.',()=>say('Marloes','Dank je, Sem. Die mok is vroeger van mijn broer Rob geweest. Voor mij is hij onvervangbaar. Ik ben blij dat hij terug is.',[{t:'Dat begrijp ik. Sorry.',f:closeDialog}]),'happy');
  }});
  if(!has('v14_coffee'))choices.push({t:'Hoe kan ik het goedmaken?',f:()=>say('Marloes','Ik moet even bijkomen. Misschien helpt een kop warme koffie uit het apparaat in de keuken.',[{t:'Ik ga koffie halen.',f:closeDialog}])});
  return say('Marloes','Mijn lensmok is weg... Die was van mijn broer Rob. Daarom betekent die mok zoveel voor me.',[...choices,{t:'Ik kom zo terug.',f:closeDialog}]);
 }
 if(F('v14_comforted'))return say('Marloes','Dank je voor de koffie, Sem. En vooral voor het terugbrengen van Robs mok. Laat hem alsjeblieft staan.',[{t:'Dat beloof ik.',f:closeDialog}]);
 return oldMarloes?.(...args);
};
const oldMarket=actions.v13Market;
function mugSale(){
 if(F('v14_saleAttempted'))return say('Sem','De verkoopsite schatte de lensmok op €0. Hier moet ik geen geld aan willen verdienen.',[{t:'Sluiten',f:closeDialog}]);
 return say('Sem','Zal ik die grote, zwartmetalen telelens te koop zetten?',[
 {t:'Plaats een advertentie voor de lens.',f:()=>{
   S('v14_saleAttempted');
   note('Verkoop mislukt: waarde €0. Het object is geen telelens, maar een mok. Sem houdt de mok nog in zijn tas.');syncUI();
   say('Koper','Dat is geen camera-objectief, dat is een koffiemok met een handvat! De marktwaarde is €0. Die koop ik dus niet.',[
    {t:'Dan maar terugbrengen.',f:()=>say('Sem','Misschien moet ik Marloes haar mok teruggeven. Waarom ligt die eigenlijk zo zorgvuldig op haar bureau?',[
      {t:'Laptop afsluiten',f:closeDialog}])}]);
 }},{t:'Toch niet',f:closeDialog}]);
}
actions.v13Market=function(...args){if(has('v14_lensmug'))return mugSale();return oldMarket?.(...args);};
const oldComputer=actions.semComputer;
actions.semComputer=function(...args){if(has('v14_lensmug'))return mugSale();return oldComputer?.(...args);};
scenes.breakroom.hot.push({id:'v14_coffeemachine',label:'Koffiezetapparaat',rect:[797,316,152,178],at:[820,615],fn:'v14BrewCoffee'});
actions.v14BrewCoffee=()=>{
 if(has('v14_coffee'))return say('Sem','Ik heb al een warme kop koffie bij me.',[{t:'Oké',f:closeDialog}]);
 put('v14_coffee');syncUI();sound('tap');
 note('Een vers kopje koffie uit het koffiezetapparaat gehaald.');
 say('Sem','Het apparaat bromt zacht. Ping! Een vers kopje koffie. Precies wat Marloes misschien kan gebruiken.',[{t:'Neem de koffie mee',f:closeDialog}]);
};
// She notices the theft once Sem leaves the office, or on speaking to her.
// Returning later triggers one emotional cutscene, without interrupting any active dialogue.
const oldTravel=travel;
travel=function(id){
 const before=s.scene;
 if(before===sceneOffice&&id!==sceneOffice&&F('v14_mugTaken')&&!F('v14_noticed'))S('v14_noticed');
 oldTravel(id);
 if(id===sceneOffice&&F('v14_noticed')&&!F('v14_comforted')&&!F('v14_cryCutSeen')){
  S('v14_cryCutSeen');
  setTimeout(()=>{if(s.scene===sceneOffice&&!modal&&!dlg){
    vignette('Marloes is verdrietig','De lensmok is verdwenen. Marloes staart naar de lege plek op haar bureau en begint te huilen. De mok was van haar broer Rob.',null,'cry');
  }},300);
 }
};
// Actual animated sprites in the live scene, not speech alone.
const oldWorld=drawWorld;
drawWorld=function(t){
 oldWorld(t);
 const now=Number(t)||0;
 ctx.save();
 if(s.scene===sceneOffice){
  // Redraw only the desk NPC when she is looking toward Borre, preserving the photographed table.
  if(F('v14_distract')&&!F('v14_mugTaken')&&ready(marloesDesk)){
    if(ready(emptyOffice))ctx.drawImage(emptyOffice,196,308,151,122,196,308,151,122);
    const im=marloesDesk,h=140,w=h*im.naturalWidth/im.naturalHeight;
    ctx.save();ctx.translate(276,0);ctx.scale(-1,1);ctx.drawImage(im,-w/2,448-h,w,h);ctx.restore();
    sprite('v14_dogtreat',215,526+Math.sin(now/220)*2,24,24);
  }
  if(F('v14_noticed')&&!F('v14_comforted')){
    // Registered independent four-frame tears sprite, positioned at Marloes' face.
    sprite('v14_tears_'+(Math.floor(now/340)%4),238,324,76,76);
    ctx.globalAlpha=.45;
    sprite('v14_tears_'+(Math.floor(now/510)%4),242,374+Math.sin(now/270)*2,48,48);
    ctx.globalAlpha=1;
  }
  if(F('v14_comforted'))sprite('v14_lensmug',347,369,65,64);
 }
 if(s.scene==='breakroom'){
  sprite('v14_coffeemachine',798,316,142,175);
  // Steam rising from the brewing outlet.
  ctx.globalAlpha=.35+.2*Math.sin(now/530);
  sprite('v14_coffee',831,402+Math.sin(now/420)*3,50,53);ctx.globalAlpha=1;
 }
 if(s.scene==='restroom'){
  if(!F('toiletDone')){
   // Opaque waste sprites on the bowl and floor; drifting green stench has its own frames.
   sprite('v14_puddle',681,572,165,67);
   sprite('v14_poop',704,488+Math.sin(now/870)*2,121,81);
   sprite('v14_poop',835,614,76,47);
   for(let i=0;i<3;i++){
    const y=324-((now/32+i*61)%206);
    ctx.globalAlpha=.17+.19*(.5+.5*Math.sin(now/380+i*2));
    sprite('v14_stench',667+i*67,y,92,155);
   }
   ctx.globalAlpha=1;
   // Occasional muck bubbles are drawn only while the toilet is blocked.
   for(let i=0;i<4;i++){
    const phase=(now/790+i*.27)%1;
    ctx.fillStyle='rgba(111,153,74,'+(.5*(1-phase))+')';
    ctx.beginPath();ctx.arc(714+i*30,523-phase*38,4+phase*9,0,Math.PI*2);ctx.fill();
   }
  }else{
   ctx.globalAlpha=.35;
   ctx.fillStyle='#dbf8ff';
   for(let i=0;i<4;i++){
    const x=691+i*40,y=470+Math.sin(now/530+i)*6;
    ctx.fillRect(x,y,4,18);ctx.fillRect(x-7,y+7,18,4);
   }
  }
 }
 ctx.restore();
};
const css=document.createElement('style');
css.textContent=String.raw`
.v14cut{width:min(660px,96vw);margin:auto;text-align:center;background:#0c1c25;border:1px solid #51707e;border-radius:16px;padding:14px}
.v14cut h3{color:#f4dfb2;margin:0 0 10px;font-size:22px}
.v14cut p{min-height:46px;font-size:15px}
.v14cut .v14-next{min-width:170px}
.v14-stage{position:relative;aspect-ratio:16/8;overflow:hidden;border-radius:9px;background:#27343c}
.v14-shot{position:absolute;inset:0;overflow:hidden}
.v14-back{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.65)}
.v14-mar{position:absolute;height:84%;max-width:35%;object-fit:contain;bottom:1%;left:39%;filter:drop-shadow(0 4px 4px #0009)}
.v14-mar-turn{transform-origin:center bottom;animation:v14turn 1.8s ease-in-out forwards}
.v14-borre{position:absolute;bottom:2%;left:8%;width:33%;height:37%;object-fit:contain;animation:v14munch .45s ease-in-out infinite alternate}
.v14-treat-shot{position:absolute;width:12%;bottom:12%;left:22%;animation:v14munch .45s ease-in-out infinite alternate}
.v14-tear-photo{position:absolute;width:14%;height:36%;object-fit:contain;left:47%;top:13%;animation:v14sob .4s ease-in-out infinite alternate}
.v14-mar-cry{animation:v14sob .5s ease-in-out infinite alternate}
.v14-coffee-shot{position:absolute;width:16%;height:27%;object-fit:contain;bottom:22%;left:27%}
@keyframes v14turn{0%{transform:scaleX(1)}100%{transform:scaleX(-1) translateX(12%)}}
@keyframes v14munch{to{transform:translateY(-10px) rotate(-4deg)}}
@keyframes v14sob{to{transform:translateY(4px) rotate(1deg)}}
@media(max-width:650px){.v14cut{padding:9px}.v14cut h3{font-size:19px}.v14cut p{font-size:13px}.v14-stage{aspect-ratio:16/9}}
`;
css.textContent+='\n.v13-plumbing::before{content:"";position:absolute;z-index:4;pointer-events:none;width:135px;height:72px;left:23%;bottom:12px;background:url("'+imagePaths.v13art_v14_poop+'") center/contain no-repeat;animation:v14munch .6s infinite alternate}.v13-plumbing::after{content:"";position:absolute;z-index:5;pointer-events:none;width:115px;height:125px;left:38%;top:-5px;opacity:.54;background:url("'+imagePaths.v13art_v14_stench+'") center/contain no-repeat;animation:v14stink 1.4s ease-in-out infinite alternate}@keyframes v14stink{to{transform:translateY(-16px);opacity:.16}}';
document.head.append(css);
// Show the optional quest after the player sees the mug; expose a simple QA probe.
const oldSide=refreshSide;
refreshSide=function(){
 oldSide();
 if(tab!=='tasks')return;
 const target=el('sideContent');
 if(target && (F('v14_mugTaken')||F('v14_distract')||F('v14_treatTaken'))){
  const p=document.createElement('div');p.className='task'+(F('v14_comforted')?' done':'');
  p.textContent=(F('v14_comforted')?'✓ ':'○ ')+'De lensmok van Marloes: '+(F('v14_comforted')?'weer terug bij Marloes':F('v14_mugTaken')?'wat is hij waard?':'zoek een afleiding voor Borre');
  target.append(p);
 }
};
V.v14Test=()=>({
 version:V.version,
 dogTreat:V.items.some(it=>it.id==='v14_dogtreat'),
 lensMug:V.items.some(it=>it.id==='v14_lensmug'),
 coffeeMachine:scenes.breakroom.hot.some(h=>h.fn==='v14BrewCoffee'),
 sale:typeof actions.v13Market==='function',
 marloes:typeof actions.marloes==='function',
 coenSprites:['v14_poop','v14_puddle','v14_stench'].every(id=>!!images['v13art_'+id]),
 cryFrames:[0,1,2,3].every(i=>!!images['v13art_v14_tears_'+i])
});
syncUI();
console.info('SEM IN CANTIQUE V14 EXTRAS',V.v14Test());
})();