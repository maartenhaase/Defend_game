# V9.9.46 — Vehicles stop earlier · Shorter cookoff · More believable infantry

## Vehicle balancing
- ALL motor vehicles have 39% less top speed and 40% less acceleration. Enemy vehicles approach only to an earlier contact line (at most 33.5% of screen height) and all driving vehicles have a hard stop line at roughly 40.5% screen height, never pushing into the bunker. At that line, passengers dismount, guns fall silent and the intact vehicle remains as battlefield cover (no undeserved kill reward).
- First **penetrating** hit cripples movement to at most 28% of already reduced top speed and disables the mounted machine gun immediately. Second good hit immobilizes typical light and medium vehicles; heavy or class-3 armored vehicles require three. A damaged tire/fuel system or radiator may cause an earlier engine breakdown.
- Significant hull damage (below 70% health) immobilizes the vehicle even if it survives. A solid player grenade can produce an immediate mobility kill without falsely treating an intact hull as an exploding wreck.
- MG remains disabled for stopped/ignited/damaged vehicles, including flank and avoidance routes. Neutralized vehicles become actual blocking wrecks, with a safe crew evacuation.

## Ammunition cookoff and effects
- Duration **2–5 seconds** (formerly 15–60 seconds). A shot can still hit either side, but emissions are less frequent and individual shots are less deadly (18 → 11).
- Each ejected round now has a thinner luminous tracer, tiny white-hot tip, a subtle rusty trail and a small intermittent chamber spark. Muzzle-flash spam, glowing giant particles and sound spam are reduced; fewer smoke and flame bursts. Short projectiles expire after 0.26–0.50 seconds.
- After the short cookoff, the vehicle burns out; wreck/fire/smoke systems continue normally.

## More natural infantry
- Soldiers under direct fire independently seek nearby real cover instead of simply walking towards the bunker. When no cover is reachable, many lie prone for 1.8–3.4 seconds; soldiers in cover regroup and may advance cautiously from cover to cover.
- When bunker takes a hit, infantry performs a shorter, less extreme sprint (1.8 seconds, 36% boost rather than 2.6 seconds, 55%). Otherwise they move at 80% standard pace. Existing squad morale, 4-kill panic, medic/engineer/radio behavior and 2–15% prone hit probability remain.

New smoke/regression check: vehicle_regression.cjs (vehicle speed, early stopping/dismount, damaged MG, cookoff length, infantry under fire). Prior versions are preserved.
