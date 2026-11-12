/**
 * Scannt Community-Datenbanken nach Gratis-Spielen.
 * Quellen: GamerPower API, Reddit r/FreeGameFindings, Itch.io
 */
export async function scanCommunityDeals() {
  const treffer = [];

  // A) GamerPower API (erfasst Epic, Steam, GOG, Origin, Rockstar, Ubisoft, Itch.io u.v.m.)
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?platform=pc&type=game&sort-by=value'
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        treffer.push({
          titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
          plattform: item.platforms,
          quelle: 'GamerPower Datenbank',
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

  // B) Reddit r/FreeGameFindings (JSON-Feed)
  try {
    const res = await fetch(
      'https://www.reddit.com/r/FreeGameFindings/new.json?limit=25',
      { headers: { 'User-Agent': 'NodeGratisScanner/1.1' } }
    );
    const json = await res.json();
    const posts = json?.data?.children ?? [];

    for (const post of posts) {
      const d = post.data;
      if (
        d.link_flair_text !== 'Expired' &&
        /\[(Steam|Epic|GOG|Ubisoft|Rockstar|EA|Origin|PC|Itch\.io)\]\s*\(Game\)/i.test(d.title)
      ) {
        const saubererTitel = d.title.replace(/^\[.*?\]\s*\(Game\)\s*/i, '').trim();
        const plattformMatch = d.title.match(/^\[(.*?)\]/);
        treffer.push({
          titel: saubererTitel,
          plattform: plattformMatch ? plattformMatch[1] : 'PC',
          quelle: 'r/FreeGameFindings',
          preis: '100 % Gratis',
          ende: 'Aktuell aktiv',
          link: d.url,
          bild: d.thumbnail?.startsWith('http') ? d.thumbnail : '',
        });
      }
    }
  } catch (e) {
    console.warn('Reddit-Scan übersprungen:', e.message);
  }

  // C) Itch.io Sale-Feed (kostenlose Spiele mit Preis 0)
  try {
    const res = await fetch('https://itch.io/games/on-sale?format=json&min_price=0&max_price=0');
    const data = await res.json();
    const games = data?.games ?? [];
    for (const g of games.slice(0, 20)) {
      treffer.push({
        titel: g.title,
        plattform: 'Itch.io',
        quelle: 'Itch.io Sale-Feed',
        preis: g.min_price !== undefined ? `${g.min_price / 100} €` : 'Kostenpflichtig',
        ende: 'Zeitlich begrenzt',
        link: g.url ?? 'https://itch.io/games/on-sale',
        bild: g.cover_image ?? '',
      });
    }
  } catch (e) {
    console.warn('Itch.io-Scan übersprungen:', e.message);
  }

  return treffer;
}
