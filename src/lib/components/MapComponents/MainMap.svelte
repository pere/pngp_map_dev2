<script>
//@ts-nocheck

import { onMount, onDestroy, untrack, mount, unmount} from 'svelte';
import { get } from 'svelte/store';
import { feature } from "topojson-client";
 /* import { navigating } from '$app/stores'; */
import { Jumper } from 'svelte-loading-spinners';
import * as ss from 'simple-statistics';
import * as d3 from 'd3';
import CountsLegend from './countsLegend.svelte';
/* import FiltersLegend from './filtersLegend.svelte'; */
/* import { Popup } from 'maplibre-gl'; */
import chroma from 'chroma-js';
import PointsLegend from './pointsLegend.svelte';
import pkg from 'maplibre-gl';
import { getTaxData,findTaxById } from '$lib/stores/test.svelte.js';
import TestPopupTax from '$lib/components/TaxSearchComponents/TestPopupTax.svelte';
import {mapStore,fetchOverlaysFunction2, overlayLoadingState,layers_new, isMapReady, getMap} from '$lib/stores/mapLayers.svelte.js';
import { Separator } from '$lib/components/ui/separator/index.js';
import { runeStore } from '$lib/stores/svelte5_stores/RunesStore.svelte.js';
const {Popup,LngLat} = pkg;

import {
        MapLibre,
        NavigationControl,
        ScaleControl,
        GlobeControl,
        Marker
    } from 'svelte-maplibre-gl';
    import { remoteDataStore,filteredTaxInputStore,selGrid,paramsFilter } from '../../stores/new_sidebar_stores.js';
    // Use derived states from the store
    let mapNew = $derived(getMap()); // Reactive map from store
    let mapReady = $derived(isMapReady()); // Reactive boolean for map availability
    import { mapInitialized,navigating } from '../../stores/new_sidebar_stores.js';
    import { Label } from '$lib/components/ui/label/index.js';
  import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
  import { Switch } from '$lib/components/ui/switch/index.js';
let map;
  let geojson_140m;
  let geojson_1km;

// Svelte 5 reactive state for popup data
let popupQueryData = $state(null);
  let popupDataLoading = $state(false);
  let popupDataError = $state(null);

  let jetBreaksData = $state();


  let colorScale;

  let prevPointsIds=$state([]);
  let symbolColor=$state({legend:[],
    colorScale:[],
    ids:[]
  });
  let loadedPoints=false;
  let clickingPol=true;

  // Derived state for overlay loading status
  let isLoadingOverlays = $derived(overlayLoadingState.isLoading);
  let overlayError = $derived(overlayLoadingState.error);
  let loadedOverlayCount = $derived(Object.keys(overlayLoadingState.loadedOverlays).length);

$effect(() => {
 // if (!map || !$filteredTaxInputStore?.length) return;
 //filteredTaxInputStore ==> being used for the input search exclusively
 if (!map ) return;
 if ($paramsFilter.updateMapOnSelection && !$filteredTaxInputStore?.length) return;
 if (!$paramsFilter.updateMapOnSelection && !$paramsFilter.plottingCheckedItems)
 return;

  loadedPoints=false;
  // Use untrack to avoid re-running when ids haven't changed
  //const ids = untrack(() => $filteredTaxInputStore.map(d => d.id));
  let ids;
  if ($paramsFilter.updateMapOnSelection)
  ids = untrack(() => $filteredTaxInputStore.map(d => d.tax_id));
  else
  ids = untrack(() => $paramsFilter.manuallyFilteredItemsSpecies.map(d => d.tax_id));



  // Only update if ids have actually changed
  if (JSON.stringify(prevPointsIds) !== JSON.stringify(ids)) {

    console.log('ids for legend',ids)

    colorScale = ids.length
      ? chroma.scale(['#ff69e0', '#5aef47', '#b02c44', '#4b65ff']).mode('lch').colors(ids.length)
      : [];

   // if (map.getLayer('pngp_obs_simple') && map.setLayoutProperty('pngp_obs_simple', 'visibility', 'visible')) {
      let legend = [
        'match',
        ['get', 'tax_id'],
        //change accordinglly follwing this schema 'B', '#00ff00',
        ...colorScale.flatMap((color, index) => [ids[index], color])
        //...colorScale.map((color, index) => [ids[index], color].join(','))
        //...colorScale.map((color, index) => [ids[index], color])

        //'B', '#00ff00',
        //change accordinglly to the colorScale

      ];

      let inatLegend=[
        'match',
        ['get', 'pngp_tax_id'],
        ...colorScale.flatMap((color, index) => [ids[index], color])
      ];
      legend.push('#000000');
      inatLegend.push('#000000');

      let t={
        legend:legend,
        colorScale:colorScale,
        ids:ids,
        inatLegend:inatLegend

      };


      // Good (new reference)
symbolColor = { ...t};
      prevPointsIds = ids;
      loadedPoints=true;
  //  }
  }
});


    $effect(()=>{
    console.log('mapInitialized from effect: ' + $mapInitialized);
    console.warn('navigating ',$navigating)
});

// Effect to react when map becomes available
$effect(() => {
    console.log('Map state changed:', mapNew);

    if (mapNew) {
        console.log('🗺️ mapNew is now available!', map);

        // Do something when map becomes available
        handleMapReady();
    } else {
        console.log('❌ mapNew is null/undefined');
    }
});

// Svelte 5 effect to react to overlay loading completion
$effect(() => {
    console.log('Overlay loading state changed:', overlayLoadingState);

    // React when loading is complete and there's no error
    let overlays=Object.keys(overlayLoadingState.loadedOverlays);
    console.log('overlays in effect',overlays)
    if (!overlayLoadingState.isLoading && !overlayLoadingState.error) {


    if (overlays.length===layers_new.filter(d=>d.main).length)
    {

      console.warn('overlays',overlays)
    /*   console.log(map.getStyle().sources)
      console.warn(map.getStyle().layers) */

        /* const loadedOverlays = Object.keys(overlayLoadingState.loadedOverlays);
        debugger
        if (loadedOverlays.length > 1) {
         */


            // Do something when fetching is done
            handleOverlayLoadComplete();
        //}
    }
  }

    // React to loading errors
    if (overlayLoadingState.error) {
        console.error('Overlay loading failed:', overlayLoadingState.error);
        handleOverlayLoadError(overlayLoadingState.error);
    }
});

// Function to handle when overlay loading is complete
function handleOverlayLoadComplete() {
    console.log('🎉 All overlays loaded! Performing post-load actions...');


    // Add your custom logic here for when fetching is done:
    // - Add overlay layers to the map
    // - Update UI state
    // - Trigger other map operations
    // - Show success notifications

    // Example: Add loaded overlays to the map
    Object.entries(overlayLoadingState.loadedOverlays).forEach(([id, overlay]) => {
        console.log(`Processing loaded overlay: ${id}`, overlay.data);

        // Add the overlay as a source and layer to the map

        if (map && overlay.data) {
            try {
                // Add source if it doesn't exist
                if (!map.getSource(`${id}_source`)) {
                    map.addSource(`${id}_source`, {
                        type: 'geojson',
                        data: overlay.data
                    });
                }
                let l=layers_new.find(d=>d.id===id);

                console.info('l being',l);

                // Add layer if it doesn't exist
                if (l && l.default) {
                  console.log('layers_new',layers_new)

                  console.warn('add layer',l)
                  map.addLayer(l);
                  map.setLayoutProperty(l.id, 'visibility', 'visible');
                    console.log(`Added overlay ${id} to map`);

                  }

                  let lab=id+'_labels';
                  let labels=layers_new.find(d=>d.id===lab);


                  if (labels){

                    map.addLayer(labels);
                    if (labels.default)
                    map.setLayoutProperty(labels.id, 'visibility', 'visible');

                  }


            } catch (error) {
                //console.error(`Failed to add overlay ${id} to map:`, error);
            }
        }
        console.warn('layers after adding',map.getStyle().layers)
    });
}

// Function to handle overlay loading errors
function handleOverlayLoadError(error) {
    console.error('🚨 Overlay loading failed:', error);

    // Add your error handling logic here:
    // - Show error notifications
    // - Retry loading
    // - Fallback to default overlays
    // - Update UI to show error state
};

// Function to handle when map becomes ready
function handleMapReady() {
    console.log('🎉 Map is ready! Setting up map configurations...');

    // Add your custom logic here for when map becomes available:
    // - Set up event listeners
    // - Add initial layers
    // - Configure map settings
    // - Start loading overlays

    if (mapReady) {

        // Example: Set up map event listeners
        map.on('loadss', async () => {

            console.log('Map fully loaded');
            mapStore.mapStored=map;

            try {

                await fetchOverlaysFunction2('pngp_areas_survey');
                console.log('Overlay loaded successfully');
            } catch (error) {
                console.error('Failed to load overlay:', error);
            }

            try {
                await fetchOverlaysFunction2('pngp_areas_valley');

                console.log('Overlay loaded successfully');
            } catch (error) {
                console.error('Failed to load overlay:', error);
            }

        });


    }
}



    let layers=[
      {
    id:'pngp_grid_140m_topo',
    type:'fill',
    source:'pngp_grid_140m_topo_source',
    'source-layer':'pngp_grid_140m',
    layout:{
        'visibility':'none'
    },
    paint: {
        "fill-color": "#0080ff",
        "fill-opacity": 0.1
    }
},
    {
    id:'pngp_grid_1km_topo',
    type:'fill',
    source:'pngp_grid_1km_topo_source',

    layout:{
        'visibility':'none'
    },
    paint: {
        "fill-color": "#0080ff",
        "fill-opacity": 0.5
    }
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
            id:'pngp_obs_simple',
            type:'circle',
            source:'pngp_obs_simple_source',
            'source-layer':'pngp_obs_simple',
            layout:{
                'visibility':'none'
            },
            paint:{
                'circle-color':'#7dd4e3',

                //create stops by zoom
                'circle-radius':[
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    //being 9 full extent
                    9,2,
                    11,4,
                    15,6],
                'circle-stroke-width':[
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    //being 9 full extent
                    9,.4,
                    11,1,
                    15,1.5],
                'circle-stroke-color':'#757373'
                    }
    },
    {
            id:'pngp_inat',
            type:'circle',
            source:'pngp_inat_source',
            'source-layer':'pngp_inat',
            layout:{
                'visibility':'none'
            },
            paint:{
                'circle-color':'#10ebe3',

                //create stops by zoom
                'circle-radius':[
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    //being 9 full extent
                    9,5,
                    11,7,
                    15,11],
                'circle-stroke-width':[
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    //being 9 full extent
                    9,2,
                    11,2.5,
                    15,3.5],
                'circle-stroke-color':'#10a2eb',
                'circle-stroke-opacity':1,

                    }
    }




    ];
    let sources=[

        {
            id:'pngp_grid_140m_source',
            type:'vector',
            tiles:
                 ["https://pere.gis-ninja.eu/geoserver/gwc/service/wmts?layer=pngp:pngp_grid_140m&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]

        },
        {
            id:'pngp_obs_simple_source',
            type:'vector',
            tiles:
                 ["https://pere.gis-ninja.eu/geoserver/gwc/service/wmts?layer=pngp:pngp_obs_simple&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]
        },
        {
                id:'pngp_inat_source',
                type:'vector',
                tiles:
                     ["https://pere.gis-ninja.eu/geoserver/gwc/service/wmts?layer=pngp:pngp_inat&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]
            }
    ];
    function updateLayers(pol_ids, paramsFilterValue)
        {
          console.trace();
            if (!map)
            return;

            if (map.getLayer('pngp_inat'))
            map.setLayoutProperty('pngp_inat', 'visibility', 'none');
            if (map.getLayer('pngp_obs_simple'))
            map.setLayoutProperty('pngp_obs_simple', 'visibility', 'none');

            if ($selGrid=='pngp_grid_140m_topo')
            {
              console.log('pngp_grid_140m_topo');
              map.setLayoutProperty('pngp_grid_1km_topo', 'visibility', 'none');
              map.setLayoutProperty('pngp_grid_1km_topo_outline', 'visibility', 'none');

              map.moveLayer('pngp_grid_140m_topo','pngp_grid_140m_topo_outline');

              map.setLayoutProperty('pngp_grid_140m_topo', 'visibility', 'visible');
              map.setLayoutProperty('pngp_grid_140m_topo_outline', 'visibility', 'visible');
            }
            else
            {
              console.log('pngp_grid_1km_topo');
              map.setLayoutProperty('pngp_grid_140m_topo', 'visibility', 'none');
              map.setLayoutProperty('pngp_grid_140m_topo_outline', 'visibility', 'none');

              map.moveLayer('pngp_grid_1km_topo','pngp_grid_1km_topo_outline');
              map.setLayoutProperty('pngp_grid_1km_topo', 'visibility', 'visible');
              map.setLayoutProperty('pngp_grid_1km_topo_outline', 'visibility', 'visible');
            }

          //  navigating.set(true);
          //console.log('navigating on updateLayers',$navigating)
            if (map.getLayer('pngp_obs_simple')){
              //map.moveLayer('pngp_obs_simple');
              console.log('paramsFilter in updateLayers',paramsFilterValue);
              map.setLayoutProperty('pngp_obs_simple', 'visibility', 'none');

        console.log('pol_ids',pol_ids);

        console.warn('paramsFilter in updateLayers',$paramsFilter)
        let filteredLiteral;
                if (!$paramsFilter.updateMapOnSelection)
        {

          filteredLiteral=$paramsFilter.manuallyFilteredItemsSpecies.map((item)=>item.tax_id);
        }
        else
        {

          filteredLiteral=[...$filteredTaxInputStore.map((d)=>d.tax_id)]
        }
        console.log('filteredLiteral',filteredLiteral)
        /* [
            {pol_id: 1, count: 1}
         */
        //map.setFilter('pngp_obs_simple',['in', ['get', 'tax_id'], ['literal', pol_ids]]);

        let inatFilter=['in', ['get', 'pngp_tax_id'], ['literal', filteredLiteral]];

        if (!map.getLayer('pngp_inat'))
        map.addLayer(layers.find(d=>d.id=='pngp_inat'));

        map.setFilter('pngp_inat',inatFilter)
        /* map.moveLayer('pngp_inat'); */


       var baseFilter=['all', ['has', $selGrid=='pngp_grid_140m_topo'?'pol_140m_id':'pol_id'],

        ['in', ['get', $selGrid=='pngp_grid_140m_topo'?'pol_140m_id':'pol_id'],

       ['literal', [...pol_ids]]],
        ['in', ['get', 'tax_id'],


      ['literal',filteredLiteral]
        ]]
      let yearFilter=[];
        console.log('literal',[...pol_ids]);
                 if (paramsFilterValue.yArrSel.length>0 && paramsFilterValue.filtersActive)
         {
             console.log('paramsFilter.yArrSel',paramsFilterValue.yArrSel);
             yearFilter=['in',['get','year'],['literal',[...paramsFilterValue.yArrSel]]];
             baseFilter.push(yearFilter);
         }

         if (paramsFilterValue.vArrSel.length>0 && paramsFilterValue.filtersActive)
         {
             console.log('paramsFilter.vArrSel',paramsFilterValue.vArrSel);
             valleyFilter=['in',['get','valley'],['literal',[...paramsFilterValue.vArrSel]]];
             baseFilter.push(valleyFilter);


        }
        console.log('baseFilter',baseFilter);

        map.setFilter('pngp_obs_simple',baseFilter)
        map.moveLayer('pngp_obs_simple');


        //map.setLayoutProperty('pngp_inat', 'visibility', 'visible');





        /* map.setPaintProperty('pngp_obs_simple', 'circle-radius', [
        'case',

            ['in', ['get', 'tax_id'], ['literal', pol_ids]],

        2,
        0
        ]); */
            console.warn('layers after setting data',map.getStyle().layers)
                map.setLayoutProperty('pngp_obs_simple', 'visibility', 'visible');

            }
            //if (map.getLayer('grid')){

            console.log('selGridLayer in updateLayers',selGridLayer);
            console.log('selGrid in updateLayers',$selGrid);

            console.log('selGridLayer in updateLayers',selGridLayer);
            if (map.getLayer(selGridLayer.id)){

              map.setLayoutProperty(selGridLayer.id, 'visibility', 'none');
            //    map.setLayoutProperty(selGridLayer.id+'_outline', 'visibility', 'none');
                console.warn('getlayers',map.getStyle().layers);
                //selGridLayer
               // map.setPaintProperty('grid_outline', 'line-width', [
              /*  map.setPaintProperty(selGridLayer.id+'_outline', 'line-width', [
                    'case',
                    ['in', ['get', 'pol_id'], ['literal', pol_ids]],
                    1,
                    0
                ]); */

                map.setFilter(selGridLayer.id,['in', ['get', 'pol_id'], ['literal', pol_ids]]);
           //     map.setFilter(selGridLayer.id+'_outline',['in', ['get', 'pol_id'], ['literal', pol_ids]]);
              /*   map.setPaintProperty(selGridLayer.id, 'fill-opacity', [
                'case',
                ['in', ['get', 'pol_id'], ['literal', pol_ids]],
                .8,
                0.1
                ]); */

                map.setLayoutProperty(selGridLayer.id, 'visibility', 'visible');

             //   map.setLayoutProperty(selGridLayer.id+'_outline', 'visibility', 'visible');
            //    map.moveLayer(selGridLayer.id,selGridLayer.id+'_outline');
                console.log('layers after setting data22',map.getStyle().layers);



        }

      //  navigating.set(false);
}


let selGridLayer = $derived.by((d) => {
     console.log('selGrid in derived', $selGrid,layers);

     return layers.find((layer) => layer.id === $selGrid);
   });
let selGridLayerId = $derived.by((d) => {


     return layers.find((layer) => layer.id === $selGrid).id;
   });



   //$inspect($remoteDataStore).with(console.trace);



 $effect(()=>{
  if (!jetBreaksData ||  jetBreaksData.length==0)
  return;
else


  console.log('jetBreaksData',jetBreaksData);


  let selGridValue=get(selGrid);

  //create a color scale for the topo grid
 // let colorScale=d3.scaleSequential(d3.interpolate('red', 'blue')).domain([0, 2]);
 //create a color scale of 10 colors


let basePaint=[

      'step',
      ["get", "count"],
      jetBreaksData.colors[0]
    ]

    //jetBreaksData.breaks remove first item
    let breaks=jetBreaksData.breaks.slice(1);
    breaks.forEach((d,i)=>{
//console.log('jetBreaksData.colors[i]',jetBreaksData.colors[i],d);
      basePaint.push(d,jetBreaksData.colors[i]);
    })

    console.warn('basePaint in breaks',basePaint);
  if (selGridValue=='pngp_grid_140m_topo')
  {
    console.log('basePaint',basePaint);
    map.setPaintProperty('pngp_grid_140m_topo', 'fill-opacity', 0.8);
    map.setPaintProperty('pngp_grid_140m_topo', 'fill-color', basePaint);
    map.setLayoutProperty('pngp_grid_140m_topo', 'visibility', 'visible');
    map.moveLayer('pngp_grid_140m_topo');

  }
  else
  {
    map.setPaintProperty('pngp_grid_1km_topo', 'fill-opacity', 0.8);
    map.setPaintProperty('pngp_grid_1km_topo', 'fill-color', basePaint);
    map.setLayoutProperty('pngp_grid_1km_topo', 'visibility', 'visible');
    map.moveLayer('pngp_grid_1km_topo');
  }

 })




   $inspect(selGridLayer).with(console.trace);

   let breaksSymbol=$derived.by((d)=>{

    return {
        paint: {
    "fill-color": [
      "step",
      ["get", "value"],

    ],
    "fill-opacity": 0.8
  }
    }
   })



let lastProcessedDataLength = 0;

$effect(()=>{

  console.log('selGrid in mainMap effect',runeStore.selGrid);
    // Only track remoteDataStore changes, use get() for other stores to avoid double-triggering
    if (runeStore.hasRemoteData)
    {

      console.log('hasRemoteData',runeStore.hasRemoteData);

      console.log('remoteData in runesStore',runeStore.remoteData);
      console.log('selGrid in runesStore',runeStore.selGrid);
      console.log('paramsFilter in runesStore',runeStore.paramsFilter);


    }
    else
    {
      console.log('no remoteData or map');
    }
    // Only track remoteDataStore changes, use get() for other stores to avoid double-triggering
    if (runeStore.hasRemoteData)
    {

      console.log('hasRemoteData',runeStore.hasRemoteData);

      console.log('remoteData',runeStore.remoteData);
      console.log('selGrid',runeStore.selGrid);
      console.log('paramsFilter',runeStore.paramsFilter);


    }
    else
    {
      console.log('no remoteData or map');
    }
    const remoteData = $remoteDataStore; // Only reactive dependency
    console.log('🗺️ MAP EFFECT RUNNING - remoteDataStore has', remoteData.length, 'items');

    // Guard clause: only proceed if remoteDataStore has data and map is loaded
    if (!remoteData || remoteData.length === 0 || !map) {
        console.log('remoteDataStore is empty or map not ready, skipping effect');
        return;
    }

    // Skip if we've already processed this exact data
    if (remoteData.length === lastProcessedDataLength) {
        console.log('⏭️ SKIPPING - same data length as last processed');
        return;
    }

    lastProcessedDataLength = remoteData.length;

    // Use get() to avoid tracking these as reactive dependencies
    const selGridValue = get(selGrid);
    const paramsFilterValue = get(paramsFilter);
    console.log('selGridValue (non-reactive):', selGridValue);
    console.log('paramsFilter (non-reactive):', paramsFilterValue);

          let pol_ids=remoteData.map((d)=>d.pol_id);
      let counts=remoteData.map((d)=>d.count);


    console.log('🧪 CHECKING GRID CONDITION: selGridValue =', selGridValue);

    if (selGridValue=='pngp_grid_140m_topo')
    {
      console.log('🎯 ENTERING TOPO GRID PROCESSING');

      const source = map.getSource('pngp_grid_140m_topo_source');
      if (!source) {
        console.warn('❌ pngp_grid_140m_topo_source not found');
        return;
      }

      console.log('source from selGridValue',source);
      const oriData=geojson_140m;

      if (!oriData || !oriData.features) {
        console.warn('❌ geojson data not available');
        return;
      }

      console.log('oriData',oriData);
      let sortedData=remoteData.slice().sort((a,b)=>a.pol_id-b.pol_id); // Use slice() to avoid mutating original
      console.log('sortedData',sortedData,pol_ids);
      console.warn('filtered currentData',oriData.features.filter(d=>pol_ids.includes(d.properties.pol_id)))

      // Modify features: add 'test' from array
      let t=oriData.features.filter(d=>pol_ids.includes(d.properties.pol_id)).map((feature, i) => {
        return {
          ...feature,
          properties: {
            ...feature.properties,
            count: sortedData[i]?.count || 0
          }
        };
      });
      console.log('oriData new',t);

      // Update source data to trigger re-render
      source.setData({
          "type": "FeatureCollection",
          "features":t
        } );

     /* */

      console.log('✅ TOPO GRID PROCESSING COMPLETE');
    }
    else{
      console.log('sss',selGridValue);

      const source = map.getSource('pngp_grid_1km_topo_source');
      const oriData=geojson_1km;


      let sortedData=remoteData.slice().sort((a,b)=>a.pol_id-b.pol_id); // Use slice() to avoid mutating original
      console.log('sortedData',sortedData,pol_ids);
      console.warn('filtered currentData',oriData.features.filter(d=>pol_ids.includes(d.properties.pol_id)))



      if (!oriData || !oriData.features) {
        console.warn('❌ geojson data not available');
        return;
      }

      // Modify features: add 'test' from array
      let t=oriData.features.filter(d=>pol_ids.includes(d.properties.pol_id))
      .sort((a,b)=>a.properties.pol_id-b.properties.pol_id)
      .map((feature, i) => {
      //  console.log('info',i,feature.properties.pol_id,sortedData[i]?.pol_id,sortedData[i]?.count);


        return {
          ...feature,
          properties: {
            ...feature.properties,
            count: sortedData[i]?.count || 0
          }
        };
      });
      console.log('oriData new',t);

      // Update source data to trigger re-render
      source.setData({
          "type": "FeatureCollection",
          "features":t
        } );
    }




    updateLayers(pol_ids, paramsFilterValue);

})

    onMount(() => {
            // Wait for the Svelte component to be available
            // Only initialize if not already done
            console.warn('mapInitialized: ' + $mapInitialized);
         /*    if (map?.getLayers().length > 0)
            {
                console.log('map.getLayers().length > 0');
                $mapInitialized=true;
            } */
        if (map) {




console.log('map onmount',map);
           fetch("/data/pngp_grid_140m_topo.json")
  .then(res => res.json())
  .then(topoData => {
    // Convert a named object (e.g., 'regions') to GeoJSON
    geojson_140m  = feature(topoData, 'pngp_grid_140m');




  });

  fetch("/data/pngp_grid_1km_topo.json")
  .then(res => res.json())
  .then(topoData => {
    // Convert a named object (e.g., 'regions') to GeoJSON
    geojson_1km  = feature(topoData, 'pngp_grid_1km');
    console.log('geojson_1km',geojson_1km);




  });

  let mouseovered_grid;
  let polygonPopup=null;
  let popup=null;

map.on('data',function (e) {
  //if (e.isSourceLoaded) {
  if (e.dataType === "source") {
    if (e.sourceId === 'pngp_obs_simple_source' && e.isSourceLoaded) {

      if (!loadedPoints)
    {
      if (map.getLayer('pngp_obs_simple')) {

        if (symbolColor?.legend?.length>0)
        {
          console.log('symbolColor',symbolColor);
          map.setPaintProperty('pngp_obs_simple', 'circle-color', symbolColor.legend);
          map.setLayoutProperty('pngp_obs_simple', 'visibility', 'visible');
          loadedPoints=true;
        }
      }



      if (map.getLayer('pngp_inat')) {

        if (symbolColor?.legend?.length>0)
        {
          console.log('symbolColor',symbolColor);
          map.moveLayer('pngp_inat');
          map.setPaintProperty('pngp_inat', 'circle-color', symbolColor.inatLegend);
          map.setLayoutProperty('pngp_inat', 'visibility', 'visible');

        }

      }
    }
  }
  }

})


  map.on('mouseleave','pngp_grid_1km_topo',
    function(e){
   /*    if (polygonPopup)
    {

      polygonPopup.remove();
      polygonPopup=null;
    } */
  })
  let htmlContent;

function captureHTML(node) {
  htmlContent = node.innerHTML;
  return {
    update() {
      htmlContent = node.innerHTML;
    }
  };
}
  map.on('click','pngp_obs_simple',
  function(e){
    /* clickingPol=false; */
    console.log('clicked on pngp_obs_simple',e)
    let features = map.queryRenderedFeatures(e.point);
    console.log('features',features);
    if (features.length > 0) {
      let feature = features[0];
   /*    if (polygonPopup)
    {

       polygonPopup.remove();
      polygonPopup=null;
    } */
      console.log('feature',feature);
      let properties=feature.properties;
      console.log('properties',properties);
      let [...fields] = Object.keys(properties);
      let tax_id=properties.tax_id;
      let tax_data=findTaxById(tax_id);


      console.log('tax_data from popup',tax_data);
      console.log('fields',fields);
      let values=fields.map((field)=>properties[field]);
      console.log('values',values);
      let html='';


      html+=`<PopupTaxCard tax={tax_data} />`;


      /* the mount function is Svelte 5’s programmatic way of instantiating and attaching a component in JavaScript without needing to include it in another .svelte file.
What mount does in Svelte 5
Takes a compiled Svelte component (PopupTaxCard in your case)
Creates a new instance of it
Renders it into a given DOM element (target)
Applies initial props to it ({ tax: tax_data } here)
Returns the component instance so you can interact with it later (e.g., update props, destroy it) */
          // Create new popup container
    const container = document.createElement('div');

    // Create Svelte component instance using Svelte 5 mount function
    const component = mount(TestPopupTax, {
      target: container,
      props: { inat:false,tax: tax_data , properties:properties}
    });

    // Attach to MapLibre popup
    popup = new Popup({
      anchor:'top',
        closeButton: true,
        closeOnClick: true,
        offset: 5
      })
      .setLngLat(e.lngLat)
      .setDOMContent(container) // Uses DOM node, not HTML string
      .addTo(map);

      /* clickingPol=true; */

    // Clean up component when popup closes
    popup.on('close', () => {
      if (component) {
        unmount(component);
      }
    });
     /*  {
    "altitude": 2188.3,
    "data_qua_1": "Number of individuals is unknown",
    "data_quality": 7,
    "gid": 118906,
    "month": 4,
    "obs": 230288,
    "pol_140m_id": 9283,
    "pol_id": 753,
    "sign_code": "Avvistamento diretto",
    "tax_id": 2,
    "tax_level": "species",
    "timestamp": "2015/04/25 16:00:00.000",
    "valley": "Cogne",
    "valley_id": 1,
    "x_coord_32": 374184,
    "y_coord_32": 5046892,
    "year": 2015
} */


    }
    else
    {
      console.log('no features found')
    }
  })
map.on('click','pngp_inat',
  function(e){
    /* clickingPol=false; */
    console.log('clicked on pngp_inat',e)
    let features = map.queryRenderedFeatures(e.point);
    console.log('features',features);
    if (features.length > 0) {

   /*    if (polygonPopup)
    {

       polygonPopup.remove();
      polygonPopup=null;
    } */
      let feature = features[0];
      console.log('feature',feature);
      let properties=feature.properties;
      console.log('properties',properties);
      let tax_id=properties.pngp_tax_id;
      let tax_data=findTaxById(tax_id);
      console.log('tax_data from popup',tax_data);

      let [...fields] = Object.keys(properties);



      console.log('tax_data from popup',tax_data);
      console.log('fields',fields);
      let values=fields.map((field)=>properties[field]);
      console.log('values',values);


    const container = document.createElement('div');

    // Create Svelte component instance using Svelte 5 mount function
    const component = mount(TestPopupTax, {
      target: container,
      props: { inat:true,tax: tax_data , properties:properties}
    });

    // Attach to MapLibre popup
    popup = new Popup({
      anchor:'top',
        closeButton: true,
        closeOnClick: true,
        offset: 5
      })
      .setLngLat(e.lngLat)
      .setDOMContent(container) // Uses DOM node, not HTML string
      .addTo(map);

      clickingPol=true;

    // Clean up component when popup closes
    popup.on('close', () => {
      if (component) {
        unmount(component);
      }
    });
    /*   console.log('fields',fields);
      let values=fields.map((field)=>properties[field]);
      console.log('values',values);
      let html='';
      html+=`<PopupTaxCard tax={tax_data} />`; */
    }
  }
)

  async function getPolData(pol_id){
    console.log('getPolData',pol_id);

    // Set loading state
    popupDataLoading = true;
    popupDataError = null;

    try {
      let _paramsFilterValue=get(paramsFilter);
      console.log('paramsFilterValue in getPolData',_paramsFilterValue);
      let ids=_paramsFilterValue.allIds.join(',');
      let years=_paramsFilterValue.yArrSel.join(',');
      let valleys=_paramsFilterValue.vArrSel.join(',');

      let selGridValue=get(selGrid);

      const response = await fetch(`https://pere.gis-ninja.eu/pngp_phps_new/getPointsPolById.php?ids=${ids}&years=${years}&valleys=${valleys}&pol_id=${pol_id}&grid=${selGridValue}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result = await response.json();
      popupQueryData = result;

      console.log('✅ getPolData completed successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Error in getPolData:', error);
      popupDataError = error.message;
      throw error;
    } finally {
      popupDataLoading = false;
    }
  }

  // Svelte 5 effect to react when popup data is loaded
  $effect(() => {
    console.log('Popup data state changed:', {
      loading: popupDataLoading,
      error: popupDataError,
      data: popupQueryData
    });

    // Do something when data is successfully loaded
    if (!popupDataLoading && !popupDataError && popupQueryData) {
      handlePopupDataLoaded(popupQueryData);
    }

 /*    // Handle loading state
    if (popupDataLoading) {
      handlePopupDataLoading();
    }

    // Handle error state
    if (popupDataError) {
      handlePopupDataError(popupDataError);
    } */
  });

  // Function to handle when popup data is successfully loaded
  function handlePopupDataLoaded(data) {
    console.log('🎉 Popup data loaded successfully!', data);

    // Add your custom logic here for when the Promise is done:
    // - Update the popup content with the new data
    // - Show detailed information
    // - Create charts or visualizations
    // - Update other components

    // Example: Update popup content if it exists
    if (polygonPopup && polygonPopup.isOpen()) {
      const newContent = createPopupContentWithData(data);
      polygonPopup.setHTML(newContent);

    }
  }

  // Function to handle loading state
  function handlePopupDataLoading() {
    console.log('⏳ Loading popup data...');

    // Add loading indicator to popup if needed
    if (polygonPopup && polygonPopup.isOpen()) {
      const loadingContent = '<div>Loading detailed data...</div>';
      polygonPopup.setHTML(polygonPopup.getElement().innerHTML + loadingContent);
    }
  }

  // Function to handle error state
  function handlePopupDataError(error) {
    console.error('🚨 Error loading popup data:', error);

    // Show error in popup if needed
    if (polygonPopup && polygonPopup.isOpen()) {
      const errorContent = `<div style="color: red;">Error loading data: ${error}</div>`;
      polygonPopup.setHTML(polygonPopup.getElement().innerHTML + errorContent);
    }
  }

  // Helper function to create rich popup content with data
  function createPopupContentWithData(data) {
    if (!data || !Array.isArray(data)) {
      return '<div>No data available</div>';
    }

    const recordCount = data.length;
    let dataTax=data.map((d)=>{
      let tax=findTaxById(d.tax_id);
      let raw=$state.raw(tax)
      console.log('raw',raw);

      return {
        ...d,
        ...raw
      }
    }).sort((a,b)=>b.count-a.count);
    console.log('dataTax',dataTax);

    const species = [...new Set(dataTax.map(d => d.species_n || 'Unknown name'))];


    return `
      <aside class="bg-white p-2">
        <div><span class="text-lg text-amber-500">${dataTax.reduce((acc,d)=>acc+d.count,0)}</span> records</div>
        <div class="border-b border-gray-200 pb-1"><span class="text-lg">${species.length}</span> different species</div>

        <div style="max-height: 200px; overflow-y: auto; mt-2">


          ${dataTax.map(record => `
          <div style="flex flex-row gap-2 border-b border-gray-200 pb-1">


            <div class="text-xs">${record.species_n || 'Unknown'}  (${record.pngp_data?.name_it || 'Unknown'})</div>
           <div class="text-sm"> ${record.count} records</div>



           </div>
          `).join('')}

        </div>
      </aside>
    `;
  }

  //map.on('click','pngp_obs_simple',
  /* function(e){
    console.log('clicked on pngp_obs_simple',e)
    let features = map.queryRenderedFeatures(e.point);
    console.log('features',features);
    if (features.length > 0) { */
  map.on('click',
  // selGridLayerId,
    function(e){
      if (!clickingPol)
      return;
      //popup
      let features = map.queryRenderedFeatures(e.point);
      console.warn(selGridLayerId)
console.log(features)

let f=features.find(d=>d.layer.id==selGridLayerId)
        if (f) {

        /* if (f.properties.id==mouseovered_grid)
        return;




        mouseovered_grid=f.properties.id; */

        //popup
        map.getCanvas().style.cursor = 'pointer';
        //map.getCanvas().style.backgroundColor = 'red';
        //remove previous popups dont invent functions

        if (polygonPopup)
    {

      /* polygonPopup.remove();
      polygonPopup=null; */
    }
        //create a popup
        polygonPopup = new Popup({
          anchor:'bottom',
          closeButton: true,
          closeOnClick: true,
          className:'polygon-popup',
          offset: 25
        })
        .setLngLat(e.lngLat)
       // .setHTML('Polygon with <h3>' + f.properties.count + '</h3> records');
        polygonPopup.addTo(map);

        //execute getPolData with proper Promise handling
        setTimeout(async ()=>{
          try {
            console.log('Starting getPolData for pol_id:', f.properties.pol_id);
            await getPolData(f.properties.pol_id);
            // The $effect will automatically handle the result when popupQueryData changes
            console.log('getPolData completed, data will be processed by $effect');
          } catch (error) {
            console.error('Failed to get polygon data:', error);
          }
        }, 100);
        //do a php call
        //getPolData


      }else{
        //mouseovered_grid=null;
        map.getCanvas().style.cursor = 'default';
        //if (polygonPopup)
       // polygonPopup.remove();
      }

    }
  )

                // This is the MapLibre GL JS map instance
                console.log('Map component mounted:', map);

                console.log('MapLibre GL JS instance:', map);
                map.on('load', async () => {
                    console.log('Map loaded');

                    //this way we can access the map from the store !!??

                    mapStore.mapStored=map;
                 /*    try {
                        await fetchOverlaysFunction2('pngp_areas_survey');
                        console.log('Overlay loaded successfully');
                    } catch (error) {
                        console.error('Failed to load overlay:', error);
                    } */

                    console.log('Style:', map.getStyle());

                        map.addSource('pngp_grid_140m_topo_source',{

                          type:'geojson',
                          data:geojson_140m
                          })

                          map.addSource('pngp_grid_1km_topo_source',{
                            type:'geojson',
                            data:geojson_1km
                          })

                    sources.forEach((source,index) => {

                        map.addSource(source.id, source);
                    })
                    map.addLayer(layers.find(d=>d.id=='pngp_obs_simple'));

                    map.addLayer(layers.find(d=>d.id=='pngp_inat'));

                  //  map.addLayer(layers.find(d=>d.id=='pngp_areas_survey'));

                   /*  layers.forEach((layer,index) => {



                        map.addLayer(layer);

                     }); */

                  if (geojson_140m)
                  {
                    console.log('adding geojson');

                    sources.push({
                      id:'pngp_grid_140m_topo_source',
                      type:'geojson',
                      data:geojson_140m
                  })



                  map.addLayer({
                      id:'pngp_grid_140m_topo',
                      type:'fill',
                      source:'pngp_grid_140m_topo_source',

                      layout:{
                          'visibility':'none'
                      },
                      paint: {
                          "fill-color": "#0080ff",
                          "fill-opacity": 0.5
                      }
                  })

                  map.addLayer({
                      id:'pngp_grid_140m_topo_outline',
                      type:'line',
                      source:'pngp_grid_140m_topo_source',

                      layout:{
                          'visibility':'none'
                      },
                      paint: {
                          "line-color": "#adabaa",
                          "line-opacity": 1,
                          "line-width": 1
                      }
                  })

                  map.addLayer({
                      id:'pngp_grid_1km_topo',
                      type:'fill',
                      source:'pngp_grid_1km_topo_source',

                      layout:{
                          'visibility':'none'
                      },
                      paint: {
                          "fill-color": "#0080ff",
                          "fill-opacity": 0.5
                      }
                  })

                  map.addLayer({
                      id:'pngp_grid_1km_topo_outline',
                      type:'line',
                      source:'pngp_grid_1km_topo_source',

                      layout:{
                          'visibility':'none'
                      },
                      paint: {
                          "line-color": "#adabaa",
                          "line-opacity": 1,
                          "line-width": 1
                      }
                  })

                mapStore.mapStored=map;

                try {

                    await fetchOverlaysFunction2('pngp_areas_survey');
                    console.log('Overlay loaded successfully');
                } catch (error) {
                    console.error('Failed to load overlay:', error);
                }

                try {
                  await fetchOverlaysFunction2('pngp_areas_valley');

                  console.log('Overlay loaded successfully');

                } catch (error) {
                    console.error('Failed to load overlay:', error);
                }


}

                    //$mapInitialized=true;

                    // Add your custom map logic here
                });

                map.on('zoom', () => {
                    let zoom=map.getZoom();

                    if (map?.getZoom() > 5.2) {
                        let canvas = map.getCanvas();
                        let bbox = [
                            [0, 0], // top-left
                            [canvas.width, canvas.height] // bottom-right
                        ];
                        /* console.log('Bounding box:', bbox);
                        console.log(map.getZoom()); */

                        if (map.getZoom() > 5) {
                          //  console.log('Zoom level is greater than 5');
                            // Get bounding box of the viewport

                            // Query features currently rendered in viewport from visible layers

                        } else {
                       //     console.log('Zoom level is less than or equal to 5');
                            // Handle zoom level less than or equal to 5
                        }
                    }
                });
               // $mapInitialized=true;
            }
        });


        onDestroy(() => {
            console.log('map destroyediing??');
        if (map) {
            console.log('map destroyed');
           /*  cachedMapState = {
                zoom: map.getZoom(),
                center: map.getCenter().toArray()
            }; */
        }
    });

      // Base styles
  const STYLES = [
    {name:'Landscape', style:'https://api.maptiler.com/maps/landscape/style.json?key=PfeqCqeOXLcGceolGsUb'},
    {name:'Backdrop', style:'https://api.maptiler.com/maps/backdrop/style.json?key=PfeqCqeOXLcGceolGsUb'},
    {name:'Topo',style:'https://api.maptiler.com/maps/topo-v2/style.json?key=PfeqCqeOXLcGceolGsUb'},
    {name:'Satellite',style:'https://api.maptiler.com/maps/satellite/style.json?key=PfeqCqeOXLcGceolGsUb'},
    {name:'Satellite Hybrid',style:'https://api.maptiler.com/maps/satellite-hybrid/style.json?key=PfeqCqeOXLcGceolGsUb'},
    {name:'Satellite Streets',style:'https://api.maptiler.com/maps/satellite-streets/style.json?key=PfeqCqeOXLcGceolGsUb'},
    {name:'Streets',style:'https://api.maptiler.com/maps/streets/style.json?key=PfeqCqeOXLcGceolGsUb'},
    {name:'Streets Hybrid',style:'https://api.maptiler.com/maps/streets-hybrid/style.json?key=PfeqCqeOXLcGceolGsUb'},
    {name:'Streets Hybrid',style:'https://api.maptiler.com/maps/streets-hybrid/style.json?key=PfeqCqeOXLcGceolGsUb'},
    {name:'Voyager', style:'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'},
    {name:'Positron', style:'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'},
    {name:'Dark Matter', style:'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'},
    {name:'Demo Tiles', style:'https://demotiles.maplibre.org/style.json'}
  ];
  let name = $state('Topo');
  let style = $derived(STYLES.find(d=>d.name===name)?.style);
let handleMapLoad=(event)=>{
  console.log('Map loaded event:', event);
  mapStore.mapStored  = event.detail.map;
  console.log('Map stored in mapStore:', mapStore.mapStored);
}


let maxBounds=[
          new LngLat(7.017167307336564, 45.31421340780824),
          new LngLat(7.6981804608430195, 45.70323798220039)]
         /*  let maxBounds=[
  [7.017167307336564, 45.31421340780824],  // southwest
  [7.6981804608430195, 45.70323798220039]  // northeast
]; */
    </script>

<!-- {#if $navigating}
<h3>Map is loading...</h3>

{:else}
<div class="h-[90vh]">
    <h3>Map is not loading...</h3>
</div>
{/if} -->
<!-- Overlay Loading Indicator -->
<!-- {#if isLoadingOverlays}
<div class="absolute top-4 left-4 z-10 bg-blue-500 text-white px-3 py-2 rounded-md shadow-lg">
    <div class="flex items-center gap-2">
        <Jumper size="20" color="#ffffff" unit="px" duration="1s" />
        Loading overlays...
    </div>
</div>
{/if}

{#if overlayError}
<div class="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-2 rounded-md shadow-lg">
    ❌ Failed to load overlays: {overlayError}
</div>
{/if}

{#if loadedOverlayCount > 0 && !isLoadingOverlays}
<div class="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-2 rounded-md shadow-lg opacity-90">
    ✅ {loadedOverlayCount} overlay(s) loaded
</div>
  {/if} -->

<!-- Map Status Indicator -->
{#if mapReady}
<!-- <div class="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-2 rounded-md shadow-lg">
    ✅ Map Ready ({typeof map})
</div>
{:else}
<div class="absolute top-4 right-4 z-10 bg-orange-500 text-white px-3 py-2 rounded-md shadow-lg">
    ⏳ Waiting for map...
</div> -->
{/if}

<!-- Popup Data Loading Indicators -->
<!-- {#if popupDataLoading}
<div class="absolute top-4 left-4 z-10 bg-blue-500 text-white px-3 py-2 rounded-md shadow-lg">
    <div class="flex items-center gap-2">
        <Jumper size="16" color="#ffffff" unit="px" duration="1s" />
        Loading popup data...
    </div>
</div>
{/if}

{#if popupDataError}
<div class="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-2 rounded-md shadow-lg">
    ❌ Error: {popupDataError}
</div>
{/if}

{#if popupQueryData && !popupDataLoading}
<div class="absolute top-16 left-4 z-10 bg-green-500 text-white px-3 py-2 rounded-md shadow-lg opacity-90">
    ✅ Popup data loaded ({Array.isArray(popupQueryData) ? popupQueryData.length : 'N/A'} records)
</div>
{/if} -->

<CountsLegend />
{#if !$mapInitialized}


<!-- <div class="mb-3 flex items-center justify-between">
    <RadioGroup.Root bind:value={name} class="flex flex-row gap-x-3">
            {#each STYLES as {name,style} (name)}
        <div class="flex items-center space-x-1">
          <RadioGroup.Item value={name} id={name} />
          <Label class="cursor-pointer" for={name}>{name}</Label>
        </div>
      {/each}
    </RadioGroup.Root>


  </div> -->

<!--   let f ={
    "_sw": {
        "lng": 7.017167307336564,
        "lat": 45.31421340780824
    },
    "_ne": {
        "lng": 7.6981804608430195,
        "lat": 45.70323798220039
    }
} -->




    <MapLibre
        on:load={()=>{
          handleMapLoad();
        }}
        bind:map
        zoom={10}
        center={[7.37, 45.51]}
        class="map_container h-[100vh]"
        style={style}
          maxBounds= {maxBounds}
    >
        <!-- <Marker lnglat={[141.692222, 42.775]} /> -->
        <!-- <MapPopup {map} active={popupActive} /> -->
     	<NavigationControl />
        <ScaleControl />
        <!-- <GlobeControl /> -->
        <!-- <LatLngPos {map} /> -->
    </MapLibre>


    {:else}
    <h3>already initialized </h3>
    {/if}

<!-- Legend Component -->
<CountsLegend bind:jetBreaksExport={jetBreaksData} />
<PointsLegend {symbolColor} {map}/>

<style>
  :global(.polygon-popup .maplibregl-popup-content){
    /* background:transparent!important; */
    /* top:15px!important; */
    border:unset!important;
    box-shadow: none!important;
    font-family: Archivo!important;
  font-size: 14px;
  line-height: 1.5;
  color: var(--font-grey);
  }

</style>