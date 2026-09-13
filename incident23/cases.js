const CASES=[
{
 id:'demo',demo:true,title:'DEMO — De rode map',type:'Diefstal op kantoor',
 intro:'Om 16:25 blijkt een vertrouwelijke rode map uit een afgesloten kast verdwenen. Jullie vier waren de enigen die nog op kantoor waren.',
 chars:[
  {name:'Eva',desc:'boekhouder',guilty:true,facts:['Je was rond 16:10 alleen bij de kopieerruimte.','Je kende de code van de archiefkast.','Jouw verhaal: je vertrok om 16:15 en kwam niet bij het archief.']},
  {name:'Bram',desc:'IT-medewerker',facts:['Je verliet de bovenverdieping om 16:08.','Je zag Noor om 16:15 beneden bij de receptie.','Je kent de code van de archiefkast niet.']},
  {name:'Noor',desc:'stagiair',facts:['Je bracht David om 16:10 koffie in zijn kantoor.','Je zag Eva om 16:14 richting het archief lopen.','Je bleef daarna beneden tot 16:20.']},
  {name:'David',desc:'manager',facts:['Je zat van 16:00 tot 16:20 in je kantoor.','Alleen jij en Eva kennen de kastcode.','Om 16:25 ontdekte jij dat de map weg was.']}
 ],
 clues:['De archiefkast is niet geforceerd: hij is met de juiste code geopend.','Het deurlogboek toont dat het archief om 16:16 is geopend.','Een camera toont Eva om 16:17 uit de archiefgang komen.'],
 tips:['Vertel nu alleen wat je op jouw kaart hebt gelezen. Stel elkaar simpele vragen: waar was je en wat zag je?','Dit bewijs hoeft nog niet alles op te lossen. Kijk vooral welk persoonlijk verhaal ermee botst.','Nu hoort één verhaal duidelijk niet meer te kloppen. Kies straks de speler achter dat personage.'],
 solution:'Eva stal de map. Ze kende de code en beweerde al om 16:15 vertrokken te zijn, maar het archief werd om 16:16 geopend en de camera zag haar om 16:17 in die gang.'
},
{
 id:'hotel',title:'Kamer 312',type:'Gestolen horloge',
 intro:'Tijdens een diner in een klein hotel verdwijnt een kostbaar horloge uit kamer 312. Er zijn geen braaksporen.',
 chars:[
  {name:'Lotte',desc:'receptionist',facts:['Je bleef tussen 20:00 en 20:30 achter de receptie.','Je gaf één reservesleutel uit aan de schoonmaker.','Je zag de chauffeur om 20:18 buiten roken.']},
  {name:'Samir',desc:'schoonmaker',guilty:true,facts:['Je kreeg om 20:05 een reservesleutel van kamer 312.','Jouw verhaal: je maakte alleen kamer 310 schoon.','Je leverde de sleutel om 20:25 weer in.']},
  {name:'Fleur',desc:'hotelgast',facts:['Je liep om 20:12 langs kamer 312.','Je zag een schoonmaakkar naast de deur staan.','Je ging daarna rechtstreeks naar het restaurant.']},
  {name:'Koen',desc:'chauffeur',facts:['Je was van 20:10 tot 20:22 buiten.','Lotte kon je vanuit de receptie zien.','Je bent nooit op de derde verdieping geweest.']}
 ],
 clues:['De deur van kamer 312 is met een geldige hotelsleutel geopend.','De deur registreerde een opening om 20:11.','De gebruikte sleutel was precies de reservesleutel die Samir had.'],
 solution:'Samir stal het horloge. Hij had de enige uitgegeven reservesleutel en zijn verhaal dat hij alleen kamer 310 schoonmaakte botst met het deurlog van 312.'
},
{
 id:'wedding',title:'De verdwenen envelop',type:'Diefstal op een bruiloft',
 intro:'Na het diner blijkt een dikke envelop met contant geld uit de cadeaukist verdwenen. De kist stond in een zijzaal.',
 chars:[
  {name:'Mila',desc:'ceremoniemeester',facts:['Je sloot de zijzaal om 19:45 af.','Je hield de sleutel daarna in je jaszak.','Om 20:20 stond je op het podium.']},
  {name:'Ruben',desc:'neef van de bruidegom',guilty:true,facts:['Je wist dat er geld in de cadeaukist zat.','Jouw verhaal: je was van 20:00 tot 20:30 buiten bellen.','Je kent een tweede deur naar de zijzaal via de keuken.']},
  {name:'Sanne',desc:'cateraar',facts:['Je werkte van 20:00 tot 20:25 in de keuken.','Je zag Ruben om 20:12 door de keuken lopen.','De keukendeur naar de zijzaal stond toen even open.']},
  {name:'Teun',desc:'DJ',facts:['Je stond vanaf 19:55 achter je draaitafel.','Je zag Mila om 20:20 op het podium.','Je zag Ruben pas om 20:28 weer buiten.']}
 ],
 clues:['Het slot van de hoofddeur is niet gebruikt na 19:45.','De zijzaal heeft ook een deur naar de keuken.','Sanne zag Ruben om 20:12 precies door die keuken lopen.'],
 solution:'Ruben pakte de envelop via de keukendeur. Zijn alibi dat hij de hele tijd buiten belde klopt niet met de waarneming van Sanne.'
},
{
 id:'gallery',title:'Het lege schilderij',type:'Kunstdiefstal',
 intro:'Na sluiting blijkt een klein schilderij vervangen door een goedkope kopie. Jullie vier waren de laatste aanwezigen.',
 chars:[
  {name:'Iris',desc:'galeriehouder',facts:['Je sloot om 18:00 de voordeur.','Je bleef daarna in je kantoor bellen.','Je bezit de sleutel van de opslag.']},
  {name:'Pieter',desc:'restaurator',guilty:true,facts:['Je werkte die middag aan een lijst in de opslag.','Jouw verhaal: je vertrok om 18:05.','Je weet precies hoe het schilderij uit de lijst kan.']},
  {name:'Nadia',desc:'beveiliger',facts:['Je controleerde om 18:10 zaal 1.','Toen hing het echte schilderij er nog.','Om 18:20 zag je Pieter nog door de achtergang lopen.']},
  {name:'Joost',desc:'bezorger',facts:['Je leverde om 18:12 dozen bij de achterdeur.','Nadia tekende voor ontvangst.','Je vertrok om 18:15.']}
 ],
 clues:['De kopie is pas na 18:10 in de lijst gezet.','De achterdeur werd tussen 18:15 en 18:25 niet geopend.','Pieter beweerde om 18:05 vertrokken te zijn, maar Nadia zag hem om 18:20 nog binnen.'],
 solution:'Pieter verwisselde het schilderij. Het echte werk hing er om 18:10 nog en zijn vertrektijd blijkt onwaar.'
},
{
 id:'laptop',title:'Het gelekte ontwerp',type:'Bedrijfsspionage',
 intro:'Een geheim productontwerp verschijnt bij een concurrent. Het bestand is die avond vanaf kantoor gekopieerd.',
 chars:[
  {name:'Aisha',desc:'projectleider',facts:['Je presenteerde tot 18:30 in vergaderzaal A.','Drie collega’s zaten de hele tijd bij je.','Je laptop bleef daar op tafel.']},
  {name:'Daan',desc:'ontwikkelaar',facts:['Je werkte tot 18:40 in de open werkruimte.','Je zag Hugo om 18:35 bij de printer.','Je hebt geen toegang tot het geheime projectmapje.']},
  {name:'Hugo',desc:'salesmanager',guilty:true,facts:['Je hebt toegang tot de projectmap.','Jouw verhaal: je vertrok direct na de vergadering om 18:30.','Je kent het wachtwoord van de gedeelde presentatielaptop.']},
  {name:'Leila',desc:'office manager',facts:['Je sloot om 18:50 het kantoor af.','Je zag Daan om 18:40 vertrekken.','Je zag Hugo om 18:42 nog bij de lift.']}
 ],
 clues:['Het bestand werd om 18:37 gekopieerd.','De kopie kwam van de gedeelde presentatielaptop.','Hugo was om 18:37 aantoonbaar nog in het gebouw.'],
 solution:'Hugo kopieerde het ontwerp. Hij had toegang, kende het wachtwoord en loog over zijn vertrektijd.'
},
{
 id:'restaurant',title:'Het verkeerde glas',type:'Vergiftiging tijdens diner',
 intro:'Tijdens een besloten diner wordt één gast onwel door iets dat in zijn drankje zat. Alleen jullie vier kwamen bij de tafel.',
 chars:[
  {name:'Elise',desc:'gastvrouw',facts:['Je zat vanaf 21:00 aan tafel.','Je stond alleen om 21:12 even op voor een speech.','Je raakte geen drankjes van anderen aan.']},
  {name:'Marco',desc:'ober',facts:['Je schonk om 20:58 alle glazen in.','Daarna bleef de fles op de serveertafel.','Je stond om 21:10 in de keuken.']},
  {name:'Vera',desc:'zakenpartner',guilty:true,facts:['Je zat naast het slachtoffer.','Jouw verhaal: je bent tussen 21:00 en 21:20 niet van je stoel geweest.','Je wist welk glas van het slachtoffer was.']},
  {name:'Niels',desc:'kok',facts:['Je verliet de keuken niet tussen 20:50 en 21:20.','Marco was om 21:10 bij jou in de keuken.','Je zag Vera vlak vóór de speech richting serveertafel lopen.']}
 ],
 clues:['Alleen het glas van het slachtoffer bevatte de vreemde stof.','Marco was op het beslissende moment aantoonbaar in de keuken.','Niels zag Vera wél opstaan, terwijl zij zegt dat ze bleef zitten.'],
 solution:'Vera manipuleerde het glas. Haar belangrijkste alibi — dat ze haar stoel niet verliet — is onwaar.'
},
{
 id:'train',title:'De nachttrein',type:'Gestolen portefeuille',
 intro:'In een nachttrein verdwijnt een portefeuille uit een afgesloten slaapcoupé terwijl de eigenaar kort in de restauratiewagen is.',
 chars:[
  {name:'Omar',desc:'conducteur',facts:['Je controleerde om 23:10 kaartjes in wagon 4.','Je bleef daarna voorin de trein.','Je hebt een hoofdsleutel, maar die registreert gebruik.']},
  {name:'Julie',desc:'medereiziger',guilty:true,facts:['Je coupé ligt naast die van het slachtoffer.','Jouw verhaal: je sliep vanaf 23:00.','Je had eerder gezien waar het slachtoffer zijn sleutel bewaarde.']},
  {name:'Boris',desc:'reiziger',facts:['Je zat van 23:05 tot 23:30 in de restauratiewagen.','Het slachtoffer zat tegenover je.','Julie kwam om 23:18 kort binnen om water te halen.']},
  {name:'Hanna',desc:'treinmedewerker',facts:['Je werkte van 23:00 tot 23:30 achter de bar.','Je zag Boris en het slachtoffer daar de hele tijd.','Julie kwam pas om 23:18 binnen.']}
 ],
 clues:['De hoofdsleutel van de conducteur is die avond niet gebruikt.','De coupé is geopend met de gewone kamersleutel van het slachtoffer.','Julie wist waar die sleutel lag en was vóór 23:18 alleen bij de coupés.'],
 solution:'Julie gebruikte de sleutel van het slachtoffer en stal de portefeuille voordat ze naar de restauratiewagen liep.'
},
{
 id:'museum',title:'De saffieren broche',type:'Museumdiefstal',
 intro:'Tijdens een besloten rondleiding verdwijnt een historische broche uit een vitrine. Het alarm ging niet af.',
 chars:[
  {name:'Karel',desc:'conservator',facts:['Je opende de vitrine om 17:00 voor inspectie.','Je sloot hem daarna weer en testte het alarm.','Om 17:20 gaf je een rondleiding in zaal 2.']},
  {name:'Yara',desc:'technicus',guilty:true,facts:['Je kent de alarmtestprocedure.','Jouw verhaal: je werkte vanaf 17:10 alleen in de kelder.','Je had die middag een servicetoegang tot de vitrine.']},
  {name:'Finn',desc:'fotograaf',facts:['Je fotografeerde zaal 1 om 17:18.','De broche lag toen nog in de vitrine.','Om 17:24 zag je Yara uit zaal 1 komen.']},
  {name:'Maaike',desc:'gids',facts:['Je stond vanaf 17:15 met de groep in zaal 2.','Karel was daar vanaf 17:20 bij.','Je kwam om 17:30 terug in zaal 1.']}
 ],
 clues:['De broche was om 17:18 nog aanwezig.','De vitrine is om 17:23 met servicetoegang geopend.','Finn zag Yara om 17:24 uit die zaal komen.'],
 solution:'Yara nam de broche via de servicetoegang. Haar verhaal dat ze in de kelder was klopt niet.'
},
{
 id:'camping',title:'De lege geldkist',type:'Diefstal op een camping',
 intro:'Na de avondactiviteit blijkt de kassakist van de receptie leeg. Er mist €1.800.',
 chars:[
  {name:'Sofie',desc:'receptionist',facts:['Je telde om 20:00 de kist.','Daarna sloot je hem en nam de sleutel mee.','Je stond van 20:10 tot 20:45 bij de bingo.']},
  {name:'Rik',desc:'animatiemedewerker',facts:['Je presenteerde de bingo vanaf 20:15.','Sofie stond de hele tijd naast het podium.','Je verliet de zaal niet.']},
  {name:'Dennis',desc:'technische dienst',guilty:true,facts:['Je hebt een reservesleutel van de receptie.','Jouw verhaal: je repareerde van 20:00 tot 20:40 een doucheblok.','Niemand werkte die avond met je mee.']},
  {name:'Anouk',desc:'campinggast',facts:['Je liep om 20:28 langs de receptie.','Je zag Dennis daar naar buiten komen.','Je ging daarna naar de bingo.']}
 ],
 clues:['De kassakist zelf is niet geforceerd.','De receptiedeur is om 20:27 met een reservesleutel geopend.','Anouk zag Dennis één minuut later uit de receptie komen.'],
 solution:'Dennis stal het geld. Hij had de reservesleutel en was aantoonbaar bij de receptie terwijl hij zei bij het doucheblok te zijn.'
},
{
 id:'villa',title:'Dood in de bibliotheek',type:'Moordmysterie',
 intro:'Tijdens een familiediner wordt de eigenaar van een villa dood gevonden in de bibliotheek. De deur stond open.',
 chars:[
  {name:'Anna',desc:'dochter',facts:['Je was van 21:00 tot 21:25 met twee gasten in de salon.','Je had eerder die dag ruzie met je vader.','Je kwam niet in de bibliotheek.']},
  {name:'Robert',desc:'zakenpartner',guilty:true,facts:['Je sprak het slachtoffer om 20:50 kort alleen.','Jouw verhaal: je reed om 21:00 naar huis.','Je jas bleef die avond in de hal hangen.']},
  {name:'Clara',desc:'huishoudster',facts:['Je ruimde tot 21:10 de eetkamer op.','Om 21:12 zag je Roberts auto nog op de oprit.','Om 21:18 hoorde je de bibliotheekdeur dichtvallen.']},
  {name:'Mees',desc:'familievriend',facts:['Je zat van 21:00 tot 21:25 bij Anna in de salon.','Je zag Robert om 21:20 zijn jas uit de hal pakken.','Daarna hoorde je zijn auto vertrekken.']}
 ],
 clues:['Het slachtoffer leefde zeker nog om 21:10.','Roberts auto stond om 21:12 nog bij de villa.','Robert vertrok pas rond 21:20, niet om 21:00 zoals hij beweerde.'],
 solution:'Robert is de dader. Zijn hele alibi steunt op een vertrektijd die door twee onafhankelijke feiten wordt weerlegd.'
},
{
 id:'archive',title:'Het verdwenen testament',type:'Documentdiefstal',
 intro:'Een origineel testament verdwijnt uit een notariskantoor. De envelop waarin het zat ligt leeg terug in de kluis.',
 chars:[
  {name:'Marit',desc:'notaris',facts:['Je opende de kluis om 14:00 voor een dossier.','Je zag het testament toen nog liggen.','Je sloot de kluis om 14:05.']},
  {name:'Jeroen',desc:'klerk',guilty:true,facts:['Je kent de tweede kluiscode.','Jouw verhaal: je was van 14:00 tot 14:30 op de rechtbank.','Je telefoon lag die middag op kantoor.']},
  {name:'Lina',desc:'receptionist',facts:['Je zat de hele middag bij de entree.','Je zag Jeroen om 14:18 uit de archiefgang komen.','Hij verliet het gebouw pas om 14:25.']},
  {name:'Bas',desc:'cliënt',facts:['Je wachtte van 14:10 tot 14:30 in de wachtruimte.','Je zag Lina de receptie niet verlaten.','Je hoorde om 14:17 de kluispiep uit de archiefgang.']}
 ],
 clues:['De kluis is om 14:16 met de tweede code geopend.','Alleen Marit en Jeroen kennen die tweede code.','Lina zag Jeroen om 14:18 uit die gang komen.'],
 solution:'Jeroen nam het testament. Zijn rechtbankalibi is simpelweg onmogelijk: hij was nog op kantoor en gebruikte de tweede code.'
},
{
 id:'ferry',title:'De verdwenen ketting',type:'Diefstal op een veerboot',
 intro:'Een passagier merkt kort voor aankomst dat een gouden ketting uit haar hut verdwenen is.',
 chars:[
  {name:'Jelle',desc:'purser',facts:['Je werkte van 10:00 tot 10:40 aan de balie.','Je registreerde geen extra hutsleutel.','Je zag de eigenaar om 10:15 naar het dek gaan.']},
  {name:'Lena',desc:'medepassagier',guilty:true,facts:['Je hut ligt tegenover die van het slachtoffer.','Jouw verhaal: je was van 10:10 tot 10:35 op het zonnedek.','Je zag eerder waar de eigenaar haar sleutelkaart neerlegde.']},
  {name:'Aron',desc:'matroos',facts:['Je werkte van 10:05 tot 10:35 op het zonnedek.','Je zag Lena daar pas om 10:29 verschijnen.','Je zag het slachtoffer daar al vanaf 10:17.']},
  {name:'Femke',desc:'reiziger',facts:['Je liep om 10:22 door de hutgang.','Je zag Lena bij de hut van het slachtoffer staan.','Je ging daarna rechtstreeks naar de koffiebar.']}
 ],
 clues:['Er is geen extra hutsleutel uitgegeven.','De hut werd om 10:21 geopend met de eigen sleutelkaart van het slachtoffer.','Femke zag Lena om 10:22 bij die hut, terwijl Lena zegt op het zonnedek te zijn geweest.'],
 solution:'Lena gebruikte de sleutelkaart en stal de ketting. Haar zonnedekalibi wordt door zowel Aron als Femke tegengesproken.'
},
{
 id:'theatre',title:'De kapotte première',type:'Sabotage in een theater',
 intro:'Vlak voor de première blijkt het belangrijkste decorstuk bewust onbruikbaar gemaakt. Slechts vier mensen waren backstage.',
 chars:[
  {name:'Nora',desc:'regisseur',facts:['Je zat van 18:30 tot 19:00 in de zaal.','Twee acteurs waren daar bij je.','Je kwam pas om 19:02 backstage.']},
  {name:'Mick',desc:'decorbouwer',facts:['Je controleerde het decor om 18:35.','Toen was alles nog goed.','Je vertrok om 18:40 naar de opslag.']},
  {name:'Isabel',desc:'producent',guilty:true,facts:['Je had een conflict over de première.','Jouw verhaal: je telefoneerde van 18:40 tot 19:00 buiten.','Je hebt vrije toegang tot backstage.']},
  {name:'Timo',desc:'lichttechnicus',facts:['Je bleef van 18:40 tot 19:00 in de lichtcabine.','Om 18:51 zag je Isabel via de monitor backstage lopen.','Je dacht dat ze iets ging halen.']}
 ],
 clues:['Het decor was om 18:35 nog intact.','De beschadiging ontstond vóór 19:00.','Een backstagecamera toont Isabel om 18:51 binnen.'],
 solution:'Isabel saboteerde het decor. Haar alibi dat ze buiten telefoneerde botst rechtstreeks met het camerabeeld.'
},
{
 id:'warehouse',title:'De verdwenen prototypes',type:'Diefstal uit magazijn',
 intro:'Drie nieuwe prototypes verdwijnen uit een afgesloten magazijn. De alarmcode is correct gebruikt.',
 chars:[
  {name:'Wesley',desc:'magazijnchef',facts:['Je activeerde om 17:00 het alarm.','Je reed daarna rechtstreeks naar huis.','Je persoonlijke code is nooit met anderen gedeeld.']},
  {name:'Kim',desc:'inkoper',facts:['Je vertrok om 16:50 met twee collega’s.','Je hebt geen alarmcode.','Je zag Stefan om 16:55 nog bij zijn bureau.']},
  {name:'Stefan',desc:'productmanager',guilty:true,facts:['Je kent een tijdelijke leverancierscode.','Jouw verhaal: je vertrok om 17:00 tegelijk met Wesley.','Je wist exact in welke kast de prototypes lagen.']},
  {name:'Rosa',desc:'bewaker',facts:['Je begon om 17:00 buiten je ronde.','Je zag Wesley om 17:03 wegrijden.','Je zag Stefans auto pas om 17:18 vertrekken.']}
 ],
 clues:['Het magazijn werd om 17:08 opnieuw geopend met een tijdelijke code.','De tijdelijke leverancierscode stond alleen in Stefans projectmail.','Rosa zag Stefans auto pas tien minuten na de opening vertrekken.'],
 solution:'Stefan haalde de prototypes op. Hij kende de tijdelijke code en loog over het moment waarop hij vertrok.'
},
{
 id:'airport',title:'Koffer 6B',type:'Kofferwissel op luchthaven',
 intro:'Na een zakelijke vlucht blijkt een verzegelde koffer met documenten verwisseld voor een identieke lege koffer.',
 chars:[
  {name:'Meryem',desc:'projectdirecteur',facts:['Je droeg de koffer tot aan de securitycontrole.','Daarna kreeg je hem terug en ging je naar de lounge.','Je opende hem niet meer.']},
  {name:'Tom',desc:'collega',guilty:true,facts:['Je reisde op dezelfde vlucht.','Jouw verhaal: je bleef na security continu bij de gate.','Je wist dat er vertrouwelijke documenten in koffer 6B zaten.']},
  {name:'Els',desc:'lounge-medewerker',facts:['Meryem kwam om 07:40 de lounge binnen.','Tom kwam om 07:48 ook binnen.','Hij liep om 07:52 met twee bijna identieke koffers richting uitgang.']},
  {name:'Ravi',desc:'securitymedewerker',facts:['De echte koffer verliet security om 07:36 intact.','Meryem nam hem zelf mee.','Er was geen afwijking bij de controle.']}
 ],
 clues:['De wissel vond pas ná de securitycontrole plaats.','Tom was niet continu bij de gate: hij ging naar de lounge.','Els zag Tom met twee identieke koffers lopen.'],
 solution:'Tom verwisselde de koffer in of bij de lounge. Zijn gate-alibi is onwaar en hij werd met beide koffers gezien.'
},
{
 id:'boat',title:'Sabotage aan de raceboot',type:'Sabotage',
 intro:'Een uur voor een zeilwedstrijd blijkt cruciale apparatuur van een raceboot bewust losgekoppeld. Vier mensen hadden toegang tot de steiger.',
 chars:[
  {name:'Cas',desc:'schipper',facts:['Je verliet de boot om 08:00 voor de briefing.','Je bleef daar tot 08:40.','De apparatuur werkte om 08:00 nog.']},
  {name:'Lieke',desc:'monteur',facts:['Je controleerde om 08:10 een andere boot.','Je had om 08:25 een gesprek met de havenmeester.','Je kwam pas om 08:45 bij de raceboot.']},
  {name:'Victor',desc:'concurrent',guilty:true,facts:['Je had toegang tot dezelfde steiger.','Jouw verhaal: je bleef van 08:00 tot 08:40 in het clubhuis.','Je wist welke apparatuur belangrijk was.']},
  {name:'Puck',desc:'havenmeester',facts:['Je sprak Lieke van 08:23 tot 08:31.','Om 08:18 zag je Victor vanaf de steiger teruglopen.','Je vond dat toen niet vreemd.']}
 ],
 clues:['De sabotage gebeurde tussen 08:00 en 08:35.','Lieke was op het belangrijkste moment bij de havenmeester.','Victor werd om 08:18 op de steiger gezien, terwijl hij zegt in het clubhuis te zijn geweest.'],
 solution:'Victor saboteerde de boot. Zijn alibi wordt rechtstreeks door Puck weerlegd.'
},
{
 id:'bookshop',title:'Het verdwenen manuscript',type:'Diefstal in boekhandel',
 intro:'Tijdens een besloten boekpresentatie verdwijnt het originele manuscript van een beroemde auteur uit een kantoor boven de winkel.',
 chars:[
  {name:'Helena',desc:'boekhandelaar',facts:['Je legde het manuscript om 19:00 in je kantoor.','Je sloot de deur daarna af.','Je bleef vanaf 19:10 bij de presentatie beneden.']},
  {name:'Gijs',desc:'journalist',facts:['Je interviewde de auteur van 19:12 tot 19:30.','Daar waren meerdere bezoekers bij.','Je bent niet boven geweest.']},
  {name:'Celine',desc:'uitgever',guilty:true,facts:['Je hebt een sleutel van Helena’s kantoor.','Jouw verhaal: je zat vanaf 19:10 onafgebroken op de eerste rij.','Je wist dat het manuscript boven lag.']},
  {name:'Mo',desc:'vrijwilliger',facts:['Je stond bij de trap voor garderobejassen.','Om 19:18 zag je Celine naar boven gaan.','Om 19:23 kwam ze weer terug.']}
 ],
 clues:['De kantoordeur is niet geforceerd.','Het slot werd om 19:19 met een echte sleutel geopend.','Mo zag Celine precies rond dat tijdstip naar boven gaan.'],
 solution:'Celine nam het manuscript. Ze had de sleutel en haar verhaal dat ze de hele tijd op haar stoel zat is onwaar.'
},
{
 id:'gala',title:'Het gala na middernacht',type:'Moord tijdens gala',
 intro:'Na een liefdadigheidsgala wordt de organisator dood gevonden in een afgesloten bestuurskamer. Jullie vier waren als laatsten nog in het gebouw.',
 chars:[
  {name:'Saskia',desc:'bestuurslid',facts:['Je sprak tot 00:05 met twee gasten bij de uitgang.','Daarna hielp je jassen uitdelen.','Je was niet in de bestuursgang.']},
  {name:'Diederik',desc:'sponsor',guilty:true,facts:['Je had die avond ruzie met de organisator.','Jouw verhaal: je vertrok om 23:55.','Je had eerder op de avond een tijdelijke toegangspas gekregen.']},
  {name:'Imani',desc:'eventmanager',facts:['Je bleef tot 00:15 in de grote zaal.','Om 00:08 zag je Diederik uit de bestuursgang komen.','Hij had zijn jas nog niet aan.']},
  {name:'Bram',desc:'portier',facts:['Je stond vanaf 23:45 bij de enige hoofduitgang.','Diederik verliet het gebouw pas om 00:12.','Saskia stond rond 00:05 bij jou.']}
 ],
 clues:['Het slachtoffer leefde nog rond 00:00.','Diederik was om 00:08 nog in het gebouw.','Imani zag hem om 00:08 uit precies de bestuursgang komen.'],
 solution:'Diederik is de dader. Zijn hele verhaal hangt aan een vertrek om 23:55, maar hij was ruim daarna nog bij de plaats delict.'
}
];