# Family Card Pro — Bookmarklet Edition

This package adapts the Family Card Pro tool for use as a bookmarklet or userscript on `fc.bhata.gov.bd`.

## Files to host

Upload these files together into the **same folder** on an HTTPS static host (such as GitHub Pages):

- `bookmarklet.js` — launcher, session storage bridge, full tab scanner, and embedded Vue autofill bridge
- `sidepanel.html` — OCR, multi-person card inspector, and full tab editor UI
- `sidepanel.js` — Gemini OCR, multi-card per photo binding, JSON export/import, and panel logic
- `inject.js` — standalone Vue form injector reference

## Features

- **Multi-Person Photo Inspector:** Upload a single photo containing 2 or more NID/BRN cards; tapping the thumbnail displays stacked editable forms for every person detected in that image.
- **Pull All Website Tabs:** Pulls every Vue state property and DOM tab/dropdown from `bhata.gov.bd` into collapsible cards with one-tap Copy and option selectors.
- **Export & Import JSON:** Download a full `.json` backup of extracted records and website tabs, or import a saved `.json` file to restore and auto-fill the form.
- **Session & API Key Protection:** Stores your Gemini API key in first-party `localStorage` and backs up active photos/extractions in `sessionStorage` across accidental browser refreshes.
