(() => {
  const J=window.JBD, C=J.CONFIG;
  const A={ctx:null,master:null,buses:{},noise:null,ambience:null};
  function unlock(s){
    try{
      if(!A.ctx){
        const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
        const ctx=A.ctx=new AC(); const master=ctx.createGain(); master.gain.value=C.audio.master;
        const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-8; comp.knee.value=7; comp.ratio.value=8; comp.attack.value=.003; comp.release.value=.18;
        master.connect(comp).connect(ctx.destination); A.master=master;
        for(const k of ['weapons','explosions','ambience','ui']){const g=ctx.createGain();g.gain.value=k==='ambience'?.13:1;g.connect(master);A.buses[k]=g;}
        const b=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=b.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; A.noise=b;
        startAmbience();
      }
      A.ctx.resume(); s.audioReady=true;
    }catch(e){ s.audioReady=false; }
  }
  function panNode(x){const p=A.ctx.createStereoPanner?A.ctx.createStereoPanner():A.ctx.createGain(); if(p.pan)p.pan.value=J.U.clamp((x/(innerWidth||390))*2-1,-1,1); return p;}
  function envGain(t0,attack,hold,release,vol){const g=A.ctx.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(.001,vol),t0+attack);g.gain.setValueAtTime(Math.max(.001,vol),t0+attack+hold);g.gain.exponentialRampToValueAtTime(.0001,t0+attack+hold+release);return g;}
  function osc(type,f0,f1,dur,vol,bus,x){if(!A.ctx)return; const t=A.ctx.currentTime,o=A.ctx.createOscillator(),g=envGain(t,.002,dur*.35,dur*.65,vol),p=panNode(x);o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);o.connect(g).connect(p).connect(A.buses[bus]);o.start(t);o.stop(t+dur+.03);}
  function noise(dur,vol,lp,bus,x,attack=.001){if(!A.ctx)return; const t=A.ctx.currentTime,src=A.ctx.createBufferSource(),f=A.ctx.createBiquadFilter(),g=envGain(t,attack,dur*.12,dur*.88,vol),p=panNode(x);src.buffer=A.noise;f.type='lowpass';f.frequency.value=lp;src.connect(f).connect(g).connect(p).connect(A.buses[bus]);src.start(t,Math.random());src.stop(t+dur+.05);}
  function play(name,{x=innerWidth/2,variation=Math.random()}={}){ if(!A.ctx||A.ctx.state==='suspended') return; const r=.96+variation*.08;
    if(name==='mg'){noise(.055,.24,4200,'weapons',x);osc('square',115*r,80,.06,.07,'weapons',x);osc('triangle',1100*r,650,.025,.035,'weapons',x);}
    else if(name==='ap'){noise(.095,.38,5200,'weapons',x);osc('triangle',150*r,65,.16,.19,'weapons',x);osc('square',1700*r,900,.035,.045,'weapons',x);}
    else if(name==='heLaunch'){noise(.13,.34,2200,'weapons',x);osc('sine',96*r,48,.22,.28,'weapons',x);}
    else if(name==='explosion'){noise(.52,.45,1500,'explosions',x,.002);osc('sine',78*r,38,.48,.34,'explosions',x);noise(.9,.16,600,'explosions',x,.01);}
    else if(name==='artillery'){noise(.72,.62,1350,'explosions',x,.002);osc('triangle',68*r,31,.62,.42,'explosions',x);noise(1.15,.15,500,'explosions',x,.015);}
    else if(name==='whistle'){osc('sine',1850*r,420,.62,.08,'explosions',x);}
    else if(name==='hit'){noise(.045,.12,2100,'weapons',x);}
    else if(name==='cloth'){noise(.07,.08,950,'weapons',x);}
  }
  function startAmbience(){ if(!A.ctx||A.ambience)return; const src=A.ctx.createBufferSource(),f=A.ctx.createBiquadFilter(),g=A.ctx.createGain();src.buffer=A.noise;src.loop=true;f.type='bandpass';f.frequency.value=620;f.Q.value=.35;g.gain.value=.028;src.connect(f).connect(g).connect(A.buses.ambience);src.start();A.ambience=src; }
  J.Audio={unlock,play};
})();
