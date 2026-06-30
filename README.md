# Sevadham App - Complete Setup Guide

A complete free, end-to-end Android app development stack using:
- **Backend**: FastAPI (Python)
- **Frontend**: React Native with Expo
- **Database**: Google Sheets (no traditional DB)
- **Testing**: Expo Go (free)
- **Tunneling**: ngrok (for remote testing)

## Project Structure

```
sevadham-app/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py            # Main API endpoints
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment template
│   ├── setup.bat               # Windows setup
│   ├── setup.sh                # Mac/Linux setup
│   └── README.md               # Backend docs
│
└── frontend/                   # React Native with Expo
    ├── App.js                  # Main app component
    ├── index.js                # Entry point
    ├── package.json            # Dependencies
    ├── app.json                # Expo configuration
    ├── src/
    │   └── api.js              # API configuration
    └── README.md               # Frontend docs
```

---

## QUICK START (5 minutes)

### Step 1: Set up Backend

```bash
cd backend

# Windows
setup.bat

# Mac/Linux
chmod +x setup.sh
./setup.sh
```

### Step 2: Start Backend Server

```bash
# Windows
venv\Scripts\activate
python -m uvicorn app.main:app --reload

# Mac/Linux
source venv/bin/activate
python -m uvicorn app.main:app --reload
```

✅ Backend running at: `http://localhost:8000`

### Step 3: Expose Backend with ngrok

Open another terminal:
```bash
ngrok http 8000
```

📌 **Copy the ngrok URL** (looks like: `https://xxx-xxx-xxx-xxx.ngrok.io`)

### Step 4: Set up Frontend

```bash
cd frontend
npm install
```

### Step 5: Update API URL in Frontend

Edit `frontend/src/api.js`:

```javascript
// Change this line:
const API_BASE_URL = 'http://localhost:8000';

// To your ngrok URL:
const API_BASE_URL = 'https://xxx-xxx-xxx-xxx.ngrok.io';
```

### Step 6: Start Expo Development Server

```bash
npm start
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:19000
› Scan the QR code above with Expo Go (Android/iOS)
```

### Step 7: Test on Your Phone

1. **Download Expo Go** app from Google Play Store (Android) or App Store (iOS)
2. **Open Expo Go** on your phone
3. **Scan the QR code** from terminal
4. **See the app load!**

### Step 8: Test the Connection

Once app loads:
- Tap **📢 Say Hello** button
- Should see: "Hello from Sevadham Backend!"

✅ **Congratulations! Full stack working end-to-end!**

---

## DETAILED SETUP

### Backend Installation

#### Prerequisites
- Python 3.9 or higher
- pip

#### Installation Steps

```bash
cd backend

# 1. Create virtual environment
python -m venv venv

# 2. Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment file
copy .env.example .env
# or
cp .env.example .env
```

#### Running Backend

```bash
# Make sure venv is activated
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Verify Backend

Open browser and visit:
- `http://localhost:8000/hello` - Should return: `{"message": "Hello from Sevadham Backend!", "status": "success"}`
- `http://localhost:8000/docs` - Swagger API documentation
- `http://localhost:8000/redoc` - ReDoc documentation

---

### Frontend Installation

#### Prerequisites
- Node.js 16+ (download from nodejs.org)
- npm (comes with Node.js)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on phone (free)

#### Installation Steps

```bash
cd frontend

# Install dependencies
npm install
```

#### Running Frontend

```bash
# Start Expo development server
npm start
```

#### First Run Checklist

- [ ] Backend is running (`http://localhost:8000/hello` works)
- [ ] ngrok is exposing backend (`ngrok http 8000` running)
- [ ] API URL in `frontend/src/api.js` is updated
- [ ] `npm start` shows QR code
- [ ] Expo Go installed on phone
- [ ] Scanned QR code with Expo Go

---

## API ENDPOINTS

### Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "message": "Backend is running!"
}
```

### Hello World
```
GET /hello
```
Response:
```json
{
  "message": "Hello from Sevadham Backend!",
  "status": "success"
}
```

### Submit Form (for Google Sheets)
```
POST /submit-form?name=John&email=john@example.com&message=Hello
```
Response:
```json
{
  "status": "success",
  "message": "Form submitted successfully!",
  "data": {
    "name": "John",
    "email": "john@example.com",
    "message": "Hello"
  }
}
```

---

## TESTING GUIDE

### Local Testing (Laptop/PC Only)

```bash
# Terminal 1: Start backend
cd backend
venv\Scripts\activate  # Windows or source venv/bin/activate
python -m uvicorn app.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm start
# Press 'w' for web preview
# Or press 'a' for Android emulator
```

### Remote Testing on Phone (Using Expo Go)

```bash
# Terminal 1: Start backend
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload

# Terminal 2: Expose with ngrok
ngrok http 8000
# Copy the URL!

# Terminal 3: Update frontend API URL
# Edit: frontend/src/api.js
# Change: const API_BASE_URL = 'https://your-ngrok-url.ngrok.io'

# Terminal 3/4: Start frontend
cd frontend
npm start
# Scan QR code with Expo Go on phone
```

### Troubleshooting

**Issue**: "Cannot reach backend"
- Solution: Make sure ngrok URL is correctly set in `frontend/src/api.js`

**Issue**: "Expo Go can't connect to dev server"
- Solution: Make sure you're on same WiFi network
- Or use ngrok to tunnel Expo: `ngrok http 19000`

**Issue**: "CORS error"
- Solution: Backend already has CORS enabled for development
- Check that backend is running

**Issue**: "Module not found errors"
- Solution: Run `npm install` in frontend directory
- Run `pip install -r requirements.txt` in backend directory

---

## NEXT STEPS

### 1. Add Google Sheets Integration
See `backend/app/main.py` - TODO section
Uses: `gspread` library

### 2. Add More API Endpoints
Edit `backend/app/main.py` to add features

### 3. Create Better UI
Edit `frontend/App.js` to design your app

### 4. Deploy to Production
- Backend: Heroku, Render, PythonAnywhere (free tier)
- Frontend: Expo Application Services (EAS)
- Data: Google Sheets (free)

---

## FILE DESCRIPTIONS

### Backend Files

**`app/main.py`**
- Main FastAPI application
- Contains all API endpoints
- CORS configuration
- Error handling

**`requirements.txt`**
- Python package dependencies
- FastAPI, uvicorn, gspread, etc.

**`.env.example`**
- Template for environment variables
- Copy to `.env` and fill in your values

**`setup.bat` / `setup.sh`**
- Automated setup scripts
- Creates virtual environment
- Installs dependencies

### Frontend Files

**`App.js`**
- Main React Native component
- "Hello World" UI
- Button handlers
- API integration

**`src/api.js`**
- API configuration
- Base URL setup
- API call helper function

**`app.json`**
- Expo configuration
- App metadata
- Permissions
- Build settings

**`package.json`**
- npm dependencies
- Scripts (start, android, ios, web)

---

## COST BREAKDOWN

- ✅ **Backend (FastAPI)**: FREE (self-hosted or free tier)
- ✅ **Frontend (React Native/Expo)**: FREE
- ✅ **Testing (Expo Go)**: FREE
- ✅ **Tunneling (ngrok)**: FREE tier available
- ✅ **Database (Google Sheets)**: FREE (Google account)
- ✅ **Total**: **$0**

---

## KEY FEATURES

- 🚀 Zero cost development
- 📱 Test directly on Android phone
- 🔄 Hot reload development
- 🌐 Expo Go (no build required)
- 🔗 ngrok tunneling included
- 📊 Google Sheets database ready
- 📝 Simple form submission ready
- 🎨 Clean UI with Material Design
- ⚡ Fast API with FastAPI framework
- 🔌 CORS enabled for development

---

## SUPPORT & DOCUMENTATION

### Backend Docs
- Visit: `http://localhost:8000/docs` (Swagger UI)
- Visit: `http://localhost:8000/redoc` (ReDoc)

### Frontend Docs
- Expo: https://docs.expo.dev
- React Native: https://reactnative.dev
- API Integration: See `frontend/src/api.js`

### External Resources
- FastAPI: https://fastapi.tiangolo.com
- React Native: https://reactnative.dev
- Expo: https://expo.dev
- ngrok: https://ngrok.com

---

## COMMON COMMANDS

### Backend

```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Start server with hot reload
python -m uvicorn app.main:app --reload

# Start server on specific port
python -m uvicorn app.main:app --port 8001

# Start server on all interfaces
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Android emulator
npm run android

# iOS simulator
npm run ios

# Web browser
npm run web

# Clear cache and restart
npm start -- --clear
```

### ngrok

```bash
# Tunnel port 8000
ngrok http 8000

# Tunnel with custom subdomain (requires account)
ngrok http 8000 --subdomain myapp

# View ngrok dashboard
ngrok dashboard
```

---

## READY TO START?

1. Open 2 terminals
2. Terminal 1: `cd backend && setup.bat && venv\Scripts\activate && python -m uvicorn app.main:app --reload`
3. Terminal 2: `ngrok http 8000`
4. Terminal 3: Update API URL in frontend
5. Terminal 4: `cd frontend && npm install && npm start`
6. Scan QR with Expo Go on phone
7. Tap "📢 Say Hello"
8. Celebrate! 🎉

**Happy coding!**
