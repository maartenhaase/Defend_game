const BASE_ROLES = {
  locaties:['bezoeker','medewerker','manager','schoonmaker','beveiliger','leverancier','fotograaf','vaste bezoeker'],
  vervoer:['bestuurder','passagier','monteur','bemanningslid','controleur','toerist','schoonmaker','planner'],
  werk:['medewerker','manager','stagiair','klant','technicus','schoonmaker','leverancier','inspecteur'],
  uitjes:['bezoeker','medewerker','technicus','beveiliger','fotograaf','kind','ouder','manager'],
  vakantie:['gast','receptionist','gids','schoonmaker','kok','toerist','kind','beheerder'],
  natuur:['wandelaar','boswachter','fotograaf','gids','onderzoeker','toerist','reddingswerker','omwonende'],
  evenementen:['gast','organisator','fotograaf','beveiliger','technicus','cateraar','deelnemer','medewerker'],
  geschiedenis:['leider','arbeider','wachter','handelaar','reiziger','soldaat','kok','boodschapper'],
  bijbel:['reiziger','priester','soldaat','dienaar','handelaar','herder','boodschapper','inwoner'],
  fictie:['held','tegenstander','bewaker','technicus','bezoeker','leider','helper','gevangene']
};
function mk(items,key){
  return items.map(([l,extra=[]])=>({l,r:[...new Set([...extra,...BASE_ROLES[key]])].slice(0,8)}));
}

const DATASETS = {
  locaties: mk([
    ['Treinstation',['conducteur','machinist']],['Vliegveld',['piloot','douanier']],['Ziekenhuis',['arts','verpleegkundige']],
    ['Supermarkt',['caissière','vakkenvuller']],['Bibliotheek',['bibliothecaris','student']],['Museum',['suppoost','conservator']],
    ['Gemeentehuis',['ambtenaar','trouwambtenaar']],['Politiebureau',['agent','rechercheur']],['Basisschool',['leerkracht','leerling']],
    ['Restaurant',['ober','chef-kok']],['Hotel',['hotelgast','piccolo']],['Winkelcentrum',['winkelier','bezorger']],
    ['Voetbalstadion',['supporter','scheidsrechter']],['Dierentuin',['dierenverzorger','dierenarts']],['Zwembad',['badmeester','zwemmer']],
    ['Bioscoop',['kaartcontroleur','operateur']],['Bouwmarkt',['klusser','zaagservice-medewerker']],['Haven',['schipper','kraanmachinist']],
    ['Kerk',['dominee','koster']],['Marktplein',['marktkoopman','marktmeester']]
  ],'locaties'),

  vervoer: mk([
    ['Trein',['machinist','conducteur']],['Stadsbus',['buschauffeur','scholier']],['Touringcar',['chauffeur','reisleider']],
    ['Tram',['trambestuurder','forens']],['Metro',['machinist','forens']],['Vliegtuig',['piloot','steward']],
    ['Veerboot',['kapitein','matroos']],['Cruiseschip',['kapitein','steward']],['Taxi',['taxichauffeur','zakenreiziger']],
    ['Camper',['kampeerder','bijrijder']],['Caravan',['kampeerder','campinggast']],['Politieauto',['agent','arrestant']],
    ['Ambulance',['ambulancebroeder','patiënt']],['Brandweerwagen',['brandweerman','bevelvoerder']],['Vrachtwagen',['vrachtwagenchauffeur','magazijnier']],
    ['Bestelbus',['bezorger','koerier']],['Zeilboot',['schipper','zeiler']],['Onderzeeër',['kapitein','sonaroperator']],
    ['Helikopter',['piloot','reddingswerker']],['Kabelbaan',['liftbediende','skiër']]
  ],'vervoer'),

  werk: mk([
    ['Kantoor',['boekhouder','directeur']],['Bouwplaats',['bouwvakker','kraanmachinist']],['Fabriek',['machineoperator','teamleider']],
    ['Magazijn',['orderpicker','heftruckchauffeur']],['Boerderij',['boer','dierenarts']],['Kapsalon',['kapper','barbier']],
    ['Garage',['automonteur','keurmeester']],['Bakkerij',['bakker','banketbakker']],['Slagerij',['slager','leerling']],
    ['Makelaarskantoor',['makelaar','taxateur']],['Tandartspraktijk',['tandarts','mondhygiënist']],['Huisartsenpraktijk',['huisarts','doktersassistent']],
    ['Kwekerij',['kweker','hovenier']],['Drukkerij',['drukker','vormgever']],['Fotostudio',['fotograaf','model']],
    ['Filmset',['regisseur','cameraman']],['Radiostudio',['presentator','producer']],['Restaurantkeuken',['chef-kok','afwasser']],
    ['Datacenter',['systeembeheerder','netwerkbeheerder']],['Laboratorium',['onderzoeker','laborant']]
  ],'werk'),

  uitjes: mk([
    ['Pretpark',['attractiemedewerker','entertainer']],['Bowlingbaan',['bowler','baliemedewerker']],['Escape room',['spelleider','speler']],
    ['Indoor speeltuin',['toezichthouder','feestbegeleider']],['Sauna',['saunameester','masseur']],['Kartbaan',['coureur','baanmarshal']],
    ['Paintballterrein',['instructeur','scheidsrechter']],['Lasergamehal',['spelleider','feestgast']],['Trampolinepark',['springer','instructeur']],
    ['Klimbos',['klimmer','instructeur']],['Midgetgolfbaan',['speler','baliemedewerker']],['Pannenkoekenrestaurant',['ober','pannenkoekenbakker']],
    ['Kinderboerderij',['dierenverzorger','vrijwilliger']],['Rondvaartboot',['schipper','gids']],['Aquarium',['aquariumverzorger','duiker']],
    ['Schaatsbaan',['schaatser','baanmeester']],['Klimhal',['klimmer','zekeraar']],['Speelparadijs',['animatiemedewerker','toezichthouder']],
    ['Wellnessresort',['masseur','saunameester']],['Arcadehal',['gamer','monteur']]
  ],'uitjes'),

  vakantie: mk([
    ['Camping',['campingbeheerder','kampeerder']],['Vakantiepark',['animatiemedewerker','parkmanager']],['Strandhotel',['badgast','hotelgast']],
    ['Skigebied',['skiër','instructeur']],['Berghut',['berggids','huttenwaard']],['Jeugdherberg',['backpacker','beheerder']],
    ['All-inclusive resort',['animatiemedewerker','badmeester']],['Bungalowpark',['parkmanager','fietsenverhuurder']],['Cruiseterminal',['douanier','bagagemedewerker']],
    ['Treinreis',['conducteur','reiziger']],['Roadtrip',['bestuurder','routeplanner']],['Fietsvakantie',['fietser','fietsenmaker']],
    ['Stedentrip',['toerist','stadsgids']],['Rondreis',['reisleider','touringcarchauffeur']],['Wintersporthotel',['skiër','instructeur']],
    ['Glamping',['campingbeheerder','kampeerder']],['Vakantiehuis',['verhuurder','vakantieganger']],['Backpackhostel',['backpacker','receptionist']],
    ['Jachthaven',['zeiler','havenmeester']],['Trekkershut',['wandelaar','fietser']]
  ],'vakantie'),

  natuur: mk([
    ['Bos',['boswachter','fietser']],['Strand',['strandwacht','surfer']],['Berg',['klimmer','berggids']],
    ['Grot',['speleoloog','grotgids']],['Waterval',['ranger','wandelaar']],['Meer',['visser','kanovaarder']],
    ['Rivier',['schipper','visser']],['Woestijn',['woestijngids','chauffeur']],['Jungle',['bioloog','ranger']],
    ['Savanne',['safarichauffeur','ranger']],['Vulkaan',['vulkanoloog','wandelaar']],['Gletsjer',['glacioloog','klimmer']],
    ['Koraalrif',['duiker','marien bioloog']],['Moeras',['vogelaar','bioloog']],['Heide',['schaapsherder','vogelaar']],
    ['Duinen',['boswachter','badgast']],['Eiland',['visser','bewoner']],['Klif',['klimmer','vogelaar']],
    ['IJsvlakte',['poolonderzoeker','piloot']],['Regenwoud',['bioloog','ranger']]
  ],'natuur'),

  evenementen: mk([
    ['Bruiloft',['bruid','bruidegom']],['Verjaardagsfeest',['jarige','feestgast']],['Begrafenis',['uitvaartleider','familielid']],
    ['Concert',['muzikant','geluidstechnicus']],['Festival',['artiest','festivalganger']],['Kermis',['exploitant','attractiebediener']],
    ['Kerstmarkt',['kraamhouder','glühweinverkoper']],['Rommelmarkt',['verkoper','verzamelaar']],['Sportevenement',['sporter','scheidsrechter']],
    ['Schoolfeest',['leerling','docent']],['Congres',['spreker','journalist']],['Beurs',['standhouder','demonstrateur']],
    ['Circus',['acrobaat','clown']],['Optocht',['muzikant','verkeersregelaar']],['Buurtbarbecue',['grillmaster','buurtbewoner']],
    ['Nieuwjaarsfeest',['DJ','barman']],['Diploma-uitreiking',['geslaagde','docent']],['Veiling',['veilingmeester','bieder']],
    ['Quizavond',['quizmaster','teamcaptain']],['Open dag',['gids','demonstrateur']]
  ],'evenementen'),

  geschiedenis: mk([
    ['Romeinse arena',['gladiator','senator']],['Middeleeuws kasteel',['ridder','smid']],['Vikingschip',['viking','roeier']],
    ['Handelsschip',['kapitein','matroos']],['Koninklijk paleis',['koning','hofdame']],['Loopgraaf',['soldaat','brancardier']],
    ['Oude fabriek',['fabrieksarbeider','stoker']],['Klooster',['monnik','abt']],['Oude havenstad',['koopman','schipper']],
    ['Goudmijn',['mijnwerker','ingenieur']],['Frontierstad',['sheriff','saloonhouder']],['Telegraafkantoor',['telegrafist','postbode']],
    ['Historische markt',['ambachtsman','belastinginner']],['Renaissance-atelier',['schilder','model']],['Oude universiteit',['professor','student']],
    ['Slagveld',['officier','kanonnier']],['Historisch treinstation',['stationschef','telegrafist']],['Schuilkelder',['burger','radioman']],
    ['Oud zeilschip',['stuurman','scheepsarts']],['Archeologische opgraving',['archeoloog','conservator']]
  ],'geschiedenis'),

  bijbel: mk([
    ['Tempel',['Leviet','schriftgeleerde']],['Ark',['dierenverzorger','timmerman']],['Tentenkamp',['oudste','waterdrager']],
    ['Paleis',['koning','hofdienaar']],['Stal',['herder','herbergier']],['Vissersboot',['visser','nettenmaker']],
    ['Heilige berg',['pelgrim','oudste']],['Stadsmuur',['trompetblazer','verkenner']],['Tuin',['tuinman','wachter']],
    ['Bovenzaal',['gastheer','brooddrager']],['Gevangenis',['gevangene','cipier']],['Waterput',['waterdrager','dorpsbewoner']],
    ['Rivieroever',['visser','bootvaarder']],['Wijngaard',['wijnboer','plukker']],['Synagoge',['leraar','schriftgeleerde']],
    ['Woonhuis',['bewoner','gast']],['Akker',['zaaier','oogster']],['Landweg',['ezeldrijver','herbergier']],
    ['Meer',['visser','roeier']],['Graf',['wachter','familielid']]
  ],'bijbel'),

  fictie: mk([
    ['Tovenaarschool',['tovenaar','professor']],['Ruimtestation',['astronaut','wetenschapper']],['Piratenboot',['piraat','kanonnier']],
    ['Spookhuis',['spook','medium']],['Geheim laboratorium',['wetenschapper','proefpersoon']],['Superheldenhoofdkwartier',['superheld','schurk']],
    ['Drakengrot',['draak','ridder']],['Ondergrondse bunker',['commandant','radio-operator']],['Magisch bos',['elf','heks']],
    ['Sprookjeskasteel',['prinses','nar']],['Robotfabriek',['robot','programmeur']],['Alienbasis',['alien','onderzoeker']],
    ['Tijdmachinelab',['uitvinder','tijdreiziger']],['Schuilplaats na een ramp',['overlevende','verkenner']],['Onderwaterstad',['duiker','marien onderzoeker']],
    ['Ruimteschip',['kapitein','navigator']],['Geheim koninkrijk',['koning','ridder']],['Geheime school',['leerling','conciërge']],
    ['Zombieziekenhuis',['zombie','verpleegkundige']],['Monsterlaboratorium',['monster','wetenschapper']]
  ],'fictie')
};

const QUESTION_IDEAS = [
  'Wat zou je hier als eerste doen?',
  'Welke kleding past hier het best?',
  'Wat hoor je hier waarschijnlijk vaak?',
  'Hoe druk is het hier meestal?',
  'Wat zou je hier absoluut niet willen vergeten?',
  'Wat zou hier duur kunnen zijn?',
  'Ben je hier eerder voor plezier of voor werk?',
  'Met wie kom je hier meestal?',
  'Wat is hier waarschijnlijk het meest irritant?',
  'Is dit eerder een plek voor overdag of ’s avonds?',
  'Welke geur zou hier kunnen opvallen?',
  'Hoe lang blijf je hier normaal gesproken?'
];
