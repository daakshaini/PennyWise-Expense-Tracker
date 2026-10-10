
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import "./App.css";

const CATEGORIES = [
  "Food", "Transport", "Shopping", "Bills",
  "Health", "Education", "Entertainment",
  "Salary", "Savings", "Other",
];const COLORS = [
  "#087f5b",
  "#50b987",
  "#9bd4b2",
  "#246e50",
  "#c9e8d4",
  "#3a956d",
];
const today = () => new Date().toISOString().slice(0, 10);

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const INITIAL_TRANSACTIONS = [
  {
    id: 1,
    title: "Monthly salary",
    amount: 30000,
    type: "Income",
    category: "Salary",
    date: today(),
  },
  {
    id: 2,
    title: "Groceries",
    amount: 2500,
    type: "Expense",
    category: "Food",
    date: today(),
  },
  {
    id: 3,
    title: "Transport",
    amount: 1200,
    type: "Expense",
    category: "Transport",
    date: today(),
  },
];

const INITIAL_GOALS = [
  {
    id: 101,
    name: "Emergency Fund",
    targetAmount: 20000,
    savedAmount: 5000,
    deadline: "",
  },
  {
    id: 102,
    name: "New Laptop",
    targetAmount: 50000,
    savedAmount: 10000,
    deadline: "",
  },
];


export default function App() {
  const navigate = useNavigate();

  const savedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("pennywise_user") || "null"
      );
    } catch {
      return null;
    }
  })();

  const userName = savedUser?.name?.trim() || "User";

  const handleLogout = () => {
    localStorage.removeItem("pennywise_logged_in");
    navigate("/login", { replace: true });
  };
  const [activePage, setActivePage] = useState("Dashboard");

  const [transactions, setTransactions] = useState(() =>
    readStorage("pennywise_transactions", INITIAL_TRANSACTIONS)
  );

  const [budgets, setBudgets] = useState(() =>
    readStorage("pennywise_budgets", [])
  );

  const [goals, setGoals] = useState(() =>
    readStorage("pennywise_savings_goals", INITIAL_GOALS)
  );

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const [transactionForm, setTransactionForm] = useState({
    title: "",
    amount: "",
    type: "Expense",
    category: "Food",
    date: today(),
  });

  const [budgetForm, setBudgetForm] = useState({
    category: "Food",
    limit: "",
  });

  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    savedAmount: "0",
    deadline: "",
  });

  const [savingForm, setSavingForm] = useState({
    goalId: "",
    amount: "",
  });

  useEffect(() => {
    localStorage.setItem(
      "pennywise_transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(
      "pennywise_budgets",
      JSON.stringify(budgets)
    );
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(
      "pennywise_savings_goals",
      JSON.stringify(goals)
    );
  }, [goals]);

  // AUTOMATIC INCOME, EXPENSE AND SAVINGS CALCULATIONS

  const totalIncome = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpenses = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = totalIncome - totalExpenses;

  const availableSavings = Math.max(0, balance);

  const totalGoalTarget = goals.reduce(
    (sum, goal) => sum + Number(goal.targetAmount),
    0
  );

  const totalGoalSaved = goals.reduce(
    (sum, goal) => sum + Number(goal.savedAmount),
    0
  );

  // CHART DATA

  const categoryChartData = useMemo(() => {
    const totals = {};

    transactions
      .filter((item) => item.type === "Expense")
      .forEach((item) => {
        totals[item.category] =
          (totals[item.category] || 0) + Number(item.amount);
      });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  const monthlyChartData = useMemo(() => {
    const totals = {};

    transactions.forEach((item) => {
      const date = new Date(`${item.date}T00:00:00`);

      const month = date.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });

      if (!totals[month]) {
        totals[month] = {
          month,
          Income: 0,
          Expenses: 0,
        };
      }

      totals[month][
        item.type === "Income" ? "Income" : "Expenses"
      ] += Number(item.amount);
    });

    return Object.values(totals);
  }, [transactions]);

  // ADD TRANSACTION

  function addTransaction(event) {
    event.preventDefault();

    if (
      !transactionForm.title.trim() ||
      Number(transactionForm.amount) <= 0
    ) {
      setNotice("Please enter a description and a valid amount.");
      return;
    }

    setTransactions((current) => [
      {
        ...transactionForm,
        id: Date.now(),
        title: transactionForm.title.trim(),
        amount: Number(transactionForm.amount),
      },
      ...current,
    ]);

    setTransactionForm({
      title: "",
      amount: "",
      type: "Expense",
      category: "Food",
      date: today(),
    });

    setNotice("Transaction added successfully.");
  }

  function deleteTransaction(id) {
    setTransactions((current) =>
      current.filter((item) => item.id !== id)
    );

    setNotice("Transaction deleted.");
  }

  // ADD OR UPDATE BUDGET

  function addBudget(event) {
    event.preventDefault();

    if (Number(budgetForm.limit) <= 0) {
      setNotice("Please enter a valid budget limit.");
      return;
    }

    setBudgets((current) => [
      ...current.filter(
        (item) => item.category !== budgetForm.category
      ),
      {
        id: Date.now(),
        category: budgetForm.category,
        limit: Number(budgetForm.limit),
      },
    ]);

    setBudgetForm({
      category: "Food",
      limit: "",
    });

    setNotice("Budget saved successfully.");
  }

  // CREATE SAVINGS GOAL

  function addGoal(event) {
    event.preventDefault();

    if (
      !goalForm.name.trim() ||
      Number(goalForm.targetAmount) <= 0
    ) {
      setNotice("Enter a goal name and a valid target amount.");
      return;
    }

    if (
      Number(goalForm.savedAmount) < 0 ||
      Number(goalForm.savedAmount) > Number(goalForm.targetAmount)
    ) {
      setNotice("Saved amount must be between zero and the target.");
      return;
    }

    setGoals((current) => [
      ...current,
      {
        id: Date.now(),
        name: goalForm.name.trim(),
        targetAmount: Number(goalForm.targetAmount),
        savedAmount: Number(goalForm.savedAmount) || 0,
        deadline: goalForm.deadline,
      },
    ]);

    setGoalForm({
      name: "",
      targetAmount: "",
      savedAmount: "0",
      deadline: "",
    });

    setNotice("Savings goal created successfully.");
  }

  // ADD MONEY TO A GOAL

  function addSavings(event) {
    event.preventDefault();

    const amount = Number(savingForm.amount);

    const selectedGoal = goals.find(
      (goal) => String(goal.id) === String(savingForm.goalId)
    );

    if (!selectedGoal || amount <= 0) {
      setNotice("Select a goal and enter a valid amount.");
      return;
    }

    if (amount > availableSavings) {
      setNotice(
        `You have only ${money(availableSavings)} available to save.`
      );
      return;
    }

    const remainingGoalAmount =
      selectedGoal.targetAmount - selectedGoal.savedAmount;

    if (amount > remainingGoalAmount) {
      setNotice(
        `This goal needs only ${money(remainingGoalAmount)} more.`
      );
      return;
    }

    setGoals((current) =>
      current.map((goal) =>
        goal.id === selectedGoal.id
          ? {
              ...goal,
              savedAmount: goal.savedAmount + amount,
            }
          : goal
      )
    );

    // Record the contribution as an expense so it is not
    // counted again as available savings.

    setTransactions((current) => [
      {
        id: Date.now(),
        title: `Savings contribution: ${selectedGoal.name}`,
        amount,
        type: "Expense",
        category: "Savings",
        date: today(),
      },
      ...current,
    ]);

    setSavingForm({
      goalId: "",
      amount: "",
    });

    setNotice("Money added to your savings goal!");
  }

  const filteredTransactions = transactions.filter((item) =>
    `${item.title} ${item.category} ${item.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // REUSABLE COMPONENTS

  function StatCard({ title, amount, subtitle, icon, color }) {
    return (
      <div className="pw-card stat-card">
        <div className="stat-top">
          <span>{title}</span>
          <span
            className="stat-icon"
            style={{ color, background: `${color}18` }}
          >
            {icon}
          </span>
        </div>

        <div className="stat-value">{money(amount)}</div>

        <div className="pw-muted">{subtitle}</div>
      </div>
    );
  }

  function ProgressBar({ value }) {
    const percentage = Math.min(100, Math.max(0, value));

    return (
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }

  function GoalCard({ goal }) {
    const percentage = goal.targetAmount
      ? Math.min(
          100,
          (goal.savedAmount / goal.targetAmount) * 100
        )
      : 0;

    return (
      <div className="pw-card goal-card" key={goal.id}>
        <div className="goal-heading">
          <div>
            <h3>{goal.name}</h3>
            <p className="pw-muted">
              {goal.deadline
                ? `Target date: ${goal.deadline}`
                : "No target date set"}
            </p>
          </div>

          <button
            type="button"
            className="pw-button danger-button"
            onClick={() => {
              setGoals((current) =>
                current.filter((item) => item.id !== goal.id)
              );
              setNotice("Savings goal deleted.");
            }}
          >
            Delete
          </button>
        </div>

        <div className="goal-amount">{money(goal.savedAmount)}</div>

        <div className="pw-muted">
          of {money(goal.targetAmount)} saved
        </div>

        <ProgressBar value={percentage} />

        <div className="goal-progress-labels">
          <strong>{percentage.toFixed(0)}% completed</strong>
          <span>
            {money(
              Math.max(0, goal.targetAmount - goal.savedAmount)
            )}{" "}
            to go
          </span>
        </div>

        {percentage >= 100 && (
          <p className="goal-complete">🎉 Goal completed!</p>
        )}
      </div>
    );
  }

  // DASHBOARD

  function dashboard() {
    return (
      <>
        <div className="page-heading">
          <h1>Welcome back, {userName}! 👋</h1>
          <p>Your financial overview and savings progress.</p>
        </div>

        <div className="pw-grid">
          <StatCard
            title="Total Income"
            amount={totalIncome}
            subtitle="Money received"
            icon="↗"
            color="#16a34a"
          />

          <StatCard
            title="Total Expenses"
            amount={totalExpenses}
            subtitle="Includes savings contributions"
            icon="↘"
            color="#dc5252"
          />

          <StatCard
            title="Current Balance"
            amount={balance}
            subtitle="Income minus expenses"
            icon="◈"
            color="#7c3aed"
          />

          <StatCard
            title="Available Savings"
            amount={availableSavings}
            subtitle="Remaining amount available to save"
            icon="♧"
            color="#08916c"
          />
        </div>

        <div className="pw-card automatic-savings-card">
          <div>
            <span className="eyebrow">SMART SAVINGS</span>
            <h2>Automatic Savings</h2>
            <p>
              Your available savings are calculated automatically
              whenever you add income or expenses.
            </p>
          </div>

          <div className="automatic-amount">
            {money(availableSavings)}
          </div>

          <button
            className="pw-button"
            onClick={() => setActivePage("Savings Goals")}
          >
            Manage savings goals →
          </button>
        </div>

        <div className="charts-grid">
          <div className="pw-card chart-card">
            <h3>Income vs Expenses</h3>

            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eee8f8"
                  />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Legend />
                  <Bar
                    dataKey="Income"
                    fill="#087f5b"
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    dataKey="Expenses"
                    fill="#9bd4b2"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pw-card chart-card">
            <h3>Spending by Category</h3>

            <div className="chart-area">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label
                    >
                      {categoryChartData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => money(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="pw-muted">
                  Add expenses to see your spending chart.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pw-card chart-card">
          <h3>Monthly Spending Trend</h3>

          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee8f8"
                />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => money(value)} />
                <Line
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#087f5b"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pw-card">
          <h3 className="section-title">Savings Goal Progress</h3>

<div className="pw-card" style={{ marginBottom: "20px" }}>
  <h3 className="section-title">🔔 Budget Alerts</h3>

  {budgets.filter((budget) => {
    const spent = transactions
      .filter(
        (item) =>
          item.type === "Expense" &&
          item.category === budget.category
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return spent >= budget.limit * 0.8;
  }).length === 0 ? (
    <p className="pw-muted">
      All good! Your budgets are within the safe limit. 🎉
    </p>
  ) : (
    budgets
      .filter((budget) => {
        const spent = transactions
          .filter(
            (item) =>
              item.type === "Expense" &&
              item.category === budget.category
          )
          .reduce((sum, item) => sum + Number(item.amount), 0);

        return spent >= budget.limit * 0.8;
      })
      .map((budget) => {
        const spent = transactions
          .filter(
            (item) =>
              item.type === "Expense" &&
              item.category === budget.category
          )
          .reduce((sum, item) => sum + Number(item.amount), 0);

        const percentage = (spent / budget.limit) * 100;

        return (
          <p
            key={budget.id}
            style={{
              padding: "12px",
              borderRadius: "10px",
              background:
                spent > budget.limit ? "#fee2e2" : "#fef3c7",
              color:
                spent > budget.limit ? "#b91c1c" : "#92400e",
              marginBottom: "8px",
            }}
          >
            {spent > budget.limit
              ? "🚨"
              : "⚠️"}{" "}
            <strong>{budget.category}:</strong>{" "}
            {spent > budget.limit
              ? `Budget exceeded by ₹${(spent - budget.limit).toFixed(2)}`
              : `${percentage.toFixed(0)}% used — only ₹${(budget.limit - spent).toFixed(2)} remaining`}
          </p>
        );
      })
  )}
</div>

          {goals.length ? 
          (
            <div className="goals-grid">
              {goals.slice(0, 3).map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <p className="pw-muted">
              Create your first savings goal in Savings Goals.
            </p>
          )}
        </div>
      </>
    );
  }

  // TRANSACTIONS PAGE

  function transactionsPage() {
    return (
      <>
        <div className="page-heading">
          <h1>Transactions</h1>
          <p>
            Add income or expenses. Your balance and savings update
            automatically.
          </p>
        </div>

        <form className="pw-card" onSubmit={addTransaction}>
          <h3 className="section-title">Add transaction</h3>

          <div className="form-grid">
            <label>
              Description
              <input
                className="pw-input"
                value={transactionForm.title}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    title: e.target.value,
                  })
                }
                placeholder="e.g. Part-time salary"
                required
              />
            </label>

            <label>
              Amount (₹)
              <input
                className="pw-input"
                type="number"
                min="0.01"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    amount: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Type
              <select
                className="pw-input"
                value={transactionForm.type}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    type: e.target.value,
                  })
                }
              >
                <option>Expense</option>
                <option>Income</option>
              </select>
            </label>

            <label>
              Category
              <select
                className="pw-input"
                value={transactionForm.category}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    category: e.target.value,
                  })
                }
              >
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input
                className="pw-input"
                type="date"
                value={transactionForm.date}
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    date: e.target.value,
                  })
                }
                required
              />
            </label>

            <button className="pw-button" type="submit">
              + Add transaction
            </button>
          </div>
        </form>

        <div className="pw-card">
          <div className="table-heading">
            <h3>Transaction history</h3>

            <input
              className="pw-input search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
            />
          </div>

          <div className="table-scroll">
            <table className="pw-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>{item.date}</td>
                    <td>{item.type}</td>
                    <td
                      className={
                        item.type === "Income"
                          ? "income-text"
                          : "expense-text"
                      }
                    >
                      {item.type === "Income" ? "+" : "−"}
                      {money(item.amount)}
                    </td>
                    <td>
                      <button
                        className="pw-button danger-button"
                        type="button"
                        onClick={() => deleteTransaction(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filteredTransactions.length && (
              <p className="pw-muted">No transactions found.</p>
            )}
          </div>
        </div>
      </>
    );
  }

  // BUDGETS PAGE

  function budgetsPage() {
    return (
      <>
        <div className="page-heading">
          <h1>Budgets</h1>
          <p>Set spending limits and track category expenses.</p>
        </div>

        <form className="pw-card" onSubmit={addBudget}>
          <h3 className="section-title">Create or update a budget</h3>

          <div className="form-grid">
            <label>
              Category
              <select
                className="pw-input"
                value={budgetForm.category}
                onChange={(e) =>
                  setBudgetForm({
                    ...budgetForm,
                    category: e.target.value,
                  })
                }
              >
                {CATEGORIES.filter(
                  (category) =>
                    category !== "Salary" && category !== "Savings"
                ).map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              Budget limit (₹)
              <input
                className="pw-input"
                type="number"
                min="1"
                value={budgetForm.limit}
                onChange={(e) =>
                  setBudgetForm({
                    ...budgetForm,
                    limit: e.target.value,
                  })
                }
                required
              />
            </label>

            <button className="pw-button" type="submit">
              Save budget
            </button>
          </div>
        </form>

        <div className="goals-grid">
          {budgets.map((budget) => {
            const spent = transactions
              .filter(
                (item) =>
                  item.type === "Expense" &&
                  item.category === budget.category
              )
              .reduce((sum, item) => sum + Number(item.amount), 0);

            const percentage = budget.limit
              ? Math.min(100, (spent / budget.limit) * 100)
              : 0;

            return (
              <div className="pw-card" key={budget.id}>
                <div className="goal-heading">
                  <h3>{budget.category}</h3>
                  <button
                    className="pw-button danger-button"
                    onClick={() =>
                      setBudgets((current) =>
                        current.filter((item) => item.id !== budget.id)
                      )
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>

                <ProgressBar value={percentage} />

                <p className="pw-muted">
                  Spent {money(spent)} of {money(budget.limit)}
                </p>

                <strong
                  className={
                    spent > budget.limit ? "expense-text" : "income-text"
                  }
                >
                  {spent > budget.limit
                    ? "Budget exceeded"
                    : `${money(budget.limit - spent)} remaining`}
                </strong>
              </div>
            );
          })}
        </div>

        {!budgets.length && (
          <div className="pw-card pw-muted">
            No budgets created yet.
          </div>
        )}
      </>
    );
  }

  // SAVINGS GOALS PAGE

  function savingsGoalsPage() {
    return (
      <>
        <div className="page-heading">
          <h1>Savings Goals</h1>
          <p>
            Set targets, contribute from your available savings, and
            track your progress.
          </p>
        </div>

        <div className="pw-grid">
          <StatCard
            title="Available Savings"
            amount={availableSavings}
            subtitle="Income minus recorded expenses"
            icon="♧"
            color="#08916c"
          />

          <StatCard
            title="Total Goal Targets"
            amount={totalGoalTarget}
            subtitle="Combined target amounts"
            icon="◎"
            color="#7c3aed"
          />

          <StatCard
            title="Saved Toward Goals"
            amount={totalGoalSaved}
            subtitle="Across all savings goals"
            icon="✓"
            color="#16a34a"
          />
        </div>

        <form className="pw-card" onSubmit={addGoal}>
          <h3 className="section-title">Create a savings goal</h3>

          <div className="form-grid">
            <label>
              Goal name
              <input
                className="pw-input"
                value={goalForm.name}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, name: e.target.value })
                }
                placeholder="e.g. New laptop"
                required
              />
            </label>

            <label>
              Target amount (₹)
              <input
                className="pw-input"
                type="number"
                min="1"
                value={goalForm.targetAmount}
                onChange={(e) =>
                  setGoalForm({
                    ...goalForm,
                    targetAmount: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Already saved (₹)
              <input
                className="pw-input"
                type="number"
                min="0"
                value={goalForm.savedAmount}
                onChange={(e) =>
                  setGoalForm({
                    ...goalForm,
                    savedAmount: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Target date (optional)
              <input
                className="pw-input"
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

            <button className="pw-button" type="submit">
              + Create goal
            </button>
          </div>
        </form>

        <form className="pw-card contribution-card" onSubmit={addSavings}>
          <h3 className="section-title">Add money to a goal</h3>

          <p className="pw-muted">
            Available savings:{" "}
            <strong className="purple-text">
              {money(availableSavings)}
            </strong>
            . Contributions are recorded as expenses to avoid counting
            the same money twice.
          </p>

          <div className="form-grid">
            <label>
              Choose goal
              <select
                className="pw-input"
                value={savingForm.goalId}
                onChange={(e) =>
                  setSavingForm({
                    ...savingForm,
                    goalId: e.target.value,
                  })
                }
                required
              >
                <option value="">Select a goal</option>

                {goals
                  .filter((goal) => goal.savedAmount < goal.targetAmount)
                  .map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name} —{" "}
                      {money(goal.targetAmount - goal.savedAmount)} left
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Contribution (₹)
              <input
                className="pw-input"
                type="number"
                min="1"
                step="0.01"
                value={savingForm.amount}
                onChange={(e) =>
                  setSavingForm({
                    ...savingForm,
                    amount: e.target.value,
                  })
                }
                required
              />
            </label>

            <button className="pw-button" type="submit">
              Add to savings
            </button>
          </div>
        </form>

        <div className="goals-grid">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>

        {!goals.length && (
          <div className="pw-card pw-muted">
            Create your first savings goal above.
          </div>
        )}
      </>
    );
  }

  const navigation = [
    ["Dashboard", "⌂"],
    ["Transactions", "↕"],
    ["Budgets", "▤"],
    ["Savings Goals", "♧"],
  ];

  return (
    <div className="pennywise-app">
      <aside className="pw-sidebar">
        <div className="pw-brand">✦ PennyWise</div>

        <div className="sidebar-label">WORKSPACE</div>

        {navigation.map(([name, icon]) => (
          <button
            type="button"
            key={name}
            className={`pw-nav ${activePage === name ? "active" : ""}`}
            onClick={() => {
              setActivePage(name);
              setNotice("");
            }}
          >
            <span className="nav-icon">{icon}</span>
            {name}
          </button>
        ))}

        <div className="smart-tip">
          <strong>Smart tip 💡</strong>
          <p>
            Set realistic goals and contribute a small amount regularly.
          </p>
        </div>
        
<button
  type="button"
  className="pw-nav"
  onClick={handleLogout}
  style={{ marginTop: "16px" }}
>
  <span className="nav-icon">↪</span>
  Logout
</button>

      </aside>

      <main className="pw-main">
        <div className="breadcrumb">
          PennyWise / <strong>{activePage}</strong>
        </div>

        {notice && (
          <div className="pw-notice" role="status">
            {notice}
          </div>
        )}

        {activePage === "Dashboard" && dashboard()}
        {activePage === "Transactions" && transactionsPage()}
        {activePage === "Budgets" && budgetsPage()}
        {activePage === "Savings Goals" && savingsGoalsPage()}

        <footer className="pw-footer">
          PennyWise • Spend mindfully, save consistently.
        </footer>
      </main>
    </div>
  );
}
