# SEM in Cantique V14.3 — De lensmok van Rob

**Spelen (mobiel of desktop):** https://maartenhaase.github.io/Defend_game/cantique-adventure/sem-v14/

**Toegangscode:** `1995`. Deze client-side code beveiligt de publieke repository niet werkelijk.

## Nieuw in V14
- **Mokpuzzel bij Marloes:** Een zwarte mok in de vorm van een telelens staat als apart interactief voorwerpsprite op het bureau in de Borre-/Marloeskamer.
- **Afleiden zonder chocolade:** Op Maartens bureau liggen hondenkoekjes, niet chocolade. Geef ze aan Borre; Marloes draait zich om. De hond is in het zicht op zijn eigen sprite aan te klikken.
- **Steelbaar voorwerp:** Alleen tijdens de afleiding kun je de lensmok meenemen. Hij komt in de inventaris.
- **Verkooppoging:** Probeer hem via Sems laptop te verkopen. Een koper ontdekt dat hij geen echte telelens is, biedt €0 en ziet af van de koop; de mok blijft in je inventaris.
- **Emotionele consequentie:** Bij ontdekking huilt Marloes omdat de mok vroeger van haar broer Rob was. Voor haar bewegende huilanimatie worden afzonderlijke blauwe traansprites boven haar bestaande personagesprite getekend. Er is ook een fotografische cutscene met animatie.
- **Troosten:** Het nieuwe aanklikbare koffiezetapparaat in de keuken maakt een kopje koffie met inventarissprite. Sem kan de koffie aan Marloes geven en de mok terugbrengen.
- **Coens wc:** Onafhankelijke transparante raster-sprites voor zichtbare bruine hopen, een vieze plas, groene dampwolken en borrelende effecten. Deze bewegen terwijl het toilet verstopt is en verdwijnen na het ontstoppen.
- De game gebruikt nog steeds de bestaande foto's, ruimtes, Nierstraal, dialogen en inventaris. Geen chocolade aan Borre.
- **Voortgang:** Bij eerste openen wordt, indien aanwezig, de opgeslagen V13-voortgang gekopieerd naar een aparte V14-opslag (`cantique_sem_game_v14`); V13 blijft intact.

## Technische opbouw
De V14-startpagina voegt, na de bestaande V11- en V13-modules, `v14-extras.js` toe. `v14-art-base.js` is een aangepaste kopie van V13-art, uitsluitend om de foto-assets via `../sem-v13/assets/` correct te laden.

## Controle
JavaScript syntactisch gecontroleerd. De nieuwe puzzel is met een DOM/canvas-mock op itemregistratie, eerst afleiden, oppakken, verkooppoging (€0 zonder geldtoevoeging), koffiezetapparaat, beide wc-staten en aanwezigheid van alle traan- en wc-sprites gecontroleerd. **Niet** geverifieerd in een echte iPhone/Safari-sessie of als live gedeployde GitHub Pages-pagina. De sprites zijn transparante in-game canvas-tekeningen, niet extern gefotografeerde objecten.


## V14.3 — Fotorealistische correctie van Marloes’ werkplek (11 november 2026)

- De oude samengestelde achtergrond met Marloes klein **onder** haar bureau is in de game vervangen door `assets/marloes-desk.webp`. Marloes zit nu zichtbaar **aan** haar bureau; alleen Borre bevindt zich eronder.
- **Tweede echte speelruimte:** `underdesk`, met een eigen fotorealistische achtergrond (`assets/under-desk.webp`), eigen Borre-hotspot en een werkende terugweg naar Marloes’ bureau. De bestaande routes naar werkvloer en vouwruimte blijven behouden.
- In de bureauscène is de lensmok op een zichtbare plaats op het bureaublad onder de monitor gezet. De hotspot en het getekende voorwerp delen exact dezelfde coördinaten.
- **Aanklikbug opgelost:** V13 onderschepte nieuwe V14-inventarisvoorwerpen met een onjuist `v13_item_`-prefix en maakte ze daardoor niet klikbaar. V14.3 gebruikt het juiste `v14_item_`-prefix. Dit herstelt ook de hondenkoekjes op Maartens tafel.
- Voor de Nierstraal-verhaallijn ligt de beschadigde energienier voortaan bij Borre in de onder-bureauscène. De hoofdmissie blijft daardoor bereikbaar.
- De nieuwe achtergrond heeft geen leesbare schermaanduidingen; de werkplek is opgeruimd. De oude dubbele personen- en honden-cutouts zijn in deze twee scènes uitgeschakeld.
- De nieuwe scène wordt ook verwerkt in de locatiegrafiek, de navigatiehotspots, de diagnostiek en het opslaan van voortgang (veilige terugval naar `borreoffice` bij een opgeslagen `underdesk`-positie).
- Aan de loader toegevoegd als laatste script: `v14-office-fix.js?v=143`. Eerdere V14-save blijft bestaan.

**Speel:** https://maartenhaase.github.io/Defend_game/cantique-adventure/sem-v14/?v=143

**Technische controle:** de JavaScript-module is syntactisch gecontroleerd en met een DOM/canvas-mock getest op hoofd- en onder-bureauscène, object-coördinaten, lensmokhit, Borre-hit, routegrafiek, sprite-rendering zonder oude overlays en veilige locatieopslag. Een echte iPhone/Safari-speeltest en daadwerkelijke GitHub Pages-beeldcontrole zijn nog niet uitgevoerd.


## V14.4 — Sounddesign uitsluitend met echte geluidsopnames (11 november 2026)

De bestaande gameplay, fotorealistische scènes, inventaris, saves en toegangscode zijn ongewijzigd. De uitbreiding staat in \`v14-real-sound.js\`, dat NA de V14.3-bureaucorrectie wordt geladen.

- **Drukkerij, snijtafel en machines**: echte industriële werkplaatsopname met machinegedreun en een extra echte mechanische projectoropname als roterend motorgeluid. **Let op**: dit is een geluidscompositie voor de sfeer van een drukkerij, geen opname van de Cantique-drukpers zelf.
- **Kantoorruimtes**: zachte echte computer-ventilatorgeluiden en toetsenbordgetik; onder het bureau vooral ventilatorgeruis.
- **Keuken**: koelkastgeluid en een koffiegrinder wanneer je koffie zet.
- **Deuren en navigatie**: afzonderlijke deur- en schuifdeur-opnames, bij de onder-bureauroute een zacht ritselgeluid.
- **Coens wc**: opgenomen geborrel en winderigheid bij het binnengaan en praten, af en toe tijdens de verstopping; doorspoelgeluid bij interactie met een schoongemaakt toilet.
- **Handelingen**: echte papier-, laatje-, nietmachine-, muisklik-, typ-, ritsel- en ritsgeluiden passend bij de voorwerpen.
- **Borre**: spaarzaam hondengeluid bij interactie.
- **Nieuw:** de knop **🔉 Sfeer** met twee afzonderlijke schuifregelaars (achtergrond / handelingen); instellingen worden lokaal bewaard. Het bestaande geluid-aan/uit blijft leidend. Browsers spelen pas geluid nadat de speler zelf op Speel of Geluid tikt.

**Bronnen/licentie:** opnamen worden extern opgehaald van [SFX Jar](https://sfxjar.com/free-to-use/) (BigSoundBank en Kenney, hier geselecteerde bestanden gemarkeerd **CC0 1.0**) en [Mixkit Free Sound Effects](https://mixkit.co/free-sound-effects/) ([Mixkit SFX Free License](https://mixkit.co/license/modal/sfxFree/)). De bronlocaties en gebruikte sample-URL's staan als overzicht in \`window.CANTIQUE_AUDIO.sources\` in de spelconsole. Omdat de MP3's vanaf de bronwebsites worden gestreamd, **is internet noodzakelijk**, en bestanden kunnen niet werken als de externe site hotlinking beperkt of de URL verandert. Er is geen fysieke audio bundel in de repository opgeslagen.

**Tests:** de nieuwe JS-module en integratie zijn syntactisch gecontroleerd. Echte geluidsweergave, streaming, geluidsmix en iPhone/Safari moeten nog live getest worden. Het spel bevat bewust geen nieuw geprogrammeerde synth-/beepvervangers voor de geselecteerde geluiden.


## V14.5 — Fotorealistische Cantique-hubs en losse Marloes (11 november 2026)

**Actieve game:** https://maartenhaase.github.io/Defend_game/cantique-adventure/sem-v14/?v=1452

**Code:** \`v145-world.js\` (9 nieuwe uniek gefotografeerde ruimtes, graph, hotspots, 1-stapsplattegrond) en \`v145-characters.js\` (losse Marloes-sprite, emotie-overlays, wc-papier/vloer-sprites). Beide zijn na V14.4 opgenomen in \`index.html\`. Oude onderdelen blijven in dezelfde volgorde staan.

### Nieuw toegewezen foto-assets

| In-game kamer | Uniek beeld | Functie |
| --- | --- | --- |
| reception_right | v145_reception_right.webp | Vanuit receptie rechts door glazen deur naar meeting |
| central_hub | v145_central_hub.webp | Centrale werkvloer/trap, naar keuken/kantine/drukkerij |
| canteen_hub | v145_canteen_hub.webp | Groene stoelen, lange tafel |
| packing_workroom | v145_packing_workroom.webp | Aparte werkplek/inpakruimte |
| storage_hub | v145_storage_hub.webp | Stellingen en magazijn |
| print | v145_press_hub.webp | Bestaande printmissie op nieuwe drukkerijfoto |
| press_rear | v145_press_rear.webp | Tweede werkelijk andere kijkrichting drukkerij |
| breakroom | v145_kitchen_hub.webp | Bestaande keuken met koffie- en waterinteracties |
| office | oorspronkelijke bg_office | **Oorspronkelijke gezamenlijke werkvloer met Johanneke, Marloes en Sem**. Klik op hun werkplekken om in te zoomen. | 
| johanneke_desk | close-up/crop van bg_office | Inzoomen op Johanneke zonder dezelfde foto als tweede losse kamer te hergebruiken. |
| shared_office | v145_shared_office.webp | Aparte nieuwe kantoorruimte tegenover de WC. |
| borreoffice | v145_marloes_desk_clean.webp | **Nieuwe personenvrije** bureaufoto, met losse NPC en afzonderlijke lensmok |

**Borre** blijft alleen in de aparte onder-bureau-scène (\`underdesk\`). De foto \`marloes-desk.webp\` uit V14.3 blijft in de repo voor eerdere versies, maar V14.5 schildert in de live gameplay de nieuwe lege achtergrond eroverheen. Het losse \`v145_marloes_sprite.webp\` wordt getekend, en hoofdbeweging, verbazing, wenkbrauwen, mond en tranen reageren op de puzzelstatus. Dit is één geanimeerde basisafbeelding met live emotie-overlays, **nog geen volwaardig uitgewerkte frame-by-frame full-body animatiesheet**.

De nieuwe persoonsvrije bureaufoto is momenteel geoptimaliseerd tot **384 × 288 pixels** om de upload in GitHub compact te houden. Hij verschijnt vergroot in de 960 × 720-scène; een hogere resolutie is een mogelijke kwaliteitsverbetering.

### Herstel van de oorspronkelijke kantoorindeling

Vanaf `reception` ga je weer rechtstreeks naar de ORIGINELE `office`-werkvloer met Johanneke, Marloes en de doorkijk naar Sems bureau. De klikzones `office_jo`, `office_mar` en `office_sem` leiden naar respectievelijk `johanneke_desk`, `borreoffice` en `sem`. Elk heeft een logische terugweg (uitzoomen). De nieuwe panorama-foto `v145_shared_office.webp` staat uitsluitend in **`shared_office` tegenover de WC** en vervangt het oude `office`-beeld niet.

De originele V12-verbindingen zijn in de graaf hersteld, inclusief receptie ↔ werkvloer, werkvloer ↔ drukkerij, gang ↔ vergaderruimte en de kantooruitgangen van Maarten en Marthijn. Het automatische auditrapport kan nu ook alle verplichte oude verbindingen controleren via `window.CANTIQUE_V13.worldAudit().missingLegacyLinks`.

### Navigatie

- Alle 26 scènes hebben verbindingen via één bijgewerkte \`CANTIQUE_V12.graph\`.
- De kaartknop **🧭 Routes** geeft uitsluitend DIRECT aangrenzende ruimtes, nooit teleportatie naar afgesloten plekken.
- Nieuw gereconstrueerde route: receptie → centrale werkvloer → kantinehoek → inpakwerkplek → magazijn → drukkerij → achterzijde printers.
- Receptie rechts → glazen deur → vergaderruimte.
- Werkvloer → keuken; gang → gezamenlijk kantoor tegenover WC; kantoor → Marloes; bureau → Borre.
- De bestaande verhaalobjecten en hotspots blijven aanwezig en krijgen voorrang boven overlappende deuropeningen.
- De routeknop is gekoppeld aan een valide loopdoel in elke kamer.

### Testinformatie en beperkingen

**Getest met programmatische DOM/canvas-mocks:** JavaScript-syntaxis, 26 kamers, wederkerige verbindingen, bereikbaarheid vanaf receptie, dubbele nieuwe fotobestanden, registratie van vrijstaande Marloes-sprite, aanklikbare routekaart, wc-sprites en karakterweergave in verschillende missiestaten.

**Nog niet live getest:** daadwerkelijke klikzones onder alle camera/zoominstellingen, beeldkwaliteit/schaal op echte iPhone Safari en Android, streaming van externe geluidsfragmenten, volledig van begin tot eind doorspelen en frame-by-frame animaties van alle NPC's. Een syntactische of logische test is geen bewijs van een volledige iPhone-playtest. De bovengenoemde foto-/spelbestanden zijn wél in de GitHub-hoofdbranch opgenomen.
