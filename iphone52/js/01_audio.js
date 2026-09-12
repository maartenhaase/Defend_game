const SAMPLE_DATA={};
let sampleBank={};
function b64buf(b64){const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer}
async function loadSampleBank(){if(!ac)return;for(const [k,v] of Object.entries(SAMPLE_DATA)){try{sampleBank[k]=await ac.decodeAudioData(b64buf(v).slice(0))}catch(err){}}}
function sample(name,gain=.35,rate=1,pan=0,when=0){if(!ac||!sampleBank[name])return false;const src=ac.createBufferSource(),g=ac.createGain(),t=ac.currentTime+when;src.buffer=sampleBank[name];src.playbackRate.value=rate;g.gain.value=gain;let node=g;if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=clamp(pan,-1,1);src.connect(g);g.connect(p);p.connect(master)}else{src.connect(g);g.connect(master)}src.start(t);return true}

let ac=null,master=null,comp=null,amb=null;
function audioInit(){if(ac)return;ac=new (AudioContext||webkitAudioContext)();master=ac.createGain();master.gain.value=.25;comp=ac.createDynamicsCompressor();comp.threshold.value=-22;comp.knee.value=10;comp.ratio.value=6;comp.attack.value=.003;comp.release.value=.22;master.connect(comp);comp.connect(ac.destination);startAmbience();loadSampleBank()}
function osc(freq,dur,type='square',gain=.04,slide=.7,when=0){if(!ac)return;const t=ac.currentTime+when,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(24,freq*slide),t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur)}
function noise(dur=.06,gain=.03,when=0,cut=2500){if(!ac)return;const n=Math.max(32,Math.floor(ac.sampleRate*dur)),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),t=ac.currentTime+when;s.buffer=b;f.type='lowpass';f.frequency.value=cut;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t)}
function shotSound(type){const pan=.32;if(type==='mg'){if(!sample('mg',.52,rnd(.94,1.06),pan))osc(190,.055,'square',.055,.48);osc(66,.08,'triangle',.022,.62)}else if(type==='ap'){if(!sample('ap',.68,rnd(.96,1.03),pan))osc(78,.17,'sawtooth',.10,.35);osc(34,.25,'sine',.08,.45)}else{if(!sample('he',.70,rnd(.96,1.02),pan))osc(52,.22,'triangle',.09,.42);osc(27,.34,'sine',.10,.48)}}
function enemySound(e){const p=isoAS(e.a,e.s),pan=clamp((p.x/W)*2-1,-.85,.85);if(!ac)return;if(e.heavy){sample('ap',.18,rnd(.75,.88),pan);osc(54,.13,'sawtooth',.035,.48)}else if(e.vehicle){sample('enemy_rifle',.16,rnd(.72,.88),pan)}else sample('enemy_rifle',.23,rnd(.94,1.07),pan)}
function boom(big=false){if(!sample('he',big?.75:.48,big?.78:1.08,rnd(-.35,.35)))osc(big?28:38,big?.48:.26,'sine',big?.15:.09,.42);osc(big?26:42,big?.42:.22,'sine',big?.11:.065,.46,.01)}
function uiSound(){osc(560,.04,'square',.025,.85)}
function startAmbience(){if(!ac||amb)return;const len=ac.sampleRate*2,b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<len;i++){v=(v+(Math.random()*2-1)*.018)*.993;d[i]=v}const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;s.loop=true;f.type='bandpass';f.frequency.value=410;f.Q.value=.48;g.gain.value=.010;s.connect(f);f.connect(g);g.connect(master);s.start();amb={s,f,g};setTimeout(()=>{if(sampleBank.jungle){const j=ac.createBufferSource(),jg=ac.createGain();j.buffer=sampleBank.jungle;j.loop=true;j.playbackRate.value=.93;jg.gain.value=.055;j.connect(jg);jg.connect(master);j.start()}},250)}
addEventListener('pointerdown',audioInit,{once:true});

function targetClass(e){if(e.fort||e.dugIn||e.inTrench)return'cover';if(e.kind==='armor')return'armor';return'personnel'}
function effectiveness(ammo,e){let c=targetClass(e),v=EFF[ammo][c];if(e.type==='motorcycle'&&ammo==='mg')v=1.5;if(e.heavy&&ammo!=='ap')v*=.25;if(e.type==='fieldbunker'&&ammo==='he')v=1.85;if(e.type==='engineer'&&ammo==='mg')v=1.35;return v}
function counterGrade(ammo,e){const best=BEST[targetClass(e)];if(ammo===best)return'good';const eff=effectiveness(ammo,e);return eff>=.65?'ok':'bad'}
function counterText(e){return targetClass(e)==='personnel'?'MG':targetClass(e)==='armor'?'AP':'HE'}
function award(e,ammo){if(e.rewarded)return;e.rewarded=true;let mult=ammo===BEST[targetClass(e)]?2.0:(counterGrade(ammo,e)==='ok'?.9:.38);if(ammo===BEST[targetClass(e)]){state.chain=Math.min(6,state.chain+1);state.chainClock=4;mult*=1+(state.chain-1)*.10}else{state.chain=Math.max(0,state.chain-1)}const gain=Math.max(1,Math.round((DEF[e.type]?.reward||2)*mult));state.supply+=gain;state.waveBounty+=gain;floater(e.a,e.s,`+${gain} SUP`,ammo===BEST[targetClass(e)]?AMMOCOL[ammo]:C.white)}
function floater(a,s,text,col=C.white){state.fx.push({kind:'text',a,s,t:0,life:.75,text,col})}

// ---------- WAVE / SPAWN ----------
