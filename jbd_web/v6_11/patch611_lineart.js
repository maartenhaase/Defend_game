/* JBD v6.11 — flat line-art renderer + stick soldiers */
(()=>{
  const wait=()=>{
    const J=window.JBD;
    if(!J||!J.Render||!J.World||!J.Scale||!J.U){setTimeout(wait,35);return;}
    if(J.__v611Line)return;J.__v611Line=true;
    const U=J.U;

    const oldEntity=J.Scale.entity.bind(J.Scale);
    J.Scale.entity=function(s,y,kind='infantry'){return oldEntity(s,y,kind)*1.08;};

    const PAL={
      jungle:{bg:'#778765',grid:'#68785a',road:'#b7aa82',roadEdge:'#574f3e',tree:'#3f5d3c',rock:'#666b60',roof:'#756b57',wall:'#4f4a3f',water:'#5f95a5',accent:'#d8d1b1'},
      desert:{bg:'#c7b68a',grid:'#b8a77d',road:'#ddcca1',roadEdge:'#8b7959',tree:'#888a5a',rock:'#8a8172',roof:'#8d755d',wall:'#655747',water:'#70aebd',accent:'#efe0b8'},
      polar:{bg:'#c9d1cf',grid:'#b9c3c0',road:'#e2e4df',roadEdge:'#8e9894',tree:'#667c74',rock:'#7c8586',roof:'#7a7771',wall:'#5e5c58',water:'#78aebe',accent:'#f0f0df'}
    };
    const LAYOUTS=[
      {road:.52,branches:[[-.18,.34,.42],[.16,.56,.48]],b:[[.73,.26,.16,.10],[.72,.44,.20,.12]],trees:18},
      {road:.47,branches:[[-.22,.42,.36],[.20,.31,.56]],b:[[.25,.34,.19,.12],[.73,.48,.18,.11]],trees:22},
      {road:.55,branches:[[-.18,.52,.44]],b:[[.24,.25,.18,.11],[.76,.37,.17,.10],[.68,.56,.20,.12]],trees:20},
      {road:.50,branches:[[-.24,.38,.48],[.22,.58,.42]],b:[[.25,.48,.18,.11],[.73,.30,.18,.11]],trees:7},
      {road:.46,branches:[[.22,.39,.50]],b:[[.72,.36,.24,.16]],trees:5},
      {road:.58,branches:[[-.24,.46,.42],[.18,.31,.52]],b:[[.26,.31,.18,.10],[.73,.49,.20,.13]],trees:6},
      {road:.49,branches:[[-.20,.36,.43]],b:[[.27,.36,.20,.12],[.73,.51,.17,.10]],trees:12},
      {road:.54,branches:[[.20,.40,.52],[-.18,.57,.42]],b:[[.74,.32,.21,.13],[.25,.51,.18,.11]],trees:10},
      {road:.50,branches:[[-.22,.32,.46],[.23,.47,.50]],b:[[.24,.28,.18,.10],[.75,.29,.19,.11],[.72,.52,.22,.14]],trees:8}
    ];
    function pctx(s){return PAL[s?.scenario?.theme]||PAL.jungle;}
    function ln(g,x1,y1,x2,y2,c,w=1){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
    function road(g,pts,p,w=13){g.lineCap='round';g.lineJoin='round';g.strokeStyle=p.roadEdge;g.lineWidth=w+4;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();g.strokeStyle=p.road;g.lineWidth=w;g.stroke();g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1;g.setLineDash([8,8]);g.stroke();g.setLineDash([]);}
    function tree(g,x,y,p,r=5){g.strokeStyle='#293329';g.lineWidth=1.2;g.fillStyle=p.tree;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.stroke();ln(g,x,y+r,x,y+r+4,'#453b2e',1);}
    function rock(g,x,y,p,r=4){g.strokeStyle='#303530';g.fillStyle=p.rock;g.beginPath();g.moveTo(x-r,y+1);g.lineTo(x-r*.4,y-r);g.lineTo(x+r*.8,y-r*.5);g.lineTo(x+r,y+r*.5);g.lineTo(x-r*.5,y+r);g.closePath();g.fill();g.stroke();}
    function building(g,x,y,w,h,p,variant=0){g.save();g.translate(x,y);g.fillStyle='rgba(0,0,0,.10)';g.fillRect(-w/2+3,-h/2+3,w,h);g.strokeStyle='#30322f';g.lineWidth=1.4;g.fillStyle=variant%2?p.roof:p.wall;g.fillRect(-w/2,-h/2,w,h);g.strokeRect(-w/2,-h/2,w,h);ln(g,-w/2+4,0,w/2-4,0,'rgba(255,255,255,.18)',1);ln(g,0,-h/2+3,0,h/2-3,'rgba(30,30,25,.38)',1);g.fillStyle=p.accent;g.fillRect(-w*.28,-h*.15,5,4);g.fillRect(w*.17,-h*.15,5,4);g.fillStyle='#45423b';g.fillRect(w*.25,-h*.32,5,5);g.restore();}
    function drawMap(s){
      if(!s?.staticCtx||!s?.staticCanvas||!s?.scenario)return;
      const {w,h}=s.viewport,key=`611-${s.scenario.seed}-${w}-${h}`;if(s._v611MapKey===key)return;s._v611MapKey=key;
      const g=s.staticCtx,p=pctx(s),r=U.mulberry32((s.scenario.seed^0x611611)>>>0),lay=LAYOUTS[(s.scenario.index||0)%9];
      g.save();g.clearRect(0,0,w,h);g.fillStyle=p.bg;g.fillRect(0,0,w,h);
      g.strokeStyle=p.grid;g.globalAlpha=.22;g.lineWidth=1;for(let y=20;y<h;y+=24)ln(g,0,y,w,y,p.grid,1);for(let x=18;x<w;x+=32)ln(g,x,0,x,h,p.grid,1);g.globalAlpha=1;
      const bx=s.bunker?.x||w*.5,by=s.bunker?.y||h*.86,mx=w*lay.road;
      road(g,[[mx,-20],[mx,h*.22],[bx,h*.58],[bx,by-28]],p,12);
      for(const br of lay.branches){const sx=mx,sy=h*br[2],ex=U.clamp(sx+w*br[0],30,w-30),ey=h*br[1];road(g,[[sx,sy],[ex,ey]],p,7);}
      for(let i=0;i<lay.b.length;i++){const b=lay.b[i],x=w*b[0],y=h*b[1],bw=w*b[2],bh=h*b[3];building(g,x,y,bw,bh,p,i);g.strokeStyle='rgba(45,45,38,.55)';g.strokeRect(x-bw*.63,y-bh*.68,bw*1.26,bh*1.36);}
      for(let i=0;i<lay.trees;i++){const x=18+r()*(w-36),y=90+r()*(h-220);if(Math.abs(x-mx)<34)continue;tree(g,x,y,p,3.5+r()*3);}
      for(let i=0;i<10;i++){const x=18+r()*(w-36),y=90+r()*(h-220);rock(g,x,y,p,2.5+r()*2.5);}
      for(let i=0;i<7;i++){const y=h*(.23+i*.08),x=(i%2?w*.12:w*.70);ln(g,x,y,x+w*.13,y+(i%2?4:-4),'rgba(57,52,42,.65)',3);ln(g,x,y,x+w*.13,y+(i%2?4:-4),'rgba(195,174,125,.45)',1);}
      g.restore();
    }

    const oldResize=J.World.resize.bind(J.World);
    J.World.resize=function(s,c){oldResize(s,c);s._v611MapKey='';drawMap(s);};

    function stick(ctx,s,e){
      if(!e||e.state==='DEAD'||e.inBuilding)return;const sc=J.Scale.entity(s,e.y,'infantry'),t=s.simTime||0,walk=/ADVANCE|SPRINT/.test(e.state||''),ph=walk&&((Math.floor(t*10+(e.id||0))&1)?1:-1);ctx.save();ctx.translate(e.x,e.y);ctx.strokeStyle='#161916';ctx.fillStyle='#d9d2b2';ctx.lineWidth=Math.max(1.2,1.7*sc);ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-8*sc,2.2*sc,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-5.5*sc);ctx.lineTo(0,2*sc);ctx.moveTo(0,-3*sc);ctx.lineTo(5*sc,-1*sc);ctx.moveTo(0,-3*sc);ctx.lineTo(-4*sc,-1*sc);ctx.moveTo(0,2*sc);ctx.lineTo((-3+ph)*sc,7*sc);ctx.moveTo(0,2*sc);ctx.lineTo((3-ph)*sc,7*sc);ctx.stroke();ctx.strokeStyle='#33392f';ctx.lineWidth=Math.max(1,1.4*sc);ctx.beginPath();ctx.moveTo(3.5*sc,-1.5*sc);ctx.lineTo(8*sc,1*sc);ctx.stroke();if((e.muzzleT||0)>.02){ctx.fillStyle='#ffd86a';ctx.fillRect(8*sc,-.5*sc,3*sc,2*sc);}ctx.restore();
    }
    function vehicle(ctx,v){if(!v||v.state==='DESTROYED'||v.state==='DEPARTED')return;const type=v.type||v.kind||'truck',w=type==='truck'?15:type==='technical'?14:type==='tank'?18:16,h=type==='truck'?25:type==='tank'?24:22;ctx.save();ctx.translate(v.x,v.y);ctx.rotate(v.angle||0);ctx.fillStyle='#66705a';ctx.strokeStyle='#171a17';ctx.lineWidth=1.4;ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeRect(-w/2,-h/2,w,h);ctx.fillStyle='#889279';ctx.fillRect(-w*.32,-h*.35,w*.64,h*.25);ctx.fillStyle='#20241f';ctx.fillRect(-w*.65,-h*.35,3,h*.7);ctx.fillRect(w*.65-3,-h*.35,3,h*.7);if(type==='tank'||type==='stug'||type==='halftrack'){ctx.beginPath();ctx.arc(0,-1,4,0,Math.PI*2);ctx.fillStyle='#4e5847';ctx.fill();ctx.stroke();ln(ctx,0,-1,0,-h*.65,'#20241f',1.5);}ctx.restore();}
    function heli(ctx,v){const p=U.clamp(v.t/v.dur,0,1),w=window.__JBD_STATE__?.viewport?.w||390;let x=v.x0+(v.x1-v.x0)*Math.min(1,p/.32);if(p>.68)x=v.x1+(w+70-v.x1)*((p-.68)/.32);const y=v.y;ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(4,7,18,7,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#161a17';ctx.fillStyle='#69745f';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,0,12,7,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillRect(9,-2,18,4);ctx.strokeRect(9,-2,18,4);ctx.beginPath();ctx.moveTo(-26,0);ctx.lineTo(26,0);ctx.moveTo(0,-22);ctx.lineTo(0,22);ctx.stroke();ctx.beginPath();ctx.moveTo(24,-7);ctx.lineTo(24,7);ctx.moveTo(19,0);ctx.lineTo(29,0);ctx.stroke();ctx.restore();}
    function plane(ctx,v){const p=U.clamp(v.t/v.dur,0,1),x=v.x0+(v.x1-v.x0)*p,y=v.y;ctx.save();ctx.translate(x,y);ctx.strokeStyle='#161a17';ctx.fillStyle='#747e6e';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-6,-4);ctx.lineTo(-3,-16);ctx.lineTo(3,-16);ctx.lineTo(6,-4);ctx.lineTo(22,0);ctx.lineTo(6,4);ctx.lineTo(3,15);ctx.lineTo(-3,15);ctx.lineTo(-6,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
    function drop(ctx,d){const p=U.clamp(d.t/d.dur,0,1),y=d.y0+(d.y-d.y0)*p;ctx.save();ctx.translate(d.x,y);ctx.strokeStyle='#20231f';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-9,8,Math.PI,0);ctx.stroke();ctx.moveTo(-8,-9);ctx.lineTo(-2,0);ctx.moveTo(8,-9);ctx.lineTo(2,0);ctx.stroke();ctx.fillStyle='#d6d0ae';ctx.fillRect(-1.5,0,3,6);ctx.restore();}

    if(J.Particles?.emit){const oldEmit=J.Particles.emit.bind(J.Particles);J.Particles.emit=function(s,k,...rest){const n=String(k||'').toLowerCase();if(n.includes('smoke')||n.includes('dust')||n.includes('dirt'))return;return oldEmit(s,k,...rest);};}

    const oldRender=J.Render.render.bind(J.Render);
    J.Render.render=function(s,ctx){
      drawMap(s);
      const enemies=s.enemies,vehicles=s.vehicles,buildings=s._v693BuildingById,air=s._v611Action;
      const alive=(enemies||[]).filter(e=>e&&e.state!=='DEAD'),dead=(enemies||[]).filter(e=>!e||e.state==='DEAD');
      s.enemies=dead;s.vehicles=[];if(buildings)s._v693BuildingById={};
      let savedVis=null,savedDrops=null;if(air){savedVis=air.visuals; savedDrops=air.drops; air.visuals=[];air.drops=[];}
      const out=oldRender(s,ctx);
      s.enemies=enemies;s.vehicles=vehicles;if(buildings)s._v693BuildingById=buildings;if(air){air.visuals=savedVis;air.drops=savedDrops;}
      for(const v of vehicles||[])vehicle(ctx,v);for(const e of alive)stick(ctx,s,e);
      if(air){for(const v of air.visuals||[])(v.type==='heli'?heli:plane)(ctx,v);for(const d of air.drops||[])drop(ctx,d);}
      return out;
    };
    console.info('JBD v6.11 line-art renderer active');
  };wait();
})();