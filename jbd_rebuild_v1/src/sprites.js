(() => {
  const J=window.JBD;
  const S={stand:[],walk:[],fire:[],crouch:[],prone:[],swim:[],deadFront:null,deadSide:null,bunker:null,vehicles:{},emplacement:null};
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}

  function helmetTop(g,x,y,w=10,h=8,rot=0){
    g.save();g.translate(x,y);g.rotate(rot);
    g.fillStyle='#465033';g.strokeStyle='#1b2119';g.lineWidth=1.25;
    g.beginPath();g.ellipse(0,0,w*.5,h*.5,0,0,Math.PI*2);g.fill();g.stroke();
    g.strokeStyle='rgba(196,202,157,.25)';g.lineWidth=1;g.beginPath();g.arc(-1,-1,w*.29,Math.PI*1.05,Math.PI*1.75);g.stroke();
    g.fillStyle='#303728';g.beginPath();g.ellipse(0,h*.30,w*.43,h*.12,0,0,Math.PI*2);g.fill();
    g.restore();
  }

  function rifle(g,x,y,angle=-.04,len=24){
    g.save();g.translate(x,y);g.rotate(angle);
    g.strokeStyle='#171b16';g.lineWidth=2.2;g.lineCap='round';g.beginPath();g.moveTo(0,5);g.lineTo(0,-len);g.stroke();
    g.fillStyle='#755337';g.beginPath();g.roundRect(-1.7,-4,3.4,10,1.2);g.fill();
    g.fillStyle='#22261f';g.fillRect(-1.3,-len-2,2.6,5);
    g.restore();
  }

  function topSoldierFrame(phase=0,mode='walk'){
    const c=canvas(54,66),g=c.getContext('2d');
    const walk=mode==='walk',fire=mode==='fire',stand=mode==='stand',crouch=mode==='crouch';
    const s=Math.sin(phase),cs=Math.cos(phase),stride=walk?s*4.2:0, sway=walk?s*.9:stand?s*.25:fire?s*.12:0;
    g.save();g.translate(27,33);

    g.fillStyle='rgba(0,0,0,.20)';g.beginPath();g.ellipse(1,7,10.5,18,0,0,Math.PI*2);g.fill();

    if(crouch){
      g.strokeStyle='#252a21';g.lineWidth=4.2;g.lineCap='round';
      g.beginPath();g.moveTo(-4,8);g.lineTo(-9,14);g.lineTo(-11,19);g.stroke();
      g.beginPath();g.moveTo(4,8);g.lineTo(9,14);g.lineTo(11,19);g.stroke();
      g.fillStyle='#1c201a';g.beginPath();g.ellipse(-12,20,4,2.6,-.25,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(12,20,4,2.6,.25,0,Math.PI*2);g.fill();
    }else{
      g.strokeStyle='#252a21';g.lineWidth=3.9;g.lineCap='round';
      g.beginPath();g.moveTo(-3.5,8);g.lineTo(-4.6+stride*.45,17);g.lineTo(-5.5+stride*.72,24);g.stroke();
      g.beginPath();g.moveTo(3.5,8);g.lineTo(4.6-stride*.45,17);g.lineTo(5.5-stride*.72,24);g.stroke();
      g.fillStyle='#1c201a';g.beginPath();g.ellipse(-5.7+stride*.72,25,4.1,2.5,-.05,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(5.7-stride*.72,25,4.1,2.5,.05,0,Math.PI*2);g.fill();
    }

    g.fillStyle='#596442';g.strokeStyle='#1d2219';g.lineWidth=1.35;
    g.beginPath();g.ellipse(sway,crouch?2:0,crouch?10.5:9.2,crouch?13:15.5,0,0,Math.PI*2);g.fill();g.stroke();
    g.fillStyle='#465137';g.beginPath();g.roundRect(-5.4+sway,crouch?4:3,10.8,crouch?10:12,3);g.fill();g.stroke();
    g.strokeStyle='rgba(223,225,190,.18)';g.lineWidth=1;g.beginPath();g.moveTo(-6+sway,-7);g.lineTo(6+sway,-7);g.stroke();

    const shoulderY=crouch?-6:-7;
    g.strokeStyle='#596442';g.lineWidth=3.7;g.lineCap='round';
    if(fire||crouch){
      g.beginPath();g.moveTo(-7+sway,shoulderY);g.lineTo(-4+sway,-12);g.lineTo(0+sway,-15);g.stroke();
      g.beginPath();g.moveTo(7+sway,shoulderY);g.lineTo(5+sway,-12);g.lineTo(2+sway,-16);g.stroke();
    }else{
      const arm=walk?cs*2.4:0;
      g.beginPath();g.moveTo(-7+sway,shoulderY);g.lineTo(-10+sway-arm*.25,0);g.lineTo(-9+sway-arm*.36,6);g.stroke();
      g.beginPath();g.moveTo(7+sway,shoulderY);g.lineTo(9+sway+arm*.15,-1);g.lineTo(8+sway+arm*.25,4);g.stroke();
    }

    if(fire||crouch) rifle(g,2+sway,-9,0,28);
    else rifle(g,8+sway,-2,-.09,24);

    helmetTop(g,sway,crouch?-13:-15,crouch?12:11,crouch?9:8.5,sway*.02);
    if(fire){g.fillStyle='rgba(238,206,116,.35)';g.beginPath();g.arc(2+sway,-38,1.5+Math.max(0,s)*.8,0,Math.PI*2);g.fill();}
    g.restore();return c;
  }

  function standFrame(phase=0){return topSoldierFrame(phase,'stand');}
  function walkFrame(phase=0){return topSoldierFrame(phase,'walk');}
  function fireFrame(phase=0){return topSoldierFrame(phase,'fire');}
  function crouchFrame(phase=0){return topSoldierFrame(phase,'crouch');}

  function proneFrame(phase=0){
    const c=canvas(48,72),g=c.getContext('2d'),crawl=Math.sin(phase)*2.8;
    g.save();g.translate(24,36);
    g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(1,3,8.5,26,0,0,Math.PI*2);g.fill();

    g.strokeStyle='#252a21';g.lineWidth=3.6;g.lineCap='round';
    g.beginPath();g.moveTo(-3,10);g.lineTo(-5-crawl*.28,20);g.lineTo(-7-crawl*.50,28);g.stroke();
    g.beginPath();g.moveTo(3,10);g.lineTo(5+crawl*.28,20);g.lineTo(7+crawl*.50,28);g.stroke();
    g.fillStyle='#1c201a';g.beginPath();g.ellipse(-7-crawl*.5,29,3.6,2.2,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(7+crawl*.5,29,3.6,2.2,0,0,Math.PI*2);g.fill();

    g.fillStyle='#56613f';g.strokeStyle='#1d2219';g.lineWidth=1.3;g.beginPath();g.ellipse(0,4,8.5,17,0,0,Math.PI*2);g.fill();g.stroke();
    g.fillStyle='#465137';g.beginPath();g.roundRect(-5,5,10,11,3);g.fill();g.stroke();

    g.strokeStyle='#596442';g.lineWidth=3.5;
    g.beginPath();g.moveTo(-6,-5);g.lineTo(-5,-14);g.lineTo(-1,-19);g.stroke();
    g.beginPath();g.moveTo(6,-5);g.lineTo(5,-14);g.lineTo(2,-20);g.stroke();
    rifle(g,2,-13,.01,31);
    helmetTop(g,0,-19,11,8.5,0);
    g.restore();return c;
  }

  function swimFrame(phase=0){
    const c=canvas(58,58),g=c.getContext('2d'),stroke=Math.sin(phase),reach=stroke*7;
    g.save();g.translate(29,28);
    g.strokeStyle='rgba(159,207,216,.42)';g.lineWidth=1.2;
    for(let k=0;k<3;k++){g.beginPath();g.ellipse(0,8+k*6,11+k*3+Math.abs(stroke)*2,3.5,0,0,Math.PI*2);g.stroke();}
    g.fillStyle='rgba(76,132,147,.32)';g.beginPath();g.ellipse(0,7,12,17,0,0,Math.PI*2);g.fill();
    g.fillStyle='#56613f';g.strokeStyle='#1d2219';g.lineWidth=1.2;g.beginPath();g.ellipse(0,1,8.5,11,0,0,Math.PI*2);g.fill();g.stroke();
    g.strokeStyle='#667248';g.lineWidth=3.3;g.lineCap='round';
    g.beginPath();g.moveTo(-6,-2);g.lineTo(-12-reach*.45,4);g.lineTo(-16-reach*.6,10);g.stroke();
    g.beginPath();g.moveTo(6,-2);g.lineTo(12+reach*.45,4);g.lineTo(16+reach*.6,10);g.stroke();
    rifle(g,7,6,-.20,21);
    helmetTop(g,0,-10,11,8.5,0);
    g.fillStyle='rgba(194,226,231,.42)';for(const x of [-18,18]){g.beginPath();g.arc(x+(x<0?-reach*.5:reach*.5),11,1.8+Math.abs(stroke),0,Math.PI*2);g.fill();}
    g.restore();return c;
  }

  function deadFront(){
    const c=canvas(62,58),g=c.getContext('2d');g.save();g.translate(31,29);g.rotate(.14);
    g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,3,18,14,.2,0,Math.PI*2);g.fill();
    g.strokeStyle='#252a21';g.lineWidth=3.4;g.lineCap='round';g.beginPath();g.moveTo(-3,7);g.lineTo(-14,17);g.moveTo(4,7);g.lineTo(15,15);g.moveTo(-6,-2);g.lineTo(-18,-9);g.moveTo(6,-2);g.lineTo(18,-12);g.stroke();
    g.fillStyle='#56613f';g.strokeStyle='#1d2219';g.lineWidth=1.2;g.beginPath();g.ellipse(0,0,9.5,14,0,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='#465137';g.beginPath();g.roundRect(-5,2,10,9,3);g.fill();g.stroke();helmetTop(g,0,-13,11,8.5,.08);rifle(g,16,-2,.58,25);g.restore();return c;
  }

  function deadSide(){
    const c=canvas(66,52),g=c.getContext('2d');g.save();g.translate(33,26);g.rotate(-1.08);
    g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,3,18,13,0,0,Math.PI*2);g.fill();
    g.strokeStyle='#252a21';g.lineWidth=3.4;g.lineCap='round';g.beginPath();g.moveTo(-4,6);g.lineTo(-13,17);g.moveTo(4,6);g.lineTo(12,17);g.moveTo(-6,-2);g.lineTo(-18,-8);g.moveTo(6,-1);g.lineTo(17,-10);g.stroke();
    g.fillStyle='#56613f';g.strokeStyle='#1d2219';g.lineWidth=1.2;g.beginPath();g.ellipse(0,0,9,14,0,0,Math.PI*2);g.fill();g.stroke();helmetTop(g,0,-13,11,8.5,0);rifle(g,12,0,.35,23);g.restore();return c;
  }

  function emplacementSprite(){
    const c=canvas(72,52),g=c.getContext('2d');g.translate(36,26);
    g.fillStyle='rgba(0,0,0,.24)';g.beginPath();g.ellipse(0,13,18,5,0,0,6.28);g.fill();
    g.strokeStyle='#2c2f26';g.lineWidth=2.8;g.lineCap='round';g.beginPath();g.moveTo(-5,6);g.lineTo(-12,18);g.moveTo(0,4);g.lineTo(0,18);g.moveTo(5,6);g.lineTo(12,18);g.stroke();
    g.fillStyle='#40463a';g.strokeStyle='#171b17';g.lineWidth=1.6;g.beginPath();g.roundRect(-7,-2,14,8,4);g.fill();g.stroke();
    g.fillRect(2,-1,26,4);g.fillStyle='#272b24';g.fillRect(24,-3,9,8);g.fillStyle='#645739';g.fillRect(-12,2,7,3);return c;
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
    const light=type==='technical'||type==='halftrack';const c=canvas(96,72),g=c.getContext('2d');g.translate(48,36);
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
    S.stand=[];S.walk=[];S.fire=[];S.crouch=[];S.prone=[];S.swim=[];
    for(let i=0;i<4;i++)S.stand.push(standFrame(i/4*Math.PI*2));
    for(let i=0;i<8;i++)S.walk.push(walkFrame(i/8*Math.PI*2));
    for(let i=0;i<4;i++)S.fire.push(fireFrame(i/4*Math.PI*2));
    for(let i=0;i<4;i++)S.crouch.push(crouchFrame(i/4*Math.PI*2));
    for(let i=0;i<6;i++)S.prone.push(proneFrame(i/6*Math.PI*2));
    for(let i=0;i<6;i++)S.swim.push(swimFrame(i/6*Math.PI*2));
    S.deadFront=deadFront();S.deadSide=deadSide();S.bunker=bunkerBase();S.emplacement=emplacementSprite();
    S.vehicles.technical={body:technicalSprite(),turret:turretSprite('technical')};
    S.vehicles.truck={body:truckSprite(),turret:null};
    S.vehicles.halftrack={body:halftrackSprite(),turret:turretSprite('halftrack')};
    S.vehicles.stug={body:tankHull('stug'),turret:turretSprite('stug')};
    S.vehicles.tank={body:tankHull('tank'),turret:turretSprite('tank')};
    J.Sprites=S;
  }
  J.SpriteSystem={init};
})();
