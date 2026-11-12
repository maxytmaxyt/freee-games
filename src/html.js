/**
 * Erzeugt die finale HTML-Ausgabe als vollständige Seite.
 */
export function baueHtml(liste) {
  const zeitstempel = new Date().toLocaleString('de-DE');

  const quellenSet = [...new Set(liste.map((s) => s.plattform))];
  const quellenBadges = quellenSet.map((p) => `<span class="plattform-badge">${p}</span>`).join('');

  const karten = liste
    .map(
      (s) => `
    <div class="card">
      ${
        s.bild
          ? `<img src="${s.bild}" alt="${s.titel}" loading="lazy">`
          : `<div class="no-img">${s.plattform}</div>`
      }
      <div class="body">
        <div class="tags">
          <span class="tag store">${s.plattform}</span>
          <span class="tag source">${s.quelle}</span>
        </div>
        <h2>${s.titel}</h2>
        <p><strong>Regulär:</strong> <s>${s.preis}</s> → <span class="free">0,00 € (Gratis!)</span></p>
        <p><strong>Zeitraum:</strong> ${s.ende}</p>
        <a href="${s.link}" target="_blank" rel="noopener noreferrer" class="btn">Angebot öffnen →</a>
      </div>
    </div>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PC Gratis-Spiele Scanner</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0f1115;
      color: #e6e8ec;
      margin: 0;
      padding: 2rem 1rem;
    }
    header { text-align: center; margin-bottom: 2rem; }
    h1 { margin: 0 0 0.5rem; font-size: 2rem; color: #ffffff; }
    .meta { color: #8b949e; font-size: 0.88rem; margin-bottom: 1rem; }
    .plattformen { display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; margin-bottom: 1.5rem; }
    .plattform-badge {
      font-size: 0.72rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      background: #21262d;
      border: 1px solid #30363d;
      color: #c9d1d9;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { transform: translateY(-4px); border-color: #58a6ff; }
    .card img {
      width: 100%;
      height: 165px;
      object-fit: cover;
      background: #21262d;
      display: block;
    }
    .no-img {
      height: 165px;
      background: linear-gradient(135deg, #1f2937, #111827);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #8b949e;
      font-size: 1.1rem;
    }
    .body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .tag {
      font-size: 0.72rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-weight: 600;
    }
    .store { background: #238636; color: #fff; }
    .source { background: #30363d; color: #c9d1d9; }
    h2 { font-size: 1.1rem; margin: 0 0 0.75rem; line-height: 1.35; }
    p { margin: 0.25rem 0; font-size: 0.88rem; color: #8b949e; }
    .free { color: #3fb950; font-weight: bold; }
    .btn {
      display: block;
      text-align: center;
      background: #1f6feb;
      color: #fff;
      text-decoration: none;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 600;
      margin-top: auto;
      transition: background 0.15s;
    }
    .btn:hover { background: #388bfd; }
    .empty {
      text-align: center;
      grid-column: 1 / -1;
      color: #8b949e;
      padding: 3rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>🎮 Aktuelle Gratis-Spiele</h1>
    <div class="meta">
      Letzter Scan: ${zeitstempel}
      &nbsp;•&nbsp; <strong>${liste.length}</strong> Angebote gefunden
    </div>
    <div class="plattformen">${quellenBadges}</div>
  </header>
  <div class="grid">
    ${
      karten ||
      '<p class="empty">Aktuell wurden keine Gratis-Aktionen gefunden. Versuche es später erneut.</p>'
    }
  </div>
</body>
</html>`;
}
