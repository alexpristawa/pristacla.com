# pristacla.com

The Pristacla Holdings, LLC website: one static page, with no build step and no frameworks. Open `index.html` in a browser to view it. It is hosted on GitHub Pages (see Hosting): every push to `main` goes live.

```
index.html                  the page
404.html                    "Page not found" page (GitHub Pages serves it for unknown paths)
assets/site.css             styles
assets/site.js              Products and Legal menus, mobile menu
assets/screenshots/         product screenshots shown in the device frames
assets/icons/               product app icons
assets/fonts/               Plus Jakarta Sans, self-hosted (SIL OFL 1.1, see OFL.txt)
assets/favicon.svg, favicon.ico, assets/apple-touch-icon.png, assets/og.png (link preview image)
CNAME                       tells GitHub Pages the site lives at pristacla.com
.nojekyll                   tells GitHub Pages to serve the files as they are (no Jekyll build)
robots.txt, sitemap.xml     for search engines
.gitignore                  keeps mocks/ and .DS_Store out of git
mocks/                      design mocks and full-resolution product screenshots (mocks/product-shots/): local only, ignored by git
```

## Products

Each product is one `.card` inside `<section id="products">` in `index.html`:

- `<a class="card" href="https://...">` for a product with a public site. The card and its Products-menu entry link to that site.
- `<article class="card">` for a product in development: no link, and a status chip that reads "In development".

The Products menu, its thumbnails, the product counts and the 01, 02 … numbers are built from the cards.

When you add, remove or reorder a card, also:

- update the three `03` counts in `index.html` (they are shown only when JavaScript is off);
- regenerate `assets/og.png` (a 1200×630 screenshot of the top of the page, which shows the count);
- update the product list in the `<meta name="description">` and `og:description` tags, and in the JSON-LD `brand` list in `<head>`.

When a product in development launches:

1. Change its `<article ...>` to `<a ... href="https://...">`, and the closing `</article>` to `</a>`.
2. Add `<span class="host">example.com</span>` after its `<h3>`.
3. Replace the "In development" chip with platform chips, e.g. `<ul class="chips" aria-label="Platforms"><li>macOS</li></ul>`.
4. Add the arrow `<span class="go" ...>` after the chips (copy it from the Prepdle card).
5. If it has legal pages, add them to the Legal menu, the mobile menu and the footer.
6. Add its `"url"` to its entry in the JSON-LD `brand` list in `<head>`.

### Layout

The desktop grid has 6 tracks:

| Card class | Width on desktop | When to use |
|---|---|---|
| `full` | the whole row | a featured product |
| `wide` | two thirds | laptop, browser and monitor frames |
| `half` | half | two products side by side |
| (none) | one third | phone and tablet frames |

Fill each row: `full`; `half` + `half`; `wide` + one-third; or three one-thirds.

At tablet widths the grid has 2 columns: `full` (or `full-md`) cards span both, and every other card takes one. On phones every card is full width.

### Screenshots

Screenshots fill the frame's screen, anchored at the top centre. If one is slightly too tall, its bottom is cut off; if slightly too wide, equal strips are cut from both sides. Save them as WebP. Each is displayed at most ~700 CSS px wide, so about 1600 px wide is plenty.

| Frame | Screen shape | Size used |
|---|---|---|
| Laptop (with phone) | 16:10; phone 9:19.5 | 1600×1000; 780×1688 |
| Phone | 9:19.5 | 780×1688 |
| Tablet | 3:4 portrait | 1200×1600 |
| Browser window | 16:8.7 (page area only) | 1600×870 |
| Ultrawide monitor | 21:9 | 1680×720 |

For a phone screenshot of a website, leave a plain band (54 CSS px, in the page's top colour) above the page, so the phone's camera island doesn't cover content.

### Device frame markup

Copy the `.set` block from an existing card:

- laptop + phone: `set--combo` (Prepdle);
- browser window: `set--browser` (R-CADE);
- ultrawide monitor: `set--monitor` (Waddle).

The phone alone and the tablet look like this, inside `<div class="stage">`:

```html
<div class="set set--phone">
  <div class="floor"></div>
  <div class="rig">
    <div class="phone">
      <span class="island"></span>
      <div class="screen" data-thumb><img src="assets/screenshots/name.webp" alt=""></div>
    </div>
  </div>
</div>
```

```html
<div class="set set--tablet">
  <div class="floor"></div>
  <div class="rig">
    <div class="tablet">
      <div class="screen" data-thumb><img src="assets/screenshots/name.webp" alt=""></div>
    </div>
  </div>
</div>
```

On each card, set these:

- `data-name`: the product name, the same text as its `<h3>`. The Products menu uses it.
- `id`: a short slug such as `id="newapp"`. A product in development's menu entry links to `#id`.
- `data-shape`: the Products-menu thumbnail shape: `land` (laptop or browser), `ultra` (monitor), `tab` (tablet) or `tall` (phone).
- `data-thumb`: on the screen the thumbnail is copied from.
- `--accent`: the product's colour. Don't use purple.

## Hosting

The repository is https://github.com/alexpristawa/pristacla.com (public: GitHub Pages on a free account needs a public repository).

GitHub Pages is set to **Deploy from a branch**, with branch `main` and folder `/ (root)`. The custom domain comes from the `CNAME` file. GitHub's settings for this are under the repository's Settings → Pages.

### DNS (GoDaddy)

The domain's DNS is managed at GoDaddy. Before adding the records below:

- delete the existing `A` record for `@`. GoDaddy shows it as "Parked"; it points at GoDaddy's parking page;
- turn off any GoDaddy Forwarding for the domain;
- edit the existing `www` CNAME, which currently points to `pristacla.com`, instead of adding a second one.

The site needs exactly these records:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | alexpristawa.github.io |

Leave the MX and TXT records alone: they are the Google email setup, and they're separate from the site.

To check: `dig +short pristacla.com A` must list only the four 185.199.10x.153 addresses, and `dig +short www.pristacla.com` must show `alexpristawa.github.io`.

Then, in the repository's Settings → Pages, wait for the DNS check to pass and tick **Enforce HTTPS**. GitHub issues the certificate automatically, usually within an hour.

**Recommended:** verify the domain with GitHub, which stops anyone else's repository from claiming pristacla.com.

1. Go to your GitHub account Settings → Pages → Add a domain, and enter pristacla.com.
2. GitHub shows a TXT record (`_github-pages-challenge-alexpristawa`). Add it at GoDaddy.
3. Click Verify.
