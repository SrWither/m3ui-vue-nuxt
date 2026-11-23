<script setup lang="ts">
import { ref } from 'vue'

// No network: a style with a background and an inline GeoJSON source (parsed by MapLibre's worker)
const style = {
  version: 8 as const,
  sources: {
    spot: { type: 'geojson' as const, data: { type: 'Feature' as const, properties: {}, geometry: { type: 'Point' as const, coordinates: [0, 0] } } },
  },
  layers: [
    { id: 'bg', type: 'background' as const, paint: { 'background-color': '#dde' } },
    { id: 'spot', type: 'circle' as const, source: 'spot', paint: { 'circle-radius': 10, 'circle-color': '#f00' } },
  ],
}
const ready = ref(false)
const tiles = ref(false)
function onReady(map: { on: (e: string, fn: () => void) => void, areTilesLoaded: () => boolean }) {
  ready.value = true
  map.on('idle', () => { tiles.value = map.areTilesLoaded() })
}
</script>

<template>
  <MMap id="map" :map-style="style" :center="[0, 0]" :zoom="2" :data-ready="ready" :data-tiles="tiles" style="height: 300px" @ready="onReady" />
</template>
