import * as cheerio from 'cheerio';
import { USER_AGENT } from './constants.js';

/**
 * Fanatical – Gratis-Spiele-Seite.
 */
export async function scanFanatical() {
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
