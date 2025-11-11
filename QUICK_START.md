# 🚀 Quick Start Guide

## Super Fast Setup (5 minutes)

### 1️⃣ Create Environment File

Create a file named `.env` in the **backend root folder** (C:\Users\eddie\HustleVillageFinal):

```env
NODE_ENV=development
PORT=3000
DB_PROJECT_URL=https://unddxlhlszgzprahjbvt.supabase.co
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZGR4bGhsc3pnenByYWhqYnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDg1NDYsImV4cCI6MjA3ODE4NDU0Nn0.yN2uTx-qpfpzhzbG0Duh3grH3NPfHn4FkKyk6GGSB2w
SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=hustle_village_secret_2024
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8080
```

**⚠️ Important:** Get your `SERVICE_ROLE_KEY` from Supabase:
1. Go to https://app.supabase.com/project/unddxlhlszgzprahjbvt/settings/api
2. Copy the "service_role" secret key
3. Replace `your_service_role_key_here` with it

### 2️⃣ Install Dependencies

Open PowerShell and run:

```powershell
# Install backend dependencies
cd C:\Users\eddie\HustleVillageFinal
npm install

# Install frontend dependencies
cd village-service-exchange-main\village-service-exchange-main
npm install
```

### 3️⃣ Start Both Servers

**Option A: Using the Startup Script (Easiest)**
```powershell
cd C:\Users\eddie\HustleVillageFinal
.\start-dev.ps1
```

**Option B: Manual (Two Terminal Windows)**

**Terminal 1 - Backend:**
```powershell
cd C:\Users\eddie\HustleVillageFinal
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\eddie\HustleVillageFinal\village-service-exchange-main\village-service-exchange-main
npm run dev
```

### 4️⃣ Test It!

Open your browser and visit:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## ✅ You're Done!

Both servers should now be running and connected!

---

## 📚 Need More Details?

See the full [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:
- Detailed setup instructions
- Troubleshooting common issues
- API documentation
- Development tips

## 🆘 Quick Troubleshooting

### Problem: "Cannot find module"
```powershell
rm -rf node_modules
npm install
```

### Problem: "Port already in use"
- Close any applications using ports 3000 or 8080
- Or change the port in `.env` (backend) or `vite.config.ts` (frontend)

### Problem: CORS errors
- Make sure both servers are running
- Check that FRONTEND_URL in `.env` is `http://localhost:8080`
- Clear browser cache

### Problem: Database connection failed
- Verify your Supabase credentials in `.env`
- Make sure SERVICE_ROLE_KEY is correct

