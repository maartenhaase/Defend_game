// JBD v5.7 // FULL FIELD + directional animation pass
(() => {
'use strict';
const V57=window.__JBD57||{};
const TAU=Math.PI*2;
function map57(){return V57.map||{id:'jungle',name:'JUNGLE'}}
function angleLerp(a,b,t){let d=(b-a+Math.PI)%TAU-Math.PI;return a+d*t}
function unitScreenAngle(e){const p=isoAS(e.a,e.s),b=isoAS(77,0);return Math.atan2(b.y-p.y,b.x-p.x)}

const _enemyFireVisual=enemyFire;
enemyFire=function(e){if(e.vehicle){e.recoilT=e.heavy?.22:.13;e.muzzleT=.11}_enemyFireVisual(e)};

const _updateEnemyVisual=updateEnemy;
updateEnemy=function(e,dt){
  const p0=isoAS(e.a,e.s),a0=e.a,s0=e.s;
  _updateEnemyVisual(e,dt);
  const p1=isoAS(e.a,e.s),dx=p1.x-p0.x,dy=p1.y-p0.y,spd=Math.hypot(dx,dy);
  if(spd>.015){const want=Math.atan2(dy,dx);e.facing=angleLerp(e.facing??want,want,1-Math.exp(-dt*11));e.trackPhase=(e.trackPhase||0)+spd*.55}
  else if(!e.vehicle&&e.mode==='fire'){const want=unitScreenAngle(e);e.facing=angleLerp(e.facing??want,want,1-Math.exp(-dt*8))}
  if(e.vehicle){const want=unitScreenAngle(e);e.turretAngle=angleLerp(e.turretAngle??want,want,1-Math.exp(-dt*(e.heavy?2.7:4.6)));if(e.recoilT>0)e.recoilT=Math.max(0,e.recoilT-dt);if(e.muzzleT>0)e.muzzleT=Math.max(0,e.muzzleT-dt)}
  if(a0===e.a&&s0===e.s&&e.facing===undefined)e.facing=Math.PI/2;
};

function playBottom(){return H-(PORTRAIT?Math.min(126,Math.max(106,H*.165)):112)}
function themeColors(){const id=map57().id;if(id==='polar')return{g1:'#c9d6d2',g2:'#9eafab',line:'#e7efec',road:'#7b8078',road2:'#a1a69e',river:'#527e88',bank:'#789a99'};if(id==='desert')return{g1:'#9b7a48',g2:'#c1a166',line:'#d9bd82',road:'#705638',road2:'#96734a',river:'#426e6d',bank:'#725c3f'};return{g1:'#38543b',g2:'#617652',line:'#758a61',road:'#574431',road2:'#806344',river:'#315d58',bank:'#29493c'}}
function pathWorld(points,width,col,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=width;ctx.beginPath();let p=isoAS(points[0][0],points[0][1]);ctx.moveTo(p.x,p.y);for(let i=1;i<points.length;i++){p=isoAS(points[i][0],points[i][1]);ctx.lineTo(p.x,p.y)}ctx.stroke();ctx.restore()}

drawGround=function(){
  const c=themeColors(),bottom=playBottom(),grad=ctx.createLinearGradient(0,0,0,bottom);grad.addColorStop(0,c.g1);grad.addColorStop(1,c.g2);ctx.fillStyle=grad;ctx.fillRect(0,0,W,bottom);
  ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle=c.line;ctx.lineWidth=1;for(let y=14;y<bottom;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y+Math.sin(y*.13)*2);ctx.stroke()}for(let x=15;x<W;x+=32){ctx.globalAlpha=.07;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+Math.sin(x)*3,bottom);ctx.stroke()}ctx.restore();
  for(const bs of RIVER.bridges){pathWorld([[-103,clamp(bs+(bs<0?-12:12),-46,46)],[-66,bs+(bs<0?-5:5)],[RIVER.a-9,bs],[RIVER.a+9,bs],[34,bs*.58],[77,0]],PORTRAIT?11:18,c.road,.66);pathWorld([[-103,clamp(bs+(bs<0?-12:12),-46,46)],[-66,bs+(bs<0?-5:5)],[RIVER.a-9,bs],[RIVER.a+9,bs],[34,bs*.58],[77,0]],PORTRAIT?6:11,c.road2,.48)}
  const y1=isoAS(RIVER.a-RIVER.half,0).y,y2=isoAS(RIVER.a+RIVER.half,0).y,ry=Math.min(y1,y2),rh=Math.abs(y2-y1);ctx.fillStyle=c.bank;ctx.fillRect(0,ry-3,W,rh+6);ctx.fillStyle=c.river;ctx.fillRect(0,ry,W,rh);
  const tm=performance.now()/800;ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle='#d9eee4';for(let x=-20;x<W+20;x+=38){const yy=ry+rh*.5+Math.sin(tm+x*.04)*rh*.18;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+18,yy+1);ctx.stroke()}ctx.restore();
  for(const bs of RIVER.bridges){const p=isoAS(RIVER.a,bs),bw=PORTRAIT?27:38,bh=rh+10;ctx.fillStyle='#382d22aa';ctx.fillRect(p.x-bw/2,p.y-bh/2+3,bw,bh);ctx.fillStyle='#8b6d48';ctx.fillRect(p.x-bw/2,p.y-bh/2,bw,bh);ctx.strokeStyle='#4b3827';ctx.lineWidth=1;for(let y=p.y-bh/2+3;y<p.y+bh/2;y+=5){ctx.beginPath();ctx.moveTo(p.x-bw/2,y);ctx.lineTo(p.x+bw/2,y);ctx.stroke()}ctx.strokeStyle='#b99a68';ctx.strokeRect(p.x-bw/2,p.y-bh/2,bw,bh)}
  const by=isoAS(77,0).y;ctx.fillStyle='#18211922';ctx.fillRect(0,by+15,W,Math.max(0,bottom-by-15));ctx.strokeStyle='#d6c98b33';ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(0,by+13);ctx.lineTo(W,by+13);ctx.stroke();ctx.setLineDash([]);
  const vign=ctx.createRadialGradient(W*.5,bottom*.46,Math.min(W,bottom)*.12,W*.5,bottom*.46,Math.max(W,bottom)*.68);vign.addColorStop(0,'#0000');vign.addColorStop(1,'#07100b88');ctx.fillStyle=vign;ctx.fillRect(0,0,W,bottom);
};

function hullShadow(sc=1){ellipse(1,5,18*sc,7*sc,'#0b100d66')}
function trackMarks(phase,len=27,w=4,col='#28302c'){for(let x=-len/2;x<len/2;x+=5){const off=((phase||0)%5);rr(x+off,-w/2,3,w,1,col)}}

drawVehicle=function(e,p,scale=1){
  const facing=e.facing??Math.PI/2,body=e.heavy?'#66716b':e.type==='truck'||e.type==='engineertruck'?'#52694e':'#59685a',dark='#18201c',metal='#87918b',phase=e.trackPhase||0;
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(facing);ctx.scale(scale,scale);hullShadow();
  if(e.type==='motorcycle'){
    circle(-8,0,3.3,'#151b18','#090d0b',1);circle(8,0,3.3,'#151b18','#090d0b',1);line(-7,0,1,-1,2,metal);line(1,-1,8,0,2,metal);line(0,-1,5,-4,1.5,dark);ellipse(-1,-3,4,2,body,dark,1);circle(1,-6,2.3,C.skin,dark,1);line(-2,-2,-5,2,1.5,body);line(2,-2,5,2,1.5,body);ctx.restore();return
  }
  if(e.type==='truck'||e.type==='engineertruck'){
    circle(-10,-7,3.1,dark);circle(10,-7,3.1,dark);circle(-10,7,3.1,dark);circle(10,7,3.1,dark);rr(-15,-8,25,16,3,body,dark,1.3);poly([[10,-8],[17,-5],[17,5],[10,8]],'#748173',dark,1.1);rr(9,-4,5,8,1,'#273c36',null);if(e.type==='engineertruck')rr(-12,-6,6,3,1,C.gold,dark,.8);ctx.restore();return
  }
  if(e.type==='technical'){
    circle(-9,-7,3,dark);circle(9,-7,3,dark);circle(-9,7,3,dark);circle(9,7,3,dark);rr(-13,-8,27,16,3,body,dark,1.2);rr(4,-6,7,12,2,'#758078',dark,1);circle(-2,0,3,metal,dark,1);ctx.save();ctx.translate(-2,0);const rel=(e.turretAngle??facing)-facing;ctx.rotate(rel);line(0,0,15,0,2.2,dark);ctx.restore();ctx.restore();return
  }
  rr(-16,-10,32,5,2,'#222a26',dark,1);rr(-16,5,32,5,2,'#222a26',dark,1);ctx.save();ctx.translate(0,-7.5);trackMarks(phase,30,3.5,'#657069');ctx.restore();ctx.save();ctx.translate(0,7.5);trackMarks(phase,30,3.5,'#657069');ctx.restore();
  if(e.type==='halftrack'||e.type==='apc')poly([[-14,-7],[10,-7],[16,-3],[16,3],[10,7],[-14,7]],body,dark,1.4);else poly([[-15,-7],[11,-7],[16,-4],[16,4],[11,7],[-15,7]],body,dark,1.5);
  const turret=(e.turretAngle??facing)-facing,recoil=(e.recoilT||0)>0?3*((e.recoilT||0)/.22):0;
  if(e.heavy||e.type==='apc'||e.type==='halftrack'){
    ctx.save();ctx.rotate(turret);if(e.heavy){ellipse(1,0,e.type==='tank'?7:6,e.type==='tank'?5:4.5,metal,dark,1.2);rr(2,-2,11,4,1,metal,dark,1);line(8-recoil,0,25-recoil,0,e.type==='tank'?3:2.5,dark)}else{circle(1,0,4,metal,dark,1);line(3,0,14,0,1.8,dark)}if(e.muzzleT>0){circle(27-recoil,0,4,'#ffc85c99');circle(29-recoil,0,2,'#fff0a777')}ctx.restore()
  }
  ctx.restore();
};

function soldierBody(e,body,gear){
  const walk=e.walk||0,move=e.mode==='move'||e.action==='sprint',st=move?Math.sin(walk)*3.2:0,crouch=e.action==='duck'||e.action==='kneel'||e.stance==='crouch';
  ellipse(0,3,5,2,'#0b100d55');if(e.swimming){ellipse(-4,1,9,2,'#b9d8cc44');circle(2,0,2.4,C.skin,'#1c251f',1);line(-1,1,-7-st,3,1.6,body);line(2,1,8+st,3,1.6,body);return}
  if(crouch){circle(1,-2,2.5,C.skin,'#1c251f',.8);rr(-3,0,7,6,2,body,'#1c251f',.8);line(-1,5,-5,9,1.8,body);line(2,5,6,8,1.8,body)}else{circle(1,-5,2.5,C.skin,'#1c251f',.8);rr(-3,-2,7,8,2,body,'#1c251f',.8);line(-1,5,-4-st,11,1.9,body);line(2,5,5+st,11,1.9,body)}rr(-1,-7,5,2,1,gear,'#1c251f',.7)
}

drawSoldier=function(e,p,scale=1){
  const pal=soldierPalette(e),body=pal[0],gear=pal[1],facing=e.facing??Math.PI/2,aim=e.mode==='fire'?unitScreenAngle(e):facing;
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(facing);ctx.scale(scale,scale);soldierBody(e,body,gear);
  if(e.swimming){ctx.restore();return}
  const rel=aim-facing;ctx.save();ctx.rotate(rel);const recoil=e.action==='fire'?2:0;
  if(e.action==='reload'){line(-1,0,3,3,1.8,body);line(2,0,5,3,1.8,body);line(0,1,8,5,1.8,'#222923');rr(3,3,2,3,1,'#68716a')}else if(e.action==='signal'){line(0,0,-3,-9,1.8,body);line(-3,-9,-2,-14,1.5,C.skin);line(1,0,5,2,1.8,body);line(1,-1,(e.type==='mg'?14:11)-recoil,-1,2,'#222923')}else{line(-1,0,4,-2,1.8,body);line(2,0,5,1,1.8,body);line(1,-1,(e.type==='mg'?14:11)-recoil,-1,2,'#222923')}ctx.restore();ctx.restore();
};

const _drawEnemyDir=drawEnemy;
drawEnemy=function(e){_drawEnemyDir(e)};

resize();
window.__JBD57VIS={version:'5.7',directional:true};
})();
