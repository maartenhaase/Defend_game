(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;
  function init(s){s.bullets=Array.from({length:C.render.bullets},()=>({active:false}));s.pendingShots=[];s.explosions=[];s.fires=[];}
  function allocBullet(s){for(const b of s.bullets)if(!b.active)return b;return null;}
  function fireCharge(s,hold,x,y){
    if(s.mode!=='playing')return; const b=s.bunker,dx=x-b.x,dy=y-(b.y-7),base=Math.atan2(dy,dx); b.aim=base;
    if(hold<C.input.apCharge){for(let i=0;i<C.weapons.mg.burst;i++)s.pendingShots.push({t:i*C.weapons.mg.cadence,kind:'mg',a:base,x,y,index:i});}
    else if(hold<C.input.heCharge) spawnProjectile(s,'ap',base,x,y,0);
    else spawnProjectile(s,'he',base,x,y,0);
  }
  function spawnProjectile(s,kind,base,targetX,targetY,index=0){const b=allocBullet(s);if(!b)return; const W=C.weapons[kind];const spread=U.gaussian() * W.spread * (kind==='mg'?(1+index*.16):1);const a=base+spread; const sx=s.bunker.x+Math.cos(a)*38,sy=s.bunker.y-8+Math.sin(a)*38;
    Object.assign(b,{active:true,kind,x:sx,y:sy,px:sx,py:sy,vx:Math.cos(a)*W.speed,vy:Math.sin(a)*W.speed,life:kind==='he'?1.8:1.2,targetX,targetY,travel:0});
    s.bunker.recoil=kind==='mg'?5:kind==='ap'?10:13;s.stats.shots++; J.Audio.play(kind==='mg'?'mg':kind==='ap'?'ap':'heLaunch',{x:s.bunker.x,variation:Math.random()});
    J.Particles.emit(s,'spark',sx,sy,kind==='mg'?2:4,{angle:a,arc:.25,speedMin:40,speedMax:110,life:.12,size:1.3});
  }
  function updatePending(s,dt){for(let i=s.pendingShots.length-1;i>=0;i--){const q=s.pendingShots[i];q.t-=dt;if(q.t<=0){spawnProjectile(s,'mg',q.a,q.x,q.y,q.index);s.pendingShots.splice(i,1);}}}
  function nearMissSuppression(s,b){if(b.kind!=='mg')return;for(const e of s.enemies){if(e.state==='DEAD')continue;const dx=e.x-b.x,dy=e.y-b.y,d2=dx*dx+dy*dy;if(d2<32*32)e.suppression=Math.min(1,e.suppression+.045);}}
  function hitBullet(s,b){
    let best=null,bestD=1e9;for(const e of s.enemies){if(e.state==='DEAD')continue;const d=Math.hypot(e.x-b.x,e.y-b.y);const r=(e.state==='FIRE_FROM_COVER'||e.state==='ENTER_COVER')?7:10;if(d<r&&d<bestD){best=e;bestD=d;}}
    if(best){const dmg=C.weapons[b.kind].damage;J.Infantry.damage(s,best,dmg,b.kind,b.x,b.y);s.stats.hits++;b.active=false;return true;}return false;
  }
  function explode(s,x,y,radius,source='he',big=false){
    s.explosions.push({x,y,t:0,dur:big?1.0:.72,radius});J.Audio.play(big?'artillery':'explosion',{x,variation:Math.random()});s.trauma=Math.min(1,s.trauma+(big?.34:.22));
    J.Particles.emit(s,'dirt',x,y,big?30:20,{speedMin:45,speedMax:190,life:.65,gravity:140,size:2.5});
    J.Particles.emit(s,'smoke',x,y,big?12:8,{speedMin:15,speedMax:60,life:1.5,size:8,vy:-20});
    J.Particles.emit(s,'fire',x,y,big?8:5,{speedMin:15,speedMax:85,life:.45,gravity:-12,size:3.5});
    const craterR=radius*(big?.48:.40);J.World.crater(s,x,y,craterR,U.hash((x*13+y*17+s.simTime*1000)|0));
    for(const e of s.enemies){if(e.state==='DEAD')continue;const d=Math.hypot(e.x-x,e.y-y);if(d<radius){const fall=1-d/radius;J.Infantry.damage(s,e,C.weapons.he.damage*(.35+.75*fall),'he',e.x,e.y);e.suppression=1;}}
    for(const c of s.cover){const d=Math.hypot(c.x-x,c.y-y);if(d<radius*1.2)c.danger=Math.max(c.danger,1);}
  }
  function updateBullets(s,dt){for(const b of s.bullets){if(!b.active)continue;b.life-=dt;b.px=b.x;b.py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.travel+=Math.hypot(b.vx,b.vy)*dt;
      if(b.kind==='he'){const d=Math.hypot(b.x-b.targetX,b.y-b.targetY);if(d<24||b.life<=0||b.y<0||b.x<0||b.x>s.viewport.w){b.active=false;explode(s,b.x,b.y,C.weapons.he.radius,'he',false);continue;}}
      else {nearMissSuppression(s,b);if(hitBullet(s,b))continue;if(b.x<-15||b.x>s.viewport.w+15||b.y<-15||b.y>s.viewport.h+15||b.life<=0)b.active=false;}
    }}
  function updateExplosions(s,dt){for(const x of s.explosions)x.t+=dt;s.explosions=s.explosions.filter(x=>x.t<x.dur);for(const c of s.cover){c.danger=Math.max(0,c.danger-dt*.45);c.age+=dt;}}
  function artilleryStart(s){s.artillery.started=true;s.artillery.t=0;s.artillery.index=0;s.artillery.next=C.artillery.introDelay; const r=s.rng; s.artillery.events=[];for(let i=0;i<C.artillery.count;i++){const margin=26, x=margin+r()*(s.viewport.w-margin*2), y=58+r()*(s.bunker.y-155);const time=C.artillery.introDelay + (i/(C.artillery.count-1))*C.artillery.duration + (r()-.5)*.12; s.artillery.events.push({x,y,time,whistle:false,done:false});}}
  function updateArtillery(s,dt){if(!s.artillery.started)artilleryStart(s);s.artillery.t+=dt; for(const ev of s.artillery.events){if(!ev.whistle&&s.artillery.t>ev.time-.48){ev.whistle=true;J.Audio.play('whistle',{x:ev.x,variation:Math.random()});}if(!ev.done&&s.artillery.t>=ev.time){ev.done=true;explode(s,ev.x,ev.y,U.rnd(76,96,s.rng),'artillery',true);}}
    if(!s.artillery.finished&&s.artillery.events.every(e=>e.done)){s.artillery.finished=true;s.ui.message='CONTACT FRONT';s.ui.messageT=1.15;}
  }
  function update(s,dt){s.bunker.recoil=Math.max(0,s.bunker.recoil-dt*42);s.bunker.flash=Math.max(0,s.bunker.flash-dt);updatePending(s,dt);updateBullets(s,dt);updateExplosions(s,dt);J.Particles.update(s,dt);}
  J.Combat={init,fireCharge,explode,update,updateArtillery};
})();
