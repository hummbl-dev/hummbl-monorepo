# HUMMBL Infrastructure as Code

This repository contains the infrastructure as code (IaC) for the HUMMBL application, built using AWS CDK with TypeScript.

## Architecture Overview

The infrastructure is organized into the following main components:

1. **Networking**
   - VPC with public and private subnets across multiple AZs
   - NAT Gateway for outbound internet access from private subnets
   - Security groups for network-level security

2. **Compute**
   - AWS Fargate for containerized workloads (to be added)
   - AWS Lambda for serverless functions (to be added)

3. **Data Storage**
   - Amazon RDS PostgreSQL database
   - Amazon ElastiCache Redis for caching
   - Amazon S3 for assets and logs

4. **Security**
   - IAM roles and policies with least privilege
   - Secrets Manager for sensitive configuration
   - Security groups for network access control

## Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate credentials
- AWS CDK Toolkit installed (`npm install -g aws-cdk`)
- Docker (for local testing of containerized components)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Bootstrap AWS Environment (first time only)**
   ```bash
   npx cdk bootstrap aws://ACCOUNT-NUMBER/REGION
   ```
   Replace `ACCOUNT-NUMBER` with your AWS account ID and `REGION` with your desired AWS region.

3. **Synthesize CloudFormation Template**
   ```bash
   npm run synth
   ```

4. **Deploy the Stack**
   ```bash
   npm run deploy
   ```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# AWS Configuration
AWS_ACCOUNT=your-aws-account-id
AWS_REGION=us-west-2

# Database Configuration
DB_NAME=hummbl
DB_USERNAME=hummbladmin

# Optional: Custom domain for API Gateway
# DOMAIN_NAME=api.hummbl.io
# CERTIFICATE_ARN=arn:aws:acm:...
```

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npm test` - Run tests
- `npm run cdk` - Run CDK commands
- `npm run deploy` - Deploy the stack
- `npm run diff` - Compare deployed stack with current state
- `npm run synth` - Synthesize CloudFormation template

## Security

- All infrastructure is deployed with least privilege IAM roles
- Secrets are stored in AWS Secrets Manager
- Database is deployed in private subnets
- All resources are tagged with appropriate metadata

## Cost Estimation

Estimated monthly costs for the development environment:

- RDS PostgreSQL (db.t3.small): ~$50-70/month
- ElastiCache (cache.t3.micro): ~$15-20/month
- S3 Storage: ~$0.50-5/month (depending on usage)
- Data Transfer: Variable

## Cleanup

To destroy all resources:

```bash
npx cdk destroy
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
