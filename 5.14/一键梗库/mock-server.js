const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mockHotMemes = [
    { title: "2026年最新热梗：AI伴侣成为标配" },
    { title: "谁懂啊！元宇宙上班第一天就迟到" },
    { title: "量子计算手机发布，充电1秒用1个月" },
    { title: "火星旅游开放预订，票价只要999999" },
    { title: "脑机接口游戏头盔正式发售" },
    { title: "全自动做饭机器人普及，厨师集体转型" },
    { title: "无人驾驶出租车覆盖全国" },
    { title: "虚拟偶像代言费超过真人明星" },
    { title: "全球首个海上漂浮城市投入使用" },
    { title: "6G网络正式商用，下载速度达1TB/s" },
    { title: "家用机器人保姆销量破亿" },
    { title: "太空电梯项目启动建设" },
    { title: "全息投影会议室成为标配" },
    { title: "人造肉汉堡销量超过传统牛肉" },
    { title: "智能眼镜彻底取代智能手机" }
];

const mockCrazyTexts = [
    "谁懂啊家人们！2026年了我还在为了几两碎银折腰！",
    "咱就是说一整个被AI卷死的大动作！",
    "救命！现在的年轻人都开始养虚拟宠物了！",
    "我真的会谢！元宇宙里买房比现实还贵！",
    "破防了破防了！机器人都比我会谈恋爱！",
    "咱就是说狠狠的被科技抛弃了！",
    "家人们谁懂啊！我家机器人都比我会说情话！",
    "我不发疯谁发疯！连AI都有年假我没有！",
    "无语住了家人们！无人驾驶都比我开车稳！",
    "咱就是说一整个想移民火星的大动作！"
];

const mockLoveQuotes = [
    "在元宇宙里遇见你，是我最美丽的意外",
    "你是我的量子纠缠，相隔万里也能感受到你的存在",
    "即使是AI，也计算不出我对你的爱有多深",
    "你是我的6G网络，让我的世界飞速运转",
    "在火星遇见你，是我宇宙旅行最棒的收获"
];

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    if (req.url === '/api/hotlist/hotlist') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        });
        const delay = Math.random() * 500 + 100;
        setTimeout(() => {
            res.end(JSON.stringify({
                code: 200,
                message: 'success',
                data: mockHotMemes
            }));
        }, delay);
        return;
    }

    if (req.url === '/api/crazy') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify({
            code: 200,
            data: mockCrazyTexts
        }));
        return;
    }

    if (req.url === '/api/love') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify({
            code: 200,
            data: mockLoveQuotes
        }));
        return;
    }

    if (req.url === '/api/network-error') {
        res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
        return;
    }

    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('🎭 一键梗库 - Mock 测试服务器已启动');
    console.log('='.repeat(60));
    console.log('');
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log('');
    console.log('📡 可用 API 接口:');
    console.log('   GET /api/hotlist/hotlist    - 获取热门热梗（模拟网络延迟）');
    console.log('   GET /api/crazy              - 获取发疯文学');
    console.log('   GET /api/love               - 获取土味情话');
    console.log('   GET /api/network-error      - 模拟网络错误（500）');
    console.log('');
    console.log('🧪 测试说明:');
    console.log(`   1. 打开 http://localhost:${PORT} 测试在线模式`);
    console.log('   2. 点击「模拟断网」测试离线回退');
    console.log('   3. 点击「清除缓存」后刷新测试首次加载');
    console.log('   4. 停止服务器后刷新测试真实断网场景');
    console.log('');
    console.log('📝 Mock 数据包含:');
    console.log(`   - ${mockHotMemes.length} 条最新热梗`);
    console.log(`   - ${mockCrazyTexts.length} 条发疯文学`);
    console.log(`   - ${mockLoveQuotes.length} 条土味情话`);
    console.log('');
    console.log('按 Ctrl+C 停止服务器');
    console.log('='.repeat(60));
    console.log('');
});
