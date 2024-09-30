const fs = require('fs');

// Function to read JSON file
function readJsonFile(filename) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

// Function to convert a number from any base to decimal
function convertToDecimal(num, base) {
    return parseInt(num, base);
}

// Function to perform Gaussian elimination
function gaussianElimination(matrix) {
    const n = matrix.length;
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxElement = Math.abs(matrix[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(matrix[k][i]) > maxElement) {
                maxElement = Math.abs(matrix[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row
        [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

        // Make all rows below this one 0 in current column
        for (let k = i + 1; k < n; k++) {
            const factor = matrix[k][i] / matrix[i][i];
            for (let j = i; j <= n; j++) {
                matrix[k][j] -= factor * matrix[i][j];
            }
        }
    }

    // Solve equation Ax=b using back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = matrix[i][n] / matrix[i][i];
        for (let k = i - 1; k >= 0; k--) {
            matrix[k][n] -= matrix[k][i] * x[i];
        }
    }
    return x;
}

// Function to find the secret
function findSecret(points, k) {
    const matrix = [];
    for (let i = 0; i < k; i++) {
        const row = [];
        for (let j = k - 1; j >= 0; j--) {
            row.push(Math.pow(points[i].x, j));
        }
        row.push(points[i].y);
        matrix.push(row);
    }
    const coefficients = gaussianElimination(matrix);
    // Round the secret to the nearest integer
    return Math.round(coefficients[coefficients.length - 1]);
}

// Function to process test case
function processTestCase(filename) {
    const data = readJsonFile(filename);
    const n = data.keys.n;
    const k = data.keys.k;

    let points = [];
    for (let i = 1; i <= n; i++) {
        if (data[i]) {
            const x = i;
            const y = convertToDecimal(data[i].value, parseInt(data[i].base));
            points.push({ x, y });
        }
    }

    const secret = findSecret(points.slice(0, k), k);
    console.log(`Secret for ${filename}: ${secret}`);

    // Verify all points
    const coefficients = gaussianElimination(points.slice(0, k).map(p => {
        const row = [];
        for (let i = k - 1; i >= 0; i--) {
            row.push(Math.pow(p.x, i));
        }
        row.push(p.y);
        return row;
    }));

    console.log("Verification:");
    points.forEach(point => {
        let y = 0;
        for (let i = 0; i < k; i++) {
            y += coefficients[i] * Math.pow(point.x, k - 1 - i);
        }
        console.log(`f(${point.x}) = ${y.toFixed(2)}, Original y = ${point.y}`);
        console.log(`Point (${point.x}, ${point.y}) is ${Math.abs(y - point.y) < 1e-10 ? 'valid' : 'invalid'}`);
    });

    // Find wrong points for second test case
    if (filename.includes('2')) {
        const wrongPoints = points.slice(k).filter(point => {
            let y = 0;
            for (let i = 0; i < k; i++) {
                y += coefficients[i] * Math.pow(point.x, k - 1 - i);
            }
            return Math.abs(y - point.y) >= 1e-10;
        });
        console.log(`Wrong points in second test case: ${wrongPoints.map(p => p.x).join(', ') || 'None'}`);
    }
}

// Process both test cases
processTestCase('testcase1.json');
processTestCase('testcase2.json');