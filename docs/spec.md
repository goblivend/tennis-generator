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
The user can select between two input modes: Freehand and Arc Tool.

### Freehand Mode
1. User clicks or drags inside the canvas.
2. Continually interpolates mouse events (mousedown + mousemove).
3. If the coordinate falls inside quadrants II, III, or IV (i.e. $x \le 0$ or $y \le 0$), it is ignored.
4. If the coordinate is in quadrant I ($x > 0$ and $y > 0$), it is captured.
5. The coordinates, along with historical previous coordinates, are passed to `generatePoints(clickX, clickY, previousPoints)` located in `ball-generator.js`.

### Arc Tool Mode
1. User selects "Arc Tool" from the mode dropdown.
2. User clicks on the canvas to set a dummy center point for the arc (can be placed anywhere, even outside Quadrant I). Additionally, the user can manually set exact X and Y coordinates (between -1.0 and 1.0) using the provided numeric input fields.
3. A visual preview of the arc is displayed, featuring a green sweep with blue and purple markers for start and end angles.
4. User configures Arc Radius, Start Angle, End Angle, and Sweep Direction (Trigonometric CCW or Anti-Trig CW).
5. User clicks "Commit Arc Points" to iterate over the arc mathematically. Each valid Quadrant I point along the arc is individually passed to `generatePoints(clickX, clickY, previousPoints)`. The arc center persists after committing.

### Line Tool Mode
1. User selects "Line Tool" from the mode dropdown.
2. User clicks/drags on the canvas to set a Start and End handle, which can also be exactly dialed via numeric inputs.
3. A visual preview of the straight line between the two markers and its generating points is shown.
4. User clicks "Commit Line" to interpolate points from Start to End proportionally to the line distance and `pointSize`, passing each point to `generatePoints`.

### Square Tool Mode
1. User selects "Square Tool" from the mode dropdown.
2. User clicks/drags on the canvas to set the Center of the square.
3. User customizes Width and Height via slider inputs.
4. A visual outline of the axis-aligned rectangle and generating points is mapped based on parameters.
5. User clicks "Commit Square" to iterate mathematical interpolation across all four edges of the shape, emitting their dots to `generatePoints`.

### Star Tool Mode
1. User selects "Star Tool" from the mode dropdown.
2. User clicks/drags on the canvas to set the Center of the star.
3. User customizes the Number of Points, Outer Radius, and Inner Radius via slider inputs.
4. A visual outline of the star polygon is mathematically drawn spanning $360^{\circ}$.
5. User clicks "Commit Star" to iterate mathematical interpolation over every line segment connecting the inner and outer vertices, passing them to `generatePoints`.

6. `generatePoints` is intended to be a user-implemented exercise (stubbed by default). The return value must be an array of points derived from the input.
7. A mathematical helper `findIntersectingPoint(angle, points)` is provided to cast a ray from `(0.5, 0)` and discover geometric point intersections based on the canvas scale.

### Exporting
1. User clicks the "Save Image" button to save the entire content of the canvas as a PNG image, allowing for print and saving mechanisms.

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
