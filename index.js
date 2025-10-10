"use strict";

const always = require("ramda/src/always");
const append = require("ramda/src/append");
const converge = require("ramda/src/converge");
const curry = require("ramda/src/curry");
const drop = require("ramda/src/drop");
const equals = require("ramda/src/equals");
const head = require("ramda/src/head");
const identity = require("ramda/src/identity");
const isNil = require("ramda/src/isNil");
const merge = require("ramda/src/merge");
const nth = require("ramda/src/nth");
const pair = require("ramda/src/pair");
const pipe = require("ramda/src/pipe");
const prepend = require("ramda/src/prepend");
const prop = require("ramda/src/prop");
const when = require("ramda/src/when");
const parse = require("parse-svg-path");
const R = require("ramda"); // Import Ramda

// SET_ABSOLUTE :: String
const SET_ABSOLUTE = "SET_ABSOLUTE";

// SET_RELATIVE :: String
const SET_RELATIVE = "SET_RELATIVE";

// type alias State = { x: String, y: String }
// initialState :: State
const initialState = { x: 0, y: 0 };

// state :: State
let state = Object.assign({}, initialState);

// reducer :: State -> String -> Object -> State
const reducer = curry((a, b, c) => {
	switch (b) {
		case SET_RELATIVE:
			return Object.assign({}, a, {
				x: a.x + Number(c.x),
				y: a.y + Number(c.y),
			});
		case SET_ABSOLUTE:
			return Object.assign({}, a, {
				x: Number(when(isNil, always(a.x), c.x)),
				y: Number(when(isNil, always(a.y), c.y)),
			});
		default:
			return a;
	}
});

// dispatch :: String -> Object -> State
const dispatch = curry((a, b) => {
	state = reducer(state, a, b);

	return state;
});

// roundFloat :: Number | String -> Number
const roundFloat = (a) => {
	return Number(a * 100).toFixed() / 100;
};

// convertXY :: Array (Number | String) -> Object
const convertXY = (a) => {
	const x = Number(nth(0, a));
	const y = Number(nth(1, a));

	return { x, y };
};

// convertCCXY :: Array (Number | String) -> Object
const convertCCXY = (a) => {
	const x = Number(nth(4, a));
	const y = Number(nth(5, a));
	const cp1x = Number(nth(0, a));
	const cp1y = Number(nth(1, a));
	const cp2x = Number(nth(2, a));
	const cp2y = Number(nth(3, a));

	return { x, y, cp1x, cp1y, cp2x, cp2y };
};

// convertQCXY :: Array (Number | String) -> Object
const convertQCXY = (a) => {
	const x = Number(nth(2, a));
	const y = Number(nth(3, a));
	const cpx = Number(nth(0, a));
	const cpy = Number(nth(1, a));

	return { x, y, cpx, cpy };
};

// convertArcXY :: Array (Number | String) -> Object
const convertArcXY = (a) => {
	const x = Number(nth(5, a));
	const y = Number(nth(6, a));
	const rx = Number(nth(0, a));
	const ry = Number(nth(1, a));
	const cw = pipe(nth(4), equals(1))(a);

	return { x, y, rx, ry, cw };
};

// beginShape :: Number -> Number -> Number -> String
const beginShape = (n, width, height) => {
	return `struct SVGShape${n}: Shape {
    static let intrinsicSize = CGSize(width: ${width}, height: ${height})
    
    func path(in rect: CGRect) -> Path {
        var shape = Path()`;
};

const beginPath = (n) => {
	return `let shape${n} = UIBezierPath()`;
};

// endShape :: String
const endShape = `        shape.closeSubpath()
        return shape
    }\n}`;

// cgPoint :: Object -> String
const cgPoint = (a) => {
	return `CGPoint(x: ${roundFloat(a.x)}, y: ${roundFloat(a.y)})`;
};

// convertMove :: String -> String
const convertMove = (a) => {
	return `shape.move(to: ${a})`;
};

// convertLine :: String -> String
const convertLine = (a) => {
	return `shape.addLine(to: ${a})`;
};

// convertCubicCurve :: Object -> String
const convertCubicCurveU = (a) => {
	const anchorPoint = pipe(
		converge(pair, [prop("x"), prop("y")]),
		convertXY,
		cgPoint
	)(a);
	const controlPointOne = pipe(
		converge(pair, [prop("cp1x"), prop("cp1y")]),
		convertXY,
		cgPoint
	)(a);
	const controlPointTwo = pipe(
		converge(pair, [prop("cp2x"), prop("cp2y")]),
		convertXY,
		cgPoint
	)(a);

	return `shape.addCurve(to: ${anchorPoint}, controlPoint1: ${controlPointOne}, controlPoint2: ${controlPointTwo})`;
};

// convertCubicCurve :: Object -> String
const convertCubicCurve = (a) => {
	const anchorPoint = pipe(
		converge(pair, [prop("x"), prop("y")]),
		convertXY,
		cgPoint
	)(a);
	const controlPointOne = pipe(
		converge(pair, [prop("cp1x"), prop("cp1y")]),
		convertXY,
		cgPoint
	)(a);
	const controlPointTwo = pipe(
		converge(pair, [prop("cp2x"), prop("cp2y")]),
		convertXY,
		cgPoint
	)(a);

	return `shape.addCurve(to: ${anchorPoint}, control1: ${controlPointOne}, control2: ${controlPointTwo})`;
};

// convertQuadraticCurve :: Object -> String
const convertQuadraticCurve = (a) => {
	const anchorPoint = pipe(
		converge(pair, [prop("x"), prop("y")]),
		convertXY,
		cgPoint
	)(a);
	const controlPoint = pipe(
		converge(pair, [prop("cpx"), prop("cpy")]),
		convertXY,
		cgPoint
	)(a);

	return `shape.addCurve(to: ${anchorPoint}, controlPoint: ${controlPoint})`;
};

// convertArc :: Object -> String
const convertArc = (a) => {
	const anchor = pipe(
		converge(pair, [prop("x"), prop("y")]),
		convertXY,
		cgPoint
	)(a);
	const radius = pipe(
		converge(pair, [prop("rx"), prop("ry")]),
		convertXY,
		cgPoint
	)(a);
	const clockwise = prop("cw", a);
	const startAngle = 0;
	const endAngle = 360;

	return `shape.addArc(withCenter: ${anchor}, radius: ${radius}, startAngle: ${startAngle}, endAngle: ${endAngle}, clockwise: ${clockwise})`;
};

// processPathData :: Array (Array (Number | String)) -> String
const processPathData = (a) => {
	switch (head(a)) {
		case "v":
			return pipe(
				drop(1),
				prepend(0),
				convertXY,
				dispatch(SET_RELATIVE),
				cgPoint,
				convertLine
			)(a);
		case "V":
			return pipe(
				drop(1),
				prepend(null),
				convertXY,
				dispatch(SET_ABSOLUTE),
				cgPoint,
				convertLine
			)(a);
		case "h":
			return pipe(
				drop(1),
				append(0),
				convertXY,
				dispatch(SET_RELATIVE),
				cgPoint,
				convertLine
			)(a);
		case "H":
			return pipe(
				drop(1),
				append(null),
				convertXY,
				dispatch(SET_ABSOLUTE),
				cgPoint,
				convertLine
			)(a);
		case "M":
			return pipe(
				drop(1),
				convertXY,
				dispatch(SET_ABSOLUTE),
				cgPoint,
				convertMove
			)(a);
		case "l":
			return pipe(
				drop(1),
				convertXY,
				dispatch(SET_RELATIVE),
				cgPoint,
				convertLine
			)(a);
		case "L":
			return pipe(
				drop(1),
				convertXY,
				dispatch(SET_ABSOLUTE),
				cgPoint,
				convertLine
			)(a);
		case "c":
			return pipe(
				drop(1),
				convertCCXY,
				converge(merge, [identity, dispatch(SET_RELATIVE)]),
				convertCubicCurve
			)(a);
		case "C":
			return pipe(
				drop(1),
				convertCCXY,
				converge(merge, [identity, dispatch(SET_ABSOLUTE)]),
				convertCubicCurve
			)(a);
		case "q":
			return pipe(
				drop(1),
				convertQCXY,
				converge(merge, [identity, dispatch(SET_RELATIVE)]),
				convertQuadraticCurve
			)(a);
		case "Q":
			return pipe(
				drop(1),
				convertQCXY,
				converge(merge, [identity, dispatch(SET_ABSOLUTE)]),
				convertQuadraticCurve
			)(a);
		case "A":
			return pipe(
				drop(1),
				convertArcXY,
				converge(merge, [identity, dispatch(SET_ABSOLUTE)]),
				convertArc
			)(a);
		case "Z":
			return undefined;
		default:
			return `// SVG parsing for ${head(a)} data isn't supported yet`;
	}
};

// convertPoints :: Array (Array (Number | String)) -> Array String
const convertPoints = (a) => {
	return a.map(processPathData);
};

const getSVGElements = (svgText) => {
	// Split the input by SVG tags to handle multiple SVGs
	const svgRegex = /<svg[^>]*>[\s\S]*?<\/svg>/gi;
	const svgMatches = svgText.match(svgRegex) || [];
	
	// Parse each SVG block separately
	return svgMatches.map(svgBlock => {
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(svgBlock, "image/svg+xml");
		return svgDoc.querySelector('svg');
	}).filter(svg => svg !== null);
};

const getPathsByAttribute = (svgElement) => {
	const pathElements = svgElement.querySelectorAll(`path[d]`);
	return Array.from(pathElements);
};

const getSVGDimensions = (svgElement) => {
	// Try to get width and height from attributes
	let width = parseFloat(svgElement.getAttribute('width') || 0);
	let height = parseFloat(svgElement.getAttribute('height') || 0);
	
	// If width/height are not set, try to get from viewBox
	if (width === 0 || height === 0) {
		const viewBox = svgElement.getAttribute('viewBox');
		if (viewBox) {
			const viewBoxValues = viewBox.split(/\s+|,/);
			if (viewBoxValues.length >= 4) {
				width = parseFloat(viewBoxValues[2]) || width;
				height = parseFloat(viewBoxValues[3]) || height;
			}
		}
	}
	
	// Default to 100x100 if no dimensions found
	return {
		width: width || 100,
		height: height || 100
	};
};

const convertRectToPath = (rectElement) => {
	const x = parseFloat(rectElement.getAttribute('x') || 0);
	const y = parseFloat(rectElement.getAttribute('y') || 0);
	const width = parseFloat(rectElement.getAttribute('width') || 0);
	const height = parseFloat(rectElement.getAttribute('height') || 0);
	
	// Convert rect to path data
	const pathData = `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`;
	
	// Create a temporary path element with the converted data
	const pathElement = document.createElement('path');
	pathElement.setAttribute('d', pathData);
	return pathElement;
};

const convertCircleToPath = (circleElement) => {
	const cx = parseFloat(circleElement.getAttribute('cx') || 0);
	const cy = parseFloat(circleElement.getAttribute('cy') || 0);
	const r = parseFloat(circleElement.getAttribute('r') || 0);
	
	// Convert circle to path data using cubic bezier curves
	const pathData = `M${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy} Z`;
	
	// Create a temporary path element with the converted data
	const pathElement = document.createElement('path');
	pathElement.setAttribute('d', pathData);
	return pathElement;
};

const getAllShapeElements = (svgElement) => {
	const allShapes = [];
	
	// Get all path elements
	const pathElements = svgElement.querySelectorAll(`path[d]`);
	pathElements.forEach(path => allShapes.push(path));
	
	// Get all rect elements and convert them to paths
	const rectElements = svgElement.querySelectorAll(`rect`);
	rectElements.forEach(rect => allShapes.push(convertRectToPath(rect)));
	
	// Get all circle elements and convert them to paths
	const circleElements = svgElement.querySelectorAll(`circle`);
	circleElements.forEach(circle => allShapes.push(convertCircleToPath(circle)));
	
	return allShapes;
};

// swiftvg :: String -> Array String
module.exports = (pathData, mode) => {
	const svgElements = getSVGElements(pathData);
	let allResults = [];

	svgElements.forEach((svgElement, svgIndex) => {
		const allShapes = getAllShapeElements(svgElement);
		const dimensions = getSVGDimensions(svgElement);

		const processedResults = R.addIndex(R.map)((shapeNode, shapeIndex) => {
			const dAttribute = shapeNode.getAttribute("d");

			const pathDrawing = pipe(
				parse,
				convertPoints,
				R.reject(R.isNil)
			)(dAttribute).map((line) => "        " + line);

			// Use a combination of SVG index and shape index for unique shape names
			const uniqueShapeIndex = svgIndex * 100 + shapeIndex;
			return pipe(prepend(beginShape(uniqueShapeIndex, dimensions.width, dimensions.height)), append(endShape))(pathDrawing);
		}, allShapes);

		allResults = allResults.concat(processedResults.map((e) => e.join("\n")));
	});

	return allResults;
};

module.exports.SET_ABSOLUTE = SET_ABSOLUTE;
module.exports.SET_RELATIVE = SET_RELATIVE;
module.exports.initialState = initialState;
module.exports.reducer = reducer;
module.exports.dispatch = dispatch;
module.exports.roundFloat = roundFloat;
module.exports.cgPoint = cgPoint;
module.exports.beginShape = beginShape;
module.exports.endShape = endShape;
module.exports.convertXY = convertXY;
module.exports.convertCCXY = convertCCXY;
module.exports.convertQCXY = convertQCXY;
module.exports.convertArcXY = convertArcXY;
module.exports.convertMove = convertMove;
module.exports.convertLine = convertLine;
module.exports.convertCubicCurve = convertCubicCurve;
module.exports.convertQuadraticCurve = convertQuadraticCurve;
module.exports.convertArc = convertArc;
module.exports.processPathData = processPathData;
module.exports.convertPoints = convertPoints;
