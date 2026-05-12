(function() {
  const PuzzleGame = {
    state: {
      tiles: [1, 2, 3, 4, 5, 6, 7, 8, 0],
      initialTiles: [],
      emptyIndex: 8,
      isAnimating: false,
      moveCount: 0,
      isTimerMode: false,
      elapsedTime: 0,
      timerInterval: null
    },

    config: {
      gridSize: 3,
      shuffleMoves: 80,
      animationDuration: 200
    },

    elements: {},

    initModule: function() {
      this.elements = {
        board: document.getElementById('puzzleBoard'),
        resetBtn: document.getElementById('resetBtn'),
        shuffleBtn: document.getElementById('shuffleBtn'),
        successOverlay: document.getElementById('successOverlay'),
        nextBtn: document.getElementById('nextBtn'),
        timer: document.getElementById('timer'),
        timerModeBtn: document.getElementById('timerModeBtn'),
        relaxModeBtn: document.getElementById('relaxModeBtn'),
        successTime: document.getElementById('successTime')
      };
    },

    puzzleModule: {
      createSolvedState: function() {
        return [1, 2, 3, 4, 5, 6, 7, 8, 0];
      },

      shuffle: function(tiles, emptyIdx, moves) {
        const shuffled = [...tiles];
        let emptyIndex = emptyIdx;

        for (let i = 0; i < moves; i++) {
          const neighbors = PuzzleGame.puzzleModule.getMovableNeighbors(emptyIndex);
          const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];

          shuffled[emptyIndex] = shuffled[randomNeighbor];
          shuffled[randomNeighbor] = 0;
          emptyIndex = randomNeighbor;
        }

        return { tiles: shuffled, emptyIndex };
      },

      getMovableNeighbors: function(idx) {
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        const neighbors = [];

        if (row > 0) neighbors.push(idx - 3);
        if (row < 2) neighbors.push(idx + 3);
        if (col > 0) neighbors.push(idx - 1);
        if (col < 2) neighbors.push(idx + 1);

        return neighbors;
      },

      canMove: function(idx, emptyIdx) {
        return this.getMovableNeighbors(emptyIdx).includes(idx);
      },

      swap: function(tiles, idx1, idx2) {
        const newTiles = [...tiles];
        const temp = newTiles[idx1];
        newTiles[idx1] = newTiles[idx2];
        newTiles[idx2] = temp;
        return newTiles;
      }
    },

    renderModule: {
      renderBoard: function(tiles, emptyIndex, movableTiles) {
        const board = PuzzleGame.elements.board;
        board.innerHTML = '';

        tiles.forEach((value, index) => {
          const tile = document.createElement('div');
          tile.className = 'tile';
          tile.dataset.index = index;

          if (value === 0) {
            tile.classList.add('empty');
          } else {
            tile.classList.add(`tile-${value}`);
            tile.textContent = value;

            if (movableTiles.includes(index)) {
              tile.classList.add('movable');
              tile.addEventListener('click', () => PuzzleGame.interactionModule.handleTileClick(index));
            }
          }

          board.appendChild(tile);
        });
      },

      updateTimer: function() {
        const state = PuzzleGame.state;
        if (!state.isTimerMode) {
          PuzzleGame.elements.timer.textContent = '--:--';
          return;
        }

        const minutes = Math.floor(state.elapsedTime / 60);
        const seconds = state.elapsedTime % 60;
        PuzzleGame.elements.timer.textContent = 
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      },

      renderSuccess: function(moveCount, elapsedTime) {
        const overlay = PuzzleGame.elements.successOverlay;
        const finalMoves = overlay.querySelector('#finalMoves');
        finalMoves.textContent = moveCount;

        const successTimeEl = PuzzleGame.elements.successTime;
        if (PuzzleGame.state.isTimerMode) {
          const minutes = Math.floor(elapsedTime / 60);
          const seconds = elapsedTime % 60;
          successTimeEl.textContent = `用时 ${minutes}分${seconds}秒`;
          successTimeEl.style.display = 'block';
        } else {
          successTimeEl.style.display = 'none';
        }

        overlay.classList.add('show');
        PuzzleGame.uiModule.createParticles();
      },

      hideSuccess: function() {
        PuzzleGame.elements.successOverlay.classList.remove('show');
      }
    },

    timerModule: {
      start: function() {
        if (PuzzleGame.state.timerInterval) return;
        
        PuzzleGame.state.timerInterval = setInterval(() => {
          if (PuzzleGame.state.isTimerMode && !PuzzleGame.state.isAnimating) {
            PuzzleGame.state.elapsedTime++;
            PuzzleGame.renderModule.updateTimer();
          }
        }, 1000);
      },

      stop: function() {
        if (PuzzleGame.state.timerInterval) {
          clearInterval(PuzzleGame.state.timerInterval);
          PuzzleGame.state.timerInterval = null;
        }
      },

      reset: function() {
        this.stop();
        PuzzleGame.state.elapsedTime = 0;
        PuzzleGame.renderModule.updateTimer();
      },

      toggleMode: function(isTimerMode) {
        PuzzleGame.state.isTimerMode = isTimerMode;
        
        if (isTimerMode) {
          PuzzleGame.elements.timerModeBtn.classList.add('active');
          PuzzleGame.elements.relaxModeBtn.classList.remove('active');
        } else {
          PuzzleGame.elements.relaxModeBtn.classList.add('active');
          PuzzleGame.elements.timerModeBtn.classList.remove('active');
        }
        
        PuzzleGame.renderModule.updateTimer();
        
        if (isTimerMode && !PuzzleGame.state.timerInterval) {
          this.start();
        }
      }
    },

    interactionModule: {
      handleTileClick: function(index) {
        if (PuzzleGame.state.isAnimating) return;

        const { tiles, emptyIndex } = PuzzleGame.state;

        if (!PuzzleGame.puzzleModule.canMove(index, emptyIndex)) return;

        PuzzleGame.state.isAnimating = true;
        PuzzleGame.state.moveCount++;

        const newTiles = PuzzleGame.puzzleModule.swap(tiles, index, emptyIndex);
        const newEmptyIndex = index;

        PuzzleGame.state.tiles = newTiles;
        PuzzleGame.state.emptyIndex = newEmptyIndex;

        PuzzleGame.animationModule.animateSlide(index, emptyIndex, () => {
          PuzzleGame.state.isAnimating = false;

          if (PuzzleGame.winModule.checkWin(newTiles)) {
            PuzzleGame.timerModule.stop();
            setTimeout(() => {
              PuzzleGame.renderModule.renderSuccess(
                PuzzleGame.state.moveCount, 
                PuzzleGame.state.elapsedTime
              );
            }, 300);
          }
        });

        const movableTiles = PuzzleGame.puzzleModule.getMovableNeighbors(newEmptyIndex);
        PuzzleGame.renderModule.renderBoard(newTiles, newEmptyIndex, movableTiles);
      },

      handleKeydown: function(e) {
        if (PuzzleGame.state.isAnimating) return;

        const { emptyIndex } = PuzzleGame.state;
        let targetIdx = -1;

        const emptyRow = Math.floor(emptyIndex / 3);
        const emptyCol = emptyIndex % 3;

        switch (e.key) {
          case 'ArrowUp':
            if (emptyRow < 2) targetIdx = emptyIndex + 3;
            break;
          case 'ArrowDown':
            if (emptyRow > 0) targetIdx = emptyIndex - 3;
            break;
          case 'ArrowLeft':
            if (emptyCol < 2) targetIdx = emptyIndex + 1;
            break;
          case 'ArrowRight':
            if (emptyCol > 0) targetIdx = emptyIndex - 1;
            break;
        }

        if (targetIdx >= 0 && targetIdx < 9) {
          e.preventDefault();
          this.handleTileClick(targetIdx);
        }
      }
    },

    animationModule: {
      animateSlide: function(fromIndex, toIndex, callback) {
        const tiles = document.querySelectorAll('.tile');
        const movingTile = tiles[fromIndex];
        const targetTile = tiles[toIndex];

        if (!movingTile || !targetTile) {
          callback();
          return;
        }

        const fromRect = movingTile.getBoundingClientRect();
        const toRect = targetTile.getBoundingClientRect();

        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;

        movingTile.style.transition = 'none';
        movingTile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        requestAnimationFrame(() => {
          movingTile.style.transition = `transform ${PuzzleGame.config.animationDuration}ms ease-out`;
          movingTile.style.transform = 'translate(0, 0)';
        });

        setTimeout(callback, PuzzleGame.config.animationDuration);
      }
    },

    winModule: {
      checkWin: function(tiles) {
        const winState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        return tiles.every((tile, idx) => tile === winState[idx]);
      }
    },

    uiModule: {
      createParticles: function() {
        const colors = ['#a8e6cf', '#ffb7b2', '#ffffd1', '#d4a5e5', '#ffd3b6'];
        const container = document.createElement('div');
        container.className = 'particles';
        document.body.appendChild(container);

        for (let i = 0; i < 30; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.left = Math.random() * window.innerWidth + 'px';
          particle.style.top = Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.3 + 'px';
          particle.style.background = colors[Math.floor(Math.random() * colors.length)];
          particle.style.animationDelay = Math.random() * 0.5 + 's';
          container.appendChild(particle);
        }

        setTimeout(() => container.remove(), 2000);
      },

      resetGame: function() {
        PuzzleGame.state.tiles = [...PuzzleGame.state.initialTiles];
        PuzzleGame.state.emptyIndex = PuzzleGame.state.tiles.indexOf(0);
        PuzzleGame.state.moveCount = 0;
        PuzzleGame.timerModule.reset();

        const movableTiles = PuzzleGame.puzzleModule.getMovableNeighbors(PuzzleGame.state.emptyIndex);
        PuzzleGame.renderModule.renderBoard(PuzzleGame.state.tiles, PuzzleGame.state.emptyIndex, movableTiles);

        if (PuzzleGame.state.isTimerMode) {
          PuzzleGame.timerModule.start();
        }
      },

      newGame: function() {
        PuzzleGame.renderModule.hideSuccess();

        const solved = PuzzleGame.puzzleModule.createSolvedState();
        const { tiles, emptyIndex } = PuzzleGame.puzzleModule.shuffle(solved, 8, PuzzleGame.config.shuffleMoves);

        PuzzleGame.state.tiles = tiles;
        PuzzleGame.state.emptyIndex = emptyIndex;
        PuzzleGame.state.initialTiles = [...tiles];
        PuzzleGame.state.moveCount = 0;
        PuzzleGame.timerModule.reset();

        const movableTiles = PuzzleGame.puzzleModule.getMovableNeighbors(emptyIndex);
        PuzzleGame.renderModule.renderBoard(tiles, emptyIndex, movableTiles);

        if (PuzzleGame.state.isTimerMode) {
          PuzzleGame.timerModule.start();
        }
      }
    },

    start: function() {
      this.initModule();

      this.elements.resetBtn.addEventListener('click', () => this.uiModule.resetGame());
      this.elements.shuffleBtn.addEventListener('click', () => this.uiModule.newGame());
      this.elements.nextBtn.addEventListener('click', () => this.uiModule.newGame());
      document.addEventListener('keydown', (e) => this.interactionModule.handleKeydown(e));

      this.elements.timerModeBtn.addEventListener('click', () => this.timerModule.toggleMode(true));
      this.elements.relaxModeBtn.addEventListener('click', () => this.timerModule.toggleMode(false));

      this.timerModule.toggleMode(false);
      this.uiModule.newGame();
    }
  };

  PuzzleGame.start();
})();