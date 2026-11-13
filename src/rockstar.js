import * as cheerio from 'cheerio';
import { USER_AGENT } from './constants.js';

export async function scanRockstar() {
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
