# Find where .all(), .run() are wrapped with circuit breaker
with open('src/lib/db-wrapper.ts', 'r') as f:
    lines = f.readlines()

print("=== Looking for prepare() method and circuit breaker integration ===")
for i, line in enumerate(lines, 1):
    if 'prepare(' in line or 'async all(' in line or 'async run(' in line or 'this.circuitBreaker' in line:
        # Print context around matches
        start = max(0, i-3)
        end = min(len(lines), i+3)
        for j in range(start, end):
            marker = ">>>" if j == i-1 else "   "
            print(f"{marker} {j+1}: {lines[j]}", end='')
        print()
