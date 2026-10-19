# Just Bunker Defense V9.9.47

- Ten **successful hull penetrations** (not ricochets or raw HP changes) are required for a normal gunfire mobility stop. Immobilized vehicles remain alive and their stationary mounted weapons can continue shooting. A driver kill also stops movement without implying complete destruction.
- The large instantaneous blast is the only one of three fuel disaster outcomes to destroy the live vehicle outright. Slow fireball and short (2–5 s) ammo cookoff leave a soot-blackened stationary hull which survives and may operate its mounted weapon when the flames are out. The separate high-explosive/direct-damage destruction path still exists.
- Manual MG tap gives **3 shots**, not 5. Grenade slots start at 1; first slot upgrade at level 8, second at level 16. Ground fuse increased one second to **1.45–1.95 s**.
- Infantry reacts to nearby armed player grenades **in flight and during fuse countdown**: it runs directly away, seeking distant physical cover when appropriate, and cannot fire while escaping.
- Normal truck unloading creates **1–3 white smoke grenades lasting 5–10 seconds** (visible smoke zones), and soldiers sprint left or right in two independent groups, then take cover. No forced burn casualties on normal unloading.
- Radio infantry is introduced into regular mixed waves. Transmissions last five seconds, have chatter and immobilize the operator while calling, and call random reinforcement teams. Medics, grenadiers, engineers, officers and MG setup are retained and included in the test roster.
- Uniform and vehicle sprites use **per-map palette swaps**, with different winter, desert, forest/jungle and urban combinations. Environment sprites are tinted and destructible building wall/roof edges receive snowfall or sand buildup without hiding the visible ground-floor interiors.
- Upgrade shop allows **exactly one free upgrade after each completed map** (+4 underlying levels per choice). No point prices or point balance; next map unlocks after a selection. Existing 20-level tuning curves remain.
- Old explosion, engineer and +kills test controls are hidden in favor of a **single test map**: one button cycles through infantry/vehicle types, the other deploys the selection from the north. Normal campaign remains separate and untouched.

Tests: new v9_9_47/regression.cjs covers mobility, gunner, three burn scenarios, grenades, radio and more. CI validates JavaScript syntax and test map resources.

## HARD balance update · 18 October 2026

- Grenade baseline increased: impact 22 → 28, blast 14 → 21, radius 12 → 16; bigger blast animation, crater and screen kick.
- Bunker baseline increased from 90 to 115 HP before map/device modifiers (+27.8%).
- Fuel-component hits cause leaks sooner, and fuel ignition chance rises after a short visible leak (MG does not instantly burn a vehicle on the first burst).
- Full vehicle immobilization/destroyed distinctions, independent fire scenarios, and grenade slot upgrades remain intact.
- One free upgrade is now mandatory after each completed map; the old arsenal point currency is not used for purchases or displayed.
- Added automated regression tests for grenade power, starting bunker HP, vehicle ignition timing, and free upgrade enforcement.

## HARD rework: bullet penetration, campaign ramp and camouflage · 18 October 2026

- Enemy rifle, marksman, light-machine-gun and vehicle machine-gun rounds now carry muzzle speed, penetration level, material resistance, energy loss with range, and a possible ricochet on fortified concrete. Nonpenetrating ordinary bullets cause only 0.055 pre-armor HP damage, rather than full attack damage. Successful penetrations have an individual 1.55 pre-armor HP damage cap; grenades, shells and rockets remain dangerous.
- Reduced the initially forced HARD adaptive pressure and softened initial enemy health, accuracy and fire cadence; these rise progressively over later maps rather than being severe on map 1.
- Introduced deterministic 40-map HARD unit budgets. Map 1 starts with only four rifle infantry and no enemy vehicles; first light-class scout on map 3, first transports later, gradually rising through five vehicles by map 40. Groups are staggered in time and active unit pressure can postpone the next wave.
- Prevented legacy encounter decorators from overriding the new HARD budgets or inserting early reinforcements. Early HARD foot squads do not spawn medics or radiomen; the original behavior resumes later.
- Infantry gets three separately painted camouflage palettes per biome (forest/jungle, desert, snow, urban, coastal), applied to the existing pose/role geometry; pixel camouflage speckles remain confined to clothing and helmets. The sprite atlas is 2048 px to fit the additional uniform skins.
- Existing vehicle models retain their biome palettes and receive deterministic three-color paint spots per vehicle. Reusable ground-floor building models now have six per-biome floor, wall, furniture and trim palettes, with variation independent of damage geometry and collision.
- Added regression tests for HARD growth across map 1/3/6/12/20/40, concrete ricochet/penetration at near and long range, and palette/atlas generation.

## Grenade and nonverbal battlefield clarity · 19 October 2026

- Grenades always have **one rechargeable charge**, at every special-upgrade level (0–20); legacy multi-slot arrays are trimmed without resetting the active cooldown.
- Recharge is deliberately long throughout the campaign: **10.5 seconds at level 0, 8.5 seconds at level 20**; no rapid-fire HE spam.
- The explosion progression is reduced to a controlled 28→71 direct impact, 21→54 fragmentation/blast, 16→27 radius (previously 28→152 damage and 16→59 radius). Explosion particles and impact shake scale modestly.
- Fuse progression shortens with level; levels 16–20 ignite immediately upon terrain, vehicle, soldier or target-point impact (fuse 0) rather than creating a ticking grenade. Levels below 16 still detonate after a fuse, retaining grenade panic and AI evasion.
- Removed all floating enemy infantry role circles, threat reticles, vehicle component damage notices and status/penetration labels; stripped allied vehicle star and engineer overhead progress bar. Smoke, burning metal, broken tires and crew actions remain the visual feedback.
- Soldier bodies now communicate tactical actions through animated arms/hands: panicked two-hand alarm, flanking leader pointing, radio hand-to-ear, medic reaching, engineer hammering, shooter bracing, and walking arm swing. Faces also show emotions on allied soldiers.
- The normal top/bottom player HUD remains for your health and the single HE cooldown. Regression tests cover HE limits, single-slot behavior, impact detonation, preserved cooldown during upgrades, and absence of overhead labels.
