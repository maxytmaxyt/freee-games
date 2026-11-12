# 🎮 Free Games Scanner

Scannt mehrere Plattformen automatisch nach aktuellen Gratis-Spielen und erstellt eine übersichtliche HTML-Seite.

## Unterstützte Quellen

| Quelle | Typ |
|---|---|
| **Epic Games Store** | Offizielle API (wöchentliche Gratis-Spiele) |
| **Steam** | Specials API (100% Rabatt-Aktionen) |
| **GOG** | Catalog API (kostenlose Angebote) |
| **Itch.io** | Sale-Feed (Gratis-Indie-Spiele) |
| **GamerPower** | Community-Datenbank (alle Plattformen) |
| **Reddit r/FreeGameFindings** | Community-Tracking in Echtzeit |
| **Rockstar Games** | Direkter Webseiten-Scan |
| **Ubisoft Connect** | Direkter Webseiten-Scan |

## Installation

```bash
npm install
```

## Starten

```bash
npm start
```

## Dateistruktur

```
freee-games/
├── index.js          # Einstiegspunkt & Hauptlogik
├── package.json
├── README.md
└── src/
    ├── epic.js       # Epic Games Store Scanner
    ├── steam.js      # Steam Scanner
    ├── gog.js        # GOG Scanner
    ├── hersteller.js # Rockstar & Ubisoft Scanner
    ├── community.js  # GamerPower, Reddit, Itch.io Scanner
    └── html.js       # HTML-Generator
```
