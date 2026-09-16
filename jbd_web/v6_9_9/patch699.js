/* JBD v6.9.9 — anti-stall infantry + Close Combat style top-down map pass */
(()=>{
  const wait=()=>{
    const J=window.JBD;
    if(!J||!J.Render||!J.World||!J.Scale||!J.U||!J.Scenarios){setTimeout(wait,35);return;}
    if(J.__v699)return; J.__v699=true;
    const U=J.U;
    const state=()=>window.__JBD_STATE__||null;

    /* ----------------------------------------------------------
       1) ANTI-STALL / PRESSURE
       Soldiers may use cover briefly, but they may never become a
       permanent decoration at the top of the battlefield.
    ---------------------------------------------------------- */
    const track=new Map();
    function releaseUnit(s,e,hard=false){
      if(!e||e.state==='DEAD')return;
      if(e.cover&&e.cover.occupiedBy===e.id)e.cover.occupiedBy=null;
      if(e.inBuilding){
        const b=s?._v693BuildingById?.[e.inBuilding];
        if(b?.occupants)b.occupants=b.occupants.filter(id=>id!==e.id);
      }
      e.inBuilding=0;
      e.cover=null;
      e.coverIntent=false;
      e.reCoverT=(hard?2.8:1.5)+Math.random()*1.3;
      e.state='ADVANCE';
      e.stateT=0;
      e.pose='walk';
      e._v693GarrisonT=0;
      e._v699Still=0;
      const bx=s?.bunker?.x??e.x, by=s?.bunker?.y??(e.y+100);
      const dx=bx-e.x,dy=by-e.y,d=Math.hypot(dx,dy)||1;
      if(hard){e.x+=dx/d*2.8;e.y+=Math.max(2.2,dy/d*3.8);}
      e.vx=(e.vx||0)+dx/d*.7;
      e.vy=Math.max(e.vy||0,.55);
    }

    let lastTick=performance.now(),lull=0;
    setInterval(()=>{
      const s=state();
      const now=performance.now(),dt=Math.min(.65,Math.max(.1,(now-lastTick)/1000));lastTick=now;
      if(!s||s.mode!=='playing'||s.levelComplete||s._v698Failed)return;

      let alive=0,moving=0,upperStalled=0;
      const top=(s.safe?.top||0)+82;
      for(const e of s.enemies||[]){
        if(!e||e.state==='DEAD')continue;alive++;
        const prev=track.get(e.id)||{x:e.x,y:e.y,still:0};
        const moved=Math.hypot(e.x-prev.x,e.y-prev.y);
        let still=moved<.22?(prev.still||0)+dt:0;
        if(moved>=.22)moving++;
        track.set(e.id,{x:e.x,y:e.y,still});
        e._v699Still=still;

        const coverState=e.inBuilding||e.state==='IN_COVER'||e.state==='ENTER_COVER'||e.state==='FIRE_FROM_COVER'||e.state==='DEPLOY_WEAPON'||e.state==='FIRE_FROM_WEAPON';
        const upper=e.y<top+Math.max(125,s.viewport.h*.18);
        if(upper&&still>2.2)upperStalled++;

        /* Buildings and cover are temporary tactical pauses. */
        if(e.inBuilding&&still>3.1){releaseUnit(s,e,true);continue;}
        if(coverState&&still>(e.classKey==='marksman'?5.3:3.8)){releaseUnit(s,e,false);continue;}

        /* Generic escape hatch: catches units stuck on route geometry. */
        if(still>5.0){releaseUnit(s,e,true);continue;}
        if(upper&&still>2.6){
          const bx=s.bunker?.x??s.viewport.w*.5;
          e.x+=Math.sign(bx-e.x)*Math.min(3,Math.abs(bx-e.x)*.07);
          e.y+=3.5;
          releaseUnit(s,e,false);
        }
      }
      for(const id of [...track.keys()])if(!(s.enemies||[]).some(e=>e.id===id&&e.state!=='DEAD'))track.delete(id);

      const activeVeh=(s.vehicles||[]).some(v=>v.state!=='DESTROYED'&&v.state!=='DEPARTED');
      const remaining=(s.spawn?.count??0)<(s.scenario?.infantryCount??0);

      /* If nothing useful happens for a moment, inject the next infantry. */
      const meaningful=(moving>0)||activeVeh||(alive>0&&upperStalled<alive);
      lull=meaningful?0:lull+dt;
      if(remaining&&lull>1.05&&J.Infantry?.spawn){
        try{J.Infantry.spawn(s);s.spawn.count=(s.spawn.count||0)+1;}catch(_){/* base spawner will retry */}
        lull=0;
      }

      /* An entire surviving group stuck high up gets an immediate push. */
      if(alive>=1&&upperStalled===alive){
        for(const e of s.enemies||[])if(e.state!=='DEAD')releaseUnit(s,e,true);
      }
    },360);

    /* ----------------------------------------------------------
       2) CLOSE-COMBAT-LIKE TRUE TOP-DOWN MAP RENDER
       No front facades or cute perspective huts: roofs, compounds,
       tracks and terrain are viewed straight from above.
    ---------------------------------------------------------- */
    const PAL={
      jungle:{ground:'#74885b',ground2:'#61764c',field:'#839768',path:'#a99a71',pathEdge:'#655d45',water:'#397f96',water2:'#76c1d1',roof:'#88704f',roof2:'#a18a64',wall:'#655642',wood:'#5a452f',tree:'#365832',tree2:'#58764b',rock:'#777564',fence:'#67533d',soil:'#8b7658'},
      desert:{ground:'#c4b17d',ground2:'#ad9867',field:'#d0bc87',path:'#d5be88',pathEdge:'#9a865f',water:'#51a5bb',water2:'#8bd4e1',roof:'#9a7955',roof2:'#b29469',wall:'#80684e',wood:'#72563b',tree:'#858a54',tree2:'#a2a66c',rock:'#8e806b',fence:'#826546',soil:'#b09267'},
      polar:{ground:'#cbd4d0',ground2:'#b7c2bd',field:'#dbe1dd',path:'#dce0db',pathEdge:'#9da9a4',water:'#73a7bd',water2:'#afd8e2',roof:'#8c8880',roof2:'#aaa69d',wall:'#716f69',wood:'#6c655b',tree:'#60766f',tree2:'#83968e',rock:'#8d9698',fence:'#7c756b',soil:'#a7ada9'}
    };
    function blob(g,x,y,rx,ry,c,a=1){g.save();g.globalAlpha=a;g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();g.restore();}
    function poly(g,pts,c){g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill();}
    function seeded(seed){return U.mulberry32((seed^0x699ccb)>>>0);}
    function drawRoad(g,pts,p,w=11){if(!pts||pts.length<2)return;g.save();g.lineCap='round';g.lineJoin='round';g.strokeStyle=p.pathEdge;g.lineWidth=w+4;g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.stroke();g.strokeStyle=p.path;g.lineWidth=w;g.stroke();g.strokeStyle='rgba(255,245,210,.15)';g.lineWidth=1;g.stroke();g.restore();}
    function river(g,s,p,h){if(!s.map?.river||!J.World.riverXAt)return;const rw=(s.map.river.width||46)*.52;g.beginPath();for(let y=-20;y<=h+20;y+=14){const x=J.World.riverXAt(s,y)-rw;y===-20?g.moveTo(x,y):g.lineTo(x,y);}for(let y=h+20;y>=-20;y-=14)g.lineTo(J.World.riverXAt(s,y)+rw,y);g.closePath();g.fillStyle=p.water;g.fill();for(let k=-2;k<=2;k++){g.strokeStyle='rgba(190,232,238,.22)';g.lineWidth=1;g.beginPath();for(let y=-10;y<=h+10;y+=22){const x=J.World.riverXAt(s,y)+k*8+Math.sin(y*.026+k)*2;y===-10?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}for(const b of s.map.bridges||[]){const x=J.World.riverXAt(s,b.y),bw=(s.map.river.width||46)+20;g.fillStyle=p.wood;g.fillRect(Math.round(x-bw/2),Math.round(b.y-5),Math.round(bw),10);g.fillStyle='rgba(237,216,169,.28)';for(let xx=x-bw/2+3;xx<x+bw/2;xx+=6)g.fillRect(Math.round(xx),Math.round(b.y-5),1,10);}}
    function topTree(g,x,y,r,p){blob(g,x+2,y+3,r*1.04,r*.82,'rgba(0,0,0,.13)');blob(g,x,y,r,r*.82,p.tree);blob(g,x-r*.22,y-r*.18,r*.60,r*.42,p.tree2,.74);}
    function topRock(g,x,y,r,p){poly(g,[[x-r,y],[x-r*.52,y-r*.56],[x+r*.34,y-r*.50],[x+r,y-r*.05],[x+r*.46,y+r*.52],[x-r*.50,y+r*.42]],p.rock);}
    function fence(g,x,y,w,h,p){g.save();g.strokeStyle=p.fence;g.lineWidth=1;g.strokeRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));for(let xx=x;xx<x+w;xx+=8){g.fillStyle=p.fence;g.fillRect(Math.round(xx),Math.round(y-1),1,3);g.fillRect(Math.round(xx),Math.round(y+h-1),1,3);}for(let yy=y;yy<y+h;yy+=8){g.fillRect(Math.round(x-1),Math.round(yy),3,1);g.fillRect(Math.round(x+w-1),Math.round(yy),3,1);}g.restore();}
    function topHouse(g,b,p,idx=0){
      const w=Math.max(28,(b.w||48)*.82),h=Math.max(20,(b.h||34)*.82),x=b.x,y=b.y,rot=b.rot||0;
      g.save();g.translate(Math.round(x),Math.round(y));g.rotate(rot);
      /* yard/compound */
      fence(g,-w*.76,-h*.86,w*1.52,h*1.72,p);
      g.fillStyle='rgba(0,0,0,.13)';g.fillRect(Math.round(-w/2+3),Math.round(-h/2+4),Math.round(w),Math.round(h));
      /* true top-down roof footprint */
      g.fillStyle=p.wall;g.fillRect(Math.round(-w/2-2),Math.round(-h/2-2),Math.round(w+4),Math.round(h+4));
      g.fillStyle=idx%3===0?p.roof2:p.roof;g.fillRect(Math.round(-w/2),Math.round(-h/2),Math.round(w),Math.round(h));
      /* central roof ridge + tile/plank lines */
      g.fillStyle='rgba(255,235,196,.15)';for(let xx=-w/2+4;xx<w/2-2;xx+=6)g.fillRect(Math.round(xx),Math.round(-h/2+2),1,Math.round(h-4));
      g.fillStyle='rgba(40,34,27,.40)';g.fillRect(Math.round(-1),Math.round(-h/2+2),2,Math.round(h-4));
      /* chimney */
      const cx=idx%2?w*.22:-w*.22;g.fillStyle='#4c453c';g.fillRect(Math.round(cx-3),Math.round(-h*.18),6,6);g.fillStyle='#777064';g.fillRect(Math.round(cx-2),Math.round(-h*.18+1),4,2);
      /* small lean-to / porch seen from above */
      if(idx%2===0){g.fillStyle=p.wood;g.fillRect(Math.round(w/2-2),Math.round(-h*.25),7,Math.round(h*.50));}
      g.restore();
    }
    function allBuildings(s){const a=[];if(Array.isArray(s.map?.buildings))a.push(...s.map.buildings);if(s.map?.building&&!a.includes(s.map.building))a.push(s.map.building);return a;}
    function drawTopDown(s){
      if(!s?.staticCtx||!s?.map||!s?.scenario)return;
      const {w,h}=s.viewport,key=`699-${s.scenario.seed}-${w}-${h}`;if(s._v699MapKey===key)return;s._v699MapKey=key;
      /* stop v6.9.8 from repainting over us during render */
      s._v698MapKey=`698-${s.scenario.seed}-${w}-${h}`;
      const g=s.staticCtx,p=PAL[s.scenario.theme]||PAL.jungle,r=seeded(s.scenario.seed);g.save();g.clearRect(0,0,w,h);g.fillStyle=p.ground;g.fillRect(0,0,w,h);
      /* broad terrain regions / fields */
      blob(g,w*.20,h*.17,w*.25,h*.09,p.ground2,.33);blob(g,w*.78,h*.24,w*.27,h*.11,p.field,.20);blob(g,w*.27,h*.70,w*.24,h*.10,p.ground2,.18);blob(g,w*.80,h*.79,w*.24,h*.09,p.field,.17);
      /* subtle field striping, more map-like and less noisy */
      g.strokeStyle='rgba(44,54,38,.09)';g.lineWidth=1;for(let y=h*.13;y<h*.38;y+=7){g.beginPath();g.moveTo(10,y);g.lineTo(w*.33,y);g.stroke();}
      g.strokeStyle='rgba(255,245,213,.045)';for(let y=0;y<h;y+=11){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
      river(g,s,p,h);
      for(const rd of s.map.roads||[])drawRoad(g,rd,p,s.scenario.theme==='desert'?13:10);
      /* natural cover from real map data */
      const veg=s.map.vegetation||s.map.naturalObstacles||[];const step=Math.max(1,Math.floor(Math.max(1,veg.length)/34));for(let i=0;i<veg.length;i+=step){const o=veg[i];if(!o||!Number.isFinite(o.x)||!Number.isFinite(o.y))continue;const rr=Math.max(4,Math.min(10,5*(o.scale||1)));if(String(o.kind||'').includes('rock'))topRock(g,o.x,o.y,rr,p);else topTree(g,o.x,o.y,rr,p);}
      for(const o of s.map.rocks||[]){if(!Number.isFinite(o.x)||!Number.isFinite(o.y))continue;topRock(g,o.x,o.y,Math.max(3,Math.min(7,o.rx||5)),p);}
      /* trenches are slim, readable tactical lines */
      for(const t of s.map.trenches||[]){g.save();g.translate(t.x,t.y);g.rotate(t.angle||0);g.strokeStyle='rgba(48,40,31,.82)';g.lineWidth=5;g.beginPath();g.moveTo(-(t.len||28)/2,0);g.lineTo((t.len||28)/2,0);g.stroke();g.strokeStyle='rgba(151,116,76,.78)';g.lineWidth=1;g.stroke();g.restore();}
      const bs=allBuildings(s);bs.sort((a,b)=>a.y-b.y).forEach((b,i)=>topHouse(g,b,p,i));
      /* tactical props */
      for(let i=0;i<12;i++){const x=25+r()*(w-50),y=80+r()*(h-190);g.fillStyle=p.wood;g.fillRect(Math.round(x),Math.round(y),5,4);g.fillStyle='rgba(240,220,180,.20)';g.fillRect(Math.round(x+1),Math.round(y+1),3,1);}
      for(let i=0;i<9;i++){const x=30+r()*(w-60),y=100+r()*(h-220);blob(g,x,y,5,2,p.soil,.62);blob(g,x+6,y+1,5,2,p.soil,.62);blob(g,x+3,y+4,5,2,p.soil,.62);}
      g.restore();
    }

    const oldResize=J.World.resize.bind(J.World);
    J.World.resize=function(s,c){oldResize(s,c);s._v699MapKey='';drawTopDown(s);};

    const oldRender=J.Render.render.bind(J.Render);
    J.Render.render=function(s,ctx){
      if(s){s._v698MapKey=`698-${s.scenario?.seed}-${s.viewport?.w}-${s.viewport?.h}`;drawTopDown(s);}
      return oldRender(s,ctx);
    };

    const initial=()=>{const s=state(),c=document.getElementById('game');if(!s||!s.scenario||!c){setTimeout(initial,60);return;}s._v699MapKey='';if(s.mode==='brief'){s.map=null;J.World.resize(s,c);}else drawTopDown(s);const t=document.getElementById('title'),sub=document.getElementById('sub');if(t)t.textContent='AMIGA PIXEL V6.9.9';if(sub)sub.innerHTML='Anti-stall infantry en echte top-down tactical map art.<br><span>Geen vastgelopen poppetjes · Close Combat-achtige daken · constante pressure</span>';};initial();
    console.info('JBD v6.9.9 anti-stall/top-down patch active');
  };
  wait();
})();