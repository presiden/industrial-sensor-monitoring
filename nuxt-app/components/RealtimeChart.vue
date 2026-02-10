<template>
  <div class="space-y-4">
    <!-- Filter Controls -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="range in timeRanges"
        :key="range.value"
        @click="selectedRange = range.value"
        :class="{
          'btn-primary': selectedRange === range.value,
          'btn-secondary': selectedRange !== range.value
        }"
        class="text-sm px-3 py-2"
      >
        {{ range.label }}
      </button>
    </div>

    <!-- Chart Container -->
    <div class="relative bg-slate-700/30 rounded-lg p-6 border border-slate-700">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-lg backdrop-blur-sm">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p class="text-slate-300 text-sm">Loading chart...</p>
        </div>
      </div>
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="stat-box">
        <p class="text-slate-400 text-xs uppercase mb-1">Current</p>
        <p class="text-2xl font-bold text-white">
          {{ stats.current?.toFixed(2) ?? '-' }}
        </p>
      </div>
      <div class="stat-box">
        <p class="text-slate-400 text-xs uppercase mb-1">Min</p>
        <p class="text-2xl font-bold text-blue-400">
          {{ stats.min?.toFixed(2) ?? '-' }}
        </p>
      </div>
      <div class="stat-box">
        <p class="text-slate-400 text-xs uppercase mb-1">Max</p>
        <p class="text-2xl font-bold text-red-400">
          {{ stats.max?.toFixed(2) ?? '-' }}
        </p>
      </div>
      <div class="stat-box">
        <p class="text-slate-400 text-xs uppercase mb-1">Average</p>
        <p class="text-2xl font-bold text-green-400">
          {{ stats.avg?.toFixed(2) ?? '-' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  sensorId: {
    type: [Number, String],
    required: true
  },
  unit: {
    type: String,
    default: ''
  }
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chart = ref<Chart | null>(null)
const loading = ref(true)
const selectedRange = ref('1h')
const measurements = ref<any[]>([])

const timeRanges = [
  { label: '1 Hour', value: '1h' },
  { label: '6 Hours', value: '6h' },
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' }
]

const stats = computed(() => {
  if (!measurements.value || measurements.value.length === 0) {
    return { current: null, min: null, max: null, avg: null }
  }

  const values = measurements.value.map(m => m.value)
  const sorted = [...values].sort((a, b) => a - b)

  return {
    current: values[values.length - 1],
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: values.reduce((a, b) => a + b, 0) / values.length
  }
})

const fetchAndUpdateChart = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/sensor/${props.sensorId}/measurements?range=${selectedRange.value}`)
    if (!response.ok) throw new Error('Failed to fetch measurements')

    const data = await response.json()
    measurements.value = Array.isArray(data) ? data : data.measurements || []

    if (!measurements.value || measurements.value.length === 0) {
      return
    }

    // Sort by time (ascending)
    measurements.value.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())

    // Format data for chart
    const labels = measurements.value.map((m: any) => {
      const date = new Date(m.time)
      return date.toLocaleString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        ...(selectedRange.value === '7d' && { month: 'short', day: 'numeric' })
      })
    })

    const values = measurements.value.map((m: any) => m.value)

    const chartData = {
      labels,
      datasets: [
        {
          label: `Value (${props.unit})`,
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: selectedRange.value === '1h' ? 3 : selectedRange.value === '6h' ? 2 : 0,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#1e293b',
          pointBorderWidth: 2
        }
      ]
    }

    // Destroy previous chart
    if (chart.value) {
      chart.value.destroy()
    }

    // Create new chart
    if (chartCanvas.value) {
      chart.value = new Chart(chartCanvas.value, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#cbd5e1',
                font: { size: 12 },
                padding: 15,
                usePointStyle: true
              }
            }
          },
          scales: {
            x: {
              grid: { color: '#334155', drawBorder: false },
              ticks: { color: '#94a3b8', font: { size: 11 } }
            },
            y: {
              grid: { color: '#334155', drawBorder: false },
              ticks: { color: '#94a3b8', font: { size: 11 } }
            }
          }
        }
      })
    }
  } catch (error) {
    console.error('Error fetching chart data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAndUpdateChart()
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(fetchAndUpdateChart, 30000)
  
  onUnmounted(() => clearInterval(interval))
})

watch(selectedRange, () => {
  fetchAndUpdateChart()
})
</script>
