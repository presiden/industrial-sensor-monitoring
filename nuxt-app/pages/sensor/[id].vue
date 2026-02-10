
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div class="max-w-4xl mx-auto px-6 py-10">
      <!-- Back Button -->
      <NuxtLink to="/" class="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition">
        <span class="mr-2">←</span> Back to Dashboard
      </NuxtLink>

      <!-- Loading State -->
      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p class="text-slate-300 mt-4">Loading sensor details...</p>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6">
        <!-- Sensor Header -->
        <div class="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-4xl font-bold text-white mb-2">{{ sensor?.sensor_code }}</h1>
              <p class="text-slate-400">{{ sensor?.sensor_type }}</p>
            </div>
            <span :class="{
              'bg-green-900/30 text-green-400 border border-green-700': sensor?.status === 1,
              'bg-red-900/30 text-red-400 border border-red-700': sensor?.status !== 1,
            }" class="px-4 py-2 rounded-lg text-sm font-semibold">
              {{ sensor?.status === 1 ? '● Online' : '● Offline' }}
            </span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-slate-700/50 rounded p-4">
              <p class="text-slate-400 text-xs uppercase mb-2">Current Value</p>
              <p class="text-2xl font-bold text-white">
                {{ measurements?.[0]?.value?.toFixed(2) ?? '-' }}
                <span class="text-lg text-slate-400">{{ sensor?.unit }}</span>
              </p>
            </div>
            <div class="bg-slate-700/50 rounded p-4">
              <p class="text-slate-400 text-xs uppercase mb-2">Location</p>
              <p class="text-lg font-semibold text-white">{{ sensor?.location }}</p>
            </div>
            <div class="bg-slate-700/50 rounded p-4">
              <p class="text-slate-400 text-xs uppercase mb-2">Last Updated</p>
              <p class="text-sm text-white">{{ formatTime(measurements?.[0]?.time) }}</p>
            </div>
            <div class="bg-slate-700/50 rounded p-4">
              <p class="text-slate-400 text-xs uppercase mb-2">Data Points (1h)</p>
              <p class="text-2xl font-bold text-white">{{ measurements?.length ?? 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Sensor Specification -->
        <div v-if="spec" class="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 class="text-2xl font-bold text-white mb-6">Technical Specifications</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-slate-400 text-sm uppercase mb-2">Manufacturer</p>
              <p class="text-white font-semibold">{{ spec.manufacturer }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm uppercase mb-2">Model</p>
              <p class="text-white font-semibold">{{ spec.model }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm uppercase mb-2">Serial Number</p>
              <p class="text-white font-semibold">{{ spec.serial_number }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm uppercase mb-2">Range</p>
              <p class="text-white font-semibold">{{ spec.min_value }} - {{ spec.max_value }} {{ sensor?.unit }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm uppercase mb-2">Accuracy</p>
              <p class="text-white font-semibold">±{{ spec.accuracy }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm uppercase mb-2">Resolution</p>
              <p class="text-white font-semibold">{{ spec.resolution }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm uppercase mb-2">Installation Date</p>
              <p class="text-white font-semibold">{{ formatDate(spec.installation_date) }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm uppercase mb-2">Calibration Due</p>
              <p :class="isCalibrationDue(spec.calibration_due) ? 'text-red-400' : 'text-white'" class="font-semibold">
                {{ formatDate(spec.calibration_due) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Real-time Chart -->
        <div class="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 class="text-2xl font-bold text-white mb-6">Real-time Data (Last 1 Hour)</h2>
          <RealtimeChart :sensorId="sensor?.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: sensor, pending } = await useFetch(`/api/sensor/${route.params.id}`)
const { data: spec } = await useFetch(`/api/sensor/${route.params.id}/spec`)
const { data: measurements } = await useFetch(`/api/measurement/realtime?sensor_id=${route.params.id}`)

const formatTime = (time) => {
  if (!time) return 'N/A'
  const date = new Date(time)
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const isCalibrationDue = (date) => {
  if (!date) return false
  const dueDate = new Date(date)
  const today = new Date()
  return dueDate <= today
}
</script>
