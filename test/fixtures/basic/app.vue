<template>
  <div>
    <MButton>Hola</MButton>
    <MPagination :page="1" :per-page="10" :total="50" />
    <MDialog :model-value="true" title="Abierto" />
    <MLightbox :model-value="true" :items="[{ src: 'a.jpg' }]" />
    <p id="theme">{{ theme }}</p>
    <p id="palette">{{ palette }}</p>
  </div>
</template>

<script setup lang="ts">
const { theme } = useM3Theme()
const { palette } = useM3ColorPalette()
</script>
