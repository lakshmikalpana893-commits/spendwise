# SpendWise – Personal Expense Tracker

SpendWise is a complete responsive browser-based personal expense tracker for students. It uses only HTML5, CSS3, Vanilla JavaScript, localStorage, Font Awesome CDN, and Google Fonts. No backend or database is required.

## Run

1. Extract the ZIP.
2. Open `index.html` in a browser.
3. For best results, serve the folder with a simple static server (for example VS Code Live Server), but no backend is required.

## Pages

- `index.html` — landing page
- `dashboard.html` — financial dashboard
- `transactions.html` — add/edit/delete/search/filter/sort transactions
- `budget.html` — monthly budget management
- `reports.html` — monthly analytics and CSS/JS charts
- `settings.html` — theme and JSON backup/restore/reset

## Storage

The app uses these localStorage keys:

- `spendwise_transactions`
- `spendwise_budget`
- `spendwise_theme`

## Notes

- The budget model follows the requested one-active-budget object.
- Reports use CSS and JavaScript only; no external chart library is used.
- Exported backups are JSON files named `spendwise-backup-YYYY-MM-DD.json`.
- Imported data is validated before replacing SpendWise data.
- Reset removes only SpendWise keys and never calls `localStorage.clear()`.

## Tech constraints followed

No React, Angular, Vue, Bootstrap, Tailwind, Node.js, Express, Firebase, MongoDB, MySQL, PostgreSQL, PHP, Python backend, JavaScript framework, CSS framework, Chart.js, or external charting library.
