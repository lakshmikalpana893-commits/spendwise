document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transactionForm');
  const typeInput = document.getElementById('transactionType');
  const categoryInput = document.getElementById('transactionCategory');
  const amountInput = document.getElementById('transactionAmount');
  const dateInput = document.getElementById('transactionDate');
  const descriptionInput = document.getElementById('transactionDescription');
  const paymentInput = document.getElementById('transactionPayment');
  const idInput = document.getElementById('transactionId');
  const submitButton = document.getElementById('transactionSubmit');
  const modalTitle = document.getElementById('transactionModalTitle');
  const tableBody = document.getElementById('transactionTableBody');
  const empty = document.getElementById('transactionEmpty');
  let pendingDeleteIds = [];

  const searchInput = document.getElementById('searchTransactions');
  const filterType = document.getElementById('filterType');
  const filterCategory = document.getElementById('filterCategory');
  const filterDate = document.getElementById('filterDate');
  const sortSelect = document.getElementById('sortTransactions');
  const customRange = document.getElementById('customRange');
  const customStart = document.getElementById('customStart');
  const customEnd = document.getElementById('customEnd');
  const rangeError = document.getElementById('rangeError');

  const populateCategories = (selected='') => {
    const categories = typeInput.value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    categoryInput.innerHTML = '<option value="">Select category</option>' + categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
    categoryInput.value = categories.includes(selected) ? selected : '';
  };

  const openTransactionModal = (type='expense', transaction=null) => {
    form.reset();
    clearErrors();
    idInput.value = transaction?.id || '';
    typeInput.value = transaction?.type || type;
    dateInput.value = transaction?.date || getTodayDateString();
    amountInput.value = transaction?.amount ?? '';
    descriptionInput.value = transaction?.description || '';
    paymentInput.value = transaction?.paymentMethod || '';
    populateCategories(transaction?.category || '');
    descriptionCount.textContent = descriptionInput.value.length;
    modalTitle.textContent = transaction ? 'Edit Transaction' : 'Add Transaction';
    submitButton.textContent = transaction ? 'Save Changes' : 'Add Transaction';
    openModal('transactionModal');
    amountInput.focus();
  };

  const clearErrors = () => form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  const showError = (field, message) => { const el = form.querySelector(`[data-error-for="${field}"]`); if (el) el.textContent = message; };
  const validate = () => {
    clearErrors();
    let valid = true;
    if (!(Number(amountInput.value) > 0)) { showError('transactionAmount','Amount must be greater than 0.'); valid = false; }
    if (!categoryInput.value) { showError('transactionCategory','Select a category.'); valid = false; }
    if (!dateInput.value) { showError('transactionDate','Date is required.'); valid = false; }
    if (descriptionInput.value.length > 250) { descriptionInput.value = descriptionInput.value.slice(0,250); valid = false; }
    return valid;
  };

  typeInput.addEventListener('change', () => populateCategories(categoryInput.value));
  document.getElementById('addIncomeBtn').addEventListener('click', () => openTransactionModal('income'));
  document.getElementById('addExpenseBtn').addEventListener('click', () => openTransactionModal('expense'));
  descriptionInput.addEventListener('input', () => { document.getElementById('descriptionCount').textContent = descriptionInput.value.length; });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) return;
    const transactions = getTransactions();
    const existingId = idInput.value;
    const now = new Date().toISOString();
    const record = { id: existingId || generateId(), type: typeInput.value, amount: Number(Number(amountInput.value).toFixed(2)), category: categoryInput.value, date: dateInput.value, description: descriptionInput.value.trim(), paymentMethod: paymentInput.value, createdAt: existingId ? (transactions.find(t=>t.id===existingId)?.createdAt || now) : now, updatedAt: now };
    if (existingId) {
      const index = transactions.findIndex(t=>t.id===existingId);
      if (index >= 0) transactions[index] = record; else transactions.push(record);
      showToast('Transaction updated.', 'success');
    } else { transactions.push(record); showToast('Transaction added.', 'success'); }
    saveTransactions(transactions);
    closeModal('transactionModal');
    render();
  });

  const getFilteredTransactions = () => {
    const source = [...getTransactions()];
    const search = searchInput.value.trim().toLowerCase();
    let rows = source.filter(t => {
      const haystack = `${t.category} ${t.description || ''} ${t.paymentMethod || ''} ${t.type}`.toLowerCase();
      if (search && !haystack.includes(search)) return false;
      if (filterType.value !== 'all' && t.type !== filterType.value) return false;
      if (filterCategory.value !== 'all' && t.category !== filterCategory.value) return false;
      return true;
    });
    const today = getTodayDateString();
    if (filterDate.value === 'today') rows = rows.filter(t => t.date === today);
    if (filterDate.value === 'week') {
      const now = new Date(); const day = now.getDay(); const sunday = new Date(now); sunday.setDate(now.getDate()-day); const start = sunday.toISOString().slice(0,10);
      rows = rows.filter(t => t.date >= start && t.date <= today);
    }
    if (filterDate.value === 'month') rows = rows.filter(t => String(t.date).startsWith(getCurrentMonthString()));
    if (filterDate.value === 'prev-month') { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-1); const month = d.toISOString().slice(0,7); rows = rows.filter(t=>String(t.date).startsWith(month)); }
    if (filterDate.value === 'custom') {
      rangeError.textContent = '';
      if (customStart.value && customEnd.value && customStart.value > customEnd.value) rangeError.textContent = 'Start date cannot be after end date.';
      else {
        if (customStart.value) rows = rows.filter(t => t.date >= customStart.value);
        if (customEnd.value) rows = rows.filter(t => t.date <= customEnd.value);
      }
    }
    switch (sortSelect.value) {
      case 'oldest': rows.sort((a,b)=>String(a.date).localeCompare(String(b.date))); break;
      case 'amount-desc': rows.sort((a,b)=>Number(b.amount)-Number(a.amount)); break;
      case 'amount-asc': rows.sort((a,b)=>Number(a.amount)-Number(b.amount)); break;
      case 'category-asc': rows.sort((a,b)=>String(a.category).localeCompare(String(b.category))); break;
      default: rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)) || String(b.createdAt).localeCompare(String(a.createdAt)));
    }
    return rows;
  };

  const renderFilterCategories = () => {
    const categories = [...new Set(getTransactions().map(t=>t.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const current = filterCategory.value;
    filterCategory.innerHTML = '<option value="all">All categories</option>' + categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    filterCategory.value = categories.includes(current) ? current : 'all';
  };

  const renderSummary = rows => {
    const income = calculateTotalIncome(rows), expenses = calculateTotalExpenses(rows), net = income-expenses;
    document.getElementById('transactionSummary').innerHTML = `<div><span>Matching transactions</span><strong>${rows.length}</strong></div><div><span>Matching income</span><strong class="positive">${formatCurrency(income)}</strong></div><div><span>Matching expense</span><strong class="negative">${formatCurrency(expenses)}</strong></div><div><span>Matching net</span><strong class="${net>=0?'positive':'negative'}">${formatCurrency(net)}</strong></div>`;
  };

  const render = () => {
    renderFilterCategories();
    const rows = getFilteredTransactions();
    renderSummary(rows);
    document.getElementById('selectAllTransactions').checked = false;
    tableBody.innerHTML = rows.map(t => `<tr><td><input type="checkbox" class="row-check" data-id="${escapeHtml(t.id)}" aria-label="Select transaction"></td><td><div class="transaction-cell"><span class="recent-icon ${t.type}"><i class="fa-solid ${t.type==='income'?'fa-arrow-down':'fa-arrow-up'}"></i></span><div><strong>${escapeHtml(t.description || t.category)}</strong><small>${formatDateTime(t.createdAt)}</small></div></div></td><td><span class="category-pill">${escapeHtml(t.category)}</span></td><td>${escapeHtml(t.paymentMethod || '—')}</td><td>${formatDate(t.date)}</td><td><strong class="amount-cell ${t.type}">${t.type==='income'?'+':'−'}${formatCurrency(t.amount)}</strong></td><td><div class="table-actions"><button class="icon-btn" data-edit="${escapeHtml(t.id)}" aria-label="Edit transaction"><i class="fa-solid fa-pen"></i></button><button class="icon-btn danger" data-delete="${escapeHtml(t.id)}" aria-label="Delete transaction"><i class="fa-solid fa-trash"></i></button></div></td></tr>`).join('');
    empty.classList.toggle('hidden', rows.length > 0);
    empty.innerHTML = getTransactions().length ? emptyState('No transactions found', 'Try adjusting your filters or search terms.') : emptyState('No transactions yet', 'Start by adding your first income or expense.');
  };

  const confirmDelete = (ids) => {
    pendingDeleteIds = ids;
    document.getElementById('confirmTitle').textContent = ids.length > 1 ? 'Delete selected transactions?' : 'Delete transaction?';
    document.getElementById('confirmMessage').textContent = ids.length > 1 ? `Are you sure you want to delete ${ids.length} selected transactions?` : 'Are you sure you want to delete this transaction?';
    document.getElementById('confirmAction').textContent = 'Delete';
    openModal('confirmModal');
  };

  document.getElementById('confirmAction').addEventListener('click', () => {
    if (!pendingDeleteIds.length) return;
    saveTransactions(getTransactions().filter(t => !pendingDeleteIds.includes(t.id)));
    showToast(`${pendingDeleteIds.length} transaction${pendingDeleteIds.length===1?'':'s'} deleted.`, 'success');
    pendingDeleteIds = [];
    closeModal('confirmModal');
    render();
  });

  tableBody.addEventListener('click', event => {
    const edit = event.target.closest('[data-edit]');
    const del = event.target.closest('[data-delete]');
    if (edit) { const t = getTransactions().find(row => row.id === edit.dataset.edit); if (t) openTransactionModal(t.type, t); }
    if (del) confirmDelete([del.dataset.delete]);
  });

  document.getElementById('selectAllTransactions').addEventListener('change', event => document.querySelectorAll('.row-check').forEach(check => { check.checked = event.target.checked; }));
  document.getElementById('clearFiltersBtn').addEventListener('click', () => { searchInput.value=''; filterType.value='all'; filterCategory.value='all'; filterDate.value='all'; sortSelect.value='newest'; customStart.value=''; customEnd.value=''; customRange.classList.remove('visible'); rangeError.textContent=''; render(); });
  filterDate.addEventListener('change', () => customRange.classList.toggle('visible', filterDate.value === 'custom'));
  [searchInput,filterType,filterCategory,filterDate,sortSelect,customStart,customEnd].forEach(element=>element.addEventListener('input',render));
  document.getElementById('transactionTableBody').addEventListener('dblclick', () => {});

  // Optional bulk delete button appears when rows are selected.
  const addBulkControl = () => {
    const panel = document.querySelector('.filters-panel');
    if (document.getElementById('bulkDeleteBtn')) return;
    const button = document.createElement('button'); button.id='bulkDeleteBtn'; button.className='btn btn-danger'; button.type='button'; button.innerHTML='<i class="fa-solid fa-trash"></i> Delete Selected';
    button.style.display='none';
    button.addEventListener('click',()=>{ const ids=[...document.querySelectorAll('.row-check:checked')].map(c=>c.dataset.id); if(ids.length) confirmDelete(ids); });
    panel.querySelector('.filter-grid').appendChild(button);
  };
  addBulkControl();
  document.addEventListener('change',event=>{ if(event.target.classList.contains('row-check')) { const btn=document.getElementById('bulkDeleteBtn'); if(btn) btn.style.display=document.querySelectorAll('.row-check:checked').length ? 'inline-flex':'none'; } if(event.target.id==='selectAllTransactions'){ const btn=document.getElementById('bulkDeleteBtn'); if(btn) btn.style.display=document.querySelectorAll('.row-check:checked').length ? 'inline-flex':'none'; } });

  const params = new URLSearchParams(window.location.search);
  const open = params.get('open');
  if (open === 'income' || open === 'expense') setTimeout(()=>openTransactionModal(open),100);
  render();
});
