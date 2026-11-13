import * as cheerio from 'cheerio';
import { USER_AGENT } from './constants.js';

export async function scanUbisoft() {
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
