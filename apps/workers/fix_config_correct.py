with open('src/openapi/config.ts', 'r') as f:
    content = f.read()

# Fix 1: Add arguments to getOpenAPIDocument() - must match the function signature
content = content.replace(
    'const openApiDoc = app.getOpenAPIDocument();',
    'const openApiDoc = app.getOpenAPIDocument({ openapi: "3.1.0", info: { title: "HUMMBL Workers API", version: "1.0.0" } });'
)

# Fix 2: Remove the components section - it's not valid in the openAPISpecs config
# Find and remove the components block
import re
# Remove the entire components object
content = re.sub(
    r',\s*components:\s*\{[^}]*\},',
    '',
    content,
    flags=re.DOTALL | re.MULTILINE
)

with open('src/openapi/config.ts', 'w') as f:
    f.write(content)
    
print("✓ Fixed config.ts")
