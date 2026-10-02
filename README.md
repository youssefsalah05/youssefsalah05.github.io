# Portfolio — deployment

1. Keep `index.html`, `styles.css` and `script.js` together in one folder.
2. Preview locally by double-clicking `index.html` — no server and no build step.
3. GitHub Pages: create a repository and upload the three files to its root.
4. Open Settings → Pages, set Source to "Deploy from a branch", branch `main`, folder `/ (root)`, save.
5. Wait for the Pages build, then visit `https://<username>.github.io/<repository>/`.
6. Any static host (Netlify, Vercel, cPanel) works the same way: upload the folder contents as-is.
7. After editing a file, push or re-upload it — the live site updates on the next build.
