//@ts-nocheck
import { base } from "$app/paths";
import { feature } from "topojson-client";
/* import data from '$lib/../data/all_sp_data.json'; */
/* export const species = $state([]);
export const filter = $state({ valley: '', year: '', tax_id: '' }); */
let basemap_id = $state("Topo");
export let mapStore = $state({
  mapStored: null,
});

// Create derived states in the module scope
let _isMapReady = $derived(mapStore.mapStored !== null);
let _mapStored = $derived(mapStore.mapStored);

// Export getter functions that access the derived states
export function isMapReady() {
  return _isMapReady;
}

export function getMap() {
  return _mapStored;
}
// Svelte 5 reactive state for overlay loading
export let overlayLoadingState = $state({
  isLoading: false,

  loadedOverlays: {},
  error: null,
});

/*         if (_mapStored) {
            alert('map is ready from mapLayers');
        } */
export async function fetchOverlaysFunction2(id) {
  console.log("Fetching overlay:", id);

  let map = getMap();
  console.log("map", map);
  // Set loading state
  overlayLoadingState.isLoading = true;
  overlayLoadingState.error = null;

  try {
    const response = await fetch("/data/" + id + ".json");
    if (!response.ok) {
      throw new Error(`Failed to fetch ${id}: ${response.statusText}`);
    }

    const topoData = await response.json();

    // Convert a named object (e.g., 'regions') to GeoJSON
    const geoJsonData = feature(topoData, id);
    console.log("Converted GeoJSON for", id, geoJsonData);

    // Update the loaded overlays state
    overlayLoadingState.loadedOverlays[id] = {
      data: geoJsonData,

      loadedAt: new Date(),
    };

    console.log("Successfully loaded overlayfsdsfd:", id);
    console.log(map.getStyle().sources);
    console.log(map.getStyle().layers);

    return geoJsonData;
  } catch (error) {
    console.error("Error fetching overlay:", error);
    overlayLoadingState.error = error.message;
    throw error;
  } finally {
    overlayLoadingState.isLoading = false;
  }
}

const BASEMAP_LAYERS = [
  {
    category: "basemap",
    id: "Landscape",
    style:
      "https://api.maptiler.com/maps/landscape/style.json?key=PfeqCqeOXLcGceolGsUb",
  },
  {
    category: "basemap",
    id: "Backdrop",
    style:
      "https://api.maptiler.com/maps/backdrop/style.json?key=PfeqCqeOXLcGceolGsUb",
  },
  {
    category: "basemap",
    id: "Topo",
    style:
      "https://api.maptiler.com/maps/topo-v2/style.json?key=PfeqCqeOXLcGceolGsUb",
  },
  {
    category: "basemap",
    id: "Satellite",
    style:
      "https://api.maptiler.com/maps/satellite/style.json?key=PfeqCqeOXLcGceolGsUb",
  },
  {
    category: "basemap",
    id: "Satellite Hybrid",
    style:
      "https://api.maptiler.com/maps/satellite-hybrid/style.json?key=PfeqCqeOXLcGceolGsUb",
  },
  {
    category: "basemap",
    id: "Satellite Streets",
    style:
      "https://api.maptiler.com/maps/satellite-streets/style.json?key=PfeqCqeOXLcGceolGsUb",
  },
  {
    category: "basemap",
    id: "Streets",
    style:
      "https://api.maptiler.com/maps/streets/style.json?key=PfeqCqeOXLcGceolGsUb",
  },
  {
    category: "basemap",
    id: "Streets Hybrid",
    style:
      "https://api.maptiler.com/maps/streets-hybrid/style.json?key=PfeqCqeOXLcGceolGsUb",
  },
  {
    category: "basemap",
    id: "Streets Hybrid",
    style:
      "https://api.maptiler.com/maps/streets-hybrid/style.json?key=PfeqCqeOXLcGceolGsUb",
  },
  {
    category: "basemap",
    id: "Voyager",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
  {
    category: "basemap",
    id: "Positron",
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  {
    category: "basemap",
    id: "Dark Matter",
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  {
    category: "basemap",
    id: "Demo Tiles",
    style: "https://demotiles.maplibre.org/style.json",
  },
];

let style = $derived(BASEMAP_LAYERS.find((d) => d.id === basemap_id)?.style);
export let layers_new = [
  {
    default: false, //if has to be added by default
    main: true, //this defines that this layer may have labels. We only have to wait this layer to be loaded to add the labels.
    id: "pngp_areas_survey",
    type: "line",

    source: `pngp_areas_survey_source`,
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "#009f78c1",
      "line-width": ["interpolate", ["linear"], ["zoom"], 9, 2, 11, 3, 15, 5],
    },
  },
  {
    default: false, //if has to be added by default

    id: "pngp_areas_survey_labels",

    source: `pngp_areas_survey_source`,
    type: "symbol",

    layout: {
      visibility: "none",
      "text-allow-overlap": false,
      "text-variable-anchor": ["center"],
      "text-transform": "uppercase",
      "text-field": "{area_surve}",
      "text-font": ["Open Sans Regular"],
      "text-offset": [5, 5],

      "text-size": ["interpolate", ["linear"], ["zoom"], 9, 9, 11, 12, 15, 15],
    },
    paint: {
      "text-color": "#289c16",
      "text-halo-color": "#f5f3ed",
      "text-halo-width": 5,
    },
  },
  {
    default: true, //if has to be added by default
    main: true, //this defines that this layer may have labels. We only have to wait this layer to be loaded to add the labels.
    id: "pngp_areas_valley",
    type: "line",
    source: `pngp_areas_valley_source`,
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "#ffb83d",
      "line-width": ["interpolate", ["linear"], ["zoom"], 9, 4, 11, 5, 15, 7],
    },
  },
  {
    default: true, //if has to be added by default
    id: "pngp_areas_valley_labels",
    type: "symbol",
    source: `pngp_areas_valley_source`,
    layout: {
      visibility: "none",
      "text-allow-overlap": false,
      "text-variable-anchor": ["center"],
      "text-transform": "uppercase",
      "text-field": "{valley_name}",
      "text-font": ["Open Sans Regular"],
      "text-offset": [5, 5],

      "text-size": ["interpolate", ["linear"], ["zoom"], 9, 12, 11, 15, 15, 20],
    },
    paint: {
      "text-color": "#ffb83d",
      "text-halo-color": "#211f18",
      "text-halo-width": 5.5,
    },
  },
];

let layers = [
  {
    category: "overlays",
    id: "pngp_grid_140m_topo",
    type: "fill",
    source: "pngp_grid_140m_topo_source",
    "source-layer": "pngp_grid_140m",
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-color": "#0080ff",
      "fill-opacity": 0.1,
    },
  },
  {
    category: "overlays",
    id: "pngp_grid_1km_topo",
    type: "fill",
    source: "pngp_grid_1km_topo_source",

    layout: {
      visibility: "none",
    },
    paint: {
      "fill-color": "#0080ff",
      "fill-opacity": 0.5,
    },
  },
  /*   {
          id:'pngp_grid_140m_topo_outline',
          category:'outline',
          type:'line',
          source:'pngp_grid_140m_topo_source',

          layout:{
              'visibility':'none'
          },
          paint:{
              'line-color':'#fde68a',
              'line-width':.3
          }

      }, */

  {
    category: "overlays",
    id: "pngp_obs_simple",
    type: "circle",
    source: "pngp_obs_simple_source",
    "source-layer": "pngp_obs_simple",
    layout: {
      visibility: "none",
    },
    paint: {
      "circle-color": "#7dd4e3",

      //create stops by zoom
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        //being 9 full extent
        9,
        2,
        11,
        4,
        15,
        6,
      ],
      "circle-stroke-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        //being 9 full extent
        9,
        0.4,
        11,
        1,
        15,
        1.5,
      ],
      "circle-stroke-color": "#757373",
    },
  },
];
let sources = [
  {
    category: "overlays",
    id: "pngp_grid_140m_source",
    type: "vector",
    tiles: [
      "https://pere.gis-ninja.eu/geoserver/gwc/service/wmts?layer=pngp:pngp_grid_140m&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}",
    ],
  },
  {
    category: "overlays",
    id: "pngp_obs_simple_source",
    type: "vector",
    tiles: [
      "https://pere.gis-ninja.eu/geoserver/gwc/service/wmts?layer=pngp:pngp_obs_simple&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}",
    ],
  },
];
