document.addEventListener('DOMContentLoaded', () => {
  const exportButton = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');
  const resetButton = document.getElementById('resetDataBtn');
  const importFileName = document.getElementById('importFileName');
  let pendingReset = false;

  exportButton.addEventListener('click', () => {
    const backup = { appName:'SpendWise', version:'1.0', transactions:getTransactions(), budget:getBudget(), theme:getTheme(), exportedAt:new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `spendwise-backup-${getTodayDateString()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast('SpendWise backup exported.', 'success');
  });

  const validateBackup = data => {
    if (!data || typeof data !== 'object') return 'Backup must contain a JSON object.';
    if (!Array.isArray(data.transactions)) return 'The transactions field must be an array.';
    if (!(data.budget === null || typeof data.budget === 'object' && !Array.isArray(data.budget))) return 'The budget field must be an object or null.';
    if (data.theme !== undefined && !['light','dark'].includes(data.theme)) return 'The theme must be light or dark.';
    for (const [index,t] of data.transactions.entries()) {
      if (!t.id || !['income','expense'].includes(t.type) || !(Number(t.amount)>0) || !t.category || !t.date) return `Invalid transaction data at item ${index+1}.`;
    }
    return null;
  };

  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    importFileName.textContent = file ? file.name : '';
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      let data;
      try { data = JSON.parse(reader.result); } catch(error) { showToast('The selected file is not valid JSON.', 'error'); importFile.value=''; return; }
      const validation = validateBackup(data);
      if (validation) { showToast(validation, 'error'); importFile.value=''; return; }
      const confirmed = window.confirm('Replace current SpendWise data with this backup?');
      if (!confirmed) { importFile.value=''; return; }
      saveTransactions(data.transactions);
      saveBudget(data.budget ?? null);
      if (data.theme) saveTheme(data.theme);
      showToast('Backup imported successfully. Reloading SpendWise...', 'success');
      setTimeout(()=>window.location.reload(),700);
    });
    reader.addEventListener('error', () => showToast('Could not read the selected backup file.', 'error'));
    reader.readAsText(file);
  });

  resetButton.addEventListener('click', () => {
    pendingReset = true;
    document.getElementById('confirmTitle').textContent = 'Reset all SpendWise data?';
    document.getElementById('confirmMessage').textContent = 'This will permanently delete all transactions, budget information, and settings saved by SpendWise in this browser.';
    document.getElementById('confirmAction').textContent = 'Delete All Data';
    openModal('confirmModal');
  });

  const confirmModal = document.getElementById('confirmAction');
  confirmModal.addEventListener('click', () => {
    if (!pendingReset) return;
    localStorage.removeItem(STORAGE_KEYS.transactions);
    localStorage.removeItem(STORAGE_KEYS.budget);
    localStorage.removeItem(STORAGE_KEYS.theme);
    pendingReset = false;
    closeModal('confirmModal');
    showToast('All SpendWise data has been deleted.', 'success');
    setTimeout(()=>window.location.href='index.html',700);
  });
});
