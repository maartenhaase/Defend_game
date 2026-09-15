from pathlib import Path
root=Path('jbd_rebuild_v1')

# config
p=root/'src/config.js'; s=p.read_text()
s=s.replace("render: { maxDpr: 2, mobileMaxDpr: 1.65, particles: 680, bullets: 190, mobileScale: 0.72, desktopScale: 0.86 },","render: { maxDpr: 2, mobileMaxDpr: 1.65, particles: 620, bullets: 190, mobileScale: 0.44, desktopScale: 0.52, effectScale: 0.62, decalScale: 0.58 },")
s=s.replace("hp: 100, speed: 22, sprint: 50, range: 310, fireInterval: 1.22,","hp: 100, speed: 16, sprint: 32, range: 310, fireInterval: 1.22,")
s=s.replace("assaultSprint: 61, reseekDelay: 2.55,","assaultSprint: 39, reseekDelay: 2.55,")
s=s.replace("{ time: 3.8, type: 'technical', lane: -0.25 },\n        { time: 7.4, type: 'truck', lane: 0.20 },\n        { time: 11.2, type: 'halftrack', lane: -0.08 },\n        { time: 15.7, type: 'stug', lane: 0.28 },\n        { time: 20.6, type: 'tank', lane: -0.28 }","{ time: 5.0, type: 'technical', lane: -0.25 },\n        { time: 10.0, type: 'truck', lane: 0.20 },\n        { time: 16.0, type: 'halftrack', lane: -0.08 },\n        { time: 23.0, type: 'stug', lane: 0.28 },\n        { time: 31.0, type: 'tank', lane: -0.28 }")
s=s.replace("technical: { hp: 62, speed: 64, radius: 20, range: 330, fireInterval: .72, damage: 1.15,","technical: { hp: 62, speed: 42, radius: 20, range: 330, fireInterval: .72, damage: 1.15,")
s=s.replace("truck:     { hp: 82, speed: 48, radius: 24, range: 0,   fireInterval: 99,  damage: 0,","truck:     { hp: 82, speed: 34, radius: 24, range: 0,   fireInterval: 99,  damage: 0,")
s=s.replace("halftrack: { hp: 104,speed: 42, radius: 25, range: 350, fireInterval: .86, damage: 1.35,","halftrack: { hp: 104,speed: 30, radius: 25, range: 350, fireInterval: .86, damage: 1.35,")
s=s.replace("stug:      { hp: 118,speed: 31, radius: 27, range: 430, fireInterval: 3.2, damage: 6.2,","stug:      { hp: 118,speed: 23, radius: 27, range: 430, fireInterval: 3.2, damage: 6.2,")
s=s.replace("tank:      { hp: 140,speed: 28, radius: 29, range: 445, fireInterval: 3.55,damage: 7.4,","tank:      { hp: 140,speed: 20, radius: 29, range: 445, fireInterval: 3.55,damage: 7.4,")
s=s.replace("startTime: 24.2, planeSpeed: 96, planeYRatio: 0.15, dropCount: 6,","startTime: 29.0, planeSpeed: 78, planeYRatio: 0.15, dropCount: 6,")
s=s.replace("dropStartRatio: 0.22, dropEndRatio: 0.72, descentSpeed: 31,","dropStartRatio: 0.22, dropEndRatio: 0.72, descentSpeed: 24,")
s=s.replace("level: { seed: 731942, spawnCount: 14, spawnDuration: 14.5, completeDelay: 2.0 },","level: { seed: 731942, spawnCount: 14, spawnDuration: 19.0, completeDelay: 2.0 },")
p.write_text(s)

# scenarios
p=root/'src/scenarios.js'; s=p.read_text()
s=s.replace("jungle:{label:'JUNGLE', sight:0.84, cover:1.28, vehicleSpeed:0.84, infantrySpeed:0.90,", "jungle:{label:'JUNGLE', sight:0.84, cover:1.28, vehicleSpeed:0.82, infantrySpeed:0.88,")
s=s.replace("desert:{label:'DESERT', sight:1.12, cover:0.76, vehicleSpeed:1.00, infantrySpeed:1.00,", "desert:{label:'DESERT', sight:1.12, cover:0.76, vehicleSpeed:0.94, infantrySpeed:0.94,")
s=s.replace("polar:{label:'POLAR', sight:1.04, cover:0.84, vehicleSpeed:1.12, infantrySpeed:1.03,", "polar:{label:'POLAR', sight:1.04, cover:0.84, vehicleSpeed:1.02, infantrySpeed:0.98,")
for a,b in [('10.8','15.8'),('11.8','17.0'),('12.6','18.2'),('10.2','15.0'),('11.2','16.4'),('12.0','17.8'),('10.4','15.2'),('11.3','16.6'),('12.2','18.0')]: s=s.replace(f'dur:{a}',f'dur:{b}')
s=s.replace("const phaseTimes=[2.9,8.0,13.4];", "const phaseTimes=[5.0,13.0,22.0];")
s=s.replace("phaseTimes[p]+k*1.55", "phaseTimes[p]+k*2.15")
s=s.replace("out.push({time:16.9,type:cycle%2?'stug':'halftrack'", "out.push({time:31.0,type:cycle%2?'stug':'halftrack'")
s=s.replace("airborneCount:b.air?Math.min(3,b.air):0,airborneStart:15.6,", "airborneCount:b.air?Math.min(3,b.air):0,airborneStart:26.0,")
p.write_text(s)

# world
p=root/'src/world.js'; s=p.read_text()
s=s.replace("const riverWidth=sc.theme==='jungle'?46:sc.theme==='desert'?38:50;", "const riverWidth=sc.theme==='jungle'?34:sc.theme==='desert'?30:36;")
s=s.replace("bridges:sc.bridgeRatios.map((q,i)=>({id:i,y:h*q,halfH:11,width:riverWidth+25})),", "bridges:sc.bridgeRatios.map((q,i)=>({id:i,y:h*q,halfH:9,width:riverWidth+20})),")
s=s.replace("map.building={x:bx,y:by,w:54+r()*12,h:38+r()*8,rot:(r()-.5)*.10};", "map.building={x:bx,y:by,w:40+r()*9,h:28+r()*6,rot:(r()-.5)*.10};")
s=s.replace("map.trenches.push({x,y,len:24+r()*28,angle:(r()-.5)*.36});", "map.trenches.push({x,y,len:18+r()*22,angle:(r()-.5)*.36});")
s=s.replace("map.vegetation.push({x,y,scale:.45+r()*.75,kind:", "map.vegetation.push({x,y,scale:.32+r()*.55,kind:")
s=s.replace("g.strokeStyle=p.road;g.lineWidth=s.map.theme==='jungle'?32:42;", "g.strokeStyle=p.road;g.lineWidth=s.map.theme==='jungle'?24:30;")
s=s.replace("const x=riverXAt(s,b.y),w=s.map.river.width+24;", "const x=riverXAt(s,b.y),w=s.map.river.width+19;")
s=s.replace("g.fillRect(-w/2,-9,w,18);g.strokeRect(-w/2,-9,w,18);", "g.fillRect(-w/2,-7,w,14);g.strokeRect(-w/2,-7,w,14);")
s=s.replace("g.beginPath();g.moveTo(xx,-8);g.lineTo(xx,8);", "g.beginPath();g.moveTo(xx,-6);g.lineTo(xx,6);")
s=s.replace("g.lineWidth=9;", "g.lineWidth=6;")
s=s.replace("else{path();g.strokeStyle='rgba(211,235,208,.08)';g.lineWidth=3;g.stroke();}", "else{path();g.strokeStyle='rgba(211,235,208,.08)';g.lineWidth=2;g.stroke();}")
s=s.replace("add(b.x-b.w*.35,b.y+b.h*.35,16,.88,'building');add(b.x+b.w*.35,b.y+b.h*.35,16,.88,'building');", "add(b.x-b.w*.35,b.y+b.h*.35,11,.88,'building');add(b.x+b.w*.35,b.y+b.h*.35,11,.88,'building');")
s=s.replace("for(const t of s.map.trenches)add(t.x,t.y,Math.min(22,t.len*.42),.80,'trench');", "for(const t of s.map.trenches)add(t.x,t.y,Math.min(15,t.len*.40),.80,'trench');")
s=s.replace("add(o.x,o.y,10+o.scale*5,s.map.theme==='jungle'?.58:.46,'terrain');", "add(o.x,o.y,7+o.scale*4,s.map.theme==='jungle'?.58:.46,'terrain');")
start=s.index("  function crater(s,x,y,radius,seed){"); end=s.index("  function bloodMark", start)
new_crater="""  function crater(s,x,y,radius,seed){
    const g=s.damageCtx,r=U.mulberry32(seed),vr=radius*.56,n=15,pts=[];for(let i=0;i<n;i++){const a=i/n*6.28,rr=vr*(.82+r()*.38);pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.72]);}
    g.save();g.lineJoin='round';g.fillStyle='rgba(56,43,27,.55)';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();g.strokeStyle='rgba(120,96,54,.7)';g.lineWidth=3;g.stroke();g.fillStyle='rgba(26,25,20,.8)';g.beginPath();for(let i=0;i<n;i++){const a=i/n*6.28,rr=vr*(.52+r()*.14),px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.68;i?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.fill();g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x+vr*.12,y+vr*.2,vr*.46,vr*.23,.1,0,6.28);g.fill();for(let i=0;i<6;i++){const a=r()*6.28,rr=vr*(.65+r()*.75);g.fillStyle='rgba(79,57,31,.7)';g.beginPath();g.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.65,.7+r()*1.5,0,6.28);g.fill();}g.restore();
    const node={id:s.cover.length+1,x,y,radius:vr*.78,coverStrength:.72,occupiedBy:null,danger:0,age:0};s.cover.push(node);return node;
  }
"""
s=s[:start]+new_crater+s[end:]
s=s.replace("const g=s.damageCtx;g.save();g.fillStyle='rgba(91,18,15,.55)';for(let i=0;i<5*amount;i++){const a=Math.random()*6.28,d=Math.random()*13*amount,rr=.9+Math.random()*2.4;", "const g=s.damageCtx,z=C.render.decalScale||1;g.save();g.fillStyle='rgba(91,18,15,.55)';for(let i=0;i<5*amount;i++){const a=Math.random()*6.28,d=Math.random()*13*amount*z,rr=(.9+Math.random()*2.4)*z;")
s=s.replace("function scorchMark(s,x,y,radius=18,intensity=1){const g=s.damageCtx,r=U.mulberry32", "function scorchMark(s,x,y,radius=18,intensity=1){const g=s.damageCtx,z=C.render.decalScale||1,r=U.mulberry32")
s=s.replace("rr=radius*(.55+ring*.18)", "rr=radius*z*(.55+ring*.18)")
s=s.replace("g.ellipse(x,y,heavy?5:2.5,heavy?2.4:1.2", "g.ellipse(x,y,(heavy?5:2.5)*(C.render.decalScale||1),(heavy?2.4:1.2)*(C.render.decalScale||1)")
p.write_text(s)

# render
p=root/'src/render.js'; s=p.read_text()
s=s.replace("const p=x.t/x.dur,fade=Math.max(0,1-p),r=x.radius*(.22+.78*Math.sin(Math.min(1,p)*Math.PI*.78)),rand=U.mulberry32(x.seed||1);", "const p=x.t/x.dur,fade=Math.max(0,1-p),r=x.radius*(C.render.effectScale||1)*(.22+.78*Math.sin(Math.min(1,p)*Math.PI*.78)),rand=U.mulberry32(x.seed||1);")
s=s.replace("ctx.strokeStyle='rgba(255,226,133,.9)';ctx.lineWidth=1.3;", "ctx.strokeStyle='rgba(255,226,133,.9)';ctx.lineWidth=.9;")
s=s.replace("ctx.strokeStyle='#bfe6ff';ctx.lineWidth=2;", "ctx.strokeStyle='#bfe6ff';ctx.lineWidth=1.4;")
s=s.replace("ctx.strokeStyle='#ffb968';ctx.lineWidth=2.4;", "ctx.strokeStyle='#ffb968';ctx.lineWidth=1.7;")
s=s.replace("ctx.strokeStyle=q.kind==='shell'?'#ffbb6b':'rgba(255,211,110,.82)';ctx.lineWidth=q.kind==='shell'?2.4:1.1;", "ctx.strokeStyle=q.kind==='shell'?'#ffbb6b':'rgba(255,211,110,.82)';ctx.lineWidth=q.kind==='shell'?1.7:.8;")
s=s.replace("const b=s.bunker,spr=J.Sprites.bunker,sc=entityScale(s)*.90,profile=s.profile||{};", "const b=s.bunker,spr=J.Sprites.bunker,sc=Math.max(entityScale(s)*1.18,.50),profile=s.profile||{};")
s=s.replace("const sc=entityScale(s)*.88;", "const sc=entityScale(s)*.95;")
p.write_text(s)

# particles
p=root/'src/particles.js'; s=p.read_text()
s=s.replace("if(!p.active)continue;const t=p.life/p.maxLife;ctx.globalAlpha=Math.min(1,t*1.7)*p.alpha;", "if(!p.active)continue;const t=p.life/p.maxLife,z=C.render.effectScale||1,ps=p.size*z;ctx.globalAlpha=Math.min(1,t*1.7)*p.alpha;")
s=s.replace("p.size*1.2","ps*1.2").replace("p.size*2.4","ps*2.4")
s=s.replace("ctx.arc(p.x,p.y,p.size,0,6.28)","ctx.arc(p.x,p.y,ps,0,6.28)")
s=s.replace("p.size*.72","ps*.72").replace("p.size*1.18","ps*1.18")
s=s.replace("ctx.fillRect(-p.size,-p.size*.45,p.size*2,p.size*.9)","ctx.fillRect(-ps,-ps*.45,ps*2,ps*.9)")
s=s.replace("Math.max(.6,p.size*t)","Math.max(.6,ps*t)")
s=s.replace("-p.size*3,p.size*.65","-ps*3,ps*.65").replace("-p.size*2.1,-p.size*.65","-ps*2.1,-ps*.65")
p.write_text(s)

# build
p=root/'build.js'; s=p.read_text()
s=s.replace('<meta name="theme-color" content="#20261b"><title>JBD — Bunker Defense</title>', '<meta name="theme-color" content="#20261b"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><title>JBD — Mini Front</title>')
s=s.replace('backdrop-filter:blur(2px);transition', 'backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);transition')
s=s.replace('.action{appearance:none;border:0;', '.action{appearance:none;-webkit-appearance:none;border:0;')
s=s.replace('min-width:170px;box-shadow:', 'min-width:170px;min-height:48px;touch-action:manipulation;box-shadow:')
s=s.replace('.shopBtn{width:100%;appearance:none;border:', '.shopBtn{width:100%;appearance:none;-webkit-appearance:none;border:')
s=s.replace('<h1 id="title">ALL MAPS</h1><p id="sub">9 korte scenario’s: Jungle → Desert → Polar.<br><span>Tik = BURST · kort vasthouden = AP · lang vasthouden = HE</span></p><button id="deploy" class="action">DEPLOY</button><button id="restart" class="action">PLAY AGAIN</button>', '<h1 id="title">MINI FRONT</h1><p id="sub">Hetzelfde slagveld, maar op één vaste kleinere schaal.<br><span>Tik = BURST · kort vasthouden = AP · lang vasthouden = HE</span></p><button id="deploy" class="action" type="button">DEPLOY</button><button id="restart" class="action" type="button">PLAY AGAIN</button>')
p.write_text(s)
