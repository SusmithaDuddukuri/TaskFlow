/**
 * TaskFlow Pro - Initial Mock Data
 * Sample projects, tasks, team members, users & notifications
 */

const INITIAL_PROJECTS = [
    {
        id: 'proj-001',
        name: 'Website Redesign',
        description: 'Complete overhaul of company marketing website with modern design system and improved performance.',
        status: 'active',
        progress: 65,
        startDate: '2026-09-01',
        dueDate: '2026-12-15',
        color: '#4f46e5',
        members: ['user-001', 'user-002', 'user-003']
    },
    {
        id: 'proj-002',
        name: 'Mobile App Launch',
        description: 'iOS and Android app for customer engagement. Includes push notifications and offline support.',
        status: 'active',
        progress: 42,
        startDate: '2026-08-15',
        dueDate: '2027-01-30',
        color: '#10b981',
        members: ['user-001', 'user-004', 'user-005']
    },
    {
        id: 'proj-003',
        name: 'API v2 Migration',
        description: 'Migrate legacy REST endpoints to new GraphQL API with improved security and rate limiting.',
        status: 'active',
        progress: 78,
        startDate: '2026-10-01',
        dueDate: '2026-11-30',
        color: '#f59e0b',
        members: ['user-002', 'user-006']
    },
    {
        id: 'proj-004',
        name: 'Customer Onboarding Flow',
        description: 'New guided onboarding experience to reduce time-to-value for new enterprise customers.',
        status: 'planning',
        progress: 15,
        startDate: '2026-11-01',
        dueDate: '2027-02-28',
        color: '#8b5cf6',
        members: ['user-003', 'user-005']
    },
    {
        id: 'proj-005',
        name: 'Analytics Dashboard',
        description: 'Internal analytics platform for tracking product metrics, user behavior and revenue.',
        status: 'active',
        progress: 55,
        startDate: '2026-09-20',
        dueDate: '2026-12-20',
        color: '#ef4444',
        members: ['user-001', 'user-004', 'user-006']
    },
    {
        id: 'proj-006',
        name: 'Security Audit Q4',
        description: 'Comprehensive security review, penetration testing and compliance documentation.',
        status: 'active',
        progress: 30,
        startDate: '2026-10-15',
        dueDate: '2026-12-31',
        color: '#06b6d4',
        members: ['user-002', 'user-006']
    }
];

const INITIAL_TASKS = [
    { id: 'task-001', title: 'Design new homepage hero', description: 'Create high-fidelity designs for the new hero section including mobile variants.', projectId: 'proj-001', status: 'done', priority: 'high', assigneeId: 'user-003', dueDate: '2026-10-20', createdAt: '2026-09-05' },
    { id: 'task-002', title: 'Implement responsive navigation', description: 'Build accessible responsive nav component with keyboard support.', projectId: 'proj-001', status: 'inprogress', priority: 'high', assigneeId: 'user-002', dueDate: '2026-11-10', createdAt: '2026-09-10' },
    { id: 'task-003', title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', projectId: 'proj-001', status: 'todo', priority: 'medium', assigneeId: 'user-001', dueDate: '2026-11-25', createdAt: '2026-09-12' },
    { id: 'task-004', title: 'Write unit tests for auth module', description: 'Achieve 90%+ coverage on authentication and session management.', projectId: 'proj-002', status: 'inprogress', priority: 'high', assigneeId: 'user-004', dueDate: '2026-11-15', createdAt: '2026-09-18' },
    { id: 'task-005', title: 'Design onboarding screens', description: 'Create Figma designs for the 5-step onboarding flow.', projectId: 'proj-002', status: 'review', priority: 'medium', assigneeId: 'user-005', dueDate: '2026-11-05', createdAt: '2026-09-20' },
    { id: 'task-006', title: 'Migrate user endpoints', description: 'Port /users and /profiles endpoints to GraphQL schema.', projectId: 'proj-003', status: 'done', priority: 'high', assigneeId: 'user-002', dueDate: '2026-10-30', createdAt: '2026-10-02' },
    { id: 'task-007', title: 'Add rate limiting middleware', description: 'Implement Redis-based rate limiting for public API routes.', projectId: 'proj-003', status: 'inprogress', priority: 'urgent', assigneeId: 'user-006', dueDate: '2026-11-08', createdAt: '2026-10-05' },
    { id: 'task-008', title: 'Create onboarding checklist UI', description: 'Build interactive checklist component for new users.', projectId: 'proj-004', status: 'todo', priority: 'medium', assigneeId: 'user-003', dueDate: '2026-12-01', createdAt: '2026-11-02' },
    { id: 'task-009', title: 'Define success metrics', description: 'Work with product to define KPIs for onboarding completion.', projectId: 'proj-004', status: 'todo', priority: 'low', assigneeId: 'user-005', dueDate: '2026-11-20', createdAt: '2026-11-03' },
    { id: 'task-010', title: 'Build revenue chart component', description: 'Reusable chart for MRR, ARR and churn visualization.', projectId: 'proj-005', status: 'inprogress', priority: 'high', assigneeId: 'user-001', dueDate: '2026-11-18', createdAt: '2026-09-25' },
    { id: 'task-011', title: 'Integrate Segment tracking', description: 'Add event tracking for key product interactions.', projectId: 'proj-005', status: 'review', priority: 'medium', assigneeId: 'user-004', dueDate: '2026-11-12', createdAt: '2026-10-01' },
    { id: 'task-012', title: 'Schedule external pentest', description: 'Engage third-party firm for Q4 security assessment.', projectId: 'proj-006', status: 'todo', priority: 'high', assigneeId: 'user-006', dueDate: '2026-11-30', createdAt: '2026-10-16' },
    { id: 'task-013', title: 'Review OWASP top 10 compliance', description: 'Audit current codebase against OWASP recommendations.', projectId: 'proj-006', status: 'inprogress', priority: 'urgent', assigneeId: 'user-002', dueDate: '2026-11-20', createdAt: '2026-10-18' },
    { id: 'task-014', title: 'Optimize image loading', description: 'Implement lazy loading and modern formats (WebP/AVIF).', projectId: 'proj-001', status: 'todo', priority: 'medium', assigneeId: 'user-002', dueDate: '2026-11-28', createdAt: '2026-10-22' },
    { id: 'task-015', title: 'Write API documentation', description: 'Complete OpenAPI specs for all new GraphQL operations.', projectId: 'proj-003', status: 'todo', priority: 'medium', assigneeId: 'user-006', dueDate: '2026-11-25', createdAt: '2026-10-25' },
    { id: 'task-016', title: 'User research interviews', description: 'Conduct 8 interviews with recent trial users about onboarding friction.', projectId: 'proj-004', status: 'inprogress', priority: 'high', assigneeId: 'user-005', dueDate: '2026-11-15', createdAt: '2026-11-01' },
    { id: 'task-017', title: 'Fix mobile Safari bugs', description: 'Address known layout issues on iOS 17+ Safari.', projectId: 'proj-001', status: 'review', priority: 'high', assigneeId: 'user-001', dueDate: '2026-11-08', createdAt: '2026-10-28' },
    { id: 'task-018', title: 'Setup error monitoring', description: 'Integrate Sentry for frontend and backend error tracking.', projectId: 'proj-002', status: 'done', priority: 'medium', assigneeId: 'user-004', dueDate: '2026-10-15', createdAt: '2026-09-28' },
    { id: 'task-019', title: 'Database query optimization', description: 'Identify and fix N+1 queries in reporting endpoints.', projectId: 'proj-005', status: 'todo', priority: 'high', assigneeId: 'user-006', dueDate: '2026-11-22', createdAt: '2026-10-30' },
    { id: 'task-020', title: 'Create threat model document', description: 'Document attack surfaces and mitigation strategies.', projectId: 'proj-006', status: 'todo', priority: 'medium', assigneeId: 'user-002', dueDate: '2026-12-10', createdAt: '2026-10-20' }
];

const INITIAL_TEAM = [
    { id: 'user-001', name: 'John Doe', role: 'Product Manager', email: 'john.doe@company.com', avatar: 'JD', tasksCompleted: 24, tasksActive: 5, access: 'admin', password: 'admin123' }
];

const INITIAL_NOTIFICATIONS = [
    { id: 'notif-001', title: 'Task assigned to you', message: 'You have been assigned "Fix mobile Safari bugs"', type: 'task', recipientId: 'user-001', read: false, createdAt: '2026-11-25T10:00:00' },
    { id: 'notif-002', title: 'High priority task due soon', message: 'Urgent task "Add rate limiting middleware" needs attention', type: 'urgent', recipientId: 'user-001', read: false, createdAt: '2026-11-24T14:30:00' },
    { id: 'notif-003', title: 'Project progress update', message: 'Website Redesign reached 65 percent completion', type: 'project', recipientId: 'admin', read: false, createdAt: '2026-11-24T09:15:00' },
    { id: 'notif-004', title: 'New comment on task', message: 'A team member commented on the onboarding checklist', type: 'comment', recipientId: 'user-001', read: true, createdAt: '2026-11-23T16:45:00' },
    { id: 'notif-005', title: 'Task completed', message: 'Migrate user endpoints was marked as done', type: 'task', recipientId: 'admin', read: false, createdAt: '2026-11-25T08:20:00' },
    { id: 'notif-006', title: 'System notice', message: 'Weekly digest is ready - 12 tasks completed this week', type: 'system', recipientId: 'admin', read: true, createdAt: '2026-11-24T18:00:00' },
    { id: 'notif-007', title: 'Overdue reminder', message: 'Task "Design onboarding screens" is past due', type: 'urgent', recipientId: 'user-001', read: false, createdAt: '2026-11-20T07:00:00' },
    { id: 'notif-008', title: 'New team activity', message: 'A new member joined the workspace', type: 'system', recipientId: 'admin', read: false, createdAt: '2026-11-18T09:00:00' },
    { id: 'notif-009', title: 'Task status changed', message: 'Implement responsive navigation moved to In Progress', type: 'task', recipientId: 'user-001', read: false, createdAt: '2026-11-25T12:10:00' },
    { id: 'notif-010', title: 'Project milestone', message: 'API v2 Migration is now at 78 percent complete', type: 'project', recipientId: 'admin', read: false, createdAt: '2026-11-22T11:00:00' }
];

const ACTIVITY_FEED = [
    { id: 1, text: 'Sarah Chen completed "Migrate user endpoints"', time: '2 hours ago', type: 'green' },
    { id: 2, text: 'New task "Fix mobile Safari bugs" assigned to John Doe', time: '4 hours ago', type: 'blue' },
    { id: 3, text: 'Alex Rivera uploaded designs for homepage hero', time: 'Yesterday', type: 'orange' },
    { id: 4, text: 'Priya Sharma moved "Write unit tests" to In Progress', time: 'Yesterday', type: 'blue' },
    { id: 5, text: 'Security Audit project progress updated to 30%', time: '2 days ago', type: 'green' },
    { id: 6, text: 'Marcus Johnson added comments on onboarding flow', time: '2 days ago', type: 'orange' },
    { id: 7, text: 'Elena Petrova created "Add rate limiting middleware"', time: '3 days ago', type: 'blue' },
    { id: 8, text: 'Website Redesign reached 65% completion', time: '3 days ago', type: 'green' }
];
