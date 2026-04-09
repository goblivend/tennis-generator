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

