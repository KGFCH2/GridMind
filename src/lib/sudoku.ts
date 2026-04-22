/**
 * Sudoku Logic Library - Flexible for 6x6 and 9x9 Grids
 */

export type Grid = number[][];

export interface SolveStep {
  row: number;
  col: number;
  value: number;
  isBacktrack: boolean;
}

export interface SolveResult {
  solvedGrid: Grid | null;
  steps: SolveStep[];
  timeTaken: number;
}

/**
 * Gets the grid size and box dimensions.
 */
function getGridDimensions(grid: Grid) {
  const size = grid.length;
  if (size === 6) {
    return { size, boxRows: 2, boxCols: 3 };
  } else if (size === 9) {
    return { size, boxRows: 3, boxCols: 3 };
  }
  return { size, boxRows: Math.sqrt(size), boxCols: Math.sqrt(size) };
}

/**
 * Validates if placing 'val' at grid[row][col] is legal.
 */
export function isValid(grid: Grid, row: number, col: number, val: number): boolean {
  const { size, boxRows, boxCols } = getGridDimensions(grid);
  
  for (let i = 0; i < size; i++) {
    if (grid[row][i] === val) return false;
    if (grid[i][col] === val) return false;
  }

  const startRow = Math.floor(row / boxRows) * boxRows;
  const startCol = Math.floor(col / boxCols) * boxCols;
  for (let i = 0; i < boxRows; i++) {
    for (let j = 0; j < boxCols; j++) {
      if (grid[startRow + i][startCol + j] === val) return false;
    }
  }

  return true;
}

/**
 * Solves the Sudoku grid using backtracking and records steps.
 */
export function solveSudoku(grid: Grid): SolveResult {
  const startTime = performance.now();
  const workingGrid = grid.map(row => [...row]);
  const steps: SolveStep[] = [];
  const { size } = getGridDimensions(grid);

  function solve(): boolean {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (workingGrid[row][col] === 0) {
          for (let val = 1; val <= size; val++) {
            if (isValid(workingGrid, row, col, val)) {
              workingGrid[row][col] = val;
              steps.push({ row, col, value: val, isBacktrack: false });
              
              if (solve()) return true;

              workingGrid[row][col] = 0;
              steps.push({ row, col, value: 0, isBacktrack: true });
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  const success = solve();
  const endTime = performance.now();

  return {
    solvedGrid: success ? workingGrid : null,
    steps,
    timeTaken: Math.round(endTime - startTime),
  };
}

/**
 * Generates a new Sudoku puzzle based on difficulty and size.
 */
export function generateSudoku(difficulty: 'Easy' | 'Medium' | 'Hard', size: number = 6): Grid {
  const grid: Grid = Array.from({ length: size }, () => Array(size).fill(0));
  
  solveSudokuSimple(grid, true);

  // Remove cells based on difficulty and size
  const cellsToRemove = {
    6: { 'Easy': 12, 'Medium': 18, 'Hard': 24 },
    9: { 'Easy': 30, 'Medium': 45, 'Hard': 55 }
  }[size as 6 | 9][difficulty];

  const puzzle = grid.map(row => [...row]);
  let count = cellsToRemove;
  while (count > 0) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      count--;
    }
  }

  return puzzle;
}

function solveSudokuSimple(grid: Grid, randomize: boolean = false): boolean {
  const { size } = getGridDimensions(grid);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 0) {
        const nums = Array.from({ length: size }, (_, i) => i + 1);
        if (randomize) {
          for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
          }
        }
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudokuSimple(grid, randomize)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Analyzes the difficulty of a Sudoku puzzle.
 */
export function analyzeSudoku(grid: Grid) {
  const { size } = getGridDimensions(grid);
  let emptyCells = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) emptyCells++;
    }
  }

  let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Easy';
  const totalCells = size * size;
  const ratio = emptyCells / totalCells;

  if (ratio > 0.6) difficulty = 'Hard';
  else if (ratio > 0.4) difficulty = 'Medium';

  return { difficulty, emptyCells };
}

/**
 * Gets a hint for the current grid.
 */
export function getHint(grid: Grid) {
  const result = solveSudoku(grid);
  if (!result.solvedGrid) return null;
  const { size } = getGridDimensions(grid);

  // Find the first empty cell in the original grid that is filled in the solved grid
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        const value = result.solvedGrid[r][c];
        return {
          row: r,
          col: c,
          value,
          explanation: `Try placing ${value} at row ${r + 1}, column ${c + 1}. This move is part of a valid solution path.`,
        };
      }
    }
  }
  return null;
}

/**
 * Checks if the entire grid is complete and valid.
 */
export function isGridCompleteAndValid(grid: Grid): boolean {
  const { size } = getGridDimensions(grid);
  const workingGrid = grid.map(row => [...row]);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = workingGrid[r][c];
      if (val === 0) return false;
      
      // Temporarily clear the cell to check if the current value is valid in its position
      workingGrid[r][c] = 0;
      const valid = isValid(workingGrid, r, c, val);
      workingGrid[r][c] = val;
      
      if (!valid) return false;
    }
  }
  return true;
}
