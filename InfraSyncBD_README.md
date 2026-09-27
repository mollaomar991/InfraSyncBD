# InfraSync BD

![InfraSync BD](public/InfraSync.png)

**InfraSync BD** is a role-based infrastructure coordination and project monitoring platform for Bangladesh. It brings government departments, contractors, administrators, and citizens into one system for project planning, GIS monitoring, conflict coordination, approvals, construction progress, inspections, complaints, restoration, reporting, and AI-assisted estimation.

## Key Features

- **Authentication & role-based access** for Super Admin, Department Officer, Contractor, and Citizen accounts.
- **Account verification & user management** for approving officers/contractors and controlling user status.
- **Role-specific dashboards** with project, complaint, conflict, contractor, and operational summaries.
- **Infrastructure project management** with create, view, update, archive/delete, budget, schedule, and contractor assignment workflows.
- **GIS project mapping** with Google Hybrid map tiles, point/polyline project locations, progress display, and conflict visualization.
- **Automatic project conflict handling** with conflict alerts, coordination requests, resolution tracking, and approval workflow.
- **AI budget estimator** that predicts planning budgets and can save the estimate with a project.
- **AI material estimator** for construction materials with project-linked estimate history.
- **Construction progress tracking** with physical/financial progress, work summaries, delay reasons, and photo evidence.
- **Inspection management** with scheduling, checklist results, engineer remarks, pass/fail status, and rework handling.
- **Citizen complaint management** with ticket generation, photo upload, assignment, status updates, correction evidence, and resolution flow.
- **Road restoration workflow** with before/after evidence and officer verification.
- **Contractor monitoring** including assignment, performance/risk information, and active/completed project statistics.
- **Notifications, analytics, and reports** for ongoing system and project activity.
- **Selenium end-to-end test flows** for login, registration, project creation/approval/assignment, progress, and complaints.

## Main Workflow

```text
User Registration/Login
        ↓
Role-Based Dashboard
        ↓
Project Creation + GIS Location + Optional AI Budget
        ↓
Conflict Detection / Coordination / Approval
        ↓
Contractor Assignment
        ↓
Progress Updates + AI Material Estimation
        ↓
Inspection / Rework / Restoration
        ↓
Completion + Reports + Citizen Feedback
```

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router, Bootstrap |
| GIS | Leaflet, React Leaflet, Google Hybrid map tiles |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT |
| AI / ML | Python, scikit-learn, pandas, NumPy, joblib |
| Testing | Selenium WebDriver, Mocha/Chai dependencies |

## Project Structure

```text
InfraSyncBD/
├── public/                  # Static assets
├── src/                     # React + TypeScript frontend
│   ├── api/                 # Axios API client
│   ├── components/          # Shared UI/GIS components
│   ├── context/             # App state and API integration
│   ├── pages/               # Role and feature pages
│   └── types/               # TypeScript types
├── server/
│   ├── src/controllers/     # Backend business logic
│   ├── src/routes/          # Express API routes
│   ├── src/database/        # MySQL schema and seed data
│   ├── src/ai/              # AI predictor, configs, and trained models
│   └── server.js            # Express server entry point
├── selenium_tests/          # End-to-end Selenium tests
├── package.json             # Frontend dependencies/scripts
└── README.md
```

## Run Locally

### Prerequisites

- Node.js 18+
- MySQL / XAMPP
- Python 3.12 recommended for AI features

### 1. Database

Create a MySQL database named `infrasync_bd`, then import:

```text
server/src/database/schema.sql
server/src/database/seeds.sql
```

Optional demo workflow data is available in:

```text
server/src/database/demo_seeds.sql
```

### 2. Backend environment

Create `server/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=infrasync_bd
JWT_SECRET=change_this_secret
PORT=5000
AI_USD_TO_BDT_RATE=120
```

### 3. Install AI dependencies

From the project root:

```bash
python -m venv .venv
```

Activate the virtual environment, then run:

```bash
pip install -r server/src/ai/requirements.txt
```

### 4. Start backend

```bash
cd server
npm install
npm start
```

Backend: `http://localhost:5000`

### 5. Start frontend

In another terminal from the project root:

```bash
npm install
npm run dev
```

The Vite terminal will show the frontend URL, normally `http://localhost:5173`.

## Demo Accounts

The seed data includes demo accounts using password **`admin123`**.

| Role | Email |
|---|---|
| Super Admin | `admin@infrasync.gov.bd` |
| Department Officer | `salman@rhd.gov.bd` |
| Contractor | `tariq@builder.com` |
| Citizen | `rahim@citizen.com` |

> **Development note:** the current prototype authentication stores/compares seed passwords in plain text. Use proper password hashing and production secrets before deploying publicly.

## Main API Areas

```text
/api/auth           Authentication and current-user profile
/api/admin          Verification and user access management
/api/projects       Project CRUD and GIS project data
/api/conflicts      Conflict alerts and resolution
/api/coordination   Inter-department coordination requests
/api/approvals      Project approval workflow
/api/contractors    Contractor listing and assignment
/api/progress       Construction progress updates
/api/inspections    Inspection scheduling and results
/api/complaints     Citizen complaints and resolution
/api/restorations   Road restoration evidence/verification
/api/notifications  User notifications
/api/analytics      Dashboard analytics
/api/ai             Budget and material estimation
```

## Useful Commands

```bash
npm run dev        # Start frontend development server
npm run build      # Type-check and build frontend
npm run typecheck  # Run TypeScript checking
npm run preview    # Preview production frontend build

cd server
npm start          # Start Express backend
```

## Testing

Selenium scenarios are available under `selenium_tests/`, covering major flows such as login, citizen complaints, progress updates, account creation, project creation, project approval, contractor assignment, and complaint notifications.

## Project Goal

InfraSync BD aims to reduce fragmented infrastructure coordination by keeping project location, approvals, construction progress, conflicts, inspections, contractor activity, public complaints, and planning estimates visible in one shared digital workflow.

---

**InfraSync BD — Smart infrastructure coordination, monitoring, and public accountability.**
