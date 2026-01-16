with open('src/lib/circuit-breaker.ts', 'r') as f:
    lines = f.readlines()

# Find execute method
for i, line in enumerate(lines, 1):
    if i >= 100 and i <= 200:
        print(f"{i}: {line}", end='')
