(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;
  let _state=null;
  const baseScale=s=>s.viewport.w<=520?C.render.mobileScale:C.render.desktopScale;
  const sDebug=()=>_state&&_state.debug;

  function drawRangeField(ctx,s){
    return;
    const {w,h}=s.viewport;
    ctx.save();
    const haze=ctx.createLinearGradient(0,35,0,h*.46);
    haze.addColorStop(0,'rgba(218,221,189,.15)');haze.addColorStop(.48,'rgba(188,194,157,.06)');haze.addColorStop(1,'rgba(160,165,136,0)');
    ctx.fillStyle=haze;ctx.fillRect(0,38,w,h*.48);
    const marks=[[.08,'800m'],[.50,'400m'],[.82,'150m']];
    ctx.font='700 7px ui-monospace,monospace';ctx.textAlign='left';
    for(const [q,label] of marks){
      const y=52+(s.bunker.y-106)*q;
      ctx.strokeStyle='rgba(235,231,196,.07)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(8,y);ctx.lineTo(w-8,y);ctx.stroke();
      ctx.fillStyle='rgba(235,231,196,.24)';ctx.fillText(label,10,y-3);
    }
    ctx.restore();
  }

  function drawExplosion(ctx,s,x){
    const vis=J.Scale.effect(s,x.y),p=x.t/x.dur,fade=Math.max(0,1-p),r=x.radius*vis*(.22+.78*Math.sin(Math.min(1,p)*Math.PI*.78)),rand=U.mulberry32(x.seed||1);
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<5;i++){const a=rand()*6.28,off=r*(.08+rand()*.25),lr=Math.max(2,r*(.28+rand()*.30)*(1-p*.18)),lx=x.x+Math.cos(a)*off,ly=x.y+Math.sin(a)*off*.72;const g=ctx.createRadialGradient(lx,ly,0,lx,ly,lr);g.addColorStop(0,'rgba(255,248,194,.98)');g.addColorStop(.27,'rgba(255,188,70,.9)');g.addColorStop(.65,'rgba(220,84,32,.58)');g.addColorStop(1,'rgba(70,38,26,0)');ctx.globalAlpha=fade*(.52+i*.05);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(lx,ly,lr,lr*.72,rand()*3,0,6.28);ctx.fill();}
    ctx.restore();
  }

  function drawBullet(ctx,s,b){
    const sc=Math.max(.34,J.Scale.effect(s,b.y));ctx.save();
    ctx.strokeStyle=b.kind==='mg'?'rgba(255,226,133,.88)':b.kind==='ap'?'#bfe6ff':'#ffb968';ctx.lineWidth=(b.kind==='mg'?1.0:b.kind==='ap'?1.5:1.8)*sc;
    ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();
    if(b.kind==='he'){ctx.fillStyle='#d59a42';ctx.beginPath();ctx.arc(b.x,b.y,Math.max(1,2.3*sc),0,6.28);ctx.fill();}ctx.restore();
  }
  function drawVehicleShot(ctx,s,q){const sc=Math.max(.34,J.Scale.effect(s,q.y));ctx.save();ctx.strokeStyle=q.kind==='shell'?'#ffbb6b':'rgba(255,211,110,.82)';ctx.lineWidth=(q.kind==='shell'?1.9:.9)*sc;ctx.beginPath();ctx.moveTo(q.px,q.py);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.restore();}
  function muzzleStar(ctx,x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='screen';ctx.fillStyle='#ffe49a';ctx.beginPath();ctx.moveTo(0,-7*scale);ctx.lineTo(2.3*scale,-2*scale);ctx.lineTo(7*scale,0);ctx.lineTo(2.3*scale,2*scale);ctx.lineTo(0,7*scale);ctx.lineTo(-2*scale,2*scale);ctx.lineTo(-6*scale,0);ctx.lineTo(-2*scale,-2*scale);ctx.closePath();ctx.fill();ctx.restore();}

  function drawFarInfantry(ctx,e,sc){
    ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle-Math.PI/2);ctx.globalAlpha=e.alpha;
    ctx.strokeStyle='#283023';ctx.lineWidth=Math.max(.65,1.2*sc*4);ctx.beginPath();ctx.moveTo(0,2);ctx.lineTo(0,-4);ctx.stroke();ctx.fillStyle='#171d18';ctx.beginPath();ctx.arc(0,-4.6,Math.max(.75,1.2*sc*4),0,6.28);ctx.fill();ctx.restore();
  }
  function drawMidInfantry(ctx,e,sc){
    ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle+Math.PI/2);ctx.scale(sc*2.25,sc*2.25);ctx.globalAlpha=e.alpha;
    ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(0,5,5,2,0,0,6.28);ctx.fill();
    ctx.fillStyle='#53603d';ctx.strokeStyle='#1c211a';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,4.5,6.5,0,0,6.28);ctx.fill();ctx.stroke();ctx.fillStyle='#404b31';ctx.beginPath();ctx.ellipse(0,-5,4.6,4,0,0,6.28);ctx.fill();ctx.stroke();ctx.strokeStyle='#25291f';ctx.beginPath();ctx.moveTo(2,-1);ctx.lineTo(3,-10);ctx.stroke();ctx.restore();
  }
  function drawSwimmer(ctx,e,sc){
    const phase=e.anim*5,reach=(5+Math.cos(phase)*2.2)*Math.max(.75,sc*2.4);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle+Math.PI/2);ctx.globalAlpha=e.alpha;
    ctx.strokeStyle='rgba(205,234,238,.62)';ctx.lineWidth=Math.max(.7,sc*1.5);ctx.beginPath();ctx.ellipse(0,3,10*sc*2.2,3.7*sc*2.2,0,0,6.28);ctx.stroke();ctx.beginPath();ctx.ellipse(0,8,6*sc*2.1,2.2*sc*2.1,0,0,6.28);ctx.stroke();
    ctx.strokeStyle='#657046';ctx.lineWidth=Math.max(1.1,sc*4.1);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-1,1);ctx.lineTo(-reach,5+Math.sin(phase)*2);ctx.stroke();ctx.beginPath();ctx.moveTo(1,1);ctx.lineTo(reach,5-Math.sin(phase)*2);ctx.stroke();
    ctx.fillStyle='#586342';ctx.beginPath();ctx.ellipse(0,1,Math.max(1.8,3.5*sc*2),Math.max(2.5,5*sc*2),0,0,6.28);ctx.fill();ctx.fillStyle='#4a5635';ctx.strokeStyle='#20241d';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(0,-4*sc*2,Math.max(1.7,3.4*sc*2),0,6.28);ctx.fill();ctx.stroke();ctx.restore();
  }

  function drawEmplacement(ctx,e){
    const p=J.Scale.progress(_state,e.y);if(p<.48)return;const sc=J.Scale.entity(_state,e.y,'infantry')*.82,spr=J.Sprites.emplacement;
    ctx.save();ctx.translate(e.x,e.y+3);ctx.rotate(e.angle+Math.PI/2);ctx.scale(sc,sc);ctx.drawImage(spr,-spr.width/2,-spr.height/2);if(e.muzzleT>0)muzzleStar(ctx,18,-2,.55);ctx.restore();
  }

  function drawSoldier(ctx,e){
    const s=_state,p=J.Scale.progress(s,e.y),sc=J.Scale.entity(s,e.y,'infantry');
    if(e.mountedWeapon||e.state==='DEPLOY_WEAPON')drawEmplacement(ctx,e);
    if(e.inWater){drawSwimmer(ctx,e,sc);return;}
    if(e.state!=='DEAD'&&p<.23){drawFarInfantry(ctx,e,sc);return;}
    if(e.state!=='DEAD'&&p<.48){drawMidInfantry(ctx,e,sc);return;}
    let spr,rot=0;
    if(e.state==='DEAD')spr=e.deathPose==='side'?J.Sprites.deadSide:J.Sprites.deadFront;
    else if(e.pose==='prone')spr=J.Sprites.prone[Math.floor(e.anim*7)%J.Sprites.prone.length];
    else if(e.pose==='crouch')spr=J.Sprites.crouch[Math.floor(e.anim*5)%J.Sprites.crouch.length];
    else if(e.pose==='fire'&&J.Sprites.fire?.length)spr=J.Sprites.fire[Math.floor(e.anim*4)%J.Sprites.fire.length];
    else if(e.pose==='stand'&&J.Sprites.stand?.length)spr=J.Sprites.stand[Math.floor(e.anim*4)%J.Sprites.stand.length];
    else spr=J.Sprites.walk[Math.floor(e.anim*9)%J.Sprites.walk.length];
    ctx.save();ctx.globalAlpha=e.alpha;ctx.translate(e.x,e.y);
    if(e.state==='DEAD'){ctx.scale(sc,sc);ctx.drawImage(spr,-spr.width/2,-spr.height/2);}
    else{rot=(e.state==='FIRE_FROM_WEAPON'||e.state==='DEPLOY_WEAPON')?0:e.angle+Math.PI/2+(e.hitT>0?e.fallDir*.08:0);ctx.rotate(rot);ctx.scale(sc,sc);if(e.recoilT>0)ctx.translate(0,e.recoilT*8);ctx.drawImage(spr,-spr.width/2,-spr.height/2);if(e.muzzleT>0&&!(e.mountedWeapon||e.state==='DEPLOY_WEAPON'))muzzleStar(ctx,3,-18,.40);}
    ctx.restore();
    if(e.state!=='DEAD'&&sDebug()){ctx.font='7px monospace';ctx.fillStyle='white';ctx.fillText(`${e.state} ${J.Scale.distanceMeters(s,e.y)}m`,e.x-25,e.y-12);}
  }

  function drawDustContact(ctx,v,p){
    const t=_state.simTime,id=v.id%97,base=J.Scale.entity(_state,v.y,'vehicle');ctx.save();ctx.globalAlpha=v.state==='DESTROYED'?.55:.70;
    const trail=Math.max(4,15*base*3.6);for(let i=0;i<5;i++){const ph=t*.7+i*1.7+id*.13,dx=Math.sin(ph)*trail*.45,dy=9+i*4+Math.cos(ph*.8)*2,r=Math.max(2.6,(7+i*1.9)*base*3.0);ctx.fillStyle=`rgba(126,103,66,${.26-i*.026})`;ctx.beginPath();ctx.ellipse(v.x+dx,v.y+dy,r*1.35,r*.70,0,0,6.28);ctx.fill();}
    if(p>.12&&p<.22&&v.state!=='DESTROYED'){ctx.fillStyle='rgba(36,39,31,.46)';ctx.beginPath();ctx.ellipse(v.x,v.y,Math.max(1.1,base*4.2),Math.max(.8,base*2.3),v.hullAngle,0,6.28);ctx.fill();}
    ctx.restore();
  }
  function drawVehicleSilhouette(ctx,v,sc){
    const heavy=v.type==='tank'||v.type==='stug',truck=v.type==='truck';ctx.save();ctx.translate(v.x,v.y);ctx.rotate(v.hullAngle+Math.PI/2);ctx.scale(sc*2.3,sc*2.3);ctx.globalAlpha=v.state==='DESTROYED'?.72:.88;ctx.fillStyle=v.state==='DESTROYED'?'#2f2b24':'#353d31';ctx.strokeStyle='#1c211b';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(heavy?-7:-6,truck?-9:-7,heavy?14:12,truck?18:14,2);ctx.fill();ctx.stroke();if(heavy){ctx.fillStyle='#242a22';ctx.beginPath();ctx.ellipse(0,-1,5,4,0,0,6.28);ctx.fill();ctx.fillRect(-1,-10,2,9);}ctx.restore();
  }
  function vehicleGunLength(type){return type==='tank'?43:type==='stug'?44:type==='halftrack'?29:type==='technical'?29:0;}
  function drawTrackAnimation(ctx,v){const phase=((v.trackPhase%7)+7)%7;ctx.save();ctx.strokeStyle='rgba(191,185,137,.42)';ctx.lineWidth=1;if(v.type==='tank'||v.type==='stug'){for(const x of [-27,27])for(let y=-34+phase;y<38;y+=7){ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.stroke();}}else if(v.type==='halftrack'){for(const x of [-24,24])for(let y=4+phase;y<37;y+=7){ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.stroke();}}ctx.restore();}
  function drawWheelAnimation(ctx,v){if(v.type!=='technical'&&v.type!=='truck'&&v.type!=='halftrack')return;const pts=v.type==='truck'?[[-29,-35],[29,-35],[-29,28],[29,28]]:v.type==='technical'?[[-24,-25],[24,-25],[-24,29],[24,29]]:[[-27,-30],[27,-30]];ctx.save();ctx.strokeStyle='rgba(205,202,168,.52)';ctx.lineWidth=1.1;for(const [x,y] of pts){ctx.save();ctx.translate(x,y);ctx.rotate(v.wheelPhase);ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(4,0);ctx.moveTo(0,-3);ctx.lineTo(0,3);ctx.stroke();ctx.restore();}ctx.restore();}
  function drawVehicle(ctx,v){
    if(v.state==='DEPARTED')return;const atlas=J.Sprites.vehicles[v.type];if(!atlas)return;const p=J.Scale.progress(_state,v.y),sc=J.Scale.entity(_state,v.y,'vehicle');
    if(p<C.scale.silhouetteRevealEnd)drawDustContact(ctx,v,p);
    if(p<C.scale.dustRevealEnd){if(v.state==='DESTROYED')drawVehicleSilhouette(ctx,v,sc);return;}
    if(p<C.scale.silhouetteRevealEnd){drawVehicleSilhouette(ctx,v,sc);return;}
    const bob=v.state==='DESTROYED'?0:Math.sin(v.suspension+v.trackPhase*.45)*.45;
    ctx.save();ctx.translate(v.x,v.y+bob);ctx.rotate(v.hullAngle+Math.PI/2);ctx.scale(sc,sc);if(v.state==='DESTROYED')ctx.globalAlpha=.92;ctx.drawImage(atlas.body,-atlas.body.width/2,-atlas.body.height/2);drawTrackAnimation(ctx,v);drawWheelAnimation(ctx,v);ctx.restore();
    if(atlas.turret){ctx.save();ctx.translate(v.x,v.y+bob);ctx.rotate(v.turretAngle);ctx.scale(sc,sc);if(v.state==='DESTROYED')ctx.globalAlpha=.76;ctx.translate(-v.recoil,0);ctx.drawImage(atlas.turret,-atlas.turret.width/2,-atlas.turret.height/2);if(v.muzzle>0)muzzleStar(ctx,vehicleGunLength(v.type),0,v.type==='tank'||v.type==='stug'?1.0:.5);ctx.restore();}
    if(v.state!=='DESTROYED'&&v.hp<v.maxHp&&p>.72){ctx.save();const w=28*sc,x=v.x-w/2,y=v.y-v.radius*sc-10;ctx.fillStyle='rgba(20,20,16,.68)';ctx.fillRect(x,y,w,2);ctx.fillStyle=v.hp/v.maxHp<.35?'#c36a45':'#c9bc76';ctx.fillRect(x,y,w*U.clamp(v.hp/v.maxHp,0,1),2);ctx.restore();}
    if(sDebug()){ctx.save();ctx.font='7px monospace';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(`${v.type} ${J.Scale.distanceMeters(_state,v.y)}m`,v.x,v.y-12);ctx.restore();}
  }

  function drawCollapsedChutes(ctx,s){for(const c of s.airborne.collapsed){const sc=J.Scale.entity(s,c.y,'air'),a=Math.max(0,1-c.t/c.life);ctx.save();ctx.translate(c.x,c.y+3);ctx.rotate(c.rot);ctx.scale(sc,sc);ctx.globalAlpha=.62*a;ctx.fillStyle='#c7c0a0';ctx.beginPath();ctx.ellipse(0,0,18,5,.1,0,6.28);ctx.fill();ctx.restore();}}
  function drawPlane(ctx,s){const q=s.airborne.plane;if(!q||!q.active)return;const sc=J.Scale.entity(s,q.y,'air')*.9;ctx.save();ctx.translate(q.x,q.y);ctx.scale(sc,sc);ctx.fillStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.ellipse(-1,8,46,15,0,0,6.28);ctx.fill();ctx.fillStyle='#68705a';ctx.strokeStyle='#2d3329';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-34,-6);ctx.lineTo(-7,-6);ctx.lineTo(14,-31);ctx.lineTo(25,-30);ctx.lineTo(13,-5);ctx.lineTo(35,-3);ctx.quadraticCurveTo(45,0,35,3);ctx.lineTo(13,5);ctx.lineTo(25,30);ctx.lineTo(14,31);ctx.lineTo(-7,6);ctx.lineTo(-34,6);ctx.quadraticCurveTo(-45,0,-34,-6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#7d826a';ctx.beginPath();ctx.roundRect(-38,-6,72,12,6);ctx.fill();ctx.stroke();for(const yy of [-16,16]){ctx.fillStyle='#4a5041';ctx.beginPath();ctx.ellipse(5,yy,8,5,0,0,6.28);ctx.fill();ctx.save();ctx.translate(14,yy);ctx.rotate(q.prop);ctx.strokeStyle='rgba(235,229,191,.72)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.stroke();ctx.restore();}ctx.restore();}
  function drawParatroopers(ctx,s){for(const p of s.airborne.paratroopers){const sc=J.Scale.entity(s,p.y,'air');ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(sc,sc);ctx.globalAlpha=p.alpha;ctx.fillStyle='#c8c2a5';ctx.strokeStyle='#6d6858';ctx.beginPath();ctx.moveTo(-19,-14);ctx.quadraticCurveTo(0,-31,19,-14);ctx.quadraticCurveTo(0,-7,-19,-14);ctx.fill();ctx.stroke();ctx.fillStyle='#5f6944';ctx.beginPath();ctx.roundRect(-4,-3,8,10,2);ctx.fill();ctx.restore();}}

  function drawBunker(ctx,s){
    const b=s.bunker,spr=J.Sprites.bunker,sc=Math.max(baseScale(s)*1.18,.50),profile=s.profile||{};ctx.save();ctx.translate(b.x,b.y);ctx.scale(sc,sc);ctx.drawImage(spr,-spr.width/2,-56);
    if((profile.sandbags||0)>0){ctx.fillStyle='#9b8a60';ctx.strokeStyle='#5b5038';ctx.lineWidth=1;const rows=Math.min(4,profile.sandbags);for(let r=0;r<rows;r++){for(let i=0;i<6+r;i++){const xx=-34+i*12-r*6,yy=4-r*7;ctx.beginPath();ctx.roundRect(xx,yy,11,7,3);ctx.fill();ctx.stroke();}}}
    const a=b.aim,recoil=b.recoil,barrel=profile.barrelLength||C.bunker.barrelLength;ctx.save();ctx.translate(Math.cos(a)*(-recoil),-9+Math.sin(a)*(-recoil));ctx.rotate(a);ctx.fillStyle='#4f5651';ctx.strokeStyle='#171b19';ctx.lineWidth=2;ctx.fillRect(3,-3.4,barrel,6.8);ctx.strokeRect(3,-3.4,barrel,6.8);ctx.beginPath();ctx.roundRect(-10,-7,22,14,6);ctx.fill();ctx.stroke();if(b.muzzle>0)muzzleStar(ctx,barrel+9,0,b.muzzleKind==='mg'?.65:b.muzzleKind==='ap'?.95:1.12);ctx.restore();ctx.restore();
  }

  function drawCrosshair(ctx,s){const x=s.input.x,y=s.input.y,hold=s.input.down?s.input.charge:0;let col='#f1e6b0';if(hold>=C.input.heCharge)col='#ff9a44';else if(hold>=C.input.apCharge)col='#a6dfff';ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.25;ctx.globalAlpha=.82;const rr=8+(hold/C.input.maxCharge)*4;ctx.beginPath();ctx.arc(x,y,rr,0,6.28);ctx.moveTo(x-rr-5,y);ctx.lineTo(x-rr+1,y);ctx.moveTo(x+rr-1,y);ctx.lineTo(x+rr+5,y);ctx.moveTo(x,y-rr-5);ctx.lineTo(x,y-rr+1);ctx.moveTo(x,y+rr-1);ctx.lineTo(x,y+rr+5);ctx.stroke();ctx.restore();}
  function drawCharge(ctx,s){const {w,h}=s.viewport,y=h-s.safe.bottom-53,x=28,bw=w-56,bh=13;ctx.save();ctx.fillStyle='rgba(20,22,18,.84)';ctx.beginPath();ctx.roundRect(x,y,bw,bh,6);ctx.fill();const f=U.clamp(s.input.charge/C.input.maxCharge,0,1),grad=ctx.createLinearGradient(x,0,x+bw,0);grad.addColorStop(0,'#e8d376');grad.addColorStop(.32,'#e8d376');grad.addColorStop(.33,'#8fcef2');grad.addColorStop(.62,'#8fcef2');grad.addColorStop(.63,'#e97d38');grad.addColorStop(1,'#e97d38');ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(x+2,y+2,(bw-4)*f,bh-4,4);ctx.fill();ctx.font='700 8px system-ui';ctx.textAlign='center';ctx.fillStyle='#e7e4d5';ctx.fillText('BURST',x+bw*.12,y+10);ctx.fillText('AP',x+bw*.42,y+10);ctx.fillText('HE',x+bw*.80,y+10);ctx.restore();}

  function render(s,ctx){
    _state=s;const {w,h,dpr}=s.viewport;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const trauma=s.trauma*s.trauma,shakeX=(Math.random()-.5)*10*trauma,shakeY=(Math.random()-.5)*8*trauma;
    ctx.save();ctx.translate(shakeX,shakeY);ctx.drawImage(s.staticCanvas,0,0,w,h);ctx.drawImage(s.damageCanvas,0,0,w,h);drawRangeField(ctx,s);
    if(s.debug){ctx.strokeStyle='rgba(0,255,255,.20)';for(const c of s.cover){ctx.beginPath();ctx.arc(c.x,c.y,c.radius,0,6.28);ctx.stroke();}}
    drawCollapsedChutes(ctx,s);drawPlane(ctx,s);for(const v of s.vehicles)drawVehicle(ctx,v);drawParatroopers(ctx,s);for(const e of s.enemies)drawSoldier(ctx,e);for(const q of s.vehicleShots)drawVehicleShot(ctx,s,q);for(const b of s.bullets)if(b.active)drawBullet(ctx,s,b);for(const e of s.explosions)drawExplosion(ctx,s,e);J.Particles.render(s,ctx);drawBunker(ctx,s);ctx.restore();
    drawCrosshair(ctx,s);drawCharge(ctx,s);
    ctx.save();const hy=s.safe.top;ctx.fillStyle='rgba(16,18,14,.72)';ctx.fillRect(0,0,w,hy+43);ctx.font='700 11px system-ui';ctx.fillStyle='#e5e1cc';ctx.fillText(`JBD · LONG FRONT · ${s.scenario?.label||''}`,12,hy+15);ctx.font='9px system-ui';ctx.fillStyle='#aeb49a';ctx.fillText(`BUNKER ${Math.ceil(s.bunker.hp)}/${Math.ceil(s.bunker.maxHp||s.profile?.maxHp||100)} · SUP ${s.save?.supply||0}`,12,hy+29);ctx.textAlign='right';ctx.fillText(`INF ${s.stats.kills} · VEH ${s.stats.vehicleKills} · AIR ${s.stats.airKills}`,w-12,hy+29);ctx.restore();
    if(s.ui.messageT>0){ctx.save();ctx.textAlign='center';ctx.font='800 15px system-ui';ctx.fillStyle='rgba(245,236,205,.94)';ctx.shadowColor='black';ctx.shadowBlur=6;ctx.fillText(s.ui.message,w/2,h*.18);ctx.restore();}
    if(!s.artillery.finished&&s.mode==='playing'){ctx.save();ctx.textAlign='center';ctx.font='800 13px system-ui';ctx.fillStyle='#e9d8aa';ctx.fillText(s.artillery.t<.42?'OBSERVE FRONT':'DISTANT ARTILLERY',w/2,68);ctx.restore();}
    if(s.bunker.flash>0){ctx.save();const a=Math.min(.15,s.bunker.flash*.55),g=ctx.createRadialGradient(w/2,h*.48,w*.2,w/2,h*.48,w*.72);g.addColorStop(0,'rgba(120,10,0,0)');g.addColorStop(1,`rgba(145,24,12,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();}
    if(s.debug){ctx.save();ctx.font='9px monospace';ctx.fillStyle='#fff';ctx.fillText(`${s.fpsSmoothed.toFixed(0)} FPS E:${s.enemies.length} V:${s.vehicles.filter(J.Vehicles.isThreat).length} A:${s.airborne.paratroopers.length}`,8,h-76);ctx.restore();}
  }
  J.Render={render};
})();
