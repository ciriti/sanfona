/* instruments.js — Solo fisarmonica come strumento default */
(function () {
  'use strict';

  const INSTRUMENTS = [
    { id: 'fisarmonica', label: 'Fisarmonica', labelIT: 'Fisarmonica', labelEN: 'Accordion', labelPT: 'Acordeão' },
  ];

  const STORAGE_KEY = 'fisarmonica_instrument';

  function getInstrument() {
    return localStorage.getItem(STORAGE_KEY) || 'fisarmonica';
  }

  function setInstrument(id) {
    localStorage.setItem(STORAGE_KEY, id);
    document.dispatchEvent(new CustomEvent('fisarmonica:instrumentChanged', { detail: { instrument: id } }));
  }

  function initInstrumentSwitchers(lang) {
    const current = getInstrument();
    // solo fisarmonica — nessun switcher visibile necessario
    // esposto per compatibilità API con il pattern ritmosdobrasil
    document.querySelectorAll('[data-instrument]').forEach(btn => {
      const id = btn.getAttribute('data-instrument');
      btn.classList.toggle('active', id === current);
      btn.addEventListener('click', () => {
        setInstrument(id);
        document.querySelectorAll('[data-instrument]').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-instrument') === id);
        });
      });
    });
  }

  window.FisarmonicaInstruments = {
    getInstrument,
    setInstrument,
    initInstrumentSwitchers,
    INSTRUMENTS,
  };
})();
