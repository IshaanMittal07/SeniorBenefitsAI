# API Documentation

## Base URL
- **Development**: http://localhost:3000
- **Production**: https://api.seniorbenefits.ca (configure after deployment)

## Authentication

All endpoints (except signup/login) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens expire after 24 hours.

## Endpoints

### Authentication

#### POST /auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt-token"
}
```

#### POST /auth/login
Login to an existing account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response:** Same as signup

#### GET /auth/me
Get current user information.

**Headers:** Authorization required

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /auth/logout
Logout the current user.

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### User Profiles

#### POST /profiles
Create a new user profile.

**Headers:** Authorization required

**Request:**
```json
{
  "age": 72,
  "province": "ON",
  "postal_code": "M5V3A8",
  "residency_status": "canadian_citizen",
  "income_range": "low",
  "medical_conditions": ["arthritis", "diabetes"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "age": 72,
  "province": "ON",
  "postal_code": "M5V3A8",
  "residency_status": "canadian_citizen",
  "income_range": "low",
  "medical_conditions": ["arthritis", "diabetes"],
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### GET /profiles
Get the current user's profile.

**Headers:** Authorization required

**Response:** User profile object (see POST response)

#### PUT /profiles
Update the current user's profile.

**Headers:** Authorization required

**Request:** Same fields as POST (all optional)

**Response:** Updated profile object

### Recommendations

#### POST /recommendations
Get benefit recommendations for the user's profile.

**Headers:** Authorization required

**Request:**
```json
{}
```

**Response:**
```json
{
  "profile_id": "uuid",
  "user_id": "uuid",
  "recommendations": [
    {
      "benefit_id": "uuid",
      "benefit_name": "Old Age Security (OAS)",
      "provider": "Service Canada",
      "match_score": 95,
      "eligibility_reasons": [
        "Meets minimum age requirement (65+)",
        "Available in ON"
      ],
      "application_url": "https://www.canada.ca/...",
      "phone_number": "1-877-464-6742"
    }
  ],
  "total_matches": 5,
  "generated_at": "2024-01-15T10:00:00Z"
}
```

#### GET /recommendations/benefits
Get list of all available benefits.

**Response:**
```json
{
  "total": 20,
  "benefits": [
    {
      "id": "uuid",
      "name": "Old Age Security (OAS)",
      "description": "Monthly pension for Canadian seniors...",
      "provider": "Service Canada",
      "minimum_age": 65,
      "provinces": ["AB", "BC", "SK", "MB", "ON", ...],
      ...
    }
  ]
}
```

#### GET /recommendations/benefits/:benefitId
Get details for a specific benefit including eligibility for user's profile.

**Headers:** Authorization required

**Response:**
```json
{
  "benefit": {
    "id": "uuid",
    "name": "Old Age Security (OAS)",
    ...
  },
  "eligibility_score": 95,
  "is_eligible": true,
  "reasons": ["Meets minimum age requirement", ...],
  "next_steps": [
    "Visit https://... to apply online",
    "Call 1-877-464-6742 for information",
    ...
  ]
}
```

#### POST /recommendations/natural-language
Get recommendations based on natural language query.

**Request:**
```json
{
  "query": "I'm a 72-year-old immigrant in Ontario with arthritis and low income. What benefits can I get?"
}
```

**Response:**
```json
{
  "query": "I'm a 72-year-old immigrant...",
  "parsed_profile": {
    "age": 72,
    "province": "ON",
    "residencyStatus": "permanent_resident",
    "incomeLevel": "low",
    "medicalConditions": ["arthritis"]
  },
  "recommendations": {
    "benefits": ["Old Age Security (OAS)", "Guaranteed Income Supplement (GIS)", ...],
    "explanation": "Based on your profile, you're eligible for several government benefits...",
    "nextSteps": [
      "Contact Service Canada at 1-877-464-6742",
      ...
    ]
  },
  "generated_at": "2024-01-15T10:00:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Profile not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- 100 requests per minute per IP address
- 10 recommendations per hour per user

## CORS

CORS is enabled for:
- `http://localhost:3000` (development)
- `https://seniorbenefits.ca` (production)
- `https://www.seniorbenefits.ca` (production)

## Pagination

List endpoints support pagination with query parameters:
- `?limit=20` - Number of results (default 20, max 100)
- `?offset=0` - Offset from start (default 0)

## Status Codes

- **200 OK** - Successful request
- **201 Created** - Resource created
- **400 Bad Request** - Invalid request
- **401 Unauthorized** - Authentication required
- **404 Not Found** - Resource not found
- **409 Conflict** - Conflict (e.g., duplicate email)
- **500 Internal Server Error** - Server error

## Examples

### cURL Examples

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

#### Create Profile
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

#### Get Recommendations
```bash
curl -X POST http://localhost:3000/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Natural Language Query
```bash
curl -X POST http://localhost:3000/recommendations/natural-language \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What benefits can a 70-year-old with diabetes get in BC?"
  }'
```

## Support

For API issues, please contact: api-support@seniorbenefits.ca

Last Updated: February 2024
