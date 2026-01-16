import re

# Read the test file to understand what's failing
with open('src/lib/db-wrapper.test.ts', 'r') as f:
    test_content = f.read()

# Find tests around line 145, 196, 280 (circuit breaker state issues)
lines = test_content.split('\n')

print("=== Test around line 145 (CLOSED vs OPEN) ===")
for i in range(max(0, 140), min(len(lines), 150)):
    print(f"{i+1}: {lines[i]}")

print("\n=== Test around line 196 ===")
for i in range(max(0, 191), min(len(lines), 201)):
    print(f"{i+1}: {lines[i]}")
