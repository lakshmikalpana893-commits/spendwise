document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budgetForm');
  const amountInput = document.getElementById('budgetAmount');
  const monthInput = document.getElementById('budgetMonth');
  const removeButton = document.getElementById('removeBudgetBtn');

  monthInput.value = getCurrentMonthString();

  const render = () => {
    const budget = getBudget();
    const selectedMonth = monthInput.value || getCurrentMonthString();
    const transactions = getTransactions();
    const monthExpenses = calculateTotalExpenses(transactions.filter(t => String(t.date).startsWith(selectedMonth)));
    const budgetApplies = budget && budget.month === selectedMonth;
    const budgetAmount = budgetApplies ? Number(budget.amount) || 0 : 0;
    const percent = budgetAmount ? (monthExpenses / budgetAmount) * 100 : 0;
    const shown = Math.min(percent,100);
    let status = 'No budget', statusClass = 'muted';
    if (budgetAmount) {
      if (percent > 100) { status = 'Budget Exceeded'; statusClass = 'danger'; }
      else if (percent >= 80) { status = 'Near Budget Limit'; statusClass = 'warning'; }
      else if (percent >= 60) { status = 'Watch Your Spending'; statusClass = 'watch'; }
      else { status = 'Healthy'; statusClass = 'healthy'; }
    }
    document.getElementById('budgetMonthTitle').textContent = getMonthName(selectedMonth);
    document.getElementById('budgetStatusBadge').className = `badge badge-${statusClass}`;
    document.getElementById('budgetStatusBadge').textContent = status;
    document.getElementById('budgetOverview').innerHTML = budgetAmount ? `<div class="budget-large"><div><span>Budget</span><strong>${formatCurrency(budgetAmount)}</strong></div><div><span>Expenses</span><strong class="negative">${formatCurrency(monthExpenses)}</strong></div><div><span>${percent > 100 ? 'Overspent' : 'Remaining'}</span><strong class="${percent > 100 ? 'negative' : 'positive'}">${formatCurrency(Math.abs(budgetAmount-monthExpenses))}</strong></div></div><div class="progress large"><span style="width:${shown}%"></span></div><div class="budget-foot"><span>${formatNumber(percent)}% utilized</span><span>${percent > 100 ? 'Review your recent spending.' : percent >= 80 ? 'You are close to the budget limit.' : 'Keep tracking consistently.'}</span></div>` : `<div class="empty-mini"><div class="empty-icon"><i class="fa-solid fa-bullseye"></i></div><h3>No active budget for ${escapeHtml(getMonthName(selectedMonth))}</h3><p>Enter a budget amount below to start tracking.</p></div>`;
    if (budgetApplies) amountInput.value = budgetAmount;
    else amountInput.value = '';
    renderCategories(transactions.filter(t => String(t.date).startsWith(selectedMonth)), monthExpenses);
    renderTip(transactions.filter(t => String(t.date).startsWith(selectedMonth)), monthExpenses, budgetAmount);
  };

  const renderCategories = (transactions, totalExpenses) => {
    const container = document.getElementById('budgetCategories');
    const totals = transactions.filter(t => t.type === 'expense').reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0); return acc; }, {});
    const rows = Object.entries(totals).sort((a,b) => b[1]-a[1]);
    if (!rows.length) { container.innerHTML = '<div class="empty-mini"><div class="empty-icon"><i class="fa-solid fa-chart-column"></i></div><h3>No expense data</h3><p>Add expenses to receive personalized spending insights.</p></div>'; return; }
    container.innerHTML = `<div class="category-list detailed">${rows.map(([category, amount]) => { const percent = totalExpenses ? amount/totalExpenses*100 : 0; return `<div class="category-row"><div class="category-row-top"><span>${escapeHtml(category)}</span><strong>${formatCurrency(amount)} <small>${formatNumber(percent)}%</small></strong></div><div class="progress"><span style="width:${percent}%"></span></div></div>`; }).join('')}</div>`;
  };

  const renderTip = (transactions, totalExpenses, budgetAmount) => {
    const box = document.getElementById('budgetTip');
    const expenseTotals = transactions.filter(t => t.type === 'expense').reduce((acc,t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0); return acc; }, {});
    const largest = Object.entries(expenseTotals).sort((a,b)=>b[1]-a[1])[0];
    let message = 'Add expenses to receive personalized spending insights.';
    if (largest?.[0] === 'Food') message = 'Food is your largest expense category. Consider setting a weekly food budget.';
    else if (largest?.[0] === 'Travel') message = 'Travel costs are highest this month. Plan trips and compare transport options.';
    else if (largest?.[0] === 'Shopping') message = 'Shopping is your largest category. Review wants versus needs before new purchases.';
    else if (totalExpenses && budgetAmount && totalExpenses > budgetAmount) message = 'Review your recent non-essential expenses and adjust your remaining spending.';
    else if (budgetAmount && totalExpenses <= budgetAmount) message = 'Good job staying within your monthly budget.';
    box.innerHTML = `<i class="fa-solid fa-lightbulb"></i><div><strong>Suggested saving tip</strong><p>${escapeHtml(message)}</p></div>`;
  };

  const clearErrors = () => form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  const validate = () => {
    clearErrors();
    let valid = true;
    if (!(Number(amountInput.value) > 0)) { form.querySelector('[data-error-for="budgetAmount"]').textContent = 'Enter a budget amount greater than 0.'; valid = false; }
    if (!monthInput.value) { form.querySelector('[data-error-for="budgetMonth"]').textContent = 'Select a month.'; valid = false; }
    return valid;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) return;
    const existing = getBudget();
    const now = new Date().toISOString();
    saveBudget({ month: monthInput.value, amount: Number(Number(amountInput.value).toFixed(2)), createdAt: existing?.createdAt || now, updatedAt: now });
    showToast('Monthly budget saved.', 'success');
    render();
  });

  removeButton.addEventListener('click', () => {
    if (!getBudget()) { showToast('No budget is currently set.', 'info'); return; }
    const confirmed = window.confirm('Remove the current SpendWise budget?');
    if (!confirmed) return;
    saveBudget(null);
    showToast('Budget removed.', 'success');
    render();
  });

  monthInput.addEventListener('change', render);
  render();
});
