export async function scanItch() {
  const treffer = [];
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
  return treffer;
}
