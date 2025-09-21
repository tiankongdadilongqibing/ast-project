# 目录字符串替换工具

一个强大的JavaScript工具，用于在指定目录下查找符合条件的子目录，并递归替换其中的特定字符串。

## 功能特性

- 🔍 **智能目录查找**: 支持正则表达式和字符串匹配来查找符合条件的目录
- 🔄 **递归搜索**: 自动递归搜索所有子目录
- 📝 **多文件类型支持**: 支持多种文件扩展名的字符串替换
- 🚫 **排除目录**: 可配置排除不需要处理的目录（如node_modules、.git等）
- 👀 **预览模式**: 支持dry-run模式，预览替换结果而不实际修改文件
- 📊 **详细报告**: 提供详细的操作报告和统计信息
- ⚡ **高性能**: 异步处理，支持大项目

## 安装要求

- Node.js 8.0 或更高版本
- 无需额外依赖包

## 使用方法

### 基本语法

```bash
node directory-string-replacer.js [选项]
```

### 命令行选项

| 选项 | 长选项 | 描述 | 默认值 |
|------|--------|------|--------|
| `-r` | `--root` | 指定根目录 | 当前目录 |
| `-p` | `--pattern` | 目录名匹配模式（正则表达式或字符串） | `.*` |
| `-s` | `--search` | 要搜索的字符串 | 必需 |
| `-t` | `--replace` | 替换字符串 | 必需 |
| `-e` | `--extensions` | 文件扩展名列表，用逗号分隔 | `.js,.ts,.jsx,.tsx,.json,.html,.css,.scss,.md,.txt` |
| `-x` | `--exclude` | 排除的目录列表，用逗号分隔 | `node_modules,.git,.vscode,dist,build` |
| `-d` | `--dry-run` | 预览模式，不实际修改文件 | false |
| `-v` | `--verbose` | 详细输出 | false |
| `-h` | `--help` | 显示帮助信息 | - |

## 使用示例

### 1. 基本字符串替换

在`src`目录下查找名称包含"component"的目录，将"oldName"替换为"newName"：

```bash
node directory-string-replacer.js -r src -p component -s oldName -t newName
```

### 2. 使用正则表达式匹配目录名

查找以"test-"开头的目录，将"describe"替换为"describe.skip"：

```bash
node directory-string-replacer.js -p "^test-.*" -s "describe" -t "describe.skip"
```

### 3. 预览模式

使用`--dry-run`选项预览会进行哪些替换，而不实际修改文件：

```bash
node directory-string-replacer.js -p "utils" -s "console.log" -t "logger.info" --dry-run
```

### 4. 只处理特定类型的文件

只处理JavaScript和JSX文件：

```bash
node directory-string-replacer.js -p "components" -s "React" -t "React" -e ".js,.jsx"
```

### 5. 排除特定目录

排除`temp`和`cache`目录：

```bash
node directory-string-replacer.js -p "src" -s "TODO" -t "FIXME" -x "node_modules,.git,temp,cache"
```

### 6. 详细输出模式

使用`--verbose`选项查看详细的操作过程：

```bash
node directory-string-replacer.js -p ".*" -s "oldApi" -t "newApi" --verbose
```

## 高级用法

### 正则表达式模式

目录匹配模式支持完整的正则表达式语法：

```bash
# 匹配以"page-"开头的目录
node directory-string-replacer.js -p "^page-.*" -s "oldText" -t "newText"

# 匹配包含"test"或"spec"的目录
node directory-string-replacer.js -p ".*(test|spec).*" -s "oldText" -t "newText"

# 匹配数字结尾的目录
node directory-string-replacer.js -p ".*[0-9]$" -s "oldText" -t "newText"
```

### 复杂字符串替换

支持替换包含特殊字符的字符串：

```bash
# 替换包含正则表达式特殊字符的字符串
node directory-string-replacer.js -s "function\s+\w+\(" -t "const \1 = ("

# 替换多行文本
node directory-string-replacer.js -s "old\nmultiline\ntext" -t "new\nmultiline\ntext"
```

## 输出示例

### 正常执行输出

```
开始执行目录字符串替换...
根目录: /path/to/project
目录匹配模式: component
搜索字符串: "oldName"
替换字符串: "newName"
文件扩展名: .js, .ts, .jsx, .tsx, .json, .html, .css, .scss, .md, .txt
排除目录: node_modules, .git, .vscode, dist, build
预览模式: 否
---
找到 3 个符合条件的目录:
  - /path/to/project/src/components/Button
  - /path/to/project/src/components/Input
  - /path/to/project/src/components/Modal
---
处理目录: /path/to/project/src/components/Button
处理文件: /path/to/project/src/components/Button/index.js (2 次替换)
处理目录: /path/to/project/src/components/Input
处理文件: /path/to/project/src/components/Input/index.js (1 次替换)
处理目录: /path/to/project/src/components/Modal
处理文件: /path/to/project/src/components/Modal/index.js (3 次替换)
---
操作完成!
找到目录数: 3
处理文件数: 3
总替换次数: 6
```

### 预览模式输出

```
开始执行目录字符串替换...
根目录: /path/to/project
目录匹配模式: component
搜索字符串: "oldName"
替换字符串: "newName"
文件扩展名: .js, .ts, .jsx, .tsx, .json, .html, .css, .scss, .md, .txt
排除目录: node_modules, .git, .vscode, dist, build
预览模式: 是
---
找到 3 个符合条件的目录:
  - /path/to/project/src/components/Button
  - /path/to/project/src/components/Input
  - /path/to/project/src/components/Modal
---
处理目录: /path/to/project/src/components/Button
[预览] 处理文件: /path/to/project/src/components/Button/index.js (2 次替换)
处理目录: /path/to/project/src/components/Input
[预览] 处理文件: /path/to/project/src/components/Input/index.js (1 次替换)
处理目录: /path/to/project/src/components/Modal
[预览] 处理文件: /path/to/project/src/components/Modal/index.js (3 次替换)
---
操作完成!
找到目录数: 3
处理文件数: 3
总替换次数: 6
```

## 安全提示

1. **备份重要文件**: 在执行替换操作前，建议备份重要的项目文件
2. **使用预览模式**: 首次使用时建议使用`--dry-run`选项预览结果
3. **测试环境**: 在测试环境中先验证替换结果
4. **版本控制**: 确保项目在版本控制系统中，以便回滚更改

## 故障排除

### 常见问题

1. **权限错误**: 确保对目标目录有读写权限
2. **文件被占用**: 确保要修改的文件没有被其他程序占用
3. **路径问题**: 使用绝对路径或确保相对路径正确

### 调试技巧

1. 使用`--verbose`选项查看详细输出
2. 使用`--dry-run`选项预览操作
3. 先在小范围目录中测试

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个工具。
