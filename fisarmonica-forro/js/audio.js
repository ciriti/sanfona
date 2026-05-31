/* audio.js — Tone.js playback, BPM, chord strips, metronomo con preset ritmici */
(function () {
  'use strict';

  /* ── Chord note definitions for Tone.js ── */
  const CHORD_NOTES = {
    G:   'G3,B3,D4,G4',
    C:   'C3,E3,G3,C4',
    D7:  'D3,F#3,A3,C4',
    Em:  'E3,G3,B3,E4',
    Am:  'A3,C4,E4,A4',
    E7:  'E3,G#3,B3,D4',
    D:   'D3,F#3,A3,D4',
    A7:  'A3,C#4,E4,G4',
    F:   'F3,A3,C4,F4',
    Bm:  'B3,D4,F#4,B4',
    B7:  'B3,D#4,F#4,A4',
    Dm:  'D3,F3,A3,D4',
    'F#': 'F#3,A#3,C#4,F#4',
    'C#m': 'C#3,E3,G#3,C#4',
    'G#m': 'G#3,B3,D#4,G#4',
    'F#m': 'F#3,A3,C#4,F#4',
    Bb:  'A#3,D4,F4,A#4',
    Gm:  'G3,A#3,D4,G4',
    Cm:  'C3,Eb3,G3,C4',
    Fm:  'F3,Ab3,C4,F4',
    A:   'A3,C#4,E4,A4',
    E:   'E3,G#3,B3,E4',
    G7:  'G3,B3,D4,F4',
    C7:  'C3,E3,G3,Bb3',
    F7:  'F3,A3,C4,Eb4',
  };

  /* ── Rhythm presets ── */
  const RHYTHM_PRESETS = {
    xote: {
      label: 'Xote',
      bpm: 80,
      /* 2/4: basso sul 1, accordo sul 2 */
      pattern: [
        { time: 0,   type: 'bass',  vol: 1.0 },
        { time: 0.5, type: 'chord', vol: 0.7 },
      ]
    },
    baiao: {
      label: 'Baião',
      bpm: 90,
      /* 2/4 syncopato: B sul 1, A sul 1.5, B sul 1.75 */
      pattern: [
        { time: 0,    type: 'bass',  vol: 1.0 },
        { time: 0.5,  type: 'chord', vol: 0.75 },
        { time: 0.75, type: 'bass',  vol: 0.6 },
      ]
    },
    arrasta: {
      label: 'Arrasta-pé',
      bpm: 110,
      /* 2/4 veloce uniforme */
      pattern: [
        { time: 0,    type: 'bass',  vol: 1.0 },
        { time: 0.25, type: 'chord', vol: 0.6 },
        { time: 0.5,  type: 'bass',  vol: 0.8 },
        { time: 0.75, type: 'chord', vol: 0.6 },
      ]
    },
  };

  let currentBpm = 80;
  let currentRhythm = 'xote';
  let metronomeLoop = null;
  let isMetronomePlaying = false;
  let synth = null;
  let metSynth = null;
  let toneReady = false;

  async function ensureTone() {
    if (toneReady) return;
    if (typeof Tone === 'undefined') {
      console.warn('Tone.js non ancora caricato');
      return;
    }
    await Tone.start();
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.8 },
    }).toDestination();
    metSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
    toneReady = true;
  }

  function notesFromChord(chordName) {
    const raw = CHORD_NOTES[chordName];
    if (!raw) return [];
    return raw.split(',');
  }

  async function playChord(chordName, duration) {
    await ensureTone();
    if (!synth) return;
    duration = duration || '2n';
    const notes = notesFromChord(chordName);
    if (notes.length) synth.triggerAttackRelease(notes, duration);
  }

  async function playProgression(chords) {
    await ensureTone();
    if (!synth) return;
    const now = Tone.now();
    const beatDur = 60 / currentBpm * 2;
    chords.forEach((chord, i) => {
      const notes = notesFromChord(chord);
      if (notes.length) synth.triggerAttackRelease(notes, '2n', now + i * beatDur);
    });
  }

  function updateBpm(val) {
    currentBpm = parseInt(val, 10);
    const display = document.getElementById('bpm-value');
    if (display) display.textContent = currentBpm + ' BPM';
    if (typeof Tone !== 'undefined') Tone.Transport.bpm.value = currentBpm;
  }

  function setRhythmPreset(name) {
    if (!RHYTHM_PRESETS[name]) return;
    currentRhythm = name;
    const preset = RHYTHM_PRESETS[name];

    /* update BPM */
    const slider = document.getElementById('bpm-slider');
    if (slider) {
      slider.value = preset.bpm;
      updateBpm(preset.bpm);
    }

    /* update buttons */
    document.querySelectorAll('.rhythm-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-rhythm') === name);
    });

    /* restart metronome if playing */
    if (isMetronomePlaying) {
      stopMetronome();
      startMetronome();
    }
  }

  async function startMetronome() {
    await ensureTone();
    if (!metSynth || !toneReady) return;

    const preset = RHYTHM_PRESETS[currentRhythm] || RHYTHM_PRESETS.xote;
    Tone.Transport.bpm.value = currentBpm;

    const measureDur = 60 / currentBpm * 2;

    metronomeLoop = new Tone.Sequence((time, beat) => {
      const vol = beat.vol;
      metSynth.volume.value = vol > 0.9 ? 0 : vol > 0.7 ? -6 : -12;
      const pitch = beat.type === 'bass' ? 'C1' : 'G1';
      metSynth.triggerAttackRelease(pitch, '16n', time);
    }, preset.pattern, measureDur);

    metronomeLoop.start(0);
    Tone.Transport.start();
    isMetronomePlaying = true;

    const btn = document.getElementById('metronome-btn');
    if (btn) { btn.innerHTML = '&#9646;&#9646;'; btn.classList.add('is-playing'); }
  }

  function stopMetronome() {
    if (metronomeLoop) {
      metronomeLoop.stop();
      metronomeLoop.dispose();
      metronomeLoop = null;
    }
    if (typeof Tone !== 'undefined') Tone.Transport.stop();
    isMetronomePlaying = false;

    const btn = document.getElementById('metronome-btn');
    if (btn) { btn.innerHTML = '&#9654;'; btn.classList.remove('is-playing'); }
  }

  async function toggleMetronome() {
    if (isMetronomePlaying) {
      stopMetronome();
    } else {
      await startMetronome();
    }
  }

  function stopActive() {
    stopMetronome();
    if (synth && toneReady) synth.releaseAll();
    document.querySelectorAll('.play-chord-btn.is-playing').forEach(btn => {
      btn.classList.remove('is-playing');
      btn.textContent = '▶';
    });
  }

  /* ── Wire up chord strip play buttons ── */
  function initChordStrips() {
    document.querySelectorAll('.chord-strip[data-chords]').forEach(strip => {
      let playBtn = strip.querySelector('.play-chord-btn');
      if (!playBtn) {
        playBtn = document.createElement('button');
        playBtn.className = 'play-chord-btn';
        playBtn.textContent = '▶';
        strip.appendChild(playBtn);
      }

      const chords = strip.getAttribute('data-chords').split(/[\s,]+/).filter(Boolean);

      playBtn.addEventListener('click', async () => {
        if (playBtn.classList.contains('is-playing')) {
          stopActive();
          return;
        }
        stopActive();
        playBtn.classList.add('is-playing');
        playBtn.textContent = '⏹';
        await playProgression(chords);
        setTimeout(() => {
          playBtn.classList.remove('is-playing');
          playBtn.textContent = '▶';
        }, chords.length * (60 / currentBpm * 2000) + 500);
      });
    });

    /* single chord cards */
    document.querySelectorAll('.chord-card[data-chord]').forEach(card => {
      card.addEventListener('click', async () => {
        await playChord(card.getAttribute('data-chord'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initChordStrips);
  document.addEventListener('fisarmonica:langChanged', () => {
    requestAnimationFrame(initChordStrips);
  });

  window.FisarmonicaAudio = {
    playChord,
    playProgression,
    toggleMetronome,
    stopActive,
    updateBpm,
    setRhythmPreset,
    CHORD_NOTES,
  };
})();
