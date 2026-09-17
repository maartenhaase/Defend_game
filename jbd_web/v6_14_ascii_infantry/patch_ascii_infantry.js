/* JBD V6.14 — compiled ASCII top-down infantry. One renderer, no old infantry LOD. */
(()=>{
  'use strict';
  const J=window.JBD;
  if(!J||!J.Render||!J.Scale)return;

  const POSES={
    idle:[
      "    HH     ",
      "   HOOH    ",
      "    OO GG  ",
      "   BBBGG   ",
      "  LBBBG    ",
      "   BBB     ",
      "   BBB     ",
      "   L L     ",
      "   L L     ",
      "  LL LL    ",
      "           ",
      "           "
    ],
    walk1:[
      "    HH     ",
      "   HOOH    ",
      "    OO GG  ",
      "   BBBGG   ",
      "  LBBBG    ",
      "   BBB     ",
      "   BBB     ",
      "    BL     ",
      "   L       ",
      "  LL   L   ",
      "       LL  ",
      "           "
    ],
    walk2:[
      "    HH     ",
      "   HOOH    ",
      "    OO GG  ",
      "   BBBGG   ",
      "  LBBBG    ",
      "   BBB     ",
      "   BBB     ",
      "   LB      ",
      "      L    ",
      "   L   LL  ",
      "  LL       ",
      "           "
    ],
    crouch:[
      "           ",
      "    HH     ",
      "   HOOH GG ",
      "   BBBGGG  ",
      "  LBBBB    ",
      "   BBB     ",
      "  LL LL    ",
      "  L   L    ",
      "           ",
      "           ",
      "           ",
      "           "
    ],
    prone:[
      "           ",
      "           ",
      "           ",
      " HHOBBBBGGG",
      "  LBBBBL   ",
      "   LL LL    ",
      "           ",
      "           ",
      "           ",
      "           ",
      "           ",
      "           "
    ],
    dead1:[
      "           ",
      "      GGG  ",
      "    HH     ",
      "  LLBO     ",
      "    BBBL   ",
      "   L B     ",
      "  L   L    ",
      "           ",
      "           ",
      "           ",
      "           ",
      "           "
    ],
    dead2:[
      "           ",
      "  GGG      ",
      "     HHO   ",
      "    LBBB   ",
      "  LLBBB L  ",
      "      L LL ",
      "           ",
      "           ",
      "           ",
      "           ",
      "           ",
      "           "
    ]
  };

  const PALETTES={
    rifleman:{O:'#1d241c',H:'#a1aa78',B:'#68784f',L:'#455238',G:'#242b22'},
    smg:{O:'#1d241c',H:'#a8af7b',B:'#728255',L:'#4b583d',G:'#242b22'},
    marksman:{O:'#1d231e',H:'#929b7b',B:'#596657',L:'#414c42',G:'#202620'},
    lmg:{O:'#1b211a',H:'#93986d',B:'#596744',L:'#3f4a32',G:'#171d18'},
    engineer:{O:'#231f19',H:'#aa986d',B:'#75664b',L:'#514631',G:'#27231d'},
    default:{O:'#1d241c',H:'#a1aa78',B:'#68784f',L:'#455238',G:'#242b22'}
  };

  function compile(lines,palette){
    const h=lines.length,w=Math.max.apply(null,lines.map(x=>x.length));
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    for(let y=0;y<h;y++){
      const row=lines[y];
      for(let x=0;x<w;x++){
        const ch=row[x]||' ',col=palette[ch];
        if(!col)continue;
        g.fillStyle=col;g.fillRect(x,y,1,1);
      }
    }
    return c;
  }

  const SPRITES={};
  for(const key of Object.keys(PALETTES)){
    SPRITES[key]={};
    for(const pose of Object.keys(POSES))SPRITES[key][pose]=compile(POSES[pose],PALETTES[key]);
  }

  function classKey(e){
    const k=String(e.classKey||e.role||'default').toLowerCase();
    if(k.indexOf('mark')>=0||k.indexOf('snip')>=0)return 'marksman';
    if(k.indexOf('lmg')>=0||k.indexOf('mg')>=0)return 'lmg';
    if(k.indexOf('eng')>=0)return 'engineer';
    if(k.indexOf('smg')>=0)return 'smg';
    if(k.indexOf('rifle')>=0)return 'rifleman';
    return 'default';
  }

  function movingState(state){
    return state==='ADVANCE'||state==='MOVE_TO_COVER'||state==='ASSAULT'||state==='RETREAT'||state==='LEAVE_COVER';
  }
  function coverState(state){
    return state==='ENTER_COVER'||state==='IN_COVER'||state==='FIRE_FROM_COVER'||state==='DEPLOY_WEAPON'||state==='FIRE_FROM_WEAPON';
  }

  function choosePose(e){
    if(e.state==='DEAD')return (e.id%2)?'dead1':'dead2';
    if(movingState(e.state)){
      const frame=Math.floor((e.anim||0)*8.5)%2;
      return frame?'walk1':'walk2';
    }
    if(String(e.state||'').indexOf('CRAWL')>=0||String(e.state||'').indexOf('SUPPRESS')>=0)return 'prone';
    if(coverState(e.state)){
      if(e.pose==='prone'&&e.suppression>.72)return 'prone';
      return 'crouch';
    }
    return 'idle';
  }

  function drawShadow(ctx,s,e,scale){
    if(e.state==='DEAD')return;
    ctx.save();ctx.globalAlpha=.13;ctx.fillStyle='#000';
    ctx.beginPath();ctx.ellipse(e.x+1.2,e.y+2.2,4.4*scale,2.0*scale,e.angle||0,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function drawMuzzle(ctx,e,scale){
    if(!(e.muzzleT>0))return;
    ctx.save();ctx.translate(e.x,e.y);ctx.rotate((e.angle||0)+Math.PI/2);
    ctx.fillStyle='#ffe48d';
    ctx.fillRect(-1*scale,-12.5*scale,2*scale,3.5*scale);
    ctx.restore();
  }

  function drawSoldier(ctx,s,e){
    const pose=choosePose(e),set=SPRITES[classKey(e)]||SPRITES.default,spr=set[pose]||set.idle;
    if(!spr)return;
    const base=J.Scale.entity(s,e.y,'infantry');
    const scale=Math.max(.92,base*1.42);
    drawShadow(ctx,s,e,scale);

    ctx.save();
    ctx.translate(Math.round(e.x),Math.round(e.y));
    if(e.state==='DEAD'){
      const da=((e.id%7)-3)*.12;
      ctx.rotate((e.angle||0)+da);
    }else{
      ctx.rotate((e.angle||0)+Math.PI/2);
      if(e.hitT>0)ctx.rotate(Math.sin(e.hitT*26)*.06);
      if(e.recoilT>0)ctx.translate(0,Math.min(2.2,e.recoilT*5));
    }
    ctx.imageSmoothingEnabled=false;
    const w=Math.max(1,Math.round(spr.width*scale)),h=Math.max(1,Math.round(spr.height*scale));
    ctx.globalAlpha=e.alpha==null?1:e.alpha;
    ctx.drawImage(spr,-Math.round(w/2),-Math.round(h/2),w,h);
    ctx.restore();
    if(e.state!=='DEAD')drawMuzzle(ctx,e,scale);
  }

  function drawInfantryLayer(ctx,s,enemies){
    const dpr=s.viewport.dpr||1,w=s.viewport.w,h=s.viewport.h;
    const top=(s.safe&&s.safe.top||0)+82;
    const bottom=(s.safe&&s.safe.bottom||0)+66;
    ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.beginPath();ctx.rect(0,top,w,Math.max(0,h-top-bottom));ctx.clip();
    const ordered=enemies.slice().sort((a,b)=>(a.y||0)-(b.y||0));
    for(const e of ordered)drawSoldier(ctx,s,e);
    ctx.restore();
  }

  /* Hide enemies only while the existing renderer runs. This removes every
     old far/mid/full infantry representation. Afterwards our one ASCII
     renderer draws all living and dead infantry consistently. */
  const render0=J.Render.render.bind(J.Render);
  J.Render.render=function(s,ctx){
    const enemies=s.enemies||[];
    let out;
    try{
      s.enemies=[];
      out=render0(s,ctx);
    }finally{
      s.enemies=enemies;
    }
    drawInfantryLayer(ctx,s,enemies);
    return out;
  };

  console.info('JBD V6.14 ASCII infantry active — one top-down pose renderer');
})();