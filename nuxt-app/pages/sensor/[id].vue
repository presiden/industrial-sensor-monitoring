<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-12">
    <!-- Header -->
    <div class="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-6 py-6">
        <NuxtLink to="/" class="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition">
          <span class="mr-2">←</span> Back to Dashboard
        </NuxtLink>
        <h1 class="text-4xl font-bold text-white">{{ sensor?.sensor_code || 'Loading...' }}</h1>
        <p class="text-slate-400 mt-1">{{ sensor?.sensor_type }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-6 py-12">
      <!-- Loading State -->
      <div v-if="pending" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p class="text-slate-300 text-lg">Loading sensor details...</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-8">
        <!-- Sensor Status and Current Value -->
        <div class="card p-8 border-blue-700/50 bg-gradient-to-br from-blue-900/20 to-slate-800">
          <div class="flex justify-between items-start mb-6">
            <div>
              <p class="text-slate-400 text-sm uppercase tracking-wide mb-2">Current Status</p>
              <div class="flex items-center gap-3">
                <div :class="{
                  'w-4 h-4 rounded-full bg-green-500 animate-pulse': sensor?.status === 1,
                  'w-4 h-4 rounded-full bg-red-500': sensor?.status !== 1
                }"></div>
                <span :class="{
                  'badge-success': sensor?.status === 1,
                  'badge-danger': sensor?.status !== 1
                }">
                  {{ sensor?.status === 1 ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Current Value</p>
              <div class="flex items-baseline gap-2">
                <p class="text-5xl font-bold text-white">
                  {{ sensor?.measurements?.length > 0 ? sensor.measurements[sensor.measurements.length - 1]?.value?.toFixed(2) : (sensor?.current_value ? parseFloat(String(sensor.current_value)).toFixed(2) : '-') }}
                </p>
                <p class="text-xl text-slate-400">{{ sensor?.unit }}</p>
              </div>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Location</p>
              <p class="text-lg text-white font-semibold">{{ sensor?.location }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Data Quality</p>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full w-full bg-gradient-to-r from-green-500 to-blue-500"></div>
                </div>
                <span class="text-white font-semibold">100%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Chart -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-white mb-6">Real-Time Data Analytics</h2>
          <RealtimeChart :sensorId="sensor?.id" :unit="sensor?.unit" />
        </div>

        <!-- Technical Specifications -->
        <div v-if="sensor?.spec" class="card p-8">
          <h2 class="text-2xl font-bold text-white mb-6">Technical Specifications</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Manufacturer & Model -->
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Manufacturer</p>
              <p class="text-lg text-white font-semibold">{{ sensor.spec.manufacturer }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Model</p>
              <p class="text-lg text-white font-semibold">{{ sensor.spec.model }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Serial Number</p>
              <p class="text-lg text-white font-mono">{{ sensor.spec.serial_number }}</p>
            </div>

            <!-- Measurement Range -->
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Min Value</p>
              <p class="text-lg text-blue-400 font-semibold">{{ sensor.spec.min_value }} {{ sensor?.unit }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Max Value</p>
              <p class="text-lg text-red-400 font-semibold">{{ sensor.spec.max_value }} {{ sensor?.unit }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Operating Range</p>
              <p class="text-lg text-white font-semibold">{{ sensor.spec.min_value }} - {{ sensor.spec.max_value }}</p>
            </div>

            <!-- Accuracy & Resolution -->
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Accuracy</p>
              <p class="text-lg text-green-400 font-semibold">±{{ sensor.spec.accuracy }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Resolution</p>
              <p class="text-lg text-white font-semibold">{{ sensor.spec.resolution }}</p>
            </div>

            <!-- Installation -->
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Installation Date</p>
              <p class="text-lg text-white font-semibold">{{ formatDate(sensor.spec.installation_date) }}</p>
            </div>
          </div>
        </div>

        <!-- Calibration Information -->
        <div v-if="sensor?.spec" class="card p-8 border-yellow-700/50 bg-gradient-to-br from-yellow-900/20 to-slate-800">
          <h2 class="text-2xl font-bold text-white mb-6">Calibration Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Last Calibration</p>
              <p class="text-lg text-white font-semibold">{{ formatDate(sensor.spec.calibration_date) }}</p>
            </div>
            <div :class="{
              'border-red-700/50 bg-red-900/20': isCalibrationDue(sensor.spec.calibration_due),
              'border-green-700/50 bg-green-900/20': !isCalibrationDue(sensor.spec.calibration_due)
            }" class="card p-6">
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Calibration Due</p>
              <p :class="{
                'text-red-400': isCalibrationDue(sensor.spec.calibration_due),
                'text-green-400': !isCalibrationDue(sensor.spec.calibration_due)
              }" class="text-lg font-semibold">
                {{ formatDate(sensor.spec.calibration_due) }}
              </p>
              <p v-if="isCalibrationDue(sensor.spec.calibration_due)" class="text-red-300 text-sm mt-2">
                ⚠️ Calibration overdue
              </p>
            </div>
            <div>
              <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Days Until Due</p>
              <p :class="{
                'text-red-400': daysUntilCalibration <= 30,
                'text-yellow-400': daysUntilCalibration <= 60 && daysUntilCalibration > 30,
                'text-green-400': daysUntilCalibration > 60
              }" class="text-lg font-semibold">
                {{ daysUntilCalibration <= 0 ? 'Overdue' : daysUntilCalibration + ' days' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()

interface SensorData {
  id: number | string
  sensor_code: string
  sensor_type: string
  unit: string
  location: string
  status: number
  current_value?: number | string
  measurements?: Array<{ time: string; value: number; quality: number; status: number }>
  stats?: {
    min: number
    max: number
    avg: number
    count: number
  }
  spec?: {
    manufacturer: string
    model: string
    serial_number: string
    min_value: number
    max_value: number
    accuracy: number
    resolution: number
    installation_date: string
    calibration_date: string
    calibration_due: string
  }
}

const { data: sensor, pending, refresh } = await useFetch<SensorData>(
  () => `/api/sensor/${route.params.id}`,
  {
    watch: [() => route.params.id]
  }
)

// Auto-refresh every 30 seconds
onMounted(() => {
  const interval = setInterval(() => refresh(), 30000)
  onUnmounted(() => clearInterval(interval))
})

const daysUntilCalibration = computed(() => {
  if (!sensor.value?.spec?.calibration_due) return 0
  const dueDate = new Date(sensor.value.spec.calibration_due)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const formatDate = (date: string | undefined | null): string => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}

const formatTime = (time: string | undefined): string => {
  if (!time) return 'N/A'
  try {
    const date = new Date(time)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}

const isCalibrationDue = (date: string | undefined | null): boolean => {
  if (!date) return false
  try {
    const dueDate = new Date(date)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return daysUntil <= 30 // Due if within 30 days
  } catch {
    return false
  }
}
</script>
