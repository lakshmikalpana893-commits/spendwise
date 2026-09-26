const STORAGE_KEYS = Object.freeze({
  transactions: 'spendwise_transactions',
  budget: 'spendwise_budget',
  theme: 'spendwise_theme'
});

const EXPENSE_CATEGORIES = Object.freeze(['Food','Travel','Books','Hostel / Rent','Shopping','Entertainment','Health','Mobile / Internet','Education','Bills','Other']);
const INCOME_CATEGORIES = Object.freeze(['Pocket Money','Scholarship','Freelance','Part-Time Work','Gift','Refund','Other']);
const PAYMENT_METHODS = Object.freeze(['Cash','UPI','Debit Card','Credit Card','Bank Transfer','Other']);

const getTransactions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.transactions);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

const saveTransactions = (transactions) => localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));

const getBudget = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.budget);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  } catch (error) {
    return null;
  }
};

const saveBudget = (budget) => {
  if (budget === null) localStorage.removeItem(STORAGE_KEYS.budget);
  else localStorage.setItem(STORAGE_KEYS.budget, JSON.stringify(budget));
};

const getTheme = () => localStorage.getItem(STORAGE_KEYS.theme) || 'light';
const saveTheme = (theme) => localStorage.setItem(STORAGE_KEYS.theme, theme);

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const getTodayDateString = () => new Date().toISOString().slice(0, 10);
const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(amount) || 0);
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};
const getCurrentMonthString = () => new Date().toISOString().slice(0, 7);
const getMonthName = (monthString) => {
  const date = new Date(`${monthString}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? monthString : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const showToast = (message, type = 'info') => {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${escapeHtml(message)}</span><button aria-label="Dismiss"><i class="fa-solid fa-xmark"></i></button>`;
  const close = () => toast.remove();
  toast.querySelector('button').addEventListener('click', close);
  container.appendChild(toast);
  window.setTimeout(close, 4200);
};

const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
};
const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal-backdrop.open')) document.body.classList.remove('modal-open');
};

const calculateTotalIncome = (transactions) => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
const calculateTotalExpenses = (transactions) => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
const calculateBalance = (transactions) => calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
const getCurrentMonthTransactions = (transactions) => transactions.filter(t => String(t.date || '').startsWith(getCurrentMonthString()));
const getCurrentMonthExpenses = (transactions) => calculateTotalExpenses(getCurrentMonthTransactions(transactions));
const getCurrentMonthIncome = (transactions) => calculateTotalIncome(getCurrentMonthTransactions(transactions));

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const formatNumber = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value) || 0);

const setTheme = (theme, announce = false) => {
  const normalized = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = normalized;
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.classList.toggle('selected', button.dataset.themeChoice === normalized));
  document.querySelectorAll('.theme-toggle').forEach(button => {
    button.innerHTML = normalized === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    button.setAttribute('aria-label', normalized === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
  saveTheme(normalized);
  if (announce) showToast(`${normalized === 'dark' ? 'Dark' : 'Light'} mode enabled.`, 'success');
};

const setupNavigation = () => {
  const current = document.querySelector('.main-content')?.dataset.page;
  document.querySelectorAll('.sidebar-nav a').forEach(link => link.classList.toggle('active', link.dataset.nav === current));
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const openButton = document.getElementById('sidebarOpen');
  const closeButton = document.getElementById('sidebarClose');
  const closeSidebar = () => sidebar?.classList.remove('open');
  openButton?.addEventListener('click', () => sidebar?.classList.add('open'));
  closeButton?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);
  document.querySelectorAll('.sidebar-nav a').forEach(link => link.addEventListener('click', closeSidebar));

  document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark', true)));
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.themeChoice, true)));
  setTheme(getTheme());
};

const setupModalDelegation = () => {
  document.addEventListener('click', (event) => {
    const closeTarget = event.target.closest('[data-close-modal]');
    if (closeTarget) closeModal(closeTarget.dataset.closeModal);
    if (event.target.classList.contains('modal-backdrop')) closeModal(event.target.id);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.querySelectorAll('.modal-backdrop.open').forEach(modal => closeModal(modal.id));
  });
};

const updateCurrentYear = () => {
  const year = document.getElementById('currentYear');
  if (year) year.textContent = `© ${new Date().getFullYear()} SpendWise`;
};

const emptyState = (title, text, buttonHref = 'transactions.html', buttonText = 'Add Transaction') => `<div class="empty-state-content"><div class="empty-icon"><i class="fa-regular fa-folder-open"></i></div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p><a class="btn btn-primary btn-small" href="${buttonHref}"><i class="fa-solid fa-plus"></i> ${escapeHtml(buttonText)}</a></div>`;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModalDelegation();
  updateCurrentYear();
});
