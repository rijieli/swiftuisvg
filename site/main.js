const swiftvg = require("../index");

document.addEventListener('DOMContentLoaded', () => {
    const buttonShape = document.getElementById("generate-shape");
    const inputEl = document.querySelector('[data-hook="input"]');
    const outputEl = document.querySelector('[data-hook="output"]');

    const updateShape = (evt) => {
        const data = inputEl.value.trim();
        try {
            if (data) {
                const result = swiftvg(data, "shape");
                outputEl.textContent = result.join("\n\n");
            } else {
                outputEl.textContent = "Please enter SVG path data";
            }
        } catch (error) {
            outputEl.textContent = "Error: Invalid SVG path data";
            console.error(error);
        }
    };

    buttonShape.addEventListener("click", updateShape);
});

inputEl.value = `<svg width="26" height="7" viewBox="0 0 26 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M26 3V0H0V3H6.45454C7.74219 3 8.95469 3.60625 9.72727 4.63636C11.3636 6.81818 14.6364 6.81818 16.2727 4.63636C17.0453 3.60625 18.2578 3 19.5455 3H26Z" fill="#D9D9D9"/>
</svg>`;
