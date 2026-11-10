# SEM in Cantique V13 — Nierstraal 3000

Nieuwe, zelfstandige V13-pagina: [SEM in Cantique V13](https://maartenhaase.github.io/Defend_game/cantique-adventure/sem-v13/)

**Toegangscode:** `1995` (een client-side code is geen privacybeveiliging van de openbare repository).

## Technisch
- `index.html` gebruikt de bestaande 15 fotogebaseerde brondelen in `../sem-v11/data/` en voegt V13-modules toe. De V12-locatie blijft onaangetast.
- `v13-story.js`: sciencefictionhoofdmissie, Coen, Borre, dialogen, sidequests, prijzen en kennisflags.
- `v13-art.js`: 30 apart gegenereerde **rastergetekende** objectafbeeldingen (geen volledig fotorealistische fotosprites), twee getextureerde achtergronden, 48 zichtbare deuren en animatie-effecten.
- `v13-finish.js`: questlog zonder spoilers, herkenningslabels voor portretten, save/slotlogica, mobiele CSS en ingebouwde QA.
- Opslag is gescheiden onder sleutel `cantique_sem_game_v13`. V12-opslag blijft ongewijzigd.

## Verhaal
Een ongevaarlijke, fictieve sciencefictionnier wordt met de Nierstraal 3000 geteleporteerd. Borre neemt hem mee, waarna chocolade, energiekristallen, het schoonmaken van de wc en de collega’s nodig zijn voor de finale. Geen realistische operatie of zelfverwonding.

## Grenzen
De nieuwe wc en het berghok zijn **programmatig getextureerde illustraties**, geen foto’s. De overige ruimtes hergebruiken de eerdere fotobronnen. De mini-cutscenes gebruiken geprogrammeerde animatie-effecten; nog niet alle personages hebben een eigen uitgewerkte frame-voor-frame-animatie. De portretten met expliciete bestandslabels zijn gekoppeld; voor **Erik en Marthijn** is geen bevestigd portretbestand gevonden in de bronlijst en wordt een neutraal silhouet getoond in plaats van het verkeerde gezicht.

De code is met syntax-, mockruntime- en questsysteemtests gecontroleerd, **niet** via een echte Safari-/iPhone-gebruikstest.
