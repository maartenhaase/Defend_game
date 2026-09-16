/* JBD v6.9.8 — richer handcrafted maps, slightly larger sprites, faster flow, gentler efficiency */
(()=>{
  const wait=()=>{
    const J=window.JBD;
    if(!J||!J.Scenarios||!J.Render||!J.World||!J.Scale||!J.U){setTimeout(wait,35);return;}
    if(J.__v698)return; J.__v698=true;
    const U=J.U;
    const state=()=>window.__JBD_STATE__||null;

    /* ----------------------------------------------------------
       1) SCALE: every moving sprite gets a very small size bump.
          Infantry was already enlarged in 6.9.4; this is only +5%.
    ---------------------------------------------------------- */
    const oldEntity=J.Scale.entity.bind(J.Scale);
    J.Scale.entity=function(s,y,kind='infantry'){
      return oldEntity(s,y,kind)*1.05;
    };
    const oldEffect=J.Scale.effect?J.Scale.effect.bind(J.Scale):null;
    if(oldEffect)J.Scale.effect=function(...a){return oldEffect(...a)*1.025;};

    /* ----------------------------------------------------------
       2) SPEED: slightly quicker across the whole campaign.
          Preserve the 6.9.6 tuning, just make it feel more immediate.
    ---------------------------------------------------------- */
    const oldApply=J.Scenarios.apply.bind(J.Scenarios);
    const oldAdvance=J.Scenarios.advance.bind(J.Scenarios);
    function tuneSpeed(q){
      if(!q)return q;
      if(!q._v698Speed){
        q._v698Speed=true;
        q.infantrySpeedMult=(q.infantrySpeedMult||1)*1.07;
        q.vehicleSpeedMult=(q.vehicleSpeedMult||1)*1.08;
        q.spawnDuration=Math.max(5.0,(q.spawnDuration||9)*.94);
      }
      return q;
    }
    J.Scenarios.apply=function(s,index=s.campaign.index,cycle=s.campaign.cycle){
      const out=oldApply(s,index,cycle); tuneSpeed(s.scenario); resetEfficiency(s); s._v698MapKey=''; return out;
    };
    J.Scenarios.advance=function(s){
      const out=oldAdvance(s); tuneSpeed(s.scenario); resetEfficiency(s); s._v698MapKey=''; return out;
    };

    /* ----------------------------------------------------------
       3) EFFICIENCY 2.0: less twitchy. Start 75%. A miss hurts a
          little, effective actions/hits/kills restore more. Red <20%.
    ---------------------------------------------------------- */
    function totalKills(s){return (s.stats?.kills||0)+(s.stats?.vehicleKills||0)+(s.stats?.airKills||0)+(s.stats?.artilleryKills||0);}
    function resetEfficiency(s){
      if(!s)return;
      s._v698Eff=.75; s._v698EffSeed=s.scenario?.seed??0; s._v698Failed=false; s._v698Critical=false;
      s._v698Last={tr:s.stats?.triggers||0,ok:s.stats?.effectiveTriggers||0,h:s.stats?.hits||0,k:totalKills(s)};
      s._v698LastShot=performance.now();
      /* make inherited efficiency systems inert */
      s._v696Failed=true; s._v696Eff=.75; s._v696EffSeed=s.scenario?.seed??0;
      s._v695EffFailed=true; s._v695Eff=.75; s._v695EffSeed=s.scenario?.seed??0;
    }
    function effColor(v){return v>=.88?'#45cf7d':v>=.72?'#9dcb5f':v>=.50?'#d9c855':v>=.28?'#e29342':'#df5148';}
    function failEff(s){
      if(s._v698Failed)return; s._v698Failed=true; s._v698Eff=Math.min(s._v698Eff,.195); s.bunker.hp=0;
      s.ui=s.ui||{};s.ui.message='EFFICIENCY LOST';s.ui.messageT=2.4;
      setTimeout(()=>{
        const ov=document.getElementById('overlay'),ti=document.getElementById('title'),su=document.getElementById('sub'),re=document.getElementById('restart'),de=document.getElementById('deploy');
        if(ti)ti.textContent='EFFICIENCY LOST';
        if(su)su.innerHTML=`Efficiency ${Math.round((s._v698Eff||0)*100)}%.<br><span>Rood = einde run. Richt je vuur beter en gebruik hits/kills om weer op te bouwen.</span>`;
        if(de)de.style.display='none';if(re)re.style.display='inline-flex';if(ov)ov.classList.remove('hidden');
      },220);
    }
    function updateEfficiency(s){
      if(!s)return;
      if(s._v698EffSeed!==s.scenario?.seed||s._v698Eff==null)resetEfficiency(s);
      s._v696Failed=true;s._v696Eff=.75;s._v695EffFailed=true;s._v695Eff=.75;
      if(s.mode!=='playing'||s.levelComplete||s._v698Failed)return;
      const cur={tr:s.stats?.triggers||0,ok:s.stats?.effectiveTriggers||0,h:s.stats?.hits||0,k:totalKills(s)},last=s._v698Last||cur;
      const dtr=Math.max(0,cur.tr-last.tr),dok=Math.max(0,cur.ok-last.ok),dh=Math.max(0,cur.h-last.h),dk=Math.max(0,cur.k-last.k);
      if(dtr>0){
        s._v698LastShot=performance.now();
        const good=Math.min(dtr,dok),bad=Math.max(0,dtr-good);
        /* only ~0.8 percentage point per wasted trigger */
        s._v698Eff=U.clamp(s._v698Eff + good*.010 - bad*.008,0,1);
      }
      if(dh>0)s._v698Eff=U.clamp(s._v698Eff+Math.min(.026,dh*.0045),0,1);
      if(dk>0)s._v698Eff=U.clamp(s._v698Eff+Math.min(.045,dk*.012),0,1);
      const idle=(performance.now()-(s._v698LastShot||performance.now()))/1000;
      if(idle>1.25&&s._v698Eff<.78)s._v698Eff=U.clamp(s._v698Eff+.0006,0,1);
      s._v698Last=cur;
      if(s._v698Eff<.30&&!s._v698Critical){s._v698Critical=true;s.ui=s.ui||{};s.ui.message='EFFICIENCY CRITICAL';s.ui.messageT=1.2;}
      if(s._v698Eff>.36)s._v698Critical=false;
      if(s._v698Eff<.20)failEff(s);
    }

    /* ----------------------------------------------------------
       4) RICH MAP RENDERER. Nine visual layouts, not nine copies of
          the same noisy generator. Rendering only: gameplay routes and
          collision remain the trusted base map.
    ---------------------------------------------------------- */
    const PAL={
      jungle:{g:'#71875a',g2:'#5e7449',g3:'#879968',path:'#a5956d',edge:'#625942',water:'#337e96',water2:'#78c7d7',sand:'#b5a777',roof:'#9c7650',wall:'#796246',wood:'#5d472f',tree:'#35562f',tree2:'#587449',rock:'#74725f',fence:'#66513a'},
      desert:{g:'#c7b27f',g2:'#b29a68',g3:'#d5c28e',path:'#d2bb86',edge:'#98835b',water:'#4ca6bd',water2:'#8bd8e6',sand:'#dac78e',roof:'#a67e55',wall:'#b99467',wood:'#77583a',tree:'#848951',tree2:'#a0a76b',rock:'#8d8069',fence:'#846443'},
      polar:{g:'#cbd4d0',g2:'#b5c1bd',g3:'#dce2de',path:'#dce0db',edge:'#a3ada8',water:'#70a7bd',water2:'#add9e4',sand:'#d4d9d6',roof:'#969084',wall:'#aaa599',wood:'#716a60',tree:'#60766e',tree2:'#83978e',rock:'#8e9798',fence:'#7c756b'}
    };
    function rng(seed){return U.mulberry32((seed^0x6982026)>>>0);}
    function blob(g,x,y,rx,ry,c,a=1){g.save();g.globalAlpha=a;g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();g.restore();}
    function poly(g,pts,c){g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill();}
    function road(g,pts,p,w=11){if(!pts||pts.length<2)return;g.save();g.lineCap='round';g.lineJoin='round';g.strokeStyle=p.edge;g.lineWidth=w+4;g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.stroke();g.strokeStyle=p.path;g.lineWidth=w;g.stroke();g.strokeStyle='rgba(255,247,215,.16)';g.lineWidth=1;g.stroke();g.restore();}
    function tree(g,x,y,r,p){blob(g,x+2,y+3,r*1.05,r*.72,'rgba(0,0,0,.12)');blob(g,x,y,r,r*.72,p.tree);blob(g,x-r*.22,y-r*.20,r*.58,r*.36,p.tree2,.72);g.fillStyle=p.wood;g.fillRect(Math.round(x-1),Math.round(y+r*.38),2,Math.max(2,Math.round(r*.45)));}
    function rock(g,x,y,r,p){poly(g,[[x-r,y+1],[x-r*.45,y-r*.62],[x+r*.36,y-r*.50],[x+r,y],[x+r*.34,y+r*.56],[x-r*.55,y+r*.40]],p.rock);}
    function fence(g,x,y,w,h,p){g.strokeStyle=p.fence;g.lineWidth=1;g.strokeRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));for(let xx=x;xx<x+w;xx+=8){g.fillRect(Math.round(xx),Math.round(y-1),1,3);g.fillRect(Math.round(xx),Math.round(y+h-1),1,3);}for(let yy=y;yy<y+h;yy+=8){g.fillRect(Math.round(x-1),Math.round(yy),3,1);g.fillRect(Math.round(x+w-1),Math.round(yy),3,1);}}
    function house(g,x,y,w,h,p,rot=0,variant=0){g.save();g.translate(x,y);g.rotate(rot);fence(g,-w*.78,-h*.78,w*1.56,h*1.56,p);g.fillStyle='rgba(0,0,0,.16)';g.fillRect(-w/2+3,-h/2+4,w,h);g.fillStyle=p.wall;g.fillRect(-w/2,-h/2,w,h);poly(g,[[-w*.55,-h*.24],[0,-h*.58],[w*.55,-h*.24],[w*.45,h*.16],[-w*.45,h*.16]],p.roof);g.fillStyle='rgba(255,240,205,.18)';for(let q=-w*.34;q<w*.34;q+=6)g.fillRect(Math.round(q),Math.round(-h*.25),1,Math.max(2,Math.round(h*.25)));g.fillStyle='#2c281f';g.fillRect(-3,Math.round(h*.09),6,Math.max(5,Math.round(h*.30)));g.fillStyle='#dbc98e';g.fillRect(Math.round(-w*.29),Math.round(-h*.05),5,4);g.fillRect(Math.round(w*.17),Math.round(-h*.05),5,4);if(variant%2===0){g.fillStyle=p.wood;g.fillRect(Math.round(w*.55),Math.round(-h*.18),6,5);g.fillRect(Math.round(w*.66),Math.round(-h*.10),5,5);}g.restore();}
    function waterRiver(g,s,p,w,h){if(!J.World.riverXAt||!s.map?.river)return;const rw=(s.map.river.width||46)*.52;g.beginPath();for(let y=-20;y<=h+20;y+=14){const x=J.World.riverXAt(s,y)-rw;y===-20?g.moveTo(x,y):g.lineTo(x,y);}for(let y=h+20;y>=-20;y-=14)g.lineTo(J.World.riverXAt(s,y)+rw,y);g.closePath();g.fillStyle=p.water;g.fill();for(let j=-2;j<=2;j++){g.strokeStyle='rgba(185,235,240,.25)';g.lineWidth=1;g.beginPath();for(let y=-10;y<=h+10;y+=24){const x=J.World.riverXAt(s,y)+j*8+Math.sin(y*.025+j)*2;y===-10?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}for(const b of s.map.bridges||[]){const x=J.World.riverXAt(s,b.y),bw=(s.map.river.width||46)+20;g.fillStyle=p.wood;g.fillRect(x-bw/2,b.y-5,bw,10);g.fillStyle='rgba(235,215,170,.30)';for(let xx=x-bw/2+4;xx<x+bw/2;xx+=7)g.fillRect(xx,b.y-5,2,10);}}
    function coast(g,w,h,p,side='left'){g.save();const flip=side==='right';g.translate(flip?w:0,0);g.scale(flip?-1:1,1);g.fillStyle=p.water;g.beginPath();g.moveTo(0,0);g.lineTo(w*.26,0);g.bezierCurveTo(w*.22,h*.18,w*.17,h*.35,w*.24,h*.52);g.bezierCurveTo(w*.30,h*.68,w*.19,h*.86,w*.28,h);g.lineTo(0,h);g.closePath();g.fill();g.strokeStyle=p.water2;g.lineWidth=2;for(let k=0;k<4;k++){const o=7+k*13;g.beginPath();g.moveTo(o,0);g.bezierCurveTo(w*.19,h*.20,w*.14,h*.39,w*.20,h*.54);g.bezierCurveTo(w*.26,h*.70,w*.16,h*.87,w*.24,h);g.stroke();}g.strokeStyle='rgba(240,247,228,.75)';g.lineWidth=2;g.beginPath();g.moveTo(w*.27,0);g.bezierCurveTo(w*.23,h*.18,w*.18,h*.35,w*.25,h*.52);g.bezierCurveTo(w*.31,h*.68,w*.20,h*.86,w*.29,h);g.stroke();g.restore();}
    function styleFor(i){return ['village','compound','river','coast','desertbase','beach','snowvillage','frozenbase','fortress'][((i%9)+9)%9];}
    function renderRichMap(s){
      if(!s?.staticCtx||!s?.map||!s?.scenario)return;const w=s.viewport.w,h=s.viewport.h,key=`698-${s.scenario.seed}-${w}-${h}`;if(s._v698MapKey===key)return;s._v698MapKey=key;
      const g=s.staticCtx,p=PAL[s.scenario.theme]||PAL.jungle,r=rng(s.scenario.seed),style=styleFor(s.scenario.index||0);g.save();g.clearRect(0,0,w,h);g.fillStyle=p.g;g.fillRect(0,0,w,h);
      /* large terrain regions */
      blob(g,w*.18,h*.16,w*.24,h*.10,p.g2,.42);blob(g,w*.76,h*.22,w*.28,h*.12,p.g3,.25);blob(g,w*.30,h*.72,w*.24,h*.10,p.g2,.18);blob(g,w*.82,h*.78,w*.22,h*.09,p.g2,.16);
      /* subtle terrain microtexture */
      g.fillStyle='rgba(255,248,220,.055)';for(let i=0;i<150;i++){const x=r()*w,y=r()*h;g.fillRect(Math.round(x),Math.round(y),1+(r()>.75?1:0),1);}
      g.fillStyle='rgba(28,35,26,.055)';for(let i=0;i<110;i++){const x=r()*w,y=r()*h;g.fillRect(Math.round(x),Math.round(y),2,1);}
      if(style==='coast'||style==='beach')coast(g,w,h,p,style==='beach'?'right':'left');else waterRiver(g,s,p,w,h);
      /* fields / clearings */
      for(let i=0;i<4;i++){const x=(.14+i*.22)*w,y=(.22+(i%2)*.24)*h;g.fillStyle=i%2?p.g3:p.sand;g.globalAlpha=.12;g.fillRect(x-35,y-22,70,44);g.globalAlpha=1;for(let q=0;q<7;q++){g.strokeStyle='rgba(70,65,48,.13)';g.beginPath();g.moveTo(x-31,y-18+q*6);g.lineTo(x+31,y-18+q*6);g.stroke();}}
      /* roads */
      const bx=s.bunker?.x||w*.5,by=s.bunker?.y||h*.84;road(g,[{x:w*.52,y:-10},{x:w*.50,y:h*.18},{x:w*.47,y:h*.36},{x:w*.52,y:h*.55},{x:bx,y:by-18}],p,12);
      road(g,[{x:w*.18,y:h*.30},{x:w*.34,y:h*.38},{x:w*.50,y:h*.43},{x:w*.73,y:h*.38}],p,6);
      if(style==='compound'||style==='desertbase'||style==='frozenbase'||style==='fortress')road(g,[{x:w*.65,y:h*.16},{x:w*.72,y:h*.32},{x:w*.70,y:h*.50}],p,7);
      /* compounds by layout */
      const layouts={
        village:[[.70,.20,56,34,.06],[.81,.31,62,38,-.05],[.68,.43,50,32,.03],[.82,.55,54,34,.02]],
        compound:[[.68,.18,64,38,0],[.81,.25,56,34,.05],[.72,.39,70,42,-.04],[.84,.50,54,34,.02]],
        river:[[.72,.18,54,34,.06],[.79,.35,62,38,-.04],[.69,.49,58,36,.02]],
        coast:[[.70,.18,60,36,0],[.81,.31,66,40,.04],[.71,.48,54,34,-.03]],
        desertbase:[[.66,.17,66,38,0],[.80,.25,70,42,.03],[.72,.43,76,44,-.04]],
        beach:[[.30,.20,54,34,.02],[.40,.34,62,38,-.03],[.31,.50,58,36,.04]],
        snowvillage:[[.69,.18,58,36,0],[.80,.31,60,36,.04],[.69,.47,66,40,-.02]],
        frozenbase:[[.66,.17,70,40,0],[.80,.26,66,38,.03],[.72,.44,76,44,-.02]],
        fortress:[[.66,.16,76,44,0],[.82,.25,66,40,.03],[.70,.44,82,46,-.03],[.84,.55,58,36,.02]]
      };
      const arr=layouts[style]||layouts.village;arr.forEach((a,i)=>house(g,a[0]*w,a[1]*h,a[2],a[3],p,a[4],i));
      /* actual gameplay buildings on top, so cover is visually trustworthy */
      const bs=Array.isArray(s.map.buildings)&&s.map.buildings.length?s.map.buildings:(s.map.building?[s.map.building]:[]);bs.forEach((b,i)=>house(g,b.x,b.y,Math.max(42,(b.w||40)*1.10),Math.max(28,(b.h||28)*1.08),p,b.rot||0,i+7));
      /* vegetation clusters */
      const dense=s.scenario.theme==='jungle';for(let i=0;i<(dense?46:24);i++){let x=r()*w,y=35+r()*(h-150);if(style==='coast'&&x<w*.31)x=w*.34+r()*w*.20;if(style==='beach'&&x>w*.68)x=w*.40+r()*w*.20;const rr=5+r()*7;tree(g,x,y,rr,p);}
      for(let i=0;i<(s.scenario.theme==='desert'?28:16);i++)rock(g,20+r()*(w-40),45+r()*(h-160),3+r()*5,p);
      /* props: crates + sandbags */
      for(let i=0;i<14;i++){const x=34+r()*(w-68),y=70+r()*(h-190);g.fillStyle=p.wood;g.fillRect(x,y,5,4);g.fillStyle='rgba(240,210,160,.20)';g.fillRect(x+1,y+1,3,1);}for(let i=0;i<8;i++){const x=50+r()*(w-100),y=90+r()*(h-210);g.fillStyle='rgba(100,83,56,.72)';for(let k=0;k<4;k++)blob(g,x+k*5,y+(k%2)*2,4,2,'rgba(100,83,56,.72)');}
      g.restore();
    }
    const oldResize=J.World.resize.bind(J.World);
    J.World.resize=function(s,c){oldResize(s,c);s._v698MapKey='';renderRichMap(s);};

    /* ----------------------------------------------------------
       5) HUD overlay with the gentler efficiency scale.
    ---------------------------------------------------------- */
    function hud(s,ctx){const {w,h,dpr}=s.viewport,top=s.safe?.top||0,bottom=s.safe?.bottom||0,hp=Math.max(0,Math.ceil(s.bunker?.hp||0)),eff=U.clamp(s._v698Eff??.75,0,1),kills=totalKills(s),map=(s.campaign?.index||0)+1,heat=U.clamp(s.bunker?.heat||0,0,1);ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);const ph=top+80;ctx.fillStyle='rgba(9,13,9,.95)';ctx.fillRect(0,0,w,ph);ctx.font='800 8px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textBaseline='top';ctx.fillStyle='#aeb7a2';ctx.textAlign='left';ctx.fillText('HP',12,top+7);ctx.textAlign='center';ctx.fillText(`MAP ${map}/9`,w/2,top+7);ctx.textAlign='right';ctx.fillText('KILLS',w-12,top+7);ctx.font='900 25px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillStyle=hp>50?'#edf0dc':hp>25?'#e5bd58':'#e06055';ctx.fillText(String(hp),12,top+40);ctx.textAlign='center';ctx.fillStyle=effColor(eff);ctx.fillText(`${Math.round(eff*100)}%`,w/2,top+40);ctx.textAlign='right';ctx.fillStyle='#edf0dc';ctx.fillText(String(kills),w-12,top+40);ctx.font='800 7px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textAlign='center';ctx.fillStyle='#aeb7a2';ctx.fillText('EFFICIENCY',w/2,top+50);const bx=12,by=top+58,bw=w-24,bh=10;ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle=effColor(eff);ctx.fillRect(bx,by,bw*eff,bh);for(const q of [.20,.50,.72,.88]){ctx.fillStyle='rgba(8,10,8,.65)';ctx.fillRect(Math.round(bx+bw*q),by,1,bh);}if(eff<.30&&!s._v698Failed){ctx.font='900 10px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.fillStyle=(Math.floor(performance.now()/240)%2)?'#ff735f':'#ffd06a';ctx.fillText('EFFICIENCY CRITICAL',w/2,top+76);}const bhud=bottom+37,yy=h-bhud;ctx.fillStyle='rgba(9,13,9,.93)';ctx.fillRect(0,yy,w,bhud);ctx.font='800 8px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#b9c0aa';ctx.fillText('HEAT',12,yy+16);ctx.textAlign='right';ctx.fillText(`${Math.round(heat*100)}%`,w-12,yy+16);const hx=48,hy=yy+12,hw=w-96;ctx.fillStyle='rgba(255,255,255,.09)';ctx.fillRect(hx,hy,hw,8);ctx.fillStyle=heat>.78?'#dc5949':heat>.56?'#df9844':'#a8bd62';ctx.fillRect(hx,hy,hw*heat,8);ctx.restore();}

    const oldRender=J.Render.render.bind(J.Render);
    J.Render.render=function(s,ctx){
      if(s){s._v696Failed=true;s._v696Eff=.75;s._v695EffFailed=true;s._v695Eff=.75;}
      updateEfficiency(s); renderRichMap(s); const out=oldRender(s,ctx); hud(s,ctx); return out;
    };

    const initial=()=>{const s=state(),c=document.getElementById('game');if(!s||!s.scenario||!c){setTimeout(initial,60);return;}tuneSpeed(s.scenario);resetEfficiency(s);if(s.mode==='brief'){s.map=null;J.World.resize(s,c);}const t=document.getElementById('title'),sub=document.getElementById('sub');if(t)t.textContent='AMIGA PIXEL V6.9.8';if(sub)sub.innerHTML='Rijkere handgemaakte maps, iets grotere sprites en meer tempo.<br><span>+5% sprite scale · +7–8% movement · mildere efficiency · 9 duidelijkere level-layouts</span>';};
    initial();console.info('JBD v6.9.8 active');
  };
  wait();
})();