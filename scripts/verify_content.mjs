import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chapters,frontGuides} from '../src/study.js';
import {terms,aliases} from '../src/terms.js';
const manifest=JSON.parse(await fs.readFile(new URL('../public/book/manifest.json',import.meta.url),'utf8'));
const orig=JSON.parse(await fs.readFile(new URL('../public/book/original-glossary.json',import.meta.url),'utf8'));
assert.equal(manifest.entries.length,25);assert.equal(chapters.length,15);assert.equal(orig.length,33);
assert.deepEqual(manifest.entries.filter(x=>x.number).map(x=>x.number),Array.from({length:15},(_,i)=>i+1));
for(const e of manifest.entries){
 const data=JSON.parse(await fs.readFile(new URL(`../public/book/${e.id}.json`,import.meta.url),'utf8'));
 assert.ok(data.html.length,e.id);assert.equal(data.characters,e.characters,e.id);
 assert.ok(chapters.some(c=>c.id===e.id)||frontGuides[e.id],`Guide for ${e.id}`);
 for(const [,path]of data.html.matchAll(/src="([^"]+)"/g))await fs.access(new URL('../public'+path,import.meta.url));
 for(const [,dest,anchor]of data.html.matchAll(/data-book="([^"]+)" data-anchor="([^"]*)"/g)){
  assert.ok(manifest.entries.find(e=>e.id===dest),`Link destination ${dest}`);
  if(anchor){const target=JSON.parse(await fs.readFile(new URL(`../public/book/${dest}.json`,import.meta.url),'utf8'));assert.ok(target.html.includes(`id="${anchor}"`),`Broken footnote: ${dest}#${anchor}`)}
 }
}
for(const c of chapters){assert.equal(c.quiz.length,2);assert.equal(c.steps.length,3);for(const q of c.quiz)assert.ok(q.answer>=0&&q.answer<q.options.length);for(const term of c.terms)assert.ok(terms.find(t=>t.name===(aliases[term]||term)),`Missing term ${term}`);if(c.revision){const n=JSON.parse(await fs.readFile(new URL('../public/book/notes.json',import.meta.url),'utf8'));assert.ok(n.html.includes(`id="${c.revision.anchor}"`))}}
for(const o of orig)assert.ok(terms.some(t=>t.name===(aliases[o.name]||o.name)),`Original glossary missing ${o.name}`);
assert.equal(new Set(terms.map(t=>t.name)).size,terms.length);
for(const t of terms){assert.ok(t.definition&&t.analogy&&t.caution,t.name);assert.ok(t.chapters.every(n=>n>=0&&n<=15),t.name)}
const report={readingUnits:manifest.entries.length,chapters:chapters.length,characters:manifest.stats.characters,sourceImageOccurrences:manifest.stats.images,glossaryTerms:terms.length,originalGlossaryEntries:orig.length,quizQuestions:chapters.reduce((n,c)=>n+c.quiz.length,0),checked:['chapter order','all reading assets','all cross-file footnotes','all chapter term links','original glossary coverage','quiz integrity','revision note anchors']};
console.log(JSON.stringify(report,null,2));
