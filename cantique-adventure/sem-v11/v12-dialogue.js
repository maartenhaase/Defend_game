/* V12 extra dialoog: grove, fictieve kantoorparodie; bestaande puzzels blijven bestaan. */
(function(){
'use strict';
const lines={
 maarten:{who:'Maarten',role:'Montage & complete wanhoop',start:'Sem, ik heb een camera van een paar duizend euro en jij hebt een bankrekening met de draagkracht van een vochtig bierviltje. Wat wil je nou weer?',extra:'Als je die dure lens ook maar áánraakt, snij ik je toekomstige trouwfilm in duizend losse shots. En ik zet er een LUT op van 1997.'},
 sanne:{who:'Sanne',role:'Sanne, die werkelijk alles opmerkt',start:'Sem, serieus. Hier wordt gewerkt. Ik heb een huis gekocht en ik moet mijn fucking hypotheek betalen. Niet de halve dag op zoek naar een verdwenen lens.',extra:'Jarno zei dat hij de leiding had. Ik heb er maar snel notulen van gemaakt, anders gelooft niemand het.'},
 jarno:{who:'Jarno',role:'De baas van de ellende',start:'Nou Sem. Ik ben hier godverdomme manager. Dat betekent dat ik op maandag dingen bespreek waar ik dinsdag weer over ga vergaderen.',extra:'Als dit over die tafel bij Erik gaat: ik zat NIET op mijn knieën te smeken. Ik zocht een pen. Een hele belangrijke pen.'},
 carmen:{who:'Carmen',role:'De onbetrouwbare knipoog',start:'Hé Sem. Waarom kijk je alsof je zojuist een lijkenzak in je renderqueue hebt gevonden? Knipoog. Ach, je went vanzelf aan dit kantoor.',extra:'Ik knipoog één keer en ineens zit de helft van het bedrijf weer in een of ander kutoverleg.'},
 dianne:{who:'Dianne',role:'Telefoon & crisiscommunicatie',start:'Eén moment, Sem. Ik moet eerst even dit appje beantwoorden. En dat appje. Godverdomme, waarom blijft iedereen mij appen?',extra:'Als je een video van Coens wc-ramp maakt, stuur hem vooral NIET in de groepsapp. Of nou ja… misschien toch.'},
 marloes:{who:'Marloes',role:'Werkplek bij Borre',start:'Sem, ik ben verdomme aan het werk. Als je even niet praat, kan ik misschien één hele zin lezen zonder dat de wereld instort.',extra:'Borre eet inmiddels alles wat er op de grond ligt. Zelfs die vervloekte nier uit jullie bizarre horrorverhaal.'},
 johanneke:{who:'Johanneke',role:'Herrie in de drukkerij',start:'WAT?! IK VERSTA ER GEEN REET VAN! DE MACHINE GILT HARDER DAN DE HELE DIRECTIE BIJ ELKAAR!',extra:'Wie nog één keer een snijtafel voor een operatietafel aanziet, mag het papier met de hand gaan knippen. GODVERDOMME.'},
 jansie:{who:'Jansje',role:'Kerkbodes & morele paniek',start:'Een zieke vrouw, stapels kerkbodes en nu een nierdonatie op de snijtafel? Sem, jullie zijn werkelijk compleet van de pot gerukt.',extra:'In mijn tijd spaarde je voor iets moois. Jij koopt eerst bier en wilt daarna je eigen organen verpanden, idioot.'},
 erik:{who:'Erik',role:'Vergaderruimte',start:'Wat een zalige werkdag. Een heerlijke stoel, Jarno die ineens onder de tafel zit, en niemand die vraagt of ik ook écht iets uitvoer.',extra:'Ik hou van vergaderen. Vooral het moment waarop iemand zegt dat we een tweede overleg nodig hebben.'},
 coen:{who:'Coen',role:'WC-trauma',start:'Wat zeg je? Ik kan je niet horen boven de rioolchaos. Als je een ontstopper hebt: KOM GODVERDOMME HIERHEEN.',extra:'Het was géén wedstrijd. Die burrito was simpelweg groter dan mijn ambitie.'},
 fenneke:{who:'Fenneke',role:'Bij de druktafel',start:'Sem, hoe kan iemand tegelijk zo bleek en zo rood aangelopen zijn? Heb je weer een of ander kutplan bedacht om aan geld te komen?',extra:'De proefdruk moet nog naar Sanne. En nee, je gaat de hele stapel niet verkopen op Marktplaats.'},
 timo:{who:'Timo',role:'Apparatuur & waanzin',start:'Sem. Ik heb één vraag. Waar is de apparatuur? En waarom loopt er een man met een ontstopper door het pand?',extra:'Als die USB zoek is kan iedereen weer honderd uur overwerken. Wat een ontiegelijke kutdag.'},
 rineke:{who:'Rineke',role:'Etiketten & stress',start:'We sorteren hier etiketten. Niet menselijke organen. Welke achterlijke idioot heeft deze opdrachten door elkaar gehaald?',extra:'Als je dat goed doet, krijg je geld. Als je het niet doet, krijg je mijn blik.'},
 dirkjanNPC:{who:'Dirk-Jan',role:'Kabels & kortsluiting',start:'Sem, je hebt niet per ongeluk aan de kabels zitten rukken, toch? Die dingen zitten met drie kabelbinders en een halve hoop ellende vast.',extra:'Er ligt een zaklamp in de opslag. Gebruik die liever dan je telefoon in het donker te slopen.'}
};
for(const [name,entry] of Object.entries(lines)){
 const old=actions[name];if(typeof old!=='function'||name==='coen')continue;
 actions[name]=function(){
  const intro=(name==='sanne'&&flag('v12ToiletDone'))?'Sinds die wc-ramp ruikt de halve gang naar riool. Heb jij Coen gered? Dan verdien je opslag. Of een vaccin.':entry.start;
  say(entry.who,intro,[
   {t:'Vertel me de échte kantoorroddels',f:()=>say(entry.who,entry.extra,[{t:'Dit is echt niet normaal.',f:closeDialog}],entry.role)},
   {t:'Welke opdrachten heb je voor me?',f:()=>{closeDialog();old();}},
   {t:'Ik zoek de wc en die verdomde ontstopper',f:()=>say(entry.who,'Via de centrale GANG kun je naar de HEREN-WC. De ONTSTOPPER ligt in de SCHOONMAAKOPSLAG. Maak er geen drama van. Of juist wel.',[{t:'Jezus. Bedankt.',f:closeDialog}],entry.role)},
   {t:'Laat maar. Ik heb zelf problemen genoeg.',f:closeDialog}
  ],entry.role);
 };
}
const noteLine=note;
window.CANTIQUE_V12.dialogues=Object.keys(lines).length;
})();