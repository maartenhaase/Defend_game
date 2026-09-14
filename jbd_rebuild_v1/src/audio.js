(() => {
  const J=window.JBD, C=J.CONFIG;
  const A={ctx:null,master:null,buses:{},noise:null,ambience:null,wind:null,vehicleLoops:new Map()};

  function unlock(s){
    try{
      if(!A.ctx){
        const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
        const ctx=A.ctx=new AC();
        const master=ctx.createGain();master.gain.value=C.audio.master;
        const comp=ctx.createDynamicsCompressor();comp.threshold.value=-8;comp.knee.value=7;comp.ratio.value=8;comp.attack.value=.003;comp.release.value=.18;
        master.connect(comp).connect(ctx.destination);A.master=master;
        for(const k of ['weapons','explosions','vehicles','ambience','ui']){const g=ctx.createGain();g.gain.value=k==='ambience'?.13:k==='vehicles'?.72:1;g.connect(master);A.buses[k]=g;}
        const b=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;A.noise=b;
        startAmbience();
      }
      A.ctx.resume();s.audioReady=true;
    }catch(e){s.audioReady=false;}
  }

  function panNode(x){
    const p=A.ctx.createStereoPanner?A.ctx.createStereoPanner():A.ctx.createGain();
    if(p.pan)p.pan.value=J.U.clamp((x/(innerWidth||390))*2-1,-1,1);return p;
  }

  function envGain(t0,attack,hold,release,vol){
    const g=A.ctx.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(.001,vol),t0+attack);g.gain.setValueAtTime(Math.max(.001,vol),t0+attack+hold);g.gain.exponentialRampToValueAtTime(.0001,t0+attack+hold+release);return g;
  }

  function osc(type,f0,f1,dur,vol,bus,x,delay=0){
    if(!A.ctx)return;const t=A.ctx.currentTime+delay,o=A.ctx.createOscillator(),g=envGain(t,.002,dur*.28,dur*.72,vol),p=panNode(x);
    o.type=type;o.frequency.setValueAtTime(Math.max(20,f0),t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);o.connect(g).connect(p).connect(A.buses[bus]);o.start(t);o.stop(t+dur+.03);
  }

  function noise(dur,vol,freq,bus,x,attack=.001,filterType='lowpass',delay=0){
    if(!A.ctx)return;const t=A.ctx.currentTime+delay,src=A.ctx.createBufferSource(),f=A.ctx.createBiquadFilter(),g=envGain(t,attack,dur*.12,dur*.88,vol),p=panNode(x);
    src.buffer=A.noise;f.type=filterType;f.frequency.value=freq;src.connect(f).connect(g).connect(p).connect(A.buses[bus]);src.start(t,Math.random());src.stop(t+dur+.05);
  }

  function metalRing(x,variation=.5,vol=.06,delay=0){const r=.97+variation*.06;osc('sine',2200*r,1350*r,.075,vol,'weapons',x,delay);osc('triangle',3100*r,1800*r,.045,vol*.55,'weapons',x,delay+.004);}

  function play(name,{x=innerWidth/2,variation=Math.random()}={}){
    if(!A.ctx||A.ctx.state==='suspended')return;const r=.96+variation*.08;
    if(name==='mg'){
      noise(.045,.26,5200,'weapons',x,.001,'highpass');noise(.07,.18,2500,'weapons',x);osc('square',130*r,84,.055,.065,'weapons',x);metalRing(x,variation,.025,.006);
    }else if(name==='enemyRifle'){
      noise(.055,.16,3900,'weapons',x,.001,'highpass');osc('triangle',125*r,78,.065,.038,'weapons',x);
    }else if(name==='vehicleMg'){
      noise(.06,.23,4300,'weapons',x,.001,'highpass');osc('square',112*r,70,.075,.075,'weapons',x);metalRing(x,variation,.02,.004);
    }else if(name==='ap'){
      noise(.075,.46,4700,'weapons',x,.001,'highpass');noise(.14,.24,2200,'weapons',x);osc('triangle',178*r,58,.18,.22,'weapons',x);metalRing(x,variation,.09,.004);
    }else if(name==='tankGun'){
      noise(.105,.62,5100,'weapons',x,.001,'highpass');noise(.34,.34,1700,'explosions',x,.003);osc('triangle',92*r,31,.48,.42,'explosions',x);noise(.72,.10,520,'explosions',x,.02);
    }else if(name==='heLaunch'){
      noise(.14,.36,2400,'weapons',x);osc('sine',108*r,43,.24,.30,'weapons',x);noise(.22,.12,640,'weapons',x,.008);
    }else if(name==='explosion'){
      noise(.52,.46,1550,'explosions',x,.002);osc('sine',82*r,36,.48,.34,'explosions',x);noise(.92,.17,520,'explosions',x,.01);noise(.18,.07,3900,'explosions',x,.012,'highpass',.035);
    }else if(name==='vehicleExplosion'){
      noise(.70,.66,1400,'explosions',x,.001);osc('triangle',66*r,27,.72,.52,'explosions',x);noise(1.15,.20,430,'explosions',x,.018);metalRing(x,variation,.05,.035);
    }else if(name==='artillery'){
      noise(.74,.64,1380,'explosions',x,.002);osc('triangle',70*r,29,.64,.44,'explosions',x);noise(1.2,.16,470,'explosions',x,.015);noise(.24,.09,4200,'explosions',x,.001,'highpass',.025);
    }else if(name==='whistle'){
      osc('sine',1900*r,410,.66,.075,'explosions',x);noise(.48,.025,3200,'explosions',x,.02,'highpass');
    }else if(name==='assaultWhistle'){
      osc('sine',2350*r,1450*r,.16,.095,'ui',x,0);osc('sine',2550*r,1650*r,.17,.105,'ui',x,.22);noise(.05,.028,5200,'ui',x,.001,'highpass',0);noise(.05,.03,5200,'ui',x,.001,'highpass',.22);
    }else if(name==='troopDrop'){
      noise(.08,.055,1600,'vehicles',x);osc('triangle',88*r,62,.12,.032,'vehicles',x);
    }else if(name==='hit'){
      noise(.045,.12,2100,'weapons',x);
    }else if(name==='cloth'){
      noise(.07,.08,950,'weapons',x);
    }else if(name==='soilImpact'){
      noise(.075,.07,780,'weapons',x);osc('sine',85*r,55,.045,.025,'weapons',x);
    }else if(name==='armorImpact'){
      noise(.04,.11,5000,'weapons',x,.001,'highpass');metalRing(x,variation,.075,.002);
    }else if(name==='ricochet'){
      metalRing(x,variation,.095);osc('sine',2600*r,720,.16,.05,'weapons',x,.01);
    }else if(name==='armorBreak'){
      noise(.10,.18,3600,'weapons',x,.001,'highpass');metalRing(x,variation,.14);osc('triangle',155*r,61,.20,.10,'explosions',x);
    }else if(name==='bunkerHit'){
      noise(.06,.10,3600,'weapons',x,.001,'highpass');metalRing(x,variation,.05);osc('triangle',120,70,.08,.045,'weapons',x);
    }else if(name==='bunkerShellHit'){
      noise(.22,.37,2200,'explosions',x,.001);osc('triangle',78*r,34,.38,.29,'explosions',x);metalRing(x,variation,.055,.01);
    }
  }

  function vehicleMotor(id,{x=innerWidth/2,speed=0,type='truck',active=true}={}){
    if(!A.ctx||!A.buses.vehicles)return;const now=A.ctx.currentTime;let h=A.vehicleLoops.get(id);
    if(!active){if(h){try{h.gain.gain.cancelScheduledValues(now);h.gain.gain.setTargetAtTime(.0001,now,.08);h.o1.stop(now+.35);h.o2.stop(now+.35);}catch(_){}A.vehicleLoops.delete(id);}return;}
    if(!h){
      const p=panNode(x),lp=A.ctx.createBiquadFilter(),gain=A.ctx.createGain(),o1=A.ctx.createOscillator(),o2=A.ctx.createOscillator();lp.type='lowpass';lp.frequency.value=420;gain.gain.value=.0001;o1.type='sawtooth';o2.type='triangle';o1.connect(lp);o2.connect(lp);lp.connect(gain).connect(p).connect(A.buses.vehicles);o1.start();o2.start();h={p,lp,gain,o1,o2};A.vehicleLoops.set(id,h);
    }
    const heavy=type==='tank'||type==='stug'||type==='halftrack',base=heavy?38:48,f=base+Math.min(38,speed*.52);h.o1.frequency.setTargetAtTime(f,now,.08);h.o2.frequency.setTargetAtTime(f*2.02,now,.08);h.lp.frequency.setTargetAtTime(heavy?360:520,now,.12);h.gain.gain.setTargetAtTime((heavy?.035:.026)*(speed<8?.55:1),now,.09);if(h.p.pan)h.p.pan.setTargetAtTime(J.U.clamp((x/(innerWidth||390))*2-1,-1,1),now,.08);
  }

  function startAmbience(){
    if(!A.ctx||A.ambience)return;const src=A.ctx.createBufferSource(),band=A.ctx.createBiquadFilter(),g=A.ctx.createGain();src.buffer=A.noise;src.loop=true;band.type='bandpass';band.frequency.value=620;band.Q.value=.35;g.gain.value=.026;src.connect(band).connect(g).connect(A.buses.ambience);src.start();A.ambience=src;
    const wind=A.ctx.createBufferSource(),lp=A.ctx.createBiquadFilter(),wg=A.ctx.createGain();wind.buffer=A.noise;wind.loop=true;lp.type='lowpass';lp.frequency.value=240;wg.gain.value=.018;wind.connect(lp).connect(wg).connect(A.buses.ambience);wind.start();A.wind=wind;
    const insect=A.ctx.createOscillator(),ig=A.ctx.createGain();insect.type='sine';insect.frequency.value=3250;ig.gain.value=.0022;insect.connect(ig).connect(A.buses.ambience);insect.start();
  }

  J.Audio={unlock,play,vehicleMotor};
})();
