with open('src/lib/circuit-breaker.ts', 'r') as f:
    lines = f.readlines()

# Find onFailure and updateState
for i, line in enumerate(lines, 1):
    if i >= 200 and i <= 280:
        print(f"{i}: {line}", end='')
