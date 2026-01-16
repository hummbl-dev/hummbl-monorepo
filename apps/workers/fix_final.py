import re

# Fix circuit-breaker.ts - restore error parameter in catch block
with open('src/lib/circuit-breaker.ts', 'r') as f:
    content = f.read()

# Find the catch block and restore error parameter
content = re.sub(
    r'(\s+)\} catch \{(\s+this\.onFailure)',
    r'\1} catch (err) {\2(err)',
    content
)
# Replace other error references in that block with err
content = re.sub(r'if \(this\.isCircuitBreakerError\(error\)\)', 'if (this.isCircuitBreakerError(err))', content)
content = re.sub(r'throw error;', 'throw err;', content)
content = re.sub(
    r'error instanceof Error \? error\.message : String\(error\)',
    'err instanceof Error ? err.message : String(err)',
    content
)
content = re.sub(r'this\.logError\(cbError, error\)', 'this.logError(cbError, err)', content)

# Fix getMetrics to use Date.now() directly instead of undefined 'now'
content = re.sub(
    r'const uptime = now - this\.createdAt;',
    'const uptime = Date.now() - this.createdAt;',
    content
)
content = re.sub(
    r'this\.openCircuit\(now\);',
    'this.openCircuit(Date.now());',
    content
)
content = re.sub(
    r'if \(this\.openedAt && now - this\.openedAt',
    'if (this.openedAt && Date.now() - this.openedAt',
    content
)
content = re.sub(
    r'this\.closeCircuit\(now\);',
    'this.closeCircuit(Date.now());',
    content
)

# Remove unused parameter names
content = re.sub(r'private closeCircuit\(now: number\)', 'private closeCircuit(_now: number)', content)
content = re.sub(r'private onFailure\(error: unknown\)', 'private onFailure(_error: unknown)', content)

with open('src/lib/circuit-breaker.ts', 'w') as f:
    f.write(content)
print("✓ Fixed src/lib/circuit-breaker.ts")

# Fix errorTracking.ts - restore error parameter
with open('src/middleware/errorTracking.ts', 'r') as f:
    content = f.read()

# Find catch blocks and restore error
content = re.sub(r'\} catch \{', '} catch (err) {', content)
# Replace error references
content = re.sub(r'error instanceof Error', 'err instanceof Error', content) 
content = re.sub(r'new Error\(String\(error\)\)', 'new Error(String(err))', content)
content = re.sub(r'error\.stack', 'err.stack', content)
content = re.sub(r'throw error;', 'throw err;', content)

# Rename unused error parameters
content = re.sub(r'logErrorToConsole\(\s*error: Error,', 'logErrorToConsole(\n  _error: Error,', content)
content = re.sub(r'logErrorToDurableObject\(\s*error: Error,', 'logErrorToDurableObject(\n  _error: Error,', content)

with open('src/middleware/errorTracking.ts', 'w') as f:
    f.write(content)
print("✓ Fixed src/middleware/errorTracking.ts")

# Fix index-openapi.ts - comment out all unused route imports
with open('src/index-openapi.ts', 'r') as f:
    content = f.read()

# Comment out unused imports
unused_routes = [
    'loginRoute', 'registerRoute', 'googleAuthRoute', 'githubAuthRoute',
    'verifyTokenRoute', 'refreshTokenRoute', 'getModelsRoute', 'getModelRoute',
    'getModelRelationshipsRoute', 'recommendModelsRoute', 'getTransformationsRoute',
    'getTransformationRoute', 'getUserProgressRoute', 'addProgressRoute',
    'getUserFavoritesRoute', 'getUserProfileRoute', 'getAnalyticsStatsRoute',
    'getAnalyticsHealthRoute'
]
for route in unused_routes:
    content = re.sub(f'  {route},', f'  // {route},', content)

# Comment out unused imports at top
content = re.sub(r'^import type \{ Env \}', '// import type { Env }', content, flags=re.MULTILINE)
content = re.sub(r'^const appLogger', '// const appLogger', content, flags=re.MULTILINE)

with open('src/index-openapi.ts', 'w') as f:
    f.write(content)
print("✓ Fixed src/index-openapi.ts")

# Fix remaining unused imports
files_fixes = {
    'src/lib/db-wrapper.ts': [
        (r'type CircuitBreakerConfig,', '// type CircuitBreakerConfig,'),
        (r'context\?: DbOperationContext', '_context?: DbOperationContext'),
    ],
    'src/lib/db-wrapper.test.ts': [
        (r'const authFailureThreshold = 10;', '// const authFailureThreshold = 10;'),
    ],
    'src/middleware/circuit-breaker-monitoring.ts': [
        (r'^  env: Env,', '  // env: Env,', re.MULTILINE),
    ],
    'src/middleware/rateLimiter.ts': [
        (r'createLogger, logError', 'logError'),
    ],
    'src/routes/models.ts': [
        (r'let results;', 'let results: any[] = [];'),
    ],
}

for filepath, fixes_list in files_fixes.items():
    with open(filepath, 'r') as f:
        content = f.read()
    for pattern, replacement, *flags in fixes_list:
        flag = flags[0] if flags else 0
        content = re.sub(pattern, replacement, content, flags=flag)
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"✓ Fixed {filepath}")

print("\n✓ All automatic fixes applied!")
print("\nRemaining manual fixes needed:")
print("1. src/openapi/config.ts - Add arguments to getOpenAPIDocument() calls")
print("2. src/openapi/routes.ts - Zod schema type issues (7 errors)")
print("3. src/routes/user.ts - Type cast batch results")
print("4. src/lib/api.ts - Spread type issue")
print("5. src/examples/ - Demo file errors (can be ignored for CI)")
