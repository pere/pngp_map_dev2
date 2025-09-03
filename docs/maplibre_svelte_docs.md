# Svelte MapLibre GL (mierune.dev) LLM-Friendly Docs

This is a **Svelte wrapper** for MapLibre GL JS. Components are declarative and reactive.

## Basic Usage

```svelte
<script>
  import { Map, Marker, Popup, NavigationControl, Source, Layer } from 'svelte-maplibre-gl';

  let center = [139.767, 35.681];
  let zoom = 12;
</script>

<Map
  style="https://demotiles.maplibre.org/style.json"
  {center}
  {zoom}
  on:load={(e) => console.log('map loaded', e)}
/>
```

## Map Props

- `style` → style URL or JSON
- `center` → `[lng, lat]`
- `zoom` → number
- `pitch` → tilt angle
- `bearing` → rotation angle
- `hash` → sync view state with URL hash
- `interactive` → enable/disable interaction

## Events

```svelte
<Map
  on:load={(e) => console.log(e)}
  on:click={(e) => console.log(e.detail.lngLat)}
/>
```

Supported events:

- `load`
- `click`
- `move`
- `moveend`
- `zoom`

Event handlers receive `event.detail` with MapLibre event data.

## Controls

```svelte
<Map>
  <NavigationControl position="top-right" />
</Map>
```

Available controls:

- `NavigationControl`
- `FullscreenControl`
- `ScaleControl`

## Markers

```svelte
<Map {center} {zoom}>
  <Marker lngLat={[139.767, 35.681]}>
    <Popup>Tokyo Station</Popup>
  </Marker>
</Map>
```

- `lngLat` → marker position `[lng, lat]`
- Supports `<Popup>` as a child

## Popups

```svelte
<Map>
  <Popup lngLat={[139.76, 35.68]} closeButton={true}>
    <h3>Hello Popup</h3>
  </Popup>
</Map>
```

Props:

- `lngLat`
- `closeButton`
- `closeOnClick`

## GeoJSON Sources

```svelte
<Map>
  <Source id="my-data" type="geojson" data={geojson} />
</Map>
```

Props:

- `id` → unique source id
- `type` → `geojson` | `vector` | `raster`
- `data` → GeoJSON object or URL

## Layers

```svelte
<Map>
  <Source id="my-data" type="geojson" data={geojson} />
  <Layer
    id="fill-layer"
    type="fill"
    source="my-data"
    paint={{
      'fill-color': '#088',
      'fill-opacity': 0.8
    }}
  />
</Map>
```

Props:

- `id` → unique layer id
- `type` → `fill`, `line`, `circle`, etc.
- `source` → linked source id
- `paint` → style paint properties
- `layout` → layout properties

## Vector Tiles

```svelte
<Map>
  <Source id="vectiles" type="vector" url="https://tileserver-url" />
  <Layer
    id="roads"
    type="line"
    source="vectiles"
    source-layer="roads"
    paint={{
      'line-color': '#f00',
      'line-width': 2
    }}
  />
</Map>
```

## Raster Tiles

```svelte
<Map>
  <Source id="osm" type="raster" tiles={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]} tileSize={256} />
  <Layer id="osm-layer" type="raster" source="osm" />
</Map>
```

## Terrain DEM

```svelte
<Map>
  <Source id="terrain" type="raster-dem" url="https://terrain-tiles" />
</Map>
```

Then use JS API after `load`:

```js
map.setTerrain({ source: "terrain", exaggeration: 1.2 });
```

## Dynamic Updates

Reactive props update automatically:

```svelte
<script>
  let geojson = {...};
</script>

<Map>
  <Source id="live-data" type="geojson" {geojson} />
</Map>
```

When `geojson` changes, the map updates.

## Query Features

You can use the underlying map instance via `bind:this`:

```svelte
<Map bind:this={map}>
  ...
</Map>

<script>
  let map;
  function logFeatures(e) {
    const features = map.queryRenderedFeatures(e.point, { layers: ['layer-id'] });
    console.log(features);
  }
</script>
```

---

# Advanced Features

## Clustering

```svelte
<Map>
  <Source
    id="clustered"
    type="geojson"
    data={pointsGeoJSON}
    cluster={true}
    clusterRadius={50}
  />

  <Layer
    id="cluster-layer"
    type="circle"
    source="clustered"
    filter={["has", "point_count"]}
    paint={{
      'circle-color': '#51bbd6',
      'circle-radius': ["step", ["get", "point_count"], 20, 100, 30, 750, 40]
    }}
  />

  <Layer
    id="cluster-count"
    type="symbol"
    source="clustered"
    filter={["has", "point_count"]}
    layout={{
      'text-field': '{point_count_abbreviated}',
      'text-size': 12
    }}
  />
</Map>
```

## Expressions (Dynamic Styling)

```svelte
<Layer
  id="population"
  type="fill"
  source="geojson-pop"
  paint={{
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'population'],
      0, '#F2F12D',
      1000, '#EED322',
      5000, '#E6B71E',
      10000, '#DA9C20',
      50000, '#CA8323'
    ]
  }}
/>
```

## Style Switching

```svelte
<script>
  import { Map } from 'svelte-maplibre-gl';
  let currentStyle = 'https://demotiles.maplibre.org/style.json';
  function switchStyle() {
    currentStyle = currentStyle.includes('demo')
      ? 'https://api.maptiler.com/maps/streets/style.json'
      : 'https://demotiles.maplibre.org/style.json';
  }
</script>

<button on:click={switchStyle}>Switch Style</button>
<Map {currentStyle} center={[139.767, 35.681]} zoom={10} />
```

## Interactive Popups with Svelte Stores

```svelte
<script>
  import { writable } from 'svelte/store';
  export const popupInfo = writable(null);

  function handleClick(e) {
    popupInfo.set({
      lngLat: e.detail.lngLat,
      props: e.detail.features[0].properties
    });
  }
</script>

<Map on:click={handleClick}>
  <Source id="my-data" type="geojson" data={geojson} />
  <Layer id="my-layer" type="fill" source="my-data" />

  {#if $popupInfo}
    <Popup {lngLat} closeButton={true}>
      <h3>{$popupInfo.props.name}</h3>
      <p>Population: {$popupInfo.props.population}</p>
    </Popup>
  {/if}
</Map>
```

## Filtering Features Dynamically

```svelte
<script>
  let filter = ['==', ['get', 'category'], 'park'];
</script>

<Map>
  <Layer
    id="parks"
    type="fill"
    source="geojson"
    filter={filter}
    paint={{ 'fill-color': '#0f0' }}
  />
</Map>
```

## Animation with Data Updates

```svelte
<script>
  let t = 0;
  let geojson = generateData(t);
  const interval = setInterval(() => {
    t += 1;
    geojson = generateData(t);
  }, 1000);
</script>

<Map>
  <Source id="anim" type="geojson" {geojson} />
  <Layer id="anim-layer" type="circle" source="anim" paint={{ 'circle-radius': 5 }} />
</Map>
```

---

**Pro Tips:**

- Use `cluster`, `filter`, `paint` for advanced styling.
- Combine Svelte stores with MapLibre events for reactive UI.
- Style switching can be fully dynamic.
- Expressions allow data-driven styling.
- For heavy data, consider vector tiles instead of raw GeoJSON.

This doc now includes **clustering, expressions, style switching, interactive popups, filtering, and animations** for LLM-aware generation.

---

# Vector Tile Styling Best Practices

- **Minimize Layer Count** → Too many layers degrade performance; merge similar styles where possible.
- **Use Zoom-Level Based Styling** → Limit detailed styling only at higher zoom levels with expressions:

  ```js
  'line-width': [
    'interpolate',
    ['linear'],
    ['zoom'],
    5, 0.5,
    15, 4
  ]
  ```

- **Simplify Paint Properties** → Avoid unnecessary opacity/filters for large datasets.
- **Source-Layer Filtering** → Only load needed layers from vector tiles.
- **Lazy Load Heavy Layers** → Dynamically add layers when zoom threshold is reached.

# Performance Tips for Large Datasets

1. **Prefer Vector Tiles over Raw GeoJSON** → Improves load time dramatically.
2. **Cluster Points Client-Side** → Use the built-in `cluster` option for point-heavy layers.
3. **Use `filter` Efficiently** → Apply filters server-side if possible to reduce payload.
4. **Throttle Reactive Updates** → For live data, debounce updates to avoid excessive re-renders.
5. **Cache Tiles** → Use tile endpoints with proper caching headers for faster reloading.
6. **Reduce Geometry Complexity** → Pre-simplify polygons using tools like `mapshaper`.
7. **Limit Interactivity** → Disable `interactive: true` on layers that don’t need it.

---

# Optimizing Svelte Reactivity with MapLibre

## 1. Use Svelte Stores for Shared Map State

Instead of passing props deeply, use writable/derived stores to manage shared state:

```svelte
<script>
  import { writable } from 'svelte/store';
  export const mapCenter = writable([139.767, 35.681]);
  export const zoomLevel = writable(12);
</script>

<Map bind:center={$mapCenter} bind:zoom={$zoomLevel} />
```

This prevents unnecessary re-renders when only one reactive value changes.

## 2. Avoid Frequent Prop Changes

Reactive props like `data` or `paint` cause the component to update. For high-frequency updates, throttle or batch changes:

```js
import { debounce } from "lodash-es";

const updateData = debounce((newData) => {
  geojson = newData;
}, 200);
```

## 3. Bind Map Instance and Use Direct API Calls

For complex updates, bind the map instance and directly call MapLibre API instead of re-rendering layers:

```svelte
<Map bind:this={map} />

<script>
  let map;
  $: if (map) {
    // Only update style instead of re-rendering the Svelte component
    map.setPaintProperty('layer-id', 'fill-color', '#00f');
  }
</script>
```

## 4. Derived Stores for Computed Styling

If your paint properties depend on reactive data, use a derived store to compute style objects:

```js
import { derived } from "svelte/store";
export const fillPaint = derived(dataStore, ($dataStore) => ({
  "fill-color": $dataStore.color,
  "fill-opacity": $dataStore.opacity,
}));
```

Then pass `{ $fillPaint }` to your layer.

## 5. Lazy Load Heavy Layers

Use `on:moveend` or `on:zoom` events to load heavy layers only when the user reaches the required zoom:

```svelte
<Map on:moveend={(e) => {
  if (e.detail.map.getZoom() > 14) showHeavyLayer = true;
}}>
  {#if showHeavyLayer}
    <Layer id="heavy" source="vector" />
  {/if}
</Map>
```

## 6. Manual DOM Updates for High-Frequency Data

For real-time data (e.g., live GPS), consider using `map.getSource('id').setData()` manually instead of binding Svelte reactive props every tick.

---

This doc now includes:

- **Clustering, expressions, style switching, interactive popups, filtering, animations**
- **Vector tile styling best practices**
- **Performance tips for large datasets**
- **Optimizing Svelte reactivity with MapLibre for better performance**
