#!/usr/bin/env python3
import re

def fix_file(filepath, fixes):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        original = content
        for pattern, replacement in fixes:
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
        if content != original:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"✓ Fixed {filepath}")
        else:
            print(f"  No changes in {filepath}")
    except Exception as e:
        print(f"✗ Error: {filepath}: {e}")

fixes = {
    'src/openapi/schemas.ts': [
        (r"import \{ createRoute \} from '@hono/zod-openapi';\n", ""),
    ],
    'src/lib/circuit-breaker.test.ts': [
        (r"import \{ describe, it, expect, beforeEach, vi \}", "import { describe, it, expect, beforeEach }"),
    ],
    'src/lib/circuit-breaker.ts': [
        (r"    const now = Date\.now\(\);", "    // const now = Date.now();"),
        (r"\} catch \(error\) \{", "} catch {"),
    ],
    'src/lib/db-wrapper.test.ts': [
        (r"    const readMetrics = protectedDb", "    // const readMetrics = protectedDb"),
        (r"    const authFailureThreshold = 3;", "    // const authFailureThreshold = 3;"),
        (r"const result = await readOp\(\);", "const result = (await readOp()) as any;"),
    ],
    'src/lib/db-wrapper.ts': [
        (r"import \{ CircuitBreakerConfig, CircuitBreaker", "import { CircuitBreaker"),
        (r"const results = await db\.batch\(queries\);", "const results = (await db.batch(queries)) as any;"),
        (r"context: ExecutionContext\)", "_context: ExecutionContext)"),
    ],
    'src/middleware/circuit-breaker-monitoring.ts': [
        (r"  env,", "  // env,"),
    ],
    'src/middleware/errorTracking.ts': [
        (r"return c\.json\(\{ error: errorResult \}, status\);", "return c.json({ error: errorResult }, status as any);"),
        (r"\} catch \(error\) \{", "} catch {"),
    ],
    'src/middleware/rateLimiter.ts': [
        (r"import \{ ConsoleLogger, createLogger \}", "import { ConsoleLogger }"),
    ],
    'src/openapi/routes.ts': [
        (r"  AddFavoriteRequestSchema,\n", ""),
    ],
    'src/routes/models.ts': [
        (r", executeWithFallback", ""),
        (r"    const results = \[\];", "    const results: any[] = [];"),
    ],
}

for filepath, file_fixes in fixes.items():
    fix_file(filepath, file_fixes)

print("\n✓ Done! Now run: pnpm type-check")
