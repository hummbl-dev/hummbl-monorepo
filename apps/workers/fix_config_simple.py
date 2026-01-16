with open('src/openapi/config.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Fix getOpenAPIDocument() calls - add minimal config
    if 'app.getOpenAPIDocument()' in line:
        line = line.replace(
            'app.getOpenAPIDocument()',
            'app.getOpenAPIDocument({ openapi: "3.1.0", info: { title: "API", version: "1.0.0" } })'
        )
    # Remove or comment out the components section (around line 101-103)
    if i >= 100 and i <= 105 and ('components:' in line or line.strip() in ['},', '},']):
        continue  # Skip these lines
    new_lines.append(line)

with open('src/openapi/config.ts', 'w') as f:
    f.writelines(new_lines)

print("✓ Fixed config.ts")
