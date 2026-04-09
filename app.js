const canvas = document.getElementById('mathCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const sizeSlider = document.getElementById('sizeSlider');
const sizeDisplay = document.getElementById('sizeDisplay');

let generatedDots = []; // Cumulative dots to render across resizes
let isDragging = false;
let pointSize = 1;
let lastMathX = null;
let lastMathY = null;

clearBtn.addEventListener('click', () => {
    historicalPoints.length = 0; // Clear the array from ball-generator.js
    generatedDots.length = 0;
    draw();
});

sizeSlider.addEventListener('input', (e) => {
    pointSize = parseInt(e.target.value, 10);
    sizeDisplay.textContent = `${pointSize}px`;
    draw();
});

/**
 * Keep canvas crisp by maintaining pixel bounds exactly
 * mapping to the CSS sized container.
 */
function resizeCanvas() {
    const parentNode = canvas.parentElement;

    // Ensure 1:1 square ratio directly tied to screen density for crisp 1px lines
    const size = Math.min(parentNode.clientWidth, parentNode.clientHeight) - 40; // Roughly subtract container padding
    const dpr = window.devicePixelRatio || 1;

    // Actual internal resolution
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    // CSS visible size
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // Scale drawing context so everything matches css pixels natively but crisp
    ctx.scale(dpr, dpr);

    draw();
}

/** Translates Cartesian [-1, 1] to Canvas X pixels */
function cx(mathX) {
    const cssWidth = canvas.width / (window.devicePixelRatio || 1);
    const originX = cssWidth / 2;
    return originX + (mathX * originX);
}

/** Translates Cartesian [-1, 1] to Canvas Y pixels */
function cy(mathY) {
    const cssHeight = canvas.height / (window.devicePixelRatio || 1);
    const originY = cssHeight / 2;
    // Y is inverted in web canvases relative to standard cartesian math
    return originY - (mathY * originY);
}

/** Main draw loop */
function draw() {
    const cssWidth = canvas.width / (window.devicePixelRatio || 1);
    const cssHeight = canvas.height / (window.devicePixelRatio || 1);

    // 1. Clear frame
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // 2. Draw axes
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#999";

    // X Axis
    ctx.moveTo(0, cssHeight / 2);
    ctx.lineTo(cssWidth, cssHeight / 2);

    // Y Axis
    ctx.moveTo(cssWidth / 2, 0);
    ctx.lineTo(cssWidth / 2, cssHeight);

    ctx.stroke();

    // 3. Render symmetry for all previously generated dots
    ctx.fillStyle = "black";
    for (const dot of generatedDots) {
        // Core generated point and 3 symmetrical companions
        const symmetricPoints = [
            { x: dot.x,  y: dot.y },
            { x: -dot.x, y: dot.y },
            { x: dot.x,  y: -dot.y },
            { x: -dot.x, y: -dot.y }
        ];

        for (const pt of symmetricPoints) {
            const size = dot.size || 1; // Fallback to 1 if missing for old dots
            const xPos = Math.round(cx(pt.x));
            const yPos = Math.round(cy(pt.y));

            ctx.beginPath();
            ctx.arc(xPos, yPos, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/** Intercept correct coordinates and filter */
function handleInput(e) {
    if (!isDragging && e.type !== 'mousedown') {
        lastMathX = null;
        lastMathY = null;
        return;
    }

    const rect = canvas.getBoundingClientRect();

    // Calculate click offset relative to the canvas CSS bounds
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    // Map CSS pixel offset directly back to Cartesian -1 to 1 plane
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    const mathX = (relativeX / (cssWidth / 2)) - 1;
    const mathY = 1 - (relativeY / (cssHeight / 2));

    // Ignore anything outside the top right, positive quadrant (Quad I)
    if (mathX <= 0 || mathY <= 0) {
        lastMathX = null;
        lastMathY = null;
        return;
    }

    // Interpolate points when dragging mouse fast to ensure continuous dense circles
    if (e.type === 'mousemove' && lastMathX !== null && lastMathY !== null) {
        const dx = mathX - lastMathX;
        const dy = mathY - lastMathY;
        const mathDistance = Math.sqrt(dx * dx + dy * dy);

        // Calculate maximum gap between points (approx. 1/4th of the point's size in math coordinates)
        const pointMathSize = (pointSize / cssWidth) * 2;
        const maxGap = Math.max(pointMathSize * 0.25, 2 / cssWidth);

        if (mathDistance > maxGap) {
            const steps = Math.ceil(mathDistance / maxGap);
            for (let i = 1; i < steps; i++) {
                const interpX = lastMathX + dx * (i / steps);
                const interpY = lastMathY + dy * (i / steps);

                const interpGenedPoints = generatePoints(interpX, interpY, historicalPoints);
                historicalPoints.push({ x: interpX, y: interpY, size: pointSize });
                generatedDots.push(...interpGenedPoints.map(p => ({ ...p, size: pointSize })));
            }
        }
    }

    // Trigger AI-forbidden logic implemented by user
    const newlyGeneratedPoints = generatePoints(mathX, mathY, historicalPoints);

    // Commit valid state
    historicalPoints.push({ x: mathX, y: mathY, size: pointSize });

    // Store size with generated dots so they render correctly later
    const pointsWithSize = newlyGeneratedPoints.map(p => ({ ...p, size: pointSize }));
    generatedDots.push(...pointsWithSize);

    lastMathX = mathX;
    lastMathY = mathY;

    draw();
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMathX = null;
    lastMathY = null;
    handleInput(e);
});

canvas.addEventListener('mousemove', handleInput);

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    lastMathX = null;
    lastMathY = null;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    lastMathX = null;
    lastMathY = null;
});

// Setup
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Trigger initial layout size
