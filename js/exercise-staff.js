/* exercise-staff.js — Pentagramma multi-misura con chiave di basso/violino */
(function () {
  'use strict';

  const NS   = 'http://www.w3.org/2000/svg';
  const LS   = 12;         /* line spacing */
  const HS   = LS / 2;     /* half step  */
  const Y1   = 78;         /* y riga 1 (bassa) nel sistema locale */
  const Y5   = Y1 - 4*LS; /* y riga 5 (alta)  = 30 */
  const NRX  = 7;          /* nota: semi-asse orizzontale */
  const NRY  = 4.8;        /* nota: semi-asse verticale  */
  const GOLD = 'rgba(201,149,42,0.88)';
  const DIM  = 'rgba(201,149,42,0.42)';
  const BG   = '#1c1710';

  /* ─── Passi diatonici ─────────────────────────────────────── */

  /* Chiave di basso: passo 0 = riga 1 = G2 */
  const BASS_STEPS = {
    'E2':-2,'F2':-1,
    'G2':0,'A2':1,'B2':2,'C3':3,'D3':4,
    'E3':5,'F3':6,'G3':7,'A3':8,
    'B3':9,'C4':10,
    'Bb2':2,'Eb3':5,'Ab3':8,'F#3':6,
    'C#3':3,'G#3':7,'D#3':4,'Bb3':9,
  };

  /* Alterazioni chiave di basso */
  const BASS_ACC = {
    'Bb2':'♭','Eb3':'♭','Ab3':'♭','Bb3':'♭',
    'F#3':'♯','C#3':'♯','G#3':'♯','D#3':'♯',
  };

  /* Chiave di violino: STEPS e path vengono letti da window.FisarmonicaStaff
     (già definiti in staff.js). Non ridefinire qui. */

  /* ─── SVG helper ────────────────────────────────────────────── */

  function mk(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k,v]) => e.setAttribute(k,v));
    if (parent) parent.appendChild(e);
    return e;
  }

  function txt(content, attrs, parent) {
    const t = mk('text', attrs, parent);
    t.textContent = content;
    return t;
  }

  /* ─── Chiave di basso — usa FisarmonicaStaff (staff.js) ────────
     BASS_CLEF_D, BASS_CLEF_SCALE, BASS_CLEF_Y_OFFSET, BASS_CLEF_X_OFFSET
     sono definiti in staff.js (sorgente: Bass_Clef_34502_The_Noun_Project.svg).
     Non ridefinire il path qui. */
  function drawBassClef(svg, xOff, yOff) {
    const S = window.FisarmonicaStaff;
    if (!S || !S.BASS_CLEF_D) return;
    mk('path', {
      d: S.BASS_CLEF_D,
      transform: `translate(${xOff + S.BASS_CLEF_X_OFFSET},${yOff + S.BASS_CLEF_Y_OFFSET}) scale(${S.BASS_CLEF_SCALE})`,
      fill: GOLD, stroke: 'none',
    }, svg);
  }

  /* ─── Chiave di violino — usa FisarmonicaStaff (staff.js) ─────
     CLEF_D, CLEF_SCALE e CLEF_INNER sono già definiti lì.
     Non ridefinire il path qui: usa sempre window.FisarmonicaStaff. */
  function drawTrebleClef(svg, xOff, yOff) {
    const S = window.FisarmonicaStaff;
    if (!S || !S.CLEF_D) return;
    mk('path', {
      d: S.CLEF_D,
      transform: `translate(${xOff + 3},${yOff + 5.4}) scale(${S.CLEF_SCALE}) ${S.CLEF_INNER}`,
      fill: GOLD, stroke: 'none',
    }, svg);
  }

  /* ─── Righe del pentagramma ─────────────────────────────────── */
  function drawStaff(svg, x1, x2, yOff) {
    for (let i = 0; i < 5; i++) {
      const y = yOff + Y1 - i * LS;
      mk('line', { x1, y1:y, x2, y2:y, stroke:DIM, 'stroke-width':'1' }, svg);
    }
  }

  /* ─── Stanghette ─────────────────────────────────────────────── */
  function barLine(svg, x, yOff) {
    mk('line', { x1:x, y1:yOff+Y1+0.5, x2:x, y2:yOff+Y5-0.5,
                 stroke:DIM, 'stroke-width':'1.5' }, svg);
  }

  function doubleBarLine(svg, x, yOff) {
    mk('line', { x1:x-3, y1:yOff+Y1+0.5, x2:x-3, y2:yOff+Y5-0.5,
                 stroke:GOLD, 'stroke-width':'1' }, svg);
    mk('rect', { x, y:yOff+Y5-0.5, width:3,
                 height:(Y1-Y5+1), fill:GOLD }, svg);
  }

  /* ─── Segnatura di tempo ─────────────────────────────────────── */
  function drawTimeSig(svg, x, yOff, timeSig) {
    const [top, bot] = timeSig.split('/');
    const attr = {
      'text-anchor':'middle', 'font-size':'16',
      'font-family':'serif', 'font-weight':'700', fill:GOLD,
    };
    txt(top, { ...attr, x, y: yOff + Y1 - 3*LS + 6 }, svg); /* riga 4 */
    txt(bot, { ...attr, x, y: yOff + Y1 - 1*LS + 6 }, svg); /* riga 2 */
  }

  /* ─── Linee supplementari ───────────────────────────────────── */
  function drawLedgers(svg, nx, step, yOff) {
    if (step < -1) {
      const floor = (step % 2 === 0) ? step : step + 1;
      for (let s = -2; s >= floor; s -= 2) {
        const y = yOff + Y1 - s * HS;
        mk('line', { x1:nx-11, y1:y, x2:nx+12, y2:y,
                     stroke:GOLD, 'stroke-width':'1.5' }, svg);
      }
    }
    if (step > 9) {
      const ceil = (step % 2 === 0) ? step : step - 1;
      for (let s = 10; s <= ceil; s += 2) {
        const y = yOff + Y1 - s * HS;
        mk('line', { x1:nx-11, y1:y, x2:nx+12, y2:y,
                     stroke:GOLD, 'stroke-width':'1.5' }, svg);
      }
    }
  }

  /* ─── Nota ───────────────────────────────────────────────────── */
  function drawNote(svg, nx, step, yOff, dur, fingering, staccato, acc) {
    const ny = yOff + Y1 - step * HS;
    const MIDDLE = 4; /* riga 3 = D3 in basso / B4 in violino */

    drawLedgers(svg, nx, step, yOff);

    /* alterazione */
    if (acc) {
      txt(acc, {
        x: nx - NRX - 7, y: ny + 4,
        'text-anchor':'middle', 'font-size':'11',
        'font-family':'serif', fill:GOLD,
      }, svg);
    }

    const hollow = (dur !== 'quarter');

    if (hollow) {
      /* semibreve / minima: disco oro + ovale ritagliato */
      mk('ellipse', { cx:nx, cy:ny, rx:NRX, ry:NRY, fill:GOLD }, svg);
      mk('ellipse', { cx:nx, cy:ny + 0.5, rx:NRX - 3, ry:NRY - 2.2,
                      fill:BG, transform:`rotate(-18,${nx},${ny})` }, svg);
    } else {
      /* nera: ovale pieno */
      mk('ellipse', { cx:nx, cy:ny, rx:NRX, ry:NRY, fill:GOLD }, svg);
    }

    /* gambo (non per semibreve) */
    if (dur !== 'whole') {
      const up = step <= MIDDLE;
      const sx = up ? nx + NRX - 1 : nx - NRX + 1;
      const sy = up ? ny - 30 : ny + 30;
      mk('line', { x1:sx, y1:ny, x2:sx, y2:sy,
                   stroke:GOLD, 'stroke-width':'1.6' }, svg);
    }

    /* punto per note puntate */
    if (dur === 'dotted-half') {
      mk('circle', { cx:nx + NRX + 5, cy:ny - 1, r:'2.5', fill:GOLD }, svg);
    }

    /* punto staccato */
    if (staccato) {
      const up = step <= MIDDLE;
      const dotY = up ? ny + NRY + 5 : ny - NRY - 5;
      mk('circle', { cx:nx, cy:dotY, r:'2', fill:GOLD }, svg);
    }

    /* diteggiatura */
    if (fingering) {
      txt(String(fingering), {
        x:nx, y: yOff + Y1 + 18,
        'text-anchor':'middle', 'font-size':'9',
        'font-family':"'Courier New',monospace",
        fill:'rgba(157,139,117,0.8)',
      }, svg);
    }
  }

  /* ─── Pausa ──────────────────────────────────────────────────── */
  function drawRest(svg, nx, yOff, dur) {
    if (dur === 'whole') {
      /* Pausa intera: rettangolo appeso sotto riga 4 */
      const y = yOff + Y1 - 3 * LS; /* y riga 4 */
      mk('rect', { x:nx - 8, y:y, width:16, height:5, fill:GOLD }, svg);
    } else if (dur === 'half') {
      /* Pausa minima: rettangolo sopra riga 3 */
      const y = yOff + Y1 - 2 * LS - 5; /* riga 3, sopra */
      mk('rect', { x:nx - 8, y:y, width:16, height:5, fill:GOLD }, svg);
    } else if (dur === 'dotted-half') {
      const y = yOff + Y1 - 2 * LS - 5;
      mk('rect', { x:nx - 8, y:y, width:16, height:5, fill:GOLD }, svg);
      mk('circle', { cx:nx + 14, cy:y + 2, r:'2.5', fill:GOLD }, svg);
    } else if (dur === 'quarter') {
      /* Pausa nera: z-semplificata */
      const cy = yOff + Y1 - 2 * LS;
      const d = `M${nx-5},${cy-10} L${nx+5},${cy-5} L${nx-4},${cy+4} L${nx+5},${cy+10}`;
      mk('path', { d, stroke:GOLD, 'stroke-width':'1.5',
                   fill:'none', 'stroke-linecap':'round' }, svg);
    }
  }

  /* ─── Sistema (riga di misure) ──────────────────────────────── */
  /* Layout misure per il primo sistema (con chiave + segnatura di tempo):
     LEFT_BAR (4) + GAP (2) + CLEF_W (52) + TIMESIG_W (24) = 82 px di intestazione.
     I puntini della chiave di basso arrivano a ≈ cursor + 40,
     il segnatore di tempo inizia a cursor + CLEF_W → gap ≥ 12 px. */
  const LAYOUT = {
    LEFT_BAR:   4,
    GAP:        2,   /* spazio tra stanghetta sinistra e chiave */
    CLEF_W:    52,   /* larghezza riservata alla chiave (include i puntini) */
    TIMESIG_W: 24,   /* larghezza riservata al segnatore di tempo */
  };

  function renderSystem(svg, measures, yOff, clef, timeSig, isFirst, totalW, mW, stepMap, accMap) {
    const { LEFT_BAR, GAP, CLEF_W, TIMESIG_W } = LAYOUT;

    drawStaff(svg, LEFT_BAR, totalW - 2, yOff);
    mk('line', { x1:LEFT_BAR, y1:yOff+Y1+0.5, x2:LEFT_BAR, y2:yOff+Y5-0.5,
                 stroke:DIM, 'stroke-width':'2' }, svg);

    let cursor = LEFT_BAR + GAP;

    if (isFirst) {
      if (clef === 'bass') drawBassClef(svg, cursor, yOff);
      else                  drawTrebleClef(svg, cursor, yOff);
      cursor += CLEF_W;
      /* segnatore centrato nella propria area */
      drawTimeSig(svg, cursor + TIMESIG_W / 2, yOff, timeSig);
      cursor += TIMESIG_W;
    }

    measures.forEach((measureNotes, mi) => {
      const mStart = cursor;
      const slots  = measureNotes.length;

      measureNotes.forEach((n, ni) => {
        /* centra la nota/pausa nella sua "cella" all'interno della misura */
        const nx = mStart + (ni + 0.5) * (mW / slots);

        if (n.type === 'rest') {
          drawRest(svg, nx, yOff, n.duration);
        } else {
          const step = stepMap[n.pitch] ?? 0;
          const acc  = accMap[n.pitch] || null;
          drawNote(svg, nx, step, yOff, n.duration, n.fingering, n.staccato, acc);
        }
      });

      cursor += mW;

      const isLast = mi === measures.length - 1;
      if (isLast) doubleBarLine(svg, cursor, yOff);
      else        barLine(svg, cursor, yOff);
    });
  }

  /* ─── Funzione pubblica ─────────────────────────────────────── */

  /**
   * @param {object} config
   *   clef        'bass' | 'treble'
   *   timeSig     '4/4' | '3/4' | '2/4'
   *   measures    array di misure; ogni misura = array di { type, duration, pitch, fingering, staccato }
   *   measPerRow  misure per riga (default 4)
   */
  function createExerciseSVG(config) {
    const {
      clef       = 'bass',
      timeSig    = '4/4',
      measures   = [],
      measPerRow = 4,
    } = config;

    /* TREBLE_STEPS viene letto da window.FisarmonicaStaff.STEPS (staff.js). */
    const S       = window.FisarmonicaStaff;
    const stepMap = clef === 'bass' ? BASS_STEPS : (S ? S.STEPS : {});
    const accMap  = clef === 'bass' ? BASS_ACC   : (S ? S.ACC   : {});

    const numRows  = Math.ceil(measures.length / measPerRow);
    const SYS_H   = 125;   /* altezza sistema incl. spazio superiore per linee supplementari */
    const SVG_W   = 680;
    const TOP_PAD = 24;    /* spazio sopra per linee supplementari alte */

    /* larghezza disponibile per le misure — derivata da LAYOUT, mai hardcodata */
    const { LEFT_BAR, GAP, CLEF_W, TIMESIG_W } = LAYOUT;
    const FIRST_HDR  = LEFT_BAR + GAP + CLEF_W + TIMESIG_W; /* 4+2+52+24 = 82 */
    const SUBSEQ_HDR = LEFT_BAR + GAP;                       /* 4+2 = 6  */
    const firstMW  = (SVG_W - FIRST_HDR)  / measPerRow;
    const subseqMW = (SVG_W - SUBSEQ_HDR) / measPerRow;

    const svgH = TOP_PAD + numRows * SYS_H;

    const svg = mk('svg', {
      viewBox: `0 0 ${SVG_W} ${svgH}`,
      role: 'img',
      'aria-label': `Esercizio ${timeSig} - chiave di ${clef === 'bass' ? 'basso' : 'violino'}`,
    });
    svg.style.cssText = 'width:100%;display:block;';

    for (let row = 0; row < numRows; row++) {
      const yOff     = TOP_PAD + row * SYS_H;
      const rowMeas  = measures.slice(row * measPerRow, (row + 1) * measPerRow);
      const mW       = row === 0 ? firstMW : subseqMW;

      renderSystem(svg, rowMeas, yOff, clef, timeSig, row === 0, SVG_W, mW, stepMap, accMap);
    }

    return svg;
  }

  window.FisarmonicaExercise = { createExerciseSVG };
})();
