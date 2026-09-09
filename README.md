# Defend Game

Browser-based beach-defense game. Main desktop build.

## Current build: v2.7

### Controls
- Mouse: aim
- Hold mouse button: fire selected weapon
- 1 / 2 / 3: Normal / AP / HE

### v2.7 highlights
- GitHub is now the source of truth.
- Filled vector/line-art rendering; the old pixel sprite atlas has been removed.
- Infantry has articulated two-joint leg animation with readable feet/boots.
- Infantry performs small random actions: looking around, pointing, reloading, ducking and short sprints.
- Infantry death animation: fall, remain on the beach briefly, then sink/fade into the ground.
- Wave 1 starts with two technicals and infantry groups that strongly use technicals as moving cover.
- Motorcycles added as very fast light vehicle encounters from wave 2 onward.
- Starting Normal MG is calmer: 2-round burst, longer pause between bursts, still heats quickly.
- Player Normal/AP projectile graphics are clean yellow dots instead of long ugly trails.
- Expanded Web Audio API engine lives in `src/audio.js`, including ambient surf/noise, reload clicks, death thuds, motorcycle engine chatter, near-miss whiz, FM gunshots and explosions.

### Files
- `index.html` – page / HUD
- `style.css` – desktop interface
- `src/01_core.js` – constants, state, geometry and vector helpers
- `src/02_data_world.js` – enemy data, battlefield systems and movement helpers
- `src/03_wave_spawn.js` – wave composition, spawning and vehicle lifecycle
- `src/04_combat.js` – player weapons, hits, AP/HE and enemy fire
- `src/05_ai_update.js` – enemy behavior and main update loop
- `src/06_render.js` – filled vector rendering and animation
- `src/07_input_ui.js` – input, shop and HUD
- `src/audio.js` – Web Audio API synthesis / ambience

No framework or build step is required. Open `index.html` in a modern desktop browser.
