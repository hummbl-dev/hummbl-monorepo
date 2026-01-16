import re

# Fix the context reference error in db-wrapper.ts
with open('src/lib/db-wrapper.ts', 'r') as f:
    content = f.read()

# Replace _context with context in the parameter (line 266)
content = re.sub(
    r'(_context\?): DbOperationContext',
    r'context?: DbOperationContext',
    content
)

with open('src/lib/db-wrapper.ts', 'w') as f:
    f.write(content)

print("✓ Fixed context reference in db-wrapper.ts")
