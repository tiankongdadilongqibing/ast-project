export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  pattern: RulePattern;
}

export interface RulePattern {
  type: 'component' | 'hook' | 'api' | 'custom';
  componentName?: string;
  props?: {
    [key: string]: {
      required?: boolean;
      value?: any;
      missing?: string[]; // 如果存在这些属性，但缺少某些属性，则触发
    };
  };
  astPattern?: string; // 自定义AST模式（JSON格式）
}

export interface Violation {
  file: string;
  line: number;
  column: number;
  ruleId: string;
  ruleName: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface CheckResult {
  violations: Violation[];
  totalFiles: number;
  checkedFiles: number;
  duration: number;
}

export interface CheckRequest {
  targetPath: string;
  rules: Rule[];
  filePatterns?: string[];
}


