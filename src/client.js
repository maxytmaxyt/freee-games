export const CLIENT_SCRIPT = `
(function () {
  const grid = document.querySelector('.grid');
  const sortSel = document.getElementById('sort');
  const dlcOnly = document.getElementById('dlc-only');
  const artFilter = document.getElementById('art-filter');
  if (!grid) return;

  function cards() { return Array.from(grid.querySelectorAll('.card')); }

  function apply() {
    const mode = sortSel ? sortSel.value : 'default';
    const onlyDlc = dlcOnly ? dlcOnly.checked : false;
    const art = artFilter ? artFilter.value : 'all';

    const all = cards();
    all.forEach(function (c) {
      let show = true;
      if (onlyDlc && c.dataset.dlc !== '1') show = false;
      if (art !== 'all' && c.dataset.art !== art) show = false;
      c.style.display = show ? '' : 'none';
    });

    const visible = all.filter(function (c) { return c.style.display !== 'none'; });
    visible.sort(function (a, b) {
      switch (mode) {
        case 'art':
          return (a.dataset.art || '').localeCompare(b.dataset.art || '', 'de');
        case 'plattform':
          return (a.dataset.plattform || '').localeCompare(b.dataset.plattform || '', 'de');
        case 'titel':
          return (a.dataset.titel || '').localeCompare(b.dataset.titel || '', 'de');
        case 'ende':
          return (parseInt(a.dataset.ende, 10) || 0) - (parseInt(b.dataset.ende, 10) || 0);
        default:
          return 0;
      }
    });
    visible.forEach(function (c) { grid.appendChild(c); });
  }

  if (sortSel) sortSel.addEventListener('change', apply);
  if (dlcOnly) dlcOnly.addEventListener('change', apply);
  if (artFilter) artFilter.addEventListener('change', apply);
})();
`;
