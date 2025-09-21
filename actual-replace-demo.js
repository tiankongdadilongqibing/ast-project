#!/usr/bin/env node

/**
 * 实际替换演示脚本
 * 展示工具的实际替换功能
 */

const DirectoryStringReplacer = require('./directory-string-replacer');
const fs = require('fs');
const path = require('path');

async function actualReplaceDemo() {
    console.log('=== 实际替换功能演示 ===\n');

    // 备份原始文件
    console.log('1. 备份原始文件...');
    const backupDir = './test-project-backup';
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // 复制测试项目到备份目录
    await copyDirectory('./test-project', backupDir);
    console.log('✅ 备份完成\n');

    // 演示1: 实际替换 - 将"OldButton"替换为"NewButton"
    console.log('2. 执行实际替换 - 将"OldButton"替换为"NewButton"');
    console.log('-'.repeat(60));
    
    const replacer1 = new DirectoryStringReplacer({
        rootDir: './test-project',
        directoryPattern: 'Button',
        searchString: 'OldButton',
        replaceString: 'NewButton',
        dryRun: false, // 实际执行替换
        verbose: true
    });

    try {
        const result1 = await replacer1.execute();
        console.log(`✅ 替换完成 - 找到 ${result1.directoriesFound.length} 个目录，${result1.replacements} 次替换\n`);
    } catch (error) {
        console.log(`❌ 替换失败: ${error.message}\n`);
    }

    // 显示替换后的文件内容
    console.log('3. 查看替换后的文件内容:');
    console.log('-'.repeat(60));
    const buttonFile = './test-project/src/components/Button/index.js';
    if (fs.existsSync(buttonFile)) {
        const content = fs.readFileSync(buttonFile, 'utf8');
        console.log('Button组件文件内容:');
        console.log(content);
    }

    // 演示2: 替换CSS类名
    console.log('\n4. 执行CSS类名替换 - 将"old-button-class"替换为"new-button-class"');
    console.log('-'.repeat(60));
    
    const replacer2 = new DirectoryStringReplacer({
        rootDir: './test-project',
        directoryPattern: 'Button',
        searchString: 'old-button-class',
        replaceString: 'new-button-class',
        dryRun: false,
        verbose: true
    });

    try {
        const result2 = await replacer2.execute();
        console.log(`✅ CSS类名替换完成 - ${result2.replacements} 次替换\n`);
    } catch (error) {
        console.log(`❌ CSS类名替换失败: ${error.message}\n`);
    }

    // 显示最终的文件内容
    console.log('5. 查看最终的文件内容:');
    console.log('-'.repeat(60));
    if (fs.existsSync(buttonFile)) {
        const content = fs.readFileSync(buttonFile, 'utf8');
        console.log('最终Button组件文件内容:');
        console.log(content);
    }

    // 演示3: 替换函数名
    console.log('\n6. 执行函数名替换 - 在utils目录中将"old"替换为"new"');
    console.log('-'.repeat(60));
    
    const replacer3 = new DirectoryStringReplacer({
        rootDir: './test-project',
        directoryPattern: 'utils',
        searchString: 'old',
        replaceString: 'new',
        fileExtensions: ['.js'],
        dryRun: false,
        verbose: true
    });

    try {
        const result3 = await replacer3.execute();
        console.log(`✅ 函数名替换完成 - ${result3.replacements} 次替换\n`);
    } catch (error) {
        console.log(`❌ 函数名替换失败: ${error.message}\n`);
    }

    // 显示utils文件内容
    console.log('7. 查看utils文件替换后的内容:');
    console.log('-'.repeat(60));
    const utilsFile = './test-project/src/utils/helpers.js';
    if (fs.existsSync(utilsFile)) {
        const content = fs.readFileSync(utilsFile, 'utf8');
        console.log('Utils文件内容:');
        console.log(content);
    }

    // 对比原始文件和修改后的文件
    console.log('\n8. 对比原始文件和修改后的文件:');
    console.log('-'.repeat(60));
    await compareFiles();

    console.log('\n=== 演示完成 ===');
    console.log('\n说明:');
    console.log('- 原始文件已备份到 test-project-backup 目录');
    console.log('- 当前 test-project 目录中的文件已被修改');
    console.log('- 如需恢复，请从备份目录复制文件');
}

// 复制目录的辅助函数
async function copyDirectory(src, dest) {
    const items = fs.readdirSync(src);
    
    for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            await copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 对比文件的辅助函数
async function compareFiles() {
    const files = [
        'src/components/Button/index.js',
        'src/utils/helpers.js'
    ];

    for (const file of files) {
        const originalFile = path.join('./test-project-backup', file);
        const modifiedFile = path.join('./test-project', file);
        
        if (fs.existsSync(originalFile) && fs.existsSync(modifiedFile)) {
            const originalContent = fs.readFileSync(originalFile, 'utf8');
            const modifiedContent = fs.readFileSync(modifiedFile, 'utf8');
            
            console.log(`\n文件: ${file}`);
            console.log('原始内容:');
            console.log(originalContent);
            console.log('\n修改后内容:');
            console.log(modifiedContent);
            console.log('\n' + '='.repeat(40));
        }
    }
}

// 如果直接运行此文件，则执行演示
if (require.main === module) {
    actualReplaceDemo().catch(console.error);
}

module.exports = { actualReplaceDemo };
