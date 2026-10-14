# V9.9.14 — Aim, infantry stances & Tiger entry

- **Fixes the startup error** shown as “Can't find variable: separateVehiclesFromBuildings”. Adds a guarded vehicle/building separation fallback so the ramming layer cannot abort the game when that helper is missing from a cached engine.
- **Makes touch aiming more forgiving.** Tap remains one MG salvo; holding still fires a grenade; dragging still adjusts aim. Small aim assist snaps a near-center tap to a visible enemy, reduces spread for that assisted shot, and slightly widens only that bullet's hit test.
- **Shows infantry tactics clearly.** Small field markers distinguish attacking, in cover, and suppressed units; the crosshair names the selected unit's state.
- **Moves the Tiger off the bunker lane.** It chooses the clearer left/right entry lane, stays clear of the bunker, rolls in from below the screen, and the demo shows it after 10 seconds.
- Preserves the existing 17-map/13-biome campaign, Easy/Hard modes, random activated bonuses, gore, and other fixes.
