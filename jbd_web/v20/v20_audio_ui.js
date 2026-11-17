/* BUNKER DEFENSE 2.0 — ADDITIVE MIXER AND IN-GAME SETTINGS.
   Keep the existing recorded sounds. No oscillator/noise placeholders. */
var v20AmbientClock=15,v20AmbientPlaying=false;
function v20Clamp(n){return Math.max(0,Math.min(100,Number(n)||0));}
function v20LoadSettings(){
 try{
  var stored=JSON.parse(localStorage.getItem('jbd_v20_mix')||'{}');
  if(V20_CONFIG[stored.quality])v20Settings.quality=stored.quality;
  if(typeof stored.polish==='boolean')v20Settings.polish=stored.polish;
  ['fx','ambient','music'].forEach(function(k){
   if(Object.prototype.hasOwnProperty.call(stored,k))v20Settings[k]=v20Clamp(stored[k]);
  });
 }catch(_){}
}
function v20SaveSettings(){
 try{localStorage.setItem('jbd_v20_mix',JSON.stringify(v20Settings));}catch(_){}
}
function v20InstallMixer(){
 if(!AudioSys)return;
 ['weapon','tone','impact','explosion','vehicle','music'].forEach(function(key){
  if(typeof AudioSys[key]!=='function')return;
  var original=AudioSys[key];
  AudioSys[key]=function(){
   var args=Array.prototype.slice.call(arguments);
   var gain=(v20AmbientPlaying?v20Settings.ambient:
       key==='music'?v20Settings.music:v20Settings.fx)/100;
   // Original AudioSys.weapon(model, role, volume, opts).
   // Original AudioSys.tone/impact(material, volume, opts).
   var index=key==='weapon'?2:1;
   if(typeof args[index]==='number'){
    args[index]=Math.max(0,Math.min(.95,args[index]*gain));
    if(args[index]===0)return;
   }
   return original.apply(this,args);
  };
 });
}
function v20AmbientUpdate(dt){
 if(!v20Campaign()||gameState.mode!=='playing'||gameState.v108Offer)return;
 v20AmbientClock-=dt;
 if(v20AmbientClock>0)return;
 v20AmbientClock=20+Math.random()*16;
 if(v20Settings.ambient<=0||typeof AudioSys.weapon!=='function')return;
 // Reuse the ORIGINAL recorded MG34 sample very quietly and far offscreen.
 // Never add a synthetic buzz, tone or noise loop to replace quality audio.
 v20AmbientPlaying=true;
 try{AudioSys.weapon('MG34','lmg',.055,{pan:Math.random()>.5?.86:-.86});}
 catch(_){/* Optional ambience must not crash the game. */}
 finally{v20AmbientPlaying=false;}
}
function v20MakeSlider(title,key){
 var label=document.createElement('label');
 label.style.cssText='display:block;margin-top:12px;font:700 12px system-ui;color:#eae2c9';
 label.textContent=title;
 var count=document.createElement('span');count.textContent=String(v20Settings[key])+'%';
 count.style.cssText='float:right;color:#e1bf65';
 var input=document.createElement('input');
 input.setAttribute('aria-label',title);input.type='range';input.min=0;input.max=100;
 input.step=1;input.value=v20Settings[key];
 input.style.cssText='display:block;width:100%;accent-color:#e3be61;min-height:35px;touch-action:pan-x';
 input.addEventListener('input',function(){
  v20Settings[key]=v20Clamp(input.value);count.textContent=v20Settings[key]+'%';v20SaveSettings();
 });
 label.appendChild(count);label.appendChild(input);return label;
}
function v20InitSettings(){
 if(typeof document==='undefined'||!document.body||v20SettingsPanel)return;
 var root=document.createElement('div');root.id='v20Controls';
 root.style.cssText='position:fixed;right:8px;top:max(8px,env(safe-area-inset-top));z-index:45;font-family:system-ui';
 var toggle=document.createElement('button');toggle.type='button';
 toggle.id='v20Toggle';toggle.textContent='⚙ BEELD / GELUID';
 toggle.style.cssText='font:900 10px system-ui;color:#f7eed7;background:#24382b;border:1px solid #e2c673;border-radius:8px;padding:7px 10px;min-height:35px;touch-action:manipulation';
 toggle.setAttribute('aria-label','Instellingen beeld en geluid');
 var body=document.createElement('div');body.id='v20Panel';
 body.style.cssText='display:none;width:min(86vw,335px);max-height:74vh;overflow:auto;background:#1e2b21;color:#f3ecd7;border:2px solid #ddbf6d;border-radius:12px;margin-top:6px;padding:17px;box-shadow:0 12px 45px #0009';
 var header=document.createElement('div');header.textContent='BUNKER DEFENSE 2.0';
 header.style.cssText='color:#ebc970;font:900 17px system-ui;letter-spacing:.04em';
 body.appendChild(header);
 var explanation=document.createElement('div');
 explanation.textContent='Originele sprites behouden · extra effecten instelbaar';
 explanation.style.cssText='font:11px/1.6 system-ui;color:#b9c7ac;margin:4px 0 13px';
 body.appendChild(explanation);
 var quality=document.createElement('div');quality.textContent='GRAFISCHE KWALITEIT';
 quality.style.cssText='font:900 11px system-ui;margin:8px 0';body.appendChild(quality);
 var buttons=[];
 [['high','HOOG'],['normal','NORMAAL'],['performance','PRESTATIE']].forEach(function(item){
  var button=document.createElement('button');button.type='button';
  button.textContent=item[1];
  button.style.cssText='font:900 10px system-ui;padding:10px 7px;margin-right:5px;margin-bottom:5px;background:#344735;color:#f5e8c7;border:1px solid #98845e;border-radius:6px;touch-action:manipulation';
  button.addEventListener('click',function(){
   v20Settings.quality=item[0];v20SaveSettings();updateButtons();
  });
  buttons.push({id:item[0],button:button});body.appendChild(button);
 });
 function updateButtons(){buttons.forEach(function(p){
  p.button.style.background=p.id===v20Settings.quality?'#85652d':'#344735';
 });} updateButtons();
 var compare=document.createElement('label');
 compare.style.cssText='display:block;margin:11px 0;font:800 11px/1.4 system-ui;color:#f1d389';
 var check=document.createElement('input');check.type='checkbox';check.checked=v20Settings.polish;
 check.style.cssText='margin-right:9px;accent-color:#e1be62;min-width:17px;min-height:17px';
 check.setAttribute('aria-label','Extra 2.0-effectlaag aan of uit voor vergelijking');
 check.addEventListener('change',function(){
  v20Settings.polish=!!check.checked;
  if(!v20Settings.polish){v20Lights.length=0;v20Particles.length=0;}
  v20SaveSettings();
 });
 compare.appendChild(check);
 var labelText=document.createElement('span');labelText.textContent='2.0-EFFECTLAAG (A/B VERGELIJKEN)';compare.appendChild(labelText);
 body.appendChild(compare);
 body.appendChild(v20MakeSlider('EFFECTEN','fx'));
 body.appendChild(v20MakeSlider('OMGEVING','ambient'));
 body.appendChild(v20MakeSlider('MUZIEK (GEEN TRACK TOEGEVOEGD)','music'));
 var note=document.createElement('p');
 note.textContent='Prestatie verlaagt uitsluitend extra licht, stof en vonken. Alle originele graphics, effecten en wapens blijven werken.';
 note.style.cssText='font:11px/1.5 system-ui;color:#b7c5ae;margin:12px 0';
 body.appendChild(note);
 var close=document.createElement('button');close.type='button';close.textContent='VERDER SPELEN';
 close.style.cssText='width:100%;min-height:44px;background:#e2bd62;color:#252c23;font:900 12px system-ui;border:0;border-radius:8px;touch-action:manipulation';
 function show(open){
  v20SettingsOpen=open;body.style.display=open?'block':'none';
  toggle.textContent=open?'✕ INSTELLINGEN':'⚙ BEELD / GELUID';
 }
 toggle.addEventListener('click',function(){show(!v20SettingsOpen);});
 close.addEventListener('click',function(){show(false);});
 body.appendChild(close);root.appendChild(toggle);root.appendChild(body);
 document.body.appendChild(root);v20SettingsPanel=root;
}
v20LoadSettings();
v20InstallMixer();
v20InitSettings();