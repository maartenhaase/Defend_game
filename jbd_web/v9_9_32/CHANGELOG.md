# V9.9.32 — Suppression and support

Apache: fixed continuous 12-second flight, curved altitude profile, body follows travel, gun aims independently. No target-driven altitude jumps or horizontal oscillation. Fires a short concentrated 30mm pass and leaves.

Support tiers retain shared 8/16/24/32/40 kill banking and the V9.9.31 test environment. Small artillery: three small 26px blasts, 24 infantry/vehicle base damage. Napalm: five 29px fire zones lasting 8.5s at 5.2 DPS. Apache: 12s mobile fire support. Heavy artillery: eight 54px blasts, 110 infantry/170 vehicle base damage. Precision: three 76px blasts, 220 infantry/480 vehicle base damage. Effects retain damage falloff and friendly blast risk. Easy no longer grants a free Tiger that bypasses the top tier.

Reinforcements: three basic troops; five-person command group with three MGs and stronger suppression; eight elites with greater accuracy, modest extra health and six armor; light scout (125 HP/30 armor); Tiger (240 HP/65 armor, stronger anti-vehicle cannon). Scout and Tiger remain distinct armor roles rather than invulnerable support.

Infantry: more planted shots and longer useful bursts, faster reloads, substantially reduced per-shot damage, lower health, less armor and 40% greater incoming enemy bullet damage. Wounded allies can be killed by small arms and bleed out faster. Controlled 12-second comparison: 62 shots vs 37, 45.97 damage vs 91.11, ordinary rifle HP 11.78 vs 20.52. These are deterministic scenario results, not universal percentages for every battle.

Enemy reaction: actual hits and player/allied near misses trigger a bounded sideways escape along the current horizontal line. Solid house corners and general obstacles create detours. Enemies stop firing while escaping, animate in their movement direction, recover behind cover and resume combat. A cooldown prevents endless forced flight; wounded/burning/parachuting states retain priority.

Verification: Node syntax; all ten UI upgrade activation paths; actual strike damage/napalm zones/Apache bullets; continuous Apache movement under per-frame target switches at portrait and landscape sizes; 12-second departure; open-ground horizontal escape; real house detour without clipping; enemy firing recovery; allied vulnerability; removal of free Tiger; campaign/difficulty and 40-map regression checks. Physical phone visuals/audio not independently verified for this release.
