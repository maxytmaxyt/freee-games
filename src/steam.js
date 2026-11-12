/**
 * Scannt die Steam Specials API nach 100%-Rabatten (effektiv kostenlose Spiele).
 * Nutzt den offiziellen featuredcategories-Endpunkt.
 */
export async function scanSteam() {
  try {
    const url = 'https://store.steampowered.com/api/featuredcategories?cc=de&l=german';
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.specials?.items ?? [];

    return items
      .filter((item) => item.discount_percent === 100)
      .map((item) => {
        const appIdMatch = item.logo?.match(/\/apps\/(\d+)\//);
        const appId = appIdMatch ? appIdMatch[1] : '';
        return {
          titel: item.name,
          plattform: 'Steam',
          quelle: 'Steam Specials API',
          preis: item.original_price ? `${(item.original_price / 100).toFixed(2)} €` : '100% Rabatt',
          ende: 'Zeitlich begrenzt',
          link: appId
            ? `https://store.steampowered.com/app/${appId}/`
            : 'https://store.steampowered.com/search/?specials=1&maxprice=free',
          bild: item.large_capsule_image || item.small_capsule_image || '',
        };
      });
  } catch (e) {
    console.warn('Steam-Scan übersprungen:', e.message);
    return [];
  }
}
