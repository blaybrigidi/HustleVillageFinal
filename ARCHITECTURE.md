# HustleVillage Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                    http://localhost:8080                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│                    Port: 8080                                │
├─────────────────────────────────────────────────────────────┤
│  • React 18 + TypeScript                                     │
│  • Vite (Build Tool)                                         │
│  • React Router (Routing)                                    │
│  • Tailwind CSS + shadcn/ui (Styling)                        │
│  • Supabase Client (Direct DB Access)                        │
│                                                              │
│  Pages:                                                      │
│  ├── Landing (/)                                             │
│  ├── Login/Signup (/login, /signup)                          │
│  ├── Services (/services)                                    │
│  ├── Seller Dashboard (/seller/dashboard)                    │
│  └── Service Details (/services/:id)                         │
└────────────────┬──────────────────────┬─────────────────────┘
                 │                      │
                 │ HTTP/REST            │ Direct Connection
                 │                      │
                 ▼                      ▼
┌────────────────────────────┐  ┌─────────────────────────────┐
│   BACKEND API              │  │      SUPABASE               │
│   (Node.js + Express)      │  │   (Database + Auth)         │
│   Port: 3000               │  │                             │
├────────────────────────────┤  ├─────────────────────────────┤
│  • Express.js              │  │  • PostgreSQL Database      │
│  • JWT Authentication      │  │  • Auth (OTP Email)         │
│  • Supabase Client         │  │  • Row Level Security       │
│  • CORS Enabled            │  │  • Storage (Images)         │
│                            │  │  • Real-time Updates        │
│  Routes:                   │  │                             │
│  ├── /api/auth             │  │  Tables:                    │
│  ├── /api/buyer            │  │  ├── users                  │
│  ├── /api/hustler          │  │  ├── services               │
│  └── /api/admin            │  │  ├── bookings               │
└────────────────┬───────────┘  │  ├── reviews                │
                 │              │  └── categories             │
                 │              │                             │
                 └──────────────▶                             │
                  Supabase.js                                 │
                                └─────────────────────────────┘
```

## 📁 Project Structure

```
HustleVillageFinal/
│
├── 📂 BACKEND (Root Directory)
│   ├── index.js                    # Express server entry point
│   ├── package.json                # Backend dependencies
│   ├── .env                        # Environment variables
│   │
│   └── src/
│       ├── app/
│       │   ├── controllers/        # Request handlers
│       │   │   ├── authController.js
│       │   │   ├── buyerController.js
│       │   │   ├── hustlerController.js
│       │   │   └── adminController.js
│       │   │
│       │   └── services/           # Business logic
│       │       ├── authService.js
│       │       ├── buyerService.js
│       │       └── hustlerService.js
│       │
│       ├── config/
│       │   └── database.js         # Supabase connection
│       │
│       ├── middleware/
│       │   └── authMiddleware.js   # JWT verification
│       │
│       └── routes/
│           ├── index.js            # Main router
│           ├── authRoutes.js
│           ├── buyerRoutes.js
│           ├── hustlerRoutes.js
│           └── adminRoutes.js
│
└── 📂 FRONTEND (village-service-exchange-main)
    └── village-service-exchange-main/
        ├── index.html
        ├── package.json            # Frontend dependencies
        ├── vite.config.ts          # Vite configuration
        │
        └── src/
            ├── main.tsx            # App entry point
            ├── App.tsx             # Main app component
            │
            ├── components/         # Reusable components
            │   ├── landing/        # Landing page components
            │   ├── dashboard/      # Dashboard components
            │   ├── services/       # Service components
            │   └── ui/             # shadcn/ui components
            │
            ├── pages/              # Page components
            │   ├── Index.tsx       # Landing page
            │   ├── Login.tsx
            │   ├── Signup.tsx
            │   ├── Services.tsx
            │   └── seller/         # Seller dashboard pages
            │
            ├── contexts/           # React contexts
            │   └── AuthContext.tsx # Authentication context
            │
            ├── hooks/              # Custom React hooks
            │
            ├── lib/                # Utility libraries
            │   ├── api.ts          # API helper (NEW!)
            │   └── utils.ts        # General utilities
            │
            └── integrations/
                └── supabase/       # Supabase integration
                    ├── client.ts   # Supabase client
                    └── types.ts    # TypeScript types
```

## 🔄 Data Flow

### 1. User Authentication Flow
```
User → Frontend (Login Page)
  ↓
Frontend → Supabase Auth (OTP Email)
  ↓
User receives email → Enters OTP
  ↓
Frontend → Backend API (/api/auth/verify)
  ↓
Backend → Supabase (Verify & Create User)
  ↓
Backend → Frontend (JWT Token)
  ↓
Frontend stores token → User authenticated
```

### 2. Service Listing Flow (Buyer)
```
User → Frontend (Services Page)
  ↓
Frontend → Backend API (GET /api/buyer/services)
  ↓
Backend → Supabase (Query services table)
  ↓
Supabase → Backend (Service data)
  ↓
Backend → Frontend (JSON response)
  ↓
Frontend displays services
```

### 3. Service Creation Flow (Hustler)
```
Hustler → Frontend (Create Service Form)
  ↓
Frontend → Backend API (POST /api/hustler/services)
  ↓  [With JWT Token in header]
Backend validates token
  ↓
Backend → Supabase (Insert service)
  ↓
Supabase → Backend (Confirmation)
  ↓
Backend → Frontend (Success response)
  ↓
Frontend shows success message
```

## 🔐 Authentication Strategy

### Current Setup (Hybrid)
- **Frontend**: Uses Supabase Auth directly for OTP email
- **Backend**: Validates with JWT + Supabase
- **Token**: JWT stored in localStorage

### Flow:
```
1. User signs up → Supabase sends OTP email
2. User verifies OTP → Backend creates user profile
3. Backend issues JWT → Frontend stores JWT
4. API requests → Frontend sends JWT in headers
5. Backend validates JWT → Processes request
```

## 🌐 Network Configuration

### Development URLs
```
Frontend:  http://localhost:8080
Backend:   http://localhost:3000
API Base:  http://localhost:3000/api
```

### CORS Configuration
```javascript
// Backend allows requests from:
- http://localhost:8080  (Frontend)
- http://localhost:5173  (Vite alternative port)
```

## 🗄️ Database Schema (Supabase)

### Key Tables:
```sql
users
├── id (uuid, PK)
├── email (text)
├── full_name (text)
├── phone_number (text)
├── user_type (enum: 'buyer', 'hustler', 'admin')
├── is_verified (boolean)
└── created_at (timestamp)

services
├── id (uuid, PK)
├── hustler_id (uuid, FK → users)
├── title (text)
├── description (text)
├── price (decimal)
├── category (text)
├── status (enum: 'pending', 'active', 'paused')
├── images (text[])
└── created_at (timestamp)

bookings
├── id (uuid, PK)
├── service_id (uuid, FK → services)
├── buyer_id (uuid, FK → users)
├── status (enum: 'pending', 'confirmed', 'completed')
├── booking_date (timestamp)
└── created_at (timestamp)
```

## 🚀 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| React Router | Navigation |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| Supabase.js | Database Client |
| React Query | Data Fetching |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| Supabase.js | Database Client |
| JWT | Authentication |
| bcrypt | Password Hashing |
| dotenv | Environment Config |

### Database & Infrastructure
| Technology | Purpose |
|------------|---------|
| Supabase | Backend as a Service |
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Supabase Storage | File Storage |

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DB_PROJECT_URL=<supabase_url>
ANON_KEY=<supabase_anon_key>
SERVICE_ROLE_KEY=<supabase_service_key>
JWT_SECRET=<your_secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8080
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://localhost:3000/api
```

## 📊 Request Flow Example

### Example: Get All Services

```
1. User visits /services
   ↓
2. Frontend: useEffect(() => { fetchServices() })
   ↓
3. Frontend: fetch('http://localhost:3000/api/buyer/services')
   ↓
4. Backend: Route matches → buyerController.viewAllServices()
   ↓
5. Backend: buyerService.getAllServices()
   ↓
6. Backend: supabase.from('services').select(...)
   ↓
7. Supabase: Returns data
   ↓
8. Backend: res.json({ services: [...] })
   ↓
9. Frontend: Updates state, renders services
```

## 🎯 Current Features

### Implemented
✅ User authentication (OTP email)
✅ Service listing (buyer view)
✅ Service management (hustler CRUD)
✅ Admin dashboard
✅ Frontend-Backend connection (CORS)
✅ API helper library
✅ Protected routes

### In Progress
🔄 Booking system
🔄 Payment integration
🔄 Real-time notifications
🔄 Image upload
🔄 Reviews & ratings

## 🚦 Getting Started

1. **Clone & Install**
```bash
npm install  # Backend
cd village-service-exchange-main/village-service-exchange-main
npm install  # Frontend
```

2. **Configure Environment**
- Create `.env` in backend root
- Add Supabase credentials

3. **Start Servers**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd village-service-exchange-main/village-service-exchange-main
npm run dev
```

4. **Test Connection**
- Visit http://localhost:8080
- Open DevTools console
- Run: `fetch('http://localhost:3000/health')`

---

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

