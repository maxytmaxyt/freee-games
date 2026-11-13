import { USER_AGENT } from './constants.js';


/**
 * Scannt die Epic Games Store API nach aktuellen Gratis-Angeboten.
 * Nutzt den offiziellen Free Games Promotions-Endpunkt.
 */
export async function scanEpicGames() {
  try {
    const url = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=de&country=DE&allowCountries=DE';
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    const data = await res.json();
    const spiele = data?.data?.Catalog?.searchStore?.elements || [];

    const treffer = [];
    for (const spiel of spiele) {
      const promotionen = spiel.promotions?.promotionalOffers ?? [];
      const angebote = promotionen.flatMap((p) => p.promotionalOffers ?? []);
      const istGratis = angebote.some((o) => o.discountSetting?.discountPercentage === 0);

      if (istGratis) {
        const slug = spiel.catalogNs?.mappings?.[0]?.pageSlug ?? spiel.productSlug ?? '';
        const endeRaw = angebote[0]?.endDate;
        const ende = endeRaw ? new Date(endeRaw).toLocaleString('de-DE') : 'Begrenzte Zeit';
        const bild =
          spiel.keyImages?.find((i) => i.type === 'OfferImageWide')?.url ??
          spiel.keyImages?.[0]?.url ??
          '';

        treffer.push({
          titel: spiel.title,
          plattform: 'Epic Games Store',
          quelle: 'Offizielle API',
          preis: spiel.price?.totalPrice?.fmtPrice?.originalPrice ?? 'Kostenpflichtig',
          ende,
          link: slug ? `https://store.epicgames.com/de/p/${slug}` : 'https://store.epicgames.com/de/free-games',
          bild,
          art: /dlc|add-?on/i.test(spiel.title ?? '') ? 'DLC' : 'Spiel',
        });
      }
    }
    return treffer;
  } catch (e) {
    console.warn('Epic-Scan übersprungen:', e.message);
    return [];
  }
}
