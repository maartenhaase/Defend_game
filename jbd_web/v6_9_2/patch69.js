(function(){
  function wait(){
    if(!window.JBD||!JBD.Infantry||!JBD.Render||!JBD.Scale){ setTimeout(wait,60); return; }
    const J=window.JBD, U=J.U, C=J.CONFIG;

    /* Slightly larger infantry sprites so poses/actions read better. */
    const oldEntityScale=J.Scale.entity;
    J.Scale.entity=function(s,y,kind){
      const v=oldEntityScale(s,y,kind);
      return kind==='infantry' ? v*1.12 : v;
    };

    const BUILDING_CAP={house:2,shed:1,barn:3};
    const CLASS_COLORS={rifleman:'#d7d79f',marksman:'#bfe3e2',smg:'#f0c66b',lmg:'#d38f49',engineer:'#9b6d47'};

    function initBuildings(s){
      if(!s?.map?.buildings) return;
      if(s._v69BuildingSeed===s.scenario?.seed) return;
      s._v69BuildingSeed=s.scenario?.seed;
      s._buildingById={};
      for(let i=0;i<s.map.buildings.length;i++){
        const b=s.map.buildings[i];
        b.bid=i+1; b.capacity=BUILDING_CAP[b.kind]||2; b.occupants=[];
        s._buildingById[b.bid]=b;
      }
    }
    function buildingSlots(b){
      const ww=Math.max(18,b.w||24), hh=Math.max(16,b.h||18);
      if(b.kind==='barn') return [{x:-ww*.22,y:hh*.06},{x:0,y:-hh*.02},{x:ww*.22,y:hh*.06}];
      if(b.kind==='shed') return [{x:0,y:hh*.04}];
      return [{x:-ww*.18,y:hh*.08},{x:ww*.18,y:hh*.08},{x:0,y:-hh*.10}];
    }
    function cleanupOccupants(s){
      initBuildings(s);
      const live=new Map((s.enemies||[]).map(e=>[e.id,e]));
      for(const b of s.map?.buildings||[]){
        b.occupants=(b.occupants||[]).filter(id=>{const e=live.get(id); return !!(e&&e.state!=='DEAD'&&e.inBuilding===b.bid);});
      }
    }
    function removeFromBuilding(s,e){
      if(!e?.inBuilding) return;
      const b=s._buildingById?.[e.inBuilding];
      if(b&&b.occupants) b.occupants=b.occupants.filter(id=>id!==e.id);
      e.inBuilding=0; e._windowSlot=0;
    }
    function nearestOpenBuilding(s,e,maxDist=44){
      initBuildings(s);
      let best=null,bd=1e9;
      for(const b of s.map?.buildings||[]){
        if((b.occupants?.length||0)>=b.capacity) continue;
        const d=Math.hypot(e.x-b.x,e.y-b.y);
        if(d<maxDist && d<bd){ best=b; bd=d; }
      }
      return best;
    }
    function placeInBuilding(s,e,b){
      if(!b||e.state==='DEAD') return false;
      if(e.inBuilding===b.bid) return true;
      removeFromBuilding(s,e);
      if((b.occupants?.length||0)>=b.capacity) return false;
      b.occupants.push(e.id);
      e.inBuilding=b.bid;
      e._windowSlot=b.occupants.indexOf(e.id);
      const slots=buildingSlots(b), slot=slots[Math.min(e._windowSlot,slots.length-1)]||{x:0,y:0};
      e.x=b.x+slot.x; e.y=b.y+slot.y;
      e.vx=0; e.vy=0; e.pose='crouch'; e.coverIntent=false; e.pronePreference=false;
      e.cover={id:900000+b.bid,type:'building',x:b.x,y:b.y,radius:20,coverStrength:.94,occupiedBy:e.id};
      e.state='FIRE_FROM_COVER'; e.stateT=0;
      e.fireT=Math.max(e.fireT||0, 1.0+Math.random()*1.4);
      e._action='garrison';
      return true;
    }

    const oldDamage=J.Infantry.damage;
    J.Infantry.damage=function(s,e,amount,kind,x,y){
      if(e?.inBuilding){
        if(kind==='mg') amount*=0.42;
        else if(kind==='ap') amount*=0.66;
        else if(kind==='he') amount*=0.92;
        else amount*=0.55;
      }
      const res=oldDamage(s,e,amount,kind,x,y);
      if(e?.state==='DEAD') removeFromBuilding(s,e);
      return res;
    };

    const oldInfUpdate=J.Infantry.update;
    J.Infantry.update=function(s,dt){
      initBuildings(s);
      oldInfUpdate(s,dt);
      cleanupOccupants(s);

      for(const e of s.enemies||[]){
        if(e.state==='DEAD'){ removeFromBuilding(s,e); continue; }

        const dB=Math.hypot(s.bunker.x-e.x,s.bunker.y-e.y);
        const prog=J.Scale.progress(s,e.y);
        const key=e.classKey||'rifleman';

        if(e.inBuilding) e._action=(e.muzzleT>0.02?'fire':'garrison');
        else if(e.state==='SPRINT_TO_COVER') e._action='moveCover';
        else if(e.state==='ADVANCE') e._action='advance';
        else if(e.state==='DIG_TRENCH') e._action='dig';
        else if(e.state==='DEPLOY_WEAPON'||e.state==='FIRE_FROM_WEAPON'||e.teamRole?.startsWith('mg_')) e._action='mg';
        else if(e.state==='IN_COVER'||e.state==='ENTER_COVER'||e.state==='FIRE_FROM_COVER') e._action=(e.muzzleT>0.02?'fire':'cover');
        else e._action='advance';

        if(!e.inBuilding && key!=='smg' && prog>.26 && prog<.86){
          const wantsCover=e.cover?.type==='building' || e.coverIntent || e.suppression>.22 || e.state==='SPRINT_TO_COVER' || e.state==='ENTER_COVER' || e.state==='FIRE_FROM_COVER' || e.state==='IN_COVER';
          if(wantsCover){
            const near=nearestOpenBuilding(s,e, key==='marksman'?56:44);
            if(near) placeInBuilding(s,e,near);
          }
        }

        if(e.inBuilding){
          const b=s._buildingById?.[e.inBuilding];
          if(!b){ removeFromBuilding(s,e); continue; }
          const slots=buildingSlots(b), idx=Math.max(0,(b.occupants||[]).indexOf(e.id)), slot=slots[Math.min(idx,slots.length-1)]||{x:0,y:0};
          e.x=b.x+slot.x; e.y=b.y+slot.y; e.vx=0; e.vy=0; e.pose='crouch';
          e.cover={id:900000+b.bid,type:'building',x:b.x,y:b.y,radius:20,coverStrength:.94,occupiedBy:e.id};

          if(e.state==='ADVANCE'||e.state==='SPRINT_TO_COVER'||e.state==='IN_COVER'||e.state==='ENTER_COVER'||e.state==='FIRE_FROM_COVER'){
            e.state='FIRE_FROM_COVER';
          }

          const baseRange=s.scenario?.infantryRange||C.infantry.range;
          if(key==='smg' && dB>baseRange*.46) e.fireT=Math.max(e.fireT,2.4+Math.random()*2.4);
          if(key==='engineer') e.fireT=Math.max(e.fireT,3.8+Math.random()*3.2);
          if(key==='lmg' && dB>baseRange*.82) e.fireT=Math.max(e.fireT,2.5+Math.random()*2.0);
          if(key==='marksman') e.fireT=Math.max(e.fireT,1.4+Math.random()*2.2);
          if(key==='rifleman') e.fireT=Math.max(e.fireT,1.8+Math.random()*2.8);

          if(e.muzzleT>0.02){
            if(key==='marksman') e.fireT=Math.max(e.fireT,2.8+Math.random()*2.8);
            else if(key==='rifleman') e.fireT=Math.max(e.fireT,3.2+Math.random()*3.2);
            else if(key==='lmg') e.fireT=Math.max(e.fireT,4.0+Math.random()*2.4);
            else e.fireT=Math.max(e.fireT,4.8+Math.random()*3.0);
          }
        }
      }
    };

    function drawPixelMarker(ctx,x,y,type,color){
      ctx.save(); ctx.translate(Math.round(x),Math.round(y)); ctx.imageSmoothingEnabled=false;
      ctx.strokeStyle='rgba(12,14,11,.95)'; ctx.fillStyle=color||'#ddd';
      if(type==='advance'){ctx.fillRect(-4,-1,8,2); ctx.fillRect(2,-3,2,6);}
      else if(type==='moveCover'){ctx.fillRect(-5,-1,9,2); ctx.fillRect(1,-3,2,6); ctx.fillRect(4,-2,2,4);}
      else if(type==='cover'){ctx.strokeRect(-4,-3,8,6); ctx.fillRect(-3,-2,6,4);}
      else if(type==='fire'){ctx.fillRect(-1,-4,2,8); ctx.fillRect(-4,-1,8,2); ctx.fillStyle='#ffdb71'; ctx.fillRect(-2,-2,4,4);}
      else if(type==='dig'){ctx.fillRect(-1,-4,2,8); ctx.fillRect(1,2,4,2); ctx.fillRect(-4,-2,3,2);}
      else if(type==='mg'){ctx.fillRect(-5,1,10,2); ctx.fillRect(-1,-4,2,5); ctx.fillRect(-4,3,2,3); ctx.fillRect(2,3,2,3);}
      else if(type==='garrison'){ctx.fillRect(-4,-3,8,6); ctx.fillStyle='#ffdf79'; ctx.fillRect(-2,-1,4,2);}
      ctx.restore();
    }

    function drawOccupiedBuildings(ctx,s){
      initBuildings(s);
      for(const b of s.map?.buildings||[]){
        const occ=(b.occupants||[]).map(id=>(s.enemies||[]).find(e=>e.id===id&&e.state!=='DEAD')).filter(Boolean);
        if(!occ.length) continue;
        const sc=J.Scale.terrain(s,b.y);
        const lit=occ.some(e=>e._action==='fire');
        const palette = lit ? ['#fce58c','#f3bd55','#e88f31'] : ['#d7c56a','#b39c54','#6a5a32'];
        ctx.save(); ctx.translate(Math.round(b.x),Math.round(b.y)); ctx.rotate(b.rot); ctx.scale(sc,sc); ctx.imageSmoothingEnabled=false;
        ctx.strokeStyle='rgba(10,13,10,.98)'; ctx.lineWidth=4; ctx.strokeRect(-b.w/2-1,-b.h/2-1,b.w+2,b.h+2);
        ctx.fillStyle=lit?'#303123':'#26291f'; ctx.fillRect(-b.w/2+2,-b.h/2+2,b.w-4,b.h-4);
        ctx.fillStyle=palette[2]; ctx.fillRect(-b.w/2+3,-b.h/2+2,b.w-6,4);
        const slots=buildingSlots(b);
        for(let i=0;i<Math.min(slots.length, Math.max(occ.length,1)); i++){
          const sl=slots[i], px=Math.round(sl.x-3), py=Math.round(sl.y-2);
          ctx.fillStyle=palette[(i+occ.length)%palette.length];
          ctx.fillRect(px,py,6,4);
          ctx.fillStyle='rgba(255,245,160,.25)'; ctx.fillRect(px,py,6,1);
          const oe=occ[i];
          if(oe){ctx.fillStyle='rgba(0,0,0,.70)'; ctx.fillRect(px+2,py+1,2,2);if(oe.muzzleT>0.02){ctx.fillStyle='#ffdb71'; ctx.fillRect(px+6,py+1,3,2);}}
        }
        ctx.fillStyle='#141812'; ctx.fillRect(-5,Math.round(b.h*.08),10,Math.max(6,Math.round(b.h*.32)));
        ctx.restore();
      }
    }

    function drawActionReadability(ctx,s){
      for(const e of s.enemies||[]){
        if(e.state==='DEAD') continue;
        const key=e.classKey||'rifleman';
        const color=CLASS_COLORS[key]||'#ddd';
        if(e.inBuilding){
          const b=s._buildingById?.[e.inBuilding];
          if(!b) continue;
          const y=e.y-12*J.Scale.terrain(s,b.y);
          drawPixelMarker(ctx,e.x,y,'garrison',color);
          continue;
        }
        const y=e.y-16*J.Scale.entity(s,e.y,'infantry');
        drawPixelMarker(ctx,e.x,y,e._action||'advance',color);
      }
    }

    const oldRender=J.Render.render;
    J.Render.render=function(s,ctx){
      initBuildings(s);
      const all=s.enemies;
      let hidden=null;
      if(all?.some(e=>e.inBuilding&&e.state!=='DEAD')){
        hidden=all.filter(e=>e.inBuilding&&e.state!=='DEAD');
        s.enemies=all.filter(e=>!e.inBuilding||e.state==='DEAD');
      }
      oldRender(s,ctx);
      if(hidden) s.enemies=all;
      drawOccupiedBuildings(ctx,s);
      drawActionReadability(ctx,s);
    };

    console.info('JBD v6.9 building-actions patch active');
  }
  wait();
})();