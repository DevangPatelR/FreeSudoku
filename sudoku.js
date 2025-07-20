class SudokuGame {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.solutionGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.selectedNumber = null;
        this.difficulty = 'medium';
        this.difficultySettings = {
            easy: { cellsToRemove: [35, 45], name: 'Easy' },
            medium: { cellsToRemove: [45, 55], name: 'Medium' },
            hard: { cellsToRemove: [55, 65], name: 'Hard' },
            expert: { cellsToRemove: [65, 75], name: 'Expert' }
        };
        this.initializeGame();
    }

    initializeGame() {
        this.loadDifficulty();
        this.generatePuzzle();
        this.renderGrid();
        this.setupEventListeners();
    }

    generatePuzzle() {
        // Generate a complete valid Sudoku grid
        this.fillGrid();
        
        // Store the complete solution
        this.solutionGrid = this.grid.map(row => [...row]);
        
        // Create puzzle by removing cells (simple approach)
        this.createSimplePuzzle();
        
        // Update original grid to mark which cells are given
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    this.originalGrid[i][j] = 0;
                } else {
                    this.originalGrid[i][j] = this.grid[i][j];
                }
            }
        }
    }

    fillGrid() {
        // Simple backtracking algorithm to fill the grid
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    
                    for (let num of numbers) {
                        if (this.isValidMove(row, col, num)) {
                            this.grid[row][col] = num;
                            
                            if (this.fillGrid()) {
                                return true;
                            }
                            
                            this.grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    createSimplePuzzle() {
        // Remove cells based on difficulty level
        const diffSetting = this.difficultySettings[this.difficulty];
        const [minCells, maxCells] = diffSetting.cellsToRemove;
        const cellsToRemove = Math.floor(Math.random() * (maxCells - minCells + 1)) + minCells;
        let removed = 0;
        
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (this.grid[row][col] !== 0) {
                this.grid[row][col] = 0;
                removed++;
            }
        }
    }

    renderGrid() {
        const gridContainer = document.querySelector('.sudoku-grid');
        gridContainer.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.originalGrid[row][col] !== 0) {
                    cell.classList.add('original');
                    cell.textContent = this.originalGrid[row][col];
                } else if (this.grid[row][col] !== 0) {
                    cell.classList.add('user-entered');
                    cell.textContent = this.grid[row][col];
                } else {
                    cell.textContent = '';
                }
                
                gridContainer.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        // Cell selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.selectCell(e.target);
            }
        });



        // Control buttons
        document.getElementById('reset').addEventListener('click', () => this.reset());
        document.getElementById('hint').addEventListener('click', () => this.hint());

        // Dropdown functionality
        this.setupDropdown();
        
        // Instructions toggle
        this.setupInstructionsToggle();

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    selectCell(cell) {
        // Remove previous selection
        document.querySelectorAll('.cell.selected').forEach(c => {
            c.classList.remove('selected');
        });

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Don't select original cells
        if (this.originalGrid[row][col] !== 0) {
            return;
        }

        // Select new cell
        this.selectedCell = cell;
        this.selectedCell.classList.add('selected');
    }



    placeNumber(row, col, number) {
        // Remove any existing error class
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.remove('error');

        // Validate move
        if (this.isValidMove(row, col, number)) {
            this.grid[row][col] = number;
            cell.textContent = number;
            cell.classList.add('user-entered');
            
            // Check if puzzle is completed
            if (this.isPuzzleComplete()) {
                setTimeout(() => {
                    if (this.isSolutionCorrect()) {
                        const diffName = this.difficultySettings[this.difficulty].name;
                        alert(`🎉 Congratulations! You solved the ${diffName} puzzle correctly!`);
                    } else {
                        alert('❌ Puzzle completed but solution is incorrect. Try again!');
                    }
                }, 100);
            }
        } else {
            // Show error animation
            cell.classList.add('error');
            setTimeout(() => {
                cell.classList.remove('error');
            }, 500);
        }
    }

    handleKeyPress(e) {
        if (!this.selectedCell) return;

        const key = e.key;
        if (key >= '1' && key <= '9') {
            const row = parseInt(this.selectedCell.dataset.row);
            const col = parseInt(this.selectedCell.dataset.col);
            const number = parseInt(key);
            
            this.placeNumber(row, col, number);
        } else if (key === 'Delete' || key === 'Backspace') {
            const row = parseInt(this.selectedCell.dataset.row);
            const col = parseInt(this.selectedCell.dataset.col);
            
            this.grid[row][col] = 0;
            this.selectedCell.textContent = '';
            this.selectedCell.classList.remove('user-entered');
        }
    }

    isValidMove(row, col, number) {
        // Check row
        for (let i = 0; i < 9; i++) {
            if (i !== col && this.grid[row][i] === number) return false;
        }

        // Check column
        for (let i = 0; i < 9; i++) {
            if (i !== row && this.grid[i][col] === number) return false;
        }

        // Check 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentRow = startRow + i;
                const currentCol = startCol + j;
                if ((currentRow !== row || currentCol !== col) && 
                    this.grid[currentRow][currentCol] === number) {
                    return false;
                }
            }
        }

        return true;
    }

    isPuzzleComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) return false;
            }
        }
        return true;
    }

    isSolutionCorrect() {
        // Compare current grid with the stored solution
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] !== this.solutionGrid[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    newGame() {
        // Reset everything
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.selectedNumber = null;
        
        // Clear cell selections
        document.querySelectorAll('.cell.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Generate new puzzle
        this.generatePuzzle();
        this.renderGrid();
    }

    reset() {
        // Reset to original puzzle state
        this.grid = this.originalGrid.map(row => [...row]);
        this.selectedCell = null;
        this.selectedNumber = null;
        
        // Clear cell selections
        document.querySelectorAll('.cell.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        this.renderGrid();
    }

    hint() {
        // If a cell is selected and empty, provide hint for that cell
        if (this.selectedCell) {
            const row = parseInt(this.selectedCell.dataset.row);
            const col = parseInt(this.selectedCell.dataset.col);
            
            // Only provide hint if the cell is empty
            if (this.grid[row][col] === 0) {
                // Get the correct number from the solution
                const correctNumber = this.solutionGrid[row][col];
                this.grid[row][col] = correctNumber;
                
                this.selectedCell.textContent = correctNumber;
                this.selectedCell.classList.add('user-entered', 'hint');
                
                setTimeout(() => {
                    this.selectedCell.classList.remove('hint');
                }, 1000);
                
                return;
            }
        }
        
        // If no cell is selected or selected cell is filled, find first empty cell
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    // Get the correct number from the solution
                    const correctNumber = this.solutionGrid[row][col];
                    this.grid[row][col] = correctNumber;
                    
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.textContent = correctNumber;
                    cell.classList.add('user-entered', 'hint');
                    
                    setTimeout(() => {
                        cell.classList.remove('hint');
                    }, 1000);
                    
                    return;
                }
            }
        }
    }

    loadDifficulty() {
        // Load difficulty from localStorage
        const savedDifficulty = localStorage.getItem('sudoku-difficulty');
        if (savedDifficulty && this.difficultySettings[savedDifficulty]) {
            this.difficulty = savedDifficulty;
        }
        
        // Update the dropdown button text
        this.updateDropdownButton();
    }

    saveDifficulty() {
        // Save difficulty to localStorage
        localStorage.setItem('sudoku-difficulty', this.difficulty);
    }

    setupDropdown() {
        const dropdownBtn = document.getElementById('newGameBtn');
        const dropdown = document.querySelector('.dropdown');
        const dropdownContent = document.querySelector('.dropdown-content');
        
        // Toggle dropdown on button click
        dropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('active');
        });
        
        // Handle difficulty selection
        dropdownContent.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.tagName === 'A') {
                const selectedDifficulty = e.target.dataset.difficulty;
                this.difficulty = selectedDifficulty;
                this.saveDifficulty();
                this.updateDropdownButton();
                dropdown.classList.remove('active');
                this.newGame();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    updateDropdownButton() {
        const dropdownBtn = document.getElementById('newGameBtn');
        const diffName = this.difficultySettings[this.difficulty].name;
        dropdownBtn.textContent = `New ${diffName} Game ▼`;
    }
    
    setupInstructionsToggle() {
        const header = document.getElementById('instructionsToggle');
        const instructions = document.getElementById('instructions');
        
        if (!header || !instructions) {
            console.warn('Instructions toggle elements not found');
            return;
        }
        
        // Load saved state from localStorage
        const isExpanded = localStorage.getItem('instructionsExpanded') === 'true';
        if (isExpanded) {
            instructions.classList.remove('collapsed');
        }
        
        // Add click event listener
        header.addEventListener('click', () => {
            const isCurrentlyCollapsed = instructions.classList.contains('collapsed');
            
            if (isCurrentlyCollapsed) {
                instructions.classList.remove('collapsed');
                localStorage.setItem('instructionsExpanded', 'true');
            } else {
                instructions.classList.add('collapsed');
                localStorage.setItem('instructionsExpanded', 'false');
            }
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
