(() => {
  const J=window.JBD,C=J.CONFIG;
  const base=s=>s.viewport.w<=520?C.render.mobileScale:C.render.desktopScale;
  function progress(){return 1;}
  function band(){return 'near';}
  function perspective(){return 1;}
  function entity(s){return base(s);}
  function terrain(){return C.scale.fixedTerrainScale;}
  function moveFactor(){return 1;}
  function effect(){return C.scale.fixedEffectScale;}
  function distanceMeters(){return 220;}
  J.Scale={progress,band,perspective,entity,terrain,moveFactor,effect,distanceMeters};
})();
