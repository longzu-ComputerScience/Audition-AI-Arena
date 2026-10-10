<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c9a02246-4555-430e-91f3-d97e2175ade9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Outfit and photo-layer verification

`npm test` checks the deterministic recommendation engine, state synchronization,
fabric pixels and AI contracts. `npm run test:assets` validates all eighteen
photo layers and five textile masks. `npm run lint` checks TypeScript;
`npm run build` produces the client bundle.

`npm run test:e2e` uses locally installed Google Chrome to test desktop/mobile
journeys, all 675 catalog outfits, 30 real recolors and SVG fallback. It starts
the development server if port 3000 is free. Mobile checks emulate an iPhone
viewport in Chromium; they do not replace testing on a physical iOS device.

With the development server running, `npm run test:visual` saves eleven outfit
references, thirty garment/color captures and a mobile view in `artifacts/visual/`.
`python tools/make-visual-contact.py` makes comparison sheets.

Asset preparation is offline and is not a production backend dependency. Install
Pillow, numpy and opencv-python in a development Python environment, then run
`npm run assets:prepare`, `npm run test:assets` and
`python tools/update-asset-provenance.py` in that order. Original inputs are
preserved in `assets/sources/`; source IDs and transformations are recorded in
[the asset processing record](assets/README.md).

See [the implementation report](IMPLEMENTATION_REPORT.md) for scoring weights,
verification evidence and remaining limits. Gemini model choices and API key
handling follow the existing server configuration.
