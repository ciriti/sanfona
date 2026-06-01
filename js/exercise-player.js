/* exercise-player.js — Playback con cursore visivo, metronomo e controllo BPM.
   Dipende da: Tone.js (CDN), svg._exerciseData (exercise-staff.js). */
(function () {
  'use strict';

  const GOLD_BRIGHT = 'rgba(255,220,80,1)';
  const GOLD_ORIG   = 'rgba(201,149,42,0.88)';
  const BG_ORIG     = '#1c1710';

  /* ── Synth condivisi (creati una sola volta al primo play) ──── */
  let noteSynth  = null;
  let clickSynth = null;
  let toneReady  = false;

  async function ensureSynths() {
    if (toneReady) return;
    if (typeof Tone === 'undefined') return;
    await Tone.start();
    noteSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope:   { attack: 0.04, decay: 0.15, sustain: 0.35, release: 0.5 },
      volume:     -8,
    }).toDestination();
    clickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.02, octaves: 3,
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
      volume:   -14,
    }).toDestination();
    toneReady = true;
  }

  /* ── Unico player attivo alla volta ─────────────────────────── */
  let active = null;

  /* ── Factory ─────────────────────────────────────────────────── */
  function buildPlayer(svg) {
    if (!svg?._exerciseData?.noteMap?.length) return null;
    const { noteMap, totalBeats, beatsPerMeasure } = svg._exerciseData;

    let part      = null;   /* Tone.Part corrente              */
    let metroLoop = null;   /* Tone.Loop metronomo             */
    let endTimer  = null;   /* timeout auto-stop               */
    let isPlay    = false;
    let metroOn   = false;

    /* puntatori ai bottoni del controllo */
    let playBtnEl  = null;
    let metroBtnEl = null;
    let bpmValEl   = null;

    /* ── Cursore SVG ─────────────────────────────────────────── */
    let cursor = null;
    function getCursor() {
      if (cursor) return cursor;
      cursor = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      cursor.setAttribute('stroke', 'rgba(255,220,80,0.75)');
      cursor.setAttribute('stroke-width', '2.5');
      cursor.setAttribute('stroke-linecap', 'round');
      cursor.style.display = 'none';
      svg.appendChild(cursor);
      return cursor;
    }
    function moveCursor({ nx, yOff }) {
      const c = getCursor();
      c.setAttribute('x1', nx); c.setAttribute('x2', nx);
      c.setAttribute('y1', yOff + 26); c.setAttribute('y2', yOff + 86);
      c.style.display = '';
    }

    /* ── Highlight ────────────────────────────────────────────── */
    const lit = new Set();
    function highlight(id) {
      const head = svg.querySelector(`[data-note-id="${id}"]`);
      const bg   = svg.querySelector(`[data-note-bg="${id}"]`);
      if (head) { head.setAttribute('fill', GOLD_BRIGHT); lit.add(head); }
      if (bg)   { bg.setAttribute('fill', 'rgba(80,55,0,0.25)'); lit.add(bg); }
    }
    function clearHighlights() {
      lit.forEach(el =>
        el.setAttribute('fill', el.hasAttribute('data-note-bg') ? BG_ORIG : GOLD_ORIG)
      );
      lit.clear();
    }

    /* ── Timing ─────────────────────────────────────────────────
       beatsToSec legge il BPM dal Transport al momento della chiamata,
       quindi rispetta i cambi di velocità fatti prima del play. */
    function beatsToSec(b) {
      return b * (60 / (Tone.Transport.bpm.value || 60));
    }

    /* ── Metronomo interno ───────────────────────────────────── */
    function startMetroLoop() {
      if (metroLoop) return;
      let beat = 0;
      metroLoop = new Tone.Loop((time) => {
        const down = (beat % beatsPerMeasure) === 0;
        clickSynth.triggerAttackRelease(down ? 'C2' : 'G1', '32n', time);
        beat++;
      }, '4n');
      metroLoop.start(0);
    }
    function stopMetroLoop() {
      if (!metroLoop) return;
      metroLoop.stop();
      metroLoop.dispose();
      metroLoop = null;
    }

    /* ── UI helpers ─────────────────────────────────────────── */
    function syncBpmDisplay() {
      if (!bpmValEl) return;
      /* Fallback al valore dello slider se Tone non è ancora caricato */
      const val = (typeof Tone !== 'undefined' && Tone.Transport?.bpm?.value)
        ? Math.round(Tone.Transport.bpm.value)
        : parseInt(document.getElementById('bpm-slider')?.value || '60', 10);
      bpmValEl.textContent = val;
    }
    function updateButtons() {
      if (playBtnEl) {
        playBtnEl.textContent = isPlay ? '⏹' : '▶';
        playBtnEl.classList.toggle('is-playing', isPlay);
      }
    }

    /* ── Play ────────────────────────────────────────────────────
       FIX: usa tempi RELATIVI al Transport (non tempi assoluti AudioContext).
       Questo garantisce che il play funzioni anche dopo uno stop completo,
       perché il Transport viene azzerato prima di ogni avvio. */
    async function play() {
      if (isPlay) { stop(); return; }
      if (typeof Tone === 'undefined') return;

      await ensureSynths();
      if (!noteSynth) return;

      /* ferma metronomo globale e altri player esercizio */
      if (window.FisarmonicaAudio) window.FisarmonicaAudio.stopActive();

      /* Reset completo del Transport — garantisce ripartenza pulita */
      Tone.Transport.stop();
      Tone.Transport.cancel();

      /* Tone.Part con tempi Transport-relativi in secondi */
      const events = noteMap.map(e => [beatsToSec(e.beatOffset), e]);
      part = new Tone.Part((time, e) => {
        const dur = beatsToSec(e.durationBeats) * (e.staccato ? 0.15 : 0.85);
        noteSynth.triggerAttackRelease(e.pitch, Math.max(dur, 0.05), time);

        /* Tone.Draw sincronizza gli aggiornamenti DOM con il frame audio */
        const draw = typeof Tone.getDraw === 'function' ? Tone.getDraw() : Tone.Draw;
        if (draw?.schedule) {
          draw.schedule(() => {
            if (!isPlay) return;
            clearHighlights();
            highlight(e.id);
            moveCursor(e);
          }, time);
        }
      }, events);

      part.start(0);                  /* inizia all'inizio del Transport */
      if (metroOn) startMetroLoop();  /* metronomo se abilitato          */
      Tone.Transport.start('+0.08'); /* avvia con 80 ms di latenza       */

      isPlay = true;
      updateButtons();

      /* auto-stop con margine per la release dell'ultimo accordo */
      const durMs = (beatsToSec(totalBeats) + 1.0) * 1000;
      endTimer = setTimeout(() => stop(), durMs);
    }

    /* ── Stop ────────────────────────────────────────────────────
       FIX: ferma e azzera il Transport — garantisce che il prossimo
       play.start(0) trovi il Transport al tick 0. */
    function stop() {
      if (part) { part.stop(Tone.now()); part.dispose(); part = null; }
      stopMetroLoop();
      if (endTimer) { clearTimeout(endTimer); endTimer = null; }

      if (typeof Tone !== 'undefined') {
        Tone.Transport.stop();   /* ferma E azzera la posizione a 0 */
        Tone.Transport.cancel(); /* annulla eventuali eventi residui */
      }

      clearHighlights();
      if (cursor) cursor.style.display = 'none';
      isPlay = false;
      updateButtons();
    }

    /* ── Toggle metronomo ────────────────────────────────────── */
    function toggleMetro() {
      metroOn = !metroOn;
      if (isPlay) {
        if (metroOn) startMetroLoop();
        else         stopMetroLoop();
      }
      if (metroBtnEl) metroBtnEl.classList.toggle('is-active', metroOn);
    }

    /* ── Controllo BPM ───────────────────────────────────────── */
    function changeBpm(delta) {
      if (typeof Tone === 'undefined') return;
      const next = Math.max(30, Math.min(200,
        Math.round(Tone.Transport.bpm.value) + delta));
      /* sincronizza con il sistema globale (audio.js) */
      if (window.FisarmonicaAudio) window.FisarmonicaAudio.updateBpm(next);
      const slider = document.getElementById('bpm-slider');
      if (slider) slider.value = next;
      syncBpmDisplay();
    }

    /* ── Monta i controlli nel DOM ───────────────────────────── */
    function mountControls(container, beforeEl) {
      const wrap = document.createElement('div');
      wrap.className = 'ex-player-controls';

      /* Pulsante Play / Stop */
      playBtnEl = mk('button', 'ex-play-btn', '▶', 'Play / Stop');
      playBtnEl.addEventListener('click', () => play());
      wrap.appendChild(playBtnEl);

      /* Pulsante Metronomo */
      metroBtnEl = mk('button', 'ex-metro-btn', '♩', 'Metronomo on/off');
      metroBtnEl.addEventListener('click', toggleMetro);
      wrap.appendChild(metroBtnEl);

      /* Controllo BPM */
      const bpmCtrl = document.createElement('div');
      bpmCtrl.className = 'ex-bpm-ctrl';

      const btnMinus = document.createElement('button');
      btnMinus.textContent = '−';
      btnMinus.addEventListener('click', () => changeBpm(-5));
      bpmCtrl.appendChild(btnMinus);

      bpmValEl = document.createElement('span');
      bpmValEl.className = 'ex-bpm-val';
      syncBpmDisplay();
      bpmCtrl.appendChild(bpmValEl);

      const btnPlus = document.createElement('button');
      btnPlus.textContent = '+';
      btnPlus.addEventListener('click', () => changeBpm(+5));
      bpmCtrl.appendChild(btnPlus);

      wrap.appendChild(bpmCtrl);

      /* Tieni il display BPM aggiornato quando lo slider della pagina cambia */
      const pageSlider = document.getElementById('bpm-slider');
      if (pageSlider) pageSlider.addEventListener('input', syncBpmDisplay);

      if (container && beforeEl) container.insertBefore(wrap, beforeEl);
      else if (container) container.appendChild(wrap);
    }

    return { play, stop, mountControls };
  }

  /* ── Helper DOM minimale ─────────────────────────────────────── */
  function mk(tag, cls, text, label) {
    const el = document.createElement(tag);
    el.className = cls;
    el.textContent = text;
    if (label) el.setAttribute('aria-label', label);
    return el;
  }

  window.FisarmonicaExercisePlayer = {
    createPlayer(svg) {
      const p = buildPlayer(svg);
      if (!p) return null;
      const origPlay = p.play;
      p.play = async () => {
        if (active && active !== p) active.stop();
        active = p;
        await origPlay();
      };
      return p;
    },
  };
})();
