# V9.9.45 — Morale, upgrades, radio en nieuwe infanterierollen

- Granaten hebben meteen drie slots, elk met eigen 6 seconden recharge op niveau 0 en 2 seconden op niveau 20. De schade gaat van impact 22 / blast 14 / radius 12 naar impact 146 / blast 164 / radius 55. De granaat landt, heeft een zichtbare lont (0,95 → 0,45 seconden) en ontploft dan.
- Het startwapen is teruggebracht van 12 naar 6,4 schade en van 30% naar 12% penetratiekans; 20 range-upgrades maken 12 → 82% penetratie en verhogen de kogelsnelheid met 105 per stap. Rate-upgrades leveren +6 kogels per magazijn per stap, sneller richten/schieten en herladen van 2,50 → 0,85 seconden. Bunker armor: 23 extra HP per stap en maximaal 64% minder schade.
- Vier doden in vijf seconden triggert een moraalbreuk: 50–90% duikt onmiddellijk prone; iedere nieuwe kill verlengt de fase. Na zes seconden zonder slachtoffers staan soldaten geleidelijk op en bewegen voorzichtig naar dekking. De bunker geraakt? Dan rennen vijanden kort harder. Zonder treffer bewegen ze terughoudend.
- Echte roluitrusting op de sprites, geen zwevende hoofdicoontjes: gele granaatbuis, schep, duidelijke officierspet, grote radioantenne en handset, MP40/STEN bij stormtroepen en tripod bij zware MG.
- Storminfanterie verschijnt soms in trio's. MG-commando's bevatten vijf soldaten: zware MG, assistent, twee schutters met geweer en één stormschutter; de zware MG heeft twee seconden om op te stellen.
- Officier geeft bondgenoten binnen 92 pixels 24% schadereductie en 22% sterkere kogelschade.
- Radiooperator heeft vijf seconden uitzending met herhaald radiogekraak. Daarna komt een willekeurig versterkingsteam vanuit oost of west: stormgroep, MG, riflemen, genie/medic, commando of verkenning; maximaal 54 levende vijanden en minstens 12 seconden tussen normale oproepen. Het oude prioriteits-radioevent gebruikt nu ook een willekeurig team.
- Brandende voertuigen verliezen direct de boordschutter en stoppen, met iets eerdere ontsteking en zware explosies. De drie V9.9.43-brandscenario's blijven.
- Dekking en prone-trefkans (2–15%, afhankelijk van RATE/AIM) uit V9.9.44 blijven intact.

Testscript: balance_regression.cjs controleert statistieken, startuitrusting, rollen, voertuigbrand en groepsmoraal met de bestaande simulatieharnas.
