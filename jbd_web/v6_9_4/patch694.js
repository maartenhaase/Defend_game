/* JBD v6.9.4 — progressive campaign + calm ground + readable pixel infantry */
(()=>{
  const wait=()=>{
    const J=window.JBD;
    if(!J||!J.Scenarios||!J.World||!J.Render||!J.Scale||!J.Particles||!J.Combat||!J.CONFIG){setTimeout(wait,35);return;}
    if(J.__v694)return;J.__v694=true;
    const C=J.CONFIG,U=J.U;

    /* ------------------------------------------------------------------
       CAMPAIGN: map 1 is no longer the all-systems demo. Difficulty and
       mechanics are introduced progressively over the full 9-map cycle.
    ------------------------------------------------------------------ */
    const originalScenarios={
      get:J.Scenarios.get.bind(J.Scenarios),
      apply:J.Scenarios.apply.bind(J.Scenarios)
    };

    const MAPS=[
      {action:'FIRST CONTACT',inf:6,dur:21.0,art:3,veh:[],air:0,mobile:0,mobileStart:99,heli:false,village:2,trenches:2,veg:.62,open:.84,hp:.82,dmg:.70,rate:.72},
      {action:'SCOUT PROBE',inf:8,dur:20.0,art:4,veh:[{time:15.5,type:'technical',lane:-.20}],air:0,mobile:0,mobileStart:99,heli:false,village:3,trenches:3,veg:.70,open:.86,hp:.88,dmg:.76,rate:.78},
      {action:'RIVER PUSH',inf:10,dur:19.0,art:5,veh:[{time:12.8,type:'technical',lane:-.24},{time:18.8,type:'truck',lane:.19}],air:0,mobile:0,mobileStart:99,heli:false,village:3,trenches:4,veg:.76,open:.88,hp:.94,dmg:.82,rate:.84},
      {action:'DESERT PATROL',inf:10,dur:18.5,art:5,veh:[{time:12.0,type:'technical',lane:.22},{time:18.0,type:'truck',lane:-.16}],air:0,mobile:0,mobileStart:99,heli:false,village:2,trenches:3,veg:.34,open:1.12,hp:.96,dmg:.86,rate:.88},
      {action:'CONVOY THREAT',inf:11,dur:18.0,art:6,veh:[{time:10.8,type:'technical',lane:-.24},{time:15.2,type:'truck',lane:.17},{time:20.5,type:'halftrack',lane:-.10}],air:0,mobile:0,mobileStart:99,heli:false,village:3,trenches:4,veg:.38,open:1.08,hp:1.00,dmg:.91,rate:.93},
      {action:'ARMOR ARRIVES',inf:12,dur:17.5,art:6,veh:[{time:10.0,type:'technical',lane:-.22},{time:14.2,type:'truck',lane:.18},{time:18.8,type:'halftrack',lane:-.08},{time:24.5,type:'stug',lane:.26}],air:2,mobile:0,mobileStart:99,heli:false,village:3,trenches:4,veg:.40,open:1.06,hp:1.03,dmg:.96,rate:.98},
      {action:'FROZEN LINE',inf:11,dur:18.0,art:5,veh:[{time:11.5,type:'halftrack',lane:-.18},{time:18.0,type:'truck',lane:.18}],air:0,mobile:0,mobileStart:99,heli:false,village:2,trenches:4,veg:.44,open:1.06,hp:1.00,dmg:.94,rate:.96},
      {action:'AIRBORNE VILLAGE',inf:13,dur:17.0,art:7,veh:[{time:9.8,type:'halftrack',lane:-.20},{time:14.8,type:'truck',lane:.16},{time:20.4,type:'stug',lane:.24}],air:2,mobile:0,mobileStart:99,heli:false,village:4,trenches:5,veg:.48,open:1.02,hp:1.05,dmg:1.00,rate:1.02},
      {action:'COMBINED ARMS',inf:15,dur:16.5,art:8,veh:[{time:8.8,type:'technical',lane:-.26},{time:12.2,type:'truck',lane:.18},{time:15.8,type:'halftrack',lane:-.10},{time:20.5,type:'stug',lane:.26},{time:27.0,type:'tank',lane:-.24}],air:3,mobile:1,mobileStart:18.5,heli:false,village:4,trenches:6,veg:.52,open:1.00,hp:1.10,dmg:1.04,rate:1.06}
    ];

    function tuneScenario(q,index,cycle){
      const p=MAPS[((index%9)+9)%9],cy=Math.max(1,cycle||1),extra=cy-1;
      q.demo=false;
      q.action=p.action;
      q.actionStyle=p.action;
      const theme=(q.theme||'jungle').toUpperCase();
      q.label=`${theme} ${q.number||((index%3)+1)} · ${p.action}`;
      q.infantryCount=p.inf+Math.min(6,extra*2);
      q.spawnDuration=p.dur;
      q.artilleryCount=p.art;
      q.vehicleSchedule=p.veh.map((v,i)=>({...v,model:i%3,role:v.type==='tank'?'medium':v.type==='stug'?'assault':v.type==='halftrack'?'escort':v.type==='truck'?'troop':'recon'}));
      if(extra>0&&index>2)q.vehicleSchedule.push({time:29.0,type:extra%2?'halftrack':'stug',lane:.14,model:extra%3,role:extra%2?'escort':'assault'});
      q.airborneCount=p.air+(extra>1&&index>=5?1:0);
      q.airborneStart=q.airborneCount?24.0:99;
      q.helicopterEnabled=!!p.heli;
      q.helicopterStart=99;
      q.mobileArtilleryCount=p.mobile;
      q.mobileArtilleryStart=p.mobileStart;
      q.villageCount=p.village;
      q.trenches=p.trenches;
      q.vegetation=p.veg;
      q.openness=p.open;
      q.enemyHpMult=p.hp*(1+extra*.07);
      q.enemyDamageMult=p.dmg*(1+extra*.07);
      q.enemyFireRateMult=p.rate*(1+extra*.045);
      /* The first three maps deliberately give the player more firing room. */
      if(index<=2){q.coverSearchRadius*=.88;q.infantrySpeedMult*=.92;}
      return q;
    }

    J.Scenarios.get=function(index=0,cycle=1){return tuneScenario(originalScenarios.get(index,cycle),index,cycle);};
    J.Scenarios.apply=function(s,index=s.campaign.index,cycle=s.campaign.cycle){
      originalScenarios.apply(s,index,cycle);
      s.scenario=tuneScenario(originalScenarios.get(index,cycle),index,cycle);
      s.campaign.index=index;s.campaign.cycle=cycle;s.seed=s.scenario.seed;s.rng=U.mulberry32(s.seed);
      s.statusText=s.scenario.label;s.statusSub=`Cycle ${cycle} · map ${index+1}/9`;
      if(!s.scenario.vehicleSchedule.length)s.vehicleWave.finished=true;
      if(!s.scenario.airborneCount&&!s.scenario.helicopterEnabled)s.airborne.finished=true;
      if(!s.scenario.mobileArtilleryCount)s.mobileArtillery.finished=true;
      return s.scenario;
    };
    J.Scenarios.advance=function(s){
      s.campaign.cleared++;
      let index=s.campaign.index+1,cycle=s.campaign.cycle;
      if(index>=9){index=0;cycle++;}
      return J.Scenarios.apply(s,index,cycle);
    };

    /* ------------------------------------------------------------------
       VISUAL SCALE: buildings become a little more substantial. Infantry
       is easier to read, but we keep the battlefield scale intact.
    ------------------------------------------------------------------ */
    const oldEntityScale=J.Scale.entity.bind(J.Scale);
    J.Scale.entity=function(s,y,kind='infantry'){
      const v=oldEntityScale(s,y,kind);
      return kind==='infantry'?v*1.18:v;
    };

    function enlargeBuildings(s){
      for(const b of s?.map?.buildings||[]){
        if(b._v694Sized)continue;b._v694Sized=true;
        b.w=(b.w||24)*1.18;b.h=(b.h||18)*1.15;
      }
    }

    function calmStaticMap(s){
      if(!s?.staticCtx||!s?.staticCanvas||!s?.scenario)return;
      const key=`${s.scenario.seed}:${s.staticCanvas.width}x${s.staticCanvas.height}`;
      if(s._v694CalmKey===key)return;s._v694CalmKey=key;
      enlargeBuildings(s);
      const g=s.staticCtx,w=s.staticCanvas.width,h=s.staticCanvas.height,theme=s.scenario.theme;
      g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
      /* A translucent, low-frequency colour pass suppresses tiny noisy soil
         details while keeping rivers, trenches and larger cover readable. */
      g.fillStyle=theme==='desert'?'rgba(137,116,73,.30)':theme==='polar'?'rgba(176,187,181,.24)':'rgba(61,76,49,.34)';
      g.fillRect(0,0,w,h);
      g.fillStyle=theme==='desert'?'rgba(180,151,91,.07)':theme==='polar'?'rgba(226,231,219,.08)':'rgba(121,139,91,.07)';
      for(let y=Math.round(h*.12);y<h;y+=Math.max(70,Math.round(h*.16)))g.fillRect(0,y,w,Math.max(22,Math.round(h*.045)));
      /* Repaint buildings as clean, larger silhouettes on top of the calmer ground. */
      for(const b of s.map?.buildings||[]){
        const sc=J.Scale.terrain(s,b.y),bw=b.w||28,bh=b.h||20;
        g.save();g.translate(Math.round(b.x),Math.round(b.y));g.rotate(b.rot||0);g.scale(sc,sc);
        g.fillStyle='#151913';g.fillRect(-bw/2-3,-bh/2-3,bw+6,bh+6);
        g.fillStyle=theme==='desert'?'#a98756':theme==='polar'?'#788887':'#626f4b';g.fillRect(-bw/2,-bh/2,bw,bh);
        g.fillStyle=theme==='desert'?'#c2a06a':theme==='polar'?'#9eaeaa':'#82905f';g.fillRect(-bw/2,-bh/2,bw,4);
        g.fillStyle='#171a14';g.fillRect(-5,Math.round(bh*.07),10,Math.max(6,Math.round(bh*.34)));
        g.fillStyle='#cabb72';g.fillRect(Math.round(-bw*.31),Math.round(-bh*.15),6,4);g.fillRect(Math.round(bw*.15),Math.round(-bh*.15),6,4);
        g.restore();
      }
      g.restore();
    }

    const oldResize=J.World.resize.bind(J.World);
    J.World.resize=function(s,canvas){oldResize(s,canvas);calmStaticMap(s);};

    /* ------------------------------------------------------------------
       PIXEL INFANTRY: hide only the old living field-soldier sprites and
       draw a compact original pixel silhouette. No floating class signs.
    ------------------------------------------------------------------ */
    const classPalette={
      rifleman:{body:'#697750',helmet:'#3c4632',accent:'#b9b77c'},
      marksman:{body:'#657369',helmet:'#35423d',accent:'#a9c1b8'},
      smg:{body:'#78805a',helmet:'#45482f',accent:'#c6aa61'},
      lmg:{body:'#5c6647',helmet:'#343b2c',accent:'#a17d49'},
      engineer:{body:'#766749',helmet:'#473c2e',accent:'#a77b4e'}
    };
    function pxRect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
    function drawPixelInfantry(ctx,s,e){
      if(!e||e.state==='DEAD'||e.inBuilding)return;
      const key=e.classKey||e.type||'rifleman',pal=classPalette[key]||classPalette.rifleman;
      const sc=J.Scale.entity(s,e.y,'infantry');
      const H=U.clamp(Math.round(72*sc),12,18),W=U.clamp(Math.round(H*.48),6,9);
      const walking=e.state==='ADVANCE'||e.state==='SPRINT_TO_COVER';
      const prone=e.pose==='prone'||e.state==='PRONE';
      const crouch=e.pose==='crouch'||e.state==='IN_COVER'||e.state==='FIRE_FROM_COVER';
      const phase=((Math.floor((s.simTime||s.time||0)*8)+(e.id||0))&1)?1:-1;
      const dir=(e.vx||0)<-.02?-1:1;
      ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y));ctx.imageSmoothingEnabled=false;
      if(prone){
        pxRect(ctx,-W*.48,-3,W+3,3,'#12150f');pxRect(ctx,-W*.35,-5,W*.72,4,pal.body);pxRect(ctx,W*.24,-7,4,4,pal.helmet);pxRect(ctx,-W*.10,-5,W*.22,2,pal.accent);
        pxRect(ctx,dir>0?W*.45:-W*.95,-4,W*.62,2,'#20241c');
      }else{
        const top=-H,headY=top+2,torsoY=top+6,torsoH=crouch?Math.round(H*.34):Math.round(H*.40),legY=torsoY+torsoH;
        /* dark outer silhouette */
        pxRect(ctx,-W*.28,headY-1,W*.56,5,'#11140f');
        pxRect(ctx,-W*.40,torsoY-1,W*.80,torsoH+2,'#11140f');
        /* head + helmet, deliberately oversized for readability */
        pxRect(ctx,-W*.20,headY,W*.40,3,'#c8b590');pxRect(ctx,-W*.28,headY-1,W*.56,2,pal.helmet);
        /* torso */
        pxRect(ctx,-W*.31,torsoY,W*.62,torsoH,pal.body);pxRect(ctx,-W*.19,torsoY+1,W*.18,Math.max(2,torsoH-2),pal.accent);
        /* arms and rifle */
        const armY=torsoY+Math.max(2,Math.round(torsoH*.35));
        pxRect(ctx,dir>0?W*.20:-W*.54,armY,W*.34,2,pal.body);pxRect(ctx,dir>0?W*.44:-W*.98,armY-1,W*.56,2,'#24271f');
        if(crouch){
          pxRect(ctx,-W*.34,legY-1,W*.30,3,'#242a20');pxRect(ctx,W*.05,legY,W*.34,2,'#242a20');
        }else{
          const swing=walking?phase:0;
          pxRect(ctx,-W*.25+swing,legY,W*.22,H*.24,'#252b21');pxRect(ctx,W*.05-swing,legY,W*.22,H*.24,'#252b21');
        }
        if((e.muzzleT||0)>.02){const mx=dir>0?W*1.02:-W*1.20;pxRect(ctx,mx,armY-2,4,3,'#ffdc70');pxRect(ctx,mx+(dir>0?3:-2),armY-1,2,1,'#fff1aa');}
      }
      ctx.restore();
    }

    const oldRender=J.Render.render.bind(J.Render);
    J.Render.render=function(s,ctx){
      calmStaticMap(s);
      const all=s.enemies||[];
      const custom=all.filter(e=>e.state!=='DEAD'&&!e.inBuilding);
      /* Keep corpses and garrisoned soldiers available to the existing 6.9.3
         renderer, but suppress the old tiny live field sprites. */
      s.enemies=all.filter(e=>e.state==='DEAD'||e.inBuilding);
      try{oldRender(s,ctx);}finally{s.enemies=all;}
      for(const e of custom)drawPixelInfantry(ctx,s,e);
    };

    /* If v6.9.4 loads while the original demo brief is already prepared,
       rebuild map 1 immediately using the progressive scenario before DEPLOY. */
    function rebuildInitial(){
      const s=window.__JBD_STATE__,canvas=document.getElementById('game');
      if(!s||!s.scenario||!canvas){setTimeout(rebuildInitial,80);return;}
      if(s.mode==='brief'&&(s.campaign?.index??0)===0){
        J.Scenarios.apply(s,0,s.campaign?.cycle||1);
        J.Particles.init(s);J.Combat.init(s);J.World.resize(s,canvas);
        const title=document.getElementById('title'),sub=document.getElementById('sub');
        if(title)title.textContent=s.scenario.label;
        if(sub)sub.innerHTML=`JUNGLE · MAP 1/9 · FIRST CONTACT<br><span>Rustige start · alleen infantry · de campaign bouwt per map verder op</span>`;
      }
    }
    rebuildInitial();

    /* Completion guards for maps that intentionally omit systems. */
    setInterval(()=>{
      const s=window.__JBD_STATE__;if(!s?.scenario)return;
      if(!s.scenario.vehicleSchedule?.length)s.vehicleWave.finished=true;
      if(!s.scenario.airborneCount&&!s.scenario.helicopterEnabled)s.airborne.finished=true;
      if(!s.scenario.mobileArtilleryCount)s.mobileArtillery.finished=true;
    },250);

    console.info('JBD v6.9.4 progressive/readability patch active');
  };
  wait();
})();