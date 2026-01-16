# Get a full overview of the circuit-breaker structure
with open('src/lib/circuit-breaker.ts', 'r') as f:
    content = f.read()

print("File length:", len(content), "characters")
print("\n=== First 100 lines ===")
lines = content.split('\n')
for i, line in enumerate(lines[:100], 1):
    print(f"{i}: {line}")
