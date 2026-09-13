(()=>{
  let x=BRAIN_DATA.find(x=>x.q.startsWith('Welk woord heeft vier letters'));
  if(x){x.q='Hoeveel letters heeft het woord “nooit”?';x.a='5';x.e='n-o-o-i-t telt vijf letters.';x.h='Tel het woord letterlijk.';x.d=1;}
  x=BRAIN_DATA.find(x=>x.q.startsWith('Een man bestelt in een restaurant albatros'));
  if(x){x.q='Een vrouw zet een glas water ondersteboven op tafel zonder één druppel te morsen. Hoe kan dat?';x.a='Het water is bevroren';x.e='Als het water ijs is, blijft het in het glas wanneer zij het omdraait.';x.h='Water hoeft niet vloeibaar te zijn.';x.d=2;}
  x=BRAIN_DATA.find(x=>x.q.startsWith('Een getal heeft drie cijfers. Het middelste cijfer'));
  if(x){x.a='Er is geen geldige oplossing';x.e='Laat het laatste cijfer x zijn. Dan is het middelste 4x en het eerste 4x−3. De cijfersom wordt 9x−3=12, dus x=5/3. Dat is geen cijfer, dus de voorwaarden zijn onderling strijdig.';x.h='Vertaal alle drie de cijfers naar één variabele en controleer of daar een geheel cijfer uitkomt.';}
})();
