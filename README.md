# Pennywisely – Personal Money Tracker

> **IMS566 Advanced Web Design Development and Content Management – Individual Project**
> **Student:** ANIS AMIRA BINTI HAMDAN | **Student ID:** 2025379645 | **Group/Class:** CDIM2624ST1

| | |
|---|---|
| 🌐 **Live Website (GitHub Pages)** | https://lilynzs12.github.io/pennywisely/ |
| 📁 **GitHub Repository** | https://github.com/Lilynzs12/pennywisely.git  |

---

## 1. Project Title & Description

**Pennywisely** is a web application interface (prototype) that helps users track their personal money in one place. It brings together income, spending, budgets, savings goals, bills and debts, and presents them through tables, summary cards and interactive charts.

The project was built to demonstrate advanced web design principles and content management concepts: responsive layout, consistent navigation, structured content, data presentation and data visualisation.

There is **no database or back end**. Authentication is simulated with hardcoded credentials, the data is sample data stored in `assets/js/data.js`, and anything the user adds or changes is saved in the browser using `localStorage`.

---

## 2. Instructions to Test Login

1. Open the live website link above (or open `index.html` in Google Chrome).
2. Enter the following credentials:

   | Field | Value |
   |---|---|
   | Username | `user` |
   | Password | `user12345` |

3. Click **Login** to go to the Dashboard.

**To test error feedback:** enter a wrong username or password. A clear error message is shown and you stay on the login page. Leaving fields empty also shows a validation message.

> Note: An internet connection is needed because Bootstrap and Chart.js are loaded from a CDN. Google Chrome is recommended for testing.

---

## 3. Features Included

### Mapped to the project requirements

| Requirement | How it is met |
|---|---|
| **3.1 Authentication** | `index.html` – login with hardcoded credentials, invalid username/password error feedback, Caps Lock warning, animated piggy mascot (eyes follow the mouse, covers eyes while typing the password), time-based greeting and rotating money tips |
| **3.2 Navigation Menu** | Same menu on every page linking all pages. Side menu on desktop, bottom bar on phone (responsive) |
| **3.3 Dashboard** | `dashboard.html` – landing page after login with summary cards, 5 charts, money health score and tips |
| **3.4 Data View Pages (min. 2)** | `transactions.html`, `budgets.html`, `goals.html` (savings goals and bills) and `debts.html` – each shows a different dataset in tables, lists or grids |
| **3.5 Data Visualisation** | Chart.js charts on the Dashboard, Budgets, Goals/Bills, Debts and Reports pages. Charts show real figures from the user's data (e.g. spending by category, budget vs actual, debt payoff) |
| **4.3 Responsive Design** | Bootstrap 5 grid plus custom `responsive.css`, tested on desktop and mobile widths |
| **4.4 Content Management** | Every page has a clear title, meaningful `<title>` and meta tags, structured sections (header, main content, footer) and a professional footer |

### Page overview

| Page | What it does |
|---|---|
| `index.html` | Login / authentication page |
| `dashboard.html` | Summary of income, spending and savings with charts, health score and tips |
| `transactions.html` | Income and expense table: search, filter, sort, pagination, add new, export CSV |
| `budgets.html` | Spending limit per category, edit limits, safe daily spend, budget chart |
| `goals.html` | Savings goals (add, top up, delete) and monthly bills (mark paid, filter, chart) |
| `debts.html` | Debts and loans, add payment, payoff planner (avalanche or snowball), charts |
| `reports.html` | Monthly report with charts, export to CSV, print |
| `account.html` | Profile, notification settings, backup, restore and reset data |

### Extra features
- Notification bell (bills due, budgets near limit, high-interest debts)
- Dark mode
- Keyboard shortcuts: `N` to add a transaction, `/` to search
- Dates are based on the real date of today
- Data saved in the browser with `localStorage`

---

## 4. Frameworks & Libraries Used

| Tool | Purpose |
|---|---|
| **HTML5** | Page structure and semantic content |
| **CSS3** | Custom styling, dark mode, animations |
| **Bootstrap 5** | Front-end framework: grid, components, responsive layout |
| **JavaScript (ES6)** | Page logic, login simulation, data handling |
| **Chart.js** | Interactive charts and data visualisation |
| **localStorage** | Saves user changes in the browser (no database) |
| **GitHub Pages** | Hosting / deployment |

---

## 5. Code Organisation

HTML, CSS and JavaScript are separated into folders and commented for easy reading.

```
index.html, dashboard.html, transactions.html, budgets.html,
goals.html, debts.html, reports.html, account.html
assets/
├── css/   base, layout, components, pages, responsive, login
├── js/
│   ├── data.js        (sample data)
│   ├── core.js        (shared code: menu, theme, notifications, storage)
│   ├── goal-art.js    (goal pictures)
│   └── pages/         (one JavaScript file per page)
└── img/   logo and pictures
```

---

## 6. Deployment (GitHub Pages)

1. Upload all files to a GitHub repository and keep `index.html` in the root folder.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose branch `main` and folder `/ (root)`, then click **Save**.
4. After a minute, the site is live at `https://[username].github.io/[projectname]/`.

---

## 7. Notes

- Sample data is for demonstration only. Use **Account → Reset data** to restore the original sample data.
- Developed and tested using **Google Chrome**.
