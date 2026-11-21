# VibeLoad

VibeLoad is a responsive, no-registration media URL checker. It recognizes direct MP4, WebM, MOV, M4V, OGV, MP3, M4A, WAV and OGG links and attempts a browser-side download when the media host permits it. It recognizes several social-platform URLs and directs users to official save/export options.

## Important product boundary

This is **not** a universal social-media downloader. A social post URL is usually a webpage, not a direct media file. Platforms may use segmented streams, signed URLs, login sessions, private permissions or DRM. VibeLoad does not bypass those controls, scrape private content, or evade platform restrictions. A browser-side download can also fail when the media host blocks cross-origin requests (CORS) or returns a preview instead of a file.

## Stack

- React 18 + TypeScript + Vite
- Browser-side URL classification and download attempt
- Vitest unit tests
- Static SEO guides, legal pages, sitemap and robots.txt
- No application database, visitor account, or upload server

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Local setup

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

## Tests and production build

```bash
npm test
npm run build
npm run preview
```

`npm test` checks URL parsing, supported file types, platform recognition, private-network rejection and filename handling. These tests do not prove that every third-party media host permits downloads. Verify real source behavior only with media files you own or are authorized to test.

## Free deployment: Cloudflare Pages

1. Create a GitHub repository named `vibeload` and push this folder to its `main` branch.
2. In Cloudflare Dashboard, open **Workers & Pages → Create application → Pages → Connect to Git**.
3. Select the `vibeload` repository.
4. Set the framework preset to **None**.
5. Set the root directory to `/`.
6. Build command: `npm install && npm run build`.
7. Build output directory: `client/dist`.
8. Deploy, then test the generated `pages.dev` address on desktop and mobile.
9. Add your purchased domain in the Pages custom-domain settings and follow Cloudflare's DNS instructions.

No API server is required for the current feature set. Do not add a generic server-side URL proxy: it can create server-side request forgery (SSRF) risks and would not lawfully unlock protected platform streams.

## Domain setup before launch

Replace every `YOUR-DOMAIN.example` placeholder with your actual domain in:

- `client/index.html`
- `client/public/robots.txt`
- `client/public/sitemap.xml`
- `client/public/privacy.html`
- `client/public/terms.html`
- `client/public/copyright.html`
- `client/public/guides/*.html`

Also replace the contact email placeholders with an address you monitor. Rebuild and redeploy after edits.

## AdSense setup

1. First publish the finished site on your domain and add useful original content, accurate support information, a real contact address and complete legal disclosures.
2. Apply for AdSense from your own Google account. Approval is Google's decision and is not guaranteed.
3. After approval, copy the exact publisher ID and ad code from AdSense into the site. Do not use a sample publisher ID.
4. Replace the placeholder comment in `client/public/ads.txt` with the exact `google.com, pub-..., DIRECT, f08c47fec0942fa0` record shown by AdSense.
5. Configure an approved consent management solution for users in regions where consent is required. Keep ad placement away from download controls and avoid accidental clicks.
6. Verify the live `ads.txt`, consent flow, privacy disclosure and ad behavior before scaling traffic.

The repository includes tiny same-origin smoke-test fixtures at `/demo/sample.mp4` and `/demo/sample.webm`; use these after deployment to confirm that the browser-side download path works on the deployed host. They are synthetic one-second test clips.

The repository contains only an `ads.txt` placeholder. It does not contain a live AdSense publisher ID, ad script, or consent platform configuration.

## SEO strategy from OpenSEO research (US, English)

Research run on 2026-11-21 found these estimated monthly US searches:

| Keyword | Estimated searches/mo | Keyword difficulty | Intent |
|---|---:|---:|---|
| download video from link | 33,100 | 31 | Transactional |
| URL video downloader | 14,800 | 29 | Transactional |
| download video from website | 18,100 | 32 | Informational |
| website video downloader | 18,100 | 35 | Transactional |
| MP4 video downloader | 8,100 | 7 | Transactional |

Volumes are third-party estimates, not visits or guaranteed traffic. The market is competitive. The product should win trust through accurate compatibility explanations, fast direct-file handling, useful troubleshooting pages and real tests, rather than unsupported claims about downloading every social platform.

## Manual acceptance checklist

- [ ] After deployment, `https://YOUR-DOMAIN/demo/sample.mp4` downloads as a local file.
- [ ] After deployment, `https://YOUR-DOMAIN/demo/sample.webm` downloads as a local file.
- [ ] A direct file hosted without CORS falls back to the original media URL and clearly explains the limitation.
- [ ] YouTube, Instagram, TikTok, Facebook, X, Vimeo, Pinterest and Threads links are identified as platform pages, not falsely shown as downloadable files.
- [ ] A normal HTML webpage is not mislabeled as a media file.
- [ ] Invalid protocols, credential-bearing URLs and local/private IPs are rejected.
- [ ] Test on current Chrome, Firefox, Safari and mobile browsers.
- [ ] Replace domain and contact placeholders; verify canonical tags, sitemap, robots and legal pages.
- [ ] Configure consent and real AdSense records only after account approval.

## License

Private project starter. Add your chosen license before making the repository public.
