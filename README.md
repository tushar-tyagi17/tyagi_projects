# 🔷 Matrix Calculator

A premium, dark-blue themed **Matrix Calculator** web application built entirely with **HTML5, CSS3 and Vanilla JavaScript** — no frameworks, no libraries, no backend.

> B.Tech 2nd Year · 3rd Semester Mini Project
> Developers: **Shashank** & **Vaibhav Tyagi**

---

## 📖 Project Abstract

Matrices are one of the most fundamental tools in engineering mathematics, computer graphics, data science, and countless branches of engineering. Performing matrix operations by hand — especially determinants, inverses, and rank — is repetitive and error-prone for larger matrices. This project, **Matrix Calculator**, is a browser-based tool that allows a user to build a matrix of any size (up to 8×8), choose from **18 different matrix operations**, and instantly see the result — all computed client-side using Vanilla JavaScript, with a modern, responsive, glassmorphism-styled interface.

## 📌 Project Introduction

The Matrix Calculator is a single-page web application that demonstrates both **mathematical algorithm implementation** and **modern front-end design practice**. It was built as a 3rd semester mini-project to strengthen understanding of:

- Core linear algebra concepts (addition, multiplication, determinants, inverses, rank, etc.)
- DOM manipulation using pure JavaScript (no jQuery)
- Responsive, accessible UI/UX design
- Clean code organisation across HTML, CSS, and JS files

## 🎯 Objectives

1. Implement all standard matrix operations taught in the 2nd-year Engineering Mathematics syllabus.
2. Build a fully responsive, modern interface without relying on any CSS/JS framework.
3. Practice DOM manipulation, event handling, and form validation in Vanilla JavaScript.
4. Deliver clear, well-commented, beginner-friendly code that is easy to explain in a viva/practical exam.
5. Provide instant, client-side feedback through custom alerts, loaders, and animations — with no page reloads.

---

## ✨ Features

### Matrix Operations (18 total)
| # | Operation | # | Operation |
|---|-----------|---|-----------|
| 1 | Matrix Addition | 10 | Trace of Matrix |
| 2 | Matrix Subtraction | 11 | Check Symmetric Matrix |
| 3 | Matrix Multiplication | 12 | Check Skew-Symmetric Matrix |
| 4 | Scalar Multiplication | 13 | Check Identity Matrix |
| 5 | Matrix Transpose | 14 | Check Diagonal Matrix |
| 6 | Determinant | 15 | Check Upper Triangular Matrix |
| 7 | Inverse Matrix | 16 | Check Lower Triangular Matrix |
| 8 | Identity Matrix Generator | 17 | Matrix Equality Check |
| 9 | Zero Matrix Generator | 18 | Matrix Rank |

### Design & UX
- Dark + Blue professional theme with **Dark / Light mode toggle** (remembered via `localStorage`)
- Glassmorphism cards, gradient accents, subtle animated matrix-grid background
- Fully responsive: mobile, tablet, laptop, and desktop layouts
- Custom animated **success / error / warning / info** alerts (auto-hide after 3 seconds) — **no `alert()` used anywhere**
- Full-screen loading animation while a calculation "runs"
- Input validation (empty fields, non-numeric values, incompatible matrix sizes)
- Dynamic matrix input grid generation based on user-chosen rows & columns
- "Meet the Developers" section with glassmorphism cards and scroll fade-in animation

---

## 🛠 Technologies Used

- **HTML5** — semantic page structure
- **CSS3** — custom properties (variables), Flexbox, Grid, animations, media queries, glassmorphism (`backdrop-filter`)
- **Vanilla JavaScript (ES6+)** — DOM manipulation, matrix algorithms, event handling, `localStorage`, `IntersectionObserver`
- **Google Fonts** — Space Grotesk, Inter, JetBrains Mono

No React, no Bootstrap/Tailwind, no jQuery, no Node/Express, no TypeScript.

---

## 📂 Project Structure

```
Matrix Calculator/
│
├── index.html                # Main HTML page (structure)
├── README.md                  # This file
│
└── assets/
    ├── css/
    │   └── style.css          # All styling (theme, layout, animations, responsive rules)
    ├── js/
    │   └── script.js          # All logic (matrix math + UI behaviour)
    └── images/                # Reserved for any future image assets
```

---

## ▶ How to Run

1. Download / clone this folder onto your computer.
2. Open the `Matrix Calculator` folder.
3. Double-click `index.html` — it opens directly in any modern browser (Chrome, Edge, Firefox).
4. No installation, server, or build step is required — it is a fully static website.

*(Optional) To run with a local server instead of opening the file directly:*
```bash
cd "Matrix Calculator"
python -m http.server 8000
# then visit http://localhost:8000 in your browser
```

---

## 🧭 How the Calculator Works (User Flow)

1. Choose an operation from the dropdown (or click a card in the "Operations" section).
2. Enter the required size(s) — rows/columns for one or two matrices, a single `n` for square/generator operations, or a scalar `k`.
3. Click **Generate Matrix** — input boxes appear in a bracketed grid.
4. Type the numbers into each cell.
5. Click **Calculate** — a short loading animation plays, then the result appears in the Result Card below, along with a success or error alert.
6. Use **Clear Matrix** to empty the current grid, or **Reset All** to start over completely.

---

## 🔄 ASCII Flowchart

```
                    ┌─────────────────────┐
                    │        START         │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Select Operation from │
                    │  dropdown / card grid │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Enter rows / cols /   │
                    │   size n / scalar k   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Click "Generate       │
                    │  Matrix" button       │
                    └──────────┬───────────┘
                               │
                     ┌─────────▼──────────┐
                     │ Size valid (1-8)?   │
                     └────┬───────────┬────┘
                       No │           │ Yes
                 ┌────────▼───┐   ┌───▼──────────────────┐
                 │ Show error  │   │ Draw bracketed input  │
                 │   alert     │   │  grid(s) on screen    │
                 └────────┬───┘   └───┬──────────────────┘
                          │           │
                          │  ┌────────▼─────────┐
                          │  │ User fills matrix │
                          │  │     cell values   │
                          │  └────────┬─────────┘
                          │           │
                          │  ┌────────▼─────────┐
                          │  │ Click "Calculate" │
                          │  └────────┬─────────┘
                          │           │
                          │  ┌────────▼─────────┐
                          │  │ Validate: all      │
                          │  │ cells filled & are  │
                          │  │ numbers? Square?    │
                          │  │ Dimensions match?   │
                          │  └────┬───────────┬───┘
                          │    No │           │ Yes
                          │  ┌────▼───┐  ┌────▼────────────┐
                          └─▶│ Show   │  │ Show loading     │
                             │ error  │  │ animation (~0.5s)│
                             │ alert  │  └────┬────────────┘
                             └───┬────┘       │
                                 │       ┌─────▼─────────────┐
                                 │       │ Run matching math  │
                                 │       │ function (Section 8│
                                 │       │ of script.js)      │
                                 │       └─────┬─────────────┘
                                 │             │
                                 │       ┌─────▼─────────────┐
                                 │       │ Render result in   │
                                 │       │ Result Card + show  │
                                 │       │ success alert       │
                                 │       └─────┬─────────────┘
                                 │             │
                                 └─────────────▼───────────┐
                                        ┌────────────────┐  │
                                        │      END       │◀─┘
                                        └────────────────┘
```

---

## 🧮 Algorithm (General)

```
1. START
2. Display list of 18 operations to the user.
3. WAIT for user to select an operation.
4. SHOW only the size-input fields relevant to that operation
   (one matrix, two matrices, a square size, or a scalar).
5. WAIT for user to click "Generate Matrix".
6. VALIDATE the entered size(s):
      IF size < 1 OR size > 8 OR not a whole number THEN
          SHOW error alert and STOP
7. DRAW the matrix input grid(s) with empty number boxes.
8. WAIT for user to fill in every cell and click "Calculate".
9. READ all cell values into a 2D array.
      IF any cell is empty or non-numeric THEN
          SHOW error alert and STOP
10. IF operation requires a square matrix AND rows != cols THEN
       SHOW error alert and STOP
11. SHOW loading animation briefly.
12. CALL the matching matrix function (add, subtract, multiply,
    determinant, inverse, rank, trace, transpose, or a boolean check).
13. DISPLAY the returned result (matrix / number / true-false) in the
    Result Card.
14. SHOW a success alert.
15. END
```

## 📝 Pseudo Code (example — Determinant, recursive cofactor expansion)

```
FUNCTION determinant(A):
    n = size of A

    IF n == 1:
        RETURN A[0][0]

    IF n == 2:
        RETURN A[0][0]*A[1][1] - A[0][1]*A[1][0]

    det = 0
    FOR col FROM 0 TO n-1:
        minor = A with row 0 and column "col" removed
        sign  = +1 IF col is even ELSE -1
        det   = det + sign * A[0][col] * determinant(minor)
    END FOR

    RETURN det
END FUNCTION
```

## 📝 Pseudo Code (example — Rank, Gaussian elimination)

```
FUNCTION rank(A):
    make a copy of A called mat
    rows = number of rows, cols = number of columns
    rank = 0

    FOR col FROM 0 TO cols-1:
        IF rank >= rows: BREAK

        find a row (>= rank) where mat[row][col] != 0
        IF no such row: CONTINUE to next column

        swap that row into position "rank"

        FOR every row BELOW "rank":
            factor = mat[row][col] / mat[rank][col]
            subtract (factor * pivot row) from this row

        rank = rank + 1
    END FOR

    RETURN rank
END FUNCTION
```

---

## ⏱ Function-by-Function Notes

Every JavaScript function inside `assets/js/script.js` has a comment block directly above it in the source code explaining:
- **What** the function does
- **Why** it is used
- **Input** it expects
- **Output** it returns
- **Time Complexity**
- **Space Complexity**

This was done deliberately so the code can be explained line-by-line in a practical exam / viva without needing a separate document.

---

## ✅ Conclusion

The Matrix Calculator project successfully demonstrates how core linear algebra operations can be implemented from scratch using only Vanilla JavaScript, and presented through a clean, modern, responsive interface built with pure HTML and CSS. It reinforces both mathematical understanding (recursive determinant expansion, Gaussian elimination for rank, the adjugate method for inverses) and front-end engineering skills (DOM manipulation, state management without a framework, accessible and responsive design).

## 🚀 Future Scope

- Support for matrices larger than 8×8 with a scrollable input grid
- Step-by-step solution walkthrough (showing each elimination/expansion step)
- Export results as PDF or copy-to-clipboard
- Support for complex-number matrices
- Eigenvalues & Eigenvectors calculator
- Matrix operation history panel (session-based)
- LU / QR decomposition modules

---

## 👨‍💻 Developers

| Name | Role |
|------|------|
| **Shashank** | Frontend Developer & JavaScript Logic — UI design, matrix operations, user experience |
| **Vaibhav Tyagi** | Frontend Developer & UI/UX Designer — responsive design, styling, testing, overall development |

---

© 2026 Matrix Calculator. Designed & Developed by **Shashank** and **Vaibhav Tyagi**. All Rights Reserved.
