import re

# Fix db-wrapper.ts
with open('src/lib/db-wrapper.ts', 'r') as f:
    content = f.read()

# Remove CircuitBreakerConfig import
content = re.sub(r'CircuitBreakerConfig, CircuitBreaker', 'CircuitBreaker', content)

# Cast batch result
content = re.sub(r'const results = await db\.batch\(queries\);', 'const results = (await db.batch(queries)) as any;', content)

# Rename context parameters
content = re.sub(r'(\s+async execute\([^)]+), context: ExecutionContext\)', r'\1, _context: ExecutionContext)', content)

with open('src/lib/db-wrapper.ts', 'w') as f:
    f.write(content)
print("✓ Fixed src/lib/db-wrapper.ts")

# Fix circuit-breaker-monitoring.ts
with open('src/middleware/circuit-breaker-monitoring.ts', 'r') as f:
    content = f.read()
    
content = re.sub(r'^(\s+)env,', r'\1// env,', content, flags=re.MULTILINE)

with open('src/middleware/circuit-breaker-monitoring.ts', 'w') as f:
    f.write(content)
print("✓ Fixed src/middleware/circuit-breaker-monitoring.ts")

# Fix rateLimiter.ts
with open('src/middleware/rateLimiter.ts', 'r') as f:
    content = f.read()
    
content = re.sub(r'import \{ ConsoleLogger, createLogger \}', 'import { ConsoleLogger }', content)

with open('src/middleware/rateLimiter.ts', 'w') as f:
    f.write(content)
print("✓ Fixed src/middleware/rateLimiter.ts")

# Fix user.ts - cast batch result
with open('src/routes/user.ts', 'r') as f:
    content = f.read()
    
# Find the batch call and cast it
content = re.sub(
    r'(const result = await this\.db\.batch\(\[)',
    r'\1',
    content
)
# Add the cast after the closing bracket
content = re.sub(
    r'(\]\));',
    r']) as any;',
    content
)

with open('src/routes/user.ts', 'w') as f:
    f.write(content)
print("✓ Fixed src/routes/user.ts")

print("\n✓ All fixes applied!")
