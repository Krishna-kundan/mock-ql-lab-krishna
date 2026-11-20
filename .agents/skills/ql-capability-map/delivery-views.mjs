#!/usr/bin/env node
// Release notes and a validation pack: two customer-shareable markdown views
// computed from the ledger and the test scripts (decisions/0094 → Customer-facing
// outputs). Read-only and derived, like the capability map: recomputed each run,
// stamped as generated, never read back as input. Neither one claims approval;
// a sign-off is a named human's verdict, recorded elsewhere.
//
//   node <this> release-notes   [--phase N] [--out <file>]   → delivery/release-notes[-phase-N].md
//   node <this> validation-pack [--phase N] [--out <file>]   → delivery/validation-pack[-phase-N].md
//
// Run from the engagement repo (any engagement selector the engine takes works:
// --engagement <slug>). Ships beside /ql-capability-map and is vendored with it.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Same engine discovery as capability-map.mjs: the repo's committed engine, else
// the plugin's copy. The views need parseTestScript, which API 2 exports.
const NEEDS_API = 2;
let engine = null;
function checkEngine(mod, path) {
  if ((mod.ENGINE_API ?? 0) < NEEDS_API) {
    console.error(`${path} is older than this skill (engine API ${mod.ENGINE_API ?? 0}, needs ${NEEDS_API}). Run /ql-resync to update it.`);
    process.exit(2);
  }
  return mod;
}
async function enterEngagement() {
  for (let d = process.cwd(); ; d = dirname(d)) {
    const found = join(d, 'launchpad', 'scripts', 'intent-ledger.mjs');
    if (existsSync(found)) {
      engine = checkEngine(await import(pathToFileURL(found).href), found);
      const taken = engine.takeEngagementArgs(process.argv.slice(2));
      const eng = taken.error ? taken
        : engine.resolveEngagement({ cwd: process.cwd(), flag: taken.flag, qualified: taken.qualified, env: process.env });
      if (eng.error) { console.error(eng.error); process.exit(2); }
      process.chdir(eng.dir);
      process.argv.splice(2, Infinity, ...taken.args);
      return;
    }
    if (dirname(d) === d) break;
  }
  const bundled = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'templates', 'launchpad', 'scripts', 'intent-ledger.mjs');
  if (existsSync(bundled)) {
    engine = checkEngine(await import(pathToFileURL(bundled).href), bundled);
    const taken = engine.takeEngagementArgs(process.argv.slice(2));
    if (taken.error) { console.error(taken.error); process.exit(2); }
    process.argv.splice(2, Infinity, ...taken.args);
    return;
  }
  console.error('No launchpad/scripts/intent-ledger.mjs found. Run this from an engagement repo (or run /ql-resync to restore the engine).');
  process.exit(2);
}
const startDir = process.cwd(); // --out and the printed path mean what they say where the command ran
await enterEngagement();

const [cmd, ...rest] = process.argv.slice(2);
const flag = (name) => {
  const i = rest.indexOf(name);
  if (i === -1) return undefined;
  const v = rest[i + 1];
  if (v === undefined || v.startsWith('--')) { console.error(`${name} needs a value`); process.exit(2); }
  return v;
};
if (!['release-notes', 'validation-pack'].includes(cmd)) {
  console.error('Usage: delivery-views.mjs release-notes|validation-pack [--phase N] [--out <file>]');
  process.exit(2);
}
for (let k = 0; k < rest.length; k++) {
  if (rest[k] === '--phase' || rest[k] === '--out') { k++; continue; }
  console.error(`delivery-views.mjs doesn't take ${rest[k]}. Use --phase N and --out <file>.`);
  process.exit(2);
}
const phaseArg = flag('--phase');
if (phaseArg !== undefined && !/^\d+$/.test(phaseArg)) { console.error('--phase needs a phase number, e.g. --phase 1'); process.exit(2); }
const phase = phaseArg === undefined ? null : Number(phaseArg);

const today = new Date().toISOString().slice(0, 10);
if (!existsSync('delivery/intent-ledger.md')) {
  console.error('This engagement has no delivery/intent-ledger.md yet, so nothing is delivered. Run /ql-ingest-scopezilla or node launchpad/scripts/intent-ledger.mjs sync first.');
  process.exit(2);
}
const intentDirs = existsSync('intents') ? readdirSync('intents', { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^INT-\d+/i.test(e.name) && existsSync(join('intents', e.name, 'intent.md'))) : [];
const intents = intentDirs
  .map((e) => ({ dir: join('intents', e.name), ...engine.parseIntentFile(readFileSync(join('intents', e.name, 'intent.md'), 'utf8'), e.name).intent }))
  .filter((i) => phase === null || i.phase === phase)
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
const ledger = engine.parseLedgerText(readFileSync('delivery/intent-ledger.md', 'utf8')).byId;
// The engine's own status reader: the leading mark, so an annotated cell
// ("🔄 Needs re-verify (was ✅ in #12)") counts as what it leads with.
const is = (i, mark) => (engine.stampStatus((ledger[engine.normId(i.id)] || {}).status || '') || '').startsWith(mark);
const scope = phase === null ? 'all phases' : `phase ${phase}`;
const stamp = `_Generated from the ledger and test scripts on ${today}. Not a grounding source; regenerate it rather than editing it._`;

let out;
if (cmd === 'release-notes') {
  const delivered = intents.filter((i) => is(i, '✅'));
  const reverifying = intents.filter((i) => is(i, '🔄'));
  out = [`# Release notes — ${scope}`, '', stamp, ''];
  if (!delivered.length) out.push(reverifying.length ? 'Nothing is delivered at its current scope yet.' : 'Nothing is delivered yet.', '');
  for (const i of delivered) {
    const pr = (ledger[engine.normId(i.id)] || {}).pr || '';
    out.push(`## ${i.id} — ${i.title}`, '');
    if (i.outcome && i.outcome.summary) out.push(i.outcome.summary, '');
    if (pr && !/^[—–-]$/.test(pr)) out.push(`Delivered in ${pr}.`, '');
  }
  if (reverifying.length) {
    out.push('## Re-verifying', '', 'Delivered earlier; their scope has since changed and is being checked again:', '');
    for (const i of reverifying) out.push(`- ${i.id} — ${i.title}`);
    out.push('');
  }
} else {
  const delivered = intents.filter((i) => is(i, '✅') || is(i, '🔄'));
  out = [`# Validation pack — ${scope}`, '', stamp, '',
    'Each criterion and how it is proven: ✅ automated or verified in the org, 👁 run and signed by a person, ⚠️ partial, ⛔ blocked, 🔁 fix awaiting retest, 📋 accepted gap.', ''];
  if (!delivered.length) out.push('Nothing is delivered yet.', '');
  const toRun = [];
  for (const i of delivered) {
    const path = join(i.dir, 'test-script.md');
    out.push(`## ${i.id} — ${i.title}`, '');
    if (is(i, '🔄')) out.push('_Re-verifying: its scope changed after delivery, so these marks are for the earlier scope._', '');
    if (!existsSync(path)) { out.push('_No test script yet._', ''); continue; }
    const ts = engine.parseTestScript(path);
    if (!ts.rows.length) { out.push('_The test script has no criteria table._', ''); continue; }
    out.push('| Criterion | | Proven by |', '|---|---|---|');
    for (const r of ts.rows) {
      out.push(`| ${r.id} — ${r.criterion} | ${r.mark || '—'} | ${proofText(r)} |`);
    }
    out.push('');
    const pending = ts.rows.filter(stillToRun).map((r) => r.id.replace(/^INT-\d+[a-z]?-/i, ''));
    if (pending.length) toRun.push({ i, scenes: scenesFor(readFileSync(path, 'utf8'), pending) });
  }
  if (toRun.length) {
    out.push('# Scenes still to run', '', 'Each scene below proves one or more 👁 criteria above that a person has not run yet.', '');
    for (const { i, scenes } of toRun) {
      out.push(`## ${i.id} — ${i.title}`, '');
      out.push(scenes.length ? scenes.join('\n\n') : '_The test script names no scene for these criteria._', '');
    }
  }
}

// What the pack says about how a criterion is proven. A customer reads it, so it
// gives the state, never the signer, and never more detail than the state.
function proofText(r) {
  if (r.mark === '👁') {
    if (r.manual === 'pass') return 'a person, passed';
    if (stillToRun(r)) return 'a person, still to run';
    if (r.unproven) return 'not proven yet';
    return r.manual === 'deferred' ? 'deferred, with a recorded reason' : 'a person, signed';
  }
  if (r.unproven) return 'not proven yet';
  return r.orgUnverified ? 'not verified in the org yet' : '';
}
// A 👁 nobody has run yet, or one recorded as not run: its scene is still to run.
function stillToRun(r) { return r.mark === '👁' && (r.manual === 'pending' || r.manual === 'not proven'); }

// The criterion ids a scene header names, ranges expanded: "C2, C16–C19" → C2, C16…C19.
function named(header) {
  const ids = [];
  for (const m of header.matchAll(/\bC(\d+)(?:\s*[–—-]\s*C?(\d+))?/g)) {
    const lo = Number(m[1]), hi = Math.max(lo, Number(m[2] || m[1]));
    for (let n = lo; n <= hi && n - lo < 100; n++) ids.push(`C${n}`);
  }
  return ids;
}

// The `### Scene …` blocks of a test script whose header names any of `ids` (C2…).
function scenesFor(text, ids) {
  const sec = text.replace(/\r\n?/g, '\n').split(/^## /m).find((s) => /^Manual validation scenes/i.test(s));
  if (!sec) return [];
  return sec.split(/^(?=### )/m).filter((b) => b.startsWith('### '))
    .filter((b) => named(b.split('\n')[0]).some((n) => ids.includes(n)))
    .map((b) => b.replace(/\*\*Sign-off:\*\*.*$/gm, '').trimEnd());
}

const outArg = flag('--out');
const file = outArg ? resolve(startDir, outArg) : resolve(`delivery/${cmd}${phase === null ? '' : `-phase-${phase}`}.md`);
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, out.join('\n').replace(/\n{3,}/g, '\n\n'));
console.log(`Wrote ${relative(startDir, file) || file}.`);
