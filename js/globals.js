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
