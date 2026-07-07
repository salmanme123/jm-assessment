<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { SearchCriteria } from '../types/flight'
import { useFlightSearchStore } from '../stores/flightSearchStore'

const flightSearchStore = useFlightSearchStore()

const form = reactive<SearchCriteria>({
  origin: 'LHR',
  destination: 'JFK',
  departureDate: '2026-08-15',
  returnDate: '',
  passengerCount: 1,
  cabinClass: 'economy',
})

const errors = reactive<Partial<Record<keyof SearchCriteria, string>>>({})

const today = computed(() => new Date().toISOString().slice(0, 10))

function normalizeAirportCode(value: string) {
  return value.trim().toUpperCase()
}

function validateForm() {
  errors.origin = ''
  errors.destination = ''
  errors.departureDate = ''
  errors.returnDate = ''
  errors.passengerCount = ''
  errors.cabinClass = ''

  const origin = normalizeAirportCode(form.origin)
  const destination = normalizeAirportCode(form.destination)

  if (!origin) {
    errors.origin = 'Origin is required.'
  }

  if (!destination) {
    errors.destination = 'Destination is required.'
  }

  if (origin && destination && origin === destination) {
    errors.destination = 'Destination must be different from origin.'
  }

  if (!form.departureDate) {
    errors.departureDate = 'Departure date is required.'
  } else if (form.departureDate < today.value) {
    errors.departureDate = 'Departure date cannot be in the past.'
  }

  if (form.returnDate && form.departureDate && form.returnDate < form.departureDate) {
    errors.returnDate = 'Return date cannot be before departure date.'
  }

  if (!Number.isFinite(form.passengerCount) || form.passengerCount < 1) {
    errors.passengerCount = 'At least one passenger is required.'
  }

  if (!form.cabinClass) {
    errors.cabinClass = 'Cabin class is required.'
  }

  return !Object.values(errors).some(Boolean)
}

function handleSubmit() {
  if (!validateForm()) {
    return
  }

  flightSearchStore.setCriteria({
    ...form,
    origin: normalizeAirportCode(form.origin),
    destination: normalizeAirportCode(form.destination),
    passengerCount: Number(form.passengerCount),
  })

}

void handleSubmit
</script>

<template src="./SearchForm.template.html"></template>


