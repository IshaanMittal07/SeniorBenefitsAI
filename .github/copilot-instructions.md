# Senior Benefits App - Development Instructions

This is a full-stack application for Canadian senior benefits recommendations using React, Express, PostgreSQL, and AWS services.

## Project Overview
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript with AWS Lambda integration
- **Database**: PostgreSQL on AWS RDS
- **Cloud**: AWS (Lambda, API Gateway, Cognito, RDS, S3)
- **LLM**: OpenAI API integration
- **Auth**: AWS Cognito

## Key Features
1. User profile creation for senior citizens
2. AWS Cognito authentication
3. REST API for profile management
4. PostgreSQL database with benefits schema
5. Smart benefit eligibility matching
6. LLM integration for natural language queries
7. Location-based filtering (province/postal code)
8. Recommendations endpoint with ranked suggestions
9. Lambda deployment ready
10. Canadian senior benefits seed data

## Development Checklist

- [ ] Install root dependencies
- [ ] Install backend dependencies
- [ ] Install frontend dependencies
- [ ] Configure backend environment variables
- [ ] Configure frontend environment variables
- [ ] Set up PostgreSQL database locally
- [ ] Run database migrations
- [ ] Seed database with benefits data
- [ ] Start backend server
- [ ] Start frontend development server
- [ ] Test authentication flow
- [ ] Test profile creation
- [ ] Test recommendations endpoint
- [ ] Test LLM integration
- [ ] Verify AWS configuration
- [ ] Deploy to AWS Lambda

## Quick Commands

```bash
# Install all dependencies
npm run install-all

# Development mode
npm run dev

# Backend only
npm run backend:dev

# Frontend only
npm run frontend:dev

# Database setup
npm run db:migrate
npm run db:seed

# Build for production
npm run backend:build
npm run frontend:build
```

## Important Configuration Files

### Backend
- `backend/src/config/database.ts` - Database connection config
- `backend/src/config/auth.ts` - Cognito configuration
- `backend/src/services/llmService.ts` - LLM integration
- `backend/src/services/benefitMatchingService.ts` - Matching logic

### Frontend
- `frontend/src/services/api.ts` - API client
- `frontend/src/components/ProfileForm.tsx` - Profile creation
- `frontend/src/components/Recommendations.tsx` - Recommendations display

### Database
- `database/schema.sql` - PostgreSQL schema
- `backend/migrations/` - Database migrations
- `backend/seeds/` - Seed data

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgres://user:password@localhost:5432/seniors_db
JWT_SECRET=your-jwt-secret-key
OPENAI_API_KEY=sk-your-openai-key
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=your-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_S3_BUCKET=your-bucket-name
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_DOMAIN=https://your-domain.auth.us-east-1.amazoncognito.com
REACT_APP_COGNITO_CLIENT_ID=your-client-id
REACT_APP_COGNITO_REDIRECT_URI=http://localhost:3000
```

## File Structure

```
senior-benefits-app/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── lambda/
│   ├── migrations/
│   ├── seeds/
│   ├── package.json
│   └── .env
├── frontend/                # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── .env
├── database/
│   ├── schema.sql
│   ├── migrations/
│   └── seeds/
└── infrastructure/
    ├── terraform/
    └── cloudformation/
```

## Next Steps

1. Review backend and frontend package.json files
2. Install all dependencies: `npm run install-all`
3. Configure environment variables in .env files
4. Set up local PostgreSQL database
5. Run migrations and seeds
6. Start development servers with `npm run dev`

## References

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
