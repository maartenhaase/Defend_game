# V9.9.30 — Fire and Cover

- Replaced the overlapping allied movement controllers with one tactical controller.
- Infantry walks at 13 px/s and makes short bounds at a maximum of 20 px/s, followed by a cover pause. No random side-to-side patrol while a target is visible.
- Infantry plants its feet, aims, fires, reloads real magazines and keeps a firing position while it remains useful.
- Nearby bullets and explosions suppress both sides. Allied soldiers go prone, stop firing when pinned and recover rather than charging through fire.
- Visible enemies engage allied infantry or armor directly, including when a building hides the bunker.
- Improved aimed rifle effectiveness and LMG suppression; allied damage remains independent of enemy difficulty.
- Fixed reinforcement entry clamping that moved soldiers forward instantly.
- Animation now follows actual movement: stationary infantry crouches/idles, suppressed infantry goes prone, and running frames follow traveled distance.
- Corrected infantry/projectile/tank speed ratios. The Tiger has one controller, slower arrival and movement, no duplicate scripted enemy shots and stronger small-arms armor.
- Smaller muzzle flashes, restrained camera shake/exposure, distance-dependent recorded gunshots and short recorded reflections.
- Retained the two support buttons, 8-kill ladder and distinct EASY/HARD modes.
- Regression coverage includes planted fire, reloads, suppression/recovery, blast reactions, bounded movement, house flanking, real crossfire, multiple screen sizes and profile checks across all 40 maps.
