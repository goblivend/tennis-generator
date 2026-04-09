const canvas = document.getElementById('mathCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
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

// Line Controls
const lineControls = document.getElementById('lineControls');
const lineStartXInput = document.getElementById('lineStartXInput');
const lineStartYInput = document.getElementById('lineStartYInput');
const lineEndXInput = document.getElementById('lineEndXInput');
const lineEndYInput = document.getElementById('lineEndYInput');
const commitLineBtn = document.getElementById('commitLineBtn');

// Square Controls
const polygonControls = document.getElementById('polygonControls');
const polygonXInput = document.getElementById('polygonXInput');
const polygonYInput = document.getElementById('polygonYInput');
const polygonSidesSlider = document.getElementById('polygonSidesSlider');
const polygonSidesDisplay = document.getElementById('polygonSidesDisplay');
const polygonRadiusSlider = document.getElementById('polygonRadiusSlider');
const polygonRadiusDisplay = document.getElementById('polygonRadiusDisplay');
const polygonStartSlider = document.getElementById('polygonStartSlider');
const polygonStartDisplay = document.getElementById('polygonStartDisplay');
const polygonEndSlider = document.getElementById('polygonEndSlider');
const polygonEndDisplay = document.getElementById('polygonEndDisplay');
const squareDirectionRadios = document.getElementsByName('squareDirection');
const polygonRotationSlider = document.getElementById('polygonRotationSlider');
const polygonRotationDisplay = document.getElementById('polygonRotationDisplay');
const starRotationSlider = document.getElementById('starRotationSlider');
const starRotationDisplay = document.getElementById('starRotationDisplay');
const commitPolygonBtn = document.getElementById('commitPolygonBtn');

// Star Controls
const starControls = document.getElementById('starControls');
const starXInput = document.getElementById('starXInput');
const starYInput = document.getElementById('starYInput');
const starPointsSlider = document.getElementById('starPointsSlider');
const starPointsDisplay = document.getElementById('starPointsDisplay');
const starOuterRadiusSlider = document.getElementById('starOuterRadiusSlider');
const starOuterRadiusDisplay = document.getElementById('starOuterRadiusDisplay');
const starInnerRadiusSlider = document.getElementById('starInnerRadiusSlider');
const starInnerRadiusDisplay = document.getElementById('starInnerRadiusDisplay');
const starStartSlider = document.getElementById('starStartSlider');
const starStartDisplay = document.getElementById('starStartDisplay');
const starEndSlider = document.getElementById('starEndSlider');
const starEndDisplay = document.getElementById('starEndDisplay');
const starDirectionRadios = document.getElementsByName('starDirection');
const commitStarBtn = document.getElementById('commitStarBtn');

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

// Line State
let lineStart = { x: 0.2, y: 0.2 };
let lineEnd = { x: 0.8, y: 0.8 };
let activeHandle = null;

// Square State
let polygonCenter = { x: 0.5, y: 0.5 };
let polygonSides = 4;
let polygonRadius = 0.5;
let polygonStartDegree = 0;
let polygonEndDegree = 360;
let polygonTrigo = 1;
let polygonRotation = 0;

// Star State
let starCenter = { x: 0.5, y: 0.5 };
let starPoints = 5;
let starOuterRadius = 0.4;
let starInnerRadius = 0.2;
let starStartDegree = 0;
let starEndDegree = 360;
let starTrigo = 1;
let starRotationRad = 0;

// Helper to filter sweep angles for piecemeal shapes
function inSweep(cx, cy, mathX, mathY, startRad, diff) {
    if (Math.abs(diff) >= Math.PI * 2 - 0.0001) return true; // Full circle
    // If exactly center, normally shouldn't happen, return true
    if (mathX === cx && mathY === cy) return true;

    const EPSILON = 0.02; // generous epsilon for floating point inaccuracies
    const ang = Math.atan2(mathY - cy, mathX - cx);
    let rel = (ang - startRad) % (Math.PI * 2);
    if (rel < 0) rel += Math.PI * 2;

    if (diff > 0) {
        return rel <= diff + EPSILON;
    } else {
        return rel >= (Math.PI * 2 + diff - EPSILON) || rel <= EPSILON;
    }
}

// Setup Mode Switch
modeDropdown.addEventListener('change', (e) => {
    currentMode = e.target.value;
    arcControls.style.display = currentMode === 'arc' ? 'flex' : 'none';
    lineControls.style.display = currentMode === 'line' ? 'flex' : 'none';
    polygonControls.style.display = currentMode === 'polygon' ? 'flex' : 'none';
    starControls.style.display = currentMode === 'star' ? 'flex' : 'none';
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

lineStartXInput.addEventListener('input', (e) => { lineStart.x = parseFloat(e.target.value) || 0; draw(); });
lineStartYInput.addEventListener('input', (e) => { lineStart.y = parseFloat(e.target.value) || 0; draw(); });
lineEndXInput.addEventListener('input', (e) => { lineEnd.x = parseFloat(e.target.value) || 0; draw(); });
lineEndYInput.addEventListener('input', (e) => { lineEnd.y = parseFloat(e.target.value) || 0; draw(); });

polygonXInput.addEventListener('input', (e) => { polygonCenter.x = parseFloat(e.target.value) || 0; draw(); });
polygonYInput.addEventListener('input', (e) => { polygonCenter.y = parseFloat(e.target.value) || 0; draw(); });
polygonSidesSlider.addEventListener('input', (e) => { polygonSides = parseFloat(e.target.value); polygonSidesDisplay.textContent = polygonSides.toFixed(2); draw(); });
polygonRadiusSlider.addEventListener('input', (e) => { polygonRadius = parseFloat(e.target.value); polygonRadiusDisplay.textContent = polygonRadius.toFixed(2); draw(); });
polygonStartSlider.addEventListener('input', (e) => { polygonStartDegree = parseInt(e.target.value, 10); polygonStartDisplay.textContent = polygonStartDegree; draw(); });
polygonEndSlider.addEventListener('input', (e) => { polygonEndDegree = parseInt(e.target.value, 10); polygonEndDisplay.textContent = polygonEndDegree; draw(); });

polygonRotationSlider.addEventListener('input', (e) => { polygonRotation = parseInt(e.target.value, 10); polygonRotationDisplay.textContent = polygonRotation + '°'; draw(); });
starRotationSlider.addEventListener('input', (e) => { starRotationRad = parseInt(e.target.value, 10) * (Math.PI / 180); starRotationDisplay.textContent = e.target.value + '°'; draw(); });
for (const radio of squareDirectionRadios) { radio.addEventListener('change', (e) => { polygonTrigo = parseInt(e.target.value, 10); draw(); }); }

starXInput.addEventListener('input', (e) => { starCenter.x = parseFloat(e.target.value) || 0; draw(); });
starYInput.addEventListener('input', (e) => { starCenter.y = parseFloat(e.target.value) || 0; draw(); });
starPointsSlider.addEventListener('input', (e) => { starPoints = parseInt(e.target.value, 10); starPointsDisplay.textContent = starPoints; draw(); });
starOuterRadiusSlider.addEventListener('input', (e) => { starOuterRadius = parseFloat(e.target.value); starOuterRadiusDisplay.textContent = starOuterRadius.toFixed(2); draw(); });
starInnerRadiusSlider.addEventListener('input', (e) => { starInnerRadius = parseFloat(e.target.value); starInnerRadiusDisplay.textContent = starInnerRadius.toFixed(2); draw(); });
starStartSlider.addEventListener('input', (e) => { starStartDegree = parseInt(e.target.value, 10); starStartDisplay.textContent = starStartDegree; draw(); });
starEndSlider.addEventListener('input', (e) => { starEndDegree = parseInt(e.target.value, 10); starEndDisplay.textContent = starEndDegree; draw(); });
for (const radio of starDirectionRadios) { radio.addEventListener('change', (e) => { starTrigo = parseInt(e.target.value, 10); draw(); }); }

clearBtn.addEventListener('click', () => {
    historicalPoints.length = 0; // Clear the array from ball-generator.js
    generatedDots.length = 0;
    // Keep arcCenter intact so the current shape is not cleared
    draw();
});

saveBtn.addEventListener('click', () => {
    // Generate image by capturing current state over a white background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const eCtx = exportCanvas.getContext('2d');
    eCtx.fillStyle = 'white';
    eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    eCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = 'tennis-pattern.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
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

    // Draw Line Preview
    if (currentMode === 'line') {
        const pSize = (pointSize / cssWidth) * 2;
        const maxGap = Math.max(pSize * 0.25, 2 / cssWidth);
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const lDistance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(2, Math.ceil(lDistance / maxGap));

        ctx.beginPath();
        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        for (let i = 0; i <= steps; i++) {
            const pX = lineStart.x + dx * (i / steps);
            const pY = lineStart.y + dy * (i / steps);
            ctx.beginPath();
            ctx.arc(cx(pX), cy(pY), pointSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw handles
        ctx.beginPath();
        ctx.fillStyle = "rgba(59, 130, 246, 1)"; // Blue
        ctx.arc(cx(lineStart.x), cy(lineStart.y), 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(168, 85, 247, 1)"; // Purple
        ctx.arc(cx(lineEnd.x), cy(lineEnd.y), 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Polygon Preview
    if (currentMode === 'polygon' || currentMode === 'square') {
        const pSize = (pointSize / cssWidth) * 2;
        const maxGap = Math.max(pSize * 0.25, 2 / cssWidth);

        const startRad = polygonStartDegree * (Math.PI / 180);
        let endRad = polygonEndDegree * (Math.PI / 180);
        let diff = endRad - startRad;
        if (polygonTrigo === 1 && diff <= 0) diff += Math.PI * 2;
        if (polygonTrigo === -1 && diff >= 0) diff -= Math.PI * 2;

        const edges = [];
        for (let i = 0; i < polygonSides; i++) {
            const a1 = i * ((Math.PI * 2) / polygonSides) + (polygonRotation * Math.PI/180);
            const a2 = ((i+1) % polygonSides) * ((Math.PI * 2) / polygonSides) + (polygonRotation * Math.PI/180);
            edges.push({
                s: {x: polygonCenter.x + polygonRadius * Math.cos(a1), y: polygonCenter.y + polygonRadius * Math.sin(a1)},
                e: {x: polygonCenter.x + polygonRadius * Math.cos(a2), y: polygonCenter.y + polygonRadius * Math.sin(a2)}
            });
        }

        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        for (const edge of edges) {
            const dx = edge.e.x - edge.s.x;
            const dy = edge.e.y - edge.s.y;
            const lDistance = Math.hypot(dx, dy);
            const steps = Math.max(2, Math.ceil(lDistance / maxGap));

            for (let i = 0; i <= steps; i++) {
                const pX = edge.s.x + dx * (i / steps);
                const pY = edge.s.y + dy * (i / steps);

                if (inSweep(polygonCenter.x, polygonCenter.y, pX, pY, startRad, diff)) {
                    ctx.beginPath();
                    ctx.arc(cx(pX), cy(pY), pointSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        const markerRadiusSq = polygonRadius;
        // draw start marker
        ctx.beginPath();
        ctx.fillStyle = "rgba(59, 130, 246, 1)"; // Blue
        ctx.arc(cx(polygonCenter.x + markerRadiusSq * Math.cos(startRad)), cy(polygonCenter.y + markerRadiusSq * Math.sin(startRad)), 5, 0, Math.PI * 2);
        ctx.fill();
        // draw end marker
        ctx.beginPath();
        ctx.fillStyle = "rgba(168, 85, 247, 1)"; // Purple
        ctx.arc(cx(polygonCenter.x + markerRadiusSq * Math.cos(startRad+diff)), cy(polygonCenter.y + markerRadiusSq * Math.sin(startRad+diff)), 5, 0, Math.PI * 2);
        ctx.fill();
        // draw rot marker
        ctx.beginPath();
        ctx.fillStyle = "#f59e0b"; // Orange
        ctx.arc(cx(polygonCenter.x + markerRadiusSq * Math.cos(polygonRotation * Math.PI/180)), cy(polygonCenter.y + markerRadiusSq * Math.sin(polygonRotation * Math.PI/180)), 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#ef4444";
        ctx.arc(cx(polygonCenter.x), cy(polygonCenter.y), 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Star Preview
    if (currentMode === 'star') {
        const pSize = (pointSize / cssWidth) * 2;
        const maxGap = Math.max(pSize * 0.25, 2 / cssWidth);

        const startRad = starStartDegree * (Math.PI / 180);
        let endRad = starEndDegree * (Math.PI / 180);
        let diff = endRad - startRad;
        if (starTrigo === 1 && diff <= 0) diff += Math.PI * 2;
        if (starTrigo === -1 && diff >= 0) diff -= Math.PI * 2;

        const points = [];
        const starAngle = Math.PI / starPoints;
        for (let i = 0; i < 2 * starPoints; i++) {
            const r = (i % 2 === 0) ? starOuterRadius : starInnerRadius;
            const a = i * starAngle + Math.PI / 2 + starRotationRad;
            points.push({
                x: starCenter.x + r * Math.cos(a),
                y: starCenter.y + r * Math.sin(a)
            });
        }

        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        for (let i = 0; i < points.length; i++) {
            const start = points[i];
            const end = points[(i + 1) % points.length];
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const lDistance = Math.hypot(dx, dy);
            const steps = Math.max(2, Math.ceil(lDistance / maxGap));

            for (let j = 0; j <= steps; j++) {
                const pX = start.x + dx * (j / steps);
                const pY = start.y + dy * (j / steps);

                if (inSweep(starCenter.x, starCenter.y, pX, pY, startRad, diff)) {
                    ctx.beginPath();
                    ctx.arc(cx(pX), cy(pY), pointSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // draw start marker
        ctx.beginPath();
        ctx.fillStyle = "rgba(59, 130, 246, 1)"; // Blue
        ctx.arc(cx(starCenter.x + starOuterRadius * Math.cos(startRad)), cy(starCenter.y + starOuterRadius * Math.sin(startRad)), 5, 0, Math.PI * 2);
        ctx.fill();
        // draw end marker
        ctx.beginPath();
        ctx.fillStyle = "rgba(168, 85, 247, 1)"; // Purple
        ctx.arc(cx(starCenter.x + starOuterRadius * Math.cos(startRad+diff)), cy(starCenter.y + starOuterRadius * Math.sin(startRad+diff)), 5, 0, Math.PI * 2);
        ctx.fill();
        // draw rot marker
        ctx.beginPath();
        ctx.fillStyle = "#f59e0b"; // Orange
        ctx.arc(cx(starCenter.x + starOuterRadius * Math.cos(starRotationRad + Math.PI/2)), cy(starCenter.y + starOuterRadius * Math.sin(starRotationRad + Math.PI/2)), 5, 0, Math.PI * 2);
        ctx.fill();
        // draw inner scale marker
        ctx.beginPath();
        ctx.fillStyle = "#10b981"; // Green
        ctx.arc(cx(starCenter.x + starInnerRadius * Math.cos(starRotationRad + Math.PI/2 + Math.PI/starPoints)), cy(starCenter.y + starInnerRadius * Math.sin(starRotationRad + Math.PI/2 + Math.PI/starPoints)), 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#ef4444";
        ctx.arc(cx(starCenter.x), cy(starCenter.y), 4, 0, Math.PI * 2);
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

    const threshold = 15 / (cssWidth / 2); // detection threshold

    if (currentMode === 'arc') {
        if (e.type === 'mousedown') {
            const startRad = arcStartDegree * (Math.PI / 180);
            const endRad = arcEndDegree * (Math.PI / 180);
            if (arcCenter && Math.hypot(mathX - (arcCenter.x + arcRadius * Math.cos(startRad)), mathY - (arcCenter.y + arcRadius * Math.sin(startRad))) < threshold) {
                activeHandle = 'startLimit';
            } else if (arcCenter && Math.hypot(mathX - (arcCenter.x + arcRadius * Math.cos(endRad)), mathY - (arcCenter.y + arcRadius * Math.sin(endRad))) < threshold) {
                activeHandle = 'endLimit';
            } else {
                activeHandle = 'center';
            }
        }
        
        if (e.type === 'mousedown' || (e.type === 'mousemove' && isDragging)) {
            if (activeHandle === 'center') {
                arcCenter = { x: mathX, y: mathY };
                arcXInput.value = mathX.toFixed(3);
                arcYInput.value = mathY.toFixed(3);
            } else if (activeHandle === 'startLimit') {
                let ang = Math.atan2(mathY - arcCenter.y, mathX - arcCenter.x) * (180 / Math.PI);
                if (ang < 0) ang += 360;
                arcStartDegree = Math.round(ang);
                arcStartSlider.value = arcStartDegree;
                arcStartDisplay.textContent = arcStartDegree;
            } else if (activeHandle === 'endLimit') {
                let ang = Math.atan2(mathY - arcCenter.y, mathX - arcCenter.x) * (180 / Math.PI);
                if (ang < 0) ang += 360;
                arcEndDegree = Math.round(ang);
                arcEndSlider.value = arcEndDegree;
                arcEndDisplay.textContent = arcEndDegree;
            }
            draw();
        }
        return;
    }

    if (currentMode === 'line') {
        if (e.type === 'mousedown') {
            const distStart = Math.hypot(mathX - lineStart.x, mathY - lineStart.y);
            const distEnd = Math.hypot(mathX - lineEnd.x, mathY - lineEnd.y);

            if (distStart < threshold) activeHandle = 'start';
            else if (distEnd < threshold) activeHandle = 'end';
            else {
                // Click away: assign to start or end depending on distance or create new
                lineEnd = { x: lineStart.x, y: lineStart.y }; // Bring end to old start
                lineStart = { x: mathX, y: mathY }; // Set new start
                activeHandle = 'start';
            }
        }

        if (isDragging || e.type === 'mousedown') {
            if (activeHandle === 'start') {
                lineStart = { x: mathX, y: mathY };
                lineStartXInput.value = mathX.toFixed(3);
                lineStartYInput.value = mathY.toFixed(3);
            } else if (activeHandle === 'end') {
                lineEnd = { x: mathX, y: mathY };
                lineEndXInput.value = mathX.toFixed(3);
                lineEndYInput.value = mathY.toFixed(3);
            }
            draw();
        }
        return;
    }

    if (currentMode === 'square' || currentMode === 'polygon') {
        if (e.type === 'mousedown') {
            const startRad = polygonStartDegree * (Math.PI / 180);
            const endRad = polygonEndDegree * (Math.PI / 180);
            const rotRad = polygonRotation * (Math.PI / 180);
            if (polygonCenter && Math.hypot(mathX - (polygonCenter.x + polygonRadius * Math.cos(rotRad)), mathY - (polygonCenter.y + polygonRadius * Math.sin(rotRad))) < threshold) {
                activeHandle = 'rotateScale';
            } else if (polygonCenter && Math.hypot(mathX - (polygonCenter.x + polygonRadius * Math.cos(startRad)), mathY - (polygonCenter.y + polygonRadius * Math.sin(startRad))) < threshold) {
                activeHandle = 'startLimit';
            } else if (polygonCenter && Math.hypot(mathX - (polygonCenter.x + polygonRadius * Math.cos(endRad)), mathY - (polygonCenter.y + polygonRadius * Math.sin(endRad))) < threshold) {
                activeHandle = 'endLimit';
            } else {
                activeHandle = 'center';
            }
        }
        
        if (e.type === 'mousedown' || (e.type === 'mousemove' && isDragging)) {
            if (activeHandle === 'center') {
                polygonCenter = { x: mathX, y: mathY };
                polygonXInput.value = mathX.toFixed(3);
                polygonYInput.value = mathY.toFixed(3);
            } else if (activeHandle === 'startLimit') {
                let ang = Math.atan2(mathY - polygonCenter.y, mathX - polygonCenter.x) * (180 / Math.PI);
                if (ang < 0) ang += 360;
                polygonStartDegree = Math.round(ang);
                polygonStartSlider.value = polygonStartDegree;
                polygonStartDisplay.textContent = polygonStartDegree;
            } else if (activeHandle === 'endLimit') {
                let ang = Math.atan2(mathY - polygonCenter.y, mathX - polygonCenter.x) * (180 / Math.PI);
                if (ang < 0) ang += 360;
                polygonEndDegree = Math.round(ang);
                polygonEndSlider.value = polygonEndDegree;
                polygonEndDisplay.textContent = polygonEndDegree;
            } else if (activeHandle === 'rotateScale') {
                let ang = Math.atan2(mathY - polygonCenter.y, mathX - polygonCenter.x) * (180 / Math.PI);
                if (ang < 0) ang += 360;
                polygonRotation = Math.round(ang);
                polygonRotationSlider.value = polygonRotation;
                polygonRotationDisplay.textContent = polygonRotation + '°';
                
                let r = Math.hypot(mathX - polygonCenter.x, mathY - polygonCenter.y);
                polygonRadius = Math.min(1.0, Math.max(0.1, r));
                polygonRadiusSlider.value = polygonRadius.toFixed(2);
                polygonRadiusDisplay.textContent = polygonRadius.toFixed(2);
            }
            draw();
        }
        return;
    }

    if (currentMode === 'star') {
        if (e.type === 'mousedown') {
            const startRad = starStartDegree * (Math.PI / 180);
            const endRad = starEndDegree * (Math.PI / 180);
            const rotRad = starRotationRad + Math.PI / 2;
            const innerRotRad = rotRad + Math.PI / starPoints;
            if (starCenter && Math.hypot(mathX - (starCenter.x + starOuterRadius * Math.cos(rotRad)), mathY - (starCenter.y + starOuterRadius * Math.sin(rotRad))) < threshold) {
                activeHandle = 'rotateScale';
            } else if (starCenter && Math.hypot(mathX - (starCenter.x + starInnerRadius * Math.cos(innerRotRad)), mathY - (starCenter.y + starInnerRadius * Math.sin(innerRotRad))) < threshold) {
                activeHandle = 'innerScale';
            } else if (starCenter && Math.hypot(mathX - (starCenter.x + starOuterRadius * Math.cos(startRad)), mathY - (starCenter.y + starOuterRadius * Math.sin(startRad))) < threshold) {
                activeHandle = 'startLimit';
            } else if (starCenter && Math.hypot(mathX - (starCenter.x + starOuterRadius * Math.cos(endRad)), mathY - (starCenter.y + starOuterRadius * Math.sin(endRad))) < threshold) {
                activeHandle = 'endLimit';
            } else {
                activeHandle = 'center';
            }
        }
        
        if (e.type === 'mousedown' || (e.type === 'mousemove' && isDragging)) {
            if (activeHandle === 'center') {
                starCenter = { x: mathX, y: mathY };
                starXInput.value = mathX.toFixed(3);
                starYInput.value = mathY.toFixed(3);
            } else if (activeHandle === 'startLimit') {
                let ang = Math.atan2(mathY - starCenter.y, mathX - starCenter.x) * (180 / Math.PI);
                if (ang < 0) ang += 360;
                starStartDegree = Math.round(ang);
                starStartSlider.value = starStartDegree;
                starStartDisplay.textContent = starStartDegree;
            } else if (activeHandle === 'endLimit') {
                let ang = Math.atan2(mathY - starCenter.y, mathX - starCenter.x) * (180 / Math.PI);
                if (ang < 0) ang += 360;
                starEndDegree = Math.round(ang);
                starEndSlider.value = starEndDegree;
                starEndDisplay.textContent = starEndDegree;
            } else if (activeHandle === 'rotateScale') {
                let ang = Math.atan2(mathY - starCenter.y, mathX - starCenter.x) - Math.PI / 2;
                if (ang < 0) ang += Math.PI * 2;
                starRotationRad = ang;
                let deg = Math.round(ang * (180 / Math.PI));
                starRotationSlider.value = deg;
                starRotationDisplay.textContent = deg + '°';
                
                let r = Math.hypot(mathX - starCenter.x, mathY - starCenter.y);
                starOuterRadius = Math.min(1.0, Math.max(0.1, r));
                starOuterRadiusSlider.value = starOuterRadius.toFixed(2);
                starOuterRadiusDisplay.textContent = starOuterRadius.toFixed(2);
            } else if (activeHandle === 'innerScale') {
                let r = Math.hypot(mathX - starCenter.x, mathY - starCenter.y);
                starInnerRadius = Math.min(1.0, Math.max(0.1, r));
                starInnerRadiusSlider.value = starInnerRadius.toFixed(2);
                starInnerRadiusDisplay.textContent = starInnerRadius.toFixed(2);
            }
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

canvas.addEventListener('mouseup', () => { isDragging = false; lastMathX = null; lastMathY = null; activeHandle = null; });
canvas.addEventListener('mouseleave', () => { isDragging = false; lastMathX = null; lastMathY = null; activeHandle = null; });

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

commitLineBtn.addEventListener('click', () => {
    if (currentMode === 'line') {
        const cssWidth = canvas.clientWidth;
        const pSize = (pointSize / cssWidth) * 2;
        const maxGap = Math.max(pSize * 0.25, 2 / cssWidth);
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const lDistance = Math.hypot(dx, dy);
        const steps = Math.max(2, Math.ceil(lDistance / maxGap));

        for (let i = 0; i <= steps; i++) {
            const mathX = lineStart.x + dx * (i / steps);
            const mathY = lineStart.y + dy * (i / steps);
            if (mathX > 0 && mathY > 0) {
                processCoordinates(mathX, mathY);
            }
        }
        draw();
    }
});

commitPolygonBtn.addEventListener('click', () => {
    if (!polygonCenter) return;
    const startRad = polygonStartDegree * (Math.PI / 180);
    let endRad = polygonEndDegree * (Math.PI / 180);
    let diff = endRad - startRad;
    if (polygonTrigo === 1 && diff <= 0) diff += Math.PI * 2;
    if (polygonTrigo === -1 && diff >= 0) diff -= Math.PI * 2;
    
    const edges = [];
    for (let i = 0; i < polygonSides; i++) {
        const a1 = i * ((Math.PI * 2) / polygonSides) + (polygonRotation * Math.PI/180);
        const a2 = ((i+1) % polygonSides) * ((Math.PI * 2) / polygonSides) + (polygonRotation * Math.PI/180);
        edges.push({
            s: {x: polygonCenter.x + polygonRadius * Math.cos(a1), y: polygonCenter.y + polygonRadius * Math.sin(a1)},
            e: {x: polygonCenter.x + polygonRadius * Math.cos(a2), y: polygonCenter.y + polygonRadius * Math.sin(a2)}
        });
    }

    const maxGap = Math.max(pointSize * 0.25 / 100, 0.002);
    
    for (const edge of edges) {
        const dx = edge.e.x - edge.s.x;
        const dy = edge.e.y - edge.s.y;
        const lDistance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(2, Math.ceil(lDistance / maxGap));

        for (let i = 0; i <= steps; i++) {
            const mathX = edge.s.x + dx * (i / steps);
            const mathY = edge.s.y + dy * (i / steps);
            if (inSweep(polygonCenter.x, polygonCenter.y, mathX, mathY, startRad, diff)) {
                processCoordinates(mathX, mathY);
            }
        }
    }
    
    draw();
});

commitStarBtn.addEventListener('click', () => {
    if (!starCenter) return;
    const points = [];
    const starAngle = Math.PI / starPoints;
    for (let i = 0; i < 2 * starPoints; i++) {
        const r = (i % 2 === 0) ? starOuterRadius : starInnerRadius;
        const a = i * starAngle + Math.PI / 2 + starRotationRad;
        points.push({
            x: starCenter.x + r * Math.cos(a),
            y: starCenter.y + r * Math.sin(a)
        });
    }
    const maxGap = Math.max(pointSize * 0.25 / 100, 0.002);
    
    const startRad = starStartDegree * (Math.PI / 180);
    let endRad = starEndDegree * (Math.PI / 180);
    let diff = endRad - startRad;
    if (starTrigo === 1 && diff <= 0) diff += Math.PI * 2;
    if (starTrigo === -1 && diff >= 0) diff -= Math.PI * 2;

    for (let i = 0; i < points.length; i++) {
        const start = points[i];
        const end = points[(i + 1) % points.length];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lDistance = Math.hypot(dx, dy);
        const steps = Math.max(2, Math.ceil(lDistance / maxGap));

        for (let j = 0; j <= steps; j++) {
            const mathX = start.x + dx * (j / steps);
            const mathY = start.y + dy * (j / steps);
            if (inSweep(starCenter.x, starCenter.y, mathX, mathY, startRad, diff)) {
                processCoordinates(mathX, mathY);
            }
        }
    }
    draw();
});

// Setup
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Trigger initial layout size
