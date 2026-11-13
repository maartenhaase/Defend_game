# Just Bunker Defense V10 — QUICKFIRE

**Play (GitHub Pages):** https://maartenhaase.github.io/Defend_game/jbd_web/v10/index.html

A self-contained release of the existing Just Bunker Defense engine from V9.9.53 with **40 newly authored, short missions**. The original game engine (troops, vehicles, ballistics, input, audio and animations) is retained; V10 adds a new campaign layer and separate save key.

## New campaign

- **40 missions, 4 chapters**: Greenline, Iron Pass, Blackout, Last Stand.
- **20–34-second target encounter windows** (HARD adds 3 seconds). Survive and score the required number of kills. If needed, an **8-second objective grace period** precedes a failed objective. Full rewards are earned on successful extraction.
- **9 terrain palettes** and more than ten feature geometries: forests, bridges, factory belts, snow roads, rail yards, cliff batteries, airfields, dense urban blocks, ports and desert ridges.
- **13 encounter types**: infantry skirmishes, scouting patrols, motorbikes, rushes, armored attacks, airdrops, road convoys, feints, crossfires, ambushes, pincers, holdouts and a finale.
- **13 scripted tactical surprises**, including smoke, sudden flank attacks, fog, blizzards, artillery, radio objectives, fire zones, air threats and sandstorms.
- Mode: EASY or HARD. The unit-testing/demo mode remains available.
- Fully touch-operated on iPhone, and usable with desktop mouse controls.

## Controls

- **Tap:** one precise shot.
- **Tap rapidly:** short three-shot salvos.
- **Hold:** a grenade.
- **After clearing a map:** choose an upgrade in the existing Field Workshop, then press Next Map.

## Architecture

- `index.html` — iPhone viewport and campaign entry.
- `game.js` — complete, standalone source including the V9.9.53 engine and V10 changes.
- `v10_campaign_source.js` — readable source of the new V10 campaign layer; inserted inside the engine IIFE when assembling `game.js`.
- `v10_regression.cjs` — 40-map geometry, encounter, mode and iPhone VM tests.
- The test harness references `../v9_9_53/battle_regression.cjs` and does not alter the old release.

## Test and deploy

```sh
node --check jbd_web/v10/game.js
node jbd_web/v10/v10_regression.cjs
```

The workflow `.github/workflows/v10-check.yml` runs these tests on relevant pushes. The existing GitHub Pages workflow publishes the `jbd_web/v10/` folder alongside previous releases.

**Note:** This is a new campaign built on the existing visual and gameplay engine, not a from-scratch rendering rewrite. All V9.9.53 files remain untouched.
