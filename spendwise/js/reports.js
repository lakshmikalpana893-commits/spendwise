document.addEventListener('DOMContentLoaded', () => {
  const monthInput = document.getElementById('reportMonth');
  monthInput.value = getCurrentMonthString();

  const render = () => {
    const month = monthInput.value || getCurrentMonthString();
    const transactions = getTransactions().filter(t => String(t.date || '').startsWith(month));
    const income = calculateTotalIncome(transactions);
    const expenses = calculateTotalExpenses(transactions);
    const savings = income - expenses;
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categories = expenseTransactions.reduce((acc,t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0); return acc; }, {});
    const categoryRows = Object.entries(categories).sort((a,b)=>b[1]-a[1]);
    const largestCategory = categoryRows[0]?.[0] || '—';
    const largestExpense = expenseTransactions.sort((a,b)=>Number(b.amount)-Number(a.amount))[0];

    document.getElementById('reportMetrics').innerHTML = [
      metricCard('Monthly Income', formatCurrency(income), 'fa-arrow-trend-up', 'positive', getMonthName(month)),
      metricCard('Monthly Expenses', formatCurrency(expenses), 'fa-arrow-trend-down', 'negative', getMonthName(month)),
      metricCard('Net Savings', formatCurrency(savings), 'fa-piggy-bank', savings >= 0 ? 'positive':'negative', income ? 'Income − expenses' : 'No income recorded'),
      metricCard('Transactions', String(transactions.length), 'fa-receipt', 'neutral', 'Selected month'),
      metricCard('Largest Category', escapeHtml(largestCategory), 'fa-chart-pie', 'neutral', 'By expense total')
    ].join('');

    renderCompare(income, expenses);
    renderCategories(categoryRows, expenses);
    renderSpendingChart(categoryRows);
    renderDailyChart(transactions, month);
    renderLargeExpenses(expenseTransactions);
    renderInsight(income, expenses, categoryRows);
  };

  const metricCard = (title,value,icon,tone,meta) => `<article class="metric-card"><div class="metric-icon ${tone}"><i class="fa-solid ${icon}"></i></div><div><span class="metric-title">${title}</span><strong class="metric-value ${tone}">${value}</strong><small>${meta}</small></div></article>`;

  const renderCompare = (income, expenses) => {
    const max = Math.max(income, expenses, 1);
    document.getElementById('incomeExpenseBars').innerHTML = `<div class="compare-row"><div class="compare-label"><span>Income</span><strong>${formatCurrency(income)}</strong></div><div class="compare-track"><span class="income-bar" style="width:${income/max*100}%"></span></div></div><div class="compare-row"><div class="compare-label"><span>Expenses</span><strong>${formatCurrency(expenses)}</strong></div><div class="compare-track"><span class="expense-bar" style="width:${expenses/max*100}%"></span></div></div>`;
  };

  const renderCategories = (rows, total) => {
    const container = document.getElementById('reportCategories');
    if (!rows.length) { container.innerHTML = emptyState('No category data', 'No expenses were recorded for the selected month.', 'transactions.html', 'Add Expense'); return; }
    container.innerHTML = `<div class="category-list detailed">${rows.map(([category, amount]) => { const percent = total ? amount/total*100 : 0; const count = getTransactions().filter(t => t.type === 'expense' && String(t.date).startsWith(monthInput.value) && t.category === category).length; return `<div class="category-row"><div class="category-row-top"><span>${escapeHtml(category)} <small>${count} transaction${count === 1 ? '' : 's'}</small></span><strong>${formatCurrency(amount)} <small>${formatNumber(percent)}%</small></strong></div><div class="progress"><span style="width:${percent}%"></span></div></div>`; }).join('')}</div>`;
  };

  const renderSpendingChart = (rows) => {
    const container = document.getElementById('spendingChart');
    if (!rows.length) { container.innerHTML = '<div class="empty-mini"><div class="empty-icon"><i class="fa-solid fa-chart-column"></i></div><h3>No chart data</h3><p>Add expenses for this month to build the spending chart.</p></div>'; return; }
    const max = rows[0][1] || 1;
    container.innerHTML = `<div class="bar-chart">${rows.slice(0,8).map(([category,amount]) => `<div class="bar-chart-item"><div class="bar-value">${formatCurrency(amount)}</div><div class="bar-visual"><span style="height:${Math.max(8,amount/max*100)}%"></span></div><div class="bar-label">${escapeHtml(category)}</div></div>`).join('')}</div>`;
  };

  const renderDailyChart = (transactions, month) => {
    const container = document.getElementById('dailyChart');
    const daysInMonth = new Date(Number(month.slice(0,4)), Number(month.slice(5,7)), 0).getDate();
    const daily = Array.from({length: daysInMonth}, (_,i) => ({ day:i+1, value:0 }));
    transactions.filter(t=>t.type==='expense').forEach(t => { const day = Number(String(t.date).slice(8,10)); if (daily[day-1]) daily[day-1].value += Number(t.amount || 0); });
    const max = Math.max(...daily.map(d=>d.value),1);
    const nonZero = daily.filter(d=>d.value>0);
    if (!nonZero.length) { container.innerHTML = '<div class="empty-mini"><div class="empty-icon"><i class="fa-solid fa-calendar-days"></i></div><h3>No daily expense data</h3><p>No expenses were recorded for the selected month.</p></div>'; return; }
    container.innerHTML = `<div class="daily-bars">${daily.map(d=>`<div class="daily-item"><span class="daily-value">${d.value ? formatCurrency(d.value) : ''}</span><div class="daily-track"><span style="height:${d.value ? Math.max(4,d.value/max*100) : 0}%"></span></div><small>${d.day}</small></div>`).join('')}</div>`;
  };

  const renderLargeExpenses = (transactions) => {
    const container = document.getElementById('largeExpenses');
    const rows = [...transactions].sort((a,b)=>Number(b.amount)-Number(a.amount)).slice(0,5);
    if (!rows.length) { container.innerHTML = emptyState('No large expenses', 'No expense transactions were recorded for the selected month.'); return; }
    container.innerHTML = `<div class="recent-list">${rows.map(t=>`<div class="recent-row"><span class="recent-icon expense"><i class="fa-solid fa-arrow-up"></i></span><div class="recent-main"><strong>${escapeHtml(t.description || t.category)}</strong><span>${escapeHtml(t.category)} · ${formatDate(t.date)}</span></div><strong class="recent-amount expense">−${formatCurrency(t.amount)}</strong></div>`).join('')}</div>`;
  };

  const renderInsight = (income, expenses, rows) => {
    const insight = document.getElementById('financialInsight');
    if (!income && !expenses) { insight.textContent = 'No transactions recorded for this month.'; return; }
    if (expenses > income) { insight.textContent = 'Your expenses are higher than your income this month. Consider reviewing non-essential spending.'; return; }
    if (income > expenses) { insight.textContent = 'You saved money this month. Consider setting aside part of your savings for future goals.'; return; }
    const top = rows[0];
    if (top && expenses && top[1] > expenses * 0.4) { insight.textContent = `${top[0]} accounts for more than 40% of your expenses this month.`; return; }
    insight.textContent = 'Your income and expenses are currently balanced. Keep tracking consistently.';
  };

  monthInput.addEventListener('change', render);
  render();
});
