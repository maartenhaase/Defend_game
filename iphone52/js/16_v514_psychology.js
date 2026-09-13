// JBD v5.14 // EVIDENCE-INFORMED ENGAGEMENT PASS
(()=>{
'use strict';
if(typeof state==='undefined') return;

const ranks={S:{bonus:12,dir:1.07},A:{bonus:8,dir:1.04},B:{bonus:4,dir:1.00},C:{bonus:0,dir:.96}};
let levelStartHP=state.hp,levelElapsed=0,levelKills=0,levelHits=0,levelTotal=1;
let lastRank='B',director=1,airEventDone=false;
const hitRings=[];

function campaignInfo514(n){
  n=Math.max(1,n|0);
  const pos=(n-1)%9,themeIndex=Math.floor(pos/3);
  return {
    theme:['JUNGLE','DESERT','POLAR'][themeIndex],
    sub:pos%3+1,
    cycle:Math.floor((n-1)/9)+1
  };
}
function ensureHud(){
  let el=$('psych514');
  if(el)return el;
  el=document.createElement('div');
  el.id='psych514';
  el.style.cssText='position:absolute;left:7px;right:7px;top:6px;height:22px;z-index:8;pointer-events:none;font:800 7px ui-monospace,monospace;color:#efe9d5;text-shadow:0 1px 2px #0008';
  el.innerHTML='<div id="psychLine" style="display:flex;align-items:center;gap:6px"><span id="psychBiome"></span><span id="psychPips" style="letter-spacing:2px"></span><span style="flex:1;height:4px;background:#10171388;border:1px solid #56635b;border-radius:4px;overflow:hidden"><span id="psychProgress" style="display:block;height:100%;width:0;background:#d8d0a4"></span></span><span id="psychRank"></span></div>';
  $('wrap').appendChild(el);
  return el;
}
function updatePsychHud(){
  ensureHud();
  const ci=campaignInfo514(Math.max(1,state.wave||1));
  const remaining=state.enemies.filter(e=>e.hp>0).length+state.queue.filter(x=>!x.phase).length;
  const prog=state.phase==='wave'?clamp(1-remaining/Math.max(1,levelTotal),0,1):0;
  $('psychBiome').textContent=ci.theme;
  $('psychPips').textContent=[1,2,3].map(i=>i<=ci.sub?'●':'○').join('');
  $('psychProgress').style.width=`${Math.round(prog*100)}%`;
  $('psychRank').textContent=state.phase==='wave'?'':`RANK ${lastRank}`;
}
function levelRank(){
  const hpLoss=clamp((levelStartHP-state.hp)/Math.max(1,state.maxhp),0,1);
  let score=100-hpLoss*75;
  if(levelElapsed>95)score-=Math.min(12,(levelElapsed-95)*.18);
  if(levelElapsed<70)score+=4;
  score+=Math.min(8,levelKills*.75);
  return score>=92?'S':score>=80?'A':score>=65?'B':'C';
}
function nextDirector(rank){
  return ranks[rank]?.dir||1;
}

// Flow-style adaptation: modest, visible in feel but never enough to invalidate mastery.
const oldSpawn514=spawn;
spawn=function(type,lane=0,opts={}){
  const e=oldSpawn514(type,lane,opts);
  const ci=campaignInfo514(Math.max(1,state.wave||1));
  const subScale=1+(ci.sub-1)*.025;
  const biomeScale=ci.theme==='DESERT'?(e.vehicle?1.05:1):ci.theme==='POLAR'?(e.heavy?1.04:.98):1;
  e.speed*=director*subScale*biomeScale;
  if(e.vehicle&&ci.sub===3&&(['stug','tank','apc'].includes(type))){
    const hpScale=1.06+(ci.cycle-1)*.02;
    e.maxhp*=hpScale;e.hp*=hpScale;e.elite513=true;
  }
  return e;
};

const oldDamageEnemy514=damageEnemy;
damageEnemy=function(e,ammo,base,a=e.a,s=e.s){
  const before=e.hp;
  oldDamageEnemy514(e,ammo,base,a,s);
  if(before>e.hp){
    levelHits++;
    hitRings.push({a:e.a,s:e.s,t:0,life:.22,strong:ammo!=='mg'});
    if(hitRings.length>16)hitRings.shift();
  }
};

const oldKill514=killEnemy;
killEnemy=function(e,ammo,cls){
  if(e.hp>-999)levelKills++;
  oldKill514(e,ammo,cls);
};

const oldStart514=startWave;
startWave=function(){
  oldStart514();
  levelStartHP=state.hp;levelElapsed=0;levelKills=0;levelHits=0;airEventDone=false;
  levelTotal=Math.max(1,state.enemies.filter(e=>e.hp>0).length+state.queue.filter(x=>!x.phase).length);
  const ci=campaignInfo514(state.wave);
  $('msg').textContent=`${ci.theme} ${ci.sub}/3 · DEFEND`;
  const shopTitle=$('shop')?.querySelector('h3');
  if(shopTitle)shopTitle.textContent='BUNKER / WEAPON UPGRADES';
  updatePsychHud();
};

// Cleaner short-level economy + performance grade.
finishWave=function(){
  const ci=campaignInfo514(state.wave);
  const rank=levelRank();lastRank=rank;
  const base=8+ci.sub*3+Math.min(6,(ci.cycle-1)*2);
  const rankBonus=ranks[rank].bonus;
  const biomeBonus=ci.sub===3?8:0;
  state.supply+=base+rankBonus+biomeBonus;
  state.phase='shop';
  director=nextDirector(rank);

  showPanel($('shop'));
  const title=$('shop')?.querySelector('h3');
  if(title)title.textContent=`LEVEL CLEAR · RANK ${rank}`;
  const next=campaignInfo514(state.wave+1);
  const btn=$('nextBtn');
  if(btn)btn.textContent=`NEXT · ${next.theme} ${next.sub}/3`;
  $('msg').textContent=`${rank} · +${base+rankBonus+biomeBonus} SUP${ci.sub===3?' · BIOME CLEAR':''}`;
  updateUI();updatePsychHud();
};

// Tension curve: calm opening -> build -> climax, without simply flooding the screen.
const oldUpdate514=update;
update=function(dt){
  oldUpdate514(dt);
  for(const r of hitRings)r.t+=dt;
  for(let i=hitRings.length-1;i>=0;i--)if(hitRings[i].t>=hitRings[i].life)hitRings.splice(i,1);

  if(state.phase==='wave'){
    levelElapsed+=dt;
    const alive=state.enemies.filter(e=>e.hp>0).length;
    const queued=state.queue.filter(x=>!x.phase).length;

    // Remove dead time, but preserve readable opening seconds.
    if(levelElapsed>8&&queued>0&&alive<=2)state.spawnClock=Math.min(state.spawnClock,.16);
    if(levelElapsed>24&&queued>0)state.spawnClock-=dt*.08*director;
    if(levelElapsed>42&&queued>0)state.spawnClock-=dt*.12*director;

    // One authored surprise on levels 2/3: enough novelty without infantry spam.
    const ci=campaignInfo514(state.wave);
    if(!airEventDone&&ci.sub>=2&&levelElapsed>14&&window.__JBD512?.spawnPlane){
      window.__JBD512.spawnPlane();
      airEventDone=true;
    }
  }
  updatePsychHud();
};

const oldDraw514=draw;
draw=function(){
  oldDraw514();
  ctx.save();
  for(const r of hitRings){
    const p=isoAS(r.a,r.s),u=r.t/r.life;
    ctx.globalAlpha=1-u;
    ctx.strokeStyle=r.strong?'#e7c460':'#e8ead8';
    ctx.lineWidth=r.strong?1.8:1;
    ctx.beginPath();ctx.arc(p.x,p.y,3+u*(r.strong?11:7),0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
};

// Small, competence-oriented end-of-biome payoff: visible upgrade recommendation, not a forced choice.
const oldUI514=updateUI;
updateUI=function(){
  oldUI514();
  updatePsychHud();
  if(state.phase==='shop'){
    const ci=campaignInfo514(state.wave);
    const msg=$('msg');
    if(msg&&ci.sub===3&&!msg.textContent.includes('BIOME CLEAR'))msg.textContent+=' · BIOME CLEAR';
  }
};

ensureHud();
updatePsychHud();
window.__JBD514={campaignInfo514};
})();