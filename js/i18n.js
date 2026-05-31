/* i18n.js — Sistema IT/EN/PT con URL params, localStorage e page-reload */
(function () {
  'use strict';

  const STORAGE_KEY = 'fisarmonica_lang';
  const SUPPORTED = ['it', 'en', 'pt'];
  const DEFAULT = 'it';

  function getLang() {
    /* 1. URL param — fonte più autoritativa */
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('lang');
      if (SUPPORTED.includes(fromUrl)) {
        try { localStorage.setItem(STORAGE_KEY, fromUrl); } catch (e) {}
        try { sessionStorage.setItem(STORAGE_KEY, fromUrl); } catch (e) {}
        return fromUrl;
      }
    } catch (e) {}

    /* 2. localStorage */
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(stored)) return stored;
    } catch (e) {}

    /* 3. sessionStorage — fallback per Brave che rimuove i param URL */
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(stored)) return stored;
    } catch (e) {}

    /* 4. Lingua del browser */
    const nav = ((navigator.language || '').split('-')[0] || '').toLowerCase();
    if (SUPPORTED.includes(nav)) return nav;

    return DEFAULT;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    try { sessionStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function buildUrlForLang(lang) {
    const params = new URLSearchParams(window.location.search);
    if (lang === DEFAULT) {
      params.delete('lang');
    } else {
      params.set('lang', lang);
    }
    const qs = params.toString();
    return window.location.pathname + (qs ? '?' + qs : '');
  }

  function updateLangButtons(lang) {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  function applyLang(pageId, lang, contentMap) {
    const content = contentMap[lang] || contentMap[DEFAULT] || {};

    if (content.metaTitle) document.title = content.metaTitle;

    const titleEl = document.getElementById('page-title');
    if (titleEl && content.title) titleEl.textContent = content.title;

    const subtitleEl = document.getElementById('page-subtitle');
    if (subtitleEl && content.subtitle) subtitleEl.textContent = content.subtitle;

    /* Sostituisce il contenuto principale solo se non è la lingua di default
       (il default è già nel HTML statico della pagina). */
    if (lang !== DEFAULT && content.mainHtml) {
      const main = document.querySelector('main.content-column');
      if (main) {
        main.innerHTML = content.mainHtml;
        document.dispatchEvent(new CustomEvent('fisarmonica:langChanged', { detail: { lang, pageId } }));
      }
    } else {
      document.dispatchEvent(new CustomEvent('fisarmonica:langChanged', { detail: { lang, pageId } }));
    }

    updateLangButtons(lang);
    document.documentElement.lang = lang;
  }

  function applyBasicPageLocalization(pageId, options) {
    options = options || {};
    const lang = getLang();
    const key = pageId.replace(/-/g, '');
    const contentMap =
      (window.FisarmonicaContent && window.FisarmonicaContent[pageId]) ||
      (window.FisarmonicaContent && window.FisarmonicaContent[key]) ||
      {};

    applyLang(pageId, lang, contentMap);

    /* Cambio lingua tramite ricaricamento della pagina con ?lang= nell'URL.
       Questo è il metodo più robusto: evita problemi di stato SPA, ripristina
       sempre l'HTML statico italiano come base e funziona su tutti i browser. */
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const newLang = btn.getAttribute('data-lang');
        if (newLang === lang) return;
        setLang(newLang);
        window.location.href = buildUrlForLang(newLang);
      });
    });

    return { lang, setLang, getLang };
  }

  function setupMobilePreferenceSheet(lang) {
    setLang(lang || getLang());
  }

  window.FisarmonicaI18n = {
    getLang,
    setLang,
    applyBasicPageLocalization,
    setupMobilePreferenceSheet,
  };
})();
