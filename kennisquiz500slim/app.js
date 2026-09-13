const $=s=>document.querySelector(s);
const categories=Object.keys(QUIZ_DATA);
let enabled=new Set(categories),deck=[],cursor=0,current=null,revealed=false;
const catEmoji={
'Dieren & natuur':'🦑','Mens & lichaam':'🫀','Aarde & weer':'🌍','Ruimte & natuurkunde':'🪐',
'Wetenschap & dagelijks leven':'⚙️','Geschiedenis & beschaving':'🏺','Taal & denken':'🧠',
'Nederland & Europa':'🇪🇺','Wereld & geografie':'🧭','Eten & dagelijks leven':'🍞'
};
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1500);}
function show(id){['setupScreen','quizScreen','endScreen'].forEach(x=>$('#'+x).classList.toggle('hidden',x!==id));$('#homeBtn').classList.toggle('hidden',id==='setupScreen');scrollTo(0,0);}
function save(){try{localStorage.setItem('wauwQuizMediumCats',JSON.stringify([...enabled]));localStorage.setItem('wauwQuizMediumCount',$('#questionCount').value);}catch(e){}}
function load(){try{const v=JSON.parse(localStorage.getItem('wauwQuizMediumCats'));if(Array.isArray(v)){const ok=v.filter(x=>categories.includes(x));if(ok.length)enabled=new Set(ok);}const c=localStorage.getItem('wauwQuizMediumCount');if(c)$('#questionCount').value=c;}catch(e){}}
function renderCategories(){const grid=$('#categoryGrid');grid.innerHTML='';categories.forEach(name=>{const b=document.createElement('button');b.type='button';b.className='cat '+(enabled.has(name)?'active':'');b.innerHTML=`<div class="check">${enabled.has(name)?'✓':''}</div><strong>${catEmoji[name]||'•'} ${esc(name)}</strong><span>${QUIZ_DATA[name].length} vragen</span>`;b.onclick=()=>{enabled.has(name)?enabled.delete(name):enabled.add(name);renderCategories();save();};grid.appendChild(b);});$('#selectedCount').textContent=enabled.size;}
function buildDeck(){const all=[];enabled.forEach(cat=>QUIZ_DATA[cat].forEach((item,idx)=>all.push({cat,idx,q:item[0],a:item[1],f:item[2],s:item[3],u:item[4]})));const mixed=shuffle(all),setting=$('#questionCount').value,n=setting==='all'?mixed.length:Math.min(parseInt(setting,10),mixed.length);return mixed.slice(0,n);}
function start(){if(!enabled.size){toast('Zet minimaal één categorie aan');return;}deck=buildDeck();cursor=0;show('quizScreen');showQuestion();}
function showQuestion(){if(cursor>=deck.length){finish();return;}current=deck[cursor];revealed=false;$('#categoryBadge').textContent=(catEmoji[current.cat]||'•')+' '+current.cat;$('#questionText').textContent=current.q;$('#answerText').textContent='';$('#factText').textContent='';$('#sourceLink').textContent='';$('#sourceLink').removeAttribute('href');$('#answerPanel').classList.add('hidden');$('#revealBtn').classList.remove('hidden');$('#thinkHint').classList.remove('hidden');$('#nextBtn').classList.add('hidden');$('#counter').textContent=`Vraag ${cursor+1} van ${deck.length}`;$('#remainingText').textContent=`${deck.length-cursor-1} te gaan`;$('#progressBar').style.width=`${(cursor/deck.length)*100}%`;scrollTo(0,0);}
function reveal(){if(revealed)return;revealed=true;$('#answerText').textContent=current.a;$('#factText').textContent=current.f;$('#sourceLink').textContent=current.s||'Bron';if(current.u)$('#sourceLink').href=current.u;$('#answerPanel').classList.remove('hidden');$('#revealBtn').classList.add('hidden');$('#thinkHint').classList.add('hidden');$('#nextBtn').classList.remove('hidden');$('#progressBar').style.width=`${((cursor+1)/deck.length)*100}%`;}
function next(){cursor++;showQuestion();}
function skip(){if(revealed){toast('Na het antwoord: ga naar volgende');return;}if(deck.length-cursor<=1){toast('Dit is de laatste vraag');return;}deck.push(deck.splice(cursor,1)[0]);showQuestion();}
function finish(){$('#endTitle').textContent=`${deck.length} vragen gehad`;$('#endText').textContent='Geen enkele vraag is in deze ronde herhaald.';show('endScreen');}
function back(){show('setupScreen');renderCategories();}
$('#allBtn').onclick=()=>{enabled=new Set(categories);renderCategories();save();};$('#noneBtn').onclick=()=>{enabled.clear();renderCategories();save();};$('#questionCount').onchange=save;$('#startBtn').onclick=start;$('#revealBtn').onclick=reveal;$('#nextBtn').onclick=next;$('#skipBtn').onclick=skip;$('#againBtn').onclick=start;$('#settingsBtn').onclick=back;$('#homeBtn').onclick=()=>{if(confirm('Terug naar de categorieën? De huidige ronde stopt.'))back();};
load();renderCategories();