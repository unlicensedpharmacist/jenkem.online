# jenkem.online

The sister site to [rankjenk.com](https://rankjenk.com): same joke, new look. A parody luxury "maison" for an imaginary product. Nothing is for sale; jenkem is an internet hoax.

## What's here

- `public/index.html` — home: hero, the collection, rankings (votes saved in the visitor's browser), reviews, the forum + the wall (shoutbox), latest YouTube uploads, live banner when Blinddudesgame is streaming
- `public/recipes.html` — the kitchen (real, normal food)
- `public/owner.html` — owner dashboard: visitor log + map, members, member tags (sign in as `pharmacist`)
- `public/style.css`, `public/app.js`, `public/tags.js` — styles and scripts
- `worker.js` — the API (accounts, forum, wall, visitor log, tags), same as rankjenk's
- `wrangler.jsonc` — Cloudflare Worker config

## Deploying on Cloudflare

Workers & Pages → Create → Import a repository → pick `jenkem.online`. Defaults are fine (deploy command `npx wrangler deploy`).
The D1 database (`jenkem-online`) has no ID in the config on purpose: Wrangler creates it on the first deploy.
Then add the domain under the Worker's Settings → Domains & Routes → Custom domain → `jenkem.online`.

Register the username `pharmacist` on the new site to get the owner powers (accounts are separate from rankjenk.com).
