# MoneyLab

### An All-in-One Investment Management Platform

#### _Monitor, Analyze, and Rebalance Your Portfolio to Align with Your Financial Goals_

## What is MoneyLab?

MoneyLab is a modern investment management platform designed to assist users in optimizing their portfolio allocations. It helps users maintain an ideal asset allocation that aligns with their risk tolerance and financial goals.

## Features

- 📊 **Portfolio Tracking**: Monitor your investments in real-time
- 🎯 **Asset Allocation**: Set and maintain target allocations
- ⚖️ **Rebalancing**: Automatically calculate rebalancing recommendations
- 📈 **Performance Analytics**: Track portfolio performance over time
- 🔒 **Secure**: Encrypted storage of sensitive financial data
- 👤 **User Authentication**: Secure user accounts and data isolation

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Starting the Backend Server

_(http://127.0.0.1:5000 by default)_

1. `cd backend`
2. `python -m venv venv`
3. Activate virtual environment:
   - Windows (PowerShell): `venv\Scripts\Activate.ps1`
   - Windows (CMD): `venv\Scripts\activate.bat`
   - MacOS/Linux: `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. Set up your `.env` file (see Database Setup below)
6. `python run.py`

### Starting the Frontend App

_(http://localhost:3000 by default)_

1. `cd client`
2. `npm install`
3. Set up your `.env.local` file (see Firebase Setup below)
4. `npm start`

### Database Setup

1. Create a new PostgreSQL database (e.g., `moneylab`)
2. `cd backend`
3. Create a `.env` file with the following:

```env
DATABASE_URI=postgresql://[YourUsername]:[YourPassword]@localhost/[YourDatabaseName]
DATABASE_PASSWORD=[YourPassword]
DATABASE_USER=[YourUsername]
DATABASE_NAME=[YourDatabaseName]
DATABASE_HOST=localhost
DATABASE_PORT=5432
AES_ENCRYPTION_KEY=[Your32ByteBase64EncodedKey]
SECRET_KEY=[YourSecretKey]
```

4. Run the database setup script:
   ```bash
   python setup_db.py
   ```

### Firebase Authentication Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. `cd client`
4. Create `.env.local` file:

```env
REACT_APP_apiKey=[FirebaseAPIKey]
REACT_APP_authDomain=[FirebaseAuthDomain]
REACT_APP_projectId=[FirebaseProjectID]
REACT_APP_storageBucket=[FirebaseBucket]
REACT_APP_messagingSenderId=[FirebaseSenderID]
REACT_APP_appId=[FirebaseAppID]
REACT_APP_measurementId=[FirebaseMeasurementID]
REACT_APP_API_BASE_URL=http://127.0.0.1:5000
```

### Generating Encryption Key

To generate an AES encryption key for sensitive data:

```python
from Crypto.Random import get_random_bytes
import base64

AES_ENCRYPTION_KEY = base64.b64encode(get_random_bytes(32)).decode()
print(AES_ENCRYPTION_KEY)
```

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

## Running Tests

1. `cd backend/tests`
2. `pip install -r test-requirements.txt`
3. `python -m pytest`

## License

MIT
