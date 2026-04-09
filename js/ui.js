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
