(() => {
  const J=window.JBD, C=J.CONFIG, U=J.U;
  let nextId=1;
  function spawn(s,x=null){ const r=s.rng,w=s.viewport.w; const e={id:nextId++,type:'rifleman',x:x??(28+r()*(w-56)),y:20+r()*18,vx:0,vy:0,angle:Math.PI/2,hp:C.infantry.hp,state:'ADVANCE',stateT:0,speed:C.infantry.speed*(.9+r()*.18),anim:r()*10,phase:r()*10,fireT:r()*.6,suppression:0,cover:null,coverT:0,hitT:0,deathT:0,fallDir:r()<.5?-1:1,alpha:1,coverIntent:r()<.72};s.enemies.push(e);return e; }
  function findCover(s,e){let best=null,bestScore=-1e9;for(const c of s.cover){if(c.occupiedBy&&c.occupiedBy!==e.id)continue;const dx=c.x-e.x,dy=c.y-e.y,d=Math.hypot(dx,dy);if(d>C.infantry.coverSearchRadius||c.y<e.y-55||c.y>s.bunker.y-70)continue;let score=-d*.7 + c.coverStrength*120 + (c.y-e.y)*.18 - c.danger*80; if(score>bestScore){bestScore=score;best=c;}}return best;}
  function transition(e,state){e.state=state;e.stateT=0;}
  function updateOne(s,e,dt){e.stateT+=dt;e.anim+=dt;e.hitT=Math.max(0,e.hitT-dt);e.suppression=Math.max(0,e.suppression-C.infantry.suppressionDecay*dt);
    if(e.state==='DEAD'){e.deathT+=dt;e.alpha=e.deathT>C.infantry.corpseFadeStart?U.clamp(1-(e.deathT-C.infantry.corpseFadeStart)/(C.infantry.corpseLifetime-C.infantry.corpseFadeStart),0,1):1;return;}
    // danger around explosions/fire decays in world elsewhere; suppression can force tactical move
    if((e.state==='ADVANCE'||e.state==='FIRE_FROM_COVER') && (e.suppression>.30 || (e.state==='ADVANCE'&&e.coverIntent&&e.y>72&&e.stateT>1.05))){const c=findCover(s,e);if(c){e.cover=c;e.coverIntent=false;c.occupiedBy=e.id;transition(e,'SPRINT_TO_COVER');}}
    let tx=s.bunker.x,ty=s.bunker.y-28,spd=e.speed;
    if(e.state==='SPRINT_TO_COVER'&&e.cover){tx=e.cover.x;ty=e.cover.y;spd=C.infantry.sprint; if(Math.hypot(tx-e.x,ty-e.y)<7){transition(e,'ENTER_COVER');e.coverT=.20;}}
    if(e.state==='ENTER_COVER'){e.coverT-=dt;if(e.coverT<=0)transition(e,'FIRE_FROM_COVER');return;}
    if(e.state==='FIRE_FROM_COVER'){e.fireT-=dt;if(e.fireT<=0){enemyFire(s,e,true);e.fireT=C.infantry.fireInterval*(.82+Math.random()*.5)*(1+e.suppression*.8);}return;}
    if(e.state==='ADVANCE'||e.state==='SPRINT_TO_COVER'){
      const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy)||1;e.vx=dx/d*spd;e.vy=dy/d*spd;e.x+=e.vx*dt;e.y+=e.vy*dt;e.angle=Math.atan2(e.vy,e.vx);
      if(e.state==='ADVANCE' && d<C.infantry.range){transition(e,'IN_COVER');e.fireT=.15+Math.random()*.5;}
    } else if(e.state==='IN_COVER'){e.fireT-=dt;if(e.fireT<=0){enemyFire(s,e,false);e.fireT=C.infantry.fireInterval*(.9+Math.random()*.45);} }
  }
  function enemyFire(s,e,covered){
    const dx=s.bunker.x-e.x,dy=s.bunker.y-e.y,d=Math.hypot(dx,dy);const movePenalty=e.state==='ADVANCE'?.08:0;const spread=.07+movePenalty+e.suppression*.12;const hitChance=U.clamp(.62-d/1000-spread, .12,.55);e.phase+=.7; J.Audio.play('mg',{x:e.x,variation:Math.random()}); J.Particles.emit(s,'spark',e.x,e.y-8,1,{angle:e.angle,arc:.25,speedMin:40,speedMax:65,life:.08,size:1});
    if(Math.random()<hitChance){s.bunker.hp=Math.max(0,s.bunker.hp-(covered?1.4:2.0));s.bunker.flash=.12;s.trauma=Math.min(1,s.trauma+.035); if(s.bunker.hp<=0)s.mode='gameover';}
  }
  function damage(s,e,amount,kind,x,y){if(e.state==='DEAD')return false;let mult=1;if((e.state==='FIRE_FROM_COVER'||e.state==='ENTER_COVER')&&e.cover){if(kind==='mg')mult=C.weapons.mg.coverDamage;if(kind==='ap')mult=C.weapons.ap.coverDamage;if(kind==='he')mult=C.weapons.he.coverDamage;} e.hp-=amount*mult;e.hitT=.14;e.suppression=Math.min(1,e.suppression+.25);J.Audio.play('cloth',{x:e.x});J.Particles.emit(s,'blood',x??e.x,y??e.y,kind==='he'?10:4,{speedMin:18,speedMax:95,life:.35,gravity:60,size:1.7});
    if(e.hp<=0){kill(s,e,kind);return true;}return false;}
  function kill(s,e,kind){e.state='DEAD';e.deathT=0;e.vx=e.vy=0;if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;s.stats.kills++;J.World.bloodMark(s,e.x,e.y,kind==='he'?2:1);J.Particles.emit(s,'blood',e.x,e.y,kind==='he'?15:7,{speedMin:25,speedMax:125,life:.55,gravity:90,size:2});s.trauma=Math.min(1,s.trauma+(kind==='he'?.12:.025));}
  function update(s,dt){for(const e of s.enemies)updateOne(s,e,dt);s.enemies=s.enemies.filter(e=>e.state!=='DEAD'||e.deathT<C.infantry.corpseLifetime);}
  J.Infantry={spawn,update,damage,findCover};
})();
