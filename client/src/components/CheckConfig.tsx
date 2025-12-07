import React, { useState } from 'react';
import './CheckConfig.css';

interface CheckConfigProps {
  targetPath: string;
  filePatterns: string[];
  onTargetPathChange: (path: string) => void;
  onFilePatternsChange: (patterns: string[]) => void;
  onCheck: () => void;
  loading: boolean;
  rulesCount: number;
}

const CheckConfig: React.FC<CheckConfigProps> = ({
  targetPath,
  filePatterns,
  onTargetPathChange,
  onFilePatternsChange,
  onCheck,
  loading,
  rulesCount,
}) => {
  const [newPattern, setNewPattern] = useState('');

  const handleAddPattern = () => {
    if (newPattern.trim() && !filePatterns.includes(newPattern.trim())) {
      onFilePatternsChange([...filePatterns, newPattern.trim()]);
      setNewPattern('');
    }
  };

  const handleRemovePattern = (index: number) => {
    onFilePatternsChange(filePatterns.filter((_, i) => i !== index));
  };

  return (
    <div className="check-config">
      <h2>检查设置</h2>

      <div className="config-section">
        <div className="form-group">
          <label>目标路径 *</label>
          <input
            type="text"
            value={targetPath}
            onChange={(e) => onTargetPathChange(e.target.value)}
            placeholder="例如: E:\project\src 或 /home/user/project/src"
            className="path-input"
          />
          <p className="form-hint">
            输入要检查的代码仓库路径（绝对路径）
          </p>
        </div>

        <div className="form-group">
          <label>文件匹配模式</label>
          <div className="patterns-list">
            {filePatterns.map((pattern, index) => (
              <div key={index} className="pattern-item">
                <code>{pattern}</code>
                <button
                  onClick={() => handleRemovePattern(index)}
                  className="btn-remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="pattern-input-group">
            <input
              type="text"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPattern()}
              placeholder="例如: **/*.tsx"
              className="pattern-input"
            />
            <button onClick={handleAddPattern} className="btn btn-secondary">
              添加
            </button>
          </div>
          <p className="form-hint">
            使用 glob 模式匹配文件，例如: **/*.tsx, **/*.jsx
          </p>
        </div>

        <div className="check-summary">
          <div className="summary-item">
            <span className="summary-label">已配置规则:</span>
            <span className="summary-value">{rulesCount} 条</span>
          </div>
        </div>

        <button
          onClick={onCheck}
          disabled={loading || !targetPath || rulesCount === 0}
          className="btn btn-primary btn-check"
        >
          {loading ? '检查中...' : '开始检查'}
        </button>
      </div>
    </div>
  );
};

export default CheckConfig;


