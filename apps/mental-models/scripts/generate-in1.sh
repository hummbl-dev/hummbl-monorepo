#!/bin/bash

# Install required dependencies
echo "Installing dependencies..."
npm install --save-dev typescript @types/node ejs tsx

# Generate the IN1 model
echo "\n🚀 Generating IN1 (Inversion) model..."
npx tsx scripts/generate-in1.ts

# Build the project
echo "\n🔨 Building the project..."
npm run build

# Run tests
echo "\n🧪 Running tests..."
npm test src/models/in1/__tests__/IN1Model.test.ts

echo "\n✅ IN1 model generation complete!"
