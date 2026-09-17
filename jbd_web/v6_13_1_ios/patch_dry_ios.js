/* JBD V6.13.1 iOS SAFE DRY — no river visuals, no bridge routing, keep stable map internals */
(()=>{
  'use strict';
  const J=window.JBD;
  if(!J||!J.World||!J.Scale||!J.Scenarios)return;
  const U=J.U;

  function showError(msg){
    try{
      let el=document.getElementById('iosError');
      if(!el){
        el=document.createElement('div'); el.id='iosError';
        el.style.cssText='position:fixed;left:8px;right:8px;bottom:78px;z-index:9999;background:#5b1717;color:#fff;padding:8px 10px;border-radius:8px;font:11px/1.3 monospace;white-space:pre-wrap;pointer-events:none';
        document.body.appendChild(el);
      }
      el.textContent='JBD ERROR: '+String(msg).slice(0,420);
    }catch(_e){}
  }
  window.addEventListener('error',e=>showError(e.message||'unknown error'));
  window.addEventListener('unhandledrejection',e=>showError((e.reason&&e.reason.message)||e.reason||'promise error'));

  const entityBase=J.Scale.entity.bind(J.Scale);
  J.Scale.entity=function(s,y,kind){
    const v=entityBase(s,y,kind||'infantry');
    if(kind==='infantry'||!kind)return v*0.88;
    if(kind==='vehicle')return v*0.95;
    if(kind==='air')return v*1.02;
    return v;
  };

  function tune(q){
    if(!q||q._iosDryTune)return q;
    q._iosDryTune=true;
    const i=q.index||0;
    q.artilleryCount=i<3?1:2;
    q.artilleryDuration=0.72+i*0.02;
    q.vegetation=Math.min(q.vegetation||0.5,0.32);
    q.trenches=Math.min(q.trenches||2,i<3?1:2);
    return q;
  }
  const get0=J.Scenarios.get.bind(J.Scenarios);
  const apply0=J.Scenarios.apply.bind(J.Scenarios);
  const advance0=J.Scenarios.advance.bind(J.Scenarios);
  J.Scenarios.get=(i=0,c=1)=>tune(get0(i,c));
  J.Scenarios.apply=function(s,i,c){
    if(i==null)i=s.campaign.index;if(c==null)c=s.campaign.cycle;
    const r=apply0(s,i,c);tune(s.scenario);return s.scenario||r;
  };
  J.Scenarios.advance=function(s){const r=advance0(s);tune(s.scenario);return s.scenario||r;};

  function palette(theme){
    if(theme==='desert')return {bg:'#b9a979',bg2:'#a9986b',road:'#8c8061',edge:'#665e49',dash:'#cabd91',wall:'#9c886b',roof:'#746653',veg:'#747c54',rock:'#766d5e'};
    if(theme==='polar')return {bg:'#c9d0cc',bg2:'#b8c1bc',road:'#a0aaa5',edge:'#707a75',dash:'#e0e4df',wall:'#98a19c',roof:'#707974',veg:'#76857e',rock:'#7c8787'};
    return {bg:'#7d8c65',bg2:'#70805a',road:'#8d8264',edge:'#566047',dash:'#c0b28b',wall:'#8c8169',roof:'#625d4e',veg:'#4d6744',rock:'#676655'};
  }

  function road(g,pts,p,w){
    if(!pts||pts.length<2)return;
    g.save();g.lineCap='round';g.lineJoin='round';
    g.strokeStyle=p.edge;g.lineWidth=w+4;g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.stroke();
    g.strokeStyle=p.road;g.lineWidth=w;g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.stroke();
    g.strokeStyle=p.dash;g.globalAlpha=.28;g.lineWidth=1;g.setLineDash([9,11]);g.stroke();g.restore();
  }
  function rectBuilding(g,x,y,w,h,p){
    g.save();g.translate(x,y);
    g.fillStyle='rgba(0,0,0,.14)';g.fillRect(-w/2+3,-h/2+4,w,h);
    g.fillStyle=p.wall;g.strokeStyle='#33372f';g.lineWidth=1.4;g.fillRect(-w/2,-h/2,w,h);g.strokeRect(-w/2,-h/2,w,h);
    g.fillStyle=p.roof;g.fillRect(-w/2+4,-h/2+4,w-8,h-8);
    g.strokeStyle='rgba(236,227,196,.20)';g.lineWidth=1;g.beginPath();g.moveTo(-w/2+7,0);g.lineTo(w/2-7,0);g.stroke();
    g.fillStyle='#2c2f29';g.fillRect(-4,h/2-10,8,10);g.restore();
  }
  function tree(g,x,y,r,p){g.save();g.translate(x,y);g.fillStyle='rgba(0,0,0,.10)';g.beginPath();g.ellipse(2,3,r*1.05,r*.65,0,0,6.283);g.fill();g.fillStyle=p.veg;g.strokeStyle='rgba(31,43,29,.7)';g.lineWidth=1;g.beginPath();g.arc(0,0,r,0,6.283);g.fill();g.stroke();g.restore();}
  function rock(g,x,y,r,p){g.save();g.translate(x,y);g.fillStyle=p.rock;g.strokeStyle='rgba(45,45,40,.45)';g.beginPath();g.moveTo(-r,1);g.lineTo(-r*.4,-r*.7);g.lineTo(r*.6,-r*.5);g.lineTo(r,0);g.lineTo(r*.25,r*.55);g.lineTo(-r*.6,r*.4);g.closePath();g.fill();g.stroke();g.restore();}

  function paintDry(s){
    if(!s||!s.staticCtx||!s.viewport||!s.bunker)return;
    const g=s.staticCtx,w=s.viewport.w,h=s.viewport.h,idx=(s.scenario&&s.scenario.index)||0;
    const p=palette(s.scenario&&s.scenario.theme);
    const seed=((s.scenario&&s.scenario.seed)||1)^0x5A13;
    const r=U.mulberry32(seed);
    const roadX=w*(idx%2?0.56:0.44);
    const jy=h*(0.36+(idx%3)*0.06);
    const right=idx%2===0;
    const bx=w*(right?0.73:0.27),by=h*(0.39+(idx%3)*0.05);

    s._dryVisual={roadX,jy,bx,by};
    if(s.map&&s.map.building){s.map.building.x=bx;s.map.building.y=by;s.map.building.rot=0;}

    g.save();g.clearRect(0,0,w,h);g.fillStyle=p.bg;g.fillRect(0,0,w,h);
    g.fillStyle=p.bg2;g.globalAlpha=.22;g.fillRect(0,0,w,h*.18);g.fillRect(0,h*.78,w,h*.22);g.globalAlpha=1;

    g.fillStyle='rgba(45,55,38,.055)';
    for(let i=0;i<4;i++){const fw=w*(.18+r()*.18),fh=h*(.07+r()*.10),fx=r()*(w-fw),fy=h*(.13+r()*.54);g.fillRect(fx,fy,fw,fh);}

    const main=[{x:roadX,y:-20},{x:roadX+(idx%3-1)*10,y:h*.26},{x:roadX,y:jy},{x:w*.5,y:s.bunker.y-58}];
    const side=[{x:roadX,y:jy},{x:(roadX+bx)*.52,y:(jy+by)*.52},{x:bx,y:by+20}];
    road(g,main,p,15);road(g,side,p,8);

    rectBuilding(g,bx,by,60+(idx%3)*4,40+(idx%2)*4,p);
    const sx=bx+(right?-47:47),sy=by-35;rectBuilding(g,sx,sy,25,18,p);

    const vegN=(s.scenario&&s.scenario.theme)==='jungle'?13:(s.scenario&&s.scenario.theme)==='desert'?5:8;
    for(let i=0;i<vegN;i++){
      let x=18+r()*(w-36),y=70+r()*(h-205);
      if(Math.abs(x-roadX)<34)x=U.clamp(x+(x<roadX?-48:48),18,w-18);
      if(Math.hypot(x-bx,y-by)<62){i--;continue;}
      tree(g,x,y,5+r()*3,p);
    }
    for(let i=0;i<5;i++){let x=22+r()*(w-44),y=78+r()*(h-220);if(Math.abs(x-roadX)<25)x=U.clamp(x+45,20,w-20);rock(g,x,y,3+r()*2,p);}

    const trenchN=idx<3?1:2;
    for(let i=0;i<trenchN;i++){const tx=w*(i?.69:.31),ty=h*(.29+i*.22),len=28+r()*15;g.save();g.translate(tx,ty);g.rotate((r()-.5)*.14);g.lineCap='round';g.strokeStyle='rgba(55,49,39,.60)';g.lineWidth=6;g.beginPath();g.moveTo(-len/2,0);g.lineTo(len/2,0);g.stroke();g.strokeStyle='rgba(150,127,87,.55)';g.lineWidth=2;g.stroke();g.restore();}
    g.restore();
  }

  const resize0=J.World.resize.bind(J.World);
  J.World.resize=function(s,canvas){resize0(s,canvas);paintDry(s);};
  J.World.isInWater=function(){return false;};
  J.World.waterSpeed=function(){return 1;};
  J.World.vehicleWaypoint=function(s,v,x,y){return {x:x,y:y};};

  console.info('JBD V6.13.1 iOS-safe dry patch active');
})();
