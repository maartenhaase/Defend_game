(() => {
  const J=window.JBD, C=J.CONFIG, U=J.U;
  function resize(s,canvas){
    const vv=window.visualViewport; const w=Math.max(320,Math.floor(vv?vv.width:innerWidth)),h=Math.max(520,Math.floor(vv?vv.height:innerHeight)); const dpr=Math.min(C.render.maxDpr,devicePixelRatio||1);
    const probe=document.getElementById('safeProbe'); const cs=probe?getComputedStyle(probe):null; s.safe={top:cs?parseFloat(cs.paddingTop)||0:0,bottom:cs?parseFloat(cs.paddingBottom)||0:0};
    s.viewport={w,h,dpr}; canvas.style.width=w+'px';canvas.style.height=h+'px';canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    s.battlefield.top=s.safe.top;s.battlefield.bottom=h-s.safe.bottom-82;s.bunker.x=w*.5;s.bunker.y=h-s.safe.bottom-C.bunker.yPadding;
    s.input.x=w*.5;s.input.y=h*.45;
    buildLayers(s);
  }
  function buildLayers(s){
    const {w,h,dpr}=s.viewport; for(const key of ['staticCanvas','damageCanvas']){const c=document.createElement('canvas');c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);s[key]=c;s[key==='staticCanvas'?'staticCtx':'damageCtx']=g;}
    drawJungle(s);
  }
  function drawJungle(s){const g=s.staticCtx,{w,h}=s.viewport,r=U.mulberry32(s.seed);
    const grad=g.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#606944');grad.addColorStop(.55,'#777453');grad.addColorStop(1,'#5f5c42');g.fillStyle=grad;g.fillRect(0,0,w,h);
    // mottled ground
    for(let i=0;i<420;i++){const x=r()*w,y=r()*h,rr=2+r()*10;g.fillStyle=r()>.5?'rgba(45,51,31,.09)':'rgba(231,218,160,.06)';g.beginPath();g.arc(x,y,rr,0,6.28);g.fill();}
    // central churned lane
    g.strokeStyle='rgba(84,72,48,.22)';g.lineWidth=Math.max(50,w*.18);g.lineCap='round';g.beginPath();g.moveTo(w*.5,-20);g.bezierCurveTo(w*.42,h*.28,w*.58,h*.50,w*.50,h*.86);g.stroke();
    // vegetation clusters at edges
    const shrub=(x,y,sc)=>{g.save();g.translate(x,y);g.scale(sc,sc);g.fillStyle='#293b27';g.strokeStyle='#1c2a1e';g.lineWidth=1;for(let k=0;k<7;k++){const a=k/7*6.28,rx=Math.cos(a)*9,ry=Math.sin(a)*5;g.beginPath();g.ellipse(rx,ry,8,3,a,0,6.28);g.fill();g.stroke();}g.fillStyle='#4f6035';g.beginPath();g.arc(0,0,5,0,6.28);g.fill();g.restore();};
    for(let i=0;i<75;i++){const side=r()<.5?0:1,x=side?r()*(w*.18)+w*.82:r()*w*.18,y=r()*(h-120),sc=.55+r()*.75;shrub(x,y,sc);} 
    // scattered stones/roots
    for(let i=0;i<28;i++){const x=w*.18+r()*w*.64,y=35+r()*(h-170);g.fillStyle='rgba(49,47,36,.45)';g.beginPath();g.ellipse(x,y,3+r()*5,2+r()*3,r()*3,0,6.28);g.fill();}
  }
  function crater(s,x,y,radius,seed){ const g=s.damageCtx,r=U.mulberry32(seed),n=15; const pts=[];for(let i=0;i<n;i++){const a=i/n*6.28,rr=radius*(.82+r()*.38);pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.72]);}
    g.save();g.lineJoin='round';g.fillStyle='rgba(56,43,27,.55)';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();
    g.strokeStyle='rgba(120,96,54,.7)';g.lineWidth=5;g.stroke(); g.fillStyle='rgba(26,25,20,.8)';g.beginPath();for(let i=0;i<n;i++){const a=i/n*6.28,rr=radius*(.52+r()*.14);const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.68;i?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.fill();
    g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x+radius*.12,y+radius*.2,radius*.46,radius*.23,.1,0,6.28);g.fill();
    for(let i=0;i<8;i++){const a=r()*6.28,rr=radius*(.65+r()*.75);g.fillStyle='rgba(79,57,31,.7)';g.beginPath();g.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.65,1+r()*2.4,0,6.28);g.fill();}g.restore();
    const node={id:s.cover.length+1,x,y,radius:radius*.78,coverStrength:.58,occupiedBy:null,danger:0,age:0};s.cover.push(node); return node;
  }
  function bloodMark(s,x,y,amount=1){const g=s.damageCtx;g.save();g.fillStyle='rgba(91,18,15,.55)';for(let i=0;i<5*amount;i++){const a=Math.random()*6.28,d=Math.random()*13*amount,rr=.9+Math.random()*2.4;g.beginPath();g.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d,rr,rr*.55,a,0,6.28);g.fill();}g.restore();}
  J.World={resize,crater,bloodMark};
})();
