# JBD — Bunker Defense · Rebuild v1

Milestone 8: **ALL MAPS — 9 scenario campaign**.

## Spelen

Open `dist/index.html`. De release is één standalone HTML-bestand zonder externe runtime-assets.

## Campaign

De vaste volgorde is:

`JUNGLE 1 → JUNGLE 2 → JUNGLE 3 → DESERT 1 → DESERT 2 → DESERT 3 → POLAR 1 → POLAR 2 → POLAR 3`

Na `POLAR 3` start `JUNGLE 1` opnieuw als Cycle 2. Elke nieuwe cycle verhoogt de difficulty zonder de mobiele infantry-snelheid onbeperkt op te voeren.

## Map generation / gameplay

- Elke scenario rebuildt terrein, rivier, twee bruggen, wegen, gebouw, loopgraven, vegetatie en obstakels.
- Voertuigen kunnen de rivier niet vrij doorkruisen en routeren naar een brug als ze aan de verkeerde oever starten.
- Infantry kan door het water, maar beweegt daar op ongeveer 46% snelheid.
- Gebouwen, loopgraven en delen van de vegetatie zijn echte infantry-cover nodes.
- Jungle: meer cover, kortere zichtlijnen, tragere voertuigen.
- Desert: opener terrein, minder cover, langere zichtlijnen.
- Polar: open terrein, snellere voertuigen en relatief zware vehicle mixes.
- Per map 6–8 voertuigen verdeeld over drie korte phases.
- Airborne-maps gebruiken maximaal 3 paratroopers per pass in deze campaign-slice.
- Milestone 7 mobile scale blijft actief: 72% entities op smalle schermen, royale touch hitboxes, DPR cap 1.65.

## Build

`node build.js`

Genereert `dist/index.html` uit de modules in `src/`.

## Debug

`?debug=1` toont FPS/state overlays. `?stress=1` start de bestaande zware stress-scène binnen de huidige campaign-map.
