<template>
  <NuxtLink :to="`/sensor/${sensor.id}`" class="block group no-underline">
    <div class="card p-6 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full">
      <!-- Header -->
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-white group-hover:text-blue-400 transition">{{ sensor.sensor_code }}</h3>
          <p class="text-sm text-slate-400 mt-1">{{ sensor.sensor_type }}</p>
        </div>
        <span :class="{
          'badge-success': sensor.status === 1,
          'badge-danger': sensor.status !== 1
        }">
          {{ sensor.status === 1 ? '● Online' : '● Offline' }}
        </span>
      </div>

      <!-- Current Value -->
      <div class="mb-6">
        <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Current Value</p>
        <div class="flex items-baseline gap-2">
          <p class="text-4xl font-bold text-white">
            {{ sensor.current_value ? sensor.current_value.toFixed(1) : '-' }}
          </p>
          <p class="text-lg text-slate-400">{{ sensor.unit }}</p>
        </div>
      </div>

      <!-- Location and Last Updated -->
      <div class="space-y-3 pt-4 border-t border-slate-700">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-slate-400">📍</span>
          <p class="text-slate-300">{{ sensor.location }}</p>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-slate-400">⏱</span>
          <p class="text-slate-400">{{ formatTime(sensor.last_updated) }}</p>
        </div>
      </div>

      <!-- View Details Arrow -->
      <div class="mt-4 text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
        View Details →
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
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

defineProps({
  sensor: {
    type: Object as () => Sensor,
    required: true
  }
})

const formatTime = (time: string | undefined): string => {
  if (!time) return 'No data'
  try {
    const date = new Date(time)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}
</script>
