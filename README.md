# TIIS Consortium Website

The TIIS Consortium website is a modular static website compatible with GitHub Pages and other static hosts.

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
    └── js/
        ├── app.js
        └── tailwind.config.js
```

## Architecture

- `index.html`: semantic page structure and page sections.
- `assets/css/site.css`: project-specific styles and transitions.
- `assets/js/tailwind.config.js`: Tailwind theme tokens and fonts.
- `assets/js/app.js`: navigation, menus, news filtering, dialogs, and form interactions.
- `assets/data/site.json`: site metadata and navigation configuration.
- `assets/data/announcements.json`: editable news and announcement content.

## Updating content

- Edit `assets/data/announcements.json` to manage news items.
- Edit `assets/data/site.json` to update site metadata and navigation.
- Edit `index.html` to change page structure and static page copy.
- Edit `assets/css/site.css` for custom styling.
- Edit `assets/js/app.js` for application behavior.

## Local preview

JSON files are loaded with `fetch()`, so use a local HTTP server instead of opening the HTML file directly.

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Deployment

Publish the repository root with `index.html` and the `assets/` directory. The site does not require a build step or server-side runtime.

## Current limitations

The expression-of-interest and inquiry forms currently show client-side confirmation only. They do not persist submissions or send email. Connect an approved form service or backend before collecting real applications.
