with open('src/openapi/config.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
in_components = False

for i, line in enumerate(lines):
    # Comment out the entire components section
    if 'components: {' in line:
        new_lines.append('    // ' + line)
        in_components = True
        continue
    
    if in_components:
        if line.strip().startswith('}') and not line.strip().startswith('},'):
            # This is the closing brace of components
            new_lines.append('    // ' + line)
            in_components = False
            continue
        new_lines.append('    // ' + line)
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
    
print("✓ Fixed config.ts (commented out components)")
