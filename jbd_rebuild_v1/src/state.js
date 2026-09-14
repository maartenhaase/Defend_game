(() => {
  const J = window.JBD, C=J.CONFIG;
  J.makeState = () => ({
    mode:'brief', time:0, simTime:0, accumulator:0, lastTs:0, deployed:false,
    viewport:{w:390,h:844,dpr:1}, safe:{top:0,bottom:0}, battlefield:{top:0,bottom:0},
    seed:C.level.seed, rng:J.U.mulberry32(C.level.seed),
    input:{down:false,x:195,y:360,downAt:0,charge:0,pointerId:null},
    bunker:{x:195,y:730,aim:-Math.PI/2,recoil:0,hp:C.bunker.hp,flash:0},
    artillery:{started:false,t:0,next:0,index:0,finished:false,events:[]},
    enemies:[], bullets:[], explosions:[], fires:[], cover:[], corpses:[],
    spawn:{t:0,count:0}, particles:[], particleCursor:0,
    trauma:0, quality:1, fps:60, fpsSmoothed:60, levelComplete:false, completeT:0,
    stats:{shots:0,kills:0,hits:0}, debug:C.debug,
    staticCanvas:null, damageCanvas:null, staticCtx:null, damageCtx:null,
    statusText:'TAP DEPLOY', statusSub:'Level 1 · FOOT PATROL',
    ui:{messageT:0,message:''}, audioReady:false
  });
})();
