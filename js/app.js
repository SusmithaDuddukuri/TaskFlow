/**
 * TaskFlow Pro - Main Application Controller
 * Handles navigation, modal, global events
 */

const App = {
    currentPage: 'dashboard',
    editingTaskId: null,

    /**
     * Initialize the application
     */
    init() {
        Storage.init();
        this.bindEvents();
        this.navigate('dashboard');
        this.populateSelects();
        console.log('TaskFlow Pro initialized successfully');
    },

    /**
     * Bind global event listeners
     */
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigate(page);
                // Close mobile sidebar
                document.getElementById('sidebar').classList.remove('open');
            });
        });

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
            });
        }

        // New Task button
        document.getElementById('newTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') this.closeTaskModal();
        });

        // Task form submit
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Global search
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 250));
        }

        // Notification button (demo)
        document.getElementById('notifBtn').addEventListener('click', () => {
            Utils.showToast('You have 3 unread notifications', 'success');
        });

        // Keyboard shortcut: Escape closes modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeTaskModal();
        });
    },

    /**
     * Navigate to a page
     */
    navigate(page) {
        this.currentPage = page;

        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Render page
        const container = document.getElementById('pageContainer');
        container.innerHTML = '';
        container.className = 'page-container page-enter';

        switch (page) {
            case 'dashboard':
                Pages.renderDashboard(container);
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
                Pages.renderSettings(container);
                break;
            default:
                Pages.renderDashboard(container);
        }
    },

    /**
     * Populate project and assignee selects in modal
     */
    populateSelects() {
        const projectSelect = document.getElementById('taskProject');
        const assigneeSelect = document.getElementById('taskAssignee');

        const projects = Storage.getProjects();
        projectSelect.innerHTML = projects.map(p =>
            `<option value="${p.id}">${Utils.escapeHtml(p.name)}</option>`
        ).join('');

        const team = Storage.getTeam();
        assigneeSelect.innerHTML = team.map(u =>
            `<option value="${u.id}">${Utils.escapeHtml(u.name)}</option>`
        ).join('');
    },

    /**
     * Open task modal for create or edit
     */
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
            // Default due date to one week from now
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            document.getElementById('taskDue').value = nextWeek.toISOString().split('T')[0];
        }

        modal.classList.add('active');
        document.getElementById('taskTitle').focus();
    },

    /**
     * Close task modal
     */
    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.editingTaskId = null;
    },

    /**
     * Save task (create or update)
     */
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
            Storage.updateTask(this.editingTaskId, data);
            Utils.showToast('Task updated successfully');
        } else {
            data.id = Utils.generateId('task');
            data.createdAt = new Date().toISOString().split('T')[0];
            Storage.addTask(data);
            Utils.showToast('Task created successfully');
        }

        this.closeTaskModal();
        // Refresh current page
        this.navigate(this.currentPage);
    },

    /**
     * Delete a task with confirmation
     */
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            Storage.deleteTask(id);
            Utils.showToast('Task deleted');
            this.navigate(this.currentPage);
        }
    },

    /**
     * Handle global search (simple demo)
     */
    handleSearch(term) {
        if (!term) return;
        // For demo, switch to tasks page and filter
        if (this.currentPage !== 'tasks') {
            this.navigate('tasks');
        }
        // The tasks page can listen or we re-render with filter
        // For simplicity, store search term and re-render
        window._searchTerm = term;
        Pages.renderTasks(document.getElementById('pageContainer'), term);
    }
};

// Boot the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// TaskFlow improvement: error messages

