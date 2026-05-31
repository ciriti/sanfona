/* i18n.js — Sistema IT/EN/PT con localStorage e scroll restore */
(function () {
  'use strict';

  const STORAGE_KEY_LANG = 'fisarmonica_lang';
  const STORAGE_KEY_SCROLL = 'fisarmonica_scroll_';
  const SUPPORTED_LANGS = ['it', 'en', 'pt'];
  const DEFAULT_LANG = 'it';

  function getLang() {
    return localStorage.getItem(STORAGE_KEY_LANG) ||
           sessionStorage.getItem(STORAGE_KEY_LANG) ||
           DEFAULT_LANG;
  }

  function setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    sessionStorage.setItem(STORAGE_KEY_LANG, lang);
  }

  function getScrollKey() {
    return STORAGE_KEY_SCROLL + location.pathname;
  }

  function saveScroll() {
    sessionStorage.setItem(getScrollKey(), window.scrollY);
  }

  function restoreScroll() {
    const saved = sessionStorage.getItem(getScrollKey());
    if (saved) {
      requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)));
    }
  }

  function updateLangButtons(lang) {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  function applyLang(pageId, lang, contentMap) {
    const content = contentMap[lang] || contentMap[DEFAULT_LANG] || {};

    if (content.metaTitle) document.title = content.metaTitle;

    const titleEl = document.getElementById('page-title');
    if (titleEl && content.title) titleEl.textContent = content.title;

    const subtitleEl = document.getElementById('page-subtitle');
    if (subtitleEl && content.subtitle) subtitleEl.textContent = content.subtitle;

    if (lang !== DEFAULT_LANG && content.mainHtml) {
      const main = document.querySelector('main.content-column');
      if (main) {
        saveScroll();
        main.innerHTML = content.mainHtml;
        restoreScroll();
        document.dispatchEvent(new CustomEvent('fisarmonica:langChanged', { detail: { lang, pageId } }));
      }
    } else if (lang === DEFAULT_LANG) {
      document.dispatchEvent(new CustomEvent('fisarmonica:langChanged', { detail: { lang, pageId } }));
    }

    updateLangButtons(lang);
    document.documentElement.lang = lang;
  }

  function applyBasicPageLocalization(pageId, options) {
    options = options || {};
    const lang = getLang();
    const contentKey = pageId.replace('-', '_') + '_content' in (window.FisarmonicaContent || {}) ?
                       pageId.replace('-', '_') + '_content' :
                       pageId.replace(/-/g, '');
    const contentMap = (window.FisarmonicaContent && window.FisarmonicaContent[pageId.replace('-','')]) ||
                       (window.FisarmonicaContent && window.FisarmonicaContent[pageId]) ||
                       {};

    applyLang(pageId, lang, contentMap);

    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const newLang = btn.getAttribute('data-lang');
        setLang(newLang);
        applyLang(pageId, newLang, contentMap);

        if (window.FisarmonicaProgress) {
          window.FisarmonicaProgress.buildSidebar();
          window.FisarmonicaProgress.initScrollSpy();
        }
        if (window.FisarmonicaInstruments) {
          window.FisarmonicaInstruments.initInstrumentSwitchers(newLang);
        }
        enhanceChordPills();
      });
    });

    return { lang, setLang, getLang };
  }

  function setupMobilePreferenceSheet(lang) {
    // minimal: lang persistence already handled
    setLang(lang || getLang());
  }

  function enhanceChordPills() {
    document.dispatchEvent(new CustomEvent('fisarmonica:enhanceChords'));
  }

  window.FisarmonicaI18n = {
    getLang,
    setLang,
    applyBasicPageLocalization,
    setupMobilePreferenceSheet,
  };
})();
