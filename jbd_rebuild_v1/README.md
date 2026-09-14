# JBD — Bunker Defense rebuild v1

A clean rebuild of JBD focused on a polished Level 1 vertical slice. Source stays modular; `dist/index.html` is a single standalone release with no external runtime dependencies.

## Current milestone
Milestones 1–5 are represented in Level 1:
- fixed 60 Hz simulation step + RAF render loop;
- portrait-first pointer/touch aiming;
- quick tap MG / short hold AP / long hold HE;
- bunker aim, recoil and muzzle flash;
- procedural audio and ambience;
- artillery intro with persistent irregular craters;
- infantry animation, suppression and crater-cover AI;
- synchronized assault whistle: crater infantry leave cover together after a short hold and sprint exposed;
- crater cover now reduces HE damage significantly, creating a deliberate post-whistle MG window;
- persistent blood/scorch/soil marks;
- pooled dirt, smoke, fire, debris, ember, spark and muzzle particles;
- trauma-based shake and hit vignette;
- debug mode via `?debug=1`.

## Build
```bash
node build.js
```

Output: `dist/index.html`.

## Next milestone
Milestone 6: vehicles (technical, truck, halftrack, StuG/tank foundation, wrecks) while preserving Level 1 behavior and performance.
