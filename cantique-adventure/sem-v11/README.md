# SEM in Cantique — V12 (mobiel)

Point-and-click kantoorslasher voor intern gebruik. Alle personages, dialogen en gruwelscènes zijn **fictief**. Dit project bouwt voort op V11: de oorspronkelijke 15 delen in `data/` blijven intact.

## Spelen
- Open `cantique-adventure/sem-v11/` via de GitHub Pages-website.
- Voer toegangscode **1995** in.
- Klik/tik op de vloer om Sem te laten lopen, op voorwerpen voor interactie.
- Gebruik de deurknoppen onder het speelveld en **Plattegrond** om door logisch gekoppelde ruimtes te reizen.

## V12 wijzigingen
- Nieuwe **heren-wc** met Coen; zoek de **ontstopper** in de nieuwe schoonmaakopslag, speel de pomp-puzzel en verdien **€10** (eenmalig).
- Nieuwe **opslagkamer** met decor en bruikbare objecten.
- Nieuwe donkere, fictieve **nierslasher-scène**: praat met Jansje in de vouwhoek, vind de rode koelbox en onderzoek de snijtafel.
- **30 afzonderlijke SVG-objectsprites** getekend tijdens het spel, met klikbare hotspots en inventarisillustraties.
- **Dure telelens** en **wit poeder** zijn zichtbaar op hun locaties.
- Extra ruwe, grappige dialogen met collega’s, waarbij hun bestaande quest-opties behouden blijven.
- **19 onderling verbonden ruimtes**, met een schematische plattegrond en een aangrenzende-deuren-navigatie.
- Voortgang in nieuwe locaties wordt in de bestaande opslagstructuur bewaard.

## Bestanden
- `index.html`: toegangscode en V12-moduleloader
- `v12-core.js`: scènes, plattegrond, puzzels en horror
- `v12-items.js`: 30 illustraties en hotspots
- `v12-dialogue.js`: extra dialogen
- `v12-compat.js`: opslagcompatibiliteit en controles
- `data/`: oorspronkelijke foto's, sprites en de V11-gamecode

**Beveiligingsopmerking:** een client-side toegangscode op een publieke GitHub Pages-repository is geen echte afscherming van broncode of media. Gebruik hosting met server-side authenticatie of passende private toegang als dat vereist is.

De nieuwe wc en opslag zijn geïllustreerde spelruimtes, geen bouwkundige reconstructie. De navigatie is een logische spelindeling op basis van de bekende ruimtes, geen opgemeten plattegrond.
