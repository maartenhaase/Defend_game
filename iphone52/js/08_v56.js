// JBD v5.6 // STRAIGHT FRONT + civilians + fire + campaign maps
(() => {
'use strict';
const V55=window.__JBD55||{}, fires=[], civilians=[], blood=[];
let themeIndex=0, civClock=5, lastWaveSeen=-1;
const THEMES=[
 {id:'jungle',name:'JUNGLE',bg:'#183022',ground:'#526848',ground2:'#6d8057',water:'#385d58'},
 {id:'polar',name:'POLAR',bg:'#17262b',ground:'#a9b8b4',ground2:'#d5ddd7',water:'#557c88'},
 {id:'desert',name:'DESERT',bg:'#392d20',ground:'#a78c59',ground2:'#c5a66b',water:'#4d7776'}
];
function theme(){return THEMES[themeIndex%THEMES.length]}
function applyTheme(){const t=theme();C.bg=t.bg;C.ground=t.ground;C.ground2=t.ground2;C.water=t.water;document.body.dataset.theme=t.id}
function straightProjection(){
 PORTRAIT=W<=600&&H>W;
 const reserve=PORTRAIT?Math.min(126,Math.max(106,H*.165)):100;
 const top=8,bottom=H-reserve-8,ph=Math.max(360,bottom-top);
 const aw=WORLD.aMax-WORLD.aMin,sw=WORLD.sMax-WORLD.sMin;
 // battlefield axes are now screen-straight: advance = vertical, lateral = horizontal.
 P_A_X=0; P_S_Y=0; P_S_X=(W-20)/sw; P_A_Y=(ph-12)/aw;
 P_CX=W*.5; P_CY=top+ph*.5;
}
updateProjection=straightProjection;
isoAS=function(a,s,z=0){return{x:P_CX+s*P_S_X,y:P_CY+(a-PCENTER_A)*P_A_Y-z*(PORTRAIT?.55:.72)}};
asFromScreen=function(x,y){return{a:PCENTER_A+(y-P_CY)/(P_A_Y||.001),s:(x-P_CX)/(P_S_X||.001)}};
xyFromAS=function(a,s){return{x:s,y:a}}; isoXY=function(x,y,z=0){return isoAS(y,x,z)};

for(const k of ['rifle','storm','mg','grenadier','engineer']) if(DEF[k]){DEF[k].damage*=1.65;DEF[k].engage*=1.06}
for(const k of ['technical','halftrack','apc']) if(DEF[k]) DEF[k].damage*=1.55;
for(const k of ['stug','tank']) if(DEF[k]) DEF[k].damage*=1.40;

const oldDamage=damageBunker;
damageBunker=function(d){oldDamage(d*1.32)};

function spawnCivilian(){
 if(state.phase!=='wave'||civilians.length>=4)return;
 const side=Math.random()<.5?-1:1;
 civilians.push({a:rnd(-65,35),s:side*rnd(30,46),ta:rnd(45,76),ts:-side*rnd(30,46),speed:rnd(5.8,7.5),walk:rnd(0,6),alive:true,age:0});
}
function updateCivilian(c,dt){
 c.age+=dt;c.walk+=dt*10;let da=c.ta-c.a,ds=c.ts-c.s,d=Math.max(.01,Math.hypot(da,ds));
 c.a+=da/d*c.speed*dt;c.s+=ds/d*c.speed*dt;if(d<2)c.alive=false;
 for(const f of fires){if(f.t<f.life&&Math.hypot(c.a-f.a,c.s-f.s)<f.r+2){c.s+=Math.sign(c.s-f.s||1)*c.speed*dt*2}}
}
function drawCivilian(c){
 const p=isoAS(c.a,c.s),m=PORTRAIT?.43:.60,ph=Math.sin(c.walk)*3;
 ctx.save();ctx.translate(p.x,p.y);ctx.scale(m,m);ellipse(0,8,6,2,'#10151055');
 rr(-3,-7,6,10,2,'#c9b06d','#342f27',1);circle(0,-11,2.8,C.skin,'#342f27',1);
 line(-2,2,-3+ph,11,2,'#39443d');line(2,2,3-ph,11,2,'#39443d');
 line(-2,-4,-7,-1,1.8,C.skin);line(2,-4,7,-1,1.8,C.skin);ctx.restore();
 ctx.font=(PORTRAIT?'6px':'8px')+' ui-monospace,monospace';ctx.textAlign='center';ctx.fillStyle='#f3e7a8';ctx.fillText('CIVILIAN',p.x,p.y-12*m);
}
function civilianHit(c,sh){
 if(!c.alive||sh.enemy)return false;
 const A=isoAS(sh.a,sh.s),B=isoAS(sh.ca??sh.ta,sh.cs??sh.ts),P=isoAS(c.a,c.s);
 if(screenDistToSegment(P.x,P.y,A.x,A.y,B.x,B.y)<7){c.alive=false;state.supply=Math.max(0,state.supply-35);state.chain=0;$('msg').textContent='CIVILIAN HIT · -35 SUP';blood.push({a:c.a,s:c.s,t:0,life:8,r:3});return true}
 return false;
}

const oldUpdateShot=updateShot;
updateShot=function(sh,dt){
 oldUpdateShot(sh,dt);
 if(!sh.enemy&&sh.t>=0){for(const c of civilians)if(civilianHit(c,sh))break}
 if(sh.type==='he'&&sh.done&&!sh._fire){sh._fire=true;fires.push({a:sh.ta,s:sh.ts,t:0,life:rnd(48,72),r:rnd(6,9)});if(fires.length>8)fires.shift()}
};

const oldDamageEnemy=damageEnemy;
damageEnemy=function(e,ammo,base,a=e.a,s=e.s){
 const before=e.hp;oldDamageEnemy(e,ammo,base,a,s);
 if(before>e.hp&&!e.vehicle&&!e.fort){blood.push({a:e.a+rnd(-1,1),s:e.s+rnd(-1,1),t:0,life:rnd(5,10),r:rnd(1.5,3.5)});if(blood.length>26)blood.shift()}
};

const oldMove=movementTarget;
movementTarget=function(e){
 if(!e.vehicle&&!e.fort){
   for(const f of fires){if(f.t<f.life&&Math.hypot(e.a-f.a,e.s-f.s)<f.r+10)return{a:Math.min(77,e.a+rnd(8,15)),s:clamp(e.s+(Math.random()<.5?-1:1)*rnd(10,20),-46,46),vehicle:null}}
   if(!e.coverTarget&&Math.random()<.035){e.coverTarget={a:Math.min(70,e.a+rnd(8,20)),s:clamp(e.s+(Math.random()<.5?-1:1)*rnd(8,24),-44,44),kind:'flank'};e.action='sprint';e.actionT=.8}
 }
 return oldMove(e);
};

const oldKill=killEnemy;
killEnemy=function(e,ammo,cls){const a=e.a,s=e.s,veh=e.vehicle;oldKill(e,ammo,cls);if(!veh){for(let i=0;i<3;i++)blood.push({a:a+rnd(-2,2),s:s+rnd(-2,2),t:0,life:rnd(6,12),r:rnd(1.4,3.8)})}};

const oldDraw=draw;
draw=function(){
 oldDraw();
 ctx.save();
 for(const b of blood){const p=isoAS(b.a,b.s);ctx.globalAlpha=clamp(1-b.t/b.life,.15,.72);ellipse(p.x,p.y,b.r*(PORTRAIT?.55:.8),b.r*.35,'#681d1c')}
 ctx.globalAlpha=1;
 for(const f of fires){const p=isoAS(f.a,f.s),q=1+Math.sin(f.t*9)*.12;circle(p.x,p.y-2,5*q,'#e15d2eaa');circle(p.x+2,p.y-5,3.3*q,'#ffc457cc');for(let i=0;i<2;i++)circle(p.x+Math.sin(f.t*2+i)*4,p.y-11-i*7-f.t*.18,5+i*2,'#31363255')}
 for(const c of civilians)if(c.alive)drawCivilian(c);
 ctx.restore();
};

const oldUpdate=update;
update=function(dt){
 oldUpdate(dt);for(const f of fires)f.t+=dt;for(const b of blood)b.t+=dt;
 while(fires.length&&fires[0].t>=fires[0].life)fires.shift();while(blood.length&&blood[0].t>=blood[0].life)blood.shift();
 civilians.forEach(c=>c.alive&&updateCivilian(c,dt));for(let i=civilians.length-1;i>=0;i--)if(!civilians[i].alive&&civilians[i].age>1)civilians.splice(i,1);
 if(state.phase==='wave'){civClock-=dt;if(civClock<=0){if(Math.random()<.62)spawnCivilian();civClock=rnd(9,18)}}
 if(state.wave!==lastWaveSeen&&state.wave>0){lastWaveSeen=state.wave;if((state.wave-1)%3===0){themeIndex=Math.floor((state.wave-1)/3)%THEMES.length;applyTheme()}}
};

const oldStart=startWave;
startWave=function(){if(state.phase!=='wave'){if(state.wave>0&&state.wave%3===0){themeIndex=(themeIndex+1)%THEMES.length;applyTheme()}civClock=rnd(5,10)}oldStart()};

const oldUI=updateUI;
updateUI=function(){oldUI();const t=theme();const strong=document.querySelector('header strong');if(strong)strong.textContent='JBD // 5.6 // '+t.name+' FRONT';};

applyTheme();resize();updateUI();
window.__JBD56={THEMES,fires,civilians,blood};
})();