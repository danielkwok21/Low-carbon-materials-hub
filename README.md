# Low Carbon Materials Hub

Compare concrete products by embodied carbon across their full life cycle. All values per 1 m³ of concrete.

**Live Demo:** [https://low-carbon-materials-hub-danielkwok.vercel.app](https://low-carbon-materials-hub-danielkwok.vercel.app)

## Features

- Compare EPD (Environmental Product Declaration) data for ready-mix concrete
- Filter by compressive strength and location
- View GWP (Global Warming Potential) breakdown by life cycle stage
- Support for EN 15804:2012+A2:2019 standard

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Adding EPD Data

See [EXTRACTION.md](./EXTRACTION.md) for the guide on extracting EPD data from PDF documents and adding new products.

## Deployment

This project is deployed on Vercel and automatically deploys on push to the `master` branch.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danielkwok21/Low-carbon-materials-hub)

## Tech Stack

- [Next.js](https://nextjs.org) 16
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 4
- [TypeScript](https://www.typescriptlang.org)
