/* JBD restore build — keep the older coherent art, only tune pace/spawns */
(()=>{
  const J=window.JBD;
  if(!J||!J.Scenarios||!J.Infantry||!J.Render||!J.Scale)return;
  const U=J.U;

  const oldEntity=J.Scale.entity.bind(J.Scale);
  J.Scale.entity=function(s,y,kind='infantry'){
    const base=oldEntity(s,y,kind);
    if(kind==='infantry')return base*1.12;
    if(kind==='vehicle')return base*1.06;
    if(kind==='air')return base*1.08;
    return base;
  };

  function tuneScenario(q){
    if(!q||q._restoreTuned)return q;
    q._restoreTuned=true;
    const i=q.index||0;
    q.spawnDuration=Math.max(7.2,(q.spawnDuration||15)*.56);
    q.infantrySpeedMult=Math.max((q.infantrySpeedMult||1)*1.34,1.26);
    q.vehicleSpeedMult=(q.vehicleSpeedMult||1)*1.10;
    q.coverSearchRadius=Math.max(105,(q.coverSearchRadius||180)*.76);
    q.airborneCount=Math.max(q.airborneCount||0,i<3?3:i<6?4:5);
    q.airborneStart=5.4+i*.35;
    const existing=(q.vehicleSchedule||[]).map(x=>({...x,time:Math.max(.8,(x.time||0)*.56)}));
    const early=[
      {time:1.35,type:'truck',lane:i%2?-.18:.18},
      {time:3.10,type:i<3?'technical':'halftrack',lane:i%2?.22:-.22}
    ];
    q.vehicleSchedule=[...early,...existing].sort((a,b)=>a.time-b.time).slice(0,9);
    return q;
  }

  const oldGet=J.Scenarios.get.bind(J.Scenarios);
  J.Scenarios.get=(index=0,cycle=1)=>tuneScenario(oldGet(index,cycle));
  const oldApply=J.Scenarios.apply.bind(J.Scenarios);
  J.Scenarios.apply=function(s,index=s.campaign.index,cycle=s.campaign.cycle){
    const out=oldApply(s,index,cycle);tuneScenario(s.scenario);resetHelis(s);return s.scenario||out;
  };
  const oldAdvance=J.Scenarios.advance.bind(J.Scenarios);
  J.Scenarios.advance=function(s){const out=oldAdvance(s);tuneScenario(s.scenario);resetHelis(s);return s.scenario||out;};

  const baseSpawn=J.Infantry.spawn.bind(J.Infantry);
  J.Infantry.spawn=function(s,x=null,y=null,opts={}){
    if(x==null&&y==null&&s?.viewport){
      x=J.World.pickSpawnX(s,s.rng);
      y=(s.safe?.top||0)+s.viewport.h*(.165+s.rng()*.055);
    }
    return baseSpawn(s,x,y,opts);
  };

  const baseInfUpdate=J.Infantry.update.bind(J.Infantry);
  const motion=new Map();
  J.Infantry.update=function(s,dt){
    baseInfUpdate(s,dt);
    const bx=s.bunker?.x??s.viewport.w*.5,by=s.bunker?.y??s.viewport.h*.86;
    for(const e of s.enemies||[]){
      if(!e||e.state==='DEAD')continue;
      const p=motion.get(e.id)||{x:e.x,y:e.y,t:0};
      const moved=Math.hypot(e.x-p.x,e.y-p.y);
      const still=moved<.28?p.t+dt:0;
      motion.set(e.id,{x:e.x,y:e.y,t:still});
      const holding=['ENTER_COVER','FIRE_FROM_COVER','IN_COVER','DEPLOY_WEAPON','FIRE_FROM_WEAPON'].includes(e.state);
      const limit=holding?3.0:4.2;
      if(still>limit&&e.y<by-92){
        if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;
        e.cover=null;e.coverIntent=false;e.mountedWeapon=false;e.deployingWeapon=false;
        e.reCoverT=2.0+s.rng()*.9;e.assaultT=1.15+s.rng()*.45;e.state='ADVANCE';e.stateT=0;e.pose='walk';
        const dx=bx-e.x,dy=by-e.y,d=Math.hypot(dx,dy)||1;
        e.x+=dx/d*2.0;e.y+=Math.max(1.8,dy/d*3.0);
        motion.set(e.id,{x:e.x,y:e.y,t:0});
      }
    }
    for(const id of [...motion.keys()])if(!(s.enemies||[]).some(e=>e.id===id&&e.state!=='DEAD'))motion.delete(id);
  };

  function heliPlan(index){
    const extra=index>=6?3:2,out=[];
    for(let k=0;k<extra;k++)out.push({time:2.4+k*6.1,count:(index>=5?3:2),side:(index+k)%2?'left':'right',x:.28+((index+k)%3)*.22,y:.34+(k%2)*.12,started:false,done:false});
    return out;
  }
  function resetHelis(s){if(!s)return;s._restoreHeli={seed:s.scenario?.seed??0,events:heliPlan(s.scenario?.index||0),visuals:[]};}
  function ensureHelis(s){if(!s._restoreHeli||s._restoreHeli.seed!==(s.scenario?.seed??0))resetHelis(s);return s._restoreHeli;}
  function spawnHeliGroup(s,e){
    const x=s.viewport.w*e.x,y=s.viewport.h*e.y;
    for(let i=0;i<e.count;i++){
      const unit=baseSpawn(s,U.clamp(x+(i-(e.count-1)/2)*18,24,s.viewport.w-24),U.clamp(y+(i%2)*10,(s.safe?.top||0)+120,s.bunker.y-130),{coverIntent:false,reCoverT:1.9});
      unit.assaultT=1.2;unit.state='ADVANCE';unit.stateT=0;unit.pose='walk';
    }
    s.ui.message='HELICOPTER INSERTION';s.ui.messageT=.75;
  }
  function updateHelis(s,dt){
    if(!s||s.mode!=='playing'||s.levelComplete)return;
    const h=ensureHelis(s),t=s.simTime||0,w=s.viewport.w;
    for(const e of h.events){
      if(!e.started&&t>=e.time){
        e.started=true;
        h.visuals.push({event:e,t:0,dur:4.2,x0:e.side==='left'?-72:w+72,x1:w*e.x,y:s.viewport.h*e.y,dropped:false});
      }
    }
    for(const v of h.visuals){
      v.t+=dt;const p=U.clamp(v.t/v.dur,0,1);
      if(!v.dropped&&p>.43){v.dropped=true;spawnHeliGroup(s,v.event);}
      if(p>=1)v.event.done=true;
    }
    h.visuals=h.visuals.filter(v=>v.t<v.dur+.05);
  }
  function drawHeli(ctx,s,v){
    const p=U.clamp(v.t/v.dur,0,1),w=s.viewport.w;
    let x;
    if(p<.32)x=v.x0+(v.x1-v.x0)*(p/.32);
    else if(p<.68)x=v.x1;
    else x=v.x1+((v.x0<0?w+78:-78)-v.x1)*((p-.68)/.32);
    const y=v.y+Math.sin(v.t*3.2)*1.5,rot=v.t*15;
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle='rgba(0,0,0,.20)';ctx.beginPath();ctx.ellipse(5,9,25,8,0,0,6.28);ctx.fill();
    ctx.fillStyle='#5a6248';ctx.strokeStyle='#20251d';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,14,9,0,0,6.28);ctx.fill();ctx.stroke();
    ctx.fillStyle='#454c39';ctx.fillRect(10,-3,23,6);ctx.strokeRect(10,-3,23,6);
    ctx.fillStyle='#30362b';ctx.fillRect(30,-6,3,12);
    ctx.fillStyle='#899077';ctx.beginPath();ctx.ellipse(-5,-3,6,4,0,0,6.28);ctx.fill();
    ctx.strokeStyle='rgba(33,38,30,.88)';ctx.lineWidth=2;ctx.save();ctx.rotate(rot);ctx.beginPath();ctx.moveTo(-28,0);ctx.lineTo(28,0);ctx.moveTo(0,-28);ctx.lineTo(0,28);ctx.stroke();ctx.restore();
    ctx.restore();
  }

  const baseRender=J.Render.render.bind(J.Render);let last=performance.now();
  J.Render.render=function(s,ctx){
    const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    updateHelis(s,dt);
    const out=baseRender(s,ctx);
    if(s?.mode==='playing'){
      const h=ensureHelis(s);ctx.save();ctx.setTransform(s.viewport.dpr,0,0,s.viewport.dpr,0,0);
      for(const v of h.visuals)drawHeli(ctx,s,v);ctx.restore();
    }
    return out;
  };

  console.info('JBD restore patch active: original art + faster pressure');
})();
