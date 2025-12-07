import React, { useState } from 'react';
import { Rule } from '../types';
import './RuleEditor.css';

interface RuleEditorProps {
  rules: Rule[];
  onAdd: (rule: Rule) => void;
  onUpdate: (index: number, rule: Rule) => void;
  onDelete: (index: number) => void;
}

const RuleEditor: React.FC<RuleEditorProps> = ({
  rules,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Rule>>({
    id: '',
    name: '',
    description: '',
    severity: 'warning',
    pattern: {
      type: 'component',
      componentName: '',
      props: {},
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.pattern) {
      alert('请填写所有必填字段');
      return;
    }

    const rule: Rule = {
      id: formData.id,
      name: formData.name,
      description: formData.description || '',
      severity: formData.severity || 'warning',
      pattern: formData.pattern,
    };

    if (editingIndex !== null) {
      onUpdate(editingIndex, rule);
      setEditingIndex(null);
    } else {
      onAdd(rule);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      severity: 'warning',
      pattern: {
        type: 'component',
        componentName: '',
        props: {},
      },
    });
    setShowAddForm(false);
  };

  const handleEdit = (index: number) => {
    const rule = rules[index];
    setFormData(rule);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const addPropRule = () => {
    const propName = prompt('请输入属性名称:');
    if (!propName) return;

    const propType = prompt(
      '属性规则类型:\n1. required - 必需属性\n2. missing - 当此属性存在时，必须提供其他属性\n请输入 (1 或 2):'
    );

    const newProps = { ...formData.pattern?.props };
    if (propType === '1') {
      newProps[propName] = { required: true };
    } else if (propType === '2') {
      const missingProps = prompt(
        '请输入缺失的属性列表（用逗号分隔）:'
      )?.split(',');
      newProps[propName] = {
        missing: missingProps?.map((p) => p.trim()) || [],
      };
    }

    setFormData({
      ...formData,
      pattern: {
        ...formData.pattern!,
        props: newProps,
      },
    });
  };

  const removePropRule = (propName: string) => {
    const newProps = { ...formData.pattern?.props };
    delete newProps[propName];
    setFormData({
      ...formData,
      pattern: {
        ...formData.pattern!,
        props: newProps,
      },
    });
  };

  return (
    <div className="rule-editor">
      <div className="rule-editor-header">
        <h2>规则配置</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          + 添加规则
        </button>
      </div>

      {showAddForm && (
        <div className="rule-form-container">
          <form className="rule-form" onSubmit={handleSubmit}>
            <h3>{editingIndex !== null ? '编辑规则' : '新建规则'}</h3>

            <div className="form-group">
              <label>规则ID *</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                placeholder="例如: button-disabled-no-tooltip"
                required
              />
            </div>

            <div className="form-group">
              <label>规则名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例如: 禁用按钮缺少提示"
                required
              />
            </div>

            <div className="form-group">
              <label>规则描述</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="描述此规则检查的内容"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>严重程度</label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    severity: e.target.value as 'error' | 'warning' | 'info',
                  })
                }
              >
                <option value="error">错误</option>
                <option value="warning">警告</option>
                <option value="info">信息</option>
              </select>
            </div>

            <div className="form-group">
              <label>检查类型</label>
              <select
                value={formData.pattern?.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pattern: {
                      ...formData.pattern!,
                      type: e.target.value as any,
                    },
                  })
                }
              >
                <option value="component">组件</option>
                <option value="hook">Hook</option>
                <option value="api">API调用</option>
              </select>
            </div>

            {formData.pattern?.type === 'component' && (
              <>
                <div className="form-group">
                  <label>组件名称</label>
                  <input
                    type="text"
                    value={formData.pattern.componentName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pattern: {
                          ...formData.pattern!,
                          componentName: e.target.value,
                        },
                      })
                    }
                    placeholder="例如: Button"
                  />
                </div>

                <div className="form-group">
                  <label>属性规则</label>
                  <div className="props-list">
                    {Object.entries(formData.pattern.props || {}).map(
                      ([propName, propRule]) => (
                        <div key={propName} className="prop-item">
                          <span className="prop-name">{propName}</span>
                          <span className="prop-rule">
                            {propRule.required && '必需'}
                            {propRule.missing &&
                              `缺少: ${propRule.missing.join(', ')}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePropRule(propName)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addPropRule}
                    className="btn btn-secondary"
                  >
                    + 添加属性规则
                  </button>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingIndex !== null ? '更新' : '创建'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rules-list">
        {rules.length === 0 ? (
          <div className="empty-state">暂无规则，请添加规则</div>
        ) : (
          rules.map((rule, index) => (
            <div key={rule.id} className="rule-card">
              <div className="rule-card-header">
                <h3>{rule.name}</h3>
                <span className={`severity-badge severity-${rule.severity}`}>
                  {rule.severity === 'error'
                    ? '错误'
                    : rule.severity === 'warning'
                    ? '警告'
                    : '信息'}
                </span>
              </div>
              <p className="rule-description">{rule.description}</p>
              <div className="rule-details">
                <div>
                  <strong>ID:</strong> {rule.id}
                </div>
                <div>
                  <strong>类型:</strong> {rule.pattern.type}
                </div>
                {rule.pattern.componentName && (
                  <div>
                    <strong>组件:</strong> {rule.pattern.componentName}
                  </div>
                )}
              </div>
              <div className="rule-actions">
                <button
                  onClick={() => handleEdit(index)}
                  className="btn btn-small"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDelete(index)}
                  className="btn btn-small btn-danger"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RuleEditor;


