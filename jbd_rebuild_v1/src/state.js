(() => {
  const J = window.JBD, C = J.CONFIG;

  function defaultSave(){
    return { supply:0, upgrades:{caliber:0,burst:0,charge:0,he:0,armor:0}, bestCycle:1, totalMapsCleared:0 };
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

  function loadSave(){ return sanitizeSave(J.U.loadJSON(C.campaign.saveKey, defaultSave())); }
  function saveNow(save){ return J.U.saveJSON(C.campaign.saveKey, sanitizeSave(save)); }

  function buildProfile(up){
    const caliber=up.caliber|0, burst=up.burst|0, charge=up.charge|0, he=up.he|0, armor=up.armor|0;
    return {
      maxHp: C.bunker.hp + armor*18,
      damageReduction: armor*0.08,
      barrelLength: C.bunker.barrelLength + caliber*3,
      sandbags: armor,
      chargeScale: 1 + charge*0.16,
      weapons: {
        mg: { ...C.weapons.mg, burst:C.weapons.mg.burst+burst, cadence:Math.max(0.037,C.weapons.mg.cadence-burst*0.004), damage:C.weapons.mg.damage+caliber*3 },
        ap: { ...C.weapons.ap, damage:C.weapons.ap.damage+caliber*6 },
        he: { ...C.weapons.he, damage:C.weapons.he.damage+caliber*10+he*14, radius:C.weapons.he.radius+he*8 }
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
    bunker:{x:195,y:730,aim:-Math.PI/2,recoil:0,hp:C.bunker.hp,maxHp:C.bunker.hp,flash:0,muzzle:0,muzzleKind:'mg'},
    artillery:{started:false,t:0,next:0,index:0,finished:false,events:[]},
    assault:{armed:false,t:0,whistle:false,pulse:0,lastReleased:0},
    enemies:[], emplacements:[], vehicles:[], vehicleShots:[], wrecks:[], bullets:[], explosions:[], fires:[], cover:[], corpses:[],
    vehicleWave:{started:false,t:0,index:0,finished:false},
    airborne:{started:false,t:0,finished:false,plane:null,paratroopers:[],collapsed:[],dropped:0},
    spawn:{t:0,count:0}, particles:[], particleCursor:0,
    trauma:0, quality:1, fps:60, fpsSmoothed:60, levelComplete:false, completeT:0, levelRewardGranted:false,
    stats:{shots:0,kills:0,hits:0,vehicleKills:0,armorHits:0,airKills:0,landedParas:0}, debug:C.debug,
    staticCanvas:null, damageCanvas:null, staticCtx:null, damageCtx:null,
    statusText:'TAP DEPLOY', statusSub:'Jungle 1',
    ui:{messageT:0,message:'',shopDirty:false}, audioReady:false
  });
})();
