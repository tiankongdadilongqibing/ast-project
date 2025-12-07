import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { ASTParser } from './ast/parser';
import { CheckRequest, CheckResult, Violation, Rule } from './types';

export class CodeChecker {
  async check(request: CheckRequest): Promise<CheckResult> {
    const startTime = Date.now();
    const violations: Violation[] = [];
    let totalFiles = 0;
    let checkedFiles = 0;

    // 确定要检查的文件模式
    const filePatterns = request.filePatterns || [
      '**/*.tsx',
      '**/*.jsx',
      '**/*.ts',
      '**/*.js',
    ];

    // 获取所有匹配的文件
    const files: string[] = [];
    for (const pattern of filePatterns) {
      const matches = await glob(pattern, {
        cwd: request.targetPath,
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
      });
      files.push(...matches);
    }

    // 去重
    const uniqueFiles = Array.from(new Set(files));
    totalFiles = uniqueFiles.length;

    // 检查每个文件
    for (const filePath of uniqueFiles) {
      try {
        const fileViolations = await this.checkFile(
          filePath,
          request.rules,
          request.targetPath
        );
        violations.push(...fileViolations);
        checkedFiles++;
      } catch (error) {
        console.error(`Error checking file ${filePath}:`, error);
      }
    }

    const duration = Date.now() - startTime;

    return {
      violations,
      totalFiles,
      checkedFiles,
      duration,
    };
  }

  private async checkFile(
    filePath: string,
    rules: Rule[],
    basePath: string
  ): Promise<Violation[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parser = new ASTParser(content, path.relative(basePath, filePath));
    const ast = parser.parse();

    if (!ast) {
      return [];
    }

    return parser.checkRules(ast, rules);
  }
}


