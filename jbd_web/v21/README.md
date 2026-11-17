# Just Bunker Defense 2.1 — challenge / loot / vehicle edition

Playable GitHub Pages build:
https://maartenhaase.github.io/Defend_game/jbd_web/v21/index.html

Unchanged older releases:
- V2.0: https://maartenhaase.github.io/Defend_game/jbd_web/v20/index.html
- V10.8: https://maartenhaase.github.io/Defend_game/jbd_web/v10/index.html

## Actually delivered

- The old V10.8 4–9 forced upgrade prompts are **turned off**. V10.8 upgrades previously earned in saves still apply through the original profile wrapper.
- Random **3–6 parachute crates** each level, paced across the encounter schedule; rapid delivery only if hostiles are already cleared. Crates remain *optional* to open.
- A crate's base hit durability is **19–30 normal MG bullets** before considering saved powerups; FLAK destroys crates faster, and crate decals progressively show damage.
- Warm pulsing crate glow, existing detailed parachutes and visible hit feedback, without enlarging pop-up reward text.
- The existing **12-bullet minimum magazine** is enforced even if an older reset path or save has lower values. Loot magazine upgrades remain active.
- **2.55–3.15× starting HP** multiplier applied after original class/level scaling (the starter encounter at 2.55, later 2.75+); lower MG hull effectiveness and much stronger HE/FLAK; gunfire can achieve a non-burning mobility kill, while critical burning is gated behind explosive damage.
- On Easy, firing cadence, dispersion, and damage get small (~10% relative) improvements on enemy side. No indiscriminate HP inflation to infantry, no huge starting wave.
- New encounter-planned vehicle variants, first introduced at:
  - L2 white Technical: two crew, existing detailed jeep chassis with white paint/filter/highlights, mounted MG and visible gunner;
  - L3 crossbike: two dismounting elite soldiers, no mounted MG; renders a cropped original detailed motorcycle with new rider placements instead of a cheap replacement sprite;
  - L4 quad: driver and one genuine medic, no mounted MG;
  - L5 medical troop transport: four to six real Class A medics, staggered dismount, real medic healing AI and MP40 weapon profile.
- Existing Kubel/Horch jeeps display four visible helmeted occupants on top of their **original** vehicle atlas. Vehicle type and damage controls still use their original atlas and 9-state progression.
- Later maps choose occasional variants instead of uniform vehicle spawns. Original rare ally Rambo and armored reinforcement chances become even lower.

## Intentional preservation / known limitations

The new vehicle variants reuse and rework the **existing high-detail artwork** and vehicle engine. **No separately drawn, hand-reviewed pixel-art vehicle spritesheet has yet been released.** The crossbike appearance is a cropped motorcycle atlas; technical white paint is achieved with a selective visual filter; crew heads and medical insignia are overlays. This is gameplay-complete but the art remains a candidate for further manual polish, not claimed to be a ground-up new vehicle illustration.

Original machine-gun, FLAK, anim/AI, terrain, medics, prone targets, sound recordings, original V2.0 effects/audio settings and 5-second wreck finish are left in place.

An on-device iPhone frame-rate and fine-art review have **not** been done; GitHub Actions executes Node canvas/DOM simulations. Test verifies 30 maps load, 3–6 crate schedules, 12 bullets, early arrival, all new vehicle IDs, crew unloading with MP40 and elites, realistic crate bullet hits, damage differentiation and actual map 7 → 8 completion.

## Building and testing

\`\`\`sh
node jbd_web/v21/build.cjs --output /tmp/jbd21
node --check /tmp/jbd21/game.js
JBD_GAME_DIR=/tmp/jbd21 node jbd_web/v21/v21_regression.cjs
\`\`\`

The V2.1 builder creates a separate bundle from the original V10 base, V10.8 save compatibility, V2.0 visual/audio layer, and the new V2.1 gameplay layer. It does **not** edit old game files.
