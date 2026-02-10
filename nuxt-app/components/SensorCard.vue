
<template>
  <NuxtLink :to="`/sensor/${sensor.id}`" class="no-underline">
    <div class="border border-gray-300 rounded-lg p-5 hover:shadow-lg transition-shadow bg-white">
      <div class="flex justify-between items-start mb-3">
        <div>
          <h3 class="text-lg font-bold text-gray-800">{{ sensor.sensor_code }}</h3>
          <p class="text-sm text-gray-500">{{ sensor.sensor_type }}</p>
        </div>
        <span :class="{
          'bg-green-100 text-green-800': sensor.status === 1,
          'bg-red-100 text-red-800': sensor.status !== 1,
        }" class="px-3 py-1 rounded-full text-xs font-semibold">
          {{ sensor.status === 1 ? 'Active' : 'Inactive' }}
        </span>
      </div>
      
      <div class="mb-4">
        <p class="text-2xl font-bold text-gray-900">
          {{ sensor.current_value ?? '-' }}<span class="text-lg ml-1">{{ sensor.unit }}</span>
        </p>
        <p class="text-xs text-gray-400 mt-1">
          {{ sensor.last_updated ? formatTime(sensor.last_updated) : 'No data' }}
        </p>
      </div>
      
      <p class="text-sm text-gray-600">📍 {{ sensor.location }}</p>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({ sensor: Object })

const formatTime = (time) => {
  if (!time) return 'N/A'
  const date = new Date(time)
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
a {
  text-decoration: none;
}
</style>
