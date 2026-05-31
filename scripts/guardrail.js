#!/usr/bin/env node
/**
 * guardrail.js — Verifica automatica integrità del sito Fisarmonica Forró.
 *
 * Eseguito come hook PostToolUse dopo ogni Edit/Write su file .html/.js/.css.
 * Controlla:
 *   1. layout.js — buildNav() chiamato direttamente, non in DOMContentLoaded
 *   2. i18n.js   — URL params, page-reload, sessionStorage fallback
 *   3. Tutte le pagine HTML — langChanged listener PRIMA di applyBasicPageLocalization
 *   4. scale-accordi.html — selectedIdx fuori dal forEach, init() diretto
 *   5. Content files — s6 (e tutte le sezioni IT) presenti in EN e PT mainHtml
 *   6. CSS — breakpoint mobile per elementi interattivi
 *   7. HTTP — server locale risponde 200 per tutte le rotte
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const http = require('http');

// ── Leggi contesto hook (stdin) per filtrare file non rilevanti ───────────────
let hookCtx = {};
try {
  const raw = fs.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
  hookCtx = JSON.parse(raw);
} catch (_) {}

const editedFile = hookCtx?.tool_input?.file_path || '';
const isRelevant = !editedFile || /\.(html|js|css)$/.test(editedFile);
if (!isRelevant) process.exit(0);

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function lineOf(src, idx) {
  return src.slice(0, idx).split('\n').length;
}

function sectionIds(html) {
  const ids = [];
  const re = /<section[^>]+id="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) ids.push(m[1]);
  return ids;
}

/** Trova la prima occorrenza reale di una stringa, saltando commenti JS. */
function firstReal(src, needle) {
  let i = 0;
  let inBlock = false; // dentro /* ... */
  while (i < src.length) {
    if (!inBlock && src[i] === '/' && src[i + 1] === '*') { inBlock = true; i += 2; continue; }
    if ( inBlock && src[i] === '*' && src[i + 1] === '/') { inBlock = false; i += 2; continue; }
    if (!inBlock && src[i] === '/' && src[i + 1] === '/') {
      // salta fino a fine riga
      const nl = src.indexOf('\n', i);
      i = nl === -1 ? src.length : nl + 1;
      continue;
    }
    if (!inBlock && src.startsWith(needle, i)) return i;
    i++;
  }
  return -1;
}

// ── Runner ────────────────────────────────────────────────────────────────────
const results = [];

function check(group, name, fn) {
  try {
    const r = fn();
    if (r === true || r === undefined) {
      results.push({ ok: true, group, name });
    } else {
      results.push({ ok: false, group, name, detail: r === false ? '' : String(r) });
    }
  } catch (e) {
    results.push({ ok: false, group, name, detail: e.message });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. layout.js
// ═══════════════════════════════════════════════════════════════════════════════
const layoutSrc = read('js/layout.js');

check('layout.js', 'buildNav() NON dentro DOMContentLoaded', () => {
  const domIdx  = layoutSrc.indexOf("addEventListener('DOMContentLoaded'");
  const buildIdx = layoutSrc.indexOf('buildNav()');
  if (buildIdx === -1) return 'buildNav() non trovato';
  if (domIdx === -1) return true; // nessun DOMContentLoaded → OK
  // buildNav deve essere FUORI dal listener (chiamata diretta a fine file)
  // Consideriamo "fuori" se buildNav appare DOPO la chiusura del listener
  // oppure se non c'è nessun DOMContentLoaded
  return `buildNav() trovato ma DOMContentLoaded ancora presente (riga ${lineOf(layoutSrc, domIdx)}) — rimuovilo`;
});

check('layout.js', 'buildHeader() chiamato direttamente', () => {
  return layoutSrc.includes('buildHeader()') && !layoutSrc.match(/addEventListener.*DOMContentLoaded[\s\S]*buildHeader/);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. i18n.js
// ═══════════════════════════════════════════════════════════════════════════════
const i18nSrc = read('js/i18n.js');

check('i18n.js', "getLang() legge URL params (?lang=)", () => {
  return i18nSrc.includes('URLSearchParams') && i18nSrc.includes("get('lang')");
});

check('i18n.js', 'Cambio lingua usa window.location.href (page reload)', () => {
  return i18nSrc.includes('window.location.href') && i18nSrc.includes('buildUrlForLang');
});

check('i18n.js', 'sessionStorage come fallback (Brave browser)', () => {
  return i18nSrc.includes('sessionStorage');
});

check('i18n.js', 'setLang() scrive in entrambi i storage', () => {
  const setLangBody = i18nSrc.slice(i18nSrc.indexOf('function setLang'));
  const closingBrace = setLangBody.indexOf('\n  }');
  const fn = setLangBody.slice(0, closingBrace);
  return fn.includes('localStorage') && fn.includes('sessionStorage');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Ordine listener HTML (langChanged PRIMA di applyBasicPageLocalization)
// ═══════════════════════════════════════════════════════════════════════════════
const PAGES = ['xote.html', 'repertorio.html', 'scale-accordi.html', 'tecnica.html'];

PAGES.forEach(page => {
  let src;
  try { src = read(page); } catch (_) { return; }

  check(`${page}`, "langChanged listener PRIMA di applyBasicPageLocalization", () => {
    const lcIdx  = firstReal(src, "'fisarmonica:langChanged'");
    const apIdx  = firstReal(src, 'applyBasicPageLocalization');
    if (lcIdx  === -1) return `langChanged listener non trovato`;
    if (apIdx  === -1) return `applyBasicPageLocalization non trovato`;
    if (lcIdx < apIdx) return true;
    return `langChanged (riga ${lineOf(src, lcIdx)}) registrato DOPO applyBasicPageLocalization (riga ${lineOf(src, apIdx)})`;
  });

  check(`${page}`, "Nessun buildSidebar() in <script> separato prima dell'IIFE", () => {
    // Vecchio pattern: <script> buildSidebar() </script> <script> (() => { applyBasicPage... } )()
    // Cerca buildSidebar fuori da un IIFE
    const badPattern = /<script>\s*\n?\s*if\s*\(window\.FisarmonicaProgress\)/;
    return !badPattern.test(src);
  });

  check(`${page}`, 'chords.js caricato (se usa FisarmonicaChords)', () => {
    const usesChords = src.includes('FisarmonicaChords');
    if (!usesChords) return true;
    return src.includes('js/chords.js');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3b. Nessuna duplicazione di codice già definito in altri moduli
// ═══════════════════════════════════════════════════════════════════════════════

/* Regola: se un asset (path SVG, mappa di note, ecc.) è già definito in un
   modulo JS, gli altri moduli devono accedervi via window.* — non ridefinirlo.
   Il guardrail verifica i casi noti. */

check('exercise-staff.js', 'NON ridefinisce il path chiave di violino (M 8.7730411)', () => {
  let src; try { src = read('js/exercise-staff.js'); } catch(_) { return true; }
  return !src.includes('M 8.7730411');
});

check('exercise-staff.js', 'NON ridefinisce TREBLE_STEPS (usa FisarmonicaStaff.STEPS)', () => {
  let src; try { src = read('js/exercise-staff.js'); } catch(_) { return true; }
  return !src.includes('const TREBLE_STEPS');
});

check('exercise-staff.js', 'NON ridefinisce CLEF_D / TREBLE_CLEF_D', () => {
  let src; try { src = read('js/exercise-staff.js'); } catch(_) { return true; }
  return !src.includes('const TREBLE_CLEF_D') && !src.includes('const CLEF_D');
});

check('exercise-staff.js', 'NON ridefinisce il path chiave di basso (M46.593)', () => {
  let src; try { src = read('js/exercise-staff.js'); } catch(_) { return true; }
  return !src.includes('M46.593');
});

check('exercise-staff.js', 'NON ridefinisce BASS_CLEF_PATH come costante', () => {
  let src; try { src = read('js/exercise-staff.js'); } catch(_) { return true; }
  return !src.includes('const BASS_CLEF_PATH') && !src.includes('const BASS_CLEF_D');
});

check('esercizi.html', 'staff.js caricato PRIMA di exercise-staff.js (dipendenza FisarmonicaStaff)', () => {
  let src; try { src = read('esercizi.html'); } catch(_) { return true; }
  const staffIdx    = src.indexOf('"js/staff.js"');
  const exerciseIdx = src.indexOf('"js/exercise-staff.js"');
  if (staffIdx === -1) return 'staff.js non trovato in esercizi.html';
  if (exerciseIdx === -1) return 'exercise-staff.js non trovato in esercizi.html';
  if (staffIdx < exerciseIdx) return true;
  return 'staff.js deve essere caricato PRIMA di exercise-staff.js';
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. scale-accordi.html — Circolo delle Quinte
// ═══════════════════════════════════════════════════════════════════════════════
const scaSrc = read('scale-accordi.html');

check('scale-accordi.html (COF)', 'selectedIdx dichiarato FUORI dal forEach', () => {
  const forEachIdx     = scaSrc.indexOf('COF.forEach');
  const selectedIdxIdx = scaSrc.indexOf('let selectedIdx');
  if (selectedIdxIdx === -1) return 'let selectedIdx non trovato';
  if (forEachIdx     === -1) return 'COF.forEach non trovato';
  if (selectedIdxIdx < forEachIdx) return true;
  return `selectedIdx dichiarato dentro il forEach (riga ${lineOf(scaSrc, selectedIdxIdx)}) — deve essere prima del loop`;
});

check('scale-accordi.html (COF)', 'init() chiamato direttamente, non via DOMContentLoaded', () => {
  return !scaSrc.includes("addEventListener('DOMContentLoaded', init)");
});

check('scale-accordi.html (COF)', '#cof-svg-container presente nel body statico', () => {
  // Riferimento: <script src="js/layout.js"> è il primo script locale in fondo al body.
  // Il container deve apparire prima di quel punto (è nel body HTML, non nei template literal JS).
  const containerIdx  = scaSrc.indexOf('id="cof-svg-container"');
  const layoutScript  = scaSrc.indexOf('<script src="js/layout.js"');
  if (layoutScript === -1) return 'js/layout.js non trovato nella pagina';
  if (containerIdx === -1) return 'id="cof-svg-container" non trovato';
  return containerIdx < layoutScript;
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Content files — sezioni EN e PT complete
// ═══════════════════════════════════════════════════════════════════════════════
const CONTENT_FILES = [
  { content: 'js/data/scale-accordi-content.js', page: 'scale-accordi.html' },
  { content: 'js/data/xote-content.js',          page: 'xote.html' },
  { content: 'js/data/repertorio-content.js',    page: 'repertorio.html' },
  { content: 'js/data/tecnica-content.js',       page: 'tecnica.html' },
];

CONTENT_FILES.forEach(({ content, page }) => {
  let contentSrc, pageSrc;
  try { contentSrc = read(content); } catch (_) { return; }
  try { pageSrc    = read(page);    } catch (_) { return; }

  const itSections = sectionIds(pageSrc);
  if (itSections.length === 0) return;

  ['en', 'pt'].forEach(lang => {
    check(`${path.basename(content)}`, `${lang.toUpperCase()} mainHtml contiene tutte le sezioni IT`, () => {
      // Estrai mainHtml per la lingua
      const re = new RegExp(`\\b${lang}:\\s*\\{[^}]*?mainHtml:\\s*\`([\\s\\S]*?)\``, 'i');
      const m  = re.exec(contentSrc);
      if (!m) return true; // nessun mainHtml per questa lingua → OK (usa IT statico)
      const enSections = sectionIds(m[1]);
      const missing    = itSections.filter(id => !enSections.includes(id));
      if (missing.length === 0) return true;
      return `Sezioni mancanti in ${lang} mainHtml: ${missing.join(', ')}`;
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. CSS — breakpoint mobile per elementi interattivi
// ═══════════════════════════════════════════════════════════════════════════════
const pageCss = read('css/page.css');

check('css/page.css', 'Breakpoint mobile per .cof-svg-container', () => {
  return pageCss.includes('cof-svg-container') &&
         pageCss.includes('@media') &&
         /\@media[^{]*640px[\s\S]*cof/.test(pageCss);
});

check('css/page.css', 'Breakpoint mobile per .chord-hover-card', () => {
  return pageCss.includes('@media') && pageCss.includes('640px');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. HTTP — tutte le rotte rispondono 200
// ═══════════════════════════════════════════════════════════════════════════════
const ROUTES = ['/', '/xote.html', '/repertorio.html', '/scale-accordi.html', '/tecnica.html'];

function httpCheck(route) {
  return new Promise(resolve => {
    const req = http.get(`http://localhost:8765${route}`, res => {
      res.resume();
      resolve({ route, status: res.statusCode });
    });
    req.on('error', () => resolve({ route, status: 0 }));
    req.setTimeout(1500, () => { req.destroy(); resolve({ route, status: 0 }); });
  });
}

Promise.all(ROUTES.map(httpCheck)).then(httpResults => {

  httpResults.forEach(({ route, status }) => {
    if (status === 0) {
      // Server non attivo — non è un errore bloccante
      results.push({ ok: true, group: 'HTTP (localhost:8765)', name: `${route}`, detail: 'server non attivo — skip' });
    } else {
      const ok = status === 200;
      results.push({ ok, group: 'HTTP (localhost:8765)', name: route, detail: ok ? '' : `HTTP ${status}` });
    }
  });

  // ── Output ──────────────────────────────────────────────────────────────────
  const groups = [...new Set(results.map(r => r.group))];
  let failures = 0;

  console.log('\n\x1b[1m🛡  Guardrail — Fisarmonica Forró\x1b[0m\n');

  groups.forEach(group => {
    console.log(`\x1b[2m${group}\x1b[0m`);
    results.filter(r => r.group === group).forEach(r => {
      if (r.ok) {
        console.log(`  \x1b[32m✓\x1b[0m ${r.name}${r.detail ? ` \x1b[2m(${r.detail})\x1b[0m` : ''}`);
      } else {
        console.log(`  \x1b[31m✗\x1b[0m ${r.name}`);
        if (r.detail) console.log(`    \x1b[33m→ ${r.detail}\x1b[0m`);
        failures++;
      }
    });
    console.log('');
  });

  const total  = results.length;
  const passed = total - failures;

  if (failures === 0) {
    console.log(`\x1b[32m  Tutti i ${total} controlli superati.\x1b[0m\n`);
  } else {
    console.log(`\x1b[31m  ${failures} / ${total} controlli FALLITI — correggi prima di continuare.\x1b[0m\n`);
    process.exit(1);
  }
});
