import { STYLES } from './styles.js';
import { CLIENT_SCRIPT } from './client.js';
import { normalisiere, QUELLEN_LINKS } from './meta.js';

/**
 * Erzeugt die finale HTML-Ausgabe als vollständige Seite.
 */
export function baueHtml(liste) {
  const normListe = (liste || []).map(normalisiere);
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
  const arten = [...new Set(normListe.map((s) => s.art))];

  const karten = normListe
    .map((s) => {
      const dlcClass = s.istDlc ? ' dlc' : '';
      const artBadge = `<span class="tag art">${s.art}</span>`;
      const dlcBadge = s.istDlc ? `<span class="tag dlc-badge">DLC</span>` : '';
      return `
    <div class="card${dlcClass}"
         data-titel="${escapeAttr(s.titel)}"
         data-art="${escapeAttr(s.art)}"
         data-plattform="${escapeAttr(s.plattform)}"
         data-ende="${s.endeTs}"
         data-dlc="${s.istDlc ? '1' : '0'}">
      ${
        s.bild
          ? `<img src="${escapeAttr(s.bild)}" alt="${escapeAttr(s.titel)}" loading="lazy">`
          : `<div class="no-img">${escapeHtml(s.plattform)}</div>`
      }
      <div class="body">
        <div class="tags">
          <span class="tag store">${escapeHtml(s.plattform)}</span>
          <span class="tag source">${escapeHtml(s.quelle)}</span>
          ${artBadge}
          ${dlcBadge}
        </div>
        <h2>${escapeHtml(s.titel)}</h2>
        <p><strong>Regulär:</strong> <s>${escapeHtml(s.preis)}</s> → <span class="free">0,00 € (Gratis!)</span></p>
        <p><strong>Zeitraum:</strong> ${escapeHtml(s.ende)}</p>
        <a href="${escapeAttr(s.link)}" target="_blank" rel="noopener noreferrer" class="btn">Angebot öffnen →</a>
      </div>
    </div>
  `;
    })
    .join('');

  const artOptionen = arten
    .map((a) => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`)
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
      &nbsp;•&nbsp; <strong>${normListe.length}</strong> Angebote gefunden
      &nbsp;•&nbsp; davon <strong>${dlcAnzahl}</strong> DLCs
    </div>
    <div class="plattformen">${quellenBadges}</div>
  </header>

  <div class="toolbar">
    <label for="sort">Sortieren nach:</label>
    <select id="sort">
      <option value="default">Standard</option>
      <option value="art">Art / Typ</option>
      <option value="plattform">Quelle / Plattform</option>
      <option value="titel">Titel</option>
      <option value="ende">Ablaufdatum</option>
    </select>
    <label for="art-filter">Art filtern:</label>
    <select id="art-filter">
      <option value="all">Alle</option>
      ${artOptionen}
    </select>
    <div class="checkbox-wrap">
      <input type="checkbox" id="dlc-only">
      <label for="dlc-only">Nur DLCs anzeigen</label>
    </div>
  </div>

  <div class="grid">
    ${
      karten ||
      '<p class="empty">Aktuell wurden keine Gratis-Aktionen gefunden. Versuche es später erneut.</p>'
    }
  </div>

  <div class="sources">
    <h3>📦 Quellen, aus denen Spiele bezogen werden</h3>
    <ul>${quellenListe}</ul>
  </div>

  <footer>PC Gratis-Spiele Scanner – automatisch aktualisiert</footer>

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
