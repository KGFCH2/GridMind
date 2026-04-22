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
 * Generates a new Sudoku puzzle based on difficulty and size with enhanced randomization.
 */
export function generateSudoku(difficulty: 'Easy' | 'Medium' | 'Hard', size: number = 6): Grid {
  const cellsToRemove = {
    6: { 'Easy': 12, 'Medium': 18, 'Hard': 24 },
    9: { 'Easy': 30, 'Medium': 45, 'Hard': 55 }
  }[size as 6 | 9][difficulty];

  // Try multiple random generations to ensure variety
  const maxAttempts = 50; // Increased from basic approach
  let bestPuzzle: Grid | null = null;
  let bestUniqueness = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid: Grid = Array.from({ length: size }, () => Array(size).fill(0));

    // Use enhanced randomization for initial solve
    if (!solveSudokuWithRandomization(grid, size)) continue;

    // Create puzzle by removing cells
    const puzzle = grid.map(row => [...row]);
    let count = cellsToRemove;
    const removedCells: Array<[number, number]> = [];

    // More strategic cell removal for better puzzle variety
    while (count > 0 && removedCells.length < cellsToRemove) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);

      // Avoid removing the same cell twice
      if (puzzle[r][c] !== 0 && !removedCells.some(([rr, cc]) => rr === r && cc === c)) {
        puzzle[r][c] = 0;
        removedCells.push([r, c]);
        count--;
      }
    }

    // Check puzzle uniqueness (has exactly one solution)
    const solutions = countSolutions(puzzle, 0, 0);
    if (solutions === 1) {
      // Prefer puzzles with good distribution
      const filledCells = puzzle.flat().filter(cell => cell !== 0).length;
      const uniqueness = filledCells + Math.random() * 10; // Add some randomness

      if (uniqueness > bestUniqueness) {
        bestPuzzle = puzzle;
        bestUniqueness = uniqueness;
      }
    }
  }

  // Fallback to basic generation if enhanced fails
  if (!bestPuzzle) {
    console.warn(`Enhanced generation failed for ${size}x${size} ${difficulty}, using basic generation`);
    const grid: Grid = Array.from({ length: size }, () => Array(size).fill(0));
    solveSudokuWithRandomization(grid, size);

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
    bestPuzzle = puzzle;
  }

  return bestPuzzle;
}

/**
 * Enhanced Sudoku solver with better randomization for puzzle generation.
 */
function solveSudokuWithRandomization(grid: Grid, size: number): boolean {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 0) {
        // Create randomized digit order for more variety
        const nums = Array.from({ length: size }, (_, i) => i + 1);

        // Multiple shuffle passes for better randomization
        for (let shuffle = 0; shuffle < 3; shuffle++) {
          for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
          }
        }

        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudokuWithRandomization(grid, size)) return true;
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
 * Count the number of solutions for a puzzle (used to ensure uniqueness).
 */
function countSolutions(grid: Grid, row: number, col: number, maxSolutions: number = 2): number {
  const { size } = getGridDimensions(grid);

  if (row === size) return 1; // Found a solution

  const nextRow = col === size - 1 ? row + 1 : row;
  const nextCol = col === size - 1 ? 0 : col + 1;

  if (grid[row][col] !== 0) {
    return countSolutions(grid, nextRow, nextCol, maxSolutions);
  }

  let solutions = 0;
  for (let num = 1; num <= size && solutions < maxSolutions; num++) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      solutions += countSolutions(grid, nextRow, nextCol, maxSolutions);
      grid[row][col] = 0;
    }
  }

  return solutions;
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
