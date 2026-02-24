output "db_endpoint" {
  description = "RDS Database Endpoint"
  value       = aws_db_instance.senior_benefits.endpoint
}

output "db_address" {
  description = "RDS Database Address"
  value       = aws_db_instance.senior_benefits.address
}

output "s3_bucket_name" {
  description = "S3 Bucket for Frontend"
  value       = aws_s3_bucket.frontend.id
}

output "api_endpoint" {
  description = "API Gateway Endpoint"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "lambda_role_arn" {
  description = "Lambda Execution Role ARN"
  value       = aws_iam_role.lambda_role.arn
}
