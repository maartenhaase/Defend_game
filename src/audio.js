'use strict';

let ac=null,master=null,compressor=null,ambience=null;
function startAmbience(){
 if(!ac||ambience)return;
 const len=Math.floor(ac.sampleRate*2.0);
 const mk=(amount=.03)=>{
  const buf=ac.createBuffer(1,len,ac.sampleRate),a=buf.getChannelData(0);
  let b=0;
  for(let i=0;i<len;i++){
   b=(b+(Math.random()*2-1)*amount)*.985;
   a[i]=b;
  }
  const src=ac.createBufferSource();src.buffer=buf;src.loop=true;return src
 };
 const surf=mk(.025),hiss=mk(.010);
 const low=ac.createBiquadFilter();low.type='lowpass';low.frequency.value=520;
 const band=ac.createBiquadFilter();band.type='bandpass';band.frequency.value=130;band.Q.value=.55;
 const high=ac.createBiquadFilter();high.type='highpass';high.frequency.value=900;
 const g1=ac.createGain();g1.gain.value=.012;
 const g2=ac.createGain();g2.gain.value=.003;
 surf.connect(low);low.connect(band);band.connect(g1);g1.connect(master);
 hiss.connect(high);high.connect(g2);g2.connect(master);
 surf.start();hiss.start();
 ambience={surf,hiss,g1,g2,band}
}
function updateAmbience(){
 if(!ac||!ambience)return;
 const t=ac.currentTime;
 const target=state.phase==='wave'?.022:.010;
 ambience.g1.gain.setTargetAtTime(target,t,.22);
 ambience.g2.gain.setTargetAtTime(target*.26,t,.30);
 ambience.band.frequency.setTargetAtTime(state.phase==='wave'?155:120,t,.35)
}
function audioInit(){
 if(ac)return;
 ac=new (window.AudioContext||window.webkitAudioContext)();
 master=ac.createGain();master.gain.value=.18;
 compressor=ac.createDynamicsCompressor();compressor.threshold.value=-22;compressor.knee.value=12;compressor.ratio.value=5.5;compressor.attack.value=.004;compressor.release.value=.18;
 master.connect(compressor);compressor.connect(ac.destination);
 startAmbience()
}
function tone(freq=180,dur=.04,type='square',gain=.10,slide=-50,when=0){
 if(!ac)return;const t=ac.currentTime+when,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(28,freq+slide),t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur)
}
function noise(dur=.04,gain=.05,when=0,step=1){
 if(!ac)return;const rate=Math.max(2205,Math.floor(ac.sampleRate/Math.max(1,step))),n=Math.max(8,Math.floor(rate*dur)),buf=ac.createBuffer(1,n,rate),a=buf.getChannelData(0);let hold=0;for(let i=0;i<n;i++){if(i%Math.max(1,Math.floor(step))===0)hold=Math.random()*2-1;a[i]=hold}const s=ac.createBufferSource(),g=ac.createGain(),t=ac.currentTime+when;s.buffer=buf;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(g);g.connect(master);s.start(t)
}
function fm(freq=180,modFreq=75,index=90,dur=.06,gain=.08,when=0,slide=.72,type='square'){
 if(!ac)return;const t=ac.currentTime+when,carrier=ac.createOscillator(),mod=ac.createOscillator(),modGain=ac.createGain(),amp=ac.createGain();carrier.type=type;mod.type='sine';carrier.frequency.setValueAtTime(freq,t);carrier.frequency.exponentialRampToValueAtTime(Math.max(25,freq*slide),t+dur);mod.frequency.setValueAtTime(modFreq,t);modGain.gain.setValueAtTime(index,t);modGain.gain.exponentialRampToValueAtTime(Math.max(1,index*.12),t+dur);amp.gain.setValueAtTime(gain,t);amp.gain.exponentialRampToValueAtTime(.001,t+dur);mod.connect(modGain);modGain.connect(carrier.frequency);carrier.connect(amp);amp.connect(master);mod.start(t);carrier.start(t);mod.stop(t+dur);carrier.stop(t+dur)
}
function subPunch(freq=52,gain=.12,when=0,dur=.16){fm(freq,18,34,dur,gain,when,.42,'sine');tone(freq*.72,dur*.9,'sine',gain*.65,-freq*.35,when+.006)}
function lowRumble(dur=.30,gain=.10,when=0){
 if(!ac)return;
 const rate=5512,n=Math.max(32,Math.floor(rate*dur));
 const buf=ac.createBuffer(1,n,rate),a=buf.getChannelData(0);
 let hold=0;
 for(let i=0;i<n;i++){
  if(i%7===0)hold=(Math.random()*2-1)*.75;
  a[i]=hold
 }
 const s=ac.createBufferSource(),filter=ac.createBiquadFilter(),g=ac.createGain(),t=ac.currentTime+when;
 s.buffer=buf;filter.type='lowpass';filter.frequency.setValueAtTime(260,t);filter.Q.value=1.2;
 g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
 s.connect(filter);filter.connect(g);g.connect(master);s.start(t)
}
function deepFM(freq=48,dur=.20,gain=.12,when=0){
 fm(freq,freq*.47,190,dur,gain,when,.26,'sawtooth');
 fm(freq*.55,freq*.18,85,dur*.92,gain*.62,when+.004,.38,'sine')
}

function chipCrack(freq=180,when=0,power=1){fm(freq,freq*.43,115*power,.06,.052*power,when,.58,'square');noise(.032,.025*power,when,6)}
function gunSound(ammoType=selectedAmmo){
 const mode=playerModeStats(ammoType);
 if(ammoType==='normal'){
  const shots=Math.min(mode.burst,6);
  for(let i=0;i<shots;i++){
   const when=i*mode.burstGap;
   chipCrack(state.gunLvl<4?228:state.gunLvl<7?176:126,when,1.05);
   tone(82,.028,'square',.012,-18,when)
  }
  subPunch(58,.075,.004,.12);
  noise(.030,.018,.01,7);
  return
 }
 if(ammoType==='ap'){
  chipCrack(126,0,1.2);
  deepFM(44,.18,.12,.002);
  tone(76,.09,'triangle',.018,-18,.004);
  noise(.045,.032,.006,7);
  return
 }
 deepFM(31,.25,.155,.002);
 subPunch(36,.13,.01,.24);
 lowRumble(.22,.10,.018);
 tone(58,.10,'triangle',.018,-20,0)
}
const sfx={
 ui:()=>fm(500,160,45,.04,.032,0,.80),
 hit:()=>{deepFM(41,.10,.045,0);noise(.04,.025,0,6)},
 boom:()=>{deepFM(29,.34,.20,0);subPunch(31,.17,.01,.30);lowRumble(.40,.15,.015);noise(.24,.10,.02,10)},
 vehicleBoom:()=>{deepFM(23,.48,.25,0);subPunch(27,.22,.015,.42);lowRumble(.58,.20,.02);noise(.34,.15,.03,11)},
 disabled:()=>{fm(95,31,125,.18,.060,0,.45,'square');deepFM(38,.18,.055,.02);noise(.11,.035,.03,10)},
 grenade:()=>{deepFM(39,.22,.12,0);lowRumble(.22,.075,.01);noise(.10,.07,0,8)},
 grenadeThrow:()=>{fm(245,70,52,.045,.022,0,.72);noise(.025,.012,0,6)},
 enemy:()=>{fm(118,44,92,.05,.024,0,.52);subPunch(43,.032,0,.08)},
 enemyCannon:()=>{deepFM(31,.24,.13,0);subPunch(34,.12,.006,.20);lowRumble(.25,.09,.01);noise(.10,.055,.015,9)},
 sniper:()=>{fm(610,205,125,.035,.038,0,.28);deepFM(46,.12,.060,.012);noise(.022,.025,0,5)},
 ricochet:()=>fm(720,240,95,.05,.035,0,.28),
 loaded:()=>{fm(640,130,55,.075,.040,0,.72,'square');tone(910,.045,'square',.025,40,.055)},
 landing:()=>{deepFM(38,.28,.058,0);fm(52,17,70,.30,.040,0,.76,'sawtooth');lowRumble(.24,.035,.03)},
 para:()=>{fm(145,22,28,.22,.024,0,.88,'sine');noise(.15,.012,.01,15)},
 trench:()=>{fm(145,54,54,.040,.013,0,.62);subPunch(42,.011,0,.055)},
 trenchDown:()=>{deepFM(28,.32,.16,0);lowRumble(.28,.11,.01);noise(.20,.11,0,9)},
 whiz:()=>{fm(980,180,48,.05,.014,0,.78,'sine');tone(740,.04,'sine',.012,-120,.01)},
 death:()=>{noise(.055,.024,0,5);tone(72,.07,'triangle',.018,-26,0)},
 enemyReload:()=>{tone(640,.025,'square',.012,80,0);tone(410,.025,'square',.009,-40,.035)},
 step:()=>{noise(.025,.008,0,12);tone(54,.025,'triangle',.005,-12,0)},
 motorcycle:()=>{fm(74,27,38,.12,.012,0,.90,'sawtooth');tone(112,.10,'square',.006,-15,.01)}
};
addEventListener('pointerdown',audioInit,{once:true});
