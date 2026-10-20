# Just Bunker Defense V9.9.52 — concentrated AP, stronger enemy fire, Flak shellshock

- **Single aimed AP .50-cal:** 2 penetrating fully-focused rounds knock out light vehicles and 3 focused hits defeat medium/heavy vehicles. Weaker rapid-fire bullets contribute only 0.12–0.4 AP hit credit; ricochets do not count.
- Enemy rifle, marksman and LMG bullets deal 50% more base damage; effective bunker penetration chance and applied damage increased. Remaining 3.2-second nonstacking malfunction grace from V9.9.51 is preserved.
- Flak starts at three shells, six-second reload, now with stronger infantry splash (base 16) and vehicle splash (base 13.5), radius 25px. Later special upgrades improve these values and unlock 4/5 shells.
- Flak shrapnel can cripple **tires/tracks, radiators, windshields and chassis** separately, even without destroying the hull. Pure track damage does not disarm the vehicle.
- All flak explosions suppress and scare nearby infantry with morale penalties. Each nearby soldier rolls **10% shellshock** once per flak salvo. Reactions: (1) freeze, (2) flee with arms behind their back, or (3) rush the bunker firing erratically, with bullets able to injure their own side and allied units.
- The prior flak-only UI and preserved legacy grenade code remain intact. V9.9.51 is not modified.

## Earlier changes
# JBD V9.9.51 — squad crash hotfix + flak-only upgrade

- FIX: error `TypeError: undefined is not an object (evaluating 'gunner.nextSquadSmoke9948')` caused by non-numeric squad IDs. Squad IDs now hashed to a valid index with a safe fallback; also the suppressor does not have its firing timer reset on every frame.
- The player grenade is **removed from all normal controls and HUD**. The complete grenade engine, fuse mechanics and projectile implementation remain intact in the source for future reactivation. Enemy grenades remain unaffected.
- Flak is the sole secondary weapon: **starts with 3 short airburst shots**, lower initial per-projectile damage and radius than the former grenade. Long-press in the map (350ms) or touch the new FLAK firing button. Short taps remain MG.
- Flak recharges in **6 seconds**. Upgrading the existing SPECIAL track now upgrades FLAK power, radius and salvo: **3 at 0–7 / 4 at 8–15 / 5 at level 16+**. Reload stays at six seconds.
- Updated lower HUD to FLAK 3×/4×/5× and countdown. Updated error banner to the actual version and prevented duplicate error overlays.
- Source compiled; isolated test executed with a string squad ID and rotating covering gunner; isolated flak test verified three shots and separate six-second cooldown.
- V9.9.50 preserved.

## Earlier versions
# Just Bunker Defense V9.9.50 — Flak & Convoy Test
- AP 50-cal vehicle disablement now takes **4 penetrating focused hits for light vehicles, 5 for medium vehicles, 6 for heavy vehicles**. Ricochets do not count; fuel-fire KO stops movement and fire immediately, but existing track-only immobilization still permits mounted fire.
- The first aimed AP shots against exposed infantry now generally kill in **one hit**; particularly covered or armored troops may take two.
- Secondary special **toggle button** switches GRENAAT ↔ FLAK. Hold 350 ms on a map target to fire the selected secondary (normal quick taps still operate the MG). Flak launches **five loud 20mm-like proximity airburst shells**, scattered around the target with visible tracers, sparks and five flashes. Separate six-second reload; grenade remains independently usable.
- First Allied reinforcement tier: **10 weaker cannon-fodder infantry (5 left, 5 right)**, with modest accuracy and damage but meaningful decoy value. Second tier: **six more cautious defenders with two engineers** and staged sandbag/MG defenses near left and right. Third tier: **eight powerful elite troops (4 per side) with two medics**, stronger accuracy, damage, HP and suppression resistance.
- Allied teams move decisively along **extreme map edges** and fire more often between bounds. Enemies prioritize visible Allied infantry/armor before the bunker.
- Enemy squads rotate the one suppressing shooter every **3.1 seconds** while the other members flank and run; synchronized white smoke still assists those moves.
- Weapon malfunction probability rises after a **minimum 3.2-second clear break**: 72% on direct hit, 29% near miss, still only one randomly selected impairment at a time.
- **Maps 1–5 are progressively larger unarmed troop convoys**, with infantry dismounting from trucks. Beyond that, regular foot-squad events are delivered in trucks as standard.
- Version 9.9.49 and older remain in their respective versioned paths.

## Earlier history
# Just Bunker Defense V9.9.49
- Even harder first focused MG bullets: 2.2× baseline damage, up to 2.35× base penetration chance, with a .85 chance cap and enhanced armor penetration level. Sustained MG shots remain unaffected.
- AP .50-cal style hits that **actually penetrate** have a considerably higher chance to rupture/ignite fuel, with lighter vehicles more vulnerable than heavy armor. Fire extinguishes the vehicle's MG immediately; intact immobilized tracks/driverless chassis may still use a functioning MG.
- Subtle blue-glowing crosshair when completely stabilized and ready for deliberate precision fire.
- More enemy vehicles: one extra vehicle event on about two-thirds of vehicle-bearing maps, without increasing infantry wave size.
- Enemy suppressive fire: at most one random effect out of seven (jam 1s, delayed reload 1–2s, slower ROF, lost magazine rounds, lower projectile speed, much larger spread, slower recovery). Direct hits have a 35% trigger chance and near misses 12%. No stacking; minimum 3.2s clear recovery AFTER the effect ends. Red jam flash only on jams.
- V9.9.48 and all older paths are preserved.

## Previous history
# Just Bunker Defense V9.9.48

- First focused MG shots: up to 50% more force and 70% penetration chance, without boosting sustained fire; level-one maximum spread reduced 20%.
- More dangerous enemy bullets; bunker hits and near misses create suppression. Suppression increases reload by 1–2 seconds, can jam the gun for 1 second, reduces fire rate and ammo, slows bullets, increases spread, and delays recovery. Red blinking reticle during jams.
- Enemy squads: one gunner gives cover fire while squadmates attack offset approaches behind tactical smoke.
- Allied pairs and 4/6/8-person ladders split left/right and flank even when the target is visible; vehicle crews bail out in even groups.
- Hurricane/period bomber and fighter strafing runs now cross south to north. Fighter fires five animated rockets.

## Previous version notes
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

## FPS fire discipline · 19 October 2026

- Replaced the legacy three-bullet-on-every-tap and automatic five-round salvo with precise manual shooting: first isolated tap = **one** full-speed/full-penetration/zero-deviation bullet; another tap sooner than the aim-rest threshold = a **three-bullet volley**. The first/second/third bullets in each volley receive increasing recoil/spread.
- Rapid click chains progress through **five** stability tiers; further shooting is allowed at the capped maximum instead of being disallowed. At maximum recoil, bullet speed, damage and penetration chance decrease modestly, while angular dispersion is the main tradeoff. Target magnetism and hidden aim assistance are removed: the projectile now uses the exact pointer direction plus mechanically modeled recoil.
- Without stability upgrades, waiting **1.5 seconds** after a single shot yields another accurate single, while repeated fire takes **3.5 seconds** to become completely stable. The existing merged handling/aim-stability upgrade ramps those durations down to **0.5 and 1.5 seconds** at max level, reduces maximum spread and decreases damage/penetration loss.
- A compact FPS-like crosshair has a true center dot and tight hairline brackets at rest. It expands proportionally to recoil projected over current target distance, subtly changes color during heavy spray and closes again with real gun stability. No target snap boxes.
- Removed an additional legacy set of geometric enemy posture glyphs, the priority-radio triangle and fire-zone floating text. These were still being rendered by old decorators even after the preceding label cleanup.
- Integration and regression cases now cover initial one-shot release, quick-click three-shot volleys, five-tier escalating recoil, recoil-capped long strings, bullet speed/penetration penalties and stabilization from the existing handling upgrade.
