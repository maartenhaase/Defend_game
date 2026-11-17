# Bunker Defense 2.0 — reversible audiovisual polish

**Play** (once the GitHub Pages deployment succeeds):
https://maartenhaase.github.io/Defend_game/jbd_web/v20/index.html

**Original V10.8 is preserved and playable:**
https://maartenhaase.github.io/Defend_game/jbd_web/v10/index.html

## What is actually new

- A separately built **2.0 game**; all original V10.8 sprites, animated actors, recorded audio and gameplay stay in the engine.
- **Additive, short-lived lighting** around MG shots, direct impacts, FLAK explosions and vehicle burnout. Uses tight canvas radial gradients, NOT a fullscreen blur/bloom filter.
- **Layered impact reaction:** variable colored pixel embers, sparks, dust and ricochets, with gravity, ground bounce, lifespan, and a hard cap on simultaneous active particles.
- **Contact shadows** behind existing soldier and vehicle art to ground units in the level. No character or vehicle sprites are replaced.
- **Movement-aware dust** behind mobile vehicles, sparse and scaled by graphics mode.
- **Faint atmosphere layer** (off on Performance) while leaving map geometry, colors, camera composition, hitboxes and sprite pixel scale unchanged.
- **Audio:** separate effects and ambience volume controls. The ambience occasionally plays the engine's **existing recorded** MG34 sample faintly in the distance; no synthetic gunfire or placeholders. Music has a separate labeled control but no new music track is supplied.
- **Visual quality**: Hoog, Normaal, Prestatie reduce secondary light/dust density but never downgrade the original actor art.
- **A/B toggle**: the "2.0-effectlaag" checkbox allows instant side-by-side subjective comparison by turning *only* these enhancements off and on.
- **Menu chrome**: layered, beveled retro-inspired title/menu. This does not change the game camera or combat HUD.
- Safely pauses while the settings popup is open; suitable for iPhone touch.

## What has deliberately NOT been replaced

- All original soldier and medic sprite atlases, walk cycles, prone/wounded/death poses and AI.
- Existing vehicles, wheels, tracks, detailed visible damage states and destruction effects.
- Map art, foreground obstacles, backgrounds, textures, collision and physics.
- Original MG, FLAK, vehicle and impact sound recordings.
- All 30 maps, V10.8 stage-progress upgrade schedule and 18 bonus crate rewards, HP scaling, medics and five-second victory sequence.

## Test commands

\`\`\`bash
node jbd_web/v20/build.cjs --output /tmp/jbd20
node --check /tmp/jbd20/game.js
JBD_GAME_DIR=/tmp/jbd20 node jbd_web/v20/v20_regression.cjs
JBD_GAME_DIR=/tmp/jbd20 node jbd_web/v10/v108_regression.cjs
\`\`\`

The dedicated GitHub Actions workflow tests all 30 maps, intended upgrades including late rewards, 3 crates per level, 2.0 module presence, the original MG and vehicle drawing, touch settings, pause/unpause, and parsing of the built game. Existing V10.8 legacy regression also runs separately.

## Remaining limitations / strict quality policy

This is an **incremental 2.0 quality layer, not a completed NES-to-SNES remake**. No new hand-animated soldier/vehicle atlas has passed a real same-scene quality review, so none is substituted. No new recordings or multi-class motor loops have been introduced; recorded original effects are preserved. GPU performance and audio feel have not been benchmarked on a physical iPhone. Frame-by-frame identical-camera A/B video and performance capture remain to be done by human review; the in-game A/B checkbox makes those comparisons reversible. The generated concept artwork is **not shipped as a misleading replacement sprite or screenshot**.

Maintain this acceptance rule: never replace a higher-quality original asset with unverified, lower-quality AI/procedural geometry.
