/**
 * TaskFlow Pro - Main Application Controller
 * Auth, navigation, modal, notifications, role-based access
 */

const App = {
    currentPage: 'dashboard',
    editingTaskId: null,
    currentFilters: { priority: '', project: '', search: '' },
    notifPanelOpen: false,

    init() {
        Storage.init();
        this.bindEvents();

        if (Storage.isLoggedIn()) {
            this.showApp();
            this.updateUserUI();
            this.updateNotifBadge();
            this.navigate('dashboard');
            this.populateSelects();
        } else {
            this.showLogin();
        }
        console.log('TaskFlow Pro initialized');
    },

    authMode: 'login', // 'login' | 'signup'

    showLogin() {
        document.getElementById('app').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        this.setAuthMode('login');
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('signupError').style.display = 'none';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupPassword2').value = '';
    },

    setAuthMode(mode) {
        this.authMode = mode;
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const subtitle = document.getElementById('loginSubtitle');
        const toggleText = document.getElementById('authToggleText');
        const toggleBtn = document.getElementById('authToggleBtn');
        const demo = document.getElementById('demoAccounts');
        if (mode === 'signup') {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            subtitle.textContent = 'Create a free account to get started';
            toggleText.textContent = 'Already have an account?';
            toggleBtn.textContent = 'Sign in';
            if (demo) demo.style.display = 'none';
        } else {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            subtitle.textContent = 'Sign in to manage projects & tasks';
            toggleText.textContent = "Don't have an account?";
            toggleBtn.textContent = 'Sign up';
            if (demo) demo.style.display = '';
        }
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('signupError').style.display = 'none';
    },

    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
    },

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // Toggle Sign in / Sign up
        const toggleBtn = document.getElementById('authToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.setAuthMode(this.authMode === 'login' ? 'signup' : 'login');
            });
        }

        // Demo account buttons
        document.querySelectorAll('[data-demo-login]').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.dataset.email;
                const pass = btn.dataset.password;
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = pass;
                this.handleLogin();
            });
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (!this.canAccess(page)) {
                    Utils.showToast('Access denied for your role', 'error');
                    return;
                }
                this.navigate(page);
                document.getElementById('sidebar').classList.remove('open');
            });
        });

        // Mobile menu
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
            });
        }

        // New Task
        const newTaskBtn = document.getElementById('newTaskBtn');
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => this.openTaskModal());
        }

        // Modal
        document.getElementById('modalClose').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') this.closeTaskModal();
        });
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Search
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 250));
        }

        // Notifications panel toggle
        document.getElementById('notifBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotifPanel();
        });

        // Close notif panel on outside click
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notifPanel');
            const btn = document.getElementById('notifBtn');
            if (panel && this.notifPanelOpen && !panel.contains(e.target) && !btn.contains(e.target)) {
                this.closeNotifPanel();
            }
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Esc closes modal / panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closeNotifPanel();
            }
        });
    },

    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');

        if (!email || !password) {
            errorEl.textContent = 'Please enter email and password';
            errorEl.style.display = 'block';
            return;
        }

        const result = Storage.login(email, password);
        if (result.success) {
            errorEl.style.display = 'none';
            this.showApp();
            this.updateUserUI();
            this.updateNotifBadge();
            this.applyRoleUI();
            this.navigate('dashboard');
            this.populateSelects();
            Utils.showToast(`Welcome, ${result.user.name}!`, 'success');
        } else {
            errorEl.textContent = result.error || 'Login failed';
            errorEl.style.display = 'block';
        }
    },

    handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const password2 = document.getElementById('signupPassword2').value;
        const errorEl = document.getElementById('signupError');

        if (!name || !email || !password) {
            errorEl.textContent = 'Please fill in all fields';
            errorEl.style.display = 'block';
            return;
        }
        if (password !== password2) {
            errorEl.textContent = 'Passwords do not match';
            errorEl.style.display = 'block';
            return;
        }
        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters';
            errorEl.style.display = 'block';
            return;
        }

        const result = Storage.register({ name, email, password });
        if (result.success) {
            errorEl.style.display = 'none';
            this.showApp();
            this.updateUserUI();
            this.updateNotifBadge();
            this.applyRoleUI();
            this.navigate('dashboard');
            this.populateSelects();
            Utils.showToast(`Welcome, ${result.user.name}! Account created.`, 'success');
        } else {
            errorEl.textContent = result.error || 'Registration failed';
            errorEl.style.display = 'block';
        }
    },

    handleLogout() {
        Storage.logout();
        this.notifPanelOpen = false;
        this.currentFilters = { priority: '', project: '', search: '' };
        this.showLogin();
        Utils.showToast('Signed out successfully', 'success');
    },

    updateUserUI() {
        const user = Storage.getCurrentUser();
        if (!user) return;
        const avatar = document.querySelector('.sidebar-footer .avatar');
        const nameEl = document.querySelector('.sidebar-footer .user-name');
        const roleEl = document.querySelector('.sidebar-footer .user-role');
        if (avatar) avatar.textContent = user.avatar || Utils.getInitials(user.name);
        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) roleEl.textContent = user.access === 'admin' ? 'Admin' : 'User';
    },

    applyRoleUI() {
        const isAdmin = Storage.isAdmin();
        // Hide admin-only nav items for regular users
        document.querySelectorAll('.nav-item[data-admin-only]').forEach(el => {
            el.style.display = isAdmin ? '' : 'none';
        });
        // New Task: both can create, but users limited in assignee options later
        const newTaskBtn = document.getElementById('newTaskBtn');
        if (newTaskBtn) newTaskBtn.style.display = '';
    },

    canAccess(page) {
        if (!Storage.isLoggedIn()) return false;
        if (page === 'settings' && !Storage.isAdmin()) return false;
        // Reports & Team: admin full, users can view limited
        return true;
    },

    navigate(page) {
        if (!this.canAccess(page)) {
            page = 'dashboard';
        }
        this.currentPage = page;
        this.currentFilters.search = '';
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.value = '';

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        const container = document.getElementById('pageContainer');
        container.innerHTML = '';
        container.className = 'page-container page-enter';

        switch (page) {
            case 'dashboard':
                if (Storage.isAdmin()) {
                    Pages.renderAdminDashboard(container);
                } else {
                    Pages.renderUserDashboard(container);
                }
                break;
            case 'projects':
                Pages.renderProjects(container);
                break;
            case 'tasks':
                Pages.renderTasks(container);
                break;
            case 'team':
                Pages.renderTeam(container);
                break;
            case 'reports':
                Pages.renderReports(container);
                break;
            case 'calendar':
                Pages.renderCalendar(container);
                break;
            case 'settings':
                if (Storage.isAdmin()) {
                    Pages.renderSettings(container);
                } else {
                    Pages.renderUserDashboard(container);
                }
                break;
            default:
                if (Storage.isAdmin()) Pages.renderAdminDashboard(container);
                else Pages.renderUserDashboard(container);
        }
    },

    populateSelects() {
        const projectSelect = document.getElementById('taskProject');
        const assigneeSelect = document.getElementById('taskAssignee');
        if (!projectSelect || !assigneeSelect) return;

        const projects = Storage.getProjects();
        const user = Storage.getCurrentUser();
        let visibleProjects = projects;
        if (user && user.access !== 'admin') {
            visibleProjects = projects.filter(p => (p.members || []).includes(user.id));
        }
        projectSelect.innerHTML = visibleProjects.map(p =>
            `<option value="${p.id}">${Utils.escapeHtml(p.name)}</option>`
        ).join('') || '<option value="">No projects</option>';

        const team = Storage.getTeam();
        // Admin can assign anyone; user can only assign self or leave
        if (Storage.isAdmin()) {
            assigneeSelect.innerHTML = team.map(u =>
                `<option value="${u.id}">${Utils.escapeHtml(u.name)}</option>`
            ).join('');
        } else {
            assigneeSelect.innerHTML = `<option value="${user.id}">${Utils.escapeHtml(user.name)} (Me)</option>`;
        }
    },

    openTaskModal(taskId = null) {
        this.editingTaskId = taskId;
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');

        form.reset();
        this.populateSelects();

        if (taskId) {
            title.textContent = 'Edit Task';
            const task = Storage.getTask(taskId);
            if (task) {
                // Users can only edit their own tasks unless admin
                const user = Storage.getCurrentUser();
                if (!Storage.isAdmin() && task.assigneeId !== user.id) {
                    Utils.showToast('You can only edit tasks assigned to you', 'error');
                    return;
                }
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDesc').value = task.description || '';
                document.getElementById('taskProject').value = task.projectId;
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('taskStatus').value = task.status;
                document.getElementById('taskDue').value = task.dueDate || '';
                document.getElementById('taskAssignee').value = task.assigneeId || '';
            }
        } else {
            title.textContent = 'Create New Task';
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            document.getElementById('taskDue').value = nextWeek.toISOString().split('T')[0];
        }

        modal.classList.add('active');
        document.getElementById('taskTitle').focus();
    },

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.editingTaskId = null;
    },

    saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) {
            Utils.showToast('Title is required', 'error');
            return;
        }

        const data = {
            title,
            description: document.getElementById('taskDesc').value.trim(),
            projectId: document.getElementById('taskProject').value,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            dueDate: document.getElementById('taskDue').value,
            assigneeId: document.getElementById('taskAssignee').value
        };

        if (this.editingTaskId) {
            const old = Storage.getTask(this.editingTaskId);
            Storage.updateTask(this.editingTaskId, data);
            // Notify if assignee changed
            if (old && data.assigneeId && data.assigneeId !== old.assigneeId) {
                Storage.addNotification({
                    title: 'Task assigned to you',
                    message: `You have been assigned "${data.title}"`,
                    type: 'task',
                    recipientId: data.assigneeId
                });
                this.updateNotifBadge();
            }
            Utils.showToast('Task updated successfully');
        } else {
            data.id = Utils.generateId('task');
            data.createdAt = new Date().toISOString().split('T')[0];
            Storage.addTask(data);
            if (data.assigneeId) {
                const current = Storage.getCurrentUser();
                if (data.assigneeId !== current.id) {
                    Storage.addNotification({
                        title: 'New task assigned',
                        message: `You have been assigned "${data.title}"`,
                        type: 'task',
                        recipientId: data.assigneeId
                    });
                    this.updateNotifBadge();
                }
            }
            // Also notify admin of new task
            if (!Storage.isAdmin()) {
                Storage.addNotification({
                    title: 'New task created',
                    message: `${Storage.getCurrentUser().name} created "${data.title}"`,
                    type: 'task',
                    recipientId: 'admin'
                });
            }
            Utils.showToast('Task created successfully');
        }

        this.closeTaskModal();
        this.navigate(this.currentPage);
    },

    deleteTask(id) {
        if (!Storage.isAdmin()) {
            const task = Storage.getTask(id);
            const user = Storage.getCurrentUser();
            if (!task || task.assigneeId !== user.id) {
                Utils.showToast('You can only delete your own tasks', 'error');
                return;
            }
        }
        if (confirm('Are you sure you want to delete this task?')) {
            Storage.deleteTask(id);
            Utils.showToast('Task deleted');
            this.navigate(this.currentPage);
        }
    },

    handleSearch(term) {
        this.currentFilters.search = term || '';
        if (this.currentPage !== 'tasks') {
            this.navigate('tasks');
        } else {
            Pages.renderTasks(document.getElementById('pageContainer'));
        }
    },

    // ---------- Notifications UI ----------
    updateNotifBadge() {
        const badge = document.querySelector('#notifBtn .badge');
        const count = Storage.getUnreadCount();
        if (badge) {
            badge.textContent = count > 9 ? '9+' : String(count);
            badge.style.display = count > 0 ? '' : 'none';
        }
    },

    toggleNotifPanel() {
        if (this.notifPanelOpen) {
            this.closeNotifPanel();
        } else {
            this.openNotifPanel();
        }
    },

    openNotifPanel() {
        const panel = document.getElementById('notifPanel');
        if (!panel) return;
        const notifs = Storage.getMyNotifications();
        const listEl = panel.querySelector('.notif-list');
        if (!listEl) return;

        if (notifs.length === 0) {
            listEl.innerHTML = '<div class="notif-empty">No notifications yet</div>';
        } else {
            listEl.innerHTML = notifs.map(n => `
                <div class="notif-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
                    <div class="notif-icon ${n.type || 'task'}">
                        ${this.notifIcon(n.type)}
                    </div>
                    <div class="notif-body">
                        <strong>${Utils.escapeHtml(n.title)}</strong>
                        <p>${Utils.escapeHtml(n.message)}</p>
                        <span class="notif-time">${Utils.relativeTime(n.createdAt)}</span>
                    </div>
                    ${!n.read ? '<span class="notif-dot"></span>' : ''}
                </div>
            `).join('');

            listEl.querySelectorAll('.notif-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    Storage.markNotificationRead(id);
                    item.classList.remove('unread');
                    item.classList.add('read');
                    const dot = item.querySelector('.notif-dot');
                    if (dot) dot.remove();
                    this.updateNotifBadge();
                });
            });
        }

        panel.classList.add('open');
        this.notifPanelOpen = true;
    },

    closeNotifPanel() {
        const panel = document.getElementById('notifPanel');
        if (panel) panel.classList.remove('open');
        this.notifPanelOpen = false;
    },

    markAllRead() {
        Storage.markAllNotificationsRead();
        this.updateNotifBadge();
        if (this.notifPanelOpen) this.openNotifPanel();
        Utils.showToast('All notifications marked as read');
    },

    notifIcon(type) {
        const icons = {
            task: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
            urgent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            project: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
            comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
            system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
        };
        return icons[type] || icons.task;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
