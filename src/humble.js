/**
 * Humble Bundle – scannt den Store nach aktuellen Gratis-Produkten.
 * Humble bietet keine öffentliche API, daher holen wir Gratisangebote
 * über den GamerPower-Filter und den Community-Subreddit.
 */
export async function scanHumble() {
  const treffer = [];

  // GamerPower nach Humble-Bundle-Giveaways filtern
  try {
    const res = await fetch(
      'https://www.gamerpower.com/api/giveaways?platform=steam&sort-by=value',
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    for (const item of data) {
      if (!/humble/i.test(item.description ?? '' + item.platforms ?? '')) continue;
      treffer.push({
        titel: item.title.replace(/\s*\(.*?\)\s*Giveaway/i, '').trim(),
        plattform: 'Humble Bundle',
        quelle: 'GamerPower (Humble Bundle)',
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
    console.warn('Humble-Scan übersprungen:', e.message);
  }

  // Direkter Humble Choice / Trove-Hinweis als statischer Eintrag
  treffer.push({
    titel: 'Humble Choice – Monatliche Gratis-Spiele',
    plattform: 'Humble Bundle',
    quelle: 'Humble Bundle (Direktlink)',
    preis: 'Humble Choice Abo',
    ende: 'Monatlich wechselnd',
    link: 'https://www.humblebundle.com/membership',
    bild: '',
  });

  return treffer;
}
