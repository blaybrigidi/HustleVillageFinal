# Hustle Village - Service Exchange Platform

A full-stack service marketplace application with React frontend and Node.js backend.

## Project Structure

```
HustleVillageFinal/
├── frontend/          # React + Vite + TypeScript frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js + Express API backend
│   ├── src/
│   ├── index.js
│   └── package.json
└── package.json       # Root package.json with convenience scripts
```

## Quick Start

### Run Frontend Only
```bash
npm run dev
```
or
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

### Run Backend Only
```bash
npm run dev:backend
```
or
```bash
cd backend
npm start
```

### Run Both Frontend & Backend
```bash
npm run dev:all
```
(Note: Requires `concurrently` package to be installed globally or in root)

## Setup

### First Time Setup

1. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

Or install both at once from root:
```bash
npm run install:all
```

### Environment Variables

Check the respective directories for `.env.example` files and create your own `.env` files with the required configuration.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Supabase Client
- React Query

### Backend
- Node.js
- Express
- (Add your backend dependencies here)

## Development

- Frontend runs on port `5173` by default
- Backend port configuration in backend files

## Building for Production

```bash
npm run build
```

This builds the frontend for production in `frontend/dist`.

