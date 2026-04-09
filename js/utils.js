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

