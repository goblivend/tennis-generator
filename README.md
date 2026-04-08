# tennis-generator
A website to generate a tennis like ball template, exploring the maths hidden behind such a simple looking ball.

## Overview
This is a raw HTML/Canvas interactive web application featuring a -1 to 1 coordinate system. It is designed to help implement the underlying mathematics of a tennis ball.

## Features
- Interactive Cartesian canvas mapped to `[-1, 1]` on both axes.
- Responsive, auto-scaling 1:1 aspect ratio.
- Exercises centered around implementing mathematical logic in `ball-generator.js`.
- Automatic 4-way symmetry projection for generated points.

## Setup
1. Clone the repository.
2. Initialize submodules for shared styles: `git submodule update --init --recursive`
3. Open `index.html` in your favorite web browser.

## Exercise Goal
The core logic of generating points from clicks is deliberately left blank and isolated in `ball-generator.js`. Your goal is to write the math algorithm `generatePoints(clickX, clickY, previousPoints)` mapping quadrant I coordinates to a complete valid shape or curve.

For full specifications and coordinate math constraints, refer to [docs/spec.md](docs/spec.md).
