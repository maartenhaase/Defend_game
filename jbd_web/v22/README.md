# Bunker Defense 2.2 — Arcade Overhaul

Playable GitHub Pages URL (after deployment):
https://maartenhaase.github.io/Defend_game/jbd_web/v22/index.html

This is **not a rewrite**. The build copies V2.1, including the original 1.4 MB engine, original soldier and vehicle atlases, nine damage states, recorded audio, medics, and existing touch controls. It layers V2.2 changes on top without editing previous versions.

## Improvements
- Compact planned combat waves, reduced overly durable vehicles, gradually harder encounters.
- Original 12-round magazine and faster reload/burst cadence.
- One optional parachute crate per wave that needs 5–7 MG hits, instead of waiting for 3–6 old crates.
- Straightforward loot: repair, magazine capacity, faster reload or temporary stronger bullets.
- Kill combo to ×3, score, no-damage wave bonus and a small reload bonus for the next wave.
- Wreck wait under a second, then automatic deployment of the next wave.
- Original detailed sprite atlas preserved, sharper nearest-neighbor output, plus a small raster grass/stone tile. Not every old vector effect has been redrawn.
- No mandatory upgrades, no added currency or inventory, no additional buttons.

## Building and testing

    node jbd_web/v22/build.cjs --output /tmp/jbd22
    node --check /tmp/jbd22/game.js
    JBD_GAME_DIR=/tmp/jbd22 node jbd_web/v22/v22_regression.cjs

Checks run in a simulated iPhone browser environment. Real-device Safari performance testing still remains.
