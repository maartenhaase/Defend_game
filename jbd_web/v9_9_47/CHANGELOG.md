# Just Bunker Defense V9.9.47

- Ten **successful hull penetrations** (not ricochets or raw HP changes) are required for a normal gunfire mobility stop. Immobilized vehicles remain alive and their stationary mounted weapons can continue shooting. A driver kill also stops movement without implying complete destruction.
- The large instantaneous blast is the only one of three fuel disaster outcomes to destroy the live vehicle outright. Slow fireball and short (2–5 s) ammo cookoff leave a soot-blackened stationary hull which survives and may operate its mounted weapon when the flames are out. The separate high-explosive/direct-damage destruction path still exists.
- Manual MG tap gives **3 shots**, not 5. Grenade slots start at 1; first slot upgrade at level 8, second at level 16. Ground fuse increased one second to **1.45–1.95 s**.
- Infantry reacts to nearby armed player grenades **in flight and during fuse countdown**: it runs directly away, seeking distant physical cover when appropriate, and cannot fire while escaping.
- Normal truck unloading creates **1–3 white smoke grenades lasting 5–10 seconds** (visible smoke zones), and soldiers sprint left or right in two independent groups, then take cover. No forced burn casualties on normal unloading.
- Radio infantry is introduced into regular mixed waves. Transmissions last five seconds, have chatter and immobilize the operator while calling, and call random reinforcement teams. Medics, grenadiers, engineers, officers and MG setup are retained and included in the test roster.
- Uniform and vehicle sprites use **per-map palette swaps**, with different winter, desert, forest/jungle and urban combinations. Environment sprites are tinted and destructible building wall/roof edges receive snowfall or sand buildup without hiding the visible ground-floor interiors.
- Upgrade shop allows **just one purchase per completed round**, with +4 underlying track levels per purchase and prices starting at 6 points then increasing to 18 points. Existing 20-level tuning curves are retained so each purchase has a large effect.
- Old explosion, engineer and +kills test controls are hidden in favor of a **single test map**: one button cycles through infantry/vehicle types, the other deploys the selection from the north. Normal campaign remains separate and untouched.

Tests: new v9_9_47/regression.cjs covers mobility, gunner, three burn scenarios, grenades, radio and more. CI validates JavaScript syntax and test map resources.
