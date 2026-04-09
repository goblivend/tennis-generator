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

