const swiftvg = require("../index");

const buttonShape = document.getElementById("generate-shape");
const buttonPath = document.getElementById("generate-path");

const inputEl = document.querySelector('[data-hook="input"]');
const outputEl = document.querySelector('[data-hook="output"]');

const updatePath = (evt) => {
	const data = inputEl.value;
	if (data) {
		outputEl.value = swiftvg(data, "path").join("\n\n");
	} else {
		outputEl.value = "";
	}
};

const updateShape = (evt) => {
	const data = inputEl.value;
	if (data) {
		outputEl.innerText = swiftvg(data, "shape").join("\n\n");
	} else {
		outputEl.value = "";
	}
};

buttonShape.addEventListener("click", updateShape);
buttonPath.addEventListener("click", updatePath);

inputEl.value = `<svg width="26" height="7" viewBox="0 0 26 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M26 3V0H0V3H6.45454C7.74219 3 8.95469 3.60625 9.72727 4.63636C11.3636 6.81818 14.6364 6.81818 16.2727 4.63636C17.0453 3.60625 18.2578 3 19.5455 3H26Z" fill="#D9D9D9"/>
</svg>`;

outputEl.value = `struct SVGShape0: Shape {
    func path(in rect: CGRect) -> Path {
        var shape = Path()
        shape.move(to: CGPoint(x: 26, y: 3))
        shape.addLine(to: CGPoint(x: 0, y: 0))
        shape.addLine(to: CGPoint(x: 0, y: 0))
        shape.addLine(to: CGPoint(x: 0, y: 3))
        shape.addLine(to: CGPoint(x: 6.45, y: 0))
        shape.addCurve(to: CGPoint(x: 9.73, y: 4.64), control1: CGPoint(x: 7.74, y: 3), control2: CGPoint(x: 8.95, y: 3.61))
        shape.addCurve(to: CGPoint(x: 16.27, y: 4.64), control1: CGPoint(x: 11.36, y: 6.82), control2: CGPoint(x: 14.64, y: 6.82))
        shape.addCurve(to: CGPoint(x: 19.55, y: 3), control1: CGPoint(x: 17.05, y: 3.61), control2: CGPoint(x: 18.26, y: 3))
        shape.addLine(to: CGPoint(x: 26, y: 0))
        shape.closeSubpath()
        return shape
    }
}`;
