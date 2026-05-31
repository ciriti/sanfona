# Fisarmonica Forró

Metodo pratico di fisarmonica per forró e xote nordestino.

## Deploy su GitHub Pages

1. Crea un nuovo repository su GitHub
2. Carica tutti i file di questa cartella (drag & drop o `git push`)
3. Vai su Settings → Pages → Source: `main` branch, `/ (root)`
4. Il sito sarà disponibile su `https://[username].github.io/[repo-name]/`

## Struttura

```
index.html          Homepage con 4 percorsi
xote.html           Xote & Levada (7 moduli)
tecnica.html        Tecnica: mano destra, sinistra, mantice (6 moduli)
scale-accordi.html  Scale, accordi, arpeggi, progressioni (5 moduli)
repertorio.html     Repertorio progressivo: ⭐ → ⭐⭐⭐ (5 sezioni)
css/shared.css      Chrome globale
css/page.css        Layout pagine contenuto
js/layout.js        Nav e header automatici
js/i18n.js          Sistema IT/EN/PT
js/instruments.js   Switcher strumento
js/chords.js        Diagrammi piano + Stradella SVG
js/progress.js      Sidebar progresso localStorage
js/audio.js         Tone.js playback, metronomco, preset ritmici
js/data/*.js        Contenuti multilingua per ogni pagina
```

## Stack

Zero build, zero framework, zero npm. HTML statico + CSS + JS vanilla.
Audio: Tone.js 14.8.49 via CDN. Font: Google Fonts.
