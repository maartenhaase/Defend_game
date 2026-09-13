(async()=>{try{
if(typeof DecompressionStream==='undefined')throw new Error('Safari ondersteunt de benodigde gzip-decompressie niet.');
const b64=QUIZ_PACKED.join('');
const binary=atob(b64);
const bytes=new Uint8Array(binary.length);
for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
const stream=new Blob([bytes],{type:'application/gzip'}).stream().pipeThrough(new DecompressionStream('gzip'));
QUIZ_DATA=JSON.parse(await new Response(stream).text());
const cats=Object.keys(QUIZ_DATA);
const total=Object.values(QUIZ_DATA).reduce((n,a)=>n+a.length,0);
if(cats.length!==10||total!==500)throw new Error(`Vraagbank onvolledig geladen (${cats.length} categorieën, ${total} vragen).`);
Object.values(QUIZ_DATA).forEach(list=>list.forEach(item=>{if(item[3])item[2]+='\n\nBron / controle: '+item[3]+(item[4]?' — '+item[4]:'');}));
const s=document.createElement('script');s.src='./app.js?v=hard500fix2';s.onload=()=>{};s.onerror=()=>{throw new Error('Quiz-app kon niet laden.');};document.body.appendChild(s);
}catch(e){console.error(e);document.querySelector('.hero h2').textContent='Vraagbank kon niet laden';document.querySelector('.hero p').textContent=e&&e.message?e.message:String(e);document.querySelector('#startBtn').disabled=true;}})();
