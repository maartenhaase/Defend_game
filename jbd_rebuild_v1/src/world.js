(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;

  function resize(s,canvas){
    const vv=window.visualViewport,w=Math.max(320,Math.floor(vv?vv.width:innerWidth)),h=Math.max(520,Math.floor(vv?vv.height:innerHeight));
    const dpr=Math.min(w<=520?C.render.mobileMaxDpr:C.render.maxDpr,devicePixelRatio||1);
    const probe=document.getElementById('safeProbe'),cs=probe?getComputedStyle(probe):null;
    s.safe={top:cs?parseFloat(cs.paddingTop)||0:0,bottom:cs?parseFloat(cs.paddingBottom)||0:0};
    s.viewport={w,h,dpr};canvas.style.width=w+'px';canvas.style.height=h+'px';canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    s.battlefield.top=s.safe.top;s.battlefield.bottom=h-s.safe.bottom-82;s.bunker.x=w*.5;s.bunker.y=h-s.safe.bottom-C.bunker.yPadding;
    s.input.x=w*.5;s.input.y=h*.45;buildLayers(s);
  }

  function generateMap(s){
    const {w,h}=s.viewport,sc=s.scenario||J.Scenarios.get(0,1),r=U.mulberry32(sc.seed^0x51f15e);
    const riverWidth=sc.theme==='jungle'?46:sc.theme==='desert'?38:50;
    const map={
      theme:sc.theme,river:{baseX:w*sc.riverBase,width:riverWidth,amp:w*(sc.theme==='jungle'?.075:sc.theme==='desert'?.045:.06),phase:r()*5.2,freq:1.45+r()*.35},
      bridges:sc.bridgeRatios.map((q,i)=>({id:i,y:h*q,halfH:11,width:riverWidth+25})),
      building:null,trenches:[],vegetation:[],rocks:[],roads:[]
    };
    const bunkerRiver=riverXRaw(map,s.bunker.y),safeGap=riverWidth*.5+46,delta=bunkerRiver-w*.5;
    if(Math.abs(delta)<safeGap){const dir=sc.riverBase>=.5?1:-1;map.river.baseX=U.clamp(map.river.baseX+dir*(safeGap-Math.abs(delta)+8),w*.17,w*.83);}
    const bRight=sc.buildingSide>.5,bx=bRight?w*.76:w*.24,by=h*(.40+r()*.12);
    map.building={x:bx,y:by,w:54+r()*12,h:38+r()*8,rot:(r()-.5)*.10};
    for(let i=0;i<sc.trenches;i++){
      let x,y,tries=0;do{x=36+r()*(w-72);y=h*(.23+r()*.46);tries++;}while(tries<18&&Math.abs(x-riverXRaw(map,y))<riverWidth*.85);
      map.trenches.push({x,y,len:24+r()*28,angle:(r()-.5)*.36});
    }
    const vegCount=Math.round((sc.theme==='jungle'?58:sc.theme==='desert'?18:28)*sc.vegetation);
    for(let i=0;i<vegCount;i++){
      let x,y,tries=0;do{x=10+r()*(w-20);y=44+r()*(h-180);tries++;}while(tries<12&&Math.abs(x-riverXRaw(map,y))<riverWidth*.74);
      map.vegetation.push({x,y,scale:.45+r()*.75,kind:sc.theme==='desert'?(r()<.28?'scrub':'rock'):sc.theme==='polar'?(r()<.58?'pine':'rock'):'shrub'});
    }
    const rockCount=sc.theme==='desert'?34:sc.theme==='polar'?24:18;
    for(let i=0;i<rockCount;i++){
      let x=18+r()*(w-36),y=52+r()*(h-190);if(Math.abs(x-riverXRaw(map,y))<riverWidth*.72)x=U.clamp(x+(x<w*.5?-1:1)*riverWidth,16,w-16);
      map.rocks.push({x,y,rx:2+r()*5,ry:1.5+r()*3,rot:r()*3});
    }
    const topX=w*(.18+r()*.64),bridgeA=map.bridges[0],bridgeB=map.bridges[1];
    map.roads=[
      [{x:topX,y:-20},{x:riverXRaw(map,bridgeA.y),y:bridgeA.y},{x:w*.46,y:h*.47},{x:w*.5,y:s.bunker.y-52}],
      [{x:w*(1-sc.riverBase),y:-20},{x:riverXRaw(map,bridgeB.y),y:bridgeB.y},{x:w*.57,y:h*.71},{x:w*.5,y:s.bunker.y-52}]
    ];
    s.map=map;return map;
  }

  function riverXRaw(map,y){return map.river.baseX+Math.sin((y/Math.max(1,innerHeight||844))*Math.PI*map.river.freq+map.river.phase)*map.river.amp;}
  function riverXAt(s,y){const m=s.map;if(!m)return s.viewport.w*.5;return m.river.baseX+Math.sin((y/Math.max(1,s.viewport.h))*Math.PI*m.river.freq+m.river.phase)*m.river.amp;}
  function onBridge(s,y){return !!s.map?.bridges.some(b=>Math.abs(y-b.y)<=b.halfH+3);}
  function isInWater(s,x,y){if(!s.map||onBridge(s,y))return false;return Math.abs(x-riverXAt(s,y))<s.map.river.width*.5;}
  function waterSpeed(s,x,y){return isInWater(s,x,y)?.46:1;}

  function buildLayers(s){
    const {w,h,dpr}=s.viewport;
    for(const key of ['staticCanvas','damageCanvas']){const c=document.createElement('canvas');c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);s[key]=c;s[key==='staticCanvas'?'staticCtx':'damageCtx']=g;}
    generateMap(s);drawMap(s);rebuildStaticCover(s);
  }

  function palette(theme){
    if(theme==='desert')return {top:'#a98955',mid:'#b79a68',bot:'#92794f',mottleA:'rgba(100,70,38,.09)',mottleB:'rgba(242,220,157,.07)',road:'rgba(105,76,45,.24)',water:'#446d67',waterEdge:'#324f49'};
    if(theme==='polar')return {top:'#b9c6c5',mid:'#d8dcce',bot:'#a7b1ac',mottleA:'rgba(70,87,88,.08)',mottleB:'rgba(255,255,255,.20)',road:'rgba(78,83,80,.16)',water:'#779ea5',waterEdge:'#4f747b'};
    return {top:'#52633d',mid:'#717553',bot:'#555a3f',mottleA:'rgba(37,48,30,.11)',mottleB:'rgba(228,218,159,.055)',road:'rgba(80,66,44,.24)',water:'#355f56',waterEdge:'#29483f'};
  }

  function drawMap(s){
    const g=s.staticCtx,{w,h}=s.viewport,m=s.map,r=U.mulberry32(s.scenario.seed^0x991),p=palette(m.theme);
    const grad=g.createLinearGradient(0,0,0,h);grad.addColorStop(0,p.top);grad.addColorStop(.55,p.mid);grad.addColorStop(1,p.bot);g.fillStyle=grad;g.fillRect(0,0,w,h);
    const dots=m.theme==='jungle'?420:m.theme==='desert'?260:320;
    for(let i=0;i<dots;i++){const x=r()*w,y=r()*h,rr=1+r()*(m.theme==='polar'?8:10);g.fillStyle=r()>.48?p.mottleA:p.mottleB;g.beginPath();g.arc(x,y,rr,0,6.28);g.fill();}

    drawRiver(g,s,p);drawRoads(g,s,p);drawTrenches(g,s);drawBuilding(g,s);drawVegetation(g,s);drawRocks(g,s);drawBridges(g,s);
  }

  function drawRiver(g,s,p){
    const {h}=s.viewport,m=s.map;g.save();g.lineCap='round';g.lineJoin='round';
    const path=()=>{g.beginPath();for(let y=-30;y<=h+30;y+=18){const x=riverXAt(s,y);y===-30?g.moveTo(x,y):g.lineTo(x,y);}};
    path();g.strokeStyle=p.waterEdge;g.lineWidth=m.river.width+9;g.stroke();path();g.strokeStyle=p.water;g.lineWidth=m.river.width;g.stroke();
    if(m.theme==='polar'){path();g.strokeStyle='rgba(225,242,241,.28)';g.lineWidth=m.river.width*.58;g.stroke();}
    else{path();g.strokeStyle='rgba(211,235,208,.08)';g.lineWidth=3;g.stroke();}
    g.restore();
  }

  function drawRoads(g,s,p){
    g.save();g.lineCap='round';for(const road of s.map.roads){g.strokeStyle=p.road;g.lineWidth=s.map.theme==='jungle'?32:42;g.beginPath();g.moveTo(road[0].x,road[0].y);for(let i=1;i<road.length;i++){const a=road[i-1],b=road[i],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;g.quadraticCurveTo(a.x,a.y,mx,my);if(i===road.length-1)g.quadraticCurveTo(mx,my,b.x,b.y);}g.stroke();g.strokeStyle='rgba(235,220,176,.08)';g.lineWidth=2;g.stroke();}g.restore();
  }

  function drawBridges(g,s){
    for(const b of s.map.bridges){const x=riverXAt(s,b.y),w=s.map.river.width+24;g.save();g.translate(x,b.y);g.fillStyle=s.map.theme==='polar'?'#777d79':'#6d583b';g.strokeStyle='rgba(31,30,25,.65)';g.lineWidth=2;g.fillRect(-w/2,-9,w,18);g.strokeRect(-w/2,-9,w,18);g.strokeStyle='rgba(225,211,170,.25)';g.lineWidth=1;for(let xx=-w/2+6;xx<w/2;xx+=8){g.beginPath();g.moveTo(xx,-8);g.lineTo(xx,8);g.stroke();}g.restore();}
  }

  function drawBuilding(g,s){
    const b=s.map.building;g.save();g.translate(b.x,b.y);g.rotate(b.rot);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-b.w*.48+4,-b.h*.45+7,b.w,b.h);g.fillStyle=s.map.theme==='desert'?'#9c8059':s.map.theme==='polar'?'#7f8783':'#62634a';g.strokeStyle='#36372f';g.lineWidth=2;g.fillRect(-b.w/2,-b.h/2,b.w,b.h);g.strokeRect(-b.w/2,-b.h/2,b.w,b.h);g.fillStyle=s.map.theme==='polar'?'#555e5d':'#493e31';g.fillRect(-b.w*.12,-b.h/2,b.w*.24,b.h);g.fillStyle='rgba(22,26,23,.75)';g.fillRect(-b.w*.38,-b.h*.18,8,10);g.fillRect(b.w*.25,-b.h*.18,8,10);g.restore();
  }

  function drawTrenches(g,s){
    for(const t of s.map.trenches){g.save();g.translate(t.x,t.y);g.rotate(t.angle);g.lineCap='round';g.strokeStyle='rgba(42,35,28,.72)';g.lineWidth=9;g.beginPath();g.moveTo(-t.len/2,0);g.lineTo(t.len/2,0);g.stroke();g.strokeStyle=s.map.theme==='polar'?'rgba(113,104,90,.65)':'rgba(126,93,53,.68)';g.lineWidth=3;g.stroke();g.restore();}
  }

  function drawVegetation(g,s){
    const shrub=(o)=>{g.save();g.translate(o.x,o.y);g.scale(o.scale,o.scale);if(o.kind==='pine'){g.fillStyle='#344d43';g.strokeStyle='#23362f';g.beginPath();g.moveTo(0,-15);g.lineTo(-9,8);g.lineTo(9,8);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(0,-8);g.lineTo(-12,13);g.lineTo(12,13);g.closePath();g.fill();g.stroke();}
      else if(o.kind==='scrub'){g.strokeStyle='#6a6346';g.lineWidth=2;for(let k=0;k<5;k++){const a=k*.92;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*10,Math.sin(a)*6);g.stroke();}}
      else if(o.kind==='rock'){g.fillStyle=s.map.theme==='polar'?'#707b7b':'#655742';g.beginPath();g.ellipse(0,0,8,5,.2,0,6.28);g.fill();}
      else{g.fillStyle='#2b422a';g.strokeStyle='#1d2d1f';g.lineWidth=1;for(let k=0;k<7;k++){const a=k/7*6.28;g.beginPath();g.ellipse(Math.cos(a)*8,Math.sin(a)*5,7,3,a,0,6.28);g.fill();g.stroke();}g.fillStyle='#52633b';g.beginPath();g.arc(0,0,4,0,6.28);g.fill();}g.restore();};
    for(const o of s.map.vegetation)shrub(o);
  }
  function drawRocks(g,s){for(const o of s.map.rocks){g.fillStyle=s.map.theme==='polar'?'rgba(78,91,92,.52)':'rgba(64,54,42,.47)';g.beginPath();g.ellipse(o.x,o.y,o.rx,o.ry,o.rot,0,6.28);g.fill();}}

  function rebuildStaticCover(s){
    s.cover=s.cover.filter(c=>!c.staticMap);let id=1;const add=(x,y,radius,strength,type)=>s.cover.push({id:100000+id++,x,y,radius,coverStrength:strength,occupiedBy:null,danger:0,age:0,staticMap:true,type});
    const b=s.map.building;add(b.x-b.w*.35,b.y+b.h*.35,16,.88,'building');add(b.x+b.w*.35,b.y+b.h*.35,16,.88,'building');
    for(const t of s.map.trenches)add(t.x,t.y,Math.min(22,t.len*.42),.80,'trench');
    const stride=s.map.theme==='jungle'?5:s.map.theme==='desert'?12:9;for(let i=0;i<s.map.vegetation.length;i+=stride){const o=s.map.vegetation[i];add(o.x,o.y,10+o.scale*5,s.map.theme==='jungle'?.58:.46,'terrain');}
  }

  function pickSpawnX(s,r=s.rng){
    for(let i=0;i<18;i++){const x=26+r()*(s.viewport.w-52),y=28;if(!isInWater(s,x,y))return x;}return s.viewport.w*.5;
  }
  function randomGroundPoint(s,r=s.rng,minY=58,maxY=null){
    const top=minY,bottom=maxY??(s.bunker.y-95);for(let i=0;i<30;i++){const x=24+r()*(s.viewport.w-48),y=top+r()*Math.max(20,bottom-top);if(!isInWater(s,x,y)&&Math.hypot(x-s.map.building.x,y-s.map.building.y)>34)return {x,y};}return {x:s.viewport.w*.5,y:(top+bottom)*.5};
  }

  function vehicleWaypoint(s,v,fallbackX,fallbackY){
    if(!s.map||v.departing)return {x:v.departing?v.x:fallbackX,y:fallbackY};
    if(v.riverStage==null){
      const spawnRiver=riverXAt(s,0),targetRiver=riverXAt(s,s.bunker.y),spawnSide=Math.sign(v.spawnX-spawnRiver)||-1,targetSide=Math.sign(s.bunker.x-targetRiver)||1;
      v.riverSpawnSide=spawnSide;v.riverTargetSide=targetSide;
      if(spawnSide===targetSide)v.riverStage=2;else{v.riverStage=0;const pick=v.lane>=0?1:0;v.bridgeY=s.map.bridges[pick].y;}
    }
    if(v.riverStage===2)return {x:fallbackX,y:fallbackY};
    const by=v.bridgeY,rx=riverXAt(s,by),edge=s.map.river.width*.5+13;
    if(v.riverStage===0){const x=rx+v.riverSpawnSide*edge,y=by;if(Math.hypot(v.x-x,v.y-y)<16)v.riverStage=1;return {x,y};}
    const x=rx+v.riverTargetSide*edge,y=by;if(Math.hypot(v.x-x,v.y-y)<16)v.riverStage=2;return {x,y};
  }

  function crater(s,x,y,radius,seed){
    const g=s.damageCtx,r=U.mulberry32(seed),n=15,pts=[];for(let i=0;i<n;i++){const a=i/n*6.28,rr=radius*(.82+r()*.38);pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.72]);}
    g.save();g.lineJoin='round';g.fillStyle='rgba(56,43,27,.55)';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();g.strokeStyle='rgba(120,96,54,.7)';g.lineWidth=5;g.stroke();g.fillStyle='rgba(26,25,20,.8)';g.beginPath();for(let i=0;i<n;i++){const a=i/n*6.28,rr=radius*(.52+r()*.14),px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.68;i?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.fill();g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x+radius*.12,y+radius*.2,radius*.46,radius*.23,.1,0,6.28);g.fill();for(let i=0;i<8;i++){const a=r()*6.28,rr=radius*(.65+r()*.75);g.fillStyle='rgba(79,57,31,.7)';g.beginPath();g.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.65,1+r()*2.4,0,6.28);g.fill();}g.restore();
    const node={id:s.cover.length+1,x,y,radius:radius*.78,coverStrength:.72,occupiedBy:null,danger:0,age:0};s.cover.push(node);return node;
  }
  function bloodMark(s,x,y,amount=1){const g=s.damageCtx;g.save();g.fillStyle='rgba(91,18,15,.55)';for(let i=0;i<5*amount;i++){const a=Math.random()*6.28,d=Math.random()*13*amount,rr=.9+Math.random()*2.4;g.beginPath();g.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d,rr,rr*.55,a,0,6.28);g.fill();}g.restore();}
  function scorchMark(s,x,y,radius=18,intensity=1){const g=s.damageCtx,r=U.mulberry32(U.hash((x*17+y*23+s.simTime*900)|0));g.save();g.translate(x,y);g.rotate(r()*6.28);g.globalCompositeOperation='multiply';for(let ring=0;ring<3;ring++){const n=11,rr=radius*(.55+ring*.18),alpha=(.10+intensity*.055)*(1-ring*.2);g.fillStyle=`rgba(31,28,22,${alpha})`;g.beginPath();for(let i=0;i<n;i++){const a=i/n*6.28,rad=rr*(.72+r()*.45),px=Math.cos(a)*rad,py=Math.sin(a)*rad*.72;i?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.fill();}g.restore();}
  function soilImpact(s,x,y,heavy=false){const g=s.damageCtx;g.save();g.fillStyle=heavy?'rgba(37,33,25,.42)':'rgba(49,43,31,.28)';g.beginPath();g.ellipse(x,y,heavy?5:2.5,heavy?2.4:1.2,Math.random()*3,0,6.28);g.fill();g.restore();}

  J.World={resize,crater,bloodMark,scorchMark,soilImpact,riverXAt,isInWater,waterSpeed,pickSpawnX,randomGroundPoint,vehicleWaypoint};
})();
