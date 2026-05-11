const images = [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20mountain%20landscape%20at%20sunrise%2C%20soft%20colors%2C%20peaceful%20scene&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20plants%20leaves%20minimalist%20aesthetic%2C%20natural%20light&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20window%20view%20with%20tea%20cup%2C%20rainy%20day%2C%20warm%20lighting&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=peaceful%20ocean%20waves%20at%20sunset%2C%20soft%20pastel%20colors&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20succulent%20plants%20arrangement%2C%20minimalist%20style&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forest%20path%20with%20sunlight%20filtering%20through%20trees%2C%20magical%20atmosphere&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=starry%20night%20sky%20minimalist%20illustration%2C%20dreamy%20scene&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cherry%20blossom%20petals%20floating%2C%20soft%20pink%20aesthetic&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20lake%20reflection%20with%20clouds%2C%20serene%20peaceful%20scene&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=warm%20coffee%20and%20books%20on%20wooden%20table%2C%20cozy%20aesthetic&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=soft%20clouds%20in%20blue%20sky%20minimalist%2C%20calm%20atmosphere&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bamboo%20forest%20with%20sunlight%2C%20zen%20meditation%20scene&image_size=square_hd'
];

let currentImageIndex = 0;
let pieces = [];
let placedPieces = 0;
let draggedPiece = null;
let offsetX = 0;
let offsetY = 0;

const puzzleContainer = document.getElementById('puzzleContainer');
const completeOverlay = document.getElementById('completeOverlay');
const completeImage = document.getElementById('completeImage');
const resetBtn = document.getElementById('resetBtn');
const changeImageBtn = document.getElementById('changeImageBtn');
const hintBtn = document.getElementById('hintBtn');
const imageSelector = document.getElementById('imageSelector');
const thumbnailsContainer = document.getElementById('thumbnails');

function initThumbnails() {
    thumbnailsContainer.innerHTML = '';
    images.forEach((img, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail' + (index === currentImageIndex ? ' active' : '');
        thumbnail.style.backgroundImage = `url(${img})`;
        thumbnail.addEventListener('click', () => selectImage(index));
        thumbnailsContainer.appendChild(thumbnail);
    });
}

function selectImage(index) {
    currentImageIndex = index;
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    imageSelector.classList.remove('show');
    initGame();
}

function initGame() {
    puzzleContainer.innerHTML = '';
    pieces = [];
    placedPieces = 0;
    completeOverlay.classList.remove('show');

    const targetGrid = document.createElement('div');
    targetGrid.className = 'target-grid';
    for (let i = 0; i < 4; i++) {
        const slot = document.createElement('div');
        slot.className = 'target-slot';
        slot.dataset.slotIndex = i;
        targetGrid.appendChild(slot);
    }
    puzzleContainer.appendChild(targetGrid);

    for (let i = 0; i < 4; i++) {
        createPiece(i);
    }

    shufflePieces();
}

function createPiece(index) {
    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.dataset.index = index;
    piece.dataset.placed = 'false';

    const row = Math.floor(index / 2);
    const col = index % 2;
    piece.style.backgroundImage = `url(${images[currentImageIndex]})`;
    piece.style.backgroundPosition = `${-col * 100}% ${-row * 100}%`;

    piece.addEventListener('mousedown', startDrag);
    piece.addEventListener('touchstart', startDrag, { passive: false });

    puzzleContainer.appendChild(piece);
    pieces.push(piece);
}

function checkOverlap(x1, y1, w1, h1, x2, y2, w2, h2, margin = 5) {
    return !(x1 + w1 + margin < x2 || 
             x2 + w2 + margin < x1 || 
             y1 + h1 + margin < y2 || 
             y2 + h2 + margin < y1);
}

function shufflePieces() {
    const containerRect = puzzleContainer.getBoundingClientRect();
    const pieceSize = containerRect.width / 2;
    const margin = 10;
    
    const validPositions = [];
    
    for (let i = 0; i < 4; i++) {
        let valid = false;
        let attempts = 0;
        let x, y;
        
        while (!valid && attempts < 100) {
            x = margin + Math.random() * (containerRect.width - pieceSize - margin * 2);
            y = margin + Math.random() * (containerRect.height - pieceSize - margin * 2);
            
            valid = true;
            for (const pos of validPositions) {
                if (checkOverlap(x, y, pieceSize, pieceSize, pos.x, pos.y, pieceSize, pieceSize, margin)) {
                    valid = false;
                    break;
                }
            }
            attempts++;
        }
        
        validPositions.push({ x, y });
    }
    
    const shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    
    shuffledIndices.forEach((pieceIndex, posIndex) => {
        pieces[pieceIndex].style.left = validPositions[posIndex].x + 'px';
        pieces[pieceIndex].style.top = validPositions[posIndex].y + 'px';
    });
}

function startDrag(e) {
    e.preventDefault();
    
    const piece = e.target;
    if (piece.dataset.placed === 'true') return;

    draggedPiece = piece;
    draggedPiece.classList.add('dragging');

    const rect = piece.getBoundingClientRect();
    const containerRect = puzzleContainer.getBoundingClientRect();

    if (e.type === 'touchstart') {
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
    } else {
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

function drag(e) {
    e.preventDefault();
    
    if (!draggedPiece) return;

    const containerRect = puzzleContainer.getBoundingClientRect();
    let clientX, clientY;

    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    let x = clientX - containerRect.left - offsetX;
    let y = clientY - containerRect.top - offsetY;

    x = Math.max(0, Math.min(x, containerRect.width - draggedPiece.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - draggedPiece.offsetHeight));

    draggedPiece.style.left = x + 'px';
    draggedPiece.style.top = y + 'px';
    
    const pieceIndex = parseInt(draggedPiece.dataset.index);
    const targetRow = Math.floor(pieceIndex / 2);
    const targetCol = pieceIndex % 2;
    const targetX = targetCol * containerRect.width / 2;
    const targetY = targetRow * containerRect.height / 2;
    
    const distance = Math.sqrt(
        Math.pow(x - targetX, 2) +
        Math.pow(y - targetY, 2)
    );
    
    const strongThreshold = containerRect.width / 3;
    if (distance < strongThreshold) {
        const snapX = x + (targetX - x) * 0.1;
        const snapY = y + (targetY - y) * 0.1;
        draggedPiece.style.left = snapX + 'px';
        draggedPiece.style.top = snapY + 'px';
    }
}

function endDrag(e) {
    if (!draggedPiece) return;

    draggedPiece.classList.remove('dragging');

    const containerRect = puzzleContainer.getBoundingClientRect();
    const pieceIndex = parseInt(draggedPiece.dataset.index);
    const targetRow = Math.floor(pieceIndex / 2);
    const targetCol = pieceIndex % 2;
    const targetX = targetCol * containerRect.width / 2;
    const targetY = targetRow * containerRect.height / 2;

    const distance = Math.sqrt(
        Math.pow(parseFloat(draggedPiece.style.left) - targetX, 2) +
        Math.pow(parseFloat(draggedPiece.style.top) - targetY, 2)
    );

    const threshold = containerRect.width / 2.5;

    if (distance < threshold) {
        draggedPiece.style.left = targetX + 'px';
        draggedPiece.style.top = targetY + 'px';
        draggedPiece.dataset.placed = 'true';
        draggedPiece.classList.add('placed');
        placedPieces++;

        if (placedPieces === 4) {
            setTimeout(showComplete, 500);
        }
    }

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);

    draggedPiece = null;
}

let autoCloseTimer = null;

function showComplete() {
    completeImage.style.backgroundImage = `url(${images[currentImageIndex]})`;
    completeOverlay.classList.add('show');
    
    autoCloseTimer = setTimeout(() => {
        completeOverlay.classList.remove('show');
    }, 5000);
}

completeOverlay.addEventListener('click', () => {
    completeOverlay.classList.remove('show');
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
});

resetBtn.addEventListener('click', initGame);

changeImageBtn.addEventListener('click', () => {
    imageSelector.classList.toggle('show');
});

hintBtn.addEventListener('click', showHint);

function showHint() {
    const unplacedPieces = pieces.filter(p => p.dataset.placed === 'false');
    
    if (unplacedPieces.length === 0) return;
    
    const randomPiece = unplacedPieces[Math.floor(Math.random() * unplacedPieces.length)];
    const pieceIndex = parseInt(randomPiece.dataset.index);
    
    const targetSlots = document.querySelectorAll('.target-slot');
    const targetSlot = targetSlots[pieceIndex];
    
    randomPiece.classList.add('hint');
    targetSlot.classList.add('highlight');
    
    setTimeout(() => {
        randomPiece.classList.remove('hint');
        targetSlot.classList.remove('highlight');
    }, 2400);
}

document.addEventListener('DOMContentLoaded', () => {
    initThumbnails();
    initGame();
});
