# Pennywisely Money Tracker

Pennywisely is a simple website to track money. It shows income, spending, budgets, savings goals, bills and debts in one place.

Built with **HTML, CSS, Bootstrap 5, Chart.js and JavaScript**. There is no database. The data is sample data (`assets/js/data.js`), and anything you add or change is saved in your browser (localStorage).

## How to use
1. Open `index.html` in a browser (internet is needed for Bootstrap and Chart.js).
2. Log in with:
   - Username: `user`
   - Password: `user12345`
3. Use the menu to go to each page.

## Pages
| Page | What it does |
|---|---|
| `index.html` | Login page with piggy mascot (eyes follow your mouse, covers eyes when you type the password), time-based greeting, rotating money tips, Caps Lock warning |
| `dashboard.html` | Summary cards, 5 charts, money health score and tips |
| `transactions.html` | Table of income and expenses: search, filter, sort, pages, add new, export CSV |
| `budgets.html` | Spending limit for each category, edit limits, safe daily spend, chart |
| `goals.html` | Savings goals (add, top up, delete) and monthly bills (mark paid, filter, chart) |
| `debts.html` | Debts and loans, add payment, payoff planner (avalanche or snowball), charts |
| `reports.html` | Monthly report with charts, export CSV, print |
| `account.html` | Profile, notification settings, backup, restore and reset data |

## Other features
- Notification bell (bills due, budgets near limit, high-interest debts)
- Dark mode
- Keyboard shortcuts: `N` to add a transaction, `/` to search
- Works on phone and desktop (side menu on desktop, bottom bar on phone)
- The date at the top is the real date of today

## Folder structure
```
index.html, dashboard.html, transactions.html, budgets.html,
goals.html, debts.html, reports.html, account.html
assets/
  css/   base, layout, components, pages, responsive, login
  js/    data.js (sample data), core.js (shared code), goal-art.js (goal pictures), pages/ (one file per page)
  img/   logo and pictures
```

## Run on GitHub Pages
Upload all files, keep `index.html` in the root, then go to Settings > Pages and choose branch `main` and folder `/ (root)`.