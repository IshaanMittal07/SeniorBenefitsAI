# Senior Benefits Recommendation System

A comprehensive web application that helps Canadian senior citizens discover eligible government and health benefit programs based on their profile, location, and medical conditions.

## 🎯 Features

- **User Profile Management**: Create and manage senior citizen profiles with age, location, residency status, income, and medical conditions
- **Smart Benefit Matching**: AI-powered eligibility matching using LLM integration
- **Natural Language Queries**: Ask questions like "What benefits can a 70 year old immigrant in Ontario with diabetes get?"
- **Location-Based Filtering**: Province and postal code-based recommendations
- **Secure Authentication**: AWS Cognito integration
- **Responsive UI**: Modern React + TypeScript frontend
- **Scalable Backend**: Serverless Express API with AWS Lambda support
- **Comprehensive Database**: PostgreSQL with comprehensive benefits and eligibility rules

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TS)                    │
│                  User Profiles & Dashboards                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         API Gateway & Lambda (Express Backend)               │
│         Authentication, User Mgmt, Recommendations           │
└────────┬────────────────────────────┬──────────────────────┘
         │                            │
    ┌────▼──────┐           ┌────────▼─────────┐
    │ RDS       │           │   S3 Storage     │
    │ PostgreSQL│           │   (Assets, etc)  │
    └───────────┘           └──────────────────┘
         │
    ┌────▼──────────────────────┐
    │  Cognito (Authentication) │
    └───────────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ OpenAI/Bedrock (LLM)       │
    │ Benefit Recommendations    │
    └───────────────────────────┘
```

## 📁 Project Structure

```
senior-benefits-app/
├── backend/                    # Express.js server
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Utility functions
│   │   └── lambda/            # AWS Lambda handlers
│   ├── migrations/            # Database migrations
│   ├── seeds/                 # Seed data
│   ├── tests/                 # Unit tests
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                   # React application
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom hooks
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── database/                   # Database schema & scripts
│   ├── schema.sql             # PostgreSQL schema
│   ├── migrations/            # Migration files
│   └── seeds/                 # Seed data SQL
├── infrastructure/            # AWS infrastructure as code
│   ├── terraform/             # Terraform files
│   └── cloudformation/        # CloudFormation templates
├── .github/
│   └── copilot-instructions.md
├── package.json              # Root package.json
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- AWS Account (for deployment)
- PostgreSQL database
- OpenAI API key or AWS Bedrock access

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd senior-benefits-app
```

2. Install dependencies
```bash
npm run install-all
```

3. Set up environment variables
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env
```

4. Configure database
```bash
npm run db:migrate
npm run db:seed
```

5. Start development servers
```bash
npm run dev
```

## 🔧 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Axios** for HTTP requests
- **AWS Amplify** for Cognito integration
- **React Router** for navigation

### Backend
- **Express.js** REST framework
- **TypeScript** for type safety
- **PostgreSQL** with Knex.js ORM
- **AWS SDK** for Lambda/Cognito/S3 integration
- **OpenAI SDK** for LLM integration
- **JWT** for token validation

### Database
- **PostgreSQL 14+**
- **AWS RDS** for hosting
- **Knex.js** for migrations and seeding

### Cloud Infrastructure
- **AWS Lambda** for serverless compute
- **AWS API Gateway** for REST API
- **AWS Cognito** for authentication
- **AWS RDS** for database
- **AWS S3** for file storage
- **AWS CloudWatch** for logging

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh auth token

### Profile Endpoints
- `POST /profiles` - Create user profile
- `GET /profiles/:id` - Get user profile
- `PUT /profiles/:id` - Update user profile
- `DELETE /profiles/:id` - Delete user profile

### Recommendations Endpoints
- `POST /recommendations` - Get benefit recommendations
- `POST /recommendations/natural-language` - Natural language queries
- `GET /recommendations/benefits` - List all benefits
- `GET /recommendations/benefits/:id` - Get benefit details

## 🔐 Security Features

- AWS Cognito for OAuth2/OIDC authentication
- JWT token validation middleware
- Password hashing with bcrypt
- SQL injection prevention via parameterized queries
- CORS configuration
- Environment variable protection
- API rate limiting
- HTTPS enforcement (in production)

## 🤖 LLM Integration

The system uses OpenAI API (or Amazon Bedrock) to:
- Parse natural language benefit queries
- Generate personalized benefit recommendations
- Explain eligibility criteria in conversational language
- Suggest relevant programs based on user context

Example:
```
User: "I'm a 72-year-old immigrant in Toronto with arthritis and low income"
LLM Response: "Based on your profile, you may be eligible for:
1. OAS (Old Age Security) + GIS (Guaranteed Income Supplement)
2. ODSP (Ontario Disability Support Program)
3. Local Health Integration Network benefits
..."
```

## 📊 Database Schema

Key tables:
- `users` - User accounts
- `user_profiles` - Senior citizen profiles
- `benefits` - Available government/health benefits
- `benefit_eligibility_rules` - Eligibility criteria
- `user_benefit_history` - Benefit recommendations history
- `medical_conditions` - Reference data for conditions
- `provinces` - Canadian provinces and territories

## 🧪 Testing

```bash
# Backend tests
npm run backend:test

# Frontend tests
npm run frontend:test
```

## 📦 Deployment

### AWS Lambda Deployment
```bash
cd backend
npm run build
npm run deploy:lambda
```

### Frontend Deployment (S3 + CloudFront)
```bash
cd frontend
npm run build
npm run deploy:s3
```

## 🔄 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgres://user:pass@host:5432/seniors_db
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_xxx
AWS_COGNITO_CLIENT_ID=xxx
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_DOMAIN=https://xxx.auth.us-east-1.amazoncognito.com
REACT_APP_COGNITO_CLIENT_ID=xxx
REACT_APP_COGNITO_REDIRECT_URI=http://localhost:3000
```

## 📝 API Examples

### Create User Profile
```bash
curl -X POST http://localhost:3000/profiles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 72,
    "province": "ON",
    "residency_status": "permanent_resident",
    "income_range": "low",
    "medical_conditions": ["arthritis", "diabetes"]
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:3000/recommendations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "uuid-here"
  }'
```

### Natural Language Query
```bash
curl -X POST http://localhost:3000/recommendations/natural-language \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What benefits can I get as a 70-year-old immigrant in Ontario with diabetes?"
  }'
```

## 🤝 Contributing

1. Create a feature branch
2. Make changes with clear commits
3. Add tests for new features
4. Submit pull request

## 📄 License

MIT License

## 📞 Support

For issues or questions, please open a GitHub issue or contact the development team.

---

**Last Updated**: February 2026
