<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import SearchForm from './components/SearchForm.vue'
import { useFlightSearchStore } from './stores/flightSearchStore'
import { cabinClassOptions, type CabinClass, type FlightOffer } from './types/flight'

const flightSearchStore = useFlightSearchStore()
const pageSize = 10
const currentPage = ref(1)
const selectedCabinClass = ref<CabinClass | 'all'>('all')
const selectedAirline = ref('all')
const selectedOffer = ref<FlightOffer | null>(null)
const selectedStopFilters = ref<string[]>(['nonstop', 'one_stop', 'two_plus'])
const departureTimeFrom = ref('')
const departureTimeTo = ref('')
const arrivalTimeFrom = ref('')
const arrivalTimeTo = ref('')
const priceMin = ref('')
const priceMax = ref('')
const sortOption = ref<'price_asc' | 'price_desc' | 'duration_asc' | 'duration_desc' | 'departure_asc' | 'departure_desc'>('price_asc')

const availableAirlines = computed(() => {
  const airlines = flightSearchStore.offers
    .map((offer) => offer.airline)
    .filter((airline): airline is string => typeof airline === 'string' && airline.trim().length > 0)
    .map((airline) => airline.trim())

  return [...new Set(airlines)].sort((left, right) => left.localeCompare(right))
})

const filteredOffers = computed(() => {
  return flightSearchStore.offers.filter((offer) => {
    const matchesCabin = selectedCabinClass.value === 'all' || offer.cabinClass === selectedCabinClass.value
    const matchesAirline = selectedAirline.value === 'all' || offer.airline.trim() === selectedAirline.value
    const matchesStops = selectedStopFilters.value.length === 0 || offer.slices.every((slice) => selectedStopFilters.value.includes(getStopFilterValue(slice.stops)))
    const matchesDeparture = matchesDepartureTimes(offer)
    const matchesPrice = matchesPriceRange(offer)

    return matchesCabin && matchesAirline && matchesStops && matchesDeparture && matchesPrice
  })
})
const sortedOffers = computed(() => {
  return [...filteredOffers.value].sort((left, right) => {
    if (sortOption.value === 'duration_asc' || sortOption.value === 'duration_desc') {
      const leftDuration = getOfferDurationMinutes(left)
      const rightDuration = getOfferDurationMinutes(right)

      return sortOption.value === 'duration_asc' ? leftDuration - rightDuration : rightDuration - leftDuration
    }

    if (sortOption.value === 'departure_asc' || sortOption.value === 'departure_desc') {
      const leftDeparture = getOfferDepartureTimestamp(left)
      const rightDeparture = getOfferDepartureTimestamp(right)

      return sortOption.value === 'departure_asc' ? leftDeparture - rightDeparture : rightDeparture - leftDeparture
    }

    const leftPrice = getOfferPriceAmount(left)
    const rightPrice = getOfferPriceAmount(right)

    return sortOption.value === 'price_asc' ? leftPrice - rightPrice : rightPrice - leftPrice
  })
})
const totalOffers = computed(() => sortedOffers.value.length)
const totalPages = computed(() => Math.max(Math.ceil(totalOffers.value / pageSize), 1))
const firstVisibleOffer = computed(() => (currentPage.value - 1) * pageSize + 1)
const lastVisibleOffer = computed(() => Math.min(currentPage.value * pageSize, totalOffers.value))
const paginatedOffers = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return sortedOffers.value.slice(start, start + pageSize)
})

function goToPreviousPage() {
  currentPage.value = Math.max(currentPage.value - 1, 1)
}

function goToNextPage() {
  currentPage.value = Math.min(currentPage.value + 1, totalPages.value)
}


function hasAvailableValue(value: string | null | undefined) {
  return Boolean(value && !value.toLowerCase().includes('unavailable'))
}
function resetFilters() {
  selectedCabinClass.value = 'all'
  selectedAirline.value = 'all'
  selectedStopFilters.value = ['nonstop', 'one_stop', 'two_plus']
  departureTimeFrom.value = ''
  departureTimeTo.value = ''
  arrivalTimeFrom.value = ''
  arrivalTimeTo.value = ''
  priceMin.value = ''
  priceMax.value = ''
  sortOption.value = 'price_asc'
}

function getOfferPriceAmount(offer: FlightOffer) {
  const amount = Number(offer.price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(amount) ? amount : Number.POSITIVE_INFINITY
}
function getOfferDurationMinutes(offer: FlightOffer) {
  const totalMinutes = offer.slices.reduce((total, slice) => {
    const match = slice.duration.match(/(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?/)
    const days = Number(match?.[1] || 0)
    const hours = Number(match?.[2] || 0)
    const minutes = Number(match?.[3] || 0)

    return total + days * 1440 + hours * 60 + minutes
  }, 0)

  return totalMinutes > 0 ? totalMinutes : Number.POSITIVE_INFINITY
}
function getOfferDepartureTimestamp(offer: FlightOffer) {
  const timestamp = new Date(offer.departureDepartingAt).getTime()

  return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY
}
function matchesPriceRange(offer: FlightOffer) {
  const amount = getOfferPriceAmount(offer)
  const min = Number(priceMin.value)
  const max = Number(priceMax.value)

  if (priceMin.value && amount < min) {
    return false
  }

  if (priceMax.value && amount > max) {
    return false
  }

  return true
}
function matchesDepartureTimes(offer: FlightOffer) {
  const hasDepartureFilter = Boolean(departureTimeFrom.value || departureTimeTo.value)
  const hasArrivalFilter = Boolean(arrivalTimeFrom.value || arrivalTimeTo.value)
  const departureTime = offer.departureDepartingAt?.slice(11, 16) || ''
  const arrivalTime = offer.departureArrivingAt?.slice(11, 16) || ''

  if ((hasDepartureFilter && !departureTime) || (hasArrivalFilter && !arrivalTime)) {
    return false
  }

  const matchesDepartureFrom = !departureTimeFrom.value || departureTime >= departureTimeFrom.value
  const matchesDepartureTo = !departureTimeTo.value || departureTime <= departureTimeTo.value
  const matchesArrivalFrom = !arrivalTimeFrom.value || arrivalTime >= arrivalTimeFrom.value
  const matchesArrivalTo = !arrivalTimeTo.value || arrivalTime <= arrivalTimeTo.value

  return matchesDepartureFrom && matchesDepartureTo && matchesArrivalFrom && matchesArrivalTo
}
function getStopFilterValue(stops: string) {
  if (stops === 'Nonstop') {
    return 'nonstop'
  }

  if (stops === '1 stop') {
    return 'one_stop'
  }

  return 'two_plus'
}
function openOfferDetails(offer: FlightOffer) {
  selectedOffer.value = offer
}

function closeOfferDetails() {
  selectedOffer.value = null
}

function getCabinLabel(cabinClass: CabinClass) {
  return cabinClassOptions.find((option) => option.value === cabinClass)?.label || cabinClass
}

function addDays(dateValue: string, deltaDays: number) {
  const date = new Date(`${dateValue}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + deltaDays)

  return date.toISOString().slice(0, 10)
}

const today = computed(() => new Date().toISOString().slice(0, 10))
const departureDateLabel = computed(() => {
  const criteria = flightSearchStore.criteria

  if (!criteria) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${criteria.departureDate}T00:00:00`))
})
const canShiftDateEarlier = computed(() => {
  const criteria = flightSearchStore.criteria

  return Boolean(criteria) && addDays(criteria!.departureDate, -1) >= today.value
})

function shiftDepartureDate(deltaDays: number) {
  const criteria = flightSearchStore.criteria

  if (!criteria || flightSearchStore.isLoading) {
    return
  }

  const nextDepartureDate = addDays(criteria.departureDate, deltaDays)

  if (nextDepartureDate < today.value) {
    return
  }

  flightSearchStore.searchFlights({
    ...criteria,
    departureDate: nextDepartureDate,
    returnDate: criteria.returnDate ? addDays(criteria.returnDate, deltaDays) : '',
  })
}

watch(
  () => flightSearchStore.lastSubmittedAt,
  () => {
    currentPage.value = 1
  },
)

watch([selectedCabinClass, selectedAirline, selectedStopFilters, departureTimeFrom, departureTimeTo, arrivalTimeFrom, arrivalTimeTo, priceMin, priceMax, sortOption], () => {
  currentPage.value = 1
})

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages
  }
})

watch(availableAirlines, (airlines) => {
  if (selectedAirline.value !== 'all' && !airlines.includes(selectedAirline.value)) {
    selectedAirline.value = 'all'
  }
})

void AppHeader
void SearchForm
void flightSearchStore
void cabinClassOptions
void selectedCabinClass
void selectedAirline
void selectedOffer
void selectedStopFilters
void departureTimeFrom
void departureTimeTo
void arrivalTimeFrom
void arrivalTimeTo
void priceMin
void priceMax
void sortOption
void availableAirlines
void filteredOffers
void sortedOffers
void paginatedOffers
void totalPages
void currentPage
void firstVisibleOffer
void lastVisibleOffer
void totalOffers
void goToPreviousPage
void goToNextPage
void resetFilters
void hasAvailableValue
void getOfferPriceAmount
void getOfferDurationMinutes
void getOfferDepartureTimestamp
void matchesPriceRange
void matchesDepartureTimes
void getStopFilterValue
void openOfferDetails
void closeOfferDetails
void getCabinLabel
void today
void departureDateLabel
void canShiftDateEarlier
void shiftDepartureDate
</script>

<template src="./App.template.html"></template>







