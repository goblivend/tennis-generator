const canvas = document.getElementById('mathCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const sizeSlider = document.getElementById('sizeSlider');
const sizeDisplay = document.getElementById('sizeDisplay');

// Arc Controls
const modeDropdown = document.getElementById('modeDropdown');
const arcControls = document.getElementById('arcControls');
const arcXInput = document.getElementById('arcXInput');
const arcYInput = document.getElementById('arcYInput');
const arcRadiusSlider = document.getElementById('arcRadiusSlider');
const arcRadiusDisplay = document.getElementById('arcRadiusDisplay');
const arcStartSlider = document.getElementById('arcStartSlider');
const arcStartDisplay = document.getElementById('arcStartDisplay');
const arcEndSlider = document.getElementById('arcEndSlider');
const arcEndDisplay = document.getElementById('arcEndDisplay');
const arcDirectionRadios = document.getElementsByName('arcDirection');
const commitArcBtn = document.getElementById('commitArcBtn');

let generatedDots = []; // Cumulative dots to render across resizes
let isDragging = false;
let pointSize = 1;
let lastMathX = null;
let lastMathY = null;

// Arc State
let currentMode = 'freehand'; // 'freehand' or 'arc'
let arcCenter = null;
let arcRadius = 0.5;
let arcStartDegree = 0;
let arcEndDegree = 90;
let arcTrigo = 1; // 1 for CCW, -1 for CW

// Setup Mode Switch
modeDropdown.addEventListener('change', (e) => {
    currentMode = e.target.value;
    arcControls.style.display = currentMode === 'arc' ? 'flex' : 'none';
    arcCenter = null; // reset anchor
    draw();
});

arcXInput.addEventListener('input', (e) => {
    if (!arcCenter) arcCenter = { x: 0, y: 0 };
    arcCenter.x = parseFloat(e.target.value) || 0;
    draw();
});

arcYInput.addEventListener('input', (e) => {
    if (!arcCenter) arcCenter = { x: 0, y: 0 };
    arcCenter.y = parseFloat(e.target.value) || 0;
    draw();
});

arcRadiusSlider.addEventListener('input', (e) => {
    arcRadius = parseFloat(e.target.value);
    arcRadiusDisplay.textContent = arcRadius.toFixed(2);
    draw();
});
arcStartSlider.addEventListener('input', (e) => { arcStartDegree = parseInt(e.target.value, 10); arcStartDisplay.textContent = arcStartDegree; draw(); });
arcEndSlider.addEventListener('input', (e) => { arcEndDegree = parseInt(e.target.value, 10); arcEndDisplay.textContent = arcEndDegree; draw(); });

for (const radio of arcDirectionRadios) {
    radio.addEventListener('change', (e) => {
        arcTrigo = parseInt(e.target.value, 10);
        draw();
    });
}

clearBtn.addEventListener('click', () => {
    historicalPoints.length = 0; // Clear the array from ball-generator.js
    generatedDots.length = 0;
    // Keep arcCenter intact so the current shape is not cleared
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
    const size = Math.min(parentNode.clientWidth, parentNode.clientHeight) - 40;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
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
    return originY - (mathY * originY);
}

/** Main draw loop */
function draw() {
    const cssWidth = canvas.width / (window.devicePixelRatio || 1);
    const cssHeight = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#999";
    ctx.moveTo(0, cssHeight / 2);
    ctx.lineTo(cssWidth, cssHeight / 2);
    ctx.moveTo(cssWidth / 2, 0);
    ctx.lineTo(cssWidth / 2, cssHeight);
    ctx.stroke();

    ctx.fillStyle = "black";
    for (const dot of generatedDots) {
        const symmetricPoints = [
            { x: dot.x,  y: dot.y },
            { x: -dot.x, y: dot.y },
            { x: dot.x,  y: -dot.y },
            { x: -dot.x, y: -dot.y }
        ];
        for (const pt of symmetricPoints) {
            const size = dot.size || 1;
            const xPos = Math.round(cx(pt.x));
            const yPos = Math.round(cy(pt.y));
            ctx.beginPath();
            ctx.arc(xPos, yPos, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw Arc Preview overlay dummy
    if (currentMode === 'arc' && arcCenter) {
        ctx.beginPath();
        // Visual indicator of full circle at Arc Center
        ctx.arc(cx(arcCenter.x), cy(arcCenter.y), arcRadius * (cssWidth / 2), 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'; // Faint blue full circle
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw the specific arc preview
        const startRad = arcStartDegree * (Math.PI / 180);
        let endRad = arcEndDegree * (Math.PI / 180);
        
        let diff = endRad - startRad;
        if (arcTrigo === 1 && diff <= 0) diff += Math.PI * 2;
        if (arcTrigo === -1 && diff >= 0) diff -= Math.PI * 2;
        
        // Visual representation depends heavily on standard canvas invertion
        // However to draw precisely what we commit we iterate it mathematically to preview
        ctx.beginPath();
        ctx.fillStyle = "rgba(16, 185, 129, 0.9)"; // Green sweep dots
        
        const previewSteps = 50;
        for (let i = 0; i <= previewSteps; i++) {
            const angle = startRad + diff * (i / previewSteps);
            const mathX = arcCenter.x + arcRadius * Math.cos(angle);
            const mathY = arcCenter.y + arcRadius * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(cx(mathX), cy(mathY), 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Angle Markers (Start = Blue, End = Purple)
        const startX = arcCenter.x + arcRadius * Math.cos(startRad);
        const startY = arcCenter.y + arcRadius * Math.sin(startRad);
        ctx.beginPath();
        ctx.fillStyle = "rgba(59, 130, 246, 1)"; // Blue
        ctx.arc(cx(startX), cy(startY), 5, 0, Math.PI * 2);
        ctx.fill();

        const endX = arcCenter.x + arcRadius * Math.cos(startRad + diff);
        const endY = arcCenter.y + arcRadius * Math.sin(startRad + diff);
        ctx.beginPath();
        ctx.fillStyle = "rgba(168, 85, 247, 1)"; // Purple
        ctx.arc(cx(endX), cy(endY), 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#ef4444";
        ctx.arc(cx(arcCenter.x), cy(arcCenter.y), 4, 0, Math.PI*2); // Center dot
        ctx.fill();
    }
}

function processCoordinates(mathX, mathY) {
    const newlyGeneratedPoints = generatePoints(mathX, mathY, historicalPoints);
    historicalPoints.push({ x: mathX, y: mathY, size: pointSize });
    const pointsWithSize = newlyGeneratedPoints.map(p => ({ ...p, size: pointSize }));
    generatedDots.push(...pointsWithSize);
}

function handleInput(e) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    const cssWidth = rect.width;
    const cssHeight = rect.height;
    
    // Map CSS pixel offset directly back to Cartesian -1 to 1 plane
    const mathX = (relativeX / (cssWidth / 2)) - 1;
    const mathY = 1 - (relativeY / (cssHeight / 2));

    if (currentMode === 'arc') {
        if (e.type === 'mousedown' || (e.type === 'mousemove' && isDragging)) {
            arcCenter = { x: mathX, y: mathY };
            arcXInput.value = mathX.toFixed(3);
            arcYInput.value = mathY.toFixed(3);
            draw();
        }
        return;
    }

    // --- FREEHAND MODE BELOW ---
    if (!isDragging && e.type !== 'mousedown') {
        lastMathX = null;
        lastMathY = null;
        return;
    }

    if (mathX <= 0 || mathY <= 0) {
        lastMathX = null;
        lastMathY = null;
        return;
    }

    if (e.type === 'mousemove' && lastMathX !== null && lastMathY !== null) {
        const dx = mathX - lastMathX;
        const dy = mathY - lastMathY;
        const mathDistance = Math.sqrt(dx * dx + dy * dy);
        
        const pointMathSize = (pointSize / cssWidth) * 2;
        const maxGap = Math.max(pointMathSize * 0.25, 2 / cssWidth); 

        if (mathDistance > maxGap) {
            const steps = Math.ceil(mathDistance / maxGap);
            for (let i = 1; i < steps; i++) {
                const interpX = lastMathX + dx * (i / steps);
                const interpY = lastMathY + dy * (i / steps);
                processCoordinates(interpX, interpY);
            }
        }
    }

    processCoordinates(mathX, mathY);

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

canvas.addEventListener('mouseup', () => { isDragging = false; lastMathX = null; lastMathY = null; });
canvas.addEventListener('mouseleave', () => { isDragging = false; lastMathX = null; lastMathY = null; });

commitArcBtn.addEventListener('click', () => {
    if (currentMode === 'arc' && arcCenter) {
        const startRad = arcStartDegree * (Math.PI / 180);
        let endRad = arcEndDegree * (Math.PI / 180);
        
        let diff = endRad - startRad;
        if (arcTrigo === 1 && diff <= 0) diff += Math.PI * 2;
        if (arcTrigo === -1 && diff >= 0) diff -= Math.PI * 2;
        
        const cssWidth = canvas.clientWidth;
        const pointMathSize = (pointSize / cssWidth) * 2;
        const arcLength = Math.abs(diff) * arcRadius;
        
        const maxGap = Math.max(pointMathSize * 0.25, 2 / cssWidth);
        const steps = Math.max(2, Math.ceil(arcLength / maxGap));
        
        for (let i = 0; i <= steps; i++) {
            const angle = startRad + diff * (i / steps);
            const mathX = arcCenter.x + arcRadius * Math.cos(angle);
            const mathY = arcCenter.y + arcRadius * Math.sin(angle);
            
            if (mathX > 0 && mathY > 0) {
                processCoordinates(mathX, mathY);
            }
        }
        // persist arcCenter after commit
        draw();
    }
});

// Setup
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Trigger initial layout size
