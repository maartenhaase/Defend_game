const $ = s => document.querySelector(s);
const screens = ['setupScreen','handoffScreen','revealScreen','roundScreen','resultScreen'];
let players = ['Eline','Maarten','Juan','Daniëlle'];
let selectedSet = 'nl';
let game = null;
let timerId = null;
let remaining = 0;
let timerRunning = false;
let peeked = false;

function savePrefs(){
  try{
    localStorage.setItem('spyfallPlayers', JSON.stringify(players));
    localStorage.setItem('spyfallSet', selectedSet);
  }catch(e){}
}
function loadPrefs(){
  try{
    const p = JSON.parse(localStorage.getItem('spyfallPlayers'));
    if(Array.isArray(p) && p.length>=3) players = p;
    const s = localStorage.getItem('spyfallSet');
    if(['nl','eu','world','mix'].includes(s)) selectedSet=s;
  }catch(e){}
}
function showScreen(id){ screens.forEach(s=>$('#'+s).classList.toggle('hidden',s!==id)); window.scrollTo(0,0); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1600); }
function renderPlayers(){
  const c=$('#players'); c.innerHTML='';
  players.forEach((p,i)=>{
    const row=document.createElement('div'); row.className='player';
    row.innerHTML=`<input maxlength="22" value="${escapeHtml(p)}" aria-label="Naam speler ${i+1}"><button type="button" class="remove" aria-label="Verwijder speler">×</button>`;
    const inp=row.querySelector('input'); inp.addEventListener('input',()=>{players[i]=inp.value; savePrefs();});
    row.querySelector('button').addEventListener('click',()=>{ if(players.length<=3){toast('Minimaal 3 spelers');return;} players.splice(i,1); renderPlayers(); savePrefs(); });
    c.appendChild(row);
  });
  $('#playerCountLabel').textContent=`${players.length} spelers`;
  $('#spyCount').querySelector('option[value="2"]').disabled = players.length < 6;
  if(players.length<6 && $('#spyCount').value==='2') $('#spyCount').value='1';
}
function renderPills(){ document.querySelectorAll('.pill').forEach(p=>p.classList.toggle('active',p.dataset.set===selectedSet)); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function randInt(n){ return Math.floor(Math.random()*n); }
function shuffled(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=randInt(i+1);[a[i],a[j]]=[a[j],a[i]];} return a; }
function getPool(){ return selectedSet==='mix' ? [...DATASETS.nl,...DATASETS.eu,...DATASETS.world] : DATASETS[selectedSet]; }
function cleanedPlayers(){ return players.map((x,i)=>x.trim()||`Speler ${i+1}`); }

function startGame(){
  players=cleanedPlayers();
  if(players.length<3){toast('Je hebt minimaal 3 spelers nodig');return;}
  const duplicates=players.some((p,i)=>players.findIndex(x=>x.toLowerCase()===p.toLowerCase())!==i);
  if(duplicates){toast('Gebruik unieke spelersnamen');return;}
  const spyCount=parseInt($('#spyCount').value,10);
  if(spyCount>=players.length-1){toast('Te veel spionnen');return;}
  const pool=getPool(); const loc=pool[randInt(pool.length)];
  const order=shuffled(players.map((name,i)=>({name,idx:i})));
  const spyIndices=new Set(shuffled(players.map((_,i)=>i)).slice(0,spyCount));
  const roles=shuffled(loc.r);
  let roleCursor=0;
  const assignments=players.map((name,i)=>({name, spy:spyIndices.has(i), role:spyIndices.has(i)?'Spion':roles[(roleCursor++)%roles.length]}));
  game={location:loc.l, assignments, order, current:0, starter:players[randInt(players.length)], minutes:parseInt($('#roundMinutes').value,10)};
  savePrefs();
  showHandoff();
}
function showHandoff(){
  const who=game.order[game.current].name;
  $('#handoffName').textContent=who; $('#readyName').textContent=who; showScreen('handoffScreen');
}
function showReveal(){
  const idx=game.order[game.current].idx; const a=game.assignments[idx];
  $('#revealName').textContent=a.name; $('#secretContent').innerHTML='';
  $('#secretBox').classList.toggle('spybox',a.spy); $('#seenBtn').disabled=true; peeked=false;
  $('#coveredContent').classList.remove('hidden'); $('#secretContent').classList.add('hidden');
  if(a.spy){
    $('#secretContent').innerHTML=`<div><div class="big-icon" style="font-size:52px">🕵️</div><div class="role spy">JIJ BENT DE SPION</div><div class="hint" style="margin-top:10px">Ontdek de locatie zonder op te vallen.</div></div>`;
  }else{
    $('#secretContent').innerHTML=`<div><div class="tiny">LOCATIE</div><div class="location">${escapeHtml(game.location)}</div><div class="tiny" style="margin-top:20px">JOUW ROL</div><div class="role">${escapeHtml(a.role)}</div></div>`;
  }
  showScreen('revealScreen');
}
function setPeek(show){
  if(show){ $('#coveredContent').classList.add('hidden'); $('#secretContent').classList.remove('hidden'); peeked=true; $('#seenBtn').disabled=false; }
  else { $('#coveredContent').classList.remove('hidden'); $('#secretContent').classList.add('hidden'); }
}
function nextPlayer(){
  if(!peeked) return;
  setPeek(false); game.current++;
  if(game.current>=game.order.length) startRound(); else showHandoff();
}
function startRound(){
  remaining=game.minutes*60; timerRunning=true; updateTimer(); clearInterval(timerId); timerId=setInterval(tick,1000);
  $('#starterText').textContent=`${game.starter} begint met een vraag.`;
  const ideas=shuffled(QUESTION_IDEAS).slice(0,5); $('#questionIdeas').innerHTML=ideas.map((q,i)=>`<div class="locrow"><span>${i+1}. ${escapeHtml(q)}</span></div>`).join('');
  const locs=shuffled(getPool().map(x=>x.l));
  $('#locationsList').innerHTML=locs.map(x=>`<div class="locrow"><span>${escapeHtml(x)}</span></div>`).join('');
  $('#locationsList').classList.add('hidden');
  $('#locationsToggle').textContent='Toon locatielijst';
  $('#timerToggle').textContent='⏸ Pauze'; showScreen('roundScreen');
}
function tick(){ if(!timerRunning)return; remaining=Math.max(0,remaining-1); updateTimer(); if(remaining===0){timerRunning=false;clearInterval(timerId);toast('Tijd is om!');} }
function updateTimer(){ const m=Math.floor(remaining/60),s=remaining%60; $('#timer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; $('#timer').classList.toggle('low',remaining<=60); }
function toggleTimer(){ timerRunning=!timerRunning; $('#timerToggle').textContent=timerRunning?'⏸ Pauze':'▶ Verder'; }
function endRound(){ clearInterval(timerId); timerRunning=false; const spies=game.assignments.filter(a=>a.spy).map(a=>a.name); $('#resultLocation').textContent=game.location; $('#resultSpies').textContent=spies.join(' & '); $('#roleSummary').innerHTML=game.assignments.map(a=>`<div class="locrow"><span><b>${escapeHtml(a.name)}</b></span><span>${a.spy?'🕵️ Spion':escapeHtml(a.role)}</span></div>`).join(''); showScreen('resultScreen'); }
function resetAll(){ if(confirm('Spelers en instellingen terugzetten naar standaard?')){ try{localStorage.removeItem('spyfallPlayers');localStorage.removeItem('spyfallSet');}catch(e){} players=['Eline','Maarten','Juan','Daniëlle'];selectedSet='nl';renderPlayers();renderPills();showScreen('setupScreen');toast('Teruggezet'); } }

function addPlayer(){
  if(players.length>=20){toast('Maximaal 20 spelers');return;}
  players.push(`Speler ${players.length+1}`);
  renderPlayers();
  savePrefs();
  const inputs=document.querySelectorAll('#players input');
  const last=inputs[inputs.length-1];
  if(last){ last.focus(); last.select(); last.scrollIntoView({block:'center',behavior:'smooth'}); }
}
$('#addPlayerBtn').addEventListener('click',addPlayer);
$('#setPills').addEventListener('click',e=>{const p=e.target.closest('.pill');if(!p)return;selectedSet=p.dataset.set;renderPills();savePrefs();});
$('#startBtn').addEventListener('click',startGame);
$('#readyBtn').addEventListener('click',showReveal);
$('#seenBtn').addEventListener('click',nextPlayer);
$('#timerToggle').addEventListener('click',toggleTimer);
$('#locationsToggle').addEventListener('click',()=>{const l=$('#locationsList');const hidden=l.classList.toggle('hidden');$('#locationsToggle').textContent=hidden?'Toon locatielijst':'Verberg locatielijst';});
$('#endRoundBtn').addEventListener('click',endRound);
$('#againBtn').addEventListener('click',()=>{showScreen('setupScreen');setTimeout(startGame,50);});
$('#backSetupBtn').addEventListener('click',()=>showScreen('setupScreen'));
$('#resetBtn').addEventListener('click',resetAll);

const sb=$('#secretBox');
if(window.PointerEvent){
  sb.addEventListener('pointerdown',e=>{e.preventDefault();setPeek(true)},{passive:false});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>sb.addEventListener(ev,e=>{e.preventDefault();setPeek(false)},{passive:false}));
}else{
  ['touchstart','mousedown'].forEach(ev=>sb.addEventListener(ev,e=>{e.preventDefault();setPeek(true)},{passive:false}));
  ['touchend','touchcancel','mouseup','mouseleave'].forEach(ev=>sb.addEventListener(ev,e=>{e.preventDefault();setPeek(false)},{passive:false}));
}

if('serviceWorker' in navigator && location.protocol==='https:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}

loadPrefs(); renderPlayers(); renderPills();
