/**
 * Amazon Prime Gaming – monatliche Gratis-Spiele.
 * Da Amazon keine öffentliche API anbietet, holen wir die Daten
 * über den GamerPower-Feed (der Prime Gaming explizit als Quelle erfasst)
 * und über den FreeToGame-API-Filter.
 */
export async function scanPrimeGaming() {
  const treffer = [];

  // A) GamerPower filtert nach Prime-Gaming-Aktionen (platform=prime-gaming)
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?platform=epic-games-store+steam+gog&type=game&sort-by=value',
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    for (const item of data) {
      // Nur Prime Gaming Einträge
      if (!/prime\s*gaming/i.test(item.platforms + ' ' + (item.description ?? ''))) continue;
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
  } catch (e) {
    console.warn('Prime-Gaming-Scan übersprungen:', e.message);
  }

  // B) FreeToGame listet gelegentlich Prime-Games auf
  try {
    const res = await fetch('https://www.freetogame.com/api/games?sort-by=release-date');
    const data = await res.json();
    if (!Array.isArray(data)) return treffer;

    for (const spiel of data.slice(0, 10)) {
      treffer.push({
        titel: spiel.title,
        plattform: spiel.platform ?? 'PC',
        quelle: 'FreeToGame Datenbank',
        preis: 'Free-to-Play',
        ende: 'Dauerhaft kostenlos',
        link: spiel.game_url ?? 'https://www.freetogame.com',
        bild: spiel.thumbnail ?? '',
      });
    }
  } catch (e) {
    console.warn('FreeToGame-Scan übersprungen:', e.message);
  }

  return treffer;
}
