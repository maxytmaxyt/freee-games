import * as cheerio from 'cheerio';
import { USER_AGENT } from './constants.js';

export async function scanIndieGala() {
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
