#!/usr/bin/env node

/**
 * 快速测试脚本
 * 验证目录字符串替换工具的基本功能
 */

const DirectoryStringReplacer = require('./directory-string-replacer');
const fs = require('fs');
const path = require('path');

async function quickTest() {
    console.log('=== 快速功能测试 ===\n');

    // 测试1: 预览模式 - 查找包含"Button"的目录
    console.log('测试1: 预览模式 - 查找包含"Button"的目录');
    console.log('-'.repeat(50));
    
    const replacer1 = new DirectoryStringReplacer({
        rootDir: './test-project',
        directoryPattern: 'Input',
        searchString: 'old',
        replaceString: 'new',
        dryRun: true,
        verbose: true
    });

    try {
        const result1 = await replacer1.execute();
        console.log(`✅ 测试1完成 - 找到 ${result1.directoriesFound.length} 个目录，${result1.replacements} 次替换\n`);
    } catch (error) {
        console.log(`❌ 测试1失败: ${error.message}\n`);
    }

    // 测试2: 正则表达式匹配
    console.log('测试2: 正则表达式匹配 - 查找以"test-"开头的目录');
    console.log('-'.repeat(50));
    
    const replacer2 = new DirectoryStringReplacer({
        rootDir: './test-project',
        directoryPattern: /^utils-.*/,
        searchString: 'OldButton',
        replaceString: 'TestButton',
        dryRun: true,
        verbose: false
    });

    try {
        const result2 = await replacer2.execute();
        console.log(`✅ 测试2完成 - 找到 ${result2.directoriesFound.length} 个目录，${result2.replacements} 次替换\n`);
    } catch (error) {
        console.log(`❌ 测试2失败: ${error.message}\n`);
    }

    // 测试3: 只处理特定文件类型
    console.log('测试3: 只处理.js文件 - 在utils目录中替换函数名');
    console.log('-'.repeat(50));
    
    const replacer3 = new DirectoryStringReplacer({
        rootDir: './test-project',
        directoryPattern: 'utils',
        searchString: 'olds',
        replaceString: 'news',
        fileExtensions: ['.js'],
        dryRun: true,
        verbose: false
    });

    try {
        const result3 = await replacer3.execute();
        console.log(`✅ 测试3完成 - 找到 ${result3.directoriesFound.length} 个目录，${result3.replacements} 次替换\n`);
    } catch (error) {
        console.log(`❌ 测试3失败: ${error.message}\n`);
    }

    // 测试4: 检查测试文件是否存在
    console.log('测试4: 检查测试文件结构');
    console.log('-'.repeat(50));
    
    const testFiles = [
        'test-project/src/components/Button/index.js',
        'test-project/src/components/Input/index.js',
        'test-project/src/utils/helpers.js',
        'test-project/src/pages/Home/index.js',
        'test-project/test-components/TestButton/index.js'
    ];

    let allFilesExist = true;
    testFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} 存在`);
        } else {
            console.log(`❌ ${file} 不存在`);
            allFilesExist = false;
        }
    });

    if (allFilesExist) {
        console.log('\n✅ 所有测试文件都存在');
    } else {
        console.log('\n❌ 部分测试文件缺失');
    }

    console.log('\n=== 测试完成 ===');
    console.log('\n使用说明:');
    console.log('1. 运行完整演示: node demo.js');
    console.log('2. 查看帮助: node directory-string-replacer.js --help');
    console.log('3. 手动测试: node directory-string-replacer.js -r test-project -p Button -s OldButton -t NewButton --dry-run');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    quickTest().catch(console.error);
}

module.exports = { quickTest };
