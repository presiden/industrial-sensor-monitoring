<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-12">
    <!-- Header Section -->
    <div class="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-xs uppercase tracking-widest text-slate-400 font-semibold">Real-Time Monitoring</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white">Sensor Dashboard</h1>
        <p class="text-slate-400 mt-2">Monitor industrial sensors in real-time with live analytics</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-12">
      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div class="card p-6 bg-gradient-to-br from-blue-900/30 to-slate-800 border-blue-700/50">
          <p class="text-slate-400 text-sm uppercase tracking-wide mb-2">Total Sensors</p>
          <p class="text-3xl font-bold text-blue-400">{{ sensors?.length ?? 0 }}</p>
        </div>
        <div class="card p-6 bg-gradient-to-br from-green-900/30 to-slate-800 border-green-700/50">
          <p class="text-slate-400 text-sm uppercase tracking-wide mb-2">Online</p>
          <p class="text-3xl font-bold text-green-400">{{ onlineSensors }}</p>
        </div>
        <div class="card p-6 bg-gradient-to-br from-red-900/30 to-slate-800 border-red-700/50">
          <p class="text-slate-400 text-sm uppercase tracking-wide mb-2">Offline</p>
          <p class="text-3xl font-bold text-red-400">{{ offlineSensors }}</p>
        </div>
        <div class="card p-6 bg-gradient-to-br from-purple-900/30 to-slate-800 border-purple-700/50">
          <p class="text-slate-400 text-sm uppercase tracking-wide mb-2">Last Update</p>
          <p class="text-lg font-bold text-purple-400">{{ lastUpdate }}</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p class="text-slate-300 text-lg">Loading sensors...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card p-8 border-red-700 bg-red-900/20 text-center">
        <p class="text-red-400 text-lg font-semibold mb-2">❌ Error loading sensors</p>
        <p class="text-red-300 text-sm">{{ error.message }}</p>
        <button @click="refresh" class="btn-primary mt-4 text-sm">
          Retry
        </button>
      </div>

      <!-- Sensors Grid -->
      <div v-else-if="sensors && sensors.length > 0" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-white">Connected Sensors</h2>
          <button @click="refresh" class="btn-secondary text-sm px-3 py-2">
            🔄 Refresh
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SensorCard v-for="sensor in sensors" :key="sensor.id" :sensor="sensor" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card p-12 text-center border-dashed border-slate-700">
        <p class="text-slate-400 text-xl mb-2">📭 No sensors found</p>
        <p class="text-slate-500 text-sm">Sensors will appear here once they are registered in the system</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

interface Sensor {
  id: number | string
  sensor_code: string
  sensor_type: string
  unit: string
  location: string
  status: number
  current_value?: number
  last_updated?: string
}

const { data: sensors, pending, error, refresh } = await useFetch<Sensor[]>('/api/sensor')

const onlineSensors = computed(() => {
  return sensors.value?.filter(s => s.status === 1).length ?? 0
})

const offlineSensors = computed(() => {
  return sensors.value?.filter(s => s.status !== 1).length ?? 0
})

const lastUpdate = computed(() => {
  if (!sensors.value || sensors.value.length === 0) return 'N/A'
  
  const latestTime = sensors.value
    .filter(s => s.last_updated)
    .map(s => new Date(s.last_updated!).getTime())
    .reduce((max, time) => Math.max(max, time), 0)

  if (!latestTime) return 'N/A'

  const diffMs = Date.now() - latestTime
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)

  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  return `${Math.floor(diffMins / 60)}h ago`
})

// Auto-refresh every 10 seconds
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshInterval = setInterval(() => {
    refresh()
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
