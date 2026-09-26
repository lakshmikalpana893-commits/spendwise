document.addEventListener('DOMContentLoaded', () => {
  const renderDashboard = () => {
    const transactions = getTransactions();
    const budget = getBudget();
    const currentMonth = getCurrentMonthString();
    const monthTransactions = getCurrentMonthTransactions(transactions);
    const income = calculateTotalIncome(transactions);
    const expenses = calculateTotalExpenses(transactions);
    const balance = income - expenses;
    const monthExpenses = calculateTotalExpenses(monthTransactions);
    const monthIncome = calculateTotalIncome(monthTransactions);
    const budgetAmount = budget && budget.month === currentMonth ? Number(budget.amount) || 0 : 0;
    const remaining = budgetAmount - monthExpenses;

    document.getElementById('greetingLabel').textContent = getGreeting();
    document.getElementById('currentMonthLabel').textContent = getMonthName(currentMonth);

    document.getElementById('metricGrid').innerHTML = [
      metricCard('Total Balance', formatCurrency(balance), 'fa-wallet', balance >= 0 ? 'positive' : 'negative', 'All recorded time'),
      metricCard('Total Income', formatCurrency(income), 'fa-arrow-trend-up', 'positive', 'All recorded time'),
      metricCard('Total Expenses', formatCurrency(expenses), 'fa-arrow-trend-down', 'negative', 'All recorded time'),
      metricCard('Monthly Budget', budgetAmount ? formatCurrency(budgetAmount) : 'No budget set', 'fa-bullseye', budgetAmount ? 'neutral' : 'muted', getMonthName(currentMonth)),
      metricCard('Budget Remaining', budgetAmount ? formatCurrency(remaining) : 'No budget set', 'fa-gauge-high', budgetAmount && remaining < 0 ? 'negative' : budgetAmount ? 'positive' : 'muted', budgetAmount ? getMonthName(currentMonth) : 'Set a monthly budget')
    ].join('');

    renderRecent(monthTransactions.length ? monthTransactions : transactions);
    renderBudgetStatus(budget, budgetAmount, monthExpenses, remaining, currentMonth);
    renderCategories(monthTransactions);

    const tip = document.getElementById('smartTip');
    if (!transactions.length) tip.textContent = 'Start by adding your first income or expense.';
    else if (expenses === 0) tip.textContent = 'You have not recorded any expenses yet.';
    else if (!budgetAmount) tip.textContent = 'Set a monthly budget to better control your spending.';
    else if (remaining < 0) tip.textContent = 'Your spending has crossed the monthly budget. Review non-essential expenses.';
    else if (monthExpenses > budgetAmount * 0.8) tip.textContent = 'You have used more than 80% of your monthly budget. Spend carefully.';
    else tip.textContent = 'You are currently within your planned budget. Keep tracking consistently.';

    document.querySelectorAll('.quick-action[data-action]').forEach(link => link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = `transactions.html?open=${link.dataset.action}`;
      window.location.href = target;
    }));
  };

  const metricCard = (title, value, icon, tone, meta) => `<article class="metric-card"><div class="metric-icon ${tone}"><i class="fa-solid ${icon}"></i></div><div><span class="metric-title">${title}</span><strong class="metric-value ${tone}">${value}</strong><small>${meta}</small></div></article>`;

  const renderRecent = (transactions) => {
    const container = document.getElementById('recentTransactions');
    const recent = [...transactions].sort((a,b) => String(b.date).localeCompare(String(a.date)) || String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,5);
    if (!recent.length) { container.innerHTML = emptyState('No transactions yet', 'Add an income or expense to see your activity here.'); return; }
    container.innerHTML = `<div class="recent-list">${recent.map(t => `<div class="recent-row"><span class="recent-icon ${t.type}"><i class="fa-solid ${t.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i></span><div class="recent-main"><strong>${escapeHtml(t.description || t.category)}</strong><span>${escapeHtml(t.category)} · ${formatDate(t.date)}</span></div><strong class="recent-amount ${t.type}">${t.type === 'income' ? '+' : '−'}${formatCurrency(t.amount)}</strong></div>`).join('')}</div>`;
  };

  const renderBudgetStatus = (budget, budgetAmount, monthExpenses, remaining, currentMonth) => {
    const container = document.getElementById('dashboardBudget');
    const action = document.getElementById('budgetAction');
    if (!budgetAmount) {
      container.innerHTML = `<div class="empty-mini"><div class="empty-icon"><i class="fa-solid fa-bullseye"></i></div><h3>No budget set</h3><p>Create a monthly budget to monitor spending.</p></div>`;
      action.textContent = 'Set Budget';
      return;
    }
    action.textContent = 'Edit Budget';
    const percent = budgetAmount ? (monthExpenses / budgetAmount) * 100 : 0;
    const shown = Math.min(percent, 100);
    let statusClass = 'healthy', status = 'Healthy';
    if (percent > 100) { statusClass = 'danger'; status = 'Budget Exceeded'; }
    else if (percent >= 80) { statusClass = 'warning'; status = 'Near Budget Limit'; }
    else if (percent >= 60) { statusClass = 'watch'; status = 'Watch Your Spending'; }
    container.innerHTML = `<div class="budget-status"><div class="budget-head"><div><strong>${formatCurrency(monthExpenses)}</strong><span> spent of ${formatCurrency(budgetAmount)}</span></div><span class="badge badge-${statusClass}">${status}</span></div><div class="progress large"><span style="width:${shown}%"></span></div><div class="budget-foot"><span>${formatNumber(percent)}% used</span><strong class="${remaining < 0 ? 'negative' : 'positive'}">${remaining < 0 ? `${formatCurrency(Math.abs(remaining))} overspent` : `${formatCurrency(remaining)} remaining`}</strong></div></div>`;
  };

  const renderCategories = (transactions) => {
    const container = document.getElementById('categorySummary');
    const totals = transactions.filter(t => t.type === 'expense').reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0); return acc; }, {});
    const rows = Object.entries(totals).sort((a,b) => b[1] - a[1]).slice(0,5);
    if (!rows.length) { container.innerHTML = '<div class="empty-mini"><div class="empty-icon"><i class="fa-solid fa-chart-pie"></i></div><h3>No expense data</h3><p>Add expenses to see category spending.</p></div>'; return; }
    const max = rows[0][1] || 1;
    container.innerHTML = `<div class="category-list">${rows.map(([category, amount]) => `<div class="category-row"><div class="category-row-top"><span>${escapeHtml(category)}</span><strong>${formatCurrency(amount)}</strong></div><div class="progress"><span style="width:${(amount/max)*100}%"></span></div></div>`).join('')}</div>`;
  };

  renderDashboard();
  window.addEventListener('storage', renderDashboard);
});
