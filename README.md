# InfraSync BD - User Management + Project Management Frontend Only

This project was extracted from the supplied InfraSync BD frontend and intentionally contains only two functional areas.

## Module 1 Completed Features
- Login
- Signup / registration
- Super Admin account verification
- Super Admin user access / status management
- Role-based protected routes

### Database Architecture (MySQL)

- Created `infrasync_bd` database using XAMPP.

### 2. Backend API (Node.js & Express)

- Initialized Express server with routing, CORS, and environment variables.
- **Auth API (`/api/auth`)**:
  - `POST /register`: Registers Citizens, Contractors, and Department Officers. Handles profile linking.
  - `POST /login`: Validates credentials (plain text) and issues JSON Web Tokens (JWT).
  - `GET /me`: Returns logged-in user details via token validation.
- **Admin API (`/api/admin`)**:
  - `GET /users`: Fetches all system users for Super Admin.
  - `GET /pending-verifications`: Fetches contractor/officer profiles awaiting approval.
  - `PUT /verify-user/:id`: Allows Super Admin to approve or reject pending accounts.


## 🛠️ How to Run Locally

### Prerequisites

- [XAMPP](https://www.apachefriends.org/) (for MySQL Database)
- [Node.js](https://nodejs.org/) (v18+)

### Step 1: Database Setup

1. Open XAMPP and start the **MySQL** service.
2. Go to `http://localhost/phpmyadmin`.
3. Create a new database named `infrasync_bd`.
4. Import `server/src/database/schema.sql`.
5. Import `server/src/database/seeds.sql`.

### Step 2: Start the Backend Server

```bash
cd server
npm install
node server.js
```

*(The backend runs on `http://localhost:5000`)*

### Step 3: Start the Frontend Application

Open a **new terminal window** in the root directory:

```bash
npm install
npm run dev
```
## 🔑 Test Credentials

All test accounts use the password: **`admin123`**

| Role                | Email                      | Status  |
| ------------------- | -------------------------- | ------- |
| Super Admin         | `admin@infrasync.gov.bd` | Active  |
| Dept Officer (RHD)  | `salman@rhd.gov.bd`      | Active  |
| Dept Officer (DNCC) | `farhana@dncc.gov.bd`    | Active  |
| Dept Officer (WASA) | `rafiq@wasa.gov.bd`      | Pending |
| Contractor          | `tariq@builder.com`      | Active  |
| Contractor          | `abc@builder.com`        | Pending |
| Citizen             | `rahim@citizen.com`      | Active  |


## Module 2 - Project Management / GIS
- Project list / project monitoring
- Create project (Department Officer)
- GIS project map
- Project locations, status, budget and progress display

