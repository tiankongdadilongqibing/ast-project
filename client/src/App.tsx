import React, { useState, useEffect } from 'react';
import RuleEditor from './components/RuleEditor';
import CheckConfig from './components/CheckConfig';
import ResultViewer from './components/ResultViewer';
import { Rule, CheckResult } from './types';
import { api } from './api';
import './App.css';

function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [targetPath, setTargetPath] = useState('');
  const [filePatterns, setFilePatterns] = useState<string[]>([
    '**/*.tsx',
    '**/*.jsx',
  ]);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'check' | 'results'>(
    'rules'
  );

  useEffect(() => {
    loadExampleRules();
  }, []);

  const loadExampleRules = async () => {
    try {
      const examples = await api.getExampleRules();
      setRules(examples);
    } catch (error) {
      console.error('Failed to load example rules:', error);
    }
  };

  const handleAddRule = (rule: Rule) => {
    setRules([...rules, rule]);
  };

  const handleUpdateRule = (index: number, rule: Rule) => {
    const newRules = [...rules];
    newRules[index] = rule;
    setRules(newRules);
  };

  const handleDeleteRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  };

  const handleCheck = async () => {
    if (!targetPath || rules.length === 0) {
      alert('请设置目标路径并至少添加一条规则');
      return;
    }

    setLoading(true);
    setResult(null);
    setActiveTab('results');

    try {
      const checkResult = await api.checkCode(targetPath, rules, filePatterns);
      setResult(checkResult);
    } catch (error: any) {
      alert(`检查失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>代码合规检查工具</h1>
        <p>基于AST的代码合规性检查，支持自定义规则</p>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'rules' ? 'active' : ''}
          onClick={() => setActiveTab('rules')}
        >
          规则配置
        </button>
        <button
          className={activeTab === 'check' ? 'active' : ''}
          onClick={() => setActiveTab('check')}
        >
          检查设置
        </button>
        <button
          className={activeTab === 'results' ? 'active' : ''}
          onClick={() => setActiveTab('results')}
        >
          检查结果
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'rules' && (
          <RuleEditor
            rules={rules}
            onAdd={handleAddRule}
            onUpdate={handleUpdateRule}
            onDelete={handleDeleteRule}
          />
        )}

        {activeTab === 'check' && (
          <CheckConfig
            targetPath={targetPath}
            filePatterns={filePatterns}
            onTargetPathChange={setTargetPath}
            onFilePatternsChange={setFilePatterns}
            onCheck={handleCheck}
            loading={loading}
            rulesCount={rules.length}
          />
        )}

        {activeTab === 'results' && (
          <ResultViewer result={result} loading={loading} />
        )}
      </main>
    </div>
  );
}

export default App;


