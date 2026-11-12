# TIIS website forms: Google Apps Script + Google Sheets

This integration handles both website forms:
- Membership Expression of Interest
- General Inquiry

Every valid submission is validated again in Apps Script, appended to a private Google Sheet, and followed by an email notification to `bay.nv@ou.edu.vn`. The browser receives a real success/failure response through an embedded Apps Script bridge; it does not display a success state merely because a request was dispatched.

## 1. Create the Apps Script project

1. Sign in to the Google account that should own the submissions and notifications.
2. Open https://script.google.com/ and create a new standalone project, for example **TIIS Website Forms**.
3. Replace the contents of `Code.gs` with the repository's `google-apps-script/Code.gs`.
4. Add an HTML file named **Bridge** (the name is case-sensitive) and paste `google-apps-script/Bridge.html`.
5. Save the project.

## 2. Deploy

1. Choose **Deploy → New deployment**.
2. Select type **Web app**.
3. Set **Execute as: Me**.
4. Set **Who has access: Anyone** (the endpoint must be reachable by public website visitors).
5. Deploy and authorize the requested Google Sheets and email permissions.
6. Copy the Web app URL ending in `/exec`.

The first successful submission creates a spreadsheet named **TIIS Website Form Submissions** in the deploying account's Google Drive. The sheet ID is stored in Script Properties. Keep the spreadsheet private; share it only with authorized staff.

## 3. Connect the website

In `assets/js/app.js`, replace the empty value here:

```js
const TIIS_APPS_SCRIPT_URL = '';
```

with the deployed URL:

```js
const TIIS_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

Commit the change to the website's `main` branch and wait for GitHub Pages deployment.

## 4. Test before announcing

Submit one test entry through each form using an email address you control. Verify:
- A new row appears in **TIIS Website Form Submissions → Submissions**.
- An email arrives at `bay.nv@ou.edu.vn`.
- The confirmation shown on the website contains the same reference as the sheet.
- Invalid and incomplete submissions are rejected.

If you change the Apps Script code after deployment, use **Deploy → Manage deployments → Edit → New version → Deploy**. The `/exec` URL normally remains the same.

## Notes

- This is a Google Sheets + Apps Script workflow, not a Google Forms response destination. It provides the requested spreadsheet record and email notification directly.
- The Apps Script runs under the deploying Google account. Daily Apps Script quotas and that account's authorization apply.
- The web app must be accessible to anonymous visitors. If the Google Workspace administrator blocks public Apps Script web apps, ask the administrator to allow the deployment or use an approved institutional alternative.
- The code includes required-field/email validation, length limits, a honeypot spam field, and spreadsheet formula-injection protection. For higher-volume public forms, add CAPTCHA or an approved anti-abuse service.
