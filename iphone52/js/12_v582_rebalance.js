// JBD v5.8.2 // MOBILE REBALANCE — cleaner HUD, balanced lanes, civilian/bunker damage feedback
(() => {
'use strict';

const V581=window.__JBD581||{};
const neutrals=V581.neutrals||[];
let bunkerFlash=0;

// Hard-hide the large left-side upgrade panel and any legacy tooltip/threat cards.
const style=document.createElement('style');
style.textContent=`#upgradeViz,#targetCard,#tip,#threat57{display:none!important;visibility:hidden!important;pointer-events:none!important}`;
document.head.appendChild(style);
function quietPanels(){for(const id of ['upgradeViz','targetCard','tip','threat57']){const el=$(id);if(el){el.hidden=true;el.style.display='none'}}}

// Better obstacle distribution: readable lanes, cover on both left/right and no giant empty half-map.
function rebalanceScenery(){
  if(typeof TRENCHES!=='undefined'){
    TRENCHES.length=0;
    [
      {a:-3,s:-31,w:10.5},{a:-1,s:29,w:10.5},
      {a:16,s:-13,w:11.5},{a:19,s:15,w:11},
      {a:38,s:-32,w:11.5},{a:42,s:30,w:11.5}
    ].forEach(t=>TRENCHES.push(t));
  }
  if(typeof BUILDING!=='undefined'){
    BUILDING.a=rnd(18,32); BUILDING.s=(Math.random()<.5?-1:1)*rnd(22,31);
  }
  if(typeof FOLIAGE!=='undefined'){
    FOLIAGE.length=0;
    const slots=[
      [-44,-34],[-43,34],[-31,-14],[-30,15],[-18,-36],[-17,35],[-8,-20],[-6,21],
      [5,-38],[6,37],[12,-5],[13,7],[25,-31],[26,31],[34,-14],[35,15],
      [47,-37],[48,36],[55,-21],[56,22],[63,-6],[64,8]
    ];
    for(const [a,s] of slots){const xy=xyFromAS(a,s);FOLIAGE.push({x:xy.x,y:xy.y,kind:Math.random()<.28?'palm':Math.random()<.58?'bamboo':'bush',size:rnd(.68,1.06)})}
  }
}
rebalanceScenery();

// Preserve lanes so infantry no longer visually collapses to the same left/centre route.
const _spawn582=spawn;
spawn=function(type,lane=0,opts={}){
  const e=_spawn582(type,lane,opts);
  if(!e.vehicle&&!e.fort)e.laneHome=clamp(e.s+rnd(-4,4),-38,38);
  return e;
};
const _movementTarget582=movementTarget;
movementTarget=function(e){
  const t=_movementTarget582(e);
  if(!e.vehicle&&!e.fort&&t&&!t.vehicle&&!t.river&&!t.cover&&!t.fireEvade&&!e.coverTarget){
    const home=e.laneHome??e.s;
    t.s=clamp(home*.72+e.s*.28,-40,40);
  }
  return t;
};

// Civilians should appear mainly south of the river (between river and bunker).
function pushCivilianSouth(n){
  if(!n||n.kind!=='civilian'||n._southPlaced)return;
  if((n.t||0)<.18){
    const southEdge=RIVER.a+RIVER.half+8;
    n.a=rnd(Math.max(southEdge,2),42);
    const side=Math.random()<.5?-1:1;
    n.s=side*rnd(11,40);
    n.ta=rnd(62,80);
    n.ts=-side*rnd(8,32);
    n._southPlaced=true;
  }
}

// Stronger visual feedback when bunker is hit.
const _damageBunker582=damageBunker;
damageBunker=function(dmg){
  const hp0=state.hp,arm0=state.armor;
  _damageBunker582(dmg);
  const real=Math.max(1,Math.round((hp0-state.hp)+(arm0-state.armor)));
  bunkerFlash=Math.min(1,bunkerFlash+.42+real*.016);
  floater(77,rnd(-5,5),`-${real}`,'#ff615b');
};

const _updateUI582=updateUI;
updateUI=function(){_updateUI582();quietPanels()};

const _startWave582=startWave;
startWave=function(){
  rebalanceScenery();
  _startWave582();
  quietPanels();
  const h=document.querySelector('header strong');
  if(h)h.textContent=`JBD // 5.8.2 // ${['JUNGLE','POLAR','DESERT'][(Math.max(1,state.wave)-1)%3]} ${Math.max(1,state.wave)}`;
};

const _update582=update;
update=function(dt){
  _update582(dt);
  quietPanels();
  bunkerFlash=Math.max(0,bunkerFlash-dt*1.65);
  for(const n of neutrals){
    pushCivilianSouth(n);
    // Existing collision code applies the supply penalty. Add the missing painful visual feedback once.
    if(!n.alive&&!n._redPenaltyShown){
      n._redPenaltyShown=true;
      const fine=n.kind==='untruck'?65:35;
      floater(n.a,n.s,`-${fine} SUP`,'#ff615b');
      state.fx.push({kind:'spark',a:n.a,s:n.s,t:0,life:.45});
    }
  }
};

// Draw red bunker damage haze after the full scene so the hit reads instantly.
const _draw582=draw;
draw=function(){
  _draw582();
  if(bunkerFlash>0){
    ctx.save();
    const a=Math.min(.25,bunkerFlash*.25);
    const g=ctx.createRadialGradient(W*.5,H*.52,Math.min(W,H)*.12,W*.5,H*.52,Math.max(W,H)*.70);
    g.addColorStop(0,`rgba(170,25,25,${a*.18})`);g.addColorStop(1,`rgba(210,35,35,${a})`);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();
  }
};

quietPanels();resize();updateUI();
window.__JBD582={rebalanceScenery,get bunkerFlash(){return bunkerFlash}};
})();
