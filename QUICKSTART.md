# MoneyLab Quick Start Guide

## Prerequisites

Before starting, ensure you have:
- Python 3.8+ installed
- Node.js 16+ and npm installed
- PostgreSQL 12+ installed and running
- A Firebase project created (for authentication)

## Step 1: Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE moneylab;
   ```

2. Navigate to backend directory:
   ```bash
   cd backend
   ```

3. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

4. Activate virtual environment:
   - Windows (PowerShell): `venv\Scripts\Activate.ps1`
   - Windows (CMD): `venv\Scripts\activate.bat`
   - MacOS/Linux: `source venv/bin/activate`

5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

6. Generate encryption key:
   ```bash
   python generate_key.py
   ```
   Copy the generated key.

7. Create `.env` file in `backend/` directory:
   ```env
   DATABASE_URI=postgresql://your_username:your_password@localhost/moneylab
   DATABASE_PASSWORD=your_password
   DATABASE_USER=your_username
   DATABASE_NAME=moneylab
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   AES_ENCRYPTION_KEY=paste_generated_key_here
   SECRET_KEY=your_secret_key_here
   JWT_SECRET_KEY=your_jwt_secret_key_here
   FLASK_ENV=development
   PORT=5000
   ```

8. Initialize database:
   ```bash
   python setup_db.py
   ```

## Step 2: Backend Setup

1. Start the backend server:
   ```bash
   python run.py
   ```

   The server should start on `http://127.0.0.1:5000`

## Step 3: Frontend Setup

1. Open a new terminal and navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file in `client/` directory:
   ```env
   REACT_APP_apiKey=your_firebase_api_key
   REACT_APP_authDomain=your_project.firebaseapp.com
   REACT_APP_projectId=your_project_id
   REACT_APP_storageBucket=your_project.appspot.com
   REACT_APP_messagingSenderId=your_sender_id
   REACT_APP_appId=your_app_id
   REACT_APP_measurementId=your_measurement_id
   REACT_APP_API_BASE_URL=http://127.0.0.1:5000/api
   ```

   Get these values from your Firebase Console:
   - Go to Project Settings
   - Scroll to "Your apps" section
   - Copy the config values

4. Start the frontend:
   ```bash
   npm start
   ```

   The app should open in your browser at `http://localhost:3000`

## Step 4: Firebase Authentication Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
4. Get your Firebase config:
   - Go to Project Settings
   - Scroll to "Your apps"
   - Click on Web app icon (</>)
   - Copy the config values to your `.env.local` file

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Create Portfolio**: Click "New Portfolio" on the dashboard
3. **Add Assets**: Go to portfolio detail, click "Add Asset" to add your holdings
4. **Set Target Allocations**: Go to "Target Allocations" tab, set your desired percentages
5. **View Rebalancing**: Go to "Rebalancing" tab to see recommendations

## Troubleshooting

### Backend Issues
- **Database connection error**: Check PostgreSQL is running and credentials are correct
- **Encryption key error**: Make sure AES_ENCRYPTION_KEY is 32 bytes and base64 encoded
- **Port already in use**: Change PORT in `.env` file

### Frontend Issues
- **Firebase auth error**: Verify all Firebase config values in `.env.local`
- **API connection error**: Ensure backend is running on the correct port
- **CORS error**: Check that REACT_APP_API_BASE_URL matches backend URL

## Next Steps

- Add more asset types
- Integrate real-time stock prices
- Add portfolio performance charts
- Implement transaction history
- Add export functionality
