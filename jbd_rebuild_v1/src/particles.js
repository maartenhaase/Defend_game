(() => {
  const J=window.JBD, C=J.CONFIG;
  function init(s){s.particles=Array.from({length:C.render.particles},()=>({active:false}));s.particleCursor=0;}
  function emit(s,type,x,y,count,opts={}){
    const q=s.quality;count=Math.max(1,Math.floor(count*q));
    for(let i=0;i<count;i++){
      let p=null;
      for(let tries=0;tries<s.particles.length;tries++){const idx=(s.particleCursor++)%s.particles.length;if(!s.particles[idx].active){p=s.particles[idx];break;}}
      if(!p)return;
      const a=(opts.angle??Math.random()*Math.PI*2)+(Math.random()-.5)*(opts.arc??Math.PI*2),sp=J.U.rnd(opts.speedMin??18,opts.speedMax??95);
      Object.assign(p,{active:true,type,x,y,vx:Math.cos(a)*sp+(opts.vx||0),vy:Math.sin(a)*sp+(opts.vy||0),life:opts.life??J.U.rnd(.25,.8),maxLife:0,size:opts.size??J.U.rnd(1.5,4),rot:Math.random()*6.28,vr:(Math.random()-.5)*7,gravity:opts.gravity??0,alpha:opts.alpha??1});p.maxLife=p.life;
    }
  }
  function update(s,dt){
    for(const p of s.particles){
      if(!p.active)continue;p.life-=dt;if(p.life<=0){p.active=false;continue;}p.vy+=p.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
      if(p.type==='smoke'){p.vx*=.985;p.vy-=5*dt;p.size+=7*dt;}else if(p.type==='fire'){p.size*=.995;}else if(p.type==='muzzle'){p.vx*=.90;p.vy*=.90;}
    }
  }
  function render(s,ctx){
    for(const p of s.particles){
      if(!p.active)continue;const t=p.life/p.maxLife;ctx.globalAlpha=Math.min(1,t*1.7)*p.alpha;
      switch(p.type){
        case 'spark':
          ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle='#ffd176';ctx.fillRect(-p.size*1.2,-.45,p.size*2.4,.9);ctx.restore();break;
        case 'dirt':
          ctx.fillStyle=t>.5?'#755932':'#3f3425';ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fill();break;
        case 'blood':
          ctx.fillStyle='#6c1612';ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fill();break;
        case 'smoke':
          ctx.fillStyle=t>.58?'rgba(58,58,48,.67)':'rgba(38,40,35,.48)';ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,6.28);ctx.fill();break;
        case 'fire':
          ctx.fillStyle=t>.62?'#ffe07a':t>.28?'#e9802e':'#b74321';ctx.beginPath();ctx.ellipse(p.x,p.y,p.size*.72,p.size*1.18,p.rot,0,6.28);ctx.fill();break;
        case 'debris':
          ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle='#403a2d';ctx.fillRect(-p.size,-p.size*.45,p.size*2,p.size*.9);ctx.restore();break;
        case 'ember':
          ctx.fillStyle=t>.45?'#ffcf58':'#d85d26';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.6,p.size*t),0,6.28);ctx.fill();break;
        case 'muzzle':
          ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.vy,p.vx));ctx.globalCompositeOperation='screen';ctx.fillStyle=t>.5?'#fff0aa':'#ff9f3f';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-p.size*3,p.size*.65);ctx.lineTo(-p.size*2.1,-p.size*.65);ctx.closePath();ctx.fill();ctx.restore();break;
      }
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
  J.Particles={init,emit,update,render};
})();
