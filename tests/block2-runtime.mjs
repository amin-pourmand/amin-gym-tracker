import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Webhouse/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.argv[2]||'http://127.0.0.1:4179/',backupPath=process.argv[3];
assert.ok(backupPath,'Pass a local backup path; real user data is never committed');
const backup=JSON.parse(fs.readFileSync(backupPath,'utf8'));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
const oldHtml=execFileSync('git',['show','c309223:index.html'],{cwd:root,encoding:'utf8'}),oldData=execFileSync('git',['show','c309223:final-data.js'],{cwd:root,encoding:'utf8'});
const oldContext=await browser.newContext({serviceWorkers:'block'}),oldPage=await oldContext.newPage();
await oldPage.route('**/*',route=>{const r=route.request();if(r.isNavigationRequest())return route.fulfill({body:oldHtml,contentType:'text/html; charset=utf-8'});if(new URL(r.url()).pathname.endsWith('/final-data.js'))return route.fulfill({body:oldData,contentType:'text/javascript'});return route.continue()});
await oldPage.goto(url);
await oldPage.evaluate(b=>eval('state=normalizeState('+JSON.stringify(b)+');'),backup);
// A Block 1 week with a real-looking submitted record and frozen 74-set structure.
await oldPage.evaluate(()=>eval(`(()=>{
 const key='2026-10-24';state.selectedWeekKey=key;ensureWeekSnapshot(key);current='sun';state.editingHistoryId=null;
 const w=getWorkout('sun'),s=ensure(w),e=w.exercises[0];s.exercises[e.id].sets[0].weight='25';s.exercises[e.id].sets[0].reps='12';s.exercises[e.id].sets[0].done=true;
 state.history.push({...structuredClone(s),historyId:'test_block1_record',sessionId:'test_block1_record',finishedAt:'2026-10-25T12:00:00Z',completedWorkingSets:1,totalWorkingSets:25,completion:4});delete state.active[key+'::sun'];
})()`));
const fixture=await oldPage.evaluate(()=>eval('JSON.parse(JSON.stringify(state))'));
const before=await oldPage.evaluate(()=>eval('Object.fromEntries(Object.keys(state.weekSnapshots).map(k=>[k,weekStats(k)]))'));
const bankBefore=await oldPage.evaluate(()=>eval('EXERCISE_LIBRARY.length'));await oldContext.close();
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
await page.evaluate(b=>eval('state=normalizeState('+JSON.stringify(b)+');current=null;renderHome();'),fixture);
const after=await page.evaluate(()=>eval('({history:state.history,active:state.active,stats:Object.fromEntries(Object.keys(state.weekSnapshots).map(k=>[k,weekStats(k)]))})'));
assert.equal(after.history.length,fixture.history.length);
for(const h of fixture.history){const saved=after.history.find(x=>x.historyId===h.historyId);assert.ok(saved);assert.deepEqual(JSON.parse(JSON.stringify(saved)),h,'entire stored historical record preserved')}
for(const [key,draft] of Object.entries(fixture.active)){assert.ok(after.active[key],'draft preserved '+key);assert.deepEqual(after.active[key].exercises,draft.exercises,'draft fields preserved '+key)}
for(const k of Object.keys(before).filter(k=>k<'2026-10-31')){assert.equal(after.stats[k].total,before[k].total,k+' total');assert.equal(after.stats[k].done,before[k].done,k+' done');assert.equal(after.stats[k].pct,before[k].pct,k+' percent')}
await page.evaluate(()=>window.openWeek('2026-10-24'));assert.match(await page.locator('#mainDays').innerText(),/A — سرشانه/);assert.equal(await page.evaluate(()=>eval('weekStats().total')),74);
const thu=fixture.history.find(h=>h.workoutId==='thu');if(thu){await page.evaluate(id=>window.editHistory(id),thu.historyId);assert.ok(await page.locator('.ex').count()>0);assert.equal(await page.locator('.cardio-panel').count(),0)}
await page.evaluate(()=>window.openWeek('2026-10-31'));assert.equal(await page.evaluate(()=>eval('weekStats().total')),76);assert.equal(await page.locator('#mainDays .day').count(),3);
assert.ok(await page.evaluate(()=>eval('EXERCISE_LIBRARY.length'))>=bankBefore);
await page.evaluate(()=>window.openDay('sun'));assert.equal(await page.locator('.ex').count(),13);
const hold=page.locator('.ex').last();assert.equal(await hold.locator('input[data-key="reps"]').count(),0);assert.match(await hold.innerText(),/ثبت زمانی/);
const holdRules=await page.evaluate(()=>eval(`(()=>{const w=getWorkout(current),e=w.exercises.at(-1);return{type:exerciseInputType(e),sets:e.sets,withSeconds:setIsDone({weight:'15',seconds:'35'},e),withReps:setIsDone({weight:'15',reps:'35'},e)}})()`));assert.deepEqual(holdRules,{type:'time',sets:1,withSeconds:true,withReps:false});
await page.evaluate(()=>window.openDay('fri'));assert.equal(await page.locator('.ex').count(),9);assert.equal(await page.locator('.cardio-panel').count(),1);
assert.equal(await page.locator('.ex').first().evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('.cardio-panel'))&Node.DOCUMENT_POSITION_FOLLOWING)),true);
await page.locator('[data-activity-field="minutes"]').fill('18');await page.locator('[data-activity-field="rpe"]').fill('4');await page.locator('[data-activity-field="completed"]').check();
assert.equal(await page.evaluate(()=>eval('weekStats().done')),0,'cardio excluded from done');assert.equal(await page.evaluate(()=>eval('weekStats().total')),76);
await page.evaluate(()=>eval("(()=>{const {workout,session}=currentSession(),e=workout.exercises[0];session.exercises[e.id].sets[0].weight='25';session.exercises[e.id].sets[0].reps='10';save();})()"));
await page.evaluate(()=>window.finish());
const cardioSaved=await page.evaluate(()=>eval('state.history.find(h=>h.weekKey==="2026-10-31"&&h.workoutId==="fri").activityLogs'));
assert.equal(cardioSaved['block2-friday-cardio'].minutes,'18');assert.equal(cardioSaved['block2-friday-cardio'].completed,true);
await page.evaluate(()=>window.openDay('fri'));assert.equal(await page.locator('[data-activity-field="minutes"]').inputValue(),'18');
await page.evaluate(()=>window.openExercisePicker());await page.locator('#exerciseSearch').fill('Seated Leg Curl');assert.match(await page.locator('#exercisePickerList').innerText(),/پشت‌پا دستگاه نشسته/);await page.evaluate(()=>window.closeExercisePicker());
await page.evaluate(()=>window.openWeek('2026-11-07'));await page.evaluate(()=>window.openDay('fri'));assert.equal(await page.locator('[data-activity-field="minutes"]').inputValue(),'');assert.equal(await page.evaluate(()=>eval('weekStats().done')),0);
const upgrades=await page.evaluate(()=>eval(`(()=>{
 const original=state,p=PROGRAM_VERSIONS['2026-10-17-three-day-74'],week='2026-11-14';
 const snapshot={schemaVersion:1,weekKey:week,programVersion:p.programVersion,days:Object.fromEntries(workoutsFromProgram(p).filter(w=>!w.optional).map(w=>[w.id,{exercises:w.exercises.map(cloneExercise)}]))};
 state=normalizeState({history:[],active:{},weekSnapshots:{[week]:snapshot},selectedWeekKey:week});upgradeUntouchedWeeks();const empty=ensureWeekSnapshot(week).programVersion;
 const custom=structuredClone(snapshot);custom.days.sun.exercises[0].reps='99';state=normalizeState({history:[],active:{},weekSnapshots:{[week]:custom},selectedWeekKey:week});upgradeUntouchedWeeks();const customReps=ensureWeekSnapshot(week).days.sun.exercises[0].reps;
 state=original;return{empty,customReps};
})()`));assert.equal(upgrades.empty,'2026-10-31-block2-cba-76');assert.equal(upgrades.customReps,'99');
await page.evaluate(()=>window.openWeek('2026-10-31'));await page.evaluate(()=>window.openDay('fri'));
await page.screenshot({path:path.join(root,'..','..','outputs','block2-friday-mobile.png'),fullPage:true});
await page.locator('.cardio-panel').screenshot({path:path.join(root,'..','..','outputs','block2-cardio-mobile.png')});
await page.reload();assert.equal(await page.evaluate(()=>eval('weekStats("2026-10-24").total')),74);assert.equal(await page.evaluate(()=>eval('weekStats("2026-10-31").total')),76);
const offlineContext=await browser.newContext({viewport:{width:390,height:844}}),off=await offlineContext.newPage();off.on('pageerror',e=>errors.push(e.message));await off.goto(url);
await off.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}))});await offlineContext.setOffline(true);await off.reload();
await off.evaluate(()=>window.openWeek('2026-10-31'));await off.evaluate(()=>window.openDay('tue'));
const seated=off.locator('.ex').nth(1);await seated.locator('.guide summary').click();await off.waitForFunction(()=>{const m=document.querySelectorAll('.ex')[1].querySelector('.media-visual');return m&&(m.tagName==='IMG'?m.complete&&m.naturalWidth>0:m.readyState>=2)});
assert.deepEqual(errors,[]);
console.log(JSON.stringify({passed:true,realHistoricalSessions:backup.history.length,block1WeekPreserved:true,historicalWeeksCompared:Object.keys(before).filter(k=>k<'2026-10-31').length,cardioLogging:true,cardioExcludedFromWorkingSets:true,blankNewWeek:true,englishSearch:true,customSnapshotPreserved:true,offlineReloadAndSeatedCurlMedia:true,errors},null,2));
await browser.close();
