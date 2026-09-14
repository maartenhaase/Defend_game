# JBD rebuild v1 — Milestone 6 test report

Date: 2026-09-14
Scope: Milestone 6 vehicle subsystem on top of the Milestone 5 infantry/crater vertical slice.

## Automated / syntax checks
- Standalone build: `node build.js` passed.
- Bundled JavaScript: `node --check` passed.
- Browser runtime: no observed uncaught JavaScript error events in the final test runs.

## Vehicle mechanics verified
- All five requested vehicle classes instantiate and render:
  - technical;
  - transport truck;
  - halftrack;
  - StuG;
  - tank.
- Hull movement and lane following run independently from turret aim.
- Tank/StuG guns recoil visibly after firing.
- Track phase advances with movement on tracked vehicles.
- Wheel phase advances with movement on wheeled vehicles.
- Vehicle damage stages trigger light/heavy smoke and sparks.
- Destroyed vehicles remain as wrecks and add a `wreck` cover node.
- Infantry cover search successfully selected a newly-created wreck cover node.

## Player weapon / armor test
Pointer input was used through the actual canvas input system at 390×844, DPR 2.

Technical:
- one aimed MG burst destroyed a fresh technical in the test configuration.

Tank:
- fresh HP: 140;
- AP hit 1 -> 100.85 HP;
- AP hit 2 -> 61.70 HP;
- AP hit 3 -> 22.55 HP;
- AP hit 4 -> DESTROYED;
- resulting tank wreck registered as cover.

This verifies the intended interaction: MG works on light vehicles; AP is the efficient heavy-armor choice.

## Transport behavior
Stress/runtime test:
- truck completed its brake/deploy sequence and released 3 infantry;
- halftrack completed its brake/deploy sequence and released 2 infantry.

Destroyed-before-drop test:
- a truck destroyed before deployment produced 2 surviving infantry in that seeded test run;
- the truck then remained as wreck cover.

## Stress / performance sample
Chromium headless, emulated viewport 390×844, DPR 2. The standalone HTML was injected directly into the browser document because localhost/file navigation is blocked by the runtime administrator policy.

At ~11.6 seconds with stress mode:
- 25 initial infantry plus 5 deployed transport troops = 30 living infantry;
- 5 active vehicles simultaneously;
- 21 active particles at the sampled frame;
- ~60.0 FPS;
- quality scalar: 1.0;
- bunker remained operational;
- 0 observed uncaught JS errors.

A separate earlier effect-heavy sample immediately after deploy contained >300 active particles with all five vehicle types present and remained in the high-50s FPS range before returning to ~60 FPS as the transient particle load cleared.

## Visual quality check
A dedicated non-debug portrait screenshot was inspected with all five vehicle types separated on the battlefield. Checked:
- trucks read as trucks with cab/cargo distinction;
- technical reads as a light pickup with exposed gun mount;
- halftrack has front wheels + rear tracks;
- StuG uses a fixed casemate silhouette;
- tank has a separate rotating turret;
- tracked vehicles are not simple rectangles;
- perspective is consistent with the existing top-down / 3/4 infantry and bunker view.

## Not claimed
- No physical iPhone Safari test was performed.
- Audio synthesis and motor loops executed in browser runtime without errors, but subjective speaker/headphone quality still requires a human listen test.
