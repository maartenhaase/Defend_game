(() => {
  const J=window.JBD, C=J.CONFIG, U=J.U;
  let nextId=1;
  const COVER_STATES=new Set(['ENTER_COVER','FIRE_FROM_COVER']);

  function spawn(s,x=null,y=null,opts={}){
    const r=s.rng;
    const engineerChance = s.scenario ? (s.scenario.index>=3 ? 0.14 : 0.06) + Math.max(0,s.scenario.cycle-1)*0.03 : 0.08;
    const type=opts.type || ((opts.allowEngineer!==false && r()<engineerChance) ? 'engineer' : 'rifleman');
    const e={
      id:nextId++, type, x:x??J.World.pickSpawnX(s,r), y:y??(20+r()*18), vx:0, vy:0,
      angle:Math.PI/2, hp:C.infantry.hp*(s.scenario?.enemyHpMult||1), state:'ADVANCE', stateT:0,
      speed:C.infantry.speed*(s.scenario?.infantrySpeedMult||1)*(.9+r()*.18), anim:r()*10, phase:r()*10,
      fireT:r()*.6, suppression:0, cover:null, coverT:0, hitT:0, deathT:0,
      fallDir:r()<.5?-1:1, deathPose:r()<.5?'front':'side', alpha:1, coverIntent:opts.coverIntent??(r()<.72), reCoverT:opts.reCoverT||0,
      assaultT:0, muzzleT:0, recoilT:0, pose:'walk', inWater:false, canEmplace:type==='engineer', deployingWeapon:false, mountedWeapon:false,
      mountedCooldown:0, pronePreference:r()<.5, splashT:0
    };
    s.enemies.push(e);return e;
  }

  function findCover(s,e){
    let best=null,bestScore=-1e9;
    for(const c of s.cover){
      if(c.occupiedBy&&c.occupiedBy!==e.id)continue;
      const dx=c.x-e.x,dy=c.y-e.y,d=Math.hypot(dx,dy);
      if(d>(s.scenario?.coverSearchRadius||C.infantry.coverSearchRadius)||c.y<e.y-55||c.y>s.bunker.y-70)continue;
      let score=-d*.7+c.coverStrength*120+(c.y-e.y)*.18-c.danger*80;
      if(score>bestScore){bestScore=score;best=c;}
    }
    return best;
  }

  function transition(e,state){e.state=state;e.stateT=0;}
  function isCraterCovered(e){return COVER_STATES.has(e.state)&&!!e.cover;}
  function activeMountedWeapons(s){ return s.enemies.filter(a=>a.state!=='DEAD'&&a.mountedWeapon).length; }

  function releaseFromCover(s,e){
    if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;
    e.cover=null;e.coverIntent=false;e.reCoverT=C.infantry.reseekDelay*(.88+s.rng()*.28);
    e.assaultT=C.infantry.assaultRushDuration*(.92+s.rng()*.18);e.mountedWeapon=false;e.deployingWeapon=false;
    transition(e,'ADVANCE');e.suppression=Math.min(e.suppression,.34);
  }

  function updateAssaultPulse(s,dt){
    if(!s.artillery.finished)return;
    const covered=s.enemies.filter(e=>e.state!=='DEAD'&&isCraterCovered(e));
    if(!s.assault.armed&&covered.length){ s.assault.armed=true; s.assault.t=C.infantry.coverWaveHold; s.assault.whistle=false; }
    if(!s.assault.armed)return;
    s.assault.t-=dt;
    if(!s.assault.whistle&&s.assault.t<=C.infantry.assaultSignalLead){
      s.assault.whistle=true; J.Audio.play('assaultWhistle',{x:s.viewport.w*.5,variation:s.rng()}); s.ui.message='ASSAULT WHISTLE'; s.ui.messageT=.9;
    }
    if(s.assault.t<=0){
      let released=0;for(const e of s.enemies){ if(e.state!=='DEAD'&&isCraterCovered(e)){ releaseFromCover(s,e); released++; } }
      s.assault.armed=false;s.assault.whistle=false;s.assault.pulse++;s.assault.lastReleased=released;
      if(released){ s.ui.message='THEY ARE MOVING';s.ui.messageT=.72;s.trauma=Math.min(1,s.trauma+.035); }
    }
  }

  function maybeSplash(s,e,dt){
    e.inWater=J.World.isInWater(s,e.x,e.y);e.splashT-=dt;
    if(e.inWater&&e.splashT<=0&&Math.hypot(e.vx,e.vy)>6){e.splashT=.16+Math.random()*.06;J.Particles.emit(s,'smoke',e.x,e.y+4,1,{speedMin:2,speedMax:10,life:.18,size:2.2,vy:-3,color:'rgba(190,220,230,.5)'});}
  }

  function maybeDeployWeapon(s,e){
    if(!e.canEmplace||e.mountedWeapon||e.deployingWeapon||e.inWater||e.assaultT>0)return false;
    if(activeMountedWeapons(s)>=C.infantry.maxMountedWeapons)return false;
    if(J.Scale.progress(s,e.y)<0.48 || e.y>s.bunker.y-140)return false;
    if(e.cover && e.cover.type==='building')return false;if(e.suppression>.55)return false;
    if(e.state!=='ADVANCE'&&e.state!=='IN_COVER'&&e.state!=='FIRE_FROM_COVER')return false;
    if(Math.abs(e.x-s.bunker.x)<35)return false;
    if(Math.random()<0.004 || (e.stateT>.8 && Math.random()<0.014)){
      e.deployingWeapon=true;e.mountedCooldown=C.infantry.weaponDeployTime;transition(e,'DEPLOY_WEAPON');
      s.ui.message='GUN TEAM SETTING UP';s.ui.messageT=.55;J.Audio.play('troopDrop',{x:e.x,variation:s.rng()});return true;
    }
    return false;
  }

  function updateOne(s,e,dt){
    e.stateT+=dt;e.anim+=dt;e.hitT=Math.max(0,e.hitT-dt);e.muzzleT=Math.max(0,e.muzzleT-dt);e.recoilT=Math.max(0,e.recoilT-dt);
    e.assaultT=Math.max(0,e.assaultT-dt);e.reCoverT=Math.max(0,e.reCoverT-dt);e.mountedCooldown=Math.max(0,e.mountedCooldown-dt);e.suppression=Math.max(0,e.suppression-C.infantry.suppressionDecay*dt);
    if(e.state==='DEAD'){e.deathT+=dt;e.alpha=e.deathT>C.infantry.corpseFadeStart?U.clamp(1-(e.deathT-C.infantry.corpseFadeStart)/(C.infantry.corpseLifetime-C.infantry.corpseFadeStart),0,1):1;return;}
    if(!e.cover&&e.reCoverT<=0&&e.state==='ADVANCE'&&!e.coverIntent&&e.assaultT<=0&&e.suppression>.34)e.coverIntent=true;
    if(e.state==='ADVANCE'&&J.Scale.progress(s,e.y)>0.34&&(e.suppression>.30||(e.coverIntent&&e.y>72&&e.stateT>1.05))&&e.assaultT<=0){const c=findCover(s,e);if(c){e.cover=c;e.coverIntent=false;c.occupiedBy=e.id;transition(e,'SPRINT_TO_COVER');}}
    if(maybeDeployWeapon(s,e)){e.pose='crouch';e.vx=e.vy=0;maybeSplash(s,e,dt);return;}
    let tx=s.bunker.x,ty=s.bunker.y-28,spd=e.assaultT>0?C.infantry.assaultSprint*(s.scenario?.infantrySpeedMult||1):e.speed;
    if(e.state==='SPRINT_TO_COVER'&&e.cover){tx=e.cover.x;ty=e.cover.y;spd=C.infantry.sprint*(s.scenario?.infantrySpeedMult||1);if(Math.hypot(tx-e.x,ty-e.y)<7){transition(e,'ENTER_COVER');e.coverT=.20;e.pronePreference=e.cover.type==='trench'||e.cover.type==='terrain'?Math.random()<.7:Math.random()<.35;}}
    if(e.state==='DEPLOY_WEAPON'){e.pose='crouch';e.vx=e.vy=0;if(e.mountedCooldown<=0){e.deployingWeapon=false;e.mountedWeapon=true;transition(e,'FIRE_FROM_WEAPON');e.fireT=.3+Math.random()*.2;}maybeSplash(s,e,dt);return;}
    if(e.state==='ENTER_COVER'){e.coverT-=dt;e.pose=e.pronePreference?'prone':'crouch';if(e.coverT<=0)transition(e,'FIRE_FROM_COVER');maybeSplash(s,e,dt);return;}
    if(e.state==='FIRE_FROM_COVER'){e.fireT-=dt;e.pose=e.pronePreference?'prone':'crouch';if(e.fireT<=0){enemyFire(s,e,true,'rifle');e.fireT=C.infantry.fireInterval*(.82+Math.random()*.5)*(1+e.suppression*.8)/(s.scenario?.enemyFireRateMult||1);}maybeDeployWeapon(s,e);maybeSplash(s,e,dt);return;}
    if(e.state==='FIRE_FROM_WEAPON'){e.pose='crouch';e.fireT-=dt;if(e.suppression>.72){e.mountedWeapon=false;transition(e,'ADVANCE');e.reCoverT=.7;}else if(e.fireT<=0){enemyFire(s,e,false,'mounted');e.fireT=C.infantry.weaponFireInterval*(.86+Math.random()*.22)/(s.scenario?.enemyFireRateMult||1);}maybeSplash(s,e,dt);return;}
    if(e.state==='ADVANCE'||e.state==='SPRINT_TO_COVER'){
      const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy)||1;const terrain=J.World.waterSpeed(s,e.x,e.y),scaleMove=J.Scale.moveFactor(s,e.y);e.vx=dx/d*spd*terrain*scaleMove;e.vy=dy/d*spd*terrain*scaleMove;e.x+=e.vx*dt;e.y+=e.vy*dt;e.angle=Math.atan2(e.vy,e.vx);e.pose=e.inWater?'swim':'walk';
      if(e.state==='ADVANCE'&&d<(s.scenario?.infantryRange||C.infantry.range)&&e.assaultT<=0){transition(e,'IN_COVER');e.pronePreference=false;e.fireT=.15+Math.random()*.5;}
    }else if(e.state==='IN_COVER'){
      if(e.cover)e.pose=e.pronePreference?'prone':'crouch';else e.pose=e.suppression>.42?'crouch':'fire';e.fireT-=dt;if(e.fireT<=0){enemyFire(s,e,false,'rifle');e.fireT=C.infantry.fireInterval*(.9+Math.random()*.45)/(s.scenario?.enemyFireRateMult||1);}maybeDeployWeapon(s,e);
    }
    maybeSplash(s,e,dt);if(e.inWater)e.pose='swim';
  }

  function enemyFire(s,e,covered,mode='rifle'){
    const dx=s.bunker.x-e.x,dy=s.bunker.y-e.y,d=Math.hypot(dx,dy),mounted=mode==='mounted',range=mounted?C.infantry.weaponRange:(s.scenario?.infantryRange||C.infantry.range);if(d>range)return;
    const movePenalty=e.state==='ADVANCE'?.08:0,spread=(mounted?.03:.07)+movePenalty+e.suppression*(mounted?.07:.12),hitChance=U.clamp((mounted?C.infantry.weaponHitBase:.62)-d/1000-spread,mounted?.18:.12,mounted?.68:.55);
    e.phase+=.7;e.muzzleT=mounted?.10:.075;e.recoilT=mounted?.13:.10;J.Audio.play(mounted?'vehicleMg':'enemyRifle',{x:e.x,variation:Math.random()});J.Particles.emit(s,'muzzle',e.x,e.y-8,mounted?3:2,{angle:e.angle,arc:.18,speedMin:18,speedMax:42,life:.07,size:mounted?2.8:2.4});
    if(Math.random()<hitChance){const base=(mounted?C.infantry.weaponDamage:(covered?1.4:2.0))*(s.scenario?.enemyDamageMult||1),reduction=s.profile?.damageReduction||0;s.bunker.hp=Math.max(0,s.bunker.hp-base*(1-reduction));s.bunker.flash=mounted?.18:.16;s.trauma=Math.min(1,s.trauma+(mounted?.055:.035));J.Audio.play('bunkerHit',{x:s.bunker.x,variation:Math.random()});J.Particles.emit(s,'spark',s.bunker.x+U.rnd(-28,28),s.bunker.y-24,mounted?5:4,{speedMin:35,speedMax:105,life:.18,size:1.2});if(s.bunker.hp<=0)s.mode='gameover';}
  }

  function damage(s,e,amount,kind,x,y){
    if(e.state==='DEAD')return false;let mult=1;if(isCraterCovered(e)){if(kind==='mg')mult=C.weapons.mg.coverDamage;if(kind==='ap')mult=C.weapons.ap.coverDamage;if(kind==='he')mult=C.weapons.he.coverDamage;}e.hp-=amount*mult;e.hitT=.14;e.suppression=Math.min(1,e.suppression+.25);if(e.mountedWeapon&&kind==='he')e.suppression=1;J.Audio.play('cloth',{x:e.x});J.Particles.emit(s,'blood',x??e.x,y??e.y,kind==='he'?10:4,{speedMin:18,speedMax:95,life:.35,gravity:60,size:1.7});if(e.hp<=0){kill(s,e,kind);return true;}return false;
  }
  function kill(s,e,kind){e.state='DEAD';e.deathT=0;e.vx=e.vy=0;e.mountedWeapon=false;e.deployingWeapon=false;if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;e.cover=null;s.stats.kills++;J.World.bloodMark(s,e.x,e.y,kind==='he'?2:1);J.Particles.emit(s,'blood',e.x,e.y,kind==='he'?15:7,{speedMin:25,speedMax:125,life:.55,gravity:90,size:2});if(kind==='he')J.Particles.emit(s,'debris',e.x,e.y,5,{speedMin:25,speedMax:95,life:.7,gravity:95,size:1.8});s.trauma=Math.min(1,s.trauma+(kind==='he'?.12:.025));}
  function update(s,dt){updateAssaultPulse(s,dt);for(const e of s.enemies)updateOne(s,e,dt);s.enemies=s.enemies.filter(e=>e.state!=='DEAD'||e.deathT<C.infantry.corpseLifetime);}
  J.Infantry={spawn,update,damage,findCover,isCraterCovered};
})();
