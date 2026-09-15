/* ===== v6.8 tactical hotfix / consolidation layer ===== */
(()=>{
  const wait=()=>{
    const J=window.JBD;
    if(!J||!J.Infantry||!J.Vehicles||!J.World||!J.Render||!J.CONFIG){setTimeout(wait,20);return;}
    if(J.__v68)return; J.__v68=true;
    const C=J.CONFIG,U=J.U;

    const IC=J.Infantry.INF_CLASSES;
    Object.assign(IC.rifleman,{label:'RIFLE',range:1.08,interval:2.55,damage:1.00,hit:.64,burst:1,speed:1.00,hp:1.00,volley:[1,2],accent:'#d4d49b'});
    Object.assign(IC.marksman,{label:'SNIPER',range:1.62,interval:3.75,damage:1.85,hit:.76,burst:1,speed:.88,hp:.90,volley:[1,1],accent:'#c8d9c5'});
    Object.assign(IC.smg,{label:'SMG',range:.42,interval:2.25,damage:.62,hit:.50,burst:2,speed:1.12,hp:.92,volley:[1,2],accent:'#b7a56b'});
    Object.assign(IC.lmg,{label:'LMG',range:.56,interval:2.80,damage:.76,hit:.58,burst:2,speed:.90,hp:1.05,volley:[1,2],accent:'#9a8557'});
    Object.assign(IC.engineer,{label:'ENGINEER',range:.58,interval:3.45,damage:.82,hit:.55,burst:1,speed:1.00,hp:1.02,volley:[1,1],accent:'#9b7048'});
    C.infantry.maxMountedWeapons=1;
    C.infantry.fireInterval=1.80;
    C.infantry.weaponRange=175;
    C.infantry.weaponFireInterval=1.35;
    C.infantry.weaponHitBase=.66;

    const policy={
      rifleman:{close:1.08,far:1.42,gate:.28,gap:[2.8,5.2]},
      marksman:{close:1.62,far:1.85,gate:.48,gap:[3.8,6.4]},
      smg:{close:.42,far:.42,gate:.38,gap:[2.8,4.8]},
      lmg:{close:.56,far:.56,gate:.34,gap:[3.2,5.4]},
      engineer:{close:.58,far:.58,gate:.22,gap:[4.0,6.8]}
    };
    const baseRange=(s)=>s.scenario?.infantryRange||C.infantry.range;
    const distanceToBunker=(s,e)=>Math.hypot(s.bunker.x-e.x,s.bunker.y-e.y);
    const oldInfUpdate=J.Infantry.update;
    const personalGap={rifleman:[6.4,10.2],marksman:[8.0,13.0],smg:[7.0,11.0],lmg:[7.8,12.0],engineer:[9.0,14.0]};
    const gapFor=(key)=>{const g=personalGap[key]||personalGap.rifleman;return g[0]+Math.random()*(g[1]-g[0]);};

    const oldAudioPlay=J.Audio.play.bind(J.Audio);
    J.Audio.play=function(name,opts={}){
      if((name==='enemyRifle'||name==='vehicleMg')&&J.__tacticalState&&Number.isFinite(opts.x)){
        const s=J.__tacticalState;
        let shooter=null,best=16;
        for(const e of s.enemies||[]){if(e.state==='DEAD')continue;const d=Math.abs(e.x-opts.x);if(d<best){best=d;shooter=e;}}
        if(shooter){
          const key=shooter.classKey||'rifleman',mounted=!!shooter.mountedWeapon;
          shooter._discCooldown=mounted?(5.0+Math.random()*2.5):gapFor(key);
          s._discGlobal=mounted?(3.4+Math.random()*1.8):(key==='marksman'?(2.8+Math.random()*1.8):(2.2+Math.random()*1.5));
        }
      }
      return oldAudioPlay(name,opts);
    };

    J.Infantry.update=function(s,dt){
      J.__tacticalState=s;
      if(s.scenario)s.scenario.enemyFireRateMult=Math.min(s.scenario.enemyFireRateMult||1,1);
      s._discGlobal=Math.max(0,(s._discGlobal||0)-dt);
      let candidates=[];
      for(const e of s.enemies){
        if(e.state==='DEAD')continue;
        e._discCooldown=Math.max(0,(e._discCooldown||0)-dt);
        const d=distanceToBunker(s,e), key=e.classKey||'rifleman', p=policy[key]||policy.rifleman, br=baseRange(s);
        if(key==='marksman'&&e.state==='ADVANCE'&&J.Scale.progress(s,e.y)>.22)e.coverIntent=true;
        if(key==='smg'&&d>br*.50&&e.state==='ADVANCE')e.coverIntent=false;
        if(key==='engineer'&&e.state==='ADVANCE'&&J.Scale.progress(s,e.y)>.36)e.coverIntent=true;
        if(e.teamRole==='mg_gunner')e.canEmplace=d<=190;
        else if(e.type==='engineer')e.canEmplace=false;
        const mounted=!!e.mountedWeapon;
        const allowedDist=mounted?175:br*p.close;
        const farHarass=!mounted&&(key==='rifleman'||key==='marksman')&&d<=br*p.far;
        const canShoot=d<=allowedDist||farHarass;
        if(e._discCooldown>0||s._discGlobal>0)e.fireT=Math.max(e.fireT,Math.max(e._discCooldown,s._discGlobal)+.08);
        if(!canShoot){
          e.fireT=Math.max(e.fireT,1.2+Math.random()*1.6);
          if((key==='smg'||key==='lmg'||key==='engineer')&&(e.state==='IN_COVER'||e.state==='FIRE_FROM_COVER')&&e.stateT>1.5){
            if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;
            e.cover=null;e.coverIntent=false;e.reCoverT=1.3+Math.random()*1.5;e.state='ADVANCE';e.stateT=0;e.pose='walk';
          }
          continue;
        }
        if(e.fireT<=0&&e._discCooldown<=0&&s._discGlobal<=0){
          const chance=(d>allowedDist)?p.gate*.22:p.gate*.70;
          if(Math.random()>chance){e.fireT=1.4+Math.random()*2.8;continue;}
          candidates.push({e,key,p,mounted,score:(key==='marksman'?5:key==='rifleman'?4:mounted?3:key==='lmg'?2:1)+Math.random()});
        }
      }
      if(candidates.length){
        candidates.sort((a,b)=>b.score-a.score);
        const chosen=candidates[0];
        for(const c of candidates){if(c!==chosen)c.e.fireT=.9+Math.random()*1.8;}
        chosen.e.fireT=-.001;
        chosen.e.volleyLeft=chosen.mounted?Math.min(chosen.e.volleyLeft||1,2):1;
      }
      oldInfUpdate(s,dt);
      J.__tacticalState=null;
    };

    const oldWaypoint=J.World.vehicleWaypoint;
    function wetSegment(s,x1,y1,x2,y2){for(let i=1;i<=10;i++){const t=i/10,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;if(J.World.isInWater(s,x,y))return true;}return false;}
    function localAvoid(s,v,target){
      const dx=target.x-v.x,dy=target.y-v.y,d=Math.hypot(dx,dy)||1,nx=dx/d,ny=dy/d,px=-ny,py=nx;
      let best=null,bestProj=1e9;
      for(const o of s.map?.obstacles||[]){const ox=o.x-v.x,oy=o.y-v.y,proj=ox*nx+oy*ny;if(proj<0||proj>78)continue;const lateral=Math.abs(ox*px+oy*py),safe=o.radius+(v.radius||20)*.68+8;if(lateral<safe&&proj<bestProj){best=o;bestProj=proj;}}
      if(!best){v._v68AvoidSide=null;return target;}
      if(v._v68AvoidSide==null)v._v68AvoidSide=((v.id+Math.round(best.x))&1)?1:-1;
      const clearance=best.radius+(v.radius||20)+16;
      return {x:U.clamp(best.x+px*v._v68AvoidSide*clearance,24,s.viewport.w-24),y:best.y+ny*12};
    }
    function bankSafePoint(s,v,x,y,side,safe){
      let xx=x,rx=J.World.riverXAt(s,y);if(side*(xx-rx)<safe)xx=rx+side*safe;
      for(const o of s.map?.obstacles||[]){const d=Math.hypot(o.x-xx,o.y-y),need=o.radius+(v.radius||20)+12;if(d<need)xx+=side*(need-d+8);}
      return {x:U.clamp(xx,24,s.viewport.w-24),y,bridge:false,lock:true};
    }
    function buildRoadRoute(s,v,fx=s.bunker.x,fy=s.bunker.y-80){
      const bridges=s.map?.bridges||[];if(!bridges.length)return null;
      const startY=Math.max(40,v.y),startRx=J.World.riverXAt(s,startY),endRx=J.World.riverXAt(s,fy);
      const startSide=Math.sign(v.x-startRx)||Math.sign(v.spawnX-startRx)||-1,targetSide=Math.sign(fx-endRx)||1;
      if(startSide===targetSide&&!wetSegment(s,v.x,v.y,fx,fy))return null;
      let bi=v.lane>=0?Math.min(1,bridges.length-1):0;
      let b=bridges[bi];if(b.y<v.y+36){let best=null,bd=1e9;for(const q of bridges){if(q.y<v.y+24)continue;const d=q.y-v.y;if(d<bd){bd=d;best=q;}}if(best)b=best;}
      const by=b.y,rxB=J.World.riverXAt(s,by),safe=s.map.river.width*.5+Math.max(18,(v.radius||20)*.60)+14,pts=[];
      const travel=Math.max(1,by-startY),step=Math.max(38,travel/4);
      for(let y=startY+step;y<by-24;y+=step){const u=U.clamp((y-startY)/travel,0,1),desired=v.x*(1-u)+(rxB+startSide*safe)*u;pts.push(bankSafePoint(s,v,desired,y,startSide,safe));}
      pts.push({x:rxB+startSide*safe,y:by,bridge:true,lock:true});
      pts.push({x:rxB+targetSide*safe,y:by,bridge:true,lock:true});
      const afterStart=by+42,afterTravel=Math.max(1,fy-afterStart),afterStep=Math.max(44,afterTravel/5);
      for(let y=afterStart;y<fy-34;y+=afterStep){const u=U.clamp((y-afterStart)/afterTravel,0,1),desired=(rxB+targetSide*safe)*(1-u)+fx*u;pts.push(bankSafePoint(s,v,desired,y,targetSide,safe));}
      pts.push(bankSafePoint(s,v,fx,fy,targetSide,safe*.78));
      return pts;
    }
    J.World.vehicleWaypoint=function(s,v,fx,fy){
      if(!s.map||v.departing)return oldWaypoint(s,v,fx,fy);
      if(!v._v68Route||v._v68RouteSeed!==s.scenario?.seed){v._v68Route=buildRoadRoute(s,v,fx,fy);v._v68RouteSeed=s.scenario?.seed;v._v68RouteI=0;}
      const route=v._v68Route;
      if(route&&route.length){while(v._v68RouteI<route.length&&Math.hypot(v.x-route[v._v68RouteI].x,v.y-route[v._v68RouteI].y)<15)v._v68RouteI++;if(v._v68RouteI<route.length){const pt=route[v._v68RouteI];return (pt.bridge||pt.lock)?{x:pt.x,y:pt.y}:localAvoid(s,v,{x:pt.x,y:pt.y});}}
      let target={x:fx,y:fy};
      if(wetSegment(s,v.x,v.y,target.x,target.y)){v._v68Route=buildRoadRoute(s,v,fx,fy);v._v68RouteI=0;if(v._v68Route?.length)return v._v68Route[0];}
      return localAvoid(s,v,target);
    };

    const oldVehUpdate=J.Vehicles.update;
    J.Vehicles.update=function(s,dt){
      const prev=new Map(s.vehicles.map(v=>[v.id,{x:v.x,y:v.y}]));oldVehUpdate(s,dt);
      for(const v of s.vehicles){if(v.state==='DESTROYED'||v.state==='DEPARTED')continue;if(J.World.isInWater(s,v.x,v.y)){const p=prev.get(v.id);if(p&&!J.World.isInWater(s,p.x,p.y)){v.x=p.x;v.y=p.y;}const bridges=s.map?.bridges||[];if(bridges.length){let b=bridges[0],bd=1e9;for(const q of bridges){const d=Math.abs(q.y-v.y);if(d<bd){bd=d;b=q;}}v.bridgeY=b.y;v.riverStage=0;v.avoidSide=null;}}}
    };

    function enhanceStatic(s){
      if(!s.staticCtx||!s.map||s._v68MapEnhanced===s.scenario?.seed)return;
      s._v68MapEnhanced=s.scenario?.seed;const g=s.staticCtx;g.save();g.imageSmoothingEnabled=false;
      for(const b of s.map.buildings||[]){const sc=J.Scale.terrain(s,b.y);g.save();g.translate(Math.round(b.x),Math.round(b.y));g.rotate(b.rot);g.scale(sc,sc);g.strokeStyle='rgba(10,13,10,.92)';g.lineWidth=4;g.strokeRect(-b.w/2-1,-b.h/2-1,b.w+2,b.h+2);g.fillStyle=s.map.theme==='desert'?'#d2a461':s.map.theme==='polar'?'#a8b6b5':'#8c9868';g.fillRect(-b.w/2+3,-b.h/2+2,b.w-6,3);g.fillStyle='#141812';g.fillRect(-5,b.h*.08,10,b.h*.38);g.fillStyle='#d7c47a';g.fillRect(-b.w*.34,-b.h*.14,6,4);g.fillRect(b.w*.23,-b.h*.14,6,4);g.restore();}
      for(const o of s.map.naturalObstacles||[]){const sc=J.Scale.terrain(s,o.y)*(o.scale||1);g.save();g.translate(Math.round(o.x),Math.round(o.y));g.rotate(o.rot||0);g.scale(sc,sc);if(o.kind==='tree'||o.kind==='treecluster'||o.kind==='pinecluster'){g.strokeStyle='#10160f';g.lineWidth=4;g.beginPath();g.arc(0,0,o.radius*.58,0,Math.PI*2);g.stroke();g.fillStyle='#899765';g.fillRect(-o.radius*.34,-o.radius*.30,Math.max(3,o.radius*.28),3);}else if(o.kind==='log'||o.kind==='drylog'||o.kind==='fallenpine'){g.strokeStyle='#11140f';g.lineWidth=4;g.strokeRect(-o.radius-1,-6,o.radius*2+2,12);g.fillStyle='#c08a4d';g.fillRect(-o.radius+3,-4,Math.max(5,o.radius*.65),3);}else if(o.kind==='boulder'||o.kind==='rock'){g.strokeStyle='#151813';g.lineWidth=4;g.beginPath();g.moveTo(-o.radius,-2);g.lineTo(-o.radius*.4,-o.radius*.55);g.lineTo(o.radius*.45,-o.radius*.43);g.lineTo(o.radius,o.radius*.2);g.lineTo(o.radius*.35,o.radius*.57);g.lineTo(-o.radius*.7,o.radius*.38);g.closePath();g.stroke();g.fillStyle=s.map.theme==='polar'?'#abb8b5':'#9a8e69';g.fillRect(-o.radius*.45,-o.radius*.30,Math.max(4,o.radius*.55),3);}else if(o.kind==='wreckage'){g.strokeStyle='#11140f';g.lineWidth=4;g.strokeRect(-o.radius*.85,-7,o.radius*1.7,14);g.fillStyle='#b47b47';g.fillRect(-o.radius*.55,-5,o.radius*.65,3);}g.restore();}
      for(const h of s.map.hedges||[]){g.save();g.translate(h.x,h.y);g.rotate(h.ang);g.strokeStyle='#10170f';g.lineWidth=h.thick+5;g.beginPath();g.moveTo(-h.len/2,0);g.lineTo(h.len/2,0);g.stroke();g.strokeStyle='#718154';g.lineWidth=Math.max(2,h.thick-1);g.stroke();g.restore();}
      for(const w of s.map.stoneWalls||[]){g.save();g.translate(w.x,w.y);g.rotate(w.ang);g.strokeStyle='#151612';g.lineWidth=9;g.beginPath();g.moveTo(-w.len/2,0);g.lineTo(w.len/2,0);g.stroke();g.strokeStyle=s.map.theme==='polar'?'#a0afad':'#9d8d6d';g.lineWidth=4;g.stroke();g.restore();}
      g.restore();
    }
    const oldRender=J.Render.render;J.Render.render=function(s,ctx){enhanceStatic(s);return oldRender(s,ctx);};
    console.info('JBD v6.8 tactical patch active');
  };
  wait();
})();