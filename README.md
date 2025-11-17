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

1. Install Node.js dependencies:
   ```sh
   npm install
   ```

2. Install Ruby dependencies (Jekyll):
   ```sh
   bundle install
   ```

3. Build and serve the site locally:
   ```sh
   npm run jekyll
   ```

   This will build the JavaScript bundles and start a local Jekyll server. The site
   will be available at `http://localhost:4000` (or the port Jekyll assigns).

# Contributing

As the project is pretty small, you only need to run `npm install` to get up and
running. From there, [Prettier](https://prettier.io/) is used for code formatting.

This is a functional project, so please try to keep it that way—avoid side
effects, mutations, and imperative code when you can.

There are several build and test commands:

```
npm run build – build both browser and site bundles
npm run build:browser – build a UMD file for a browser to consume
npm run build:site – build the JS bundle for the public site
npm run test – run all tests with coverage
npm run test:coverage – get a coverage report
npm run test:unit – run only unit tests with no coverage
```

# [Code of Conduct](#CODE_OF_CONDUCT.md)

# [License](LICENSE.md)

---

Inspired by Mike Engel's [swiftvg](https://swiftvg.mike-engel.com).
