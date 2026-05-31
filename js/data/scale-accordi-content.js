/* scale-accordi-content.js */
window.FisarmonicaContent = window.FisarmonicaContent || {};
window.FisarmonicaContent['scale-accordi'] = window.FisarmonicaContent.scaleaccordi = {
  it: {
    metaTitle: 'Fisarmonica Forró — Scale & Accordi',
    title: 'Scale & Accordi',
    subtitle: 'Scala maggiore, pentatonica, triadi e settima: il vocabolario armonico della fisarmonica forró',
  },
  en: {
    metaTitle: 'Fisarmonica Forró — Scales & Chords',
    title: 'Scales & Chords',
    subtitle: 'Major scale, pentatonic, triads and seventh chords: the harmonic vocabulary of forró accordion',
    mainHtml: `
<section id="s1"><div class="section-header"><span class="section-num">S&C 1</span><div><div class="section-title">The Scales of Forró</div></div></div>
<h4>C Major</h4><pre>C  D  E  F  G  A  B  C
1  2  3  4  5  6  7  8</pre>
<h4>G Major</h4><pre>G  A  B  C  D  E  F# G</pre>
<h4>D Major</h4><pre>D  E  F# G  A  B  C# D</pre>
<h4>Am Pentatonic (improvisation)</h4><pre>A  C  D  E  G  A
1  b3 4  5  b7 8</pre>
<p>The pentatonic scale works over almost any chord in forró because it avoids semitone clashes. It's the fastest path to melodic improvisation.</p>
</section>
<section id="s2"><div class="section-header"><span class="section-num">S&C 2</span><div><div class="section-title">Triads: Building Chords</div></div></div>
<h4>Major triad: R + M3 + P5</h4><pre>G major: G – B – D</pre>
<h4>Minor triad: R + m3 + P5</h4><pre>Am:      A – C – E</pre>
<h4>Dominant 7th: R + M3 + P5 + m7</h4><pre>D7:      D – F# – A – C</pre>
<table><thead><tr><th>Chord</th><th>Notes</th><th>Type</th><th>Function</th></tr></thead><tbody>
<tr><td>G</td><td>G-B-D</td><td>Major</td><td>I in G</td></tr>
<tr><td>C</td><td>C-E-G</td><td>Major</td><td>IV in G</td></tr>
<tr><td>D7</td><td>D-F#-A-C</td><td>Dom 7th</td><td>V7 in G</td></tr>
<tr><td>Em</td><td>E-G-B</td><td>Minor</td><td>vi in G</td></tr>
<tr><td>Am</td><td>A-C-E</td><td>Minor</td><td>i in Am</td></tr>
<tr><td>E7</td><td>E-G#-B-D</td><td>Dom 7th</td><td>V7 in Am</td></tr>
<tr><td>Dm</td><td>D-F-A</td><td>Minor</td><td>iv in Am</td></tr>
</tbody></table>
<div class="chord-gallery">
<div class="chord-card" data-chord="G"><div class="chord-card-name">G</div><div class="chord-card-type">Major</div></div>
<div class="chord-card" data-chord="C"><div class="chord-card-name">C</div><div class="chord-card-type">Major</div></div>
<div class="chord-card" data-chord="D7"><div class="chord-card-name">D7</div><div class="chord-card-type">Dom 7th</div></div>
<div class="chord-card" data-chord="Em"><div class="chord-card-name">Em</div><div class="chord-card-type">Minor</div></div>
<div class="chord-card" data-chord="Am"><div class="chord-card-name">Am</div><div class="chord-card-type">Minor</div></div>
<div class="chord-card" data-chord="E7"><div class="chord-card-name">E7</div><div class="chord-card-type">Dom 7th</div></div>
</div>
</section>
<section id="s3"><div class="section-header"><span class="section-num">S&C 3</span><div><div class="section-title">Arpeggios</div></div></div>
<p>An arpeggio plays chord notes one at a time. In forró, arpeggios add melodic variety on long notes.</p>
<pre>G ascending:  G3-B3-D4-G4
G descending: G4-D4-B3-G3
G broken:     G3-D4-B3-G4</pre>
<div class="chord-strip" data-chords="G C D7 G"><span class="chord-strip-label">Arpeggio practice —</span><span class="chord-pill">G</span><span class="chord-sep">–</span><span class="chord-pill">C</span><span class="chord-sep">–</span><span class="chord-pill">D7</span><span class="chord-sep">–</span><span class="chord-pill">G</span></div>
</section>
<section id="s4"><div class="section-header"><span class="section-num">S&C 4</span><div><div class="section-title">Harmonic Progressions of Forró</div></div></div>
<h4>I–V7–vi–IV (most singable xote cycle)</h4>
<div class="chord-strip" data-chords="G D7 Em C"><span class="chord-strip-label">in G —</span><span class="chord-pill">G</span><span class="chord-sep">–</span><span class="chord-pill">D7</span><span class="chord-sep">–</span><span class="chord-pill">Em</span><span class="chord-sep">–</span><span class="chord-pill">C</span></div>
<div class="chord-strip" data-chords="D A7 Bm G"><span class="chord-strip-label">in D —</span><span class="chord-pill">D</span><span class="chord-sep">–</span><span class="chord-pill">A7</span><span class="chord-sep">–</span><span class="chord-pill">Bm</span><span class="chord-sep">–</span><span class="chord-pill">G</span></div>
<h4>I–IV–V7–I (classic pé-de-serra forró)</h4>
<div class="chord-strip" data-chords="G C D7 G"><span class="chord-strip-label">in G —</span><span class="chord-pill">G</span><span class="chord-sep">–</span><span class="chord-pill">C</span><span class="chord-sep">–</span><span class="chord-pill">D7</span><span class="chord-sep">–</span><span class="chord-pill">G</span></div>
<h4>i–iv–V7–i (minor xote)</h4>
<div class="chord-strip" data-chords="Am Dm E7 Am"><span class="chord-strip-label">in Am —</span><span class="chord-pill">Am</span><span class="chord-sep">–</span><span class="chord-pill">Dm</span><span class="chord-sep">–</span><span class="chord-pill">E7</span><span class="chord-sep">–</span><span class="chord-pill">Am</span></div>
<h4>I–V7 (baião oscillation)</h4>
<div class="chord-strip" data-chords="G D7 G D7"><span class="chord-strip-label">in G —</span><span class="chord-pill">G</span><span class="chord-sep">–</span><span class="chord-pill">D7</span></div>
</section>
<section id="s5"><div class="section-header"><span class="section-num">S&C 5</span><div><div class="section-title">Transposition: Changing Keys</div></div></div>
<p>You'll need to transpose to match a singer's range. The interval relationships stay identical in every key.</p>
<table><thead><tr><th>Cycle</th><th>In G</th><th>In D</th><th>In A</th></tr></thead><tbody>
<tr><td>I–IV–V7</td><td>G–C–D7</td><td>D–G–A7</td><td>A–D–E7</td></tr>
<tr><td>I–V7–vi–IV</td><td>G–D7–Em–C</td><td>D–A7–Bm–G</td><td>A–E7–F#m–D</td></tr>
<tr><td>i–iv–V7</td><td>Gm–Cm–D7</td><td>Am–Dm–E7</td><td>Em–Am–B7</td></tr>
</tbody></table>
<div class="exercise-block"><strong>Exercise:</strong> Play G–C–D7 in G, then transpose to D (D–G–A7), then to A (A–D–E7). Same patterns, new positions.</div>
</section>
<section id="s6"><div class="section-header"><span class="section-num">S&C 6</span><div><div class="section-title">Circle of Fifths</div><div class="section-subtitle">The harmonic map of all 12 keys — click to explore</div></div></div>
<p>Keys close together on the circle share many chords — that's why forró progressions always move between adjacent zones. Highlighted keys are most common in the northeastern repertoire.</p>
<div class="cof-wrapper"><div class="cof-svg-container" id="cof-svg-container"></div><div class="cof-info-panel" id="cof-info-panel"><p class="cof-hint">← Click on a key to see details</p></div></div>
<div class="cof-legend"><span class="cof-legend-forro">● Keys common in northeastern forró</span><span>○ Outer ring: major &nbsp;|&nbsp; inner ring: relative minor</span></div>
</section>`,
  },
  pt: {
    metaTitle: 'Fisarmonica Forró — Escalas & Acordes',
    title: 'Escalas & Acordes',
    subtitle: 'Escala maior, pentatônica, tríades e sétima: o vocabulário harmônico do acordeão forró',
    mainHtml: `
<section id="s1"><div class="section-header"><span class="section-num">E&A 1</span><div><div class="section-title">As Escalas do Forró</div></div></div>
<h4>Dó Maior</h4><pre>C D E F G A B C</pre>
<h4>Sol Maior</h4><pre>G A B C D E F# G</pre>
<h4>Pentatônica de Lá menor</h4><pre>A C D E G A</pre>
<p>A escala pentatônica funciona sobre quase qualquer acorde do forró porque não tem semitons dissonantes.</p>
</section>
<section id="s2"><div class="section-header"><span class="section-num">E&A 2</span><div><div class="section-title">Tríades: Construindo os Acordes</div></div></div>
<pre>G maior: G – B – D
Am:      A – C – E
D7:      D – F# – A – C</pre>
<div class="chord-gallery">
<div class="chord-card" data-chord="G"><div class="chord-card-name">G</div><div class="chord-card-type">Maior</div></div>
<div class="chord-card" data-chord="D7"><div class="chord-card-name">D7</div><div class="chord-card-type">Dom 7ª</div></div>
<div class="chord-card" data-chord="Am"><div class="chord-card-name">Am</div><div class="chord-card-type">Menor</div></div>
<div class="chord-card" data-chord="Em"><div class="chord-card-name">Em</div><div class="chord-card-type">Menor</div></div>
</div>
</section>
<section id="s3"><div class="section-header"><span class="section-num">E&A 3</span><div><div class="section-title">Arpejos</div></div></div>
<pre>Sol ascendente:  G3-B3-D4-G4
Sol descendente: G4-D4-B3-G3</pre>
</section>
<section id="s4"><div class="section-header"><span class="section-num">E&A 4</span><div><div class="section-title">Progressões Harmônicas do Forró</div></div></div>
<div class="chord-strip" data-chords="G D7 Em C"><span class="chord-strip-label">I–V7–vi–IV em Sol —</span><span class="chord-pill">G</span><span class="chord-sep">–</span><span class="chord-pill">D7</span><span class="chord-sep">–</span><span class="chord-pill">Em</span><span class="chord-sep">–</span><span class="chord-pill">C</span></div>
<div class="chord-strip" data-chords="Am Dm E7 Am"><span class="chord-strip-label">i–iv–V7–i em Lam —</span><span class="chord-pill">Am</span><span class="chord-sep">–</span><span class="chord-pill">Dm</span><span class="chord-sep">–</span><span class="chord-pill">E7</span><span class="chord-sep">–</span><span class="chord-pill">Am</span></div>
</section>
<section id="s5"><div class="section-header"><span class="section-num">E&A 5</span><div><div class="section-title">Transposição</div></div></div>
<table><thead><tr><th>Giro</th><th>em Sol</th><th>em Ré</th><th>em Lá</th></tr></thead><tbody>
<tr><td>I–IV–V7</td><td>G–C–D7</td><td>D–G–A7</td><td>A–D–E7</td></tr>
</tbody></table>
</section>
<section id="s6"><div class="section-header"><span class="section-num">E&A 6</span><div><div class="section-title">Círculo das Quintas</div><div class="section-subtitle">O mapa harmônico das 12 tonalidades — clique para explorar</div></div></div>
<p>As tonalidades próximas no círculo compartilham muitos acordes — por isso as progressões do forró sempre se movem entre zonas adjacentes.</p>
<div class="cof-wrapper"><div class="cof-svg-container" id="cof-svg-container"></div><div class="cof-info-panel" id="cof-info-panel"><p class="cof-hint">← Clique em uma tonalidade para ver os detalhes</p></div></div>
<div class="cof-legend"><span class="cof-legend-forro">● Tonalidades comuns no forró nordestino</span><span>○ Anel externo: maior &nbsp;|&nbsp; anel interno: relativa menor</span></div>
</section>`,
  },
};
