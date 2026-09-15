(()=>{
  const wait=()=>{
    const J=window.JBD;if(!J||!J.Render||!J.World||!J.Particles||!J.CONFIG){setTimeout(wait,25);return;}
    if(J.__v692)return;J.__v692=true;const C=J.CONFIG;
    C.render.mobileMaxDpr=Math.min(C.render.mobileMaxDpr,1.25);C.render.maxDpr=Math.min(C.render.maxDpr,1.50);C.render.particles=Math.min(C.render.particles,440);C.render.bullets=Math.min(C.render.bullets,128);
    if(J.Sprites){J.Sprites.stand=[];J.Sprites.walk=[];J.Sprites.fire=[];J.Sprites.crouch=[];J.Sprites.prone=[];J.Sprites.swim=[];}
    const shrinkPool=s=>{if(s?.particles?.length>440){const live=s.particles.filter(p=>p.active).slice(0,440),dead=Array.from({length:Math.max(0,440-live.length)},()=>({active:false}));s.particles=[...live,...dead];s.particleCursor=0;}};
    const oldPInit=J.Particles.init;J.Particles.init=function(s){const old=C.render.particles;C.render.particles=innerWidth<=520?440:560;oldPInit(s);C.render.particles=old;};
    function downsampleLayers(s){if(!s?.staticCanvas||!s?.damageCanvas)return;const w=s.viewport.w,h=s.viewport.h;if(s.staticCanvas.width===w&&s.staticCanvas.height===h&&s.damageCanvas.width===w&&s.damageCanvas.height===h)return;for(const [key,ctxKey] of [['staticCanvas','staticCtx'],['damageCanvas','damageCtx']]){const old=s[key],c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{alpha:true});g.imageSmoothingEnabled=false;g.drawImage(old,0,0,w,h);g.setTransform(1,0,0,1,0,0);s[key]=c;s[ctxKey]=g;}s.layerDpr=1;}
    const oldResize=J.World.resize;J.World.resize=function(s,canvas){oldResize(s,canvas);if(s.viewport.w<=520)downsampleLayers(s);shrinkPool(s);};
    const oldRender=J.Render.render,visible=(o,w,h,m=100)=>o&&o.x>-m&&o.x<w+m&&o.y>-m&&o.y<h+m;
    J.Render.render=function(s,ctx){const w=s.viewport.w,h=s.viewport.h,refs={};for(const k of ['enemies','vehicles','vehicleShots','enemyTracers','artilleryShells','bullets','explosions'])refs[k]=s[k];s.enemies=refs.enemies.filter(o=>visible(o,w,h,90)||o.inBuilding);s.vehicles=refs.vehicles.filter(o=>visible(o,w,h,140)||o.state==='DESTROYED');s.vehicleShots=refs.vehicleShots.filter(o=>visible(o,w,h,120));s.enemyTracers=refs.enemyTracers.filter(o=>visible({x:o.x1,y:o.y1},w,h,160)||visible({x:o.x2,y:o.y2},w,h,160));s.artilleryShells=refs.artilleryShells.filter(o=>visible({x:o.x??o.sx,y:o.y??o.sy},w,h,180));s.bullets=refs.bullets.filter(o=>!o.active||visible(o,w,h,100));s.explosions=refs.explosions.filter(o=>visible(o,w,h,160));try{return oldRender(s,ctx);}finally{for(const k of Object.keys(refs))s[k]=refs[k];}};
    const s=window.__JBD_STATE__,canvas=document.getElementById('game');if(s&&canvas){if(s.viewport?.w<=520){oldResize(s,canvas);downsampleLayers(s);}shrinkPool(s);}
    console.info('JBD v6.9.2 optimization patch active');
  };wait();
})();