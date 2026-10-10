# Việt Phục Remix

An interactive Vietnamese heritage-fashion styling studio. Explore traditional garments, create context-aware outfits, and preview combinations on a 2D mannequin using real garment photo layers.

Outfit recommendations are **deterministic and run locally**. Gemini-powered styling advice and editorial image generation are **optional server-side features** that require an API key. The app does not pretend an AI request succeeded when the key or service is unavailable.

## Features

- Explore five core garments: **Nhật Bình, Áo Tấc, Áo Dài, Áo Tứ Thân, and Áo Ngũ Thân**.
- Personalize recommendations by **occasion, location, style, main fabric color, and Remix target**.
- Customize trousers, footwear, bags, and accessories. An accessory is suggested by default; choosing not to use one is respected until the user opts back in.
- Preserve manual item selections across context changes; explicitly changing the Remix target or requesting a new automatic mix can release item locks.
- Preview layered garment photographs and fabric recolors on a 2D mannequin, with graceful fallback when an image cannot be loaded.
- Review cultural-heritage context and, when configured, request Gemini styling advice or an editorial illustration.

**Remix score:** computed from the selected supporting items, not from changes to the structure of the heritage garment. Different contexts can legitimately recommend the same item when it remains the highest-ranked choice.

## Technology

| Area | Implementation |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Motion |
| Application/API server | Node.js, Express |
| Recommendations | Local, deterministic scoring in `src/utils/outfitRecommendation.ts` |
| Outfit state | Reducer in `src/utils/stylingState.ts` |
| Optional AI | Google Gemini via server-side endpoints |
| Verification | Node test runner, asset validation, Playwright |

## Requirements

- **Node.js `^20.19.0` or `>=22.12.0`**, matching the Vite engine requirement (Node 22 LTS or newer is recommended).
- npm (a lockfile is provided).
- Google Chrome installed locally for the Playwright configurations in this repository.
- **Optional, for offline asset preparation only:** Python plus Pillow, NumPy, and OpenCV.

## Local development

```bash
npm ci
```

Create a local environment file from the provided template:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# macOS / Linux
cp .env.example .env
```

Set `GEMINI_API_KEY` in `.env` **only if you need Gemini features**. Then start the app:

```bash
npm run dev
```

Open **http://localhost:3000** (or the port selected through `PORT`). The app and local outfit recommendations work without an AI key.

### Environment variables

| Variable | Required? | Purpose |
| --- | --- | --- |
| `PORT` | No | HTTP port; defaults to `3000` |
| `NODE_ENV` | For production | Use `development` locally and `production` for the built server |
| `GEMINI_API_KEY` | Only for Gemini | Server-side credential for AI stylist and image generation |

Do not commit `.env` or API keys, and do not put the key in `VITE_*` client-side variables. The Express server loads `.env` using `dotenv`; deployment platforms can instead provide these values as environment variables.

## Build and run in production

A **Node.js runtime is required** for the built app **and its API routes**. Static hosting of `dist/` alone does not provide the Gemini endpoints.

```bash
npm ci
npm run build
```

Set `NODE_ENV=production` and run the server:

```powershell
# Windows PowerShell
$env:NODE_ENV = 'production'
npm start
```

```bash
# macOS / Linux
NODE_ENV=production npm start
```

The server serves the Vite-built `dist/` directory and the `/api/*` routes on `0.0.0.0:$PORT`. Configure your hosting provider's port and production environment variables. You can check the process via `GET /api/health`.

### API routes

| Method | Route | Function |
| --- | --- | --- |
| GET | `/api/health` | Basic server readiness information |
| GET | `/api/ai-status` | Whether Gemini features are configured |
| POST | `/api/ai-stylist` | Optional Gemini styling guidance |
| POST | `/api/generate-outfit-image` | Optional Gemini-generated outfit illustration |

Without `GEMINI_API_KEY`, the Gemini POST routes return an error instead of simulated AI results. Availability of specific Gemini models depends on the configured account and service; model names and request handling are defined in the server code.

## Verification

```bash
npm run lint          # TypeScript type checking
npm test              # Recommendation, state, fabric, and AI contract tests
npm run test:assets   # Photo-layer and mask consistency
npm run build         # Production client bundle
npm run test:e2e      # Playwright browser tests
```

The Playwright configuration runs desktop, laptop-motion, and mobile-emulation projects. It uses a locally installed **Google Chrome** channel and starts the development server when required. Its mobile project is Chromium viewport/device emulation, **not a physical iPhone test**. To run the desktop project only:

```bash
npx playwright test --project=desktop
```

For repeatable visual QA, start the dev server and run `npm run test:visual`. Generated screenshots, traces, reports, and other QA output are written under ignored directories such as `artifacts/` and `test-results/`.

## Repository layout

```text
src/
  components/         # Existing discovery, concept, and remix UI
  data/               # Garment catalogs, metadata, and photo fitting
  utils/              # Outfit ranking, state, color, and image processing
  server/             # Gemini request validation and service logic
  services/           # Client API adapters
public/images/         # Images served by the frontend
assets/sources/        # Preserved source imagery and reproducibility inputs
tools/                 # Asset preparation and diagnostic scripts
tests/                 # Unit, contract, and browser tests
server.ts              # Express API and production static hosting
```

### Photo asset provenance

Source photographs, historical baselines, and preprocessing records are retained intentionally. **Do not delete apparently duplicate image files without checking the asset manifest and preparation scripts**. See [assets/README.md](assets/README.md) for input provenance, transformations, masks, and validation. Offline preparation can be run with:

```bash
npm run assets:prepare
npm run test:assets
```

The Python image-preparation dependencies are **not needed to serve the production app**.

## Deployment and project notes

- The current deployment path is an Express-hosted Vite build. Other hosts (including static-only or serverless platforms) may require an adapter and separate API deployment.
- The heritage garment is not structurally altered by the local recommendation algorithm; cultural notes and warnings are informational.
- `IMPLEMENTATION_REPORT.md` and `STABILIZATION_REPORT.md` are **historical QA snapshots**. Some recorded weights, branch names, and screenshots describe earlier development states; use the current source and test suite for live behavior.
- Source assets have their own provenance records. Check rights and redistribution terms before reusing them outside this project.

**Project status:** source code and local verification workflow are provided here; this README does not assert that a particular public deployment, API model, or hosting environment is currently online.
