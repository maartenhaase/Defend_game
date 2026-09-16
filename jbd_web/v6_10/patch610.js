/* JBD v6.10 — air assault infantry, persistent HD craters, upgrade screen after every map */
(()=>{
  const wait=()=>{
    const J=window.JBD;
    if(!J||!J.Render||!J.World||!J.Scenarios||!J.Infantry||!J.Progress||!J.U){setTimeout(wait,35);return;}
    if(J.__v610)return; J.__v610=true;
    const U=J.U;
    const state=()=>window.__JBD_STATE__||null;

    /* ----------------------------------------------------------
       1) PACE: less walking from the horizon, much more pressure.
       Most maps now get troops inserted in the middle of the field.
    ---------------------------------------------------------- */
    const oldApply=J.Scenarios.apply.bind(J.Scenarios);
    const oldAdvance=J.Scenarios.advance.bind(J.Scenarios);
    function tuneScenario(q){
      if(!q||q._v610Tuned)return q;
      q._v610Tuned=true;
      const i=q.index||0;
      const targets=[12,14,16,15,17,18,16,18,20];
      q.infantryCount=Math.max(q.infantryCount||0,targets[i]||16);
      q.spawnDuration=Math.max(16,Math.min(23,16+i*.8));
      const minSpeed=i===0?1.68:i===1?1.62:i===2?1.58:1.52;
      q.infantrySpeedMult=Math.max(q.infantrySpeedMult||1,minSpeed);
      q.coverSearchRadius=(q.coverSearchRadius||180)*.82;
      q.airborneCount=0;q.airborneStart=99;q.helicopterEnabled=false;q.helicopterStart=99;
      return q;
    }
    function resetAir(s){
      if(!s)return;
      s._v610Air={seed:s.scenario?.seed??0,events:null,drops:[],visuals:[],done:false};
      if(s.airborne)s.airborne.finished=false;
      s._v610CraterCanvas=null;
      s._v610ExplosionSeen=new WeakSet();
      s._v610UpgradeShown=false;
    }
    J.Scenarios.apply=function(s,index=s.campaign.index,cycle=s.campaign.cycle){const out=oldApply(s,index,cycle);tuneScenario(s.scenario);resetAir(s);return out;};
    J.Scenarios.advance=function(s){const out=oldAdvance(s);tuneScenario(s.scenario);resetAir(s);return out;};

    /* ----------------------------------------------------------
       2) AIR ASSAULT: visible transports and helicopters insert
       infantry around the middle of the map instead of forcing every
       soldier to walk all the way from the top edge.
    ---------------------------------------------------------- */
    function scheduleFor(s){
      const i=s.scenario?.index||0;
      const n=(type,t,count,x=.58,y=.34)=>({type,t,count,x,y,started:false,completed:false});
      const plans=[
        [n('heli',1.3,3,.68,.34), n('plane',5.2,4,.48,.38), n('heli',10.0,2,.32,.46)],
        [n('plane',1.5,4,.42,.35), n('heli',5.4,3,.70,.42), n('plane',10.2,3,.58,.48)],
        [n('heli',1.4,3,.30,.38), n('plane',4.8,4,.62,.40), n('heli',9.0,3,.72,.50)],
        [n('plane',1.7,4,.38,.36), n('heli',5.8,3,.68,.45), n('plane',11.0,4,.54,.52)],
        [n('heli',1.3,4,.72,.35), n('plane',4.6,4,.42,.43), n('heli',9.2,3,.30,.51)],
        [n('plane',1.2,5,.55,.36), n('heli',5.0,4,.72,.46), n('plane',9.6,4,.38,.53)],
        [n('heli',1.4,4,.30,.37), n('plane',4.4,4,.62,.44), n('heli',9.0,3,.72,.52)],
        [n('plane',1.1,5,.40,.36), n('heli',4.8,4,.68,.45), n('plane',8.8,4,.58,.53)],
        [n('heli',1.0,4,.72,.35), n('plane',3.8,5,.42,.42), n('heli',7.3,4,.30,.50), n('plane',11.0,4,.62,.56)]
      ];
      return plans[i]||plans[0];
    }
    function ensureAir(s){
      if(!s._v610Air||s._v610Air.seed!==(s.scenario?.seed??0))resetAir(s);
      if(!s._v610Air.events)s._v610Air.events=scheduleFor(s);
      return s._v610Air;
    }
    function newEnemySince(s,before){
      for(let i=(s.enemies||[]).length-1;i>=0;i--){const e=s.enemies[i];if(e&&!before.has(e.id))return e;}
      return null;
    }
    function spawnInfantryAt(s,x,y,source='air'){
      if(!J.Infantry?.spawn)return null;
      if((s.spawn?.count??0)>=(s.scenario?.infantryCount??999))return null;
      const beforeIds=new Set((s.enemies||[]).map(e=>e.id));
      const beforeCount=s.spawn?.count??0;
      try{J.Infantry.spawn(s);}catch(_){return null;}
      if((s.spawn?.count??0)===beforeCount)s.spawn.count=beforeCount+1;
      const e=newEnemySince(s,beforeIds);
      if(!e)return null;
      e.x=U.clamp(x+(-11+Math.random()*22),18,s.viewport.w-18);
      e.y=U.clamp(y+(-8+Math.random()*16),(s.safe?.top||0)+100,s.bunker.y-105);
      e.inBuilding=0;e.cover=null;e.coverIntent=false;e.reCoverT=2.4+Math.random()*1.8;
      e.state='ADVANCE';e.stateT=0;e.pose='walk';e._v610Inserted=source;e._v699Still=0;
      e.vx=0;e.vy=Math.max(e.vy||0,1.4);
      return e;
    }
    function queueParatroopers(s,event){
      const air=ensureAir(s),w=s.viewport.w,h=s.viewport.h;
      for(let k=0;k<event.count;k++){
        const tx=U.clamp(w*(event.x||.52)+(k-(event.count-1)/2)*19,28,w-28);
        const ty=U.clamp(h*(event.y||.40)+(k%2)*18,(s.safe?.top||0)+145,s.bunker.y-125);
        air.drops.push({x:tx+(-7+Math.random()*14),y0:(s.safe?.top||0)+95,y:ty,t:0,dur:1.35+Math.random()*.45,landed:false});
      }
    }
    function startAirEvent(s,e){
      e.started=true;e.start=s.simTime||0;
      const w=s.viewport.w,h=s.viewport.h;
      if(e.type==='plane')ensureAir(s).visuals.push({type:'plane',event:e,t:0,dur:3.4,x0:-80,x1:w+80,y:h*.20});
      else ensureAir(s).visuals.push({type:'heli',event:e,t:0,dur:4.8,x0:w+70,x1:w*(e.x||.65),y:h*(e.y||.38)});
    }
    function updateAir(s,dt){
      if(!s||s.mode!=='playing'||s.levelComplete)return;
      const air=ensureAir(s),t=s.simTime||0;
      for(const e of air.events){if(!e.started&&t>=e.t)startAirEvent(s,e);}
      for(const v of air.visuals){
        v.t+=dt;const p=U.clamp(v.t/v.dur,0,1);
        if(!v.dropped){
          if(v.type==='plane'&&p>.44){v.dropped=true;queueParatroopers(s,v.event);}
          if(v.type==='heli'&&p>.46){v.dropped=true;const x=s.viewport.w*(v.event.x||.65),y=s.viewport.h*(v.event.y||.40);for(let k=0;k<v.event.count;k++)spawnInfantryAt(s,x+(k-(v.event.count-1)/2)*14,y+(k%2)*10,'heli');}
        }
        if(p>=1)v.event.completed=true;
      }
      air.visuals=air.visuals.filter(v=>v.t<v.dur+.15);
      for(const d of air.drops){if(d.landed)continue;d.t+=dt;if(d.t>=d.dur){d.landed=true;spawnInfantryAt(s,d.x,d.y,'parachute');}}
      air.drops=air.drops.filter(d=>!d.landed);
      air.done=air.events.every(e=>e.completed)&&air.drops.length===0&&air.visuals.length===0;
      if(s.airborne)s.airborne.finished=air.done;
    }
    function drawPlane(ctx,x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(-21,5,42,5);ctx.fillStyle='#596354';ctx.fillRect(-18,-3,36,8);ctx.fillRect(-6,-13,12,28);ctx.fillStyle='#7d8875';ctx.fillRect(-23,-1,46,4);ctx.fillStyle='#343b31';ctx.fillRect(12,-2,7,6);ctx.restore();}
    function drawHeli(ctx,x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='rgba(0,0,0,.17)';ctx.beginPath();ctx.ellipse(2,7,18,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#56624f';ctx.beginPath();ctx.ellipse(0,0,13,8,0,0,Math.PI*2);ctx.fill();ctx.fillRect(10,-2,16,4);ctx.strokeStyle='#2c332a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(24,0);ctx.moveTo(0,-18);ctx.lineTo(0,18);ctx.stroke();ctx.fillStyle='#879078';ctx.fillRect(-5,-4,8,4);ctx.restore();}
    function drawAir(ctx,s){
      const air=ensureAir(s),w=s.viewport.w;
      for(const v of air.visuals){const p=U.clamp(v.t/v.dur,0,1);if(v.type==='plane'){const x=v.x0+(v.x1-v.x0)*p;drawPlane(ctx,x,v.y,1.1);}else{let x;if(p<.35)x=v.x0+(v.x1-v.x0)*(p/.35);else if(p<.72)x=v.x1;else x=v.x1+(w+80-v.x1)*((p-.72)/.28);drawHeli(ctx,x,v.y,1.1);}}
      for(const d of air.drops){const p=U.clamp(d.t/d.dur,0,1),y=d.y0+(d.y-d.y0)*p;ctx.save();ctx.translate(d.x,y);ctx.strokeStyle='#d7d4b5';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-8,9,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.moveTo(-8,-8);ctx.lineTo(-2,0);ctx.moveTo(8,-8);ctx.lineTo(2,0);ctx.stroke();ctx.fillStyle='#3f4938';ctx.fillRect(-2,0,4,7);ctx.restore();}
    }

    /* ----------------------------------------------------------
       3) PERSISTENT HIGH-RES CRATERS.
    ---------------------------------------------------------- */
    function craterSeed(x,y,n){return (((x*73856093)^(y*19349663)^(n*83492791))>>>0);}
    function paintCrater(s,x,y,r){
      const g=s.damageCtx;if(!g)return;const n=(s._v610CraterCount=(s._v610CraterCount||0)+1),rand=U.mulberry32(craterSeed(Math.round(x),Math.round(y),n));
      r=U.clamp(r,7,24);g.save();g.translate(x,y);g.imageSmoothingEnabled=true;
      const pts=(rad,jitter)=>{const a=[];for(let i=0;i<24;i++){const ang=i/24*Math.PI*2,rr=rad*(1-jitter/2+rand()*jitter);a.push([Math.cos(ang)*rr,Math.sin(ang)*rr*.78]);}return a;};
      const path=(arr)=>{g.beginPath();g.moveTo(arr[0][0],arr[0][1]);for(let i=1;i<arr.length;i++)g.lineTo(arr[i][0],arr[i][1]);g.closePath();};
      path(pts(r,0.28));g.fillStyle='rgba(56,45,34,.76)';g.fill();path(pts(r*.78,0.23));g.fillStyle='rgba(35,31,27,.82)';g.fill();path(pts(r*.48,0.20));g.fillStyle='rgba(20,21,19,.70)';g.fill();
      g.strokeStyle='rgba(194,168,112,.30)';g.lineWidth=1.2;g.beginPath();g.arc(-r*.12,-r*.08,r*.74,Math.PI*.95,Math.PI*1.75);g.stroke();
      for(let i=0;i<18;i++){const a=rand()*Math.PI*2,rr=r*(.35+rand()*.78),sz=.7+rand()*1.5;g.fillStyle=rand()>.5?'rgba(31,27,23,.72)':'rgba(112,86,56,.58)';g.fillRect(Math.cos(a)*rr,Math.sin(a)*rr*.76,sz,sz);}g.restore();
    }
    function captureCraters(s){
      if(!s?.damageCtx||!s.damageCanvas)return;
      if(s._v610CraterCanvas!==s.damageCanvas){s._v610CraterCanvas=s.damageCanvas;s._v610ExplosionSeen=new WeakSet();s._v610CraterCount=0;}
      const seen=s._v610ExplosionSeen||(s._v610ExplosionSeen=new WeakSet());
      for(const ex of s.explosions||[]){if(!ex||typeof ex!=='object'||seen.has(ex)||!Number.isFinite(ex.x)||!Number.isFinite(ex.y))continue;seen.add(ex);const raw=Number(ex.radius??ex.r??ex.maxRadius??ex.size??14);paintCrater(s,ex.x,ex.y,U.clamp(raw*.22,8,22));}
    }

    /* ----------------------------------------------------------
       4) UPGRADE SCREEN AFTER EVERY MAP.
    ---------------------------------------------------------- */
    const UPG={caliber:'Damage',burst:'Burst',charge:'Charge speed',range:'Range',cooling:'Cooling',he:'HE blast',armor:'Armor'};
    function injectUpgradeUI(){
      if(document.getElementById('v610Upgrade'))return;
      const st=document.createElement('style');st.textContent=`#v610Upgrade{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top) + 16px) 16px calc(env(safe-area-inset-bottom) + 16px);background:rgba(8,11,8,.86);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}#v610Upgrade.show{display:flex}.v610p{width:min(94vw,430px);max-height:90vh;overflow:auto;background:#181d16;border:1px solid #555f49;border-radius:16px;padding:18px;color:#edf0dc;box-shadow:0 20px 70px rgba(0,0,0,.55)}.v610top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:12px}.v610ttl{font:900 22px system-ui;margin:0}.v610sup{font:900 21px ui-monospace,monospace;color:#e1c76d}.v610sub{font:700 10px ui-monospace,monospace;color:#9fa990;margin:4px 0 14px}.v610grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v610btn{appearance:none;border:1px solid #48513f;background:#252c21;color:#eef0dc;border-radius:10px;padding:10px;text-align:left;min-height:67px}.v610btn:disabled{opacity:.42}.v610name{display:flex;justify-content:space-between;font:800 11px ui-monospace,monospace}.v610meta{font:700 9px ui-monospace,monospace;color:#9ea88e;margin-top:6px}.v610cost{color:#e2c568}.v610continue{width:100%;margin-top:12px;border:0;border-radius:11px;background:#d7bb65;color:#171a14;font:900 13px system-ui;padding:14px}`;document.head.appendChild(st);
      const el=document.createElement('div');el.id='v610Upgrade';el.innerHTML=`<div class="v610p"><div class="v610top"><div><h2 class="v610ttl">UPGRADES</h2><div class="v610sub" id="v610Reward"></div></div><div class="v610sup" id="v610Supply"></div></div><div class="v610grid" id="v610Grid"></div><button class="v610continue" id="v610Continue">NEXT MAP</button></div>`;document.body.appendChild(el);el.querySelector('#v610Continue').addEventListener('click',continueAfterUpgrade);
    }
    function rewardFor(s){const map=(s.campaign?.index||0)+1,k=(s.stats?.kills||0)+(s.stats?.vehicleKills||0)+(s.stats?.airKills||0);return 42+map*7+Math.min(30,k*2);}
    function renderUpgrade(s,reward=0){
      injectUpgradeUI();const el=document.getElementById('v610Upgrade'),grid=document.getElementById('v610Grid');if(!el||!grid)return;
      document.getElementById('v610Supply').textContent=`${s.save?.supply||0} SUP`;
      document.getElementById('v610Reward').textContent=reward?`MAP CLEARED · +${reward} SUPPLY`:`CHOOSE AN UPGRADE OR CONTINUE`;
      grid.innerHTML='';
      for(const key of Object.keys(UPG)){
        const cfg=J.CONFIG?.campaign?.upgrades?.[key];if(!cfg)continue;const lvl=s.save?.upgrades?.[key]||0,cost=J.Progress.upgradeCost(key,lvl),max=lvl>=cfg.max;
        const b=document.createElement('button');b.className='v610btn';b.disabled=max||cost==null||(s.save?.supply||0)<cost;b.innerHTML=`<div class="v610name"><span>${UPG[key].toUpperCase()}</span><span>LV ${lvl}/${cfg.max}</span></div><div class="v610meta">${max?'MAXIMUM':`NEXT <span class="v610cost">${cost} SUP</span>`}</div>`;
        b.addEventListener('click',()=>{if(J.Progress.tryBuyUpgrade(s,key)){renderUpgrade(s,0);}});grid.appendChild(b);
      }
      el.classList.add('show');
    }
    function showUpgrade(s){if(!s||s._v610UpgradeShown)return;s._v610UpgradeShown=true;const reward=rewardFor(s);s.save=s.save||J.Progress.defaultSave();s.save.supply=(s.save.supply||0)+reward;s.save.totalMapsCleared=(s.save.totalMapsCleared||0)+1;J.Progress.saveNow(s.save);renderUpgrade(s,reward);}
    function prepareFallbackNext(s){
      J.Scenarios.advance(s);if(J.Particles?.init)J.Particles.init(s);if(J.Combat?.init)J.Combat.init(s);const c=document.getElementById('game');if(c)J.World.resize(s,c);
      const ov=document.getElementById('overlay'),ti=document.getElementById('title'),su=document.getElementById('sub'),de=document.getElementById('deploy'),re=document.getElementById('restart');
      if(ti)ti.textContent=s.scenario?.label||`MAP ${(s.campaign?.index||0)+1}`;if(su)su.innerHTML=`MAP ${(s.campaign?.index||0)+1}/9 READY<br><span>Air assault · faster infantry · persistent craters</span>`;if(de){de.textContent='DEPLOY';de.style.display='inline-flex';de.dataset.v693='deploy';}if(re)re.style.display='none';if(ov)ov.classList.remove('hidden');
    }
    function continueAfterUpgrade(){const s=state(),el=document.getElementById('v610Upgrade');if(el)el.classList.remove('show');if(!s)return;const btn=document.getElementById('deploy');if(btn?.dataset?.v693==='next')btn.click();else prepareFallbackNext(s);}

    /* ----------------------------------------------------------
       5) Render/update integration.
    ---------------------------------------------------------- */
    const oldRender=J.Render.render.bind(J.Render);let last=performance.now();
    J.Render.render=function(s,ctx){const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(s?.scenario)tuneScenario(s.scenario);updateAir(s,dt);captureCraters(s);const out=oldRender(s,ctx);if(s?.mode==='playing')drawAir(ctx,s);return out;};
    setInterval(()=>{const s=state();if(!s)return;if(s.levelComplete){setTimeout(()=>{const ss=state();if(ss?.levelComplete)showUpgrade(ss);},220);}},160);

    const initial=()=>{const s=state();if(!s||!s.scenario){setTimeout(initial,70);return;}tuneScenario(s.scenario);resetAir(s);injectUpgradeUI();const ti=document.getElementById('title'),su=document.getElementById('sub');if(ti)ti.textContent='JBD V6.10 · AIR ASSAULT';if(su)su.innerHTML='Meer actie en veel minder lopen vanaf de horizon.<br><span>Helikopters · paratroopers · blijvende HD-kraters · upgrades na elke map</span>';};initial();
    console.info('JBD v6.10 air assault / craters / upgrades active');
  };
  wait();
})();
