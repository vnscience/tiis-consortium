# TIIS Consortium Website

The TIIS Consortium website is a modular, data-driven static website. It can be hosted on GitHub Pages or any static web host and does not require a server-side runtime or build step.

## Project structure

```text
.
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── site.css
    ├── data/
    │   ├── site.json
    │   ├── announcements.json
    │   └── stories.json
    ├── images/
    │   └── placeholders/
    │       └── tiis-event-placeholder.svg
    ├── js/
    │   ├── app.js
    │   └── tailwind.config.js
    └── pages/
        ├── home.html
        ├── about.html
        ├── membership.html
        ├── activities.html
        ├── events.html
        ├── institutions.html
        ├── news.html
        └── contact.html
```

## Architecture

- `index.html`: application shell, shared header, footer, and page mount point.
- `assets/pages/`: one HTML partial per website page.
- `assets/css/site.css`: project-specific styles, story cards, article layouts, and page transitions.
- `assets/js/tailwind.config.js`: Tailwind theme tokens and font configuration.
- `assets/js/app.js`: page loading, navigation, mobile menu, story rendering, category filtering, article routes, and form interactions.
- `assets/data/site.json`: site metadata and navigation configuration.
- `assets/data/announcements.json`: legacy announcement copy retained for reference.
- `assets/data/stories.json`: editorial content source for news cards and full event articles.
- `assets/images/placeholders/`: reusable local placeholder artwork.

## Managing news and event stories

Edit `assets/data/stories.json` to publish or update stories. Each story has a unique `id`, title, category, date label, excerpt, cover image, and a `sections` array.

Supported article section types:

- `paragraph`: a text paragraph.
- `heading`: a section heading.
- `image`: an image with alternative text and an optional caption.
- `quote`: a highlighted quotation.

Each story is automatically shown in the News & Stories feed. Stories in the Academic Events and International Collaboration categories may also appear in the Activities feed. Selecting a story opens its own shareable article route (for example, `#article/eidt-2026`).

### Replacing placeholder images

1. Add the official event photograph under `assets/images/` (or use an approved public image URL).
2. Update the story's `coverImage` field.
3. Update any `image` section's `src`, `alt`, and `caption` fields.
4. Keep the placeholder path until an approved photograph is available.

Use descriptive alternative text and captions. Do not publish photographs without the appropriate permission.

## Other content updates

- Edit `assets/data/site.json` to update site metadata and navigation.
- Edit the relevant file in `assets/pages/` to change page structure or static copy.
- Edit `assets/css/site.css` for custom styling.
- Edit `assets/js/app.js` only when application behavior needs to change.

## Local preview

Page templates and JSON files are loaded with `fetch()`, so use a local HTTP server instead of opening the HTML file directly.

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Deployment

Publish the repository root with `index.html` and the complete `assets/` directory. The site does not require a build step or server-side runtime.

## Website forms and email delivery

The Membership Expression of Interest and Contact Inquiry forms validate required fields in the browser and submit through the FormSubmit AJAX endpoint to the TIIS Secretariat mailbox (`bay.nv@ou.edu.vn`). The forms include email validation, length limits, a honeypot field, and user-visible error handling. Successful confirmation is shown only after the provider accepts the submission.

**One-time activation required:** the first real submission triggers an activation email from FormSubmit to `bay.nv@ou.edu.vn`. Open that email and click its activation link. Until activation is completed, FormSubmit will not deliver submissions. Test both forms after activation.

FormSubmit is a third-party service. Its documentation states that submissions are retained for 30 days. Do not collect sensitive personal information through these forms. Review the provider's current privacy and service terms before production use.

Provider documentation:
- [FormSubmit setup and controls](https://formsubmit.co/documentation)
- [FormSubmit AJAX submission](https://formsubmit.co/ajax-documentation)
