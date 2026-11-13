// ============================================================
// all.js – automatisch gebündelt aus allen Quelldateien
// Generiert: 13.11.2026, 10:41:07
// Quelldateien: src/constants.js, src/meta.js, src/styles.js, src/client.js, src/html.js, src/gamerpower.js, src/cheapshark.js, src/epic.js, src/fanatical.js, src/freetogame.js, src/gamesplanet.js, src/gog.js, src/greenmangaming.js, src/indiegala.js, src/itch.js, src/rockstar.js, src/steam.js, src/stove.js, src/ubisoft.js, src/freestuff.js, server.js
// ============================================================

import * as cheerio from 'cheerio';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';


// ──────────────────────────────────────────────────────────────────────
// 📄 src/constants.js
// ──────────────────────────────────────────────────────────────────────
// Gemeinsame Konstanten für alle Scanner
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';


// ──────────────────────────────────────────────────────────────────────
// 📄 src/meta.js
// ──────────────────────────────────────────────────────────────────────
/**
 * Gemeinsame Metadaten-Helfer: Typ/Art bestimmen, DLC-Erkennung, Normalisierung.
 */

const DLC_MUSTER = /dlc|add[- ]?on|addon|erweiterung|season pass|skin pack|costume pack|item pack|map pack/i;
const BUNDLE_MUSTER = /bundle|collection|komplettpaket|paket/i;
const F2P_MUSTER = /free[- ]?to[- ]?play|f2p/i;

function bestimmeArt(eintrag) {
  const text = `${eintrag.titel ?? ''} ${eintrag.quelle ?? ''} ${eintrag.plattform ?? ''} ${eintrag.preis ?? ''}`.toLowerCase();
  if (DLC_MUSTER.test(text)) return 'DLC';
  if (F2P_MUSTER.test(text) || /free-to-play/i.test(eintrag.preis ?? '')) return 'Free-to-Play';
  if (BUNDLE_MUSTER.test(text)) return 'Bundle';
  if (/giveaway/i.test(text)) return 'Giveaway';
  return 'Spiel';
}

function istDlc(eintrag) {
  return bestimmeArt(eintrag) === 'DLC';
}

function endeTimestamp(ende) {
  if (!ende) return 0;
  const s = String(ende).toLowerCase();
  if (/dauerhaft|solange vorrat|unbegrenzt|permanent/i.test(s)) return Number.MAX_SAFE_INTEGER;
  // Versuche deutsche Datumsangabe zu parsen
  const m = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:.*?(\d{1,2}):(\d{2}))?/);
  if (m) {
    const [, d, mo, y, h = '0', mi = '0'] = m;
    const ts = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi)).getTime();
    if (!isNaN(ts)) return ts;
  }
  const parsed = Date.parse(ende);
  return isNaN(parsed) ? 0 : parsed;
}

function normalisiere(eintrag) {
  const art = eintrag.art ?? bestimmeArt(eintrag);
  return {
    ...eintrag,
    art,
    istDlc: eintrag.istDlc ?? (art === 'DLC'),
    endeTs: eintrag.endeTs ?? endeTimestamp(eintrag.ende),
  };
}

const QUELLEN_LINKS = {
  'Epic Games Store': 'https://store.epicgames.com/de/free-games',
  'Steam': 'https://store.steampowered.com/search/?specials=1&maxprice=free',
  'GOG': 'https://www.gog.com/games?priceRange=0,0',
  'Rockstar Games Launcher': 'https://www.rockstargames.com',
  'Ubisoft Connect': 'https://www.ubisoft.com/de-de/games',
  'Amazon Prime Gaming': 'https://gaming.amazon.com/home',
  'Humble Bundle': 'https://www.humblebundle.com/store',
  'Itch.io': 'https://itch.io/games/on-sale',
  'IndieGala': 'https://www.indiegala.com/freebies',
  'STOVE': 'https://www.onstove.com',
  'Fanatical': 'https://www.fanatical.com/de/free-games',
  'Green Man Gaming': 'https://www.greenmangaming.com/de/free-games/',
  'Gamesplanet': 'https://de.gamesplanet.com/games?price=0',
  'FreeToGame': 'https://www.freetogame.com',
};


// ──────────────────────────────────────────────────────────────────────
// 📄 src/styles.js
// ──────────────────────────────────────────────────────────────────────
const STYLES = `
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
      text-decoration: none;
    }
    .plattform-badge:hover { border-color: #58a6ff; color: #58a6ff; }

    /* ── Toolbar ─────────────────────────────────────────────────── */
    .toolbar {
      max-width: 1400px;
      margin: 0 auto 1.5rem;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }
    .toolbar-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
      width: 100%;
    }
    .toolbar label { font-size: 0.82rem; color: #8b949e; white-space: nowrap; }
    .toolbar select, .toolbar input[type="text"] {
      background: #0f1115;
      color: #e6e8ec;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 0.4rem 0.65rem;
      font-size: 0.85rem;
      outline: none;
      cursor: pointer;
      min-width: 130px;
    }
    .toolbar select:focus, .toolbar input[type="text"]:focus {
      border-color: #58a6ff;
    }
    .toolbar input[type="text"] { min-width: 200px; }
    .toolbar input[type="text"]::placeholder { color: #484f58; }
    .toggle-wrap {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #0f1115;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 0.4rem 0.65rem;
      cursor: pointer;
      font-size: 0.82rem;
      color: #c9d1d9;
      user-select: none;
    }
    .toggle-wrap input[type="checkbox"] { accent-color: #1f6feb; cursor: pointer; }
    .toggle-wrap:has(input:checked) { border-color: #1f6feb; color: #58a6ff; }
    .counter-badge {
      margin-left: auto;
      font-size: 0.82rem;
      color: #3fb950;
      font-weight: 600;
      white-space: nowrap;
    }
    .reset-btn {
      background: none;
      border: 1px solid #30363d;
      border-radius: 6px;
      color: #8b949e;
      font-size: 0.82rem;
      padding: 0.4rem 0.65rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .reset-btn:hover { border-color: #58a6ff; color: #58a6ff; }

    /* ── Grid & Cards ────────────────────────────────────────────── */
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
    .card.dlc   { border-left: 4px solid #f0883e; }
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
    .body { padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1; }
    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .tag { font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 600; }
    .store     { background: #238636; color: #fff; }
    .source    { background: #30363d; color: #c9d1d9; }
    .art       { background: #1f6feb; color: #fff; }
    .dlc-badge { background: #f0883e; color: #fff; }
    h2 { font-size: 1.1rem; margin: 0 0 0.75rem; line-height: 1.35; }
    p  { margin: 0.25rem 0; font-size: 0.88rem; color: #8b949e; }
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
    .empty { text-align: center; grid-column: 1 / -1; color: #8b949e; padding: 3rem; }

    /* ── Quellen-Footer ─────────────────────────────────────────── */
    .sources {
      max-width: 1400px;
      margin: 2rem auto 0;
      padding: 1.25rem;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
    }
    .sources h3 { margin: 0 0 0.75rem; color: #fff; font-size: 1rem; }
    .sources ul { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .sources a {
      font-size: 0.78rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: #21262d;
      border: 1px solid #30363d;
      color: #c9d1d9;
      text-decoration: none;
    }
    .sources a:hover { border-color: #58a6ff; color: #58a6ff; }
    footer { text-align: center; color: #8b949e; font-size: 0.78rem; margin-top: 2rem; }
  `;


// ──────────────────────────────────────────────────────────────────────
// 📄 src/client.js
// ──────────────────────────────────────────────────────────────────────
const CLIENT_SCRIPT = `
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


// ──────────────────────────────────────────────────────────────────────
// 📄 src/html.js
// ──────────────────────────────────────────────────────────────────────

function baueHtml(liste) {
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


// ──────────────────────────────────────────────────────────────────────
// 📄 src/gamerpower.js
// ──────────────────────────────────────────────────────────────────────

/**
 * GamerPower – alle Plattformen.
 */
async function scanGamerPower() {
  const treffer = [];
  try {
    const res = await fetch('https://www.gamerpower.com/api/giveaways?sort-by=value');
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        treffer.push({
          titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
          plattform: item.platforms,
          quelle: 'GamerPower',
          preis: item.worth !== 'N/A' ? item.worth : 'Kostenpflichtig',
          ende:
            item.end_date !== 'N/A'
              ? new Date(item.end_date).toLocaleString('de-DE')
              : 'Solange Vorrat reicht',
          link: item.open_giveaway_url,
          bild: item.image ?? '',
          art: /dlc/i.test(item.type ?? '') ? 'DLC' : 'Spiel',
        });
      }
    }
  } catch (e) {
    console.warn('GamerPower-Scan übersprungen:', e.message);
  }
  return treffer;
}

/**
 * GamerPower – Prime Gaming Filter (für Prime Gaming Scanner).
 */
async function scanGamerPowerPrime() {
  const treffer = [];
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?platform=prime-gaming&sort-by=value'
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        treffer.push({
          titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
          plattform: 'Amazon Prime Gaming',
          quelle: 'GamerPower (Prime Gaming)',
          preis: item.worth !== 'N/A' ? item.worth : 'Kostenpflichtig',
          ende:
            item.end_date !== 'N/A'
              ? new Date(item.end_date).toLocaleString('de-DE')
              : 'Solange Vorrat reicht',
          link: item.open_giveaway_url,
          bild: item.image ?? '',
        });
      }
    }
  } catch (e) {
    console.warn('Prime-Gaming-Scan übersprungen:', e.message);
  }
  return treffer;
}

/**
 * GamerPower – Humble Bundle Filter (platform=steam, description enthält humble).
 */
async function scanGamerPowerHumble() {
  const treffer = [];
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?platform=steam&sort-by=value'
    );
    const data = await res.json();
    if (!Array.isArray(data)) return treffer;
    for (const item of data) {
      if (!/humble/i.test((item.description ?? '') + (item.platforms ?? ''))) continue;
      treffer.push({
        titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
        plattform: 'Humble Bundle',
        quelle: 'GamerPower (Humble Bundle)',
        preis: item.worth !== 'N/A' ? item.worth : 'Kostenpflichtig',
        ende:
          item.end_date !== 'N/A'
            ? new Date(item.end_date).toLocaleString('de-DE')
            : 'Solange Vorrat reicht',
        link: item.open_giveaway_url,
        bild: item.image ?? '',
      });
    }
  } catch (e) {
    console.warn('Humble-Scan übersprungen:', e.message);
  }
  return treffer;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/cheapshark.js
// ──────────────────────────────────────────────────────────────────────
/**
 * CheapShark API – trackt 35+ PC-Spielestores und liefert alle aktuellen 100%-Rabatte.
 * Kein API-Key erforderlich. Preise in USD.
 * Docs: https://apidocs.cheapshark.com/
 */
async function scanCheapShark() {
  try {
    // Nur Deals mit 100% Rabatt (upperPrice=0) und mindestens einer Bewertung
    const url = 'https://www.cheapshark.com/api/1.0/deals?upperPrice=0&pageSize=60&sortBy=Recent';
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((deal) => ({
      titel: deal.title,
      plattform: storeIdZuName(deal.storeID),
      quelle: 'CheapShark API (35+ Stores)',
      preis: `${parseFloat(deal.normalPrice).toFixed(2)} $`,
      ende: 'Zeitlich begrenzt',
      link: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
      bild: deal.thumb || '',
      art: /dlc/i.test(deal.title ?? '') ? 'DLC' : 'Spiel',
    }));
  } catch (e) {
    console.warn('CheapShark-Scan übersprungen:', e.message);
    return [];
  }
}

/** Bekannte CheapShark Store-IDs → lesbarer Name */
function storeIdZuName(id) {
  const stores = {
    '1':  'Steam',
    '2':  'GamersGate',
    '3':  'GreenManGaming',
    '7':  'GOG',
    '8':  'Humble Store',
    '11': 'Fanatical',
    '13': 'Gamesplanet',
    '15': 'GameBillet',
    '21': 'IndieGala',
    '24': '2Game',
    '28': 'WinGameStore',
    '36': 'Epic Games Store',
  };
  return stores[String(id)] ?? `Store #${id}`;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/epic.js
// ──────────────────────────────────────────────────────────────────────


/**
 * Scannt die Epic Games Store API nach aktuellen Gratis-Angeboten.
 * Nutzt den offiziellen Free Games Promotions-Endpunkt.
 */
async function scanEpicGames() {
  try {
    const url = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=de&country=DE&allowCountries=DE';
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    const data = await res.json();
    const spiele = data?.data?.Catalog?.searchStore?.elements || [];

    const treffer = [];
    for (const spiel of spiele) {
      const promotionen = spiel.promotions?.promotionalOffers ?? [];
      const angebote = promotionen.flatMap((p) => p.promotionalOffers ?? []);
      const istGratis = angebote.some((o) => o.discountSetting?.discountPercentage === 0);

      if (istGratis) {
        const slug = spiel.catalogNs?.mappings?.[0]?.pageSlug ?? spiel.productSlug ?? '';
        const endeRaw = angebote[0]?.endDate;
        const ende = endeRaw ? new Date(endeRaw).toLocaleString('de-DE') : 'Begrenzte Zeit';
        const bild =
          spiel.keyImages?.find((i) => i.type === 'OfferImageWide')?.url ??
          spiel.keyImages?.[0]?.url ??
          '';

        treffer.push({
          titel: spiel.title,
          plattform: 'Epic Games Store',
          quelle: 'Offizielle API',
          preis: spiel.price?.totalPrice?.fmtPrice?.originalPrice ?? 'Kostenpflichtig',
          ende,
          link: slug ? `https://store.epicgames.com/de/p/${slug}` : 'https://store.epicgames.com/de/free-games',
          bild,
          art: /dlc|add-?on/i.test(spiel.title ?? '') ? 'DLC' : 'Spiel',
        });
      }
    }
    return treffer;
  } catch (e) {
    console.warn('Epic-Scan übersprungen:', e.message);
    return [];
  }
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/fanatical.js
// ──────────────────────────────────────────────────────────────────────

/**
 * Fanatical – Gratis-Spiele-Seite.
 */
async function scanFanatical() {
  const treffer = [];
  try {
    const res = await fetch('https://www.fanatical.com/de/free-games', {
      headers: { 'User-Agent': USER_AGENT },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('a[href*="/de/game/"], .product-card, [class*="product"]').each((_, el) => {
      const titel = $(el).find('h2, h3, .title, [class*="title"]').first().text().trim()
        || $(el).attr('title') || '';
      const link = $(el).attr('href') ?? $(el).find('a').first().attr('href') ?? '';
      const bild = $(el).find('img').first().attr('src') ?? $(el).find('img').first().attr('data-src') ?? '';
      if (titel && titel.length > 2 && titel.length < 120) {
        treffer.push({
          titel,
          plattform: 'Fanatical',
          quelle: 'Fanatical Free Games',
          preis: 'Gratis',
          ende: 'Zeitlich begrenzt',
          link: link.startsWith('http') ? link : `https://www.fanatical.com${link}`,
          bild,
        });
      }
    });
  } catch (e) {
    console.warn('Fanatical-Scan übersprungen:', e.message);
  }
  // Duplikate innerhalb entfernen
  const seen = new Set();
  return treffer.filter((t) => {
    const k = t.titel.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 25);
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/freetogame.js
// ──────────────────────────────────────────────────────────────────────
async function scanFreeToGame() {
  const treffer = [];
  try {
    const res = await fetch('https://www.freetogame.com/api/games?sort-by=release-date');
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const spiel of data.slice(0, 10)) {
        treffer.push({
          titel: spiel.title,
          plattform: spiel.platform ?? 'PC',
          quelle: 'FreeToGame',
          preis: 'Free-to-Play',
          ende: 'Dauerhaft kostenlos',
          link: spiel.game_url ?? 'https://www.freetogame.com',
          bild: spiel.thumbnail ?? '',
          art: 'Free-to-Play',
        });
      }
    }
  } catch (e) {
    console.warn('FreeToGame-Scan übersprungen:', e.message);
  }
  return treffer;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/gamesplanet.js
// ──────────────────────────────────────────────────────────────────────

async function scanGamesplanet() {
  const treffer = [];
  try {
    const res = await fetch('https://de.gamesplanet.com/games?price=0', {
      headers: { 'User-Agent': USER_AGENT },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('a, div, article').each((_, el) => {
      const titel = $(el).find('h2, h3, .title, [class*="title"], [class*="name"]').first().text().trim();
      const link = $(el).attr('href') ?? $(el).find('a').first().attr('href') ?? '';
      const bild = $(el).find('img').first().attr('src') ?? $(el).find('img').first().attr('data-src') ?? '';
      if (titel && titel.length > 2 && titel.length < 120) {
        treffer.push({
          titel,
          plattform: 'Gamesplanet',
          quelle: 'Gamesplanet Free Games',
          preis: 'Gratis',
          ende: 'Zeitlich begrenzt',
          link: link.startsWith('http') ? link : `https://de.gamesplanet.com${link}`,
          bild,
        });
      }
    });
  } catch (e) {
    console.warn('Gamesplanet-Scan übersprungen:', e.message);
  }
  const seen = new Set();
  return treffer.filter((t) => {
    const k = t.titel.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 25);
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/gog.js
// ──────────────────────────────────────────────────────────────────────
/**
 * Scannt die GOG-Datenbank nach aktuellen Gratis-Angeboten.
 * Nutzt die öffentliche GOG-Catalog-API.
 */
async function scanGOG() {
  try {
    const url = 'https://catalog.gog.com/v1/catalog?productType=in:game,pack&discounted=eq:true&price=between:0,0&limit=48&locale=de-DE';
    const res = await fetch(url);
    const data = await res.json();
    const produkte = data?.products ?? [];

    return produkte.map((p) => ({
      titel: p.title,
      plattform: 'GOG',
      quelle: 'GOG Catalog API',
      preis: p.price?.base ?? 'Kostenpflichtig',
      ende: 'Zeitlich begrenzt',
      link: `https://www.gog.com${p.storeLink ?? '/de/games'}`,
      bild: p.coverHorizontal ?? '',
      art: /dlc|add-?on|erweiterung/i.test(p.title ?? '') ? 'DLC' : 'Spiel',
    }));
  } catch (e) {
    console.warn('GOG-Scan übersprungen:', e.message);
    return [];
  }
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/greenmangaming.js
// ──────────────────────────────────────────────────────────────────────

async function scanGreenManGaming() {
  const treffer = [];
  try {
    const res = await fetch('https://www.greenmangaming.com/de/free-games/', {
      headers: { 'User-Agent': USER_AGENT },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('a, div, article').each((_, el) => {
      const titel = $(el).find('h2, h3, .title, [class*="title"], [class*="name"]').first().text().trim();
      const link = $(el).attr('href') ?? $(el).find('a').first().attr('href') ?? '';
      const bild = $(el).find('img').first().attr('src') ?? $(el).find('img').first().attr('data-src') ?? '';
      if (
        titel && titel.length > 2 && titel.length < 120 &&
        /free|gratis|kostenlos/i.test($(el).text())
      ) {
        treffer.push({
          titel,
          plattform: 'Green Man Gaming',
          quelle: 'Green Man Gaming Free Games',
          preis: 'Gratis',
          ende: 'Zeitlich begrenzt',
          link: link.startsWith('http') ? link : `https://www.greenmangaming.com${link}`,
          bild,
        });
      }
    });
  } catch (e) {
    console.warn('GreenManGaming-Scan übersprungen:', e.message);
  }
  const seen = new Set();
  return treffer.filter((t) => {
    const k = t.titel.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 25);
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/indiegala.js
// ──────────────────────────────────────────────────────────────────────

async function scanIndieGala() {
  const treffer = [];
  try {
    const res = await fetch('https://www.indiegala.com/freebies', {
      headers: { 'User-Agent': USER_AGENT },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('.freebies-item, .showcase-item, [class*="freebie"]').each((_, el) => {
      const titel = $(el).find('h2, h3, .title, [class*="title"]').first().text().trim();
      const link = $(el).find('a').first().attr('href') ?? '';
      const bild = $(el).find('img').first().attr('src') ?? '';

      if (titel && titel.length > 2) {
        treffer.push({
          titel,
          plattform: 'IndieGala',
          quelle: 'IndieGala Freebies',
          preis: 'Gratis',
          ende: 'Zeitlich begrenzt',
          link: link.startsWith('http') ? link : `https://www.indiegala.com${link}`,
          bild,
        });
      }
    });
  } catch (e) {
    console.warn('IndieGala-Scan übersprungen:', e.message);
  }
  return treffer;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/itch.js
// ──────────────────────────────────────────────────────────────────────
async function scanItch() {
  const treffer = [];
  try {
    const res = await fetch('https://itch.io/games/on-sale?format=json&min_price=0&max_price=0');
    const data = await res.json();
    for (const g of (data?.games ?? []).slice(0, 20)) {
      treffer.push({
        titel: g.title,
        plattform: 'Itch.io',
        quelle: 'Itch.io',
        preis: g.min_price !== undefined ? `${(g.min_price / 100).toFixed(2)} €` : 'Gratis',
        ende: 'Zeitlich begrenzt',
        link: g.url ?? 'https://itch.io/games/on-sale',
        bild: g.cover_image ?? '',
      });
    }
  } catch (e) {
    console.warn('Itch.io-Scan übersprungen:', e.message);
  }
  return treffer;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/rockstar.js
// ──────────────────────────────────────────────────────────────────────

async function scanRockstar() {
  const treffer = [];
  try {
    const res = await fetch('https://www.rockstargames.com/newswire', {
      headers: { 'User-Agent': USER_AGENT },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('a, div, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (
        /kostenlos|gratis|free/i.test(text) &&
        /spiel|game|launcher|gta|red dead|bully|max payne/i.test(text) &&
        text.length < 120
      ) {
        const href = $(el).attr('href') ?? $(el).find('a').attr('href');
        const link = href
          ? href.startsWith('http')
            ? href
            : `https://www.rockstargames.com${href}`
          : 'https://www.rockstargames.com';
        treffer.push({
          titel: text,
          plattform: 'Rockstar Games Launcher',
          quelle: 'Rockstar Newswire',
          preis: 'Aktionspreis 0 €',
          ende: 'Siehe Herstellerseite',
          link,
          bild: '',
        });
      }
    });
  } catch (e) {
    console.warn('Rockstar-Scan Hinweis:', e.message);
  }
  return treffer;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/steam.js
// ──────────────────────────────────────────────────────────────────────
/**
 * Scannt die Steam Specials API nach 100%-Rabatten (effektiv kostenlose Spiele).
 * Nutzt den offiziellen featuredcategories-Endpunkt.
 */
async function scanSteam() {
  try {
    const url = 'https://store.steampowered.com/api/featuredcategories?cc=de&l=german';
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.specials?.items ?? [];

    return items
      .filter((item) => item.discount_percent === 100)
      .map((item) => {
        const appIdMatch = item.logo?.match(/\/apps\/(\d+)\//);
        const appId = appIdMatch ? appIdMatch[1] : '';
        return {
          titel: item.name,
          plattform: 'Steam',
          quelle: 'Steam Specials API',
          preis: item.original_price ? `${(item.original_price / 100).toFixed(2)} €` : '100% Rabatt',
          ende: 'Zeitlich begrenzt',
          link: appId
            ? `https://store.steampowered.com/app/${appId}/`
            : 'https://store.steampowered.com/search/?specials=1&maxprice=free',
          bild: item.large_capsule_image || item.small_capsule_image || '',
          art: /dlc/i.test(item.name ?? '') ? 'DLC' : 'Spiel',
        };
      });
  } catch (e) {
    console.warn('Steam-Scan übersprungen:', e.message);
    return [];
  }
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/stove.js
// ──────────────────────────────────────────────────────────────────────

async function scanStove() {
  const treffer = [];
  try {
    const res = await fetch(
      'https://www.onstove.com/event/list?category=GAME_GIVE_AWAY&page=1&pageSize=10',
      { headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' } }
    );
    if (res.ok && res.headers.get('content-type')?.includes('json')) {
      const data = await res.json();
      for (const item of (data?.list ?? data?.data ?? []).slice(0, 10)) {
        const titel = item.title ?? item.eventName ?? item.name;
        if (!titel) continue;
        treffer.push({
          titel,
          plattform: 'STOVE',
          quelle: 'STOVE Giveaways',
          preis: 'Gratis',
          ende: item.endDate
            ? new Date(item.endDate).toLocaleString('de-DE')
            : 'Zeitlich begrenzt',
          link: item.url ?? 'https://www.onstove.com/event',
          bild: item.imageUrl ?? item.thumbnail ?? '',
        });
      }
    }
  } catch (e) {
    console.warn('STOVE-Scan übersprungen:', e.message);
  }
  return treffer;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/ubisoft.js
// ──────────────────────────────────────────────────────────────────────

async function scanUbisoft() {
  const treffer = [];
  try {
    const res = await fetch('https://www.ubisoft.com/de-de/games', {
      headers: { 'User-Agent': USER_AGENT },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('h2, h3').each((_, el) => {
      const titel = $(el).text().trim();
      if (
        /kostenlos|gratis|free/i.test(titel) &&
        titel.length > 3 &&
        titel.length < 80
      ) {
        treffer.push({
          titel,
          plattform: 'Ubisoft Connect',
          quelle: 'Ubisoft Direkt-Scan',
          preis: 'Gratis-Aktion',
          ende: 'Siehe Ubisoft-Seite',
          link: 'https://www.ubisoft.com/de-de/games',
          bild: '',
        });
      }
    });
  } catch (e) {
    console.warn('Ubisoft-Scan Hinweis:', e.message);
  }
  return treffer;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/freestuff.js
// ──────────────────────────────────────────────────────────────────────
/**
 * FreeStuffBot API – trackt 100%-Rabatt-Aktionen, Free Weekends und DLC-Giveaways.
 * Kostenlos für den Public-Plan (kein API-Key nötig für den öffentlichen Feed).
 * Docs: https://docs.freestuffbot.xyz/
 */
async function scanFreeStuff() {
  try {
    // Öffentlicher Feed gibt alle aktuell kostenlosen Produkte zurück
    const listRes = await fetch('https://api.freestuffbot.xyz/v1/game/list/free', {
      headers: { 'Authorization': 'Basic public' },
    });
    const listData = await listRes.json();

    if (!listData?.success || !Array.isArray(listData.data) || listData.data.length === 0) {
      return [];
    }

    // Details zu den ersten 20 IDs laden
    const ids = listData.data.slice(0, 20).join('+');
    const detailRes = await fetch(
      `https://api.freestuffbot.xyz/v1/game/${ids}/info`,
      { headers: { 'Authorization': 'Basic public' } }
    );
    const detailData = await detailRes.json();
    if (!detailData?.success) return [];

    const treffer = [];
    for (const [, spiel] of Object.entries(detailData.data ?? {})) {
      if (!spiel || spiel.status !== 'published') continue;
      treffer.push({
        titel: spiel.title,
        plattform: spiel.store ?? 'PC',
        quelle: 'FreeStuffBot API',
        preis: spiel.org_price?.dollar
          ? `${spiel.org_price.dollar.toFixed(2)} $`
          : 'Kostenpflichtig',
        ende: spiel.until
          ? new Date(spiel.until * 1000).toLocaleString('de-DE')
          : 'Zeitlich begrenzt',
        link: spiel.url ?? spiel.store_meta?.storefront_link ?? 'https://freestuffbot.xyz',
        bild: spiel.thumbnail ?? '',
        art: /dlc|add-?on/i.test(spiel.title ?? '') ? 'DLC' : 'Spiel',
      });
    }
    return treffer;
  } catch (e) {
    console.warn('FreeStuffBot-Scan übersprungen:', e.message);
    return [];
  }
}


// ──────────────────────────────────────────────────────────────────────
// 📄 server.js
// ──────────────────────────────────────────────────────────────────────


const PORT                = parseInt(process.env.PORT               ?? '3000', 10);
const SCAN_INTERVAL_HOURS = parseInt(process.env.SCAN_INTERVAL_HOURS ?? '6',    10);
const HTML_PATH           = path.resolve('gratis-spiele.html');

// ── Scanner ────────────────────────────────────────────────────────────────

async function runScan() {
  console.log(`[${timestamp()}] 🔍 Starte Scan...`);
  try {
    const ergebnisse = await Promise.all([
      // Offizielle Store-APIs
      scanEpicGames(),
      scanSteam(),
      scanGOG(),
      // Aggregatoren / Datenbanken
      scanCheapShark(),
      scanFreeStuff(),
      scanGamerPower(),
      scanGamerPowerPrime(),
      scanGamerPowerHumble(),
      scanFreeToGame(),
      // Direkter Store-Scan
      scanItch(),
      scanIndieGala(),
      scanStove(),
      scanFanatical(),
      scanGreenManGaming(),
      scanGamesplanet(),
      scanRockstar(),
      scanUbisoft(),
    ]);

    const rohListe = ergebnisse.flat();

    // Duplikate anhand des Titels bereinigen (case-insensitive, bidirektional)
    const finaleListe = [];
    for (const eintrag of rohListe) {
      const titelNorm = eintrag.titel.toLowerCase();
      const doppelt = finaleListe.some((x) => {
        const xNorm = x.titel.toLowerCase();
        return xNorm.includes(titelNorm) || titelNorm.includes(xNorm);
      });
      if (!doppelt) finaleListe.push(eintrag);
    }

    fs.writeFileSync(HTML_PATH, baueHtml(finaleListe), 'utf-8');
    console.log(`[${timestamp()}] ✅ Scan fertig – ${finaleListe.length} Angebote gefunden.`);
  } catch (err) {
    console.error(`[${timestamp()}] ❌ Scan-Fehler:`, err.message);
  }
}

// ── HTTP-Server ────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/status') {
    const stat = fs.existsSync(HTML_PATH) ? fs.statSync(HTML_PATH) : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      letzterScan:   stat ? stat.mtime.toLocaleString('de-DE') : 'noch kein Scan',
      naechsterScan: `in ca. ${SCAN_INTERVAL_HOURS}h`,
      port: PORT,
    }));
    return;
  }

  if (url.pathname === '/scan') {
    runScan();
    res.writeHead(202, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Scan gestartet – Seite in ~30 Sekunden aktuell.\n');
    return;
  }

  if (!fs.existsSync(HTML_PATH)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Scan läuft noch, bitte kurz warten…');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  });
  fs.createReadStream(HTML_PATH).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${timestamp()}] 🚀 Server läuft auf Port ${PORT}`);
  console.log(`[${timestamp()}] 🔄 Scan-Intervall: alle ${SCAN_INTERVAL_HOURS} Stunden`);
  console.log(`[${timestamp()}]    Routen: /  →  HTML-Seite | /status  →  JSON | /scan  →  Scan starten`);
});

runScan();
setInterval(runScan, SCAN_INTERVAL_HOURS * 60 * 60 * 1000);

function timestamp() {
  return new Date().toLocaleString('de-DE');
}
