/**
 * Student Task Manager - Frontend Controller
 * Cloud Computing Academic Project
 */

(function () {
  'use strict';

  // State
  let currentTasks = [];
  let deleteTargetId = null;
  let searchTimeout = null;

  // DOM Elements
  const el = {
    serverStatusPill: document.getElementById('server-status-pill'),
    statusLabel: document.getElementById('status-label'),
    statusIndicator: document.querySelector('.status-indicator'),
    envBadge: document.getElementById('env-badge'),

    // Metrics
    valTotal: document.getElementById('val-total'),
    valPending: document.getElementById('val-pending'),
    valProgress: document.getElementById('val-progress'),
    valCompleted: document.getElementById('val-completed'),

    // Controls
    inputSearch: document.getElementById('input-search'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    filterStatus: document.getElementById('filter-status'),
    filterPriority: document.getElementById('filter-priority'),
    filterSort: document.getElementById('filter-sort'),

    // Tasks list
    tasksGrid: document.getElementById('tasks-grid'),
    loadingState: document.getElementById('loading-state'),
    emptyState: document.getElementById('empty-state'),
    emptyTitle: document.getElementById('empty-title'),
    emptyDesc: document.getElementById('empty-desc'),
    taskCountBadge: document.getElementById('task-count-badge'),

    // Modals
    btnOpenCreateModal: document.getElementById('btn-open-create-modal'),
    btnEmptyAction: document.getElementById('btn-empty-action'),
    taskModal: document.getElementById('task-modal'),
    modalTitle: document.getElementById('modal-title'),
    taskForm: document.getElementById('task-form'),
    taskId: document.getElementById('task-id'),
    formTitle: document.getElementById('form-title'),
    formCourse: document.getElementById('form-course'),
    formDeadline: document.getElementById('form-deadline'),
    formPriority: document.getElementById('form-priority'),
    formStatus: document.getElementById('form-status'),
    formDesc: document.getElementById('form-desc'),
    btnCloseTaskModal: document.getElementById('btn-close-task-modal'),
    btnCancelTaskModal: document.getElementById('btn-cancel-task-modal'),
    btnSaveTask: document.getElementById('btn-save-task'),

    // Delete Modal
    deleteModal: document.getElementById('delete-modal'),
    deleteTaskTitle: document.getElementById('delete-task-title'),
    btnCloseDeleteModal: document.getElementById('btn-close-delete-modal'),
    btnCancelDelete: document.getElementById('btn-cancel-delete'),
    btnConfirmDelete: document.getElementById('btn-confirm-delete'),

    // Errors
    errTitle: document.getElementById('err-title'),
    errCourse: document.getElementById('err-course'),
    errDeadline: document.getElementById('err-deadline'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  // Helper: Escape HTML to avoid XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Check Backend & Database Health
  async function checkSystemHealth() {
    try {
      const res = await fetch('/health');
      const data = await res.json();
      if (res.ok && data.status === 'OK' && data.database?.status === 'healthy') {
        el.statusIndicator.className = 'status-indicator live';
        el.statusLabel.textContent = `Online (PostgreSQL Healthy - ${data.database.latency || 'OK'})`;
      } else {
        el.statusIndicator.className = 'status-indicator error';
        el.statusLabel.textContent = `Degraded (DB: ${data.database?.status || 'Error'})`;
      }
    } catch (err) {
      el.statusIndicator.className = 'status-indicator error';
      el.statusLabel.textContent = 'Server Offline';
    }
  }

  // Fetch Dashboard Metrics
  async function fetchSummary() {
    try {
      const res = await fetch('/api/tasks/summary');
      const data = await res.json();
      if (res.ok && data.success) {
        el.valTotal.textContent = data.data.total_tasks || 0;
        el.valPending.textContent = data.data.pending_tasks || 0;
        el.valProgress.textContent = data.data.in_progress_tasks || 0;
        el.valCompleted.textContent = data.data.completed_tasks || 0;
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  }

  // Fetch and Render Tasks
  async function fetchTasks() {
    el.loadingState.style.display = 'block';
    el.emptyState.style.display = 'none';
    el.tasksGrid.innerHTML = '';

    const search = el.inputSearch.value.trim();
    const status = el.filterStatus.value;
    const priority = el.filterPriority.value;
    const [sortBy, order] = el.filterSort.value.split('-');

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status !== 'all') params.append('status', status);
    if (priority !== 'all') params.append('priority', priority);
    if (sortBy) params.append('sortBy', sortBy);
    if (order) params.append('order', order);

    try {
      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();

      el.loadingState.style.display = 'none';

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengambil data tugas');
      }

      currentTasks = data.data;
      el.taskCountBadge.textContent = `${currentTasks.length} tugas ditemukan`;

      if (currentTasks.length === 0) {
        el.emptyState.style.display = 'block';
        if (search || status !== 'all' || priority !== 'all') {
          el.emptyTitle.textContent = 'Tidak Ada Tugas yang Cocok';
          el.emptyDesc.textContent = 'Coba ubah kata kunci pencarian atau sesuaikan filter status dan prioritas.';
        } else {
          el.emptyTitle.textContent = 'Belum Ada Tugas Kuliah';
          el.emptyDesc.textContent = 'Mulai kelola penugasan kuliah Anda dengan menekan tombol Tambah Tugas.';
        }
        return;
      }

      renderTaskCards(currentTasks);
    } catch (err) {
      el.loadingState.style.display = 'none';
      el.emptyState.style.display = 'block';
      el.emptyTitle.textContent = 'Koneksi Gagal';
      el.emptyDesc.textContent = `Terjadi kendala saat memuat data: ${err.message}`;
      showToast(err.message, 'error');
    }
  }

  // Render Cards Grid
  function renderTaskCards(tasks) {
    const today = new Date().toISOString().split('T')[0];

    el.tasksGrid.innerHTML = tasks.map(task => {
      const isOverdue = task.status !== 'completed' && task.deadline < today;
      const statusLabel = {
        pending: 'Menunggu',
        in_progress: 'Sedang Dikerjakan',
        completed: 'Selesai'
      }[task.status] || task.status;

      const priorityLabel = {
        high: 'Prioritas Tinggi',
        medium: 'Prioritas Sedang',
        low: 'Prioritas Rendah'
      }[task.priority] || task.priority;

      return `
        <article class="task-card priority-${task.priority}" data-id="${task.id}">
          <div class="card-top">
            <span class="course-tag">${escapeHtml(task.course)}</span>
            <div class="badges-row">
              <span class="badge badge-priority-${task.priority}">${priorityLabel}</span>
              <span class="badge badge-status-${task.status}">${statusLabel}</span>
            </div>
          </div>

          <div class="card-body">
            <h4 class="task-title">${escapeHtml(task.title)}</h4>
            <p class="task-desc">${escapeHtml(task.description || 'Tidak ada catatan tambahan.')}</p>
          </div>

          <div class="card-meta">
            <div class="meta-item ${isOverdue ? 'deadline-overdue' : ''}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Deadline: ${task.deadline} ${isOverdue ? '(Lewat!)' : ''}</span>
            </div>
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>ID: #${task.id}</span>
            </div>
          </div>

          <div class="card-actions">
            <select class="status-select-inline" data-id="${task.id}" title="Ubah Status Cepat">
              <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Menunggu</option>
              <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>Sedang Dikerjakan</option>
              <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Selesai</option>
            </select>

            <div class="btn-group-actions">
              <button class="btn-icon btn-edit-task" data-id="${task.id}" title="Edit Rincian Tugas">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon btn-icon-danger btn-delete-task" data-id="${task.id}" title="Hapus Tugas">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    attachCardEventListeners();
  }

  // Attach card event listeners
  function attachCardEventListeners() {
    // Quick status dropdown
    document.querySelectorAll('.status-select-inline').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        await updateQuickStatus(id, newStatus);
      });
    });

    // Edit button
    document.querySelectorAll('.btn-edit-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        openEditModal(id);
      });
    });

    // Delete button
    document.querySelectorAll('.btn-delete-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        openDeleteModal(id);
      });
    });
  }

  // Quick Status Update
  async function updateQuickStatus(id, status) {
    try {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah status');
      }
      showToast(data.message || 'Status tugas berhasil diperbarui', 'success');
      await fetchSummary();
      await fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
      fetchTasks();
    }
  }

  // Open Create Modal
  function openCreateModal() {
    el.taskForm.reset();
    el.taskId.value = '';
    el.modalTitle.textContent = 'Tambah Tugas Baru';
    clearFormErrors();

    // Default deadline: 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    el.formDeadline.value = d.toISOString().split('T')[0];

    el.taskModal.style.display = 'flex';
    el.formTitle.focus();
  }

  // Open Edit Modal
  function openEditModal(id) {
    const task = currentTasks.find(t => t.id === id);
    if (!task) return;

    clearFormErrors();
    el.taskId.value = task.id;
    el.modalTitle.textContent = `Edit Tugas #${task.id}`;
    el.formTitle.value = task.title;
    el.formCourse.value = task.course;
    el.formDeadline.value = task.deadline;
    el.formPriority.value = task.priority;
    el.formStatus.value = task.status;
    el.formDesc.value = task.description || '';

    el.taskModal.style.display = 'flex';
    el.formTitle.focus();
  }

  function closeTaskModal() {
    el.taskModal.style.display = 'none';
    clearFormErrors();
  }

  function clearFormErrors() {
    el.errTitle.textContent = '';
    el.errCourse.textContent = '';
    el.errDeadline.textContent = '';
  }

  // Submit Task Form (Create or Update)
  async function handleFormSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    const id = el.taskId.value;
    const isEditing = Boolean(id);

    const payload = {
      title: el.formTitle.value.trim(),
      course: el.formCourse.value.trim(),
      deadline: el.formDeadline.value,
      priority: el.formPriority.value,
      status: el.formStatus.value,
      description: el.formDesc.value.trim()
    };

    // Client-side validation
    let hasError = false;
    if (!payload.title || payload.title.length < 3) {
      el.errTitle.textContent = 'Judul minimal 3 karakter';
      hasError = true;
    }
    if (!payload.course || payload.course.length < 2) {
      el.errCourse.textContent = 'Mata kuliah wajib diisi';
      hasError = true;
    }
    if (!payload.deadline) {
      el.errDeadline.textContent = 'Deadline wajib ditentukan';
      hasError = true;
    }

    if (hasError) return;

    el.btnSaveTask.disabled = true;
    const spinner = el.btnSaveTask.querySelector('.btn-spinner');
    if (spinner) spinner.style.display = 'inline-block';

    try {
      const url = isEditing ? `/api/tasks/${id}` : '/api/tasks';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan data');
      }

      showToast(data.message || (isEditing ? 'Tugas berhasil diperbarui' : 'Tugas berhasil ditambahkan'), 'success');
      closeTaskModal();
      await fetchSummary();
      await fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      el.btnSaveTask.disabled = false;
      if (spinner) spinner.style.display = 'none';
    }
  }

  // Open Delete Confirmation Modal
  function openDeleteModal(id) {
    const task = currentTasks.find(t => t.id === id);
    if (!task) return;

    deleteTargetId = id;
    el.deleteTaskTitle.textContent = `"${task.title}" (${task.course})`;
    el.deleteModal.style.display = 'flex';
  }

  function closeDeleteModal() {
    deleteTargetId = null;
    el.deleteModal.style.display = 'none';
  }

  // Confirm Delete
  async function handleConfirmDelete() {
    if (!deleteTargetId) return;

    el.btnConfirmDelete.disabled = true;

    try {
      const res = await fetch(`/api/tasks/${deleteTargetId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghapus tugas');
      }

      showToast(data.message || 'Tugas berhasil dihapus', 'success');
      closeDeleteModal();
      await fetchSummary();
      await fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      el.btnConfirmDelete.disabled = false;
    }
  }

  // Event Listeners Initialization
  function initEventListeners() {
    // Open Modals
    el.btnOpenCreateModal.addEventListener('click', openCreateModal);
    el.btnEmptyAction.addEventListener('click', openCreateModal);

    // Close Modals
    el.btnCloseTaskModal.addEventListener('click', closeTaskModal);
    el.btnCancelTaskModal.addEventListener('click', closeTaskModal);
    el.btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
    el.btnCancelDelete.addEventListener('click', closeDeleteModal);

    // Click outside modal card to close
    window.addEventListener('click', (e) => {
      if (e.target === el.taskModal) closeTaskModal();
      if (e.target === el.deleteModal) closeDeleteModal();
    });

    // Form submit & Delete confirm
    el.taskForm.addEventListener('submit', handleFormSubmit);
    el.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

    // Search input debounce
    el.inputSearch.addEventListener('input', () => {
      const val = el.inputSearch.value.trim();
      el.btnClearSearch.style.display = val ? 'block' : 'none';
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        fetchTasks();
      }, 300);
    });

    el.btnClearSearch.addEventListener('click', () => {
      el.inputSearch.value = '';
      el.btnClearSearch.style.display = 'none';
      fetchTasks();
    });

    // Filters & Sort changes
    el.filterStatus.addEventListener('change', fetchTasks);
    el.filterPriority.addEventListener('change', fetchTasks);
    el.filterSort.addEventListener('change', fetchTasks);
  }

  // Boot Application
  async function init() {
    initEventListeners();
    await checkSystemHealth();
    await fetchSummary();
    await fetchTasks();

    // Periodic health check every 20 seconds
    setInterval(checkSystemHealth, 20000);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
