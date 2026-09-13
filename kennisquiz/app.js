const $=s=>document.querySelector(s);
const categories=Object.keys(QUIZ_DATA);
let enabled=new Set(categories);
let deck=[];
let cursor=0;
let total=20;
let current=null;
let revealed=false;
const catEmoji={'Dieren & evolutie':'🦑','Mens & lichaam':'🫀','Aarde & klimaat':'🌋','Ruimte & tijd':'🪐','Wetenschap & techniek':'⚙️','Geschiedenis & beschaving':'🏺','Taal, denken & cultuur':'🧠','Eten & dagelijks leven':'🍞','Nederland & Europa':'🌍','Wereld & samenleving':'🧭'};
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1500);}
function show(id){['setupScreen','quizScreen','endScreen'].forEach(x=>$('#'+x).classList.toggle('hidden',x!==id));$('#homeBtn').classList.toggle('hidden',id==='setupScreen');scrollTo(0,0);}
function save(){try{localStorage.setItem('wauwQuizCats',JSON.stringify([...enabled]));localStorage.setItem('wauwQuizCount',$('#questionCount').value);}catch(e){}}
function load(){try{const v=JSON.parse(localStorage.getItem('wauwQuizCats'));if(Array.isArray(v)){const ok=v.filter(x=>categories.includes(x));if(ok.length)enabled=new Set(ok);}const c=localStorage.getItem('wauwQuizCount');if(c)$('#questionCount').value=c;}catch(e){}}
function renderCategories(){const grid=$('#categoryGrid');grid.innerHTML='';categories.forEach(name=>{const b=document.createElement('button');b.type='button';b.className='cat '+(enabled.has(name)?'active':'');b.innerHTML=`<div class="check">${enabled.has(name)?'✓':''}</div><strong>${catEmoji[name]||'•'} ${esc(name)}</strong><span>${QUIZ_DATA[name].length} vragen</span>`;b.addEventListener('click',()=>{if(enabled.has(name)){enabled.delete(name);}else enabled.add(name);renderCategories();save();});grid.appendChild(b);});$('#selectedCount').textContent=enabled.size;}
function buildDeck(){const all=[];enabled.forEach(cat=>QUIZ_DATA[cat].forEach((item,idx)=>all.push({cat,idx,q:item[0],a:item[1],f:item[2]})));const mixed=shuffle(all);const setting=$('#questionCount').value;total=setting==='all'?mixed.length:Math.min(parseInt(setting,10),mixed.length);return mixed.slice(0,total);}
function start(){if(enabled.size===0){toast('Zet minimaal één categorie aan');return;}deck=buildDeck();cursor=0;show('quizScreen');showQuestion();}
function showQuestion(){if(cursor>=deck.length){finish();return;}current=deck[cursor];revealed=false;$('#categoryBadge').textContent=(catEmoji[current.cat]||'•')+' '+current.cat;$('#questionText').textContent=current.q;$('#answerText').textContent='';$('#factText').textContent='';$('#answerPanel').classList.add('hidden');$('#revealBtn').classList.remove('hidden');$('#thinkHint').classList.remove('hidden');$('#nextBtn').classList.add('hidden');$('#counter').textContent=`Vraag ${cursor+1} van ${deck.length}`;$('#remainingText').textContent=`${deck.length-cursor-1} te gaan`;$('#progressBar').style.width=`${(cursor/deck.length)*100}%`;scrollTo(0,0);}
function reveal(){if(revealed)return;revealed=true;$('#answerText').textContent=current.a;$('#factText').textContent=current.f;$('#answerPanel').classList.remove('hidden');$('#revealBtn').classList.add('hidden');$('#thinkHint').classList.add('hidden');$('#nextBtn').classList.remove('hidden');$('#progressBar').style.width=`${((cursor+1)/deck.length)*100}%`;setTimeout(()=>$('#answerPanel').scrollIntoView({behavior:'smooth',block:'nearest'}),50);}
function next(){cursor++;showQuestion();}
function skip(){if(revealed){toast('Na het antwoord: ga naar volgende');return;}if(deck.length-cursor<=1){toast('Dit is de laatste vraag');return;}const replacement=deck.splice(cursor,1)[0];deck.push(replacement);showQuestion();}
function finish(){clearQuiz();$('#endTitle').textContent=`${deck.length} vragen gehad`;$('#endText').textContent='Geen enkele vraag is in deze ronde herhaald. Zin in nog een andere mix?';show('endScreen');}
function clearQuiz(){current=null;revealed=false;}function backToSetup(){clearQuiz();show('setupScreen');renderCategories();}function again(){deck=buildDeck();cursor=0;show('quizScreen');showQuestion();}
$('#allBtn').addEventListener('click',()=>{enabled=new Set(categories);renderCategories();save();});$('#noneBtn').addEventListener('click',()=>{enabled.clear();renderCategories();save();});$('#questionCount').addEventListener('change',save);$('#startBtn').addEventListener('click',start);$('#revealBtn').addEventListener('click',reveal);$('#nextBtn').addEventListener('click',next);$('#skipBtn').addEventListener('click',skip);$('#againBtn').addEventListener('click',again);$('#settingsBtn').addEventListener('click',backToSetup);$('#homeBtn').addEventListener('click',()=>{if(confirm('Terug naar de categorieën? De huidige ronde stopt.')) backToSetup();});
document.addEventListener('keydown',e=>{if($('#quizScreen').classList.contains('hidden'))return;if((e.code==='Space'||e.code==='Enter')&&!revealed){e.preventDefault();reveal();}else if((e.code==='Space'||e.code==='Enter')&&revealed){e.preventDefault();next();}});
if('serviceWorker' in navigator&&location.protocol==='https:'){addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
load();renderCategories();
