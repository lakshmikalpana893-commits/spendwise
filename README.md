# SpendWise – Personal Expense Tracker

**SpendWise** is a modern, responsive personal expense tracking web application designed to help students manage their finances effectively. It allows users to record income and expenses, set monthly budgets, analyze spending patterns, and monitor their financial activity through an intuitive dashboard.

The application is built completely with **HTML5, CSS3, and Vanilla JavaScript**, with **browser localStorage** used for persistent data storage. No backend, database, or JavaScript framework is required.

## ✨ Features

### 💰 Expense & Income Management

* Add income and expense transactions
* Edit existing transactions
* Delete individual transactions
* Track transaction categories
* Record payment methods
* Add descriptions and transaction dates
* Automatic balance calculation

### 📊 Dashboard

* Total balance
* Total income
* Total expenses
* Current monthly budget
* Remaining budget
* Recent transactions
* Category-wise spending summary
* Budget utilization progress
* Smart spending tips

### 🔎 Transaction Management

* Search transactions
* Filter by income/expense
* Filter by category
* Filter by date
* Custom date range filtering
* Sort by newest or oldest
* Sort by amount
* Sort alphabetically by category
* Matching transaction summaries

### 📅 Budget Management

* Set a monthly spending budget
* Edit or remove the budget
* Track monthly expenses
* Calculate remaining budget
* Monitor budget utilization
* Identify budget overspending
* Category-wise budget analysis
* Personalized saving tips

### 📈 Reports & Insights

* Monthly income and expense summary
* Net savings calculation
* Largest expense category
* Largest individual expense
* Income vs expense comparison
* Category-wise spending breakdown
* CSS/JavaScript-based spending charts
* Daily expense activity
* Top spending transactions
* Dynamic financial insights

### 🌙 User Experience

* Light and dark mode
* Responsive design
* Mobile-friendly sidebar
* Hamburger navigation
* Toast notifications
* Custom confirmation modals
* Form validation
* Responsive transaction cards and tables

### 💾 Data Management

* Browser-based localStorage persistence
* Export data as JSON
* Import backup data
* Reset SpendWise data
* Data remains available after browser refresh
* No external database required

## 🛠️ Technologies Used

* **HTML5** – Application structure
* **CSS3** – Styling and responsive layouts
* **Vanilla JavaScript** – Application logic and dynamic functionality
* **localStorage** – Client-side data persistence
* **Font Awesome CDN** – Icons
* **Google Fonts** – Typography

## 🚫 No Backend Required

SpendWise is a completely client-side application.

It does **not** use:

* React
* Angular
* Vue
* Bootstrap
* Tailwind CSS
* Node.js
* Express
* Firebase
* MongoDB
* MySQL
* PostgreSQL
* PHP
* Python backend
* Chart.js
* External charting libraries

## 📂 Project Structure

```text
spendwise/
│
├── index.html
├── dashboard.html
├── transactions.html
├── budget.html
├── reports.html
├── settings.html
├── README.md
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── dashboard.js
│   ├── transactions.js
│   ├── budget.js
│   ├── reports.js
│   └── settings.js
│
└── assets/
    └── images/
        └── README.txt
```

## 📄 Application Pages

### Home

Introduces SpendWise and provides quick access to the main application features.

### Dashboard

Displays an overview of income, expenses, balance, budget status, recent transactions, spending categories, and financial tips.

### Transactions

Provides complete transaction management with search, filtering, sorting, editing, deletion, and transaction summaries.

### Budget

Allows users to create and manage a monthly budget while monitoring spending and budget utilization.

### Reports

Provides monthly financial analysis, category-wise spending reports, charts, and personalized insights.

### Settings

Provides theme management, JSON data export/import, application information, and complete data reset functionality.

## 💾 LocalStorage

SpendWise uses the following localStorage keys:

```text
spendwise_transactions
spendwise_budget
spendwise_theme
```

This allows application data to remain available even after the browser is refreshed.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/spendwise.git
```

### 2. Open the project

Navigate to the project directory:

```bash
cd spendwise
```

### 3. Run the application

Open:

```text
index.html
```

in any modern web browser.

No installation, server, database, or build process is required.

## 📱 Responsive Design

SpendWise is designed to work across:

* Mobile devices
* Tablets
* Laptops
* Desktop computers

The interface automatically adapts to different screen sizes using responsive CSS.

## 🔐 Privacy

SpendWise stores financial information only in the user's browser through localStorage.

Your financial data is not sent to a server or external database.

> **Privacy Note:** Export a JSON backup regularly to avoid losing your browser-stored data.

## 🎯 Project Goals

The main goals of SpendWise are to:

* Help students understand their spending habits
* Make expense tracking simple and accessible
* Encourage responsible budgeting
* Provide useful financial insights
* Demonstrate practical frontend development skills
* Build a fully functional application without a backend

## 🔮 Future Enhancements

Possible future improvements include:

* Multiple monthly budgets
* Recurring transactions
* Savings goals
* Advanced financial analytics
* PDF report generation
* Data visualization improvements
* Optional cloud synchronization
* User authentication
* Progressive Web App support

## 👩‍💻 Author

**Your Name**

Developed as an independent frontend web development project.

## 📜 License

This project is available for educational and personal use.
