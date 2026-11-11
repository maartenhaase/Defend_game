# SEM in Cantique V14 — De lensmok van Rob

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
