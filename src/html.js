import { STYLES } from './styles.js';
import { CLIENT_SCRIPT } from './client.js';
import { normalisiere, QUELLEN_LINKS } from './meta.js';

export function baueHtml(liste) {
  const normListe  = (liste || []).map(normalisiere);
  const zeitstempel = new Date().toLocaleString('de-DE');

  const quellenSet = [...new Set(normListe.map((s) => s.plattform))];
  const quellenBadges = quellenSet
    .map((p) => {
      const url = QUELLEN_LINKS[p];
      return url
        ? `<a class="plattform-badge" href="${url}" target="_blank" rel="noopener noreferrer">${p}</a>`
        : `<span class="plattform-badge">${p}</span>`;
    })
    .join('');

  const dlcAnzahl = normListe.filter((s) => s.istDlc).length;

  const karten = normListe
    .map((s) => {
      const dlcClass = s.istDlc ? ' dlc' : '';
      return `
    <div class="card${dlcClass}"
         data-titel="${escapeAttr(s.titel)}"
         data-art="${escapeAttr(s.art)}"
         data-plattform="${escapeAttr(s.plattform)}"
         data-ende="${s.endeTs}"
         data-dlc="${s.istDlc ? '1' : '0'}">
      ${s.bild
        ? `<img src="${escapeAttr(s.bild)}" alt="${escapeAttr(s.titel)}" loading="lazy">`
        : `<div class="no-img">${escapeHtml(s.plattform)}</div>`}
      <div class="body">
        <div class="tags">
          <span class="tag store">${escapeHtml(s.plattform)}</span>
          <span class="tag source">${escapeHtml(s.quelle)}</span>
          <span class="tag art">${escapeHtml(s.art)}</span>
          ${s.istDlc ? '<span class="tag dlc-badge">DLC</span>' : ''}
        </div>
        <h2>${escapeHtml(s.titel)}</h2>
        <p><strong>Regulär:</strong> <s>${escapeHtml(s.preis)}</s> → <span class="free">Gratis!</span></p>
        <p><strong>Zeitraum:</strong> ${escapeHtml(s.ende)}</p>
        <a href="${escapeAttr(s.link)}" target="_blank" rel="noopener noreferrer" class="btn">Angebot öffnen →</a>
      </div>
    </div>`;
    })
    .join('');

  const quellenListe = quellenSet
    .map((p) => {
      const url = QUELLEN_LINKS[p] || '#';
      return `<li><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p)}</a></li>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PC Gratis-Spiele Scanner</title>
  <style>
${STYLES}
  </style>
</head>
<body>
  <header>
    <h1>🎮 Aktuelle Gratis-Spiele</h1>
    <div class="meta">
      Letzter Scan: ${escapeHtml(zeitstempel)}
      &nbsp;•&nbsp; <strong>${normListe.length}</strong> Angebote total
      &nbsp;•&nbsp; davon <strong>${dlcAnzahl}</strong> DLCs
    </div>
    <div class="plattformen">${quellenBadges}</div>
  </header>

  <div class="toolbar">
    <div class="toolbar-row">
      <label for="search">🔍</label>
      <input type="text" id="search" placeholder="Titel suchen…">

      <label for="sort">Sortieren:</label>
      <select id="sort">
        <option value="default">Standard</option>
        <option value="titel">Titel A–Z</option>
        <option value="plattform">Plattform</option>
        <option value="art">Art / Typ</option>
        <option value="ende">Ablaufdatum</option>
      </select>

      <label for="platt-filter">Plattform:</label>
      <select id="platt-filter">
        <option value="all">Alle</option>
      </select>

      <label for="art-filter">Art:</label>
      <select id="art-filter">
        <option value="all">Alle</option>
      </select>

      <label class="toggle-wrap" title="DLCs, Add-ons und Season Passes ausblenden">
        <input type="checkbox" id="hide-dlc"> DLCs ausblenden
      </label>

      <label class="toggle-wrap" title="Free-to-Play Dauertitel ausblenden">
        <input type="checkbox" id="hide-f2p"> F2P ausblenden
      </label>

      <button class="reset-btn" id="reset-filters" title="Alle Filter zurücksetzen">✕ Reset</button>
      <span class="counter-badge" id="counter">${normListe.length} Angebote</span>
    </div>
  </div>

  <div class="grid">
    ${karten || '<p class="empty">Aktuell keine Gratis-Aktionen gefunden. Versuche es später erneut.</p>'}
  </div>

  <div class="sources">
    <h3>📦 Gescannte Quellen</h3>
    <ul>${quellenListe}</ul>
  </div>

  <footer>PC Gratis-Spiele Scanner – automatisch aktualisiert alle ${'{SCAN_INTERVAL_HOURS}'}h</footer>

  <script>
${CLIENT_SCRIPT}
  </script>
</body>
</html>`;
}

function escapeHtml(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
