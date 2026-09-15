(() => {
  const J=window.JBD,C=J.CONFIG;
  function init(s,canvas){
    canvas.style.touchAction='none';canvas.addEventListener('contextmenu',e=>e.preventDefault());
    const pos=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left),y:(e.clientY-r.top)}};
    canvas.addEventListener('pointerdown',e=>{if(s.mode!=='playing')return;e.preventDefault();J.Audio.unlock(s);const p=pos(e);s.input.down=true;s.input.x=p.x;s.input.y=p.y;s.input.downAt=s.simTime;s.input.charge=0;s.input.pointerId=e.pointerId;try{canvas.setPointerCapture(e.pointerId)}catch(_){} });
    canvas.addEventListener('pointermove',e=>{if(!s.input.down||e.pointerId!==s.input.pointerId)return;const p=pos(e);s.input.x=p.x;s.input.y=p.y;});
    const up=e=>{if(!s.input.down||e.pointerId!==s.input.pointerId)return;e.preventDefault();const p=pos(e);s.input.x=p.x;s.input.y=p.y;const hold=Math.max(0,s.simTime-s.input.downAt)*(s.profile?.chargeScale||1);s.input.down=false;s.input.pointerId=null;J.Combat.fireCharge(s,hold,p.x,p.y);};
    canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',e=>{s.input.down=false;s.input.pointerId=null;});
    document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  }
  function update(s,dt){ if(s.input.down){ s.input.charge=Math.min(C.input.maxCharge,(s.simTime-s.input.downAt)*(s.profile?.chargeScale||1)); const dx=s.input.x-s.bunker.x,dy=s.input.y-(s.bunker.y-7); s.bunker.aim=Math.atan2(dy,dx); } else s.input.charge=Math.max(0,s.input.charge-dt*4); }
  J.Input={init,update};
})();
