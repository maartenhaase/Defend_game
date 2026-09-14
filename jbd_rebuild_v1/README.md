# JBD — Bunker Defense rebuild v1

A clean rebuild of JBD focused on a polished portrait-first combat slice. Source stays modular; `dist/index.html` is a single standalone release with no external runtime dependencies.

## Current milestone
Milestones 1–6 are represented in the current Armor Trial slice:
- fixed 60 Hz simulation step + RAF render loop;
- portrait-first pointer/touch aiming;
- quick tap MG / short hold AP / long hold HE;
- bunker aim, recoil and muzzle flash;
- procedural audio and ambience;
- artillery intro with persistent irregular craters;
- infantry animation, suppression and crater-cover AI;
- synchronized assault whistle: crater infantry leave cover together after a short hold and sprint exposed;
- crater cover reduces HE damage significantly, creating a deliberate post-whistle MG window;
- persistent blood/scorch/soil marks;
- pooled dirt, smoke, fire, debris, ember, spark and muzzle particles;
- trauma-based shake and hit vignette;
- vehicle subsystem with technical, troop truck, halftrack, StuG and tank;
- cached vector-style vehicle body/turret sprites with animated tracks/wheels;
- independent tank/vehicle turret aim and visible recoil/muzzle flashes;
- armor-specific MG/AP/HE effectiveness, ricochets and armor-break feedback;
- visual vehicle damage states with smoke/sparks;
- procedural looping vehicle motors plus distinct mounted-MG/tank-gun audio;
- truck/halftrack brake-and-deploy infantry behavior;
- survivors can escape a transport destroyed before its troop drop;
- destroyed vehicles remain as burning/scorched wrecks and become infantry cover nodes;
- debug mode via `?debug=1` and stress mode via `?stress=1`.

## Build
```bash
node build.js
```

Output: `dist/index.html`.

## Next milestone
Milestone 7: airborne — WW2 transport aircraft, animated propellers, parachutes, landing/collapse sequence and paratrooper deployment — while preserving the current vehicle/infantry performance budget.
