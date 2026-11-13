# Family Card Pro — Bookmarklet Edition

This package adapts the uploaded Chrome extension for use as a bookmarklet on `fc.bhata.gov.bd`.

## Files to host

Upload these files together into the **same folder** on an HTTPS static host:

- `bookmarklet.js` — launcher and embedded Vue autofill bridge
- `sidepanel.html` — OCR interface
- `sidepanel.js` — Gemini OCR, editing, image handling and panel UI

`inject.js` is included as a readable source copy; its code is already bundled into `bookmarklet.js`, so the browser does not need to load it separately.

The original `manifest.json` and `background.js` are not required by the bookmarklet edition.

## Recommended: GitHub Pages

1. Create a GitHub repository, for example `family-card-bookmarklet`.
2. Upload `bookmarklet.js`, `sidepanel.html`, and `sidepanel.js` to the repository root.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait until GitHub Pages shows the published HTTPS site URL. It will look like:
   `https://YOUR-USERNAME.github.io/family-card-bookmarklet/`
5. Edit `bookmarklet.txt`: replace `YOUR-USERNAME` and `YOUR-REPOSITORY` with your GitHub username and repository name.
6. Copy the entire one-line `javascript:...` value from `bookmarklet.txt` into a new browser bookmark's URL/address field. Name it `Family Card Pro`.
7. Open `https://fc.bhata.gov.bd/`, sign in as usual, then tap the bookmark. A **Family Card AI** launcher should appear; tap it to open the panel.

You can also use another HTTPS static host, as long as it serves the three files from one folder and permits `sidepanel.html` to be embedded in an iframe.

## Important notes

- This is a conversion, not the original extension. It no longer uses `chrome.runtime`, the extension background worker, or `manifest.json`.
- The Gemini API key is entered in the panel and stored in that hosted panel origin's browser `localStorage`. Do **not** put your API key inside `bookmarklet.js` or the bookmark URL. Anyone who can read your public repository can read its source code, but not your browser's localStorage.
- Since the panel is hosted on a different origin from `fc.bhata.gov.bd`, the target site's security policy or the browser may block the iframe or remote script. If that happens, try a different HTTPS host that allows embedding, or use the Chrome extension instead.
- The bookmarklet only starts on `bhata.gov.bd` subdomains. It does not bypass login, site permissions, or server-side validation.
- Review the extracted NID/BRN data before autofilling or submitting official forms.
- Test first with non-sensitive sample data. The OCR request sends the images you select to Google's Gemini API using your API key.
