(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;
  let s,canvas,ctx,deploy,overlay,title,sub,restart,panel,shop,hint;

  function scenarioBrief(){
    const q=s.scenario,theme=q.theme==='jungle'?'Dichte dekking · korte zichtlijnen':q.theme==='desert'?'Open terrein · lange zichtlijnen':'Open sneeuwveld · snellere voertuigen';
    return `${theme}<br><span>LONG FRONT · ±${C.scale.apparentRangeMeters}m zicht · eerst contact op afstand, daarna close pressure</span><br><span>Tik = BURST · kort vasthouden = AP · lang vasthouden = HE</span>`;
  }

  function ensureShopDom(){
    panel=overlay.querySelector('.panel');
    shop=document.createElement('div');shop.id='shop';shop.className='shop';shop.style.display='none';
    panel.insertBefore(shop,restart);
    hint=panel.querySelector('.hint');
    panel.addEventListener('click',e=>{
      const btn=e.target.closest('[data-upgrade]');
      if(!btn||s.mode!=='complete')return;
      const key=btn.getAttribute('data-upgrade');
      if(J.Progress.tryBuyUpgrade(s,key)){ J.Audio.play('armorImpact',{x:s.viewport.w*.5,variation:Math.random()}); renderShop(); sub.innerHTML=completeSubtext(); }
      else J.Audio.play('ricochet',{x:s.viewport.w*.5,variation:Math.random()});
    });
  }

  function initialiseScenario(index=s.campaign.index,cycle=s.campaign.cycle){
    J.Scenarios.apply(s,index,cycle); J.Progress.refreshState(s,true); J.Particles.init(s); J.Combat.init(s); J.World.resize(s,canvas);
    s.levelRewardGranted=false; title.textContent=s.scenario.label; sub.innerHTML=scenarioBrief(); deploy.style.display='inline-flex'; restart.style.display='none'; deploy.textContent='DEPLOY'; shop.style.display='none'; shop.innerHTML=''; hint.textContent='Verre contacten zijn klein maar hebben royale hitboxes · vuur ook op stofcontacten'; overlay.classList.remove('hidden');
  }

  function startPlaying(){
    J.Audio.unlock(s); s.mode='playing'; s.deployed=true; overlay.classList.add('hidden'); s.ui.message=s.scenario.label; s.ui.messageT=.9;
    if(C.stress){
      for(let i=0;i<25;i++)J.Infantry.spawn(s);
      for(const [i,t] of ['technical','truck','halftrack','stug','tank'].entries())J.Vehicles.spawn(s,t,(i-2)*.12);
      s.vehicleWave.started=true; s.vehicleWave.index=s.scenario.vehicleSchedule.length; s.vehicleWave.finished=true; s.spawn.count=s.scenario.infantryCount;
      if(s.scenario.airborneCount>0)J.Airborne.start(s);else s.airborne.finished=true;
      J.Particles.emit(s,'dirt',s.viewport.w*.5,s.viewport.h*.42,220,{speedMin:20,speedMax:180,life:1.2,gravity:90,size:2});
      J.Particles.emit(s,'smoke',s.viewport.w*.5,s.viewport.h*.38,80,{speedMin:10,speedMax:90,life:1.8,size:7,vy:-18});
    }
  }

  function setup(){
    canvas=document.getElementById('game'); ctx=canvas.getContext('2d',{alpha:false}); deploy=document.getElementById('deploy'); overlay=document.getElementById('overlay'); title=document.getElementById('title'); sub=document.getElementById('sub'); restart=document.getElementById('restart');
    ensureShopDom();
    s=J.makeState(); J.Progress.refreshState(s,true); J.SpriteSystem.init(); J.Input.init(s,canvas); window.__JBD_STATE__=s; initialiseScenario(0,1);
    const onResize=()=>J.World.resize(s,canvas); window.addEventListener('resize',onResize,{passive:true}); window.addEventListener('orientationchange',()=>setTimeout(onResize,120),{passive:true});
    deploy.addEventListener('click',startPlaying);
    restart.addEventListener('click',()=>{
      const wasComplete=s.mode==='complete';
      if(wasComplete)J.Scenarios.advance(s);else J.Scenarios.apply(s,s.campaign.index,s.campaign.cycle);
      J.Progress.refreshState(s,true); J.Particles.init(s); J.Combat.init(s); J.World.resize(s,canvas); startPlaying();
    });
    requestAnimationFrame(loop);
  }

  function rewardForScenario(){
    const themeBonus=s.scenario.theme==='polar'?10:s.scenario.theme==='desert'?6:4;
    const survival=Math.round((s.bunker.hp/(s.bunker.maxHp||1))*12);
    return 20 + s.scenario.number*8 + themeBonus + (s.campaign.cycle-1)*12 + s.stats.vehicleKills*6 + s.stats.airKills*8 + survival;
  }

  function completeSubtext(){
    return `${s.stats.kills} infantry · ${s.stats.vehicleKills} vehicles · ${s.stats.airKills} airborne<br><span>Reward +${s.lastReward||0} supply · totaal ${s.save.supply} supply</span>`;
  }

  function upgradeText(key,lvl){
    switch(key){
      case 'caliber': return `+3 MG dmg · +6 AP dmg · +10 HE dmg per level`;
      case 'burst': return `+1 MG burst per level · iets sneller salvo`;
      case 'charge': return `AP / HE charge ${Math.round((1+(lvl+1)*0.16)*100)}% speed`;
      case 'he': return `HE radius +8 · HE dmg +14 per level`;
      case 'armor': return `Bunker HP +18 · damage resist +8% per level`;
      default: return '';
    }
  }

  function renderShop(){
    const upgrades=C.campaign.upgrades;
    const rows=Object.keys(upgrades).map(key=>{
      const cfg=upgrades[key], lvl=s.save.upgrades[key]|0, cost=J.Progress.upgradeCost(key,lvl), maxed=lvl>=cfg.max, disabled=maxed||s.save.supply<(cost||0);
      return `<button class="shopBtn${disabled?' disabled':''}" ${disabled?'disabled':''} data-upgrade="${key}"><div class="shopTop"><span>${cfg.label}</span><strong>LVL ${lvl}/${cfg.max}</strong></div><div class="shopMeta">${upgradeText(key,lvl)}</div><div class="shopCost">${maxed?'MAXED':`BUY · ${cost} SUPPLY`}</div></button>`;
    }).join('');
    shop.innerHTML=`<div class="shopTitle">FIELD WORKSHOP · LONG FRONT</div><div class="shopGrid">${rows}</div>`;
    shop.style.display='block';
  }

  function update(dt){
    s.simTime+=dt; s.trauma=Math.max(0,s.trauma-dt*.8); s.ui.messageT=Math.max(0,s.ui.messageT-dt); J.Input.update(s,dt);
    if(s.mode==='playing'){
      J.Combat.updateArtillery(s,dt);
      const artDur=s.scenario?.artilleryDuration||C.artillery.duration;
      if(s.artillery.t>C.artillery.introDelay+artDur*.72&&s.spawn.count<s.scenario.infantryCount){ s.spawn.t-=dt; if(s.spawn.t<=0){ J.Infantry.spawn(s); s.spawn.count++; s.spawn.t=s.scenario.spawnDuration/s.scenario.infantryCount*(.68+s.rng()*.48); } }
      J.Infantry.update(s,dt); J.Vehicles.update(s,dt); J.Airborne.update(s,dt); J.Combat.update(s,dt);
      const infantryDone=s.spawn.count>=s.scenario.infantryCount&&s.enemies.every(e=>e.state==='DEAD');
      if(infantryDone&&J.Vehicles.allResolved(s)&&J.Airborne.allResolved(s)){ s.completeT+=dt; if(s.completeT>C.level.completeDelay&&!s.levelComplete){ s.levelComplete=true; s.mode='complete'; showComplete(); } } else s.completeT=0;
    }else if(s.mode==='gameover'){
      J.Infantry.update(s,dt); J.Vehicles.update(s,dt); J.Airborne.update(s,dt); J.Combat.update(s,dt); showGameOver();
    }
  }

  function showComplete(){
    const nextIndex=(s.campaign.index+1)%9, nextCycle=s.campaign.index===8?s.campaign.cycle+1:s.campaign.cycle, next=J.Scenarios.get(nextIndex,nextCycle);
    if(!s.levelRewardGranted){
      s.lastReward=rewardForScenario(); s.save.supply+=s.lastReward; s.save.totalMapsCleared=(s.save.totalMapsCleared||0)+1; s.save.bestCycle=Math.max(s.save.bestCycle||1,nextCycle); J.Progress.saveNow(s.save); s.levelRewardGranted=true;
    }
    title.textContent=`${s.scenario.label} SECURE`; sub.innerHTML=completeSubtext(); deploy.style.display='none'; restart.style.display='inline-flex'; restart.textContent=s.campaign.index===8?'START NEXT CYCLE':'NEXT MAP'; renderShop(); hint.textContent=`Volgende: ${next.label}${nextCycle>s.campaign.cycle?` · CYCLE ${nextCycle}`:''}`; overlay.classList.remove('hidden');
  }

  function showGameOver(){
    if(!overlay.classList.contains('hidden'))return; title.textContent=`${s.scenario.label} · BUNKER OVERRUN`; sub.innerHTML=`De linie is gebroken.<br><span>Herstart dezelfde map. Je upgrades blijven bewaard.</span>`; deploy.style.display='none'; restart.style.display='inline-flex'; restart.textContent='REDEPLOY'; shop.style.display='none'; shop.innerHTML=''; hint.textContent='Tip: gebruik upgrades tussen maps om je bunker sterker te maken'; overlay.classList.remove('hidden');
  }

  function loop(ts){
    if(!s.lastTs)s.lastTs=ts; let frame=Math.min(C.maxFrameDelta,(ts-s.lastTs)/1000); s.lastTs=ts; s.accumulator+=frame; const inst=1/Math.max(.001,frame); s.fpsSmoothed=U.lerp(s.fpsSmoothed,inst,.05); s.quality=s.fpsSmoothed<48?Math.max(.55,s.quality-.005):Math.min(1,s.quality+.002); let steps=0;
    while(s.accumulator>=C.step&&steps<6){ update(C.step); s.accumulator-=C.step; steps++; } J.Render.render(s,ctx); requestAnimationFrame(loop);
  }
  window.addEventListener('DOMContentLoaded',setup);
})();
