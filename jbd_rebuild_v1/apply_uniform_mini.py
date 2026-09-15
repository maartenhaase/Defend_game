from pathlib import Path
root=Path('jbd_rebuild_v1')

# M10 -> fixed mini scale. No far/mid/near LOD, no dust/silhouette stage.
(root/'src/scale.js').write_text("""(() => {
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
""")

p=root/'src/config.js'; s=p.read_text()
s=s.replace("render: { maxDpr: 2, mobileMaxDpr: 1.65, particles: 680, bullets: 190, mobileScale: 0.60, desktopScale: 0.72 },","render: { maxDpr: 2, mobileMaxDpr: 1.65, particles: 640, bullets: 190, mobileScale: 0.44, desktopScale: 0.52 },")
s=s.replace("apparentRangeMeters: 900, farBandEnd: 0.30, midBandEnd: 0.66, perspectivePower: 1.72,","apparentRangeMeters: 450, farBandEnd: 0.00, midBandEnd: 0.00, perspectivePower: 1.00,")
s=s.replace("terrainFarScale: 0.34, terrainNearScale: 0.70,","terrainFarScale: 0.62, terrainNearScale: 0.62, fixedTerrainScale: 0.62, fixedEffectScale: 0.62,")
s=s.replace("farMoveFactor: 0.48, nearMoveFactor: 1.08, effectFarScale: 0.28,","farMoveFactor: 1.00, nearMoveFactor: 1.00, effectFarScale: 0.62,")
s=s.replace("dustRevealEnd: 0.30, silhouetteRevealEnd: 0.56, craterVisualScale: 0.48","dustRevealEnd: 0.00, silhouetteRevealEnd: 0.00, craterVisualScale: 0.58")
s=s.replace("hp: 100, speed: 22, sprint: 50, range: 310, fireInterval: 1.22,","hp: 100, speed: 16, sprint: 32, range: 310, fireInterval: 1.22,")
s=s.replace("assaultSprint: 61, reseekDelay: 2.55,","assaultSprint: 39, reseekDelay: 2.55,")
s=s.replace("{ time: 3.8, type: 'technical', lane: -0.25 },\n        { time: 7.4, type: 'truck', lane: 0.20 },\n        { time: 11.2, type: 'halftrack', lane: -0.08 },\n        { time: 15.7, type: 'stug', lane: 0.28 },\n        { time: 20.6, type: 'tank', lane: -0.28 }","{ time: 5.0, type: 'technical', lane: -0.25 },\n        { time: 10.0, type: 'truck', lane: 0.20 },\n        { time: 16.0, type: 'halftrack', lane: -0.08 },\n        { time: 23.0, type: 'stug', lane: 0.28 },\n        { time: 31.0, type: 'tank', lane: -0.28 }")
s=s.replace("technical: { hp: 62, speed: 64, radius: 20, range: 330, fireInterval: .72, damage: 1.15,","technical: { hp: 62, speed: 42, radius: 20, range: 330, fireInterval: .72, damage: 1.15,")
s=s.replace("truck:     { hp: 82, speed: 48, radius: 24, range: 0,   fireInterval: 99,  damage: 0,","truck:     { hp: 82, speed: 34, radius: 24, range: 0,   fireInterval: 99,  damage: 0,")
s=s.replace("halftrack: { hp: 104,speed: 42, radius: 25, range: 350, fireInterval: .86, damage: 1.35,","halftrack: { hp: 104,speed: 30, radius: 25, range: 350, fireInterval: .86, damage: 1.35,")
s=s.replace("stug:      { hp: 118,speed: 31, radius: 27, range: 430, fireInterval: 3.2, damage: 6.2,","stug:      { hp: 118,speed: 23, radius: 27, range: 430, fireInterval: 3.2, damage: 6.2,")
s=s.replace("tank:      { hp: 140,speed: 28, radius: 29, range: 445, fireInterval: 3.55,damage: 7.4,","tank:      { hp: 140,speed: 20, radius: 29, range: 445, fireInterval: 3.55,damage: 7.4,")
s=s.replace("startTime: 24.2, planeSpeed: 96, planeYRatio: 0.15, dropCount: 6,","startTime: 29.0, planeSpeed: 78, planeYRatio: 0.15, dropCount: 6,")
s=s.replace("dropStartRatio: 0.22, dropEndRatio: 0.72, descentSpeed: 31,","dropStartRatio: 0.22, dropEndRatio: 0.72, descentSpeed: 24,")
s=s.replace("spawnDuration: 14.5","spawnDuration: 19.0")
p.write_text(s)

p=root/'src/scenarios.js'; s=p.read_text()
s=s.replace("vehicleSpeed:0.84, infantrySpeed:0.90","vehicleSpeed:0.82, infantrySpeed:0.88")
s=s.replace("vehicleSpeed:1.00, infantrySpeed:1.00","vehicleSpeed:0.94, infantrySpeed:0.94")
s=s.replace("vehicleSpeed:1.12, infantrySpeed:1.03","vehicleSpeed:1.02, infantrySpeed:0.98")
s=s.replace("const phaseTimes=[2.9,8.0,13.4];","const phaseTimes=[5.0,13.0,22.0];")
s=s.replace("phaseTimes[p]+k*1.55","phaseTimes[p]+k*2.15")
s=s.replace("time:16.9,type:cycle%2?'stug':'halftrack'","time:31.0,type:cycle%2?'stug':'halftrack'")
s=s.replace("airborneStart:15.6","airborneStart:26.0")
p.write_text(s)

p=root/'src/render.js'; s=p.read_text()
s=s.replace("function drawRangeField(ctx,s){\n    const {w,h}=s.viewport;","function drawRangeField(ctx,s){\n    return;\n    const {w,h}=s.viewport;")
s=s.replace("const b=s.bunker,spr=J.Sprites.bunker,sc=baseScale(s)*.72,profile=s.profile||{};","const b=s.bunker,spr=J.Sprites.bunker,sc=Math.max(baseScale(s)*1.18,.50),profile=s.profile||{};")
p.write_text(s)

p=root/'src/vehicles.js'; s=p.read_text()
s=s.replace("DUST CONTACT · LONG RANGE","VEHICLE CONTACT")
s=s.replace("contactIdentified:false","contactIdentified:true")
p.write_text(s)

p=root/'src/combat.js'; s=p.read_text()
s=s.replace("const farAssist=U.lerp(15,9,J.Scale.progress(s,e.y))","const farAssist=12")
p.write_text(s)

p=root/'build.js'; s=p.read_text()
s=s.replace("<title>JBD — Long Front</title>","<title>JBD — Mini Front</title>")
s=s.replace("<h1 id=\"title\">LONG FRONT</h1><p id=\"sub\">Contact begint ver aan de horizon en bouwt op naar close pressure.","<h1 id=\"title\">MINI FRONT</h1><p id=\"sub\">Hetzelfde slagveld, maar op één vaste kleinere schaal.")
p.write_text(s)
