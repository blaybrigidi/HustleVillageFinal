# HustleVillage Setup Guide

This guide will help you set up and run both the backend and frontend of HustleVillage on your local machine.

## Project Structure

```
HustleVillageFinal/
├── backend (root folder)
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/
│   │   │   └── services/
│   │   ├── config/
│   │   ├── middleware/
│   │   └── routes/
│   ├── index.js
│   └── package.json
│
└── village-service-exchange-main/village-service-exchange-main/
    └── frontend
        ├── src/
        ├── public/
        ├── package.json
        └── vite.config.ts
```

## Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

## Backend Setup (Node.js + Express)

### Step 1: Navigate to Backend Directory
```bash
cd C:\Users\eddie\HustleVillageFinal
```

### Step 2: Create Environment File

Create a `.env` file in the root directory with the following content:

```env
# Environment Configuration
NODE_ENV=development
PORT=3000

# Supabase Configuration
DB_PROJECT_URL=https://unddxlhlszgzprahjbvt.supabase.co
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZGR4bGhsc3pnenByYWhqYnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDg1NDYsImV4cCI6MjA3ODE4NDU0Nn0.yN2uTx-qpfpzhzbG0Duh3grH3NPfHn4FkKyk6GGSB2w
SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration
JWT_SECRET=hustle_village_secret_2024_change_this
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:8080
```

**Note:** Replace `your_service_role_key_here` with your actual Supabase Service Role Key from your Supabase project settings.

### Step 3: Install Backend Dependencies
```bash
npm install
```

### Step 4: Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

The backend will start on **http://localhost:3000**

### Backend API Endpoints

- **Health Check**: `GET http://localhost:3000/health`
- **Auth**: `http://localhost:3000/api/auth/*`
- **Buyer**: `http://localhost:3000/api/buyer/*`
- **Hustler**: `http://localhost:3000/api/hustler/*`
- **Admin**: `http://localhost:3000/api/admin/*`

## Frontend Setup (React + TypeScript + Vite)

### Step 1: Navigate to Frontend Directory
```bash
cd village-service-exchange-main\village-service-exchange-main
```

### Step 2: Create Environment File (Optional)

Create a `.env` file in the frontend directory if you want to customize the API URL:

```env
VITE_API_URL=http://localhost:3000/api
```

### Step 3: Install Frontend Dependencies
```bash
npm install
```

### Step 4: Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on **http://localhost:8080**

## Testing the Connection

### 1. Test Backend Health
Open a new terminal and run:
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-11-10T..."
}
```

Or visit http://localhost:3000 in your browser to see:
```json
{
  "message": "Welcome to HustleVillage API",
  "status": "Server is running"
}
```

### 2. Test Frontend
Open your browser and navigate to:
```
http://localhost:8080
```

You should see the HustleVillage landing page.

### 3. Test Frontend-Backend Connection

You can test the API connection from the frontend by:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
fetch('http://localhost:3000/health')
  .then(res => res.json())
  .then(data => console.log('Backend connection successful:', data))
  .catch(err => console.error('Backend connection failed:', err));
```

## Using the API in Frontend

I've created an API helper file at `src/lib/api.ts` in the frontend. You can use it like this:

```typescript
import api from '@/lib/api';

// Example: Get services
const services = await api.buyer.getServices();

// Example: Create a service
const newService = await api.hustler.createService({
  title: 'Service Title',
  description: 'Service Description',
  price: 50,
});

// Example: Check backend health
const health = await api.health();
```

## Running Both Servers Simultaneously

### Option 1: Two Terminal Windows
1. **Terminal 1** (Backend):
   ```bash
   cd C:\Users\eddie\HustleVillageFinal
   npm run dev
   ```

2. **Terminal 2** (Frontend):
   ```bash
   cd C:\Users\eddie\HustleVillageFinal\village-service-exchange-main\village-service-exchange-main
   npm run dev
   ```

### Option 2: Using PowerShell Start-Job (Windows)
```powershell
# Start Backend
Start-Job -ScriptBlock { cd C:\Users\eddie\HustleVillageFinal; npm run dev }

# Start Frontend
Start-Job -ScriptBlock { cd C:\Users\eddie\HustleVillageFinal\village-service-exchange-main\village-service-exchange-main; npm run dev }

# Check jobs
Get-Job

# View output
Get-Job | Receive-Job

# Stop all jobs when done
Get-Job | Stop-Job
Get-Job | Remove-Job
```

## Common Issues & Troubleshooting

### Issue 1: Port Already in Use
If port 3000 or 8080 is already in use:

**Backend:**
- Change PORT in `.env` file to another port (e.g., 3001)

**Frontend:**
- Change port in `vite.config.ts`:
```typescript
server: {
  port: 8081, // Change this
}
```

### Issue 2: CORS Errors
If you see CORS errors in the browser console:
- Make sure both servers are running
- Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
- Clear browser cache and reload

### Issue 3: Database Connection Issues
If you see database errors:
- Verify your Supabase credentials in `.env`
- Check that your Supabase project is active
- Ensure your IP is allowed in Supabase settings

### Issue 4: Module Not Found
If you see "Cannot find module" errors:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Project URLs Summary

| Service | URL | Port |
|---------|-----|------|
| **Backend API** | http://localhost:3000 | 3000 |
| **Frontend** | http://localhost:8080 | 8080 |
| **API Health** | http://localhost:3000/health | - |
| **API Base** | http://localhost:3000/api | - |

## Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies for both projects
3. ✅ Start both servers
4. ✅ Test the connection
5. 🔄 Start developing!

## Additional Commands

### Backend
```bash
npm start          # Start in production mode
npm run dev        # Start with nodemon (auto-reload)
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Support

If you encounter any issues:
1. Check that both servers are running
2. Verify environment variables are set correctly
3. Check console/terminal for error messages
4. Ensure all dependencies are installed

---

Happy coding! 🚀

