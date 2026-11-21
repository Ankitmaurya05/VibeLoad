# Deployment notes

## Cloudflare Pages settings
- Root directory: `/`
- Build command: `npm install && npm run build`
- Build output directory: `client/dist`
- Production branch: `main`

## GitHub
Create a new repository named `vibeload`, then from this folder:

```bash
git init
git add .
git commit -m "Build VibeLoad direct media link checker"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/vibeload.git
git push -u origin main
```

## After deployment
- Replace `YOUR-DOMAIN.example` with the actual domain.
- Add a monitored contact email.
- Test direct media downloads with a file you control.
- Submit the sitemap in Google Search Console.
- Configure AdSense and regional consent only after approval.
