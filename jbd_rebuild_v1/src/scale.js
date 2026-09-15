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
