(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;
  let s,canvas,ctx,deploy,overlay,title,sub,restart;
  function setup(){
    canvas=document.getElementById('game');ctx=canvas.getContext('2d',{alpha:false});deploy=document.getElementById('deploy');overlay=document.getElementById('overlay');title=document.getElementById('title');sub=document.getElementById('sub');restart=document.getElementById('restart');
    s=J.makeState();J.SpriteSystem.init();J.Particles.init(s);J.Combat.init(s);J.World.resize(s,canvas);J.Input.init(s,canvas);window.__JBD_STATE__=s;
    const onResize=()=>J.World.resize(s,canvas);window.addEventListener('resize',onResize,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(onResize,120),{passive:true});
    deploy.addEventListener('click',()=>{J.Audio.unlock(s);s.mode='playing';s.deployed=true;overlay.classList.add('hidden');s.ui.message='DEPLOY';s.ui.messageT=.8;if(C.stress){for(let i=0;i<25;i++)J.Infantry.spawn(s);for(const [i,t] of ['technical','truck','halftrack','stug','tank'].entries())J.Vehicles.spawn(s,t,(i-2)*.12);s.vehicleWave.started=true;s.vehicleWave.index=C.vehicles.waveSchedule.length;s.vehicleWave.finished=true;s.spawn.count=C.level.spawnCount;J.Particles.emit(s,'dirt',s.viewport.w*.5,s.viewport.h*.42,220,{speedMin:20,speedMax:180,life:1.2,gravity:90,size:2});J.Particles.emit(s,'smoke',s.viewport.w*.5,s.viewport.h*.38,80,{speedMin:10,speedMax:90,life:1.8,size:7,vy:-18});}});
    restart.addEventListener('click',()=>location.reload());requestAnimationFrame(loop);
  }
  function update(dt){s.simTime+=dt;s.trauma=Math.max(0,s.trauma-dt*.8);s.ui.messageT=Math.max(0,s.ui.messageT-dt);J.Input.update(s,dt);
    if(s.mode==='playing'){
      J.Combat.updateArtillery(s,dt);
      if(s.artillery.t>C.artillery.introDelay+C.artillery.duration*.72&&s.spawn.count<C.level.spawnCount){s.spawn.t-=dt;if(s.spawn.t<=0){J.Infantry.spawn(s);s.spawn.count++;s.spawn.t=C.level.spawnDuration/C.level.spawnCount*(.68+s.rng()*.48);}}
      J.Infantry.update(s,dt);J.Vehicles.update(s,dt);J.Combat.update(s,dt);
      const infantryDone=s.spawn.count>=C.level.spawnCount&&s.enemies.every(e=>e.state==='DEAD');
      if(infantryDone&&J.Vehicles.allResolved(s)){s.completeT+=dt;if(s.completeT>C.level.completeDelay&&!s.levelComplete){s.levelComplete=true;s.mode='complete';showComplete();}}else s.completeT=0;
    } else if(s.mode==='gameover'){J.Infantry.update(s,dt);J.Vehicles.update(s,dt);J.Combat.update(s,dt);showGameOver();}
  }
  function showComplete(){title.textContent='ARMOR TRIAL SECURE';sub.innerHTML=`Milestone 6 cleared · ${s.stats.kills} infantry · ${s.stats.vehicleKills} vehicles<br><span>Technicals, troop trucks, halftracks, StuG/tank, damage states en wreck-cover actief.</span>`;deploy.style.display='none';restart.style.display='inline-flex';restart.textContent='PLAY AGAIN';overlay.classList.remove('hidden');}
  function showGameOver(){if(!overlay.classList.contains('hidden'))return;title.textContent='BUNKER OVERRUN';sub.textContent='De linie is gebroken.';deploy.style.display='none';restart.style.display='inline-flex';restart.textContent='REDEPLOY';overlay.classList.remove('hidden');}
  function loop(ts){if(!s.lastTs)s.lastTs=ts;let frame=Math.min(C.maxFrameDelta,(ts-s.lastTs)/1000);s.lastTs=ts;s.accumulator+=frame;const inst=1/Math.max(.001,frame);s.fpsSmoothed=U.lerp(s.fpsSmoothed,inst,.05);s.quality=s.fpsSmoothed<48?Math.max(.55,s.quality-.005):Math.min(1,s.quality+.002);let steps=0;while(s.accumulator>=C.step&&steps<6){update(C.step);s.accumulator-=C.step;steps++;}J.Render.render(s,ctx);requestAnimationFrame(loop);}
  window.addEventListener('DOMContentLoaded',setup);
})();
