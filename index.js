const btnStart = document.getElementById("startBtn");
const btnStop = document.getElementById("stopBtn");
const btnReset = document.getElementById("resetBtn");
const btnResize = document.getElementById("btnResize");
const generationBtn = document.getElementById("generationBtn");
const btnAcceptRules = document.querySelector(".btn-accept-rules");
const modalWindow = document.querySelector(".modal-window");

btnAcceptRules.onclick = () => {
  modalWindow.classList.add("hidden");
  btnAcceptRules.onclick = null;
  document.querySelector("body").style.overflow = "auto";
};

let grid = [];
let prevGrid = [];
let rows = 50;
let cols = 50;
let interval;
let generationTime = 0;
let gridHistory = []; // для хранения истории сетки

document.addEventListener("DOMContentLoaded", () => {
  createGrid();
});

function createGrid() {
  btnStart.disabled = true;
  btnReset.disabled = true;
  clearInterval(interval);
  const gridSize = parseInt(document.getElementById("size").value);
  rows = cols = gridSize;
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  prevGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
  gridHistory = []; // очищаем историю

  const gridContainer = document.getElementById("grid");
  gridContainer.innerHTML = "";
  gridContainer.style.gridTemplateRows = `repeat(${rows}, 10px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, 10px)`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", () => toggleCell(row, col));
      gridContainer.appendChild(cell);
    }
  }

  updateGrid();
}

function toggleCell(row, col) {
  grid[row][col] = grid[row][col] ? 0 : 1;
  updateGrid();
  const cellsAlive = document.querySelectorAll(".alive");
  if (cellsAlive.length > 0) {
    btnStart.disabled = false;
  } else {
    btnStart.disabled = true;
    btnReset.disabled = true;
  }
}

function updateGrid() {
  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell) => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    if (grid[row][col]) {
      cell.classList.add("alive");
    } else {
      cell.classList.remove("alive");
    }
  });
}

function generateRandomGrid() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      grid[row][col] = Math.random() > 0.7 ? 1 : 0;
    }
  }
  updateGrid();
  const cellsAlive = document.querySelectorAll(".alive");
  if (cellsAlive.length > 0) {
    btnStart.disabled = false;
    btnReset.disabled = false;
  } else {
    btnStart.disabled = true;
    btnReset.disabled = true;
  }
}

// Функция для проверки всех клеток
function checkAllCellsWhite() {
  const cells = document.querySelectorAll(".cell");
  for (let cell of cells) {
    if (cell.classList.contains("alive")) {
      return false;
    }
  }
  return true;
}

// Функция для завершения игры
function endGame(message) {
  generationTime = 0;
  alert(message);
  stopGame();
  setTimeout(() => {
    document.getElementById("time").innerHTML = "Время: 0 сек";
  });
  btnStop.disabled = true;
  btnStart.disabled = true;
  btnReset.disabled = true;
  generationBtn.disabled = false;
  btnResize.disabled = false;
}
let timerID;
clearInterval(timerID);
let time = 0;

function startGame() {
  btnStart.disabled = true;
  btnStop.disabled = false;
  btnReset.disabled = true;
  btnResize.disabled = true;
  generationBtn.disabled = true;

  timerID = setInterval(() => {
    time++;
    document.getElementById("time").textContent = `Время: ${time} сек`;
  }, 1000);
  clearInterval(interval);
  interval = setInterval(() => {
    const hasChanged = nextGeneration();

    if (checkAllCellsWhite()) {
      const cells2 = document.querySelectorAll(".cell");

      grid = Array.from({ length: rows }, () => Array(cols).fill(0));
      cells2.forEach((el) => {
        el.classList.remove("alive");
      });
      setTimeout(() => {
        endGame("Все клетки «умерли»! Игра окончена.");
      }, 100);
    } else if (!hasChanged) {
      endGame("Жизнь больше не развивается! Игра окончена.");
      setTimeout(() => {
        const cells3 = document.querySelectorAll(".cell");

        grid = Array.from({ length: rows }, () => Array(cols).fill(0));
        cells3.forEach((el) => {
          el.classList.remove("alive");
        });
      }, 100);
    } else if (isGridInHistory(grid)) {
      endGame("Обнаружено повторение! Игра окончена.");
      setTimeout(() => {
        const cells3 = document.querySelectorAll(".cell");

        grid = Array.from({ length: rows }, () => Array(cols).fill(0));
        cells3.forEach((el) => {
          el.classList.remove("alive");
        });
      }, 100);
    }
  }, 300);
}

function stopGame() {
  clearInterval(interval);
  btnStart.disabled = false;
  btnStop.disabled = true;
  btnReset.disabled = false;
  clearInterval(timerID);
}

function resetGame() {
  time = 0;
  const cells = document.querySelectorAll(".cell");
  btnStart.disabled = true;
  btnResize.disabled = false;
  btnReset.disabled = true;
  generationBtn.disabled = false;
  document.getElementById("time").innerHTML = "Время: 0 сек";

  cells.forEach((el) => {
    el.classList.remove("alive");
  });

  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  prevGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
  gridHistory = []; // очищаем историю
}

function nextGeneration() {
  const newGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
  let hasChanged = false;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const aliveNeighbours = countAliveNeighbours(row, col);
      if (grid[row][col] === 1) {
        if (aliveNeighbours < 2 || aliveNeighbours > 3) {
          newGrid[row][col] = 0;
        } else {
          newGrid[row][col] = 1;
        }
      } else {
        if (aliveNeighbours === 3) {
          newGrid[row][col] = 1;
        }
      }

      if (newGrid[row][col] !== grid[row][col]) {
        hasChanged = true;
        addGridToHistory(grid); // добавляем новое состояние в историю
      }
    }
  }

  // Обновление prevGrid и grid
  prevGrid = grid;
  grid = newGrid;
  updateGrid();

  return hasChanged;
}

function addGridToHistory(grid) {
  const gridCopy = grid.map((row) => row.slice());
  gridHistory.push(gridCopy);
  if (gridHistory.length > 10) {
    // ограничиваем длину истории до 10
    gridHistory.shift();
  }
}

function isGridInHistory(grid) {
  return gridHistory.some((historyGrid) =>
    historyGrid.every((row, rowIndex) =>
      row.every((cell, colIndex) => cell === grid[rowIndex][colIndex])
    )
  );
}

function countAliveNeighbours(row, col) {
  const positions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  return positions.reduce((count, [x, y]) => {
    const newRow = (row + x + rows) % rows;
    const newCol = (col + y + cols) % cols;
    return count + grid[newRow][newCol];
  }, 0);
}
