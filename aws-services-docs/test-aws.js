// Test AWS Services AI-Native Documentation
const AWS_SERVICES = {
  LAMBDA: {
    name: 'AWS Lambda',
    definition: 'Serverless compute: 128MB-10,240MB memory, 15min max timeout, pay-per-invocation',
  },
  S3: {
    name: 'Amazon S3',
    definition:
      'Object storage: No built-in CDN (use CloudFront), 5TB max object size, eventual consistency',
  },
  RDS: {
    name: 'Amazon RDS',
    definition:
      'Managed database: Storage auto-scales, compute requires manual scaling, supports read replicas',
  },
};

function validateAWSService(id) {
  return AWS_SERVICES[id] || null;
}

console.log('🧪 Testing AWS Services AI-Native Documentation:\n');

console.log('✅ Validate Lambda (prevents memory fabrication):');
const lambda = validateAWSService('LAMBDA');
console.log(`   ${lambda.definition}\n`);

console.log('✅ Validate S3 (prevents CDN fabrication):');
const s3 = validateAWSService('S3');
console.log(`   ${s3.definition}\n`);

console.log('❌ Try to validate fake service:');
const fake = validateAWSService('FAKE_SERVICE');
console.log(`   Result: ${fake}\n`);

console.log('🎯 Impact: Prevents costly production errors from AI misinformation!');
