/**
 * TaskFlow Pro - LocalStorage Persistence Layer
 * Includes auth session, notifications, and role-aware data access
 */

const Storage = {
    KEYS: {
        projects: 'taskflow_projects',
        tasks: 'taskflow_tasks',
        team: 'taskflow_team',
        settings: 'taskflow_settings',
        notifications: 'taskflow_notifications',
        session: 'taskflow_session'
    },

    /**
     * Initialize storage with default data if empty
     */
    init() {
        if (!localStorage.getItem(this.KEYS.projects)) {
            localStorage.setItem(this.KEYS.projects, JSON.stringify(INITIAL_PROJECTS));
        }
        if (!localStorage.getItem(this.KEYS.tasks)) {
            localStorage.setItem(this.KEYS.tasks, JSON.stringify(INITIAL_TASKS));
        }
        if (!localStorage.getItem(this.KEYS.team)) {
            localStorage.setItem(this.KEYS.team, JSON.stringify(INITIAL_TEAM));
        } else {
            // Remove bundled sample accounts while preserving the admin and registered users.
            const bundledDemoIds = new Set(['user-002', 'user-003', 'user-004', 'user-005', 'user-006']);
            try {
                const savedTeam = JSON.parse(localStorage.getItem(this.KEYS.team)) || [];
                const cleanedTeam = savedTeam.filter(user => !bundledDemoIds.has(user.id));
                localStorage.setItem(this.KEYS.team, JSON.stringify(cleanedTeam.length ? cleanedTeam : INITIAL_TEAM));
                const session = this.getSession();
                if (session && bundledDemoIds.has(session.id)) this.clearSession();
            } catch {
                localStorage.setItem(this.KEYS.team, JSON.stringify(INITIAL_TEAM));
            }
        }
        if (!localStorage.getItem(this.KEYS.notifications)) {
            localStorage.setItem(this.KEYS.notifications, JSON.stringify(INITIAL_NOTIFICATIONS));
        }
        if (!localStorage.getItem(this.KEYS.settings)) {
            localStorage.setItem(this.KEYS.settings, JSON.stringify({
                theme: 'light',
                notifications: true,
                emailDigest: true,
                compactView: false
            }));
        }
    },

    // ---------- Session / Auth ----------
    getSession() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.session)) || null;
        } catch {
            return null;
        }
    },

    setSession(user) {
        if (!user) {
            localStorage.removeItem(this.KEYS.session);
            return;
        }
        const safe = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            access: user.access || 'user'
        };
        localStorage.setItem(this.KEYS.session, JSON.stringify(safe));
    },

    clearSession() {
        localStorage.removeItem(this.KEYS.session);
    },

    getCurrentUser() {
        return this.getSession();
    },

    isAdmin() {
        const u = this.getCurrentUser();
        return u && u.access === 'admin';
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    login(email, password) {
        const team = this.getTeam();
        const user = team.find(u =>
            u.email.toLowerCase() === email.toLowerCase().trim() &&
            u.password === password
        );
        if (user) {
            this.setSession(user);
            return { success: true, user: this.getSession() };
        }
        return { success: false, error: 'Invalid email or password' };
    },

    logout() {
        this.clearSession();
    },

    saveTeam(team) {
        localStorage.setItem(this.KEYS.team, JSON.stringify(team));
    },

    /**
     * Register a new user (always access: 'user')
     */
    register({ name, email, password }) {
        const team = this.getTeam();
        const exists = team.some(u => u.email.toLowerCase() === email.toLowerCase().trim());
        if (exists) {
            return { success: false, error: 'An account with this email already exists' };
        }
        if (!name || name.trim().length < 2) {
            return { success: false, error: 'Please enter your full name' };
        }
        if (!password || password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }
        const initials = name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const user = {
            id: Utils.generateId('user'),
            name: name.trim(),
            role: 'Team Member',
            email: email.toLowerCase().trim(),
            avatar: initials || 'U',
            tasksCompleted: 0,
            tasksActive: 0,
            access: 'user',
            password: password
        };
        team.push(user);
        this.saveTeam(team);
        // Welcome notification
        const list = this.getNotifications();
        list.unshift({
            id: Utils.generateId('notif'),
            title: 'Welcome to TaskFlow!',
            message: 'Your account is ready. Create tasks and explore your dashboard.',
            type: 'system',
            recipientId: user.id,
            read: false,
            createdAt: new Date().toISOString()
        });
        // Notify admins of new signup
        list.unshift({
            id: Utils.generateId('notif'),
            title: 'New user registered',
            message: `${user.name} (${user.email}) just signed up`,
            type: 'system',
            recipientId: 'admin',
            read: false,
            createdAt: new Date().toISOString()
        });
        this.saveNotifications(list);
        this.setSession(user);
        return { success: true, user: this.getSession() };
    },

    // ---------- Projects ----------
    getProjects() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.projects)) || [];
        } catch {
            return [...INITIAL_PROJECTS];
        }
    },

    saveProjects(projects) {
        localStorage.setItem(this.KEYS.projects, JSON.stringify(projects));
    },

    getProject(id) {
        return this.getProjects().find(p => p.id === id);
    },

    // ---------- Tasks ----------
    getTasks() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.tasks)) || [];
        } catch {
            return [...INITIAL_TASKS];
        }
    },

    getVisibleTasks() {
        const tasks = this.getTasks();
        const user = this.getCurrentUser();
        if (!user) return [];
        if (user.access === 'admin') return tasks;

        const projects = this.getProjects();
        const memberProjectIds = projects
            .filter(p => (p.members || []).includes(user.id))
            .map(p => p.id);

        return tasks.filter(t =>
            t.assigneeId === user.id || memberProjectIds.includes(t.projectId)
        );
    },

    saveTasks(tasks) {
        localStorage.setItem(this.KEYS.tasks, JSON.stringify(tasks));
    },

    addTask(task) {
        const tasks = this.getTasks();
        tasks.unshift(task);
        this.saveTasks(tasks);
        return task;
    },

    updateTask(id, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) return null;
        tasks[index] = { ...tasks[index], ...updates };
        this.saveTasks(tasks);
        return tasks[index];
    },

    deleteTask(id) {
        let tasks = this.getTasks();
        tasks = tasks.filter(t => t.id !== id);
        this.saveTasks(tasks);
    },

    getTask(id) {
        return this.getTasks().find(t => t.id === id);
    },

    // ---------- Team ----------
    getTeam() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.team)) || [];
        } catch {
            return [...INITIAL_TEAM];
        }
    },

    getUser(id) {
        return this.getTeam().find(u => u.id === id);
    },

    // ---------- Settings ----------
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.settings)) || {};
        } catch {
            return {};
        }
    },

    saveSettings(settings) {
        localStorage.setItem(this.KEYS.settings, JSON.stringify(settings));
    },

    // ---------- Notifications ----------
    getNotifications() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.notifications)) || [];
        } catch {
            return [...INITIAL_NOTIFICATIONS];
        }
    },

    saveNotifications(list) {
        localStorage.setItem(this.KEYS.notifications, JSON.stringify(list));
    },

    getMyNotifications() {
        const user = this.getCurrentUser();
        if (!user) return [];
        const all = this.getNotifications();
        return all.filter(n => {
            if (n.recipientId === user.id) return true;
            if (n.recipientId === 'admin' && user.access === 'admin') return true;
            return false;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getUnreadCount() {
        return this.getMyNotifications().filter(n => !n.read).length;
    },

    markNotificationRead(id) {
        const list = this.getNotifications();
        const idx = list.findIndex(n => n.id === id);
        if (idx !== -1) {
            list[idx].read = true;
            this.saveNotifications(list);
        }
    },

    markAllNotificationsRead() {
        const user = this.getCurrentUser();
        if (!user) return;
        const list = this.getNotifications().map(n => {
            if (n.recipientId === user.id || (n.recipientId === 'admin' && user.access === 'admin')) {
                return { ...n, read: true };
            }
            return n;
        });
        this.saveNotifications(list);
    },

    addNotification({ title, message, type = 'task', recipientId }) {
        const list = this.getNotifications();
        const notif = {
            id: Utils.generateId('notif'),
            title,
            message,
            type,
            recipientId,
            read: false,
            createdAt: new Date().toISOString()
        };
        list.unshift(notif);
        this.saveNotifications(list);
        return notif;
    },

    reset() {
        localStorage.setItem(this.KEYS.projects, JSON.stringify(INITIAL_PROJECTS));
        localStorage.setItem(this.KEYS.tasks, JSON.stringify(INITIAL_TASKS));
        localStorage.setItem(this.KEYS.team, JSON.stringify(INITIAL_TEAM));
        localStorage.setItem(this.KEYS.notifications, JSON.stringify(INITIAL_NOTIFICATIONS));
        Utils.showToast('Data reset to defaults', 'success');
    }
};
