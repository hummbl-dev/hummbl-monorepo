#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HummblInfrastructureStack } from '../lib/hummbl-infrastructure-stack';

const app = new cdk.App();

// Get environment from context or use defaults
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || 'YOUR_AWS_ACCOUNT_ID',
  region: process.env.CDK_DEFAULT_REGION || 'us-west-2',
};

// Create the infrastructure stack
new HummblInfrastructureStack(app, 'HummblInfrastructureStack', {
  env,
  description: 'Core infrastructure for HUMMBL application',
  tags: {
    Environment: 'Development',
    Project: 'HUMMBL',
    ManagedBy: 'CDK',
  },
});

// Add tags to all resources in the app
cdk.Tags.of(app).add('Project', 'HUMMBL');
cdk.Tags.of(app).add('ManagedBy', 'CDK');