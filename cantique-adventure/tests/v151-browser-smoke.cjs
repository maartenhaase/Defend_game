/* V15.1 browser smoke test — runs in GitHub Actions with Playwright.
 * Tests the REAL composite loader and representative scenes, not only JS syntax.
 */
'use strict';
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',error=>errors.push(String(error?.stack||error)));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('console: '+msg.text());});
 page.on('response',r=>{
  if(r.status()===404&&r.url().includes('cantique-adventure'))
    errors.push('missing: '+r.url());
 });
 try {
  await page.addInitScript(()=>{sessionStorage.setItem('cantique-sem-v15-unlocked','yes');});
  const url=process.env.TEST_URL||'http://127.0.0.1:8765/cantique-adventure/sem-v15/index.html';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.CANTIQUE_V15?.v151Audit,{timeout:90000});
  const report=await page.evaluate(()=>{
   const audit=window.CANTIQUE_V15.v151Audit();
   return {audit,version:window.CANTIQUE_V13.version,
    questActions:['v13Machine','v13Rinse','v151Printer','v151Johanneke'].map(x=>[x,typeof actions[x]]),
    routeBack:(window.CANTIQUE_V12.graph.press_rear||[]).includes('print')};
  });
  if(report.version!=='15.1')throw Error('Wrong game version: '+report.version);
  if(report.audit.missingActions.length)throw Error('Undefined actions: '+JSON.stringify(report.audit.missingActions));
  if(report.audit.invalidRects.length)throw Error('Invalid hitboxes: '+JSON.stringify(report.audit.invalidRects));
  if(report.audit.duplicates.length)throw Error('Duplicate hitboxes: '+JSON.stringify(report.audit.duplicates));
  if(report.audit.decorativePropsRemaining!==0)throw Error('Floating decorative props still interactive');
  if(!report.audit.DianneVisible||!report.audit.FennekeVisible)throw Error('Characters missing');
  if(!report.routeBack||report.questActions.some(([,v])=>v!=='function'))
    throw Error('Required story or repair action missing');
  const scenesToSee=['breakroom','print','press_rear','folding','central_hub','borreoffice'];
  const fs=require('node:fs');fs.mkdirSync('screenshots',{recursive:true});
  for(const room of scenesToSee){
   await page.evaluate(id=>{
    started=true;s.scene=id;s.x=550;s.y=650;
    if(Array.isArray(path))path.length=0;
    syncUI();
   },room);
   await page.waitForTimeout(220);
   await page.locator('#game').screenshot({path:'screenshots/'+room+'.png'});
  }
  const fixed=await page.evaluate(()=>{
   started=true;s.scene='press_rear';
   if(!has('v13_gear'))put('v13_gear');
   s.selected='v13_gear';
   actions.v151Printer();
   return {flag:window.CANTIQUE_V13.isKnown('v151PrinterFixed'),gearConsumed:!has('v13_gear')};
  });
  if(!fixed.flag||!fixed.gearConsumed)throw Error('Gear puzzle failed: '+JSON.stringify(fixed));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.CANTIQUE_V15?.v151Audit,{timeout:90000});
  const preserved=await page.evaluate(()=>window.CANTIQUE_V13.isKnown('v151PrinterFixed'));
  if(!preserved)throw Error('Gear repair was not saved and reloaded');
  if(errors.length)throw Error('Browser errors:\n'+errors.join('\n'));
  console.log(JSON.stringify({result:'PASS',version:report.version,rooms:report.audit.rooms,
   screenshots:scenesToSee,gear:fixed,savePersistence:preserved,errors},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
