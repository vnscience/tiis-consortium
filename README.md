# TIIS Consortium Website

The TIIS Consortium website is a modular, data-driven static website. It can be hosted on GitHub Pages or any static web host and does not require a server-side runtime or build step.

## Project structure

```text
.
├── index.html
├── README.md
└── assets/
    ├── css/site.css
    ├── data/
    │   ├── announcements.json
    │   └── site.json
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
- `assets/css/site.css`: project-specific styles and page transitions.
- `assets/js/tailwind.config.js`: Tailwind theme tokens and font configuration.
- `assets/js/app.js`: page loading, navigation, mobile menu, news filtering, dialogs, and form interactions.
- `assets/data/site.json`: site metadata and navigation configuration.
- `assets/data/announcements.json`: editable news and announcement content.

## Updating content

- Edit `assets/data/announcements.json` to manage news items.
- Edit `assets/data/site.json` to update site metadata and navigation.
- Edit the relevant file in `assets/pages/` to change page structure or copy.
- Edit `assets/css/site.css` for custom styling.
- Edit `assets/js/app.js` for application behavior.

## Local preview

Page templates and JSON files are loaded with `fetch()`, so use a local HTTP server instead of opening the HTML file directly.

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Deployment

Publish the repository root with `index.html` and the complete `assets/` directory. The site does not require a build step or server-side runtime.

## Current limitations

The expression-of-interest and inquiry forms currently provide client-side confirmation only. They do not persist submissions or send email. Connect an approved form service or backend before collecting real applications.
