export const CLIENT_SCRIPT = `
(function () {
  const grid      = document.querySelector('.grid');
  const sortSel   = document.getElementById('sort');
  const searchIn  = document.getElementById('search');
  const plattSel  = document.getElementById('platt-filter');
  const artSel    = document.getElementById('art-filter');
  const hideDlc   = document.getElementById('hide-dlc');
  const hideF2p   = document.getElementById('hide-f2p');
  const counter   = document.getElementById('counter');
  const resetBtn  = document.getElementById('reset-filters');
  if (!grid) return;

  function cards() { return Array.from(grid.querySelectorAll('.card')); }

  function apply() {
    const mode     = sortSel  ? sortSel.value.trim()  : 'default';
    const query    = searchIn ? searchIn.value.toLowerCase().trim() : '';
    const platt    = plattSel ? plattSel.value : 'all';
    const art      = artSel   ? artSel.value   : 'all';
    const noDlc    = hideDlc  ? hideDlc.checked  : false;
    const noF2p    = hideF2p  ? hideF2p.checked  : false;

    const all = cards();
    let visible = 0;

    all.forEach(function (c) {
      let show = true;
      if (noDlc && c.dataset.dlc === '1')                              show = false;
      if (noF2p && c.dataset.art === 'Free-to-Play')                   show = false;
      if (art !== 'all' && c.dataset.art !== art)                      show = false;
      if (platt !== 'all' && c.dataset.plattform !== platt)            show = false;
      if (query && !c.dataset.titel.toLowerCase().includes(query))     show = false;
      c.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (counter) counter.textContent = visible + ' Angebote';

    // Sortierung nur auf sichtbare anwenden
    const sichtbar = all.filter(function (c) { return c.style.display !== 'none'; });
    sichtbar.sort(function (a, b) {
      switch (mode) {
        case 'titel':
          return (a.dataset.titel || '').localeCompare(b.dataset.titel || '', 'de');
        case 'plattform':
          return (a.dataset.plattform || '').localeCompare(b.dataset.plattform || '', 'de');
        case 'art':
          return (a.dataset.art || '').localeCompare(b.dataset.art || '', 'de');
        case 'ende':
          return (parseInt(a.dataset.ende, 10) || 0) - (parseInt(b.dataset.ende, 10) || 0);
        default:
          return 0;
      }
    });
    sichtbar.forEach(function (c) { grid.appendChild(c); });
  }

  // Plattform-Dropdown dynamisch aus vorhandenen Karten aufbauen
  if (plattSel) {
    var seen = new Set();
    cards().forEach(function (c) {
      var p = c.dataset.plattform;
      if (p && !seen.has(p)) { seen.add(p); }
    });
    Array.from(seen).sort(function(a,b){ return a.localeCompare(b,'de'); }).forEach(function (p) {
      var o = document.createElement('option');
      o.value = p; o.textContent = p;
      plattSel.appendChild(o);
    });
  }

  // Art-Dropdown dynamisch aufbauen
  if (artSel) {
    var seenArt = new Set();
    cards().forEach(function (c) {
      var a = c.dataset.art;
      if (a && !seenArt.has(a)) seenArt.add(a);
    });
    Array.from(seenArt).sort().forEach(function (a) {
      var o = document.createElement('option');
      o.value = a; o.textContent = a;
      artSel.appendChild(o);
    });
  }

  // Reset
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (searchIn) searchIn.value = '';
      if (sortSel)  sortSel.value  = 'default';
      if (plattSel) plattSel.value = 'all';
      if (artSel)   artSel.value   = 'all';
      if (hideDlc)  hideDlc.checked = false;
      if (hideF2p)  hideF2p.checked = false;
      apply();
    });
  }

  [sortSel, searchIn, plattSel, artSel, hideDlc, hideF2p].forEach(function (el) {
    if (el) el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', apply);
  });

  apply(); // initial counter setzen
})();
`;
