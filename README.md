# VibeLoad

Responsive, no-registration media URL checker for authorized direct media files.

## Scope
VibeLoad recognizes direct MP4, WebM, MOV, M4V, OGV, MP3, M4A, WAV and OGG links and attempts browser-side downloads when the host permits them. Social post URLs are recognized and users are directed to official save/export options. This is not a universal social-media downloader and does not bypass DRM, authentication, private settings, paywalls or platform restrictions.

## Source archive
Download the complete starter source from the repository release/archive once uploaded, or use the source ZIP supplied with this project.

## Stack
React 18, TypeScript, Vite, Vitest. No visitor account, database or upload server.

## Local setup
Requires Node.js 20.19+ or 22.12+ and npm 10+.

```bash
npm install
npm run dev
npm test
npm run build
```

## Cloudflare Pages
Framework: None. Root: `/`. Build command: `npm install && npm run build`. Output directory: `client/dist`.

Before launch replace `YOUR-DOMAIN.example` and contact placeholders, test the demo files on the deployed host, publish original help content and configure actual AdSense/consent details only after approval. Keyword metrics in project docs are third-party US estimates, not traffic guarantees.
