/* bass-keyboard.js — SVG della tastiera dei bassi (sistema Stradella, lato mantice) */
(function () {
  'use strict';

  /* 12 colonne lungo il circolo delle quinte (sx → dx = +1 quinta).
     Per ogni colonna: nota di basso e relativo contrabbasso (3ª maggiore sopra).
     Nomi in solfeggio (italiano/portoghese); convertiti in lettere per l'inglese. */
  const COLUMNS = [
    { bass: 'Re♭', cb: 'Fa'   },
    { bass: 'La♭', cb: 'Do'   },
    { bass: 'Mi♭', cb: 'Sol'  },
    { bass: 'Si♭', cb: 'Re'   },
    { bass: 'Fa',  cb: 'La'   },
    { bass: 'Do',  cb: 'Mi', anchor: true },
    { bass: 'Sol', cb: 'Si'   },
    { bass: 'Re',  cb: 'Fa♯'  },
    { bass: 'La',  cb: 'Do♯'  },
    { bass: 'Mi',  cb: 'Sol♯' },
    { bass: 'Si',  cb: 'Re♯'  },
    { bass: 'Fa♯', cb: 'La♯'  },
  ];

  /* Le sei file dalla più vicina al mantice verso l'esterno, con suffisso mostrato nel bottone */
  const ROWS = [
    { key: 'cb',   suffix: '' },
    { key: 'bass', suffix: '' },
    { key: 'maj',  suffix: 'M' },
    { key: 'min',  suffix: 'm' },
    { key: 'dom',  suffix: 'S' },
    { key: 'dim',  suffix: 'd' },
  ];

  const ROW_TONE = {
    cb:   { stroke: '#caa24a', fill: 'rgba(201,149,42,0.12)' },
    bass: { stroke: '#e8b84b', fill: 'rgba(201,149,42,0.20)' },
    maj:  { stroke: '#5c8659', fill: 'rgba(92,134,89,0.14)'  },
    min:  { stroke: '#9a5fb0', fill: 'rgba(140,80,160,0.13)' },
    dom:  { stroke: '#b45a28', fill: 'rgba(180,90,40,0.15)'  },
    dim:  { stroke: '#9d8b75', fill: 'rgba(157,139,117,0.11)' },
  };

  const HEADINGS = {
    it: { count: '72 bassi', side: 'LATO MANTICE', fifth: '+ 5ª →' },
    en: { count: '72 bass',  side: 'BELLOWS SIDE', fifth: '+ 5th →' },
    pt: { count: '72 baixos', side: 'LADO DO FOLE', fifth: '+ 5ª →' },
  };

  const SYLLABLE_TO_LETTER = { Do: 'C', Re: 'D', Mi: 'E', Fa: 'F', Sol: 'G', La: 'A', Si: 'B' };

  function toLetterName(token) {
    const m = token.match(/^(Do|Re|Mi|Fa|Sol|La|Si)(.*)$/);
    if (!m) return token;
    return SYLLABLE_TO_LETTER[m[1]] + m[2];
  }

  function svgEl(name, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function render(container, lang) {
    if (!container) return;
    const useLetters = lang === 'en';
    const head = HEADINGS[lang] || HEADINGS.it;
    const noteName = (t) => (useLetters ? toLetterName(t) : t);

    const R = 19;          // raggio bottone
    const STEP = 50;       // passo orizzontale tra colonne
    const SHEAR = 25;      // sfalsamento orizzontale per fila (griglia diagonale)
    const ROWSTEP = 46;    // passo verticale tra file
    const LEFT = 24;
    const TOP = 52;
    const NCOL = COLUMNS.length;
    const NROW = ROWS.length;

    const cx = (ci, ri) => LEFT + R + ci * STEP + ri * SHEAR;
    const cy = (ri) => TOP + R + ri * ROWSTEP;

    const W = cx(NCOL - 1, NROW - 1) + R + 20;
    const H = cy(NROW - 1) + R + 16;

    const svg = svgEl('svg', {
      viewBox: `0 0 ${W} ${H}`,
      width: W,
      height: H,
      class: 'bass-keyboard-svg',
      role: 'img',
      'aria-label': 'Tastiera dei bassi Stradella, lato mantice, con le note delle sei file',
    });

    /* intestazioni */
    const c = svgEl('text', { x: 8, y: 22, 'font-size': 13, 'font-family': 'var(--font-display, serif)', fill: '#9d8b75' });
    c.textContent = head.count;
    svg.appendChild(c);

    const s = svgEl('text', { x: W / 2, y: 22, 'text-anchor': 'middle', 'font-size': 13, 'letter-spacing': '0.12em', 'font-family': 'var(--font-display, serif)', fill: '#c9952a' });
    s.textContent = head.side;
    svg.appendChild(s);

    const f = svgEl('text', { x: W - 12, y: 40, 'text-anchor': 'end', 'font-size': 9, 'font-family': 'monospace', fill: '#9d8b75' });
    f.textContent = head.fifth;
    svg.appendChild(f);

    /* bottoni — disegnati per fila così le righe inferiori si sovrappongono leggermente come sullo strumento */
    ROWS.forEach((row, ri) => {
      const tone = ROW_TONE[row.key];
      const y = cy(ri);
      COLUMNS.forEach((col, ci) => {
        const x = cx(ci, ri);

        /* anello esterno di riferimento sul basso Do */
        if (row.key === 'bass' && col.anchor) {
          svg.appendChild(svgEl('circle', { cx: x, cy: y, r: R + 3, fill: 'none', stroke: '#3a2e22', 'stroke-width': 2 }));
        }

        svg.appendChild(svgEl('circle', {
          cx: x, cy: y, r: R,
          fill: tone.fill,
          stroke: tone.stroke,
          'stroke-width': (row.key === 'bass' && col.anchor) ? 2.4 : 1.3,
        }));

        const noteTxt = row.key === 'cb' ? noteName(col.cb) : noteName(col.bass);
        const hasSuffix = !!row.suffix;

        const root = svgEl('text', {
          x: x, y: hasSuffix ? y - 1 : y + 4,
          'text-anchor': 'middle',
          'font-size': noteTxt.length > 2 ? 11 : 12.5,
          'font-family': 'var(--font-display, serif)',
          fill: '#f0e6d0',
          'font-weight': (row.key === 'bass' || row.key === 'cb') ? 600 : 500,
        });
        root.textContent = noteTxt;
        svg.appendChild(root);

        if (hasSuffix) {
          const suf = svgEl('text', {
            x: x, y: y + 11, 'text-anchor': 'middle',
            'font-size': 8, 'font-family': 'monospace', fill: tone.stroke,
          });
          suf.textContent = row.suffix;
          svg.appendChild(suf);
        }
      });
    });

    container.replaceChildren(svg);
  }

  window.FisarmonicaBassKeyboard = { render, COLUMNS, ROWS };
})();
