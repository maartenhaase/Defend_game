(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;

  function drawExplosion(ctx,x){
    const p=x.t/x.dur,fade=Math.max(0,1-p),r=x.radius*(.22+.78*Math.sin(Math.min(1,p)*Math.PI*.78)),rand=U.mulberry32(x.seed||1);
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<6;i++){
      const a=rand()*6.28,off=r*(.08+rand()*.28),lr=r*(.32+rand()*.32)*(1-p*.18),lx=x.x+Math.cos(a)*off,ly=x.y+Math.sin(a)*off*.72;
      const g=ctx.createRadialGradient(lx,ly,0,lx,ly,Math.max(2,lr));
      g.addColorStop(0,'rgba(255,248,194,.98)');g.addColorStop(.24,'rgba(255,188,70,.94)');g.addColorStop(.62,'rgba(220,84,32,.66)');g.addColorStop(1,'rgba(70,38,26,0)');
      ctx.globalAlpha=fade*(.46+i*.055);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(lx,ly,lr,lr*(.68+rand()*.18),rand()*3,0,6.28);ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=fade*.62;ctx.strokeStyle='#2b251f';ctx.lineWidth=2;
    for(let i=0;i<7;i++){const a=i*.897+(x.seed%17)*.03,len=r*(.48+rand()*.52);ctx.beginPath();ctx.moveTo(x.x+Math.cos(a)*r*.18,x.y+Math.sin(a)*r*.13);ctx.lineTo(x.x+Math.cos(a+.09)*len,x.y+Math.sin(a+.09)*len*.68);ctx.stroke();}
    if(p>.38){ctx.globalAlpha=Math.min(.38,(p-.38)*.65)*fade;ctx.fillStyle='#34372f';for(let i=0;i<3;i++){const a=rand()*6.28,rr=r*(.18+rand()*.22);ctx.beginPath();ctx.arc(x.x+Math.cos(a)*rr,x.y+Math.sin(a)*rr*.7,r*(.15+rand()*.10),0,6.28);ctx.fill();}}
    ctx.restore();
  }

  function drawBullet(ctx,b){
    ctx.save();if(b.kind==='mg'){ctx.strokeStyle='rgba(255,226,133,.9)';ctx.lineWidth=1.3;}else if(b.kind==='ap'){ctx.strokeStyle='#bfe6ff';ctx.lineWidth=2;}else{ctx.strokeStyle='#ffb968';ctx.lineWidth=2.4;}
    ctx.beginPath();ctx.moveTo(b.px,b.py);ctx.lineTo(b.x,b.y);ctx.stroke();
    if(b.kind==='he'){ctx.fillStyle='#d59a42';ctx.beginPath();ctx.arc(b.x,b.y,3,0,6.28);ctx.fill();}
    ctx.restore();
  }

  function muzzleStar(ctx,x,y,scale=1){
    ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='screen';ctx.fillStyle='#ffe49a';ctx.beginPath();ctx.moveTo(0,-7*scale);ctx.lineTo(2.3*scale,-2*scale);ctx.lineTo(7*scale,0);ctx.lineTo(2.3*scale,2*scale);ctx.lineTo(0,7*scale);ctx.lineTo(-2*scale,2*scale);ctx.lineTo(-6*scale,0);ctx.lineTo(-2*scale,-2*scale);ctx.closePath();ctx.fill();ctx.restore();
  }

  function drawSoldier(ctx,e){
    const walk=e.state==='SPRINT_TO_COVER'||e.state==='ADVANCE';let spr;
    if(e.state==='DEAD')spr=J.Sprites.dead;else if(e.state==='FIRE_FROM_COVER'||e.state==='ENTER_COVER'||e.state==='IN_COVER')spr=J.Sprites.crouch;else spr=J.Sprites.soldier[Math.floor(e.anim*(walk?10:4)+e.phase)%8];
    ctx.save();ctx.globalAlpha=e.alpha;
    if(e.state==='DEAD'){
      const t=Math.min(1,e.deathT/.42),rot=e.fallDir*t*1.3;ctx.translate(e.x,e.y);ctx.rotate(rot);ctx.scale(1,1-.18*t);ctx.drawImage(spr,-spr.width/2,-spr.height/2);
    }else{
      ctx.translate(e.x,e.y);const rot=e.angle+Math.PI/2+(e.hitT>0?e.fallDir*.12:0);ctx.rotate(rot);if(e.state==='SPRINT_TO_COVER'||e.assaultT>0)ctx.scale(1,1.05);if(e.recoilT>0)ctx.translate(0,e.recoilT*10);ctx.drawImage(spr,-spr.width/2,-spr.height/2);
      if(e.muzzleT>0)muzzleStar(ctx,4,-21,.48);
    }
    ctx.restore();
    if(e.state!=='DEAD'&&sDebug()){ctx.font='8px monospace';ctx.fillStyle='white';ctx.fillText(e.state,e.x-18,e.y-19);}
  }

  let _state=null;function sDebug(){return _state&&_state.debug;}

  function drawBunker(ctx,s){
    const b=s.bunker,spr=J.Sprites.bunker;ctx.drawImage(spr,b.x-spr.width/2,b.y-56);
    const a=b.aim,recoil=b.recoil,ox=b.x+Math.cos(a)*(-recoil),oy=b.y-9+Math.sin(a)*(-recoil);
    ctx.save();ctx.translate(ox,oy);ctx.rotate(a);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(8,4,C.bunker.barrelLength,5);ctx.fillStyle='#343a36';ctx.strokeStyle='#171b19';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-10,-7,22,14,6);ctx.fill();ctx.stroke();ctx.fillStyle='#4f5651';ctx.fillRect(3,-4,C.bunker.barrelLength,8);ctx.strokeRect(3,-4,C.bunker.barrelLength,8);ctx.fillStyle='#282c29';ctx.fillRect(C.bunker.barrelLength-2,-6,8,12);
    if(b.muzzle>0){const sc=b.muzzleKind==='mg'?.7:b.muzzleKind==='ap'?1.05:1.25;muzzleStar(ctx,C.bunker.barrelLength+9,0,sc);}
    ctx.restore();
    if(b.flash>0){ctx.fillStyle='rgba(255,90,65,.13)';ctx.beginPath();ctx.arc(b.x,b.y,48,0,6.28);ctx.fill();}
  }

  function drawCrosshair(ctx,s){
    const x=s.input.x,y=s.input.y,hold=s.input.down?s.input.charge:0;let col='#f1e6b0';if(hold>=C.input.heCharge)col='#ff9a44';else if(hold>=C.input.apCharge)col='#a6dfff';
    ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.globalAlpha=.82;const rr=9+(hold/C.input.maxCharge)*5;ctx.beginPath();ctx.arc(x,y,rr,0,6.28);ctx.moveTo(x-rr-6,y);ctx.lineTo(x-rr+1,y);ctx.moveTo(x+rr-1,y);ctx.lineTo(x+rr+6,y);ctx.moveTo(x,y-rr-6);ctx.lineTo(x,y-rr+1);ctx.moveTo(x,y+rr-1);ctx.lineTo(x,y+rr+6);ctx.stroke();ctx.restore();
  }

  function drawCharge(ctx,s){
    const {w,h}=s.viewport,y=h-s.safe.bottom-66,x=18,bw=w-36,bh=19;ctx.save();ctx.fillStyle='rgba(20,22,18,.86)';ctx.beginPath();ctx.roundRect(x,y,bw,bh,7);ctx.fill();const f=U.clamp(s.input.charge/C.input.maxCharge,0,1),grad=ctx.createLinearGradient(x,0,x+bw,0);grad.addColorStop(0,'#e8d376');grad.addColorStop(C.input.apCharge/C.input.maxCharge,'#e8d376');grad.addColorStop(C.input.apCharge/C.input.maxCharge+.01,'#8fcef2');grad.addColorStop(C.input.heCharge/C.input.maxCharge,'#8fcef2');grad.addColorStop(C.input.heCharge/C.input.maxCharge+.01,'#e97d38');grad.addColorStop(1,'#e97d38');ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(x+2,y+2,(bw-4)*f,bh-4,5);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.18)';ctx.strokeRect(x,y,bw,bh);ctx.font='700 9px system-ui';ctx.textAlign='center';ctx.fillStyle='#e7e4d5';ctx.fillText('BURST',x+bw*.12,y+14);ctx.fillText('AP',x+bw*.40,y+14);ctx.fillText('HE',x+bw*.78,y+14);ctx.restore();
  }

  function render(s,ctx){
    _state=s;const {w,h,dpr}=s.viewport;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const trauma=s.trauma*s.trauma,shakeX=(Math.random()-.5)*15*trauma,shakeY=(Math.random()-.5)*12*trauma;
    ctx.save();ctx.translate(shakeX,shakeY);ctx.drawImage(s.staticCanvas,0,0,w,h);ctx.drawImage(s.damageCanvas,0,0,w,h);
    if(s.debug){ctx.strokeStyle='rgba(0,255,255,.35)';for(const c of s.cover){ctx.beginPath();ctx.arc(c.x,c.y,c.radius,0,6.28);ctx.stroke();}}
    for(const e of s.enemies)drawSoldier(ctx,e);for(const b of s.bullets)if(b.active)drawBullet(ctx,b);for(const e of s.explosions)drawExplosion(ctx,e);J.Particles.render(s,ctx);drawBunker(ctx,s);ctx.restore();
    drawCrosshair(ctx,s);drawCharge(ctx,s);

    ctx.save();const hy=s.safe.top;ctx.fillStyle='rgba(16,18,14,.72)';ctx.fillRect(0,0,w,hy+44);ctx.font='700 12px system-ui';ctx.fillStyle='#e5e1cc';ctx.fillText('JBD · FOOT PATROL',14,hy+18);ctx.font='10px system-ui';ctx.fillStyle='#aeb49a';ctx.fillText(`BUNKER ${Math.ceil(s.bunker.hp)}%`,14,hy+34);ctx.textAlign='right';ctx.fillText(`KILLS ${s.stats.kills}/${C.level.spawnCount}`,w-14,hy+34);ctx.restore();

    if(s.ui.messageT>0){ctx.save();ctx.textAlign='center';ctx.font='800 18px system-ui';ctx.fillStyle='rgba(245,236,205,.94)';ctx.shadowColor='black';ctx.shadowBlur=6;ctx.fillText(s.ui.message,w/2,h*.19);ctx.restore();}
    if(!s.artillery.finished&&s.mode==='playing'){ctx.save();ctx.textAlign='center';ctx.font='800 15px system-ui';ctx.fillStyle='#e9d8aa';ctx.fillText(s.artillery.t<.42?'DEPLOY':'ARTILLERY INCOMING',w/2,70);ctx.restore();}

    if(s.bunker.flash>0){ctx.save();const a=Math.min(.15,s.bunker.flash*.55),g=ctx.createRadialGradient(w/2,h*.48,w*.2,w/2,h*.48,w*.72);g.addColorStop(0,'rgba(120,10,0,0)');g.addColorStop(1,`rgba(145,24,12,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();}

    if(s.debug){ctx.save();ctx.font='10px monospace';ctx.fillStyle='#fff';ctx.fillText(`${s.fpsSmoothed.toFixed(0)} FPS  E:${s.enemies.length} P:${s.particles.filter(p=>p.active).length} seed:${s.seed}`,8,h-86);ctx.fillText(`assault:${s.assault.armed?s.assault.t.toFixed(1):'-'} pulse:${s.assault.pulse} released:${s.assault.lastReleased}`,8,h-98);ctx.restore();}
  }

  J.Render={render};
})();
