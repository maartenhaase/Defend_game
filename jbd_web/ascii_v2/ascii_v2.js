/* JBD — ASCII V2 · Jungle Prototype
   Complete replacement renderer. Gameplay/simulation stays untouched. */
(()=>{
  'use strict';
  const J=window.JBD;
  if(!J||!J.Render||!J.World)return;
  const U=J.U;
  const CW=8, CH=10, TAU=Math.PI*2;
  const C={
    bg:'#151a12', ground:'#71805e', ground2:'#59684d', road:'#c1b384', road2:'#91845f',
    wall:'#c4b78d', roof:'#8d8062', tree:'#8ca56f', rock:'#8d8977', trench:'#544b38', crater:'#42382a',
    bunker:'#efd37a', infantry:'#eee7c7', infantry2:'#c8d1a1', vehicle:'#d2c79a', air:'#cce0df',
    bullet:'#ffe087', ap:'#a8ddf5', he:'#f1a353', white:'#eee8ce', dim:'#6e7864', green:'#5fd17c',
    lime:'#9bc85e', yellow:'#d9c858', orange:'#e29643', red:'#dd514c', black:'#080a07'
  };

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function rowsFor(s){return Math.max(30,Math.floor(s.viewport.h/CH));}
  function colsFor(s){return Math.max(34,Math.floor(s.viewport.w/CW));}
  function gx(x){return Math.round(x/CW);}
  function gy(y){return Math.round(y/CH);}
  function idx(g,x,y){return y*g.cols+x;}
  function makeGrid(s){
    const cols=colsFor(s),rows=rowsFor(s),n=cols*rows;
    return {cols,rows,ch:new Array(n).fill(' '),co:new Array(n).fill(C.white)};
  }
  function put(g,x,y,ch,col){
    x=Math.round(x);y=Math.round(y);
    if(x<0||y<0||x>=g.cols||y>=g.rows)return;
    const i=idx(g,x,y);g.ch[i]=ch;g.co[i]=col||C.white;
  }
  function text(g,x,y,str,col){for(let i=0;i<str.length;i++)put(g,x+i,y,str[i],col);}
  function stamp(g,cx,cy,lines,col){
    if(!lines)return;
    const w=Math.max.apply(null,lines.map(r=>r.length));
    const x0=Math.round(cx-w/2),y0=Math.round(cy-lines.length/2);
    for(let y=0;y<lines.length;y++)for(let x=0;x<lines[y].length;x++)if(lines[y][x]!==' ')put(g,x0+x,y0+y,lines[y][x],col);
  }
  function line(g,x0,y0,x1,y1,ch,col){
    x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;
    for(;;){put(g,x0,y0,ch,col);if(x0===x1&&y0===y1)break;const e2=e*2;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}
  }
  function box(g,x,y,w,h,col,fill){
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
      const edge=yy===0||yy===h-1||xx===0||xx===w-1;
      if(edge)put(g,x+xx,y+yy,(yy===0||yy===h-1)?'-':'|',col);
      else if(fill)put(g,x+xx,y+yy,fill,col);
    }
    put(g,x,y,'+',col);put(g,x+w-1,y,'+',col);put(g,x,y+h-1,'+',col);put(g,x+w-1,y+h-1,'+',col);
  }
  function hashRand(seed){return U&&U.mulberry32?U.mulberry32(seed>>>0):(()=>{let x=seed>>>0;return()=>((x=(x*1664525+1013904223)>>>0)/4294967296);})();}

  function eff(s){return typeof s._hyEff==='number'?clamp(s._hyEff,0,1):0.75;}
  function effCol(v){return v>=.86?C.green:v>=.70?C.lime:v>=.50?C.yellow:v>=.25?C.orange:C.red;}
  function killCount(s){const q=s.stats||{};return (q.kills||0)+(q.vehicleKills||0)+(q.airKills||0);}

  function drawGround(g,s){
    const seed=((s.scenario&&s.scenario.seed)||1)^0xA5C11;const r=hashRand(seed);
    const top=Math.max(7,Math.floor(((s.safe&&s.safe.top)||0)/CH)+5);
    const bottom=Math.max(top+10,g.rows-Math.max(5,Math.ceil(((s.safe&&s.safe.bottom)||0)/CH)+5));
    for(let y=top;y<bottom;y++)for(let x=0;x<g.cols;x++){
      const n=r(); if(n<.025)put(g,x,y,'.',C.ground2);else if(n<.035)put(g,x,y,',',C.ground2);else if(n<.041)put(g,x,y,"'",C.ground2);
    }
  }
  function layout(s,g){
    const i=(s.scenario&&s.scenario.index)||0;
    if(s._dryVisual)return {roadX:gx(s._dryVisual.roadX),jy:gy(s._dryVisual.jy),bx:gx(s._dryVisual.bx),by:gy(s._dryVisual.by)};
    return {roadX:Math.round(g.cols*(i%2?.56:.44)),jy:Math.round(g.rows*(.36+(i%3)*.06)),bx:Math.round(g.cols*(i%2?.28:.72)),by:Math.round(g.rows*(.38+(i%3)*.05))};
  }
  function roadStroke(g,a,b,width){
    for(let o=-width;o<=width;o++)line(g,a.x+o,a.y,b.x+o,b.y,'=',C.road);
    line(g,a.x,a.y,b.x,b.y,'.',C.road2);
  }
  function drawMap(g,s){
    const L=layout(s,g),bi=(s.bunker?gy(s.bunker.y):g.rows-10),bx=(s.bunker?gx(s.bunker.x):Math.round(g.cols/2));
    roadStroke(g,{x:L.roadX,y:Math.max(8,gy((s.safe&&s.safe.top)||0)+4)},{x:L.roadX,y:L.jy},1);
    roadStroke(g,{x:L.roadX,y:L.jy},{x:bx,y:bi-6},1);
    line(g,L.roadX,L.jy,L.bx,L.by+2,':',C.road2);

    const bw=10,bh=6;box(g,L.bx-Math.floor(bw/2),L.by-Math.floor(bh/2),bw,bh,C.wall,'.');
    text(g,L.bx-2,L.by,'HQ',C.roof);
    box(g,L.bx+(L.bx<g.cols/2?7:-11),L.by-6,5,4,C.wall,'.');

    const r=hashRand((((s.scenario&&s.scenario.seed)||2)^0x77B));
    const nTree=16;
    for(let i=0;i<nTree;i++){
      let x=2+Math.floor(r()*(g.cols-4)),y=9+Math.floor(r()*Math.max(8,g.rows-24));
      if(Math.abs(x-L.roadX)<4||Math.hypot(x-L.bx,y-L.by)<7){i--;continue;}
      put(g,x,y,i%4===0?'Y':'y',C.tree);
      if(i%5===0&&x+1<g.cols)put(g,x+1,y,'*',C.tree);
    }
    for(let i=0;i<7;i++){
      const x=3+Math.floor(r()*(g.cols-6)),y=11+Math.floor(r()*Math.max(6,g.rows-28));put(g,x,y,'^',C.rock);
    }
    text(g,Math.round(g.cols*.25)-4,Math.round(g.rows*.35),'_/\\__/\\_',C.trench);
    text(g,Math.round(g.cols*.68)-4,Math.round(g.rows*.55),'_/\\__/\\_',C.trench);
  }

  function drawCraters(g,s){
    const arr=s._asciiV2Craters||[];
    for(const q of arr){
      const x=gx(q.x),y=gy(q.y),big=q.r>28;
      stamp(g,x,y,big?['..ooo..','.o(O)o.','o(   )o','.o(O)o.','..ooo..']:['.o.','oOo','.o.'],C.crater);
    }
  }

  function infantrySprite(e){
    const st=String(e.state||'');
    if(st==='DEAD')return (e.id%2)?['\\o_',' _\\']:['_o/','/_ '];
    if(st.indexOf('CRAWL')>=0||st.indexOf('SUPPRESS')>=0||(e.pose==='prone'&&e.suppression>.72))return ['o==>'];
    if(st==='IN_COVER'||st==='FIRE_FROM_COVER'||st==='ENTER_COVER'||st==='DEPLOY_WEAPON'||st==='FIRE_FROM_WEAPON')return [' o_','/|>','/_ '];
    const walk=Math.floor((e.anim||0)*8)%2;
    return walk?[' O ','/|>','/ \\']:[' O ','<|\\',' /\\'];
  }
  function drawInfantry(g,s){
    const a=(s.enemies||[]).slice().sort((x,y)=>(x.y||0)-(y.y||0));
    for(const e of a){
      const col=e.state==='DEAD'?C.dim:(e.suppression>.75?C.infantry2:C.infantry);
      stamp(g,gx(e.x),gy(e.y),infantrySprite(e),col);
      if(e.muzzleT>0){const ang=e.angle||0;put(g,gx(e.x)+Math.round(Math.cos(ang)*3),gy(e.y)+Math.round(Math.sin(ang)*2),'*',C.bullet);}
    }
  }

  const VEH={
    truck:['+----+','|CAB |','|::::|','+----+'],
    technical:['+---+','| ^ |','+-|-+'],
    halftrack:['+----+','| MG |','O====O'],
    tank:['  ||  ','+-||-+','| ## |','O====O'],
    stug:[' ===> ','+----+','|####|','O====O']
  };
  function vehSprite(v){return VEH[v.type]||VEH.truck;}
  function drawVehicles(g,s){
    for(const v of s.vehicles||[]){
      if(v.state==='DEPARTED')continue;
      const col=v.state==='DESTROYED'?C.dim:C.vehicle;
      stamp(g,gx(v.x),gy(v.y),vehSprite(v),col);
      if(v.muzzle>0){const a=v.turretAngle||v.hullAngle||0;put(g,gx(v.x)+Math.round(Math.cos(a)*5),gy(v.y)+Math.round(Math.sin(a)*3),'*',C.bullet);}
    }
  }

  function drawPlane(g,s){
    const p=s.airborne&&s.airborne.plane;if(!p||!p.active)return;
    stamp(g,gx(p.x),gy(p.y),['    __|__    ','---=[___]=---','    /   \\    '],C.air);
  }
  function drawParas(g,s){
    const a=s.airborne&&s.airborne.paratroopers?s.airborne.paratroopers:[];
    for(const p of a){
      if(p.state==='DESCENT')stamp(g,gx(p.x),gy(p.y),[' /---\\ ',' \\___/ ','  \\|/  ','   o   '],C.air);
      else if(p.state==='DEAD')stamp(g,gx(p.x),gy(p.y),[' \\_/ ','  x  '],C.dim);
    }
    const c=s.airborne&&s.airborne.collapsed?s.airborne.collapsed:[];
    for(const p of c)text(g,gx(p.x)-2,gy(p.y),'~~~~~',C.dim);
  }
  function heliPos(s,v){
    const p=clamp(v.t/v.dur,0,1),w=s.viewport.w;let x;
    if(p<.30)x=v.x0+(v.x1-v.x0)*(p/.30);else if(p<.70)x=v.x1;else x=v.x1+((v.x0<0?w+110:-110)-v.x1)*((p-.70)/.30);
    return {x,y:v.y};
  }
  function drawHelis(g,s){
    const h=s._hyHeli;if(!h||!h.visuals)return;
    for(const v of h.visuals){
      const p=heliPos(s,v),phase=Math.floor((v.t||0)*8)%4;
      const rotor=phase===0?'---+---':phase===1?'\\  |  /':phase===2?'   |   ':'/  |  \\';
      stamp(g,gx(p.x),gy(p.y),[rotor,' __H__ ','---|---','  |_|  '],C.air);
    }
  }

  function drawProjectiles(g,s){
    for(const b of s.bullets||[]){if(!b.active)continue;put(g,gx(b.x),gy(b.y),b.kind==='he'?'o':b.kind==='ap'?'>':'-',b.kind==='he'?C.he:b.kind==='ap'?C.ap:C.bullet);}
    for(const b of s.vehicleShots||[]){put(g,gx(b.x),gy(b.y),b.kind==='shell'?'o':'.',b.kind==='shell'?C.he:C.red);}
  }
  function drawExplosions(g,s){
    for(const e of s.explosions||[]){
      const p=e.dur?e.t/e.dur:0;let spr;
      if(p<.2)spr=['*'];else if(p<.48)spr=[' \\|/ ','--*--',' /|\\ '];else spr=['.oOo.','oO*Oo','.oOo.'];
      stamp(g,gx(e.x),gy(e.y),spr,p<.48?C.bullet:C.he);
    }
  }
  function drawBunker(g,s){
    const b=s.bunker;if(!b)return;const x=gx(b.x),y=gy(b.y);
    stamp(g,x,y,[' /=======\\ ','|### + ###|','|#########|',' \\=======/ '],C.bunker);
    const a=b.aim||-Math.PI/2,dx=Math.round(Math.cos(a)*5),dy=Math.round(Math.sin(a)*3);line(g,x,y-1,x+dx,y-1+dy,'=',C.bunker);put(g,x+dx,y-1+dy,'>',C.bunker);
  }
  function drawCrosshair(g,s){
    const inp=s.input;if(!inp)return;const x=gx(inp.x),y=gy(inp.y),ch=(inp.down&&inp.charge>0)?'+':'.';
    put(g,x,y,'+',C.white);put(g,x-2,y,ch,C.white);put(g,x+2,y,ch,C.white);put(g,x,y-1,ch,C.white);put(g,x,y+1,ch,C.white);
  }

  function drawHud(g,s){
    const safeTop=Math.ceil(((s.safe&&s.safe.top)||0)/CH),top=Math.max(0,safeTop);
    const hp=Math.max(0,Math.ceil(s.bunker&&s.bunker.hp||0)),maxHp=Math.max(1,Math.ceil(s.bunker&&s.bunker.maxHp||s.profile&&s.profile.maxHp||100));
    const hpR=clamp(hp/maxHp,0,1),ef=eff(s),kills=killCount(s),map=((s.campaign&&s.campaign.index)||0)+1;
    text(g,1,top,'HP '+String(hp).padStart(3,'0'),hpR>.5?C.white:hpR>.25?C.orange:C.red);
    const mid=Math.floor(g.cols/2)-5;text(g,mid,top,'EFF '+String(Math.round(ef*100)).padStart(2,'0')+'%',effCol(ef));
    text(g,Math.max(1,g.cols-11),top,'K '+String(kills).padStart(3,'0'),C.white);
    text(g,1,top+1,'MAP '+map+'/9',C.dim);

    const barW=Math.min(24,g.cols-20),barX=Math.floor((g.cols-barW-2)/2),fill=Math.round(barW*ef);
    put(g,barX,top+1,'[',C.white);for(let i=0;i<barW;i++)put(g,barX+1+i,top+1,i<fill?'=':'-',i<fill?effCol(ef):C.dim);put(g,barX+barW+1,top+1,']',C.white);

    const bottom=g.rows-Math.max(2,Math.ceil(((s.safe&&s.safe.bottom)||0)/CH)+2);
    const heat=clamp(typeof s._hyHeat==='number'?s._hyHeat:0,0,1),charge=clamp(s.input&&s.input.charge? s.input.charge/(J.CONFIG.input.maxCharge||1):0,0,1);
    text(g,1,bottom-1,'BURST      AP       HE',C.white);
    const w=Math.max(12,g.cols-16),f=Math.round(w*charge);put(g,1,bottom,'[',C.white);for(let i=0;i<w;i++)put(g,2+i,bottom,i<f?'#':'-',i<f?(charge>.62?C.he:charge>.32?C.ap:C.bullet):C.dim);put(g,2+w,bottom,']',C.white);
    const hx=Math.min(g.cols-12,5+w+3);text(g,hx,bottom,'H'+Math.round(heat*9),heat>.8?C.red:heat>.55?C.orange:C.dim);
    if(s.ui&&s.ui.messageT>0&&s.ui.message){const m=String(s.ui.message).slice(0,g.cols-4);text(g,Math.max(2,Math.floor((g.cols-m.length)/2)),top+3,m,C.bunker);}
  }

  function paint(ctx,g,s){
    const dpr=s.viewport.dpr||1,w=s.viewport.w,h=s.viewport.h;
    ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle=C.bg;ctx.fillRect(0,0,w,h);
    ctx.font='700 '+CH+'px Menlo, Monaco, "Courier New", monospace';ctx.textBaseline='top';ctx.textAlign='left';ctx.imageSmoothingEnabled=false;
    for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){
      const i=idx(g,x,y),ch=g.ch[i];if(ch===' ')continue;ctx.fillStyle=g.co[i]||C.white;ctx.fillText(ch,x*CW,y*CH);
    }
    ctx.restore();
  }

  const crater0=J.World.crater&&J.World.crater.bind(J.World);
  if(crater0)J.World.crater=function(s,x,y,r,seed){if(!s._asciiV2Craters)s._asciiV2Craters=[];s._asciiV2Craters.push({x,y,r:r||18});if(s._asciiV2Craters.length>40)s._asciiV2Craters.shift();return crater0(s,x,y,r,seed);};

  const render0=J.Render.render.bind(J.Render);let failed=false;
  J.Render.render=function(s,ctx){
    const out=render0(s,ctx);
    if(failed)return out;
    try{
      const g=makeGrid(s);drawGround(g,s);drawMap(g,s);drawCraters(g,s);drawVehicles(g,s);drawInfantry(g,s);drawPlane(g,s);drawParas(g,s);drawHelis(g,s);drawProjectiles(g,s);drawExplosions(g,s);drawBunker(g,s);drawCrosshair(g,s);drawHud(g,s);paint(ctx,g,s);
    }catch(err){failed=true;console.error('ASCII V2 renderer disabled after error',err);}
    return out;
  };

  console.info('JBD ASCII V2 Jungle Prototype active');
})();
