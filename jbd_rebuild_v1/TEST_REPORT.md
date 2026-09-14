# JBD rebuild v1 — Milestone 8 test report

Datum: 2026-09-14

## Scope

Milestone 8 voegt de volledige 9-map campaign toe bovenop Milestone 7 Airborne en de mobile scaling.

## Build / syntax

- Alle `src/*.js`: `node -c` geslaagd.
- `build.js`: syntaxcheck geslaagd.
- `node build.js`: geslaagd.
- Gebundelde JavaScript uit `dist/index.html`: syntaxcheck geslaagd.
- Standalone release: geen externe runtime-assets.

## Campaign progression

Browser-test met echte UI-flow (`DEPLOY` / `NEXT MAP`) doorliep:

- JUNGLE 1
- JUNGLE 2
- JUNGLE 3
- DESERT 1
- DESERT 2
- DESERT 3
- POLAR 1
- POLAR 2
- POLAR 3
- daarna correct JUNGLE 1, Cycle 2.

Cycle 2 start met difficulty scalar 1.12.

## Scenario content

Elke van de 9 scenario-definities bevat:

- 2 bruggen;
- eigen rivierpositie/bocht;
- eigen gebouwpositie;
- 4–7 loopgraven afhankelijk van map;
- opnieuw gegenereerde wegen, vegetatie en obstakels;
- 6–8 voertuigen in drie korte phases;
- 0 of 3 airborne paratroopers per pass;
- eigen infantry count en map-specifieke sightline / movement multipliers.

## River / bridge mechanics

Gecontroleerde Polar 2-simulatie:

- halftrack gestart op de verkeerde rivieroever;
- bridge routing werd geactiveerd;
- vehicle bereikte riverStage 2 (overkant bereikt);
- 0 gesimuleerde frames waarin het voertuig door onbeveiligd rivierwater reed;
- infantry water speed factor: 0.46;
- normale ground factor: 1.0.

## Touch input

390 × 844 mobile emulation, DPR 2 / internal DPR 1.65:

- echte touchscreen tap op een geplaatst infantry target;
- MG burst vuurde 4 projectiles;
- hits werden door het bestaande combat-systeem geregistreerd;
- game bleef in `playing` zonder JS exception.

## Performance sample

Headless Chromium, 390 × 844, deviceScaleFactor 2, internal DPR 1.65:

- 25 living infantry;
- 5 actieve voertuigen;
- 3 descending paratroopers;
- runtime sample ~60 FPS;
- quality scalar 1.0;
- 0 geobserveerde uncaught JavaScript exceptions.

## Visual inspection

Jungle, Desert en Polar renders zijn afzonderlijk bekeken. De drie themes hebben verschillende grondkleur, vegetatiedichtheid/obstakels en river treatment. De kleinere Milestone 7 mobile entity scale blijft behouden.

## Niet geclaimd

- Geen fysieke iPhone Safari benchmark vanuit deze runtime.
- Gameplay balancing over een volledige handmatig uitgespeelde 9-map campaign blijft een menselijke playtest-taak.
