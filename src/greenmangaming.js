import * as cheerio from 'cheerio';
import { USER_AGENT } from './constants.js';

export async function scanGreenManGaming() {
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
