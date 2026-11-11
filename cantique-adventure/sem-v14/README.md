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
