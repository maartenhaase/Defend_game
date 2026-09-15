"use strict";
/* ===== config.js ===== */
(() => {
  const J = window.JBD = window.JBD || {};
  J.CONFIG = Object.freeze({
    step: 1 / 60,
    maxFrameDelta: 0.10,
    render: { maxDpr: 2, mobileMaxDpr: 1.65, particles: 760, bullets: 190, mobileScale: 0.29, desktopScale: 0.33 },
    scale: {
      apparentRangeMeters: 1650,
      fixedInfantryScale: 0.58,
      fixedVehicleScale: 0.61,
      fixedAirScale: 0.60,
      fixedTerrainScale: 0.42,
      fixedEffectScale: 0.56,
      craterVisualScale: 0.30
    },
    input: { apCharge: 0.22, heCharge: 0.62, maxCharge: 1.05 },
    bunker: { hp: 100, yPadding: 98, barrelLength: 48 },
    heat: { mg:0.28, ap:0.44, he:0.60, coolRate:0.52, lockAt:0.78, unlockAt:0.24, pauseMg:0.12, pauseAp:0.20, pauseHe:0.30 },
    weapons: {
      mg: { burst: 4, cadence: 0.055, speed: 470, spread: 0.018, damage: 34, coverDamage: 0.42, falloffStart: 175, survivalTail: 340, damageStart: 130, damageTail: 380, minDamageMult: 0.20 },
      ap: { speed: 700, spread: 0.004, damage: 29, coverDamage: 0.60, falloffStart: 290, survivalTail: 620, damageStart: 240, damageTail: 760, minDamageMult: 0.36 },
      he: { speed: 470, spread: 0.010, damage: 120, radius: 74, coverDamage: 0.58, falloffStart: 250, survivalTail: 500, damageStart: 205, damageTail: 600, minDamageMult: 0.40 }
    },
    artillery: { count: 14, introDelay: 0.34, duration: 2.55, minRadius: 22, maxRadius: 38 },
    infantry: {
      hp: 100, speed: 8, sprint: 14.5, range: 340, fireInterval: 0.92,
      coverSearchRadius: 205, coverMinY: 105, suppressionDecay: 0.20,
      coverWaveHold: 3.8, assaultSignalLead: 0.68, assaultRushDuration: 2.45,
      assaultSprint: 24, reseekDelay: 2.8,
      corpseFadeStart: 10, corpseLifetime: 16,
      weaponDeployTime: 0.88, weaponRange: 350, weaponFireInterval: 0.58, weaponDamage: 2.7,
      weaponHitBase: 0.72, maxMountedWeapons: 4
    },
    vehicles: {
      maxActive: 10,
      waveSchedule: [
        { time: 4.8, type: 'technical', lane: -0.25 },
        { time: 9.2, type: 'truck', lane: 0.20 },
        { time: 14.0, type: 'halftrack', lane: -0.08 },
        { time: 19.2, type: 'stug', lane: 0.28 },
        { time: 25.0, type: 'tank', lane: -0.28 }
      ],
      types: {
        technical: { hp: 62, speed: 18, radius: 20, range: 330, fireInterval: .78, damage: 1.15, armor: { mg:.55, ap:1.42, he:.78 }, cover: .52 },
        truck:     { hp: 82, speed: 13, radius: 24, range: 0,   fireInterval: 99,  damage: 0,    armor: { mg:.34, ap:1.28, he:.92 }, cover: .64, passengers:4 },
        halftrack: { hp: 104,speed: 12, radius: 25, range: 350, fireInterval: .94, damage: 1.35, armor: { mg:.14, ap:1.35, he:.44 }, cover: .72, passengers:3 },
        stug:      { hp: 118,speed: 9.4, radius: 27, range: 430, fireInterval: 3.4, damage: 6.2,  armor: { mg:.035,ap:1.30, he:.24 }, cover: .82 },
        tank:      { hp: 140,speed: 8.2, radius: 29, range: 445, fireInterval: 3.75,damage: 7.4,  armor: { mg:.025,ap:1.35, he:.21 }, cover: .88 }
      },
      dropYRatio: .43,
      exitPadding: 85,
      wreckLifetime: 999
    },
    airborne: {
      startTime: 27.5, planeSpeed: 70, planeYRatio: 0.15, dropCount: 6,
      dropStartRatio: 0.22, dropEndRatio: 0.72, descentSpeed: 20,
      swayAmp: 14, swayFreq: 2.15, drift: 1.4, hp: 52, hitRadius: 13,
      landingMinRatio: 0.34, landingMaxRatio: 0.53, collapsedLife: 18
    },
    campaign: {
      saveKey: 'jbd_amigapixel_v6_1_save',
      upgrades: {
        caliber:{label:'CALIBER', max:4, costs:[40,65,95,130]},
        burst:{label:'BURST', max:4, costs:[35,55,80,110]},
        charge:{label:'CHARGE SPEED', max:4, costs:[30,50,75,105]},
        range:{label:'RANGE', max:4, costs:[40,60,90,125]},
        cooling:{label:'BARREL COOLING', max:4, costs:[35,55,80,115]},
        he:{label:'HE BLAST', max:4, costs:[40,60,85,120]},
        armor:{label:'ARMOR', max:4, costs:[35,55,80,110]}
      }
    },
    level: { seed: 731942, spawnCount: 14, spawnDuration: 16.5, completeDelay: 2.0 },
    audio: { master: 0.68 },
    debug: new URLSearchParams(location.search).get('debug') === '1',
    stress: new URLSearchParams(location.search).get('stress') === '1'
  });
})();


/* ===== util.js ===== */
(() => {
  const J = window.JBD;
  J.U = {
    clamp: (v,a,b)=>Math.max(a,Math.min(b,v)),
    lerp: (a,b,t)=>a+(b-a)*t,
    dist2: (a,b)=>{const x=a.x-b.x,y=a.y-b.y; return x*x+y*y;},
    len: (x,y)=>Math.hypot(x,y),
    norm(x,y){const l=Math.hypot(x,y)||1; return {x:x/l,y:y/l};},
    angleLerp(a,b,t){ let d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI; return a+d*t; },
    hash(n){ n=(n^61)^(n>>>16); n=n+(n<<3); n=n^(n>>>4); n=Math.imul(n,0x27d4eb2d); n=n^(n>>>15); return n>>>0; },
    mulberry32(seed){ return function(){ let t=seed+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; },
    gaussian(rng=Math.random){ let u=0,v=0; while(!u)u=rng(); while(!v)v=rng(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); },
    rnd(a,b,r=Math.random){ return a+(b-a)*r(); },
    loadJSON(key,fallback){ try{ const raw=localStorage.getItem(key); return raw?JSON.parse(raw):fallback; }catch(_){ return fallback; } },
    saveJSON(key,val){ try{ localStorage.setItem(key, JSON.stringify(val)); return true; }catch(_){ return false; } }
  };
})();


/* ===== scale.js ===== */
(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;

  function progress(s,y){
    const top=(s.safe?.top||0)+34;
    const bottom=Math.max(top+1,(s.bunker?.y||s.viewport.h*.86)-54);
    return U.clamp((y-top)/(bottom-top),0,1);
  }
  function band(){ return 'uniform'; }
  function perspective(){ return 1; }
  function entity(s,y,kind='infantry'){
    const base=s.viewport.w<=520?C.render.mobileScale:C.render.desktopScale;
    const mult=kind==='vehicle'?C.scale.fixedVehicleScale:kind==='air'?C.scale.fixedAirScale:C.scale.fixedInfantryScale;
    return base*mult;
  }
  function terrain(){ return C.scale.fixedTerrainScale; }
  function moveFactor(){ return 1; }
  function effect(){ return C.scale.fixedEffectScale; }
  function distanceMeters(s,y){
    const p=progress(s,y);
    return Math.round(U.lerp(C.scale.apparentRangeMeters,120,Math.pow(p,.92)));
  }
  J.Scale={progress,band,perspective,entity,terrain,moveFactor,effect,distanceMeters};
})();


/* ===== scenarios.js ===== */
(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;

  const THEMES={
    jungle:{label:'JUNGLE', sight:0.84, cover:1.28, vehicleSpeed:0.84, infantrySpeed:0.90, vegetation:1.35, openness:0.76},
    desert:{label:'DESERT', sight:1.12, cover:0.76, vehicleSpeed:1.00, infantrySpeed:1.00, vegetation:0.48, openness:1.18},
    polar:{label:'POLAR', sight:1.04, cover:0.84, vehicleSpeed:1.12, infantrySpeed:1.03, vegetation:0.62, openness:1.16}
  };

  const VEHICLE_PHASES={
    j1:[['technical','truck'],['technical','halftrack'],['truck','stug']],
    j2:[['technical','truck'],['halftrack','technical'],['stug','tank']],
    j3:[['truck','halftrack','technical'],['halftrack','stug'],['tank','stug']],
    d1:[['technical','technical'],['truck','halftrack'],['stug','tank']],
    d2:[['technical','truck','technical'],['halftrack','stug'],['tank','halftrack']],
    d3:[['technical','halftrack','truck'],['stug','tank'],['halftrack','tank','stug']],
    p1:[['halftrack','truck'],['stug','technical'],['tank','stug']],
    p2:[['halftrack','stug','truck'],['tank','technical'],['stug','tank']],
    p3:[['halftrack','stug','truck'],['tank','stug'],['tank','halftrack','stug']]
  };

  const BASE=[
    {theme:'jungle',n:1,seed:81103,inf:16,dur:15.5,veh:'j1',air:3,art:8,river:.34,bridges:[.31,.63],building:.69,trenches:6,village:7,mobileArt:1,mobileStart:12.8,convoy:1,helicopter:1,demo:true,action:'ALL SYSTEMS DEMO'},
    {theme:'jungle',n:2,seed:81147,inf:10,dur:11.4,veh:'j2',air:0,art:8,river:.62,bridges:[.27,.58],building:.31,trenches:5,village:5,mobileArt:1,mobileStart:13.6,convoy:1,action:'VILLAGE PUSH'},
    {theme:'jungle',n:3,seed:81221,inf:12,dur:12.2,veh:'j3',air:3,art:9,river:.43,bridges:[.35,.67],building:.73,trenches:7,village:2,mobileArt:1,mobileStart:12.4,convoy:0,action:'RIVER ASSAULT'},
    {theme:'desert',n:1,seed:82105,inf:9,dur:10.0,veh:'d1',air:0,art:7,river:.67,bridges:[.29,.61],building:.28,trenches:3,village:1,mobileArt:1,mobileStart:12.0,convoy:0,action:'LONG-RANGE RAID'},
    {theme:'desert',n:2,seed:82163,inf:11,dur:10.9,veh:'d2',air:0,art:8,river:.38,bridges:[.24,.56],building:.70,trenches:4,village:4,mobileArt:0,mobileStart:99,convoy:1,action:'CONVOY AMBUSH'},
    {theme:'desert',n:3,seed:82231,inf:13,dur:11.8,veh:'d3',air:3,art:8,river:.58,bridges:[.33,.66],building:.27,trenches:5,village:2,mobileArt:2,mobileStart:11.0,convoy:0,action:'ARMOR & GUNS'},
    {theme:'polar',n:1,seed:83119,inf:10,dur:10.2,veh:'p1',air:0,art:7,river:.39,bridges:[.30,.64],building:.72,trenches:4,village:2,mobileArt:0,mobileStart:99,convoy:0,action:'FROZEN PATROL'},
    {theme:'polar',n:2,seed:83177,inf:12,dur:11.0,veh:'p2',air:3,art:8,river:.64,bridges:[.26,.57],building:.30,trenches:5,village:5,mobileArt:1,mobileStart:11.4,convoy:0,action:'AIRBORNE VILLAGE'},
    {theme:'polar',n:3,seed:83249,inf:14,dur:11.9,veh:'p3',air:4,art:9,river:.46,bridges:[.36,.68],building:.71,trenches:6,village:4,mobileArt:2,mobileStart:10.2,convoy:1,action:'COMBINED ARMS'}
  ];

  function vehicleSchedule(key,cycle,convoy=0,demo=false){
    if(demo){
      return [
        {time:4.6,type:'technical',lane:-.26,model:1,role:'recon',scheme:'olive'},
        {time:7.0,type:'truck',lane:.20,model:1,role:'troop',scheme:'olive'},
        {time:9.3,type:'halftrack',lane:-.10,model:2,role:'command',scheme:'darkOlive'},
        {time:12.0,type:'stug',lane:.28,model:1,role:'assault',scheme:'fieldGrey'},
        {time:15.2,type:'truck',lane:-.16,convoy:true,model:0,role:'cargo',scheme:'olive'},
        {time:16.0,type:'truck',lane:-.16,convoy:true,model:1,role:'troop',scheme:'olive'},
        {time:16.8,type:'truck',lane:-.16,convoy:true,model:2,role:'supply',scheme:'darkOlive'},
        {time:17.6,type:'halftrack',lane:-.16,convoy:true,model:1,role:'escort',scheme:'darkOlive'},
        {time:22.2,type:'tank',lane:.22,heavy:true,model:2,role:'heavy',scheme:'darkOlive'},
        {time:27.0,type:'tank',lane:-.24,model:0,role:'medium',scheme:'olive'}
      ];
    }
    const phases=VEHICLE_PHASES[key],out=[];let idx=0;
    const phaseTimes=[5.1,13.0,21.2];
    for(let pp=0;pp<phases.length;pp++)for(let k=0;k<phases[pp].length;k++){
      const lane=[-.30,.24,-.08,.32,-.22,.10][idx%6];
      out.push({time:phaseTimes[pp]+k*1.55,type:phases[pp][k],lane,model:idx%3,role:phases[pp][k]==='tank'?'medium':phases[pp][k]==='stug'?'assault':phases[pp][k]==='halftrack'?'escort':phases[pp][k]==='truck'?'troop':'recon'});idx++;
    }
    if(convoy){
      const lane=(key.charCodeAt(0)%2===0)?-.16:.16, tm=convoy===1?15.2:17.0;
      out.push({time:tm,type:'truck',lane,convoy:true,model:0,role:'cargo'});
      out.push({time:tm+.78,type:'truck',lane,convoy:true,model:1,role:'troop'});
      out.push({time:tm+1.56,type:'truck',lane,convoy:true,model:2,role:'supply'});
      out.push({time:tm+2.34,type:'halftrack',lane,convoy:true,model:1,role:'escort'});
    }
    if((key==='d3'||key==='p3')&&out.some(x=>x.type==='tank')){const last=[...out].reverse().find(x=>x.type==='tank');if(last)last.heavy=true;}
    if(cycle>1&&out.length<10)out.push({time:20.4,type:cycle%2?'stug':'halftrack',lane:.18,model:cycle%3,role:cycle%2?'assault':'escort'});
    out.sort((a,b)=>a.time-b.time);
    return out.slice(0,10);
  }

  function get(index=0,cycle=1){
    const b=BASE[((index%BASE.length)+BASE.length)%BASE.length],t=THEMES[b.theme],difficulty=1+(cycle-1)*.12;
    const label=`${t.label} ${b.n} · ${b.action}`;
    return {
      index:index%9,cycle,label,theme:b.theme,number:b.n,seed:b.seed+(cycle-1)*997,difficulty,actionStyle:b.action,
      infantryCount:b.inf+Math.min(6,(cycle-1)*2),spawnDuration:b.dur*1.45,
      infantrySpeedMult:t.infantrySpeed,infantryRange:C.infantry.range*t.sight,
      coverSearchRadius:C.infantry.coverSearchRadius*(b.theme==='jungle'?1.20:b.theme==='desert'?.96:1.02),
      enemyHpMult:difficulty,enemyDamageMult:1+(cycle-1)*.09,enemyFireRateMult:1+(cycle-1)*.065,
      vehicleSpeedMult:t.vehicleSpeed,vehicleHpMult:difficulty,vehicleDamageMult:1+(cycle-1)*.10,vehicleFireRateMult:1+(cycle-1)*.05,
      vehicleSchedule:vehicleSchedule(b.veh,cycle,b.convoy,!!b.demo),
      airborneCount:b.air?Math.min(4,b.air):0,airborneStart:b.demo?18.0:(b.air?22.5:99),airborneHpMult:difficulty,
      helicopterEnabled:!!b.helicopter,helicopterStart:b.demo?10.5:99,demo:!!b.demo,
      artilleryCount:b.art,artilleryDuration:2.15,mobileArtilleryCount:Math.min(2,b.mobileArt||0),mobileArtilleryStart:b.mobileStart,
      riverBase:b.river,bridgeRatios:b.bridges,buildingSide:b.building,trenches:b.trenches,villageCount:b.village||1,
      vegetation:t.vegetation,openness:t.openness
    };
  }

  function resetRuntime(s){
    const carryHp=(s.bunker&&Number.isFinite(s.bunker.hp))?s.bunker.hp:C.bunker.hp;
    s.mode='brief';s.simTime=0;s.accumulator=0;s.lastTs=0;s.deployed=false;s.completeT=0;s.levelComplete=false;
    s.bunker.hp=carryHp;s.bunker.flash=0;s.bunker.recoil=0;s.bunker.muzzle=0;s.bunker.heat=0;s.bunker.heatLocked=false;s.bunker.cooldown=0;
    s.artillery={started:false,t:0,next:0,index:0,finished:false,events:[]};
    s.mobileArtillery={started:false,t:0,startAt:0,finished:false};
    s.assault={armed:false,t:0,whistle:false,pulse:0,lastReleased:0};
    s.enemies=[];s.vehicles=[];s.vehicleShots=[];s.enemyTracers=[];s.artilleryShells=[];s.wrecks=[];s.bullets=[];s.explosions=[];s.fires=[];s.cover=[];s.corpses=[];
    s.vehicleWave={started:false,t:0,index:0,finished:false};
    s.airborne={started:false,t:0,finished:false,plane:null,helicopter:null,heliFinished:false,paratroopers:[],collapsed:[],dropped:0};
    s.spawn={t:0,count:0};s._demoClassCursor=0;s.particles=[];s.particleCursor=0;s.trauma=0;s.quality=1;s.levelRewardGranted=false;
    s.stats={shots:0,triggers:0,effectiveTriggers:0,kills:0,hits:0,vehicleKills:0,armorHits:0,airKills:0,artilleryKills:0,landedParas:0};
    s.ui={messageT:0,message:'',shopDirty:false};s.map=null;
  }

  function apply(s,index=s.campaign.index,cycle=s.campaign.cycle){
    resetRuntime(s);s.campaign.index=index;s.campaign.cycle=cycle;s.scenario=get(index,cycle);s.seed=s.scenario.seed;s.rng=U.mulberry32(s.seed);
    s.statusText=s.scenario.label;s.statusSub=`Cycle ${cycle} · map ${index+1}/9`;
    if(s.scenario.airborneCount===0&&!s.scenario.helicopterEnabled)s.airborne.finished=true;
    return s.scenario;
  }

  function advance(s){
    s.campaign.cleared++;
    let index=s.campaign.index+1,cycle=s.campaign.cycle;
    if(index>=9){index=0;cycle++;}
    return apply(s,index,cycle);
  }

  J.Scenarios={count:9,get,apply,advance,themes:THEMES};
})();


/* ===== state.js ===== */
(() => {
  const J = window.JBD, C = J.CONFIG;

  function defaultSave(){
    return { supply:0, upgrades:{caliber:0,burst:0,charge:0,range:0,cooling:0,he:0,armor:0}, bestCycle:1, totalMapsCleared:0 };
  }

  function sanitizeSave(src){
    const base=defaultSave();
    if(!src||typeof src!=='object')return base;
    base.supply=Math.max(0,src.supply|0);
    base.bestCycle=Math.max(1,src.bestCycle|0||1);
    base.totalMapsCleared=Math.max(0,src.totalMapsCleared|0);
    for(const k of Object.keys(base.upgrades)){
      const max=C.campaign.upgrades[k].max;
      base.upgrades[k]=Math.max(0, Math.min(max, (src.upgrades&&src.upgrades[k])|0));
    }
    return base;
  }

  function loadSave(){
    const direct=J.U.loadJSON(C.campaign.saveKey,null);
    if(direct)return sanitizeSave(direct);
    const legacy=['jbd_amigapixel_v6_save','jbd_makeover_v2_save','jbd_rebuild_v1_m9_save'];
    for(const key of legacy){ const old=J.U.loadJSON(key,null); if(old)return sanitizeSave(old); }
    return defaultSave();
  }
  function saveNow(save){ return J.U.saveJSON(C.campaign.saveKey, sanitizeSave(save)); }

  function buildProfile(up){
    const caliber=up.caliber|0, burst=up.burst|0, charge=up.charge|0, range=up.range|0, cooling=up.cooling|0, he=up.he|0, armor=up.armor|0;
    const rangeScale=1+range*0.17;
    const tune=(w,startGain,tailGain,dmgGain,dmgTailGain)=>({
      ...w,
      falloffStart: Math.round(w.falloffStart + range*startGain),
      survivalTail: Math.round(w.survivalTail + range*tailGain),
      damageStart: Math.round(w.damageStart + range*dmgGain),
      damageTail: Math.round(w.damageTail + range*dmgTailGain)
    });
    return {
      maxHp: C.bunker.hp + armor*18,
      damageReduction: armor*0.08,
      barrelLength: C.bunker.barrelLength + caliber*3,
      sandbags: armor,
      chargeScale: 1 + charge*0.16,
      rangeScale,
      heatGainScale: Math.max(.56,1-cooling*.10),
      heatCoolRate: C.heat.coolRate+cooling*.14,
      heatPauseScale: Math.max(.62,1-cooling*.09),
      weapons: {
        mg: { ...tune(C.weapons.mg,34,75,28,86), burst:C.weapons.mg.burst+burst, cadence:Math.max(0.037,C.weapons.mg.cadence-burst*0.004), damage:C.weapons.mg.damage+caliber*3 },
        ap: { ...tune(C.weapons.ap,52,110,44,102), damage:C.weapons.ap.damage+caliber*6 },
        he: { ...tune(C.weapons.he,46,92,34,88), damage:C.weapons.he.damage+caliber*10+he*14, radius:C.weapons.he.radius+he*8 }
      }
    };
  }

  function refreshState(s, resetHp=true){
    s.save = sanitizeSave(s.save||defaultSave());
    s.profile = buildProfile(s.save.upgrades);
    s.bunker.maxHp = s.profile.maxHp;
    if(resetHp) s.bunker.hp = s.profile.maxHp;
    return s.profile;
  }

  function upgradeCost(key, level){
    const cfg=C.campaign.upgrades[key];
    if(level>=cfg.max)return null;
    return cfg.costs[level] ?? null;
  }

  function tryBuyUpgrade(s,key){
    const cfg=C.campaign.upgrades[key];
    if(!cfg)return false;
    const lvl=s.save.upgrades[key]|0, cost=upgradeCost(key,lvl);
    if(cost==null||s.save.supply<cost)return false;
    s.save.supply-=cost;
    s.save.upgrades[key]=lvl+1;
    refreshState(s,false);
    saveNow(s.save);
    return true;
  }

  J.Progress = { defaultSave, loadSave, saveNow, refreshState, upgradeCost, tryBuyUpgrade };

  J.makeState = () => ({
    mode:'brief', time:0, simTime:0, accumulator:0, lastTs:0, deployed:false,
    viewport:{w:390,h:844,dpr:1}, safe:{top:0,bottom:0}, battlefield:{top:0,bottom:0},
    seed:C.level.seed, rng:J.U.mulberry32(C.level.seed), scenario:null, map:null,
    campaign:{index:0,cycle:1,cleared:0},
    save:loadSave(), profile:buildProfile(loadSave().upgrades),
    input:{down:false,x:195,y:360,downAt:0,charge:0,pointerId:null},
    bunker:{x:195,y:730,aim:-Math.PI/2,recoil:0,hp:C.bunker.hp,maxHp:C.bunker.hp,flash:0,muzzle:0,muzzleKind:'mg',heat:0,heatLocked:false,cooldown:0},
    artillery:{started:false,t:0,next:0,index:0,finished:false,events:[]},
    mobileArtillery:{started:false,t:0,startAt:0,finished:false},
    assault:{armed:false,t:0,whistle:false,pulse:0,lastReleased:0},
    enemies:[], emplacements:[], vehicles:[], vehicleShots:[], enemyTracers:[], artilleryShells:[], wrecks:[], bullets:[], explosions:[], fires:[], cover:[], corpses:[],
    vehicleWave:{started:false,t:0,index:0,finished:false},
    airborne:{started:false,t:0,finished:false,plane:null,helicopter:null,heliFinished:false,paratroopers:[],collapsed:[],dropped:0},
    spawn:{t:0,count:0}, particles:[], particleCursor:0,
    trauma:0, quality:1, fps:60, fpsSmoothed:60, levelComplete:false, completeT:0, levelRewardGranted:false,
    stats:{shots:0,triggers:0,effectiveTriggers:0,kills:0,hits:0,vehicleKills:0,armorHits:0,airKills:0,artilleryKills:0,landedParas:0}, playerActionSeq:0,effectiveActions:{}, debug:C.debug,
    staticCanvas:null, damageCanvas:null, staticCtx:null, damageCtx:null,
    statusText:'TAP DEPLOY', statusSub:'Jungle 1',
    ui:{messageT:0,message:'',shopDirty:false}, audioReady:false
  });
})();

