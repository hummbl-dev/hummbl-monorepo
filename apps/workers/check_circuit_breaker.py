# Check the circuit breaker execute method
with open('src/lib/circuit-breaker.ts', 'r') as f:
    lines = f.readlines()

print("=== Looking for execute() method and failure tracking ===")
in_execute = False
for i, line in enumerate(lines, 1):
    if 'async execute(' in line:
        in_execute = True
    
    if in_execute:
        print(f"{i}: {line}", end='')
        
        # Stop after we see the closing of execute method
        if line.strip() == '}' and i > 50:
            break
