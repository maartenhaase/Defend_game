# V9.9.38 — Manual fire, pixel faces, dismemberment and effective medics

Short taps fire immediately on release. Holding at least 350 ms fires a grenade immediately on release. Command acquisition, traverse delay, automatic magazine fire and the additional mortar delay have been removed. Unlimited range, existing stability upgrades, empty-magazine audio and the mortar report remain.

Lethal explosions can detach one to three pixel arms or legs; bullet kills occasionally detach one limb. Parts fly, settle and expire in a bounded pool. Corpses show missing limbs and blood persists longer. Wounded enemy infantry can be finished with bullets.

Living enemy infantry have seven-by-seven pixel faces with five state-dependent expressions: calm, angry, afraid, pain and relieved after treatment. Faces support standing, crouching, prone and parachuting units.

Both enemy and allied medics prioritize critical patients, stop bleeding, approach with obstacle navigation and return living wounded soldiers to combat at at least 80 percent health. Treatment requires close range and a clear path, cannot revive the dead and uses patient claims to distribute medics. Medics have more health and modest bullet resistance. Allied wounded survive longer to allow rescue; reinforcement tiers two and three each include a medic.

Previous staged fuel leaks, ignition, scout persistence, progressive historical maps, sequential penetration and support upgrades remain.

Verification: JavaScript syntax and the full battle regression suite pass. Actual pointer tests cover immediate taps, immediate held grenades, cancellation and absence of automatic firing at 320x844, 390x844 and 844x390. Added checks cover five distinct emotion patterns and states, detached limb physics and limits, enemy and allied rescue, walls and distance, medic durability and reinforcement composition. These are automated tests, not physical-device playtests.
