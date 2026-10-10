
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Settings,
  Bell,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Menu,
  X,
  Coffee,
  ShoppingBag,
  Car,
  Briefcase,
  Utensils,
  Trash2,
  CalendarDays,
  Save,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import "./App.css";

const KEYS = {
  transactions: "pennywise_transactions",
  budgets: "pennywise_budgets",
  goals: "pennywise_goals",
};

const initialTransactions = [
  {
    id: 1,
    title: "Monthly Salary",
    category: "Salary",
    date: "Oct 10, 2026",
    amount: 45000,
    type: "income",
  },
  {
    id: 2,
    title: "Groceries",
    category: "Food & Drinks",
    date: "Oct 09, 2026",
    amount: 1850,
    type: "expense",
  },
  {
    id: 3,
    title: "Coffee & Snacks",
    category: "Food & Drinks",
    date: "Oct 08, 2026",
    amount: 240,
    type: "expense",
  },
  {
    id: 4,
    title: "Travel",
    category: "Transportation",
    date: "Oct 07, 2026",
    amount: 650,
    type: "expense",
  },
  {
    id: 5,
    title: "Restaurant",
    category: "Food & Drinks",
    date: "Oct 06, 2026",
    amount: 780,
    type: "expense",
  },
];

const categories = [
  "Food & Drinks",
  "Transportation",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Salary",
  "Other",
];

const defaultBudgets = [
  { id: 1, category: "Food & Drinks", limit: 6000 },
  { id: 2, category: "Transportation", limit: 3000 },
  { id: 3, category: "Shopping", limit: 4000 },
  { id: 4, category: "Bills", limit: 5000 },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Wallet", icon: Wallet },
  { label: "Transactions", icon: ArrowLeftRight },
  { label: "Budgets", icon: CreditCard },
  { label: "Savings Goals", icon: Target },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [transactions, setTransactions] = useState(() =>
    readStorage(KEYS.transactions, initialTransactions)
  );

  const [budgets, setBudgets] = useState(() =>
    readStorage(KEYS.budgets, defaultBudgets)
  );

  const [goals, setGoals] = useState(() =>
    readStorage(KEYS.goals, [])
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food & Drinks",
  });

  const [budgetForm, setBudgetForm] = useState({
    category: "Food & Drinks",
    limit: "",
  });

  const [goalForm, setGoalForm] = useState({
    name: "",
    target: "",
    saved: "",
    deadline: "",
  });

  useEffect(() => {
    localStorage.setItem(
      KEYS.transactions,
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(KEYS.budgets, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(KEYS.goals, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3500);

    return () => clearTimeout(timer);
  }, [notice]);

  const money = (amount) =>
    "₹" +
    Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  const savingsRate =
    income > 0 ? Math.round((balance / income) * 100) : 0;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = `${t.title} ${t.category} ${t.date}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || t.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        t.category === categoryFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory
      );
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const spending = categories
    .filter((category) => category !== "Salary")
    .map((category) => ({
      category,
      amount: transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === category
        )
        .reduce((sum, t) => sum + Number(t.amount), 0),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Navigation fix: Workspace always opens Dashboard.
  function changePage(page) {
    setActivePage(page);
    setMobileMenu(false);
    setNotice("");
  }

  function getIcon(transaction) {
    if (
      transaction.type === "income" ||
      transaction.category === "Salary"
    ) {
      return Briefcase;
    }

    if (transaction.category === "Food & Drinks") {
      return Utensils;
    }

    if (transaction.category === "Transportation") {
      return Car;
    }

    if (transaction.category === "Entertainment") {
      return Coffee;
    }

    return ShoppingBag;
  }

  function addTransaction(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (
      !form.title.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setNotice(
        "Please enter a valid transaction name and amount."
      );
      return;
    }

    const item = {
      id: Date.now(),
      title: form.title.trim(),
      amount,
      type: form.type,
      category: form.category,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setTransactions((current) => [item, ...current]);

    setForm({
      title: "",
      amount: "",
      type: "expense",
      category: "Food & Drinks",
    });

    setShowForm(false);
    setNotice("Transaction added successfully!");
  }

  function deleteTransaction(id) {
    if (
      !window.confirm(
        "Do you want to delete this transaction?"
      )
    ) {
      return;
    }

    setTransactions((current) =>
      current.filter((t) => t.id !== id)
    );

    setNotice("Transaction deleted.");
  }

  function saveBudget(event) {
    event.preventDefault();

    const limit = Number(budgetForm.limit);

    if (!Number.isFinite(limit) || limit <= 0) {
      setNotice("Enter a valid budget amount.");
      return;
    }

    setBudgets((current) => {
      const exists = current.some(
        (b) => b.category === budgetForm.category
      );

      return exists
        ? current.map((b) =>
            b.category === budgetForm.category
              ? { ...b, limit }
              : b
          )
        : [
            ...current,
            {
              id: Date.now(),
              category: budgetForm.category,
              limit,
            },
          ];
    });

    setBudgetForm({
      category: "Food & Drinks",
      limit: "",
    });

    setShowBudgetForm(false);
    setNotice("Budget saved successfully!");
  }

  function saveGoal(event) {
    event.preventDefault();

    const target = Number(goalForm.target);
    const saved = Number(goalForm.saved || 0);

    if (
      !goalForm.name.trim() ||
      !Number.isFinite(target) ||
      target <= 0 ||
      !Number.isFinite(saved) ||
      saved < 0
    ) {
      setNotice(
        "Please enter valid savings goal details."
      );
      return;
    }

    setGoals((current) => [
      ...current,
      {
        id: Date.now(),
        name: goalForm.name.trim(),
        target,
        saved: Math.min(saved, target),
        deadline: goalForm.deadline,
      },
    ]);

    setGoalForm({
      name: "",
      target: "",
      saved: "",
      deadline: "",
    });

    setShowGoalForm(false);
    setNotice("Savings goal created!");
  }

  function updateGoal(id, amount) {
    const saved = Math.max(0, Number(amount) || 0);

    setGoals((current) =>
      current.map((g) =>
        g.id === id
          ? { ...g, saved: Math.min(saved, g.target) }
          : g
      )
    );
  }

  function deleteGoal(id) {
    if (!window.confirm("Delete this savings goal?")) {
      return;
    }

    setGoals((current) =>
      current.filter((g) => g.id !== id)
    );

    setNotice("Savings goal deleted.");
  }

  function transactionRows(items, showDelete = true) {
    if (!items.length) {
      return (
        <div className="empty-state">
          No transactions found. Try another search or add a
          transaction.
        </div>
      );
    }

    return items.map((t) => {
      const Icon = getIcon(t);

      return (
        <div className="transaction-row" key={t.id}>
          <div
            className={`transaction-icon ${
              t.type === "income" ? "transaction-income" : ""
            }`}
          >
            <Icon size={19} />
          </div>

          <div className="transaction-info">
            <strong>{t.title}</strong>
            <span>
              {t.category} · {t.date}
            </span>
          </div>

          <strong
            className={`transaction-amount ${
              t.type === "income" ? "amount-income" : ""
            }`}
          >
            {t.type === "income" ? "+" : "−"}
            {money(t.amount)}
          </strong>

          {showDelete && (
            <button
              className="icon-button"
              type="button"
              title="Delete transaction"
              onClick={() => deleteTransaction(t.id)}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      );
    });
  }

  function budgetRows(items) {
    if (!items.length) {
      return (
        <div className="empty-state">
          No budgets yet. Create a budget to track spending.
        </div>
      );
    }

    return items.map((budget, index) => {
      const spent = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === budget.category
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const percentage = Math.min(
        100,
        (spent / budget.limit) * 100
      );

      const over = spent > budget.limit;

      return (
        <div className="budget-item" key={budget.id}>
          <div className="budget-label">
            <span>{budget.category}</span>
            <strong>
              {money(spent)} / {money(budget.limit)}
            </strong>
          </div>

          <div className="progress-track">
            <div
              className={`progress-fill ${
                over
                  ? "bar-orange"
                  : [
                      "bar-green",
                      "bar-purple",
                      "bar-blue",
                    ][index % 3]
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="budget-note budget-actions">
            <span
              className={`note-dot ${
                over ? "note-orange" : ""
              }`}
            />

            <span>
              {over
                ? `Over budget by ${money(
                    spent - budget.limit
                  )}`
                : `${money(
                    budget.limit - spent
                  )} remaining`}
            </span>

            <button
              className="text-button"
              onClick={() => {
                const next = window.prompt(
                  `New budget for ${budget.category}`,
                  String(budget.limit)
                );

                if (
                  next !== null &&
                  Number.isFinite(Number(next)) &&
                  Number(next) > 0
                ) {
                  setBudgets((current) =>
                    current.map((b) =>
                      b.id === budget.id
                        ? { ...b, limit: Number(next) }
                        : b
                    )
                  );

                  setNotice("Budget updated.");
                }
              }}
            >
              Edit
            </button>

            <button
              className="text-button danger-text"
              onClick={() => {
                setBudgets((current) =>
                  current.filter((b) => b.id !== budget.id)
                );

                setNotice("Budget removed.");
              }}
            >
              Remove
            </button>
          </div>
        </div>
      );
    });
  }

  function walletSummary() {
    return (
      <>
        <section className="wallet-hero">
          <div className="wallet-hero-top">
            <div>
              <span className="wallet-eyebrow">
                PERSONAL ACCOUNT
              </span>
              <h2>My Wallet</h2>
              <p>Your money, organised in one place.</p>
            </div>

            <div className="wallet-chip">
              <CreditCard size={24} />
            </div>
          </div>

          <span className="wallet-balance-label">
            Available balance
          </span>

          <div className="wallet-balance">
            {money(balance)}
          </div>

          <div className="wallet-hero-bottom">
            <span>
              <span className="wallet-status-dot" />
              Personal wallet
            </span>
            <span>INR · ₹</span>
          </div>
        </section>

        <section className="stats-grid wallet-stats">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total income</span>
              <span className="stat-icon income-icon">
                <ArrowDownRight size={19} />
              </span>
            </div>
            <div className="stat-value">{money(income)}</div>
            <div className="stat-foot">
              <span className="green-pill trend-pill">
                Money received
              </span>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Total expenses</span>
              <span className="stat-icon expense-icon">
                <ArrowUpRight size={19} />
              </span>
            </div>
            <div className="stat-value">
              {money(expenses)}
            </div>
            <div className="stat-foot">
              <span className="red-pill trend-pill">
                Money spent
              </span>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Savings rate</span>
              <span className="stat-icon income-icon">
                <PiggyBank size={19} />
              </span>
            </div>
            <div className="stat-value">
              {savingsRate}%
            </div>
            <div className="stat-foot">
              <span>Of recorded income</span>
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent wallet activity</h2>
              <p>Your latest income and expenses</p>
            </div>

            <button
              className="text-button"
              onClick={() => changePage("Transactions")}
            >
              View all →
            </button>
          </div>

          <div className="transaction-list">
            {transactionRows(transactions.slice(0, 6))}
          </div>

          <button
            className="primary-button wallet-add-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={17} /> Add transaction
          </button>
        </section>
      </>
    );
  }

  function dashboard() {
    return (
      <>
        <section className="stats-grid">
          <article className="stat-card balance-card">
            <div className="stat-top">
              <span>Total balance</span>
              <span className="stat-icon balance-icon">
                <Wallet size={19} />
              </span>
            </div>

            <div className="stat-value">{money(balance)}</div>

            <div className="stat-foot">
              <span className="trend-pill">
                <TrendingUp size={14} /> Live total
              </span>
              <span>Income minus expenses</span>
            </div>

            <div className="balance-decoration decoration-one" />
            <div className="balance-decoration decoration-two" />
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Total income</span>
              <span className="stat-icon income-icon">
                <TrendingUp size={19} />
              </span>
            </div>

            <div className="stat-value">{money(income)}</div>

            <div className="stat-foot">
              <span className="trend-pill green-pill">
                Money in
              </span>
              <span>Recorded income</span>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Total expenses</span>
              <span className="stat-icon expense-icon">
                <TrendingDown size={19} />
              </span>
            </div>

            <div className="stat-value">
              {money(expenses)}
            </div>

            <div className="stat-foot">
              <span className="trend-pill red-pill">
                Money out
              </span>
              <span>Recorded expenses</span>
            </div>
          </article>
        </section>

        <section className="insight-banner">
          <div className="insight-symbol">
            <Sparkles size={22} />
          </div>

          <div className="insight-copy">
            <strong>A little insight for you</strong>
            <p>
              {income > 0
                ? `Your current balance is ${savingsRate}% of your recorded income. Keep an eye on spending to reach your goals.`
                : "Add income and expenses to unlock budgeting insights."}
            </p>
          </div>

          <span className="insight-tag">SMART TIP</span>
        </section>

        <section className="content-grid">
          <div className="panel transactions-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent transactions</h2>
                <p>Your latest money movements</p>
              </div>

              <button
                className="text-button"
                onClick={() => changePage("Transactions")}
              >
                View all →
              </button>
            </div>

            <div className="transaction-list">
              {transactionRows(
                filteredTransactions.slice(0, 5),
                false
              )}
            </div>
          </div>

          <div className="panel budget-panel">
            <div className="panel-heading">
              <div>
                <h2>Spending snapshot</h2>
                <p>Expense breakdown</p>
              </div>
              <span className="mini-period">ALL TIME</span>
            </div>

            <div className="spending-total">
              {money(expenses)}
              <span> spent</span>
            </div>

            {!spending.length ? (
              <div className="empty-state">
                Add expenses to see your spending breakdown.
              </div>
            ) : (
              spending.slice(0, 5).map((item, index) => (
                <div
                  className="budget-item"
                  key={item.category}
                >
                  <div className="budget-label">
                    <span>{item.category}</span>
                    <strong>{money(item.amount)}</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${
                        [
                          "bar-green",
                          "bar-orange",
                          "bar-purple",
                          "bar-blue",
                        ][index % 4]
                      }`}
                      style={{
                        width: `${
                          expenses
                            ? (item.amount / expenses) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}

            <div className="budget-note">
              <span className="note-dot" />
              Based on recorded transactions
            </div>
          </div>
        </section>

        <section className="panel dashboard-budget-panel">
          <div className="panel-heading">
            <div>
              <h2>Budget health</h2>
              <p>Compare spending with category limits</p>
            </div>

            <button
              className="text-button"
              onClick={() => changePage("Budgets")}
            >
              Manage budgets →
            </button>
          </div>

          {budgetRows(budgets.slice(0, 3))}
        </section>
      </>
    );
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-logo">
            <Wallet size={23} />
          </div>

          <span>
            Penny<span className="brand-accent">Wise</span>
          </span>

          <button
            className="close-menu"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="nav-list">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  activePage === item.label ? "nav-active" : ""
                }`}
                onClick={() => changePage(item.label)}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {item.label === "Transactions" && (
                  <span className="nav-count">
                    {transactions.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <PiggyBank size={23} />
            </div>
            <h3>Build better habits</h3>
            <p>
              Small savings today make a big difference tomorrow.
            </p>
          </div>

          <button
            className={`nav-item settings-item ${
              activePage === "Settings" ? "nav-active" : ""
            }`}
            onClick={() => changePage("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button
            className={`profile ${
              activePage === "My Wallet" ? "profile-active" : ""
            }`}
            onClick={() => changePage("My Wallet")}
            aria-label="Open My Wallet"
          >
            <div className="avatar">P</div>
            <div className="profile-info">
              <strong>My Wallet</strong>
              <span>Personal account</span>
            </div>
            <ChevronRight
              size={17}
              className="profile-chevron"
            />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* FIX: Workspace is now clickable and returns to Dashboard. */}
          <div className="breadcrumb">
            <button
              type="button"
              className="breadcrumb-home"
              onClick={() => changePage("Dashboard")}
              title="Go to Dashboard"
            >
              Workspace
            </button>

            <span>/</span>

            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            
<div className="search-box">
  <Search size={17} />

  <input
    type="search"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        changePage("Transactions");
      }
      if (e.key === "Escape") {
        setSearch("");
      }
    }}
    placeholder="Search transactions..."
    aria-label="Search transactions"
  />

  {search && (
    <button
      type="button"
      className="icon-button"
      onClick={() => setSearch("")}
      title="Clear search"
      aria-label="Clear search"
    >
      <X size={15} />
    </button>
  )}

  <kbd>Enter</kbd>
</div>
            <button
              className="top-avatar"
              onClick={() => changePage("My Wallet")}
              aria-label="Open wallet"
            >
              P
            </button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="live-dot" />
                YOUR MONEY, IN FOCUS
              </div>

              <h1>
                {activePage === "Dashboard"
                  ? "Good money habits start here."
                  : activePage}
              </h1>

              <p className="subtitle">
                {activePage === "My Wallet"
                  ? "Your personal account overview."
                  : "Here's what's happening with your finances."}
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} /> Add transaction
            </button>
          </section>

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button
                className="icon-button"
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {activePage === "Dashboard" && dashboard()}

          {activePage === "My Wallet" && walletSummary()}

          {activePage === "Transactions" && (
            <section className="panel all-transactions">
              <div className="panel-heading">
                <div>
                  <h2>All transactions</h2>
                  <p>Search, filter, and manage your money</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={17} /> Add new
                </button>
              </div>

              <div className="filter-row">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value)
                  }
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <button
                  className="secondary-button"
                  onClick={() => {
                    setTypeFilter("all");
                    setCategoryFilter("all");
                    setSearch("");
                  }}
                >
                  Clear filters
                </button>
              </div>

              {transactionRows(filteredTransactions)}
            </section>
          )}

          {activePage === "Budgets" && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Monthly budgets</h2>
                  <p>
                    Set spending limits for your categories
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowBudgetForm(true)}
                >
                  <Plus size={17} /> Set budget
                </button>
              </div>

              {budgetRows(budgets)}
            </section>
          )}

          {activePage === "Savings Goals" && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Your savings goals</h2>
                  <p>
                    Save toward the things that matter to you
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowGoalForm(true)}
                >
                  <Plus size={17} /> New goal
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="section-placeholder">
                  <div className="section-icon">
                    <Target size={25} />
                  </div>

                  <h2>Give your savings a purpose</h2>
                  <p>
                    Create a goal, set a target, and track your
                    progress.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => setShowGoalForm(true)}
                  >
                    <Plus size={16} /> Create your first goal
                  </button>
                </div>
              ) : (
                <div className="goals-grid">
                  {goals.map((goal) => {
                    const percent = Math.min(
                      100,
                      (goal.saved / goal.target) * 100
                    );

                    return (
                      <article
                        className="goal-card"
                        key={goal.id}
                      >
                        <div className="goal-card-top">
                          <span className="goal-icon">
                            <Target size={20} />
                          </span>

                          <button
                            className="icon-button"
                            onClick={() => deleteGoal(goal.id)}
                            aria-label="Delete goal"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <h3>{goal.name}</h3>

                        <div className="goal-percent">
                          {Math.round(percent)}
                          <small>%</small>
                        </div>

                        <div className="progress-track">
                          <div
                            className="progress-fill bar-green"
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>

                        <p>
                          {money(goal.saved)} saved of{" "}
                          {money(goal.target)}
                        </p>

                        {goal.deadline && (
                          <div className="goal-deadline">
                            <CalendarDays size={14} />
                            Target date: {goal.deadline}
                          </div>
                        )}

                        <label className="goal-update">
                          Update saved amount (₹)
                          <input
                            type="number"
                            min="0"
                            max={goal.target}
                            value={goal.saved}
                            onChange={(e) =>
                              updateGoal(
                                goal.id,
                                e.target.value
                              )
                            }
                          />
                        </label>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activePage === "Settings" && (
            <section className="panel settings-panel">
              <div className="settings-header">
                <span className="settings-big-icon">
                  <Settings size={25} />
                </span>

                <div>
                  <h2>Settings</h2>
                  <p>Manage your PennyWise workspace</p>
                </div>
              </div>

              <div className="settings-row">
                <div>
                  <strong>Currency</strong>
                  <p>Indian Rupee (₹)</p>
                </div>
                <span className="settings-value">INR ₹</span>
              </div>

              <div className="settings-row">
                <div>
                  <strong>Data storage</strong>
                  <p>Your data is saved in this browser.</p>
                </div>
                <span className="settings-value">
                  Local storage
                </span>
              </div>

              <div className="settings-row">
                <div>
                  <strong>Privacy</strong>
                  <p>
                    Clearing browser site data will remove saved
                    transactions, budgets, and goals.
                  </p>
                </div>
                <span className="settings-value">
                  On device
                </span>
              </div>

              <button
                className="secondary-button reset-button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Reset all data to the original demo data?"
                    )
                  ) {
                    setTransactions(initialTransactions);
                    setBudgets(defaultBudgets);
                    setGoals([]);
                    setSearch("");
                    setTypeFilter("all");
                    setCategoryFilter("all");
                    setNotice("Demo data restored.");
                  }
                }}
              >
                Restore demo data
              </button>
            </section>
          )}
        </div>

        <footer className="footer">
          <span>© 2026 PennyWise</span>
          <span>
            Make every rupee count.{" "}
            <span className="footer-heart">♥</span>
          </span>
        </footer>
      </main>

      {/* Add transaction modal */}
      {showForm && (
        <div
          className="modal-backdrop"
          onClick={() => setShowForm(false)}
        >
          <form
            className="transaction-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={addTransaction}
          >
            <div className="modal-heading">
              <div>
                <h2>Add transaction</h2>
                <p>Record your money movement</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Transaction name
              <input
                required
                maxLength="80"
                autoFocus
                placeholder="e.g. Electricity bill"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </label>

            <label>
              Amount (₹)
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />
            </label>

            <label>
              Transaction type
              <select
                value={form.type}
                onChange={(e) => {
                  const type = e.target.value;

                  setForm({
                    ...form,
                    type,
                    category:
                      type === "income"
                        ? "Salary"
                        : "Food & Drinks",
                  });
                }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                <Plus size={17} /> Save transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Set budget modal */}
      {showBudgetForm && (
        <div
          className="modal-backdrop"
          onClick={() => setShowBudgetForm(false)}
        >
          <form
            className="transaction-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveBudget}
          >
            <div className="modal-heading">
              <div>
                <h2>Set a budget</h2>
                <p>Create or update a category limit</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setShowBudgetForm(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Category
              <select
                value={budgetForm.category}
                onChange={(e) =>
                  setBudgetForm({
                    ...budgetForm,
                    category: e.target.value,
                  })
                }
              >
                {categories
                  .filter((c) => c !== "Salary")
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Monthly limit (₹)
              <input
                required
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 5000"
                value={budgetForm.limit}
                onChange={(e) =>
                  setBudgetForm({
                    ...budgetForm,
                    limit: e.target.value,
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowBudgetForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                <Save size={17} /> Save budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Savings goal modal */}
      {showGoalForm && (
        <div
          className="modal-backdrop"
          onClick={() => setShowGoalForm(false)}
        >
          <form
            className="transaction-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveGoal}
          >
            <div className="modal-heading">
              <div>
                <h2>Create savings goal</h2>
                <p>
                  Choose a target and track your progress
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setShowGoalForm(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Goal name
              <input
                required
                maxLength="80"
                placeholder="e.g. New laptop"
                value={goalForm.name}
                onChange={(e) =>
                  setGoalForm({
                    ...goalForm,
                    name: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Target amount (₹)
              <input
                required
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 60000"
                value={goalForm.target}
                onChange={(e) =>
                  setGoalForm({
                    ...goalForm,
                    target: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Already saved (₹)
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={goalForm.saved}
                onChange={(e) =>
                  setGoalForm({
                    ...goalForm,
                    saved: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Target date (optional)
              <input
                type="date"
                value={goalForm.deadline}
                onChange={(e) =>
                  setGoalForm({
                    ...goalForm,
                    deadline: e.target.value,
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowGoalForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                <Target size={17} /> Create goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
