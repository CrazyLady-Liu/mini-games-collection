const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const jsContent = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');

const dom = new JSDOM(htmlContent, { runScripts: 'dangerously' });
const { window } = dom;

const styleElement = window.document.createElement('style');
styleElement.textContent = cssContent;
window.document.head.appendChild(styleElement);

const scriptElement = window.document.createElement('script');
scriptElement.textContent = jsContent;
window.document.body.appendChild(scriptElement);

function waitForCondition(condition, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (condition()) {
                clearInterval(interval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error('Timeout waiting for condition'));
            }
        }, 100);
    });
}

async function runTest() {
    console.log('=== 静默寻静游戏测试 ===\n');
    const results = [];
    
    try {
        await waitForCondition(() => typeof window.startGame === 'function', 2000);
        
        console.log('1. 启动游戏 - 选择简单难度');
        window.startGame('easy');
        
        for (let round = 1; round <= 7; round++) {
            console.log(`\n--- 第 ${round} 轮测试 ---`);
            
            await waitForCondition(() => window.gameState && window.gameState.icons.length > 0, 3000);
            
            const staticIndex = window.gameState.staticIndex;
            const iconCount = window.gameState.icons.length;
            const level = window.gameState.level;
            const initialScore = window.gameState.score;
            
            console.log(`  关卡: ${level}`);
            console.log(`  图标数量: ${iconCount}`);
            console.log(`  静止图标索引: ${staticIndex}`);
            console.log(`  当前得分: ${initialScore}`);
            
            const iconsGrid = window.document.getElementById('iconsGrid');
            const iconElements = iconsGrid.querySelectorAll('.icon-item');
            
            if (iconElements.length !== iconCount) {
                console.log(`  ❌ 错误: 渲染的图标数量(${iconElements.length})与预期(${iconCount})不符`);
                results.push({ round, status: 'FAIL', reason: '图标数量不匹配' });
                continue;
            }
            
            console.log(`  图标渲染: ✓ 正确`);
            
            await waitForCondition(() => window.gameState.isPlaying === true, 10000);
            console.log(`  动画完成: ✓ 已进入可点击状态`);
            
            const staticIcon = window.gameState.icons[staticIndex];
            const isStaticUnchanged = 
                staticIcon.scale === 1 && 
                staticIcon.rotation === 0 && 
                staticIcon.opacity === 1;
            
            console.log(`  静止图标状态: ${isStaticUnchanged ? '✓ 未变化' : '✗ 发生了变化'}`);
            
            const dynamicIconsChanged = window.gameState.icons
                .filter((_, i) => i !== staticIndex)
                .some(icon => icon.color !== icon.originalColor);
            
            console.log(`  动态图标变化: ${dynamicIconsChanged ? '✓ 已发生变化' : '✗ 未发生变化'}`);
            
            iconElements[staticIndex].click();
            console.log(`  点击静止图标: ✓ 已点击`);
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const successModal = window.document.getElementById('successModal');
            const isSuccessVisible = successModal.style.display === 'flex';
            
            if (isSuccessVisible) {
                console.log(`  成功弹窗: ✓ 已显示`);
                
                await new Promise(resolve => setTimeout(resolve, 1600));
                
                const newLevel = window.gameState.level;
                const newScore = window.gameState.score;
                const expectedScore = initialScore + Math.floor(100 * level * 1);
                
                const levelPassed = newLevel === level + 1;
                const scoreCorrect = newScore === expectedScore;
                
                console.log(`  关卡跳转: ${levelPassed ? `✓ 从 ${level} 到 ${newLevel}` : `✗ 预期 ${level + 1}, 实际 ${newLevel}`}`);
                console.log(`  得分计算: ${scoreCorrect ? `✓ ${newScore} (预期 ${expectedScore})` : `✗ 预期 ${expectedScore}, 实际 ${newScore}`}`);
                
                if (levelPassed && scoreCorrect && isStaticUnchanged) {
                    results.push({ 
                        round, 
                        status: 'PASS', 
                        level, 
                        iconCount, 
                        score: newScore,
                        staticIndex 
                    });
                    console.log(`  结果: ✅ 通过`);
                } else {
                    results.push({ 
                        round, 
                        status: 'PARTIAL', 
                        issues: []
                    });
                    if (!levelPassed) results[results.length-1].issues.push('关卡未跳转');
                    if (!scoreCorrect) results[results.length-1].issues.push('得分计算错误');
                    if (!isStaticUnchanged) results[results.length-1].issues.push('静止图标发生变化');
                    console.log(`  结果: ⚠️  部分通过`);
                }
            } else {
                console.log(`  成功弹窗: ✗ 未显示`);
                results.push({ round, status: 'FAIL', reason: '点击后未显示成功弹窗' });
                console.log(`  结果: ❌ 失败`);
                break;
            }
        }
        
    } catch (error) {
        console.error(`\n❌ 测试出错: ${error.message}`);
        results.push({ round: 'error', status: 'ERROR', error: error.message });
    }
    
    console.log('\n=== 测试结果汇总 ===');
    console.log(`总轮数: ${results.length}`);
    console.log(`通过: ${results.filter(r => r.status === 'PASS').length}`);
    console.log(`部分通过: ${results.filter(r => r.status === 'PARTIAL').length}`);
    console.log(`失败: ${results.filter(r => r.status === 'FAIL' || r.status === 'ERROR').length}`);
    
    console.log('\n详细结果:');
    results.forEach((r, i) => {
        if (r.status === 'PASS') {
            console.log(`  第${i+1}轮: ✅ 通过 - 关卡${r.level}, ${r.iconCount}个图标, 得分${r.score}`);
        } else if (r.status === 'PARTIAL') {
            console.log(`  第${i+1}轮: ⚠️  部分通过 - ${r.issues.join(', ')}`);
        } else {
            console.log(`  第${i+1}轮: ❌ ${r.status} - ${r.reason || r.error}`);
        }
    });
    
    const allPassed = results.every(r => r.status === 'PASS');
    console.log(`\n总体结论: ${allPassed ? '✅ 所有测试通过！' : '❌ 存在测试失败'}`);
    
    process.exit(allPassed ? 0 : 1);
}

runTest().catch(console.error);
