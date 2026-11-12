/**
 * Scannt Community-Datenbanken nach Gratis-Spielen.
 *
 * Reddit .json ist seit Mai 2026 auf Server-IPs geblockt (403).
 * Ersatz: GamerPower (breiter Filter), IndieGala-Feed, STOVE-Giveaways.
 */
import * as cheerio from 'cheerio';
import { USER_AGENT } from './constants.js';

export async function scanCommunityDeals() {
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
