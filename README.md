# Low Carbon Materials Hub

 [low-carbon-materials-hub-danielkwok.vercel.app](https://low-carbon-materials-hub-danielkwok.vercel.app)
 
### Repo Contents

- [`EXTRACTION.md`](./EXTRACTION.md) - Document extraction reasoning and approach
- [`/data`](./data) - Structured EPD data (one JSON file per product)

---

## About

Compare concrete products by embodied carbon across their full life cycle. All GWP values are per 1 m³ of concrete.

### Features

- Compare EPDs by life cycle stage (A1-D), not just headline numbers
- Filter by manufacturer, compressive strength, and manufacturing location
- Clear indication of declared vs undeclared stages (missing ≠ zero)
- Every carbon figure traceable to its source EPD

### Tech Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- Deployed on Vercel (auto-deploys on push to `master`)

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
