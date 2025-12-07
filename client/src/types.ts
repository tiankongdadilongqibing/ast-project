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
      missing?: string[];
    };
  };
  astPattern?: string;
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


