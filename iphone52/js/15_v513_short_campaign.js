// JBD v5.13 // SHORT CAMPAIGN — 3 Jungle, 3 Desert, 3 Polar
(()=>{
'use strict';
if(typeof state==='undefined') return;

const THEMES=[
  {id:'jungle',name:'JUNGLE',ground:'#476844',overlay:'rgba(24,72,34,.20)',foliage:50,trench:5},
  {id:'desert',name:'DESERT',ground:'#9a8156',overlay:'rgba(182,132,66,.30)',foliage:24,trench:3},
  {id:'polar',name:'POLAR',ground:'#aebdba',overlay:'rgba(211,229,230,.38)',foliage:18,trench:2}
];
let current=THEMES[0], subLevel=1, cycle=1;
const BUILDING513=(window.__JBD55&&window.__JBD55.BUILDING)||null;

function campaignInfo(n){
  n=Math.max(1,n|0);
  const pos=(n-1)%9;
  const themeIndex=Math.floor(pos/3);
  return {theme:THEMES[themeIndex],sub:pos%3+1,cycle:Math.floor((n-1)/9)+1};
}
function applyCampaignInfo(n){
  const info=campaignInfo(n);current=info.theme;subLevel=info.sub;cycle=info.cycle;
  document.body.dataset.theme=current.id;
  return info;
}
function randomLane(){return rnd(-35,35)}

function shortWave(n){
  const {theme,sub,cycle}=campaignInfo(n);
  const q=[];
  const bump=cycle>1 && sub===3;
  if(theme.id==='jungle'){
    q.push(mkPhase(1,'SCOUT CONTACT',2));
    q.push({type:'technical',lane:randomLane()});
    q.push({type:'motorcycle',lane:randomLane()});
    if(sub>=2)q.push({type:'truck',lane:randomLane()});
    q.push(mkPhase(2,'RIVER PUSH',3));
    q.push({type:sub===3?'halftrack':'truck',lane:randomLane()});
    q.push({type:'stug',lane:randomLane()});
    q.push(mkPhase(3,'LAST PUSH',3));
    q.push({type:'engineertruck',lane:randomLane()});
    if(sub>=2)q.push({type:'technical',lane:randomLane()});
    if(bump)q.push({type:'tank',lane:randomLane()});
  }else if(theme.id==='desert'){
    q.push(mkPhase(1,'FAST RAID',2));
    q.push({type:'motorcycle',lane:randomLane()});
    q.push({type:'technical',lane:randomLane()});
    if(sub>=2)q.push({type:'motorcycle',lane:randomLane()});
    q.push(mkPhase(2,'OPEN GROUND',3));
    q.push({type:'truck',lane:randomLane()});
    q.push({type:sub===1?'technical':'halftrack',lane:randomLane()});
    q.push(mkPhase(3,'ARMORED FINISH',3));
    q.push({type:'stug',lane:randomLane()});
    if(sub>=2)q.push({type:'technical',lane:randomLane()});
    if(sub===3||bump)q.push({type:'tank',lane:randomLane()});
  }else{
    q.push(mkPhase(1,'COLD FRONT',2));
    q.push({type:'halftrack',lane:randomLane()});
    q.push({type:'motorcycle',lane:randomLane()});
    q.push(mkPhase(2,'ICE CONVOY',3));
    q.push({type:'truck',lane:randomLane()});
    q.push({type:sub>=2?'apc':'technical',lane:randomLane()});
    q.push(mkPhase(3,'HEAVY CONTACT',3));
    q.push({type:'stug',lane:randomLane()});
    if(sub>=2)q.push({type:'engineertruck',lane:randomLane()});
    if(sub===3||bump)q.push({type:'tank',lane:randomLane()});
  }
  return q;
}
buildWave=shortWave;
previewWave=n=>{
  const q=shortWave(n);
  return {inf:0,armor:q.filter(x=>x.type&&DEF[x.type]?.vehicle).length,eng:q.some(x=>x.type==='engineertruck')?1:0};
};

function rebuildLevel(n){
  const {theme}=applyCampaignInfo(n);
  state.craters.length=0;
  RIVER.a=rnd(-22,-10);
  RIVER.half=theme.id==='polar'?6.6:rnd(5.2,6.2);
  const left=rnd(-37,-16), right=rnd(16,37);
  RIVER.bridges=[left,right];
  RIVER.bridgeHalf=theme.id==='polar'?5.8:4.8+rnd(0,.7);
  if(BUILDING513){BUILDING513.a=rnd(4,42);BUILDING513.s=(Math.random()<.5?-1:1)*rnd(20,38)}
  if(typeof TRENCHES!=='undefined'){
    TRENCHES.length=0;
    const bands=[[-36,-18],[-10,8],[16,34],[40,58]];
    for(let i=0;i<theme.trench;i++){
      const band=bands[i%bands.length];
      const s=(i%2?1:-1)*rnd(9,38);
      TRENCHES.push({a:rnd(band[0],band[1]),s,w:rnd(8,12)});
    }
  }
  if(typeof FOLIAGE!=='undefined'){
    FOLIAGE.length=0;
    const cols=theme.id==='jungle'?7:theme.id==='desert'?5:4;
    const rows=Math.ceil(theme.foliage/cols);
    let made=0;
    for(let r=0;r<rows && made<theme.foliage;r++){
      for(let c=0;c<cols && made<theme.foliage;c++){
        const a=-78+r*(142/Math.max(1,rows-1))+rnd(-6,6);
        const s=-43+c*(86/Math.max(1,cols-1))+rnd(-5,5);
        const nearBridge=RIVER.bridges.some(b=>Math.abs(a-RIVER.a)<16&&Math.abs(s-b)<9);
        const nearBunker=a>62&&Math.abs(s)<15;
        if(nearBridge||nearBunker)continue;
        const xy=xyFromAS(a,s);
        FOLIAGE.push({x:xy.x,y:xy.y,kind:theme.id==='jungle'?(Math.random()<.28?'palm':Math.random()<.62?'bamboo':'bush'):'bush',size:rnd(.68,1.08)});
        made++;
      }
    }
  }
}

const oldStart513=startWave;
startWave=function(){
  const next=state.wave+1;
  rebuildLevel(next);
  oldStart513();
  applyCampaignInfo(state.wave);
  state.spawnClock=.12;
  const h=document.querySelector('header strong');
  if(h)h.textContent=`JBD // 5.13 // ${current.name} ${subLevel}/3`;
  $('msg').textContent=`LEVEL ${state.wave} · ${current.name} ${subLevel}/3`;
  updateUI();
};

const oldUI513=updateUI;
updateUI=function(){
  oldUI513();
  applyCampaignInfo(Math.max(1,state.wave||1));
  const h=document.querySelector('header strong');
  if(h)h.textContent=`JBD // 5.13 // ${current.name} ${subLevel}/3`;
  const phase=$('phase');
  if(phase&&state.phase==='wave')phase.textContent=`${state.phaseIndex}/3`;
};

drawPlant=function(f){
  const p=isoXY(f.x,f.y),s=f.size*(PORTRAIT?.55:.82);
  ctx.save();ctx.translate(p.x,p.y);
  if(current.id==='jungle'){
    ellipse(2,6,8*s,3*s,'#14261a66');
    if(f.kind==='palm'){
      line(0,7,2,-17*s,2.4*s,'#604a31');
      for(let i=0;i<6;i++){const a=-2.5+i*.9;line(2,-17*s,2+Math.cos(a)*13*s,-17*s+Math.sin(a)*6*s,1.6*s,i%2?'#345b3c':'#486d48')}
    }else if(f.kind==='bamboo'){
      for(let i=-1;i<=1;i++){line(i*3,6,i*2,-15*s-rnd(0,4),1.35*s,'#36583c');ellipse(i*2-2,-6-i,4*s,1.6*s,'#577d52')}
    }else{
      for(let i=0;i<6;i++){const a=i*1.05;ellipse(Math.cos(a)*5*s,Math.sin(a)*2.5*s-2,5*s,2.7*s,i%2?'#35543a':'#4b7048')}
    }
  }else if(current.id==='desert'){
    ellipse(0,5,6*s,2*s,'#5c432833');
    if(Math.abs(Math.sin(f.x*9.1+f.y*3.7))>.45){
      line(0,5,0,-10*s,2*s,'#59623d');line(0,-3*s,5*s,-7*s,1.7*s,'#59623d');line(0,0,-4*s,-3*s,1.7*s,'#59623d');
    }else for(let i=0;i<4;i++)line(0,4,Math.cos(i*1.7)*6*s,-1-Math.sin(i)*2*s,1.5*s,'#77754a');
  }else{
    if(Math.abs(Math.sin(f.x*8.3+f.y*5.2))>.34){
      line(0,5,0,-13*s,1.6*s,'#53635e');
      poly([[0,-15*s],[-7*s,-2*s],[7*s,-2*s]],'#718a81','#465751',.8);
      poly([[0,-10*s],[-8*s,3*s],[8*s,3*s]],'#82998f','#465751',.8);
      ellipse(0,5,8*s,2*s,'#edf4f0aa');
    }else ellipse(0,4,7*s,2*s,'#e8f0ed99');
  }
  ctx.restore();
};

drawGround=function(){
  const palette=current.id==='jungle'
    ?{bg1:'#203725',bg2:'#58714e',field:'#55714d',edge:'#2a402f',road:'#755d41',road2:'#8c714d'}
    :current.id==='desert'
      ?{bg1:'#5a4630',bg2:'#a88b58',field:'#a58b5e',edge:'#5f4a31',road:'#795d3e',road2:'#a47c4b'}
      :{bg1:'#6e8080',bg2:'#c5d0ce',field:'#b8c6c2',edge:'#72817f',road:'#6e7168',road2:'#92958c'};
  const grd=ctx.createLinearGradient(0,0,0,H);grd.addColorStop(0,palette.bg1);grd.addColorStop(.58,palette.bg2);grd.addColorStop(1,palette.edge);ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  const c1=isoAS(WORLD.aMin+4,WORLD.sMin+4),c2=isoAS(WORLD.aMin+4,WORLD.sMax-4),c3=isoAS(WORLD.aMax-3,WORLD.sMax-4),c4=isoAS(WORLD.aMax-3,WORLD.sMin+4);
  poly([[c1.x,c1.y],[c2.x,c2.y],[c3.x,c3.y],[c4.x,c4.y]],palette.field,'#31443a',1.4);
  ctx.save();ctx.globalAlpha=current.id==='polar'?.10:.08;
  for(let a=-96;a<=78;a+=12){const p1=isoAS(a,-50),p2=isoAS(a,50);line(p1.x,p1.y,p2.x,p2.y,.7,current.id==='polar'?'#ffffff':'#e1d9b6')}
  for(let s=-48;s<=48;s+=12){const p1=isoAS(-100,s),p2=isoAS(82,s);line(p1.x,p1.y,p2.x,p2.y,.7,current.id==='polar'?'#7a8c8a':'#26392d')}
  ctx.restore();
  drawRiver();
  const road=(pts,w=9)=>{ctx.save();ctx.lineCap='round';ctx.strokeStyle=palette.road;ctx.lineWidth=w+5;ctx.globalAlpha=.68;ctx.beginPath();let p=isoAS(pts[0][0],pts[0][1]);ctx.moveTo(p.x,p.y);for(const q of pts.slice(1)){p=isoAS(q[0],q[1]);ctx.lineTo(p.x,p.y)}ctx.stroke();ctx.strokeStyle=palette.road2;ctx.lineWidth=w;ctx.globalAlpha=.52;ctx.stroke();ctx.restore()};
  const b1=RIVER.bridges[0],b2=RIVER.bridges[1],west=RIVER.a-RIVER.half-2,east=RIVER.a+RIVER.half+2;
  road([[WORLD.aMin+4,-34],[-65,-30],[west,b1],[east,b1],[20,-15],[76,-4]],8);
  road([[WORLD.aMin+4,34],[-65,30],[west,b2],[east,b2],[20,15],[76,4]],8);
  if(current.id==='polar'){ctx.save();ctx.globalAlpha=.32;for(let i=0;i<13;i++){const p=isoAS(-82+i*11,(-1)**i*rnd(10,42));ellipse(p.x,p.y,rnd(5,12),rnd(1,2.6),'#f4f8f6')}ctx.restore()}
  if(current.id==='desert'){ctx.save();ctx.globalAlpha=.20;for(let i=0;i<10;i++){const p=isoAS(-80+i*14,rnd(-42,42));ellipse(p.x,p.y,rnd(4,11),rnd(1,2.4),'#dfb978')}ctx.restore()}
  const v=ctx.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.18,W*.5,H*.5,Math.max(W,H)*.78);v.addColorStop(0,'#0000');v.addColorStop(1,'#07100ba8');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
};

const oldUpdate513=update;
update=function(dt){
  oldUpdate513(dt);
  const api=window.__JBD512;
  if(api&&api.PLANES){for(const pl of api.PLANES)if(pl.drops>=3)pl.drops=5}
};

const oldFinish513=finishWave;
finishWave=function(){
  oldFinish513();
  const info=campaignInfo(state.wave);
  const next=campaignInfo(state.wave+1);
  const btn=$('nextBtn');
  if(btn)btn.textContent=`NEXT LEVEL · ${next.theme.name} ${next.sub}/3`;
  $('msg').textContent=`LEVEL CLEAR · ${info.theme.name} ${info.sub}/3`;
};

rebuildLevel(1);
applyCampaignInfo(1);
updateUI();
window.__JBD513={campaignInfo,rebuildLevel};
})();