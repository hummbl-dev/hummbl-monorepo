#!/bin/bash
set -e

# Configuration
FUNCTION_NAME="hummbl-telemetry"
ZIP_FILE="function.zip"
S3_BUCKET="hummbl-deployment-$(date +%s)"
AWS_REGION=${AWS_REGION:-us-west-2}

# Create virtual environment and install dependencies
echo "Setting up virtual environment..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt -t ./package

# Package the function
echo "Packaging Lambda function..."
cd package
zip -r ../$ZIP_FILE .
cd ..
zip -g $ZIP_FILE telemetry_lambda.py

# Check if S3 bucket exists, create if it doesn't
if ! aws s3api head-bucket --bucket $S3_BUCKET 2>/dev/null; then
    echo "Creating S3 bucket: $S3_BUCKET"
    aws s3api create-bucket \
        --bucket $S3_BUCKET \
        --region $AWS_REGION \
        --create-bucket-configuration LocationConstraint=$AWS_REGION
fi

# Upload to S3
echo "Uploading package to S3..."
aws s3 cp $ZIP_FILE s3://$S3_BUCKET/

# Deploy/Update Lambda
echo "Deploying Lambda function..."
if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION > /dev/null 2>&1; then
    # Update existing function
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://$ZIP_FILE \
        --region $AWS_REGION
else
    # Create new function
    echo "Creating new Lambda function..."
    ROLE_ARN=$(aws iam get-role --role-name lambda-basic-execution --query 'Role.Arn' --output text 2>/dev/null || \
        aws iam create-role \
            --role-name lambda-basic-execution \
            --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
            --query 'Role.Arn' \
            --output text)

    # Attach basic execution policy if not already attached
    aws iam attach-role-policy \
        --role-name lambda-basic-execution \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    # Create the function
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime python3.12 \
        --handler telemetry_lambda.handler \
        --role $ROLE_ARN \
        --zip-file fileb://$ZIP_FILE \
        --region $AWS_REGION \
        --environment "Variables={S3_BUCKET=hummbl-telemetry-$AWS_REGION,LOG_LEVEL=INFO}" \
        --timeout 30 \
        --memory-size 128

    # Add S3 write permissions
    aws iam attach-role-policy \
        --role-name lambda-basic-execution \
        --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
fi

echo "Deployment complete!"
echo "Lambda function name: $FUNCTION_NAME"
echo "S3 bucket for telemetry: hummbl-telemetry-$AWS_REGION"
