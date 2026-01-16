import os

# Script to fix lint errors by removing @ts-nocheck and fixing issues

files_to_fix = {
    'src/middleware/errorTracking.ts': {
        'remove_ts_nocheck': True
    },
    'src/openapi/config.ts': {
        'remove_ts_nocheck': True
    },
    'src/openapi/routes.ts': {
        'remove_ts_nocheck': True
    },
    'src/routes/user.ts': {
        'remove_ts_nocheck': True
    }
}

for filepath, actions in files_to_fix.items():
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if actions.get('remove_ts_nocheck'):
            # Remove @ts-nocheck comments
            content = content.replace('// @ts-nocheck\n', '')
            content = content.replace('// @ts-nocheck', '')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
    else:
        print(f"File not found: {filepath}")

print("\nDone! Now run: git add . && git commit -m 'fix: remove @ts-nocheck comments for lint' && git push")
