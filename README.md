# 💰 PennyWise — Personal Expense Tracker & Smart Budgeting App

PennyWise is a web-based personal finance application designed to help users track their income and expenses, manage budgets, monitor savings goals, and understand their spending habits through interactive charts.

## ✨ Features

- 🔐 **User Authentication** — Signup and login pages with a personalized welcome message.
- 📊 **Interactive Dashboard** — View key financial information and spending summaries.
- 💸 **Transaction Management** — Track income and expenses.
- 🎯 **Budget Management** — Create budgets and monitor spending by category.
- 🚨 **Budget Alerts** — Receive visual warnings when spending approaches or exceeds a budget limit.
- 🏦 **Savings Goals** — Set savings targets and monitor progress.
- 📈 **Data Visualization** — Explore financial information through interactive charts.
- 💾 **Local Data Persistence** — Save application data in browser local storage.
- 🚪 **Logout** — End the current demo login session.

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Build Tool:** Vite
- **Routing:** React Router
- **Charts:** Recharts
- **Styling:** CSS
- **Storage:** Browser Local Storage
- **Version Control:** Git and GitHub

## 🚀 Getting Started

### Prerequisites

Install the following tools:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/daakshaini/PennyWise-Expense-Tracker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd PennyWise-Expense-Tracker
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal, usually `http://localhost:5173`.

## 📖 How to Use

1. Create an account using the signup page.
2. Log in to access the dashboard.
3. Add and manage your income and expense transactions.
4. Set category-wise budgets and monitor your spending.
5. Review budget alerts to identify overspending.
6. Create savings goals and track your progress.
7. Log out when you finish.

## 🗂️ Project Structure

```text
PennyWise/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── Router.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Auth.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

*Note: The structure above highlights the main files. Your repository may contain additional files and folders.*

## 🔒 Data & Security

PennyWise currently uses browser local storage for application data and demo authentication. This version is intended for learning and demonstration.

- Data is stored in the browser rather than a production database.
- Local storage data may be lost if browser data is cleared.
- Demo authentication is not suitable for protecting real financial information.
- Do not enter real passwords or sensitive financial information.

A production version should use secure authentication, server-side validation, and an appropriate database.

## 🔮 Future Enhancements

- Monthly and yearly financial reports
- Export transactions to CSV or PDF
- Improved search and filtering
- Recurring transaction support
- More advanced budgeting insights
- Secure backend authentication and database integration
- Responsive design improvements

## 🎓 Project Purpose

PennyWise is a student project created to explore frontend development, financial data management, interactive visualization, and budget tracking through a practical web application.

## 👩‍💻 Author

**Daakshaini**

GitHub: [@daakshaini](https://github.com/daakshaini)

## 📄 License

This project is available for educational and portfolio purposes. Add a formal license if you intend to specify permissions for reuse and distribution.