# JBD rebuild v1 — Milestone 7 test report

Datum: 2026-09-14

## Scope

Milestone 7 voegt mobile readability/performance en Airborne toe bovenop Milestone 6.

## Syntax / standalone

- Alle `src/*.js` bestanden: `node -c` geslaagd.
- `node build.js` geslaagd.
- Gebundelde JavaScript uit `dist/index.html`: syntaxcheck geslaagd.
- Standalone release bevat geen externe runtime-assets.

## Mobile scale

- Chromium device metrics: 390 × 844, deviceScaleFactor 2.
- Interne Canvas DPR op mobile: 1.65.
- Entity render scale op mobile: 0.72.
- Infantry movement: walk 22, sprint 50, assault 61 px/s.
- Collision/hit radii zijn niet evenredig verkleind; touch aim blijft vergevingsgezind.

## Airborne functional tests

- Transport aircraft start na de armor-wave timing.
- Plane pass en propeller phase geverifieerd in runtime.
- 6/6 parachutisten werden gedropt.
- Fast deterministic sim: 6/6 landden correct.
- Elke landing maakte exact één nieuwe infantry unit.
- 6 collapsed parachutes bleven als tijdelijke battlefield marks aanwezig.
- Twee MG-damage hits op een descending paratrooper: airborne kill, geen landing/spawn.
- HE blast path is gekoppeld aan descending airborne targets.
- Geen uncaught JavaScript exceptions in de final functional runs.

## Runtime / performance

Headless Chromium, 390 × 844, emulated deviceScaleFactor 2, internal DPR 1.65:

- Representative scene: 12 infantry + 1 tank + 6 descending paratroopers: ~60 FPS, quality 1.0.
- Heavy stress sample: 25 infantry + 5 vehicles + 6 descending paratroopers + ~300 pooled particles: ~58–59 FPS, quality 1.0.
- Stress sample had 0 observed uncaught JavaScript exceptions.

Deze waarden zijn browser/headless-metingen, geen fysieke iPhone Safari benchmark.

## Visual check

`milestone7_mobile_final.png` is opgenomen op een 390 × 844 device viewport en toont de kleinere mobile scale, transport aircraft, parachutes, infantry, halftrack, bunker en compactere HUD.

## Belangrijke beperking

Een fysieke iPhone Safari is nog niet rechtstreeks getest vanuit deze runtime. De gebruiker heeft de vorige Milestone 6 build wel als soepel op mobiel gerapporteerd; deze build verlaagt de render scale en mobile DPR om de extra Airborne-last te compenseren.
