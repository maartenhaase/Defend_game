/* JBD V6.13 DRY — no rivers, cleaner maps, slightly smaller sprites */
(()=>{
  const J=window.JBD;
  if(!J||!J.World||!J.Scale||!J.Scenarios)return;
  const U=J.U;

  /* -----------------------------------------------------------
     1) SCALE — back down one notch, but keep air readable
  ----------------------------------------------------------- */
  const baseEntity=J.Scale.entity.bind(J.Scale);
  J.Scale.entity=function(s,y,kind='infantry'){
    const v=baseEntity(s,y,kind);
    if(kind==='infantry')return v*.86;
    if(kind==='vehicle')return v*.95;
    if(kind==='air')return v*1.06;
    return v;
  };

  /* -----------------------------------------------------------
     2) SCENARIO CLEANUP — less clutter / fewer opening craters
  ----------------------------------------------------------- */
  function dryTune(q){
    if(!q||q._dry13)return q;
    q._dry13=true;
    const i=q.index||0;
    q.artilleryCount=i<3?1:i<6?2:2;
    q.artilleryDuration=.72+i*.025;
    q.vegetation=Math.min(q.vegetation||.5,.38);
    q.trenches=Math.min(q.trenches||2,i<3?1:2);
    q.bridgeRatios=[];
    return q;
  }
  const oldGet=J.Scenarios.get.bind(J.Scenarios);
  const oldApply=J.Scenarios.apply.bind(J.Scenarios);
  const oldAdvance=J.Scenarios.advance.bind(J.Scenarios);
  J.Scenarios.get=(i=0,c=1)=>dryTune(oldGet(i,c));
  J.Scenarios.apply=function(s,i=s.campaign.index,c=s.campaign.cycle){const out=oldApply(s,i,c);dryTune(s.scenario);return s.scenario||out;};
  J.Scenarios.advance=function(s){const out=oldAdvance(s);dryTune(s.scenario);return s.scenario||out;};

  /* -----------------------------------------------------------
     3) DRY MAP RENDERER — absolutely no rivers or bridges
  ----------------------------------------------------------- */
  const oldResize=J.World.resize.bind(J.World);

  function pal(theme){
    if(theme==='desert')return {bg:'#bba874',bg2:'#a99769',road:'#8f815f',roadHi:'#c7b98c',edge:'#665f4b',roof:'#877159',wall:'#a58a67',veg:'#6f7650',rock:'#776e5d',field:'rgba(105,91,59,.13)'};
    if(theme==='polar')return {bg:'#c9d0cb',bg2:'#b7c0ba',road:'#a2aaa5',roadHi:'#d9ddd8',edge:'#737b77',roof:'#737b76',wall:'#9da6a0',veg:'#6d7c76',rock:'#7e8988',field:'rgba(95,110,108,.10)'};
    return {bg:'#7b895f',bg2:'#6f7d55',road:'#8b8060',roadHi:'#b7aa82',edge:'#566047',roof:'#6c654f',wall:'#8a8065',veg:'#48603e',rock:'#666553',field:'rgba(67,82,54,.13)'};
  }

  function lineRoad(g,pts,p,width=15){
    if(!pts||pts.length<2)return;
    g.save();g.lineCap='round';g.lineJoin='round';
    g.strokeStyle=p.edge;g.lineWidth=width+5;g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.stroke();
    g.strokeStyle=p.road;g.lineWidth=width;g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.stroke();
    g.strokeStyle=p.roadHi;g.globalAlpha=.34;g.lineWidth=1.2;g.setLineDash([10,10]);g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.stroke();g.restore();
  }

  function building(g,b,p){
    const w=b.w,h=b.h,x=b.x,y=b.y;
    g.save();g.translate(x,y);
    g.fillStyle='rgba(0,0,0,.16)';g.fillRect(-w/2+4,-h/2+5,w,h);
    g.fillStyle=p.wall;g.strokeStyle='#34382f';g.lineWidth=1.5;g.fillRect(-w/2,-h/2,w,h);g.strokeRect(-w/2,-h/2,w,h);
    g.fillStyle=p.roof;g.fillRect(-w/2+4,-h/2+4,w-8,h-8);
    g.strokeStyle='rgba(240,230,196,.22)';g.lineWidth=1;g.beginPath();g.moveTo(0,-h/2+5);g.lineTo(0,h/2-5);g.stroke();
    g.fillStyle='#2b2d27';g.fillRect(-4,h/2-10,8,10);
    g.fillStyle='rgba(232,215,159,.7)';g.fillRect(-w*.28,-3,7,6);g.fillRect(w*.16,-3,7,6);
    g.restore();
  }

  function tree(g,x,y,r,p){
    g.save();g.translate(x,y);g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.ellipse(2,4,r*1.05,r*.65,0,0,6.28);g.fill();
    g.fillStyle=p.veg;g.strokeStyle='rgba(35,46,31,.75)';g.lineWidth=1;g.beginPath();g.arc(0,0,r,0,6.28);g.fill();g.stroke();
    g.fillStyle='rgba(185,198,150,.12)';g.beginPath();g.arc(-r*.25,-r*.25,r*.42,0,6.28);g.fill();g.restore();
  }

  function rock(g,x,y,r,p){g.save();g.translate(x,y);g.fillStyle=p.rock;g.strokeStyle='rgba(45,45,40,.5)';g.beginPath();g.moveTo(-r,1);g.lineTo(-r*.45,-r*.7);g.lineTo(r*.55,-r*.55);g.lineTo(r,0);g.lineTo(r*.35,r*.55);g.lineTo(-r*.55,r*.45);g.closePath();g.fill();g.stroke();g.restore();}

  function rebuildCover(s){
    s.cover=(s.cover||[]).filter(c=>!c.staticMap);
    let id=1;const add=(x,y,radius,strength,type)=>s.cover.push({id:910000+id++,x,y,radius,coverStrength:strength,occupiedBy:null,danger:0,age:0,staticMap:true,type});
    const b=s.map?.building;if(b){add(b.x-b.w*.28,b.y+b.h*.30,15,.86,'building');add(b.x+b.w*.28,b.y+b.h*.30,15,.86,'building');}
    for(const t of s.map?.trenches||[])add(t.x,t.y,Math.min(20,t.len*.4),.78,'trench');
    for(let i=0;i<(s.map?.vegetation||[]).length;i+=4){const o=s.map.vegetation[i];add(o.x,o.y,9+o.scale*3,.42,'terrain');}
  }

  function makeDryLayout(s){
    const {w,h}=s.viewport,idx=s.scenario?.index||0,r=U.mulberry32((s.scenario?.seed||1)^0xD13F),p=pal(s.scenario?.theme);
    const roadX=w*(idx%2?.56:.44),junctionY=h*(.38+(idx%3)*.07),buildingRight=(idx%2===0),bx=w*(buildingRight?.74:.26),by=h*(.40+(idx%3)*.055);
    s.map=s.map||{};
    s.map.river={baseX:-9999,width:0,amp:0,phase:0,freq:0};
    s.map.bridges=[];
    s.map.building={x:bx,y:by,w:62+(idx%3)*4,h:42+(idx%2)*4,rot:0};
    s.map.roads=[
      [{x:roadX,y:-20},{x:roadX+(idx%3-1)*12,y:h*.29},{x:roadX,y:junctionY},{x:w*.5,y:s.bunker.y-58}],
      [{x:roadX,y:junctionY},{x:(roadX+bx)*.54,y:(junctionY+by)*.52},{x:bx,y:by+18}]
    ];
    s.map.trenches=[];
    for(let i=0;i<(idx<3?1:2);i++)s.map.trenches.push({x:w*(i? .70:.30),y:h*(.30+i*.21),len:28+r()*18,angle:(r()-.5)*.16});
    s.map.vegetation=[];
    const vegN=s.scenario?.theme==='jungle'?16:s.scenario?.theme==='desert'?7:10;
    for(let i=0;i<vegN;i++){
      let x=18+r()*(w-36),y=60+r()*(h-190);
      if(Math.abs(x-roadX)<38)x=U.clamp(x+(x<roadX?-55:55),18,w-18);
      if(Math.hypot(x-bx,y-by)<65){i--;continue;}
      s.map.vegetation.push({x,y,scale:.55+r()*.35,kind:s.scenario?.theme==='desert'?'scrub':s.scenario?.theme==='polar'?'pine':'shrub'});
    }
    s.map.rocks=[];for(let i=0;i<7;i++){let x=22+r()*(w-44),y=70+r()*(h-210);if(Math.abs(x-roadX)<28)x=U.clamp(x+50,20,w-20);s.map.rocks.push({x,y,rx:3+r()*3,ry:2+r()*2,rot:r()*3});}

    const g=s.staticCtx;g.save();g.clearRect(0,0,w,h);
    g.fillStyle=p.bg;g.fillRect(0,0,w,h);
    g.fillStyle=p.bg2;g.globalAlpha=.26;g.fillRect(0,0,w,h*.19);g.fillRect(0,h*.76,w,h*.24);g.globalAlpha=1;
    /* very light terrain blocks, no circular blobs */
    g.fillStyle=p.field;for(let i=0;i<4;i++){const fw=w*(.18+r()*.16),fh=h*(.08+r()*.10),fx=r()*(w-fw),fy=h*(.12+r()*.55);g.fillRect(fx,fy,fw,fh);}
    lineRoad(g,s.map.roads[0],p,16);lineRoad(g,s.map.roads[1],p,9);
    building(g,s.map.building,p);
    /* small shed as a simple top-down rectangle */
    g.fillStyle=p.wall;g.strokeStyle='#34382f';g.lineWidth=1.2;const sx=bx+(buildingRight?-48:48),sy=by-38;g.fillRect(sx-13,sy-9,26,18);g.strokeRect(sx-13,sy-9,26,18);
    for(const o of s.map.vegetation)tree(g,o.x,o.y,4+o.scale*4,p);
    for(const o of s.map.rocks)rock(g,o.x,o.y,3.5+o.rx*.55,p);
    for(const t of s.map.trenches){g.save();g.translate(t.x,t.y);g.rotate(t.angle);g.lineCap='round';g.strokeStyle='rgba(57,51,39,.65)';g.lineWidth=7;g.beginPath();g.moveTo(-t.len/2,0);g.lineTo(t.len/2,0);g.stroke();g.strokeStyle='rgba(145,124,83,.65)';g.lineWidth=2;g.stroke();g.restore();}
    g.restore();
    rebuildCover(s);
  }

  J.World.resize=function(s,canvas){oldResize(s,canvas);makeDryLayout(s);};
  J.World.isInWater=()=>false;
  J.World.waterSpeed=()=>1;
  J.World.riverXAt=()=>-9999;
  J.World.vehicleWaypoint=function(s,v,fallbackX,fallbackY){return {x:fallbackX,y:fallbackY};};

  /* If anything calls resize after the map is already running, keep it dry. */
  const oldRandomGround=J.World.randomGroundPoint.bind(J.World);
  J.World.randomGroundPoint=function(s,r=s.rng,minY=58,maxY=null){
    for(let i=0;i<20;i++){
      const pt=oldRandomGround(s,r,minY,maxY);
      if(!s.map?.building||Math.hypot(pt.x-s.map.building.x,pt.y-s.map.building.y)>42)return pt;
    }
    return {x:s.viewport.w*.5,y:(minY+(maxY??s.bunker.y-95))*.5};
  };

  console.info('JBD V6.13 DRY active — smaller sprites, zero rivers, cleaner maps');
})();