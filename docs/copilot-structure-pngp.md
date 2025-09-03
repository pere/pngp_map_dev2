---
description: PNGP Map Project Directory Structure and Important Files Guide
globs: **/*
alwaysApply: true
---

# PNGP Map Project Structure

This document outlines the complete directory structure and important files for the PNGP (Papua New Guinea Plant) Map project - a SvelteKit-based interactive mapping application for botanical species data visualization.

## Project Overview

**Technology Stack:**
- **Frontend Framework:** SvelteKit 2.x with Svelte 5
- **Styling:** TailwindCSS 4.x with custom UI components
- **Mapping:** MapLibre GL JS via svelte-maplibre-gl
- **Data Visualization:** LayerChart, D3.js, Arquero for data processing
- **Build Tool:** Vite 7.x
- **Deployment:** Static adapter for GitHub Pages

## Root Directory Structure

```
pngp_map_dev/
├── 📁 .git/                     # Git repository data
├── 📁 .svelte-kit/             # SvelteKit build cache (auto-generated)
├── 📁 .vscode/                 # VS Code workspace settings
├── 📁 node_modules/            # NPM dependencies (auto-generated)
├── 📄 package.json             # Project dependencies and scripts
├── 📄 package-lock.json        # Dependency lock file
├── 📄 README.md                # Project documentation
├── 📄 components.json          # UI component configuration
├── 📄 jsconfig.json            # JavaScript/TypeScript configuration
├── 📄 svelte.config.js         # SvelteKit configuration
├── 📄 vite.config.js           # Vite build configuration
├── 📁 docs/                    # Documentation and development guides
├── 📁 my_docs/                 # Personal documentation and notes
├── 📁 src/                     # Source code (main application)
└── 📁 static/                  # Static assets served directly
```

## Core Configuration Files

### 📄 `package.json`
- **Purpose:** Defines project metadata, dependencies, and npm scripts
- **Key Dependencies:** SvelteKit, TailwindCSS, MapLibre GL, D3.js, Arquero
- **Scripts:** `dev`, `build`, `preview`, `deploy` (GitHub Pages)

### 📄 `svelte.config.js`
- **Purpose:** SvelteKit configuration with static adapter for deployment
- **Adapter:** Static adapter for GitHub Pages deployment
- **Features:** Prerendering, path configuration

### 📄 `vite.config.js`
- **Purpose:** Build tool configuration for development and production

### 📄 `components.json`
- **Purpose:** UI component library configuration (shadcn/ui style components)

## Source Code Structure (`src/`)

```
src/
├── 📄 app.html                 # HTML template for the application
├── 📄 app.css                  # Global application styles
├── 📄 app copy.css             # Backup/alternative styles
├── 📄 app.d.ts                 # TypeScript declarations
├── 📁 data/                    # Data files and processing scripts
├── 📁 lib/                     # Reusable library code and components
├── 📁 routes/                  # SvelteKit route definitions
├── 📁 site/                    # Site-specific data
└── 📁 static/                  # Additional static assets
```

### Data Directory (`src/data/`)

**Core Data Files:**
- `all_sp_data.json` - Complete species dataset
- `pngp_areas_survey.json` & `pngp_areas_valley.json` - Geographic area data
- `pngp_grid_140m_topo.json` & `pngp_grid_1km_topo.json` - Topographic grid data
- `tax_data_joined.json` & `tax_data_joined_new.json` - Taxonomic classification data
- `sp_year_stats.json` & `sp_valley_stats.json` - Species statistics by year/valley
- `valley_names.json` & `years.json` - Reference data

**Data Processing Scripts (`src/data/scripts/`):**
- `fetch_species_data.js` - Data fetching utilities
- `join_tax_data.js` - Taxonomic data processing
- `new_stats.js` - Statistical calculations
- `sp_tax_counts_dbase.js` - Species count processing

### Library Structure (`src/lib/`)

```
lib/
├── 📄 index.js                 # Library exports
├── 📄 utils.js                 # Utility functions
├── 📁 components/              # Reusable Svelte components
├── 📁 hooks/                   # Custom hooks and reactive utilities
├── 📁 snippets/                # Svelte snippets
└── 📁 stores/                  # State management stores
```

### Component Architecture (`src/lib/components/`)

**Core Application Components:**
- `app-sidebar.svelte` - Main navigation sidebar
- `nav-user.svelte` - User navigation component
- `sidebar-data.js` - Sidebar configuration data

**Feature-Specific Component Groups:**

**📁 MapComponents/** - Interactive mapping functionality
- `MainMap.svelte` - Primary map component
- `SelectLayers.svelte` - Layer selection controls
- `pointsLegend.svelte` & `countsLegend.svelte` - Map legends
- `FiltersLegend.svelte` - Filter status display

**📁 TaxSearchComponents/** - Taxonomic search functionality
- `TaxSearchSpecies.svelte` - Species search interface
- `SpeciesCard.svelte` - Species information display
- `TestPopupTax.svelte` - Popup components for taxonomic data

**📁 TaxFilters/** - Data filtering components
- `YearValleyFilters.svelte` - Year and valley filtering
- `FiltersTableFilteredInfo.svelte` - Filter status information

**📁 Table/** - Data table components
- `Table.svelte` - Main data table component
- `Table_Header.svelte`, `Table_Footer.svelte` - Table sections
- `Table_Th.svelte` - Table headers
- `Table_Footer_Pagination.svelte` - Pagination controls
- `utils.ts` - Table utility functions

**📁 LaterallInfo/** - Side panel information display
- `LateralInfo.svelte` - Detailed information panel

**📁 customizedUI/** - Custom UI components
- `MyCollapsible.svelte` - Custom collapsible component

**📁 ui/** - Base UI component library (shadcn/ui style)
- Organized by component type: `button/`, `card/`, `table/`, `input/`, etc.
- Each component includes: main component file, index.js export, variants

### State Management (`src/lib/stores/`)

**Core Stores:**
- `store_pngp.js` - Main application state
- `taxDataStore.js` - Taxonomic data management
- `mapLayers.svelte.js` - Map layer state
- `new_sidebar_stores.js` - Sidebar state management
- `BasicRemoteDataStats.svelte.js` - Remote data statistics

**Specialized Stores:**
- `datatables/species.svelte.js` - Species datatable state
- `pngp_new_store.svelte.js` - Enhanced application state

### Routing (`src/routes/`)

```
routes/
├── 📄 +layout.svelte           # Root layout component
├── 📄 +layout.js               # Layout data loading
├── 📄 +page.svelte             # Home page component
└── 📁 main/                    # Main application route
    └── 📄 +page.svelte         # Main map interface
```

## Static Assets (`static/`)

```
static/
├── 📄 favicon.svg              # Site favicon
├── 📄 gros.min.css             # Additional CSS framework
└── 📁 data/                    # Static data files
    ├── species_data_500.json   # Sample species data
    ├── species_db_all.json     # Complete species database
    └── [other data files]      # Various data files mirroring src/data
```

## Documentation (`docs/`)

```
docs/
├── 📄 cursor-rules.md          # Cursor/Copilot rule guidelines
├── 📄 pngp-tech-stack.mdc     # Technology stack documentation
├── 📄 structure-pngp.mdc      # Project structure guides
├── 📄 svelte_rules.mdc         # Svelte development guidelines
├── 📁 mdc/                     # Markdown documentation
└── 📁 news_copilot/            # Copilot-specific rules and guides
```

## Personal Documentation (`my_docs/`)

```
my_docs/
├── 📄 cursor_pngp_prompts.txt  # Development prompts and notes
├── 📄 data_info.txt            # Data structure information
└── 📄 SQLs.txt                 # Database queries and SQL notes
```

## Key Development Guidelines

### File Naming Conventions
- **Svelte Components:** PascalCase (e.g., `MainMap.svelte`)
- **JavaScript/Data Files:** camelCase or snake_case
- **Static Assets:** lowercase with hyphens
- **Configuration Files:** lowercase with dots

### Component Organization
- **Feature-based grouping:** Components grouped by functionality
- **Reusable UI components:** Base UI library in `ui/` directory
- **Specialized components:** Organized by domain (Map, Tax, Table, etc.)

### Data Flow Architecture
- **Centralized stores:** Application state managed through Svelte stores
- **Component communication:** Props down, events up pattern
- **Data processing:** Arquero for data manipulation, D3 for visualization

### Build and Deployment
- **Development:** `npm run dev` - Vite development server
- **Production:** `npm run build` - Static site generation
- **Deployment:** `npm run deploy` - GitHub Pages deployment via git subtree

## Important Dependencies

### Core Framework
- `@sveltejs/kit` - SvelteKit framework
- `svelte` - Svelte component framework
- `vite` - Build tool and development server

### Styling and UI
- `tailwindcss` - Utility-first CSS framework
- `bits-ui` - Headless UI components
- `@lucide/svelte` - Icon library

### Data and Mapping
- `svelte-maplibre-gl` - MapLibre GL integration
- `arquero` - Data processing and transformation
- `d3` - Data visualization utilities
- `topojson-client` - Geographic data processing

### Development Tools
- `prettier` - Code formatting
- `svelte-check` - Type checking
- `@tailwindcss/vite` - TailwindCSS integration

This structure represents a modern, scalable SvelteKit application for scientific data visualization with a focus on Papua New Guinea botanical species mapping and analysis.
