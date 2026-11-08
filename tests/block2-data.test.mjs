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

test('CBA v3 has 82 derived sets with both hack squat and leg press',()=>{
 assert.equal(p.programVersion,'2026-11-07-cba-82');assert.equal(p.effectiveWeekKey,'2026-11-07');
 assert.deepEqual(Array.from(p.rules.trainingDayIds),['sun','tue','fri']);
 const expected={sun:{code:'C',sets:28,count:13,first:'chest-supported-h-row',last:'cable-rear-delt-fly'},tue:{code:'B',sets:29,count:13,first:'incline-machine-chest-press',last:'cable-pallof-press'},fri:{code:'A',sets:25,count:10,first:'machine-shoulder-press',last:'high-to-low-cable-woodchopper'}};
 for(const [id,x] of Object.entries(expected)){const d=byId(id);assert.equal(d.sessionCode,x.code);assert.equal(d.totalWorkingSets,x.sets);assert.equal(d.exercises.length,x.count);assert.equal(d.exercises[0].guideId,x.first);assert.equal(d.exercises.at(-1).guideId,x.last);assert.equal(d.exercises.reduce((n,e)=>n+e.sets,0),x.sets)}
 const all=p.days.flatMap(d=>d.exercises||[]);assert.equal(all.length,36);assert.equal(all.reduce((n,e)=>n+e.sets,0),82);assert.equal(p.validation.expectedWeeklyWorkingSets,82);
 assert.ok(!all.some(e=>['seated-leg-press','standing-calf-raise','pec-deck-fly','chest-supported-h-row'].includes(e.guideId)&&e.id.startsWith('b3_fri_')));
});

test('past program versions remain available and the new week is blank by design',()=>{
 const old=JSON.parse(fs.readFileSync(path.join(root,'data/workout-program-block2-2026-10-31.json'),'utf8'));
 assert.equal(old.programVersion,'2026-10-31-block2-cba-76');assert.equal(old.validation.expectedWeeklyWorkingSets,76);
 assert.equal(c.window.WORKOUT_PROGRAM_VERSIONS[old.programVersion].validation.expectedWeeklyWorkingSets,76);
 const prior=JSON.parse(fs.readFileSync(path.join(root,'data/workout-program-block3-2026-11-07.json'),'utf8'));
 assert.equal(prior.programVersion,'2026-11-07-cba-79');assert.equal(prior.validation.expectedWeeklyWorkingSets,79);
 assert.equal(c.window.WORKOUT_PROGRAM_VERSIONS[prior.programVersion].validation.expectedWeeklyWorkingSets,79);
 const current=Object.values(c.window.WORKOUT_PROGRAM_VERSIONS).filter(x=>x.effectiveWeekKey<='2026-11-07').sort((a,b)=>b.effectiveWeekKey.localeCompare(a.effectiveWeekKey)||b.programVersion.localeCompare(a.programVersion))[0];
 assert.equal(current.programVersion,p.programVersion,'same-week new plan wins over the preserved 79-set archive');
 assert.equal(p.rules.newWeek.startWithBlankInputs,true);assert.equal(p.rules.newWeek.preserveSubmittedHistory,true);
});

test('active instructional media is local and precached; forearm rotation has a precise text guide',()=>{
 const shell=new Set(Array.from(c.precache,f=>f.replace(/^\.\//,'')));
 for(const f of shell)if(f)assert.ok(fs.existsSync(path.join(root,f.split('?')[0])),'precache file '+f);
 for(const e of p.days.flatMap(d=>d.exercises||[]).concat(p.postureRoutine.items)){
  if(e.guideId==='forearm-pronation-supination')continue;
  const media=c.window.EXERCISE_MEDIA[e.guideId];assert.ok(media?.file,e.guideId);assert.ok(!/^(?:https?:)?\/\//.test(media.file));assert.ok(shell.has(media.file.replace(/^\.\//,'')),e.guideId+' cached');
 }
 assert.ok(c.window.EXERCISE_GUIDES['forearm-pronation-supination']);
});

test('workout notes, attachments, RIR, paired movements, and time hold are complete',()=>{
 const all=p.days.flatMap(d=>d.exercises||[]);assert.ok(all.every(e=>e.name&&e.restSec&&e.targetRir&&e.note!==undefined));
 const paired=all.filter(e=>e.unilateral);assert.equal(paired.length,4);assert.ok(paired.every(e=>e.unilateral.workingSetCounting==='pair_is_one_set'));
 const hold=all.find(e=>e.guideId==='dumbbell-heavy-hold');assert.equal(hold.inputType,'time');assert.equal(hold.sets,1);assert.equal(hold.tracking.showReps,false);assert.equal(hold.tracking.durationUnit,'seconds');
 assert.equal(byId('tue').exercises.find(e=>e.guideId==='hack-squat').sets,3);
 const legDay=byId('tue').exercises;assert.equal(legDay.find(e=>e.guideId==='seated-leg-press').sets,3);
 assert.equal(legDay.findIndex(e=>e.guideId==='seated-leg-press'),legDay.findIndex(e=>e.guideId==='hack-squat')+1);
 assert.equal(byId('tue').exercises.find(e=>e.guideId==='leg-press-calf-raise').sets,2);
 assert.equal(byId('sun').exercises.find(e=>e.guideId==='cable-face-pull').sets,2);
 assert.equal(byId('sun').exercises.filter(e=>e.guideId==='cable-rear-delt-fly').length,1);
 assert.equal(byId('fri').exercises.filter(e=>e.guideId==='cable-rear-delt-fly').length,1);
});

test('Friday cardio remains separate from weekly working-set percentage',()=>{
 const a=byId('fri').activities;assert.equal(a.length,1);assert.equal(a[0].type,'Cardio');assert.equal(a[0].countsTowardWorkingSets,false);assert.equal(a[0].countsTowardWeeklyCompletion,false);
});
