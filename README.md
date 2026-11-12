# 🎮 Free Games Scanner

Scannt automatisch **12 Quellen** nach aktuellen Gratis-Spielen und erstellt eine übersichtliche HTML-Seite.

## Unterstützte Quellen

| Quelle | Typ | API-Key? |
|---|---|---|
| **Epic Games Store** | Offizielle Promotions-API | Nein |
| **Steam** | Specials API (100% Rabatt) | Nein |
| **GOG** | Catalog API | Nein |
| **CheapShark** | 35+ Stores (Fanatical, IndieGala, Humble Store, GMG…) | Nein |
| **FreeStuffBot** | 100%-Rabatte + Free Weekends + DLC-Aktionen | Nein (Public) |
| **Amazon Prime Gaming** | Monatliche Gratis-Spiele | Nein (via GamerPower) |
| **Humble Bundle** | Aktuelle Gratis-Angebote | Nein |
| **GamerPower** | Community-Datenbank (alle Plattformen) | Nein |
| **Reddit r/FreeGameFindings** | Community-Tracking in Echtzeit | Nein |
| **Itch.io** | Sale-Feed (Gratis-Indie-Spiele) | Nein |
| **Rockstar Games** | Direkter Webseiten-Scan | Nein |
| **Ubisoft Connect** | Direkter Webseiten-Scan | Nein |

> Alle genutzten APIs sind kostenlos und erfordern keinen API-Key.

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
    ├── epic.js       # Epic Games Store (Promotions-API)
    ├── steam.js      # Steam (Specials API)
    ├── gog.js        # GOG (Catalog API)
    ├── cheapshark.js # CheapShark – 35+ Stores (Fanatical, IndieGala, Humble…)
    ├── freestuff.js  # FreeStuffBot API (100%-Rabatte & Free Weekends)
    ├── prime.js      # Amazon Prime Gaming + FreeToGame
    ├── humble.js     # Humble Bundle
    ├── hersteller.js # Rockstar Games & Ubisoft (Direkt-Scan)
    ├── community.js  # GamerPower + Reddit r/FreeGameFindings + Itch.io
    └── html.js       # HTML-Generator
```

## Wie oft ausführen?

| Quelle | Aktualisierungsrhythmus |
|---|---|
| Epic Games Store | Jeden Donnerstag 17:00 Uhr |
| Steam 100%-Aktionen | Jederzeit möglich |
| Amazon Prime Gaming | Monatlich (1. des Monats) |
| GOG / GamerPower | Unregelmäßig |

Empfehlung: **täglich einmal ausführen** (`npm start`).
