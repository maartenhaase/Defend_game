# V9.9.29 — allied combat, 8-kill support and distinct difficulty

- Fixed the per-frame allied cooldown floor that prevented infantry from ever reaching its fire event at 60 FPS.
- LMGs fire four- to five-round bursts; riflemen fire individual aimed shots. Every round produces a synchronized recorded gunshot, muzzle flash, recoil, casing and physical projectile.
- Embedded the recorded MG WAV and moved audio unlocking to capture-phase touch/pointer listeners for mobile.
- Added house-corner navigation and removed the old frontline clamps from flankers. Wounded and burning soldiers keep their emergency behavior.
- Start with an LMG gunner, rifleman and medic. Allied HP and damage are independent of enemy difficulty.
- Support tiers now cost 8 / 16 / 24 / 32 / 40 banked kills.
- EASY: fewer enemies and passengers, lower enemy damage/HP/speed/accuracy, 35% more bunker HP, reduced incoming damage and 20% faster reloads.
- HARD: larger and faster attack groups, an extra flanking reserve, higher enemy HP/damage/speed/accuracy, faster enemy fire, one bunker life and no free opening Tiger.
- Added a regression test that runs the actual engine at 60 FPS and verifies infantry fire/audio/damage, house flanking, support costs, initial campaign combat and EASY/HARD behavior.
