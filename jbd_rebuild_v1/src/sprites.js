(() => {
  const J=window.JBD;
  const S={soldier:[],crouch:null,dead:null,bunker:null};
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function soldierFrame(phase=0,crouch=false){
    const c=canvas(44,52),g=c.getContext('2d'); g.translate(22,26); g.lineCap='round';g.lineJoin='round';
    const bob=crouch?2:Math.sin(phase)*1.1, swing=crouch?0:Math.sin(phase)*5.0;
    g.save();g.translate(3,7);g.rotate(-.35);g.scale(1,.6);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(0,0,10,5,0,0,6.28);g.fill();g.restore();
    // legs/boots behind torso
    g.strokeStyle='#25291f';g.lineWidth=4.4;
    const legY=crouch?7:9;
    g.beginPath();g.moveTo(-3,5+bob);g.lineTo(-5+swing*.45,legY+7);g.stroke();
    g.beginPath();g.moveTo(3,5+bob);g.lineTo(5-swing*.45,legY+7);g.stroke();
    g.strokeStyle='#171915';g.lineWidth=5.2;
    g.beginPath();g.moveTo(-5+swing*.45,legY+7);g.lineTo(-6+swing*.5,legY+10);g.stroke();
    g.beginPath();g.moveTo(5-swing*.45,legY+7);g.lineTo(6-swing*.5,legY+10);g.stroke();
    // backpack
    g.fillStyle='#4a5133';g.strokeStyle='#1f241a';g.lineWidth=1.5;g.beginPath();g.roundRect(-7,-2+bob,14,13,4);g.fill();g.stroke();
    // torso
    g.fillStyle='#667044';g.beginPath();g.roundRect(-6,-7+bob,12,15,4);g.fill();g.stroke();
    // belt/gear
    g.fillStyle='#3a402a';g.fillRect(-7,3+bob,14,3);g.fillStyle='#7d744e';g.fillRect(-8,-1+bob,3,4);g.fillRect(5,-1+bob,3,4);
    // helmet + face at forward (-Y)
    g.fillStyle='#b28f69';g.strokeStyle='#332b22';g.lineWidth=1.2;g.beginPath();g.arc(0,-10+bob,4.7,0,6.28);g.fill();g.stroke();
    g.fillStyle='#4b5632';g.strokeStyle='#202619';g.beginPath();g.ellipse(0,-12+bob,6.4,4.3,0,Math.PI,Math.PI*2);g.lineTo(5,-10+bob);g.quadraticCurveTo(0,-8,-5,-10+bob);g.closePath();g.fill();g.stroke();
    // arms + rifle angled forward/right
    g.strokeStyle='#58603a';g.lineWidth=3.5;
    g.beginPath();g.moveTo(-4,-4+bob);g.lineTo(-7+swing*.14,-8+bob);g.lineTo(-2,-11+bob);g.stroke();
    g.beginPath();g.moveTo(4,-4+bob);g.lineTo(7-swing*.14,-8+bob);g.lineTo(3,-12+bob);g.stroke();
    g.strokeStyle='#171916';g.lineWidth=2.6;g.beginPath();g.moveTo(-2,-9+bob);g.lineTo(4,-19+bob);g.stroke();
    g.fillStyle='#704b2e';g.save();g.translate(1,-13+bob);g.rotate(.58);g.fillRect(-1.3,-7,2.6,9);g.restore();
    // tiny highlight
    g.strokeStyle='rgba(255,255,220,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(-3,-6+bob);g.lineTo(2,-7+bob);g.stroke();
    return c;
  }
  function deadSprite(){ const c=canvas(54,36),g=c.getContext('2d');g.translate(27,18);g.rotate(-.28);g.fillStyle='rgba(0,0,0,.24)';g.beginPath();g.ellipse(3,6,16,5,0,0,6.28);g.fill();g.strokeStyle='#20251a';g.lineWidth=4;g.beginPath();g.moveTo(-6,1);g.lineTo(-16,7);g.moveTo(5,1);g.lineTo(16,5);g.stroke();g.fillStyle='#5c663d';g.strokeStyle='#22271a';g.lineWidth=1.3;g.beginPath();g.roundRect(-9,-6,18,12,4);g.fill();g.stroke();g.fillStyle='#b28f69';g.beginPath();g.arc(-11,-6,4.5,0,6.28);g.fill();g.fillStyle='#4b5632';g.beginPath();g.ellipse(-11,-8,6,3.5,0,Math.PI,Math.PI*2);g.fill();g.strokeStyle='#171916';g.lineWidth=2.2;g.beginPath();g.moveTo(3,-5);g.lineTo(18,-11);g.stroke();return c; }
  function bunkerBase(){ const c=canvas(150,96),g=c.getContext('2d');g.translate(75,56);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(0,18,64,16,0,0,6.28);g.fill();
    // sandbag semicircle
    g.strokeStyle='#4c452f';g.lineWidth=1.4; for(let i=0;i<9;i++){const a=Math.PI+(i/8)*Math.PI,x=Math.cos(a)*52,y=Math.sin(a)*22+9;g.save();g.translate(x,y);g.rotate(a+Math.PI/2);g.fillStyle=i%2?'#9a8a61':'#887953';g.beginPath();g.roundRect(-9,-5,18,10,4);g.fill();g.stroke();g.restore();}
    // concrete emplacement
    g.fillStyle='#636961';g.strokeStyle='#30342f';g.lineWidth=2;g.beginPath();g.moveTo(-43,13);g.lineTo(-35,-18);g.quadraticCurveTo(0,-34,35,-18);g.lineTo(43,13);g.closePath();g.fill();g.stroke();
    g.fillStyle='#454b46';g.beginPath();g.ellipse(0,-5,20,11,0,0,6.28);g.fill();g.stroke();
    g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(-32,-13);g.quadraticCurveTo(0,-24,29,-13);g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;g.stroke();
    return c; }
  function init(){ S.soldier=[]; for(let i=0;i<8;i++)S.soldier.push(soldierFrame(i/8*Math.PI*2,false)); S.crouch=soldierFrame(0,true); S.dead=deadSprite(); S.bunker=bunkerBase(); J.Sprites=S; }
  J.SpriteSystem={init};
})();
