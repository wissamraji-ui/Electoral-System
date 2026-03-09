# Lebanon Electoral Law Simulator

A professional web platform to simulate candidate outcomes by district and sect seat quotas in Lebanon.

## What it does

- Configure district seats by sect (editable).
- Load prefilled district templates for major Lebanese electoral regions.
- Add candidates with names, sect, **mandatory party/list**, and votes.
- Compute winners using list-level EQ qualification and sect quotas.
- Detect edge cases:
  - Unfilled seats (not enough candidates in a sect).
  - Ties at seat cutoffs (uses alphabetical tie-break).
- Import/export simulation scenarios as JSON.
- Export a simulation report as PDF.
- Persist scenario data in local browser storage.

## Model used

This simulator applies:

1. Electoral Quotient (EQ) at list level (lists below EQ are excluded).
2. Seat distribution to qualified lists by largest remainder.
3. Candidate selection by vote rank subject to both sect quotas and list seat caps.

It is a practical simulation model and not a full legal automation of all Lebanese electoral procedures. You can edit all templates to reflect official updates.

## Run locally

1. Start the local dev server:

```bash
npm run dev
```

2. Open `http://localhost:5173`.
3. Optionally run tests from terminal:

```bash
npm test
```

## Deploy on Render

This repo includes [`render.yaml`](./render.yaml) for static deployment.

- Build command: `npm ci && npm run build`
- Publish directory: `dist`

If you deploy from the Render dashboard manually, use the same values above.

## File structure

- `index.html`: Application UI structure.
- `styles.css`: Professional responsive styling.
- `src/app.js`: UI logic, state management, import/export, persistence.
- `src/engine.js`: Pure seat-allocation engine.
- `src/data/templates.json`: Editable district/sect templates.
- `src/data/templates.js`: Template loader and shared state helpers.
- `sample-scenario.json`: Example scenario you can import from the UI.
- `tests/engine.test.js`: Unit tests for core election logic.
