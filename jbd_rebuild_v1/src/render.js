(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;
  function entityScale(s){return s.viewport.w<=520?C.render.mobileScale:C.render.desktopScale;}

  function drawExplosion(ctx,x){
    const p=x.t/x.dur,fade=Math.max(0,1-p),r=x.radius*(.22+.78*Math.sin(Math.min(1,p)*Math.PI*.78)),rand=U.mulberry32(x.seed||1);
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<6;i++){const a=rand()*6.28,off=r*(.08+rand()*.28),lr=r*(.32+rand()*.32)*(1-p*.18),lx=x.x+Math.cos(a)*off,ly=x.y+Math.sin(a)*off*.72;const g=ctx.createRadialGradient(lx,ly,0,lx,ly,Math.max(2,lr));g.addColorStop(0,'rgba(255,248,194,.98)');g.addColorStop(.24,'rgba(255,188,70,.94)');g.addColorStop(.62,'rgba(220,84,32,.66)');g.addColorStop(1,'rgba(70,38,26,0)');ctx.globalAlpha=fade*(.46+i*.055);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(lx,ly,lr,lr*(.68+rand()*.18),rand()*3,0,6.28);ctx.fill();}
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=fade*.62;ctx.strokeStyle='#2b251f';ctx.lineWidth=2;for(let i=0;i<7;i++){const a=i*.897+(x.seed%17)*.03,len=r*(.48+rand()*.52);ctx.beginPath();ctx.moveTo(x.x+Math.cos(a)*r*.18,x.y+Math.sin(a)*r*.13);ctx.lineTo(x.x+Math.cos(a+.09)*len,x.y+Math.sin(a+.09)*len*.68);ctx.stroke();}
    if(p>.38){ctx.globalAlpha=Math.min(.38,(p-.38)*.65)*fade;ctx.fillStyle='#34372f';for(let i=0;i<3;i++){const a=rand()*6.28,rr=r*(.18+rand()*.22);ctx.beginPath();ctx.arc(x.x+Math.cos(a)*rr,x.y+Math.sin(a)*rr*.7,r*(.15+rand()*.10),0,6.28);ctx.fill();}}
    ctx.restore();
  }

  function drawBullet(ctx,b){ctx.save();if(b.kind==='mg'){ctx.strokeStyle='rgba(255,226,133,.9)';ctx.lineWidth=1.3;}else if(b.kind==='ap'){ctx.strokeStyle='#bfe6ff';ctx.lineWidth=2;}else{ctx.strokeStyle='#ffb968';ctx.lineWidth=2.4;}ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();if(b.kind==='he'){ctx.fillStyle='#d59a42';ctx.beginPath();ctx.arc(b.x,b.y,3,0,6.28);ctx.fill();}ctx.restore();}
  function drawVehicleShot(ctx,q){ctx.save();ctx.strokeStyle=q.kind==='shell'?'#ffbb6b':'rgba(255,211,110,.82)';ctx.lineWidth=q.kind==='shell'?2.4:1.1;ctx.beginPath();ctx.moveTo(q.px,q.py);ctx.lineTo(q.x,q.y);ctx.stroke();if(q.kind==='shell'){ctx.fillStyle='#f0a84f';ctx.beginPath();ctx.arc(q.x,q.y,2.6,0,6.28);ctx.fill();}ctx.restore();}

  function muzzleStar(ctx,x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='screen';ctx.fillStyle='#ffe49a';ctx.beginPath();ctx.moveTo(0,-7*scale);ctx.lineTo(2.3*scale,-2*scale);ctx.lineTo(7*scale,0);ctx.lineTo(2.3*scale,2*scale);ctx.lineTo(0,7*scale);ctx.lineTo(-2*scale,2*scale);ctx.lineTo(-6*scale,0);ctx.lineTo(-2*scale,-2*scale);ctx.closePath();ctx.fill();ctx.restore();}

  function drawSoldier(ctx,e){
    const sc=entityScale(_state),walk=e.state==='SPRINT_TO_COVER'||e.state==='ADVANCE';let spr;if(e.state==='DEAD')spr=J.Sprites.dead;else if(e.state==='FIRE_FROM_COVER'||e.state==='ENTER_COVER'||e.state==='IN_COVER')spr=J.Sprites.crouch;else spr=J.Sprites.soldier[Math.floor(e.anim*(walk?9:4)+e.phase)%8];ctx.save();ctx.globalAlpha=e.alpha;
    if(e.state==='DEAD'){const t=Math.min(1,e.deathT/.42),rot=e.fallDir*t*1.3;ctx.translate(e.x,e.y);ctx.rotate(rot);ctx.scale(sc,sc*(1-.18*t));ctx.drawImage(spr,-spr.width/2,-spr.height/2);}else{ctx.translate(e.x,e.y);const rot=e.angle+Math.PI/2+(e.hitT>0?e.fallDir*.12:0);ctx.rotate(rot);ctx.scale(sc,sc);if(e.state==='SPRINT_TO_COVER'||e.assaultT>0)ctx.scale(1,1.05);if(e.recoilT>0)ctx.translate(0,e.recoilT*10);ctx.drawImage(spr,-spr.width/2,-spr.height/2);if(e.muzzleT>0)muzzleStar(ctx,4,-21,.48);}ctx.restore();
    if(e.state!=='DEAD'&&sDebug()){ctx.font='8px monospace';ctx.fillStyle='white';ctx.fillText(e.state,e.x-18,e.y-15);}
  }

  let _state=null;function sDebug(){return _state&&_state.debug;}

  function vehicleGunLength(type){return type==='tank'?43:type==='stug'?44:type==='halftrack'?29:type==='technical'?29:0;}
  function drawTrackAnimation(ctx,v){
    const phase=((v.trackPhase%7)+7)%7;ctx.save();ctx.strokeStyle='rgba(191,185,137,.42)';ctx.lineWidth=1;
    if(v.type==='tank'||v.type==='stug'){for(const x of [-27,27])for(let y=-34+phase;y<38;y+=7){ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.stroke();}}
    else if(v.type==='halftrack'){for(const x of [-24,24])for(let y=4+phase;y<37;y+=7){ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.stroke();}}
    ctx.restore();
  }
  function drawWheelAnimation(ctx,v){
    if(v.type!=='technical'&&v.type!=='truck'&&v.type!=='halftrack')return;const pts=v.type==='truck'?[[-29,-35],[29,-35],[-29,28],[29,28]]:v.type==='technical'?[[-24,-25],[24,-25],[-24,29],[24,29]]:[[-27,-30],[27,-30]];ctx.save();ctx.strokeStyle='rgba(205,202,168,.52)';ctx.lineWidth=1.1;for(const [x,y] of pts){ctx.save();ctx.translate(x,y);ctx.rotate(v.wheelPhase);ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(4,0);ctx.moveTo(0,-3);ctx.lineTo(0,3);ctx.stroke();ctx.restore();}ctx.restore();
  }
  function drawVehicle(ctx,v){
    if(v.state==='DEPARTED')return;const atlas=J.Sprites.vehicles[v.type];if(!atlas)return;const sc=entityScale(_state),bob=v.state==='DESTROYED'?0:Math.sin(v.suspension+v.trackPhase*.45)*.65;
    ctx.save();ctx.translate(v.x,v.y+bob);ctx.rotate(v.hullAngle+Math.PI/2);ctx.scale(sc,sc);if(v.state==='DESTROYED')ctx.globalAlpha=.92;ctx.drawImage(atlas.body,-atlas.body.width/2,-atlas.body.height/2);drawTrackAnimation(ctx,v);drawWheelAnimation(ctx,v);
    if(v.state==='DESTROYED'){ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgba(36,28,21,.48)';ctx.beginPath();ctx.ellipse(0,0,v.radius*1.05,v.radius*.82,.2,0,6.28);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(15,15,12,.72)';ctx.beginPath();ctx.arc(v.radius*.22,-v.radius*.16,4.5,0,6.28);ctx.fill();}
    if(v.flash>0){ctx.globalCompositeOperation='screen';ctx.fillStyle=`rgba(255,188,95,${Math.min(.34,v.flash*2.8)})`;ctx.beginPath();ctx.ellipse(0,0,v.radius*1.12,v.radius*.82,0,0,6.28);ctx.fill();ctx.globalCompositeOperation='source-over';}ctx.restore();
    if(atlas.turret){ctx.save();ctx.translate(v.x,v.y+bob);ctx.rotate(v.turretAngle);ctx.scale(sc,sc);if(v.state==='DESTROYED')ctx.globalAlpha=.76;ctx.translate(-v.recoil,0);ctx.drawImage(atlas.turret,-atlas.turret.width/2,-atlas.turret.height/2);if(v.muzzle>0)muzzleStar(ctx,vehicleGunLength(v.type),0,v.type==='tank'||v.type==='stug'?1.05:.55);ctx.restore();}
    if(v.state!=='DESTROYED'&&v.hp<v.maxHp){ctx.save();const w=34*sc,x=v.x-w/2,y=v.y-v.radius*sc-20;ctx.fillStyle='rgba(20,20,16,.68)';ctx.fillRect(x,y,w,3);ctx.fillStyle=v.hp/v.maxHp<.35?'#c36a45':'#c9bc76';ctx.fillRect(x,y,w*U.clamp(v.hp/v.maxHp,0,1),3);ctx.restore();}
    if(sDebug()){ctx.save();ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(`${v.type} ${Math.ceil(v.hp)}`,v.x,v.y-v.radius*sc-25);ctx.restore();}
  }

  function drawCollapsedChutes(ctx,s){
    const sc=entityScale(s);for(const c of s.airborne.collapsed){const a=Math.max(0,1-c.t/c.life);ctx.save();ctx.translate(c.x,c.y+3);ctx.rotate(c.rot);ctx.scale(sc,sc);ctx.globalAlpha=.62*a;ctx.fillStyle='#c7c0a0';ctx.strokeStyle='rgba(67,63,50,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-18,0);ctx.quadraticCurveTo(-8,-6,0,-2);ctx.quadraticCurveTo(10,-8,19,1);ctx.quadraticCurveTo(8,5,-2,3);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(76,72,56,.45)';for(let i=-12;i<=12;i+=8){ctx.beginPath();ctx.moveTo(i,-1);ctx.lineTo(i*.35,5);ctx.stroke();}ctx.restore();}
  }

  function drawPlane(ctx,s){
    const q=s.airborne.plane;if(!q||!q.active)return;const sc=entityScale(s)*.88;ctx.save();ctx.translate(q.x,q.y);ctx.scale(sc,sc);
    ctx.fillStyle='rgba(0,0,0,.19)';ctx.beginPath();ctx.ellipse(-1,8,46,15,0,0,6.28);ctx.fill();
    ctx.fillStyle='#68705a';ctx.strokeStyle='#2d3329';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-34,-6);ctx.lineTo(-7,-6);ctx.lineTo(14,-31);ctx.lineTo(25,-30);ctx.lineTo(13,-5);ctx.lineTo(35,-3);ctx.quadraticCurveTo(45,0,35,3);ctx.lineTo(13,5);ctx.lineTo(25,30);ctx.lineTo(14,31);ctx.lineTo(-7,6);ctx.lineTo(-34,6);ctx.quadraticCurveTo(-45,0,-34,-6);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#7d826a';ctx.beginPath();ctx.roundRect(-38,-6,72,12,6);ctx.fill();ctx.stroke();ctx.fillStyle='#42483a';ctx.beginPath();ctx.moveTo(-35,-4);ctx.lineTo(-48,-17);ctx.lineTo(-41,-18);ctx.lineTo(-25,-5);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(-35,4);ctx.lineTo(-48,17);ctx.lineTo(-41,18);ctx.lineTo(-25,5);ctx.closePath();ctx.fill();
    for(const yy of [-16,16]){ctx.fillStyle='#4a5041';ctx.beginPath();ctx.ellipse(5,yy,8,5,0,0,6.28);ctx.fill();ctx.stroke();ctx.save();ctx.translate(14,yy);ctx.rotate(q.prop);ctx.strokeStyle='rgba(235,229,191,.72)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.stroke();ctx.restore();}
    ctx.fillStyle='#252b24';ctx.fillRect(25,-2,8,4);ctx.restore();
  }

  function drawParatroopers(ctx,s){
    const sc=entityScale(s);for(const p of s.airborne.paratroopers){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(sc,sc);ctx.globalAlpha=p.alpha;
      if(p.state==='DEAD'){ctx.strokeStyle='rgba(198,191,159,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-9,-12);ctx.lineTo(2,-4);ctx.moveTo(9,-12);ctx.lineTo(2,-4);ctx.stroke();ctx.fillStyle='rgba(184,177,145,.55)';ctx.beginPath();ctx.ellipse(0,-14,11,4,.4,Math.PI,Math.PI*2);ctx.fill();}
      else{ctx.fillStyle='#c8c2a5';ctx.strokeStyle='#6d6858';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-19,-14);ctx.quadraticCurveTo(0,-31,19,-14);ctx.quadraticCurveTo(10,-8,0,-9);ctx.quadraticCurveTo(-10,-8,-19,-14);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(75,71,58,.7)';for(const xx of [-14,-7,0,7,14]){ctx.beginPath();ctx.moveTo(xx,-14);ctx.lineTo(xx*.22,-1);ctx.stroke();}}
      ctx.fillStyle='#5f6944';ctx.strokeStyle='#20251b';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-4,-3,8,10,2);ctx.fill();ctx.stroke();ctx.fillStyle='#4b5632';ctx.beginPath();ctx.arc(0,-5,3.8,0,6.28);ctx.fill();ctx.strokeStyle='#22271c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-2,6);ctx.lineTo(-5,11);ctx.moveTo(2,6);ctx.lineTo(5,11);ctx.stroke();ctx.restore();
    }
  }


  function drawBunker(ctx,s){
    const b=s.bunker,spr=J.Sprites.bunker,sc=entityScale(s)*.90;ctx.save();ctx.translate(b.x,b.y);ctx.scale(sc,sc);ctx.drawImage(spr,-spr.width/2,-56);const a=b.aim,recoil=b.recoil;ctx.save();ctx.translate(Math.cos(a)*(-recoil),-9+Math.sin(a)*(-recoil));ctx.rotate(a);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(8,4,C.bunker.barrelLength,5);ctx.fillStyle='#343a36';ctx.strokeStyle='#171b19';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-10,-7,22,14,6);ctx.fill();ctx.stroke();ctx.fillStyle='#4f5651';ctx.fillRect(3,-4,C.bunker.barrelLength,8);ctx.strokeRect(3,-4,C.bunker.barrelLength,8);ctx.fillStyle='#282c29';ctx.fillRect(C.bunker.barrelLength-2,-6,8,12);if(b.muzzle>0){const ms=b.muzzleKind==='mg'?.7:b.muzzleKind==='ap'?1.05:1.25;muzzleStar(ctx,C.bunker.barrelLength+9,0,ms);}ctx.restore();ctx.restore();if(b.flash>0){ctx.fillStyle='rgba(255,90,65,.13)';ctx.beginPath();ctx.arc(b.x,b.y,42*sc,0,6.28);ctx.fill();}
  }


  function drawCrosshair(ctx,s){const x=s.input.x,y=s.input.y,hold=s.input.down?s.input.charge:0;let col='#f1e6b0';if(hold>=C.input.heCharge)col='#ff9a44';else if(hold>=C.input.apCharge)col='#a6dfff';ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.globalAlpha=.82;const rr=9+(hold/C.input.maxCharge)*5;ctx.beginPath();ctx.arc(x,y,rr,0,6.28);ctx.moveTo(x-rr-6,y);ctx.lineTo(x-rr+1,y);ctx.moveTo(x+rr-1,y);ctx.lineTo(x+rr+6,y);ctx.moveTo(x,y-rr-6);ctx.lineTo(x,y-rr+1);ctx.moveTo(x,y+rr-1);ctx.lineTo(x,y+rr+6);ctx.stroke();ctx.restore();}
  function drawCharge(ctx,s){const {w,h}=s.viewport,y=h-s.safe.bottom-57,x=24,bw=w-48,bh=16;ctx.save();ctx.fillStyle='rgba(20,22,18,.86)';ctx.beginPath();ctx.roundRect(x,y,bw,bh,7);ctx.fill();const f=U.clamp(s.input.charge/C.input.maxCharge,0,1),grad=ctx.createLinearGradient(x,0,x+bw,0);grad.addColorStop(0,'#e8d376');grad.addColorStop(C.input.apCharge/C.input.maxCharge,'#e8d376');grad.addColorStop(C.input.apCharge/C.input.maxCharge+.01,'#8fcef2');grad.addColorStop(C.input.heCharge/C.input.maxCharge,'#8fcef2');grad.addColorStop(C.input.heCharge/C.input.maxCharge+.01,'#e97d38');grad.addColorStop(1,'#e97d38');ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(x+2,y+2,(bw-4)*f,bh-4,5);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.18)';ctx.strokeRect(x,y,bw,bh);ctx.font='700 9px system-ui';ctx.textAlign='center';ctx.fillStyle='#e7e4d5';ctx.fillText('BURST',x+bw*.12,y+12);ctx.fillText('AP',x+bw*.40,y+12);ctx.fillText('HE',x+bw*.78,y+12);ctx.restore();}

  function render(s,ctx){
    _state=s;const {w,h,dpr}=s.viewport;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const trauma=s.trauma*s.trauma,shakeX=(Math.random()-.5)*15*trauma,shakeY=(Math.random()-.5)*12*trauma;
    ctx.save();ctx.translate(shakeX,shakeY);ctx.drawImage(s.staticCanvas,0,0,w,h);ctx.drawImage(s.damageCanvas,0,0,w,h);if(s.debug){ctx.strokeStyle='rgba(0,255,255,.35)';for(const c of s.cover){ctx.beginPath();ctx.arc(c.x,c.y,c.radius,0,6.28);ctx.stroke();}}
    drawCollapsedChutes(ctx,s);drawPlane(ctx,s);for(const v of s.vehicles)drawVehicle(ctx,v);drawParatroopers(ctx,s);for(const e of s.enemies)drawSoldier(ctx,e);for(const q of s.vehicleShots)drawVehicleShot(ctx,q);for(const b of s.bullets)if(b.active)drawBullet(ctx,b);for(const e of s.explosions)drawExplosion(ctx,e);J.Particles.render(s,ctx);drawBunker(ctx,s);ctx.restore();drawCrosshair(ctx,s);drawCharge(ctx,s);
    ctx.save();const hy=s.safe.top;ctx.fillStyle='rgba(16,18,14,.72)';ctx.fillRect(0,0,w,hy+38);ctx.font='700 11px system-ui';ctx.fillStyle='#e5e1cc';ctx.fillText('JBD · AIRBORNE CONTACT',12,hy+15);ctx.font='9px system-ui';ctx.fillStyle='#aeb49a';ctx.fillText(`BUNKER ${Math.ceil(s.bunker.hp)}%`,12,hy+29);ctx.textAlign='right';ctx.fillText(`INF ${s.stats.kills} · VEH ${s.stats.vehicleKills} · AIR ${s.stats.airKills}`,w-12,hy+29);ctx.restore();
    if(s.ui.messageT>0){ctx.save();ctx.textAlign='center';ctx.font='800 16px system-ui';ctx.fillStyle='rgba(245,236,205,.94)';ctx.shadowColor='black';ctx.shadowBlur=6;ctx.fillText(s.ui.message,w/2,h*.19);ctx.restore();}if(!s.artillery.finished&&s.mode==='playing'){ctx.save();ctx.textAlign='center';ctx.font='800 15px system-ui';ctx.fillStyle='#e9d8aa';ctx.fillText(s.artillery.t<.42?'DEPLOY':'ARTILLERY INCOMING',w/2,70);ctx.restore();}
    if(s.bunker.flash>0){ctx.save();const a=Math.min(.15,s.bunker.flash*.55),g=ctx.createRadialGradient(w/2,h*.48,w*.2,w/2,h*.48,w*.72);g.addColorStop(0,'rgba(120,10,0,0)');g.addColorStop(1,`rgba(145,24,12,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();}
    if(s.debug){ctx.save();ctx.font='10px monospace';ctx.fillStyle='#fff';ctx.fillText(`${s.fpsSmoothed.toFixed(0)} FPS E:${s.enemies.length} V:${s.vehicles.filter(J.Vehicles.isThreat).length} A:${s.airborne.paratroopers.length} P:${s.particles.filter(p=>p.active).length}`,8,h-86);ctx.fillText(`assault:${s.assault.armed?s.assault.t.toFixed(1):'-'} veh:${s.vehicleWave.index} air:${s.airborne.dropped}/${C.airborne.dropCount}`,8,h-98);ctx.restore();}
  }
  J.Render={render};
})();
