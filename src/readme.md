# Hakim Livs – E-handelsprojekt (Frontend)

Detta projekt är en webbshop för livsmedel, utvecklad som en skoluppgift. Syftet är att träna på att bygga en fullständig e-handelsapplikation med både kundsida och adminpanel.

> Deployad sida:  
https://be-webshop-2025-fe.vercel.app/index.html

---

## Innehållsförteckning

1. [Projektets Syfte & Översikt](#1-projektets-syfte--översikt)  
2. [Kodstruktur & Arkitektur](#2-kodstruktur--arkitektur)  
3. [Setup & Installation – Viktigt för Backend](#3-setup--installation--viktigt-för-backend)  
4. [Kodbibliotek & Teknologier](#4-kodbibliotek--teknologier)  
5. [Hjälp-funktioner](#5-hjälp-funktioner)  
6. [Förbättringspunkter](#6-förbättringspunkter)  

---

## 1. Projektets Syfte & Översikt

### Kundsida
- Produkter hämtas från backend API och visas dynamiskt.  
- Sökfunktion och paginering.  
- Filtrering per kategori.  
- Varukorg med offcanvas (localStorage).  
- Checkout-sida med formulär.  
- Bekräftelse-popup med Swish-information.

### Adminpanel
- Inloggning för administratörer.  
- CRUD på produkter och kategorier.  
- Se inkomna kundbeställningar.  
- Ändra orderstatus.  
- Skapa plocklista.  
- Sökfunktion och paginering bland produkter.  

---

## 2. Kodstruktur & Arkitektur

```
HakimLivs-Frontend/
├── node_modules/          # Installerade beroenden via npm
├── src/                   # Källkod
│   ├── assets/            # Bilder och media
│   ├── scss/              # SCSS-filer (partials + main.scss)
│   ├── scripts/           # JavaScript-filer
│   └── utils/             # Hjälpfunktioner
├── pages/                 # HTML-sidor (checkout, admin, login)
├── public/                # Kompilerad CSS och statiska filer
│   └── css/               # Färdigkompilerad CSS från SCSS
├── index.html             # Startsida för kundsidan (ligger i rotmappen)
├── package.json
└── README.md
```

---

## 3. Setup & Installation – Viktigt för Backend

### Krav

- Node.js version: `v20.19.0`  
- Sass version: `1.86.0`  

Installera Sass globalt:
```bash
npm install -g sass@1.86.0
```

### Klona projektet

```bash
git clone https://github.com/dasl2001/BE-Webshop-2025-FE.git
cd BE-Webshop-2025-FE
```

### Installera beroenden

```bash
npm install
```

Detta installerar bland annat:
- eslint (kodstandard)  
- prettier (formatering)  
- husky (pre-commit hooks)  
- lint-staged (kodkontroll innan commit)  
- sass (version 1.86.0 via devDependencies)

---

### Köra SCSS

#### Alternativ 1: Via VS Code Extension (Rekommenderas)
- Installera *Live Sass Compiler*-extension i VS Code.  
- Klicka på `Watch Sass` längst ner i VS Code.  
- SCSS kompileras automatiskt från:  
`src/scss/main.scss` → `public/css/main.css`

#### Alternativ 2: Via terminal

```bash
npm run sass
```

Motsvarar:

```bash
sass --no-source-map --watch src/scss/main.scss:public/css/main.css --style expanded
```

---

### Viktigt!

Kompilerad CSS ska alltid hamna i:  
```
public/css/main.css
```

Backend ska inte skapa andra mappar som `dist/` eller `build/`.

---

## 4. Kodbibliotek & Teknologier

- HTML & Vanilla JavaScript (ES6+)  
- SCSS (Sass) – https://sass-lang.com/documentation  
- Fetch API  
- LocalStorage  
- Node.js  
- Arbetssätt: Scrum, Git & GitHub  

---

## 5. Hjälp-funktioner

Exempel på återanvändbara filer:

- `api.js` – API-anrop  
- `storageHelper.js` – Hantering av localStorage  
- `utils.js` – Delade hjälpfunktioner  

---

## 6. Förbättringspunkter

- Responsiv design: Säkerställ att alla sidor är fullt responsiva i mobil, surfplatta och desktop.  
- Prestanda: Optimera bilder och minifiera CSS vid större projekt.  
- SCSS-struktur: Dela upp i fler partials vid behov.  
- Kommentera koden: Lägg till fler kommentarer för att underlätta för backend och nya utvecklare.

---
