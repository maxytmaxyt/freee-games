// ============================================================
// all.js – automatisch gebündelt aus allen Quelldateien
// Generiert: 12.11.2026, 21:47:09
// Quelldateien: src/constants.js, src/html.js, src/epic.js, src/steam.js, src/gog.js, src/cheapshark.js, src/freestuff.js, src/prime.js, src/humble.js, src/hersteller.js, src/community.js, server.js
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
// 📄 src/html.js
// ──────────────────────────────────────────────────────────────────────
/**
 * Erzeugt die finale HTML-Ausgabe als vollständige Seite.
 */
function baueHtml(liste) {
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
        };
      });
  } catch (e) {
    console.warn('Steam-Scan übersprungen:', e.message);
    return [];
  }
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
    }));
  } catch (e) {
    console.warn('GOG-Scan übersprungen:', e.message);
    return [];
  }
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
      });
    }
    return treffer;
  } catch (e) {
    console.warn('FreeStuffBot-Scan übersprungen:', e.message);
    return [];
  }
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/prime.js
// ──────────────────────────────────────────────────────────────────────
/**
 * Amazon Prime Gaming + FreeToGame Datenbank.
 * Amazon hat keine öffentliche API → GamerPower mit platform=prime-gaming nutzen.
 */
async function scanPrimeGaming() {
  const treffer = [];

  // A) GamerPower hat einen dedizierten Prime Gaming Filter
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

  // B) FreeToGame – dauerhaft kostenlose F2P-Spiele (Top 10 nach Release-Datum)
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
        });
      }
    }
  } catch (e) {
    console.warn('FreeToGame-Scan übersprungen:', e.message);
  }

  return treffer;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/humble.js
// ──────────────────────────────────────────────────────────────────────
/**
 * Humble Bundle – scannt den Store nach aktuellen Gratis-Produkten.
 * Humble bietet keine öffentliche API, daher holen wir Gratisangebote
 * über den GamerPower-Filter und den Community-Subreddit.
 */
async function scanHumble() {
  const treffer = [];

  // GamerPower nach Humble-Bundle-Giveaways filtern
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?platform=steam&sort-by=value',
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    for (const item of data) {
      if (!/humble/i.test(item.description ?? '' + item.platforms ?? '')) continue;
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

  // Direkter Humble Choice / Trove-Hinweis als statischer Eintrag
  treffer.push({
    titel: 'Humble Choice – Monatliche Gratis-Spiele',
    plattform: 'Humble Bundle',
    quelle: 'Humble Bundle (Direktlink)',
    preis: 'Humble Choice Abo',
    ende: 'Monatlich wechselnd',
    link: 'https://www.humblebundle.com/membership',
    bild: '',
  });

  return treffer;
}


// ──────────────────────────────────────────────────────────────────────
// 📄 src/hersteller.js
// ──────────────────────────────────────────────────────────────────────



/**
 * Scannt Hersteller-Webseiten direkt nach Gratis-Aktionen (Rockstar & Ubisoft).
 */
async function scanHersteller() {
  const treffer = [];

  // A) Rockstar Games Newswire
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

  // B) Ubisoft Free Events
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
// 📄 src/community.js
// ──────────────────────────────────────────────────────────────────────
/**
 * Scannt Community-Datenbanken nach Gratis-Spielen.
 *
 * Reddit .json ist seit Mai 2026 auf Server-IPs geblockt (403).
 * Ersatz: GamerPower (breiter Filter), IndieGala-Feed, STOVE-Giveaways.
 */

async function scanCommunityDeals() {
  const treffer = [];

  // A) GamerPower – alle Plattformen, nicht nur PC
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?sort-by=value'
    );
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
        });
      }
    }
  } catch (e) {
    console.warn('GamerPower-Scan übersprungen:', e.message);
  }

  // B) IndieGala – scannt die Freebies-Seite direkt
  try {
    const res = await fetch('https://www.indiegala.com/freebies', {
      headers: { 'User-Agent': USER_AGENT },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('.freebies-item, .showcase-item, [class*="freebie"]').each((_, el) => {
      const titel = $(el).find('h2, h3, .title, [class*="title"]').first().text().trim();
      const link  = $(el).find('a').first().attr('href') ?? '';
      const bild  = $(el).find('img').first().attr('src') ?? '';

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

  // C) Itch.io – kostenlose Spiele im Sale-Feed
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

  // D) STOVE – koreanische Gaming-Plattform mit regelmäßigen PC-Giveaways
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
          link: item.url ?? `https://www.onstove.com/event`,
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
// 📄 server.js
// ──────────────────────────────────────────────────────────────────────


const PORT = parseInt(process.env.PORT ?? '3000', 10);
const SCAN_INTERVAL_HOURS = parseInt(process.env.SCAN_INTERVAL_HOURS ?? '6', 10);
const HTML_PATH = path.resolve('gratis-spiele.html');

// ── Scanner ────────────────────────────────────────────────────────────────

async function runScan() {
  console.log(`[${timestamp()}] 🔍 Starte Scan...`);
  try {
    const ergebnisse = await Promise.all([
      scanEpicGames(),
      scanSteam(),
      scanGOG(),
      scanCheapShark(),
      scanFreeStuff(),
      scanPrimeGaming(),
      scanHumble(),
      scanHersteller(),
      scanCommunityDeals(),
    ]);

    const rohListe = ergebnisse.flat();
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
  const url = new URL(req.url, `http://localhost`);

  // /status – JSON-Statusseite für Monitoring
  if (url.pathname === '/status') {
    const stat = fs.existsSync(HTML_PATH) ? fs.statSync(HTML_PATH) : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      letzterScan: stat ? stat.mtime.toLocaleString('de-DE') : 'noch kein Scan',
      naechsterScan: `in ca. ${SCAN_INTERVAL_HOURS}h`,
      port: PORT,
    }));
    return;
  }

  // /scan – manuellen Scan auslösen
  if (url.pathname === '/scan') {
    runScan();
    res.writeHead(202, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Scan gestartet – Seite in ~30 Sekunden aktuell.\n');
    return;
  }

  // / – HTML-Seite ausliefern
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
  console.log(`[${timestamp()}]    Routen: /  →  HTML-Seite`);
  console.log(`[${timestamp()}]            /status  →  JSON-Status`);
  console.log(`[${timestamp()}]            /scan    →  Scan manuell starten`);
});

// ── Scheduler ─────────────────────────────────────────────────────────────

// Sofort beim Start scannen, dann alle X Stunden
runScan();
setInterval(runScan, SCAN_INTERVAL_HOURS * 60 * 60 * 1000);

// ── Hilfsfunktionen ───────────────────────────────────────────────────────

function timestamp() {
  return new Date().toLocaleString('de-DE');
}
