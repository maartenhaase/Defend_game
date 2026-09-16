/* JBD v6.9.5 — faster opening, cleaner tactical maps, clean HUD + efficiency fail state */
(()=>{
  const wait=()=>{
    const J=window.JBD;
    if(!J||!J.Scenarios||!J.World||!J.Render||!J.Particles||!J.Scale||!J.CONFIG){setTimeout(wait,35);return;}
    if(J.__v695)return;J.__v695=true;
    const U=J.U,C=J.CONFIG;
    const oldApply=J.Scenarios.apply.bind(J.Scenarios);
    const oldAdvance=J.Scenarios.advance.bind(J.Scenarios);
    const oldResize=J.World.resize.bind(J.World);
    const oldRender=J.Render.render.bind(J.Render);
    const oldEmit=J.Particles.emit?.bind(J.Particles);
    const state=()=>window.__JBD_STATE__||null;
    const canvas=()=>document.getElementById('game');

    function tuneScenario(q){
      if(!q)return q;
      q.demo=false;
      q.spawnDuration=Math.max(6.6,(q.spawnDuration||10)*.78);
      q.vehicleSpeedMult=(q.vehicleSpeedMult||1)*1.16;
      q.infantrySpeedMult=(q.infantrySpeedMult||1)*1.10;
      q.vegetation=Math.min(q.vegetation||1,.82);
      if(q.cycle===1&&q.index===0){
        Object.assign(q,{label:'JUNGLE 1 · CONVOY CONTACT',actionStyle:'CONVOY CONTACT',demo:false,infantryCount:6,spawnDuration:7.2,artilleryCount:0,airborneCount:0,airborneStart:99,helicopterEnabled:false,helicopterStart:99,mobileArtilleryCount:0,mobileArtilleryStart:99,enemyDamageMult:.90,enemyFireRateMult:.92,enemyHpMult:.96,vehicleSpeedMult:1.52,infantrySpeedMult:1.18,villageCount:3,trenches:2,vegetation:.56,openness:1.10});
        q.vehicleSchedule=[
          {time:.9,type:'truck',lane:-.20,convoy:true,model:0,role:'cargo',scheme:'olive'},
          {time:2.1,type:'truck',lane:-.20,convoy:true,model:1,role:'troop',scheme:'olive'},
          {time:3.3,type:'truck',lane:-.20,convoy:true,model:2,role:'supply',scheme:'darkOlive'}
        ];
      }else if(q.cycle===1&&q.index===1){
        Object.assign(q,{label:'JUNGLE 2 · VILLAGE PUSH',actionStyle:'VILLAGE PUSH',infantryCount:8,spawnDuration:7.8,artilleryCount:1,airborneCount:0,mobileArtilleryCount:0,mobileArtilleryStart:99,vehicleSpeedMult:1.34,infantrySpeedMult:1.16,vegetation:.65});
        q.vehicleSchedule=[
          {time:1.4,type:'truck',lane:-.16,convoy:true,model:1,role:'troop'},
          {time:3.1,type:'truck',lane:-.16,convoy:true,model:2,role:'supply'},
          {time:5.2,type:'technical',lane:.18,model:1,role:'recon'}
        ];
      }else if(q.cycle===1&&q.index===2){
        Object.assign(q,{label:'JUNGLE 3 · RIVER ASSAULT',actionStyle:'RIVER ASSAULT',infantryCount:10,spawnDuration:8.4,artilleryCount:2,airborneCount:0,mobileArtilleryCount:0,mobileArtilleryStart:99,vehicleSpeedMult:1.28,infantrySpeedMult:1.15});
        q.vehicleSchedule=[
          {time:1.6,type:'truck',lane:-.15,convoy:true,model:1,role:'troop'},
          {time:3.0,type:'truck',lane:-.15,convoy:true,model:2,role:'supply'},
          {time:4.7,type:'technical',lane:.17,model:0,role:'recon'},
          {time:7.0,type:'halftrack',lane:-.08,model:1,role:'escort'}
        ];
      }
      return q;
    }

    J.Scenarios.apply=function(s,index=s.campaign.index,cycle=s.campaign.cycle){const out=oldApply(s,index,cycle);tuneScenario(s.scenario);resetEfficiency(s);return out;};
    J.Scenarios.advance=function(s){const out=oldAdvance(s);tuneScenario(s.scenario);resetEfficiency(s);return out;};

    if(oldEmit){
      J.Particles.emit=function(s,kind,x,y,count,opts={}){
        const k=String(kind||'').toLowerCase();
        if(k.includes('smoke')&&!k.includes('muzzle'))count=Math.max(0,Math.round((count||0)*.22));
        if(k.includes('dirt')||k.includes('dust')||k.includes('soil')||k.includes('ash'))count=Math.max(0,Math.round((count||0)*.20));
        if(count<=0)return;
        if(k.includes('smoke')||k.includes('dust')||k.includes('dirt'))opts={...opts,life:Math.min(opts.life??.45,.45),size:Math.min(opts.size??2,2.2)};
        return oldEmit(s,kind,x,y,count,opts);
      };
    }

    const PAL={
      jungle:{ground:'#78895b',ground2:'#64764b',edge:'#35452e',path:'#9b8e67',pathEdge:'#665e46',water:'#347c94',water2:'#6ab7c8',roof:'#9a7650',wall:'#755d42',wood:'#5c472f',tree:'#3e5936',tree2:'#5e7448',rock:'#777761',sand:'#a6956c'},
      desert:{ground:'#c1ad7b',ground2:'#aa9667',edge:'#746749',path:'#d0b884',pathEdge:'#9c875f',water:'#4b9cb4',water2:'#84d0df',roof:'#a77e55',wall:'#b08c62',wood:'#75583b',tree:'#7f8650',tree2:'#a0a36b',rock:'#8d816b',sand:'#d0bb88'},
      polar:{ground:'#cbd3ce',ground2:'#b4c0bc',edge:'#73817d',path:'#dce0db',pathEdge:'#a3ada8',water:'#6fa6bd',water2:'#acd7e3',roof:'#969084',wall:'#aaa69a',wood:'#716c63',tree:'#657972',tree2:'#879991',rock:'#8e989a',sand:'#cfd3cd'}
    };
    const poly=(g,pts,fill,stroke=null)=>{g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.stroke();}};
    function pixelPatch(g,x,y,w,h,c1,c2){g.fillStyle=c1;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));g.fillStyle=c2;for(let yy=2;yy<h;yy+=7)for(let xx=((yy/7)&1)?3:1;xx<w;xx+=9)g.fillRect(Math.round(x+xx),Math.round(y+yy),2,1);}
    function road(g,pts,p,width=10){if(!pts||pts.length<2)return;g.save();g.lineCap='round';g.lineJoin='round';g.strokeStyle=p.pathEdge;g.lineWidth=width+4;g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.stroke();g.strokeStyle=p.path;g.lineWidth=width;g.stroke();g.strokeStyle='rgba(255,245,205,.18)';g.lineWidth=1;g.stroke();g.restore();}
    function river(g,s,p,w,h){if(!s.map?.river||!J.World.riverXAt)return;const rw=(s.map.river.width||46)*.5;g.save();const draw=(off)=>{g.beginPath();for(let y=-20;y<=h+20;y+=14){const x=J.World.riverXAt(s,y)+off;y===-20?g.moveTo(x,y):g.lineTo(x,y);}};draw(0);g.strokeStyle=p.edge;g.lineWidth=rw*2+8;g.stroke();draw(0);g.strokeStyle=p.water;g.lineWidth=rw*2;g.stroke();for(let i=-1;i<=1;i++){draw(i*rw*.42);g.strokeStyle='rgba(160,225,235,.28)';g.lineWidth=1;g.stroke();}g.restore();for(const b of s.map.bridges||[]){const x=J.World.riverXAt(s,b.y),bw=(s.map.river.width||46)+18;g.fillStyle=p.wood;g.fillRect(Math.round(x-bw/2),Math.round(b.y-5),Math.round(bw),10);g.fillStyle='rgba(235,210,155,.30)';for(let xx=x-bw/2+4;xx<x+bw/2;xx+=7)g.fillRect(Math.round(xx),Math.round(b.y-5),2,10);}}
    function buildingList(s){if(Array.isArray(s.map?.buildings)&&s.map.buildings.length)return s.map.buildings;if(s.map?.building)return[s.map.building];return[];}
    function building(g,s,b,p,i){const sc=(J.Scale.terrain?.(s,b.y)||1)*1.30,w=(b.w||54)*sc,h=(b.h||38)*sc;g.save();g.translate(Math.round(b.x),Math.round(b.y));g.rotate(b.rot||0);const yardW=w*1.55,yardH=h*1.55;g.strokeStyle='rgba(72,58,39,.58)';g.lineWidth=1;g.strokeRect(-yardW/2,-yardH/2,yardW,yardH);for(let x=-yardW/2;x<yardW/2;x+=7){g.fillStyle=p.wood;g.fillRect(Math.round(x),Math.round(-yardH/2),1,3);g.fillRect(Math.round(x),Math.round(yardH/2-2),1,3);}g.fillStyle='rgba(0,0,0,.17)';g.fillRect(-w/2+3,-h/2+4,w,h);g.fillStyle=p.wall;g.fillRect(-w/2,-h/2,w,h);g.fillStyle=p.roof;poly(g,[[-w*.54,-h*.32],[0,-h*.62],[w*.54,-h*.32],[w*.45,h*.18],[-w*.45,h*.18]],p.roof,'rgba(51,42,31,.55)');g.fillStyle='rgba(255,235,190,.20)';for(let x=-w*.38;x<w*.38;x+=6)g.fillRect(Math.round(x),Math.round(-h*.31),1,Math.max(2,Math.round(h*.32)));g.fillStyle='#2d281f';g.fillRect(-3,Math.round(h*.12),6,Math.max(5,Math.round(h*.32)));g.fillStyle='#d9c58b';g.fillRect(Math.round(-w*.31),Math.round(-h*.05),5,4);g.fillRect(Math.round(w*.18),Math.round(-h*.05),5,4);if(i%2===0){g.fillStyle=p.wood;g.fillRect(Math.round(w*.58),Math.round(-h*.25),6,6);g.fillRect(Math.round(w*.68),Math.round(-h*.18),5,5);}g.restore();}
    function trees(g,s,p,w,h){const obs=s.map?.naturalObstacles||s.map?.vegetation||[];let n=0;for(let i=0;i<obs.length&&n<26;i+=Math.max(1,Math.floor(obs.length/24))){const o=obs[i];if(!o||!Number.isFinite(o.x)||!Number.isFinite(o.y))continue;const x=o.x,y=o.y,r=Math.max(5,Math.min(12,(o.radius||8)*(o.scale||1)*.55));g.fillStyle='rgba(0,0,0,.10)';poly(g,[[x-r+2,y+2],[x-r*.35,y-r*.7+2],[x+r*.5,y-r*.55+2],[x+r+2,y+2],[x+r*.2,y+r*.7+2],[x-r*.6,y+r*.55+2]],'rgba(0,0,0,.10)');poly(g,[[x-r,y],[x-r*.35,y-r*.72],[x+r*.5,y-r*.58],[x+r,y],[x+r*.15,y+r*.7],[x-r*.6,y+r*.55]],p.tree);g.fillStyle=p.tree2;g.fillRect(Math.round(x-r*.30),Math.round(y-r*.45),Math.max(2,Math.round(r*.45)),2);n++;}}
    function rocks(g,s,p){const arr=s.map?.rocks||s.map?.naturalObstacles||[];let n=0;for(let i=0;i<arr.length&&n<18;i+=Math.max(1,Math.floor(arr.length/18))){const o=arr[i];if(!o||!Number.isFinite(o.x)||!Number.isFinite(o.y))continue;if(o.kind&&!(String(o.kind).includes('rock')||String(o.kind).includes('boulder')))continue;const r=Math.max(3,Math.min(8,o.radius||o.rx||5));poly(g,[[o.x-r,o.y+1],[o.x-r*.45,o.y-r*.6],[o.x+r*.35,o.y-r*.5],[o.x+r,o.y],[o.x+r*.35,o.y+r*.55],[o.x-r*.55,o.y+r*.4]],p.rock,'rgba(45,45,39,.35)');n++;}}
    function repaint(s){if(!s?.staticCtx||!s?.staticCanvas||!s?.map||!s?.scenario)return;const w=s.viewport.w,h=s.viewport.h,key=`v695-${s.scenario.seed}-${w}-${h}`;if(s._v695PaintKey===key)return;s._v695PaintKey=key;const g=s.staticCtx,p=PAL[s.scenario.theme]||PAL.jungle;g.save();g.clearRect(0,0,w,h);g.fillStyle=p.ground;g.fillRect(0,0,w,h);pixelPatch(g,0,0,w,h,p.ground,'rgba(255,255,220,.035)');g.fillStyle=p.ground2;g.globalAlpha=.22;g.fillRect(0,0,w,h*.16);g.fillRect(0,h*.74,w,h*.26);g.globalAlpha=1;for(const r of s.map.roads||[])road(g,r,p,s.scenario.theme==='desert'?13:10);river(g,s,p,w,h);const bs=buildingList(s);for(let i=0;i<bs.length;i++)building(g,s,bs[i],p,i);trees(g,s,p,w,h);rocks(g,s,p);for(const t of s.map.trenches||[]){const sc=(J.Scale.terrain?.(s,t.y)||1)*1.1;g.save();g.translate(t.x,t.y);g.rotate(t.angle||0);g.strokeStyle='#3e3428';g.lineWidth=Math.max(3,7*sc);g.beginPath();g.moveTo(-(t.len||28)*sc/2,0);g.lineTo((t.len||28)*sc/2,0);g.stroke();g.strokeStyle='#92704a';g.lineWidth=1;g.stroke();g.restore();}g.restore();}

    J.World.resize=function(s,c){oldResize(s,c);s._v695PaintKey='';repaint(s);};

    function resetEfficiency(s){if(!s)return;s._v695Eff=.75;s._v695EffSeed=s.scenario?.seed??0;s._v695EffFailed=false;s._v695LastEffTs=performance.now();}
    function effTarget(s){const tr=Math.max(0,s.stats?.triggers||0),ok=Math.max(0,s.stats?.effectiveTriggers||0);return U.clamp((15+ok)/(20+tr),0,1);}
    function effColor(v){return v>=.85?'#55c878':v>=.70?'#a8c95b':v>=.50?'#d5c653':v>=.30?'#dc8b3f':'#d54c43';}
    function updateEfficiency(s){if(!s)return;if(s._v695EffSeed!==s.scenario?.seed)resetEfficiency(s);const now=performance.now(),dt=Math.min(.25,Math.max(0,(now-(s._v695LastEffTs||now))/1000));s._v695LastEffTs=now;if(s.mode==='playing'&&!s.levelComplete&&!s._v695EffFailed){const target=effTarget(s);const k=1-Math.exp(-2.0*dt);s._v695Eff=U.clamp((s._v695Eff??.75)+(target-(s._v695Eff??.75))*k,0,1);if(s._v695Eff<.25){s._v695EffFailed=true;s.ui=s.ui||{};s.ui.message='EFFICIENCY LOST';s.ui.messageT=2;s.bunker.hp=0;setTimeout(()=>{const title=document.getElementById('title'),sub=document.getElementById('sub');if(title)title.textContent='EFFICIENCY LOST';if(sub)sub.innerHTML=`Efficiency zakte naar ${Math.round((s._v695Eff||0)*100)}%.<br><span>Te veel verspilde acties — probeer gerichter te vuren.</span>`;},120);}}}

    function cleanHud(s,ctx){const {w,h,dpr}=s.viewport,top=s.safe?.top||0,bottom=s.safe?.bottom||0,eff=U.clamp(s._v695Eff??.75,0,1),hp=Math.max(0,Math.ceil(s.bunker?.hp||0)),kills=(s.stats?.kills||0)+(s.stats?.vehicleKills||0)+(s.stats?.airKills||0),map=Math.max(1,(s.campaign?.index||0)+1),heat=U.clamp(s.bunker?.heat||0,0,1);ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;
      const topH=top+82;ctx.fillStyle='rgba(13,17,12,.90)';ctx.fillRect(0,0,w,topH);ctx.fillStyle='#eef0dc';ctx.textBaseline='top';ctx.font='800 9px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.fillText('HP',12,top+8);ctx.textAlign='right';ctx.fillText('KILLS',w-12,top+8);ctx.textAlign='center';ctx.fillStyle='#b7bea5';ctx.fillText(`MAP ${map}/9`,w/2,top+8);
      ctx.textBaseline='alphabetic';ctx.font='900 25px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textAlign='left';ctx.fillStyle=hp>50?'#edf0db':hp>25?'#e0b858':'#df6356';ctx.fillText(String(hp),12,top+39);ctx.textAlign='right';ctx.fillStyle='#edf0db';ctx.fillText(String(kills),w-12,top+39);
      const by=top+49,bx=12,bw=w-24,bh=19;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle=effColor(eff);ctx.fillRect(bx+2,by+2,Math.max(0,(bw-4)*eff),bh-4);ctx.strokeStyle='rgba(255,255,255,.16)';ctx.strokeRect(bx+.5,by+.5,bw-1,bh-1);for(const q of [.25,.5,.75,.85]){const x=bx+bw*q;ctx.fillStyle='rgba(15,17,13,.55)';ctx.fillRect(Math.round(x),by+2,1,bh-4);}ctx.font='900 10px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#11150f';ctx.fillText('EFFICIENCY',bx+6,by+bh/2+.5);ctx.textAlign='right';ctx.fillText(`${Math.round(eff*100)}%`,bx+bw-6,by+bh/2+.5);
      const botH=bottom+55,botY=h-botH;ctx.fillStyle='rgba(13,17,12,.90)';ctx.fillRect(0,botY,w,botH);const heatY=botY+8,heatX=12,heatW=w-24;ctx.font='800 8px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillStyle='#c7ccb4';ctx.fillText(s.bunker?.heatLocked?'OVERHEAT':'HEAT',heatX,heatY);ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(heatX,heatY+13,heatW,7);ctx.fillStyle=heat>.78?'#d95b48':heat>.55?'#d89343':'#b6c267';ctx.fillRect(heatX,heatY+13,heatW*heat,7);ctx.font='800 8px ui-monospace,SFMono-Regular,Menlo,monospace';ctx.fillStyle='#aeb59f';ctx.textAlign='left';ctx.fillText('BURST',heatX,heatY+27);ctx.textAlign='center';ctx.fillText('AP',w/2,heatY+27);ctx.textAlign='right';ctx.fillText('HE',w-heatX,heatY+27);ctx.restore();}

    J.Render.render=function(s,ctx){updateEfficiency(s);repaint(s);const out=oldRender(s,ctx);cleanHud(s,ctx);return out;};

    const initial=()=>{const s=state(),c=canvas();if(!s||!s.scenario||!c){setTimeout(initial,60);return;}tuneScenario(s.scenario);resetEfficiency(s);if(s.mode==='brief'){s.map=null;J.World.resize(s,c);}const title=document.getElementById('title'),sub=document.getElementById('sub');if(title)title.textContent='AMIGA PIXEL V6.9.5';if(sub)sub.innerHTML='Snellere campaign met cleaner tactical maps.<br><span>Map 1 start direct met 3 trucks · efficiency start op 75% · rood = einde run</span>';};initial();
    console.info('JBD v6.9.5 map/speed/HUD patch active');
  };
  wait();
})();