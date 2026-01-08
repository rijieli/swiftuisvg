const swiftvg = require("../index");

const buttonShape = document.getElementById("generate-shape");
const buttonPath = document.getElementById("generate-path");

const inputEl = document.querySelector('[data-hook="input"]');
const outputEl = document.querySelector('[data-hook="output"]');

// Extract exportname attribute from SVG content
const getExportNameFromSvg = (svgContent) => {
	// Try to find exportname attribute in the <svg> tag (handles XML declaration)
	const match = svgContent.match(/<svg[^>]*\sexportname=["']([^"']+)["']/i);
	if (match && match[1]) {
		return match[1].trim();
	}
	return null;
};

// Inject exportname attribute into SVG content based on filename
const injectExportName = (svgContent, filename) => {
	// Check if exportname already exists
	if (getExportNameFromSvg(svgContent)) {
		return svgContent; // Don't override existing exportname
	}
	
	// Convert filename to exportname (remove extension)
	const exportName = filename.replace(/\.(svg|SVG)$/, "");
	
	// Find the <svg> tag and inject exportname attribute
	// Handle both with and without XML declaration
	const svgTagMatch = svgContent.match(/<svg([^>]*)>/i);
	if (svgTagMatch) {
		const attributes = svgTagMatch[1];
		const newSvgTag = `<svg${attributes} exportname="${exportName}">`;
		return svgContent.replace(/<svg[^>]*>/i, newSvgTag);
	}
	
	return svgContent;
};

// Convert name to Swift class name (camelCase, strip dashes/underscores)
// Example: "my-icon" -> "MyIcon", "user_profile" -> "UserProfile"
const nameToSwiftClassName = (name) => {
	if (!name) return null;
	
	// Split by dashes, underscores, and spaces, then filter empty strings
	const parts = name.split(/[-_\s]+/).filter(part => part.length > 0);
	
	// Capitalize first letter of each part and join
	const className = parts
		.map(part => {
			if (part.length === 0) return "";
			return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
		})
		.join("");
	
	return className || null;
};

// Replace shape names in generated code
const replaceShapeNames = (code, className) => {
	// Replace SVGShape{number} with SVGShape{ClassName}
	return code.replace(/struct SVGShape\d+/g, `struct SVGShape${className}`);
};

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
		// Process each SVG separately
		const results = [];
		// Split by when we see a new <svg> tag
		const svgContents = data.split(/(?=<\s*svg\s+)/i).filter(svg => svg.trim().length > 0);
		
		svgContents.forEach((svgContent) => {
			// Extract exportname from SVG
			const exportName = getExportNameFromSvg(svgContent);
			const className = exportName ? nameToSwiftClassName(exportName) : null;
			
			const generatedCode = swiftvg(svgContent, "shape");
			
			if (className) {
				// Replace shape names with custom class name
				const replacedCode = generatedCode.map(code => replaceShapeNames(code, className));
				results.push(...replacedCode);
			} else {
				// Use default behavior if no exportname
				results.push(...generatedCode);
			}
		});
		
		outputEl.value = results.join("\n\n");
	} else {
		outputEl.value = "";
	}
};

buttonShape.addEventListener("click", updateShape);
// buttonPath.addEventListener("click", updatePath);

// Drag and drop functionality
const isSvgFile = (file) => {
	return file.type === "image/svg+xml" || 
	       file.name.toLowerCase().endsWith(".svg") ||
	       (file.type === "" && file.name.toLowerCase().endsWith(".svg"));
};

const readFileAsText = (file) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (event) => resolve(event.target.result);
		reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
		reader.readAsText(file);
	});
};

const handleFileDrop = async (e) => {
	e.preventDefault();
	e.stopPropagation();
	
	// Remove drag-over class
	inputEl.classList.remove("drag-over");
	
	const files = Array.from(e.dataTransfer.files);
	if (files.length === 0) return;
	
	// Filter to only SVG files
	const svgFiles = files.filter(isSvgFile);
	const nonSvgFiles = files.filter(file => !isSvgFile(file));
	
	if (svgFiles.length === 0) {
		alert(`No SVG files found. Please drop SVG files.\n\nSkipped ${nonSvgFiles.length} non-SVG file(s).`);
		return;
	}
	
	// Show feedback if some files were skipped
	if (nonSvgFiles.length > 0) {
		console.log(`Skipped ${nonSvgFiles.length} non-SVG file(s): ${nonSvgFiles.map(f => f.name).join(", ")}`);
	}
	
	try {
		// Read all SVG files and inject exportname from filename
		const readPromises = svgFiles.map(async (file) => {
			const content = await readFileAsText(file);
			// Inject exportname attribute based on filename if not already present
			return injectExportName(content, file.name);
		});
		const svgContents = await Promise.all(readPromises);
		
		// Combine all SVG contents with blank lines between them
		const combinedContent = svgContents.join("\n\n");
		inputEl.value = combinedContent;
		
		// Auto-generate shape after loading
		updateShape();
		
		// Show success message if multiple files
		if (svgFiles.length > 1) {
			console.log(`Successfully loaded ${svgFiles.length} SVG file(s)`);
		}
	} catch (error) {
		alert(`Error reading files: ${error.message}`);
	}
};

const handleDragOver = (e) => {
	e.preventDefault();
	e.stopPropagation();
	e.dataTransfer.dropEffect = "copy";
	inputEl.classList.add("drag-over");
};

const handleDragEnter = (e) => {
	e.preventDefault();
	e.stopPropagation();
	e.dataTransfer.dropEffect = "copy";
	inputEl.classList.add("drag-over");
};

const handleDragLeave = (e) => {
	e.preventDefault();
	e.stopPropagation();
	// Only remove class if we're leaving the input element itself
	if (!inputEl.contains(e.relatedTarget)) {
		inputEl.classList.remove("drag-over");
	}
};

// Prevent default drag behavior on the whole page to avoid browser opening files
// This must be done on dragenter and dragover to prevent navigation
const preventDefaults = (e) => {
	e.preventDefault();
	e.stopPropagation();
};

// Add drag and drop event listeners to input element
inputEl.addEventListener("dragenter", handleDragEnter);
inputEl.addEventListener("dragover", handleDragOver);
inputEl.addEventListener("dragleave", handleDragLeave);
inputEl.addEventListener("drop", handleFileDrop);

// Prevent default behavior on document level to stop browser from navigating to file
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
	document.addEventListener(eventName, preventDefaults, false);
});

inputEl.value = `<svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="10" y="10" width="80" height="40" fill="#007AFF" stroke="#000" stroke-width="2"/>
</svg>

<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="40" cy="40" r="30" fill="#FF3B30" stroke="#000" stroke-width="2"/>
</svg>`;
