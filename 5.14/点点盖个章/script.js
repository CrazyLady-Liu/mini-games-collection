var gameState = {
    selectedStamp: null,
    stamps: [],
    isPressing: false,
    referenceVisible: false,
    referenceOverlay: false,
    currentLevel: 0,
    isLevelComplete: false,
    isTransitioning: false,
    stampSize: 60,
    stampRotation: 0,
    stampOpacity: 85
};

var targetPatterns = [
    {
        name: "第1关：小花",
        elements: [
            { type: "flower", x: 60, y: 80 },
            { type: "flower", x: 180, y: 100 },
            { type: "flower", x: 300, y: 80 }
        ]
    },
    {
        name: "第2关：笑脸",
        elements: [
            { type: "smile", x: 180, y: 80 }
        ]
    },
    {
        name: "第3关：爱心组合",
        elements: [
            { type: "heart", x: 80, y: 80 },
            { type: "heart", x: 200, y: 60 },
            { type: "heart", x: 320, y: 80 }
        ]
    },
    {
        name: "第4关：云朵群",
        elements: [
            { type: "cloud", x: 50, y: 70 },
            { type: "cloud", x: 190, y: 90 },
            { type: "cloud", x: 330, y: 70 }
        ]
    },
    {
        name: "第5关：星星点灯",
        elements: [
            { type: "star", x: 60, y: 40 },
            { type: "star", x: 180, y: 80 },
            { type: "star", x: 300, y: 40 },
            { type: "star", x: 120, y: 150 },
            { type: "star", x: 240, y: 150 }
        ]
    },
    {
        name: "第6关：彩虹花园",
        elements: [
            { type: "flower", x: 60, y: 130 },
            { type: "smile", x: 200, y: 70 },
            { type: "heart", x: 340, y: 130 },
            { type: "rainbow", x: 180, y: 160 }
        ]
    },
    {
        name: "第7关：梦幻天空",
        elements: [
            { type: "cloud", x: 30, y: 30 },
            { type: "star", x: 180, y: 70 },
            { type: "cloud", x: 330, y: 30 },
            { type: "moon", x: 100, y: 150 },
            { type: "star", x: 260, y: 150 }
        ]
    }
];

var stampSVGs = {
    flower: '<svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="20" fill="#ff9e9e"/><circle cx="30" cy="20" r="5" fill="#ff6b6b"/><circle cx="40" cy="30" r="5" fill="#ff6b6b"/><circle cx="30" cy="40" r="5" fill="#ff6b6b"/><circle cx="20" cy="30" r="5" fill="#ff6b6b"/><circle cx="26" cy="26" r="5" fill="#ff6b6b"/><circle cx="34" cy="26" r="5" fill="#ff6b6b"/><circle cx="26" cy="34" r="5" fill="#ff6b6b"/><circle cx="34" cy="34" r="5" fill="#ff6b6b"/></svg>',
    smile: '<svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="20" fill="#ffd93d"/><circle cx="24" cy="25" r="3" fill="#333"/><circle cx="36" cy="25" r="3" fill="#333"/><path d="M20,35 Q30,45 40,35" stroke="#333" stroke-width="3" fill="none"/></svg>',
    heart: '<svg width="60" height="60" viewBox="0 0 60 60"><path d="M30,10 Q35,5 40,15 Q45,5 50,15 Q55,25 45,35 Q40,45 30,40 Q20,45 15,35 Q5,25 10,15 Q15,5 20,15 Q25,5 30,10" fill="#ff6b6b"/></svg>',
    cloud: '<svg width="60" height="60" viewBox="0 0 60 60"><circle cx="25" cy="35" r="10" fill="#e0e0e0"/><circle cx="35" cy="30" r="12" fill="#e0e0e0"/><circle cx="45" cy="35" r="10" fill="#e0e0e0"/><rect x="15" y="35" width="35" height="10" fill="#e0e0e0"/></svg>',
    star: '<svg width="60" height="60" viewBox="0 0 60 60"><path d="M30,5 L36,22 L55,22 L40,33 L46,52 L30,41 L14,52 L20,33 L5,22 L24,22 Z" fill="#ffd93d"/></svg>',
    moon: '<svg width="60" height="60" viewBox="0 0 60 60"><path d="M45,15 Q25,20 25,35 Q25,50 45,50 Q30,45 30,32 Q30,20 45,15" fill="#c4a7e7"/></svg>',
    leaf: '<svg width="60" height="60" viewBox="0 0 60 60"><path d="M30,10 Q45,20 45,35 Q45,50 30,55 Q15,50 15,35 Q15,20 30,10" fill="#81c784"/><path d="M30,15 L30,50" stroke="#4caf50" stroke-width="2" fill="none"/><path d="M30,25 L40,30" stroke="#4caf50" stroke-width="1.5" fill="none"/><path d="M30,35 L40,38" stroke="#4caf50" stroke-width="1.5" fill="none"/><path d="M30,25 L20,30" stroke="#4caf50" stroke-width="1.5" fill="none"/><path d="M30,35 L20,38" stroke="#4caf50" stroke-width="1.5" fill="none"/></svg>',
    dot: '<svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="15" fill="#4fc3f7"/></svg>',
    petal: '<svg width="60" height="60" viewBox="0 0 60 60"><ellipse cx="30" cy="25" rx="10" ry="18" fill="#f8bbd0"/><ellipse cx="20" cy="35" rx="10" ry="18" fill="#f48fb1" transform="rotate(-45 20 35)"/><ellipse cx="40" cy="35" rx="10" ry="18" fill="#f48fb1" transform="rotate(45 40 35)"/><circle cx="30" cy="35" r="6" fill="#ffeb3b"/></svg>',
    triangle: '<svg width="60" height="60" viewBox="0 0 60 60"><path d="M30,10 L50,45 L10,45 Z" fill="#80deea"/></svg>',
    diamond: '<svg width="60" height="60" viewBox="0 0 60 60"><path d="M30,5 L55,30 L30,55 L5,30 Z" fill="#ce93d8"/></svg>',
    rainbow: '<svg width="60" height="60" viewBox="0 0 60 60"><path d="M10,45 Q30,5 50,45" stroke="#ef5350" stroke-width="4" fill="none"/><path d="M15,45 Q30,12 45,45" stroke="#ffa726" stroke-width="4" fill="none"/><path d="M20,45 Q30,19 40,45" stroke="#ffee58" stroke-width="4" fill="none"/><path d="M25,45 Q30,26 35,45" stroke="#66bb6a" stroke-width="4" fill="none"/><path d="M28,45 Q30,33 32,45" stroke="#42a5f5" stroke-width="4" fill="none"/></svg>'
};

function initGame() {
    setupEventListeners();
    loadTargetPattern();
    updateLevelDisplay();
    updateStampPreview();
    startMatchDetection();
    
    var targetPattern = document.getElementById('targetPattern');
    targetPattern.classList.add('visible');
    document.getElementById('toggleReference').textContent = '隐藏参考图 (R)';
    gameState.referenceVisible = true;
}

function setupEventListeners() {
    document.querySelectorAll('.stamp').forEach(function(stamp) {
        stamp.addEventListener('click', function() {
            selectStamp(stamp.dataset.stamp);
        });
    });
    
    var canvas = document.getElementById('canvas');
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('toggleReference').addEventListener('click', toggleReference);
    document.getElementById('overlayBtn').addEventListener('click', toggleOverlay);
    document.getElementById('saveBtn').addEventListener('click', saveArtwork);
    
    document.getElementById('sizeSlider').addEventListener('input', handleSizeChange);
    document.getElementById('sizeDown').addEventListener('click', function() { adjustSize(-5); });
    document.getElementById('sizeUp').addEventListener('click', function() { adjustSize(5); });
    document.getElementById('sizeReset').addEventListener('click', function() { resetSize(); });
    
    document.getElementById('rotateSlider').addEventListener('input', handleRotationChange);
    document.getElementById('rotateLeft').addEventListener('click', function() { adjustRotation(-15); });
    document.getElementById('rotateRight').addEventListener('click', function() { adjustRotation(15); });
    document.getElementById('rotateReset').addEventListener('click', function() { resetRotation(); });
    
    document.getElementById('opacitySlider').addEventListener('input', handleOpacityChange);
    
    document.addEventListener('keydown', handleKeyboard);
}

function selectStamp(stampType) {
    gameState.selectedStamp = stampType;
    
    document.querySelectorAll('.stamp').forEach(function(stamp) {
        if (stamp.dataset.stamp === stampType) {
            stamp.classList.add('selected');
        } else {
            stamp.classList.remove('selected');
        }
    });
    
    updateStampPreview();
}

function updateStampPreview() {
    var preview = document.getElementById('stampPreview');
    if (!preview) {
        preview = document.createElement('div');
        preview.id = 'stampPreview';
        preview.className = 'stamp-preview';
        document.body.appendChild(preview);
    }
    
    if (gameState.selectedStamp) {
        preview.innerHTML = stampSVGs[gameState.selectedStamp];
        preview.style.width = gameState.stampSize + 'px';
        preview.style.height = gameState.stampSize + 'px';
        preview.style.transform = 'rotate(' + gameState.stampRotation + 'deg)';
        preview.style.opacity = gameState.stampOpacity / 100;
    } else {
        preview.style.display = 'none';
    }
}

function handleMouseDown(e) {
    if (!gameState.selectedStamp || gameState.isTransitioning) return;
    
    gameState.isPressing = true;
    createStampImpression(e);
}

function handleMouseUp() {
    gameState.isPressing = false;
    
    document.querySelectorAll('.stamp-pressing').forEach(function(el) {
        el.classList.remove('stamp-pressing');
    });
}

function handleMouseMove(e) {
    var preview = document.getElementById('stampPreview');
    if (preview && gameState.selectedStamp) {
        preview.style.display = 'block';
        preview.style.left = (e.clientX - gameState.stampSize / 2) + 'px';
        preview.style.top = (e.clientY - gameState.stampSize / 2) + 'px';
    }
    
    if (gameState.isPressing && gameState.selectedStamp && !gameState.isTransitioning) {
        createStampImpression(e);
    }
}

function createStampImpression(e) {
    var canvas = document.getElementById('canvas');
    var rect = canvas.getBoundingClientRect();
    var halfSize = gameState.stampSize / 2;
    var x = e.clientX - rect.left - halfSize;
    var y = e.clientY - rect.top - halfSize;
    
    var stampImpression = document.createElement('div');
    stampImpression.className = 'stamp-impression stamp-pressing';
    stampImpression.style.left = x + 'px';
    stampImpression.style.top = y + 'px';
    stampImpression.style.width = gameState.stampSize + 'px';
    stampImpression.style.height = gameState.stampSize + 'px';
    stampImpression.style.opacity = gameState.stampOpacity / 100;
    stampImpression.style.transform = 'rotate(' + gameState.stampRotation + 'deg)';
    stampImpression.dataset.type = gameState.selectedStamp;
    stampImpression.dataset.size = gameState.stampSize;
    stampImpression.dataset.rotation = gameState.stampRotation;
    stampImpression.dataset.opacity = gameState.stampOpacity;
    stampImpression.innerHTML = stampSVGs[gameState.selectedStamp];
    
    var svg = stampImpression.querySelector('svg');
    if (svg) {
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
    }
    
    canvas.appendChild(stampImpression);
    
    gameState.stamps.push({
        element: stampImpression,
        type: gameState.selectedStamp,
        x: x,
        y: y,
        size: gameState.stampSize,
        rotation: gameState.stampRotation,
        opacity: gameState.stampOpacity
    });
    
    setTimeout(function() {
        stampImpression.classList.remove('stamp-pressing');
    }, 200);
}

function handleSizeChange(e) {
    gameState.stampSize = parseInt(e.target.value);
    document.getElementById('sizeValue').textContent = gameState.stampSize;
    updateStampPreview();
}

function adjustSize(delta) {
    var newSize = gameState.stampSize + delta;
    newSize = Math.max(20, Math.min(150, newSize));
    gameState.stampSize = newSize;
    document.getElementById('sizeSlider').value = newSize;
    document.getElementById('sizeValue').textContent = newSize;
    updateStampPreview();
    showToast('大小：' + newSize + 'px');
}

function resetSize() {
    gameState.stampSize = 60;
    document.getElementById('sizeSlider').value = 60;
    document.getElementById('sizeValue').textContent = 60;
    updateStampPreview();
    showToast('大小已重置');
}

function handleRotationChange(e) {
    gameState.stampRotation = parseInt(e.target.value);
    document.getElementById('rotateValue').textContent = gameState.stampRotation;
    updateStampPreview();
}

function adjustRotation(delta) {
    var newRotation = gameState.stampRotation + delta;
    newRotation = ((newRotation % 360) + 360) % 360;
    gameState.stampRotation = newRotation;
    document.getElementById('rotateSlider').value = newRotation;
    document.getElementById('rotateValue').textContent = newRotation;
    updateStampPreview();
    showToast('旋转：' + newRotation + '°');
}

function resetRotation() {
    gameState.stampRotation = 0;
    document.getElementById('rotateSlider').value = 0;
    document.getElementById('rotateValue').textContent = 0;
    updateStampPreview();
    showToast('旋转已重置');
}

function handleOpacityChange(e) {
    gameState.stampOpacity = parseInt(e.target.value);
    document.getElementById('opacityValue').textContent = gameState.stampOpacity;
    updateStampPreview();
}

function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    }
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (gameState.stamps.length > 0) {
            e.preventDefault();
            clearCanvas();
        }
    }
    
    if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        toggleReference();
    }
    
    if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        toggleOverlay();
    }
    
    if (e.key === '[') {
        e.preventDefault();
        adjustSize(-5);
    }
    
    if (e.key === ']') {
        e.preventDefault();
        adjustSize(5);
    }
    
    if (e.key === ',') {
        e.preventDefault();
        adjustRotation(-15);
    }
    
    if (e.key === '.') {
        e.preventDefault();
        adjustRotation(15);
    }
    
    var keyMap = {'1': 'flower', '2': 'smile', '3': 'heart', '4': 'cloud', '5': 'star', '6': 'moon', '7': 'leaf', '8': 'dot', '9': 'petal'};
    if (keyMap[e.key]) {
        selectStamp(keyMap[e.key]);
    }
}

function undo() {
    if (gameState.stamps.length > 0 && !gameState.isTransitioning) {
        var lastStamp = gameState.stamps.pop();
        if (lastStamp && lastStamp.element && lastStamp.element.parentNode) {
            lastStamp.element.style.transition = 'all 0.2s ease';
            lastStamp.element.style.opacity = '0';
            lastStamp.element.style.transform = 'scale(0.5) rotate(' + lastStamp.rotation + 'deg)';
            
            setTimeout(function() {
                if (lastStamp.element.parentNode) {
                    lastStamp.element.parentNode.removeChild(lastStamp.element);
                }
            }, 200);
        }
        showToast('已撤销');
    }
}

function clearCanvas() {
    if (gameState.isTransitioning) return;
    
    if (gameState.stamps.length === 0) {
        showToast('画布已经是空的');
        return;
    }
    
    if (confirm('确定要清空所有印章吗？')) {
        var canvas = document.getElementById('canvas');
        var overlay = document.getElementById('referenceOverlay');
        
        canvas.innerHTML = '';
        if (overlay) {
            canvas.appendChild(overlay);
        }
        
        gameState.stamps = [];
        gameState.isLevelComplete = false;
        showToast('已清空画布');
    }
}

function toggleReference() {
    gameState.referenceVisible = !gameState.referenceVisible;
    var targetPattern = document.getElementById('targetPattern');
    var toggleBtn = document.getElementById('toggleReference');
    
    if (gameState.referenceVisible) {
        targetPattern.classList.add('visible');
        toggleBtn.textContent = '隐藏参考图 (R)';
        showToast('显示参考图');
    } else {
        targetPattern.classList.remove('visible');
        toggleBtn.textContent = '显示参考图 (R)';
        showToast('隐藏参考图');
    }
}

function toggleOverlay() {
    gameState.referenceOverlay = !gameState.referenceOverlay;
    var canvas = document.getElementById('canvas');
    var overlayBtn = document.getElementById('overlayBtn');
    var existingOverlay = document.getElementById('referenceOverlay');
    
    if (gameState.referenceOverlay) {
        if (!existingOverlay) {
            var overlay = document.createElement('div');
            overlay.id = 'referenceOverlay';
            overlay.className = 'reference-overlay';
            
            var currentPattern = targetPatterns[gameState.currentLevel];
            currentPattern.elements.forEach(function(element) {
                var stamp = document.createElement('div');
                stamp.className = 'stamp-impression overlay-stamp';
                stamp.style.left = element.x + 'px';
                stamp.style.top = element.y + 'px';
                stamp.innerHTML = stampSVGs[element.type];
                overlay.appendChild(stamp);
            });
            
            canvas.appendChild(overlay);
        }
        overlayBtn.textContent = '关闭叠加 (O)';
        showToast('叠加模式已开启');
    } else {
        if (existingOverlay) {
            existingOverlay.remove();
        }
        overlayBtn.textContent = '叠加参考 (O)';
        showToast('叠加模式已关闭');
    }
}

function saveArtwork() {
    if (gameState.stamps.length === 0) {
        showToast('画布是空的，先盖几个章吧！');
        return;
    }
    
    var canvas = document.getElementById('canvas');
    var rect = canvas.getBoundingClientRect();
    
    var svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="' + rect.width + '" height="' + rect.height + '" viewBox="0 0 ' + rect.width + ' ' + rect.height + '">';
    svgContent += '<rect width="100%" height="100%" fill="#fafafa"/>';
    
    gameState.stamps.forEach(function(stamp) {
        var centerX = stamp.x + stamp.size / 2;
        var centerY = stamp.y + stamp.size / 2;
        svgContent += '<g transform="translate(' + centerX + ',' + centerY + ') rotate(' + stamp.rotation + ') scale(' + (stamp.size / 60) + ')" opacity="' + (stamp.opacity / 100) + '">';
        svgContent += '<g transform="translate(-30,-30)">';
        svgContent += stampSVGs[stamp.type].replace(/<svg[^>]*>|<\/svg>/g, '');
        svgContent += '</g></g>';
    });
    
    svgContent += '</svg>';
    
    var blob = new Blob([svgContent], {type: 'image/svg+xml'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '我的印章作品_' + Date.now() + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('作品已保存！');
}

function showToast(message) {
    var existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 1500);
}

function loadTargetPattern() {
    var targetPattern = document.getElementById('targetPattern');
    targetPattern.innerHTML = '';
    
    var currentPattern = targetPatterns[gameState.currentLevel];
    
    currentPattern.elements.forEach(function(element) {
        var stamp = document.createElement('div');
        stamp.className = 'stamp-impression';
        stamp.style.left = element.x + 'px';
        stamp.style.top = element.y + 'px';
        stamp.innerHTML = stampSVGs[element.type];
        
        var svg = stamp.querySelector('svg');
        if (svg) {
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.display = 'block';
        }
        
        targetPattern.appendChild(stamp);
    });
}

function updateLevelDisplay() {
    var levelInfo = document.getElementById('levelInfo');
    if (levelInfo) {
        levelInfo.textContent = targetPatterns[gameState.currentLevel].name;
    }
}

function startMatchDetection() {
    setInterval(function() {
        if (!gameState.isLevelComplete && !gameState.isTransitioning && gameState.stamps.length > 0) {
            checkMatch();
        }
    }, 500);
}

function checkMatch() {
    var target = targetPatterns[gameState.currentLevel];
    var playerStamps = gameState.stamps;
    
    if (playerStamps.length < target.elements.length) return;
    
    var tolerance = 60;
    var matchedCount = 0;
    var matchedTargets = new Set();
    
    for (var i = 0; i < playerStamps.length; i++) {
        var playerStamp = playerStamps[i];
        for (var j = 0; j < target.elements.length; j++) {
            if (matchedTargets.has(j)) continue;
            
            var targetEl = target.elements[j];
            if (playerStamp.type === targetEl.type) {
                var dx = playerStamp.x - targetEl.x;
                var dy = playerStamp.y - targetEl.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < tolerance) {
                    matchedCount++;
                    matchedTargets.add(j);
                    break;
                }
            }
        }
    }
    
    var matchRatio = matchedCount / target.elements.length;
    if (matchRatio >= 0.7) {
        levelComplete();
    }
}

function levelComplete() {
    if (gameState.isLevelComplete || gameState.isTransitioning) return;
    
    gameState.isLevelComplete = true;
    gameState.isTransitioning = true;
    
    showCompletionEffect();
    
    setTimeout(function() {
        if (gameState.currentLevel < targetPatterns.length - 1) {
            nextLevel();
        } else {
            showGameComplete();
        }
    }, 2500);
}

function showCompletionEffect() {
    var canvas = document.getElementById('canvas');
    canvas.classList.add('level-complete');
    
    createSparkles(canvas);
    
    var completionText = document.createElement('div');
    completionText.className = 'completion-text';
    completionText.textContent = '太棒了！✨';
    canvas.appendChild(completionText);
    
    setTimeout(function() {
        completionText.remove();
    }, 2000);
}

function createSparkles(container) {
    var containerRect = container.getBoundingClientRect();
    
    for (var i = 0; i < 30; i++) {
        (function(index) {
            setTimeout(function() {
                var sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                
                var size = Math.random() * 10 + 5;
                var x = Math.random() * (containerRect.width - size);
                var y = Math.random() * (containerRect.height - size);
                
                sparkle.style.width = size + 'px';
                sparkle.style.height = size + 'px';
                sparkle.style.left = x + 'px';
                sparkle.style.top = y + 'px';
                
                var colors = ['#ffd93d', '#ff6b6b', '#4ecdc4', '#c4a7e7', '#ff9e9e'];
                sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                container.appendChild(sparkle);
                
                setTimeout(function() {
                    sparkle.remove();
                }, 1500);
            }, index * 50);
        })(i);
    }
}

function nextLevel() {
    var canvas = document.getElementById('canvas');
    canvas.classList.add('transitioning');
    
    setTimeout(function() {
        gameState.currentLevel++;
        gameState.isLevelComplete = false;
        gameState.isTransitioning = false;
        gameState.referenceOverlay = false;
        
        var overlay = document.getElementById('referenceOverlay');
        if (overlay) {
            overlay.remove();
        }
        var overlayBtn = document.getElementById('overlayBtn');
        if (overlayBtn) {
            overlayBtn.textContent = '叠加参考 (O)';
        }
        
        var savedReferenceVisible = gameState.referenceVisible;
        clearCanvas();
        loadTargetPattern();
        updateLevelDisplay();
        gameState.referenceVisible = savedReferenceVisible;
        
        if (gameState.referenceVisible) {
            document.getElementById('targetPattern').classList.add('visible');
            document.getElementById('toggleReference').textContent = '隐藏参考图 (R)';
        }
        
        canvas.classList.remove('level-complete', 'transitioning');
    }, 500);
}

function showGameComplete() {
    var canvas = document.getElementById('canvas');
    canvas.classList.add('game-complete');
    
    var gameCompleteText = document.createElement('div');
    gameCompleteText.className = 'game-complete-text';
    gameCompleteText.innerHTML = '🎉 恭喜通关！<br>你是盖章大师！';
    canvas.appendChild(gameCompleteText);
    
    createSparkles(canvas);
    
    var restartBtn = document.createElement('button');
    restartBtn.className = 'restart-btn';
    restartBtn.textContent = '重新开始';
    restartBtn.addEventListener('click', function() {
        location.reload();
    });
    canvas.appendChild(restartBtn);
}

initGame();
