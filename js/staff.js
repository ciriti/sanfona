/* staff.js — SVG pentagramma con chiave di violino e note */
(function () {
  'use strict';

  const LS = 12;   /* line spacing */
  const HS = LS / 2; /* half-step (line→space) */

  /* y di ogni riga del pentagramma (chiave di violino) */
  const Y1 = 88;  /* riga 1 = E4 */
  const Y5 = 40;  /* riga 5 = F5 */
  const SVG_H = 120;
  const CLEF_W = 46; /* spazio riservato alla chiave */
  const NRX = 7.5;   /* nota: semi-asse orizzontale */
  const NRY = 4.8;   /* nota: semi-asse verticale   */

  /* Passi diatonici dalla riga 1 (E4 = passo 0).
     Positivi = in su (y decresce), negativi = in giù (y cresce).
     Regola: i diesis stanno sulla riga/spazio della nota naturale INFERIORE (es. F#→F),
             i bemolle stanno sulla riga/spazio della nota naturale SUPERIORE (es. Bb→B). */
  const STEPS = {
    'G3':-5,'A3':-4,'B3':-3,'C4':-2,'D4':-1,
    'E4':0,'F4':1,'G4':2,'A4':3,'B4':4,
    'C5':5,'D5':6,'E5':7,'F5':8,
    'G5':9,'A5':10,'B5':11,
    /* diesis: stessa riga/spazio della nota naturale sotto */
    'C#4':-2,'D#4':-1,'F#4':1,'G#4':2,'A#4':3,
    'C#5':5,'D#5':6,'F#5':8,'G#5':9,
    /* bemolle: stessa riga/spazio della nota naturale sopra */
    'Db4':-1,'Eb4':0,'Gb4':2,'Ab4':3,'Bb4':4,
    'Db5':6,'Eb5':7,'Gb5':9,'Ab5':10,'Bb5':11,
    'Bb3':-3,
  };

  const ACC = {
    'C#4':'♯','D#4':'♯','F#4':'♯','G#4':'♯','A#4':'♯',
    'C#5':'♯','D#5':'♯','F#5':'♯','G#5':'♯',
    'Db4':'♭','Eb4':'♭','Gb4':'♭','Ab4':'♭','Bb4':'♭',
    'Db5':'♭','Eb5':'♭','Gb5':'♭','Ab5':'♭','Bb5':'♭',
    'Bb3':'♭',
  };

  /* Chiave di violino — path da Chiave_di_violino_piccola.svg (Inkscape, pubblico dominio).
     Il file SVG originale è 18×43 pt con un gruppo translate(-0.767,-1.526).
     Transform applicato: translate(5,15.4) scale(2.12) translate(-0.767,-1.526)
       → la riga G4 (y=76 nel nostro staff) corrisponde al punto (8.77,30.13) del path
         che dopo la trasformazione finisce a y ≈ 76.  */
  const CLEF_D = 'M 8.7730411,30.128833 C 6.5600628,28.815541 6.8544948,24.993919 9.222717,24.010019 C 12.043182,21.916392 16.663398,25.131791 15.605969,28.506152 C 14.218057,32.88731 7.5728028,34.174686 4.6690278,30.600616 C 2.2911251,27.740864 3.0491617,23.097214 5.8655388,20.809681 C 8.9520581,16.924082 12.738146,13.212042 13.868442,8.2016868 C 14.168213,6.3491224 13.585127,4.2003341 11.946314,3.1349053 C 9.843128,2.5716614 7.8124548,4.7785698 8.1070868,6.8269758 C 7.1177088,14.321941 9.329485,21.695938 11.132476,28.888516 C 11.999067,32.52301 13.062129,36.22785 12.66972,40.003004 C 12.06073,42.001356 8.8122631,42.193525 8.0464778,40.216718 C 7.3251358,38.68666 10.755372,38.630299 9.566929,36.859369 C 8.8479561,35.13024 6.2551558,36.286985 5.8801208,37.749164 C 4.9440598,40.824202 8.5406588,43.942852 11.481446,42.744306 C 13.584992,41.792679 14.197968,39.14739 13.975264,37.035791 C 13.619436,34.327062 12.803272,31.701939 12.206353,29.039021 C 10.452095,22.012165 8.6541531,14.777915 9.492918,7.4829238 C 9.382672,5.3732745 12.613034,4.6283713 12.821979,7.0206048 C 13.164004,8.6994498 12.058815,10.141384 11.387909,11.579846 C 9.519577,14.949227 6.6424678,17.570778 4.0019568,20.313473 C 1.6750434,23.181155 0.64357401,27.662253 2.8943723,30.862286 C 6.1209338,35.319936 13.81026,35.237439 16.828356,30.584771 C 18.432525,28.235916 18.282003,24.701438 15.991879,22.836437 C 13.590081,20.622459 9.305786,20.612983 7.2431718,23.303065 C 5.7117218,25.012215 5.1308558,28.09652 7.0514998,29.740977 C 7.5391078,30.095352 8.1776658,30.280004 8.7730411,30.128833 z';
  const CLEF_TRANSFORM = 'translate(5,15.4) scale(2.12) translate(-0.7673966,-1.5263084)';

  const NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }

  function noteY(name) {
    const s = STEPS[name];
    return s !== undefined ? Y1 - s * HS : null;
  }

  /* Restituisce le y delle linee supplementari da disegnare. */
  function ledgers(name) {
    const s = STEPS[name];
    if (s === undefined) return [];
    const out = [];
    if (s < -1) {
      const floor = (s % 2 === 0) ? s : s + 1;
      for (let i = -2; i >= floor; i -= 2) out.push(Y1 - i * HS);
    }
    if (s > 9) {
      const ceil = (s % 2 === 0) ? s : s - 1;
      for (let i = 10; i <= ceil; i += 2) out.push(Y1 - i * HS);
    }
    return out;
  }

  /**
   * Crea un SVG di pentagramma.
   * @param {object} opts
   *   notes    {string[]}  nomi delle note, es. ['C4','E4','G4']
   *   label    {string}    testo sotto il pentagramma
   *   width    {number}    larghezza SVG (default 190)
   *   duration {string}    'whole'|'half'|'quarter' (default 'whole')
   *   mode     {string}    'chord' (impilate) | 'scale' (orizzontale)
   */
  function createStaffSVG({ notes = [], label = '', width = 190,
                            duration = 'whole', mode = 'chord' }) {
    const svg = el('svg', {
      viewBox: `0 0 ${width} ${SVG_H}`,
      role: 'img',
      'aria-label': label || 'Pentagramma',
    });
    svg.style.cssText = 'width:100%;max-width:' + width + 'px;display:block;';

    const GOLD   = 'rgba(201,149,42,0.88)';
    const DIM    = 'rgba(201,149,42,0.45)';
    const BG     = '#1e1812'; /* colore sfondo per note aperte */

    /* ── 1. Righe del pentagramma ── */
    for (let i = 0; i < 5; i++) {
      const y = Y1 - i * LS;
      svg.appendChild(el('line', { x1:2, y1:y, x2:width-4, y2:y,
                                   stroke:DIM, 'stroke-width':'1' }));
    }
    /* stanghetta sinistra */
    svg.appendChild(el('line', { x1:2, y1:Y1, x2:2, y2:Y5,
                                  stroke:DIM, 'stroke-width':'2' }));

    /* ── 2. Chiave di violino ── */
    svg.appendChild(el('path', {
      d: CLEF_D,
      transform: CLEF_TRANSFORM,
      fill: GOLD,
      stroke: 'none',
    }));

    /* ── 3. Note ── */
    const startX = CLEF_W + 20;
    const stepX  = mode === 'scale' ? 22 : 0; /* spazio orizzontale per scala */

    notes.forEach((name, idx) => {
      const y = noteY(name);
      if (y === null) return;
      const nx = startX + idx * stepX;

      /* linee supplementari */
      ledgers(name).forEach(ly => {
        svg.appendChild(el('line', {
          x1: nx - 12, y1: ly, x2: nx + 13, y2: ly,
          stroke: GOLD, 'stroke-width': '1.5',
        }));
      });

      /* alterazione */
      const acc = ACC[name];
      if (acc) {
        const t = el('text', {
          x: nx - NRX - 7, y: y + 4,
          'text-anchor': 'middle', 'font-size': '11',
          'font-family': 'serif', fill: GOLD,
        });
        t.textContent = acc;
        svg.appendChild(t);
      }

      /* testa della nota */
      if (duration === 'whole') {
        /* semibreve: ovale aperto (disco+buco) */
        svg.appendChild(el('ellipse', {
          cx:nx, cy:y, rx:NRX, ry:NRY, fill:GOLD }));
        svg.appendChild(el('ellipse', {
          cx:nx, cy:y+0.5, rx:NRX-3, ry:NRY-2.2,
          fill:BG, transform:`rotate(-18,${nx},${y})` }));
      } else {
        /* metà/quarto: ovale pieno o aperto + gambo */
        const filled = duration === 'quarter';
        svg.appendChild(el('ellipse', {
          cx:nx, cy:y, rx:NRX, ry:NRY,
          fill: filled ? GOLD : BG,
          stroke: GOLD, 'stroke-width': '1.8',
        }));
        /* gambo: verso l'alto se nota sotto la riga centrale */
        const up = y > 64;
        const sx = up ? nx + NRX - 1 : nx - NRX + 1;
        const sy = up ? y - 30 : y + 30;
        svg.appendChild(el('line', {
          x1:sx, y1:y, x2:sx, y2:sy,
          stroke:GOLD, 'stroke-width':'1.6',
        }));
      }
    });

    /* ── 4. Etichetta ── */
    if (label) {
      const t = el('text', {
        x: width / 2, y: SVG_H - 5,
        'text-anchor': 'middle', 'font-size': '10',
        'font-family': "'Courier New',monospace",
        fill: 'rgba(157,139,117,0.8)',
      });
      t.textContent = label;
      svg.appendChild(t);
    }

    return svg;
  }

  /* ── Chiave di violino: costanti di trasformazione ──────────────
     Non ridefinire CLEF_D o CLEF_SCALE altrove — usare questi riferimenti. */
  const CLEF_SCALE = 2.12;
  const CLEF_INNER = 'translate(-0.7673966,-1.5263084)';

  /* ── Chiave di basso — da Bass_Clef_(34502)_-_The_Noun_Project.svg
     (The Noun Project, CC BY 3.0 / pubblico dominio, fill originale #000000).
     viewBox: 0 0 90 90. Il path contiene 3 subpath: corpo + 2 puntini.
     Puntino superiore SVG y=15.053 → riga locale 36 (spazio tra riga 4 e 5).
     Puntino inferiore SVG y=39.731 → riga locale 48 (spazio tra riga 3 e 4).
     Scale = 12 / (39.731 - 15.053) = 12 / 24.678 ≈ 0.4864.
     ty    = 36 − 15.053 × 0.4864 ≈ 28.68.                            */
  const BASS_CLEF_D =
    'M46.593,1.814c16.429,6.061,22.84,20.793,18.019,36.615' +
    'c-4.08,13.392-12.446,23.87-23.83,31.962' +
    'C30.29,77.849,18.962,83.849,7.427,89.48' +
    'c-0.507,0.247-1.605,0.185-1.874-0.162c-0.637-0.824-0.321-1.557,0.657-2.236' +
    'c6.66-4.617,13.521-8.995,19.826-14.061c13.186-10.593,21.679-24.134,23.958-41.147' +
    'c0.693-5.175,0.587-10.387-0.781-15.466c-1.404-5.217-4.386-8.989-8.422-10.997' +
    'c-2.274-1.131-4.882-1.687-7.731-1.656C28.22,3.807,24.553,5.23,24.553,5.23' +
    'c-4.075,1.094-7.962,4.981-9.387,8.493c-0.759,1.872,0.258,3.629,2.275,3.713' +
    'c0.851,0.035,1.756-0.127,2.566-0.405c5.805-1.997,11.434,1.629,12.717,6.635' +
    'c1.288,5.026-2.253,10.349-7.873,11.829c-7.101,1.871-14.661-2.16-16.414-9.089' +
    'c-1.289-5.096,0.289-9.794,3.124-14.09c4.377-6.632,10.97-9.698,18.415-11.333' +
    'C36.121-0.366,44.489,1.037,46.593,1.814z' +
    'M70.673,39.731c0.015,3.575,2.657,6.239,6.177,6.23' +
    'c3.44-0.009,6.187-2.816,6.165-6.3c-0.022-3.39-2.741-6.095-6.146-6.114' +
    'C73.325,33.527,70.658,36.189,70.673,39.731z' +
    'M70.674,15.053c0.011,3.585,2.621,6.221,6.16,6.221' +
    'c3.455,0,6.185-2.765,6.179-6.257c-0.006-3.385-2.707-6.075-6.127-6.102' +
    'C73.313,8.887,70.663,11.505,70.674,15.053z';
  const BASS_CLEF_SCALE    = 12 / 24.678; /* ≈ 0.4864 */
  const BASS_CLEF_Y_OFFSET = 36 - 15.053 * (12 / 24.678); /* ≈ 28.68 */
  const BASS_CLEF_X_OFFSET = 0;  /* il bordo sinistro del corpo del path inizia già vicino a x=0 */

  window.FisarmonicaStaff = {
    createStaffSVG, noteY, STEPS, ACC,
    /* chiave di violino */
    CLEF_D, CLEF_SCALE, CLEF_INNER,
    /* chiave di basso */
    BASS_CLEF_D, BASS_CLEF_SCALE, BASS_CLEF_Y_OFFSET, BASS_CLEF_X_OFFSET,
  };
})();
