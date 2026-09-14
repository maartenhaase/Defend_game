# JBD — Bunker Defense · Rebuild v1

Milestone 7 vertical slice: **mobile scale + airborne**.

## Speelbaar

Open `dist/index.html`. De release is standalone en heeft geen externe runtime-assets nodig.

## Milestone 7

- Mobile-first entity scale: 72% op smalle schermen; desktop 86%.
- Hitboxes blijven bewust ruimer dan de visuals voor touch-aim.
- Rustigere infantry: walk 22 px/s, sprint 50 px/s, assault rush 61 px/s.
- Mobile Canvas DPR cap 1.65 voor lagere fill-rate op iPhone-achtige schermen.
- Transport aircraft pass met draaiende propellers en procedurele motor-audio.
- 6 parachutisten per airborne wave.
- Canopy sway, drift, descent en individuele landingshoogte.
- Parachutisten zijn tijdens de afdaling te raken met MG/AP/HE.
- Correcte landing: parachutist wordt normale infantry.
- Neergeschoten parachutist levert geen infantry op.
- Ingezakte parachutes blijven tijdelijk zichtbaar op het slagveld.
- Milestone 6 voertuigen, wreck-cover en crater assault blijven actief.

## Debug

Voeg `?debug=1` toe voor state/FPS overlays. `?stress=1` blijft beschikbaar voor de bestaande stress-start.

## Build

`node build.js`

Genereert `dist/index.html` uit de modules in `src/`.
