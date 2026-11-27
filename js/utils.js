/**
 * TaskFlow Pro - Utility Functions
 */

const Utils = {
    /**
     * Generate a unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Format date to readable string
     */
    formatDate(dateStr) {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    /**
     * Get relative time string
     */
    relativeTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return this.formatDate(dateStr);
    },

    /**
     * Capitalize first letter
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Status display name
     */
    statusLabel(status) {
        const map = {
            todo: 'To Do',
            inprogress: 'In Progress',
            review: 'In Review',
            done: 'Done',
            active: 'Active',
            planning: 'Planning',
            completed: 'Completed'
        };
        return map[status] || this.capitalize(status);
    },

    /**
     * Priority display
     */
    priorityLabel(priority) {
        return this.capitalize(priority);
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    /**
     * Debounce function
     */
    debounce(fn, delay = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Simple toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    /**
     * Filter array by search term across multiple fields
     */
    searchFilter(items, term, fields) {
        if (!term) return items;
        const lower = term.toLowerCase();
        return items.filter(item =>
            fields.some(field => {
                const val = item[field];
                return val && String(val).toLowerCase().includes(lower);
            })
        );
    },

    /**
     * Sort by field
     */
    sortBy(items, field, direction = 'asc') {
        return [...items].sort((a, b) => {
            let va = a[field];
            let vb = b[field];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return direction === 'asc' ? -1 : 1;
            if (va > vb) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Group tasks by status for kanban
     */
    groupByStatus(tasks) {
        return {
            todo: tasks.filter(t => t.status === 'todo'),
            inprogress: tasks.filter(t => t.status === 'inprogress'),
            review: tasks.filter(t => t.status === 'review'),
            done: tasks.filter(t => t.status === 'done')
        };
    },

    /**
     * Calculate project stats
     */
    getProjectStats(projectId, tasks) {
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        const total = projectTasks.length;
        const done = projectTasks.filter(t => t.status === 'done').length;
        const progress = total === 0 ? 0 : Math.round((done / total) * 100);
        return { total, done, progress };
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
