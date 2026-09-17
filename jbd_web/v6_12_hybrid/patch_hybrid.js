/* JBD V6.12 HYBRID — coherent classic art + modern HUD/action */
(()=>{
  const J=window.JBD;
  if(!J||!J.Scenarios||!J.Infantry||!J.Render||!J.Scale||!J.Progress||!J.World||!J.Combat)return;
  const C=J.CONFIG,U=J.U;

  /* -----------------------------------------------------------
     1) UPGRADES — restore RANGE + COOLING as real upgrades
  ----------------------------------------------------------- */
  C.campaign.upgrades.range = C.campaign.upgrades.range || {label:'RANGE',max:4,costs:[40,60,90,125]};
  C.campaign.upgrades.cooling = C.campaign.upgrades.cooling || {label:'COOLING',max:4,costs:[35,55,80,115]};

  const upgradeKeys=['caliber','burst','charge','range','cooling','he','armor'];
  function cleanSave(src){
    const out={supply:0,upgrades:{caliber:0,burst:0,charge:0,range:0,cooling:0,he:0,armor:0},bestCycle:1,totalMapsCleared:0};
    if(src&&typeof src==='object'){
      out.supply=Math.max(0,src.supply|0);
      out.bestCycle=Math.max(1,src.bestCycle|0||1);
      out.totalMapsCleared=Math.max(0,src.totalMapsCleared|0);
      for(const k of upgradeKeys){
        const max=C.campaign.upgrades[k].max;
        out.upgrades[k]=U.clamp((src.upgrades?.[k]||0)|0,0,max);
      }
    }
    return out;
  }
  function buildProfile(up){
    const caliber=up.caliber|0,burst=up.burst|0,charge=up.charge|0,range=up.range|0,cooling=up.cooling|0,he=up.he|0,armor=up.armor|0;
    const rangeScale=1+range*.115;
    return {
      maxHp:C.bunker.hp+armor*18,
      damageReduction:armor*.08,
      barrelLength:C.bunker.barrelLength+caliber*3,
      sandbags:armor,
      chargeScale:1+charge*.16,
      heatCoolRate:.20+cooling*.075,
      heatGainScale:Math.max(.55,1-cooling*.085),
      weapons:{
        mg:{...C.weapons.mg,burst:C.weapons.mg.burst+burst,cadence:Math.max(.037,C.weapons.mg.cadence-burst*.004),damage:C.weapons.mg.damage+caliber*3,range:(C.weapons.mg.range||220)*rangeScale},
        ap:{...C.weapons.ap,damage:C.weapons.ap.damage+caliber*6,range:(C.weapons.ap.range||430)*rangeScale},
        he:{...C.weapons.he,damage:C.weapons.he.damage+caliber*10+he*14,radius:C.weapons.he.radius+he*8,range:(C.weapons.he.range||390)*rangeScale}
      }
    };
  }
  function saveNow(save){return U.saveJSON(C.campaign.saveKey,cleanSave(save));}
  function refreshState(s,resetHp=true){
    s.save=cleanSave(s.save);
    s.profile=buildProfile(s.save.upgrades);
    s.bunker.maxHp=s.profile.maxHp;
    if(resetHp)s.bunker.hp=s.profile.maxHp;else s.bunker.hp=Math.min(s.bunker.hp,s.profile.maxHp);
    return s.profile;
  }
  function upgradeCost(key,level){const cfg=C.campaign.upgrades[key];return !cfg||level>=cfg.max?null:(cfg.costs[level]??null);}
  function tryBuyUpgrade(s,key){
    const cfg=C.campaign.upgrades[key];if(!cfg)return false;
    const lvl=s.save.upgrades[key]|0,cost=upgradeCost(key,lvl);
    if(cost==null||s.save.supply<cost)return false;
    s.save.supply-=cost;s.save.upgrades[key]=lvl+1;refreshState(s,false);saveNow(s.save);return true;
  }
  J.Progress.defaultSave=()=>cleanSave(null);
  J.Progress.saveNow=saveNow;J.Progress.refreshState=refreshState;J.Progress.upgradeCost=upgradeCost;J.Progress.tryBuyUpgrade=tryBuyUpgrade;

  const oldMakeState=J.makeState;
  J.makeState=function(){
    const s=oldMakeState();
    const raw=U.loadJSON(C.campaign.saveKey,s.save||{});
    s.save=cleanSave(raw);s.profile=buildProfile(s.save.upgrades);s.bunker.maxHp=s.profile.maxHp;s.bunker.hp=s.profile.maxHp;
    s._hyHeat=0;s._hyHeatLocked=false;s._hyEff=.75;s._hyEffLast=null;
    return s;
  };

  /* Real heat/cooling so the COOLING upgrade matters. */
  const baseFireCharge=J.Combat.fireCharge.bind(J.Combat);
  J.Combat.fireCharge=function(s,hold,x,y){
    if(s?._hyHeatLocked){s.ui.message='BARREL HOT';s.ui.messageT=.45;return;}
    const gain=hold<C.input.apCharge?.08:hold<C.input.heCharge?.16:.23;
    s._hyHeat=U.clamp((s._hyHeat||0)+gain*(s.profile?.heatGainScale||1),0,1);
    if(s._hyHeat>=.94)s._hyHeatLocked=true;
    return baseFireCharge(s,hold,x,y);
  };

  /* -----------------------------------------------------------
     2) GAME PACE — fewer walkers, more actual contact
  ----------------------------------------------------------- */
  function tuneScenario(q){
    if(!q||q._hybridTuned)return q;q._hybridTuned=true;
    const i=q.index||0;
    const foot=[5,6,7,7,8,8,8,9,10][i]||7;
    q.infantryCount=foot;
    q.spawnDuration=6.0+i*.28;
    q.infantrySpeedMult=Math.max(q.infantrySpeedMult||1,1.42+(i<3?.08:0));
    q.vehicleSpeedMult=(q.vehicleSpeedMult||1)*1.18;
    q.coverSearchRadius=Math.min(q.coverSearchRadius||170,128);
    q.airborneCount=[3,4,4,4,5,5,4,5,6][i]||4;
    q.airborneStart=4.6+i*.18;
    q.artilleryCount=i<3?3:i<6?4:5;
    q.artilleryDuration=1.15+i*.05;
    q.vegetation=(q.vegetation||1)*.58;
    q.trenches=Math.min(q.trenches||4,i<3?3:4);
    const existing=(q.vehicleSchedule||[]).map(x=>({...x,time:Math.max(1.0,(x.time||1)*.55)}));
    const early=[{time:1.1,type:'truck',lane:i%2?.18:-.18},{time:3.0,type:i<3?'technical':'halftrack',lane:i%2?-.23:.23}];
    q.vehicleSchedule=[...early,...existing].sort((a,b)=>a.time-b.time).slice(0,8);
    return q;
  }
  const baseGet=J.Scenarios.get.bind(J.Scenarios),baseApply=J.Scenarios.apply.bind(J.Scenarios),baseAdvance=J.Scenarios.advance.bind(J.Scenarios);
  J.Scenarios.get=(i=0,c=1)=>tuneScenario(baseGet(i,c));
  J.Scenarios.apply=function(s,i=s.campaign.index,c=s.campaign.cycle){const out=baseApply(s,i,c);tuneScenario(s.scenario);resetHybrid(s);return s.scenario||out;};
  J.Scenarios.advance=function(s){const out=baseAdvance(s);tuneScenario(s.scenario);resetHybrid(s);return s.scenario||out;};

  /* Normal foot troops start well inside the map. Trucks/paras keep their exact positions. */
  const baseSpawn=J.Infantry.spawn.bind(J.Infantry);
  J.Infantry.spawn=function(s,x=null,y=null,opts={}){
    if(x==null&&y==null&&s?.viewport){x=J.World.pickSpawnX(s,s.rng);y=(s.safe?.top||0)+s.viewport.h*(.23+s.rng()*.045);}
    return baseSpawn(s,x,y,opts);
  };

  /* Anti-stall. */
  const baseInfUpdate=J.Infantry.update.bind(J.Infantry),motion=new Map();
  J.Infantry.update=function(s,dt){
    baseInfUpdate(s,dt);const by=s.bunker?.y??s.viewport.h*.86,bx=s.bunker?.x??s.viewport.w*.5;
    for(const e of s.enemies||[]){
      if(!e||e.state==='DEAD')continue;
      const m=motion.get(e.id)||{x:e.x,y:e.y,t:0};const moved=Math.hypot(e.x-m.x,e.y-m.y),still=moved<.22?m.t+dt:0;motion.set(e.id,{x:e.x,y:e.y,t:still});
      const hold=['ENTER_COVER','FIRE_FROM_COVER','IN_COVER','DEPLOY_WEAPON','FIRE_FROM_WEAPON'].includes(e.state);
      if(still>(hold?2.3:3.5)&&e.y<by-90){
        if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;
        e.cover=null;e.coverIntent=false;e.mountedWeapon=false;e.deployingWeapon=false;e.reCoverT=1.8;e.assaultT=1.25;e.state='ADVANCE';e.stateT=0;e.pose='walk';
        const dx=bx-e.x,dy=by-e.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*1.8;e.y+=Math.max(1.6,dy/d*2.6);motion.set(e.id,{x:e.x,y:e.y,t:0});
      }
    }
  };

  /* -----------------------------------------------------------
     3) HELICOPTER INSERTIONS — larger, cleaner silhouette
  ----------------------------------------------------------- */
  function heliPlan(index){return [
    {time:2.2,count:index<3?2:3,side:index%2?'left':'right',x:index%2?.32:.68,y:.35,started:false},
    {time:8.0,count:index<5?2:3,side:index%2?'right':'left',x:index%2?.67:.33,y:.48,started:false}
  ];}
  function resetHybrid(s){
    if(!s)return;s._hyHeat=0;s._hyHeatLocked=false;s._hyEff=.75;s._hyEffLast={shots:0,hits:0,kills:0};
    s._hyHeli={seed:s.scenario?.seed??0,events:heliPlan(s.scenario?.index||0),visuals:[]};
  }
  function ensureHeli(s){if(!s._hyHeli||s._hyHeli.seed!==(s.scenario?.seed??0))resetHybrid(s);return s._hyHeli;}
  function insertGroup(s,e){
    const x=s.viewport.w*e.x,y=s.viewport.h*e.y;
    for(let i=0;i<e.count;i++){
      const u=baseSpawn(s,U.clamp(x+(i-(e.count-1)/2)*20,28,s.viewport.w-28),U.clamp(y+(i%2)*12,(s.safe?.top||0)+130,s.bunker.y-135),{coverIntent:false,reCoverT:2.0});
      u.assaultT=1.5;u.state='ADVANCE';u.stateT=0;u.pose='walk';
    }
    s.ui.message='HELICOPTER INSERTION';s.ui.messageT=.8;
  }
  function updateHeli(s,dt){
    if(!s||s.mode!=='playing'||s.levelComplete)return;const h=ensureHeli(s),t=s.simTime||0,w=s.viewport.w;
    for(const e of h.events)if(!e.started&&t>=e.time){e.started=true;h.visuals.push({event:e,t:0,dur:3.9,x0:e.side==='left'?-105:w+105,x1:w*e.x,y:s.viewport.h*e.y,dropped:false});}
    for(const v of h.visuals){v.t+=dt;const p=U.clamp(v.t/v.dur,0,1);if(!v.dropped&&p>.43){v.dropped=true;insertGroup(s,v.event);}}
    h.visuals=h.visuals.filter(v=>v.t<v.dur);
  }

  function heliPos(s,v){const p=U.clamp(v.t/v.dur,0,1),w=s.viewport.w;let x;if(p<.30)x=v.x0+(v.x1-v.x0)*(p/.30);else if(p<.70)x=v.x1;else x=v.x1+((v.x0<0?w+110:-110)-v.x1)*((p-.70)/.30);return{x,y:v.y+Math.sin(v.t*3)*1.5};}
  function drawHeli(ctx,s,v){
    const {x,y}=heliPos(s,v),spin=v.t*18;ctx.save();ctx.translate(x,y);
    ctx.fillStyle='rgba(0,0,0,.19)';ctx.beginPath();ctx.ellipse(8,11,30,10,0,0,6.28);ctx.fill();
    ctx.fillStyle='#59644d';ctx.strokeStyle='#1e241c';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-3,0,17,11,0,0,6.28);ctx.fill();ctx.stroke();
    ctx.fillStyle='#77806a';ctx.beginPath();ctx.ellipse(-9,-3,8,5,0,0,6.28);ctx.fill();
    ctx.fillStyle='#4a5240';ctx.beginPath();ctx.moveTo(10,-4);ctx.lineTo(42,-2);ctx.lineTo(42,3);ctx.lineTo(10,4);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#30372c';ctx.fillRect(39,-8,4,16);ctx.beginPath();ctx.moveTo(40,-5);ctx.lineTo(52,-11);ctx.lineTo(45,0);ctx.lineTo(52,11);ctx.lineTo(40,5);ctx.closePath();ctx.fill();
    ctx.save();ctx.rotate(spin);ctx.strokeStyle='rgba(32,38,30,.92)';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-36,0);ctx.lineTo(36,0);ctx.moveTo(0,-36);ctx.lineTo(0,36);ctx.stroke();ctx.restore();
    ctx.strokeStyle='rgba(218,220,190,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(-3,0,35,0,6.28);ctx.stroke();
    ctx.restore();
  }

  /* -----------------------------------------------------------
     4) FULL INFANTRY SPRITES + VISIBLE AIRBORNE
     No far-dot/mid-turtle LOD at all.
  ----------------------------------------------------------- */
  function muzzle(ctx,x,y,s=1){ctx.save();ctx.translate(x,y);ctx.fillStyle='#ffe2a0';ctx.beginPath();ctx.moveTo(0,-6*s);ctx.lineTo(2*s,-1*s);ctx.lineTo(6*s,0);ctx.lineTo(2*s,1*s);ctx.lineTo(0,6*s);ctx.lineTo(-2*s,1*s);ctx.lineTo(-5*s,0);ctx.lineTo(-2*s,-1*s);ctx.closePath();ctx.fill();ctx.restore();}
  function drawSoldier(ctx,s,e){
    let spr;if(e.state==='DEAD')spr=e.deathPose==='side'?J.Sprites.deadSide:J.Sprites.deadFront;
    else if(e.pose==='prone')spr=J.Sprites.prone[Math.floor(e.anim*7)%J.Sprites.prone.length];
    else if(e.pose==='crouch')spr=J.Sprites.crouch[Math.floor(e.anim*5)%J.Sprites.crouch.length];
    else if(e.pose==='fire'&&J.Sprites.fire?.length)spr=J.Sprites.fire[Math.floor(e.anim*4)%J.Sprites.fire.length];
    else if(e.pose==='stand'&&J.Sprites.stand?.length)spr=J.Sprites.stand[Math.floor(e.anim*4)%J.Sprites.stand.length];
    else spr=J.Sprites.walk[Math.floor(e.anim*9)%J.Sprites.walk.length];
    if(!spr)return;const sc=Math.max(.43,J.Scale.entity(s,e.y,'infantry')*1.18);
    ctx.save();ctx.globalAlpha=e.alpha??1;ctx.translate(e.x,e.y);
    if(e.state!=='DEAD')ctx.rotate(e.angle+Math.PI/2+(e.hitT>0?e.fallDir*.07:0));
    ctx.scale(sc,sc);if(e.recoilT>0)ctx.translate(0,e.recoilT*7);ctx.drawImage(spr,-spr.width/2,-spr.height/2);
    if(e.muzzleT>0&&e.state!=='DEAD')muzzle(ctx,3,-18,.42);ctx.restore();
  }
  function drawPlane(ctx,s,q){
    if(!q||!q.active)return;ctx.save();ctx.translate(q.x,q.y);ctx.scale(1.05,1.05);
    ctx.fillStyle='rgba(0,0,0,.14)';ctx.beginPath();ctx.ellipse(4,10,50,14,0,0,6.28);ctx.fill();
    ctx.fillStyle='#66715b';ctx.strokeStyle='#252c23';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-42,-7);ctx.lineTo(-10,-7);ctx.lineTo(13,-31);ctx.lineTo(25,-29);ctx.lineTo(12,-6);ctx.lineTo(42,-3);ctx.quadraticCurveTo(51,0,42,3);ctx.lineTo(12,6);ctx.lineTo(25,29);ctx.lineTo(13,31);ctx.lineTo(-10,7);ctx.lineTo(-42,7);ctx.quadraticCurveTo(-51,0,-42,-7);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#89927a';ctx.fillRect(-32,-5,63,10);ctx.restore();
  }
  function drawParas(ctx,s){
    for(const p of s.airborne?.paratroopers||[]){
      const scale=1.0;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot||0);ctx.scale(scale,scale);ctx.globalAlpha=p.alpha??1;
      ctx.fillStyle='#d4cfb3';ctx.strokeStyle='#5e5c50';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-22,-14);ctx.quadraticCurveTo(0,-36,22,-14);ctx.quadraticCurveTo(0,-5,-22,-14);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#7b7766';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-17,-14);ctx.lineTo(-4,0);ctx.moveTo(17,-14);ctx.lineTo(4,0);ctx.stroke();
      ctx.fillStyle='#596541';ctx.strokeStyle='#23291f';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-5,-1,10,13,3);ctx.fill();ctx.stroke();ctx.fillStyle='#3f4933';ctx.beginPath();ctx.arc(0,-4,4,0,6.28);ctx.fill();ctx.restore();
    }
  }

  /* -----------------------------------------------------------
     5) EFFICIENCY + modern clean HUD
  ----------------------------------------------------------- */
  function totalKills(s){return (s.stats?.kills||0)+(s.stats?.vehicleKills||0)+(s.stats?.airKills||0);}
  function updateEfficiency(s){
    if(!s||s.mode!=='playing')return;if(s._hyEff==null)s._hyEff=.75;
    const cur={shots:s.stats?.shots||0,hits:s.stats?.hits||0,kills:totalKills(s)},last=s._hyEffLast||cur;
    const ds=Math.max(0,cur.shots-last.shots),dh=Math.max(0,cur.hits-last.hits),dk=Math.max(0,cur.kills-last.kills),miss=Math.max(0,ds-dh);
    s._hyEff=U.clamp(s._hyEff + dh*.010 + dk*.024 - miss*.0055,0,1);s._hyEffLast=cur;
    if(s._hyEff<.20&&s.mode==='playing'){s._hyEff=.19;s.bunker.hp=0;s.mode='gameover';}
  }
  function effColor(v){return v>=.86?'#4bd17d':v>=.70?'#a9cf63':v>=.50?'#ddc94f':v>=.30?'#e69243':'#df4d45';}
  function drawHud(ctx,s){
    const {w,h,dpr}=s.viewport,top=s.safe?.top||0,hudH=top+84,hp=Math.max(0,Math.ceil(s.bunker.hp)),maxHp=Math.ceil(s.bunker.maxHp||100),eff=U.clamp(s._hyEff??.75,0,1),kills=totalKills(s),map=(s.campaign?.index||0)+1;
    ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='rgba(8,11,8,.96)';ctx.fillRect(0,0,w,hudH);
    ctx.font='800 8px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textBaseline='top';ctx.fillStyle='#adb69f';ctx.textAlign='left';ctx.fillText('HP',14,top+8);ctx.textAlign='center';ctx.fillText(`MAP ${map}/9`,w/2,top+8);ctx.textAlign='right';ctx.fillText('KILLS',w-14,top+8);
    ctx.font='900 26px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillStyle=hp/maxHp>.55?'#eef0df':hp/maxHp>.28?'#e5bd58':'#e05d52';ctx.fillText(String(hp),14,top+42);
    ctx.textAlign='center';ctx.fillStyle=effColor(eff);ctx.fillText(`${Math.round(eff*100)}%`,w/2,top+42);ctx.textAlign='right';ctx.fillStyle='#eef0df';ctx.fillText(String(kills),w-14,top+42);
    ctx.font='800 7px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textAlign='center';ctx.fillStyle='#aab39d';ctx.fillText('EFFICIENCY',w/2,top+50);
    const x=14,y=top+60,bw=w-28,bh=10;ctx.fillStyle='#20251e';ctx.fillRect(x,y,bw,bh);ctx.fillStyle=effColor(eff);ctx.fillRect(x,y,bw*eff,bh);for(const m of [.2,.5,.7,.86]){ctx.fillStyle='rgba(8,10,8,.55)';ctx.fillRect(Math.round(x+bw*m),y,2,bh);}ctx.strokeStyle='rgba(255,255,255,.12)';ctx.strokeRect(x+.5,y+.5,bw-1,bh-1);
    if(eff<.30){ctx.font='900 8px ui-monospace,monospace';ctx.fillStyle='#ff765f';ctx.fillText('CRITICAL',w/2,top+72);}
    const heat=U.clamp(s._hyHeat||0,0,1),hy=h-(s.safe?.bottom||0)-72;ctx.fillStyle='rgba(8,11,8,.86)';ctx.fillRect(18,hy,w-36,13);ctx.font='700 7px ui-monospace,monospace';ctx.textAlign='left';ctx.fillStyle='#aeb59f';ctx.fillText('HEAT',22,hy+3);ctx.fillStyle='#20251e';ctx.fillRect(54,hy+3,w-82,7);ctx.fillStyle=heat>.75?'#df5e4b':heat>.5?'#e09a48':'#a6c266';ctx.fillRect(54,hy+3,(w-82)*heat,7);ctx.restore();
  }

  const baseResize=J.World.resize.bind(J.World);
  J.World.resize=function(s,canvas){baseResize(s,canvas);const g=s.staticCtx;if(g){const p=s.scenario?.theme==='desert'?'rgba(202,185,132,.10)':s.scenario?.theme==='polar'?'rgba(215,225,220,.08)':'rgba(126,145,93,.09)';g.save();g.fillStyle=p;g.fillRect(0,0,s.viewport.w,s.viewport.h);g.restore();}};

  function fixShopText(){
    document.querySelectorAll('.shopBtn').forEach(b=>{const name=b.querySelector('.shopTop span')?.textContent||'',meta=b.querySelector('.shopMeta');if(!meta)return;if(name==='RANGE')meta.textContent='+11.5% bereik voor BURST, AP en HE per level';if(name==='COOLING')meta.textContent='Snellere heat recovery en minder heat per schot';});
  }
  new MutationObserver(fixShopText).observe(document.documentElement,{subtree:true,childList:true});

  const baseRender=J.Render.render.bind(J.Render);let last=performance.now();
  J.Render.render=function(s,ctx){
    const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    if(s){s._hyHeat=Math.max(0,(s._hyHeat||0)-dt*(s.profile?.heatCoolRate||.20));if(s._hyHeatLocked&&s._hyHeat<.38)s._hyHeatLocked=false;updateEfficiency(s);updateHeli(s,dt);}
    const enemies=s?.enemies||[],air=s?.airborne,plane=air?.plane,paras=air?.paratroopers,collapsed=air?.collapsed;
    if(s)s.enemies=[];if(air){air.plane=null;air.paratroopers=[];air.collapsed=[];}
    const out=baseRender(s,ctx);
    if(s)s.enemies=enemies;if(air){air.plane=plane;air.paratroopers=paras;air.collapsed=collapsed;}
    if(s){
      const dpr=s.viewport.dpr,top=s.safe?.top||0;ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.beginPath();ctx.rect(0,top+84,s.viewport.w,s.viewport.h-top-84);ctx.clip();
      drawPlane(ctx,s,plane);drawParas(ctx,s);for(const e of enemies)drawSoldier(ctx,s,e);for(const v of ensureHeli(s).visuals)drawHeli(ctx,s,v);ctx.restore();drawHud(ctx,s);
    }
    return out;
  };

  console.info('JBD V6.12 hybrid active');
})();
