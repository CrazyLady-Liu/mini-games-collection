console.log('='.repeat(60));
console.log('🧪 一键梗库 - 高频点击压测工具');
console.log('='.repeat(60));
console.log('');

const FAVORITES_KEY = 'yijian_gengku_favorites';
let testResults = {
    totalClicks: 0,
    errors: 0,
    duplicates: 0,
    stateMismatch: 0,
    startTime: null,
    clickTimes: []
};

function getFavorites() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function clearFavorites() {
    localStorage.removeItem(FAVORITES_KEY);
}

async function runHighFrequencyTest(iterations = 500) {
    console.log(`🚀 开始高频点击压测，共 ${iterations} 次...`);
    console.log('');

    clearFavorites();
    
    testResults = {
        totalClicks: iterations,
        errors: 0,
        duplicates: 0,
        stateMismatch: 0,
        startTime: Date.now(),
        clickTimes: []
    };

    const favoriteBtn = document.getElementById('favorite-btn');
    const favoriteIcon = document.getElementById('favorite-icon');
    const quoteText = document.getElementById('quote-text');

    if (!favoriteBtn || !favoriteIcon || !quoteText) {
        console.error('❌ 未找到DOM元素，请确保在主页面 index.html 中运行');
        return;
    }

    const testQuote = '压测专用文案';
    const testCategory = 'love';
    const originalQuote = quoteText.textContent;

    for (let i = 0; i < iterations; i++) {
        const clickStart = Date.now();
        const shouldAdd = i % 2 === 0;

        try {
            const before = getFavorites();
            const existingIndex = before.findIndex(f => f.quote === testQuote);

            if (shouldAdd) {
                if (existingIndex === -1) {
                    before.unshift({
                    quote: testQuote,
                    category: testCategory,
                    time: Date.now()
                });
                saveFavorites(before);
                
                const after = getFavorites();
                const found = after.find(f => f.quote === testQuote);
                
                if (!found) {
                    testResults.errors++;
                    console.error(`❌ 第 ${i + 1} 次: 收藏失败，数据未写入`);
                }
            } else {
                if (existingIndex > -1) {
                    before.splice(existingIndex, 1);
                    saveFavorites(before);
                    
                    const after = getFavorites();
                    const found = after.find(f => f.quote === testQuote);
                    
                    if (found) {
                        testResults.errors++;
                        console.error(`❌ 第 ${i + 1} 次: 取消收藏失败，数据未删除`);
                    }
                } else {
                    testResults.stateMismatch++;
                    console.warn(`⚠️  第 ${i + 1} 次: 状态不一致，取消收藏时数据不存在`);
                }
            }

            const afterCount = getFavorites();
            const expectedCount = Math.ceil((i + 1) / 2);
            
            if (afterCount.length !== expectedCount) {
                testResults.errors++;
                console.error(`❌ 第 ${i + 1} 次: 数量不匹配，期望 ${expectedCount}，实际 ${afterCount.length}`);
            }

            const clickEnd = Date.now();
            testResults.clickTimes.push(clickEnd - clickStart);

            if ((i + 1) % 50 === 0) {
                console.log(`📍 进度 ${i + 1}/${iterations}，当前收藏数: ${afterCount.length}，错误: ${testResults.errors}`);
            }

            if ((i + 1) % 10 === 0) {
                await new Promise(r => setTimeout(r, 1));
            }
        } catch (e) {
            testResults.errors++;
            console.error(`❌ 第 ${i + 1} 次: 异常 - ${e.message}`);
        }
    }

    const totalTime = (Date.now() - testResults.startTime) / 1000;
    const avgTime = testResults.clickTimes.reduce((a, b) => a + b, 0) / testResults.clickTimes.length;
    const maxTime = Math.max(...testResults.clickTimes);
    const minTime = Math.min(...testResults.clickTimes);
    const finalFavorites = getFavorites();
    const expectedFinal = Math.ceil(iterations / 2);
    const countMatch = finalFavorites.length === expectedFinal;

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 测试结果');
    console.log('='.repeat(60));
    console.log(`总点击次数: ${iterations}`);
    console.log(`总用时: ${totalTime.toFixed(2)} 秒`);
    console.log(`平均速度: ${(iterations / totalTime).toFixed(0)} 次/秒`);
    console.log(`单次点击平均耗时: ${avgTime.toFixed(2)} ms`);
    console.log(`单次点击最大耗时: ${maxTime} ms`);
    console.log(`单次点击最小耗时: ${minTime} ms`);
    console.log('');
    console.log(`最终收藏数: ${finalFavorites.length} / ${expectedFinal} ${countMatch ? '✅' : '❌'}`);
    console.log(`操作错误: ${testResults.errors} ${testResults.errors === 0 ? '✅' : '❌'}`);
    console.log(`状态不一致: ${testResults.stateMismatch} ${testResults.stateMismatch === 0 ? '✅' : '❌'}`);
    console.log('');
    
    const passed = testResults.errors === 0 && countMatch && testResults.stateMismatch === 0;
    console.log(passed ? '✅ 测试通过！系统响应正常，无卡死、无重复、状态准确' : '❌ 测试未通过');
    console.log('='.repeat(60));
    
    quoteText.textContent = originalQuote;
    
    return passed;
}

console.log('💡 使用方法:');
console.log('  1. 打开主页面: http://localhost:3000');
console.log('  2. 打开浏览器控制台 (F12)');
console.log('  3. 粘贴并执行: runHighFrequencyTest(500)');
console.log('  4. 观察控制台输出测试结果');
console.log('');
console.log('⏰ 预计耗时: 约 5-10 秒 (500次)');
console.log('='.repeat(60));
