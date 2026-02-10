<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" @click="close"></div>
    </Transition>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
          <!-- Header -->
          <div class="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 border-b border-slate-700 flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold text-white">⚙️ Sensor Settings</h2>
              <p class="text-slate-400 text-sm mt-1">Update calibration and specifications</p>
            </div>
            <button @click="close" class="text-slate-400 hover:text-white transition text-2xl">
              ✕
            </button>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="handleSubmit" class="p-8">
            <div class="space-y-8">
              <!-- Section: Equipment Info -->
              <div>
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span class="text-blue-400">📋</span> Equipment Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput 
                    label="Manufacturer" 
                    v-model="formData.manufacturer" 
                    placeholder="e.g., Siemens"
                  />
                  <FormInput 
                    label="Model" 
                    v-model="formData.model" 
                    placeholder="e.g., QAC31"
                  />
                  <FormInput 
                    label="Serial Number" 
                    v-model="formData.serial_number" 
                    placeholder="e.g., SN-TEMP-00123"
                    class="md:col-span-2"
                  />
                </div>
              </div>

              <!-- Section: Specifications -->
              <div>
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span class="text-green-400">📊</span> Specifications
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput 
                    label="Min Value" 
                    v-model.number="formData.min_value" 
                    type="number"
                    placeholder="0"
                  />
                  <FormInput 
                    label="Max Value" 
                    v-model.number="formData.max_value" 
                    type="number"
                    placeholder="100"
                  />
                  <FormInput 
                    label="Accuracy" 
                    v-model.number="formData.accuracy" 
                    type="number"
                    step="0.01"
                    placeholder="0.5"
                  />
                  <FormInput 
                    label="Resolution" 
                    v-model.number="formData.resolution" 
                    type="number"
                    step="0.01"
                    placeholder="0.1"
                  />
                </div>
              </div>

              <!-- Section: Calibration -->
              <div>
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span class="text-yellow-400">🔧</span> Calibration
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput 
                    label="Installation Date" 
                    v-model="formData.installation_date" 
                    type="date"
                  />
                  <FormInput 
                    label="Last Calibration" 
                    v-model="formData.calibration_date" 
                    type="date"
                  />
                  <FormInput 
                    label="Calibration Due" 
                    v-model="formData.calibration_due" 
                    type="date"
                    class="md:col-span-2"
                  />
                </div>
                <p v-if="calibrationStatus" :class="{
                  'text-red-400': calibrationOverdue,
                  'text-yellow-400': !calibrationOverdue && calibrationDueSoon,
                  'text-green-400': !calibrationOverdue && !calibrationDueSoon
                }" class="mt-3 text-sm">
                  {{ calibrationStatus }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 pt-6 border-t border-slate-700 flex gap-3 justify-end">
              <button 
                type="button"
                @click="close"
                class="btn-secondary px-6 py-2 text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="loading"
                class="btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span v-if="loading" class="animate-spin">⏳</span>
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  sensorId: {
    type: [Number, String],
    required: true
  },
  initialData: Object
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)

const formData = ref({
  manufacturer: '',
  model: '',
  serial_number: '',
  min_value: 0,
  max_value: 100,
  accuracy: 0.5,
  resolution: 0.1,
  installation_date: '',
  calibration_date: '',
  calibration_due: ''
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = {
      manufacturer: newData.manufacturer || '',
      model: newData.model || '',
      serial_number: newData.serial_number || '',
      min_value: newData.min_value || 0,
      max_value: newData.max_value || 100,
      accuracy: newData.accuracy || 0.5,
      resolution: newData.resolution || 0.1,
      installation_date: formatDateForInput(newData.installation_date),
      calibration_date: formatDateForInput(newData.calibration_date),
      calibration_due: formatDateForInput(newData.calibration_due)
    }
  }
}, { immediate: true, deep: true })

const calibrationOverdue = computed(() => {
  if (!formData.value.calibration_due) return false
  return new Date(formData.value.calibration_due) <= new Date()
})

const calibrationDueSoon = computed(() => {
  if (!formData.value.calibration_due) return false
  const dueDate = new Date(formData.value.calibration_due)
  const today = new Date()
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntil <= 30 && daysUntil > 0
})

const calibrationStatus = computed(() => {
  if (calibrationOverdue.value) {
    return '⚠️ Calibration is overdue'
  }
  if (calibrationDueSoon.value) {
    const daysUntil = Math.ceil((new Date(formData.value.calibration_due).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return `⏰ Calibration due in ${daysUntil} days`
  }
  return '✓ Calibration is up to date'
})

const formatDateForInput = (date: string | undefined): string => {
  if (!date) return ''
  try {
    return new Date(date).toISOString().split('T')[0]
  } catch {
    return ''
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/sensor/${props.sensorId}/update-spec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })

    if (!response.ok) {
      throw new Error('Failed to update sensor spec')
    }

    await response.json()
    emit('saved')
    close()
  } catch (error) {
    console.error('Error saving sensor spec:', error)
    alert('Failed to save changes')
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
