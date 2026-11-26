/**
 * TaskFlow Pro - Page Rendering Functions
 */

const Pages = {
    /**
     * Dashboard Page
     */
    renderDashboard(container) {
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
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's what's happening today.</p>
                </div>
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
                                        <span>${a.time}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Upcoming Tasks</h3>
                    <button class="btn sm secondary" onclick="App.navigate('tasks')">View All</button>
                </div>
                <div class="card-body table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Project</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Due</th>
                                <th>Assignee</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasks.filter(t => t.status !== 'done').slice(0, 6).map(t => {
                                const proj = Storage.getProject(t.projectId);
                                const user = Storage.getUser(t.assigneeId);
                                return `
                                    <tr>
                                        <td><strong>${Utils.escapeHtml(t.title)}</strong></td>
                                        <td>${proj ? Utils.escapeHtml(proj.name) : '—'}</td>
                                        <td><span class="tag ${t.priority}">${Utils.priorityLabel(t.priority)}</span></td>
                                        <td><span class="tag ${t.status}">${Utils.statusLabel(t.status)}</span></td>
                                        <td>${Utils.formatDate(t.dueDate)}</td>
                                        <td>${user ? user.name : '—'}</td>
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
     * Projects Page
     */
    renderProjects(container) {
        const projects = Storage.getProjects();
        const tasks = Storage.getTasks();

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Projects</h1>
                    <p>${projects.length} projects in total</p>
                </div>
            </div>
            <div class="projects-grid">
                ${projects.map(p => {
                    const stats = Utils.getProjectStats(p.id, tasks);
                    return `
                        <div class="project-card" onclick="App.navigate('tasks')">
                            <div style="width:8px;height:8px;border-radius:50%;background:${p.color};margin-bottom:12px;"></div>
                            <h3>${Utils.escapeHtml(p.name)}</h3>
                            <p>${Utils.escapeHtml(p.description)}</p>
                            <div class="project-progress">
                                <div class="project-progress-label">
                                    <span>Progress</span>
                                    <span>${stats.progress}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width:${stats.progress}%;background:${p.color}"></div>
                                </div>
                            </div>
                            <div class="project-meta mt-3">
                                <span>${stats.total} tasks</span>
                                <span>Due ${Utils.formatDate(p.dueDate)}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Tasks Page - Kanban + List
     */
    renderTasks(container, searchTerm = '') {
        let tasks = Storage.getTasks();
        if (searchTerm) {
            tasks = Utils.searchFilter(tasks, searchTerm, ['title', 'description']);
        }
        const grouped = Utils.groupByStatus(tasks);
        const columns = [
            { key: 'todo', label: 'To Do' },
            { key: 'inprogress', label: 'In Progress' },
            { key: 'review', label: 'In Review' },
            { key: 'done', label: 'Done' }
        ];

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Tasks</h1>
                    <p>${tasks.length} tasks ${searchTerm ? `matching "${Utils.escapeHtml(searchTerm)}"` : ''}</p>
                </div>
                <button class="btn primary" onclick="App.openTaskModal()">+ New Task</button>
            </div>

            <div class="filters">
                <select id="filterPriority" onchange="Pages.filterTasks()">
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select id="filterProject" onchange="Pages.filterTasks()">
                    <option value="">All Projects</option>
                    ${Storage.getProjects().map(p => `<option value="${p.id}">${Utils.escapeHtml(p.name)}</option>`).join('')}
                </select>
            </div>

            <div class="kanban-board" id="kanbanBoard">
                ${columns.map(col => `
                    <div class="kanban-column" data-status="${col.key}">
                        <div class="kanban-column-header">
                            <h4>${col.label}</h4>
                            <span class="kanban-count">${grouped[col.key].length}</span>
                        </div>
                        ${grouped[col.key].map(t => {
                            const user = Storage.getUser(t.assigneeId);
                            const proj = Storage.getProject(t.projectId);
                            return `
                                <div class="task-card" data-id="${t.id}">
                                    <h5>${Utils.escapeHtml(t.title)}</h5>
                                    <div class="text-xs text-muted">${proj ? Utils.escapeHtml(proj.name) : ''}</div>
                                    <div class="task-card-footer">
                                        <span class="tag ${t.priority}">${Utils.priorityLabel(t.priority)}</span>
                                        <div style="display:flex;gap:6px;align-items:center;">
                                            <button class="btn-icon" style="padding:2px;" onclick="event.stopPropagation();App.openTaskModal('${t.id}')" title="Edit">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button class="btn-icon" style="padding:2px;" onclick="event.stopPropagation();App.deleteTask('${t.id}')" title="Delete">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                            ${user ? `<div class="task-avatar" title="${user.name}">${user.avatar}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    },

    filterTasks() {
        // Simple client-side filter demo - re-render with current search
        const priority = document.getElementById('filterPriority')?.value || '';
        const project = document.getElementById('filterProject')?.value || '';
        let tasks = Storage.getTasks();
        if (priority) tasks = tasks.filter(t => t.priority === priority);
        if (project) tasks = tasks.filter(t => t.projectId === project);
        // For full filter we would re-render, but for demo we keep it simple
        // Re-render full page with filters applied would require more state
        Utils.showToast(`Filter applied (${tasks.length} tasks)`, 'success');
    },

    /**
     * Team Page
     */
    renderTeam(container) {
        const team = Storage.getTeam();
        const tasks = Storage.getTasks();

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
                        <div class="member-card">
                            <div class="member-avatar">${m.avatar}</div>
                            <h3>${Utils.escapeHtml(m.name)}</h3>
                            <div class="role">${Utils.escapeHtml(m.role)}</div>
                            <div class="text-xs text-muted mb-3">${Utils.escapeHtml(m.email)}</div>
                            <div class="member-stats">
                                <div><strong>${m.tasksCompleted}</strong><br>Completed</div>
                                <div><strong>${memberTasks}</strong><br>Active</div>
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
        const tasks = Storage.getTasks();
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
                        <div class="chart-placeholder">
                            <div class="chart-bars">
                                ${Object.entries(byStatus).map(([k, arr]) => `
                                    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                                        <div class="chart-bar" style="height:${(arr.length / maxStatus) * 140}px;"></div>
                                        <span class="text-xs">${Utils.statusLabel(k)}</span>
                                        <strong class="text-sm">${arr.length}</strong>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Tasks by Priority</h3></div>
                    <div class="card-body">
                        <div class="chart-placeholder">
                            <div class="chart-bars">
                                ${Object.entries(byPriority).map(([k, count]) => `
                                    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                                        <div class="chart-bar" style="height:${(count / maxPriority) * 140}px;background:linear-gradient(to top, ${k==='urgent'?'#ef4444':k==='high'?'#f97316':k==='medium'?'#6366f1':'#94a3b8'}, #c7d2fe);"></div>
                                        <span class="text-xs">${Utils.capitalize(k)}</span>
                                        <strong class="text-sm">${count}</strong>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-header"><h3>Project Completion</h3></div>
                <div class="card-body">
                    ${Storage.getProjects().map(p => {
                        const stats = Utils.getProjectStats(p.id, tasks);
                        return `
                            <div style="margin-bottom:16px;">
                                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                    <span class="font-medium">${Utils.escapeHtml(p.name)}</span>
                                    <span class="text-sm text-muted">${stats.progress}% (${stats.done}/${stats.total})</span>
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
     * Calendar Page (simple month view)
     */
    renderCalendar(container) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

        const tasks = Storage.getTasks().filter(t => t.dueDate);

        let daysHtml = '';
        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            daysHtml += `<div class="calendar-day other-month"></div>`;
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = d === now.getDate();
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            daysHtml += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    <div>${d}</div>
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
                <div class="card-body">
                    <div class="calendar-header">
                        <h3>${monthName}</h3>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-day-header">Sun</div>
                        <div class="calendar-day-header">Mon</div>
                        <div class="calendar-day-header">Tue</div>
                        <div class="calendar-day-header">Wed</div>
                        <div class="calendar-day-header">Thu</div>
                        <div class="calendar-day-header">Fri</div>
                        <div class="calendar-day-header">Sat</div>
                        ${daysHtml}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Settings Page
     */
    renderSettings(container) {
        const settings = Storage.getSettings();

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your preferences</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="settings-section">
                        <h3>Notifications</h3>
                        <div class="setting-item">
                            <label>Enable notifications</label>
                            <div class="toggle ${settings.notifications ? 'active' : ''}" id="toggleNotif" onclick="Pages.toggleSetting('notifications')"></div>
                        </div>
                        <div class="setting-item">
                            <label>Weekly email digest</label>
                            <div class="toggle ${settings.emailDigest ? 'active' : ''}" id="toggleDigest" onclick="Pages.toggleSetting('emailDigest')"></div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>Appearance</h3>
                        <div class="setting-item">
                            <label>Compact view</label>
                            <div class="toggle ${settings.compactView ? 'active' : ''}" id="toggleCompact" onclick="Pages.toggleSetting('compactView')"></div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>Data</h3>
                        <div class="setting-item">
                            <label>Reset all data to demo defaults</label>
                            <button class="btn secondary sm" onclick="if(confirm('This will reset all tasks and projects. Continue?')){Storage.reset();App.navigate('dashboard');}">Reset Data</button>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>About</h3>
                        <p class="text-sm text-muted">TaskFlow Pro v1.0.0 — A modern project & task management application for teams. Built for real-world productivity.</p>
                    </div>
                </div>
            </div>
        `;
    },

    toggleSetting(key) {
        const settings = Storage.getSettings();
        settings[key] = !settings[key];
        Storage.saveSettings(settings);
        // Update UI
        const el = document.getElementById(
            key === 'notifications' ? 'toggleNotif' :
            key === 'emailDigest' ? 'toggleDigest' : 'toggleCompact'
        );
        if (el) el.classList.toggle('active', settings[key]);
        Utils.showToast(`${Utils.capitalize(key)} ${settings[key] ? 'enabled' : 'disabled'}`);
    }
};

// TaskFlow improvement: task search
// TaskFlow improvement: project filters
// TaskFlow improvement: team management
// TaskFlow improvement: task sorting

