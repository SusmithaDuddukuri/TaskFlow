# TaskFlow Pro

A modern, fully functional **Project & Task Management** web application with role-based dashboards (Admin & User), authentication, and real notifications.

## Features

- **Sign In / Sign Up / Sign Out** – New users can register; session stored in LocalStorage
- New accounts are created as **User** (not Admin). Admins are notified of new signups
- **Two dashboards**
  - **Admin** – Full system overview, all projects/tasks, team management, settings, data reset
  - **User** – Personal dashboard showing only assigned tasks and member projects
- **Role-based access**
  - Admin can manage everything
  - Users can view/edit only their tasks, see projects they belong to, limited team view
  - Settings page is admin-only
- **Tasks** – Kanban board (To Do / In Progress / In Review / Done)
  - Create, edit, delete (with permission checks)
  - **Working filters** by priority and project (with clear)
  - Assignee notifications when tasks are assigned
- **Notifications**
  - Dropdown panel showing real notifications (title, message, type, time)
  - Targeted to specific users or to admins
  - Unread badge, mark as read, mark all read
- **Projects, Team, Reports, Calendar** – role-aware data
- **LocalStorage** persistence – changes survive reloads
- Responsive design with mobile sidebar

## Demo Accounts

| Role  | Email                     | Password  |
|-------|---------------------------|-----------|
| Admin | john.doe@company.com      | admin123  |
| User  | sarah.chen@company.com    | user123   |
| User  | priya.sharma@company.com  | user123   |

(Other team members also use password `user123`.)

## How to Run

### Option 1 – Open directly
Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).

### Option 2 – Local server (recommended)
```bash
python3 -m http.server 8080
# or
npx serve .
```
Then visit http://localhost:8080

## Tech Stack

- Pure HTML5 + CSS3 + Vanilla JavaScript (no frameworks)
- LocalStorage for data & session
- Responsive CSS

## Project Structure

```
├── index.html
├── css/
│   ├── styles.css
│   ├── dashboard.css
│   └── components.css
├── js/
│   ├── data.js       # Mock projects, tasks, team, notifications
│   ├── utils.js      # Helpers
│   ├── storage.js    # LocalStorage + auth + notifications
│   ├── app.js        # Controller, login, navigation, notif UI
│   └── pages.js      # Admin/User dashboards & page renderers
└── README.md
```

## Open Source Notes

- Frontend-only demo suitable as a starting point for a full-stack product.
- No external dependencies beyond Google Fonts.
- All interactive elements (login, navigation, filters, modals, notifications) are wired and functional.

---
TaskFlow Pro – Built for real-world productivity.
