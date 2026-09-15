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
    {theme:'jungle',n:1,seed:81103,inf:9,dur:10.8,veh:'j1',air:0,art:8,river:.34,bridges:[.31,.63],building:.69,trenches:5},
    {theme:'jungle',n:2,seed:81147,inf:11,dur:11.8,veh:'j2',air:3,art:8,river:.62,bridges:[.27,.58],building:.31,trenches:6},
    {theme:'jungle',n:3,seed:81221,inf:13,dur:12.6,veh:'j3',air:3,art:9,river:.43,bridges:[.35,.67],building:.73,trenches:7},
    {theme:'desert',n:1,seed:82105,inf:10,dur:10.2,veh:'d1',air:0,art:7,river:.67,bridges:[.29,.61],building:.28,trenches:4},
    {theme:'desert',n:2,seed:82163,inf:12,dur:11.2,veh:'d2',air:3,art:8,river:.38,bridges:[.24,.56],building:.70,trenches:5},
    {theme:'desert',n:3,seed:82231,inf:14,dur:12.0,veh:'d3',air:3,art:8,river:.58,bridges:[.33,.66],building:.27,trenches:5},
    {theme:'polar',n:1,seed:83119,inf:10,dur:10.4,veh:'p1',air:0,art:7,river:.39,bridges:[.30,.64],building:.72,trenches:4},
    {theme:'polar',n:2,seed:83177,inf:12,dur:11.3,veh:'p2',air:3,art:8,river:.64,bridges:[.26,.57],building:.30,trenches:5},
    {theme:'polar',n:3,seed:83249,inf:14,dur:12.2,veh:'p3',air:3,art:9,river:.46,bridges:[.36,.68],building:.71,trenches:6}
  ];

  function vehicleSchedule(key,cycle){
    const phases=VEHICLE_PHASES[key],out=[];let idx=0;
    const phaseTimes=[5.2,13.2,21.4];
    for(let p=0;p<phases.length;p++)for(let k=0;k<phases[p].length;k++){
      const lane=[-.30,.24,-.08,.32,-.22,.10][idx%6];
      out.push({time:phaseTimes[p]+k*1.55,type:phases[p][k],lane});idx++;
    }
    if(cycle>1&&out.length<8)out.push({time:16.9,type:cycle%2?'stug':'halftrack',lane:.18});
    return out.slice(0,8);
  }

  function get(index=0,cycle=1){
    const b=BASE[((index%BASE.length)+BASE.length)%BASE.length],t=THEMES[b.theme],difficulty=1+(cycle-1)*.12;
    const label=`${t.label} ${b.n}`;
    return {
      index:index%9,cycle,label,theme:b.theme,number:b.n,seed:b.seed+(cycle-1)*997,difficulty,
      infantryCount:b.inf+Math.min(6,(cycle-1)*2),spawnDuration:b.dur*1.45,
      infantrySpeedMult:t.infantrySpeed,infantryRange:C.infantry.range*t.sight,
      coverSearchRadius:C.infantry.coverSearchRadius*(b.theme==='jungle'?1.12:b.theme==='desert'?.90:.96),
      enemyHpMult:difficulty,enemyDamageMult:1+(cycle-1)*.09,enemyFireRateMult:1+(cycle-1)*.055,
      vehicleSpeedMult:t.vehicleSpeed,vehicleHpMult:difficulty,vehicleDamageMult:1+(cycle-1)*.10,vehicleFireRateMult:1+(cycle-1)*.05,
      vehicleSchedule:vehicleSchedule(b.veh,cycle),
      airborneCount:b.air?Math.min(3,b.air):0,airborneStart:23.5,airborneHpMult:difficulty,
      artilleryCount:b.art,artilleryDuration:2.15,
      riverBase:b.river,bridgeRatios:b.bridges,buildingSide:b.building,trenches:b.trenches,
      vegetation:t.vegetation,openness:t.openness
    };
  }

  function resetRuntime(s){
    s.mode='brief';s.simTime=0;s.accumulator=0;s.lastTs=0;s.deployed=false;s.completeT=0;s.levelComplete=false;
    s.bunker.hp=C.bunker.hp;s.bunker.flash=0;s.bunker.recoil=0;s.bunker.muzzle=0;
    s.artillery={started:false,t:0,next:0,index:0,finished:false,events:[]};
    s.assault={armed:false,t:0,whistle:false,pulse:0,lastReleased:0};
    s.enemies=[];s.vehicles=[];s.vehicleShots=[];s.wrecks=[];s.bullets=[];s.explosions=[];s.fires=[];s.cover=[];s.corpses=[];
    s.vehicleWave={started:false,t:0,index:0,finished:false};
    s.airborne={started:false,t:0,finished:false,plane:null,paratroopers:[],collapsed:[],dropped:0};
    s.spawn={t:0,count:0};s.particles=[];s.particleCursor=0;s.trauma=0;s.quality=1;s.levelRewardGranted=false;
    s.stats={shots:0,kills:0,hits:0,vehicleKills:0,armorHits:0,airKills:0,landedParas:0};
    s.ui={messageT:0,message:'',shopDirty:false};s.map=null;
  }

  function apply(s,index=s.campaign.index,cycle=s.campaign.cycle){
    resetRuntime(s);s.campaign.index=index;s.campaign.cycle=cycle;s.scenario=get(index,cycle);s.seed=s.scenario.seed;s.rng=U.mulberry32(s.seed);
    s.statusText=s.scenario.label;s.statusSub=`Cycle ${cycle} · map ${index+1}/9`;
    if(s.scenario.airborneCount===0)s.airborne.finished=true;
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
