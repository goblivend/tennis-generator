# Tennis Template Generator Specification

## Overview
A minimalist web application providing a coordinate-mapped interactive canvas to help users conceptually and mathematically construct a tennis ball pattern.

## Mathematical Space
The canvas maps standard pixel coordinates into a mathematical cartesian plane:
- Center origin: `(0, 0)`
- X-axis bounds: `[-1, 1]`
- Y-axis bounds: `[-1, 1]`
- Aspect ratio: Fixed 1:1 (Responsive to window dimensions)

## Interaction Logic
1. User clicks or drags inside the canvas.
2. Continually interpolates mouse events (mousedown + mousemove).
3. If the coordinate falls inside quadrants II, III, or IV (i.e. $x \le 0$ or $y \le 0$), it is ignored.
4. If the coordinate is in quadrant I ($x > 0$ and $y > 0$), it is captured.
5. The coordinates, along with historical previous coordinates, are passed to `generatePoints(clickX, clickY, previousPoints)` located in `ball-generator.js`.
6. `generatePoints` is intended to be a user-implemented exercise (stubbed by default). The return value must be an array of points derived from the input.
7. A mathematical helper `findIntersectingPoint(angle, points)` is provided to cast a ray from `(0.5, 0)` and discover geometric point intersections based on the canvas scale.

## Rendering Pipeline
1. Clear the canvas area.
2. Draw the X and Y axes dividing the visible plane spanning `{x: -1..1, y: -1..1}`.
3. Iterate over the points returned by `generatePoints`.
4. Apply 4-way symmetry across the two primary axes. For each point `(x, y)`, the application renders dots at:
   - `(x, y)`
   - `(-x, y)`
   - `(x, -y)`
   - `(-x, -y)`
5. Point sizing is configurable via the UI slider, with points mathematically centered. Color selection acts as a future enhancement.

## Technical Architecture
- Framework: Raw HTML5/CSS3/Vanilla JS (No build step).
- Dependecies: Submodule `commons-website` for unified visual language.
- Files:
  - `app.js` handles DOM interaction, canvas context math mapping, resize loops, and the symmetry drawing pipeline.
  - `ball-generator.js` purely acts as an algorithmic state storage and user exercise module.
