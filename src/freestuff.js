/**
 * FreeStuffBot API – trackt 100%-Rabatt-Aktionen, Free Weekends und DLC-Giveaways.
 * Kostenlos für den Public-Plan (kein API-Key nötig für den öffentlichen Feed).
 * Docs: https://docs.freestuffbot.xyz/
 */
export async function scanFreeStuff() {
  try {
    // Öffentlicher Feed gibt alle aktuell kostenlosen Produkte zurück
    const listRes = await fetch('https://api.freestuffbot.xyz/v1/game/list/free', {
      headers: { 'Authorization': 'Basic public' },
    });
    const listData = await listRes.json();

    if (!listData?.success || !Array.isArray(listData.data) || listData.data.length === 0) {
      return [];
    }

    // Details zu den ersten 20 IDs laden
    const ids = listData.data.slice(0, 20).join('+');
    const detailRes = await fetch(
      `https://api.freestuffbot.xyz/v1/game/${ids}/info`,
      { headers: { 'Authorization': 'Basic public' } }
    );
    const detailData = await detailRes.json();
    if (!detailData?.success) return [];

    const treffer = [];
    for (const [, spiel] of Object.entries(detailData.data ?? {})) {
      if (!spiel || spiel.status !== 'published') continue;
      treffer.push({
        titel: spiel.title,
        plattform: spiel.store ?? 'PC',
        quelle: 'FreeStuffBot API',
        preis: spiel.org_price?.dollar
          ? `${spiel.org_price.dollar.toFixed(2)} $`
          : 'Kostenpflichtig',
        ende: spiel.until
          ? new Date(spiel.until * 1000).toLocaleString('de-DE')
          : 'Zeitlich begrenzt',
        link: spiel.url ?? spiel.store_meta?.storefront_link ?? 'https://freestuffbot.xyz',
        bild: spiel.thumbnail ?? '',
      });
    }
    return treffer;
  } catch (e) {
    console.warn('FreeStuffBot-Scan übersprungen:', e.message);
    return [];
  }
}
