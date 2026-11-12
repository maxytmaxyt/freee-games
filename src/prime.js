/**
 * Amazon Prime Gaming + FreeToGame Datenbank.
 * Amazon hat keine öffentliche API → GamerPower mit platform=prime-gaming nutzen.
 */
export async function scanPrimeGaming() {
  const treffer = [];

  // A) GamerPower hat einen dedizierten Prime Gaming Filter
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?platform=prime-gaming&sort-by=value'
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        treffer.push({
          titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
          plattform: 'Amazon Prime Gaming',
          quelle: 'GamerPower (Prime Gaming)',
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
    console.warn('Prime-Gaming-Scan übersprungen:', e.message);
  }

  // B) FreeToGame – dauerhaft kostenlose F2P-Spiele (Top 10 nach Release-Datum)
  try {
    const res = await fetch('https://www.freetogame.com/api/games?sort-by=release-date');
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const spiel of data.slice(0, 10)) {
        treffer.push({
          titel: spiel.title,
          plattform: spiel.platform ?? 'PC',
          quelle: 'FreeToGame',
          preis: 'Free-to-Play',
          ende: 'Dauerhaft kostenlos',
          link: spiel.game_url ?? 'https://www.freetogame.com',
          bild: spiel.thumbnail ?? '',
        });
      }
    }
  } catch (e) {
    console.warn('FreeToGame-Scan übersprungen:', e.message);
  }

  return treffer;
}
