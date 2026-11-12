import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

/**
 * Scannt Hersteller-Webseiten direkt nach Gratis-Aktionen (Rockstar & Ubisoft).
 */
export async function scanHersteller() {
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
