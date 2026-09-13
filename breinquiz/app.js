const $=s=>document.querySelector(s);
const cats=[...new Set(BRAIN_DATA.map(x=>x.c))];
const emoji={'Raadsels & omdenken':'🧠','Laterale situaties':'↗️','Logica & deductie':'🧩','Mini-mysteries':'🔎'};
let enabled=new Set(cats),deck=[],i=0,current=null,revealed=false;

function shuffle(a){a=[...a];for(let j=a.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[a[j],a[k]]=[a[k],a[j]]}return a}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1500)}
function show(id){['setup','quiz','done'].forEach(x=>$('#'+x).classList.toggle('hidden',x!==id));$('#homeBtn').classList.toggle('hidden',id==='setup');scrollTo(0,0)}
function save(){try{localStorage.setItem('brainCatsV2',JSON.stringify([...enabled]));localStorage.setItem('brainCountV2',$('#count').value)}catch(e){}}
function load(){try{const c=JSON.parse(localStorage.getItem('brainCatsV2'));if(Array.isArray(c)){const ok=c.filter(x=>cats.includes(x));if(ok.length)enabled=new Set(ok)}const n=localStorage.getItem('brainCountV2');if(n)$('#count').value=n}catch(e){}}
function renderCats(){
  const g=$('#cats');g.innerHTML='';
  cats.forEach(c=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='cat '+(enabled.has(c)?'active':'');
    b.innerHTML=`<strong>${emoji[c]||'•'} ${c}</strong><span>${BRAIN_DATA.filter(x=>x.c===c).length} vragen</span>`;
    b.onclick=()=>{enabled.has(c)?enabled.delete(c):enabled.add(c);renderCats();save()};
    g.appendChild(b)
  });
  $('#selCount').textContent=enabled.size;
}
function build(){
  let pool=shuffle(BRAIN_DATA.filter(x=>enabled.has(x.c)));
  const v=$('#count').value;
  return v==='all'?pool:pool.slice(0,Math.min(+v,pool.length))
}
function start(){
  if(!enabled.size)return toast('Kies minimaal één categorie');
  deck=build();
  if(!deck.length)return toast('Geen vragen bij deze keuze');
  i=0;show('quiz');renderQ()
}
function renderQ(){
  if(i>=deck.length)return finish();
  current=deck[i];revealed=false;
  $('#badge').textContent=(emoji[current.c]||'•')+' '+current.c;
  $('#question').textContent=current.q;
  $('#hint').textContent=current.h;
  $('#hint').classList.add('hidden');
  $('#hintBtn').classList.remove('hidden');
  $('#answerBox').classList.add('hidden');
  $('#reveal').classList.remove('hidden');
  $('#next').classList.add('hidden');
  $('#counter').textContent=`Vraag ${i+1} van ${deck.length}`;
  $('#left').textContent=`${deck.length-i-1} te gaan`;
  $('#bar').style.width=`${i/deck.length*100}%`;
  scrollTo(0,0)
}
function reveal(){
  revealed=true;
  $('#answer').textContent=current.a;
  $('#explain').textContent=current.e;
  $('#answerBox').classList.remove('hidden');
  $('#reveal').classList.add('hidden');
  $('#next').classList.remove('hidden');
  $('#bar').style.width=`${(i+1)/deck.length*100}%`;
  setTimeout(()=>$('#answerBox').scrollIntoView({behavior:'smooth',block:'nearest'}),60)
}
function next(){i++;renderQ()}
function skip(){
  if(revealed)return toast('Na het antwoord: ga naar volgende');
  if(deck.length-i<2)return toast('Laatste vraag');
  deck.push(deck.splice(i,1)[0]);renderQ()
}
function finish(){
  $('#doneText').textContent=`Je hebt ${deck.length} doordenkers gehad. Binnen deze ronde is niets herhaald.`;
  show('done')
}
$('#allBtn').onclick=()=>{enabled=new Set(cats);renderCats();save()};
$('#noneBtn').onclick=()=>{enabled.clear();renderCats();save()};
$('#count').onchange=save;
$('#start').onclick=start;
$('#hintBtn').onclick=()=>{$('#hint').classList.remove('hidden');$('#hintBtn').classList.add('hidden')};
$('#reveal').onclick=reveal;
$('#next').onclick=next;
$('#skip').onclick=skip;
$('#again').onclick=()=>{deck=build();i=0;show('quiz');renderQ()};
$('#settings').onclick=()=>show('setup');
$('#homeBtn').onclick=()=>{if(confirm('Huidige ronde stoppen?'))show('setup')};
if('serviceWorker'in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
load();renderCats();
