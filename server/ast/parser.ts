import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { Rule, Violation } from '../types';

export class ASTParser {
  private source: string;
  private filePath: string;
  private violations: Violation[] = [];

  constructor(source: string, filePath: string) {
    this.source = source;
    this.filePath = filePath;
  }

  parse(): t.File | null {
    try {
      return parser.parse(this.source, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'asyncGenerators',
          'functionBind',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'dynamicImport',
          'nullishCoalescingOperator',
          'optionalChaining',
        ],
      });
    } catch (error) {
      console.error(`Parse error in ${this.filePath}:`, error);
      return null;
    }
  }

  checkRules(ast: t.File, rules: Rule[]): Violation[] {
    this.violations = [];
    const sourceLines = this.source.split('\n');

    rules.forEach((rule) => {
      traverse(ast, {
        JSXElement: (path) => {
          this.checkJSXElement(path, rule, sourceLines);
        },
        CallExpression: (path) => {
          this.checkCallExpression(path, rule, sourceLines);
        },
      });
    });

    return this.violations;
  }

  private checkJSXElement(
    path: any,
    rule: Rule,
    sourceLines: string[]
  ): void {
    if (rule.pattern.type !== 'component') return;

    const node = path.node;
    const openingElement = node.openingElement;
    const componentName = this.getComponentName(openingElement);

    if (
      rule.pattern.componentName &&
      componentName !== rule.pattern.componentName
    ) {
      return;
    }

    // 检查属性
    if (rule.pattern.props) {
      const props = this.extractProps(openingElement);
      const violations = this.checkProps(props, rule.pattern.props, rule);

      violations.forEach((violation) => {
        const loc = openingElement.loc;
        if (loc) {
          this.addViolation({
            file: this.filePath,
            line: loc.start.line,
            column: loc.start.column,
            ruleId: rule.id,
            ruleName: rule.name,
            message: violation,
            severity: rule.severity,
            code: sourceLines[loc.start.line - 1]?.trim(),
          });
        }
      });
    }
  }

  private checkCallExpression(
    path: any,
    rule: Rule,
    sourceLines: string[]
  ): void {
    if (rule.pattern.type !== 'hook' && rule.pattern.type !== 'api') return;

    const node = path.node;
    const callee = node.callee;

    // 检查hook调用
    if (rule.pattern.type === 'hook') {
      if (t.isIdentifier(callee)) {
        const hookName = callee.name;
        if (
          rule.pattern.componentName &&
          hookName === rule.pattern.componentName
        ) {
          const loc = node.loc;
          if (loc) {
            this.addViolation({
              file: this.filePath,
              line: loc.start.line,
              column: loc.start.column,
              ruleId: rule.id,
              ruleName: rule.name,
              message: rule.description,
              severity: rule.severity,
              code: sourceLines[loc.start.line - 1]?.trim(),
            });
          }
        }
      }
    }
  }

  private getComponentName(openingElement: any): string {
    if (t.isJSXIdentifier(openingElement.name)) {
      return openingElement.name.name;
    }
    if (t.isJSXMemberExpression(openingElement.name)) {
      const object = openingElement.name.object;
      const property = openingElement.name.property;
      if (t.isJSXIdentifier(object) && t.isJSXIdentifier(property)) {
        return `${object.name}.${property.name}`;
      }
    }
    return '';
  }

  private extractProps(openingElement: any): Map<string, any> {
    const props = new Map<string, any>();

    openingElement.attributes.forEach((attr: any) => {
      if (t.isJSXAttribute(attr)) {
        const name = attr.name.name;
        let value: any = true;

        if (attr.value) {
          if (t.isStringLiteral(attr.value)) {
            value = attr.value.value;
          } else if (t.isJSXExpressionContainer(attr.value)) {
            if (t.isBooleanLiteral(attr.value.expression)) {
              value = attr.value.expression.value;
            } else if (t.isStringLiteral(attr.value.expression)) {
              value = attr.value.expression.value;
            } else if (t.isNumericLiteral(attr.value.expression)) {
              value = attr.value.expression.value;
            } else {
              value = '[Expression]';
            }
          }
        }

        props.set(name, value);
      }
    });

    return props;
  }

  private checkProps(
    props: Map<string, any>,
    ruleProps: Rule['pattern']['props'],
    rule: Rule
  ): string[] {
    const violations: string[] = [];

    if (!ruleProps) return violations;

    Object.entries(ruleProps).forEach(([propName, propRule]) => {
      const propValue = props.get(propName);

      // 检查必需属性
      if (propRule.required && !props.has(propName)) {
        violations.push(`缺少必需的属性: ${propName}`);
        return;
      }

      // 检查属性值
      if (propRule.value !== undefined && propValue !== propRule.value) {
        violations.push(
          `属性 ${propName} 的值应为 ${propRule.value}，但实际为 ${propValue}`
        );
      }

      // 检查缺失的相关属性（例如：disabled存在但缺少title）
      if (propRule.missing && props.has(propName)) {
        const missingProps = propRule.missing.filter(
          (missingProp) => !props.has(missingProp)
        );
        if (missingProps.length > 0) {
          missingProps.forEach((missingProp) => {
            violations.push(
              `当 ${propName} 存在时，必须提供 ${missingProp} 属性`
            );
          });
        }
      }
    });

    return violations;
  }

  private addViolation(violation: Violation): void {
    this.violations.push(violation);
  }
}


