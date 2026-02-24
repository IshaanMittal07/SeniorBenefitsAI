# Quick Start Guide

Get the Senior Benefits Application running in 5 minutes!

## 🚀 Express Setup (Development)

### 1. Clone & Install
```bash
cd /path/to/SeniorApp
npm run install-all
```

### 2. Setup Database

**Option A: PostgreSQL locally**
```bash
# Create database
createdb seniors_db

# Configure backend
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
DATABASE_URL=postgres://postgres:password@localhost:5432/seniors_db
JWT_SECRET=dev-secret-change-in-production
OPENAI_API_KEY=sk-your-openai-key
NODE_ENV=development
PORT=3000
```

**Option B: Docker**
```bash
docker run --name seniors-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=seniors_db -p 5432:5432 -d postgres:14
```

### 3. Setup Database Schema
```bash
npm run db:migrate
npm run db:seed
```

### 4. Setup Frontend
```bash
cp frontend/.env.example frontend/.env
```

### 5. Start Development
```bash
npm run dev
```

Then:
- Frontend: http://localhost:3000
- Backend: http://localhost:3000 (API)
- Database: localhost:5432

## 📱 Quick Test

### Create Account
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Copy the returned `token`.

### Create Profile
```bash
curl -X POST http://localhost:3000/profiles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 72,
    "province": "ON",
    "residency_status": "canadian_citizen",
    "income_range": "low",
    "medical_conditions": ["arthritis"]
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:3000/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 🏗️ Project Structure

```
SeniorApp/
├── backend/           # Express API
│   ├── src/          # TypeScript source
│   ├── migrations/   # DB migrations
│   └── seeds/        # Seed data
├── frontend/         # React app
│   ├── src/          # React components
│   └── public/       # Static assets
├── database/         # DB schema
├── infrastructure/   # AWS IaC
├── API.md           # API documentation
├── DEVELOPMENT.md   # Dev setup
└── DEPLOYMENT.md    # Deploy guide
```

## 📚 Next Steps

- **Add Features**: See CONTRIBUTING.md
- **Deploy**: See DEPLOYMENT.md
- **API Docs**: See API.md
- **Setup Guide**: See DEVELOPMENT.md

## 🛠️ Common Commands

```bash
# Start development
npm run dev

# Backend only
npm run backend:dev

# Frontend only
npm run frontend:dev

# Run tests
npm run backend:test
npm run frontend:test

# Build for production
npm run backend:build
npm run frontend:build

# Database
npm run db:migrate    # Run migrations
npm run db:seed      # Seed data
```

## ⚙️ Environment Variables

### Backend (backend/.env)
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing key
- `OPENAI_API_KEY` - OpenAI API key
- `AWS_REGION` - AWS region
- `NODE_ENV` - Environment
- `PORT` - Server port (default 3000)

### Frontend (frontend/.env)
- `REACT_APP_API_URL` - Backend API URL

## 🐛 Troubleshooting

**Can't connect to database?**
```bash
psql -h localhost -U postgres
# If error, start PostgreSQL or Docker container
```

**Port 3000 already in use?**
```bash
# Backend: Change PORT in .env
# Frontend: Run on different port
npm --prefix frontend start -- --port 3001
```

**Dependencies not installed?**
```bash
npm run install-all
```

**OPENAI_API_KEY error?**
- Get key from https://platform.openai.com/
- Add to backend/.env

## 📞 Support

- See DEVELOPMENT.md for detailed setup
- Check API.md for endpoint documentation
- Review source code comments for implementation details

---

**Ready to build?** Start with `npm run dev` and visit http://localhost:3000!
