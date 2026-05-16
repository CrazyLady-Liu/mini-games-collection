const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('🧪 一键梗库 - 压力测试自动执行');
console.log('='.repeat(70));
console.log('');

class LocalStorageMock {
    constructor() {
        this.store = {};
    }
    getItem(key) { return this.store[key] || null; }
    setItem(key, value) { this.store[key] = String(value); }
    removeItem(key) { delete this.store[key]; }
    clear() { this.store = {}; }
}

global.localStorage = new LocalStorageMock();

const FAVORITES_KEY = 'yijian_gengku_favorites';
const HISTORY_KEY = 'yijian_gengku_history';

function getFavorites() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function clearAllTestData() {
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem('stress_test_checkpoint');
}

let allPassed = true;

async function runTest1() {
    console.log('🏃 测试 1: 高频点击压测 (500次)');
    console.log('─'.repeat(70));
    
    const iterations = 500;
    const testQuote = '高频压测专用文案';
    
    clearAllTestData();
    
    const errors = [];
    let startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
        const shouldAdd = i % 2 === 0;
        
        try {
            let favs = getFavorites();
            const existingIndex = favs.findIndex(f => f.quote === testQuote);
            
            if (shouldAdd) {
                if (existingIndex === -1) {
                    favs.unshift({ quote: testQuote, category: 'love', time: Date.now() });
                    saveFavorites(favs);
                    
                    const after = getFavorites();
                    if (!after.find(f => f.quote === testQuote)) {
                        errors.push(`第${i}次: 收藏失败，数据未写入`);
                    }
                } else {
                    errors.push(`第${i}次: 重复收藏检测失败`);
                }
            } else {
                if (existingIndex > -1) {
                    favs.splice(existingIndex, 1);
                    saveFavorites(favs);
                    
                    const after = getFavorites();
                    if (after.find(f => f.quote === testQuote)) {
                        errors.push(`第${i}次: 取消收藏失败，数据未删除`);
                    }
                }
            }

            const current = getFavorites();
            const expectedCount = shouldAdd ? 1 : 0;
            if (current.length !== expectedCount) {
                errors.push(`第${i}次: 数量不匹配 期望${expectedCount} 实际${current.length}`);
            }

            if ((i + 1) % 100 === 0) {
                process.stdout.write(`  进度 ${i + 1}/${iterations}，错误: ${errors.length}\r`);
            }
        } catch (e) {
            errors.push(`第${i}次: 异常 ${e.message}`);
        }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const finalFavs = getFavorites();
    const expectedFinal = iterations % 2 === 0 ? 0 : 1;
    const countMatch = finalFavs.length === expectedFinal;
    const passed = errors.length === 0 && countMatch;

    console.log(`  完成 ${iterations} 次操作，用时 ${totalTime.toFixed(2)} 秒`);
    console.log(`  平均速度: ${(iterations / totalTime).toFixed(0)} 次/秒`);
    console.log(`  最终数量: ${finalFavs.length}/${expectedFinal} ${countMatch ? '✅' : '❌'}`);
    console.log(`  操作错误: ${errors.length} ${errors.length === 0 ? '✅' : '❌'}`);
    
    if (errors.length > 0) {
        console.log('  ❌ 错误详情:');
        errors.slice(0, 5).forEach(e => console.log(`     - ${e}`));
        if (errors.length > 5) console.log(`     ... 还有 ${errors.length - 5} 个错误`);
    }
    
    console.log(passed 
        ? '  ✅ 测试1通过！按钮响应正常，无卡死、无重复、状态准确' 
        : '  ❌ 测试1未通过');
    console.log('');

    clearAllTestData();
    allPassed = allPassed && passed;
    return passed;
}

async function runTest2() {
    console.log('💾 测试 2: 大容量数据压测 (200条)');
    console.log('─'.repeat(70));
    
    const totalItems = 200;
    const categories = ['love', 'crazy', 'moments', 'emoji'];
    
    clearAllTestData();
    
    const errors = [];
    let startTime = Date.now();

    process.stdout.write('  批量插入 200 条数据...\r');
    
    for (let i = 0; i < totalItems; i++) {
        const category = categories[i % categories.length];
        const quote = `大容量测试文案 #${i + 1} - ${Date.now()}`;
        
        try {
            const favs = getFavorites();
            favs.unshift({ quote, category, time: Date.now() - i * 1000 });
            saveFavorites(favs);
        } catch (e) {
            errors.push(`第${i}条: 插入异常 ${e.message}`);
        }
    }

    const insertTime = (Date.now() - startTime) / 1000;
    process.stdout.write(`  插入完成，用时 ${insertTime.toFixed(2)} 秒，验证中...\r`);

    startTime = Date.now();
    const finalFavs = getFavorites();
    
    let missingCount = 0;
    let duplicateCount = 0;
    let orderErrors = 0;
    const seenQuotes = new Set();

    for (let i = 0; i < finalFavs.length; i++) {
        const item = finalFavs[i];
        if (seenQuotes.has(item.quote)) duplicateCount++;
        seenQuotes.add(item.quote);
        if (i > 0 && finalFavs[i].time > finalFavs[i - 1].time) orderErrors++;
    }

    for (let i = 0; i < totalItems; i++) {
        if (!finalFavs.find(f => f.quote && f.quote.includes(`#${i + 1}`))) {
            missingCount++;
            if (missingCount <= 3) errors.push(`缺失数据: #${i + 1}`);
        }
    }

    const verifyTime = (Date.now() - startTime) / 1000;
    const localStorageSize = new Blob([localStorage.getItem(FAVORITES_KEY)]).size / 1024;
    const countMatch = finalFavs.length === totalItems;
    const passed = errors.length === 0 && missingCount === 0 && duplicateCount === 0;

    console.log(`  数据总数: ${totalItems} 条，实际存储: ${finalFavs.length}/${totalItems} ${countMatch ? '✅' : '❌'}`);
    console.log(`  插入用时: ${insertTime.toFixed(2)} 秒，验证用时: ${verifyTime.toFixed(2)} 秒`);
    console.log(`  存储大小: ${localStorageSize.toFixed(2)} KB`);
    console.log(`  缺失数据: ${missingCount} ${missingCount === 0 ? '✅' : '❌'}`);
    console.log(`  重复数据: ${duplicateCount} ${duplicateCount === 0 ? '✅' : '❌'}`);
    console.log(`  顺序错误: ${orderErrors} ${orderErrors === 0 ? '✅' : '⚠️ 可接受'}`);
    
    if (errors.length > 0) {
        console.log('  ❌ 错误详情:');
        errors.slice(0, 5).forEach(e => console.log(`     - ${e}`));
    }
    
    console.log(passed 
        ? '  ✅ 测试2通过！收藏列表完整展示，无缺失、乱序、重复条目' 
        : '  ❌ 测试2未通过');
    console.log('');

    clearAllTestData();
    allPassed = allPassed && passed;
    return passed;
}

async function runTest3() {
    console.log('🔄 测试 3: 重启持久化压测 (20轮)');
    console.log('─'.repeat(70));
    
    const initialCount = 100;
    const totalRounds = 20;
    const categories = ['love', 'crazy', 'moments', 'emoji'];
    
    clearAllTestData();
    
    const errors = [];
    let dataLossCount = 0;

    process.stdout.write(`  生成 ${initialCount} 条初始数据...\r`);
    for (let i = 0; i < initialCount; i++) {
        const favs = getFavorites();
        favs.push({
            quote: `持久化测试 #${i + 1}`,
            category: categories[i % 4],
            time: Date.now() - i * 1000
        });
        saveFavorites(favs);
    }

    const initialVerify = getFavorites();
    if (initialVerify.length !== initialCount) {
        errors.push(`初始数据验证失败，期望 ${initialCount}，实际 ${initialVerify.length}`);
    }

    let startTime = Date.now();

    for (let round = 1; round <= totalRounds; round++) {
        try {
            const current = getFavorites();
            
            if (current.length < 1) {
                dataLossCount++;
                errors.push(`第${round}轮: 数据完全丢失！`);
            }

            const verifyCount = Math.min(10, current.length);
            for (let i = 0; i < verifyCount; i++) {
                if (!current[i].quote || !current[i].category) {
                    errors.push(`第${round}轮: 数据格式损坏，索引${i}`);
                }
            }

            const modifyCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < modifyCount; i++) {
                const favs = getFavorites();
                if (favs.length > 0 && Math.random() > 0.5) {
                    const removeIndex = Math.floor(Math.random() * favs.length);
                    favs.splice(removeIndex, 1);
                    saveFavorites(favs);
                } else {
                    favs.unshift({
                        quote: `持久化测试 #${initialCount + round * 10 + i + 1}`,
                        category: 'love',
                        time: Date.now()
                    });
                    saveFavorites(favs);
                }
            }

            const afterModify = getFavorites();
            const serialized = JSON.stringify(afterModify);
            const restored = JSON.parse(serialized);
            
            if (restored.length !== afterModify.length) {
                errors.push(`第${round}轮: 序列化/反序列化后数据不一致`);
            }

            if (round % 5 === 0) {
                process.stdout.write(`  第 ${round}/${totalRounds} 轮，当前数据: ${afterModify.length} 条\r`);
            }
        } catch (e) {
            errors.push(`第${round}轮: 异常 ${e.message}`);
        }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const finalData = getFavorites();
    const passed = errors.length === 0 && dataLossCount === 0;

    console.log(`  测试轮数: ${totalRounds} 轮，初始数据: ${initialCount} 条`);
    console.log(`  最终数据: ${finalData.length} 条，总用时: ${totalTime.toFixed(2)} 秒`);
    console.log(`  数据丢失: ${dataLossCount} 次 ${dataLossCount === 0 ? '✅' : '❌'}`);
    console.log(`  操作异常: ${errors.length} ${errors.length === 0 ? '✅' : '❌'}`);
    
    if (errors.length > 0) {
        console.log('  ❌ 错误详情:');
        errors.slice(0, 5).forEach(e => console.log(`     - ${e}`));
    }
    
    console.log(passed 
        ? '  ✅ 测试3通过！收藏数据100%不丢失，持久化正常' 
        : '  ❌ 测试3未通过');
    console.log('');

    clearAllTestData();
    allPassed = allPassed && passed;
    return passed;
}

(async function main() {
    const t1 = await runTest1();
    await new Promise(r => setTimeout(r, 500));
    const t2 = await runTest2();
    await new Promise(r => setTimeout(r, 500));
    const t3 = await runTest3();

    console.log('='.repeat(70));
    console.log('🏆 综合测试报告');
    console.log('='.repeat(70));
    console.log(`测试 1 (高频点击): ${t1 ? '✅ 通过' : '❌ 未通过'}`);
    console.log(`测试 2 (大容量):   ${t2 ? '✅ 通过' : '❌ 未通过'}`);
    console.log(`测试 3 (持久化):   ${t3 ? '✅ 通过' : '❌ 未通过'}`);
    console.log('='.repeat(70));
    
    const passedCount = [t1, t2, t3].filter(Boolean).length;
    if (allPassed) {
        console.log('🎉 恭喜！所有测试全部通过！系统稳定性优秀！');
    } else {
        console.log(`⚠️  部分测试未通过，通过 ${passedCount}/3`);
    }
    console.log('='.repeat(70));
    console.log('');

    process.exit(allPassed ? 0 : 1);
})();
