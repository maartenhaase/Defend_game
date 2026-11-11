# SEM in Cantique V13.2 — Nierstraal 3000

**Speel:** https://maartenhaase.github.io/Defend_game/cantique-adventure/sem-v13/

**Toegangscode:** `1995`. De client-side code is geen echte privacybeveiliging van de openbare repository.

## V13.2
- Nieuwe fotografische gang met vijf ruimtelijk geplaatste routes: wc, berghok, keuken, werkvloer en snijtafel.
- Fotografische wc en schoonmaakberging, met eigen klikzones en opnieuw geplaatste voorwerpen.
- De getekende deur-overlays zijn verwijderd. Bestaande gefotografeerde uitgangen blijven behouden; de berging heeft een duidelijke terugknop aan de ingangzijde.
- Fotografische, gelabelde bestaande personagesprites in de belangrijkste cutscenes en bij de finale. De oudere cutouts worden bij het laden opgeschoond.
- Erik is gekoppeld aan het expliciet gelabelde bestaande personagebestand. Voor Marthijn is geen bevestigd portretbestand gevonden.
- De Carmen-code wordt getoond met bestaande knipoogbeelden, zonder het antwoord vooraf in tekst te tonen.
- De ongevaarlijke, fictieve sciencefictionhoofdmissie blijft: Nierstraal 3000, Borre, schoonmaak, collega's verzamelen, finale en de bestaande geldopdrachten.
- Afzonderlijke opslag onder `cantique_sem_game_v13`; V12 blijft behouden.

## Techniek
`index.html` laadt de 15 bestaande V11-brondelen en V12-core/compat, daarna `v13-story.js`, `hall-photo.js`, `v13-art.js` en `v13-finish.js`. De wc en berging staan als lokale WebP-bestanden in `assets/`.

## Controle en grenzen
De JavaScript-modules zijn syntactisch gecontroleerd; een DOM-mock laadde alle 14 scripts, bevestigde 19 bereikbare ruimtes, 30 geregistreerde rasterprops en geen eenrichtingsfouten. De gevonden ontbrekende uitgang bij Marthijn is gecorrigeerd door zijn bestaande uitgang naar de werkvloer te leiden. Niet alle bestaande personages hebben nieuw getekende, anatomisch uitgewerkte frame-voor-frame-animaties; sommige blijven fotografische cutouts met geprogrammeerde beweging. Een echte iPhone/Safari-speeltest en visuele controle van elk afzonderlijk shot blijven nodig. 
