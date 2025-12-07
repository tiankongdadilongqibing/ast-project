import React from 'react';
import { CheckResult } from '../types';
import './ResultViewer.css';

interface ResultViewerProps {
  result: CheckResult | null;
  loading: boolean;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="result-viewer">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>正在检查代码...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-viewer">
        <div className="empty-state">
          <p>暂无检查结果</p>
          <p className="hint">请先配置规则并执行检查</p>
        </div>
      </div>
    );
  }

  const errorCount = result.violations.filter(
    (v) => v.severity === 'error'
  ).length;
  const warningCount = result.violations.filter(
    (v) => v.severity === 'warning'
  ).length;
  const infoCount = result.violations.filter(
    (v) => v.severity === 'info'
  ).length;

  const violationsByFile = result.violations.reduce((acc, violation) => {
    if (!acc[violation.file]) {
      acc[violation.file] = [];
    }
    acc[violation.file].push(violation);
    return acc;
  }, {} as Record<string, typeof result.violations>);

  return (
    <div className="result-viewer">
      <div className="result-summary">
        <h2>检查结果</h2>
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-value">{result.totalFiles}</div>
            <div className="stat-label">总文件数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{result.checkedFiles}</div>
            <div className="stat-label">已检查</div>
          </div>
          <div className="stat-card stat-error">
            <div className="stat-value">{errorCount}</div>
            <div className="stat-label">错误</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-value">{warningCount}</div>
            <div className="stat-label">警告</div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-value">{infoCount}</div>
            <div className="stat-label">信息</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{(result.duration / 1000).toFixed(2)}s</div>
            <div className="stat-label">耗时</div>
          </div>
        </div>
      </div>

      {result.violations.length === 0 ? (
        <div className="success-state">
          <div className="success-icon">✓</div>
          <h3>检查通过！</h3>
          <p>未发现任何不合规的代码</p>
        </div>
      ) : (
        <div className="violations-list">
          <h3>发现的问题 ({result.violations.length})</h3>
          {Object.entries(violationsByFile).map(([file, violations]) => (
            <div key={file} className="file-violations">
              <div className="file-header">
                <span className="file-name">{file}</span>
                <span className="file-count">{violations.length} 个问题</span>
              </div>
              {violations.map((violation, index) => (
                <div key={index} className={`violation violation-${violation.severity}`}>
                  <div className="violation-header">
                    <span className="violation-location">
                      第 {violation.line} 行，第 {violation.column} 列
                    </span>
                    <span className={`severity-badge severity-${violation.severity}`}>
                      {violation.severity === 'error'
                        ? '错误'
                        : violation.severity === 'warning'
                        ? '警告'
                        : '信息'}
                    </span>
                  </div>
                  <div className="violation-rule">
                    <strong>规则:</strong> {violation.ruleName}
                  </div>
                  <div className="violation-message">{violation.message}</div>
                  {violation.code && (
                    <div className="violation-code">
                      <code>{violation.code}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultViewer;


