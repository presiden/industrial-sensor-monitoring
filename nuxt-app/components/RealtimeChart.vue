
<template>
  <div>
    <div v-if="loading" class="text-center py-8 text-slate-400">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    <div v-else-if="data && data.length > 0" class="space-y-4">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-slate-700/50 rounded p-4">
          <p class="text-slate-400 text-xs uppercase mb-2">Average</p>
          <p class="text-2xl font-bold text-white">{{ average.toFixed(2) }}</p>
        </div>
        <div class="bg-slate-700/50 rounded p-4">
          <p class="text-slate-400 text-xs uppercase mb-2">Min</p>
          <p class="text-2xl font-bold text-blue-400">{{ min.toFixed(2) }}</p>
        </div>
        <div class="bg-slate-700/50 rounded p-4">
          <p class="text-slate-400 text-xs uppercase mb-2">Max</p>
          <p class="text-2xl font-bold text-red-400">{{ max.toFixed(2) }}</p>
        </div>
        <div class="bg-slate-700/50 rounded p-4">
          <p class="text-slate-400 text-xs uppercase mb-2">Data Points</p>
          <p class="text-2xl font-bold text-white">{{ data.length }}</p>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-slate-300">
          <thead class="bg-slate-700">
            <tr>
              <th class="px-4 py-3 text-left">Time</th>
              <th class="px-4 py-3 text-right">Value</th>
              <th class="px-4 py-3 text-center">Quality</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, idx) in data.slice(0, 20)" :key="idx" class="border-t border-slate-700 hover:bg-slate-700/30">
              <td class="px-4 py-3">{{ formatTime(m.time) }}</td>
              <td class="px-4 py-3 text-right font-semibold text-white">{{ m.value.toFixed(2) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="m.quality >= 80 ? 'text-green-400' : 'text-yellow-400'" class="font-semibold">
                  {{ m.quality }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-center py-8 text-slate-400">
      <p>No measurement data available</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ sensorId: Number })

const { data, pending: loading, refresh } = await useFetch(
  () => `/api/measurement/realtime?sensor_id=${props.sensorId}`,
  { 
    watch: [() => props.sensorId],
    initialCache: false,
  }
)

// Auto-refresh every 5 seconds
setInterval(() => refresh(), 5000)

const average = computed(() => {
  if (!data.value || data.value.length === 0) return 0
  const sum = data.value.reduce((acc, m) => acc + m.value, 0)
  return sum / data.value.length
})

const min = computed(() => {
  if (!data.value || data.value.length === 0) return 0
  return Math.min(...data.value.map(m => m.value))
})

const max = computed(() => {
  if (!data.value || data.value.length === 0) return 0
  return Math.max(...data.value.map(m => m.value))
})

const formatTime = (time) => {
  if (!time) return 'N/A'
  const date = new Date(time)
  return date.toLocaleString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>
