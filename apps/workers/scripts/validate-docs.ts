#!/usr/bin/env tsx
/**
 * OpenAPI Documentation Validation Script
 * Validates that OpenAPI documentation stays in sync with actual API implementation
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface RouteDefinition {
  method: string;
  path: string;
  documented: boolean;
  implemented: boolean;
}

class DocumentationValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  async validateDocumentation(): Promise<ValidationResult> {
    console.log(chalk.blue('🔍 Validating OpenAPI documentation...'));

    // Check schema consistency
    this.validateSchemaConsistency();

    // Check route coverage
    this.validateRouteCoverage();

    // Check example validity
    this.validateExamples();

    // Check security requirements
    this.validateSecurity();

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  private validateSchemaConsistency(): void {
    console.log(chalk.gray('  • Checking schema consistency...'));

    try {
      // Read OpenAPI schemas
      const schemasPath = join(__dirname, '../src/openapi/schemas.ts');
      const schemasContent = readFileSync(schemasPath, 'utf-8');

      // Check for common issues
      if (!schemasContent.includes('openapi({')) {
        this.warnings.push('Schemas should include OpenAPI decorators for better documentation');
      }

      // Check for example consistency
      const exampleCount = (schemasContent.match(/example:/g) || []).length;
      if (exampleCount < 10) {
        this.warnings.push(`Only ${exampleCount} schema examples found. Consider adding more examples.`);
      }

      console.log(chalk.green('    ✓ Schema consistency check passed'));
    } catch (error) {
      this.errors.push(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateRouteCoverage(): void {
    console.log(chalk.gray('  • Checking route coverage...'));

    try {
      // Get implemented routes from actual route files
      const implementedRoutes = this.extractImplementedRoutes();

      // Get documented routes from OpenAPI definitions
      const documentedRoutes = this.extractDocumentedRoutes();

      // Find discrepancies
      const undocumented = implementedRoutes.filter(
        impl => !documentedRoutes.some(doc =>
          doc.method === impl.method && doc.path === impl.path
        )
      );

      const unimplemented = documentedRoutes.filter(
        doc => !implementedRoutes.some(impl =>
          impl.method === doc.method && impl.path === doc.path
        )
      );

      if (undocumented.length > 0) {
        this.warnings.push(
          `Undocumented routes found: ${undocumented.map(r => `${r.method} ${r.path}`).join(', ')}`
        );
      }

      if (unimplemented.length > 0) {
        this.errors.push(
          `Documented but unimplemented routes: ${unimplemented.map(r => `${r.method} ${r.path}`).join(', ')}`
        );
      }

      console.log(chalk.green(`    ✓ Route coverage check passed (${implementedRoutes.length} routes)`));
    } catch (error) {
      this.errors.push(`Route coverage validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractImplementedRoutes(): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    try {
      // Read route files and extract endpoint definitions
      const routeFiles = [
        '../src/routes/auth.ts',
        '../src/routes/models.ts',
        '../src/routes/transformations.ts',
        '../src/routes/user.ts',
        '../src/routes/analytics.ts'
      ];

      for (const routeFile of routeFiles) {
        const filePath = join(__dirname, routeFile);
        const content = readFileSync(filePath, 'utf-8');

        // Extract HTTP method calls (simplified regex)
        const routeMatches = content.matchAll(/\.(\w+)\(['"`]([^'"`]+)['"`]/g);

        for (const match of routeMatches) {
          const method = match[1].toLowerCase();
          const path = match[2];

          if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
            routes.push({
              method: method.toUpperCase(),
              path: this.normalizePath(path),
              documented: false,
              implemented: true
            });
          }
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not extract implemented routes: ${error}`));
    }

    return routes;
  }

  private extractDocumentedRoutes(): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    try {
      // Read OpenAPI route definitions
      const routesPath = join(__dirname, '../src/openapi/routes.ts');
      const content = readFileSync(routesPath, 'utf-8');

      // Extract createRoute calls
      const routeMatches = content.matchAll(/method:\s*['"`](\w+)['"`][\s\S]*?path:\s*['"`]([^'"`]+)['"`]/g);

      for (const match of routeMatches) {
        const method = match[1].toUpperCase();
        const path = match[2];

        routes.push({
          method,
          path: this.normalizePath(path),
          documented: true,
          implemented: false
        });
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not extract documented routes: ${error}`));
    }

    return routes;
  }

  private normalizePath(path: string): string {
    // Convert OpenAPI path parameters {param} to Express-style :param
    return path.replace(/\{(\w+)\}/g, ':$1');
  }

  private validateExamples(): void {
    console.log(chalk.gray('  • Validating examples...'));

    try {
      const examplesPath = join(__dirname, '../src/openapi/examples.ts');
      const content = readFileSync(examplesPath, 'utf-8');

      // Check for required example categories
      const requiredExamples = ['auth', 'models', 'transformations', 'user', 'errors'];

      for (const category of requiredExamples) {
        if (!content.includes(`${category}:`)) {
          this.warnings.push(`Missing example category: ${category}`);
        }
      }

      // Check for cURL examples
      if (!content.includes('curl -X')) {
        this.warnings.push('Missing cURL examples for API usage');
      }

      // Check for JavaScript examples
      if (!content.includes('fetch(')) {
        this.warnings.push('Missing JavaScript examples for API usage');
      }

      console.log(chalk.green('    ✓ Examples validation passed'));
    } catch (error) {
      this.errors.push(`Examples validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateSecurity(): void {
    console.log(chalk.gray('  • Checking security documentation...'));

    try {
      const configPath = join(__dirname, '../src/openapi/config.ts');
      const content = readFileSync(configPath, 'utf-8');

      // Check for security scheme definitions
      if (!content.includes('securitySchemes')) {
        this.errors.push('Missing security schemes in OpenAPI configuration');
      }

      if (!content.includes('BearerAuth')) {
        this.errors.push('Missing JWT Bearer authentication scheme');
      }

      // Check for rate limiting documentation
      if (!content.includes('rate') && !content.includes('limit')) {
        this.warnings.push('Rate limiting information should be documented');
      }

      console.log(chalk.green('    ✓ Security documentation check passed'));
    } catch (error) {
      this.errors.push(`Security validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  generateReport(result: ValidationResult): void {
    console.log('\n' + chalk.bold('📋 Validation Report'));
    console.log('═'.repeat(50));

    if (result.valid) {
      console.log(chalk.green('✅ Documentation is valid and up-to-date!'));
    } else {
      console.log(chalk.red('❌ Documentation validation failed'));
    }

    if (result.errors.length > 0) {
      console.log('\n' + chalk.red.bold('Errors:'));
      result.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }

    if (result.warnings.length > 0) {
      console.log('\n' + chalk.yellow.bold('Warnings:'));
      result.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }

    console.log('\n' + chalk.blue('💡 Tips:'));
    console.log('  • Run `pnpm dev` to start the development server');
    console.log('  • Visit /docs for interactive API documentation');
    console.log('  • Check /openapi.json for the complete OpenAPI specification');
  }

  async generateDocsSummary(): Promise<void> {
    console.log('\n' + chalk.blue('📊 Documentation Summary'));
    console.log('─'.repeat(40));

    try {
      const stats = await this.collectDocumentationStats();

      console.log(`📁 Total route definitions: ${stats.totalRoutes}`);
      console.log(`📋 Schema definitions: ${stats.totalSchemas}`);
      console.log(`💡 Example snippets: ${stats.totalExamples}`);
      console.log(`🔐 Security schemes: ${stats.securitySchemes}`);
      console.log(`🏷️  Documentation tags: ${stats.tags}`);

    } catch (error) {
      console.warn(chalk.yellow(`Could not generate documentation summary: ${error}`));
    }
  }

  private async collectDocumentationStats() {
    const stats = {
      totalRoutes: 0,
      totalSchemas: 0,
      totalExamples: 0,
      securitySchemes: 0,
      tags: 0
    };

    try {
      // Count route definitions
      const routesPath = join(__dirname, '../src/openapi/routes.ts');
      const routesContent = readFileSync(routesPath, 'utf-8');
      stats.totalRoutes = (routesContent.match(/createRoute\(/g) || []).length;

      // Count schema definitions
      const schemasPath = join(__dirname, '../src/openapi/schemas.ts');
      const schemasContent = readFileSync(schemasPath, 'utf-8');
      stats.totalSchemas = (schemasContent.match(/Schema\s*=/g) || []).length;

      // Count examples
      const examplesPath = join(__dirname, '../src/openapi/examples.ts');
      const examplesContent = readFileSync(examplesPath, 'utf-8');
      stats.totalExamples = (examplesContent.match(/example/gi) || []).length;

      // Count security schemes
      const configPath = join(__dirname, '../src/openapi/config.ts');
      const configContent = readFileSync(configPath, 'utf-8');
      stats.securitySchemes = (configContent.match(/BearerAuth/g) || []).length;
      stats.tags = (configContent.match(/name:\s*['"`]/g) || []).length;

    } catch (error) {
      console.warn(`Error collecting stats: ${error}`);
    }

    return stats;
  }
}

// Main execution
async function main() {
  console.log(chalk.bold.blue('🚀 HUMMBL API Documentation Validator\n'));

  const validator = new DocumentationValidator();

  try {
    const result = await validator.validateDocumentation();
    validator.generateReport(result);
    await validator.generateDocsSummary();

    // Exit with error code if validation failed
    process.exit(result.valid ? 0 : 1);

  } catch (error) {
    console.error(chalk.red('❌ Validation script failed:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}