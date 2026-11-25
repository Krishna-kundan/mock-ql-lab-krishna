#!/usr/bin/env node
// Per-machine setup for this repo's Launchpad tooling (decisions/0082 W1, W4).
//
//   node launchpad/scripts/setup.mjs [--dry-run] [--harness claude|other] [--sf-skills plugin|skills]
//
// Installs the Salesforce CLI (unless an sf is already on PATH) and the build toolkits the team picked, recorded as
// `toolkits` in the repo profile (.launchpad/repo.json). Each toolkit installs
// its own skills, so nothing here lands in the repo:
//   sf-pi       Pi with sf-pi (its /sf-skills command picks what loads)
//   sf-skills   forcedotcom/sf-skills, per agent (decisions/0085): Claude Code gets
//               the salesforce-development plugin from the `salesforce` marketplace,
//               on for this repo only (--scope local); the other agents found on the
//               machine get the skills via npx, globally. `salesforce` is an older name.
//               `sf_skills: "skills"` in the repo profile gives Claude Code the plain
//               skills instead (every folder, no plugin). A builder overrides the
//               repo with --sf-skills plugin|skills, remembered in the never-committed
//               .launchpad/local.json.
//   meshmesh    nothing to install: MeshMesh brings its own skills
// With no `toolkits` recorded it installs sf-pi and sf-skills.
//
// When the profile sets commit_skills: false the ql-* skills aren't in the repo
// (decisions/0072), so setup installs them, unless the Claude plugin is installed
// and already serves them (a second copy shows every skill twice). --harness
// overrides the detection. Zero-dep: bare node, nothing to npm install.
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, renameSync, lstatSync, unlinkSync, realpathSync, statSync, chmodSync, readdirSync, accessSync, constants as fsConstants } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { delimiter, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILLS_CLI = 'skills@1.5.25';
const LAUNCHPAD_SKILLS = 'https://git.soma.salesforce.com/dgerow/quantum-leap-launchpad.git';
const NODE_MIN = [22, 20];
const TOOLKITS = ['sf-pi', 'sf-skills', 'salesforce', 'meshmesh'];
const ALIASES = { salesforce: 'sf-skills' };
const DEFAULT_TOOLKITS = ['sf-pi', 'sf-skills'];
const SF_SOURCE = 'forcedotcom/sf-skills';
// npx gets the full URL: the skills CLI resolves owner/repo shorthand against GH_HOST,
// which many Salesforce builders point at git.soma. (The Claude marketplace add isn't affected.)
const SF_SKILLS_URL = `https://github.com/${SF_SOURCE}`;
// The lock records a github.com install as owner/repo; accept the URL forms too.
const isSfSource = (src) => typeof src === 'string'
  && src.toLowerCase().replace(/^https:\/\/github\.com\//, '').replace(/\/+$/, '').replace(/\.git$/, '') === SF_SOURCE;
// Git for Windows hits MAX_PATH on sf-skills' deep tree: turn on long paths for that
// clone only, appended to any GIT_CONFIG_* pairs already set.
function longPathsEnv() {
  if (process.platform !== 'win32') return undefined;
  const n = Number(process.env.GIT_CONFIG_COUNT) || 0;
  return { ...process.env, GIT_CONFIG_COUNT: String(n + 1), [`GIT_CONFIG_KEY_${n}`]: 'core.longpaths', [`GIT_CONFIG_VALUE_${n}`]: 'true' };
}
const SF_PLUGIN = 'salesforce-development@salesforce';
// The agents besides Claude Code that npx gets sf-skills for, each named only when
// its home dir is here (the same test the skills CLI uses). Naming them keeps npx
// out of Claude Code, where the plugin serves the skills.
const OTHER_AGENTS = {
  codex: () => process.env.CODEX_HOME || join(homedir(), '.codex'),
  cursor: () => join(homedir(), '.cursor'),
  'github-copilot': () => join(homedir(), '.copilot'),
  'gemini-cli': () => join(homedir(), '.gemini'),
  windsurf: () => join(homedir(), '.codeium', 'windsurf'),
};

// ── One Salesforce CLI ──────────────────────────────────────────────────────
// `npm install -g @salesforce/cli` next to an existing sf makes a second copy: one
// from the Salesforce installer or Homebrew, or one under another Node version
// (nvm, fnm, asdf, nvm-windows each keep their own global packages). PATH order then
// picks which runs, `sf update` updates only one, and switching Node flips the
// version. So setup installs sf only when none is on PATH, updates it in place when
// the one on PATH is this npm's, and names any extra copies rather than removing them.
const WIN = process.platform === 'win32';
const exeNames = (name) => (WIN ? [`${name}.cmd`, `${name}.exe`] : [name]);
// Real path, case-folded on Windows (PATH entries and npm's prefix differ in case there).
const realKey = (p) => (WIN ? real(p).toLowerCase() : real(p));
function runnable(p) {
  try {
    if (!statSync(p).isFile()) return false;
    if (!WIN) accessSync(p, fsConstants.X_OK); // Windows runs by extension, not a mode bit
    return true;
  } catch { return false; }
}
function onPath(name) {
  const found = [];
  const seen = new Set();
  for (const dir of (process.env.PATH || '').split(delimiter).filter(Boolean)) {
    for (const n of exeNames(name)) {
      const p = join(dir, n);
      if (!runnable(p)) continue;
      const key = realKey(p);
      if (!seen.has(key)) { seen.add(key); found.push(p); }
    }
  }
  return found;
}

// npm's global bin dir (where `npm install -g` puts sf), or null when npm can't say.
// Asked once per run: the sf and Pi checks both need it.
let npmBinCache;
function npmGlobalBin() {
  if (npmBinCache !== undefined) return npmBinCache;
  const r = spawnSync('npm', ['prefix', '-g'], { encoding: 'utf8', timeout: 15000, shell: WIN });
  const prefix = r.status === 0 ? r.stdout.trim() : '';
  npmBinCache = prefix ? (WIN ? prefix : join(prefix, 'bin')) : null;
  return npmBinCache;
}
const sameDir = (a, b) => realKey(a) === realKey(b);

// sf installed under other Node versions of a version manager, outside npm's own bin.
function otherNodeCopies(npmBin) {
  const home = homedir();
  const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
  const roots = WIN
    ? [[process.env.NVM_HOME || join(appData, 'nvm'), ''], [join(appData, 'fnm', 'node-versions'), 'installation']]
    : [
      [join(home, '.nvm', 'versions', 'node'), 'bin'],
      [join(home, '.asdf', 'installs', 'nodejs'), 'bin'],
      [join(home, '.local', 'share', 'fnm', 'node-versions'), join('installation', 'bin')],
      [join(home, 'Library', 'Application Support', 'fnm', 'node-versions'), join('installation', 'bin')],
    ];
  const out = [];
  for (const [root, bin] of roots) {
    let versions = [];
    try { versions = readdirSync(root); } catch { continue; }
    for (const v of versions) {
      const dir = join(root, v, bin);
      if (npmBin && sameDir(dir, npmBin)) continue;
      for (const n of exeNames('sf')) if (runnable(join(dir, n)) && sfPackage(join(dir, n)) === 'cli') out.push(join(dir, n));
    }
  }
  return out;
}

// Which package an `sf` on PATH belongs to: 'cli' (@salesforce/cli, from npm, Homebrew
// or the Salesforce installer), 'sfdx' (the retired sfdx-cli v7, which ships its own
// sf and blocks an npm install of the current one on the shared bin), or 'other' (an
// unrelated program named sf). POSIX links resolve into the package, so walk up to its
// package.json. A Windows npm shim (sf.cmd) names its package in its text; the
// Windows installer's sf.cmd sits in <install>\bin with package.json one level up.
function sfPackage(p) {
  const name = (dir) => {
    try { return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name; } catch { return null; }
  };
  let dir = dirname(real(p));
  for (let i = 0; i < 5; i++) {
    const n = name(dir);
    if (n === '@salesforce/cli') return 'cli';
    if (n === 'sfdx-cli') return 'sfdx';
    if (n) break;
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  if (WIN) {
    let text = '';
    try { text = readFileSync(p, 'utf8'); } catch { /* binary or unreadable */ }
    if (/@salesforce[\\/]cli/i.test(text)) return 'cli';
    if (/sfdx-cli/i.test(text)) return 'sfdx';
    return 'cli'; // the installer's sf.exe / sf.cmd: give it the benefit of the doubt
  }
  return 'other';
}

// The @salesforce/cli package this npm installs into, so "npm's own copy" means the
// package npm owns, not just a link in npm's bin folder: the Salesforce installer and
// Homebrew put their sf link in that same folder (/usr/local/bin, /opt/homebrew/bin).
const npmPkgDir = (npmBin, pkg) => (WIN ? join(npmBin, 'node_modules', ...pkg.split('/'))
  : join(dirname(npmBin), 'lib', 'node_modules', ...pkg.split('/')));
const npmCliDir = (npmBin) => npmPkgDir(npmBin, '@salesforce/cli');

// → { install: bool, notes: [line] }: whether npm should install (or update in place)
// sf, and what to tell the builder.
function salesforceCliPlan() {
  const all = onPath('sf').map((p) => ({ p, pkg: sfPackage(p) }));
  const npmBin = npmGlobalBin();
  const owned = npmBin && existsSync(npmCliDir(npmBin)) ? realKey(npmCliDir(npmBin)) : null;
  const fromNpm = (p) => !!owned && (WIN ? sameDir(dirname(p), npmBin) : realKey(p).startsWith(owned + sep));
  const notes = [];
  let sfdx = all.some((c) => c.pkg === 'sfdx');
  if (npmBin) {
    const lib = WIN ? join(npmBin, 'node_modules') : join(dirname(npmBin), 'lib', 'node_modules');
    if (existsSync(join(lib, 'sfdx-cli'))) sfdx = true;
  }
  const others = all.filter((c) => c.pkg === 'other').map((c) => c.p);
  if (others.length) notes.push(`${others.join(', ')} ${others.length === 1 ? 'is' : 'are'} on your PATH as sf but ${others.length === 1 ? "isn't" : "aren't"} the Salesforce CLI; Salesforce's own sf has to come before ${others.length === 1 ? 'it' : 'them'} on PATH to run.`);
  const copies = all.filter((c) => c.pkg === 'cli').map((c) => c.p);
  if (sfdx) {
    notes.push('The retired sfdx-cli package is installed with npm, and its own sf shadows the current CLI. Remove it with `npm uninstall -g sfdx-cli`, then run setup again.');
    if (!copies.length) return { install: false, notes };
  }
  if (!copies.length) {
    const elsewhere = otherNodeCopies(npmBin);
    if (elsewhere.length) notes.push(`sf is also installed under another Node version (${elsewhere.join(', ')}), so this adds a second copy for the Node you're on. To keep one, uninstall it from the Node version you don't use (\`npm uninstall -g @salesforce/cli\` while on it).`);
    return { install: true, notes };
  }
  const [runs, ...extra] = copies;
  if (extra.length) {
    notes.push(`There are ${copies.length} copies of sf on your PATH (${copies.join(', ')}), and ${runs} runs. Keep one: remove an npm copy with \`npm uninstall -g @salesforce/cli\` (on the Node it belongs to), and the installer's copy with Salesforce's uninstall steps for your OS.`);
  }
  // This npm's own copy is updated where it is: still one copy.
  if (fromNpm(runs) && !extra.length) return { install: true, notes };
  notes.unshift(`The Salesforce CLI is already installed (${runs}), so setup doesn't install a second copy. To update it, run ${fromNpm(runs) ? '`npm install -g @salesforce/cli@latest`' : '`sf update`'}.`);
  return { install: false, notes };
}

// → { install: bool, sfPi: bool, notes: [line] } for the sf-pi toolkit (#470): whether
// npm should install (or update in place) Pi, whether sf-pi is already in it, and what
// to tell the builder. A pi from anywhere but this npm (Pi's own installer, another
// Node) is left alone, so setup never adds a second, shadowing copy. A pi that doesn't
// answer `pi list` isn't taken for Pi (another program can be named pi): Pi and sf-pi
// are then planned as before.
const PI_PKG = '@earendil-works/pi-coding-agent';
const SF_PI = 'git:github.com/salesforce/sf-pi';
function piPlan() {
  const [runs] = onPath('pi');
  if (!runs) return { install: true, sfPi: false, notes: [] };
  const listed = spawnSync('pi', ['list'], { encoding: 'utf8', timeout: 15000, shell: WIN });
  if (listed.status !== 0) {
    return { install: true, sfPi: false, notes: [`${runs} is on your PATH as pi but didn't answer \`pi list\`, so setup installs Pi as if it weren't there. If it is Pi, the npm copy is a second one: keep one.`] };
  }
  // The sf-pi source as a whole entry, so sf-pi-extra or a fork doesn't count.
  const sfPi = /github\.com\/salesforce\/sf-pi(?:\.git)?(?![\w.-])/i.test(listed.stdout || '');
  const npmBin = npmGlobalBin();
  const owned = npmBin && existsSync(npmPkgDir(npmBin, PI_PKG)) ? realKey(npmPkgDir(npmBin, PI_PKG)) : null;
  const fromNpm = !!owned && (WIN ? sameDir(dirname(runs), npmBin) : realKey(runs).startsWith(owned + sep));
  const notes = [];
  if (!fromNpm) notes.push(`Pi is already installed (${runs}), so setup doesn't install a second copy. To update it, run \`pi update\`.`);
  if (sfPi) notes.push('sf-pi is already installed in Pi, so setup leaves it as it is. To update it, run `pi update`.');
  return { install: fromNpm, sfPi, notes };
}

function profile() {
  for (const file of ['repo.json', 'engagement.json']) {
    try { return JSON.parse(readFileSync(join(ROOT, '.launchpad', file), 'utf8')); } catch { /* not this file */ }
  }
  return {};
}

// Per-machine, gitignored state (also holds the active engagement and source paths).
const LOCAL_FILE = join(ROOT, '.launchpad', 'local.json');
function readLocal() {
  try { return JSON.parse(readFileSync(LOCAL_FILE, 'utf8')); } catch (e) { return e.code === 'ENOENT' ? {} : null; }
}

// Remember this builder's --sf-skills choice. Merge-and-write; never touch a file we can't parse.
function rememberSfChoice(mode) {
  const local = readLocal();
  if (!local || typeof local !== 'object' || Array.isArray(local)) return `Couldn't remember --sf-skills ${mode}: .launchpad/local.json isn't readable JSON. Pass the flag on each run.`;
  if (local.sf_skills === mode) return '';
  mkdirSync(dirname(LOCAL_FILE), { recursive: true });
  writeFileSync(LOCAL_FILE, JSON.stringify({ ...local, sf_skills: mode }, null, 2) + '\n');
  return `Remembered --sf-skills ${mode} for this machine (.launchpad/local.json).`;
}

const claudeConfigDir = () => process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');

function pluginEntries() {
  try {
    return JSON.parse(readFileSync(join(claudeConfigDir(), 'plugins', 'installed_plugins.json'), 'utf8')).plugins || {};
  } catch { return {}; }
}
const installedPlugins = () => Object.keys(pluginEntries());

const pluginInstalled = () => installedPlugins().some((k) => k.startsWith('quantum-leap-launchpad@'));

const real = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };

// Installed for this repo: user-wide, or a local/project install recorded for this path.
function sfInstalledHere() {
  const entries = pluginEntries()[SF_PLUGIN];
  if (!Array.isArray(entries)) return false;
  return entries.some((e) => !e?.scope || e.scope === 'user' || (e.projectPath && real(e.projectPath) === real(ROOT)));
}

// Enabled here: the most specific settings file that names it wins (local, project, user).
function sfEnabledHere() {
  if (!sfInstalledHere()) return false;
  for (const file of [join(ROOT, '.claude', 'settings.local.json'), join(ROOT, '.claude', 'settings.json'), join(claudeConfigDir(), 'settings.json')]) {
    try {
      const v = JSON.parse(readFileSync(file, 'utf8')).enabledPlugins?.[SF_PLUGIN];
      if (typeof v === 'boolean') return v;
    } catch { /* absent or unreadable */ }
  }
  return true;
}

const readSettings = () => JSON.parse(readFileSync(join(claudeConfigDir(), 'settings.json'), 'utf8'));

// The /plugin auto-update toggle writes this same field. Set it only when absent, so
// a builder who turned it off stays off. Parse-and-merge; never touch a file we can't
// parse. Writes through a symlinked settings file and keeps its mode (it can hold keys).
function enableAutoUpdate() {
  const manual = 'Turn on auto-update in Claude Code: `/plugin` → Marketplaces → salesforce.';
  let settings, target;
  try { target = realpathSync(join(claudeConfigDir(), 'settings.json')); settings = readSettings(); } catch { return manual; }
  const entry = settings?.extraKnownMarketplaces?.salesforce;
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return manual;
  if ('autoUpdate' in entry) return entry.autoUpdate === true ? '' : 'Auto-update for the `salesforce` marketplace is off; left off, as you set it.';
  entry.autoUpdate = true;
  const tmp = `${target}.ql-tmp`;
  try {
    const mode = statSync(target).mode & 0o777;
    writeFileSync(tmp, JSON.stringify(settings, null, 2) + '\n', { mode });
    chmodSync(tmp, mode); // the umask can narrow or widen what writeFileSync set
    renameSync(tmp, target);
  } catch {
    try { unlinkSync(tmp); } catch { /* never created */ }
    return manual;
  }
  return 'Turned on auto-update for the `salesforce` marketplace.';
}

// An earlier setup let npx link sf-skills into Claude Code user-wide. Where the
// plugin is on for this repo, drop just those symlinks, so the skills don't show
// twice here; the copy under ~/.agents/skills stays for the other agents. Real
// directories are never touched. The lock path follows the skills CLI (XDG_STATE_HOME first).
// Links npx made to its sf-skills copy, in one agent's skills dir (Claude Code's, or
// Cursor's), dropped when the salesforce-development plugin serves that agent here.
function dropClaudeLinks(skillsDir = join(claudeConfigDir(), 'skills'), agent = 'Claude Code') {
  if (!sfEnabledHere()) return '';
  const canon = real(join(homedir(), '.agents', 'skills'));
  const lockFile = process.env.XDG_STATE_HOME
    ? join(process.env.XDG_STATE_HOME, 'skills', '.skill-lock.json')
    : join(homedir(), '.agents', '.skill-lock.json');
  let lock;
  try { lock = JSON.parse(readFileSync(lockFile, 'utf8')).skills || {}; } catch { return ''; }
  let dropped = 0;
  for (const [name, entry] of Object.entries(lock)) {
    if (!isSfSource(entry?.source) || !/^[a-z0-9][a-z0-9-]*$/.test(name)) continue;
    const link = join(skillsDir, name);
    try {
      // Real paths on both sides: the skills CLI writes the link relative to the real link dir.
      if (!lstatSync(link).isSymbolicLink() || !realpathSync(link).startsWith(canon + sep)) continue;
      unlinkSync(link);
      dropped += 1;
    } catch { /* absent or unreadable: not ours */ }
  }
  return dropped
    ? `Removed ${dropped} ${agent} link${dropped === 1 ? '' : 's'} to npx sf-skills; the ${SF_PLUGIN} plugin serves them in this repo. To have them in every folder: \`claude plugin install ${SF_PLUGIN}\`.`
    : '';
}

// The local install's switch lives in .claude/settings.local.json, which is per machine.
// Claude Code doesn't add it to the repo's .gitignore, so setup does when git would track it.
function ignoreLocalSettings() {
  const file = '.claude/settings.local.json';
  if (!existsSync(join(ROOT, file))) return ''; // a user-wide install writes none
  const git = (args) => spawnSync('git', args, { cwd: ROOT, stdio: 'ignore', shell: process.platform === 'win32' }).status;
  // --no-index: ask whether a rule matches, even if the file is already tracked.
  const ignored = git(['check-ignore', '-q', '--no-index', file]);
  if (ignored !== 0 && ignored !== 1) return ''; // not a git repo, or no git
  const lines = [];
  if (ignored === 1) {
    const gi = join(ROOT, '.gitignore');
    const body = existsSync(gi) ? readFileSync(gi, 'utf8') : '';
    const eol = body.includes('\r\n') ? '\r\n' : '\n';
    appendFileSync(gi, `${body && !body.endsWith('\n') ? eol : ''}# Per-machine Claude Code settings (never tracked).${eol}${file}${eol}`);
    lines.push(`Added ${file} to .gitignore; commit that.`);
  }
  if (git(['ls-files', '--error-unmatch', file]) === 0) lines.push(`${file} is tracked, so git still commits it: run \`git rm --cached ${file}\` and commit.`);
  return lines.join(' ');
}

// The flags this script takes, declared once: this table is the parser. A skill
// calling this updates with the plugin, this script only with /ql-resync, so an
// unknown flag is refused rather than ignored (decisions/0088).
const V = 'value', B = 'bool';
const FLAGS = { '--harness': V, '--sf-skills': V, '--dry-run': B };
function parseArgs(args) {
  const got = {};
  const unknown = [];
  const missing = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) continue;
    if (!Object.hasOwn(FLAGS, a)) { unknown.push(a); continue; }
    if (FLAGS[a] === B) { got[a] = true; continue; }
    const v = args[i + 1];
    if (v === undefined || v.startsWith('--')) { missing.push(a); continue; }
    got[a] = v;
    i++;
  }
  return { got, unknown, missing };
}

function main() {
  const { got, unknown: unknownFlags, missing } = parseArgs(process.argv.slice(2));
  if (missing.length) { console.error(`${missing.join(', ')} needs a value`); process.exit(2); }
  if (unknownFlags.length) {
    console.error(`setup doesn't take ${unknownFlags.join(', ')}. If a skill told you to use it, the skills may be newer than this script: run /ql-resync.`);
    process.exit(2);
  }
  const flag = (name) => got[name] ?? null;
  const harness = flag('--harness');
  if (harness !== null && !['claude', 'other'].includes(harness)) { console.error('--harness claude|other'); process.exit(2); }
  const SF_MODES = ['plugin', 'skills'];
  const sfFlag = flag('--sf-skills');
  if (sfFlag !== null && !SF_MODES.includes(sfFlag)) { console.error('--sf-skills plugin|skills'); process.exit(2); }

  const p = profile();
  const raw = Array.isArray(p.toolkits) ? p.toolkits : DEFAULT_TOOLKITS;
  const unknown = raw.filter((t) => !TOOLKITS.includes(t));
  if (unknown.length) { console.error(`.launchpad/repo.json toolkits: unknown ${unknown.join(', ')} (known: ${TOOLKITS.join(', ')}).`); process.exit(2); }
  const picked = [...new Set(raw.map((t) => ALIASES[t] || t))];
  if (p.sf_skills !== undefined && !SF_MODES.includes(p.sf_skills)) { console.error(`.launchpad/repo.json sf_skills: ${SF_MODES.join(' or ')}, not ${JSON.stringify(p.sf_skills)}.`); process.exit(2); }
  // How Claude Code gets sf-skills: this run's flag, then this builder's remembered
  // choice, then the repo's recommendation, then the plugin.
  const remembered = readLocal()?.sf_skills;
  const sfMode = sfFlag ?? (SF_MODES.includes(remembered) ? remembered : p.sf_skills ?? 'plugin');

  const sfCli = salesforceCliPlan();
  const pi = picked.includes('sf-pi') ? piPlan() : null;
  const npmGlobals = [...(sfCli.install ? ['@salesforce/cli'] : []), ...(pi?.install ? [PI_PKG] : [])];
  const steps = npmGlobals.length ? [['npm', ['install', '-g', ...npmGlobals]]] : [];
  const actions = []; // [label, run]: in-process, after every step succeeds; run returns a line to print or ''
  const after = [...sfCli.notes, ...(pi ? pi.notes : [])];
  if (pi && !pi.sfPi) {
    steps.push(['pi', ['install', SF_PI]]);
    after.push('In Pi, run `/sf-skills defaults install`, then `/sf-skills toggle` to pick what loads.');
  }
  if (picked.includes('sf-skills')) {
    const claude = harness !== 'other'
      && spawnSync('claude', ['--version'], { stdio: 'ignore', shell: process.platform === 'win32' }).status === 0;
    const plugin = claude && sfMode === 'plugin';
    if (plugin) {
      steps.push(['claude', ['plugin', 'marketplace', 'add', SF_SOURCE]]);
      // Reinstalling re-enables a plugin the builder disabled, so leave an installed one alone.
      if (sfInstalledHere()) after.push(`${SF_PLUGIN} is already installed for this repo; left as it is.`);
      else steps.push(['claude', ['plugin', 'install', SF_PLUGIN, '--scope', 'local']]);
      actions.push(['Add .claude/settings.local.json to .gitignore (if git would track it)', ignoreLocalSettings]);
      actions.push(['Turn on auto-update for the `salesforce` marketplace (if unset)', enableAutoUpdate]);
      after.push('More Salesforce plugins are in the `salesforce` marketplace: run `/plugin` in Claude Code. To use plain skills in Claude Code instead, re-run with `--sf-skills skills`.');
    } else if (claude) {
      after.push('Claude Code gets sf-skills as plain skills on this machine, in every folder. For the plugin instead: `--sf-skills plugin`.');
      if (sfEnabledHere()) after.push(`The ${SF_PLUGIN} plugin is still on for this repo, so its skills show twice: \`claude plugin disable ${SF_PLUGIN}\`.`);
    } else if (harness === 'claude') {
      after.push(`No Claude CLI here, so the ${SF_PLUGIN} plugin wasn't installed. In Claude Code, from this repo: \`/plugin marketplace add ${SF_SOURCE}\`, then \`/plugin install ${SF_PLUGIN}\` with local scope.`);
    }
    let agents = harness === 'claude' ? [] : Object.keys(OTHER_AGENTS).filter((a) => existsSync(OTHER_AGENTS[a]()));
    // Cursor loads Claude Code's plugins, a repo-scoped one included, so with the
    // plugin on here an npx copy for Cursor would list every sf skill twice there.
    const cursorFromPlugin = plugin && agents.includes('cursor');
    if (cursorFromPlugin) {
      agents = agents.filter((a) => a !== 'cursor');
      after.push(`Cursor gets sf-skills in this repo from the same ${SF_PLUGIN} plugin (it loads Claude Code's plugins, with Settings → Agents → Third-Party Imports on), so npx skips Cursor.`);
      actions.push(['Drop Cursor links to npx sf-skills (the plugin serves them)', () => dropClaudeLinks(join(homedir(), '.cursor', 'skills'), 'Cursor')]);
    }
    if (claude && !plugin) agents.unshift('claude-code');
    if (agents.length) steps.push(['npx', ['-y', SKILLS_CLI, 'add', SF_SKILLS_URL, '-g', '-a', ...agents, '--yes'], longPathsEnv()]);
    else if (harness !== 'claude' && !cursorFromPlugin) after.push(`No other agent found here (${Object.keys(OTHER_AGENTS).join(', ')}), so sf-skills wasn't installed for one. For another agent: \`npx ${SKILLS_CLI} add ${SF_SKILLS_URL} -g -a <agent>\`.`);
    // Also under --harness claude: links left by an earlier npx run still show the skills twice.
    if (plugin) actions.push(['Drop Claude Code links to npx sf-skills (the plugin serves them)', dropClaudeLinks]);
  }
  if (sfFlag) actions.push([`Remember --sf-skills ${sfFlag} for this machine`, () => rememberSfChoice(sfFlag)]);

  let skipNote = '';
  if (p.commit_skills === false) {
    const plugin = harness ? harness === 'claude' : pluginInstalled();
    if (plugin) skipNote = 'The ql-* skills come from the quantum-leap-launchpad plugin here, so none are installed. On another harness, re-run with --harness other.';
    else steps.push(['npx', ['-y', SKILLS_CLI, 'add', LAUNCHPAD_SKILLS, '--yes']]);
  }

  if (got['--dry-run']) {
    for (const [cmd, args] of steps) console.log([cmd, ...args].join(' '));
    for (const line of [skipNote, ...actions.map(([label]) => label), ...after].filter(Boolean)) console.log(`# ${line}`);
    process.exit(0);
  }

  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < NODE_MIN[0] || (major === NODE_MIN[0] && minor < NODE_MIN[1])) {
    console.error(`Node ${NODE_MIN.join('.')} or newer is needed; this is ${process.versions.node}.`);
    process.exit(1);
  }

  for (const [cmd, args, env] of steps) {
    console.log(`\n▶ ${[cmd, ...args].join(' ')}`);
    // npm, npx and pi are .cmd shims on Windows, which need a shell to run.
    const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32', ...(env ? { env } : {}) });
    if (r.status !== 0) {
      console.error(`\n✗ ${cmd} failed${r.error ? `: ${r.error.message}` : ''}. Fix it and re-run; finished steps are safe to repeat.`);
      process.exit(r.status || 1);
    }
  }
  for (const [label, act] of actions) {
    let line;
    try { line = act(); } catch { line = `Couldn't ${label.charAt(0).toLowerCase()}${label.slice(1)}; the installs above are done.`; }
    if (line) after.unshift(line);
  }
  console.log('\n✓ Setup done.');
  for (const line of [skipNote, ...after].filter(Boolean)) console.log(`  ${line}`);
}

// Run only when invoked directly, so the surface test can import FLAGS.
const invokedDirectly = () => { try { return !!process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; } };
if (invokedDirectly()) main();

export { FLAGS, parseArgs };
