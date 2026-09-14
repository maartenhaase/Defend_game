(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;

  function start(s){
    if(s.airborne.started)return;
    s.airborne.started=true;s.airborne.t=0;s.airborne.finished=false;s.airborne.dropped=0;
    const y=s.safe.top+Math.max(82,s.viewport.h*C.airborne.planeYRatio);
    const pid=70001+(s.campaign?.index||0)+(s.campaign?.cycle||1)*20;
    s.airborne.plane={id:pid,x:-92,y,prevX:-92,speed:C.airborne.planeSpeed*(s.scenario?.theme==='polar'?1.08:1),prop:0,phase:0,active:true};
    s.ui.message='AIRBORNE CONTACT';s.ui.messageT=1.05;J.Audio.play('planeApproach',{x:0,variation:s.rng()});J.Audio.aircraftMotor(s.airborne.plane.id,{x:0,active:true});
  }

  function spawnPara(s,x,y,index){
    const r=s.rng,landY=s.viewport.h*U.rnd(C.airborne.landingMinRatio,C.airborne.landingMaxRatio,r);
    const p={id:30000+index,x,baseX:x,y,landingY:landY,hp:C.airborne.hp*(s.scenario?.airborneHpMult||1),state:'DESCENT',phase:r()*6.28,rot:(r()-.5)*.16,vy:C.airborne.descentSpeed*(.92+r()*.16),alpha:1,deadT:0};
    s.airborne.paratroopers.push(p);J.Audio.play('chuteOpen',{x,variation:r()});
  }

  function maybeDrop(s){
    const a=s.airborne,plane=a.plane;if(!plane||!plane.active)return;
    const count=s.scenario?.airborneCount??C.airborne.dropCount;
    while(a.dropped<count){
      const f=a.dropped/Math.max(1,count-1);
      const trigger=s.viewport.w*(C.airborne.dropStartRatio+(C.airborne.dropEndRatio-C.airborne.dropStartRatio)*f);
      if(plane.x<trigger)break;
      spawnPara(s,plane.x-8,plane.y+15,a.dropped);a.dropped++;
    }
  }

  function land(s,p){
    p.state='LANDED';p.alpha=0;
    s.airborne.collapsed.push({x:p.x,y:p.landingY,t:0,life:C.airborne.collapsedLife,rot:p.phase*.25});
    const e=J.Infantry.spawn(s,p.x,p.landingY,{coverIntent:false,reCoverT:1.15});e.assaultT=.75;e.suppression=.08;
    s.stats.landedParas++;J.Audio.play('paraLand',{x:p.x,variation:s.rng()});
  }

  function kill(s,p,kind='mg'){
    if(p.state!=='DESCENT')return false;p.state='DEAD';p.deadT=0;p.vy=92;s.stats.airKills++;
    J.Audio.play('cloth',{x:p.x,variation:Math.random()});J.Particles.emit(s,'blood',p.x,p.y,kind==='he'?8:4,{speedMin:15,speedMax:70,life:.38,gravity:55,size:1.5});return true;
  }

  function damage(s,p,amount,kind){
    if(p.state!=='DESCENT')return false;p.hp-=amount;if(p.hp<=0)return kill(s,p,kind);return false;
  }

  function hitProjectile(s,b){
    let best=null,bestD=1e9;
    for(const p of s.airborne.paratroopers){
      if(p.state!=='DESCENT')continue;
      const ax=b.px,ay=b.py,dx=b.x-ax,dy=b.y-ay,l2=dx*dx+dy*dy||1,t=U.clamp(((p.x-ax)*dx+(p.y-ay)*dy)/l2,0,1),px=ax+dx*t,py=ay+dy*t,d=Math.hypot(p.x-px,p.y-py);
      if(d<C.airborne.hitRadius&&d<bestD){best=p;bestD=d;}
    }
    if(!best)return false;
    if(b.kind==='he')return {para:best,detonate:true};
    damage(s,best,C.weapons[b.kind].damage,b.kind);b.active=false;s.stats.hits++;return {para:best,detonate:false};
  }

  function blastDamage(s,x,y,radius,baseDamage){
    for(const p of s.airborne.paratroopers){if(p.state!=='DESCENT')continue;const d=Math.hypot(p.x-x,p.y-y);if(d<radius*.92){const fall=1-d/(radius*.92);damage(s,p,baseDamage*(.42+.72*fall),'he');}}
  }

  function update(s,dt){
    if(!s.artillery.finished)return;
    const count=s.scenario?.airborneCount??C.airborne.dropCount;if(count<=0){s.airborne.finished=true;return;}
    if(!s.airborne.started){
      const t=s.vehicleWave.started?s.vehicleWave.t:0;if(t>=(s.scenario?.airborneStart??C.airborne.startTime))start(s);else return;
    }
    const a=s.airborne;a.t+=dt;
    if(a.plane&&a.plane.active){const q=a.plane;q.prevX=q.x;q.x+=q.speed*dt;q.y+=Math.sin(a.t*1.35)*.12;q.prop=(q.prop+dt*23)%6.28;J.Audio.aircraftMotor(q.id,{x:q.x,active:true});maybeDrop(s);if(q.x>s.viewport.w+102){q.active=false;J.Audio.aircraftMotor(q.id,{x:q.x,active:false});J.Audio.play('planeFade',{x:s.viewport.w,variation:s.rng()});}}
    for(const p of a.paratroopers){
      if(p.state==='DESCENT'){
        p.phase+=dt*C.airborne.swayFreq;p.baseX+=C.airborne.drift*dt;p.x=p.baseX+Math.sin(p.phase)*C.airborne.swayAmp;p.y+=p.vy*dt;p.rot=Math.sin(p.phase*.8)*.10;if(p.y>=p.landingY)land(s,p);
      }else if(p.state==='DEAD'){
        p.deadT+=dt;p.y+=p.vy*dt;p.vy+=58*dt;p.rot+=dt*2.4;if(p.y>=p.landingY){p.state='LANDED';p.alpha=0;s.airborne.collapsed.push({x:p.x,y:p.landingY,t:0,life:C.airborne.collapsedLife,rot:p.rot});J.World.bloodMark(s,p.x,p.landingY,1);}
      }
    }
    for(const c of a.collapsed)c.t+=dt;a.collapsed=a.collapsed.filter(c=>c.t<c.life);
    a.paratroopers=a.paratroopers.filter(p=>p.state!=='LANDED');
    if(a.started&&!a.finished&&a.plane&&!a.plane.active&&a.dropped>=count&&a.paratroopers.length===0)a.finished=true;
  }

  function allResolved(s){return s.airborne.finished;}
  J.Airborne={update,hitProjectile,blastDamage,allResolved,start};
})();
