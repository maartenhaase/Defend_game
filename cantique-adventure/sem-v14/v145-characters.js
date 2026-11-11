/* CANTIQUE V14.5 — real independent Marloes, animated emotions and WC prop sprites. */
(function(){
'use strict';
const V=window.CANTIQUE_V13;if(!V)throw Error('Cantique 14.5 world must load first');
const F=V.isKnown,S=V.setKnown;
const k='v145_marloes',asset='./assets/v145_marloes_sprite.webp';
const sprite=new Image();sprite.decoding='async';sprite.src=asset;
const background=new Image();background.src='./assets/v145_marloes_desk_clean.webp';
const live=im=>!!im&&im.complete&&im.naturalWidth>0;
let criedAt=0,relievedAt=0;
const desk=scenes.borreoffice;
desk.npcs=(desk.npcs||[]).filter(x=>x.name!=='Marloes');
desk.hot=(desk.hot||[]).map(h=>{
 if(h.fn==='marloes'){h.rect=[58,164,320,455];h.at=[340,620];}
 return h;
});
function mood(t){
 if(F('v14_comforted'))return 'comforted';
 if(F('v14_noticed')){
  if(!criedAt)criedAt=t||performance.now();
  const age=(t||performance.now())-criedAt;
  return age<1750?'sad':'crying';
 }
 if(F('v14_mugTaken'))return 'surprised';
 if(F('v14_distract'))return 'distracted';
 return 'working';
}
const oldTake=actions.v14TakeMug;
actions.v14TakeMug=function(...args){
 const before=F('v14_mugTaken');
 const result=oldTake?.apply(this,args);
 if(!before&&F('v14_mugTaken')){
  // The player sees a believable startled reaction before Marloes begins to sob.
  criedAt=0;
  setTimeout(()=>{if(F('v14_mugTaken')&&!F('v14_comforted')){
   if(!F('v14_noticed'))S('v14_noticed');
   criedAt=performance.now();
  }},1900);
 }
 return result;
};
const oldMarloes=actions.marloes;
actions.marloes=function(...args){
 const wasComforted=F('v14_comforted');
 const result=oldMarloes?.apply(this,args);
 if(!wasComforted&&F('v14_comforted'))relievedAt=performance.now();
 return result;
};
const mouth=(x,y,mode,t)=>{
 const blink=Math.sin((t||0)/1440)>0.992;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#513129';
 ctx.lineWidth=2.8;
 if(mode==='crying'||mode==='sad'){
  // Eyebrows pointing up and distinct downturned mouth over the actual separate NPC.
  ctx.beginPath();ctx.moveTo(x-26,y-18);ctx.quadraticCurveTo(x-17,y-29,x-8,y-20);
  ctx.moveTo(x+7,y-20);ctx.quadraticCurveTo(x+17,y-29,x+26,y-18);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-11,y+28);ctx.quadraticCurveTo(x,y+15,x+11,y+28);ctx.stroke();
 }else if(mode==='surprised'){
  ctx.beginPath();ctx.ellipse(x,y+24,5,9,0,0,Math.PI*2);
  ctx.fillStyle='#66382e';ctx.fill();
 }else if(mode==='comforted'){
  ctx.beginPath();ctx.moveTo(x-10,y+22);ctx.quadraticCurveTo(x,y+31,x+11,y+21);ctx.stroke();
 }else if(mode==='distracted'){
  ctx.beginPath();ctx.moveTo(x-13,y+22);ctx.quadraticCurveTo(x+5,y+28,x+10,y+22);ctx.stroke();
 }
 if(blink){ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-22,y+3);ctx.lineTo(x-10,y+3);ctx.moveTo(x+10,y+3);ctx.lineTo(x+22,y+3);ctx.stroke();}
 ctx.restore();
};
function drawTear(x,y,phase,a){
 ctx.save();ctx.globalAlpha=a;ctx.beginPath();
 const yy=y+(phase*41)%55;
 ctx.moveTo(x,yy-9);ctx.bezierCurveTo(x-9,yy+5,x-8,yy+14,x,yy+16);
 ctx.bezierCurveTo(x+9,yy+13,x+8,yy+6,x,yy-9);
 ctx.fillStyle='#7bccf2';ctx.fill();
 ctx.beginPath();ctx.ellipse(x-2,yy+4,2,5,0,0,Math.PI*2);
 ctx.fillStyle='#e8fcff';ctx.fill();ctx.restore();
}
function renderMarloes(t){
 if(!live(sprite))return;
 const now=t||0,mode=mood(now);
 const sw=257,sh=423,sx=104,sy=172;
 const bob=mode==='crying'?Math.sin(now/150)*2.4:Math.sin(now/1150)*1.6;
 ctx.save();
 ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=8;ctx.shadowOffsetY=5;
 // A single independent character sprite; scale is locked to the chair and floor.
 ctx.translate(sx+sw/2,sy+sh+bob);
 const turn=mode==='distracted'?-.08:0;
 ctx.rotate(turn);
 ctx.drawImage(sprite,-sw/2,-sh,sw,sh);
 ctx.restore();
 const fx=sx+sw*.51,fy=sy+sh*.17+bob;
 mouth(fx,fy,mode,now);
 if(mode==='crying'){
  drawTear(fx-17,fy+8,now/285,.84);
  drawTear(fx+17,fy+10,now/320,.83);
  drawTear(fx-14,fy+18,now/375,.46);
 }
 if(mode==='sad')drawTear(fx-17,fy+13,now/840,.39);
 if(mode==='comforted'&&performance.now()-relievedAt<3500){
  drawTear(fx-13,fy+23,now/1050,.26);
 }
}
// Transparent dedicated WC prop sprites, not flat CSS labels.
function createSprite(id,w,h,paint){
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const cx=c.getContext('2d');if(!cx)return;
 paint(cx,w,h);
 const img=new Image();img.src=c.toDataURL('image/png');
 images['v13art_'+id]=img;imagePaths['v13art_'+id]=img.src;
}
const ellipse=(c,x,y,w,h,color)=>{
 c.beginPath();c.ellipse(x,y,w,h,0,0,Math.PI*2);c.fillStyle=color;c.fill();
};
createSprite('v145_paper_roll',182,122,c=>{
 c.shadowColor='#0007';c.shadowBlur=8;c.shadowOffsetY=6;
 c.fillStyle='#e6e3d6';c.beginPath();c.roundRect(21,40,133,55,17);c.fill();
 ellipse(c,149,67,29,27,'#faf9ee');ellipse(c,151,67,16,14,'#a7a093');ellipse(c,152,67,7,7,'#4e4b46');
 c.lineWidth=3;c.strokeStyle='#d1cbc0';c.beginPath();c.moveTo(38,43);c.quadraticCurveTo(22,65,39,95);c.stroke();
});
createSprite('v145_paper_strip',420,120,c=>{
 c.shadowColor='#0005';c.shadowBlur=5;c.shadowOffsetY=6;
 c.fillStyle='#e9e8db';c.beginPath();
 c.moveTo(10,79);c.bezierCurveTo(70,9,115,107,170,51);c.bezierCurveTo(235,-3,272,100,411,47);
 c.lineTo(409,75);c.bezierCurveTo(290,123,224,37,176,91);
 c.bezierCurveTo(120,128,74,58,12,104);c.closePath();c.fill();
 c.globalAlpha=.45;c.lineWidth=3;c.strokeStyle='#bfc0b7';
 c.beginPath();c.moveTo(98,49);c.lineTo(100,85);c.moveTo(220,46);c.lineTo(218,82);c.moveTo(315,45);c.lineTo(316,72);c.stroke();
});
createSprite('v145_dirty_tissue',130,105,c=>{
 c.shadowColor='#0008';c.shadowBlur=8;c.shadowOffsetY=4;
 c.fillStyle='#e5e0d4';c.beginPath();c.moveTo(20,63);c.lineTo(35,37);c.lineTo(59,46);c.lineTo(78,21);c.lineTo(98,44);c.lineTo(113,65);c.lineTo(83,91);c.lineTo(49,84);c.closePath();c.fill();
 c.strokeStyle='#aba99b';c.lineWidth=3;c.beginPath();c.moveTo(32,63);c.lineTo(62,68);c.lineTo(78,36);c.moveTo(62,68);c.lineTo(91,77);c.stroke();
});
createSprite('v145_wet_floor',230,93,c=>{
 const grad=c.createRadialGradient(114,46,4,114,46,114);grad.addColorStop(0,'rgba(114,128,117,.32)');grad.addColorStop(.7,'rgba(146,159,156,.19)');grad.addColorStop(1,'rgba(146,159,156,0)');
 ellipse(c,115,48,111,39,grad);ellipse(c,82,42,36,7,'rgba(245,253,253,.32)');
});
const beforeDraw=drawWorld;
drawWorld=function(t){
 // Both Borre and all existing dialogues keep their original scenes and actions.
 if(s.scene!=='borreoffice'&&s.scene!=='restroom')return beforeDraw(t);
 beforeDraw(t);
 const now=Number(t)||0;
 ctx.save();
 if(s.scene==='borreoffice'){
  // Remove the old baked-in Marloes completely: this is a DIFFERENT, real
  // person-free photographic background, committed as a separate WebP asset.
  if(live(background)){
   ctx.clearRect(0,0,960,720);
   ctx.drawImage(background,0,0,960,720);
   // The original photographed lens-shaped mug has to disappear on pickup,
   // independently of its interactive game-sprite.
   if(F('v14_mugTaken')&&!F('v14_comforted')){
    ctx.save();
    ctx.filter='blur(10px)';
    ctx.drawImage(background,592,344,116,156,704,353,118,157);
    ctx.restore();
   }
  }
  renderMarloes(now);
  const mug=V.items.find(it=>it.id==='v14_lensmug');
  if(mug&&(V.isVisible(mug)||F('v14_comforted'))&&live(images['v13art_v14_lensmug']))
   ctx.drawImage(images['v13art_v14_lensmug'],mug.x,mug.y,mug.w,mug.h);
  if(typeof drawPlayer==='function')drawPlayer(now);
  ctx.save();ctx.fillStyle='rgba(12,24,28,.9)';ctx.strokeStyle='rgba(236,211,160,.82)';
  ctx.lineWidth=1.7;ctx.beginPath();ctx.roundRect(793,657,157,44,8);
  ctx.fill();ctx.stroke();ctx.fillStyle='#fff1c8';ctx.textAlign='center';
  ctx.font='bold 18px system-ui';ctx.fillText('🧭 Routes',871,686);ctx.restore();
 }
 if(s.scene==='restroom'&&!F('toiletDone')){
  const im=id=>images['v13art_'+id];
  const prop=(id,x,y,w,h)=>{const p=im(id);if(live(p))ctx.drawImage(p,x,y,w,h)};
  prop('v145_wet_floor',541,594,307,95);
  prop('v145_paper_strip',495,604,232,84);
  prop('v145_paper_roll',606,553,88,70);
  prop('v145_dirty_tissue',748,619,49,48);
  prop('v145_dirty_tissue',849,649,39,32);
  prop('v145_dirty_tissue',557,655,31,28);
 }
 ctx.restore();
};
V.characterTest=()=>({
 marloesSpriteSrc:asset,marloesSpriteReady:live(sprite),
 deskBackgroundReady:live(background),
 emotionStates:['working','distracted','surprised','sad','crying','comforted'],
 marloesIndependent:true,
 marloesDeskScene:!!scenes.borreoffice,
 underdeskWithoutMarloes:(scenes.underdesk?.npcs||[]).every(n=>n.name!=='Marloes'),
 toiletPaperSprites:['v145_paper_roll','v145_paper_strip','v145_dirty_tissue','v145_wet_floor'].every(k=>!!images['v13art_'+k])
});
console.info('CANTIQUE V14.5 animated NPC and WC props loaded',V.characterTest());
})();