# VibeLoad test report

Date: 2026-11-21

## Passed

- TypeScript/TSX syntax transpilation checks for the application and Vite configuration.
- 30 runtime assertions for direct media URL recognition, common platform URL classification, ordinary webpage classification, safe protocol handling, private/local IP rejection (including IPv6 loopback and IPv4-mapped IPv6), and filename sanitization.
- Static sample MP4 served with HTTP 200 and `Content-Type: video/mp4`.
- Static sample WebM served with HTTP 200 and `Content-Type: video/webm`.
- Package and TypeScript configuration JSON parsed successfully.

## Not verified in this environment

- `npm install` timed out twice, so dependencies could not be installed here.
- A full Vite production build and Vitest run could not be completed without the dependencies.
- No real browser automation or external platform download test was completed.
- Third-party download behavior varies by host, CORS policy, authentication, redirects, content headers, browser and device. The app deliberately does not bypass these controls.

## Before public launch

Run `npm install`, `npm test`, and `npm run build` on a machine with npm registry access. Deploy a preview and test `/demo/sample.mp4` and `/demo/sample.webm` through the actual app in Chrome, Firefox, Safari and mobile browsers. Then test only additional files that you own or are authorized to download.
