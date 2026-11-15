# Just Bunker Defense V10 — The Long Road (30 maps)

**iPhone play:** https://maartenhaase.github.io/Defend_game/jbd_web/v10/index.html

This is a **rebalanced progressive campaign** built on the full V9.9.53 Just Bunker Defense engine. The rushed 40-map Quickfire set is replaced with 30 maps; no V9 files were overwritten.

## First map: the tutorial

- **Exactly one slow, unarmed jeep** approaches the bunker. There are **no enemy infantry, convoy reinforcements, aircraft or surprise waves** in this first mission.
- The starter machine gun carries **9 bullets**: **3 taps of 3 bullets** per magazine, followed by a noticeable reload.
- The separate **FLAK** button fires **a single accurately aimed shell**, with small initial damage and a cooldown. You can wear the vehicle down until it is out of action.
- Movement, damage, weapons and Flak power increase gradually over subsequent maps, not all at once.

## Geography: one contiguous route, not random continents

1. **Maps 1–6:** farms, pasture, bridge, village, the first forest edge.
2. **Maps 7–12:** forests, wooded roads and rising foothills.
3. **Maps 13–18:** rock-lined mountain routes, passes, highland farm, descent to the outer suburbs.
4. **Maps 19–24:** suburban ring, railway yards, warehouses and factories.
5. **Maps 25–30:** city boulevard, market, station, inner ring and downtown finale.

No beach, ocean, desert or snow maps. Each map retains its own layout, obstruction placements and tactical approach.

## Core changes

- Every stage gradually adds at most a few infantry and vehicles. The first 2 maps have no enemy soldiers.
- Enemy speed and firepower rise slowly. Introductory vehicles move much more slowly than in the previous Quickfire release.
- Only selected later maps have a gentle surprise (small flank or smoke), not every map.
- **No forced 20–34 second extraction timer.** Defeat the finite enemies.
- **No upgrade shopping required:** on finishing each map, one micro-upgrade is automatically assigned, in a repeating order: rate, ballistics, bunker armor, Flak. Press **Volgende map** to continue.
- On the start screen, pick **any level 1–30** to quickly test the campaign's pacing and maps.

## Controls

- Tap anywhere to aim and fire a **three-round burst**.
- After three bursts on map 1, wait for the MG reload.
- Aim and tap **FLAK** to shoot **one** low-power shell.
- Tap through the completion screen to play the next map. No purchasing or allocation needed.

## Testing

```bash
node --check jbd_web/v10/game.js
node jbd_web/v10/v10_regression.cjs
```

The V10 GitHub Actions check validates all 30 maps, initial enemy composition and pace, initial weapon capacities, single-shell Flak, automatic incremental upgrades and iPhone canvas rendering.

All game graphics, vehicles, ballistics, audio and mobile controls come from the full original game engine; V10 supplies the new campaign progression and pacing.
