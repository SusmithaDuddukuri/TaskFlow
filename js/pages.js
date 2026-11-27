/**
 * TaskFlow Pro - Page Rendering Functions
 * Admin vs User dashboards, fixed task filters, role-aware views
 */

const Pages = {
    /**
     * Admin Dashboard - full overview
     */
    renderAdminDashboard(container) {
        const projects = Storage.getProjects();
        const tasks = Storage.getTasks();
        const team = Storage.getTeam();

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const inProgress = tasks.filter(t => t.status === 'inprogress').length;
        const overdue = tasks.filter(t => {
            if (!t.dueDate || t.status === 'done') return false;
            return new Date(t.dueDate) < new Date();
        }).length;

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Full system overview · Manage projects, tasks & team</p>
                </div>
                <span class="role-badge admin">Admin</span>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                    </div>
                    <div class="stat-info">
                        <h4>${totalTasks}</h4>
                        <p>Total Tasks</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div class="stat-info">
                        <h4>${completedTasks}</h4>
                        <p>Completed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div class="stat-info">
                        <h4>${inProgress}</h4>
                        <p>In Progress</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <div class="stat-info">
                        <h4>${overdue}</h4>
                        <p>Overdue</p>
                    </div>
                </div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3>Active Projects</h3>
                        <button class="btn sm secondary" onclick="App.navigate('projects')">View All</button>
                    </div>
                    <div class="card-body">
                        ${projects.slice(0, 4).map(p => {
                            const stats = Utils.getProjectStats(p.id, tasks);
                            return `
                                <div style="margin-bottom: 20px;">
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                        <strong style="font-size:14px;">${Utils.escapeHtml(p.name)}</strong>
                                        <span class="text-xs text-muted">${stats.progress}%</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill blue" style="width:${stats.progress}%;background:${p.color}"></div>
                                    </div>
                                    <div class="text-xs text-muted mt-1">${stats.done}/${stats.total} tasks · Due ${Utils.formatDate(p.dueDate)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>Recent Activity</h3>
                    </div>
                    <div class="card-body">
                        <ul class="activity-list">
                            ${ACTIVITY_FEED.map(a => `
                                <li class="activity-item">
                                    <div class="activity-dot ${a.type}"></div>
                                    <div class="activity-content">
                                        <p>${Utils.escapeHtml(a.text)}</p>
                                        <span class="text-xs text-muted">${a.time}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-header">
                    <h3>Upcoming Tasks</h3>
                    <button class="btn sm secondary" onclick="App.navigate('tasks')">View All</button>
                </div>
                <div class="card-body" style="overflow-x:auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Project</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Due</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasks.filter(t => t.status !== 'done').slice(0, 6).map(t => {
                                const proj = Storage.getProject(t.projectId);
                                return `
                                    <tr>
                                        <td>${Utils.escapeHtml(t.title)}</td>
                                        <td>${proj ? Utils.escapeHtml(proj.name) : '—'}</td>
                                        <td><span class="tag ${t.priority}">${Utils.priorityLabel(t.priority)}</span></td>
                                        <td><span class="tag ${t.status}">${Utils.statusLabel(t.status)}</span></td>
                                        <td>${Utils.formatDate(t.dueDate)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * User / Customer Dashboard - personal view
     */
    renderUserDashboard(container) {
        const user = Storage.getCurrentUser();
        const tasks = Storage.getVisibleTasks();
        const myTasks = tasks.filter(t => t.assigneeId === user.id);
        const projects = Storage.getProjects().filter(p => (p.members || []).includes(user.id));

        const completed = myTasks.filter(t => t.status === 'done').length;
        const inProgress = myTasks.filter(t => t.status === 'inprogress').length;
        const todo = myTasks.filter(t => t.status === 'todo').length;
        const overdue = myTasks.filter(t => {
            if (!t.dueDate || t.status === 'done') return false;
            return new Date(t.dueDate) < new Date();
        }).length;

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>My Dashboard</h1>
                    <p>Welcome back, ${Utils.escapeHtml(user.name)} · Your tasks & projects</p>
                </div>
                <span class="role-badge user">User</span>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                    </div>
                    <div class="stat-info">
                        <h4>${myTasks.length}</h4>
                        <p>My Tasks</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div class="stat-info">
                        <h4>${completed}</h4>
                        <p>Completed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div class="stat-info">
                        <h4>${inProgress}</h4>
                        <p>In Progress</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <div class="stat-info">
                        <h4>${overdue}</h4>
                        <p>Overdue</p>
                    </div>
                </div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3>My Projects</h3>
                        <button class="btn sm secondary" onclick="App.navigate('projects')">View All</button>
                    </div>
                    <div class="card-body">
                        ${projects.length === 0 ? '<p class="text-muted">You are not assigned to any projects yet.</p>' :
                            projects.map(p => {
                                const stats = Utils.getProjectStats(p.id, Storage.getTasks());
                                return `
                                    <div style="margin-bottom: 16px;">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                            <strong style="font-size:14px;">${Utils.escapeHtml(p.name)}</strong>
                                            <span class="text-xs text-muted">${stats.progress}%</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width:${stats.progress}%;background:${p.color}"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')
                        }
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>My Open Tasks</h3>
                        <button class="btn sm secondary" onclick="App.navigate('tasks')">View All</button>
                    </div>
                    <div class="card-body">
                        ${myTasks.filter(t => t.status !== 'done').length === 0
                            ? '<p class="text-muted">No open tasks assigned to you.</p>'
                            : `<ul class="activity-list">
                                ${myTasks.filter(t => t.status !== 'done').slice(0, 6).map(t => `
                                    <li class="activity-item">
                                        <div class="activity-dot blue"></div>
                                        <div class="activity-content">
                                            <p>${Utils.escapeHtml(t.title)}</p>
                                            <span class="text-xs text-muted">
                                                <span class="tag ${t.priority}">${Utils.priorityLabel(t.priority)}</span>
                                                · Due ${Utils.formatDate(t.dueDate)}
                                            </span>
                                        </div>
                                    </li>
                                `).join('')}
                              </ul>`
                        }
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Projects Page
     */
    renderProjects(container) {
        const user = Storage.getCurrentUser();
        let projects = Storage.getProjects();
        if (!Storage.isAdmin()) {
            projects = projects.filter(p => (p.members || []).includes(user.id));
        }
        const tasks = Storage.getTasks();

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Projects</h1>
                    <p>${projects.length} project${projects.length !== 1 ? 's' : ''}</p>
                </div>
            </div>
            <div class="projects-grid">
                ${projects.map(p => {
                    const stats = Utils.getProjectStats(p.id, tasks);
                    return `
                        <div class="project-card" onclick="App.navigate('tasks')">
                            <div class="project-color" style="background:${p.color}"></div>
                            <h3>${Utils.escapeHtml(p.name)}</h3>
                            <p class="text-muted text-sm">${Utils.escapeHtml(p.description || '').slice(0, 100)}${(p.description || '').length > 100 ? '…' : ''}</p>
                            <div class="progress-bar mt-2">
                                <div class="progress-fill" style="width:${stats.progress}%;background:${p.color}"></div>
                            </div>
                            <div class="project-meta">
                                <span>${stats.total} tasks</span>
                                <span class="tag ${p.status}">${Utils.statusLabel(p.status)}</span>
                                <span>Due ${Utils.formatDate(p.dueDate)}</span>
                            </div>
                        </div>
                    `;
                }).join('') || '<p class="text-muted">No projects available for your account.</p>'}
            </div>
        `;
    },

    /**
     * Tasks Page - Kanban with working filters
     */
    renderTasks(container) {
        const user = Storage.getCurrentUser();
        let tasks = Storage.getVisibleTasks();

        // Apply filters from App.currentFilters
        const f = App.currentFilters || {};
        if (f.search) {
            tasks = Utils.searchFilter(tasks, f.search, ['title', 'description']);
        }
        if (f.priority) {
            tasks = tasks.filter(t => t.priority === f.priority);
        }
        if (f.project) {
            tasks = tasks.filter(t => t.projectId === f.project);
        }

        const grouped = Utils.groupByStatus(tasks);
        const columns = [
            { key: 'todo', label: 'To Do' },
            { key: 'inprogress', label: 'In Progress' },
            { key: 'review', label: 'In Review' },
            { key: 'done', label: 'Done' }
        ];

        const projects = Storage.isAdmin()
            ? Storage.getProjects()
            : Storage.getProjects().filter(p => (p.members || []).includes(user.id));

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Tasks</h1>
                    <p>${tasks.length} task${tasks.length !== 1 ? 's' : ''}${f.search ? ` matching "${Utils.escapeHtml(f.search)}"` : ''}</p>
                </div>
                <button class="btn primary" onclick="App.openTaskModal()">+ New Task</button>
            </div>

            <div class="filters">
                <select id="filterPriority">
                    <option value="">All Priorities</option>
                    <option value="urgent" ${f.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                    <option value="high" ${f.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="medium" ${f.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="low" ${f.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
                <select id="filterProject">
                    <option value="">All Projects</option>
                    ${projects.map(p => `<option value="${p.id}" ${f.project === p.id ? 'selected' : ''}>${Utils.escapeHtml(p.name)}</option>`).join('')}
                </select>
                ${(f.priority || f.project) ? '<button class="btn sm secondary" id="clearFilters">Clear filters</button>' : ''}
            </div>

            <div class="kanban-board" id="kanbanBoard">
                ${columns.map(col => `
                    <div class="kanban-column" data-status="${col.key}">
                        <div class="kanban-column-header">
                            <h4>${col.label}</h4>
                            <span class="kanban-count">${(grouped[col.key] || []).length}</span>
                        </div>
                        ${(grouped[col.key] || []).map(t => {
                            const u = Storage.getUser(t.assigneeId);
                            const proj = Storage.getProject(t.projectId);
                            const canEdit = Storage.isAdmin() || t.assigneeId === user.id;
                            return `
                                <div class="task-card" data-id="${t.id}">
                                    <h5>${Utils.escapeHtml(t.title)}</h5>
                                    <div class="text-xs text-muted">${proj ? Utils.escapeHtml(proj.name) : ''}</div>
                                    <div class="task-card-footer">
                                        <span class="tag ${t.priority}">${Utils.priorityLabel(t.priority)}</span>
                                        <div style="display:flex;gap:6px;align-items:center;">
                                            ${canEdit ? `
                                            <button class="btn-icon" style="padding:2px;" onclick="event.stopPropagation();App.openTaskModal('${t.id}')" title="Edit">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button class="btn-icon" style="padding:2px;" onclick="event.stopPropagation();App.deleteTask('${t.id}')" title="Delete">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>` : ''}
                                            ${u ? `<div class="task-avatar" title="${Utils.escapeHtml(u.name)}">${u.avatar}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
        `;

        // Wire filter controls (must re-bind after innerHTML)
        const priSelect = document.getElementById('filterPriority');
        const projSelect = document.getElementById('filterProject');
        const clearBtn = document.getElementById('clearFilters');

        if (priSelect) {
            priSelect.addEventListener('change', () => {
                App.currentFilters.priority = priSelect.value;
                Pages.renderTasks(container);
            });
        }
        if (projSelect) {
            projSelect.addEventListener('change', () => {
                App.currentFilters.project = projSelect.value;
                Pages.renderTasks(container);
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                App.currentFilters.priority = '';
                App.currentFilters.project = '';
                Pages.renderTasks(container);
            });
        }
    },

    /**
     * Team Page
     */
    renderTeam(container) {
        const team = Storage.getTeam();
        const tasks = Storage.getTasks();
        const isAdmin = Storage.isAdmin();

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Team</h1>
                    <p>${team.length} members</p>
                </div>
            </div>
            <div class="team-grid">
                ${team.map(m => {
                    const memberTasks = tasks.filter(t => t.assigneeId === m.id && t.status !== 'done').length;
                    return `
                        <div class="team-card">
                            <div class="team-avatar" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">${m.avatar}</div>
                            <h3>${Utils.escapeHtml(m.name)}</h3>
                            <p class="text-muted">${Utils.escapeHtml(m.role || 'Member')}</p>
                            <p class="text-xs text-muted">${Utils.escapeHtml(m.email || '')}</p>
                            ${isAdmin ? `<span class="tag ${m.access === 'admin' ? 'urgent' : 'medium'}">${m.access === 'admin' ? 'Admin' : 'User'}</span>` : ''}
                            <div class="team-stats">
                                <div><strong>${m.tasksCompleted || 0}</strong>Completed</div>
                                <div><strong>${memberTasks}</strong>Active</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Reports Page
     */
    renderReports(container) {
        const tasks = Storage.isAdmin() ? Storage.getTasks() : Storage.getVisibleTasks();
        const byStatus = Utils.groupByStatus(tasks);
        const byPriority = {
            urgent: tasks.filter(t => t.priority === 'urgent').length,
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        };
        const maxStatus = Math.max(...Object.values(byStatus).map(a => a.length), 1);
        const maxPriority = Math.max(...Object.values(byPriority), 1);

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Reports</h1>
                    <p>Overview of task distribution and progress</p>
                </div>
            </div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-header"><h3>Tasks by Status</h3></div>
                    <div class="card-body">
                        <div class="chart-bars">
                            ${Object.entries(byStatus).map(([k, arr]) => `
                                <div class="chart-col">
                                    <div class="chart-bar" style="height:${(arr.length / maxStatus) * 140}px;"></div>
                                    <span class="text-xs">${Utils.statusLabel(k)}</span>
                                    <span class="text-xs text-muted">${arr.length}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Tasks by Priority</h3></div>
                    <div class="card-body">
                        <div class="chart-bars">
                            ${Object.entries(byPriority).map(([k, count]) => `
                                <div class="chart-col">
                                    <div class="chart-bar" style="height:${(count / maxPriority) * 140}px;background:linear-gradient(to top, ${k==='urgent'?'#ef4444':k==='high'?'#f97316':k==='medium'?'#6366f1':'#94a3b8'}, #c7d2fe);"></div>
                                    <span class="text-xs">${Utils.priorityLabel(k)}</span>
                                    <span class="text-xs text-muted">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="card mt-4">
                <div class="card-header"><h3>Project Completion</h3></div>
                <div class="card-body">
                    ${(Storage.isAdmin() ? Storage.getProjects() : Storage.getProjects().filter(p => (p.members || []).includes(Storage.getCurrentUser().id))).map(p => {
                        const stats = Utils.getProjectStats(p.id, Storage.getTasks());
                        return `
                            <div style="margin-bottom:16px;">
                                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                    <span>${Utils.escapeHtml(p.name)}</span>
                                    <span class="text-muted">${stats.progress}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width:${stats.progress}%;background:${p.color}"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Calendar Page
     */
    renderCalendar(container) {
        const tasks = (Storage.isAdmin() ? Storage.getTasks() : Storage.getVisibleTasks()).filter(t => t.dueDate);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let cells = '';
        for (let i = 0; i < firstDay; i++) cells += '<div class="calendar-day empty"></div>';
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const isToday = d === now.getDate();
            cells += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    <span class="day-num">${d}</span>
                    ${dayTasks.slice(0, 2).map(t => `<div class="calendar-event" title="${Utils.escapeHtml(t.title)}">${Utils.escapeHtml(t.title)}</div>`).join('')}
                    ${dayTasks.length > 2 ? `<div class="text-xs text-muted">+${dayTasks.length - 2} more</div>` : ''}
                </div>
            `;
        }

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Calendar</h1>
                    <p>Task due dates for ${monthName}</p>
                </div>
            </div>
            <div class="card">
                <div class="calendar-grid">
                    <div class="calendar-header">Sun</div>
                    <div class="calendar-header">Mon</div>
                    <div class="calendar-header">Tue</div>
                    <div class="calendar-header">Wed</div>
                    <div class="calendar-header">Thu</div>
                    <div class="calendar-header">Fri</div>
                    <div class="calendar-header">Sat</div>
                    ${cells}
                </div>
            </div>
        `;
    },

    /**
     * Settings (Admin only)
     */
    renderSettings(container) {
        const settings = Storage.getSettings();
        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Admin preferences and system controls</p>
                </div>
            </div>
            <div class="card settings-card">
                <div class="card-body">
                    <div class="setting-row">
                        <div>
                            <strong>Email notifications</strong>
                            <p class="text-muted text-sm">Receive email digests of activity</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="setEmail" ${settings.emailDigest ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-row">
                        <div>
                            <strong>In-app notifications</strong>
                            <p class="text-muted text-sm">Show notification badge and panel</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="setNotif" ${settings.notifications !== false ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-row">
                        <div>
                            <strong>Compact view</strong>
                            <p class="text-muted text-sm">Denser layout for task boards</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="setCompact" ${settings.compactView ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <hr style="margin:24px 0;border:none;border-top:1px solid var(--border);">
                    <div class="setting-row">
                        <div>
                            <strong>Reset demo data</strong>
                            <p class="text-muted text-sm">Restore projects, tasks and notifications to defaults</p>
                        </div>
                        <button class="btn secondary sm" onclick="if(confirm('This will reset all tasks, projects and notifications. Continue?')){Storage.reset();App.navigate('dashboard');}">Reset Data</button>
                    </div>
                </div>
            </div>
        `;

        ['setEmail', 'setNotif', 'setCompact'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    const s = Storage.getSettings();
                    s.emailDigest = document.getElementById('setEmail').checked;
                    s.notifications = document.getElementById('setNotif').checked;
                    s.compactView = document.getElementById('setCompact').checked;
                    Storage.saveSettings(s);
                    Utils.showToast('Settings saved');
                });
            }
        });
    }
};
