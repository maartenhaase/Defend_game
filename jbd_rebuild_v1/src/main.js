(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;
  let s,canvas,ctx,deploy,overlay,title,sub,restart;

  function scenarioBrief(){
    const q=s.scenario,theme=q.theme==='jungle'?'Dichte dekking · korte zichtlijnen':q.theme==='desert'?'Open terrein · lange zichtlijnen':'Open sneeuwveld · snellere voertuigen';
    return `${theme}<br><span>Map ${q.index+1}/9 · Cycle ${q.cycle} · Tik = BURST · kort vasthouden = AP · lang vasthouden = HE</span>`;
  }

  function initialiseScenario(index=s.campaign.index,cycle=s.campaign.cycle){
    J.Scenarios.apply(s,index,cycle);J.Particles.init(s);J.Combat.init(s);J.World.resize(s,canvas);
    title.textContent=s.scenario.label;sub.innerHTML=scenarioBrief();deploy.style.display='inline-flex';restart.style.display='none';deploy.textContent='DEPLOY';overlay.classList.remove('hidden');
  }

  function startPlaying(){
    J.Audio.unlock(s);s.mode='playing';s.deployed=true;overlay.classList.add('hidden');s.ui.message=s.scenario.label;s.ui.messageT=.9;
    if(C.stress){
      for(let i=0;i<25;i++)J.Infantry.spawn(s);
      for(const [i,t] of ['technical','truck','halftrack','stug','tank'].entries())J.Vehicles.spawn(s,t,(i-2)*.12);
      s.vehicleWave.started=true;s.vehicleWave.index=s.scenario.vehicleSchedule.length;s.vehicleWave.finished=true;s.spawn.count=s.scenario.infantryCount;
      if(s.scenario.airborneCount>0)J.Airborne.start(s);else s.airborne.finished=true;
      J.Particles.emit(s,'dirt',s.viewport.w*.5,s.viewport.h*.42,220,{speedMin:20,speedMax:180,life:1.2,gravity:90,size:2});
      J.Particles.emit(s,'smoke',s.viewport.w*.5,s.viewport.h*.38,80,{speedMin:10,speedMax:90,life:1.8,size:7,vy:-18});
    }
  }

  function setup(){
    canvas=document.getElementById('game');ctx=canvas.getContext('2d',{alpha:false});deploy=document.getElementById('deploy');overlay=document.getElementById('overlay');title=document.getElementById('title');sub=document.getElementById('sub');restart=document.getElementById('restart');
    s=J.makeState();J.SpriteSystem.init();J.Input.init(s,canvas);window.__JBD_STATE__=s;initialiseScenario(0,1);
    const onResize=()=>J.World.resize(s,canvas);window.addEventListener('resize',onResize,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(onResize,120),{passive:true});
    deploy.addEventListener('click',startPlaying);
    restart.addEventListener('click',()=>{
      const wasComplete=s.mode==='complete';
      if(wasComplete)J.Scenarios.advance(s);else J.Scenarios.apply(s,s.campaign.index,s.campaign.cycle);
      J.Particles.init(s);J.Combat.init(s);J.World.resize(s,canvas);startPlaying();
    });
    requestAnimationFrame(loop);
  }

  function update(dt){
    s.simTime+=dt;s.trauma=Math.max(0,s.trauma-dt*.8);s.ui.messageT=Math.max(0,s.ui.messageT-dt);J.Input.update(s,dt);
    if(s.mode==='playing'){
      J.Combat.updateArtillery(s,dt);
      const artDur=s.scenario?.artilleryDuration||C.artillery.duration;
      if(s.artillery.t>C.artillery.introDelay+artDur*.72&&s.spawn.count<s.scenario.infantryCount){
        s.spawn.t-=dt;if(s.spawn.t<=0){J.Infantry.spawn(s);s.spawn.count++;s.spawn.t=s.scenario.spawnDuration/s.scenario.infantryCount*(.68+s.rng()*.48);}
      }
      J.Infantry.update(s,dt);J.Vehicles.update(s,dt);J.Airborne.update(s,dt);J.Combat.update(s,dt);
      const infantryDone=s.spawn.count>=s.scenario.infantryCount&&s.enemies.every(e=>e.state==='DEAD');
      if(infantryDone&&J.Vehicles.allResolved(s)&&J.Airborne.allResolved(s)){
        s.completeT+=dt;if(s.completeT>C.level.completeDelay&&!s.levelComplete){s.levelComplete=true;s.mode='complete';showComplete();}
      }else s.completeT=0;
    }else if(s.mode==='gameover'){
      J.Infantry.update(s,dt);J.Vehicles.update(s,dt);J.Airborne.update(s,dt);J.Combat.update(s,dt);showGameOver();
    }
  }

  function showComplete(){
    const nextIndex=(s.campaign.index+1)%9,nextCycle=s.campaign.index===8?s.campaign.cycle+1:s.campaign.cycle,next=J.Scenarios.get(nextIndex,nextCycle);
    title.textContent=`${s.scenario.label} SECURE`;
    sub.innerHTML=`${s.stats.kills} infantry · ${s.stats.vehicleKills} vehicles · ${s.stats.airKills} airborne<br><span>Volgende: ${next.label}${nextCycle>s.campaign.cycle?` · CYCLE ${nextCycle}`:''}</span>`;
    deploy.style.display='none';restart.style.display='inline-flex';restart.textContent=s.campaign.index===8?'START NEXT CYCLE':'NEXT MAP';overlay.classList.remove('hidden');
  }
  function showGameOver(){
    if(!overlay.classList.contains('hidden'))return;title.textContent=`${s.scenario.label} · BUNKER OVERRUN`;sub.innerHTML=`De linie is gebroken.<br><span>Herstart dezelfde map.</span>`;deploy.style.display='none';restart.style.display='inline-flex';restart.textContent='REDEPLOY';overlay.classList.remove('hidden');
  }

  function loop(ts){
    if(!s.lastTs)s.lastTs=ts;let frame=Math.min(C.maxFrameDelta,(ts-s.lastTs)/1000);s.lastTs=ts;s.accumulator+=frame;const inst=1/Math.max(.001,frame);s.fpsSmoothed=U.lerp(s.fpsSmoothed,inst,.05);s.quality=s.fpsSmoothed<48?Math.max(.55,s.quality-.005):Math.min(1,s.quality+.002);let steps=0;
    while(s.accumulator>=C.step&&steps<6){update(C.step);s.accumulator-=C.step;steps++;}J.Render.render(s,ctx);requestAnimationFrame(loop);
  }
  window.addEventListener('DOMContentLoaded',setup);
})();
