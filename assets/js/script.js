/* =====================================================================
   MATRIX CALCULATOR — script.js
   Author: Shashank & Vaibhav Tyagi

   This file is organised into clearly labelled sections so that it is
   easy to read, explain in a viva, and extend later:

     SECTION 1  -> Operation configuration (the list of 18 operations)
     SECTION 2  -> Global state (variables shared across functions)
     SECTION 3  -> Theme (dark / light mode) logic
     SECTION 4  -> Custom alert / toast system
     SECTION 5  -> Loading overlay helpers
     SECTION 6  -> Page setup (building cards, dropdown, event listeners)
     SECTION 7  -> Matrix grid generation & reading values from the DOM
     SECTION 8  -> Pure matrix MATH functions (the heart of the project)
     SECTION 9  -> Calculate button controller (calls the right math fn)
     SECTION 10 -> Result rendering helpers
     SECTION 11 -> Scroll fade-in animation for developer cards

   Every function has a comment block above it explaining:
   What it does / Why it is used / Input / Output / Time & Space complexity
   ===================================================================== */


/* =====================================================================
   SECTION 1: OPERATION CONFIGURATION
   Each operation object tells the UI:
     id       -> unique key used in the switch-case calculator
     name     -> human readable name (shown in dropdown & cards)
     symbol   -> small mathematical notation shown on the card
     category -> controls which size-inputs are shown:
                 "same-size-binary" -> A and B, same rows & cols
                 "mul-binary"       -> A and B, independent sizes
                 "scalar"           -> A + a scalar number k
                 "unary"            -> just A (any size)
                 "square"           -> just A, must be a square matrix
                 "generator"        -> no matrix needed, only a size n
   ===================================================================== */
const OPERATIONS = [
  { id: "add",            name: "Matrix Addition",         symbol: "A + B",  category: "same-size-binary" },
  { id: "sub",             name: "Matrix Subtraction",      symbol: "A − B",  category: "same-size-binary" },
  { id: "equality",        name: "Check Equality",          symbol: "A = B",  category: "same-size-binary" },
  { id: "mul",             name: "Matrix Multiplication",   symbol: "A × B",  category: "mul-binary" },
  { id: "scalar",          name: "Scalar Multiplication",   symbol: "k · A",  category: "scalar" },
  { id: "transpose",       name: "Matrix Transpose",        symbol: "Aᵀ",     category: "unary" },
  { id: "rank",            name: "Matrix Rank",             symbol: "ρ(A)",   category: "unary" },
  { id: "determinant",     name: "Determinant",             symbol: "|A|",    category: "square" },
  { id: "inverse",         name: "Inverse Matrix",          symbol: "A⁻¹",    category: "square" },
  { id: "trace",           name: "Trace of Matrix",         symbol: "tr(A)",  category: "square" },
  { id: "symmetric",       name: "Check Symmetric",         symbol: "A = Aᵀ", category: "square" },
  { id: "skewsymmetric",   name: "Check Skew-Symmetric",    symbol: "A = −Aᵀ",category: "square" },
  { id: "isidentity",      name: "Check Identity",          symbol: "A = I",  category: "square" },
  { id: "diagonal",        name: "Check Diagonal",          symbol: "diag(A)",category: "square" },
  { id: "uppertriangular", name: "Check Upper Triangular",  symbol: "U",      category: "square" },
  { id: "lowertriangular", name: "Check Lower Triangular",  symbol: "L",      category: "square" },
  { id: "identity",        name: "Identity Matrix Generator", symbol: "I(n)", category: "generator" },
  { id: "zero",            name: "Zero Matrix Generator",     symbol: "0(n)", category: "generator" }
];


/* =====================================================================
   SECTION 2: GLOBAL STATE
   Kept intentionally simple — a handful of variables instead of a
   framework store, since this project uses only vanilla JavaScript.
   ===================================================================== */
let currentOperation = OPERATIONS[0]; // the operation currently selected
let matrixAGenerated = false;         // has the Matrix A grid been built?
let matrixBGenerated = false;         // has the Matrix B grid been built?
let currentRowsA = 0, currentColsA = 0;
let currentRowsB = 0, currentColsB = 0;


/* =====================================================================
   SECTION 3: THEME (DARK / LIGHT MODE)
   ===================================================================== */

/**
 * applyTheme
 * What:  Sets the data-theme attribute on <html> and updates localStorage.
 * Why:   A single function keeps theme switching consistent everywhere.
 * Input: theme (string) -> "dark" or "light"
 * Output: none (side effect: DOM + localStorage updated)
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("matrixCalcTheme", theme);
}

/**
 * initTheme
 * What:  Reads the saved theme preference (if any) and applies it on load.
 * Why:   So the user's preference is remembered across visits.
 * Input: none   Output: none
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function initTheme() {
  const saved = localStorage.getItem("matrixCalcTheme");
  applyTheme(saved === "light" ? "light" : "dark");
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  applyTheme(isLight ? "dark" : "light");
});


/* =====================================================================
   SECTION 4: CUSTOM ALERT / TOAST SYSTEM
   No browser alert()/confirm() is used anywhere in this project.
   ===================================================================== */

const ALERT_ICONS = { success: "✓", error: "✕", warning: "!", info: "i" };

/**
 * showAlert
 * What:  Creates a small toast message box and auto-removes it.
 * Why:   Gives the user clear, non-blocking feedback (success/error/etc.)
 *        instead of the plain, ugly browser alert() popup.
 * Input: type (string: "success" | "error" | "warning" | "info"),
 *        message (string) -> text to display
 * Output: none (side effect: a toast is appended to the DOM)
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function showAlert(type, message) {
  const container = document.getElementById("alertContainer");

  const alertBox = document.createElement("div");
  alertBox.className = `alert ${type}`;
  alertBox.innerHTML = `
    <span class="alert-icon">${ALERT_ICONS[type] || "i"}</span>
    <span class="alert-message">${message}</span>
  `;

  container.appendChild(alertBox);

  // Auto hide after 3 seconds
  setTimeout(() => {
    alertBox.classList.add("closing");
    setTimeout(() => alertBox.remove(), 300);
  }, 3000);
}


/* =====================================================================
   SECTION 5: LOADING OVERLAY HELPERS
   ===================================================================== */

/**
 * showLoading / hideLoading
 * What:  Toggles the full-screen loading overlay.
 * Why:   Gives a "premium" feel and simulates real computation time,
 *        which is required by the design brief.
 * Input: none   Output: none
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function showLoading() {
  document.getElementById("loadingOverlay").classList.remove("hidden");
}
function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}


/* =====================================================================
   SECTION 6: PAGE SETUP
   ===================================================================== */

/**
 * buildOperationCards
 * What:  Dynamically creates one clickable card per operation inside
 *        #operationsGrid, instead of hand-writing 18 near-identical
 *        blocks of HTML.
 * Why:   Keeps index.html short and makes the operation list a single
 *        source of truth (the OPERATIONS array).
 * Input: none   Output: none
 * Time Complexity: O(n) where n = number of operations (18, constant)
 * Space Complexity: O(n)
 */
function buildOperationCards() {
  const grid = document.getElementById("operationsGrid");
  OPERATIONS.forEach((op) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "operation-card";
    card.innerHTML = `
      <span class="operation-symbol">${op.symbol}</span>
      <span class="operation-name">${op.name}</span>
    `;
    card.addEventListener("click", () => {
      document.getElementById("operationSelect").value = op.id;
      onOperationChange();
      document.getElementById("calculator").scrollIntoView({ behavior: "smooth" });
    });
    grid.appendChild(card);
  });
}

/**
 * buildOperationDropdown
 * What:  Fills the <select id="operationSelect"> with one <option>
 *        per operation.
 * Input: none   Output: none
 * Time Complexity: O(n)   Space Complexity: O(n)
 */
function buildOperationDropdown() {
  const select = document.getElementById("operationSelect");
  OPERATIONS.forEach((op) => {
    const option = document.createElement("option");
    option.value = op.id;
    option.textContent = `${op.name}  (${op.symbol})`;
    select.appendChild(option);
  });
}

/**
 * onOperationChange
 * What:  Reads the selected operation, shows only the size-controls
 *        relevant to its category, and resets any previously generated
 *        matrix grids so old inputs are never used with a new operation.
 * Input: none (reads from #operationSelect)  Output: none
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function onOperationChange() {
  const select = document.getElementById("operationSelect");
  currentOperation = OPERATIONS.find((op) => op.id === select.value);

  // Hide every size-group, then show only what this category needs
  const groups = ["groupA", "groupB", "groupSize", "groupScalar"];
  groups.forEach((id) => document.getElementById(id).classList.remove("active"));

  const cat = currentOperation.category;
  if (cat === "same-size-binary") {
    document.getElementById("groupA").classList.add("active");
  } else if (cat === "mul-binary") {
    document.getElementById("groupA").classList.add("active");
    document.getElementById("groupB").classList.add("active");
  } else if (cat === "scalar") {
    document.getElementById("groupA").classList.add("active");
    document.getElementById("groupScalar").classList.add("active");
  } else if (cat === "unary") {
    document.getElementById("groupA").classList.add("active");
  } else if (cat === "square") {
    document.getElementById("groupSize").classList.add("active");
  } else if (cat === "generator") {
    document.getElementById("groupSize").classList.add("active");
  }

  // Generator operations do not need a matrix drawn at all
  const generateBtn = document.getElementById("generateBtn");
  generateBtn.style.display = cat === "generator" ? "none" : "inline-flex";

  // Reset everything downstream because the shape of the input changed
  document.getElementById("matricesWrapper").innerHTML = "";
  matrixAGenerated = false;
  matrixBGenerated = false;
  document.getElementById("calculateBtn").disabled = (cat !== "generator");
  document.getElementById("clearBtn").disabled = true;
  resetResultCard();
}

/**
 * resetResultCard
 * What:  Restores the result card to its empty placeholder state.
 * Input: none   Output: none
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function resetResultCard() {
  const card = document.getElementById("resultCard");
  card.innerHTML = `<p class="result-placeholder">Your result will appear here.</p>`;
}

/**
 * resetEverything
 * What:  Full reset of the calculator — used by the "Reset All" button.
 * Input: none   Output: none
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function resetEverything() {
  document.getElementById("operationSelect").selectedIndex = 0;
  onOperationChange();
  document.getElementById("rowsA").value = 2;
  document.getElementById("colsA").value = 2;
  document.getElementById("rowsB").value = 2;
  document.getElementById("colsB").value = 2;
  document.getElementById("sizeN").value = 3;
  document.getElementById("scalarValue").value = 2;
  showAlert("info", "Calculator has been reset.");
}


/* =====================================================================
   SECTION 7: MATRIX GRID GENERATION & READING VALUES
   ===================================================================== */

/**
 * validateSize
 * What:  Confirms a rows/columns value is a whole number between 1 and 8.
 * Why:   Stops the user from generating a 0×0, negative, or huge matrix
 *        that would break the layout or the browser.
 * Input: value (number)   Output: boolean (true if valid)
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function validateSize(value) {
  return Number.isInteger(value) && value >= 1 && value <= 8;
}

/**
 * createMatrixGrid
 * What:  Builds one bracketed grid of <input> boxes for a matrix and
 *        appends it inside #matricesWrapper.
 * Why:   Re-used for Matrix A and Matrix B so the code is not duplicated.
 * Input: label (string, e.g. "A"), prefix (string, e.g. "a"),
 *        rows (number), cols (number)
 * Output: none (side effect: DOM elements created)
 * Time Complexity: O(rows * cols) — one input box per cell
 * Space Complexity: O(rows * cols)
 */
function createMatrixGrid(label, prefix, rows, cols) {
  const wrapper = document.getElementById("matricesWrapper");

  const block = document.createElement("div");
  block.className = "matrix-block";

  const gridHTML = document.createElement("div");
  gridHTML.className = "matrix-grid";
  gridHTML.style.gridTemplateColumns = `repeat(${cols}, 58px)`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const input = document.createElement("input");
      input.type = "number";
      input.className = "matrix-cell";
      input.id = `cell-${prefix}-${r}-${c}`;
      input.placeholder = "0";
      gridHTML.appendChild(input);
    }
  }

  block.innerHTML = `
    <span class="matrix-block-label">${label} =</span>
    <span class="matrix-bracket">[</span>
  `;
  block.appendChild(gridHTML);
  const closeBracket = document.createElement("span");
  closeBracket.className = "matrix-bracket";
  closeBracket.textContent = "]";
  block.appendChild(closeBracket);

  wrapper.appendChild(block);
}

/**
 * readMatrixFromDOM
 * What:  Reads every input box for a given matrix prefix and builds a
 *        2D JavaScript array (the internal representation used by all
 *        the math functions below).
 * Why:   Separates "reading the page" from "doing the maths" so each
 *        function stays small and easy to test/explain.
 * Input: prefix (string), rows (number), cols (number)
 * Output: 2D array of numbers, OR null if a box is empty/invalid
 *         (an alert is shown automatically in that case)
 * Time Complexity: O(rows * cols)
 * Space Complexity: O(rows * cols)
 */
function readMatrixFromDOM(prefix, rows, cols) {
  const matrix = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const box = document.getElementById(`cell-${prefix}-${r}-${c}`);
      const rawValue = box.value.trim();
      if (rawValue === "") {
        showAlert("error", "Please fill every cell before calculating.");
        return null;
      }
      const num = Number(rawValue);
      if (Number.isNaN(num)) {
        showAlert("error", "Only numeric values are allowed in the matrix.");
        return null;
      }
      row.push(num);
    }
    matrix.push(row);
  }
  return matrix;
}

// "Generate Matrix" button click handler
document.getElementById("generateBtn").addEventListener("click", () => {
  document.getElementById("matricesWrapper").innerHTML = "";
  const cat = currentOperation.category;

  if (cat === "same-size-binary") {
    const rows = parseInt(document.getElementById("rowsA").value, 10);
    const cols = parseInt(document.getElementById("colsA").value, 10);
    if (!validateSize(rows) || !validateSize(cols)) {
      showAlert("error", "Rows and columns must be whole numbers between 1 and 8.");
      return;
    }
    createMatrixGrid("A", "a", rows, cols);
    createMatrixGrid("B", "b", rows, cols); // B always matches A's size here
    currentRowsA = currentRowsB = rows;
    currentColsA = currentColsB = cols;
    showAlert("success", "Matrix A and B grids generated. Fill in the values.");

  } else if (cat === "mul-binary") {
    const rowsA = parseInt(document.getElementById("rowsA").value, 10);
    const colsA = parseInt(document.getElementById("colsA").value, 10);
    const rowsB = parseInt(document.getElementById("rowsB").value, 10);
    const colsB = parseInt(document.getElementById("colsB").value, 10);
    if (![rowsA, colsA, rowsB, colsB].every(validateSize)) {
      showAlert("error", "Rows and columns must be whole numbers between 1 and 8.");
      return;
    }
    if (colsA !== rowsB) {
      showAlert("error", `For A × B, columns of A (${colsA}) must equal rows of B (${rowsB}).`);
      return;
    }
    createMatrixGrid("A", "a", rowsA, colsA);
    createMatrixGrid("B", "b", rowsB, colsB);
    currentRowsA = rowsA; currentColsA = colsA;
    currentRowsB = rowsB; currentColsB = colsB;
    showAlert("success", "Matrix A and B grids generated. Fill in the values.");

  } else if (cat === "scalar" || cat === "unary") {
    const rows = parseInt(document.getElementById("rowsA").value, 10);
    const cols = parseInt(document.getElementById("colsA").value, 10);
    if (!validateSize(rows) || !validateSize(cols)) {
      showAlert("error", "Rows and columns must be whole numbers between 1 and 8.");
      return;
    }
    createMatrixGrid("A", "a", rows, cols);
    currentRowsA = rows; currentColsA = cols;
    showAlert("success", "Matrix A grid generated. Fill in the values.");

  } else if (cat === "square") {
    const n = parseInt(document.getElementById("sizeN").value, 10);
    if (!validateSize(n)) {
      showAlert("error", "Size must be a whole number between 1 and 8.");
      return;
    }
    createMatrixGrid("A", "a", n, n);
    currentRowsA = currentColsA = n;
    showAlert("success", `Square Matrix A (${n} × ${n}) generated. Fill in the values.`);
  }

  matrixAGenerated = true;
  document.getElementById("calculateBtn").disabled = false;
  document.getElementById("clearBtn").disabled = false;
  resetResultCard();
});

// "Clear Matrix" button — empties every currently visible input box
document.getElementById("clearBtn").addEventListener("click", () => {
  document.querySelectorAll(".matrix-cell").forEach((cell) => (cell.value = ""));
  showAlert("info", "All matrix cells cleared.");
});

// "Reset All" button
document.getElementById("resetBtn").addEventListener("click", resetEverything);

// Operation dropdown change
document.getElementById("operationSelect").addEventListener("change", onOperationChange);


/* =====================================================================
   SECTION 8: PURE MATRIX MATH FUNCTIONS
   Every function below takes plain 2D arrays in and returns a plain
   2D array / number / boolean out. None of them touch the DOM — this
   keeps them simple to explain and simple to reuse.
   ===================================================================== */

const EPSILON = 1e-9; // tolerance used to treat tiny floating point noise as zero

/**
 * roundClean
 * What:  Rounds a floating point number to 4 decimal places and removes
 *        the "-0" edge case.
 * Why:   JavaScript floating point math (e.g. 0.1 + 0.2) produces long
 *        decimals; this keeps results readable.
 * Input: num (number)   Output: number
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function roundClean(num) {
  const rounded = Math.round((num + Number.EPSILON) * 10000) / 10000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * addMatrices
 * What: Adds two matrices of the same size, cell by cell.
 * Why:  Basic matrix arithmetic — result[i][j] = A[i][j] + B[i][j].
 * Input: A, B -> 2D arrays of the same dimensions (rows x cols)
 * Output: 2D array (rows x cols)
 * Time Complexity: O(rows * cols)
 * Space Complexity: O(rows * cols) for the result matrix
 */
function addMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => roundClean(val + B[i][j])));
}

/**
 * subtractMatrices
 * What: Subtracts matrix B from matrix A, cell by cell.
 * Why:  result[i][j] = A[i][j] - B[i][j]
 * Input: A, B -> 2D arrays of the same dimensions
 * Output: 2D array
 * Time Complexity: O(rows * cols)   Space Complexity: O(rows * cols)
 */
function subtractMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => roundClean(val - B[i][j])));
}

/**
 * multiplyMatrices
 * What: Standard matrix multiplication A (m x n) × B (n x p) = C (m x p).
 * Why:  Each result cell is the dot product of a row of A and a column
 *       of B: C[i][j] = sum_k( A[i][k] * B[k][j] ).
 * Input: A (m x n array), B (n x p array)
 * Output: C (m x p array)
 * Time Complexity: O(m * n * p) — three nested loops
 * Space Complexity: O(m * p) for the result matrix
 */
function multiplyMatrices(A, B) {
  const m = A.length, n = A[0].length, p = B[0].length;
  const result = Array.from({ length: m }, () => new Array(p).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = roundClean(sum);
    }
  }
  return result;
}

/**
 * scalarMultiply
 * What: Multiplies every entry of matrix A by a single number k.
 * Why:  result[i][j] = k * A[i][j]
 * Input: A (2D array), k (number)
 * Output: 2D array (same size as A)
 * Time Complexity: O(rows * cols)   Space Complexity: O(rows * cols)
 */
function scalarMultiply(A, k) {
  return A.map((row) => row.map((val) => roundClean(k * val)));
}

/**
 * transposeMatrix
 * What: Flips a matrix over its diagonal — rows become columns.
 * Why:  result[j][i] = A[i][j]. Used directly, and as a helper for the
 *       symmetric / skew-symmetric checks below.
 * Input: A (rows x cols array)
 * Output: (cols x rows array)
 * Time Complexity: O(rows * cols)   Space Complexity: O(rows * cols)
 */
function transposeMatrix(A) {
  const rows = A.length, cols = A[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = A[i][j];
    }
  }
  return result;
}

/**
 * getMinor
 * What: Returns the "minor" of a matrix — A with one row and one column
 *       removed. This is a helper used by determinant() and inverse().
 * Why:  The determinant of an n x n matrix is defined recursively using
 *       determinants of its (n-1) x (n-1) minors.
 * Input: A (square 2D array), rowToRemove (number), colToRemove (number)
 * Output: (n-1) x (n-1) 2D array
 * Time Complexity: O(n^2)   Space Complexity: O(n^2)
 */
function getMinor(A, rowToRemove, colToRemove) {
  return A
    .filter((_, i) => i !== rowToRemove)
    .map((row) => row.filter((_, j) => j !== colToRemove));
}

/**
 * determinant
 * What: Computes the determinant |A| of a square matrix using recursive
 *       cofactor (Laplace) expansion along the first row.
 * Why:  This is the classic, easy-to-explain-in-a-viva method taught in
 *       B.Tech linear algebra: |A| = sum_j( (-1)^j * A[0][j] * |minor_j| )
 * Input: A (n x n square array)
 * Output: number (the determinant)
 * Time Complexity: O(n!) — acceptable here because the UI limits matrices
 *                  to a maximum of 8 x 8 for teaching purposes.
 * Space Complexity: O(n^2) across the recursion stack (each level builds
 *                  a smaller minor matrix).
 */
function determinant(A) {
  const n = A.length;

  // Base case: 1x1 matrix — determinant is the single value itself
  if (n === 1) return A[0][0];

  // Base case: 2x2 matrix — direct formula (ad - bc)
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];

  let det = 0;
  for (let col = 0; col < n; col++) {
    const minor = getMinor(A, 0, col);
    const sign = col % 2 === 0 ? 1 : -1;
    det += sign * A[0][col] * determinant(minor);
  }
  return det;
}

/**
 * cofactorMatrix
 * What: Builds the matrix of cofactors, where each entry is
 *       (-1)^(i+j) * determinant(minor at i,j).
 * Why:  The adjugate (used for the inverse formula) is the transpose of
 *       this cofactor matrix.
 * Input: A (n x n square array)
 * Output: n x n array of cofactors
 * Time Complexity: O(n^2 * n!) — one determinant computed per cell
 * Space Complexity: O(n^2)
 */
function cofactorMatrix(A) {
  const n = A.length;
  const result = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = getMinor(A, i, j);
      const sign = (i + j) % 2 === 0 ? 1 : -1;
      result[i][j] = sign * determinant(minor);
    }
  }
  return result;
}

/**
 * inverseMatrix
 * What: Computes A^-1 using the classic adjugate method:
 *       A^-1 = (1 / |A|) * adjugate(A), where adjugate(A) is the
 *       transpose of the cofactor matrix.
 * Why:  This is the method taught to 2nd-year students, so it is the
 *       easiest to explain step-by-step in a viva.
 * Input: A (n x n square array)
 * Output: n x n array (the inverse), or null if A is singular (|A| = 0)
 * Time Complexity: O(n^2 * n!) — dominated by cofactorMatrix()
 * Space Complexity: O(n^2)
 */
function inverseMatrix(A) {
  const det = determinant(A);
  if (Math.abs(det) < EPSILON) {
    return null; // Singular matrix — inverse does not exist
  }
  const cofactors = cofactorMatrix(A);
  const adjugate = transposeMatrix(cofactors);
  return adjugate.map((row) => row.map((val) => roundClean(val / det)));
}

/**
 * identityMatrix
 * What: Builds an n x n identity matrix — 1s on the main diagonal,
 *       0s everywhere else.
 * Input: n (number)   Output: n x n array
 * Time Complexity: O(n^2)   Space Complexity: O(n^2)
 */
function identityMatrix(n) {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}

/**
 * zeroMatrix
 * What: Builds an n x n matrix filled entirely with zeros.
 * Input: n (number)   Output: n x n array
 * Time Complexity: O(n^2)   Space Complexity: O(n^2)
 */
function zeroMatrix(n) {
  return Array.from({ length: n }, () => new Array(n).fill(0));
}

/**
 * rankMatrix
 * What: Computes the rank of a matrix — the number of non-zero rows
 *       remaining after converting the matrix to row echelon form using
 *       Gaussian elimination with partial pivoting.
 * Why:  Rank tells us the number of linearly independent rows, a core
 *       linear-algebra concept.
 * Input: A (rows x cols array, does not need to be square)
 * Output: number (the rank)
 * Time Complexity: O(rows^2 * cols) — typical for Gaussian elimination
 * Space Complexity: O(rows * cols) for the working copy of the matrix
 */
function rankMatrix(A) {
  // Work on a deep copy so the original input is never mutated
  const mat = A.map((row) => [...row]);
  const rows = mat.length, cols = mat[0].length;
  let rank = 0;

  for (let col = 0; col < cols && rank < rows; col++) {
    // Find a pivot row with a non-zero entry in this column
    let pivotRow = -1;
    for (let r = rank; r < rows; r++) {
      if (Math.abs(mat[r][col]) > EPSILON) {
        pivotRow = r;
        break;
      }
    }
    if (pivotRow === -1) continue; // no pivot in this column, move on

    // Swap the pivot row into place
    [mat[rank], mat[pivotRow]] = [mat[pivotRow], mat[rank]];

    // Eliminate this column from all rows below the pivot
    for (let r = rank + 1; r < rows; r++) {
      const factor = mat[r][col] / mat[rank][col];
      for (let c = col; c < cols; c++) {
        mat[r][c] -= factor * mat[rank][c];
      }
    }
    rank++;
  }
  return rank;
}

/**
 * traceMatrix
 * What: Sums the elements on the main diagonal of a square matrix.
 * Input: A (n x n array)   Output: number
 * Time Complexity: O(n)   Space Complexity: O(1)
 */
function traceMatrix(A) {
  let sum = 0;
  for (let i = 0; i < A.length; i++) sum += A[i][i];
  return roundClean(sum);
}

/**
 * isSymmetric
 * What: Checks whether A equals its own transpose (A = Aᵀ).
 * Input: A (n x n array)   Output: boolean
 * Time Complexity: O(n^2)   Space Complexity: O(n^2) (for the transpose)
 */
function isSymmetric(A) {
  const At = transposeMatrix(A);
  return matricesEqual(A, At);
}

/**
 * isSkewSymmetric
 * What: Checks whether A equals the negative of its transpose (A = -Aᵀ).
 *       Also requires every diagonal entry to be zero.
 * Input: A (n x n array)   Output: boolean
 * Time Complexity: O(n^2)   Space Complexity: O(n^2)
 */
function isSkewSymmetric(A) {
  const negTranspose = transposeMatrix(A).map((row) => row.map((v) => -v));
  return matricesEqual(A, negTranspose);
}

/**
 * isIdentityMatrix
 * What: Checks whether A is exactly the identity matrix of its size.
 * Input: A (n x n array)   Output: boolean
 * Time Complexity: O(n^2)   Space Complexity: O(n^2)
 */
function isIdentityMatrix(A) {
  return matricesEqual(A, identityMatrix(A.length));
}

/**
 * isDiagonal
 * What: Checks whether every off-diagonal entry of A is zero.
 * Input: A (n x n array)   Output: boolean
 * Time Complexity: O(n^2)   Space Complexity: O(1)
 */
function isDiagonal(A) {
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A.length; j++) {
      if (i !== j && Math.abs(A[i][j]) > EPSILON) return false;
    }
  }
  return true;
}

/**
 * isUpperTriangular
 * What: Checks whether every entry below the main diagonal is zero.
 * Input: A (n x n array)   Output: boolean
 * Time Complexity: O(n^2)   Space Complexity: O(1)
 */
function isUpperTriangular(A) {
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < i; j++) {
      if (Math.abs(A[i][j]) > EPSILON) return false;
    }
  }
  return true;
}

/**
 * isLowerTriangular
 * What: Checks whether every entry above the main diagonal is zero.
 * Input: A (n x n array)   Output: boolean
 * Time Complexity: O(n^2)   Space Complexity: O(1)
 */
function isLowerTriangular(A) {
  for (let i = 0; i < A.length; i++) {
    for (let j = i + 1; j < A.length; j++) {
      if (Math.abs(A[i][j]) > EPSILON) return false;
    }
  }
  return true;
}

/**
 * matricesEqual
 * What: Checks whether two matrices have the same dimensions and every
 *       corresponding entry is equal (within a tiny floating point
 *       tolerance).
 * Input: A, B (2D arrays)   Output: boolean
 * Time Complexity: O(rows * cols)   Space Complexity: O(1)
 */
function matricesEqual(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) return false;
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0].length; j++) {
      if (Math.abs(A[i][j] - B[i][j]) > EPSILON) return false;
    }
  }
  return true;
}


/* =====================================================================
   SECTION 9: CALCULATE BUTTON CONTROLLER
   This is the "traffic controller" that reads the DOM, calls the right
   pure math function above, and hands the answer to the result renderer.
   ===================================================================== */

document.getElementById("calculateBtn").addEventListener("click", () => {
  const cat = currentOperation.category;
  let A = null, B = null;

  // Generators don't need any matrix read from the page
  if (cat !== "generator") {
    A = readMatrixFromDOM("a", currentRowsA, currentColsA);
    if (A === null) return; // readMatrixFromDOM already showed an error alert
  }
  if (cat === "same-size-binary" || cat === "mul-binary") {
    B = readMatrixFromDOM("b", currentRowsB, currentColsB);
    if (B === null) return;
  }

  // Square-only operations must be double-checked (defensive validation)
  if (cat === "square" && A.length !== A[0].length) {
    showAlert("error", "This operation requires a square matrix.");
    return;
  }

  // Show the loading animation briefly, then perform the real calculation.
  // This mirrors what a slower, server-based calculator would feel like,
  // while everything actually still runs instantly in the browser.
  showLoading();
  setTimeout(() => {
    try {
      runCalculation(cat, A, B);
    } catch (err) {
      showAlert("error", "Something went wrong: " + err.message);
    } finally {
      hideLoading();
    }
  }, 550);
});

/**
 * runCalculation
 * What:  The big switch-case that maps currentOperation.id to the
 *        correct pure math function, then sends the result to the
 *        appropriate renderer (matrix / number / boolean).
 * Why:   Keeps all "which button does what" logic in exactly one place.
 * Input: cat (string category), A, B (2D arrays or null)
 * Output: none (renders directly into the result card)
 * Time Complexity: depends on the underlying math function called
 * Space Complexity: depends on the underlying math function called
 */
function runCalculation(cat, A, B) {
  const n = parseInt(document.getElementById("sizeN").value, 10);

  switch (currentOperation.id) {
    case "add":
      renderMatrixResult(addMatrices(A, B), "A + B");
      showAlert("success", "Matrices added successfully.");
      break;

    case "sub":
      renderMatrixResult(subtractMatrices(A, B), "A − B");
      showAlert("success", "Matrices subtracted successfully.");
      break;

    case "equality":
      renderBooleanResult(matricesEqual(A, B), "A and B are equal", "A and B are NOT equal");
      showAlert("success", "Comparison complete.");
      break;

    case "mul": {
      if (currentColsA !== currentRowsB) {
        showAlert("error", "Columns of A must equal rows of B for multiplication.");
        return;
      }
      renderMatrixResult(multiplyMatrices(A, B), "A × B");
      showAlert("success", "Matrices multiplied successfully.");
      break;
    }

    case "scalar": {
      const k = Number(document.getElementById("scalarValue").value);
      renderMatrixResult(scalarMultiply(A, k), `${k} · A`);
      showAlert("success", "Scalar multiplication complete.");
      break;
    }

    case "transpose":
      renderMatrixResult(transposeMatrix(A), "Aᵀ");
      showAlert("success", "Transpose computed successfully.");
      break;

    case "rank":
      renderNumberResult(rankMatrix(A), "Rank of A");
      showAlert("success", "Rank computed successfully.");
      break;

    case "determinant":
      renderNumberResult(roundClean(determinant(A)), "Determinant |A|");
      showAlert("success", "Determinant computed successfully.");
      break;

    case "inverse": {
      const inv = inverseMatrix(A);
      if (inv === null) {
        showAlert("error", "Inverse does not exist — determinant is 0 (singular matrix).");
        renderTextResult("Inverse does not exist (matrix is singular: |A| = 0).");
        return;
      }
      renderMatrixResult(inv, "A⁻¹");
      showAlert("success", "Inverse computed successfully.");
      break;
    }

    case "trace":
      renderNumberResult(traceMatrix(A), "Trace tr(A)");
      showAlert("success", "Trace computed successfully.");
      break;

    case "symmetric":
      renderBooleanResult(isSymmetric(A), "Matrix IS symmetric", "Matrix is NOT symmetric");
      showAlert("success", "Symmetry check complete.");
      break;

    case "skewsymmetric":
      renderBooleanResult(isSkewSymmetric(A), "Matrix IS skew-symmetric", "Matrix is NOT skew-symmetric");
      showAlert("success", "Skew-symmetry check complete.");
      break;

    case "isidentity":
      renderBooleanResult(isIdentityMatrix(A), "Matrix IS the identity matrix", "Matrix is NOT the identity matrix");
      showAlert("success", "Identity check complete.");
      break;

    case "diagonal":
      renderBooleanResult(isDiagonal(A), "Matrix IS diagonal", "Matrix is NOT diagonal");
      showAlert("success", "Diagonal check complete.");
      break;

    case "uppertriangular":
      renderBooleanResult(isUpperTriangular(A), "Matrix IS upper triangular", "Matrix is NOT upper triangular");
      showAlert("success", "Upper triangular check complete.");
      break;

    case "lowertriangular":
      renderBooleanResult(isLowerTriangular(A), "Matrix IS lower triangular", "Matrix is NOT lower triangular");
      showAlert("success", "Lower triangular check complete.");
      break;

    case "identity":
      renderMatrixResult(identityMatrix(n), `I(${n})`);
      showAlert("success", `${n} × ${n} identity matrix generated.`);
      break;

    case "zero":
      renderMatrixResult(zeroMatrix(n), `0(${n})`);
      showAlert("success", `${n} × ${n} zero matrix generated.`);
      break;

    default:
      showAlert("warning", "Unknown operation selected.");
  }
}


/* =====================================================================
   SECTION 10: RESULT RENDERING HELPERS
   ===================================================================== */

/**
 * renderMatrixResult
 * What:  Draws a 2D array into the result card as a bracketed grid,
 *        the same visual style as the input grids.
 * Input: matrix (2D array), heading (string label)
 * Output: none (updates #resultCard)
 * Time Complexity: O(rows * cols)   Space Complexity: O(rows * cols)
 */
function renderMatrixResult(matrix, heading) {
  const card = document.getElementById("resultCard");
  const cols = matrix[0].length;

  const cellsHTML = matrix
    .flat()
    .map((val) => `<div class="result-cell">${val}</div>`)
    .join("");

  card.innerHTML = `
    <p class="result-heading">${heading}</p>
    <div class="result-matrix-grid" style="grid-template-columns: repeat(${cols}, 58px);">
      ${cellsHTML}
    </div>
  `;
}

/**
 * renderNumberResult
 * What:  Displays a single numeric result (e.g. determinant, rank, trace).
 * Input: value (number), heading (string label)
 * Output: none (updates #resultCard)
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function renderNumberResult(value, heading) {
  const card = document.getElementById("resultCard");
  card.innerHTML = `
    <p class="result-heading">${heading}</p>
    <p class="result-value">${value}</p>
  `;
}

/**
 * renderBooleanResult
 * What:  Displays a Yes/No style result for the "check" operations.
 * Input: isTrue (boolean), trueText (string), falseText (string)
 * Output: none (updates #resultCard)
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function renderBooleanResult(isTrue, trueText, falseText) {
  const card = document.getElementById("resultCard");
  card.innerHTML = `
    <p class="result-heading">Result</p>
    <p class="result-boolean ${isTrue ? "is-true" : "is-false"}">${isTrue ? trueText : falseText}</p>
  `;
}

/**
 * renderTextResult
 * What:  Displays a plain informational message in the result card.
 * Input: message (string)   Output: none
 * Time Complexity: O(1)   Space Complexity: O(1)
 */
function renderTextResult(message) {
  const card = document.getElementById("resultCard");
  card.innerHTML = `<p class="result-placeholder">${message}</p>`;
}


/* =====================================================================
   SECTION 11: SCROLL FADE-IN FOR DEVELOPER CARDS
   ===================================================================== */

/**
 * initScrollAnimations
 * What:  Uses an IntersectionObserver to add the "in-view" class to
 *        developer cards only once they scroll into the viewport.
 * Why:   Creates a smooth, professional fade-in effect without forcing
 *        every animation to run immediately on page load.
 * Input: none   Output: none
 * Time Complexity: O(1) setup, callback runs O(1) per observed element
 * Space Complexity: O(1)
 */
function initScrollAnimations() {
  const cards = document.querySelectorAll("[data-fade]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  cards.forEach((card) => observer.observe(card));
}


/* =====================================================================
   INITIALISATION — runs once the script loads
   ===================================================================== */
initTheme();
buildOperationCards();
buildOperationDropdown();
onOperationChange();
initScrollAnimations();
