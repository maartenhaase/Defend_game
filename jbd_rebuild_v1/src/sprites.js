(() => {
  const J=window.JBD;
  const S={soldier:[],crouch:null,dead:null,bunker:null,vehicles:{}};
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}

  function soldierFrame(phase=0,crouch=false){
    const c=canvas(44,52),g=c.getContext('2d'); g.translate(22,26); g.lineCap='round';g.lineJoin='round';
    const bob=crouch?2:Math.sin(phase)*1.1, swing=crouch?0:Math.sin(phase)*5.0;
    g.save();g.translate(3,7);g.rotate(-.35);g.scale(1,.6);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(0,0,10,5,0,0,6.28);g.fill();g.restore();
    g.strokeStyle='#25291f';g.lineWidth=4.4;const legY=crouch?7:9;
    g.beginPath();g.moveTo(-3,5+bob);g.lineTo(-5+swing*.45,legY+7);g.stroke();g.beginPath();g.moveTo(3,5+bob);g.lineTo(5-swing*.45,legY+7);g.stroke();
    g.strokeStyle='#171915';g.lineWidth=5.2;g.beginPath();g.moveTo(-5+swing*.45,legY+7);g.lineTo(-6+swing*.5,legY+10);g.stroke();g.beginPath();g.moveTo(5-swing*.45,legY+7);g.lineTo(6-swing*.5,legY+10);g.stroke();
    g.fillStyle='#4a5133';g.strokeStyle='#1f241a';g.lineWidth=1.5;g.beginPath();g.roundRect(-7,-2+bob,14,13,4);g.fill();g.stroke();
    g.fillStyle='#667044';g.beginPath();g.roundRect(-6,-7+bob,12,15,4);g.fill();g.stroke();
    g.fillStyle='#3a402a';g.fillRect(-7,3+bob,14,3);g.fillStyle='#7d744e';g.fillRect(-8,-1+bob,3,4);g.fillRect(5,-1+bob,3,4);
    g.fillStyle='#b28f69';g.strokeStyle='#332b22';g.lineWidth=1.2;g.beginPath();g.arc(0,-10+bob,4.7,0,6.28);g.fill();g.stroke();
    g.fillStyle='#4b5632';g.strokeStyle='#202619';g.beginPath();g.ellipse(0,-12+bob,6.4,4.3,0,Math.PI,Math.PI*2);g.lineTo(5,-10+bob);g.quadraticCurveTo(0,-8,-5,-10+bob);g.closePath();g.fill();g.stroke();
    g.strokeStyle='#58603a';g.lineWidth=3.5;g.beginPath();g.moveTo(-4,-4+bob);g.lineTo(-7+swing*.14,-8+bob);g.lineTo(-2,-11+bob);g.stroke();g.beginPath();g.moveTo(4,-4+bob);g.lineTo(7-swing*.14,-8+bob);g.lineTo(3,-12+bob);g.stroke();
    g.strokeStyle='#171916';g.lineWidth=2.6;g.beginPath();g.moveTo(-2,-9+bob);g.lineTo(4,-19+bob);g.stroke();g.fillStyle='#704b2e';g.save();g.translate(1,-13+bob);g.rotate(.58);g.fillRect(-1.3,-7,2.6,9);g.restore();
    g.strokeStyle='rgba(255,255,220,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(-3,-6+bob);g.lineTo(2,-7+bob);g.stroke();return c;
  }

  function deadSprite(){
    const c=canvas(54,36),g=c.getContext('2d');g.translate(27,18);g.rotate(-.28);g.fillStyle='rgba(0,0,0,.24)';g.beginPath();g.ellipse(3,6,16,5,0,0,6.28);g.fill();g.strokeStyle='#20251a';g.lineWidth=4;g.beginPath();g.moveTo(-6,1);g.lineTo(-16,7);g.moveTo(5,1);g.lineTo(16,5);g.stroke();g.fillStyle='#5c663d';g.strokeStyle='#22271a';g.lineWidth=1.3;g.beginPath();g.roundRect(-9,-6,18,12,4);g.fill();g.stroke();g.fillStyle='#b28f69';g.beginPath();g.arc(-11,-6,4.5,0,6.28);g.fill();g.fillStyle='#4b5632';g.beginPath();g.ellipse(-11,-8,6,3.5,0,Math.PI,Math.PI*2);g.fill();g.strokeStyle='#171916';g.lineWidth=2.2;g.beginPath();g.moveTo(3,-5);g.lineTo(18,-11);g.stroke();return c;
  }

  function bunkerBase(){
    const c=canvas(150,96),g=c.getContext('2d');g.translate(75,56);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(0,18,64,16,0,0,6.28);g.fill();g.strokeStyle='#4c452f';g.lineWidth=1.4;
    for(let i=0;i<9;i++){const a=Math.PI+(i/8)*Math.PI,x=Math.cos(a)*52,y=Math.sin(a)*22+9;g.save();g.translate(x,y);g.rotate(a+Math.PI/2);g.fillStyle=i%2?'#9a8a61':'#887953';g.beginPath();g.roundRect(-9,-5,18,10,4);g.fill();g.stroke();g.restore();}
    g.fillStyle='#636961';g.strokeStyle='#30342f';g.lineWidth=2;g.beginPath();g.moveTo(-43,13);g.lineTo(-35,-18);g.quadraticCurveTo(0,-34,35,-18);g.lineTo(43,13);g.closePath();g.fill();g.stroke();g.fillStyle='#454b46';g.beginPath();g.ellipse(0,-5,20,11,0,0,6.28);g.fill();g.stroke();g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;g.beginPath();g.moveTo(-32,-13);g.quadraticCurveTo(0,-24,29,-13);g.stroke();return c;
  }

  function shadow(g,w,h){g.fillStyle='rgba(0,0,0,.30)';g.beginPath();g.ellipse(5,8,w*.40,h*.34,-.12,0,6.28);g.fill();}
  function outlineFill(g,path,fill='#596044',stroke='#1c211b',lw=2){g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=lw;g.beginPath();path(g);g.closePath();g.fill();g.stroke();}
  function wheel(g,x,y,r=5){g.fillStyle='#161916';g.strokeStyle='#33382f';g.lineWidth=1.4;g.beginPath();g.ellipse(x,y,r,r*.72,0,0,6.28);g.fill();g.stroke();g.fillStyle='#55594b';g.beginPath();g.arc(x,y,r*.34,0,6.28);g.fill();}
  function track(g,x,y,w,h){g.fillStyle='#1b1e1a';g.strokeStyle='#353931';g.lineWidth=1.4;g.beginPath();g.roundRect(x,y,w,h,4);g.fill();g.stroke();g.strokeStyle='rgba(133,139,112,.35)';g.lineWidth=1;for(let yy=y+5;yy<y+h-2;yy+=7){g.beginPath();g.moveTo(x+2,yy);g.lineTo(x+w-2,yy);g.stroke();}}

  function technicalSprite(){
    const c=canvas(78,112),g=c.getContext('2d');g.translate(39,56);shadow(g,58,80);wheel(g,-24,-25,6);wheel(g,24,-25,6);wheel(g,-24,29,6);wheel(g,24,29,6);
    outlineFill(g,p=>{p.moveTo(-22,35);p.lineTo(-24,-10);p.lineTo(-18,-37);p.lineTo(18,-37);p.lineTo(24,-10);p.lineTo(22,35);},'#5c6547');
    g.fillStyle='#30372d';g.strokeStyle='#1c211b';g.lineWidth=1.4;g.beginPath();g.roundRect(-17,-31,34,21,5);g.fill();g.stroke();g.fillStyle='#768071';g.beginPath();g.moveTo(-13,-27);g.lineTo(13,-27);g.lineTo(10,-17);g.lineTo(-10,-17);g.closePath();g.fill();
    g.fillStyle='#403f32';g.beginPath();g.roundRect(-18,5,36,27,3);g.fill();g.stroke();g.strokeStyle='#77765e';g.beginPath();g.moveTo(0,6);g.lineTo(0,31);g.stroke();
    g.fillStyle='#735c3c';g.fillRect(-14,10,28,4);g.fillRect(-14,23,28,4);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(-16,-33,30,2);return c;
  }

  function truckSprite(){
    const c=canvas(90,132),g=c.getContext('2d');g.translate(45,66);shadow(g,67,96);for(const y of [-35,28]){wheel(g,-29,y,6.5);wheel(g,29,y,6.5);}outlineFill(g,p=>{p.moveTo(-26,49);p.lineTo(-28,-10);p.lineTo(-22,-48);p.lineTo(22,-48);p.lineTo(28,-10);p.lineTo(26,49);},'#62684a');
    g.fillStyle='#354035';g.strokeStyle='#1c211b';g.lineWidth=1.5;g.beginPath();g.roundRect(-21,-44,42,29,6);g.fill();g.stroke();g.fillStyle='#77908a';g.globalAlpha=.75;g.beginPath();g.moveTo(-16,-39);g.lineTo(16,-39);g.lineTo(13,-27);g.lineTo(-13,-27);g.closePath();g.fill();g.globalAlpha=1;
    g.fillStyle='#70684d';g.beginPath();g.roundRect(-22,-8,44,49,4);g.fill();g.stroke();g.strokeStyle='#9b8e63';g.lineWidth=1;for(let y=-2;y<37;y+=9){g.beginPath();g.moveTo(-19,y);g.lineTo(19,y);g.stroke();}g.fillStyle='#31362d';g.fillRect(-14,-15,28,7);return c;
  }

  function halftrackSprite(){
    const c=canvas(92,126),g=c.getContext('2d');g.translate(46,63);shadow(g,70,92);track(g,-31,0,14,52);track(g,17,0,14,52);wheel(g,-27,-30,6.5);wheel(g,27,-30,6.5);
    outlineFill(g,p=>{p.moveTo(-26,45);p.lineTo(-28,-5);p.lineTo(-20,-45);p.lineTo(20,-45);p.lineTo(28,-5);p.lineTo(26,45);},'#596248');
    g.fillStyle='#6f7557';g.beginPath();g.roundRect(-21,-39,42,28,5);g.fill();g.strokeStyle='#1c211b';g.stroke();g.fillStyle='#728b83';g.beginPath();g.moveTo(-15,-34);g.lineTo(15,-34);g.lineTo(12,-23);g.lineTo(-12,-23);g.closePath();g.fill();
    g.fillStyle='#33382e';g.beginPath();g.roundRect(-20,2,40,35,4);g.fill();g.stroke();g.strokeStyle='#7b8062';g.beginPath();g.moveTo(-13,5);g.lineTo(-13,34);g.moveTo(13,5);g.lineTo(13,34);g.stroke();return c;
  }

  function tankHull(type='tank'){
    const isStug=type==='stug',c=canvas(96,132),g=c.getContext('2d');g.translate(48,66);shadow(g,72,96);track(g,-35,-39,16,84);track(g,19,-39,16,84);
    outlineFill(g,p=>{p.moveTo(-25,43);p.lineTo(-29,-26);p.lineTo(-20,-47);p.lineTo(20,-47);p.lineTo(29,-26);p.lineTo(25,43);},isStug?'#596148':'#5b6247','#1b201a',2.2);
    g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(-18,-43);g.lineTo(16,-43);g.lineTo(20,-37);g.lineTo(-20,-37);g.closePath();g.fill();
    g.fillStyle='#3c4234';g.strokeStyle='#1b201a';g.lineWidth=1.5;g.beginPath();g.roundRect(-21,21,42,17,4);g.fill();g.stroke();
    if(isStug){g.fillStyle='#687055';g.beginPath();g.moveTo(-22,2);g.lineTo(-17,-28);g.lineTo(17,-28);g.lineTo(22,2);g.lineTo(18,22);g.lineTo(-18,22);g.closePath();g.fill();g.stroke();g.fillStyle='#30352c';g.beginPath();g.arc(7,-9,5,0,6.28);g.fill();}
    return c;
  }

  function turretSprite(type){
    const heavy=type==='tank'||type==='stug',light=type==='technical'||type==='halftrack';const c=canvas(96,72),g=c.getContext('2d');g.translate(48,36);
    if(type==='tank'){
      outlineFill(g,p=>{p.moveTo(-18,13);p.lineTo(-22,-8);p.lineTo(-12,-18);p.lineTo(14,-16);p.lineTo(21,-4);p.lineTo(17,13);},'#60684d','#1b201a',2);g.fillStyle='#2f342c';g.beginPath();g.arc(5,-5,5,0,6.28);g.fill();
      g.fillStyle='#4c5442';g.strokeStyle='#171b17';g.lineWidth=2;g.beginPath();g.roundRect(-4,-5,46,9,3);g.fill();g.stroke();g.fillStyle='#282d25';g.fillRect(36,-7,10,13);
    }else if(type==='stug'){
      g.fillStyle='#4e5642';g.strokeStyle='#171b17';g.lineWidth=2;g.beginPath();g.roundRect(-3,-4,47,8,3);g.fill();g.stroke();g.fillStyle='#282d25';g.fillRect(37,-6,10,12);
    }else if(light){
      g.fillStyle='#343a2f';g.strokeStyle='#171b17';g.lineWidth=1.5;g.beginPath();g.arc(0,0,type==='technical'?8:10,0,6.28);g.fill();g.stroke();g.fillStyle='#1d211c';g.fillRect(-2,-3,31,5);g.fillStyle='#4c513f';g.beginPath();g.arc(-3,2,4,0,6.28);g.fill();
    }
    return c;
  }

  function init(){
    S.soldier=[];for(let i=0;i<8;i++)S.soldier.push(soldierFrame(i/8*Math.PI*2,false));S.crouch=soldierFrame(0,true);S.dead=deadSprite();S.bunker=bunkerBase();
    S.vehicles.technical={body:technicalSprite(),turret:turretSprite('technical')};
    S.vehicles.truck={body:truckSprite(),turret:null};
    S.vehicles.halftrack={body:halftrackSprite(),turret:turretSprite('halftrack')};
    S.vehicles.stug={body:tankHull('stug'),turret:turretSprite('stug')};
    S.vehicles.tank={body:tankHull('tank'),turret:turretSprite('tank')};
    J.Sprites=S;
  }
  J.SpriteSystem={init};
})();
