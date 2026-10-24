<template>
  <div>
    <p id="theme">{{ theme }}</p>
    <p id="palette">{{ palette }}</p>
    <MNavigationSuite id="suite" model-value="a" :items="[{ value: 'a', label: 'A', icon: 'home' }]" />
  </div>
</template>

<script setup lang="ts">
const { theme } = useM3Theme()
const { palette } = useM3ColorPalette()
</script>
