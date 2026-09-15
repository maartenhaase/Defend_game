(() => {
  const J=window.JBD,C=J.CONFIG,U=J.U;

  function progress(s,y){
    const top=(s.safe?.top||0)+34;
    const bottom=Math.max(top+1,(s.bunker?.y||s.viewport.h*.86)-54);
    return U.clamp((y-top)/(bottom-top),0,1);
  }

  function band(s,y){
    const p=progress(s,y);
    if(p<C.scale.farBandEnd)return 'far';
    if(p<C.scale.midBandEnd)return 'mid';
    return 'near';
  }

  function perspective(s,y,kind='infantry'){
    const p=progress(s,y);
    const shaped=Math.pow(p,C.scale.perspectivePower);
    const min=kind==='vehicle'?C.scale.vehicleFarScale:kind==='air'?C.scale.airFarScale:C.scale.infantryFarScale;
    return U.lerp(min,1,shaped);
  }

  function entity(s,y,kind='infantry'){
    const base=s.viewport.w<=520?C.render.mobileScale:C.render.desktopScale;
    return base*perspective(s,y,kind);
  }

  function terrain(s,y){
    const p=progress(s,y);
    return U.lerp(C.scale.terrainFarScale,C.scale.terrainNearScale,Math.pow(p,.92));
  }

  function moveFactor(s,y){
    const p=progress(s,y);
    return U.lerp(C.scale.farMoveFactor,C.scale.nearMoveFactor,Math.pow(p,1.12));
  }

  function effect(s,y){
    const p=progress(s,y);
    return U.lerp(C.scale.effectFarScale,1,Math.pow(p,1.1));
  }

  function distanceMeters(s,y){
    const p=progress(s,y);
    return Math.round(U.lerp(C.scale.apparentRangeMeters,35,Math.pow(p,.82)));
  }

  J.Scale={progress,band,perspective,entity,terrain,moveFactor,effect,distanceMeters};
})();
