/* JBD V10.8 — scheduled, earned-by-combat upgrade moments.
   Loaded INSIDE the existing game.js IIFE by build_v108.cjs.
   V10.7 crates, vehicle damage, medics, weapons and maps are untouched. */
var V108_WEIGHTS={magazine:35,mgReload:30,mgDamage:15,mgRate:10,other:10};
var V108_OTHER=['flakDamage','flakSplash','bunkerArmor','flakReload',
 'flakProjectile','mgSpread','flakSpread','penetration','heat','obstacleDamage'];
var V108_LIMITS={magazine:18,mgReload:16,mgDamage:12,mgRate:10};
var v108Ui=null;
function v108Campaign(){return !!(gameState&&v106Campaign()&&gameState.startMode!=='random'&&gameState.startMode!=='demo');}
function v108Schedule(level){
 if(level===1)return [.10,.35,.60,.85];
 if(level===2||level===3)return [.10,.30,.50,.70,.90];
 if(level===4||level===5)return [.10,.25,.40,.55,.70,.90];
 if(level<=10)return [.08,.22,.36,.50,.64,.78,.92];
 if(level<=15)return [.08,.20,.32,.44,.56,.68,.80,.92];
 var n=level%2===0?9:8,out=[];
 for(var i=0;i<n;i++)out.push(.08+i*(.95-.08)/(n-1));
 return out;
}
function v108Perks(){
 return gameState.save.v108Perks||(gameState.save.v108Perks={});
}
function v108Rank(id){return v108Perks()[id]||0;}
function v108Allowed(id){
 if(id==='magazine'){
  if(v108Rank(id)>=V108_LIMITS.magazine)return false;
  // Both the 15% scheduled bonuses and the original crate perks use
  // one shared clip ceiling to avoid explosive ammunition growth.
  return Math.round(v106Magazine()*Math.pow(1.15,v108Rank(id)))<160;
 }
 if(id==='mgReload'){
  if(v108Rank(id)>=V108_LIMITS.mgReload)return false;
  return 2.65*Math.pow(.87,v106Rank('mgReload'))*
   Math.pow(.92,v108Rank(id))>.72;
 }
 if(id==='mgDamage'||id==='mgRate')return v108Rank(id)<V108_LIMITS[id];
 var r=V106_REWARDS.find(function(x){return x.id===id;});
 return !!(r&&!r.instant&&v106Rank(id)<r.max);
}
function v108Anchors(count,level){
 var a={};
 // Guaranteed positions are spread from the first half into the final fights.
 a[0]='magazine';
 a[Math.floor(count*.35)]='mgReload';
 a[Math.floor(count*.68)]='magazine';
 if(level>=4)a[count-1]='mgReload';
 return a;
}
function v108WeightedChoice(last){
 var group=[
  {id:'magazine',w:35},{id:'mgReload',w:30},
  {id:'mgDamage',w:15},{id:'mgRate',w:10}
 ];
 var other=V108_OTHER.filter(v108Allowed);
 if(other.length)other.forEach(function(id){group.push({id:id,w:10/other.length});});
 group=group.filter(function(item){
  return v108Allowed(item.id)&&!(last.length>=2&&last[last.length-1]===item.id&&last[last.length-2]===item.id);
 });
 if(!group.length)return null;
 var total=group.reduce(function(s,x){return s+x.w;},0),r=Math.random()*total;
 for(var i=0;i<group.length;i++){r-=group[i].w;if(r<=0)return group[i].id;}
 return group[group.length-1].id;
}
function v108Choose(slot){
 var g=gameState,history=g.v108History||[],anchor=g.v108Anchors[slot];
 var repeated=function(id){return history.length>=2&&history[history.length-1]===id&&history[history.length-2]===id;};
 var choice=(anchor&&v108Allowed(anchor)&&!repeated(anchor))?anchor:v108WeightedChoice(history);
 return choice;
}
function v108ThreatWeight(e){
 var type=e.type||'',count=Math.max(1,Number(e.count||e.n||1));
 if(/plane|air|helicopter/.test(type))return count*3;
 if(/jeep|truck|scoutcar|halftrack|vehicle|tank/.test(type))return count*4;
 if(/foot|squad|soldier|infantry|elite/.test(type))return count;
 return Math.max(1,count*.65);
}
function v108ThreatRemaining(){
 var g=gameState,remaining=0;
 for(var i=g.eventCursor||0;i<(g.events||[]).length;i++)remaining+=v108ThreatWeight(g.events[i]);
 (g.vehicles||[]).forEach(function(v){
  if(!v.alive||v.allied)return;
  remaining+=4*Math.max(0,Math.min(1,(v.hp+(v.armorHp||0))/Math.max(1,v.maxHp+(v.maxArmorHp||0))));
 });
 (g.infantry||[]).forEach(function(e){
  if(!e.alive||e.allied||e.v102Unarmed||e.wounded)return;
  remaining+=Math.max(0,Math.min(1,(e.hp||0)/Math.max(1,e.maxHp||1)));
 });
 (g.air||[]).forEach(function(e){if(e.alive)remaining+=3*Math.max(.1,(e.hp||1)/Math.max(1,e.maxHp||1));});
 (g.paras||[]).forEach(function(e){if(e.alive)remaining+=Math.max(.3,(e.hp||1)/Math.max(1,e.maxHp||1));});
 return remaining;
}
function v108Progress(){
 var g=gameState,remaining=v108ThreatRemaining();
 return Math.max(g.v108Progress||0,Math.max(0,Math.min(1,1-remaining/Math.max(1,g.v108TotalThreat||1))));
}
function v108QueueThrough(progress){
 var g=gameState;if(!g||!g.v108Schedule)return;
 g.v108Progress=Math.max(g.v108Progress||0,Math.min(1,progress));
 while(g.v108Cursor<g.v108Schedule.length&&
       g.v108Schedule[g.v108Cursor]<=g.v108Progress+1e-8){
  g.v108Queue.push(g.v108Cursor++);
 }
 v108Present();
}
function v108UiCreate(){
 if(v108Ui||typeof document==='undefined'||!document.body)return;
 var root=document.createElement('div');
 root.id='v108Offer';
 root.style.cssText='display:none;position:fixed;inset:0;z-index:30;background:rgba(7,13,9,.75);align-items:center;justify-content:center;padding:24px;pointer-events:auto';
 var panel=document.createElement('div');
 panel.style.cssText='width:min(92vw,400px);background:#263328;color:#f8eed1;border:2px solid #d8ba62;border-radius:18px;padding:24px 20px;text-align:center;box-shadow:0 15px 70px #0009;font-family:system-ui';
 var heading=document.createElement('div');
 heading.style.cssText='font-size:11px;color:#d7bd72;font-weight:900;letter-spacing:.14em';
 var title=document.createElement('div');
 title.style.cssText='font-size:26px;font-weight:900;margin:13px 0';
 var info=document.createElement('div');
 info.style.cssText='font-size:13px;line-height:1.5;color:#ddd9c7;margin:12px 0 18px';
 var button=document.createElement('button');
 button.id='v108Accept';
 button.type='button';
 button.textContent='UPGRADE PAKKEN · VERDER SPELEN';
 button.style.cssText='border:0;border-radius:11px;background:#e0bc59;color:#23291f;padding:16px 12px;font-size:13px;font-weight:900;width:100%;min-height:52px;touch-action:manipulation';
 button.addEventListener('click',function(ev){
  if(ev&&ev.preventDefault)ev.preventDefault();
  if(ev&&ev.stopPropagation)ev.stopPropagation();
  v108Accept();
 });
 panel.appendChild(heading);panel.appendChild(title);panel.appendChild(info);panel.appendChild(button);
 root.appendChild(panel);document.body.appendChild(root);
 v108Ui={root:root,heading:heading,title:title,info:info,button:button};
}
function v108Present(){
 var g=gameState;if(!g||g.v108Offer||!g.v108Queue||!g.v108Queue.length)return;
 // One explicit, guaranteed reward per milestone; the battle freezes
 // until accepted so touch players cannot lose a choice under fire.
 var slot=g.v108Queue.shift(),id=v108Choose(slot);
 if(!id)return;
 var labels={magazine:'MAGAZINE SIZE +15%',mgReload:'RELOAD SPEED +8%',
  mgDamage:'DAMAGE +8%',mgRate:'FIRE RATE +6%'};
 var info={magazine:'15% meer patronen in je MG-magazijn.',
  mgReload:'8% kortere herlaadtijd van je MG.',
  mgDamage:'8% meer MG-schade.',
  mgRate:'6% sneller vuren met de MG.'};
 g.v108Offer={slot:slot,id:id};
 v108UiCreate();
 if(v108Ui){
  v108Ui.heading.textContent='MAP '+(g.levelIndex+1)+' · UPGRADE '+(slot+1)+'/'+g.v108Schedule.length;
  v108Ui.title.textContent=labels[id]||((V106_REWARDS.find(function(x){return x.id===id;})||{}).label||id);
  v108Ui.info.textContent=info[id]||'Een bestaande wapen- of bunkerverbetering.';
  v108Ui.root.style.display='flex';
 }
}
function v108Accept(){
 var g=gameState;if(!g||!g.v108Offer)return false;
 var chosen=g.v108Offer.id;
 if(v108Allowed(chosen)){
  if(chosen==='magazine'||chosen==='mgReload'||chosen==='mgDamage'||chosen==='mgRate'){
   v108Perks()[chosen]=v108Rank(chosen)+1;
  }else{
   v106Perks()[chosen]=(v106Rank(chosen)||0)+1;
  }
  v106ApplyProfile(true);saveGame();
  g.v108History.push(chosen);
  g.message='UPGRADE VERDIEND · '+(chosen==='magazine'?'MAGAZINE +15%':chosen==='mgReload'?'HERLADEN +8%':chosen==='mgDamage'?'SCHADE +8%':chosen==='mgRate'?'VUURSNELHEID +6%':chosen);
  g.messageT=2.4;
 }else g.v108History.push('capped');
 g.v108Granted++;
 g.v108Offer=null;
 if(v108Ui)v108Ui.root.style.display='none';
 v108Present();
 return true;
}
// Recompute weapon profile from the original 18 crate upgrades first,
// then apply the controlled 15/8/8/6% milestone multipliers once.
var v108ApplyOld=v106ApplyProfile;
v106ApplyProfile=function(isPickup){
 var g=gameState,oldMag=g.profile.primaryMag,oldAmmo=g.primaryAmmo;
 v108ApplyOld.apply(this,arguments);
 var p=g.profile,rank=v108Rank;
 p.primaryMag=Math.min(160,Math.round(p.primaryMag*Math.pow(1.15,rank('magazine'))));
 p.primaryReload=Math.max(.55,p.primaryReload*Math.pow(.92,rank('mgReload')));
 p.primaryDamage*=Math.pow(1.08,rank('mgDamage'));
 p.primaryCycle*=Math.pow(1/1.06,rank('mgRate'));
 p.primaryBurstPause*=Math.pow(1/1.06,rank('mgRate'));
 g.primaryAmmo=isPickup?
  Math.min(p.primaryMag,Math.max(0,oldAmmo)+Math.max(0,p.primaryMag-oldMag)):
  p.primaryMag;
};
var v108FreshOld=freshState;
freshState=function(){
 var g=v108FreshOld.apply(this,arguments);
 try{
  var previous=loadSave();
  if(previous&&previous.v108Perks)g.save.v108Perks=Object.assign({},previous.v108Perks);
 }catch(_){}
 return g;
};
var v108ResetOld=resetLevel;
resetLevel=function(){
 var result=v108ResetOld.apply(this,arguments);
 if(!v108Campaign())return result;
 var g=gameState,level=g.levelIndex+1;
 g.v108Schedule=v108Schedule(level);
 g.v108Anchors=v108Anchors(g.v108Schedule.length,level);
 g.v108Cursor=0;g.v108Granted=0;g.v108History=[];
 g.v108Queue=[];g.v108Offer=null;g.v108Progress=0;
 g.v108TotalThreat=Math.max(1,(g.events||[]).reduce(function(n,e){return n+v108ThreatWeight(e);},0));
 if(v108Ui)v108Ui.root.style.display='none';
 return result;
};
// Completion cannot swallow final offers, even in unusually short maps.
// The existing five-second burning wreck sequence follows acceptance.
var v108ReadyOld=v102ReadyToCelebrate;
v102ReadyToCelebrate=function(){
 var ready=v108ReadyOld.apply(this,arguments);
 if(!v108Campaign()||!gameState.v108Schedule)return ready;
 if(ready&&!gameState.v102VictoryHold){
  v108QueueThrough(1);
 }
 return ready&&!gameState.v108Offer&&!(gameState.v108Queue||[]).length;
};
var v108UpdateOld=update;
update=function(dt){
 if(v108Campaign()&&gameState.v108Offer)return;
 v108UpdateOld.apply(this,arguments);
 if(!v108Campaign()||gameState.mode!=='playing'||!gameState.v108Schedule)return;
 v108QueueThrough(v108Progress());
};
var v108RenderOld=render;
render=function(){
 v108RenderOld.apply(this,arguments);
 if(!v108Campaign()||gameState.mode!=='playing'||!gameState.v108Schedule)return;
 ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
 ctx.fillStyle='rgba(21,31,23,.68)';ctx.fillRect(8,safeTop+7,156,23);
 ctx.fillStyle='#ecd78f';ctx.font='800 10px system-ui';ctx.textAlign='left';
 ctx.fillText('UPGRADES '+gameState.v108Granted+'/'+gameState.v108Schedule.length+
  ' · '+Math.round((gameState.v108Progress||0)*100)+'%',15,safeTop+22);
 ctx.restore();
};