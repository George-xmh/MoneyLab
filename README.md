<div align="center">

# MoneyLab

### An All-in-One Investment Management Platform

#### _Monitor, Analyze, and Rebalance Your Portfolio to Align with Your Financial Goals_

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%2320232a.svg?style=for-the-badge&logo=typescript&logoColor=blue)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-%23404d59.svg?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)

</div>

---

## What is MoneyLab?

MoneyLab is a modern investment management platform designed to assist users in optimizing their portfolio allocations. It helps users maintain an ideal asset allocation that aligns with their risk tolerance and financial goals.

## Features

- 📊 **Portfolio Tracking**: Monitor your investments in real-time
- 🎯 **Asset Allocation**: Set and maintain target allocations
- ⚖️ **Rebalancing**: Automatically calculate rebalancing recommendations
- 📈 **Performance Analytics**: Track portfolio performance over time
- 🔒 **Secure**: Encrypted storage of sensitive financial data
- 👤 **User Authentication**: Secure user accounts and data isolation
- 
### Demo Video
https://github.com/user-attachments/assets/2b047af2-1cbd-4bfc-ad2b-2f6d932a3f42

## Getting Started

**Tip:** Open the project root folder (`MoneyLab`) in VS Code. All commands below assume you start from that folder. Use two terminals: one for the backend, one for the client.

### Prerequisites

- **Python 3.8+** — [python.org](https://www.python.org/downloads/). Check: `python --version`
- **Node.js 16+** and **npm** — [nodejs.org](https://nodejs.org/). Check: `node --version` and `npm --version`
- **PostgreSQL 12+** — [postgresql.org](https://www.postgresql.org/download/). Make sure the PostgreSQL service is running.

---

### First-time setup

#### 1. Backend: virtual environment and dependencies

In a terminal (e.g. VS Code integrated terminal):

```bash
cd backend
python -m venv venv
```

Activate the virtual environment (you must do this in **every new terminal** where you run backend commands):

- **Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`  
  If you get an execution policy error, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- **Windows (CMD):** `venv\Scripts\activate.bat`
- **macOS/Linux:** `source venv/bin/activate`

Then install dependencies (with the venv still activated):

```bash
pip install -r requirements.txt
```

#### 2. Database and backend `.env`

1. Create a PostgreSQL database (e.g. `moneylab`) using pgAdmin, `psql`, or your preferred tool.
2. In the `backend` folder, create a file named `.env` (no extension).
3. Generate an AES key: with your venv activated, run:
   ```bash
   python generate_key.py
   ```
   Copy the printed `AES_ENCRYPTION_KEY=...` line.
4. Fill `.env` with your values (use the key from step 3 for `AES_ENCRYPTION_KEY`):

```env
DATABASE_URI=postgresql://YOUR_USER:YOUR_PASSWORD@localhost/YOUR_DATABASE_NAME
DATABASE_PASSWORD=YOUR_PASSWORD
DATABASE_USER=YOUR_USER
DATABASE_NAME=YOUR_DATABASE_NAME
DATABASE_HOST=localhost
DATABASE_PORT=5432
AES_ENCRYPTION_KEY=paste_the_key_from_generate_key.py_output
SECRET_KEY=any_long_random_string_for_flask_sessions
JWT_SECRET_KEY=any_long_random_string_for_jwt_tokens
```

5. Create database tables (venv still activated, still in `backend`):

```bash
python setup_db.py
```

You should see: `Database tables created successfully!`

#### 3. Frontend: dependencies and Firebase `.env.local`

1. Open a **second terminal** (backend will run in the first).
2. Install client dependencies:

```bash
cd client
npm install
```

3. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/), enable **Authentication → Email/Password**.
4. In **Project settings → Your apps**, copy the config values.
5. In the `client` folder, create a file named `.env.local` with (replace placeholders with your Firebase values):

```env
REACT_APP_apiKey=your_api_key
REACT_APP_authDomain=your_project.firebaseapp.com
REACT_APP_projectId=your_project_id
REACT_APP_storageBucket=your_project.appspot.com
REACT_APP_messagingSenderId=your_sender_id
REACT_APP_appId=your_app_id
REACT_APP_measurementId=G-XXXXXXXXXX
REACT_APP_API_BASE_URL=http://127.0.0.1:5000
```

---

### Running the app

**Terminal 1 — Backend** (from project root):

```bash
cd backend
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD: venv\Scripts\activate.bat
# macOS/Linux: source venv/bin/activate
python run.py
```

Wait until you see: `Running on http://127.0.0.1:5000`

**Terminal 2 — Frontend** (from project root):

```bash
cd client
npm start
```

The app should open in your browser at **http://localhost:3000**. If it doesn’t, open that URL manually.

---

### Troubleshooting

- **“Something is already running on port 3000”**  
  Another process is using port 3000. Close the other app, or free the port (e.g. Windows: `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force`).

- **Browser doesn’t open when you run `npm start`**  
  Go to **http://localhost:3000** in Chrome (or your browser) yourself.

- **PowerShell: “cannot be loaded because running scripts is disabled”**  
  Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`, then try activating the venv again.

- **Backend: “AES_ENCRYPTION_KEY not found” or database errors**  
  Check that `.env` is in the `backend` folder, has no typos in variable names, and that PostgreSQL is running and the database exists. Run `python setup_db.py` again if you recreated the database.

- **Frontend: blank page or Firebase errors**  
  Check that `.env.local` is in the `client` folder and that all `REACT_APP_*` values match your Firebase project. Restart `npm start` after changing `.env.local`.

## Project Structure

```
MoneyLab/
├── backend/          # Python Flask backend
│   ├── app/
│   │   ├── models/   # Database models
│   │   ├── routes/   # API routes
│   │   ├── utils/    # Utilities (encryption, etc.)
│   │   └── __init__.py
│   ├── tests/        # Unit tests
│   ├── run.py        # Application entry point
│   └── requirements.txt
├── client/           # React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```
---

### Architecture Overview
![MoneyLab Architecture](assets/moneylab_architecture.png)
---

