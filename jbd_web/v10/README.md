# Just Bunker Defense V10 — The Long Road (30 maps)

**iPhone play:** https://maartenhaase.github.io/Defend_game/jbd_web/v10/index.html

This is a **rebalanced progressive campaign (V10.5)** built on the full V9.9.53 Just Bunker Defense engine. The rushed 40-map Quickfire set is replaced with 30 maps; no V9 files were overwritten.

## First map: the tutorial

- **Exactly one slow, unarmed jeep** approaches the bunker. There are **no armed infantry, convoy reinforcements, aircraft or surprise waves** in this first mission. Three **unarmed** occupants flee the jeep when it is hit or stopped; they cannot fire and are not required kills.
- The starter machine gun carries **12 bullets**: **4 taps of 3 bullets** per magazine, followed by a noticeable reload.
- The separate **FLAK** button fires **a single accurately aimed shell**, with meaningful initial damage and a cooldown. Both the MG and FLAK can damage the jeep's hull until it is truly destroyed. A disabled driver is not counted as a victory.
- Movement, damage, weapons and Flak power increase gradually over subsequent maps, not all at once.

## Geography: one contiguous route, not random continents

1. **Maps 1–6:** farms, pasture, bridge, village, the first forest edge.
2. **Maps 7–12:** forests, wooded roads and rising foothills.
3. **Maps 13–18:** rock-lined mountain routes, passes, highland farm, descent to the outer suburbs.
4. **Maps 19–24:** suburban ring, railway yards, warehouses and factories.
5. **Maps 25–30:** city boulevard, market, station, inner ring and downtown finale.

No beach, ocean, desert or snow maps. Each map retains its own layout, obstruction placements and tactical approach.

## Core changes

- Every stage gradually adds at most a few infantry and vehicles. Only map 1 has no hostile infantry. Map 2 introduces enemy foot soldiers and a second vehicle.
- Enemy speed and firepower rise slowly. Introductory vehicles move much more slowly than in the previous Quickfire release.
- Only selected later maps have a gentle surprise (small flank or smoke), not every map.
- **No forced 20–34 second extraction timer.** Defeat the finite enemies.
- **No upgrade shopping required:** multiple automatic arsenal improvements are awarded as maps advance, with noticeable MG ammunition, rate, penetration, armor and FLAK upgrades. Press **Volgende map** to continue.
- On the start screen, pick **any level 1–30** to quickly test the campaign's pacing and maps.

## Victory conditions (V10.2)

- A mission cannot end because an intact car merely stops, parks or loses its driver.
- The tutorial car must be destroyed, and subsequent maps must clear their actual enemies.
- After destruction, the game remains playable for **five seconds** of burning wreckage and visibly fading smoke before the results appear.
- The **Next Map** button is explicitly enabled; its tap runs the next map directly. No upgrade shop selection is required.

## V10.3 — iPhone freeze and crew fix

- **The 0s countdown always completes**: after the five-second wreck scene, the result screen appears without re-checking enemies added by unrelated systems.
- **No surprise legacy spawns**: the 30-map campaign uses only its authored encounter plan. The old battle ambience and adaptive reserve generators cannot add unexpected infantry or transports.
- **The MG and Flak remain usable** while the wreck smolders.
- **Unarmed evacuees use the original game's animated medic sprite atlas** instead of temporary low-detail stick figures; they move in one consistent direction and disappear cleanly after leaving the scene.
- The old **Strike/Reinforcements bonus overlay is hidden** on iPhone so it does not cover the Flak control.
- The Next Map button remains enabled and transitions directly into the following mission.
- Screenshot regression tests deliberately inject an unrelated enemy at the end of the burning timer to ensure the results dialog does not hang.

## Controls

- Tap anywhere to aim and fire a **three-round burst**.
- After three bursts on map 1, wait for the MG reload.
- Aim and tap **FLAK** to shoot **one** low-power shell.
- Tap through the completion screen to play the next map. No purchasing or allocation needed.

## Testing

```bash
node --check jbd_web/v10/game.js
node jbd_web/v10/v10_regression.cjs
```

The V10 GitHub Actions check validates all 30 maps, initial enemy composition and pace, initial weapon capacities, single-shell Flak, automatic incremental upgrades and iPhone canvas rendering.

All game graphics, vehicles, ballistics, audio and mobile controls come from the full original game engine; V10 supplies the new campaign progression and pacing.

## V10.4 — brandende doelen, vallen en munitie

- Brandende voertuigen die onbeweeglijk en feitelijk onraakbaar zijn, bereiken nu binnen circa 5,5 seconden de normale vernietigingsroutine. Een echt nog intact en bereikbaar doel moet nog steeds worden geraakt.
- Voertuigwrakken blokkeren een level niet meer nadat de laatste echte vijand is uitgeschakeld en alle geplande aanvallen zijn geweest. De bestaande vijf seconden smeulen blijven zichtbaar, daarna verschijnt **Volgende map**.
- Infanterie krijgt een duidelijke geraakte-reactie en een vallende/ineenzakkende doodanimatie in plaats van een onmiddellijke sprite-wissel. Het originele sprite-atlas blijft gebruikt.
- Rondvliegende munitie bij een voertuigbrand heeft langere ballistische boogbanen en een afzonderlijk plof-/metaalgeluid per schot.
- De regressietests controleren nu ook een vastgelopen brandend voertuig in map 3, de valanimatie en de munitieboogjes.


## V10.5 — snellere vooruitgang en veel levendiger maps

- Map 1 blijft de introductie: één onbewapend voertuig, nu **12 patronen** en een effectievere FLAK. Daarna nemen de tegenstanders veel sneller toe.
- Al vanaf map 2: **minimaal twee voertuigcontacten plus infanterie**. Vanaf map 4 drie voertuigen en zwaardere vijandtypes; vanaf map 7 vier of meer voertuigen per missie.
- Gebruik van bestaande sprites en systemen: BMW R75 met zijspan, Kubel, Horch, Steyr, Blitz-transport, Sd.Kfz.-pantserwagens, halfrups, quad-scouts, cavalerie, machinegeweerteams, scherpschutters, rook, artillerie en vliegtuigen. Gepland per map met verrassingsmomenten.
- Het MG-magazijn groeit **iedere twee maps** en krijgt extra bonussen; het aantal patronen per salvo stijgt van 3 naar 4 op map 4, naar 5 op map 8 en naar 6 vanaf map 14. Herladen wordt sneller en vuur wordt sterker en preciezer.
- De FLAK krijgt **2 schoten per druk** vanaf map 4, **3 vanaf map 9** en **4 vanaf map 16**. Ook inslagschade, radius en herlaadsnelheid verbeteren.
- Vijandelijk voertuigvuur wordt vanaf map 3 weer mogelijk. Een werkelijke bunkerinslag doet nu zichtbaar HP-schade en geeft duidelijke visuele schadefeedback, in plaats van de onmerkbare afkets-schade van 0,055 HP uit de oude engine.
- De vroegere V10.4 bescherming tegen brandende/uitgeschakelde voertuigen blijft behouden. De campagne behoudt 30 maps met de vijfseconden-afronding.
- Automatische upgrades blijven werken zonder winkelkeuzes. Op het startmenu kun je iedere map meteen testen.

