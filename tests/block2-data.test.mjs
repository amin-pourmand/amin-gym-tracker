import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const c={window:{},self:{addEventListener(){}}};vm.createContext(c);
c.importScripts=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
for(const f of ['final-data.js','exercise-library.js','exercise-library-expanded.js','media-manifest.js','media-manifest-expanded.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\nglobalThis.precache=APP_SHELL;',c);
const p=c.window.FINAL_WORKOUT_PROGRAM,byId=id=>p.days.find(d=>d.id===id);
const expected={sun:{code:'C',sets:26,counts:[3,3,2,2,2,3,2,2,2,1,1,2,1],guides:['chest-supported-h-row','neutral-grip-lat-pulldown','single-arm-cable-lateral-raise','reverse-pec-deck','cable-face-pull','machine-or-dumbbell-shrug','incline-dumbbell-curl','dumbbell-hammer-curl','single-arm-overhead-cable-triceps','straight-bar-triceps-pushdown','reverse-cable-curl','cable-wrist-curl','dumbbell-heavy-hold']},tue:{code:'B',sets:26,counts:[3,4,2,2,2,2,2,2,2,2,2,1],guides:['seated-leg-press','seated-leg-curl','leg-extension','cable-pull-through','standing-calf-raise','seated-calf-raise','incline-machine-chest-press','straight-arm-rope-pulldown','machine-preacher-curl','cable-reverse-wrist-curl','cable-kneeling-crunch','cable-pallof-press']},fri:{code:'A',sets:24,counts:[3,3,4,3,3,2,2,2,2],guides:['machine-shoulder-press','incline-dumbbell-press','seated-side-lateral-raise','chest-supported-h-row','forward-machine-chest-press','high-to-low-cable-crossover','pec-deck-fly','reverse-pec-deck','overhead-rope-triceps-extension']}};
test('CBA dates, 34 exact exercise instances, order and 76 derived working sets',()=>{
 assert.deepEqual(Array.from(p.rules.trainingDayIds),['sun','tue','fri']);
 for(const [id,exp] of Object.entries(expected)){const d=byId(id);assert.equal(d.sessionCode,exp.code);assert.deepEqual(Array.from(d.exercises,e=>e.guideId),exp.guides);assert.deepEqual(Array.from(d.exercises,e=>e.sets),exp.counts);assert.equal(d.exercises.reduce((s,e)=>s+e.sets,0),exp.sets);}
 const all=p.days.flatMap(d=>d.exercises||[]);assert.equal(all.length,34);assert.equal(all.reduce((s,e)=>s+e.sets,0),76);assert.equal(new Set(all.map(e=>e.id)).size,34);
 assert.ok(all.every(e=>e.englishName&&e.restSec&&e.targetRir));assert.ok(!all.some(e=>e.guideId==='dumbbell-rdl'));
});
test('existing movement identities and all local media are preserved and precached',()=>{
 const mapping=JSON.parse(fs.readFileSync(path.join(root,'data/block2-exercise-mapping.json'),'utf8'));
 assert.equal(mapping.instanceCount,34);assert.equal(mapping.newCatalogExercises.length,0);
 const shell=new Set(Array.from(c.precache,f=>f.replace(/^\.\//,'')));
 for(const f of shell)if(f)assert.ok(fs.existsSync(path.join(root,f.split('?')[0])),'precache file '+f);
 for(const e of p.days.flatMap(d=>d.exercises||[]).concat(p.postureRoutine.items)){
  const media=c.window.EXERCISE_MEDIA[e.guideId];assert.ok(media?.file,e.guideId);assert.ok(!/^(?:https?:)?\/\//.test(media.file));assert.ok(shell.has(media.file.replace(/^\.\//,'')),e.guideId+' cached');
 }
 assert.equal(c.window.WORKOUT_PROGRAM_VERSIONS['2026-10-17-three-day-74'].days.filter(d=>d.type==='training').reduce((n,d)=>n+d.exercises.reduce((s,e)=>s+e.sets,0),0),74);
 assert.equal(c.window.LEGACY_WORKOUT_PROGRAM.days.filter(d=>d.type==='training').length,4);
});
test('rep ranges, rest intervals and RIR match the reference tables',()=>{
 const reps={sun:['8–12','8–12','12–20 هر دست','12–20','15–20','10–15','10–15','10–15','10–15 هر دست','10–15','12–15','15–20','30–45'],tue:['8–12','10–15','10–15','10–15','10–15','12–20','10–15','12–15','8–12','15–20','10–15','10–15 هر سمت'],fri:['8–12','6–10','12–20','8–12','8–12','12–15','10–15','12–20','10–15']};
 const rests={sun:['120–150','120–150','60–75','75–90','75–90','90–120','90','90','75–90','75–90','75–90','60–75','90'],tue:['150–180','90–120','90','90–120','75–90','75–90','120','90','90–120','60–75','75','60–75'],fri:['180','150–180','90–120','120–150','120–150','75–90','75–90','75–90','90']};
 const rirs={sun:['1–2','1–2','2–3','2–3','2–3','1–2','1–2','1–2','1–2','1–2','1–2','1–2','کنترل‌شده'],tue:['2–3','1–2','1–2','2–3','1–2','1–2','1–2','1–2','1–2','1–2','1–2','2–3'],fri:['2–3','1–2','1–2','1–2','1–2','1–2','1–2','2–3','1–2']};
 for(const id of ['sun','tue','fri']){assert.deepEqual(Array.from(byId(id).exercises,e=>e.reps),reps[id]);assert.deepEqual(Array.from(byId(id).exercises,e=>e.restSec),rests[id]);assert.deepEqual(Array.from(byId(id).exercises,e=>e.targetRir),rirs[id]);}
});
test('unilateral rounds and timed hold have correct types without doubling sets',()=>{
 const unilateral=p.days.flatMap(d=>d.exercises||[]).filter(e=>e.unilateral);
 assert.equal(unilateral.length,3);assert.ok(unilateral.every(e=>e.unilateral.workingSetCounting==='pair_is_one_set'));
 const hold=byId('sun').exercises.at(-1);assert.equal(hold.inputType,'time');assert.equal(hold.sets,1);assert.equal(hold.tracking.showReps,false);assert.equal(hold.tracking.durationUnit,'seconds');
 assert.equal(byId('tue').exercises.at(-1).sets,1);
});
test('Friday cardio is an independent Cardio activity with progression and no working sets',()=>{
 assert.equal(byId('sun').activities?.length||0,0);assert.equal(byId('tue').activities?.length||0,0);
 const a=byId('fri').activities;assert.equal(a.length,1);assert.equal(a[0].type,'Cardio');assert.equal(a[0].order,'after_last_working_exercise');assert.equal(a[0].countsTowardWorkingSets,false);assert.equal(a[0].countsTowardWeeklyCompletion,false);
 assert.deepEqual(Array.from(a[0].progression,v=>[v.week,v.minMinutes,v.maxMinutes]),[[1,15,20],[2,20,25],[3,25,30]]);assert.equal(a[0].segments.reduce((n,s)=>n+s.minutes,0),30);
 assert.equal(byId('fri').exercises[0].variant,'converging-neutral-or-semi-neutral-grip');assert.ok(byId('fri').exercises[0].mediaVariantNote);
});
