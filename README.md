# SwiftUI SVG

> Convert SVG markup to SwiftUI Shape structs

[![SwiftUISVG](https://img.shields.io/badge/SwiftUISVG-PRODUCTION_READY-blue?style=for-the-badge&logo=swift)](https://roger.zone/swiftuisvg/)

**SwiftUISVG** is a free online tool that converts SVG (Scalable Vector Graphics) markup into SwiftUI `Shape` structs for iOS and macOS development. Transform your vector graphics into native Swift code with support for paths, rectangles, circles, and multiple SVG elements. Perfect for iOS developers who want to use vector graphics without managing multiple image assets for different screen densities.

# Why?

As an iOS developer, you have to support at least three different pixel densities. Why waste your time managing a million image assets for different resolutions and states?

SwiftUISVG is a small tool written in JavaScript to help you convert your vector SVG images into SwiftUI `Shape` structs.

The tool supports multiple SVG elements in the input and will generate separate
Shape structs for each one. It also supports `<path>`, `<rect>`, and `<circle>`
elements.

# How to run locally

1. Install dependencies:
   ```sh
   npm install
   bundle install
   ```

2. Start development server with hot reload:
   ```sh
   npm run dev
   ```

   This will watch for file changes, automatically rebuild bundles, and start a local Jekyll server. The site will be available at `http://localhost:4000`.

3. Build for production:
   ```sh
   npm run publish
   ```

   Use this before pushing to GitHub to build and minify all bundles.

# [Code of Conduct](#CODE_OF_CONDUCT.md)

# [License](LICENSE.md)

---

Inspired by Mike Engel's [swiftvg](https://swiftvg.mike-engel.com).
