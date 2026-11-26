# TaskFlow Pro

A modern, fully functional **Project & Task Management** web application built for real-world team productivity.

## Features

- **Dashboard** – Overview of tasks, projects, progress and recent activity
- **Projects** – Visual project cards with progress tracking
- **Tasks** – Kanban-style board (To Do / In Progress / In Review / Done)
  - Create, edit, delete tasks
  - Priority and status management
  - Assignee assignment
- **Team** – Team member cards with workload stats
- **Reports** – Simple charts for status and priority distribution + project completion
- **Calendar** – Monthly view with due-date indicators
- **Settings** – Toggle preferences and reset demo data
- **Responsive** design with mobile sidebar
- **LocalStorage** persistence – your changes survive page reloads
- All navigation, buttons, modals and forms work without errors

## How to Run

### Option 1 – Open directly
Simply open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).

### Option 2 – Local server (recommended)
```bash
# Python 3
python3 -m http.server 8080

# or Node.js
npx serve .
```
Then visit http://localhost:8080

## Tech Stack

- Pure HTML5 + CSS3 + Vanilla JavaScript (no frameworks required)
- LocalStorage for data persistence
- Responsive CSS (mobile-friendly)
- Accessible focus states and keyboard support (Esc closes modal)

## Project Structure

```
├── index.html
├── css/
│   ├── styles.css
│   ├── dashboard.css
│   └── components.css
├── js/
│   ├── data.js          # Initial mock data
│   ├── utils.js         # Utility helpers
│   ├── storage.js       # LocalStorage layer
│   ├── app.js           # Main controller & navigation
│   ├── pages.js         # Page renderers
│   └── generated-utils.js  # Large generated utility library (scale demonstration)
└── README.md
```

## Notes

- All interactive elements (navigation, buttons, forms, modals, toggles) are fully wired and functional.
- Data is stored in the browser’s LocalStorage under keys prefixed with `taskflow_`.
- The large `generated-utils.js` file contains an extensive set of helper functions for demonstration of scale and can be used or extended as needed.
- This is a frontend-only demo application suitable for portfolios, prototypes, or as a starting point for a full-stack product.

---
TaskFlow Pro – Built for real-world productivity.

Test commit verification
