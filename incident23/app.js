const $=s=>document.querySelector(s);
const ACTIVE_CASES=CASES.slice(0,16);
let players=['Eline','Maarten','Juan','Daniëlle'];
let selectedId='demo';
let game=null;
let passIndex=0;
let clueIndex=-1;
const screens=['setup','briefing','handoff','role','discussion','accuse','result'];
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1500)}
function show(id){screens.forEach(x=>$('#'+x).classList.toggle('hidden',x!==id));$('#homeBtn').classList.toggle('hidden',id==='setup');scrollTo(0,0)}
function save(){try{localStorage.setItem('incident23players',JSON.stringify(players));localStorage.setItem('incident23case',selectedId)}catch(e){}}
function load(){try{const p=JSON.parse(localStorage.getItem('incident23players'));if(Array.isArray(p)&&p.length===4)players=p;const c=localStorage.getItem('incident23case');if(ACTIVE_CASES.some(x=>x.id===c))selectedId=c}catch(e){}}
function renderPlayers(){const box=$('#players');box.innerHTML='';players.forEach((p,i)=>{const inp=document.createElement('input');inp.maxLength=20;inp.value=p;inp.setAttribute('aria-label','Speler '+(i+1));inp.oninput=()=>{players[i]=inp.value;save()};box.appendChild(inp)})}
function renderCases(){const g=$('#caseGrid');g.innerHTML='';ACTIVE_CASES.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='casebtn '+(c.id===selectedId?'active':'');b.innerHTML=`<strong>${c.demo?'🧪 ':''}${esc(c.title)}</strong><span>${esc(c.type)}</span>`;b.onclick=()=>{selectedId=c.id;renderCases();save()};g.appendChild(b)})}
function cleanPlayers(){players=players.map((x,i)=>x.trim()||`Speler ${i+1}`);const low=players.map(x=>x.toLowerCase());if(new Set(low).size!==4){toast('Gebruik vier verschillende namen');return false}save();return true}
function startCase(){if(!cleanPlayers())return;const c=ACTIVE_CASES.find(x=>x.id===selectedId)||ACTIVE_CASES[0];const chars=shuffle(c.chars);game={case:c,assignments:players.map((player,i)=>({player,char:chars[i]}))};passIndex=0;clueIndex=-1;$('#caseTitle').textContent=c.title;$('#caseIntro').textContent=c.intro;$('#charList').innerHTML=c.chars.map(x=>`<div class="char"><b>${esc(x.name)}</b><span>${esc(x.desc)}</span></div>`).join('');show('briefing')}
function beginDeal(){passIndex=0;showHandoff()}
function showHandoff(){const a=game.assignments[passIndex];$('#handoffName').textContent=a.player;$('#readyName').textContent=a.player;show('handoff')}
function showRole(){const a=game.assignments[passIndex],c=a.char;$('#roleName').textContent=c.name;$('#roleJob').textContent=c.desc;$('#guiltyBadge').classList.toggle('hidden',!c.guilty);$('#innocentBadge').classList.toggle('hidden',!!c.guilty);$('#guiltyTip').classList.toggle('hidden',!c.guilty);$('#privateFacts').innerHTML=c.facts.map((f,i)=>`<div class="fact"><div class="num">${i+1}</div><div>${esc(f)}</div></div>`).join('');show('role')}
function seenRole(){passIndex++;if(passIndex<game.assignments.length)showHandoff();else openDiscussion()}
function openDiscussion(){clueIndex=-1;$('#discussionTitle').textContent='Ronde 1 — vertel je verhaal';$('#clueBox').classList.add('hidden');$('#clueBtn').textContent='Open openbaar bewijs 1 →';const c=game.case;if(c.demo&&c.tips){$('#demoTip').textContent='DEMO: '+c.tips[0];$('#demoTip').classList.remove('hidden')}else $('#demoTip').classList.add('hidden');show('discussion')}
function advanceClue(){const c=game.case;if(clueIndex<2){clueIndex++;$('#clueText').textContent=c.clues[clueIndex];$('#clueBox').classList.remove('hidden');$('#discussionTitle').textContent=`Bewijs ${clueIndex+1} van 3`;if(c.demo&&c.tips){$('#demoTip').textContent='DEMO: '+c.tips[Math.min(clueIndex+1,c.tips.length-1)];$('#demoTip').classList.remove('hidden')}if(clueIndex<2)$('#clueBtn').textContent=`Na discussie: open bewijs ${clueIndex+2} →`;else $('#clueBtn').textContent='Naar eindstemming →';return}openAccuse()}
function openAccuse(){const s=$('#accuseSelect');s.innerHTML=game.assignments.map((a,i)=>`<option value="${i}">${esc(a.player)} — ${esc(a.char.name)}</option>`).join('');show('accuse')}
function revealResult(){const picked=+$('#accuseSelect').value;const guiltyIndex=game.assignments.findIndex(a=>a.char.guilty);const guilty=game.assignments[guiltyIndex];const good=picked===guiltyIndex;$('#resultTitle').textContent=good?'Dader gepakt!':'De dader ontsnapt…';const b=$('#resultBox');b.className='resultbox '+(good?'good':'bad');b.innerHTML=good?`Jullie kozen <b>${esc(guilty.player)}</b> terecht. ${esc(guilty.player)} speelde <b>${esc(guilty.char.name)}</b>.`:`Jullie kozen ${esc(game.assignments[picked].player)}, maar de dader was <b>${esc(guilty.player)}</b> als <b>${esc(guilty.char.name)}</b>.`;$('#solution').textContent=game.case.solution;show('result')}
$('#startBtn').onclick=startCase;$('#dealBtn').onclick=beginDeal;$('#readyBtn').onclick=showRole;$('#seenBtn').onclick=seenRole;$('#clueBtn').onclick=advanceClue;$('#revealBtn').onclick=revealResult;$('#againBtn').onclick=()=>show('setup');$('#homeBtn').onclick=()=>{if(confirm('Huidige zaak stoppen?'))show('setup')};
if('serviceWorker'in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
load();renderPlayers();renderCases();