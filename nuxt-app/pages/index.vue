
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="max-w-7xl mx-auto px-6 py-10">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-4xl font-bold text-white mb-2">🔬 Sensor Dashboard</h1>
        <p class="text-slate-400">Real-time monitoring of industrial sensors</p>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p class="text-slate-300 mt-4">Loading sensors...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-200">
        <p class="font-semibold">Error loading sensors</p>
        <p class="text-sm text-red-300 mt-1">{{ error.message }}</p>
      </div>

      <!-- Sensors Grid -->
      <div v-else-if="sensors && sensors.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SensorCard v-for="s in sensors" :key="s.id" :sensor="s" />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <p class="text-slate-400 text-lg">No sensors found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: sensors, pending, error, refresh } = await useFetch('/api/sensor')

// Refresh data every 10 seconds
setInterval(() => refresh(), 10000)
</script>

<style scoped>
:deep(a) {
  text-decoration: none;
}
</style>
