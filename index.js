import fs from 'node:fs';
import * as cheerio from 'cheerio';
import open from 'open';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// 1. Epic Games Store (Offizielle API)
async function scanEpicGames() {
  try {
    const url = 'https://epicgames.com';
    const res = await fetch(url);
    const data = await res.json();
    const spiele = data?.data?.Catalog?.searchStore?.elements || [];

    const treffer = [];
    for (const spiel of spiele) {
      const angebote = spiel.promotions?.promotionalOffers?.?.promotionalOffers || [];
      const istGratis = angebote.some((o) => o.discountSetting?.discountPercentage === 0);

      if (istGratis) {
        const slug = spiel.catalogNs?.mappings?.?.pageSlug || spiel.productSlug || '';
        const ende = angebote?.endDate ? new Date(angebote.endDate).toLocaleString('de-DE') : 'Begrenzte Zeit';
        const bild = spiel.keyImages?.find((i) => i.type === 'OfferImageWide')?.url || spiel.keyImages?.?.url || '';

        treffer.push({
          titel: spiel.title,
          plattform: 'Epic Games Store',
          quelle: 'Offizieller Store',
          preis: spiel.price?.totalPrice?.fmtPrice?.originalPrice || 'Kostenpflichtig',
          ende,
          link: slug ? `https://epicgames.com{slug}` : 'https://epicgames.com',
          bild
        });
      }
    }
    return treffer;
  } catch (e) {
    console.warn('Epic-Scan übersprungen:', e.message);
    return [];
  }
}

// 2. Steam Store (100-%-Rabatte)
async function scanSteam() {
  try {
    const url = 'https://steampowered.com';
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.items || [];

    return items.map((item) => {
      const appIdMatch = item.logo?.match(/\/apps\/(\d+)\//);
      const appId = appIdMatch ? appIdMatch : '';
      return {
        titel: item.name,
        plattform: 'Steam',
        quelle: 'Steam Specials',
        preis: '100 % Rabatt',
        ende: 'Zeitlich begrenzt',
        link: appId ? `https://steampowered.com{appId}/` : 'https://steampowered.com',
        bild: item.logo || ''
      };
    });
  } catch (e) {
    console.warn('Steam-Scan übersprungen:', e.message);
    return [];
  }
}

// 3. Hersteller-Webseiten direkt durchsuchen (Rockstar Games & Ubisoft)
async function scanHersteller() {
  const treffer = [];

  // A) Rockstar Games Store / Newswire prüfen
  try {
    const res = await fetch('https://rockstargames.com', { headers: { 'User-Agent': USER_AGENT } });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('a, div, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (/kostenlos|gratis|free/i.test(text) && /spiel|game|launcher|gta|red dead|bully|max payne/i.test(text) && text.length < 120) {
        const href = $(el).attr('href') || $(el).find('a').attr('href');
        const link = href ? (href.startsWith('http') ? href : `https://rockstargames.com${href}`) : 'https://rockstargames.com';
        treffer.push({
          titel: text,
          plattform: 'Rockstar Games Launcher',
          quelle: 'Rockstar Direkt-Scan',
          preis: 'Aktionspreis 0 €',
          ende: 'Siehe Herstellerseite',
          link,
          bild: ''
        });
      }
    });
  } catch (e) {
    console.warn('Rockstar-Scan Hinweis:', e.message);
  }

  // B) Ubisoft Free Events / Giveaways prüfen
  try {
    const res = await fetch('https://ubisoft.com', { headers: { 'User-Agent': USER_AGENT } });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('h2, h3').each((_, el) => {
      const titel = $(el).text().trim();
      if (titel.length > 3 && titel.length < 80 && !/ubisoft|konto|hilfe|news/i.test(titel)) {
        treffer.push({
          titel,
          plattform: 'Ubisoft Connect',
          quelle: 'Ubisoft Direkt-Scan',
          preis: 'Gratis-Aktion',
          ende: 'Siehe Ubisoft-Seite',
          link: 'https://ubisoft.com',
          bild: ''
        });
      }
    });
  } catch (e) {
    console.warn('Ubisoft-Scan Hinweis:', e.message);
  }

  return treffer;
}

// 4. Community-Tracker für alle Publisher (GOG, Rockstar, EA, Itch.io, Steam, Epic)
async function scanCommunityDeals() {
  const treffer = [];

  // A) GamerPower API
  try {
    const res = await fetch('https://gamerpower.com');
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        treffer.push({
          titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
          plattform: item.platforms,
          quelle: 'GamerPower Datenbank',
          preis: item.worth || 'Kostenpflichtig',
          ende: item.end_date !== 'N/A' ? new Date(item.end_date).toLocaleString('de-DE') : 'Solange Vorrat reicht',
          link: item.open_giveaway_url,
          bild: item.image || ''
        });
      }
    }
  } catch (e) {
    console.warn('GamerPower-Scan übersprungen:', e.message);
  }

  // B) Reddit r/FreeGameFindings (erfasst sofort Rockstar, EA, Blizzard, GOG & Indie-Seiten)
  try {
    const res = await fetch('https://reddit.com', {
      headers: { 'User-Agent': 'NodeGratisScanner/1.0' }
    });
    const json = await res.json();
    const posts = json?.data?.children || [];

    for (const post of posts) {
      const d = post.data;
      // Filtert nach PC-Spielen (ignoriert DLCs, Betas oder abgelaufene Posts)
      if (d.link_flair_text !== 'Expired' && /\[(Steam|Epic|GOG|Ubisoft|Rockstar|EA|Origin|PC|Itch\.io)\]\s*\(Game\)/i.test(d.title)) {
        const saubererTitel = d.title.replace(/^\[.*?\]\s*\(Game\)\s*/i, '').trim();
        const plattformMatch = d.title.match(/^\[(.*?)\]/);
        treffer.push({
          titel: saubererTitel,
          plattform: plattformMatch ? plattformMatch : 'PC',
          quelle: 'r/FreeGameFindings Live',
          preis: '100 % Gratis',
          ende: 'Aktuell aktiv',
          link: d.url,
          bild: d.thumbnail?.startsWith('http') ? d.thumbnail : ''
        });
      }
    }
  } catch (e) {
    console.warn('Reddit-Scan übersprungen:', e.message);
  }

  return treffer;
}

// HTML-Übersicht erstellen
function baueHtml(liste) {
  const zeitstempel = new Date().toLocaleString('de-DE');
  const karten = liste.map((s) => `
    <div class="card">
      ${s.bild ? `<img src="${s.bild}" alt="${s.titel}">` : `<div class="no-img">${s.plattform}</div>`}
      <div class="body">
        <div class="tags">
          <span class="tag store">${s.plattform}</span>
          <span class="tag source">${s.quelle}</span>
        </div>
        <h2>${s.titel}</h2>
        <p><strong>Regulär:</strong> <s>${s.preis}</s> → <span class="free">0,00 € (Für immer)</span></p>
        <p><strong>Zeitraum:</strong> ${s.ende}</p>
        <a href="${s.link}" target="_blank" class="btn">Angebot öffnen</a>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>PC Gratis-Spiele Scanner</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f1115; color: #e6e8ec; margin: 0; padding: 2rem; }
    header { text-align: center; margin-bottom: 2.5rem; }
    h1 { margin: 0; font-size: 2rem; color: #ffffff; }
    .meta { color: #8b949e; margin-top: 0.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 1.5rem; max-width: 1300px; margin: 0 auto; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s; }
    .card:hover { transform: translateY(-4px); border-color: #58a6ff; }
    .card img { width: 100%; height: 165px; object-fit: cover; background: #21262d; }
    .no-img { height: 165px; background: linear-gradient(135deg, #1f2937, #111827); display: flex; align-items: center; justify-content: center; font-weight: bold; color: #8b949e; font-size: 1.2rem; }
    .body { padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1; }
    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .tag { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 600; }
    .store { background: #238636; color: #fff; }
    .source { background: #30363d; color: #c9d1d9; }
    h2 { font-size: 1.15rem; margin: 0 0 0.8rem 0; line-height: 1.35; }
    p { margin: 0.25rem 0; font-size: 0.9rem; color: #8b949e; }
    .free { color: #3fb950; font-weight: bold; }
    .btn { margin-top: auto; padding-top: 1rem; display: block; text-align: center; background: #1f6feb; color: #fff; text-decoration: none; padding: 0.75rem; border-radius: 8px; font-weight: 600; margin-top: 1.25rem; }
    .btn:hover { background: #388bfd; }
  </style>
</head>
<body>
  <header>
    <h1>Aktuelle Gratis-Spiele (Dauerhaft behalten)</h1>
    <div class="meta">Letzter Scan: ${zeitstempel} • Gefundene Aktionen: ${liste.length}</div>
  </header>
  <div class="grid">
    ${karten || '<p style="text-align:center;grid-column:1/-1;">Aktuell wurden keine neuen Gratis-Aktionen gefunden.</p>'}
  </div>
</body>
</html>`;
}

async function main() {
  console.log('Starte Multi-Scanner (Steam, Epic, Rockstar, Ubisoft, GOG & Community)...');

  const ergebnisse = await Promise.all([
    scanEpicGames(),
    scanSteam(),
    scanHersteller(),
    scanCommunityDeals()
  ]);

  const rohListe = ergebnisse.flat();
  const finaleListe = [];

  // Duplikate bereinigen
Verwende Code mit Vorsicht.
for (const eintrag of rohListe) {
const doppelt = finaleListe.some(
(x) => x.titel.toLowerCase().includes(eintrag.titel.toLowerCase()) ||
eintrag.titel.toLowerCase().includes(x.titel.toLowerCase())
);
if (!doppelt) {
finaleListe.push(eintrag);
}
}
const dateiName = 'gratis-spiele.html';
fs.writeFileSync(dateiName, baueHtml(finaleListe), 'utf-8');
console.log(Fertig! ${finaleListe.length} Angebote in "${dateiName}" gespeichert. Öffne Browser...);
await open(dateiName);
}
main();
