import express from 'express';
import cors from 'cors';
import { CodeChecker } from './checker';
import { CheckRequest, Rule } from './types';
import * as path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

const checker = new CodeChecker();

// 获取预定义规则示例
app.get('/api/rules/examples', (req, res) => {
  const examples: Rule[] = [
    {
      id: 'button-disabled-no-tooltip',
      name: '禁用按钮缺少提示',
      description:
        '当Button组件设置了disabled属性时，必须提供title或tooltip属性',
      severity: 'warning',
      pattern: {
        type: 'component',
        componentName: 'Button',
        props: {
          disabled: {
            missing: ['title', 'tooltip'],
          },
        },
      },
    },
    {
      id: 'input-required-no-label',
      name: '必填输入框缺少标签',
      description: '当Input组件设置了required属性时，必须提供label属性',
      severity: 'warning',
      pattern: {
        type: 'component',
        componentName: 'Input',
        props: {
          required: {
            missing: ['label'],
          },
        },
      },
    },
    {
      id: 'image-missing-alt',
      name: '图片缺少alt属性',
      description: 'Image组件必须提供alt属性以提升可访问性',
      severity: 'error',
      pattern: {
        type: 'component',
        componentName: 'Image',
        props: {
          alt: {
            required: true,
          },
        },
      },
    },
  ];

  res.json(examples);
});

// 检查代码
app.post('/api/check', async (req, res) => {
  try {
    const request: CheckRequest = req.body;

    if (!request.targetPath || !request.rules || request.rules.length === 0) {
      return res.status(400).json({
        error: 'targetPath and rules are required',
      });
    }

    // 验证路径是否存在
    const fs = require('fs');
    if (!fs.existsSync(request.targetPath)) {
      return res.status(400).json({
        error: 'Target path does not exist',
      });
    }

    const result = await checker.check(request);
    res.json(result);
  } catch (error: any) {
    console.error('Check error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


