with open('src/openapi/config.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
skip_until = -1

for i, line in enumerate(lines):
    # Skip the components section entirely (lines 101-108 approximately)
    if 'components: {' in line:
        skip_until = i + 10  # Skip the next several lines
        continue
    
    if i < skip_until:
        # Check if we've reached the end of the components block
        if line.strip() == '},':
            skip_until = -1  # Stop skipping
            continue
        continue
    
    # Fix getOpenAPIDocument() calls
    if 'app.getOpenAPIDocument()' in line:
        line = line.replace(
            'app.getOpenAPIDocument()',
            'app.getOpenAPIDocument({ openapi: "3.1.0", info: { title: "HUMMBL Workers API", version: "1.0.0" } })'
        )
    
    new_lines.append(line)

with open('src/openapi/config.ts', 'w') as f:
    f.writelines(new_lines)
    
print("✓ Fixed config.ts")
