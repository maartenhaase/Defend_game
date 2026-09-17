/* JBD ASCII V2.1 — Hybrid Blocks */
(()=>{
  'use strict';

  const J = window.JBD;
  if(!J || !J.Render) return;

  const U = J.U || { clamp:(v,a,b)=>Math.max(a,Math.min(b,v)) };
  const CELL_W = 8;
  const CELL_H = 10;

  const COL = {
    bg:'#161b13', bg2:'#1f261a',
    jungleBase:'#6c7b58', jungleDark:'#5b694c', jungleRoad:'#b4a67a', jungleRoadEdge:'#998b65', jungleBuilding:'#8c7d63', jungleRoof:'#726652', jungleTree:'#87986e', jungleCrater:'#41392d',
    desertBase:'#bca374', desertDark:'#a08a62', desertRoad:'#d2be8f', desertRoadEdge:'#b79f73', desertBuilding:'#9a8262', desertRoof:'#7f6a52', desertTree:'#9f9a62', desertCrater:'#5b4936',
    polarBase:'#c8d0cb', polarDark:'#aeb8b3', polarRoad:'#d8ddd8', polarRoadEdge:'#b9c1bc', polarBuilding:'#8e887c', polarRoof:'#716c64', polarTree:'#8f9b95', polarCrater:'#5e635f',
    text:'#efe8c6', hp:'#efe8c6', good:'#59d07a', ok:'#9fc95c', mid:'#d7c95a', warn:'#df9640', bad:'#d84c49', kill:'#efe8c6', heat:'#de8b48', air:'#d5dfdf', enemy:'#f3ecd0', vehicle:'#d5ca9f', player:'#eadb8d', trench:'#4f4838'
  };

  function biomeSet(theme){
    if(theme==='desert') return {ground:COL.desertBase,groundDark:COL.desertDark,road:COL.desertRoad,roadEdge:COL.desertRoadEdge,building:COL.desertBuilding,roof:COL.desertRoof,tree:COL.desertTree,crater:COL.desertCrater};
    if(theme==='polar') return {ground:COL.polarBase,groundDark:COL.polarDark,road:COL.polarRoad,roadEdge:COL.polarRoadEdge,building:COL.polarBuilding,roof:COL.polarRoof,tree:COL.polarTree,crater:COL.polarCrater};
    return {ground:COL.jungleBase,groundDark:COL.jungleDark,road:COL.jungleRoad,roadEdge:COL.jungleRoadEdge,building:COL.jungleBuilding,roof:COL.jungleRoof,tree:COL.jungleTree,crater:COL.jungleCrater};
  }

  function effValue(s){
    const vals=[s&&s._hyEff,s&&s._hybridEff,s&&s._v697Eff,s&&s._v696Eff,s&&s._v695Eff];
    for(const v of vals) if(typeof v==='number'&&isFinite(v)) return U.clamp(v,0,1);
    return .75;
  }
  function effColor(v){return v>=.86?COL.good:v>=.70?COL.ok:v>=.50?COL.mid:v>=.25?COL.warn:COL.bad;}
  function totalKills(s){const st=(s&&s.stats)||{};return (st.kills||0)+(st.vehicleKills||0)+(st.airKills||0)+(st.artilleryKills||0);}

  function grid(cols,rows){
    const cells=new Array(cols*rows);
    for(let i=0;i<cells.length;i++)cells[i]={ch:' ',fg:COL.text,bg:null};
    return {cols,rows,cells};
  }
  function index(g,x,y){return y*g.cols+x;}
  function set(g,x,y,ch,fg,bg){
    x=Math.round(x);y=Math.round(y);
    if(x<0||y<0||x>=g.cols||y>=g.rows)return;
    const c=g.cells[index(g,x,y)];
    if(ch!=null)c.ch=ch;if(fg!=null)c.fg=fg;if(bg!=null)c.bg=bg;
  }
  function write(g,x,y,str,fg){for(let i=0;i<str.length;i++)set(g,x+i,y,str[i],fg,null);}
  function stamp(g,x,y,lines,fg,bg){
    for(let yy=0;yy<lines.length;yy++)for(let xx=0;xx<lines[yy].length;xx++){const ch=lines[yy][xx];if(ch!==' ')set(g,x+xx,y+yy,ch,fg,bg);}
  }
  function fillRect(g,x,y,w,h,ch,fg,bg){for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)set(g,x+xx,y+yy,ch,fg,bg);}
  function line(g,x0,y0,x1,y1,ch,fg,bg){
    x0|=0;y0|=0;x1|=0;y1|=0;
    const dx=Math.abs(x1-x0),sx0=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy0=y0<y1?1:-1;let err=dx+dy;
    while(true){set(g,x0,y0,ch,fg,bg);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx0;}if(e2<=dx){err+=dx;y0+=sy0;}}
  }
  const sx=v=>Math.round(v/CELL_W), sy=v=>Math.round(v/CELL_H);

  function background(g,p){
    for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){
      if(y<7||y>g.rows-6){set(g,x,y,' ',COL.text,COL.bg2);continue;}
      const r=((x*13+y*17+(x*y)%7)%29)/29;
      if(r<.04)set(g,x,y,'░',p.groundDark,p.ground);
      else if(r<.075)set(g,x,y,'▒',p.groundDark,p.ground);
      else set(g,x,y,' ',COL.text,p.ground);
    }
  }

  function layout(s,g){
    const i=(s.scenario&&s.scenario.index)||0;
    return {roadX:Math.round(g.cols*(i%2?.57:.44)),jy:Math.round(g.rows*(.34+(i%3)*.06)),cx:Math.round(g.cols*(i%2?.27:.72)),cy:Math.round(g.rows*(.36+(i%3)*.05))};
  }

  function roads(g,p,l){
    fillRect(g,l.roadX-2,7,5,Math.max(3,l.jy-7),'█',p.road,p.road);
    fillRect(g,l.roadX-3,7,1,Math.max(3,l.jy-7),'▒',p.roadEdge,p.roadEdge);
    fillRect(g,l.roadX+3,7,1,Math.max(3,l.jy-7),'▒',p.roadEdge,p.roadEdge);
    const bx=Math.round(g.cols*.5),by=g.rows-10;
    line(g,l.roadX-1,l.jy,bx-1,by,'▒',p.roadEdge,p.roadEdge);
    line(g,l.roadX,l.jy,bx,by,'█',p.road,p.road);
    line(g,l.roadX+1,l.jy,bx+1,by,'█',p.road,p.road);
    line(g,l.roadX+2,l.jy,bx+2,by,'▒',p.roadEdge,p.roadEdge);
    line(g,l.roadX,l.jy,l.cx,l.cy,'▓',p.road,p.road);
  }

  function compound(g,p,l){
    fillRect(g,l.cx-6,l.cy-4,14,9,'▓',p.building,p.building);
    fillRect(g,l.cx-5,l.cy-3,12,7,' ',COL.text,p.ground);
    fillRect(g,l.cx-3,l.cy-1,7,4,'█',p.building,p.building);
    fillRect(g,l.cx-3,l.cy-1,7,1,'▓',p.roof,p.roof);
    fillRect(g,l.cx+5,l.cy-4,4,3,'█',p.building,p.building);
    fillRect(g,l.cx+5,l.cy-4,4,1,'▓',p.roof,p.roof);
    fillRect(g,l.cx-1,l.cy+4,3,1,' ',COL.text,p.ground);
  }

  function terrainProps(g,p){
    for(let i=0;i<10;i++){
      const x=3+((i*7)%Math.max(5,g.cols-8)),y=9+((i*11)%Math.max(8,g.rows-23));
      stamp(g,x,y,['▒█▒',' █ '],p.tree,p.ground);
    }
    for(let i=0;i<4;i++){
      const x=5+((i*13)%Math.max(5,g.cols-10)),y=12+((i*9)%Math.max(8,g.rows-25));
      stamp(g,x,y,['▓▓',' ▓'],p.groundDark,p.ground);
    }
    stamp(g,Math.round(g.cols*.18),Math.round(g.rows*.35),['_/\\__/\\__'],COL.trench,null);
    stamp(g,Math.round(g.cols*.62),Math.round(g.rows*.57),['_/\\__/\\__'],COL.trench,null);
  }

  function bunker(g,s){
    const bx=Math.round(g.cols*.5)-4,by=g.rows-11;
    stamp(g,bx,by,[' ███████ ','█████████','███  ████','█████████',' ███████ '],COL.player,null);
    const ang=(s.bunker&&typeof s.bunker.angle==='number')?s.bunker.angle:-Math.PI/2;
    const dx=Math.round(Math.cos(ang)*5),dy=Math.round(Math.sin(ang)*3);
    line(g,bx+4,by+2,bx+4+dx,by+2+dy,'=',COL.player,null);
    set(g,bx+4+dx,by+2+dy,'>',COL.player,null);
  }

  const INF={idle:[' O ','/|>','/ \\'],walk1:[' O ','/|>','/  \\'],walk2:[' O ','<|\\','  /\\'],crouch:[' o_','/|>','/_ '],prone:['o==>'],dead1:['\\O_','  \\'],dead2:[' _O/','_/  ']};
  function infantryPose(e){
    if(e.state==='DEAD')return e.id%2?'dead1':'dead2';
    const st=String(e.state||'');
    if(st.indexOf('CRAWL')>=0||st.indexOf('SUPPRESS')>=0)return 'prone';
    if(st==='IN_COVER'||st==='FIRE_FROM_COVER'||st==='ENTER_COVER'||st==='DEPLOY_WEAPON'||st==='FIRE_FROM_WEAPON')return 'crouch';
    if(st==='ADVANCE'||st==='SPRINT_TO_COVER'||st==='MOVE_TO_COVER'||st==='ASSAULT'||st==='RETREAT'||st==='LEAVE_COVER')return Math.floor((e.anim||0)*8)%2?'walk1':'walk2';
    return 'idle';
  }
  function infantry(g,s){
    const list=(s.enemies||[]).slice().sort((a,b)=>(a.y||0)-(b.y||0));
    for(const e of list){const sh=INF[infantryPose(e)]||INF.idle;stamp(g,sx(e.x)-1,sy(e.y)-1,sh,COL.enemy,null);if(e.muzzleT>0)set(g,sx(e.x)+2,sy(e.y)-1,'*','#ffe07a',null);}
  }

  const VEH={
    truck:['██████','█C████','█░░░░█','O████O'],
    technical:['█████ ','█ ^ █ ','O███O '],
    halftrack:['██████ ','█ MG █ ','O█████O'],
    apc:[' █████ ','███████','O█████O'],
    tank:['  ███  ',' █████ ','███████','O█████O']
  };
  function vehicleShape(v){const t=String(v.type||v.kind||'').toLowerCase();if(t.indexOf('technical')>=0)return VEH.technical;if(t.indexOf('half')>=0)return VEH.halftrack;if(t.indexOf('apc')>=0)return VEH.apc;if(t.indexOf('tank')>=0||t.indexOf('stug')>=0)return VEH.tank;return VEH.truck;}
  function vehicles(g,s){
    for(const v of s.vehicles||[]){if(v.state==='DESTROYED'||v.state==='DEPARTED')continue;const sh=vehicleShape(v),x=sx(v.x)-Math.floor(sh[0].length/2),y=sy(v.y)-2;stamp(g,x,y,sh,COL.vehicle,null);if((v.type==='tank'||v.type==='stug')&&typeof v.turretAngle==='number'){const dx=Math.round(Math.cos(v.turretAngle)*4),dy=Math.round(Math.sin(v.turretAngle)*2);line(g,sx(v.x),sy(v.y)-1,sx(v.x)+dx,sy(v.y)-1+dy,'=',COL.vehicle,null);set(g,sx(v.x)+dx,sy(v.y)-1+dy,'>',COL.vehicle,null);}}
  }

  function aircraft(g,s){
    const plane=s.airborne&&s.airborne.plane;
    if(plane&&plane.active)stamp(g,sx(plane.x)-5,sy(plane.y)-1,['---████---','    ██    '],COL.air,null);
    const paras=(s.airborne&&s.airborne.paratroopers)||[];
    for(const p of paras){if(p.state==='DESCENT')stamp(g,sx(p.x)-2,sy(p.y)-2,['/---\\','\\___/',' \\|/ ','  O  '],COL.air,null);}
    const helis=(s._hyHeli&&s._hyHeli.visuals)||[];
    for(const v of helis){
      const p=U.clamp((v.t||0)/(v.dur||1),0,1),w=s.viewport.w;let x;
      if(p<.30)x=v.x0+(v.x1-v.x0)*(p/.30);else if(p<.70)x=v.x1;else x=v.x1+((v.x0<0?w+110:-110)-v.x1)*((p-.70)/.30);
      const y=v.y||s.viewport.h*.35,phase=Math.floor((v.t||0)*8)%2;
      const sh=phase?[' \\ | / ','--███--',' / | \\ ']:['---+---',' █████ ','  ███  '];
      stamp(g,sx(x)-3,sy(y)-1,sh,COL.air,null);
    }
  }

  function effects(g,s,p){
    if(!s._ascii21Craters)s._ascii21Craters=[];
    for(const ex of s.explosions||[]){
      if(ex.t<=0)continue;
      stamp(g,sx(ex.x)-1,sy(ex.y)-1,[' * ','***',' * '],'#ffd36f',null);
      if(ex.t>.65&&!ex._ascii21Marked){ex._ascii21Marked=true;s._ascii21Craters.push({x:ex.x,y:ex.y});if(s._ascii21Craters.length>60)s._ascii21Craters.shift();}
    }
    for(const c of s._ascii21Craters)stamp(g,sx(c.x)-2,sy(c.y)-1,[' ░▓▓░ ','▓███▓',' ▓▓▓ '],p.crater,null);
    for(const b of s.bullets||[]){if(b.active!==false)set(g,sx(b.x),sy(b.y),b.kind==='he'?'o':b.kind==='ap'?'>':'·',b.kind==='he'?COL.orange:b.kind==='ap'?'#a8ddf5':'#ffe087',null);}
  }

  function hud(g,s){
    const hp=Math.max(0,Math.ceil((s.bunker&&s.bunker.hp)||0)),eff=effValue(s),kills=totalKills(s),map=Math.max(1,((s.campaign&&s.campaign.index)||0)+1),heat=U.clamp((s._hyHeat||0),0,1),effCol=effColor(eff);
    write(g,2,1,`HP ${String(hp).padStart(3,' ')}`,hp>50?COL.hp:hp>25?COL.mid:COL.bad);
    write(g,Math.floor(g.cols/2)-6,1,`EFF ${String(Math.round(eff*100)).padStart(3,' ')}%`,effCol);
    write(g,Math.max(2,g.cols-13),1,`KILL ${String(kills).padStart(3,' ')}`,COL.kill);
    write(g,2,2,`MAP ${map}/9`,COL.text);
    const ex=Math.floor(g.cols/2)-8,ew=16,ef=Math.round(ew*eff);set(g,ex-1,2,'[',COL.text,null);for(let i=0;i<ew;i++)set(g,ex+i,2,i<ef?'█':'░',i<ef?effCol:'#4d5647',null);set(g,ex+ew,2,']',COL.text,null);
    const hy=g.rows-3,hw=14,hf=Math.round(hw*heat);write(g,2,hy,'HEAT',COL.text);set(g,8,hy,'[',COL.text,null);for(let i=0;i<hw;i++)set(g,9+i,hy,i<hf?'█':'░',i<hf?COL.heat:'#4d5647',null);set(g,9+hw,hy,']',COL.text,null);
    if(s.ui&&s.ui.messageT>0&&s.ui.message){const msg=String(s.ui.message).slice(0,Math.max(8,g.cols-6));write(g,Math.max(2,Math.floor((g.cols-msg.length)/2)),4,msg,COL.player);}
  }

  function renderGrid(ctx,g,w,h){
    ctx.fillStyle=COL.bg;ctx.fillRect(0,0,w,h);
    for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){const c=g.cells[index(g,x,y)];if(c.bg){ctx.fillStyle=c.bg;ctx.fillRect(x*CELL_W,y*CELL_H,CELL_W,CELL_H);}}
    ctx.font=`${CELL_H}px ui-monospace,SFMono-Regular,Menlo,monospace`;ctx.textBaseline='top';ctx.textAlign='left';ctx.imageSmoothingEnabled=false;
    for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){const c=g.cells[index(g,x,y)];if(c.ch===' ')continue;ctx.fillStyle=c.fg||COL.text;ctx.fillText(c.ch,x*CELL_W,y*CELL_H);}
  }

  const oldRender=J.Render.render.bind(J.Render);
  J.Render.render=function(s,ctx){
    const out=oldRender(s,ctx);
    const dpr=(s.viewport&&s.viewport.dpr)||1,w=(s.viewport&&s.viewport.w)||(ctx.canvas.width/dpr),h=(s.viewport&&s.viewport.h)||(ctx.canvas.height/dpr),cols=Math.max(36,Math.floor(w/CELL_W)),rows=Math.max(30,Math.floor(h/CELL_H));
    const g=grid(cols,rows),p=biomeSet((s.scenario&&s.scenario.theme)||'jungle'),l=layout(s,g);
    background(g,p);roads(g,p,l);compound(g,p,l);terrainProps(g,p);effects(g,s,p);vehicles(g,s);infantry(g,s);aircraft(g,s);bunker(g,s);hud(g,s);
    ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);renderGrid(ctx,g,w,h);ctx.restore();
    return out;
  };

  console.info('JBD ASCII V2.1 Hybrid Blocks active');
})();
