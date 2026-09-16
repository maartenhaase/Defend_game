/* JBD v6.9.6 — first-three-map game-feel pass, cleaner HUD, stable efficiency */
(()=>{
  const wait=()=>{
    const J=window.JBD;
    if(!J||!J.Scenarios||!J.Render||!J.Infantry||!J.World||!J.CONFIG||!J.U){setTimeout(wait,35);return;}
    if(J.__v696)return; J.__v696=true;
    const U=J.U;
    const state=()=>window.__JBD_STATE__||null;
    const oldApply=J.Scenarios.apply.bind(J.Scenarios);
    const oldAdvance=J.Scenarios.advance.bind(J.Scenarios);
    const oldRender=J.Render.render.bind(J.Render);

    /* ------------------------------------------------------------
       MAP 1–3: short, readable escalation. These values are absolute
       so older tuning patches cannot make the opening sluggish again.
    ------------------------------------------------------------ */
    function polishScenario(q){
      if(!q||q.cycle!==1)return q;
      q.demo=false;
      if(q.index===0){
        Object.assign(q,{
          label:'JUNGLE 1 · CONVOY CONTACT',actionStyle:'CONVOY CONTACT',
          infantryCount:4,spawnDuration:6.0,artilleryCount:0,
          airborneCount:0,airborneStart:99,helicopterEnabled:false,helicopterStart:99,
          mobileArtilleryCount:0,mobileArtilleryStart:99,
          enemyHpMult:.90,enemyDamageMult:.72,enemyFireRateMult:.78,
          infantrySpeedMult:1.32,vehicleSpeedMult:1.68,
          trenches:1,villageCount:3,vegetation:.48,openness:1.16
        });
        q.vehicleSchedule=[
          {time:.55,type:'truck',lane:-.18,convoy:true,model:0,role:'cargo',scheme:'olive'},
          {time:1.55,type:'truck',lane:-.18,convoy:true,model:1,role:'troop',scheme:'olive'},
          {time:2.55,type:'truck',lane:-.18,convoy:true,model:2,role:'supply',scheme:'darkOlive'}
        ];
      }else if(q.index===1){
        Object.assign(q,{
          label:'JUNGLE 2 · VILLAGE PUSH',actionStyle:'VILLAGE PUSH',
          infantryCount:7,spawnDuration:7.0,artilleryCount:1,
          airborneCount:0,airborneStart:99,mobileArtilleryCount:0,mobileArtilleryStart:99,
          enemyHpMult:.95,enemyDamageMult:.80,enemyFireRateMult:.84,
          infantrySpeedMult:1.27,vehicleSpeedMult:1.48,
          trenches:2,villageCount:4,vegetation:.58,openness:1.08
        });
        q.vehicleSchedule=[
          {time:.9,type:'truck',lane:-.18,convoy:true,model:1,role:'troop'},
          {time:2.2,type:'truck',lane:-.18,convoy:true,model:2,role:'supply'},
          {time:4.3,type:'technical',lane:.20,model:1,role:'recon'}
        ];
      }else if(q.index===2){
        Object.assign(q,{
          label:'JUNGLE 3 · RIVER ASSAULT',actionStyle:'RIVER ASSAULT',
          infantryCount:9,spawnDuration:7.8,artilleryCount:2,
          airborneCount:0,airborneStart:99,mobileArtilleryCount:0,mobileArtilleryStart:99,
          enemyHpMult:1.00,enemyDamageMult:.88,enemyFireRateMult:.90,
          infantrySpeedMult:1.22,vehicleSpeedMult:1.38,
          trenches:3,villageCount:3,vegetation:.64,openness:1.02
        });
        q.vehicleSchedule=[
          {time:1.0,type:'truck',lane:-.14,convoy:true,model:1,role:'troop'},
          {time:2.2,type:'truck',lane:-.14,convoy:true,model:2,role:'supply'},
          {time:3.8,type:'technical',lane:.18,model:0,role:'recon'},
          {time:6.2,type:'halftrack',lane:-.08,model:1,role:'escort'}
        ];
      }
      return q;
    }

    function resetEff(s){
      if(!s)return;
      s._v696Eff=.75;
      s._v696EffSeed=s.scenario?.seed??0;
      s._v696Last={triggers:s.stats?.triggers||0,effective:s.stats?.effectiveTriggers||0,hits:s.stats?.hits||0,kills:totalKills(s)};
      s._v696Critical=false;
      s._v696Failed=false;
      /* Disable the v6.9.5 fail loop; v6.9.6 owns efficiency now. */
      s._v695Eff=.75;s._v695EffSeed=s.scenario?.seed??0;s._v695EffFailed=true;
    }
    function totalKills(s){return (s.stats?.kills||0)+(s.stats?.vehicleKills||0)+(s.stats?.airKills||0)+(s.stats?.artilleryKills||0);}

    J.Scenarios.apply=function(s,index=s.campaign.index,cycle=s.campaign.cycle){
      const out=oldApply(s,index,cycle);polishScenario(s.scenario);resetEff(s);return out;
    };
    J.Scenarios.advance=function(s){const out=oldAdvance(s);polishScenario(s.scenario);resetEff(s);return out;};

    /* ------------------------------------------------------------
       EFFICIENCY: starts at 75%. It reacts per trigger instead of
       chasing a raw ratio every frame, so a single miss is not fatal.
       Red begins at 25% and is an immediate run failure.
    ------------------------------------------------------------ */
    function efficiencyColor(v){
      return v>=.86?'#42c979':v>=.70?'#9fc85c':v>=.50?'#d8c853':v>=.25?'#df8d3f':'#df4d45';
    }
    function updateEfficiency(s){
      if(!s)return;
      if(s._v696EffSeed!==s.scenario?.seed||s._v696Eff==null)resetEff(s);
      s._v695EffSeed=s.scenario?.seed??0;s._v695EffFailed=true;s._v695Eff=.75;
      if(s.mode!=='playing'||s.levelComplete||s._v696Failed)return;
      const cur={triggers:s.stats?.triggers||0,effective:s.stats?.effectiveTriggers||0,hits:s.stats?.hits||0,kills:totalKills(s)};
      const last=s._v696Last||cur;
      const dt=Math.max(0,cur.triggers-last.triggers),de=Math.max(0,cur.effective-last.effective),dh=Math.max(0,cur.hits-last.hits),dk=Math.max(0,cur.kills-last.kills);
      if(dt>0){
        const good=Math.min(dt,de),bad=Math.max(0,dt-good);
        s._v696Eff=U.clamp((s._v696Eff??.75)+good*.018-bad*.034,0,1);
      }
      if(dh>0)s._v696Eff=U.clamp(s._v696Eff+Math.min(.018,dh*.003),0,1);
      if(dk>0)s._v696Eff=U.clamp(s._v696Eff+Math.min(.025,dk*.007),0,1);
      s._v696Last=cur;
      if(s._v696Eff<.35&&!s._v696Critical){s._v696Critical=true;s.ui=s.ui||{};s.ui.message='EFFICIENCY CRITICAL';s.ui.messageT=1.4;}
      if(s._v696Eff>=.40)s._v696Critical=false;
      if(s._v696Eff<.25)failEfficiency(s);
    }
    function failEfficiency(s){
      if(s._v696Failed)return;s._v696Failed=true;s._v696Eff=Math.min(s._v696Eff,.249);
      s.ui=s.ui||{};s.ui.message='EFFICIENCY LOST';s.ui.messageT=2.5;s.bunker.hp=0;
      setTimeout(()=>{
        const overlay=document.getElementById('overlay'),title=document.getElementById('title'),sub=document.getElementById('sub'),restart=document.getElementById('restart'),deploy=document.getElementById('deploy');
        if(title)title.textContent='EFFICIENCY LOST';
        if(sub)sub.innerHTML=`Efficiency ${Math.round((s._v696Eff||0)*100)}%.<br><span>Rood is einde run. Minder verspillen en gerichter vuren.</span>`;
        if(deploy)deploy.style.display='none';if(restart)restart.style.display='inline-flex';if(overlay)overlay.classList.remove('hidden');
      },260);
    }

    /* ------------------------------------------------------------
       INFANTRY FEEL: early maps keep moving. Cover is useful, but no
       soldier should sit inert long enough for the battle to feel stuck.
    ------------------------------------------------------------ */
    function release(e){
      if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;
      e.cover=null;e.coverIntent=false;e.reCoverT=1.3+Math.random()*1.2;e.state='ADVANCE';e.stateT=0;e.pose='walk';e._v696Still=0;
    }
    let tickLast=performance.now();
    setInterval(()=>{
      const s=state();if(!s||s.mode!=='playing'||s.levelComplete||s._v696Failed)return;
      const idx=s.scenario?.index??9;if(idx>2)return;
      const now=performance.now(),dt=Math.min(1,(now-tickLast)/1000);tickLast=now;
      for(const e of s.enemies||[]){
        if(e.state==='DEAD')continue;
        if(e.inBuilding){if(Number.isFinite(e._v693GarrisonT))e._v693GarrisonT=Math.min(e._v693GarrisonT,idx===0?3.4:4.2);continue;}
        const stationary=e.state==='IN_COVER'||e.state==='ENTER_COVER'||e.state==='FIRE_FROM_COVER';
        if(stationary){e._v696Still=(e._v696Still||0)+dt;const limit=(e.classKey==='marksman'?6.0:idx===0?3.4:4.3);if(e._v696Still>limit)release(e);}else e._v696Still=0;
      }
      const live=(s.enemies||[]).some(e=>e.state!=='DEAD');
      const movingVeh=(s.vehicles||[]).some(v=>v.state!=='DESTROYED'&&v.state!=='DEPARTED');
      const left=(s.spawn?.count??0)<(s.scenario?.infantryCount??0);
      if(!live&&!movingVeh&&left){
        s._v696Lull=(s._v696Lull||0)+dt;
        if(s._v696Lull>1.15&&J.Infantry?.spawn){J.Infantry.spawn(s);s.spawn.count=(s.spawn.count||0)+1;s._v696Lull=0;}
      }else s._v696Lull=0;
    },450);

    /* ------------------------------------------------------------
       CLEAN HUD: only the four things that matter during combat.
       HP / EFFICIENCY / KILLS are large. HEAT gets one quiet bottom bar.
    ------------------------------------------------------------ */
    function hud(s,ctx){
      const {w,h,dpr}=s.viewport,top=s.safe?.top||0,bottom=s.safe?.bottom||0;
      const hp=Math.max(0,Math.ceil(s.bunker?.hp||0)),eff=U.clamp(s._v696Eff??.75,0,1),kills=totalKills(s),map=Math.max(1,(s.campaign?.index||0)+1),heat=U.clamp(s.bunker?.heat||0,0,1);
      ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;
      const panelH=top+78;ctx.fillStyle='rgba(10,14,10,.93)';ctx.fillRect(0,0,w,panelH);
      ctx.font='800 8px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textBaseline='top';ctx.fillStyle='#aeb6a1';ctx.textAlign='left';ctx.fillText('HP',12,top+7);ctx.textAlign='center';ctx.fillText(`MAP ${map}/9`,w/2,top+7);ctx.textAlign='right';ctx.fillText('KILLS',w-12,top+7);
      ctx.font='900 24px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillStyle=hp>50?'#edf0dc':hp>25?'#e5bd58':'#e06055';ctx.fillText(String(hp),12,top+39);ctx.textAlign='right';ctx.fillStyle='#edf0dc';ctx.fillText(String(kills),w-12,top+39);
      ctx.textAlign='center';ctx.font='900 23px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.fillStyle=efficiencyColor(eff);ctx.fillText(`${Math.round(eff*100)}%`,w/2,top+39);
      ctx.font='800 7px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.fillStyle='#aeb6a1';ctx.fillText('EFFICIENCY',w/2,top+49);
      const bx=12,by=top+57,bw=w-24,bh=10;ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle=efficiencyColor(eff);ctx.fillRect(bx,by,Math.max(1,bw*eff),bh);
      for(const q of [.25,.50,.70,.86]){ctx.fillStyle='rgba(8,10,8,.65)';ctx.fillRect(Math.round(bx+bw*q),by,1,bh);}ctx.strokeStyle='rgba(255,255,255,.14)';ctx.strokeRect(bx+.5,by+.5,bw-1,bh-1);
      if(eff<.35&&!s._v696Failed){ctx.font='900 10px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textAlign='center';ctx.fillStyle=(Math.floor(performance.now()/240)%2)?'#ff735f':'#ffd06a';ctx.fillText('EFFICIENCY CRITICAL',w/2,top+76);}
      const botH=bottom+37,botY=h-botH;ctx.fillStyle='rgba(10,14,10,.91)';ctx.fillRect(0,botY,w,botH);ctx.font='800 8px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#b9c0aa';ctx.fillText('HEAT',12,botY+16);ctx.textAlign='right';ctx.fillText(`${Math.round(heat*100)}%`,w-12,botY+16);const hx=48,hy=botY+12,hw=Math.max(40,w-96);ctx.fillStyle='rgba(255,255,255,.09)';ctx.fillRect(hx,hy,hw,8);ctx.fillStyle=heat>.78?'#dc5949':heat>.56?'#df9844':'#a8bd62';ctx.fillRect(hx,hy,hw*heat,8);
      ctx.restore();
    }

    J.Render.render=function(s,ctx){
      /* keep legacy efficiency inert before the inherited renderer runs */
      s._v695EffSeed=s.scenario?.seed??0;s._v695EffFailed=true;s._v695Eff=.75;
      updateEfficiency(s);const out=oldRender(s,ctx);hud(s,ctx);return out;
    };

    const initial=()=>{const s=state(),c=document.getElementById('game');if(!s||!s.scenario||!c){setTimeout(initial,60);return;}polishScenario(s.scenario);resetEff(s);if(s.mode==='brief'){s.map=null;J.World.resize(s,c);}const title=document.getElementById('title'),sub=document.getElementById('sub');if(title)title.textContent='AMIGA PIXEL V6.9.6';if(sub)sub.innerHTML='Game-feel polish van de eerste drie maps.<br><span>Snellere pressure · cleaner HUD · stabielere efficiency · infantry blijft bewegen</span>';};initial();
    console.info('JBD v6.9.6 game-feel/HUD polish active');
  };
  wait();
})();