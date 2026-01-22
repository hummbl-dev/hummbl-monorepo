import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

export interface TemplateOptions {
  modelId: string;
  modelName: string;
  description: string;
  characteristics: string[];
  relatedModels: string[];
  example: {
    problem: string;
    traditionalApproach: string;
    modelApproach: string;
  };
}

export async function extractTemplate(sourcePath: string, outputPath: string, options: TemplateOptions): Promise<void> {
  try {
    // Read the source file
    const sourceCode = fs.readFileSync(sourcePath, 'utf-8');
    
    // Create AST from source code
    const sourceFile = ts.createSourceFile(
      'source.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    // Process the source file to create template
    const template = transformToTemplate(sourceFile, options);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the template to file
    fs.writeFileSync(outputPath, template, 'utf-8');
    
    console.log(`✅ Template successfully extracted to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error extracting template:', error);
    throw error;
  }
}

function transformToTemplate(node: ts.Node, options: TemplateOptions): string {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const transformer = <T extends ts.Node>(context: ts.TransformationContext) => 
    (rootNode: T) => {
      function visit(node: ts.Node): ts.Node {
        node = ts.visitEachChild(node, visit, context);
        
        // Replace class name
        if (ts.isClassDeclaration(node) && node.name?.text === 'FirstPrinciplesModelImpl') {
          return ts.factory.updateClassDeclaration(
            node,
            node.modifiers,
            ts.factory.createIdentifier('{{MODEL_IMPL_CLASS}}'),
            node.typeParameters,
            node.heritageClauses,
            node.members.map(member => {
              // Process methods and properties
              if (ts.isMethodDeclaration(member)) {
                return processMethod(member);
              }
              if (ts.isPropertyDeclaration(member)) {
                return processProperty(member);
              }
              return member;
            })
          );
        }
        
        // Update constants
        if (ts.isVariableStatement(node) && 
            node.declarationList.declarations.some(d => d.name.getText() === 'P1_CONSTANTS')) {
          return createConstants(options);
        }
        
        return node;
      }
      return ts.visitNode(rootNode, visit);
    };
  
  const result = ts.transform(node, [transformer]);
  const transformedSourceFile = result.transformed[0] as ts.SourceFile;
  
  let output = printer.printFile(transformedSourceFile);
  
  // Add template header
  const header = `/**
 * GENERATED TEMPLATE - DO NOT EDIT DIRECTLY
 * Source: ${path.basename(sourcePath)}
 * Generated: ${new Date().toISOString()}
 */

// ============================================================================
// TEMPLATE CONFIGURATION - Update these values for your model
// ============================================================================
`;

  return header + output;
}

function processMethod(method: ts.MethodDeclaration): ts.MethodDeclaration {
  // Skip certain methods that should be implemented by each model
  const skipMethods = ['executeAnalysis', 'validateInput', 'generateVisualization'];
  if (method.name && ts.isIdentifier(method.name) && skipMethods.includes(method.name.text)) {
    return method;
  }
  
  // Add implementation placeholder for other methods
  return ts.factory.updateMethodDeclaration(
    method,
    method.decorators,
    method.modifiers,
    method.asteriskToken,
    method.name,
    method.questionToken,
    method.typeParameters,
    method.parameters,
    method.type,
    ts.factory.createBlock([
      ts.factory.createExpressionStatement(
        ts.factory.createStringLiteral('// TODO: Implement this method')
      ),
      ts.factory.createReturnStatement(
        method.type && !ts.isVoidTypeNode(method.type) 
          ? ts.factory.createIdentifier('undefined')
          : undefined
      )
    ])
  );
}

function processProperty(property: ts.PropertyDeclaration): ts.PropertyDeclaration {
  // Keep type information but remove initializers for required properties
  if (!property.initializer || !property.questionToken) {
    return ts.factory.updatePropertyDeclaration(
      property,
      property.decorators,
      property.modifiers,
      property.name,
      property.questionToken,
      property.type,
      undefined // Remove initializer
    );
  }
  return property;
}

function createConstants(options: TemplateOptions): ts.VariableStatement {
  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          'MODEL_CONSTANTS',
          undefined,
          undefined,
          ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment(
              'MODEL_CODE',
              ts.factory.createStringLiteral(`'${options.modelId}'`)
            ),
            ts.factory.createPropertyAssignment(
              'MODEL_NAME',
              ts.factory.createStringLiteral(`'${options.modelName}'`)
            ),
            ts.factory.createPropertyAssignment(
              'DESCRIPTION',
              ts.factory.createStringLiteral(`'${options.description}'`)
            ),
            ts.factory.createPropertyAssignment(
              'KEY_CHARACTERISTICS',
              ts.factory.createArrayLiteralExpression(
                options.characteristics.map(char => 
                  ts.factory.createStringLiteral(char)
                ),
                true
              )
            ),
            ts.factory.createPropertyAssignment(
              'RELATED_MODELS',
              ts.factory.createArrayLiteralExpression(
                options.relatedModels.map(model => 
                  ts.factory.createStringLiteral(model)
                ),
                true
              )
            ),
            ts.factory.createPropertyAssignment(
              'EXAMPLE',
              ts.factory.createObjectLiteralExpression([
                ts.factory.createPropertyAssignment(
                  'problem',
                  ts.factory.createStringLiteral(options.example.problem)
                ),
                ts.factory.createPropertyAssignment(
                  'traditionalApproach',
                  ts.factory.createStringLiteral(options.example.traditionalApproach)
                ),
                ts.factory.createPropertyAssignment(
                  'modelApproach',
                  ts.factory.createStringLiteral(options.example.modelApproach)
                )
              ], true)
            )
          ], true)
        )
      ],
      ts.NodeFlags.Const
    )
  );
}

// Example usage:
// extractTemplate(
//   './src/models/p1/FirstPrinciplesModel.ts',
//   './templates/model-template.ts',
//   {
//     modelId: 'P1',
//     modelName: 'First Principles',
//     description: 'Break down complex problems into fundamental truths',
//     characteristics: [
//       'Breaks down complex problems',
//       'Identifies fundamental truths',
//       'Rebuilds from ground up'
//     ],
//     relatedModels: ['IN1', 'ST1'],
//     example: {
//       problem: 'How to improve team productivity?',
//       traditionalApproach: 'Try different productivity methods',
//       modelApproach: 'Break down what productivity means and rebuild'
//     }
//   }
// );
