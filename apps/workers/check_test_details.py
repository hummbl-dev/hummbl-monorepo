# Read the full test context around failures
with open('src/lib/db-wrapper.test.ts', 'r') as f:
    lines = f.readlines()

print("=== Test 1: Lines 125-150 (should open circuit after failures) ===")
for i in range(124, 151):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end='')

print("\n\n=== Test 2: Lines 190-200 (isolated read/write circuits) ===")
for i in range(189, 201):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end='')

print("\n\n=== Test 3: Lines 275-285 (health check after failures) ===")
for i in range(274, 286):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end='')
