/* JBD v6.9.3 — campaign restore + infantry flow + clean readability */
(()=>{
  const wait=()=>{
    const J=window.JBD;
    if(!J||!J.Infantry||!J.Render||!J.Scale||!J.World||!J.Scenarios||!J.Particles||!J.Combat||!J.CONFIG){setTimeout(wait,35);return;}
    if(J.__v693)return; J.__v693=true;
    const U=J.U,C=J.CONFIG;
    const BUILDING_CAP={house:2,shed:1,barn:3};

    function state(){return window.__JBD_STATE__||null;}
    function elements(){return {
      overlay:document.getElementById('overlay'), title:document.getElementById('title'), sub:document.getElementById('sub'),
      deploy:document.getElementById('deploy'), restart:document.getElementById('restart'), canvas:document.getElementById('game')
    };}
    function mapNo(s){return Math.max(1,Math.min(9,(s?.campaign?.index??s?.scenario?.index??0)+1));}
    function mapBrief(s){
      const q=s?.scenario||{}; const theme=(q.theme||'jungle').toUpperCase();
      const action=q.action?` · ${q.action}`:'';
      return `${theme} · MAP ${mapNo(s)}/9${action}<br><span>Volledige campaign · map wisselt na clear · tik = BURST · kort vasthouden = AP · lang vasthouden = HE</span>`;
    }
    function showBrief(s,next=false){
      const el=elements(); if(!el.overlay)return;
      el.title.textContent=next?`${s.scenario?.label||'MAP'} READY`:(s.scenario?.label||`MAP ${mapNo(s)}`);
      el.sub.innerHTML=mapBrief(s);
      el.deploy.textContent='DEPLOY'; el.deploy.style.display='inline-flex';
      if(el.restart)el.restart.style.display='none';
      el.overlay.classList.remove('hidden');
      el.deploy.dataset.v693='deploy';
    }

    /* ---------- Buildings, but without the floating action/class signs ---------- */
    function initBuildings(s){
      if(!s?.map?.buildings)return;
      if(s._v693BuildingSeed===s.scenario?.seed)return;
      s._v693BuildingSeed=s.scenario?.seed; s._v693BuildingById={};
      for(let i=0;i<s.map.buildings.length;i++){
        const b=s.map.buildings[i]; b.bid=i+1; b.capacity=BUILDING_CAP[b.kind]||2; b.occupants=[]; s._v693BuildingById[b.bid]=b;
      }
    }
    function slots(b){
      const w=Math.max(18,b.w||24),h=Math.max(16,b.h||18);
      if(b.kind==='barn')return[{x:-w*.22,y:h*.06},{x:0,y:-h*.02},{x:w*.22,y:h*.06}];
      if(b.kind==='shed')return[{x:0,y:h*.04}];
      return[{x:-w*.18,y:h*.08},{x:w*.18,y:h*.08},{x:0,y:-h*.10}];
    }
    function removeBuilding(s,e,cooldown=true){
      if(!e)return;
      if(e.inBuilding){const b=s._v693BuildingById?.[e.inBuilding];if(b?.occupants)b.occupants=b.occupants.filter(id=>id!==e.id);}
      e.inBuilding=0;e._windowSlot=0;
      if(e.cover?.type==='building')e.cover=null;
      if(cooldown)e._v693BuildingCooldown=5+Math.random()*5;
    }
    function cleanupBuildings(s){
      initBuildings(s); const live=new Map((s.enemies||[]).map(e=>[e.id,e]));
      for(const b of s.map?.buildings||[])b.occupants=(b.occupants||[]).filter(id=>{const e=live.get(id);return !!(e&&e.state!=='DEAD'&&e.inBuilding===b.bid);});
    }
    function nearestBuilding(s,e,maxDist){
      let best=null,bd=1e9; initBuildings(s);
      for(const b of s.map?.buildings||[]){if((b.occupants?.length||0)>=b.capacity)continue;const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<maxDist&&d<bd){best=b;bd=d;}}
      return best;
    }
    function putInBuilding(s,e,b){
      if(!b||e.state==='DEAD'||e.inBuilding)return false;
      removeBuilding(s,e,false); if((b.occupants?.length||0)>=b.capacity)return false;
      b.occupants.push(e.id);e.inBuilding=b.bid;e._windowSlot=b.occupants.length-1;
      const sl=slots(b)[Math.min(e._windowSlot,slots(b).length-1)]||{x:0,y:0};
      e.x=b.x+sl.x;e.y=b.y+sl.y;e.vx=0;e.vy=0;e.pose='crouch';e.coverIntent=false;e.pronePreference=false;
      e.cover={id:930000+b.bid,type:'building',x:b.x,y:b.y,radius:20,coverStrength:.92,occupiedBy:e.id};
      e.state='FIRE_FROM_COVER';e.stateT=0;e._v693GarrisonT=4.5+Math.random()*5.5;e.fireT=Math.max(e.fireT||0,.8+Math.random()*1.8);
      return true;
    }
    function releaseToAdvance(s,e,delay=2.2){
      if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;
      removeBuilding(s,e,true);e.cover=null;e.coverIntent=false;e.reCoverT=delay+Math.random()*1.8;e.state='ADVANCE';e.stateT=0;e.pose='walk';e.vx=e.vx||0;e.vy=Math.max(.01,e.vy||0);e._v693StillT=0;
    }

    const oldDamage=J.Infantry.damage;
    J.Infantry.damage=function(s,e,amount,kind,x,y){
      if(e?.inBuilding){amount*=kind==='mg'?.46:kind==='ap'?.70:kind==='he'?.94:.58;}
      const out=oldDamage(s,e,amount,kind,x,y); if(e?.state==='DEAD')removeBuilding(s,e,false); return out;
    };

    const oldUpdate=J.Infantry.update;
    J.Infantry.update=function(s,dt){
      initBuildings(s);
      const before=new Map();
      for(const e of s.enemies||[])before.set(e.id,{x:e.x,y:e.y});
      oldUpdate(s,dt); cleanupBuildings(s);
      const baseRange=s.scenario?.infantryRange||C.infantry.range;
      for(const e of s.enemies||[]){
        if(e.state==='DEAD'){removeBuilding(s,e,false);continue;}
        e._v693BuildingCooldown=Math.max(0,(e._v693BuildingCooldown||0)-dt);
        const prev=before.get(e.id),moved=prev?Math.hypot(e.x-prev.x,e.y-prev.y):1;
        e._v693StillT=(moved<.035)?(e._v693StillT||0)+dt:0;
        const dB=Math.hypot(s.bunker.x-e.x,s.bunker.y-e.y),key=e.classKey||e.type||'rifleman',prog=J.Scale.progress(s,e.y);

        if(e.inBuilding){
          const b=s._v693BuildingById?.[e.inBuilding];
          if(!b){releaseToAdvance(s,e);continue;}
          const arr=slots(b),idx=Math.max(0,(b.occupants||[]).indexOf(e.id)),sl=arr[Math.min(idx,arr.length-1)]||{x:0,y:0};
          e.x=b.x+sl.x;e.y=b.y+sl.y;e.vx=0;e.vy=0;e.pose='crouch';e._v693GarrisonT=(e._v693GarrisonT||5)-dt;
          if(e._v693GarrisonT<=0||dB<baseRange*.36){releaseToAdvance(s,e,key==='marksman'?3.4:2.0);continue;}
        }else{
          const stationaryState=e.state==='IN_COVER'||e.state==='ENTER_COVER'||e.state==='FIRE_FROM_COVER'||e.state==='DEPLOY_WEAPON'||e.state==='FIRE_FROM_WEAPON';
          const holdLimit=key==='marksman'?8.5:key==='rifleman'?6.5:key==='lmg'?6:key==='engineer'?5:4.5;
          if(stationaryState&&e._v693StillT>holdLimit&&dB>baseRange*.30&&!e.teamRole?.startsWith('mg_')){releaseToAdvance(s,e,key==='marksman'?3.2:2.1);continue;}
          if(e._v693BuildingCooldown<=0&&key!=='smg'&&prog>.25&&prog<.80){
            const wants=(e.cover?.type==='building'||e.coverIntent||e.suppression>.28||e.state==='SPRINT_TO_COVER'||e.state==='ENTER_COVER');
            if(wants){const b=nearestBuilding(s,e,key==='marksman'?52:40);if(b&&Math.random()<.16)putInBuilding(s,e,b);}
          }
        }
      }
    };

    function drawOccupiedBuildings(ctx,s){
      initBuildings(s);
      for(const b of s.map?.buildings||[]){
        const occ=(b.occupants||[]).map(id=>(s.enemies||[]).find(e=>e.id===id&&e.state!=='DEAD')).filter(Boolean);if(!occ.length)continue;
        const sc=J.Scale.terrain(s,b.y),lit=occ.some(e=>(e.muzzleT||0)>.02);
        ctx.save();ctx.translate(Math.round(b.x),Math.round(b.y));ctx.rotate(b.rot||0);ctx.scale(sc,sc);ctx.imageSmoothingEnabled=false;
        ctx.strokeStyle='rgba(10,13,10,.95)';ctx.lineWidth=4;ctx.strokeRect(-b.w/2-1,-b.h/2-1,b.w+2,b.h+2);
        ctx.fillStyle=lit?'#353425':'#292b21';ctx.fillRect(-b.w/2+2,-b.h/2+2,b.w-4,b.h-4);
        const arr=slots(b);for(let i=0;i<Math.min(arr.length,occ.length);i++){const sl=arr[i],x=Math.round(sl.x-3),y=Math.round(sl.y-2);ctx.fillStyle=lit?'#efc55e':'#9f8d4d';ctx.fillRect(x,y,6,4);ctx.fillStyle='#171914';ctx.fillRect(x+2,y+1,2,2);if((occ[i].muzzleT||0)>.02){ctx.fillStyle='#ffe17a';ctx.fillRect(x+6,y+1,3,2);}}
        ctx.fillStyle='#151913';ctx.fillRect(-5,Math.round(b.h*.08),10,Math.max(6,Math.round(b.h*.32)));ctx.restore();
      }
    }
    const oldRender=J.Render.render;
    J.Render.render=function(s,ctx){
      initBuildings(s);const all=s.enemies;let hidden=null;
      if(all?.some(e=>e.inBuilding&&e.state!=='DEAD')){hidden=all.filter(e=>e.inBuilding&&e.state!=='DEAD');s.enemies=all.filter(e=>!e.inBuilding||e.state==='DEAD');}
      try{oldRender(s,ctx);}finally{if(hidden)s.enemies=all;}
      drawOccupiedBuildings(ctx,s);
    };

    /* ---------- Restore the complete 9-map campaign on top of the 6.9 gameplay ---------- */
    function prepareCurrentMap(s){
      const el=elements();
      if(J.Particles?.init)J.Particles.init(s);
      if(J.Combat?.init)J.Combat.init(s);
      if(el.canvas&&J.World?.resize)J.World.resize(s,el.canvas);
      s._v693CompletionHandled=false;s._v693MapStarted=false;
      showBrief(s,true);
    }
    function nextMap(){
      const s=state();if(!s)return;
      J.Scenarios.advance(s);prepareCurrentMap(s);
    }
    function showClear(s){
      const el=elements();if(!el.overlay||s._v693CompletionHandled)return;
      s._v693CompletionHandled=true;
      el.title.textContent=`${s.scenario?.label||'MAP'} CLEARED`;
      el.sub.innerHTML=`Map ${mapNo(s)}/9 veilig.<br><span>${s.stats?.kills||0} infantry · ${s.stats?.vehicleKills||0} vehicles · volgende terrein na NEXT MAP</span>`;
      el.deploy.textContent='NEXT MAP';el.deploy.style.display='inline-flex';if(el.restart)el.restart.style.display='none';el.deploy.dataset.v693='next';el.overlay.classList.remove('hidden');
    }

    let suppressDeployClickUntil=0;
    const capture=e=>{
      const btn=e.target?.closest?.('#deploy');if(!btn)return;
      if(e.type==='click'&&performance.now()<suppressDeployClickUntil){e.preventDefault();e.stopImmediatePropagation();return;}
      if(btn.dataset.v693==='next'){
        e.preventDefault();e.stopImmediatePropagation();suppressDeployClickUntil=performance.now()+450;btn.dataset.v693='deploy';nextMap();
      }
    };
    document.addEventListener('pointerup',capture,true);document.addEventListener('click',capture,true);

    let lastSeed=null;
    setInterval(()=>{
      const s=state();if(!s||!s.scenario)return;
      if(lastSeed!==s.scenario.seed){lastSeed=s.scenario.seed;s._v693CompletionHandled=false;const el=elements();if(s.mode==='brief'&&!el.overlay?.classList.contains('hidden'))showBrief(s,false);}
      if(s.levelComplete)showClear(s);
      if(s.mode==='playing'&&!s.levelComplete){
        const alive=(s.enemies||[]).some(e=>e.state!=='DEAD');
        const activeVeh=(s.vehicles||[]).some(v=>v.state!=='DESTROYED'&&v.state!=='DEPARTED');
        const spawnsDone=(s.spawn?.count??0)>=(s.scenario?.infantryCount??C.level.spawnCount);
        const vehDone=s.vehicleWave?.finished!==false;
        const airDone=s.airborne?.finished!==false;
        const mobileDone=s.mobileArtillery?.finished!==false;
        if(spawnsDone&&vehDone&&airDone&&mobileDone&&!alive&&!activeVeh){s.levelComplete=true;showClear(s);}
      }
    },180);

    const initial=()=>{const s=state();if(!s||!s.scenario){setTimeout(initial,80);return;}showBrief(s,false);};initial();
    console.info('JBD v6.9.3 campaign/infantry-flow patch active');
  };
  wait();
})();