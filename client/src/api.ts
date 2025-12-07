import axios from 'axios';
import { Rule, CheckResult } from './types';

const API_BASE_URL = '/api';

export const api = {
  async getExampleRules(): Promise<Rule[]> {
    const response = await axios.get(`${API_BASE_URL}/rules/examples`);
    return response.data;
  },

  async checkCode(
    targetPath: string,
    rules: Rule[],
    filePatterns?: string[]
  ): Promise<CheckResult> {
    const response = await axios.post(`${API_BASE_URL}/check`, {
      targetPath,
      rules,
      filePatterns,
    });
    return response.data;
  },
};


