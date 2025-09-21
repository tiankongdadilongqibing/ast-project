#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// 将回调函数转换为Promise
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * 目录字符串替换工具
 * 在指定目录下查找符合条件的子目录，并替换其中的特定字符串
 */
class DirectoryStringReplacer {
    constructor(options = {}) {
        this.rootDir = options.rootDir || process.cwd();
        this.directoryPattern = options.directoryPattern || /.*/;
        this.searchString = options.searchString || '';
        this.replaceString = options.replaceString || '';
        this.fileExtensions = options.fileExtensions || ['.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', '.scss', '.md', '.txt'];
        this.excludeDirs = options.excludeDirs || ['node_modules', '.git', '.vscode', 'dist', 'build'];
        this.dryRun = options.dryRun || false;
        this.verbose = options.verbose || false;
        this.results = {
            directoriesFound: [],
            filesProcessed: [],
            replacements: 0,
            errors: []
        };
    }

    /**
     * 检查目录名是否匹配指定模式
     * @param {string} dirName - 目录名
     * @param {RegExp|string} pattern - 匹配模式
     * @returns {boolean}
     */
    matchesPattern(dirName, pattern) {
        if (pattern instanceof RegExp) {
            return pattern.test(dirName);
        }
        if (typeof pattern === 'string') {
            return dirName.includes(pattern);
        }
        return false;
    }

    /**
     * 检查是否应该排除该目录
     * @param {string} dirName - 目录名
     * @returns {boolean}
     */
    shouldExcludeDir(dirName) {
        return this.excludeDirs.some(excludeDir => 
            dirName === excludeDir || dirName.startsWith(excludeDir)
        );
    }

    /**
     * 检查文件扩展名是否在允许列表中
     * @param {string} filePath - 文件路径
     * @returns {boolean}
     */
    hasAllowedExtension(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return this.fileExtensions.includes(ext);
    }

    /**
     * 递归查找符合条件的目录
     * @param {string} currentDir - 当前目录路径
     * @returns {Promise<Array>} 符合条件的目录列表
     */
    async findMatchingDirectories(currentDir) {
        const matchingDirs = [];
        
        try {
            const items = await readdir(currentDir);
            
            for (const item of items) {
                const itemPath = path.join(currentDir, item);
                const stats = await stat(itemPath);
                
                if (stats.isDirectory()) {
                    // 检查是否应该排除该目录
                    if (this.shouldExcludeDir(item)) {
                        if (this.verbose) {
                            console.log(`跳过排除目录: ${itemPath}`);
                        }
                        continue;
                    }
                    
                    // 检查目录名是否匹配模式
                    if (this.matchesPattern(item, this.directoryPattern)) {
                        matchingDirs.push(itemPath);
                        if (this.verbose) {
                            console.log(`找到匹配目录: ${itemPath}`);
                        }
                    }
                    
                    // 递归搜索子目录
                    const subDirs = await this.findMatchingDirectories(itemPath);
                    matchingDirs.push(...subDirs);
                }
            }
        } catch (error) {
            this.results.errors.push(`读取目录失败 ${currentDir}: ${error.message}`);
            if (this.verbose) {
                console.error(`读取目录失败 ${currentDir}:`, error.message);
            }
        }
        
        return matchingDirs;
    }

    /**
     * 处理单个文件，替换其中的字符串
     * @param {string} filePath - 文件路径
     * @returns {Promise<number>} 替换次数
     */
    async processFile(filePath) {
        try {
            const content = await readFile(filePath, 'utf8');
            const originalContent = content;
            
            // 执行字符串替换
            const newContent = content.replace(
                new RegExp(this.searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                this.replaceString
            );
            
            // 计算替换次数
            const replacementCount = (originalContent.match(
                new RegExp(this.searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
            ) || []).length;
            
            if (replacementCount > 0) {
                if (!this.dryRun) {
                    await writeFile(filePath, newContent, 'utf8');
                }
                
                this.results.filesProcessed.push({
                    path: filePath,
                    replacements: replacementCount
                });
                
                if (this.verbose) {
                    console.log(`${this.dryRun ? '[预览] ' : ''}处理文件: ${filePath} (${replacementCount} 次替换)`);
                }
            }
            
            return replacementCount;
        } catch (error) {
            this.results.errors.push(`处理文件失败 ${filePath}: ${error.message}`);
            if (this.verbose) {
                console.error(`处理文件失败 ${filePath}:`, error.message);
            }
            return 0;
        }
    }

    /**
     * 处理目录中的所有文件
     * @param {string} dirPath - 目录路径
     * @returns {Promise<number>} 总替换次数
     */
    async processDirectory(dirPath) {
        let totalReplacements = 0;
        
        try {
            const items = await readdir(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = await stat(itemPath);
                
                if (stats.isDirectory()) {
                    // 递归处理子目录
                    const subReplacements = await this.processDirectory(itemPath);
                    totalReplacements += subReplacements;
                } else if (stats.isFile() && this.hasAllowedExtension(itemPath)) {
                    // 处理文件
                    const replacements = await this.processFile(itemPath);
                    totalReplacements += replacements;
                }
            }
        } catch (error) {
            this.results.errors.push(`处理目录失败 ${dirPath}: ${error.message}`);
            if (this.verbose) {
                console.error(`处理目录失败 ${dirPath}:`, error.message);
            }
        }
        
        return totalReplacements;
    }

    /**
     * 执行主要的替换操作
     * @returns {Promise<Object>} 操作结果
     */
    async execute() {
        console.log('开始执行目录字符串替换...');
        console.log(`根目录: ${this.rootDir}`);
        console.log(`目录匹配模式: ${this.directoryPattern}`);
        console.log(`搜索字符串: "${this.searchString}"`);
        console.log(`替换字符串: "${this.replaceString}"`);
        console.log(`文件扩展名: ${this.fileExtensions.join(', ')}`);
        console.log(`排除目录: ${this.excludeDirs.join(', ')}`);
        console.log(`预览模式: ${this.dryRun ? '是' : '否'}`);
        console.log('---');

        // 查找符合条件的目录
        this.results.directoriesFound = await this.findMatchingDirectories(this.rootDir);
        
        if (this.results.directoriesFound.length === 0) {
            console.log('未找到符合条件的目录');
            return this.results;
        }

        console.log(`找到 ${this.results.directoriesFound.length} 个符合条件的目录:`);
        this.results.directoriesFound.forEach(dir => {
            console.log(`  - ${dir}`);
        });
        console.log('---');

        // 处理每个找到的目录
        for (const dirPath of this.results.directoriesFound) {
            console.log(`处理目录: ${dirPath}`);
            const replacements = await this.processDirectory(dirPath);
            this.results.replacements += replacements;
        }

        // 输出结果摘要
        console.log('---');
        console.log('操作完成!');
        console.log(`找到目录数: ${this.results.directoriesFound.length}`);
        console.log(`处理文件数: ${this.results.filesProcessed.length}`);
        console.log(`总替换次数: ${this.results.replacements}`);
        
        if (this.results.errors.length > 0) {
            console.log(`错误数: ${this.results.errors.length}`);
            if (this.verbose) {
                this.results.errors.forEach(error => {
                    console.error(`错误: ${error}`);
                });
            }
        }

        return this.results;
    }
}

/**
 * 解析命令行参数
 * @param {Array} args - 命令行参数
 * @returns {Object} 解析后的选项
 */
function parseArguments(args) {
    const options = {
        rootDir: process.cwd(),
        directoryPattern: /.*/,
        searchString: '',
        replaceString: '',
        fileExtensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', '.scss', '.md', '.txt'],
        excludeDirs: ['node_modules', '.git', '.vscode', 'dist', 'build'],
        dryRun: false,
        verbose: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--root':
            case '-r':
                options.rootDir = args[++i];
                break;
            case '--pattern':
            case '-p':
                const pattern = args[++i];
                // 尝试作为正则表达式解析，否则作为字符串
                try {
                    options.directoryPattern = new RegExp(pattern);
                } catch {
                    options.directoryPattern = pattern;
                }
                break;
            case '--search':
            case '-s':
                options.searchString = args[++i];
                break;
            case '--replace':
            case '-t':
                options.replaceString = args[++i];
                break;
            case '--extensions':
            case '-e':
                options.fileExtensions = args[++i].split(',').map(ext => 
                    ext.startsWith('.') ? ext : '.' + ext
                );
                break;
            case '--exclude':
            case '-x':
                options.excludeDirs = args[++i].split(',');
                break;
            case '--dry-run':
            case '-d':
                options.dryRun = true;
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--help':
            case '-h':
                showHelp();
                process.exit(0);
                break;
        }
    }

    return options;
}

/**
 * 显示帮助信息
 */
function showHelp() {
    console.log(`
目录字符串替换工具

用法:
  node directory-string-replacer.js [选项]

选项:
  -r, --root <目录>          指定根目录 (默认: 当前目录)
  -p, --pattern <模式>       目录名匹配模式 (正则表达式或字符串)
  -s, --search <字符串>      要搜索的字符串
  -t, --replace <字符串>     替换字符串
  -e, --extensions <扩展名>  文件扩展名列表，用逗号分隔 (默认: .js,.ts,.jsx,.tsx,.json,.html,.css,.scss,.md,.txt)
  -x, --exclude <目录>       排除的目录列表，用逗号分隔 (默认: node_modules,.git,.vscode,dist,build)
  -d, --dry-run             预览模式，不实际修改文件
  -v, --verbose             详细输出
  -h, --help                显示帮助信息

示例:
  # 在src目录下查找名称包含"component"的目录，将"oldName"替换为"newName"
  node directory-string-replacer.js -r src -p component -s oldName -t newName

  # 使用正则表达式匹配目录名
  node directory-string-replacer.js -p "^test-.*" -s "describe" -t "describe.skip"

  # 预览模式，查看会进行哪些替换
  node directory-string-replacer.js -p "utils" -s "console.log" -t "logger.info" --dry-run

  # 只处理特定类型的文件
  node directory-string-replacer.js -p "components" -s "React" -t "React" -e ".js,.jsx"
`);
}

// 主程序入口
async function main() {
    try {
        const args = process.argv.slice(2);
        const options = parseArguments(args);
        
        // 验证必需参数
        if (!options.searchString) {
            console.error('错误: 必须指定搜索字符串 (-s 或 --search)');
            showHelp();
            process.exit(1);
        }
        
        if (!options.replaceString && !options.dryRun) {
            console.error('错误: 必须指定替换字符串 (-t 或 --replace)');
            showHelp();
            process.exit(1);
        }
        
        const replacer = new DirectoryStringReplacer(options);
        await replacer.execute();
        
    } catch (error) {
        console.error('执行失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此文件，则执行主程序
if (require.main === module) {
    main();
}

module.exports = DirectoryStringReplacer;
