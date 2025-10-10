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
		outputEl.value = swiftvg(data, "shape").join("\n\n");
	} else {
		outputEl.value = "";
	}
};

buttonShape.addEventListener("click", updateShape);
// buttonPath.addEventListener("click", updatePath);

inputEl.value = `<svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="10" y="10" width="80" height="40" fill="#007AFF" stroke="#000" stroke-width="2"/>
</svg>

<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="40" cy="40" r="30" fill="#FF3B30" stroke="#000" stroke-width="2"/>
</svg>`;
