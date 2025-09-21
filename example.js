#!/usr/bin/env node

/**
 * 目录字符串替换工具使用示例
 * 演示如何在代码中使用DirectoryStringReplacer类
 */

const DirectoryStringReplacer = require('./directory-string-replacer');

async function runExamples() {
    console.log('=== 目录字符串替换工具使用示例 ===\n');

    // 示例1: 基本使用
    console.log('示例1: 基本字符串替换');
    const replacer1 = new DirectoryStringReplacer({
        rootDir: './test-project',
        directoryPattern: 'component',
        searchString: 'oldComponentName',
        replaceString: 'newComponentName',
        dryRun: true, // 预览模式
        verbose: true
    });
    
    try {
        await replacer1.execute();
    } catch (error) {
        console.log('示例1执行失败（这是正常的，因为test-project目录可能不存在）');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 示例2: 使用正则表达式
    console.log('示例2: 使用正则表达式匹配目录');
    const replacer2 = new DirectoryStringReplacer({
        rootDir: './src',
        directoryPattern: /^page-.*/, // 匹配以"page-"开头的目录
        searchString: 'console.log',
        replaceString: 'logger.info',
        fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
        excludeDirs: ['node_modules', '.git', 'dist', 'build', 'coverage'],
        dryRun: true,
        verbose: false
    });

    try {
        await replacer2.execute();
    } catch (error) {
        console.log('示例2执行失败（这是正常的，因为src目录可能不存在）');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 示例3: 批量处理多个项目
    console.log('示例3: 批量处理多个项目');
    const projects = ['./project1', './project2', './project3'];
    
    for (const project of projects) {
        console.log(`处理项目: ${project}`);
        const replacer = new DirectoryStringReplacer({
            rootDir: project,
            directoryPattern: 'utils',
            searchString: 'deprecatedFunction',
            replaceString: 'newFunction',
            dryRun: true,
            verbose: false
        });

        try {
            const result = await replacer.execute();
            console.log(`项目 ${project} 处理完成: ${result.replacements} 次替换`);
        } catch (error) {
            console.log(`项目 ${project} 处理失败: ${error.message}`);
        }
    }

    console.log('\n=== 示例完成 ===');
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
    runExamples().catch(console.error);
}

module.exports = { runExamples };
