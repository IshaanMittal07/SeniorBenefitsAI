# Deployment Guide

## Vercel (hosted demo)

The frontend can be hosted on Vercel without the backend, using **demo mode**. With `REACT_APP_DEMO_MODE=true`, the app runs entirely in the browser:

- accounts and profiles are stored in the visitor's `localStorage` (nothing is sent to a server)
- recommendations come from the bundled catalogue in `frontend/src/services/demo/benefitsCatalog.ts`
- questions are answered by a rule-based parser instead of OpenAI
- a banner at the top of every page says it is a demo

[`frontend/vercel.json`](frontend/vercel.json) configures this, with `frontend/` as the Vercel project root:

| Setting | Value |
|---|---|
| Install command | `npm ci` |
| Build command | `REACT_APP_DEMO_MODE=true npm run build` |
| Output directory | `build` |
| Rewrites | every path → `/index.html`, so deep links work |

### Deploy with the CLI

```bash
cd frontend
npx vercel login
npx vercel          # preview deployment
npx vercel --prod   # production deployment
```

### Deploy from GitHub

1. In the Vercel dashboard choose **Add New → Project** and import this repository.
2. Set **Root Directory** to `frontend`. `frontend/vercel.json` provides the build settings.
   The root must be `frontend`, not the repository root: at the root, Vercel detects both the React app and the Express backend and refuses to pick one.
3. Every push to `main` deploys to production, and every pull request gets a preview URL.

> Vercel sets `CI=1`, and Create React App then treats ESLint warnings as errors. Run `CI=true npm run build` in `frontend/` before pushing to catch them locally.

### Connecting a real backend later

To use the Express API instead of demo mode, deploy the backend (see [Backend Deployment to Lambda](#backend-deployment-to-lambda)). Then change the build command in `frontend/vercel.json` to `npm run build` and set `REACT_APP_API_URL` to the API's URL in the Vercel project's environment variables.

## AWS Infrastructure Deployment

### Prerequisites
- AWS Account with appropriate permissions
- Terraform installed (for IaC approach)
- AWS CLI configured
- PostgreSQL client tools

### Option 1: CloudFormation Deployment

```bash
# Create stack
aws cloudformation create-stack \
  --stack-name senior-benefits-stack \
  --template-body file://infrastructure/cloudformation/template.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=DBUsername,ParameterValue=postgres \
    ParameterKey=DBPassword,ParameterValue=your-secure-password

# Wait for stack creation
aws cloudformation wait stack-create-complete \
  --stack-name senior-benefits-stack

# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name senior-benefits-stack \
  --query 'Stacks[0].Outputs'
```

### Option 2: Terraform Deployment

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="db_password=your-secure-password"

# Apply configuration
terraform apply -var="db_password=your-secure-password"

# Get outputs
terraform output
```

## Backend Deployment to Lambda

```bash
cd backend

# Build project
npm run build

# Install serverless dependencies
npm install -g serverless

# Deploy using serverless framework
serverless deploy

# Or manually deploy to Lambda
zip -r lambda.zip dist node_modules
aws lambda create-function \
  --function-name senior-benefits-api \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/senior-benefits-lambda \
  --handler dist/lambda/handler.handler \
  --zip-file fileb://lambda.zip \
  --environment Variables={...}
```

## Frontend Deployment

```bash
cd frontend

# Build React app
npm run build

# Deploy to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Optional: Create CloudFront distribution for HTTPS
aws cloudfront create-distribution \
  --origin-domain-name your-bucket-name.s3.amazonaws.com \
  ...
```

## Database Setup

```bash
# Connect to RDS instance
psql -h your-db-endpoint -U postgres -d seniors_db

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

## Environment Variables for AWS Deployment

### Lambda Environment
```
DATABASE_URL=postgres://user:pass@rds-endpoint:5432/seniors_db
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-...
AWS_REGION=us-east-1
NODE_ENV=production
```

### API Gateway
- Configure CORS
- Enable API logging
- Set rate limiting
- Configure custom domain

## Monitoring and Logging

```bash
# View Lambda logs
aws logs tail /aws/lambda/senior-benefits-api --follow

# Check RDS metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=senior-benefits-db \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

## Cleanup

```bash
# CloudFormation
aws cloudformation delete-stack --stack-name senior-benefits-stack

# Terraform
terraform destroy -var="db_password=your-secure-password"

# S3
aws s3 rb s3://your-bucket-name --force
```

## Production Considerations

1. **Security**
   - Enable VPC for RDS
   - Use Secrets Manager for credentials
   - Enable encryption at rest and in transit
   - Configure WAF for API Gateway

2. **Availability**
   - Multi-AZ RDS deployment
   - API Gateway auto-scaling
   - Lambda concurrent execution limits
   - CloudFront for static assets

3. **Performance**
   - RDS Read Replicas
   - ElastiCache for caching
   - CloudFront distribution
   - API Gateway caching

4. **Cost Optimization**
   - Reserved capacity for RDS
   - Lambda provisioned concurrency
   - S3 lifecycle policies
   - CloudWatch log retention

## References

- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [CloudFormation User Guide](https://docs.aws.amazon.com/cloudformation/)
