# Just Bunker Defense V10 — The Long Road (30 maps)

**iPhone play:** https://maartenhaase.github.io/Defend_game/jbd_web/v10/index.html

This is a **rebalanced progressive campaign (V10.7)** built on the full V9.9.53 Just Bunker Defense engine. The rushed 40-map Quickfire set is replaced with 30 maps; no V9 files were overwritten.

## First map: the tutorial

- **Exactly one slow, unarmed jeep** approaches the bunker. There are **no armed infantry, convoy reinforcements, aircraft or surprise waves** in this first mission. Three **unarmed** occupants flee the jeep when it is hit or stopped; they cannot fire and are not required kills.
- The starter machine gun carries **12 bullets**: **4 taps of 3 bullets** per magazine, followed by a noticeable reload.
- The separate **FLAK** button fires **a single accurately aimed shell**, with meaningful initial damage and a cooldown. Both the MG and FLAK can damage the jeep's hull until it is truly destroyed. A disabled driver is not counted as a victory.
- Enemy vehicles become stronger as the route progresses. MG and FLAK weapon upgrades must be earned by destroying parachute crates.

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



## V10.6 — destructible parachute loot boxes (replaces the free-upgrade progression)

Exactly three parachute crates appear at randomized positions/times on every map. A crate is **not a clickable shop**: it has a visible health bar and requires approximately nine successful MG hits before its reward is granted. The projectile must actually collide with the crate; a wall or other nearer target can block it. FLAK blast damage can also break crates, but must still remove their full HP. Unopened crates grant nothing. Crates are optional, and late arrivals are accelerated if the battle ends quickly, rather than forcing an empty-field wait.

**No more automatic upgrade by map number.** The MG starts with a 12-round magazine, firing 3-round salvos; the FLAK starts with one projectile. Permanent weapon and bunker bonuses can only be obtained from successfully destroyed crates and remain equipped in subsequent maps. Health repair and spawned allies are immediate, single-battle bonuses. Existing enemy variety and story route are retained.

Available randomized crate loot (18 types): Flak damage+, MG damage+, Flak splash+, bunker armor+, health replenish, MG rate-of-fire+, faster Flak reload, one extra Flak projectile (up to 5), MG spread-, Flak spread-, bullet penetration with higher projectile velocity and greater real wall pass-through chance, less MG overheat, maximum MG magazine +6 rounds, faster MG reload, increased obstacle/vehicle bullet damage, 5 elite allied soldiers, an allied armored vehicle and a single very strong MG-armed Rambo ally.

The old kill-based automatic allied reinforcement reward has also been disabled. The existing five-second burning-wreck finish and iPhone aiming controls remain. All loot is rolled and awarded only after the crate has been destroyed. The in-game results text counts how many of the three crates you actually opened.


## V10.7 — combat realism, medical rescue and all 30 map transitions

- Vehicles have **nine separate visual damage conditions**, mapping remaining HP from 100% down to a burnt-out wreck. Bullet impacts, dents, glass, local smoke, detached components, flames and a wreck finish use the existing art and particles.
- A given hostile vehicle class gets **8% more HP per subsequent map**, compounded. Light vehicles, transports, armored cars, halftracks and tanks have different protection. Machine-gun rounds are especially weak against heavy armor; explosive FLAK shots are relatively effective.
- Fuel fires at high remaining HP are suppressed. Visible local flames begin only in the late damage conditions, followed by genuine destruction and the existing **five-second burning aftermath**.
- Soldiers may be conscious and fighting, frightened/prone without firing, wounded and crawling, or irreversibly dead. Wounded enemies are not automatically revived.
- Enemy medics use the existing combat AI, only approach reachable wounded comrades, **kneel and treat for roughly 3.8 seconds**, and restore partial HP. A medic interrupted by fire or death cannot finish treating. The number of medics is capped to avoid infinite revives.
- Prone infantry retain small, separate body-part hit regions for fast MG projectiles. Frightened troops have several defensive gestures, periodically peek up, and temporarily cease fire.
- Ammunition from cooking-off vehicles uses extended ballistic arcs, gravity and swept collisions. Small moving metal shards can strike a single nearby soldier, with gravity and a damped ground bounce. Decorative shell casings remain non-damaging.
- **Existing V10.6 parachute crates and all 18 earned-only upgrades remain intact**, including Flak projectiles, splash, MG damage, bullet penetration, and allied reinforcement rewards.
- Regression checks cover the actual **map 6 → 7 → 8 → 9 transition**, nine stages, HP growth, medics and treatment interruption, prone hits, shrapnel damage, loot upgrades and desktop/iPhone-sized viewports.
- An additional accelerated 30-map simulation cleared all stages with five-second afterburn and an enabled Next Level button. This is an automated engine test and does **not** replace hands-on testing on physical devices.



## V10.7 — voertuigschade, medics, physics en levelovergangen

Deze versie behoudt het V10.6-systeem met drie parachutekisten per map en 18 verdiende beloningen. De oudere beschrijving van automatische upgrades in het historische hoofdstuk V10.5 hierboven geldt niet meer.

**Voertuigen:** de HP van hetzelfde voertuigtype stijgt per map met ongeveer 8% ten opzichte van de vorige. Lichte voertuigen, vrachtwagens, pantserwagens, halfrupsen en aanwezige tank-assets krijgen verschillende basismultipliers. MG-kogels werken minder goed tegen zwaar pantser; FLAK en explosieven zijn effectiever. De negen fases: (1) intact 100–90%, (2) kogelinslagen 90–78%, (3) deuken 78–65%, (4) kapotte ruiten 65–52%, (5) lichte rook 52–40%, (6) zware rook en onderdelenverlies 40–28%, (7) plaatselijke vlammen 28–15%, (8) ernstige brand 15–0% en (9) uitgebrand wrak bij 0%. Branden boven fase 7 worden geblokkeerd. Lokale beschadigingen, vonken, rook en wrakken gebruiken de bestaande voertuigweergave.

**Soldaten:** gezond, bang/liggend, gewond en dood zijn verschillende statussen. Een mogelijk dodelijke MG-inslag kan een nog levende maar uitgeschakelde gewonde opleveren. Die schiet niet meer, kan beperkt kruipen en heeft een medic nodig om te herstellen. De bestaande medic-AI is aangepast: hij selecteert gewonden van dezelfde factie, houdt rekening met gevaar en zichtlijnen en knielt circa 3,8 seconden naast zijn patiënt. Bij genezing krijgt de soldaat circa 55% HP terug; iedere soldaat kan maximaal eenmaal gereanimeerd worden. Sterft de medic, dan stopt de behandeling.

**Hitboxes en scherven:** liggende soldaten hebben kleine, samengestelde raakvlakken voor hoofd, romp en benen in plaats van een grote rechthoek. Bange soldaten kunnen ineenduiken met handen op het hoofd en tijdelijk ophouden met schieten. Munitie uit ontploffende voertuigen kan vijanden raken via lijnsegmentcontrole; schadelijke scherven hebben zwaartekracht, rotatie, grondbotsing en maximaal één beschadigend contact. Decoratieve hulzen blijven ongevaarlijk.

**Levelprogressie en tests:** map 6 → 7 → 8 → 9 is daadwerkelijk achter elkaar doorlopen met de bestaande aanvalsgolven, schadefuncties, drie parachutekisten en de vijf seconden durende wrakanimatie. Daarnaast zijn alle 30 mapovergangen gesimuleerd. De regressies voor voertuigfases, HP-scaling, revives, liggende MG/FLAK-doelen en scherven staan in v10_regression.cjs. iPhone- en desktopcanvas zijn in een gesimuleerde omgeving gerenderd; een fysieke browsertest en live GitHub Pages-publicatie zijn niet onafhankelijk bevestigd.


## V10.8 — dynamische upgrades tijdens ieder level

- Nieuw: **4–9 vaste upgrademomenten per map**, gekoppeld aan overgebleven vijandelijke dreiging en voertuigschade in plaats van verstreken tijd. Ook rond 70–95% verschijnen verbeteringen.
- **Gewogen categorieën:** Magazine Size 35%, Reload Speed 30%, Damage 15%, Fire Rate 10%, overige originele bonussen 10%. Bij vrije slots geldt deze verdeling; de gegarandeerde slots kunnen de feitelijke kans verhogen.
- **Garanties:** twee magazijnverbeteringen per map, één reload per map en vanaf map 4 twee reloads, zolang de betreffende bonus niet gemaximaliseerd is. Geen drie dezelfde upgrades achter elkaar.
- **Effecten:** per gekozen moment +15% magazijn, 8% kortere herlaadtijd, +8% MG-schade of +6% MG-vuursnelheid. De originele V10.7 schadebalans en 18 kistbonussen blijven bestaan; maximumwaarden voorkomen onbegrensde stapeling.
- **Veilig kiezen:** wanneer een mijlpaal wordt bereikt, pauzeert het gevecht en verschijnt de verdiende upgrade met de knop *UPGRADE PAKKEN*. Meerdere snel verdiende beloningen worden in een wachtrij bewaard. De oude vijf seconden nabrand blijven behouden.
- **Techniek:** `build_v108.cjs` injecteert `v10_8_upgrades.js` binnen de bestaande grote game-closure in de deploymentversie; het origineel `game.js` blijft ongewijzigd. `v108_regression.cjs` test de samengestelde versie en de oorspronkelijke drie parachutekisten.
