<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { SearchCriteria } from '../types/flight'
import { useFlightSearchStore } from '../stores/flightSearchStore'

const flightSearchStore = useFlightSearchStore()
const tripType = ref<'one_way' | 'round_trip'>('round_trip')

const form = reactive<SearchCriteria>({
  origin: 'LHR',
  destination: 'JFK',
  departureDate: '2026-08-15',
  returnDate: '2026-08-18',
  passengerCount: 1,
  cabinClass: 'all',
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

  if (tripType.value === 'round_trip' && !form.returnDate) {
    errors.returnDate = 'Return date is required for round trips.'
  } else if (form.returnDate && form.departureDate && form.returnDate < form.departureDate) {
    errors.returnDate = 'Return date cannot be before departure date.'
  }

  if (!Number.isFinite(form.passengerCount) || form.passengerCount < 1) {
    errors.passengerCount = 'At least one passenger is required.'
  }


  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  await flightSearchStore.searchFlights({
    ...form,
    origin: normalizeAirportCode(form.origin),
    destination: normalizeAirportCode(form.destination),
    returnDate: tripType.value === 'round_trip' ? form.returnDate : '',
    passengerCount: Number(form.passengerCount),
  })
}

watch(tripType, (nextTripType) => {
  if (nextTripType === 'one_way') {
    form.returnDate = ''
    return
  }

  if (!form.returnDate) {
    form.returnDate = form.departureDate
  }
})

void handleSubmit
void tripType
</script>

<template src="./SearchForm.template.html"></template>
