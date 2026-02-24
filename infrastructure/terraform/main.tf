terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# RDS PostgreSQL Database
resource "aws_db_instance" "senior_benefits" {
  identifier     = "senior-benefits-db-${var.environment}"
  engine         = "postgres"
  engine_version = "14.7"
  instance_class = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  publicly_accessible = var.db_publicly_accessible
  skip_final_snapshot = var.environment != "prod"

  tags = {
    Environment = var.environment
    Project     = "SeniorBenefits"
  }
}

# S3 Bucket for Frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "senior-benefits-frontend-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Environment = var.environment
    Project     = "SeniorBenefits"
  }
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Public Access Block
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Lambda Execution Role
resource "aws_iam_role" "lambda_role" {
  name = "senior-benefits-lambda-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# API Gateway
resource "aws_apigatewayv2_api" "main" {
  name          = "senior-benefits-api-${var.environment}"
  protocol_type = "HTTP"

  tags = {
    Environment = var.environment
    Project     = "SeniorBenefits"
  }
}

# Data Source
data "aws_caller_identity" "current" {}
