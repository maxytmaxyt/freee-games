/**
 * Scannt die GOG-Datenbank nach aktuellen Gratis-Angeboten.
 * Nutzt die öffentliche GOG-Catalog-API.
 */
export async function scanGOG() {
  try {
    const url = 'https://catalog.gog.com/v1/catalog?productType=in:game,pack&discounted=eq:true&price=between:0,0&limit=48&locale=de-DE';
    const res = await fetch(url);
    const data = await res.json();
    const produkte = data?.products ?? [];

    return produkte.map((p) => ({
      titel: p.title,
      plattform: 'GOG',
      quelle: 'GOG Catalog API',
      preis: p.price?.base ?? 'Kostenpflichtig',
      ende: 'Zeitlich begrenzt',
      link: `https://www.gog.com${p.storeLink ?? '/de/games'}`,
      bild: p.coverHorizontal ?? '',
      art: /dlc|add-?on|erweiterung/i.test(p.title ?? '') ? 'DLC' : 'Spiel',
    }));
  } catch (e) {
    console.warn('GOG-Scan übersprungen:', e.message);
    return [];
  }
}
