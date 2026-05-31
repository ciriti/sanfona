/* chords.js — Diagrammi SVG: piano keyboard + Stradella */
(function () {
  'use strict';

  /* ── Chord note definitions ── */
  const CHORD_NOTES_MAP = {
    'C':   ['C','E','G'],
    'Cm':  ['C','Eb','G'],
    'C7':  ['C','E','G','Bb'],
    'Cm7': ['C','Eb','G','Bb'],
    'D':   ['D','F#','A'],
    'Dm':  ['D','F','A'],
    'D7':  ['D','F#','A','C'],
    'Dm7': ['D','F','A','C'],
    'E':   ['E','G#','B'],
    'Em':  ['E','G','B'],
    'E7':  ['E','G#','B','D'],
    'Em7': ['E','G','B','D'],
    'F':   ['F','A','C'],
    'Fm':  ['F','Ab','C'],
    'F7':  ['F','A','C','Eb'],
    'F#':  ['F#','A#','C#'],
    'F#m': ['F#','A','C#'],
    'G':   ['G','B','D'],
    'Gm':  ['G','Bb','D'],
    'G7':  ['G','B','D','F'],
    'Am':  ['A','C','E'],
    'A':   ['A','C#','E'],
    'A7':  ['A','C#','E','G'],
    'A7m': ['A','C','E','G'],
    'Bm':  ['B','D','F#'],
    'B7':  ['B','D#','F#','A'],
    'Bb':  ['Bb','D','F'],
    'Bbm': ['Bb','Db','F'],
    'C#m': ['C#','E','G#'],
    'G#m': ['G#','B','D#'],
    'Eb':  ['Eb','G','Bb'],
    'Ab':  ['Ab','C','Eb'],
  };

  /* note to semitone within octave */
  const NOTE_SEMITONE = {
    'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,
    'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,
    'Ab':8,'A':9,'A#':10,'Bb':10,'B':11
  };

  const WHITE_KEYS = ['C','D','E','F','G','A','B'];
  const BLACK_KEYS_POS = { 'C#':0.65, 'D#':1.65, 'F#':3.65, 'G#':4.65, 'A#':5.65 };

  function noteToSemitone(n) { return NOTE_SEMITONE[n] ?? -1; }

  /* Create SVG piano keyboard showing chord tones highlighted */
  function createPianoKeyboardSvg(chordName) {
    const notes = CHORD_NOTES_MAP[chordName] || [];
    const noteSet = new Set(notes.map(n => noteToSemitone(n)));

    const OCTAVES = 2;
    const KEY_W = 18;
    const KEY_H = 60;
    const BK_W = 12;
    const BK_H = 38;
    const totalW = WHITE_KEYS.length * OCTAVES * KEY_W;
    const totalH = KEY_H + 4;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
    svg.setAttribute('width', totalW);
    svg.setAttribute('height', totalH);
    svg.classList.add('piano-keyboard-svg');
    svg.setAttribute('aria-label', `Tastiera accordo ${chordName}`);

    /* white keys */
    for (let oct = 0; oct < OCTAVES; oct++) {
      WHITE_KEYS.forEach((note, i) => {
        const semitone = noteToSemitone(note);
        const highlighted = noteSet.has(semitone);
        const x = (oct * WHITE_KEYS.length + i) * KEY_W;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x + 1);
        rect.setAttribute('y', 2);
        rect.setAttribute('width', KEY_W - 2);
        rect.setAttribute('height', KEY_H - 2);
        rect.setAttribute('rx', 3);
        rect.setAttribute('fill', highlighted ? '#e8b84b' : '#f0e6d0');
        rect.setAttribute('stroke', '#3a2e22');
        rect.setAttribute('stroke-width', '1');
        svg.appendChild(rect);
      });
    }

    /* black keys */
    for (let oct = 0; oct < OCTAVES; oct++) {
      Object.entries(BLACK_KEYS_POS).forEach(([note, pos]) => {
        const semitone = noteToSemitone(note);
        const highlighted = noteSet.has(semitone);
        const x = (oct * WHITE_KEYS.length + pos) * KEY_W;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x + 1);
        rect.setAttribute('y', 2);
        rect.setAttribute('width', BK_W);
        rect.setAttribute('height', BK_H);
        rect.setAttribute('rx', 2);
        rect.setAttribute('fill', highlighted ? '#c9952a' : '#1a1410');
        rect.setAttribute('stroke', '#0f0b08');
        rect.setAttribute('stroke-width', '1');
        svg.appendChild(rect);
      });
    }

    /* note labels on highlighted white keys */
    for (let oct = 0; oct < OCTAVES; oct++) {
      WHITE_KEYS.forEach((note, i) => {
        const semitone = noteToSemitone(note);
        if (!noteSet.has(semitone)) return;
        const x = (oct * WHITE_KEYS.length + i) * KEY_W + KEY_W / 2;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', KEY_H - 6);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '8');
        text.setAttribute('font-family', 'monospace');
        text.setAttribute('fill', '#0f0b08');
        text.textContent = note;
        svg.appendChild(text);
      });
    }

    return svg;
  }

  /* ── Stradella bass system diagram ── */

  /* Standard Stradella layout (6 cols × 5 rows) — a central slice of the full 120-bass system */
  /* Columns: Counterbass / Bass / Major / Minor / Dom7 / Dim7 */
  /* Rows (relative to C): Eb, Bb, F, C, G, D, A, E, B, F# — we show 5 rows around C */
  const STRADELLA_ROWS = [
    { note: 'Bb', bass: 'Bb', maj: 'Bb', min: 'Bbm', dom: 'Bb7', dim: 'Bbdim' },
    { note: 'F',  bass: 'F',  maj: 'F',  min: 'Fm',  dom: 'F7',  dim: 'Fdim'  },
    { note: 'C',  bass: 'C',  maj: 'C',  min: 'Cm',  dom: 'C7',  dim: 'Cdim', anchor: true },
    { note: 'G',  bass: 'G',  maj: 'G',  min: 'Gm',  dom: 'G7',  dim: 'Gdim'  },
    { note: 'D',  bass: 'D',  maj: 'D',  min: 'Dm',  dom: 'D7',  dim: 'Ddim'  },
    { note: 'A',  bass: 'A',  maj: 'A',  min: 'Am',  dom: 'A7',  dim: 'Adim'  },
    { note: 'E',  bass: 'E',  maj: 'E',  min: 'Em',  dom: 'E7',  dim: 'Edim'  },
  ];

  const COL_LABELS = ['CB', 'B', 'M', 'm', '7', '°'];

  function createStradellaDiagram(chordName) {
    const CELL = 30;
    const GAP  = 3;
    const COLS = 6;
    const ROWS = STRADELLA_ROWS.length;
    const W = COLS * (CELL + GAP) - GAP;
    const H = ROWS * (CELL + GAP) - GAP + 18;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.classList.add('stradella-svg');
    svg.setAttribute('aria-label', `Sistema Stradella per ${chordName}`);

    /* column headers */
    COL_LABELS.forEach((lbl, ci) => {
      const x = ci * (CELL + GAP) + CELL / 2;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', 11);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '8');
      text.setAttribute('font-family', 'monospace');
      text.setAttribute('fill', '#9d8b75');
      text.textContent = lbl;
      svg.appendChild(text);
    });

    STRADELLA_ROWS.forEach((row, ri) => {
      const cols = [row.note, row.bass, row.maj, row.min, row.dom, row.dim];
      cols.forEach((cellLabel, ci) => {
        const x = ci * (CELL + GAP);
        const y = 16 + ri * (CELL + GAP);

        /* determine if this cell is targeted */
        const isTarget = isStradellaHighlight(chordName, row, ci);
        const isAnchor = row.anchor && ci === 2;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', CELL);
        rect.setAttribute('height', CELL);
        rect.setAttribute('rx', CELL / 2);
        rect.setAttribute('fill', isTarget ? 'rgba(201,149,42,0.25)' : 'rgba(26,20,16,0.8)');
        rect.setAttribute('stroke', isTarget ? '#c9952a' : isAnchor ? '#e8b84b' : '#3a2e22');
        rect.setAttribute('stroke-width', isTarget ? '2' : isAnchor ? '1.5' : '1');
        svg.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + CELL / 2);
        text.setAttribute('y', y + CELL / 2 + 3);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '7');
        text.setAttribute('font-family', 'monospace');
        text.setAttribute('fill', isTarget ? '#c9952a' : '#9d8b75');
        text.textContent = cellLabel;
        svg.appendChild(text);
      });
    });

    return svg;
  }

  function isStradellaHighlight(chordName, row, colIndex) {
    const lower = chordName.toLowerCase().replace('#','#');
    const rowNote = row.note.toLowerCase();
    const rootNote = chordName.replace(/m7|dim|aug|7|m/i,'').toLowerCase().replace('#','#');

    if (rootNote !== rowNote) return false;

    if (colIndex === 1) {
      /* bass note: match simple root like "G", "C" */
      return /^[A-G]#?b?$/.test(chordName);
    }
    if (colIndex === 2) return /^[A-G]#?b?$/.test(chordName) || chordName === row.maj;
    if (colIndex === 3) return /m$/.test(chordName) && !/dim/.test(chordName) && !/7/.test(chordName);
    if (colIndex === 4) return /7/.test(chordName) && !/dim/.test(chordName) && !/m7/.test(chordName);
    if (colIndex === 5) return /dim/.test(chordName);

    return false;
  }

  /* ── Hover card system ── */
  function createHoverCardSystem(options) {
    options = options || {};
    const renderDiagram = options.renderDiagram;

    let card = document.getElementById('chord-hover-card');
    if (!card) {
      card = document.createElement('div');
      card.id = 'chord-hover-card';
      card.className = 'chord-hover-card';
      const nameEl = document.createElement('div');
      nameEl.className = 'chord-hover-card-name';
      card.appendChild(nameEl);
      const diagramEl = document.createElement('div');
      diagramEl.className = 'chord-hover-card-diagram';
      card.appendChild(diagramEl);
      document.body.appendChild(card);
    }

    function show(pill, chord, pos) {
      const nameEl = card.querySelector('.chord-hover-card-name');
      const diagramEl = card.querySelector('.chord-hover-card-diagram');
      if (nameEl) nameEl.textContent = chord.name || chord;
      if (diagramEl && renderDiagram) {
        renderDiagram(diagramEl, chord);
      }
      position(pos.x, pos.y);
      card.classList.add('is-visible');
    }

    function hide() {
      card.classList.remove('is-visible');
    }

    function position(x, y) {
      const margin = 12;
      const cardW = card.offsetWidth || 200;
      const cardH = card.offsetHeight || 200;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = x + margin;
      let top = y - cardH / 2;

      if (left + cardW > vw) left = x - cardW - margin;
      if (top < margin) top = margin;
      if (top + cardH > vh - margin) top = vh - cardH - margin;

      card.style.left = left + 'px';
      card.style.top = top + 'px';
    }

    return { show, hide, position };
  }

  window.FisarmonicaChords = {
    createPianoKeyboardSvg,
    createStradellaDiagram,
    createHoverCardSystem,
    CHORD_NOTES_MAP,
  };
})();
