import re

# Fix circuit-breaker.ts bugs
with open('src/lib/circuit-breaker.ts', 'r') as f:
    content = f.read()

# Fix 1: Line 125 - throw err should be throw error
content = re.sub(
    r'throw err;(\s+}\s+try)',
    r'throw error;\1',
    content
)

# Fix 2: Line 136 - catch { should be catch (error) {
content = re.sub(
    r'} catch {',
    r'} catch (error) {',
    content
)

# Fix 3: Line 141 - err should be error
content = re.sub(
    r'if \(this\.isCircuitBreakerError\(err\)\)',
    r'if (this.isCircuitBreakerError(error))',
    content
)

# Fix 4: Line 146 - err should be error in string interpolation
content = re.sub(
    r'err instanceof Error \? err\.message : String\(err\)',
    r'error instanceof Error ? error.message : String(error)',
    content
)

# Fix 5: Line 151 - err should be error in logError call
content = re.sub(
    r'this\.logError\(cbError, err\);',
    r'this.logError(cbError, error);',
    content
)

with open('src/lib/circuit-breaker.ts', 'w') as f:
    f.write(content)

print("✓ Fixed circuit-breaker.ts compilation errors")
print("  - Fixed undefined 'err' variable references")
print("  - Added error parameter to catch block")
