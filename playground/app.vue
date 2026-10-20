<template>
  <MNavigationSuite v-model="section" :items="sections" class="h-dvh">
    <template #fab>
      <MFab icon="add" color="tertiary" label="New trip" :expanded="false" @click="dialog = true" />
    </template>

    <div class="flex h-full flex-col overflow-y-auto bg-surface text-on-surface">
      <MTopAppBar title="Wander" subtitle="Plan your next escape">
        <template #actions>
          <MIconButton :icon="themeIcons[theme]" label="Switch theme" @click="cycle" />
          <MAvatar name="Alex Rivera" :size="32" class="mx-2" />
        </template>
      </MTopAppBar>

      <main class="mx-auto w-full max-w-5xl px-4 pb-28 pt-2">
        <!-- M3's fade-through: the transition between a navigation bar's destinations -->
        <MTransition type="fade-through">
          <div :key="section" class="flex flex-col gap-8">
            <!-- Trips -->
            <template v-if="section === 'trips'">
              <section class="relative overflow-hidden rounded-[28px] bg-primary-container p-6 text-on-primary-container sm:p-8">
                <MIcon name="flight_takeoff" :size="160" class="pointer-events-none absolute -right-6 -top-6 opacity-10" />
                <p class="text-label-large opacity-80">
                  Next up · in 12 days
                </p>
                <h1 class="mt-1 text-display-small">
                  Kyoto, Japan
                </h1>
                <p class="mt-2 max-w-md text-body-large opacity-80">
                  Temples at dawn, tea in Uji and a night walk through Gion. Your packing list is almost done.
                </p>
                <div class="mt-6 flex max-w-sm items-center gap-3">
                  <MProgressBar :value="72" variant="wavy" class="flex-1" />
                  <span class="text-label-large">72%</span>
                </div>
                <div class="mt-6 flex flex-wrap gap-2">
                  <MButton icon="map">
                    View itinerary
                  </MButton>
                  <MButton variant="text" icon="checklist" class="text-on-primary-container">
                    Packing list
                  </MButton>
                </div>
              </section>

              <section>
                <h2 class="mb-3 text-title-large">
                  Where to next
                </h2>
                <MCarousel :items="destinations" :item-size="220" height="260px" label="Destinations">
                  <template #item="{ item }">
                    <div class="relative flex h-full w-full flex-col justify-end p-4" :style="{ background: item.gradient }">
                      <MIcon :name="item.icon" :size="40" class="absolute right-4 top-4 text-white/80" />
                      <p class="text-title-large text-white">
                        {{ item.name }}
                      </p>
                      <p class="text-body-medium text-white/80">
                        {{ item.country }}
                      </p>
                    </div>
                  </template>
                </MCarousel>
              </section>

              <section>
                <h2 class="mb-3 text-title-large">
                  Upcoming
                </h2>
                <div class="overflow-hidden rounded-3xl bg-surface-container-low">
                  <MList :lines="2">
                    <MListItem
                      v-for="trip in trips"
                      :key="trip.title"
                      :icon="trip.icon"
                      :icon-container-color="trip.color"
                      :title="trip.title"
                      :subtitle="trip.subtitle"
                      :trailing-text="trip.dates"
                    />
                  </MList>
                </div>
              </section>
            </template>

            <!-- Explore -->
            <template v-else-if="section === 'explore'">
              <section class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <MCard v-for="idea in ideas" :key="idea.title" variant="filled" clickable @click="toast.info(`${idea.title}: coming soon`)">
                  <div class="p-5">
                    <MIcon :name="idea.icon" :size="32" class="text-primary" />
                    <p class="mt-3 text-title-medium">
                      {{ idea.title }}
                    </p>
                    <p class="text-body-medium text-on-surface-variant">
                      {{ idea.places }} places
                    </p>
                  </div>
                </MCard>
              </section>
              <!-- Built-in text: follows the language picked in Settings -->
              <MPagination v-model:page="page" :per-page="6" :total="128" />
            </template>

            <!-- Settings -->
            <template v-else>
              <section class="flex flex-col gap-6">
                <div>
                  <h2 class="mb-3 text-title-large">
                    Appearance
                  </h2>
                  <MSegmentedButton v-model="theme" :options="themeOptions" />
                </div>

                <div>
                  <h3 class="mb-1 text-title-medium">
                    Language
                  </h3>
                  <p class="mb-4 text-body-medium text-on-surface-variant">
                    The components' own text follows @nuxtjs/i18n: try the pagination in Explore or the date picker in a new trip.
                  </p>
                  <MSegmentedButton v-model="language" :options="languages" />
                </div>

                <div>
                  <h3 class="mb-1 text-title-medium">
                    Color
                  </h3>
                  <p class="mb-4 text-body-medium text-on-surface-variant">
                    Saved on this device and applied before the page paints, even when it's rendered on the server.
                  </p>
                  <div class="flex flex-wrap gap-3">
                    <button
                      v-for="p in palettes"
                      :key="p.id"
                      type="button"
                      class="grid size-12 cursor-pointer place-items-center rounded-full ring-offset-2 ring-offset-surface transition-transform hover:scale-105"
                      :class="palette === p.id ? 'ring-2 ring-on-surface' : ''"
                      :style="{ background: p.seed }"
                      :title="p.label"
                      :aria-label="p.label"
                      :aria-pressed="palette === p.id"
                      @click="set(p.id)"
                    >
                      <MIcon v-if="palette === p.id" name="check" :size="20" class="text-white" />
                    </button>
                  </div>
                </div>

                <MCard variant="outlined">
                  <div class="flex flex-col gap-5 p-5">
                    <MSwitch v-model="alerts" label="Price drop alerts" />
                    <MSwitch v-model="offline" label="Download maps for offline use" />
                  </div>
                </MCard>
              </section>
            </template>
          </div>
        </MTransition>
      </main>

      <MDialog v-model="dialog" title="New trip" max-width="420px">
        <div class="flex flex-col gap-4 pt-2">
          <MTextField v-model="destination" label="Destination" leading-icon="location_on" />
          <MDatePicker v-model="date" label="Departure" />
          <MSelect v-model="travelers" label="Travelers" :options="travelerOptions" />
        </div>
        <template #actions>
          <MButton variant="text" @click="dialog = false">
            Cancel
          </MButton>
          <MButton :disabled="!destination" @click="save">
            Create
          </MButton>
        </template>
      </MDialog>
    </div>
  </MNavigationSuite>
</template>

<script setup lang="ts">
import type { Theme } from '@m3ui-vue/m3ui-vue'

const { theme, cycle } = useM3Theme()
const { palette, palettes, set } = useM3ColorPalette()
const toast = useM3Toast()

const section = ref('trips')
const sections = [
  { value: 'trips', label: 'Trips', icon: 'luggage' },
  { value: 'explore', label: 'Explore', icon: 'explore' },
  { value: 'settings', label: 'Settings', icon: 'settings' },
]

const themeIcons: Record<Theme, string> = { light: 'light_mode', dark: 'dark_mode', system: 'brightness_auto' }
const themeOptions = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'system', label: 'System', icon: 'brightness_auto' },
]

// Gradients from the palette's own roles, so they follow the color the user picks
const destinations = [
  { name: 'Lisbon', country: 'Portugal', icon: 'tram', gradient: 'linear-gradient(160deg, var(--color-primary), var(--color-tertiary))' },
  { name: 'Reykjavík', country: 'Iceland', icon: 'landscape', gradient: 'linear-gradient(160deg, var(--color-tertiary), var(--color-secondary))' },
  { name: 'Oaxaca', country: 'Mexico', icon: 'restaurant', gradient: 'linear-gradient(160deg, var(--color-secondary), var(--color-primary))' },
  { name: 'Hội An', country: 'Vietnam', icon: 'sailing', gradient: 'linear-gradient(160deg, var(--color-primary), var(--color-secondary))' },
  { name: 'Marrakesh', country: 'Morocco', icon: 'mosque', gradient: 'linear-gradient(160deg, var(--color-tertiary), var(--color-primary))' },
]

const trips = [
  { title: 'Kyoto', subtitle: 'Flight JL 407 · Hotel booked', dates: 'Nov 1', icon: 'temple_buddhist', color: 'primary' as const },
  { title: 'Lofoten Islands', subtitle: 'Cabin by the fjord', dates: 'Dec 12', icon: 'cabin', color: 'tertiary' as const },
  { title: 'Buenos Aires', subtitle: 'Weekend · 2 travelers', dates: 'Jan 20', icon: 'nightlife', color: 'secondary' as const },
]

const ideas = [
  { title: 'Beaches', icon: 'beach_access', places: 128 },
  { title: 'Mountains', icon: 'landscape', places: 94 },
  { title: 'Food trips', icon: 'ramen_dining', places: 61 },
  { title: 'Road trips', icon: 'directions_car', places: 47 },
  { title: 'City breaks', icon: 'location_city', places: 152 },
  { title: 'Wildlife', icon: 'pets', places: 33 },
]

const { locale, locales, setLocale } = useI18n()
const languages = computed(() => locales.value.map(l => ({ value: l.code, label: l.name ?? l.code })))
const language = computed({ get: () => locale.value, set: code => setLocale(code) })
const page = ref(1)

const alerts = ref(true)
const offline = ref(false)

const dialog = ref(false)
const destination = ref('')
const date = ref<string | null>(null)
const travelers = ref(2)
const travelerOptions = [1, 2, 3, 4].map(n => ({ label: n === 1 ? '1 traveler' : `${n} travelers`, value: n }))

function save() {
  dialog.value = false
  toast.success(`Trip to ${destination.value} created`)
  destination.value = ''
}
</script>
