#!/usr/bin/env node

/**
 * 目录字符串替换工具演示脚本
 * 展示各种使用场景和功能
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('=== 目录字符串替换工具演示 ===\n');

// 演示场景列表
const demos = [
    {
        title: '演示1: 基本字符串替换 - 将"OldButton"替换为"NewButton"',
        command: [
            'node', 'directory-string-replacer.js',
            '-r', 'test-project',
            '-p', 'Button',
            '-s', 'OldButton',
            '-t', 'NewButton',
            '--dry-run',
            '--verbose'
        ],
        description: '在test-project目录下查找名称包含"Button"的目录，将"OldButton"替换为"NewButton"（预览模式）'
    },
    {
        title: '演示2: 使用正则表达式匹配目录 - 匹配以"test-"开头的目录',
        command: [
            'node', 'directory-string-replacer.js',
            '-r', 'test-project',
            '-p', '^test-.*',
            '-s', 'OldButton',
            '-t', 'TestButton',
            '--dry-run',
            '--verbose'
        ],
        description: '使用正则表达式匹配以"test-"开头的目录，替换其中的字符串'
    },
    {
        title: '演示3: 替换函数名 - 将"old"开头的函数替换为"new"开头',
        command: [
            'node', 'directory-string-replacer.js',
            '-r', 'test-project',
            '-p', 'utils',
            '-s', 'old',
            '-t', 'new',
            '-e', '.js',
            '--dry-run',
            '--verbose'
        ],
        description: '在utils目录中，只处理.js文件，将"old"替换为"new"'
    },
    {
        title: '演示4: 替换CSS类名',
        command: [
            'node', 'directory-string-replacer.js',
            '-r', 'test-project',
            '-p', 'component',
            '-s', 'old-button-class',
            '-t', 'new-button-class',
            '--dry-run',
            '--verbose'
        ],
        description: '在包含"component"的目录中，替换CSS类名'
    },
    {
        title: '演示5: 实际执行替换（非预览模式）',
        command: [
            'node', 'directory-string-replacer.js',
            '-r', 'test-project',
            '-p', 'Button',
            '-s', 'OldButton',
            '-t', 'NewButton',
            '--verbose'
        ],
        description: '实际执行替换操作（注意：这会修改文件内容）'
    }
];

// 执行演示的函数
async function runDemo(demo, index) {
    return new Promise((resolve, reject) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`${index + 1}. ${demo.title}`);
        console.log(`${'='.repeat(60)}`);
        console.log(`描述: ${demo.description}`);
        console.log(`命令: ${demo.command.join(' ')}`);
        console.log('\n执行结果:');
        console.log('-'.repeat(40));

        const child = spawn(demo.command[0], demo.command.slice(1), {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`\n✅ 演示 ${index + 1} 执行成功`);
                resolve();
            } else {
                console.log(`\n❌ 演示 ${index + 1} 执行失败，退出码: ${code}`);
                reject(new Error(`演示 ${index + 1} 失败`));
            }
        });

        child.on('error', (error) => {
            console.log(`\n❌ 演示 ${index + 1} 执行出错: ${error.message}`);
            reject(error);
        });
    });
}

// 主函数
async function main() {
    try {
        console.log('开始执行演示...\n');
        
        // 执行前4个演示（预览模式）
        for (let i = 0; i < 4; i++) {
            await runDemo(demos[i], i);
            
            // 等待用户确认继续
            if (i < 3) {
                console.log('\n按回车键继续下一个演示...');
                await waitForEnter();
            }
        }

        // 询问是否执行实际替换
        console.log('\n' + '='.repeat(60));
        console.log('⚠️  警告: 下一个演示将实际修改文件内容！');
        console.log('='.repeat(60));
        console.log('是否继续执行实际替换操作？(y/N): ');
        
        const shouldContinue = await waitForInput();
        if (shouldContinue.toLowerCase() === 'y' || shouldContinue.toLowerCase() === 'yes') {
            await runDemo(demos[4], 4);
        } else {
            console.log('跳过实际替换演示。');
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 所有演示完成！');
        console.log('='.repeat(60));
        console.log('\n您可以通过以下方式使用这个工具:');
        console.log('1. 查看帮助: node directory-string-replacer.js --help');
        console.log('2. 预览模式: 添加 --dry-run 参数');
        console.log('3. 详细输出: 添加 --verbose 参数');
        console.log('4. 自定义文件类型: 使用 -e 参数指定文件扩展名');
        console.log('5. 排除目录: 使用 -x 参数排除不需要的目录');

    } catch (error) {
        console.error('\n❌ 演示执行失败:', error.message);
        process.exit(1);
    }
}

// 等待用户按回车键
function waitForEnter() {
    return new Promise((resolve) => {
        process.stdin.once('data', () => {
            resolve();
        });
    });
}

// 等待用户输入
function waitForInput() {
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
}

// 如果直接运行此文件，则执行演示
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runDemo, demos };
