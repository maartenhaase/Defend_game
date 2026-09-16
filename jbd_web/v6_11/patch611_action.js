/* JBD v6.11 — fast insertion mix, anti-stall AI, persistent line craters */
(()=>{
  const wait=()=>{
    const J=window.JBD;if(!J||!J.Scenarios||!J.Infantry||!J.Render||!J.U){setTimeout(wait,35);return;}if(J.__v611ActionPatch)return;J.__v611ActionPatch=true;
    const U=J.U,state=()=>window.__JBD_STATE__||null;
    const oldApply=J.Scenarios.apply.bind(J.Scenarios),oldAdvance=J.Scenarios.advance.bind(J.Scenarios),baseSpawn=J.Infantry.spawn.bind(J.Infantry);
    const COUNTS=[22,24,26,25,28,30,27,30,34];
    function vehicles(i){
      const base=[
        [{time:.8,type:'truck',lane:-.15},{time:3.6,type:'technical',lane:.18},{time:7.4,type:'truck',lane:.12}],
        [{time:.7,type:'truck',lane:.16},{time:3.0,type:'truck',lane:-.14},{time:5.8,type:'technical',lane:.18},{time:9.6,type:'halftrack',lane:-.08}],
        [{time:.8,type:'truck',lane:-.12},{time:3.2,type:'technical',lane:.18},{time:6.2,type:'halftrack',lane:-.08},{time:10.2,type:'truck',lane:.15}],
        [{time:.7,type:'technical',lane:-.18},{time:3.3,type:'truck',lane:.16},{time:6.6,type:'halftrack',lane:-.08}],
        [{time:.8,type:'truck',lane:-.14},{time:2.8,type:'technical',lane:.18},{time:5.2,type:'truck',lane:.12},{time:8.8,type:'halftrack',lane:-.08}],
        [{time:.6,type:'technical',lane:-.18},{time:2.4,type:'truck',lane:.15},{time:4.8,type:'halftrack',lane:-.08},{time:7.4,type:'stug',lane:.18}],
        [{time:.8,type:'truck',lane:-.12},{time:3.1,type:'halftrack',lane:.16},{time:6.4,type:'technical',lane:-.18}],
        [{time:.7,type:'truck',lane:.14},{time:2.6,type:'halftrack',lane:-.10},{time:5.0,type:'technical',lane:.18},{time:8.3,type:'stug',lane:-.18}],
        [{time:.5,type:'truck',lane:-.15},{time:2.0,type:'technical',lane:.18},{time:3.8,type:'halftrack',lane:-.08},{time:6.0,type:'stug',lane:.18},{time:9.0,type:'tank',lane:-.18}]
      ][i]||[];
      return base.map((v,k)=>({...v,model:k%3,role:v.type==='truck'?'troop':v.type==='technical'?'recon':v.type==='halftrack'?'escort':'assault'}));
    }
    function tune(q){if(!q)return q;const i=q.index||0;q.demo=false;q.actionStyle=['QUICK CONTACT','VILLAGE PUSH','AIR BRIDGE','DESERT DASH','OUTPOST RAID','AIRBORNE SWEEP','FROZEN ROAD','SNOW BASE','FINAL ASSAULT'][i]||'ASSAULT';q.label=`${(q.theme||'jungle').toUpperCase()} ${((i%3)+1)} · ${q.actionStyle}`;q.infantryCount=Math.max(COUNTS[i]||24,q.infantryCount||0);q.spawnDuration=22+i*.7;q.infantrySpeedMult=Math.max(q.infantrySpeedMult||1,i<3?2.15:1.95);q.vehicleSpeedMult=Math.max(q.vehicleSpeedMult||1,1.28);q.coverSearchRadius=Math.min(q.coverSearchRadius||160,76);q.vehicleSchedule=vehicles(i);q.airborneCount=0;q.airborneStart=99;q.helicopterEnabled=false;q.helicopterStart=99;q.mobileArtilleryCount=i<4?0:Math.min(1,q.mobileArtilleryCount||0);q.mobileArtilleryStart=i<4?99:12;q.artilleryCount=[0,1,2,1,2,3,2,3,4][i];return q;}
    function schedule(i){const E=(type,t,count,x,y)=>({type,t,count,x,y,started:false,completed:false});return [
      [E('heli',1.0,4,.70,.36),E('plane',4.2,4,.38,.41),E('heli',8.0,3,.30,.48),E('plane',12.0,4,.62,.53)],
      [E('plane',.9,4,.34,.36),E('heli',3.8,4,.70,.43),E('heli',7.5,3,.30,.50),E('plane',11.6,4,.58,.56)],
      [E('heli',.8,4,.28,.37),E('plane',3.4,5,.60,.42),E('heli',6.7,4,.72,.50),E('plane',10.4,4,.42,.57)],
      [E('plane',.9,5,.42,.36),E('heli',3.8,4,.68,.44),E('plane',7.2,4,.58,.52),E('heli',10.8,3,.30,.57)],
      [E('heli',.8,4,.72,.36),E('plane',3.0,5,.40,.43),E('heli',6.0,4,.30,.50),E('plane',9.6,4,.62,.57)],
      [E('plane',.7,5,.52,.35),E('heli',2.8,4,.72,.43),E('plane',5.5,5,.36,.50),E('heli',8.4,4,.28,.57)],
      [E('heli',.8,4,.30,.36),E('plane',3.2,4,.62,.43),E('heli',6.4,4,.72,.50),E('plane',10.0,4,.42,.57)],
      [E('plane',.6,5,.40,.35),E('heli',2.6,4,.70,.43),E('heli',5.2,4,.28,.50),E('plane',8.2,5,.60,.57)],
      [E('heli',.5,5,.72,.35),E('plane',2.2,5,.38,.41),E('heli',4.6,5,.28,.48),E('plane',7.2,5,.62,.54),E('heli',10.0,4,.50,.59)]
    ][i]||[];}
    function reset(s){if(!s)return;s._v611Action={seed:s.scenario?.seed??0,events:schedule(s.scenario?.index||0),visuals:[],drops:[],done:false};s._v611CraterSeen=new WeakSet();s._v611CraterCount=0;s._v611UpgradeShown=false;if(s.airborne)s.airborne.finished=false;}
    J.Scenarios.apply=function(s,index=s.campaign.index,cycle=s.campaign.cycle){const out=oldApply(s,index,cycle);tune(s.scenario);reset(s);return out;};
    J.Scenarios.advance=function(s){const out=oldAdvance(s);tune(s.scenario);reset(s);return out;};

    function newest(s,before){for(let i=(s.enemies||[]).length-1;i>=0;i--){const e=s.enemies[i];if(e&&!before.has(e.id))return e;}return null;}
    J.Infantry.spawn=function(s,...args){const ids=new Set((s.enemies||[]).map(e=>e.id)),out=baseSpawn(s,...args),e=newest(s,ids);if(e){const at=s._v611SpawnAt;if(at){e.x=U.clamp(at.x+(-10+Math.random()*20),20,s.viewport.w-20);e.y=U.clamp(at.y+(-8+Math.random()*16),(s.safe?.top||0)+105,s.bunker.y-105);}else if(e.y<(s.safe?.top||0)+s.viewport.h*.25){const lanes=[.24,.38,.62,.76],lane=lanes[(s.spawn?.count||0)%lanes.length];e.x=s.viewport.w*lane+(-10+Math.random()*20);e.y=(s.safe?.top||0)+s.viewport.h*(.26+Math.random()*.08);}e.inBuilding=0;e.cover=null;e.coverIntent=false;e.reCoverT=3.0;e.state='ADVANCE';e.stateT=0;e.pose='walk';e.vy=Math.max(e.vy||0,2.2);e._v611Born=performance.now();}return out;};
    function spawnAt(s,x,y,source){if((s.spawn?.count??0)>=(s.scenario?.infantryCount??999))return null;s._v611SpawnAt={x,y,source};const ids=new Set((s.enemies||[]).map(e=>e.id));try{J.Infantry.spawn(s);}finally{s._v611SpawnAt=null;}const e=newest(s,ids);if(e)e._v611Source=source;return e;}
    function beginEvent(s,e){e.started=true;const a=s._v611Action,w=s.viewport.w,h=s.viewport.h;if(e.type==='heli')a.visuals.push({type:'heli',event:e,t:0,dur:3.9,x0:w+60,x1:w*e.x,y:h*e.y,dropped:false});else a.visuals.push({type:'plane',event:e,t:0,dur:2.9,x0:-70,x1:w+70,y:h*.19,dropped:false});}
    function updateAction(s,dt){if(!s||s.mode!=='playing'||s.levelComplete)return;if(!s._v611Action||s._v611Action.seed!==(s.scenario?.seed??0))reset(s);const a=s._v611Action,t=s.simTime||0;for(const e of a.events)if(!e.started&&t>=e.t)beginEvent(s,e);for(const v of a.visuals){v.t+=dt;const p=U.clamp(v.t/v.dur,0,1);if(!v.dropped&&p>(v.type==='heli'?.42:.40)){v.dropped=true;if(v.type==='heli'){const x=s.viewport.w*v.event.x,y=s.viewport.h*v.event.y;for(let k=0;k<v.event.count;k++)spawnAt(s,x+(k-(v.event.count-1)/2)*14,y+(k%2)*9,'heli');}else{for(let k=0;k<v.event.count;k++){const x=s.viewport.w*v.event.x+(k-(v.event.count-1)/2)*18,y=s.viewport.h*v.event.y+(k%2)*12;a.drops.push({x,y0:(s.safe?.top||0)+88,y,t:0,dur:.95+Math.random()*.25,landed:false});}}}if(p>=1)v.event.completed=true;}a.visuals=a.visuals.filter(v=>v.t<v.dur+.1);for(const d of a.drops){if(d.landed)continue;d.t+=dt;if(d.t>=d.dur){d.landed=true;spawnAt(s,d.x,d.y,'parachute');}}a.drops=a.drops.filter(d=>!d.landed);a.done=a.events.every(e=>e.completed)&&a.visuals.length===0&&a.drops.length===0;if(s.airborne)s.airborne.finished=a.done;}

    const tracks=new Map();let lastTick=performance.now();
    function release(s,e){if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;e.cover=null;e.coverIntent=false;e.inBuilding=0;e.reCoverT=3.5;e.state='ADVANCE';e.stateT=0;e.pose='walk';e.y+=5;e.vy=Math.max(e.vy||0,2.6);}
    setInterval(()=>{const s=state(),now=performance.now(),dt=Math.min(.5,(now-lastTick)/1000);lastTick=now;if(!s||s.mode!=='playing'||s.levelComplete)return;let active=0;for(const e of s.enemies||[]){if(!e||e.state==='DEAD')continue;active++;const q=tracks.get(e.id)||{x:e.x,y:e.y,t:0},m=Math.hypot(e.x-q.x,e.y-q.y),st=m<.18?q.t+dt:0;tracks.set(e.id,{x:e.x,y:e.y,t:st});if(st>1.55||e.inBuilding&&st>.9)release(s,e);}for(const id of [...tracks.keys()])if(!(s.enemies||[]).some(e=>e.id===id&&e.state!=='DEAD'))tracks.delete(id);if(active<2&&(s.spawn?.count??0)<(s.scenario?.infantryCount??0)&&J.Infantry?.spawn){try{J.Infantry.spawn(s);}catch(_){}}},300);

    function crater(s,x,y,r){const g=s.damageCtx;if(!g)return;r=U.clamp(r,7,18);g.save();g.translate(Math.round(x),Math.round(y));g.lineWidth=1.5;g.fillStyle='rgba(45,39,31,.70)';g.strokeStyle='rgba(24,24,21,.92)';g.beginPath();g.ellipse(0,0,r,r*.72,0,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='rgba(18,19,17,.82)';g.beginPath();g.ellipse(0,0,r*.55,r*.40,0,0,Math.PI*2);g.fill();g.stroke();g.strokeStyle='rgba(166,137,90,.80)';g.beginPath();g.arc(-r*.1,-r*.05,r*.78,Math.PI*.95,Math.PI*1.75);g.stroke();for(let i=0;i<8;i++){const a=i/8*Math.PI*2,rr=r*(1.05+(i%2)*.15);g.fillStyle='#46392b';g.fillRect(Math.cos(a)*rr,Math.sin(a)*rr*.72,1.5,1.5);}g.restore();}
    function capture(s){if(!s?.damageCtx)return;const seen=s._v611CraterSeen||(s._v611CraterSeen=new WeakSet());for(const ex of s.explosions||[]){if(!ex||seen.has(ex)||!Number.isFinite(ex.x)||!Number.isFinite(ex.y))continue;seen.add(ex);const raw=Number(ex.radius??ex.r??ex.maxRadius??ex.size??15);crater(s,ex.x,ex.y,U.clamp(raw*.18,7,18));}}

    const oldRender=J.Render.render.bind(J.Render);let last=performance.now();
    J.Render.render=function(s,ctx){const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(s?.scenario)tune(s.scenario);updateAction(s,dt);capture(s);return oldRender(s,ctx);};
    const init=()=>{const s=state();if(!s||!s.scenario){setTimeout(init,60);return;}tune(s.scenario);reset(s);};init();
    console.info('JBD v6.11 fast insertion/anti-stall/craters active');
  };wait();
})();