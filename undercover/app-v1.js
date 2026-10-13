const $=function(s){return document.querySelector(s)};
const screens=["setup","handoff","reveal","talk","vote","result"];
var players=["Eline","Maarten","Juan","Daniëlle"];
var game=null,passIndex=0;

function show(id){screens.forEach(function(x){$("#"+x).classList.toggle("hidden",x!==id)});window.scrollTo(0,0)}
function esc(s){return String(s).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]})}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function savePlayers(){try{localStorage.setItem("undercoverPlayersV1",JSON.stringify(players))}catch(e){}}
function loadPlayers(){try{var p=JSON.parse(localStorage.getItem("undercoverPlayersV1"));if(Array.isArray(p)&&p.length>=3&&p.length<=10)players=p}catch(e){}}

function renderPlayers(){
 var box=$("#players");box.innerHTML="";
 players.forEach(function(p,i){
   var row=document.createElement("div");row.className="playerrow";
   var inp=document.createElement("input");inp.value=p;inp.maxLength=20;inp.setAttribute("aria-label","Speler "+(i+1));
   inp.oninput=function(){players[i]=inp.value;savePlayers()};
   var rm=document.createElement("button");rm.className="remove";rm.type="button";rm.textContent="−";rm.disabled=players.length<=3;
   rm.onclick=function(){if(players.length<=3)return;players.splice(i,1);savePlayers();renderPlayers()};
   row.appendChild(inp);row.appendChild(rm);box.appendChild(row);
 });
 $("#addPlayer").disabled=players.length>=10;
 $("#playerCount").textContent=players.length+" spelers • 1 spion";
}

function cleanPlayers(){
 players=players.map(function(x,i){return String(x).trim()||("Speler "+(i+1))});
 var low=players.map(function(x){return x.toLowerCase()});
 if(new Set(low).size!==players.length){alert("Gebruik verschillende spelersnamen.");return false}
 savePlayers();return true;
}

function nextPair(){
 var total=window.UNDERCOVER_PAIRS.length,q=[];
 try{q=JSON.parse(localStorage.getItem("undercoverPairQueueV1"))||[]}catch(e){}
 q=q.filter(function(n){return Number.isInteger(n)&&n>=0&&n<total});
 if(!q.length){q=shuffle(Array.from({length:total},function(_,i){return i}))}
 var idx=q.shift();
 try{localStorage.setItem("undercoverPairQueueV1",JSON.stringify(q))}catch(e){}
 return window.UNDERCOVER_PAIRS[idx];
}

function nextSpy(){
 var key=players.join("|").toLowerCase(),state={};
 try{state=JSON.parse(localStorage.getItem("undercoverSpyStateV1"))||{}}catch(e){}
 var q=Array.isArray(state.queue)?state.queue.filter(function(n){return players.indexOf(n)>=0}):[];
 if(state.key!==key||!q.length){
   q=shuffle(players);
   if(state.last&&q.length>1&&q[0]===state.last){var t=q[0];q[0]=q[1];q[1]=t}
 }
 var spy=q.shift();
 try{localStorage.setItem("undercoverSpyStateV1",JSON.stringify({key:key,queue:q,last:spy}))}catch(e){}
 return spy;
}

function startRound(){
 if(!cleanPlayers())return;
 var pair=nextPair(),flip=Math.random()<.5;
 var normal=flip?pair[1]:pair[0],spyWord=flip?pair[0]:pair[1],spy=nextSpy();
 game={normal:normal,spyWord:spyWord,spy:spy,starter:players[Math.floor(Math.random()*players.length)]};
 passIndex=0;showHandoff();
}

function showHandoff(){
 var name=players[passIndex];
 $("#handoffName").textContent=name;
 $("#readyName").textContent=name;
 show("handoff");
}

function revealWord(){
 var name=players[passIndex];
 $("#wordOwner").textContent=name;
 $("#secretWord").textContent=name===game.spy?game.spyWord:game.normal;
 show("reveal");
}

function seenWord(){
 passIndex++;
 if(passIndex<players.length){showHandoff();return}
 $("#starter").textContent=game.starter+" begint";
 show("talk");
}

function openVote(){
 var sel=$("#suspect");
 sel.innerHTML=players.map(function(p,i){return '<option value="'+i+'">'+esc(p)+"</option>"}).join("");
 show("vote");
}

function revealSpy(){
 var picked=players[Number($("#suspect").value)],good=picked===game.spy;
 $("#resultTitle").textContent=good?"Spion gepakt!":"Spion ontsnapt!";
 $("#resultLine").innerHTML=good?"Jullie wezen <b>"+esc(game.spy)+"</b> terecht aan.":"Jullie kozen <b>"+esc(picked)+"</b>, maar de spion was <b>"+esc(game.spy)+"</b>.";
 $("#spyName").textContent=game.spy;
 $("#normalWord").textContent=game.normal;
 $("#spyWord").textContent=game.spyWord;
 show("result");
}

$("#addPlayer").onclick=function(){
 if(players.length>=10)return;
 players.push("Speler "+(players.length+1));savePlayers();renderPlayers();
};
$("#startBtn").onclick=startRound;
$("#readyBtn").onclick=revealWord;
$("#seenBtn").onclick=seenWord;
$("#voteBtn").onclick=openVote;
$("#revealBtn").onclick=revealSpy;
$("#againBtn").onclick=startRound;
$("#setupBtn").onclick=function(){show("setup")};

loadPlayers();renderPlayers();show("setup");