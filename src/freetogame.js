export async function scanFreeToGame() {
  const treffer = [];
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
          art: 'Free-to-Play',
        });
      }
    }
  } catch (e) {
    console.warn('FreeToGame-Scan übersprungen:', e.message);
  }
  return treffer;
}
