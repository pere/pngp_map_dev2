---
description: PNGP Map Application Technology Stack and Version Analysis
globs: **/*
alwaysApply: true
---

# PNGP Tech Stack Guide

Complete analysis of the technology stack, dependencies, and best practices for the PNGP (Papua New Guinea Plant) Map application.

## Core Framework Stack

### 🎯 **SvelteKit 2.22.0** - Application Framework
- **Version:** `^2.22.0` (Latest stable)
- **Purpose:** Full-stack web application framework
- **Best Practices:**
  - ✅ Using latest stable v2.x (excellent choice)
  - ✅ Static adapter configured for deployment
  - ⚠️ Ensure regular updates for security patches
  - 📝 SvelteKit 2.x has excellent TypeScript support and performance

### 🎨 **Svelte 5.0.0** - Component Framework
- **Version:** `^5.0.0` (Latest major release)
- **Purpose:** Reactive component framework
- **Best Practices:**
  - ✅ Using cutting-edge Svelte 5 with runes system
  - ⚠️ Monitor for breaking changes as v5 is relatively new
  - 📝 Svelte 5 introduces significant performance improvements
  - 🔄 Migration from v4 may require syntax updates

### ⚡ **Vite 7.0.4** - Build Tool
- **Version:** `^7.0.4` (Latest major)
- **Purpose:** Fast build tool and development server
- **Best Practices:**
  - ✅ Latest version with excellent performance
  - ✅ Great HMR (Hot Module Replacement) support
  - 📝 Vite 7 has improved ESM handling and faster builds

## Styling & UI Framework

### 🎨 **TailwindCSS 4.0.0** - Utility-First CSS
- **Version:** `^4.0.0` (Latest major)
- **Purpose:** Utility-first CSS framework
- **Dependencies:**
  - `@tailwindcss/forms: ^0.5.9`
  - `@tailwindcss/typography: ^0.5.15`
  - `@tailwindcss/vite: ^4.0.0`
- **Best Practices:**
  - ✅ Using latest v4 with improved performance
  - ✅ Proper plugins for forms and typography
  - ⚠️ v4 is cutting-edge, monitor for stability
  - 📝 TailwindCSS 4 has zero-config approach and CSS-first design

### 🧩 **Component Libraries**
- **bits-ui: ^2.8.11** - Headless UI components
  - ✅ Excellent choice for accessible components
  - 📝 Works well with TailwindCSS styling
- **@lucide/svelte: ^0.515.0** - Icon library
  - ✅ Comprehensive, tree-shakeable icon set
  - 📝 Regular updates, good Svelte integration

## Data Visualization & Processing

### 📊 **D3.js 7.9.0** - Data Visualization
- **Version:** `^7.9.0` (Latest stable)
- **Purpose:** Data-driven document manipulation
- **Best Practices:**
  - ✅ Latest v7 with modern ES modules
  - ✅ Tree-shakeable imports reduce bundle size
  - 📝 Excellent for custom visualizations

### 📈 **LayerChart 2.0.0-next.27** - Chart Library
- **Version:** `^2.0.0-next.27` (Pre-release)
- **Purpose:** Svelte-native chart components
- **Best Practices:**
  - ⚠️ Using pre-release version (monitor stability)
  - 📝 Built specifically for Svelte with good performance
  - 🔄 Consider stability for production use

### 🔢 **Arquero 8.0.3** - Data Processing
- **Version:** `^8.0.3` (Latest stable)
- **Purpose:** Data transformation and analysis
- **Best Practices:**
  - ✅ Excellent for data manipulation and filtering
  - ✅ DataFrame-like operations for JavaScript
  - 📝 Perfect for species data processing

### 📐 **Simple Statistics 7.8.8**
- **Version:** `^7.8.8` (Latest stable)
- **Purpose:** Statistical calculations
- **Best Practices:**
  - ✅ Lightweight statistical functions
  - ✅ Good for data analysis in biological applications

## Mapping & Geographic Data

### 🗺️ **MapLibre GL Integration**
- **svelte-maplibre-gl: ^1.0.1** - Svelte wrapper
- **topojson-client: ^3.1.0** - Geographic data processing
- **Best Practices:**
  - ✅ MapLibre is open-source alternative to Mapbox
  - ✅ Good performance for interactive maps
  - 📝 TopoJSON for efficient geographic data handling

### 🎨 **Color Processing**
- **chroma-js: ^3.1.2** - Color manipulation
- **Best Practices:**
  - ✅ Excellent for data visualization color scales
  - 📝 Perfect for species data color coding

## Data Tables & UI Components

### 📋 **@vincjo/datatables 2.6.2**
- **Version:** `^2.6.2` (Latest stable)
- **Purpose:** Svelte-native data table components
- **Best Practices:**
  - ✅ Built specifically for Svelte
  - ✅ Good performance with large datasets
  - 📝 Excellent for species data tables

### 🎛️ **UI Enhancement Libraries**
- **mode-watcher: ^1.1.0** - Dark/light mode detection
- **svelte-sonner: ^1.0.5** - Toast notifications
- **svelte-loading-spinners: ^0.3.6** - Loading indicators
- **Best Practices:**
  - ✅ Lightweight, focused libraries
  - 📝 Good user experience enhancements

## Utility Libraries

### 🛠️ **Utility & Helper Libraries**
- **clsx: ^2.1.1** - Conditional CSS classes
- **tailwind-merge: ^3.3.1** - TailwindCSS class merging
- **tailwind-variants: ^1.0.0** - Component variants
- **tw-animate-css: ^1.3.5** - Animation utilities
- **Best Practices:**
  - ✅ Essential for TailwindCSS workflows
  - ✅ Good performance and tree-shaking

### 📅 **Date Handling**
- **@internationalized/date: ^3.8.2** - Internationalized dates
- **Best Practices:**
  - ✅ Modern approach to date internationalization
  - 📝 Important for scientific data with temporal components

## Development Tools

### 🔧 **Code Quality & Formatting**
- **prettier: ^3.4.2** - Code formatter
- **prettier-plugin-svelte: ^3.3.3** - Svelte formatting
- **prettier-plugin-tailwindcss: ^0.6.11** - TailwindCSS class sorting
- **svelte-check: ^4.0.0** - Type checking
- **Best Practices:**
  - ✅ Latest versions with good Svelte 5 support
  - ✅ Consistent code formatting across team
  - 📝 Essential for maintainable code

### 📦 **Build & Deployment**
- **@sveltejs/adapter-static: ^3.0.9** - Static site generation
- **@sveltejs/vite-plugin-svelte: ^6.0.0** - Svelte-Vite integration
- **Best Practices:**
  - ✅ Perfect for GitHub Pages deployment
  - ✅ Latest adapters with good performance

### 🎨 **Design System Enhancement**
- **gros: ^1.1.3** - CSS framework
- **phosphor-svelte: ^3.0.1** - Additional icons
- **Best Practices:**
  - 📝 Additional CSS utilities complement TailwindCSS
  - ✅ Diverse icon options for scientific applications

## TypeScript Integration

### 📝 **TypeScript Setup**
- **typescript: ^5.0.0** - TypeScript compiler
- **jsconfig.json** - JavaScript/TypeScript configuration
- **app.d.ts** - Type declarations
- **Best Practices:**
  - ✅ TypeScript 5.x with latest features
  - ✅ Proper configuration for SvelteKit
  - 📝 Excellent IntelliSense and type safety

## Version Analysis & Recommendations

### 🟢 **Excellent Choices**
- **SvelteKit 2.x** - Mature, stable, excellent performance
- **D3.js 7.x** - Industry standard for data visualization
- **Arquero 8.x** - Perfect for data processing needs
- **TailwindCSS 4.x** - Cutting-edge with great performance

### 🟡 **Monitor Closely**
- **Svelte 5.0** - Very new, monitor for breaking changes
- **LayerChart 2.0-next** - Pre-release version, consider stability
- **TailwindCSS 4.0** - New major version, watch for ecosystem compatibility

### 🔄 **Update Strategy**
1. **Security Updates:** Apply immediately for all dependencies
2. **Patch Updates:** Apply weekly for stable libraries
3. **Minor Updates:** Review monthly, test thoroughly
4. **Major Updates:** Plan quarterly, extensive testing required

### 📋 **Best Practices Summary**

#### Performance Optimization
- Use tree-shaking for D3.js imports
- Lazy load map components
- Optimize data processing with Arquero
- Use Svelte's compilation advantages

#### Code Quality
- Maintain TypeScript strict mode
- Use Prettier for consistent formatting
- Implement proper error boundaries
- Follow Svelte 5 runes patterns

#### Deployment & Production
- Static adapter for optimal performance
- Proper cache headers for GitHub Pages
- Minify and compress assets
- Monitor bundle size regularly

#### Scientific Data Handling
- Use Arquero for complex data transformations
- Implement proper error handling for data loading
- Cache processed data when possible
- Use TypeScript for data structure validation

This technology stack represents a modern, performant approach to building scientific data visualization applications with excellent developer experience and maintainability.
