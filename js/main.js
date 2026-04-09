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
