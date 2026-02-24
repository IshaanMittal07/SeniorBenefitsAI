# Development Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (local or remote)
- Git
- AWS Account (for cloud deployment)
- OpenAI API key

## Local Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd senior-benefits-app
npm run install-all
```

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Create database
createdb seniors_db

# Set up environment
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your PostgreSQL connection:
```
DATABASE_URL=postgres://postgres:password@localhost:5432/seniors_db
JWT_SECRET=dev-secret-key
OPENAI_API_KEY=sk-your-key
NODE_ENV=development
PORT=3000
```

#### Option B: Docker PostgreSQL

```bash
docker run --name seniors-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=seniors_db \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Run Migrations and Seeds

```bash
npm run db:migrate
npm run db:seed
```

### 4. Frontend Configuration

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_AWS_REGION=us-east-1
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend
npm run frontend:dev
```

Visit http://localhost:3000

## Testing Workflow

### 1. Create Account

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Save the returned token.

### 2. Create Profile

```bash
curl -X POST http://localhost:3000/profiles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 72,
    "province": "ON",
    "postal_code": "M5V3A8",
    "residency_status": "canadian_citizen",
    "income_range": "low",
    "medical_conditions": ["arthritis", "diabetes"]
  }'
```

### 3. Get Recommendations

```bash
curl -X POST http://localhost:3000/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4. Natural Language Query

```bash
curl -X POST http://localhost:3000/recommendations/natural-language \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I am a 70 year old immigrant in Ontario with diabetes"
  }'
```

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgres://user:pass@localhost:5432/db |
| JWT_SECRET | Secret for JWT signing | your-secret-key-change-in-production |
| OPENAI_API_KEY | OpenAI API key | sk-your-key |
| AWS_REGION | AWS region | us-east-1 |
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:3000 |
| REACT_APP_AWS_REGION | AWS region | us-east-1 |

## Common Issues

### Issue: "Cannot find module pg"
**Solution**: Run `npm run backend:install`

### Issue: "Database connection refused"
**Solution**: Check PostgreSQL is running and DATABASE_URL is correct

### Issue: "CORS error"
**Solution**: Ensure backend is running on http://localhost:3000 and REACT_APP_API_URL is configured correctly

### Issue: "OpenAI API key error"
**Solution**: Verify OPENAI_API_KEY is set and has valid permissions

## Project Structure

```
backend/
  ├── src/
  │   ├── index.ts              # Express server
  │   ├── config/               # Configuration
  │   ├── controllers/          # Route handlers
  │   ├── services/             # Business logic
  │   │   ├── llmService.ts    # LLM integration
  │   │   └── benefitMatchingService.ts
  │   ├── models/               # Data models
  │   ├── routes/               # API routes
  │   ├── middleware/           # Express middleware
  │   └── lambda/               # AWS Lambda handler
  ├── migrations/               # Database migrations
  └── seeds/                    # Seed data

frontend/
  ├── src/
  │   ├── App.tsx              # Main component
  │   ├── components/          # React components
  │   ├── pages/               # Page components
  │   ├── services/            # API client
  │   └── types/               # TypeScript types
```

## Debugging

### Backend Debugging

```bash
# Enable debug logging
DEBUG=* npm run backend:dev

# Use VSCode debugger
node --inspect-brk ./node_modules/.bin/ts-node src/index.ts
```

### Frontend Debugging

Use React DevTools browser extension.

## Building for Production

### Backend

```bash
npm run backend:build
npm run backend:start
```

### Frontend

```bash
npm run frontend:build
```

Output in `frontend/build/` directory, ready for deployment.

## Database Maintenance

### Backup

```bash
pg_dump -h localhost -U postgres seniors_db > backup.sql
```

### Restore

```bash
psql -h localhost -U postgres -d seniors_db < backup.sql
```

## Performance Tips

1. **Database**
   - Add indexes for frequently queried columns
   - Use connection pooling
   - Monitor slow queries

2. **API**
   - Implement caching
   - Use pagination for large datasets
   - Monitor response times

3. **Frontend**
   - Code splitting for React routes
   - Lazy load components
   - Optimize bundle size

## Resources

- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API Guide](https://platform.openai.com/docs/api-reference)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
