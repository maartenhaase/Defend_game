# V9.9.39 — Expressive faces and stronger enemy vehicle action

Enemy infantry faces grow from 7x7 to 9x9 feature pixels, with shaded cheeks, ears, nose highlights, helmet rims, eyebrows, eye whites, teeth and tears. Nine expressions follow combat state: calm, angry, afraid, pain, relieved, determined, surprised, exhausted and worried. Pain and fear take priority over post-treatment relief.

Across all forty maps and each start difficulty, enemy infantry receive 12 percent more health and ground vehicles receive 10 percent more health. Enemy helicopter/plane health increases 10 percent and parachutist health increases 12 percent. Allied infantry normalization preserves their existing health and medic balance.

Ground vehicles drive 15 percent faster and accelerate 12 percent faster. Armed hostile vehicles fire one additional round per burst with 20 percent shorter firing intervals and burst pauses. Allied vehicle bursts grow from six to seven rounds and also use 20 percent shorter intervals. Existing aiming, driving states, collisions and disabled-vehicle behavior continue to apply.

Verification: full automated battle regression suite passes, including immediate manual input at three viewport sizes, medics, gore, fuel ignition, ordered penetration, all-map navigation and scout persistence. New checks cover nine distinct 9x9 faces and their state transitions, difficulty ratios across 120 map/mode combinations, unchanged allied infantry health and actual sustained vehicle fire. A controlled 20-second vehicle test produces 105 shots versus 72 in V9.9.38. Face patterns were visually inspected. No physical-device playtest was performed.
