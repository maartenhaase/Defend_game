const CASES=[
{
 id:'demo',demo:true,title:'DEMO — De rode map',type:'Diefstal op kantoor',
 intro:'Na de middagpauze blijkt een vertrouwelijke rode map uit een afgesloten kast verdwenen. Jullie vier waren de enige medewerkers die nog op kantoor waren.',
 chars:[
  {name:'Eva',desc:'boekhouder',guilty:true,facts:['Tijdens de pauze was je alleen bij de kopieerruimte.','Je kent de code van de archiefkast.','Jouw verhaal: na de pauze ging je meteen naar huis en niet naar het archief.']},
  {name:'Bram',desc:'IT-medewerker',facts:['Tijdens de pauze was je beneden bij de receptie.','Na de pauze zag je Noor daar ook nog.','Je kent de code van de archiefkast niet.']},
  {name:'Noor',desc:'stagiair',facts:['Na de pauze bracht je David koffie.','Je zag Eva richting het archief lopen.','Daarna bleef je beneden bij de receptie.']},
  {name:'David',desc:'manager',facts:['Tijdens de pauze bleef je in je kantoor.','Alleen jij en Eva kennen de kastcode.','Later die middag ontdekte jij dat de map weg was.']}
 ],
 clues:['De archiefkast is met de juiste code geopend.','De kast is pas ná de middagpauze geopend.','De camera toont Eva die uit de archiefgang komt.'],
 tips:['Vertel alleen de drie dingen die je hebt onthouden. Vraag elkaar vooral: waar was je en wat zag je?','Kijk welk verhaal door het nieuwe bewijs minder geloofwaardig wordt.','Nu botst één verhaal duidelijk met het bewijs. Kies straks wie volgens jullie liegt.'],
 solution:'Eva stal de map. Ze kende de code, zei dat ze meteen naar huis ging, maar werd na de pauze bij het archief gezien.'
},
{
 id:'hotel',title:'Kamer 312',type:'Gestolen horloge',
 intro:'Tijdens het diner in een klein hotel verdwijnt een kostbaar horloge uit kamer 312. Er zijn geen braaksporen.',
 chars:[
  {name:'Lotte',desc:'receptionist',facts:['Tijdens het diner bleef je achter de receptie.','Je gaf één reservesleutel van kamer 312 aan de schoonmaker.','Je zag de chauffeur buiten roken.']},
  {name:'Samir',desc:'schoonmaker',guilty:true,facts:['Je had tijdens het diner de reservesleutel van kamer 312.','Jouw verhaal: je maakte alleen kamer 310 schoon.','Na het diner leverde je de sleutel weer in.']},
  {name:'Fleur',desc:'hotelgast',facts:['Op weg naar het restaurant liep je langs kamer 312.','Daar stond een schoonmaakkar naast de deur.','Daarna bleef je in het restaurant.']},
  {name:'Koen',desc:'chauffeur',facts:['Tijdens het hoofdgerecht stond je buiten te roken.','Lotte kon je vanuit de receptie zien.','Je bent die avond niet op de derde verdieping geweest.']}
 ],
 clues:['Kamer 312 is met een geldige hotelsleutel geopend.','De gebruikte sleutel was de reservesleutel van kamer 312.','Die reservesleutel was op dat moment bij Samir.'],
 solution:'Samir stal het horloge. Hij had de reservesleutel van kamer 312, terwijl hij beweerde alleen kamer 310 te hebben schoongemaakt.'
},
{
 id:'wedding',title:'De verdwenen envelop',type:'Diefstal op een bruiloft',
 intro:'Na het diner blijkt een dikke envelop met contant geld uit de cadeaukist verdwenen. De kist stond in een zijzaal.',
 chars:[
  {name:'Mila',desc:'ceremoniemeester',facts:['Voor het diner sloot je de hoofddeur van de zijzaal.','De sleutel hield je daarna zelf bij je.','Tijdens de speeches stond je op het podium.']},
  {name:'Ruben',desc:'neef van de bruidegom',guilty:true,facts:['Je wist dat er veel geld in de cadeaukist zat.','Jouw verhaal: tijdens de speeches was je buiten aan het bellen.','Je kent een tweede deur naar de zijzaal via de keuken.']},
  {name:'Sanne',desc:'cateraar',facts:['Tijdens de speeches werkte je in de keuken.','Je zag Ruben door de keuken richting zijzaal lopen.','De keukendeur naar de zijzaal stond toen open.']},
  {name:'Teun',desc:'DJ',facts:['Tijdens de speeches stond je achter je draaitafel.','Je zag Mila op het podium staan.','Ruben zag je pas na de speeches weer buiten.']}
 ],
 clues:['De afgesloten hoofddeur van de zijzaal is niet gebruikt.','De zijzaal heeft ook een deur naar de keuken.','Sanne zag Ruben tijdens de speeches via die keuken lopen.'],
 solution:'Ruben pakte de envelop via de keukendeur. Zijn verhaal dat hij de hele tijd buiten belde klopt niet.'
},
{
 id:'gallery',title:'Het lege schilderij',type:'Kunstdiefstal',
 intro:'Na sluiting blijkt een klein schilderij vervangen door een goedkope kopie. Jullie vier waren de laatste aanwezigen.',
 chars:[
  {name:'Iris',desc:'galeriehouder',facts:['Na sluiting bleef je in je kantoor bellen.','Je kwam niet meer in de expositiezaal.','Je bezit wel de sleutel van de opslag.']},
  {name:'Pieter',desc:'restaurator',guilty:true,facts:['Die middag werkte je aan een lijst in de opslag.','Jouw verhaal: direct na sluiting ben je vertrokken.','Je weet precies hoe het schilderij uit de lijst kan.']},
  {name:'Nadia',desc:'beveiliger',facts:['Kort na sluiting controleerde je de zaal.','Toen hing het echte schilderij er nog.','Later zag je Pieter nog door de achtergang lopen.']},
  {name:'Joost',desc:'bezorger',facts:['Na sluiting leverde je dozen bij de achterdeur.','Nadia nam de dozen van je aan.','Daarna vertrok je meteen.']}
 ],
 clues:['Kort na sluiting hing het echte schilderij er nog.','Na de bezorging is de achterdeur niet meer gebruikt.','Pieter was nog binnen terwijl hij zei dat hij al vertrokken was.'],
 solution:'Pieter verwisselde het schilderij. Het werk hing er na sluiting nog en Pieter bleek toen nog binnen te zijn.'
},
{
 id:'laptop',title:'Het gelekte ontwerp',type:'Bedrijfsspionage',
 intro:'Een geheim productontwerp verschijnt bij een concurrent. Het bestand is na een vergadering vanaf kantoor gekopieerd.',
 chars:[
  {name:'Aisha',desc:'projectleider',facts:['Tot het einde van de vergadering zat je met collega’s in de vergaderzaal.','Je laptop bleef daar op tafel.','Daarna ruimde je samen met anderen op.']},
  {name:'Daan',desc:'ontwikkelaar',facts:['Na de vergadering werkte je nog even in de open werkruimte.','Je zag Hugo bij de printer.','Je hebt geen toegang tot de geheime projectmap.']},
  {name:'Hugo',desc:'salesmanager',guilty:true,facts:['Je hebt toegang tot de geheime projectmap.','Jouw verhaal: je vertrok meteen na de vergadering.','Je kent het wachtwoord van de gedeelde presentatielaptop.']},
  {name:'Leila',desc:'office manager',facts:['Je sloot later het kantoor af.','Je zag Daan eerder vertrekken.','Je zag Hugo daarna nog bij de lift staan.']}
 ],
 clues:['Het bestand is pas ná de vergadering gekopieerd.','De kopie kwam van de gedeelde presentatielaptop.','Hugo was toen nog in het gebouw.'],
 solution:'Hugo kopieerde het ontwerp. Hij kende het wachtwoord, had toegang tot het bestand en loog over zijn vertrek.'
},
{
 id:'restaurant',title:'Het verkeerde glas',type:'Vergiftiging tijdens diner',
 intro:'Tijdens een besloten diner wordt één gast onwel door iets dat in zijn drankje zat. Alleen jullie vier kwamen bij de tafel.',
 chars:[
  {name:'Elise',desc:'gastvrouw',facts:['Tijdens het diner zat je bijna steeds aan tafel.','Alleen voor de speech stond je even op.','Je raakte geen drankjes van anderen aan.']},
  {name:'Marco',desc:'ober',facts:['Voor het diner schonk je alle glazen in.','Daarna bleef de fles op de serveertafel.','Tijdens de speech was je in de keuken.']},
  {name:'Vera',desc:'zakenpartner',guilty:true,facts:['Je zat naast het slachtoffer.','Jouw verhaal: je bent tijdens het diner niet van je stoel geweest.','Je wist precies welk glas van het slachtoffer was.']},
  {name:'Niels',desc:'kok',facts:['Tijdens het diner bleef je in de keuken.','Marco was tijdens de speech bij jou.','Vlak vóór de speech zag je Vera bij de serveertafel.']}
 ],
 clues:['Alleen het glas van het slachtoffer bevatte de vreemde stof.','Marco was op het belangrijke moment in de keuken.','Vera werd bij de serveertafel gezien terwijl zij zegt dat ze bleef zitten.'],
 solution:'Vera manipuleerde het glas. Haar verhaal dat ze haar stoel niet verliet klopt niet.'
},
{
 id:'train',title:'De nachttrein',type:'Gestolen portefeuille',
 intro:'In een nachttrein verdwijnt een portefeuille uit een afgesloten slaapcoupé terwijl de eigenaar in de restauratiewagen zit.',
 chars:[
  {name:'Omar',desc:'conducteur',facts:['Je controleerde die avond kaartjes in een andere wagon.','Daarna bleef je voorin de trein.','Gebruik van jouw hoofdsleutel wordt automatisch geregistreerd.']},
  {name:'Julie',desc:'medereiziger',guilty:true,facts:['Je coupé ligt naast die van het slachtoffer.','Jouw verhaal: je sliep bijna de hele avond.','Je had eerder gezien waar het slachtoffer zijn sleutel bewaarde.']},
  {name:'Boris',desc:'reiziger',facts:['Je zat die avond in de restauratiewagen.','Het slachtoffer zat daar bij jou.','Julie kwam pas later even binnen voor water.']},
  {name:'Hanna',desc:'treinmedewerker',facts:['Je werkte de hele avond achter de bar.','Je zag Boris en het slachtoffer daar lange tijd zitten.','Julie kwam pas later naar de restauratiewagen.']}
 ],
 clues:['De hoofdsleutel van de conducteur is niet gebruikt.','De slaapcoupé is geopend met de eigen sleutel van het slachtoffer.','Julie kende de verstopplek van die sleutel en was vóór haar bezoek aan de restauratiewagen bij de coupés.'],
 solution:'Julie gebruikte de sleutel van het slachtoffer en stal de portefeuille voordat ze later naar de restauratiewagen kwam.'
},
{
 id:'museum',title:'De saffieren broche',type:'Museumdiefstal',
 intro:'Tijdens een besloten rondleiding verdwijnt een historische broche uit een vitrine. Het alarm ging niet af.',
 chars:[
  {name:'Karel',desc:'conservator',facts:['Voor de rondleiding controleerde je de vitrine.','De broche lag toen nog op zijn plek.','Tijdens de rondleiding was je met de groep in een andere zaal.']},
  {name:'Yara',desc:'technicus',guilty:true,facts:['Je kent de servicestand van het alarm.','Jouw verhaal: tijdens de rondleiding werkte je beneden in de kelder.','Je had die dag toegang tot de vitrine.']},
  {name:'Finn',desc:'fotograaf',facts:['Aan het begin van de rondleiding fotografeerde je de broche nog.','Later liep je terug naar dezelfde zaal.','Toen zag je Yara daar vandaan komen.']},
  {name:'Maaike',desc:'gids',facts:['Tijdens de rondleiding bleef je bij de groep.','Karel stond een groot deel van de tijd naast je.','Je kwam pas na afloop terug bij de vitrine.']}
 ],
 clues:['Aan het begin van de rondleiding lag de broche nog in de vitrine.','De vitrine is tijdens de rondleiding via de servicestand geopend.','Finn zag Yara uit die zaal komen.'],
 solution:'Yara nam de broche via de servicestand. Haar verhaal dat ze in de kelder was klopt niet.'
},
{
 id:'camping',title:'De lege geldkist',type:'Diefstal op een camping',
 intro:'Na de avondactiviteit blijkt de kassakist van de receptie leeg. Er mist €1.800.',
 chars:[
  {name:'Sofie',desc:'receptionist',facts:['Vóór de bingo telde je het geld en sloot je de kist.','Daarna nam je de gewone sleutel mee.','Tijdens de bingo stond je naast het podium.']},
  {name:'Rik',desc:'animatiemedewerker',facts:['Je presenteerde de bingo.','Sofie stond de hele bingo naast het podium.','Je verliet de zaal niet.']},
  {name:'Dennis',desc:'technische dienst',guilty:true,facts:['Je hebt een reservesleutel van de receptie.','Jouw verhaal: tijdens de bingo repareerde je een doucheblok.','Je werkte daar alleen.']},
  {name:'Anouk',desc:'campinggast',facts:['Tijdens de bingo liep je even langs de receptie.','Je zag Dennis daar naar buiten komen.','Daarna ging je terug naar de bingo.']}
 ],
 clues:['De kassakist is niet geforceerd.','De receptie is tijdens de bingo met een reservesleutel geopend.','Anouk zag Dennis toen uit de receptie komen.'],
 solution:'Dennis stal het geld. Hij had de reservesleutel en werd bij de receptie gezien terwijl hij zei bij het doucheblok te zijn.'
},
{
 id:'villa',title:'Dood in de bibliotheek',type:'Moordmysterie',
 intro:'Tijdens een familiediner wordt de eigenaar van een villa dood gevonden in de bibliotheek. Jullie vier waren als laatsten nog in huis.',
 chars:[
  {name:'Anna',desc:'dochter',facts:['Na het diner zat je met gasten in de salon.','Je had eerder die dag ruzie met je vader.','Je bent die avond niet in de bibliotheek geweest.']},
  {name:'Robert',desc:'zakenpartner',guilty:true,facts:['Na het diner sprak je het slachtoffer nog even alleen.','Jouw verhaal: direct na het dessert ben je naar huis gereden.','Je jas hing nog in de hal.']},
  {name:'Clara',desc:'huishoudster',facts:['Na het dessert ruimde je de eetkamer op.','Toen stond Roberts auto nog op de oprit.','Later hoorde je de bibliotheekdeur dichtvallen.']},
  {name:'Mees',desc:'familievriend',facts:['Na het diner zat je bij Anna in de salon.','Later zag je Robert zijn jas uit de hal pakken.','Pas daarna hoorde je zijn auto vertrekken.']}
 ],
 clues:['Het slachtoffer leefde nog na het dessert.','Roberts auto stond daarna nog bij de villa.','Robert pakte zijn jas pas later en vertrok toen pas.'],
 solution:'Robert is de dader. Zijn verhaal dat hij direct na het dessert vertrok wordt door meerdere mensen tegengesproken.'
},
{
 id:'archive',title:'Het verdwenen testament',type:'Documentdiefstal',
 intro:'Een origineel testament verdwijnt uit een notariskantoor. De lege envelop ligt nog in de kluis.',
 chars:[
  {name:'Marit',desc:'notaris',facts:['Na de lunch opende je de kluis voor een ander dossier.','Het testament lag toen nog in de kluis.','Daarna sloot je de kluis weer.']},
  {name:'Jeroen',desc:'klerk',guilty:true,facts:['Je kent de tweede kluiscode.','Jouw verhaal: de hele middag was je bij de rechtbank.','Je telefoon liet je op kantoor liggen.']},
  {name:'Lina',desc:'receptionist',facts:['De hele middag zat je bij de entree.','Na de lunch zag je Jeroen uit de archiefgang komen.','Hij verliet het kantoor pas later.']},
  {name:'Bas',desc:'cliënt',facts:['Die middag wachtte je in de wachtruimte.','Lina bleef de hele tijd bij de receptie.','Je hoorde vanuit de archiefgang het piepje van de kluis.']}
 ],
 clues:['De kluis is na de lunch met de tweede code geopend.','Alleen Marit en Jeroen kennen die tweede code.','Lina zag Jeroen toen uit de archiefgang komen.'],
 solution:'Jeroen nam het testament. Hij kende de tweede code en was op kantoor terwijl hij beweerde bij de rechtbank te zijn.'
},
{
 id:'ferry',title:'De verdwenen ketting',type:'Diefstal op een veerboot',
 intro:'Kort voor aankomst merkt een passagier dat een gouden ketting uit haar hut verdwenen is.',
 chars:[
  {name:'Jelle',desc:'purser',facts:['Tijdens de overtocht werkte je aan de balie.','Er is geen extra hutsleutel uitgegeven.','Je zag de eigenaar naar het zonnedek gaan.']},
  {name:'Lena',desc:'medepassagier',guilty:true,facts:['Je hut ligt tegenover die van het slachtoffer.','Jouw verhaal: je was bijna de hele overtocht op het zonnedek.','Je had eerder gezien waar de eigenaar haar sleutelkaart neerlegde.']},
  {name:'Aron',desc:'matroos',facts:['Tijdens de overtocht werkte je op het zonnedek.','Lena verscheen daar pas kort voor aankomst.','Het slachtoffer was al veel eerder op het dek.']},
  {name:'Femke',desc:'reiziger',facts:['Tijdens de overtocht liep je door de hutgang.','Daar zag je Lena bij de hut van het slachtoffer.','Daarna ging je naar de koffiebar.']}
 ],
 clues:['Er is geen extra hutsleutel gebruikt.','De hut is geopend met de eigen sleutelkaart van het slachtoffer.','Femke zag Lena bij die hut terwijl Lena zegt op het zonnedek te zijn geweest.'],
 solution:'Lena gebruikte de sleutelkaart en stal de ketting. Haar verhaal over het zonnedek klopt niet.'
},
{
 id:'theatre',title:'De kapotte première',type:'Sabotage in een theater',
 intro:'Vlak voor de première blijkt het belangrijkste decorstuk bewust onbruikbaar gemaakt. Slechts vier mensen waren backstage.',
 chars:[
  {name:'Nora',desc:'regisseur',facts:['Tijdens de laatste repetitie zat je in de zaal.','Meerdere acteurs waren daar bij je.','Je kwam pas backstage toen het probleem werd ontdekt.']},
  {name:'Mick',desc:'decorbouwer',facts:['Vóór de laatste repetitie controleerde je het decor.','Toen was alles nog goed.','Daarna ging je naar de opslag.']},
  {name:'Isabel',desc:'producent',guilty:true,facts:['Je had ruzie over de première.','Jouw verhaal: tijdens de repetitie stond je buiten te bellen.','Je hebt vrije toegang tot backstage.']},
  {name:'Timo',desc:'lichttechnicus',facts:['Tijdens de repetitie bleef je in de lichtcabine.','Via de monitor zag je Isabel backstage lopen.','Je dacht dat ze iets ging halen.']}
 ],
 clues:['Vóór de laatste repetitie was het decor nog heel.','De sabotage gebeurde tijdens de repetitie.','De backstagecamera toont Isabel daar tijdens de repetitie.'],
 solution:'Isabel saboteerde het decor. Haar verhaal dat ze buiten stond te bellen klopt niet met het camerabeeld.'
},
{
 id:'warehouse',title:'De verdwenen prototypes',type:'Diefstal uit magazijn',
 intro:'Na werktijd blijken drie nieuwe prototypes uit een afgesloten magazijn verdwenen. Het alarm was niet geforceerd.',
 chars:[
  {name:'Wesley',desc:'magazijnchef',facts:['Bij sluiting zette je het alarm aan.','Daarna reed je rechtstreeks naar huis.','Je persoonlijke alarmcode deel je met niemand.']},
  {name:'Kim',desc:'inkoper',facts:['Je vertrok al vóór sluiting met collega’s.','Je hebt geen alarmcode.','Toen je wegging zat Stefan nog achter zijn bureau.']},
  {name:'Stefan',desc:'productmanager',guilty:true,facts:['Je kent een tijdelijke leverancierscode.','Jouw verhaal: bij sluiting vertrok je tegelijk met Wesley.','Je wist precies waar de prototypes lagen.']},
  {name:'Rosa',desc:'bewaker',facts:['Na sluiting begon je buiten je ronde.','Je zag Wesley meteen wegrijden.','Stefans auto stond toen nog op de parkeerplaats.']}
 ],
 clues:['Het magazijn is na sluiting opnieuw geopend met een tijdelijke code.','Die tijdelijke code stond alleen in Stefans projectmail.','Stefans auto stond nog bij het gebouw toen Wesley al weg was.'],
 solution:'Stefan haalde de prototypes op. Hij kende de tijdelijke code en loog over het moment waarop hij vertrok.'
},
{
 id:'airport',title:'Koffer 6B',type:'Kofferwissel op luchthaven',
 intro:'Na een zakelijke vlucht blijkt een verzegelde koffer met documenten verwisseld voor een identieke lege koffer.',
 chars:[
  {name:'Meryem',desc:'projectdirecteur',facts:['Je droeg de koffer zelf door de securitycontrole.','Daarna ging je naar de lounge.','Je opende de koffer niet meer.']},
  {name:'Tom',desc:'collega',guilty:true,facts:['Je reisde op dezelfde vlucht.','Jouw verhaal: na security bleef je steeds bij de gate.','Je wist dat er vertrouwelijke documenten in koffer 6B zaten.']},
  {name:'Els',desc:'lounge-medewerker',facts:['Meryem kwam na security de lounge binnen.','Later kwam Tom daar ook binnen.','Je zag Tom daarna met twee bijna identieke koffers lopen.']},
  {name:'Ravi',desc:'securitymedewerker',facts:['Bij security was de echte koffer nog intact.','Meryem nam hem zelf weer mee.','Tijdens de controle gebeurde niets vreemds.']}
 ],
 clues:['De koffer is pas ná de securitycontrole verwisseld.','Tom was niet de hele tijd bij de gate.','Els zag Tom met twee bijna identieke koffers.'],
 solution:'Tom verwisselde de koffer in of bij de lounge. Zijn verhaal dat hij steeds bij de gate bleef is onwaar.'
},
{
 id:'boat',title:'Sabotage aan de raceboot',type:'Sabotage',
 intro:'Vlak voor een zeilwedstrijd blijkt belangrijke apparatuur van een raceboot bewust losgekoppeld. Vier mensen hadden toegang tot de steiger.',
 chars:[
  {name:'Cas',desc:'schipper',facts:['Vóór de briefing controleerde je de boot.','Toen werkte alle apparatuur nog.','Tijdens de briefing bleef je in het clubhuis.']},
  {name:'Lieke',desc:'monteur',facts:['Tijdens de briefing werkte je aan een andere boot.','Daarna sprak je met de havenmeester.','Je kwam pas bij de raceboot toen het probleem werd ontdekt.']},
  {name:'Victor',desc:'concurrent',guilty:true,facts:['Je hebt toegang tot dezelfde steiger.','Jouw verhaal: tijdens de briefing bleef je in het clubhuis.','Je wist welke apparatuur belangrijk was.']},
  {name:'Puck',desc:'havenmeester',facts:['Tijdens de briefing zag je Victor van de steiger teruglopen.','Later sprak je een tijd met Lieke.','Je vond Victors aanwezigheid op dat moment vreemd.']}
 ],
 clues:['Vóór de briefing werkte de apparatuur nog.','De sabotage gebeurde tijdens de briefing.','Puck zag Victor toen van de steiger teruglopen.'],
 solution:'Victor saboteerde de boot. Zijn verhaal dat hij tijdens de briefing in het clubhuis bleef klopt niet.'
}
];