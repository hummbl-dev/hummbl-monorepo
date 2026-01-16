import os

files_to_fix = [
    'src/index-openapi.ts',
    'src/lib/circuit-breaker.ts',
    'src/lib/db-wrapper.ts',
    'src/middleware/circuit-breaker-monitoring.ts'
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove all @ts-nocheck comments
        content = content.replace('// @ts-nocheck\n', '')
        content = content.replace('// @ts-nocheck', '')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
    else:
        print(f"File not found: {filepath}")

print("\nDone!")
