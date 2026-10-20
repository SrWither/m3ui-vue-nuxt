<template>
  <MNavigationSuite v-model="section" :items="sections">
    <template #fab>
      <MFab icon="add" label="New" :expanded="false" />
    </template>

    <MTopAppBar title="Hydration">
      <template #actions>
        <!-- Rendered from the stored theme, no ClientOnly -->
        <MIconButton id="theme" :icon="theme === 'dark' ? 'dark_mode' : 'light_mode'" label="Theme" @click="cycle" />
      </template>
    </MTopAppBar>
    <MChip v-for="p in palettes.slice(0, 4)" :key="p.id" type="filter" :selected="palette === p.id">
      {{ p.label }}
    </MChip>
    <MTextField v-model="text" label="Name" />
    <MSelect v-model="choice" label="Choice" :options="options" />
    <MSwitch v-model="on" label="Switch" />
    <MSlider v-model="value" />
    <MTabs v-model="tab" :tabs="tabs" />
    <MPagination :page="1" :per-page="10" :total="50" />

    <!-- Open on load: their teleported content has to hydrate too -->
    <MDialog v-model="dialog" title="Dialog">
      Open on load
    </MDialog>
    <MBottomSheet v-model="sheet" title="Sheet">
      Open on load
    </MBottomSheet>
    <MDatePickerModal v-model="date" :show="true" />
    <MLightbox v-model="lightbox" :items="[{ src: '/image.svg', alt: 'Image' }]" />
  </MNavigationSuite>
</template>

<script setup lang="ts">
const { theme, cycle } = useM3Theme()
const { palette, palettes } = useM3ColorPalette()
const section = ref('a')
const sections = [
  { value: 'a', label: 'A', icon: 'home' },
  { value: 'b', label: 'B', icon: 'search' },
]
const text = ref('')
const choice = ref<string | null>(null)
const options = [{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }]
const on = ref(true)
const value = ref(40)
const tab = ref('a')
const tabs = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]
const dialog = ref(true)
const sheet = ref(true)
const date = ref<string | null>('2026-10-19')
const lightbox = ref(true)
</script>
