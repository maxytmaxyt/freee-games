import * as cheerio from 'cheerio';
import { USER_AGENT } from './constants.js';

export async function scanGamesplanet() {
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
