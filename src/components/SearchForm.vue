<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { cabinClassOptions, type SearchCriteria, type SearchHistoryEntry } from '../types/flight'
import { useFlightSearchStore } from '../stores/flightSearchStore'
import AirportAutocomplete from './AirportAutocomplete.vue'

const flightSearchStore = useFlightSearchStore()
const persistedCriteria = flightSearchStore.criteria
const tripType = ref<'one_way' | 'round_trip'>(persistedCriteria?.returnDate ? 'round_trip' : 'one_way')

const form = reactive<SearchCriteria>({
  origin: persistedCriteria?.origin ?? 'LHR',
  destination: persistedCriteria?.destination ?? 'JFK',
  departureDate: persistedCriteria?.departureDate ?? '2026-08-15',
  returnDate: persistedCriteria?.returnDate ?? '2026-08-18',
  passengerCount: persistedCriteria?.passengerCount ?? 1,
  cabinClass: persistedCriteria?.cabinClass ?? 'economy',
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

watch(
  () => flightSearchStore.criteria,
  (criteria) => {
    if (!criteria) {
      return
    }

    form.origin = criteria.origin
    form.destination = criteria.destination
    form.departureDate = criteria.departureDate
    form.returnDate = criteria.returnDate
    form.passengerCount = criteria.passengerCount
    form.cabinClass = criteria.cabinClass
    tripType.value = criteria.returnDate ? 'round_trip' : 'one_way'
  },
)

function getHistoryLabel(entry: SearchHistoryEntry) {
  const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${entry.criteria.departureDate}T00:00:00`))

  return `${entry.criteria.origin} -> ${entry.criteria.destination}, ${dateLabel}`
}

function applyHistoryEntry(entry: SearchHistoryEntry) {
  flightSearchStore.searchFlights(entry.criteria)
}

void handleSubmit
void tripType
void cabinClassOptions
void AirportAutocomplete
void getHistoryLabel
void applyHistoryEntry
</script>

<template src="./SearchForm.template.html"></template>
