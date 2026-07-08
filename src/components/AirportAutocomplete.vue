<script setup lang="ts">
import { ref, watch } from 'vue'
import { searchPlaceSuggestions } from '../services/duffel'
import type { PlaceSuggestion } from '../types/flight'

const props = defineProps<{
  modelValue: string
  label: string
  name: string
  placeholder?: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const query = ref(props.modelValue)
const suggestions = ref<PlaceSuggestion[]>([])
const isOpen = ref(false)
const isLoading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.modelValue,
  (value) => {
    query.value = value
  },
)

function handleInput() {
  emit('update:modelValue', query.value)
  isOpen.value = true

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  const currentQuery = query.value.trim()

  if (currentQuery.length < 2) {
    suggestions.value = []
    return
  }

  debounceTimer = setTimeout(async () => {
    isLoading.value = true

    try {
      suggestions.value = await searchPlaceSuggestions(currentQuery)
    } catch {
      suggestions.value = []
    } finally {
      isLoading.value = false
    }
  }, 300)
}

function selectSuggestion(suggestion: PlaceSuggestion) {
  query.value = suggestion.value
  emit('update:modelValue', suggestion.value)
  suggestions.value = []
  isOpen.value = false
}

function handleFocus() {
  if (suggestions.value.length > 0) {
    isOpen.value = true
  }
}

function handleBlur() {
  isOpen.value = false
}

void query
void suggestions
void isOpen
void isLoading
void handleInput
void selectSuggestion
void handleFocus
void handleBlur
</script>

<template src="./AirportAutocomplete.template.html"></template>
